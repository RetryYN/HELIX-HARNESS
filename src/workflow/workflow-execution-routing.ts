import { z } from "zod";
import { loadWorkflowClassificationCatalog } from "../schema/workflow-classification-catalog.js";
import { workflowClassificationAxisSchema } from "../schema/workflow-classification-registry.js";
import {
  loadWorkflowExecutionPolicyProjection,
  type WorkflowExecutionPolicyProjection,
} from "../schema/workflow-execution-policy-projection.js";
import { resolveWorkflowExecutionPolicy } from "../schema/workflow-execution-policy-registry.js";
import { routeSignalToWorkflowClassification } from "./workflow-classification-routing.js";

const dispositionSchema = z.enum([
  "resolved",
  "classification_unknown",
  "classification_decision_required",
  "classification_ambiguous",
  "policy_unsupported",
  "policy_ambiguous",
  "approval_required",
]);

export const workflowExecutionRoutingReceiptSchema = z
  .object({
    schema_version: z.literal("helix-workflow-execution-routing-receipt.v1"),
    classification_registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    policy_registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    requirements_source_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
    classification_registry_source_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
    policy_registry_source_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
    target_axis: workflowClassificationAxisSchema.nullable(),
    target_id: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]*$/u)
      .nullable(),
    binding_id: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]*$/u)
      .nullable(),
    command_id: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]*$/u)
      .nullable(),
    action_stage: z.enum(["classify", "plan", "execute", "verify", "approve"]).nullable(),
    preflight_policy: z.enum(["none", "required", "conditional"]).nullable(),
    approval_policy: z.enum(["none", "action_binding", "po_directive"]).nullable(),
    execution_form: z.enum(["standard", "pair_cell"]),
    disposition: dispositionSchema,
    exit_class: z.enum(["success", "blocked", "unresolved"]),
    exit_code: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  })
  .strict();

export type WorkflowExecutionRoutingReceipt = z.infer<typeof workflowExecutionRoutingReceiptSchema>;

export interface WorkflowExecutionRoutingInput {
  signal: string;
  execution_form: "standard" | "pair_cell";
  production_impact: boolean;
  destructive_data_operation: boolean;
  credential_access: boolean;
  backend_derived: boolean;
  repo_root?: string;
}

type Disposition = z.infer<typeof dispositionSchema>;

function receiptBase(
  projection: WorkflowExecutionPolicyProjection,
  classificationRegistryVersion: string,
  executionForm: WorkflowExecutionRoutingInput["execution_form"],
) {
  return {
    schema_version: "helix-workflow-execution-routing-receipt.v1" as const,
    classification_registry_version: classificationRegistryVersion,
    policy_registry_version: projection.source_registry.registry_version,
    requirements_source_digest: projection.source_registry.requirements_source_digest,
    classification_registry_source_digest:
      projection.source_registry.classification_registry_source_digest,
    policy_registry_source_digest: projection.source_registry.policy_registry_source_digest,
    execution_form: executionForm,
  };
}

function exitFor(
  projection: WorkflowExecutionPolicyProjection,
  disposition: Disposition,
): { exit_class: "success" | "blocked" | "unresolved"; exit_code: 0 | 1 | 2 } {
  return projection.policy.consumer_contract.disposition_exit_map[disposition];
}

export function evaluateWorkflowExecutionRoute(
  input: WorkflowExecutionRoutingInput,
): WorkflowExecutionRoutingReceipt {
  const catalog = loadWorkflowClassificationCatalog(input.repo_root);
  const projection = loadWorkflowExecutionPolicyProjection(input.repo_root);
  if (
    catalog.source_registry.registry_source_digest !==
    projection.source_registry.classification_registry_source_digest
  ) {
    throw new Error("workflow routing classification registry digest mismatch");
  }
  if (
    catalog.source_registry.requirements_source_digest !==
    projection.source_registry.requirements_source_digest
  ) {
    throw new Error("workflow routing requirements digest mismatch");
  }

  const base = receiptBase(
    projection,
    catalog.source_registry.registry_version,
    input.execution_form,
  );
  const classification = routeSignalToWorkflowClassification({ signal: input.signal, catalog });
  if (classification.disposition !== "classified" || !classification.classification) {
    const disposition: Disposition =
      classification.disposition === "unknown"
        ? "classification_unknown"
        : classification.disposition === "decision_required"
          ? "classification_decision_required"
          : "classification_ambiguous";
    return workflowExecutionRoutingReceiptSchema.parse({
      ...base,
      target_axis: null,
      target_id: null,
      binding_id: null,
      command_id: null,
      action_stage: null,
      preflight_policy: null,
      approval_policy: null,
      disposition,
      ...exitFor(projection, disposition),
    });
  }

  const target = classification.classification;
  const policy = resolveWorkflowExecutionPolicy(projection.policy, {
    target_axis: target.target_axis,
    target_id: target.target_id,
    execution_form: input.execution_form,
    applies_when: {
      production_impact: input.production_impact,
      destructive_data_operation: input.destructive_data_operation,
      credential_access: input.credential_access,
      backend_derived: input.backend_derived,
    },
  });
  if (policy.disposition !== "resolved") {
    return workflowExecutionRoutingReceiptSchema.parse({
      ...base,
      target_axis: target.target_axis,
      target_id: target.target_id,
      binding_id: null,
      command_id: null,
      action_stage: null,
      preflight_policy: null,
      approval_policy: null,
      disposition: policy.disposition,
      ...exitFor(projection, policy.disposition),
    });
  }

  const binding = policy.binding;
  const disposition: Disposition =
    binding.approval_policy === "none" ? "resolved" : "approval_required";
  return workflowExecutionRoutingReceiptSchema.parse({
    ...base,
    target_axis: binding.target_axis,
    target_id: binding.target_id,
    binding_id: binding.binding_id,
    command_id: binding.command_id,
    action_stage: binding.action_stage,
    preflight_policy: binding.preflight_policy,
    approval_policy: binding.approval_policy,
    disposition,
    ...exitFor(projection, disposition),
  });
}
