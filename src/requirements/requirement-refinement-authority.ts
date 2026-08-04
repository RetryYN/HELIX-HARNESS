import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { requirementIrSemanticDigest } from "./requirement-ir-shadow";

const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const ownerSchema = z.string().regex(/^HR-FR-HIL-[0-9]{2}$/);
const refinementIdSchema = z.string().regex(/^[A-Z][A-Z0-9]*(?:-[A-Za-z0-9]+)+$/);
const sourcePathSchema = z
  .string()
  .regex(/^docs\/(design\/helix\/L3-requirements|test-design\/helix)\/[a-z0-9][a-z0-9._-]*\.md$/);

const semanticRecord = z
  .object({
    statement: z.string().min(1),
    semantic_digest: digestSchema,
  })
  .strict();

const requirementClauseSchema = semanticRecord
  .extend({
    requirement_id: refinementIdSchema,
    source_projection: z.enum([
      "markdown_h4_v1",
      "markdown_atx_section_v2",
      "markdown_requirement_table_v2",
      "markdown_requirement_bullet_v1",
    ]),
    source_identity: z
      .object({
        projection: z.literal("frontmatter_spec_defines_v1"),
        status: z.string().min(1),
        owner: z.string().min(1),
      })
      .strict()
      .optional(),
    acceptance_ids: z.array(refinementIdSchema).min(1),
  })
  .strict();

const contractRequirementSchema = requirementClauseSchema.extend({
  acceptance_ids: z.array(refinementIdSchema),
});

const acceptanceSchema = semanticRecord
  .extend({
    acceptance_id: refinementIdSchema,
    source_projection: z.enum(["markdown_table_v1", "markdown_acceptance_table_v2"]),
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
    contract_requirement: contractRequirementSchema.nullable(),
    supporting_requirements: z.array(requirementClauseSchema),
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
  const originalLines = source.split(/\r?\n/);
  const visibleLines = markdownContentLines(source);
  const pattern = new RegExp(`^#### ${escapeRegExp(id)} ([^\\n]+)$`);
  const matches = visibleLines.flatMap((line, index) => (pattern.test(line) ? [index] : []));
  if (matches.length !== 1) return undefined;
  const index = matches[0] ?? -1;
  const heading = visibleLines[index]?.match(pattern)?.[1];
  if (!heading || originalLines[index + 1] !== "") return undefined;
  let end = visibleLines.length;
  for (let cursor = index + 1; cursor < visibleLines.length; cursor += 1) {
    if (/^(?:#### |## )/.test(visibleLines[cursor] ?? "")) {
      end = cursor;
      break;
    }
  }
  return `${heading}\n\n${originalLines
    .slice(index + 2, end)
    .join("\n")
    .trim()}`;
}

function markdownContentLines(source: string): string[] {
  let fence: "```" | "~~~" | undefined;
  return source.split(/\r?\n/).map((line) => {
    const marker = line.trimStart().startsWith("```")
      ? "```"
      : line.trimStart().startsWith("~~~")
        ? "~~~"
        : undefined;
    if (marker) {
      fence = fence === marker ? undefined : fence ? fence : marker;
      return "";
    }
    return fence ? "" : line;
  });
}

function projectTypedSpecIdentity(
  source: string,
  id: string,
):
  | { kind: "absent" }
  | { kind: "ambiguous" }
  | {
      kind: "present";
      identity: { projection: "frontmatter_spec_defines_v1"; status: string; owner: string };
    } {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!frontmatter) return { kind: "absent" };
  try {
    const parsed = parseYaml(frontmatter) as {
      spec?: { defines?: Array<{ id?: unknown; status?: unknown; owner?: unknown }> };
    } | null;
    const definitions = parsed?.spec?.defines?.filter((candidate) => candidate.id === id) ?? [];
    if (definitions.length === 0) return { kind: "absent" };
    if (definitions.length !== 1) return { kind: "ambiguous" };
    const definition = definitions[0];
    return definition
      ? {
          kind: "present",
          identity: {
            projection: "frontmatter_spec_defines_v1",
            status: typeof definition.status === "string" ? definition.status : "",
            owner: typeof definition.owner === "string" ? definition.owner : "",
          },
        }
      : { kind: "ambiguous" };
  } catch {
    return { kind: "ambiguous" };
  }
}

function projectHeadingStatement(source: string, id: string): string | undefined {
  const originalLines = source.split(/\r?\n/);
  const lines = markdownContentLines(source);
  const escaped = escapeRegExp(id);
  const optionalBacktick = "`?";
  const headingPattern = new RegExp(
    `^(#{2,6})\\s+${optionalBacktick}${escaped}${optionalBacktick}\\s+(.+)$`,
  );
  const matches = lines.flatMap((line, index) => (headingPattern.test(line) ? [index] : []));
  if (matches.length !== 1) return undefined;
  const index = matches[0] ?? -1;
  const match = lines[index]?.match(headingPattern);
  if (!match?.[1] || !match[2]) return undefined;
  const level = match[1].length;
  let end = lines.length;
  for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
    const next = lines[cursor]?.match(/^(#{1,6})\s+/);
    if (next?.[1] && next[1].length <= level) {
      end = cursor;
      break;
    }
  }
  return `${match[2].trim()}\n\n${originalLines
    .slice(index + 1, end)
    .join("\n")
    .trim()}`;
}

function markdownCells(line: string): string[] | undefined {
  if (!line.trimStart().startsWith("|")) return undefined;
  const cells = line
    .trim()
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
  return cells.length > 0 ? cells : undefined;
}

function normalizedHeader(value: string): string {
  return value.replaceAll("`", "").replaceAll(/\s+/g, "").toLowerCase();
}

function markdownTables(source: string): Array<{ headers: string[]; rows: string[][] }> {
  const lines = markdownContentLines(source);
  const tables: Array<{ headers: string[]; rows: string[][] }> = [];
  for (let index = 0; index + 1 < lines.length; index += 1) {
    const headers = markdownCells(lines[index] ?? "");
    const separator = markdownCells(lines[index + 1] ?? "");
    if (
      !headers ||
      !separator ||
      headers.length !== separator.length ||
      !separator.every((cell) => /^:?-{3,}:?$/.test(cell))
    ) {
      continue;
    }
    const rows: string[][] = [];
    for (let cursor = index + 2; cursor < lines.length; cursor += 1) {
      const cells = markdownCells(lines[cursor] ?? "");
      if (!cells || cells.length !== headers.length) break;
      rows.push(cells);
      index = cursor;
    }
    tables.push({ headers, rows });
  }
  return tables;
}

function cellId(value: string): string {
  return value.replaceAll("`", "").trim();
}

const REQUIREMENT_ID_HEADERS = new Set(["frid", "requirementid", "要件id", "id"]);
const REQUIREMENT_STATEMENT_HEADERS = new Set([
  "要件",
  "要件（shall）",
  "refinement要件",
  "拘束",
  "statement",
]);
const REQUIREMENT_ACCEPTANCE_HEADERS = new Set([
  "ac",
  "ac-id",
  "acid",
  "受入id",
  "受入条件",
  "主なac",
  "acceptance",
]);

function projectRequirementTable(
  source: string,
  id: string,
): { statement: string; acceptanceIds?: string[] } | undefined {
  const matches: Array<{ statement: string; acceptanceIds?: string[] }> = [];
  for (const table of markdownTables(source)) {
    const headers = table.headers.map(normalizedHeader);
    const idIndexes = headers.flatMap((header, index) =>
      REQUIREMENT_ID_HEADERS.has(header) ? [index] : [],
    );
    const statementIndexes = headers.flatMap((header, index) =>
      REQUIREMENT_STATEMENT_HEADERS.has(header) ? [index] : [],
    );
    const acceptanceIndexes = headers.flatMap((header, index) =>
      REQUIREMENT_ACCEPTANCE_HEADERS.has(header) ? [index] : [],
    );
    if (idIndexes.length !== 1 || statementIndexes.length !== 1 || acceptanceIndexes.length > 1) {
      continue;
    }
    const idIndex = idIndexes[0] ?? -1;
    const statementIndex = statementIndexes[0] ?? -1;
    const acceptanceIndex = acceptanceIndexes[0];
    for (const row of table.rows.filter((candidate) => cellId(candidate[idIndex] ?? "") === id)) {
      if (!row[statementIndex]) continue;
      matches.push({
        statement: row[statementIndex],
        ...(acceptanceIndex !== undefined && row[acceptanceIndex]
          ? { acceptanceIds: expandRequirementIds(row[acceptanceIndex]) }
          : {}),
      });
    }
  }
  return matches.length === 1 ? matches[0] : undefined;
}

function projectRequirementBulletStatement(source: string, id: string): string | undefined {
  const lines = markdownContentLines(source);
  const escaped = escapeRegExp(id);
  const optionalBacktick = "`?";
  const pattern = new RegExp(
    `^\\s*[-*]\\s+${optionalBacktick}${escaped}${optionalBacktick}(?:\\s*[:：-]\\s*|\\s+)(.+)$`,
  );
  const matches = lines.flatMap((line, index) => (pattern.test(line) ? [index] : []));
  if (matches.length !== 1) return undefined;
  const index = matches[0] ?? -1;
  const match = lines[index]?.match(pattern);
  if (!match?.[1]) return undefined;
  const continuation: string[] = [];
  for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
    const line = lines[cursor] ?? "";
    if (/^\s*[-*]\s+/.test(line) || /^#{1,6}\s+/.test(line)) break;
    if (line.trim()) continuation.push(line.trim());
  }
  return [match[1].trim(), ...continuation].join("\n");
}

function expandSingleRequirementId(normalized: string): string[] {
  const slashParts = normalized.split(/\s*\/\s*/);
  if (slashParts.length > 1) {
    const first = slashParts[0] ?? "";
    if (slashParts.every((part) => refinementIdSchema.safeParse(part).success)) return slashParts;
    const shortBase = first.match(/^(.+-\d{2})[a-z]$/i)?.[1];
    if (shortBase && slashParts.slice(1).every((part) => /^[a-z]$/i.test(part))) {
      return [first, ...slashParts.slice(1).map((part) => `${shortBase}${part}`)];
    }
    const numericBase = first.match(/^(.+-)\d{2}$/)?.[1];
    if (numericBase && slashParts.slice(1).every((part) => /^\d{2}$/.test(part))) {
      return [first, ...slashParts.slice(1).map((part) => `${numericBase}${part}`)];
    }
  }
  const range = normalized.match(/^([A-Z][A-Z0-9-]*-)(\d{2})\.\.(\d{2})$/);
  if (range) {
    const start = Number(range[2]);
    const end = Number(range[3]);
    return Array.from(
      { length: end - start + 1 },
      (_, index) => `${range[1]}${String(start + index).padStart(2, "0")}`,
    );
  }
  return [normalized];
}

function expandRequirementIds(value: string): string[] {
  return value
    .replaceAll("`", "")
    .split(/\s*(?:,|、|<br\s*\/?>)\s*/i)
    .filter(Boolean)
    .flatMap(expandSingleRequirementId);
}

function projectAcceptanceRow(
  source: string,
  id: string,
): { statement: string; requirementIds: string[]; polarity: "boundary" } | undefined {
  const expectedHeaders = ["acid", "対応requirement", "入力／操作", "合格条件", "negativemutation"];
  const matches = markdownTables(source).flatMap((table) => {
    const headers = table.headers.map(normalizedHeader);
    if (headers.join("\0") !== expectedHeaders.join("\0")) return [];
    return table.rows.filter((row) => cellId(row[0] ?? "") === id);
  });
  if (matches.length !== 1) return undefined;
  const cells = matches[0] ?? [];
  return {
    requirementIds: expandRequirementIds(cells[1] ?? ""),
    polarity: "boundary",
    statement: `入力／操作: ${cells[2]}\n合格条件: ${cells[3]}\nnegative mutation: ${cells[4]}`,
  };
}

const ACCEPTANCE_ID_HEADERS = new Set(["ac-id", "acid", "ac", "testid", "hatid", "受入id"]);
const ACCEPTANCE_TRACE_HEADERS = new Set([
  "対応要件",
  "対応fr",
  "対応fr/ac",
  "requirement",
  "requirements",
  "trace",
]);
const POSITIVE_HEADERS = new Set(["positive", "positiveoracle", "正常系", "合格条件", "期待結果"]);
const NEGATIVE_HEADERS = new Set([
  "negative",
  "negativeoracle",
  "negativemutation",
  "異常系",
  "拒否条件",
  "negative/拒否条件",
]);

function projectAcceptanceTableRow(
  source: string,
  id: string,
):
  | {
      statement: string;
      requirementIds?: string[];
      polarity: "positive" | "negative" | "boundary";
    }
  | undefined {
  const matches: Array<{
    statement: string;
    requirementIds?: string[];
    polarity: "positive" | "negative" | "boundary";
  }> = [];
  for (const table of markdownTables(source)) {
    const headers = table.headers.map(normalizedHeader);
    const idIndexes = headers.flatMap((header, index) =>
      ACCEPTANCE_ID_HEADERS.has(header) ? [index] : [],
    );
    const traceIndexes = headers.flatMap((header, index) =>
      ACCEPTANCE_TRACE_HEADERS.has(header) ? [index] : [],
    );
    if (idIndexes.length !== 1 || traceIndexes.length > 1) continue;
    const idIndex = idIndexes[0] ?? -1;
    const traceIndex = traceIndexes[0];
    for (const row of table.rows.filter((candidate) => cellId(candidate[idIndex] ?? "") === id)) {
      const semanticCells = headers
        .map((header, index) => ({ header, index, value: row[index] ?? "" }))
        .filter(
          ({ index, value }) => index !== idIndex && index !== traceIndex && value.length > 0,
        );
      if (semanticCells.length === 0) continue;
      const hasPositive = semanticCells.some(({ header }) => POSITIVE_HEADERS.has(header));
      const hasNegative = semanticCells.some(({ header }) => NEGATIVE_HEADERS.has(header));
      const polarity = hasNegative
        ? hasPositive
          ? "boundary"
          : "negative"
        : hasPositive
          ? "positive"
          : "boundary";
      matches.push({
        ...(traceIndex !== undefined && row[traceIndex]
          ? { requirementIds: expandRequirementIds(row[traceIndex]) }
          : {}),
        polarity,
        statement: semanticCells
          .map(({ index, value }) => `${table.headers[index]}: ${value}`)
          .join("\n"),
      });
    }
  }
  return matches.length === 1 ? matches[0] : undefined;
}

function projectRequirement(
  source: string,
  requirement: RequirementRefinementRecord["supporting_requirements"][number],
): { statement: string; acceptanceIds?: string[] } | undefined {
  switch (requirement.source_projection) {
    case "markdown_h4_v1":
      return { statement: projectH4Statement(source, requirement.requirement_id) ?? "" };
    case "markdown_atx_section_v2":
      return { statement: projectHeadingStatement(source, requirement.requirement_id) ?? "" };
    case "markdown_requirement_table_v2":
      return projectRequirementTable(source, requirement.requirement_id);
    case "markdown_requirement_bullet_v1":
      return {
        statement: projectRequirementBulletStatement(source, requirement.requirement_id) ?? "",
      };
  }
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
  const requirements = [
    ...(record.contract_requirement ? [record.contract_requirement] : []),
    ...record.supporting_requirements,
  ];
  const requirementIds = requirements.map((item) => item.requirement_id);
  const acceptanceIds = record.acceptance_cases.map((item) => item.acceptance_id);
  if (
    !unique(requirementIds) ||
    !unique(acceptanceIds) ||
    (record.contract_requirement !== null &&
      record.contract_requirement.requirement_id !== record.refinement_contract_id) ||
    (record.contract_requirement === null &&
      requirementIds.includes(record.refinement_contract_id)) ||
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
  const sourceForward = new Set<string>();
  for (const requirement of requirements) {
    const requirementSource = sourceTexts.get(record.source.requirement_path) ?? "";
    const projection = projectRequirement(requirementSource, requirement);
    const sourceIdentity = projectTypedSpecIdentity(requirementSource, requirement.requirement_id);
    const identityDrift =
      sourceIdentity.kind === "ambiguous" ||
      (sourceIdentity.kind === "absent"
        ? requirement.source_identity !== undefined
        : JSON.stringify(sourceIdentity.identity) !== JSON.stringify(requirement.source_identity));
    if (
      projection?.statement !== requirement.statement ||
      identityDrift ||
      (projection?.acceptanceIds !== undefined &&
        projection.acceptanceIds.join("\0") !== requirement.acceptance_ids.join("\0")) ||
      semanticDigest(requirement) !== requirement.semantic_digest ||
      !unique(requirement.acceptance_ids) ||
      requirement.acceptance_ids.some((id) => !acceptanceSet.has(id))
    ) {
      failures.add(
        projection?.statement !== requirement.statement ||
          identityDrift ||
          (projection?.acceptanceIds !== undefined &&
            projection.acceptanceIds.join("\0") !== requirement.acceptance_ids.join("\0"))
          ? "REFINEMENT_SOURCE_PROJECTION_DRIFT"
          : "REFINEMENT_TRACE_INCOMPLETE",
      );
    }
    for (const acceptanceId of projection?.acceptanceIds ?? []) {
      sourceForward.add(`${requirement.requirement_id}\u0000${acceptanceId}`);
    }
    for (const acceptanceId of requirement.acceptance_ids) {
      forward.add(`${requirement.requirement_id}\u0000${acceptanceId}`);
    }
  }
  for (const acceptance of record.acceptance_cases) {
    const projection =
      acceptance.source_projection === "markdown_table_v1"
        ? projectAcceptanceRow(
            sourceTexts.get(record.source.acceptance_path) ?? "",
            acceptance.acceptance_id,
          )
        : projectAcceptanceTableRow(
            sourceTexts.get(record.source.acceptance_path) ?? "",
            acceptance.acceptance_id,
          );
    const projectedRequirementIds = projection?.requirementIds ?? acceptance.requirement_ids;
    const sourceTraceMissing =
      projection !== undefined &&
      projection.requirementIds === undefined &&
      acceptance.requirement_ids.some(
        (requirementId) => !sourceForward.has(`${requirementId}\u0000${acceptance.acceptance_id}`),
      );
    if (
      projection?.statement !== acceptance.statement ||
      projection?.polarity !== acceptance.polarity ||
      projectedRequirementIds.join("\0") !== acceptance.requirement_ids.join("\0") ||
      sourceTraceMissing ||
      semanticDigest(acceptance) !== acceptance.semantic_digest ||
      !unique(acceptance.requirement_ids) ||
      acceptance.requirement_ids.some((id) => !requirementSet.has(id))
    ) {
      failures.add(
        !projection ||
          projection.statement !== acceptance.statement ||
          projection.polarity !== acceptance.polarity ||
          projectedRequirementIds.join("\0") !== acceptance.requirement_ids.join("\0") ||
          sourceTraceMissing
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
