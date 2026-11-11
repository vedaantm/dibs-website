// Scans public/items and public/hero and writes src/data/image-manifest.json so
// components (server and client) know which photos exist and can fall back to
// the gradient tile when one is missing. Runs automatically before dev/build.
import { readdirSync, existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pub = join(root, "public");
const files = [];

function walk(dir, rel) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const r = `${rel}/${name}`;
    if (statSync(abs).isDirectory()) walk(abs, r);
    else if (/\.(jpe?g|png|webp|avif)$/i.test(name)) files.push(r);
  }
}

walk(join(pub, "items"), "/items");
walk(join(pub, "hero"), "/hero");
walk(join(pub, "edits"), "/edits");

let credits = {};
const creditsPath = join(pub, "items", "credits.json");
if (existsSync(creditsPath)) {
  try {
    credits = JSON.parse(readFileSync(creditsPath, "utf8"));
  } catch {
    credits = {};
  }
}

files.sort();
const out = { files, credits };
writeFileSync(join(root, "src", "data", "image-manifest.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`image manifest: ${files.length} image(s), ${Object.keys(credits).length} credit(s)`);
