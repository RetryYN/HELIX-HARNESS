---
plan_id: PLAN-L7-168-g8-integration-workflow
title: "PLAN-L7-168: G8 integration workflow granularity"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-26
updated: 2026-06-26
owner: Codex
parent_design: docs/test-design/harness/L8-integration-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - G8 workflow gate wiring"
  - role: qa
    slot_label: "QA - L8 integration workflow granularity"
generates:
  - artifact_path: docs/plans/PLAN-L7-168-g8-integration-workflow.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L8-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/g8-integration-workflow.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/g8-integration-workflow.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
  requires:
    - docs/plans/PLAN-L7-130-right-arm-gate-planning.md
    - docs/test-design/harness/L8-integration-test-design.md
    - docs/process/gates.md
    - docs/plans/PLAN-REVERSE-168-g8-integration-workflow.md
  references:
    - docs/governance/gate-design.md
    - docs/governance/helix-harness-concept_v3.1.md
    - docs/governance/helix-harness-requirements_v1.2.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-26T20:30:00+09:00"
    tests_green_at: "2026-06-26T20:30:00+09:00"
    verdict: approve
    scope: "G8 workflow granularity is wired into doctor as a fail-close check. This slice defines entry/selection/procedure/evidence/exit for L8 ascent; it does not claim full L8 close."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\g8-integration-workflow.test.ts tests\\lint-wiring.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-26T20:30:00+09:00"
        evidence_path: tests/g8-integration-workflow.test.ts
        output_digest: "sha256:2eab00f92a5bda76ff43a4b215d4620c117939e3221f808603492b5c7ed77d91"
---

# PLAN-L7-168: G8 integration workflow granularity の粒度化

## 目的

最初の L8 ascent を測定可能にする。L8 には confirmed 済みの IT-* case rows があるが、
G8 にはまだ workflow granularity が必要だった: strategy、plan、selected conditions、
coverage items、procedures、execution evidence、exit criteria、defect routing の各項目。

## スコープ

- L8 integration test design に `G8-WORKFLOW` を追加する。
- slice が G8 を通過する前に integration evidence manifest と selected IT-* coverage を必須にする G8 process note を追加する。
- `g8-integration-workflow` lint を追加し、`doctor` に配線する。
- workflow markers の欠落時と存在時の tests を追加する。

## 外部参照の扱い

Downloads / HELIX workflow samples と current public testing references は比較材料としてのみ使用した。
これらは canonical HELIX runtime state ではない。採用する contract は HELIX 固有の workflow chain:
`test_strategy -> test_plan -> test_conditions -> coverage_items -> test_procedures -> execution_evidence -> exit_criteria -> defect_routing`。

## DoD

- [x] L8 test design が実行可能な G8 workflow granularity を含む。
- [x] G8 process doc は IT-* rows だけでの close を許可しない。
- [x] L8/G8 workflow markers が無い場合、Doctor は fail する。
- [x] Targeted G8 workflow tests が pass する。
- [x] この slice は first ascent step に留まり、full L8 close を主張しない。
