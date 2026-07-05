---
plan_id: PLAN-L7-217-pair-agent-consultation-precedence
title: "PLAN-L7-217 (add-impl): pair-agent consultation precedence"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - pair-agent consultation precedence"
  - role: qa
    slot_label: "QA - pair-agent TDD loop regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-217-pair-agent-consultation-precedence.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-217-pair-agent-consultation-precedence.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/pair-agent.ts
    artifact_type: source_module
  - artifact_path: tests/pair-agent.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
  requires:
    - docs/plans/PLAN-REVERSE-217-pair-agent-consultation-precedence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:16:27+09:00"
    tests_green_at: "2026-07-01T09:16:27+09:00"
    verdict: approve
    scope: "Continuation: pair-agent TDD route now fail-closes lightweight implementation output that attempts to close, approve, or verdict the work. The light implementation agent remains implementation/consultation only; smart review keeps the only local verdict authority."
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
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts --test-name-pattern \"lightweight implementation tries to close\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:aa9a77ad5b62f764027ea7a7acd77678278e45acebceea915d113371e3da1edf"
      - kind: smoke
        command: "sha256sum src/orchestration/pair-agent.ts"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
      - kind: smoke
        command: "sha256sum docs/design/helix/L3-requirements/pillar-functional-requirements.md docs/design/helix/L6-function-design/pillar-function-design.md docs/test-design/helix/L3-pillar-acceptance-test-design.md docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:16:27+09:00"
        evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
        output_digest: "sha256:68617a1111eae4fe9b7a76087ffe2213a03e9617d2b0e311f0850622a6757e01"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:41:20+09:00"
    tests_green_at: "2026-07-01T07:41:20+09:00"
    verdict: approve
    scope: "Pair-agent TDD route now treats any lightweight consultation question as pending consultation, even when changed-files/test/implementation evidence is present. The smart review agent must provide an implementation directive or fix response before the next light fix cycle; mixed consultation output cannot silently pass as implementation."
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
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:41:20+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:20a836d48fc1fc4b2add974d51180aef1de96b05028543cf593a4b778543b4ad"
---

# PLAN-L7-217: pair-agent の consultation precedence

## Objective

light_implementation の出力に implementation evidence と consultation question が
同時に含まれる場合の pair-agent workflow の抜けを塞ぐ。こうした場合は
consultation を優先し、smart review agent が directive か fix response を返し、
その内容が次の light fix cycle に反映されるまで Green にはしない。

## Scope

- `light_implementation` からの `CONSULTATION_QUESTION` は、
  changed-files/test/notes evidence が同時にあっても pending consultation として扱う。
- lightweight implementation の completion/approval/verdict marker は、
  implementation evidence が他にあっても closing-authority violation として扱う。
- 混在した consultation output が、次の light fix cycle の前に smart instruction を通ることを
 示す regression test を追加する。
- HR-FR-P2-04 / HAC-P2-04b と L3/L6 の pair test design を backfill する。

## 非対象

- external provider CLI は実行しない。
- frontier approval requirements は変更しない。
- pair-agent の local verdict を CI/merge gate の代替にはしない。

## 外部根拠

このルールは L6 で参照している既存の TDD basis に従う。Red/oracle clarification は
TDD loop の一部であり、Green implementation ではない。Fowler の TDD Red/Green cycle と
NIST SSDF の review/remediation evidence は、曖昧な implementation work を accepted と
みなす前に explicit review instruction が必要であることを支持する。

## DoD

- [x] implementation evidence と consultation が混在する場合は pending として扱う。
- [x] lightweight implementation output では work を close / approve / verdict できない。
- [x] 次の light fix cycle の前に smart directive / fix response が必要である。
- [x] pair-agent tests で regression をカバーする。
- [x] L3/L6 design と paired test-design を更新する。
