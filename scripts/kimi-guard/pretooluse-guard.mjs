#!/usr/bin/env node
// Kimi Code PreToolUse guard (HELIX 安全境界, 2026-08-06)
// 方針: yolo禁止・auto前提。破壊的git / 機微ファイル / パイプ実行 / ガード自体の改変を deny。
// Kimi hooks は fail-open (異常時 allow) のため、判定結果を必ず guard.log へ残す。
import { appendFileSync } from "node:fs";
import { homedir } from "node:os";

const LOG = `${homedir()}/.kimi-code/hooks/guard.log`;

function log(line) {
  try { appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`); } catch {}
}

function deny(reason) {
  log(`DENY ${reason}`);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `HELIX guard: ${reason}`,
    },
  }));
  process.exit(0);
}

let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let input;
  try { input = JSON.parse(raw); } catch { log("WARN unparsable stdin (fail-open)"); process.exit(0); }

  const tool = String(input.tool_name ?? "");
  const ti = input.tool_input ?? {};
  const cmd = String(ti.command ?? "");
  const paths = [ti.path, ti.file_path, ti.filename, ti.target]
    .filter(Boolean).map(String);

  // --- 機微パス (読み書きどちらも deny) ---
  const SENSITIVE = [
    /\.ssh\//, /\.gnupg\//, /credentials/i, /\.env(\.|$)/,
    /\.kimi-code\/(credentials|hooks|config\.toml)/,
    /\.claude\/settings.*\.json/, /\.aws\//, /secrets?\./i,
    /harness\.db/, /\.helix\/state\//,
  ];
  for (const p of paths) {
    if (SENSITIVE.some((re) => re.test(p))) deny(`機微パスへのアクセス: ${p}`);
  }

  // --- シェル系ツール ---
  if (/^(Bash|Shell|RunCommand|Terminal)$/i.test(tool) || cmd) {
    const DANGEROUS = [
      [/git\s+(reset|revert)\b/, "破壊的 git (HELIX git-command-guard 準拠)"],
      [/git\s+checkout\s+(--|\.|-f)/, "破壊的 git checkout"],
      [/git\s+restore\b/, "git restore は HELIX で block 対象"],
      [/git\s+push\s+.*(--force|-f\b)/, "force push 禁止"],
      [/git\s+clean\b/, "git clean 禁止"],
      [/git\s+add\s+(-A|--all|\.)(\s|$)/, "一括 stage 禁止 (path 明示のみ)"],
      [/rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+(\/|~|\$HOME)/, "広域 rm -rf 禁止"],
      [/(curl|wget)[^|;&]*\|\s*(ba|z|da)?sh/, "ダウンロード直パイプ実行禁止"],
      [/chmod\s+(-R\s+)?0?777/, "chmod 777 禁止"],
      [/(cat|less|head|tail|cp|scp)\s+[^;|&]*(\.ssh\/|\.env\b|credentials|\.aws\/)/, "機微ファイル読出し禁止"],
      [/\.kimi-code\/(hooks|config\.toml)/, "guard 自体の改変禁止"],
      [/gh\s+(pr\s+merge|release|repo\s+delete)/, "merge/release は HELIX 正規レーンのみ"],
      [/git\s+push\b/, "push は HELIX (Claude/Codex) レーン専用。Kimi からの push 禁止"],
    ];
    for (const [re, reason] of DANGEROUS) {
      if (re.test(cmd)) deny(`${reason} → ${cmd.slice(0, 120)}`);
    }
  }

  log(`ALLOW tool=${tool} ${cmd ? `cmd=${cmd.slice(0, 100)}` : `paths=${paths.join(",")}`}`);
  process.exit(0);
});
