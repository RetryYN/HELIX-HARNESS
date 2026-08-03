import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  buildWorkerBlindPacket,
  freezeWorkerBlindBenchmark,
  type WorkerBlindBenchmarkDefinitionInput,
} from "../src/runtime/worker-blind-benchmark";
import { sealWorkerBenchmarkExecution } from "../src/runtime/worker-isolation-broker";

// PLAN-L7-504-worker-blind-benchmark

function definition(
  overrides: Partial<WorkerBlindBenchmarkDefinitionInput> = {},
): WorkerBlindBenchmarkDefinitionInput {
  return {
    schema_version: "helix-worker-blind-benchmark-definition.v1",
    benchmark_id: "worker-review-standard",
    fixture_digest: sha256Digest("fixture"),
    rubric: [
      { dimension_id: "correctness", weight: 60, min: 0, max: 100 },
      { dimension_id: "scope_discipline", weight: 40, min: 0, max: 100 },
    ],
    task_digest: sha256Digest("task"),
    risk_class: "high",
    admission_level: "full",
    cost_policy: {
      duration_weight: 1,
      token_weight: 0,
      retry_weight: 0,
    },
    ...overrides,
  };
}

describe("WCC-FR-07 worker blind benchmark", () => {
  it("U-WBB-001: fixed fixture/rubric/task/riskをexact definition capabilityへ凍結する", () => {
    const frozen = freezeWorkerBlindBenchmark(definition());
    expect(frozen.ok).toBe(true);
    if (!frozen.ok) return;
    expect(frozen.definition.rubric.map((row) => row.dimension_id)).toEqual([
      "correctness",
      "scope_discipline",
    ]);
    expect(frozen.definition.definition_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(
      sealWorkerBenchmarkExecution(
        { ...frozen.capability },
        {
          definition_digest: frozen.definition.definition_digest,
          fixture_digest: frozen.definition.fixture_digest,
          task_digest: frozen.definition.task_digest,
          risk_class: frozen.definition.risk_class,
        },
      ),
    ).toBeNull();
  });

  it("U-WBB-002: author claim/private context/unknown fieldとsmoke-only採用を拒否する", () => {
    expect(
      freezeWorkerBlindBenchmark({ ...definition(), author_claim: "best model" } as never),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_DEFINITION_INVALID" });
    expect(
      freezeWorkerBlindBenchmark({ ...definition(), private_context: "hidden" } as never),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_DEFINITION_INVALID" });
    expect(freezeWorkerBlindBenchmark(definition({ admission_level: "smoke" }))).toEqual({
      ok: false,
      failure_code: "WORKER_BLIND_SMOKE_ONLY_REJECTED",
    });
    const frozen = freezeWorkerBlindBenchmark(definition());
    if (!frozen.ok) throw new Error(frozen.failure_code);
    expect(
      buildWorkerBlindPacket({ ...frozen.capability }, { candidate_id: "candidate-copy" } as never),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_DEFINITION_UNSEALED" });
  });
});
