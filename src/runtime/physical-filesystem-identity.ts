import type { BigIntStats } from "node:fs";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

export const PHYSICAL_FILESYSTEM_IDENTITY_SCHEMA_VERSION = "helix-physical-filesystem-identity.v1";

const MAX_TARGET_COUNT = 128;
const NO_FOLLOW = constants.O_NOFOLLOW ?? 0;

export type PhysicalFilesystemFailureCode =
  | "PHYSICAL_TARGET_REPO_ROOT_INVALID"
  | "PHYSICAL_TARGET_PATH_INVALID"
  | "PHYSICAL_TARGET_NOT_FOUND"
  | "PHYSICAL_TARGET_NOT_REGULAR"
  | "PHYSICAL_TARGET_SYMLINK_OR_JUNCTION"
  | "PHYSICAL_TARGET_BOUNDARY_ESCAPE"
  | "PHYSICAL_TARGET_MOUNT_BOUNDARY"
  | "PHYSICAL_TARGET_MOUNT_UNVERIFIED"
  | "PHYSICAL_TARGET_HARDLINK_AMBIGUOUS"
  | "PHYSICAL_TARGET_SET_UNRESOLVED"
  | "PHYSICAL_TARGET_DUPLICATE"
  | "PHYSICAL_TARGET_IDENTITY_DRIFT"
  | "PHYSICAL_TARGET_PLATFORM_UNSUPPORTED";

type PhysicalTargetType = "file" | "directory";

interface PhysicalStatIdentity {
  readonly device: string;
  readonly inode: string;
  readonly mode: string;
  readonly nlink: string;
  readonly size: string;
  readonly mtime_ns: string;
  readonly ctime_ns: string;
  readonly type: PhysicalTargetType;
}

export interface PhysicalFilesystemTargetIdentity {
  readonly lexical_target: string;
  readonly physical_relative_path: string;
  readonly stat: PhysicalStatIdentity;
  readonly target_digest: Sha256Digest;
}

export interface PhysicalFilesystemIdentityRequest {
  readonly repo_root: string;
  readonly lexical_targets: readonly string[];
  readonly expected_target_count?: number;
}

export interface PhysicalFilesystemTargetSafetyInput {
  readonly root: string;
  readonly physical: string;
  readonly root_device: string;
  readonly observed_device?: string;
  readonly mount_points: ReadonlySet<string>;
}

export interface PhysicalFilesystemIdentityReceipt {
  readonly schema_version: typeof PHYSICAL_FILESYSTEM_IDENTITY_SCHEMA_VERSION;
  readonly status: "allow_candidate" | "blocked" | "unresolved";
  readonly target_count: number;
  readonly expected_target_count: number;
  readonly repository_identity_digest: Sha256Digest | null;
  readonly target_set_digest: Sha256Digest | null;
  readonly identity_digest: Sha256Digest | null;
  readonly targets: readonly PhysicalFilesystemTargetIdentity[];
  readonly reason_codes: readonly PhysicalFilesystemFailureCode[];
}

export interface PhysicalFilesystemIdentityBinding {
  readonly kind: "physical_filesystem_identity_binding";
  readonly schema_version: typeof PHYSICAL_FILESYSTEM_IDENTITY_SCHEMA_VERSION;
  readonly repo_root_digest: Sha256Digest;
  readonly lexical_targets: readonly string[];
  readonly expected_target_count: number;
  readonly target_set_digest: Sha256Digest;
  readonly identity_digest: Sha256Digest;
}

export type PhysicalFilesystemIdentityResult =
  | {
      readonly ok: true;
      readonly binding: PhysicalFilesystemIdentityBinding;
      readonly receipt: PhysicalFilesystemIdentityReceipt;
    }
  | {
      readonly ok: false;
      readonly failure_code: PhysicalFilesystemFailureCode;
      readonly receipt: PhysicalFilesystemIdentityReceipt;
    };

const bindings = new WeakSet<PhysicalFilesystemIdentityBinding>();

function emptyReceipt(
  status: PhysicalFilesystemIdentityReceipt["status"],
  targetCount: number,
  options: {
    readonly expectedTargetCount: number;
    readonly reasonCodes: readonly PhysicalFilesystemFailureCode[];
    readonly repositoryIdentityDigest?: Sha256Digest | null;
  },
): PhysicalFilesystemIdentityReceipt {
  return Object.freeze({
    schema_version: PHYSICAL_FILESYSTEM_IDENTITY_SCHEMA_VERSION,
    status,
    target_count: targetCount,
    expected_target_count: options.expectedTargetCount,
    repository_identity_digest: options.repositoryIdentityDigest ?? null,
    target_set_digest: null,
    identity_digest: null,
    targets: Object.freeze([]),
    reason_codes: Object.freeze([...options.reasonCodes]),
  });
}

function failure(
  failureCode: PhysicalFilesystemFailureCode,
  targetCount: number,
  options: {
    readonly expectedTargetCount: number;
    readonly status?: "blocked" | "unresolved";
    readonly repositoryIdentityDigest?: Sha256Digest | null;
  },
): PhysicalFilesystemIdentityResult {
  return {
    ok: false,
    failure_code: failureCode,
    receipt: emptyReceipt(options.status ?? "blocked", targetCount, {
      expectedTargetCount: options.expectedTargetCount,
      reasonCodes: [failureCode],
      repositoryIdentityDigest: options.repositoryIdentityDigest,
    }),
  };
}

function normalizedLexicalTarget(value: string): string | undefined {
  if (
    value.length === 0 ||
    value.includes("\0") ||
    value.includes("\\") ||
    isAbsolute(value) ||
    /^[A-Za-z]:/u.test(value) ||
    /[*?{}[\]$`]/u.test(value)
  ) {
    return undefined;
  }
  const parts = value.split("/");
  if (
    parts.some(
      (part) =>
        part.length === 0 ||
        part === "." ||
        part === ".." ||
        part === ".git" ||
        part === ".helix" ||
        part === "harness.db",
    )
  ) {
    return undefined;
  }
  return value;
}

function pathWithin(root: string, target: string): boolean {
  const child = relative(root, target);
  return child !== "" && !child.startsWith(`..${sep}`) && child !== ".." && !isAbsolute(child);
}

function statIdentity(stat: BigIntStats): PhysicalStatIdentity | undefined {
  const type: PhysicalTargetType | undefined = stat.isFile()
    ? "file"
    : stat.isDirectory()
      ? "directory"
      : undefined;
  if (!type) return undefined;
  return {
    device: String(stat.dev),
    inode: String(stat.ino),
    mode: String(stat.mode),
    nlink: String(stat.nlink),
    size: String(stat.size),
    mtime_ns: String(stat.mtimeNs),
    ctime_ns: String(stat.ctimeNs),
    type,
  };
}

function decodeMountInfoPath(value: string): string {
  return value.replace(/\\([0-7]{3})/gu, (_match, octal: string) =>
    String.fromCharCode(Number.parseInt(octal, 8)),
  );
}

function loadMountPoints(): ReadonlySet<string> | undefined {
  if (process.platform !== "linux") return undefined;
  try {
    const mountPoints = new Set<string>();
    for (const line of readFileSync("/proc/self/mountinfo", "utf8").split("\n")) {
      if (line.length === 0) continue;
      const fields = line.split(" ");
      if (fields.length < 6) return undefined;
      const mountPoint = decodeMountInfoPath(fields[4] ?? "");
      if (!mountPoint.startsWith("/")) return undefined;
      mountPoints.add(resolve(mountPoint));
    }
    return mountPoints;
  } catch {
    return undefined;
  }
}

function hasMountBoundary(root: string, target: string, mountPoints: ReadonlySet<string>): boolean {
  let cursor = target;
  while (cursor !== root) {
    if (mountPoints.has(cursor)) return true;
    cursor = dirname(cursor);
  }
  return false;
}

export function evaluatePhysicalFilesystemTargetSafety(
  input: PhysicalFilesystemTargetSafetyInput,
): PhysicalFilesystemFailureCode | null {
  if (!pathWithin(input.root, input.physical)) {
    return "PHYSICAL_TARGET_BOUNDARY_ESCAPE";
  }
  if (hasMountBoundary(input.root, input.physical, input.mount_points)) {
    return "PHYSICAL_TARGET_MOUNT_BOUNDARY";
  }
  if (input.observed_device === undefined) {
    return "PHYSICAL_TARGET_NOT_REGULAR";
  }
  if (input.observed_device !== input.root_device) {
    return "PHYSICAL_TARGET_MOUNT_BOUNDARY";
  }
  return null;
}

function hasSymlinkAncestor(root: string, target: string): boolean {
  let cursor = target;
  while (cursor !== root) {
    try {
      if (lstatSync(cursor).isSymbolicLink()) return true;
    } catch {
      return true;
    }
    cursor = dirname(cursor);
  }
  return false;
}

function openAndReattest(
  target: string,
  expected: PhysicalStatIdentity,
): PhysicalStatIdentity | undefined {
  let descriptor: number | undefined;
  try {
    descriptor = openSync(target, constants.O_RDONLY | NO_FOLLOW);
    const opened = fstatSync(descriptor, { bigint: true });
    const current = statIdentity(opened);
    if (!current || canonicalJson(current) !== canonicalJson(expected)) return undefined;
    if (process.platform === "linux") {
      const openedPhysical = realpathSync(`/proc/self/fd/${descriptor}`);
      if (openedPhysical !== target) return undefined;
    }
    return current;
  } catch {
    return undefined;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function repositoryRootIdentity(root: string):
  | {
      readonly digest: Sha256Digest;
      readonly stat: PhysicalStatIdentity;
    }
  | undefined {
  try {
    const stat = statIdentity(lstatSync(root, { bigint: true }));
    if (stat?.type !== "directory") return undefined;
    return {
      stat,
      digest: sha256Digest(canonicalJson({ root: stat })),
    };
  } catch {
    return undefined;
  }
}

function targetEntry(
  root: string,
  lexicalTarget: string,
  options: {
    readonly rootStat: PhysicalStatIdentity;
    readonly mountPoints: ReadonlySet<string>;
  },
):
  | { ok: true; target: PhysicalFilesystemTargetIdentity }
  | { ok: false; code: PhysicalFilesystemFailureCode } {
  const { rootStat, mountPoints } = options;
  const candidate = resolve(root, lexicalTarget);
  if (!pathWithin(root, candidate)) return { ok: false, code: "PHYSICAL_TARGET_BOUNDARY_ESCAPE" };
  if (hasSymlinkAncestor(root, candidate)) {
    return { ok: false, code: "PHYSICAL_TARGET_SYMLINK_OR_JUNCTION" };
  }
  let physical: string;
  let observed: PhysicalStatIdentity | undefined;
  try {
    physical = realpathSync(candidate);
    observed = statIdentity(lstatSync(candidate, { bigint: true }));
  } catch {
    return { ok: false, code: "PHYSICAL_TARGET_NOT_FOUND" };
  }
  const safetyFailure = evaluatePhysicalFilesystemTargetSafety({
    root,
    physical,
    root_device: rootStat.device,
    observed_device: observed?.device,
    mount_points: mountPoints,
  });
  if (safetyFailure) {
    return { ok: false, code: safetyFailure };
  }
  if (!observed) {
    return { ok: false, code: "PHYSICAL_TARGET_NOT_REGULAR" };
  }
  if (observed.type === "file" && BigInt(observed.nlink) > 1n) {
    return { ok: false, code: "PHYSICAL_TARGET_HARDLINK_AMBIGUOUS" };
  }
  const reattested = openAndReattest(candidate, observed);
  if (!reattested) return { ok: false, code: "PHYSICAL_TARGET_IDENTITY_DRIFT" };
  const physicalRelativePath = relative(root, physical).replaceAll("\\", "/");
  const targetDigest = sha256Digest(
    canonicalJson({
      lexical_target: lexicalTarget,
      physical_relative_path: physicalRelativePath,
      stat: reattested,
    }),
  );
  return {
    ok: true,
    target: Object.freeze({
      lexical_target: lexicalTarget,
      physical_relative_path: physicalRelativePath,
      stat: Object.freeze(reattested),
      target_digest: targetDigest,
    }),
  };
}

function buildBinding(
  rootDigest: Sha256Digest,
  lexicalTargets: readonly string[],
  options: {
    readonly expectedTargetCount: number;
    readonly targets: readonly PhysicalFilesystemTargetIdentity[];
  },
): { binding: PhysicalFilesystemIdentityBinding; receipt: PhysicalFilesystemIdentityReceipt } {
  const { expectedTargetCount, targets } = options;
  const sortedTargets = [...targets].sort((left, right) =>
    left.lexical_target < right.lexical_target
      ? -1
      : left.lexical_target > right.lexical_target
        ? 1
        : 0,
  );
  const targetSetDigest = sha256Digest(canonicalJson(sortedTargets));
  const identityDigest = sha256Digest(
    canonicalJson({
      schema_version: PHYSICAL_FILESYSTEM_IDENTITY_SCHEMA_VERSION,
      repo_root_digest: rootDigest,
      expected_target_count: expectedTargetCount,
      target_set_digest: targetSetDigest,
    }),
  );
  const receipt = Object.freeze({
    schema_version: PHYSICAL_FILESYSTEM_IDENTITY_SCHEMA_VERSION,
    status: "allow_candidate" as const,
    target_count: sortedTargets.length,
    expected_target_count: expectedTargetCount,
    repository_identity_digest: rootDigest,
    target_set_digest: targetSetDigest,
    identity_digest: identityDigest,
    targets: Object.freeze(sortedTargets),
    reason_codes: Object.freeze([]),
  });
  const binding = Object.freeze({
    kind: "physical_filesystem_identity_binding" as const,
    schema_version: PHYSICAL_FILESYSTEM_IDENTITY_SCHEMA_VERSION,
    repo_root_digest: rootDigest,
    lexical_targets: Object.freeze([...lexicalTargets]),
    expected_target_count: expectedTargetCount,
    target_set_digest: targetSetDigest,
    identity_digest: identityDigest,
  });
  bindings.add(binding);
  return { binding, receipt };
}

export function isPhysicalFilesystemIdentityBinding(
  value: unknown,
): value is PhysicalFilesystemIdentityBinding {
  return (
    typeof value === "object" &&
    value !== null &&
    bindings.has(value as PhysicalFilesystemIdentityBinding)
  );
}

export function attestPhysicalFilesystemIdentity(
  request: PhysicalFilesystemIdentityRequest,
): PhysicalFilesystemIdentityResult {
  const targetCount = request.lexical_targets.length;
  const expectedTargetCount = request.expected_target_count ?? targetCount;
  if (
    !Number.isSafeInteger(expectedTargetCount) ||
    expectedTargetCount < 1 ||
    targetCount < 1 ||
    targetCount > MAX_TARGET_COUNT ||
    targetCount !== expectedTargetCount
  ) {
    return failure("PHYSICAL_TARGET_SET_UNRESOLVED", targetCount, { expectedTargetCount });
  }
  const normalizedTargets = request.lexical_targets.map(normalizedLexicalTarget);
  if (normalizedTargets.some((target) => target === undefined)) {
    return failure("PHYSICAL_TARGET_PATH_INVALID", targetCount, { expectedTargetCount });
  }
  const lexicalTargets = normalizedTargets as string[];
  if (new Set(lexicalTargets).size !== lexicalTargets.length) {
    return failure("PHYSICAL_TARGET_DUPLICATE", targetCount, { expectedTargetCount });
  }
  let root: string;
  try {
    root = realpathSync(request.repo_root);
  } catch {
    return failure("PHYSICAL_TARGET_REPO_ROOT_INVALID", targetCount, {
      expectedTargetCount,
      status: "unresolved",
    });
  }
  const rootIdentity = repositoryRootIdentity(root);
  if (!rootIdentity) {
    return failure("PHYSICAL_TARGET_REPO_ROOT_INVALID", targetCount, {
      expectedTargetCount,
      status: "unresolved",
    });
  }
  const mountPoints = loadMountPoints();
  if (!mountPoints) {
    return failure(
      process.platform === "linux"
        ? "PHYSICAL_TARGET_MOUNT_UNVERIFIED"
        : "PHYSICAL_TARGET_PLATFORM_UNSUPPORTED",
      targetCount,
      { expectedTargetCount, status: "unresolved", repositoryIdentityDigest: rootIdentity.digest },
    );
  }
  const targets: PhysicalFilesystemTargetIdentity[] = [];
  for (const lexicalTarget of lexicalTargets) {
    const result = targetEntry(root, lexicalTarget, {
      rootStat: rootIdentity.stat,
      mountPoints,
    });
    if (!result.ok) {
      return failure(result.code, targetCount, {
        expectedTargetCount,
        status: result.code === "PHYSICAL_TARGET_IDENTITY_DRIFT" ? "unresolved" : "blocked",
        repositoryIdentityDigest: rootIdentity.digest,
      });
    }
    targets.push(result.target);
  }
  const { binding, receipt } = buildBinding(rootIdentity.digest, lexicalTargets, {
    expectedTargetCount,
    targets,
  });
  return { ok: true, binding, receipt };
}

export function revalidatePhysicalFilesystemIdentity(
  request: PhysicalFilesystemIdentityRequest,
  binding: PhysicalFilesystemIdentityBinding,
): PhysicalFilesystemIdentityResult {
  if (!isPhysicalFilesystemIdentityBinding(binding)) {
    return failure("PHYSICAL_TARGET_IDENTITY_DRIFT", request.lexical_targets.length, {
      expectedTargetCount: request.expected_target_count ?? request.lexical_targets.length,
      status: "unresolved",
    });
  }
  const current = attestPhysicalFilesystemIdentity(request);
  if (!current.ok) return current;
  if (
    current.binding.identity_digest !== binding.identity_digest ||
    current.binding.target_set_digest !== binding.target_set_digest ||
    current.binding.repo_root_digest !== binding.repo_root_digest
  ) {
    return {
      ok: false,
      failure_code: "PHYSICAL_TARGET_IDENTITY_DRIFT",
      receipt: Object.freeze({
        ...current.receipt,
        status: "unresolved" as const,
        identity_digest: current.binding.identity_digest,
        reason_codes: Object.freeze(["PHYSICAL_TARGET_IDENTITY_DRIFT"] as const),
      }),
    };
  }
  return current;
}
