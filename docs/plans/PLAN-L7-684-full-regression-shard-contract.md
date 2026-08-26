---
plan_id: PLAN-L7-684-full-regression-shard-contract
title: "PLAN-L7-684 (impl): Full regression exact shard partition contract"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1070 Full regression exact shard partition contract"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1070
behavior_contract_id: FULL-REGRESSION-SHARD-PARTITION-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-26T20:53:45Z"
    tests_green_at: "2026-08-26T20:49:59Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: c7895aff-da7e-47a0-944a-36c68bb4f251
    reviewed_head_sha: 6511fe568f49ed95383bd963211c8acd331ccd95
    scope: "PR #1072 current HEAD 6511fe568f49ed95383bd963211c8acd331ccd95をClaude Code Opusが独立検収し、exact partition、duplicate、per-shard digest、candidate HEAD、nonzero receiptのfail-closeとmutation killを確認した。creation側の冗長guardを除去してもvalidatorが拒否することを実測し、内容blocker 0と判定した。merge前のPLAN confirmed化のみを収束条件とした。review: https://github.com/RetryYN/HELIX-HARNESS/pull/1072#issuecomment-5430986655"
    green_commands:
      - kind: smoke
        command: "gh run view 33010363100 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-26T20:49:59Z"
        evidence_path: tests/full-regression-shards.test.ts
        output_digest: "sha256:6990d57169e1454694ea16eb4941f9c8966568f5fba39798f451bcd860b7bb35"
        result: "terminal success / HEAD 6511fe568f49ed95383bd963211c8acd331ccd95"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-26T20:53:45Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-26T20:53:45Z"
    evidence_digest: "sha256:7371bd0a6c48edb12f1ef3c9b6d6d16cf4fff3192eb0c291d973f48cec58254d"
  entries: []
backprop_decision: not_required
backprop_decision_reason: "Forward L6設計とL8テスト設計を同一sliceで更新しており、Reverse R4からL1-L6へ戻す追加backpropは発生しない"
contract_preconditions: "candidate HEAD、base SHA、tracked test inventory exact setを受け取る"
contract_postconditions: "bulk 2 shardとstateful shardの和集合がinventory exact setとなり、全receiptを同じpartitionへ束縛できる"
contract_invariants: "test削除、timeout緩和、same-root worker増加、targetedによるFull代替を行わない"
contract_failures: "missing／duplicate／unknown／wrong HEAD／base／digest／shard／file set／nonzero receiptをfail-closeする"
tdd_red_required: true
red_test: "U-FULLSHARD-001..006がpartition欠落、交差、digest改竄、identity mismatch、nonzero receiptを検出する"
mutation_oracle_evidence: "2026-08-27T03:28:48+09:00にduplicate_test_path guardを一時除去し、U-FULLSHARD-002がexpected duplicate_test_path欠落で1 failed、exit 1となるkillを実測。2026-08-27T03:29:02+09:00にreceipt candidate HEAD照合を一時除去し、U-FULLSHARD-005がexpected receipt_head_mismatch:bulk-1欠落で1 failed、exit 1となる独立killを実測した。apply_patchで両guardを復元後、6 tests greenと製品コードの意図差分だけを再確認した"
complexity_effect: justified_positive
complexity_justification: "workflow YAMLへ判定を複製せず、partitionとreceipt検証を単一pure moduleへ集約する"
removal_trigger: "Impact CI inventory自身がversioned distributed execution planとreceipt validatorを直接生成するmajor migration時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-001, test_path: tests/full-regression-shards.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-002, test_path: tests/full-regression-shards.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-003, test_path: tests/full-regression-shards.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-004, test_path: tests/full-regression-shards.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-005, test_path: tests/full-regression-shards.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-006, test_path: tests/full-regression-shards.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-684-full-regression-shard-contract.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/full-regression-shards.ts, artifact_type: source_module }
  - { artifact_path: tests/full-regression-shards.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-493-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
    - docs/design/helix/L3-requirements/github-ci-performance-requirements.md
  references:
    - issue:1069
    - issue:1070
  blocks:
    - issue:1071
agent_slots:
  - { role: se, slot_label: "SE — deterministic partition／typed receipt validator" }
  - { role: qa, slot_label: "QA — exact set／identity／digest mutation oracle" }
  - { role: tl, slot_label: "TL — GH-NFR-010非縮退／workflow非混載境界" }
---

# PLAN-L7-684: Full regression shardの厳密契約

## 目的

Full regressionの約20分bulk critical pathを独立runnerへ安全に分割する前提として、test inventoryのexact partitionと
runner receiptのidentityをpure TypeScript契約へ固定する。

## 非対象

GitHub Actions job配線、test実行、artifact upload、DB／doctor finalize、release／publishはIssue #1071へ分離する。
