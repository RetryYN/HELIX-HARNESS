import { describe, expect, it } from "vitest";
import type { GenericTree } from "../src/schema/visualization-tree-contract";
import { decorateVscodeTree } from "../src/vscode/tree-decoration";

describe("decorateVscodeTree", () => {
  it("U-SBOUND-005: generic treeをVS Code固有fieldへ一度だけdecorateする", () => {
    const tree: GenericTree = {
      schema_version: "generic-visualization-tree.v1",
      source_clock: "2026-07-14T00:00:00.000Z",
      warnings: ["honest degrade"],
      roots: [
        {
          id: "project",
          label: "Project",
          kind: "root",
          expanded: true,
          action: { kind: "copy-pointer", pointer: "helix current-location --json" },
          children: [{ id: "project/current", label: "Current", kind: "section", children: [] }],
        },
      ],
    };

    expect(decorateVscodeTree(tree)).toEqual({
      schema_version: "visualization-tree-view.v1",
      source_clock: "2026-07-14T00:00:00.000Z",
      warnings: ["honest degrade"],
      roots: [
        {
          id: "project",
          label: "Project",
          contextValue: "root",
          collapsibleState: "expanded",
          command: {
            title: "Copy pointer",
            command: "helix.copyPointer",
            arguments: ["helix current-location --summary-json"],
          },
          children: [
            {
              id: "project/current",
              label: "Current",
              contextValue: "section",
              collapsibleState: "none",
              children: [],
            },
          ],
        },
      ],
    });
  });
});
