---
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/route-action-approval-stage.md
plan: docs/plans/PLAN-L6-82-route-action-approval-stage.md
---

# route action承認stage単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RAAS-001 | Recovery stage | read-only 5 stageはgreen、scope/applyはpolicyなしでred | `tests/workflow-contracts.test.ts` |
| U-RAAS-002 | Incident stage | 診断はgreen、production restore applyはred | `tests/workflow-contracts.test.ts` |
| U-RAAS-003 | Retrofit stage | config driftのdry-runはgreen、applyはred | `tests/workflow-contracts.test.ts` |
| U-RAAS-004 | escalation evidence | credential/production boundaryを保持しながら診断を継続する | `tests/workflow-contracts.test.ts` |
| U-RAAS-005 | high-impact apply | escalation policyなしで拒否する | `tests/workflow-contracts.test.ts` |
| U-RAAS-006 | approval receipt | 必須approverを満たすapplyだけgreenにする | `tests/workflow-contracts.test.ts` |
| U-RAAS-007 | default stage | stage省略を`route_selection`として後方互換受理する | `tests/workflow-contracts.test.ts` |
| U-RAAS-008 | CLI stage input | 未知`--action-stage`をcommand実行前にexit 2で拒否する | `tests/route-action-approval-cli.test.ts` |

mutation oracleは「全stageをapproval必須へ戻す」「applyも承認不要にする」「boundary検出を消す」
「省略時をapplyにする」の各変異を個別にkillする。

実装testは`tests/workflow-contracts.test.ts`と`tests/route-action-approval-cli.test.ts`とする。
