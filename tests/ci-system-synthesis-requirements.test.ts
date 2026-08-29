import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath = "docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md";
const acceptancePath = "docs/test-design/helix/ci-system-synthesis-acceptance.md";
const planPath = "docs/plans/PLAN-L3-73-ci-system-synthesis.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const plan = readFileSync(planPath, "utf8");

describe("CI System Synthesis requirements", () => {
  it("L3とL10を同じdraft PLANとpairへ束縛する", () => {
    expect(requirement).toContain("plan: PLAN-L3-73-ci-system-synthesis");
    expect(acceptance).toContain("plan: PLAN-L3-73-ci-system-synthesis");
    expect(requirement).toContain(`pair_artifact: ${acceptancePath}`);
    expect(acceptance).toContain(`pair_artifact: ${requirementPath}`);
    expect(plan).toMatch(/^status: draft$/m);
    expect(requirement).toMatch(/^status: draft$/m);
    expect(acceptance).toMatch(/^status: draft$/m);
    expect(plan).toContain("completion_claim_allowed: false");
  });

  it("5 FR／15 R／15 ACのexact setを閉じる", () => {
    for (let index = 1; index <= 5; index += 1) {
      expect(requirement).toContain(`CIS-FR-${String(index).padStart(3, "0")}`);
    }
    for (let index = 1; index <= 15; index += 1) {
      expect(requirement).toContain(`CIS-R-${String(index).padStart(2, "0")}`);
      expect(acceptance).toContain(`CIS-AC-${String(index).padStart(3, "0")}`);
    }
    expect(requirement.match(/^## CIS-FR-\d{3}/gm)).toHaveLength(5);
    expect(requirement.match(/^#### CIS-R-\d{2}/gm)).toHaveLength(15);
    expect(acceptance.match(/^\| `CIS-AC-\d{3}`/gm)).toHaveLength(15);
  });

  it("選定、配置、回収の責務を混同しない", () => {
    expect(requirement).toContain("schedulerはrequired obligationを変更せず");
    expect(requirement).toContain("exactly one profile");
    expect(requirement).toContain("typed Verification Plan");
    expect(requirement).toContain("新しいworkflow route");
  });

  it("unsafeな高速化をnegative oracleへ固定する", () => {
    for (const forbiddenShortcut of [
      "required test削除",
      "timeout緩和",
      "risk downgrade",
      "時間短縮単独を成功にしない",
    ]) {
      expect(`${requirement}\n${acceptance}`).toContain(forbiddenShortcut);
    }
  });

  it("5 childへ責務をexactに割り当てる", () => {
    for (const issue of [1204, 1205, 1206, 1207, 1208]) {
      expect(requirement).toContain(`#${issue}`);
      expect(plan).toContain(`issue:${issue}`);
    }
  });
});
