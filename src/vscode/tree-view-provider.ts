import type { VisualizationContract } from "../schema/visualization-view-contract";
import { buildVisualizationTree } from "../vmodel/visualization-tree-projector";
import { HELIX_COPY_POINTER_COMMAND } from "./extension-manifest";
import { decorateVscodeTree, type VisualizationTreeViewModel } from "./tree-decoration";

export type {
  TreeNodeState,
  TreeViewCommand,
  TreeViewNode,
  VisualizationTreeViewModel,
} from "./tree-decoration";

const CANONICAL_COMMAND_CATALOG = {
  copy_pointer: {
    title: "Copy pointer",
    command: HELIX_COPY_POINTER_COMMAND,
  },
} as const;

/** Compatibility facade: resolves generic tree actions through the VS Code command catalog. */
export function buildVisualizationTreeView(vm: VisualizationContract): VisualizationTreeViewModel {
  return decorateVscodeTree(buildVisualizationTree(vm), CANONICAL_COMMAND_CATALOG);
}
