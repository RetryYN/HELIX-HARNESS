---
plan_id: PLAN-REVERSE-461-requirements-doc-registry
title: "PLAN-REVERSE-461: requirements-doc-registry 外部化の Reverse 合流 (add-impl pairing)"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
entry_signals:
  - "po_directive:2026-07-20 修正しなさい、ハードコード禁止の原則で外部化するように"
drive: agent
status: confirmed
created: 2026-07-20
updated: 2026-07-20
owner: Claude / TL
forward_routing: L5
promotion_strategy: reuse-with-hardening
pair_artifact: docs/test-design/harness/L8-requirements-doc-registry.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "要件正本パスの参照方法を変えるだけで、要件内容自体は変更しない。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/architecture.md
    reason: "block 境界の変更なし。lint 内部の参照解決だけを変える。"
  - layer: L6-function-design
    decision: impacted
    evidence_path: docs/design/harness/L6-function-design/requirements-doc-registry.md
    reason: "loader contract (U-RDOCREG-001) を L6 機能設計として逆生成した。"
agent_slots:
  - role: tl
    slot_label: "TL — 実装から逆生成した loader contract の設計整合レビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-461-requirements-doc-registry.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/requirements-doc-registry.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-requirements-doc-registry.md
    artifact_type: test_design
  - artifact_path: docs/governance/requirements-doc-registry.json
    artifact_type: config
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-461-requirements-doc-registry.md
  requires: []
  references:
    - docs/plans/PLAN-L7-461-requirements-doc-registry.md
  blocks: []
review_evidence: []
---

# PLAN-REVERSE-461: requirements-doc-registry 外部化の Reverse 合流

## §0 位置づけ

`PLAN-L7-461` (kind=add-impl) の必須 Reverse pairing。PO 指示「ハードコード禁止で外部化」により先行した
実装事実 (registry + loader + 6 consumer 移行) から、L6 機能設計
`docs/design/harness/L6-function-design/requirements-doc-registry.md` (loader contract、責務境界、
canonical/compatibility 二役、digest pin 台帳の除外判断) を逆生成し、Forward (L5 詳細設計層経由) へ合流する。

## R0-R4

- R0 evidence: `src/lint/requirements-doc-registry.ts` / `docs/governance/requirements-doc-registry.json` /
  consumer 6 module の diff、`tests/requirements-doc-registry.test.ts` green。
- R1 observed contract: `loadRequirementsDocRegistry(repoRoot?) => RequirementsDocRegistryV1`、fail-close
  (欠落・schema 不正・非 .md パスで throw)。
- R2 as-is design: L6 doc §1 公開 contract / §2 責務境界に転記済み。
- R3 intent: 正本切替を registry 1 ファイルに集約し、prose 面 (Read Order) と機械強制面 (lint anchor) の
  乖離 (memory key=`lint-gates-still-anchor-v1-2`) を構造的に再発不能にする。
- R4 routing: 追加変更なし。`PLAN-L7-461` の pair-freeze (L6↔L8) へ合流し、Forward 再entry は不要。

## §6 用語更新 (§G.9)

- 新規語なし (「requirements-doc-registry」は PLAN-L7-461 §6 で登録済み)。
