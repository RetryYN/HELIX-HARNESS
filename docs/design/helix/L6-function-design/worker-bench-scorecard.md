# worker 受入ベンチ機構と実タスク評定スコアカード（L6 機能設計）

status: draft（PLAN-L7-458 で実装確定）
parent: docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md / PLAN-L7-382 pattern

## 目的

新 worker runtime / モデル改版の受入判定（統制された人工ベンチ）と、実タスク委譲での
継続評定（無統制・常時のスコアカード）を、同一の測定次元で行う。2026-07-19 の 8 モデル
手動ベンチ（runner / blind judge / 機械採点 / vision 検査）を behavior atom 出所とする。

## 測定次元（機械層 = スモークセット、judge 層 = フル判定のみ）

| 次元 | 採点方式 | 層 |
|---|---|---|
| 実装正しさ | 共通テスト pass 率 | 機械 |
| テスト品質 | mutation kill 率（Stryker 型） | 機械 |
| 指示追従 | grep 判定可能な制約 8〜12 個の遵守率 + negative instruction / scope 遵守（FS 差分検査） | 機械 |
| スキル感応 | with/without skill A/B 差分（訓練常識と衝突する規約の反映数、PLAN-L7-382 pattern） | 機械 |
| コード品質 | lint 違反数・複雑度・重複・diff 面積 | 機械 |
| 簡潔性 | 品質点 / 実装サイズの正規化（同一性能なら短い実装を上位とする） | 機械 |
| セキュリティ生成素点 | Semgrep 系ルール違反数 + 危険誘導タスクでの自発的防御の有無 | 機械 |
| 拡張性 | 後出し仕様変更の 2 回目 diff サイズ + テスト green 維持（静的 rubric 禁止） | 機械 |
| 日本語 / 設計 / 検証 / レビュー | blind 2-judge rubric 平均（別 family 分離） | judge |
| ビジュアル | vision rubric（余白配分・重心・グリッド規律・視覚階層）。taste の最終裁定は PO 一対比較 | judge + 人間 |

## 実タスク評定（スコアカード）

委譲 1 回ごとに evidence を harness.db へ記録し projection で集計する。

- 第 1 段フィールド: `first_pass`（初回契約 pass）/ `retry_count` / `proposal_diff_size` /
  `lint_violation_count`。すべて既存委譲フローの副産物であり追加実行コストを持たない。
- 層別: `helix task classify` の分類で層別し、同種タスク内の相対で読む（難易度歪み対策）。
- 実効コスト = API 換算単価 × 再試行係数。ルーティング表更新の根拠は本 evidence に置く。

## Oracle（U-WBENCH）

- U-WBENCH-001: スモークセット機械採点は同一入力に対し決定的（出力 digest 一致）である。
- U-WBENCH-002: 実タスク評定 第 1 段の 4 フィールドが委譲 evidence に記録され、
  projection（モデル別スコアカード）に現れる。
- U-WBENCH-003: 拡張性採点は「1 回目サイズ + 2 回目 diff + テスト green」の実測式のみを持ち、
  静的 rubric 経路が存在しない。

被覆: `tests/worker-scorecard.test.ts`（`src/runtime/worker-scorecard.ts` の最小スライス
= digest / projection / 拡張性実測式に対して green。後続実装で evidence 記録・CLI 表示へ拡張する）。

## behavior atom 出所（2026-07-19 手動ベンチ scratchpad）

- runner（モデル×タスク×effort の実行と meta 記録）、blind judge（匿名化 + 出典伏せ + 2 judge 平均）、
  mutation 採点（mutant fixture + vitest exit code）、vision 検査（headless Chromium の
  light/dark × 幅 2 種スクリーンショット）、headless CLI 入れ子の環境浄化
  （env unset / stdin 渡し / `< /dev/null`）。
