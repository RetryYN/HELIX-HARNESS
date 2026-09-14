import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirements = readFileSync(
  "docs/design/helix/L3-requirements/github-security-admission-requirements.md",
  "utf8",
);
const acceptance = readFileSync(
  "docs/test-design/helix/github-security-admission-system-test-design.md",
  "utf8",
);
const plan = readFileSync("docs/plans/PLAN-L3-52-github-security-admission.md", "utf8");
const canonical = readFileSync("docs/governance/helix-harness-requirements_v1.3.md", "utf8");

describe("L3 GitHub security evidence admission", () => {
  it("binds one behavior contract and one responsibility owner to L3/L10", () => {
    expect(plan).toContain("behavior_contract_id: GH-FR-029");
    expect(plan).toContain("responsibility_owner: github-security-admission");
    expect(requirements).toContain("### GH-FR-029 セキュリティ証拠受入");
    expect(requirements).toContain("`GH-AC-041`");
    expect(acceptance).toContain("`GH-T-041`");
    expect(acceptance).toContain("layer: L10");
    expect(canonical).toContain("`GH-FR-001..029`");
    expect(canonical).toContain("`GH-NFR-009..022`");
  });

  it("separates PR, candidate, and deployment security profiles", () => {
    expect(requirements).toContain("`--diff ... --head ...`");
    expect(requirements).toContain("candidate固定後");
    expect(requirements).toContain("deploy admission");
    expect(requirements).toContain("同一artifact receipt");
  });

  it("fails closed on incomplete evidence and excessive privilege", () => {
    for (const marker of [
      "`partial`／`unknown`",
      "required scanner未設定",
      "期限切れwaiver",
      "credential過剰露出",
      "未pin Action",
      "action-binding human approval",
    ]) {
      expect(`${requirements}\n${acceptance}`).toContain(marker);
    }
  });

  it("keeps scanner output non-authoritative and non-compensating", () => {
    expect(requirements).toContain("個別の正本にせず");
    expect(requirements).toContain("一方のPASSで他方のfindingを");
    expect(acceptance).toContain("別scannerのPASSで");
  });
});
