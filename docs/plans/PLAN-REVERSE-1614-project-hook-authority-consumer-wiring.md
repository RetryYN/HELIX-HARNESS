---
plan_id: PLAN-REVERSE-1614-project-hook-authority-consumer-wiring
title: "PLAN-REVERSE-1614: project hook authority consumer配線の設計fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
forward_routing: L6
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: complete
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1614
behavior_contract_id: CNW-HOOK-AUTHORITY-CONSUMER-WIRING-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: domain_service
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "drift"
contract_preconditions: "PLAN-L7-1614の実装、L4/L6/L8のconfirmed契約、4 consumerのtargeted regression、mutation evidenceが存在する"
contract_postconditions: "Forward実装PLANと本Reverseを双方向に接続し、実装で得たproject hook authorityの事実をL4/L6/L8へ再接着する"
contract_invariants: "cwd／env／remote fallback禁止、4 surfaceの同一snapshot消費、dispatch前fail-close、要求意味不変を維持する"
contract_failures: "Forward／Reverse双方向link欠落、surface別再計算、wrong root／HEAD／digest受理、clean-main Luna read-after未了をcompletionへ昇格しない"
tdd_red_required: false
tdd_red_waiver_reason: "新しいruntime挙動を追加しない設計fullbackであり、U-BACKFILL-006の実repo RedとPLAN-L7-1614の既存targeted／mutation oracleを再利用する。"
mutation_oracle_evidence: "U-BACKFILL-006が本Reverse欠落時にPLAN-L7-1614をreverseOrphansへ出した実測と、U-CNWHOOKWIRE-003／005のdispatch admission変異killを再利用する。"
complexity_effect: net_neutral
complexity_justification: "既存L4/L6/L8契約と実装PLANを接着するだけで、新しいauthority、schema、runtime分岐を追加しない。"
removal_trigger: "PLAN-L7-1614と本Reverseがclean-main Luna read-afterを含む終端証拠へ統合された時点で履歴証拠として保持する。"
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/context-window-lifecycle-management.md
    reason: "CNW-R-06..08とCNW-AC-009..013の意味は変更せず、既存project hook authorityをcurrent consumerへ投影する。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md
    reason: "worker wrapperがresolved project hook authorityを受け取るcomposition境界を実装と照合した。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
    reason: "SessionStart、doctor、status、dispatchが同一snapshotを消費する実配線を設計へ反映した。"
  - layer: verification-design
    decision: updated
    evidence_path: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
    reason: "wrong root／HEAD／digest、unavailable、surface divergence、dispatch side effectの反例をcurrent実装へ束縛した。"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-001, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-003, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-005, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-007, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-1614-project-hook-authority-consumer-wiring.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md
  requires:
    - docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md
  references:
    - docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md
    - "issue:895"
    - "issue:1614"
    - docs/design/helix/L4-basic-design/worker-wrapper-admission.md
    - docs/design/helix/L6-function-design/project-hook-authority-resolver.md
    - docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
    - tests/project-hook-authority-consumer-wiring.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — Forward／Reverse linkと4 surface反例" }
  - { role: tl, slot_label: "TL — 設計fullbackとclean-main終端境界" }
---

# project hook authority consumer配線のReverse fullback

## R0 観測

実セッションが修正済みworktreeではなく古い共有rootのGuardを読み、Luna spawn前に旧policyで拒否された。
既存resolver/provider/projectorは存在したが、SessionStart、doctor、status、native dispatchへ同じauthorityを渡す
composition rootが欠けていた。全回帰はこのadd-implにReverse pairがないことも独立に検出した。

## R1〜R3 再構成

要求意味は変更せず、Control Planeが解決したsnapshotを4 surfaceへ一度だけ投影する。cwd、environment、remote
HEADからの推測fallbackは追加せず、wrong root／HEAD／digestまたはsnapshot unavailableではdispatch前に同じfailureへ閉じる。
実装で確認したcomposition境界、surface equality、negative oracleを既存L4/L6/L8へ戻した。

## R4 再合流条件

Forward／Reverse双方向link、targeted regression、mutation、exact-HEAD独立review、required CI、DB convergenceを
候補HEADへ束縛する。merge後はclean current authorityからLuna/xhighを実起動し、agent ID、実効HEAD、terminal resultを
read-afterするまでIssue #1614のcompletion claimを許可しない。
