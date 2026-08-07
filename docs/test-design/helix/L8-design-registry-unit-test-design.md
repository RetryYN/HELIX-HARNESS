---
title: "Design Registry 単体テスト設計（L8実行正本）"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L6-function-design/design-registry.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "PLAN-L7-516 以降（#177）の実装スライス群が共有する L8 具体化正本。canonical な pair chain（L6 design ↔ L6-design-registry-unit-test-design.md）が pair_artifact slot を専有しているため、本 doc は L6 設計への cross-layer 補助 binding として module 単位 1 件だけ pair-freeze 対象外とする（#175 の L8 共有正本と同型、PLAN 毎の exemption 増殖はしない）"
github_issue_id: 177
---

# Design Registry 単体テスト設計（L8実行正本）

L6機能設計 `docs/design/helix/L6-function-design/design-registry.md` §0-§2 と
L6単体テスト設計 `docs/test-design/helix/L6-design-registry-unit-test-design.md` の
U-DRG 行を L8 で具体化する。test citation は各実装 PLAN が確定する。
スライス構成は L6 §3（純関数群 → 取引系 → 永続化 → CLI/lint 表面）に従い、
本書には着地済みスライスの oracle 行のみを登録する（未着地 oracle の先行登録はしない）。

## スライス1（PLAN-L7-516: 純関数群）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-001 | `canonicalizeRegistryDeclaration` | kind 別 ID regex 逸脱（prefix 不一致・大文字混入・path 主キー `src/x.ts`・class 名 `FooBar`）を `DRG_ID_INVALID` で fail-close。順序違い同義入力の semantic_digest 同値、同一要素 dedup。regex 判定・digest 正規化のいずれを外す mutation も red で kill する | `tests/design-registry-canonicalize.test.ts` |
| U-DRG-002 | `validateRegistryGraph` | 重複 entity_id=`DRG_DUPLICATE_ID`、片端欠落 edge=`DRG_EDGE_ORPHAN`、adjacency 表外の kind×relation=`DRG_RELATION_INVALID`、permission を経ない invokes（interaction→command 直結・段飛ばし）=`DRG_UNGUARDED_INVOKE`。判定分岐のいずれを外す mutation も該当 fixture が red で kill する | `tests/design-registry-graph.test.ts` |
| U-DRG-003 | `computeTraceClosure` | 完備 chain（requirement→screen→interaction→permission→command→api→domain_object→analytics_event→acceptance）は closed。1 edge 欠落で `DRG_CHAIN_ORPHAN` として break 点を全列挙し、stale entity を含む chain は closed へ算入しない。orphan 列挙・stale 遮断のいずれを外す mutation も red で kill する | `tests/design-registry-closure.test.ts` |
| U-DRG-004 | `validateParentGraph` | SCR/FLW/INT から user_task / business_outcome いずれかへの parents 到達欠落、user_task 原子の 4 原子（scenario/context/success_result/decision_rationale）欠落は `DRG_PARENT_LOST`（HR-FR-DHR-006 の 6 原子被覆）。到達判定・4 原子判定のいずれを外す mutation も red で kill する | `tests/design-registry-parents.test.ts` |
| U-DRG-005 | `queryTrace` | 起点からの双方向 trace が決定的同値（2 回実行で deep-equal）。stale/retired を経由する到達は stale mark つきで返り、未知 entity_id は `DRG_ID_INVALID`。方向・stale mark・決定性のいずれを壊す mutation も red で kill する | `tests/design-registry-trace.test.ts` |

## 後続スライス（未登録）

取引系（U-DRG-006）・stale 遷移（U-DRG-007）・SQLite store・CLI/lint 表面の oracle 行は
各実装 PLAN の起票時に本書へ追記する。
