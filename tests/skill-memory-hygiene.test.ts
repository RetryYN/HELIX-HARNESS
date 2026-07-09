import { describe, expect, it } from "vitest";
import { buildSkillMemoryHygieneReport } from "../src/runtime/skill-memory-hygiene";

describe("skill memory hygiene", () => {
  it("emits reversible quarantine plans instead of deleting unused skills", () => {
    const report = buildSkillMemoryHygieneReport([
      {
        plan_id: "PLAN-L7-369",
        skill_id: "skill:unused",
        recommendations: 2,
        invocations: 0,
        accepted: 0,
      },
      {
        plan_id: "PLAN-L7-369",
        skill_id: "skill:needs-eval",
        recommendations: 1,
        invocations: 1,
        accepted: 0,
      },
    ]);

    expect(report.ok).toBe(true);
    expect(report.dry_run).toBe(true);
    expect(report.quarantine_plan).toEqual([
      expect.objectContaining({
        skill_id: "skill:unused",
        action: "quarantine",
        delete: false,
        rollback_path: "docs/skills/skill:unused.md",
      }),
    ]);
    expect(report.improvement_candidates).toEqual([
      expect.objectContaining({
        skill_id: "skill:needs-eval",
        allowed: false,
        required_evidence: expect.arrayContaining(["before_skill_evaluation"]),
      }),
    ]);
    expect(report.memory_retention).toMatchObject({
      provenance_preserved: true,
      correction_chain_preserved: true,
    });
  });
});
