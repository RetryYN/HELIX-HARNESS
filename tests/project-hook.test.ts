import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeProjectHooks,
  loadClaudeAgentDocs,
  loadProjectHookDocs,
} from "../src/lint/project-hook";

describe("project-hook lint", () => {
  it("accepts the repository project-local Claude hook settings", () => {
    const result = analyzeProjectHooks(
      loadProjectHookDocs(process.cwd()),
      loadClaudeAgentDocs(process.cwd()),
    );

    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("rejects Claude auto memory when it is not explicitly disabled", () => {
    const settings = JSON.parse(
      readFileSync(join(process.cwd(), ".claude", "settings.json"), "utf8"),
    ) as Record<string, unknown>;
    delete settings.autoMemoryEnabled;

    const result = analyzeProjectHooks([
      { file: ".claude/settings.json", content: JSON.stringify(settings) },
    ]);

    expect(result.violations).toContainEqual({
      file: ".claude/settings.json",
      reason: "native_memory_not_disabled",
    });
  });

  it("rejects provider-native agent memory declarations", () => {
    const settings = readFileSync(join(process.cwd(), ".claude", "settings.json"), "utf8");
    const result = analyzeProjectHooks(
      [{ file: ".claude/settings.json", content: settings }],
      [{ file: ".claude/agents/example.md", content: "---\nmemory: project\n---\n" }],
    );

    expect(result.violations).toContainEqual({
      file: ".claude/agents/example.md",
      reason: "native_agent_memory_enabled",
    });
  });

  it("rejects missing team-standard project hook entries", () => {
    const settings = JSON.parse(
      readFileSync(join(process.cwd(), ".claude", "settings.json"), "utf8"),
    ) as { hooks: Record<string, unknown> };
    delete settings.hooks.Stop;

    const result = analyzeProjectHooks([
      { file: ".claude/settings.json", content: JSON.stringify(settings) },
    ]);

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      file: ".claude/settings.json",
      hook: "Stop",
      reason: "missing_hook",
    });
  });

  it("rejects personal absolute paths in project hook commands", () => {
    const result = analyzeProjectHooks([
      {
        file: ".claude/settings.json",
        content: JSON.stringify({
          hooks: {
            PreToolUse: [
              {
                matcher: "Agent",
                hooks: [
                  {
                    command: 'bun "$CLAUDE_PROJECT_DIR/.claude/hooks/agent-guard.ts"',
                    blockOnFailure: true,
                  },
                ],
              },
              {
                matcher: "Edit|Write|MultiEdit",
                hooks: [
                  {
                    command: 'bun "$CLAUDE_PROJECT_DIR/.claude/hooks/work-guard.ts"',
                    blockOnFailure: true,
                  },
                ],
              },
            ],
            SessionStart: [
              {
                hooks: [
                  {
                    command:
                      'bun "$CLAUDE_PROJECT_DIR/src/cli.ts" session start --legacy C:\\Users\\micro\\legacy',
                  },
                ],
              },
            ],
            PostToolUse: [
              {
                matcher: "Edit|Write|MultiEdit|Bash",
                hooks: [{ command: 'bun "$CLAUDE_PROJECT_DIR/src/cli.ts" hook post-tool-use' }],
              },
            ],
            Stop: [
              { hooks: [{ command: 'bun "$CLAUDE_PROJECT_DIR/src/cli.ts" session summary' }] },
            ],
            SubagentStop: [
              { hooks: [{ command: 'bun "$CLAUDE_PROJECT_DIR/src/cli.ts" hook subagent-stop' }] },
            ],
          },
        }),
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      file: ".claude/settings.json",
      hook: "SessionStart",
      reason: "forbidden_path",
    });
  });

  it("rejects legacy runtime commands in any project hook command", () => {
    const settings = JSON.parse(
      readFileSync(join(process.cwd(), ".claude", "settings.json"), "utf8"),
    ) as { hooks: Record<string, unknown> };
    const legacyName = ["he", "lix"].join("");
    settings.hooks.Notification = [{ hooks: [{ command: `${legacyName} codex --role worker` }] }];

    const result = analyzeProjectHooks([
      { file: ".claude/settings.json", content: JSON.stringify(settings) },
    ]);

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      file: ".claude/settings.json",
      hook: "Notification",
      reason: "forbidden_path",
    });
  });
});
