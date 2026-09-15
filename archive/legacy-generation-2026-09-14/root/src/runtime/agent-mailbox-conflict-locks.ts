export const AGENT_MAILBOX_LOCKS_SCHEMA_VERSION = "agent-mailbox-conflict-locks.v1";

export type AgentLockStatus = "active" | "stale" | "released";

export type AgentLockRecord = {
  lock_id: string;
  owner_session_id: string;
  plan_id: string | null;
  path: string;
  symbol: string | null;
  acquired_at: string;
  expires_at: string | null;
  status: AgentLockStatus;
};

export type AgentMailboxMessage = {
  message_id: string;
  from_session_id: string;
  to_session_id: string;
  plan_id: string;
  task: string;
  body: string;
  dry_run: true;
};

export type AgentLockReport = {
  schema_version: typeof AGENT_MAILBOX_LOCKS_SCHEMA_VERSION;
  ok: boolean;
  locks: AgentLockRecord[];
  conflicts: Array<{
    path: string;
    active_lock_ids: string[];
    owners: string[];
  }>;
  stale_locks: AgentLockRecord[];
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
};

export function classifyAgentLock(
  lock: Omit<AgentLockRecord, "status"> & { status?: AgentLockStatus },
  now: string,
): AgentLockRecord {
  if (lock.status === "released") return { ...lock, status: "released" };
  const nowMs = Date.parse(now);
  const expiresMs = lock.expires_at ? Date.parse(lock.expires_at) : Number.NaN;
  if (!Number.isNaN(nowMs) && !Number.isNaN(expiresMs) && expiresMs < nowMs) {
    return { ...lock, status: "stale" };
  }
  return { ...lock, status: lock.status ?? "active" };
}

export function buildAgentLockReport(
  locks: Array<Omit<AgentLockRecord, "status"> & { status?: AgentLockStatus }>,
  options: { now?: string; sourceCommand?: string } = {},
): AgentLockReport {
  const now = options.now ?? new Date().toISOString();
  const classified = locks.map((lock) => classifyAgentLock(lock, now));
  const active = classified.filter((lock) => lock.status === "active");
  const conflicts = [...new Set(active.map((lock) => lock.path))]
    .map((path) => active.filter((lock) => lock.path === path))
    .filter((samePathLocks) => new Set(samePathLocks.map((lock) => lock.owner_session_id)).size > 1)
    .map((samePathLocks) => ({
      path: samePathLocks[0]?.path ?? "",
      active_lock_ids: samePathLocks.map((lock) => lock.lock_id),
      owners: [...new Set(samePathLocks.map((lock) => lock.owner_session_id))],
    }));
  const staleLocks = classified.filter((lock) => lock.status === "stale");
  const findings: AgentLockReport["findings"] = [
    ...conflicts.map((conflict) => ({
      code: "active_lock_conflict" as const,
      severity: "error" as const,
      detail: `${conflict.path} is locked by ${conflict.owners.join(",")}`,
    })),
    ...staleLocks.map((lock) => ({
      code: "stale_lock_requires_owner_review" as const,
      severity: "warning" as const,
      detail: `${lock.lock_id} expired at ${lock.expires_at ?? "-"}`,
    })),
  ];
  return {
    schema_version: AGENT_MAILBOX_LOCKS_SCHEMA_VERSION,
    ok: conflicts.length === 0,
    locks: classified,
    conflicts,
    stale_locks: staleLocks,
    findings,
    source_command: options.sourceCommand ?? "helix agent locks --json",
  };
}

export function buildAgentMessageDryRun(input: {
  fromSessionId: string;
  toSessionId: string;
  planId: string;
  task: string;
  body: string;
}): AgentMailboxMessage {
  return {
    message_id: `dry-run:${input.planId}:${input.fromSessionId}:${input.toSessionId}`,
    from_session_id: input.fromSessionId,
    to_session_id: input.toSessionId,
    plan_id: input.planId,
    task: input.task,
    body: input.body,
    dry_run: true,
  };
}
