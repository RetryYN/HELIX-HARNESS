import type { WorkflowClassificationRegistry } from "./workflow-classification-registry.js";

export type WorkflowClassificationAxis = WorkflowClassificationRegistry["entities"][number]["axis"];

export interface CurrentLocationWorkflowIdentity {
  schema_version: "helix-current-location-workflow-identity.v1";
  registry_version: string;
  registry_source_digest: string;
  target_axis: WorkflowClassificationAxis;
  target_id: string;
}

export type CurrentLocationWorkflowIdentityDisposition =
  | "typed"
  | "converted"
  | "ambiguous"
  | "unsupported"
  | "stale";

export interface CurrentLocationWorkflowIdentityReceipt {
  schema_version: "helix-current-location-workflow-identity-receipt.v1";
  disposition: CurrentLocationWorkflowIdentityDisposition;
  identity: CurrentLocationWorkflowIdentity | null;
  source: {
    kind: "typed" | "legacy_compatibility";
    field: "mode" | "model" | null;
    token: string;
  };
  warnings: Array<{
    code:
      | "legacy-workflow-input"
      | "legacy-workflow-ambiguous"
      | "legacy-workflow-unsupported"
      | "typed-workflow-stale"
      | "typed-workflow-unknown";
    message: string;
  }>;
  emit_legacy_identity: false;
  exit_code: 0 | 1;
}
