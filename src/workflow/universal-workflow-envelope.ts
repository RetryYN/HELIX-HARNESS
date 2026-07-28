import { z } from "zod";

export const UNIVERSAL_WORKFLOW_SCHEMA_VERSION = "helix-universal-workflow.v1" as const;
export const UNIVERSAL_WORKFLOW_ENVELOPE_VERSION = "helix-universal-workflow-envelope.v1" as const;
export const RUNTIME_ORCHESTRATION_SCHEMA_VERSION = "helix-runtime-orchestration.v1" as const;

const idSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const textSchema = z.string().trim().min(1);
export const WORKFLOW_ATOM_KINDS = [
  "target",
  "actor",
  "state",
  "trigger",
  "condition",
  "action",
  "transition",
  "loop",
  "terminal",
  "exception",
  "permission",
  "timeout",
  "notification",
  "audit",
  "data",
] as const;
export const workflowAtomKindSchema = z.enum(WORKFLOW_ATOM_KINDS);

const baseAtomSchema = z.object({ atom_id: idSchema }).strict();

export const workflowAtomSchema = z.discriminatedUnion("kind", [
  baseAtomSchema.extend({ kind: z.literal("target"), value: textSchema }).strict(),
  baseAtomSchema
    .extend({ kind: z.literal("actor"), actor_id: idSchema, responsibility: textSchema })
    .strict(),
  baseAtomSchema
    .extend({ kind: z.literal("state"), state_id: idSchema, name: textSchema })
    .strict(),
  baseAtomSchema
    .extend({ kind: z.literal("trigger"), trigger_id: idSchema, event: textSchema })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("condition"),
      condition_id: idSchema,
      expression: textSchema,
      data_ids: z.array(idSchema).min(1),
    })
    .strict(),
  baseAtomSchema
    .extend({ kind: z.literal("action"), action_id: idSchema, operation: textSchema })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("transition"),
      transition_id: idSchema,
      current_state_id: idSchema,
      trigger_id: idSchema,
      condition_ids: z.array(idSchema),
      action_ids: z.array(idSchema).min(1),
      next_state_id: idSchema,
    })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("loop"),
      loop_id: idSchema,
      return_state_id: idSchema,
      continue_condition_id: idSchema,
      stop_condition_id: idSchema,
      max_iterations: z.number().int().positive(),
      on_limit: z.enum(["failure", "timeout", "dead_letter"]),
    })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("terminal"),
      terminal_id: idSchema,
      terminal_kind: z.enum(["normal", "cancel", "failure", "timeout"]),
      state_id: idSchema,
      post_updates: z.array(textSchema),
      notification_ids: z.array(idSchema),
      audit_ids: z.array(idSchema).min(1),
      restartable: z.boolean(),
    })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("exception"),
      exception_id: idSchema,
      source_transition_id: idSchema,
      recovery_state_id: idSchema,
    })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("permission"),
      permission_id: idSchema,
      actor_id: idSchema,
      action_ids: z.array(idSchema).min(1),
    })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("timeout"),
      timeout_id: idSchema,
      transition_id: idSchema,
      duration_ms: z.number().int().positive(),
      on_timeout_state_id: idSchema,
    })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("notification"),
      notification_id: idSchema,
      event: textSchema,
      recipient_actor_ids: z.array(idSchema).min(1),
    })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("audit"),
      audit_id: idSchema,
      event: textSchema,
      retained_for: textSchema,
    })
    .strict(),
  baseAtomSchema
    .extend({
      kind: z.literal("data"),
      data_id: idSchema,
      data_type: textSchema,
      required: z.boolean(),
      validation: textSchema,
      nullable: z.boolean(),
      ssot: textSchema,
      mutable: z.boolean(),
      sensitive: z.boolean(),
      retention: textSchema,
    })
    .strict(),
]);

export type WorkflowAtom = z.infer<typeof workflowAtomSchema>;

export const universalWorkflowModelSchema = z
  .object({
    schema_version: z.literal(UNIVERSAL_WORKFLOW_SCHEMA_VERSION),
    workflow_id: idSchema,
    revision: idSchema,
    source_digest: digestSchema,
    atoms: z.array(workflowAtomSchema).min(1),
  })
  .strict();

const unresolvedItemSchema = z
  .object({
    unresolved_id: idSchema,
    kind: z.enum(["ambiguity", "contradiction", "authority_missing", "branch_missing"]),
    blocking: z.boolean(),
    source_span: textSchema,
    question_history: z.array(textSchema).min(1),
  })
  .strict();

const derivedRequirementSchema = z
  .object({
    requirement_id: idSchema,
    source_transition_id: idSchema,
    layer: z.enum(["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12"]),
    status: z.enum(["candidate", "confirmed", "rejected"]),
  })
  .strict();

const contractCandidateSchema = z
  .object({
    contract_id: idSchema,
    source_transition_id: idSchema,
    contract_kind: z.enum(["precondition", "postcondition", "invariant", "failure", "oracle"]),
    statement: textSchema,
  })
  .strict();

const coverageReportSchema = z
  .object({
    required_atom_kinds: z.array(workflowAtomKindSchema).min(1),
    covered_atom_kinds: z.array(workflowAtomKindSchema).min(1),
    missing_atom_kinds: z.array(workflowAtomKindSchema),
  })
  .strict();

export const runtimeOrchestrationSchema = z
  .object({
    schema_version: z.literal(RUNTIME_ORCHESTRATION_SCHEMA_VERSION),
    source_digest: digestSchema,
    execution_id: idSchema,
    capability_constraints: z.array(textSchema).min(1),
    capacity_limit: z.number().int().positive(),
    concurrency_limit: z.number().int().positive(),
    fallback: textSchema,
    dead_letter: textSchema,
  })
  .strict();

export const universalWorkflowEnvelopeSchema = z
  .object({
    schema_version: z.literal(UNIVERSAL_WORKFLOW_ENVELOPE_VERSION),
    source: z
      .object({
        source_id: idSchema,
        revision: idSchema,
        digest: digestSchema,
      })
      .strict(),
    workflow_model: universalWorkflowModelSchema,
    unresolved_items: z.array(unresolvedItemSchema),
    derived_requirements: z.array(derivedRequirementSchema),
    coverage_report: coverageReportSchema,
    contract_candidates: z.array(contractCandidateSchema),
    runtime_orchestration: runtimeOrchestrationSchema,
  })
  .strict();

export type UniversalWorkflowEnvelope = z.infer<typeof universalWorkflowEnvelopeSchema>;

export interface UniversalWorkflowEnvelopeFinding {
  code: string;
  path: string;
  message: string;
}

export interface UniversalWorkflowEnvelopeValidation {
  ok: boolean;
  activation_allowed: boolean;
  findings: UniversalWorkflowEnvelopeFinding[];
  envelope: UniversalWorkflowEnvelope | null;
}

function semanticFindings(envelope: UniversalWorkflowEnvelope): UniversalWorkflowEnvelopeFinding[] {
  const findings: UniversalWorkflowEnvelopeFinding[] = [];
  const atoms = envelope.workflow_model.atoms;
  const byKind = new Map<string, WorkflowAtom[]>();
  const atomIds = new Set<string>();
  for (const atom of atoms) {
    if (atomIds.has(atom.atom_id)) {
      findings.push({
        code: "duplicate_atom_id",
        path: "workflow_model.atoms",
        message: `duplicate atom_id: ${atom.atom_id}`,
      });
    }
    atomIds.add(atom.atom_id);
    byKind.set(atom.kind, [...(byKind.get(atom.kind) ?? []), atom]);
  }
  for (const required of envelope.coverage_report.required_atom_kinds) {
    if (!byKind.has(required)) {
      findings.push({
        code: "required_atom_missing",
        path: "coverage_report.required_atom_kinds",
        message: `required atom kind is absent: ${required}`,
      });
    }
  }
  const actualKinds = [...byKind.keys()].sort();
  const coveredKinds = [...new Set(envelope.coverage_report.covered_atom_kinds)].sort();
  if (JSON.stringify(actualKinds) !== JSON.stringify(coveredKinds)) {
    findings.push({
      code: "coverage_report_drift",
      path: "coverage_report.covered_atom_kinds",
      message: "covered_atom_kinds must exactly equal the atom kinds in workflow_model",
    });
  }
  if (envelope.coverage_report.missing_atom_kinds.length > 0) {
    findings.push({
      code: "coverage_incomplete",
      path: "coverage_report.missing_atom_kinds",
      message: "missing_atom_kinds must be empty before activation",
    });
  }
  if (
    envelope.source.digest !== envelope.workflow_model.source_digest ||
    envelope.source.digest !== envelope.runtime_orchestration.source_digest
  ) {
    findings.push({
      code: "source_digest_mismatch",
      path: "source.digest",
      message: "workflow and runtime composition must bind the same source digest",
    });
  }
  for (const requiredCore of ["target", "actor", "state", "transition", "terminal"] as const) {
    if (!byKind.has(requiredCore)) {
      findings.push({
        code: "core_atom_missing",
        path: "workflow_model.atoms",
        message: `core atom kind is absent: ${requiredCore}`,
      });
    }
  }
  const blocking = envelope.unresolved_items.filter((item) => item.blocking);
  if (blocking.length > 0) {
    findings.push({
      code: "blocking_unresolved",
      path: "unresolved_items",
      message: `${blocking.length} blocking unresolved item(s) remain`,
    });
  }

  const ids = (kind: WorkflowAtom["kind"], field: string): Set<string> =>
    new Set(
      atoms
        .filter((atom) => atom.kind === kind)
        .map((atom) => (atom as unknown as Record<string, unknown>)[field])
        .filter((value): value is string => typeof value === "string"),
    );
  const states = ids("state", "state_id");
  const triggers = ids("trigger", "trigger_id");
  const conditions = ids("condition", "condition_id");
  const actions = ids("action", "action_id");
  const data = ids("data", "data_id");
  const actors = ids("actor", "actor_id");
  const transitions = ids("transition", "transition_id");
  const notifications = ids("notification", "notification_id");
  const audits = ids("audit", "audit_id");
  const requireRef = (set: Set<string>, value: string, path: string): void => {
    if (!set.has(value)) {
      findings.push({
        code: "atom_reference_missing",
        path,
        message: `referenced atom does not exist: ${value}`,
      });
    }
  };
  for (const atom of atoms) {
    switch (atom.kind) {
      case "condition":
        for (const dataId of atom.data_ids) requireRef(data, dataId, `${atom.atom_id}.data_ids`);
        break;
      case "transition":
        requireRef(states, atom.current_state_id, `${atom.atom_id}.current_state_id`);
        requireRef(states, atom.next_state_id, `${atom.atom_id}.next_state_id`);
        requireRef(triggers, atom.trigger_id, `${atom.atom_id}.trigger_id`);
        for (const conditionId of atom.condition_ids)
          requireRef(conditions, conditionId, `${atom.atom_id}.condition_ids`);
        for (const actionId of atom.action_ids)
          requireRef(actions, actionId, `${atom.atom_id}.action_ids`);
        break;
      case "loop":
        requireRef(states, atom.return_state_id, `${atom.atom_id}.return_state_id`);
        requireRef(conditions, atom.continue_condition_id, `${atom.atom_id}.continue_condition_id`);
        requireRef(conditions, atom.stop_condition_id, `${atom.atom_id}.stop_condition_id`);
        break;
      case "terminal":
        requireRef(states, atom.state_id, `${atom.atom_id}.state_id`);
        for (const notificationId of atom.notification_ids)
          requireRef(notifications, notificationId, `${atom.atom_id}.notification_ids`);
        for (const auditId of atom.audit_ids)
          requireRef(audits, auditId, `${atom.atom_id}.audit_ids`);
        break;
      case "exception":
        requireRef(transitions, atom.source_transition_id, `${atom.atom_id}.source_transition_id`);
        requireRef(states, atom.recovery_state_id, `${atom.atom_id}.recovery_state_id`);
        break;
      case "permission":
        requireRef(actors, atom.actor_id, `${atom.atom_id}.actor_id`);
        for (const actionId of atom.action_ids)
          requireRef(actions, actionId, `${atom.atom_id}.action_ids`);
        break;
      case "timeout":
        requireRef(transitions, atom.transition_id, `${atom.atom_id}.transition_id`);
        requireRef(states, atom.on_timeout_state_id, `${atom.atom_id}.on_timeout_state_id`);
        break;
      case "notification":
        for (const actorId of atom.recipient_actor_ids)
          requireRef(actors, actorId, `${atom.atom_id}.recipient_actor_ids`);
        break;
      default:
        break;
    }
  }
  for (const requirement of envelope.derived_requirements) {
    requireRef(
      transitions,
      requirement.source_transition_id,
      `derived_requirements.${requirement.requirement_id}.source_transition_id`,
    );
  }
  for (const candidate of envelope.contract_candidates) {
    requireRef(
      transitions,
      candidate.source_transition_id,
      `contract_candidates.${candidate.contract_id}.source_transition_id`,
    );
  }
  if (
    envelope.runtime_orchestration.concurrency_limit > envelope.runtime_orchestration.capacity_limit
  ) {
    findings.push({
      code: "runtime_limit_invalid",
      path: "runtime_orchestration.concurrency_limit",
      message: "concurrency_limit must not exceed capacity_limit",
    });
  }
  return findings;
}

export function validateUniversalWorkflowEnvelope(
  input: unknown,
): UniversalWorkflowEnvelopeValidation {
  const parsed = universalWorkflowEnvelopeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      activation_allowed: false,
      findings: parsed.error.issues.map((issue) => ({
        code: "schema_invalid",
        path: issue.path.join("."),
        message: issue.message,
      })),
      envelope: null,
    };
  }
  const findings = semanticFindings(parsed.data);
  return {
    ok: findings.length === 0,
    activation_allowed: findings.length === 0,
    findings,
    envelope: parsed.data,
  };
}
