import { execFileSync, type SpawnSyncOptions, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
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
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  isWorkerBlindBenchmarkDefinitionCapability,
  type WorkerBlindBenchmarkCapability,
} from "./worker-blind-definition";
import {
  reattestWorkerContextAuthority,
  verifyWorkerContextEnvelope,
  type WorkerContextFailureCode,
} from "./worker-context-packet";
import {
  isWorkerAdmissionCurrent,
  type WorkerDescriptorAdmissionDecisionV1,
  type WorkerDescriptorRequestV1,
  type WorkerRegistrySnapshotV1,
} from "./worker-descriptor-admission";
import {
  auditWorkerIsolationScope,
  isWorkerIsolationPolicyCapability,
  type WorkerIsolationPolicyCapability,
  type WorkerIsolationPolicyFailureCode,
} from "./worker-isolation-policy";
import {
  admitWorkerOutput,
  hasWorkerOutputContract,
  type WorkerOutputBinding,
  type WorkerOutputFailureCode,
  type WorkerValidatedOutputCapability,
} from "./worker-output-admission";

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
  | "WORKER_ISOLATION_WRAPPER_UNADMITTED"
  | "WORKER_OUTPUT_PROCESS_FAILED"
  | WorkerContextFailureCode
  | WorkerOutputFailureCode
  | WorkerIsolationPolicyFailureCode;

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
  policy: WorkerIsolationPolicyCapability;
  admission: WorkerAdmissionBinding;
  authority: WorkerIsolationAuthorityCapability;
  riskClass?: "low" | "medium" | "high" | "critical";
  benchmark?: WorkerBenchmarkExecutionCapability;
  blindJudge?: WorkerBlindJudgeContextCapability;
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

export interface WorkerIsolationExecutionOrigin {
  readonly kind: "worker_isolation_execution_origin";
  readonly identity: string;
  readonly session: string;
  readonly context_digest: Sha256Digest;
  readonly fixture_digest: Sha256Digest;
  readonly task_digest: Sha256Digest;
  readonly risk_class: "low" | "medium" | "high" | "critical";
  readonly benchmark_definition_digest: Sha256Digest | null;
  readonly judge_packet_digest: Sha256Digest | null;
  readonly runtime: string;
  readonly provider: string;
  readonly model: string;
  readonly effort: string | null;
  readonly descriptor_digest: Sha256Digest;
  readonly registry_revision: number;
  readonly registry_digest: Sha256Digest;
  readonly decision_digest: Sha256Digest;
  readonly wrapper_origin_digest: Sha256Digest;
}

export interface WorkerBenchmarkExecutionCapability {
  readonly kind: "worker_benchmark_execution";
  readonly definition_digest: Sha256Digest;
  readonly fixture_digest: Sha256Digest;
  readonly task_digest: Sha256Digest;
  readonly risk_class: "low" | "medium" | "high" | "critical";
}

export interface WorkerBlindJudgeContextCapability {
  readonly kind: "worker_blind_judge_context";
  readonly packet_digest: Sha256Digest;
  readonly task_digest: Sha256Digest;
}

export interface WorkerExecutionObservationCapability {
  readonly kind: "worker_execution_observation";
  readonly output_digest: Sha256Digest;
  readonly duration_ms: number;
  readonly observation_digest: Sha256Digest;
}

export interface WorkerIsolationRunReceiptCapability {
  readonly kind: "worker_isolation_run_receipt";
  readonly admission_digest: Sha256Digest;
  readonly sandbox_digest: Sha256Digest;
  readonly diff_digest: Sha256Digest;
  readonly egress_digest: Sha256Digest;
  readonly output_digest: Sha256Digest;
  readonly observation_digest: Sha256Digest;
  readonly receipt_digest: Sha256Digest;
}

export type WorkerIsolationPrepareResult =
  | { isolated: false; failure_code: WorkerIsolationFailureCode }
  | { isolated: true; launch: WorkerIsolationLaunch };

export type WorkerIsolationRunResult =
  | { isolated: false; failure_code: WorkerIsolationFailureCode }
  | {
      isolated: true;
      status: 0;
      output: WorkerValidatedOutputCapability;
      observation: WorkerExecutionObservationCapability;
      receipt: WorkerIsolationRunReceiptCapability;
      stderr_digest: Sha256Digest;
      environment_keys: readonly string[];
      changed_paths: readonly string[];
    };

interface SpawnResult {
  status: number | null;
  stdout?: string | Buffer;
  stderr?: string | Buffer;
}

export type IsolationSpawn = (
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions,
) => SpawnResult;

const sealedLaunches = new WeakSet<WorkerIsolationLaunch>();
const isolationAuthorities = new WeakSet<WorkerIsolationAuthorityCapability>();
const launchResources = new WeakMap<
  WorkerIsolationLaunch,
  { backendFd: number; runtimeFd: number }
>();
const launchPolicies = new WeakMap<WorkerIsolationLaunch, WorkerIsolationPolicyCapability>();
const launchOutputBindings = new WeakMap<WorkerIsolationLaunch, WorkerOutputBinding>();
const launchExecutionBindings = new WeakMap<
  WorkerIsolationLaunch,
  {
    admission: WorkerAdmissionBinding;
    identity: string;
    provider: string;
    runtime: string;
    model: string | null;
    effort: string | null;
    context_digest: Sha256Digest;
    fixture_digest: Sha256Digest;
    task_digest: Sha256Digest;
    risk_class: "low" | "medium" | "high" | "critical";
    benchmark_definition_digest: Sha256Digest | null;
    judge_packet_digest: Sha256Digest | null;
    benchmark: WorkerBenchmarkExecutionCapability | null;
    blindJudge: WorkerBlindJudgeContextCapability | null;
  }
>();
const outputExecutionOrigins = new WeakMap<
  WorkerValidatedOutputCapability,
  WorkerIsolationExecutionOrigin
>();
const executionObservations = new WeakMap<
  WorkerExecutionObservationCapability,
  WorkerValidatedOutputCapability
>();
const isolationRunReceipts = new WeakMap<
  WorkerIsolationRunReceiptCapability,
  WorkerValidatedOutputCapability
>();
const benchmarkExecutionCapabilities = new WeakSet<WorkerBenchmarkExecutionCapability>();
const blindJudgeContextCapabilities = new WeakSet<WorkerBlindJudgeContextCapability>();
const outputBenchmarkExecutions = new WeakMap<
  WorkerValidatedOutputCapability,
  WorkerBenchmarkExecutionCapability
>();
const outputBlindJudgeContexts = new WeakMap<
  WorkerValidatedOutputCapability,
  WorkerBlindJudgeContextCapability
>();

export function sealWorkerBenchmarkExecution(
  definitionCapability: WorkerBlindBenchmarkCapability,
  binding: Omit<WorkerBenchmarkExecutionCapability, "kind">,
): WorkerBenchmarkExecutionCapability | null {
  if (
    !isWorkerBlindBenchmarkDefinitionCapability(definitionCapability) ||
    definitionCapability.definition_digest !== binding.definition_digest
  ) {
    return null;
  }
  const capability = Object.freeze({ kind: "worker_benchmark_execution" as const, ...binding });
  benchmarkExecutionCapabilities.add(capability);
  return capability;
}

/** sealWorkerBlindJudgeContext が受理する blind packet の形。 */
export interface WorkerBlindJudgeContextPacket {
  schema_version: "helix-worker-blind-packet.v1";
  benchmark_definition_digest: Sha256Digest;
  blind_candidate_id: Sha256Digest;
  fixture_digest: Sha256Digest;
  rubric_digest: Sha256Digest;
  task_digest: Sha256Digest;
  risk_class: "low" | "medium" | "high" | "critical";
  artifact_digests: readonly Sha256Digest[];
  author_claim_count: 0;
  private_context_count: 0;
  packet_digest: Sha256Digest;
}

/**
 * packet capability から packet 本体を引く resolver。packet capability と seal 台帳は
 * worker-blind-benchmark が所有するため、broker 側は module 境界越しに解決する。
 */
export type WorkerBlindPacketResolver = (
  packetCapability: object,
) => WorkerBlindJudgeContextPacket | null;

let blindPacketResolver: WorkerBlindPacketResolver | null = null;

/**
 * packet capability resolver を **一度だけ** 取り付ける。所有 module
 * (worker-blind-benchmark) の初期化時にのみ呼ばれ、以後の差し替えを拒否することで
 * judge context capability chain の起点を packet capability 一本に固定する (issue #378)。
 */
export function installWorkerBlindPacketResolver(resolver: WorkerBlindPacketResolver): void {
  if (blindPacketResolver) return;
  blindPacketResolver = resolver;
}

/**
 * blind judge context を封印する。引数は **packet capability** であり、packet 本体は
 * 所有 module の seal 台帳から引く。packet 形状の plain object を渡しても resolver が
 * 解決できず null を返すため、buildWorkerBlindJudgeContext 以外の起点は存在しない。
 */
export function sealWorkerBlindJudgeContext(
  packetCapability: object,
): { capability: WorkerBlindJudgeContextCapability; task: string } | null {
  const packet = blindPacketResolver?.(packetCapability) ?? null;
  if (!packet) return null;
  const { packet_digest: packetDigest, ...payload } = packet;
  if (
    packet.author_claim_count !== 0 ||
    packet.private_context_count !== 0 ||
    sha256Digest(canonicalJson(payload)) !== packetDigest
  ) {
    return null;
  }
  const task = canonicalJson(packet);
  const capability = Object.freeze({
    kind: "worker_blind_judge_context" as const,
    packet_digest: packetDigest,
    task_digest: sha256Digest(task),
  });
  blindJudgeContextCapabilities.add(capability);
  return { capability, task };
}

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
    !isWorkerIsolationPolicyCapability(request.policy) ||
    request.policy.wrapper_origin_digest !== request.wrapperLaunch.capability.origin_digest
  ) {
    return failure("WORKER_ISOLATION_POLICY_UNRESOLVED");
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
  const descriptorDigest = request.admission.decision.descriptor_digest;
  const admittedEntry = request.admission.snapshot.entries.find(
    (entry) => entry.descriptor.descriptor_digest === descriptorDigest,
  );
  if (
    !descriptorDigest ||
    !admittedEntry ||
    !hasWorkerOutputContract(request.wrapperLaunch.stdin, {
      descriptor_digest: descriptorDigest,
      output_schema_digest: admittedEntry.descriptor.output_schema_digest,
    })
  ) {
    return failure("WORKER_OUTPUT_SCHEMA_UNRESOLVED");
  }

  let repoRoot: string;
  let scratchBase: string;
  let currentHead: string;
  try {
    repoRoot = realpathSync(request.repoRoot);
    currentHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    mkdirSync(request.scratchBaseDir, { recursive: true, mode: 0o700 });
    scratchBase = realpathSync(request.scratchBaseDir);
  } catch {
    return failure("WORKER_ISOLATION_BOUNDARY_INVALID");
  }
  const workerContext = request.wrapperLaunch.worker_context;
  if (!workerContext || workerContext.authority_root !== repoRoot) {
    return failure("WORKER_CONTEXT_UNSEALED");
  }
  const currentContextAuthority = reattestWorkerContextAuthority(workerContext.authority);
  if (!("kind" in currentContextAuthority)) {
    return failure(currentContextAuthority.failure_code);
  }
  const verifiedContext = verifyWorkerContextEnvelope(
    workerContext.capability,
    request.wrapperLaunch.stdin ?? "",
    {
      current_head: currentHead,
      role: workerContext.role,
      task: workerContext.task,
      required_output_schema: admittedEntry.descriptor.output_schema_digest,
    },
  );
  if (!verifiedContext.ok) return failure(verifiedContext.failure_code);
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

  const inputManifest = resolvedInputs.map(({ path, bytes }) => {
    return { path, size: bytes.byteLength, digest: sha256Digest(bytes) };
  });
  const fixtureDigest = sha256Digest(canonicalJson(inputManifest));
  const taskDigest = sha256Digest(
    workerContext.task.split("\n\n<HELIX_WORKER_OUTPUT_CONTRACT>", 1)[0]?.trimEnd() ?? "",
  );
  const riskClass = request.riskClass ?? "low";
  if (
    request.benchmark &&
    (!benchmarkExecutionCapabilities.has(request.benchmark) ||
      request.benchmark.fixture_digest !== fixtureDigest ||
      request.benchmark.task_digest !== taskDigest ||
      request.benchmark.risk_class !== riskClass)
  ) {
    return failure("WORKER_ISOLATION_BOUNDARY_INVALID");
  }
  if (
    request.blindJudge &&
    (!blindJudgeContextCapabilities.has(request.blindJudge) ||
      request.blindJudge.task_digest !== taskDigest)
  ) {
    return failure("WORKER_ISOLATION_BOUNDARY_INVALID");
  }
  const isolationRoot = mkdtempSync(join(scratchBase, "worker-"));
  const scratchPath = join(isolationRoot, "workspace");
  const runtimePath = join(isolationRoot, "runtime");
  mkdirSync(scratchPath, { mode: 0o700 });
  mkdirSync(runtimePath, { mode: 0o700 });
  for (const { path, bytes } of resolvedInputs) {
    const destination = join(scratchPath, path);
    mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
    writeFileSync(destination, bytes, { flag: "wx", mode: 0o600 });
  }
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
  launchPolicies.set(launch, request.policy);
  launchOutputBindings.set(launch, {
    descriptor_digest: descriptorDigest,
    output_schema_digest: admittedEntry.descriptor.output_schema_digest,
  });
  launchExecutionBindings.set(launch, {
    admission: request.admission,
    identity: admittedEntry.descriptor.agent_id,
    provider: admittedEntry.descriptor.provider,
    runtime: request.authority.runtime_id,
    model: request.wrapperLaunch.model ?? null,
    effort: request.wrapperLaunch.effort ?? null,
    context_digest: workerContext.capability.packet_digest,
    fixture_digest: fixtureDigest,
    task_digest: taskDigest,
    risk_class: riskClass,
    benchmark_definition_digest: request.benchmark?.definition_digest ?? null,
    judge_packet_digest: request.blindJudge?.packet_digest ?? null,
    benchmark: request.benchmark ?? null,
    blindJudge: request.blindJudge ?? null,
  });
  return { isolated: true, launch };
}

function sandboxArguments(launch: WorkerIsolationLaunch): string[] {
  const invocation = launch.wrapper_launch.invocation;
  return [
    "--unshare-user",
    "--unshare-pid",
    "--unshare-ipc",
    "--unshare-uts",
    "--unshare-net",
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
  const policy = launchPolicies.get(launch);
  const outputBinding = launchOutputBindings.get(launch);
  const executionBinding = launchExecutionBindings.get(launch);
  if (!resources || !policy || !outputBinding || !executionBinding)
    throw new Error("sealed isolation launch is missing broker-owned resources");
  // 起動結果にかかわらず一度だけ消費し、再入・例外後の再利用を拒否する。
  sealedLaunches.delete(launch);
  const started = process.hrtime.bigint();
  let result: ReturnType<IsolationSpawn>;
  try {
    result = spawn("/proc/self/fd/3", sandboxArguments(launch), {
      encoding: "buffer",
      env: {},
      input: Buffer.from(launch.wrapper_launch.stdin ?? "", "utf8"),
      maxBuffer: 8 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe", resources.backendFd, resources.runtimeFd],
      timeout: 10 * 60 * 1000,
    });
  } finally {
    launchResources.delete(launch);
    launchPolicies.delete(launch);
    launchOutputBindings.delete(launch);
    launchExecutionBindings.delete(launch);
    try {
      closeSync(resources.backendFd);
    } finally {
      closeSync(resources.runtimeFd);
    }
  }
  const durationMs = Number((process.hrtime.bigint() - started) / 1_000_000n);
  const scope = auditWorkerIsolationScope(
    launch.scratch_path,
    launch.input_manifest,
    policy.writable_paths,
  );
  if (!scope.ok) {
    return { isolated: false, failure_code: scope.failure_code };
  }
  if (result.status !== 0) {
    return { isolated: false, failure_code: "WORKER_OUTPUT_PROCESS_FAILED" };
  }
  const admittedOutput = admitWorkerOutput(result.stdout ?? Buffer.alloc(0), outputBinding);
  if (!admittedOutput.ok) {
    return { isolated: false, failure_code: admittedOutput.failure_code };
  }
  if (executionBinding.model) {
    outputExecutionOrigins.set(
      admittedOutput.output,
      Object.freeze({
        kind: "worker_isolation_execution_origin",
        identity: executionBinding.identity,
        session: randomUUID(),
        context_digest: executionBinding.context_digest,
        fixture_digest: executionBinding.fixture_digest,
        task_digest: executionBinding.task_digest,
        risk_class: executionBinding.risk_class,
        benchmark_definition_digest: executionBinding.benchmark_definition_digest,
        judge_packet_digest: executionBinding.judge_packet_digest,
        runtime: executionBinding.runtime,
        provider: executionBinding.provider,
        model: executionBinding.model,
        effort: executionBinding.effort,
        descriptor_digest: outputBinding.descriptor_digest,
        registry_revision: executionBinding.admission.snapshot.revision,
        registry_digest: executionBinding.admission.snapshot.registry_digest,
        decision_digest: executionBinding.admission.decision.decision_digest,
        wrapper_origin_digest: launch.wrapper_launch.capability.origin_digest,
      }),
    );
  }
  if (executionBinding.benchmark) {
    outputBenchmarkExecutions.set(admittedOutput.output, executionBinding.benchmark);
  }
  if (executionBinding.blindJudge) {
    outputBlindJudgeContexts.set(admittedOutput.output, executionBinding.blindJudge);
  }
  const observationPayload = {
    kind: "worker_execution_observation" as const,
    output_digest: admittedOutput.output.payload_digest,
    duration_ms: durationMs,
  };
  const observation = Object.freeze({
    ...observationPayload,
    observation_digest: sha256Digest(canonicalJson(observationPayload)),
  });
  executionObservations.set(observation, admittedOutput.output);
  const stderrDigest = sha256Digest(result.stderr ?? Buffer.alloc(0));
  const runReceiptPayload = {
    kind: "worker_isolation_run_receipt" as const,
    admission_digest: executionBinding.admission.decision.decision_digest,
    sandbox_digest: sha256Digest(
      canonicalJson({
        backend_digest: launch.backend_digest,
        runtime_digest: launch.runtime_digest,
        input_manifest: launch.input_manifest,
        wrapper_origin_digest: launch.wrapper_launch.capability.origin_digest,
      }),
    ),
    diff_digest: sha256Digest(canonicalJson([...scope.changed_paths].sort())),
    egress_digest: sha256Digest(
      canonicalJson({
        environment_keys: Object.keys(FIXED_ENVIRONMENT).sort(),
        status: 0,
        stderr_digest: stderrDigest,
      }),
    ),
    output_digest: admittedOutput.output.payload_digest,
    observation_digest: observation.observation_digest,
  };
  const receipt = Object.freeze({
    ...runReceiptPayload,
    receipt_digest: sha256Digest(canonicalJson(runReceiptPayload)),
  });
  isolationRunReceipts.set(receipt, admittedOutput.output);
  return {
    isolated: true,
    status: 0,
    output: admittedOutput.output,
    observation,
    receipt,
    stderr_digest: stderrDigest,
    environment_keys: Object.keys(FIXED_ENVIRONMENT).sort(),
    changed_paths: scope.changed_paths,
  };
}

export function resolveWorkerIsolationRunReceipt(
  capability: WorkerIsolationRunReceiptCapability,
  output: WorkerValidatedOutputCapability,
): WorkerIsolationRunReceiptCapability | null {
  if (
    isolationRunReceipts.get(capability) !== output ||
    capability.output_digest !== output.payload_digest
  ) {
    return null;
  }
  return Object.freeze({ ...capability });
}

export function resolveWorkerExecutionObservation(
  capability: WorkerExecutionObservationCapability,
  output: WorkerValidatedOutputCapability,
): WorkerExecutionObservationCapability | null {
  if (
    executionObservations.get(capability) !== output ||
    capability.output_digest !== output.payload_digest
  ) {
    return null;
  }
  return Object.freeze({ ...capability });
}

export function resolveWorkerBenchmarkExecution(
  output: WorkerValidatedOutputCapability,
  capability: WorkerBenchmarkExecutionCapability,
): WorkerBenchmarkExecutionCapability | null {
  return outputBenchmarkExecutions.get(output) === capability ? capability : null;
}

export function resolveWorkerBlindJudgeContext(
  output: WorkerValidatedOutputCapability,
  capability: WorkerBlindJudgeContextCapability,
): WorkerBlindJudgeContextCapability | null {
  return outputBlindJudgeContexts.get(output) === capability ? capability : null;
}

export function resolveWorkerIsolationExecutionOrigin(
  output: WorkerValidatedOutputCapability,
  current: WorkerAdmissionBinding,
): WorkerIsolationExecutionOrigin | null {
  const origin = outputExecutionOrigins.get(output);
  if (
    !origin ||
    !isWorkerAdmissionCurrent(current.decision, current.request, current.snapshot) ||
    current.decision.disposition !== "admitted" ||
    current.decision.descriptor_digest !== output.descriptor_digest ||
    current.decision.descriptor_digest !== origin.descriptor_digest ||
    current.snapshot.revision !== origin.registry_revision ||
    current.snapshot.registry_digest !== origin.registry_digest ||
    current.decision.decision_digest !== origin.decision_digest
  ) {
    return null;
  }
  const descriptor = current.snapshot.entries.find(
    (entry) => entry.descriptor.descriptor_digest === origin.descriptor_digest,
  )?.descriptor;
  if (
    !descriptor ||
    descriptor.agent_id !== origin.identity ||
    descriptor.provider !== origin.provider
  ) {
    return null;
  }
  return Object.freeze({ ...origin });
}
