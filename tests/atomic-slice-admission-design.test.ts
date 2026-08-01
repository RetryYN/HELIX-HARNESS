import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const planPath = "docs/plans/PLAN-L4-59-atomic-slice-admission.md";
const designPath = "docs/design/helix/L4-basic-design/atomic-slice-admission.md";
const testDesignPath = "docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md";

describe("GH-AC-035 Atomic Slice Admission L4/L9 pair closure", () => {
  const plan = readFileSync(planPath, "utf8");
  const design = readFileSync(designPath, "utf8");
  const testDesign = readFileSync(testDesignPath, "utf8");

  it("ST-ATOMIC-DESIGN-001: L3Q-PC-036とL4/L9 pairを一意に束縛する", () => {
    for (const source of [design, testDesign]) expect(source).toContain("queue_id: L3Q-PC-036");
    expect(plan).toContain("behavior_contract_id: GH-AC-035");
    expect(plan).toContain("responsibility_owner: atomic-slice-admission");
    expect(design).toContain("supporting invariant／oracle");
    expect(design).toContain("別behaviorや別responsibility ownerを追加しない");
    expect(plan).toContain(
      "pair_artifact: docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md",
    );
    expect(testDesign).toContain(
      "pair_artifact: docs/design/helix/L4-basic-design/atomic-slice-admission.md",
    );
  });

  it("ST-ATOMIC-DESIGN-002: 既存ownerを再利用して5 componentへ責務分離する", () => {
    for (const component of [
      "SliceIntentResolver",
      "ResponsibilityFootprintResolver",
      "CompanionSetResolver",
      "AtomicSliceAdmissionPolicy",
      "ScopeExpansionAuthority",
    ]) {
      expect(design, component).toContain(component);
    }
    expect(design).toContain("src/lint/github-guards.ts");
    expect(design).toContain("src/lint/ddd-tdd-rules.ts");
    expect(design).toContain("新detectorを追加しない");
    expect(design).toContain("admission専用の永続化componentは作らず");
  });

  it("ST-ATOMIC-DESIGN-003: admission dispositionとstale遷移を閉じる", () => {
    const typeBlock = design.match(/type AdmissionDisposition = ([^;]+);/u)?.[1] ?? "";
    expect([...typeBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1])).toEqual([
      "admitted",
      "split_required",
      "recovery_required",
    ]);
    expect(design).toContain("既存decisionをstale化");
    expect(design).toContain("`split_required`をscope expansionで回避してはならない");
  });

  it("ST-ATOMIC-DESIGN-004: contract／owner／aggregateの複数化を行数に依存せず拒否する", () => {
    expect(design).toContain("exactly-one behavior contract");
    expect(design).toContain("exactly-one responsibility owner");
    expect(design).toContain("行数やファイル数が小さくても");
    expect(testDesign).toContain("行数とpath数にかかわらず`split_required`");
    expect(design).toContain('"pure_function" | "none"');
    expect(design).toContain("形式のためだけにaggregate／classを追加しない");
  });

  it("ST-ATOMIC-DESIGN-005: companionとscope expansionをexact setで検証する", () => {
    expect(design).toContain("required companion exact set");
    expect(design).toContain("expected pathとactual pathは双方向exact一致");
    expect(testDesign).toContain("別contractのcompanionで相殺しない");
    expect(testDesign).toContain("自己承認、別HEAD receipt、理由なし、exact delta不一致");
  });

  it("ST-ATOMIC-DESIGN-006: no-code-firstとblocker／successor境界を固定する", () => {
    expect(design).toContain("no_change -> delete -> configure -> reuse -> modify -> add_code");
    expect(testDesign).toContain("delete／configure／reuse／modifyの不採用証拠");
    expect(design).toContain("security、data loss、correctness、authority drift");
    expect(design).toContain("successor Issueへ分離");
  });

  it("ST-ATOMIC-DESIGN-007: L9 oracle 12件をexactで持つ", () => {
    const ids = [...testDesign.matchAll(/ST-ATOMIC-\d{3}/g)].map((match) => match[0]);
    expect(ids).toEqual([
      "ST-ATOMIC-001",
      "ST-ATOMIC-002",
      "ST-ATOMIC-003",
      "ST-ATOMIC-004",
      "ST-ATOMIC-005",
      "ST-ATOMIC-006",
      "ST-ATOMIC-007",
      "ST-ATOMIC-008",
      "ST-ATOMIC-009",
      "ST-ATOMIC-010",
      "ST-ATOMIC-011",
      "ST-ATOMIC-012",
    ]);
    expect(testDesign).toContain("L5/L8");
    expect(testDesign).toContain("L6/L7");
  });
});
