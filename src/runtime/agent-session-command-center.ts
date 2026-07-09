import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_STALE_MINUTES, type Slot } from "./agent-slots";

export const AGENT_SESSION_BOARD_SCHEMA_VERSION = "agent-session-command-center.v1";

export type AgentSessionBoardRow = {
  session_id: string;
  role: string | null;
  task: string | null;
  plan_id: string | null;
  worktree: string | null;
  state: "active" | "stale" | "completed" | "failed" | "blocked" | "unknown";
  heartbeat: string | null;
  needs_you_reason: "none" | "stale_session" | "human_escalation" | "gate_red";
  handover_path: string | null;
  next_action: string | null;
  source: "agent_slot" | "handover_pointer";
};

export type AgentSessionBoardReport = {
  schema_version: typeof AGENT_SESSION_BOARD_SCHEMA_VERSION;
  ok: boolean;
  generated_at: string;
  rows: AgentSessionBoardRow[];
  counts: Record<AgentSessionBoardRow["state"], number>;
  findings: Array<{ code: string; severity: "info" | "warning" | "error"; detail: string }>;
  source_command: string;
};

type HandoverPointerLike = {
  active_plan?: string;
  status?: string;
  updated_at?: string;
  latest_doc?: string;
  outstanding?: {
    items?: Array<{
      planId?: string;
      requiredActionJa?: string;
      requiredAction?: string;
      blockers?: string[];
    }>;
  };
};

function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function slotState(slot: Slot, nowMs: number, staleMinutes: number): AgentSessionBoardRow["state"] {
  if (slot.status === "running" && slot.released_at === null) {
    const fired = Date.parse(slot.fired_at);
    if (!Number.isNaN(fired) && (nowMs - fired) / 60_000 > staleMinutes) return "stale";
    return "active";
  }
  if (slot.status === "completed") return "completed";
  if (slot.status === "failed") return "failed";
  if (slot.status === "cancelled") return "blocked";
  return "unknown";
}

function countRows(rows: AgentSessionBoardRow[]): Record<AgentSessionBoardRow["state"], number> {
  return {
    active: rows.filter((row) => row.state === "active").length,
    stale: rows.filter((row) => row.state === "stale").length,
    completed: rows.filter((row) => row.state === "completed").length,
    failed: rows.filter((row) => row.state === "failed").length,
    blocked: rows.filter((row) => row.state === "blocked").length,
    unknown: rows.filter((row) => row.state === "unknown").length,
  };
}

export function buildAgentSessionBoardReport(
  repoRoot: string,
  options: {
    now?: string;
    staleMinutes?: number;
    sourceCommand?: string;
  } = {},
): AgentSessionBoardReport {
  const now = options.now ?? new Date().toISOString();
  const nowMs = Date.parse(now);
  const staleMinutes = options.staleMinutes ?? DEFAULT_STALE_MINUTES;
  const pointerPath = join(repoRoot, ".helix", "handover", "CURRENT.json");
  const slotPath = join(repoRoot, ".helix", "state", "agent-slots.json");
  const pointer = readJsonFile<HandoverPointerLike>(pointerPath);
  const slots = readJsonFile<Slot[]>(slotPath) ?? [];
  const rows: AgentSessionBoardRow[] = slots.map((slot) => {
    const state = Number.isNaN(nowMs) ? "unknown" : slotState(slot, nowMs, staleMinutes);
    return {
      session_id: slot.slot_id,
      role: slot.role,
      task: slot.agent_kind,
      plan_id: null,
      worktree: null,
      state,
      heartbeat: slot.released_at ?? slot.fired_at,
      needs_you_reason: state === "stale" ? "stale_session" : "none",
      handover_path: null,
      next_action: null,
      source: "agent_slot",
    };
  });

  const firstOutstanding = pointer?.outstanding?.items?.[0];
  if (pointer) {
    const blockers = firstOutstanding?.blockers ?? [];
    rows.push({
      session_id: "handover-current",
      role: "current-location",
      task: pointer.status ?? null,
      plan_id: firstOutstanding?.planId ?? pointer.active_plan ?? null,
      worktree: repoRoot,
      state: pointer.status === "in_progress" ? "active" : "blocked",
      heartbeat: pointer.updated_at ?? null,
      needs_you_reason: blockers.includes("human_approval_pending")
        ? "human_escalation"
        : pointer.status === "in_progress"
          ? "none"
          : "gate_red",
      handover_path: pointer.latest_doc ?? ".helix/handover/CURRENT.json",
      next_action: firstOutstanding?.requiredActionJa ?? firstOutstanding?.requiredAction ?? null,
      source: "handover_pointer",
    });
  }

  const findings: AgentSessionBoardReport["findings"] = [];
  if (!pointer) {
    findings.push({
      code: "handover_pointer_missing",
      severity: "warning",
      detail: ".helix/handover/CURRENT.json is missing or invalid",
    });
  }
  if (rows.some((row) => row.state === "stale")) {
    findings.push({
      code: "stale_session_present",
      severity: "warning",
      detail: "one or more sessions exceeded stale threshold",
    });
  }

  return {
    schema_version: AGENT_SESSION_BOARD_SCHEMA_VERSION,
    ok: findings.every((finding) => finding.severity !== "error"),
    generated_at: now,
    rows,
    counts: countRows(rows),
    findings,
    source_command: options.sourceCommand ?? "helix sessions board --json",
  };
}
