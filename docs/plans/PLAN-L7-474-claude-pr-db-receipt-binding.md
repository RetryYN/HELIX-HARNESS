---
plan_id: PLAN-L7-474-claude-pr-db-receipt-binding
title: "PLAN-L7-474 (impl): Claude PR receiptのcanonical DB証拠束縛"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-27 Issue #152を実案件としてClaude Code拡張の自動PR E2Eを実施する"
created: 2026-07-27
updated: 2026-07-27
owner: Codex / TL
github_issue_id: 152
engineering_discipline_required: true
behavior_contract_id: U-CPRCONV-004
responsibility_owner: claude-pr-convergence
change_slice: atomic
refactor_step: strengthen_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "Claudeがcurrent HEADのCI結果とreview verdictをpr-review-receiptへ渡す"
contract_postconditions: "approve receiptのDB証拠はrepository-owned logical DB verifierが同じprocessで生成したschema、projection/replay、checkpoint/replay、receipt digestへ束縛される"
contract_invariants: "caller supplied booleanまたは任意SHAをauthorityにせず、新command、新DB schema、新CI job、新dependencyを追加しない"
contract_failures: "canonical verifier非収束、schema不一致、projection/checkpoint replay不一致、caller claim不一致をfail-closeする"
tdd_red_required: true
red_at: "2026-07-27T22:50:00+09:00"
green_at: "2026-07-27T22:55:00+09:00"
mutation_oracle_evidence: "tests/claude-pr-convergence.test.ts のrowCounts-only ad-hoc digest反例が caller_db_claim_mismatch を検出し、repository-owned receiptのprojection/checkpoint replay一致だけをapprove可能にする"
complexity_effect: net_neutral
complexity_justification: "既存createL3G3LogicalDbReceiptをpr-review-receiptから直接再利用し、外部script、detector、永続schemaを増やさずcaller authorityを削除する"
removal_trigger: "Claude review receiptとlogical DB receiptが単一repository-owned typed evidence envelopeへ統合された時点でbinding helperを統合する"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-004, test_path: tests/claude-pr-convergence.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — canonical DB receiptとClaude review receiptの束縛"
  - role: qa
    slot_label: "QA — ad-hoc digest、replay不一致、非収束反例"
  - role: tl
    slot_label: "TL — Claude Code拡張の実機PR E2E"
generates:
  - { artifact_path: docs/plans/PLAN-L7-474-claude-pr-db-receipt-binding.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-27T13:55:00Z"
  review_binding:
    reviewer: "pending independent AI-B"
    reviewed_at: "2026-07-27T13:55:00Z"
    evidence_digest: "sha256:pending"
  entries: []
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires:
    - docs/governance/l3-g3-logical-db-bootstrap-policy.json
    - src/doctor/l3-g3-logical-db-receipt.ts
  references:
    - docs/design/helix/L6-function-design/orchestration-memory.md
  blocks:
    - G1/G3-PO-APPROVAL
---

# PLAN-L7-474: Claude PR receiptのcanonical DB証拠束縛

## 目的

Claudeのapprove receiptがcaller suppliedの`dbConverged=true`と任意SHAだけで成立する欠陥を閉じる。
既存のlogical DB verifierを`pr-review-receipt`自身が実行し、その完全な再現証拠をreview receiptへ束縛する。

## 非対象

- G1/G3承認または153件のdefinition freeze。
- 新しいdetector、DB schema、CI job、dependency。
- CI高速化またはClaude review laneの追加。

## 完了条件

- approve時にrepository-owned logical DB verifierがCLI process内で実行される。
- projection/checkpointのoriginalとreplayが一致し、`converged=true`の場合だけreceiptを発行する。
- schema versionとcanonical receipt digestをreview receiptへ含める。
- caller suppliedのrowCounts-only ad-hoc digestを拒否する。
- targeted test、typecheck、full CI、Claude Code拡張E2Eがgreenになる。
