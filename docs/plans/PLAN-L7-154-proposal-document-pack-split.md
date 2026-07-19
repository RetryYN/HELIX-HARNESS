---
plan_id: PLAN-L7-154-proposal-document-pack-split
title: "PLAN-L7-154: proposal document pack 分割"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "task classification data 内の catalog 分割であり、behavior は不変。public CLI/API contract、persisted schema、requirement semantics、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - proposal document pack 分割"
  - role: tl
    slot_label: "TL - classification invariant レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-154-proposal-document-pack-split.md
    artifact_type: markdown_doc
  - artifact_path: src/task/proposal-coverage-data.ts
    artifact_type: source_module
  - artifact_path: src/task/proposal-document-pack-types.ts
    artifact_type: source_module
  - artifact_path: src/task/proposal-document-packs-core.ts
    artifact_type: source_module
  - artifact_path: src/task/proposal-document-packs-operations.ts
    artifact_type: source_module
  - artifact_path: tests/task-classify.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-153-proposal-research-data-extraction.md
  requires:
    - docs/plans/PLAN-L7-153-proposal-research-data-extraction.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T17:29:00+09:00"
    tests_green_at: "2026-06-25T17:29:00+09:00"
    verdict: approve
    scope: "proposal document pack catalog を core module と operations module へ分割し、behavior は不変に保つ。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\task-classify.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T17:28:43+09:00"
        evidence_path: tests/task-classify.test.ts
        output_digest: "sha256:5f3b411831eaf5df7f40ac95cce1623fd7f47b85ebc2ff6012b53b5610dd519d"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:28:43+09:00"
        evidence_path: src/task/proposal-document-pack-types.ts
        output_digest: "sha256:e2c59a540a7b3a5e9cb4ebff4c670d15890c5e47438c6e39712ce8d0c556ce03"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:29:00+09:00"
        evidence_path: src/task/proposal-coverage-data.ts
        output_digest: "sha256:7d90403d7b0dcbc190e67c46405e6c468a8a481fbcfba1fdffafeff8d756807f"
---

# PLAN-L7-154: proposal document pack 分割

## 目的

残っている `proposal-coverage-data.ts` の split-module 圧力を解消するため、
document pack の type/helper 定義を 2 つの document pack catalog group から分離する。

## 対象範囲

- `DocumentPack`、level rank maps、`doc()` を
  `src/task/proposal-document-pack-types.ts` へ移す。
- document pack catalog entries を
  `src/task/proposal-document-packs-core.ts` と
  `src/task/proposal-document-packs-operations.ts` へ分割する。
- `src/task/proposal-coverage-data.ts` は existing callers 向けの stable aggregate export として維持する。
- task classification tests は、分割後の catalog modules を直接 import するよう更新する。

## 受入条件

- Proposal document coverage behavior は変更しない。
- `npx --no-install vitest run tests\task-classify.test.ts` が pass する。
- `npm run typecheck`、`npm run lint`、DB rebuild、doctor が pass する。
