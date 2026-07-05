---
plan_id: PLAN-REVERSE-221-pair-agent-replay-evidence
title: "PLAN-REVERSE-221: pair-agent replay evidence の backfill"
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
    reason: "HAC-P2-04b は、pair-agent --save-evidence が loop_summary、transcript/output digests、quality_signals projection を含むことを明記した。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P2 は block level で pair-agent route を既に保持しており、replay counters は L6 execution evidence の詳細である。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "physical tables は quality_signals を既に含むため、schema 追加や新しい L5 block は不要である。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P2 は pair-agent --save-evidence に loop_summary、transcript_digest、phase output_excerpt_digest、quality_signals projection を要求する。"
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-04 は consultation/fix/review loop replay fields と quality_signals projection を期待する。"
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-04 は pair-agent replay loop fields と quality_signals projection を観測する。"
agent_slots:
  - role: tl
    slot_label: "TL - pair-agent replay evidence の backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-221-pair-agent-replay-evidence.md
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
  parent: docs/plans/PLAN-L7-221-pair-agent-replay-evidence.md
  requires:
    - docs/plans/PLAN-L7-221-pair-agent-replay-evidence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:52:22+09:00"
    tests_green_at: "2026-07-01T09:52:22+09:00"
    verdict: pass
    scope: "pair-agent replay evidence を HAC-P2-04b、HAT-P2-04、L6 HC-P2、HU-PILLAR-P2-04 へ backfill した。L4/L5 は block boundary と physical quality_signals sink が既に存在するため変更しない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts --test-name-pattern \"projects pair-agent run evidence\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: smoke
        command: "sha256sum docs/design/helix/L6-function-design/pillar-function-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:bb979a6d8736a415df8f8ab837893b9f6a49cbf0c54412857f7bb98cc0abb042"
      - kind: smoke
        command: "sha256sum docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:52:22+09:00"
        evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
        output_digest: "sha256:68617a1111eae4fe9b7a76087ffe2213a03e9617d2b0e311f0850622a6757e01"
---

# PLAN-REVERSE-221: pair-agent replay evidence の backfill

## 目的

pair-agent replay evidence の変更を design contract として backfill する。L7 実装は
単なる JSON field 追加ではなく、保存された TDD pair loop を consultation、review failure、
fix-cycle evidence として監査可能にする。

## Backfill 結果

- HAC-P2-04b は `--save-evidence` の一部として `loop_summary`、transcript digest、
  phase output digest、`quality_signals` projection を記録する。
- HAT-P2-04 は同じ replay fields を acceptance level で観測する。
- L6 HC-P2 と HU-PILLAR-P2-04 は replay 可能な consultation/fix/review loop evidence を期待する。
- L4 と L5 は、pair-agent block boundary と既存の `quality_signals` sink を既に定義しているため変更しない。

## 受入条件

- `PLAN-L7-221` とこの Reverse PLAN は相互に require する。
- 変更された L3/L6 design と対応する test design は、semantic replay fields を cite する。
- 実装は additive のままとし、frontier approval と CI/merge-gate boundaries を維持する。
