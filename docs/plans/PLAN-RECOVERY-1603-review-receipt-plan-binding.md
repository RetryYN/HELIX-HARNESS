---
plan_id: PLAN-RECOVERY-1603-review-receipt-plan-binding
title: "PLAN-RECOVERY-1603: sealed receiptとPLAN review evidenceを同じreviewer sessionへ束縛する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1603
behavior_contract_id: REVIEW-RECEIPT-PLAN-BINDING-001
responsibility_owner: review-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
backprop_decision: not_required
backprop_decision_reason: "独立review要件の意味は変えず、既存PLAN evidenceと既存sealed receiptの欠落joinを追加するRecoveryである。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "PLAN review_evidenceとPR sealed receiptはreviewer sessionをそれぞれ保持するが、receipt seal/admissionで相互照合されていない。"
contract_postconditions: "変更されたterminal PLANごとに、sealed receiptと同じreviewer session/modelのcross-agent技術承認が存在する場合だけreceiptをsealできる。"
contract_invariants: "human approvalと技術reviewを混同せず、既存receiptのHEAD・CI・DB・runtime独立性検査を緩和せず、Issue #1430のevidence substance責務を複製しない。"
contract_failures: "差分PLAN取得不能、PLAN parse不能、cross-agent承認欠落、session/model不一致をtyped reasonでfail-closeする。"
tdd_red_required: true
red_test: "tests/review-receipt-plan-binding.test.tsのU-RRPB-002..006を実装前に実行し、接合関数が未存在のためredを確認する。"
mutation_oracle_required: true
mutation_oracle: "session、model、review_kind、status、PLAN pathを個別に変異させ、各failure predicateが独立してredになることを検証する。"
parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md
pair_artifact: docs/test-design/helix/L8-review-receipt-plan-binding-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-001, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-002, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-003, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-004, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-005, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-006, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-007, test_path: tests/review-receipt-plan-binding.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md
  requires: []
  references:
    - "issue:1603"
    - "issue:1430"
    - "issue:923"
    - "PLAN-RECOVERY-1543-reviewer-session-model-history"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 独立review authorityと証拠帰属の非緩和を監査" }
  - { role: tl, slot_label: "TL — receiptとPLANのauthority join境界を確認" }
  - { role: se, slot_label: "SE — changed PLAN抽出とexact照合を実装" }
  - { role: qa, slot_label: "QA — session/model/review kindの独立反例を検証" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1603-review-receipt-plan-binding.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-receipt-plan-binding-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/review-receipt-plan-binding.ts, artifact_type: source_module }
  - { artifact_path: tests/review-receipt-plan-binding.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
review_evidence: []
---

# PLAN-RECOVERY-1603

Issue #1603で実測された2件の誤帰属経路を閉じる。作成側spawnのreviewは補助検証として利用可能だが、
独立reviewとしてPLANをterminal化する根拠にはしない。最終receiptのreviewer session/modelと、変更対象PLANの
技術承認entryをreceipt seal前に接合する。
