#!/usr/bin/env bun
/**
 * PreToolUse(Bash / exec_command) hook — destructive git operation guard.
 *
 * `git reset` / destructive checkout / restore / revert / force-push は hybrid runtime で
 * 相手 runtime の commit や未共有作業を壊し得るため、理由付き override なしでは block する。
 * 内部エラーは fail-open。block は危険操作を確証できた時のみ。
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runGitCommandGuardHook } from "../../src/runtime/git-command-guard-hook";
import { runWorkGuardHook } from "../../src/runtime/work-guard-hook";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.CLAUDE_PROJECT_DIR ?? join(here, "..", "..");

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

let input: { tool_input?: unknown; session_id?: string };
try {
  input = JSON.parse((await readStdin()) || "{}");
} catch {
  process.exit(0);
}

try {
  const rawInput = JSON.stringify(input);
  const gitOutcome = runGitCommandGuardHook({
    repoRoot,
    rawInput,
    env: process.env,
  });
  const foreignOutcome = runWorkGuardHook({ repoRoot, rawInput, env: process.env });
  if (foreignOutcome.exitCode === 2) {
    process.stderr.write(`${foreignOutcome.message ?? "[helix-work-guard] BLOCK"}\n`);
    process.exit(2);
  }
  if (gitOutcome.exitCode === 2) {
    process.stderr.write(`${gitOutcome.message ?? "[helix-git-command-guard] BLOCK"}\n`);
    process.exit(2);
  }
  process.exit(0);
} catch {
  process.exit(0);
}
