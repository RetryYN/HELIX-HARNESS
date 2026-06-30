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
  | "decision_count_mismatch";

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
