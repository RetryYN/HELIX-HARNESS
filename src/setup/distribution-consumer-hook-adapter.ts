import { execFileSync } from "node:child_process";
import { evaluateGitCommandGuard, extractShellCommand } from "../runtime/git-command-guard";
import { evaluateMachineSafetyGuard } from "../runtime/machine-safety-guard";
import {
  evaluateWorkGuardTargets,
  extractEditTargets,
  normalizeRepoRelative,
} from "../runtime/work-guard";

export interface LiteConsumerHookOutcome {
  exit_code: 0 | 2;
  payload: unknown;
}

function parse(rawInput: string): { tool_input?: unknown } | null {
  try {
    return JSON.parse(rawInput || "{}") as { tool_input?: unknown };
  } catch {
    return null;
  }
}

function uncommitted(repoRoot: string): string[] {
  try {
    return execFileSync("git", ["status", "--porcelain"], {
      cwd: repoRoot,
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean)
      .map((line) => normalizeRepoRelative(line.slice(3).split(" -> ").at(-1) ?? "", repoRoot));
  } catch {
    return [];
  }
}

export function runLiteConsumerHook(input: {
  hook_id: string;
  repo_root: string;
  raw_input: string;
}): LiteConsumerHookOutcome {
  const parsed = parse(input.raw_input);
  if (!parsed) return { exit_code: 2, payload: { decision: "block", reason: "invalid_input" } };
  if (input.hook_id === "git-command-guard") {
    const outcome = evaluateGitCommandGuard({
      command: extractShellCommand(parsed.tool_input),
      bypass: false,
    });
    return { exit_code: outcome.decision === "block" ? 2 : 0, payload: outcome };
  }
  if (input.hook_id === "machine-safety-guard") {
    const outcome = evaluateMachineSafetyGuard({
      command: extractShellCommand(parsed.tool_input),
      repoRoot: input.repo_root,
    });
    return { exit_code: outcome.decision === "block" ? 2 : 0, payload: outcome };
  }
  if (input.hook_id === "work-guard") {
    const targets = extractEditTargets(parsed.tool_input).map((path) =>
      normalizeRepoRelative(path, input.repo_root),
    );
    const outcome = evaluateWorkGuardTargets({
      targetPaths: targets,
      uncommittedFiles: uncommitted(input.repo_root),
      sessionTouchedFiles: [],
      bypass: false,
    });
    return { exit_code: outcome.decision === "block" ? 2 : 0, payload: outcome };
  }
  return { exit_code: 2, payload: { decision: "block", reason: "hook_unknown" } };
}
