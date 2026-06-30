---
plan_id: PLAN-DISCOVERY-10-helix-asset-visualization
title: "PLAN-DISCOVERY-10: HELIX asset/progress visualization via VSCode Webview/View and deterministic DB/Markdown graphs"
kind: poc
layer: cross
workflow_phase: S3
scrum_type: design-spike
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

> **S3 verify update (2026-06-30, Codex)**: `PLAN-L7-206` により `buildVisualizationSnapshot(db)` と
> `ut-tdd progress snapshot --json` の deterministic read-model first response は実装・検証済み。本 Discovery は
> S1 起票状態から **S3 verify 記録済み**へ進める。ただし VSCode extension/Webview 採用と後続 L3/L4/L6/L7 分割の
> S4 decision は PO 判断点のため、本 PLAN はまだ `status=draft` のまま残す。

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

- VSCode Webview と VSCode View のどちらを first surface にするか。**S3 推奨: VSCode Tree View を first surface** とし、
  Webview は graph/detail panel に限定する。VS Code 公式 UX guideline は通常の階層/一覧 view には Tree View を使い、
  Webview は VS Code API で足りない独自 UI が必要な場合に限定する方向を示しているため、progress / dependency の常用入口は
  Tree View が軽い。
- Mermaid / Cytoscape / custom SVG のどれを使うか。**S3 推奨: Mermaid-compatible graph IR を first target** にし、
  renderer は交換可能にする。Mermaid は text-based diagram 定義を source-controlled artifact として扱いやすく、
  LLM 生成図ではなく DB/docs 由来の deterministic transform に向く。
- harness.db schema に visualization 専用 read-model を増やすか、既存 projection を query layer で束ねるか。
  **S3 結論: 既存 projection を query-only に束ねる first response** とする。`PLAN-L7-206` で新規 table なしに
  `VisualizationSnapshot` を実装済み。専用永続 table は drill-down / latency / query cost が実測で詰まった後に L5/L6 で判断する。
- action surface をどこまで許可するか。**S3 結論: read-only + CLI copy まで**。Webview/View から command 実行、外部 API、
  branch/ruleset、設定変更へ進む導線は HNFR-P8 / XR-2 の action-binding approval 境界に入れる。

## S2/S3 Verification Record

| Item | Evidence | Result |
|------|----------|--------|
| deterministic read model | `src/state-db/visualization-read-model.ts` / `buildVisualizationSnapshot(db)` | 実装済。既存 projection table を query-only で束ね、schema mutation なし |
| CLI first response | `ut-tdd progress snapshot --json` | 実装済。VSCode View/Webview はこの JSON を読む |
| projection-only guard | `tests/visualization-read-model.test.ts` | `projection_only_unverified` と `missing_runtime_provenance` を accepted runtime verification に数えない |
| cold start | `tests/visualization-read-model.test.ts` / `tests/cli-surface.test.ts` | 空 DB では 0 と warning を返し、成功を捏造しない |
| L6 contract | `docs/design/harness/L6-function-design/function-spec.md` | `buildVisualizationSnapshot` が L6 function contract と U-VISUAL oracle に接続済み |
| L14 pair | `docs/test-design/helix/L1-pillar-operational-test-design.md` HOT-P9 | 可視化 node/edge 一致、projection-only 誤表示禁止、approval-bound action surface を HOT-P9 に接続済み |

### External Source Check (primary/official)

| Source | Used For |
|--------|----------|
| VS Code Tree View API: https://code.visualstudio.com/api/extension-guides/tree-view | first surface を Tree View に寄せる根拠。進捗/依存/証跡への軽量 navigation を VS Code native view として扱う |
| VS Code Webview API: https://code.visualstudio.com/api/extension-guides/webview | graph/detail panel のみ Webview にし、local resources / script / CSP を後続 L4/L6 risk boundary に落とす根拠 |
| VS Code Webview UX Guidelines: https://code.visualstudio.com/api/ux-guidelines/webviews | Webview を濫用せず、VS Code API で足りる surface は native view に寄せる判断根拠 |
| Mermaid Syntax: https://mermaid.js.org/syntax/flowchart.html | Mermaid-compatible graph IR を source-controlled deterministic diagram target にする根拠 |

## S4 Recommendation (PO Decision Material)

Recommendation: **confirm with reuse-with-hardening**.

- Adopt `VisualizationSnapshot` as the first response contract for HELIX asset/progress visualization.
- Split follow-up work into:
  1. L3: view requirements / acceptance IDs for Tree View, graph panel, evidence drill-down, and read-only boundary.
  2. L4: UI/data boundary, VSCode extension adapter boundary, Webview CSP/localResourceRoots policy, no provider transcript storage.
  3. L6: view-model functions for layer tree, graph IR, evidence timeline, drill-down command/table pointers.
  4. L7: VSCode Tree View prototype first; Webview graph/detail second.
- Keep action surfaces out of the first slice. Any command execution / external API / branch-ruleset mutation remains approval-bound.
- Do not treat `PLAN-L7-141` central web dashboard as fulfilling this Discovery. It is a read-only web UI slice, not the VSCode deterministic visualization workflow.

## Acceptance For This Discovery

- [x] L1 §2.8 と L14 HOT-P9 acceptance が起票済みである。
- [x] 後続 PLAN は L3 要件 descent、L4 UI/data boundary、L6 view-model function contract、L7 VSCode extension/webview prototype
  に分割できる粒度である。
- [x] Visualization は LLM 生成依存ではなく、Markdown/DB/relation graph/runtime evidence の deterministic transform として定義されている。
- [x] API/read-model response の先行検証は `PLAN-L7-206-visualization-read-model-response` で実施済み。first response は
  `ut-tdd progress snapshot --json` とし、VSCode Webview/View はこの deterministic JSON を読む。projection-only runtime
  evidence は accepted runtime verification として数えない。
- [ ] S4 decision_outcome は PO。confirmed なら `decision_outcome: confirmed` / `promotion_strategy: reuse-with-hardening` を記録し、
  後続 L3/L4/L6/L7 PLAN へ Forward 合流する。

s4_decision_record:
- allowed_outcome: `confirmed` / `rejected` / `pivot`
- decision_owner: PO (人間)。TL は visualization scope と read-only/action-boundary の助言のみ。
- decision_basis: S3 verified read model (`PLAN-L7-206`)、official VS Code Tree View / Webview / Webview UX guidance、Mermaid graph IR、HOT-P9 L14 pair、projection-only guard の検証結果。
- verified_evidence: `PLAN-L7-206-visualization-read-model-response` の read-model response 検証、`ut-tdd progress snapshot --json`、projection-only guard、HOT-P9 L14 pair、Mermaid graph IR の S3 evidence。
- stakeholder_review_or_proxy: TL proxy review 済み。PO は S4 で VSCode visualization workflow を confirmed / rejected / pivot するかだけを判断する。
- acceptance_gap: read model は verified。未充足 gap は L3 visualization requirements、L4 UI/data boundary、L6 view-model contract、L7 VSCode Tree View/Webview prototype。
- unresolved_risk: Webview CSP/localResourceRoots、provider transcript / secret 非保存、action surface の approval-boundary、既存 `PLAN-L7-141` web dashboard との誤同一視。
- external_source_basis: docs/process/modes/discovery.md の S4 decision source ledger、VS Code Tree View / Webview / Webview UX official docs、Mermaid Syntax、`PLAN-L7-206` evidence。
- route_impact: confirmed なら L3/L4/L6/L7 へ分割 descent、rejected なら visualization workflow を採用せず read-model を archive、pivot なら native Tree View / Webview scope を再定義する。
- forward_route: `confirmed` の場合は L3 visualization requirements、L4 UI/data boundary、L6 view-model contract、L7 VSCode Tree View/Webview prototype に分割して Forward 合流する。
- reverse_fullback_required: yes。confirmed 後は L1/L3/L4/L6 の正本へ Reverse fullback し、action surface は approval-bound のまま維持する。
- promotion_strategy_or_rejection_pivot_rationale: confirmed の場合は `reuse-with-hardening`。`VisualizationSnapshot` first response を再利用し、L3/L4/L6/L7 を分割 descent する。rejected の場合は VSCode visualization workflow を採用せず read-model を archive、pivot の場合は Tree View / Webview / Mermaid-compatible IR の scope を再定義して S1/S2 へ戻す。

action_binding_approval_record:
- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`
- approval_policy_or_named_approver: PO action-binding approval is required before any VSCode View/Webview command execution, external API, config mutation, or write-capable action surface is activated.
- approval_scope: Read-only `ut-tdd progress snapshot --json` rendering is excluded; approval scope is limited to actor/tool/target/params for later command execution, external API/config mutation, or write-capable Webview action surfaces.
- approved_actor: No actor is approved by this Discovery PLAN; future approval must name the human operator or automation identity before activation.
- approved_tool: No write-capable tool is approved by this Discovery PLAN; future approval must name the VSCode command/Webview action/CLI wrapper before activation.
- approved_target: No mutable target is approved by this Discovery PLAN; future approval must name the command target, external API, config file, or Webview action target before activation.
- approved_params: No params are approved by this Discovery PLAN; future approval must record the command args/config diff/params hash or summary before activation.
- review_approval_evidence: S3 read-model evidence, L1 §2.8, HOT-P9 L14 pair, VS Code Webview security source, and the L3/L4/L6/L7 split plan must be reviewed before approval.
- expires_at_or_trigger: Trigger-bound; approval expires before the first L7 prototype action-binding implementation or whenever scope expands beyond read-only visualization.
- audit_record: No high-impact action is approved or executed by this Discovery PLAN; activation must write approver, scope, command/action, result, and incident/backlog route before execution.

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
