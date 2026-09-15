import { HARNESS_DB_TABLES } from "../schema/harness-db";
import { canonicalJson, type Sha256Digest, sha256Digest } from "../shared/canonical-digest";
import type { HarnessDb } from "./index";

type Digest = Sha256Digest;

export interface ExecutionEpisodeLocation {
  episode_id: string;
  episode_state: string;
  revision: number;
  disposition: string | null;
  workflow_registry_version: string;
  workflow_registry_source_digest: Digest;
  workflow_target_axis: string;
  workflow_target_id: string;
  head_sha: string | null;
  owner: string;
  behavior_contract_id: string;
  last_event_id: string;
  last_event_sequence: number;
  last_event_digest: Digest;
  pending_outbox_count: number;
  updated_at: string;
}

export interface ExecutionEpisodeLocationAggregate {
  aggregate_id: "execution-episodes:all";
  active_count: number;
  terminal_count: number;
  episode_set_digest: Digest;
  updated_at: string;
}

export interface ExecutionEpisodeLocationConvergence {
  ok: boolean;
  reasons: string[];
  episode_count: number;
  location_count: number;
  aggregate: ExecutionEpisodeLocationAggregate;
}

export function projectCurrentLocationSnapshotHash(row: Record<string, unknown>): Sha256Digest {
  const { snapshot_hash: _snapshotHash, indexed_at: _indexedAt, ...canonical } = row;
  return sha256Digest(canonicalJson(canonical));
}

function ensureProjectCurrentLocationSnapshot(
  db: HarnessDb,
  aggregate: ExecutionEpisodeLocationAggregate,
): Record<string, unknown> {
  const snapshotId = "project-current-location:latest";
  const current = db
    .prepare("SELECT * FROM project_current_location WHERE snapshot_id = ?")
    .get(snapshotId);
  if (current) return current;
  const table = HARNESS_DB_TABLES.find(
    (candidate) => candidate.name === "project_current_location",
  );
  if (!table) throw new Error("project current location schema missing");
  const bootstrap = Object.fromEntries(
    table.columns.map((column) => [column.name, column.type === "INTEGER" ? 0 : ""]),
  ) as Record<string, unknown>;
  bootstrap.snapshot_id = snapshotId;
  bootstrap.current_status = "uninitialized";
  bootstrap.execution_episode_active_count = aggregate.active_count;
  bootstrap.execution_episode_terminal_count = aggregate.terminal_count;
  bootstrap.execution_episode_set_digest = aggregate.episode_set_digest;
  bootstrap.snapshot_hash = projectCurrentLocationSnapshotHash(bootstrap);
  db.prepare(
    `INSERT INTO project_current_location (${table.columns.map((column) => column.name).join(", ")}) VALUES (${table.columns.map(() => "?").join(", ")})`,
  ).run(...table.columns.map((column) => bootstrap[column.name]));
  return bootstrap;
}

function digest(value: unknown): Digest {
  return sha256Digest(canonicalJson(value));
}

function fromRow(row: Record<string, unknown>): ExecutionEpisodeLocation {
  return {
    episode_id: String(row.episode_id),
    episode_state: String(row.episode_state),
    revision: Number(row.revision),
    disposition: row.disposition === null ? null : String(row.disposition),
    workflow_registry_version: String(row.workflow_registry_version),
    workflow_registry_source_digest: String(row.workflow_registry_source_digest) as Digest,
    workflow_target_axis: String(row.workflow_target_axis),
    workflow_target_id: String(row.workflow_target_id),
    head_sha: row.head_sha === null ? null : String(row.head_sha),
    owner: String(row.owner),
    behavior_contract_id: String(row.behavior_contract_id),
    last_event_id: String(row.last_event_id),
    last_event_sequence: Number(row.last_event_sequence),
    last_event_digest: String(row.last_event_digest) as Digest,
    pending_outbox_count: Number(row.pending_outbox_count),
    updated_at: String(row.updated_at),
  };
}

export function listExecutionEpisodeLocations(db: HarnessDb): ExecutionEpisodeLocation[] {
  return db
    .prepare("SELECT * FROM github_execution_episode_locations ORDER BY episode_id ASC")
    .all()
    .map(fromRow);
}

export function loadExecutionEpisodeLocation(
  db: HarnessDb,
  episodeId: string,
): ExecutionEpisodeLocation | null {
  const row = db
    .prepare("SELECT * FROM github_execution_episode_locations WHERE episode_id = ?")
    .get(episodeId);
  return row ? fromRow(row) : null;
}

function aggregateFromLocations(
  locations: readonly ExecutionEpisodeLocation[],
  updatedAt: string,
): ExecutionEpisodeLocationAggregate {
  const canonical = locations.map((location) => ({
    episode_id: location.episode_id,
    episode_state: location.episode_state,
    revision: location.revision,
    disposition: location.disposition,
    workflow_registry_version: location.workflow_registry_version,
    workflow_registry_source_digest: location.workflow_registry_source_digest,
    workflow_target_axis: location.workflow_target_axis,
    workflow_target_id: location.workflow_target_id,
    head_sha: location.head_sha,
    owner: location.owner,
    behavior_contract_id: location.behavior_contract_id,
    last_event_digest: location.last_event_digest,
  }));
  return {
    aggregate_id: "execution-episodes:all",
    active_count: locations.filter((location) => location.episode_state !== "closed").length,
    terminal_count: locations.filter((location) => location.episode_state === "closed").length,
    episode_set_digest: digest(canonical),
    updated_at: updatedAt,
  };
}

export function loadExecutionEpisodeLocationAggregate(
  db: HarnessDb,
): ExecutionEpisodeLocationAggregate {
  const row = db
    .prepare("SELECT * FROM github_execution_episode_location_aggregate WHERE aggregate_id = ?")
    .get("execution-episodes:all");
  if (row) {
    return {
      aggregate_id: "execution-episodes:all",
      active_count: Number(row.active_count),
      terminal_count: Number(row.terminal_count),
      episode_set_digest: String(row.episode_set_digest) as Digest,
      updated_at: String(row.updated_at),
    };
  }
  return aggregateFromLocations([], "");
}

export function projectExecutionEpisodeLocation(db: HarnessDb, episodeId: string): void {
  const episode = db
    .prepare("SELECT * FROM github_execution_episodes WHERE episode_id = ?")
    .get(episodeId);
  if (!episode) throw new Error("execution episode location source missing");
  db.prepare(
    "INSERT INTO github_execution_episode_locations (episode_id, episode_state, revision, disposition, workflow_registry_version, workflow_registry_source_digest, workflow_target_axis, workflow_target_id, head_sha, owner, behavior_contract_id, last_event_id, last_event_sequence, last_event_digest, pending_outbox_count, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(episode_id) DO UPDATE SET episode_state=excluded.episode_state, revision=excluded.revision, disposition=excluded.disposition, workflow_registry_version=excluded.workflow_registry_version, workflow_registry_source_digest=excluded.workflow_registry_source_digest, workflow_target_axis=excluded.workflow_target_axis, workflow_target_id=excluded.workflow_target_id, head_sha=excluded.head_sha, owner=excluded.owner, behavior_contract_id=excluded.behavior_contract_id, last_event_id=excluded.last_event_id, last_event_sequence=excluded.last_event_sequence, last_event_digest=excluded.last_event_digest, pending_outbox_count=excluded.pending_outbox_count, updated_at=excluded.updated_at",
  ).run(
    episode.episode_id,
    episode.state,
    episode.revision,
    episode.disposition,
    episode.workflow_registry_version,
    episode.workflow_registry_source_digest,
    episode.workflow_target_axis,
    episode.workflow_target_id,
    episode.head_sha,
    episode.owner,
    episode.behavior_contract_id,
    episode.last_event_id,
    episode.last_event_sequence,
    episode.last_event_digest,
    episode.pending_outbox_count,
    episode.updated_at,
  );
  const locations = listExecutionEpisodeLocations(db);
  const aggregate = aggregateFromLocations(locations, String(episode.updated_at));
  db.prepare(
    "INSERT INTO github_execution_episode_location_aggregate (aggregate_id, active_count, terminal_count, episode_set_digest, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(aggregate_id) DO UPDATE SET active_count=excluded.active_count, terminal_count=excluded.terminal_count, episode_set_digest=excluded.episode_set_digest, updated_at=excluded.updated_at",
  ).run(
    aggregate.aggregate_id,
    aggregate.active_count,
    aggregate.terminal_count,
    aggregate.episode_set_digest,
    aggregate.updated_at,
  );
  const global = ensureProjectCurrentLocationSnapshot(db, aggregate);
  const globalWithAggregate = {
    ...global,
    execution_episode_active_count: aggregate.active_count,
    execution_episode_terminal_count: aggregate.terminal_count,
    execution_episode_set_digest: aggregate.episode_set_digest,
  };
  const updated = db
    .prepare(
      "UPDATE project_current_location SET execution_episode_active_count = ?, execution_episode_terminal_count = ?, execution_episode_set_digest = ?, snapshot_hash = ? WHERE snapshot_id = ?",
    )
    .run(
      aggregate.active_count,
      aggregate.terminal_count,
      aggregate.episode_set_digest,
      projectCurrentLocationSnapshotHash(globalWithAggregate),
      "project-current-location:latest",
    );
  if (updated.changes !== 1) throw new Error("project current location snapshot update failed");
}

export function verifyExecutionEpisodeLocationConvergence(
  db: HarnessDb,
): ExecutionEpisodeLocationConvergence {
  const episodes = db
    .prepare("SELECT * FROM github_execution_episodes ORDER BY episode_id ASC")
    .all();
  const locations = listExecutionEpisodeLocations(db);
  const locationById = new Map(locations.map((location) => [location.episode_id, location]));
  const reasons: string[] = [];
  for (const episode of episodes) {
    const id = String(episode.episode_id);
    const location = locationById.get(id);
    if (!location) {
      reasons.push(`location_missing:${id}`);
      continue;
    }
    const pairs: Array<[unknown, unknown, string]> = [
      [episode.state, location.episode_state, "state"],
      [episode.revision, location.revision, "revision"],
      [episode.disposition, location.disposition, "disposition"],
      [episode.workflow_registry_version, location.workflow_registry_version, "registry_version"],
      [
        episode.workflow_registry_source_digest,
        location.workflow_registry_source_digest,
        "registry_digest",
      ],
      [episode.workflow_target_axis, location.workflow_target_axis, "target_axis"],
      [episode.workflow_target_id, location.workflow_target_id, "target_id"],
      [episode.head_sha, location.head_sha, "head_sha"],
      [episode.owner, location.owner, "owner"],
      [episode.behavior_contract_id, location.behavior_contract_id, "behavior_contract_id"],
      [episode.last_event_id, location.last_event_id, "last_event_id"],
      [episode.last_event_sequence, location.last_event_sequence, "last_event_sequence"],
      [episode.last_event_digest, location.last_event_digest, "last_event_digest"],
      [episode.pending_outbox_count, location.pending_outbox_count, "pending_outbox_count"],
      [episode.updated_at, location.updated_at, "updated_at"],
    ];
    for (const [source, projected, field] of pairs) {
      if (source !== projected) reasons.push(`location_drift:${id}:${field}`);
    }
  }
  const episodeIds = new Set(episodes.map((episode) => String(episode.episode_id)));
  for (const location of locations) {
    if (!episodeIds.has(location.episode_id))
      reasons.push(`location_orphan:${location.episode_id}`);
  }
  const expected = aggregateFromLocations(
    locations,
    loadExecutionEpisodeLocationAggregate(db).updated_at,
  );
  const actual = loadExecutionEpisodeLocationAggregate(db);
  if (
    expected.active_count !== actual.active_count ||
    expected.terminal_count !== actual.terminal_count ||
    expected.episode_set_digest !== actual.episode_set_digest
  ) {
    reasons.push("location_aggregate_drift");
  }
  const global = db
    .prepare("SELECT * FROM project_current_location WHERE snapshot_id = ?")
    .get("project-current-location:latest");
  if (!global) {
    reasons.push("global_location_missing");
  } else {
    const globalPairs: Array<[unknown, unknown, string]> = [
      [actual.active_count, global.execution_episode_active_count, "active_count"],
      [actual.terminal_count, global.execution_episode_terminal_count, "terminal_count"],
      [actual.episode_set_digest, global.execution_episode_set_digest, "episode_set_digest"],
    ];
    for (const [aggregateValue, globalValue, field] of globalPairs) {
      if (aggregateValue !== globalValue) reasons.push(`global_location_drift:${field}`);
    }
    if (global.snapshot_hash !== projectCurrentLocationSnapshotHash(global)) {
      reasons.push("global_location_drift:snapshot_hash");
    }
  }
  return {
    ok: reasons.length === 0,
    reasons,
    episode_count: episodes.length,
    location_count: locations.length,
    aggregate: actual,
  };
}
