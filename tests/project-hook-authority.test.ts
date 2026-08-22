import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
  resolveProjectHookAuthority,
} from "../src/runtime/project-hook-authority";

// PLAN-L7-651-project-hook-authority-resolver

const digest = (value: unknown) => sha256Digest(canonicalJson(value));
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
const source = {
  hooks_config_digest: sha256Digest("hooks"),
  agent_guard_digest: sha256Digest("guard"),
  worker_policy_digest: sha256Digest("policy"),
};
const validInput = () => ({
  schema_version: PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
  execution_root: structuredClone(root),
  loader_root: structuredClone(root),
  session_project_root: structuredClone(root),
  assignment_binding: {
    kind: "assignment" as const,
    assignment_id: "assignment-895",
    assignment_root_digest: digest(root),
    branch: "feature/895-project-hook-resolver",
    lease_id: "lease-1",
    fence_token: "fence-1",
  },
  repository_head: head,
  candidate_base_head: head,
  current_authority_head: head,
  source_material: structuredClone(source),
  current_authority_source_material: structuredClone(source),
  physical_evidence: {
    captured_at: "2026-08-22T08:00:00.000Z",
    capture_source: "node-stat" as const,
  },
  lifecycle_policy: {
    timeout_ms: 15_000,
    hard_ceiling_ms: 60_000 as const,
    child_termination_grace_ms: 1_000,
    parent_terminal_required: true as const,
    notification_handoff: { kind: "disabled" as const },
  },
});

describe("project hook authority resolver", () => {
  it("U-CNWHOOKSCHEMA-001: exact root schemaを強制する", () => {
    for (const key of Object.keys(validInput())) {
      const mutated = validInput() as Record<string, unknown>;
      delete mutated[key];
      expect(resolveProjectHookAuthority(mutated)).toMatchObject({
        ok: false,
        code: "schema_invalid",
      });
    }
    expect(resolveProjectHookAuthority({ ...validInput(), unknown: true })).toMatchObject({
      ok: false,
      code: "schema_invalid",
    });
  });

  it("U-CNWHOOKSCHEMA-002: lexical path一致でphysical mismatchを相殺しない", () => {
    const input = validInput();
    input.loader_root.filesystem_identity.file_id = "foreign";
    expect(resolveProjectHookAuthority(input)).toMatchObject({
      ok: false,
      code: "project_hook_source_stale_or_foreign",
    });
  });

  it("U-CNWHOOKSCHEMA-004: 観測三digestとcurrent authority三digestを個別比較する", () => {
    const staleDigest = validInput();
    staleDigest.source_material.agent_guard_digest = sha256Digest("stale");
    expect(resolveProjectHookAuthority(staleDigest)).toMatchObject({
      ok: false,
      code: "project_hook_source_stale_or_foreign",
    });
  });

  it("U-CNWHOOKSCHEMA-006: 観測／candidate／current HEADを個別比較する", () => {
    const staleHead = validInput();
    staleHead.repository_head = "b".repeat(40);
    expect(resolveProjectHookAuthority(staleHead)).toMatchObject({
      ok: false,
      code: "project_hook_source_stale_or_foreign",
    });
    const staleCurrent = validInput();
    staleCurrent.current_authority_head = "c".repeat(40);
    expect(resolveProjectHookAuthority(staleCurrent)).toMatchObject({
      ok: false,
      code: "project_hook_source_stale_or_foreign",
    });
  });

  it("U-CNWHOOKSCHEMA-005: assignment root digest不一致をfallbackせず拒否する", () => {
    const input = validInput();
    input.assignment_binding.assignment_root_digest = sha256Digest("primary-fallback");
    expect(resolveProjectHookAuthority(input)).toMatchObject({
      ok: false,
      code: "project_hook_source_stale_or_foreign",
    });
    const stalePrimary = validInput();
    stalePrimary.session_project_root.canonical_realpath = "/stale/primary";
    stalePrimary.session_project_root.repository_common_dir = "/stale/primary/.git";
    stalePrimary.session_project_root.filesystem_identity.file_id = "stale-primary";
    expect(resolveProjectHookAuthority(stalePrimary)).toMatchObject({
      ok: true,
      receipt: { authority_kind: "assignment", authority_root: "/physical/repo" },
    });
  });

  it("U-CNWHOOKSCHEMA-007: valid assignmentからdeterministic receiptを返す", () => {
    const first = resolveProjectHookAuthority(validInput());
    const second = resolveProjectHookAuthority(validInput());
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      ok: true,
      receipt: {
        authority_kind: "assignment",
        authority_root: "/physical/repo",
        repository_head: head,
      },
    });
  });

  it("U-CNWHOOKSCHEMA-008: 60秒超過とparent terminal無効をschemaで拒否する", () => {
    const over = validInput();
    over.lifecycle_policy.timeout_ms = 60_001;
    expect(resolveProjectHookAuthority(over)).toMatchObject({ ok: false, code: "schema_invalid" });
    const noParent = validInput() as unknown as {
      lifecycle_policy: { parent_terminal_required: boolean };
    };
    noParent.lifecycle_policy.parent_terminal_required = false;
    expect(resolveProjectHookAuthority(noParent)).toMatchObject({
      ok: false,
      code: "schema_invalid",
    });
  });

  it("U-CNWHOOKSCHEMA-012: failureはside effect全0でinputを変更しない", () => {
    const input = validInput();
    input.current_authority_head = "c".repeat(40);
    const before = structuredClone(input);
    expect(resolveProjectHookAuthority(input)).toEqual({
      ok: false,
      code: "project_hook_source_stale_or_foreign",
      side_effects: { hook_execution: 0, dispatch: 0, git_write: 0, db_write: 0, github_write: 0 },
    });
    expect(input).toEqual(before);
  });
});
