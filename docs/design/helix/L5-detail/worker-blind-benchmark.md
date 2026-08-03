---
title: "worker blind benchmark詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L5-93-worker-blind-benchmark.md
pair_artifact: docs/test-design/helix/L8-worker-blind-benchmark-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-blind-benchmark.md
github_issue_id: 225
behavior_contract_id: WCC-FR-07
responsibility_owner: worker-blind-benchmark
---

# worker blind benchmark詳細設計

## 1. contract

definitionはschema、benchmark ID、fixture digest、重複なしrubric（weight合計100）、task digest、risk、full admission、
非負cost policyのexact setとする。candidateはcaller申告値ではなく、current admissionへ再照合できる
broker sealed outputとexecution originから生成する。blind packetはworker/model/effortを含まずopaque candidate IDだけを持つ。
evaluationは別identityのjudgeが返したstrict output schema内でpacket digest、rubric dimension exact set、
非負整数host observationを一緒にsealしたものだけを受理する。full selectionは異なるprovenance tupleを2件以上要求し、
score降順、cost昇順、candidate ID昇順で決定する。

## 2. 失敗理由の完全集合

| 順序 | reason code | 条件 |
|---:|---|---|
| 1 | `WORKER_BLIND_DEFINITION_INVALID` | unknown/author/private field、digest/rubric/cost不正 |
| 2 | `WORKER_BLIND_SMOKE_ONLY_REJECTED` | smoke結果をfull selectionへ利用 |
| 3 | `WORKER_BLIND_DEFINITION_UNSEALED` | 複製または未知のdefinition capability |
| 4 | `WORKER_BLIND_PACKET_INVALID` | candidate/artifact/definition binding不正 |
| 5 | `WORKER_BLIND_PACKET_UNSEALED` | 複製または未知のpacket capability |
| 6 | `WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED` | copied/stale outputまたはcurrent admission不一致 |
| 7 | `WORKER_BLIND_EVALUATION_UNSEALED` | judge output不在、自己judge、packet digest不一致 |
| 8 | `WORKER_BLIND_PROVENANCE_DUPLICATE` | 2件未満または同一worker/provider/model/effort/descriptor |
| 9 | `WORKER_BLIND_SCORE_INVALID` | rubric欠落/余分、範囲外、非有限観測、duplicate candidate |

## 3. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "WORKER_BLIND_DEFINITION_INVALID", "WORKER_BLIND_SMOKE_ONLY_REJECTED",
    "WORKER_BLIND_DEFINITION_UNSEALED", "WORKER_BLIND_PACKET_INVALID",
    "WORKER_BLIND_PACKET_UNSEALED", "WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED",
    "WORKER_BLIND_EVALUATION_UNSEALED", "WORKER_BLIND_PROVENANCE_DUPLICATE",
    "WORKER_BLIND_SCORE_INVALID"
  ],
  "assets": [
    { "asset_id": "worker-blind-benchmark", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-blind-benchmark.ts", "resource_kind": "typescript_export", "resource_name": "evaluateWorkerBlindBenchmark", "source_digest": "sha256:6bf2718a97bf5e1b513a2ad317d8cfa57b2bb3c54e17eb4cad1fdab380e9b60f", "current_authority": true }
  ],
  "failure_reachability": [
    { "reason_code": "WORKER_BLIND_DEFINITION_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "freezeWorkerBlindBenchmark", "test_path": "tests/worker-blind-benchmark.test.ts", "oracle_id": "U-WBB-002", "identity_fields": [], "post_resolution_checks": [], "fixture": {"author_claim":"present"}, "expected_reason": "WORKER_BLIND_DEFINITION_INVALID", "mutation": {"remove_post_resolution_check":"if (!validDefinition(input))", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} },
    { "reason_code": "WORKER_BLIND_SMOKE_ONLY_REJECTED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "freezeWorkerBlindBenchmark", "test_path": "tests/worker-blind-benchmark.test.ts", "oracle_id": "U-WBB-002", "identity_fields": [], "post_resolution_checks": [], "fixture": {"admission_level":"smoke"}, "expected_reason": "WORKER_BLIND_SMOKE_ONLY_REJECTED", "mutation": {"remove_post_resolution_check":"if (input.admission_level === \"smoke\")", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} },
    { "reason_code": "WORKER_BLIND_DEFINITION_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "buildWorkerBlindPacket", "test_path": "tests/worker-blind-benchmark.test.ts", "oracle_id": "U-WBB-002", "identity_fields": [], "post_resolution_checks": [], "fixture": {"definition":"copy"}, "expected_reason": "WORKER_BLIND_DEFINITION_UNSEALED", "mutation": {"remove_post_resolution_check":"definition seal branch", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} },
    { "reason_code": "WORKER_BLIND_PACKET_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "buildWorkerBlindPacket", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WBB-005", "identity_fields": [], "post_resolution_checks": [], "fixture": {"candidate_id":"unsafe"}, "expected_reason": "WORKER_BLIND_PACKET_INVALID", "mutation": {"remove_post_resolution_check":"candidate ID validation", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} },
    { "reason_code": "WORKER_BLIND_PACKET_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "evaluateWorkerBlindBenchmark", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WBB-005", "identity_fields": [], "post_resolution_checks": [], "fixture": {"packet":"copy"}, "expected_reason": "WORKER_BLIND_PACKET_UNSEALED", "mutation": {"remove_post_resolution_check":"packet seal branch", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} },
    { "reason_code": "WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "buildWorkerBlindPacket", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WBB-005", "identity_fields": ["identity","provider","model","effort","descriptor_digest"], "post_resolution_checks": ["current admission"], "fixture": {"output":"copy"}, "expected_reason": "WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED", "mutation": {"remove_post_resolution_check":"origin seal branch", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} },
    { "reason_code": "WORKER_BLIND_EVALUATION_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "evaluateWorkerBlindBenchmark", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WBB-005", "identity_fields": ["packet_digest","judge identity"], "post_resolution_checks": ["strict output payload"], "fixture": {"packet_digest":"mismatch"}, "expected_reason": "WORKER_BLIND_EVALUATION_UNSEALED", "mutation": {"remove_post_resolution_check":"evaluation payload branch", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} },
    { "reason_code": "WORKER_BLIND_PROVENANCE_DUPLICATE", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "evaluateWorkerBlindBenchmark", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WBB-005", "identity_fields": ["identity","provider","model","effort","descriptor_digest"], "post_resolution_checks": ["minimum two distinct tuples"], "fixture": {"candidate_origin":"duplicate"}, "expected_reason": "WORKER_BLIND_PROVENANCE_DUPLICATE", "mutation": {"remove_post_resolution_check":"provenance uniqueness branch", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} },
    { "reason_code": "WORKER_BLIND_SCORE_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-blind-benchmark.ts", "source_symbol": "evaluateWorkerBlindBenchmark", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WBB-005", "identity_fields": [], "post_resolution_checks": ["rubric exact set and range"], "fixture": {"score":101}, "expected_reason": "WORKER_BLIND_SCORE_INVALID", "mutation": {"remove_post_resolution_check":"score validation branch", "expected_reason_after_mutation":"RED_BY_ORACLE", "execution_test_path":"tests/design-reality-binding.test.ts", "execution_oracle_id":"U-DRB-021", "execution_helper":"executeWorkerBlindBenchmarkMutationOracle"} }
  ]
}
```
