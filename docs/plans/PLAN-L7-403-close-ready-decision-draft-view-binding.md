---
plan_id: PLAN-L7-403-close-ready-decision-draft-view-binding
title: "PLAN-L7-403 (impl): close_ready decision draft の Project view 検出"
kind: impl
layer: L7
drive: be
status: completed
route_mode: forward
created: 2026-07-09
updated: 2026-07-09
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-09 ZIP改善の残件として、ハイブリッド版差し替え前に現在地と承認待ち artifact の視認性を上げる"
backprop_decision: not_required
backprop_decision_reason: "既存 L1/L3 visualization 要件と L6 read-model 契約の範囲内で、close_ready 承認前 artifact を read-only projection に追加するだけであり、上位要求の追加はない。"
agent_slots:
  - role: tl
    slot_label: "TL - close_ready 承認境界と read-only 可視化"
  - role: aim
    slot_label: "AIM - visualization read-model artifact detection"
  - role: qa
    slot_label: "QA - Project Tree View oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-403-close-ready-decision-draft-view-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/state-db/visualization-read-model.ts
    artifact_type: source_module
  - artifact_path: tests/visualization-read-model.test.ts
    artifact_type: test_code
  - artifact_path: tests/visualization-treeview.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
  requires:
    - docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
    - docs/plans/PLAN-L7-402-class-method-contract-runtime-evidence.md
  references:
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/test-design/helix/vmodel-docgen-fit-acceptance.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T20:33:49+09:00"
    tests_green_at: "2026-07-09T20:33:49+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "close_ready decision draft を recovery handoff artifact として検出し、Project view で path / generation command / approval scope / outcome を read-only に表示する。承認や apply は実行しない。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T20:33:49+09:00"
        evidence_path: src/state-db/visualization-read-model.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run test:fast -- tests/visualization-read-model.test.ts tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:33:49+09:00"
        evidence_path: tests/visualization-read-model.test.ts
        output_digest: "sha256:9247f344976e3ab72e10a58506d73ad99ac0df838a2350c449307c127fc3beef"
      - kind: lint
        command: "bunx biome check src/state-db/visualization-read-model.ts tests/visualization-read-model.test.ts tests/visualization-treeview.test.ts docs/design/harness/L6-function-design/function-spec.md docs/test-design/harness/L7-unit-test-design.md docs/test-design/harness/L8-unit-test-design.md docs/plans/PLAN-L7-403-close-ready-decision-draft-view-binding.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:33:49+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:a298a1e12f1a3546ab7b4f538728228f998df1e22844d7e27caf6d7bb0f16809"
---

# PLAN-L7-403: close_ready decision draft の Project view 検出

## 目的

ハイブリッド版の差し替え前に、残る `close_ready` approval gate が Project view から見えない状態を補修する。
`closure decision-draft` が生成した local artifact は承認 record そのものではなく、承認前 review の材料であるため、
read-only の handoff artifact として検出し、現在地・工程表・承認待ちを同じ画面で追えるようにする。

## スコープ

- `.helix/tmp/closure/close_ready-decision-draft.yml` を `decision_draft` artifact として検出する。
- `reviewed_count` 形式の approval record field を読み、`approve_closure_claim` と rejection outcome を分類する。
- Project Tree View は artifact path、生成 command、approval scope、outcome を表示する。
- この PLAN は承認や apply を実行しない。承認は人間判断 gate のまま維持する。

## 受入条件

- `tests/visualization-read-model.test.ts` に `close_ready decision_draft` の実在検出と `approve_closure_claim` の positive oracle がある。
- `tests/visualization-treeview.test.ts` に Project view node の path / command / scope tooltip oracle がある。
- `bun run typecheck`、targeted visualization tests、Biome check が green。
