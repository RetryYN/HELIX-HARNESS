import { describe, expect, it } from "vitest";
import { projectVisualizationEvidence } from "../src/state-db/visualization-evidence";

// PLAN-L7-450-state-db-vscode-decoupling / U-SBOUND-001

describe("projectVisualizationEvidence", () => {
  it("U-SBOUND-001: presentation-free tree summaryからDB rowを決定論的に作る", () => {
    expect(
      projectVisualizationEvidence(
        {
          schema_version: "visualization-tree-view.v1",
          source_clock: null,
          root_ids: ["harness", "project"],
          root_count: 2,
          node_count: 7,
          warnings_count: 1,
          snapshot_hash: "sha256:tree",
        },
        "2026-07-14T00:00:00.000Z",
      ),
    ).toStrictEqual({
      tree_view_id: "visualization-tree-view:latest",
      schema_version: "visualization-tree-view.v1",
      source_clock: "",
      root_ids: "harness,project",
      root_count: 2,
      node_count: 7,
      warnings_count: 1,
      snapshot_hash: "sha256:tree",
      indexed_at: "2026-07-14T00:00:00.000Z",
    });
  });
});
