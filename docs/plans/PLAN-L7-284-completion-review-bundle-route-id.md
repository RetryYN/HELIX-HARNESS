---
plan_id: PLAN-L7-284-completion-review-bundle-route-id
title: "PLAN-L7-284: completion review-bundle text の route-id 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion review-bundle の text surface を additive に強化する。D-API/D-DB、実 rename、approval 記録、version-up activation、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-278-completion-review-bundle.md
pair_artifact: tests/cli-surface.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - review bundle route id"
  - role: qa
    slot_label: "QA - text surface regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-284-completion-review-bundle-route-id.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-278-completion-review-bundle.md
  requires:
    - docs/plans/PLAN-L7-278-completion-review-bundle.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T21:15:13+09:00"
    tests_green_at: "2026-07-03T21:15:13+09:00"
    verdict: approve
    scope: "completion review-bundle text の review-packet 行が日本語 route と machine route-id を同時に表示し、JSON の reviewRouteJa / reviewRoute 分離を text surface でも失わないことを固定する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/cli-surface.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T21:15:13+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:0c77b45a9faa300451faa95d67a539c022255207a06feb2d28f6fbf67660c644"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T21:15:13+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

## 目的

`helix completion review-bundle` は完了主張前に人間が見る非破壊レビュー束である。JSON では `reviewRouteJa` と `reviewRoute` が分離されているが、text の `review-packet:` 行が日本語 `route=` だけを出すと、レビュー証跡に機械的に安定した route ID が残らない。

この PLAN では text surface に `route-id=` を追加し、S4 / rename / version-up / action-binding の各 supporting packet を人間表示と machine ID の両方で辿れるようにする。

## DoD

- [x] `completion review-bundle` text の `review-packet:` 行が日本語 `route=` を出す。
- [x] `completion review-bundle` text の `review-packet:` 行が machine `route-id=` を出す。
- [x] S4 decision packet と rename approval-draft packet の text regression test が route / route-id の両方を固定する。
- [x] L6 function spec が text surface の route / route-id 分離を明記する。
- [x] L7 unit-test design が `completion review-bundle` text の route-id oracle を明記する。
