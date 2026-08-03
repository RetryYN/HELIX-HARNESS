---
title: "worker independent review関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L6-99-worker-independent-review.md
pair_artifact: docs/test-design/helix/L6-worker-independent-review-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-independent-review.md
github_issue_id: 227
behavior_contract_id: WCC-FR-06
responsibility_owner: worker-independent-review
---

# worker independent review関数設計

## 1. public API

```ts
workerProposalCapabilityDigest(output): Sha256Digest | null
resolveWorkerIsolationExecutionOrigin(output, current): WorkerIsolationExecutionOrigin | null
evaluateWorkerIndependentReview({ input, proposalOutput, reviewerOutput, workerOrigin, reviewerOrigin }): WorkerReviewEvaluationResult
admitWorkerIndependentReview({ input, proposalOutput, reviewerOutput, workerCurrent, reviewerCurrent }): WorkerReviewAdmissionResult
isWorkerIndependentReview(value): value is WorkerIndependentReviewCapability
```

## 2. 評価順序

1. `isWorkerValidatedOutput`でFR-05 sealを確認する。
2. descriptor／schema／payload digestからproposal capability digestを再計算する。
3. reviewer outputがprocess-local sealed capabilityであることを検証する。
4. receipt root 4-field exact set、型、digestを検証する。
5. proposal digestを照合し、finding digestをreviewer outputのpayload digestへ照合する。
6. 両outputのbroker execution originをcurrent admissionで再解決する。
7. originからactorを導出しidentity、session、contextを別分岐で検証する。
8. finding digestを含むcanonical receipt digestを作り、`WeakSet`へsealed capabilityを登録する。

## 3. 非対象

DB write、Git write、merge verdict、durable lifecycle、provider別分岐、review-tier変更を行わない。
