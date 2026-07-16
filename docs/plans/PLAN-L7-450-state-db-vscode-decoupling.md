---
plan_id: PLAN-L7-450-state-db-vscode-decoupling
title: "PLAN-L7-450 (refactor): state-db / VS Code ownership分離"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals: ["po_directive:2026-07-13 PLAN-L7-446 #11 architecture cycleをexact Vペアで解消"]
created: 2026-07-13
updated: 2026-07-13
owner: Codex
review_evidence:
  - reviewer: node_evidence_audit
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-17T02:15:12+09:00"
    tests_green_at: "2026-07-17T02:14:52+09:00"
    verdict: pass
    scope: "source boundary設計、V-pair、state-db/VS Code分離、headless composition、policy/effect/durability負例を独立監査。Blocker/High 0、関連63 tests・typecheck・Biome green。"
agent_slots:
  - { role: se, slot_label: "SE — contract/projector/evidence owner分離" }
  - { role: qa, slot_label: "QA — cycle/headless adapter oracle" }
backprop_decision: not_required
backprop_decision_reason: "confirmed前のPLAN-L6-79 contractを実装候補へ具体化し、上位意味は変更しない。"
parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md
pair_artifact: docs/test-design/harness/L8-source-boundary-contracts.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-001, test_path: tests/visualization-evidence.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-002, test_path: tests/source-boundary-integration.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-005, test_path: tests/tree-decoration.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-450-state-db-vscode-decoupling.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/visualization-contract.ts, artifact_type: source_module }
  - { artifact_path: src/schema/visualization-current-location-contract.ts, artifact_type: source_module }
  - { artifact_path: src/schema/visualization-view-contract.ts, artifact_type: source_module }
  - { artifact_path: src/schema/visualization-tree-contract.ts, artifact_type: source_module }
  - { artifact_path: src/composition/db-rebuild-composition.ts, artifact_type: source_module }
  - { artifact_path: src/vmodel/visualization-tree-projector.ts, artifact_type: source_module }
  - { artifact_path: src/vscode/tree-decoration.ts, artifact_type: source_module }
  - { artifact_path: src/vscode/tree-view-provider.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/visualization-evidence.ts, artifact_type: source_module }
  - { artifact_path: tests/tree-decoration.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/source-boundary-integration.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-79-source-boundary-contracts.md
  requires: []
---

# PLAN-L7-450: state-db / VS Code ownership分離

## 実装境界

共有DTO、pure projector、state-db evidence、VS Code decorationを物理分離し、`src/composition/`のcomposition rootだけで接続する。
既存symbolを新ownerへ移した後、state-dbとVS Code間のdirect/type-only edgeを0にする。

## 実装済み出力（draft、closure前）

次の source artifact は本PLANの実装出力であり、frontmatterの`generates`に登録済みである。
ただしstate-dbのcomposition反転、L9 integration oracle、independent reviewを終えるまでPLANはdraftのままとする。

- `src/schema/visualization-contract.ts`
- `src/vmodel/visualization-tree-projector.ts`
- `src/state-db/visualization-evidence.ts`

## 検証境界

`tests/source-boundary-design.test.ts` は既存のV-pair structural guardであり、本PLANの生成物ではない。
`verification_bindings` は後続実装時に当該oracleを具体的なbehavior testへ拡張する責務を表す。

## 完了条件

`U-SBOUND-001/002/005`と`IT-SBOUND-001/002`、typecheck、targeted test、independent reviewがgreenである。
