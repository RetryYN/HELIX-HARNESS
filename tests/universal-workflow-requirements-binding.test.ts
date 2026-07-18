import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const REQUIREMENTS = "docs/governance/helix-harness-requirements_v1.3.md";
const DESIGN = "docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md";
const ACCEPTANCE = "docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md";

const SOURCE_FILES = [
  "README.md",
  "SKILL.md",
  "catalogs/base-question-catalog.md",
  "catalogs/conditional-question-catalog.yaml",
  "catalogs/runtime-orchestration-question-catalog.md",
  "contracts/derived-mapping.md",
  "contracts/requirement-contract.schema.json",
  "contracts/runtime-orchestration-contract.md",
  "contracts/workflow-to-requirement-contract.md",
  "examples/approval-workflow.example.json",
  "examples/runtime-orchestration.example.json",
  "prompts/workflow-extraction-prompt.md",
  "schemas/derived-requirements.schema.json",
  "schemas/workflow-model.schema.json",
] as const;

function ids(text: string, prefix: string): string[] {
  return [...text.matchAll(new RegExp(`\\b${prefix}-(\\d{3})\\b`, "g"))].map((match) => match[1]);
}

describe("Universal Workflow AI judgment requirements binding", () => {
  it("binds the exact v1.1.0 source identity and 14-file inventory", () => {
    const design = readFileSync(DESIGN, "utf8");
    expect(design).toContain("UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip");
    expect(design).toContain("b6fd08f5054930dde8379969bf9a84cb21270d1b7bac8e87be3bc243ad425d26");
    for (const path of SOURCE_FILES) expect(design, `${path} missing`).toContain(path);
  });

  it("keeps 18 FR and 18 paired AC exactly closed", () => {
    const design = readFileSync(DESIGN, "utf8");
    const acceptance = readFileSync(ACCEPTANCE, "utf8");
    const expected = Array.from({ length: 18 }, (_, index) => String(index + 1).padStart(3, "0"));
    expect([...new Set(ids(design, "UWJ-FR"))]).toEqual(expected);
    expect([...new Set(ids(design, "UWJ-AC"))]).toEqual(expected);
    expect([...new Set(ids(acceptance, "UWJ-AC"))]).toEqual(expected);
    expect(design).toContain(`pair_artifact: ${ACCEPTANCE}`);
    expect(acceptance).toContain(`pair_artifact: ${DESIGN}`);
  });

  it("places judgment obligations across L1-L12 and both delivery routes", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    const design = readFileSync(DESIGN, "utf8");
    for (let layer = 1; layer <= 12; layer += 1) expect(design).toContain(`| L${layer} |`);
    expect(requirements).toContain("Full Vではsystem全体のworkflow model");
    expect(requirements).toContain("Production Scrumではslice delta");
    expect(design).toContain("SR0..SR4_current");
  });

  it("fails closed on AI self-approval and the known schema-composition gap", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    const design = readFileSync(DESIGN, "utf8");
    const acceptance = readFileSync(ACCEPTANCE, "utf8");
    expect(requirements).toContain("gate passを自己承認しない");
    expect(design).toContain("runtime orchestration専用schema");
    expect(acceptance).toContain("旧workflow schema単体へ投入すると失敗するnegative fixture");
    expect(acceptance).toContain("専用schema/composition適合後だけactivationを許可する");
  });

  it("requires measurement evidence beyond green tests", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    const acceptance = readFileSync(ACCEPTANCE, "utf8");
    expect(requirements).toContain("誤判断率");
    expect(acceptance).toContain("test greenでも判断品質");
    expect(acceptance).toContain("missing/stale/failならcompletionを拒否");
  });
});
