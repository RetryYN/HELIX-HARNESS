---
plan_id: PLAN-L7-458-worker-bench-and-scorecard
title: "PLAN-L7-458: worker 受入ベンチ機構と実タスク評定スコアカード"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals: ["po_directive:2026-07-19 モデルベンチ議論の恒久機構化と実タスク組み込み起票指示"]
created: 2026-07-19
updated: 2026-07-19
owner: Claude
agent_slots:
  - { role: se, slot_label: "SE — bench runner / scorecard projection" }
  - { role: qa, slot_label: "QA — 採点器 fixture / 負例" }
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-382 の skill efficacy evaluation pattern を worker runtime 受入と実タスク評定へ拡張する実装候補。要件側の反映は research レポートの改善指示 1〜6 と同一レーンで Codex リベースラインに合流させる。"
parent_design: docs/design/helix/L6-function-design/worker-bench-scorecard.md
pair_artifact: docs/test-design/helix/L8-worker-bench-scorecard.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-bench-scorecard.md, oracle_id: U-WBENCH-001, test_path: tests/worker-scorecard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-bench-scorecard.md, oracle_id: U-WBENCH-002, test_path: tests/worker-scorecard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-bench-scorecard.md, oracle_id: U-WBENCH-003, test_path: tests/worker-scorecard.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-458-worker-bench-and-scorecard.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-bench-scorecard.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-bench-scorecard.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/worker-scorecard.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-scorecard.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L6-function-design/worker-bench-scorecard.md
  requires: []
  references:
    - PLAN-L7-382-skill-efficacy-evaluation
    - PLAN-L7-295-version-up-workers-pricing-ledger
    - docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md
---

# PLAN-L7-458: worker 受入ベンチ機構と実タスク評定スコアカード

## 目的

新 worker runtime / モデル改版の受入判定と、実タスク委譲での継続評定を同一の測定次元で行う
恒久機構を整備する。2026-07-19 の 8 モデル手動ベンチ（sonnet/Opus/Sol/Terra/Luna/spark/K3/K2.7、
T1〜T7 + effort 変種 + ビジュアル検査）を behavior atom とし、その runner / blind-judge /
機械採点 / 集計スクリプト群を出発点として回収する。

## 二層構造

1. **人工ベンチ（統制比較）**: worker runtime 受入・モデル改版時のみ実行。
   - スモークセット（judge 不要・約 15 分）: 実装正しさ（テスト）/ mutation kill /
     指示追従（grep 判定可能な制約 8〜12 個 + negative instruction / scope 遵守）/
     スキル感応（with/without A/B 差分、PLAN-L7-382 pattern の転用）/
     コード品質（lint・複雑度・重複・diff 面積）/ 簡潔性（品質点をサイズで正規化）/
     セキュリティ生成素点（Semgrep 系ルール違反数）/ 拡張性（後出し仕様変更の 2 回目 diff 実測）。
   - フル判定（blind judge 込み）: 上記 + 日本語 / 設計 / 検証 / レビュー / ビジュアル
     （vision rubric: 余白配分・重心・グリッド規律・視覚階層。taste の最終裁定は PO 一対比較）。
2. **実タスク評定（無統制・常時）**: 委譲 1 回ごとに evidence を harness.db へ記録し、
   projection でモデル別スコアカードへ集計する。
   - 第 1 段: 初回契約 pass / 再試行回数 / 提案 diff サイズ / lint 違反数（既存フロー副産物のみ）。
   - 第 2 段: Semgrep を受入ゲートへ常設し worker 別違反率を集計。
   - 第 3 段: モデル別スコアカード projection を `helix status` / doctor へ表示。
   - タスク難易度の歪み対策として `helix task classify` の分類で層別し、同種タスク内の相対で読む。

## 設計原則

- 拡張性は静的 rubric で採点しない（抽象過多と YAGNI 違反が区別できない）。変更シナリオの
  2 回目 diff サイズ + テスト green 維持で実測する。同一性能なら短い実装を上位とする。
- 実効コスト = API 換算単価 × 再試行係数で表し、ルーティング表（タスク種 → モデル）の
  更新根拠をスコアカード evidence に置く。
- effort 既定は PO 決定（2026-07-19: 上位モデル low/medium 既定・不足はモデル昇格、
  spark/Luna は high）に従い、ベンチはその妥当性の定期実測を担う。

## スコープ

- ベンチ測定設計書（次元表・採点器・rubric）を L6 設計として起こす。
- スモークセットの runner / 採点器（機械層のみ）を TS/Node で実装する。
- 実タスク評定 第 1 段（4 フィールドの evidence 記録 + projection）を実装する。

## 対象外

- 人工ベンチ フル判定の自動定期実行（受入・改版時の手動トリガに限る）。
- Kimi 等の新 runtime adapter 本体（別 PLAN。本 PLAN は受入判定の物差し側）。
- モデルの一般化ベンチ claim（HELIX worker 適性の測定に限る）。

## 予定 oracle（draft、設計書で確定）

`worker-bench-scorecard.md`（L6 設計、本 PLAN で生成）に次の oracle を定義し、
`tests/worker-scorecard.test.ts` の behavior test で被覆する。

- U-WBENCH-001: スモークセット機械採点が同一入力で決定的（digest 一致）である。
- U-WBENCH-002: 実タスク評定 第 1 段の 4 フィールドが委譲 evidence に記録され projection に現れる。
- U-WBENCH-003: 拡張性採点が「1 回目サイズ + 2 回目 diff + テスト green」の実測式である
  （静的 rubric 経路が存在しない）。

## 受入条件

- スモークセットが judge なしで完走し、機械採点結果が再現可能 evidence（command digest 付き）を持つ。
- 実タスク評定 第 1 段の 4 フィールドが委譲 evidence に記録され、projection で集計される。
- 拡張性採点が「1 回目サイズ + 2 回目 diff」の実測方式であることをテストで固定する。
- 2026-07-19 手動ベンチの scratchpad 資材（runner / judge / 採点器）から回収する behavior atom を
  設計書に列挙する。

## 検証予定

- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-458-worker-bench-and-scorecard.md`
- `bunx vitest run tests/worker-scorecard.test.ts`
- `bun run typecheck`
