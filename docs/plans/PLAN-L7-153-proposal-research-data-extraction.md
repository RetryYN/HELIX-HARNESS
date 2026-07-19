---
plan_id: PLAN-L7-153-proposal-research-data-extraction
title: "PLAN-L7-153: proposal research data の抽出"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "task classification data 内で catalog を振る舞い不変に抽出する。公開 CLI/API contract、永続化 schema、requirement semantics、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - proposal research catalog 抽出"
  - role: tl
    slot_label: "TL - classification 不変性レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-153-proposal-research-data-extraction.md
    artifact_type: markdown_doc
  - artifact_path: src/task/proposal-coverage-data.ts
    artifact_type: source_module
  - artifact_path: src/task/proposal-research-data.ts
    artifact_type: source_module
  - artifact_path: tests/task-classify.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
  requires:
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T17:23:53+09:00"
    tests_green_at: "2026-06-25T17:23:53+09:00"
    verdict: approve
    scope: "proposal research の採用/却下 catalog を振る舞い不変に抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\task-classify.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T17:23:27+09:00"
        evidence_path: tests/task-classify.test.ts
        output_digest: "sha256:5f3b411831eaf5df7f40ac95cce1623fd7f47b85ebc2ff6012b53b5610dd519d"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:23:25+09:00"
        evidence_path: src/task/proposal-research-data.ts
        output_digest: "sha256:c028b8e6d44f65a79159a3741073753bdb1f33774976f2fcee39179e89b1ffbe"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T17:23:28+09:00"
        evidence_path: src/task/proposal-coverage-data.ts
        output_digest: "sha256:7d90403d7b0dcbc190e67c46405e6c468a8a481fbcfba1fdffafeff8d756807f"
---

# PLAN-L7-153: proposal research data の抽出

## 目的

proposal document-pack data と research 採用/却下 policy data を分離し、
`proposal-coverage-data.ts` の split-module candidate を減らす。

## スコープ

- research 採用、却下、LLM shrinkage catalogs を
  `src/task/proposal-research-data.ts` へ移動する。
- 既存 import を安定させるため、`src/task/proposal-coverage-data.ts` は移動した symbols を
  re-export し続ける。
- task classification tests を更新し、新しい catalog module を直接 import して検証する。

## 受入条件

- task classification と proposal document coverage の behavior が変わらない。
- `npx --no-install vitest run tests\task-classify.test.ts` が成功する。
- `npm run typecheck`、`npm run lint`、DB rebuild、doctor が成功する。
