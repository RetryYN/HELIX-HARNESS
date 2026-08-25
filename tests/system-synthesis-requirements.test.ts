import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";

const requirementPath =
  "docs/design/helix/L3-requirements/system-synthesis-requirements.md";
const acceptancePath = "docs/test-design/helix/system-synthesis-acceptance.md";
const roadmapPath = "docs/governance/system-synthesis-rollout-roadmap.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const roadmap = readFileSync(roadmapPath, "utf8");

describe("System Synthesis requirements authority", () => {
  it("L3とL10を同じPLANとpairへ束縛する", () => {
    expect(requirement).toContain(
      "plan: PLAN-L3-66-system-synthesis-requirements",
    );
    expect(acceptance).toContain(
      "plan: PLAN-L3-66-system-synthesis-requirements",
    );
    expect(requirement).toContain(`pair_artifact: ${acceptancePath}`);
    expect(acceptance).toContain(`pair_artifact: ${requirementPath}`);
  });

  it("supporting requirementとacceptanceのexact setを閉じる", () => {
    for (let index = 1; index <= 10; index += 1) {
      expect(requirement).toContain(`SYN-R-${String(index).padStart(2, "0")}`);
    }
    for (let index = 1; index <= 14; index += 1) {
      expect(acceptance).toContain(`SYN-AC-${String(index).padStart(3, "0")}`);
    }
    expect(requirement.match(/#### SYN-R-\d{2}/g)).toHaveLength(10);
    expect(acceptance.match(/\| `SYN-AC-\d{3}`/g)).toHaveLength(14);
  });

  it("分類軸とauthorityを混同しない", () => {
    expect(requirement).toContain("architecture composition capability family");
    expect(requirement).toContain("新しいroute、development style、execution mode");
    expect(requirement).toContain("`REFACTORING`だけを新しい`specialist_workflow`");
    expect(requirement).toContain("`harness.db`は");
    expect(acceptance).toContain("route identityの吸収を拒否する");
  });

  it("LLM proposalとFUTUREをcurrent authorityから隔離する", () => {
    expect(requirement).toContain("LLMは候補と根拠を提案できる");
    expect(requirement).toContain("shadow／parked capability");
    expect(acceptance).toContain("shadow receiptだけを生成する");
    expect(roadmap).toContain("#1037は以下が全て揃うまでparked");
  });

  it("NOW childを漏れなく依存順へ割り当てる", () => {
    for (const issue of [1034, 1035, 1036, 1038, 1039, 1040, 1041]) {
      expect(roadmap).toContain(`#${issue}`);
    }
  });

  it("Requirement IRへstable refinementとして投影する", () => {
    const source = loadCanonicalRequirementIrFromShards(process.cwd());
    const refinement = source.refinement_contracts.find(
      (record) => record.refinement_contract_id === "SYN-FR-001",
    );
    expect(refinement?.lifecycle_status).toBe("specified");
    expect(refinement?.supporting_requirements).toHaveLength(10);
    expect(refinement?.acceptance_cases).toHaveLength(14);
    expect(refinement?.downstream_issue_ids).toEqual([
      1036, 1039, 1035, 1040, 1038, 1041, 1034, 1037,
    ]);
  });
});
