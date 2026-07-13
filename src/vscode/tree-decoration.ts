import type { GenericTree, GenericTreeNode } from "../schema/visualization-tree-contract";

export type TreeNodeState = "none" | "collapsed" | "expanded";

export interface TreeViewCommand {
  title: string;
  command: string;
  arguments: string[];
}

export interface CommandCatalog {
  copy_pointer: { title: string; command: string };
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

function decorateNode(node: GenericTreeNode, commands: CommandCatalog): TreeViewNode {
  if (!node.id || !node.kind) throw new Error("generic tree node requires id and kind");
  const children = node.children.map(decorateNode);
  if (node.action && (node.action.kind !== "copy-pointer" || !node.action.pointer.trim()))
    throw new Error("generic tree action is invalid");
  return {
    id: node.id,
    label: node.label,
    description: node.description,
    tooltip: node.tooltip,
    contextValue: node.kind,
    collapsibleState: children.length === 0 ? "none" : node.expanded ? "expanded" : "collapsed",
    command: node.action
      ? {
          title: commands.copy_pointer.title,
          command: commands.copy_pointer.command,
          arguments: [node.action.pointer],
        }
      : undefined,
    children,
  };
}

/** L6 `decorateVscodeTree`: resolves generic action intent through the VS Code command catalog. */
export function decorateVscodeTree(
  tree: GenericTree,
  commands: CommandCatalog,
): VisualizationTreeViewModel {
  return {
    schema_version: "visualization-tree-view.v1",
    source_clock: tree.source_clock,
    roots: tree.roots.map((node) => decorateNode(node, commands)),
    warnings: [...tree.warnings],
  };
}
