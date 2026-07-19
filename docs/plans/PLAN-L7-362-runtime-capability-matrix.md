---
plan_id: PLAN-L7-362-runtime-capability-matrix
title: "PLAN-L7-362: runtime capability matrix"
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
  - artifact_path: src/runtime/runtime-capability-matrix.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-capability-matrix.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - docs/plans/PLAN-L7-337-delegation-brief-role-judgment.md
    - docs/plans/PLAN-L7-338-task-lens-injection.md
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T16:17:11+09:00"
    tests_green_at: "2026-07-09T16:16:48+09:00"
    verdict: approve
    scope: "PLAN-L7-362 runtime capability matrix。Codex / Claude / Gemini / OpenCode / Aider の capability、evidence_path、fallback、unknown runtime fail-close、route decision を read-only surface 化した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/agent-catalog-watch.test.ts tests/runtime-capability-matrix.test.ts tests/isolated-worktree-sandbox-runner.test.ts tests/cli-surface.test.ts tests/runtime-adapter.test.ts tests/git-command-guard.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:16:48+09:00"
        evidence_path: tests/runtime-capability-matrix.test.ts
        output_digest: "sha256:19104295c7cb615d72336559c5fb60a81b4d236b136068bda31db7f8e02aff28"
      - kind: smoke
        command: "bun src/cli.ts runtime capabilities --runtime codex --requires tool_shell hooks --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T16:14:37+09:00"
        evidence_path: src/runtime/runtime-capability-matrix.ts
        output_digest: "sha256:8071ed8e1cdfd03c2fff4a11f5e17f544cff86ce10cfae18289ce9c6eaecef8a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T16:15:15+09:00"
        evidence_path: src/runtime/runtime-capability-matrix.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
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
