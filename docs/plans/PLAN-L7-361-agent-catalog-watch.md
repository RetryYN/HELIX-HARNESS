---
plan_id: PLAN-L7-361-agent-catalog-watch
title: "PLAN-L7-361: external agent catalog watch"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-07
updated: 2026-07-07
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:awesome-agent-catalog-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "外部 catalog を HELIX capability ledger へ投影する L7 追加。外部 tool 導入や provider/API activation は行わない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - external catalog ledger / diff / freshness"
  - role: tl
    slot_label: "TL - no bulk import / capability-only adoption"
generates:
  - artifact_path: docs/plans/PLAN-L7-361-agent-catalog-watch.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
    artifact_type: markdown_doc
  - artifact_path: tests/agent-catalog-watch.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-204-upstream-adoption-decisions
  references:
    - docs/design/helix/L0-charter/helix-charter_v0.1.md
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-361: external agent catalog watch

## 目的

外部 agent / orchestrator catalog を単発調査で終わらせず、refs、inventory digest、差分、
HELIX capability family への写像を ledger 化する。star 数や流行ではなく、HELIX の穴を塞ぐ
capability と検証可能性だけを採用判断に使う。

## スコープ

- `helix audit agent-catalog` 相当の read-only surface を追加する。
- source repo、ref、inventory count、sha256、new/removed/changed candidate を JSON で出す。
- candidate は個別 tool 名ではなく capability family に正規化する。
- closed-source / SaaS-only / license 不明 / leak-derived / guardrail-stripping を source 採用不可として分類する。

## 対象外

- 外部 repo への issue / PR 作成。
- 個別 agent CLI の install / execution。
- provider API key や credential 設定。

## 受入条件

- catalog digest が変わったときだけ actionable finding を出す。
- refs と inventory digest が audit doc に再現可能な command として残る。
- capability family に写像できない item は `unclassified` として fail-close し、黙って捨てない。

## 検証予定

- `bun test tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-361-agent-catalog-watch.md`
