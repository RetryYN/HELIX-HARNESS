import { z } from "zod";

type Sha256Digest = `sha256:${string}`;

const digestSchema = z.custom<Sha256Digest>(
  (value) => typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value),
);
const headSchema = z.string().regex(/^[a-f0-9]{40}$/u);
const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u);
const planIdSchema = z.string().regex(/^PLAN-[A-Z0-9]+-\d+(?:-[a-z0-9-]+)?$/u);
export const openBranchPlanMaterialSchema = z
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
      plans: z.array(openBranchPlanMaterialSchema),
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
    plans: z.array(openBranchPlanMaterialSchema),
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
    plans: z.array(openBranchPlanMaterialSchema),
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

export type OpenBranchPlanMaterial = z.infer<typeof openBranchPlanMaterialSchema>;
export type OpenBranchPlanReservationAuthorityInput = z.infer<
  typeof openBranchPlanReservationAuthorityInputSchema
>;
