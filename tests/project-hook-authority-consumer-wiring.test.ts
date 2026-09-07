import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
  type ProjectHookAuthorityInputV1,
} from "../src/runtime/project-hook-authority";
import type { ProjectHookAuthorityInputProvider } from "../src/runtime/project-hook-authority-provider";
import {
  createProjectHookAuthorityConsumerWiring,
  createProjectHookAuthorityConsumerWiringFromSnapshotBytes,
  type ProjectHookAuthorityConsumer,
} from "../src/runtime/project-hook-authority-consumer-wiring";

// PLAN-L7-1614-project-hook-authority-consumer-wiring

const head = "a".repeat(40);
const root = {
  lexical_path: "/work/repo",
  canonical_realpath: "/physical/repo",
  repository_common_dir: "/physical/repo/.git",
  filesystem_identity: {
    platform: "linux" as const,
    device_id: "2049",
    file_id: "991",
    evidence_kind: "stat" as const,
  },
};

function validInput(): ProjectHookAuthorityInputV1 {
  const source = {
    hooks_config_digest: sha256Digest("hooks"),
    agent_guard_digest: sha256Digest("guard"),
    worker_policy_digest: sha256Digest("policy"),
  };
  return {
    schema_version: PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
    execution_root: structuredClone(root),
    loader_root: structuredClone(root),
    session_project_root: structuredClone(root),
    assignment_binding: {
      kind: "session",
      session_project_root_digest: sha256Digest(canonicalJson(root)),
    },
    repository_head: head,
    candidate_base_head: head,
    current_authority_head: head,
    source_material: structuredClone(source),
    current_authority_source_material: structuredClone(source),
    physical_evidence: { captured_at: "2026-09-07T00:00:00.000Z", capture_source: "node-stat" },
    lifecycle_policy: {
      timeout_ms: 15_000,
      hard_ceiling_ms: 60_000,
      child_termination_grace_ms: 1_000,
      parent_terminal_required: true,
      notification_handoff: { kind: "disabled" },
    },
  };
}

const consumers: readonly ProjectHookAuthorityConsumer[] = [
  "session_start",
  "doctor",
  "status",
  "dispatch",
];
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");

describe("project hook authority consumer wiring", () => {
  it("U-CNWHOOKWIRE-001: providerを一度だけresolveして4 consumerへ配る", () => {
    let reads = 0;
    const wiring = createProjectHookAuthorityConsumerWiring({
      read: () => {
        reads += 1;
        return { ok: true, input: validInput() };
      },
    });
    expect(reads).toBe(1);
    for (const consumer of consumers) wiring.bytesFor(consumer);
    expect(reads).toBe(1);
  });

  it("U-CNWHOOKWIRE-002: 4 consumerが同じcanonical receipt bytesを返す", () => {
    const wiring = createProjectHookAuthorityConsumerWiring({
      read: () => ({ ok: true, input: validInput() }),
    });
    expect(wiring.ok).toBe(true);
    expect(new Set(consumers.map((consumer) => wiring.bytesFor(consumer))).size).toBe(1);
    expect(wiring.dispatchAdmission()).toEqual({ ok: true, bytes: wiring.bytesFor("dispatch") });
  });

  it("U-CNWHOOKWIRE-003: unavailable/malformedを同じfailureへ閉じdispatchを拒否する", () => {
    const providers: ProjectHookAuthorityInputProvider[] = [
      { read: () => ({ ok: false, reason: "authority_input_unavailable" }) },
      { read: () => ({ ok: true, input: { invalid: true } }) },
    ];
    for (const provider of providers) {
      const wiring = createProjectHookAuthorityConsumerWiring(provider);
      expect(wiring.ok).toBe(false);
      expect(new Set(consumers.map((consumer) => wiring.bytesFor(consumer))).size).toBe(1);
      expect(wiring.dispatchAdmission()).toEqual({
        ok: false,
        bytes: wiring.bytesFor("dispatch"),
      });
      expect(wiring.bytesFor("dispatch")).toContain('"dispatch":0');
    }
  });

  it("U-CNWHOOKWIRE-004: consumer readは再計算せずexact surfaceだけを受理する", () => {
    let reads = 0;
    const provider: ProjectHookAuthorityInputProvider = {
      read: () => {
        reads += 1;
        return { ok: true, input: validInput() };
      },
    };
    const wiring = createProjectHookAuthorityConsumerWiring(provider);
    expect(Object.keys(wiring.bytesByConsumer).sort()).toEqual([...consumers].sort());
    expect(() => wiring.bytesFor("unknown" as ProjectHookAuthorityConsumer)).toThrow(
      "unknown project hook authority consumer",
    );
    expect(reads).toBe(1);
  });

  it("U-CNWHOOKWIRE-005: serialized snapshotは完全なtyped inputだけを受理する", () => {
    const valid = createProjectHookAuthorityConsumerWiringFromSnapshotBytes(
      JSON.stringify(validInput()),
    );
    expect(valid.ok).toBe(true);

    for (const bytes of ["{", JSON.stringify({ ...validInput(), unknown: true })]) {
      const rejected = createProjectHookAuthorityConsumerWiringFromSnapshotBytes(bytes);
      expect(rejected.ok).toBe(false);
      expect(rejected.dispatchAdmission().ok).toBe(false);
      expect(rejected.bytesFor("dispatch")).toContain('"dispatch":0');
    }
  });

  it("U-CNWHOOKWIRE-006: CLI surfaceは明示snapshot fileだけを4 consumerへ投影する", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "helix-hook-authority-cli-"));
    try {
      const snapshot = join(rootDir, "snapshot.json");
      writeFileSync(snapshot, JSON.stringify(validInput()), "utf8");
      const outputs = consumers.map((consumer) => {
        const run = spawnSync(
          process.execPath,
          [tsxCli, "src/cli.ts", "project-hook-authority", "surface", "--snapshot-file", snapshot, "--consumer", consumer],
          { cwd: process.cwd(), encoding: "utf8", timeout: 30_000 },
        );
        expect(run.status, run.stderr).toBe(0);
        return run.stdout.trim();
      });
      expect(new Set(outputs).size).toBe(1);

      const missing = spawnSync(
        process.execPath,
        [tsxCli, "src/cli.ts", "project-hook-authority", "surface", "--snapshot-file", join(rootDir, "missing.json"), "--consumer", "dispatch"],
        { cwd: process.cwd(), encoding: "utf8", timeout: 30_000 },
      );
      expect(missing.status).toBe(1);
      expect(missing.stdout).toContain('"dispatch":0');
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  }, 150_000);
});
