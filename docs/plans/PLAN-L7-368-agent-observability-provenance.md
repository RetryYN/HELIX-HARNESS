---
plan_id: PLAN-L7-368-agent-observability-provenance
title: "PLAN-L7-368: agent observability and provenance"
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
backprop_decision_reason: "既存 telemetry / run-debug 証跡の観測面拡張。外部 telemetry service は導入しない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - transcript / cost / diff attribution read model"
  - role: qa
    slot_label: "QA - no secret / PII transcript leakage"
generates:
  - artifact_path: docs/plans/PLAN-L7-368-agent-observability-provenance.md
    artifact_type: markdown_doc
  - artifact_path: tests/agent-observability-provenance.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-316-runtime-telemetry-provenance
    - PLAN-L7-202-run-debug-runtime-verification
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-368: agent observability and provenance

## 目的

agenttrace / AgentSight / AgentDiff / transcript browser 系の知見を HELIX の telemetry と run-debug に接続し、
cross-runtime session を後から検索・比較・監査できる read model を作る。

## スコープ

- session transcript index、command digest、cost/latency、failure/anomaly、diff attribution の schema を検討する。
- raw transcript は secret/PII sanitization と retention policy を必須にする。
- `helix telemetry sessions --json` 相当の read-only surface を追加する。
- code line attribution は git refs / commit への projection として扱い、真実 claim ではなく provenance hint にする。

## 対象外

- eBPF collector の導入。
- third-party telemetry SaaS。
- secret を含む raw transcript 保存。

## 受入条件

- transcript index は secret / credential marker を保存しない。
- cost / latency は model_run と command evidence に紐づく。
- diff attribution は commit hash と agent session id を持つ。

## 検証予定

- `bun test tests/token-tracker.test.ts tests/run-debug.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-368-agent-observability-provenance.md`
