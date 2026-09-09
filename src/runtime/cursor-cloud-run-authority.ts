export const CURSOR_V1_RUN_AUTHORITY_SCHEMA_VERSION = "cursor-v1-run-authority.v1";

export type CursorV1RunInput = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  cancellable: boolean;
};

export type CursorRunClassification =
  | "active"
  | "cancellable_stale"
  | "phantom"
  | "stale"
  | "terminal"
  | "unknown";

export type ClassifiedCursorV1Run = CursorV1RunInput & {
  normalizedStatus: string;
  classification: CursorRunClassification;
  stale: boolean;
  observedAt: string;
};

export type CursorV1RunClassificationReport = {
  schemaVersion: typeof CURSOR_V1_RUN_AUTHORITY_SCHEMA_VERSION;
  sourceAuthority: "cursor_v1_run_list";
  runs: ClassifiedCursorV1Run[];
  authoritativeActiveRunIds: string[];
  cancellableRecoveryRunIds: string[];
  phantomRunIds: string[];
  staleRunIds: string[];
  terminalRunIds: string[];
  unknownRunIds: string[];
};

const ACTIVE_STATUSES = new Set(["CREATING", "RUNNING"]);
const TERMINAL_STATUSES = new Set(["FINISHED", "FAILED", "CANCELLED", "CANCELED"]);

function parseTimestamp(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function classifyCursorV1Runs(input: {
  runs: CursorV1RunInput[];
  now: string;
  staleAfterMs: number;
}): CursorV1RunClassificationReport {
  const now = parseTimestamp(input.now);
  if (now === null) throw new Error("cursor_run_authority_invalid_now");
  if (!Number.isFinite(input.staleAfterMs) || input.staleAfterMs <= 0)
    throw new Error("cursor_run_authority_invalid_stale_after");

  const seen = new Set<string>();
  const runs = input.runs.map((run): ClassifiedCursorV1Run => {
    const id = run.id.trim();
    if (!id || seen.has(id)) throw new Error("cursor_run_authority_invalid_or_duplicate_run_id");
    seen.add(id);

    const normalizedStatus = run.status.trim().toUpperCase();
    const observedAt = run.updatedAt ?? run.createdAt;
    const observedTimestamp = parseTimestamp(observedAt);
    const stale = observedTimestamp === null || now - observedTimestamp > input.staleAfterMs;

    let classification: CursorRunClassification;
    if (TERMINAL_STATUSES.has(normalizedStatus)) {
      classification = "terminal";
    } else if (!ACTIVE_STATUSES.has(normalizedStatus) || observedTimestamp === null) {
      classification = "unknown";
    } else if (!stale) {
      classification = "active";
    } else if (run.cancellable) {
      classification = "cancellable_stale";
    } else if (normalizedStatus === "CREATING") {
      classification = "phantom";
    } else {
      classification = "stale";
    }

    return { ...run, id, normalizedStatus, classification, stale, observedAt };
  });

  const idsFor = (classification: CursorRunClassification): string[] =>
    runs.filter((run) => run.classification === classification).map((run) => run.id);

  return {
    schemaVersion: CURSOR_V1_RUN_AUTHORITY_SCHEMA_VERSION,
    sourceAuthority: "cursor_v1_run_list",
    runs,
    authoritativeActiveRunIds: idsFor("active"),
    cancellableRecoveryRunIds: idsFor("cancellable_stale"),
    phantomRunIds: idsFor("phantom"),
    staleRunIds: idsFor("stale"),
    terminalRunIds: idsFor("terminal"),
    unknownRunIds: idsFor("unknown"),
  };
}

export type CursorFollowUpDispatchDecision = {
  lane: "cursor_cloud_execution";
  laneStatus: "available" | "degraded";
  action: "post_once" | "cancel_then_read_after" | "deny";
  cancelRunId?: string;
  postAllowed: boolean;
  retryPostAllowed: false;
  reason:
    | "cursor_provider_unavailable"
    | "unknown_run_state"
    | "active_run_present"
    | "multiple_cancellable_stale_runs"
    | "single_cancellable_stale_run"
    | "uncancellable_stale_run"
    | "single_active_run_preflight_clear";
};

export function decideCursorFollowUpDispatch(input: {
  providerAvailable: boolean;
  classification: CursorV1RunClassificationReport;
}): CursorFollowUpDispatchDecision {
  const base = {
    lane: "cursor_cloud_execution" as const,
    retryPostAllowed: false as const,
  };
  if (!input.providerAvailable) {
    return {
      ...base,
      laneStatus: "degraded",
      action: "deny",
      postAllowed: false,
      reason: "cursor_provider_unavailable",
    };
  }
  if (input.classification.unknownRunIds.length > 0) {
    return {
      ...base,
      laneStatus: "available",
      action: "deny",
      postAllowed: false,
      reason: "unknown_run_state",
    };
  }
  if (input.classification.authoritativeActiveRunIds.length > 0) {
    return {
      ...base,
      laneStatus: "available",
      action: "deny",
      postAllowed: false,
      reason: "active_run_present",
    };
  }
  if (input.classification.cancellableRecoveryRunIds.length > 1) {
    return {
      ...base,
      laneStatus: "available",
      action: "deny",
      postAllowed: false,
      reason: "multiple_cancellable_stale_runs",
    };
  }
  if (input.classification.cancellableRecoveryRunIds.length === 1) {
    return {
      ...base,
      laneStatus: "available",
      action: "cancel_then_read_after",
      cancelRunId: input.classification.cancellableRecoveryRunIds[0],
      postAllowed: false,
      reason: "single_cancellable_stale_run",
    };
  }
  if (input.classification.staleRunIds.length > 0) {
    return {
      ...base,
      laneStatus: "available",
      action: "deny",
      postAllowed: false,
      reason: "uncancellable_stale_run",
    };
  }
  return {
    ...base,
    laneStatus: "available",
    action: "post_once",
    postAllowed: true,
    reason: "single_active_run_preflight_clear",
  };
}

export function handleCursorFollowUpPostResult(input: { statusCode: number }): {
  action: "read_after_v1_runs" | "refresh_v1_runs" | "fail";
  retryPostAllowed: false;
  reason: "post_accepted" | "agent_busy_or_run_conflict" | "provider_error";
} {
  if (input.statusCode >= 200 && input.statusCode < 300)
    return { action: "read_after_v1_runs", retryPostAllowed: false, reason: "post_accepted" };
  if (input.statusCode === 409)
    return {
      action: "refresh_v1_runs",
      retryPostAllowed: false,
      reason: "agent_busy_or_run_conflict",
    };
  return { action: "fail", retryPostAllowed: false, reason: "provider_error" };
}

export function evaluateCursorFollowUpReadAfter(input: {
  expectedRunId: string;
  classification: CursorV1RunClassificationReport;
}):
  | { accepted: true; reason: "single_expected_active_run"; activeRunId: string }
  | {
      accepted: false;
      reason: "active_run_count_mismatch" | "active_run_identity_mismatch";
    } {
  const active = input.classification.authoritativeActiveRunIds;
  if (active.length !== 1) return { accepted: false, reason: "active_run_count_mismatch" };
  if (active[0] !== input.expectedRunId)
    return { accepted: false, reason: "active_run_identity_mismatch" };
  return { accepted: true, reason: "single_expected_active_run", activeRunId: active[0] };
}

export function evaluateCursorCancelReadAfter(input: {
  cancelledRunId: string;
  classification: CursorV1RunClassificationReport;
}):
  | { cleared: true; reason: "cancelled_run_terminal_and_agent_clear" }
  | {
      cleared: false;
      reason:
        | "cancelled_run_still_occupies_agent"
        | "cancelled_run_not_observed_terminal"
        | "another_active_run_present";
    } {
  const target = input.classification.runs.find((run) => run.id === input.cancelledRunId);
  if (target && target.classification !== "terminal")
    return { cleared: false, reason: "cancelled_run_still_occupies_agent" };
  if (!target) return { cleared: false, reason: "cancelled_run_not_observed_terminal" };
  if (
    input.classification.authoritativeActiveRunIds.length > 0 ||
    input.classification.cancellableRecoveryRunIds.length > 0 ||
    input.classification.staleRunIds.length > 0 ||
    input.classification.unknownRunIds.length > 0
  )
    return { cleared: false, reason: "another_active_run_present" };
  return { cleared: true, reason: "cancelled_run_terminal_and_agent_clear" };
}
