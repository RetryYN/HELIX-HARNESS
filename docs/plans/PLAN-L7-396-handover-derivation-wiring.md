---
plan_id: PLAN-L7-396-handover-derivation-wiring
title: "PLAN-L7-396-handover-derivation-wiring (impl): handover DB 導出の実配線 — helix handover / Stop hook での snapshot 再生成"
kind: impl
layer: L7
drive: be
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07 PLAN-L6-57 step 3（実配線）の起票。Codex チャット側 cli.ts 作業の commit 後に着手"
created: 2026-07-07
updated: 2026-07-09
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-355-handover-db-derivation-impl の設計どおりの L7 実装。上位設計・schema の意味論は変更しない。"
owner: Codex
parent_design: docs/design/harness/L6-function-design/handover-db-derivation.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE (Codex se レーン) - handover/CLI 配線"
  - role: qa
    slot_label: "QA - drift 検出と note 保持の回帰検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-396-handover-derivation-wiring.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/handover/handover-derivation.ts
    artifact_type: source_module
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
  - artifact_path: src/handover/handover-types.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/handover-derivation-wiring.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-355-handover-db-derivation-impl.md
  requires:
    - docs/plans/PLAN-L7-355-handover-db-derivation-impl.md
review_evidence:
  - reviewer: codex-tl
    review_kind: self_review
    reviewed_at: "2026-07-09T18:04:30+09:00"
    tests_green_at: "2026-07-09T18:03:58+09:00"
    verdict: approve
    scope: "PLAN-L7-396 handover DB 導出 wiring。`helix handover` が harness.db/git から nested derivedSnapshot を再生成し、takeover_note を保持し、古い派生 field を derivedPointerDrift と Stop hook warning surface へ出す。legacy CURRENT.json consumer 互換のため既存 pointer fields は維持し、再生成後の nested snapshot を drift 比較対象にして常時 drift を防止した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: lint
        command: "bunx biome check src/handover/handover-derivation.ts src/handover/index.ts src/handover/handover-types.ts src/cli.ts tests/handover-derivation-wiring.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T18:02:00+09:00"
        evidence_path: src/handover/index.ts
        output_digest: "sha256:a3e05cc24918454e30b00839fa58aa11da75c8be910ebfbf5f2cf36a4f263361"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:02:00+09:00"
        evidence_path: src/handover/handover-types.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bunx vitest run --project fast tests/handover-db-derivation.test.ts tests/handover-derivation-wiring.test.ts tests/handover.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T18:02:01+09:00"
        evidence_path: tests/handover-derivation-wiring.test.ts
        output_digest: "sha256:eddc11cc7a6cea1b5039393e79158385c6c88d86ca012c0f05fd3ba24f43188a"
      - kind: unit_test
        command: "bunx vitest run --project fast tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T18:03:58+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:61525d449729cb760192e2a4e4b243f7eaf4c63d040fc1e7f45cd8b7417f1906"
---

# PLAN-L7-396-handover-derivation-wiring (impl): handover DB 導出の実配線 — helix handover / Stop hook での snapshot 再生成

## 0. 目的

PLAN-L7-355 で実装済みの `deriveHandoverSnapshot` / `renderCurrentPointer` /
`detectPointerDrift` を `helix handover` と Stop hook（session summary）に配線し、
CURRENT.json を自動生成 snapshot + takeover note 1 欄へ縮小する（PLAN-L6-57 §2/§3）。
derived field の手書き編集は drift warning として surface する。着手条件: Codex チャット側の
cli.ts in-flight 作業（PLAN-L7-357 系）が commit 済みであること（同 file 競合の回避）。
対象実装ファイルは既存 `src/handover/index.ts` であり、本 PLAN の draft 段階では生成済み deliverable として
`generates` に載せない。着手時に変更対象と新設テストを実体化してから generated artifact を追加する。

2026-07-09 実装判断: 現行 `handover status` / doctor / completion packet consumer が既存
CURRENT.json field を読むため、即時の物理縮小は行わず legacy pointer fields を互換 surface として維持する。
canonical な派生 snapshot は `derivedSnapshot` と `takeover_note` へ集約し、Stop hook warning は
`derivedPointerDrift[]` を読む。完全縮小は consumer migration 後の別 PLAN とする。

## 1. 受入条件

- 新設 test green + 既存関連 suite green（full 検証で退行 0）。
- oracle 行を pair test-design へ test 新設と同時に宣言（oracle-test-trace gate 準拠）。
- レビュー evidence 記録後に confirmed。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): 実装 + test 新設 + oracle 宣言（Codex se レーンへ委譲）。
- step 2 (mode: serial): full suite 検証 → レビュー → confirmed。
