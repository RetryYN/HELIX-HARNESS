import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  requireHostedSurfacePreflight,
  validateAdapterParityMap,
} from "../src/runtime/hosted-preflight";
import { evaluateWorkGuardTargets } from "../src/runtime/work-guard";

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
    const result = spawnSync("npx", ["--no-install", "tsx", "src/cli.ts", "guard", "preflight", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
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
});
