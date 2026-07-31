import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string): string => readFileSync(path, "utf8");
const requirementPath = "docs/design/helix/L3-requirements/requirement-discovery-json-authority.md";
const acceptancePath = "docs/test-design/helix/requirement-discovery-json-authority-acceptance.md";
const planPath = "docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md";

const requirement = read(requirementPath);
const acceptance = read(acceptancePath);
const plan = read(planPath);
const canonicalRequirements = read("docs/governance/helix-harness-requirements_v1.3.md");
const systemContracts = read(
  "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
);
const systemAcceptance = read("docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md");
const freezePacket = read("docs/governance/l3-rebaseline-g3-freeze-packet.md");

const exactIds = (source: string, pattern: RegExp): string[] =>
  [...source.matchAll(pattern)].map((match) => match[1] ?? "");

describe("Requirement Discovery Loop / L3 JSON authority contract", () => {
  it("refines existing Requirement Engine owners without creating a 25th system contract", () => {
    const refinementIds = exactIds(requirement, /^\| `(RDJ-FR-\d{3})` \|/gm);
    const systemContractIds = exactIds(systemContracts, /^\| (HR-FR-HIL-\d{2}) \|/gm);
    const systemTestIds = exactIds(systemAcceptance, /^\| (HAT-HIL-\d{2}) \|/gm);

    expect(refinementIds).toEqual(
      Array.from({ length: 12 }, (_, index) => `RDJ-FR-${String(index + 1).padStart(3, "0")}`),
    );
    expect(new Set(refinementIds).size).toBe(12);
    expect(new Set(systemContractIds).size).toBe(24);
    expect(systemTestIds).toHaveLength(24);
    expect(new Set(systemTestIds).size).toBe(24);
    for (const owner of ["HR-FR-HIL-15", "HR-FR-HIL-17", "HR-FR-HIL-19", "HR-FR-HIL-20"]) {
      expect(requirement).toContain(`- ${owner}`);
      expect(systemContractIds).toContain(owner);
    }
    expect(requirement).toContain(
      "別Requirement Engine、別台帳、別layer、別authoring DBを追加しない",
    );
  });

  it("keeps L1 Markdown, L2 discovery candidates, and L3 strict JSON as distinct authorities", () => {
    expect(requirement).toContain("L1は人間向けMarkdownを正本");
    expect(requirement).toContain("L2はappend-only discovery event");
    expect(requirement).toContain("canonical requirementではない");
    expect(requirement).toContain("L3で初めてstrict JSON IRを機械正本");
    expect(requirement).toContain("G1/G3人間承認後だけfreeze");
    expect(acceptance).toContain("event上書き、訂正履歴消失、未知event受理");
    expect(acceptance).toContain("dual authority");
  });

  it("covers every refinement with an exact L10 oracle and all multi-surface failure paths", () => {
    const requirementIds = exactIds(requirement, /^\| `(RDJ-FR-\d{3})` \|/gm);
    const acceptanceIds = exactIds(acceptance, /^\| `(RDJ-AC-\d{3})` \|/gm);

    expect(acceptanceIds).toEqual(requirementIds.map((id) => id.replace("RDJ-FR-", "RDJ-AC-")));
    expect(requirement).toContain(
      "`screen/cli/api/event/batch/notification/external_service/none`",
    );
    expect(requirement).toContain("success/cancel/failure/timeout/recovery→AC→oracle");
    expect(acceptance).toContain("surface未割当");
    expect(acceptance).toContain("`none`理由なし");
    expect(acceptance).toContain("正常系だけ");
  });

  it("fails closed on fabricated human decisions and incomplete convergence", () => {
    expect(requirement).toContain("AIによる無断canonical化を拒否");
    expect(requirement).toContain("高影響判断は人間へ送る");
    expect(requirement).toContain("AIの沈黙承認は禁止");
    expect(requirement).toContain("直近2 iteration");
    expect(requirement).toContain("human prototype agreement");
    expect(acceptance).toContain("回答捏造");
    expect(acceptance).toContain("score単独");
    expect(acceptance).toContain("stale agreement");
  });

  it("preserves the style, case-model, and specialist-process axes", () => {
    for (const style of ["FULL_L1_L12_V", "PRODUCTION_SCRUM", "V_DESIGN_SCRUM_IMPLEMENTATION"]) {
      expect(canonicalRequirements).toContain(style);
    }
    expect(requirement).toContain("3 production style");
    expect(requirement).toContain("Discovery／PoC");
    expect(requirement).toContain("case軸");
    expect(requirement).toContain("Design HARNESS");
    expect(requirement).toContain("specialist軸");
    expect(acceptance).toContain("`PRODUCTION_SCRUM_REDUCED_V`出力");
    expect(acceptance).toContain("PoCのScrum内包");
    expect(acceptance).toContain("Design HARNESSのstyle化");
  });

  it("exposes typed Design Template JSON ports without mixing the successor episode", () => {
    for (const field of [
      "design_template_ids",
      "design_obligation_ids",
      "required_design_artifact_kinds",
    ]) {
      expect(requirement).toContain(field);
      expect(acceptance).toContain(field);
    }
    expect(requirement).toContain("pending_template_resolution");
    expect(requirement).toContain("#290の独立episode");
    expect(requirement).toContain("PR-6／#288のG1/G3再束縛後だけactivation");
    expect(requirement).toContain("Markdown／HTML／Mermaid／画像");
    expect(acceptance).toContain("存在しないtemplate IDの捏造");
    expect(acceptance).toContain("未解決templateの隠蔽");
  });

  it("partitions the migration into six finite PR slices and hands off to the G1/G3 freeze", () => {
    const partitions = exactIds(requirement, /^\| PR-(\d) \/ #\d+ \|/gm);
    expect(partitions).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(new Set(partitions).size).toBe(6);
    expect(plan).toContain("github_issue_id: 283");
    expect(plan).toContain("behavior_contract_id: RDJ-FR-001");
    expect(plan).toContain("responsibility_owner: requirement-discovery-json-authority");
    expect(freezePacket).toContain(
      "状態: `freeze-transaction-candidate-awaiting-external-receipts`",
    );
    expect(freezePacket).toContain("PR #298でRequirement JSON authority cutoverを完了");
    expect(freezePacket).toContain("issues/288#issuecomment-5137504131");
  });

  it("does not claim PR-2 through PR-6 runtime behavior as implemented", () => {
    expect(requirement).toContain("PR-1は契約だけを定義");
    expect(requirement).toContain("schema/runtime/migration/cutoverを実装済みと主張しない");
    expect(acceptance).toContain("design-defined / not-implemented");
    expect(plan).toContain("no_code_decision: no_change");
  });
});
