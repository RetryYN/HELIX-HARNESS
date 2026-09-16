---
plan_id: PLAN-REVERSE-206-visualization-read-model-response
title: "PLAN-REVERSE-206: visualization read-model の意味 back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: be
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
    reason: "既存 L1 §2.8 の deterministic visualization 要求を実装可能な read-model response へ降ろす。新規要求は増やさない。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/architecture.md
    reason: "既存 state-db module に query layer を追加するだけで top-level module / action surface は増やさない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
    reason: "既存 projection table の read-only 集計であり schema / migration は増やさない。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "`buildVisualizationSnapshot` function contract を追加し、VSCode/Webview 表示の API response 境界を固定。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-VISUAL-001/002 を追加し、determinism と projection-only evidence 誤表示禁止を oracle 化。"
agent_slots:
  - role: tl
    slot_label: "TL - visualization 意味 back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-206-visualization-read-model-response.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-206-visualization-read-model-response.md
  requires:
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:20:00+09:00"
    tests_green_at: "2026-06-30T03:20:00+09:00"
    verdict: approve
    scope: "Reverse back-fill により、visualization 実装が既存 L1 §2.8 配下の read-only response contract であり、schema、action surface、authoring-source の移動を伴わないことを確認した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:20:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:0ac405fdb8ca550ec1b235325c300564ae50b38a8cdc6929e4d225aab862feb2"
---

# PLAN-REVERSE-206: visualization read-model の意味 back-fill

## R0-R4 要約

- R0: `PLAN-DISCOVERY-10` は存在していたが、API/read-model response は
  L6/L7 で固定されていなかった。UI ticket だけでは、LLM 生成 summary へ逸脱する余地が残っていた。
- R1: as-built response は、既存 harness.db projection row に対する deterministic query である。
- R2: L1 §2.8 を requirement source として維持する。新規 module や schema を導入しないため
  L4/L5 は安定したままとし、R4 routing は最も近い supported Forward enum (`L5`) を使うが、
  実際に更新される contract は L6 である。
- R3: L6 に function contract を追加し、L7 に unit/CLI oracle を追加する。
- R4: `PLAN-L7-206` をこの back-fill の Forward merge point とする。

## Back-Fill した意味

visualization surface は、Webview 実装ではなく read-only response contract を先に固定する境界である。
UI renderer は Tree View、Mermaid、Webview のいずれを選んでもよいが、deterministic な
DB/docs-derived row を消費し、source evidence へ drill down できなければならない。
Runtime evidence count は、accepted runtime verification と projection-only telemetry を分離して扱う。

## Merge 境界

この Reverse では VSCode extension の追加、DB row からの docs 変更、action button の作成は行わない。
Execution、external API call、settings mutation、branch または ruleset の変更は read model の外側に残し、
後続 PLAN で action-binding approval を要求する。
