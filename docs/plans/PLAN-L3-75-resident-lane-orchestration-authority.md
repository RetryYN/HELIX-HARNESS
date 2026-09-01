---
plan_id: PLAN-L3-75-resident-lane-orchestration-authority
title: "PLAN-L3-75 (add-design): resident laneのL1/L3 authorityを正本化する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-09-01T16:15:00Z"
  plan_id: PLAN-L3-75-resident-lane-orchestration-authority
  approval_record_id: L3-PO-859-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1299#issuecomment-5497074795"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #826 resident/native/CLI worker分離、Sol TL→Luna worker、Issue #1293 Cursor Cloud worker早期実用化"
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 859
behavior_contract_id: RESIDENT-LANE-ORCHESTRATION-001
responsibility_owner: resident-lane-requirements-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "本PLAN自身がL1/L3へ要求を還流して正本化する上流sliceであり、追加の下位層からのbackpropは不要。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "#819/#826/#859のIssue decision、既存Work Graph/event/review/bench ownerをread-afterできる"
contract_postconditions: "resident lane、native subagent、CLI worker、scope/branch/lease、review循環、Cursor model/effort policyがL1/L3/L10/L12へ束縛される"
contract_invariants: "Issue/PLAN択一＋branch必須、一branch一writer、worker自己review禁止、provider session非正本、requirements-firstを維持する"
contract_failures: "Issue-only runtime authority、Issue/PLAN併記、branch欠落、lane/native/CLI混同、Terra fallback、unbenchmarked effort推測を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは要求authorityとacceptanceだけを追加し、runtime実装を#860/#821/#854/#1293へ分離する。"
complexity_effect: justified_positive
complexity_justification: "既存ownerを再利用し、散在したIssue decisionを単一versioned requirement pairへ収束する。"
removal_trigger: "L1/L3/L10/L12とRequirement IRが後継versioned registryへ完全吸収され、本移行PLANのconsumerが0になった時。"
parent_design: docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md
pair_artifact: docs/test-design/helix/resident-lane-orchestration-acceptance.md
agent_slots:
  - { role: tl, slot_label: "TL — resident/native/CLI責務境界とruntime解放条件" }
  - { role: qa, slot_label: "QA — scope択一、worker権限、model/effort negative oracle" }
review_evidence: []
dependencies:
  parent: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
  requires: []
  references:
    - issue:819
    - issue:826
    - issue:859
    - issue:1293
    - issue:1294
    - issue:1295
    - issue:1296
  blocks:
    - issue:860
    - issue:1293
generates:
  - { artifact_path: docs/plans/PLAN-L3-75-resident-lane-orchestration-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/resident-lane-orchestration-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/resident-lane-orchestration-recognition.md, artifact_type: test_design }
  - { artifact_path: docs/governance/rlo-819-approval-packet-2026-08-20.md, artifact_type: markdown_doc }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/resident-lane-orchestration-requirements.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-canonical-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# Resident lane requirements authority収束

## 工程

1. 固定digestのv0.2候補とapproval packetを履歴sourceとして取り込む。
2. Issue #826/#1293と現行requirementsを照合し、v0.3 draftへ一方向version-upする。
3. L1↔L12、L3↔L10、Requirement IR、design catalogを同じbehavior contractへ束縛する。
4. PO L3 approval、独立review、CI、doctor、DB convergence後だけconfirmedへ昇格する。
5. main read-after後に#860と#1293 runtime sliceを解放する。

Issue本文や共有working treeだけをcurrent authorityとしてruntimeへ流用しない。
