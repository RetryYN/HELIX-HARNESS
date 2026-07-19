import { describe, expect, it } from "vitest";
import {
  classifyFinalRecognitionDisposition,
  classifyRecognitionAuditDisposition,
  classifyRecognitionCandidate,
  classifyRecognitionReviewStatus,
  detectL12HybridRecognitionSignals,
  scanL12HybridRecognitionCandidates,
} from "../src/lint/l12-hybrid-recognition";
import { REVIEWED_SAFE_DISPOSITIONS } from "../src/lint/l12-hybrid-reviewed-safe-v2";

describe("L12/hybrid recognition-risk scanner", () => {
  it.each([
    ["L1 requirement -> operational evidence at L14", "legacy_pair_l1_l14"],
    ["L2 mock is verified later at L10", "legacy_pair_l2_l10"],
    ["L3 proposal table maps acceptance into L12", "legacy_pair_l3_l12"],
    ["post-deploy closes at G13 and operations at G14", "removed_gate_g13_g14"],
    ["the TypeScript core runs on Bun", "bun_runtime"],
    ["only a proposal-only Python worker is allowed", "python_proposal_only"],
    ["the permanent Python runtime owns semantic evaluation", "python_worker_boundary"],
  ])("detects independently seeded wording: %s", (body, expected) => {
    expect(detectL12HybridRecognitionSignals(body).map((signal) => signal.id)).toContain(expected);
  });

  it("finds the cross-review seed documents missed by the narrow inventory regex", () => {
    const candidates = new Map(
      scanL12HybridRecognitionCandidates().map((candidate) => [candidate.path, candidate.signals]),
    );
    for (const path of [
      "docs/adr/ADR-001-helix-harness-redesign-and-language.md",
      "docs/design/helix/L10-ux/ux-evidence-boundary.md",
      "docs/skills/context-engineering.md",
      "docs/test-design/helix/L3-retention-purge-acceptance-test-design.md",
      "docs/research/worker-runtime-security-requirements-instruction-2026-07-19.md",
    ]) {
      expect(candidates.has(path), path).toBe(true);
    }
  });

  it("routes every candidate into an explicit review disposition", () => {
    expect(classifyRecognitionCandidate("docs/process/gates.md")).toBe("current_authority_review");
    expect(classifyRecognitionCandidate("docs/plans/PLAN-L14-00.md")).toBe("plan_review");
    expect(classifyRecognitionCandidate("docs/research/runtime.md")).toBe(
      "historical_context_review",
    );
    expect(classifyRecognitionCandidate("package.json")).toBe("executable_surface_review");
    expect(classifyRecognitionCandidate("docs/design/vmodel-canonical-authority-cutover.md")).toBe(
      "compatibility_authority_review",
    );
  });

  it("extracts a status for every PLAN candidate", () => {
    const plans = scanL12HybridRecognitionCandidates().filter(
      (candidate) => candidate.disposition === "plan_review",
    );
    expect(plans).toHaveLength(571);
    expect(
      plans.every(
        (candidate) => candidate.documentStatus && candidate.documentStatus !== "missing",
      ),
    ).toBe(true);
  });

  it("separates explicitly labeled compatibility context from unresolved wording", () => {
    const labeled = detectL12HybridRecognitionSignals("legacy compatibility pair L1 -> L14");
    const unresolved = detectL12HybridRecognitionSignals("current required pair L1 -> L14");
    expect(classifyRecognitionReviewStatus("current_authority_review", labeled)).toBe(
      "context_labeled",
    );
    expect(classifyRecognitionReviewStatus("current_authority_review", unresolved)).toBe(
      "unresolved",
    );
    expect(classifyRecognitionReviewStatus("historical_context_review", unresolved)).toBe(
      "unresolved",
    );
  });

  it("never upgrades path/status heuristics into a final semantic disposition", () => {
    expect(classifyRecognitionAuditDisposition("plan_review")).toBe("needs_manual_review");
    expect(classifyRecognitionAuditDisposition("historical_context_review")).toBe(
      "needs_manual_review",
    );
    expect(classifyRecognitionAuditDisposition("compatibility_authority_review")).toBe(
      "compatibility_labeled",
    );
    const candidates = scanL12HybridRecognitionCandidates();
    expect(new Set(candidates.map((candidate) => candidate.path)).size).toBe(candidates.length);
    expect(
      candidates.filter((candidate) => candidate.auditDisposition === "needs_manual_review"),
    ).toHaveLength(469);
    expect(
      candidates.filter(
        (candidate) => candidate.auditDisposition === "false_positive_execution_command",
      ),
    ).toHaveLength(353);
  });

  it("treats only Bun-only PLAN command evidence as a false positive", () => {
    const commandSignals = detectL12HybridRecognitionSignals("green command: bun test");
    const targetSignals = detectL12HybridRecognitionSignals("target runtime is Bun core");
    expect(classifyRecognitionAuditDisposition("plan_review", commandSignals)).toBe(
      "false_positive_execution_command",
    );
    expect(classifyRecognitionAuditDisposition("plan_review", targetSignals)).toBe(
      "needs_manual_review",
    );
  });

  it("assigns exactly one reviewed final disposition to all 828 candidates", () => {
    const candidates = scanL12HybridRecognitionCandidates();
    const counts = candidates.reduce<Record<string, number>>((acc, candidate) => {
      const finalDisposition = classifyFinalRecognitionDisposition(candidate);
      acc[finalDisposition] = (acc[finalDisposition] ?? 0) + 1;
      return acc;
    }, {});
    expect(candidates).toHaveLength(828);
    expect(counts).toEqual({
      conflict: 346,
      compatibility_labeled: 22,
      false_positive: 444,
      historical: 16,
    });
  });

  it("fails closed for unknown Bun authority and changed reviewed content", () => {
    const [seed] = scanL12HybridRecognitionCandidates();
    expect(seed).toBeDefined();
    expect(
      classifyFinalRecognitionDisposition({
        ...seed!,
        path: "docs/plans/PLAN-NEW-bun-target.md",
        disposition: "plan_review",
        auditDisposition: "needs_manual_review",
        signals: detectL12HybridRecognitionSignals("target runtime is Bun core"),
      }),
    ).toBe("conflict");
    expect(
      classifyFinalRecognitionDisposition({
        ...seed!,
        path: "docs/plans/PLAN-NEW-mixed-bun-target.md",
        disposition: "plan_review",
        auditDisposition: "false_positive_execution_command",
        signals: detectL12HybridRecognitionSignals("target runtime is Bun core\nnpm test"),
      }),
    ).toBe("conflict");

    const reviewed = REVIEWED_SAFE_DISPOSITIONS[0];
    const reviewedCandidate = scanL12HybridRecognitionCandidates().find(
      (candidate) => candidate.path === reviewed.path,
    );
    expect(reviewedCandidate).toBeDefined();
    expect(
      classifyFinalRecognitionDisposition({
        ...reviewedCandidate!,
        contentDigest: "changed-content",
      }),
    ).toBe("needs_manual_review");
  });

  it("pins every reviewed-safe path and the routing-by-final cross table", () => {
    const candidates = scanL12HybridRecognitionCandidates();
    const candidatePaths = new Set(candidates.map((candidate) => candidate.path));
    const reviewedPaths = REVIEWED_SAFE_DISPOSITIONS.map((entry) => entry.path);
    expect(REVIEWED_SAFE_DISPOSITIONS).toHaveLength(482);
    expect(new Set(reviewedPaths).size).toBe(reviewedPaths.length);
    expect(reviewedPaths.every((path) => candidatePaths.has(path))).toBe(true);

    const cross = candidates.reduce<Record<string, Record<string, number>>>((acc, candidate) => {
      const finalDisposition = classifyFinalRecognitionDisposition(candidate);
      acc[candidate.disposition] ??= {};
      const row = acc[candidate.disposition];
      row[finalDisposition] = (row[finalDisposition] ?? 0) + 1;
      return acc;
    }, {});
    expect(cross).toEqual({
      current_authority_review: {
        compatibility_labeled: 15,
        conflict: 159,
        false_positive: 33,
        historical: 6,
      },
      executable_surface_review: { conflict: 7, historical: 1 },
      historical_context_review: {
        compatibility_labeled: 1,
        conflict: 19,
        false_positive: 1,
        historical: 9,
      },
      compatibility_authority_review: { compatibility_labeled: 6 },
      plan_review: { conflict: 161, false_positive: 410 },
    });
  });
});
