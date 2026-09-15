/** Adapter-neutral tree contract. Presentation decoration is owned by adapters. */
export interface GenericTreeAction {
  kind: "copy-pointer";
  pointer: string;
}

export interface GenericTreeNode {
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  kind: string;
  expanded?: boolean;
  action?: GenericTreeAction;
  children: GenericTreeNode[];
}

export interface GenericTree {
  schema_version: "generic-visualization-tree.v1";
  source_clock: string | null;
  roots: GenericTreeNode[];
  warnings: string[];
}
