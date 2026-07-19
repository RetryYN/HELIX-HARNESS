---
plan_id: PLAN-L7-149-relation-graph-process-doc-node
title: "PLAN-L7-149: relation graph の process 文書 node coverage"
kind: troubleshoot
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/plans/PLAN-L7-142-relation-graph-requirement-nodes.md
backprop_decision: not_required
backprop_decision_reason: "DB feedback により docs/process/** の loader projection coverage gap が露出した。修正は既存 relation graph loader の coverage 境界を拡張するだけで、公開 CLI/API contract、persistence schema、requirements semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - relation graph の process 文書 node coverage"
  - role: tl
    slot_label: "TL - DB feedback gate 検証"
  - role: aim
    slot_label: "AIM - troubleshoot 分類と closure"
generates:
  - artifact_path: docs/plans/PLAN-L7-149-relation-graph-process-doc-node.md
    artifact_type: markdown_doc
  - artifact_path: src/graph/loader.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph-loader.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-142-relation-graph-requirement-nodes.md
  requires:
    - docs/plans/PLAN-L7-142-relation-graph-requirement-nodes.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T15:05:00+09:00"
    tests_green_at: "2026-06-25T15:05:00+09:00"
    verdict: approve
    scope: "Relation graph loader は docs/process/** を design-like nodes として materialize するため、DB feedback の missing-projection gate が静かに bypass されない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\relation-graph-loader.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T15:04:43+09:00"
        evidence_path: tests/relation-graph-loader.test.ts
        output_digest: "sha256:61c16d3b9e3305cc2e79000f5bde9c6169b0bb1bdaaab6b25541c1ce293804ba"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T15:05:00+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:0b826984a99a3760f8e94fe3fade2d525978387788548757dff4969b61951d5b"
---

# PLAN-L7-149: relation graph の process 文書 node coverage

## 目的

次の DB feedback gate を解消する:

`missing-projection: changed-path-docs-process-modes-refactor.md-has-no-relation-graph-node-impact-cannot-be-analyzed-no-silent-change-impact-fallback`

## スコープ

- `docs/process/**` の Markdown files を design-like nodes として relation graph loader に追加する。
- 既存の relation graph schema は変更しない。
- `docs/process/modes/refactor.md` が graph node を持ち、`analyzeRelationImpact` が
  `missing-projection` を出さないことを証明する regression fixture を追加する。

## 受入条件

- `loadRelationGraphSourceSet` が `docs/process/modes/refactor.md` の node source を返す。
- process mode document の変更に対して `analyzeRelationImpact` が成功する。
- `bun run vitest run tests\relation-graph-loader.test.ts` が pass する。
- `bun run src\cli.ts db rebuild` が open DB feedback gate を解消する。
- `bun run src\cli.ts doctor` が pass する。
