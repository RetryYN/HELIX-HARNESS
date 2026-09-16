import { canonicalJson, compareBytewise, type Sha256Digest, sha256Digest } from "./digest";
import {
  UNIVERSAL_IMPROVEMENT_NORMALIZED_EVENT_SCHEMA_VERSION,
  type UniversalImprovementNormalizationResult,
  type UniversalImprovementNormalizedEventV1,
} from "./universal-improvement-observation-normalizer";

export const UNIVERSAL_IMPROVEMENT_FINDING_SCHEMA_VERSION =
  "helix-universal-improvement-finding.v1" as const;

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u;
const EVENT_ID_PATTERN = /^uil-event-[0-9a-f]{64}$/u;
const FINDING_ID_PATTERN = /^uil-finding-[0-9a-f]{64}$/u;
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
  recurrence_lineage: readonly string[];
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
  recurrence_lineage: readonly string[];
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

function isCanonicalExactSet(values: readonly string[]): boolean {
  const canonical = sortedUnique(values);
  return (
    values.length === canonical.length && values.every((value, index) => value === canonical[index])
  );
}

function hasExactKeys(record: Record<string, unknown>, expected: readonly string[]): boolean {
  return sameExactSet(Object.keys(record), expected);
}

const EVIDENCE_KEYS = [
  "evidence_id",
  "detector_id",
  "detector_version",
  "trigger_kind",
  "invariant_id",
  "root_cause_id",
  "scope_authority",
  "baseline_revision",
  "event_ids",
  "event_digests",
  "trigger_verdict",
  "observed_at",
  "expires_at",
  "counterevidence_digests",
  "superseded_by",
  "recurrence_lineage",
] as const;

function parseEvidence(
  raw: unknown,
  index: number,
): { evidence: UniversalImprovementTriggerEvidenceV1 | null; errors: string[] } {
  if (!isRecord(raw)) return { evidence: null, errors: [`trigger_evidence_invalid:${index}`] };
  const errors: string[] = [];
  if (!hasExactKeys(raw, EVIDENCE_KEYS)) errors.push(`trigger_evidence_schema_invalid:${index}`);
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
    ) ||
    !isCanonicalExactSet(raw.counterevidence_digests as readonly string[])
  ) {
    errors.push(`counterevidence_invalid:${index}`);
  }
  if (raw.superseded_by !== null && !isIdentifier(raw.superseded_by)) {
    errors.push(`superseded_by_invalid:${index}`);
  }
  if (
    !Array.isArray(raw.recurrence_lineage) ||
    raw.recurrence_lineage.some(
      (findingId) => typeof findingId !== "string" || !FINDING_ID_PATTERN.test(findingId),
    ) ||
    !isCanonicalExactSet(raw.recurrence_lineage as readonly string[])
  ) {
    errors.push(`recurrence_lineage_invalid:${index}`);
  } else if (
    (raw.trigger_kind === "recurrence" && raw.recurrence_lineage.length === 0) ||
    (raw.trigger_kind !== "recurrence" && raw.recurrence_lineage.length > 0)
  ) {
    errors.push(`recurrence_lineage_trigger_mismatch:${index}`);
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

function groupingIdentity(evidence: UniversalImprovementTriggerEvidenceV1): string {
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

function findingIdentity(input: {
  evidence: UniversalImprovementTriggerEvidenceV1;
  eventIds: readonly string[];
  eventDigests: readonly Sha256Digest[];
  sourceEvidenceIds: readonly string[];
  recurrenceLineage: readonly string[];
}): string {
  return `uil-finding-${sha256Digest(
    canonicalJson({
      root_cause_id: input.evidence.root_cause_id,
      scope_authority: input.evidence.scope_authority,
      baseline_revision: input.evidence.baseline_revision,
      invariant_id: input.evidence.invariant_id,
      trigger_kind: input.evidence.trigger_kind,
      detector_id: input.evidence.detector_id,
      detector_version: input.evidence.detector_version,
      event_ids: input.eventIds,
      event_digests: input.eventDigests,
      source_evidence_ids: input.sourceEvidenceIds,
      recurrence_lineage: input.recurrenceLineage,
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

const NORMALIZATION_RESULT_KEYS = ["ok", "events", "exact_set_digest", "errors"] as const;
const NORMALIZED_EVENT_KEYS = [
  "schema_version",
  "event_id",
  "registry_version",
  "registry_source_digest",
  "registry_bytes_digest",
  "source_id",
  "source_kind",
  "source_schema_version",
  "source_revision",
  "detector_id",
  "detector_version",
  "baseline",
  "observed",
  "predicted",
  "correlation_id",
  "causation_id",
  "confidence",
  "counterevidence_digests",
  "event_digest",
] as const;

function validateNormalizedEvent(raw: unknown, index: number): string[] {
  if (!isRecord(raw)) return [`normalized_event_invalid:${index}`];
  const errors: string[] = [];
  if (!hasExactKeys(raw, NORMALIZED_EVENT_KEYS))
    errors.push(`normalized_event_schema_invalid:${index}`);
  if (raw.schema_version !== UNIVERSAL_IMPROVEMENT_NORMALIZED_EVENT_SCHEMA_VERSION)
    errors.push(`normalized_event_schema_version_invalid:${index}`);
  if (typeof raw.event_id !== "string" || !EVENT_ID_PATTERN.test(raw.event_id))
    errors.push(`normalized_event_id_invalid:${index}`);
  for (const field of [
    "registry_version",
    "source_id",
    "source_kind",
    "source_schema_version",
    "source_revision",
    "detector_id",
    "detector_version",
    "correlation_id",
  ] as const) {
    if (!isIdentifier(raw[field])) errors.push(`normalized_event_${field}_invalid:${index}`);
  }
  for (const field of [
    "registry_source_digest",
    "registry_bytes_digest",
    "event_digest",
  ] as const) {
    if (typeof raw[field] !== "string" || !DIGEST_PATTERN.test(raw[field]))
      errors.push(`normalized_event_${field}_invalid:${index}`);
  }
  if (
    !isRecord(raw.baseline) ||
    !hasExactKeys(raw.baseline, ["state", "revision", "payload_digest"])
  ) {
    errors.push(`normalized_event_baseline_invalid:${index}`);
  } else if (
    raw.baseline.state !== "current" ||
    !isIdentifier(raw.baseline.revision) ||
    typeof raw.baseline.payload_digest !== "string" ||
    !DIGEST_PATTERN.test(raw.baseline.payload_digest)
  ) {
    errors.push(`normalized_event_baseline_not_current:${index}`);
  }
  if (
    !isRecord(raw.observed) ||
    !hasExactKeys(raw.observed, ["revision", "observed_at", "payload_digest", "evidence_digest"])
  ) {
    errors.push(`normalized_event_observed_invalid:${index}`);
  } else if (
    !isIdentifier(raw.observed.revision) ||
    typeof raw.observed.observed_at !== "string" ||
    !Number.isFinite(Date.parse(raw.observed.observed_at)) ||
    typeof raw.observed.payload_digest !== "string" ||
    !DIGEST_PATTERN.test(raw.observed.payload_digest) ||
    typeof raw.observed.evidence_digest !== "string" ||
    !DIGEST_PATTERN.test(raw.observed.evidence_digest)
  ) {
    errors.push(`normalized_event_observed_invalid:${index}`);
  }
  if (
    raw.predicted !== null &&
    (!isRecord(raw.predicted) ||
      !hasExactKeys(raw.predicted, ["revision", "payload_digest"]) ||
      !isIdentifier(raw.predicted.revision) ||
      typeof raw.predicted.payload_digest !== "string" ||
      !DIGEST_PATTERN.test(raw.predicted.payload_digest))
  ) {
    errors.push(`normalized_event_prediction_invalid:${index}`);
  }
  if (
    !isRecord(raw.confidence) ||
    !hasExactKeys(raw.confidence, ["score", "basis_digest"]) ||
    typeof raw.confidence.score !== "number" ||
    !Number.isFinite(raw.confidence.score) ||
    raw.confidence.score < 0 ||
    raw.confidence.score > 1 ||
    typeof raw.confidence.basis_digest !== "string" ||
    !DIGEST_PATTERN.test(raw.confidence.basis_digest)
  ) {
    errors.push(`normalized_event_confidence_invalid:${index}`);
  }
  if (
    !Array.isArray(raw.counterevidence_digests) ||
    raw.counterevidence_digests.some(
      (digest) => typeof digest !== "string" || !DIGEST_PATTERN.test(digest),
    ) ||
    !isCanonicalExactSet(raw.counterevidence_digests as readonly string[])
  ) {
    errors.push(`normalized_event_counterevidence_invalid:${index}`);
  }
  if (
    raw.causation_id !== null &&
    (typeof raw.causation_id !== "string" || !EVENT_ID_PATTERN.test(raw.causation_id))
  )
    errors.push(`normalized_event_causation_invalid:${index}`);
  if (errors.length === 0) {
    const { event_digest: eventDigest, ...withoutDigest } = raw;
    if (sha256Digest(canonicalJson(withoutDigest)) !== eventDigest)
      errors.push(`normalized_event_digest_mismatch:${index}`);
    const observed = raw.observed as Record<string, unknown>;
    const expectedId = `uil-event-${sha256Digest(
      canonicalJson({
        source_id: raw.source_id,
        source_revision: observed.revision,
        observed_at: observed.observed_at,
        payload_digest: observed.payload_digest,
        evidence_digest: observed.evidence_digest,
      }),
    ).slice("sha256:".length)}`;
    if (raw.event_id !== expectedId) errors.push(`normalized_event_identity_mismatch:${index}`);
  }
  return errors;
}

function validateNormalizedResult(result: UniversalImprovementNormalizationResult): string[] {
  if (!isRecord(result) || !hasExactKeys(result, NORMALIZATION_RESULT_KEYS))
    return ["normalized_result_schema_invalid"];
  if (
    result.ok !== true ||
    !Array.isArray(result.events) ||
    result.events.length === 0 ||
    typeof result.exact_set_digest !== "string" ||
    !DIGEST_PATTERN.test(result.exact_set_digest) ||
    !Array.isArray(result.errors) ||
    result.errors.length > 0
  ) {
    return ["normalized_result_not_admitted"];
  }
  const errors = result.events.flatMap((event, index) => validateNormalizedEvent(event, index));
  const eventIds = result.events.map((event) => event.event_id);
  if (new Set(eventIds).size !== eventIds.length) errors.push("normalized_event_id_duplicate");
  if (
    !eventIds.every(
      (eventId, index) => index === 0 || compareBytewise(eventIds[index - 1] ?? "", eventId) < 0,
    )
  )
    errors.push("normalized_event_order_invalid");
  const eventById = new Map(result.events.map((event) => [event.event_id, event]));
  for (const event of result.events) {
    if (event.causation_id === null) continue;
    const cause = eventById.get(event.causation_id);
    if (!cause) errors.push(`normalized_causation_unresolved:${event.causation_id}`);
    else if (cause.correlation_id !== event.correlation_id)
      errors.push(`normalized_causation_correlation_mismatch:${event.event_id}`);
  }
  const expected = sha256Digest(canonicalJson(result.events));
  if (expected !== result.exact_set_digest) errors.push("normalized_exact_set_digest_mismatch");
  return errors;
}

export function qualifyUniversalImprovementFindings(
  normalized: UniversalImprovementNormalizationResult,
  rawEvidence: readonly unknown[],
  now: Date = new Date(),
): UniversalImprovementFindingQualificationResult {
  const errors = validateNormalizedResult(normalized);
  if (errors.length > 0)
    return { ok: false, findings: [], exact_set_digest: null, errors: sortedUnique(errors) };
  if (!Array.isArray(rawEvidence) || rawEvidence.length === 0) {
    return {
      ok: false,
      findings: [],
      exact_set_digest: null,
      errors: ["trigger_evidence_empty"],
    };
  }
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
    const id = groupingIdentity(item);
    groups.set(id, [...(groups.get(id) ?? []), item]);
  }
  const findings: UniversalImprovementFindingV1[] = [];
  for (const [groupKey, group] of groups) {
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
        errors.push(`finding_identity_conflict:${groupKey}:${field}`);
    }
    const eventIds = sortedUnique(group.flatMap((item) => item.event_ids));
    const eventDigests = sortedUniqueDigests(group.flatMap((item) => item.event_digests));
    const sourceEvidenceIds = sortedUnique(group.map((item) => item.evidence_id));
    const counterevidence = sortedUniqueDigests(
      group.flatMap((item) => [
        ...item.counterevidence_digests,
        ...item.event_ids.flatMap(
          (eventId) => eventById.get(eventId)?.counterevidence_digests ?? [],
        ),
      ]),
    );
    const recurrenceLineage = sortedUnique(group.flatMap((item) => item.recurrence_lineage));
    if (group.some((item) => !sameExactSet(item.recurrence_lineage, first.recurrence_lineage)))
      errors.push(`finding_identity_conflict:${groupKey}:recurrence_lineage`);
    const outcome = disposition({ ...first, counterevidence_digests: counterevidence }, now);
    const findingId = findingIdentity({
      evidence: first,
      eventIds,
      eventDigests,
      sourceEvidenceIds,
      recurrenceLineage,
    });
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
      recurrence_lineage: recurrenceLineage,
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
