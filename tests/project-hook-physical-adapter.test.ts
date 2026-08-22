import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  captureProjectHookAuthorityInput,
  type ProjectHookPhysicalAdapterDeps,
  UnsupportedPhysicalIdentityError,
} from "../src/runtime/project-hook-physical-adapter";

// PLAN-L7-652-project-hook-physical-adapter

const head = "a".repeat(40);
function fixtureDeps(
  overrides: Partial<ProjectHookPhysicalAdapterDeps> = {},
): ProjectHookPhysicalAdapterDeps {
  return {
    platform: "linux",
    realpath: (path) => `/physical${path}`,
    stat: () => ({ dev: 11, ino: 22 }),
    readFile: (path) => Buffer.from(path),
    git: (_root, args) => (args.includes("--git-common-dir") ? ".git" : head),
    ...overrides,
  };
}

const request = () => ({
  execution_root: "/lane",
  loader_root: "/lane",
  session_project_root: "/lane",
  current_authority_root: "/authority",
  assignment_binding: {
    kind: "assignment" as const,
    assignment_id: "assignment-895",
    assignment_root_digest: sha256Digest("bound-by-control-plane"),
    branch: "feature/895-project-hook-physical-adapter",
    lease_id: "lease-1",
    fence_token: "fence-1",
  },
  candidate_base_head: head,
  current_authority_head: head,
  captured_at: "2026-08-22T08:30:00.000Z",
  lifecycle_policy: {
    timeout_ms: 15_000,
    hard_ceiling_ms: 60_000 as const,
    child_termination_grace_ms: 1_000,
    parent_terminal_required: true as const,
    notification_handoff: { kind: "disabled" as const },
  },
});

describe("project hook physical adapter", () => {
  it("U-CNWHOOKPHYS-001: realpath、common-dir、device／inode、HEADをcaptureする", () => {
    const input = captureProjectHookAuthorityInput(request(), fixtureDeps());
    expect(input.execution_root).toMatchObject({
      lexical_path: "/lane",
      canonical_realpath: "/physical/lane",
      repository_common_dir: "/physical/physical/lane/.git",
      filesystem_identity: { platform: "linux", device_id: "11", file_id: "22" },
    });
    expect(input.repository_head).toBe(head);
  });

  it("U-CNWHOOKPHYS-002: observed rootとcurrent authority sourceを別々にhashする", () => {
    const reads: string[] = [];
    const input = captureProjectHookAuthorityInput(
      request(),
      fixtureDeps({
        readFile: (path) => {
          reads.push(path);
          return Buffer.from(path);
        },
      }),
    );
    expect(reads).toHaveLength(6);
    expect(input.source_material.agent_guard_digest).not.toBe(
      input.current_authority_source_material.agent_guard_digest,
    );
    expect(reads.some((path) => path.includes("/physical/lane/"))).toBe(true);
    expect(reads.some((path) => path.includes("/physical/authority/"))).toBe(true);
  });

  it("U-CNWHOOKPHYS-003: Windowsをstat推測でsameへ降格しない", () => {
    expect(() =>
      captureProjectHookAuthorityInput(request(), fixtureDeps({ platform: "win32" })),
    ).toThrow(UnsupportedPhysicalIdentityError);
  });

  it("U-CNWHOOKPHYS-004: requestを変更せずGit／filesystem writeを呼ばない", () => {
    const original = request();
    const before = structuredClone(original);
    const commands: string[][] = [];
    captureProjectHookAuthorityInput(
      original,
      fixtureDeps({
        git: (_root, args) => {
          commands.push([...args]);
          return args.includes("--git-common-dir") ? ".git" : head;
        },
      }),
    );
    expect(original).toEqual(before);
    expect(commands.every((args) => args[0] === "rev-parse")).toBe(true);
  });
});
