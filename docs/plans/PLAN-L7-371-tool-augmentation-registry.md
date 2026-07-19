---
plan_id: PLAN-L7-371-tool-augmentation-registry
title: "PLAN-L7-371: tool augmentation registry"
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
  - artifact_path: src/runtime/tool-augmentation-registry.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/tool-augmentation-registry.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-338-task-lens-injection
    - PLAN-REVERSE-33-mcp-profile-config-safety
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:16:49+09:00"
    tests_green_at: "2026-07-09T17:15:55+09:00"
    verdict: approve
    scope: "PLAN-L7-371 tool augmentation registry。task-lens 由来の tool 候補 registry と helix tools registry read-only surface を追加し、read/write/network/credential/sandbox requirement、approval-required/unsupported fail-close、候補は完了証跡ではない制約を機械表示した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/tool-augmentation-registry.test.ts tests/change-package-delta-archive.test.ts tests/cross-repo-spec-store.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:15:55+09:00"
        evidence_path: tests/tool-augmentation-registry.test.ts
        output_digest: "sha256:1b70ff4740b9706fb5deab3ae6d87dbd7922efa69c19d62d122c7bf0d6206b69"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:14:05+09:00"
        evidence_path: src/runtime/tool-augmentation-registry.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install biome check src/runtime/tool-augmentation-registry.ts src/runtime/change-package-delta-archive.ts src/runtime/cross-repo-spec-store.ts tests/tool-augmentation-registry.test.ts tests/change-package-delta-archive.test.ts tests/cross-repo-spec-store.test.ts tests/cli-surface.test.ts src/cli.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:14:05+09:00"
        evidence_path: src/runtime/tool-augmentation-registry.ts
        output_digest: "sha256:88e86a20cdded819cf108c1e8b8f406dfbc0033845e4a9fc97ec31d65b0eb2f2"
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

- `npm test tests/context-doc-router.test.ts tests/cli-surface.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-371-tool-augmentation-registry.md`
