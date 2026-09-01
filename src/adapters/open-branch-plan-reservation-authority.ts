import { z } from "zod";
import { compareBytewise, type Sha256Digest, sha256Digest } from "../runtime/digest";
import {
  OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
  type OpenBranchPlanReservation,
  type OpenBranchPlanReservationSnapshot,
} from "../runtime/open-branch-plan-identity-reservation";

const digestSchema = z.custom<Sha256Digest>(
  (value) => typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value),
);
const headSchema = z.string().regex(/^[a-f0-9]{40}$/u);
const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u);
const planIdSchema = z.string().regex(/^PLAN-[A-Z0-9]+-\d+(?:-[a-z0-9-]+)?$/u);
const planMaterialSchema = z
  .object({
    plan_id: planIdSchema,
    owner_issue: z.number().int().positive(),
    responsibility_owner: stableIdSchema,
    plan_path: z.string().regex(/^docs\/plans\/PLAN-[^/]+\.md$/u),
    plan_blob_digest: digestSchema,
  })
  .strict();
const unavailableSchema = z
  .object({ status: z.literal("unavailable"), error_digest: digestSchema })
  .strict();
const mainSchema = z.discriminatedUnion("status", [
  unavailableSchema,
  z
    .object({
      status: z.literal("available"),
      head_sha: headSchema,
      plans: z.array(planMaterialSchema),
    })
    .strict(),
]);
const terminalEvidenceSchema = z
  .object({
    recorded_at: z.string().datetime({ offset: true }),
    evidence_digest: digestSchema,
  })
  .strict();
const pullRequestSchema = z
  .object({
    pr_number: z.number().int().positive(),
    branch: z.string().min(1),
    head_sha: headSchema,
    ancestor_head_shas: z.array(headSchema),
    lifecycle: z.enum(["open", "merged", "closed", "stale", "superseded", "abandoned"]),
    terminal_evidence: terminalEvidenceSchema.nullable(),
    plans: z.array(planMaterialSchema),
  })
  .strict()
  .superRefine((value, context) => {
    if ((value.lifecycle === "open") !== (value.terminal_evidence === null)) {
      context.addIssue({
        code: "custom",
        message: "open lifecycle and terminal evidence must be mutually exclusive",
      });
    }
  });
const openPrSchema = z.discriminatedUnion("status", [
  unavailableSchema,
  z.object({ status: z.literal("available"), pull_requests: z.array(pullRequestSchema) }).strict(),
]);
const writerSchema = z
  .object({
    assignment_id: stableIdSchema,
    branch: z.string().min(1),
    head_sha: headSchema,
    ancestor_head_shas: z.array(headSchema),
    lease_id: stableIdSchema,
    fence_token: stableIdSchema,
    plans: z.array(planMaterialSchema),
  })
  .strict();
const writerSurfaceSchema = z.discriminatedUnion("status", [
  unavailableSchema,
  z.object({ status: z.literal("available"), writers: z.array(writerSchema) }).strict(),
]);

export const openBranchPlanReservationAuthorityInputSchema = z
  .object({
    repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u),
    captured_at: z.string().datetime({ offset: true }),
    current_main: mainSchema,
    open_pr_heads: openPrSchema,
    active_writer_branches: writerSurfaceSchema,
  })
  .strict();

export type OpenBranchPlanReservationAuthorityInput = z.infer<
  typeof openBranchPlanReservationAuthorityInputSchema
>;

function evidence(
  surface: { status: "available" } | { status: "unavailable"; error_digest: Sha256Digest },
) {
  return surface.status === "available"
    ? { status: "available" as const, error_digest: null }
    : { status: "unavailable" as const, error_digest: surface.error_digest };
}

function reservation(
  plan: z.infer<typeof planMaterialSchema>,
  fields: Omit<OpenBranchPlanReservation, keyof z.infer<typeof planMaterialSchema>>,
): OpenBranchPlanReservation {
  return { ...plan, ...fields };
}

/**
 * GitHub／assignment effect adapterが取得したtyped materialをcanonical snapshotへ変換する。
 * conflict／inheritance／releaseの意味判定は行わず、semantic coreへ一方向に渡す。
 */
export function buildOpenBranchPlanReservationAuthoritySnapshot(
  raw: unknown,
): OpenBranchPlanReservationSnapshot {
  const input = openBranchPlanReservationAuthorityInputSchema.parse(raw);
  const reservations: OpenBranchPlanReservation[] = [];
  if (input.current_main.status === "available") {
    for (const plan of input.current_main.plans) {
      reservations.push(
        reservation(plan, {
          head_sha: input.current_main.head_sha,
          ancestor_head_shas: [],
          source: { kind: "current_main", branch: "main" },
          lifecycle: "current",
          terminal_evidence: null,
        }),
      );
    }
  }
  if (input.open_pr_heads.status === "available") {
    for (const pullRequest of input.open_pr_heads.pull_requests) {
      for (const plan of pullRequest.plans) {
        reservations.push(
          reservation(plan, {
            head_sha: pullRequest.head_sha,
            ancestor_head_shas: [...new Set(pullRequest.ancestor_head_shas)].sort(compareBytewise),
            source: {
              kind: "open_pr",
              branch: pullRequest.branch,
              pr_number: pullRequest.pr_number,
            },
            lifecycle: pullRequest.lifecycle,
            terminal_evidence:
              pullRequest.lifecycle === "open" || pullRequest.terminal_evidence === null
                ? null
                : { ...pullRequest.terminal_evidence, kind: pullRequest.lifecycle },
          }),
        );
      }
    }
  }
  if (input.active_writer_branches.status === "available") {
    for (const writer of input.active_writer_branches.writers) {
      for (const plan of writer.plans) {
        reservations.push(
          reservation(plan, {
            head_sha: writer.head_sha,
            ancestor_head_shas: [...new Set(writer.ancestor_head_shas)].sort(compareBytewise),
            source: {
              kind: "active_writer",
              branch: writer.branch,
              assignment_id: writer.assignment_id,
              lease_id: writer.lease_id,
              fence_token: writer.fence_token,
            },
            lifecycle: "active",
            terminal_evidence: null,
          }),
        );
      }
    }
  }
  return {
    schema_version: OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
    repository: input.repository,
    captured_at: input.captured_at,
    evidence: {
      current_main: evidence(input.current_main),
      open_pr_heads: evidence(input.open_pr_heads),
      active_writer_branches: evidence(input.active_writer_branches),
    },
    reservations,
  };
}

export function reservationAuthorityUnavailableDigest(surface: string): Sha256Digest {
  return sha256Digest(`reservation-authority-unavailable:${surface}`);
}
