---
layer: L6
sub_doc: test-design
status: draft
freeze_blocking: false
pair_artifact: docs/design/helix/L6-function-design/visualization-view-model.md
plan: docs/plans/PLAN-L6-58-visualization-view-model.md
---

# 可視化 view-model — L6 テスト設計（pair）

pair 正本 = `docs/design/helix/L6-function-design/visualization-view-model.md`。

## 検証観点（予定 oracle。実装 slice（L7）で `tests/visualization-view-model.test.ts` 新設と
同時に oracle ID を宣言する — 宣言 oracle は test citation 必須の gate に従う）

1. **純関数性**: 同一 snapshot 入力 → view-model deep equal（副作用・DB 再クエリ・
   現在時刻依存なし）。
2. **count 一致**: 各 view の描画 count が snapshot の対応 field と一致し、乖離は
   warnings/error へ分離（成功へ混ぜない）。
3. **graph IR**: Mermaid 互換 IR が deterministic に生成され、node/edge 数一致・cycle 標識を持つ。
4. **空状態**: 空 snapshot で全 view 0 表示 + 共有 banner（捏造値なし）。
5. **growth 時系列**（予定 oracle 6 / HAC-VIS-07）: 履歴の無い期間は補間せず「記録なし」を明示
   （HAT-VIS-07 の L6 具体化）。
6. **drill-down**（予定 oracle 7 / HAC-VIS-06、全 view 対象）: 各 row から `drilldowns` pointer への
   deterministic 経路。pointer が無い row は `drilldown: null` を明示し、絶対 path・LLM 要約を根拠にしない。

acceptance の親 trace は HAT-VIS 系（`docs/test-design/helix/L3-pillar-acceptance-test-design.md`）。
