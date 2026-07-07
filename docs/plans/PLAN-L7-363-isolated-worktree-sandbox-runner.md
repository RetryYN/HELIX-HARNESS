---
plan_id: PLAN-L7-363-isolated-worktree-sandbox-runner
title: "PLAN-L7-363: isolated worktree sandbox runner"
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
backprop_decision_reason: "agent run の隔離契約を追加する L7 実装。VM/cluster/provider の実 apply は別承認境界へ残す。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - worktree sandbox run packet"
  - role: tl
    slot_label: "TL - destructive git / network / credential boundary"
generates:
  - artifact_path: docs/plans/PLAN-L7-363-isolated-worktree-sandbox-runner.md
    artifact_type: markdown_doc
  - artifact_path: tests/isolated-worktree-sandbox-runner.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-230-destructive-git-command-guard
  references:
    - PLAN-L7-370-security-credential-egress-guard
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-363: isolated worktree sandbox runner 整備

## 目的

parallel runner / sandbox orchestrator 系の知見を HELIX へ取り込み、agent run を main worktree 直実行ではなく
isolated worktree / optional container / network policy / checkpoint を持つ run packet として扱う。

## スコープ

- `helix run isolate --dry-run` 相当の plan-only packet を追加する。
- worktree path、base ref、allowed paths、network policy、credential policy、rollback command を出す。
- local-only worktree 作成と cleanup は explicit approval option で分ける。
- external VM / Kubernetes / cloud sandbox は dry-run contract のみ。

## 対象外

- cloud VM / Kubernetes Pod の実作成。
- secret / credential の注入。
- main branch への auto merge。

## 受入条件

- dirty main worktree では isolate plan が警告または fail-close する。
- destructive cleanup は explicit target path と dry-run evidence を要求する。
- sandbox policy は JSON に残り、handover / run receipt から参照できる。

## 検証予定

- `bun test tests/git-command-guard.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-363-isolated-worktree-sandbox-runner.md`
