import { createHash } from "node:crypto";
import {
  type WorkflowClassificationRegistry,
  workflowClassificationAxisSchema,
} from "../schema/workflow-classification-registry";
import { projectExecutionEpisodeLocation } from "./github-execution-episode-location";
import type { HarnessDb } from "./index";

type Digest = `sha256:${string}`;
type WorkflowClassificationAxis = WorkflowClassificationRegistry["entities"][number]["axis"];

export const EXECUTION_EPISODE_STATES = [
  "admitted",
  "planned",
  "branch_bound",
  "pr_open",
  "review_pending",
  "merge_ready",
  "merged",
  "closure_pending",
  "closed",
] as const;

export type ExecutionEpisodeState = (typeof EXECUTION_EPISODE_STATES)[number];
export type ExecutionEpisodeDisposition =
  | "resolved"
  | "rejected"
  | "quarantined"
  | "superseded"
  | "cancelled";

const EXECUTION_EPISODE_DISPOSITIONS = new Set<ExecutionEpisodeDisposition>([
  "resolved",
  "rejected",
  "quarantined",
  "superseded",
  "cancelled",
]);
const EXECUTION_EPISODE_STATE_SET = new Set<string>(EXECUTION_EPISODE_STATES);
const EXECUTION_EPISODE_EVENT_KINDS = new Set(["state_transition", "outbox_delivered"]);

export interface ExecutionEpisodeWorkflowIdentity {
  registry_version: string;
  registry_source_digest: Digest;
  target_axis: WorkflowClassificationAxis;
  target_id: string;
}

export interface ExecutionEpisodeResources {
  issue_number?: number;
  plan_id?: string;
  branch_name?: string;
  pr_number?: number;
  base_ref?: string;
  head_sha?: string;
}

export interface ExecutionEpisodeTransition {
  episode_id: string;
  idempotency_key: string;
  expected_revision: number;
  to_state: ExecutionEpisodeState;
  occurred_at: string;
  workflow_identity: ExecutionEpisodeWorkflowIdentity;
  source_event_id: string;
  source_event_digest: Digest;
  owner: string;
  behavior_contract_id: string;
  resources: ExecutionEpisodeResources;
  disposition?: ExecutionEpisodeDisposition;
  terminal_evidence?: {
    closure_receipt_digest: Digest;
    closure_receipt_episode_id: string;
    closure_receipt_head_sha: string;
    main_read_after_head: string;
    db_replay_digest: Digest;
    po_decision_digest?: Digest;
    po_decision_episode_id?: string;
    po_decision_head_sha?: string;
  };
  outbox?: {
    destination: string;
    payload_digest: Digest;
  };
}

export interface ExecutionEpisodeProjection {
  episode_id: string;
  state: ExecutionEpisodeState;
  revision: number;
  disposition: ExecutionEpisodeDisposition | null;
  workflow_registry_version: string;
  workflow_registry_source_digest: Digest;
  workflow_target_axis: WorkflowClassificationAxis;
  workflow_target_id: string;
  source_event_id: string;
  source_event_digest: Digest;
  issue_number: number | null;
  plan_id: string | null;
  branch_name: string | null;
  pr_number: number | null;
  base_ref: string | null;
  head_sha: string | null;
  owner: string;
  behavior_contract_id: string;
  last_event_id: string;
  last_event_sequence: number;
  last_event_digest: Digest;
  pending_outbox_count: number;
  closure_receipt_digest: Digest | null;
  main_read_after_head: string | null;
  db_replay_digest: Digest | null;
  po_decision_digest: Digest | null;
  updated_at: string;
}

export interface ExecutionEpisodeEvent {
  event_id: string;
  episode_id: string;
  sequence: number;
  revision: number;
  event_kind: "state_transition" | "outbox_delivered";
  from_state: ExecutionEpisodeState | null;
  to_state: ExecutionEpisodeState;
  idempotency_key: string;
  command_digest: Digest;
  projection_json: string;
  event_digest: Digest;
  occurred_at: string;
}

export interface ExecutionEpisodeTransitionResult {
  event: ExecutionEpisodeEvent;
  projection: ExecutionEpisodeProjection;
  outbox: {
    outbox_id: string;
    episode_id: string;
    event_id: string;
    destination: string;
    payload_digest: Digest;
    delivery_status: "pending" | "delivered";
    attempts: number;
    created_at: string;
    delivered_at: string | null;
  } | null;
  replayed: boolean;
}

const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/u;
const TARGET_ID_PATTERN = /^[A-Z][A-Z0-9_]*$/u;
const HEAD_PATTERN = /^[a-f0-9]{40}$/u;
const EPISODE_ID_PATTERN = /^ep_[A-Za-z0-9]{16,64}$/u;

const NEXT_STATE: Readonly<Record<ExecutionEpisodeState, ExecutionEpisodeState | null>> = {
  admitted: "planned",
  planned: "branch_bound",
  branch_bound: "pr_open",
  pr_open: "review_pending",
  review_pending: "merge_ready",
  merge_ready: "merged",
  merged: "closure_pending",
  closure_pending: "closed",
  closed: null,
};

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value: unknown): Digest {
  return `sha256:${createHash("sha256").update(stable(value)).digest("hex")}`;
}

export function executionEpisodeProjectionDigest(projection: ExecutionEpisodeProjection): Digest {
  return digest(projection);
}

function required(value: string, label: string): string {
  if (!value.trim()) throw new Error(`execution episode ${label} is required`);
  return value;
}

function positiveInteger(value: number | undefined, label: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`execution episode ${label} must be a positive integer`);
  }
  return value;
}

function assertDigest(value: string, label: string): asserts value is Digest {
  if (!DIGEST_PATTERN.test(value)) throw new Error(`execution episode ${label} is invalid`);
}

function assertIdentity(command: ExecutionEpisodeTransition): void {
  required(command.episode_id, "episode_id");
  if (!EPISODE_ID_PATTERN.test(command.episode_id)) {
    throw new Error("execution episode episode_id is invalid");
  }
  required(command.idempotency_key, "idempotency_key");
  required(command.source_event_id, "source_event_id");
  required(command.owner, "owner");
  required(command.behavior_contract_id, "behavior_contract_id");
  if (!Number.isSafeInteger(command.expected_revision) || command.expected_revision < 0) {
    throw new Error("execution episode expected_revision is invalid");
  }
  if (Number.isNaN(Date.parse(command.occurred_at))) {
    throw new Error("execution episode occurred_at is invalid");
  }
  if (!VERSION_PATTERN.test(command.workflow_identity.registry_version)) {
    throw new Error("execution episode registry_version is invalid");
  }
  assertDigest(command.workflow_identity.registry_source_digest, "registry_source_digest");
  workflowClassificationAxisSchema.parse(command.workflow_identity.target_axis);
  if (!TARGET_ID_PATTERN.test(command.workflow_identity.target_id)) {
    throw new Error("execution episode target_id is invalid");
  }
  assertDigest(command.source_event_digest, "source_event_digest");
  positiveInteger(command.resources.issue_number, "issue_number");
  positiveInteger(command.resources.pr_number, "pr_number");
  if (command.resources.head_sha !== undefined && !HEAD_PATTERN.test(command.resources.head_sha)) {
    throw new Error("execution episode head_sha is invalid");
  }
  if (
    command.disposition !== undefined &&
    !EXECUTION_EPISODE_DISPOSITIONS.has(command.disposition)
  ) {
    throw new Error("execution episode disposition is invalid");
  }
  if (command.terminal_evidence) {
    assertDigest(command.terminal_evidence.closure_receipt_digest, "closure_receipt_digest");
    assertDigest(command.terminal_evidence.db_replay_digest, "db_replay_digest");
    if (command.terminal_evidence.po_decision_digest) {
      assertDigest(command.terminal_evidence.po_decision_digest, "po_decision_digest");
    }
    if (!HEAD_PATTERN.test(command.terminal_evidence.main_read_after_head)) {
      throw new Error("execution episode main_read_after_head is invalid");
    }
    if (!HEAD_PATTERN.test(command.terminal_evidence.closure_receipt_head_sha)) {
      throw new Error("execution episode closure receipt HEAD is invalid");
    }
    if (
      command.terminal_evidence.po_decision_head_sha !== undefined &&
      !HEAD_PATTERN.test(command.terminal_evidence.po_decision_head_sha)
    ) {
      throw new Error("execution episode PO decision HEAD is invalid");
    }
  }
  if (command.outbox) {
    required(command.outbox.destination, "outbox.destination");
    assertDigest(command.outbox.payload_digest, "outbox.payload_digest");
  }
}

function immutable<T>(current: T | null, incoming: T | undefined, label: string): T | null {
  if (incoming === undefined) return current;
  if (current !== null && current !== incoming) {
    throw new Error(`execution episode immutable resource conflict: ${label}`);
  }
  return incoming;
}

function projectionFromRow(row: Record<string, unknown>): ExecutionEpisodeProjection {
  return {
    episode_id: String(row.episode_id),
    state: String(row.state) as ExecutionEpisodeState,
    revision: Number(row.revision),
    disposition: row.disposition ? (String(row.disposition) as ExecutionEpisodeDisposition) : null,
    workflow_registry_version: String(row.workflow_registry_version),
    workflow_registry_source_digest: String(row.workflow_registry_source_digest) as Digest,
    workflow_target_axis: String(row.workflow_target_axis) as WorkflowClassificationAxis,
    workflow_target_id: String(row.workflow_target_id),
    source_event_id: String(row.source_event_id),
    source_event_digest: String(row.source_event_digest) as Digest,
    issue_number: row.issue_number === null ? null : Number(row.issue_number),
    plan_id: row.plan_id === null ? null : String(row.plan_id),
    branch_name: row.branch_name === null ? null : String(row.branch_name),
    pr_number: row.pr_number === null ? null : Number(row.pr_number),
    base_ref: row.base_ref === null ? null : String(row.base_ref),
    head_sha: row.head_sha === null ? null : String(row.head_sha),
    owner: String(row.owner),
    behavior_contract_id: String(row.behavior_contract_id),
    last_event_id: String(row.last_event_id),
    last_event_sequence: Number(row.last_event_sequence),
    last_event_digest: String(row.last_event_digest) as Digest,
    pending_outbox_count: Number(row.pending_outbox_count),
    closure_receipt_digest: row.closure_receipt_digest
      ? (String(row.closure_receipt_digest) as Digest)
      : null,
    main_read_after_head: row.main_read_after_head ? String(row.main_read_after_head) : null,
    db_replay_digest: row.db_replay_digest ? (String(row.db_replay_digest) as Digest) : null,
    po_decision_digest: row.po_decision_digest ? (String(row.po_decision_digest) as Digest) : null,
    updated_at: String(row.updated_at),
  };
}

function assertSameIdentity(
  current: ExecutionEpisodeProjection,
  command: ExecutionEpisodeTransition,
): void {
  const pairs: Array<[unknown, unknown, string]> = [
    [
      current.workflow_registry_version,
      command.workflow_identity.registry_version,
      "registry_version",
    ],
    [
      current.workflow_registry_source_digest,
      command.workflow_identity.registry_source_digest,
      "registry_source_digest",
    ],
    [current.workflow_target_axis, command.workflow_identity.target_axis, "target_axis"],
    [current.workflow_target_id, command.workflow_identity.target_id, "target_id"],
    [current.source_event_id, command.source_event_id, "source_event_id"],
    [current.source_event_digest, command.source_event_digest, "source_event_digest"],
    [current.owner, command.owner, "owner"],
    [current.behavior_contract_id, command.behavior_contract_id, "behavior_contract_id"],
  ];
  const conflict = pairs.find(([left, right]) => left !== right);
  if (conflict) throw new Error(`execution episode immutable identity conflict: ${conflict[2]}`);
}

function requiredResources(
  state: ExecutionEpisodeState,
  projection: ExecutionEpisodeProjection,
): void {
  const rank = EXECUTION_EPISODE_STATES.indexOf(state);
  if (rank >= EXECUTION_EPISODE_STATES.indexOf("planned")) {
    if (projection.issue_number === null)
      throw new Error("execution episode issue_number is required");
    required(projection.plan_id ?? "", "plan_id");
  }
  if (rank >= EXECUTION_EPISODE_STATES.indexOf("branch_bound")) {
    required(projection.branch_name ?? "", "branch_name");
    required(projection.base_ref ?? "", "base_ref");
  }
  if (rank >= EXECUTION_EPISODE_STATES.indexOf("pr_open")) {
    if (projection.pr_number === null) throw new Error("execution episode pr_number is required");
    required(projection.head_sha ?? "", "head_sha");
  }
}

function reduceTransition(
  current: ExecutionEpisodeProjection | null,
  command: ExecutionEpisodeTransition,
): { event: ExecutionEpisodeEvent; projection: ExecutionEpisodeProjection } {
  assertIdentity(command);
  if (current === null) {
    if (command.expected_revision !== 0) throw new Error("execution episode revision mismatch");
    if (command.to_state !== "admitted") throw new Error("execution episode transition invalid");
  } else {
    assertSameIdentity(current, command);
    if (current.revision !== command.expected_revision) {
      throw new Error("execution episode revision mismatch");
    }
    if (NEXT_STATE[current.state] !== command.to_state) {
      throw new Error("execution episode transition invalid");
    }
  }
  const disposition = command.disposition ?? null;
  if ((command.to_state === "closed") !== (disposition !== null)) {
    throw new Error("execution episode terminal disposition must be exactly one");
  }
  if (command.to_state === "closed" && current && current.pending_outbox_count !== 0) {
    throw new Error("execution episode pending outbox blocks terminal transition");
  }
  if (command.to_state !== "closed" && !command.outbox) {
    throw new Error("execution episode outbox is required before terminal state");
  }
  if (command.to_state === "closed" && command.outbox) {
    throw new Error("execution episode terminal transition cannot create outbox work");
  }
  const terminalEvidence = command.terminal_evidence ?? null;
  if ((command.to_state === "closed") !== (terminalEvidence !== null)) {
    throw new Error("execution episode terminal evidence must be exactly one");
  }
  if (terminalEvidence && current) {
    if (terminalEvidence.main_read_after_head !== current.head_sha) {
      throw new Error("execution episode main read-after HEAD mismatch");
    }
    if (terminalEvidence.db_replay_digest !== digest(current)) {
      throw new Error("execution episode DB replay convergence mismatch");
    }
    if (
      terminalEvidence.closure_receipt_episode_id !== command.episode_id ||
      terminalEvidence.closure_receipt_head_sha !== current.head_sha
    ) {
      throw new Error("execution episode closure receipt binding mismatch");
    }
    if (
      (disposition === "superseded" || disposition === "cancelled") !==
      (terminalEvidence.po_decision_digest !== undefined)
    ) {
      throw new Error("execution episode PO decision evidence mismatch");
    }
    if (
      terminalEvidence.po_decision_digest !== undefined &&
      (terminalEvidence.po_decision_episode_id !== command.episode_id ||
        terminalEvidence.po_decision_head_sha !== current.head_sha)
    ) {
      throw new Error("execution episode PO decision binding mismatch");
    }
  }

  const revision = command.expected_revision + 1;
  const sequence = (current?.last_event_sequence ?? 0) + 1;
  const eventId = `${command.episode_id}:event:${sequence}`;
  const base: Omit<ExecutionEpisodeProjection, "last_event_digest"> = {
    episode_id: command.episode_id,
    state: command.to_state,
    revision,
    disposition,
    workflow_registry_version: command.workflow_identity.registry_version,
    workflow_registry_source_digest: command.workflow_identity.registry_source_digest,
    workflow_target_axis: command.workflow_identity.target_axis,
    workflow_target_id: command.workflow_identity.target_id,
    source_event_id: command.source_event_id,
    source_event_digest: command.source_event_digest,
    issue_number: immutable(
      current?.issue_number ?? null,
      command.resources.issue_number,
      "issue_number",
    ),
    plan_id: immutable(current?.plan_id ?? null, command.resources.plan_id, "plan_id"),
    branch_name: immutable(
      current?.branch_name ?? null,
      command.resources.branch_name,
      "branch_name",
    ),
    pr_number: immutable(current?.pr_number ?? null, command.resources.pr_number, "pr_number"),
    base_ref: immutable(current?.base_ref ?? null, command.resources.base_ref, "base_ref"),
    head_sha: command.resources.head_sha ?? current?.head_sha ?? null,
    owner: command.owner,
    behavior_contract_id: command.behavior_contract_id,
    last_event_id: eventId,
    last_event_sequence: sequence,
    pending_outbox_count: (current?.pending_outbox_count ?? 0) + (command.outbox ? 1 : 0),
    closure_receipt_digest: terminalEvidence?.closure_receipt_digest ?? null,
    main_read_after_head: terminalEvidence?.main_read_after_head ?? null,
    db_replay_digest: terminalEvidence?.db_replay_digest ?? null,
    po_decision_digest: terminalEvidence?.po_decision_digest ?? null,
    updated_at: command.occurred_at,
  };
  requiredResources(command.to_state, base as ExecutionEpisodeProjection);
  const eventCore = {
    event_id: eventId,
    episode_id: command.episode_id,
    sequence,
    revision,
    event_kind: "state_transition" as const,
    from_state: current?.state ?? null,
    to_state: command.to_state,
    idempotency_key: command.idempotency_key,
    command_digest: digest(command),
    projection_json: "",
    occurred_at: command.occurred_at,
  };
  const eventDigest = digest({ ...eventCore, projection: base });
  const projection: ExecutionEpisodeProjection = { ...base, last_event_digest: eventDigest };
  const event: ExecutionEpisodeEvent = {
    ...eventCore,
    projection_json: stable(projection),
    event_digest: eventDigest,
  };
  return { event, projection };
}

function eventFromRow(row: Record<string, unknown>): ExecutionEpisodeEvent {
  const eventKind = String(row.event_kind);
  const fromState = row.from_state === null ? null : String(row.from_state);
  const toState = String(row.to_state);
  if (!EXECUTION_EPISODE_EVENT_KINDS.has(eventKind)) {
    throw new Error("execution episode event_kind is invalid");
  }
  if (
    (fromState !== null && !EXECUTION_EPISODE_STATE_SET.has(fromState)) ||
    !EXECUTION_EPISODE_STATE_SET.has(toState)
  ) {
    throw new Error("execution episode event state is invalid");
  }
  return {
    event_id: String(row.event_id),
    episode_id: String(row.episode_id),
    sequence: Number(row.sequence),
    revision: Number(row.revision),
    event_kind: eventKind as ExecutionEpisodeEvent["event_kind"],
    from_state: fromState as ExecutionEpisodeState | null,
    to_state: toState as ExecutionEpisodeState,
    idempotency_key: String(row.idempotency_key),
    command_digest: String(row.command_digest) as Digest,
    projection_json: String(row.projection_json),
    event_digest: String(row.event_digest) as Digest,
    occurred_at: String(row.occurred_at),
  };
}

export function loadExecutionEpisodeEvents(
  db: HarnessDb,
  episodeId: string,
): ExecutionEpisodeEvent[] {
  required(episodeId, "episode_id");
  return db
    .prepare(
      "SELECT * FROM github_execution_episode_events WHERE episode_id = ? ORDER BY sequence ASC",
    )
    .all(episodeId)
    .map(eventFromRow);
}

export function loadExecutionEpisodeProjection(
  db: HarnessDb,
  episodeId: string,
): ExecutionEpisodeProjection | null {
  required(episodeId, "episode_id");
  const row = db
    .prepare("SELECT * FROM github_execution_episodes WHERE episode_id = ?")
    .get(episodeId);
  return row ? projectionFromRow(row) : null;
}

export function replayExecutionEpisode(
  events: readonly ExecutionEpisodeEvent[],
): ExecutionEpisodeProjection {
  if (events.length === 0) throw new Error("execution episode replay requires events");
  let previous: ExecutionEpisodeProjection | null = null;
  for (const [index, event] of events.entries()) {
    const expected = index + 1;
    if (event.sequence !== expected) {
      throw new Error("execution episode replay sequence gap");
    }
    const projection = JSON.parse(event.projection_json) as ExecutionEpisodeProjection;
    if (
      projection.episode_id !== event.episode_id ||
      projection.revision !== event.revision ||
      projection.state !== event.to_state ||
      projection.last_event_id !== event.event_id ||
      projection.last_event_sequence !== event.sequence ||
      projection.last_event_digest !== event.event_digest
    ) {
      throw new Error("execution episode replay projection drift");
    }
    const { last_event_digest: _lastEventDigest, ...projectionForDigest } = projection;
    const eventForDigest = {
      event_id: event.event_id,
      episode_id: event.episode_id,
      sequence: event.sequence,
      revision: event.revision,
      event_kind: event.event_kind,
      from_state: event.from_state,
      to_state: event.to_state,
      idempotency_key: event.idempotency_key,
      command_digest: event.command_digest,
      projection_json: "",
      occurred_at: event.occurred_at,
    };
    if (digest({ ...eventForDigest, projection: projectionForDigest }) !== event.event_digest) {
      throw new Error("execution episode replay event digest drift");
    }
    if (event.event_kind === "state_transition") {
      if (event.from_state !== (previous?.state ?? null)) {
        throw new Error("execution episode replay transition drift");
      }
      if (event.revision !== (previous?.revision ?? 0) + 1) {
        throw new Error("execution episode replay revision drift");
      }
      if (previous && NEXT_STATE[previous.state] !== projection.state) {
        throw new Error("execution episode replay transition drift");
      }
      if (projection.state === "closed") {
        if (!previous) {
          throw new Error("execution episode replay terminal predecessor missing");
        }
        if (
          previous.pending_outbox_count !== 0 ||
          projection.closure_receipt_digest === null ||
          projection.main_read_after_head !== previous.head_sha ||
          projection.db_replay_digest !== digest(previous) ||
          (projection.disposition === "superseded" || projection.disposition === "cancelled") !==
            (projection.po_decision_digest !== null)
        ) {
          throw new Error("execution episode replay terminal evidence drift");
        }
      }
    } else {
      if (
        !previous ||
        event.from_state !== previous.state ||
        event.to_state !== previous.state ||
        event.revision !== previous.revision ||
        projection.pending_outbox_count !== previous.pending_outbox_count - 1
      ) {
        throw new Error("execution episode replay outbox delivery drift");
      }
    }
    previous = projection;
  }
  return previous as ExecutionEpisodeProjection;
}

function resultFromExisting(
  db: HarnessDb,
  event: ExecutionEpisodeEvent,
): ExecutionEpisodeTransitionResult {
  const projection = JSON.parse(event.projection_json) as ExecutionEpisodeProjection;
  const row = db
    .prepare("SELECT * FROM github_execution_episode_outbox WHERE event_id = ?")
    .get(event.event_id);
  return {
    event,
    projection,
    outbox: row
      ? {
          outbox_id: String(row.outbox_id),
          episode_id: String(row.episode_id),
          event_id: String(row.event_id),
          destination: String(row.destination),
          payload_digest: String(row.payload_digest) as Digest,
          delivery_status: String(row.delivery_status) as "pending" | "delivered",
          attempts: Number(row.attempts),
          created_at: String(row.created_at),
          delivered_at: row.delivered_at === null ? null : String(row.delivered_at),
        }
      : null,
    replayed: true,
  };
}

function leasedResources(projection: ExecutionEpisodeProjection): Array<[string, string]> {
  const candidates: Array<[string, string | number | null]> = [
    ["source_event_id", projection.source_event_id],
    ["issue_number", projection.issue_number],
    ["plan_id", projection.plan_id],
    ["branch_name", projection.branch_name],
    ["pr_number", projection.pr_number],
    ["behavior_contract_id", projection.behavior_contract_id],
  ];
  return candidates
    .filter((entry): entry is [string, string | number] => entry[1] !== null)
    .map(([kind, value]) => [kind, String(value)]);
}

function synchronizeResourceLeases(
  db: HarnessDb,
  previous: ExecutionEpisodeProjection | null,
  next: ExecutionEpisodeProjection,
): void {
  const previousKeys = new Set(
    (previous ? leasedResources(previous) : []).map((v) => v.join("\n")),
  );
  const nextResources = leasedResources(next);
  const nextKeys = new Set(nextResources.map((v) => v.join("\n")));
  for (const [kind, value] of previous ? leasedResources(previous) : []) {
    if (!nextKeys.has(`${kind}\n${value}`) || next.state === "closed") {
      db.prepare(
        "UPDATE github_execution_episode_resource_leases SET released_at = ? WHERE episode_id = ? AND resource_kind = ? AND resource_value = ? AND released_at IS NULL",
      ).run(next.updated_at, next.episode_id, kind, value);
    }
  }
  if (next.state === "closed") return;
  for (const [kind, value] of nextResources) {
    if (previousKeys.has(`${kind}\n${value}`)) continue;
    const conflict = db
      .prepare(
        "SELECT episode_id FROM github_execution_episode_resource_leases WHERE resource_kind = ? AND resource_value = ? AND released_at IS NULL",
      )
      .get(kind, value);
    if (conflict && String(conflict.episode_id) !== next.episode_id) {
      throw new Error(`execution episode active resource conflict: ${kind}`);
    }
    db.prepare(
      "INSERT INTO github_execution_episode_resource_leases (lease_id, episode_id, resource_kind, resource_value, acquired_at, released_at) VALUES (?, ?, ?, ?, ?, NULL)",
    ).run(
      `${next.episode_id}:lease:${digest({ kind, value }).slice(7, 31)}`,
      next.episode_id,
      kind,
      value,
      next.updated_at,
    );
  }
}

export function commitExecutionEpisodeTransition(
  db: HarnessDb,
  command: ExecutionEpisodeTransition,
  options: { fault_after?: "event" | "outbox" | "projection" } = {},
): ExecutionEpisodeTransitionResult {
  assertIdentity(command);
  const commandDigest = digest(command);
  const preexisting = db
    .prepare("SELECT * FROM github_execution_episode_events WHERE idempotency_key = ?")
    .get(command.idempotency_key);
  if (preexisting) {
    const event = eventFromRow(preexisting);
    if (event.command_digest !== commandDigest) {
      throw new Error("execution episode idempotency conflict");
    }
    return resultFromExisting(db, event);
  }

  db.exec("BEGIN IMMEDIATE");
  try {
    const repeated = db
      .prepare("SELECT * FROM github_execution_episode_events WHERE idempotency_key = ?")
      .get(command.idempotency_key);
    if (repeated) {
      const event = eventFromRow(repeated);
      if (event.command_digest !== commandDigest) {
        throw new Error("execution episode idempotency conflict");
      }
      db.exec("COMMIT");
      return resultFromExisting(db, event);
    }
    const currentRow = db
      .prepare("SELECT * FROM github_execution_episodes WHERE episode_id = ?")
      .get(command.episode_id);
    const current = currentRow ? projectionFromRow(currentRow) : null;
    if (command.to_state === "closed" && current) {
      if (!command.terminal_evidence) {
        throw new Error("execution episode terminal evidence must be exactly one");
      }
      const replayed = replayExecutionEpisode(loadExecutionEpisodeEvents(db, command.episode_id));
      if (stable(replayed) !== stable(current)) {
        throw new Error("execution episode persisted projection replay drift");
      }
      if (command.terminal_evidence?.db_replay_digest !== digest(replayed)) {
        throw new Error("execution episode DB replay convergence mismatch");
      }
    }
    const reduced = reduceTransition(current, command);
    synchronizeResourceLeases(db, current, reduced.projection);
    const event = { ...reduced.event, command_digest: commandDigest };
    db.prepare(
      "INSERT INTO github_execution_episode_events (event_id, episode_id, sequence, revision, event_kind, from_state, to_state, idempotency_key, command_digest, projection_json, event_digest, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      event.event_id,
      event.episode_id,
      event.sequence,
      event.revision,
      event.event_kind,
      event.from_state,
      event.to_state,
      event.idempotency_key,
      event.command_digest,
      event.projection_json,
      event.event_digest,
      event.occurred_at,
    );
    if (options.fault_after === "event") throw new Error("execution episode injected fault");
    const outbox = command.outbox
      ? {
          outbox_id: `${command.episode_id}:outbox:${event.revision}`,
          episode_id: command.episode_id,
          event_id: event.event_id,
          destination: command.outbox.destination,
          payload_digest: command.outbox.payload_digest,
          delivery_status: "pending" as const,
          attempts: 0 as const,
          created_at: command.occurred_at,
          delivered_at: null,
        }
      : null;
    if (outbox) {
      db.prepare(
        "INSERT INTO github_execution_episode_outbox (outbox_id, episode_id, event_id, destination, payload_digest, delivery_status, attempts, created_at, delivered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        outbox.outbox_id,
        outbox.episode_id,
        outbox.event_id,
        outbox.destination,
        outbox.payload_digest,
        outbox.delivery_status,
        outbox.attempts,
        outbox.created_at,
        outbox.delivered_at,
      );
    }
    if (options.fault_after === "outbox") throw new Error("execution episode injected fault");
    const p = reduced.projection;
    db.prepare(
      "INSERT INTO github_execution_episodes (episode_id, state, revision, disposition, workflow_registry_version, workflow_registry_source_digest, workflow_target_axis, workflow_target_id, source_event_id, source_event_digest, issue_number, plan_id, branch_name, pr_number, base_ref, head_sha, owner, behavior_contract_id, last_event_id, last_event_sequence, last_event_digest, pending_outbox_count, closure_receipt_digest, main_read_after_head, db_replay_digest, po_decision_digest, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(episode_id) DO UPDATE SET state=excluded.state, revision=excluded.revision, disposition=excluded.disposition, issue_number=excluded.issue_number, plan_id=excluded.plan_id, branch_name=excluded.branch_name, pr_number=excluded.pr_number, base_ref=excluded.base_ref, head_sha=excluded.head_sha, last_event_id=excluded.last_event_id, last_event_sequence=excluded.last_event_sequence, last_event_digest=excluded.last_event_digest, pending_outbox_count=excluded.pending_outbox_count, closure_receipt_digest=excluded.closure_receipt_digest, main_read_after_head=excluded.main_read_after_head, db_replay_digest=excluded.db_replay_digest, po_decision_digest=excluded.po_decision_digest, updated_at=excluded.updated_at",
    ).run(
      p.episode_id,
      p.state,
      p.revision,
      p.disposition,
      p.workflow_registry_version,
      p.workflow_registry_source_digest,
      p.workflow_target_axis,
      p.workflow_target_id,
      p.source_event_id,
      p.source_event_digest,
      p.issue_number,
      p.plan_id,
      p.branch_name,
      p.pr_number,
      p.base_ref,
      p.head_sha,
      p.owner,
      p.behavior_contract_id,
      p.last_event_id,
      p.last_event_sequence,
      p.last_event_digest,
      p.pending_outbox_count,
      p.closure_receipt_digest,
      p.main_read_after_head,
      p.db_replay_digest,
      p.po_decision_digest,
      p.updated_at,
    );
    projectExecutionEpisodeLocation(db, p.episode_id);
    if (options.fault_after === "projection") {
      throw new Error("execution episode injected fault");
    }
    db.exec("COMMIT");
    return { event, projection: p, outbox, replayed: false };
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // transaction may already be committed by the concurrent replay path
    }
    throw error;
  }
}

export function acknowledgeExecutionEpisodeOutbox(
  db: HarnessDb,
  outboxId: string,
  deliveredAt: string,
): ExecutionEpisodeProjection {
  required(outboxId, "outbox_id");
  if (Number.isNaN(Date.parse(deliveredAt))) {
    throw new Error("execution episode delivered_at is invalid");
  }
  db.exec("BEGIN IMMEDIATE");
  try {
    const row = db
      .prepare("SELECT * FROM github_execution_episode_outbox WHERE outbox_id = ?")
      .get(outboxId);
    if (!row) throw new Error("execution episode outbox not found");
    const episodeId = String(row.episode_id);
    if (String(row.delivery_status) === "pending") {
      const projectionRow = db
        .prepare("SELECT * FROM github_execution_episodes WHERE episode_id = ?")
        .get(episodeId);
      if (!projectionRow) throw new Error("execution episode projection not found");
      const current = projectionFromRow(projectionRow);
      if (current.pending_outbox_count <= 0) {
        throw new Error("execution episode outbox projection conflict");
      }
      const sequence = current.last_event_sequence + 1;
      const eventId = `${episodeId}:event:${sequence}`;
      const commandBody = {
        outbox_id: outboxId,
        event_id: String(row.event_id),
        payload_digest: String(row.payload_digest),
        delivered_at: deliveredAt,
      };
      const eventCore = {
        event_id: eventId,
        episode_id: episodeId,
        sequence,
        revision: current.revision,
        event_kind: "outbox_delivered" as const,
        from_state: current.state,
        to_state: current.state,
        idempotency_key: `outbox:${outboxId}:delivered`,
        command_digest: digest(commandBody),
        projection_json: "",
        occurred_at: deliveredAt,
      };
      const projectionBase = {
        ...current,
        last_event_id: eventId,
        last_event_sequence: sequence,
        pending_outbox_count: current.pending_outbox_count - 1,
        updated_at: deliveredAt,
      };
      const { last_event_digest: _previousDigest, ...projectionForDigest } = projectionBase;
      const eventDigest = digest({ ...eventCore, projection: projectionForDigest });
      const projection: ExecutionEpisodeProjection = {
        ...projectionBase,
        last_event_digest: eventDigest,
      };
      db.prepare(
        "INSERT INTO github_execution_episode_events (event_id, episode_id, sequence, revision, event_kind, from_state, to_state, idempotency_key, command_digest, projection_json, event_digest, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        eventCore.event_id,
        eventCore.episode_id,
        eventCore.sequence,
        eventCore.revision,
        eventCore.event_kind,
        eventCore.from_state,
        eventCore.to_state,
        eventCore.idempotency_key,
        eventCore.command_digest,
        stable(projection),
        eventDigest,
        eventCore.occurred_at,
      );
      const updated = db
        .prepare(
          "UPDATE github_execution_episode_outbox SET delivery_status = ?, attempts = attempts + 1, delivered_at = ? WHERE outbox_id = ? AND delivery_status = ?",
        )
        .run("delivered", deliveredAt, outboxId, "pending");
      if (updated.changes !== 1) throw new Error("execution episode outbox delivery conflict");
      const projected = db
        .prepare(
          "UPDATE github_execution_episodes SET last_event_id = ?, last_event_sequence = ?, last_event_digest = ?, pending_outbox_count = ?, updated_at = ? WHERE episode_id = ? AND last_event_sequence = ?",
        )
        .run(
          projection.last_event_id,
          projection.last_event_sequence,
          projection.last_event_digest,
          projection.pending_outbox_count,
          deliveredAt,
          episodeId,
          current.last_event_sequence,
        );
      if (projected.changes !== 1) throw new Error("execution episode outbox projection conflict");
    } else if (String(row.delivery_status) !== "delivered") {
      throw new Error("execution episode outbox delivery_status invalid");
    }
    const finalProjectionRow = db
      .prepare("SELECT * FROM github_execution_episodes WHERE episode_id = ?")
      .get(episodeId);
    if (!finalProjectionRow) throw new Error("execution episode projection not found");
    projectExecutionEpisodeLocation(db, episodeId);
    db.exec("COMMIT");
    return projectionFromRow(finalProjectionRow);
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // no-op: preserve the original failure
    }
    throw error;
  }
}
