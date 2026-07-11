import { describe, expect, it } from "vitest";
import { buildStateMachineToolPolicyReport } from "../src/runtime/state-machine-tool-policy";

describe("state machine tool policy", () => {
  it("fail-closes autonomous runs without a state policy", () => {
    const report = buildStateMachineToolPolicyReport({ policy: null });

    expect(report.ok).toBe(false);
    expect(report.run_allowed).toBe(false);
    expect(report.findings).toEqual([
      expect.objectContaining({ code: "state_policy_missing_fail_close" }),
    ]);
  });

  it("does not claim unsupported hard enforcement and escalates disallowed tools", () => {
    const report = buildStateMachineToolPolicyReport({
      policy: {
        state_id: "state:implement",
        allowed_tools: ["apply_patch"],
        transitions: ["trace-freeze"],
        exit_criteria: ["tests green"],
        enforcement: "unsupported",
        approval_required_tools: ["network"],
      },
      requested_tools: ["network"],
    });

    expect(report.ok).toBe(false);
    expect(report.enforcement_claim).toBe("advisory");
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "unsupported_hard_enforcement_not_claimed",
        "tool_escalation_requires_approval",
      ]),
    );
    expect(report.state_transition_evidence).toMatchObject({
      from_state: "state:implement",
      to_states: ["trace-freeze"],
    });
  });
});
