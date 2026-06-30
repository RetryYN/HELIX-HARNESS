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
  | "missing_required_records"
  | "invalid_required_record"
  | "missing_allowed_outcomes_by_record"
  | "invalid_allowed_outcomes_by_record";

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

const POLICY = "decision-packet-freshness.v1";
const ALLOWED_SOURCE_COMMANDS = new Set([
  "ut-tdd status --json",
  "ut-tdd completion decision-packet --json",
]);

export function analyzeCompletionDecisionPacket(
  packet: CompletionDecisionPacket,
  now: string = new Date().toISOString(),
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

  packet.decisions.forEach((decision, decisionIndex) => {
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
          if (!sourcePath.trim() || /^(TBD|TODO|-)$/.test(sourcePath.trim())) {
            violations.push({
              reason: "invalid_required_record",
              detail: `${subject} invalid sourcePath=${sourcePath}`,
            });
          }
        }
      }
    });
    const outcomeRecords = new Map(
      (decision.allowedOutcomesByRecord ?? []).map((entry) => [entry.recordName, entry]),
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
