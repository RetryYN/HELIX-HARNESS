import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import { roleJudgmentBrief } from "./role-judgment";
import { taskLensBrief } from "./task-lens";

export const WORKER_CONTEXT_ENVELOPE_HEADER = "HELIX-WORKER-CONTEXT-PACKET-V1";

const CURRENT_AUTHORITY_PATHS = new Set([
  "docs/governance/helix-harness-requirements_v1.3.md",
  "docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md",
  "docs/design/helix/L3-requirements/worker-common-contract.md",
]);
const CURRENT_RULE_PATHS = new Set([
  "AGENTS.md",
  "CLAUDE.md",
  ".claude/CLAUDE.md",
  "docs/skills/judgment-core.md",
]);

export type WorkerContextFailureCode =
  | "WORKER_CONTEXT_SCHEMA_INVALID"
  | "WORKER_CONTEXT_HEAD_DRIFT"
  | "WORKER_CONTEXT_AUTHORITY_UNRESOLVED"
  | "WORKER_CONTEXT_COMPATIBILITY_AUTHORITY"
  | "WORKER_CONTEXT_RULE_PACKET_UNRESOLVED"
  | "WORKER_CONTEXT_AXES_INVALID"
  | "WORKER_CONTEXT_SCOPE_INVALID"
  | "WORKER_CONTEXT_BUDGET_UNRESOLVED"
  | "WORKER_CONTEXT_OUTPUT_SCHEMA_MISMATCH"
  | "WORKER_CONTEXT_ROLE_JUDGMENT_MISMATCH"
  | "WORKER_CONTEXT_TASK_LENS_MISMATCH"
  | "WORKER_CONTEXT_PAYLOAD_DIGEST_MISMATCH"
  | "WORKER_CONTEXT_UNSEALED";

export type WorkerContextWorkflowStyle =
  | "v_model"
  | "production_scrum"
  | "v_design_scrum_implementation_hybrid";
export type WorkerContextCaseModel = "none" | "discovery" | "poc" | "other_admitted_case";
export type WorkerContextSpecialistProcess =
  | "none"
  | "design_harness"
  | "other_admitted_specialist";

export interface WorkerContextBoundary {
  goal_id: string;
  workflow_style: WorkerContextWorkflowStyle;
  case_model: WorkerContextCaseModel;
  specialist_process: WorkerContextSpecialistProcess;
  behavior_contract_id: string;
  responsibility_owner: string;
  allowed_paths: readonly string[];
  forbidden_paths: readonly string[];
  severity_policy_digest: Sha256Digest;
  required_output_schema: Sha256Digest;
  budget: { readonly time_ms: number; readonly token_limit: number };
}

export interface WorkerContextPacketV1 extends WorkerContextBoundary {
  schema_version: "worker-context-packet.v1";
  current_head: string;
  authority_digest: Sha256Digest;
  effective_rule_packet_digest: Sha256Digest;
  role_judgment_digest: Sha256Digest;
  task_lens_digest: Sha256Digest;
  payload_digest: Sha256Digest;
}

export interface WorkerContextAuthorityRequest {
  repo_root: string;
  current_head: string;
  authority_paths: readonly string[];
  rule_paths: readonly string[];
}

export interface WorkerContextAuthorityCapability {
  readonly kind: "worker_context_authority";
  readonly authority_root: string;
  readonly current_head: string;
  readonly authority_digest: Sha256Digest;
  readonly effective_rule_packet_digest: Sha256Digest;
  readonly authority_paths: readonly string[];
  readonly rule_paths: readonly string[];
}

export interface WorkerContextPacketCapability {
  readonly kind: "worker_context_packet";
  readonly packet_digest: Sha256Digest;
}

export interface WorkerContextCompileRequest {
  authority: WorkerContextAuthorityCapability;
  boundary: WorkerContextBoundary;
  role: string;
  task: string;
  payload: string;
}

export interface WorkerContextVerificationInput {
  current_head: string;
  role: string;
  task: string;
  required_output_schema: Sha256Digest;
}

export function loadWorkerContextBoundaryFile(input: {
  repo_root: string;
  path: string;
}):
  | { ok: true; authority: WorkerContextAuthorityCapability; boundary: WorkerContextBoundary }
  | Failure {
  let boundary: unknown;
  let currentHead: string;
  try {
    boundary = JSON.parse(
      readFileSync(resolve(input.repo_root, input.path), "utf8"),
    ) as WorkerContextBoundary;
    currentHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: input.repo_root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return failure("WORKER_CONTEXT_SCHEMA_INVALID");
  }
  if (typeof boundary !== "object" || boundary === null) {
    return failure("WORKER_CONTEXT_SCHEMA_INVALID");
  }
  const candidate = boundary as WorkerContextBoundary;
  if (!validAxes(candidate) || !validScope(candidate) || !validBudget(candidate)) {
    return failure("WORKER_CONTEXT_SCHEMA_INVALID");
  }
  if (!isSha(candidate.severity_policy_digest) || !isSha(candidate.required_output_schema)) {
    return failure("WORKER_CONTEXT_SCHEMA_INVALID");
  }
  const authority = attestWorkerContextAuthority({
    repo_root: input.repo_root,
    current_head: currentHead,
    authority_paths: [...CURRENT_AUTHORITY_PATHS],
    rule_paths: [...CURRENT_RULE_PATHS],
  });
  if (!("kind" in authority)) return authority;
  return { ok: true, authority, boundary: candidate };
}

type Failure = { ok: false; failure_code: WorkerContextFailureCode };

interface PacketSeal {
  packet: WorkerContextPacketV1;
  envelope_digest: Sha256Digest;
}

const authorityCapabilities = new WeakSet<WorkerContextAuthorityCapability>();
const packetCapabilities = new WeakMap<WorkerContextPacketCapability, PacketSeal>();

function failure(failure_code: WorkerContextFailureCode): Failure {
  return { ok: false, failure_code };
}

function isSha(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isHead(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40}$/u.test(value);
}

function normalizedRelativePath(value: string): string | null {
  const normalized = value.replaceAll("\\", "/");
  if (
    normalized.length === 0 ||
    normalized.includes("\0") ||
    isAbsolute(normalized) ||
    normalized.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    return null;
  }
  return normalized;
}

function isCompatibilityPath(path: string): boolean {
  return (
    path.startsWith("docs/archive/") ||
    path.includes("requirements_v1.2") ||
    /(?:^|\/)L(?:0|1[3-9]|[2-9][0-9])-L14(?:\/|$)/u.test(path)
  );
}

function captureAuthoritySet(input: {
  repoRoot: string;
  paths: readonly string[];
  allowed: ReadonlySet<string>;
  head: string;
}): Array<{ path: string; digest: Sha256Digest }> | null {
  const { repoRoot, paths, allowed, head } = input;
  const unique = [...new Set(paths)].sort();
  if (unique.length === 0 || unique.length !== paths.length) return null;
  const captured: Array<{ path: string; digest: Sha256Digest }> = [];
  for (const candidate of unique) {
    const path = normalizedRelativePath(candidate);
    if (!path || !allowed.has(path)) return null;
    const absolute = resolve(repoRoot, path);
    const delta = relative(repoRoot, absolute);
    if (delta.startsWith(`..${sep}`) || delta === ".." || isAbsolute(delta)) return null;
    try {
      if (!lstatSync(absolute).isFile()) return null;
      const worktreeBytes = readFileSync(absolute);
      const headBytes = execFileSync("git", ["show", `${head}:${path}`], {
        cwd: repoRoot,
        encoding: "buffer",
        stdio: ["ignore", "pipe", "ignore"],
      });
      if (sha256Digest(worktreeBytes) !== sha256Digest(headBytes)) return null;
      captured.push({ path, digest: sha256Digest(headBytes) });
    } catch {
      return null;
    }
  }
  return captured;
}

export function attestWorkerContextAuthority(
  request: WorkerContextAuthorityRequest,
): WorkerContextAuthorityCapability | Failure {
  if (!isHead(request.current_head)) return failure("WORKER_CONTEXT_SCHEMA_INVALID");
  let repoRoot: string;
  let actualHead: string;
  try {
    repoRoot = realpathSync(request.repo_root);
    actualHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return failure("WORKER_CONTEXT_AUTHORITY_UNRESOLVED");
  }
  if (request.current_head !== actualHead) return failure("WORKER_CONTEXT_HEAD_DRIFT");
  if (request.authority_paths.some((path) => isCompatibilityPath(path))) {
    return failure("WORKER_CONTEXT_COMPATIBILITY_AUTHORITY");
  }
  const authorities = captureAuthoritySet({
    repoRoot,
    paths: request.authority_paths,
    allowed: CURRENT_AUTHORITY_PATHS,
    head: actualHead,
  });
  if (!authorities) return failure("WORKER_CONTEXT_AUTHORITY_UNRESOLVED");
  const rules = captureAuthoritySet({
    repoRoot,
    paths: request.rule_paths,
    allowed: CURRENT_RULE_PATHS,
    head: actualHead,
  });
  if (!rules) return failure("WORKER_CONTEXT_RULE_PACKET_UNRESOLVED");
  const capability = Object.freeze({
    kind: "worker_context_authority" as const,
    authority_root: repoRoot,
    current_head: actualHead,
    authority_digest: sha256Digest(canonicalJson(authorities)),
    effective_rule_packet_digest: sha256Digest(canonicalJson(rules)),
    authority_paths: Object.freeze([...request.authority_paths]),
    rule_paths: Object.freeze([...request.rule_paths]),
  });
  authorityCapabilities.add(capability);
  return capability;
}

export function reattestWorkerContextAuthority(
  capability: WorkerContextAuthorityCapability,
): WorkerContextAuthorityCapability | Failure {
  if (!authorityCapabilities.has(capability)) return failure("WORKER_CONTEXT_UNSEALED");
  const current = attestWorkerContextAuthority({
    repo_root: capability.authority_root,
    current_head: capability.current_head,
    authority_paths: capability.authority_paths,
    rule_paths: capability.rule_paths,
  });
  if (!("kind" in current)) return current;
  if (current.authority_digest !== capability.authority_digest) {
    return failure("WORKER_CONTEXT_AUTHORITY_UNRESOLVED");
  }
  if (current.effective_rule_packet_digest !== capability.effective_rule_packet_digest) {
    return failure("WORKER_CONTEXT_RULE_PACKET_UNRESOLVED");
  }
  return current;
}

function validAxes(boundary: unknown): boundary is WorkerContextBoundary {
  if (typeof boundary !== "object" || boundary === null) return false;
  const candidate = boundary as Record<string, unknown>;
  return (
    ["v_model", "production_scrum", "v_design_scrum_implementation_hybrid"].includes(
      candidate.workflow_style as WorkerContextWorkflowStyle,
    ) &&
    ["none", "discovery", "poc", "other_admitted_case"].includes(
      candidate.case_model as WorkerContextCaseModel,
    ) &&
    ["none", "design_harness", "other_admitted_specialist"].includes(
      candidate.specialist_process as WorkerContextSpecialistProcess,
    )
  );
}

function pathContains(parent: string, child: string): boolean {
  return parent === child || child.startsWith(`${parent}/`);
}

function validScope(boundary: unknown): boundary is WorkerContextBoundary {
  if (typeof boundary !== "object" || boundary === null) return false;
  const candidate = boundary as Record<string, unknown>;
  if (
    typeof candidate.goal_id !== "string" ||
    !candidate.goal_id.trim() ||
    typeof candidate.behavior_contract_id !== "string" ||
    !candidate.behavior_contract_id.trim() ||
    typeof candidate.responsibility_owner !== "string" ||
    !candidate.responsibility_owner.trim() ||
    !Array.isArray(candidate.allowed_paths) ||
    candidate.allowed_paths.length === 0 ||
    !candidate.allowed_paths.every((path) => typeof path === "string") ||
    !Array.isArray(candidate.forbidden_paths) ||
    !candidate.forbidden_paths.every((path) => typeof path === "string")
  ) {
    return false;
  }
  const allowed = candidate.allowed_paths.map(normalizedRelativePath);
  const forbidden = candidate.forbidden_paths.map(normalizedRelativePath);
  if (allowed.some((path) => path === null) || forbidden.some((path) => path === null))
    return false;
  const left = allowed as string[];
  const right = forbidden as string[];
  if (new Set(left).size !== left.length || new Set(right).size !== right.length) return false;
  return !left.some((a) => right.some((b) => pathContains(a, b) || pathContains(b, a)));
}

function validBudget(boundary: unknown): boundary is WorkerContextBoundary {
  if (typeof boundary !== "object" || boundary === null) return false;
  const budget = (boundary as Record<string, unknown>).budget;
  if (typeof budget !== "object" || budget === null) return false;
  const candidate = budget as Record<string, unknown>;
  return (
    Number.isSafeInteger(candidate.time_ms) &&
    Number(candidate.time_ms) > 0 &&
    Number.isSafeInteger(candidate.token_limit) &&
    Number(candidate.token_limit) > 0
  );
}

export function compileWorkerContextPacket(request: WorkerContextCompileRequest):
  | Failure
  | {
      ok: true;
      packet: WorkerContextPacketV1;
      capability: WorkerContextPacketCapability;
      envelope: string;
    } {
  if (!authorityCapabilities.has(request.authority)) return failure("WORKER_CONTEXT_UNSEALED");
  if (!validAxes(request.boundary)) return failure("WORKER_CONTEXT_AXES_INVALID");
  if (!validScope(request.boundary)) return failure("WORKER_CONTEXT_SCOPE_INVALID");
  if (!validBudget(request.boundary)) return failure("WORKER_CONTEXT_BUDGET_UNRESOLVED");
  if (
    !isSha(request.boundary.severity_policy_digest) ||
    !isSha(request.boundary.required_output_schema) ||
    typeof request.payload !== "string" ||
    request.payload.length === 0
  ) {
    return failure("WORKER_CONTEXT_SCHEMA_INVALID");
  }
  const packet: WorkerContextPacketV1 = Object.freeze({
    schema_version: "worker-context-packet.v1",
    current_head: request.authority.current_head,
    authority_digest: request.authority.authority_digest,
    effective_rule_packet_digest: request.authority.effective_rule_packet_digest,
    goal_id: request.boundary.goal_id,
    workflow_style: request.boundary.workflow_style,
    case_model: request.boundary.case_model,
    specialist_process: request.boundary.specialist_process,
    behavior_contract_id: request.boundary.behavior_contract_id,
    responsibility_owner: request.boundary.responsibility_owner,
    allowed_paths: Object.freeze([...request.boundary.allowed_paths]),
    forbidden_paths: Object.freeze([...request.boundary.forbidden_paths]),
    severity_policy_digest: request.boundary.severity_policy_digest,
    required_output_schema: request.boundary.required_output_schema,
    budget: Object.freeze({ ...request.boundary.budget }),
    role_judgment_digest: sha256Digest(roleJudgmentBrief(request.role)),
    task_lens_digest: sha256Digest(taskLensBrief(request.task)),
    payload_digest: sha256Digest(request.payload),
  });
  const packetDigest = sha256Digest(canonicalJson(packet));
  const envelope = `${WORKER_CONTEXT_ENVELOPE_HEADER}\n${canonicalJson(packet)}\n\n${request.payload}`;
  const capability = Object.freeze({
    kind: "worker_context_packet" as const,
    packet_digest: packetDigest,
  });
  packetCapabilities.set(capability, {
    packet,
    envelope_digest: sha256Digest(envelope),
  });
  return { ok: true, packet, capability, envelope };
}

export function isWorkerContextPacketCapability(
  value: unknown,
): value is WorkerContextPacketCapability {
  return (
    typeof value === "object" &&
    value !== null &&
    packetCapabilities.has(value as WorkerContextPacketCapability)
  );
}

export function verifyWorkerContextEnvelope(
  capability: WorkerContextPacketCapability,
  envelope: string,
  input: WorkerContextVerificationInput,
): Failure | { ok: true; packet: WorkerContextPacketV1 } {
  const seal = packetCapabilities.get(capability);
  if (!seal) return failure("WORKER_CONTEXT_UNSEALED");
  if (seal.packet.current_head !== input.current_head) return failure("WORKER_CONTEXT_HEAD_DRIFT");
  if (seal.packet.required_output_schema !== input.required_output_schema) {
    return failure("WORKER_CONTEXT_OUTPUT_SCHEMA_MISMATCH");
  }
  if (seal.packet.role_judgment_digest !== sha256Digest(roleJudgmentBrief(input.role))) {
    return failure("WORKER_CONTEXT_ROLE_JUDGMENT_MISMATCH");
  }
  if (seal.packet.task_lens_digest !== sha256Digest(taskLensBrief(input.task))) {
    return failure("WORKER_CONTEXT_TASK_LENS_MISMATCH");
  }
  if (seal.envelope_digest !== sha256Digest(envelope)) {
    return failure("WORKER_CONTEXT_PAYLOAD_DIGEST_MISMATCH");
  }
  return { ok: true, packet: seal.packet };
}
