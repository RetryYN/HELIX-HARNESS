import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  PROJECT_HOOK_AUTHORITY_RECEIPT_SCHEMA,
  type ProjectHookAuthorityResolution,
  projectHookAuthorityInputUnavailable,
} from "../src/runtime/project-hook-authority";
import {
  PROJECT_HOOK_AUTHORITY_SURFACES,
  projectProjectHookAuthoritySurfaces,
} from "../src/runtime/project-hook-authority-surface-projector";

// PLAN-L7-668-project-hook-authority-surface-projector

function successResolution(): ProjectHookAuthorityResolution {
  return {
    ok: true,
    receipt: {
      schema_version: PROJECT_HOOK_AUTHORITY_RECEIPT_SCHEMA,
      authority_kind: "session",
      physical_repository_identity: {
        lexical_path: "/work/repo",
        canonical_realpath: "/physical/repo",
        repository_common_dir: "/physical/repo/.git",
        filesystem_identity: {
          platform: "linux",
          device_id: "2049",
          file_id: "991",
          evidence_kind: "stat",
        },
      },
      authority_root: "/physical/repo",
      repository_head: "a".repeat(40),
      source_identity: {
        hooks_config_digest: sha256Digest("hooks"),
        agent_guard_digest: sha256Digest("guard"),
        worker_policy_digest: sha256Digest("policy"),
      },
      assignment_binding: {
        kind: "session",
        session_project_root_digest: sha256Digest("root"),
      },
      captured_at: "2026-08-25T00:00:00.000Z",
      receipt_digest: sha256Digest("receipt"),
    },
  };
}

describe("project hook authority surface projector", () => {
  it("U-CNWHOOKPROJ-001: success receipt bytesを4 surfaceへexact projectionする", () => {
    const input = successResolution();
    if (!input.ok) throw new Error("expected success fixture");
    const before = structuredClone(input);
    const projected = projectProjectHookAuthoritySurfaces(input);
    expect(PROJECT_HOOK_AUTHORITY_SURFACES).toEqual([
      "session_start",
      "doctor",
      "status",
      "dispatch",
    ]);
    expect(projected.ok).toBe(true);
    expect(new Set(Object.values(projected.bytes_by_surface))).toEqual(
      new Set([canonicalJson(input.receipt)]),
    );
    expect(Object.keys(projected.bytes_by_surface).sort()).toEqual(
      [...PROJECT_HOOK_AUTHORITY_SURFACES].sort(),
    );
    expect(input).toEqual(before);
  });

  it("U-CNWHOOKPROJ-002: failure bytesもfield追加・欠落なしで4 surfaceへ投影する", () => {
    const input = projectHookAuthorityInputUnavailable();
    if (input.ok) throw new Error("expected failure fixture");
    const projected = projectProjectHookAuthoritySurfaces(input);
    expect(projected.ok).toBe(false);
    expect(new Set(Object.values(projected.bytes_by_surface))).toEqual(
      new Set([canonicalJson(input.failure)]),
    );
    expect(
      Object.values(projected.bytes_by_surface).every((bytes) => !bytes.includes("repair")),
    ).toBe(true);
  });
});
