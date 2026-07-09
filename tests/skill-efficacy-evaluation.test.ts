import { describe, expect, it } from "vitest";
import { buildSkillEfficacyEvaluationReport } from "../src/runtime/skill-efficacy-evaluation";

describe("skill efficacy evaluation", () => {
  it("allows promotion only with reproducible with/without skill evidence", () => {
    const report = buildSkillEfficacyEvaluationReport([
      {
        skill_id: "skill:test",
        eval_id: "eval:1",
        with_skill: {
          artifact_path: "tests/fixtures/with.md",
          command_digest: "sha256:0123456789abcdef",
          reproducible: true,
          grade: 0.9,
        },
        without_skill: {
          artifact_path: "tests/fixtures/without.md",
          command_digest: "sha256:fedcba9876543210",
          reproducible: true,
          grade: 0.4,
        },
      },
    ]);

    expect(report.ok).toBe(true);
    expect(report.promotion_allowed_count).toBe(1);
    expect(report.evaluations[0]).toMatchObject({
      promotion_allowed: true,
      grade_delta: 0.5,
      evidence_complete: true,
    });
    expect(report.evaluations[0].grading).toEqual([
      expect.objectContaining({ artifact_path: "tests/fixtures/with.md" }),
      expect.objectContaining({ command_digest: "sha256:fedcba9876543210" }),
    ]);
  });

  it("blocks promotion without reproducible evidence and marks regressions for quarantine", () => {
    const report = buildSkillEfficacyEvaluationReport([
      {
        skill_id: "skill:regressed",
        eval_id: "eval:2",
        regression: true,
        with_skill: {
          artifact_path: "tests/fixtures/with.md",
          command_digest: "sha256:0123456789abcdef",
          reproducible: false,
          grade: 0.1,
        },
      },
    ]);

    expect(report.ok).toBe(false);
    expect(report.quarantine_candidates).toEqual(["skill:regressed"]);
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "skill_promotion_requires_reproducible_eval",
        "skill_regression_quarantine_candidate",
      ]),
    );
  });
});
