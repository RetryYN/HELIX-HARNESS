---
plan_id: PLAN-L7-361-agent-catalog-watch
title: "PLAN-L7-361: external agent catalog watch"
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
backprop_decision_reason: "外部 catalog を HELIX capability ledger へ投影する L7 追加。外部 tool 導入や provider/API activation は行わない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - external catalog ledger / diff / freshness"
  - role: tl
    slot_label: "TL - no bulk import / capability-only adoption"
generates:
  - artifact_path: docs/plans/PLAN-L7-361-agent-catalog-watch.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-catalog-watch.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/agent-catalog-watch.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
  references:
    - docs/design/helix/L0-charter/helix-charter_v0.1.md
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:17:11+09:00"
    tests_green_at: "2026-07-09T16:16:48+09:00"
    verdict: approve
    scope: "PLAN-L7-361 external agent catalog watch。外部 install / execution なしで inventory digest、capability family 分類、source_rejected、unclassified fail-close、CLI read-only surface を追加した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/agent-catalog-watch.test.ts tests/runtime-capability-matrix.test.ts tests/isolated-worktree-sandbox-runner.test.ts tests/cli-surface.test.ts tests/runtime-adapter.test.ts tests/git-command-guard.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:16:48+09:00"
        evidence_path: tests/agent-catalog-watch.test.ts
        output_digest: "sha256:19104295c7cb615d72336559c5fb60a81b4d236b136068bda31db7f8e02aff28"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts audit agent-catalog --json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:14:37+09:00"
        evidence_path: src/runtime/agent-catalog-watch.ts
        output_digest: "sha256:f9a8225da9445b90e96ddf0dde846b4b4fc7c0689d9b11f74be553f89b7c1928"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T16:15:15+09:00"
        evidence_path: src/runtime/agent-catalog-watch.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

# PLAN-L7-361: 外部 agent catalog 監視

## 目的

外部 agent / orchestrator catalog を単発調査で終わらせず、refs、inventory digest、差分、
HELIX capability family への写像を ledger 化する。star 数や流行ではなく、HELIX の穴を塞ぐ
capability と検証可能性だけを採用判断に使う。

## スコープ

- `helix audit agent-catalog` 相当の read-only surface を追加する。
- source repo、ref、inventory count、sha256、new/removed/changed candidate を JSON で出す。
- candidate は個別 tool 名ではなく capability family に正規化する。
- closed-source / SaaS-only / license 不明 / leak-derived / guardrail-stripping を source 採用不可として分類する。

## 対象外

- 外部 repo への issue / PR 作成。
- 個別 agent CLI の install / execution。
- provider API key や credential 設定。

## 受入条件

- catalog digest が変わったときだけ actionable finding を出す。
- refs と inventory digest が audit doc に再現可能な command として残る。
- capability family に写像できない item は `unclassified` として fail-close し、黙って捨てない。

## 検証予定

- `npm test tests/cli-surface.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-361-agent-catalog-watch.md`
