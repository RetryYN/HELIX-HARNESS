import { resolveCurrentLocationWorkflowIdentity } from "../schema/current-location-workflow-identity-resolver.js";
import type { ProjectCurrentLocationSnapshot } from "../state-db/current-location.js";

export interface CliWorkflowIdentityProjection {
  workflow_identity: {
    registry_version: string;
    registry_source_digest: string;
    target_axis: string;
    target_id: string;
  };
}

/**
 * CLI current-output boundary. The snapshot may retain compatibility producers internally,
 * but a CLI consumer can publish only an authority-validated typed identity.
 */
export function buildCliWorkflowIdentityProjection(
  snapshot: ProjectCurrentLocationSnapshot,
  repoRoot: string = process.cwd(),
): CliWorkflowIdentityProjection {
  const identity = snapshot.drive_route.workflowIdentity;
  const receipt = snapshot.drive_route.workflowIdentityReceipt;
  const authorityReceipt = identity
    ? resolveCurrentLocationWorkflowIdentity({ identity, repo_root: repoRoot })
    : null;
  if (
    !identity ||
    !receipt ||
    receipt.exit_code !== 0 ||
    receipt.emit_legacy_identity !== false ||
    !receipt.identity ||
    receipt.identity.registry_version !== identity.registry_version ||
    receipt.identity.registry_source_digest !== identity.registry_source_digest ||
    receipt.identity.target_axis !== identity.target_axis ||
    receipt.identity.target_id !== identity.target_id ||
    !authorityReceipt ||
    authorityReceipt.exit_code !== 0 ||
    !authorityReceipt.identity ||
    authorityReceipt.identity.registry_version !== identity.registry_version ||
    authorityReceipt.identity.registry_source_digest !== identity.registry_source_digest ||
    authorityReceipt.identity.target_axis !== identity.target_axis ||
    authorityReceipt.identity.target_id !== identity.target_id
  ) {
    throw new Error("cli_workflow_identity_invalid");
  }

  return {
    workflow_identity: {
      registry_version: identity.registry_version,
      registry_source_digest: identity.registry_source_digest,
      target_axis: identity.target_axis,
      target_id: identity.target_id,
    },
  };
}
