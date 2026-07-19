---
plan_id: PLAN-L6-72-closure-evidence-materialization
title: "PLAN-L6-72 (add-design): closure証跡materialization"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-12 PLAN-L7-425 I8 production evidence materialization経路欠落"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-71のclosure評価契約へproduction証跡生成の前段を追加する。L0-L3要求は変更しない。"
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE - authority migrationとrunner transaction設計" }
  - { role: qa, slot_label: "QA - legacy backfill、replay、crash敵対検証" }
generates:
  - { artifact_path: docs/design/harness/L6-function-design/closure-evidence-materialization.md, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L6-71-closure-auto-approval.md
  requires: [docs/plans/PLAN-L6-71-closure-auto-approval.md]
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-11T23:40:42Z"
    reviewed_at: "2026-07-11T23:40:42Z"
    verdict: approve_after_fixes
    scope: "production証跡生成欠落、authority registry、argv dedupe、oracle実通過、DB/JSONL/filesystem transaction、gate receipt、local hash境界を敵対監査した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-coverage.test.ts tests/design-language.test.ts tests/l6-completion.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-11T23:40:42Z", evidence_path: docs/test-design/harness/L8-unit-test-design.md, output_digest: "sha256:c2700ce04f8c3f22ca8d538d4ad1b2de3f247cff221e71a286e91f771deeb50b" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L6-72-closure-evidence-materialization.md", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-11T23:40:42Z", evidence_path: docs/plans/PLAN-L6-72-closure-evidence-materialization.md, output_digest: "sha256:6b3a05038ab49afdd92ad55897948acfc6632d2a72bf056ae227400f26b67443" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-11T23:40:42Z", evidence_path: docs/design/harness/L6-function-design/closure-evidence-materialization.md, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
---

# PLAN-L6-72: closure証跡materialization

## 1. 目的

`close_ready`候補を機械承認器へ渡す前段として、repo-owned authorityの完全性を検査し、実runner結果を
harness.db、append-only attestation、canonical run record、typed manifestへ同一transaction identityで
materializeする。authority欠落を自己申告や一括既定値で埋めない。

## 2. 完了条件

- L6契約と`U-CMAT-001..010`がVペアとしてfreezeされる。
- terminal PLAN全件を`eligible / authority_backfill_required / human_only / invalid`へ分類できる。
- implementation PLANは本設計のreview evidence確定後だけ起票する。

## 3. 非目標

- 本PLANでは361件へのexecuteを行わない。
- `verification_bindings`、oracle、required gate、不可逆capabilityを推測生成しない。
- 不可逆操作のhuman/action-binding approvalを自動化しない。
