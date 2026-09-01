---
plan_id: PLAN-L3-73-ci-system-synthesis
title: "PLAN-L3-73 (add-design): CI System SynthesisをL3/L10へ分解する"
kind: add-design
layer: L3
drive: agent
status: confirmed
backfill_state: complete
completion_claim_allowed: true
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-08-29T14:23:37Z"
  plan_id: PLAN-L3-73-ci-system-synthesis
  approval_record_id: L3-PO-1034-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1209#issuecomment-5462941573"
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-29T17:24:17Z"
    tests_green_at: "2026-08-29T17:24:17Z"
    verdict: approve_after_fixes
    worker_model: codex
    reviewer_model: codex-intra-runtime
    reviewer_session_id: "01a04e88-9b49-7e53-82b4-53b56c30ca25"
    reviewed_head_sha: 9efc14df7b24f3be2006059fc7b6325373bf9c80
    scope: "draft HEADのL3/L10と新規要求閉包oracleをconfirmed昇格前に独立監査した。5 FR／15 R／15 AC、R↔AC一対一、pair、#1204〜#1208 owner、安全非縮退、catalog／G3 digestに内容blocker 0。status遷移、evidence束縛、全6 oracle greenをconfirmation条件とした。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/ci-system-synthesis-requirements.test.ts -t 'CIS-AUTH-00[2-6]' --reporter=verbose"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-29T17:21:42Z"
        evidence_path: tests/ci-system-synthesis-requirements.test.ts
        output_digest: "sha256:5e1808816526bb7862d6ef23a48bd3abf4a937c5d344a91a75d8a89135676ea3"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:2026-08-29 CI責務分離、作業単位CI導出、局所最適、critical-path全体統制によるCI改革を要求化する"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1034
behavior_contract_id: CI-SYSTEM-SYNTHESIS-001
responsibility_owner: ci-system-synthesis
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "System Synthesis、Impact CI、Module Registry、Lite selector、full regression shard authorityが存在する"
contract_postconditions: "CIS-FR-001..005、CIS-R-01..15、CIS-AC-001..015と#1204..1208の責務がL3↔L10でexact対応する"
contract_invariants: "required verificationを最適化対象から外し、selector／scheduler／LLMが証明義務を削除しない"
contract_failures: "unknown impact、orphan obligation、wrong HEAD、stale digest、unauthorized skip、deferred回収欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10要求とnegative oracle設計だけを追加し、runtime実装を#1204..1208へ分離する"
complexity_effect: justified_positive
complexity_justification: "個別selectorとworkflow分岐を一つの責務registry／verification planへ収束させるための最小追加aggregate"
removal_trigger: "CI compositionがSystem Synthesis正本へ完全吸収され、本差分authorityが不要になった時"
parent_design: docs/design/helix/L3-requirements/system-synthesis-requirements.md
pair_artifact: docs/test-design/helix/ci-system-synthesis-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
dependencies:
  parent: docs/design/helix/L3-requirements/system-synthesis-requirements.md
  requires: []
  blocks:
    - issue:1204
    - issue:1205
    - issue:1206
    - issue:1207
    - issue:1208
  references:
    - issue:1033
    - issue:1002
    - issue:1084
    - docs/design/helix/L3-requirements/github-ci-performance-requirements.md
    - docs/plans/PLAN-REVERSE-705-ci-execution-telemetry.md
    - docs/plans/PLAN-REVERSE-706-ci-verification-plan.md
    - docs/plans/PLAN-REVERSE-707-ci-critical-path-scheduler.md
    - docs/plans/PLAN-REVERSE-717-ci-deferred-obligation-recovery.md
agent_slots:
  - { role: tl, slot_label: "TL — CI責務境界、既存selector再利用、依存順" }
  - { role: qa, slot_label: "QA — obligation omission、stale receipt、deferred欠落mutation" }
generates:
  - { artifact_path: docs/plans/PLAN-L3-73-ci-system-synthesis.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/ci-system-synthesis-acceptance.md, artifact_type: test_design }
  - { artifact_path: tests/ci-system-synthesis-requirements.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# CI System Synthesis要求差分

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 現行Impact CI／Lite／Module／shard責務を棚卸し | 重複ownerと不足責務が分類される |
| 2 | telemetry、registry、plan、scheduler、recoveryを分離 | 5 FR／15 R／15 ACがexact対応する |
| 3 | #1204〜#1208へ原子分割 | 実装順と非対象がmachine-readableになる |
| 4 | L3人間確認 | PO承認を`l3_human_approval`へ束縛しconfirmedへ進める |
| 5 | child実装／mutation／GitHub read-after | 安全性を縮退せずwall-clockを短縮する |

本PLANはCI高速化を検査削減と同義にしない。required verification exact setの導出と実行配置を分離し、
省略した義務を後段で回収できない場合は高速化を拒否する。

## 終端収束

2026-09-01にchild exact set #1204〜#1208がcompletedへ収束した。

- #1204: terminal fullback `e2dc7325`、post-main harness-check `33311317459` success
- #1205: merge `68269322`、post-main harness-check `33317560785` success
- #1206: merge `f1fd9853`、Ready CI `33349953595`、post-main harness-check `33350345875` success
- #1207: merge `db991c0b`、post-main harness-check `33412283392` success
- #1208: terminal fullback `1127933d`、post-main harness-check `33460518940` success

Telemetry、Responsibility Registry、Verification Plan、critical-path scheduler、deferred obligation recoveryを
Forward／Reverse／main read-afterまで一巡したため、要求意味を変更せず`backfill_state: complete`および
`completion_claim_allowed: true`へ遷移する。Issue #1034のcloseは本変更のClaude exact-HEAD review、CI、DB convergence、
canonical merge後のmain read-afterを記録してから行う。
