---
layer: L8
artifact_type: test_design
status: draft
plan: docs/plans/PLAN-L7-1574-cli-summary-fixture.md
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/design/harness/L6-function-design/function-spec.md
---

# statusのレビュー必要証拠表示

既存L6 `judgmentReviewPlanForMode` のstatus投影を検証する。レビュー方式・承認要否の新定義ではない。
current-locationのU-CLSOとは別契約として、全CLI回帰で修正したoracleの所有を明示する。

| U-ID | 対象 | 検証内容 | test citation |
| --- | --- | --- | --- |
| U-JRSTAT-001 | status JSON/textのレビュー証拠投影 | human・cross_agent・intra_runtime_subagentを区別し、単一runtimeでは既存4項目のchecklist説明をexact照合する。textにJSONの必要証拠と各IDが全件現れることを検査する | `tests/cli-surface.test.ts` |

この試験は実行環境で選択された方式の表示を検査する。3方式すべてを固定fixtureで実行した証拠とは数えない。
各方式の判定自体は既存 `tests/gate-review-tier.test.ts` の単体検証と分担する。
textとJSONの全件一致だけで両方の同時誤りを否定せず、単一runtimeの4項目literalを保持する。
旧L14等を含む既存fixtureは履歴互換入力であり、新しい層authorityへ昇格しない。
