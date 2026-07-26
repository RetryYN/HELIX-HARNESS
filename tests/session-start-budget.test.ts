import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

/**
 * PLAN-L7-471-session-start-hook-budget / U-SSBUDGET-001..003
 *
 * SessionStart hook は既定 5s 予算で走る。full feedback lifecycle reconcile と
 * open feedback 件数に比例する surface receipt append を同期実行していたため、
 * 実測 24.4s で毎回 kill され、session_start event も harness memory recall も
 * 一切届かなくなっていた (silent fail-open)。本 oracle はその回帰を固定する。
 */

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const created: string[] = [];

function makeRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "helix-session-start-"));
  created.push(dir);
  mkdirSync(join(dir, ".helix", "logs", "session"), { recursive: true });
  mkdirSync(join(dir, ".helix", "memory"), { recursive: true });
  const db = openHarnessDb(join(dir, ".helix", "harness.db"), { repoRoot: dir });
  try {
    migrate(db);
  } finally {
    db.close();
  }
  return dir;
}

function writeMemory(dir: string, key: string, body: string): void {
  // 形式 drift を避けるため、fixture は正規 CLI 経路で書く。
  const written = runCli(dir, [
    "memory",
    "write",
    "harness",
    key,
    body,
    "--v2",
    "--type",
    "decision",
    "--runtime",
    "claude",
  ]);
  expect(written.status).toBe(0);
}

function runCli(cwd: string, args: string[], input?: unknown) {
  return spawnSync("npx", ["--prefix", repoRoot, "--no-install", "tsx", cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: process.env,
    input: input === undefined ? undefined : JSON.stringify(input),
  });
}

afterEach(() => {
  while (created.length > 0) {
    const dir = created.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("SessionStart hook budget (PLAN-L7-471)", () => {
  it("U-SSBUDGET-001: full lifecycle reconcile を回さず、保留を明示する", () => {
    const dir = makeRepo();
    const result = runCli(dir, ["session", "start", "--session", "budget-1"], {});
    expect(result.status).toBe(0);
    // 保守 (reconcile + projection) は SessionStart の責務から外れている。
    expect(result.stdout).toContain("feedback lifecycle maintenance deferred");
    // 打ち切りは必ず後続経路を示す (silent decay にしない)。
    expect(result.stdout).toContain("helix feedback reconcile");
    expect(result.stdout).toContain("session-log: start budget-1");
  });

  it("U-SSBUDGET-002: session_start event と memory recall が feedback surface より先に出る", () => {
    const dir = makeRepo();
    writeMemory(dir, "ordering-probe", "memory must survive a hook budget kill");
    const result = runCli(dir, ["session", "start", "--session", "budget-2"], {});
    expect(result.status).toBe(0);

    const memoryAt = result.stdout.indexOf("harness-memory (");
    const surfaceAt = result.stdout.indexOf("feedback lifecycle maintenance deferred");
    expect(memoryAt).toBeGreaterThanOrEqual(0);
    expect(surfaceAt).toBeGreaterThanOrEqual(0);
    // 安い・失うと痛い出力 (memory recall) が、重い feedback 経路より前に確定すること。
    expect(memoryAt).toBeLessThan(surfaceAt);
    expect(result.stdout).toContain("ordering-probe");
  });

  it("U-SSBUDGET-003: 保守本体は予算のない `feedback reconcile` から実行できる", () => {
    const dir = makeRepo();
    const result = runCli(dir, ["feedback", "reconcile"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("feedback lifecycle reconciled: open=");
  });
});
