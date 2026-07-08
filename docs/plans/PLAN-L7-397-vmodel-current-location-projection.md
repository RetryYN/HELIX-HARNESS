---
plan_id: PLAN-L7-397-vmodel-current-location-projection
title: "PLAN-L7-397 (impl): ZIP/L12 typed declaration と current-location projection の実装接続"
kind: impl
layer: L7
drive: be
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-08 ハイブリッド設計ドキュメントv1-fixed.zip を基に、工程表と harness.db 現在地を結び、厳格な機械検出と駆動モデル選択へ接続する"
created: 2026-07-08
updated: 2026-07-08
backprop_decision: not_required
backprop_decision_reason: "L3 構想と L12 採用マトリクスを実装 projection へ接続する L7 実装であり、L0/L1 の意味変更や runtime state 名称変更は行わない。"
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - ZIP/L12 適合、設計カバレッジ、駆動モデル境界のレビュー"
  - role: se
    slot_label: "SE - typed declaration、harness.db design tables、current-location projection の実装"
  - role: qa
    slot_label: "QA - current-location、design declaration、Project view の機械検出検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
    artifact_type: markdown_doc
  - artifact_path: src/vmodel/design-declarations.ts
    artifact_type: source_module
  - artifact_path: src/vmodel/zip-manifest.ts
    artifact_type: source_module
  - artifact_path: src/vmodel/fit.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-tables-design.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-types.ts
    artifact_type: source_module
  - artifact_path: src/state-db/current-location.ts
    artifact_type: source_module
  - artifact_path: tests/design-declarations.test.ts
    artifact_type: test_code
  - artifact_path: tests/current-location.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-44-harness-db-master.md
    - docs/plans/PLAN-L7-205-run-debug-db-projection.md
    - docs/plans/PLAN-L7-372-visualization-view-model-impl.md
  references:
    - docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
    - docs/design/helix/L3-requirements/vmodel-docgen-fit.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/design/helix/L12-vmodel/vmodel-layer-coverage.md
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md
    - docs/test-design/harness/L8-unit-test-design.md
    - docs/test-design/helix/vmodel-docgen-fit-acceptance.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-08T07:57:06+09:00"
    tests_green_at: "2026-07-08T07:57:06+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "ZIP の typed spec / impact / tailoring / 工程表 current-location 境界を TS/Bun 実装へ接続し、design declarations、design references、design impact、L12 coverage、closure queue、drive route、vmodel fit が DB projection から再計算されることを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-08T07:57:06+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:58d6182559414d8a12831ddad23bfb949d51944c5a78f49628e432870c90e0bd"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/design-declarations.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-08T07:57:06+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:973b345a06682be9837cef500c59358d9ddcbf54c4fd91d09fefdb1c6bda47e0"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/design-declarations.test.ts tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/vscode-extension-adapter.test.ts tests/cli-surface.test.ts tests/db-projection-ingestion.test.ts tests/projection-writer.test.ts tests/state-db.test.ts tests/slow/doctor.test.ts"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-08T07:57:06+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:ed4b4184dc553905a02b1c3a75d2158f0d1d20963f4668caa32692cbccbecb8a"
---

# PLAN-L7-397: ZIP/L12 current-location projection 実装

## §0 目的

`ハイブリッド設計ドキュメントv1-fixed.zip` の採用判断を、設計 prose だけでなく harness.db の projection と
Project view に接続する。設計から typed declaration、参照、影響範囲、現在地、closure queue、駆動モデルを
機械的に再計算し、L14 到達 claim と open L7 のような矛盾を見逃さないようにする。

## §1 実装範囲

- `src/vmodel/design-declarations.ts` で Markdown/YAML frontmatter と `spec.defines` 相当の typed declaration を読む。
- `src/schema/harness-db-tables-design.ts` と `src/schema/harness-db-types.ts` で design projection table を schema registry へ登録する。
- `src/state-db/current-location.ts` で L0-L14 既存成果物を L12 へ再投影し、設計カバレッジ、ZIP 採用、tailoring、operation scope、closure queue、drive route を返す。
- CLI は `helix current-location --json`、`helix vmodel fit --json`、`helix closure ...`、`helix progress tree-view --json` から同じ read-model を参照する。

## §2 受入条件

- design declaration / reference / impact が harness.db projection に登録される。
- L12 design coverage gate が typed declaration を根拠に `pass / needs_design` を返す。
- ZIP adoption と solo tailoring gate が missing / na / declared を区別する。
- L14 到達 claim と open L7 が併存する場合、current-location は `needs_recovery` と Reverse drive route を返す。
- Project view は DB/read-model 由来で `V-model fit`、ZIP adoption、tailoring gate、closure queue、operation scope を表示する。

## §3 スケジュール

- step 1 (mode: serial): typed declaration parser と design projection table を実装する。
- step 2 (mode: serial): current-location / closure queue / drive route を harness.db projection へ接続する。
- step 3 (mode: serial): Project view と CLI surface を接続し、関連回帰で確認する。
