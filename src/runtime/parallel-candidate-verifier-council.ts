export const PARALLEL_CANDIDATE_COUNCIL_SCHEMA_VERSION = "parallel-candidate-verifier-council.v1";

export type CandidateVerifierInput = {
  candidate_id: string;
  worker_session_id: string;
  verifier_session_id: string;
  worktree_path: string;
  replay_command: string | null;
  diff_summary: string;
  risk_findings: string[];
  evidence_path: string;
};

export type CandidateVerifierDecision = CandidateVerifierInput & {
  verdict: "accept" | "reject" | "veto";
  reject_reason: string | null;
};

export type CandidateCouncilReport = {
  schema_version: typeof PARALLEL_CANDIDATE_COUNCIL_SCHEMA_VERSION;
  ok: boolean;
  selected_candidate_id: string | null;
  merge_policy: "delegate_to_existing_github_gate";
  decisions: CandidateVerifierDecision[];
  findings: Array<{ code: string; severity: "error" | "warning"; detail: string }>;
  source_command: string;
};

export function buildCandidateCouncilReport(
  candidates: CandidateVerifierInput[],
  options: { sourceCommand?: string } = {},
): CandidateCouncilReport {
  const decisions = candidates.map((candidate): CandidateVerifierDecision => {
    if (candidate.worker_session_id === candidate.verifier_session_id) {
      return { ...candidate, verdict: "veto", reject_reason: "self_review_forbidden" };
    }
    if (!candidate.replay_command || candidate.replay_command.trim().length === 0) {
      return { ...candidate, verdict: "reject", reject_reason: "missing_replay_command" };
    }
    if (candidate.risk_findings.length > 0) {
      return { ...candidate, verdict: "reject", reject_reason: "risk_findings_present" };
    }
    if (!candidate.evidence_path.trim()) {
      return { ...candidate, verdict: "reject", reject_reason: "missing_evidence_path" };
    }
    return { ...candidate, verdict: "accept", reject_reason: null };
  });
  const findings = decisions
    .filter((decision) => decision.verdict !== "accept")
    .map((decision) => ({
      code: decision.reject_reason ?? "candidate_rejected",
      severity: decision.verdict === "veto" ? ("error" as const) : ("warning" as const),
      detail: `${decision.candidate_id}: ${decision.reject_reason ?? "candidate_rejected"}`,
    }));
  const selected = decisions.find((decision) => decision.verdict === "accept") ?? null;
  return {
    schema_version: PARALLEL_CANDIDATE_COUNCIL_SCHEMA_VERSION,
    ok: findings.every((finding) => finding.severity !== "error"),
    selected_candidate_id: selected?.candidate_id ?? null,
    merge_policy: "delegate_to_existing_github_gate",
    decisions,
    findings,
    source_command: options.sourceCommand ?? "helix candidate council --json",
  };
}
