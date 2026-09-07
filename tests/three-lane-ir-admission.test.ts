import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";
import { requirementIrSemanticDigest } from "../src/requirements/requirement-ir-shadow";
import { validateRequirementRefinement } from "../src/requirements/requirement-refinement-authority";

// PLAN-RECOVERY-1649-three-lane-ir-admission

// Source Feature groupingを独立に固定する。projection実装から期待集合を作らない。
const GROUPS = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11],
  [12, 13, 14, 23, 24, 25],
  [15, 16, 17],
  [18, 19, 20],
  [21, 22],
];
const id = (kind: string, n: number, width: number) =>
  `3L-${kind}-${String(n).padStart(width, "0")}`;
const root = process.cwd();
const ir = loadCanonicalRequirementIrFromShards(root);
const records = ir.refinement_contracts.filter((r) => r.refinement_contract_id.startsWith("3L-"));
const context = {
  repoRoot: root,
  baselineSystemContractIds: new Set(ir.system_contracts.map((r) => r.system_contract_id)),
  currentHead: "b".repeat(40),
  planStatus: "confirmed",
};
function redigest<T extends { semantic_digest: string }>(value: T): T {
  const { semantic_digest: _old, ...body } = value;
  return { ...body, semantic_digest: requirementIrSemanticDigest(body) } as T;
}

describe("three-lane IR material / PLAN-RECOVERY-1649", () => {
  it("U-TLIR-MAT-001: 8 Feature / 25 R / 27 ACを元IDとgroupingのまま保持する", () => {
    expect(records.map((r) => r.refinement_contract_id)).toEqual(
      GROUPS.map((_, i) => id("FR", i + 1, 3)),
    );
    for (const [i, record] of records.entries()) {
      expect(record.contract_requirement).toBeNull();
      expect(record.supporting_requirements.map((r) => r.requirement_id)).toEqual(
        GROUPS[i]?.map((n) => id("R", n, 2)),
      );
      expect(record.plan_id).toBe("PLAN-L3-78-three-lane-cloud-governance-authority");
    }
    expect(records.flatMap((r) => r.acceptance_cases.map((a) => a.acceptance_id)).sort()).toEqual(
      Array.from({ length: 27 }, (_, i) => id("AC", i + 1, 3)),
    );
  });

  it("U-TLIR-MAT-002: 基準4 partitionと既存6 refinementを保持し、specifiedを凍結済みとしない", () => {
    expect([
      ir.requirements.length,
      ir.system_contracts.length,
      ir.acceptance_cases.length,
      ir.system_tests.length,
    ]).toEqual([153, 24, 72, 24]);
    expect(
      ir.refinement_contracts.filter((r) => !r.refinement_contract_id.startsWith("3L-")),
    ).toHaveLength(6);
    expect(records).toHaveLength(8);
    for (const r of records) {
      expect(r.lifecycle_status).toBe("specified");
      expect(r.approval).toBeNull();
      expect(validateRequirementRefinement(r, context)).toEqual({ ok: true, failureCodes: [] });
    }
  });

  it("U-TLIR-MAT-003: source、trace、owner、approvalの欠落を個別拒否する", () => {
    expect(records).toHaveLength(8);
    const source = records[0];
    if (!source) throw new Error("3L-FR-001 material is missing");
    const stale = structuredClone(source);
    stale.source.requirement_digest = `sha256:${"0".repeat(64)}`;
    expect(validateRequirementRefinement(redigest(stale), context).failureCodes).toContain(
      "REFINEMENT_SOURCE_STALE",
    );
    const missing = structuredClone(source);
    missing.acceptance_cases.pop();
    expect(validateRequirementRefinement(redigest(missing), context).ok).toBe(false);
    const owner = structuredClone(source);
    owner.acceptance_owners.pop();
    expect(validateRequirementRefinement(redigest(owner), context).failureCodes).toContain(
      "REFINEMENT_DOWNSTREAM_INCOMPLETE",
    );
    const frozen = structuredClone(source);
    frozen.lifecycle_status = "frozen";
    expect(validateRequirementRefinement(redigest(frozen), context).failureCodes).toContain(
      "REFINEMENT_APPROVAL_MISSING",
    );
    const changed = structuredClone(source);
    const requirement = changed.supporting_requirements[0];
    if (!requirement) throw new Error("3L-R-01 material is missing");
    requirement.statement += "変更";
    changed.supporting_requirements[0] = redigest(requirement);
    expect(validateRequirementRefinement(redigest(changed), context).failureCodes).toContain(
      "REFINEMENT_SOURCE_PROJECTION_DRIFT",
    );
  });

  it("U-TLIR-MAT-004: L10の最後の3 oracleもIRへ入り、27行の表が連続する", () => {
    const text = readFileSync(
      "docs/test-design/helix/three-lane-cloud-governance-acceptance.md",
      "utf8",
    );
    const rowIndexes = text
      .split("\n")
      .flatMap((line, index) => (/^\| `3L-AC-\d{3}` \|/.test(line) ? [index] : []));
    expect(rowIndexes).toHaveLength(27);
    const first = rowIndexes[0];
    const last = rowIndexes.at(-1);
    if (first === undefined || last === undefined) throw new Error("3L AC table is missing");
    expect(last - first).toBe(26);
    expect(
      records
        .flatMap((r) => r.acceptance_cases)
        .filter((a) => /3L-AC-02[567]/.test(a.acceptance_id)),
    ).toHaveLength(3);
  });
});
