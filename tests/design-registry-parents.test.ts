import { describe, expect, it } from "vitest";
import { validateParentGraph, validateRegistryGraph } from "../src/design/design-registry";
import {
  buildDeclaration,
  FULL_CHAIN_EDGES,
  FULL_CHAIN_NODES,
} from "./tools/design-registry-fixture";

// PLAN-L7-516-design-registry-core: Design Registry slice1。L8テスト設計 U-DRG-004 行を機械検査する。

function graphOf(edges = FULL_CHAIN_EDGES): Parameters<typeof validateParentGraph>[0] {
  const graph = validateRegistryGraph(buildDeclaration(FULL_CHAIN_NODES, edges));
  if (!graph.ok) throw new Error(`fixture graph must validate: ${JSON.stringify(graph.failures)}`);
  return graph.value;
}

describe("design-registry parent graph (PLAN-L7-516)", () => {
  it("U-DRG-004: SCR/FLW/INTの両親原子到達とuser_taskの4原子保持の喪失をDRG_PARENT_LOSTにする", () => {
    const green = validateParentGraph(graphOf());
    expect(green.ok, JSON.stringify(green)).toBe(true);
    if (green.ok) {
      expect(green.value.covered_entity_ids).toContain("SCR-pm-01");
      expect(green.value.covered_entity_ids).toContain("INT-approve-click");
    }

    // screen から business_outcome への parents 欠落 = DRG_PARENT_LOST（mutation: 両原子
    // 到達判定の片側を外すと red）
    const noOutcome = FULL_CHAIN_EDGES.filter(
      (edge) =>
        !(
          edge.from_entity_id === "SCR-pm-01" &&
          edge.to_entity_id === "VDH-FR-003" &&
          edge.relation === "parents"
        ),
    );
    const lostOutcome = validateParentGraph(graphOf(noOutcome));
    expect(lostOutcome.ok).toBe(false);
    if (!lostOutcome.ok) {
      expect(lostOutcome.failures.every((f) => f.code === "DRG_PARENT_LOST")).toBe(true);
    }

    // interaction から user_task への parents 欠落も DRG_PARENT_LOST
    const noUserTask = FULL_CHAIN_EDGES.filter(
      (edge) =>
        !(
          edge.from_entity_id === "INT-approve-click" &&
          edge.to_entity_id === "VDH-FR-002" &&
          edge.relation === "parents"
        ),
    );
    expect(validateParentGraph(graphOf(noUserTask)).ok).toBe(false);

    // user_task 原子から decision_rationale 原子の喪失 = DRG_PARENT_LOST（HR-FR-DHR-006 の
    // 6 原子被覆。mutation: 4 原子判定から 1 原子を外すと red）
    const noRationale = FULL_CHAIN_EDGES.filter(
      (edge) => !(edge.from_entity_id === "VDH-FR-002" && edge.to_entity_id === "VDH-FR-007"),
    );
    const lostRationale = validateParentGraph(graphOf(noRationale));
    expect(lostRationale.ok).toBe(false);
    if (!lostRationale.ok) {
      expect(lostRationale.failures.every((f) => f.code === "DRG_PARENT_LOST")).toBe(true);
    }
  });
});
