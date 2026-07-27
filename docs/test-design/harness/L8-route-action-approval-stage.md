---
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
status: draft
pair_artifact: docs/design/harness/L6-function-design/route-action-approval-stage.md
plan: docs/plans/PLAN-L6-82-route-action-approval-stage.md
---

# route action承認stage単体テスト設計

| U-ID | 反例／操作 | 期待結果 |
|---|---|---|
| U-RAAS-001 | Recoveryの7 stageを順に評価 | read-only 5 stageはgreen、scope/applyはpolicyなしでred |
| U-RAAS-002 | Incidentの診断とproduction restore apply | 診断green、apply red |
| U-RAAS-003 | Retrofit config driftのdry-runとapply | dry-run green、apply red |
| U-RAAS-004 | credential/productionを含む診断 | boundaryは保持するが診断を止めない |
| U-RAAS-005 | 同じhigh-impact入力をscope/applyへ変更 | escalation policyなしではred |
| U-RAAS-006 | 必須approverを満たすapply | approval receiptを認識してgreen |
| U-RAAS-007 | stage省略 | `route_selection`として後方互換入力を受理 |
| U-RAAS-008 | 未知`--action-stage` | command実行前にexit 2 |

mutation oracleは「全stageをapproval必須へ戻す」「applyも承認不要にする」「boundary検出を消す」
「省略時をapplyにする」の各変異を個別にkillする。

実装testは`tests/workflow-contracts.test.ts`と`tests/route-action-approval-cli.test.ts`とする。
