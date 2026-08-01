import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const planPath = "docs/plans/PLAN-L5-85-atomic-slice-admission.md";
const designPath = "docs/design/helix/L5-detail/atomic-slice-admission.md";
const testDesignPath = "docs/test-design/helix/L8-atomic-slice-admission-unit-test-design.md";

const plan = readFileSync(planPath, "utf8");
const design = readFileSync(designPath, "utf8");
const testDesign = readFileSync(testDesignPath, "utf8");

describe("PLAN-L5-85 Atomic Slice Admission detail-design pair", () => {
  it("U-ATOMIC-DESIGN-001: L3Q-PC-037と唯一のcontract/ownerへ束縛する", () => {
    expect(plan).toContain("queue_id: L3Q-PC-037");
    expect(plan).toContain("behavior_contract_id: GH-AC-035");
    expect(plan).toContain("responsibility_owner: atomic-slice-admission");
    expect(design).toContain("queue_id: L3Q-PC-037");
    expect(testDesign).toContain("queue_id: L3Q-PC-037");
  });

  it("U-ATOMIC-DESIGN-002: L5/L8 pairを相互参照しL6/L7二重ownershipを拒否する", () => {
    expect(plan).toContain(`pair_artifact: ${testDesignPath}`);
    expect(design).toContain(`pair_artifact: ${testDesignPath}`);
    expect(testDesign).toContain(`pair_artifact: ${designPath}`);
    expect(design).toContain("本L5設計とL8 test designをL6/L7 PLANのpair artifactとして再所有してはならない");
  });

  it("U-ATOMIC-DESIGN-003: canonical型・純粋関数・failure precedenceを固定する", () => {
    for (const marker of [
      "interface AtomicSliceSnapshot",
      "interface ScopeExpansionReceipt",
      "interface AtomicSliceDecision",
      "canonicalizeAtomicSliceSnapshot",
      "validateScopeExpansion",
      "evaluateAtomicSlice",
      "failure precedence",
      "schema version付きcanonical JSONのSHA-256",
      "type NoCodeDecision",
      "type CurrentBlockerConcern",
      '"no_code_order_violation"',
      '"current_blocker_deferred"',
    ]) {
      expect(design).toContain(marker);
    }
  });

  it("U-ATOMIC-DESIGN-004: exact set・stale・独立scope expansionをfail-closeする", () => {
    for (const marker of [
      "双方向exact比較",
      "author runtimeと異なるreviewer runtime",
      "actual minus expectedとexact一致",
      "event payloadでcurrent snapshotを補完しない",
      "`split_required`を維持する",
    ]) {
      expect(design).toContain(marker);
    }
  });

  it("U-ATOMIC-DESIGN-005: L9 12件を反証可能なL8 oracleへ降下する", () => {
    for (let index = 1; index <= 13; index += 1) {
      expect(testDesign).toContain(`U-ATOMIC-${String(index).padStart(3, "0")}`);
    }
    for (let index = 1; index <= 12; index += 1) {
      expect(testDesign).toContain(`ST-ATOMIC-${String(index).padStart(3, "0")}`);
    }
  });

  const unitOracleIds = [
    "U-ATOMIC-001",
    "U-ATOMIC-002",
    "U-ATOMIC-003",
    "U-ATOMIC-004",
    "U-ATOMIC-005",
    "U-ATOMIC-006",
    "U-ATOMIC-007",
    "U-ATOMIC-008",
    "U-ATOMIC-009",
    "U-ATOMIC-010",
    "U-ATOMIC-011",
    "U-ATOMIC-012",
    "U-ATOMIC-013",
  ] as const;
  const unitOracleRows = unitOracleIds.map((oracleId) => {
    const row = testDesign
      .split(/\r?\n/)
      .find((line) => line.startsWith(`| ${oracleId} |`));
    return { oracleId, row };
  });

  it.each(unitOracleRows)(
    "$oracleId: confirmed L8 oracleは正例・反例・L9 traceを持つ",
    ({ oracleId, row }) => {
      expect(row, `${oracleId} table row`).toBeDefined();
      const cells = row?.split("|").map((cell) => cell.trim()) ?? [];
      expect(cells[2], `${oracleId} positive oracle`).not.toBe("");
      expect(cells[3], `${oracleId} negative/mutation oracle`).toMatch(/拒否|fail|red|不採用/);
      expect(cells[4], `${oracleId} L9 trace`).toMatch(/ST-ATOMIC-\d{3}/);
    },
  );

  it("U-ATOMIC-DESIGN-006: 設計refactorを測定可能にし縮退を拒否する", () => {
    for (const marker of [
      "candidate-admission p95",
      "new_component_count",
      "new_state_count",
      "new_persistence_surface_count",
      "production_loc_delta",
      "timeout延長",
      "test除外",
    ]) {
      expect(design).toContain(marker);
    }
  });

  it("U-ATOMIC-DESIGN-007: no-code先行評価と重大findingのcurrent blocker分類をL5へ降ろす", () => {
    for (const marker of [
      "no_change -> delete -> configure -> reuse -> modify -> add_code",
      "先行5候補の不採用evidence digest",
      "security、data loss、correctness、authority drift",
      "`successor_improvement`へ送る入力を拒否する",
    ]) {
      expect(design).toContain(marker);
    }
  });
});
