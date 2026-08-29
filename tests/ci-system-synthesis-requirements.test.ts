import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath =
  "docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md";
const acceptancePath = "docs/test-design/helix/ci-system-synthesis-acceptance.md";
const planPath = "docs/plans/PLAN-L3-73-ci-system-synthesis.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const plan = readFileSync(planPath, "utf8");

function exactIds(text: string, pattern: RegExp): string[] {
  return [...new Set(text.match(pattern) ?? [])].sort();
}

const featureIds = Array.from(
  { length: 5 },
  (_, index) => `CIS-FR-${String(index + 1).padStart(3, "0")}`,
);
const requirementIds = Array.from(
  { length: 15 },
  (_, index) => `CIS-R-${String(index + 1).padStart(2, "0")}`,
);
const acceptanceIds = Array.from(
  { length: 15 },
  (_, index) => `CIS-AC-${String(index + 1).padStart(3, "0")}`,
);

describe("CI System Synthesis L3↔L10 authority", () => {
  it("CIS-AUTH-001: L3、L10、PLANを同じpairへ束縛する", () => {
    expect(requirement).toContain("plan: PLAN-L3-73-ci-system-synthesis");
    expect(acceptance).toContain("plan: PLAN-L3-73-ci-system-synthesis");
    expect(requirement).toContain(`pair_artifact: ${acceptancePath}`);
    expect(acceptance).toContain(`pair_artifact: ${requirementPath}`);
    expect(requirement).toMatch(/^status: confirmed$/m);
    expect(acceptance).toMatch(/^status: confirmed$/m);
    expect(plan).toMatch(/^status: confirmed$/m);
  });

  it("CIS-AUTH-002: 5 FR、15 R、15 ACをexact setで閉じる", () => {
    expect(exactIds(requirement, /CIS-FR-\d{3}/gu)).toEqual(featureIds);
    expect(exactIds(requirement, /CIS-R-\d{2}/gu)).toEqual(requirementIds);
    expect(exactIds(acceptance, /CIS-AC-\d{3}/gu)).toEqual(acceptanceIds);
  });

  it("CIS-AUTH-003: 全supporting requirementをL10 oracleへ一対一で束縛する", () => {
    const rows = [...acceptance.matchAll(/^\| `(CIS-AC-\d{3})` \| `(CIS-R-\d{2})` \|/gmu)];
    expect(rows.map((row) => row[1])).toEqual(acceptanceIds);
    expect(rows.map((row) => row[2])).toEqual(requirementIds);
    expect(new Set(rows.map((row) => row[2])).size).toBe(requirementIds.length);
  });

  it("CIS-AUTH-004: 5責務を原子Issueへ割り当てる", () => {
    for (const [offset, featureId] of featureIds.entries()) {
      expect(requirement).toContain(`- #${1204 + offset}: ${featureId}`);
      expect(plan).toContain(`    - issue:${1204 + offset}`);
    }
  });

  it("CIS-AUTH-005: 高速化でverification obligationを縮退させない", () => {
    expect(requirement).toContain("required verificationの削除、timeout緩和、risk downgrade");
    expect(requirement).toContain("schedulerはrequired obligationを変更せず");
    expect(requirement).toContain("terminal obligationをsuccessとして捏造しない");
    expect(acceptance).toContain("testを省略してwall-clockだけ短縮する");
    expect(acceptance).toContain("時間短縮単独を成功にしない");
  });

  it("CIS-AUTH-006: 新route／DB authorityや未承認の外部実行を追加しない", () => {
    expect(requirement).toContain("新しいworkflow route、");
    expect(requirement).toContain("test authority、DB authorityではない");
    expect(requirement).toContain("#188 routing／allocation本体、#819 resident lane");
    expect(requirement).toContain("release publish／cutover");
  });
});
