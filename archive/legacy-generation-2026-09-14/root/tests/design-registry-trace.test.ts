import { describe, expect, it } from "vitest";
import { queryTrace, validateRegistryGraph } from "../src/design/design-registry";
import {
  buildDeclaration,
  FULL_CHAIN_EDGES,
  FULL_CHAIN_NODES,
} from "./tools/design-registry-fixture";

// PLAN-L7-516-design-registry-core: Design Registry slice1。L8テスト設計 U-DRG-005 行を機械検査する。

function graphOf(nodes = FULL_CHAIN_NODES) {
  const graph = validateRegistryGraph(buildDeclaration(nodes, FULL_CHAIN_EDGES));
  if (!graph.ok) throw new Error(`fixture graph must validate: ${JSON.stringify(graph.failures)}`);
  return graph.value;
}

describe("design-registry trace query (PLAN-L7-516)", () => {
  it("U-DRG-005: 双方向traceが決定的同値で、stale経由はstale markつき、未知IDはDRG_ID_INVALID", () => {
    const trace = queryTrace({ graph: graphOf(), entity_id: "INT-approve-click" });
    expect(trace.ok, JSON.stringify(trace)).toBe(true);
    if (trace.ok) {
      const downstreamIds = trace.value.downstream.map((hit) => hit.entity_id);
      const upstreamIds = trace.value.upstream.map((hit) => hit.entity_id);
      expect(downstreamIds).toContain("SVC-approve-api");
      expect(downstreamIds).toContain("VDH-AC-001");
      expect(upstreamIds).toContain("SCR-pm-01");
      expect(upstreamIds).toContain("VDH-FR-001");
      expect(trace.value.downstream.every((hit) => hit.stale_tainted === false)).toBe(true);
    }

    // 決定性: 2 回実行で deep-equal（mutation: sort を外すと red になる入力順を fixture が持つ）
    expect(queryTrace({ graph: graphOf(), entity_id: "INT-approve-click" })).toEqual(
      queryTrace({ graph: graphOf(), entity_id: "INT-approve-click" }),
    );

    // stale entity（command service）を経由する到達は stale mark つきで返る（mutation:
    // stale 伝播を外して false 固定にすると red）
    const staleNodes = FULL_CHAIN_NODES.map((node) =>
      node.entity_id === "SVC-approve-command" ? { ...node, authority: "stale" } : node,
    );
    const staleTrace = queryTrace({ graph: graphOf(staleNodes), entity_id: "INT-approve-click" });
    expect(staleTrace.ok).toBe(true);
    if (staleTrace.ok) {
      const api = staleTrace.value.downstream.find((hit) => hit.entity_id === "SVC-approve-api");
      expect(api?.stale_tainted).toBe(true);
      const permission = staleTrace.value.downstream.find(
        (hit) => hit.entity_id === "SVC-approve-permission",
      );
      expect(permission?.stale_tainted).toBe(false);
    }

    // diamond fan-in（stale 経路とクリーン経路が INT→AEV で合流）は sticky-OR で tainted=true
    // （review round1 Important-3: 1 本でも stale 経由の到達経路があれば mark する。
    // mutation: OR を AND（クリーン経路優先の上書き）へ戻すとこの fixture が red で kill）
    const diamondGraph = validateRegistryGraph(
      buildDeclaration(
        FULL_CHAIN_NODES.map((node) =>
          node.entity_id === "SVC-approve-command" ? { ...node, authority: "stale" } : node,
        ),
        [
          ...FULL_CHAIN_EDGES,
          {
            from_entity_id: "INT-approve-click",
            to_entity_id: "AEV-approve-submitted",
            relation: "measures",
          },
        ],
      ),
    );
    if (!diamondGraph.ok) throw new Error("diamond fixture must validate");
    const diamondTrace = queryTrace({ graph: diamondGraph.value, entity_id: "INT-approve-click" });
    expect(diamondTrace.ok).toBe(true);
    if (diamondTrace.ok) {
      const aev = diamondTrace.value.downstream.find(
        (hit) => hit.entity_id === "AEV-approve-submitted",
      );
      expect(aev?.stale_tainted).toBe(true);
    }

    // 未知 entity_id = DRG_ID_INVALID
    const unknown = queryTrace({ graph: graphOf(), entity_id: "SCR-none" });
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) {
      expect(unknown.failures[0]?.code).toBe("DRG_ID_INVALID");
    }
  });
});
