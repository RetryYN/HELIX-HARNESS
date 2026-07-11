export const STATE_MACHINE_TOOL_POLICY_SCHEMA_VERSION = "state-machine-tool-policy.v1";

export type EnforcementMode = "hard" | "advisory" | "unsupported";

export interface StatePolicy {
  state_id: string;
  allowed_tools: string[];
  transitions: string[];
  exit_criteria: string[];
  enforcement: EnforcementMode;
  approval_required_tools?: string[];
}

export interface StateMachineToolPolicyReport {
  schema_version: typeof STATE_MACHINE_TOOL_POLICY_SCHEMA_VERSION;
  ok: boolean;
  run_allowed: boolean;
  state_id: string | null;
  enforcement_claim: EnforcementMode | "none";
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  state_transition_evidence: {
    from_state: string | null;
    to_states: string[];
    exit_criteria: string[];
  } | null;
  source_command: string;
  read_only: true;
}

export function buildStateMachineToolPolicyReport(input: {
  policy?: StatePolicy | null;
  requested_tools?: string[];
  sourceCommand?: string;
}): StateMachineToolPolicyReport {
  const findings: StateMachineToolPolicyReport["findings"] = [];
  const policy = input.policy ?? null;
  if (!policy) {
    return {
      schema_version: STATE_MACHINE_TOOL_POLICY_SCHEMA_VERSION,
      ok: false,
      run_allowed: false,
      state_id: null,
      enforcement_claim: "none",
      findings: [
        {
          code: "state_policy_missing_fail_close",
          severity: "error",
          detail: "autonomous run requires an explicit state policy",
        },
      ],
      state_transition_evidence: null,
      source_command: input.sourceCommand ?? "helix state-machine policy --json",
      read_only: true,
    };
  }
  if (policy.enforcement === "unsupported") {
    findings.push({
      code: "unsupported_hard_enforcement_not_claimed",
      severity: "warning",
      detail: `${policy.state_id} is advisory because hard enforcement is unsupported`,
    });
  }
  for (const tool of input.requested_tools ?? []) {
    if (!policy.allowed_tools.includes(tool)) {
      findings.push({
        code: "tool_escalation_requires_approval",
        severity: (policy.approval_required_tools ?? []).includes(tool) ? "error" : "warning",
        detail: `${tool} is not allowed in ${policy.state_id}`,
      });
    }
  }
  const hasError = findings.some((finding) => finding.severity === "error");
  return {
    schema_version: STATE_MACHINE_TOOL_POLICY_SCHEMA_VERSION,
    ok: !hasError,
    run_allowed: !hasError && policy.enforcement !== "unsupported",
    state_id: policy.state_id,
    enforcement_claim: policy.enforcement === "unsupported" ? "advisory" : policy.enforcement,
    findings,
    state_transition_evidence: {
      from_state: policy.state_id,
      to_states: policy.transitions,
      exit_criteria: policy.exit_criteria,
    },
    source_command: input.sourceCommand ?? "helix state-machine policy --json",
    read_only: true,
  };
}
