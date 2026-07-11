export const SECURITY_CREDENTIAL_EGRESS_GUARD_SCHEMA_VERSION =
  "security-credential-egress-guard.v1";

export type EgressPolicy = "offline" | "allowlist" | "undefined";
export type ActivationKind = "none" | "external_api" | "auth" | "infra";

export interface ToolEgressCheckInput {
  tool_name: string;
  external: boolean;
  egress_policy?: EgressPolicy | null;
  allowed_hosts?: string[];
  args?: string[];
  activation_kind?: ActivationKind;
  action_binding_approval_present?: boolean;
}

export interface SecurityCredentialEgressGuardReport {
  schema_version: typeof SECURITY_CREDENTIAL_EGRESS_GUARD_SCHEMA_VERSION;
  ok: boolean;
  dry_run: true;
  credential_contract: {
    scoped_token_only: true;
    no_raw_secret_exposure: true;
    broker_required_for_external_auth: true;
  };
  tool_policy: {
    tool_name: string;
    external: boolean;
    egress_policy: EgressPolicy;
    allowed_hosts: string[];
    activation_kind: ActivationKind;
    action_binding_approval_present: boolean;
  };
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

const SECRET_LIKE_RE =
  /\b[A-Za-z0-9_-]*(?:token|api[_-]?key|secret|password|passwd|pwd|bearer)[A-Za-z0-9_-]*\s*[=:]\s*\S+/i;

export function buildSecurityCredentialEgressGuardReport(
  input: ToolEgressCheckInput,
  options: { sourceCommand?: string } = {},
): SecurityCredentialEgressGuardReport {
  const policy = input.egress_policy ?? "undefined";
  const activationKind = input.activation_kind ?? "none";
  const approvalPresent = input.action_binding_approval_present === true;
  const findings: SecurityCredentialEgressGuardReport["findings"] = [];

  if (input.external && policy === "undefined") {
    findings.push({
      code: "undefined_egress_policy_fail_close",
      severity: "error",
      detail: `${input.tool_name} is external but has no egress policy`,
    });
  }
  if (policy === "allowlist" && (input.allowed_hosts ?? []).length === 0) {
    findings.push({
      code: "allowlist_without_hosts",
      severity: "error",
      detail: `${input.tool_name} uses allowlist policy without allowed hosts`,
    });
  }
  for (const arg of input.args ?? []) {
    if (SECRET_LIKE_RE.test(arg)) {
      findings.push({
        code: "credential_like_tool_argument_blocked",
        severity: "error",
        detail: `${input.tool_name} argument contains secret-like material`,
      });
    }
  }
  if (activationKind !== "none" && !approvalPresent) {
    findings.push({
      code: "action_binding_approval_required",
      severity: "error",
      detail: `${activationKind} activation is not ready without action-binding approval`,
    });
  }

  return {
    schema_version: SECURITY_CREDENTIAL_EGRESS_GUARD_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    dry_run: true,
    credential_contract: {
      scoped_token_only: true,
      no_raw_secret_exposure: true,
      broker_required_for_external_auth: true,
    },
    tool_policy: {
      tool_name: input.tool_name,
      external: input.external,
      egress_policy: policy,
      allowed_hosts: input.allowed_hosts ?? [],
      activation_kind: activationKind,
      action_binding_approval_present: approvalPresent,
    },
    findings,
    source_command: options.sourceCommand ?? "helix security egress-check --dry-run --json",
  };
}
