import { describe, expect, it } from "vitest";
import { scaffoldSkill, SKILL_SCAFFOLD_ALLOWED_VALUES } from "../src/skill-engine/scaffold";

describe("skill scaffold generator", () => {
  it("returns deterministic path, skill.v1 content, and metadata without writing files", () => {
    const result = scaffoldSkill({
      name: "Quality Review",
      category: "quality-gate-review",
      layers: ["L7", "L7", "L8"],
      driveModels: ["Forward", "Reverse"],
      domainTags: ["review", "gate"],
      description: "品質 gate review 用の skill scaffold。",
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
        drive_models: ["Forward", "Reverse"],
      },
      domain_tags: ["review", "gate"],
    });
    expect(result.content).toContain("schema_version: skill.v1");
    expect(result.content).toContain('skill_type: "quality-gate-review"');
    expect(result.content).toContain("## この skill を読む条件");
  });

  it("self-lints invalid category, layer, and drive model through the assignment SSoT", () => {
    const result = scaffoldSkill({
      name: "Bad Skill",
      category: "unknown",
      layers: ["L99"],
      driveModels: ["Unknown"],
    });

    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.field)).toEqual([
      "unknown-skill-type",
      "unknown-layer",
      "unknown-drive-model",
    ]);
  });

  it("exposes allowed values from the shared skill assignment constants", () => {
    expect(SKILL_SCAFFOLD_ALLOWED_VALUES.categories).toContain("quality-gate-review");
    expect(SKILL_SCAFFOLD_ALLOWED_VALUES.layers).toContain("L14");
    expect(SKILL_SCAFFOLD_ALLOWED_VALUES.driveModels).toContain("Research");
  });
});
