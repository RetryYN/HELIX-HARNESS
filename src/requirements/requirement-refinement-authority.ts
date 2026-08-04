import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { sha256Digest } from "../runtime/digest";
import { requirementIrSemanticDigest } from "./requirement-ir-shadow";

const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const ownerSchema = z.string().regex(/^HR-FR-HIL-[0-9]{2}$/);
const refinementIdSchema = z.string().regex(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/);
const sourcePathSchema = z
  .string()
  .regex(/^docs\/(design\/helix\/L3-requirements|test-design\/helix)\/[a-z0-9][a-z0-9._-]*\.md$/);

const semanticRecord = z
  .object({
    statement: z.string().min(1),
    semantic_digest: digestSchema,
  })
  .strict();

const supportingRequirementSchema = semanticRecord
  .extend({
    requirement_id: refinementIdSchema,
    acceptance_ids: z.array(refinementIdSchema).min(1),
  })
  .strict();

const acceptanceSchema = semanticRecord
  .extend({
    acceptance_id: refinementIdSchema,
    requirement_ids: z.array(refinementIdSchema).min(1),
    polarity: z.enum(["positive", "negative", "boundary"]),
  })
  .strict();

const approvalSchema = z
  .object({
    authority: z.literal("PO"),
    decision_source: z.string().min(1),
    decision_digest: digestSchema,
    source_set_digest: digestSchema,
    candidate_head: z.string().regex(/^[0-9a-f]{40}$/),
    approved_revision: z.number().int().positive(),
    approved_at: z.string().datetime({ offset: true }),
  })
  .strict();

export const requirementRefinementSchema = z
  .object({
    schema_version: z.literal("helix-requirement-refinement.v1"),
    refinement_contract_id: refinementIdSchema,
    revision: z.number().int().positive(),
    lifecycle_status: z.enum([
      "draft",
      "specified",
      "approved",
      "frozen",
      "rejected",
      "superseded",
    ]),
    primary_system_contract_id: ownerSchema,
    related_system_contract_ids: z.array(ownerSchema),
    source: z
      .object({
        requirement_path: sourcePathSchema,
        requirement_digest: digestSchema,
        acceptance_path: sourcePathSchema,
        acceptance_digest: digestSchema,
      })
      .strict(),
    plan_id: z.string().regex(/^PLAN-[A-Za-z0-9-]+$/),
    responsibility_owner: z.string().min(1),
    supporting_requirements: z.array(supportingRequirementSchema).min(1),
    acceptance_cases: z.array(acceptanceSchema).min(1),
    downstream_issue_ids: z.array(z.number().int().positive()),
    approval: approvalSchema.nullable(),
    semantic_digest: digestSchema,
  })
  .strict();

export type RequirementRefinementRecord = z.infer<typeof requirementRefinementSchema>;

export interface RequirementRefinementValidationContext {
  repoRoot: string;
  baselineSystemContractIds: ReadonlySet<string>;
  candidateHead: string;
}

export interface RequirementRefinementValidationResult {
  ok: boolean;
  failureCodes: string[];
}

function unique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function semanticDigest(value: { semantic_digest: string } & Record<string, unknown>): string {
  const { semantic_digest: _digest, ...semantic } = value;
  return requirementIrSemanticDigest(semantic);
}

export function refinementSourceSetDigest(record: RequirementRefinementRecord): string {
  return requirementIrSemanticDigest({
    requirement_digest: record.source.requirement_digest,
    acceptance_digest: record.source.acceptance_digest,
  });
}

export function validateRequirementRefinement(
  input: unknown,
  context: RequirementRefinementValidationContext,
): RequirementRefinementValidationResult {
  const parsed = requirementRefinementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, failureCodes: ["REFINEMENT_SCHEMA_INVALID"] };
  const record = parsed.data;
  const failures = new Set<string>();
  const owners = [record.primary_system_contract_id, ...record.related_system_contract_ids];
  if (!unique(owners) || owners.some((owner) => !context.baselineSystemContractIds.has(owner))) {
    failures.add("REFINEMENT_OWNER_ORPHAN");
  }
  for (const [path, expected] of [
    [record.source.requirement_path, record.source.requirement_digest],
    [record.source.acceptance_path, record.source.acceptance_digest],
  ] as const) {
    try {
      if (sha256Digest(readFileSync(join(context.repoRoot, path), "utf8")) !== expected) {
        failures.add("REFINEMENT_SOURCE_STALE");
      }
    } catch {
      failures.add("REFINEMENT_SOURCE_STALE");
    }
  }
  const requirementIds = record.supporting_requirements.map((item) => item.requirement_id);
  const acceptanceIds = record.acceptance_cases.map((item) => item.acceptance_id);
  if (
    !unique(requirementIds) ||
    !unique(acceptanceIds) ||
    requirementIds.includes(record.refinement_contract_id) ||
    acceptanceIds.some((id) => requirementIds.includes(id))
  ) {
    failures.add("REFINEMENT_DUPLICATE_ID");
  }
  const requirementSet = new Set(requirementIds);
  const acceptanceSet = new Set(acceptanceIds);
  const forward = new Set<string>();
  const reverse = new Set<string>();
  for (const requirement of record.supporting_requirements) {
    if (
      semanticDigest(requirement) !== requirement.semantic_digest ||
      !unique(requirement.acceptance_ids) ||
      requirement.acceptance_ids.some((id) => !acceptanceSet.has(id))
    ) {
      failures.add("REFINEMENT_TRACE_INCOMPLETE");
    }
    for (const acceptanceId of requirement.acceptance_ids) {
      forward.add(`${requirement.requirement_id}\u0000${acceptanceId}`);
    }
  }
  for (const acceptance of record.acceptance_cases) {
    if (
      semanticDigest(acceptance) !== acceptance.semantic_digest ||
      !unique(acceptance.requirement_ids) ||
      acceptance.requirement_ids.some((id) => !requirementSet.has(id))
    ) {
      failures.add("REFINEMENT_TRACE_INCOMPLETE");
    }
    for (const requirementId of acceptance.requirement_ids) {
      reverse.add(`${requirementId}\u0000${acceptance.acceptance_id}`);
    }
  }
  if (
    forward.size !== reverse.size ||
    [...forward].some((edge) => !reverse.has(edge)) ||
    requirementIds.some((id) => ![...forward].some((edge) => edge.startsWith(`${id}\u0000`))) ||
    acceptanceIds.some((id) => ![...reverse].some((edge) => edge.endsWith(`\u0000${id}`)))
  ) {
    failures.add("REFINEMENT_TRACE_INCOMPLETE");
  }
  const approvalRequired =
    record.lifecycle_status === "approved" || record.lifecycle_status === "frozen";
  if (
    approvalRequired &&
    (!record.approval ||
      record.approval.approved_revision !== record.revision ||
      record.approval.source_set_digest !== refinementSourceSetDigest(record) ||
      record.approval.candidate_head !== context.candidateHead)
  ) {
    failures.add("REFINEMENT_APPROVAL_MISSING");
  }
  if (semanticDigest(record) !== record.semantic_digest) failures.add("REFINEMENT_SCHEMA_INVALID");
  return { ok: failures.size === 0, failureCodes: [...failures].sort() };
}
