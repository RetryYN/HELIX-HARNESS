import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import {
  loadWorkflowExecutionPolicyRegistry,
  WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH,
  type WorkflowExecutionPolicyRegistry,
  workflowExecutionPolicyBindingSchema,
  workflowExecutionPolicyCommandSchema,
  workflowExecutionPolicyConsumerContractSchema,
} from "./workflow-execution-policy-registry.js";

export const WORKFLOW_EXECUTION_POLICY_PROJECTION_PATH = "config/workflow-execution-policy.v1.json";

const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u);
const projectedPolicySchema = z
  .object({
    coverage: z
      .object({
        state: z.literal("partial_fail_close"),
        unsupported_identity_disposition: z.literal("fail_close"),
        legacy_identity_emission: z.literal(false),
      })
      .strict(),
    consumer_contract: workflowExecutionPolicyConsumerContractSchema,
    command_registry: z.array(workflowExecutionPolicyCommandSchema).min(1),
    bindings: z.array(workflowExecutionPolicyBindingSchema).min(1),
  })
  .strict();

export const workflowExecutionPolicyProjectionSchema = z
  .object({
    schema_version: z.literal("helix-workflow-execution-policy.v1"),
    projection_role: z.literal("generated_projection"),
    source_registry: z
      .object({
        path: z.literal(WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH),
        schema_version: z.literal("helix-workflow-execution-policy-registry.v1"),
        registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
        requirements_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
        requirements_source_digest: digestSchema,
        classification_registry_source_digest: digestSchema,
        policy_registry_source_digest: digestSchema,
      })
      .strict(),
    output_policy: z
      .object({
        typed_identity_only: z.literal(true),
        registered_command_id_only: z.literal(true),
        raw_command_emission: z.literal(false),
        legacy_identity_emission: z.literal(false),
        unsupported_disposition: z.literal("fail_close"),
      })
      .strict(),
    policy: projectedPolicySchema,
  })
  .strict();

export type WorkflowExecutionPolicyProjection = z.infer<
  typeof workflowExecutionPolicyProjectionSchema
>;

function sha256(bytes: Uint8Array): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function projectWorkflowExecutionPolicy(
  registry: WorkflowExecutionPolicyRegistry,
  registrySourceBytes: Uint8Array,
): WorkflowExecutionPolicyProjection {
  return workflowExecutionPolicyProjectionSchema.parse({
    schema_version: "helix-workflow-execution-policy.v1",
    projection_role: "generated_projection",
    source_registry: {
      path: WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH,
      schema_version: registry.schema_version,
      registry_version: registry.registry_version,
      requirements_version: registry.requirements_version,
      requirements_source_digest: registry.authority.source_digest,
      classification_registry_source_digest: registry.classification_registry.source_digest,
      policy_registry_source_digest: sha256(registrySourceBytes),
    },
    output_policy: {
      typed_identity_only: true,
      registered_command_id_only: true,
      raw_command_emission: false,
      legacy_identity_emission: false,
      unsupported_disposition: "fail_close",
    },
    policy: {
      coverage: registry.coverage,
      consumer_contract: registry.consumer_contract,
      command_registry: registry.command_registry,
      bindings: registry.bindings,
    },
  });
}

export function assertWorkflowExecutionPolicyProjectionCurrent(
  actual: WorkflowExecutionPolicyProjection,
  expected: WorkflowExecutionPolicyProjection,
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      "workflow execution policy projection drift: regenerate from requirements registry",
    );
  }
}

export function loadWorkflowExecutionPolicyProjection(
  repoRoot: string = process.cwd(),
): WorkflowExecutionPolicyProjection {
  const registryBytes = readFileSync(resolve(repoRoot, WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH));
  const registry = loadWorkflowExecutionPolicyRegistry(repoRoot);
  const expected = projectWorkflowExecutionPolicy(registry, registryBytes);
  const actual = workflowExecutionPolicyProjectionSchema.parse(
    JSON.parse(readFileSync(resolve(repoRoot, WORKFLOW_EXECUTION_POLICY_PROJECTION_PATH), "utf8")),
  );
  assertWorkflowExecutionPolicyProjectionCurrent(actual, expected);
  return actual;
}
