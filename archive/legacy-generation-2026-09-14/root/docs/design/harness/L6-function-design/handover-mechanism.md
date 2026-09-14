---
layer: L6
artifact_type: design_doc
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-06-handover-mechanism.md
---

> **L6 contract marker**: 旧session handover機構は廃止済みである。current contract は
> event-first continuation、`harness.db` projection、shared memoryである。

# session handover機構の廃止

## §1 disposition

本書が以前定義したsession prose、機械pointer、旧CLI、stale/drift discipline、scaffold writerは
current execution pathではない。履歴はGitに保持し、旧実装や旧oracleを再導入する根拠にしない。
廃止・保持境界の正本は`handover-retirement.md`である。

| kind | disposition |
|---|---|
| session prose / pointer /旧CLI・hook | `replace`。DB+memory continuationへ置換 |
| provider delegation evidence | `preserve`。`helix provider evidence export/status`でquery/export |
| operations transition artifact | `preserve`。運用設計artifactとして保持 |
| 過去session文書 | `archive`。runtime read source禁止 |

## §2 current continuation契約

1. `helix status`はactive PLAN、blocker、next authority、feedback、continuation memory pointerを構造化表示する。
2. SessionStartは`harness.db` continuation projectionとbounded shared-memory recallを読む。
3. Stopはsession digest、DB event、promotion nudgeだけを生成する。
4. `plan complete`はeventをdurable appendし、event ID/payload digestで冪等投影してからcheckpoint公開と
   current-plan clearを行う。
5. provider evidenceは監査用の別型でありcontinuation projectionへjoinしない。
6. doctorはDB/memory health、projection整合、resurrection、unclassified residualをfail-closeで検査する。

deliveryはat-least-onceである。stable consumer IDとimmutable entry IDからdelivery IDを作り、
同ID同digestはdedupe、同ID異digestはconflictとする。DB消失時はappend-only delivery eventからreceiptを再構築する。

### §2.1 DbC / Vペア

| 関数 | 署名 | 事前条件 | 事後条件 | 不変条件 | 判定基準 |
|---|---|---|---|---|---|
| continuation event | `writeContinuationEvent(input, deps) => ContinuationWriteResult` | validated event ID、sequence、payload digestを持つ | append後にだけprojection/checkpointへ進める | session prose、pointer、旧CLIを生成しない | `U-HRET-004/007` |
| continuation query | `queryContinuationIntegration(input) => ContinuationIntegrationView` | DB projectionとmemory surfaceが読取可能 | status/SessionStart用の継続状態を返す | DB優先、provider/operations artifactはcontinuation sourceにしない | `U-HRET-006/008/013` |
| delivery receipt | `writeDeliveryEvent(input, deps) => DeliveryWriteResult` | stable consumer ID、immutable entry ID、payload digestが妥当 | at-least-once receiptを冪等記録しDB消失時も再構築可能 | 同delivery ID同digestはdedupe、異digestはconflict | `U-HRET-005` |

## §3 pair

current V-pairは`handover-retirement.md` §8と次を正本とする。

- `docs/test-design/harness/L8-unit-test-design.md` U-HRET-001..014
- `docs/test-design/harness/L9-integration-test-design.md` IT-CONT-01..04
- archive / preserve / fresh / brownfield / distributionのsystem acceptance

旧U-HOVER/U-HDRVはhistorical oracleであり、current runtimeのgreen条件ではない。
