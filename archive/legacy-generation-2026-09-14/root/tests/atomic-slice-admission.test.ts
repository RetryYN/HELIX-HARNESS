import { describe, expect, it } from "vitest";
import {
  type AtomicSliceSnapshot,
  canonicalizeAtomicSliceSnapshot,
  evaluateAtomicSlice,
  type ScopeExpansionReceipt,
  selectAtomicSliceDesignCandidate,
} from "../src/runtime/atomic-slice-admission";

// PLAN-L7-494-atomic-slice-admission execution evidence.

const digest = (value: string): `sha256:${string}` => `sha256:${value.repeat(64).slice(0, 64)}`;

function snapshot(overrides: Partial<AtomicSliceSnapshot> = {}): AtomicSliceSnapshot {
  return {
    issueId: 339,
    baseHead: "a".repeat(40),
    candidateHead: "b".repeat(40),
    manifestDigest: digest("1"),
    behaviorContractIds: ["GH-AC-035"],
    responsibilityOwners: ["atomic-slice-admission"],
    modelOwnerIds: ["atomic-slice"],
    expectedPaths: [
      "src/runtime/atomic-slice-admission.ts",
      "tests/atomic-slice-admission.test.ts",
    ],
    actualPaths: ["tests/atomic-slice-admission.test.ts", "src/runtime/atomic-slice-admission.ts"],
    requiredCompanionPaths: ["tests/atomic-slice-admission.test.ts"],
    actualCompanionPaths: ["tests/atomic-slice-admission.test.ts"],
    modelingDecision: "value_object",
    noCodeDecision: {
      selected: "modify",
      evaluatedInOrder: ["no_change", "delete", "configure", "reuse", "modify"],
      rejectedOptionEvidenceDigests: [digest("2"), digest("3"), digest("4"), digest("5")],
    },
    blockerClassifications: [],
    ...overrides,
  };
}

describe("Atomic Slice Admission pure contract", () => {
  it("U-ATOMIC-001: exactly-one contract／owner／model ownerを受理する", () => {
    const decision = evaluateAtomicSlice(snapshot(), null);
    expect(decision.disposition).toBe("admitted");
    expect(decision.behaviorContractId).toBe("GH-AC-035");
    expect(decision.responsibilityOwner).toBe("atomic-slice-admission");
    expect(decision.failureCodes).toEqual([]);
    for (const empty of [
      snapshot({ behaviorContractIds: [] }),
      snapshot({ responsibilityOwners: [] }),
      snapshot({ modelOwnerIds: [] }),
    ]) {
      expect(evaluateAtomicSlice(empty, null).disposition).toBe("recovery_required");
    }
  });

  it("U-ATOMIC-002: pathをPOSIX bytewise順へ正規化し危険pathと重複を拒否する", () => {
    const canonical = canonicalizeAtomicSliceSnapshot(snapshot());
    expect(canonical.ok).toBe(true);
    if (canonical.ok) {
      expect(canonical.value.actualPaths).toEqual([
        "src/runtime/atomic-slice-admission.ts",
        "tests/atomic-slice-admission.test.ts",
      ]);
    }
    for (const path of [
      "/etc/passwd",
      "../secret",
      "src/./escape.ts",
      "src\\escape.ts",
      "src/\0bad.ts",
      "src/",
    ]) {
      expect(
        canonicalizeAtomicSliceSnapshot(snapshot({ actualPaths: [path] })),
        `path=${JSON.stringify(path)}`,
      ).toMatchObject({ ok: false, failureCodes: ["invalid_intent"] });
    }
    expect(
      canonicalizeAtomicSliceSnapshot(snapshot({ actualPaths: ["src/a.ts", "src/a.ts"] })),
    ).toMatchObject({ ok: false, failureCodes: ["invalid_intent"] });
  });

  it("U-ATOMIC-003: expected／actual pathの欠落と余剰を双方向で判定する", () => {
    const missing = evaluateAtomicSlice(
      snapshot({ actualPaths: ["src/runtime/atomic-slice-admission.ts"] }),
      null,
    );
    expect(missing.disposition).toBe("recovery_required");
    expect(missing.failureCodes).toContain("path_set_mismatch");
    const extra = evaluateAtomicSlice(
      snapshot({ actualPaths: [...snapshot().actualPaths, "docs/extra.md"] }),
      null,
    );
    expect(extra.failureCodes).toContain("scope_expansion_unauthorized");
  });

  it("U-ATOMIC-004: companion exact setを別contractやsubsetで相殺しない", () => {
    const decision = evaluateAtomicSlice(snapshot({ actualCompanionPaths: [] }), null);
    expect(decision.disposition).toBe("recovery_required");
    expect(decision.failureCodes).toContain("companion_mismatch");
  });

  it("U-ATOMIC-005: 独立runtime・同一HEAD・manifest・exact deltaのexpansionだけを許可する", () => {
    const expanded = snapshot({ actualPaths: [...snapshot().actualPaths, "docs/extra.md"] });
    const receipt: ScopeExpansionReceipt = {
      originalManifestDigest: expanded.manifestDigest,
      candidateHead: expanded.candidateHead,
      reviewerRuntime: "claude",
      authorRuntime: "codex",
      reasonCode: "generated digest companion follows the source change",
      addedPaths: ["docs/extra.md"],
      receiptDigest: digest("9"),
    };
    expect(evaluateAtomicSlice(expanded, receipt).disposition).toBe("admitted");
    for (const invalid of [
      { ...receipt, reviewerRuntime: "codex" },
      { ...receipt, candidateHead: "c".repeat(40) },
      { ...receipt, originalManifestDigest: digest("8") },
      { ...receipt, addedPaths: ["docs/other.md"] },
    ]) {
      expect(evaluateAtomicSlice(expanded, invalid).failureCodes).toContain(
        "scope_expansion_unauthorized",
      );
    }
  });

  it("U-ATOMIC-006: 複数behavior／responsibilityはexpansion receiptがあってもsplitする", () => {
    const multi = snapshot({
      behaviorContractIds: ["GH-AC-035", "GH-AC-041"],
      responsibilityOwners: ["atomic-slice-admission", "delivery-route-selection"],
    });
    const decision = evaluateAtomicSlice(multi, null);
    expect(decision.disposition).toBe("split_required");
    expect(decision.failureCodes).toEqual(
      expect.arrayContaining(["multiple_behaviors", "multiple_responsibilities"]),
    );
  });

  it("U-ATOMIC-007: recovery failureをsplitやadmittedで相殺せず全件返す", () => {
    const decision = evaluateAtomicSlice(
      snapshot({
        behaviorContractIds: ["GH-AC-035", "GH-AC-041"],
        actualCompanionPaths: [],
      }),
      null,
    );
    expect(decision.disposition).toBe("recovery_required");
    expect(decision.failureCodes).toEqual(
      expect.arrayContaining(["multiple_behaviors", "companion_mismatch"]),
    );
  });

  it("U-ATOMIC-008: 入力順に依存せず同じdecision digestを返す", () => {
    const a = evaluateAtomicSlice(snapshot(), null);
    const b = evaluateAtomicSlice(
      snapshot({
        actualPaths: [...snapshot().actualPaths].reverse(),
        expectedPaths: [...snapshot().expectedPaths].reverse(),
      }),
      null,
    );
    expect(a.decisionDigest).toBe(b.decisionDigest);
  });

  it("U-ATOMIC-009: add_codeは先行5候補のexact順評価と不採用証拠を要求する", () => {
    const valid = snapshot({
      noCodeDecision: {
        selected: "add_code",
        evaluatedInOrder: ["no_change", "delete", "configure", "reuse", "modify", "add_code"],
        rejectedOptionEvidenceDigests: [
          digest("1"),
          digest("2"),
          digest("3"),
          digest("4"),
          digest("5"),
        ],
      },
    });
    expect(evaluateAtomicSlice(valid, null).failureCodes).not.toContain("no_code_order_violation");
    const invalid = snapshot({
      noCodeDecision: {
        selected: "add_code",
        evaluatedInOrder: ["add_code"],
        rejectedOptionEvidenceDigests: [],
      },
    });
    expect(evaluateAtomicSlice(invalid, null).failureCodes).toContain("no_code_order_violation");
  });

  it("U-ATOMIC-010: security等をsuccessor improvementへ送るとcurrent blocker違反にする", () => {
    const decision = evaluateAtomicSlice(
      snapshot({
        blockerClassifications: [{ concern: "security", disposition: "successor_improvement" }],
      }),
      null,
    );
    expect(decision.disposition).toBe("recovery_required");
    expect(decision.failureCodes).toContain("current_blocker_deferred");
  });

  it("U-ATOMIC-011: ST-ATOMIC-011のoracle・p95同等なら4観測量の小さい設計を選ぶ", () => {
    expect(
      selectAtomicSliceDesignCandidate([
        {
          id: "reuse",
          oraclePassRate: 1,
          candidateAdmissionP95Ms: 80_000,
          newComponentCount: 0,
          newStateCount: 0,
          newPersistenceSurfaceCount: 0,
          productionLocDelta: 140,
        },
        {
          id: "new-detector",
          oraclePassRate: 1,
          candidateAdmissionP95Ms: 80_000,
          newComponentCount: 1,
          newStateCount: 1,
          newPersistenceSurfaceCount: 1,
          productionLocDelta: 300,
        },
      ]),
    ).toMatchObject({ ok: true, selectedId: "reuse" });
    expect(
      selectAtomicSliceDesignCandidate([
        {
          id: "fast-but-untested",
          oraclePassRate: 0.99,
          candidateAdmissionP95Ms: 1,
          newComponentCount: 0,
          newStateCount: 0,
          newPersistenceSurfaceCount: 0,
          productionLocDelta: 1,
        },
      ]),
    ).toMatchObject({ ok: false, failureCode: "design_candidate_unqualified" });
    expect(
      selectAtomicSliceDesignCandidate([
        {
          id: "small-but-slow",
          oraclePassRate: 1,
          candidateAdmissionP95Ms: 90_000,
          newComponentCount: 0,
          newStateCount: 0,
          newPersistenceSurfaceCount: 0,
          productionLocDelta: 10,
        },
        {
          id: "baseline",
          oraclePassRate: 1,
          candidateAdmissionP95Ms: 80_000,
          newComponentCount: 1,
          newStateCount: 0,
          newPersistenceSurfaceCount: 0,
          productionLocDelta: 20,
        },
      ]),
    ).toMatchObject({ ok: true, selectedId: "baseline" });
  });

  it("U-ATOMIC-012: lifecycle／invariant 0のpure_function／noneを形式aggregateなしで受理する", () => {
    for (const modelingDecision of ["pure_function", "none"] as const) {
      expect(evaluateAtomicSlice(snapshot({ modelingDecision }), null).disposition).toBe(
        "admitted",
      );
    }
  });

  it("U-ATOMIC-013: receiptのHEADまたはmanifest driftをstaleとして再評価する", () => {
    const expanded = snapshot({ actualPaths: [...snapshot().actualPaths, "docs/extra.md"] });
    const stale: ScopeExpansionReceipt = {
      originalManifestDigest: digest("8"),
      candidateHead: "c".repeat(40),
      reviewerRuntime: "claude",
      authorRuntime: "codex",
      reasonCode: "old snapshot must never be reused for this candidate",
      addedPaths: ["docs/extra.md"],
      receiptDigest: digest("9"),
    };
    const decision = evaluateAtomicSlice(expanded, stale);
    expect(decision.failureCodes).toEqual(
      expect.arrayContaining(["stale_snapshot", "scope_expansion_unauthorized"]),
    );
  });
});
