---
plan_id: PLAN-L7-253-handover-owner-update
title: "PLAN-L7-253: handover owner 移譲 surface"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "AGENTS の handover owner 移譲手順と現行 CLI の不整合を埋める限定修正。L1/L3 の要求意味は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/handover-mechanism.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - handover owner update"
generates:
  - artifact_path: docs/plans/PLAN-L7-253-handover-owner-update.md
    artifact_type: markdown_doc
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
  - artifact_path: src/handover/handover-types.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/handover.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/handover-mechanism.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/design/harness/L6-function-design/handover-mechanism.md
  requires:
    - src/handover/index.ts
    - src/handover/handover-types.ts
    - src/cli.ts
    - tests/handover.test.ts
    - tests/cli-surface.test.ts
    - docs/design/harness/L6-function-design/handover-mechanism.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T13:00:00+09:00"
    tests_green_at: "2026-07-03T13:00:00+09:00"
    verdict: approve
    scope: "AGENTS の実 handover 再開手順で要求される owner 移譲を `helix handover update --owner` として実装した。owner 更新は `owner_updated_at` だけを刻み、handover 本文の freshness 根拠である `updated_at` は更新しないため、stale pointer を owner 移譲だけで fresh に見せない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/handover.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:00:00+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:636d1fd265e01015d6e88b07accff7828a405f345a479aa664590950c1a31556"
      - kind: unit_test
        command: "bun test tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:00:00+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:c73056d423ea43603e2ee4c03ba24da4615ce5b4d42908656ffd301b65915779"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T13:00:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:f7e063e82de3240a6fd46ac8bd6d1ae231b8b49d971097d3e8b69c274228a66c"
      - kind: smoke
        command: "bun run src/cli.ts handover update --owner codex --json; bun run src/cli.ts handover status --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:00:00+09:00"
        evidence_path: src/handover/index.ts
        output_digest: "sha256:b265440351d3879928db963ca1bdebc54f5405fe1da4d56e7011612e378469d3"
---

# PLAN-L7-253: handover owner 移譲 surface

## 目的

実フローで `.helix/handover/CURRENT.json` を確認した後、AGENTS の handover 手順どおり
`handover update --owner codex` を実行したところ、現行 CLI は `--owner` を受け付けなかった。
これは「handover を読んで所有権を移譲してから再開する」というワークフローの入口不整合である。

この PLAN では、handover の内容や PO 判断は変更せず、機械ポインタの baton 所有者だけを安全に更新する
read-modify-write surface を追加する。

## 変更

- `HandoverPointer` に `owner` / `owner_updated_at` を追加する。
- `updatePointerOwner(owner, deps)` を追加し、CURRENT.json 不在・壊れ JSON・空 owner・危険文字を fail-close する。
- `helix handover update --owner <owner>` を追加する。
- `handover status` text に owner を表示する。
- owner 更新は `updated_at` を変更しない。`updated_at` は handover 内容の freshness 判定用であり、owner 移譲で stale を隠さない。
- L6 設計と L7 test design に owner 移譲契約を追加する。

## 採用判断

- 採用: 既存 CURRENT.json を読み、owner field だけを追加する。
- 採用: `owner_updated_at` は別 field に分離し、handover 本体の `updated_at` は保持する。
- 不採用: `handover` 本体を再生成して owner を刻む。再生成は markdown scaffold と outstanding snapshot を更新するため、owner 移譲より blast radius が大きい。
- 不採用: owner 更新で stale を解除する。所有権移譲と内容鮮度は別証跡である。

## 完了条件

- `helix handover update --owner codex --json` が existing CURRENT.json に owner を記録する。
- owner 更新後も `updated_at` は不変で、stale 判定は既存 handover の鮮度に従う。
- owner 欠落、空 owner、危険文字、CURRENT.json 不在/壊れ JSON は fail-close する。
- targeted handover / CLI surface tests と typecheck が green。
