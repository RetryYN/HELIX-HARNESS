// PLAN-L7-577-github-execution-episode-location-projection — U-GHEPL-001
// PLAN-L7-577-github-execution-episode-location-projection — U-GHEPL-002
// PLAN-L7-577-github-execution-episode-location-projection — U-GHEPL-003
// PLAN-L7-577-github-execution-episode-location-projection — U-GHEPL-004
// PLAN-L7-577-github-execution-episode-location-projection — U-GHEPL-005
// PLAN-L7-577-github-execution-episode-location-projection — U-GHEPL-006
// PLAN-L7-577-github-execution-episode-location-projection — U-GHEPL-007

import { describe, expect, it } from "vitest";
import { HARNESS_DB_TABLES } from "../src/schema/harness-db";
import {
  acknowledgeExecutionEpisodeOutbox,
  commitExecutionEpisodeTransition,
  type ExecutionEpisodeTransition,
  executionEpisodeProjectionDigest,
  loadExecutionEpisodeProjection,
} from "../src/state-db/github-execution-episode";
import {
  listExecutionEpisodeLocations,
  loadExecutionEpisodeLocation,
  loadExecutionEpisodeLocationAggregate,
  projectCurrentLocationSnapshotHash,
  verifyExecutionEpisodeLocationConvergence,
} from "../src/state-db/github-execution-episode-location";
import { type HarnessDb, openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const sha = (value: string): `sha256:${string}` => `sha256:${value.padEnd(64, value).slice(0, 64)}`;

function command(
  suffix: string,
  overrides: Partial<ExecutionEpisodeTransition> = {},
): ExecutionEpisodeTransition {
  const episodeId = `ep_01JLOCATION00000000000000${suffix}`;
  return {
    episode_id: episodeId,
    idempotency_key: `episode:${episodeId}:admitted:0`,
    expected_revision: 0,
    to_state: "admitted",
    occurred_at: "2026-08-16T02:10:00Z",
    workflow_identity: {
      registry_version: "1.1.4",
      registry_source_digest: sha("a"),
      target_axis: "workflow_model",
      target_id: "RETROFIT",
    },
    source_event_id: `github:issue:20${suffix}:opened`,
    source_event_digest: sha(`b${suffix}`),
    owner: `codex-${suffix}`,
    behavior_contract_id: `GITHUB-EPISODE-LOCATION-${suffix}`,
    resources: {},
    outbox: { destination: "github", payload_digest: sha(`c${suffix}`) },
    ...overrides,
  };
}

function acknowledge(db: HarnessDb, outboxId: string, second: number): void {
  acknowledgeExecutionEpisodeOutbox(
    db,
    outboxId,
    `2026-08-16T02:10:${String(second).padStart(2, "0")}Z`,
  );
}

function advanceToPrOpen(db: HarnessDb, suffix: string, issue: number): string {
  const episodeId = `ep_01JLOCATION00000000000000${suffix}`;
  let result = commitExecutionEpisodeTransition(db, command(suffix));
  acknowledge(db, result.outbox?.outbox_id ?? "", 1);
  const resources = { issue_number: issue, plan_id: `PLAN-L7-57${suffix}-location` };
  result = commitExecutionEpisodeTransition(
    db,
    command(suffix, {
      idempotency_key: `episode:${episodeId}:planned:1`,
      expected_revision: 1,
      to_state: "planned",
      resources,
    }),
  );
  acknowledge(db, result.outbox?.outbox_id ?? "", 2);
  const branchResources = {
    ...resources,
    branch_name: `feature/location-${suffix}`,
    base_ref: "main",
  };
  result = commitExecutionEpisodeTransition(
    db,
    command(suffix, {
      idempotency_key: `episode:${episodeId}:branch:2`,
      expected_revision: 2,
      to_state: "branch_bound",
      resources: branchResources,
    }),
  );
  acknowledge(db, result.outbox?.outbox_id ?? "", 3);
  result = commitExecutionEpisodeTransition(
    db,
    command(suffix, {
      idempotency_key: `episode:${episodeId}:pr:3`,
      expected_revision: 3,
      to_state: "pr_open",
      resources: {
        ...branchResources,
        pr_number: 740 + issue,
        head_sha: suffix.repeat(40).slice(0, 40),
      },
    }),
  );
  acknowledge(db, result.outbox?.outbox_id ?? "", 4);
  return episodeId;
}

describe("execution episode current-location projection", () => {
  it("U-GHEPL-001: episode commitとlocation upsertを同時transactionにする", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      expect(() =>
        commitExecutionEpisodeTransition(db, command("1"), { fault_after: "projection" }),
      ).toThrow(/injected fault/u);
      for (const table of [
        "github_execution_episode_events",
        "github_execution_episodes",
        "github_execution_episode_locations",
        "github_execution_episode_location_aggregate",
        "project_current_location",
      ]) {
        expect(db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()?.count).toBe(0);
      }
    } finally {
      db.close();
    }
  });

  it("U-GHEPL-002: typed identityとepisode identityをexact投影する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const result = commitExecutionEpisodeTransition(db, command("1"));
      expect(loadExecutionEpisodeLocation(db, result.projection.episode_id)).toMatchObject({
        episode_id: result.projection.episode_id,
        episode_state: "admitted",
        revision: 1,
        workflow_registry_version: "1.1.4",
        workflow_target_axis: "workflow_model",
        workflow_target_id: "RETROFIT",
        owner: "codex-1",
        behavior_contract_id: "GITHUB-EPISODE-LOCATION-1",
        last_event_digest: result.projection.last_event_digest,
      });
    } finally {
      db.close();
    }
  });

  it("U-GHEPL-003: HEAD更新とoutbox ACKへ追従する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const episodeId = advanceToPrOpen(db, "2", 202);
      const result = commitExecutionEpisodeTransition(
        db,
        command("2", {
          idempotency_key: `episode:${episodeId}:review:4`,
          expected_revision: 4,
          to_state: "review_pending",
          resources: {
            issue_number: 202,
            plan_id: "PLAN-L7-572-location",
            branch_name: "feature/location-2",
            base_ref: "main",
            pr_number: 942,
            head_sha: "d".repeat(40),
          },
        }),
      );
      expect(loadExecutionEpisodeLocation(db, episodeId)).toMatchObject({
        head_sha: "d".repeat(40),
        revision: 5,
        pending_outbox_count: 1,
        last_event_digest: result.projection.last_event_digest,
      });
      acknowledge(db, result.outbox?.outbox_id ?? "", 5);
      const current = loadExecutionEpisodeProjection(db, episodeId);
      expect(loadExecutionEpisodeLocation(db, episodeId)).toMatchObject({
        pending_outbox_count: 0,
        last_event_digest: current?.last_event_digest,
        last_event_sequence: current?.last_event_sequence,
      });
    } finally {
      db.close();
    }
  });

  it("U-GHEPL-004: 複数active episodeを全件保持する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      advanceToPrOpen(db, "2", 202);
      advanceToPrOpen(db, "3", 203);
      expect(listExecutionEpisodeLocations(db).map((location) => location.episode_id)).toEqual([
        "ep_01JLOCATION000000000000002",
        "ep_01JLOCATION000000000000003",
      ]);
      expect(loadExecutionEpisodeLocationAggregate(db)).toMatchObject({
        active_count: 2,
        terminal_count: 0,
      });
    } finally {
      db.close();
    }
  });

  it("U-GHEPL-005: terminalとcanonical set digestを集約する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const episodeId = advanceToPrOpen(db, "4", 204);
      const resources = {
        issue_number: 204,
        plan_id: "PLAN-L7-574-location",
        branch_name: "feature/location-4",
        base_ref: "main",
        pr_number: 944,
        head_sha: "4".repeat(40),
      };
      const states = ["review_pending", "merge_ready", "merged", "closure_pending"] as const;
      let revision = 4;
      for (const [index, state] of states.entries()) {
        const result = commitExecutionEpisodeTransition(
          db,
          command("4", {
            idempotency_key: `episode:${episodeId}:${state}:${revision}`,
            expected_revision: revision,
            to_state: state,
            resources,
          }),
        );
        acknowledge(db, result.outbox?.outbox_id ?? "", 5 + index);
        revision += 1;
      }
      const current = loadExecutionEpisodeProjection(db, episodeId);
      if (!current) throw new Error("expected current episode");
      commitExecutionEpisodeTransition(
        db,
        command("4", {
          idempotency_key: `episode:${episodeId}:closed:8`,
          expected_revision: 8,
          to_state: "closed",
          resources,
          disposition: "resolved",
          terminal_evidence: {
            closure_receipt_digest: sha("e"),
            closure_receipt_episode_id: episodeId,
            closure_receipt_head_sha: resources.head_sha,
            main_read_after_head: resources.head_sha,
            db_replay_digest: executionEpisodeProjectionDigest(current),
          },
          outbox: undefined,
        }),
      );
      expect(loadExecutionEpisodeLocationAggregate(db)).toMatchObject({
        active_count: 0,
        terminal_count: 1,
      });
      expect(loadExecutionEpisodeLocation(db, episodeId)).toMatchObject({
        episode_state: "closed",
        disposition: "resolved",
      });
      const global = db
        .prepare("SELECT * FROM project_current_location WHERE snapshot_id = ?")
        .get("project-current-location:latest");
      expect(global).toMatchObject({
        execution_episode_active_count: 0,
        execution_episode_terminal_count: 1,
        execution_episode_set_digest: loadExecutionEpisodeLocationAggregate(db).episode_set_digest,
      });
      expect(global?.snapshot_hash).toBe(projectCurrentLocationSnapshotHash(global ?? {}));
    } finally {
      db.close();
    }
  });

  it("U-GHEPL-006: legacy identityを再出力しない", () => {
    const table = HARNESS_DB_TABLES.find(
      (candidate) => candidate.name === "github_execution_episode_locations",
    );
    const columns = table?.columns.map((column) => column.name) ?? [];
    expect(columns).toEqual(
      expect.arrayContaining([
        "episode_id",
        "workflow_registry_version",
        "workflow_registry_source_digest",
        "workflow_target_axis",
        "workflow_target_id",
      ]),
    );
    expect(columns).not.toEqual(
      expect.arrayContaining(["mode", "model", "route_mode", "catalog_route_id"]),
    );
  });

  it("U-GHEPL-007: episode/location driftをfail-closeする", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const result = commitExecutionEpisodeTransition(db, command("5"));
      expect(verifyExecutionEpisodeLocationConvergence(db)).toMatchObject({ ok: true });
      db.prepare(
        "UPDATE github_execution_episode_locations SET owner = ? WHERE episode_id = ?",
      ).run("foreign-owner", result.projection.episode_id);
      expect(verifyExecutionEpisodeLocationConvergence(db)).toMatchObject({
        ok: false,
        reasons: expect.arrayContaining([
          `location_drift:${result.projection.episode_id}:owner`,
          "location_aggregate_drift",
        ]),
      });
    } finally {
      db.close();
    }
  });

  it("disposition／event／global snapshot driftをU-GHEPL-007でfail-closeする", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const result = commitExecutionEpisodeTransition(db, command("6"));
      db.prepare(
        "UPDATE github_execution_episode_locations SET disposition = ?, last_event_sequence = ? WHERE episode_id = ?",
      ).run("tampered", 99, result.projection.episode_id);
      db.prepare(
        "UPDATE project_current_location SET execution_episode_active_count = ?, snapshot_hash = ? WHERE snapshot_id = ?",
      ).run(99, sha("f"), "project-current-location:latest");
      expect(verifyExecutionEpisodeLocationConvergence(db)).toMatchObject({
        ok: false,
        reasons: expect.arrayContaining([
          `location_drift:${result.projection.episode_id}:disposition`,
          `location_drift:${result.projection.episode_id}:last_event_sequence`,
          "global_location_drift:active_count",
          "global_location_drift:snapshot_hash",
        ]),
      });
    } finally {
      db.close();
    }
  });
});
