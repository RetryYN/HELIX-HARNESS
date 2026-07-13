import { createHash } from "node:crypto";
import type { VisualizationContract } from "../schema/visualization-view-contract";
import {
  rebuildHarnessDb as rebuildHarnessDbCore,
  type RebuildHarnessDbInput,
  type RebuildHarnessDbResult,
} from "../state-db/projection-writer";
import type { VisualizationTreeSummary } from "../state-db/visualization-evidence";
import { HELIX_COPY_POINTER_COMMAND } from "../vscode/extension-manifest";
import { decorateVscodeTree } from "../vscode/tree-decoration";
import { buildVisualizationTree } from "../vmodel/visualization-tree-projector";

function countTreeNodes(nodes: readonly { children: readonly unknown[] }[]): number {
  return nodes.reduce(
    (count, node) => count + 1 + countTreeNodes(node.children as readonly { children: readonly unknown[] }[]),
    0,
  );
}

export function summarizeVisualizationTree(view: VisualizationContract): VisualizationTreeSummary {
  const tree = decorateVscodeTree(buildVisualizationTree(view), {
    copy_pointer: { title: "Copy pointer", command: HELIX_COPY_POINTER_COMMAND },
  });
  return {
    schema_version: tree.schema_version,
    source_clock: tree.source_clock,
    root_ids: tree.roots.map((root) => root.id),
    root_count: tree.roots.length,
    node_count: countTreeNodes(tree.roots),
    warnings_count: tree.warnings.length,
    snapshot_hash: `sha256:${createHash("sha256").update(JSON.stringify(tree)).digest("hex")}`,
  };
}

/** Composition root: the state-db core receives an adapter-neutral summary port. */
export function rebuildHarnessDb(input: RebuildHarnessDbInput = {}): RebuildHarnessDbResult {
  return rebuildHarnessDbCore({ ...input, buildVisualizationTreeSummary: summarizeVisualizationTree });
}
