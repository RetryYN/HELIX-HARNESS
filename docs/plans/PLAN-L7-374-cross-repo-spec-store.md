---
plan_id: PLAN-L7-374-cross-repo-spec-store
title: "PLAN-L7-374: cross-repo spec store"
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
backprop_decision_reason: "本 PLAN は cross-repo requirements store の L7 採用候補を起票する。repository boundary と distribution/source separation の L6 昇格は後続 add-design/backprop PLAN で扱い、書き込み有効化はしない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - read-only cross-repo spec store"
  - role: tl
    slot_label: "TL - repository boundary / approval gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-374-cross-repo-spec-store.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/cross-repo-spec-store.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/cross-repo-spec-store.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-204-upstream-adoption-decisions
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:16:49+09:00"
    tests_green_at: "2026-07-09T17:15:55+09:00"
    verdict: approve
    scope: "PLAN-L7-374 cross-repo spec store。cross-repo spec store manifest と helix spec-store check dry-run surface を追加し、unpinned ref、write/sync/publish、digest 欠落、action-binding approval 境界を fail-close で機械検査した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/tool-augmentation-registry.test.ts tests/change-package-delta-archive.test.ts tests/cross-repo-spec-store.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:15:55+09:00"
        evidence_path: tests/cross-repo-spec-store.test.ts
        output_digest: "sha256:1b70ff4740b9706fb5deab3ae6d87dbd7922efa69c19d62d122c7bf0d6206b69"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:14:05+09:00"
        evidence_path: src/runtime/cross-repo-spec-store.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install biome check src/runtime/tool-augmentation-registry.ts src/runtime/change-package-delta-archive.ts src/runtime/cross-repo-spec-store.ts tests/tool-augmentation-registry.test.ts tests/change-package-delta-archive.test.ts tests/cross-repo-spec-store.test.ts tests/cli-surface.test.ts src/cli.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:14:05+09:00"
        evidence_path: src/runtime/cross-repo-spec-store.ts
        output_digest: "sha256:88e86a20cdded819cf108c1e8b8f406dfbc0033845e4a9fc97ec31d65b0eb2f2"
---

# PLAN-L7-374: cross-repo spec store 整備

## 目的

OpenSpec Stores の pattern を、複数 repo にまたがる要件・PLAN・decision を read-only に参照できる
HELIX spec store contract へ変換する。

## スコープ

- cross-repo store manifest を定義する。
- store source、ref、read-only policy、freshness、trusted artifact type を記録する。
- write / sync / publish は action-binding approval なしに無効化する。
- consuming repo の PLAN から store artifact へ trace link を張る。

## 対象外

- 外部 repo への自動 push。
- credential / token 設定。
- hosted spec store。

## 受入条件

- store ref が固定されない参照は fail-close する。
- read-only でない store operation は approval required になる。
- consuming PLAN は store artifact digest を証跡に持つ。

## 検証予定

- `npm test tests/cross-repo-spec-store.test.ts --timeout 180000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-374-cross-repo-spec-store.md`
