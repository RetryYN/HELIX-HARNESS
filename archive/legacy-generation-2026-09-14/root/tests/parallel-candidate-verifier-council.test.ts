import { describe, expect, it } from "vitest";
import { buildCandidateCouncilReport } from "../src/runtime/parallel-candidate-verifier-council";

describe("parallel candidate verifier council", () => {
  it("rejects missing replay commands and vetoes self-review", () => {
    const report = buildCandidateCouncilReport([
      {
        candidate_id: "self-review",
        worker_session_id: "s1",
        verifier_session_id: "s1",
        worktree_path: ".helix/worktrees/a",
        replay_command: "npx --no-install vitest run",
        diff_summary: "changed tests",
        risk_findings: [],
        evidence_path: "tests/x.test.ts",
      },
      {
        candidate_id: "missing-replay",
        worker_session_id: "s1",
        verifier_session_id: "s2",
        worktree_path: ".helix/worktrees/b",
        replay_command: null,
        diff_summary: "changed src",
        risk_findings: [],
        evidence_path: "tests/y.test.ts",
      },
    ]);

    expect(report.ok).toBe(false);
    expect(report.decisions.map((decision) => decision.reject_reason)).toEqual([
      "self_review_forbidden",
      "missing_replay_command",
    ]);
    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: "self_review_forbidden", severity: "error" }),
    );
  });

  it("selects a candidate without applying it to main worktree", () => {
    const report = buildCandidateCouncilReport([
      {
        candidate_id: "candidate-a",
        worker_session_id: "s1",
        verifier_session_id: "s2",
        worktree_path: ".helix/worktrees/a",
        replay_command: "npx --no-install vitest run tests/a.test.ts",
        diff_summary: "changed implementation",
        risk_findings: [],
        evidence_path: "tests/a.test.ts",
      },
    ]);

    expect(report.ok).toBe(true);
    expect(report.selected_candidate_id).toBe("candidate-a");
    expect(report.merge_policy).toBe("delegate_to_existing_github_gate");
  });
});
