import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { recordTemplateContractViolations } from "./completion-decision-packet";
import { buildIdentifierRenameCutoverPlan } from "./identifier-rename";
import {
  type CompletionDecisionRecordTemplate,
  computeOutstandingWork,
  recordTemplatesForRecords,
  requiredRecordsForBlockers,
  type SemanticFeatureFrontierRecord,
} from "./outstanding";
import {
  type SemanticFrontierBindingExpectation,
  semanticFrontierBindingForPlan,
  semanticFrontierBindingViolations,
} from "./semantic-frontier-binding";
import {
  allowedOutcomeSetViolation,
  fmValue,
  isClosedPlanStatus,
  missingRecordFields,
  recordFieldValue,
} from "./shared";
import { verificationSourceMetadataViolations } from "./source-ledger-freshness";
import { buildVersionUpActivationPackets } from "./version-up-readiness";
import {
  ACTION_BINDING_APPROVAL_PACKET_COMMAND,
  buildDecisionPacketProvenance,
  type DecisionPacketFreshness,
  RENAME_PLAN_PACKET_COMMAND,
  type RelatedDecisionPacket,
  relatedDecisionPacket,
  S4_DECISION_PACKET_COMMAND,
  uniqueRelatedDecisionPackets,
  VERSION_UP_ACTIVATION_PACKET_COMMAND,
} from "./workflow-decision-packets";

export interface ActionBindingApprovalPlan {
  file: string;
  plan_id: string;
  kind?: string;
  status: string;
  workflowPhase?: string | null;
  decisionOutcome?: string | null;
  versionTarget?: string | null;
  text: string;
}

export interface ActionBindingApprovalReadinessInput {
  rightArmMd: string;
  outstandingTs: string;
  versionUpModeDoc?: string;
  repoHeadSha?: string | null;
  currentVersion?: string;
  currentCutoverSnapshotId?: string;
  semanticFeatureFrontierRecords?: SemanticFeatureFrontierRecord[];
  plans: ActionBindingApprovalPlan[];
}

export interface ActionBindingApprovalViolation {
  subject: string;
  reason: string;
}

export interface ActionBindingApprovalCommandViolation {
  subject: string;
  reason: string;
}

export interface ActionBindingApprovalReadinessResult {
  pendingPlanIds: string[];
  violations: ActionBindingApprovalViolation[];
  ok: boolean;
}

export type ActionBindingApprovalCheckStatus = "concrete" | "pending" | "invalid";

export interface ActionBindingApprovalCheck {
  field: (typeof ACTION_BINDING_RECORD_FIELDS)[number];
  status: ActionBindingApprovalCheckStatus;
  value: string;
  reason: string;
  requiredAction: string;
}

export interface ActionBindingApprovalPacket {
  schemaVersion: "action-binding-approval-packet.v1";
  planId: string;
  generatedAt: string;
  sourceCommand: typeof ACTION_BINDING_APPROVAL_PACKET_COMMAND;
  freshness: DecisionPacketFreshness;
  status: "pending_action_binding_approval" | "invalid_not_pending_approval";
  planOnly: true;
  mustNotApprove: true;
  approvalCommandAvailable: false;
  approvalAllowed: false;
  allowedOutcomes: string[];
  approvalRecord: Record<string, string>;
  recordTemplates: CompletionDecisionRecordTemplate[];
  approvalBindingChecks: ActionBindingApprovalCheck[];
  approvalVerificationCommandMatrix: Array<{
    phase: string;
    command: string;
    writePolicy: "no-write";
    expected: string;
    evidence: string;
    source: string;
    sourceUrl: string;
    sourceCheckedAt: string;
    latestOfficialStatus: string;
    sourceStatusDelta: string;
    adoptionDecision: string;
    adoptionDecisionDelta: string;
    workflowRouteImpact: string;
  }>;
  semanticFeatureFrontierRecords: SemanticFeatureFrontierRecord[];
  relatedDecisionPackets: RelatedDecisionPacket[];
  blockedReasons: string[];
  nextWorkflowRoutes: Array<{ outcome: string; route: string }>;
}

interface ActionBindingSnapshotExpectations {
  versionUpSnapshotId: string | null;
  versionUpSnapshotValidationMissing: boolean;
  cutoverSnapshotId: string | null;
}

interface ActionBindingApprovalCheckContext {
  plan: ActionBindingApprovalPlan;
  approvalRecord: Record<string, string>;
  snapshotExpectations: ActionBindingSnapshotExpectations;
}

const ACTION_BINDING_RECORD_NAME = "action_binding_approval_record";
const ACTION_BINDING_RECORD_FIELDS = [
  "allowed_outcome",
  "approval_policy_or_named_approver",
  "approval_scope",
  "approved_actor",
  "approved_tool",
  "approved_target",
  "approved_params",
  "review_approval_evidence",
  "reviewed_snapshot_binding",
  "expires_at_or_trigger",
  "audit_record",
] as const;
const ACTION_BINDING_ALLOWED_OUTCOMES = [
  "approve_action_binding",
  "deny_action",
  "request_scope_reduction",
] as const;
const VERSION_UP_SNAPSHOT_VALIDATION_MISSING_REASON =
  "activation snapshot cannot be validated without repoHeadSha";

const RIGHT_ARM_MARKERS = [
  "Action-binding approval decision record",
  ACTION_BINDING_RECORD_NAME,
  "allowed_outcome",
  "approval_policy_or_named_approver",
  "approval_scope",
  "approved_actor",
  "approved_tool",
  "approved_target",
  "approved_params",
  "review_approval_evidence",
  "reviewed_snapshot_binding",
  "expires_at_or_trigger",
  "audit_record",
  "action-binding-approval-packet.v1",
  "planOnly=true",
  "mustNotApprove=true",
  "approvalCommandAvailable=false",
  "approvalAllowed=false",
  "approvalBindingChecks",
  "approvalVerificationCommandMatrix",
  "GitHub Environments required reviewers",
  "OWASP LLM06:2025 Excessive Agency",
] as const;

const OUTSTANDING_MARKERS = [
  "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, reviewed_snapshot_binding, expires_at_or_trigger, and audit_record",
  "approval scope binds approved_actor/approved_tool/approved_target/approved_params before activation",
  "review/approval evidence, reviewed snapshot binding, and expiry or trigger condition recorded before activation",
] as const;

const ACTION_BINDING_BOUNDARY =
  /action-binding|human\/action-binding approval|requires_human_approval=true|human signoff|人間サインオフ|人間承認/i;
const ACTION_BINDING_EXECUTION_OBLIGATION =
  /requires?\s+action-binding approval\s+before|action-binding approval\s+(?:is\s+)?required\s+before|action-binding approval\s+なしに.*(?:apply|実行|実適用)|実適用には\s+action-binding approval\s+が必要|高影響\s+action\s+の実行前に\s+human\/action-binding approval\s+を記録する/i;
const HIGH_IMPACT_ACTION_TARGET =
  /high-impact action|high-impact execution|高影響\s+action|external|infra|secret|auth|destructive|state dir|migration|cutover|activation|deploy|deployment|cloudflare|hmac|webhook|access control|production|api|apply|execution|本番|外部|認証|認可|破壊|不可逆|設定変更|実行|実適用/i;

function parsePlan(file: string, content: string): ActionBindingApprovalPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    kind: fmValue(content, "kind") ?? undefined,
    status: fmValue(content, "status") ?? "unknown",
    workflowPhase: fmValue(content, "workflow_phase") ?? null,
    decisionOutcome: fmValue(content, "decision_outcome") ?? null,
    versionTarget: fmValue(content, "version_target") ?? null,
    text: content,
  };
}

export function loadActionBindingApprovalReadinessInput(
  repoRoot = process.cwd(),
): ActionBindingApprovalReadinessInput {
  const plansDir = join(repoRoot, "docs", "plans");
  const outstanding = computeOutstandingWork(repoRoot);
  return {
    rightArmMd: readFileSync(
      join(repoRoot, "docs", "process", "forward", "L08-L14-verification-phase.md"),
      "utf8",
    ),
    outstandingTs: readFileSync(join(repoRoot, "src", "lint", "outstanding.ts"), "utf8"),
    versionUpModeDoc: readFileSync(
      join(repoRoot, "docs", "process", "modes", "version-up.md"),
      "utf8",
    ),
    repoHeadSha: readRepoHeadSha(repoRoot),
    currentVersion: readPackageVersion(repoRoot) ?? undefined,
    currentCutoverSnapshotId: buildIdentifierRenameCutoverPlan(repoRoot).cutoverSnapshot.snapshotId,
    semanticFeatureFrontierRecords: outstanding.semanticFeatureFrontierRecords ?? [],
    plans: readdirSync(plansDir)
      .filter((f) => f.startsWith("PLAN-") && f.endsWith(".md"))
      .map((f) => parsePlan(f, readFileSync(join(plansDir, f), "utf8"))),
  };
}

function isPendingHighImpactApproval(plan: ActionBindingApprovalPlan): boolean {
  if (isClosedPlanStatus(plan.status)) return false;
  return carriesHighImpactApprovalBoundary(plan);
}

function requiresActionBindingRecordValidation(plan: ActionBindingApprovalPlan): boolean {
  if (plan.status.trim().toLowerCase() === "archived") return false;
  return carriesHighImpactApprovalBoundary(plan);
}

function carriesHighImpactApprovalBoundary(plan: ActionBindingApprovalPlan): boolean {
  if (new RegExp(`^\\s*${ACTION_BINDING_RECORD_NAME}:\\s*$`, "m").test(plan.text)) return true;
  const haystack = [plan.plan_id, plan.file, plan.status, plan.text].join("\n");
  return (
    ACTION_BINDING_BOUNDARY.test(haystack) &&
    ACTION_BINDING_EXECUTION_OBLIGATION.test(haystack) &&
    HIGH_IMPACT_ACTION_TARGET.test(haystack)
  );
}

export function analyzeActionBindingApprovalReadiness(
  input: ActionBindingApprovalReadinessInput,
): ActionBindingApprovalReadinessResult {
  const violations: ActionBindingApprovalViolation[] = [];

  for (const marker of RIGHT_ARM_MARKERS) {
    if (!input.rightArmMd.includes(marker)) {
      violations.push({
        subject: "docs/process/forward/L08-L14-verification-phase.md",
        reason: `missing ${marker}`,
      });
    }
  }
  for (const marker of OUTSTANDING_MARKERS) {
    if (!input.outstandingTs.includes(marker)) {
      violations.push({ subject: "src/lint/outstanding.ts", reason: `missing ${marker}` });
    }
  }

  const pending = input.plans.filter(isPendingHighImpactApproval);
  const recordValidationTargets = input.plans.filter(requiresActionBindingRecordValidation);
  for (const plan of recordValidationTargets) {
    const missingFields = missingRecordFields(
      plan.text,
      ACTION_BINDING_RECORD_NAME,
      ACTION_BINDING_RECORD_FIELDS,
    );
    for (const field of missingFields) {
      violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
    }
    const outcomeViolation = allowedOutcomeSetViolation(
      plan.text,
      ACTION_BINDING_RECORD_NAME,
      ACTION_BINDING_ALLOWED_OUTCOMES,
    );
    if (outcomeViolation) {
      violations.push({ subject: plan.plan_id, reason: outcomeViolation });
    }
    if (missingFields.length === 0 && !outcomeViolation) {
      violations.push(...validateActionBindingSemantics(plan, input));
    }
    if (input.semanticFeatureFrontierRecords !== undefined) {
      for (const expectation of semanticFrontierExpectationsForActionBindingPlan(plan)) {
        violations.push(
          ...semanticFrontierBindingViolations(
            input.semanticFeatureFrontierRecords,
            expectation,
            plan.plan_id,
          ),
        );
      }
    }
    const packet = buildActionBindingApprovalPacket(plan, {
      versionUpModeDoc: input.versionUpModeDoc,
      currentCutoverSnapshotId: input.currentCutoverSnapshotId,
      semanticFeatureFrontierRecords: input.semanticFeatureFrontierRecords,
    });
    violations.push(
      ...recordTemplateContractViolations({
        subject: `${plan.plan_id}.actionBindingApprovalPacket`,
        requiredRecords: requiredRecordsForBlockers(["human_approval_pending"]),
        recordTemplates: packet.recordTemplates,
      }).map((violation) => ({
        subject: violation.subject,
        reason: violation.reason,
      })),
    );
    violations.push(
      ...actionBindingApprovalVerificationCommandViolations(packet).map((violation) => ({
        subject: violation.subject,
        reason: violation.reason,
      })),
    );
  }

  return {
    pendingPlanIds: pending.map((p) => p.plan_id).sort(),
    violations,
    ok: violations.length === 0,
  };
}

export function buildActionBindingApprovalPackets(
  input: ActionBindingApprovalReadinessInput,
): ActionBindingApprovalPacket[] {
  return input.plans
    .filter(isPendingHighImpactApproval)
    .map((plan) => buildActionBindingApprovalPacket(plan, input))
    .sort((a, b) => a.planId.localeCompare(b.planId));
}

export function buildActionBindingApprovalPacket(
  plan: ActionBindingApprovalPlan,
  input: Pick<
    ActionBindingApprovalReadinessInput,
    | "versionUpModeDoc"
    | "repoHeadSha"
    | "currentVersion"
    | "currentCutoverSnapshotId"
    | "semanticFeatureFrontierRecords"
  > = {},
): ActionBindingApprovalPacket {
  const approvalRecord = recordValues(plan.text, ACTION_BINDING_RECORD_NAME, [
    ...ACTION_BINDING_RECORD_FIELDS,
  ]);
  const snapshotExpectations = actionBindingSnapshotExpectations(plan, input);
  const approvalBindingChecks = buildActionBindingApprovalChecks(
    plan,
    approvalRecord,
    snapshotExpectations,
  );
  const provenance = buildDecisionPacketProvenance({
    sourceCommand: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
  });
  const semanticFrontierViolations =
    input.semanticFeatureFrontierRecords === undefined
      ? []
      : semanticFrontierExpectationsForActionBindingPlan(plan).flatMap((expectation) =>
          semanticFrontierBindingViolations(
            input.semanticFeatureFrontierRecords,
            expectation,
            plan.plan_id,
          ),
        );
  return {
    schemaVersion: "action-binding-approval-packet.v1",
    planId: plan.plan_id,
    generatedAt: provenance.generatedAt,
    sourceCommand: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
    freshness: provenance.freshness,
    status: isPendingHighImpactApproval(plan)
      ? "pending_action_binding_approval"
      : "invalid_not_pending_approval",
    planOnly: true,
    mustNotApprove: true,
    approvalCommandAvailable: false,
    approvalAllowed: false,
    allowedOutcomes: [...ACTION_BINDING_ALLOWED_OUTCOMES],
    approvalRecord,
    recordTemplates: recordTemplatesForRecords(
      requiredRecordsForBlockers(["human_approval_pending"]),
    ),
    approvalBindingChecks,
    approvalVerificationCommandMatrix: buildActionBindingApprovalVerificationCommandMatrix(plan),
    semanticFeatureFrontierRecords: semanticFrontierBindingsForActionBindingPlan(
      plan,
      input.semanticFeatureFrontierRecords,
    ),
    relatedDecisionPackets: relatedDecisionPacketsForActionBindingPlan(plan),
    blockedReasons: [
      ...actionBindingBlockedReasons(plan, approvalRecord, snapshotExpectations),
      ...semanticFrontierViolations.map((violation) => violation.reason),
    ],
    nextWorkflowRoutes: [
      {
        outcome: "approve_action_binding",
        route:
          "record named approver plus exact approved_actor/approved_tool/approved_target/approved_params, expiry, and audit evidence before any high-impact execution",
      },
      {
        outcome: "deny_action",
        route:
          "record denial rationale and route the PLAN to archive, redesign, or parked future work without executing the high-impact action",
      },
      {
        outcome: "request_scope_reduction",
        route:
          "narrow actor/tool/target/params or split the PLAN, then request a new action-binding approval packet",
      },
    ],
  };
}

function buildActionBindingApprovalVerificationCommandMatrix(
  plan: ActionBindingApprovalPlan,
): ActionBindingApprovalPacket["approvalVerificationCommandMatrix"] {
  return [
    {
      phase: "approval-packet-baseline",
      command: `bun run src/cli.ts action-binding approval-packet --plan ${plan.plan_id} --json`,
      expected:
        "captures current approval record, binding checks, sibling decision packets, blockers, and semantic frontier records",
      evidence: "action-binding approval packet JSON attached to the approval review",
      source: "HELIX action-binding approval contract",
      sourceUrl: "docs/design/helix/L6-function-design/pillar-function-design.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local action-binding approval contract current at HEAD",
      sourceStatusDelta: "none; approval packet remains plan-only and non-applying",
      adoptionDecision: "adopt-current-action-binding-packet-for-approval-review",
      adoptionDecisionDelta: "none; keep approvalAllowed=false without concrete record",
      workflowRouteImpact: "none; packet drift routes back to approval evidence repair",
    },
    {
      phase: "sibling-decision-packets",
      command: siblingDecisionPacketCommandsForActionBindingPlan(plan).join(" && "),
      expected:
        "S4, version-up, and rename sibling packet routes are reviewed together before any high-impact action",
      evidence: "related decision packet JSON outputs for every sibling blocker on the PLAN",
      source: "HELIX completion decision packet contract",
      sourceUrl:
        "docs/test-design/harness/L7-unit-test-design.md#decision-record-and-completion-frontier",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local completion decision packet contract current at HEAD",
      sourceStatusDelta:
        "none; sibling S4/version-up/rename packets remain required review context",
      adoptionDecision: "adopt-sibling-packet-review-before-action-binding-approval",
      adoptionDecisionDelta: "none; do not approve action binding from a single isolated packet",
      workflowRouteImpact: "none; missing sibling packet keeps approval review pending",
    },
    {
      phase: "least-privilege-binding",
      command: `bun run src/cli.ts action-binding approval-packet --plan ${plan.plan_id} --json`,
      expected:
        "approval scope is limited to the named actor/tool/target/params and does not grant broad or wildcard authority",
      evidence:
        "approvalBindingChecks[] entries with concrete status or explicit pending/invalid blocker reasons",
      source: "NIST least privilege security principle",
      sourceUrl: "https://csrc.nist.gov/glossary/term/least_privilege",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "NIST least privilege glossary entry remains the adopted authority boundary source",
      sourceStatusDelta:
        "none; least-privilege scope remains required for actor/tool/target/params",
      adoptionDecision: "adopt-least-privilege-binding-for-approval-scope",
      adoptionDecisionDelta: "none; wildcard or broad scope remains invalid/pending",
      workflowRouteImpact: "none; weak binding routes to request_scope_reduction",
    },
    {
      phase: "snapshot-binding",
      command: `bun run src/cli.ts action-binding approval-packet --plan ${plan.plan_id} --json`,
      expected:
        "snapshot-bound approvals cite the current sha256 snapshot id and stale snapshot ids remain blocked",
      evidence:
        "activation packet, rename plan, or no-snapshot basis referenced by action_binding_approval_record.reviewed_snapshot_binding",
      source: "GitHub deployment protection rules required reviewers",
      sourceUrl:
        "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "GitHub Environments required reviewers and prevent self-review remain current deployment protection controls",
      sourceStatusDelta:
        "none; reviewed snapshot binding remains required before protected execution",
      adoptionDecision: "adopt-required-reviewer-and-current-snapshot-binding",
      adoptionDecisionDelta: "none; stale snapshot ids remain blocked",
      workflowRouteImpact: "none; stale or missing snapshot binding denies action approval",
    },
    {
      phase: "github-environment-approval-boundary",
      command:
        plan.versionTarget !== null
          ? `bun run src/cli.ts version-up security-checklist --plan ${plan.plan_id} --no-write --json`
          : `bun run src/cli.ts action-binding approval-packet --plan ${plan.plan_id} --json`,
      expected:
        "GitHub Environments required reviewers are only treated as an approval boundary after repository visibility, account or organization plan availability, prevent self-review, and environment secrets availability are recorded",
      evidence:
        "security checklist or approval review evidence records repo visibility, plan availability, required reviewers, prevent self-review, and environment secrets before relying on GitHub Environments",
      source: "GitHub Environments deployment protection rules",
      sourceUrl:
        "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "GitHub deployment protection rules can require manual approval, but required reviewers availability depends on repository visibility and plan",
      sourceStatusDelta:
        "none; environment required reviewers remain usable only after availability and self-review constraints are recorded",
      adoptionDecision: "adopt-github-environments-only-as-evidence-bound-approval-boundary",
      adoptionDecisionDelta:
        "none; environment name or workflow presence alone is not approval evidence",
      workflowRouteImpact:
        "none; missing environment availability evidence keeps action-binding approval pending",
    },
    {
      phase: "security-boundary",
      command: "bun run src/cli.ts doctor",
      expected:
        "action-binding readiness, source ledger freshness, and security/workflow gates remain green without creating apply authority",
      evidence:
        "doctor output with action-binding-approval-readiness and related source ledger gates",
      source: "VS Code Workspace Trust execution boundary",
      sourceUrl: "https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "VS Code Workspace Trust still gates code execution for untrusted folders",
      sourceStatusDelta: "none; explicit trust boundary remains approval evidence input",
      adoptionDecision: "adopt-workspace-trust-as-local-execution-boundary",
      adoptionDecisionDelta: "none; untrusted workspace keeps execution restricted",
      workflowRouteImpact: "none; trust-boundary failure blocks approval review",
    },
    {
      phase: "targeted-regression",
      command: "bun test tests/action-binding-approval-readiness.test.ts tests/cli-surface.test.ts",
      expected: "action-binding packet and CLI surface regressions stay green",
      evidence: "targeted vitest output",
      source: "HELIX action-binding regression oracle",
      sourceUrl:
        "docs/test-design/harness/L7-unit-test-design.md#decision-record-and-completion-frontier",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local action-binding regression oracle current at HEAD",
      sourceStatusDelta: "none; action-binding packet oracle reviewed against current HEAD",
      adoptionDecision: "adopt-targeted-regression-before-action-binding-review",
      adoptionDecisionDelta: "none; keep targeted regression before approval evidence use",
      workflowRouteImpact: "none; regression failure routes back to L7 repair",
    },
    {
      phase: "static-gates",
      command: "bun run lint && bun run typecheck && git diff --check",
      expected: "format, type, and whitespace gates pass before approval review",
      evidence: "lint/typecheck/diff-check command output",
      source: "HELIX repository static gate policy",
      sourceUrl: "AGENTS.md#test-rules",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "repository AGENTS test rules current at HEAD",
      sourceStatusDelta: "none; static gate policy reviewed against current HEAD",
      adoptionDecision: "adopt-static-gates-before-action-binding-review",
      adoptionDecisionDelta: "none; keep static gates before approval material use",
      workflowRouteImpact: "none; static failure routes back to implementation repair",
    },
    {
      phase: "full-regression",
      command: "bun run test",
      expected: "full repository regression suite passes before any approved high-impact action",
      evidence: "full vitest output",
      source: "HELIX full regression policy",
      sourceUrl: "docs/test-design/harness/L7-unit-test-design.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local HELIX full regression policy current at HEAD",
      sourceStatusDelta: "none; full regression policy reviewed against current HEAD",
      adoptionDecision: "adopt-full-regression-before-high-impact-action-approval",
      adoptionDecisionDelta: "none; keep full regression as high-impact approval blocker",
      workflowRouteImpact: "none; full regression failure blocks approval review",
    },
    {
      phase: "completion-frontier",
      command: "bun run src/cli.ts status --json",
      expected:
        "completionReadiness remains blocked until action-binding approval and any sibling PO/version/cutover decisions are recorded",
      evidence: "status JSON workflowNextActions and semanticFeatureFrontierRecords",
      source: "HELIX completion frontier contract",
      sourceUrl: "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local semantic frontier contract current at HEAD",
      sourceStatusDelta: "none; human/action-binding blockers remain completion blockers",
      adoptionDecision: "adopt-semantic-frontier-blocker-before-action-binding-approval",
      adoptionDecisionDelta: "none; do not count approval-gated work as complete",
      workflowRouteImpact: "none; unresolved approval frontier keeps completionReadiness blocked",
    },
  ].map((row) => ({ writePolicy: "no-write" as const, ...row }));
}

function semanticFrontierExpectationsForActionBindingPlan(
  plan: ActionBindingApprovalPlan,
): SemanticFrontierBindingExpectation[] {
  const expectations: SemanticFrontierBindingExpectation[] = [];
  if (
    plan.kind === "poc" &&
    plan.status === "draft" &&
    plan.workflowPhase === "S3" &&
    !plan.decisionOutcome
  ) {
    expectations.push({
      planId: plan.plan_id,
      classification: "frontier_pending_decision",
    });
  }
  if (requiresVersionUpSnapshot(plan)) {
    expectations.push({
      planId: plan.plan_id,
      classification: "parked_future_version",
    });
  }
  if (requiresCutoverSnapshot(plan)) {
    expectations.push({
      planId: plan.plan_id,
      classification: "approval_gated_cutover",
      featureId: "name_cutover",
    });
  }
  return expectations;
}

function semanticFrontierBindingsForActionBindingPlan(
  plan: ActionBindingApprovalPlan,
  records: SemanticFeatureFrontierRecord[] | undefined,
): SemanticFeatureFrontierRecord[] {
  return semanticFrontierExpectationsForActionBindingPlan(plan).map((expectation) =>
    semanticFrontierBindingForPlan(records, expectation),
  );
}

function relatedDecisionPacketsForActionBindingPlan(
  plan: ActionBindingApprovalPlan,
): RelatedDecisionPacket[] {
  return uniqueRelatedDecisionPackets([
    relatedDecisionPacket({
      command: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
      role: "primary",
      reason: "PLAN carries a human/action-binding approval boundary",
      route: "record action_binding_approval_record before executing any high-impact action",
    }),
    ...(plan.kind === "poc" &&
    plan.status === "draft" &&
    plan.workflowPhase === "S3" &&
    !plan.decisionOutcome
      ? [
          relatedDecisionPacket({
            command: S4_DECISION_PACKET_COMMAND,
            role: "supporting",
            reason:
              "same S3 PoC also requires a PO/S4 decision before promotion, rejection, or pivot",
            route: "record s4_decision_record and decision_outcome before terminal S4 routing",
          }),
        ]
      : []),
    ...(plan.versionTarget !== null && plan.versionTarget !== undefined
      ? [
          relatedDecisionPacket({
            command: VERSION_UP_ACTIVATION_PACKET_COMMAND,
            role: "supporting",
            reason: "same PLAN is parked for a future version-up activation decision",
            route:
              "record activation_decision_record and parked_review_record before activation or continued parking",
          }),
        ]
      : []),
    ...(plan.text.includes("cutover_decision_record") ||
    plan.text.includes("identifier rename") ||
    plan.plan_id === "PLAN-M-02-helix-identifier-rename"
      ? [
          relatedDecisionPacket({
            command: RENAME_PLAN_PACKET_COMMAND,
            role: "supporting",
            reason: "same PLAN also carries an irreversible rename/cutover signoff boundary",
            route:
              "use rename plan for cutover dry-run, rollback, backup, monitoring, and approval gate material",
          }),
        ]
      : []),
  ]);
}

function siblingDecisionPacketCommandsForActionBindingPlan(
  plan: ActionBindingApprovalPlan,
): string[] {
  const commands = relatedDecisionPacketsForActionBindingPlan(plan)
    .filter((packet) => packet.command !== ACTION_BINDING_APPROVAL_PACKET_COMMAND)
    .map((packet) => scopedSiblingDecisionPacketCommand(plan.plan_id, packet.command));
  return commands.length > 0 ? commands : ["bun run src/cli.ts status --json"];
}

function scopedSiblingDecisionPacketCommand(planId: string, command: string): string {
  switch (command) {
    case S4_DECISION_PACKET_COMMAND:
      return `bun run src/cli.ts s4 decision-packet --plan ${planId} --json`;
    case VERSION_UP_ACTIVATION_PACKET_COMMAND:
      return `bun run src/cli.ts version-up activation-packet --plan ${planId} --json`;
    case RENAME_PLAN_PACKET_COMMAND:
      return "bun run src/cli.ts rename plan --json";
    default:
      return command.replace(/^ut-tdd /, "bun run src/cli.ts ");
  }
}

export function actionBindingApprovalVerificationCommandViolations(
  packet: Pick<ActionBindingApprovalPacket, "planId" | "approvalVerificationCommandMatrix">,
): ActionBindingApprovalCommandViolation[] {
  const approvalPacketCommand = `bun run src/cli.ts action-binding approval-packet --plan ${packet.planId} --json`;
  const allowedCommands = new Set([
    approvalPacketCommand,
    `bun run src/cli.ts s4 decision-packet --plan ${packet.planId} --json`,
    `bun run src/cli.ts version-up activation-packet --plan ${packet.planId} --json`,
    `bun run src/cli.ts version-up security-checklist --plan ${packet.planId} --no-write --json`,
    "bun run src/cli.ts rename plan --json",
    "bun run src/cli.ts status --json",
    "bun run src/cli.ts doctor",
    "bun test tests/action-binding-approval-readiness.test.ts tests/cli-surface.test.ts",
    "bun run lint && bun run typecheck && git diff --check",
    "bun run test",
  ]);
  return packet.approvalVerificationCommandMatrix.flatMap((row) => {
    const violations: ActionBindingApprovalCommandViolation[] = [];
    const command = row.command.trim();
    if (!allowedCommands.has(command)) {
      const parts = command.split(/\s+&&\s+/).map((part) => part.trim());
      const invalidParts = parts.filter((part) => !allowedCommands.has(part));
      if (invalidParts.length > 0) {
        violations.push({
          subject: `${packet.planId}.${row.phase}`,
          reason: `approvalVerificationCommandMatrix command is not an executable approved surface: ${invalidParts.join(" && ")}`,
        });
      }
    }
    violations.push(...actionBindingApprovalVerificationSourceViolations(packet.planId, row));
    return violations;
  });
}

function actionBindingApprovalVerificationSourceViolations(
  planId: string,
  row: ActionBindingApprovalPacket["approvalVerificationCommandMatrix"][number],
): ActionBindingApprovalCommandViolation[] {
  return verificationSourceMetadataViolations({
    subject: `${planId}.${row.phase}`,
    matrixName: "approvalVerificationCommandMatrix",
    row,
  });
}

function validateActionBindingSemantics(
  plan: ActionBindingApprovalPlan,
  input: Pick<ActionBindingApprovalReadinessInput, "versionUpModeDoc" | "currentCutoverSnapshotId">,
): ActionBindingApprovalViolation[] {
  const violations: ActionBindingApprovalViolation[] = [];
  const approvalScope = record(plan, "approval_scope");
  const approvedActor = record(plan, "approved_actor");
  const approvedTool = record(plan, "approved_tool");
  const approvedTarget = record(plan, "approved_target");
  const approvedParams = record(plan, "approved_params");
  const reviewEvidence = record(plan, "review_approval_evidence");
  const reviewedSnapshotBinding = record(plan, "reviewed_snapshot_binding");
  const expiry = record(plan, "expires_at_or_trigger");
  const auditRecord = record(plan, "audit_record");
  const approveSelected =
    selectedOutcome(record(plan, "allowed_outcome")) === "approve_action_binding";

  if (!hasLimitedApprovalScope(approvalScope)) {
    violations.push({
      subject: plan.plan_id,
      reason: "approval_scope must limit the approved action scope",
    });
  }
  for (const [field, value] of [
    ["approved_actor", approvedActor],
    ["approved_tool", approvedTool],
    ["approved_target", approvedTarget],
    ["approved_params", approvedParams],
  ] as const) {
    if (isBroadApproval(value)) {
      violations.push({
        subject: plan.plan_id,
        reason: `${field} must not grant broad or wildcard approval`,
      });
    }
    if (
      mentions(value, [
        "no ",
        "no actor",
        "no tool",
        "no external",
        "no irreversible",
        "no params",
        "未承認",
      ])
    ) {
      if (!mentions(value, ["must name", "must record", "must write", "before", "承認"])) {
        violations.push({
          subject: plan.plan_id,
          reason: `${field} pending approval must state the future named binding condition`,
        });
      }
    }
  }
  if (
    (approveSelected &&
      (!hasConcreteApprovalEvidenceLocator(reviewEvidence) ||
        isPendingReviewEvidence(reviewEvidence))) ||
    (!approveSelected &&
      !isPendingReviewEvidence(reviewEvidence) &&
      !hasConcreteApprovalEvidenceLocator(reviewEvidence))
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "review_approval_evidence must name concrete review evidence before approval",
    });
  }
  if (!hasExpiryOrTrigger(expiry)) {
    violations.push({
      subject: plan.plan_id,
      reason: "expires_at_or_trigger must define expiry or trigger-bound re-approval",
    });
  }
  if (!hasReviewedSnapshotBinding(plan, reviewedSnapshotBinding)) {
    violations.push({
      subject: plan.plan_id,
      reason:
        "reviewed_snapshot_binding must cite activationSnapshot.snapshotId, cutoverSnapshot.snapshotId, or an explicit no-snapshot basis",
    });
  }
  const expectedVersionUpSnapshot = expectedVersionUpActivationSnapshotId(plan, input);
  const expectedCutoverSnapshot = expectedCutoverSnapshotId(plan, input);
  if (versionUpSnapshotValidationMissing(plan, input)) {
    violations.push({
      subject: plan.plan_id,
      reason: VERSION_UP_SNAPSHOT_VALIDATION_MISSING_REASON,
    });
  }
  if (
    expectedVersionUpSnapshot &&
    hasConcreteSnapshotId(reviewedSnapshotBinding) &&
    concreteSnapshotId(reviewedSnapshotBinding) !== expectedVersionUpSnapshot
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "reviewed_snapshot_binding does not match current activationSnapshot.snapshotId",
    });
  }
  if (
    expectedCutoverSnapshot &&
    hasConcreteSnapshotId(reviewedSnapshotBinding) &&
    concreteSnapshotId(reviewedSnapshotBinding) !== expectedCutoverSnapshot
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "reviewed_snapshot_binding does not match current cutoverSnapshot.snapshotId",
    });
  }
  if (
    (approveSelected &&
      (isPendingApprovalBinding(auditRecord) ||
        !hasConcreteApprovalEvidenceLocator(auditRecord))) ||
    (!approveSelected &&
      !isPendingApprovalBinding(auditRecord) &&
      !hasConcreteApprovalEvidenceLocator(auditRecord)) ||
    !mentions(auditRecord, ["approver"]) ||
    !mentions(auditRecord, ["action", "command", "commands"]) ||
    !mentions(auditRecord, ["result", "結果"]) ||
    !mentions(auditRecord, ["incident", "backlog", "rollback", "monitoring"])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason:
        "audit_record must capture approver, action/command, result, and incident/backlog/rollback route",
    });
  }

  return violations;
}

function hasReviewedSnapshotBinding(plan: ActionBindingApprovalPlan, value: string): boolean {
  const normalized = value.toLowerCase();
  if (!normalized.trim()) return false;
  if (requiresVersionUpSnapshot(plan)) {
    return mentions(value, ["activationSnapshot"]) && mentions(value, ["snapshotId"]);
  }
  if (requiresCutoverSnapshot(plan)) {
    return mentions(value, ["cutoverSnapshot"]) && mentions(value, ["snapshotId"]);
  }
  return mentions(value, ["no snapshot", "not applicable", "n/a", "該当なし"]);
}

function requiresSnapshotBinding(plan: ActionBindingApprovalPlan): boolean {
  return requiresVersionUpSnapshot(plan) || requiresCutoverSnapshot(plan);
}

function requiresVersionUpSnapshot(plan: ActionBindingApprovalPlan): boolean {
  return (
    (plan.versionTarget ?? "").trim().length > 0 ||
    plan.plan_id === "PLAN-L7-146-serverless-readonly-share" ||
    mentions([plan.plan_id, plan.file].join("\n"), ["version-up", "serverless-readonly-share"])
  );
}

function requiresCutoverSnapshot(plan: ActionBindingApprovalPlan): boolean {
  return (
    mentions(plan.text, ["cutover_decision_record", "identifier rename"]) ||
    plan.plan_id === "PLAN-M-02-helix-identifier-rename" ||
    plan.plan_id === "PLAN-M-02"
  );
}

function hasConcreteSnapshotId(value: string): boolean {
  return /\bsha256:[a-f0-9]{64}\b/.test(value);
}

function concreteSnapshotId(value: string): string | null {
  return value.match(/\bsha256:[a-f0-9]{64}\b/)?.[0] ?? null;
}

function expectedVersionUpActivationSnapshotId(
  plan: ActionBindingApprovalPlan,
  input: Pick<
    ActionBindingApprovalReadinessInput,
    "versionUpModeDoc" | "repoHeadSha" | "currentVersion"
  >,
): string | null {
  if (!requiresVersionUpSnapshot(plan) || !input.versionUpModeDoc) return null;
  if (!input.repoHeadSha) return null;
  return (
    buildVersionUpActivationPackets({
      charter: "",
      pillarRequirements: "",
      functionalDesign: "",
      modeCatalog: "",
      modeDoc: input.versionUpModeDoc,
      discoveryPlan: "",
      currentVersion: input.currentVersion ?? undefined,
      repoHeadSha: input.repoHeadSha ?? null,
      plans: [
        {
          file: plan.file,
          plan_id: plan.plan_id,
          status: plan.status,
          versionTarget: plan.versionTarget ?? "future",
          text: plan.text,
        },
      ],
    })[0]?.activationSnapshot.snapshotId ?? null
  );
}

function expectedCutoverSnapshotId(
  plan: ActionBindingApprovalPlan,
  input: Pick<ActionBindingApprovalReadinessInput, "currentCutoverSnapshotId">,
): string | null {
  if (!requiresCutoverSnapshot(plan)) return null;
  return input.currentCutoverSnapshotId ?? null;
}

function actionBindingSnapshotExpectations(
  plan: ActionBindingApprovalPlan,
  input: Pick<
    ActionBindingApprovalReadinessInput,
    "versionUpModeDoc" | "repoHeadSha" | "currentVersion" | "currentCutoverSnapshotId"
  >,
): ActionBindingSnapshotExpectations {
  return {
    versionUpSnapshotId: expectedVersionUpActivationSnapshotId(plan, input),
    versionUpSnapshotValidationMissing: versionUpSnapshotValidationMissing(plan, input),
    cutoverSnapshotId: expectedCutoverSnapshotId(plan, input),
  };
}

function versionUpSnapshotValidationMissing(
  plan: ActionBindingApprovalPlan,
  input: Pick<ActionBindingApprovalReadinessInput, "versionUpModeDoc" | "repoHeadSha">,
): boolean {
  return requiresVersionUpSnapshot(plan) && Boolean(input.versionUpModeDoc) && !input.repoHeadSha;
}

function readRepoHeadSha(repoRoot: string): string | null {
  try {
    const head = execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^[a-f0-9]{40}$/.test(head) ? head : null;
  } catch {
    return null;
  }
}

function readPackageVersion(repoRoot: string): string | null {
  try {
    const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
      version?: unknown;
    };
    return typeof pkg.version === "string" && pkg.version.trim() ? pkg.version.trim() : null;
  } catch {
    return null;
  }
}

function record(plan: ActionBindingApprovalPlan, field: string): string {
  return recordFieldValue(plan.text, ACTION_BINDING_RECORD_NAME, field) ?? "";
}

function recordValues(
  text: string,
  recordName: string,
  fields: readonly string[],
): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [field, recordFieldValue(text, recordName, field) ?? ""]),
  );
}

function actionBindingBlockedReasons(
  plan: ActionBindingApprovalPlan,
  approvalRecord: Record<string, string>,
  snapshotExpectations: ActionBindingSnapshotExpectations = {
    versionUpSnapshotId: null,
    versionUpSnapshotValidationMissing: false,
    cutoverSnapshotId: null,
  },
): string[] {
  const reasons: string[] = [];
  if (isPendingHighImpactApproval(plan)) {
    reasons.push("plan carries high-impact approval scope; execution remains human-gated");
  } else {
    reasons.push("plan is not pending high-impact action-binding approval");
  }
  if (selectedOutcome(approvalRecord.allowed_outcome) !== "approve_action_binding") {
    reasons.push("missing concrete approve_action_binding decision");
  }
  for (const field of [
    "approved_actor",
    "approved_tool",
    "approved_target",
    "approved_params",
  ] as const) {
    const value = approvalRecord[field] ?? "";
    if (!value.trim()) {
      reasons.push(`action-binding approval lacks concrete ${field}`);
      continue;
    }
    if (isBroadApproval(value)) {
      reasons.push(`${field} must not grant broad or wildcard approval`);
    }
    if (mentions(value, ["no ", "not approved", "未承認", "while parked", "draft plan"])) {
      reasons.push(`action-binding approval lacks concrete ${field}`);
    }
  }
  if (!hasLimitedApprovalScope(approvalRecord.approval_scope ?? "")) {
    reasons.push("approval_scope must bind a limited actor/tool/target/params boundary");
  }
  const reviewedSnapshotBinding = approvalRecord.reviewed_snapshot_binding ?? "";
  if (!hasReviewedSnapshotBinding(plan, reviewedSnapshotBinding)) {
    reasons.push("reviewed_snapshot_binding does not match the required decision packet route");
  } else if (snapshotExpectations.versionUpSnapshotValidationMissing) {
    reasons.push(VERSION_UP_SNAPSHOT_VALIDATION_MISSING_REASON);
  } else if (
    requiresSnapshotBinding(plan) &&
    (isPendingApprovalBinding(reviewedSnapshotBinding) ||
      !hasConcreteSnapshotId(reviewedSnapshotBinding))
  ) {
    reasons.push("reviewed_snapshot_binding lacks concrete current snapshot id");
  } else if (
    snapshotExpectations.versionUpSnapshotId &&
    concreteSnapshotId(reviewedSnapshotBinding) !== snapshotExpectations.versionUpSnapshotId
  ) {
    reasons.push("reviewed_snapshot_binding does not match current activationSnapshot.snapshotId");
  } else if (
    snapshotExpectations.cutoverSnapshotId &&
    concreteSnapshotId(reviewedSnapshotBinding) !== snapshotExpectations.cutoverSnapshotId
  ) {
    reasons.push("reviewed_snapshot_binding does not match current cutoverSnapshot.snapshotId");
  }
  if (!hasExpiryOrTrigger(approvalRecord.expires_at_or_trigger ?? "")) {
    reasons.push("approval requires expiry or trigger-bound re-approval");
  }
  return [...new Set(reasons)];
}

function buildActionBindingApprovalChecks(
  plan: ActionBindingApprovalPlan,
  approvalRecord: Record<string, string>,
  snapshotExpectations: ActionBindingSnapshotExpectations = {
    versionUpSnapshotId: null,
    versionUpSnapshotValidationMissing: false,
    cutoverSnapshotId: null,
  },
): ActionBindingApprovalCheck[] {
  const context = { plan, approvalRecord, snapshotExpectations };
  return ACTION_BINDING_RECORD_FIELDS.map((field) =>
    actionBindingApprovalCheckForField(context, field),
  );
}

function actionBindingApprovalCheckForField(
  context: ActionBindingApprovalCheckContext,
  field: (typeof ACTION_BINDING_RECORD_FIELDS)[number],
): ActionBindingApprovalCheck {
  const { plan, approvalRecord, snapshotExpectations } = context;
  const value = approvalRecord[field] ?? "";
  const trimmed = value.trim();
  const pendingAction =
    "record a concrete action_binding_approval_record value before any high-impact execution";

  if (!trimmed) {
    return {
      field,
      status: "pending",
      value,
      reason: `${field} is not recorded`,
      requiredAction: pendingAction,
    };
  }

  if (field === "allowed_outcome") {
    const outcome = selectedOutcome(value);
    if (!outcome) {
      return {
        field,
        status: "pending",
        value,
        reason: "allowed_outcome lists the enum but does not select a decision outcome",
        requiredAction:
          "select approve_action_binding, deny_action, or request_scope_reduction in the PLAN record",
      };
    }
    return {
      field,
      status: "concrete",
      value,
      reason: `selected ${outcome}`,
      requiredAction: "no field action; execution still requires the surrounding approval gate",
    };
  }

  if (field === "approval_scope") {
    if (isBroadApproval(value)) {
      return {
        field,
        status: "invalid",
        value,
        reason: "approval_scope grants broad or wildcard authority",
        requiredAction: "replace with a limited actor/tool/target/params boundary",
      };
    }
    if (!hasLimitedApprovalScope(value)) {
      return {
        field,
        status: "invalid",
        value,
        reason: "approval_scope does not bind a concrete limited boundary",
        requiredAction: "record the exact limited actor/tool/target/params or CLI/API/config scope",
      };
    }
    return concreteCheck(field, value, "approval_scope binds a limited concrete boundary");
  }

  if (
    field === "approved_actor" ||
    field === "approved_tool" ||
    field === "approved_target" ||
    field === "approved_params"
  ) {
    if (isBroadApproval(value)) {
      return {
        field,
        status: "invalid",
        value,
        reason: `${field} grants broad or wildcard authority`,
        requiredAction: `replace ${field} with an exact named binding`,
      };
    }
    if (isPendingApprovalBinding(value)) {
      return {
        field,
        status: "pending",
        value,
        reason: `${field} explicitly remains unapproved or future-bound`,
        requiredAction: `record a named ${field.replace("approved_", "")} before action execution`,
      };
    }
    return concreteCheck(field, value, `${field} names a concrete approval binding`);
  }

  if (field === "review_approval_evidence") {
    if (hasConcreteApprovalEvidenceLocator(value) && !isPendingReviewEvidence(value)) {
      return concreteCheck(field, value, "review evidence is named");
    }
    return {
      field,
      status: "pending",
      value,
      reason: "review evidence is not yet recorded as completed evidence",
      requiredAction: "record completed review evidence, not only a future review obligation",
    };
  }

  if (field === "reviewed_snapshot_binding") {
    if (!hasReviewedSnapshotBinding(plan, value)) {
      return {
        field,
        status: "invalid",
        value,
        reason: "snapshot binding does not match this PLAN route",
        requiredAction:
          "cite activationSnapshot.snapshotId, cutoverSnapshot.snapshotId, or an explicit no-snapshot basis",
      };
    }
    if (!requiresSnapshotBinding(plan)) {
      return concreteCheck(field, value, "explicit no-snapshot basis is recorded");
    }
    if (isPendingApprovalBinding(value)) {
      return {
        field,
        status: "pending",
        value,
        reason: "snapshot binding is described as a future approval obligation",
        requiredAction: "record the reviewed snapshot id or no-snapshot basis used for approval",
      };
    }
    if (snapshotExpectations.versionUpSnapshotValidationMissing) {
      return {
        field,
        status: "pending",
        value,
        reason: VERSION_UP_SNAPSHOT_VALIDATION_MISSING_REASON,
        requiredAction:
          "re-run the action-binding approval packet from a git worktree with repoHeadSha before approval",
      };
    }
    if (requiresSnapshotBinding(plan) && !hasConcreteSnapshotId(value)) {
      return {
        field,
        status: "pending",
        value,
        reason: "snapshot binding names the packet field but not the concrete current snapshot id",
        requiredAction:
          "record the current sha256 snapshotId from the activation or rename packet before approval",
      };
    }
    if (
      snapshotExpectations.versionUpSnapshotId &&
      concreteSnapshotId(value) !== snapshotExpectations.versionUpSnapshotId
    ) {
      return {
        field,
        status: "invalid",
        value,
        reason: "snapshot binding does not match current activationSnapshot.snapshotId",
        requiredAction:
          "re-run ut-tdd version-up activation-packet --json and record the current activationSnapshot.snapshotId",
      };
    }
    if (
      snapshotExpectations.cutoverSnapshotId &&
      concreteSnapshotId(value) !== snapshotExpectations.cutoverSnapshotId
    ) {
      return {
        field,
        status: "invalid",
        value,
        reason: "snapshot binding does not match current cutoverSnapshot.snapshotId",
        requiredAction:
          "re-run ut-tdd rename plan --json and record the current cutoverSnapshot.snapshotId",
      };
    }
    return concreteCheck(field, value, "snapshot binding matches this PLAN route");
  }

  if (field === "expires_at_or_trigger") {
    if (!hasExpiryOrTrigger(value)) {
      return {
        field,
        status: "invalid",
        value,
        reason: "expiry or trigger-bound re-approval is missing",
        requiredAction: "record an expiry date or trigger condition",
      };
    }
    return concreteCheck(field, value, "expiry or trigger condition is recorded");
  }

  if (field === "audit_record") {
    if (isPendingApprovalBinding(value) || !hasConcreteApprovalEvidenceLocator(value)) {
      return {
        field,
        status: "pending",
        value,
        reason: "audit_record is still a future execution obligation",
        requiredAction:
          "record the executed action audit id/path with approver, command, result, and route",
      };
    }
    return concreteCheck(field, value, "audit route is recorded");
  }

  if (isPendingApprovalBinding(value)) {
    return {
      field,
      status: "pending",
      value,
      reason: `${field} is future-bound`,
      requiredAction: pendingAction,
    };
  }
  return concreteCheck(field, value, `${field} is recorded`);
}

function concreteCheck(
  field: (typeof ACTION_BINDING_RECORD_FIELDS)[number],
  value: string,
  reason: string,
): ActionBindingApprovalCheck {
  return {
    field,
    status: "concrete",
    value,
    reason,
    requiredAction: "none for this field",
  };
}

function selectedOutcome(value = ""): string | null {
  const normalized = value.replace(/`/g, "").trim();
  return ACTION_BINDING_ALLOWED_OUTCOMES.find((outcome) => normalized === outcome) ?? null;
}

function mentions(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle.toLowerCase()));
}

function isBroadApproval(value: string): boolean {
  return /\b(any|all|everything|unlimited|wildcard)\b/i.test(value) || value.includes("*");
}

function isPendingApprovalBinding(value: string): boolean {
  return mentions(value, [
    "no ",
    "not approved",
    "未承認",
    "while parked",
    "draft plan",
    "future approval",
    "must name",
    "must record",
    "must write",
    "must cite",
    "must be reviewed",
    "before approval",
    "before activation",
    "before apply",
    "before execution",
    "required before",
    "cannot authorize",
    "将来",
    "承認しない",
    "未承認",
    "承認前",
    "approval 前",
  ]);
}

function isPendingReviewEvidence(value: string): boolean {
  return mentions(value, [
    "must be reviewed",
    "to be reviewed",
    "before approval",
    "before activation",
    "before apply",
    "before execution",
    "required before",
    "将来",
    "承認前",
    "approval 前",
  ]);
}

function hasConcreteApprovalEvidenceLocator(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  return [
    /sha256:[a-f0-9]{64}/i,
    /\b[A-Z]{1,8}-\d{2,}\b/,
    /\b(run|workflow|job|artifact|audit|evidence|report|log)\s*(id|path|url)\s*[:=]\s*\S+/i,
    /\b(?:audit|run|workflow|job|artifact|report|log)-?(?:id|url|path)\s*[:=]\s*\S+/i,
    /https?:\/\/\S+/i,
    /\b(artifacts?|reports?|logs?|evidence|audit)\//i,
    /\b(\.ut-tdd|\.helix|docs|tests|src|dist|coverage|artifacts?|reports?|logs?)\/\S+/i,
    /\S+\.(json|log|txt|md|sarif|junit|xml|csv|db)\b/i,
  ].some((pattern) => pattern.test(normalized));
}

function hasLimitedApprovalScope(value: string): boolean {
  if (isBroadApproval(value)) {
    return false;
  }
  if (hasOnlyScopeExclusions(value)) {
    return false;
  }
  const hasLimiter = mentions(value, [
    "only",
    "limited",
    "excluded",
    "out of scope",
    "限定",
    "範囲に限定",
    "対象外",
  ]);
  const hasConcreteBoundary = mentions(value, [
    ".ut-tdd",
    "access control",
    "actor",
    "adapter",
    "api",
    "bin",
    "cli",
    "cloudflare",
    "command",
    "config",
    "distribution",
    "docs/governance",
    "external",
    "github",
    "hook",
    "params",
    "read-only",
    "secret",
    "state dir",
    "target",
    "tool",
    "webhook",
    "write-capable",
  ]);
  return hasLimiter && hasConcreteBoundary;
}

function hasOnlyScopeExclusions(value: string): boolean {
  const normalized = value.toLowerCase();
  const exclusionMarkers = ["out of scope", "excluded", "対象外", "範囲外"];
  if (!exclusionMarkers.some((marker) => normalized.includes(marker.toLowerCase()))) {
    return false;
  }
  return !mentions(value, ["only", "limited", "限定", "範囲に限定"]);
}

function hasExpiryOrTrigger(value: string): boolean {
  return (
    /\d{4}-\d{2}-\d{2}/.test(value) ||
    mentions(value, [
      "trigger-bound",
      "expires",
      "expires if",
      "before",
      "scope change",
      "changes",
      "re-approval",
    ])
  );
}

export function actionBindingApprovalReadinessMessages(
  result: ActionBindingApprovalReadinessResult,
): string[] {
  if (result.ok) {
    const pending = result.pendingPlanIds.length > 0 ? result.pendingPlanIds.join(", ") : "none";
    return [
      `action-binding-approval-readiness - OK (pending=${result.pendingPlanIds.length}: ${pending})`,
    ];
  }
  const detail = result.violations
    .slice(0, 5)
    .map((v) => `${v.subject}: ${v.reason}`)
    .join("; ");
  const more = result.violations.length > 5 ? `; +${result.violations.length - 5} more` : "";
  return [`action-binding-approval-readiness - violation: ${detail}${more}`];
}
