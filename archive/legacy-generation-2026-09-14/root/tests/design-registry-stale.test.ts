import { describe, expect, it } from "vitest";
import { validateRegistryGraph } from "../src/design/design-registry";
import { markStaleLineage } from "../src/design/design-registry-transaction";
import { buildDeclaration, FULL_CHAIN_EDGES } from "./tools/design-registry-fixture";

// PLAN-L7-517-design-registry-transaction: Design Registry slice2。
// L8テスト設計 U-DRG-007 行を機械検査する。

function graphOf() {
  const graph = validateRegistryGraph(buildDeclaration());
  if (!graph.ok) throw new Error("fixture graph must validate");
  return graph.value;
}

describe("design-registry stale lineage (PLAN-L7-517)", () => {
  it("U-DRG-007: 上流digest差のentityと依存edge/下流entityが同一lineageでstale化し、再送は決定的同値", () => {
    const trigger = {
      schema_version: "design-registry-stale-trigger.v1" as const,
      changed_entity_ids: ["SVC-approve-command"],
      reason: "upstream semantic_digest drift",
    };
    const result = markStaleLineage(graphOf(), trigger);
    expect(result.ok, JSON.stringify(result)).toBe(true);
    if (result.ok) {
      const lineage = result.value;
      expect(lineage.lineage_id).toMatch(/^sha256:[0-9a-f]{64}$/);
      // 起点 + 下流到達 entity が lineage へ算入（mutation: 下流伝播を外すと red）
      expect(lineage.stale_entity_ids).toContain("SVC-approve-command");
      expect(lineage.stale_entity_ids).toContain("SVC-approve-api");
      expect(lineage.stale_entity_ids).toContain("DOM-approval");
      expect(lineage.stale_entity_ids).toContain("AEV-approve-submitted");
      // 上流（screen / interaction）は stale 化しない
      expect(lineage.stale_entity_ids).not.toContain("SCR-pm-01");
      expect(lineage.stale_entity_ids).not.toContain("INT-approve-click");
      // 依存 edge（起点/下流 entity に接続する edge）が同一 lineage で stale
      expect(lineage.stale_edge_ids).toContain(
        "invokes:SVC-approve-permission->SVC-approve-command",
      );
      expect(lineage.stale_edge_ids).toContain("invokes:SVC-approve-command->SVC-approve-api");
      // 決定性: 同一入力再送は deep-equal（mutation: sort/lineage_id 導出を壊すと red）
      expect(markStaleLineage(graphOf(), trigger)).toEqual(result);
    }

    // parents/binds は伝播しない: 画面変更が業務要件を stale 化しない（review round1
    // Critical-4: chain relation 限定を外す mutation はこの fixture が red で kill）
    const screenTrigger = markStaleLineage(graphOf(), {
      schema_version: "design-registry-stale-trigger.v1",
      changed_entity_ids: ["SCR-pm-01"],
      reason: "screen drift",
    });
    expect(screenTrigger.ok).toBe(true);
    if (screenTrigger.ok) {
      expect(screenTrigger.value.stale_entity_ids).not.toContain("VDH-FR-002");
      expect(screenTrigger.value.stale_entity_ids).not.toContain("VDH-FR-003");
      expect(screenTrigger.value.stale_entity_ids).toContain("INT-approve-click");
    }

    // schema_version 不一致は DRG_STALE_INPUT（review round1 Important-2）
    const badSchema = markStaleLineage(graphOf(), {
      schema_version: "design-registry-stale-trigger.v0" as never,
      changed_entity_ids: ["SVC-approve-command"],
      reason: "bad schema",
    });
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("DRG_STALE_INPUT");

    // fan-in（複数経路で同一 entity へ到達）でも重複なく決定的（review round1 Minor-1）
    const fanInGraph = validateRegistryGraph(
      buildDeclaration(undefined, [
        ...FULL_CHAIN_EDGES,
        {
          from_entity_id: "INT-approve-click",
          to_entity_id: "AEV-approve-submitted",
          relation: "measures",
        },
      ]),
    );
    if (!fanInGraph.ok) throw new Error("fan-in graph must validate");
    const fanIn = markStaleLineage(fanInGraph.value, {
      schema_version: "design-registry-stale-trigger.v1",
      changed_entity_ids: ["INT-approve-click"],
      reason: "fan-in",
    });
    expect(fanIn.ok).toBe(true);
    if (fanIn.ok) {
      const unique = new Set(fanIn.value.stale_entity_ids);
      expect(unique.size).toBe(fanIn.value.stale_entity_ids.length);
      expect(fanIn.value.stale_entity_ids).toContain("AEV-approve-submitted");
    }

    // 未知 entity_id = DRG_ID_INVALID で fail-close
    const unknown = markStaleLineage(graphOf(), {
      schema_version: "design-registry-stale-trigger.v1",
      changed_entity_ids: ["SVC-none"],
      reason: "unknown",
    });
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) expect(unknown.failures[0]?.code).toBe("DRG_ID_INVALID");

    // 空 trigger は fail-close（意味のない lineage を発行しない）
    const empty = markStaleLineage(graphOf(), {
      schema_version: "design-registry-stale-trigger.v1",
      changed_entity_ids: [],
      reason: "empty",
    });
    expect(empty.ok).toBe(false);
  });
});
