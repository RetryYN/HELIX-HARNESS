---
plan_id: PLAN-L7-687-l3-human-approval-gate
title: "PLAN-L7-687 (impl): L3 PLAN human approval gate"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1097
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1097 L3 terminal化へhuman PO approval gateを追加する"
behavior_contract_id: L3-HUMAN-APPROVAL-GATE-001
responsibility_owner: l3-human-approval-gate
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PLAN frontmatterのlayer/statusとreview_evidenceを読み取れる"
contract_postconditions: "基準日以降のL3 confirmed/completed PLANがtyped PO approvalなしにdoctorを通過しない"
contract_invariants: "技術review evidenceとL3要件承認を同一recordへ畳み込まず、過去履歴を捏造的に改変しない"
contract_failures: "approval欠落、型不一致、decision不一致、対象PLAN不一致、日付欠落をfail-closeする"
tdd_red_required: true
complexity_effect: net_neutral
complexity_justification: "既存review-evidence doctor gateへL3 approvalの独立検査を追加し、別DB・別runtimeを増やさない"
removal_trigger: "外部approval provenanceがtyped human approvalをcurrent HEADへ検証できる後続sliceへ統合された時"
parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md
pair_artifact: docs/test-design/helix/L8-l3-human-approval-gate-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-001, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-002, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-003, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-004, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-005, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-006, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-007, test_path: tests/review-evidence.test.ts }
agent_slots:
  - { role: tl, slot_label: "TL — L3承認境界と移行日付の統制" }
  - { role: se, slot_label: "SE — frontmatter schemaとreview-evidence loader" }
  - { role: qa, slot_label: "QA — AI-only、typed approval、binding mutation" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-687-l3-human-approval-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/l3-human-approval-gate.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-l3-human-approval-gate-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
modifies:
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
dependencies:
  parent: docs/design/helix/L6-function-design/l3-human-approval-gate.md
  requires: []
  blocks: []
  references:
    - issue:1097
---

# L3 PLAN の人間承認 gate

L3 Requirement CompilerのG1/G3人間承認を、技術レビューの `review_evidence` から分離して
機械検査する。既存の過去確定PLANへ遡及的な証拠追加を要求せず、基準日以降にL3をterminal化・
更新する経路へ `l3_human_approval` typed recordを適用する。

本PLANは承認の意味を新設せず、既存要件の実行gate・schema・negative oracleを追加する。承認者の
本人性やGitHub actorの署名検証は後続のapproval provenance sliceへ分離し、ここで推測しない。
