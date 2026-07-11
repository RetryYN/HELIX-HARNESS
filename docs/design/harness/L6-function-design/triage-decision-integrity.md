---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-69-triage-decision-integrity.md
---

# システムレビューtriage判断整合性 機能設計

> **L6 contract marker**: `analyzeTriageDecisionIntegrity(input) => TriageResult`。
> pre: triage manifest、catalog、backlogを読める。post: 判断と実sourceの不一致をviolationへ変換する。
> invariant: code側の独立pin、legacy system保留、未列挙10件の終端禁止を維持する。

## 1. 目的

system reviewで確定したcatalog/backlogの判断を機械契約にし、件数だけの完了、legacy成果物による
done偽装、判断集合の縮退をfail-closeで止める。

## 2. 契約

`analyzeTriageDecisionIntegrity(input) => TriageResult`

| 契約         | 事前条件                            | 事後条件                                              | 不変条件                         |
| ------------ | ----------------------------------- | ----------------------------------------------------- | -------------------------------- |
| catalog 3件  | manifest、catalog、artifactを読める | unit/integration/acceptanceだけdoneかつartifact exact | 期待集合はcode側にも独立pin      |
| system保留   | system test判断を読める             | todoを維持しlegacy shimをartifactにしない             | legacy shimでdone化しない        |
| backlog 14件 | backlog表を読める                   | exact 14件がverified                                  | manifestとsourceの同時縮退を拒否 |
| residual     | IMP-118/148を読める                 | 118はtriaged、148は未完了で実在                       | 残差をまとめてcloseしない        |
| 未列挙10件   | claimを読める                       | ID空ならblocked_missing_enumerationのみ許可           | 件数だけのcompletedを拒否        |
| loader       | 入力欠落・parse不能                 | violationを返す                                       | 例外をgreenにしない              |

## 3. Vペア

右腕は`docs/test-design/harness/L8-unit-test-design.md`の`U-TRIAGE-001..012`。実装PLANは
`PLAN-L7-429`、検出器は`src/lint/triage-decision-integrity.ts`、doctorは同じanalyzerをhard gateにする。
