import {
  closeSync,
  existsSync,
  fsyncSync,
  ftruncateSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  statSync,
  writeSync,
} from "node:fs";
import { join } from "node:path";
import type { FeedbackLifecycleDeps, FeedbackLifecycleEventV1 } from "../policy/feedback-lifecycle";
import { isSqliteBusy } from "../runtime/sqlite-error";
import { type HarnessDb, openHarnessDb } from "../state-db";

/**
 * append-only journal を読む。末尾に改行の無い行は **crash で切れた torn write** であり、
 * durable な receipt ではない (append 側は必ず event ごとに `\n` を付け、truncate も改行境界へ
 * 揃えるため、完全な行が改行を欠くことはない)。よって末尾の不完全行だけは読み捨てる。
 * 中間行の破損は読み捨てず、`resolveFeedbackLifecycle` の damaged として fail-close させる。
 */
function readJsonLines(path: string): unknown[] {
  if (!existsSync(path)) return [];
  const text = readFileSync(path, "utf8");
  const lines = text.split(/\r?\n/);
  if (!text.endsWith("\n") && lines.length > 0) lines.pop();
  return lines.filter((line) => line.trim() !== "");
}

/**
 * 末尾が改行で終わっていない (= 直前の write が途中で切れた) 場合に、最後の完全な行境界まで
 * journal を切り詰める。1 回の `writeSync` は atomic ではないので、batch の途中 crash では
 * 「JSON の途中 byte まで durable」という状態が起こり得る。これを残したまま append すると
 * 破損行と次の event が連結され、retry しても valid receipt にならず damaged が恒久化する。
 * lock 保持中にだけ呼ぶ。
 */
function truncateTornTail(path: string): void {
  if (!existsSync(path)) return;
  const size = statSync(path).size;
  if (size === 0) return;
  const fd = openSync(path, "r+");
  try {
    const tail = Buffer.alloc(1);
    readSync(fd, tail, 0, 1, size - 1);
    if (tail[0] === 0x0a) return;
    // 後方走査で最後の改行位置を探す (行長は数百 byte 程度なので chunk 単位で十分)。
    const chunkSize = 64 * 1024;
    let end = size;
    while (end > 0) {
      const start = Math.max(0, end - chunkSize);
      const chunk = Buffer.alloc(end - start);
      readSync(fd, chunk, 0, chunk.length, start);
      const at = chunk.lastIndexOf(0x0a);
      if (at >= 0) {
        ftruncateSync(fd, start + at + 1);
        return;
      }
      end = start;
    }
    // 1 本も完全な行が無い = 先頭 event の torn write。journal 全体を捨てる。
    ftruncateSync(fd, 0);
  } finally {
    closeSync(fd);
  }
}

function writeAllBytes(fd: number, bytes: Uint8Array): void {
  let offset = 0;
  while (offset < bytes.length) {
    const written = writeSync(fd, bytes, offset, bytes.length - offset);
    if (written <= 0) throw new Error("feedback_lifecycle_short_write");
    offset += written;
  }
}

export function nodeFeedbackLifecycleDeps(
  root: string,
  now = () => new Date().toISOString(),
): FeedbackLifecycleDeps {
  const logDir = join(root, ".helix", "logs");
  const journalPath = join(logDir, "feedback-lifecycle.jsonl");
  const coordinationPath = join(logDir, "feedback-lifecycle.coordination.sqlite");
  let active: { db: HarnessDb; fence: number } | undefined;
  return {
    now,
    readEvents: () => readJsonLines(journalPath),
    withLock: (owner, fn) => {
      mkdirSync(logDir, { recursive: true });
      for (let attempt = 0; ; attempt += 1) {
        let db: HarnessDb | undefined;
        try {
          db = openHarnessDb(coordinationPath, { repoRoot: root });
          db.exec(
            "CREATE TABLE IF NOT EXISTS feedback_lifecycle_fence (singleton INTEGER PRIMARY KEY CHECK(singleton = 1), fence_token INTEGER NOT NULL, owner TEXT NOT NULL, acquired_at TEXT NOT NULL)",
          );
          db.exec("BEGIN IMMEDIATE");
          db.prepare(
            "INSERT INTO feedback_lifecycle_fence(singleton, fence_token, owner, acquired_at) VALUES (1, 1, ?, ?) ON CONFLICT(singleton) DO UPDATE SET fence_token = fence_token + 1, owner = excluded.owner, acquired_at = excluded.acquired_at",
          ).run(owner, now());
          const fence = Number(
            db.prepare("SELECT fence_token FROM feedback_lifecycle_fence WHERE singleton = 1").get()
              ?.fence_token,
          );
          active = { db, fence };
          const result = fn(fence);
          db.exec("COMMIT");
          return result;
        } catch (error) {
          try {
            db?.exec("ROLLBACK");
          } catch {
            /* transaction may not have started */
          }
          if (attempt >= 100 || !isSqliteBusy(error)) throw error;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
        } finally {
          active = undefined;
          db?.close();
        }
      }
    },
    // PLAN-L7-471: receipt 件数分の open/fsync/close を 1 回へ畳む。同一 lock・同一 fence 内で
    // 全 event を連結して 1 度だけ durable write するため、耐久性は逐次版と同じで
    // (途中 crash 時は末尾の不完全行が捨てられる) I/O 回数だけが O(N) → O(1) になる。
    appendEvents: (events, fence) => {
      appendJournal(events, fence);
    },
  };

  function appendJournal(events: readonly FeedbackLifecycleEventV1[], fence: number): void {
    if (events.length === 0) return;
    if (!active || active.fence !== fence) throw new Error("stale_fencing_token");
    const stored = active.db
      .prepare("SELECT fence_token FROM feedback_lifecycle_fence WHERE singleton = 1")
      .get();
    if (Number(stored?.fence_token) !== fence) throw new Error("stale_fencing_token");
    mkdirSync(logDir, { recursive: true });
    // 直前の torn write を先に切り詰めてから追記する (破損行と新 event を連結させない)。
    truncateTornTail(journalPath);
    const payload = events.map((event) => `${JSON.stringify(event)}\n`).join("");
    const fd = openSync(journalPath, "a");
    try {
      writeAllBytes(fd, Buffer.from(payload, "utf8"));
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  }
}
