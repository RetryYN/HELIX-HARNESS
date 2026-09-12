---
canonical_vmodel: L1-L12
canonical_layer: L4
canonical_pair: L9
title: "Resident Lane Assignment管理境界 基本設計"
layer: L4
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: PLAN-L7-860-resident-lane-assignment-kernel
parent_design: docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md
pair_artifact: docs/test-design/helix/L9-resident-lane-assignment-boundary-integration-test-design.md
---

# Resident Lane Assignment管理境界 基本設計

## 目的

L3のSlice 2を、管理層のAssignment authorityとproduct V-modelのscope契約を混ぜずに実装可能な境界へ降ろす。
管理層はwriterの所有・有効性・遷移を扱い、IssueまたはPLANが持つ要求・設計・受入条件の意味を変更しない。

## コンポーネント境界

| 境界 | 所有する責務 | 所有しない責務 |
|---|---|---|
| Assignment pure kernel | exact schema、active exact set、重複、期限、branch、HEAD、fence、review return、takeover判定 | GitHub読書き、DB、branch作成、dispatch |
| Event adapter（後続atom） | Assignment payloadを既存append-only journalへ接続しreplayする | 第二journal、第二lease、意味契約の変更 |
| Active writer query（後続atom） | current assignment exact setを#1256へ渡す | PLAN reservation競合規則の再実装 |
| Work-ticket relation（#1771） | required role/capabilityとAssignment参照の照合 | Assignment lifecycle、lease/fence更新 |

## 不変条件

- `scope_ref`はGitHub IssueまたはPLANのexactly oneであり、本文は複製しない。Issue形ではscope内repositoryとassignmentのrepositoryを一致させる。
- 一repository内で一branch一writer、一scope一active branchを既定とし、子Issueは別scopeとして明示する。repository／Issue scopeはGitHubの大小文字非依存identityへ正規化し、別repositoryの同名branch／scopeだけを独立に扱う。複合identityは区切り文字連結ではなくcanonical tupleで比較する。
- `changes requested`は元worker・同branch・同candidate HEAD・同fenceへだけ戻す。
- takeoverは旧lease終端、remote HEAD一致、handover receipt、別lane、新lease ID、安全整数範囲で単調増加するfenceを要求する。
- provider session、通知本文、queue row、Project表示をAssignment authorityへ昇格させない。
- event保存の再利用とevent契約の対応済み主張を区別し、RLO-AC-024..026がgreenになるまでmulti-HEAD統合完了としない。

## 原子的な実装順

1. 純粋なschema・projection・review-return・takeover。
2. version付きpayloadと過去HEAD／現writerの許可判定分離。
3. event reducer／queryと再起動後replay。
4. #1256へactive writerを渡すprovider。
5. GitHub read-afterでrepository固有の保護branchを照合し、branch発行、dispatch副作用へ進む。

本sliceは1だけを実装する。2以降を暗黙に満たしたとは扱わない。

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
    { "asset_id": "resident-lane-assignment-kernel", "classification": "existing_runtime", "artifact_path": "src/runtime/resident-lane-assignment.ts", "resource_kind": "typescript_export", "resource_name": "projectResidentLaneAssignments", "source_digest": "sha256:eb86bb6cf738920a3685489ea511420d474d8acfcf21a16aa43735cb5b6ea2f6", "current_authority": true }
  ],
  "failure_reachability": [
    { "reason_code": "ASSIGNMENT_INPUT_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "projectResidentLaneAssignments", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-002", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_INPUT_INVALID", "mutation": { "remove_post_resolution_check": "if (!assignment.success) {\n      return { ok: false, active_assignments: [], failure_codes: [\"ASSIGNMENT_INPUT_INVALID\"] };", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_LEASE_EXPIRED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "projectResidentLaneAssignments", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-003", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_LEASE_EXPIRED", "mutation": { "remove_post_resolution_check": "Date.parse(assignment.expires_at) <= observedAt", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
    { "reason_code": "ASSIGNMENT_ID_CONFLICT", "reachability_mode": "executable_oracle", "source_path": "src/runtime/resident-lane-assignment.ts", "source_symbol": "projectResidentLaneAssignments", "test_path": "tests/resident-lane-assignment.test.ts", "oracle_id": "U-RLA-010", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "ASSIGNMENT_ID_CONFLICT", "mutation": { "remove_post_resolution_check": "if (identityConflict) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-030", "execution_helper": "executeResidentLaneAssignmentMutationOracle" } },
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
