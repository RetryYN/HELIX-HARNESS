import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const designPath = "docs/design/helix/L5-detail/development-model-runtime-routing.md";
const testDesignPath =
  "docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md";
const planPath = "docs/plans/PLAN-L5-83-development-model-runtime-routing.md";
const l6DesignPath = "docs/design/harness/L6-function-design/function-spec.md";

describe("AUTH-SURFACE-RUNTIME-001 L5/L8 design closure", () => {
  const design = readFileSync(designPath, "utf8");
  const testDesign = readFileSync(testDesignPath, "utf8");
  const plan = readFileSync(planPath, "utf8");
  const l6Design = readFileSync(l6DesignPath, "utf8");

  it("U-RUNTIMEAXIS-DESIGN-001: 4軸のexact valueとcardinalityを固定する", () => {
    for (const value of [
      "FULL_L1_L12_V",
      "PRODUCTION_SCRUM",
      "V_DESIGN_SCRUM_IMPLEMENTATION",
      'type CaseDrivenModel = "Discovery" | "PoC"',
      "type ChangeRoute =",
      "developmentStyle: DevelopmentStyle;",
      "specialistProcesses: readonly SpecialistProcess[]",
      "compatibilityInputs: readonly string[]",
    ]) {
      expect(design, value).toContain(value);
    }
    expect(design).toContain("developmentStyle=exactly 1");
    expect(design).toContain("caseDrivenModel=0..1");
    expect(design).toContain("changeRoute=0..1");
    expect(design).toContain("specialistProcesses=0..N");

    const developmentStyleBlock = design.match(/type DevelopmentStyle =([\s\S]*?);/u)?.[1] ?? "";
    const developmentStyles = [...developmentStyleBlock.matchAll(/\| "([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(developmentStyles).toEqual([
      "FULL_L1_L12_V",
      "PRODUCTION_SCRUM",
      "V_DESIGN_SCRUM_IMPLEMENTATION",
    ]);
    expect(testDesign).toContain(`development style exact ${developmentStyles.length}`);

    const caseDrivenBlock = design.match(/type CaseDrivenModel = ([^;]+);/u)?.[1] ?? "";
    const caseDrivenModels = [...caseDrivenBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    expect(caseDrivenModels).toEqual(["Discovery", "PoC"]);
    expect(testDesign).toContain(`case exact ${caseDrivenModels.length} + null`);

    const changeRouteBlock = design.match(/type ChangeRoute =([\s\S]*?);/u)?.[1] ?? "";
    const changeRoutes = [...changeRouteBlock.matchAll(/\| "([^"]+)"/g)].map((match) => match[1]);
    expect(changeRoutes).toEqual([
      "Reverse",
      "Recovery",
      "Incident",
      "Refactor",
      "Retrofit",
      "Add-feature",
      "version-up",
      "Research",
    ]);
    expect(testDesign).toContain(`change route exact ${changeRoutes.length} + null`);
    expect(design).toContain(
      "`projectWorkflowAxes(WorkflowAxisInput) => WorkflowAxisProjection`を呼び",
    );
    expect(design).toContain("unknown／複合／分類衝突は`FULL_L1_L12_V`へfail-closeする");
    expect(design).toContain('文字列`"none"`をcurrent値として出力しない');
    expect(design).toContain("旧route／layer名は`compatibilityInputs`へ隔離");
    expect(design).toContain("specialist processのregistry admissionとbrand付与もL6が解決");
    expect(design).toContain("候補空集合はcurrent task packetとして");
    expect(design).toContain("候補空集合をFull Vへ補完しない");
    expect(design).toContain("L4に残る文字列`none`は移行中のcompatibility inputとしてだけ読み");

    const fieldNames = (source: string, typeName: string): string[] => {
      const block = source.match(
        new RegExp(`(?:type|interface) ${typeName}[^\\{]*\\{([\\s\\S]*?)\\n\\}`, "u"),
      )?.[1];
      return [...(block ?? "").matchAll(/^\s*([A-Za-z][A-Za-z0-9]*):/gmu)].map((match) => match[1]);
    };
    expect(fieldNames(design, "ParsedRuntimeRoutingAxes")).toEqual(
      fieldNames(l6Design, "WorkflowAxisInput"),
    );
    expect(fieldNames(design, "RuntimeRoutingAxes")).toEqual(
      fieldNames(l6Design, "WorkflowAxisProjection"),
    );
    for (const typeName of ["DevelopmentStyle", "CaseDrivenModel", "ChangeRoute"]) {
      const typeValues = (source: string): string[] => {
        const block = source.match(new RegExp(`type ${typeName} =([\\s\\S]*?);`, "u"))?.[1] ?? "";
        return [...block.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
      };
      expect(typeValues(design)).toEqual(typeValues(l6Design));
    }
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
    expect(sourcePaths).toEqual([
      "`src/schema/index.ts`",
      "`src/schema/frontmatter.ts`",
      "`src/lint/skill-assignment.ts`",
      "`src/skill-engine/scaffold.ts`",
      "`src/cli.ts`",
      "`src/assets/catalog.ts`",
      "`src/skills/recommend.ts`",
      "`src/schema/harness-db.ts`",
      "`src/schema/harness-db-tables-core.ts`",
      "`src/state-db/projection-writer.ts`",
      "`src/state-db/current-location.ts`",
      "`src/schema/visualization-current-location-contract.ts`",
      "`src/state-db/visualization-view-model.ts`",
      "`src/vmodel/visualization-tree-projector.ts`",
    ]);
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
    for (const metadata of [
      "sub_doc: unit-test-design",
      "artifact_type: test_design",
      "executed_at_layer: L8",
    ]) {
      expect(testDesign).toContain(metadata);
    }
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
