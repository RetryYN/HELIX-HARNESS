---
plan_id: PLAN-L7-376-artifact-convergence-analyzer
title: "PLAN-L7-376: artifact convergence analyzer"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-07
updated: 2026-07-07
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:agent-spec-orchestrator-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "Spec Kit の clarify/analyze/checklist/converge pattern を HELIX の既存 lint / outstanding へ接続する L7 追加。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: qa
    slot_label: "QA - cross-artifact gap analyzer"
  - role: se
    slot_label: "SE - converge task generation"
generates:
  - artifact_path: docs/plans/PLAN-L7-376-artifact-convergence-analyzer.md
    artifact_type: markdown_doc
  - artifact_path: tests/artifact-convergence-analyzer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-332-plan-filing-completeness
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-376: artifact convergence analyzer

## 目的

spec / plan / tasks / code / tests の gap を横断検査し、残作業を新しい task / PLAN 候補として返す
HELIX convergence analyzer を追加する。

## スコープ

- artifact coverage matrix を生成する。
- ambiguity、contradiction、missing test、stale task、implemented-without-design を分類する。
- finding は actionable task と escalation-needed に分ける。

## 対象外

- LLM judge のみの合否。
- code 自動修正。
- human approval の代替。

## 受入条件

- finding は source artifact と line / digest を持つ。
- unresolved critical finding がある場合は completion claim を許可しない。
- generated task は existing PLAN と重複検査される。

## 検証予定

- `bun test tests/artifact-convergence-analyzer.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-376-artifact-convergence-analyzer.md`
