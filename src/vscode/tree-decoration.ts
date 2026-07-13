import type { GenericTree, GenericTreeNode } from "../schema/visualization-tree-contract";
import { HELIX_COPY_POINTER_COMMAND } from "./extension-manifest";

export type TreeNodeState = "none" | "collapsed" | "expanded";

export interface TreeViewCommand {
  title: string;
  command: typeof HELIX_COPY_POINTER_COMMAND;
  arguments: string[];
}

export interface TreeViewNode {
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  contextValue: string;
  collapsibleState: TreeNodeState;
  command?: TreeViewCommand;
  children: TreeViewNode[];
}

export interface VisualizationTreeViewModel {
  schema_version: "visualization-tree-view.v1";
  source_clock: string | null;
  roots: TreeViewNode[];
  warnings: string[];
}

function summaryPointer(pointer: string): string {
  if (pointer.includes(" --summary-json") || !pointer.endsWith(" --json")) return pointer;
  return pointer.replace(/ --json$/, " --summary-json");
}

function decorateNode(node: GenericTreeNode): TreeViewNode {
  const children = node.children.map(decorateNode);
  return {
    id: node.id,
    label: node.label,
    description: node.description,
    tooltip: node.tooltip,
    contextValue: node.kind,
    collapsibleState: children.length === 0 ? "none" : node.expanded ? "expanded" : "collapsed",
    command: node.action
      ? {
          title: "Copy pointer",
          command: HELIX_COPY_POINTER_COMMAND,
          arguments: [summaryPointer(node.action.pointer)],
        }
      : undefined,
    children,
  };
}

/** L6 `decorateVscodeTree`: resolves generic action intent through the VS Code command catalog. */
export function decorateVscodeTree(tree: GenericTree): VisualizationTreeViewModel {
  return {
    schema_version: "visualization-tree-view.v1",
    source_clock: tree.source_clock,
    roots: tree.roots.map(decorateNode),
    warnings: [...tree.warnings],
  };
}
