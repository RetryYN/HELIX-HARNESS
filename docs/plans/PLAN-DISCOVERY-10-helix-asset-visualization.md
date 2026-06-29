---
plan_id: PLAN-DISCOVERY-10-helix-asset-visualization
title: "PLAN-DISCOVERY-10: HELIX asset/progress visualization via VSCode Webview/View and deterministic DB/Markdown graphs"
kind: poc
layer: cross
workflow_phase: S1
drive: fe
status: draft
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/helix/L1-requirements/pillar-requirements.md
agent_slots:
  - role: aim
    slot_label: "AIM - visualization discovery routing and scope control"
  - role: tl
    slot_label: "TL - visualization scope and non-LLM evidence discipline"
  - role: se
    slot_label: "SE - VSCode Webview/View and deterministic graph data spike"
  - role: qa
    slot_label: "QA - node/edge consistency and evidence drill-down oracles"
generates:
  - artifact_path: docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L1-06-helix-solo-conversion.md
  requires:
    - docs/plans/PLAN-L1-06-helix-solo-conversion.md
  references:
    - docs/plans/PLAN-L7-141-web-dashboard-component-derived.md
    - docs/plans/PLAN-L7-96-screen-db-projection.md
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
---

# PLAN-DISCOVERY-10: HELIX asset/progress visualization

## Objective

起票目的は、HELIX 資産・進捗・依存・検証証跡を VSCode Webview / VSCode View / 将来 dashboard で見られるようにする
ための L1 起点 Discovery。既存 `PLAN-L7-141-web-dashboard-component-derived` は中央 UI 実装の deferred PLAN であり、
本 PLAN はそれより前段の「何を正本として、どの view を deterministic に出すか」を決める。

## Principle

可視化の正本は LLM 生成テキストではない。Markdown frontmatter / docs body / harness.db / relation graph /
runtime evidence から再生成できる node/edge/metric/view model を正本にする。LLM は補助説明を出してよいが、
図・進捗・依存・合否の根拠にはしない。

## Candidate Views

| View | Source of truth | Non-LLM rendering target | First oracle |
|------|-----------------|--------------------------|--------------|
| Layer progress | PLAN frontmatter, roadmap rollup, artifact progress | VSCode Tree View + Mermaid/graph panel | node count equals DB/doc source |
| Design/test pair | `pair_artifact`, vmodel pair freeze, test-design docs | dependency graph | orphan design/test node count is zero or explicitly shown |
| Relation/dependency | `trace_edges`, `dependency_edges`, relation graph projection | graph layout / Mermaid | edge set is reproducible from DB |
| Runtime evidence | `test_runs`, `model_runs`, `skill_invocations`, `guardrail_decisions`, runtime verification log | evidence timeline + drill-down | projection-only is not shown as runtime verified |
| Skill / agent telemetry | skill catalog, skill invocations, agent slots, model runs | metrics table + trend | invocation rows link back to evidence path |

## Discovery Questions

- VSCode Webview と VSCode View のどちらを first surface にするか。Tree View は軽く進捗/依存を出せるが、
  graph panel は依存図に向く。
- Mermaid / Cytoscape / custom SVG のどれを使うか。第一候補は Mermaid 互換 graph data を出し、
  renderer を交換可能にする。
- harness.db schema に visualization 専用 read-model を増やすか、既存 projection を query layer で束ねるか。
- action surface をどこまで許可するか。初期は read-only + CLI copy、実行/外部 API/設定変更は action-binding approval。

## Acceptance For This Discovery

- L1 §2.8 と L14 HOT-P9 acceptance が起票済みである。
- 後続 PLAN は L3 要件 descent、L4 UI/data boundary、L6 view-model function contract、L7 VSCode extension/webview prototype
  に分割できる粒度である。
- Visualization は LLM 生成依存ではなく、Markdown/DB/relation graph/runtime evidence の deterministic transform として定義されている。

## Non-Goals

- この PLAN では VSCode extension 実装を開始しない。
- 既存 `PLAN-L7-141` を完成扱いにしない。
- Provider transcript や secret を Webview state に保存しない。
