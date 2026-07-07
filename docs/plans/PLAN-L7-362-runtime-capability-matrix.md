---
plan_id: PLAN-L7-362-runtime-capability-matrix
title: "PLAN-L7-362: runtime capability matrix"
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
backprop_decision_reason: "既存 adapter / role routing の L7 hardening。外部 runtime 実行や provider activation は含めない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - runtime capability schema / routing evidence"
  - role: qa
    slot_label: "QA - unsupported capability fail-close"
generates:
  - artifact_path: docs/plans/PLAN-L7-362-runtime-capability-matrix.md
    artifact_type: markdown_doc
  - artifact_path: tests/runtime-capability-matrix.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-337-delegation-brief-role-judgment
    - PLAN-L7-338-task-lens-injection
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-362: runtime capability matrix 整備

## 目的

Codex / Claude / Gemini / OpenCode / Aider などの外部 runtime pattern から、HELIX の adapter が扱える
capability と扱えない capability を機械的に表現する。role routing は「使えるはず」ではなく、
tool、sandbox、hooks、MCP、browser、LSP、headless、resume、cost telemetry の可否を evidence で判断する。

## スコープ

- runtime capability schema を定義する。
- `helix runtime capabilities --json` 相当の read-only surface を追加する。
- role / task lens / adapter routing が必要 capability を満たさない場合に fail-close する。
- unsupported capability は fallback / escalation / no-op のいずれかを明示する。

## 対象外

- 新しい外部 provider の key 設定。
- external CLI の自動 install。
- model quality ranking。

## 受入条件

- adapter が主張する capability は test fixture で証明される。
- unknown runtime は permissive に扱わず `unsupported` になる。
- route decision に capability evidence path が含まれる。

## 検証予定

- `bun test tests/runtime-adapter.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-362-runtime-capability-matrix.md`
