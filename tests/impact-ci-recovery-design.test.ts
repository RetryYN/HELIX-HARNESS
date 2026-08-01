import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const planPath = "docs/plans/PLAN-L4-58-impact-ci-recovery.md";
const designPath = "docs/design/helix/L4-basic-design/impact-ci-recovery.md";
const testDesignPath = "docs/test-design/helix/L9-impact-ci-recovery-system-test-design.md";

describe("GH-AC-017 Impact CI L4/L9 pair closure", () => {
  const plan = readFileSync(planPath, "utf8");
  const design = readFileSync(designPath, "utf8");
  const testDesign = readFileSync(testDesignPath, "utf8");

  it("ST-IMPACTCI-DESIGN-001: L3Q-PC-038とL4/L9 pairを一意に束縛する", () => {
    for (const source of [design, testDesign]) {
      expect(source).toContain("queue_id: L3Q-PC-038");
    }
    expect(plan).toContain("behavior_contract_id: GH-AC-017");
    expect(plan).toContain("responsibility_owner: impact-ci-recovery");
    expect(plan).toContain(
      "pair_artifact: docs/test-design/helix/L9-impact-ci-recovery-system-test-design.md",
    );
    expect(testDesign).toContain(
      "pair_artifact: docs/design/helix/L4-basic-design/impact-ci-recovery.md",
    );
  });

  it("ST-IMPACTCI-DESIGN-002: component authorityを5責務へ分離する", () => {
    for (const component of [
      "ChangeImpactResolver",
      "VerificationInventory",
      "CiProfilePlanner",
      "CiReceiptRecorder",
      "PerformanceRecoveryClassifier",
    ]) {
      expect(design, component).toContain(component);
    }
    expect(design).toContain("read-after-GitHub");
    expect(design).toContain("append-only");
    expect(design).toContain("proposal-only");
  });

  it("ST-IMPACTCI-DESIGN-003: profileとinventory partitionをexactにする", () => {
    const profileBlock = design.match(/type CiProfile = ([^;]+);/u)?.[1] ?? "";
    const profiles = [...profileBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    expect(profiles).toEqual([
      "draft_preflight",
      "candidate_admission",
      "post_merge_full",
      "nightly_full",
    ]);
    expect(design).toContain("disjoint partition");
    expect(design).toContain("和集合はinventory exact setと一致する");
    expect(design).toContain("最初のterminal receiptへexactly once接続");
  });

  it("ST-IMPACTCI-DESIGN-004: unknown/high-riskをfullへfail-closeする", () => {
    for (const risk of [
      "selector自身",
      "security",
      "permission",
      "secret",
      "schema",
      "migration",
      "rollback",
      "DB checkpoint",
      "authority root",
      "unknown impact",
    ]) {
      expect(design, risk).toContain(risk);
    }
    expect(testDesign).toContain("推測selected集合を返さない");
    expect(testDesign).toContain("targetedだけでcandidate terminalへ進まない");
  });

  it("ST-IMPACTCI-DESIGN-005: correctnessとperformanceを分離し縮退改善を拒否する", () => {
    expect(design).toContain("性能判定はcorrectness判定と");
    expect(design).toContain("別receipt");
    expect(design).toContain("inventory非縮退digest");
    for (const mutation of ["test除外", "閾値緩和", "timeout延長", "`continue-on-error`"]) {
      expect(testDesign, mutation).toContain(mutation);
    }
    expect(testDesign).toContain("merge correctnessはgreen");
  });

  it("ST-IMPACTCI-DESIGN-006: L9 oracle 9件をexactで持つ", () => {
    const ids = [...testDesign.matchAll(/ST-IMPACTCI-\d{3}/g)].map((match) => match[0]);
    expect(ids).toEqual([
      "ST-IMPACTCI-001",
      "ST-IMPACTCI-002",
      "ST-IMPACTCI-003",
      "ST-IMPACTCI-004",
      "ST-IMPACTCI-005",
      "ST-IMPACTCI-006",
      "ST-IMPACTCI-007",
      "ST-IMPACTCI-008",
      "ST-IMPACTCI-009",
    ]);
    expect(testDesign).toContain("L5/L8");
    expect(testDesign).toContain("L6/L7");
    expect(testDesign).toContain("本pairの完了証拠に数えない");
  });
});
