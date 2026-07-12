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
 * 入力解析、git、state、transactionの内部エラーは **fail-close** (exit 2) とし、guard不調を
 * foreign editの許可へ縮退させない。
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
  process.stderr.write("[helix-work-guard] BLOCK: hook input read failed\n");
  process.exit(2);
}
const outcome = runWorkGuardHook({ repoRoot, rawInput: raw, env: process.env });
if (outcome.message) process.stderr.write(`${outcome.message}\n`);
process.exit(outcome.exitCode);
