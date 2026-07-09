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
updated: 2026-07-09
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
  - artifact_path: src/state-db/visualization-read-model.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/runtime/summary-surface-audit.ts
    artifact_type: source_module
  - artifact_path: tests/design-declarations.test.ts
    artifact_type: test_code
  - artifact_path: tests/current-location.test.ts
    artifact_type: test_code
  - artifact_path: tests/db-projection-ingestion.test.ts
    artifact_type: test_code
  - artifact_path: tests/visualization-view-model.test.ts
    artifact_type: test_code
  - artifact_path: tests/visualization-treeview.test.ts
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
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T09:59:42+09:00"
    tests_green_at: "2026-07-09T09:59:42+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Scrum 運営層の missing source を vmodel fit の blocker / regression guard / next action に接続し、current-location / roadmap / skill binding で検出済みの gap が fit 合否から漏れないことを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T09:55:14+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T09:55:30+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:c8f1cca259c4991c6788355ee5e4323f92f95cd2996af04c73211543bcc0872a"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T09:57:01+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:455f23d1a4c3445890b716583044990ada6b8db249e6c6e9361dc4ee26357009"
      - kind: doctor
        command: "bun run vitest run tests/slow/doctor.test.ts -t \"surfaces Project current-location|vmodel fit\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T09:57:57+09:00"
        evidence_path: tests/slow/doctor.test.ts
        output_digest: "sha256:955524e9cf869cac1c8d978ab1114fbf27179758f6d98944c70f0e298276422c"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-09T09:57:09+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T10:11:17+09:00"
    tests_green_at: "2026-07-09T10:11:17+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "ZIP source binding で bound になった Scrum 運営ソースを design_declarations へ synthetic typed declaration として自動投影し、scrum_operation_gap が current-location / vmodel fit から消えることを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T10:08:04+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: unit_test
        command: "bun run vitest run tests/db-projection-ingestion.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:08:10+09:00"
        evidence_path: tests/db-projection-ingestion.test.ts
        output_digest: "sha256:d179f519d51c65ac497ceef01dd13a36550a23f8f5b31d8cd0461f2e8cadba0e"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:09:36+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:c8f1cca259c4991c6788355ee5e4323f92f95cd2996af04c73211543bcc0872a"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:11:04+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:455f23d1a4c3445890b716583044990ada6b8db249e6c6e9361dc4ee26357009"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-09T10:09:36+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
      - kind: smoke
        command: "bun src/cli.ts db rebuild"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T10:08:40+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:38bfec99fe1001139dfa83a28224dc7fbc5c34d2a7c5e78d371ceee742a3c55c"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T10:32:30+09:00"
    tests_green_at: "2026-07-09T10:32:30+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "repair_failed_evidence の label-only failed command を、安全な解決候補ありと未解決に分離し、Recovery machine lane の次手を `safe_resolution_available` として DB/read-model/Project view に投影する。自動承認はせず、evidence patch/apply は approval-required のまま維持した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T10:29:11+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:31:27+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:c8f1cca259c4991c6788355ee5e4323f92f95cd2996af04c73211543bcc0872a"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-treeview.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:29:11+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:4ce2586a99efe303b304cf10cf4439dfb023cd7b0b5ad8b4301ecf282d4281a4"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:28:14+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:455f23d1a4c3445890b716583044990ada6b8db249e6c6e9361dc4ee26357009"
      - kind: smoke
        command: "bun src/cli.ts db rebuild"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T10:28:39+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:38bfec99fe1001139dfa83a28224dc7fbc5c34d2a7c5e78d371ceee742a3c55c"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-09T10:26:00+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T11:04:21+09:00"
    tests_green_at: "2026-07-09T11:04:21+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "safe_resolution_available の probe が `bun run test:fast` を実行できることを確認し、probe が検出した impl-plan-trace orphan と V-model fit 表示期待値のズレを是正した。materialize は read-only のまま `ready_for_approval` まで進み、closure 適用は人間承認待ちとして保持した。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/impl-plan-trace.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:57:59+09:00"
        evidence_path: tests/impl-plan-trace.test.ts
        output_digest: "sha256:5cb2945d8198ec8770564bbeb3cd3326eea48a20f11cda7d7bf4b587eae1b431"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T10:58:04+09:00"
        evidence_path: src/runtime/summary-surface-audit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T11:02:07+09:00"
        evidence_path: tests/visualization-view-model.test.ts
        output_digest: "sha256:de6bb6153739431a2d7f8aeae6ab603acf132577a2b45f65964c3b8e05ea0795"
      - kind: smoke
        command: "bun src/cli.ts closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record-20260709-safe-resolution-green.json --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T10:49:57+09:00"
        evidence_path: .helix/tmp/closure/repair_failed_evidence-probe-record-20260709-safe-resolution-green.json
        output_digest: "sha256:a9bc18fa90ceb65c3ac61d3f322dae4d74da747016ed2170c1f7223ebe7ce865"
      - kind: smoke
        command: "bun src/cli.ts closure evidence-materialize --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record-20260709-safe-resolution-green.json --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T10:55:00+09:00"
        evidence_path: .helix/tmp/closure/repair_failed_evidence-approval-draft-20260709-safe-resolution-green.yml
        output_digest: "sha256:6319931d83ce366476efa910a646af33acdf282ba68b2998da29e2288d9ce989"
---

# PLAN-L7-397: ZIP/L12 current-location projection 実装

## §0 目的

`ハイブリッド設計ドキュメントv1-fixed.zip` の採用判断を、設計 prose だけでなく harness.db の projection と
Project view に接続する。設計から typed declaration、参照、影響範囲、現在地、closure queue、駆動モデルを
機械的に再計算し、L14 到達 claim と open L7 のような矛盾を見逃さないようにする。

## §1 実装範囲

- `src/vmodel/design-declarations.ts` で Markdown/YAML frontmatter と `spec.defines` 相当の typed declaration を読む。
- `src/schema/harness-db-tables-design.ts` と `src/schema/harness-db-types.ts` で design projection table を schema registry へ登録する。
- `src/state-db/projection-writer.ts` で ZIP source binding が bound になった Scrum 運営ソースを `design_declarations` へ自動投影する。
- `src/state-db/current-location.ts` で L0-L14 既存成果物を L12 へ再投影し、設計カバレッジ、ZIP 採用、tailoring、operation scope、closure queue、drive route を返す。
- CLI は `helix current-location --json`、`helix vmodel fit --json`、`helix closure ...`、`helix progress tree-view --json` から同じ read-model を参照する。
- 2026-07-09 追補: Scrum 運営層の `scrum_operation_gap` を `vmodel fit` の blocker、`scrum-operation` regression guard、next action に接続し、roadmap / skill binding で見えている欠落が fit 合否から漏れないようにする。

## §2 受入条件

- design declaration / reference / impact が harness.db projection に登録される。
- L12 design coverage gate が typed declaration を根拠に `pass / needs_design` を返す。
- ZIP adoption と solo tailoring gate が missing / na / declared を区別する。
- L14 到達 claim と open L7 が併存する場合、current-location は `needs_recovery` と Reverse drive route を返す。
- Project view は DB/read-model 由来で `V-model fit`、ZIP adoption、tailoring gate、closure queue、operation scope を表示する。
- `scrum_operation_gap` が存在する場合、`helix vmodel fit --json` は `scrum_operation_gap` blocker、`scrum-operation` guard、`vmodel-fit:scrum_operation_gap` next action を返す。
- ZIP source binding が bound の Scrum 運営ソースは `source=zip_source_binding` の `design_declarations` として DB に投影され、`scrum_operation_gap` を解消する。

## §3 スケジュール

- step 1 (mode: serial): typed declaration parser と design projection table を実装する。
- step 2 (mode: serial): current-location / closure queue / drive route を harness.db projection へ接続する。
- step 3 (mode: serial): Project view と CLI surface を接続し、関連回帰で確認する。
