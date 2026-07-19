---
plan_id: PLAN-REVERSE-217-pair-agent-consultation-precedence
title: "PLAN-REVERSE-217: pair-agent consultation precedence の逆流補完"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: TL (Codex)
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "HR-FR-P2-04 / HAC-P2-04b は、consultation 質問が同時に出た implementation evidence より優先され、light-agent の completion/approval/verdict marker は fail-close することを記録済み。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P2 は pair-agent route を workflow block level で定義済み。この slice は L6 execution semantics を締めるだけである。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-P2 detailed contract は pair-agent run semantics をすでに所有しており、新しい L5 block は不要である。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P2 は `runPairAgentTddPlan` contract に consultation precedence と light-agent closing-authority marker rejection を記録済み。"
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-04 は pair-agent consultation precedence と light-agent closure-claim rejection を acceptance evidence として cite する。"
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-04 は、mixed consultation output が smart response まで pending のまま残り、light closure marker が fail-close することを期待する。"
agent_slots:
  - role: tl
    slot_label: "TL - pair-agent consultation precedence 逆流補完"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-217-pair-agent-consultation-precedence.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-217-pair-agent-consultation-precedence.md
  requires:
    - docs/plans/PLAN-L7-217-pair-agent-consultation-precedence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:16:27+09:00"
    tests_green_at: "2026-07-01T09:16:27+09:00"
    verdict: pass
    scope: "light-agent closing-authority rejection を HR-FR-P2-04/HAC-P2-04b、L6 HC-P2、paired L3/L6 test design へ逆流補完した。これにより TDD pair route の local verdict authority は smart review agent のみとして維持される。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:aa9a77ad5b62f764027ea7a7acd77678278e45acebceea915d113371e3da1edf"
      - kind: smoke
        command: "sha256sum docs/design/helix/L3-requirements/pillar-functional-requirements.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
        output_digest: "sha256:ca1b313b2ba1c019d7b83402b2e3663545068457ccc0dfcfd1ffefa3f0f3ca3c"
      - kind: smoke
        command: "sha256sum docs/design/helix/L6-function-design/pillar-function-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:bb979a6d8736a415df8f8ab837893b9f6a49cbf0c54412857f7bb98cc0abb042"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:41:20+09:00"
    tests_green_at: "2026-07-01T07:41:20+09:00"
    verdict: pass
    scope: "PLAN-L7-217 を HR-FR-P2-04/HAC-P2-04b、L6 HC-P2、paired L3/L6 test design へ逆流補完した。この backfill は frontier approval と CI/merge gate boundary を維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:aa9a77ad5b62f764027ea7a7acd77678278e45acebceea915d113371e3da1edf"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:aa9a77ad5b62f764027ea7a7acd77678278e45acebceea915d113371e3da1edf"
---

# PLAN-REVERSE-217: pair-agent consultation precedence の逆流補完

## 目的

pair-agent consultation precedence を逆流補完し、implementation change を単独の
parser tweak ではなく workflow rule として扱う。semantic source は HR-FR-P2-04
であり、light agent は consultation を求めてもよいが、consultation は pass ではない。

## 逆流補完結果

- HR-FR-P2-04 / HAC-P2-04b は、consultation が implementation evidence と混在しても
  smart instruction へ route することを記録する。
- HR-FR-P2-04 / HAC-P2-04b は、light implementation agent に closing authority がないため、
  light-agent completion/approval/verdict marker が fail-close することを記録する。
- L6 HC-P2 は `runPairAgentTddPlan` fail-close contract を記録する。
- L3/L6 paired test design は `tests/pair-agent.test.ts` を cite する。
- Frontier approval、evidence persistence、CI/merge boundary は変更しない。

## 受入条件

- `PLAN-L7-217` とこの Reverse PLAN は add-impl backfill のため相互に require する。
- 新しい behavior は `HU-PILLAR-P2-04` で test-cited される。
- この backfill は whole-program completion や `旧 state path -> .helix` cutover を claim しない。
