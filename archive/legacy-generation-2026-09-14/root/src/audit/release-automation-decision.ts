export type ReleaseAutomationTool = "release-please" | "semantic-release";

export interface ReleaseAutomationDecisionInput {
  adrStatus: "accepted" | "draft" | "missing";
  selectedTool?: ReleaseAutomationTool;
  conventionalCommits: boolean;
  requiresPrReviewGate: boolean;
  requiresDryRun: boolean;
  mergeQueueEnabled: boolean;
}

export interface ReleaseAutomationCandidate {
  tool: ReleaseAutomationTool;
  license: "Apache-2.0" | "MIT";
  conventionalCommits: boolean;
  releasePrGate: boolean;
  dryRunPlan: boolean;
  mergeQueueFit: "strong" | "medium";
  publishBoundary: "separate_after_approval" | "ci_publish_after_approval";
}

export interface ReleaseAutomationDecisionFinding {
  code:
    | "release_adr_not_accepted"
    | "conventional_commits_required"
    | "release_pr_gate_required"
    | "dry_run_required";
  severity: "error";
  message: string;
}

export interface ReleaseAutomationDecisionResult {
  schemaVersion: "helix-release-automation-decision.v1";
  ok: boolean;
  dryRun: true;
  applyAuthorized: false;
  selectedTool: ReleaseAutomationTool;
  decision: "adopt_release_please_plan_only" | "blocked";
  candidates: ReleaseAutomationCandidate[];
  mergeQueueEnabled: boolean;
  requiredApprovals: string[];
  commands: {
    dryRun: string;
    releasePr: string;
    publish: string;
  };
  findings: ReleaseAutomationDecisionFinding[];
}

export const RELEASE_AUTOMATION_CANDIDATES: ReleaseAutomationCandidate[] = [
  {
    tool: "release-please",
    license: "Apache-2.0",
    conventionalCommits: true,
    releasePrGate: true,
    dryRunPlan: true,
    mergeQueueFit: "strong",
    publishBoundary: "separate_after_approval",
  },
  {
    tool: "semantic-release",
    license: "MIT",
    conventionalCommits: true,
    releasePrGate: false,
    dryRunPlan: true,
    mergeQueueFit: "medium",
    publishBoundary: "ci_publish_after_approval",
  },
];

export function planReleaseAutomationDecision(
  input: ReleaseAutomationDecisionInput,
): ReleaseAutomationDecisionResult {
  const selectedTool = input.selectedTool ?? "release-please";
  const findings: ReleaseAutomationDecisionFinding[] = [];

  if (input.adrStatus !== "accepted") {
    findings.push({
      code: "release_adr_not_accepted",
      severity: "error",
      message: "ADR-008 must be accepted before release automation is treated as selected",
    });
  }
  if (!input.conventionalCommits) {
    findings.push({
      code: "conventional_commits_required",
      severity: "error",
      message: "release automation requires Conventional Commits",
    });
  }
  if (input.requiresPrReviewGate && selectedTool !== "release-please") {
    findings.push({
      code: "release_pr_gate_required",
      severity: "error",
      message: "release automation must preserve a PR review gate before version publication",
    });
  }
  if (!input.requiresDryRun) {
    findings.push({
      code: "dry_run_required",
      severity: "error",
      message: "release automation decision must remain dry-run/plan-only before approval",
    });
  }

  const ok = findings.length === 0;
  return {
    schemaVersion: "helix-release-automation-decision.v1",
    ok,
    dryRun: true,
    applyAuthorized: false,
    selectedTool,
    decision: ok ? "adopt_release_please_plan_only" : "blocked",
    candidates: RELEASE_AUTOMATION_CANDIDATES,
    mergeQueueEnabled: input.mergeQueueEnabled,
    requiredApprovals: [
      "action_binding_approval_record",
      "release_dry_run_green_command",
      "cross_review_evidence",
    ],
    commands: {
      dryRun: "release-please release-pr --dry-run",
      releasePr: "release-please release-pr",
      publish: "release-please github-release --dry-run",
    },
    findings,
  };
}
