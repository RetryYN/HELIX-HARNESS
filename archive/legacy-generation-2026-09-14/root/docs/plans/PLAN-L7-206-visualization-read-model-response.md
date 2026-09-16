---
plan_id: PLAN-L7-206-visualization-read-model-response
title: "PLAN-L7-206 (add-impl): deterministic visualization read-model response"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - semantic visualization contract review"
  - role: se
    slot_label: "SE - deterministic DB read model"
  - role: qa
    slot_label: "QA - projection-only evidence oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-206-visualization-read-model-response.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-206-visualization-read-model-response.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/state-db/visualization-read-model.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/visualization-read-model.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-205-run-debug-db-projection.md
  requires:
    - docs/plans/PLAN-REVERSE-206-visualization-read-model-response.md
    - docs/plans/PLAN-L7-205-run-debug-db-projection.md
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:20:00+09:00"
    tests_green_at: "2026-06-30T03:20:00+09:00"
    verdict: approve
    scope: "Visualization work is now grounded in a deterministic DB read-model response instead of an LLM-generated diagram or UI-only ticket. The response keeps projection-only runtime evidence blocked from accepted runtime verification."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:20:00+09:00"
        evidence_path: tests/visualization-read-model.test.ts
        output_digest: "sha256:d8250da81a45567b00e32b8a41a71c30d0cede427ed1726d156db17cf2232516"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:20:00+09:00"
        evidence_path: src/state-db/visualization-read-model.ts
        output_digest: "sha256:578b3248089279d35cb7fb7196d851203a2ea24c5bcbc382f2d0ca8c26912bf6"
---

# PLAN-L7-206: 決定的な visualization read-model response

## 目的

`PLAN-DISCOVERY-10` の semantic gap を閉じる。visualization ticket だけでは
HBR-P9/HBR-P4 を満たせない。VSCode Webview/View には、UI が何を render してよく、
runtime evidence をどう分類すべきかを示す決定的な response が必要である。

## スコープ

- 既存の harness.db projection tables に対する read-only query として
  `buildVisualizationSnapshot(db)` を追加する。
- UI-facing response surface として `helix progress snapshot --json` を追加する。
- artifact progress、relation graph export、search、runtime verification rows への
  drill-down pointers を維持する。
- `projection_only_unverified` と provenance 欠落の runtime evidence を accepted runtime counts
  から除外する。
- 実装済み surface と command catalog の整合を保つため、新しい command を
  `helix builder catalog` に登録する。

## 非目標

- この PLAN では VSCode extension や Webview renderer を実装しない。
- この PLAN では新しい projection table を追加せず、DB rows を authoring source にしない。
- この PLAN では action buttons、external API calls、branch/ruleset mutation、
  provider transcript storage を公開しない。
- この PLAN は L1 §2.8 に対する first response slice であり、visualization 全体の完了ではない。
  レビュー証跡の詳細、`trace_edges`、feedback/findings、agent slots、handover、memory recall は、
  既存の projection surfaces または後続の Webview/View PLAN 作業から引き続き参照可能にする。

## 受入条件

- 同一の DB input に対して snapshot が決定的であり、cold-start safe である。
- artifact の red/yellow/green 表示、plan status、gate status、graph node/edge/snapshot、
  test run、runtime verification、skill/model、guardrail counts の件数が含まれる。
- projection-only runtime evidence は accepted runtime verification ではなく、
  blocked/warning state として表示される。
- 不整合な `accept_status=accepted` を持つ projection-only row であっても、class が
  `runtime_verified` でない限り accepted runtime verification から除外される。
- commit 前に CLI JSON smoke、targeted unit tests、typecheck、lint、doctor、full tests が通る。
