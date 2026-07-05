#!/usr/bin/env bun
/**
 * PreToolUse(Bash / exec_command) hook — destructive git operation guard.
 *
 * `git reset` / destructive checkout / restore / revert / force-push は hybrid runtime で
 * 相手 runtime の commit や未共有作業を壊し得るため、理由付き override なしでは block する。
 * 内部エラーは fail-open。block は危険操作を確証できた時のみ。
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluateGitCommandGuard,
  extractShellCommand,
  resolveDestructiveGitOverride,
} from "../../src/runtime/git-command-guard";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.CLAUDE_PROJECT_DIR ?? join(here, "..", "..");
const OVERRIDE_MARKER = join(repoRoot, ".helix", "state", "destructive-git-override");
const OVERRIDE_AUDIT = join(repoRoot, ".helix", "logs", "destructive-git-overrides.jsonl");

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

function readOverrideMarker(): string | null {
  try {
    return existsSync(OVERRIDE_MARKER) ? readFileSync(OVERRIDE_MARKER, "utf8") : null;
  } catch {
    return null;
  }
}

function auditOverride(entry: { command: string; reason: string; sessionId: string }): void {
  try {
    mkdirSync(dirname(OVERRIDE_AUDIT), { recursive: true });
    appendFileSync(OVERRIDE_AUDIT, `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`);
  } catch {
    // audit failure must not silently convert an allowed override into a hard block.
  }
}

function consumeOverrideMarker(): void {
  try {
    rmSync(OVERRIDE_MARKER, { force: true });
  } catch {
    // fail-open on cleanup.
  }
}

let input: { tool_input?: unknown; session_id?: string };
try {
  input = JSON.parse((await readStdin()) || "{}");
} catch {
  process.exit(0);
}

try {
  const command = extractShellCommand(input.tool_input);
  const override = resolveDestructiveGitOverride({
    env: process.env.HELIX_ALLOW_DESTRUCTIVE_GIT,
    markerReason: readOverrideMarker(),
  });
  const result = evaluateGitCommandGuard({ command, bypass: override.bypass });
  if (override.source === "marker" && command.trim()) {
    auditOverride({
      command,
      reason: override.reason,
      sessionId: input.session_id ?? "unknown",
    });
    consumeOverrideMarker();
  }
  if (result.decision === "block") {
    process.stderr.write(`${result.message}\n`);
    process.exit(2);
  }
  process.exit(0);
} catch {
  process.exit(0);
}
