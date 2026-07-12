import { createHash } from "node:crypto";
import { z } from "zod";

export const HISTORICAL_VPAIR_AUTHORITY_SCHEMA = "historical-vpair-migration-authority.v1";
const digest = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const baselineRow = z
  .object({
    fingerprint: digest,
    plan_id: z.string(),
    reason: z.literal("verification_bindings_absent"),
    detail: z.string().nullable(),
    plan_path: z.string(),
    cutoff_blob_oid: z.string().regex(/^[0-9a-f]{40}$/),
    plan_semantic_digest: digest,
    row_digest: digest,
  })
  .strict();
const authoritySchema = z
  .object({
    schema_version: z.literal(HISTORICAL_VPAIR_AUTHORITY_SCHEMA),
    repository_identity: z.string(),
    cutoff_commit_sha: z.string().regex(/^[0-9a-f]{40}$/),
    cutoff_tree_oid: z.string().regex(/^[0-9a-f]{40}$/),
    initial_census_digest: digest,
    previous_digest: digest.nullable(),
    rows: z.array(baselineRow),
    authority_digest: digest,
  })
  .strict();
export type HistoricalVpairAuthority = z.infer<typeof authoritySchema>;
export type HistoricalPrimary =
  | "historical_provenance_pinned_backlog"
  | "historical_unproven"
  | "post_enforcement_violation";
export interface HistoricalCandidate {
  plan_id: string;
  plan_path: string;
  kind: string;
  classification: string;
  reason: string;
  canonical_reason: "verification_bindings_absent";
  detail: string | null;
  fingerprint: `sha256:${string}`;
  has_bindings: boolean;
  current_semantic_digest: `sha256:${string}`;
  cutoff_semantic_digest: `sha256:${string}` | null;
  current_raw_digest: `sha256:${string}`;
  cutoff_raw_digest: `sha256:${string}` | null;
  cutoff_present: boolean;
  cutoff_plan_id: string | null;
  cutoff_blob_oid: string | null;
  assisted: boolean;
  load_error: string | null;
}
export interface HistoricalDecision {
  plan_id: string;
  admitted: boolean;
  rejection: string | null;
  primary: HistoricalPrimary | null;
  tags: string[];
  evidence: string[];
}
export interface HistoricalBundle {
  schema_version: "historical-vpair-migration-bundle.v1";
  source_total: number;
  admitted_total: number;
  rejected_total: number;
  counts: Record<string, number>;
  decisions: HistoricalDecision[];
  bundle_digest: `sha256:${string}`;
}
const sha = (v: string) => `sha256:${createHash("sha256").update(v).digest("hex")}` as const;
const stable = (v: unknown): string =>
  Array.isArray(v)
    ? `[${v.map(stable).join(",")}]`
    : v && typeof v === "object"
      ? `{${Object.entries(v as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, x]) => `${JSON.stringify(k)}:${stable(x)}`)
          .join(",")}}`
      : JSON.stringify(v);
export function parseHistoricalVpairAuthority(value: unknown): HistoricalVpairAuthority {
  const parsed = authoritySchema.parse(value);
  const { authority_digest, ...body } = parsed;
  if (authority_digest !== sha(stable(body)))
    throw new Error("historical authority digest mismatch");
  const ids = new Set<string>();
  for (const row of parsed.rows) {
    if (ids.has(row.plan_id)) throw new Error("duplicate historical authority row");
    ids.add(row.plan_id);
    const { row_digest, ...r } = row;
    if (row_digest !== sha(stable(r))) throw new Error(`row digest mismatch: ${row.plan_id}`);
  }
  if (parsed.initial_census_digest !== sha(stable(parsed.rows)))
    throw new Error("historical initial census/full-set digest mismatch");
  return parsed;
}
export function classifyHistoricalVpairMigration(input: {
  candidates: readonly HistoricalCandidate[];
  authority: HistoricalVpairAuthority;
}): HistoricalBundle {
  const rows = new Map(input.authority.rows.map((r) => [r.plan_id, r]));
  const decisions: HistoricalDecision[] = input.candidates.map((c) => {
    let rejection: string | null = null;
    if (c.load_error) rejection = `source_load_failed:${c.load_error}`;
    else if (c.classification !== "needs_design") rejection = "classification_not_needs_design";
    else if (c.reason !== "PLAN verification binding absent")
      rejection = "reason_not_binding_absent";
    else if (c.kind !== "impl" && c.kind !== "add-impl") rejection = "kind_not_implementation";
    else if (c.has_bindings) rejection = "bindings_already_present";
    const eligibleSource = rejection === null;
    if (!eligibleSource)
      return {
        plan_id: c.plan_id,
        admitted: false,
        rejection,
        primary: null,
        tags: [],
        evidence: [],
      };
    let primary: HistoricalPrimary;
    const row = rows.get(c.plan_id);
    if (!c.cutoff_present || c.cutoff_plan_id !== c.plan_id) primary = "post_enforcement_violation";
    else if (
      row &&
      row.fingerprint === c.fingerprint &&
      row.reason === c.canonical_reason &&
      row.detail === c.detail &&
      row.plan_path === c.plan_path &&
      row.cutoff_blob_oid === c.cutoff_blob_oid &&
      row.plan_semantic_digest === c.cutoff_semantic_digest
    )
      primary = "historical_provenance_pinned_backlog";
    else primary = "historical_unproven";
    return {
      plan_id: c.plan_id,
      admitted: true,
      rejection: null,
      primary,
      tags: c.assisted ? ["forward_assisted_candidate"] : [],
      evidence: [c.plan_path, c.current_raw_digest, c.current_semantic_digest],
    };
  });
  const admitted = decisions.filter((d) => d.admitted);
  const usedRows = new Set(
    decisions
      .filter((d) => d.primary === "historical_provenance_pinned_backlog")
      .map((d) => d.plan_id),
  );
  const unused = input.authority.rows.filter((row) => !usedRows.has(row.plan_id));
  if (unused.length > 0) throw new Error(`unused historical authority row: ${unused[0]?.plan_id}`);
  const counts = {
    historical_provenance_pinned_backlog: admitted.filter(
      (d) => d.primary === "historical_provenance_pinned_backlog",
    ).length,
    historical_unproven: admitted.filter((d) => d.primary === "historical_unproven").length,
    post_enforcement_violation: admitted.filter((d) => d.primary === "post_enforcement_violation")
      .length,
    forward_assisted_candidate: admitted.filter((d) =>
      d.tags.includes("forward_assisted_candidate"),
    ).length,
  };
  if (
    Object.values(counts)
      .slice(0, 3)
      .reduce((a, b) => a + b, 0) !== admitted.length
  )
    throw new Error("historical classification conservation failed");
  const body = {
    schema_version: "historical-vpair-migration-bundle.v1" as const,
    source_total: decisions.length,
    admitted_total: admitted.length,
    rejected_total: decisions.length - admitted.length,
    counts,
    decisions,
  };
  return { ...body, bundle_digest: sha(stable(body)) };
}
const reviewSchema = z
  .object({
    schema_version: z.literal("historical-vpair-migration-review.v1"),
    worker_identity: z.string(),
    reviewer_identity: z.string(),
    review_kind: z.enum(["cross_agent", "intra_runtime_subagent"]),
    worker_task_id: z.string(),
    reviewer_task_id: z.string(),
    termination_event_id: z.string(),
    worker_termination_event_id: z.string(),
    termination_status: z.literal("completed"),
    review_digest: digest,
    bundle_digest: digest,
    authority_artifact_digest: digest,
    authority_generation: z.number().int().positive(),
    previous_digest: digest.nullable(),
    reviewed_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    verdicts: z.array(
      z
        .object({
          plan_id: z.string(),
          verdict: z.enum(["approve", "approve_after_fixes", "pass"]),
        })
        .strict(),
    ),
  })
  .strict();
export function parseHistoricalMigrationReview(value: unknown) {
  return reviewSchema.parse(value);
}
export function validateHistoricalMigrationReview(
  value: unknown,
  bundle: HistoricalBundle,
  now: string,
  authorityBinding: { artifactDigest: string; generation: number },
) {
  const r = parseHistoricalMigrationReview(value);
  const { review_digest, ...reviewBody } = r;
  if (review_digest !== sha(stable(reviewBody))) throw new Error("review digest mismatch");
  if (r.worker_identity === r.reviewer_identity || r.worker_task_id === r.reviewer_task_id)
    throw new Error("independent reviewer required");
  if (
    r.bundle_digest !== bundle.bundle_digest ||
    r.authority_artifact_digest !== authorityBinding.artifactDigest ||
    r.authority_generation !== authorityBinding.generation ||
    Date.parse(now) < Date.parse(r.reviewed_at) ||
    Date.parse(now) >= Date.parse(r.expires_at) ||
    Date.parse(r.expires_at) - Date.parse(r.reviewed_at) > 3_600_000
  )
    throw new Error("review binding/staleness invalid");
  if (
    new Set(r.verdicts.map((v) => v.plan_id)).size !== r.verdicts.length ||
    r.verdicts.length !== bundle.decisions.length ||
    r.verdicts.some((v, index) => v.plan_id !== bundle.decisions[index]?.plan_id)
  )
    throw new Error("review verdict conservation failed");
  return r;
}
