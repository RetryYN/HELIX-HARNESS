import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const planPath = "docs/plans/PLAN-L5-84-impact-ci-recovery.md";
const designPath = "docs/design/helix/L5-detail/impact-ci-recovery.md";
const testDesignPath = "docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md";

describe("GH-AC-017 Impact CI L5/L8 pair closure", () => {
  const plan = readFileSync(planPath, "utf8");
  const design = readFileSync(designPath, "utf8");
  const testDesign = readFileSync(testDesignPath, "utf8");

  it("U-IMPACTCI-DESIGN-001: L3Q-PC-039とL5/L8 pairを一意に束縛する", () => {
    for (const source of [design, testDesign]) expect(source).toContain("queue_id: L3Q-PC-039");
    expect(plan).toContain("behavior_contract_id: GH-AC-017");
    expect(plan).toContain("responsibility_owner: impact-ci-recovery");
    expect(plan).toContain("parent: docs/plans/PLAN-L4-58-impact-ci-recovery.md");
    expect(plan).toContain(
      "pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md",
    );
    expect(testDesign).toContain(
      "pair_artifact: docs/design/helix/L5-detail/impact-ci-recovery.md",
    );
  });

  it("U-IMPACTCI-DESIGN-002: 値オブジェクトとcanonical化を実装可能に固定する", () => {
    for (const typeName of [
      "PrSnapshot",
      "VerificationItem",
      "ImpactDecision",
      "CiItemResult",
      "CiProfileReceipt",
    ]) {
      expect(design, typeName).toContain(`interface ${typeName}`);
    }
    expect(design).toContain("argv exact配列");
    expect(design).toContain("bytewise lexicographic sort");
    expect(design).toContain("canonical JSONのSHA-256");
  });

  it("U-IMPACTCI-DESIGN-003: selector順序とexact partitionを固定する", () => {
    for (const step of [
      "profileのmandatory item",
      "changed pathをrelation graph",
      "`generates`／`requires`／`pair_artifact`",
      "risk tagを評価",
      "inventory全件をselected",
      "交差0かつ和集合がinventory exact set",
    ]) {
      expect(design, step).toContain(step);
    }
    expect(design).toContain("known_no_consumer");
    expect(design).toContain("unknownとしてfullへ倒す");
  });

  it("U-IMPACTCI-DESIGN-004: stale・high-risk・receipt・回収failureをfail-closeする", () => {
    for (const failure of [
      "invalid_inventory",
      "stale_snapshot",
      "unknown_impact",
      "partition_mismatch",
      "receipt_binding_mismatch",
      "recovery_missing",
      "performance_budget_exceeded",
    ]) {
      expect(design, failure).toContain(failure);
    }
    expect(design).toContain("read-after-GitHub");
    expect(design).toContain("最初のterminal linkを置換しない");
  });

  it("U-IMPACTCI-DESIGN-005: 過剰実装を避けL6/L7境界へ送る", () => {
    expect(design).toContain("src/runtime/impact-ci.ts");
    expect(design).toContain("componentごとの\nfile分割は行わず");
    for (const deferred of [
      "実コード",
      "workflow dispatch",
      "GitHub API取得",
      "parallel worker数",
      "cache方式",
    ]) {
      expect(design, deferred).toContain(deferred);
    }
    expect(plan).toContain("L6/L7実装、workflow、cache、parallel workerを追加しない");
  });

  it("U-IMPACTCI-DESIGN-006: L8 oracle 12件をexactで持つ", () => {
    const ids = [...testDesign.matchAll(/U-IMPACTCI-\d{3}/g)].map((match) => match[0]);
    expect(ids).toEqual(
      Array.from({ length: 12 }, (_, index) => `U-IMPACTCI-${String(index + 1).padStart(3, "0")}`),
    );
    expect(testDesign).toContain("runtime test citationは`L3Q-IT-024`までpending");
    for (const mutation of [
      "mandatory itemを1件削除",
      "risk tagを1件known-lowへ落とす",
      "deferred itemを捨てる",
      "event payloadをcurrent bodyより",
      "terminal linkを上書き",
      "cold/warmを合算",
    ]) {
      expect(testDesign, mutation).toContain(mutation);
    }
  });
});
