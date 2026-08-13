---
plan_id: PLAN-RECOVERY-58-mixed-dual-receipt-persistence
title: "PLAN-RECOVERY-58 (recovery): mixed dual receiptのimmutable保存衝突を解消する"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-14 open PRをharness・GitHub・orchestration rulesに従って収束させる指示に基づき、PR #670で実測した2件目review_receipt_conflictをRecoveryする"
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 672
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "mixed authorship PRの同一HEADにClaude/Codex各receiptが存在する"
contract_postconditions: "reviewer別immutable pathへ2件を共存保存し、双方を再読込でき、既知slot conflictはcomment投稿前に拒否する"
contract_invariants: "単一runtime authored PRの複数receipt conflictと同一reviewer上書き拒否を維持する"
contract_failures: "reviewer identity欠落、同一reviewer異内容、digest不整合をfail-closeする"
tdd_red_required: true
red_at: "2026-08-14T05:34:51+09:00"
green_at: "2026-08-14T05:46:50+09:00"
mutation_oracle_evidence: "U-CPRCONV-024がreviewerをfilenameから除去すると2件目のreview_receipt_conflictでredになる"
complexity_effect: net_neutral
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-024, test_path: tests/claude-pr-convergence.test.ts }
backprop_decision: not_required
backprop_decision_reason: "Issue #539で確定済みのdual receipt要件に対する保存adapter欠陥のrecoveryであり、要件意味は変更しない"
agent_slots:
  - { role: aim, slot_label: "AIM — PR #670失敗証跡と保存identity監査" }
  - { role: se, slot_label: "SE — reviewer別immutable receipt path" }
  - { role: qa, slot_label: "QA — dual保存と同一reviewer conflict oracle" }
  - { role: tl, slot_label: "TL — PR #670 dogfood収束" }
generates:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/plans/PLAN-RECOVERY-58-mixed-dual-receipt-persistence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
  requires: []
  blocks: [issue:670]
review_evidence: []
---

# mixed dual receipt永続化

PR #670で実測した保存identity衝突を、reviewer runtimeを含むimmutable filenameへ是正する。
