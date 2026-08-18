// PLAN-L7-578-github-execution-episode-right-arm-evidence — U-GHEPRE-001
// PLAN-L7-578-github-execution-episode-right-arm-evidence — U-GHEPRE-002
// PLAN-L7-578-github-execution-episode-right-arm-evidence — U-GHEPRE-003
// PLAN-L7-578-github-execution-episode-right-arm-evidence — U-GHEPRE-004
// PLAN-L7-578-github-execution-episode-right-arm-evidence — U-GHEPRE-005

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  acknowledgeExecutionEpisodeOutbox,
  commitExecutionEpisodeTransition,
  type ExecutionEpisodeTransition,
} from "../src/state-db/github-execution-episode";
import {
  admitExecutionEpisodeRightArmEvidence,
  type ExecutionEpisodeRightArmEvidenceInput,
  listExecutionEpisodeRightArmEvidence,
} from "../src/state-db/github-execution-episode-right-arm";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const digest = (value: string): `sha256:${string}` =>
  `sha256:${value.padEnd(64, value).slice(0, 64)}`;
const episodeId = "ep_01JRIGHTARM000000000000001";
const head = "a".repeat(40);

function admission(): ExecutionEpisodeTransition {
  return {
    episode_id: episodeId,
    idempotency_key: `${episodeId}:admitted:0`,
    expected_revision: 0,
    to_state: "admitted",
    occurred_at: "2026-08-16T03:10:00Z",
    workflow_identity: {
      registry_version: "1.1.4",
      registry_source_digest: digest("b"),
      target_axis: "workflow_model",
      target_id: "RETROFIT",
    },
    source_event_id: "github:issue:205:opened",
    source_event_digest: digest("c"),
    owner: "codex",
    behavior_contract_id: "GITHUB-EPISODE-RIGHT-ARM-001",
    resources: { head_sha: head },
    outbox: { destination: "github", payload_digest: digest("d") },
  };
}

function evidence(
  overrides: Partial<ExecutionEpisodeRightArmEvidenceInput> = {},
): ExecutionEpisodeRightArmEvidenceInput {
  return {
    evidence_id: `${episodeId}:G8:integration:1`,
    episode_id: episodeId,
    head_sha: head,
    owner: "codex",
    behavior_contract_id: "GITHUB-EPISODE-RIGHT-ARM-001",
    workflow_registry_version: "1.1.4",
    workflow_registry_source_digest: digest("b"),
    workflow_target_axis: "workflow_model",
    workflow_target_id: "RETROFIT",
    gate_id: "G8",
    evidence_kind: "integration_test",
    artifact_path: "tests/github-execution-episode-right-arm.test.ts",
    evidence_digest: digest("e"),
    verifier_command_digest: digest("f"),
    observed_at: "2026-08-16T03:11:00Z",
    ...overrides,
  };
}

function dbWithEpisode() {
  const db = openHarnessDb(":memory:");
  migrate(db);
  const result = commitExecutionEpisodeTransition(db, admission());
  acknowledgeExecutionEpisodeOutbox(db, result.outbox?.outbox_id ?? "", "2026-08-16T03:10:01Z");
  return db;
}

describe("execution episode right-arm evidence", () => {
  it("U-GHEPRE-001: current episode identityへexact束縛してappendする", () => {
    const db = dbWithEpisode();
    try {
      const result = admitExecutionEpisodeRightArmEvidence(db, evidence());
      expect(result.replayed).toBe(false);
      expect(result.evidence).toMatchObject({
        episode_id: episodeId,
        head_sha: head,
        gate_id: "G8",
      });
      expect(listExecutionEpisodeRightArmEvidence(db, episodeId)).toEqual([result.evidence]);
    } finally {
      db.close();
    }

    const missingDb = openHarnessDb(":memory:");
    try {
      migrate(missingDb);
      expect(() => admitExecutionEpisodeRightArmEvidence(missingDb, evidence())).toThrow(
        /episode is missing/u,
      );
    } finally {
      missingDb.close();
    }
  });

  it("U-GHEPRE-002: 旧HEAD・別owner・別contract・別workflow identityを拒否する", () => {
    const cases: Partial<ExecutionEpisodeRightArmEvidenceInput>[] = [
      { head_sha: "9".repeat(40) },
      { owner: "claude" },
      { behavior_contract_id: "FOREIGN-CONTRACT" },
      { workflow_registry_version: "1.1.2" },
      { workflow_registry_source_digest: digest("8") },
      { workflow_target_axis: "development_style" },
      { workflow_target_id: "RECOVERY" },
    ];
    for (const candidate of cases) {
      const db = dbWithEpisode();
      try {
        expect(() => admitExecutionEpisodeRightArmEvidence(db, evidence(candidate))).toThrow(
          /episode binding mismatch/u,
        );
        expect(listExecutionEpisodeRightArmEvidence(db, episodeId)).toEqual([]);
      } finally {
        db.close();
      }
    }
  });

  it("U-GHEPRE-003: 同一payload retryは再利用し、同一IDの改変を拒否する", () => {
    const db = dbWithEpisode();
    try {
      admitExecutionEpisodeRightArmEvidence(db, evidence());
      expect(admitExecutionEpisodeRightArmEvidence(db, evidence()).replayed).toBe(true);
      expect(() =>
        admitExecutionEpisodeRightArmEvidence(db, evidence({ evidence_digest: digest("9") })),
      ).toThrow(/immutable identity conflict/u);
      expect(listExecutionEpisodeRightArmEvidence(db, episodeId)).toHaveLength(1);

      const next = admission();
      const changedHead = "7".repeat(40);
      commitExecutionEpisodeTransition(db, {
        ...next,
        idempotency_key: `${episodeId}:planned:1`,
        expected_revision: 1,
        to_state: "planned",
        occurred_at: "2026-08-16T03:12:00Z",
        resources: {
          issue_number: 205,
          plan_id: "PLAN-L7-578-github-execution-episode-right-arm-evidence",
          head_sha: changedHead,
        },
      });
      expect(() => admitExecutionEpisodeRightArmEvidence(db, evidence())).toThrow(
        /episode binding mismatch: head_sha/u,
      );
    } finally {
      db.close();
    }
  });

  it("U-GHEPRE-004: G8-G12とrepository-relative artifactだけを受理する", () => {
    const db = dbWithEpisode();
    try {
      expect(() => admitExecutionEpisodeRightArmEvidence(db, evidence({ gate_id: "G13" }))).toThrow(
        /gate_id is invalid/u,
      );
      expect(() =>
        admitExecutionEpisodeRightArmEvidence(
          db,
          evidence({ artifact_path: "/tmp/evidence.json" }),
        ),
      ).toThrow(/repository-relative/u);
      expect(() =>
        admitExecutionEpisodeRightArmEvidence(db, evidence({ artifact_path: "../secret" })),
      ).toThrow(/repository-relative/u);
      expect(() =>
        admitExecutionEpisodeRightArmEvidence(
          db,
          evidence({ artifact_path: "C:\\Users\\secret.txt" }),
        ),
      ).toThrow(/repository-relative/u);
      expect(() =>
        admitExecutionEpisodeRightArmEvidence(
          db,
          evidence({ artifact_path: "evidence\\..\\secret" }),
        ),
      ).toThrow(/repository-relative/u);
      expect(() =>
        admitExecutionEpisodeRightArmEvidence(db, evidence({ artifact_path: "reports/./g8.json" })),
      ).toThrow(/repository-relative/u);
      expect(() =>
        admitExecutionEpisodeRightArmEvidence(db, evidence({ artifact_path: "reports/g8\0.json" })),
      ).toThrow(/repository-relative/u);

      for (const gate of ["G8", "G9", "G10", "G11", "G12"]) {
        const accepted = admitExecutionEpisodeRightArmEvidence(
          db,
          evidence({
            evidence_id: `${episodeId}:${gate}:verification:positive`,
            gate_id: gate,
            artifact_path: `reports/${gate.toLowerCase()}.json`,
          }),
        );
        expect(accepted.evidence.gate_id).toBe(gate);
      }
    } finally {
      db.close();
    }
  });

  it("U-GHEPRE-005: DB直接UPDATE／DELETEをtriggerで拒否し、保存行corruptionも検出する", () => {
    const db = dbWithEpisode();
    try {
      admitExecutionEpisodeRightArmEvidence(db, evidence());
      expect(() =>
        db
          .prepare(
            "UPDATE github_execution_episode_right_arm_evidence SET evidence_digest = ? WHERE evidence_id = ?",
          )
          .run(digest("9"), evidence().evidence_id),
      ).toThrow(/immutable/u);
      expect(() =>
        db
          .prepare("DELETE FROM github_execution_episode_right_arm_evidence WHERE evidence_id = ?")
          .run(evidence().evidence_id),
      ).toThrow(/immutable/u);

      db.exec("DROP TRIGGER github_execution_episode_right_arm_evidence_no_update");
      db.prepare(
        "UPDATE github_execution_episode_right_arm_evidence SET evidence_digest = ? WHERE evidence_id = ?",
      ).run(digest("9"), evidence().evidence_id);
      expect(() => admitExecutionEpisodeRightArmEvidence(db, evidence())).toThrow(
        /immutable identity conflict/u,
      );
    } finally {
      db.close();
    }
  });

  it("cross-connectionでHEAD更新後の旧record replayを拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-right-arm-"));
    const path = join(root, ".helix", "right-arm.db");
    const writer = openHarnessDb(path, { repoRoot: root });
    try {
      migrate(writer);
      const result = commitExecutionEpisodeTransition(writer, admission());
      acknowledgeExecutionEpisodeOutbox(
        writer,
        result.outbox?.outbox_id ?? "",
        "2026-08-16T03:10:01Z",
      );
      admitExecutionEpisodeRightArmEvidence(writer, evidence());

      const transitionWriter = openHarnessDb(path, { repoRoot: root });
      try {
        commitExecutionEpisodeTransition(transitionWriter, {
          ...admission(),
          idempotency_key: `${episodeId}:planned:cross-connection`,
          expected_revision: 1,
          to_state: "planned",
          occurred_at: "2026-08-16T03:13:00Z",
          resources: {
            issue_number: 205,
            plan_id: "PLAN-L7-578-github-execution-episode-right-arm-evidence",
            head_sha: "6".repeat(40),
          },
        });
      } finally {
        transitionWriter.close();
      }

      expect(() => admitExecutionEpisodeRightArmEvidence(writer, evidence())).toThrow(
        /episode binding mismatch: head_sha/u,
      );
    } finally {
      writer.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
