import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

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

const definitionSeals = new WeakMap<
  WorkerBlindBenchmarkCapability,
  WorkerBlindBenchmarkDefinitionV1
>();

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
    input.cost_policy.token_weight === 0 &&
    input.cost_policy.retry_weight === 0
  );
}

export type WorkerBlindDefinitionFreezeResult =
  | {
      ok: false;
      failure_code: "WORKER_BLIND_DEFINITION_INVALID" | "WORKER_BLIND_SMOKE_ONLY_REJECTED";
    }
  | {
      ok: true;
      capability: WorkerBlindBenchmarkCapability;
      definition: WorkerBlindBenchmarkDefinitionV1;
    };

export function freezeWorkerBlindDefinition(
  input: WorkerBlindBenchmarkDefinitionInput,
): WorkerBlindDefinitionFreezeResult {
  if (!validDefinition(input))
    return { ok: false, failure_code: "WORKER_BLIND_DEFINITION_INVALID" };
  if (input.admission_level === "smoke") {
    return { ok: false, failure_code: "WORKER_BLIND_SMOKE_ONLY_REJECTED" };
  }
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
  definitionSeals.set(capability, definition);
  return { ok: true, capability, definition };
}

export function readWorkerBlindBenchmarkDefinition(
  capability: WorkerBlindBenchmarkCapability,
): WorkerBlindBenchmarkDefinitionV1 | null {
  return definitionSeals.get(capability) ?? null;
}

export function isWorkerBlindBenchmarkDefinitionCapability(
  value: unknown,
): value is WorkerBlindBenchmarkCapability {
  return isRecord(value) && definitionSeals.has(value as unknown as WorkerBlindBenchmarkCapability);
}
