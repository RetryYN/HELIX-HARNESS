import { type SpawnSyncOptionsWithStringEncoding, spawnSync } from "node:child_process";
import {
  accessSync,
  constants,
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { isWrapperLaunchExecution, type WrapperLaunchExecution } from "./adapter";
import { type Sha256Digest, sha256Digest } from "./digest";
import {
  isWorkerAdmissionCurrent,
  type WorkerDescriptorAdmissionDecisionV1,
  type WorkerDescriptorRequestV1,
  type WorkerRegistrySnapshotV1,
} from "./worker-descriptor-admission";

const MAX_INPUT_FILE_BYTES = 4 * 1024 * 1024;
const MAX_INPUT_TOTAL_BYTES = 16 * 1024 * 1024;
const SANDBOX_WORKSPACE = "/workspace";
const SANDBOX_PROVIDER = "/helix-provider/worker";
const FIXED_ENVIRONMENT = {
  HOME: SANDBOX_WORKSPACE,
  LANG: "C.UTF-8",
  PATH: "/usr/bin:/bin",
  TMPDIR: "/tmp",
} as const;

export type WorkerIsolationFailureCode =
  | "WORKER_ISOLATION_ADMISSION_STALE"
  | "WORKER_ISOLATION_BACKEND_UNAVAILABLE"
  | "WORKER_ISOLATION_BOUNDARY_INVALID"
  | "WORKER_ISOLATION_LAUNCH_UNSEALED"
  | "WORKER_ISOLATION_PLATFORM_UNSUPPORTED"
  | "WORKER_ISOLATION_RUNTIME_INVALID"
  | "WORKER_ISOLATION_SOURCE_REJECTED"
  | "WORKER_ISOLATION_WRAPPER_UNADMITTED";

export interface WorkerAdmissionBinding {
  request: WorkerDescriptorRequestV1;
  snapshot: WorkerRegistrySnapshotV1;
  decision: WorkerDescriptorAdmissionDecisionV1;
}

export interface WorkerIsolationPrepareRequest {
  repoRoot: string;
  scratchBaseDir: string;
  inputPaths: readonly string[];
  wrapperLaunch: WrapperLaunchExecution;
  admission: WorkerAdmissionBinding;
  platform?: NodeJS.Platform;
  backendPath?: string;
}

export interface WorkerIsolationInputManifestEntry {
  path: string;
  size: number;
  digest: Sha256Digest;
}

export interface WorkerIsolationLaunch {
  readonly schema_version: "helix-worker-isolation-launch.v1";
  readonly backend_path: string;
  readonly scratch_path: string;
  readonly input_manifest: readonly WorkerIsolationInputManifestEntry[];
  readonly wrapper_launch: WrapperLaunchExecution;
}

export type WorkerIsolationPrepareResult =
  | { isolated: false; failure_code: WorkerIsolationFailureCode }
  | { isolated: true; launch: WorkerIsolationLaunch };

export type WorkerIsolationRunResult =
  | { isolated: false; failure_code: WorkerIsolationFailureCode }
  | {
      isolated: true;
      status: number | null;
      stdout: string;
      stderr: string;
      environment_keys: readonly string[];
    };

interface SpawnResult {
  status: number | null;
  stdout?: string | Buffer;
  stderr?: string | Buffer;
}

export type IsolationSpawn = (
  command: string,
  args: readonly string[],
  options: SpawnSyncOptionsWithStringEncoding,
) => SpawnResult;

const sealedLaunches = new WeakSet<WorkerIsolationLaunch>();

function failure(failure_code: WorkerIsolationFailureCode): WorkerIsolationPrepareResult {
  return { isolated: false, failure_code };
}

function isWithin(parent: string, candidate: string): boolean {
  const delta = relative(parent, candidate);
  return delta === "" || (!delta.startsWith(`..${sep}`) && delta !== ".." && !isAbsolute(delta));
}

function executable(path: string | undefined): path is string {
  if (!path || !isAbsolute(path)) return false;
  try {
    accessSync(path, constants.X_OK);
    return lstatSync(path).isFile();
  } catch {
    return false;
  }
}

function safeInputPath(repoRoot: string, inputPath: string): string | undefined {
  if (
    inputPath.length === 0 ||
    inputPath.includes("\0") ||
    isAbsolute(inputPath) ||
    inputPath
      .split(/[\\/]/u)
      .some((part) => part === ".." || part === ".git" || part === ".helix") ||
    basename(inputPath) === "harness.db"
  ) {
    return undefined;
  }
  const candidate = resolve(repoRoot, inputPath);
  if (!isWithin(repoRoot, candidate)) return undefined;
  let cursor = candidate;
  try {
    while (cursor !== repoRoot) {
      const stat = lstatSync(cursor);
      if (stat.isSymbolicLink()) return undefined;
      cursor = dirname(cursor);
    }
    if (!lstatSync(candidate).isFile()) return undefined;
    return candidate;
  } catch {
    return undefined;
  }
}

export function prepareWorkerIsolationLaunch(
  request: WorkerIsolationPrepareRequest,
): WorkerIsolationPrepareResult {
  if ((request.platform ?? process.platform) !== "linux") {
    return failure("WORKER_ISOLATION_PLATFORM_UNSUPPORTED");
  }
  if (!executable(request.backendPath)) return failure("WORKER_ISOLATION_BACKEND_UNAVAILABLE");
  if (!isWrapperLaunchExecution(request.wrapperLaunch)) {
    return failure("WORKER_ISOLATION_WRAPPER_UNADMITTED");
  }
  if (
    request.admission.decision.disposition !== "admitted" ||
    !isWorkerAdmissionCurrent(
      request.admission.decision,
      request.admission.request,
      request.admission.snapshot,
    )
  ) {
    return failure("WORKER_ISOLATION_ADMISSION_STALE");
  }

  let repoRoot: string;
  let scratchBase: string;
  try {
    repoRoot = realpathSync(request.repoRoot);
    mkdirSync(request.scratchBaseDir, { recursive: true, mode: 0o700 });
    scratchBase = realpathSync(request.scratchBaseDir);
  } catch {
    return failure("WORKER_ISOLATION_BOUNDARY_INVALID");
  }
  if (isWithin(repoRoot, scratchBase) || isWithin(scratchBase, repoRoot)) {
    return failure("WORKER_ISOLATION_BOUNDARY_INVALID");
  }
  if (!executable(request.wrapperLaunch.invocation.command)) {
    return failure("WORKER_ISOLATION_RUNTIME_INVALID");
  }

  const resolvedInputs: Array<{ source: string; path: string; bytes: Buffer }> = [];
  let totalBytes = 0;
  const uniquePaths = new Set<string>();
  for (const inputPath of request.inputPaths) {
    const normalized = inputPath.replaceAll("\\", "/");
    if (uniquePaths.has(normalized)) return failure("WORKER_ISOLATION_SOURCE_REJECTED");
    uniquePaths.add(normalized);
    const source = safeInputPath(repoRoot, inputPath);
    if (!source) return failure("WORKER_ISOLATION_SOURCE_REJECTED");
    const bytes = readFileSync(source);
    totalBytes += bytes.byteLength;
    if (bytes.byteLength > MAX_INPUT_FILE_BYTES || totalBytes > MAX_INPUT_TOTAL_BYTES) {
      return failure("WORKER_ISOLATION_SOURCE_REJECTED");
    }
    resolvedInputs.push({ source, path: normalized, bytes });
  }

  const scratchPath = mkdtempSync(join(scratchBase, "worker-"));
  const inputManifest = resolvedInputs.map(({ source, path, bytes }) => {
    const destination = join(scratchPath, path);
    mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
    copyFileSync(source, destination);
    return { path, size: bytes.byteLength, digest: sha256Digest(bytes) };
  });
  const launch: WorkerIsolationLaunch = Object.freeze({
    schema_version: "helix-worker-isolation-launch.v1",
    backend_path: request.backendPath,
    scratch_path: scratchPath,
    input_manifest: Object.freeze(inputManifest),
    wrapper_launch: request.wrapperLaunch,
  });
  sealedLaunches.add(launch);
  return { isolated: true, launch };
}

function sandboxArguments(launch: WorkerIsolationLaunch): string[] {
  const invocation = launch.wrapper_launch.invocation;
  return [
    "--unshare-user",
    "--unshare-pid",
    "--unshare-ipc",
    "--unshare-uts",
    "--die-with-parent",
    "--new-session",
    "--clearenv",
    "--ro-bind",
    "/usr",
    "/usr",
    "--symlink",
    "usr/bin",
    "/bin",
    "--symlink",
    "usr/lib",
    "/lib",
    "--symlink",
    "usr/lib64",
    "/lib64",
    "--proc",
    "/proc",
    "--dev",
    "/dev",
    "--tmpfs",
    "/tmp",
    "--bind",
    launch.scratch_path,
    SANDBOX_WORKSPACE,
    "--ro-bind",
    invocation.command,
    SANDBOX_PROVIDER,
    "--chdir",
    SANDBOX_WORKSPACE,
    ...Object.entries(FIXED_ENVIRONMENT).flatMap(([key, value]) => ["--setenv", key, value]),
    "--",
    SANDBOX_PROVIDER,
    ...invocation.args,
  ];
}

export function runWorkerIsolationLaunch(
  launch: WorkerIsolationLaunch,
  spawn: IsolationSpawn = (command, args, options) => spawnSync(command, args, options),
): WorkerIsolationRunResult {
  if (!sealedLaunches.has(launch)) {
    return { isolated: false, failure_code: "WORKER_ISOLATION_LAUNCH_UNSEALED" };
  }
  const result = spawn(launch.backend_path, sandboxArguments(launch), {
    encoding: "utf8",
    env: {},
    input: launch.wrapper_launch.stdin,
    maxBuffer: 8 * 1024 * 1024,
    timeout: 10 * 60 * 1000,
  });
  return {
    isolated: true,
    status: result.status,
    stdout: String(result.stdout ?? ""),
    stderr: String(result.stderr ?? ""),
    environment_keys: Object.keys(FIXED_ENVIRONMENT).sort(),
  };
}
