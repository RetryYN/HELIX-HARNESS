import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const scopedPaths = [
  "docs/design/harness/L1-requirements/functional-requirements.md",
  "docs/design/harness/L1-requirements/screen-requirements.md",
  "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
  "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
  "docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md",
] as const;

const docs = scopedPaths.map((path) => [path, readFileSync(path, "utf8")] as const);
const textByPath = new Map(docs);
const joined = docs.map(([, text]) => text).join("\n");
const planPath = "docs/plans/PLAN-L3-48-requirement-style-case-authority.md";
const plan = readFileSync(planPath, "utf8");
const styles = ["FULL_L1_L12_V", "PRODUCTION_SCRUM", "V_DESIGN_SCRUM_IMPLEMENTATION"];

describe("L1/L3 requirement style / case-driven / specialist authority", () => {
  it("AUTH-REQ-U-001: binds the exact requirement inventory", () => {
    const generated = [...plan.matchAll(/^\s+- artifact_path: (.+)$/gm)].map((match) => match[1]);
    expect(generated).toEqual([
      planPath,
      ...scopedPaths,
      "src/lint/l3-progression-reviewed-digests.ts",
      "tests/l3-requirement-style-case-authority.test.ts",
      "docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md",
      "src/lint/l12-hybrid-reviewed-safe-v2.ts",
      "tests/l12-canonical-authority.test.ts",
      "tests/l12-hybrid-recognition.test.ts",
      "docs/governance/feedback-test-owner-disposition-residual.json",
      "docs/governance/infinity-loop-requirement-definition-ledger.md",
      "src/lint/outstanding.ts",
      "src/lint/semantic-frontier-consistency.ts",
      "tests/ai-vision-design-harness-requirements-binding.test.ts",
      "tests/semantic-frontier-consistency.test.ts",
      "tests/vmodel-pair.test.ts",
    ]);
  });

  it("AUTH-REQ-U-002: declares all three peer development styles", () => {
    for (const style of styles) {
      expect(joined).toContain(style);
    }
    expect(textByPath.get(scopedPaths[0])).toContain(
      "`FULL_L1_L12_V`、`PRODUCTION_SCRUM`、`V_DESIGN_SCRUM_IMPLEMENTATION`の同列development styleで実行する",
    );
    expect(textByPath.get(scopedPaths[1])).toContain(
      "development styleは`FULL_L1_L12_V` / `PRODUCTION_SCRUM` / `V_DESIGN_SCRUM_IMPLEMENTATION`を同列表示する",
    );
    expect(textByPath.get(scopedPaths[2])).toContain(
      "`V_DESIGN_SCRUM_IMPLEMENTATION`の同列3種からexactly one選択し、いずれも正規6 V-pairを閉じる",
    );
    expect(textByPath.get(scopedPaths[3])).toContain(
      "3 development styleを同列に扱い、Discovery／PoCを分割方式として暗黙起動しない",
    );
    expect(textByPath.get(scopedPaths[4])).toContain(
      "`V_DESIGN_SCRUM_IMPLEMENTATION`を同列development styleとしてexactly one選択する",
    );
  });

  it("AUTH-REQ-U-003: keeps case-driven models outside Scrum", () => {
    expect(textByPath.get(scopedPaths[0])).toContain(
      "Discovery／PoCをScrum非内包の別軸case-driven modelとして",
    );
    expect(textByPath.get(scopedPaths[1])).toContain(
      "PoC stateをScrum stateとして表示してはならない",
    );
    expect(textByPath.get(scopedPaths[2])).toContain(
      "Discovery／PoCはScrum非内包の別軸case-driven model",
    );
    expect(textByPath.get(scopedPaths[3])).toContain(
      "Discovery／PoCは明示case decisionなしに起動しない",
    );
    expect(textByPath.get(scopedPaths[4])).toContain(
      "Discovery／PoCはScrum非内包の別軸case-driven model",
    );
    expect(textByPath.get(scopedPaths[0])).toContain("Scrumを縮退VやPoC phaseとして扱わず");
    expect(textByPath.get(scopedPaths[0])).toContain("Discovery／PoCをScrum phaseへ変換しない");
    expect(joined).not.toContain("Scrum S-phase");
    expect(joined).not.toContain("Scrum / PoC / sprint backlog");
  });

  it("AUTH-REQ-U-004: keeps Design HARNESS on the specialist axis", () => {
    expect(textByPath.get(scopedPaths[2])).toContain(
      "Design HARNESS等は別軸specialist capabilityであり、\n完了正本を置換しない",
    );
    expect(textByPath.get(scopedPaths[4])).toContain(
      "Design HARNESSはstyleでもcase-driven modelでも独立V-model layerでもなく、対象責務へ適用する\n  specialist capabilityである",
    );
    expect(textByPath.get(scopedPaths[0])).toContain(
      "development styleやcase-driven modelへ混ぜない",
    );
    expect(joined).not.toContain("Design HARNESS development style");
  });

  it("AUTH-REQ-U-005: current layer pairs are L1-L12 only", () => {
    expect(joined).toContain("L1↔L12");
    expect(joined).toContain("L2↔L11");
    expect(joined).toContain("L3↔L10");
    expect(joined).not.toContain("L1↔L14");
    expect(joined).not.toContain("L0-L14 設計書ツリー");
  });

  it("AUTH-REQ-U-006: Bun is historical detection-only and never a current command", () => {
    for (const forbidden of ["bun run ", "TypeScript/Bun first", "Bun→Node移行中"]) {
      expect(joined).not.toContain(forbidden);
    }
    expect(joined).toContain("Node/npm");
    expect(joined).toContain("historical");
    expect(joined).toContain(
      "active source/import/command/script/test/package/lockfile/CI/hook/template/setup/distribution",
    );
    expect(joined).toContain("Bun commandはcurrent outputとして禁止する");
  });

  it("AUTH-REQ-U-007: old taxonomy cannot drive current output", () => {
    expect(textByPath.get(scopedPaths[4])).toContain(
      "旧`PRODUCTION_SCRUM_REDUCED_V`と`DISCOVERY_POC`はmigration artifactのcompatibility inputに限り、\n  current output、decision、review receipt、DB current projection、completion evidenceへ出力しない",
    );
    for (const path of scopedPaths.slice(0, 4)) {
      expect(textByPath.get(path), path).not.toContain("PRODUCTION_SCRUM_REDUCED_V");
      expect(textByPath.get(path), path).not.toContain("DISCOVERY_POC");
    }
  });

  it("AUTH-REQ-U-008: PLAN binds the atomic contract", () => {
    expect(plan).toContain("behavior_contract_id: AUTH-SURFACE-REQUIREMENT-001");
    expect(plan).toContain("responsibility_owner: development-model-requirement-projection");
    expect(plan).toContain("github_issue_id: 252");
  });
});
