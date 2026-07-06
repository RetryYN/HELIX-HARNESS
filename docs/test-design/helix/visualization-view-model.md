---
layer: L6
sub_doc: test-design
status: confirmed
freeze_blocking: false
pair_artifact: docs/design/helix/L6-function-design/visualization-view-model.md
plan: docs/plans/PLAN-L6-58-visualization-view-model.md
---

# 可視化 view-model — L6 テスト設計（pair）

pair 正本 = `docs/design/helix/L6-function-design/visualization-view-model.md`。

## 検証観点（宣言済み oracle。`tests/visualization-view-model.test.ts` で cover 済み）

1. **純関数性** → `U-VVM-001`: 同一 snapshot 入力 → view-model deep equal（副作用・DB 再クエリ・
   現在時刻依存なし。入力 snapshot が呼び出し後も不変であることも確認）。
2. **count 一致** → `U-VVM-002`（層別 count 一致）/ `U-VVM-005`（runtime evidence の verification
   class 分離が非昇格であることを含む）: 各 view の描画 count が snapshot の対応 field と一致し、
   乖離は warnings/error へ分離（成功へ混ぜない）。design/test pair のフィルタ済み count は現行
   snapshot が生 pair 種別を持たないため `null`（0 捏造しない）。
3. **graph IR** → `U-VVM-003`: Mermaid 互換 IR (`buildGraphIr`) が deterministic に生成され、
   node/edge 数一致・cycle 標識を持つ。Relation view は現行 snapshot が生 node/edge リストを
   持たないため IR は空で honest degrade し、`shared_warnings` で明示する。
4. **空状態** → `U-VVM-004`: 空 snapshot で全 view 0 表示 + 共有 banner（既存 warnings を保持した
   まま graph/evidence/skill 系 banner を追記、捏造値なし）。
5. **growth 時系列** → `U-VVM-006`（HAC-VIS-07）: 履歴の無い期間は補間せず「記録なし」を明示し
   （空 `growth_series` + warning）、current 値は snapshot から再現可能。
6. **drill-down** → `U-VVM-007`（HAC-VIS-06、全 view 対象）: 各 row から `drilldowns` pointer への
   deterministic 経路。pointer が無い row は `drilldown: null` を明示し、絶対 path・LLM 要約を
   根拠にしない。

acceptance の親 trace は HAT-VIS 系（`docs/test-design/helix/L3-pillar-acceptance-test-design.md`）。
