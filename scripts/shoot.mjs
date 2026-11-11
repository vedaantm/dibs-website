// QA helper: screenshots routes at the four breakpoints CLAUDE.md asks us to check.
// Usage: node scripts/shoot.mjs <outDir> /route1 /route2 ...   (needs `npm run start` or `npm run dev` on :3000)
// Env: BASE=http://localhost:3000  WIDTHS=375,768,1280,1600  FULL=1 (full-page)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [outDir = "shots", ...routes] = process.argv.slice(2);
const base = process.env.BASE ?? "http://localhost:3000";
const widths = (process.env.WIDTHS ?? "375,768,1280,1600").split(",").map(Number);
const full = process.env.FULL !== "0";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 812 : 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const r of routes.length ? routes : ["/"]) {
    await page.goto(base + r, { waitUntil: "networkidle" });
    await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible")));
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const name = `${r.replace(/[^a-z0-9]+/gi, "_") || "home"}_${w}.png`;
    await page.screenshot({ path: join(outDir, name), fullPage: full });
    console.log(`${name}${overflow > 0 ? `  OVERFLOW +${overflow}px` : ""}`);
  }
  if (errors.length) console.log(`  console errors @${w}:`, [...new Set(errors)].slice(0, 5));
  await ctx.close();
}
await browser.close();
