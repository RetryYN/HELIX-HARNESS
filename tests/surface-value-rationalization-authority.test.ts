import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementsPath = "docs/governance/candidates/surface-value-rationalization-requirements.md";
const acceptancePath = "docs/governance/candidates/surface-value-rationalization-acceptance.md";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("PLAN-L3-1382 surface value rationalization authority", () => {
  it("U-SVR-001: L3 requirements and L10 acceptance keep an exact 12-pair contract", () => {
    const requirements = read(requirementsPath);
    const acceptance = read(acceptancePath);
    const requirementIds = [...requirements.matchAll(/`(SVR-R-\d{2})`/g)].map(([, id]) => id);
    const acceptancePairs = [...acceptance.matchAll(/`SVR-AC-\d{3}` \| `(SVR-R-\d{2})`/g)].map(
      ([, id]) => id,
    );

    expect([...new Set(requirementIds)]).toEqual(
      Array.from({ length: 12 }, (_, index) => `SVR-R-${String(index + 1).padStart(2, "0")}`),
    );
    expect(acceptancePairs).toEqual([...new Set(requirementIds)]);
  });

  it("U-SVR-002: early retirement and direct Issue-to-IR admission stay forbidden", () => {
    const requirements = read(requirementsPath);
    const acceptance = read(acceptancePath);

    expect(requirements).toContain("successor E2E、consumer migration、rollback成立後");
    expect(requirements).toContain("Issue proseから直接IRへ収載しない");
    expect(acceptance).toContain("effect evidence欠落、利用0、観測期間0");
    expect(acceptance).toContain(
      "provider内部review receiptを独立reviewまたはmerge admissionへ差し替えたfixtureを拒否",
    );
  });
});
