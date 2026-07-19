import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

// PLAN-L7-451-lint-effect-port-separation

describe("PLAN-L7-451 read-only lint route", () => {
  it("U-SBOUND-014: IT-SBOUND-003 production plan lint routeはwrite/process authorityを使わない", () => {
    const cliUrl = pathToFileURL(resolve("src/cli.ts")).href;
    const monitor = [
      'const { createRequire } = await import("node:module");',
      "const require = createRequire(import.meta.url);",
      'const fs = require("node:fs");',
      'const child = require("node:child_process");',
      "let writes = 0; let spawns = 0;",
      'for (const name of ["writeFileSync", "appendFileSync", "mkdirSync", "rmSync", "renameSync", "copyFileSync", "chmodSync", "truncateSync", "symlinkSync", "linkSync"]) {',
      "  const original = fs[name];",
      "  if (typeof original !== 'function') continue;",
      '  fs[name] = (...args) => { writes += 1; throw new Error("unexpected fs write: " + name); };',
      "}",
      'for (const name of ["spawn", "spawnSync", "exec", "execSync", "execFile", "execFileSync", "fork"]) {',
      '  child[name] = (...args) => { spawns += 1; throw new Error("unexpected child process: " + name); };',
      "}",
      'process.argv = ["node", "src/cli.ts", "plan", "lint", "--gate", "governance"];',
      `await import(${JSON.stringify(cliUrl)});`,
      'process.stdout.write("\\nIT-SBOUND-003-COUNTS:" + JSON.stringify({ writes, spawns }) + "\\n");',
    ].join("\n");
    const result = spawnSync("node", ["--eval", monitor], {
      cwd: process.cwd(),
      env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
      encoding: "utf8",
      timeout: 60_000,
    });
    expect(result.status, result.stderr.slice(0, 2_000)).toBe(0);
    expect(result.stdout).toContain("plan-governance - OK");
    const marker = result.stdout.match(/IT-SBOUND-003-COUNTS:(\{[^\n]+\})/);
    expect(marker?.[1]).toBeDefined();
    expect(JSON.parse(marker?.[1] ?? "{} ")).toEqual({ writes: 0, spawns: 0 });
  }, 70_000);
});
