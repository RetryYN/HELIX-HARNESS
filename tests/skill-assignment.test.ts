import { describe, expect, it } from "vitest";
import {
  analyzeSkillAssignments,
  loadSkillAssignmentDocs,
  type SkillAssignmentDoc,
} from "../src/lint/skill-assignment";

const doc = (metadata: Record<string, unknown>): SkillAssignmentDoc => ({
  path: "docs/skills/example.yaml",
  metadata,
});

describe("skill-assignment lint", () => {
  it("accepts current typed applicability and keeps axes separate", () => {
    const result = analyzeSkillAssignments([
      doc({
        skill_type: "quality-gate-review",
        applies_to: {
          layers: ["L7"],
          applicable_identities: [
            { target_axis: "development_style", target_id: "PRODUCTION_SCRUM" },
            { target_axis: "workflow_model", target_id: "REVERSE" },
          ],
          excluded_identities: [{ target_axis: "workflow_model", target_id: "INCIDENT" }],
        },
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.currentChecked).toBe(1);
    expect(result.compatibilityOnly).toBe(0);
    expect(result.violations).toEqual([]);
  });

  it("rejects legacy field mixing, axis mismatch, and noncanonical current layers", () => {
    const result = analyzeSkillAssignments([
      doc({
        skill_type: "quality-gate-review",
        applies_to: {
          layers: ["L14"],
          applicable_identities: [{ target_axis: "workflow_model", target_id: "PRODUCTION_SCRUM" }],
          drive_models: ["Reverse"],
        },
      }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.kind)).toEqual([
      "unknown-layer",
      "legacy-field-on-current-skill",
      "invalid-current-applicability",
    ]);
  });

  it("keeps existing legacy documents visible as compatibility-only inventory", () => {
    const result = analyzeSkillAssignments([
      doc({
        skill_type: "quality-gate-review",
        applies_to: { layers: ["L14"], drive_models: ["Forward", "Reverse"] },
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.currentChecked).toBe(0);
    expect(result.compatibilityOnly).toBe(1);
  });

  it("rejects missing and unknown assignment metadata", () => {
    const result = analyzeSkillAssignments([
      doc({
        skill_type: "unknown",
        applies_to: { layers: ["L99"], drive_models: ["Unknown"] },
      }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.kind)).toEqual([
      "unknown-skill-type",
      "unknown-layer",
      "unknown-drive-model",
    ]);
  });

  it("real repo legacy skills remain quarantined until #322 backfill", () => {
    const result = analyzeSkillAssignments(loadSkillAssignmentDocs(process.cwd()));

    expect(result.ok).toBe(true);
    expect(result.checked).toBeGreaterThan(0);
    expect(result.currentChecked).toBe(0);
    expect(result.compatibilityOnly).toBe(result.checked);
  });
});
