---
plan_id: PLAN-L7-371-tool-augmentation-registry
title: "PLAN-L7-371: tool augmentation registry"
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
backprop_decision_reason: "MCP/LSP/browser/issue tool の採用基準を registry 化する L7 追加。外部 tool install/API activation は行わない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - tool augmentation registry / task lens integration"
  - role: qa
    slot_label: "QA - unsupported tool fail-close / no external activation"
generates:
  - artifact_path: docs/plans/PLAN-L7-371-tool-augmentation-registry.md
    artifact_type: markdown_doc
  - artifact_path: tests/tool-augmentation-registry.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-338-task-lens-injection
    - PLAN-REVERSE-33-mcp-profile-config-safety
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-371: tool augmentation registry 整備

## 目的

agent-lsp / agent-browser / Not Human Search / issue tracker / runbook compiler 系の知見を、
HELIX の task lens と MCP profile safety に従う tool augmentation registry へ落とす。

## スコープ

- tool augmentation registry schema を定義する。
- LSP、browser、issue tracker、runbook compiler、agent-ready search の capability / risk / required approval を記録する。
- task lens が registry から必要 tool の候補と禁止理由を出せるようにする。
- external install / API activation は dry-run suggestion に限定する。

## 対象外

- Playwright browser の本番利用。
- external issue tracker write は対象外。
- MCP server の自動 install。

## 受入条件

- tool ごとに read/write/network/credential/sandbox requirement を持つ。
- unsupported or approval-required tool は自動実行されない。
- task lens は tool 候補を出しても、それを完了証跡にしない。

## 検証予定

- `bun test tests/context-doc-router.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-371-tool-augmentation-registry.md`
