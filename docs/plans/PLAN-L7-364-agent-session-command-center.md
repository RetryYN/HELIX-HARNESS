---
plan_id: PLAN-L7-364-agent-session-command-center
title: "PLAN-L7-364: agent session command center"
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
backprop_decision_reason: "status/handover の read-model 拡張。GUI や remote channel activation は含めない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - session board read model / needs-you triage"
  - role: qa
    slot_label: "QA - stale handover / resume state regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-364-agent-session-command-center.md
    artifact_type: markdown_doc
  - artifact_path: tests/agent-session-command-center.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-355-handover-db-derivation-impl
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-364: agent session command center

## 目的

kanban / dashboard / session manager 系の知見を HELIX の DB read-model に落とし、複数 agent session の
状態、needs-you、blocked reason、next action、resume/handover を一覧できる surface を作る。

## スコープ

- `helix sessions board --json` 相当の read-only surface を追加する。
- session id、role、task、plan id、worktree、state、heartbeat、needs-you reason、handover path を集約する。
- text mode は compact table、JSON は UI / future webview がそのまま使える stable schema にする。
- remote/mobile/Telegram/Slack は notification adapter 候補として記録のみ。

## 対象外

- GUI / Web dashboard 実装。
- 外部 messaging platform 連携。
- hosted service。

## 受入条件

- stale session と active session を deterministic に区別する。
- needs-you は human escalation 境界と gate red を区別する。
- handover DB 由来の next action を prose handover より優先する。

## 検証予定

- `bun test tests/handover-db-derivation.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-364-agent-session-command-center.md`
