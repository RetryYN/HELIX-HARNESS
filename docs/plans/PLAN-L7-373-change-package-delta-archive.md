---
plan_id: PLAN-L7-373-change-package-delta-archive
title: "PLAN-L7-373: change package delta archive"
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
backprop_decision_reason: "OpenSpec の change package / archive pattern を HELIX PLAN と trace freeze の L7 validator へ変換する。外部 runtime は導入しない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - change package / delta / archive validator"
  - role: qa
    slot_label: "QA - archive does not hide active work"
generates:
  - artifact_path: docs/plans/PLAN-L7-373-change-package-delta-archive.md
    artifact_type: markdown_doc
  - artifact_path: tests/change-package-delta-archive.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-332-plan-filing-completeness
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-373: change package delta archive 整備

## 目的

OpenSpec の proposal / design / tasks / spec delta / archive pattern を、HELIX の PLAN、設計層、
trace freeze、archive policy に従う change package validator へ変換する。

## スコープ

- change package manifest を定義する。
- PLAN、関連設計、test design、acceptance evidence、archive decision を 1 packet として検査する。
- active draft を archive で隠す操作を fail-close する。
- delta は HELIX L0-L14 のどの層へ影響するかを明示する。

## 対象外

- OpenSpec runtime / command の移植。
- `.openspec/` または `openspec/` を HELIX 正本にすること。
- archive による outstanding 解消。

## 受入条件

- packet なしの archive は active PLAN に対して失敗する。
- delta が design / test design のどちらにも結びつかない場合は失敗する。
- archive decision は rollback path と evidence digest を持つ。

## 検証予定

- `bun test tests/change-package-delta-archive.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-373-change-package-delta-archive.md`
