import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

export const WORKFLOW_CLASSIFICATION_REGISTRY_PATH =
  "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json";

export const workflowClassificationAxisSchema = z.enum([
  "development_style",
  "case_driven_model",
  "workflow_model",
  "state_machine",
  "subroute",
  "decision",
  "gate",
  "subtype",
  "trigger",
  "specialist_drive",
  "specialist_workflow",
  "specialist_capability",
  "execution_mode",
]);

const entitySchema = z
  .object({
    id: z.string().regex(/^[A-Z][A-Z0-9_]*$/u),
    axis: workflowClassificationAxisSchema,
    source_refs: z.array(z.string().min(1)).min(1),
    meaning: z.string().min(1),
    parent_ids: z.array(z.string().regex(/^[A-Z][A-Z0-9_]*$/u)).optional(),
  })
  .strict();

const signalBindingSchema = z
  .object({
    signals: z.array(z.string().min(1)).min(1),
    target_axis: workflowClassificationAxisSchema,
    target_id: z.string().regex(/^[A-Z][A-Z0-9_]*$/u),
    unresolved_until_decision: z.boolean().optional(),
  })
  .strict();

const EXACT_DEVELOPMENT_STYLES = [
  "FULL_L1_L12_V",
  "PRODUCTION_SCRUM",
  "V_DESIGN_SCRUM_IMPLEMENTATION",
] as const;

const REQUIRED_REQUIREMENTS_CLASSIFICATIONS = {
  SCRUM_REVERSE: "subroute",
  DISCOVERY_POC_S0_S4: "state_machine",
  SCRUM_REVERSE_SR0_SR4: "state_machine",
  REDESIGN: "workflow_model",
  DESIGN_REFACTOR: "workflow_model",
  PERFORMANCE_REFACTOR: "workflow_model",
  RETROFIT: "workflow_model",
} as const;

const LEGACY_CATALOG_ROUTE_IDS = new Set([
  "forward_full_v",
  "v_design_scrum_impl_hybrid",
  "pair_agent_tdd",
  "design_bottomup",
  "operation_verification",
]);

export const workflowClassificationRegistrySchema = z
  .object({
    schema_version: z.literal("helix-workflow-classification-registry.v1"),
    registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    requirements_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    authority: z
      .object({
        kind: z.literal("requirements"),
        source: z.literal("docs/governance/helix-harness-requirements_v1.3.md"),
        source_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
        sections: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    projection_policy: z
      .object({
        catalog_role: z.literal("generated_projection"),
        legacy_catalog_role: z.literal("compatibility_inventory"),
        ambiguity_disposition: z.literal("fail_close"),
        emit_legacy_identity: z.literal(false),
      })
      .strict(),
    execution_policy_boundary: z
      .object({
        semantic_role: z.literal("requirements_contract"),
        identity_to_policy: z.literal("one_way"),
        binding_key: z.tuple([z.literal("target_axis"), z.literal("target_id")]),
        policy_fields: z.tuple([
          z.literal("precedence"),
          z.literal("command_id"),
          z.literal("action_stage"),
          z.literal("preflight_policy"),
          z.literal("approval_policy"),
          z.literal("execution_form"),
          z.literal("applies_when"),
        ]),
        condition_fields: z.tuple([
          z.literal("production_impact"),
          z.literal("destructive_data_operation"),
          z.literal("credential_access"),
          z.literal("backend_derived"),
        ]),
        action_stages: z.tuple([
          z.literal("classify"),
          z.literal("plan"),
          z.literal("execute"),
          z.literal("verify"),
          z.literal("approve"),
        ]),
        preflight_policies: z.tuple([
          z.literal("none"),
          z.literal("required"),
          z.literal("conditional"),
        ]),
        approval_policies: z.tuple([
          z.literal("none"),
          z.literal("action_binding"),
          z.literal("po_directive"),
        ]),
        execution_forms: z.tuple([z.literal("standard"), z.literal("pair_cell")]),
        unsupported_identity_disposition: z.literal("fail_close"),
        legacy_construct_dispositions: z.tuple([
          z
            .object({
              legacy_id: z.literal("pair_agent_tdd"),
              disposition: z.literal("execution_form"),
              typed_value: z.literal("pair_cell"),
            })
            .strict(),
          z
            .object({
              legacy_id: z.literal("design_bottomup"),
              disposition: z.literal("specialist_workflow_condition"),
              typed_value: z.literal("SCREEN_DESIGN+backend_derived"),
            })
            .strict(),
          z
            .object({
              legacy_id: z.literal("operation_verification"),
              disposition: z.literal("verification_scope"),
              typed_value: z.literal("L7_L12+NFR_MEASUREMENT"),
            })
            .strict(),
        ]),
      })
      .strict(),
    entities: z.array(entitySchema).min(1),
    signal_bindings: z.array(signalBindingSchema).min(1),
  })
  .strict()
  .superRefine((registry, context) => {
    const byId = new Map<string, (typeof registry.entities)[number]>();
    for (const entity of registry.entities) {
      if (byId.has(entity.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entities"],
          message: `duplicate workflow classification id: ${entity.id}`,
        });
      }
      byId.set(entity.id, entity);
      if (LEGACY_CATALOG_ROUTE_IDS.has(entity.id.toLowerCase())) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entities"],
          message: `legacy catalog route cannot become requirements identity: ${entity.id}`,
        });
      }
    }

    const styles = registry.entities
      .filter((entity) => entity.axis === "development_style")
      .map((entity) => entity.id)
      .sort();
    if (JSON.stringify(styles) !== JSON.stringify([...EXACT_DEVELOPMENT_STYLES].sort())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entities"],
        message: "development style exact set must come from requirements §4",
      });
    }

    const cases = registry.entities
      .filter((entity) => entity.axis === "case_driven_model")
      .map((entity) => entity.id);
    if (cases.length !== 1 || cases[0] !== "DISCOVERY_POC") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entities"],
        message: "DISCOVERY_POC must be the separate case-driven model",
      });
    }

    for (const [id, expectedAxis] of Object.entries(REQUIRED_REQUIREMENTS_CLASSIFICATIONS)) {
      const actual = byId.get(id);
      if (!actual || actual.axis !== expectedAxis) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entities"],
          message: `${id} must be classified as ${expectedAxis} by requirements`,
        });
      }
    }

    for (const entity of registry.entities) {
      for (const parentId of entity.parent_ids ?? []) {
        if (!byId.has(parentId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["entities"],
            message: `unknown parent identity: ${entity.id} -> ${parentId}`,
          });
        }
      }
    }

    for (const binding of registry.signal_bindings) {
      const target = byId.get(binding.target_id);
      if (binding.unresolved_until_decision) {
        if (binding.target_axis !== "decision") {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["signal_bindings"],
            message: "unresolved signal binding must target a decision",
          });
        }
        continue;
      }
      if (!target || target.axis !== binding.target_axis) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["signal_bindings"],
          message: `signal target is missing or on another axis: ${binding.target_id}`,
        });
      }
    }
  });

export type WorkflowClassificationRegistry = z.infer<typeof workflowClassificationRegistrySchema>;

export function assertWorkflowClassificationAuthorityDigest(
  registry: WorkflowClassificationRegistry,
  sourceBytes: Uint8Array,
): void {
  const actualDigest = `sha256:${createHash("sha256").update(sourceBytes).digest("hex")}`;
  if (actualDigest !== registry.authority.source_digest) {
    throw new Error(
      `workflow classification requirements digest mismatch: expected=${registry.authority.source_digest} actual=${actualDigest}`,
    );
  }
}

export function loadWorkflowClassificationRegistry(
  repoRoot: string = process.cwd(),
): WorkflowClassificationRegistry {
  const path = resolve(repoRoot, WORKFLOW_CLASSIFICATION_REGISTRY_PATH);
  const registry = workflowClassificationRegistrySchema.parse(
    JSON.parse(readFileSync(path, "utf8")),
  );
  const sourceBytes = readFileSync(resolve(repoRoot, registry.authority.source));
  assertWorkflowClassificationAuthorityDigest(registry, sourceBytes);
  return registry;
}
