/**
 * SessionStart で予算超過により後回しにした surface receipt の durable spool (PLAN-L7-471)。
 *
 * SessionStart hook は bounded budget で走るため、open feedback 件数に比例する receipt append を
 * 全件同期実行できない。しかし receipt を単に捨てると「同一 SessionStart の全 ref を receipt 化する」
 * 既存契約 (feedback-lifecycle.md、PLAN-L7-455) が壊れ、次 session で同じ item が再表示される。
 *
 * そこで SessionStart は **1 行の append だけ**で deferred ref 集合を receipt session ごと記録し、
 * 予算のない `helix feedback reconcile` が全件を冪等に receipt 化して drain する。
 * receipt の operationId は (sessionId, ref) から決定的に導出されるため、drain の再実行と
 * SessionStart 側の部分書き込みが衝突しても idempotent replay になる。
 */
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

export const RECEIPT_SPOOL_SCHEMA_VERSION = "helix-feedback-receipt-spool.v1";

export interface DeferredReceiptEntry {
  schemaVersion: string;
  sessionId: string;
  refs: string[];
  deferredAt: string;
}

function spoolPath(repoRoot: string): string {
  return join(repoRoot, ".helix", "state", "feedback-receipt-spool.jsonl");
}

function writeAllBytes(fd: number, bytes: Uint8Array): void {
  let offset = 0;
  while (offset < bytes.length) {
    const written = writeSync(fd, bytes, offset, bytes.length - offset);
    if (written <= 0) throw new Error("feedback_receipt_spool_short_write");
    offset += written;
  }
}

/** deferred ref 集合を 1 行 append する (SessionStart 予算内で完了する唯一の I/O)。 */
export function appendDeferredReceipts(
  repoRoot: string,
  entry: Omit<DeferredReceiptEntry, "schemaVersion">,
): void {
  if (entry.refs.length === 0) return;
  const path = spoolPath(repoRoot);
  mkdirSync(join(repoRoot, ".helix", "state"), { recursive: true });
  const record: DeferredReceiptEntry = { schemaVersion: RECEIPT_SPOOL_SCHEMA_VERSION, ...entry };
  const fd = openSync(path, "a");
  try {
    writeAllBytes(fd, Buffer.from(`${JSON.stringify(record)}\n`, "utf8"));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** spool の全 entry を読む (壊れた行と schema 不一致は安全側で無視する)。 */
export function readDeferredReceipts(repoRoot: string): DeferredReceiptEntry[] {
  const path = spoolPath(repoRoot);
  if (!existsSync(path)) return [];
  const entries: DeferredReceiptEntry[] = [];
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (line.trim() === "") continue;
    try {
      const parsed = JSON.parse(line) as DeferredReceiptEntry;
      if (parsed.schemaVersion !== RECEIPT_SPOOL_SCHEMA_VERSION) continue;
      if (typeof parsed.sessionId !== "string" || !Array.isArray(parsed.refs)) continue;
      entries.push(parsed);
    } catch {
      // 壊れた行は skip (fail-open)。
    }
  }
  return entries;
}

/**
 * spool を drain する。`record` が true を返した entry だけを取り除き、残りは次回へ持ち越す。
 * 全件成功時は spool を空にする (0 byte truncate)。
 */
export function drainDeferredReceipts(
  repoRoot: string,
  record: (entry: DeferredReceiptEntry) => boolean,
): { drained: number; retained: number } {
  const entries = readDeferredReceipts(repoRoot);
  if (entries.length === 0) return { drained: 0, retained: 0 };
  const retained: DeferredReceiptEntry[] = [];
  let drained = 0;
  for (const entry of entries) {
    if (record(entry)) drained += 1;
    else retained.push(entry);
  }
  const path = spoolPath(repoRoot);
  const body = retained.map((entry) => `${JSON.stringify(entry)}\n`).join("");
  const fd = openSync(path, "w");
  try {
    if (body !== "") writeAllBytes(fd, Buffer.from(body, "utf8"));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  return { drained, retained: retained.length };
}
