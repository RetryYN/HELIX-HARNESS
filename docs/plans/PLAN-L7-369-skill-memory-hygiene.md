---
plan_id: PLAN-L7-369-skill-memory-hygiene
title: "PLAN-L7-369: skill and memory hygiene"
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
backprop_decision_reason: "既存 skill / memory 機構の hygiene 追加。外部 skill marketplace の自動 install は行わない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - skill firing / reaper / memory retention"
  - role: qa
    slot_label: "QA - reversible quarantine / no knowledge loss"
generates:
  - artifact_path: docs/plans/PLAN-L7-369-skill-memory-hygiene.md
    artifact_type: markdown_doc
  - artifact_path: tests/skill-memory-hygiene.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/orchestration-memory.md
  requires:
    - PLAN-L7-70-skill-pack-curation
    - PLAN-L7-354-harness-memory-compaction-impl
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-369: skill と memory hygiene

## 目的

skill-optimizer / skillreaper / pi-reflect / Vestige / pi-mem 系の知見を HELIX の P7 memory と skill に取り込み、
増え続ける skill / memory が自走の邪魔にならないよう hygiene gate を作る。

## スコープ

- skill firing rate、loaded-but-unused、task miss、recommendation success を telemetry 化する。
- stale skill は削除ではなく reversible quarantine plan にする。
- memory retention は provenance、correction、active forgetting、compaction evidence を持つ。
- AGENTS/skill rule の自己改善は PO 指摘または verified failure からのみ昇格する。

## 対象外

- 外部 skill marketplace からの自動 install。
- memory の vector DB 導入。
- 成功未検証の自己書き換え。

## 受入条件

- unused skill は即削除されず、quarantine plan と rollback path を持つ。
- skill improvement は before/after evaluation evidence を必要とする。
- memory compaction は source provenance を失わない。

## 検証予定

- `bun test tests/skill-recommend.test.ts tests/memory-compaction.test.ts tests/feedback-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-369-skill-memory-hygiene.md`
