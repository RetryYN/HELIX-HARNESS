// PLAN-L4-77-cursor-cloud-independent-execution-boundary / 3L-FR-005
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PLAN = "docs/plans/PLAN-L4-77-cursor-cloud-independent-execution-boundary.md";
const L4 = "docs/design/helix/L4-basic-design/cursor-cloud-independent-execution-boundary.md";
const L9 = "docs/test-design/helix/L9-cursor-cloud-independent-execution-boundary.md";

const read = (path: string): string => readFileSync(path, "utf8");

describe("Cursor Cloud第三者実行レーンのL4↔L9境界", () => {
  it("U-CPA-DESIGN-001: PLANとVペアがcanonical pathで相互束縛される", () => {
    const plan = read(PLAN);
    const l4 = read(L4);
    const l9 = read(L9);

    expect(plan).toContain(`pair_artifact: ${L9}`);
    expect(plan).toContain(L4);
    expect(l4).toContain(`plan: ${PLAN}`);
    expect(l4).toContain(`pair_artifact: ${L9}`);
    expect(l9).toContain(`plan: ${PLAN}`);
    expect(l9).toContain(`pair_artifact: ${L4}`);
  });

  it("U-CPA-DESIGN-002: 親子対応を第三者レーンの着手依存へ変換しない", () => {
    const plan = read(PLAN);
    const requires = plan.match(/\n  requires:\n([\s\S]*?)\n  references:/)?.[1] ?? "";

    expect(plan).toContain("その完了を本sliceの着手条件にしない");
    expect(plan).toContain("不足条件のある対象だけを起動不可");
    expect(requires).not.toContain("issue:1358");
    expect(requires).not.toContain("issue:1362");
  });

  it("U-CPA-DESIGN-003: 必要最小条件と独立review返却を同一assignmentへ束縛する", () => {
    const l4 = read(L4);

    for (const required of [
      "IssueまたはPLANの択一scope",
      "同一repository＋branchを全processで排他的に確保",
      "launch直前に外部owner／assignment／base HEADを再取得",
      "output bytesは隔離して検査",
      "blind exact-HEAD独立review",
    ]) {
      expect(l4).toContain(required);
    }
  });

  it("U-CPA-DESIGN-004: L9が14個の反例を欠落なく定義する", () => {
    const l9 = read(L9);
    const ids = [...l9.matchAll(/^\| (IT-CPA-\d{3}) \|/gm)].map((match) => match[1]);

    expect(ids).toEqual(
      Array.from({ length: 14 }, (_, index) => `IT-CPA-${String(index + 1).padStart(3, "0")}`),
    );
  });

  it("U-CPA-DESIGN-005: canonical pairだけをdesign catalogへ登録する", () => {
    const catalog = read("docs/design/design-catalog.yaml");
    const retiredCandidates = [
      "docs/governance/candidates/cursor-phase-a-plan.md",
      "docs/governance/candidates/cursor-phase-a-l4-boundary.md",
      "docs/governance/candidates/cursor-phase-a-l9-integration-oracles.md",
    ];

    expect(catalog).toContain(`- ${L4}`);
    expect(catalog).toContain(`- ${L9}`);
    expect(catalog).not.toContain("docs/governance/candidates/cursor-phase-a-");
    expect(retiredCandidates.filter((path) => existsSync(path))).toEqual([]);
  });

  it("U-CPA-DESIGN-006: 上位requirement 11件を省略せずexact traceする", () => {
    const l4 = read(L4);
    const expected = [
      "3L-R-04",
      "3L-R-05",
      "3L-R-06",
      "3L-R-07",
      "3L-R-08",
      "3L-R-12",
      "3L-R-13",
      "3L-R-14",
      "3L-R-23",
      "3L-R-24",
      "3L-R-25",
    ];
    const traced = l4.match(/機械照合する要求ID[^\n]+/)?.[0].match(/3L-R-\d{2}/g);

    expect(traced).toEqual(expected);
  });
});
