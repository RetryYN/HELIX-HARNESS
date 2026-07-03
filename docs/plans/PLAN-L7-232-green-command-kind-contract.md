---
plan_id: PLAN-L7-232-green-command-kind-contract
title: "PLAN-L7-232 (troubleshoot): green command kind contract"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-108 は既存 review_evidence.green_commands の意味検証を強化する troubleshoot であり、新規 product requirement や外部 API contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM - green command evidence substance alignment"
  - role: tl
    slot_label: "TL - schema and lint contract implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-232-green-command-kind-contract.md
    artifact_type: markdown_doc
  - artifact_path: src/schema/green-command.ts
    artifact_type: source_module
  - artifact_path: src/schema/frontmatter.ts
    artifact_type: source_module
  - artifact_path: src/lint/review-evidence.ts
    artifact_type: source_module
  - artifact_path: tests/review-evidence.test.ts
    artifact_type: test_code
  - artifact_path: tests/frontmatter.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-224-pair-agent-difficulty-budget.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-225-approval-snapshot-binding.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-108-review-green-command-evidence.md
  requires:
    - docs/plans/PLAN-L7-108-review-green-command-evidence.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-232: green command kind contract

## 0. 目的

IMP-108 の既存実装は `green_commands[]` に command / runner / scope / exit_code /
evidence_path / output_digest を要求している。一方で `kind` と `command` の意味一致は弱く、
`kind=doctor` に `bun run lint`、または `kind=unit_test` に検証でない command を入れても
構造だけ満たせば通り得る。

この slice では `green_commands[].kind` と `green_commands[].command` の対応を schema と
review-evidence lint の両方で機械検証し、green command evidence を prose でなく実行面の意味へ寄せる。

## 1. Scope

対象:

- `src/schema/green-command.ts` に green command の kind / runner / scope 定数と command-kind 判定を置く。
- `frontmatterSchema` が `green_commands[].command` と `kind` の不一致を reject する。
- `frontmatterSchema` と `analyzeReviewEvidence` が `output_digest` を `sha256:<64 hex>` に統一し、短縮 digest を reject する。
- `analyzeReviewEvidence` が既存 PLAN の review evidence でも `command_kind_mismatch` / `invalid_output_digest` を surface する。
- 既存 PLAN 内の `db rebuild && doctor` 誤分類 (`kind=lint`) を `kind=doctor` へ正す。
- L6 function spec、L7 unit oracle、IMP-108 backlog を同期する。

対象外:

- `output_digest` と現行 `evidence_path` hash の一致を過去証跡へ強制する変更。
- test result / flake history の DB projection 完成。これは IMP-109 の scope。

## 2. 受入条件

- `kind=doctor` + `command="bun run lint"` は schema / review-evidence lint の両方で fail。
- `kind=unit_test` + `bun test` / `vitest`、`kind=typecheck` + `typecheck` / `tsc --noEmit`、
  `kind=lint` + `lint` / `biome check` / `plan lint`、`kind=doctor` + `doctor`、
  `kind=vmodel_lint` + `vmodel lint` は通る。
- `output_digest` は 64 桁 sha256 だけを通し、短縮 digest は schema / lint の両方で fail する。
- 実 repo の既存 `green_commands[]` は意味不一致 0 件で doctor green を維持する。

## 3. テスト設計接続

対応 oracle は `docs/test-design/harness/L7-unit-test-design.md` の `U-GREENDEF-005` と
`U-GREENDEF-006`。
実テストは `tests/review-evidence.test.ts` と `tests/frontmatter.test.ts` に ID / 負例を持つ。

## 4. 完了条件

- [x] schema と review-evidence lint が同じ command-kind 判定を使う。
- [x] 実 repo の誤分類 PLAN が是正されている。
- [x] U-GREENDEF-005 / U-GREENDEF-006 が追加されている。
