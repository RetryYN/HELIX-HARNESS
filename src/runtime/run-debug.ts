type RuntimeClaim = "fired" | "used" | "works" | "blocked" | "recovered" | "observed" | "executed";

type RuntimeVerificationClass =
  | "runtime_verified"
  | "projection_only_unverified"
  | "missing_runtime_provenance"
  | "not_runtime_claim";

export type RuntimeEvidenceSource =
  | "runtime-hook"
  | "adapter-command"
  | "run-debug"
  | "hosted-preflight"
  | "projection";

export type RuntimeSurface =
  | "claude-hook"
  | "codex-hook"
  | "codex-hosted-api"
  | "ut-tdd-cli"
  | "external-api";

export interface RuntimeEvidenceClaim {
  claim: RuntimeClaim | string;
  session_id?: string | null;
  source?: RuntimeEvidenceSource | string | null;
  runtime_surface?: RuntimeSurface | string | null;
  occurred_at?: string | null;
  evidence_path?: string | null;
}

export interface CapabilityVerificationInput {
  capability_id: string;
  claim: RuntimeClaim | string;
  runtime_behavior: boolean;
  reason?: string | null;
  substitute_oracle?: string | null;
  blocked_reason?: string | null;
}

export type RunDebugObligation =
  | { kind: "required"; capability_id: string; reason: string }
  | { kind: "not_required"; capability_id: string; reason: string; substitute_oracle: string }
  | { kind: "blocked"; capability_id: string; reason: string };

export interface VerificationGateDecision {
  accept: boolean;
  reason: string;
}

export interface RuntimeVerificationLogInput {
  event_id?: string | null;
  plan_id: string;
  requirement_id?: string | null;
  test_oracle_id?: string | null;
  claim: RuntimeClaim;
  session_id: string;
  source: Exclude<RuntimeEvidenceSource, "projection">;
  runtime_surface: RuntimeSurface;
  correlation_id: string;
  evidence_path: string;
  occurred_at: string;
  redaction_policy: "secret-redacted" | "no-secret-material" | "blocked-sensitive";
}

export interface RuntimeVerificationLogEvent {
  event_id: string;
  plan_id: string;
  requirement_id: string | null;
  test_oracle_id: string | null;
  claim: RuntimeClaim;
  session_id: string;
  source: Exclude<RuntimeEvidenceSource, "projection">;
  runtime_surface: RuntimeSurface;
  correlation_id: string;
  evidence_path: string;
  occurred_at: string;
  redaction_policy: "secret-redacted" | "no-secret-material" | "blocked-sensitive";
}

export interface RuntimeLogCompleteness {
  ok: boolean;
  findings: string[];
}

export interface RuntimeVerificationLogDeps {
  repoRoot: string;
  appendText: (path: string, content: string) => void;
}

export interface RuntimeVerificationLogWrite {
  path: string;
  event: RuntimeVerificationLogEvent;
  completeness: RuntimeLogCompleteness;
}

const RUNTIME_CLAIMS = new Set<RuntimeClaim>([
  "fired",
  "used",
  "works",
  "blocked",
  "recovered",
  "observed",
  "executed",
]);

const ACCEPTABLE_RUNTIME_SOURCES = new Set<string>([
  "runtime-hook",
  "adapter-command",
  "run-debug",
  "hosted-preflight",
]);

const ACCEPTABLE_RUNTIME_SURFACES = new Set<string>([
  "claude-hook",
  "codex-hook",
  "codex-hosted-api",
  "ut-tdd-cli",
  "external-api",
]);

const SECRET_LIKE_RE =
  /\b[A-Za-z0-9_-]*(?:token|key|secret|password|passwd|pwd|bearer)[A-Za-z0-9_-]*\s*[=:]\s*\S+/i;

export const DEFAULT_RUNTIME_VERIFICATION_LOG_PATH =
  ".ut-tdd/evidence/run-debug/runtime-verification.jsonl";

function present(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function stableEventId(input: RuntimeVerificationLogInput): string {
  return [
    input.plan_id,
    input.claim,
    input.session_id,
    input.source,
    input.runtime_surface,
    input.correlation_id,
  ]
    .map((part) => part.replace(/[^A-Za-z0-9._-]/g, "_"))
    .join(":");
}

function assertNoSecretLike(value: string, field: string): void {
  if (SECRET_LIKE_RE.test(value)) {
    throw new Error(`runtime verification log field contains secret-like material: ${field}`);
  }
}

export function classifyRuntimeVerificationEvidence(
  input: RuntimeEvidenceClaim,
): RuntimeVerificationClass {
  if (!RUNTIME_CLAIMS.has(input.claim as RuntimeClaim)) return "not_runtime_claim";
  if (input.source === "projection") return "projection_only_unverified";
  if (!input.source || !ACCEPTABLE_RUNTIME_SOURCES.has(input.source)) {
    return "missing_runtime_provenance";
  }
  if (
    !present(input.session_id) ||
    !present(input.runtime_surface) ||
    !present(input.occurred_at) ||
    !present(input.evidence_path)
  ) {
    return "missing_runtime_provenance";
  }
  return "runtime_verified";
}

export function buildRunDebugObligation(input: CapabilityVerificationInput): RunDebugObligation {
  if (present(input.blocked_reason)) {
    return { kind: "blocked", capability_id: input.capability_id, reason: input.blocked_reason };
  }
  if (input.runtime_behavior) {
    return {
      kind: "required",
      capability_id: input.capability_id,
      reason: `${input.claim} is a runtime behavior claim`,
    };
  }
  if (!present(input.reason) || !present(input.substitute_oracle)) {
    return {
      kind: "blocked",
      capability_id: input.capability_id,
      reason: "non-runtime claim requires reason and substitute oracle",
    };
  }
  return {
    kind: "not_required",
    capability_id: input.capability_id,
    reason: input.reason,
    substitute_oracle: input.substitute_oracle,
  };
}

export function rejectProjectionOnlyVerification(
  classification: RuntimeVerificationClass,
): VerificationGateDecision {
  if (classification === "runtime_verified" || classification === "not_runtime_claim") {
    return { accept: true, reason: classification };
  }
  return { accept: false, reason: classification };
}

export function buildRuntimeVerificationLogEvent(
  input: RuntimeVerificationLogInput,
): RuntimeVerificationLogEvent {
  for (const [field, value] of [
    ["plan_id", input.plan_id],
    ["claim", input.claim],
    ["session_id", input.session_id],
    ["source", input.source],
    ["runtime_surface", input.runtime_surface],
    ["correlation_id", input.correlation_id],
    ["evidence_path", input.evidence_path],
    ["occurred_at", input.occurred_at],
  ] as const) {
    if (!present(value)) throw new Error(`runtime verification log field is required: ${field}`);
    assertNoSecretLike(value, field);
  }
  if (Number.isNaN(Date.parse(input.occurred_at))) {
    throw new Error("runtime verification log field is invalid: occurred_at");
  }
  if (!RUNTIME_CLAIMS.has(input.claim)) {
    throw new Error("runtime verification log field is invalid: claim");
  }
  const source = input.source as string;
  if (!ACCEPTABLE_RUNTIME_SOURCES.has(source) || source === "projection") {
    throw new Error("runtime verification log field is invalid: source");
  }
  if (!ACCEPTABLE_RUNTIME_SURFACES.has(input.runtime_surface)) {
    throw new Error("runtime verification log field is invalid: runtime_surface");
  }
  return {
    event_id: present(input.event_id) ? input.event_id : stableEventId(input),
    plan_id: input.plan_id,
    requirement_id: input.requirement_id ?? null,
    test_oracle_id: input.test_oracle_id ?? null,
    claim: input.claim,
    session_id: input.session_id,
    source: input.source,
    runtime_surface: input.runtime_surface,
    correlation_id: input.correlation_id,
    evidence_path: input.evidence_path,
    occurred_at: input.occurred_at,
    redaction_policy: input.redaction_policy,
  };
}

export function validateRuntimeVerificationLogCompleteness(
  event: RuntimeVerificationLogEvent,
): RuntimeLogCompleteness {
  const findings: string[] = [];
  if (!present(event.session_id)) findings.push("missing_session_id");
  if (!present(event.correlation_id)) findings.push("missing_correlation_id");
  if (!present(event.evidence_path)) findings.push("missing_evidence_path");
  if (Number.isNaN(Date.parse(event.occurred_at))) findings.push("invalid_occurred_at");

  if (["works", "used", "fired", "executed"].includes(event.claim)) {
    if (!event.requirement_id && !event.test_oracle_id) {
      findings.push("missing_requirement_or_oracle");
    }
  }
  if (event.claim === "blocked" && !present(event.evidence_path)) {
    findings.push("missing_blocked_reason_evidence");
  }

  return { ok: findings.length === 0, findings };
}

export function appendRuntimeVerificationLogEvent(
  input: RuntimeVerificationLogInput,
  deps: RuntimeVerificationLogDeps,
  relPath = DEFAULT_RUNTIME_VERIFICATION_LOG_PATH,
): RuntimeVerificationLogWrite {
  const event = buildRuntimeVerificationLogEvent(input);
  const completeness = validateRuntimeVerificationLogCompleteness(event);
  if (!completeness.ok) {
    throw new Error(
      `runtime verification log event incomplete: ${completeness.findings.join(",")}`,
    );
  }
  const normalizedRelPath = relPath.replaceAll("\\", "/").replace(/^\/+/, "");
  const path = `${deps.repoRoot.replace(/[\\/]+$/, "")}/${normalizedRelPath}`;
  deps.appendText(path, `${JSON.stringify(event)}\n`);
  return { path: normalizedRelPath, event, completeness };
}

export type { RuntimeClaim, RuntimeVerificationClass };
