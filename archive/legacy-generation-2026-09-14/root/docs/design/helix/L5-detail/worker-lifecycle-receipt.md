---
title: "worker lifecycle receipt詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: Architect
plan: docs/plans/PLAN-L5-95-worker-lifecycle-receipt.md
pair_artifact: docs/test-design/helix/L8-worker-lifecycle-receipt-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker lifecycle receipt詳細設計

## 1. 実行receipt

brokerは成功実行から次のdigestを作る。

| field | 証拠source |
|---|---|
| `admission_digest` | current descriptorのadmission decision |
| `sandbox_digest` | backend、runtime、入力manifest、wrapper origin |
| `diff_digest` | sort済みchanged paths |
| `egress_digest` | 固定environment keys、status、stderr digest |
| `output_digest` | seal済みoutput payload digest |
| `observation_digest` | seal済みexecution observation |

run receiptはprocess-local capabilityとしてoutputへWeakMap束縛し、copyを拒否する。

## 2. lifecycle event列

各eventは`sequence/state/evidence_digest/previous_event_digest`をcanonical JSON化し、`event_digest`を計算する。exact seven-state chain以外を生成するpublic APIは持たない。

`requested`はrun/parent、`admitted`はcurrent HEAD・admission decision・sorted child exact set、`sandboxed`から`proposal_received`はrun receipt、`revalidated`は独立review receipt、terminalはreview receiptとreasonを根拠にする。

## 3. terminal規則

- `accepted`: review=`approve`、reason=`null`
- `rejected|quarantined`: review=`reject`、1〜256文字のreason必須
- HEADは40桁lowercase SHA、run IDはbounded identifierとする。

serializationはsealed lifecycle capabilityだけをcanonical JSONへ変換し、unsealed objectは`null`とする。

## 4. 設計実在性・failure到達性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "WORKER_LIFECYCLE_INPUT_INVALID",
    "WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED",
    "WORKER_LIFECYCLE_REVIEW_UNSEALED",
    "WORKER_LIFECYCLE_PROPOSAL_MISMATCH",
    "WORKER_LIFECYCLE_TERMINAL_INVALID"
  ],
  "assets": [
    { "asset_id": "worker-isolation-run-receipt", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-isolation-broker.ts", "resource_kind": "typescript_export", "resource_name": "resolveWorkerIsolationRunReceipt", "source_digest": "sha256:5a0f69619306f27c2c04fac3f05566346aec5c499631d62440d34c7e7b0e220d", "current_authority": true },
    { "asset_id": "worker-lifecycle-receipt", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-lifecycle-receipt.ts", "resource_kind": "typescript_export", "resource_name": "createWorkerLifecycleReceipt", "source_digest": "sha256:0bffec75b257d7f101ade5e7e54974e13a46e596b714ecf1ed4d747f8553e2a4", "current_authority": true }
  ],
  "failure_reachability": [
    { "reason_code": "WORKER_LIFECYCLE_INPUT_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-lifecycle-receipt.ts", "source_symbol": "createWorkerLifecycleReceipt", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WLIFE-003", "identity_fields": [], "post_resolution_checks": [], "fixture": {"child_run_ids":["child-b","child-a"]}, "expected_reason": "WORKER_LIFECYCLE_INPUT_INVALID", "mutation": {"remove_post_resolution_check":"runId <= (request.child_run_ids[index - 1] ?? \"\")","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-023","execution_helper":"executeWorkerLifecycleMutationOracle"} },
    { "reason_code": "WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-lifecycle-receipt.ts", "source_symbol": "createWorkerLifecycleReceipt", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WLIFE-002", "identity_fields": [], "post_resolution_checks": [], "fixture": {"run_receipt":"copy"}, "expected_reason": "WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED", "mutation": {"remove_post_resolution_check":"if (!runReceipt) return { ok: false, failure_code: \"WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED\" };","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-023","execution_helper":"executeWorkerLifecycleMutationOracle"} },
    { "reason_code": "WORKER_LIFECYCLE_REVIEW_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-lifecycle-receipt.ts", "source_symbol": "createWorkerLifecycleReceipt", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WLIFE-002", "identity_fields": [], "post_resolution_checks": [], "fixture": {"review":"copy"}, "expected_reason": "WORKER_LIFECYCLE_REVIEW_UNSEALED", "mutation": {"remove_post_resolution_check":"if (!isWorkerIndependentReview(request.review))","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-023","execution_helper":"executeWorkerLifecycleMutationOracle"} },
    { "reason_code": "WORKER_LIFECYCLE_PROPOSAL_MISMATCH", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-lifecycle-receipt.ts", "source_symbol": "createWorkerLifecycleReceipt", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WLIFE-002", "identity_fields": [], "post_resolution_checks": ["proposal_digest"], "fixture": {"review":"foreign_proposal"}, "expected_reason": "WORKER_LIFECYCLE_PROPOSAL_MISMATCH", "mutation": {"remove_post_resolution_check":"if (!proposalDigest || request.review.proposal_digest !== proposalDigest)","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-023","execution_helper":"executeWorkerLifecycleMutationOracle"} },
    { "reason_code": "WORKER_LIFECYCLE_TERMINAL_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-lifecycle-receipt.ts", "source_symbol": "createWorkerLifecycleReceipt", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WLIFE-003", "identity_fields": [], "post_resolution_checks": ["reviewer_verdict","terminal_state"], "fixture": {"reviewer_verdict":"reject","terminal_state":"accepted"}, "expected_reason": "WORKER_LIFECYCLE_TERMINAL_INVALID", "mutation": {"remove_post_resolution_check":"(request.review.verdict === \"reject\" && request.terminal_state === \"accepted\") ||","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-023","execution_helper":"executeWorkerLifecycleMutationOracle"} }
  ]
}
```
