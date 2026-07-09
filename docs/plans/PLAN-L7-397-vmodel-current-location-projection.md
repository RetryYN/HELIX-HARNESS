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
  - artifact_path: src/schema/design-declarations.ts
    artifact_type: source_module
  - artifact_path: src/vmodel/zip-manifest.ts
    artifact_type: source_module
  - artifact_path: src/schema/hybrid-vmodel-manifest.ts
    artifact_type: source_module
  - artifact_path: src/vmodel/fit.ts
    artifact_type: source_module
  - artifact_path: src/state-db/vmodel-fit.ts
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
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T11:31:36+09:00"
    tests_green_at: "2026-07-09T11:31:36+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "repair_failed_evidence の machine lane を `limit 1` 誘導から、現在の repair queue 3件を一括 materialize / approval draft できる `limit 3` 誘導へ拡張した。apply は引き続き approval-required とし、承認前の自動化範囲を read-only materialize と approval draft までに限定した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T11:28:50+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:28:50+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:66a542bbd48fb8543127c87e065733618d3560068b75aa6745d98277f6a6e9c3"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:30:53+09:00"
        evidence_path: .helix/tmp/closure/verify-zip-all-vmodel-fit-20260709.json
        output_digest: "sha256:ec9fdc4100fb6498e54dc675c61989f09c9a7b7fc1a72226fadd1ac2d1fab92f"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T11:39:49+09:00"
    tests_green_at: "2026-07-09T11:39:49+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Recovery automation boundary で evidence lane の mutation 境界を `approval_required=true` / `execute_command=evidence-apply --execute` にそろえた。machine phase は probe/materialize/approval draft までを read-only で進め、patch/apply は approval record 必須として機械可読に固定した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T11:39:29+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:37:38+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:eab6ac72af1242ba8ed3523629ca5662a187ee8b292fdf4d880d21b0a6080b3c"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:39:04+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:68e0c11a83e83ad289b78a2eeeb9b729decb9b21a8fe32a33e57033f574a96b8"
      - kind: smoke
        command: "bun src/cli.ts recovery plan --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:39:29+09:00"
        evidence_path: .helix/tmp/closure/verify-approval-boundary-recovery-plan-20260709.json
        output_digest: "sha256:3d8acfe9ba8d9cf2b8b496816eb0c1b3643ef06779864451bb7a0f2cdea8133a"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:39:29+09:00"
        evidence_path: .helix/tmp/closure/verify-approval-boundary-vmodel-fit-20260709.json
        output_digest: "sha256:1093614711e624e6a103261b66ec5f7210e11c7c6bef2512bc5af051d478df3e"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T11:53:04+09:00"
    tests_green_at: "2026-07-09T11:53:04+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Project view / read-model / vmodel handoff scope の evidence command limit を closure queue の現在件数に追従させた。実プロジェクトの repair_failed_evidence 3件では tree-view 上位コマンド、work bucket、materialize/apply 表示、close_ready reject ルートが `limit 3` になり、古い `limit 1` approval draft は scope mismatch として検出される。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T11:50:44+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:50:44+09:00"
        evidence_path: tests/visualization-view-model.test.ts
        output_digest: "sha256:2a797ac6b613c88ab68e26d7cfaa7cc44c335951ac5ab508f0ad1f326a2c1e66"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:52:26+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:151d320829a0b11e1773c37cc15cfcd8460725907c13381c4abfd52ab7bcd724"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:51:03+09:00"
        evidence_path: .helix/tmp/closure/verify-view-limit-tree-summary-final-20260709.json
        output_digest: "sha256:da2fcf9b255a6fe2ddfb0f90fa497b7c405d1da5eeb46eacee46b9b4be1dda52"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:51:03+09:00"
        evidence_path: .helix/tmp/closure/verify-view-limit-vmodel-fit-20260709.json
        output_digest: "sha256:e5a946c27a17160c838296350bdb90c5bf08dcd4f2a9a8fe16126a6ba8a717aa"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:04:02+09:00"
    tests_green_at: "2026-07-09T12:04:02+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "approval draft の approval_scope_digest が current materialize scope と不一致になった場合、既存 draft を上書きせず digest 付き refresh draft へ再発行する handoff next を vmodel fit と Project view に投影する。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:03:56+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:03:57+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:140f9612fb038b3718d444edf1938a2fc1a9afe42d4965b1da7141c1fea67b98"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:04:02+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:daef7db4012e9319b992f77642aed3f13f19286e80093a4eafbd76d41a6b38aa"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:21:00+09:00"
    tests_green_at: "2026-07-09T12:21:00+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "refresh approval draft を生成後、canonical stale draft ではなく matching refresh draft を active approval record として採用し、vmodel fit / Project view が approval_pending へ進むことを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:19:00+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:19:01+09:00"
        evidence_path: tests/visualization-read-model.test.ts
        output_digest: "sha256:d8c77dcaf558b8e90ba1c7949ccc4b3a9ed9c788c6f6d05268708d562b281d9a"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:19:06+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:b98f6a61aa236d5d83cbd23aeedaa2306b4f5083d2a7832f911816d5cc0ed76d"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:34:00+09:00"
    tests_green_at: "2026-07-09T12:34:00+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "approval_pending に到達した後、人間承認者が stale canonical ではなく active refresh approval record を機械的に開けるよう、vmodel fit / Project view / CLI summary に approval_record_path を投影した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:32:10+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/current-location.test.ts tests/cli-surface.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:33:39+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:386058ebc9cc55f28d8a4602fef1e5a00174cf5aa9280c59a9022a528b665be6"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:33:45+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:4abdac235b064b5781e4430a3d5450edb317f81dc7aec82594a2e0c723790b11"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:42:43+09:00"
    tests_green_at: "2026-07-09T12:42:43+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Project view の recovery handoff gate が repoRoot 非依存の view-model 経路でも active refresh approval draft の実 path を採用し、vmodel fit と同じ approval_record_path を機械表示できることを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:42:43+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/current-location.test.ts tests/cli-surface.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:42:43+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:2b06fa546cc67897c7f00cccbf29aea8d769dd587cb53f1bea1c1a7527b29b75"
      - kind: smoke
        command: "bun src/cli.ts progress view-model --json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:42:43+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:3c1629b0619c04b737e2b10073edee3e194404c19a0756b393dd7acef85dedd1"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:42:43+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:acc4b4cc35d8bc030e3c8a375f915cf4b07254d96e1f3fbb1c59561ad9457b00"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:52:16+09:00"
    tests_green_at: "2026-07-09T12:52:16+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Project view の recovery plan 配下へ handoff gate を追加し、DB recovery reentry が machine_phase_pending のままでも active refresh approval draft により local handoff が approval_pending へ進んだことを同じ recovery plan surface で確認できるようにした。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:52:16+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/current-location.test.ts tests/cli-surface.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:52:16+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:482e828509c63f370c7bf2c09c39f2f6da22c30b26d1d5aac4f762e8cfe446cc"
      - kind: smoke
        command: "bun src/cli.ts progress view-model --json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:52:16+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:65f784e967005601092051fe32c147c7fde1be4c87f79fd169fd9eff44108c10"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:52:16+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:870e58393cdd1417c3f85d6804ffbe131ed3d1d4cd3055be0fadf21db0614063"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T13:16:26+09:00"
    tests_green_at: "2026-07-09T13:16:26+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Vモデルfit の実体を state-db read-model 側へ移し、旧 vmodel path は証跡アンカーへ縮退した。ZIP manifest と design declaration parser は schema 側の中立検出器へ寄せ、current-location / Project view / projection-writer が vmodel module へ戻る静的依存を持たないことを dependency-drift で確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:16:26+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/plan-entry-routing.test.ts tests/dependency-drift.test.ts tests/current-location.test.ts tests/vmodel-zip-manifest.test.ts tests/design-declarations.test.ts tests/goal-evidence-audit.test.ts tests/coding-rules.test.ts tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:16:26+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:f21b53bb1a371126766a3b459467aa1351093454bd9fdd10cf92495d9edede58"
      - kind: smoke
        command: "bun -e 'import { analyzeDependencyDrift, loadDependencyDriftInput } from \"./src/lint/dependency-drift\"; const r=analyzeDependencyDrift(loadDependencyDriftInput(process.cwd())); console.log(JSON.stringify({ok:r.ok,count:r.findings.length,errors:r.findings.filter(f=>f.severity===\"error\").length,warnings:r.findings.filter(f=>f.severity===\"warn\").length,findings:r.findings}, null, 2));'"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:16:26+09:00"
        evidence_path: src/lint/dependency-drift.ts
        output_digest: "sha256:f6fa5ac850c768a325485423ae0809b688ea5dc6413ba55f8d1ab8df05b9e42e"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T13:34:28+09:00"
    tests_green_at: "2026-07-09T13:34:28+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Recovery machine lane の `closure evidence-probe --execute --out` が既存 probe record を検出した場合、DB rebuild や `bun run test:fast` 実行前に fail-fast するようにした。既存 record 上書きは引き続き拒否し、承認前の evidence handoff artifact を壊さない。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:34:28+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"writes executed evidence probe records\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:34:28+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:63d893a4e6bee60bcb2544a33ccbe6de1fc677266ac7608636fee2b5121c481f"
      - kind: smoke
        command: "bash -lc 'bun src/cli.ts closure evidence-probe --action repair_failed_evidence --limit 3 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --summary-json; test $? -eq 2'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:34:28+09:00"
        evidence_path: .helix/tmp/closure/repair_failed_evidence-probe-record.json
        output_digest: "sha256:ed343eadd4087e6df0e5fd8018496826c7c4d486d2866df782f94c8ba83f123d"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T13:41:36+09:00"
    tests_green_at: "2026-07-09T13:41:36+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "DB current-location が machine_phase_pending のままでも、ローカル handoff artifact が approval_pending まで進んでいる状態を `current-location --summary-json` と `recovery plan --summary-json` に併記した。Project view / vmodel fit だけでなく、工程表・駆動モデル summary でも承認待ちの現在地を機械判定できる。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:41:36+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:41:36+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:cd82ad72adc04f47dade95b7344d6cff12a7a6a71824b08a40cd6e89117c23f5"
      - kind: smoke
        command: "bash -lc 'bun src/cli.ts current-location --summary-json | rg -n \"local_handoff|approval_pending|approval_record_path\" -C 1 && bun src/cli.ts recovery plan --summary-json | rg -n \"recovery_handoff_gate|approval_pending|approval_record_path\" -C 1'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:41:36+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:c0bde01688a1349ddd96f3d3563323a6639344543c149a2305861227cfca23fe"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T13:51:45+09:00"
    tests_green_at: "2026-07-09T13:51:45+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Project view の work bucket / automation runway / closure overview が stale canonical approval draft ではなく、scope match 済み active refresh approval draft をコピー対象にするよう修正した。承認者が同じ `approval_record_path` を handoff gate、V-model next action、closure work bucket のどこからでも辿れる。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:50:08+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:50:08+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:07aadf8395cc65cf707e9b9f4b73623fb22c4d3ff037be0444937c5384163724"
      - kind: smoke
        command: "bash -lc 'bun src/cli.ts progress tree-view --json | rg -n \"automation-runway/1-repair_failed_evidence/approval-draft|work-bucket/approval-draft-artifact|repair_failed_evidence-approval-draft-refresh-0735\" -C 1'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:50:08+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:7838416b720cf27b18c7aaa9d582e7c9ca5374fda4d1167c00781d2518ce80e2"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:51:45+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:448e2bc9d56c672f93673405f5deacbe7deaaf36a190d83c71f7674ffc3fea5b"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:05:57+09:00"
    tests_green_at: "2026-07-09T14:05:57+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "`reentry_status=machine_phase_pending` を raw DB forecast として残しつつ、local handoff が approval_pending へ進んだ場合の実効現在地を `effective_reentry_status` / `effective_status` として `current-location --summary-json`、`recovery plan --summary-json`、`vmodel fit --summary-json` に投影した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:59:21+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:59:21+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:8e5b0e462ad8e72ad5a10bf945d81792774c853cbb68e8d2b3af86b425d456bd"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:59:21+09:00"
        evidence_path: tests/visualization-view-model.test.ts
        output_digest: "sha256:1389eeae9f776b5c34537f04c0ed5c136b3508af556d67d3d53a4670c374b6a8"
      - kind: smoke
        command: "bash -lc '{ bun src/cli.ts current-location --summary-json | rg -n \"reentry_status|effective_reentry_status|local_handoff|approval_pending|machine_phase_pending\" -C 1; bun src/cli.ts recovery plan --summary-json | rg -n \"reentry_forecast|effective_status|recovery_handoff_gate|approval_pending|machine_phase_pending\" -C 1; bun src/cli.ts vmodel fit --summary-json | rg -n \"current_reentry_status|effective_reentry_status|effective_status|recovery_handoff_gate|approval_pending|machine_phase_pending\" -C 1; }'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:59:21+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:242600338707fb7f7950bb4427cdf4585c56c09e5630255a370addd689e45512"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:05:57+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:077a0faa8bad8b38c49af98d2867636d2454b32e20ac21e2bddda7ffa871aab6"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:21:25+09:00"
    tests_green_at: "2026-07-09T14:21:25+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "raw `machine_phase_pending` を保持しながら、CLI 通常テキスト、doctor、Project view / VSCode tree view の reentry 表示を handoff-aware な `effective=approval_pending` へ揃えた。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:18:58+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:18:58+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:4f31abcee6eb81ed650e4bd0bb373ffad21157f72fe971858c629aeb3102de43"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:18:58+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:db1e1c912b21ee5b5248abcd337429eb464c624605121426e419b391a3db06cb"
      - kind: smoke
        command: "bash -lc '{ bun src/cli.ts current-location | rg -n \"recovery-reentry: status=machine_phase_pending effective=approval_pending\"; bun src/cli.ts recovery plan --limit 3 | rg -n \"reentry-forecast: status=machine_phase_pending effective=approval_pending\"; bun src/cli.ts vmodel fit | rg -n \"synthesis: .*reentry=machine_phase_pending effective=approval_pending|recovery-reentry: status=machine_phase_pending effective=approval_pending\"; bun src/cli.ts progress tree-view --json | rg -n \"approval_pending raw=machine_phase_pending|reentry=approval_pending|effective=approval_pending\" -C 1; }'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T14:18:58+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:621c5eff1be0f1d4ac682136c15720d2b3ad321a119e7afa47204817ece3ba61"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:21:25+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:95b00909dcec11dad11776208b34da1153a5f8a752bd44500444ac203c274772"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:29:49+09:00"
    tests_green_at: "2026-07-09T14:29:49+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "L12 operation scope の `observed_gap` を regression guard へ昇格し、missing/reverify が無い設計済み未観測 scope を `operation-scope:watch` として CLI / doctor / Project view read-model に投影するようにした。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts -t \"operation\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:fbc3675959fd9d93802f44abed3bda7070837b940d52e1db544b58855f067154"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:8e5f6ed25f0ccdeb479bb43d3cb986de4856ed736a1de050ea8ec912ab5eeaad"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:e3e46c89c822ea109423aeca7ce339801020234758987ccdcac022d4a8f6953f"
      - kind: smoke
        command: "bash -lc 'set -o pipefail; { bun src/cli.ts vmodel fit | rg \"regression-guard: operation-scope watch count=5|operation-scope: designed=5 observed=1 observed_gap=5\"; bun src/cli.ts doctor | rg \"operation-scope:watch:5|vmodel-fit - operation-scope: designed=5 observed=1 observed_gap=5\"; }'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:9b1b40924c8980587120e3775c06b83a4d8b34022419729eb64b3a0291c63fd2"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:36607a366efda9954059a2ff7d84e3ea265c8a617ff47bbe67c3f27d38893f29"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:38:06+09:00"
    tests_green_at: "2026-07-09T14:38:06+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "`vmodel fit --summary-json` の regression guard 要約で pass 先頭5件が watch/fail を隠す問題を解消し、`attention_guards` と非pass優先 `sample_guards` で operation-scope / current-location-reentry を機械的に見えるようにした。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:38:06+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:38:06+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:e971e1d66b2e61d3212f4f5d2c7f18933e409dafbb07b181baa01e4e8216fbb4"
      - kind: smoke
        command: "bash -lc 'set -o pipefail; bun src/cli.ts vmodel fit --summary-json | rg \"attention_guards|operation-scope|current-location-reentry|sample_guards\" -C 2'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T14:38:06+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:6b3015e3964d0797d221dc11fa09ba02d0e4f0b0d0f82e2ab683018edcd6ebe3"
---

# PLAN-L7-397: ZIP/L12 current-location projection 実装

## §0 目的

`ハイブリッド設計ドキュメントv1-fixed.zip` の採用判断を、設計 prose だけでなく harness.db の projection と
Project view に接続する。設計から typed declaration、参照、影響範囲、現在地、closure queue、駆動モデルを
機械的に再計算し、L14 到達 claim と open L7 のような矛盾を見逃さないようにする。

## §1 実装範囲

- `src/schema/design-declarations.ts` で Markdown/YAML frontmatter と `spec.defines` 相当の typed declaration を読み、`src/vmodel/design-declarations.ts` は証跡互換の re-export とする。
- `src/schema/harness-db-tables-design.ts` と `src/schema/harness-db-types.ts` で design projection table を schema registry へ登録する。
- `src/state-db/projection-writer.ts` で ZIP source binding が bound になった Scrum 運営ソースを `design_declarations` へ自動投影する。
- `src/state-db/current-location.ts` で L0-L14 既存成果物を L12 へ再投影し、設計カバレッジ、ZIP 採用、tailoring、operation scope、closure queue、drive route を返す。
- CLI は `helix current-location --json`、`helix vmodel fit --json`、`helix closure ...`、`helix progress tree-view --json` から同じ read-model を参照する。`buildVmodelFitReport` の実体は `src/state-db/vmodel-fit.ts` に置き、`src/vmodel/fit.ts` は証跡アンカーとして dependency-free に保つ。
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
