// Fetches product photos from the Unsplash API for every catalog item.
//
//   1. Put UNSPLASH_ACCESS_KEY=... in .env.local (create a free app at unsplash.com/developers)
//   2. npm run images
//
// - Searches each item's imageQuery (orientation=portrait), downloads the top 2 results at
//   w=1200 into public/items/<slug>/1.jpg and 2.jpg.
// - Skips any item folder that already has images, so your own photos always win.
// - Writes public/items/credits.json (photographer name + profile URL per image) and pings
//   Unsplash's download endpoint, as their API guidelines require.
// - Never scrapes retailer or brand websites.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const APP = "dibs_demo";

function readKey() {
  if (process.env.UNSPLASH_ACCESS_KEY) return process.env.UNSPLASH_ACCESS_KEY;
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return undefined;
  const line = readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith("UNSPLASH_ACCESS_KEY="));
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

const key = readKey();
if (!key) {
  console.log("No UNSPLASH_ACCESS_KEY found in .env.local, so no photos were fetched.");
  console.log("Every item will use its gradient fallback tile. Add a key and run `npm run images` to fetch photos.");
  spawnSync(process.execPath, [join(root, "scripts", "build-image-manifest.mjs")], { stdio: "inherit" });
  process.exit(0);
}

const creditsPath = join(root, "public", "items", "credits.json");
mkdirSync(join(root, "public", "items"), { recursive: true });
const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, "utf8")) : {};

const headers = { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" };

class RateLimited extends Error {}

/** Unsplash photo pages already used by an item, so no two listings share a photo. */
const usedPhotos = new Set(Object.values(credits).map((c) => String(c.photo ?? "").split("?")[0]).filter(Boolean));

const FILLER = new Set(["studio", "product", "white", "background", "flat", "lay", "on", "a", "the", "of", "with", "and", "isolated", "closeup", "close", "up", "shot", "photo"]);

/** The query as written, then without filler words, then its first one or two words. */
function simplerQueries(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const core = words.filter((w) => !FILLER.has(w));
  const list = [q, core.join(" "), core.slice(0, 2).join(" "), core[0]];
  return [...new Set(list.filter(Boolean))];
}

/** Top results that are really portrait (taller than wide) for portrait targets. */
async function search(query, t) {
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
  const portrait = (t.orientation ?? "portrait") === "portrait";
  return (data.results ?? [])
    .filter((p) => !portrait || p.height > p.width * 1.15)
    .filter((p) => !usedPhotos.has(p.links.html))
    .slice(0, t.count);
}
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
    // Full query first; if it doesn't give enough good photos, try simpler ones
    // ("snowboard studio product" -> "snowboard").
    let results = [];
    let used = t.query;
    for (const q of simplerQueries(t.query)) {
      results = await search(q, t);
      used = q;
      if (results.length >= t.count) break;
      await new Promise((r) => setTimeout(r, 300));
    }
    if (results.length === 0) throw new Error("no results, even for the simplest query");
    if (used !== t.query) console.log(`     ${t.key}: used simpler query "${used}"`);
    mkdirSync(t.dir, { recursive: true });
    for (let i = 0; i < results.length; i++) {
      const photo = results[i];
      const imgUrl = `${photo.urls.raw}&w=1200&fm=jpg&q=80`;
      const img = await fetch(imgUrl);
      if (!img.ok) throw new Error(`download ${img.status}`);
      writeFileSync(join(t.dir, t.names[i]), Buffer.from(await img.arrayBuffer()));
      // Required by Unsplash API guidelines: register the download.
      fetch(photo.links.download_location, { headers }).catch(() => {});
      const publicPath = t.key === "hero" ? `/hero/${t.names[i]}` : `/items/${t.key}/${t.names[i]}`;
      usedPhotos.add(photo.links.html);
      credits[publicPath] = {
        name: photo.user.name,
        profile: `${photo.user.links.html}?utm_source=${APP}&utm_medium=referral`,
        photo: `${photo.links.html}?utm_source=${APP}&utm_medium=referral`,
      };
    }
    fetched++;
    console.log(`ok   ${t.key} (${results.length})`);
  } catch (err) {
    if (err instanceof RateLimited) {
      console.log(`stop: ${err.message}. Run \`npm run images\` again later (demo keys allow 50 requests/hour); finished items are kept.`);
      failed.push(...targets.slice(targets.indexOf(t)).filter((x) => !existsSync(x.dir)).map((x) => x.key));
      break;
    }
    failed.push(t.key);
    console.log(`skip ${t.key}: ${err.message} (gradient fallback will be used)`);
  }
  // Demo apps get 50 requests/hour; stay polite.
  await new Promise((r) => setTimeout(r, 300));
}

writeFileSync(creditsPath, JSON.stringify(credits, null, 2) + "\n");
console.log(`\nFetched ${fetched}, skipped ${skipped} (already had photos), failed ${failed.length}.`);
if (failed.length) console.log(`Failed: ${failed.join(", ")}`);
spawnSync(process.execPath, [join(root, "scripts", "build-image-manifest.mjs")], { stdio: "inherit" });
