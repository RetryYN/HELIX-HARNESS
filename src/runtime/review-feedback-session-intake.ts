import { createHash } from "node:crypto";

export const REVIEW_FEEDBACK_SESSION_INTAKE_SCHEMA_VERSION = "review-feedback-session-intake.v1";

export type ReviewFeedbackKind =
  | "ci_failure"
  | "review_comment"
  | "requested_changes"
  | "merge_conflict";

export type ReviewFeedbackState = "retry_task" | "needs_you" | "blocked" | "resolved" | "triage";

export interface ReviewFeedbackEventInput {
  feedback_key: string;
  kind: ReviewFeedbackKind;
  source_url: string;
  source_ref: string;
  target_session_id?: string | null;
  plan_id?: string | null;
  resolved?: boolean;
}

export interface ReviewFeedbackSessionRow {
  session_id: string;
  plan_id?: string | null;
}

export interface RoutedReviewFeedbackEvent {
  feedback_event_id: string;
  feedback_key: string;
  kind: ReviewFeedbackKind;
  state: ReviewFeedbackState;
  source_url: string;
  source_ref: string;
  target_session_id: string | null;
  plan_id: string | null;
  orphan: boolean;
  duplicate: boolean;
  next_action: string;
}

export interface ReviewFeedbackSessionIntakeReport {
  schema_version: typeof REVIEW_FEEDBACK_SESSION_INTAKE_SCHEMA_VERSION;
  ok: boolean;
  read_only: true;
  routed_events: RoutedReviewFeedbackEvent[];
  duplicate_intake_count: number;
  orphan_count: number;
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

function stableId(event: ReviewFeedbackEventInput): string {
  return `review-feedback:${createHash("sha256")
    .update(`${event.kind}\0${event.feedback_key}\0${event.source_ref}`)
    .digest("hex")
    .slice(0, 16)}`;
}

function stateFor(event: ReviewFeedbackEventInput, orphan: boolean): ReviewFeedbackState {
  if (event.resolved) return "resolved";
  if (orphan) return "triage";
  if (event.kind === "requested_changes") return "needs_you";
  if (event.kind === "merge_conflict") return "blocked";
  return "retry_task";
}

export function buildReviewFeedbackSessionIntakeReport(
  events: ReviewFeedbackEventInput[],
  sessions: ReviewFeedbackSessionRow[],
  options: { sourceCommand?: string } = {},
): ReviewFeedbackSessionIntakeReport {
  const findings: ReviewFeedbackSessionIntakeReport["findings"] = [];
  const sessionIds = new Set(sessions.map((session) => session.session_id).filter(Boolean));
  const seen = new Set<string>();
  let duplicateIntakeCount = 0;

  const routedEvents = events.map((event) => {
    const id = stableId(event);
    const duplicate = seen.has(id);
    if (duplicate) duplicateIntakeCount += 1;
    seen.add(id);
    const hasTarget = Boolean(event.target_session_id);
    const orphan = !hasTarget || !sessionIds.has(String(event.target_session_id));
    const state = stateFor(event, orphan);
    if (!event.source_url.trim() || !event.source_ref.trim()) {
      findings.push({
        code: "feedback_source_missing",
        severity: "error",
        detail: `${event.feedback_key} requires source_url and source_ref`,
      });
    }
    if (orphan) {
      findings.push({
        code: "feedback_orphan_triage",
        severity: "warning",
        detail: `${event.feedback_key} is not bound to a known session; triage without failing intake`,
      });
    }
    return {
      feedback_event_id: id,
      feedback_key: event.feedback_key,
      kind: event.kind,
      state,
      source_url: event.source_url,
      source_ref: event.source_ref,
      target_session_id: event.target_session_id ?? null,
      plan_id:
        event.plan_id ??
        sessions.find((session) => session.session_id === event.target_session_id)?.plan_id ??
        null,
      orphan,
      duplicate,
      next_action: orphan
        ? "triage feedback to a live session or PLAN"
        : state === "resolved"
          ? "no retry required"
          : `route ${event.kind} to ${event.target_session_id}`,
    };
  });

  return {
    schema_version: REVIEW_FEEDBACK_SESSION_INTAKE_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    read_only: true,
    routed_events: routedEvents,
    duplicate_intake_count: duplicateIntakeCount,
    orphan_count: routedEvents.filter((event) => event.orphan).length,
    findings,
    source_command: options.sourceCommand ?? "helix feedback intake --json",
  };
}
