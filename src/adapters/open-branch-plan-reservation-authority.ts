import { compareBytewise, type Sha256Digest, sha256Digest } from "../runtime/digest";
import {
  OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
  type OpenBranchPlanReservation,
  type OpenBranchPlanReservationSnapshot,
} from "../runtime/open-branch-plan-identity-reservation";
import {
  type OpenBranchPlanMaterial,
  openBranchPlanReservationAuthorityInputSchema,
} from "../schema/open-branch-plan-reservation-authority";

export {
  type OpenBranchPlanReservationAuthorityInput,
  openBranchPlanReservationAuthorityInputSchema,
} from "../schema/open-branch-plan-reservation-authority";

function evidence(
  surface: { status: "available" } | { status: "unavailable"; error_digest: Sha256Digest },
) {
  return surface.status === "available"
    ? { status: "available" as const, error_digest: null }
    : { status: "unavailable" as const, error_digest: surface.error_digest };
}

function reservation(
  plan: OpenBranchPlanMaterial,
  fields: Omit<OpenBranchPlanReservation, keyof OpenBranchPlanMaterial>,
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
