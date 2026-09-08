import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { analyzeCommitSubjects, commitlintMessages } from "../lint/github-guards";
import { defaultHarnessDbPath, type HarnessDb, openHarnessDb } from "../state-db";
import { migrate, SCHEMA_VERSION } from "../state-db/migration";
import {
  containsDirectGithubPrLifecycleMutation,
  containsDirectGithubPrMerge,
  contextualMutationExecutionDirectories,
  evaluateGitCommandGuard,
  extractShellCommand,
  gitCheckoutTargets,
  gitPushCommands,
  resolveDestructiveGitOverride,
} from "./git-command-guard";
import { commitOverrideUse, type OverrideAuditPort } from "./guard-override-transaction";
import { resolveGitMutationContext, resolveHookExecutionCwd } from "./worktree-state";

function gitOutput(cwd: string, args: string[]): string | null {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.error || result.status !== 0) return null;
  return result.stdout.trim();
}

function pushPositionals(args: string[]): string[] | null {
  const values: string[] = [];
  const valueOptions = new Set(["--repo", "--receive-pack", "--exec", "--push-option", "-o"]);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? "";
    if (arg === "--") {
      values.push(...args.slice(index + 1));
      break;
    }
    if (valueOptions.has(arg)) {
      if (!args[index + 1]) return null;
      index += 1;
      continue;
    }
    if (/^--(?:repo|receive-pack|exec|push-option)=/.test(arg) || arg.startsWith("-")) continue;
    values.push(arg);
  }
  return values;
}

function pushCommitlintFailure(command: string, executionCwd: string): string | null {
  const pushes = gitPushCommands(command, executionCwd);
  if (pushes === null) return "push commandを完全に解析できません";
  for (const push of pushes) {
    if (push.args.includes("--delete") || push.args.includes("-d")) continue;
    const positional = pushPositionals(push.args);
    if (!positional || positional.length > 2) return "push refspecを一意に解決できません";
    const currentBranch = gitOutput(push.cwd, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
    const remote =
      positional[0] ??
      (currentBranch
        ? gitOutput(push.cwd, ["config", "--get", `branch.${currentBranch}.remote`])
        : null);
    if (!currentBranch || !remote || remote === ".") return "push先branchを解決できません";
    const refspec = positional[1] ?? currentBranch;
    if (refspec.startsWith(":")) continue;
    const [rawSource, rawTarget] = refspec.split(":", 2);
    const source = rawSource === "HEAD" || !rawSource ? "HEAD" : rawSource;
    const target = (
      rawTarget || (rawSource === "HEAD" ? currentBranch : rawSource || currentBranch)
    ).replace(/^refs\/heads\//, "");
    if (!/^[A-Za-z0-9._/-]+$/.test(target)) return "push先branch名を解決できません";
    const sourceHead = gitOutput(push.cwd, ["rev-parse", "--verify", `${source}^{commit}`]);
    if (!sourceHead) return "push元commitを解決できません";
    let base = gitOutput(push.cwd, [
      "rev-parse",
      "--verify",
      `refs/remotes/${remote}/${target}^{commit}`,
    ]);
    if (!base) {
      const remoteHead = gitOutput(push.cwd, [
        "symbolic-ref",
        "--quiet",
        `refs/remotes/${remote}/HEAD`,
      ]);
      base = gitOutput(push.cwd, [
        "merge-base",
        sourceHead,
        remoteHead ?? `refs/remotes/${remote}/main`,
      ]);
    }
    if (!base) return "push差分の基準commitを解決できません";
    const rawSubjects = gitOutput(push.cwd, ["log", "--format=%s", `${base}..${sourceHead}`]);
    if (rawSubjects === null) return "push対象commitを読み取れません";
    const result = analyzeCommitSubjects(rawSubjects ? rawSubjects.split("\n") : []);
    if (!result.ok) return commitlintMessages(result).join("; ");
  }
  return null;
}

export interface GitCommandGuardHookOutcome {
  exitCode: 0 | 2;
  message?: string;
  reason?: string;
}

export function guardOverrideDigest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function createGuardOverrideAuditPort(db: HarnessDb): OverrideAuditPort {
  return {
    commit(input) {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          db.exec("BEGIN IMMEDIATE");
          const inserted = db
            .prepare(`INSERT OR IGNORE INTO guard_override_transactions
          (nonce, guard_kind, operation_class, subject_digest, reason_digest, status, created_at)
          VALUES (?, ?, ?, ?, ?, 'committed', ?)`)
            .run(
              input.nonce,
              input.classification.guardKind,
              input.classification.operationClass,
              input.classification.subjectDigest,
              guardOverrideDigest(input.reason),
              new Date().toISOString(),
            );
          db.exec("COMMIT");
          return { status: inserted.changes === 1 ? "committed" : "reused" };
        } catch (error) {
          try {
            db.exec("ROLLBACK");
          } catch {
            // fail-close: retain the original transaction error; rollback is best-effort cleanup.
          }
          const code = String((error as NodeJS.ErrnoException).code ?? "");
          const message = String(error).toUpperCase();
          const busy =
            code.includes("BUSY") ||
            code.includes("LOCKED") ||
            message.includes("SQLITE_BUSY") ||
            message.includes("SQLITE_LOCKED") ||
            message.includes("DATABASE IS LOCKED");
          if (!busy) throw error;
          if (attempt === 4) {
            const committed = db
              .prepare(
                "SELECT 1 FROM guard_override_transactions WHERE nonce=? AND status='committed' LIMIT 1",
              )
              .get(input.nonce);
            if (committed) return { status: "reused" };
            throw error;
          }
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10 * (attempt + 1));
        }
      }
      throw new Error("guard override transaction retry exhausted");
    },
    abort(input) {
      db.prepare(`UPDATE guard_override_transactions
        SET status='consume_failed', abort_reason=? WHERE nonce=?`).run(input.reason, input.nonce);
    },
  };
}

export function runGitCommandGuardHook(opts: {
  repoRoot: string;
  rawInput: string;
  env?: NodeJS.ProcessEnv;
  executionCwd?: string;
}): GitCommandGuardHookOutcome {
  let input: { tool_input?: unknown; session_id?: string };
  try {
    input = JSON.parse(opts.rawInput || "{}");
  } catch {
    return { exitCode: 2, message: "[helix-git-command-guard] BLOCK: invalid hook input" };
  }
  const command = extractShellCommand(input.tool_input);
  if (containsDirectGithubPrMerge(command)) {
    return {
      exitCode: 2,
      message:
        "[helix-git-command-guard] BLOCK: direct `gh pr merge` is forbidden; use `helix github pr-merge-reviewed --receipt <path>`",
    };
  }
  if (containsDirectGithubPrLifecycleMutation(command)) {
    return {
      exitCode: 2,
      message:
        "[helix-git-command-guard] BLOCK: direct PR close/reopen is forbidden because it cancels active CI and invalidates convergence evidence",
    };
  }
  let base = evaluateGitCommandGuard({ command, bypass: false });
  if (base.reason === "checkout-target-context-required") {
    const executionCwd = resolveHookExecutionCwd(
      input.tool_input,
      opts.executionCwd ?? process.cwd(),
    );
    const targets = gitCheckoutTargets(command);
    let resolution: "refs-only" | "path-or-ambiguous" | "unresolved" = "refs-only";
    if (!targets || targets.length === 0) {
      resolution = "unresolved";
    } else {
      for (const target of targets) {
        const pathExists = existsSync(join(executionCwd, target));
        const ref = spawnSync("git", ["rev-parse", "--verify", "--quiet", `${target}^{commit}`], {
          cwd: executionCwd,
          encoding: "utf8",
        });
        if (pathExists) {
          resolution = "path-or-ambiguous";
          break;
        }
        if (ref.error || ref.status !== 0) {
          resolution = "unresolved";
          break;
        }
      }
    }
    base = evaluateGitCommandGuard({
      command,
      bypass: false,
      checkoutTargetContext: { resolution },
    });
  }
  if (base.reason === "mutation-context-required") {
    const executionCwd = resolveHookExecutionCwd(
      input.tool_input,
      opts.executionCwd ?? process.cwd(),
    );
    const executionCwds = contextualMutationExecutionDirectories(command, executionCwd);
    const mutationContext = resolveGitMutationContext({
      repoRoot: opts.repoRoot,
      executionCwds: executionCwds ?? [],
      sessionId: input.session_id ?? "unknown",
    });
    base = evaluateGitCommandGuard({ command, bypass: false, mutationContext });
  }
  if (base.decision === "pass") {
    const executionCwd = resolveHookExecutionCwd(
      input.tool_input,
      opts.executionCwd ?? process.cwd(),
    );
    const failure = pushCommitlintFailure(command, executionCwd);
    if (failure) {
      return {
        exitCode: 2,
        reason: "commitlint-pre-push",
        message: `[helix-git-command-guard] BLOCK: push前commitlintが失敗しました: ${failure}`,
      };
    }
  }
  if (base.decision === "pass") return { exitCode: 0, reason: base.reason };
  const markerPath = join(opts.repoRoot, ".helix", "state", "destructive-git-override");
  let markerReason: string | null = null;
  try {
    markerReason = existsSync(markerPath) ? readFileSync(markerPath, "utf8") : null;
  } catch {
    return { exitCode: 2, message: base.message };
  }
  const override = resolveDestructiveGitOverride({
    env: (opts.env ?? process.env).HELIX_ALLOW_DESTRUCTIVE_GIT,
    markerReason,
  });
  let markerNonce: string | null = null;
  if (override.source === "marker" && markerReason !== null) {
    try {
      const markerStat = statSync(markerPath);
      markerNonce = guardOverrideDigest(
        `${markerStat.dev}:${markerStat.ino}:${markerStat.mtimeMs}:${markerReason}`,
      );
    } catch {
      return { exitCode: 2, message: base.message };
    }
  }
  const barrierDir = (opts.env ?? process.env).HELIX_GUARD_TEST_BARRIER_DIR;
  if ((opts.env ?? process.env).NODE_ENV === "test" && barrierDir) {
    mkdirSync(barrierDir, { recursive: true });
    writeFileSync(join(barrierDir, String(process.pid)), "ready");
    const deadline = Date.now() + 5_000;
    while (readdirSync(barrierDir).length < 2) {
      if (Date.now() >= deadline) throw new Error("guard test barrier timed out");
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
    }
  }
  if (override.source === "env") {
    try {
      const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), {
        repoRoot: opts.repoRoot,
        skipPersistentPragmas: true,
      });
      try {
        if (db.userVersion() < SCHEMA_VERSION) migrate(db);
        const result = commitOverrideUse({
          nonce: guardOverrideDigest(
            `env:git:${input.session_id ?? "unknown"}:${guardOverrideDigest(command)}`,
          ),
          reason: override.reason,
          classification: {
            guardKind: "git",
            operationClass: base.destructiveOperation ?? "indeterminate",
            subjectDigest: guardOverrideDigest(command),
          },
          audit: createGuardOverrideAuditPort(db),
          marker: { consume: () => true },
        });
        if (result.status === "allowed") return { exitCode: 0, reason: "bypass" };
        return { exitCode: 2, message: `${base.message} override=${result.status}` };
      } finally {
        db.close();
      }
    } catch {
      return { exitCode: 2, message: `${base.message} override=blocked_audit_failure` };
    }
  }
  if (override.source !== "marker" || markerReason === null || markerNonce === null)
    return { exitCode: 2, message: base.message };
  try {
    const db = openHarnessDb(defaultHarnessDbPath(opts.repoRoot), {
      repoRoot: opts.repoRoot,
      skipPersistentPragmas: true,
    });
    try {
      if (db.userVersion() < SCHEMA_VERSION) migrate(db);
      const result = commitOverrideUse({
        nonce: markerNonce,
        reason: override.reason,
        classification: {
          guardKind: "git",
          operationClass: base.destructiveOperation ?? "indeterminate",
          subjectDigest: guardOverrideDigest(command),
        },
        audit: createGuardOverrideAuditPort(db),
        marker: {
          consume(expectedNonce) {
            if (
              (opts.env ?? process.env).NODE_ENV === "test" &&
              (opts.env ?? process.env).HELIX_GUARD_TEST_FAULT === "pause_after_audit"
            ) {
              Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30_000);
            }
            const current = readFileSync(markerPath, "utf8");
            const currentStat = statSync(markerPath);
            const actual = guardOverrideDigest(
              `${currentStat.dev}:${currentStat.ino}:${currentStat.mtimeMs}:${current}`,
            );
            if (actual !== expectedNonce) return false;
            rmSync(markerPath);
            return !existsSync(markerPath);
          },
        },
      });
      if (result.status === "allowed") return { exitCode: 0, reason: "bypass" };
      return { exitCode: 2, message: `${base.message} override=${result.status}` };
    } finally {
      db.close();
    }
  } catch {
    return { exitCode: 2, message: `${base.message} override=blocked_audit_failure` };
  }
}
