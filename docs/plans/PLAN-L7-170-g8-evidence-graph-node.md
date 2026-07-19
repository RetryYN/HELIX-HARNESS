---
plan_id: PLAN-L7-170-g8-evidence-graph-node
title: "PLAN-L7-170: G8 evidence graph node coverage"
kind: troubleshoot
layer: L7
drive: db
status: confirmed
created: 2026-06-26
updated: 2026-06-26
owner: Codex
parent_design: docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
backprop_decision: not_required
backprop_decision_reason: "DB feedback により G8 integration evidence manifests の relation graph projection coverage gap が露出した。修正は loader coverage の拡張のみで、public CLI/API、persisted schema、L8 workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - G8 evidence relation graph coverage 確認"
  - role: tl
    slot_label: "TL - DB feedback gate 検証"
  - role: aim
    slot_label: "AIM - L8 evidence impact regression 確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-170-g8-evidence-graph-node.md
    artifact_type: markdown_doc
  - artifact_path: src/graph/loader.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph-loader.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-165-review-artifact-graph-node.md
  requires:
    - docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md
    - docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-26T21:05:00+09:00"
    tests_green_at: "2026-06-26T21:05:00+09:00"
    verdict: approve
    scope: ".helix/evidence/g8-integration/*.json artifacts を relation graph nodes として materialize し、G8 evidence changes を change-impact で解析可能なままにする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\relation-graph-loader.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-26T21:05:00+09:00"
        evidence_path: tests/relation-graph-loader.test.ts
        output_digest: "sha256:61c16d3b9e3305cc2e79000f5bde9c6169b0bb1bdaaab6b25541c1ce293804ba"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\relation-graph-loader.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-26T21:05:00+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:0b826984a99a3760f8e94fe3fade2d525978387788548757dff4969b61951d5b"
---

# PLAN-L7-170: G8 evidence graph node coverage の整備

## 目的

次の DB feedback gate を解消する:

`missing-projection: changed-path-.helix-evidence-g8-integration-has-no-relation-graph-node-impact-cannot-be-analyzed-no-silent-change-impact-fallback`

## スコープ

- `.helix/evidence/g8-integration/*.json` files を design-like evidence nodes として relation graph loader に追加する。
- relation graph schema、edge kinds、impact expansion semantics は維持する。
- 現在の G8 integration evidence manifest に対する fixture と real-repo regression checks を追加する。

## 受入条件

- `loadRelationGraphSourceSet` は G8 evidence manifests の node source を返す。
- G8 evidence manifest change に対して `analyzeRelationImpact` が成功する。
- `npx --no-install vitest run tests\relation-graph-loader.test.ts` が pass する。
- `npx --no-install tsx src\cli.ts db rebuild` が open DB feedback gate を解消する。
- `npx --no-install tsx src\cli.ts doctor` が pass する。
