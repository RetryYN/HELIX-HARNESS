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
