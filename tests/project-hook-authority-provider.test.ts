import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
  type ProjectHookAuthorityInputV1,
  resolveProjectHookAuthority,
} from "../src/runtime/project-hook-authority";
import {
  type ProjectHookAuthorityInputProvider,
  resolveProjectHookAuthorityFromProvider,
} from "../src/runtime/project-hook-authority-provider";

// PLAN-L7-667-project-hook-authority-input-provider

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

function validInput(): ProjectHookAuthorityInputV1 {
  return {
    schema_version: PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
    execution_root: structuredClone(root),
    loader_root: structuredClone(root),
    session_project_root: structuredClone(root),
    assignment_binding: {
      kind: "session",
      session_project_root_digest: digest(root),
    },
    repository_head: head,
    candidate_base_head: head,
    current_authority_head: head,
    source_material: structuredClone(source),
    current_authority_source_material: structuredClone(source),
    physical_evidence: {
      captured_at: "2026-08-25T00:00:00.000Z",
      capture_source: "node-stat",
    },
    lifecycle_policy: {
      timeout_ms: 15_000,
      hard_ceiling_ms: 60_000,
      child_termination_grace_ms: 1_000,
      parent_terminal_required: true,
      notification_handoff: { kind: "disabled" },
    },
  };
}

describe("project hook authority input provider", () => {
  it("U-CNWHOOKPROV-001: 明示inputをpure resolverへ変更せず渡す", () => {
    const input = validInput();
    const before = structuredClone(input);
    const provider: ProjectHookAuthorityInputProvider = {
      read: () => ({ ok: true, input }),
    };
    expect(resolveProjectHookAuthorityFromProvider(provider)).toEqual(
      resolveProjectHookAuthority(input),
    );
    expect(input).toEqual(before);
  });

  it("U-CNWHOOKPROV-002: input取得不能を既存stale/foreign failureへ決定的に変換する", () => {
    const provider: ProjectHookAuthorityInputProvider = {
      read: () => ({ ok: false, reason: "authority_input_unavailable" }),
    };
    const first = resolveProjectHookAuthorityFromProvider(provider);
    const second = resolveProjectHookAuthorityFromProvider(provider);
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      ok: false,
      failure: {
        code: "project_hook_source_stale_or_foreign",
        json_pointer: "/authority_input",
        side_effects: {
          hook_execution: 0,
          dispatch: 0,
          git_write: 0,
          db_write: 0,
          github_write: 0,
        },
      },
    });
  });

  it("U-CNWHOOKPROV-003: provider throw／malformed resultをfallbackせず同じfailureへ閉じる", () => {
    const throwing: ProjectHookAuthorityInputProvider = {
      read: () => {
        throw new Error("secret-bearing provider detail must not escape");
      },
    };
    const malformed = {
      read: () => ({ ok: true, input: validInput(), fallback_root: "/primary/shared" }),
    } as unknown as ProjectHookAuthorityInputProvider;
    const expected = resolveProjectHookAuthorityFromProvider({
      read: () => ({ ok: false, reason: "authority_input_unavailable" }),
    });
    expect(resolveProjectHookAuthorityFromProvider(throwing)).toEqual(expected);
    expect(resolveProjectHookAuthorityFromProvider(malformed)).toEqual(expected);
  });
});
