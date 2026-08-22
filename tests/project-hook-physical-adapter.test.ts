import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  captureProjectHookAuthorityInput,
  nodeProjectHookPhysicalAdapterDeps,
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

  it("U-CNWHOOKPHYS-005: execution／loader／sessionのphysical identityを独立captureする", () => {
    const input = captureProjectHookAuthorityInput(
      {
        ...request(),
        loader_root: "/loader",
        session_project_root: "/session",
      },
      fixtureDeps({
        stat: (path) => {
          if (path.includes("/loader/")) return { dev: 31, ino: 32 };
          if (path.includes("/session/")) return { dev: 41, ino: 42 };
          return { dev: 21, ino: 22 };
        },
      }),
    );

    expect(input.execution_root).toMatchObject({
      lexical_path: "/lane",
      canonical_realpath: "/physical/lane",
      filesystem_identity: { device_id: "21", file_id: "22" },
    });
    expect(input.loader_root).toMatchObject({
      lexical_path: "/loader",
      canonical_realpath: "/physical/loader",
      filesystem_identity: { device_id: "31", file_id: "32" },
    });
    expect(input.session_project_root).toMatchObject({
      lexical_path: "/session",
      canonical_realpath: "/physical/session",
      filesystem_identity: { device_id: "41", file_id: "42" },
    });
  });

  it.skipIf(process.platform === "win32")(
    "U-CNWHOOKPHYS-006: native Git worktreeからrealpath／common-dir／stat／HEADを実測する",
    () => {
      const root = mkdtempSync(join(tmpdir(), "helix-hook-physical-"));
      try {
        mkdirSync(join(root, ".codex"), { recursive: true });
        mkdirSync(join(root, "src/runtime"), { recursive: true });
        writeFileSync(join(root, ".codex/hooks.json"), "{}\n");
        writeFileSync(join(root, "src/runtime/agent-guard.ts"), "export {};\n");
        writeFileSync(join(root, "src/runtime/codex-native-worker-policy.ts"), "export {};\n");
        execFileSync("git", ["init", "-q"], { cwd: root });
        execFileSync("git", ["config", "user.email", "helix-test@example.invalid"], {
          cwd: root,
        });
        execFileSync("git", ["config", "user.name", "HELIX Test"], { cwd: root });
        execFileSync(
          "git",
          [
            "add",
            ".codex/hooks.json",
            "src/runtime/agent-guard.ts",
            "src/runtime/codex-native-worker-policy.ts",
          ],
          { cwd: root },
        );
        execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
        const observedHead = execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: root,
          encoding: "utf8",
        }).trim();

        const input = captureProjectHookAuthorityInput(
          {
            ...request(),
            execution_root: root,
            loader_root: root,
            session_project_root: root,
            current_authority_root: root,
            candidate_base_head: observedHead,
            current_authority_head: observedHead,
          },
          nodeProjectHookPhysicalAdapterDeps,
        );

        expect(input.repository_head).toBe(observedHead);
        expect(input.execution_root.canonical_realpath).toBe(root);
        expect(input.execution_root.repository_common_dir).toBe(join(root, ".git"));
        expect(input.execution_root.filesystem_identity).toMatchObject({
          platform: process.platform,
          evidence_kind: "stat",
        });
        expect(Number(input.execution_root.filesystem_identity.device_id)).toBeGreaterThanOrEqual(
          0,
        );
        expect(Number(input.execution_root.filesystem_identity.file_id)).toBeGreaterThan(0);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    },
  );
});
