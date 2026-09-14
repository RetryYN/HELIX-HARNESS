# Kimi Code 拡張 セキュリティ監査と安全境界整備（2026-08-06）

## 目的

VS Code 拡張 `moonshot-ai.kimi-code` 0.6.7（Kimi CLI 0.28.1 同梱）を導入したため、
拡張本体の監査を実施し、HELIX の安全境界（yolo 禁止・承認フロー維持・正規レーン保護）を
機械的に強制する構成を整備した記録である。

## 監査結果（要旨）

- 悪性挙動・不審な外部送信先は検出せず。通信先は kimi.com / moonshot.ai 系のみ。
- OAuth トークンは `~/.kimi-code/credentials/`（dir 700 / file 600）にファイル保存。
  `config.toml` に平文キーなし。デバイス ID はローカル生成（600）。
- テレメトリは操作イベント名ベース（`yolo_toggle` 等）。コード本文送信型の
  トラッキングや第三者解析サービスのエンドポイントは検出せず。
- 機微ファイル（SSH 鍵・credential）へのアクセスをブロックするガードを
  エージェント側に実装済みであることを確認。
- 留意点: (1) CLI 本体（`~/.kimi-code/bin/kimi`）は CDN から段階ロールアウトで
  自動更新され、本体バイナリの署名検証有無は外部から確認できない（サプライチェーン上の
  最大リスク箇所）。(2) エージェントとして任意コマンド実行能力を持つ。
  (3) プロンプト内容は Moonshot AI へ送信される。

## 整備した安全構成（3 層）

1. **PreToolUse guard**（正本: `scripts/kimi-guard/pretooluse-guard.mjs`、
   配備先: `~/.kimi-code/hooks/`、`~/.kimi-code/config.toml` の `[[hooks]]` で登録）
   - deny 対象: 破壊的 git（reset / revert / checkout -f / restore / clean / force push）、
     `git push`・`gh pr merge`・release（HELIX 正規レーン専用）、一括 stage
     （`git add -A` / `.`）、機微パス（`.ssh` / `.env` / credentials / `harness.db` /
     `.helix/state/` / `.claude/settings*.json`）、ダウンロード直パイプ実行、
     広域 `rm -rf`、guard 自体と `config.toml` の改変。
   - Kimi hooks は fail-open 仕様のため、全 ALLOW / DENY を
     `~/.kimi-code/hooks/guard.log` に監査記録する。
2. **完全性チェックと自己修復**（正本: `scripts/kimi-guard/verify-guard.sh`、
   systemd user timer `kimi-guard-verify.timer` で起動 2 分後＋15 分間隔）
   - Kimi CLI 更新の検知、guard 実体の canonical 比較復元、`config.toml` hooks 節の
     再追記、`kimi.yoloMode=true` の検出 ALERT。
   - Claude Code / Codex の user 設定（`~/.claude/settings*.json`、
     `~/.codex/config.toml`、`~/.codex/AGENTS.md`）は sha256 baseline 比較の
     **drift アラートのみ**（正当な変更と競合するため自動復元しない。
     意図した変更後は `verify-guard.sh --rebaseline <file>`）。
3. **VS Code 設定固定**（`~/.vscode-server/data/Machine/settings.json`）:
   `kimi.yoloMode: false` / `kimi.editorContext: "never"`。

## AGENTS.md ランタイム境界（本 PR での是正）

Kimi Code は AGENTS.md オープン規格に準拠し、本リポジトリの `AGENTS.md`
（Codex CLI 専用 project rules）を project 指示として読み込むことをバイナリ解析で確認した。
このままでは Kimi が Codex の technical lead 役割・委譲レーン・push / merge 権限を
自己のものとして取り込むため、`AGENTS.md` 冒頭に非 Codex エージェント向けの
ランタイム境界節を追加した。

context compact（自動・手動）で会話中のルールは失われるため、この境界は会話・
メモリではなく AGENTS.md 本体に置く（compact 耐性のある唯一の置き場）。

## 既知の限界

- Kimi hooks は fail-open 仕様であり、guard は事故防止レイヤーである。
  最終防衛は承認ダイアログ（yoloMode off の維持）にある。
- 完全性チェックは 15 分間隔のポーリングであり、リアルタイムではない。
- 配備先（`~/.kimi-code/` 等）は user ローカルであり、本リポジトリの正本
  （`scripts/kimi-guard/`）とは手動同期である。

## 付録: guard 実体ソース（正本記録）

配備先は user ローカル（`~/.kimi-code/hooks/`、systemd user timer）であり、repo runtime ではない。
`scripts/` は HELIX の thin OS entrypoint 専用のため、guard 実体はここに掲載して tracked 記録とする。

### PreToolUse guard（配備先 `~/.kimi-code/hooks/pretooluse-guard.mjs`）

```js
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
    /\.kimi-code\/(credentials|hooks|config\.toml|AGENTS\.md)/,
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
      [/\.kimi-code\/(hooks|config\.toml|AGENTS\.md)/, "guard・自己指示ファイルの改変禁止"],
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
```

### 完全性チェック（配備先 `~/.kimi-code/hooks/verify-guard.sh`、systemd user timer で 15 分間隔）

```bash
#!/bin/bash
# HELIX guard 完全性チェック (2026-08-06)
# Kimi CLI 更新等で config.toml の hooks 節や guard.mjs が失われたら自己修復し、ログへ記録する。
set -u
KC="$HOME/.kimi-code"
LOG="$KC/hooks/guard-verify.log"
CANON="$KC/hooks/canonical"
note() { echo "$(date -Is) $1" >> "$LOG"; }

# 1) Kimi CLI バージョン変化の検知 (updates/install.json)
ver=$(grep -o '"version": *"[^"]*"' "$KC/updates/install.json" 2>/dev/null | head -1 | cut -d'"' -f4)
prev=$(cat "$KC/hooks/.last-kimi-version" 2>/dev/null || echo "")
if [ "$ver" != "$prev" ]; then
  note "INFO kimi CLI version change detected: '${prev:-none}' -> '${ver:-unknown}'"
  echo "$ver" > "$KC/hooks/.last-kimi-version"
fi

# 2) guard.mjs 実体チェック (欠損/改変なら canonical から復元)
if ! cmp -s "$CANON/pretooluse-guard.mjs" "$KC/hooks/pretooluse-guard.mjs" 2>/dev/null; then
  cp "$CANON/pretooluse-guard.mjs" "$KC/hooks/pretooluse-guard.mjs"
  note "REPAIR pretooluse-guard.mjs restored from canonical"
fi

# 3) config.toml の hooks 節チェック (無ければ再追記)
if ! grep -q 'pretooluse-guard.mjs' "$KC/config.toml" 2>/dev/null; then
  cat >> "$KC/config.toml" <<'EOF'

# --- HELIX safety hooks (auto-restored by verify-guard.sh) ---
[[hooks]]
event = "PreToolUse"
command = "node ~/.kimi-code/hooks/pretooluse-guard.mjs"
timeout = 10
EOF
  note "REPAIR [[hooks]] section re-appended to config.toml"
fi

# 4) VS Code 設定チェック (yoloMode が true にされていないか)
MS="$HOME/.vscode-server/data/Machine/settings.json"
if grep -q '"kimi.yoloMode": *true' "$MS" 2>/dev/null; then
  note "ALERT kimi.yoloMode=true detected in $MS (手動確認要)"
fi

# 5) Claude Code / Codex user 設定の drift 検知 (alert-only、自動復元はしない)
#    正当な変更後は: ~/.kimi-code/hooks/verify-guard.sh --rebaseline <file>
BASE="$KC/hooks/baselines"
mkdir -p "$BASE"
WATCH=(
  "$HOME/.claude/settings.json"
  "$HOME/.claude/settings.local.json"
  "$HOME/.codex/config.toml"
  "$HOME/.codex/AGENTS.md"
)
if [ "${1:-}" = "--rebaseline" ]; then
  tgt="${2:?usage: verify-guard.sh --rebaseline <file>}"
  sha256sum "$tgt" | cut -d' ' -f1 > "$BASE/$(echo "$tgt" | tr '/' '_').sha"
  note "BASELINE updated for $tgt"
  exit 0
fi
for f in "${WATCH[@]}"; do
  [ -f "$f" ] || continue
  key="$BASE/$(echo "$f" | tr '/' '_').sha"
  cur=$(sha256sum "$f" | cut -d' ' -f1)
  if [ ! -f "$key" ]; then
    echo "$cur" > "$key"
    note "BASELINE initialized for $f"
  elif [ "$cur" != "$(cat "$key")" ]; then
    note "ALERT drift detected in $f (意図した変更なら --rebaseline $f で更新)"
    echo "$cur" > "$key.drifted"
  fi
done
```
