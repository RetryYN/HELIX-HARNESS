---
plan_id: PLAN-L7-326-route-mode-first-class-projection
title: "PLAN-L7-326 (impl): route_modes first-class projection"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-05
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-321 の completeness pass 欠落から切り出した harness.db projection の read-model 追加であり、新規 product requirement や上位設計の意味変更を追加しない。L5/L6/L7 の物理 schema・関数契約・oracle 追跡は本 PLAN 内で更新済み。"
owner: Codex
parent_design: docs/plans/PLAN-L7-321-completeness-pass-gaps.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE - route mode first-class projection"
  - role: qa
    slot_label: "QA - harness.db projection / physical-data coverage oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-326-route-mode-first-class-projection.md
    artifact_type: markdown_doc
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-tables-core.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-indexes.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-321-completeness-pass-gaps.md
  references:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T01:36:57+09:00"
    tests_green_at: "2026-07-05T01:36:57+09:00"
    verdict: approve
    scope: "PLAN-L7-321 の residual gap のうち route_mode first-class projection だけを独立実装した。既存 drive_runs.mode を壊さず route_modes read model と index を追加し、physical-data coverage と projection writer test で固定した。doctor hard gate の意味変更、物理 rename、PLAN-M-02 cutover は行っていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts tests/db-projection-coverage.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T01:36:57+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:3d753ea3517f1165d196c7d65cc9497fed6cec0f24ec07bf8fbd6900d909ea25"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:36:57+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:7ca4e34d15343e71be75dea9d40ab95dde926ac07b5504bdff8ba07135a86887"
      - kind: doctor
        command: "./scripts/ut-tdd doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:36:57+09:00"
        evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
        output_digest: "sha256:45c09c20576cd930418ea092793ff39568c8d53cdeb59c3f7339febe86d2f31f"
---

# PLAN-L7-326: route_modes first-class projection 実装

## 目的

上流突合 completeness pass で、drive mode は `drive_runs.mode` と routing contract に存在するが、
harness.db 上で mode を first-class に検索・監査できる read model が無いことが残っていた。

## スコープ

- `route_modes` table と `idx_route_modes_plan_mode` を schema registry に追加し、schema version を更新する。
- `projectDriveRuns` で `drive_runs` と同じ source から `route_modes` を同時投影する。
- L5 physical-data、L6 function spec、L7 unit test design を日本語で追跡更新する。
- `tests/projection-writer.test.ts` と `tests/db-projection-coverage.test.ts` で projection と schema-doc coverage を固定する。

## 対象外

- `drive-db-registration` doctor の hard gate 意味変更は本 PLAN では行わない。
- `.ut-tdd` / `ut-tdd` の物理 rename、distribution cutover、remote apply は PLAN-M-02 承認まで行わない。

## 受入結果

- required drive model は `drive_runs.mode` と `route_modes.mode` の両方へ投影される。
- `route_modes.drive_run_id` は既存 `drive_runs.drive_run_id` と join できる。
- physical-data §9.1 / §9.3 と schema registry の table / index coverage が一致する。
