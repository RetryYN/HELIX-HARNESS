---
plan_id: PLAN-L7-383-harness-taxonomy-curation-policy
title: "PLAN-L7-383: harness taxonomy curation policy"
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
backprop_decision_reason: "awesome harness / topic ledger の分類基準を HELIX catalog watch の L7 policy へ追加する。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - taxonomy / curation policy"
  - role: qa
    slot_label: "QA - source verification / freshness"
generates:
  - artifact_path: docs/plans/PLAN-L7-383-harness-taxonomy-curation-policy.md
    artifact_type: markdown_doc
  - artifact_path: tests/harness-taxonomy-curation-policy.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-361-agent-catalog-watch
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-383: harness taxonomy curation policy

## 目的

GitHub topic `agent-harness` と awesome harness catalog を、HELIX の採用判断に使える taxonomy と
curation policy へ変換する。

## スコープ

- harness taxonomy を定義する。
- source verification、license risk、activity freshness、scope fit、capability family を記録する。
- topic search query と result digest を audit evidence として保存する。
- star count は補助 metadata に限定し、採用根拠にしない。

## 対象外

- topic 全 repo の自動 install。
- popularity ranking による採用。
- license 不明 source の code import。

## 受入条件

- unclassified source は fail-close し、黙って捨てない。
- topic result digest が変わった場合は差分だけを追突する。
- curation policy は PLAN と audit doc の両方から参照できる。

## 検証予定

- `bun test tests/harness-taxonomy-curation-policy.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-383-harness-taxonomy-curation-policy.md`
