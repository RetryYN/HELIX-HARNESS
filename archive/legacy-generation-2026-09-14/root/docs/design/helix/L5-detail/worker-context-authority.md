---
title: "worker context authority詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L5-92-worker-context-authority.md
pair_artifact: docs/test-design/helix/L8-worker-context-authority-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-context-authority.md
github_issue_id: 225
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
---

# worker context authority詳細設計

## 1. packet契約

packetはL3 §1.1の18 field exact setとし、unknown／missing fieldを許さない。`payload_digest`はpacket envelopeを除く
実provider payload bytesのdigest、`packet_digest`はcanonical packet全体のprocess-local capability fieldとする。
envelope digestでpacket JSONとpayloadの結合全体をsealし、自己参照digestを作らない。

authority attestorはactual `git rev-parse HEAD`と要求HEADを一致させ、canonical allowlist内のregular file bytesだけを
path＋digest順でcanonical化する。compatibility/historical pathは名称類似や内容一致でも拒否する。

## 2. failureの厳密集合

| 順序 | reason code | 条件 |
|---:|---|---|
| 1 | `WORKER_CONTEXT_SCHEMA_INVALID` | HEAD/digest/payload/field形状不正 |
| 2 | `WORKER_CONTEXT_HEAD_DRIFT` | actual HEADとpacket/current requestが不一致 |
| 3 | `WORKER_CONTEXT_COMPATIBILITY_AUTHORITY` | archive、v1.2、廃止layer authority |
| 4 | `WORKER_CONTEXT_AUTHORITY_UNRESOLVED` | canonical authority path/bytes/gitが解決不能 |
| 5 | `WORKER_CONTEXT_RULE_PACKET_UNRESOLVED` | effective rule path/bytesが解決不能 |
| 6 | `WORKER_CONTEXT_AXES_INVALID` | style/case/specialistのenumまたは直交性不正 |
| 7 | `WORKER_CONTEXT_SCOPE_INVALID` | contract/owner/path欠落、absolute/traversal/重複/overlap |
| 8 | `WORKER_CONTEXT_BUDGET_UNRESOLVED` | time/tokenが正整数でない |
| 9 | `WORKER_CONTEXT_OUTPUT_SCHEMA_MISMATCH` | packetとadmitted descriptorのschema digest不一致 |
| 10 | `WORKER_CONTEXT_ROLE_JUDGMENT_MISMATCH` | role変更後も旧brief digestを利用 |
| 11 | `WORKER_CONTEXT_TASK_LENS_MISMATCH` | task変更後も旧lens digestを利用 |
| 12 | `WORKER_CONTEXT_PAYLOAD_DIGEST_MISMATCH` | envelope/payloadがcompile後にdrift |
| 13 | `WORKER_CONTEXT_UNSEALED` | plain copy、legacy wrapper、別authority root |

評価順はauthority→boundary→compile→broker再検証で固定する。provider promptの文言一致や`toContain()`だけを
reachability証拠にしない。

## 3. 設計実在性の束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "WORKER_CONTEXT_SCHEMA_INVALID", "WORKER_CONTEXT_HEAD_DRIFT", "WORKER_CONTEXT_AUTHORITY_UNRESOLVED",
    "WORKER_CONTEXT_COMPATIBILITY_AUTHORITY", "WORKER_CONTEXT_RULE_PACKET_UNRESOLVED", "WORKER_CONTEXT_AXES_INVALID",
    "WORKER_CONTEXT_SCOPE_INVALID", "WORKER_CONTEXT_BUDGET_UNRESOLVED", "WORKER_CONTEXT_OUTPUT_SCHEMA_MISMATCH",
    "WORKER_CONTEXT_ROLE_JUDGMENT_MISMATCH", "WORKER_CONTEXT_TASK_LENS_MISMATCH",
    "WORKER_CONTEXT_PAYLOAD_DIGEST_MISMATCH", "WORKER_CONTEXT_UNSEALED"
  ],
  "assets": [
    { "asset_id": "worker-context-compiler", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-context-packet.ts", "resource_kind": "typescript_export", "resource_name": "compileWorkerContextPacket", "source_digest": "sha256:e0019264841da35c7018cd41931073234f6ddd1926d6f923ba675c1b445e035f", "current_authority": true },
    { "asset_id": "context-bound-wrapper", "classification": "existing_runtime", "artifact_path": "src/runtime/adapter.ts", "resource_kind": "typescript_export", "resource_name": "buildContextBoundWrapperAdapterPlan", "source_digest": "sha256:20f49fbb67631a80a18f11da8457370ef90ca7ce5873b576b66e27e35744d28c", "current_authority": true },
    { "asset_id": "context-broker-consumer", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-isolation-broker.ts", "resource_kind": "typescript_export", "resource_name": "prepareWorkerIsolationLaunch", "source_digest": "sha256:5a0f69619306f27c2c04fac3f05566346aec5c499631d62440d34c7e7b0e220d", "current_authority": true }
  ],
  "failure_reachability": [
    { "reason_code": "WORKER_CONTEXT_SCHEMA_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "compileWorkerContextPacket", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-008", "identity_fields": [], "post_resolution_checks": [], "fixture": {"invalid":"digest"}, "expected_reason": "WORKER_CONTEXT_SCHEMA_INVALID", "mutation": {"remove_post_resolution_check":"!isSha(request.boundary.severity_policy_digest) ||","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_HEAD_DRIFT", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "attestWorkerContextAuthority", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-002", "identity_fields": [], "post_resolution_checks": [], "fixture": {"head":"drift"}, "expected_reason": "WORKER_CONTEXT_HEAD_DRIFT", "mutation": {"remove_post_resolution_check":"if (request.current_head !== actualHead)","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_AUTHORITY_UNRESOLVED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "attestWorkerContextAuthority", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-006", "identity_fields": [], "post_resolution_checks": [], "fixture": {"authority":"missing"}, "expected_reason": "WORKER_CONTEXT_AUTHORITY_UNRESOLVED", "mutation": {"remove_post_resolution_check":"if (!authorities)","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_COMPATIBILITY_AUTHORITY", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "attestWorkerContextAuthority", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-002", "identity_fields": [], "post_resolution_checks": [], "fixture": {"authority":"v1.2"}, "expected_reason": "WORKER_CONTEXT_COMPATIBILITY_AUTHORITY", "mutation": {"remove_post_resolution_check":"request.authority_paths.some((path) => isCompatibilityPath(path))","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_RULE_PACKET_UNRESOLVED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "attestWorkerContextAuthority", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-007", "identity_fields": [], "post_resolution_checks": [], "fixture": {"rule":"missing"}, "expected_reason": "WORKER_CONTEXT_RULE_PACKET_UNRESOLVED", "mutation": {"remove_post_resolution_check":"if (!rules)","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_AXES_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "compileWorkerContextPacket", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-009", "identity_fields": [], "post_resolution_checks": [], "fixture": {"workflow_style":"poc"}, "expected_reason": "WORKER_CONTEXT_AXES_INVALID", "mutation": {"remove_post_resolution_check":"if (!validAxes(request.boundary))","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_SCOPE_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "compileWorkerContextPacket", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-003", "identity_fields": [], "post_resolution_checks": [], "fixture": {"path":"overlap"}, "expected_reason": "WORKER_CONTEXT_SCOPE_INVALID", "mutation": {"remove_post_resolution_check":"if (!validScope(request.boundary))","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_BUDGET_UNRESOLVED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "compileWorkerContextPacket", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-003", "identity_fields": [], "post_resolution_checks": [], "fixture": {"time_ms":0}, "expected_reason": "WORKER_CONTEXT_BUDGET_UNRESOLVED", "mutation": {"remove_post_resolution_check":"if (!validBudget(request.boundary))","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_OUTPUT_SCHEMA_MISMATCH", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "verifyWorkerContextEnvelope", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-005", "identity_fields": [], "post_resolution_checks": [], "fixture": {"schema":"drift"}, "expected_reason": "WORKER_CONTEXT_OUTPUT_SCHEMA_MISMATCH", "mutation": {"remove_post_resolution_check":"seal.packet.required_output_schema !== input.required_output_schema","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_ROLE_JUDGMENT_MISMATCH", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "verifyWorkerContextEnvelope", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-004", "identity_fields": [], "post_resolution_checks": [], "fixture": {"role":"drift"}, "expected_reason": "WORKER_CONTEXT_ROLE_JUDGMENT_MISMATCH", "mutation": {"remove_post_resolution_check":"seal.packet.role_judgment_digest !== sha256Digest(roleJudgmentBrief(input.role))","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_TASK_LENS_MISMATCH", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "verifyWorkerContextEnvelope", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-004", "identity_fields": [], "post_resolution_checks": [], "fixture": {"task":"drift"}, "expected_reason": "WORKER_CONTEXT_TASK_LENS_MISMATCH", "mutation": {"remove_post_resolution_check":"seal.packet.task_lens_digest !== sha256Digest(taskLensBrief(input.task))","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_PAYLOAD_DIGEST_MISMATCH", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "verifyWorkerContextEnvelope", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-004", "identity_fields": [], "post_resolution_checks": [], "fixture": {"payload":"drift"}, "expected_reason": "WORKER_CONTEXT_PAYLOAD_DIGEST_MISMATCH", "mutation": {"remove_post_resolution_check":"if (seal.envelope_digest !== sha256Digest(envelope))","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} },
    { "reason_code": "WORKER_CONTEXT_UNSEALED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-context-packet.ts", "source_symbol": "verifyWorkerContextEnvelope", "test_path": "tests/worker-context-packet.test.ts", "oracle_id": "U-WCP-005", "identity_fields": [], "post_resolution_checks": [], "fixture": {"capability":"copy"}, "expected_reason": "WORKER_CONTEXT_UNSEALED", "mutation": {"remove_post_resolution_check":"if (!seal) return failure(\"WORKER_CONTEXT_UNSEALED\");","expected_reason_after_mutation":"RED_BY_ORACLE","execution_test_path":"tests/design-reality-binding.test.ts","execution_oracle_id":"U-DRB-019","execution_helper":"executeWorkerContextMutationOracle"} }
  ]
}
```
