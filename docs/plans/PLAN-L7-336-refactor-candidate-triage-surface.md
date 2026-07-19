---
plan_id: PLAN-L7-336-refactor-candidate-triage-surface
title: "PLAN-L7-336 (impl): refactor candidate triage surface — 高信頼候補を actionable に出す"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L3-07 Step 6 の Forward descent 実装。既存 refactor candidate detector の high-confidence warn を actionable surface へ出す表示/doctor 配線であり、新規 product requirement は追加しない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/feedback-surface.test.ts
agent_slots:
  - role: qa
    slot_label: "Epicurus - refactor candidate actionable surface 監査"
generates:
  - artifact_path: docs/plans/PLAN-L7-336-refactor-candidate-triage-surface.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
    artifact_type: markdown_doc
  - artifact_path: src/feedback/engine.ts
    artifact_type: source_module
  - artifact_path: src/feedback/surface.ts
    artifact_type: source_module
  - artifact_path: src/state-db/feedback-projections.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/feedback-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/search-feedback.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
  requires:
    - docs/plans/PLAN-L7-334-requirements-binding-config.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T02:20:00+09:00"
    tests_green_at: "2026-07-06T02:20:00+09:00"
    verdict: approve
    scope: "高信頼 refactor candidate を telemetry に落とさず、feedback_events / takeover feedback / doctor に actionable triage surface として表示する。DB schema 変更は行わず、厳密な N 回連続履歴は別 schema 設計待ちとして扱う。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/feedback-surface.test.ts tests/search-feedback.test.ts tests/projection-writer.test.ts tests/doctor.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T02:20:00+09:00"
        evidence_path: tests/feedback-surface.test.ts
        output_digest: "sha256:2683a5fe6ab032ea257282cea94fabe2bb9b209ecfd5b2bfe3afc53ba31f5126"
---

# PLAN-L7-336: refactor 候補 triage surface

## 目的

`PLAN-L3-07` Step 6 として、high-confidence の refactor candidate が telemetry に埋もれず、
agent takeover / `helix feedback list --emit` / doctor で triage 対象として見えるようにする。

## 実装

- `src/state-db/feedback-projections.ts`: `refactor_candidate:*` かつ `status=warn` の quality signal を
  `feedback_events.severity=warn` とし、`next_action` を refactor PLAN への triage 文言にする。
- `src/feedback/surface.ts`: takeover surface でも同じ signal を `actionable` bucket に分類する。
- `src/feedback/engine.ts`: `helix feedback list --emit` 経路でも同じ severity / next action を使う。
- `src/doctor/index.ts`: `refactor-candidate-triage` を message-only warning surface として出す。

## 受入条件

- `refactor_candidate:*` の warn signal は telemetry ではなく actionable として表示される。
- `feedback_events` と takeover feedback の両方で `triage refactor candidate` が表示される。
- doctor は high-confidence 候補数と上位候補を message-only で出すが、doctor.ok は落とさない。
- DB schema は変更しない。厳密な N 回連続 surface は projection DB の履歴不足により別 PLAN とする。
