---
plan_id: PLAN-L7-455-sessionstart-feedback-receipt-batch
title: "PLAN-L7-455 (troubleshoot): SessionStart feedback receipt の計算量是正"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
route_mode: incident
entry_signals: ["po_directive:2026-07-14 /goal 全システム監査から確認された IMP-151 copy-db profiling"]
created: 2026-07-14
updated: 2026-07-14
backprop_decision: not_required
backprop_decision_reason: "既存 L6 feedback lifecycle の receipt 契約を batch 境界として具体化し、要件の意味変更を伴わない性能・可用性是正である。"
owner: TL (Codex)
review_evidence:
  - reviewer: codex-tl-closure-audit
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-19T01:33:00+09:00"
    tests_green_at: "2026-07-19T01:32:00+09:00"
    verdict: pass
    scope: "single-lock/snapshot/resolve、全source receipt、replay/recovery、449MB DBと60MB journalの全量18.34秒を再監査。Blocker/High 0。"
    green_commands:
      - { kind: integration_test, command: "npx --no-install vitest run tests/feedback-lifecycle.test.ts tests/feedback-lifecycle-surface.test.ts --testTimeout 300000", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-19T01:30:00+09:00", evidence_path: docs/governance/merged-plan-closure-audit-2026-07-19.md, output_digest: "sha256:047a007c0ae7d028b6530c2103a33c363511085a2cf45ca740e0283c042105bb" }
      - { kind: smoke, command: "/usr/bin/time npx --no-install tsx src/cli.ts session start --session closure-audit-20260719", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-19T01:23:00+09:00", evidence_path: docs/governance/merged-plan-closure-audit-2026-07-19.md, output_digest: "sha256:4d09709573041e17677d9f6c92f334914f9462970971fef6372ed083a871c6e0" }
parent_design: docs/design/harness/L6-function-design/feedback-lifecycle.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: aim
    slot_label: "AIM — receipt batch の失敗回復と性能境界を独立監査"
  - role: se
    slot_label: "SE — single-lock/single-snapshot batch receipt 実装"
  - role: qa
    slot_label: "QA — operation-count と replay/recovery の回帰検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-455-sessionstart-feedback-receipt-batch.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/feedback-lifecycle.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L9-integration-test-design.md
    artifact_type: test_design
  - artifact_path: src/policy/feedback-lifecycle.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/feedback-lifecycle.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
---

# PLAN-L7-455: SessionStart feedback receipt の計算量是正

## 0. 背景

IMP-151 のコピー DB profiling で、449MB の harness.db と 53MB/73,745行の lifecycle journal に対して、
SessionStart が group-first の 5,211 source ref を一件ずつ receipt 化していた。各 receipt は journal 全読込、
lifecycle resolve、SQLite lock を再実行するため、計算量は O(Nrefs x Njournal) となる。コピー環境では feedback
表示後も 98秒超、CPU 109%、RSS 1.33GB を再現した。実 DB は変更していない。

## 1. 実装範囲

- `recordFeedbackSurfaces` を lifecycle policy の batch API として追加し、入力全件を単一 lock・単一 journal
  snapshot・単一 lifecycle resolve で receipt 化する。
- SessionStart は group 表示数ではなく全 canonical source ref を batch へ渡し、same-session suppression 契約を維持する。
- operation replay、intent conflict、stale generation、append後commit不明の回復規律を単発 API と同等に維持する。

## 2. 受入条件

- [x] 512 source の receipt batch が `readEvents`、lock、lifecycle resolve を各1回だけ呼ぶ。
- [x] 全 source ref の receipt、同一session replay追記0、次session再表示を確認する。
- [x] feedback lifecycle tests、typecheck、Biome を green にする。
- [x] copy DB 観測で SessionStart feedback path が30秒以内（18.34秒）に完走することを確認する。

## 3. 範囲外

- lifecycle journal の compaction と storage format migration。
- feedback source の group-first 表示政策そのものの変更。

## 4. Vペア

- L6: `feedback-lifecycle.md` FLIFE-S13。
- L8: `U-FLIFE-013`。
- L9: `IT-FLIFE-003`。
