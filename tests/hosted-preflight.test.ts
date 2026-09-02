import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  requireHostedSurfacePreflight,
  validateAdapterParityMap,
} from "../src/runtime/hosted-preflight";
import { evaluateWorkGuardTargets } from "../src/runtime/work-guard";
import { defaultHarnessDbPath, openHarnessDb } from "../src/state-db";

describe("HC-AC hosted/API preflight", () => {
  it("HU-PILLAR-P2-03: separates direct hook coverage from hosted preflight-only surfaces", () => {
    expect(
      validateAdapterParityMap({
        surface: "codex-hook",
        toolName: "apply_patch",
        hookMatcher: "apply_patch|write_file",
        repoHookConfigured: true,
      }),
    ).toMatchObject({
      kind: "covered_by_hook",
      hookCovered: true,
      preflightRequired: false,
    });

    expect(
      validateAdapterParityMap({
        surface: "codex-hosted-api",
        toolName: "apply_patch",
      }),
    ).toMatchObject({
      kind: "preflight_required",
      hookCovered: false,
      preflightRequired: true,
      reason: "repo_hooks_do_not_execute_on_hosted_api_surface",
    });
  });

  it("HU-PILLAR-NAC-01: unknown direct surfaces drift unless explicitly deferred", () => {
    expect(
      validateAdapterParityMap({
        surface: "codex-hook",
        toolName: "new_tool",
        repoHookConfigured: true,
      }),
    ).toMatchObject({
      kind: "drift",
      reason: "unknown_or_unmapped_surface",
    });

    expect(
      validateAdapterParityMap({
        surface: "codex-hook",
        toolName: "new_tool",
        repoHookConfigured: true,
        deferredReason: "tracked by PLAN-L7-followup",
      }),
    ).toMatchObject({
      kind: "deferred_guard",
      reason: "tracked by PLAN-L7-followup",
    });
  });

  it("HU-PILLAR-NAC-02: hosted/API edit rejects missing hook non-enforcement, git status, target, guard, command, or audit evidence", () => {
    expect(
      requireHostedSurfacePreflight({
        surface: "codex-hosted-api",
        operation: "edit",
      }),
    ).toMatchObject({
      kind: "deny",
      hookCovered: false,
      apiToolPathEnforced: false,
      findings: expect.arrayContaining([
        "missing_hook_non_enforcement_ack",
        "missing_git_status_preflight",
        "missing_target_paths",
        "missing_work_guard_decision",
        "missing_preflight_command",
        "missing_audit_record",
      ]),
    });
  });

  it("HU-PILLAR-NAC-02: hosted/API dry-run may be no-target, but edit requires target evidence", () => {
    const noTarget = evaluateWorkGuardTargets({
      targetPaths: [],
      uncommittedFiles: [],
      sessionTouchedFiles: [],
      bypass: false,
    });

    expect(
      requireHostedSurfacePreflight({
        surface: "codex-hosted-api",
        operation: "dry_run",
        hookNonEnforcementAcknowledged: true,
        gitStatusChecked: true,
        targetPaths: [],
        workGuardDecision: noTarget,
        preflightCommand: "helix guard preflight",
        auditRecord: "cli-stdout",
      }),
    ).toMatchObject({
      kind: "allow",
      reason: "hosted_preflight_complete",
      findings: [],
    });

    expect(
      requireHostedSurfacePreflight({
        surface: "codex-hosted-api",
        operation: "edit",
        hookNonEnforcementAcknowledged: true,
        gitStatusChecked: true,
        targetPaths: [],
        workGuardDecision: noTarget,
        preflightCommand: "helix guard preflight",
        auditRecord: "cli-stdout",
      }),
    ).toMatchObject({
      kind: "deny",
      findings: ["missing_target_paths"],
    });
  });

  it("HU-PILLAR-NAC-02: hosted/API edit propagates work-guard blocks instead of claiming hook coverage", () => {
    const blocked = evaluateWorkGuardTargets({
      targetPaths: ["src/foreign.ts"],
      uncommittedFiles: ["src/foreign.ts"],
      sessionTouchedFiles: [],
      bypass: false,
    });

    expect(
      requireHostedSurfacePreflight({
        surface: "developer-tool",
        operation: "edit",
        hookNonEnforcementAcknowledged: true,
        gitStatusChecked: true,
        targetPaths: ["src/foreign.ts"],
        workGuardDecision: blocked,
        preflightCommand: "helix guard preflight",
        auditRecord: "cli-stdout",
      }),
    ).toMatchObject({
      kind: "deny",
      hookCovered: false,
      findings: ["work_guard_blocked"],
    });
  });

  it("HU-PILLAR-P2-03: guard preflight CLI exposes hosted preflight evidence in JSON", () => {
    const result = spawnSync(
      "npx",
      [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        "src/cli.ts",
        "guard",
        "preflight",
        "--acknowledge-hook-non-enforcement",
        "--json",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout) as {
      adapterParity?: { kind?: string; hookCovered?: boolean; preflightRequired?: boolean };
      hostedPreflight?: { kind?: string; hookCovered?: boolean; apiToolPathEnforced?: boolean };
    };
    expect(parsed.adapterParity).toMatchObject({
      kind: "preflight_required",
      hookCovered: false,
      preflightRequired: true,
    });
    expect(parsed.hostedPreflight).toMatchObject({
      kind: "allow",
      hookCovered: false,
      apiToolPathEnforced: false,
    });
  });

  it("HU-PILLAR-NAC-03: hosted foreign-edit overrideはreasonなしで拒否する", () => {
    const result = spawnSync(
      "npx",
      [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        "src/cli.ts",
        "guard",
        "preflight",
        "--target",
        "src/cli.ts",
        "--allow-foreign-edit",
        "--acknowledge-hook-non-enforcement",
        "--json",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("requires --reason");
  });

  it("HU-PILLAR-NAC-04: hook非強制の明示ackなしではhosted preflightを拒否する", () => {
    const result = spawnSync(
      "npx",
      [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        "src/cli.ts",
        "guard",
        "preflight",
        "--json",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(result.status).toBe(2);
    const parsed = JSON.parse(result.stdout) as { hostedPreflight?: { findings?: string[] } };
    expect(parsed.hostedPreflight?.findings).toContain("missing_hook_non_enforcement_ack");
  });

  it("HU-PILLAR-NAC-05: reason付きoverrideをDBへ記録し同一nonce再利用を拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-hosted-preflight-"));
    try {
      const git = (args: string[]) =>
        spawnSync("git", args, { cwd: root, encoding: "utf8", stdio: "pipe" });
      expect(git(["init", "-b", "main"]).status).toBe(0);
      expect(git(["config", "user.name", "HELIX Test"]).status).toBe(0);
      expect(git(["config", "user.email", "helix-test@example.invalid"]).status).toBe(0);
      writeFileSync(join(root, "owned.txt"), "base\n");
      expect(git(["add", "owned.txt"]).status).toBe(0);
      expect(git(["commit", "-m", "test: seed"]).status).toBe(0);
      writeFileSync(join(root, "owned.txt"), "foreign\n");

      const args = [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        join(process.cwd(), "src/cli.ts"),
        "guard",
        "preflight",
        "--target",
        "owned.txt",
        "--allow-foreign-edit",
        "--reason",
        "bounded recovery test",
        "--acknowledge-hook-non-enforcement",
        "--session",
        "test-session",
        "--json",
      ];
      const first = spawnSync("npx", args, { cwd: root, encoding: "utf8" });
      expect(first.status, first.stderr).toBe(0);
      const parsed = JSON.parse(first.stdout) as {
        hostedPreflight?: { kind?: string };
        override?: { reason?: string; reason_digest?: string };
      };
      expect(parsed.hostedPreflight?.kind).toBe("allow");
      expect(parsed.override?.reason).toBeUndefined();
      expect(parsed.override?.reason_digest).toMatch(/^sha256:[0-9a-f]{64}$/);

      const db = openHarnessDb(defaultHarnessDbPath(root), { repoRoot: root });
      try {
        const rows = db
          .prepare("SELECT guard_kind, operation_class, status FROM guard_override_transactions")
          .all() as Array<Record<string, unknown>>;
        expect(rows).toEqual([
          expect.objectContaining({
            guard_kind: "foreign_edit",
            operation_class: "hosted preflight foreign edit",
            status: "committed",
          }),
        ]);
      } finally {
        db.close();
      }

      const second = spawnSync("npx", args, { cwd: root, encoding: "utf8" });
      expect(second.status).toBe(2);
      expect(second.stderr).toContain("nonce was reused");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("HU-PILLAR-NAC-06: legacy env overrideへ暗黙fallbackしない", () => {
    const result = spawnSync(
      "npx",
      [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        "src/cli.ts",
        "guard",
        "preflight",
        "--acknowledge-hook-non-enforcement",
        "--json",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: { ...process.env, HELIX_ALLOW_FOREIGN_EDIT: "1" },
      },
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("requires explicit --allow-foreign-edit and --reason");
  });

  it("HOSTED-PREFLIGHT-OVERRIDE-NONCE-ORDER-001: denyされた試行はnonceを消費せずack訂正を許可する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-hosted-preflight-retry-"));
    try {
      const git = (args: string[]) =>
        spawnSync("git", args, { cwd: root, encoding: "utf8", stdio: "pipe" });
      expect(git(["init", "-b", "main"]).status).toBe(0);
      expect(git(["config", "user.name", "HELIX Test"]).status).toBe(0);
      expect(git(["config", "user.email", "helix-test@example.invalid"]).status).toBe(0);
      writeFileSync(join(root, "owned.txt"), "base\n");
      expect(git(["add", "owned.txt"]).status).toBe(0);
      expect(git(["commit", "-m", "test: seed"]).status).toBe(0);
      writeFileSync(join(root, "owned.txt"), "foreign\n");

      const baseArgs = [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        join(process.cwd(), "src/cli.ts"),
        "guard",
        "preflight",
        "--target",
        "owned.txt",
        "--allow-foreign-edit",
        "--reason",
        "correctable missing ack",
        "--session",
        "retry-session",
        "--json",
      ];
      const denied = spawnSync("npx", baseArgs, { cwd: root, encoding: "utf8" });
      expect(denied.status).toBe(2);
      expect(JSON.parse(denied.stdout).hostedPreflight?.findings).toContain(
        "missing_hook_non_enforcement_ack",
      );

      const corrected = spawnSync("npx", [...baseArgs, "--acknowledge-hook-non-enforcement"], {
        cwd: root,
        encoding: "utf8",
      });
      expect(corrected.status, corrected.stderr).toBe(0);
      expect(JSON.parse(corrected.stdout).hostedPreflight?.kind).toBe("allow");

      const db = openHarnessDb(defaultHarnessDbPath(root), { repoRoot: root });
      try {
        const rows = db.prepare("SELECT status FROM guard_override_transactions").all() as Array<
          Record<string, unknown>
        >;
        expect(rows).toEqual([{ status: "committed" }]);
      } finally {
        db.close();
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
