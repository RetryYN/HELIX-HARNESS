---
layer: L6
sub_doc: function-spec
status: draft
freeze_blocking: false
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-57-handover-db-derivation.md
---

> **L6 contract marker**: `deriveHandoverSnapshot(deps: HandoverDerivationDeps) => DerivedHandoverSnapshot` は unit-test 粒度の contract。pre: harness.db が open 可能（不可なら fail-close）。post: U-HDRV-001..004 の oracle が全て green のときだけ合格。invariant: snapshot の全 field は harness.db / git HEAD から deterministic に導出され、手書き値を持たない（takeover note を除く）。

# handover の DB 導出化 — 機能設計

## §1 範囲

`.helix/handover/CURRENT.json`（pointer）の active PLAN 等は人手更新で drift する
（PLAN-L6-57 §0）。本設計は **pointer の手書き field を DB/git 導出に置き換え、
CURRENT.json を「自動生成 snapshot + 任意 takeover note 1 欄」へ縮小する**契約を定義する。
feedback_events の正本地位（PLAN-L7-110）は変更しない。

## §2 関数契約

| 関数 | 契約 |
|---|---|
| `deriveHandoverSnapshot(deps)` | harness.db から active PLAN frontier（非終端 status の PLAN、更新時刻降順の先頭群）、outstanding blocker 集計（completionReadiness）、直近 feedback_events 件数を、git から検証基準点（HEAD sha / branch）を導出し `DerivedHandoverSnapshot` を返す。deps 注入（db open / git resolve）で純関数化し、手書き入力を受け取らない。 |
| `renderCurrentPointer(snapshot, note)` | snapshot + `takeoverNote: string \| null` から CURRENT.json 内容を生成。note 以外の field は毎回上書き。`generated_at` / `generator: "helix handover"` を刻む。 |
| `detectPointerDrift(existing, snapshot)` | 既存 CURRENT.json の derived field が最新 snapshot と乖離している場合に drift 一覧を返す（field 名 + expected/actual）。手書き編集の検出にも使う。 |

## §3 Runtime 挙動

- 生成タイミング: `helix handover` 実行時と Stop hook（`session summary`）で再生成する。
  再生成は derived field のみ上書きし、`takeover_note` は保持する。
- fail 挙動: harness.db が open できない場合は snapshot を生成せず error（fail-close。
  stale pointer を「最新」として再刻印しない）。git HEAD 解決失敗も同様。
- 移行: 既存 CURRENT.json の手書き field は初回再生成で derived 値に置換される。
  乖離があった場合は `detectPointerDrift` の結果を warning として surface する。
- SessionStart surface は従来どおり feedback_events（DB 正本）を第一とし、
  snapshot は補助 pointer にとどめる（正本の置き換えではない）。

## §4 Test oracle 設計

後続 L7 実装 PLAN で test 新設と同時に pair test-design（L7-unit-test-design.md）へ oracle 行を宣言する
（oracle-test-trace gate: 宣言 oracle は test citation 必須のため、宣言は実装スライスと同時に行う）。Covered by `tests/handover-db-derivation.test.ts`:

- U-HDRV-001: fixture db（非終端 PLAN 2 件 + blocker）から `deriveHandoverSnapshot` が
  active PLAN / blocker 集計 / HEAD sha を deterministic に返す（同一入力 → deep equal）。
- U-HDRV-002: `renderCurrentPointer` は derived field を毎回上書きし、`takeover_note` を保持する。
  note 以外への手書き変更は `detectPointerDrift` が field 単位で検出する。
- U-HDRV-003: db open 失敗 / HEAD 解決失敗は fail-close（pointer を書かない・error 返却）。
- U-HDRV-004: 再生成の冪等性 — 状態が変わらない限り連続実行で内容が不変（`generated_at` を除く）。
