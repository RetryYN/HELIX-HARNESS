import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  CurrentLocationWorkflowIdentity,
  CurrentLocationWorkflowIdentityReceipt,
  WorkflowClassificationAxis,
} from "../schema/current-location-workflow-identity.js";
import {
  loadWorkflowClassificationCatalog,
  type WorkflowClassificationCatalog,
} from "../schema/workflow-classification-catalog.js";
import {
  loadWorkflowClassificationRegistry,
  type WorkflowClassificationRegistry,
} from "../schema/workflow-classification-registry.js";
import type { ProjectCurrentLocationSnapshot } from "../state-db/current-location.js";
import {
  adaptLegacyWorkflowClassification,
  type WorkflowClassificationLegacyReceipt,
} from "./workflow-classification-legacy-adapter.js";

/**
 * Workflow classification authority belongs to the installed HELIX package, not to the
 * governed consumer repository. The test CLI bundle fixes import.meta.url to the logical
 * package root, so this remains stable across linked worktrees and consumer cwd changes.
 */
export const WORKFLOW_CLASSIFICATION_PACKAGE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export type {
  CurrentLocationWorkflowIdentity,
  CurrentLocationWorkflowIdentityDisposition,
  CurrentLocationWorkflowIdentityReceipt,
} from "../schema/current-location-workflow-identity.js";

export interface CurrentLocationWorkflowIdentityInput {
  identity?: {
    registry_version: string;
    registry_source_digest: string;
    target_axis: WorkflowClassificationAxis;
    target_id: string;
  };
  legacy_model?: string;
  catalog?: WorkflowClassificationCatalog;
  registry?: WorkflowClassificationRegistry;
  repo_root?: string;
}

function identityFromCatalog(
  catalog: WorkflowClassificationCatalog,
  target_axis: WorkflowClassificationAxis,
  target_id: string,
): CurrentLocationWorkflowIdentity {
  return {
    schema_version: "helix-current-location-workflow-identity.v1",
    registry_version: catalog.source_registry.registry_version,
    registry_source_digest: catalog.source_registry.registry_source_digest,
    target_axis,
    target_id,
  };
}

function receiptFromLegacy(
  catalog: WorkflowClassificationCatalog,
  legacyReceipt: WorkflowClassificationLegacyReceipt,
): CurrentLocationWorkflowIdentityReceipt {
  const classification = legacyReceipt.classification;
  const catalogEntity = classification
    ? catalog.entities.find(
        (candidate) =>
          candidate.axis === classification.target_axis &&
          candidate.id === classification.target_id,
      )
    : undefined;
  const catalogMismatch =
    legacyReceipt.disposition === "converted" &&
    classification !== undefined &&
    catalogEntity === undefined;
  const identity = catalogMismatch
    ? null
    : classification
      ? identityFromCatalog(catalog, classification.target_axis, classification.target_id)
      : null;
  return {
    schema_version: "helix-current-location-workflow-identity-receipt.v1",
    disposition: catalogMismatch ? "unsupported" : legacyReceipt.disposition,
    identity,
    source: {
      kind: "legacy_compatibility",
      field: legacyReceipt.source.field,
      token: legacyReceipt.source.token,
    },
    warnings: catalogMismatch
      ? [
          ...legacyReceipt.warnings,
          {
            code: "legacy-workflow-unsupported" as const,
            message:
              "legacy workflow classification is absent from the current requirements catalog",
          },
        ]
      : legacyReceipt.warnings,
    emit_legacy_identity: false,
    exit_code: catalogMismatch ? 1 : legacyReceipt.exit_code,
  };
}

function invalidReceipt(input: {
  disposition: "unsupported" | "stale";
  source: CurrentLocationWorkflowIdentityReceipt["source"];
  code: "typed-workflow-stale" | "typed-workflow-unknown";
  message: string;
}): CurrentLocationWorkflowIdentityReceipt {
  return {
    schema_version: "helix-current-location-workflow-identity-receipt.v1",
    disposition: input.disposition,
    identity: null,
    source: input.source,
    warnings: [{ code: input.code, message: input.message }],
    emit_legacy_identity: false,
    exit_code: 1,
  };
}

function isMissingAuthorityFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

/**
 * Resolve the current-location workflow identity without promoting the old drive-model enum.
 * Legacy values are accepted only as input and always leave a provenance warning in the receipt.
 */
export function resolveCurrentLocationWorkflowIdentity(
  input: CurrentLocationWorkflowIdentityInput,
): CurrentLocationWorkflowIdentityReceipt {
  const hasTypedIdentity = input.identity !== undefined;
  const hasLegacyModel = input.legacy_model !== undefined;
  if (hasTypedIdentity === hasLegacyModel) {
    return invalidReceipt({
      disposition: "unsupported",
      source: {
        kind: hasLegacyModel ? "legacy_compatibility" : "typed",
        field: hasLegacyModel ? "model" : null,
        token: input.legacy_model ?? "",
      },
      code: "typed-workflow-unknown",
      message:
        "current-location workflow identity requires exactly one typed identity or legacy input",
    });
  }

  let catalog: WorkflowClassificationCatalog;
  try {
    catalog = input.catalog ?? loadWorkflowClassificationCatalog(input.repo_root ?? process.cwd());
  } catch (error) {
    if (!isMissingAuthorityFileError(error)) throw error;
    return invalidReceipt({
      disposition: "unsupported",
      source: {
        kind: hasLegacyModel ? "legacy_compatibility" : "typed",
        field: hasLegacyModel ? "model" : null,
        token: input.legacy_model ?? input.identity?.target_id ?? "",
      },
      code: "typed-workflow-unknown",
      message: "current workflow classification catalog is unavailable",
    });
  }
  if (input.legacy_model !== undefined) {
    let registry: WorkflowClassificationRegistry;
    try {
      registry =
        input.registry ?? loadWorkflowClassificationRegistry(input.repo_root ?? process.cwd());
    } catch (error) {
      if (!isMissingAuthorityFileError(error)) throw error;
      return invalidReceipt({
        disposition: "unsupported",
        source: { kind: "legacy_compatibility", field: "model", token: input.legacy_model },
        code: "typed-workflow-unknown",
        message: "current workflow classification registry is unavailable",
      });
    }
    return receiptFromLegacy(
      catalog,
      adaptLegacyWorkflowClassification(
        { legacy_field: "model", legacy_value: input.legacy_model },
        registry,
      ),
    );
  }

  const typed = input.identity;
  if (!typed) {
    return invalidReceipt({
      disposition: "unsupported",
      source: { kind: "typed", field: null, token: "" },
      code: "typed-workflow-unknown",
      message: "typed current-location workflow identity is missing",
    });
  }
  const source = { kind: "typed" as const, field: null, token: typed.target_id };
  if (
    typed.registry_version !== catalog.source_registry.registry_version ||
    typed.registry_source_digest !== catalog.source_registry.registry_source_digest
  ) {
    return invalidReceipt({
      disposition: "stale",
      source,
      code: "typed-workflow-stale",
      message:
        "typed current-location workflow identity is bound to a stale registry version or digest",
    });
  }
  const entity = catalog.entities.find(
    (candidate) => candidate.axis === typed.target_axis && candidate.id === typed.target_id,
  );
  if (!entity) {
    return invalidReceipt({
      disposition: "unsupported",
      source,
      code: "typed-workflow-unknown",
      message:
        "typed current-location workflow identity is not registered by the requirements catalog",
    });
  }
  return {
    schema_version: "helix-current-location-workflow-identity-receipt.v1",
    disposition: "typed",
    identity: identityFromCatalog(catalog, entity.axis, entity.id),
    source,
    warnings: [],
    emit_legacy_identity: false,
    exit_code: 0,
  };
}

/** Resolve a project observation against the installed HELIX authority, never consumer cwd. */
export function resolvePackageCurrentLocationWorkflowIdentity(
  legacyModel: string,
): CurrentLocationWorkflowIdentityReceipt {
  return resolveCurrentLocationWorkflowIdentity({
    legacy_model: legacyModel,
    repo_root: WORKFLOW_CLASSIFICATION_PACKAGE_ROOT,
  });
}

/** Composition boundary for CLI/read-model consumers; state-db remains independent of workflow. */
export function attachCurrentLocationWorkflowIdentity(
  snapshot: ProjectCurrentLocationSnapshot,
  repoRoot: string = process.cwd(),
): ProjectCurrentLocationSnapshot {
  const receipt = resolveCurrentLocationWorkflowIdentity({
    legacy_model: snapshot.drive_route.selectedModel,
    repo_root: repoRoot,
  });
  return {
    ...snapshot,
    drive_route: {
      ...snapshot.drive_route,
      workflowIdentity: receipt.identity,
      workflowIdentityReceipt: receipt,
    },
  };
}
