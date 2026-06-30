import {
  type CompletionDecisionPacket,
  completionDecisionPacketForOutstanding,
  computeOutstandingWork,
} from "./outstanding";

export type CompletionDecisionPacketViolationReason =
  | "invalid_generated_from"
  | "invalid_status_ok_consistency"
  | "missing_generated_at"
  | "invalid_generated_at"
  | "invalid_source_command"
  | "invalid_freshness_policy"
  | "invalid_freshness_window"
  | "invalid_expires_at"
  | "stale_flag_mismatch"
  | "stale_packet"
  | "decision_count_mismatch"
  | "invalid_decision_kind"
  | "invalid_decision_packet_command"
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
  | "invalid_required_record_source_path";

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

export interface CompletionDecisionPacketLintOptions {
  /** repo-relative sourcePaths が実在するかを呼び出し側が検査するための hook。 */
  sourcePathExists?: (repoRelativePath: string) => boolean;
}

const POLICY = "decision-packet-freshness.v1";
const ALLOWED_SOURCE_COMMANDS = new Set([
  "ut-tdd handover",
  "ut-tdd status --json",
  "ut-tdd completion decision-packet --json",
]);

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

  const unsafeRepoRelativePath = (sourcePath: string): boolean =>
    sourcePath.startsWith("/") ||
    /^[A-Za-z]:[\\/]/.test(sourcePath) ||
    sourcePath.split(/[\\/]+/).includes("..");

  packet.decisions.forEach((decision, decisionIndex) => {
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
    const requiredRecordNames = decision.requiredRecords.map((record) => record.recordName);
    rejectDuplicateOrExtraRecordEntries({
      violations,
      subject: `decision[${decisionIndex}].requiredRecords`,
      reason: "invalid_required_record",
      requiredRecordNames,
      actualRecordNames: requiredRecordNames,
    });
    rejectDuplicateOrExtraRecordEntries({
      violations,
      subject: `decision[${decisionIndex}].allowedOutcomesByRecord`,
      reason: "invalid_allowed_outcomes_by_record",
      requiredRecordNames,
      actualRecordNames: (decision.allowedOutcomesByRecord ?? []).map((entry) => entry.recordName),
    });
    rejectDuplicateOrExtraRecordEntries({
      violations,
      subject: `decision[${decisionIndex}].nextWorkflowRoutesByRecord`,
      reason: "invalid_next_routes_by_record",
      requiredRecordNames,
      actualRecordNames: (decision.nextWorkflowRoutesByRecord ?? []).map(
        (entry) => entry.recordName,
      ),
    });
    rejectDuplicateOrExtraRecordEntries({
      violations,
      subject: `decision[${decisionIndex}].recordTemplates`,
      reason: "invalid_record_template",
      requiredRecordNames,
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
      const template = templateRecords.get(record.recordName);
      if (!template) {
        violations.push({
          reason: "invalid_record_template",
          detail: `decision[${decisionIndex}] missing template for ${record.recordName}`,
        });
        continue;
      }
      if (!template.insertionHint?.trim() || /^(TBD|TODO|-)$/.test(template.insertionHint.trim())) {
        violations.push({
          reason: "invalid_record_template",
          detail: `decision[${decisionIndex}] ${record.recordName} invalid insertionHint`,
        });
      }
      if (!Array.isArray(template.yamlLines) || template.yamlLines.length === 0) {
        violations.push({
          reason: "invalid_record_template",
          detail: `decision[${decisionIndex}] ${record.recordName} missing yamlLines`,
        });
        continue;
      }
      if (template.yamlLines[0]?.trim() !== `${record.recordName}:`) {
        violations.push({
          reason: "invalid_record_template",
          detail: `decision[${decisionIndex}] ${record.recordName} template header mismatch`,
        });
      }
      const templateText = template.yamlLines.join("\n");
      for (const field of record.fields) {
        if (!templateText.includes(`- ${field}:`)) {
          violations.push({
            reason: "invalid_record_template",
            detail: `decision[${decisionIndex}] ${record.recordName} template missing field=${field}`,
          });
        }
      }
      const guidanceText = `${template.insertionHint}\n${templateText}`.toLowerCase();
      for (const expectedGuidance of requiredTemplateGuidance(record.recordName)) {
        if (!guidanceText.includes(expectedGuidance.toLowerCase())) {
          violations.push({
            reason: "invalid_record_template",
            detail: `decision[${decisionIndex}] ${record.recordName} template missing guidance=${expectedGuidance}`,
          });
        }
      }
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
  return [
    ...new Set([
      requiredDecisionPacketCommand(blockerReason),
      ...blockers.map((blocker) => requiredDecisionPacketCommand(blocker)),
    ]),
  ];
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
      return ["version-up activation", "add-feature", "Forward", "reject/archive", "review_by"];
    case "parked_review_record":
      return [
        "version-up parked review",
        "schedule review",
        "mark stale",
        "activation_decision_record",
      ];
    case "cutover_decision_record":
      return ["L14 cutover decision", "approve_cutover", "reject/defer", "request runbook changes"];
    case "action_binding_approval_record":
      return [
        "action-binding approval gate",
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
      return ["add-feature", "forward", "reject/archive", "review_by", "dry-run", "rollback"];
    case "parked_review_record":
      return [
        "review_owner",
        "review_trigger",
        "stale_action",
        "completion/status decision packet",
      ];
    case "cutover_decision_record":
      return [
        "frozen head",
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
