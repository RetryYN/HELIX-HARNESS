// PLAN-L7-576-github-execution-episode-state — U-GHEP-001
// PLAN-L7-576-github-execution-episode-state — U-GHEP-002
// PLAN-L7-576-github-execution-episode-state — U-GHEP-003
// PLAN-L7-576-github-execution-episode-state — U-GHEP-004
// PLAN-L7-576-github-execution-episode-state — U-GHEP-005
// PLAN-L7-576-github-execution-episode-state — U-GHEP-006
// PLAN-L7-576-github-execution-episode-state — U-GHEP-007
// PLAN-L7-576-github-execution-episode-state — U-GHEP-008

import { describe, expect, it } from "vitest";
import { HARNESS_DB_INDEXES, HARNESS_DB_TABLES } from "../src/schema/harness-db";
import {
  acknowledgeExecutionEpisodeOutbox,
  commitExecutionEpisodeTransition,
  type ExecutionEpisodeTransition,
  loadExecutionEpisodeEvents,
  loadExecutionEpisodeProjection,
  replayExecutionEpisode,
} from "../src/state-db/github-execution-episode";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const digest = (value: string): `sha256:${string}` =>
  `sha256:${value.padEnd(64, value).slice(0, 64)}`;

function admission(
  overrides: Partial<ExecutionEpisodeTransition> = {},
): ExecutionEpisodeTransition {
  return {
    episode_id: "ep_01JTEST000000000000000001",
    idempotency_key: "episode:ep_01JTEST000000000000000001:admitted:0",
    expected_revision: 0,
    to_state: "admitted",
    occurred_at: "2026-08-16T00:00:00Z",
    workflow_identity: {
      registry_version: "1.1.3",
      registry_source_digest: digest("a"),
      target_axis: "workflow_model",
      target_id: "RETROFIT",
    },
    source_event_id: "github:issue:205:opened",
    source_event_digest: digest("b"),
    owner: "codex",
    behavior_contract_id: "GITHUB-EXECUTION-EPISODE-STATE-001",
    resources: {},
    outbox: {
      destination: "github",
      payload_digest: digest("c"),
    },
    ...overrides,
  };
}

describe("GitHub execution episode state", () => {
  it("U-GHEP-001: identity完全入力だけをadmittedへ投影する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const result = commitExecutionEpisodeTransition(db, admission());
      expect(result.projection).toMatchObject({
        episode_id: "ep_01JTEST000000000000000001",
        state: "admitted",
        revision: 1,
        workflow_target_axis: "workflow_model",
        workflow_target_id: "RETROFIT",
        owner: "codex",
      });
      expect(() =>
        commitExecutionEpisodeTransition(db, admission({ behavior_contract_id: "" })),
      ).toThrow(/behavior_contract_id/u);
    } finally {
      db.close();
    }
  });

  it("U-GHEP-002: 順序飛越しとstale revisionを拒否する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      commitExecutionEpisodeTransition(db, admission());
      expect(() =>
        commitExecutionEpisodeTransition(
          db,
          admission({
            idempotency_key: "episode:ep_01JTEST000000000000000001:pr_open:1",
            expected_revision: 1,
            to_state: "pr_open",
          }),
        ),
      ).toThrow(/transition/u);
      expect(() =>
        commitExecutionEpisodeTransition(
          db,
          admission({
            idempotency_key: "episode:ep_01JTEST000000000000000001:planned:stale",
            expected_revision: 0,
            to_state: "planned",
          }),
        ),
      ).toThrow(/revision/u);
    } finally {
      db.close();
    }
  });

  it("U-GHEP-003: resourceは未束縛から一度だけ追加でき差替えを拒否する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const admitted = commitExecutionEpisodeTransition(db, admission());
      acknowledgeExecutionEpisodeOutbox(
        db,
        admitted.outbox?.outbox_id ?? "",
        "2026-08-16T00:00:01Z",
      );
      const planned = commitExecutionEpisodeTransition(
        db,
        admission({
          idempotency_key: "episode:ep_01JTEST000000000000000001:planned:1",
          expected_revision: 1,
          to_state: "planned",
          occurred_at: "2026-08-16T00:00:02Z",
          resources: { issue_number: 205, plan_id: "PLAN-L7-576-github-execution-episode-state" },
        }),
      );
      acknowledgeExecutionEpisodeOutbox(
        db,
        planned.outbox?.outbox_id ?? "",
        "2026-08-16T00:00:03Z",
      );
      expect(() =>
        commitExecutionEpisodeTransition(
          db,
          admission({
            idempotency_key: "episode:ep_01JTEST000000000000000001:branch_bound:2",
            expected_revision: 2,
            to_state: "branch_bound",
            occurred_at: "2026-08-16T00:00:04Z",
            resources: {
              issue_number: 999,
              plan_id: "PLAN-L7-576-github-execution-episode-state",
              branch_name: "feature/execution-episode-state-205",
              base_ref: "main",
            },
          }),
        ),
      ).toThrow(/immutable resource conflict: issue_number/u);
    } finally {
      db.close();
    }
  });

  it("U-GHEP-005: 同じidempotency keyの同一retryだけを冪等化する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const command = admission();
      const first = commitExecutionEpisodeTransition(db, command);
      const replay = commitExecutionEpisodeTransition(db, command);
      expect(replay.event.event_id).toBe(first.event.event_id);
      expect(() =>
        commitExecutionEpisodeTransition(db, {
          ...command,
          source_event_id: "github:issue:999:opened",
        }),
      ).toThrow(/idempotency conflict/u);
    } finally {
      db.close();
    }
  });

  it("U-GHEP-004: fault時はevent／outbox／projectionを全rollbackする", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      for (const faultAfter of ["event", "outbox", "projection"] as const) {
        expect(() =>
          commitExecutionEpisodeTransition(db, admission(), { fault_after: faultAfter }),
        ).toThrow(/injected fault/u);
        for (const table of [
          "github_execution_episode_events",
          "github_execution_episode_outbox",
          "github_execution_episodes",
        ]) {
          expect(db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()?.count).toBe(0);
        }
      }
    } finally {
      db.close();
    }
  });

  it("U-GHEP-006: terminal dispositionをexactly oneにしterminal後遷移を拒否する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      let result = commitExecutionEpisodeTransition(db, admission());
      const resources = {
        issue_number: 205,
        plan_id: "PLAN-L7-576-github-execution-episode-state",
        branch_name: "feature/execution-episode-state-205",
        base_ref: "main",
        pr_number: 737,
        head_sha: "a".repeat(40),
      };
      acknowledgeExecutionEpisodeOutbox(db, result.outbox?.outbox_id ?? "", "2026-08-16T00:00:01Z");
      const states = [
        "planned",
        "branch_bound",
        "pr_open",
        "review_pending",
        "merge_ready",
        "merged",
        "closure_pending",
      ] as const;
      for (const [index, state] of states.entries()) {
        const allowedResources =
          state === "planned"
            ? { issue_number: resources.issue_number, plan_id: resources.plan_id }
            : state === "branch_bound"
              ? {
                  issue_number: resources.issue_number,
                  plan_id: resources.plan_id,
                  branch_name: resources.branch_name,
                  base_ref: resources.base_ref,
                }
              : resources;
        result = commitExecutionEpisodeTransition(
          db,
          admission({
            idempotency_key: `episode:ep_01JTEST000000000000000001:${state}:${index + 1}`,
            expected_revision: index + 1,
            to_state: state,
            occurred_at: `2026-08-16T00:00:${String(index + 2).padStart(2, "0")}Z`,
            resources: allowedResources,
          }),
        );
        acknowledgeExecutionEpisodeOutbox(
          db,
          result.outbox?.outbox_id ?? "",
          `2026-08-16T00:01:${String(index).padStart(2, "0")}Z`,
        );
      }
      const closed = commitExecutionEpisodeTransition(
        db,
        admission({
          idempotency_key: "episode:ep_01JTEST000000000000000001:closed:8",
          expected_revision: 8,
          to_state: "closed",
          occurred_at: "2026-08-16T00:02:00Z",
          resources,
          disposition: "resolved",
          outbox: undefined,
        }),
      );
      expect(closed.projection).toMatchObject({
        state: "closed",
        disposition: "resolved",
        pending_outbox_count: 0,
      });
      expect(() =>
        commitExecutionEpisodeTransition(
          db,
          admission({
            idempotency_key: "episode:ep_01JTEST000000000000000001:invalid-disposition:9",
            expected_revision: 9,
            to_state: "closed",
            resources,
            disposition: "unknown" as never,
            outbox: undefined,
          }),
        ),
      ).toThrow(/disposition is invalid/u);
      expect(() =>
        commitExecutionEpisodeTransition(
          db,
          admission({
            idempotency_key: "episode:ep_01JTEST000000000000000001:reopen:9",
            expected_revision: 9,
            to_state: "admitted",
            resources,
          }),
        ),
      ).toThrow(/transition invalid/u);
    } finally {
      db.close();
    }
  });

  it("U-GHEP-007: event replayのsequence／projection driftを拒否する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const first = commitExecutionEpisodeTransition(db, admission());
      acknowledgeExecutionEpisodeOutbox(db, first.outbox?.outbox_id ?? "", "2026-08-16T00:00:01Z");
      const events = loadExecutionEpisodeEvents(db, first.projection.episode_id);
      expect(replayExecutionEpisode(events)).toEqual(
        loadExecutionEpisodeProjection(db, first.projection.episode_id),
      );
      const firstEvent = events[0];
      if (!firstEvent) throw new Error("expected execution episode event");
      const broken = { ...firstEvent, sequence: 2 };
      expect(() => replayExecutionEpisode([broken])).toThrow(/sequence/u);
      const tampered = [
        {
          ...firstEvent,
          projection_json: firstEvent.projection_json.replace("codex", "other"),
        },
        ...events.slice(1),
      ];
      expect(() => replayExecutionEpisode(tampered)).toThrow(/digest drift/u);
    } finally {
      db.close();
    }
  });

  it("U-GHEP-008: episode schemaと一意indexをregistryへ束縛する", () => {
    expect(HARNESS_DB_TABLES.map((table) => table.name)).toEqual(
      expect.arrayContaining([
        "github_execution_episode_events",
        "github_execution_episode_outbox",
        "github_execution_episodes",
      ]),
    );
    expect(HARNESS_DB_INDEXES.map((index) => index.name)).toEqual(
      expect.arrayContaining([
        "idx_github_execution_episode_events_sequence",
        "idx_github_execution_episode_events_idempotency",
        "idx_github_execution_episode_outbox_status",
        "idx_github_execution_episodes_state",
      ]),
    );
    const projection = HARNESS_DB_TABLES.find(
      (table) => table.name === "github_execution_episodes",
    );
    const columns = projection?.columns.map((column) => column.name) ?? [];
    expect(columns).toEqual(
      expect.arrayContaining([
        "episode_id",
        "workflow_registry_version",
        "workflow_registry_source_digest",
        "workflow_target_axis",
        "workflow_target_id",
        "source_event_id",
        "source_event_digest",
        "last_event_sequence",
        "pending_outbox_count",
      ]),
    );
    for (const legacy of ["mode", "model", "route_id", "catalog_route_id"]) {
      expect(columns).not.toContain(legacy);
    }
  });
});
