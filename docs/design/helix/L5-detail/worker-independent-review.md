---
title: "worker independent review詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L5-91-worker-independent-review.md
pair_artifact: docs/test-design/helix/L8-worker-independent-review-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-independent-review.md
github_issue_id: 227
behavior_contract_id: WCC-FR-06
responsibility_owner: worker-independent-review
---

# worker independent review詳細設計

## 1. receiptとorigin

入力receiptは`schema_version`、`proposal_digest`、`finding_digest`、`verdict`のexact setとし、actor自己申告fieldを禁止する。worker／reviewer actorは隔離brokerが成功実行後にoutput capabilityへ束縛したprocess-local originからだけ導出する。

originはdescriptor identity/provider、broker runtime、sealed invocation model、broker-minted session、stdin context digest、registry／decision／wrapper digestを持つ。review時にcurrent admissionと再照合し、copy、未実行、model欠落、registry driftを拒否する。永続化とreplayは本契約の完了claimへ含めず、Issue #227内の後続原子sliceでcurrent L3契約へexact traceした後に扱う。未定義の将来IDをcurrent authorityとして参照しない。

## 2. 分離順序

proposal seal、strict receipt、proposal digest、両execution originの順で検証し、その後identity、session、contextを別分岐で比較する。provider／model一致だけでは拒否しない。

## 3. failure完全集合

| reason code | oracle |
|---|---|
| `WORKER_REVIEW_PROPOSAL_UNSEALED` | U-WRR-002 |
| `WORKER_REVIEW_EXECUTION_ORIGIN_UNSEALED` | U-WRR-008 |
| `WORKER_REVIEW_RECEIPT_SCHEMA_INVALID` | U-WRR-003 |
| `WORKER_REVIEW_PROPOSAL_DIGEST_MISMATCH` | U-WRR-002 |
| `HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED` | U-WRR-004 |
| `HIL_ORCHESTRATION_SESSION_NOT_SEPARATED` | U-WRR-006 |
| `HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT` | U-WRR-007 |

## 4. Design Reality Binding契約

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["WORKER_REVIEW_PROPOSAL_UNSEALED", "WORKER_REVIEW_EXECUTION_ORIGIN_UNSEALED", "WORKER_REVIEW_RECEIPT_SCHEMA_INVALID", "WORKER_REVIEW_PROPOSAL_DIGEST_MISMATCH", "HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED", "HIL_ORCHESTRATION_SESSION_NOT_SEPARATED", "HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT"],
  "assets": [
    { "asset_id": "worker-independent-review", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-review-receipt.ts", "resource_kind": "typescript_export", "resource_name": "admitWorkerIndependentReview", "source_digest": "sha256:8dc4d98713483d47cb3a45170d904d34b5f8c20aa570e6b6e094177febcf8f4a", "current_authority": true },
    { "asset_id": "worker-execution-origin", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-isolation-broker.ts", "resource_kind": "typescript_export", "resource_name": "resolveWorkerIsolationExecutionOrigin", "source_digest": "sha256:e1bd923f50327c72026d44e089bab1e104bb2e2cdc8bd41a546ef2f22ebbd6c4", "current_authority": true }
  ],
  "failure_reachability": [
    { "reason_code": "WORKER_REVIEW_PROPOSAL_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-review-receipt.ts", "source_symbol": "evaluateWorkerIndependentReview", "test_path": "tests/worker-review-receipt.test.ts", "oracle_id": "U-WRR-002", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_REVIEW_PROPOSAL_UNSEALED", "mutation": { "remove_post_resolution_check": "if (!proposalDigest)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-018", "execution_helper": "executeWorkerReviewMutationOracle", "execution_target": "if (!proposalDigest) return { ok: false, failure_code: \"WORKER_REVIEW_PROPOSAL_UNSEALED\" };" } },
    { "reason_code": "WORKER_REVIEW_EXECUTION_ORIGIN_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-review-receipt.ts", "source_symbol": "admitWorkerIndependentReview", "test_path": "tests/worker-review-receipt.test.ts", "oracle_id": "U-WRR-008", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_REVIEW_EXECUTION_ORIGIN_UNSEALED", "mutation": { "remove_post_resolution_check": "if (!workerOrigin || !reviewerOrigin)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-018", "execution_helper": "executeWorkerReviewMutationOracle" } },
    { "reason_code": "WORKER_REVIEW_RECEIPT_SCHEMA_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-review-receipt.ts", "source_symbol": "evaluateWorkerIndependentReview", "test_path": "tests/worker-review-receipt.test.ts", "oracle_id": "U-WRR-003", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_REVIEW_RECEIPT_SCHEMA_INVALID", "mutation": { "remove_post_resolution_check": "!isRecord(input) || !exactKeys(input, RECEIPT_KEYS)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-018", "execution_helper": "executeWorkerReviewMutationOracle", "execution_target": "if (!isRecord(input) || !exactKeys(input, RECEIPT_KEYS))" } },
    { "reason_code": "WORKER_REVIEW_PROPOSAL_DIGEST_MISMATCH", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-review-receipt.ts", "source_symbol": "evaluateWorkerIndependentReview", "test_path": "tests/worker-review-receipt.test.ts", "oracle_id": "U-WRR-002", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_REVIEW_PROPOSAL_DIGEST_MISMATCH", "mutation": { "remove_post_resolution_check": "if (input.proposal_digest !== proposalDigest)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-018", "execution_helper": "executeWorkerReviewMutationOracle" } },
    { "reason_code": "HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-review-receipt.ts", "source_symbol": "evaluateWorkerIndependentReview", "test_path": "tests/worker-review-receipt.test.ts", "oracle_id": "U-WRR-004", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED", "mutation": { "remove_post_resolution_check": "if (worker.identity === reviewer.identity)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-018", "execution_helper": "executeWorkerReviewMutationOracle" } },
    { "reason_code": "HIL_ORCHESTRATION_SESSION_NOT_SEPARATED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-review-receipt.ts", "source_symbol": "evaluateWorkerIndependentReview", "test_path": "tests/worker-review-receipt.test.ts", "oracle_id": "U-WRR-006", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "HIL_ORCHESTRATION_SESSION_NOT_SEPARATED", "mutation": { "remove_post_resolution_check": "if (worker.session === reviewer.session)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-018", "execution_helper": "executeWorkerReviewMutationOracle" } },
    { "reason_code": "HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-review-receipt.ts", "source_symbol": "evaluateWorkerIndependentReview", "test_path": "tests/worker-review-receipt.test.ts", "oracle_id": "U-WRR-007", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT", "mutation": { "remove_post_resolution_check": "if (worker.context_digest === reviewer.context_digest)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-018", "execution_helper": "executeWorkerReviewMutationOracle" } }
  ]
}
```
