---
plan_id: PLAN-L7-165-review-artifact-graph-node
title: "PLAN-L7-165: review artifact graph node coverage の網羅"
kind: troubleshoot
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
backprop_decision: not_required
backprop_decision_reason: "DB feedback により、既存の review evidence artifact に対する relation graph projection の網羅漏れが判明した。修正は loader の網羅範囲だけを拡張し、公開 CLI/API、永続化 schema、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - review artifact relation graph coverage の網羅"
  - role: tl
    slot_label: "TL - DB feedback gate 検証"
  - role: aim
    slot_label: "AIM - troubleshoot 分類と完了判断"
generates:
  - artifact_path: docs/plans/PLAN-L7-165-review-artifact-graph-node.md
    artifact_type: markdown_doc
  - artifact_path: src/graph/loader.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph-loader.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-156-top-level-reference-doc-graph-node.md
  requires:
    - docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T20:35:00+09:00"
    tests_green_at: "2026-06-25T20:35:00+09:00"
    verdict: approve
    scope: ".helix/review/*.md artifacts を relation graph nodes として materialize し、変更された review evidence を解析可能な状態に保つ。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\relation-graph-loader.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:34:43+09:00"
        evidence_path: tests/relation-graph-loader.test.ts
        output_digest: "sha256:61c16d3b9e3305cc2e79000f5bde9c6169b0bb1bdaaab6b25541c1ce293804ba"
      - kind: unit_test
        command: "bun run vitest run tests\\relation-graph-loader.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:34:43+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:0b826984a99a3760f8e94fe3fade2d525978387788548757dff4969b61951d5b"
---

# PLAN-L7-165: review artifact graph node coverage の網羅

## 目的

次の DB feedback gate を解消する:

`missing-projection: changed-path-.helix-review-cross-review-l7-157.md-has-no-relation-graph-node-impact-cannot-be-analyzed-no-silent-change-impact-fallback`

## スコープ

- `.helix/review/*.md` files を design-like な review evidence nodes として relation graph loader に追加する。
- 既存の relation graph schema と impact expansion semantics を維持する。
- 次に対する fixture と real-repo regression checks を追加する:
  `.helix/review/cross-review-l7-157.md`.

## 受入条件

- `loadRelationGraphSourceSet` が review artifact の node source を返す。
- `analyzeRelationImpact` が review artifact change に対して成功する。
- `bun run vitest run tests\relation-graph-loader.test.ts` が成功する。
- `bun run src\cli.ts db rebuild` が未解消の DB feedback gate を解消する。
- `bun run src\cli.ts doctor` が成功する。
