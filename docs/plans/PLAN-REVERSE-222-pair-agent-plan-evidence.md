---
plan_id: PLAN-REVERSE-222-pair-agent-plan-evidence
title: "PLAN-REVERSE-222: pair-agent plan evidence backfill"
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
    reason: "HAC-P2-04b now states that pair-agent plan evidence persists adapter plan, prompt digest, and frontier guardrail decision before run evidence."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P2 already owns the pair-agent route at workflow block level; this slice hardens the L6/L7 evidence shape."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "Existing model_runs, gate_runs, and guardrail_decisions tables are sufficient; no schema change is required."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P2 now requires plan evidence persistence and DB projection for `pair-agent plan --save-evidence`."
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-04 now observes plan evidence and run evidence separately."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-04 now expects plan evidence projection as well as run evidence replay."
agent_slots:
  - role: tl
    slot_label: "TL - pair-agent plan evidence backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-222-pair-agent-plan-evidence.md
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
  parent: docs/plans/PLAN-L7-222-pair-agent-plan-evidence.md
  requires:
    - docs/plans/PLAN-L7-222-pair-agent-plan-evidence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T10:08:25+09:00"
    tests_green_at: "2026-07-01T10:08:25+09:00"
    verdict: pass
    scope: "Backfilled pair-agent plan evidence into HAC-P2-04b, HAT-P2-04, L6 HC-P2, and HU-PILLAR-P2-04. The backfill preserves frontier approval and CI/merge gate boundaries."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts --test-name-pattern \"persists pair-agent plan evidence|adapter plans in text\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:aa9a77ad5b62f764027ea7a7acd77678278e45acebceea915d113371e3da1edf"
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts --test-name-pattern \"projects pair-agent plan evidence\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: smoke
        command: "sha256sum docs/design/helix/L3-requirements/pillar-functional-requirements.md docs/test-design/helix/L3-pillar-acceptance-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
        output_digest: "sha256:ca1b313b2ba1c019d7b83402b2e3663545068457ccc0dfcfd1ffefa3f0f3ca3c"
      - kind: smoke
        command: "sha256sum docs/design/helix/L6-function-design/pillar-function-design.md docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:08:25+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:bb979a6d8736a415df8f8ab837893b9f6a49cbf0c54412857f7bb98cc0abb042"
---

# PLAN-REVERSE-222: pair-agent plan evidence backfill（pair-agent plan evidence 証跡 backfill）

## 目的

planning phase を単なる CLI convenience ではなく workflow contract として扱えるように、
pair-agent plan evidence を backfill する。pair route は provider execution の開始前に
監査可能でなければならない。

## Backfill 結果

- HAC-P2-04b は `pair-agent plan --save-evidence` を記録する。
- HAT-P2-04 は plan evidence と run evidence を別々の acceptance surface として観測する。
- L6 HC-P2 は `model_runs`、`gate_runs`、`guardrail_decisions` への plan evidence projection を記録する。
- HU-PILLAR-P2-04 は run evidence より前に adapter plan / prompt digest / frontier guardrail evidence を要求する。

## 受入条件

- `PLAN-L7-222` とこの Reverse PLAN は相互に required とする。
- Plan evidence は additive なままで、provider は実行しない。
- Frontier approval、`.helix -> .helix` cutover、CI/merge gate の境界は変更しない。
