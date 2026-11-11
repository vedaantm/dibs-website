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
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", t.query);
    url.searchParams.set("orientation", t.orientation ?? "portrait");
    url.searchParams.set("per_page", String(t.count));
    url.searchParams.set("content_filter", "high");
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`search ${res.status} ${res.statusText}`);
    const data = await res.json();
    const results = (data.results ?? []).slice(0, t.count);
    if (results.length === 0) throw new Error("no results");
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
      credits[publicPath] = {
        name: photo.user.name,
        profile: `${photo.user.links.html}?utm_source=${APP}&utm_medium=referral`,
        photo: `${photo.links.html}?utm_source=${APP}&utm_medium=referral`,
      };
    }
    fetched++;
    console.log(`ok   ${t.key} (${results.length})`);
  } catch (err) {
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
