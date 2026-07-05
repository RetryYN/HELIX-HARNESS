---
plan_id: PLAN-L7-129-incident-route-token-coverage
title: "PLAN-L7-129: route token coverage"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - route token coverage"
generates:
  - artifact_path: docs/plans/PLAN-L7-129-incident-route-token-coverage.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-129-incident-route-token-coverage.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-123-route-eval-recommended-command.md
  requires:
    - docs/plans/PLAN-L7-123-route-eval-recommended-command.md
    - docs/plans/PLAN-REVERSE-129-incident-route-token-coverage.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T15:45:00+09:00"
    tests_green_at: "2026-06-23T15:45:00+09:00"
    verdict: approve
    scope: "Route eval covers missing requirements 7.8.1 tokens and removes stale helper routing."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\workflow-contracts.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T15:45:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:45:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:45:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-L7-129: route token coverage の補完

## 目的

実装済み route map が requirements 7.8.1 で宣言された未対応の signal token を扱えるようにし、
helper routing も同じ rule path に揃える。

## スコープ

- `production_incident`、`hotfix_required`、`regression_prod` を incident route token set に追加する。
- `drift` を reverse route token set に追加する。
- 軽量 interrupt token の `new_requirement` と `po_change` を add-feature へ route する。
- `routeSignalToMode` を `evaluateRouteCommand` と同じ route map および longest-token priority から導出する。
- incident route は既存の approval resolver を通じて human approval gate を維持する。
- 宣言済み token が期待される mode に解決されるよう regression coverage を追加する。
- requirements acceptance evidence と L4 function design を back-fill する。

## 受入条件

- `production_incident`、`hotfix_required`、`regression_prod` は `incident` へ route される。
- `drift` は `reverse` へ route される。
- `new_requirement` は `add-feature` へ route される。
- `routeSignalToMode` と `evaluateRouteCommand` は covered token について一致する。
- incident route は `requires_human_approval=true` を返す。
- approval policy がない incident route は exit 1 になる。
