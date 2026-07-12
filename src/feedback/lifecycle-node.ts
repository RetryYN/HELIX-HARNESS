import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeSync,
} from "node:fs";
import { join } from "node:path";
import type { FeedbackLifecycleDeps } from "../policy/feedback-lifecycle";
import { isSqliteBusy } from "../runtime/sqlite-error";
import { type HarnessDb, openHarnessDb } from "../state-db";

function readJsonLines(path: string): unknown[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
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
    appendEvent: (event, fence) => {
      if (!active || active.fence !== fence) throw new Error("stale_fencing_token");
      const stored = active.db
        .prepare("SELECT fence_token FROM feedback_lifecycle_fence WHERE singleton = 1")
        .get();
      if (Number(stored?.fence_token) !== fence) throw new Error("stale_fencing_token");
      mkdirSync(logDir, { recursive: true });
      const fd = openSync(journalPath, "a");
      try {
        writeAllBytes(fd, Buffer.from(`${JSON.stringify(event)}\n`, "utf8"));
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
    },
  };
}
