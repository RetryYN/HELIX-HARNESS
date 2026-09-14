import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { extractShellCommand } from "./git-command-guard";
import {
  evaluateMachineSafetyGuard,
  INTERPRETER_DELETE_API,
  type MachineSafetyGuardResult,
} from "./machine-safety-guard";

function referencedInterpreterScripts(command: string): string[] {
  const matches: string[] = [];
  const pattern =
    /(?:^|[;&|]\s*|\s)(?:python(?:3(?:\.\d+)?)?|node|pwsh|powershell)(?:\.exe)?\s+(?!-[ce]\b)(["']?)([^\s"';|]+\.(?:py|mjs|cjs|js|ps1))\1/gi;
  for (const match of command.matchAll(pattern)) if (match[2]) matches.push(match[2]);
  return matches;
}

export function runMachineSafetyGuardHook(opts: {
  repoRoot: string;
  rawInput: string;
}): MachineSafetyGuardResult {
  let input: { tool_input?: unknown };
  try {
    input = JSON.parse(opts.rawInput || "{}");
  } catch {
    return {
      decision: "block",
      reason: "dynamic-delete",
      operation: "invalid hook input",
      message: "[helix-machine-safety-guard] BLOCK: hook inputを解析できません。",
    };
  }
  const command = extractShellCommand(input.tool_input);
  const direct = evaluateMachineSafetyGuard({ command, repoRoot: opts.repoRoot });
  if (direct.decision === "block") return direct;
  for (const path of referencedInterpreterScripts(command)) {
    const full = resolve(opts.repoRoot, path);
    try {
      const rel = relative(resolve(opts.repoRoot), full);
      if (rel.startsWith("..") || isAbsolute(rel))
        throw new Error("interpreter script is outside repository");
      if (!existsSync(full) || !statSync(full).isFile() || statSync(full).size > 2 * 1024 * 1024)
        throw new Error("interpreter script cannot be inspected");
      if (INTERPRETER_DELETE_API.test(readFileSync(full, "utf8"))) {
        return {
          decision: "block",
          reason: "dynamic-delete",
          operation: "interpreter script with filesystem deletion",
          message:
            `[helix-machine-safety-guard] BLOCK: ${path} は機械的なfilesystem削除APIを含みます。` +
            " 対象をrepo内の明示的な単一ファイルへ分解するか、隔離sandbox内で実行してください。",
        };
      }
    } catch {
      return {
        decision: "block",
        reason: "dynamic-delete",
        operation: "uninspectable interpreter script",
        message: `[helix-machine-safety-guard] BLOCK: ${path} の安全性を検証できません。`,
      };
    }
  }
  return direct;
}
