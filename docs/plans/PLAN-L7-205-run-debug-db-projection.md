---
plan_id: PLAN-L7-205-run-debug-db-projection
title: "PLAN-L7-205 (add-impl): L7.5 RUN & Debug runtime verification DB projection"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/harness/L5-detailed-design/physical-data.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - runtime evidence projection boundary"
  - role: se
    slot_label: "SE - harness.db projection schema"
  - role: qa
    slot_label: "QA - deterministic rebuild evidence"
generates:
  - artifact_path: docs/plans/PLAN-L7-205-run-debug-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-205-run-debug-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
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
dependencies:
  parent: docs/plans/PLAN-L7-202-run-debug-runtime-verification.md
  requires:
    - docs/plans/PLAN-REVERSE-205-run-debug-db-projection.md
    - docs/plans/PLAN-L7-202-run-debug-runtime-verification.md
    - docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
  references:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:53:00+09:00"
    tests_green_at: "2026-06-30T02:53:00+09:00"
    verdict: approve
    scope: "L7.5 RUN & Debug JSONL evidence now deterministically projects into harness.db runtime_verification_events. The projection keeps verification_class and accept_status explicit so dashboards do not infer runtime acceptance from projection-only telemetry."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/projection-writer.test.ts tests/db-projection-coverage.test.ts tests/impl-plan-trace.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T02:53:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:53:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:d05022d03ef67dea4d3d832a85005a29a3398d6ebad8236c2b2ec41b4fedc45c"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:53:00+09:00"
        evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
        output_digest: "sha256:0a1c082db408d7627b0ddce759b6f62c4919dac544bab952124d206d3bc11adf"
---

# PLAN-L7-205: L7.5 RUN & Debug runtime verification DB 投影

## 目的

残っている RUN & Debug の可視化 gap を閉じる。追記専用の runtime verification
JSONL は有用な evidence だが、決定的な可視化と完了監査には `harness.db` への格納が必要である。

## スコープ

- `runtime_verification_events` を harness.db schema registry に追加する。
- 決定的な `rebuildHarnessDb` の中で `.helix/evidence/run-debug/runtime-verification.jsonl` を投影する。
- `verification_class` と `accept_status` を明示的に保存する。
- malformed または incomplete な行は accepted runtime evidence ではなく `findings` として保持する。
- projection-writer の regression test を追加し、`U-RUNDEBUG-007` を登録する。

## 非目標

- この PLAN では外部 Claude/Codex providers を起動しない。
- この PLAN では投影行を runtime proof として扱わない。追記専用 log から生成された runtime classification を保存する。
- この PLAN では VSCode Webview 自体を実装しない。後続 view に必要な DB read model を提供する。

## 受入条件

- `rebuildHarnessDb` が valid な L7.5 JSONL rows から `runtime_verification_events` を生成する。
- Malformed JSONL rows が `findings` を作成する。
- Runtime dashboards が raw JSONL を読まずに、`runtime_verified` / `accepted` と blocked または malformed な行を区別できる。
- typecheck、lint、targeted projection tests、doctor、full tests が pass する。
