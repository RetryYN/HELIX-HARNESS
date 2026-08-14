import { z } from "zod";

export const AI_DECISION_PROPOSAL_SCHEMA_VERSION = "helix-ai-decision-proposal.v1" as const;

const id = z.string().min(1);
const statement = z.string().min(1);
const candidateSchema = z.object({ id, description: statement, enabled: z.boolean() }).strict();
const forbiddenActions = new Set([
  "requirements_freeze",
  "permission_grant",
  "high_impact_action",
  "gate_pass",
  "db_commit",
  "git_commit",
  "github_commit",
]);
const requiredMetrics = new Set([
  "quality",
  "latency",
  "cost",
  "queue",
  "failure",
  "fallback_rate",
  "misjudgment",
  "human_override",
  "drift",
]);

const proposalSchema = z
  .object({
    schema_version: z.literal(AI_DECISION_PROPOSAL_SCHEMA_VERSION),
    facts: z.array(z.object({ id, statement, evidence_ref: id }).strict()).min(1),
    candidates: z.array(candidateSchema).min(1),
    policy_constraints: z.array(z.object({ id, statement, passed: z.boolean() }).strict()).min(1),
    scored_proposal: z
      .object({ candidate_id: id, score: z.number().min(0).max(1), rationale: statement })
      .strict(),
    confidence: z.number().min(0).max(1),
    counterevidence: z.array(z.object({ statement, evidence_ref: id }).strict()),
    unresolved: z.array(z.object({ id, detail: statement, blocking: z.boolean() }).strict()),
    proposed_next_state: id,
    fallback: z.object({ candidate_id: id, trigger: statement }).strict(),
    reassessment: z.object({ trigger: statement, interval: statement }).strict(),
    measurement_oracle: z
      .object({
        contract_id: id,
        revision: id,
        current: z.boolean(),
        metrics: z.array(id).min(1),
      })
      .strict(),
    authority: z
      .object({
        actor: z.literal("ai"),
        mode: z.literal("proposal_only"),
        requested_actions: z.array(id),
      })
      .strict(),
  })
  .strict();

export interface AiDecisionProposalFinding {
  code:
    | "schema_invalid"
    | "authority_escalation_forbidden"
    | "candidate_reference_invalid"
    | "policy_constraint_failed"
    | "blocking_unresolved"
    | "measurement_oracle_stale"
    | "measurement_oracle_incomplete"
    | "commit_verifier_required";
  detail: string;
}

export interface AiDecisionProposalValidation {
  ok: boolean;
  findings: AiDecisionProposalFinding[];
}

export function validateAiDecisionProposal(input: unknown): AiDecisionProposalValidation {
  const parsed = proposalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      findings: [{ code: "schema_invalid", detail: parsed.error.issues[0]?.message ?? "invalid" }],
    };
  }
  const value = parsed.data;
  const findings: AiDecisionProposalFinding[] = [];
  const forbidden = value.authority.requested_actions.find((action) =>
    forbiddenActions.has(action),
  );
  if (forbidden) {
    findings.push({
      code: "authority_escalation_forbidden",
      detail: `AI proposal requested forbidden authority: ${forbidden}`,
    });
  }
  const candidates = new Set(
    value.candidates.filter((candidate) => candidate.enabled).map((candidate) => candidate.id),
  );
  if (
    !candidates.has(value.scored_proposal.candidate_id) ||
    !candidates.has(value.fallback.candidate_id)
  ) {
    findings.push({
      code: "candidate_reference_invalid",
      detail: "scored proposal and fallback must reference enabled candidates",
    });
  }
  if (value.policy_constraints.some((constraint) => !constraint.passed)) {
    findings.push({ code: "policy_constraint_failed", detail: "all policy constraints must pass" });
  }
  if (value.unresolved.some((item) => item.blocking)) {
    findings.push({ code: "blocking_unresolved", detail: "blocking unresolved item remains" });
  }
  if (!value.measurement_oracle.current) {
    findings.push({ code: "measurement_oracle_stale", detail: "measurement oracle is stale" });
  }
  const metrics = new Set(value.measurement_oracle.metrics);
  if ([...requiredMetrics].some((metric) => !metrics.has(metric))) {
    findings.push({
      code: "measurement_oracle_incomplete",
      detail: "measurement oracle does not cover the required L10-L12 metrics",
    });
  }
  if (value.proposed_next_state !== "awaiting_commit_verifier") {
    findings.push({
      code: "commit_verifier_required",
      detail: "proposal cannot advance beyond the commit verifier boundary",
    });
  }
  return { ok: findings.length === 0, findings };
}
