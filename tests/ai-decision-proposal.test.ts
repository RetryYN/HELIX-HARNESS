import { describe, expect, it } from "vitest";
import {
  AI_DECISION_PROPOSAL_SCHEMA_VERSION,
  validateAiDecisionProposal,
} from "../src/workflow/ai-decision-proposal";

// PLAN-L7-558-ai-decision-proposal-authority
// PLAN-L7-646-ai-decision-proposal-failure-oracle
const proposal = () => ({
  schema_version: AI_DECISION_PROPOSAL_SCHEMA_VERSION,
  facts: [{ id: "fact:queue", statement: "queue depth is 8", evidence_ref: "metric:queue" }],
  candidates: [
    { id: "candidate:keep", description: "keep current worker", enabled: true },
    { id: "candidate:switch", description: "switch worker", enabled: true },
  ],
  policy_constraints: [
    { id: "policy:cost", statement: "cost must remain within budget", passed: true },
  ],
  scored_proposal: {
    candidate_id: "candidate:switch",
    score: 0.82,
    rationale: "queue reduction outweighs switching cost",
  },
  confidence: 0.78,
  counterevidence: [
    { statement: "cold start may increase latency", evidence_ref: "metric:latency" },
  ],
  unresolved: [
    { id: "unresolved:capacity", detail: "future capacity is uncertain", blocking: false },
  ],
  proposed_next_state: "awaiting_commit_verifier",
  fallback: { candidate_id: "candidate:keep", trigger: "latency regression" },
  reassessment: { trigger: "queue or latency threshold changes", interval: "PT15M" },
  measurement_oracle: {
    contract_id: "measurement:worker-switch-v1",
    revision: "r1",
    current: true,
    metrics: [
      "quality",
      "latency",
      "cost",
      "queue",
      "failure",
      "fallback_rate",
      "misjudgment",
      "human_override",
      "drift",
    ],
  },
  authority: {
    actor: "ai",
    mode: "proposal_only",
    requested_actions: ["propose_next_state"],
  },
});

describe("AI decision proposal authority", () => {
  it("U-UWPROP-001: complete proposalをproposal-onlyとして受理する", () => {
    expect(validateAiDecisionProposal(proposal())).toEqual({ ok: true, findings: [] });
  });

  it("U-UWPROP-002: 判断chain、fallback、reassessment、oracleの欠落を個別に拒否する", () => {
    for (const key of [
      "facts",
      "candidates",
      "policy_constraints",
      "scored_proposal",
      "confidence",
      "counterevidence",
      "unresolved",
      "proposed_next_state",
      "fallback",
      "reassessment",
      "measurement_oracle",
    ] as const) {
      const candidate = proposal() as Record<string, unknown>;
      delete candidate[key];
      expect(validateAiDecisionProposal(candidate)).toMatchObject({
        ok: false,
        findings: [expect.objectContaining({ code: "schema_invalid" })],
      });
    }
  });

  it("U-UWPROP-003: AI自己承認、権限昇格、high-impact、direct writeをfail-closeする", () => {
    for (const requestedAction of [
      "requirements_freeze",
      "permission_grant",
      "high_impact_action",
      "gate_pass",
      "db_commit",
      "git_commit",
      "github_commit",
      "delete_repository",
      "execute_shell",
      "write_file",
    ]) {
      const candidate = proposal();
      candidate.authority.requested_actions = [requestedAction];
      expect(validateAiDecisionProposal(candidate)).toMatchObject({
        ok: false,
        findings: [expect.objectContaining({ code: "authority_escalation_forbidden" })],
      });
    }
    const empty = proposal();
    empty.authority.requested_actions = [];
    expect(validateAiDecisionProposal(empty)).toMatchObject({
      ok: false,
      findings: [expect.objectContaining({ code: "schema_invalid" })],
    });
  });

  it("U-UWPROP-004: stale oracle、policy failure、blocking unresolved、commit verifier未達を実行可能にしない", () => {
    const stale = proposal();
    stale.measurement_oracle.current = false;
    expect(validateAiDecisionProposal(stale).ok).toBe(false);
    const denied = proposal();
    denied.policy_constraints[0].passed = false;
    expect(validateAiDecisionProposal(denied).ok).toBe(false);
    const blocked = proposal();
    blocked.unresolved[0].blocking = true;
    expect(validateAiDecisionProposal(blocked).ok).toBe(false);
    const unverified = proposal();
    unverified.proposed_next_state = "committed";
    expect(validateAiDecisionProposal(unverified).ok).toBe(false);
  });

  it("U-UWPROP-005: candidate参照整合性とstrict schemaを守る", () => {
    const unknown = proposal();
    unknown.scored_proposal.candidate_id = "candidate:unknown";
    expect(validateAiDecisionProposal(unknown).ok).toBe(false);
    expect(validateAiDecisionProposal({ ...proposal(), extra: true }).ok).toBe(false);
  });

  it("U-UWPROP-006: 各failure branchを単独fixtureでexact codeへ固定する", () => {
    const schemaInvalid = { ...proposal(), schema_version: "unknown" };
    const authorityEscalation = proposal();
    authorityEscalation.authority.requested_actions = ["git_commit"];
    const candidateReference = proposal();
    candidateReference.scored_proposal.candidate_id = "candidate:unknown";
    const policyFailure = proposal();
    policyFailure.policy_constraints[0].passed = false;
    const blockingUnresolved = proposal();
    blockingUnresolved.unresolved[0].blocking = true;
    const staleOracle = proposal();
    staleOracle.measurement_oracle.current = false;
    const incompleteOracle = proposal();
    incompleteOracle.measurement_oracle.metrics = incompleteOracle.measurement_oracle.metrics.filter(
      (metric) => metric !== "drift",
    );
    const commitVerifierMissing = proposal();
    commitVerifierMissing.proposed_next_state = "committed";

    const cases: Array<[unknown, string]> = [
      [schemaInvalid, "schema_invalid"],
      [authorityEscalation, "authority_escalation_forbidden"],
      [candidateReference, "candidate_reference_invalid"],
      [policyFailure, "policy_constraint_failed"],
      [blockingUnresolved, "blocking_unresolved"],
      [staleOracle, "measurement_oracle_stale"],
      [incompleteOracle, "measurement_oracle_incomplete"],
      [commitVerifierMissing, "commit_verifier_required"],
    ];

    for (const [fixture, expectedCode] of cases) {
      expect(validateAiDecisionProposal(fixture)).toEqual({
        ok: false,
        findings: [expect.objectContaining({ code: expectedCode })],
      });
    }
  });
});
