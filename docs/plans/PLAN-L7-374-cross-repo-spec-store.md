---
plan_id: PLAN-L7-374-cross-repo-spec-store
title: "PLAN-L7-374: cross-repo spec store"
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
backprop_decision_reason: "本 PLAN は cross-repo requirements store の L7 採用候補を起票する。repository boundary と distribution/source separation の L6 昇格は後続 add-design/backprop PLAN で扱い、書き込み有効化はしない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - read-only cross-repo spec store"
  - role: tl
    slot_label: "TL - repository boundary / approval gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-374-cross-repo-spec-store.md
    artifact_type: markdown_doc
  - artifact_path: tests/cross-repo-spec-store.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-204-upstream-adoption-decisions
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-374: cross-repo spec store

## 目的

OpenSpec Stores の pattern を、複数 repo にまたがる要件・PLAN・decision を read-only に参照できる
HELIX spec store contract へ変換する。

## スコープ

- cross-repo store manifest を定義する。
- store source、ref、read-only policy、freshness、trusted artifact type を記録する。
- write / sync / publish は action-binding approval なしに無効化する。
- consuming repo の PLAN から store artifact へ trace link を張る。

## 対象外

- 外部 repo への自動 push。
- credential / token 設定。
- hosted spec store。

## 受入条件

- store ref が固定されない参照は fail-close する。
- read-only でない store operation は approval required になる。
- consuming PLAN は store artifact digest を証跡に持つ。

## 検証予定

- `bun test tests/cross-repo-spec-store.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-374-cross-repo-spec-store.md`
