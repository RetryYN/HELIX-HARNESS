#!/usr/bin/env bun
/**
 * PreToolUse(Bash / exec_command) hook — destructive git operation guard.
 *
 * `git reset` / destructive checkout / restore / revert / force-push は hybrid runtime で
 * 相手 runtime の commit や未共有作業を壊し得るため、理由付き override なしでは block する。
 * 内部エラーは fail-open。block は危険操作を確証できた時のみ。
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluateGitCommandGuard,
  extractShellCommand,
  resolveDestructiveGitOverride,
} from "../../src/runtime/git-command-guard";
import { runGitCommandGuardHook } from "../../src/runtime/git-command-guard-hook";
import {
  evaluateWorkGuardTargets,
  extractShellWriteTargets,
  normalizeRepoRelative,
  resolveForeignEditOverride,
} from "../../src/runtime/work-guard";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.CLAUDE_PROJECT_DIR ?? join(here, "..", "..");
const OVERRIDE_MARKER = join(repoRoot, ".helix", "state", "destructive-git-override");
const OVERRIDE_AUDIT = join(repoRoot, ".helix", "logs", "destructive-git-overrides.jsonl");
const FOREIGN_MARKER = join(repoRoot, ".helix", "state", "foreign-edit-override");
const FOREIGN_AUDIT = join(repoRoot, ".helix", "logs", "foreign-edit-overrides.jsonl");

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

function gitUncommittedFiles(): string[] {
  const out = execFileSync("git", ["status", "--porcelain"], { cwd: repoRoot, encoding: "utf8" });
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ")[1] : path))
    .map((path) => normalizeRepoRelative(path.replace(/^"|"$/g, ""), repoRoot));
}

function sessionTouchedFiles(sessionId: string): string[] {
  const path = join(repoRoot, ".helix", "logs", "session", `${sessionId.replace(/[\\/]+/g, "_")}.jsonl`);
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .flatMap((line) => {
      try {
        const target = (JSON.parse(line) as { target?: unknown }).target;
        return typeof target === "string" ? [normalizeRepoRelative(target, repoRoot)] : [];
      } catch {
        return [];
      }
    });
}

let input: { tool_input?: unknown; session_id?: string };
try {
  input = JSON.parse((await readStdin()) || "{}");
} catch {
  process.exit(0);
}

try {
  const command = extractShellCommand(input.tool_input);
  const gitOutcome = runGitCommandGuardHook({
    repoRoot,
    rawInput: JSON.stringify(input),
    env: process.env,
  });
  const targets = extractShellWriteTargets(command).map((path) => normalizeRepoRelative(path, repoRoot));
  const foreignOverride = resolveForeignEditOverride({
    env: process.env.HELIX_ALLOW_FOREIGN_EDIT,
    markerReason: existsSync(FOREIGN_MARKER) ? readFileSync(FOREIGN_MARKER, "utf8") : null,
  });
  const uncommittedFiles = targets.length > 0 ? gitUncommittedFiles() : [];
  const touchedFiles = targets.length > 0 ? sessionTouchedFiles(input.session_id ?? "unknown") : [];
  const foreignWouldBlock = evaluateWorkGuardTargets({
    targetPaths: targets,
    uncommittedFiles,
    sessionTouchedFiles: touchedFiles,
    bypass: false,
  });
  const foreignResult = evaluateWorkGuardTargets({
    targetPaths: targets,
    uncommittedFiles,
    sessionTouchedFiles: touchedFiles,
    bypass: foreignOverride.bypass,
  });
  if (foreignOverride.source === "marker" && foreignWouldBlock.decision === "block") {
    try {
      mkdirSync(dirname(FOREIGN_AUDIT), { recursive: true });
      appendFileSync(FOREIGN_AUDIT, `${JSON.stringify({ ts: new Date().toISOString(), target: targets.join(", "), reason: foreignOverride.reason, sessionId: input.session_id ?? "unknown" })}\n`);
      rmSync(FOREIGN_MARKER, { force: true });
    } catch {
      // fail-open on audit/cleanup.
    }
  }
  if (foreignResult.decision === "block") {
    process.stderr.write(`${foreignResult.blocked?.message ?? "[helix-work-guard] BLOCK"}\n`);
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
