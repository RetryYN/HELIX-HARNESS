---
title: "current-location summary typed workflow output単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-25
updated: 2026-08-31
owner: QA / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-672-current-location-summary-typed-output.md
pair_artifact: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
---

# current-location summary の typed workflow 出力・単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CLSO-001 | authority-backed summary | current registry tupleを`workflow_identity`へ投影し、receiptを`converted`として返す | `tests/cli-surface.test.ts` |
| U-CLSO-002 | missing authority | registry無しfixtureはidentityを推測せずnullと`unsupported` receiptを返す | `tests/cli-surface.test.ts` |
| U-CLSO-003 | legacy output exclusion | summary／frontierに旧drive/model fieldを再出力しない | `tests/cli-surface.test.ts` |
| U-CLSO-004 | frontier contract | frontier schema v2、typed identity、workflow route status、workflow commandを返す | `tests/cli-surface.test.ts` |
| U-CLSO-005 | text contract | `--summary-json`／`--json`／textの全出力面とsourceの両分岐で旧`drive` prefix labelを出さず、typed workflow route scopeを表示する | `tests/cli-surface.test.ts` |
| U-CLSO-006 | schema mutation | summary schema v2をv1へ退行させるmutationをproduction-root regressionが検出する | `tests/cli-surface.test.ts` |
| U-CLSO-007 | downstream summary contract | project-frontier／vmodel-fit command mapから`drive_model`を除去し、`workflow_route`をcurrent-locationへ束縛する。旧object／key／command literalの再混入を拒否 | `tests/summary-surface-audit.test.ts` |
| U-CLSO-008 | project/tree summary projection | project-frontierとtree-view outlineが`workflow_identity`／`workflow_route`を返し、top-level `drive_model`を再出力しない | `tests/cli-surface.test.ts` |

旧compatibility commandの内部出力をpositive oracleにしない。legacy greenでcurrent summaryの
canonical failureを相殺しない。

## 同一シナリオの検証準備共有（PLAN-RECOVERY-1574）

U-CLSO-001/003/004/005/006は同じrepository入力を検証するため、専用describeのbeforeAllで
text／JSON／summaryの実CLIを各一回起動する。各oracleとassertionは独立に残し、
当該describe内で出力文字列のみを共有する。後続のテスト実行へ結果を永続化しない。
各CLIはdefaultのin-memory DB再構築を実行し、古いDBの読込みへ置換しない。

入力やsourceを変更する反例は同じ共有結果で検証してはならない。U-CLSO-002の
authority欠落fixtureは共有対象外とする。schema／text変異は別のVitest実行でbundleと
出力を再生成して検証し、正常状態への復元後にも再実行する。
このdescribeをconcurrent化せず、準備後にrepositoryを書き換えるテストを追加しない。
同一シナリオを共有できない検査は別fixtureへ分ける。
