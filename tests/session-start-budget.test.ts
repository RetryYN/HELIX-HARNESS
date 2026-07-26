import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

/**
 * PLAN-L7-471-session-start-hook-budget / U-SSBUDGET-001..003
 *
 * SessionStart hook は bounded budget で走る (修正前の旧予算 5s / 本 PLAN 適用後 15s)。
 * full feedback lifecycle reconcile と
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

/**
 * open feedback を `count` 件投入する。receipt 上限 (100) を跨がせるために使う。
 * projection は `helix feedback reconcile` が作るので、ここでは source 行だけ入れる。
 */
function seedFeedbackEvents(dir: string, count: number): void {
  const db = openHarnessDb(join(dir, ".helix", "harness.db"), { repoRoot: dir });
  try {
    for (let i = 0; i < count; i += 1) {
      const id = `seed-${String(i).padStart(4, "0")}`;
      db.prepare(
        `INSERT INTO feedback_events
           (feedback_event_id, finding_id, plan_id, source_table, source_id, source_color,
            signal_type, severity, status, next_action, created_at)
         VALUES (?, ?, NULL, 'feedback_events', ?, 'yellow', 'seeded-budget-probe', 'warn', 'open', 'triage', ?)`,
      ).run(id, id, id, "2026-07-27T00:00:00.000Z");
    }
  } finally {
    db.close();
  }
}

function spoolLines(dir: string): string[] {
  const path = join(dir, ".helix", "state", "feedback-receipt-spool.jsonl");
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "");
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
    seedFeedbackEvents(dir, 3);
    const result = runCli(dir, ["session", "start", "--session", "budget-1"], {});
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("harness.db feedback (open=3");
    // 保守 (reconcile + projection) は SessionStart の責務から外れている。
    expect(result.stdout).toContain("feedback lifecycle maintenance deferred");
    // 打ち切りは必ず後続経路を示す (silent decay にしない)。
    expect(result.stdout).toContain("helix feedback reconcile");
    expect(result.stdout).toContain("session-log: start budget-1");
  });

  it("U-SSBUDGET-006: surface する feedback が無い repo では stdout を汚さない", () => {
    // `helix codex` / `helix team run` は同じ side effects を通しつつ stdout を
    // machine-readable JSON として返す。無条件の 1 行追加が JSON を壊した回帰の固定。
    const dir = makeRepo();
    const result = runCli(dir, ["session", "start", "--session", "budget-6"], {});
    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("feedback lifecycle maintenance deferred");
    expect(result.stdout).not.toContain("harness.db feedback (");

    const json = runCli(dir, ["codex", "--role", "tl", "--task", "probe", "--json"]);
    expect(json.status).toBe(0);
    expect(() => JSON.parse(json.stdout)).not.toThrow();
  });

  it("U-SSBUDGET-002: session_start event と memory recall が feedback surface より先に出る", () => {
    const dir = makeRepo();
    seedFeedbackEvents(dir, 3);
    writeMemory(dir, "ordering-probe", "memory must survive a hook budget kill");
    const result = runCli(dir, ["session", "start", "--session", "budget-2"], {});
    expect(result.status).toBe(0);

    const memoryAt = result.stdout.indexOf("harness-memory (");
    const surfaceAt = result.stdout.indexOf("harness.db feedback (");
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

  it("U-SSBUDGET-005: DB 未作成の repo でも SessionStart 後に schema が整い、DB 依存 command が壊れない", () => {
    // maintenance を hook から外したとき、openHarnessDb が空 DB を作るだけで migrate されず、
    // 「DB 不在なら動くのに空 DB があると `no such table` で落ちる」退行を起こした実例の回帰固定。
    const dir = mkdtempSync(join(tmpdir(), "helix-session-start-nodb-"));
    created.push(dir);
    mkdirSync(join(dir, ".helix", "logs", "session"), { recursive: true });

    const start = runCli(dir, ["session", "start", "--session", "budget-5"], {});
    expect(start.status).toBe(0);
    expect(existsSync(join(dir, ".helix", "harness.db"))).toBe(true);

    // SessionStart が作った DB に対して、DB 依存 command が正常応答すること。
    const suggest = runCli(dir, ["skill", "suggest", "--plan", "PLAN-NO-SUCH", "--json"]);
    expect(suggest.status).toBe(0);
    expect(suggest.stderr).not.toContain("no such table");
    expect(JSON.parse(suggest.stdout)).toEqual([]);
  });

  it("U-SSBUDGET-004: 上限超過 receipt は捨てずに spool され、reconcile が全件 drain する", () => {
    const dir = makeRepo();
    // 上限 (100) を跨ぐ open feedback を投入し、projection を作る。
    seedFeedbackEvents(dir, 130);
    expect(runCli(dir, ["feedback", "reconcile"]).status).toBe(0);
    expect(spoolLines(dir)).toHaveLength(0);

    // SessionStart は上限までを即時 receipt 化し、残りを spool へ退避する。
    const start = runCli(dir, ["session", "start", "--session", "budget-4"], {});
    expect(start.status).toBe(0);
    expect(start.stdout).toMatch(/feedback receipt deferred: \d+\/\d+ spooled/);

    const spooled = spoolLines(dir);
    expect(spooled).toHaveLength(1);
    const entry = JSON.parse(spooled[0] ?? "{}") as {
      schemaVersion: string;
      sessionId: string;
      refs: string[];
    };
    expect(entry.schemaVersion).toBe("helix-feedback-receipt-spool.v1");
    // 打ち切りは「捨てた」ではなく「後段へ渡した」ことを、件数一致で固定する。
    const deferred = Number(start.stdout.match(/feedback receipt deferred: (\d+)\//)?.[1] ?? "0");
    expect(deferred).toBeGreaterThan(0);
    expect(entry.refs).toHaveLength(deferred);
    // 元の receipt session を保持していること (別 session の receipt にしない)。
    expect(entry.sessionId).toMatch(/^[a-f0-9]{24}$/);

    // 保守経路が全件を drain し、spool が空になる。
    const drain = runCli(dir, ["feedback", "reconcile"]);
    expect(drain.status).toBe(0);
    expect(drain.stdout).toContain("feedback receipt spool drained: 1 entries (retained=0)");
    expect(spoolLines(dir)).toHaveLength(0);

    // drain は冪等 (再実行しても spool は空のまま、二重 receipt を作らない)。
    const again = runCli(dir, ["feedback", "reconcile"]);
    expect(again.status).toBe(0);
    expect(again.stdout).not.toContain("spool drained");
    expect(spoolLines(dir)).toHaveLength(0);
  });
});
