---
plan_id: PLAN-L7-379-extension-preset-bundle-registry
title: "PLAN-L7-379: extension preset bundle registry"
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
backprop_decision_reason: "本 PLAN は extension/preset/bundle lifecycle の L7 採用候補を起票する。setup/distribution surface の L6 / distribution policy 昇格は後続 add-design/backprop PLAN で扱う。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - extension/preset/bundle registry"
  - role: tl
    slot_label: "Security - install policy / hash manifest"
generates:
  - artifact_path: docs/plans/PLAN-L7-379-extension-preset-bundle-registry.md
    artifact_type: markdown_doc
  - artifact_path: tests/extension-preset-bundle-registry.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-317-skill-scaffold-generator
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-379: extension preset bundle registry

## 目的

Spec Kit の extension / preset / bundle lifecycle と oh-my-agent の preset distribution pattern を、
HELIX の opt-in registry、install policy、hash manifest へ変換する。

## スコープ

- extension / preset / bundle manifest schema を定義する。
- official / community / local catalog と install-allowed / discovery-only を分ける。
- installed files は hash manifest で追跡し、user modified file を上書きしない。
- bundle は role-oriented setup として component set を固定する。

## 対象外

- 外部 marketplace からの自動 install。
- network install の default enablement。
- secrets を含む config bundle。

## 受入条件

- install は dry-run plan と hash manifest を出す。
- remove は自分が置いた未変更ファイルだけを対象にする。
- community catalog は既定で discovery-only になる。

## 検証予定

- `bun test tests/extension-preset-bundle-registry.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-379-extension-preset-bundle-registry.md`
