/**
 * Adapter-neutral visualization tree contract.
 * The command identifier is a stable pointer action carried by generic tree nodes;
 * VS Code only contributes it to its manifest and executes it.
 */
export const HELIX_COPY_POINTER_COMMAND = "helix.copyPointer";

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
