import { canonicalJson, sha256Digest } from "./digest";

export const CI_DEFERRED_RECOVERY_SCHEMA = "helix-ci-deferred-recovery.v1" as const;

export type DeferredRecoveryProfile = "main" | "nightly" | "release_candidate";
export type DeferredTerminalResult = "succeeded" | "failed" | "cancelled";

export interface DeferredRecoveryAssignment {
  obligation_id: string;
  origin_pr: number;
  candidate_head: string;
  target_profile: DeferredRecoveryProfile;
  selector_decision_id: string;
  registry_edge_id: string;
  expires_at: string;
}

export interface DeferredRecoveryRun {
  run_id: string;
  attempt: number;
  obligation_id: string;
  origin_pr: number;
  candidate_head: string;
  profile: DeferredRecoveryProfile;
  completed_at: string;
  result: DeferredTerminalResult;
  first_detecting_oracle_id: string | null;
  evidence_digest: string;
}

export interface DeferredQuarantine {
  obligation_id: string;
  owner: string;
  expires_at: string;
  replacement_oracle_id: string;
}

export interface DeferredRecoveryInput {
  assignments: readonly DeferredRecoveryAssignment[];
  terminal_runs: readonly DeferredRecoveryRun[];
  quarantines: readonly DeferredQuarantine[];
  evaluated_at: string;
  wall_time_delta_ms: number;
  runner_minute_delta: number;
  escaped_defect_count: number;
  mutation_detection_count: number;
  injected_mutation_count: number;
  flake_count: number;
}

export type DeferredRecoveryFindingCode =
  | "assignment_invalid"
  | "duplicate_assignment"
  | "recovery_missing"
  | "recovery_duplicate"
  | "recovery_wrong_profile"
  | "recovery_stale_head"
  | "recovery_origin_mismatch"
  | "recovery_expired"
  | "recovery_cancelled"
  | "recovery_evidence_invalid"
  | "quarantine_invalid"
  | "safety_regression";

export interface DeferredRecoveryFinding {
  code: DeferredRecoveryFindingCode;
  obligation_id: string;
  detail: string;
}

export interface DeferredRecoveryReceipt {
  obligation_id: string;
  origin_pr: number;
  candidate_head: string;
  target_profile: DeferredRecoveryProfile;
  first_terminal_run_id: string;
  first_terminal_attempt: number;
  result: DeferredTerminalResult;
  finding_disposition: "closed" | "backprop_required";
  selector_decision_id: string;
  registry_edge_id: string;
  first_detecting_oracle_id: string | null;
  evidence_digest: string;
}

export interface DeferredBackpropCandidate {
  obligation_id: string;
  selector_decision_id: string;
  registry_edge_id: string;
  first_detecting_oracle_id: string;
  source_run_id: string;
  disposition: "reverse_candidate";
}

export interface DeferredRecoveryProjection {
  schema_version: typeof CI_DEFERRED_RECOVERY_SCHEMA;
  receipts: readonly DeferredRecoveryReceipt[];
  backprop_candidates: readonly DeferredBackpropCandidate[];
  findings: readonly DeferredRecoveryFinding[];
  safety_metrics: {
    wall_time_delta_ms: number;
    runner_minute_delta: number;
    escaped_defect_count: number;
    mutation_detection_ratio: number | null;
    flake_count: number;
    deferred_expiry_count: number;
  };
  projection_digest: `sha256:${string}`;
  ok: boolean;
}

const SHA = /^[a-f0-9]{40}$/u;
const DIGEST = /^sha256:[a-f0-9]{64}$/u;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u;

function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function compareRun(a: DeferredRecoveryRun, b: DeferredRecoveryRun): number {
  return (
    Date.parse(a.completed_at) - Date.parse(b.completed_at) ||
    a.run_id.localeCompare(b.run_id) ||
    a.attempt - b.attempt
  );
}

export function reconcileDeferredObligations(
  input: DeferredRecoveryInput,
): DeferredRecoveryProjection {
  const findings: DeferredRecoveryFinding[] = [];
  const receipts: DeferredRecoveryReceipt[] = [];
  const backprop: DeferredBackpropCandidate[] = [];
  const evaluatedAt = Date.parse(input.evaluated_at);
  const assignments = new Map<string, DeferredRecoveryAssignment>();

  for (const assignment of input.assignments) {
    if (assignments.has(assignment.obligation_id)) {
      findings.push({
        code: "duplicate_assignment",
        obligation_id: assignment.obligation_id,
        detail: "exactly one target required",
      });
      continue;
    }
    if (
      !ID.test(assignment.obligation_id) ||
      !SHA.test(assignment.candidate_head) ||
      !Number.isInteger(assignment.origin_pr) ||
      assignment.origin_pr < 1 ||
      !ID.test(assignment.selector_decision_id) ||
      !ID.test(assignment.registry_edge_id) ||
      !validDate(assignment.expires_at)
    ) {
      findings.push({
        code: "assignment_invalid",
        obligation_id: assignment.obligation_id,
        detail: "identity or expiry is invalid",
      });
      continue;
    }
    assignments.set(assignment.obligation_id, assignment);
  }

  for (const assignment of [...assignments.values()].sort((a, b) =>
    a.obligation_id.localeCompare(b.obligation_id),
  )) {
    const runs = input.terminal_runs
      .filter((run) => run.obligation_id === assignment.obligation_id)
      .sort(compareRun);
    if (runs.length === 0) {
      findings.push({
        code:
          Date.parse(assignment.expires_at) <= evaluatedAt
            ? "recovery_expired"
            : "recovery_missing",
        obligation_id: assignment.obligation_id,
        detail: "terminal recovery run is absent",
      });
      continue;
    }
    if (runs.length > 1) {
      findings.push({
        code: "recovery_duplicate",
        obligation_id: assignment.obligation_id,
        detail: `terminal_runs=${runs.length}`,
      });
    }
    const run = runs[0];
    if (run.profile !== assignment.target_profile)
      findings.push({
        code: "recovery_wrong_profile",
        obligation_id: assignment.obligation_id,
        detail: `expected=${assignment.target_profile};actual=${run.profile}`,
      });
    if (run.candidate_head !== assignment.candidate_head)
      findings.push({
        code: "recovery_stale_head",
        obligation_id: assignment.obligation_id,
        detail: run.candidate_head,
      });
    if (run.origin_pr !== assignment.origin_pr)
      findings.push({
        code: "recovery_origin_mismatch",
        obligation_id: assignment.obligation_id,
        detail: `origin_pr=${run.origin_pr}`,
      });
    if (
      !DIGEST.test(run.evidence_digest) ||
      !validDate(run.completed_at) ||
      !ID.test(run.run_id) ||
      run.attempt < 1
    )
      findings.push({
        code: "recovery_evidence_invalid",
        obligation_id: assignment.obligation_id,
        detail: "terminal evidence identity is invalid",
      });
    if (run.result === "cancelled")
      findings.push({
        code: "recovery_cancelled",
        obligation_id: assignment.obligation_id,
        detail: run.run_id,
      });
    const failed = run.result !== "succeeded";
    receipts.push({
      obligation_id: assignment.obligation_id,
      origin_pr: assignment.origin_pr,
      candidate_head: assignment.candidate_head,
      target_profile: assignment.target_profile,
      first_terminal_run_id: run.run_id,
      first_terminal_attempt: run.attempt,
      result: run.result,
      finding_disposition: failed ? "backprop_required" : "closed",
      selector_decision_id: assignment.selector_decision_id,
      registry_edge_id: assignment.registry_edge_id,
      first_detecting_oracle_id: run.first_detecting_oracle_id,
      evidence_digest: run.evidence_digest,
    });
    if (failed && run.first_detecting_oracle_id && ID.test(run.first_detecting_oracle_id)) {
      backprop.push({
        obligation_id: assignment.obligation_id,
        selector_decision_id: assignment.selector_decision_id,
        registry_edge_id: assignment.registry_edge_id,
        first_detecting_oracle_id: run.first_detecting_oracle_id,
        source_run_id: run.run_id,
        disposition: "reverse_candidate",
      });
    }
  }

  for (const quarantine of input.quarantines) {
    if (
      !assignments.has(quarantine.obligation_id) ||
      !ID.test(quarantine.owner) ||
      !ID.test(quarantine.replacement_oracle_id) ||
      !validDate(quarantine.expires_at) ||
      Date.parse(quarantine.expires_at) <= evaluatedAt
    ) {
      findings.push({
        code: "quarantine_invalid",
        obligation_id: quarantine.obligation_id,
        detail: "owner, expiry, or replacement oracle is invalid",
      });
    }
  }
  const mutationRatio =
    input.injected_mutation_count === 0
      ? null
      : input.mutation_detection_count / input.injected_mutation_count;
  if (input.escaped_defect_count > 0 || (mutationRatio !== null && mutationRatio < 1)) {
    findings.push({
      code: "safety_regression",
      obligation_id: "ci-system",
      detail: `escaped=${input.escaped_defect_count};mutation_ratio=${mutationRatio}`,
    });
  }
  findings.sort((a, b) =>
    `${a.code}:${a.obligation_id}:${a.detail}`.localeCompare(
      `${b.code}:${b.obligation_id}:${b.detail}`,
    ),
  );
  const base = {
    schema_version: CI_DEFERRED_RECOVERY_SCHEMA,
    receipts,
    backprop_candidates: backprop,
    findings,
    safety_metrics: {
      wall_time_delta_ms: input.wall_time_delta_ms,
      runner_minute_delta: input.runner_minute_delta,
      escaped_defect_count: input.escaped_defect_count,
      mutation_detection_ratio: mutationRatio,
      flake_count: input.flake_count,
      deferred_expiry_count: findings.filter((item) => item.code === "recovery_expired").length,
    },
    ok: findings.length === 0,
  };
  return { ...base, projection_digest: sha256Digest(canonicalJson(base)) };
}
