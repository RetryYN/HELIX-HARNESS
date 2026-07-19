---
plan_id: PLAN-L7-373-change-package-delta-archive
title: "PLAN-L7-373: change package delta archive"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-07
updated: 2026-07-09
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:agent-spec-orchestrator-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "OpenSpec の change package / archive pattern を HELIX PLAN と trace freeze の L7 validator へ変換する。外部 runtime は導入しない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - change package / delta / archive validator"
  - role: qa
    slot_label: "QA - archive does not hide active work"
generates:
  - artifact_path: docs/plans/PLAN-L7-373-change-package-delta-archive.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/change-package-delta-archive.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/change-package-delta-archive.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-332-plan-filing-completeness
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:16:49+09:00"
    tests_green_at: "2026-07-09T17:15:55+09:00"
    verdict: approve
    scope: "PLAN-L7-373 change package delta archive。change package manifest / delta / archive dry-run validator と helix change package surface を追加し、active work を archive で隠さない fail-close、design/test-design binding、rollback path、evidence digest を機械検査した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/tool-augmentation-registry.test.ts tests/change-package-delta-archive.test.ts tests/cross-repo-spec-store.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:15:55+09:00"
        evidence_path: tests/change-package-delta-archive.test.ts
        output_digest: "sha256:1b70ff4740b9706fb5deab3ae6d87dbd7922efa69c19d62d122c7bf0d6206b69"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:14:05+09:00"
        evidence_path: src/runtime/change-package-delta-archive.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install biome check src/runtime/tool-augmentation-registry.ts src/runtime/change-package-delta-archive.ts src/runtime/cross-repo-spec-store.ts tests/tool-augmentation-registry.test.ts tests/change-package-delta-archive.test.ts tests/cross-repo-spec-store.test.ts tests/cli-surface.test.ts src/cli.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:14:05+09:00"
        evidence_path: src/runtime/change-package-delta-archive.ts
        output_digest: "sha256:88e86a20cdded819cf108c1e8b8f406dfbc0033845e4a9fc97ec31d65b0eb2f2"
---

# PLAN-L7-373: change package delta archive 整備

## 目的

OpenSpec の proposal / design / tasks / spec delta / archive pattern を、HELIX の PLAN、設計層、
trace freeze、archive policy に従う change package validator へ変換する。

## スコープ

- change package manifest を定義する。
- PLAN、関連設計、test design、acceptance evidence、archive decision を 1 packet として検査する。
- active draft を archive で隠す操作を fail-close する。
- delta は HELIX L0-L14 のどの層へ影響するかを明示する。

## 対象外

- OpenSpec runtime / command の移植。
- `.openspec/` または `openspec/` を HELIX 正本にすること。
- archive による outstanding 解消。

## 受入条件

- packet なしの archive は active PLAN に対して失敗する。
- delta が design / test design のどちらにも結びつかない場合は失敗する。
- archive decision は rollback path と evidence digest を持つ。

## 検証予定

- `npm test tests/change-package-delta-archive.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-373-change-package-delta-archive.md`
