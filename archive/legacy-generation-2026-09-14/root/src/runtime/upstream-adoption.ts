import type { RuntimeSurface } from "./run-debug";

export type UpstreamFindingId =
  | "A146-1"
  | "A146-2"
  | "A146-3"
  | "A146-4"
  | "A146-5"
  | "A146-6"
  | "A146-7"
  | "A146-8";

export type ProvenanceKind = "runtime" | "projected" | "derived" | "unknown";
export type TelemetryProvenanceClass = ProvenanceKind;
export type CurationAudience = "consumer" | "internal" | "dogfood" | "deny";
export type FeDesignSubstance = "populated" | "explicit_defer" | "out_of_scope" | "hollow";
export type DriveEntryDecisionKind = "auto_route" | "defer" | "fail_close" | "human_review";
export type MatcherCompatibility = "covered" | "unverified" | "incompatible";
export type RuntimeMatcherCompatibility = MatcherCompatibility;

export interface UpstreamAdoptionFinding {
  known: boolean;
  finding_id: string;
  requirement_id: string | null;
  contract_id: string | null;
  oracle_id: string | null;
}

export interface GuardGovernanceInput {
  claude_entrypoints?: string[] | null;
  codex_entrypoints?: string[] | null;
  deferred_surfaces?: string[] | null;
  coverage_claims?: Array<{ surface: string; implemented: boolean; covered: boolean }> | null;
}

export interface GuardGovernancePack {
  ok: boolean;
  claude_entrypoints: string[];
  codex_entrypoints: string[];
  entrypoints: string[];
  deferred_surfaces: string[];
  findings: string[];
}

export interface ConsumerCliResolutionInput {
  command?: string | null;
  path_resolved?: boolean;
  wrapper_path?: string | null;
  absolute_resolver?: string | null;
}

export interface ConsumerCliResolution {
  resolved: boolean;
  method: "path" | "wrapper" | "absolute_resolver" | "fail_close";
  remediation: string | null;
}

export interface GreenEvidenceBindingInput {
  command?: string | null;
  exit_status?: number | null;
  output_digest?: string | null;
  evidence_path?: string | null;
  run_batch_id?: string | null;
  digest_batch_id?: string | null;
  hash_only_restamp?: boolean;
}

export interface GreenEvidenceBindingResult {
  closed: boolean;
  reason: string;
}

export interface TelemetryRowLike {
  source?: string | null;
  runtime_event_id?: string | null;
  runtime_evidence_path?: string | null;
  projection_rule?: string | null;
  derived_from?: string | null;
}

export interface DistributionDocInput {
  doc_path: string;
  declared_audience?: CurationAudience | null;
  dogfood_marker?: boolean;
  internal_marker?: boolean;
  blanket_governance_allow?: boolean;
}

export interface DistributionCurationDecision {
  audience: CurationAudience;
  allowed_for_consumer: boolean;
  warnings: string[];
}

export interface FeDesignSubstanceInput {
  body?: string | null;
  defer_marker?: string | null;
  out_of_scope_marker?: string | null;
  min_populated_chars?: number;
}

export interface FeDesignSubstanceStatus {
  status: FeDesignSubstance;
  reason: string;
}

export interface DriveEntryInput {
  signal: string;
  mode: string;
  kind: string;
  drive: string;
}

export interface DriveEntryMatrix {
  signal_to_mode: Record<string, string>;
  kind_drive: Record<string, string[]>;
}

export interface DriveEntryDecision {
  kind: DriveEntryDecisionKind;
  reason: string;
}

export interface RuntimeMatcherEvidenceInput {
  runtime_surface?: RuntimeSurface | null;
  emitted_tool_event?: string | null;
  matcher?: string | null;
  matcher_fired?: boolean;
  guard_result?: "pass" | "block" | "warn" | null;
  expected_only?: boolean;
}

export interface RuntimeMatcherEvidenceResult {
  compatibility: MatcherCompatibility;
  reason: string;
}

const FINDING_MAP: Record<
  UpstreamFindingId,
  Omit<UpstreamAdoptionFinding, "known" | "finding_id">
> = {
  "A146-1": { requirement_id: "HU-FR-01", contract_id: "HU-C01", oracle_id: "U-UPSTREAM-002" },
  "A146-2": { requirement_id: "HU-FR-02", contract_id: "HU-C02", oracle_id: "U-UPSTREAM-003" },
  "A146-3": { requirement_id: "HU-FR-03", contract_id: "HU-C03", oracle_id: "U-UPSTREAM-004" },
  "A146-4": { requirement_id: "HU-FR-04", contract_id: "HU-C04", oracle_id: "U-UPSTREAM-005" },
  "A146-5": { requirement_id: "HU-FR-05", contract_id: "HU-C05", oracle_id: "U-UPSTREAM-006" },
  "A146-6": { requirement_id: "HU-FR-06", contract_id: "HU-C06", oracle_id: "U-UPSTREAM-007" },
  "A146-7": { requirement_id: "HU-FR-07", contract_id: "HU-C07", oracle_id: "U-UPSTREAM-008" },
  "A146-8": { requirement_id: "HU-FR-08", contract_id: "HU-C08", oracle_id: "U-UPSTREAM-009" },
};

function present(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmpty(values: string[] | null | undefined): string[] {
  return values?.map((value) => value.trim()).filter(Boolean) ?? [];
}

export function classifyUpstreamA146Finding(findingId: string): UpstreamAdoptionFinding {
  if (Object.hasOwn(FINDING_MAP, findingId)) {
    const mapped = FINDING_MAP[findingId as UpstreamFindingId];
    return { known: true, finding_id: findingId, ...mapped };
  }
  return {
    known: false,
    finding_id: findingId,
    requirement_id: null,
    contract_id: null,
    oracle_id: null,
  };
}

export function buildGuardGovernancePack(input: GuardGovernanceInput): GuardGovernancePack {
  const claudeEntrypoints = nonEmpty(input.claude_entrypoints);
  const codexEntrypoints = nonEmpty(input.codex_entrypoints);
  const entrypoints = [...claudeEntrypoints, ...codexEntrypoints];
  const deferredSurfaces = nonEmpty(input.deferred_surfaces);
  const findings: string[] = [];
  if (entrypoints.length === 0) findings.push("missing_guard_entrypoint");
  for (const claim of input.coverage_claims ?? []) {
    if (claim.covered && !claim.implemented) {
      findings.push(`unimplemented_guard_claimed_covered:${claim.surface}`);
    }
  }
  for (const claim of input.coverage_claims ?? []) {
    if (!claim.implemented && !deferredSurfaces.includes(claim.surface)) {
      findings.push(`untracked_deferred_surface:${claim.surface}`);
    }
  }
  return {
    ok: findings.length === 0,
    claude_entrypoints: claudeEntrypoints,
    codex_entrypoints: codexEntrypoints,
    entrypoints,
    deferred_surfaces: deferredSurfaces,
    findings,
  };
}

export function resolveConsumerCliPath(input: ConsumerCliResolutionInput): ConsumerCliResolution {
  if (input.path_resolved) return { resolved: true, method: "path", remediation: null };
  if (present(input.wrapper_path)) return { resolved: true, method: "wrapper", remediation: null };
  if (present(input.absolute_resolver)) {
    return { resolved: true, method: "absolute_resolver", remediation: null };
  }
  return {
    resolved: false,
    method: "fail_close",
    remediation: `Install or expose ${input.command ?? "the CLI"} through PATH, wrapper, or resolver`,
  };
}

export function verifyGreenEvidenceBinding(
  input: GreenEvidenceBindingInput,
): GreenEvidenceBindingResult {
  if (input.hash_only_restamp) return { closed: false, reason: "hash_only_restamp" };
  if (!present(input.command) || input.exit_status !== 0) {
    return { closed: false, reason: "command_not_successfully_rerun" };
  }
  if (!present(input.output_digest) || !present(input.evidence_path)) {
    return { closed: false, reason: "missing_digest_or_evidence" };
  }
  if (!present(input.run_batch_id) || input.run_batch_id !== input.digest_batch_id) {
    return { closed: false, reason: "batch_mismatch" };
  }
  return { closed: true, reason: "same_batch_rerun_and_digest" };
}

export function classifyTelemetryProvenance(row: TelemetryRowLike): TelemetryProvenanceClass {
  if (present(row.runtime_event_id) || present(row.runtime_evidence_path)) return "runtime";
  if (present(row.projection_rule) || row.source === "projected") return "projected";
  if (present(row.derived_from) || row.source === "derived") return "derived";
  return "unknown";
}

export function curateDistributionDoc(input: DistributionDocInput): DistributionCurationDecision {
  const warnings: string[] = [];
  if (input.blanket_governance_allow) warnings.push("blanket_governance_allowlist");
  if (input.dogfood_marker) {
    return { audience: "dogfood", allowed_for_consumer: false, warnings };
  }
  if (input.internal_marker) {
    return { audience: "internal", allowed_for_consumer: false, warnings };
  }
  const audience =
    input.declared_audience ?? (input.doc_path.includes("audit") ? "dogfood" : "consumer");
  return {
    audience,
    allowed_for_consumer: audience === "consumer" && warnings.length === 0,
    warnings,
  };
}

export function evaluateFeDesignSubstance(input: FeDesignSubstanceInput): FeDesignSubstanceStatus {
  if (present(input.out_of_scope_marker))
    return { status: "out_of_scope", reason: input.out_of_scope_marker };
  if (present(input.defer_marker)) return { status: "explicit_defer", reason: input.defer_marker };
  const body = input.body?.trim() ?? "";
  const threshold = input.min_populated_chars ?? 80;
  if (body.length >= threshold) return { status: "populated", reason: "body_substance_present" };
  return { status: "hollow", reason: "presence_only_or_short_body" };
}

export function validateDriveEntryMatrix(
  input: DriveEntryInput,
  matrix: DriveEntryMatrix,
): DriveEntryDecision {
  const expectedMode = matrix.signal_to_mode[input.signal];
  const allowedDrives = matrix.kind_drive[input.kind];
  if (!expectedMode || !allowedDrives)
    return { kind: "fail_close", reason: "unknown_signal_or_kind" };
  if (expectedMode !== input.mode) return { kind: "defer", reason: "signal_mode_mismatch" };
  if (!allowedDrives.includes(input.drive))
    return { kind: "human_review", reason: "kind_drive_mismatch" };
  return { kind: "auto_route", reason: "matrix_match" };
}

export function verifyRuntimeMatcherEvidence(
  input: RuntimeMatcherEvidenceInput,
): RuntimeMatcherEvidenceResult {
  if (input.expected_only) return { compatibility: "unverified", reason: "expected_only" };
  if (
    !present(input.runtime_surface) ||
    !present(input.emitted_tool_event) ||
    !present(input.matcher)
  ) {
    return { compatibility: "unverified", reason: "missing_runtime_matcher_evidence" };
  }
  if (!input.matcher_fired) return { compatibility: "incompatible", reason: "matcher_not_fired" };
  if (!input.matcher.split("|").includes(input.emitted_tool_event)) {
    return { compatibility: "incompatible", reason: "tool_event_not_matched" };
  }
  if (!input.guard_result) return { compatibility: "unverified", reason: "missing_guard_result" };
  return { compatibility: "covered", reason: "target_runtime_matcher_evidence" };
}
