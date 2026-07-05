import type { WorkGuardTargetsResult } from "./work-guard";

export type AdapterSurface =
  | "claude-hook"
  | "codex-hook"
  | "codex-hosted-api"
  | "hosted-api"
  | "developer-tool"
  | "helix-cli"
  | "external-api";

export type HostedPreflightOperation = "edit" | "dry_run";

export interface AdapterParityInput {
  surface: AdapterSurface;
  toolName?: string | null;
  hookMatcher?: string | null;
  repoHookConfigured?: boolean;
  deferredReason?: string | null;
}

export interface AdapterParityDecision {
  kind: "covered_by_hook" | "preflight_required" | "deferred_guard" | "drift";
  surface: AdapterSurface;
  toolName: string;
  hookCovered: boolean;
  preflightRequired: boolean;
  reason: string;
}

export interface HostedSurfacePreflightInput {
  surface: AdapterSurface;
  operation: HostedPreflightOperation;
  hookNonEnforcementAcknowledged?: boolean;
  gitStatusChecked?: boolean;
  targetPaths?: string[] | null;
  workGuardDecision?: WorkGuardTargetsResult | null;
  preflightCommand?: string | null;
  auditRecord?: string | null;
}

export interface HostedSurfacePreflightDecision {
  kind: "allow" | "deny";
  surface: AdapterSurface;
  hookCovered: boolean;
  apiToolPathEnforced: false;
  operation: HostedPreflightOperation;
  findings: string[];
  reason: string;
}

const HOSTED_SURFACES = new Set<AdapterSurface>([
  "codex-hosted-api",
  "hosted-api",
  "developer-tool",
]);

const DIRECT_HOOK_TOOLS: Record<"claude-hook" | "codex-hook", Set<string>> = {
  "claude-hook": new Set(["Edit", "Write", "MultiEdit", "Bash", "Agent"]),
  "codex-hook": new Set([
    "apply_patch",
    "write_file",
    "exec_command",
    "local_shell",
    "spawn_agent",
    "spawn_agents_on_csv",
  ]),
};

function present(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isHostedSurface(surface: AdapterSurface): boolean {
  return HOSTED_SURFACES.has(surface);
}

export function validateAdapterParityMap(input: AdapterParityInput): AdapterParityDecision {
  const toolName = input.toolName?.trim() ?? "";
  if (isHostedSurface(input.surface)) {
    return {
      kind: "preflight_required",
      surface: input.surface,
      toolName,
      hookCovered: false,
      preflightRequired: true,
      reason: "repo_hooks_do_not_execute_on_hosted_api_surface",
    };
  }

  if (input.surface === "claude-hook" || input.surface === "codex-hook") {
    const knownTool = DIRECT_HOOK_TOOLS[input.surface].has(toolName);
    if (input.repoHookConfigured === false) {
      return {
        kind: "drift",
        surface: input.surface,
        toolName,
        hookCovered: false,
        preflightRequired: false,
        reason: "repo_hook_not_configured",
      };
    }
    if (knownTool) {
      return {
        kind: "covered_by_hook",
        surface: input.surface,
        toolName,
        hookCovered: true,
        preflightRequired: false,
        reason: input.hookMatcher ?? "repo_hook_matcher",
      };
    }
  }

  if (present(input.deferredReason)) {
    return {
      kind: "deferred_guard",
      surface: input.surface,
      toolName,
      hookCovered: false,
      preflightRequired: false,
      reason: input.deferredReason.trim(),
    };
  }

  return {
    kind: "drift",
    surface: input.surface,
    toolName,
    hookCovered: false,
    preflightRequired: false,
    reason: "unknown_or_unmapped_surface",
  };
}

export function requireHostedSurfacePreflight(
  input: HostedSurfacePreflightInput,
): HostedSurfacePreflightDecision {
  const findings: string[] = [];
  if (!isHostedSurface(input.surface)) {
    return {
      kind: "allow",
      surface: input.surface,
      hookCovered: true,
      apiToolPathEnforced: false,
      operation: input.operation,
      findings,
      reason: "direct_hook_surface",
    };
  }

  if (!input.hookNonEnforcementAcknowledged) {
    findings.push("missing_hook_non_enforcement_ack");
  }
  if (!input.gitStatusChecked) {
    findings.push("missing_git_status_preflight");
  }
  if (input.operation === "edit" && (input.targetPaths ?? []).length === 0) {
    findings.push("missing_target_paths");
  }
  if (!input.workGuardDecision) {
    findings.push("missing_work_guard_decision");
  } else if (input.workGuardDecision.decision === "block") {
    findings.push("work_guard_blocked");
  }
  if (!present(input.preflightCommand)) {
    findings.push("missing_preflight_command");
  }
  if (!present(input.auditRecord)) {
    findings.push("missing_audit_record");
  }

  return {
    kind: findings.length === 0 ? "allow" : "deny",
    surface: input.surface,
    hookCovered: false,
    apiToolPathEnforced: false,
    operation: input.operation,
    findings,
    reason: findings.length === 0 ? "hosted_preflight_complete" : findings.join(","),
  };
}
