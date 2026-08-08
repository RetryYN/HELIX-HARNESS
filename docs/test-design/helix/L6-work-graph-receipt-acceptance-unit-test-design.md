---
title: "work graph と三段 receipt 検収 L6関数テスト設計"
layer: L6
artifact_type: test_design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
plan: docs/plans/PLAN-L7-525-work-graph-receipt-acceptance.md
pair_artifact: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md
related_l5: docs/design/helix/L5-detail/work-graph-receipt-acceptance.md
github_issue_id: 213
behavior_contract_id: WORK-GRAPH-RECEIPT-ACCEPTANCE-001
responsibility_owner: work-graph-receipt-acceptance
---

# work graph と三段 receipt 検収 L6関数テスト設計

L6 の関数分割ごとに、どの oracle が単体粒度の到達証拠を担うかを束縛する。oracle 本体の定義は
L5 pair の `docs/test-design/helix/L8-work-graph-receipt-acceptance-unit-test-design.md`（U-WGR-001..045）にあり、
本書は関数単位の割り付けと mutation 要件だけを固定する。

| 関数 | 束縛する oracle | mutation 要件 |
|---|---|---|
| `acquireWorkGraphLease` | U-WGR-020..022, U-WGR-026 | fence token の値一致判定を除去した mutant は Red |
| `releaseWorkGraphLease` | U-WGR-023, U-WGR-024 | terminal seal 前の解放を許す mutant は Red |
| `evaluateDelegationRequestOrdering` | U-WGR-001..018, U-WGR-025, U-WGR-027, U-WGR-042..044 | dependency 判定・exact set 判定・scope 判定・CAS 判定・先書き判定をそれぞれ除去した mutant は Red |
| `evaluateParentAcceptanceOrdering` | U-WGR-019, U-WGR-028..030, U-WGR-034..041, U-WGR-045 | seal 判定・前段束縛・同一 HEAD 判定・verdict 判定・自己 acceptance 判定をそれぞれ除去した mutant は Red |
| 既存 receipt との接続点 | U-WGR-031..033 | worker と reviewer の identity／session／context 分離を 1 軸ずつ崩した入力が既存 failure code を返す |

mutation 要件は `tests/tools/work-graph-mutation/run-mutation.ts` が source mutant を実生成して機械検証する。
survived が 1 件でもあれば exit 1 とし、分岐網羅を prose 主張のまま通さない。
