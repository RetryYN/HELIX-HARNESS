import { createHash } from "node:crypto";
import {
  type CompletionDecisionPacket,
  type CompletionDecisionRecordRequirement,
  type CompletionDecisionRecordTemplate,
  type CompletionReviewBundle,
  type CompletionReviewBundlePacket,
  completionDecisionPacketForOutstanding,
  completionReviewBundleForOutstanding,
  completionReviewBundleSemanticDigest,
  computeOutstandingWork,
  REQUIRED_DECISION_PACKET_MATRIX_FIELDS,
  requiredRecordsForBlockers,
  runnablePacketCommand,
  workflowActionTextJa,
  workflowEvidenceTextJa,
  workflowReviewRouteTextJa,
  workflowRouteTextJa,
} from "./outstanding";
import {
  hasSourceLedgerCheckedDate,
  sourceLedgerCheckedDateViolation,
} from "./source-ledger-freshness";

const JAPANESE_GUIDANCE_PATTERN = /[ぁ-んァ-ン一-龯]/;

export type CompletionDecisionPacketViolationReason =
  | "invalid_schema_version"
  | "invalid_generated_from"
  | "invalid_status_ok_consistency"
  | "invalid_authority_boundary"
  | "missing_generated_at"
  | "invalid_generated_at"
  | "invalid_source_command"
  | "invalid_freshness_policy"
  | "invalid_freshness_window"
  | "invalid_expires_at"
  | "stale_flag_mismatch"
  | "stale_packet"
  | "decision_count_mismatch"
  | "invalid_semantic_meaning_summary"
  | "invalid_decision_kind"
  | "invalid_decision_packet_command"
  | "invalid_runnable_decision_packet_command"
  | "invalid_scoped_decision_packet_command"
  | "invalid_supporting_packet_summary"
  | "invalid_decision_allowed_outcomes"
  | "invalid_decision_next_route"
  | "missing_required_records"
  | "invalid_required_record"
  | "missing_record_templates"
  | "invalid_record_template"
  | "missing_allowed_outcomes_by_record"
  | "invalid_allowed_outcomes_by_record"
  | "missing_next_routes_by_record"
  | "invalid_next_routes_by_record"
  | "invalid_required_record_source_path"
  | "invalid_required_record_source_ledger"
  | "invalid_human_review_bundle"
  | "invalid_japanese_display_field";

export interface CompletionDecisionPacketViolation {
  reason: CompletionDecisionPacketViolationReason;
  detail: string;
}

export interface CompletionDecisionPacketLintResult {
  ok: boolean;
  status: CompletionDecisionPacket["status"] | "unknown";
  decisionCount: number;
  sourceCommand: string;
  validForMinutes: number;
  stale: boolean;
  expiresAt: string;
  violations: CompletionDecisionPacketViolation[];
}

export type CompletionReviewBundleViolationReason =
  | "invalid_schema_version"
  | "missing_generated_at"
  | "invalid_generated_at"
  | "invalid_source_command"
  | "invalid_freshness_policy"
  | "invalid_freshness_window"
  | "invalid_expires_at"
  | "stale_flag_mismatch"
  | "stale_bundle"
  | "invalid_safety_flags"
  | "invalid_completion_state"
  | "invalid_completion_decision_packet_bridge"
  | "invalid_review_packet_count"
  | "invalid_review_packet"
  | "invalid_digest";

export interface CompletionReviewBundleViolation {
  reason: CompletionReviewBundleViolationReason;
  detail: string;
}

export interface CompletionReviewBundleLintResult {
  ok: boolean;
  status: CompletionReviewBundle["status"] | "unknown";
  decisionCount: number;
  reviewPacketCount: number;
  sourceCommand: string;
  validForMinutes: number;
  stale: boolean;
  expiresAt: string;
  bundleDigest: string;
  semanticBundleDigest: string;
  violations: CompletionReviewBundleViolation[];
}

export interface CompletionDecisionPacketLintOptions {
  /** repo-relative sourcePaths が実在するかを呼び出し側が検査するための hook。 */
  sourcePathExists?: (repoRelativePath: string) => boolean;
  /** repo-relative sourcePaths の中身を読んで source ledger freshness を検査するための hook。 */
  sourceText?: (repoRelativePath: string) => string | null;
}

export interface RecordTemplateContractViolation {
  subject: string;
  reason: string;
}

const SCHEMA_VERSION = "completion-decision-packet.v1";
const POLICY = "decision-packet-freshness.v1";
const ALLOWED_SOURCE_COMMANDS = new Set([
  "ut-tdd handover",
  "ut-tdd status --json",
  "ut-tdd completion decision-packet --json",
]);
const HUMAN_DECISION_BLOCKERS = new Set([
  "human_approval_pending",
  "irreversible_migration_pending",
  "po_decision_pending",
  "version_up_parked",
]);
const WORKFLOW_STATE_BLOCKERS = new Set(["non_terminal_plans"]);
const HUMAN_REVIEW_OWNER_FIELDS = new Set([
  "decision_owner",
  "review_owner",
  "approval_policy_or_named_approver",
  "approved_actor",
]);
const HUMAN_REVIEW_TIMING_FIELDS = new Set([
  "target_version_or_release_trigger",
  "review_trigger",
  "review_by_policy",
  "stale_action",
  "trigger_condition",
  "execution_window_or_freeze_policy",
  "expires_at_or_trigger",
]);
const HUMAN_REVIEW_FRESHNESS_FIELDS = new Set([
  "activation_snapshot_id",
  "cutover_snapshot_id",
  "reviewed_snapshot_binding",
  "source_ledger_freshness",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
]);
const HUMAN_REVIEW_SAFETY_FIELD_SUFFIXES = [
  "planOnly",
  "mustNotDecide",
  "decisionCommandAvailable",
  "decisionAllowed",
  "mustNotApprove",
  "approvalCommandAvailable",
  "approvalAllowed",
  "activationReadinessSummary.activationAllowed",
  "approvalGate.requiredDecision",
  "approvalGate.requiredActionBinding",
  "approvalGate.approvedActorRequired",
  "approvalGate.approvedToolRequired",
  "approvalGate.approvedTargetRequired",
  "approvalGate.approvedParamsRequired",
  "approvalGate.reviewedSnapshotBindingRequired",
];

function humanReviewRecordFields(
  records: CompletionDecisionRecordRequirement[],
  targetFields: ReadonlySet<string>,
): string[] {
  return records.flatMap((record) =>
    record.fields
      .filter((field) => targetFields.has(field))
      .map((field) => `${record.recordName}.${field}`),
  );
}

function humanReviewSafetyFields(
  summaries: CompletionDecisionPacket["decisions"][number]["supportingPacketSummaries"],
): string[] {
  return summaries.flatMap((summary) =>
    summary.requiredReviewFields
      .filter((field) => HUMAN_REVIEW_SAFETY_FIELD_SUFFIXES.includes(field))
      .map((field) => `${summary.schemaVersion}.${field}`),
  );
}

export function analyzeCompletionDecisionPacket(
  packet: CompletionDecisionPacket,
  now: string = new Date().toISOString(),
  opts: CompletionDecisionPacketLintOptions = {},
): CompletionDecisionPacketLintResult {
  const violations: CompletionDecisionPacketViolation[] = [];
  const generatedAt = packet.generatedAt;
  const generatedMs = Date.parse(generatedAt ?? "");
  const nowMs = Date.parse(now);
  const validForMinutes = packet.freshness?.validForMinutes;
  const expiresAt = packet.freshness?.expiresAt ?? "";
  const expiresMs = Date.parse(expiresAt);

  if (packet.schemaVersion !== SCHEMA_VERSION) {
    violations.push({
      reason: "invalid_schema_version",
      detail: `schemaVersion=${String(packet.schemaVersion)} expected=${SCHEMA_VERSION}`,
    });
  }

  if (packet.generatedFrom !== "outstanding.completionReadiness") {
    violations.push({
      reason: "invalid_generated_from",
      detail: `generatedFrom=${String(packet.generatedFrom)}`,
    });
  }

  if ((packet.ok && packet.status !== "ready") || (!packet.ok && packet.status !== "blocked")) {
    violations.push({
      reason: "invalid_status_ok_consistency",
      detail: `ok=${String(packet.ok)} status=${String(packet.status)}`,
    });
  }

  const packetBlockers = [...(packet.blockers ?? [])].sort();
  const expectedHumanDecisionBlockers = packetBlockers
    .filter((blocker) => HUMAN_DECISION_BLOCKERS.has(blocker))
    .sort();
  const expectedWorkflowStateBlockers = packetBlockers
    .filter((blocker) => WORKFLOW_STATE_BLOCKERS.has(blocker))
    .sort();
  const expectedAutonomousWorkBlockers = packetBlockers
    .filter(
      (blocker) => !HUMAN_DECISION_BLOCKERS.has(blocker) && !WORKFLOW_STATE_BLOCKERS.has(blocker),
    )
    .sort();
  const expectedHumanDecisionRequired = expectedHumanDecisionBlockers.length > 0;
  const expectedAuthorityBoundary =
    packet.status === "ready"
      ? "none"
      : expectedHumanDecisionRequired
        ? "human_decision_required"
        : "automation_work_required";
  const expectedNextAuthority =
    expectedAuthorityBoundary === "none"
      ? "none"
      : expectedAuthorityBoundary === "human_decision_required"
        ? "human"
        : "automation";
  if (packet.authorityBoundary !== expectedAuthorityBoundary) {
    violations.push({
      reason: "invalid_authority_boundary",
      detail: `authorityBoundary=${String(packet.authorityBoundary)} expected=${expectedAuthorityBoundary}`,
    });
  }
  if (packet.humanDecisionRequired !== expectedHumanDecisionRequired) {
    violations.push({
      reason: "invalid_authority_boundary",
      detail: `humanDecisionRequired=${String(packet.humanDecisionRequired)} expected=${String(expectedHumanDecisionRequired)}`,
    });
  }
  if (
    JSON.stringify(packet.humanDecisionBlockers ?? []) !==
    JSON.stringify(expectedHumanDecisionBlockers)
  ) {
    violations.push({
      reason: "invalid_authority_boundary",
      detail: `humanDecisionBlockers=${(packet.humanDecisionBlockers ?? []).join(",")} expected=${expectedHumanDecisionBlockers.join(",")}`,
    });
  }
  if (
    JSON.stringify(packet.workflowStateBlockers ?? []) !==
    JSON.stringify(expectedWorkflowStateBlockers)
  ) {
    violations.push({
      reason: "invalid_authority_boundary",
      detail: `workflowStateBlockers=${(packet.workflowStateBlockers ?? []).join(",")} expected=${expectedWorkflowStateBlockers.join(",")}`,
    });
  }
  if (
    JSON.stringify(packet.autonomousWorkBlockers ?? []) !==
    JSON.stringify(expectedAutonomousWorkBlockers)
  ) {
    violations.push({
      reason: "invalid_authority_boundary",
      detail: `autonomousWorkBlockers=${(packet.autonomousWorkBlockers ?? []).join(",")} expected=${expectedAutonomousWorkBlockers.join(",")}`,
    });
  }
  if (packet.nextAuthority !== expectedNextAuthority) {
    violations.push({
      reason: "invalid_authority_boundary",
      detail: `nextAuthority=${String(packet.nextAuthority)} expected=${expectedNextAuthority}`,
    });
  }

  if (!generatedAt) {
    violations.push({ reason: "missing_generated_at", detail: "generatedAt is required" });
  } else if (Number.isNaN(generatedMs)) {
    violations.push({ reason: "invalid_generated_at", detail: `generatedAt=${generatedAt}` });
  }

  if (!ALLOWED_SOURCE_COMMANDS.has(packet.sourceCommand)) {
    violations.push({
      reason: "invalid_source_command",
      detail: `sourceCommand=${String(packet.sourceCommand)}`,
    });
  }

  if (packet.freshness?.policy !== POLICY) {
    violations.push({
      reason: "invalid_freshness_policy",
      detail: `policy=${String(packet.freshness?.policy)}`,
    });
  }

  if (!Number.isFinite(validForMinutes) || validForMinutes <= 0) {
    violations.push({
      reason: "invalid_freshness_window",
      detail: `validForMinutes=${String(validForMinutes)}`,
    });
  }

  if (Number.isNaN(expiresMs)) {
    violations.push({ reason: "invalid_expires_at", detail: `expiresAt=${expiresAt}` });
  } else if (!Number.isNaN(generatedMs) && Number.isFinite(validForMinutes)) {
    const expectedExpiresAt = new Date(generatedMs + validForMinutes * 60_000).toISOString();
    if (expiresAt !== expectedExpiresAt) {
      violations.push({
        reason: "invalid_expires_at",
        detail: `expiresAt=${expiresAt} expected=${expectedExpiresAt}`,
      });
    }
  }

  const computedStale =
    !Number.isNaN(nowMs) && !Number.isNaN(expiresMs)
      ? nowMs > expiresMs
      : Boolean(packet.freshness?.stale);
  if (packet.freshness?.stale !== computedStale) {
    violations.push({
      reason: "stale_flag_mismatch",
      detail: `stale=${String(packet.freshness?.stale)} expected=${String(computedStale)}`,
    });
  }

  if (computedStale) {
    violations.push({
      reason: "stale_packet",
      detail: `expiresAt=${expiresAt} now=${Number.isNaN(nowMs) ? now : new Date(nowMs).toISOString()}`,
    });
  }

  if (packet.decisionCount !== packet.decisions.length) {
    violations.push({
      reason: "decision_count_mismatch",
      detail: `decisionCount=${packet.decisionCount} actual=${packet.decisions.length}`,
    });
  }

  const humanReviewBundle = packet.humanReviewBundle;
  if (!humanReviewBundle) {
    violations.push({
      reason: "invalid_human_review_bundle",
      detail: "humanReviewBundle is required",
    });
  } else {
    if (humanReviewBundle.schemaVersion !== "completion-decision-human-review-bundle.v1") {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: `schemaVersion=${String(humanReviewBundle.schemaVersion)}`,
      });
    }
    if (humanReviewBundle.status !== packet.status) {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: `status=${String(humanReviewBundle.status)} expected=${packet.status}`,
      });
    }
    if (humanReviewBundle.sourceCommand !== packet.sourceCommand) {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: `sourceCommand=${String(humanReviewBundle.sourceCommand)} expected=${packet.sourceCommand}`,
      });
    }
    if (humanReviewBundle.generatedAt !== packet.generatedAt) {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: `generatedAt=${String(humanReviewBundle.generatedAt)} expected=${packet.generatedAt}`,
      });
    }
    if (humanReviewBundle.decisionCount !== packet.decisions.length) {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: `decisionCount=${String(humanReviewBundle.decisionCount)} actual=${packet.decisions.length}`,
      });
    }
    if (humanReviewBundle.nextAuthority !== packet.nextAuthority) {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: `nextAuthority=${String(humanReviewBundle.nextAuthority)} expected=${packet.nextAuthority}`,
      });
    }
    if (humanReviewBundle.completionClaimAllowed !== packet.ok) {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: `completionClaimAllowed=${String(humanReviewBundle.completionClaimAllowed)} expected=${String(packet.ok)}`,
      });
    }
    if (!Array.isArray(humanReviewBundle.items)) {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: "items is required",
      });
    } else if (humanReviewBundle.items.length !== packet.decisions.length) {
      violations.push({
        reason: "invalid_human_review_bundle",
        detail: `items.length=${humanReviewBundle.items.length} expected=${packet.decisions.length}`,
      });
    }
  }

  const semanticSummary = packet.semanticMeaningSummary;
  const frontierRecords = packet.semanticFeatureFrontierRecords ?? [];
  const confirmedRecords = packet.confirmedCurrentMeaningRecords ?? [];
  if (!semanticSummary) {
    violations.push({
      reason: "invalid_semantic_meaning_summary",
      detail: "semanticMeaningSummary is required",
    });
  } else {
    if (semanticSummary.frontierRecordCount !== frontierRecords.length) {
      violations.push({
        reason: "invalid_semantic_meaning_summary",
        detail: `frontierRecordCount=${String(semanticSummary.frontierRecordCount)} actual=${frontierRecords.length}`,
      });
    }
    if (semanticSummary.confirmedCurrentMeaningRecordCount !== confirmedRecords.length) {
      violations.push({
        reason: "invalid_semantic_meaning_summary",
        detail: `confirmedCurrentMeaningRecordCount=${String(semanticSummary.confirmedCurrentMeaningRecordCount)} actual=${confirmedRecords.length}`,
      });
    }
    if (semanticSummary.completionClaimAllowed !== packet.ok) {
      violations.push({
        reason: "invalid_semantic_meaning_summary",
        detail: `completionClaimAllowed=${String(semanticSummary.completionClaimAllowed)} expected=${String(packet.ok)}`,
      });
    }
    for (const sourcePath of [
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
    ]) {
      if (!(semanticSummary.sourcePaths ?? []).includes(sourcePath)) {
        violations.push({
          reason: "invalid_semantic_meaning_summary",
          detail: `semanticMeaningSummary sourcePaths missing ${sourcePath}`,
        });
      }
    }
  }

  const unsafeRepoRelativePath = (sourcePath: string): boolean =>
    sourcePath.startsWith("/") ||
    /^[A-Za-z]:[\\/]/.test(sourcePath) ||
    sourcePath.split(/[\\/]+/).includes("..");

  packet.decisions.forEach((decision, decisionIndex) => {
    const bundleItem = humanReviewBundle?.items?.[decisionIndex];
    if (bundleItem) {
      const expectedRecordNames = decision.requiredRecords.map((record) => record.recordName);
      const expectedReviewRoutesJa = decision.supportingPacketSummaries.map(
        (summary) => summary.reviewRouteJa ?? summary.reviewRoute,
      );
      const expectedReviewRouteIds = decision.supportingPacketSummaries.map(
        (summary) => summary.reviewRoute,
      );
      const expectedOwnerReviewFields = humanReviewRecordFields(
        decision.requiredRecords,
        HUMAN_REVIEW_OWNER_FIELDS,
      );
      const expectedTimingReviewFields = humanReviewRecordFields(
        decision.requiredRecords,
        HUMAN_REVIEW_TIMING_FIELDS,
      );
      const expectedFreshnessReviewFields = humanReviewRecordFields(
        decision.requiredRecords,
        HUMAN_REVIEW_FRESHNESS_FIELDS,
      );
      const expectedSafetyReviewFields = humanReviewSafetyFields(
        decision.supportingPacketSummaries,
      );
      const bundleChecks: Array<[string, unknown, unknown]> = [
        ["order", bundleItem.order, decisionIndex + 1],
        ["planId", bundleItem.planId, decision.planId],
        ["decisionKind", bundleItem.decisionKind, decision.decisionKind],
        ["blockerReason", bundleItem.blockerReason, decision.blockerReason],
        [
          "scopedPrimaryPacketCommand",
          bundleItem.scopedPrimaryPacketCommand,
          decision.scopedDecisionPacketCommand,
        ],
        [
          "runnableScopedPrimaryPacketCommand",
          bundleItem.runnableScopedPrimaryPacketCommand,
          decision.runnableScopedDecisionPacketCommand,
        ],
      ];
      for (const [field, actual, expected] of bundleChecks) {
        if (actual !== expected) {
          violations.push({
            reason: "invalid_human_review_bundle",
            detail: `items[${decisionIndex}].${field}=${String(actual)} expected=${String(expected)}`,
          });
        }
      }
      const arrayChecks: Array<[string, unknown[], unknown[]]> = [
        ["blockers", bundleItem.blockers ?? [], decision.blockers ?? []],
        ["requiredActionsJa", bundleItem.requiredActionsJa ?? [], decision.requiredActionsJa ?? []],
        ["requiredRecords", bundleItem.requiredRecords ?? [], expectedRecordNames],
        ["ownerReviewFields", bundleItem.ownerReviewFields ?? [], expectedOwnerReviewFields],
        ["timingReviewFields", bundleItem.timingReviewFields ?? [], expectedTimingReviewFields],
        [
          "freshnessReviewFields",
          bundleItem.freshnessReviewFields ?? [],
          expectedFreshnessReviewFields,
        ],
        ["safetyReviewFields", bundleItem.safetyReviewFields ?? [], expectedSafetyReviewFields],
        [
          "scopedSupportingPacketCommands",
          bundleItem.scopedSupportingPacketCommands ?? [],
          decision.scopedPacketCommands ?? [],
        ],
        [
          "runnableScopedSupportingPacketCommands",
          bundleItem.runnableScopedSupportingPacketCommands ?? [],
          decision.runnableScopedPacketCommands ?? [],
        ],
        ["reviewRoutesJa", bundleItem.reviewRoutesJa ?? [], expectedReviewRoutesJa],
        ["reviewRouteIds", bundleItem.reviewRouteIds ?? [], expectedReviewRouteIds],
      ];
      for (const [field, actual, expected] of arrayChecks) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          violations.push({
            reason: "invalid_human_review_bundle",
            detail: `items[${decisionIndex}].${field} mismatch expected=${expected.join(",")} actual=${actual.join(",")}`,
          });
        }
      }
    }
    const expectedDecisionKind = requiredDecisionKind(decision.blockerReason);
    if (decision.decisionKind !== expectedDecisionKind) {
      violations.push({
        reason: "invalid_decision_kind",
        detail: `decision[${decisionIndex}] blockerReason=${decision.blockerReason} decisionKind=${decision.decisionKind} expected=${expectedDecisionKind}`,
      });
    }
    const expectedPacketCommand = requiredDecisionPacketCommand(decision.blockerReason);
    if (decision.decisionPacketCommand !== expectedPacketCommand) {
      violations.push({
        reason: "invalid_decision_packet_command",
        detail: `decision[${decisionIndex}] blockerReason=${decision.blockerReason} decisionPacketCommand=${String(decision.decisionPacketCommand)} expected=${expectedPacketCommand}`,
      });
    }
    const expectedRunnableDecisionPacketCommand = runnablePacketCommand(expectedPacketCommand);
    if (decision.runnableDecisionPacketCommand !== expectedRunnableDecisionPacketCommand) {
      violations.push({
        reason: "invalid_runnable_decision_packet_command",
        detail: `decision[${decisionIndex}] runnableDecisionPacketCommand mismatch expected=${expectedRunnableDecisionPacketCommand} actual=${String(decision.runnableDecisionPacketCommand)}`,
      });
    }
    const expectedRequiredActionJa = workflowActionTextJa(decision.requiredAction);
    if (decision.requiredActionJa !== expectedRequiredActionJa) {
      violations.push({
        reason: "invalid_japanese_display_field",
        detail: `decision[${decisionIndex}] requiredActionJa mismatch expected=${expectedRequiredActionJa} actual=${String(decision.requiredActionJa)}`,
      });
    }
    const requiredActions = decision.requiredActions ?? [];
    const requiredActionsJa = decision.requiredActionsJa ?? [];
    if (requiredActionsJa.length !== requiredActions.length) {
      violations.push({
        reason: "invalid_japanese_display_field",
        detail: `decision[${decisionIndex}] requiredActionsJa length=${requiredActionsJa.length} expected=${requiredActions.length}`,
      });
    }
    requiredActions.forEach((action, actionIndex) => {
      const expectedActionJa = workflowActionTextJa(action);
      if (requiredActionsJa[actionIndex] !== expectedActionJa) {
        violations.push({
          reason: "invalid_japanese_display_field",
          detail: `decision[${decisionIndex}] requiredActionsJa[${actionIndex}] mismatch expected=${expectedActionJa} actual=${String(requiredActionsJa[actionIndex])}`,
        });
      }
    });
    const requiredEvidence = decision.requiredEvidence ?? [];
    const requiredEvidenceJa = decision.requiredEvidenceJa ?? [];
    if (requiredEvidenceJa.length !== requiredEvidence.length) {
      violations.push({
        reason: "invalid_japanese_display_field",
        detail: `decision[${decisionIndex}] requiredEvidenceJa length=${requiredEvidenceJa.length} expected=${requiredEvidence.length}`,
      });
    }
    requiredEvidence.forEach((evidence, evidenceIndex) => {
      const expectedEvidenceJa = workflowEvidenceTextJa(evidence);
      const actualEvidenceJa = String(requiredEvidenceJa[evidenceIndex] ?? "");
      if (actualEvidenceJa !== expectedEvidenceJa) {
        violations.push({
          reason: "invalid_japanese_display_field",
          detail: `decision[${decisionIndex}] requiredEvidenceJa[${evidenceIndex}] mismatch expected=${expectedEvidenceJa} actual=${actualEvidenceJa}`,
        });
      }
      if (!JAPANESE_GUIDANCE_PATTERN.test(actualEvidenceJa)) {
        violations.push({
          reason: "invalid_japanese_display_field",
          detail: `decision[${decisionIndex}] requiredEvidenceJa[${evidenceIndex}] is not Japanese guidance actual=${actualEvidenceJa}`,
        });
      }
    });
    const expectedPacketCommands = requiredPacketCommands(
      decision.blockerReason,
      decision.blockers,
    );
    const actualPacketCommands = [...(decision.packetCommands ?? [])].sort();
    const sortedExpectedPacketCommands = [...expectedPacketCommands].sort();
    if (actualPacketCommands.join("\0") !== sortedExpectedPacketCommands.join("\0")) {
      violations.push({
        reason: "invalid_decision_packet_command",
        detail: `decision[${decisionIndex}] packetCommands mismatch expected=${sortedExpectedPacketCommands.join(",")} actual=${actualPacketCommands.join(",")}`,
      });
    }
    const expectedRunnablePacketCommands = expectedPacketCommands.map(runnablePacketCommand).sort();
    const actualRunnablePacketCommands = [...(decision.runnablePacketCommands ?? [])].sort();
    if (actualRunnablePacketCommands.join("\0") !== expectedRunnablePacketCommands.join("\0")) {
      violations.push({
        reason: "invalid_runnable_decision_packet_command",
        detail: `decision[${decisionIndex}] runnablePacketCommands mismatch expected=${expectedRunnablePacketCommands.join(",")} actual=${actualRunnablePacketCommands.join(",")}`,
      });
    }
    const expectedScopedDecisionPacketCommand = scopedDecisionPacketCommandForPlan(
      decision.planId,
      expectedPacketCommand,
    );
    if (decision.scopedDecisionPacketCommand !== expectedScopedDecisionPacketCommand) {
      violations.push({
        reason: "invalid_scoped_decision_packet_command",
        detail: `decision[${decisionIndex}] scopedDecisionPacketCommand mismatch expected=${expectedScopedDecisionPacketCommand} actual=${String(decision.scopedDecisionPacketCommand)}`,
      });
    }
    const expectedRunnableScopedDecisionPacketCommand = runnablePacketCommand(
      expectedScopedDecisionPacketCommand,
    );
    if (
      decision.runnableScopedDecisionPacketCommand !== expectedRunnableScopedDecisionPacketCommand
    ) {
      violations.push({
        reason: "invalid_runnable_decision_packet_command",
        detail: `decision[${decisionIndex}] runnableScopedDecisionPacketCommand mismatch expected=${expectedRunnableScopedDecisionPacketCommand} actual=${String(decision.runnableScopedDecisionPacketCommand)}`,
      });
    }
    const expectedScopedPacketCommands = expectedPacketCommands
      .map((command) => scopedDecisionPacketCommandForPlan(decision.planId, command))
      .sort();
    const actualScopedPacketCommands = [...(decision.scopedPacketCommands ?? [])].sort();
    if (actualScopedPacketCommands.join("\0") !== expectedScopedPacketCommands.join("\0")) {
      violations.push({
        reason: "invalid_scoped_decision_packet_command",
        detail: `decision[${decisionIndex}] scopedPacketCommands mismatch expected=${expectedScopedPacketCommands.join(",")} actual=${actualScopedPacketCommands.join(",")}`,
      });
    }
    const expectedRunnableScopedPacketCommands = expectedScopedPacketCommands
      .map(runnablePacketCommand)
      .sort();
    const actualRunnableScopedPacketCommands = [
      ...(decision.runnableScopedPacketCommands ?? []),
    ].sort();
    if (
      actualRunnableScopedPacketCommands.join("\0") !==
      expectedRunnableScopedPacketCommands.join("\0")
    ) {
      violations.push({
        reason: "invalid_runnable_decision_packet_command",
        detail: `decision[${decisionIndex}] runnableScopedPacketCommands mismatch expected=${expectedRunnableScopedPacketCommands.join(",")} actual=${actualRunnableScopedPacketCommands.join(",")}`,
      });
    }
    const summaryCommands = [
      ...(decision.supportingPacketSummaries ?? []).map((row) => row.command),
    ].sort();
    if (summaryCommands.join("\0") !== sortedExpectedPacketCommands.join("\0")) {
      violations.push({
        reason: "invalid_supporting_packet_summary",
        detail: `decision[${decisionIndex}] supportingPacketSummaries mismatch expected=${sortedExpectedPacketCommands.join(",")} actual=${summaryCommands.join(",")}`,
      });
    }
    for (const command of expectedPacketCommands) {
      const summary = (decision.supportingPacketSummaries ?? []).find(
        (row) => row.command === command,
      );
      const expectedSummary = requiredSupportingPacketSummary(command);
      if (!summary) {
        violations.push({
          reason: "invalid_supporting_packet_summary",
          detail: `decision[${decisionIndex}] missing supportingPacketSummary command=${command}`,
        });
        continue;
      }
      if (
        summary.schemaVersion !== expectedSummary.schemaVersion ||
        summary.matrixField !== expectedSummary.matrixField ||
        summary.expectedMatrixCount !== expectedSummary.expectedMatrixCount
      ) {
        violations.push({
          reason: "invalid_supporting_packet_summary",
          detail: `decision[${decisionIndex}] supportingPacketSummary command=${command} drift expected=${expectedSummary.schemaVersion}/${expectedSummary.matrixField}/${expectedSummary.expectedMatrixCount} actual=${summary.schemaVersion}/${summary.matrixField}/${summary.expectedMatrixCount}`,
        });
      }
      const expectedSummaryRunnableCommand = runnablePacketCommand(command);
      if (summary.runnableCommand !== expectedSummaryRunnableCommand) {
        violations.push({
          reason: "invalid_supporting_packet_summary",
          detail: `decision[${decisionIndex}] supportingPacketSummary command=${command} runnableCommand mismatch expected=${expectedSummaryRunnableCommand} actual=${String(summary.runnableCommand)}`,
        });
      }
      const expectedSummaryScopedCommand = scopedDecisionPacketCommandForPlan(
        decision.planId,
        command,
      );
      if (summary.scopedCommand !== expectedSummaryScopedCommand) {
        violations.push({
          reason: "invalid_supporting_packet_summary",
          detail: `decision[${decisionIndex}] supportingPacketSummary command=${command} scopedCommand mismatch expected=${expectedSummaryScopedCommand} actual=${String(summary.scopedCommand)}`,
        });
      }
      const expectedSummaryRunnableScopedCommand = runnablePacketCommand(
        expectedSummaryScopedCommand,
      );
      if (summary.runnableScopedCommand !== expectedSummaryRunnableScopedCommand) {
        violations.push({
          reason: "invalid_supporting_packet_summary",
          detail: `decision[${decisionIndex}] supportingPacketSummary command=${command} runnableScopedCommand mismatch expected=${expectedSummaryRunnableScopedCommand} actual=${String(summary.runnableScopedCommand)}`,
        });
      }
      for (const field of expectedSummary.requiredReviewFields) {
        if (!(summary.requiredReviewFields ?? []).includes(field)) {
          violations.push({
            reason: "invalid_supporting_packet_summary",
            detail: `decision[${decisionIndex}] supportingPacketSummary command=${command} missing review field=${field}`,
          });
        }
      }
      for (const field of expectedSummary.requiredMatrixFields) {
        if (!(summary.requiredMatrixFields ?? []).includes(field)) {
          violations.push({
            reason: "invalid_supporting_packet_summary",
            detail: `decision[${decisionIndex}] supportingPacketSummary command=${command} missing matrix field=${field}`,
          });
        }
      }
      if (!String(summary.reviewRoute ?? "").trim()) {
        violations.push({
          reason: "invalid_supporting_packet_summary",
          detail: `decision[${decisionIndex}] supportingPacketSummary command=${command} missing reviewRoute`,
        });
      }
      const expectedReviewRouteJa = workflowReviewRouteTextJa(summary.reviewRoute ?? "");
      if (summary.reviewRouteJa !== expectedReviewRouteJa) {
        violations.push({
          reason: "invalid_japanese_display_field",
          detail: `decision[${decisionIndex}] supportingPacketSummary command=${command} reviewRouteJa mismatch expected=${expectedReviewRouteJa} actual=${String(summary.reviewRouteJa)}`,
        });
      }
    }
    const expectedDecisionOutcomes = requiredDecisionAllowedOutcomes(decision.blockerReason);
    if (expectedDecisionOutcomes) {
      const actual = [...(decision.allowedOutcomes ?? [])].sort();
      const expected = [...expectedDecisionOutcomes].sort();
      if (actual.join("\0") !== expected.join("\0")) {
        violations.push({
          reason: "invalid_decision_allowed_outcomes",
          detail: `decision[${decisionIndex}] top-level allowedOutcomes mismatch expected=${expected.join(",")} actual=${actual.join(",")}`,
        });
      }
    }
    const decisionRoute = decision.nextWorkflowRoute ?? "";
    const expectedDecisionRouteJa = workflowRouteTextJa(decisionRoute);
    if (decision.nextWorkflowRouteJa !== expectedDecisionRouteJa) {
      violations.push({
        reason: "invalid_japanese_display_field",
        detail: `decision[${decisionIndex}] nextWorkflowRouteJa mismatch expected=${expectedDecisionRouteJa} actual=${String(decision.nextWorkflowRouteJa)}`,
      });
    }
    if (!decisionRoute.trim() || /^(TBD|TODO|-)$/.test(decisionRoute.trim())) {
      violations.push({
        reason: "invalid_decision_next_route",
        detail: `decision[${decisionIndex}] invalid top-level route=${decisionRoute}`,
      });
    }
    const decisionRouteText = decisionRoute.toLowerCase();
    for (const expectedGuidance of requiredDecisionRouteGuidance(decision.blockerReason)) {
      if (!decisionRouteText.includes(expectedGuidance.toLowerCase())) {
        violations.push({
          reason: "invalid_decision_next_route",
          detail: `decision[${decisionIndex}] top-level route missing guidance=${expectedGuidance}`,
        });
      }
    }
    if (!Array.isArray(decision.requiredRecords) || decision.requiredRecords.length === 0) {
      violations.push({
        reason: "missing_required_records",
        detail: `decision[${decisionIndex}] planId=${decision.planId}`,
      });
      return;
    }
    if (
      !Array.isArray(decision.allowedOutcomesByRecord) ||
      decision.allowedOutcomesByRecord.length === 0
    ) {
      violations.push({
        reason: "missing_allowed_outcomes_by_record",
        detail: `decision[${decisionIndex}] planId=${decision.planId}`,
      });
    }
    if (
      !Array.isArray(decision.nextWorkflowRoutesByRecord) ||
      decision.nextWorkflowRoutesByRecord.length === 0
    ) {
      violations.push({
        reason: "missing_next_routes_by_record",
        detail: `decision[${decisionIndex}] planId=${decision.planId}`,
      });
    }
    if (!Array.isArray(decision.recordTemplates) || decision.recordTemplates.length === 0) {
      violations.push({
        reason: "missing_record_templates",
        detail: `decision[${decisionIndex}] planId=${decision.planId}`,
      });
    }
    const expectedRecordNames = requiredRecordsForBlockers([
      decision.blockerReason,
      ...(decision.blockers ?? []),
    ]).map((record) => record.recordName);
    const requiredRecordNames = decision.requiredRecords.map((record) => record.recordName);
    rejectDuplicateOrExtraRecordEntries({
      violations,
      subject: `decision[${decisionIndex}].requiredRecords`,
      reason: "invalid_required_record",
      requiredRecordNames: expectedRecordNames,
      actualRecordNames: requiredRecordNames,
    });
    rejectDuplicateOrExtraRecordEntries({
      violations,
      subject: `decision[${decisionIndex}].allowedOutcomesByRecord`,
      reason: "invalid_allowed_outcomes_by_record",
      requiredRecordNames: expectedRecordNames,
      actualRecordNames: (decision.allowedOutcomesByRecord ?? []).map((entry) => entry.recordName),
    });
    rejectDuplicateOrExtraRecordEntries({
      violations,
      subject: `decision[${decisionIndex}].nextWorkflowRoutesByRecord`,
      reason: "invalid_next_routes_by_record",
      requiredRecordNames: expectedRecordNames,
      actualRecordNames: (decision.nextWorkflowRoutesByRecord ?? []).map(
        (entry) => entry.recordName,
      ),
    });
    rejectDuplicateOrExtraRecordEntries({
      violations,
      subject: `decision[${decisionIndex}].recordTemplates`,
      reason: "invalid_record_template",
      requiredRecordNames: expectedRecordNames,
      actualRecordNames: (decision.recordTemplates ?? []).map((entry) => entry.recordName),
    });
    decision.requiredRecords.forEach((record, recordIndex) => {
      const subject = `decision[${decisionIndex}].requiredRecords[${recordIndex}]`;
      if (!record.recordName?.trim()) {
        violations.push({
          reason: "invalid_required_record",
          detail: `${subject} missing recordName`,
        });
      }
      if (!Array.isArray(record.fields) || record.fields.length === 0) {
        violations.push({
          reason: "invalid_required_record",
          detail: `${subject} missing fields`,
        });
      } else {
        for (const field of record.fields) {
          if (!field.trim() || /^(TBD|TODO|-)$/.test(field.trim())) {
            violations.push({
              reason: "invalid_required_record",
              detail: `${subject} invalid field=${field}`,
            });
          }
        }
      }
      if (!Array.isArray(record.sourcePaths) || record.sourcePaths.length === 0) {
        violations.push({
          reason: "invalid_required_record",
          detail: `${subject} missing sourcePaths`,
        });
      } else {
        for (const sourcePath of record.sourcePaths) {
          const trimmed = sourcePath.trim();
          if (!trimmed || /^(TBD|TODO|-)$/.test(trimmed)) {
            violations.push({
              reason: "invalid_required_record",
              detail: `${subject} invalid sourcePath=${sourcePath}`,
            });
          } else if (unsafeRepoRelativePath(trimmed)) {
            violations.push({
              reason: "invalid_required_record_source_path",
              detail: `${subject} sourcePath must be repo-relative=${trimmed}`,
            });
          } else if (opts.sourcePathExists && !opts.sourcePathExists(trimmed)) {
            violations.push({
              reason: "invalid_required_record_source_path",
              detail: `${subject} sourcePath missing=${trimmed}`,
            });
          }
        }
      }
      for (const sourceLedgerCheck of record.sourceLedgerChecks ?? []) {
        const sourcePath = sourceLedgerCheck.sourcePath.trim();
        const ledgerLabel = sourceLedgerCheck.ledgerLabel.trim();
        if (!sourcePath || !ledgerLabel || unsafeRepoRelativePath(sourcePath)) {
          violations.push({
            reason: "invalid_required_record_source_ledger",
            detail: `${subject} invalid sourceLedgerCheck=${sourceLedgerCheck.sourcePath}:${sourceLedgerCheck.ledgerLabel}`,
          });
          continue;
        }
        if (!record.sourcePaths.includes(sourcePath)) {
          violations.push({
            reason: "invalid_required_record_source_ledger",
            detail: `${subject} sourceLedgerCheck sourcePath not in sourcePaths=${sourcePath}`,
          });
        }
        if (!opts.sourceText) continue;
        const sourceText = opts.sourceText(sourcePath);
        if (sourceText == null) {
          violations.push({
            reason: "invalid_required_record_source_ledger",
            detail: `${subject} sourceLedger sourcePath missing=${sourcePath}`,
          });
          continue;
        }
        if (!hasSourceLedgerCheckedDate(sourceText, ledgerLabel)) {
          violations.push({
            reason: "invalid_required_record_source_ledger",
            detail: `${subject} sourceLedger missing checked date label=${ledgerLabel} sourcePath=${sourcePath}`,
          });
          continue;
        }
        const sourceLedgerViolation = sourceLedgerCheckedDateViolation(
          sourceText,
          ledgerLabel,
          now,
        );
        if (sourceLedgerViolation) {
          violations.push({
            reason: "invalid_required_record_source_ledger",
            detail: `${subject} ${sourceLedgerViolation} sourcePath=${sourcePath}`,
          });
        }
      }
    });
    const outcomeRecords = new Map(
      (decision.allowedOutcomesByRecord ?? []).map((entry) => [entry.recordName, entry]),
    );
    const routeRecords = new Map(
      (decision.nextWorkflowRoutesByRecord ?? []).map((entry) => [entry.recordName, entry]),
    );
    const templateRecords = new Map(
      (decision.recordTemplates ?? []).map((entry) => [entry.recordName, entry]),
    );
    for (const record of decision.requiredRecords) {
      const outcome = outcomeRecords.get(record.recordName);
      if (!outcome) {
        violations.push({
          reason: "invalid_allowed_outcomes_by_record",
          detail: `decision[${decisionIndex}] missing outcomes for ${record.recordName}`,
        });
        continue;
      }
      if (!Array.isArray(outcome.allowedOutcomes) || outcome.allowedOutcomes.length === 0) {
        violations.push({
          reason: "invalid_allowed_outcomes_by_record",
          detail: `decision[${decisionIndex}] ${record.recordName} missing allowedOutcomes`,
        });
        continue;
      }
      for (const allowedOutcome of outcome.allowedOutcomes) {
        if (!allowedOutcome.trim() || /^(TBD|TODO|-)$/.test(allowedOutcome.trim())) {
          violations.push({
            reason: "invalid_allowed_outcomes_by_record",
            detail: `decision[${decisionIndex}] ${record.recordName} invalid outcome=${allowedOutcome}`,
          });
        }
      }
      const expectedOutcomes = requiredAllowedOutcomes(record.recordName);
      if (expectedOutcomes) {
        const actual = [...outcome.allowedOutcomes].sort();
        const expected = [...expectedOutcomes].sort();
        if (actual.join("\0") !== expected.join("\0")) {
          violations.push({
            reason: "invalid_allowed_outcomes_by_record",
            detail: `decision[${decisionIndex}] ${record.recordName} allowedOutcomes mismatch expected=${expected.join(",")} actual=${actual.join(",")}`,
          });
        }
      }
      const route = routeRecords.get(record.recordName);
      if (!route) {
        violations.push({
          reason: "invalid_next_routes_by_record",
          detail: `decision[${decisionIndex}] missing route for ${record.recordName}`,
        });
        continue;
      }
      const nextWorkflowRoute = route.nextWorkflowRoute ?? "";
      if (!nextWorkflowRoute.trim() || /^(TBD|TODO|-)$/.test(nextWorkflowRoute.trim())) {
        violations.push({
          reason: "invalid_next_routes_by_record",
          detail: `decision[${decisionIndex}] ${record.recordName} invalid route=${nextWorkflowRoute}`,
        });
      }
      const routeText = nextWorkflowRoute.toLowerCase();
      for (const expectedGuidance of requiredRouteGuidance(record.recordName)) {
        if (!routeText.includes(expectedGuidance.toLowerCase())) {
          violations.push({
            reason: "invalid_next_routes_by_record",
            detail: `decision[${decisionIndex}] ${record.recordName} route missing guidance=${expectedGuidance}`,
          });
        }
      }
      violations.push(
        ...recordTemplateContractViolations({
          subject: `decision[${decisionIndex}]`,
          requiredRecords: [record],
          recordTemplates: templateRecords.has(record.recordName)
            ? [templateRecords.get(record.recordName) as CompletionDecisionRecordTemplate]
            : [],
        }).map((violation) => ({
          reason: "invalid_record_template" as const,
          detail: violation.reason,
        })),
      );
    }
  });

  return {
    ok: violations.length === 0,
    status: packet.status ?? "unknown",
    decisionCount: packet.decisionCount ?? packet.decisions?.length ?? 0,
    sourceCommand: packet.sourceCommand ?? "",
    validForMinutes: Number.isFinite(validForMinutes) ? validForMinutes : 0,
    stale: computedStale,
    expiresAt,
    violations,
  };
}

export function recordTemplateContractViolations(input: {
  subject: string;
  requiredRecords: CompletionDecisionRecordRequirement[];
  recordTemplates: CompletionDecisionRecordTemplate[];
}): RecordTemplateContractViolation[] {
  const violations: RecordTemplateContractViolation[] = [];
  const expectedRecordNames = input.requiredRecords.map((record) => record.recordName);
  const actualRecordNames = input.recordTemplates.map((template) => template.recordName);
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const recordName of actualRecordNames) {
    if (seen.has(recordName)) duplicates.add(recordName);
    seen.add(recordName);
  }
  for (const duplicate of [...duplicates].sort()) {
    violations.push({
      subject: input.subject,
      reason: `${input.subject}.recordTemplates duplicate recordName=${duplicate}`,
    });
  }
  const expected = new Set(expectedRecordNames);
  for (const recordName of [...expected].sort()) {
    if (!seen.has(recordName)) {
      violations.push({
        subject: input.subject,
        reason: `${input.subject}.recordTemplates missing recordName=${recordName}`,
      });
    }
  }
  for (const recordName of [...seen].sort()) {
    if (!expected.has(recordName)) {
      violations.push({
        subject: input.subject,
        reason: `${input.subject}.recordTemplates unexpected recordName=${recordName}`,
      });
    }
  }

  const templateRecords = new Map(input.recordTemplates.map((entry) => [entry.recordName, entry]));
  for (const record of input.requiredRecords) {
    const template = templateRecords.get(record.recordName);
    if (!template) continue;
    if (!template.insertionHint?.trim() || /^(TBD|TODO|-)$/.test(template.insertionHint.trim())) {
      violations.push({
        subject: input.subject,
        reason: `${input.subject} ${record.recordName} invalid insertionHint`,
      });
    }
    if (
      !template.insertionHintJa?.trim() ||
      /^(TBD|TODO|-)$/.test(template.insertionHintJa.trim()) ||
      !JAPANESE_GUIDANCE_PATTERN.test(template.insertionHintJa)
    ) {
      violations.push({
        subject: input.subject,
        reason: `${input.subject} ${record.recordName} invalid insertionHintJa`,
      });
    }
    if (!Array.isArray(template.yamlLines) || template.yamlLines.length === 0) {
      violations.push({
        subject: input.subject,
        reason: `${input.subject} ${record.recordName} missing yamlLines`,
      });
      continue;
    }
    if (!Array.isArray(template.yamlLinesJa) || template.yamlLinesJa.length === 0) {
      violations.push({
        subject: input.subject,
        reason: `${input.subject} ${record.recordName} missing yamlLinesJa`,
      });
    } else {
      if (template.yamlLinesJa[0]?.trim() !== `${record.recordName}:`) {
        violations.push({
          subject: input.subject,
          reason: `${input.subject} ${record.recordName} template ja header mismatch`,
        });
      }
      const templateTextJa = template.yamlLinesJa.join("\n");
      for (const field of record.fields) {
        if (!templateTextJa.includes(`- ${field}:`)) {
          violations.push({
            subject: input.subject,
            reason: `${input.subject} ${record.recordName} template ja missing field=${field}`,
          });
        }
      }
      if (!JAPANESE_GUIDANCE_PATTERN.test(templateTextJa)) {
        violations.push({
          subject: input.subject,
          reason: `${input.subject} ${record.recordName} yamlLinesJa lacks Japanese guidance`,
        });
      }
    }
    if (template.yamlLines[0]?.trim() !== `${record.recordName}:`) {
      violations.push({
        subject: input.subject,
        reason: `${input.subject} ${record.recordName} template header mismatch`,
      });
    }
    const templateText = template.yamlLines.join("\n");
    for (const field of record.fields) {
      if (!templateText.includes(`- ${field}:`)) {
        violations.push({
          subject: input.subject,
          reason: `${input.subject} ${record.recordName} template missing field=${field}`,
        });
      }
    }
    const guidanceText = `${template.insertionHint}\n${templateText}`.toLowerCase();
    for (const expectedGuidance of requiredTemplateGuidance(record.recordName)) {
      if (!guidanceText.includes(expectedGuidance.toLowerCase())) {
        violations.push({
          subject: input.subject,
          reason: `${input.subject} ${record.recordName} template missing guidance=${expectedGuidance}`,
        });
      }
    }
  }
  return violations;
}

function requiredDecisionKind(blockerReason: string): string {
  switch (blockerReason) {
    case "po_decision_pending":
      return "po_s4_decision";
    case "version_up_parked":
      return "version_up_activation";
    case "irreversible_migration_pending":
      return "irreversible_migration_signoff";
    case "human_approval_pending":
      return "human_action_approval";
    default:
      return "workflow_continuation";
  }
}

function requiredDecisionPacketCommand(blockerReason: string): string {
  switch (blockerReason) {
    case "po_decision_pending":
      return "ut-tdd s4 decision-packet --json";
    case "version_up_parked":
      return "ut-tdd version-up activation-packet --json";
    case "irreversible_migration_pending":
      return "ut-tdd rename plan --json";
    case "human_approval_pending":
      return "ut-tdd action-binding approval-packet --json";
    default:
      return "ut-tdd completion decision-packet --json";
  }
}

function requiredPacketCommands(blockerReason: string, blockers: string[] = []): string[] {
  const commands = [
    ...new Set([
      requiredDecisionPacketCommand(blockerReason),
      ...blockers.map((blocker) => requiredDecisionPacketCommand(blocker)),
    ]),
  ];
  if (
    blockerReason === "irreversible_migration_pending" ||
    blockers.includes("irreversible_migration_pending")
  ) {
    const renamePlanIndex = commands.indexOf("ut-tdd rename plan --json");
    const insertIndex = renamePlanIndex >= 0 ? renamePlanIndex + 1 : commands.length;
    commands.splice(insertIndex, 0, "ut-tdd rename approval-draft --json");
  }
  return [...new Set(commands)];
}

function scopedDecisionPacketCommandForPlan(planId: string, command: string): string {
  switch (command) {
    case "ut-tdd s4 decision-packet --json":
    case "ut-tdd version-up activation-packet --json":
    case "ut-tdd action-binding approval-packet --json":
      return `${command} --plan ${planId}`;
    case "ut-tdd rename approval-draft --json":
      return command;
    default:
      return command;
  }
}

function requiredSupportingPacketSummary(command: string): {
  schemaVersion: string;
  matrixField: string;
  expectedMatrixCount: number;
  requiredReviewFields: string[];
  requiredMatrixFields: string[];
} {
  switch (command) {
    case "ut-tdd s4 decision-packet --json":
      return {
        schemaVersion: "s4-decision-packet.v1",
        matrixField: "decisionVerificationCommandMatrix",
        expectedMatrixCount: 8,
        requiredReviewFields: [
          "planOnly",
          "mustNotDecide",
          "decisionCommandAvailable",
          "decisionAllowed",
          "allowedOutcomes",
          "decisionRecord",
          "decisionRecord.allowed_outcome",
          "decisionRecord.decision_owner",
          "decisionRecord.decision_basis",
          "decisionRecord.verified_evidence",
          "decisionRecord.stakeholder_review_or_proxy",
          "decisionRecord.acceptance_gap",
          "decisionRecord.unresolved_risk",
          "decisionRecord.external_source_basis",
          "decisionRecord.route_impact",
          "decisionRecord.forward_route",
          "decisionRecord.reverse_fullback_required",
          "decisionRecord.promotion_strategy_or_rejection_pivot_rationale",
          "decisionRecord.source_ledger_freshness",
          "decisionRecord.source_status_delta",
          "decisionRecord.adoption_decision_delta",
          "decisionRecord.workflow_route_impact",
          "recordTemplates",
          "decisionEvidenceChecklist",
          "decisionEvidenceChecklist.verified_evidence",
          "decisionEvidenceChecklist.stakeholder_review_or_proxy",
          "decisionEvidenceChecklist.acceptance_gap",
          "decisionEvidenceChecklist.unresolved_risk",
          "decisionEvidenceChecklist.external_source_basis",
          "decisionEvidenceChecklist.route_impact",
          "outcomeRouteMatrix",
          "outcomeRouteMatrix.outcome",
          "outcomeRouteMatrix.terminalStatus",
          "outcomeRouteMatrix.routePolicy",
          "outcomeRouteMatrix.requiredEvidence",
          "semanticFeatureFrontierRecord",
          "provenanceRequirements",
          "provenanceRequirements.item",
          "provenanceRequirements.evidence",
          "decisionVerificationCommandMatrix",
          "decisionVerificationCommandMatrix.phase",
          "decisionVerificationCommandMatrix.command",
          "decisionVerificationCommandMatrix.writePolicy",
          "decisionVerificationCommandMatrix.expected",
          "decisionVerificationCommandMatrix.evidence",
          "relatedDecisionPackets",
          "relatedDecisionPackets.scopedCommand",
          "nextWorkflowRoutes",
          "nextWorkflowRoutes.outcome",
          "nextWorkflowRoutes.route",
          "blockedReasons",
        ],
        requiredMatrixFields: [...REQUIRED_DECISION_PACKET_MATRIX_FIELDS],
      };
    case "ut-tdd version-up activation-packet --json":
      return {
        schemaVersion: "version-up-activation-packet.v1",
        matrixField: "activationVerificationCommandMatrix",
        expectedMatrixCount: 9,
        requiredReviewFields: [
          "semanticFeatureFrontierRecord",
          "activationDecision",
          "activationDecision.allowed_outcome",
          "activationDecision.target_version_or_release_trigger",
          "activationDecision.activation_snapshot_id",
          "activationDecision.activation_route",
          "activationDecision.review_by",
          "activationDecision.approval_scope",
          "activationDecision.dry_run_plan",
          "activationDecision.rollback_plan",
          "activationDecision.source_ledger_freshness",
          "activationDecision.source_status_delta",
          "activationDecision.adoption_decision_delta",
          "activationDecision.workflow_route_impact",
          "parkedReview",
          "parkedReview.review_owner",
          "parkedReview.review_trigger",
          "parkedReview.review_by_policy",
          "parkedReview.stale_action",
          "parkedReview.activation_dependency",
          "parkedReview.decision_packet_route",
          "actionBindingApproval",
          "recordTemplates",
          "activationReadinessSummary",
          "activationReadinessSummary.status",
          "activationReadinessSummary.pendingChecks",
          "activationReadinessSummary.pendingCheckNames",
          "activationReadinessSummary.sourceLedgerFresh",
          "activationReadinessSummary.activationAllowed",
          "activationReadinessChecks",
          "activationReadinessChecks.check",
          "activationReadinessChecks.status",
          "activationReadinessChecks.evidence",
          "activationReadinessChecks.reason",
          "activationSnapshot",
          "activationSnapshot.snapshotId",
          "activationSnapshot.headBound",
          "activationSnapshot.materialBound",
          "activationSnapshot.validationStatus",
          "activationSnapshot.planTextDigest",
          "activationSnapshot.sourceLedgerRowsDigest",
          "activationSnapshot.approvalScopeDigest",
          "activationSnapshot.versionDryRunDigest",
          "activationSnapshot.evidenceDigest",
          "activationSnapshot.invalidatedBy",
          "externalRehearsalPlan",
          "externalRehearsalPlan.check",
          "externalRehearsalPlan.evidence",
          "externalRehearsalPlan.source",
          "costGuardrails",
          "costGuardrails.surface",
          "costGuardrails.freeLimit",
          "costGuardrails.activationImpact",
          "costGuardrails.source",
          "provenanceRequirements",
          "provenanceRequirements.item",
          "provenanceRequirements.evidence",
          "sourceLedgerFreshness",
          "sourceLedgerFreshness.checkedDate",
          "sourceLedgerFreshness.stale",
          "sourceLedgerFreshness.violation",
          "sourceLedgerFreshness.missingRows",
          "sourceLedgerFreshness.rowsDigest",
          "versionDryRunEvidence",
          "versionDryRunEvidence.command",
          "versionDryRunEvidence.planCommand",
          "versionDryRunEvidence.digest",
          "versionDryRunEvidence.ok",
          "versionDryRunEvidence.semverChange",
          "versionDryRunEvidence.releaseTagRef",
          "versionDryRunEvidence.releaseTagSource",
          "versionDryRunEvidence.releaseTagExists",
          "versionDryRunEvidence.releaseTriggerResolved",
          "versionDryRunEvidence.blockedReasons",
          "securityChecklistPacket.securityChecks",
          "securityChecklistPacket.securityChecks.check",
          "securityChecklistPacket.securityChecks.status",
          "securityChecklistPacket.securityChecks.evidence",
          "securityChecklistPacket.securityChecks.reason",
          "securityChecklistPacket.securityChecks.requiredEvidence",
          "securityChecklistPacket.securityChecks.sourceCheckedAt",
          "securityChecklistPacket.securityChecks.latestOfficialStatus",
          "securityChecklistPacket.securityChecks.sourceStatusDelta",
          "securityChecklistPacket.securityChecks.adoptionDecision",
          "securityChecklistPacket.securityChecks.adoptionDecisionDelta",
          "securityChecklistPacket.securityChecks.workflowRouteImpact",
          "reapprovalTriggers",
          "reapprovalTriggers.trigger",
          "reapprovalTriggers.invalidates",
          "reapprovalTriggers.requiredAction",
          "reapprovalTriggers.source",
          "relatedDecisionPackets",
          "nextWorkflowRoutes",
          "blockedReasons",
        ],
        requiredMatrixFields: [...REQUIRED_DECISION_PACKET_MATRIX_FIELDS],
      };
    case "ut-tdd rename plan --json":
      return {
        schemaVersion: "identifier-rename-cutover-plan.v1",
        matrixField: "verificationCommandMatrix",
        expectedMatrixCount: 10,
        requiredReviewFields: [
          "semanticFeatureFrontierRecord",
          "recordTemplates",
          "cutoverSnapshot",
          "cutoverSnapshot.snapshotId",
          "cutoverSnapshot.repoHeadSha",
          "cutoverSnapshot.headDigest",
          "cutoverSnapshot.worktreeStatusReadable",
          "cutoverSnapshot.worktreeClean",
          "cutoverSnapshot.worktreeStatusDigest",
          "cutoverSnapshot.worktreeDirtyPathCount",
          "cutoverSnapshot.worktreeDirtyPaths",
          "cutoverSnapshot.blastRadiusDigest",
          "cutoverSnapshot.approvalScopeDigest",
          "cutoverSnapshot.evidenceDigest",
          "cutoverSnapshot.evidenceArtifactsDigest",
          "cutoverSnapshot.evidenceArtifactsRequired",
          "cutoverSnapshot.evidenceArtifactsPresent",
          "cutoverSnapshot.missingEvidenceArtifacts",
          "cutoverSnapshot.evidenceArtifacts",
          "cutoverSnapshot.evidenceArtifacts.path",
          "cutoverSnapshot.evidenceArtifacts.sha256",
          "cutoverSnapshot.sourceLedgerCheckedDate",
          "cutoverSnapshot.sourceLedgerRowsDigest",
          "cutoverSnapshot.invalidatedBy",
          "snapshotReview",
          "snapshotReview.recordedCutoverSnapshotId",
          "snapshotReview.recordedActionBindingSnapshotId",
          "snapshotReview.currentSnapshotId",
          "snapshotReview.cutoverSnapshotMatchesCurrent",
          "snapshotReview.actionBindingSnapshotMatchesCurrent",
          "snapshotReview.driftWarning",
          "snapshotReview.requiredAction",
          "cutoverCategoryChecklist",
          "cutoverCategoryChecklist.category",
          "cutoverCategoryChecklist.samplePaths",
          "cutoverCategoryChecklist.cutoverAction",
          "cutoverCategoryChecklist.verificationCommand",
          "sourceLedgerFreshness",
          "sourceLedgerFreshness.checkedDate",
          "sourceLedgerFreshness.stale",
          "sourceLedgerFreshness.violation",
          "sourceLedgerFreshness.missingRows",
          "sourceLedgerFreshness.rowsDigest",
          "cutoverRunbook",
          "cutoverRunbook.phase",
          "cutoverRunbook.command",
          "cutoverRunbook.writePolicy",
          "cutoverRunbook.evidencePath",
          "cutoverRunbook.passCriteria",
          "cutoverRunbook.rollbackCheck",
          "cutoverRunbook.source",
          "cutoverRunbook.sourceUrl",
          "dryRunPlan",
          "rollbackPlan",
          "monitoringPlan",
          "stateBackupManifest",
          "stateBackupManifest.path",
          "stateBackupManifest.backupTargetPattern",
          "stateBackupManifest.restoreEvidencePath",
          "stateBackupManifest.checksumRequired",
          "stateBackupManifest.restoreDrillRequired",
          "stateBackupManifest.restoreRequired",
          "freezePolicy",
          "freezePolicy.requiresFrozenHead",
          "freezePolicy.requiresQuietWindow",
          "freezePolicy.concurrencyPolicy",
          "freezePolicy.reapprovalTriggers",
          "provenanceRequirements",
          "provenanceRequirements.item",
          "provenanceRequirements.evidence",
          "relatedDecisionPackets",
          "approvalGate",
          "approvalGate.requiredRecords",
          "approvalGate.requiredDecision",
          "approvalGate.requiredActionBinding",
          "approvalGate.approvedActorRequired",
          "approvalGate.approvedToolRequired",
          "approvalGate.approvedTargetRequired",
          "approvalGate.approvedParamsRequired",
          "approvalGate.reviewedSnapshotBindingRequired",
          "blockedReasons",
        ],
        requiredMatrixFields: [...REQUIRED_DECISION_PACKET_MATRIX_FIELDS],
      };
    case "ut-tdd rename approval-draft --json":
      return {
        schemaVersion: "identifier-rename-approval-draft.v1",
        matrixField: "none",
        expectedMatrixCount: 0,
        requiredReviewFields: [
          "planOnly",
          "mustNotApply",
          "approvalCommandAvailable",
          "approvalAllowed",
          "applyAuthorized",
          "targetPlanId",
          "targetCli",
          "targetStateDir",
          "recommendedOutcome",
          "readiness",
          "readiness.evidenceComplete",
          "readiness.worktreeClean",
          "readiness.sourceLedgerFresh",
          "readiness.sourceLedgerComplete",
          "readiness.approvalRecordsConcrete",
          "readiness.blockedReasonCount",
          "currentSnapshot",
          "currentSnapshot.cutoverSnapshotId",
          "currentSnapshot.repoHeadSha",
          "currentSnapshot.worktreeClean",
          "currentSnapshot.worktreeDirtyPathCount",
          "currentSnapshot.worktreeDirtyPaths",
          "currentSnapshot.evidenceArtifactsRequired",
          "currentSnapshot.evidenceArtifactsPresent",
          "currentSnapshot.missingEvidenceArtifacts",
          "currentSnapshot.blastRadiusDigest",
          "currentSnapshot.approvalScopeDigest",
          "currentSnapshot.evidenceDigest",
          "currentSnapshot.evidenceArtifactsDigest",
          "currentSnapshot.sourceLedgerCheckedDate",
          "currentSnapshot.sourceLedgerRowsDigest",
          "draftRecords",
          "draftRecords.recordName",
          "draftRecords.pasteReady",
          "draftRecords.unsafeToTreatAsApproval",
          "draftRecords.insertionHintJa",
          "draftRecords.yamlLines",
          "blockedUntil",
          "relatedDecisionPackets",
          "relatedDecisionPackets.scopedCommand",
        ],
        requiredMatrixFields: [],
      };
    case "ut-tdd action-binding approval-packet --json":
      return {
        schemaVersion: "action-binding-approval-packet.v1",
        matrixField: "approvalVerificationCommandMatrix",
        expectedMatrixCount: 10,
        requiredReviewFields: [
          "planOnly",
          "mustNotApprove",
          "approvalCommandAvailable",
          "approvalAllowed",
          "allowedOutcomes",
          "approvalRecord",
          "approvalRecord.allowed_outcome",
          "approvalRecord.approval_policy_or_named_approver",
          "approvalRecord.approval_scope",
          "approvalRecord.approved_actor",
          "approvalRecord.approved_tool",
          "approvalRecord.approved_target",
          "approvalRecord.approved_params",
          "approvalRecord.review_approval_evidence",
          "approvalRecord.reviewed_snapshot_binding",
          "approvalRecord.expires_at_or_trigger",
          "approvalRecord.audit_record",
          "approvalSnapshot",
          "approvalSnapshot.snapshotId",
          "approvalSnapshot.planTextDigest",
          "approvalSnapshot.approvalScopeDigest",
          "approvalSnapshot.reviewEvidenceDigest",
          "approvalSnapshot.auditDigest",
          "approvalSnapshot.siblingDecisionPacketDigest",
          "approvalSnapshot.reviewedSnapshotId",
          "approvalSnapshot.reviewedSnapshotKind",
          "approvalSnapshot.headSha",
          "approvalSnapshot.invalidatedBy",
          "recordTemplates",
          "approvalBindingChecks",
          "approvalBindingChecks.allowed_outcome",
          "approvalBindingChecks.approval_scope",
          "approvalBindingChecks.approved_actor",
          "approvalBindingChecks.approved_tool",
          "approvalBindingChecks.approved_target",
          "approvalBindingChecks.approved_params",
          "approvalBindingChecks.review_approval_evidence",
          "approvalBindingChecks.reviewed_snapshot_binding",
          "approvalBindingChecks.expires_at_or_trigger",
          "approvalBindingChecks.audit_record",
          "approvalBindingChecks.field",
          "approvalBindingChecks.status",
          "approvalBindingChecks.value",
          "approvalBindingChecks.reason",
          "approvalBindingChecks.requiredAction",
          "approvalVerificationCommandMatrix",
          "approvalVerificationCommandMatrix.phase",
          "approvalVerificationCommandMatrix.command",
          "approvalVerificationCommandMatrix.writePolicy",
          "approvalVerificationCommandMatrix.expected",
          "approvalVerificationCommandMatrix.evidence",
          "semanticFeatureFrontierRecords",
          "relatedDecisionPackets",
          "relatedDecisionPackets.scopedCommand",
          "nextWorkflowRoutes",
          "nextWorkflowRoutes.outcome",
          "nextWorkflowRoutes.route",
          "blockedReasons",
        ],
        requiredMatrixFields: [...REQUIRED_DECISION_PACKET_MATRIX_FIELDS],
      };
    default:
      return {
        schemaVersion: "completion-decision-packet.v1",
        matrixField: "none",
        expectedMatrixCount: 0,
        requiredReviewFields: ["requiredRecords", "recordTemplates", "packetCommands"],
        requiredMatrixFields: [],
      };
  }
}

function requiredDecisionAllowedOutcomes(blockerReason: string): string[] | null {
  switch (blockerReason) {
    case "po_decision_pending":
      return ["confirmed", "rejected", "pivot"];
    case "version_up_parked":
      return ["activate_future_version", "reject_or_archive", "keep_parked_with_review_date"];
    case "irreversible_migration_pending":
      return ["approve_cutover", "reject_or_defer", "request_runbook_changes"];
    case "human_approval_pending":
      return ["approve_action_binding", "deny_action", "request_scope_reduction"];
    case "active_draft":
      return ["continue_workflow", "mark_terminal_after_required_evidence"];
    default:
      return null;
  }
}

function requiredDecisionRouteGuidance(blockerReason: string): string[] {
  switch (blockerReason) {
    case "po_decision_pending":
      return ["S4 decide", "Reverse/Forward", "decision_outcome"];
    case "version_up_parked":
      return ["version-up activation", "add-feature", "approval boundary"];
    case "irreversible_migration_pending":
      return ["L14 cutover", "cutover_decision_record", "dry-run", "rollback"];
    case "human_approval_pending":
      return ["approval gate", "action-binding approval", "audit"];
    default:
      return ["continue current workflow phase", "terminal evidence"];
  }
}

function rejectDuplicateOrExtraRecordEntries(input: {
  violations: CompletionDecisionPacketViolation[];
  subject: string;
  reason: CompletionDecisionPacketViolationReason;
  requiredRecordNames: string[];
  actualRecordNames: string[];
}): void {
  const { actualRecordNames, reason, requiredRecordNames, subject, violations } = input;
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const recordName of actualRecordNames) {
    if (seen.has(recordName)) duplicates.add(recordName);
    seen.add(recordName);
  }
  for (const duplicate of [...duplicates].sort()) {
    violations.push({
      reason,
      detail: `${subject} duplicate recordName=${duplicate}`,
    });
  }

  const required = new Set(requiredRecordNames);
  for (const recordName of [...required].sort()) {
    if (!seen.has(recordName)) {
      violations.push({
        reason,
        detail: `${subject} missing recordName=${recordName}`,
      });
    }
  }
  for (const recordName of [...seen].sort()) {
    if (!required.has(recordName)) {
      violations.push({
        reason,
        detail: `${subject} unexpected recordName=${recordName}`,
      });
    }
  }
}

function requiredAllowedOutcomes(recordName: string): string[] | null {
  switch (recordName) {
    case "s4_decision_record":
      return ["confirmed", "rejected", "pivot"];
    case "activation_decision_record":
      return ["activate_future_version", "reject_or_archive", "keep_parked_with_review_date"];
    case "parked_review_record":
      return ["review_scheduled", "mark_stale", "route_to_activation_decision"];
    case "external_rehearsal_plan":
      return ["evidence_present", "pending_evidence", "request_scope_reduction"];
    case "cost_guardrails":
      return ["within_guardrails", "pending_limits", "request_scope_reduction"];
    case "activation_provenance_requirements":
      return ["provenance_complete", "pending_evidence", "deny_activation"];
    case "cutover_decision_record":
      return ["approve_cutover", "reject_or_defer", "request_runbook_changes"];
    case "action_binding_approval_record":
      return ["approve_action_binding", "deny_action", "request_scope_reduction"];
    case "terminal_evidence_record":
      return ["continue_workflow", "mark_terminal_after_required_evidence"];
    default:
      return null;
  }
}

function requiredRouteGuidance(recordName: string): string[] {
  switch (recordName) {
    case "s4_decision_record":
      return ["S4 decide", "decision_outcome", "Forward", "rejected backlog", "pivot"];
    case "activation_decision_record":
      return [
        "version-up activation",
        "activationSnapshot.snapshotId",
        "add-feature",
        "Forward",
        "reject/archive",
        "review_by",
      ];
    case "parked_review_record":
      return [
        "version-up parked review",
        "schedule review",
        "mark stale",
        "activation_decision_record",
      ];
    case "external_rehearsal_plan":
      return [
        "version-up external rehearsal",
        "official source basis",
        "no-prod-write",
        "rollback",
      ];
    case "cost_guardrails":
      return ["version-up cost guardrails", "provider limits", "exceed_action", "reduce scope"];
    case "activation_provenance_requirements":
      return ["version-up provenance", "source ledger", "dry-run", "approval", "audit"];
    case "cutover_decision_record":
      return [
        "L14 cutover decision",
        "cutoverSnapshot.snapshotId",
        "approve_cutover",
        "reject/defer",
        "request runbook changes",
      ];
    case "action_binding_approval_record":
      return [
        "action-binding approval gate",
        "reviewed_snapshot_binding",
        "actor/tool/target/params",
        "deny action",
        "reduce scope",
      ];
    case "terminal_evidence_record":
      return ["workflow continuation", "terminal evidence", "green commands"];
    default:
      return [];
  }
}

function requiredTemplateGuidance(recordName: string): string[] {
  switch (recordName) {
    case "s4_decision_record":
      return ["confirmed", "rejected", "pivot", "forward", "reverse", "archive", "route_impact"];
    case "activation_decision_record":
      return [
        "activationSnapshot.snapshotId",
        "add-feature",
        "forward",
        "reject/archive",
        "review_by",
        "dry-run",
        "rollback",
      ];
    case "parked_review_record":
      return [
        "review_owner",
        "review_trigger",
        "stale_action",
        "completion/status decision packet",
      ];
    case "external_rehearsal_plan":
      return [
        "official source basis",
        "free-tier budget",
        "webhook signature",
        "access control",
        "no-production-write",
        "rollback rehearsal",
      ];
    case "cost_guardrails":
      return ["free-tier limits", "Pages/Workers/D1/KV", "exceed_action", "scope reduction"];
    case "activation_provenance_requirements":
      return ["source ledger", "dry-run evidence", "approval evidence", "audit record"];
    case "cutover_decision_record":
      return [
        "frozen head",
        "cutoverSnapshot.snapshotId",
        "quiet window",
        "single-run",
        "drift re-approval",
        "dry-run",
        "branch/tag rollback",
        "state backup",
        "smoke/doctor/status",
      ];
    case "action_binding_approval_record":
      return [
        "limited",
        "actor/tool/target/params",
        "dry-run",
        "risk",
        "reviewed snapshot binding",
        "expiry",
        "approver/action/result/incident",
      ];
    case "terminal_evidence_record":
      return ["artifacts", "review_evidence", "green_commands"];
    default:
      return [];
  }
}

export function loadCompletionDecisionPacketInput(
  repoRoot: string,
  now: string = new Date().toISOString(),
): CompletionDecisionPacket {
  return completionDecisionPacketForOutstanding(computeOutstandingWork(repoRoot), {
    generatedAt: now,
    now,
    sourceCommand: "ut-tdd completion decision-packet --json",
  });
}

export function loadCompletionReviewBundleInput(
  repoRoot: string,
  now: string = new Date().toISOString(),
): CompletionReviewBundle {
  return completionReviewBundleForOutstanding(computeOutstandingWork(repoRoot), {
    generatedAt: now,
    now,
  });
}

export function analyzeCompletionReviewBundle(
  bundle: CompletionReviewBundle,
  decisionPacket: CompletionDecisionPacket,
  now: string = new Date().toISOString(),
): CompletionReviewBundleLintResult {
  const violations: CompletionReviewBundleViolation[] = [];
  const generatedAt = bundle.generatedAt;
  const generatedMs = Date.parse(generatedAt ?? "");
  const nowMs = Date.parse(now);
  const validForMinutes = bundle.freshness?.validForMinutes;
  const expiresAt = bundle.freshness?.expiresAt ?? "";
  const expiresMs = Date.parse(expiresAt);

  if (bundle.schemaVersion !== "completion-review-bundle.v1") {
    violations.push({
      reason: "invalid_schema_version",
      detail: `schemaVersion=${String(bundle.schemaVersion)} expected=completion-review-bundle.v1`,
    });
  }
  if (!generatedAt) {
    violations.push({ reason: "missing_generated_at", detail: "generatedAt is required" });
  } else if (Number.isNaN(generatedMs)) {
    violations.push({ reason: "invalid_generated_at", detail: `generatedAt=${generatedAt}` });
  }
  if (bundle.sourceCommand !== "ut-tdd completion review-bundle --json") {
    violations.push({
      reason: "invalid_source_command",
      detail: `sourceCommand=${String(bundle.sourceCommand)}`,
    });
  }
  if (
    bundle.runnableSourceCommand !== runnablePacketCommand("ut-tdd completion review-bundle --json")
  ) {
    violations.push({
      reason: "invalid_source_command",
      detail: `runnableSourceCommand=${String(bundle.runnableSourceCommand)}`,
    });
  }
  if (bundle.freshness?.policy !== POLICY) {
    violations.push({
      reason: "invalid_freshness_policy",
      detail: `policy=${String(bundle.freshness?.policy)}`,
    });
  }
  if (!Number.isFinite(validForMinutes) || validForMinutes <= 0) {
    violations.push({
      reason: "invalid_freshness_window",
      detail: `validForMinutes=${String(validForMinutes)}`,
    });
  }
  if (Number.isNaN(expiresMs)) {
    violations.push({ reason: "invalid_expires_at", detail: `expiresAt=${expiresAt}` });
  } else if (!Number.isNaN(generatedMs) && Number.isFinite(validForMinutes)) {
    const expectedExpiresAt = new Date(generatedMs + validForMinutes * 60_000).toISOString();
    if (expiresAt !== expectedExpiresAt) {
      violations.push({
        reason: "invalid_expires_at",
        detail: `expiresAt=${expiresAt} expected=${expectedExpiresAt}`,
      });
    }
  }
  const computedStale =
    !Number.isNaN(nowMs) && !Number.isNaN(expiresMs)
      ? nowMs > expiresMs
      : Boolean(bundle.freshness?.stale);
  if (bundle.freshness?.stale !== computedStale) {
    violations.push({
      reason: "stale_flag_mismatch",
      detail: `stale=${String(bundle.freshness?.stale)} expected=${String(computedStale)}`,
    });
  }
  if (computedStale) {
    violations.push({
      reason: "stale_bundle",
      detail: `expiresAt=${expiresAt} now=${Number.isNaN(nowMs) ? now : new Date(nowMs).toISOString()}`,
    });
  }

  const safetyChecks: Array<[string, unknown, unknown]> = [
    ["planOnly", bundle.planOnly, true],
    ["mustNotDecide", bundle.mustNotDecide, true],
    ["mustNotApply", bundle.mustNotApply, true],
  ];
  for (const [field, actual, expected] of safetyChecks) {
    if (actual !== expected) {
      violations.push({
        reason: "invalid_safety_flags",
        detail: `${field}=${String(actual)} expected=${String(expected)}`,
      });
    }
  }

  const completionStateChecks: Array<[string, unknown, unknown]> = [
    ["completionClaimAllowed", bundle.completionClaimAllowed, decisionPacket.ok],
    ["humanDecisionRequired", bundle.humanDecisionRequired, decisionPacket.humanDecisionRequired],
    ["nextAuthority", bundle.nextAuthority, decisionPacket.nextAuthority],
    ["status", bundle.status, decisionPacket.status],
    ["decisionCount", bundle.decisionCount, decisionPacket.decisionCount],
  ];
  for (const [field, actual, expected] of completionStateChecks) {
    if (actual !== expected) {
      violations.push({
        reason: "invalid_completion_state",
        detail: `${field}=${String(actual)} expected=${String(expected)}`,
      });
    }
  }
  const expectedBlockedUntil = decisionPacket.blockers ?? [];
  if (JSON.stringify(bundle.blockedUntil ?? []) !== JSON.stringify(expectedBlockedUntil)) {
    violations.push({
      reason: "invalid_completion_state",
      detail: `blockedUntil mismatch expected=${expectedBlockedUntil.join(",")} actual=${(bundle.blockedUntil ?? []).join(",")}`,
    });
  }
  const decisionBlockers = new Set(
    (decisionPacket.decisions ?? []).flatMap((decision) => decision.blockers ?? []),
  );
  const expectedReviewCoveredBlockers = expectedBlockedUntil.filter((blocker) =>
    decisionBlockers.has(blocker),
  );
  const expectedNonPacketBlockers = expectedBlockedUntil.filter(
    (blocker) => !decisionBlockers.has(blocker),
  );
  const blockerCoverageChecks: Array<[string, unknown[], string[]]> = [
    ["reviewCoveredBlockers", bundle.reviewCoveredBlockers ?? [], expectedReviewCoveredBlockers],
    ["nonPacketBlockers", bundle.nonPacketBlockers ?? [], expectedNonPacketBlockers],
  ];
  for (const [field, actual, expected] of blockerCoverageChecks) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      violations.push({
        reason: "invalid_completion_state",
        detail: `${field} mismatch expected=${expected.join(",")} actual=${actual.join(",")}`,
      });
    }
  }
  const requiredActionJa = [
    ...new Set(decisionPacket.decisions.flatMap((decision) => decision.requiredActionsJa ?? [])),
  ];
  for (const action of requiredActionJa) {
    if (!(bundle.requiredOperatorActionsJa ?? []).includes(action)) {
      violations.push({
        reason: "invalid_completion_state",
        detail: `requiredOperatorActionsJa missing action=${action}`,
      });
    }
  }

  if (bundle.completionDecisionPacketCommand !== "ut-tdd completion decision-packet --json") {
    violations.push({
      reason: "invalid_completion_decision_packet_bridge",
      detail: `completionDecisionPacketCommand=${String(bundle.completionDecisionPacketCommand)}`,
    });
  }
  if (
    bundle.runnableCompletionDecisionPacketCommand !==
    runnablePacketCommand("ut-tdd completion decision-packet --json")
  ) {
    violations.push({
      reason: "invalid_completion_decision_packet_bridge",
      detail: `runnableCompletionDecisionPacketCommand=${String(bundle.runnableCompletionDecisionPacketCommand)}`,
    });
  }

  const expectedReviewPackets = reviewBundlePacketsForDecisionPacket(decisionPacket);
  if (bundle.reviewPacketCount !== expectedReviewPackets.length) {
    violations.push({
      reason: "invalid_review_packet_count",
      detail: `reviewPacketCount=${String(bundle.reviewPacketCount)} expected=${expectedReviewPackets.length}`,
    });
  }
  if ((bundle.reviewPackets ?? []).length !== expectedReviewPackets.length) {
    violations.push({
      reason: "invalid_review_packet_count",
      detail: `reviewPackets.length=${String((bundle.reviewPackets ?? []).length)} expected=${expectedReviewPackets.length}`,
    });
  }
  if (JSON.stringify(bundle.reviewPackets ?? []) !== JSON.stringify(expectedReviewPackets)) {
    violations.push({
      reason: "invalid_review_packet",
      detail: "reviewPackets drift from completion decision supporting packet summaries",
    });
  }

  const expectedCompletionDecisionPacketDigest = sha256Json(decisionPacket);
  const expectedHumanReviewBundleDigest = sha256Json(decisionPacket.humanReviewBundle);
  const expectedReviewPacketsDigest = sha256Json(expectedReviewPackets);
  const { bundleDigest: _bundleDigest, ...bundleWithoutDigest } = bundle;
  const expectedBundleDigest = sha256Json(bundleWithoutDigest);
  const {
    bundleDigest: _exactDigest,
    semanticBundleDigest: _semanticDigest,
    ...bundleWithoutDigests
  } = bundle;
  const expectedSemanticBundleDigest = completionReviewBundleSemanticDigest(
    bundleWithoutDigests,
    decisionPacket,
  );
  const digestChecks: Array<[string, string, string]> = [
    [
      "completionDecisionPacketDigest",
      String(bundle.completionDecisionPacketDigest ?? ""),
      expectedCompletionDecisionPacketDigest,
    ],
    [
      "humanReviewBundleDigest",
      String(bundle.humanReviewBundleDigest ?? ""),
      expectedHumanReviewBundleDigest,
    ],
    ["reviewPacketsDigest", String(bundle.reviewPacketsDigest ?? ""), expectedReviewPacketsDigest],
    [
      "semanticBundleDigest",
      String(bundle.semanticBundleDigest ?? ""),
      expectedSemanticBundleDigest,
    ],
    ["bundleDigest", String(bundle.bundleDigest ?? ""), expectedBundleDigest],
  ];
  for (const [field, actual, expected] of digestChecks) {
    if (actual !== expected) {
      violations.push({
        reason: "invalid_digest",
        detail: `${field}=${actual} expected=${expected}`,
      });
    }
  }

  return {
    ok: violations.length === 0,
    status: bundle.status ?? "unknown",
    decisionCount: bundle.decisionCount ?? 0,
    reviewPacketCount: bundle.reviewPacketCount ?? 0,
    sourceCommand: bundle.sourceCommand ?? "",
    validForMinutes: Number.isFinite(validForMinutes) ? validForMinutes : 0,
    stale: Boolean(bundle.freshness?.stale),
    expiresAt,
    bundleDigest: bundle.bundleDigest ?? "",
    semanticBundleDigest: bundle.semanticBundleDigest ?? "",
    violations,
  };
}

function reviewBundlePacketsForDecisionPacket(
  decisionPacket: CompletionDecisionPacket,
): CompletionReviewBundlePacket[] {
  return decisionPacket.decisions.flatMap((decision) =>
    decision.supportingPacketSummaries.map((summary, index) => ({
      order: index + 1,
      planId: decision.planId,
      decisionKind: decision.decisionKind,
      blockerReason: decision.blockerReason,
      command: summary.command,
      scopedCommand: summary.scopedCommand ?? summary.command,
      runnableScopedCommand:
        summary.runnableScopedCommand ??
        runnablePacketCommand(summary.scopedCommand ?? summary.command),
      schemaVersion: summary.schemaVersion,
      matrixField: summary.matrixField,
      expectedMatrixCount: summary.expectedMatrixCount,
      writePolicy: summary.matrixField === "none" ? "no-write" : "see-packet-matrix",
      reviewPolicy: "non_destructive_review_only",
      requiredReviewFields: summary.requiredReviewFields,
      requiredReviewFieldsDigest: sha256Json(summary.requiredReviewFields),
      requiredMatrixFields: summary.requiredMatrixFields,
      requiredSafetyFields: summary.requiredReviewFields.filter(isReviewBundleSafetyField),
      reviewRoute: summary.reviewRoute,
      reviewRouteJa: summary.reviewRouteJa,
    })),
  );
}

function isReviewBundleSafetyField(field: string): boolean {
  return (
    field === "planOnly" ||
    field.startsWith("mustNot") ||
    field.endsWith("Allowed") ||
    field.endsWith("Available") ||
    field === "applyAuthorized" ||
    field === "activationAllowed" ||
    field === "decisionAllowed" ||
    field === "approvalAllowed"
  );
}

function sha256Json(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

export function completionDecisionPacketMessages(
  result: CompletionDecisionPacketLintResult,
): string[] {
  if (result.ok) {
    return [
      `completion-decision-packet - OK (status=${result.status}, decisions=${result.decisionCount}, freshness=${result.validForMinutes}m stale=${result.stale}, source=${result.sourceCommand})`,
    ];
  }
  return result.violations.map(
    (violation) =>
      `completion-decision-packet - violation: ${violation.reason} (${violation.detail})`,
  );
}

export function completionReviewBundleMessages(result: CompletionReviewBundleLintResult): string[] {
  if (result.ok) {
    return [
      `completion-review-bundle - OK (status=${result.status}, decisions=${result.decisionCount}, reviewPackets=${result.reviewPacketCount}, freshness=${result.validForMinutes}m stale=${result.stale}, source=${result.sourceCommand}, digest=${result.bundleDigest}, semanticDigest=${result.semanticBundleDigest})`,
    ];
  }
  return result.violations.map(
    (violation) =>
      `completion-review-bundle - violation: ${violation.reason} (${violation.detail})`,
  );
}
