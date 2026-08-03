import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  resolveWorkerIsolationExecutionOrigin,
  type WorkerAdmissionBinding,
  type WorkerIsolationExecutionOrigin,
} from "./worker-isolation-broker";
import {
  readValidatedWorkerPayload,
  type WorkerValidatedOutputCapability,
} from "./worker-output-admission";

const DEFINITION_KEYS = [
  "admission_level",
  "benchmark_id",
  "cost_policy",
  "fixture_digest",
  "risk_class",
  "rubric",
  "schema_version",
  "task_digest",
] as const;
const COST_POLICY_KEYS = ["duration_weight", "retry_weight", "token_weight"] as const;
const RUBRIC_KEYS = ["dimension_id", "max", "min", "weight"] as const;

export type WorkerBlindBenchmarkFailureCode =
  | "WORKER_BLIND_DEFINITION_INVALID"
  | "WORKER_BLIND_SMOKE_ONLY_REJECTED"
  | "WORKER_BLIND_DEFINITION_UNSEALED"
  | "WORKER_BLIND_PACKET_INVALID"
  | "WORKER_BLIND_PACKET_UNSEALED"
  | "WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED"
  | "WORKER_BLIND_EVALUATION_UNSEALED"
  | "WORKER_BLIND_PROVENANCE_DUPLICATE"
  | "WORKER_BLIND_SCORE_INVALID";

export interface WorkerBlindRubricDimensionV1 {
  dimension_id: string;
  weight: number;
  min: number;
  max: number;
}

export interface WorkerBlindBenchmarkDefinitionInput {
  schema_version: "helix-worker-blind-benchmark-definition.v1";
  benchmark_id: string;
  fixture_digest: Sha256Digest;
  rubric: readonly WorkerBlindRubricDimensionV1[];
  task_digest: Sha256Digest;
  risk_class: "low" | "medium" | "high" | "critical";
  admission_level: "smoke" | "full";
  cost_policy: {
    duration_weight: number;
    token_weight: number;
    retry_weight: number;
  };
}

export interface WorkerBlindBenchmarkDefinitionV1 extends WorkerBlindBenchmarkDefinitionInput {
  definition_digest: Sha256Digest;
}

export interface WorkerBlindBenchmarkCapability {
  readonly kind: "worker_blind_benchmark_definition";
  readonly definition_digest: Sha256Digest;
}

export interface WorkerBlindCandidateRequest {
  candidate_id: string;
  output: WorkerValidatedOutputCapability;
  current: WorkerAdmissionBinding;
}

export interface WorkerBlindPacketV1 {
  schema_version: "helix-worker-blind-packet.v1";
  benchmark_definition_digest: Sha256Digest;
  blind_candidate_id: string;
  fixture_digest: Sha256Digest;
  rubric_digest: Sha256Digest;
  task_digest: Sha256Digest;
  risk_class: WorkerBlindBenchmarkDefinitionInput["risk_class"];
  artifact_digests: readonly Sha256Digest[];
  author_claim_count: 0;
  private_context_count: 0;
  packet_digest: Sha256Digest;
}

export interface WorkerBlindPacketCapability {
  readonly kind: "worker_blind_packet";
  readonly packet_digest: Sha256Digest;
}

export interface WorkerBlindObservationV1 {
  duration_ms: number;
  token_count: number;
  retry_count: number;
}

export interface WorkerBlindBenchmarkEvaluationRequest {
  packet: WorkerBlindPacketCapability;
  judge_output: WorkerValidatedOutputCapability;
  judge_current: WorkerAdmissionBinding;
}

export interface WorkerBlindRankingRowV1 {
  rank: number;
  candidate_id: string;
  worker_id: string;
  model: string;
  effort: string;
  blind_score: number;
  effective_cost: number;
  packet_digest: Sha256Digest;
}

export interface WorkerBlindBenchmarkReceiptV1 {
  readonly schema_version: "helix-worker-blind-benchmark-receipt.v1";
  readonly definition_digest: Sha256Digest;
  readonly ranking: readonly WorkerBlindRankingRowV1[];
  readonly selected_candidate_id: string;
  readonly receipt_digest: Sha256Digest;
}

type Failure = { ok: false; failure_code: WorkerBlindBenchmarkFailureCode };
type DefinitionSeal = { definition: WorkerBlindBenchmarkDefinitionV1 };
type PacketSeal = {
  definition: WorkerBlindBenchmarkDefinitionV1;
  candidate_id: string;
  origin: WorkerIsolationExecutionOrigin;
  packet: WorkerBlindPacketV1;
};

const definitionSeals = new WeakMap<WorkerBlindBenchmarkCapability, DefinitionSeal>();
const packetSeals = new WeakMap<WorkerBlindPacketCapability, PacketSeal>();
const receiptSeals = new WeakSet<WorkerBlindBenchmarkReceiptV1>();

function failure(failure_code: WorkerBlindBenchmarkFailureCode): Failure {
  return { ok: false, failure_code };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isSafeId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9._-]{0,127}$/u.test(value);
}

function isFiniteNonnegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function validDefinition(input: unknown): input is WorkerBlindBenchmarkDefinitionInput {
  if (!isRecord(input) || !hasExactKeys(input, DEFINITION_KEYS)) return false;
  if (
    input.schema_version !== "helix-worker-blind-benchmark-definition.v1" ||
    !isSafeId(input.benchmark_id) ||
    !isDigest(input.fixture_digest) ||
    !isDigest(input.task_digest) ||
    !["low", "medium", "high", "critical"].includes(String(input.risk_class)) ||
    !["smoke", "full"].includes(String(input.admission_level)) ||
    !Array.isArray(input.rubric) ||
    input.rubric.length === 0 ||
    !isRecord(input.cost_policy) ||
    !hasExactKeys(input.cost_policy, COST_POLICY_KEYS)
  ) {
    return false;
  }
  const dimensions = new Set<string>();
  let weightTotal = 0;
  for (const row of input.rubric) {
    if (
      !isRecord(row) ||
      !hasExactKeys(row, RUBRIC_KEYS) ||
      !isSafeId(row.dimension_id) ||
      dimensions.has(row.dimension_id) ||
      typeof row.weight !== "number" ||
      !Number.isSafeInteger(row.weight) ||
      row.weight <= 0 ||
      !isFiniteNonnegative(row.min) ||
      !isFiniteNonnegative(row.max) ||
      row.min >= row.max
    ) {
      return false;
    }
    dimensions.add(row.dimension_id);
    weightTotal += row.weight;
  }
  return (
    weightTotal === 100 &&
    isFiniteNonnegative(input.cost_policy.duration_weight) &&
    isFiniteNonnegative(input.cost_policy.token_weight) &&
    isFiniteNonnegative(input.cost_policy.retry_weight)
  );
}

export function freezeWorkerBlindBenchmark(input: WorkerBlindBenchmarkDefinitionInput):
  | Failure
  | {
      ok: true;
      capability: WorkerBlindBenchmarkCapability;
      definition: WorkerBlindBenchmarkDefinitionV1;
    } {
  if (!validDefinition(input)) return failure("WORKER_BLIND_DEFINITION_INVALID");
  if (input.admission_level === "smoke") return failure("WORKER_BLIND_SMOKE_ONLY_REJECTED");
  const payload: WorkerBlindBenchmarkDefinitionInput = {
    ...input,
    rubric: Object.freeze(input.rubric.map((row) => Object.freeze({ ...row }))),
    cost_policy: Object.freeze({ ...input.cost_policy }),
  };
  const definition = Object.freeze({
    ...payload,
    definition_digest: sha256Digest(canonicalJson(payload)),
  });
  const capability = Object.freeze({
    kind: "worker_blind_benchmark_definition" as const,
    definition_digest: definition.definition_digest,
  });
  definitionSeals.set(capability, { definition });
  return { ok: true, capability, definition };
}

export function buildWorkerBlindPacket(
  capability: WorkerBlindBenchmarkCapability,
  candidate: WorkerBlindCandidateRequest,
): Failure | { ok: true; capability: WorkerBlindPacketCapability; packet: WorkerBlindPacketV1 } {
  const seal = definitionSeals.get(capability);
  if (!seal) return failure("WORKER_BLIND_DEFINITION_UNSEALED");
  if (!isSafeId(candidate.candidate_id)) return failure("WORKER_BLIND_PACKET_INVALID");
  const origin = resolveWorkerIsolationExecutionOrigin(candidate.output, candidate.current);
  if (!origin) return failure("WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED");
  const packetPayload = {
    schema_version: "helix-worker-blind-packet.v1" as const,
    benchmark_definition_digest: seal.definition.definition_digest,
    blind_candidate_id: sha256Digest(
      canonicalJson({
        definition_digest: seal.definition.definition_digest,
        candidate_id: candidate.candidate_id,
      }),
    ),
    fixture_digest: seal.definition.fixture_digest,
    rubric_digest: sha256Digest(canonicalJson(seal.definition.rubric)),
    task_digest: seal.definition.task_digest,
    risk_class: seal.definition.risk_class,
    artifact_digests: Object.freeze([candidate.output.payload_digest]),
    author_claim_count: 0 as const,
    private_context_count: 0 as const,
  };
  const packet = Object.freeze({
    ...packetPayload,
    packet_digest: sha256Digest(canonicalJson(packetPayload)),
  });
  const packetCapability = Object.freeze({
    kind: "worker_blind_packet" as const,
    packet_digest: packet.packet_digest,
  });
  packetSeals.set(packetCapability, {
    definition: seal.definition,
    candidate_id: candidate.candidate_id,
    origin,
    packet,
  });
  return { ok: true, capability: packetCapability, packet };
}

function scoreInput(
  definition: WorkerBlindBenchmarkDefinitionV1,
  scores: Readonly<Record<string, number>>,
  observation: WorkerBlindObservationV1,
): { blindScore: number; effectiveCost: number } | null {
  const expected = definition.rubric.map((row) => row.dimension_id).sort();
  const actual = Object.keys(scores).sort();
  if (
    expected.length !== actual.length ||
    expected.some((key, index) => key !== actual[index]) ||
    !Number.isSafeInteger(observation.duration_ms) ||
    !Number.isSafeInteger(observation.token_count) ||
    !Number.isSafeInteger(observation.retry_count) ||
    observation.duration_ms < 0 ||
    observation.token_count < 0 ||
    observation.retry_count < 0
  ) {
    return null;
  }
  let weighted = 0;
  for (const row of definition.rubric) {
    const score = scores[row.dimension_id];
    if (typeof score !== "number" || !Number.isFinite(score) || score < row.min || score > row.max)
      return null;
    weighted += score * row.weight;
  }
  return {
    blindScore: weighted / 100,
    effectiveCost:
      observation.duration_ms * definition.cost_policy.duration_weight +
      observation.token_count * definition.cost_policy.token_weight +
      observation.retry_count * definition.cost_policy.retry_weight,
  };
}

function parseEvaluationPayload(
  output: WorkerValidatedOutputCapability,
  expectedPacketDigest: Sha256Digest,
): { scores: Readonly<Record<string, number>>; observation: WorkerBlindObservationV1 } | null {
  const raw = readValidatedWorkerPayload(output);
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["observation", "packet_digest", "schema_version", "scores"]) ||
    value.schema_version !== "helix-worker-blind-evaluation.v1" ||
    value.packet_digest !== expectedPacketDigest ||
    !Array.isArray(value.scores) ||
    !isRecord(value.observation) ||
    !hasExactKeys(value.observation, ["duration_ms", "retry_count", "token_count"])
  ) {
    return null;
  }
  const scores: Record<string, number> = {};
  for (const row of value.scores) {
    if (
      !isRecord(row) ||
      !hasExactKeys(row, ["dimension_id", "score"]) ||
      !isSafeId(row.dimension_id) ||
      typeof row.score !== "number" ||
      Object.hasOwn(scores, row.dimension_id)
    ) {
      return null;
    }
    scores[row.dimension_id] = row.score;
  }
  return {
    scores,
    observation: value.observation as unknown as WorkerBlindObservationV1,
  };
}

function provenanceKey(origin: WorkerIsolationExecutionOrigin): string {
  return canonicalJson({
    descriptor_digest: origin.descriptor_digest,
    effort: origin.effort,
    identity: origin.identity,
    model: origin.model,
    provider: origin.provider,
  });
}

export function evaluateWorkerBlindBenchmark(
  capability: WorkerBlindBenchmarkCapability,
  evaluations: readonly WorkerBlindBenchmarkEvaluationRequest[],
): Failure | { ok: true; receipt: WorkerBlindBenchmarkReceiptV1 } {
  const definitionSeal = definitionSeals.get(capability);
  if (!definitionSeal) return failure("WORKER_BLIND_DEFINITION_UNSEALED");
  if (evaluations.length < 2) return failure("WORKER_BLIND_PROVENANCE_DUPLICATE");
  const candidateIds = new Set<string>();
  const candidateProvenance = new Set<string>();
  const rows: Omit<WorkerBlindRankingRowV1, "rank">[] = [];
  for (const evaluation of evaluations) {
    const packetSeal = packetSeals.get(evaluation.packet);
    if (!packetSeal) return failure("WORKER_BLIND_PACKET_UNSEALED");
    if (packetSeal.definition.definition_digest !== definitionSeal.definition.definition_digest)
      return failure("WORKER_BLIND_PACKET_INVALID");
    if (candidateIds.has(packetSeal.candidate_id)) return failure("WORKER_BLIND_SCORE_INVALID");
    candidateIds.add(packetSeal.candidate_id);
    const provenance = provenanceKey(packetSeal.origin);
    if (candidateProvenance.has(provenance)) return failure("WORKER_BLIND_PROVENANCE_DUPLICATE");
    candidateProvenance.add(provenance);
    const judgeOrigin = resolveWorkerIsolationExecutionOrigin(
      evaluation.judge_output,
      evaluation.judge_current,
    );
    if (!judgeOrigin) return failure("WORKER_BLIND_EVALUATION_UNSEALED");
    if (judgeOrigin.identity === packetSeal.origin.identity)
      return failure("WORKER_BLIND_EVALUATION_UNSEALED");
    const payload = parseEvaluationPayload(
      evaluation.judge_output,
      packetSeal.packet.packet_digest,
    );
    if (!payload) return failure("WORKER_BLIND_EVALUATION_UNSEALED");
    const scored = scoreInput(definitionSeal.definition, payload.scores, payload.observation);
    if (!scored) return failure("WORKER_BLIND_SCORE_INVALID");
    rows.push({
      candidate_id: packetSeal.candidate_id,
      worker_id: packetSeal.origin.identity,
      model: packetSeal.origin.model,
      effort: packetSeal.origin.effort,
      blind_score: scored.blindScore,
      effective_cost: scored.effectiveCost,
      packet_digest: packetSeal.packet.packet_digest,
    });
  }
  rows.sort(
    (left, right) =>
      right.blind_score - left.blind_score ||
      left.effective_cost - right.effective_cost ||
      left.candidate_id.localeCompare(right.candidate_id),
  );
  const ranking = Object.freeze(
    rows.map((row, index) => Object.freeze({ ...row, rank: index + 1 })),
  );
  const payload = {
    schema_version: "helix-worker-blind-benchmark-receipt.v1" as const,
    definition_digest: definitionSeal.definition.definition_digest,
    ranking,
    selected_candidate_id: ranking[0]?.candidate_id ?? "",
  };
  const receipt = Object.freeze({
    ...payload,
    receipt_digest: sha256Digest(canonicalJson(payload)),
  });
  receiptSeals.add(receipt);
  return { ok: true, receipt };
}

export function isWorkerBlindBenchmarkReceipt(
  value: unknown,
): value is WorkerBlindBenchmarkReceiptV1 {
  return isRecord(value) && receiptSeals.has(value as unknown as WorkerBlindBenchmarkReceiptV1);
}
