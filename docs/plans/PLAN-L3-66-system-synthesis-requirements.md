---
plan_id: PLAN-L3-66-system-synthesis-requirements
title: "PLAN-L3-66 (add-design): System Synthesis capability familyを正本化する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:2026-08-26 System Synthesis段階導入案を整理して要求正本へ追加する"
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 1033
behavior_contract_id: SYSTEM-SYNTHESIS-001
responsibility_owner: system-synthesis-architecture
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "Requirement IR、Design Registry、Universal Workflow、Impact CIの既存authorityが存在する"
contract_postconditions: "SYN-FR-001..004、SYN-R-01..10、SYN-AC-001..014とNOW／FUTURE境界がL3↔L10へ束縛される"
contract_invariants: "System Synthesisを新route／mode／DB authorityにせず、LLM提案をauthority writeへ昇格しない"
contract_failures: "identity曖昧性、route混同、required omission、証拠なしretirement、FUTURE先行実行をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは要求、受入、Issue graph、段階導入authorityだけを追加し、runtime実装をchildへ分離する"
complexity_effect: net_neutral
complexity_justification: "単一構想文書をL3／L10／roadmap／Issue graphへ責務分離する"
removal_trigger: "全childがcurrent requirements baselineへ吸収され、本roadmapが不要になった時"
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
pair_artifact: docs/test-design/helix/system-synthesis-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: tl, slot_label: "TL — authority境界、依存順、既存capability再利用" }
  - { role: qa, slot_label: "QA — route混同、omission、retirement、future mutation" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-25T20:14:38Z"
    tests_green_at: "2026-08-25T20:13:54Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: c7895aff-da7e-47a0-944a-36c68bb4f251
    scope: "PR #1042 HEAD ca473b8fde8142d518736ae6c1d9297e78f48011をClaude Codeが独立検収し、SYN-FR-001..004／SYN-R-01..10／SYN-AC-001..014 exact set、Requirement IR投影、digest順序、negative mutationを実測してblocker 0 approveとした。CI run 32891723302は同一HEADでterminal success、DB projection／replayとcheckpoint／replayは一致。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1042#issuecomment-5416175011。本entryは内容レビューの前置証拠であり、G-REQ.L3昇格は2026-08-26のPO採用指示に別途束縛する。"
    green_commands:
      - kind: smoke
        command: "gh run view 32891723302 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-25T20:13:54Z"
        evidence_path: tests/system-synthesis-requirements.test.ts
        output_digest: "sha256:bf91a2f75a3871dbce2ebfa501918fa2f4565600ce2f4ec63d4b906fcbc429e7"
        result: "terminal success / HEAD ca473b8fde8142d518736ae6c1d9297e78f48011"
generates:
  - { artifact_path: docs/plans/PLAN-L3-66-system-synthesis-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/system-synthesis-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/system-synthesis-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/governance/system-synthesis-rollout-roadmap.md, artifact_type: markdown_doc }
  - { artifact_path: tests/system-synthesis-requirements.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-ir-shadow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  requires: []
  references:
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    - docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md
  blocks:
    - issue:1034
    - issue:1035
    - issue:1036
    - issue:1037
    - issue:1038
    - issue:1039
    - issue:1040
    - issue:1041
---

# System Synthesis要求authority

## PO承認記録

2026-08-26、POの「新構想でブレイクスルーを起こしてくれ」という採用・推進指示を、
本System Synthesis capability familyのL3正本化に対するG-REQ.L3承認として記録する。
この承認はNOW childの依存順実装を許可するが、FUTURE parking解除、配布cutover、secret／本番操作の
action-binding approvalを代替しない。

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 構想をauthority軸と責務で棚卸し | NOW／FUTURE、既存再利用、非対象が分離される |
| 2 | 親#1033と原子的childを起票 | dependency／parkingがmachine-readableになる |
| 3 | L3要求とL10 acceptanceへ分割 | requirement／AC exact setが成立する |
| 4 | rollout roadmapとcatalogを接続 | 実装順とFUTURE gateが一意になる |
| 5 | targeted test、PLAN lint、独立review | blocker 0、main read-after成立 |

元の単一構想ファイルはcanonical artifactではない。L3／L10／roadmap／Issue graphへ内容を移し、検証可能な
正本が成立した後に削除する。runtime、registry、DB、CI behaviorの実装は本PLANへ混載しない。
