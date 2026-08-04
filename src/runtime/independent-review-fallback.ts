import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import {
  closeSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
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

export interface KimiReviewFallbackAdmissionReceiptV1 {
  readonly schema_version: "helix-kimi-review-fallback-admission.v1";
  readonly provider: "kimi";
  readonly task_class: "pr_convergence_review";
  readonly admitted_risk_classes: readonly ["low", "medium"];
  readonly admission_implementation_head: string;
  readonly benchmark_fixture_digest: Sha256Digest;
  readonly negative_oracle_digest: Sha256Digest;
  readonly independent_verifier_provider: "claude" | "human_po_bootstrap";
  readonly bootstrap_authority_digest: Sha256Digest | null;
  readonly verdict: "admit";
  readonly issued_at: string;
  readonly expires_at: string;
  readonly receipt_digest: Sha256Digest;
}

export type KimiReviewExecutionFailureCode =
  | "KIMI_REVIEW_SANDBOX_UNAVAILABLE"
  | "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED"
  | "KIMI_REVIEW_ACP_PROTOCOL_INVALID"
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

export function validateKimiReviewFallbackAdmission(
  value: unknown,
  now: string,
): KimiReviewFallbackAdmissionReceiptV1 {
  if (!value || typeof value !== "object" || !validIso(now)) {
    throw new Error("kimi_review_admission_invalid");
  }
  const receipt = value as KimiReviewFallbackAdmissionReceiptV1;
  const { receipt_digest: claimed, ...payload } = receipt;
  if (
    receipt.schema_version !== "helix-kimi-review-fallback-admission.v1" ||
    receipt.provider !== "kimi" ||
    receipt.task_class !== "pr_convergence_review" ||
    !Array.isArray(receipt.admitted_risk_classes) ||
    receipt.admitted_risk_classes.length !== 2 ||
    receipt.admitted_risk_classes[0] !== "low" ||
    receipt.admitted_risk_classes[1] !== "medium" ||
    !validHead(receipt.admission_implementation_head) ||
    !["claude", "human_po_bootstrap"].includes(receipt.independent_verifier_provider) ||
    (receipt.independent_verifier_provider === "claude" &&
      receipt.bootstrap_authority_digest !== null) ||
    (receipt.independent_verifier_provider === "human_po_bootstrap" &&
      !/^sha256:[a-f0-9]{64}$/u.test(receipt.bootstrap_authority_digest ?? "")) ||
    receipt.verdict !== "admit" ||
    !validIso(receipt.issued_at) ||
    !validIso(receipt.expires_at) ||
    Date.parse(receipt.issued_at) >= Date.parse(receipt.expires_at) ||
    Date.parse(now) > Date.parse(receipt.expires_at) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.benchmark_fixture_digest) ||
    !/^sha256:[a-f0-9]{64}$/u.test(receipt.negative_oracle_digest) ||
    claimed !== sha256Digest(canonicalJson(payload))
  ) {
    throw new Error("kimi_review_admission_invalid");
  }
  return Object.freeze(receipt);
}

export function validateKimiReviewFallbackAdmissionForImplementation(
  value: unknown,
  now: string,
  implementationHead: string,
): KimiReviewFallbackAdmissionReceiptV1 {
  const receipt = validateKimiReviewFallbackAdmission(value, now);
  if (
    !validHead(implementationHead) ||
    receipt.admission_implementation_head !== implementationHead
  ) {
    throw new Error("kimi_review_admission_implementation_head_mismatch");
  }
  return receipt;
}

const benchmarkCaseOutcomes = {
  clean_approve: "approve",
  seeded_blocker: "block",
  tool_request: "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED",
  schema_drift: "KIMI_REVIEW_OUTPUT_INVALID",
  quota_switch: "kimi",
} as const;

const admissionBenchmarkEvidenceSchema = z
  .object({
    schema_version: z.literal("helix-kimi-review-fallback-benchmark.v1"),
    provider: z.literal("kimi"),
    task_class: z.literal("pr_convergence_review"),
    implementation_head: z.string().regex(/^[a-f0-9]{40}$/u),
    cases: z.array(
      z
        .object({
          case_id: z.enum(
            Object.keys(benchmarkCaseOutcomes) as [
              keyof typeof benchmarkCaseOutcomes,
              ...(keyof typeof benchmarkCaseOutcomes)[],
            ],
          ),
          observed_outcome: z.string().min(1),
          passed: z.literal(true),
          evidence_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((value, context) => {
    const expected = Object.keys(benchmarkCaseOutcomes).sort();
    const actual = value.cases.map((entry) => entry.case_id).sort();
    if (actual.length !== expected.length || actual.some((id, index) => id !== expected[index])) {
      context.addIssue({ code: "custom", message: "benchmark case exact set mismatch" });
    }
    for (const entry of value.cases) {
      if (entry.observed_outcome !== benchmarkCaseOutcomes[entry.case_id]) {
        context.addIssue({
          code: "custom",
          message: `benchmark outcome mismatch:${entry.case_id}`,
        });
      }
    }
  });

const negativeMutationIds = [
  "remove_head_binding",
  "allow_high_risk",
  "allow_tool_activity",
  "reuse_stale_receipt",
] as const;
const admissionNegativeOracleSchema = z
  .object({
    schema_version: z.literal("helix-kimi-review-fallback-negative-oracle.v1"),
    implementation_head: z.string().regex(/^[a-f0-9]{40}$/u),
    mutations: z.array(
      z
        .object({
          mutation_id: z.enum(negativeMutationIds),
          killed: z.literal(true),
          evidence_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((value, context) => {
    const actual = value.mutations.map((entry) => entry.mutation_id).sort();
    const expected = [...negativeMutationIds].sort();
    if (actual.length !== expected.length || actual.some((id, index) => id !== expected[index])) {
      context.addIssue({ code: "custom", message: "negative mutation exact set mismatch" });
    }
  });

export function buildKimiReviewFallbackAdmission(input: {
  benchmark_evidence: unknown;
  negative_oracle_evidence: unknown;
  independent_verifier_provider: "claude" | "human_po_bootstrap";
  bootstrap_authority_digest?: Sha256Digest;
  issued_at: string;
  expires_at: string;
}): KimiReviewFallbackAdmissionReceiptV1 {
  const benchmark = admissionBenchmarkEvidenceSchema.parse(input.benchmark_evidence);
  const negativeOracle = admissionNegativeOracleSchema.parse(input.negative_oracle_evidence);
  if (benchmark.implementation_head !== negativeOracle.implementation_head) {
    throw new Error("kimi_review_admission_invalid");
  }
  const payload = {
    schema_version: "helix-kimi-review-fallback-admission.v1" as const,
    provider: "kimi" as const,
    task_class: "pr_convergence_review" as const,
    admitted_risk_classes: Object.freeze(["low", "medium"] as const),
    admission_implementation_head: benchmark.implementation_head,
    benchmark_fixture_digest: sha256Digest(canonicalJson(benchmark)),
    negative_oracle_digest: sha256Digest(canonicalJson(negativeOracle)),
    independent_verifier_provider: input.independent_verifier_provider,
    bootstrap_authority_digest:
      input.independent_verifier_provider === "human_po_bootstrap"
        ? (input.bootstrap_authority_digest ?? null)
        : null,
    verdict: "admit" as const,
    issued_at: input.issued_at,
    expires_at: input.expires_at,
  };
  const receipt = Object.freeze({
    ...payload,
    receipt_digest: sha256Digest(canonicalJson(payload)),
  });
  return validateKimiReviewFallbackAdmission(receipt, input.issued_at);
}

export function persistKimiReviewFallbackAdmission(
  receiptRoot: string,
  receipt: KimiReviewFallbackAdmissionReceiptV1,
): string {
  const validated = validateKimiReviewFallbackAdmission(receipt, receipt.issued_at);
  if (!receiptRoot.startsWith("/")) throw new Error("admission_root_invalid");
  mkdirSync(receiptRoot, { recursive: true, mode: 0o700 });
  const path = join(receiptRoot, `${validated.receipt_digest.slice("sha256:".length)}.json`);
  const content = `${canonicalJson(validated)}\n`;
  if (existsSync(path)) {
    if (readFileSync(path, "utf8") === content) return path;
    throw new Error("admission_receipt_conflict");
  }
  const descriptor = openSync(path, "wx", 0o600);
  try {
    writeFileSync(descriptor, content);
  } finally {
    closeSync(descriptor);
  }
  return path;
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
  maxAttemptsPerHead = 1,
): string | null {
  if (
    !fallbackLeases.has(lease) ||
    !leaseRoot.startsWith("/") ||
    !Number.isSafeInteger(maxAttemptsPerHead) ||
    maxAttemptsPerHead < 1
  ) {
    return null;
  }
  mkdirSync(leaseRoot, { recursive: true, mode: 0o700 });
  let attempts = 0;
  for (const name of readdirSync(leaseRoot)) {
    if (!name.endsWith(".json")) continue;
    try {
      const existing = JSON.parse(readFileSync(join(leaseRoot, name), "utf8")) as Record<
        string,
        unknown
      >;
      if (
        existing.repository === lease.repository &&
        existing.pr_number === lease.pr_number &&
        existing.candidate_head === lease.candidate_head &&
        existing.provider === "kimi"
      ) {
        attempts += 1;
      }
    } catch {
      return null;
    }
  }
  if (attempts >= maxAttemptsPerHead) return null;
  const identity = sha256Digest(
    canonicalJson({
      repository: lease.repository,
      pr_number: lease.pr_number,
      candidate_head: lease.candidate_head,
      generation: lease.generation,
    }),
  );
  const path = join(leaseRoot, `${identity.slice("sha256:".length)}.json`);
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
  model: string;
  review_packet: string;
  kimi_code_home: string;
}):
  | {
      ok: true;
      command: string;
      args: string[];
      env: Record<string, string>;
      prompt: string;
      model: string;
      packet_digest: Sha256Digest;
    }
  | { ok: false; failure_code: "KIMI_REVIEW_INVOCATION_INVALID" } {
  if (
    !input.executable.startsWith("/") ||
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
    "Use only the bounded review packet below. Do not call tools, request permissions, read files, run commands, or inspect the workspace.",
    "Return only the required JSON between HELIX_REVIEW_JSON_START and HELIX_REVIEW_JSON_END.",
    "Review packet:",
    input.review_packet,
  ].join("\n");
  return {
    ok: true,
    command: input.executable,
    args: ["acp"],
    env: {
      KIMI_CODE_HOME: input.kimi_code_home,
      KIMI_CODE_EXPERIMENTAL_FLAG: "1",
      KIMI_DISABLE_TELEMETRY: "1",
      KIMI_CODE_NO_AUTO_UPDATE: "1",
    },
    prompt: boundedPacket,
    model: input.model,
    packet_digest: sha256Digest(boundedPacket),
  };
}

export interface KimiReviewSandboxPlan {
  readonly command: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly cwd: string;
  readonly policy_digest: Sha256Digest;
  readonly model: string;
}

export function buildKimiReviewSandboxPlan(input: {
  bubblewrap_path: string;
  invocation: Extract<ReturnType<typeof buildKimiFallbackInvocation>, { ok: true }>;
  host_kimi_code_home: string;
  scratch_path: string;
}):
  | { ok: true; plan: KimiReviewSandboxPlan }
  | {
      ok: false;
      failure_code: "KIMI_REVIEW_SANDBOX_UNAVAILABLE" | "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED";
    } {
  if (
    !input.bubblewrap_path.startsWith("/") ||
    !existsSync(input.bubblewrap_path) ||
    !existsSync(input.invocation.command)
  ) {
    return { ok: false, failure_code: "KIMI_REVIEW_SANDBOX_UNAVAILABLE" };
  }
  const authBindings = ["config.toml", "credentials", "oauth", "device_id"];
  if (authBindings.some((entry) => !existsSync(join(input.host_kimi_code_home, entry)))) {
    return { ok: false, failure_code: "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED" };
  }
  const sandboxKimiHome = "/helix-kimi-home";
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
    "/helix-provider",
    "--ro-bind",
    input.invocation.command,
    sandboxRuntime,
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
    ...input.invocation.args,
  ];
  const policy = {
    schema_version: "helix-kimi-review-sandbox.v1",
    filesystem: "bounded-empty-workspace",
    protocol: "acp-v1-json-rpc-stdio",
    client_filesystem: "disabled",
    client_terminal: "disabled",
    mcp_servers: "empty",
    permission_requests: "reject-and-fail",
    tool_activity: "fail-close",
    project_credentials: "not_mounted",
    provider_auth: ["config.toml", "credentials", "oauth", "device_id"],
    // bwrap alone does not implement a hostname egress allowlist. Keep this
    // claim explicit so admission cannot mistake an empty project filesystem
    // for network isolation.
    network: "host-network-provider-transport-unrestricted",
    telemetry: "disabled",
    update: "disabled",
    runtime_digest: sha256Digest(readFileSync(input.invocation.command)),
    requested_model: input.invocation.model,
  };
  return {
    ok: true,
    plan: Object.freeze({
      command: input.bubblewrap_path,
      args: Object.freeze(args),
      env: Object.freeze({}),
      cwd: input.scratch_path,
      policy_digest: sha256Digest(canonicalJson(policy)),
      model: input.invocation.model,
    }),
  };
}

interface AcpResponse {
  readonly jsonrpc?: string;
  readonly id?: number | string;
  readonly method?: string;
  readonly params?: Record<string, unknown>;
  readonly result?: Record<string, unknown>;
  readonly error?: unknown;
}

export interface KimiAcpTranscriptResult {
  readonly output: string;
  readonly session_id: string;
  readonly tool_activity: boolean;
  readonly completed: boolean;
}

export type KimiAcpRunResult =
  | { readonly ok: true; readonly transcript: KimiAcpTranscriptResult }
  | { readonly ok: false; readonly failure_code: KimiReviewExecutionFailureCode };

export function classifyKimiAcpError(message: unknown): KimiReviewExecutionFailureCode {
  if (!message || typeof message !== "object") return "KIMI_REVIEW_ACP_PROTOCOL_INVALID";
  const error = (message as { readonly error?: unknown }).error;
  if (!error || typeof error !== "object") return "KIMI_REVIEW_ACP_PROTOCOL_INVALID";
  const text = (error as { readonly message?: unknown }).message;
  return typeof text === "string" && /authentication required/iu.test(text)
    ? "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED"
    : "KIMI_REVIEW_ACP_PROTOCOL_INVALID";
}

function acpResponseFor(
  messages: readonly AcpResponse[],
  id: number | string,
): AcpResponse | undefined {
  return messages.find(
    (message) => message.id === id && message.method === undefined && message.result !== undefined,
  );
}

export function evaluateKimiAcpTranscript(
  messages: readonly AcpResponse[],
  requestedModel = "kimi-code/k3-256k",
): KimiAcpTranscriptResult | null {
  const initialized = acpResponseFor(messages, 0)?.result;
  const protocolVersion = initialized?.protocolVersion;
  const agentInfo = initialized?.agentInfo as Record<string, unknown> | undefined;
  if (protocolVersion !== 1 || agentInfo?.name !== "Kimi Code CLI") return null;
  const sessionResult = acpResponseFor(messages, 1)?.result;
  const sessionId = sessionResult?.sessionId;
  if (typeof sessionId !== "string" || sessionId.length === 0) return null;
  const selectedValue = (result: Record<string, unknown> | undefined, id: string): unknown => {
    const options = result?.configOptions;
    if (!Array.isArray(options)) return undefined;
    return (
      options.find((option) => (option as Record<string, unknown>).id === id) as
        | Record<string, unknown>
        | undefined
    )?.currentValue;
  };
  if (selectedValue(acpResponseFor(messages, 2)?.result, "mode") !== "plan") {
    return null;
  }
  if (selectedValue(acpResponseFor(messages, 3)?.result, "model") !== requestedModel) {
    return null;
  }
  const promptResult = acpResponseFor(messages, 4)?.result;
  if (promptResult?.stopReason !== "end_turn") return null;
  let output = "";
  let toolActivity = false;
  for (const message of messages) {
    if (message.method === "session/request_permission") toolActivity = true;
    if (message.method === "fs/read_text_file" || message.method === "fs/write_text_file") {
      toolActivity = true;
    }
    if (message.method === "terminal/create" || message.method === "terminal/output") {
      toolActivity = true;
    }
    if (message.method !== "session/update") continue;
    const update = message.params?.update as Record<string, unknown> | undefined;
    if (typeof update?.sessionUpdate === "string" && update.sessionUpdate.includes("tool")) {
      toolActivity = true;
    }
    if (update?.sessionUpdate === "agent_message_chunk") {
      const content = update.content as Record<string, unknown> | undefined;
      if (content?.type === "text" && typeof content.text === "string") output += content.text;
    }
  }
  return { output, session_id: sessionId, tool_activity: toolActivity, completed: true };
}

export function runKimiAcp(
  plan: KimiReviewSandboxPlan,
  prompt: string,
  timeoutMs: number,
): Promise<KimiAcpRunResult> {
  return new Promise((resolve) => {
    const child: ChildProcessWithoutNullStreams = spawn(plan.command, [...plan.args], {
      cwd: plan.cwd,
      env: plan.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const messages: AcpResponse[] = [];
    let buffer = "";
    let settled = false;
    const send = (value: object): void => {
      child.stdin.write(`${JSON.stringify(value)}\n`);
    };
    const finish = (value: KimiAcpRunResult): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGTERM");
      resolve(value);
    };
    const protocolFailure = (): KimiAcpRunResult => ({
      ok: false,
      failure_code: "KIMI_REVIEW_ACP_PROTOCOL_INVALID",
    });
    const timer = setTimeout(() => finish(protocolFailure()), timeoutMs);
    child.once("error", () => finish({ ok: false, failure_code: "KIMI_REVIEW_PROCESS_FAILED" }));
    child.once("close", () => {
      if (!settled) {
        finish({ ok: false, failure_code: "KIMI_REVIEW_PROCESS_FAILED" });
      }
    });
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      buffer += chunk;
      while (buffer.includes("\n")) {
        const newline = buffer.indexOf("\n");
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        let message: AcpResponse;
        try {
          message = JSON.parse(line) as AcpResponse;
        } catch {
          finish(protocolFailure());
          return;
        }
        messages.push(message);
        if (message.method === undefined && message.error !== undefined) {
          finish({ ok: false, failure_code: classifyKimiAcpError(message) });
          return;
        }
        if (message.method === "session/request_permission" && message.id !== undefined) {
          const options = (message.params?.options ?? []) as Array<Record<string, unknown>>;
          const rejected = options.find((option) =>
            ["reject_always", "reject_once"].includes(String(option.kind)),
          );
          send({
            jsonrpc: "2.0",
            id: message.id,
            result: rejected
              ? { outcome: { outcome: "selected", optionId: rejected.optionId } }
              : { outcome: { outcome: "cancelled" } },
          });
        } else if (message.method && message.id !== undefined) {
          send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "denied" } });
        }
        const isResponse = message.method === undefined && message.result !== undefined;
        if (isResponse && message.id === 0) {
          send({
            jsonrpc: "2.0",
            id: 1,
            method: "session/new",
            params: { cwd: "/workspace", mcpServers: [] },
          });
        } else if (isResponse && message.id === 1) {
          send({
            jsonrpc: "2.0",
            id: 2,
            method: "session/set_config_option",
            params: {
              sessionId: acpResponseFor(messages, 1)?.result?.sessionId,
              configId: "mode",
              value: "plan",
            },
          });
        } else if (isResponse && message.id === 2) {
          send({
            jsonrpc: "2.0",
            id: 3,
            method: "session/set_config_option",
            params: {
              sessionId: acpResponseFor(messages, 1)?.result?.sessionId,
              configId: "model",
              value: plan.model,
            },
          });
        } else if (isResponse && message.id === 3) {
          send({
            jsonrpc: "2.0",
            id: 4,
            method: "session/prompt",
            params: {
              sessionId: acpResponseFor(messages, 1)?.result?.sessionId,
              prompt: [{ type: "text", text: prompt }],
            },
          });
        } else if (isResponse && message.id === 4) {
          const transcript = evaluateKimiAcpTranscript(messages, plan.model);
          finish(transcript ? { ok: true, transcript } : protocolFailure());
        }
      }
    });
    send({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: 1,
        clientCapabilities: {
          fs: { readTextFile: false, writeTextFile: false },
          terminal: false,
        },
        clientInfo: { name: "HELIX", version: "1" },
      },
    });
  });
}

export async function executeKimiFallbackReview(input: {
  invocation: Extract<ReturnType<typeof buildKimiFallbackInvocation>, { ok: true }>;
  candidate_head: string;
  bubblewrap_path: string;
  host_kimi_code_home: string;
  scratch_base: string;
  timeout_ms?: number;
}): Promise<
  | {
      ok: true;
      capability: KimiReviewOutputCapability;
      policy_digest: Sha256Digest;
      reviewer_session: string;
    }
  | { ok: false; failure_code: KimiReviewExecutionFailureCode }
> {
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
    const transcript = await runKimiAcp(
      planned.plan,
      input.invocation.prompt,
      input.timeout_ms ?? 10 * 60 * 1000,
    );
    if (!transcript.ok) return transcript;
    const parsed = parseKimiReviewOutput(
      transcript.transcript.output,
      input.candidate_head,
      transcript.transcript.tool_activity,
    );
    if (!parsed.ok) return parsed;
    return {
      ok: true,
      capability: parsed.capability,
      policy_digest: planned.plan.policy_digest,
      reviewer_session: transcript.transcript.session_id,
    };
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

export function validateProviderNeutralReviewReceipt(
  value: unknown,
): ProviderNeutralReviewReceiptV3 {
  if (!value || typeof value !== "object") throw new Error("receipt_object_required");
  const receipt = value as ProviderNeutralReviewReceiptV3;
  const { receipt_digest: claimed, ...payload } = receipt;
  if (
    receipt.schema_version !== "helix-independent-pr-review-receipt.v3" ||
    receipt.reviewer_provider !== "kimi" ||
    !validHead(receipt.candidate_head) ||
    receipt.verdict !== "approve" ||
    receipt.blocker_count !== 0 ||
    receipt.ci_conclusion !== "success" ||
    receipt.db_converged !== true ||
    !validIso(receipt.reviewed_at) ||
    claimed !== sha256Digest(canonicalJson(payload))
  ) {
    throw new Error("provider_neutral_receipt_invalid");
  }
  return Object.freeze(receipt);
}

export function persistProviderNeutralReviewReceipt(
  receiptRoot: string,
  receipt: ProviderNeutralReviewReceiptV3,
): string {
  const validated = validateProviderNeutralReviewReceipt(receipt);
  if (!receiptRoot.startsWith("/")) throw new Error("receipt_root_invalid");
  mkdirSync(receiptRoot, { recursive: true, mode: 0o700 });
  const path = join(receiptRoot, `${validated.receipt_digest.slice("sha256:".length)}.json`);
  const content = `${canonicalJson(validated)}\n`;
  if (existsSync(path)) {
    if (readFileSync(path, "utf8") === content) return path;
    throw new Error("review_receipt_conflict");
  }
  const descriptor = openSync(path, "wx", 0o600);
  try {
    writeFileSync(descriptor, content);
  } finally {
    closeSync(descriptor);
  }
  return path;
}

export function loadProviderNeutralReviewReceipt(path: string): ProviderNeutralReviewReceiptV3 {
  return validateProviderNeutralReviewReceipt(JSON.parse(readFileSync(path, "utf8")) as unknown);
}

export function evaluateProviderNeutralReviewMerge(
  state: {
    repository: string;
    pr_number: number;
    candidate_head: string;
    state: "OPEN" | "CLOSED" | "MERGED";
    required_checks_green: boolean;
    receipt_ci_matches_head: boolean;
  },
  receipt: ProviderNeutralReviewReceiptV3,
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (state.repository !== receipt.repository || state.pr_number !== receipt.pr_number) {
    reasons.push("pr_identity_mismatch");
  }
  if (state.candidate_head !== receipt.candidate_head) reasons.push("review_head_stale");
  if (state.state !== "OPEN") reasons.push("pr_not_open");
  if (!state.required_checks_green) reasons.push("required_checks_not_green");
  if (!state.receipt_ci_matches_head) reasons.push("receipt_ci_head_mismatch");
  if (receipt.author_runtime === receipt.reviewer_runtime)
    reasons.push("runtime_independence_missing");
  if (receipt.verdict !== "approve" || receipt.blocker_count !== 0) {
    reasons.push("review_not_approved");
  }
  if (!receipt.db_converged) reasons.push("db_not_converged");
  return { ok: reasons.length === 0, reasons };
}
