---
title: "worker risk admission詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L5-94-worker-risk-admission.md
pair_artifact: docs/test-design/helix/L8-worker-risk-admission-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-risk-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
---

# worker risk admission詳細設計

## 1. 厳密契約

requestはschema、重複なしcandidate、sealed risk receipt、重複なしstandalone finding、重複なしuse policyのexact setとする。
各riskのreceiptは一件だけを許し、plain copy、未知receipt、同risk二重receiptを拒否する。
重大findingは`scope_violation`、`secret_leak`、`schema_violation`だけを受理し、candidateごとのreasonとfinding IDへ残す。
critical pre-filter後のcandidateだけをscore降順、cost昇順、candidate ID昇順で選ぶ。
scoreはrequired risk間の最小値を用途別下限と比較し、平均値によるrisk間相殺を許さない。
standalone findingはrisk classにかかわらず全用途でretireさせ、`risk_class`は監査用provenanceとしてreceiptへ残す。
fixed effortには同じrequest内で当該effortを実測したsealed benchmark receipt digestを必須とし、candidate実測effortと不一致ならその用途でretireする。

## 2. failureとdecision reason

| 種別 | code | 条件 |
|---|---|---|
| failure | `WORKER_RISK_ADMISSION_INPUT_INVALID` | exact schema、ID、finding、policy不正 |
| failure | `WORKER_RISK_ADMISSION_RECEIPT_UNSEALED` | plain copy又は未知bench receipt |
| failure | `WORKER_RISK_ADMISSION_RISK_DUPLICATE` | 同risk receiptが複数 |
| failure | `WORKER_RISK_ADMISSION_EFFORT_FIXATION_UNJUSTIFIED` | fixed effortにsealed benchmark receipt参照なし |
| decision | `WORKER_RISK_CRITICAL_SCOPE_VIOLATION` | scope逸脱finding |
| decision | `WORKER_RISK_CRITICAL_SECRET_LEAK` | secret漏洩finding |
| decision | `WORKER_RISK_CRITICAL_SCHEMA_VIOLATION` | schema違反finding |
| decision | `WORKER_RISK_EVIDENCE_MISSING` | 用途required riskのcandidate row欠落 |
| decision | `WORKER_RISK_SCORE_BELOW_THRESHOLD` | required riskの最小scoreが用途別下限未達 |
| decision | `WORKER_RISK_COST_ABOVE_LIMIT` | 用途別cost上限超過 |
| decision | `WORKER_RISK_FIXED_EFFORT_MISMATCH` | justify済みfixed effortと実測不一致 |

重大reasonを持つ候補は、平均scoreが高くても必ず`retire`する。finding digest、bench receipt digest、用途別decisionを
一つのsealed receiptへ束縛し、plain copyをcurrent authorityとして扱わない。

## 3. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "WORKER_RISK_ADMISSION_INPUT_INVALID",
    "WORKER_RISK_ADMISSION_RECEIPT_UNSEALED",
    "WORKER_RISK_ADMISSION_RISK_DUPLICATE",
    "WORKER_RISK_ADMISSION_EFFORT_FIXATION_UNJUSTIFIED"
  ],
  "assets": [
    { "asset_id": "worker-risk-admission", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-risk-admission.ts", "resource_kind": "typescript_export", "resource_name": "decideWorkerRiskAdmission", "source_digest": "sha256:78443940baec8b5d51e043d892bbc66afc7da3d68051d40229edbad30cbbfad3", "current_authority": true }
  ],
  "failure_reachability": [
    { "reason_code": "WORKER_RISK_ADMISSION_INPUT_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-risk-admission.ts", "source_symbol": "decideWorkerRiskAdmission", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WRA-002", "identity_fields": [], "post_resolution_checks": ["exact request"], "fixture": {"schema_version":"unknown"}, "expected_reason": "WORKER_RISK_ADMISSION_INPUT_INVALID", "mutation": {"remove_post_resolution_check":"!hasExactKeys(input, [", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-022", "execution_helper":"executeWorkerRiskAdmissionMutationOracle"} },
    { "reason_code": "WORKER_RISK_ADMISSION_RECEIPT_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-risk-admission.ts", "source_symbol": "decideWorkerRiskAdmission", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WRA-003", "identity_fields": ["receipt_digest"], "post_resolution_checks": ["bench receipt capability"], "fixture": {"receipt":"copy"}, "expected_reason": "WORKER_RISK_ADMISSION_RECEIPT_UNSEALED", "mutation": {"remove_post_resolution_check":"if (!risk) return failure(\"WORKER_RISK_ADMISSION_RECEIPT_UNSEALED\");", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-022", "execution_helper":"executeWorkerRiskAdmissionMutationOracle"} },
    { "reason_code": "WORKER_RISK_ADMISSION_RISK_DUPLICATE", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-risk-admission.ts", "source_symbol": "decideWorkerRiskAdmission", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WRA-003", "identity_fields": ["risk_class"], "post_resolution_checks": ["one receipt per risk"], "fixture": {"risk":"duplicate"}, "expected_reason": "WORKER_RISK_ADMISSION_RISK_DUPLICATE", "mutation": {"remove_post_resolution_check":"if (receiptsByRisk.has(risk)) return failure(\"WORKER_RISK_ADMISSION_RISK_DUPLICATE\");", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-022", "execution_helper":"executeWorkerRiskAdmissionMutationOracle"} },
    { "reason_code": "WORKER_RISK_ADMISSION_EFFORT_FIXATION_UNJUSTIFIED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-risk-admission.ts", "source_symbol": "decideWorkerRiskAdmission", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WRA-004", "identity_fields": ["fixed_effort","effort_justification_receipt_digest"], "post_resolution_checks": ["sealed benchmark receipt参照"], "fixture": {"fixed_effort":"high","effort_justification_receipt_digest":null}, "expected_reason": "WORKER_RISK_ADMISSION_EFFORT_FIXATION_UNJUSTIFIED", "mutation": {"remove_post_resolution_check":"policy.fixed_effort !== null &&", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-022", "execution_helper":"executeWorkerRiskAdmissionMutationOracle"} }
  ]
}
```
