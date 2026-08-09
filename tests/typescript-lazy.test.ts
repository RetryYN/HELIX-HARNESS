import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { ensureCliBundle } from "./tools/cli-bundle";

// PLAN-RECOVERY-40 (Issue #93) / U-TSLAZY-001。
//
// `typescript` の実体 load は約 217ms（実測）。lint module が top-level で
// `import ts from "typescript"` していたため、compiler を一切使わない `helix --version` でも
// CLI 起動のたびに全額を払っていた（起動 336ms のうち 217ms）。spawn を多用する suite では
// 1 spawn ごとに再計上される。
//
// ここでは「compiler を使わない CLI 経路では typescript が load されない」ことを
// **module cache の実測**で固定する。時間そのものを閾値にしない: 実行機の速度差で flaky になり、
// かつ「速いこと」ではなく「読まないこと」が守りたい契約だから。
const repoRoot = process.cwd();
const SPAWN_TIMEOUT_MS = 60_000;
const TS_LOAD_PROBE = join(repoRoot, "tests/tools/typescript-load-probe.cjs");

/** 子 process で式を評価し、typescript が require cache に載ったかを返す。 */
function typescriptLoadedAfter(expression: string): boolean {
  const probe = `
    const { createRequire } = require("node:module");
    const req = createRequire(${JSON.stringify(join(repoRoot, "probe.js"))});
    const tsEntry = req.resolve("typescript");
    (async () => {
      ${expression}
      process.stdout.write(String(Object.keys(require.cache).includes(tsEntry)));
    })();
  `;
  const run = spawnSync(process.execPath, ["-e", probe], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: SPAWN_TIMEOUT_MS,
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1", NODE_NO_WARNINGS: "1" },
  });
  expect(run.status, `probe stderr: ${run.stderr}`).toBe(0);
  return run.stdout.trim() === "true";
}

describe("typescript lazy loading (PLAN-RECOVERY-40)", () => {
  const probeDirs: string[] = [];
  afterAll(() => {
    for (const dir of probeDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("U-TSLAZY-001: compiler を使わない CLI 経路は typescript を load しない", () => {
    // 検査対象は **bundle の実起動 process そのもの**。別 process で単体 module を import して
    // 代用すると、cli.ts 側に直接 `import ts from "typescript"` が戻っても green のままになる。
    const bundle = ensureCliBundle(repoRoot);
    const probeDir = mkdtempSync(join(tmpdir(), "helix-tsprobe-"));
    probeDirs.push(probeDir);
    const probeOut = join(probeDir, "loaded.txt");
    const run = spawnSync(process.execPath, ["--require", TS_LOAD_PROBE, bundle, "--version"], {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: SPAWN_TIMEOUT_MS,
      env: {
        ...process.env,
        HELIX_SKIP_UPDATE_CHECK: "1",
        NODE_NO_WARNINGS: "1",
        HELIX_TS_PROBE_OUT: probeOut,
      },
    });
    expect(run.status, `stderr: ${run.stderr}`).toBe(0);
    expect(run.stdout.trim()).toBe("0.1.0");
    // 観測子が結果を残していなければ「読まなかった」ではなく「観測できなかった」なので fail-close。
    expect(existsSync(probeOut), `probe did not report; stderr: ${run.stderr}`).toBe(true);
    expect(readFileSync(probeOut, "utf8"), "bundle process loaded typescript").toBe("false");

    // lazy proxy を import しただけでも実体を load しない（proxy 単体の契約）。
    expect(
      typescriptLoadedAfter(
        `await import(${JSON.stringify(join(repoRoot, "src/lint/typescript-lazy.ts"))});`,
      ),
    ).toBe(false);
  });

  it("U-TSLAZY-001: property へ触れた時点で実体を load し、同一 instance を返す", () => {
    // 「load しない」だけを固定すると、壊れた proxy でも green になる。実際に compiler が
    // 使えること（= 遅延の先で正しく解決されること）を同じ oracle で押さえる。
    expect(
      typescriptLoadedAfter(
        `const m = await import(${JSON.stringify(join(repoRoot, "src/lint/typescript-lazy.ts"))});
         if (typeof m.default.createSourceFile !== "function") throw new Error("proxy did not resolve typescript");`,
      ),
    ).toBe(true);
  });
});
