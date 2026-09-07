---
plan_id: PLAN-REVERSE-1614-project-hook-authority-consumer-wiring
title: "Project hook authority consumer配線のfullback"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: fullback
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1614
behavior_contract_id: CNW-HOOK-AUTHORITY-CONSUMER-WIRING-001
responsibility_owner: project-hook-authority
change_slice: atomic
refactor_step: migrate_one_consumer
no_code_decision: no_change
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals: [drift]
contract_preconditions: "Forward PLANとCNW-R-06..08／CNW-AC-009..013、L4〜L6のproject hook authority契約が存在する"
contract_postconditions: "4 consumerの実装証拠を要求・設計・検証へ再接着し、clean authorityからLuna read-afterまで閉じる"
contract_invariants: "Forward実装やcompletionを先取りせず、draft／pending_reverseを維持する"
contract_failures: "片方向link、stale HEAD、authority fallback、consumer間failure bytes不一致、Luna read-after欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward実装に対するReverse pairing vehicleを登録するdocs-only sliceであり、新runtimeのRedを捏造しない"
mutation_oracle_evidence: "Forward合流時にbackfill-pairingの片方向link欠落mutationとconsumer wiring mutationを使用する"
complexity_effect: net_neutral
complexity_justification: "既存実装を複製せず、要求・設計・検証・実provider read-afterの再接着だけを所有する"
removal_trigger: "Issue #1614のterminal fullbackへ統合され、個別pairing vehicleが不要になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
    reason: "CNW-R-06..08／CNW-AC-009..013の意味は変更せず、未接続consumerの実装証拠だけを戻す。"
  - layer: L6-function-design
    decision: impacted
    evidence_path: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
    reason: "pure resolver/provider/projectorと4 consumer composition rootの実接続を照合する。"
  - layer: verification-design
    decision: impacted
    evidence_path: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
    reason: "同一bytes、no-fallback、dispatch side-effect 0、clean Luna read-afterのoracleを照合する。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-1614-project-hook-authority-consumer-wiring.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md
  requires:
    - docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md
  references:
    - docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md
    - src/runtime/project-hook-authority-consumer-wiring.ts
    - tests/project-hook-authority-consumer-wiring.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — 4 consumerとclean Luna read-afterの証拠再接着" }
  - { role: tl, slot_label: "TL — authority fallback禁止とForward再合流判定" }
---

# Project hook authority consumer配線の再接着

## R0 現状採取

本sliceはReverse vehicleだけを登録し、Forwardの実装完了やLuna復旧を先取りしない。

## R1〜R3 再接着

Forward HEADをCNW要求、L6 resolver、L8 oracleへ照合し、SessionStart／doctor／status／dispatchが
同一canonical bytesを消費することを確認する。optional wiringからmandatory admissionへの移行と
clean current authorityでのLuna/xhigh実起動はIssue #1614の残責務として保持する。

## R4 終端条件

current HEADのClaude独立review、required CI、DB convergence、canonical merge、clean-main Luna read-afterが
揃った後だけForward／Reverse PLANとIssue #1614を終端化する。
