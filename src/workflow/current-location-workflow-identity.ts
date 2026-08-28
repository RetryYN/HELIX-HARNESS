import { resolvePackageCurrentLocationWorkflowIdentity } from "../schema/current-location-workflow-identity-resolver.js";
import type { ProjectCurrentLocationSnapshot } from "../state-db/current-location.js";

export * from "../schema/current-location-workflow-identity-resolver.js";

/** Composition boundary for CLI/read-model consumers; state-db remains independent of workflow. */
export function attachCurrentLocationWorkflowIdentity(
  snapshot: ProjectCurrentLocationSnapshot,
  _consumerRepoRoot?: string,
): ProjectCurrentLocationSnapshot {
  const receipt = resolvePackageCurrentLocationWorkflowIdentity(snapshot.drive_route.selectedModel);
  return {
    ...snapshot,
    drive_route: {
      ...snapshot.drive_route,
      workflowIdentity: receipt.identity,
      workflowIdentityReceipt: receipt,
    },
  };
}
