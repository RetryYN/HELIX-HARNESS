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
  - artifact_path: src/state-db/visualization-view-model.ts
    artifact_type: source_module
  - artifact_path: src/state-db/vmodel-fit.ts
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
    reviewed_at: "2026-07-09T20:53:08+09:00"
    tests_green_at: "2026-07-09T20:53:08+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "close_ready decision draft を recovery handoff artifact として検出し、Project view と vmodel fit の recovery handoff gate で path / generation command / closure review scope / outcome / approval lane を read-only に表示する。承認や apply は実行しない。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T20:51:43+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:44220009afe0690be55eb18f2b4b35dee3d3bb863b32a1b2318af0386a4f54fe"
      - kind: unit_test
        command: "bun run test:fast -- tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/visualization-read-model.test.ts tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:51:43+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:bc90533aa30bf12d60253e022d129ca75a5c9bc54609e5adf25b58a61f000eb8"
      - kind: lint
        command: "bunx biome check src/state-db/vmodel-fit.ts src/state-db/visualization-view-model.ts src/state-db/visualization-read-model.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/visualization-read-model.test.ts docs/design/harness/L6-function-design/function-spec.md docs/test-design/harness/L7-unit-test-design.md docs/test-design/harness/L8-unit-test-design.md docs/plans/PLAN-L7-403-close-ready-decision-draft-view-binding.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:52:20+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:1cc2721ab074411f0a1d41a8cf0872cb13cec2e15f700af13034c18e98b07b70"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit | rg \"recovery-handoff-gate|next-work-bucket|recovery-reentry|vmodel fit:|approval-review-gate\" && bun src/cli.ts progress tree-view --json | rg \"vmodel-fit/recovery-handoff|close_ready approval pending|approval_record_path=.helix/tmp/closure/close_ready-decision-draft.yml|handoff=approval_pending|recovery-plan/handoff-gate|approval_state=pending_human_review|current closure review scope\" && bun src/cli.ts doctor | rg \"coding-rules|change-impact|change-set-integrity|plan-governance|review-evidence|oracle-test-trace|objective-evidence-audit|visualization-tree-view-boundary|vscode-extension-dynamic-binding|operation-scope|current-location-reentry|vmodel-fit - recovery-handoff-gate|doctor:\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:52:43+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:5b9a2fa24f1d4c60326b8e87328ca1e6a5ded018e0cbf6854d469910e96c72eb"
---

# PLAN-L7-403: close_ready decision draft の Project view 検出

## 目的

ハイブリッド版の差し替え前に、残る `close_ready` approval gate が Project view から見えない状態を補修する。
`closure decision-draft` が生成した local artifact は承認 record そのものではなく、承認前 review の材料であるため、
read-only の handoff artifact として検出し、現在地・工程表・承認待ちを同じ画面で追えるようにする。

## スコープ

- `.helix/tmp/closure/close_ready-decision-draft.yml` を `decision_draft` artifact として検出する。
- `reviewed_count` 形式の approval record field を読み、`approve_closure_claim` と rejection outcome を分類する。
- Project Tree View は artifact path、生成 command、closure review scope、outcome を表示する。
- `vmodel fit` と Project Tree View の recovery handoff gate は、`close_ready` の `decision_draft` を approval lane として投影する。
- この PLAN は承認や apply を実行しない。承認は人間判断 gate のまま維持する。

## 受入条件

- `tests/visualization-read-model.test.ts` に `close_ready decision_draft` の実在検出、`approve_closure_claim`、closure review scope 照合の positive oracle がある。
- `tests/visualization-treeview.test.ts` に Project view node の path / command / scope tooltip と、`vmodel-fit/recovery-handoff` / `drive/recovery-plan/handoff-gate` の approval lane oracle がある。
- `bun run typecheck`、targeted visualization tests、Biome check が green。
