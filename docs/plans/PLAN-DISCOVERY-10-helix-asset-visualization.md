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
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
  references:
    - docs/plans/PLAN-L7-141-web-dashboard-component-derived.md
    - docs/plans/PLAN-L7-96-screen-db-projection.md
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
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
- API/read-model response の先行検証は `PLAN-L7-206-visualization-read-model-response` で実施する。first response は
  `ut-tdd progress snapshot --json` とし、VSCode Webview/View はこの deterministic JSON を読む。projection-only runtime
  evidence は accepted runtime verification として数えない。

## Pre-Verified Read Model Response

`PLAN-L7-206` で固定した `VisualizationSnapshot` は、既存 harness.db projection を束ねる read-only response である。
UI はこの response を起点に Tree View / Mermaid graph / Webview table へ描画してよいが、LLM generated diagram や
free-form summary を正本にしない。

この response は **先行検証 slice** であり、L1 §2.8 全体の UI 完了ではない。`trace_edges` の詳細、review evidence
明細、`feedback_events` / `findings`、agent slot、handover、memory recall の per-row drill-down は後続の VSCode
View/Webview PLAN で layer/filter/navigation として扱う。`PLAN-L7-206` は Webview 実装前に API/read-model の
最小 response が誤分類しないことを証明する。

| Field | Source projection | Meaning |
|------|-------------------|---------|
| `progress.artifacts` | `artifact_progress` | red/yellow/green と未収束 artifact の可視化 |
| `progress.plans` / `progress.gates` | `plan_registry` / `gate_runs` | PLAN status と gate pass/fail/block の集計 |
| `graph` | `graph_nodes` / `dependency_edges` / `graph_snapshots` | node/edge 数と最新 graph snapshot hash |
| `evidence.test_runs` | `test_runs` | green command / unit-test evidence の集計 |
| `evidence.runtime_verification` | `runtime_verification_events` | `runtime_verified` と `projection_only_unverified` を分離 |
| `evidence.skill_invocations` / `model_runs` / `guardrail_decisions` | same-name tables | skill 発火、model telemetry、guardrail decision の計測 view |
| `drilldowns` | CLI/table pointers | UI から DB/docs/evidence へ戻るための deterministic drill-down |

## Non-Goals

- この PLAN では VSCode extension 実装を開始しない。
- 既存 `PLAN-L7-141` を完成扱いにしない。
- Provider transcript や secret を Webview state に保存しない。
