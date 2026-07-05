---
plan_id: PLAN-L7-110-takeover-feedback-surface
title: "PLAN-L7-110: takeover feedback surface from harness.db"
kind: impl
layer: L7
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: PM / Codex
agent_slots:
  - role: se
    slot_label: "SE - feedback surface implementation"
  - role: tl
    slot_label: "TL - fail-open takeover feedback review"
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
parent_design: docs/design/harness/L6-function-design/handover-mechanism.md
generates:
  - artifact_path: docs/plans/PLAN-L7-110-takeover-feedback-surface.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/handover-mechanism.md
    artifact_type: design_doc
  - artifact_path: src/feedback/surface.ts
    artifact_type: source_module
  - artifact_path: tests/feedback-surface.test.ts
    artifact_type: test_code
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L6-06-handover-mechanism.md
  requires:
    - docs/plans/PLAN-L6-06-handover-mechanism.md
    - docs/plans/PLAN-L7-47-search-metrics-feedback.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T23:45:00+09:00"
    tests_green_at: "2026-06-23T23:43:00+09:00"
    verdict: approve
    scope: "Takeover feedback surface implementation, SessionStart fail-open wiring, L6 design descent, and regression tests."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests\\feedback-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T23:42:00+09:00"
        evidence_path: tests/feedback-surface.test.ts
        output_digest: "sha256:4570446c9a5e5e03db0cf255344d7e424f451ec427f19cfe6251ab9eb636e10c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T23:43:00+09:00"
        evidence_path: src/feedback/surface.ts
        output_digest: "sha256:f6f615294ef69259ab96911db3154cd4bb9b7edf1e727d6eaba20a42e635648a"
---

# PLAN-L7-110: takeover feedback surface from harness.db（引き継ぎ feedback 表示）

## 目的

session takeover が prose handover text や transient working-tree measurements だけに依存せず、
`harness.db` から open feedback を受け取れるようにする。

## Gap

`findings`、`quality_signals`、`feedback_events` は DB feedback path として既に存在する。
しかし SessionStart は open feedback を読んで agent へ surface していなかった。
その結果、feedback が database に projection されても takeover 時に配送されない状態があり得た。

## Scope

- Add `src/feedback/surface.ts` with `selectTakeoverFeedback` and
  `renderTakeoverFeedback`.
- takeover reader は read-only に保ち、SessionStart が parallel `db rebuild` writes と競合しないようにする。
- `runSessionStartSideEffects` を wire し、rendered feedback block を independent fail-open path で出力する。
- design descent を `handover-mechanism.md §2.8` に記録する。
- hybrid takeover baseline rule を `AGENTS.md` と `CLAUDE.md` に記録する。

## 受入条件

- Open findings が takeover feedback として surface される。
- Warn/fail `quality_signals` は `feedback_events` を書かずに surface される。
- Results は severity ordered、capped で、remainder breadcrumb を含む。
- Empty feedback の場合は takeover noise を render しない。
- `bun test tests\feedback-surface.test.ts` passes.
- `bun run typecheck` passes.

## Carry

- additional takeover failure classes を `findings` に capture する作業は separate coordinated slice として残す。
- 同じ feedback を `helix status` に surface する作業は optional future work とする。
