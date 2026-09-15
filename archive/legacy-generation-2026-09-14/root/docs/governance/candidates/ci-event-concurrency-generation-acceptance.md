---
title: "CI event-class concurrency generation L10受入差分候補"
status: draft_candidate
canonical_layer: L10
paired_requirement_layer: L3
plan: PLAN-L3-93-ci-event-concurrency-generation
pair_artifact: docs/governance/candidates/ci-event-concurrency-generation-requirements.md
---

# CI event-class concurrency generation L10受入差分候補

| AC ID | 対応要件 | fixture／mutation | 合格条件 |
|---|---|---|---|
| `CIG-AC-001` | `CIG-R-01` | event class、PR ID、HEAD、run ID、attemptを一件ずつ欠落・改変する | generation identityが決定的に一致し、不正入力を個別拒否する |
| `CIG-AC-002` | `CIG-R-02` | same-HEAD main push中にschedule／manualを開始し、PR A/Bを同時更新する | main、schedule、manual、別PRが相互cancelせず、同一PR stale HEADだけがboundedに置換される |
| `CIG-AC-003` | `CIG-R-02` | scheduleを連続起動し、queue上限とTTLを超える | older scheduleだけを置換し、無制限並走・silent dropを拒否する |
| `CIG-AC-004` | `CIG-R-03` | older mainがまだcurrent、new generation未確保、handoff欠落、wrong SHA／attempt、raceを個別注入する | 全mutationでsupersedeをfail-closeし、条件成立時だけold mainを置換する |
| `CIG-AC-005` | `CIG-R-04` | cancelled runをpost-main、review、deferred successへ注入する | 全consumerが採用を拒否する |
| `CIG-AC-006` | `CIG-R-04` | same HEADのpush／schedule結果を相互流用し、generation digestをDB／doctor／aggregateの一面だけ改変する。既存receiptの`run:<id>:attempt:<n>:<conclusion>`を再検証する | obligation同値証明なしの流用を拒否し、全projectionがexact digestへ収束する。既存receipt identityは変更後も検証可能である |
| `CIG-AC-007` | `CIG-R-01..04` | bounded GitHub rehearsalまたは自然scheduleを実行する | run ID付きread-afterでcurrent main pushとscheduleが独立terminalになり、cancel／handoff receiptを再構築できる |

## 量閉じ

- supporting requirements: `CIG-R-01..04` exact 4件。
- acceptance: `CIG-AC-001..007` exact 7件。
- runtime実装、DB migration、live rehearsalはcanonical promotion後の別PLANで検証する。
