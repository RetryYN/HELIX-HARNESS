---
plan_id: PLAN-REVERSE-207-l7-feature-pack-roadmap-definition
title: "PLAN-REVERSE-207: L7 feature-pack roadmap の意味補填"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L1-requirements/pillar-requirements.md
    reason: "HBR-P1/HBR-P9 はすでに work breakdown と DB convergence を要求している。この back-fill は L7 roadmap にそれらの責務を明示させる。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "既存 pillar block は continuous autonomy、DB convergence、visualization をすでに分離している。block boundary の変更はない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    reason: "module dependency boundary の変更はない。Feature packs は既存 module 上の roadmap responsibility を分類する。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "Roadmap feature-pack schema と L7 feature-pack coverage function contract を追加する。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-ROADMAP-025..028 は duplicate/unknown pack と real-repo pack coverage oracle を定義する。"
agent_slots:
  - role: tl
    slot_label: "TL - feature-pack roadmap back-fill レビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-207-l7-feature-pack-roadmap-definition.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
  requires:
    - docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
  references:
    - docs/plans/PLAN-REVERSE-44-roadmap-definition-design.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:21:36+09:00"
    tests_green_at: "2026-06-30T03:21:36+09:00"
    verdict: approve
    scope: "Back-fill は、この変更が新規 user requirement や production schema/API 変更ではなく、roadmap metamodel hardening であることを確認する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:0ac405fdb8ca550ec1b235325c300564ae50b38a8cdc6929e4d225aab862feb2"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
      - kind: unit_test
        command: "npx --no-install vitest run tests/roadmap.test.ts tests/doctor.test.ts tests/plan-lint.test.ts tests/impl-plan-trace.test.ts tests/oracle-test-trace.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: tests/roadmap.test.ts
        output_digest: "sha256:e4dee03f96fa6468aff5ddf2b55a30d1669256e4f7e1e50c289218ef840fb710"
---

# PLAN-REVERSE-207: L7 feature-pack roadmap の意味補填

## R0-R4 要約

- R0: roadmap mechanism は `layer`、`gates`、`spans` を登録していたが、
  semantic responsibility pack は登録していなかった。
- R1: as-built behavior は L7 coverage を報告できた一方で、DB、service、frontend、
  UI の責務は PLAN prose または `drive` から暗黙に読み取るだけだった。
- R2: 正しい as-is model は program roadmap に、欠落している L7 pack taxonomy を加えたもの。
- R3: 意図は、deferred UI を complete 扱いにせず、L7 work を semantic pack ごとに自己割り当て可能にすること。
- R4: L5/L6 contract と L7 implementation へ route する。Requirements と L4 block boundary は変更しない。

## 解消した Gap

`drive` は roadmap taxonomy ではない。forward artifact は明示的な `feature_packs[]` と
`span.feature_pack` を持ち、doctor は必須 L7 pack layer を検査する。
