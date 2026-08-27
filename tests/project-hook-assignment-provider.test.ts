import { describe, expect, it, vi } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  createAssignmentProjectHookAuthorityProvider,
  type ProjectHookAssignmentSnapshot,
} from "../src/runtime/project-hook-assignment-provider";
import { PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA } from "../src/runtime/project-hook-authority";
import type { ProjectHookPhysicalAdapterDeps } from "../src/runtime/project-hook-physical-adapter";

// PLAN-L7-669-project-hook-assignment-provider

const HEAD = "a".repeat(40);

function snapshot(): ProjectHookAssignmentSnapshot {
  return {
    assignment_id: "assignment-895",
    worktree_root: "/lane",
    loader_root: "/lane",
    session_project_root: "/session",
    current_authority_root: "/authority",
    branch: "codex/895-hook-assignment-adapter",
    candidate_base_head: HEAD,
    current_authority_head: HEAD,
    lease_id: "lease-895",
    fence_token: "fence-7",
    assignment_root_digest: sha256Digest("assignment-root"),
    captured_at: "2026-08-25T00:00:00.000Z",
    lifecycle_policy: {
      timeout_ms: 15_000,
      hard_ceiling_ms: 60_000,
      child_termination_grace_ms: 1_000,
      parent_terminal_required: true,
      notification_handoff: { kind: "disabled" },
    },
  };
}

function deps(): ProjectHookPhysicalAdapterDeps {
  return {
    platform: "linux",
    realpath: (path) => `/physical${path}`,
    stat: () => ({ dev: 11, ino: 22 }),
    readFile: (path) => Buffer.from(path),
    git: (_root, args) => (args.includes("--git-common-dir") ? ".git" : HEAD),
  };
}

describe("assignment project hook authority provider", () => {
  it("U-CNWHOOKASSIGN-001: Assignment snapshotを明示capture requestへexact変換する", () => {
    const reader = vi.fn(() => ({ ok: true as const, snapshot: snapshot() }));
    const provider = createAssignmentProjectHookAuthorityProvider(reader, deps());
    const result = provider.read();
    expect(reader).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.input).toMatchObject({
      schema_version: PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA,
      repository_head: HEAD,
      candidate_base_head: HEAD,
      current_authority_head: HEAD,
      assignment_binding: {
        kind: "assignment",
        assignment_id: "assignment-895",
        branch: "codex/895-hook-assignment-adapter",
        lease_id: "lease-895",
        fence_token: "fence-7",
      },
    });
  });

  it("U-CNWHOOKASSIGN-002: snapshot unavailable／malformed／capture失敗を同じunavailableへ閉じる", () => {
    const readers = [
      () => ({ ok: false as const, reason: "assignment_unavailable" as const }),
      () => ({ ok: true as const, snapshot: { ...snapshot(), lease_id: "" } }),
      () => {
        throw new Error("secret provider detail");
      },
    ];
    for (const reader of readers) {
      expect(createAssignmentProjectHookAuthorityProvider(reader, deps()).read()).toEqual({
        ok: false,
        reason: "authority_input_unavailable",
      });
    }
  });

  it("U-CNWHOOKASSIGN-003: primary cwd／env／origin mainへfallbackしない", () => {
    const git = vi.fn(deps().git);
    const provider = createAssignmentProjectHookAuthorityProvider(
      () => ({ ok: false, reason: "assignment_unavailable" }),
      { ...deps(), git },
    );
    expect(provider.read()).toEqual({ ok: false, reason: "authority_input_unavailable" });
    expect(git).not.toHaveBeenCalled();
  });
});
