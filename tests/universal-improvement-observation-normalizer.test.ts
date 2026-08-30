import { describe, expect, it } from "vitest";
import { type Sha256Digest, sha256Digest } from "../src/runtime/digest";
import {
  normalizeUniversalImprovementObservations,
  type UniversalImprovementNormalizationInput,
} from "../src/runtime/universal-improvement-observation-normalizer";
import {
  loadUniversalImprovementSourceRegistry,
  type UniversalImprovementSourceObservation,
} from "../src/runtime/universal-improvement-source-registry";

// PLAN-L7-705-universal-improvement-observation-normalizer
const NOW = new Date("2026-08-30T12:00:00.000Z");

function observation(index: number): UniversalImprovementSourceObservation {
  return {
    source_id: "UIL-SRC-001",
    schema_version: "ci-execution-telemetry.v1",
    detector_id: "UIL-DET-001",
    source_revision: "1",
    observed_at: `2026-08-30T0${index}:00:00.000Z`,
    payload_digest: sha256Digest(`payload:${index}`),
    evidence_digest: sha256Digest(`evidence:${index}`),
  };
}

function input(index: number): UniversalImprovementNormalizationInput {
  return {
    registry_result: loadUniversalImprovementSourceRegistry(process.cwd()),
    observation: observation(index),
    baseline: {
      state: "current",
      revision: "baseline-1",
      payload_digest: sha256Digest("baseline:1"),
    },
    predicted: null,
    correlation_id: "corr-ci-1",
    causation_id: null,
    confidence: { score: 0.8, basis_digest: sha256Digest("confidence:1") },
    counterevidence_digests: [sha256Digest("counter:1")],
  };
}

describe("Universal Improvement observation normalizer", () => {
  it("U-UILNORM-001: admitted sourceをbaseline／observed／predicted分離eventへ正規化する", () => {
    const result = normalizeUniversalImprovementObservations([input(1)], NOW);
    expect(result.ok).toBe(true);
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      source_id: "UIL-SRC-001",
      source_kind: "ci",
      baseline: { state: "current", revision: "baseline-1" },
      observed: { revision: "1" },
      predicted: null,
      correlation_id: "corr-ci-1",
    });
    expect(result.exact_set_digest).toMatch(/^sha256:[0-9a-f]{64}$/u);
  });

  it("U-UILNORM-002: 同一入力集合は順序に依存せず同じexact set／digestを返す", () => {
    const first = input(1);
    const second = input(2);
    expect(normalizeUniversalImprovementObservations([first, second], NOW)).toEqual(
      normalizeUniversalImprovementObservations([second, first], NOW),
    );
  });

  it("U-UILNORM-003: forged registry、wrong revision、digest driftをsource admissionで拒否する", () => {
    const forged = input(1);
    forged.registry_result = { ...forged.registry_result, physical_binding_verified: true };
    const wrongRevision = input(1);
    wrongRevision.observation = { ...wrongRevision.observation, source_revision: "999" };
    expect(normalizeUniversalImprovementObservations([forged], NOW).errors).toContain(
      "source_admission_failed:UIL-SRC-001:physical_binding_required",
    );
    expect(normalizeUniversalImprovementObservations([wrongRevision], NOW).errors).toContain(
      "source_admission_failed:UIL-SRC-001:source_revision_mismatch",
    );
  });

  it("U-UILNORM-004: baseline missing／currentとpredictionを混同しない", () => {
    const missing = input(1);
    missing.baseline = { state: "missing", revision: null, payload_digest: null };
    missing.predicted = {
      revision: "prediction-1",
      payload_digest: sha256Digest("prediction:1"),
    };
    expect(normalizeUniversalImprovementObservations([missing], NOW).ok).toBe(true);

    const invalidMissing = input(1);
    invalidMissing.baseline = {
      state: "missing",
      revision: "must-be-null",
      payload_digest: null,
    };
    expect(normalizeUniversalImprovementObservations([invalidMissing], NOW).errors).toContain(
      "baseline_missing_state_invalid:0",
    );
  });

  it("U-UILNORM-005: duplicate eventとunresolved／cross-correlation causationを拒否する", () => {
    const duplicate = input(1);
    expect(normalizeUniversalImprovementObservations([duplicate, duplicate], NOW).errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/^duplicate_event_id:/u)]),
    );

    const unresolved = input(2);
    unresolved.causation_id = `uil-event-${"0".repeat(64)}`;
    expect(normalizeUniversalImprovementObservations([unresolved], NOW).errors).toContain(
      `causation_unresolved:uil-event-${"0".repeat(64)}`,
    );

    const cause = input(1);
    const causeEvent = normalizeUniversalImprovementObservations([cause], NOW).events[0];
    if (!causeEvent) throw new Error("cause event missing");
    const crossCorrelation = input(2);
    crossCorrelation.causation_id = causeEvent.event_id;
    crossCorrelation.correlation_id = "corr-other";
    expect(
      normalizeUniversalImprovementObservations([cause, crossCorrelation], NOW).errors,
    ).toEqual(expect.arrayContaining([expect.stringMatching(/^causation_correlation_mismatch:/u)]));
  });

  it("U-UILNORM-006: invalid confidence、counterevidence、identifierをfail-closeする", () => {
    const invalid = input(1);
    invalid.confidence = { score: 2, basis_digest: "invalid" as Sha256Digest };
    invalid.counterevidence_digests = ["invalid" as Sha256Digest];
    invalid.correlation_id = "";
    expect(normalizeUniversalImprovementObservations([invalid], NOW).errors).toEqual(
      expect.arrayContaining([
        "confidence_invalid:0",
        "counterevidence_digest_invalid:0",
        "correlation_id_invalid:0",
      ]),
    );
  });

  it("U-UILNORM-007: malformed outer／nested inputとregistry resultをthrowせずfail-closeする", () => {
    const malformedNested = {
      ...input(1),
      baseline: null,
      confidence: null,
      counterevidence_digests: null,
    };
    const malformedRegistry = { ...input(1), registry_result: { ok: true } };

    expect(normalizeUniversalImprovementObservations([null]).errors).toEqual([
      "normalization_input_invalid:0",
    ]);
    expect(normalizeUniversalImprovementObservations([malformedNested]).errors).toEqual(
      expect.arrayContaining([
        "baseline_invalid:0",
        "confidence_invalid:0",
        "counterevidence_digest_invalid:0",
      ]),
    );
    expect(normalizeUniversalImprovementObservations([malformedRegistry]).errors).toContain(
      "source_admission_failed:UIL-SRC-001:registry_result_invalid",
    );

    const missingCorrelation = input(1) as unknown as Record<string, unknown>;
    delete missingCorrelation.correlation_id;
    expect(normalizeUniversalImprovementObservations([missingCorrelation]).errors).toContain(
      "correlation_id_invalid:0",
    );

    const nonStringCorrelation = {
      ...input(1),
      correlation_id: 123,
    } as unknown as UniversalImprovementNormalizationInput;
    expect(normalizeUniversalImprovementObservations([nonStringCorrelation]).errors).toContain(
      "correlation_id_invalid:0",
    );
  });
});
