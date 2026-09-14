import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { loadWorkflowClassificationRegistry } from "./workflow-classification-registry.js";

export const WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_AUTHORITY_PATH =
  "docs/design/helix/L3-requirements/workflow-classification-terminal-fullback-authority.v1.json";

const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u);
const planIdSchema = z.string().regex(/^PLAN-[A-Za-z0-9-]+$/u);
const axisSchema = z.string().min(1);
const identityIdSchema = z.string().regex(/^[A-Z][A-Z0-9_]*$/u);

export const workflowClassificationTerminalFullbackAuthoritySchema = z
  .object({
    schema_version: z.literal("helix-workflow-classification-terminal-fullback-authority.v1"),
    authority_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    requirements_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    authority: z
      .object({
        kind: z.literal("requirements"),
        source: z.literal("docs/governance/helix-harness-requirements_v1.3.md"),
        source_digest: digestSchema,
        sections: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    forward_slices: z
      .array(
        z
          .object({
            plan_id: planIdSchema,
            plan_path: z.string().startsWith("docs/plans/"),
            pr_number: z.number().int().positive(),
          })
          .strict(),
      )
      .min(1),
    consumers: z
      .array(
        z
          .object({
            name: z.string().min(1),
            target_axis: axisSchema,
            target_id: identityIdSchema,
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((authority, context) => {
    const planIds = new Set<string>();
    for (const [index, slice] of authority.forward_slices.entries()) {
      if (planIds.has(slice.plan_id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["forward_slices", index, "plan_id"],
          message: `duplicate terminal fullback plan id: ${slice.plan_id}`,
        });
      }
      planIds.add(slice.plan_id);
    }
    const consumerNames = new Set<string>();
    for (const [index, consumer] of authority.consumers.entries()) {
      if (consumerNames.has(consumer.name)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["consumers", index, "name"],
          message: `duplicate terminal fullback consumer: ${consumer.name}`,
        });
      }
      consumerNames.add(consumer.name);
    }
  });

export type WorkflowClassificationTerminalFullbackAuthority = z.infer<
  typeof workflowClassificationTerminalFullbackAuthoritySchema
>;

export function loadWorkflowClassificationTerminalFullbackAuthority(
  repoRoot: string = process.cwd(),
): WorkflowClassificationTerminalFullbackAuthority {
  const authority = workflowClassificationTerminalFullbackAuthoritySchema.parse(
    JSON.parse(
      readFileSync(
        resolve(repoRoot, WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_AUTHORITY_PATH),
        "utf8",
      ),
    ),
  );
  const registry = loadWorkflowClassificationRegistry(repoRoot);
  if (
    authority.requirements_version !== registry.requirements_version ||
    authority.authority.source_digest !== registry.authority.source_digest
  ) {
    throw new Error("workflow classification terminal fullback authority drift");
  }
  return authority;
}
