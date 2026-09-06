---
plan_id: PLAN-L3-90-requirement-formation-scoped-admission
title: "PLAN-L3-90 (add-design): 根拠付き要求形成と影響限定再freeze候補"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-09-06T00:37:45Z"
  plan_id: PLAN-L3-90-requirement-formation-scoped-admission
  approval_record_id: L3-PO-1556-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1556#issuecomment-5555835060"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive: 2原稿の候補整理依頼と、後日の対象要件GOを区別して記録する"
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 1556
behavior_contract_id: REQUIREMENT-FORMATION-SCOPED-ADMISSION-AUTHORITY-001
responsibility_owner: requirement-formation-scoped-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "承認済み候補を独立検収・正本昇格より前にcurrentやruntimeへ先行投影しない。"
no_code_decision: no_change
ddd_modeling_decision: policy
contract_preconditions: "2原稿とDiscovery、Authoring Admission、Requirement Re-entryを照合できる"
contract_postconditions: "3 BR、12要件、18 AC、3 OPと原稿traceを候補へ保全する"
contract_invariants: "意味採否・技術freeze・実行認可を分離し未承認policyを稼働しない"
contract_failures: "相談の承認化、自己権限拡張、旧承認流用、原稿欠落、無関係scope停止を拒否"
tdd_red_required: false
tdd_red_waiver_reason: "候補整理と対象revisionの承認記録のみ。原文一致、ID、trace、参照を検証しruntimeを変更しない。"
complexity_effect: net_negative
complexity_justification: "既存Discovery、Authoring、Re-entry、GitHub入口を再利用し別engineを作らない。"
removal_trigger: "候補承認・独立検収・canonical version-up・main read-after・IR admission後にcurrentへ移管"
parent_design: docs/governance/candidates/requirement-formation-scoped-admission-requests.md
pair_artifact: docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md
dependencies:
  parent: docs/governance/candidates/requirement-formation-scoped-admission-requests.md
  requires: []
  references:
    - issue:1556
    - issue:282
    - issue:185
    - issue:186
    - issue:192
    - issue:217
    - issue:218
    - issue:1169
    - issue:1292
    - issue:396
    - issue:397
    - issue:592
    - issue:188
    - issue:1534
    - issue:1494
    - issue:1500
  blocks: []
generates:
  - { artifact_path: docs/governance/candidates/requirement-formation-scoped-admission-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirement-formation-scoped-admission-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirement-formation-scoped-admission-recognition.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirement-formation-scoped-admission-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-90-requirement-formation-scoped-admission.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — 既存authority境界" }
  - { role: qa, slot_label: "QA — 原文保全とtrace" }
review_evidence: []
---

# 要求形成と影響限定Admissionの候補整理

#1556が候補所有。RF/RC/GHの後続runtimeは責務別に分離する。
現行policy・IR・runtimeを変更しない。L3-PO-1556-001で候補要件の承認を記録し、独立検収後に正規version-upする。
原文保全、3 BR→12要件→18 AC→3 OP、全原稿移管traceと独立検収を収束条件とする。
原稿削除はGit保全・原文一致の検証後だけ実施し、共有rootの他作業は変更しない。
main未統合・独立検収前・runtime未実装を完成としない。5 PR上限を維持し、空き枠で候補PR化する。
