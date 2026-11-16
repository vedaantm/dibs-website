// Fetches product photos for every catalog item.
//
//   Unsplash (default):  put UNSPLASH_ACCESS_KEY=... in .env.local, then `npm run images`
//                        (demo keys allow 50 requests/hour, so a full run can take a few hours)
//   Pexels:              put PEXELS_API_KEY=... in .env.local (free, instant at pexels.com/api),
//                        then `npm run images -- --source=pexels` (200 requests/hour: one run does it)
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
const source = (process.argv.find((a) => a.startsWith("--source="))?.split("=")[1] ?? "unsplash").toLowerCase();

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
    rateHint: "demo keys allow 50 requests/hour. Run `npm run images` again later, or `npm run images -- --source=pexels` with a Pexels key",
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

function pexelsProvider(key) {
  return {
    label: "Pexels",
    delay: 250,
    rateHint: "Pexels allows 200 requests/hour. Run it again later",
    async search(query, t) {
      const url = new URL("https://api.pexels.com/v1/search");
      url.searchParams.set("query", query);
      url.searchParams.set("orientation", t.orientation ?? "portrait");
      url.searchParams.set("per_page", "15");
      const res = await fetch(url, { headers: { Authorization: key } });
      if (res.status === 429) throw new RateLimited("rate limited (429)");
      if (res.status === 401 || res.status === 403) throw new RateLimited(`${res.status}: PEXELS_API_KEY was rejected`);
      if (!res.ok) throw new Error(`search ${res.status} ${res.statusText}`);
      const data = await res.json();
      return (data.photos ?? []).map((p) => ({
        page: p.url,
        image: `${p.src.original}?auto=compress&cs=tinysrgb&w=1200`,
        width: p.width,
        height: p.height,
        name: p.photographer,
        profile: p.photographer_url,
        source: "Pexels",
      }));
    },
  };
}

let provider;
if (source === "pexels") {
  const key = readKey("PEXELS_API_KEY");
  if (!key) {
    console.log("No PEXELS_API_KEY found in .env.local. Get a free key at pexels.com/api (instant), add it, and run again.");
    process.exit(0);
  }
  provider = pexelsProvider(key);
} else {
  const key = readKey("UNSPLASH_ACCESS_KEY");
  if (!key) {
    console.log("No UNSPLASH_ACCESS_KEY found in .env.local, so no photos were fetched.");
    console.log("Add a key and run `npm run images`, or use Pexels: PEXELS_API_KEY=... in .env.local, then `npm run images -- --source=pexels`.");
    spawnSync(process.execPath, [join(root, "scripts", "build-image-manifest.mjs")], { stdio: "inherit" });
    process.exit(0);
  }
  provider = unsplashProvider(key);
}

const creditsPath = join(root, "public", "items", "credits.json");
mkdirSync(join(root, "public", "items"), { recursive: true });
const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, "utf8")) : {};

/** Photo pages already used by an item, so no two listings share a photo. */
const usedPhotos = new Set(Object.values(credits).map((c) => String(c.photo ?? "").split("?")[0]).filter(Boolean));

const FILLER = new Set(["studio", "product", "white", "background", "flat", "lay", "on", "a", "the", "of", "with", "and", "isolated", "closeup", "close", "up", "shot", "photo"]);

/** The query as written, then without filler words, then its first one or two words. */
function simplerQueries(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const core = words.filter((w) => !FILLER.has(w));
  const list = [q, core.join(" "), core.slice(0, 2).join(" "), core[0]];
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
  const have = existsSync(t.dir) ? readdirSync(t.dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)) : [];
  if (have.length > 0) {
    skipped++;
    continue;
  }
  try {
    let results = [];
    let used = t.query;
    for (const q of simplerQueries(t.query)) {
      results = await search(q, t);
      used = q;
      if (results.length >= t.count) break;
      await sleep(provider.delay);
    }
    if (results.length === 0) throw new Error("no results, even for the simplest query");
    if (used !== t.query) console.log(`     ${t.key}: used simpler query "${used}"`);
    mkdirSync(t.dir, { recursive: true });
    let saved = 0;
    for (const photo of results) {
      if (saved === t.count) break;
      try {
        await save(photo, join(t.dir, t.names[saved]));
      } catch {
        continue; // dead link or unreadable file: try the next result
      }
      photo.ping?.();
      usedPhotos.add(photo.page.split("?")[0]);
      const publicPath = t.key === "hero" ? `/hero/${t.names[saved]}` : `/items/${t.key}/${t.names[saved]}`;
      credits[publicPath] = {
        name: photo.name,
        profile: photo.profile,
        photo: photo.source === "Unsplash" ? `${photo.page}?utm_source=${APP}&utm_medium=referral` : photo.page,
        source: photo.source,
        ...(photo.license ? { license: photo.license, licenseUrl: photo.licenseUrl } : {}),
      };
      saved++;
    }
    if (saved === 0) throw new Error("every result failed to download");
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

writeFileSync(creditsPath, JSON.stringify(credits, null, 2) + "\n");
console.log(`\nFetched ${fetched}, skipped ${skipped} (already had photos), failed ${failed.length}.`);
if (failed.length) console.log(`Failed: ${failed.join(", ")}`);
spawnSync(process.execPath, [join(root, "scripts", "build-image-manifest.mjs")], { stdio: "inherit" });
