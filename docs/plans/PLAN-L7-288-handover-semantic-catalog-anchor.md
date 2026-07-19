---
plan_id: PLAN-L7-288-handover-semantic-catalog-anchor
title: "PLAN-L7-288: 引き継ぎ Markdown の意味台帳固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "引き継ぎ Markdown の §3 固定行を追加強化する。S4 判断、version-up activation、rename/cutover apply、approval 記録、D-API/D-DB は変更しない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-287-handover-review-coverage-anchor.md
pair_artifact: tests/handover.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - handover 意味台帳"
  - role: qa
    slot_label: "QA - 再開面の意味台帳回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-288-handover-semantic-catalog-anchor.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/handover-mechanism.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
  - artifact_path: tests/handover.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-287-handover-review-coverage-anchor.md
  requires:
    - docs/plans/PLAN-L7-287-handover-review-coverage-anchor.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T21:43:06+09:00"
    tests_green_at: "2026-07-03T21:43:06+09:00"
    verdict: approve
    scope: "引き継ぎ Markdown §3 が `semantic-frontier-records` と `confirmed-current-meaning-records` を保持し、機能一覧の意味境界を再開面で隠さない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/handover.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T21:43:06+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:bbda49b3028ccddee49471087e097d69eadf24a9403fc88c58b00ce0d32c4cbe"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T21:43:06+09:00"
        evidence_path: src/handover/index.ts
        output_digest: "sha256:cc47b0731427e03c24057268f3ac73d950c8178ecbf6dce2fff243b59fb172d9"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T21:43:06+09:00"
        evidence_path: docs/plans/PLAN-L7-288-handover-semantic-catalog-anchor.md
        output_digest: "sha256:073152d476c8f17b9d5705fccd34ef58d0ca9e239a85a029ab972e4b332699fb"
---

## 目的

`status` / `handover status` text は `semantic_frontier_records` と `confirmed_current_meaning_records` の件数を出すが、tracked な引き継ぎ Markdown §3 は `featureId` / `classification` / confirmed-current の意味単位 ID を固定していなかった。再開者が Markdown だけを見ると、`semantic_frontier_blocked` が何を守っているのか、また confirmed 46 件がどの 12 意味単位で成立しているのかを落とせる。

この PLAN では引き継ぎ Markdown §3 に `semantic-frontier-records:` と `confirmed-current-meaning-records:` を出し、`checkHandoverNextActionAnchor` が blocked route の意味台帳欠落を fail-close する。

## DoD

- [x] 引き継ぎ Markdown §3 が `semantic-frontier-records:` を出す。
- [x] `semantic-frontier-records:` は featureId / classification / planId と `completion-claim-allowed=false` を含む。
- [x] 引き継ぎ Markdown §3 が `confirmed-current-meaning-records:` を出す。
- [x] `confirmed-current-meaning-records:` は confirmed meaning ID と `boundary=downstream_evidence_required` を含む。
- [x] 意味台帳のない旧引き継ぎ Markdown は `checkHandoverNextActionAnchor` で fail-close する。
- [x] L6 handover 設計と L7 unit-test 設計が Markdown §3 意味台帳固定行を明記する。
