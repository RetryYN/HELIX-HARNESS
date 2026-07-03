---
plan_id: PLAN-L7-287-handover-review-coverage-anchor
title: "PLAN-L7-287: handover Markdown の review coverage anchor"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "handover Markdown の §3 anchor を additive に強化する。D-API/D-DB、実 rename、approval 記録、version-up activation、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-286-status-review-coverage-surface.md
pair_artifact: tests/handover.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - handover review coverage"
  - role: qa
    slot_label: "QA - Markdown resume surface regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-287-handover-review-coverage-anchor.md
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
  parent: docs/plans/PLAN-L7-286-status-review-coverage-surface.md
  requires:
    - docs/plans/PLAN-L7-286-status-review-coverage-surface.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T21:36:00+09:00"
    tests_green_at: "2026-07-03T21:36:00+09:00"
    verdict: approve
    scope: "handover Markdown §3 が completion review coverage を保持し、Markdown 再開面でも review packet で閉じる blocker と packet 外 blocker を分離する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/handover.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T21:36:00+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:77691011a06b97ffbeb68f64292cd3ac3b89ac169ed584e21184033f440daedb"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T21:36:00+09:00"
        evidence_path: src/handover/index.ts
        output_digest: "sha256:cc47b0731427e03c24057268f3ac73d950c8178ecbf6dce2fff243b59fb172d9"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T21:36:00+09:00"
        evidence_path: docs/plans/PLAN-L7-287-handover-review-coverage-anchor.md
        output_digest: "sha256:8dc225fd9400253b29ab01b4233e9de6586c8321096435aa34ef0ec9b4a39f67"
---

## 目的

`status` / `handover status` text は `completion-review-coverage:` を出すが、tracked な handover Markdown の §3 が同じ coverage を持たないと、再開者は `reviewCoveredBlockers` と `nonPacketBlockers` の分離を見落とせる。特に `non_terminal_plans` / `semantic_frontier_blocked` は review packet だけで閉じられないため、Markdown 再開面で消えると完了判断を誤る。

この PLAN では `renderHandoverScaffold` が §3 に `completion-review-coverage:` を出し、`checkHandoverNextActionAnchor` が blocked route の coverage 欠落を fail-close する。

## DoD

- [x] handover Markdown §3 が `completion-review-coverage:` を出す。
- [x] §3 の coverage 行は `covered=` / `non-packet=` / `policy=review-packets-cover-decision-blockers-only` を含む。
- [x] coverage 行のない旧 handover Markdown は `checkHandoverNextActionAnchor` で fail-close する。
- [x] L6 handover design と L7 unit-test design が Markdown §3 coverage anchor を明記する。
