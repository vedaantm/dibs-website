// Runs vitest from the canonical cwd. On Windows a lowercase drive letter (d:\ vs D:\)
// makes vitest load two copies of itself ("failed to find the current suite").
import { realpathSync } from "node:fs";
import { spawnSync } from "node:child_process";

const cwd = realpathSync.native(process.cwd());
const r = spawnSync("npx", ["vitest", "run", ...process.argv.slice(2)], { cwd, stdio: "inherit", shell: true });
process.exit(r.status ?? 1);
