/**
 * codex-hook-adapter — repo-root `hooks.json` (Codex CLI orchestrator) が Claude
 * `.claude/settings.json` のガード hook と **同一 entrypoint** を、Codex の実 tool 名で配線して
 * いることを fail-close 検査する (PLAN-L7-139, orchestrator-rule parity)。
 *
 * 背景: Codex は Claude 互換の hook 機構を持つ (`hooks.json`,
 * `PreToolUse`/`PostToolUse`/`SessionStart`/`Stop`/`SubagentStop` 等, payload `tool_name`/`tool_input`,
 * `blockOnFailure`)。ただし **tool 名が Claude と一部異なる**ため、matcher の字面コピーは
 * 「hooks.json はあるが一度も発火しない偽パリティ」を生む (coverage≠substance)。
 * Codex 0.144 の canonical 名 (codex-rs core/src/tools/hook_names.rs が正本、2026-07-11 実機検証済):
 *   - shell : `Bash` (0.128 世代の `exec_command|local_shell` は一致しなくなった)
 *   - 編集系: `apply_patch` + matcher alias `Write`/`Edit` (旧 `write_file` は廃止。
 *     `apply_patch` は freeform で file_path を持たず、パスは patch 本文に埋まる。work-guard 側で抽出)
 *   - sub-agent: `spawn_agent` (+alias `Agent`) / `spawn_agents_on_csv` → agent-guard を配線
 *   - `SubagentStop` event は 0.144 で実在 → subagent-stop も配線する (旧 N/A を撤回)
 * さらに 0.144 は hook trust gating を持つ: user/project hooks は `[hooks.state]` の
 * `trusted_hash` が現ハッシュと一致 (Trusted) しない限り silent skip される。trust は TUI の
 * startup review か app-server `config/batchWrite` (hooks.state upsert) で永続化する。
 *
 * SSoT: 各ガードの entrypoint (どの TS スクリプトを呼ぶか) は project-hook.ts の `REQUIRED`
 * (Claude 側) と共有する。本 lint は Codex 側が「Claude と同じ entrypoint を、Codex の matcher で」
 * 宣言しているかを突合し、entrypoint がどちらかにしか無ければ `entrypoint_drift` として fail-close
 * する (Claude/Codex adapter が黙って分岐しない双方向健全性)。純関数 (analyze) + I/O loader 分離。
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CODEX_REQUIRED } from "./codex-hook-adapter-policy";
import { REQUIRED as CLAUDE_REQUIRED, FORBIDDEN_PATH_RE } from "./project-hook";

export { CODEX_REQUIRED };

/** Codex で発火面を持つガードのパリティ要件。entrypoint は Claude `REQUIRED` と共有 (SSoT)。 */

/**
 * Claude のガード entrypoint のうち、Codex に **対応 event/面が存在しない** もの (真の N/A)。
 * Codex 0.144 で SubagentStop event が実装されたため現在は空 (旧 0.128 世代では
 * subagent-stop が N/A だった)。
 */
export const CODEX_NOT_APPLICABLE = [] as const;

/**
 * Codex に **面は実在するが本 PLAN ではまだガードしていない** surface (documented follow-up、N/A ではない)。
 *
 * 当初 agent-guard を「Codex に subagent 面が無い → N/A」と記していたが誤り。codex.exe 0.128.0 には
 * `spawn_agent` / `wait_agent` / `list_agents` / `close_agent` / `spawn_agents_on_csv` の sub-agent
 * ツール族が実在し ("This spawn_agent tool provides you access to sub-agents")、PreToolUse の tool_name
 * として観測できる (cross-runtime review Important で是正、バイナリ実機で確認)。現在は
 * `spawn_agent|spawn_agents_on_csv` を agent-guard に配線し、role allowlist / direct model override /
 * concrete task body / bulk spawn を fail-close する。
 */
interface CodexDeferredSurface {
  surface: string;
  claude_analog: string;
  reason: string;
}

export const CODEX_DEFERRED_SURFACE = [] as readonly CodexDeferredSurface[];

/** `~/.codex/` 等 global Codex 設定への参照 (repo-relative 原則違反) を検出。 */
const CODEX_GLOBAL_RE = /(?:^|[\s"'=])(?:~|\$HOME|%USERPROFILE%)?[\\/]?\.codex[\\/]/i;

export type CodexHookViolationReason =
  | "missing_hooks_json"
  | "missing_config_toml"
  | "malformed_json"
  | "missing_hook"
  | "hooks_feature_disabled"
  | "missing_block_on_failure"
  | "missing_required_token"
  | "insufficient_timeout"
  | "claude_project_dir_in_codex"
  | "global_codex_path"
  | "forbidden_path"
  | "entrypoint_drift";

export interface CodexHookViolation {
  hook?: string;
  reason: CodexHookViolationReason;
}

export interface CodexHookResult {
  checked: number;
  violations: CodexHookViolation[];
  ok: boolean;
  apiToolPathEnforced: false;
}

interface HookCommand {
  type?: string;
  command?: string;
  blockOnFailure?: boolean;
  timeout?: number;
}

interface HookEntry {
  matcher?: string;
  hooks?: HookCommand[];
}

interface CodexHooksFile {
  hooks?: Record<string, HookEntry[]>;
}

function codexHooksFeatureEnabled(configToml: string): boolean {
  let inFeatures = false;
  for (const rawLine of configToml.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (line === "") continue;
    const section = line.match(/^\[([^\]]+)\]$/);
    if (section) {
      inFeatures = (section[1] ?? "") === "features";
      continue;
    }
    if (inFeatures && /^hooks\s*=\s*true\s*$/i.test(line)) return true;
  }
  return false;
}

function matcherEq(actual: string | undefined, expected: string | undefined): boolean {
  if (!expected) return true;
  return actual === expected;
}

/**
 * command が必須 entrypoint を本当に呼んでいるかを照合する。素朴な substring 一致は
 * `echo src/cli.ts ...` のような無関係文字列を誤って guard 充足と判定しうる (cross-runtime
 * review Important)。そこで script path 部 (空白を含まない part) は **token 完全一致**、複数語の
 * subcommand 部 (`session start` 等) は部分一致で照合する。
 */
function commandHas(command: string, parts: readonly string[]): boolean {
  const tokens = command.trim().split(/\s+/);
  return parts.every((part) =>
    part.includes(" ") ? command.includes(part) : tokens.includes(part),
  );
}

export function analyzeCodexHookAdapter(input: {
  codexHooksJson: string | null;
  codexConfigToml?: string | null;
}): CodexHookResult {
  if (input.codexHooksJson === null) {
    return {
      checked: 0,
      violations: [{ reason: "missing_hooks_json" }],
      ok: false,
      apiToolPathEnforced: false,
    };
  }
  let parsed: CodexHooksFile;
  try {
    parsed = JSON.parse(input.codexHooksJson) as CodexHooksFile;
  } catch {
    return {
      checked: 0,
      violations: [{ reason: "malformed_json" }],
      ok: false,
      apiToolPathEnforced: false,
    };
  }

  const violations: CodexHookViolation[] = [];
  const hooks = parsed.hooks ?? {};

  if ("codexConfigToml" in input) {
    const configToml = input.codexConfigToml;
    if (typeof configToml !== "string") {
      violations.push({ reason: "missing_config_toml" });
    } else if (!codexHooksFeatureEnabled(configToml)) {
      violations.push({ reason: "hooks_feature_disabled" });
    }
  }

  // 双方向健全性: Codex の各 entrypoint は Claude `REQUIRED` にも存在しなければならない
  // (片方の adapter にしか無い = 黙った分岐)。
  const claudeEntrypoints = new Set(CLAUDE_REQUIRED.map((r) => r.commandParts.join(" ")));
  for (const guard of CODEX_REQUIRED) {
    if (!claudeEntrypoints.has(guard.commandParts.join(" "))) {
      violations.push({ hook: guard.id, reason: "entrypoint_drift" });
    }
  }

  // 全 command を走査して repo-relative 原則違反 / legacy / global codex 参照を検出。
  for (const [event, entries] of Object.entries(hooks)) {
    for (const entry of entries ?? []) {
      for (const hook of entry.hooks ?? []) {
        const command = hook.command ?? "";
        if (command.includes("$CLAUDE_PROJECT_DIR")) {
          violations.push({ hook: event, reason: "claude_project_dir_in_codex" });
        }
        if (CODEX_GLOBAL_RE.test(command)) {
          violations.push({ hook: event, reason: "global_codex_path" });
        }
        if (FORBIDDEN_PATH_RE.test(command)) {
          violations.push({ hook: event, reason: "forbidden_path" });
        }
      }
    }
  }

  // 各 Codex 必須ガードが宣言され、guard は blockOnFailure を持つこと。
  for (const required of CODEX_REQUIRED) {
    const entries = (hooks[required.event] ?? []).filter((entry) =>
      matcherEq(entry.matcher, required.matcher),
    );
    const matchingCommands = entries
      .flatMap((entry) => entry.hooks ?? [])
      // type==="command" の hook のみが guard を充足しうる (非 command エントリで偽充足させない)。
      .filter(
        (hook) => hook.type === "command" && commandHas(hook.command ?? "", required.commandParts),
      );
    if (matchingCommands.length === 0) {
      violations.push({ hook: required.id, reason: "missing_hook" });
      continue;
    }
    if (required.blockOnFailure && !matchingCommands.some((hook) => hook.blockOnFailure === true)) {
      violations.push({ hook: required.id, reason: "missing_block_on_failure" });
    }
    // Codex 0.144 stdout 契約: Stop/SubagentStop は非 JSON stdout で Failed になるため、
    // 抑止 flag (--quiet 等) の欠落を fail-close する (PLAN-L7-417)。
    const requiredTokens = "requiredTokens" in required ? (required.requiredTokens ?? []) : [];
    if (
      requiredTokens.length > 0 &&
      !matchingCommands.some((hook) => {
        const tokens = (hook.command ?? "").trim().split(/\s+/);
        return requiredTokens.every((token) => tokens.includes(token));
      })
    ) {
      violations.push({ hook: required.id, reason: "missing_required_token" });
    }
    // Codex 0.144 sandbox 実測 (session start 最大 ~44s) に基づく timeout 下限 (PLAN-L7-417)。
    const minTimeoutSec = "minTimeoutSec" in required ? required.minTimeoutSec : undefined;
    if (
      typeof minTimeoutSec === "number" &&
      !matchingCommands.some(
        (hook) => typeof hook.timeout === "number" && hook.timeout >= minTimeoutSec,
      )
    ) {
      violations.push({ hook: required.id, reason: "insufficient_timeout" });
    }
  }

  return {
    checked: CODEX_REQUIRED.length,
    violations,
    ok: violations.length === 0,
    apiToolPathEnforced: false,
  };
}

export function loadCodexHookAdapterInput(repoRoot: string): {
  codexHooksJson: string | null;
  codexConfigToml: string | null;
} {
  const hooksTarget = join(repoRoot, ".codex", "hooks.json");
  const configTarget = join(repoRoot, ".codex", "config.toml");
  return {
    codexHooksJson: existsSync(hooksTarget) ? readFileSync(hooksTarget, "utf8") : null,
    codexConfigToml: existsSync(configTarget) ? readFileSync(configTarget, "utf8") : null,
  };
}

export function codexHookAdapterMessages(result: CodexHookResult): string[] {
  if (result.ok) {
    return [
      `codex-hook-adapter - OK (checked=${result.checked}, .codex/hooks.json shares Claude guard entrypoints; matcher=spawn_agent|Agent|apply_patch|Write|Edit|Bash (Codex 0.144 canonical), subagent-stop=wired)`,
      "codex-hook-adapter - OK (.codex/config.toml enables [features].hooks=true for direct Codex CLI/IDE sessions)",
      "codex-hook-adapter - note: .codex/hooks.json covers direct Codex CLI/IDE sessions only; hosted API/developer apply_patch tools do not execute through the Codex hook engine and are not repo-enforceable",
    ];
  }
  const sample = result.violations
    .slice(0, 8)
    .map((v) => `${v.hook ? `${v.hook}:` : ""}${v.reason}`)
    .join(", ");
  return [`codex-hook-adapter - violation ${result.violations.length} (${sample})`];
}
