---
plan_id: PLAN-L7-398-projection-lint-boundary-repair
title: "PLAN-L7-398 (troubleshoot): DB projection lint 境界と current-location helper arity 修正"
kind: troubleshoot
layer: L7
drive: be
status: completed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-09 doctor coding-rules / ddd-tdd-rules が src/lint/db-projection-ingestion.ts の module-boundary/domain-boundary と src/state-db/current-location.ts の max-source-params を検出したため、ZIP/L12 projection 境界を修正する"
created: 2026-07-09
updated: 2026-07-09
backprop_decision: not_required
backprop_decision_reason: "既存 module-drift / coding-rules の境界違反を L7 で補修するだけで、L3/L12 要件や DB schema の意味変更は追加しない。"
owner: Codex / TL
agent_slots:
  - role: aim
    slot_label: "AIM - 境界修正"
parent_design: docs/design/harness/L6-function-design/module-drift.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-398-projection-lint-boundary-repair.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/module-drift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/db-projection-ingestion.ts
    artifact_type: source_module
  - artifact_path: src/state-db/current-location.ts
    artifact_type: source_module
  - artifact_path: src/lint/tracked-canonical.ts
    artifact_type: source_module
  - artifact_path: tests/coding-rules.test.ts
    artifact_type: test_code
  - artifact_path: tests/tracked-canonical.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
  requires:
    - docs/design/harness/L6-function-design/module-drift.md
    - docs/test-design/harness/L7-unit-test-design.md
    - src/lint/db-projection-ingestion.ts
    - src/state-db/current-location.ts
    - src/lint/tracked-canonical.ts
    - tests/coding-rules.test.ts
    - tests/tracked-canonical.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T04:39:12+09:00"
    tests_green_at: "2026-07-09T04:39:12+09:00"
    verdict: approve
    scope: "DB projection ingestion lint が Vモデル ZIP manifest 実装 constant を直接 import しないようにし、current-location の Scrum operation helper を input object 化して source max params を解消した。U-CODE-011 に lint -> vmodel 禁止 import の oracle を追加した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T04:21:25+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/change-impact.test.ts tests/plan-entry-routing.test.ts tests/coding-rules.test.ts tests/ddd-tdd-rules.test.ts tests/db-projection-ingestion.test.ts tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T04:21:25+09:00"
        evidence_path: tests/coding-rules.test.ts
        output_digest: "sha256:6fdc72b74e5ab0b8f957c2eb596d5495e8b6d4df083f26a2f87e58de51e67e73"
      - kind: unit_test
        command: "bun run vitest run tests/tracked-canonical.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T04:39:12+09:00"
        evidence_path: tests/tracked-canonical.test.ts
        output_digest: "sha256:c025fcc963b8c97b4e54f35512bb589e572fac96343f5c605896409fad36e3bc"
    note: "doctor --json は coding-rules / ddd-tdd-rules / db-projection-ingestion / change-impact / change-set-integrity / plan-governance / tracked-canonical / zip-adoption-binding / handover が OK。既存の project-current-location l14_claim_with_l7_work は Recovery lane として残る。"
---

# PLAN-L7-398: DB projection lint 境界と current-location helper arity 修正

## 目的

ハイブリッド版 L12 現在地 projection を強化した後、`doctor` の coding-rule gate が以下を検出した。

- `src/lint/db-projection-ingestion.ts` が `src/vmodel/zip-manifest.ts` を直接 import し、lint 層が Vモデル実装層へ依存している。
- `src/state-db/current-location.ts` の Scrum operation item helper が4引数になり、`max-source-params` を破っている。

## 実装方針

- DB projection ingestion gate は ZIP 固有 constant ではなく、`vmodel_zip_manifest` / `vmodel_zip_source_bindings` の projection table 契約を検査する。
- Vモデル ZIP の実ファイル名・binding 実体は `vmodel` / `state-db` の projection 側に閉じ、`lint` は projection 結果の有無だけを判定する。
- Scrum operation helper は input object 化し、current-location の検出ロジックを引数順へ依存させない。
- U-CODE-011 に `src/lint/* -> src/vmodel/*` 禁止 import の回帰 oracle を追加する。
- 完成版 ZIP を top-level reference package として残すため、`tracked-canonical` は Git の quoted path ではなく UTF-8 path で canonical tree と照合する。

## 完了条件

- `coding-rules` と `ddd-tdd-rules` の実 repo guard が violations 0。
- `db-projection-ingestion` が OK のまま。
- `change-impact` と `change-set-integrity` が、この変更集合に対して source/design/test の対応を検出できる。
