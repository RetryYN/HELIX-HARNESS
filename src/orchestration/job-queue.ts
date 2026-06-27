import { createRequire } from "node:module";
import type { Provider } from "./loop-state";

const nodeRequire = createRequire(import.meta.url);

export type JobStatus = "queued" | "claimed" | "done" | "failed";

export interface Job {
  id: string;
  planId: string;
  priority: number;
  status: JobStatus;
  provider: Provider | null;
  retryCount: number;
  createdAt: string;
}

export interface JobQueue {
  claimNextJob(provider: Provider): Job | null;
  enqueue(job: Omit<Job, "status" | "provider" | "retryCount">): void;
  close(): void;
}

interface NativeStatement {
  run(...params: unknown[]): unknown;
  get(...params: unknown[]): unknown;
}

interface NativeDatabase {
  exec(sql: string): unknown;
  prepare(sql: string): NativeStatement;
  close(): void;
}

interface JobRow {
  id: string;
  plan_id: string;
  priority: number;
  status: JobStatus;
  provider: Provider | null;
  retry_count: number;
  created_at: string;
}

function currentDriver(): "bun" | "node" {
  return typeof (globalThis as { Bun?: unknown }).Bun !== "undefined" ? "bun" : "node";
}

function openNative(path: string): NativeDatabase {
  if (currentDriver() === "bun") {
    const { Database } = nodeRequire("bun:sqlite") as {
      Database: new (p: string) => NativeDatabase;
    };
    return new Database(path);
  }

  const { DatabaseSync } = nodeRequire("node:sqlite") as {
    DatabaseSync: new (p: string) => NativeDatabase;
  };
  return new DatabaseSync(path);
}

function isSqliteBusy(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const withCode = error as Error & { code?: unknown };
  return withCode.code === "SQLITE_BUSY" || error.message.includes("SQLITE_BUSY");
}

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    planId: row.plan_id,
    priority: row.priority,
    status: row.status,
    provider: row.provider,
    retryCount: row.retry_count,
    createdAt: row.created_at,
  };
}

export function openJobQueue(dbPath: string): JobQueue {
  const db = openNative(dbPath);
  db.exec("PRAGMA journal_mode=WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      plan_id TEXT,
      priority INTEGER,
      status TEXT,
      provider TEXT,
      retry_count INTEGER,
      created_at TEXT
    )
  `);

  const insertJob = db.prepare(`
    INSERT INTO jobs (id, plan_id, priority, status, provider, retry_count, created_at)
    VALUES (?, ?, ?, 'queued', NULL, 0, ?)
  `);
  const selectNext = db.prepare(`
    SELECT id, plan_id, priority, status, provider, retry_count, created_at
    FROM jobs
    WHERE status = 'queued'
    ORDER BY priority ASC, created_at ASC
    LIMIT 1
  `);
  const claimJob = db.prepare(`
    UPDATE jobs
    SET status = 'claimed', provider = ?
    WHERE id = ? AND status = 'queued'
  `);

  return {
    claimNextJob: (provider: Provider) => {
      let transactionStarted = false;
      try {
        db.exec("BEGIN IMMEDIATE");
        transactionStarted = true;
        const row = selectNext.get() as JobRow | null | undefined;
        if (row == null) {
          db.exec("COMMIT");
          return null;
        }

        claimJob.run(provider, row.id);
        db.exec("COMMIT");
        return rowToJob({ ...row, status: "claimed", provider });
      } catch (error) {
        if (transactionStarted) {
          try {
            db.exec("ROLLBACK");
          } catch (rollbackError) {
            const detail =
              rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
            throw new Error(`job claim rollback failed: ${detail}`, { cause: rollbackError });
          }
        }
        if (isSqliteBusy(error)) return null;
        throw error;
      }
    },
    enqueue: (job: Omit<Job, "status" | "provider" | "retryCount">) => {
      insertJob.run(job.id, job.planId, job.priority, job.createdAt);
    },
    close: () => db.close(),
  };
}
