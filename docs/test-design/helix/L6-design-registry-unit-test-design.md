---
title: "Design Registry L7単体テスト設計（L6 pair）"
layer: L6
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: QA
pair_artifact: docs/design/helix/L6-function-design/design-registry.md
github_issue_id: 177
---

# Design Registry L7単体テスト設計（L6 pair）

L6機能設計 `docs/design/helix/L6-function-design/design-registry.md` §0-§2 の型・signature・DbC を
正本とする。実装スライス起票時に L8 で具体化する（test citation は実装 PLAN が確定する）。

| U-ID | 対象 | 反例と期待結果 |
|---|---|---|
| U-DRG-001 | `canonicalizeRegistryDeclaration` | kind 別 ID regex 逸脱・file path/class 名主キー・kind と prefix の不一致を `DRG_ID_INVALID` で拒否。順序違いの同義入力は同 semantic_digest |
| U-DRG-002 | `validateRegistryGraph` | 重複 entity_id は `DRG_DUPLICATE_ID`、片端が実在しない edge は `DRG_EDGE_ORPHAN`、adjacency 表（service_role 直列 2 段を含む）に無い kind×relation 組は fail-close、permission を経ない invokes 到達は `DRG_UNGUARDED_INVOKE` |
| U-DRG-003 | `computeTraceClosure` | chain の 1 edge 欠落で `DRG_CHAIN_ORPHAN` として orphan 全列挙、全 edge 完備で closed。stale entity を含む chain は closed に算入しない |
| U-DRG-004 | `validateParentGraph` | SCR/FLW/INT の 1 ノードから user_task/business_outcome への parents edge を欠落、または user_task 原子から scenario/context/success_result/decision_rationale のいずれかを欠落させると `DRG_PARENT_LOST`（過剰原子化の拒否、HR-FR-DHR-006 の 6 原子被覆） |
| U-DRG-005 | `queryTrace` | 起点 entity から双方向 trace が決定的同値。stale/retired を含む path は stale mark つき |
| U-DRG-006 | `buildRegistryCommit` → `commitRegistry` | append 順改変・write_set/operation digest 改変・期待 head CAS 不一致・二重 operation は増分 0、正常系は atomic commit で head 前進 |
| U-DRG-007 | `markStaleLineage` | 上流 digest 差の entity と依存 edge が同一 lineage で stale 化、同一入力再送は増分 0 の決定的同値 |
