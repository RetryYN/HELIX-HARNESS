---
layer: L6
sub_doc: function-spec
status: confirmed
freeze_blocking: true
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-57-handover-db-derivation.md
---

> **L6 contract marker**: 本設計の旧 snapshot / pointer 導出契約は廃止済みである。
> current contract は event-first continuation と `harness.db` projection であり、
> `CURRENT.json`、session prose、旧CLIを生成・参照してはならない。

# DB 導出契約の廃止と continuation projection

## §1 正本

本書が以前定義した session snapshot の自動生成は、
`handover-retirement.md` により supersede された。履歴は Git で保存し、旧仕様を compatibility contract、
runtime fallback、writer 復活の根拠として使用しない。

現在の再開状態は次の責務分離を持つ。

| 責務 | current source |
|---|---|
| active PLAN・blocker・next authority・feedback の継続状態 | `harness.db` continuation projection + `helix status` |
| session判断・制約・次action | shared memory `takeover` layer（provenance / TTL / link必須） |
| 実行事実・PLAN digest | append-only session event / digest + DB projection |
| provider delegation | `helix provider evidence export/status`。監査専用でcontinuation sourceへjoinしない |

DBとmemoryが矛盾する場合はDBを優先し、diagnosticを出す。memoryでDB stateを上書きしない。

## §2 event-first 不変条件

PLAN完了やsession停止では、event evidenceを先にdurable appendし、event IDとpayload digestにより
SQLiteへ冪等投影する。projection成功前にcheckpointを公開せず、current-planもclearしない。
append失敗は非公開、append後/projection前はreplay、projection後/memory前はDBを正として
breadcrumbを再生成する。同一sequenceの異payloadはfail-closeする。

### §2.1 DbC / Vペア

| 関数 | 署名 | 事前条件 | 事後条件 | 不変条件 | 判定基準 |
|---|---|---|---|---|---|
| completion event append | `writePlanCompletionContinuation(input, deps) => ContinuationWriteResult` | PLAN、event ID、payload digestが妥当 | durable eventを先行appendし、同intent replayは重複しない | append失敗時はcheckpointとcurrent-planを変更しない | `U-HRET-004/007` |
| continuation projection | `projectContinuationEvent(db, event) => ProjectionResult` | journal eventのschemaとsequenceが有効 | event ID/payload digestでDBへ冪等投影 | 同sequence異payloadはfail-closeし旧surfaceを書かない | `U-HRET-006/007` |
| continuation read | `queryContinuationIntegration(input) => ContinuationIntegrationView` | DB projectionとbounded memory recallを独立に読める | active PLAN、blocker、next authority、feedbackを構造化して返す | DBとmemoryの矛盾はDB優先、provider evidenceはjoinしない | `U-HRET-006/013` |

## §3 禁止surface

- session snapshot / prose pointer のread・write・生成
- 旧session CLI、alias、silent fallback
- Stop / plan complete / setup / template / CIによる旧path再生成
- provider evidence / operations transitionをcontinuation stateとして読むこと

復活はresurrection detectorがhard failする。pair oracleは
`handover-retirement.md` §8、`L8-unit-test-design.md` のU-HRET-003/005/006/007/012/014、
`L9-integration-test-design.md` のIT-CONT群を正本とする。
