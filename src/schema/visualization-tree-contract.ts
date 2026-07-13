/** Adapter-neutral tree contract. Presentation decoration is owned by adapters. */
export interface GenericTreeNode {
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  children: GenericTreeNode[];
}
