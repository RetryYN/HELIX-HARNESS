import type { Dirent } from "node:fs";
import {
  closeSync,
  constants,
  fstatSync,
  openSync,
  readdirSync,
  readSync,
  realpathSync,
} from "node:fs";
import { basename, isAbsolute, join } from "node:path";
import { isSecretLike } from "../security/secret-policy";
import { isWrapperLaunchExecution, type WrapperLaunchExecution } from "./adapter";
import { type Sha256Digest, sha256Digest } from "./digest";

const MAX_SCOPE_FILE_BYTES = 4 * 1024 * 1024;
const MAX_SCOPE_TOTAL_BYTES = 16 * 1024 * 1024;

export type WorkerTaskSensitivity = "secret" | "non_secret" | "unknown";

export type WorkerIsolationPolicyFailureCode =
  | "WORKER_ISOLATION_EGRESS_UNSUPPORTED"
  | "WORKER_ISOLATION_POLICY_UNRESOLVED"
  | "WORKER_ISOLATION_SCOPE_INVALID"
  | "WORKER_ISOLATION_SCOPE_VIOLATION"
  | "WORKER_ISOLATION_SECRET_TASK_DENIED";

export interface WorkerIsolationPolicyRequest {
  wrapperLaunch: WrapperLaunchExecution;
  task_sensitivity: WorkerTaskSensitivity;
  writable_paths: readonly string[];
  allowed_egress_hosts: readonly string[];
}

export interface WorkerIsolationPolicyCapability {
  readonly kind: "worker_isolation_policy";
  readonly wrapper_origin_digest: Sha256Digest;
  readonly task_sensitivity: "non_secret";
  readonly writable_paths: readonly string[];
  readonly egress: { readonly mode: "deny_all" };
}

export interface WorkerIsolationBaselineEntry {
  path: string;
  size: number;
  digest: Sha256Digest;
}

export type WorkerIsolationPolicyResult =
  | WorkerIsolationPolicyCapability
  | { isolated: false; failure_code: WorkerIsolationPolicyFailureCode };

export type WorkerIsolationScopeAuditResult =
  | { ok: true; changed_paths: readonly string[] }
  | { ok: false; failure_code: "WORKER_ISOLATION_SCOPE_VIOLATION" };

const policyCapabilities = new WeakSet<WorkerIsolationPolicyCapability>();

function policyFailure(failure_code: WorkerIsolationPolicyFailureCode): {
  isolated: false;
  failure_code: WorkerIsolationPolicyFailureCode;
} {
  return { isolated: false, failure_code };
}

function normalizeWritablePath(value: string): string | undefined {
  const normalized = value.replaceAll("\\", "/");
  const directory = normalized.endsWith("/");
  const body = directory ? normalized.slice(0, -1) : normalized;
  const parts = body.split("/");
  if (body.length === 0) return undefined;
  if (
    body.includes("\0") ||
    isAbsolute(body) ||
    /^[A-Za-z]:\//u.test(body) ||
    parts.some(
      (part) =>
        part.length === 0 || part === "." || part === ".." || part === ".git" || part === ".helix",
    ) ||
    basename(body) === "harness.db"
  ) {
    return undefined;
  }
  return directory ? `${body}/` : body;
}

function pathIsWritable(path: string, writablePaths: readonly string[]): boolean {
  return writablePaths.some((scope) =>
    scope.endsWith("/") ? path.startsWith(scope) : path === scope,
  );
}

export function attestWorkerIsolationPolicy(
  request: WorkerIsolationPolicyRequest,
): WorkerIsolationPolicyResult {
  if (!isWrapperLaunchExecution(request.wrapperLaunch)) {
    return policyFailure("WORKER_ISOLATION_POLICY_UNRESOLVED");
  }
  if (
    request.task_sensitivity !== "non_secret" ||
    isSecretLike(request.wrapperLaunch.stdin ?? "") ||
    request.wrapperLaunch.invocation.args.some((argument) => isSecretLike(argument))
  ) {
    return policyFailure("WORKER_ISOLATION_SECRET_TASK_DENIED");
  }
  if (request.allowed_egress_hosts.length > 0) {
    return policyFailure("WORKER_ISOLATION_EGRESS_UNSUPPORTED");
  }
  const normalizedPaths: string[] = [];
  for (const path of request.writable_paths) {
    const normalized = normalizeWritablePath(path);
    if (!normalized) return policyFailure("WORKER_ISOLATION_SCOPE_INVALID");
    normalizedPaths.push(normalized);
  }
  const capability = Object.freeze({
    kind: "worker_isolation_policy" as const,
    wrapper_origin_digest: request.wrapperLaunch.capability.origin_digest,
    task_sensitivity: "non_secret" as const,
    writable_paths: Object.freeze([...new Set(normalizedPaths)].sort()),
    egress: Object.freeze({ mode: "deny_all" as const }),
  });
  policyCapabilities.add(capability);
  return capability;
}

export function isWorkerIsolationPolicyCapability(
  value: unknown,
): value is WorkerIsolationPolicyCapability {
  return (
    typeof value === "object" &&
    value !== null &&
    policyCapabilities.has(value as WorkerIsolationPolicyCapability)
  );
}

function captureScopeFile(path: string): { size: number; digest: Sha256Digest } | undefined {
  let descriptor: number | undefined;
  try {
    descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const before = fstatSync(descriptor);
    if (!before.isFile() || before.size > MAX_SCOPE_FILE_BYTES) return undefined;
    const bytes = Buffer.alloc(before.size);
    let offset = 0;
    while (offset < bytes.byteLength) {
      const count = readSync(descriptor, bytes, offset, bytes.byteLength - offset, offset);
      if (count === 0) break;
      offset += count;
    }
    const after = fstatSync(descriptor);
    if (offset !== bytes.byteLength || after.size !== before.size || !after.isFile())
      return undefined;
    return { size: bytes.byteLength, digest: sha256Digest(bytes) };
  } catch {
    return undefined;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function scanWorkspace(
  workspacePath: string,
): Map<string, { size: number; digest: Sha256Digest }> | undefined {
  let root: string;
  try {
    root = realpathSync(workspacePath);
  } catch {
    return undefined;
  }
  const files = new Map<string, { size: number; digest: Sha256Digest }>();
  let totalBytes = 0;
  const visit = (directory: string, prefix: string): boolean => {
    let entries: Dirent<string>[];
    try {
      entries = readdirSync(directory, { withFileTypes: true, encoding: "utf8" });
    } catch {
      return false;
    }
    for (const entry of entries) {
      const relativePath = prefix.length > 0 ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(directory, entry.name);
      if (entry.isSymbolicLink()) return false;
      if (entry.isDirectory()) {
        if (!visit(absolutePath, relativePath)) return false;
        continue;
      }
      if (!entry.isFile()) return false;
      const captured = captureScopeFile(absolutePath);
      if (!captured) return false;
      totalBytes += captured.size;
      if (totalBytes > MAX_SCOPE_TOTAL_BYTES) return false;
      files.set(relativePath, captured);
    }
    return true;
  };
  return visit(root, "") ? files : undefined;
}

export function auditWorkerIsolationScope(
  workspacePath: string,
  baseline: readonly WorkerIsolationBaselineEntry[],
  writablePaths: readonly string[],
): WorkerIsolationScopeAuditResult {
  const current = scanWorkspace(workspacePath);
  if (!current) return { ok: false, failure_code: "WORKER_ISOLATION_SCOPE_VIOLATION" };
  const before = new Map(baseline.map((entry) => [entry.path, entry]));
  const changedPaths = [...new Set([...before.keys(), ...current.keys()])]
    .filter((path) => {
      const previous = before.get(path);
      const next = current.get(path);
      return !previous || !next || previous.size !== next.size || previous.digest !== next.digest;
    })
    .sort();
  if (changedPaths.some((path) => !pathIsWritable(path, writablePaths))) {
    return { ok: false, failure_code: "WORKER_ISOLATION_SCOPE_VIOLATION" };
  }
  return { ok: true, changed_paths: changedPaths };
}
