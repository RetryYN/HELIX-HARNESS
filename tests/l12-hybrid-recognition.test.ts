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

// PLAN-REVERSE-567-current-runtime-guidance / PLAN-REVERSE-568-issue-template-label-typed-authority — broad scanner count projection after current guidance updates.

// PLAN-L7-578-github-execution-episode-right-arm-evidence — U-GHEPRE-007

// PLAN-L7-506-worker-lifecycle-receipt

// PLAN-L7-489-requirement-generated-view-projection
// Current workflow fields are covered by AUTH-SURFACE-DESIGN-001; this scanner only owns legacy-risk signals.
describe("L12/hybrid recognition-risk scanner", () => {
  it("U-GHWF-001: typed GitHub requirementsのlegacy拒否記述をdigest付きfalse positiveへ固定する", () => {
    const path = "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md";
    const candidate = scanL12HybridRecognitionCandidates().find((entry) => entry.path === path);
    expect(candidate).toBeDefined();
    if (!candidate) throw new Error(`GitHub requirements recognition candidate missing: ${path}`);
    expect(candidate.contentDigest).toBe(
      "b387f8a4ffd324d2abd210439bc791611d4e6c8aa2498fe5facccc48fc7f552f",
    );
    expect(classifyFinalRecognitionDisposition(candidate)).toBe("false_positive");
  });

  it("U-GHEPRE-007: G13拒否記述をdigest付きfalse positiveへ固定する", () => {
    const terminalPlanPath =
      "docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md";
    for (const path of [
      terminalPlanPath,
      "docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md",
    ]) {
      const candidate = scanL12HybridRecognitionCandidates().find((entry) => entry.path === path);
      expect(candidate).toBeDefined();
      if (!candidate) throw new Error(`right-arm recognition candidate missing: ${path}`);
      expect(classifyFinalRecognitionDisposition(candidate)).toBe("false_positive");
    }
    const terminalPlan = scanL12HybridRecognitionCandidates().find(
      (entry) => entry.path === terminalPlanPath,
    );
    expect(terminalPlan?.contentDigest).toBe(
      "0280bec05652626b4e72b5301a6c7fd555a6b2a5ee0f8bbfbbfa18ab6eb906ee",
    );
  });

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

  it("U-RGV-009: finds review seeds while excluding generated non-authority views", () => {
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
    expect(candidates.has("docs/generated/requirements/requirement-definition.generated.md")).toBe(
      false,
    );
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
    expect(plans).toHaveLength(602);
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
    ).toHaveLength(519);
    expect(
      candidates.filter(
        (candidate) => candidate.auditDisposition === "false_positive_execution_command",
      ),
    ).toHaveLength(352);
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

  it("assigns exactly one reviewed final disposition to all 877 candidates", () => {
    const candidates = scanL12HybridRecognitionCandidates();
    const counts = candidates.reduce<Record<string, number>>((acc, candidate) => {
      const finalDisposition = classifyFinalRecognitionDisposition(candidate);
      acc[finalDisposition] = (acc[finalDisposition] ?? 0) + 1;
      return acc;
    }, {});
    expect(candidates).toHaveLength(877);
    expect(counts).toEqual({
      conflict: 356,
      compatibility_labeled: 24,
      false_positive: 479,
      historical: 18,
    });
  });

  // adapter 3 面 (CLAUDE.md / AGENTS.md / .claude/CLAUDE.md) は rule-drift でも機械検査される
  // 正本であり、編集のたびに reviewed digest が無効化されて needs_manual_review へ落ちる。
  // 再 attest が実際に効いていることを固定する (PLAN-L7-509 / issue #376)。
  it.each(["CLAUDE.md", "AGENTS.md", ".claude/CLAUDE.md"])(
    "keeps the adapter rule doc %s on a live reviewed disposition",
    (path) => {
      const candidate = scanL12HybridRecognitionCandidates().find((entry) => entry.path === path);
      expect(candidate).toBeDefined();
      if (!candidate) throw new Error(`recognition candidate missing: ${path}`);
      const reviewed = REVIEWED_SAFE_DISPOSITIONS.find((entry) => entry.path === path);
      expect(reviewed).toBeDefined();
      expect(reviewed?.contentDigest).toBe(candidate.contentDigest);
      expect(classifyFinalRecognitionDisposition(candidate)).not.toBe("needs_manual_review");
    },
  );

  it("fails closed for unknown Bun authority and changed reviewed content", () => {
    const [seed] = scanL12HybridRecognitionCandidates();
    expect(seed).toBeDefined();
    if (!seed) throw new Error("recognition candidate seed missing");
    expect(
      classifyFinalRecognitionDisposition({
        ...seed,
        path: "docs/plans/PLAN-NEW-bun-target.md",
        disposition: "plan_review",
        auditDisposition: "needs_manual_review",
        signals: detectL12HybridRecognitionSignals("target runtime is Bun core"),
      }),
    ).toBe("conflict");
    expect(
      classifyFinalRecognitionDisposition({
        ...seed,
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
    if (!reviewedCandidate) throw new Error(`reviewed candidate missing: ${reviewed.path}`);
    expect(
      classifyFinalRecognitionDisposition({
        ...reviewedCandidate,
        contentDigest: "changed-content",
      }),
    ).toBe("needs_manual_review");
  });

  it("U-WLIFE-004: pins lifecycle authority and the routing-by-final cross table", () => {
    const candidates = scanL12HybridRecognitionCandidates();
    const candidatePaths = new Set(candidates.map((candidate) => candidate.path));
    const reviewedPaths = REVIEWED_SAFE_DISPOSITIONS.map((entry) => entry.path);
    expect(REVIEWED_SAFE_DISPOSITIONS).toHaveLength(521);
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
        compatibility_labeled: 17,
        conflict: 158,
        false_positive: 50,
        historical: 6,
      },
      executable_surface_review: { conflict: 6, historical: 1 },
      historical_context_review: {
        conflict: 19,
        false_positive: 1,
        historical: 11,
      },
      compatibility_authority_review: { compatibility_labeled: 6 },
      plan_review: {
        compatibility_labeled: 1,
        conflict: 173,
        false_positive: 428,
      },
    });
    const candidateByPath = new Map(candidates.map((candidate) => [candidate.path, candidate]));
    for (const path of [
      "docs/process/modes/scrum.md",
      "docs/plans/PLAN-REVERSE-561-scrum-discovery-typed-process.md",
    ]) {
      const candidate = candidateByPath.get(path);
      expect(candidate, path).toBeDefined();
      if (!candidate) {
        throw new Error(`Scrum / Discovery authority candidate missing: ${path}`);
      }
      expect(classifyFinalRecognitionDisposition(candidate), path).toBe("false_positive");
    }
    for (const path of [
      "docs/design/helix/L3-requirements/technology-stack-authority.md",
      "docs/plans/PLAN-L3-50-technology-stack-authority.md",
      "docs/test-design/helix/technology-stack-authority-acceptance.md",
    ]) {
      const candidate = candidateByPath.get(path);
      expect(candidate, path).toBeDefined();
      if (!candidate) {
        throw new Error(`technology authority candidate missing: ${path}`);
      }
      expect(classifyFinalRecognitionDisposition(candidate), path).toBe("false_positive");
    }
    expect(
      candidateByPath.get("docs/plans/PLAN-L3-50-technology-stack-authority.md")?.contentDigest,
    ).toBe("a1f530d6afcd7912a5487f5e3c6e433897b61bc51cc76b0f9df5fbe02375c66e");
  });
});
