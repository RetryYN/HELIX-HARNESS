---
plan_id: PLAN-L7-455-sessionstart-feedback-receipt-batch
title: "PLAN-L7-455 (troubleshoot): SessionStart feedback receipt の計算量是正"
kind: troubleshoot
layer: L7
drive: be
status: draft
route_mode: incident
entry_signals: ["imp-151: copy-db profiling confirmed O(Nrefs x Njournal) receipt path"]
created: 2026-07-14
updated: 2026-07-14
backprop_decision: not_required
backprop_decision_reason: "既存 L6 feedback lifecycle の receipt 契約を batch 境界として具体化し、要件の意味変更を伴わない性能・可用性是正である。"
owner: TL (Codex)
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

既存source/testは本PLANが生成済みとclaimせず、copy DB 30秒観測と独立reviewが閉じるまで検証対象として扱う。

- `recordFeedbackSurfaces` を lifecycle policy の batch API として追加し、入力全件を単一 lock・単一 journal
  snapshot・単一 lifecycle resolve で receipt 化する。
- SessionStart は group 表示数ではなく全 canonical source ref を batch へ渡し、same-session suppression 契約を維持する。
- operation replay、intent conflict、stale generation、append後commit不明の回復規律を単発 API と同等に維持する。

## 2. 受入条件

- [ ] 512 source の receipt batch が `readEvents`、lock、lifecycle resolve を各1回だけ呼ぶ。
- [ ] 全 source ref の receipt、同一session replay追記0、次session再表示を確認する。
- [ ] `bunx vitest run tests/feedback-lifecycle.test.ts tests/feedback-lifecycle-surface.test.ts`、typecheck、Biome を green にする。
- [ ] copy DB 観測で SessionStart feedback path が30秒以内に完走することを確認する。

## 3. 範囲外

- lifecycle journal の compaction と storage format migration。
- feedback source の group-first 表示政策そのものの変更。

## 4. Vペア

- L6: `feedback-lifecycle.md` FLIFE-S13。
- L8: `U-FLIFE-013`。
- L9: `IT-FLIFE-003`。
