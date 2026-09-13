import { createHash } from "node:crypto";
import { z } from "zod";
import { canonicalJson } from "./digest";

export const MANAGEMENT_FIELD_OWNER_INVENTORY_VERSION =
  "helix-management-field-owner-inventory.v1" as const;
export const MANAGEMENT_RELATION_SCHEMA_VERSION = "helix-management-relation.v1" as const;

export const MANAGEMENT_FIELD_OWNERS = [
  "product_contract",
  "management_control",
  "transactional_control",
  "projection",
  "legacy",
] as const;
export type ManagementFieldOwner = (typeof MANAGEMENT_FIELD_OWNERS)[number];

export type ManagementFieldInventoryEntry =
  | { readonly path: string; readonly disposition: "owned"; readonly owner: ManagementFieldOwner }
  | {
      readonly path: string;
      readonly disposition: "split_required";
      readonly owner: null;
      readonly split_between: readonly ManagementFieldOwner[];
    };

export const MANAGEMENT_FIELD_OWNER_INVENTORY: readonly ManagementFieldInventoryEntry[] = [
  ...[
    "plan_id",
    "title",
    "kind",
    "drive",
    "layer",
    "sub_doc",
    "master_hub",
    "parent_design",
    "decision_outcome",
    "confirmed_reverse_type",
    "scrum_type",
    "forward_routing",
    "workflow_identity",
    "entry_signals",
    "promotion_strategy",
    "generates",
    "modifies",
    "verification_bindings",
    "resolves_authority",
    "left_arm_carry",
    "dependencies.parent",
    "dependencies.references",
    "historical_provenance",
    "backprop_decision",
    "backprop_decision_reason",
    "version_target",
    "irreversible_impact",
    "v2_import",
    "supersedes",
    "superseded_by",
    "behavior_contract_id",
    "responsibility_owner",
    "engineering_discipline_required",
    "change_slice",
    "refactor_step",
    "legacy_retirement_state",
    "no_code_decision",
    "ddd_modeling_decision",
    "contract_preconditions",
    "contract_postconditions",
    "contract_invariants",
    "contract_failures",
    "tdd_red_required",
    "tdd_red_waiver_reason",
    "mutation_oracle_required",
    "mutation_oracle_evidence",
    "complexity_effect",
    "complexity_justification",
    "removal_trigger",
    "pair_artifact",
    "parent_doc",
    "parent_plan",
    "refines",
    "related_adr",
    "related_br",
    "related_docs",
    "related_l0",
    "related_l0_extra",
    "related_l1_functional",
    "related_l1_nfr",
    "related_l1_screen",
    "related_l2_screen",
    "canonical_layer",
    "canonical_pair",
    "canonical_vmodel",
    "next_pair_freeze",
    "screen_applicability",
    "skip_sub_doc",
    "scope_expansion_receipts",
    "external_source_basis",
  ].map((path) => ({ path, disposition: "owned" as const, owner: "product_contract" as const })),
  ...[
    "agent_slots",
    "dependencies.requires",
    "dependencies.blocks",
    "owner",
    "decision_owner",
    "schedule",
    "roadmap",
    "continuation_issue_ids",
    "runtime_responsibility",
    "backfill_required",
    "backfill_state",
    "implementation_allowed",
    "runtime_activation_allowed",
  ].map((path) => ({
    path,
    disposition: "owned" as const,
    owner: "management_control" as const,
  })),
  ...[
    "route_mode",
    "legacy_physical_layer",
    "historical_generates",
    "blocks",
    "references",
    "backprop_note",
    "backprop_scope",
    "status_note",
    "supersedes_pr",
  ].map((path) => ({
    path,
    disposition: "owned" as const,
    owner: "legacy" as const,
  })),
  ...["github_issue_id", "queue_id", "created_by_issue"].map((path) => ({
    path,
    disposition: "owned" as const,
    owner: "projection" as const,
  })),
  ...[
    "completion_claim_allowed",
    "created",
    "updated",
    "accepted_at",
    "accepted_by",
    "accept_evidence",
    "decision_recorded_at",
    "green_at",
    "red_at",
    "red_commit",
    "red_test",
    "tdd_green_evidence",
    "tdd_red_evidence",
    "tdd_note",
    "mutation_oracle",
    "inventory_evidence",
    "legacy_retirement_receipt",
    "l3_progression_authority",
    "l3_progression_marker",
    "live_evidence_adapter",
    "live_evidence_policy",
    "r4_live_evidence",
    "revision",
    "source_head",
  ].map((path) => ({
    path,
    disposition: "owned" as const,
    owner: "transactional_control" as const,
  })),
  {
    path: "status",
    disposition: "split_required" as const,
    owner: null,
    split_between: ["product_contract", "management_control"] as const,
  },
  {
    path: "workflow_phase",
    disposition: "split_required" as const,
    owner: null,
    split_between: ["product_contract", "management_control"] as const,
  },
  {
    path: "review_evidence",
    disposition: "split_required" as const,
    owner: null,
    split_between: ["product_contract", "transactional_control"] as const,
  },
  {
    path: "l3_human_approval",
    disposition: "split_required" as const,
    owner: null,
    split_between: ["product_contract", "transactional_control"] as const,
  },
].sort((left, right) => left.path.localeCompare(right.path, "en"));

export function managementFieldOwnerInventoryDigest(): `sha256:${string}` {
  return `sha256:${createHash("sha256")
    .update(
      canonicalJson({
        schema_version: MANAGEMENT_FIELD_OWNER_INVENTORY_VERSION,
        entries: MANAGEMENT_FIELD_OWNER_INVENTORY,
      }),
    )
    .digest("hex")}`;
}

export type ManagementFieldClassification =
  | { readonly ok: true; readonly entry: ManagementFieldInventoryEntry }
  | { readonly ok: false; readonly reason: "unknown_field"; readonly path: string };

export function classifyManagementField(path: string): ManagementFieldClassification {
  const entry = MANAGEMENT_FIELD_OWNER_INVENTORY.find((candidate) => candidate.path === path);
  return entry ? { ok: true, entry } : { ok: false, reason: "unknown_field", path };
}

const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u);
const headSchema = z.string().regex(/^[a-f0-9]{40}$/u);
const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/#-]{0,255}$/u);

export const workTicketAssignmentSchema = z
  .object({
    schema_version: z.literal(MANAGEMENT_RELATION_SCHEMA_VERSION),
    relation_kind: z.literal("WorkTicketAssignment"),
    ticket_ref: stableIdSchema,
    required_role: z.string().min(1),
    required_capability: z.string().min(1),
    assignment_ref: stableIdSchema,
    generation: z.number().int().nonnegative(),
    valid_from: z.string().datetime({ offset: true }),
    valid_until: z.string().datetime({ offset: true }),
  })
  .strict()
  .superRefine((value, context) => {
    if (Date.parse(value.valid_from) >= Date.parse(value.valid_until)) {
      context.addIssue({
        code: "custom",
        path: ["valid_until"],
        message: "invalid validity window",
      });
    }
  });

export const admissionDependencySchema = z
  .object({
    schema_version: z.literal(MANAGEMENT_RELATION_SCHEMA_VERSION),
    relation_kind: z.literal("AdmissionDependency"),
    source_ticket: stableIdSchema,
    target_ref: stableIdSchema,
    direction: z.enum(["requires", "blocks"]),
    generation: z.number().int().nonnegative(),
    condition: z.string().min(1),
    state: z.enum(["open", "satisfied", "invalidated"]),
  })
  .strict();

export const transitionEventSchema = z
  .object({
    schema_version: z.literal(MANAGEMENT_RELATION_SCHEMA_VERSION),
    relation_kind: z.literal("TransitionEvent"),
    ticket_ref: stableIdSchema,
    state_machine: stableIdSchema,
    from_state: z.string().min(1),
    to_state: z.string().min(1),
    event_id: stableIdSchema,
    occurred_at: z.string().datetime({ offset: true }),
    actor_ref: stableIdSchema,
    evidence_ref: stableIdSchema,
  })
  .strict();

export const evidenceSubjectRefSchema = z
  .object({
    schema_version: z.literal(MANAGEMENT_RELATION_SCHEMA_VERSION),
    relation_kind: z.literal("EvidenceSubjectRef"),
    subject_head: headSchema,
    subject_tree: z.string().regex(/^[a-f0-9]{40}$/u),
    contract_revision: digestSchema,
    policy_revision: digestSchema,
    evidence_envelope_ref: stableIdSchema,
    issuer: stableIdSchema,
    trust_policy: stableIdSchema,
    approval_kind: z.enum(["technical_review", "human_po", "execution"]),
    revoked: z.boolean(),
  })
  .strict();

export type ManagementRelation =
  | z.infer<typeof workTicketAssignmentSchema>
  | z.infer<typeof admissionDependencySchema>
  | z.infer<typeof transitionEventSchema>
  | z.infer<typeof evidenceSubjectRefSchema>;

const managementRelationSchema = z.union([
  workTicketAssignmentSchema,
  admissionDependencySchema,
  transitionEventSchema,
  evidenceSubjectRefSchema,
]);

export type DualReadDisposition =
  | "match"
  | "legacy_only"
  | "relation_only"
  | "mismatch"
  | "unavailable";
export type ManagementMigrationPhase = "outside_pilot" | "pilot_dual_read" | "writer_cutover";

export interface ManagementRelationAdmissionInput {
  readonly field_path: string;
  readonly phase: ManagementMigrationPhase;
  readonly product_contract: unknown;
  readonly legacy_value?: unknown;
  readonly relation?: unknown;
  readonly canonical_available: boolean;
  readonly observed_at?: string;
  readonly expected_generation?: number;
  readonly writer_operations: readonly ("legacy" | "relation")[];
  readonly legacy_consumers_remaining: number;
  readonly compatibility_reader_active: boolean;
  readonly retirement_requested: boolean;
}

export interface ManagementRelationAdmissionResult {
  readonly ok: boolean;
  readonly disposition: DualReadDisposition;
  readonly reasons: readonly string[];
  readonly inventory_digest: `sha256:${string}`;
  readonly contract_semantic_digest: `sha256:${string}`;
  readonly admission_digest: `sha256:${string}`;
}

function relationValueForField(fieldPath: string, relation: ManagementRelation): unknown {
  if (fieldPath === "agent_slots" && relation.relation_kind === "WorkTicketAssignment") {
    return [{ role: relation.required_role }];
  }
  if (
    (fieldPath === "dependencies.requires" || fieldPath === "dependencies.blocks") &&
    relation.relation_kind === "AdmissionDependency"
  ) {
    const expectedDirection = fieldPath === "dependencies.requires" ? "requires" : "blocks";
    return relation.direction === expectedDirection ? [relation.target_ref] : null;
  }
  return null;
}

function dispositionFor(
  input: ManagementRelationAdmissionInput,
  relation: ManagementRelation | null,
): DualReadDisposition {
  if (!input.canonical_available) return "unavailable";
  const hasLegacy = input.legacy_value !== undefined;
  const hasRelation = input.relation !== undefined;
  if (!hasLegacy && !hasRelation) return "unavailable";
  if (hasLegacy && !hasRelation) return "legacy_only";
  if (!hasLegacy && hasRelation) return "relation_only";
  if (relation === null) return "mismatch";
  return canonicalJson(input.legacy_value) ===
    canonicalJson(relationValueForField(input.field_path, relation))
    ? "match"
    : "mismatch";
}

export function evaluateManagementRelationAdmission(
  input: ManagementRelationAdmissionInput,
): ManagementRelationAdmissionResult {
  const reasons: string[] = [];
  const classification = classifyManagementField(input.field_path);
  if (!classification.ok) reasons.push("unknown_field");
  else if (classification.entry.disposition === "split_required") reasons.push("split_required");
  const parsedRelation =
    input.relation === undefined ? null : managementRelationSchema.safeParse(input.relation);
  if (parsedRelation !== null && !parsedRelation.success) {
    reasons.push("relation_invalid");
  }
  if (parsedRelation?.success && parsedRelation.data.relation_kind === "WorkTicketAssignment") {
    if (
      input.expected_generation !== undefined &&
      parsedRelation.data.generation !== input.expected_generation
    ) {
      reasons.push("assignment_generation_mismatch");
    }
    if (
      input.observed_at !== undefined &&
      (Date.parse(input.observed_at) < Date.parse(parsedRelation.data.valid_from) ||
        Date.parse(input.observed_at) >= Date.parse(parsedRelation.data.valid_until))
    ) {
      reasons.push("assignment_not_current");
    }
  }
  const disposition = dispositionFor(
    input,
    parsedRelation?.success === true ? parsedRelation.data : null,
  );
  if (disposition === "unavailable") reasons.push("canonical_unavailable");
  if (disposition === "mismatch") reasons.push("dual_read_mismatch");
  if (disposition === "legacy_only" && input.phase !== "outside_pilot") {
    reasons.push("legacy_only_forbidden");
  }
  if (disposition === "relation_only" && input.phase === "outside_pilot") {
    reasons.push("relation_only_outside_pilot");
  }
  if (
    disposition === "match" &&
    input.phase === "writer_cutover" &&
    !input.compatibility_reader_active
  ) {
    reasons.push("match_requires_compatibility_reader");
  }
  if (input.writer_operations.includes("legacy") && input.writer_operations.includes("relation")) {
    reasons.push("dual_write_forbidden");
  }
  if (input.phase === "writer_cutover" && input.writer_operations.includes("legacy")) {
    reasons.push("legacy_writer_after_cutover");
  }
  if (input.legacy_consumers_remaining > 0 && input.retirement_requested) {
    reasons.push("consumer_zero_required");
  }
  const normalizedReasons = [...new Set(reasons)].sort();
  const inventoryDigest = managementFieldOwnerInventoryDigest();
  const contractSemanticDigest = `sha256:${createHash("sha256")
    .update(canonicalJson(input.product_contract))
    .digest("hex")}` as const;
  return {
    ok: normalizedReasons.length === 0,
    disposition,
    reasons: normalizedReasons,
    inventory_digest: inventoryDigest,
    contract_semantic_digest: contractSemanticDigest,
    admission_digest: `sha256:${createHash("sha256")
      .update(
        canonicalJson({
          field_path: input.field_path,
          phase: input.phase,
          contract_semantic_digest: contractSemanticDigest,
          legacy_value: input.legacy_value ?? null,
          relation: input.relation ?? null,
          canonical_available: input.canonical_available,
          observed_at: input.observed_at ?? null,
          expected_generation: input.expected_generation ?? null,
          writer_operations: input.writer_operations,
          legacy_consumers_remaining: input.legacy_consumers_remaining,
          compatibility_reader_active: input.compatibility_reader_active,
          retirement_requested: input.retirement_requested,
          disposition,
          reasons: normalizedReasons,
          inventoryDigest,
        }),
      )
      .digest("hex")}`,
  };
}

export function admitTransitionEvent(input: {
  readonly current_state: string;
  readonly candidate: unknown;
  readonly prior_events: readonly unknown[];
}): {
  readonly ok: boolean;
  readonly disposition: "apply" | "idempotent" | "reject";
  readonly reason: string | null;
} {
  const candidate = transitionEventSchema.safeParse(input.candidate);
  const prior: z.infer<typeof transitionEventSchema>[] = [];
  for (const event of input.prior_events) {
    const parsed = transitionEventSchema.safeParse(event);
    if (!parsed.success) {
      return { ok: false, disposition: "reject", reason: "transition_invalid" };
    }
    prior.push(parsed.data);
  }
  if (!candidate.success) {
    return { ok: false, disposition: "reject", reason: "transition_invalid" };
  }
  const sameId = prior.find((event) => event.event_id === candidate.data.event_id);
  if (sameId) {
    return canonicalJson(sameId) === canonicalJson(candidate.data)
      ? { ok: true, disposition: "idempotent", reason: null }
      : { ok: false, disposition: "reject", reason: "event_id_conflict" };
  }
  if (candidate.data.from_state !== input.current_state) {
    return { ok: false, disposition: "reject", reason: "from_state_mismatch" };
  }
  if (prior.some((event) => event.from_state === candidate.data.from_state)) {
    return { ok: false, disposition: "reject", reason: "duplicate_business_transition" };
  }
  return { ok: true, disposition: "apply", reason: null };
}

export function validateEvidenceSubject(input: {
  readonly candidate: unknown;
  readonly expected_head: string;
  readonly expected_contract_revision: string;
  readonly expected_policy_revision: string;
  readonly required_approval_kind: "technical_review" | "human_po" | "execution";
  readonly trusted_issuers: readonly string[];
  readonly accepted_trust_policies: readonly string[];
}): { readonly ok: boolean; readonly reasons: readonly string[] } {
  const parsed = evidenceSubjectRefSchema.safeParse(input.candidate);
  if (!parsed.success) return { ok: false, reasons: ["evidence_subject_invalid"] };
  const reasons: string[] = [];
  if (parsed.data.subject_head !== input.expected_head) reasons.push("subject_head_mismatch");
  if (parsed.data.contract_revision !== input.expected_contract_revision)
    reasons.push("contract_revision_mismatch");
  if (parsed.data.policy_revision !== input.expected_policy_revision)
    reasons.push("policy_revision_mismatch");
  if (parsed.data.approval_kind !== input.required_approval_kind)
    reasons.push("approval_kind_mismatch");
  if (!input.trusted_issuers.includes(parsed.data.issuer)) reasons.push("issuer_untrusted");
  if (!input.accepted_trust_policies.includes(parsed.data.trust_policy))
    reasons.push("trust_policy_unaccepted");
  if (parsed.data.revoked) reasons.push("evidence_revoked");
  return { ok: reasons.length === 0, reasons };
}
