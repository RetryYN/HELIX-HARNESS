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
    ]);
  });

  it("AUTH-REQ-U-002: declares all three peer development styles", () => {
    for (const style of styles) {
      expect(joined).toContain(style);
    }
    expect(joined).toContain("同列");
    expect(joined).toContain("development style");
  });

  it("AUTH-REQ-U-003: keeps case-driven models outside Scrum", () => {
    expect(joined).toMatch(/Discovery[／/]PoC.{0,100}(別軸|case-driven)/s);
    expect(joined).toMatch(/Scrum.{0,100}(非内包|内包しない)/s);
    expect(joined).not.toContain("Scrum S-phase");
    expect(joined).not.toContain("Scrum / PoC / sprint backlog");
  });

  it("AUTH-REQ-U-004: keeps Design HARNESS on the specialist axis", () => {
    expect(joined).toMatch(/Design HARNESS.{0,100}(specialist|専門)/s);
    expect(joined).toContain("specialist capability");
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
    expect(joined).toContain("compatibility input");
    expect(joined).toMatch(/current.{0,100}(生成|output)/s);
    expect(joined).toMatch(/(使わない|禁止|混在させない)/);
  });

  it("AUTH-REQ-U-008: PLAN binds the atomic contract", () => {
    expect(plan).toContain("behavior_contract_id: AUTH-SURFACE-REQUIREMENT-001");
    expect(plan).toContain("responsibility_owner: development-model-requirement-projection");
    expect(plan).toContain("github_issue_id: 252");
  });
});
