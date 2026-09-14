import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string): string => readFileSync(path, "utf8");

describe("管理Scrumとproduct Forwardの入口分離", () => {
  it("U-MSPF-001: [PLAN-RECOVERY-1737-management-scrum-product-forward/U-MSPF-001] adapter正本を揃える", () => {
    for (const path of ["AGENTS.md", "CLAUDE.md"]) {
      const source = read(path);
      expect(source).toContain("管理側");
      expect(source).toContain("Scrum Reverse");
      expect(source).toContain("product");
      expect(source).toContain("read-side projection");
    }
  });

  it("U-MSPF-002: [PLAN-RECOVERY-1737-management-scrum-product-forward/U-MSPF-002] governance read orderへ登録する", () => {
    expect(read("docs/governance/README.md")).toContain("management-scrum-product-forward.md");
  });

  it("U-MSPF-003: [PLAN-RECOVERY-1737-management-scrum-product-forward/U-MSPF-003] 管理見落としの最小契約を固定する", () => {
    const template = read(".github/ISSUE_TEMPLATE/management-gap.md");
    for (const heading of [
      "観測",
      "影響範囲",
      "再発回数",
      "提案するgate／checklist",
      "Scrum段階",
      "Scrum Reverse先",
    ])
      expect(template).toContain(`## ${heading}`);
    expect(template).toContain("parent_issue: 1737");
  });

  it("U-MSPF-004: [PLAN-RECOVERY-1737-management-scrum-product-forward/U-MSPF-004] projectionを意味正本へ昇格させない", () => {
    const governance = read("docs/governance/management-scrum-product-forward.md");
    expect(governance).toContain("再構築可能なread-side projection");
    expect(governance).toContain("逆書込みしない");
    expect(governance).toContain("admitted event／receiptは実行事実");
  });
});
