import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  freezeWorkerBlindDefinition,
  readWorkerBlindBenchmarkDefinition,
  type WorkerBlindBenchmarkCapability,
  type WorkerBlindBenchmarkDefinitionInput,
  type WorkerBlindBenchmarkDefinitionV1,
} from "./worker-blind-definition";

export type {
  WorkerBlindBenchmarkCapability,
  WorkerBlindBenchmarkDefinitionInput,
  WorkerBlindBenchmarkDefinitionV1,
  WorkerBlindRubricDimensionV1,
} from "./worker-blind-definition";

import {
  resolveWorkerBenchmarkExecution,
  resolveWorkerBlindJudgeContext,
  resolveWorkerExecutionObservation,
  resolveWorkerIsolationExecutionOrigin,
  sealWorkerBenchmarkExecution,
  sealWorkerBlindJudgeContext,
  type WorkerAdmissionBinding,
  type WorkerBenchmarkExecutionCapability,
  type WorkerBlindJudgeContextCapability,
  type WorkerExecutionObservationCapability,
  type WorkerIsolationExecutionOrigin,
} from "./worker-isolation-broker";
import {
  readValidatedWorkerPayload,
  type WorkerValidatedOutputCapability,
} from "./worker-output-admission";

export type WorkerBlindBenchmarkFailureCode =
  | "WORKER_BLIND_DEFINITION_INVALID"
  | "WORKER_BLIND_SMOKE_ONLY_REJECTED"
  | "WORKER_BLIND_DEFINITION_UNSEALED"
  | "WORKER_BLIND_PACKET_INVALID"
  | "WORKER_BLIND_PACKET_UNSEALED"
  | "WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED"
  | "WORKER_BLIND_EXECUTION_CONTEXT_MISMATCH"
  | "WORKER_BLIND_OBSERVATION_UNSEALED"
  | "WORKER_BLIND_EVALUATION_UNSEALED"
  | "WORKER_BLIND_PROVENANCE_DUPLICATE"
  | "WORKER_BLIND_SCORE_INVALID";

export interface WorkerBlindCandidateRequest {
  candidate_id: string;
  output: WorkerValidatedOutputCapability;
  current: WorkerAdmissionBinding;
  observation: WorkerExecutionObservationCapability;
  execution: WorkerBenchmarkExecutionCapability;
}

export interface WorkerBlindPacketV1 {
  schema_version: "helix-worker-blind-packet.v1";
  benchmark_definition_digest: Sha256Digest;
  blind_candidate_id: Sha256Digest;
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

export interface WorkerBlindJudgeContext {
  readonly capability: WorkerBlindJudgeContextCapability;
  readonly task: string;
}

export interface WorkerBlindBenchmarkEvaluationRequest {
  packet: WorkerBlindPacketCapability;
  judge_output: WorkerValidatedOutputCapability;
  judge_current: WorkerAdmissionBinding;
  judge_context: WorkerBlindJudgeContextCapability;
}

export interface WorkerBlindRankingRowV1 {
  rank: number;
  candidate_id: string;
  worker_id: string;
  model: string;
  effort: string | null;
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
type PacketSeal = {
  definition: WorkerBlindBenchmarkDefinitionV1;
  candidate_id: string;
  origin: WorkerIsolationExecutionOrigin;
  observation: WorkerExecutionObservationCapability;
  opaque_candidate_key: Sha256Digest;
  packet: WorkerBlindPacketV1;
};

const packetSeals = new WeakMap<WorkerBlindPacketCapability, PacketSeal>();
const receiptSeals = new WeakSet<WorkerBlindBenchmarkReceiptV1>();
const receiptRiskClasses = new WeakMap<
  WorkerBlindBenchmarkReceiptV1,
  WorkerBlindBenchmarkDefinitionInput["risk_class"]
>();

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

function isSafeId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9._-]{0,127}$/u.test(value);
}

export function freezeWorkerBlindBenchmark(input: WorkerBlindBenchmarkDefinitionInput):
  | Failure
  | {
      ok: true;
      capability: WorkerBlindBenchmarkCapability;
      definition: WorkerBlindBenchmarkDefinitionV1;
      execution: WorkerBenchmarkExecutionCapability;
    } {
  const frozen = freezeWorkerBlindDefinition(input);
  if (!frozen.ok) return frozen;
  const { capability, definition } = frozen;
  const execution = sealWorkerBenchmarkExecution(capability, {
    definition_digest: definition.definition_digest,
    fixture_digest: definition.fixture_digest,
    task_digest: definition.task_digest,
    risk_class: definition.risk_class,
  });
  if (!execution) throw new Error("sealed definition capability was not accepted by broker");
  return { ok: true, capability, definition, execution };
}

export function buildWorkerBlindPacket(
  capability: WorkerBlindBenchmarkCapability,
  candidate: WorkerBlindCandidateRequest,
): Failure | { ok: true; capability: WorkerBlindPacketCapability; packet: WorkerBlindPacketV1 } {
  const definition = readWorkerBlindBenchmarkDefinition(capability);
  if (!definition) return failure("WORKER_BLIND_DEFINITION_UNSEALED");
  if (!isSafeId(candidate.candidate_id)) return failure("WORKER_BLIND_PACKET_INVALID");
  const origin = resolveWorkerIsolationExecutionOrigin(candidate.output, candidate.current);
  if (!origin) return failure("WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED");
  if (!resolveWorkerBenchmarkExecution(candidate.output, candidate.execution)) {
    return failure("WORKER_BLIND_EXECUTION_CONTEXT_MISMATCH");
  }
  if (
    origin.benchmark_definition_digest !== definition.definition_digest ||
    origin.fixture_digest !== definition.fixture_digest ||
    origin.task_digest !== definition.task_digest ||
    origin.risk_class !== definition.risk_class
  ) {
    return failure("WORKER_BLIND_EXECUTION_CONTEXT_MISMATCH");
  }
  const observation = resolveWorkerExecutionObservation(candidate.observation, candidate.output);
  if (!observation) return failure("WORKER_BLIND_OBSERVATION_UNSEALED");
  const packetPayload = {
    schema_version: "helix-worker-blind-packet.v1" as const,
    benchmark_definition_digest: definition.definition_digest,
    blind_candidate_id: sha256Digest(
      canonicalJson({
        definition_digest: definition.definition_digest,
        candidate_id: candidate.candidate_id,
      }),
    ),
    fixture_digest: definition.fixture_digest,
    rubric_digest: sha256Digest(canonicalJson(definition.rubric)),
    task_digest: definition.task_digest,
    risk_class: definition.risk_class,
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
    definition,
    candidate_id: candidate.candidate_id,
    origin,
    observation,
    opaque_candidate_key: sha256Digest(
      canonicalJson({
        origin: provenanceKey(origin),
        output_digest: candidate.output.payload_digest,
      }),
    ),
    packet,
  });
  return { ok: true, capability: packetCapability, packet };
}

export function buildWorkerBlindJudgeContext(
  packetCapability: WorkerBlindPacketCapability,
): Failure | { ok: true; context: WorkerBlindJudgeContext } {
  const seal = packetSeals.get(packetCapability);
  if (!seal) return failure("WORKER_BLIND_PACKET_UNSEALED");
  const sealed = sealWorkerBlindJudgeContext(seal.packet);
  if (!sealed) return failure("WORKER_BLIND_PACKET_INVALID");
  return {
    ok: true,
    context: Object.freeze({
      capability: sealed.capability,
      task: sealed.task,
    }),
  };
}

function scoreInput(
  definition: WorkerBlindBenchmarkDefinitionV1,
  scores: Readonly<Record<string, number>>,
  durationMs: number,
): { blindScore: number; effectiveCost: number } | null {
  const expected = definition.rubric.map((row) => row.dimension_id).sort();
  const actual = Object.keys(scores).sort();
  if (
    expected.length !== actual.length ||
    expected.some((key, index) => key !== actual[index]) ||
    !Number.isSafeInteger(durationMs) ||
    durationMs < 0
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
    effectiveCost: durationMs * definition.cost_policy.duration_weight,
  };
}

function parseEvaluationPayload(
  output: WorkerValidatedOutputCapability,
  expectedPacketDigest: Sha256Digest,
): { scores: Readonly<Record<string, number>> } | null {
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
    !hasExactKeys(value, ["packet_digest", "schema_version", "scores"]) ||
    value.schema_version !== "helix-worker-blind-evaluation.v1" ||
    value.packet_digest !== expectedPacketDigest ||
    !Array.isArray(value.scores)
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
  const definition = readWorkerBlindBenchmarkDefinition(capability);
  if (!definition) return failure("WORKER_BLIND_DEFINITION_UNSEALED");
  if (evaluations.length < 2) return failure("WORKER_BLIND_PROVENANCE_DUPLICATE");
  const candidateIds = new Set<string>();
  const candidateProvenance = new Set<string>();
  const rows: Array<
    Omit<WorkerBlindRankingRowV1, "rank"> & { opaque_candidate_key: Sha256Digest }
  > = [];
  for (const evaluation of evaluations) {
    const packetSeal = packetSeals.get(evaluation.packet);
    if (!packetSeal) return failure("WORKER_BLIND_PACKET_UNSEALED");
    if (packetSeal.definition.definition_digest !== definition.definition_digest)
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
    if (!resolveWorkerBlindJudgeContext(evaluation.judge_output, evaluation.judge_context)) {
      return failure("WORKER_BLIND_EVALUATION_UNSEALED");
    }
    if (
      judgeOrigin.judge_packet_digest !== packetSeal.packet.packet_digest ||
      judgeOrigin.identity === packetSeal.origin.identity ||
      (judgeOrigin.provider === packetSeal.origin.provider &&
        judgeOrigin.model === packetSeal.origin.model)
    )
      return failure("WORKER_BLIND_EVALUATION_UNSEALED");
    const payload = parseEvaluationPayload(
      evaluation.judge_output,
      packetSeal.packet.packet_digest,
    );
    if (!payload) return failure("WORKER_BLIND_EVALUATION_UNSEALED");
    const scored = scoreInput(definition, payload.scores, packetSeal.observation.duration_ms);
    if (!scored) return failure("WORKER_BLIND_SCORE_INVALID");
    rows.push({
      candidate_id: packetSeal.candidate_id,
      worker_id: packetSeal.origin.identity,
      model: packetSeal.origin.model,
      effort: packetSeal.origin.effort,
      blind_score: scored.blindScore,
      effective_cost: scored.effectiveCost,
      packet_digest: packetSeal.packet.packet_digest,
      opaque_candidate_key: packetSeal.opaque_candidate_key,
    });
  }
  rows.sort(
    (left, right) =>
      right.blind_score - left.blind_score ||
      left.effective_cost - right.effective_cost ||
      left.opaque_candidate_key.localeCompare(right.opaque_candidate_key),
  );
  const ranking = Object.freeze(
    rows.map(({ opaque_candidate_key: _opaqueCandidateKey, ...row }, index) =>
      Object.freeze({ ...row, rank: index + 1 }),
    ),
  );
  const payload = {
    schema_version: "helix-worker-blind-benchmark-receipt.v1" as const,
    definition_digest: definition.definition_digest,
    ranking,
    selected_candidate_id: ranking[0]?.candidate_id ?? "",
  };
  const receipt = Object.freeze({
    ...payload,
    receipt_digest: sha256Digest(canonicalJson(payload)),
  });
  receiptSeals.add(receipt);
  receiptRiskClasses.set(receipt, definition.risk_class);
  return { ok: true, receipt };
}

export function readWorkerBlindBenchmarkReceiptRisk(
  receipt: WorkerBlindBenchmarkReceiptV1,
): WorkerBlindBenchmarkDefinitionInput["risk_class"] | null {
  return receiptSeals.has(receipt) ? (receiptRiskClasses.get(receipt) ?? null) : null;
}

export function isWorkerBlindBenchmarkReceipt(
  value: unknown,
): value is WorkerBlindBenchmarkReceiptV1 {
  return isRecord(value) && receiptSeals.has(value as unknown as WorkerBlindBenchmarkReceiptV1);
}
