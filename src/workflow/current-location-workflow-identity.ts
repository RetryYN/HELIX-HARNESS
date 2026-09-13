import { resolveProjectDriveModelIdentity } from "../schema/current-location-workflow-identity-resolver.js";
import type { ProjectCurrentLocationSnapshot } from "../state-db/current-location.js";

export * from "../schema/current-location-workflow-identity-resolver.js";

/** Composition boundary for CLI/read-model consumers; state-db remains independent of workflow. */
export function attachCurrentLocationWorkflowIdentity(
  snapshot: ProjectCurrentLocationSnapshot,
  repoRoot: string = process.cwd(),
): ProjectCurrentLocationSnapshot {
  const receipt = resolveProjectDriveModelIdentity(snapshot.drive_route.selectedModel, repoRoot);
  return {
    ...snapshot,
    drive_route: {
      ...snapshot.drive_route,
      workflowIdentity: receipt.identity,
      workflowIdentityReceipt: receipt,
    },
  };
}
