import { type SpawnSyncOptionsWithStringEncoding, spawnSync } from "node:child_process";
import {
  accessSync,
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
  writeFileSync,
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
  authority: WorkerIsolationAuthorityCapability;
  platform?: NodeJS.Platform;
}

export interface WorkerIsolationAuthorityBinding {
  readonly schema_version: "helix-worker-isolation-authority.v1";
  readonly backend_id: "bubblewrap";
  readonly backend_path: string;
  readonly backend_digest: Sha256Digest;
  readonly runtime_id: string;
  readonly runtime_path: string;
  readonly runtime_digest: Sha256Digest;
}

export interface WorkerIsolationAuthorityCapability extends WorkerIsolationAuthorityBinding {
  readonly kind: "worker_isolation_authority";
  readonly authority_root: string;
  readonly catalog_digest: Sha256Digest;
}

export interface WorkerIsolationInputManifestEntry {
  path: string;
  size: number;
  digest: Sha256Digest;
}

export interface WorkerIsolationLaunch {
  readonly schema_version: "helix-worker-isolation-launch.v1";
  readonly backend_digest: Sha256Digest;
  readonly runtime_digest: Sha256Digest;
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
const isolationAuthorities = new WeakSet<WorkerIsolationAuthorityCapability>();
const launchResources = new WeakMap<
  WorkerIsolationLaunch,
  { backendFd: number; runtimeFd: number }
>();

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

function executableDigest(path: string): Sha256Digest | undefined {
  if (!executable(path)) return undefined;
  try {
    return sha256Digest(readFileSync(path));
  } catch {
    return undefined;
  }
}

function captureExecutable(path: string, expectedDigest: Sha256Digest): Buffer | undefined {
  let descriptor: number | undefined;
  try {
    descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const stat = fstatSync(descriptor);
    if (!stat.isFile() || stat.size > 64 * 1024 * 1024) return undefined;
    const bytes = Buffer.alloc(stat.size);
    let offset = 0;
    while (offset < bytes.length) {
      const count = readSync(descriptor, bytes, offset, bytes.length - offset, offset);
      if (count === 0) break;
      offset += count;
    }
    const after = fstatSync(descriptor);
    if (
      offset !== bytes.length ||
      after.size !== stat.size ||
      sha256Digest(bytes) !== expectedDigest
    ) {
      return undefined;
    }
    return bytes;
  } catch {
    return undefined;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

export function attestWorkerIsolationAuthority(
  repoRoot: string,
  binding: WorkerIsolationAuthorityBinding,
):
  | WorkerIsolationAuthorityCapability
  | { isolated: false; failure_code: WorkerIsolationFailureCode } {
  let authorityRoot: string;
  let catalogBytes: Buffer;
  let catalog: {
    schema_version: string;
    backends: Array<{ backend_id: string; digest: Sha256Digest }>;
    runtimes: Array<{ runtime_id: string; digest: Sha256Digest }>;
  };
  try {
    authorityRoot = realpathSync(repoRoot);
    const captured = captureInput(authorityRoot, "config/worker-isolation-runtime-catalog.json");
    if (!captured) throw new Error("runtime catalog is not a bounded regular authority file");
    catalogBytes = captured.bytes;
    catalog = JSON.parse(catalogBytes.toString("utf8")) as typeof catalog;
  } catch {
    return { isolated: false, failure_code: "WORKER_ISOLATION_BACKEND_UNAVAILABLE" };
  }
  if (
    catalog.schema_version !== "helix-worker-isolation-runtime-catalog.v1" ||
    !Array.isArray(catalog.backends) ||
    !Array.isArray(catalog.runtimes) ||
    !catalog.backends.some(
      (entry) => entry.backend_id === binding.backend_id && entry.digest === binding.backend_digest,
    )
  ) {
    return { isolated: false, failure_code: "WORKER_ISOLATION_BACKEND_UNAVAILABLE" };
  }
  if (
    !catalog.runtimes.some(
      (entry) => entry.runtime_id === binding.runtime_id && entry.digest === binding.runtime_digest,
    )
  ) {
    return { isolated: false, failure_code: "WORKER_ISOLATION_RUNTIME_INVALID" };
  }
  const backendDigest = executableDigest(binding.backend_path);
  if (!backendDigest || backendDigest !== binding.backend_digest) {
    return { isolated: false, failure_code: "WORKER_ISOLATION_BACKEND_UNAVAILABLE" };
  }
  const runtimeDigest = executableDigest(binding.runtime_path);
  if (!runtimeDigest || runtimeDigest !== binding.runtime_digest) {
    return { isolated: false, failure_code: "WORKER_ISOLATION_RUNTIME_INVALID" };
  }
  const capability = Object.freeze({
    ...binding,
    kind: "worker_isolation_authority" as const,
    authority_root: authorityRoot,
    catalog_digest: sha256Digest(catalogBytes),
  });
  isolationAuthorities.add(capability);
  return capability;
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

function captureInput(
  repoRoot: string,
  inputPath: string,
): { path: string; bytes: Buffer } | undefined {
  const source = safeInputPath(repoRoot, inputPath);
  if (!source) return undefined;
  let descriptor: number | undefined;
  try {
    descriptor = openSync(source, constants.O_RDONLY | constants.O_NOFOLLOW);
    const openedPath = realpathSync(`/proc/self/fd/${descriptor}`);
    if (!isWithin(repoRoot, openedPath)) return undefined;
    const relativeOpened = relative(repoRoot, openedPath).replaceAll("\\", "/");
    if (
      relativeOpened.split("/").some((part) => part === ".git" || part === ".helix") ||
      basename(relativeOpened) === "harness.db"
    ) {
      return undefined;
    }
    const stat = fstatSync(descriptor);
    if (!stat.isFile() || stat.size > MAX_INPUT_FILE_BYTES) return undefined;
    const bytes = Buffer.alloc(stat.size);
    let offset = 0;
    while (offset < bytes.byteLength) {
      const count = readSync(descriptor, bytes, offset, bytes.byteLength - offset, offset);
      if (count === 0) break;
      offset += count;
    }
    const after = fstatSync(descriptor);
    if (offset !== bytes.byteLength || after.size !== stat.size) return undefined;
    return { path: inputPath.replaceAll("\\", "/"), bytes };
  } catch {
    return undefined;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

export function prepareWorkerIsolationLaunch(
  request: WorkerIsolationPrepareRequest,
): WorkerIsolationPrepareResult {
  if ((request.platform ?? process.platform) !== "linux") {
    return failure("WORKER_ISOLATION_PLATFORM_UNSUPPORTED");
  }
  if (!isolationAuthorities.has(request.authority)) {
    return failure("WORKER_ISOLATION_BACKEND_UNAVAILABLE");
  }
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
  if (request.authority.authority_root !== repoRoot) {
    return failure("WORKER_ISOLATION_BOUNDARY_INVALID");
  }
  if (request.wrapperLaunch.invocation.command !== request.authority.runtime_path) {
    return failure("WORKER_ISOLATION_RUNTIME_INVALID");
  }
  const backendBytes = captureExecutable(
    request.authority.backend_path,
    request.authority.backend_digest,
  );
  const runtimeBytes = captureExecutable(
    request.authority.runtime_path,
    request.authority.runtime_digest,
  );
  if (!backendBytes) return failure("WORKER_ISOLATION_BACKEND_UNAVAILABLE");
  if (!runtimeBytes) return failure("WORKER_ISOLATION_RUNTIME_INVALID");

  const resolvedInputs: Array<{ path: string; bytes: Buffer }> = [];
  let totalBytes = 0;
  const uniquePaths = new Set<string>();
  for (const inputPath of request.inputPaths) {
    const normalized = inputPath.replaceAll("\\", "/");
    if (uniquePaths.has(normalized)) return failure("WORKER_ISOLATION_SOURCE_REJECTED");
    uniquePaths.add(normalized);
    const captured = captureInput(repoRoot, inputPath);
    if (!captured) return failure("WORKER_ISOLATION_SOURCE_REJECTED");
    const { bytes } = captured;
    totalBytes += bytes.byteLength;
    if (bytes.byteLength > MAX_INPUT_FILE_BYTES || totalBytes > MAX_INPUT_TOTAL_BYTES) {
      return failure("WORKER_ISOLATION_SOURCE_REJECTED");
    }
    resolvedInputs.push({ path: normalized, bytes });
  }

  const isolationRoot = mkdtempSync(join(scratchBase, "worker-"));
  const scratchPath = join(isolationRoot, "workspace");
  const runtimePath = join(isolationRoot, "runtime");
  mkdirSync(scratchPath, { mode: 0o700 });
  mkdirSync(runtimePath, { mode: 0o700 });
  const inputManifest = resolvedInputs.map(({ path, bytes }) => {
    const destination = join(scratchPath, path);
    mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
    writeFileSync(destination, bytes, { flag: "wx", mode: 0o600 });
    return { path, size: bytes.byteLength, digest: sha256Digest(bytes) };
  });
  const launch: WorkerIsolationLaunch = Object.freeze({
    schema_version: "helix-worker-isolation-launch.v1",
    backend_digest: request.authority.backend_digest,
    runtime_digest: request.authority.runtime_digest,
    scratch_path: scratchPath,
    input_manifest: Object.freeze(inputManifest),
    wrapper_launch: request.wrapperLaunch,
  });
  const backendStaged = join(runtimePath, "bwrap");
  const runtimeStaged = join(runtimePath, "worker");
  writeFileSync(backendStaged, backendBytes, { flag: "wx", mode: 0o500 });
  writeFileSync(runtimeStaged, runtimeBytes, { flag: "wx", mode: 0o500 });
  const backendFd = openSync(backendStaged, constants.O_RDONLY | constants.O_NOFOLLOW);
  const runtimeFd = openSync(runtimeStaged, constants.O_RDONLY | constants.O_NOFOLLOW);
  sealedLaunches.add(launch);
  launchResources.set(launch, { backendFd, runtimeFd });
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
    "/proc/self/fd/4",
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
  const resources = launchResources.get(launch);
  if (!resources) throw new Error("sealed isolation launch is missing broker-owned resources");
  const result = spawn("/proc/self/fd/3", sandboxArguments(launch), {
    encoding: "utf8",
    env: {},
    input: launch.wrapper_launch.stdin,
    maxBuffer: 8 * 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe", resources.backendFd, resources.runtimeFd],
    timeout: 10 * 60 * 1000,
  });
  closeSync(resources.backendFd);
  closeSync(resources.runtimeFd);
  launchResources.delete(launch);
  return {
    isolated: true,
    status: result.status,
    stdout: String(result.stdout ?? ""),
    stderr: String(result.stderr ?? ""),
    environment_keys: Object.keys(FIXED_ENVIRONMENT).sort(),
  };
}
