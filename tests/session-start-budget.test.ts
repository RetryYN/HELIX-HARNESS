import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import {
  chmodSync,
  closeSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

/**
 * PLAN-L7-471-session-start-hook-budget / U-SSBUDGET-001..008
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

/** lifecycle journal に記録された surface receipt を読む。 */
function surfaceReceipts(dir: string): Array<{ sessionId: string | null; sourceId: string }> {
  const path = join(dir, ".helix", "logs", "feedback-lifecycle.jsonl");
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map(
      (line) => JSON.parse(line) as { action: string; sessionId: string | null; sourceId: string },
    )
    .filter((event) => event.action === "surface");
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

/**
 * feedback 経路を **恒久的に** 塞ぐ barrier を張る。lifecycle journal の位置に FIFO を置き、
 * test 側が writer 端を保持することで、`readEvents` の `readFileSync` が EOF を得られず
 * 無期限に block する。
 *
 * coordination lock を掴む方式は使わない。`withLock` は 20ms × 100 回で acquisition を諦めて
 * fail-open するため (`src/feedback/lifecycle-node.ts` の retry 上限)、親 process が 2 秒以上
 * deschedule されると子が feedback 経路を完走してしまい、順序退行を見逃す false green になる
 * (Codex review 7 High)。barrier 方式は時間に依存せず、子は kill されるまで前へ進めない。
 */
function blockFeedbackPathForever(dir: string): () => void {
  mkdirSync(join(dir, ".helix", "logs"), { recursive: true });
  const journal = join(dir, ".helix", "logs", "feedback-lifecycle.jsonl");
  // reconcile が作った実ファイルを FIFO へ置き換える。projection は harness.db 側に残るので
  // surface ref は引き続き生成され、receipt 記録が journal 読取で確実に barrier へ到達する。
  rmSync(journal, { force: true });
  const made = spawnSync("mkfifo", [journal], { encoding: "utf8" });
  expect(made.status, `mkfifo failed: ${made.stderr ?? ""}`).toBe(0);
  // writer 端を掴んでおく。これが無いと子の open(O_RDONLY) 自体が block/失敗し得て、
  // fail-open で barrier を通り抜ける経路が残る (実測: 稀に子が完走した)。
  // O_RDWR で開くと Linux では即時成功し、writer が生きているため子の read() は EOF に
  // ならず無期限に block する = 時間に依存しない停止点になる。
  const holder = openSync(journal, "r+");
  return () => {
    try {
      closeSync(holder);
    } catch {
      /* already closed */
    }
  };
}

/** process group がまだ生きているか (signal 0 は存在確認のみ)。 */
function processGroupAlive(pid: number): boolean {
  try {
    process.kill(-pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * process group 全体へ SIGKILL を送り、**group が消滅するまで待つ**。
 * barrier を解放する前に必ずこれを通す。待たずに解放すると、生き残った tsx が一瞬再開して
 * fixture 削除と並行して副作用を続行できる (Codex review 9 High)。
 */
async function killProcessGroupAndWait(pid: number, timeoutMs = 30_000): Promise<void> {
  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    /* group already gone */
  }
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline && processGroupAlive(pid)) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  if (processGroupAlive(pid)) throw new Error(`process_group_still_alive:${pid}`);
}

/** exit event の取りこぼしを避けるため、終了状態を polling で待つ。 */
async function waitForChildExit(child: ChildProcess, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (child.exitCode === null && child.signalCode === null && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

function sessionStartRecorded(dir: string, sessionId: string): boolean {
  const path = join(dir, ".helix", "logs", "session", `${sessionId}.jsonl`);
  if (!existsSync(path)) return false;
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .some((line) => {
      try {
        return (JSON.parse(line) as { event_type?: string }).event_type === "session_start";
      } catch {
        return false;
      }
    });
}

function runCli(cwd: string, args: string[], input?: unknown, env?: NodeJS.ProcessEnv) {
  return spawnSync("npx", ["--prefix", repoRoot, "--no-install", "tsx", cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
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

  it("U-SSBUDGET-006: 委譲経路は feedback があっても machine-readable JSON を壊さない", () => {
    // `helix codex --execute` / `helix team run` は SessionStart 副作用を通しつつ stdout を
    // machine-readable JSON として返す。feedback surface を stdout へ混ぜると JSON が壊れる
    // (実測: SyntaxError で落ちた)。dry-run は副作用前に return するため --execute で固定する。
    const dir = makeRepo();
    seedFeedbackEvents(dir, 5);
    const fakeCodex = join(dir, "fake-codex.sh");
    writeFileSync(fakeCodex, "#!/bin/sh\ncat > /dev/null\nexit 0\n");
    chmodSync(fakeCodex, 0o755);

    const json = runCli(
      dir,
      ["codex", "--role", "tl", "--task", "probe", "--execute", "--json"],
      undefined,
      { HELIX_CODEX_BIN: fakeCodex },
    );
    expect(() => JSON.parse(json.stdout)).not.toThrow();
    expect(json.stdout).not.toContain("harness.db feedback (");
    // surface は捨てているのではなく、経路を stderr へ分けている。
    expect(json.stderr).toContain("harness.db feedback (open=5");
  });

  it("U-SSBUDGET-007: 委譲経路では attempt escalation も stdout を汚さない", () => {
    // stdout/stderr の分離は feedback surface だけでなく SessionStart が stdout へ書く
    // **すべての** surface に効かなければならない。escalation は feedback が空でも出るため、
    // feedback だけを seed した U-SSBUDGET-006 では検出できない迂回経路になっていた
    // (Codex review 3 High)。
    const dir = makeRepo();
    const failures = Array.from({ length: 3 }, () =>
      JSON.stringify({ event_type: "tool_use", target: "src/loop.ts", outcome: "error" }),
    ).join("\n");
    writeFileSync(join(dir, ".helix", "logs", "session", "prev-session.jsonl"), `${failures}\n`);
    const fakeCodex = join(dir, "fake-codex.sh");
    writeFileSync(fakeCodex, "#!/bin/sh\ncat > /dev/null\nexit 0\n");
    chmodSync(fakeCodex, 0o755);

    const json = runCli(
      dir,
      ["codex", "--role", "tl", "--task", "probe", "--execute", "--json"],
      undefined,
      { HELIX_CODEX_BIN: fakeCodex },
    );
    expect(() => JSON.parse(json.stdout)).not.toThrow();
    expect(json.stdout).not.toContain("attempt-escalation (Iron Law)");
    // 捨てているのではなく stderr へ回していること。
    expect(json.stderr).toContain("attempt-escalation (Iron Law)");
    expect(json.stderr).toContain("src/loop.ts: 3 consecutive failures");
  });

  it("U-SSBUDGET-008: feedback 経路の完了前に kill されても session_start event は残る", async () => {
    // U-SSBUDGET-002 は「正常終了後に event がある」ことしか見ないため、dispatch を feedback の
    // 後ろへ戻しても green になる (Codex review 6 High)。本 oracle は実運用の予算 kill を再現する。
    //
    // 停止点は時間ではなく barrier で決める: feedback 経路の journal 読取を FIFO で恒久 block し
    // (`blockFeedbackPathForever`)、`harness-memory (` (dispatch の直後・side effects の直前に出る
    // marker) を観測してから process group ごと SIGKILL する。子は barrier の手前で永久に止まるので、
    // 親がどれだけ deschedule されても feedback 経路が完走することはない。
    const dir = makeRepo();
    seedFeedbackEvents(dir, 20);
    // projection を作っておく。これが無いと surface ref が 0 件になり recordFeedbackSurfaces が
    // 即 return して journal を読まないため、barrier に到達しないまま green になる。
    expect(runCli(dir, ["feedback", "reconcile"]).status).toBe(0);
    writeMemory(dir, "kill-probe", "memory surface marks the pre-feedback stop point");

    // barrier 作成の直後から try を始める。spawn 失敗や assertion 失敗でも、必ず
    // 「group 消滅を待つ → barrier 解放」の順で cleanup する (Codex review 9 High)。
    const releaseBarrier = blockFeedbackPathForever(dir);
    let child: ChildProcess | undefined;
    let bodyError: unknown;
    try {
      child = spawn(
        "npx",
        [
          "--prefix",
          repoRoot,
          "--no-install",
          "tsx",
          cliPath,
          "session",
          "start",
          "--session",
          "kill-1",
        ],
        // detached: 実処理を行う tsx は npx の孫なので、wrapper だけ kill すると orphan が
        // barrier 解放後に再開して副作用を続行する (Codex review 8 High。修正前の版が残した
        // orphan が実測で 2.5 時間生存していた)。process group を作り group ごと殺す。
        { cwd: dir, stdio: ["pipe", "pipe", "pipe"], detached: true },
      );
      const pid = child.pid;
      expect(pid, "child pid が取得できない").toBeTypeOf("number");
      let stdout = "";
      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr?.resume();
      child.stdin?.end("{}");

      // barrier は恒久なので待ち時間に上限の意味は無い。多 suite 並列時の npx/tsx 起動遅延が
      // deadline に当たって偽 red になるのを避けるため、test timeout に対して十分な余裕を取る。
      const deadline = Date.now() + 100_000;
      while (!stdout.includes("harness-memory (") && Date.now() < deadline) {
        if (child.exitCode !== null || child.signalCode !== null) break;
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      expect(
        stdout,
        `memory surface marker が出る前に終了した (exit=${child.exitCode} signal=${child.signalCode})`,
      ).toContain("harness-memory (");
      // barrier の手前で生きていること = feedback 経路は完了していない。
      expect(child.exitCode, "子が barrier を通過して終了した").toBeNull();

      await killProcessGroupAndWait(pid as number);
      await waitForChildExit(child);
      // 正常終了ではなく SIGKILL で落ちたことを明示 assert する (予算 kill の再現)。
      expect(child.signalCode).toBe("SIGKILL");
      // 側効果の終端 echo が出ていないこと (feedback 経路を通り抜けていない証拠)。
      expect(stdout).not.toContain("session-log: start");
      // それでも session_start は耐久化されていること (旧実装は予算 kill で 0 件だった)。
      expect(sessionStartRecorded(dir, "kill-1")).toBe(true);
    } catch (error) {
      bodyError = error;
    }

    let cleanupError: unknown;
    if (child?.pid !== undefined) {
      try {
        await killProcessGroupAndWait(child.pid);
      } catch (error) {
        cleanupError = error;
      }
    }
    // **group の消滅を確認できたときだけ** barrier を解放する (fail-close)。確認できないまま
    // FIFO を閉じると、生き残った tsx が再開して fixture 削除と並行に副作用を続ける — これは
    // まさに本 oracle が防ごうとしている状態である (Codex review 10 High)。確認できない場合は
    // FIFO holder を保持し続け、生存 process を barrier の手前に閉じ込めたまま test を失敗させる。
    if (cleanupError === undefined) releaseBarrier();

    // 本体 error を優先しつつ、cleanup error も落とさない。
    if (bodyError !== undefined && cleanupError !== undefined) {
      throw new AggregateError([bodyError, cleanupError], "u_ssbudget_008_body_and_cleanup_failed");
    }
    if (bodyError !== undefined) throw bodyError;
    if (cleanupError !== undefined) throw cleanupError;
  }, 150_000);

  it("U-SSBUDGET-002: session_start event と memory recall が feedback surface より先に出る", () => {
    const dir = makeRepo();
    seedFeedbackEvents(dir, 3);
    writeMemory(dir, "ordering-probe", "memory must survive a hook budget kill");
    const result = runCli(dir, ["session", "start", "--session", "budget-2"], {});
    expect(result.status).toBe(0);

    // 失われていた耐久成果物そのものを検証する。stdout の `session-log: start` は側効果後に出る
    // 確認エコーであり、これを見ても「予算 kill で event が残るか」は分からない (weak oracle)。
    const sessionLog = readFileSync(
      join(dir, ".helix", "logs", "session", "budget-2.jsonl"),
      "utf8",
    );
    const startEvents = sessionLog
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line) as { event_type?: string });
    expect(startEvents.some((entry) => entry.event_type === "session_start")).toBe(true);

    const memoryAt = result.stdout.indexOf("harness-memory (");
    const surfaceAt = result.stdout.indexOf("harness.db feedback (");
    expect(memoryAt).toBeGreaterThanOrEqual(0);
    expect(surfaceAt).toBeGreaterThanOrEqual(0);
    // 安く・失うと痛い出力 (memory recall) が、重い feedback 経路より前に確定すること。
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

  it("U-SSBUDGET-004: 同一 SessionStart の全 ref を打ち切らず receipt 化し、再実行は追記ゼロ", () => {
    const dir = makeRepo();
    seedFeedbackEvents(dir, 130);
    expect(runCli(dir, ["feedback", "reconcile"]).status).toBe(0);

    const start = runCli(dir, ["session", "start", "--session", "budget-4"], {});
    expect(start.status).toBe(0);
    // 打ち切り機構は存在しない (batch append で予算内に収めるため)。
    expect(start.stdout).not.toContain("deferred:");
    expect(start.stdout).not.toContain("spooled");

    // 全 130 件が 1 session の surface receipt として journal に載ること。
    const surfaced = surfaceReceipts(dir);
    expect(surfaced).toHaveLength(130);
    // すべて同一 receipt session に属すること (別 session へ散らさない)。
    expect(new Set(surfaced.map((event) => event.sessionId)).size).toBe(1);

    // 同一 session の再実行は idempotent replay で追記ゼロ (二重 receipt を作らない)。
    const again = runCli(dir, ["session", "start", "--session", "budget-4"], {});
    expect(again.status).toBe(0);
    expect(surfaceReceipts(dir)).toHaveLength(130);
  });
});
