---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-60-specific-parent-design-binding.md
---

> **L6 contract marker**: `analyzeSpecificParentDesignBinding(docs, parentDocs, baseline) => SpecificParentDesignBindingResult` は
> 単体テスト粒度の contract。pre: 対象は `kind=impl/add-impl` の PLAN。post: L7 PLAN が汎用 parent design だけで
> 新機能・新 capability の設計判断を保持する場合、baseline 外では ok=false。invariant: L7 は実装/テスト slice であり、
> 採用候補の要件・境界・契約は L3-L6 の design/add-design PLAN へ降下させる。

# plan-descent specific parent binding — 機能設計

## §1 範囲

`PLAN-L6-54-plan-descent-gate` / `PLAN-L7-347-plan-descent-gate-impl` は、L7 PLAN に L6 parent design と
L8 単体テスト設計 pair を要求する。しかし今回の外部 agent catalog 監査で、`docs/design/helix/L6-function-design/pillar-function-design.md`
のような汎用 L6 doc を親にして、実質的には新 capability の採用判断・境界・受入条件を L7 PLAN 本文へ置く経路が残った。

これは V-model の左腕を使わず、L7 を設計棚卸し doc として使う穴である。本設計はこの穴を追加 gate として塞ぐ。

## §2 Contract

対象は `kind=impl` / `kind=add-impl` の L7 PLAN。以下を検査する。

| item | contract |
|---|---|
| 汎用親 design 検出 | `parent_design` が `pillar-function-design.md`、`orchestration-memory.md`、その他 hub / umbrella / master / generic catalog と判定される場合、機能固有親ではない。 |
| feature binding | L7 PLAN は `parent_design` だけでなく、機能固有の L3-L6 design/add-design PLAN または design doc を `dependencies.requires` に持つ。draft の採用候補同士は `requires` ではなく `references` に置く。 |
| design debt route | 外部 source 監査などで採用候補だけを棚卸しする場合は、L7 impl PLAN として実装 ready を名乗らず、`research` / `add-design` / audit finding / backlog のいずれかへ置く。L7 に残す場合は `forward_descent_debt` を明示し、実装着手前に L3-L6 降下 PLAN を要求する。 |
| generates substance | L7 impl PLAN の `generates` は将来 test file 名だけでなく、実装対象 source/module または command surface を少なくとも 1 件持つ。採用候補棚卸しだけなら L7 impl ではない。 |
| test design layer | L7 impl PLAN の単体テスト設計 pair は L8 とする。結合テスト設計は L9 に置き、L7 起票 gate の unit pair と混同しない。 |

## §3 判定 reason

- `generic_parent_design`: parent design が汎用 hub で、機能固有 contract へ bound されていない。
- `design_decision_in_l7`: 目的・スコープ・受入条件が新 capability の要件/契約を定義しているのに、L3-L6 design PLAN が無い。
- `missing_source_generate`: L7 impl PLAN の `generates` が markdown/test_code だけで、実装 surface が無い。
- `missing_forward_descent_debt_record`: 採用候補棚卸しを L7 に一時置きする理由・降下先・実装禁止条件が無い。

## §4 テスト oracle

将来の `tests/plan-descent-specific-parent-binding.test.ts` で被覆する:

| ID | oracle |
|---|---|
| U-PSPB-001 | 汎用 parent design + source/test 実装 generate あり + 機能固有 requires あり → ok |
| U-PSPB-002 | 汎用 parent design + L7 本文で新 capability 契約を定義 + 機能固有 design なし → `design_decision_in_l7` |
| U-PSPB-003 | L7 impl PLAN の generates が markdown_doc と test_code のみ → `missing_source_generate` |
| U-PSPB-004 | 外部 catalog 採用候補を L7 に一時置きし、`forward_descent_debt` と降下先 PLAN がある → advisory only |
| U-PSPB-005 | 機能固有 L6 design doc を parent に持ち、source/test surface が明示される通常 L7 impl → ok |
