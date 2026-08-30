import { describe, expect, it } from "vitest";
import { canonicalJson, type Sha256Digest, sha256Digest } from "../src/runtime/digest";
import {
  qualifyUniversalImprovementFindings,
  type UniversalImprovementFindingTriggerKind,
} from "../src/runtime/universal-improvement-finding-qualification";
import {
  normalizeUniversalImprovementObservations,
  type UniversalImprovementNormalizationInput,
  type UniversalImprovementNormalizationResult,
  type UniversalImprovementNormalizedEventV1,
} from "../src/runtime/universal-improvement-observation-normalizer";
import {
  loadUniversalImprovementSourceRegistry,
  type UniversalImprovementSourceObservation,
} from "../src/runtime/universal-improvement-source-registry";

// PLAN-L7-708-universal-improvement-finding-qualification
const NOW = new Date("2026-08-30T12:00:00.000Z");
const PRIOR_FINDING = `uil-finding-${"a".repeat(64)}`;
const TRIGGER_KINDS: readonly UniversalImprovementFindingTriggerKind[] = [
  "invariant_violation",
  "recurrence",
  "metric_budget_exceeded",
  "worsening_trend",
  "structural_drift",
  "release_boundary",
  "provider_change",
  "scheduled_safety_net",
];

function normalized(
  counterevidenceDigests: readonly Sha256Digest[] = [],
): UniversalImprovementNormalizationResult {
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
    counterevidence_digests: counterevidenceDigests,
  };
  return normalizeUniversalImprovementObservations([input], NOW);
}

function evidence(
  overrides: Record<string, unknown> = {},
  normalizedResult: UniversalImprovementNormalizationResult = normalized(),
) {
  const event = normalizedResult.events[0];
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
    recurrence_lineage: [],
    ...overrides,
  };
}

function resealEvents(
  events: readonly UniversalImprovementNormalizedEventV1[],
): UniversalImprovementNormalizationResult {
  return {
    ok: true,
    events,
    exact_set_digest: sha256Digest(canonicalJson(events)),
    errors: [],
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
      detector_id: "UIL-DET-001",
      source_evidence_ids: ["uil-trigger-evidence-1"],
      recurrence_lineage: [],
    });
  });

  it("U-UILFQ-002: 入力順とretry重複に依存せず一件へdedupeする", () => {
    const first = evidence();
    const second = evidence({ evidence_id: "uil-trigger-evidence-2" });
    const one = qualifyUniversalImprovementFindings(normalized(), [first], NOW);
    const retried = qualifyUniversalImprovementFindings(normalized(), [first, first, first], NOW);
    const forward = qualifyUniversalImprovementFindings(normalized(), [first, second], NOW);
    const reverse = qualifyUniversalImprovementFindings(normalized(), [second, first], NOW);
    expect(retried).toEqual(one);
    expect(forward).toEqual(reverse);
    expect(forward.findings).toHaveLength(1);
    expect(forward.findings[0]?.source_evidence_ids).toEqual([
      "uil-trigger-evidence-1",
      "uil-trigger-evidence-2",
    ]);
    expect(forward.findings[0]?.finding_id).not.toBe(one.findings[0]?.finding_id);
  });

  it("U-UILFQ-003: 8 trigger kindを分離しscheduled単独をqualifiedへ昇格しない", () => {
    const items = TRIGGER_KINDS.map((triggerKind, index) =>
      evidence({
        evidence_id: `uil-trigger-evidence-${index + 1}`,
        trigger_kind: triggerKind,
        recurrence_lineage: triggerKind === "recurrence" ? [PRIOR_FINDING] : [],
      }),
    );
    const result = qualifyUniversalImprovementFindings(normalized(), items, NOW);
    expect(result.ok).toBe(true);
    expect(result.findings).toHaveLength(8);
    expect(new Set(result.findings.map((finding) => finding.finding_id))).toHaveLength(8);
    for (const triggerKind of TRIGGER_KINDS) {
      const finding = result.findings.find((item) => item.trigger_kind === triggerKind);
      expect(finding?.disposition).toBe(
        triggerKind === "scheduled_safety_net" ? "rejected" : "qualified",
      );
    }
    const invariant = qualifyUniversalImprovementFindings(
      normalized(),
      [evidence({ trigger_kind: "invariant_violation" })],
      NOW,
    );
    const budget = qualifyUniversalImprovementFindings(
      normalized(),
      [evidence({ trigger_kind: "metric_budget_exceeded" })],
      NOW,
    );
    expect(invariant.findings[0]?.finding_id).not.toBe(budget.findings[0]?.finding_id);

    const recurrenceA = qualifyUniversalImprovementFindings(
      normalized(),
      [evidence({ trigger_kind: "recurrence", recurrence_lineage: [PRIOR_FINDING] })],
      NOW,
    );
    const recurrenceB = qualifyUniversalImprovementFindings(
      normalized(),
      [
        evidence({
          trigger_kind: "recurrence",
          recurrence_lineage: [`uil-finding-${"b".repeat(64)}`],
        }),
      ],
      NOW,
    );
    expect(recurrenceA.findings[0]?.finding_id).not.toBe(recurrenceB.findings[0]?.finding_id);
  });

  it("U-UILFQ-004: unknown event／detector、wrong baseline、event digest driftを個別拒否する", () => {
    const cases = [
      [evidence({ event_ids: [`uil-event-${"0".repeat(64)}`] }), "event_unresolved:"],
      [evidence({ detector_id: "UIL-DET-UNKNOWN" }), "detector_mismatch:"],
      [evidence({ baseline_revision: "other" }), "baseline_revision_mismatch:"],
      [evidence({ event_digests: [sha256Digest("wrong")] }), "event_digest_set_mismatch:"],
    ] as const;
    for (const [item, errorPrefix] of cases) {
      const result = qualifyUniversalImprovementFindings(normalized(), [item], NOW);
      expect(result.ok).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringMatching(new RegExp(`^${errorPrefix}`, "u"))]),
      );
    }
  });

  it("U-UILFQ-005: lifecycle dispositionとnormalized counterevidenceを混同しない", () => {
    const normalizedCounter = sha256Digest("normalized-counter");
    const withCounterevidence = normalized([normalizedCounter]);
    const cases = [
      [normalized(), evidence({ trigger_verdict: "not_triggered" }), "rejected"],
      [normalized(), evidence({ expires_at: "2026-08-30T11:30:00.000Z" }), "expired"],
      [normalized(), evidence({ superseded_by: "uil-finding-successor" }), "superseded"],
      [
        normalized(),
        evidence({ counterevidence_digests: [sha256Digest("trigger-counter")] }),
        "counterevidence_required",
      ],
      [withCounterevidence, evidence({}, withCounterevidence), "counterevidence_required"],
    ] as const;
    for (const [normalizedResult, item, expectedDisposition] of cases) {
      const result = qualifyUniversalImprovementFindings(normalizedResult, [item], NOW);
      expect(result.findings[0]?.disposition).toBe(expectedDisposition);
    }
    const retained = qualifyUniversalImprovementFindings(
      withCounterevidence,
      [evidence({}, withCounterevidence)],
      NOW,
    );
    expect(retained.findings[0]?.counterevidence_digests).toContain(normalizedCounter);
  });

  it("U-UILFQ-006: detector／verdict／supersession矛盾を個別にfail-closeする", () => {
    const cases = [
      [
        evidence({ evidence_id: "uil-trigger-evidence-2", detector_id: "UIL-DET-OTHER" }),
        "detector_id",
      ],
      [
        evidence({ evidence_id: "uil-trigger-evidence-2", trigger_verdict: "not_triggered" }),
        "trigger_verdict",
      ],
      [
        evidence({ evidence_id: "uil-trigger-evidence-2", superseded_by: "successor" }),
        "superseded_by",
      ],
    ] as const;
    for (const [conflicting, field] of cases) {
      const result = qualifyUniversalImprovementFindings(
        normalized(),
        [evidence(), conflicting],
        NOW,
      );
      expect(result.ok).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringMatching(new RegExp(`:${field}$`, "u"))]),
      );
    }
  });

  it("U-UILFQ-007: normalized exact boundary、lineage、時刻、unknown fieldをfail-closeする", () => {
    const invalidEvidence = [
      evidence({ invariant_id: "" }),
      evidence({ observed_at: "2026-08-31T00:00:00.000Z" }),
      evidence({ expires_at: "2026-08-30T10:00:00.000Z" }),
      evidence({ trigger_kind: "recurrence", recurrence_lineage: [] }),
      evidence({ unexpected_authority_write: true }),
      null,
    ];
    for (const item of invalidEvidence)
      expect(qualifyUniversalImprovementFindings(normalized(), [item], NOW).ok).toBe(false);

    const valid = normalized();
    const event = valid.events[0];
    if (!event) throw new Error("normalized event missing");
    const payloadMutated = {
      ...event,
      observed: { ...event.observed, payload_digest: sha256Digest("mutated") },
    };
    const duplicate = resealEvents([event, event]);
    const { event_digest: _eventDigest, ...withoutDigest } = event;
    const withUnknownWithoutDigest = { ...withoutDigest, unexpected_field: true };
    const withUnknown = {
      ...withUnknownWithoutDigest,
      event_digest: sha256Digest(canonicalJson(withUnknownWithoutDigest)),
    } as unknown as UniversalImprovementNormalizedEventV1;
    const withNestedUnknownWithoutDigest = {
      ...withoutDigest,
      observed: { ...event.observed, unexpected_field: true },
    };
    const withNestedUnknown = {
      ...withNestedUnknownWithoutDigest,
      event_digest: sha256Digest(canonicalJson(withNestedUnknownWithoutDigest)),
    } as unknown as UniversalImprovementNormalizedEventV1;
    const duplicatedCounterevidenceWithoutDigest = {
      ...withoutDigest,
      counterevidence_digests: [sha256Digest("duplicate"), sha256Digest("duplicate")],
    };
    const duplicatedCounterevidence = {
      ...duplicatedCounterevidenceWithoutDigest,
      event_digest: sha256Digest(canonicalJson(duplicatedCounterevidenceWithoutDigest)),
    } as UniversalImprovementNormalizedEventV1;
    const outerUnknown = {
      ...valid,
      unexpected_field: true,
    } as unknown as UniversalImprovementNormalizationResult;
    for (const forged of [
      resealEvents([payloadMutated]),
      duplicate,
      resealEvents([withUnknown]),
      resealEvents([withNestedUnknown]),
      resealEvents([duplicatedCounterevidence]),
      outerUnknown,
    ]) {
      expect(qualifyUniversalImprovementFindings(forged, [evidence()], NOW).ok).toBe(false);
    }

    const duplicateLineage = evidence({
      trigger_kind: "recurrence",
      recurrence_lineage: [PRIOR_FINDING, PRIOR_FINDING],
    });
    expect(qualifyUniversalImprovementFindings(valid, [duplicateLineage], NOW).ok).toBe(false);
  });
});
