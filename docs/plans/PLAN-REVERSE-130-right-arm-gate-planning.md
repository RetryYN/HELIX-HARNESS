---
plan_id: PLAN-REVERSE-130-right-arm-gate-planning
title: "PLAN-REVERSE-130: right-arm gate planning fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-30
owner: Codex
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "The existing requirement already records G8-G14 as future mechanization; this slice mechanizes the planning route."
  - layer: process-gates
    decision: updated-by-plan-evidence
    evidence_path: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
    reason: "The carry now has a concrete PLAN, official source ledger, and doctor lint checks the route."
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "The basic function model is unchanged; this slice only enforces planning evidence."
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/internal-processing.md
    reason: "Detailed G8-G14 fail-close behavior remains child-plan work."
  - layer: implementation
    decision: updated
    evidence_path: src/lint/right-arm-gate-planning.ts
    reason: "Doctor now fails if the carry has no concrete PLAN route."
agent_slots:
  - role: tl
    slot_label: "TL - right-arm gate planning fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/internal-processing.md
    artifact_type: design_doc
  - artifact_path: src/lint/right-arm-gate-planning.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
  requires:
    - docs/plans/PLAN-L7-130-right-arm-gate-planning.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T14:21:41+09:00"
    tests_green_at: "2026-06-30T14:21:41+09:00"
    verdict: approve
    scope: "R4 fullback update for official source ledger semantic grounding."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/right-arm-verification-strategy.test.ts tests/right-arm-gate-planning.test.ts tests/lint-wiring.test.ts --run"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T14:19:36+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:d61657777102ee65bab0c9d4c76eb026633afa69e14c9098925814079fda5351"
      - kind: unit_test
        command: "npm test"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:31+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:d61657777102ee65bab0c9d4c76eb026633afa69e14c9098925814079fda5351"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts db rebuild && npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:41+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:7fc4e2ddfb6fa7f48781929e249b45f151d10ee60650c55c10fae08f19ea727c"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:30:00+09:00"
    tests_green_at: "2026-06-23T16:30:00+09:00"
    verdict: approve
    scope: "R4 fullback for IMP-052 route mechanization."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\right-arm-gate-planning.test.ts tests\\lint-wiring.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:30:00+09:00"
        evidence_path: tests/right-arm-gate-planning.test.ts
        output_digest: "sha256:f321df37a40bc2ea221a2a2ab9d07c36ff6c8be0e02524791c40d198e8e9fb3b"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:30:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:4b05fe6be6b15f71728b2f363f092f27c79bd207dadc65b8ad4b478618403464"
---

# PLAN-REVERSE-130: right-arm gate planning fullback の反映

## Objective

G8-G14 の unplanned carry を doctor-enforced planning route に変換する back-propagation decision を記録する。

## Scope

- この reverse slice は G8-G14 gate の full implementation を主張しない。
- 実際の PLAN artifact が無いまま carry が "future PLAN" として残れる process hole を閉じる。
- external verification standards が official URL、adopted version/date、latest official status、
  adoption decision、verification use、gate impact なしに名前だけで参照される weaker-source hole も閉じる。
- 具体的な G8-G14 fail-close conditions は future child PLANs で定義する。

## Acceptance Criteria（受入条件）

- L7 PLAN と reverse PLAN がどちらも machine-readable artifacts として存在する。
- Doctor が right-arm planning lint を実行する。
- PLAN route が存在しない場合、lint が tests で失敗する。
- right-arm verification strategy は、official source ledger が semantic source-to-gate mapping を失った場合に失敗する。
