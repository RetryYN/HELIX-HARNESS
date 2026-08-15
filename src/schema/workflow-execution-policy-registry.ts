import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import {
  loadWorkflowClassificationRegistry,
  WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
  workflowClassificationAxisSchema,
} from "./workflow-classification-registry.js";

export const WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH =
  "docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json";

const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u);
const commandIdSchema = z.string().regex(/^[A-Z][A-Z0-9_]*$/u);
const identityIdSchema = z.string().regex(/^[A-Z][A-Z0-9_]*$/u);
const safeTokenSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      !/[;&|`$<>\n\r]/u.test(value) &&
      !value.includes("$(") &&
      !value.startsWith("/") &&
      !/^[A-Za-z]:[\\/]/u.test(value),
    "command token must not contain shell syntax or an absolute path",
  );

export const workflowExecutionPolicyCommandSchema = z
  .object({
    command_id: commandIdSchema,
    program: z.literal("helix"),
    argv: z.array(safeTokenSchema).min(1),
    surface: z.literal("cli"),
    escalation_class: z.enum(["read_only", "planning"]),
  })
  .strict();

const conditionsSchema = z
  .object({
    production_impact: z.boolean(),
    destructive_data_operation: z.boolean(),
    credential_access: z.boolean(),
    backend_derived: z.boolean(),
  })
  .strict();

export const workflowExecutionPolicyBindingSchema = z
  .object({
    binding_id: commandIdSchema,
    target_axis: workflowClassificationAxisSchema,
    target_id: identityIdSchema,
    precedence: z.number().int().nonnegative(),
    command_id: commandIdSchema,
    action_stage: z.enum(["classify", "plan", "execute", "verify", "approve"]),
    preflight_policy: z.enum(["none", "required", "conditional"]),
    approval_policy: z.enum(["none", "action_binding", "po_directive"]),
    execution_form: z.enum(["standard", "pair_cell"]),
    applies_when: conditionsSchema,
  })
  .strict();

export const workflowExecutionPolicyRegistrySchema = z
  .object({
    schema_version: z.literal("helix-workflow-execution-policy-registry.v1"),
    registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    requirements_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    authority: z
      .object({
        kind: z.literal("requirements"),
        source: z.literal("docs/governance/helix-harness-requirements_v1.3.md"),
        source_digest: digestSchema,
        sections: z.tuple([z.literal("4.2.2")]),
      })
      .strict(),
    classification_registry: z
      .object({
        path: z.literal(WORKFLOW_CLASSIFICATION_REGISTRY_PATH),
        schema_version: z.literal("helix-workflow-classification-registry.v1"),
        registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
        source_digest: digestSchema,
      })
      .strict(),
    coverage: z
      .object({
        state: z.literal("partial_fail_close"),
        unsupported_identity_disposition: z.literal("fail_close"),
        legacy_identity_emission: z.literal(false),
      })
      .strict(),
    command_registry: z.array(workflowExecutionPolicyCommandSchema).min(1),
    bindings: z.array(workflowExecutionPolicyBindingSchema).min(1),
  })
  .strict()
  .superRefine((registry, context) => {
    const commandIds = new Set<string>();
    for (const command of registry.command_registry) {
      if (commandIds.has(command.command_id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["command_registry"],
          message: `duplicate command id: ${command.command_id}`,
        });
      }
      commandIds.add(command.command_id);
    }

    const bindingIds = new Set<string>();
    const bindingKeys = new Set<string>();
    for (const binding of registry.bindings) {
      if (bindingIds.has(binding.binding_id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bindings"],
          message: `duplicate binding id: ${binding.binding_id}`,
        });
      }
      bindingIds.add(binding.binding_id);
      if (!commandIds.has(binding.command_id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bindings"],
          message: `unregistered command id: ${binding.command_id}`,
        });
      }
      const conditions = Object.entries(binding.applies_when)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(",");
      const key = [
        binding.target_axis,
        binding.target_id,
        binding.execution_form,
        binding.precedence,
        conditions,
      ].join("|");
      if (bindingKeys.has(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bindings"],
          message: `duplicate execution policy binding: ${key}`,
        });
      }
      bindingKeys.add(key);
      const highImpact =
        binding.applies_when.production_impact ||
        binding.applies_when.destructive_data_operation ||
        binding.applies_when.credential_access;
      if (highImpact && binding.approval_policy !== "action_binding") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bindings"],
          message: `high-impact binding requires action_binding approval: ${binding.binding_id}`,
        });
      }
    }
  });

export type WorkflowExecutionPolicyRegistry = z.infer<typeof workflowExecutionPolicyRegistrySchema>;

export function resolveWorkflowExecutionPolicy(
  registry: WorkflowExecutionPolicyRegistry,
  input: {
    target_axis: z.infer<typeof workflowClassificationAxisSchema>;
    target_id: string;
    execution_form: "standard" | "pair_cell";
    applies_when: z.infer<typeof conditionsSchema>;
  },
):
  | { disposition: "resolved"; binding: WorkflowExecutionPolicyRegistry["bindings"][number] }
  | { disposition: "unsupported" | "ambiguous"; binding: null } {
  const matches = registry.bindings
    .filter(
      (binding) =>
        binding.target_axis === input.target_axis &&
        binding.target_id === input.target_id &&
        binding.execution_form === input.execution_form &&
        Object.entries(input.applies_when).every(
          ([key, value]) =>
            binding.applies_when[key as keyof typeof binding.applies_when] === value,
        ),
    )
    .sort((left, right) => right.precedence - left.precedence);
  if (matches.length === 0) return { disposition: "unsupported", binding: null };
  if (matches.length > 1 && matches[0]?.precedence === matches[1]?.precedence) {
    return { disposition: "ambiguous", binding: null };
  }
  const binding = matches[0];
  return binding
    ? { disposition: "resolved", binding }
    : { disposition: "unsupported", binding: null };
}

function sha256(bytes: Uint8Array): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function loadWorkflowExecutionPolicyRegistry(
  repoRoot: string = process.cwd(),
): WorkflowExecutionPolicyRegistry {
  const registry = workflowExecutionPolicyRegistrySchema.parse(
    JSON.parse(readFileSync(resolve(repoRoot, WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH), "utf8")),
  );
  const requirementsBytes = readFileSync(resolve(repoRoot, registry.authority.source));
  if (sha256(requirementsBytes) !== registry.authority.source_digest) {
    throw new Error("workflow execution policy requirements digest mismatch");
  }
  const classificationBytes = readFileSync(
    resolve(repoRoot, registry.classification_registry.path),
  );
  if (sha256(classificationBytes) !== registry.classification_registry.source_digest) {
    throw new Error("workflow execution policy classification registry digest mismatch");
  }
  const classification = loadWorkflowClassificationRegistry(repoRoot);
  if (classification.registry_version !== registry.classification_registry.registry_version) {
    throw new Error("workflow execution policy classification registry version mismatch");
  }
  if (classification.requirements_version !== registry.requirements_version) {
    throw new Error("workflow execution policy requirements version mismatch");
  }
  const identities = new Set(
    classification.entities.map((entity) => `${entity.axis}:${entity.id}`),
  );
  for (const binding of registry.bindings) {
    if (!identities.has(`${binding.target_axis}:${binding.target_id}`)) {
      throw new Error(
        `workflow execution policy binding targets unknown identity: ${binding.target_axis}:${binding.target_id}`,
      );
    }
  }
  return registry;
}
