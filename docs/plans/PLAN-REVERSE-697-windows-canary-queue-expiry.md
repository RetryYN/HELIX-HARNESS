---
plan_id: PLAN-REVERSE-697-windows-canary-queue-expiry
title: "PLAN-REVERSE-697: Windows canary bounded queue／expiryのfullback"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: fullback
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1151
behavior_contract_id: WINDOWS-LITE-CANARY-QUEUE-EXPIRY-001
responsibility_owner: windows-lite-canary-admission
change_slice: atomic
refactor_step: introduce_contract
no_code_decision: no_change
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1145 Windows canary bounded queue／expiryのReverse vehicle"
contract_preconditions: "PLAN-L3-70のconfirmed authorityと#1135の原子実装scopeが存在する"
contract_postconditions: "将来のPLAN-L7-697実装証拠をL3／L6／L8へ再接着するReverse vehicleがmain上で一意になる"
contract_invariants: "Forward実装や#1141の初期policy値を先取りせず、pending_reverse／completion_claim_allowed=falseを維持する"
contract_failures: "wrong HEAD、stale review、双方向link欠落、DB divergence、#1136責務混載をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward実装前にReverse pairing vehicleだけを登録するdocs-only sliceであり、未実装kernelのRedを捏造しない"
mutation_oracle_evidence: "Forward合流時にbackfill-pairing gateの双方向link欠落mutationを使用し、本sliceでは実装成功を主張しない"
complexity_effect: net_neutral
complexity_justification: "Forward実装を再実装せず、requirements／design／test／main evidenceの再接着vehicleだけを所有する"
removal_trigger: "#1106 terminal Reverseが本証拠を統合し、個別fullback参照が不要になった時"
parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md
pair_artifact: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: impacted
    evidence_path: docs/design/helix/L3-requirements/windows-lite-canary-admission-requirements.md
    reason: "WLCA-R-02／04／05のqueue／expiry境界へ実測を戻す。初期policy値は#1141へ分離する。"
  - layer: L6-function-design
    decision: impacted
    evidence_path: docs/design/helix/L6-function-design/windows-lite-canary-admission.md
    reason: "active／waiting bound、決定的queue、heartbeat／fence判定を実装と照合する。"
  - layer: verification-design
    decision: impacted
    evidence_path: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md
    reason: "U-WLCA-002〜010／015とcapacity mutation evidenceをcurrent HEADへ束縛する。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-697-windows-canary-queue-expiry.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
  requires:
    - docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
  references:
    - "issue:1145"
    - docs/plans/PLAN-L7-697-windows-canary-queue-expiry.md
    - src/runtime/windows-lite-canary-admission.ts
    - tests/windows-lite-canary-admission.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — Forward／Reverse証拠とmain read-after" }
  - { role: tl, slot_label: "TL — #1135終端と#1136責務境界" }
review_evidence:
  - reviewer: "Claude Code / Opus"
    review_kind: cross_agent
    reviewed_at: "2026-08-28T08:55:20Z"
    tests_green_at: "2026-08-28T08:52:54Z"
    verdict: approve
    worker_model: codex:gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: c18c830c-b048-4a74-8821-23282016d4db
    reviewed_head_sha: 8ab9bf4e03cfcfd8b749df1118084fbcc4f828d7
    scope: "PR #1146のReverse vehicle exact HEADを独立検収し、blocker 0でapprove。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/1146#issuecomment-5450503358。confirmedは計画の検収済み状態だけを表し、backfill_state=pending_reverseとcompletion_claim_allowed=falseはForward merge後のR4まで維持する。"
    green_commands:
      - kind: smoke
        command: "gh run view 33155597731 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-28T08:52:54Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:d1bad7bfaf731af4159cf498b0ae3117e3fd0ce58c60c391b9165eab053b88a2"
        result: "status=completed conclusion=success headSha=8ab9bf4e03cfcfd8b749df1118084fbcc4f828d7"
---

# Windows canary bounded queue／expiryの再接着

## R0 現状採取

本sliceはReverse vehicleだけを先行登録し、Forward実装や完了証拠を捏造しない。

## R1〜R3 再接着

PLAN-L7-697合流後にL3のqueue／expiry要求、L6 pure evaluator、L8 oracleと実装を双方向に照合する。
初期policy instanceは#1141へ、Actions接続は#1136へ残し、本Reverseから値や副作用を補完しない。

## R4 終端条件

current HEADのClaude独立review、required CI、DB convergence、canonical merge、post-main read-afterが揃った後だけ
Forward／Reverse PLANとIssue #1135を終端化する。
