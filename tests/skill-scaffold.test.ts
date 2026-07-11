import { describe, expect, it } from "vitest";
import { SKILL_SCAFFOLD_ALLOWED_VALUES, scaffoldSkill } from "../src/skill-engine/scaffold";

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
    // 品質 skeleton (PLAN-L7-420): skill-authoring 準拠の節構成と穴埋め marker を持つ。
    expect(result.content).toContain("## §0 出発点となる態度");
    expect(result.content).toContain("## §1 判断フレーム");
    expect(result.content).toContain("## §3 アンチパターン");
    expect(result.content).toContain("<!-- 記入:");
    expect(result.content).toContain("SKILL_MAP");
  });

  it("blocks slug collisions and flags near-name overlap against the existing catalog", () => {
    const collision = scaffoldSkill({
      name: "test-thinking",
      category: "testing",
      layers: ["L7"],
      driveModels: ["Forward"],
      existingSlugs: ["test-thinking", "code-minimalism"],
    });
    expect(collision.ok).toBe(false);
    expect(collision.findings.map((f) => f.field)).toContain("duplicate-slug");

    // hyphen 語境界の包含は advisory (api / api-contract 型の正当な責務分離を block しない)。
    const nearName = scaffoldSkill({
      name: "test-thinking-advanced",
      category: "testing",
      layers: ["L7"],
      driveModels: ["Forward"],
      existingSlugs: ["test-thinking"],
    });
    expect(nearName.ok).toBe(true);
    const risk = nearName.findings.find((f) => f.field === "duplicate-risk");
    expect(risk?.advisory).toBe(true);

    // 語境界を跨がない部分文字列 (api ⊂ rapid) は近似名として扱わない。
    const unrelated = scaffoldSkill({
      name: "api",
      category: "design-contract",
      layers: ["L4"],
      driveModels: ["Forward"],
      existingSlugs: ["rapid-prototyping"],
    });
    expect(unrelated.ok).toBe(true);
    expect(unrelated.findings).toEqual([]);

    // 中間位置の語境界包含 (advanced-api-contract-guide ⊃ api-contract) も advisory を出す。
    const middle = scaffoldSkill({
      name: "api-contract",
      category: "design-contract",
      layers: ["L4"],
      driveModels: ["Forward"],
      existingSlugs: ["advanced-api-contract-guide"],
    });
    expect(middle.ok).toBe(true);
    expect(middle.findings.find((f) => f.field === "duplicate-risk")?.advisory).toBe(true);

    const clean = scaffoldSkill({
      name: "incident-drill",
      category: "process",
      layers: ["L12"],
      driveModels: ["Incident"],
      existingSlugs: ["test-thinking", "code-minimalism"],
    });
    expect(clean.ok).toBe(true);
    expect(clean.findings).toEqual([]);
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
