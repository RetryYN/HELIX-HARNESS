---
plan_id: PLAN-L7-363-isolated-worktree-sandbox-runner
title: "PLAN-L7-363: isolated worktree sandbox runner"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-07
updated: 2026-07-09
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
  - artifact_path: src/runtime/isolated-worktree-sandbox-runner.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/isolated-worktree-sandbox-runner.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - docs/plans/PLAN-L7-230-destructive-git-command-guard.md
  references:
    - PLAN-L7-370-security-credential-egress-guard
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:17:11+09:00"
    tests_green_at: "2026-07-09T16:16:48+09:00"
    verdict: approve
    scope: "PLAN-L7-363 isolated worktree sandbox runner。実 worktree 作成なしの dry-run packet、dirty baseline fail-close、allow-dirty warning、network / credential policy、rollback command、destructive cleanup evidence requirements を追加した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/agent-catalog-watch.test.ts tests/runtime-capability-matrix.test.ts tests/isolated-worktree-sandbox-runner.test.ts tests/cli-surface.test.ts tests/runtime-adapter.test.ts tests/git-command-guard.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:16:48+09:00"
        evidence_path: tests/isolated-worktree-sandbox-runner.test.ts
        output_digest: "sha256:19104295c7cb615d72336559c5fb60a81b4d236b136068bda31db7f8e02aff28"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts run isolate --dry-run --allow-dirty --json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:14:37+09:00"
        evidence_path: src/runtime/isolated-worktree-sandbox-runner.ts
        output_digest: "sha256:a4597fc58b5a30618371f56441c7bb6b0a36c6f7fb525396b4b05a963c5d5c7a"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T16:15:15+09:00"
        evidence_path: src/runtime/isolated-worktree-sandbox-runner.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
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

- `npm test tests/git-command-guard.test.ts tests/cli-surface.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-363-isolated-worktree-sandbox-runner.md`
