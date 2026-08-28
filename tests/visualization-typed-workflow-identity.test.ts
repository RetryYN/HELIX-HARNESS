import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type HarnessDb, openHarnessDb } from "../src/state-db";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";
import {
  buildVisualizationSnapshot,
  type VisualizationSnapshot,
} from "../src/state-db/visualization-read-model";
import { buildVisualizationViewModel } from "../src/state-db/visualization-view-model";
import { buildVisualizationTree } from "../src/vmodel/visualization-tree-projector";
import { HELIX_COPY_POINTER_COMMAND } from "../src/vscode/extension-manifest";
import { decorateVscodeTree } from "../src/vscode/tree-decoration";
import { buildVisualizationTreeView } from "../src/vscode/tree-view-provider";

// PLAN-L7-694-visualization-typed-workflow-identity / U-VTWI-001..005

const LEGACY_IDENTITY_KEYS = new Set([
  "available_models",
  "default_model",
  "drive_model",
  "drive_model_candidates",
  "selected_model",
]);

function legacyIdentityPaths(value: unknown, prefix = "$"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => legacyIdentityPaths(item, `${prefix}[${index}]`));
  }
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) => [
    ...(LEGACY_IDENTITY_KEYS.has(key) ? [`${prefix}.${key}`] : []),
    ...legacyIdentityPaths(child, `${prefix}.${key}`),
  ]);
}

describe("visualization typed workflow identity", () => {
  let db: HarnessDb;
  let snapshot: VisualizationSnapshot;

  beforeAll(() => {
    db = openHarnessDb(":memory:");
    rebuildHarnessDb({ repoRoot: process.cwd(), db });
    snapshot = buildVisualizationSnapshot(db, { repoRoot: process.cwd() });
  });

  afterAll(() => db.close());

  it("U-VTWI-001: 実DB projectionのtyped tupleをview modelへexact投影する", () => {
    const row = db
      .prepare(
        `SELECT workflow_identity_schema_version, workflow_registry_version,
                workflow_registry_source_digest, workflow_target_axis, workflow_target_id
           FROM project_current_location
          WHERE snapshot_id = ?`,
      )
      .get("project-current-location:latest") as Record<string, string>;
    const view = buildVisualizationViewModel(snapshot).project.current_location;

    expect(view.workflow_identity).toEqual({
      schema_version: row.workflow_identity_schema_version,
      workflow_registry_version: row.workflow_registry_version,
      workflow_registry_source_digest: row.workflow_registry_source_digest,
      workflow_target_axis: row.workflow_target_axis,
      workflow_target_id: row.workflow_target_id,
    });
  });

  it("U-VTWI-002: current view／generic tree／VS Code treeへlegacy identity keyを再出力しない", () => {
    const viewModel = buildVisualizationViewModel(snapshot);
    expect(legacyIdentityPaths(viewModel.project.current_location)).toEqual([]);
    expect(legacyIdentityPaths(buildVisualizationTree(viewModel))).toEqual([]);
    expect(legacyIdentityPaths(buildVisualizationTreeView(viewModel))).toEqual([]);
  });

  it("U-VTWI-003: stale／unknown／partial／receipt不一致をfail-closeする", () => {
    const expectInvalid = (mutate: (candidate: VisualizationSnapshot) => void) => {
      const candidate = structuredClone(snapshot);
      mutate(candidate);
      expect(() => buildVisualizationViewModel(candidate)).toThrowError(
        "visualization_workflow_identity_invalid",
      );
    };
    const requireIdentity = (candidate: VisualizationSnapshot) => {
      const identity = candidate.project_current_location.drive_route.workflowIdentity;
      const receipt = candidate.project_current_location.drive_route.workflowIdentityReceipt;
      if (!identity || !receipt?.identity) throw new Error("fixture typed receipt is missing");
      return { identity, receipt, receiptIdentity: receipt.identity };
    };

    expectInvalid((candidate) => {
      const { receipt, receiptIdentity } = requireIdentity(candidate);
      candidate.project_current_location.drive_route.workflowIdentityReceipt = {
        ...receipt,
        identity: { ...receiptIdentity, registry_source_digest: "sha256:stale" },
      };
    });
    expectInvalid((candidate) => {
      const { identity, receipt, receiptIdentity } = requireIdentity(candidate);
      identity.registry_source_digest = "sha256:stale";
      candidate.project_current_location.drive_route.workflowIdentityReceipt = {
        ...receipt,
        identity: { ...receiptIdentity, registry_source_digest: "sha256:stale" },
      };
    });
    expectInvalid((candidate) => {
      const { identity, receipt, receiptIdentity } = requireIdentity(candidate);
      identity.target_id = "UNKNOWN_WORKFLOW";
      candidate.project_current_location.drive_route.workflowIdentityReceipt = {
        ...receipt,
        identity: { ...receiptIdentity, target_id: "UNKNOWN_WORKFLOW" },
      };
    });
    expectInvalid((candidate) => {
      const { identity } = requireIdentity(candidate);
      (identity as { target_axis?: string }).target_axis = undefined;
    });
  });

  it("U-VTWI-004: generic treeとVS Code treeのtyped identityを一致させる", () => {
    const viewModel = buildVisualizationViewModel(snapshot);
    const generic = buildVisualizationTree(viewModel);
    const vscode = buildVisualizationTreeView(viewModel);

    expect(
      decorateVscodeTree(generic, {
        copy_pointer: { title: "Copy pointer", command: HELIX_COPY_POINTER_COMMAND },
      }),
    ).toStrictEqual(vscode);
    expect(JSON.stringify(generic)).toContain(
      viewModel.project.current_location.workflow_identity.workflow_target_id,
    );
    expect(JSON.stringify(generic)).toContain(
      viewModel.project.current_location.workflow_identity.workflow_registry_source_digest,
    );
  });

  it("U-VTWI-005: legacy key復活mutationを検出する", () => {
    expect(legacyIdentityPaths({ workflow_identity: { target_id: "REVERSE" } })).toEqual([]);
    expect(
      legacyIdentityPaths({ workflow_identity: { target_id: "REVERSE" }, drive_model: "Reverse" }),
    ).toEqual(["$.drive_model"]);
  });
});
