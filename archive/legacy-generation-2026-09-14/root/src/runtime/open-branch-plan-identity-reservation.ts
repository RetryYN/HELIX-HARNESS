import { z } from "zod";
import { canonicalJson, compareBytewise, type Sha256Digest, sha256Digest } from "./digest";

export const OPEN_BRANCH_PLAN_RESERVATION_SCHEMA =
  "helix-open-branch-plan-reservation-snapshot.v1" as const;
export const OPEN_BRANCH_PLAN_RESERVATION_PROJECTION_SCHEMA =
  "helix-open-branch-plan-reservation-projection.v1" as const;

const digestSchema = z.custom<Sha256Digest>(
  (value) => typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value),
);
const headSchema = z.string().regex(/^[a-f0-9]{40}$/u);
const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u);
const planIdSchema = z.string().regex(/^PLAN-[A-Z0-9]+-\d+(?:-[a-z0-9-]+)?$/u);
const terminalEvidenceSchema = z
  .object({
    kind: z.enum(["merged", "closed", "stale", "superseded", "abandoned"]),
    recorded_at: z.string().datetime({ offset: true }),
    evidence_digest: digestSchema,
  })
  .strict();
const sourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("current_main"), branch: z.literal("main") }).strict(),
  z
    .object({
      kind: z.literal("open_pr"),
      branch: z.string().min(1),
      pr_number: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("active_writer"),
      branch: z.string().min(1),
      assignment_id: stableIdSchema,
      lease_id: stableIdSchema,
      fence_token: stableIdSchema,
    })
    .strict(),
]);
const reservationSchema = z
  .object({
    plan_id: planIdSchema,
    owner_issue: z.number().int().positive(),
    responsibility_owner: stableIdSchema,
    plan_path: z.string().regex(/^docs\/plans\/PLAN-[^/]+\.md$/u),
    plan_blob_digest: digestSchema,
    head_sha: headSchema,
    ancestor_head_shas: z.array(headSchema),
    source: sourceSchema,
    lifecycle: z.enum([
      "current",
      "open",
      "active",
      "merged",
      "closed",
      "stale",
      "superseded",
      "abandoned",
    ]),
    terminal_evidence: terminalEvidenceSchema.nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    const canonicalAncestors = [...new Set(value.ancestor_head_shas)].sort(compareBytewise);
    if (canonicalJson(canonicalAncestors) !== canonicalJson(value.ancestor_head_shas)) {
      context.addIssue({ code: "custom", message: "ancestor_head_shas must be unique and sorted" });
    }
    const activeLifecycle =
      (value.source.kind === "current_main" && value.lifecycle === "current") ||
      (value.source.kind === "open_pr" && value.lifecycle === "open") ||
      (value.source.kind === "active_writer" && value.lifecycle === "active");
    if (value.plan_path !== `docs/plans/${value.plan_id}.md`) {
      context.addIssue({ code: "custom", message: "plan path must match plan identity" });
    }
    if (value.source.kind === "current_main" && value.lifecycle !== "current") {
      context.addIssue({ code: "custom", message: "current main reservation cannot be released" });
    }
    const terminalKindMatches = value.terminal_evidence?.kind === value.lifecycle;
    if (!activeLifecycle && !terminalKindMatches) {
      context.addIssue({
        code: "custom",
        message: "terminal lifecycle requires matching evidence",
      });
    }
    if (activeLifecycle && value.terminal_evidence !== null) {
      context.addIssue({
        code: "custom",
        message: "active reservation cannot carry terminal evidence",
      });
    }
  });
const evidenceSurfaceSchema = z
  .object({
    status: z.enum(["available", "unavailable"]),
    error_digest: digestSchema.nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    if ((value.status === "available") !== (value.error_digest === null)) {
      context.addIssue({ code: "custom", message: "availability/error_digest mismatch" });
    }
  });
export const openBranchPlanReservationSnapshotSchema = z
  .object({
    schema_version: z.literal(OPEN_BRANCH_PLAN_RESERVATION_SCHEMA),
    repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u),
    captured_at: z.string().datetime({ offset: true }),
    evidence: z
      .object({
        current_main: evidenceSurfaceSchema,
        open_pr_heads: evidenceSurfaceSchema,
        active_writer_branches: evidenceSurfaceSchema,
      })
      .strict(),
    reservations: z.array(reservationSchema),
  })
  .strict();

export type OpenBranchPlanReservation = z.infer<typeof reservationSchema>;
export type OpenBranchPlanReservationSnapshot = z.infer<
  typeof openBranchPlanReservationSnapshotSchema
>;
export type OpenBranchPlanReservationStatus = "admitted" | "blocked" | "degraded";

export interface OpenBranchPlanReservationConflict {
  code: "plan_id_conflict" | "plan_number_conflict";
  key: string;
  reservations: readonly OpenBranchPlanReservation[];
}

export interface OpenBranchPlanReservationProjection {
  schema_version: typeof OPEN_BRANCH_PLAN_RESERVATION_PROJECTION_SCHEMA;
  ok: boolean;
  status: OpenBranchPlanReservationStatus;
  repository: string | null;
  active_reservations: readonly OpenBranchPlanReservation[];
  released_reservations: readonly OpenBranchPlanReservation[];
  conflicts: readonly OpenBranchPlanReservationConflict[];
  unavailable_surfaces: readonly string[];
  errors: readonly string[];
  projection_digest: Sha256Digest;
}

function planNumberKey(planId: string): string | null {
  const match = /^(PLAN-[A-Z0-9]+-\d+)(?:-[a-z0-9-]+)?$/u.exec(planId);
  return match?.[1] ?? null;
}

function reservationIdentity(value: OpenBranchPlanReservation): string {
  return canonicalJson(value);
}

function isReleased(value: OpenBranchPlanReservation): boolean {
  return value.terminal_evidence !== null;
}

function isStackInheritance(
  left: OpenBranchPlanReservation,
  right: OpenBranchPlanReservation,
): boolean {
  const ancestryBound =
    left.ancestor_head_shas.includes(right.head_sha) ||
    right.ancestor_head_shas.includes(left.head_sha);
  return (
    ancestryBound &&
    left.plan_id === right.plan_id &&
    left.plan_blob_digest === right.plan_blob_digest &&
    left.owner_issue === right.owner_issue &&
    left.responsibility_owner === right.responsibility_owner
  );
}

function isSameWriterPrMirror(
  left: OpenBranchPlanReservation,
  right: OpenBranchPlanReservation,
): boolean {
  const sourceKinds = new Set([left.source.kind, right.source.kind]);
  if (!sourceKinds.has("open_pr") || !sourceKinds.has("active_writer")) return false;
  const openPr = left.source.kind === "open_pr" ? left : right;
  const writer = left.source.kind === "active_writer" ? left : right;
  return (
    openPr.source.kind === "open_pr" &&
    writer.source.kind === "active_writer" &&
    openPr.source.branch === writer.source.branch &&
    openPr.head_sha === writer.head_sha &&
    openPr.plan_id === writer.plan_id &&
    openPr.plan_blob_digest === writer.plan_blob_digest &&
    openPr.owner_issue === writer.owner_issue &&
    openPr.responsibility_owner === writer.responsibility_owner
  );
}

function canonicalReservations(
  values: readonly OpenBranchPlanReservation[],
): OpenBranchPlanReservation[] {
  const deduplicated = new Map<string, OpenBranchPlanReservation>();
  for (const value of values) deduplicated.set(reservationIdentity(value), value);
  return [...deduplicated.values()].sort((left, right) =>
    compareBytewise(reservationIdentity(left), reservationIdentity(right)),
  );
}

function groupReservations(
  values: readonly OpenBranchPlanReservation[],
  keyOf: (value: OpenBranchPlanReservation) => string,
): Map<string, OpenBranchPlanReservation[]> {
  const groups = new Map<string, OpenBranchPlanReservation[]>();
  for (const value of values)
    groups.set(keyOf(value), [...(groups.get(keyOf(value)) ?? []), value]);
  return groups;
}

function conflictForGroup(
  code: OpenBranchPlanReservationConflict["code"],
  key: string,
  reservations: readonly OpenBranchPlanReservation[],
): OpenBranchPlanReservationConflict | null {
  if (reservations.length < 2) return null;
  for (let left = 0; left < reservations.length; left += 1) {
    for (let right = left + 1; right < reservations.length; right += 1) {
      const leftReservation = reservations[left];
      const rightReservation = reservations[right];
      if (
        leftReservation &&
        rightReservation &&
        !isStackInheritance(leftReservation, rightReservation) &&
        !isSameWriterPrMirror(leftReservation, rightReservation)
      ) {
        return { code, key, reservations };
      }
    }
  }
  return null;
}

function projectionDigest(
  value: Omit<OpenBranchPlanReservationProjection, "projection_digest">,
): Sha256Digest {
  return sha256Digest(canonicalJson(value));
}

export function projectOpenBranchPlanReservations(
  rawSnapshot: unknown,
): OpenBranchPlanReservationProjection {
  const parsed = openBranchPlanReservationSnapshotSchema.safeParse(rawSnapshot);
  if (!parsed.success) {
    const value: Omit<OpenBranchPlanReservationProjection, "projection_digest"> = {
      schema_version: OPEN_BRANCH_PLAN_RESERVATION_PROJECTION_SCHEMA,
      ok: false,
      status: "blocked",
      repository: null,
      active_reservations: [],
      released_reservations: [],
      conflicts: [],
      unavailable_surfaces: [],
      errors: parsed.error.issues.map((issue) => issue.path.join(".") || "snapshot"),
    };
    return { ...value, projection_digest: projectionDigest(value) };
  }

  const snapshot = parsed.data;
  const unavailableSurfaces = Object.entries(snapshot.evidence)
    .filter(([, evidence]) => evidence.status === "unavailable")
    .map(([surface]) => surface)
    .sort();
  const active = canonicalReservations(snapshot.reservations.filter((value) => !isReleased(value)));
  const released = canonicalReservations(snapshot.reservations.filter(isReleased));
  const lifecycleErrors = snapshot.reservations.flatMap((reservation) => {
    if (
      reservation.terminal_evidence !== null &&
      Date.parse(reservation.terminal_evidence.recorded_at) > Date.parse(snapshot.captured_at)
    ) {
      return [`terminal_evidence_after_capture:${reservation.plan_id}`];
    }
    return [];
  });
  if (
    snapshot.evidence.current_main.status === "available" &&
    !active.some((reservation) => reservation.source.kind === "current_main")
  ) {
    lifecycleErrors.push("current_main_reservation_missing");
  }
  const conflicts: OpenBranchPlanReservationConflict[] = [];
  const byPlanId = groupReservations(active, (value) => value.plan_id);
  for (const [key, reservations] of [...byPlanId.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const conflict = conflictForGroup("plan_id_conflict", key, reservations);
    if (conflict) conflicts.push(conflict);
  }
  const byNumber = groupReservations(
    active,
    (value) => planNumberKey(value.plan_id) ?? value.plan_id,
  );
  for (const [key, reservations] of [...byNumber.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (new Set(reservations.map((value) => value.plan_id)).size < 2) continue;
    const conflict = conflictForGroup("plan_number_conflict", key, reservations);
    if (conflict) conflicts.push(conflict);
  }
  const status: OpenBranchPlanReservationStatus =
    conflicts.length > 0 || lifecycleErrors.length > 0
      ? "blocked"
      : unavailableSurfaces.length > 0
        ? "degraded"
        : "admitted";
  const value: Omit<OpenBranchPlanReservationProjection, "projection_digest"> = {
    schema_version: OPEN_BRANCH_PLAN_RESERVATION_PROJECTION_SCHEMA,
    ok: status === "admitted",
    status,
    repository: snapshot.repository,
    active_reservations: active,
    released_reservations: released,
    conflicts,
    unavailable_surfaces: unavailableSurfaces,
    errors: lifecycleErrors.sort(compareBytewise),
  };
  return { ...value, projection_digest: projectionDigest(value) };
}
