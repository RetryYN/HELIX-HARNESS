---
plan_id: PLAN-L7-283-approval-draft-review-route-ja
title: "PLAN-L7-283: approval-draft reviewRouteJa の日本語固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PO 向け表示文の drift 是正のみ。D-API/D-DB、実 rename、approval 記録、version-up activation、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-277-rename-approval-draft-packet.md
pair_artifact: tests/completion-decision-packet.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - approval draft Japanese route"
  - role: qa
    slot_label: "QA - Japanese display regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-283-approval-draft-review-route-ja.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/handover.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-277-rename-approval-draft-packet.md
  requires:
    - docs/plans/PLAN-L7-277-rename-approval-draft-packet.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T20:59:37+09:00"
    tests_green_at: "2026-07-03T20:59:37+09:00"
    verdict: approve
    scope: "approval-draft supporting packet と handover Markdown の reviewRouteJa が machine reviewRoute の英語文を流用しないことを固定する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/outstanding.test.ts tests/cli-surface.test.ts tests/handover.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T20:59:37+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:366d323a60a95b6c443db5dce0021ce9b0fa1cd2917c0c24932c75436fa8376c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T20:59:37+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

## 目的

`ut-tdd rename approval-draft --json` は承認を代行しない確認 packet であり、PO 向け表示は日本語-first でなければならない。
既存の `reviewRouteJa` mapping は approval-draft route だけ machine `reviewRoute` の英語文へ fall back していた。

この PLAN では approval-draft の `reviewRouteJa` を日本語に固定し、status / completion packet / outstanding summary の各 surface で英語流用へ戻らないようにする。

## DoD

- [x] `workflowReviewRouteTextJa` が approval-draft route を日本語へ写像する。
- [x] `completion decision-packet` の approval-draft summary が日本語 `reviewRouteJa` を持つ。
- [x] `workflowNextActions` の approval-draft summary が日本語 `reviewRouteJa` を持つ。
- [x] status text の `packet-summary` が日本語 `review=` と英語 machine `review-id=` を分離して出す。
- [x] handover Markdown の `packet要約` が日本語 `確認観点=` と machine `確認観点ID=` を分離して出す。
