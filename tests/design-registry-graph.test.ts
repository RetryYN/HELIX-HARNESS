import { describe, expect, it } from "vitest";
import { validateRegistryGraph } from "../src/design/design-registry";
import {
  buildDeclaration,
  FULL_CHAIN_EDGES,
  FULL_CHAIN_NODES,
} from "./tools/design-registry-fixture";

// PLAN-L7-516-design-registry-core: Design Registry slice1。L8テスト設計 U-DRG-002 行を機械検査する。

function failureCodes(result: ReturnType<typeof validateRegistryGraph>): string[] {
  return result.ok ? [] : result.failures.map((f) => f.code);
}

describe("design-registry graph validation (PLAN-L7-516)", () => {
  it("U-DRG-002: 重複ID・片端欠落edge・adjacency表外・permission素通りinvokesをfail-closeする", () => {
    const green = validateRegistryGraph(buildDeclaration());
    expect(green.ok, JSON.stringify(green)).toBe(true);

    // 同一 entity_id の非同値宣言（authority 違い）は dedup されず DRG_DUPLICATE_ID
    const dup = buildDeclaration(
      [...FULL_CHAIN_NODES, { entity_id: "SCR-pm-01", kind: "screen", authority: "shadow" }],
      FULL_CHAIN_EDGES,
    );
    expect(failureCodes(validateRegistryGraph(dup))).toContain("DRG_DUPLICATE_ID");

    // 同一 edge_id（from/to/relation）の authority 違い重複も DRG_DUPLICATE_ID（L5 §2 の
    // (from,to,relation) unique 制約の pure 層先取り。review round1 Important-1）
    const dupEdge = buildDeclaration(FULL_CHAIN_NODES, [
      ...FULL_CHAIN_EDGES,
      {
        from_entity_id: "VDH-FR-001",
        to_entity_id: "SCR-pm-01",
        relation: "decomposes_to",
        authority: "shadow",
      },
    ]);
    expect(failureCodes(validateRegistryGraph(dupEdge))).toContain("DRG_DUPLICATE_ID");

    // 片端が実在しない edge = DRG_EDGE_ORPHAN
    const orphan = buildDeclaration(FULL_CHAIN_NODES, [
      ...FULL_CHAIN_EDGES,
      { from_entity_id: "SCR-pm-99", to_entity_id: "INT-approve-click", relation: "presents" },
    ]);
    expect(failureCodes(validateRegistryGraph(orphan))).toContain("DRG_EDGE_ORPHAN");

    // adjacency 表に無い kind×relation = DRG_RELATION_INVALID
    const invalidRelation = buildDeclaration(FULL_CHAIN_NODES, [
      ...FULL_CHAIN_EDGES,
      { from_entity_id: "SCR-pm-01", to_entity_id: "DOM-approval", relation: "emits" },
    ]);
    expect(failureCodes(validateRegistryGraph(invalidRelation))).toContain("DRG_RELATION_INVALID");

    // permission を経ない invokes 到達 = DRG_UNGUARDED_INVOKE（interaction→command 直結）
    const unguardedDirect = buildDeclaration(FULL_CHAIN_NODES, [
      ...FULL_CHAIN_EDGES,
      {
        from_entity_id: "INT-approve-click",
        to_entity_id: "SVC-approve-command",
        relation: "invokes",
      },
    ]);
    expect(failureCodes(validateRegistryGraph(unguardedDirect))).toContain("DRG_UNGUARDED_INVOKE");

    // command→command / permission→api の段飛ばしも DRG_UNGUARDED_INVOKE
    const skipStage = buildDeclaration(FULL_CHAIN_NODES, [
      ...FULL_CHAIN_EDGES,
      {
        from_entity_id: "SVC-approve-permission",
        to_entity_id: "SVC-approve-api",
        relation: "invokes",
      },
    ]);
    expect(failureCodes(validateRegistryGraph(skipStage))).toContain("DRG_UNGUARDED_INVOKE");

    // service_role の無い service への guarded_by は直列 chain を保証できないため fail-close
    const roleless = buildDeclaration(
      [...FULL_CHAIN_NODES, { entity_id: "SVC-free", kind: "service" }],
      [
        ...FULL_CHAIN_EDGES,
        { from_entity_id: "INT-approve-click", to_entity_id: "SVC-free", relation: "guarded_by" },
      ],
    );
    expect(failureCodes(validateRegistryGraph(roleless))).toContain("DRG_UNGUARDED_INVOKE");

    // chain と無関係な kind からの invokes（requirement→command）は段飛ばしではなく
    // DRG_RELATION_INVALID（review round1 probe4 の誤分類是正）
    const nonsense = buildDeclaration(FULL_CHAIN_NODES, [
      ...FULL_CHAIN_EDGES,
      {
        from_entity_id: "VDH-FR-001",
        to_entity_id: "SVC-approve-command",
        relation: "invokes",
      },
    ]);
    expect(failureCodes(validateRegistryGraph(nonsense))).toContain("DRG_RELATION_INVALID");
  });
});
