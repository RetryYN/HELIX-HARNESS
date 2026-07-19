---
plan_id: PLAN-L7-399-runtime-verification-schema-boundary
title: "PLAN-L7-399 (refactor): 実行時検証スキーマ境界"
kind: refactor
layer: L7
drive: be
status: confirmed
route_mode: refactor
created: 2026-07-09
updated: 2026-07-09
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-09 ハイブリッドL12適合のため dependency-drift の runtime -> state-db -> runtime 循環エラーを解消し、機械検出境界を強化する"
backprop_decision: not_required
backprop_decision_reason: "実行時検証の型・分類・検証を schema SSoT に抽出する境界整理であり、ユーザー向け実行時振る舞いや DB 構造を変更しない。L6 function-spec へ配置境界を追補済み。"
agent_slots:
  - role: tl
    slot_label: "TL - dependency-drift 境界と L6 契約整合"
  - role: se
    slot_label: "SE - 実行時検証の純粋 schema 抽出"
  - role: qa
    slot_label: "QA - run-debug / projection writer / dependency-drift 回帰検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-399-runtime-verification-schema-boundary.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/schema/runtime-verification.ts
    artifact_type: source_module
  - artifact_path: src/runtime/run-debug.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/harness/L6-function-design/function-spec.md
  requires:
    - docs/plans/PLAN-REVERSE-42-regression-dependency-drift.md
    - docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
  references:
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
    - tests/run-debug.test.ts
    - tests/projection-writer.test.ts
    - tests/dependency-drift.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T19:33:00+09:00"
    tests_green_at: "2026-07-09T19:33:00+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "実行時検証の純粋契約を schema/runtime-verification.ts に抽出し、run-debug は追記 I/O 端点、projection-writer は schema SSoT 参照に整理した。dependency-drift の runtime -> state-db -> runtime 循環エラーは解消し、残りは既存 grandfather warn のみ。"
    green_commands:
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T19:28:00+09:00"
        evidence_path: src/schema/runtime-verification.ts
        output_digest: "sha256:a11c4e797dd4e4357204ad9af2ab092e195afd1d0405b1e3e8bcfd1ff5319fc6"
      - kind: unit_test
        command: "npx --no-install vitest run tests/run-debug.test.ts tests/projection-writer.test.ts tests/dependency-drift.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T19:26:54+09:00"
        evidence_path: tests/dependency-drift.test.ts
        output_digest: "sha256:da266c8dc94a14dfbfda5f8993d837725ef61e1aff585be42412ad02b4026057"
      - kind: unit_test
        command: "npx --no-install vitest run tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T19:31:40+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:83d69b05cf59c017d48fcaef5509793a40209864410ecf216c1dc253e958a67b"
      - kind: lint
        command: "npx --no-install biome check tests/cli-surface.test.ts src/schema/runtime-verification.ts src/runtime/run-debug.ts src/state-db/projection-writer.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T19:29:47+09:00"
        evidence_path: src/runtime/run-debug.ts
        output_digest: "sha256:6e602a7d74d2fe0376a8caf9165a2e80285f6b43a2b5482b88a2b282a947a3ba"
      - kind: smoke
        command: "node --import tsx --eval 'import { analyzeDependencyDrift, loadDependencyDriftInput } from \"./src/lint/dependency-drift\"; const r=analyzeDependencyDrift(loadDependencyDriftInput(process.cwd())); console.log(JSON.stringify({ok:r.ok,count:r.findings.length,errors:r.findings.filter(f=>f.severity===\"error\").length,warnings:r.findings.filter(f=>f.severity===\"warn\").length,findings:r.findings.map(f=>({severity:f.severity,message:f.message}))}, null, 2));'"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T19:28:00+09:00"
        evidence_path: src/lint/dependency-drift.ts
        output_digest: "sha256:0b84e667d96af4b35f96f2ee89285253ca3f0aaa18a83572eb7ea1fe4726398d"
---

# PLAN-L7-399: 実行時検証スキーマ境界

## 目的

`runtime -> state-db -> runtime` の module-cycle を解消し、実行時振る舞い主張の分類・ログ行検証を
CLI 追記経路と DB 投影経路で共有する。

## スコープ

- `RuntimeVerification*` 型、`classifyRuntimeVerificationEvidence`、`buildRuntimeVerificationLogEvent`、
  `validateRuntimeVerificationLogCompleteness` を `src/schema/runtime-verification.ts` に分離する。
- `src/runtime/run-debug.ts` は追記専用 JSONL 書込端点と schema SSoT の再公開に縮退する。
- `src/state-db/projection-writer.ts` は runtime module ではなく schema SSoT を参照する。
- current-location / Project view fixture は現行 evidence schema の `latestPassedAt` / `latestFailedAt` を期待する。

## 対象外

- `.helix/evidence/run-debug/runtime-verification.jsonl` の形式変更。
- DB table schema 変更。
- 実行時主張の accept/reject ルール変更。

## 受入条件

- `dependency-drift` の error cycle が 0 になる。
- `run-debug` CLI と `runtime_verification_events` projection の既存テストが green のまま。
- change-impact / change-set-integrity が source/test/design/PLAN のまとまりを認識する。
