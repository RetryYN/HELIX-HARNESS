import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const designPath = "docs/design/helix/L5-detail/development-model-runtime-routing.md";
const testDesignPath =
  "docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md";
const planPath = "docs/plans/PLAN-L5-83-development-model-runtime-routing.md";

describe("AUTH-SURFACE-RUNTIME-001 L5/L8 design closure", () => {
  const design = readFileSync(designPath, "utf8");
  const testDesign = readFileSync(testDesignPath, "utf8");
  const plan = readFileSync(planPath, "utf8");

  it("U-RUNTIMEAXIS-DESIGN-001: 4軸のexact valueとcardinalityを固定する", () => {
    for (const value of [
      "FULL_L1_L12_V",
      "PRODUCTION_SCRUM",
      "V_DESIGN_SCRUM_IMPLEMENTATION",
      'type CaseDrivenModel = "none" | "Discovery" | "PoC"',
      "type ChangeRoute =",
      "developmentStyle: DevelopmentStyle | null",
      "specialistProcesses: readonly string[]",
    ]) {
      expect(design, value).toContain(value);
    }
    expect(design).toContain("developmentStyle=0..1");
    expect(design).toContain("caseDrivenModel=exactly 1");
    expect(design).toContain("changeRoute=exactly 1");
    expect(design).toContain("specialistProcesses=0..N");
  });

  it("U-RUNTIMEAXIS-DESIGN-002: legacy parseとcurrent projectionを分離する", () => {
    expect(design).toContain("旧`drive_models`はcompatibility parserが妥当性検査にだけ使用する");
    expect(design).toContain("legacy値を変換してcurrent recommendationへ入れない");
    expect(design).toContain("旧`applies_drive_models`列はmigration互換のため");
    expect(design).toContain("current rebuildでは空文字を記録");
    expect(design).toContain("旧`drive_models`一致は0点");
    expect(testDesign).toContain(
      "legacy-only successでcurrent recommendationを生成するmutationを拒否",
    );
  });

  it("U-RUNTIMEAXIS-DESIGN-003: PoCをScrum非内包case lifecycleとして設計する", () => {
    expect(design).toContain("Discovery／PoC case lifecycleでありScrum phaseではない");
    expect(design).toContain("旧`scrum_type`はparseできるが");
    expect(design).toContain("S3/S4の必須条件");
    expect(testDesign).toContain("`kind=poc` S3/S4を`scrum_type`無しで受理");
  });

  it("U-RUNTIMEAXIS-DESIGN-004: DB／推薦／CLIのexact implementation inventoryを固定する", () => {
    const sourcePaths = design.match(/`src\/[A-Za-z0-9./-]+\.ts`/g) ?? [];
    expect(new Set(sourcePaths).size).toBe(14);
    for (const field of [
      "applies_development_styles",
      "applies_case_driven_models",
      "applies_change_routes",
      "applies_specialist_processes",
      "matchedDevelopmentStyles",
      "matchedCaseDrivenModels",
      "matchedChangeRoutes",
      "matchedSpecialistProcesses",
    ]) {
      expect(design, field).toContain(field);
    }
    expect(plan).toContain("runtime/schema/DB/CLIの14 source");
  });

  it("U-RUNTIMEAXIS-DESIGN-005: L8 polarity oracleを10件exactで持つ", () => {
    const ids = [...testDesign.matchAll(/U-RUNTIMEAXIS-\d{3}/g)].map((match) => match[0]);
    expect(ids).toEqual([
      "U-RUNTIMEAXIS-001",
      "U-RUNTIMEAXIS-002",
      "U-RUNTIMEAXIS-003",
      "U-RUNTIMEAXIS-004",
      "U-RUNTIMEAXIS-005",
      "U-RUNTIMEAXIS-006",
      "U-RUNTIMEAXIS-007",
      "U-RUNTIMEAXIS-008",
      "U-RUNTIMEAXIS-009",
      "U-RUNTIMEAXIS-010",
    ]);
    expect(testDesign).toContain("Full admission: final candidate HEADでfull CIを1回だけ実行する");
  });
});
