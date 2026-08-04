import { type SpawnSyncOptions, spawnSync } from "node:child_process";
import {
  closeSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

export type IndependentReviewProvider = "claude" | "kimi";
export type ReviewRiskClass = "low" | "medium" | "high" | "critical";
export type ReviewFallbackReason =
  | "provider_quota_exhausted"
  | "provider_unavailable"
  | "provider_claim_timeout";

export interface ReviewProviderFailureCapability {
  readonly kind: "review_provider_failure";
  readonly provider: "claude";
  readonly candidate_head: string;
  readonly reason: ReviewFallbackReason;
  readonly observed_at: string;
  readonly evidence_digest: Sha256Digest;
}

export interface ReviewFallbackLeaseCapability {
  readonly kind: "review_fallback_lease";
  readonly repository: string;
  readonly pr_number: number;
  readonly candidate_head: string;
  readonly generation: number;
  readonly provider: IndependentReviewProvider;
  readonly issued_at: string;
  readonly expires_at: string;
  readonly lease_digest: Sha256Digest;
}

export interface KimiReviewOutputCapability {
  readonly kind: "kimi_review_output";
  readonly candidate_head: string;
  readonly verdict: "approve" | "block";
  readonly blocker_count: number;
  readonly findings: readonly z.infer<typeof findingSchema>[];
  readonly findings_digest: Sha256Digest;
  readonly output_digest: Sha256Digest;
}

export type KimiReviewExecutionFailureCode =
  | "KIMI_REVIEW_SANDBOX_UNAVAILABLE"
  | "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED"
  | "KIMI_REVIEW_AGENT_POLICY_INVALID"
  | "KIMI_REVIEW_PROCESS_FAILED"
  | "KIMI_REVIEW_OUTPUT_INVALID"
  | "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED"
  | "KIMI_REVIEW_HEAD_MISMATCH";

const providerFailures = new WeakSet<ReviewProviderFailureCapability>();
const fallbackLeases = new WeakSet<ReviewFallbackLeaseCapability>();
const kimiOutputs = new WeakSet<KimiReviewOutputCapability>();
const activeLeaseKeys = new Set<string>();

function validHead(value: string): boolean {
  return /^[a-f0-9]{40}$/u.test(value);
}

function validIso(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function classifyReviewProviderFailure(input: {
  provider: "claude";
  candidate_head: string;
  exit_code: number | null;
  stderr: string;
  observed_at: string;
}):
  | { ok: true; capability: ReviewProviderFailureCapability }
  | { ok: false; failure_code: "REVIEW_FALLBACK_FAILURE_UNCLASSIFIED" } {
  if (!validHead(input.candidate_head) || !validIso(input.observed_at) || input.exit_code === 0) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_FAILURE_UNCLASSIFIED" };
  }
  const stderr = input.stderr.toLowerCase();
  const reason: ReviewFallbackReason | null =
    stderr.includes("weekly limit") || stderr.includes("usage limit")
      ? "provider_quota_exhausted"
      : stderr.includes("unavailable") || stderr.includes("could not connect")
        ? "provider_unavailable"
        : stderr.includes("claim timeout")
          ? "provider_claim_timeout"
          : null;
  if (!reason) return { ok: false, failure_code: "REVIEW_FALLBACK_FAILURE_UNCLASSIFIED" };
  const payload = {
    provider: input.provider,
    candidate_head: input.candidate_head,
    exit_code: input.exit_code,
    stderr_digest: sha256Digest(input.stderr),
    observed_at: input.observed_at,
    reason,
  };
  const capability = Object.freeze({
    kind: "review_provider_failure" as const,
    provider: input.provider,
    candidate_head: input.candidate_head,
    reason,
    observed_at: input.observed_at,
    evidence_digest: sha256Digest(canonicalJson(payload)),
  });
  providerFailures.add(capability);
  return { ok: true, capability };
}

export function selectIndependentReviewProvider(input: {
  primary: "claude";
  fallback: "kimi";
  primary_failure: ReviewProviderFailureCapability | null;
  candidate_head: string;
  task_class: string;
  risk_class: ReviewRiskClass;
  admitted_fallback_task_classes: readonly string[];
}):
  | {
      ok: true;
      provider: IndependentReviewProvider;
      reason: "primary_healthy" | ReviewFallbackReason;
      evidence_digest?: Sha256Digest;
    }
  | {
      ok: false;
      failure_code:
        | "REVIEW_FALLBACK_EVIDENCE_UNSEALED"
        | "REVIEW_FALLBACK_HEAD_MISMATCH"
        | "REVIEW_FALLBACK_TASK_NOT_ADMITTED"
        | "REVIEW_FALLBACK_RISK_NOT_ADMITTED";
    } {
  if (!input.primary_failure) return { ok: true, provider: "claude", reason: "primary_healthy" };
  if (!providerFailures.has(input.primary_failure)) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_EVIDENCE_UNSEALED" };
  }
  if (input.primary_failure.candidate_head !== input.candidate_head) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_HEAD_MISMATCH" };
  }
  if (!input.admitted_fallback_task_classes.includes(input.task_class)) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_TASK_NOT_ADMITTED" };
  }
  if (input.risk_class === "high" || input.risk_class === "critical") {
    return { ok: false, failure_code: "REVIEW_FALLBACK_RISK_NOT_ADMITTED" };
  }
  return {
    ok: true,
    provider: "kimi",
    reason: input.primary_failure.reason,
    evidence_digest: input.primary_failure.evidence_digest,
  };
}

export function issueReviewFallbackLease(input: {
  repository: string;
  pr_number: number;
  candidate_head: string;
  generation: number;
  provider: IndependentReviewProvider;
  issued_at: string;
  expires_at: string;
}):
  | { ok: true; capability: ReviewFallbackLeaseCapability }
  | {
      ok: false;
      failure_code: "REVIEW_FALLBACK_LEASE_INVALID" | "REVIEW_FALLBACK_LEASE_CONFLICT";
    } {
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(input.repository) ||
    !Number.isSafeInteger(input.pr_number) ||
    input.pr_number <= 0 ||
    !validHead(input.candidate_head) ||
    !Number.isSafeInteger(input.generation) ||
    input.generation <= 0 ||
    !validIso(input.issued_at) ||
    !validIso(input.expires_at) ||
    Date.parse(input.expires_at) <= Date.parse(input.issued_at)
  ) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_LEASE_INVALID" };
  }
  const key = `${input.repository}#${input.pr_number}:${input.candidate_head}:${input.generation}`;
  if (activeLeaseKeys.has(key)) {
    return { ok: false, failure_code: "REVIEW_FALLBACK_LEASE_CONFLICT" };
  }
  const payload = { schema_version: "helix-review-fallback-lease.v1", ...input };
  const capability = Object.freeze({
    kind: "review_fallback_lease" as const,
    ...input,
    lease_digest: sha256Digest(canonicalJson(payload)),
  });
  activeLeaseKeys.add(key);
  fallbackLeases.add(capability);
  return { ok: true, capability };
}

export function persistReviewFallbackLease(
  leaseRoot: string,
  lease: ReviewFallbackLeaseCapability,
): string | null {
  if (!fallbackLeases.has(lease) || !leaseRoot.startsWith("/")) return null;
  mkdirSync(leaseRoot, { recursive: true, mode: 0o700 });
  const path = join(leaseRoot, `${lease.lease_digest.slice("sha256:".length)}.json`);
  let descriptor: number;
  try {
    descriptor = openSync(path, "wx", 0o600);
  } catch {
    return null;
  }
  try {
    writeFileSync(descriptor, `${canonicalJson(lease)}\n`);
  } finally {
    closeSync(descriptor);
  }
  return path;
}

export function buildKimiFallbackInvocation(input: {
  executable: string;
  agent_file: string;
  model: string;
  review_packet: string;
  kimi_code_home: string;
}):
  | {
      ok: true;
      command: string;
      args: string[];
      env: Record<string, string>;
      packet_digest: Sha256Digest;
    }
  | { ok: false; failure_code: "KIMI_REVIEW_INVOCATION_INVALID" } {
  if (
    !input.executable.startsWith("/") ||
    !input.agent_file.startsWith("/") ||
    !input.kimi_code_home.startsWith("/") ||
    input.review_packet.length === 0 ||
    input.review_packet.length > 512 * 1024 ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)?$/u.test(input.model)
  ) {
    return { ok: false, failure_code: "KIMI_REVIEW_INVOCATION_INVALID" };
  }
  const boundedPacket = [
    "HELIX independent review output contract:",
    '{"schema_version":"helix-kimi-pr-review-output.v1","candidate_head":"<40 lowercase hex>","verdict":"approve|block","blocker_count":0,"findings":[{"severity":"critical|high|medium","path":"<relative path>","line":1,"code":"<stable code>","message":"<finding>"}]}',
    "blocker_count MUST equal findings.length; approve iff blocker_count is zero.",
    "Review packet:",
    input.review_packet,
  ].join("\n");
  return {
    ok: true,
    command: input.executable,
    args: [
      "-p",
      boundedPacket,
      "--output-format",
      "text",
      "--agent-file",
      input.agent_file,
      "--model",
      input.model,
    ],
    env: {
      KIMI_CODE_HOME: input.kimi_code_home,
      KIMI_CODE_EXPERIMENTAL_FLAG: "1",
      KIMI_DISABLE_TELEMETRY: "1",
      KIMI_CODE_NO_AUTO_UPDATE: "1",
    },
    packet_digest: sha256Digest(boundedPacket),
  };
}

export interface KimiReviewSandboxPlan {
  readonly command: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly cwd: string;
  readonly policy_digest: Sha256Digest;
}

const REQUIRED_AGENT_MARKERS = [
  "tools: []",
  "subagents: []",
  "HELIX_REVIEW_JSON_START",
  "HELIX_REVIEW_JSON_END",
] as const;

export function buildKimiReviewSandboxPlan(input: {
  bubblewrap_path: string;
  invocation: Extract<ReturnType<typeof buildKimiFallbackInvocation>, { ok: true }>;
  host_kimi_code_home: string;
  scratch_path: string;
}):
  | { ok: true; plan: KimiReviewSandboxPlan }
  | {
      ok: false;
      failure_code:
        | "KIMI_REVIEW_SANDBOX_UNAVAILABLE"
        | "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED"
        | "KIMI_REVIEW_AGENT_POLICY_INVALID";
    } {
  if (
    !input.bubblewrap_path.startsWith("/") ||
    !existsSync(input.bubblewrap_path) ||
    !existsSync(input.invocation.command) ||
    !existsSync(input.invocation.args[input.invocation.args.indexOf("--agent-file") + 1] ?? "")
  ) {
    return { ok: false, failure_code: "KIMI_REVIEW_SANDBOX_UNAVAILABLE" };
  }
  const agentFile = input.invocation.args[input.invocation.args.indexOf("--agent-file") + 1] ?? "";
  let agentBytes: Buffer;
  try {
    agentBytes = readFileSync(agentFile);
  } catch {
    return { ok: false, failure_code: "KIMI_REVIEW_AGENT_POLICY_INVALID" };
  }
  const agentText = agentBytes.toString("utf8");
  if (REQUIRED_AGENT_MARKERS.some((marker) => !agentText.includes(marker))) {
    return { ok: false, failure_code: "KIMI_REVIEW_AGENT_POLICY_INVALID" };
  }
  const authBindings = ["config.toml", "credentials", "oauth", "device_id"];
  if (authBindings.some((entry) => !existsSync(join(input.host_kimi_code_home, entry)))) {
    return { ok: false, failure_code: "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED" };
  }
  const sandboxKimiHome = "/helix-kimi-home";
  const sandboxAgent = "/helix-policy/kimi-reviewer.md";
  const sandboxRuntime = "/helix-provider/kimi";
  const args = [
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
    "--ro-bind",
    "/lib",
    "/lib",
    "--ro-bind",
    "/lib64",
    "/lib64",
    "--ro-bind",
    "/etc/ssl",
    "/etc/ssl",
    "--ro-bind",
    "/etc/resolv.conf",
    "/etc/resolv.conf",
    "--ro-bind",
    "/etc/hosts",
    "/etc/hosts",
    "--ro-bind",
    "/etc/nsswitch.conf",
    "/etc/nsswitch.conf",
    "--proc",
    "/proc",
    "--dev",
    "/dev",
    "--tmpfs",
    "/tmp",
    "--dir",
    "/workspace",
    "--dir",
    sandboxKimiHome,
    "--dir",
    "/helix-policy",
    "--dir",
    "/helix-provider",
    "--ro-bind",
    input.invocation.command,
    sandboxRuntime,
    "--ro-bind",
    agentFile,
    sandboxAgent,
    "--ro-bind",
    join(input.host_kimi_code_home, "config.toml"),
    `${sandboxKimiHome}/config.toml`,
    "--bind",
    join(input.host_kimi_code_home, "credentials"),
    `${sandboxKimiHome}/credentials`,
    "--bind",
    join(input.host_kimi_code_home, "oauth"),
    `${sandboxKimiHome}/oauth`,
    "--ro-bind",
    join(input.host_kimi_code_home, "device_id"),
    `${sandboxKimiHome}/device_id`,
    "--setenv",
    "HOME",
    "/workspace",
    ...Object.entries({
      ...input.invocation.env,
      KIMI_CODE_HOME: sandboxKimiHome,
      PATH: "/usr/bin:/bin",
      LANG: "C.UTF-8",
      TMPDIR: "/tmp",
    }).flatMap(([key, value]) => ["--setenv", key, value]),
    "--chdir",
    "/workspace",
    "--",
    sandboxRuntime,
    ...input.invocation.args.map((argument) => (argument === agentFile ? sandboxAgent : argument)),
  ];
  const policy = {
    schema_version: "helix-kimi-review-sandbox.v1",
    filesystem: "bounded-empty-workspace",
    tools: "none",
    subagents: "none",
    project_credentials: "not_mounted",
    provider_auth: ["config.toml", "credentials", "oauth", "device_id"],
    // bwrap alone does not implement a hostname egress allowlist. Keep this
    // claim explicit so admission cannot mistake an empty project filesystem
    // for network isolation.
    network: "host-network-provider-transport-unrestricted",
    telemetry: "disabled",
    update: "disabled",
    runtime_digest: sha256Digest(readFileSync(input.invocation.command)),
    agent_digest: sha256Digest(agentBytes),
  };
  return {
    ok: true,
    plan: Object.freeze({
      command: input.bubblewrap_path,
      args: Object.freeze(args),
      env: Object.freeze({}),
      cwd: input.scratch_path,
      policy_digest: sha256Digest(canonicalJson(policy)),
    }),
  };
}

export type KimiReviewSpawn = (
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions,
) => { status: number | null; stdout?: string | Buffer; stderr?: string | Buffer };

export function executeKimiFallbackReview(input: {
  invocation: Extract<ReturnType<typeof buildKimiFallbackInvocation>, { ok: true }>;
  candidate_head: string;
  bubblewrap_path: string;
  host_kimi_code_home: string;
  scratch_base: string;
  spawn?: KimiReviewSpawn;
}):
  | { ok: true; capability: KimiReviewOutputCapability; policy_digest: Sha256Digest }
  | { ok: false; failure_code: KimiReviewExecutionFailureCode } {
  const scratch = mkdtempSync(join(input.scratch_base, "kimi-review-"));
  try {
    const stagedAuth = join(scratch, "provider-auth");
    mkdirSync(stagedAuth, { mode: 0o700 });
    for (const entry of ["config.toml", "credentials", "oauth", "device_id"] as const) {
      const source = join(input.host_kimi_code_home, entry);
      if (!existsSync(source)) {
        return { ok: false, failure_code: "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED" };
      }
      cpSync(source, join(stagedAuth, entry), { recursive: true, force: false });
    }
    const planned = buildKimiReviewSandboxPlan({
      bubblewrap_path: input.bubblewrap_path,
      invocation: input.invocation,
      host_kimi_code_home: stagedAuth,
      scratch_path: scratch,
    });
    if (!planned.ok) return planned;
    const spawn =
      input.spawn ??
      ((command: string, args: readonly string[], options: SpawnSyncOptions) =>
        spawnSync(command, args, options));
    const result = spawn(planned.plan.command, planned.plan.args, {
      cwd: planned.plan.cwd,
      env: planned.plan.env,
      encoding: "buffer",
      timeout: 10 * 60 * 1000,
      maxBuffer: 8 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.status !== 0) return { ok: false, failure_code: "KIMI_REVIEW_PROCESS_FAILED" };
    const stdout = Buffer.isBuffer(result.stdout)
      ? result.stdout.toString("utf8")
      : (result.stdout ?? "");
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : (result.stderr ?? "");
    const toolActivity = /(?:tool_calls|Tool call|Executing tool|AgentSwarm)/u.test(
      `${stdout}\n${stderr}`,
    );
    const parsed = parseKimiReviewOutput(stdout, input.candidate_head, toolActivity);
    if (!parsed.ok) return parsed;
    return { ok: true, capability: parsed.capability, policy_digest: planned.plan.policy_digest };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const findingSchema = z
  .object({
    severity: z.enum(["critical", "high", "medium"]),
    path: z.string().min(1),
    line: z.number().int().positive(),
    code: z.string().min(1),
    message: z.string().min(1),
  })
  .strict();
const outputSchema = z
  .object({
    schema_version: z.literal("helix-kimi-pr-review-output.v1"),
    candidate_head: z.string().regex(/^[a-f0-9]{40}$/u),
    verdict: z.enum(["approve", "block"]),
    blocker_count: z.number().int().nonnegative(),
    findings: z.array(findingSchema),
  })
  .strict()
  .superRefine((value, context) => {
    if ((value.verdict === "approve") !== (value.blocker_count === 0)) {
      context.addIssue({ code: "custom", message: "verdict and blocker_count mismatch" });
    }
    if (value.blocker_count !== value.findings.length) {
      context.addIssue({ code: "custom", message: "blocker_count and findings mismatch" });
    }
  });

export function parseKimiReviewOutput(
  output: string,
  candidateHead: string,
  toolActivityDetected: boolean,
):
  | { ok: true; capability: KimiReviewOutputCapability }
  | {
      ok: false;
      failure_code:
        | "KIMI_REVIEW_OUTPUT_INVALID"
        | "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED"
        | "KIMI_REVIEW_HEAD_MISMATCH";
    } {
  if (toolActivityDetected) {
    return { ok: false, failure_code: "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED" };
  }
  const start = "HELIX_REVIEW_JSON_START";
  const end = "HELIX_REVIEW_JSON_END";
  const startIndex = output.indexOf(start);
  const endIndex = output.indexOf(end);
  if (
    startIndex < 0 ||
    endIndex < 0 ||
    output.indexOf(start, startIndex + start.length) >= 0 ||
    output.indexOf(end, endIndex + end.length) >= 0 ||
    endIndex <= startIndex
  ) {
    return { ok: false, failure_code: "KIMI_REVIEW_OUTPUT_INVALID" };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(output.slice(startIndex + start.length, endIndex).trim());
  } catch {
    return { ok: false, failure_code: "KIMI_REVIEW_OUTPUT_INVALID" };
  }
  const parsed = outputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, failure_code: "KIMI_REVIEW_OUTPUT_INVALID" };
  if (parsed.data.candidate_head !== candidateHead) {
    return { ok: false, failure_code: "KIMI_REVIEW_HEAD_MISMATCH" };
  }
  const outputDigest = sha256Digest(canonicalJson(parsed.data));
  const capability = Object.freeze({
    kind: "kimi_review_output" as const,
    candidate_head: parsed.data.candidate_head,
    verdict: parsed.data.verdict,
    blocker_count: parsed.data.blocker_count,
    findings: Object.freeze(parsed.data.findings.map((finding) => Object.freeze({ ...finding }))),
    findings_digest: sha256Digest(canonicalJson(parsed.data.findings)),
    output_digest: outputDigest,
  });
  kimiOutputs.add(capability);
  return { ok: true, capability };
}

export interface ProviderNeutralReviewReceiptV3 {
  schema_version: "helix-independent-pr-review-receipt.v3";
  repository: string;
  pr_number: number;
  candidate_head: string;
  author_runtime: string;
  reviewer_provider: IndependentReviewProvider;
  reviewer_runtime: string;
  reviewer_model: string;
  reviewer_session: string;
  fallback_reason: ReviewFallbackReason;
  fallback_evidence_digest: Sha256Digest;
  lease_digest: Sha256Digest;
  review_packet_digest: Sha256Digest;
  output_digest: Sha256Digest;
  findings_digest: Sha256Digest;
  verdict: "approve" | "block";
  blocker_count: number;
  ci_run_id: number;
  ci_conclusion: "success";
  db_receipt_digest: Sha256Digest;
  db_converged: true;
  reviewed_at: string;
  receipt_digest: Sha256Digest;
}

export function buildProviderNeutralReviewReceipt(input: {
  repository: string;
  pr_number: number;
  candidate_head: string;
  author_runtime: string;
  reviewer_provider: "kimi";
  reviewer_runtime: string;
  reviewer_model: string;
  reviewer_session: string;
  fallback_evidence: ReviewProviderFailureCapability;
  lease: ReviewFallbackLeaseCapability;
  review_packet_digest: Sha256Digest;
  output: KimiReviewOutputCapability;
  ci_run_id: number;
  ci_conclusion: "success";
  db_receipt_digest: Sha256Digest;
  db_converged: true;
  reviewed_at: string;
}):
  | { ok: true; receipt: ProviderNeutralReviewReceiptV3 }
  | { ok: false; failure_code: "INDEPENDENT_REVIEW_RECEIPT_BINDING_INVALID" } {
  if (
    !providerFailures.has(input.fallback_evidence) ||
    !fallbackLeases.has(input.lease) ||
    !kimiOutputs.has(input.output) ||
    input.fallback_evidence.candidate_head !== input.candidate_head ||
    input.lease.candidate_head !== input.candidate_head ||
    input.lease.repository !== input.repository ||
    input.lease.pr_number !== input.pr_number ||
    input.lease.provider !== input.reviewer_provider ||
    input.output.candidate_head !== input.candidate_head ||
    input.author_runtime === input.reviewer_runtime ||
    !Number.isSafeInteger(input.ci_run_id) ||
    input.ci_run_id <= 0 ||
    !validIso(input.reviewed_at)
  ) {
    return { ok: false, failure_code: "INDEPENDENT_REVIEW_RECEIPT_BINDING_INVALID" };
  }
  const payload = {
    schema_version: "helix-independent-pr-review-receipt.v3" as const,
    repository: input.repository,
    pr_number: input.pr_number,
    candidate_head: input.candidate_head,
    author_runtime: input.author_runtime,
    reviewer_provider: input.reviewer_provider,
    reviewer_runtime: input.reviewer_runtime,
    reviewer_model: input.reviewer_model,
    reviewer_session: input.reviewer_session,
    fallback_reason: input.fallback_evidence.reason,
    fallback_evidence_digest: input.fallback_evidence.evidence_digest,
    lease_digest: input.lease.lease_digest,
    review_packet_digest: input.review_packet_digest,
    output_digest: input.output.output_digest,
    findings_digest: input.output.findings_digest,
    verdict: input.output.verdict,
    blocker_count: input.output.blocker_count,
    ci_run_id: input.ci_run_id,
    ci_conclusion: input.ci_conclusion,
    db_receipt_digest: input.db_receipt_digest,
    db_converged: input.db_converged,
    reviewed_at: input.reviewed_at,
  };
  return {
    ok: true,
    receipt: Object.freeze({ ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) }),
  };
}
