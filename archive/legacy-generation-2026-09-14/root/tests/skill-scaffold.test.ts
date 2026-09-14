import { describe, expect, it } from "vitest";
import { SKILL_SCAFFOLD_ALLOWED_VALUES, scaffoldSkill } from "../src/skill-engine/scaffold";

const reverseApplicability = [{ target_axis: "workflow_model" as const, target_id: "REVERSE" }];

describe("skill scaffold generator", () => {
  it("generates only typed applicability metadata without writing files", () => {
    const result = scaffoldSkill({
      name: "Quality Review",
      category: "quality-gate-review",
      layers: ["L7", "L7", "L8"],
      applicableIdentities: [
        { target_axis: "development_style", target_id: "PRODUCTION_SCRUM" },
        ...reverseApplicability,
      ],
      excludedIdentities: [{ target_axis: "workflow_model", target_id: "INCIDENT" }],
      domainTags: ["review", "gate"],
      description: "品質gate review用のskill scaffold。",
    });

    expect(result.ok).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.path).toBe("docs/skills/quality-review.md");
    expect(result.metadata).toMatchObject({
      schema_version: "skill.v1",
      name: "Quality Review",
      skill_type: "quality-gate-review",
      applies_to: {
        layers: ["L7", "L8"],
        applicable_identities: [
          { target_axis: "development_style", target_id: "PRODUCTION_SCRUM" },
          { target_axis: "workflow_model", target_id: "REVERSE" },
        ],
        excluded_identities: [{ target_axis: "workflow_model", target_id: "INCIDENT" }],
      },
      domain_tags: ["review", "gate"],
    });
    expect(result.content).toContain("applicable_identities:");
    expect(result.content).toContain('target_axis: "workflow_model"');
    expect(result.content).toContain('target_id: "REVERSE"');
    expect(result.content).not.toContain("drive_models:");
    expect(result.content).toContain("## §0 出発点となる態度");
    expect(result.content).toContain("## §1 判断フレーム");
    expect(result.content).toContain("## §3 アンチパターン");
    expect(result.content).toContain("<!-- 記入:");
    expect(result.content).toContain("SKILL_MAP");
  });

  it("blocks slug collisions and keeps near-name overlap advisory", () => {
    const common = {
      category: "testing",
      layers: ["L7"],
      applicableIdentities: reverseApplicability,
    } as const;
    const collision = scaffoldSkill({
      ...common,
      name: "test-thinking",
      existingSlugs: ["test-thinking", "code-minimalism"],
    });
    expect(collision.ok).toBe(false);
    expect(collision.findings.map((finding) => finding.field)).toContain("duplicate-slug");

    const nearName = scaffoldSkill({
      ...common,
      name: "test-thinking-advanced",
      existingSlugs: ["test-thinking"],
    });
    expect(nearName.ok).toBe(true);
    expect(nearName.findings.find((finding) => finding.field === "duplicate-risk")?.advisory).toBe(
      true,
    );

    const unrelated = scaffoldSkill({
      ...common,
      name: "api",
      category: "design-contract",
      layers: ["L4"],
      existingSlugs: ["rapid-prototyping"],
    });
    expect(unrelated.ok).toBe(true);
    expect(unrelated.findings).toEqual([]);
  });

  it("self-lints invalid category, layer, and typed identity", () => {
    const result = scaffoldSkill({
      name: "Bad Skill",
      category: "unknown",
      layers: ["L14"],
      applicableIdentities: [{ target_axis: "workflow_model", target_id: "PRODUCTION_SCRUM" }],
    });

    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.field)).toEqual([
      "unknown-skill-type",
      "unknown-layer",
      "invalid-current-applicability",
    ]);
  });

  it("exposes current L1-L12 layers and typed applicability axes", () => {
    expect(SKILL_SCAFFOLD_ALLOWED_VALUES.categories).toContain("quality-gate-review");
    expect(SKILL_SCAFFOLD_ALLOWED_VALUES.layers).toContain("L12");
    expect(SKILL_SCAFFOLD_ALLOWED_VALUES.layers).not.toContain("L14");
    expect(SKILL_SCAFFOLD_ALLOWED_VALUES.applicabilityAxes).toContain("workflow_model");
    expect(SKILL_SCAFFOLD_ALLOWED_VALUES).not.toHaveProperty("driveModels");
  });
});
