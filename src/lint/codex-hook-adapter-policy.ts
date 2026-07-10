interface CodexRequiredHook {
  id: string;
  event: string;
  matcher?: string;
  commandParts: readonly string[];
  blockOnFailure?: boolean;
}

interface CodexDeferredSurface {
  surface: string;
  claude_analog: string;
  reason: string;
}

// Codex 0.144 の canonical hook tool 名 (codex-rs core/src/tools/hook_names.rs が正本):
//   shell = `Bash` (旧 `exec_command|local_shell` は一致しなくなった)、
//   編集 = `apply_patch` (matcher alias `Write`/`Edit`、旧 `write_file` は廃止)、
//   sub-agent = `spawn_agent` (alias `Agent`)。SubagentStop event も 0.144 で実在する。
export const CODEX_REQUIRED = [
  {
    id: "agent-guard",
    event: "PreToolUse",
    matcher: "spawn_agent|spawn_agents_on_csv|Agent",
    commandParts: [".claude/hooks/agent-guard.ts"],
    blockOnFailure: true,
  },
  {
    id: "work-guard",
    event: "PreToolUse",
    matcher: "apply_patch|Write|Edit",
    commandParts: [".claude/hooks/work-guard.ts"],
    blockOnFailure: true,
  },
  {
    id: "git-command-guard",
    event: "PreToolUse",
    matcher: "Bash",
    commandParts: [".claude/hooks/git-command-guard.ts"],
    blockOnFailure: true,
  },
  { id: "session-start", event: "SessionStart", commandParts: ["src/cli.ts", "session start"] },
  {
    id: "post-tool-use",
    event: "PostToolUse",
    matcher: "apply_patch|Write|Edit|Bash",
    commandParts: ["src/cli.ts", "hook post-tool-use"],
  },
  { id: "session-summary", event: "Stop", commandParts: ["src/cli.ts", "session summary"] },
  {
    id: "subagent-stop",
    event: "SubagentStop",
    commandParts: ["src/cli.ts", "hook subagent-stop"],
  },
] satisfies readonly CodexRequiredHook[];

/**
 * Codex 0.144 で SubagentStop event が実装されたため、真の N/A は無くなった
 * (旧: codex.exe 0.128.0 に SubagentStop が無く subagent-stop を N/A としていた)。
 */
export const CODEX_NOT_APPLICABLE = [] as const;

export const CODEX_DEFERRED_SURFACE = [] as readonly CodexDeferredSurface[];

/** `~/.codex/` 等 global Codex 設定への参照 (repo-relative 原則違反) を検出。 */
export const CODEX_GLOBAL_RE = /(?:^|[\s"'=])(?:~|\$HOME|%USERPROFILE%)?[\\/]?\.codex[\\/]/i;
