---
plan_id: PLAN-L7-155-proposal-research-source-constants
title: "PLAN-L7-155: proposal research source constants の定数化"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "proposal research catalog 内の挙動不変な literal 外部化。公開 CLI/API contract、永続 schema、requirement semantics、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - proposal research literal 外部化"
  - role: tl
    slot_label: "TL - classification invariant レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-155-proposal-research-source-constants.md
    artifact_type: markdown_doc
  - artifact_path: src/task/proposal-research-data.ts
    artifact_type: source_module
  - artifact_path: tests/task-classify.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-154-proposal-document-pack-split.md
  requires:
    - docs/plans/PLAN-L7-154-proposal-document-pack-split.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T17:34:46+09:00"
    tests_green_at: "2026-06-25T17:34:46+09:00"
    verdict: approve
    scope: "proposal research catalog における挙動不変な source-name constant 抽出。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\task-classify.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T17:34:20+09:00"
        evidence_path: tests/task-classify.test.ts
        output_digest: "sha256:5f3b411831eaf5df7f40ac95cce1623fd7f47b85ebc2ff6012b53b5610dd519d"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:34:18+09:00"
        evidence_path: src/task/proposal-research-data.ts
        output_digest: "sha256:c028b8e6d44f65a79159a3741073753bdb1f33774976f2fcee39179e89b1ffbe"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:34:21+09:00"
        evidence_path: src/task/proposal-research-data.ts
        output_digest: "sha256:c028b8e6d44f65a79159a3741073753bdb1f33774976f2fcee39179e89b1ffbe"
---

# PLAN-L7-155: proposal research source constants の定数化

## 目的

`src/task/proposal-research-data.ts` に残る `externalize-literal` candidate を、
重複する source-name 文字列から named constants への置換で解消する。

## スコープ

- 重複する research source name に named constants を追加する。
- research adoption/rejection の全 output values を保持する。
- task classification の挙動を変更しない。

## 受入条件

- `proposal-research-data.ts` が `externalize-literal` candidate を出さなくなる。
- `npx --no-install vitest run tests\task-classify.test.ts` が pass する。
- `npm run typecheck`、`npm run lint`、DB rebuild、doctor が pass する。
