---
plan_id: PLAN-L7-156-top-level-reference-doc-graph-node
title: "PLAN-L7-156: 上位参照 doc の relation graph node"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/governance/repository-structure.md
backprop_decision: not_required
backprop_decision_reason: "既存の tracked reference artifact に対して relation graph projection coverage を拡張する。workflow、schema、CLI、永続化 data contract の変更はない。"
agent_slots:
  - role: se
    slot_label: "SE - relation graph の上位参照 coverage"
  - role: tl
    slot_label: "TL - DB gate 回帰レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-156-top-level-reference-doc-graph-node.md
    artifact_type: markdown_doc
  - artifact_path: src/graph/loader.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph-loader.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-155-proposal-research-source-constants.md
  requires:
    - docs/governance/repository-structure.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T17:48:30+09:00"
    tests_green_at: "2026-06-25T17:47:25+09:00"
    verdict: approve
    scope: "tracked な上位参照 docs を relation graph design node として materialize し、削除差分を引き続き分析可能にする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\relation-graph-loader.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T17:46:41+09:00"
        evidence_path: tests/relation-graph-loader.test.ts
        output_digest: "sha256:61c16d3b9e3305cc2e79000f5bde9c6169b0bb1bdaaab6b25541c1ce293804ba"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:47:06+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:0b826984a99a3760f8e94fe3fade2d525978387788548757dff4969b61951d5b"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:46:51+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:0b826984a99a3760f8e94fe3fade2d525978387788548757dff4969b61951d5b"
      - kind: smoke
        command: "npm run src\\cli.ts db rebuild"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:47:25+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:0b826984a99a3760f8e94fe3fade2d525978387788548757dff4969b61951d5b"
---

# PLAN-L7-156: 上位参照 doc の relation graph node

## 目的

tracked な上位参照 document が削除または変更され、working tree に対象ファイルが存在しない場合でも、
relation graph DB gate が `missing-projection` を報告しないようにする。

> **訂正 (PO 2026-06-25)**: 対象参照 doc を repo 直下から `docs/reference/ai-agent-harness-directory-reference.md`
> へ移設。loader 定数 `TOP_LEVEL_REFERENCE_DOCS` → `REFERENCE_DOCS` に改称し新パスを指す (本 PLAN 名・目的の
> `top-level` は歴史的呼称)。node は引き続き materialize される (パスのみ変更)。loader.ts / test 更新に伴う
> green_commands digest は green 再実行のうえ再整合済。

## 範囲

- 既知の tracked な上位参照 docs を design nodes として relation graph source set に追加する。
- 既存の process-doc と agent-doc の graph coverage を維持する。
- 次の path について fixture と real-repo の regression checks を追加する:
  `docs/reference/ai-agent-harness-directory-reference.md`.

## 受入条件

- `docs/reference/ai-agent-harness-directory-reference.md` が fixture repository に存在しない場合でも、relation graph
  node として materialize される。
- その path の change impact analysis が `missing-projection` を出力しない。
- targeted な relation graph loader tests、typecheck、lint、DB rebuild、doctor が通過する。
