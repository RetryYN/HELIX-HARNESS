import { describe, expect, it } from "vitest";
import { analyzePlanDescent, type PlanDescentDoc } from "../src/lint/plan-descent";
import { analyzePlanSpecificVpairBindings } from "../src/lint/plan-specific-vpair-binding";
import { collectRelationGraphProjection } from "../src/lint/relation-graph";
import { frontmatterSchema } from "../src/schema/frontmatter";

const planId = "PLAN-L7-665-plan-modification-ownership";
const testPath = "tests/existing.test.ts";
const parentDesign = "docs/design/helix/L6-function-design/plan-modification-ownership.md";
const pairArtifact = "docs/test-design/helix/L8-plan-modification-ownership-unit-test-design.md";

describe("既存artifact修正sliceのPLAN所有権", () => {
  it("U-PLANMOD-001: modifiesのtest_codeをplan-descentとV-pairへ接続する", () => {
    const descentDoc: PlanDescentDoc = {
      file: `docs/plans/${planId}.md`,
      planId,
      kind: "impl",
      status: "draft",
      routeMode: null,
      created: "2026-08-24",
      parentDesign,
      parentDesignExists: true,
      parentDesignStatus: "draft",
      pairArtifact,
      pairArtifactExists: true,
      pairArtifactLayer: "L8",
      pairArtifactSubDoc: "unit-test-design",
      pairArtifactType: "test_design",
      generatesArtifactTypes: ["markdown_doc"],
      modifiesArtifactTypes: ["test_code"],
    };
    expect(
      analyzePlanDescent([descentDoc], { recorded: null, grandfathered: [] }).newViolations,
    ).toEqual([]);

    const source = `// ${planId}\nimport { it } from "vitest";\nit("U-PLANMOD-001: existing test", () => {});\n`;
    const result = analyzePlanSpecificVpairBindings({
      plans: [
        {
          plan_id: planId,
          kind: "impl",
          status: "draft",
          parent_design: parentDesign,
          pair_artifact: pairArtifact,
          verification_bindings: [
            { parent_design: parentDesign, oracle_id: "U-PLANMOD-001", test_path: testPath },
          ],
          generates: [],
          modifies: [{ artifact_path: testPath, artifact_type: "test_code" }],
        },
      ],
      pairDocuments: new Map([
        [
          pairArtifact,
          `| U-ID | 対象 | 反例と期待結果 | test citation |\n|---|---|---|---|\n| U-PLANMOD-001 | test | 反例 | \`${testPath}\` |`,
        ],
      ]),
      testFiles: new Map([
        [
          testPath,
          {
            exists: true,
            regular: true,
            symlink: false,
            insideRepo: true,
            source,
            executableOracleCases: new Map([["U-PLANMOD-001", 1]]),
          },
        ],
      ]),
    });
    expect(result.ok).toBe(true);
  });

  it("U-PLANMOD-002: relation graphはmodifiesをgeneratesと分離する", () => {
    const projection = collectRelationGraphProjection({
      plans: [{ id: planId, generates: ["src/new.ts"], modifies: ["src/existing.ts"] }],
    });
    expect(projection.edges).toEqual(
      expect.arrayContaining([
        { from: `plan:${planId}`, to: "source:src/new.ts", kind: "generates" },
        { from: `plan:${planId}`, to: "source:src/existing.ts", kind: "modifies" },
      ]),
    );
  });

  it("U-PLANMOD-003: frontmatterはgeneratesとmodifiesを別々に保持する", () => {
    const parsed = frontmatterSchema.safeParse({
      plan_id: planId,
      title: "existing artifact modification",
      kind: "impl",
      layer: "L7",
      drive: "agent",
      status: "draft",
      parent_design: parentDesign,
      pair_artifact: pairArtifact,
      agent_slots: [{ role: "se", slot_label: "SE" }],
      generates: [{ artifact_path: "docs/plans/example.md", artifact_type: "markdown_doc" }],
      modifies: [{ artifact_path: "src/existing.ts", artifact_type: "source_module" }],
      dependencies: { parent: null },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.generates).toHaveLength(1);
      expect(parsed.data.modifies).toEqual([
        { artifact_path: "src/existing.ts", artifact_type: "source_module" },
      ]);
    }
  });
});
