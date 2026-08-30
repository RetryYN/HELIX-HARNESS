---
plan_id: PLAN-REVERSE-706-ci-verification-plan
title: "PLAN-REVERSE-706: CI Verification PlanをCI System Synthesisへ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1269
behavior_contract_id: CI-VERIFICATION-PLAN-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
forward_routing: L5
promotion_strategy: reuse-as-is
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1269 Verification PlanのReverse fullback（親 #1206）"
contract_preconditions: "PLAN-L7-706、L6／L8 pair、PR #1240 exact-HEAD review、canonical merge、post-main CIが存在する"
contract_postconditions: "Verification Planのrequired obligation exact partitionをL3／L6／L8へ再照合し、#1207／#1208へ正規入力として渡す"
contract_invariants: "scheduler、deferred E2E、workflow配線を本Reverseへ混載せず、terminal bundleのreview／merge／read-after前にcompletion claimを許可しない"
contract_failures: "wrong HEAD、stale review、双方向link欠落、required obligation縮退、deferred割当の証拠欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward実装とU-CIVPLAN-001〜012を再利用するdocs-only Reverse vehicleであり、新しいRedを捏造しない"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/backfill-pairing.test.tsでForward双方向link欠落mutationをredとしてkillし、tests/ci-verification-plan.test.ts U-CIVPLAN-002〜012でrequired削除・重複・wrong HEAD・stale digest・deferred receipt不整合mutationを個別にkillする"
complexity_effect: net_neutral
complexity_justification: "Verification Planを再実装せず、requirements／design／verification／main evidenceの再接着だけを所有する"
removal_trigger: "CI System Synthesis終端Reverseが本証拠を統合し、個別fullback参照が不要になった時"
parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md
pair_artifact: docs/test-design/helix/L8-ci-verification-plan-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
    reason: "CIS-R-07〜09のtyped partition、fallback、deferred義務は実装と一致し、新しい要求意味を追加しない。"
  - layer: L6-function-design
    decision: not_impacted
    evidence_path: docs/design/helix/L6-function-design/ci-verification-plan.md
    reason: "work authority、candidate HEAD、registry digest、riskからexact partitionを生成する責務境界が実装と一致する。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/helix/L8-ci-verification-plan-unit-test-design.md
    reason: "U-CIVPLAN-001〜012がrequired omission、wrong HEAD、stale registry、deferred不整合を個別に検出する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "外部system boundary、provider interface、利用者契約を変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "typed plan schemaとpartition詳細はForward L6実装に閉じ、追加責務はない。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-706-ci-verification-plan.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/ci-verification-plan-terminal-fullback-evidence.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L3-73-ci-system-synthesis.md
    - docs/plans/PLAN-L7-706-ci-verification-plan.md
  references:
    - issue:1269
    - issue:1206
    - issue:1207
    - issue:1208
    - pull:1240
    - docs/plans/PLAN-L7-706-ci-verification-plan.md
    - src/runtime/ci-verification-plan.ts
    - tests/ci-verification-plan.test.ts
  blocks:
    - issue:1208
agent_slots:
  - { role: qa, slot_label: "QA — obligation exact partitionとdeferred証拠のmain再照合" }
  - { role: tl, slot_label: "TL — CI System Synthesis接着と#1208解放" }
---

# CI Verification PlanのReverse fullback

## R0 現状採取

Forward candidateはPR #1240のHEAD `76d1ffb8c9e11b50d744e90efa37a2a2c650a4e0`で収束した。Claude Code exact-HEAD reviewはblocker 0、receipt digest `sha256:9fed5ec73911409b7a5dddae4db09291ed1b28737790ed9a6f03e72a36e9ace7`、Ready CI `33323968657`はterminal successである。canonical merge `e6293f074736e388f6020cffff0e16741f3bdc88`とpost-main harness-check `33324321701` success、CodeQL `33324321840` successをR0の事実基準とする。

## R1 観測契約

- work authority、candidate/base HEAD、registry digest、risk、local／boundary／global／deferred exact partitionを実装とU-CIVPLAN-001〜012から採取した。
- required obligationを別greenで相殺せず、unknown／high-risk／selector・schema・security変更をfullへfail-closeすることを確認した。
- deferred義務はtarget profileとreceiptを必須とし、scheduler／runner配置をVerification Planへ混載しない。

## R2 As-Is照合

CIS-R-07〜09、L6 Verification Plan、L8 U-CIVPLAN-001〜012はruntimeの責務境界と一致する。current Impact CI compatibility inputは一方向変換対象であり、path-only decisionをprimary identityへ戻していない。

## R3 意図照合

要求正本の意味変更は不要である。Verification Planは必要な証明義務を決定し、配置最適化は#1207、deferred回収とworkflow E2Eは#1208へ分離されている。よってrequirements／L4／L5／L6／L8は`not_impacted`、Forward再入先をL5に維持する。

## R4 候補終端条件

Forward／Reverse PLANの双方向link、targeted oracle、PLAN gates、current-HEAD CI、Claude exact-HEAD reviewを揃える。Reverse candidateのcanonical mergeとpost-main read-afterが成立するまで`completion_claim_allowed:false`と`backfill_state:pending_reverse`を維持し、Issue #1206を先取りcloseしない。
