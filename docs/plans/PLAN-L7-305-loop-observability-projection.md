---
plan_id: PLAN-L7-305-loop-observability-projection
title: "PLAN-L7-305 (impl): loop_iterations rebuild 投影と verifier-provider-mismatch doctor gate"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Claude
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/helix/orchestration-memory.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-176/177 §4 carry と L6 orchestration-memory §2.4/§2.6、test-design §3 (doctor / 統合観点) で既に要求済みの投影・観測 gate を L7 実装へ降ろす slice。新規 L1/L3 要求は追加しない。schema slice は PLAN-L7-304 (Codex) が先行して確定済み。"
agent_slots:
  - role: se
    slot_label: "SE - loop iteration jsonl から harness.db rebuild への投影"
  - role: qa
    slot_label: "QA - hybrid 自己評価行の fail-close 検出"
generates:
  - artifact_path: docs/plans/PLAN-L7-305-loop-observability-projection.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/lint/verifier-provider-mismatch.ts
    artifact_type: source_module
  - artifact_path: src/lint/db-projection-ingestion.ts
    artifact_type: source_module
  - artifact_path: src/lint/review-evidence.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/verifier-provider-mismatch.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
  requires:
    - docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
    - docs/plans/PLAN-L7-304-loop-iterations-db-schema.md
    - docs/design/helix/L6-function-design/orchestration-memory.md
    - docs/test-design/helix/orchestration-memory.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T02:20:21+09:00"
    tests_green_at: "2026-07-04T02:20:21+09:00"
    verdict: approve
    scope: "PLAN-L7-176/177 §4 carry と PLAN-L7-304 schema の上に、loop iteration JSONL rebuild 投影、malformed 行 finding、verifier-provider-mismatch doctor hard gate、fixture repo の missing docs/plans guard を追加した。provider dispatch / cost_usd 実値 / rename cutover は対象外。"
    worker_model: claude
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts tests/verifier-provider-mismatch.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T02:20:21+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:d36d5b9d3dd69a966cbd441f10fe93555623b2ea0f5694f53fe914c6b21fbd3d"
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
        evidence_path: docs/plans/PLAN-L7-305-loop-observability-projection.md
        output_digest: "sha256:2cc2cd338ce00621164c27d20f3ade602170ac3c905e686294d565e21fb9c824"
---

# PLAN-L7-305: loop_iterations rebuild 投影と verifier-provider-mismatch doctor gate

## 0. 目的

PLAN-L7-304 (schema slice、Codex) の後続 slice として、PLAN-L7-176/177 §4 carry の残り 2 点を閉じる。

1. `.helix/state/loop/*.iterations.jsonl` (loop-store の iteration 証跡) を `rebuildHarnessDb`
   から `loop_iterations` table へ投影する (`projectLoopIterations`)。
2. doctor hard gate `verifier-provider-mismatch` を追加し、worker と verifier が同一 provider
   なのに fallback 理由 (`blockedReason`) が記録されていない行 (hybrid 自己評価) を fail-close 検出する。

これにより L6 orchestration-memory §2.6 の観測設計 (「blocked_reason で hybrid 自己評価
fallback を後段 doctor が検査できる」) が実データで機能する。

## 1. スコープ

- `projectLoopIterations`: jsonl 行を `loop_iterations` へ投影。壊れた行は silent skip せず
  `loop-iteration-invalid` finding (warn) に落とす。
- `verifier-provider-mismatch` lint module + doctor 配線 (hard gate、ok 集約 + messages)。
  検査対象は証跡 jsonl 直接 (db rebuild タイミングに依存しない)。
- `db-projection-ingestion` に `loop_iterations` を evidence-gated table として登録
  (loop 未実行 repo では 0 行が正常)。
- `loadReviewPlans` の missing-dir ガード (`docs/plans` の無い fixture repo で
  rebuild が throw しない fail-safe。実 repo では常に存在するため挙動不変)。
- cost_usd 列は NULL 投影 (per-iteration cost 記録は LoopIterationRecord 未対応。
  effort budget の enforcement 自体は PLAN-L7-214 で loop state 側に実装済み)。

## 2. 対象外

- HBR-P1 continuous-run heartbeat / fresh-session 再入 (PLAN-L7-214 §4 carry、別 PLAN)。
- LoopIterationRecord への cost/timestamp フィールド追加 (loop-runner 契約変更を伴うため別 slice)。
- `.helix` から HELIX への rename / cutover (PLAN-M-02)。

## 3. 受入条件

- U-ORCH-007: rebuild が jsonl の有効行を `loop_iterations` に投影し、壊れ行を
  `loop-iteration-invalid` finding に落とす (tests/projection-writer.test.ts)。
- U-ORCH-008: worker===verifier かつ blockedReason なしの行を violation として検出し、
  `intra_runtime_fallback` 記録行と反対 provider 行は pass する
  (tests/verifier-provider-mismatch.test.ts、tests/doctor.test.ts の doctor 配線検査)。
- 検証 command は `bun run vitest run tests/projection-writer.test.ts tests/verifier-provider-mismatch.test.ts tests/state-db.test.ts` green、
  `bun run typecheck` green、`helix doctor` で新 gate が
  hard gate として集約される。

## 4. carry

- iteration 単位 (per-iteration) の cost_usd / recorded_at 実値投影は LoopIterationRecord 拡張 (loop-runner
  契約変更) とセットで後続 slice。
