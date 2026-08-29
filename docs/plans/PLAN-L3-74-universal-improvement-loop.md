---
plan_id: PLAN-L3-74-universal-improvement-loop
title: "PLAN-L3-74: Universal Improvement LoopをL3/L10へfreezeする"
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
  approved_at: "2026-08-29T14:24:46Z"
  plan_id: PLAN-L3-74-universal-improvement-loop
  approval_record_id: L3-PO-1210-001
  approval_source: github_pr_comment
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1222#issuecomment-5462947224"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1210 Universal Improvement Loopを要件正本へ降ろす"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1210
behavior_contract_id: UNIVERSAL-IMPROVEMENT-LOOP-001
responsibility_owner: universal-improvement-loop-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "既存観測／System Synthesis／Infinity Loopを置換せず、決定的自己改善capabilityとして上流要求を追加する。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "Infinity Loop、System Synthesis、Requirement Re-entry、REFACTORING、OPS、TERのauthority境界が読める"
contract_postconditions: "UIL 7 FR／14 R／22 ACと8責務sliceがL3/L10でexact対応し、AI間loopと機械的自己改善loopが分離される"
contract_invariants: "観測とAI提案はauthorityを直接変更せず、change class／capability expansion／routeを混同せず、局所改善で全体悪化を相殺しない"
contract_failures: "unknown source、wrong revision、stale evidence、duplicate candidate、意味変更偽装、予測の実測偽装、別HEAD証拠混載を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10 authorityと量閉じoracleの起草であり、runtime実装を8 child sliceへ分離する。"
complexity_effect: justified_positive
complexity_justification: "既存detector、event journal、System Synthesis、routeを再利用し、一つのtyped improvement aggregateで接続する最小追加。"
removal_trigger: "System Synthesisが同じ候補・routing・outcome・recurrence契約をcurrent capabilityとして完全内包した時。"
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
pair_artifact: docs/test-design/helix/universal-improvement-loop-acceptance.md
dependencies:
  parent: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  requires: []
  blocks: []
  references:
    - "issue:1210"
    - "issue:30"
    - "issue:1033"
    - "issue:1034"
    - "issue:1160"
    - "issue:1169"
    - "issue:1170"
    - "issue:1174"
    - "issue:1204"
agent_slots:
  - { role: aim, slot_label: "AIM — semantic impactと全体最適境界" }
  - { role: qa, slot_label: "QA — 14 R／22 ACとnegative oracle" }
  - { role: tl, slot_label: "TL — authority／route／既存capability責務分離" }
generates:
  - { artifact_path: docs/plans/PLAN-L3-74-universal-improvement-loop.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/universal-improvement-loop-acceptance.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# Universal Improvement Loop authorityのfreeze

本PLANはIssue #1210のscope authorityをL3↔L10へ降ろす起草sliceである。POのL3 human approvalは記録済みであり、
独立reviewとG3 freezeを経て後続runtime sliceへ進む。Issue本文だけをruntime実装authorityとして使わない。

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 既存Infinity Loop／System Synthesis／OPS／TERを棚卸し | 重複、extends、governed_byが分類される |
| 2 | UIL 7 FR／14 R／22 ACをL3/L10化 | exact setとnegative oracleが一致する |
| 3 | 8責務sliceへ分割 | 依存順と非対象が明示される |
| 4 | PO L3 human approval／G3 freeze | confirmed化とprojection追従が成立する |
| 5 | Claude exact-HEAD review／main read-after | 後続runtime sliceを開始できる |
