---
title: "worker lifecycle receipt関数設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L6-103-worker-lifecycle-receipt.md
pair_artifact: docs/test-design/helix/L6-worker-lifecycle-receipt-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-lifecycle-receipt.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker lifecycle receipt関数設計

## 1. public API

```ts
resolveWorkerIsolationRunReceipt(receipt, output): WorkerIsolationRunReceiptCapability | null
createWorkerLifecycleReceipt(request): WorkerLifecycleReceiptResult
isWorkerLifecycleReceipt(value): value is WorkerLifecycleReceiptCapability
serializeWorkerLifecycleReceipt(receipt): string | null
verifyWorkerLifecycleReceipt(serialized): boolean
```

## 2. 検証順序

1. run/parent/HEADの型と上限を検証する。
2. run receiptが同じsealed outputへbroker束縛されていることを再解決する。
3. review capabilityがWCC-FR-06でsealed済みであることを検証する。
4. output capability digestとreview proposal digestを照合する。
5. review verdictとterminal state/reasonを照合する。
6. seven-state hash-chainとcanonical terminal receiptを生成しsealする。
7. 別processではstrict key set、canonical bytes、全event digest chain、terminal receipt digestを再計算する。

## 3. failure

`WORKER_LIFECYCLE_INPUT_INVALID`、`WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED`、`WORKER_LIFECYCLE_REVIEW_UNSEALED`、`WORKER_LIFECYCLE_PROPOSAL_MISMATCH`、`WORKER_LIFECYCLE_TERMINAL_INVALID`をexact分岐とする。

## 4. authority oracle

`U-WLIFE-004`は、本設計にある外部worker非authority境界をreviewed-safe dispositionへdigest束縛し、未登録・stale・別pathならL1-L12 authority gateをRedにする。
