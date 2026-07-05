import { describe, expect, it } from "vitest";
import { validatePrReviewRoute } from "../src/audit/pr-review-route";

describe("PR review route", () => {
  it("U-PRROUTE-001: passes cross-agent review when worker and reviewer models differ and evidence is durable", () => {
    const result = validatePrReviewRoute({
      workerId: "codex-worker",
      workerRuntime: "codex",
      workerModel: "gpt-5-codex",
      reviewEvidence: [
        {
          kind: "cross_agent",
          reviewerId: "claude-reviewer",
          reviewerRuntime: "claude",
          reviewerModel: "claude-sonnet",
          evidencePath: ".helix/evidence/review/PLAN-L7-340.md",
          greenCommand: "bun test tests/pr-review-route.test.ts",
        },
      ],
    });

    expect(result).toMatchObject({
      ok: true,
      reviewKind: "cross_agent",
      crossModel: true,
      crossRuntime: true,
      evidencePath: ".helix/evidence/review/PLAN-L7-340.md",
    });
    expect(result.findings).toEqual([]);
  });

  it("U-PRROUTE-002: rejects missing evidence and same-model self review", () => {
    const missing = validatePrReviewRoute({
      workerId: "codex-worker",
      workerRuntime: "codex",
      workerModel: "gpt-5-codex",
      reviewEvidence: [],
    });
    expect(missing.ok).toBe(false);
    expect(missing.findings).toContainEqual(
      expect.objectContaining({ code: "review_evidence_missing" }),
    );

    const sameModel = validatePrReviewRoute({
      workerId: "codex-worker",
      workerRuntime: "codex",
      workerModel: "gpt-5-codex",
      reviewEvidence: [
        {
          kind: "cross_agent",
          reviewerId: "codex-worker",
          reviewerRuntime: "codex",
          reviewerModel: "gpt-5-codex",
          evidencePath: "",
        },
      ],
    });
    expect(sameModel.ok).toBe(false);
    expect(sameModel.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "worker_reviewer_same_identity",
        "worker_reviewer_same_model",
        "review_evidence_path_missing",
        "green_command_missing",
      ]),
    );
  });

  it("U-PRROUTE-003: allows intra-runtime fallback only when explicitly recorded", () => {
    const blocked = validatePrReviewRoute({
      workerId: "codex-worker",
      workerRuntime: "codex",
      workerModel: "gpt-5-codex",
      reviewEvidence: [
        {
          kind: "intra_runtime_subagent",
          reviewerId: "codex-reviewer",
          reviewerRuntime: "codex",
          reviewerModel: "gpt-5-review",
          evidencePath: ".helix/evidence/review/intra-runtime.md",
          greenCommand: "bun test tests/pr-review-route.test.ts",
        },
      ],
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.findings).toContainEqual(
      expect.objectContaining({ code: "intra_runtime_fallback_not_allowed" }),
    );

    const allowed = validatePrReviewRoute({
      workerId: "codex-worker",
      workerRuntime: "codex",
      workerModel: "gpt-5-codex",
      allowIntraRuntimeFallback: true,
      reviewEvidence: [
        {
          kind: "intra_runtime_subagent",
          reviewerId: "codex-reviewer",
          reviewerRuntime: "codex",
          reviewerModel: "gpt-5-review",
          evidencePath: ".helix/evidence/review/intra-runtime.md",
          greenCommand: "bun test tests/pr-review-route.test.ts",
        },
      ],
    });
    expect(allowed.ok).toBe(true);
    expect(allowed.crossModel).toBe(true);
    expect(allowed.crossRuntime).toBe(false);
  });
});
