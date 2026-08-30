import { canonicalJson, compareBytewise, type Sha256Digest, sha256Digest } from "./digest";
import {
  admitUniversalImprovementSource,
  type UniversalImprovementSourceObservation,
  type UniversalImprovementSourceRegistryResult,
} from "./universal-improvement-source-registry";

export const UNIVERSAL_IMPROVEMENT_NORMALIZED_EVENT_SCHEMA_VERSION =
  "helix-universal-improvement-normalized-event.v1" as const;

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u;

export interface UniversalImprovementBaselineV1 {
  state: "current" | "missing";
  revision: string | null;
  payload_digest: Sha256Digest | null;
}

export interface UniversalImprovementPredictionV1 {
  revision: string;
  payload_digest: Sha256Digest;
}

export interface UniversalImprovementNormalizationInput {
  registry_result: UniversalImprovementSourceRegistryResult;
  observation: UniversalImprovementSourceObservation;
  baseline: UniversalImprovementBaselineV1;
  predicted: UniversalImprovementPredictionV1 | null;
  correlation_id: string;
  causation_id: string | null;
  confidence: { score: number; basis_digest: Sha256Digest };
  counterevidence_digests: readonly Sha256Digest[];
}

export interface UniversalImprovementNormalizedEventV1 {
  schema_version: typeof UNIVERSAL_IMPROVEMENT_NORMALIZED_EVENT_SCHEMA_VERSION;
  event_id: string;
  registry_version: string;
  registry_source_digest: string;
  registry_bytes_digest: string;
  source_id: string;
  source_kind: string;
  source_schema_version: string;
  source_revision: string;
  detector_id: string;
  detector_version: string;
  baseline: UniversalImprovementBaselineV1;
  observed: {
    revision: string;
    observed_at: string;
    payload_digest: string;
    evidence_digest: string;
  };
  predicted: UniversalImprovementPredictionV1 | null;
  correlation_id: string;
  causation_id: string | null;
  confidence: { score: number; basis_digest: Sha256Digest };
  counterevidence_digests: readonly Sha256Digest[];
  event_digest: Sha256Digest;
}

export interface UniversalImprovementNormalizationResult {
  ok: boolean;
  events: readonly UniversalImprovementNormalizedEventV1[];
  exact_set_digest: Sha256Digest | null;
  errors: readonly string[];
}

function validRevision(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateInput(
  raw: unknown,
  index: number,
): { errors: string[]; input: UniversalImprovementNormalizationInput | null } {
  const errors: string[] = [];
  if (!isRecord(raw)) {
    return { errors: [`normalization_input_invalid:${index}`], input: null };
  }
  const registryResult = raw.registry_result;
  const observation = raw.observation;
  const baseline = raw.baseline;
  const predicted = raw.predicted;
  const confidence = raw.confidence;
  const counterevidenceDigests = raw.counterevidence_digests;
  if (!isRecord(registryResult)) errors.push(`registry_result_invalid:${index}`);
  if (!isRecord(observation)) errors.push(`observation_invalid:${index}`);
  if (!isRecord(baseline)) errors.push(`baseline_invalid:${index}`);
  if (predicted !== null && !isRecord(predicted)) errors.push(`prediction_invalid:${index}`);
  if (!isRecord(confidence)) errors.push(`confidence_invalid:${index}`);
  if (!Array.isArray(counterevidenceDigests)) {
    errors.push(`counterevidence_digest_invalid:${index}`);
  }
  if (errors.length > 0) return { errors, input: null };
  const input = raw as unknown as UniversalImprovementNormalizationInput;
  if (!IDENTIFIER_PATTERN.test(input.correlation_id))
    errors.push(`correlation_id_invalid:${index}`);
  if (input.causation_id !== null && !/^uil-event-[0-9a-f]{64}$/u.test(input.causation_id)) {
    errors.push(`causation_id_invalid:${index}`);
  }
  if (
    !Number.isFinite(input.confidence.score) ||
    input.confidence.score < 0 ||
    input.confidence.score > 1 ||
    !DIGEST_PATTERN.test(input.confidence.basis_digest)
  ) {
    errors.push(`confidence_invalid:${index}`);
  }
  if (
    !Array.isArray(input.counterevidence_digests) ||
    input.counterevidence_digests.some((digest) => !DIGEST_PATTERN.test(digest))
  ) {
    errors.push(`counterevidence_digest_invalid:${index}`);
  }
  if (input.baseline.state === "missing") {
    if (input.baseline.revision !== null || input.baseline.payload_digest !== null) {
      errors.push(`baseline_missing_state_invalid:${index}`);
    }
  } else if (
    input.baseline.state !== "current" ||
    !validRevision(input.baseline.revision) ||
    !DIGEST_PATTERN.test(input.baseline.payload_digest ?? "")
  ) {
    errors.push(`baseline_current_state_invalid:${index}`);
  }
  if (
    input.predicted !== null &&
    (!validRevision(input.predicted.revision) ||
      !DIGEST_PATTERN.test(input.predicted.payload_digest))
  ) {
    errors.push(`prediction_invalid:${index}`);
  }
  return { errors, input };
}

function eventIdentity(input: UniversalImprovementNormalizationInput): string {
  return `uil-event-${sha256Digest(
    canonicalJson({
      source_id: input.observation.source_id,
      source_revision: input.observation.source_revision,
      observed_at: input.observation.observed_at,
      payload_digest: input.observation.payload_digest,
      evidence_digest: input.observation.evidence_digest,
    }),
  ).slice("sha256:".length)}`;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareBytewise);
}

function sortedUniqueDigests(values: readonly Sha256Digest[]): Sha256Digest[] {
  return [...new Set(values)].sort(compareBytewise);
}

export function normalizeUniversalImprovementObservations(
  inputs: readonly unknown[],
  now: Date = new Date(),
): UniversalImprovementNormalizationResult {
  if (!Array.isArray(inputs) || inputs.length === 0) {
    return { ok: false, events: [], exact_set_digest: null, errors: ["normalization_input_empty"] };
  }
  const errors: string[] = [];
  const events: UniversalImprovementNormalizedEventV1[] = [];
  for (const [index, raw] of inputs.entries()) {
    const validation = validateInput(raw, index);
    errors.push(...validation.errors);
    const input = validation.input;
    if (!input || validation.errors.length > 0) continue;
    let admission: ReturnType<typeof admitUniversalImprovementSource>;
    try {
      admission = admitUniversalImprovementSource(input.registry_result, input.observation, now);
    } catch {
      errors.push(`source_admission_failed:${input.observation.source_id}:registry_result_invalid`);
      continue;
    }
    if (
      !admission.ok ||
      !admission.entry ||
      !admission.registry_version ||
      !admission.registry_source_digest ||
      !admission.registry_bytes_digest
    ) {
      for (const finding of admission.findings) {
        errors.push(`source_admission_failed:${input.observation.source_id}:${finding.code}`);
      }
      continue;
    }
    const counterevidence = sortedUniqueDigests(input.counterevidence_digests);
    const eventWithoutDigest = {
      schema_version: UNIVERSAL_IMPROVEMENT_NORMALIZED_EVENT_SCHEMA_VERSION,
      event_id: eventIdentity(input),
      registry_version: admission.registry_version,
      registry_source_digest: admission.registry_source_digest,
      registry_bytes_digest: admission.registry_bytes_digest,
      source_id: admission.entry.source_id,
      source_kind: admission.entry.source_kind,
      source_schema_version: admission.entry.schema_version,
      source_revision: String(admission.entry.revision),
      detector_id: admission.entry.detector.detector_id,
      detector_version: admission.entry.detector.detector_version,
      baseline: input.baseline,
      observed: {
        revision: input.observation.source_revision,
        observed_at: input.observation.observed_at,
        payload_digest: input.observation.payload_digest,
        evidence_digest: input.observation.evidence_digest,
      },
      predicted: input.predicted,
      correlation_id: input.correlation_id,
      causation_id: input.causation_id,
      confidence: input.confidence,
      counterevidence_digests: counterevidence,
    };
    events.push({
      ...eventWithoutDigest,
      event_digest: sha256Digest(canonicalJson(eventWithoutDigest)),
    });
  }
  const eventIds = new Set<string>();
  for (const event of events) {
    if (eventIds.has(event.event_id)) errors.push(`duplicate_event_id:${event.event_id}`);
    eventIds.add(event.event_id);
  }
  const byId = new Map(events.map((event) => [event.event_id, event]));
  for (const event of events) {
    if (event.causation_id === null) continue;
    const cause = byId.get(event.causation_id);
    if (!cause) errors.push(`causation_unresolved:${event.causation_id}`);
    else if (cause.correlation_id !== event.correlation_id) {
      errors.push(`causation_correlation_mismatch:${event.event_id}`);
    }
  }
  if (errors.length > 0) {
    return { ok: false, events: [], exact_set_digest: null, errors: sortedUnique(errors) };
  }
  const normalized = [...events].sort((left, right) =>
    compareBytewise(left.event_id, right.event_id),
  );
  return {
    ok: true,
    events: normalized,
    exact_set_digest: sha256Digest(canonicalJson(normalized)),
    errors: [],
  };
}
