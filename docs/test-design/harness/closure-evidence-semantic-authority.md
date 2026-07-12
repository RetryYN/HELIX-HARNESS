---
layer: L8
sub_doc: unit-test-design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md
plan: docs/plans/PLAN-L6-78-closure-evidence-semantic-authority.md
---

# closure証跡semantic authority テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CESA-001 | review非推測 | probe成功だけではreviewer/verdictをmaterializeせずplaceholder block | `tests/closure-evidence-semantic-authority.test.ts` |
| U-CESA-002 | oracle非推測 | generic fast suiteからPLAN固有oracle/case/durationを生成しない | `tests/closure-evidence-semantic-authority.test.ts` |
| U-CESA-003 | runtime非昇格 | test processからruntime accepted candidateを生成しない | `tests/closure-evidence-semantic-authority.test.ts` |
| U-CESA-004 | process receipt | command/時刻/output/session/correlationだけはprobe sourceで決定論的に埋める | `tests/closure-evidence-semantic-authority.test.ts` |
| U-CESA-005 | compensation | apply packetが物理削除rollbackを提示せずappend-only訂正routeを返す | `tests/closure-evidence-semantic-authority.test.ts` |
