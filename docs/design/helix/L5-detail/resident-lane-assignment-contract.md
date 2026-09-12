---
canonical_vmodel: L1-L12
canonical_layer: L5
canonical_pair: L8
title: "Resident Lane Assignment契約 詳細設計"
layer: L5
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: PLAN-L7-860-resident-lane-assignment-kernel
parent_design: docs/design/helix/L4-basic-design/resident-lane-assignment-boundary.md
pair_artifact: docs/test-design/helix/L8-resident-lane-assignment-unit-test-design.md
---

# Resident Lane Assignment契約 詳細設計

## 値オブジェクト

`ResidentLaneAssignmentV1`はL3のpacketへ`candidate_head`と`lease_id`を明示追加し、次を必須とする。

- schema version、assignment ID、repository識別子
- `issue:<owner>/<repo>#<number>`または`plan:<PLAN-ID>`の`scope_ref`
- scope本文／受入条件のdigest
- 専用branch、base SHA、candidate HEAD
- 担当lane／role、lease ID、正整数fence
- 作成／期限のRFC3339 timestamp

未知field、保護branch、不正なlease期間はfail-closeする。入力欠落をcwd、env、provider session、mainから補完しない。

## 純粋な判定

- `projectResidentLaneAssignments`: byte同一の重複を吸収し、active exact setを決定順で返す。期限切れ、branch二重writer、scope二branchをtyped failureにする。
- `evaluateAssignmentReviewReturn`: 元lane、branch、candidate HEAD、fenceの順で照合する。
- `evaluateAssignmentTakeover`: 旧lease終端、handover receipt、remote HEAD、新しいlease ID、`old fence + 1`、旧作成時刻より後の再割当時刻を検証し、同branchの新assignment revisionを返す。callerの`previous_lease_ended`証明を信頼するが、時刻逆行は受理しない。

## 失敗分類

入力不正、lease期限切れ、assignment ID衝突、writer重複、scope内branch衝突、外部writer／branch、古いcandidate HEAD／fence、
旧lease継続中、handover receipt欠落を別codeにする。複数異常は決定順の重複なし配列とし、表示文へ潰さない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "ASSIGNMENT_INPUT_INVALID",
    "ASSIGNMENT_LEASE_EXPIRED",
    "ASSIGNMENT_ID_CONFLICT",
    "ASSIGNMENT_DUPLICATE_BRANCH_WRITER",
    "ASSIGNMENT_SCOPE_ACTIVE_BRANCH_CONFLICT",
    "ASSIGNMENT_FOREIGN_WRITER",
    "ASSIGNMENT_FOREIGN_BRANCH",
    "ASSIGNMENT_STALE_CANDIDATE_HEAD",
    "ASSIGNMENT_STALE_FENCE",
    "ASSIGNMENT_PREVIOUS_LEASE_ACTIVE",
    "ASSIGNMENT_HANDOVER_RECEIPT_MISSING"
  ],
  "assets": [
    { "asset_id": "resident-lane-assignment-kernel", "classification": "existing_runtime", "artifact_path": "src/runtime/resident-lane-assignment.ts", "resource_kind": "typescript_export", "resource_name": "projectResidentLaneAssignments", "source_digest": "sha256:d479b2b415163139392cd1fa7eef31027635fee052779eb813717db8329b7132", "current_authority": true }
  ],
  "failure_reachability": [
    { "reason_code": "ASSIGNMENT_INPUT_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "projectResidentLaneAssignments", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-002", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_INPUT_INVALID", "mutation": { "remove_post_resolution_check": "if (!assignment.success) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_LEASE_EXPIRED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "projectResidentLaneAssignments", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-003", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_LEASE_EXPIRED", "mutation": { "remove_post_resolution_check": "Date.parse(assignment.expires_at) <= observedAt", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_ID_CONFLICT", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "projectResidentLaneAssignments", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-010", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_ID_CONFLICT", "mutation": { "remove_post_resolution_check": "identities.size > 1", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_DUPLICATE_BRANCH_WRITER", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "projectResidentLaneAssignments", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-004", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_DUPLICATE_BRANCH_WRITER", "mutation": { "remove_post_resolution_check": "owners.size > 1", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_SCOPE_ACTIVE_BRANCH_CONFLICT", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "projectResidentLaneAssignments", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_SCOPE_ACTIVE_BRANCH_CONFLICT", "mutation": { "remove_post_resolution_check": "branches.size > 1", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_FOREIGN_WRITER", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "evaluateAssignmentReviewReturn", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-007", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_FOREIGN_WRITER", "mutation": { "remove_post_resolution_check": "input.worker_lane_id !== input.assignment.assigned_lane_id", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_FOREIGN_BRANCH", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "evaluateAssignmentReviewReturn", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-006", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_FOREIGN_BRANCH", "mutation": { "remove_post_resolution_check": "input.branch !== input.assignment.branch", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_STALE_CANDIDATE_HEAD", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "evaluateAssignmentReviewReturn", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-006", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_STALE_CANDIDATE_HEAD", "mutation": { "remove_post_resolution_check": "input.candidate_head !== input.assignment.candidate_head", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_STALE_FENCE", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "evaluateAssignmentReviewReturn", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-006", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_STALE_FENCE", "mutation": { "remove_post_resolution_check": "input.lease_fence !== input.assignment.lease_fence", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_PREVIOUS_LEASE_ACTIVE", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "evaluateAssignmentTakeover", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-008", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_PREVIOUS_LEASE_ACTIVE", "mutation": { "remove_post_resolution_check": "!input.previous_lease_ended", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_HANDOVER_RECEIPT_MISSING", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "evaluateAssignmentTakeover", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-008", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_HANDOVER_RECEIPT_MISSING", "mutation": { "remove_post_resolution_check": "!digestSchema.safeParse(input.handover_receipt_digest).success", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } }
  ]
}
```
