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
