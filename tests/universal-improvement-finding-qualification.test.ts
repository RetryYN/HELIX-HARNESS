import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import { qualifyUniversalImprovementFindings } from "../src/runtime/universal-improvement-finding-qualification";
import {
  normalizeUniversalImprovementObservations,
  type UniversalImprovementNormalizationInput,
} from "../src/runtime/universal-improvement-observation-normalizer";
import {
  loadUniversalImprovementSourceRegistry,
  type UniversalImprovementSourceObservation,
} from "../src/runtime/universal-improvement-source-registry";

const NOW = new Date("2026-08-30T12:00:00.000Z");

function normalized() {
  const observation: UniversalImprovementSourceObservation = {
    source_id: "UIL-SRC-001",
    schema_version: "ci-execution-telemetry.v1",
    detector_id: "UIL-DET-001",
    source_revision: "1",
    observed_at: "2026-08-30T10:00:00.000Z",
    payload_digest: sha256Digest("payload"),
    evidence_digest: sha256Digest("evidence"),
  };
  const input: UniversalImprovementNormalizationInput = {
    registry_result: loadUniversalImprovementSourceRegistry(process.cwd()),
    observation,
    baseline: { state: "current", revision: "baseline-1", payload_digest: sha256Digest("base") },
    predicted: null,
    correlation_id: "corr-1",
    causation_id: null,
    confidence: { score: 0.9, basis_digest: sha256Digest("confidence") },
    counterevidence_digests: [],
  };
  return normalizeUniversalImprovementObservations([input], NOW);
}

function evidence(overrides: Record<string, unknown> = {}) {
  const result = normalized();
  const event = result.events[0];
  if (!event) throw new Error("normalized event missing");
  return {
    evidence_id: "uil-trigger-evidence-1",
    detector_id: event.detector_id,
    detector_version: event.detector_version,
    trigger_kind: "invariant_violation",
    invariant_id: "UIL-INV-CI-001",
    root_cause_id: "root-ci-1",
    scope_authority: "issue:1246",
    baseline_revision: "baseline-1",
    event_ids: [event.event_id],
    event_digests: [event.event_digest],
    trigger_verdict: "triggered",
    observed_at: "2026-08-30T11:00:00.000Z",
    expires_at: "2026-09-06T11:00:00.000Z",
    counterevidence_digests: [],
    superseded_by: null,
    ...overrides,
  };
}

describe("Universal Improvement finding qualification", () => {
  it("U-UILFQ-001: substantive triggerをqualified findingへ束縛する", () => {
    const result = qualifyUniversalImprovementFindings(normalized(), [evidence()], NOW);
    expect(result.ok).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      disposition: "qualified",
      baseline_revision: "baseline-1",
    });
  });

  it("U-UILFQ-002: 入力順とretry重複に依存せず一件へdedupeする", () => {
    const first = evidence();
    const one = qualifyUniversalImprovementFindings(normalized(), [first], NOW);
    const many = qualifyUniversalImprovementFindings(normalized(), [first, first, first], NOW);
    expect(many).toEqual(one);
  });

  it("U-UILFQ-003: scheduled safety-net単独をqualifiedへ昇格しない", () => {
    const result = qualifyUniversalImprovementFindings(
      normalized(),
      [evidence({ trigger_kind: "scheduled_safety_net" })],
      NOW,
    );
    expect(result.findings[0]?.disposition).toBe("rejected");
  });

  it("U-UILFQ-004: unknown event、wrong baseline、event digest driftを拒否する", () => {
    const bad = [
      evidence({ event_ids: [`uil-event-${"0".repeat(64)}`] }),
      evidence({ baseline_revision: "other" }),
      evidence({ event_digests: [sha256Digest("wrong")] }),
    ];
    for (const item of bad)
      expect(qualifyUniversalImprovementFindings(normalized(), [item], NOW).ok).toBe(false);
  });

  it("U-UILFQ-005: lifecycle dispositionを混同しない", () => {
    const cases = [
      [evidence({ trigger_verdict: "not_triggered" }), "rejected"],
      [evidence({ expires_at: "2026-08-30T11:30:00.000Z" }), "expired"],
      [evidence({ superseded_by: "uil-finding-successor" }), "superseded"],
      [
        evidence({ counterevidence_digests: [sha256Digest("counter")] }),
        "counterevidence_required",
      ],
    ] as const;
    for (const [item, disposition] of cases) {
      expect(
        qualifyUniversalImprovementFindings(normalized(), [item], NOW).findings[0]?.disposition,
      ).toBe(disposition);
    }
  });

  it("U-UILFQ-006: 同一identityのdetector／verdict矛盾をfail-closeする", () => {
    const conflicting = { ...evidence(), evidence_id: "other", trigger_verdict: "not_triggered" };
    expect(
      qualifyUniversalImprovementFindings(normalized(), [evidence(), conflicting], NOW).ok,
    ).toBe(false);
  });

  it("U-UILFQ-007: 欠落invariant、未来時刻、無効expiry、構造破壊をfail-closeする", () => {
    const invalid = [
      evidence({ invariant_id: "" }),
      evidence({ observed_at: "2026-08-31T00:00:00.000Z" }),
      evidence({ expires_at: "2026-08-30T10:00:00.000Z" }),
      null,
    ];
    for (const item of invalid)
      expect(qualifyUniversalImprovementFindings(normalized(), [item], NOW).ok).toBe(false);
  });
});
