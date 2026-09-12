---
plan_id: PLAN-L3-1358-three-lane-capacity-profile-v05
title: "PLAN-L3-1358: 三社レーン動的capacity profile v0.5"
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
  approved_at: "2026-09-12T10:22:05Z"
  plan_id: PLAN-L3-1358-three-lane-capacity-profile-v05
  approval_record_id: L3-PO-1358-003
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1358#issuecomment-5645297663"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:Codex／Cursor workerを定常3・最大5、Claude reviewerを定常2とする将来capacityを要求へ保持する"
created: 2026-09-09
updated: 2026-09-12
owner: Codex / TL
github_issue_id: 1358
behavior_contract_id: THREE-LANE-DYNAMIC-CAPACITY-PROFILE-001
responsibility_owner: three-lane-cloud-governance-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "現行三社レーンauthorityへadditiveなprovider別capacity profileを追加する。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "PLAN-L3-78 confirmedと現行3L-R-11／RLO-FR-021..024／WCC-FR-14をread-afterできる"
contract_postconditions: "provider別pool、active WIP、review、merge capacityと段階拡張条件がL1/L3/L10/L12候補で閉じる"
contract_invariants: "三社lane exact set、Codex control reserve、Cursor 1→2→3 canary、Claude独立review、8-slot能力上限を維持する"
contract_failures: "pool上限の常時稼働化、無測定burst、下流詰まり時dispatch、stale review receiptを拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは要求候補のみで、runtime oracleはcanonical promotionと実装PLANで所有する。"
complexity_effect: net_negative
complexity_justification: "固定lane数の混同をprovider pool／active WIP／review／merge capacityへ分離し、backpressureを一元化する。"
removal_trigger: "v0.5候補がcanonical L1/L3/L10/L12とRequirement IRへ移管された時"
parent_design: docs/governance/candidates/three-lane-capacity-profile-requests.md
pair_artifact: docs/governance/candidates/three-lane-capacity-profile-acceptance.md
dependencies:
  parent: PLAN-L3-78-three-lane-cloud-governance-authority
  requires:
    - docs/plans/PLAN-L3-78-three-lane-cloud-governance-authority.md
  references:
    - issue:214
    - issue:819
    - issue:1293
    - issue:1358
    - issue:1359
    - issue:1649
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-1358-three-lane-capacity-profile-v05.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/three-lane-capacity-profile-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/three-lane-capacity-profile-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/three-lane-capacity-profile-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/governance/candidates/three-lane-capacity-profile-recognition.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
agent_slots:
  - { role: tl, slot_label: "TL — pool／active／review／merge capacity境界" }
  - { role: qa, slot_label: "QA — 段階拡張、backpressure、review lease、JIT receipt反例" }
review_evidence:
  - reviewer: "Claude Code / claude-fable-5-1"
    review_kind: cross_agent
    reviewed_at: "2026-09-12T00:13:36Z"
    tests_green_at: "2026-09-12T00:13:36Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: 7c06020ee29d0d718bf4730e817c5e0b8fa4247a
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1750#issuecomment-5642089190"
    ci_evidence_generation: "run:34659443632:attempt:1:success"
    receipt_id: "claude-pr-review:RetryYN/HELIX-HARNESS#1750:7c06020ee29d0d718bf4730e817c5e0b8fa4247a:claude:run:34659443632:attempt:1:success"
    receipt_digest: "sha256:5e2734917d2834357d7f36068b7f0c5bff7c9eab8aee2028578525ce173b4d8c"
    scope: "PO承認前のdraft exact HEADを独立監査しblocker 0。候補L1/L3/L10/L12の内容、ID連番、3L-R-11引用、双方向pair、candidate-only境界、snapshot 100件、全CI shardを確認した。main同期後の新HEADはsuccess CIと独立review receiptを再取得する。"
    green_commands:
      - kind: smoke
        command: "GitHub Actions run 34659443632 full regression receipt"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-09-12T00:13:36Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:13da7ea43892da04f0442a448bb6304e662c2bc07e68075b17c36b0ac02b342a"
        result: "exact HEAD 7c06020ee、全required check success、DB projection/replay converged"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-09-12T00:13:36Z"
  review_binding:
    reviewer: "Claude Code / claude-fable-5-1"
    reviewed_at: "2026-09-12T00:13:36Z"
    evidence_digest: "sha256:863a852c27b8b9189357f5e826e2097dfafae805b4fa97a73a0ec160819d3592"
  entries: []
---

# 三社レーン動的capacity profile v0.5

Issue #1358のcapacity delta追跡点を会話・コメントだけに残さず、L1/L3/L10/L12候補へmaterializeする。
既存PLAN-L3-78のconfirmed v0.4を遡及変更せず、v0.5 additive deltaとして独立review、承認束縛、canonical promotion、Requirement IR admissionを行う。

本PLANはruntime WIPを直ちに増やさない。Cursor 1レーンの継続投入、2→3への実測拡張、Codex／Cursor burst、Claude reviewer追加をそれぞれtyped admissionで有効化する。
