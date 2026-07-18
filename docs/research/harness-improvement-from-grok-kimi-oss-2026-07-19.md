# HELIX 強化レポート: Grok/Kimi 公式 OSS から得られた改善材料と要件定義改善指示（2026-07-19）

status: research + 要件定義改善指示 / Codex 参照用
author runtime: claude
trace key: worker-runtime-research-2026-07-19

## 調査範囲

xai-org 全 9 リポジトリ、MoonshotAI 全 38 リポジトリを全件列挙し、README / 構成を確認した
（2026-07-19 実施）。worker runtime 採用評価（Cursor/Kimi/Grok）は PO へチャット報告済みで本書の対象外。
本書は **HELIX ハーネス自身の改善に転用できる仕組み**を抽出し、要件定義（L1/L3）への改善指示に落とす。

## 得られた改善材料（重要度順）

### 1. grok-build（xai-org、Apache-2.0、Rust）— 「harness」の商用先行実装

- 自らを "coding agent harness" と名乗るフルソース公開の harness。
  skills / plugins / hooks / sandboxing / headless / ACP の実装とユーザーガイドが全部読める。
- **8 並列 git-worktree subagent**: HELIX が方針決定済みの「隔離 worktree + proposal-only worker」の
  先行実装。worktree の払い出し・回収・衝突処理の実装パターンを採取できる。
- 権限モデル: `permission_mode` の config 固定と `disable_bypass_permissions_mode = true`
  （bypass を組織側で恒久禁止するスイッチ）。HELIX guard の「YOLO 常態化防止」に直訳できる設計。

### 2. plugin-marketplace（xai-org）— 配布パッケージ仕様

- plugin = skills + commands + agents + **hooks** + MCP + LSP の束、という束ね方と、
  `marketplace.json`（正本 index）/ 生成 index（手編集禁止）/ first-party・third-party 分離のカタログ構造。
- HELIX-HARNESS-OS（配布リポジトリ）へ consumer 向けに skill / hook / adapter を配る際の
  パッケージング仕様の直接の参考。third-party 免責の書き方も含めて流用価値が高い。

### 3. kimi-agent-sdk（MoonshotAI）— CLI を実行エンジン化する SDK 境界

- CLI を stdio/JSON-RPC の agent server とし、Node/Python/Go の薄い SDK から
  セッション制御・**承認要求へのプログラム応答**・カスタムツール登録を行う構造。
- HELIX の delegation 面（`helix codex` / 将来の `helix kimi` 等）を「プロセス起動 + テキスト回収」から
  「wire protocol + 構造化イベント + コード化された承認ポリシー」へ進化させるモデル。

### 4. ACP（Agent Client Protocol）— runtime 共通インターフェース

- kimi-code / grok-build / kimi-agent-rs がいずれも ACP（stdio JSON-RPC）対応。
  worker runtime を増やすたびに個別 adapter を書くのではなく、ACP を共通下層に置ける可能性。

### 5. 小粒だが転用可能な発想

- **K2-Vendor-Verifier**: API ベンダー出力の精度検証という発想。HELIX の provider evidence /
  worker 受入ゲートの品質検証設計の参考。
- **walle**: 構造化出力 JSON schema の検証レベル 4 段階（ultra/strict/lite/loose）。
  proposal-only worker の出力スキーマ検証（ADR-009 の Node 再検証）の粒度設計の参考。
- **kimi-code lifecycle hooks**: 第三 runtime にも hook 差し込み点があるため、
  HELIX guard を「Claude Code hook 専用」から「runtime ごとの hook surface に写像する」抽象へ広げられる。

## 要件定義改善指示（L1/L3 への反映指示）

以下を要件定義の改善として反映すること（inventory-first・粒度合わせの原則どおり、
L1 = エリア、L3 = FR 粒度で登録する。bulk import はしない）。

1. **[L1/BR] worker runtime 多重化エリアの追加**:
   「HELIX は Claude/Codex 以外の定額 worker runtime（Kimi/Grok 等）を、precedence を曲げずに
   proposal-only worker として接続できる」を機能エリアとして L1 要求に追加する。
   受入条件: 隔離 worktree 必須、YOLO/bypass フラグは versioned テンプレート管理、
   秘密情報を扱う作業の委譲禁止を含むこと。
2. **[L3/FR] delegation 面の wire protocol 化**:
   `helix <runtime>` 委譲の内部契約を「プロセス起動 + stdout 回収」から
   「構造化イベント（承認要求・tool call・結果）を受ける adapter 契約」へ改める FR を起こす。
   参考実装: kimi-agent-sdk (Node)、ACP。承認応答ポリシーは Node 制御面がコードで持つ
   （ADR-009 の Node 唯一 writer 原則と整合させる）。
3. **[L3/FR] bypass 恒久禁止スイッチ**:
   grok-build の `disable_bypass_permissions_mode` に相当する「guard bypass をリポジトリ設定で
   恒久禁止できる」FR を HELIX guard 系（work-guard / agent-guard / git-command-guard）へ追加する。
   現行の one-shot marker 方式と矛盾しない（marker 方式の上位に置く deny スイッチ）。
4. **[L3/FR] worker 出力スキーマ検証レベル**:
   proposal-only worker の出力再検証（Node 側 schema/digest 検証）に walle 型の検証レベル段階
   （strict 既定、緩和は明示）を導入する FR を検討する。
5. **[L1/NFR→配布] 配布パッケージ仕様の明文化**:
   HELIX-HARNESS-OS の配布形式を plugin-marketplace 型
   （正本 index + 生成 index + first/third-party 分離 + 免責）で定義する要求を配布エリアに追加する。
   実切替は従来どおり PLAN-M-02 の cutover 承認境界に従う。
6. **[調査 PLAN] grok-build worktree 並列 subagent の precedent 精読**:
   pmo-tech-fork / pmo-tech-docs による grok-build ソース精読タスクを起票し、
   worktree 払い出し・回収・衝突処理の behavior atom を採取して上記 1〜2 の設計入力とする。

## Codex への引き継ぎ

Codexにみるにゃ！

- 本レポートを読み、上記「要件定義改善指示」1〜6 を既存 L1/L3 正本・進行中の要件リベースライン
  （HYBRID-CORE-REQUIREMENTS）と突き合わせて、重複・矛盾がなければ FR/BR 起票または既存 PLAN の
  延長として取り込むこと。反映は inventory-first・粒度合わせ・bulk import 禁止の原則に従う。
- 対立・疑義があれば silent 変更せず IMP 記録の上で相談すること。
