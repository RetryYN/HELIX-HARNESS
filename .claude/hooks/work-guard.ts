#!/usr/bin/env bun
/**
 * Claude Code PreToolUse(Edit|Write|MultiEdit) hook entry — HELIX 作業衝突ガードレール (PLAN-L7-114)。
 *
 * hybrid 多ランタイムで、このセッションが触っていない uncommitted ファイル (= 他ランタイムの
 * in-flight 成果と推定) への盲目的 Edit/Write を block し、相手の未コミット成果のクロバーを防ぐ。
 * 実行本体は src/runtime/work-guard-hook.ts (consumer 配布経路の `helix hook work-guard` と共有、
 * PLAN-L7-433 C1)。判定純関数は src/runtime/work-guard.ts。
 *
 * settings.json:
 *   "matcher": "Edit|Write|MultiEdit",
 *   "command": "bun \"$CLAUDE_PROJECT_DIR/.claude/hooks/work-guard.ts\""
 *
 * stdin: { tool_name, tool_input: { file_path }, session_id }。
 * exit:  0 = pass / 2 = block。
 * override: HELIX_ALLOW_FOREIGN_EDIT=1 (env、人間が out-of-band で設定) か、`.helix/state/
 *   foreign-edit-override` に非空の理由を書く marker。marker は **one-shot**: foreign 編集を伴う
 *   1 tool-call で消費 (削除) する。古い marker が残って「今回だけの例外」が「以後ずっと例外」に
 *   ならないようにする (env override は人間管理ゆえ消費しない)。
 * 内部エラー (git 失敗 / parse 失敗 / state 不明) は **fail-open** (exit 0): ガードの不調で
 * 全 Edit を止めない。block は「衝突を確実に検知できた時」のみ。
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runWorkGuardHook } from "../../src/runtime/work-guard-hook";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.CLAUDE_PROJECT_DIR ?? join(here, "..", "..");

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

let raw = "";
try {
  raw = await readStdin();
} catch {
  process.exit(0);
}
const outcome = runWorkGuardHook({ repoRoot, rawInput: raw, env: process.env });
if (outcome.message) process.stderr.write(`${outcome.message}\n`);
process.exit(outcome.exitCode);
