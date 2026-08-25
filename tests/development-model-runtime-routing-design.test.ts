import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const designPath = "docs/design/helix/L5-detail/development-model-runtime-routing.md";
const testDesignPath =
  "docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md";

describe("SKILL-APPLICABILITY-VALUE-OBJECT-001 L5/L8 design closure", () => {
  const design = readFileSync(designPath, "utf8");
  const testDesign = readFileSync(testDesignPath, "utf8");

  it("U-SKAPP-DESIGN-001: typed pairと極性をcurrent value objectに固定する", () => {
    for (const value of [
      "type SkillApplicabilityIdentity =",
      "target_axis: WorkflowClassificationAxis",
      "target_id: WorkflowClassificationIdentityId",
      "applicable_identities: readonly SkillApplicabilityIdentity[]",
      "excluded_identities: readonly SkillApplicabilityIdentity[]",
      "暗黙のall／Forwardを持たない",
      "positive集合と同一pairを持てない",
    ]) {
      expect(design, value).toContain(value);
    }
    expect(design).not.toContain("type DevelopmentStyle =");
    expect(design).not.toContain("type ChangeRoute =");
  });

  it("U-SKAPP-DESIGN-002: requirementsとclassification registryを二重束縛する", () => {
    expect(design).toContain(
      "skill applicability registryのschema versionとrequirements source digest",
    );
    expect(design).toContain("workflow classification registryのversionとsource digest");
    expect(design).toContain("片方のregistryだけがgreenでも受理しない");
    expect(testDesign).toContain("U-SKAPP-001");
    expect(testDesign).toContain("片方のdigest、version、source pathを変えたregistryを拒否");
  });

  it("U-SKAPP-DESIGN-003: legacyをinput-onlyにし曖昧tokenを拒否する", () => {
    expect(design).toContain("旧`drive_models`はcompatibility adapterだけが読む");
    expect(design).toContain("`Forward`、`Scrum`は曖昧として拒否");
    expect(design).toContain("legacy-only skillは#322のbackfill完了まで");
    expect(testDesign).toContain("U-SKAPP-003");
    expect(testDesign).toContain("`Forward`／`Scrum`をambiguous");
  });

  it("U-SKAPP-DESIGN-004: DB／推薦／CLIをtyped pair projectionへ固定する", () => {
    expect(design).toContain("target_axis`、`target_id`、polarityを行単位で正規化");
    expect(design).toContain("CSVや単一model fieldへ畳み込まない");
    expect(design).toContain("negative一致は候補から除外");
    expect(design).toContain("matched_identities");
    expect(design).toContain("source_applicable_identities");
    expect(design).toContain("source_excluded_identities");
    expect(design).toContain("`matched_drive_models`、`source_drive_models`");
  });

  it("U-SKAPP-DESIGN-005: L8 oracle exact setと未完了境界を固定する", () => {
    for (const metadata of [
      "sub_doc: unit-test-design",
      "artifact_type: test_design",
      "executed_at_layer: L7",
    ]) {
      expect(testDesign).toContain(metadata);
    }
    const ids = [...new Set([...testDesign.matchAll(/U-SKAPP-\d{3}/g)].map((match) => match[0]))];
    expect(ids).toEqual([
      "U-SKAPP-001",
      "U-SKAPP-002",
      "U-SKAPP-003",
      "U-SKAPP-004",
      "U-SKAPP-005",
      "U-SKAPP-006",
      "U-SKAPP-007",
      "U-SKAPP-008",
      "U-SKAPP-009",
      "U-SKAPP-010",
    ]);
    expect(testDesign).toContain("U-SKAPP-005〜008は#248の後続原子slice");
    expect(testDesign).toContain("authoringだけでDB／recommendation移行完了を主張しない");
  });
});
