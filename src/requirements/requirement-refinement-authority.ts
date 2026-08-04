import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
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
    source_projection: z.literal("markdown_h4_v1"),
    acceptance_ids: z.array(refinementIdSchema).min(1),
  })
  .strict();

const acceptanceSchema = semanticRecord
  .extend({
    acceptance_id: refinementIdSchema,
    source_projection: z.literal("markdown_table_v1"),
    requirement_ids: z.array(refinementIdSchema).min(1),
    polarity: z.enum(["positive", "negative", "boundary"]),
  })
  .strict();

const acceptanceOwnerSchema = z
  .object({
    issue_id: z.number().int().positive(),
    owner_kind: z.enum(["implementation", "parent_acceptance"]),
    acceptance_ids: z.array(refinementIdSchema).min(1),
  })
  .strict();

const approvalSchema = z
  .object({
    authority: z.literal("PO"),
    decision_source: z.string().min(1),
    decision_digest: digestSchema,
    subject_digest: digestSchema,
    source_set_digest: digestSchema,
    candidate_head: z.string().regex(/^[0-9a-f]{40}$/),
    approved_revision: z.number().int().positive(),
    target_lifecycle: z.enum(["approved", "frozen"]),
    downstream_issue_snapshot: z
      .object({
        snapshot_digest: digestSchema,
        observed_at: z.string().datetime({ offset: true }),
        issues: z
          .array(
            z
              .object({
                number: z.number().int().positive(),
                state: z.literal("open"),
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
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
    acceptance_owners: z.array(acceptanceOwnerSchema).min(1),
    approval: approvalSchema.nullable(),
    semantic_digest: digestSchema,
  })
  .strict();

export type RequirementRefinementRecord = z.infer<typeof requirementRefinementSchema>;

export interface RequirementRefinementValidationContext {
  repoRoot: string;
  baselineSystemContractIds: ReadonlySet<string>;
  currentHead: string;
  planStatus?: string;
  approvalMaterial?: RequirementRefinementApprovalMaterial;
}

export interface RequirementRefinementApprovalMaterial {
  candidateHead: string;
  isAncestor: boolean;
  refinementContractId: string;
  revision: number;
  lifecycleStatus: RequirementRefinementRecord["lifecycle_status"];
  approvalAbsent: boolean;
  subjectDigest: string;
}

export interface RequirementRefinementValidationResult {
  ok: boolean;
  failureCodes: string[];
}

function unique<T>(values: readonly T[]): boolean {
  return new Set(values).size === values.length;
}

function sha256(bytes: string): string {
  return `sha256:${createHash("sha256").update(bytes, "utf8").digest("hex")}`;
}

function semanticDigest(value: { semantic_digest: string } & Record<string, unknown>): string {
  const { semantic_digest: _digest, ...semantic } = value;
  return requirementIrSemanticDigest(semantic);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function projectH4Statement(source: string, id: string): string | undefined {
  const match = source.match(
    new RegExp(`^#### ${escapeRegExp(id)} ([^\\n]+)\\n\\n([\\s\\S]*?)(?=\\n#### |\\n## )`, "m"),
  );
  return match ? `${match[1]}\n\n${match[2]?.trim() ?? ""}` : undefined;
}

function expandRequirementIds(value: string): string[] {
  const normalized = value.replaceAll("`", "");
  const range = normalized.match(/^([A-Z][A-Z0-9-]*-)(\d{2})\.\.(\d{2})$/);
  if (range) {
    const start = Number(range[2]);
    const end = Number(range[3]);
    return Array.from(
      { length: end - start + 1 },
      (_, index) => `${range[1]}${String(start + index).padStart(2, "0")}`,
    );
  }
  const slash = normalized.match(/^([A-Z][A-Z0-9-]*-)(\d{2})\/(\d{2})$/);
  return slash ? [`${slash[1]}${slash[2]}`, `${slash[1]}${slash[3]}`] : [normalized];
}

function projectAcceptanceRow(
  source: string,
  id: string,
): { statement: string; requirementIds: string[]; polarity: "boundary" } | undefined {
  const line = source.split("\n").find((candidate) => candidate.startsWith(`| \`${id}\` |`));
  if (!line) return undefined;
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
  if (cells.length < 5) return undefined;
  return {
    requirementIds: expandRequirementIds(cells[1] ?? ""),
    polarity: "boundary",
    statement: `入力／操作: ${cells[2]}\n合格条件: ${cells[3]}\nnegative mutation: ${cells[4]}`,
  };
}

export function refinementSourceSetDigest(record: RequirementRefinementRecord): string {
  return requirementIrSemanticDigest({
    requirement_digest: record.source.requirement_digest,
    acceptance_digest: record.source.acceptance_digest,
  });
}

export function refinementApprovalSubjectDigest(record: RequirementRefinementRecord): string {
  const {
    approval: _approval,
    lifecycle_status: _lifecycleStatus,
    semantic_digest: _semanticDigest,
    ...subject
  } = record;
  return requirementIrSemanticDigest(subject);
}

export function refinementApprovalDecisionDigest(
  approval: Omit<NonNullable<RequirementRefinementRecord["approval"]>, "decision_digest">,
): string {
  return requirementIrSemanticDigest(approval);
}

export function refinementDownstreamIssueSnapshotDigest(
  snapshot: Omit<
    NonNullable<RequirementRefinementRecord["approval"]>["downstream_issue_snapshot"],
    "snapshot_digest"
  >,
): string {
  return requirementIrSemanticDigest(snapshot);
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
  const sourceTexts = new Map<string, string>();
  for (const [path, expected] of [
    [record.source.requirement_path, record.source.requirement_digest],
    [record.source.acceptance_path, record.source.acceptance_digest],
  ] as const) {
    try {
      const sourceText = readFileSync(join(context.repoRoot, path), "utf8");
      sourceTexts.set(path, sourceText);
      if (sha256(sourceText) !== expected) {
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
  const acceptanceOwnerIssueIds = record.acceptance_owners.map((owner) => owner.issue_id);
  const ownedAcceptanceIds = record.acceptance_owners.flatMap((owner) => owner.acceptance_ids);
  const implementationIssueIds = record.acceptance_owners
    .filter((owner) => owner.owner_kind === "implementation")
    .map((owner) => owner.issue_id);
  if (
    !unique(acceptanceOwnerIssueIds) ||
    !unique(ownedAcceptanceIds) ||
    ownedAcceptanceIds.length !== acceptanceIds.length ||
    ownedAcceptanceIds.some((id) => !acceptanceSet.has(id)) ||
    acceptanceIds.some((id) => !ownedAcceptanceIds.includes(id)) ||
    implementationIssueIds.join("\0") !== record.downstream_issue_ids.join("\0") ||
    record.acceptance_owners.filter((owner) => owner.owner_kind === "parent_acceptance").length !==
      1
  ) {
    failures.add("REFINEMENT_DOWNSTREAM_INCOMPLETE");
  }
  const forward = new Set<string>();
  const reverse = new Set<string>();
  for (const requirement of record.supporting_requirements) {
    const projectedStatement = projectH4Statement(
      sourceTexts.get(record.source.requirement_path) ?? "",
      requirement.requirement_id,
    );
    if (
      requirement.source_projection !== "markdown_h4_v1" ||
      projectedStatement !== requirement.statement ||
      semanticDigest(requirement) !== requirement.semantic_digest ||
      !unique(requirement.acceptance_ids) ||
      requirement.acceptance_ids.some((id) => !acceptanceSet.has(id))
    ) {
      failures.add(
        projectedStatement !== requirement.statement
          ? "REFINEMENT_SOURCE_PROJECTION_DRIFT"
          : "REFINEMENT_TRACE_INCOMPLETE",
      );
    }
    for (const acceptanceId of requirement.acceptance_ids) {
      forward.add(`${requirement.requirement_id}\u0000${acceptanceId}`);
    }
  }
  for (const acceptance of record.acceptance_cases) {
    const projection = projectAcceptanceRow(
      sourceTexts.get(record.source.acceptance_path) ?? "",
      acceptance.acceptance_id,
    );
    if (
      acceptance.source_projection !== "markdown_table_v1" ||
      projection?.statement !== acceptance.statement ||
      projection?.polarity !== acceptance.polarity ||
      projection?.requirementIds.join("\0") !== acceptance.requirement_ids.join("\0") ||
      semanticDigest(acceptance) !== acceptance.semantic_digest ||
      !unique(acceptance.requirement_ids) ||
      acceptance.requirement_ids.some((id) => !requirementSet.has(id))
    ) {
      failures.add(
        !projection ||
          projection.statement !== acceptance.statement ||
          projection.polarity !== acceptance.polarity ||
          projection.requirementIds.join("\0") !== acceptance.requirement_ids.join("\0")
          ? "REFINEMENT_SOURCE_PROJECTION_DRIFT"
          : "REFINEMENT_TRACE_INCOMPLETE",
      );
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
  if (approvalRequired) {
    const approval = record.approval;
    const material = context.approvalMaterial;
    if (!approval) {
      failures.add("REFINEMENT_APPROVAL_MISSING");
    } else {
      const { decision_digest: _decisionDigest, ...decisionPayload } = approval;
      const subjectDigest = refinementApprovalSubjectDigest(record);
      const { snapshot_digest: _snapshotDigest, ...snapshotPayload } =
        approval.downstream_issue_snapshot;
      const observedIssues = approval.downstream_issue_snapshot.issues.map((issue) => issue.number);
      if (
        approval.approved_revision !== record.revision ||
        approval.target_lifecycle !== record.lifecycle_status ||
        approval.source_set_digest !== refinementSourceSetDigest(record) ||
        approval.subject_digest !== subjectDigest ||
        approval.decision_digest !== refinementApprovalDecisionDigest(decisionPayload) ||
        approval.downstream_issue_snapshot.snapshot_digest !==
          refinementDownstreamIssueSnapshotDigest(snapshotPayload) ||
        new Set(observedIssues).size !== observedIssues.length ||
        observedIssues.join("\0") !== acceptanceOwnerIssueIds.join("\0") ||
        (record.lifecycle_status === "frozen" && context.planStatus !== "confirmed") ||
        approval.candidate_head === context.currentHead ||
        !material ||
        material.candidateHead !== approval.candidate_head ||
        !material.isAncestor ||
        material.refinementContractId !== record.refinement_contract_id ||
        material.revision !== record.revision ||
        material.lifecycleStatus !== "specified" ||
        !material.approvalAbsent ||
        material.subjectDigest !== subjectDigest
      ) {
        failures.add("REFINEMENT_APPROVAL_MISSING");
      }
    }
  }
  if (semanticDigest(record) !== record.semantic_digest) failures.add("REFINEMENT_SCHEMA_INVALID");
  return { ok: failures.size === 0, failureCodes: [...failures].sort() };
}
