export type CiAutoFixFailureKind =
  | "test_failure"
  | "typecheck_failure"
  | "lint_failure"
  | "security_failure"
  | "permission_failure"
  | "unknown";

export type CiAutoFixRoute = "repush" | "issue_escalation" | "wait_for_ci" | "no_action";

export interface CiAutoFixPolicy {
  minConfidence: number;
  maxAttempts: number;
  autoFixableFailureKinds: CiAutoFixFailureKind[];
}

export const DEFAULT_CI_AUTO_FIX_POLICY: CiAutoFixPolicy = {
  minConfidence: 0.75,
  maxAttempts: 2,
  autoFixableFailureKinds: ["test_failure", "typecheck_failure", "lint_failure"],
};

export interface CiAutoFixGateInput {
  ciStatus: "green" | "red" | "pending" | "unavailable";
  confidence: number;
  attempt: number;
  failureKind: CiAutoFixFailureKind;
  policy?: CiAutoFixPolicy;
  dryRun?: boolean;
}

export interface CiAutoFixGateFinding {
  code:
    | "ci_not_red"
    | "ci_unavailable"
    | "confidence_below_threshold"
    | "iteration_cap_exceeded"
    | "failure_kind_not_autofixable";
  severity: "error" | "info";
  message: string;
}

export interface CiAutoFixGateResult {
  schemaVersion: "helix-ci-auto-fix-gate.v1";
  ok: boolean;
  dryRun: boolean;
  allowRepush: boolean;
  route: CiAutoFixRoute;
  confidence: number;
  minConfidence: number;
  attempt: number;
  maxAttempts: number;
  failureKind: CiAutoFixFailureKind;
  findings: CiAutoFixGateFinding[];
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function gateCiAutoFixRepush(input: CiAutoFixGateInput): CiAutoFixGateResult {
  const policy = input.policy ?? DEFAULT_CI_AUTO_FIX_POLICY;
  const confidence = clampConfidence(input.confidence);
  const findings: CiAutoFixGateFinding[] = [];

  if (input.ciStatus === "green") {
    findings.push({
      code: "ci_not_red",
      severity: "info",
      message: "CI is green; auto-fix repush is not needed",
    });
  } else if (input.ciStatus === "pending") {
    findings.push({
      code: "ci_not_red",
      severity: "info",
      message: "CI is pending; wait before evaluating auto-fix repush",
    });
  } else if (input.ciStatus === "unavailable") {
    findings.push({
      code: "ci_unavailable",
      severity: "error",
      message: "CI status is unavailable; do not repush without observable failure evidence",
    });
  }

  if (confidence < policy.minConfidence) {
    findings.push({
      code: "confidence_below_threshold",
      severity: "error",
      message: `auto-fix confidence ${confidence} is below policy threshold ${policy.minConfidence}`,
    });
  }
  if (input.attempt >= policy.maxAttempts) {
    findings.push({
      code: "iteration_cap_exceeded",
      severity: "error",
      message: `auto-fix attempt ${input.attempt} reached policy cap ${policy.maxAttempts}`,
    });
  }
  if (!policy.autoFixableFailureKinds.includes(input.failureKind)) {
    findings.push({
      code: "failure_kind_not_autofixable",
      severity: "error",
      message: `${input.failureKind} is not in the auto-fixable failure policy`,
    });
  }

  const allowRepush =
    input.ciStatus === "red" && !findings.some((finding) => finding.severity === "error");
  const route: CiAutoFixRoute = allowRepush
    ? "repush"
    : input.ciStatus === "green"
      ? "no_action"
      : input.ciStatus === "pending"
        ? "wait_for_ci"
        : "issue_escalation";

  return {
    schemaVersion: "helix-ci-auto-fix-gate.v1",
    ok: allowRepush,
    dryRun: input.dryRun ?? true,
    allowRepush,
    route,
    confidence,
    minConfidence: policy.minConfidence,
    attempt: input.attempt,
    maxAttempts: policy.maxAttempts,
    failureKind: input.failureKind,
    findings,
  };
}
