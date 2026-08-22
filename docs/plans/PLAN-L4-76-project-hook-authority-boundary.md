---
plan_id: PLAN-L4-76-project-hook-authority-boundary
title: "PLAN-L4-76 (add-design): project hook authorityのsystem境界を定義する"
kind: add-design
layer: L4
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #895 CNW-R-06..08／CNW-AC-009..013をL4 system境界とL9 negative oracleへForwardする"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-BOUNDARY-001
responsibility_owner: project-hook-authority-control-plane
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L3-64がCNW-R-06..08とCNW-AC-009..013をcurrent Requirement IRへ束縛している"
contract_postconditions: "physical repository identity、assignment authority、surface projection、bounded lifecycle、結果保全のcomponent／port／state境界がL4↔L9で固定される"
contract_invariants: "assignment rootを明示authorityとし、primary shared treeへのfallback、lexical path同一視、foreign tree自動修復、同期hookでの長期通知待機、raw bypass成功化を禁止する"
contract_failures: "root／HEAD／digest／physical identity不一致はproject_hook_source_stale_or_foreign、期限超過／親process残留はproject_hook_lifecycle_timeoutへfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本sliceはL4/L9 pairを固定し、L5/L8 typed schemaとL6/L7 runtime TDDは後続原子PLANが所有する"
complexity_effect: net_negative
complexity_justification: "SessionStart／doctor／status／dispatchの個別root推測を一つのauthority componentと共通receipt portへ収束する"
removal_trigger: "後継project hook authorityへ全surfaceがreceipt付きmigrationし、v1 consumerが0になった時"
parent_design: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
pair_artifact: docs/test-design/helix/L9-project-hook-authority-boundary-system-test-design.md
backprop_decision: not_required
backprop_decision_reason: "confirmed L3 requirementを意味変更せずL4/L9へ降下するForward sliceである"
agent_slots:
  - { role: se, slot_label: "SE — identity／assignment／surface port境界" }
  - { role: qa, slot_label: "QA — stale／foreign／timeout／result保全system oracle" }
  - { role: tl, slot_label: "TL — hosted root authorityと後続runtime責務" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-76-project-hook-authority-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/project-hook-authority-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-project-hook-authority-boundary-system-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/project-hook-authority-boundary-design.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-64-codex-native-worker-project-hook-authority.md
  requires:
    - docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
    - docs/test-design/helix/codex-native-worker-routing-acceptance.md
  blocks:
    - issue:895-l5-l8-schema
    - issue:895-l6-l7-runtime
---

# project hook authorityのL4↔L9 Forward

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | CNW-AC-009..013をcomponent／portへ配置 | acceptanceのownerが重複なく決まる |
| 2 | identityとassignment authority境界を定義 | lexical fallbackとforeign自動修復が拒否される |
| 3 | lifecycleと結果保全境界を定義 | 15秒／60秒、親terminal、通知worker分離が反証可能になる |
| 4 | L9 negative system oracleを定義 | 5 ACのsystem接合失敗を個別に観測できる |
| 5 | Claude exact-HEAD独立review | blocker 0、runtime実装済みclaim 0 |

本PLANはsystem境界だけを所有する。physical identity schema、receipt schema、process supervisor実装、hook設定変更、
SessionStart／doctor／status／dispatch wiring、Assignment kernel、native Luna spawn実証は後続へ分離する。
