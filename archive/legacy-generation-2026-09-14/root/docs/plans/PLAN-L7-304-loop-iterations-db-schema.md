---
plan_id: PLAN-L7-304-loop-iterations-db-schema
title: "PLAN-L7-304 (impl): loop_iterations の harness.db schema"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-176/177 §4 carry と L5 physical-data §9.1 / L6 orchestration-memory で既に要求済みの loop_iterations 投影 schema を L7 実装へ降ろす slice。新規 L1/L3 要求は追加しない。"
agent_slots:
  - role: tl
    slot_label: "TL - loop observability projection 境界"
  - role: se
    slot_label: "SE - harness.db schema registry"
generates:
  - artifact_path: docs/plans/PLAN-L7-304-loop-iterations-db-schema.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-indexes.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-tables-evaluation.ts
    artifact_type: source_module
  - artifact_path: tests/state-db.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
  requires:
    - docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/helix/L6-function-design/orchestration-memory.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T02:20:21+09:00"
    tests_green_at: "2026-07-04T02:20:21+09:00"
    verdict: approve
    scope: "PLAN-L7-176/177 §4 carry と L5 physical-data §9.1 / L6 orchestration-memory の既存 contract 内で、loop_iterations schema registry と plan/iteration index を追加した。JSONL rebuild 投影と verifier-provider-mismatch gate は PLAN-L7-305 の後続 slice に分離する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/state-db.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T02:20:21+09:00"
        evidence_path: tests/state-db.test.ts
        output_digest: "sha256:ecd0ec8fca7b4ce0e55547b9388c2030f421cf1c03be11646a26e40690f96d2a"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-04T02:20:21+09:00"
        evidence_path: docs/plans/PLAN-L7-304-loop-iterations-db-schema.md
        output_digest: "sha256:7fcc6851c474636f5cd015a40ea89b7156d9bef5255c9553018c1746f26819ef"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-04T02:20:21+09:00"
        evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
        output_digest: "sha256:c142366412b50717f706387d702f84da84505f3e62c86730743fdfcbcd4f620b"
---

# PLAN-L7-304: loop_iterations の harness.db schema

## 0. 目的

PLAN-L7-176/177 の §4 carry と L6 orchestration-memory 設計で残していた
`loop_iterations` の harness.db schema を registry に追加する。

この実装 slice は schema と index に限定する。`.helix/state/loop/*.iterations.jsonl`
からの rebuild 投影、doctor `verifier-provider-mismatch` の実装、runtime provider dispatch の変更は
PLAN-L7-305 以降で扱う。

## 1. スコープ

- `SCHEMA_VERSION` を 20 へ進める。
- `HARNESS_DB_EVALUATION_TABLES` に `loop_iterations` table を追加する。
- `idx_loop_iterations_plan(plan_id, iteration)` と table 定義の整合をテストで固定する。
- L5 physical-data §9.1 の `loop_iterations` 行と実装 PLAN の trace を明示する。

## 2. 対象外

- provider transcript、secret、credential、PII の保存。
- `.helix` から HELIX への不可逆 rename / cutover。
- runtime provider dispatch、`selectVerifier`、adapter 実行の変更。
- loop JSONL から harness.db へ実データを投影する `projection-writer` 実装。
- `verifier-provider-mismatch` doctor gate。

## 3. 受入条件

- `migrate()` が `loop_iterations` table を作成し、`user_version` が `SCHEMA_VERSION` と一致する。
- `loop_iterations` table は `plan_id`、`iteration`、`worker_provider`、`verifier_provider`、
  `verdict`、`stop_reason`、`blocked_reason`、`cost_usd`、`evidence_path`、`recorded_at` を持つ。
- `idx_loop_iterations_plan` は `loop_iterations(plan_id, iteration)` を指す。
- `bun test tests/state-db.test.ts` と `bun run src/cli.ts doctor` が green になる。
