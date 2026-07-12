import { randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  rmSync,
  statfsSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join, relative } from "node:path";
import { type HarnessDb, openHarnessDb } from "./index";
export function databaseFreelist(db: HarnessDb) {
  const pageCount = Number(db.prepare("PRAGMA page_count").get()?.page_count ?? 0);
  const freelistCount = Number(db.prepare("PRAGMA freelist_count").get()?.freelist_count ?? 0);
  return { pageCount, freelistCount, ratio: pageCount === 0 ? 0 : freelistCount / pageCount };
}
export function vacuumHarnessDb(db: HarnessDb) {
  db.exec("VACUUM");
  return databaseFreelist(db);
}

export function compactHarnessDb(input: {
  repoRoot: string;
  execute?: boolean;
  now?: string;
  vacuum?: (db: HarnessDb) => void;
  backupPath?: string;
}) {
  const dbPath = join(input.repoRoot, ".helix", "harness.db");
  const lockPath = join(input.repoRoot, ".helix", "state", "db-compact.lock");
  const backupDir = join(input.repoRoot, ".helix", "backups");
  const backupPath =
    input.backupPath ??
    join(backupDir, `harness.db.compact-${input.now ?? Date.now()}-${randomUUID()}.sqlite`);
  if (!existsSync(dbPath)) return { ok: false, reason: "db-missing", executed: false, dbPath };
  const beforeBytes = statSync(dbPath).size;
  const availableBytes = statfsSync(dbPath).bavail * statfsSync(dbPath).bsize;
  if (availableBytes < beforeBytes * 2)
    return {
      ok: false,
      reason: "insufficient-free-space",
      executed: false,
      dbPath,
      beforeBytes,
      availableBytes,
    };
  if (!input.execute)
    return {
      ok: true,
      reason: "dry-run",
      executed: false,
      dbPath,
      beforeBytes,
      availableBytes,
      backupPath,
    };
  if (existsSync(backupPath))
    return {
      ok: false,
      reason: "backup-path-exists",
      executed: false,
      dbPath,
      backupPath,
      beforeBytes,
      availableBytes,
    };
  let lockFd: number;
  try {
    mkdirSync(join(input.repoRoot, ".helix", "state"), { recursive: true });
    lockFd = openSync(lockPath, "wx");
  } catch {
    return {
      ok: false,
      reason: "concurrent-runtime-or-compact",
      executed: false,
      dbPath,
      beforeBytes,
      availableBytes,
    };
  }
  try {
    mkdirSync(backupDir, { recursive: true });
    const db = openHarnessDb(dbPath, { repoRoot: input.repoRoot });
    try {
      const checkpoint = db.prepare("PRAGMA wal_checkpoint(TRUNCATE)").get() ?? {};
      const busy = Number(checkpoint.busy ?? 1);
      const log = Number(checkpoint.log ?? 0);
      const checkpointed = Number(checkpoint.checkpointed ?? -1);
      if (busy !== 0 || checkpointed !== log)
        throw new Error(
          `wal-checkpoint-incomplete busy=${busy} log=${log} checkpointed=${checkpointed}`,
        );
      const quotedBackup = backupPath.replaceAll("'", "''");
      db.exec(`VACUUM INTO '${quotedBackup}'`);
      (input.vacuum ?? vacuumHarnessDb)(db);
    } finally {
      db.close();
    }
    const afterBytes = statSync(dbPath).size;
    return {
      ok: true,
      reason: "compacted",
      executed: true,
      dbPath,
      beforeBytes,
      afterBytes,
      availableBytes,
      backupPath,
    };
  } catch (error) {
    return {
      ok: false,
      reason: "compact-failed-manual-recovery-required",
      executed: true,
      dbPath,
      beforeBytes,
      availableBytes,
      backupPath,
      error: String(error),
      finding:
        "main DB was not overwritten; inspect the consistent VACUUM INTO backup and recover only through an approved manual route",
    };
  } finally {
    closeSync(lockFd);
    unlinkSync(lockPath);
  }
}
export interface TmpGcCandidate {
  path: string;
  ageMs: number;
  size: number;
}
const GC_NAME_ALLOWLIST = /^(?:probe|summary|tmp|run)-/;
const PROTECTED_NAME = /(?:audit|evidence|receipt)/i;
function containsProtectedArtifact(path: string): boolean {
  if (PROTECTED_NAME.test(path) || existsSync(join(path, ".helix-audit-evidence"))) return true;
  if (!statSync(path).isDirectory()) return false;
  return readdirSync(path).some((name) => containsProtectedArtifact(join(path, name)));
}
export function findTmpGcCandidates(
  root: string,
  nowMs: number,
  maxAgeMs: number,
): TmpGcCandidate[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(root, entry.name);
      const stat = statSync(path);
      const ageMs = Math.max(0, nowMs - stat.mtimeMs);
      return GC_NAME_ALLOWLIST.test(entry.name) &&
        !containsProtectedArtifact(path) &&
        ageMs > maxAgeMs
        ? [{ path: relative(root, path), ageMs, size: stat.size }]
        : [];
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}
export function gcTmp(root: string, nowMs: number, maxAgeMs: number, apply = false) {
  const candidates = findTmpGcCandidates(root, nowMs, maxAgeMs);
  if (apply)
    for (const row of candidates) rmSync(join(root, row.path), { recursive: true, force: true });
  return { root, apply, candidates, removed: apply ? candidates.length : 0 };
}
