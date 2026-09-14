import { describe, expect, it } from "vitest";
import type { GenericTree } from "../src/schema/visualization-tree-contract";
import { type CommandCatalog, decorateVscodeTree } from "../src/vscode/tree-decoration";

// PLAN-L7-450-state-db-vscode-decoupling / U-SBOUND-005

const commands: CommandCatalog = {
  copy_pointer: { title: "Copy pointer", command: "helix.copyPointer" },
};

describe("PLAN-L7-450 / decorateVscodeTree", () => {
  it("U-SBOUND-005: generic treeをVS Code固有fieldへ一度だけdecorateする", () => {
    const tree: GenericTree = {
      schema_version: "generic-visualization-tree.v1",
      source_clock: "2026-07-14T00:00:00.000Z",
      warnings: ["honest degrade"],
      roots: [
        {
          id: "project",
          label: "Project",
          description: undefined,
          tooltip: undefined,
          kind: "root",
          expanded: true,
          action: { kind: "copy-pointer", pointer: "helix current-location --json" },
          children: [{ id: "project/current", label: "Current", kind: "section", children: [] }],
        },
      ],
    };

    expect(decorateVscodeTree(tree, commands)).toStrictEqual({
      schema_version: "visualization-tree-view.v1",
      source_clock: "2026-07-14T00:00:00.000Z",
      warnings: ["honest degrade"],
      roots: [
        {
          id: "project",
          label: "Project",
          description: undefined,
          tooltip: undefined,
          contextValue: "root",
          collapsibleState: "expanded",
          command: {
            title: "Copy pointer",
            command: "helix.copyPointer",
            arguments: ["helix current-location --json"],
          },
          children: [
            {
              id: "project/current",
              label: "Current",
              description: undefined,
              tooltip: undefined,
              contextValue: "section",
              collapsibleState: "none",
              command: undefined,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("unknown actionと空pointerをfail-closeし、catalog commandをそのまま使う", () => {
    const valid: GenericTree = {
      schema_version: "generic-visualization-tree.v1",
      source_clock: null,
      warnings: [],
      roots: [
        {
          id: "project",
          label: "Project",
          kind: "root",
          action: { kind: "copy-pointer", pointer: "helix unknown --json" },
          children: [],
        },
      ],
    };
    expect(
      decorateVscodeTree(valid, { copy_pointer: { title: "Copy", command: "test.copy" } }).roots[0]
        ?.command,
    ).toStrictEqual({ title: "Copy", command: "test.copy", arguments: ["helix unknown --json"] });

    const forged = structuredClone(valid) as GenericTree;
    const forgedRoot = forged.roots[0];
    const validRoot = valid.roots[0];
    if (!forgedRoot || !validRoot) throw new Error("fixture root is missing");
    forgedRoot.action = { kind: "unknown", pointer: "x" } as never;
    expect(() => decorateVscodeTree(forged, commands)).toThrow("generic tree action is invalid");
    validRoot.action = { kind: "copy-pointer", pointer: " " };
    expect(() => decorateVscodeTree(valid, commands)).toThrow("generic tree action is invalid");
  });
});
