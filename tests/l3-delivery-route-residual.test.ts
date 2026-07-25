import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = readFileSync("docs/governance/helix-harness-requirements_v1.3.md", "utf8");
const github = readFileSync(
  "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
  "utf8",
);
const requirements = readFileSync(
  "docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md",
  "utf8",
);
const acceptance = readFileSync(
  "docs/test-design/helix/l12-scrum-rebaseline-acceptance.md",
  "utf8",
);

describe("L3 delivery route residual closure", () => {
  it("U-L3ROUTE-001: canonical output has four routes and keeps reduced-V as input compatibility only", () => {
    for (const text of [root, github]) {
      expect(text).toContain("`FULL_L1_L12_V`");
      expect(text).toContain("`PRODUCTION_SCRUM`");
      expect(text).toContain("`V_DESIGN_SCRUM_IMPLEMENTATION`");
      expect(text).toContain("`DISCOVERY_POC`");
    }
    expect(root).toContain("旧入力名`PRODUCTION_SCRUM_REDUCED_V`");
    expect(github).toContain("旧`PRODUCTION_SCRUM_REDUCED_V`は入力互換のみ");
  });

  it("U-L3ROUTE-002: L3 requirement and L10 acceptance pairs are complete on 001..014 and 001..022", () => {
    const frs = [...requirements.matchAll(/\| (L12R-FR-\d{3}) \|/g)].map((row) => row[1]);
    const acs = [...acceptance.matchAll(/\| (L12R-AC-\d{3}) \|/g)].map((row) => row[1]);
    expect(frs).toEqual(
      Array.from({ length: 14 }, (_, index) => `L12R-FR-${String(index + 1).padStart(3, "0")}`),
    );
    expect(acs).toEqual(
      Array.from({ length: 22 }, (_, index) => `L12R-AC-${String(index + 1).padStart(3, "0")}`),
    );
  });

  it("U-L3ROUTE-003: production routes share approval and fail closed on semantic change", () => {
    expect(root).toContain("全production routeはL1〜L3とユーザー要件承認を共通必須");
    expect(requirements).toContain(
      "L3後slice化=Production Scrum、L5後slice化=Hybrid、slice化なし=Forward",
    );
    expect(requirements).toContain("意味変更時はRedesignのL1〜L3承認を先行");
    expect(acceptance).toContain("unknownのScrum側判定");
  });
});
