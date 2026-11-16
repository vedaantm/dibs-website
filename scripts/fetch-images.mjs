// Fetches product photos for every catalog item.
//
//   Unsplash (default):  put UNSPLASH_ACCESS_KEY=... in .env.local, then `npm run images`
//                        (demo keys allow 50 requests/hour, so a full run can take a few hours)
//   Pixabay:             put PIXABAY_API_KEY=... in .env.local (free: sign up, key is on pixabay.com/api/docs),
//                        then `npm run images -- --source=pixabay` (100 requests/minute: one run does it)
//
// - Searches each item's imageQuery for portrait photos and saves the top 2 at 1200px wide
//   into public/items/<slug>/1.jpg and 2.jpg. If a query finds too few, it retries simpler
//   ones ("snowboard studio product" -> "snowboard").
// - Skips any item folder that already has images, so your own photos always win.
// - Never reuses a photo another item already has.
// - Writes public/items/credits.json (photographer, link, license) for the footer's Photo credits.
//   Unsplash downloads are registered with their download endpoint, as their API guidelines require.
// - Never scrapes retailer or brand websites.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const APP = "dibs_demo";
// PowerShell drops the `--` in `npm run images -- --source=x`, so npm keeps the flag as its own
// config and exposes it as npm_config_source. Read both.
const source = (process.argv.find((a) => a.startsWith("--source="))?.split("=")[1] ?? process.env.npm_config_source ?? "unsplash").toLowerCase();

function readKey(name) {
  if (process.env[name]) return process.env[name];
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return undefined;
  const line = readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(`${name}=`));
  return line?.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
}

/** Pull slug + imageQuery pairs out of src/data/items.ts without a TS toolchain. */
function readItems() {
  const src = readFileSync(join(root, "src", "data", "items.ts"), "utf8");
  const items = [];
  const re = /slug:\s*"([^"]+)"[\s\S]*?query:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) items.push({ slug: m[1], query: m[2] });
  return items;
}

const targets = [
  ...readItems().map((i) => ({ dir: join(root, "public", "items", i.slug), key: i.slug, query: i.query, count: 2, names: ["1.jpg", "2.jpg"] })),
  { dir: join(root, "public", "hero"), key: "hero", query: "stack of textbooks on a library desk", count: 1, names: ["textbooks.jpg"], orientation: "landscape" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
class RateLimited extends Error {}

// ---------- providers: each returns normalized photos ----------
// { page, image, width, height, name, profile, license?, licenseUrl?, source, ping? }

function unsplashProvider(key) {
  const headers = { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" };
  return {
    label: "Unsplash",
    delay: 300,
    rateHint: "demo keys allow 50 requests/hour. Run `npm run images` again later, or `npm run images -- --source=pixabay` with a Pixabay key",
    async search(query, t) {
      const url = new URL("https://api.unsplash.com/search/photos");
      url.searchParams.set("query", query);
      url.searchParams.set("orientation", t.orientation ?? "portrait");
      url.searchParams.set("per_page", "10");
      url.searchParams.set("content_filter", "high");
      const res = await fetch(url, { headers });
      if (res.status === 403 || res.status === 429) throw new RateLimited(`rate limited (${res.status})`);
      if (res.status === 401) throw new RateLimited("401: UNSPLASH_ACCESS_KEY was rejected");
      if (!res.ok) throw new Error(`search ${res.status} ${res.statusText}`);
      const data = await res.json();
      return (data.results ?? []).map((p) => ({
        page: p.links.html,
        image: `${p.urls.raw}&w=1200&fm=jpg&q=80`,
        width: p.width,
        height: p.height,
        name: p.user.name,
        profile: `${p.user.links.html}?utm_source=${APP}&utm_medium=referral`,
        source: "Unsplash",
        ping: () => fetch(p.links.download_location, { headers }).catch(() => {}),
      }));
    },
  };
}

function pixabayProvider(key) {
  return {
    label: "Pixabay",
    delay: 700,
    rateHint: "Pixabay allows 100 requests/minute. Wait a minute and run it again",
    async search(query, t) {
      const url = new URL("https://pixabay.com/api/");
      url.searchParams.set("key", key);
      url.searchParams.set("q", query.slice(0, 100));
      url.searchParams.set("image_type", "photo");
      url.searchParams.set("orientation", (t.orientation ?? "portrait") === "portrait" ? "vertical" : "horizontal");
      url.searchParams.set("safesearch", "true");
      url.searchParams.set("per_page", "20");
      const res = await fetch(url);
      if (res.status === 429) throw new RateLimited("rate limited (429)");
      if (res.status === 400 && /key/i.test(await res.clone().text())) throw new RateLimited("PIXABAY_API_KEY was rejected");
      if (!res.ok) throw new Error(`search ${res.status} ${res.statusText}`);
      const data = await res.json();
      return (data.hits ?? []).map((p) => ({
        page: p.pageURL,
        // Pixabay doesn't allow hotlinking; the photo is downloaded and stored locally.
        image: p.largeImageURL,
        width: p.imageWidth,
        height: p.imageHeight,
        name: p.user,
        profile: `https://pixabay.com/users/${p.user}-${p.user_id}/`,
        source: "Pixabay",
      }));
    },
  };
}

let provider;
if (source === "pixabay") {
  const key = readKey("PIXABAY_API_KEY");
  if (!key) {
    console.log("No PIXABAY_API_KEY found in .env.local. Sign up free at pixabay.com, copy the key from pixabay.com/api/docs, add it, and run again.");
    process.exit(0);
  }
  provider = pixabayProvider(key);
} else {
  const key = readKey("UNSPLASH_ACCESS_KEY");
  if (!key) {
    console.log("No UNSPLASH_ACCESS_KEY found in .env.local, so no photos were fetched.");
    console.log("Add a key and run `npm run images`, or use Pixabay: PIXABAY_API_KEY=... in .env.local, then `npm run images -- --source=pixabay`.");
    spawnSync(process.execPath, [join(root, "scripts", "build-image-manifest.mjs")], { stdio: "inherit" });
    process.exit(0);
  }
  provider = unsplashProvider(key);
}

const creditsPath = join(root, "public", "items", "credits.json");
mkdirSync(join(root, "public", "items"), { recursive: true });
const readCredits = () => (existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, "utf8")) : {});
const credits = readCredits();
const newCredits = {};

/** Merge this run's new credits into whatever is on disk now, so overlapping runs can't wipe each other out. */
function saveCredits() {
  writeFileSync(creditsPath, JSON.stringify({ ...readCredits(), ...newCredits }, null, 2) + "\n");
}

/** Photo pages already used by an item, so no two listings share a photo. */
const usedPhotos = new Set(Object.values(credits).map((c) => String(c.photo ?? "").split("?")[0]).filter(Boolean));

// Photos a person looked at and rejected (wrong product, wrong brand). Never picked again.
const rejectedPath = join(root, "scripts", "rejected-photos.json");
if (existsSync(rejectedPath)) for (const u of JSON.parse(readFileSync(rejectedPath, "utf8"))) usedPhotos.add(String(u).split("?")[0]);

const FILLER = new Set(["studio", "product", "white", "background", "flat", "lay", "on", "a", "the", "of", "with", "and", "isolated", "closeup", "close", "up", "shot", "photo"]);

/**
 * The query as written, then without filler words, then its last two words (usually the
 * product noun: "handheld garment steamer" -> "garment steamer"), then its first two.
 * Never drops to a single word unless the query only had one: one word ("cordless",
 * "portable") matches anything.
 */
function simplerQueries(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const core = words.filter((w) => !FILLER.has(w));
  const list = [q, core.join(" "), core.slice(-2).join(" "), core.slice(0, 2).join(" ")];
  if (core.length === 1) list.push(core[0]);
  return [...new Set(list.filter(Boolean))];
}

/** Unused results that are really portrait (taller than wide) for portrait targets. */
async function search(query, t) {
  const portrait = (t.orientation ?? "portrait") === "portrait";
  return (await provider.search(query, t))
    .filter((p) => !portrait || p.height > p.width * 1.15)
    .filter((p) => !usedPhotos.has(p.page.split("?")[0]));
}

/** Download, then store as a 1200px-wide JPEG (keeps every source the same size). */
async function save(photo, file) {
  const res = await fetch(photo.image, { headers: { "User-Agent": "dibs-demo-image-fetch" } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).rotate().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(file);
}

console.log(`Source: ${provider.label}\n`);
let fetched = 0;
let skipped = 0;
const failed = [];

for (const t of targets) {
  // Fill only the missing slots (1.jpg / 2.jpg), so a single rejected photo can be replaced.
  const have = existsSync(t.dir) ? readdirSync(t.dir) : [];
  const missing = t.names.filter((n) => !have.includes(n));
  if (missing.length === 0) {
    skipped++;
    continue;
  }
  const need = missing.length;
  try {
    let results = [];
    let used = t.query;
    for (const q of simplerQueries(t.query)) {
      results = await search(q, t);
      used = q;
      if (results.length >= need) break;
      await sleep(provider.delay);
    }
    if (results.length === 0) throw new Error("no results, even for the simplest query");
    if (used !== t.query) console.log(`     ${t.key}: used simpler query "${used}"`);
    mkdirSync(t.dir, { recursive: true });
    let saved = 0;
    for (const photo of results) {
      if (saved === need) break;
      try {
        await save(photo, join(t.dir, missing[saved]));
      } catch {
        continue; // dead link or unreadable file: try the next result
      }
      photo.ping?.();
      usedPhotos.add(photo.page.split("?")[0]);
      const publicPath = t.key === "hero" ? `/hero/${missing[saved]}` : `/items/${t.key}/${missing[saved]}`;
      credits[publicPath] = newCredits[publicPath] = {
        name: photo.name,
        profile: photo.profile,
        photo: photo.source === "Unsplash" ? `${photo.page}?utm_source=${APP}&utm_medium=referral` : photo.page,
        source: photo.source,
        ...(photo.license ? { license: photo.license, licenseUrl: photo.licenseUrl } : {}),
      };
      saved++;
    }
    if (saved === 0) throw new Error("every result failed to download");
    saveCredits();
    fetched++;
    console.log(`ok   ${t.key} (${saved})`);
  } catch (err) {
    if (err instanceof RateLimited) {
      console.log(`stop: ${err.message}. ${provider.rateHint}; finished items are kept.`);
      failed.push(...targets.slice(targets.indexOf(t)).filter((x) => !existsSync(x.dir)).map((x) => x.key));
      break;
    }
    failed.push(t.key);
    console.log(`skip ${t.key}: ${err.message} (gradient fallback will be used)`);
  }
  await sleep(provider.delay);
}

saveCredits();
console.log(`\nFetched ${fetched}, skipped ${skipped} (already had photos), failed ${failed.length}.`);
if (failed.length) console.log(`Failed: ${failed.join(", ")}`);
spawnSync(process.execPath, [join(root, "scripts", "build-image-manifest.mjs")], { stdio: "inherit" });
