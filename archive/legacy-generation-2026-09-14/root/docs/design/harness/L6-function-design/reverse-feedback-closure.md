---
layer: L6
sub_doc: function-spec
status: confirmed
freeze_blocking: false
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-59-reverse-feedback-closure.md
---

> **L6 contract marker**: `deriveArtifactProgressDecision(input) => ArtifactProgressDecision`（doc oracle 拡張）と `collectReverseCandidates(db: HarnessDb) => ReverseCandidate[]` は unit-test 粒度の contract。pre: db は harness.db schema（artifact_progress / findings）。post: U-APDOC-001..004 / U-RVC-001..003 の oracle が全て green のときだけ合格。invariant: red（open dependency impact）判定は全 artifact type で最優先を維持し、doc 規則が fail-close を弱めない。導出は query-only で DB を書き換えない。

# リバース駆動フィードバック閉塞の解消 — 機能設計

## §1 範囲（2026-07-07 実測に基づく問題）

PO 指摘「リバース駆動モデルが実行されず DB で赤（黄）になるパターンが多い」の根因 3 点を解消する。

1. **doc 系 artifact の誤 oracle**: plan/design/test-design/requirement（実測 722/802 件）が
   「linked test evidence なし」で永続 yellow。doc の検証手段は test run ではなく
   review/pair gate であり、oracle の適用誤り。
2. **reverse 発火経路の欠落**: 赤の next_action が「trigger dependency/reverse recovery」という
   prose のみで、Reverse workflow（`reverse <type> R0`）へ到達する deterministic 経路が無い。
3. **info 級 telemetry の堆積**: catalog findings（missing-test-oracle-id、実測 1253 件）が
   feedback_events に open のまま流入し、実 actionable 信号を埋没させる。

## §2 設計規則

| 対象 | 規則 |
|---|---|
| doc oracle 分離 | `DOC_ARTIFACT_TYPES = {plan, design, test-design, requirement}` は docStatus（plan は plan_registry、他 doc は frontmatter `status:`）で判定: confirmed/completed/archived → green `verified`（reason に review/pair gates 明記）、それ以外 → yellow。**red（openDependencyImpacts>0）は従来どおり最優先**（doc でも fail-close を弱めない）。source/test は従来の test-run oracle を維持。 |
| reverse 候補導出 | `collectReverseCandidates(db)`: recovery PLAN 未紐付けの red artifact_progress + open warn findings を候補化。reverse type 割当の正本 = `REVERSE_TYPE_BY_ARTIFACT`（design→design / test-design→test-design / plan→plan / requirement→requirement / source→impl / test→test、finding は kind 別 map、未知は impl）。各候補は `reverse <type> R0` 起票への deterministic 誘導文を持つ。query-only。 |
| feedback 配線 | 赤 artifact の feedback next_action を `start reverse R0 for <path> (helix feedback reverse-candidates --json)` に変更し、CLI `helix feedback reverse-candidates [--json]` で候補一覧を出す。 |
| telemetry 最適化 | severity=info の open findings は findings table に残し feedback_events へ流さない（warn/error は従来どおり流す）。 |

## §3 Runtime 挙動

- `helix db rebuild` 後の projection で自動反映。手動移行は不要（既存 row は再導出で置換）。
- fail 挙動: frontmatter status 読み取り失敗（file 欠落・parse 不能）は null → doc は yellow に落ちる
  （読めない doc を green にしない、fail-close）。既知制約: status 抽出は先頭 2000 字の
  `^status:` 簡易一致であり、frontmatter を持たない doc は常に yellow 側に倒れる（安全側、
  review Minor 所見 2026-07-07）。
- 実測効果（2026-07-07、本 repo）: yellow 785→186、green 225→713、feedback open 2714→931。
  残 yellow は draft doc と test 未整備 source のみ＝全件 actionable。

## §4 Test oracle 設計

Covered by `tests/reverse-feedback-closure.test.ts`（U-APDOC-001..004 / U-RVC-001..003、
pair test-design L7-unit-test-design.md に 1:1 宣言）。
