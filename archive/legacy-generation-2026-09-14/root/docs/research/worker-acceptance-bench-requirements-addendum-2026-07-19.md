# worker 受入ベンチ要求 追補（2026-07-19、PO 指示）

- 追跡キー: worker-acceptance-bench-2026-07-19
- 位置づけ: `harness-improvement-from-grok-kimi-oss-2026-07-19.md` の「要件定義改善指示」への追補
  （同文書は harness memory retirement authority が hash 固定しているため、追記は本別紙で行う）。
  同指示 1〜6 と併せて既存 L1/L3 正本・進行中の要件リベースラインへ反映すること。

## 追補指示: worker 受入ベンチと実タスク評定スコアカード [L1/BR + L3/FR]

worker runtime / モデル改版の受入判定と実タスク委譲の継続評定を、同一測定次元で行う要求を追加する。

- 二層構造: 人工ベンチ（受入・改版時のみの統制比較。judge 不要のスモークセット +
  blind judge 込みフル判定）と、実タスク評定（委譲 1 回ごとの evidence を harness.db へ記録し
  projection でモデル別スコアカード集計。`helix task classify` の分類で層別）。
- 測定次元（機械層）: 実装正しさ / mutation kill / 指示追従（grep 判定可能制約 +
  negative instruction / scope 遵守）/ スキル感応（with/without A/B 差分）/ コード品質
  （lint・複雑度・重複・diff 面積）/ 簡潔性（同一性能なら短い実装を上位）/
  セキュリティ生成素点（Semgrep 系）/ 拡張性（後出し仕様変更の 2 回目 diff 実測。
  静的 rubric 採点は禁止 — 抽象過多と YAGNI 違反が区別できないため）。
- judge 層: 日本語 / 設計 / 検証 / レビュー / ビジュアル（vision rubric: 余白配分・重心・
  グリッド規律・視覚階層。taste の最終裁定は PO 一対比較）。
- 実タスク評定 第 1 段フィールド: first_pass / retry_count / proposal_diff_size /
  lint_violation_count（既存委譲フローの副産物のみ）。実効コスト = API 換算単価 × 再試行係数。
- behavior atom 出所: 2026-07-19 の 8 モデル手動ベンチ scratchpad（runner / blind judge /
  mutation 採点 / vision 検査 / headless CLI 入れ子の環境浄化手順）。
- 注: 本項は一度 PLAN-L7-458 として誤って L7 起票され撤回済み（要件リベースライン進行中のため、
  L1/L3 要件反映が先。実装 PLAN 化は要件確定後）。
