import { describe, expect, it } from "vitest";
import { computeTraceClosure, validateRegistryGraph } from "../src/design/design-registry";
import {
  buildDeclaration,
  FULL_CHAIN_EDGES,
  FULL_CHAIN_NODES,
} from "./tools/design-registry-fixture";

// PLAN-L7-516-design-registry-core: Design Registry slice1。L8テスト設計 U-DRG-003 行を機械検査する。

function graphOf(
  nodes = FULL_CHAIN_NODES,
  edges = FULL_CHAIN_EDGES,
): Parameters<typeof computeTraceClosure>[0] {
  const graph = validateRegistryGraph(buildDeclaration(nodes, edges));
  if (!graph.ok) throw new Error(`fixture graph must validate: ${JSON.stringify(graph.failures)}`);
  return graph.value;
}

describe("design-registry trace closure (PLAN-L7-516)", () => {
  it("U-DRG-003: 完備chainはclosed、1 edge欠落はorphan全列挙、stale chainはclosedへ算入しない", () => {
    const closed = computeTraceClosure(graphOf());
    expect(closed.ok, JSON.stringify(closed)).toBe(true);
    if (closed.ok) {
      expect(closed.value.closed_requirement_ids).toEqual(["VDH-FR-001"]);
      expect(closed.value.orphan_entity_ids).toEqual([]);
    }

    // 1 edge（permission→command）欠落 → DRG_CHAIN_ORPHAN で break 点を列挙（mutation:
    // orphan 列挙を外す・空配列に置換すると red）
    const brokenEdges = FULL_CHAIN_EDGES.filter(
      (edge) => !(edge.from_entity_id === "SVC-approve-permission" && edge.relation === "invokes"),
    );
    const broken = computeTraceClosure(graphOf(FULL_CHAIN_NODES, brokenEdges));
    expect(broken.ok).toBe(false);
    if (!broken.ok) {
      expect(broken.failures.every((f) => f.code === "DRG_CHAIN_ORPHAN")).toBe(true);
      expect(broken.failures.length).toBeGreaterThan(0);
    }

    // stale entity（api service）を含む chain は closed に算入しない（mutation: stale 遮断を
    // 外して canonical と同扱いにすると red）
    const staleNodes = FULL_CHAIN_NODES.map((node) =>
      node.entity_id === "SVC-approve-api" ? { ...node, authority: "stale" } : node,
    );
    const stale = computeTraceClosure(graphOf(staleNodes, FULL_CHAIN_EDGES));
    expect(stale.ok).toBe(false);
    if (!stale.ok) {
      expect(stale.failures.some((f) => f.code === "DRG_CHAIN_ORPHAN")).toBe(true);
    }

    // 起点 requirement 自身が stale の場合も静かな green にせず fail-close（review round1
    // Important-2: seed の isTraversable 検査を外す mutation はこの fixture が red で kill）
    const staleRootNodes = FULL_CHAIN_NODES.map((node) =>
      node.entity_id === "VDH-FR-001" ? { ...node, authority: "stale" } : node,
    );
    const staleRoot = computeTraceClosure(graphOf(staleRootNodes, FULL_CHAIN_EDGES));
    expect(staleRoot.ok).toBe(false);
    if (!staleRoot.ok) {
      expect(staleRoot.failures.every((f) => f.code === "DRG_CHAIN_ORPHAN")).toBe(true);
    }

    // 決定性: 同一 graph の 2 回実行は deep-equal
    expect(computeTraceClosure(graphOf())).toEqual(computeTraceClosure(graphOf()));
  });
});
