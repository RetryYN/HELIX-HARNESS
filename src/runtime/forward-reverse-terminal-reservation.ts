import { z } from "zod";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  type OpenBranchPlanReservation,
  type OpenBranchPlanReservationProjection,
  type OpenBranchPlanReservationSnapshot,
  projectOpenBranchPlanReservations,
} from "./open-branch-plan-identity-reservation";

export const FORWARD_REVERSE_TERMINAL_RESERVATION_SCHEMA =
  "helix-forward-reverse-terminal-reservation.v1" as const;

const digestSchema = z.custom<Sha256Digest>(
  (value) => typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value),
);
const headSchema = z.string().regex(/^[a-f0-9]{40}$/u);
const allocationIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u);
const forwardPlanSchema = z.string().regex(/^PLAN-L7-\d+-[a-z0-9-]+$/u);
const reversePlanSchema = z.string().regex(/^PLAN-REVERSE-\d+-[a-z0-9-]+$/u);

function planFamily(planId: string): string | null {
  const match = planId.match(/^PLAN-(?:L7|REVERSE)-(\d+)-([a-z0-9-]+)$/u);
  return match ? `${match[1]}:${match[2]}` : null;
}

const inputSchema = z
  .object({
    forward: z
      .object({
        plan_id: forwardPlanSchema,
        kind: z.literal("add-impl"),
        target_axis: z.literal("workflow_model"),
        target_id: z.literal("ADD_FEATURE"),
        owner_issue: z.number().int().positive(),
        responsibility_owner: z.string().min(1),
        plan_blob_digest: digestSchema,
      })
      .strict(),
    allocation: z
      .object({
        allocation_id: allocationIdSchema,
        forward_plan_id: forwardPlanSchema,
        reverse_plan_id: reversePlanSchema,
        reverse_plan_blob_digest: digestSchema,
        receipt_digest: digestSchema,
      })
      .strict(),
    branch: z.string().min(1),
    assignment_id: z.string().min(1),
    lease_id: z.string().min(1),
    fence_token: z.string().min(1),
    candidate_head: headSchema,
    ancestor_head_shas: z.array(headSchema),
    expected_main_head: headSchema,
    observed_main_head: headSchema,
    reservation_snapshot: z.custom<OpenBranchPlanReservationSnapshot>(),
  })
  .strict();

export type ForwardReverseTerminalReservationInput = z.input<typeof inputSchema>;

export interface ReservedPlanContract {
  plan_id: string;
  status: "draft";
  backfill_state: "pending_reverse";
  completion_claim_allowed: false;
  references: readonly string[];
}

export interface ForwardReverseTerminalReservationResult {
  schema_version: typeof FORWARD_REVERSE_TERMINAL_RESERVATION_SCHEMA;
  ok: boolean;
  findings: readonly string[];
  forward: ReservedPlanContract | null;
  reverse: ReservedPlanContract | null;
  reservations: readonly OpenBranchPlanReservation[];
  reservation_projection: OpenBranchPlanReservationProjection | null;
}

export function reserveForwardReverseTerminalPair(
  rawInput: ForwardReverseTerminalReservationInput,
): ForwardReverseTerminalReservationResult {
  const parsed = inputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      schema_version: FORWARD_REVERSE_TERMINAL_RESERVATION_SCHEMA,
      ok: false,
      findings: parsed.error.issues.map((issue) => `input_invalid:${issue.path.join(".")}`),
      forward: null,
      reverse: null,
      reservations: [],
      reservation_projection: null,
    };
  }
  const input = parsed.data;
  const findings: string[] = [];
  if (input.forward.plan_id !== input.allocation.forward_plan_id)
    findings.push("allocator_forward_identity_mismatch");
  if (planFamily(input.forward.plan_id) !== planFamily(input.allocation.reverse_plan_id))
    findings.push("allocator_reverse_identity_mismatch");
  const { receipt_digest: _receiptDigest, ...allocationPayload } = input.allocation;
  if (sha256Digest(canonicalJson(allocationPayload)) !== input.allocation.receipt_digest)
    findings.push("allocator_receipt_invalid");
  if (input.expected_main_head !== input.observed_main_head) findings.push("stale_main");
  const snapshotMain = input.reservation_snapshot.reservations.find(
    (reservation) => reservation.source.kind === "current_main",
  );
  if (!snapshotMain || snapshotMain.head_sha !== input.observed_main_head)
    findings.push("snapshot_main_mismatch");
  if (findings.length > 0) {
    return {
      schema_version: FORWARD_REVERSE_TERMINAL_RESERVATION_SCHEMA,
      ok: false,
      findings,
      forward: null,
      reverse: null,
      reservations: [],
      reservation_projection: null,
    };
  }

  const source = {
    kind: "active_writer" as const,
    branch: input.branch,
    assignment_id: input.assignment_id,
    lease_id: input.lease_id,
    fence_token: input.fence_token,
  };
  const common = {
    owner_issue: input.forward.owner_issue,
    responsibility_owner: input.forward.responsibility_owner,
    head_sha: input.candidate_head,
    ancestor_head_shas: [...new Set(input.ancestor_head_shas)].sort(),
    source,
    lifecycle: "active" as const,
    terminal_evidence: null,
  };
  const reservations: OpenBranchPlanReservation[] = [
    {
      ...common,
      plan_id: input.forward.plan_id,
      plan_path: `docs/plans/${input.forward.plan_id}.md`,
      plan_blob_digest: input.forward.plan_blob_digest,
    },
    {
      ...common,
      plan_id: input.allocation.reverse_plan_id,
      plan_path: `docs/plans/${input.allocation.reverse_plan_id}.md`,
      plan_blob_digest: input.allocation.reverse_plan_blob_digest,
    },
  ];
  const reservationProjection = projectOpenBranchPlanReservations({
    ...input.reservation_snapshot,
    reservations: [...input.reservation_snapshot.reservations, ...reservations],
  });
  if (!reservationProjection.ok) {
    return {
      schema_version: FORWARD_REVERSE_TERMINAL_RESERVATION_SCHEMA,
      ok: false,
      findings: ["reservation_projection_rejected"],
      forward: null,
      reverse: null,
      reservations: [],
      reservation_projection: reservationProjection,
    };
  }
  const forwardPath = `docs/plans/${input.forward.plan_id}.md`;
  const reversePath = `docs/plans/${input.allocation.reverse_plan_id}.md`;
  return {
    schema_version: FORWARD_REVERSE_TERMINAL_RESERVATION_SCHEMA,
    ok: findings.length === 0,
    findings,
    forward: {
      plan_id: input.forward.plan_id,
      status: "draft",
      backfill_state: "pending_reverse",
      completion_claim_allowed: false,
      references: [reversePath],
    },
    reverse: {
      plan_id: input.allocation.reverse_plan_id,
      status: "draft",
      backfill_state: "pending_reverse",
      completion_claim_allowed: false,
      references: [forwardPath],
    },
    reservations,
    reservation_projection: reservationProjection,
  };
}
