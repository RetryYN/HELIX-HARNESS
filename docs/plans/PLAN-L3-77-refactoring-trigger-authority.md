---
plan_id: PLAN-L3-77-refactoring-trigger-authority
title: "PLAN-L3-77: REFACTORING trigger policyとRF0 admissionをL3/L10へfreezeする"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:2026-09-02 HELIX_REFACTORING_TRIGGER_IMPROVEMENT_DIRECTIVE_v0.1.mdを最適化して正本へ取り込む"
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1353
behavior_contract_id: REFACTORING-TRIGGER-ADMISSION-001
responsibility_owner: system-synthesis-refactoring-trigger-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "本PLAN自体がRequirement Re-entryのauthority sliceであり、L3/L10 pairへ直接再freezeするため追加backprop vehicleは不要。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "System Synthesis、UIL、Universal Workflow、REFACTORING RF0-RF6のauthorityがcurrent mainに存在する"
contract_postconditions: "SYN-R-11/R-12とSYN-AC-015..020がtrigger policy、RF0 admission、anti-starvationを閉じる"
contract_invariants: "新route／DB／event busを作らず、単一metricやsafety-netだけでrefactorを発火せず、意味変更をREFACTORINGへ入れない"
contract_failures: "stale policy、wrong baseline、partial scan、missing source、unknown scope、semantic change、runtime hardcodeを拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10 authorityだけを更新し、policy registry、evaluator、adapter、projectionを後続原子sliceへ分離する。"
complexity_effect: justified_positive
complexity_justification: "既存UIL event／findingとSystem Synthesis RF0を2契約で接続し、251行の独立指示書を新正本として残さない。"
removal_trigger: "System Synthesisのcurrent requirements baselineへ吸収され、後続runtime全sliceがmain read-afterまで終端した時。"
parent_design: docs/design/helix/L3-requirements/system-synthesis-requirements.md
pair_artifact: docs/test-design/helix/refactoring-trigger-admission-acceptance.md
dependencies:
  parent: docs/design/helix/L3-requirements/system-synthesis-requirements.md
  requires: []
  blocks: []
  references:
    - "issue:1353"
    - "issue:1033"
    - "issue:1040"
    - "issue:1170"
    - "issue:1210"
agent_slots:
  - { role: tl, slot_label: "TL — UIL／System Synthesis／Universal Workflow責務境界" }
  - { role: qa, slot_label: "QA — trigger policy／admission／anti-starvation mutation" }
generates:
  - { artifact_path: docs/plans/PLAN-L3-77-refactoring-trigger-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/refactoring-trigger-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/refactoring-trigger-candidate-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-refactoring-trigger-candidate-projection.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/refactoring-trigger-admission-acceptance.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
---

# REFACTORING trigger authorityのfreeze

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 既存UIL trigger、System Synthesis RF0-RF6、Universal Workflow routingを棚卸し | owner重複と新規Coreがない |
| 2 | Trigger PolicyとRF0 AdmissionをL3/L10へ追加 | 6 R／12 ACがexact対応する |
| 3 | 元指示書を処分 | root原稿をcurrent authorityとして残さない |
| 4 | PO L3 approval、independent review、G3再freeze | 後続runtime sliceを開始できる |

本PLANではruntime、registry、DB、CLIを変更しない。PO L3 approval前はdraft authorityとして保持する。design catalogは
物理所在だけを登録し、current authorityやG3 freezeへ投影しない。承認後に後続をpolicy、evaluator、admission、projection、anti-starvation、
dogfood／Reverseへ原子的に分割する。
