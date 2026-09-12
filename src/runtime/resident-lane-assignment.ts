import { z } from "zod";
import { canonicalJson, compareBytewise, type Sha256Digest } from "./digest";

export const RESIDENT_LANE_ASSIGNMENT_SCHEMA_VERSION = "helix-resident-lane-assignment.v2" as const;

const digestSchema = z.custom<Sha256Digest>(
  (value) => typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value),
);
const headSchema = z.string().regex(/^[a-f0-9]{40}$/u);
const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/#-]{0,255}$/u);
const repositorySchema = z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u);
const scopeRefSchema = z.union([
  z.string().regex(/^issue:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#[1-9][0-9]*$/u),
  z.string().regex(/^plan:PLAN-[A-Z0-9]+-[0-9]+(?:-[a-z0-9-]+)?$/u),
]);

export const residentLaneAssignmentSchema = z
  .object({
    schema_version: z.literal(RESIDENT_LANE_ASSIGNMENT_SCHEMA_VERSION),
    assignment_id: stableIdSchema,
    repository: repositorySchema,
    scope_ref: scopeRefSchema,
    scope_body_digest: digestSchema,
    acceptance_digest: digestSchema,
    branch: z.string().min(1),
    base_sha: headSchema,
    candidate_head: headSchema,
    assigned_lane_id: stableIdSchema,
    assigned_role: z.literal("worker"),
    lease_id: stableIdSchema,
    lease_fence: z.number().int().positive(),
    created_at: z.string().datetime({ offset: true }),
    expires_at: z.string().datetime({ offset: true }),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.branch === "main" || value.branch === "master") {
      context.addIssue({ code: "custom", path: ["branch"], message: "protected branch" });
    }
    if (Date.parse(value.created_at) >= Date.parse(value.expires_at)) {
      context.addIssue({ code: "custom", path: ["expires_at"], message: "invalid lease window" });
    }
  });

export type ResidentLaneAssignmentV1 = z.infer<typeof residentLaneAssignmentSchema>;

export type ResidentLaneAssignmentFailureCode =
  | "ASSIGNMENT_INPUT_INVALID"
  | "ASSIGNMENT_LEASE_EXPIRED"
  | "ASSIGNMENT_ID_CONFLICT"
  | "ASSIGNMENT_DUPLICATE_BRANCH_WRITER"
  | "ASSIGNMENT_SCOPE_ACTIVE_BRANCH_CONFLICT"
  | "ASSIGNMENT_FOREIGN_WRITER"
  | "ASSIGNMENT_FOREIGN_BRANCH"
  | "ASSIGNMENT_STALE_CANDIDATE_HEAD"
  | "ASSIGNMENT_STALE_FENCE"
  | "ASSIGNMENT_PREVIOUS_LEASE_ACTIVE"
  | "ASSIGNMENT_HANDOVER_RECEIPT_MISSING";

export type ResidentLaneAssignmentProjection =
  | { readonly ok: true; readonly active_assignments: readonly ResidentLaneAssignmentV1[] }
  | {
      readonly ok: false;
      readonly active_assignments: readonly ResidentLaneAssignmentV1[];
      readonly failure_codes: readonly ResidentLaneAssignmentFailureCode[];
    };

function uniqueSorted(values: readonly ResidentLaneAssignmentFailureCode[]) {
  return [...new Set(values)].sort(compareBytewise);
}

/**
 * active assignmentのexact setを決定的に投影するpure kernel。
 * provider session、cwd、GitHub表示から欠落値を補完しない。
 */
export function projectResidentLaneAssignments(raw: unknown): ResidentLaneAssignmentProjection {
  const parsed = z
    .object({
      observed_at: z.string().datetime({ offset: true }),
      assignments: z.array(z.unknown()),
    })
    .strict()
    .safeParse(raw);
  if (!parsed.success) {
    return { ok: false, active_assignments: [], failure_codes: ["ASSIGNMENT_INPUT_INVALID"] };
  }

  const assignments: ResidentLaneAssignmentV1[] = [];
  for (const candidate of parsed.data.assignments) {
    const assignment = residentLaneAssignmentSchema.safeParse(candidate);
    if (!assignment.success) {
      return { ok: false, active_assignments: [], failure_codes: ["ASSIGNMENT_INPUT_INVALID"] };
    }
    assignments.push(assignment.data);
  }

  const deduplicated = new Map<string, ResidentLaneAssignmentV1>();
  for (const assignment of assignments) deduplicated.set(canonicalJson(assignment), assignment);
  const active = [...deduplicated.values()].sort((left, right) =>
    compareBytewise(left.assignment_id, right.assignment_id),
  );
  const failures: ResidentLaneAssignmentFailureCode[] = [];
  const observedAt = Date.parse(parsed.data.observed_at);
  if (active.some((assignment) => Date.parse(assignment.expires_at) <= observedAt)) {
    failures.push("ASSIGNMENT_LEASE_EXPIRED");
  }

  const assignmentIdentities = new Map<string, Set<string>>();
  const branchOwners = new Map<string, Set<string>>();
  const scopeBranches = new Map<string, Set<string>>();
  for (const assignment of active) {
    const identities = assignmentIdentities.get(assignment.assignment_id) ?? new Set<string>();
    identities.add(canonicalJson(assignment));
    assignmentIdentities.set(assignment.assignment_id, identities);
    const branchKey = `${assignment.repository}:${assignment.branch}`;
    const owners = branchOwners.get(branchKey) ?? new Set<string>();
    owners.add(`${assignment.assignment_id}:${assignment.assigned_lane_id}:${assignment.lease_id}`);
    branchOwners.set(branchKey, owners);
    const scopeKey = `${assignment.repository}:${assignment.scope_ref}`;
    const branches = scopeBranches.get(scopeKey) ?? new Set<string>();
    branches.add(assignment.branch);
    scopeBranches.set(scopeKey, branches);
  }
  if ([...assignmentIdentities.values()].some((identities) => identities.size > 1)) {
    failures.push("ASSIGNMENT_ID_CONFLICT");
  }
  if ([...branchOwners.values()].some((owners) => owners.size > 1)) {
    failures.push("ASSIGNMENT_DUPLICATE_BRANCH_WRITER");
  }
  if ([...scopeBranches.values()].some((branches) => branches.size > 1)) {
    failures.push("ASSIGNMENT_SCOPE_ACTIVE_BRANCH_CONFLICT");
  }

  if (failures.length > 0) {
    return { ok: false, active_assignments: active, failure_codes: uniqueSorted(failures) };
  }
  return { ok: true, active_assignments: active };
}

export interface AssignmentReviewReturnInput {
  readonly assignment: ResidentLaneAssignmentV1;
  readonly worker_lane_id: string;
  readonly branch: string;
  readonly candidate_head: string;
  readonly lease_fence: number;
}

export function evaluateAssignmentReviewReturn(
  input: AssignmentReviewReturnInput,
):
  | { readonly ok: true; readonly disposition: "RETURN_TO_ORIGINAL_WRITER" }
  | { readonly ok: false; readonly failure_code: ResidentLaneAssignmentFailureCode } {
  if (!residentLaneAssignmentSchema.safeParse(input.assignment).success) {
    return { ok: false, failure_code: "ASSIGNMENT_INPUT_INVALID" };
  }
  if (input.worker_lane_id !== input.assignment.assigned_lane_id) {
    return { ok: false, failure_code: "ASSIGNMENT_FOREIGN_WRITER" };
  }
  if (input.branch !== input.assignment.branch) {
    return { ok: false, failure_code: "ASSIGNMENT_FOREIGN_BRANCH" };
  }
  if (input.candidate_head !== input.assignment.candidate_head) {
    return { ok: false, failure_code: "ASSIGNMENT_STALE_CANDIDATE_HEAD" };
  }
  if (input.lease_fence !== input.assignment.lease_fence) {
    return { ok: false, failure_code: "ASSIGNMENT_STALE_FENCE" };
  }
  return { ok: true, disposition: "RETURN_TO_ORIGINAL_WRITER" };
}

export interface AssignmentTakeoverInput {
  readonly assignment: ResidentLaneAssignmentV1;
  readonly previous_lease_ended: boolean;
  readonly handover_receipt_digest: Sha256Digest | null;
  readonly remote_branch_head: string;
  readonly next_lane_id: string;
  readonly next_lease_id: string;
  readonly next_lease_fence: number;
  readonly reassigned_at: string;
  readonly expires_at: string;
}

export function evaluateAssignmentTakeover(
  input: AssignmentTakeoverInput,
):
  | { readonly ok: true; readonly assignment: ResidentLaneAssignmentV1 }
  | { readonly ok: false; readonly failure_code: ResidentLaneAssignmentFailureCode } {
  if (!residentLaneAssignmentSchema.safeParse(input.assignment).success) {
    return { ok: false, failure_code: "ASSIGNMENT_INPUT_INVALID" };
  }
  if (!input.previous_lease_ended) {
    return { ok: false, failure_code: "ASSIGNMENT_PREVIOUS_LEASE_ACTIVE" };
  }
  if (!digestSchema.safeParse(input.handover_receipt_digest).success) {
    return { ok: false, failure_code: "ASSIGNMENT_HANDOVER_RECEIPT_MISSING" };
  }
  if (input.remote_branch_head !== input.assignment.candidate_head) {
    return { ok: false, failure_code: "ASSIGNMENT_STALE_CANDIDATE_HEAD" };
  }
  if (input.next_lease_id === input.assignment.lease_id) {
    return { ok: false, failure_code: "ASSIGNMENT_INPUT_INVALID" };
  }
  if (input.next_lease_fence !== input.assignment.lease_fence + 1) {
    return { ok: false, failure_code: "ASSIGNMENT_STALE_FENCE" };
  }
  if (Date.parse(input.reassigned_at) <= Date.parse(input.assignment.created_at)) {
    return { ok: false, failure_code: "ASSIGNMENT_INPUT_INVALID" };
  }
  const next = residentLaneAssignmentSchema.safeParse({
    ...input.assignment,
    assigned_lane_id: input.next_lane_id,
    lease_id: input.next_lease_id,
    lease_fence: input.next_lease_fence,
    created_at: input.reassigned_at,
    expires_at: input.expires_at,
  });
  if (!next.success) return { ok: false, failure_code: "ASSIGNMENT_INPUT_INVALID" };
  return { ok: true, assignment: next.data };
}
