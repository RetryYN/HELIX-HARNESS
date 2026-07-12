import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { hostname, platform } from "node:os";
import { join } from "node:path";

const LOCK_SCHEMA = "closure-materialization-lock.v2" as const;

interface LockOwner {
  schema_version: typeof LOCK_SCHEMA;
  token: string;
  pid: number;
  host: string;
  process_start_id: string;
  acquired_at: string;
  repository_realpath: string;
}

export interface ClosureMaterializationLock {
  path: string;
  token: string;
  processStartId: string;
}

function fsyncDirectory(path: string): void {
  // Windows does not expose a portable directory fsync through Node. File fsync + same-volume
  // atomic rename is the supported durability boundary there; POSIX additionally fsyncs parent dirs.
  if (platform() === "win32") return;
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function linuxProcessStartId(pid: number): string {
  const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
  const close = stat.lastIndexOf(")");
  if (close < 0) throw new Error(`process identity malformed pid=${pid}`);
  const fields = stat
    .slice(close + 2)
    .trim()
    .split(/\s+/);
  const startTime = fields[19];
  if (!startTime || !/^\d+$/.test(startTime))
    throw new Error(`process identity malformed pid=${pid}`);
  return `linux:${startTime}`;
}

export function readProcessIdentity(pid: number): string {
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error(`invalid process pid=${pid}`);
  if (platform() === "linux") return linuxProcessStartId(pid);
  if (platform() === "win32") {
    const script = `(Get-Process -Id ${pid} -ErrorAction Stop).StartTime.ToUniversalTime().Ticks`;
    const created = execFileSync(
      "powershell.exe",
      ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
      { encoding: "utf8", windowsHide: true },
    ).trim();
    if (!created) throw new Error(`process identity malformed pid=${pid}`);
    return `win32:${created}`;
  }
  const started = execFileSync("ps", ["-p", String(pid), "-o", "lstart="], {
    encoding: "utf8",
  }).trim();
  if (!started) throw new Error(`process identity unavailable pid=${pid}`);
  return `darwin:${started}`;
}

function parseOwner(path: string): LockOwner {
  if (lstatSync(path).isSymbolicLink()) throw new Error("materialization lock symlinkは禁止");
  const ownerPath = join(path, "owner.json");
  if (lstatSync(ownerPath).isSymbolicLink())
    throw new Error("materialization lock owner symlinkは禁止");
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(ownerPath, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`materialization lock schema不正: ${detail}`);
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("materialization lock schema不正");
  const row = value as Record<string, unknown>;
  const keys = Object.keys(row).sort().join(",");
  if (
    keys !== "acquired_at,host,pid,process_start_id,repository_realpath,schema_version,token" ||
    row.schema_version !== LOCK_SCHEMA ||
    typeof row.token !== "string" ||
    !Number.isSafeInteger(row.pid) ||
    (row.pid as number) <= 0 ||
    typeof row.host !== "string" ||
    typeof row.process_start_id !== "string" ||
    typeof row.acquired_at !== "string" ||
    typeof row.repository_realpath !== "string"
  )
    throw new Error("materialization lock schema不正");
  return row as unknown as LockOwner;
}

function removeClaim(path: string, stateDir: string): void {
  rmSync(path, { recursive: true, force: true });
  fsyncDirectory(stateDir);
}

function ownerIsActive(owner: LockOwner, repoRoot: string): boolean {
  if (owner.host !== hostname()) throw new Error("remote host materialization lockは回収不可");
  if (owner.repository_realpath !== realpathSync(repoRoot))
    throw new Error("materialization lock repository不一致");
  try {
    return readProcessIdentity(owner.pid) === owner.process_start_id;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ESRCH" || code === "1") return false;
    throw new Error(`materialization lockを検証できない pid=${owner.pid}`);
  }
}

export function acquireClosureMaterializationLock(repoRoot: string): ClosureMaterializationLock {
  const stateDir = join(repoRoot, ".helix/state");
  mkdirSync(stateDir, { recursive: true });
  if (lstatSync(stateDir).isSymbolicLink())
    throw new Error("materialization lock dir symlinkは禁止");
  const path = join(stateDir, "closure-materialization.lock");
  const token = randomUUID();
  const processStartId = readProcessIdentity(process.pid);
  const claim = join(stateDir, `.closure-materialization.claim-${token}`);
  mkdirSync(claim, { mode: 0o700 });
  const owner: LockOwner = {
    schema_version: LOCK_SCHEMA,
    token,
    pid: process.pid,
    host: hostname(),
    process_start_id: processStartId,
    acquired_at: new Date().toISOString(),
    repository_realpath: realpathSync(repoRoot),
  };
  const temp = join(claim, `owner.json.tmp-${token}`);
  const fd = openSync(temp, "wx", 0o600);
  try {
    writeFileSync(fd, JSON.stringify(owner));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(temp, join(claim, "owner.json"));
  fsyncDirectory(claim);
  fsyncDirectory(stateDir);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      renameSync(claim, path);
      fsyncDirectory(stateDir);
      return { path, token, processStartId };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      const windowsCollision =
        platform() === "win32" && (code === "EPERM" || code === "EACCES") && existsSync(path);
      if (code !== "EEXIST" && code !== "ENOTEMPTY" && !windowsCollision) {
        removeClaim(claim, stateDir);
        throw error;
      }
      const current = parseOwner(path);
      if (ownerIsActive(current, repoRoot)) {
        removeClaim(claim, stateDir);
        throw new Error(`closure materialization already running pid=${current.pid}`);
      }
      const tombstone = join(stateDir, `.closure-materialization.stale-${randomUUID()}`);
      renameSync(path, tombstone);
      fsyncDirectory(stateDir);
      removeClaim(tombstone, stateDir);
    }
  }
  removeClaim(claim, stateDir);
  throw new Error("closure materialization lock acquisition exhausted");
}

export function releaseClosureMaterializationLock(lock: ClosureMaterializationLock): void {
  if (!existsSync(lock.path)) return;
  const owner = parseOwner(lock.path);
  if (owner.token !== lock.token || owner.process_start_id !== lock.processStartId)
    throw new Error("materialization lock ownership不一致");
  const stateDir = join(lock.path, "..");
  const tombstone = join(stateDir, `.closure-materialization.release-${randomUUID()}`);
  renameSync(lock.path, tombstone);
  fsyncDirectory(stateDir);
  removeClaim(tombstone, stateDir);
}
