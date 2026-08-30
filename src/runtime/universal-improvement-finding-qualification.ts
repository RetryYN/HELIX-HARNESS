import { canonicalJson, compareBytewise, type Sha256Digest, sha256Digest } from "./digest";
import type {
  UniversalImprovementNormalizationResult,
  UniversalImprovementNormalizedEventV1,
} from "./universal-improvement-observation-normalizer";

export const UNIVERSAL_IMPROVEMENT_FINDING_SCHEMA_VERSION =
  "helix-universal-improvement-finding.v1" as const;

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u;
const EVENT_ID_PATTERN = /^uil-event-[0-9a-f]{64}$/u;
const TRIGGER_KINDS = [
  "invariant_violation",
  "recurrence",
  "metric_budget_exceeded",
  "worsening_trend",
  "structural_drift",
  "release_boundary",
  "provider_change",
  "scheduled_safety_net",
] as const;

export type UniversalImprovementFindingTriggerKind = (typeof TRIGGER_KINDS)[number];
export type UniversalImprovementFindingDisposition =
  | "qualified"
  | "rejected"
  | "expired"
  | "superseded"
  | "counterevidence_required";

export interface UniversalImprovementTriggerEvidenceV1 {
  evidence_id: string;
  detector_id: string;
  detector_version: string;
  trigger_kind: UniversalImprovementFindingTriggerKind;
  invariant_id: string;
  root_cause_id: string;
  scope_authority: string;
  baseline_revision: string;
  event_ids: readonly string[];
  event_digests: readonly Sha256Digest[];
  trigger_verdict: "triggered" | "not_triggered";
  observed_at: string;
  expires_at: string;
  counterevidence_digests: readonly Sha256Digest[];
  superseded_by: string | null;
}

export interface UniversalImprovementFindingV1 {
  schema_version: typeof UNIVERSAL_IMPROVEMENT_FINDING_SCHEMA_VERSION;
  finding_id: string;
  trigger_kind: UniversalImprovementFindingTriggerKind;
  invariant_id: string;
  root_cause_id: string;
  scope_authority: string;
  baseline_revision: string;
  detector_id: string;
  detector_version: string;
  event_ids: readonly string[];
  event_digests: readonly Sha256Digest[];
  source_evidence_ids: readonly string[];
  counterevidence_digests: readonly Sha256Digest[];
  disposition: UniversalImprovementFindingDisposition;
  disposition_reason: string;
  expires_at: string;
  superseded_by: string | null;
  finding_digest: Sha256Digest;
}

export interface UniversalImprovementFindingQualificationResult {
  ok: boolean;
  findings: readonly UniversalImprovementFindingV1[];
  exact_set_digest: Sha256Digest | null;
  errors: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareBytewise);
}

function sortedUniqueDigests(values: readonly Sha256Digest[]): Sha256Digest[] {
  return [...new Set(values)].sort(compareBytewise);
}

function sameExactSet(left: readonly string[], right: readonly string[]): boolean {
  const a = sortedUnique(left);
  const b = sortedUnique(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function parseEvidence(
  raw: unknown,
  index: number,
): { evidence: UniversalImprovementTriggerEvidenceV1 | null; errors: string[] } {
  if (!isRecord(raw)) return { evidence: null, errors: [`trigger_evidence_invalid:${index}`] };
  const errors: string[] = [];
  const requiredIds = [
    "evidence_id",
    "detector_id",
    "detector_version",
    "invariant_id",
    "root_cause_id",
    "scope_authority",
    "baseline_revision",
  ] as const;
  for (const field of requiredIds) {
    if (!isIdentifier(raw[field])) errors.push(`${field}_invalid:${index}`);
  }
  if (!TRIGGER_KINDS.includes(raw.trigger_kind as UniversalImprovementFindingTriggerKind)) {
    errors.push(`trigger_kind_invalid:${index}`);
  }
  if (raw.trigger_verdict !== "triggered" && raw.trigger_verdict !== "not_triggered") {
    errors.push(`trigger_verdict_invalid:${index}`);
  }
  if (
    !Array.isArray(raw.event_ids) ||
    raw.event_ids.length === 0 ||
    raw.event_ids.some((id) => typeof id !== "string" || !EVENT_ID_PATTERN.test(id))
  ) {
    errors.push(`event_ids_invalid:${index}`);
  }
  if (
    !Array.isArray(raw.event_digests) ||
    raw.event_digests.length === 0 ||
    raw.event_digests.some((digest) => typeof digest !== "string" || !DIGEST_PATTERN.test(digest))
  ) {
    errors.push(`event_digests_invalid:${index}`);
  }
  if (
    !Array.isArray(raw.counterevidence_digests) ||
    raw.counterevidence_digests.some(
      (digest) => typeof digest !== "string" || !DIGEST_PATTERN.test(digest),
    )
  ) {
    errors.push(`counterevidence_invalid:${index}`);
  }
  if (raw.superseded_by !== null && !isIdentifier(raw.superseded_by)) {
    errors.push(`superseded_by_invalid:${index}`);
  }
  const observedAt = typeof raw.observed_at === "string" ? Date.parse(raw.observed_at) : Number.NaN;
  const expiresAt = typeof raw.expires_at === "string" ? Date.parse(raw.expires_at) : Number.NaN;
  if (!Number.isFinite(observedAt)) errors.push(`observed_at_invalid:${index}`);
  if (!Number.isFinite(expiresAt) || expiresAt <= observedAt)
    errors.push(`expires_at_invalid:${index}`);
  return {
    evidence:
      errors.length === 0 ? (raw as unknown as UniversalImprovementTriggerEvidenceV1) : null,
    errors,
  };
}

function findingIdentity(evidence: UniversalImprovementTriggerEvidenceV1): string {
  return `uil-finding-${sha256Digest(
    canonicalJson({
      root_cause_id: evidence.root_cause_id,
      scope_authority: evidence.scope_authority,
      baseline_revision: evidence.baseline_revision,
      invariant_id: evidence.invariant_id,
      trigger_kind: evidence.trigger_kind,
    }),
  ).slice("sha256:".length)}`;
}

function disposition(
  evidence: UniversalImprovementTriggerEvidenceV1,
  now: Date,
): { disposition: UniversalImprovementFindingDisposition; reason: string } {
  if (evidence.superseded_by !== null) return { disposition: "superseded", reason: "superseded" };
  if (Date.parse(evidence.expires_at) <= now.getTime())
    return { disposition: "expired", reason: "expired" };
  if (evidence.trigger_verdict === "not_triggered")
    return { disposition: "rejected", reason: "not_triggered" };
  if (evidence.trigger_kind === "scheduled_safety_net")
    return { disposition: "rejected", reason: "scheduled_trigger_not_substantive" };
  if (evidence.counterevidence_digests.length > 0)
    return { disposition: "counterevidence_required", reason: "counterevidence_present" };
  return { disposition: "qualified", reason: "substantive_trigger" };
}

function validateNormalizedResult(result: UniversalImprovementNormalizationResult): string[] {
  if (!result.ok || result.events.length === 0 || result.exact_set_digest === null) {
    return ["normalized_result_not_admitted"];
  }
  const expected = sha256Digest(canonicalJson(result.events));
  return expected === result.exact_set_digest ? [] : ["normalized_exact_set_digest_mismatch"];
}

export function qualifyUniversalImprovementFindings(
  normalized: UniversalImprovementNormalizationResult,
  rawEvidence: readonly unknown[],
  now: Date = new Date(),
): UniversalImprovementFindingQualificationResult {
  const errors = validateNormalizedResult(normalized);
  if (!Array.isArray(rawEvidence) || rawEvidence.length === 0)
    errors.push("trigger_evidence_empty");
  const eventById = new Map(normalized.events.map((event) => [event.event_id, event]));
  const evidence: UniversalImprovementTriggerEvidenceV1[] = [];
  const evidenceById = new Map<string, string>();
  for (const [index, raw] of rawEvidence.entries()) {
    const parsed = parseEvidence(raw, index);
    errors.push(...parsed.errors);
    if (!parsed.evidence) continue;
    const item = parsed.evidence;
    const serialized = canonicalJson(item);
    const prior = evidenceById.get(item.evidence_id);
    if (prior !== undefined && prior !== serialized)
      errors.push(`evidence_id_conflict:${item.evidence_id}`);
    evidenceById.set(item.evidence_id, serialized);
    if (Date.parse(item.observed_at) > now.getTime())
      errors.push(`observed_at_future:${item.evidence_id}`);
    const referenced: UniversalImprovementNormalizedEventV1[] = [];
    for (const eventId of sortedUnique(item.event_ids)) {
      const event = eventById.get(eventId);
      if (!event) errors.push(`event_unresolved:${eventId}`);
      else referenced.push(event);
    }
    if (
      !sameExactSet(
        item.event_digests,
        referenced.map((event) => event.event_digest),
      )
    ) {
      errors.push(`event_digest_set_mismatch:${item.evidence_id}`);
    }
    for (const event of referenced) {
      if (
        event.detector_id !== item.detector_id ||
        event.detector_version !== item.detector_version
      ) {
        errors.push(`detector_mismatch:${item.evidence_id}`);
      }
      if (
        event.baseline.state !== "current" ||
        event.baseline.revision !== item.baseline_revision
      ) {
        errors.push(`baseline_revision_mismatch:${item.evidence_id}`);
      }
    }
    evidence.push(item);
  }
  const groups = new Map<string, UniversalImprovementTriggerEvidenceV1[]>();
  for (const item of evidence) {
    const id = findingIdentity(item);
    groups.set(id, [...(groups.get(id) ?? []), item]);
  }
  const findings: UniversalImprovementFindingV1[] = [];
  for (const [findingId, group] of groups) {
    const first = group[0];
    if (!first) continue;
    const conflictFields = [
      "detector_id",
      "detector_version",
      "trigger_verdict",
      "superseded_by",
      "expires_at",
    ] as const;
    for (const field of conflictFields) {
      if (group.some((item) => item[field] !== first[field]))
        errors.push(`finding_identity_conflict:${findingId}:${field}`);
    }
    const eventIds = sortedUnique(group.flatMap((item) => item.event_ids));
    const eventDigests = sortedUniqueDigests(group.flatMap((item) => item.event_digests));
    const sourceEvidenceIds = sortedUnique(group.map((item) => item.evidence_id));
    const counterevidence = sortedUniqueDigests(
      group.flatMap((item) => item.counterevidence_digests),
    );
    const outcome = disposition({ ...first, counterevidence_digests: counterevidence }, now);
    const withoutDigest = {
      schema_version: UNIVERSAL_IMPROVEMENT_FINDING_SCHEMA_VERSION,
      finding_id: findingId,
      trigger_kind: first.trigger_kind,
      invariant_id: first.invariant_id,
      root_cause_id: first.root_cause_id,
      scope_authority: first.scope_authority,
      baseline_revision: first.baseline_revision,
      detector_id: first.detector_id,
      detector_version: first.detector_version,
      event_ids: eventIds,
      event_digests: eventDigests,
      source_evidence_ids: sourceEvidenceIds,
      counterevidence_digests: counterevidence,
      disposition: outcome.disposition,
      disposition_reason: outcome.reason,
      expires_at: first.expires_at,
      superseded_by: first.superseded_by,
    };
    findings.push({ ...withoutDigest, finding_digest: sha256Digest(canonicalJson(withoutDigest)) });
  }
  if (errors.length > 0)
    return { ok: false, findings: [], exact_set_digest: null, errors: sortedUnique(errors) };
  const exact = findings.sort((left, right) => compareBytewise(left.finding_id, right.finding_id));
  return {
    ok: true,
    findings: exact,
    exact_set_digest: sha256Digest(canonicalJson(exact)),
    errors: [],
  };
}
