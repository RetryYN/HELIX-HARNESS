import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import {
  loadWorkflowClassificationRegistry,
  WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
  workflowClassificationAxisSchema,
  type WorkflowClassificationRegistry,
} from "./workflow-classification-registry.js";

export const WORKFLOW_CLASSIFICATION_CATALOG_PATH =
  "config/workflow-classification-catalog.v1.json";

const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u);

const catalogEntitySchema = z
  .object({
    id: z.string().regex(/^[A-Z][A-Z0-9_]*$/u),
    axis: workflowClassificationAxisSchema,
    source_refs: z.array(z.string().min(1)).min(1),
    meaning: z.string().min(1),
    parent_ids: z.array(z.string().regex(/^[A-Z][A-Z0-9_]*$/u)).optional(),
  })
  .strict();

const catalogSignalBindingSchema = z
  .object({
    signals: z.array(z.string().min(1)).min(1),
    target_axis: workflowClassificationAxisSchema,
    target_id: z.string().regex(/^[A-Z][A-Z0-9_]*$/u),
    unresolved_until_decision: z.boolean().optional(),
  })
  .strict();

export const workflowClassificationCatalogSchema = z
  .object({
    schema_version: z.literal("helix-workflow-classification-catalog.v1"),
    projection_role: z.literal("generated_projection"),
    source_registry: z
      .object({
        path: z.literal(WORKFLOW_CLASSIFICATION_REGISTRY_PATH),
        schema_version: z.literal("helix-workflow-classification-registry.v1"),
        registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
        requirements_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
        requirements_source_digest: digestSchema,
        registry_source_digest: digestSchema,
      })
      .strict(),
    identity_policy: z
      .object({
        typed_axes_only: z.literal(true),
        common_route_identity: z.literal(false),
        legacy_identity_emission: z.literal(false),
        ambiguity_disposition: z.literal("fail_close"),
      })
      .strict(),
    entities: z.array(catalogEntitySchema).min(1),
    signal_bindings: z.array(catalogSignalBindingSchema).min(1),
  })
  .strict();

export type WorkflowClassificationCatalog = z.infer<
  typeof workflowClassificationCatalogSchema
>;

function sha256(bytes: Uint8Array): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function projectWorkflowClassificationCatalog(
  registry: WorkflowClassificationRegistry,
  registrySourceBytes: Uint8Array,
): WorkflowClassificationCatalog {
  return workflowClassificationCatalogSchema.parse({
    schema_version: "helix-workflow-classification-catalog.v1",
    projection_role: "generated_projection",
    source_registry: {
      path: WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
      schema_version: registry.schema_version,
      registry_version: registry.registry_version,
      requirements_version: registry.requirements_version,
      requirements_source_digest: registry.authority.source_digest,
      registry_source_digest: sha256(registrySourceBytes),
    },
    identity_policy: {
      typed_axes_only: true,
      common_route_identity: false,
      legacy_identity_emission: false,
      ambiguity_disposition: registry.projection_policy.ambiguity_disposition,
    },
    entities: registry.entities,
    signal_bindings: registry.signal_bindings,
  });
}

export function assertWorkflowClassificationCatalogCurrent(
  actual: WorkflowClassificationCatalog,
  expected: WorkflowClassificationCatalog,
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error("workflow classification catalog drift: regenerate from requirements registry");
  }
}

export function loadWorkflowClassificationCatalog(
  repoRoot: string = process.cwd(),
): WorkflowClassificationCatalog {
  const registryBytes = readFileSync(resolve(repoRoot, WORKFLOW_CLASSIFICATION_REGISTRY_PATH));
  const registry = loadWorkflowClassificationRegistry(repoRoot);
  const expected = projectWorkflowClassificationCatalog(registry, registryBytes);
  const actual = workflowClassificationCatalogSchema.parse(
    JSON.parse(
      readFileSync(resolve(repoRoot, WORKFLOW_CLASSIFICATION_CATALOG_PATH), "utf8"),
    ),
  );
  assertWorkflowClassificationCatalogCurrent(actual, expected);
  return actual;
}
