---
plan_id: PLAN-REVERSE-705-ci-execution-telemetry
title: "PLAN-REVERSE-705: CI execution telemetryをCI System Synthesisへ再接着する"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: fullback
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1238
behavior_contract_id: CI-EXECUTION-TELEMETRY-001
responsibility_owner: ci-execution-telemetry
change_slice: atomic
refactor_step: introduce_contract
no_code_decision: no_change
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1204 CI execution telemetryのReverse fullback vehicle"
contract_preconditions: "PLAN-L7-704の原子実装、L6／L8 pair、current HEAD reviewとCI証拠が存在する"
contract_postconditions: "telemetry schemaとprojectionの実測をCI System SynthesisのL3／L6／L8へ再接着し、#1205以降へ正規入力として渡す"
contract_invariants: "CI selection、scheduler、workflow、DB ingestionを本Reverseで推測変更せず、Forward完了前はdraft／pending_reverse／completion_claim_allowed=falseを維持する"
contract_failures: "wrong HEAD、stale review、双方向link欠落、required obligation縮退、runner／artifact／failure履歴の証拠欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward実装と既存U-TELE oracleを再利用するdocs-only Reverse vehicleであり、新しいRedを捏造しない"
mutation_oracle_evidence: "Forward合流時にbackfill-pairingの双方向link欠落mutationとU-TELE-001〜010を再実行し、本slice単独では完成を主張しない"
complexity_effect: net_neutral
complexity_justification: "telemetryを再実装せず、requirements／design／verification／main evidenceの再接着だけを所有する"
removal_trigger: "CI System Synthesis終端Reverseが本証拠を統合し、個別fullback参照が不要になった時"
parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md
pair_artifact: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: impacted
    evidence_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
    reason: "CIS-R-02／03のevent identity、failure履歴、cost nodeを実測へ接着する。"
  - layer: L6-function-design
    decision: impacted
    evidence_path: docs/design/helix/L6-function-design/ci-execution-telemetry.md
    reason: "typed event、DAG、critical path、series分離を実装と照合する。"
  - layer: verification-design
    decision: impacted
    evidence_path: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md
    reason: "U-TELE-001〜010とmutation evidenceをcurrent HEADへ束縛する。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-705-ci-execution-telemetry.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L3-73-ci-system-synthesis.md
  references:
    - "issue:1238"
    - "issue:1204"
    - docs/plans/PLAN-L7-704-ci-execution-telemetry.md
    - src/runtime/ci-execution-telemetry.ts
    - tests/ci-execution-telemetry.test.ts
  blocks:
    - "issue:1205"
agent_slots:
  - { role: qa, slot_label: "QA — telemetry／failure history／artifact edgeのmain再照合" }
  - { role: tl, slot_label: "TL — CI System Synthesis接着と#1205解放" }
---

# CI execution telemetryのReverse fullback

## R0 現状採取

本sliceはReverse vehicleだけを登録し、Forward実装のmerge、Claude review、main read-afterを先取りしない。

## R1〜R3 再接着

PLAN-L7-704合流後にCIS-R-02／03、L6 telemetry contract、L8 U-TELE-001〜010へ実測を戻す。
CI選定とschedulerは後続#1205以降の責務として分離する。

## R4 終端条件

current HEADのClaude独立review、required CI、canonical merge、DB convergence、post-main read-afterが揃った後だけ
Forward／Reverse PLANとIssue #1204を終端化し、#1205をcurrent mainへ再接着する。
