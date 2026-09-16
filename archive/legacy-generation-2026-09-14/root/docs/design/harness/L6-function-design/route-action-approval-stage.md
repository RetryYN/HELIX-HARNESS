---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-route-action-approval-stage.md
plan: docs/plans/PLAN-L6-82-route-action-approval-stage.md
---

# route action承認stage機能設計

## 1. 目的

routeの推薦・診断と、外部状態を変えるactionの承認を分離する。Recovery、Incident、
Retrofitへ入っただけで診断を止めず、production・security・data loss等のaction境界は弱めない。

## 2. 公開契約

`evaluateRouteCommand`は`action_stage`と任意の`action`を受ける。

`evaluateRouteCommand(signal, action_stage, action, approval_policy) => RouteCommandEvaluation`

| DbC | 契約 |
|---|---|
| pre | `signal`は既存route classifierが受理する文字列、`action_stage`は7値のいずれかまたは省略である |
| post | 推薦結果は評価したstage/actionを保持し、承認要否をstage境界から導出する |
| invariant | `auto_apply=false`、route分類、approval policy、escalation evidenceを弱めない |
| oracle | `U-RAAS-001`〜`U-RAAS-008`がread-only継続とaction fail-closeを反証する |

| stage | 意味 | 既定の承認 |
|---|---|---|
| `route_selection` | signalからrouteとcommand候補を選ぶ | 不要 |
| `diagnosis` | read-only診断 | 不要 |
| `evidence_collection` | receipt作成前の証拠収集 | 不要 |
| `plan` | repair/restore/移行案の作成 | 不要 |
| `dry_run` | writeを行わないrehearsal | 不要 |
| `scope_decision` | repair scope、reopen point、高影響scopeの確定 | 必要 |
| `apply` | production restore、hotfix、repair、config drift適用 | 必要 |

`action_stage`省略時は`route_selection`とする。これは既存call shapeを受理したまま、
route推薦をaction承認へ誤昇格させないための既定値である。

## 3. mode別不変条件

- Recovery: `route_selection`から`dry_run`までは自律。`scope_decision`と`apply`は承認必須。
- Incident: 検知、診断、証拠、planは自律。`apply`だけ承認必須。
- Retrofit: inventory、impact、dry-runは自律。`config_drift`の`apply`は承認必須。
- escalation boundaryは常に検出・表示するが、`scope_decision`または`apply`でだけ承認を要求する。
- approvalが必要なstageではpolicy不足・approver不足を従来どおりfail-closeする。
- `recommended_command.safety.auto_apply`は常にfalseとし、stage追加を自動実行権限にしない。

## 4. 失敗契約

未知stageはCLIでexit 2、承認対象stageのpolicy不足はexit 1、read-only stageは証拠収集を継続する。
route config不正、legacy command、未知routeの既存failure contractは変更しない。

## 5. 検証oracle

| oracle | 契約 |
|---|---|
| `U-RAAS-001` | Recoveryのread-onlyとscope/applyを分離する |
| `U-RAAS-002` | Incidentの診断とproduction applyを分離する |
| `U-RAAS-003` | Retrofit config driftのdry-runとapplyを分離する |
| `U-RAAS-004` | high-impact boundaryをread-onlyでも検出・表示する |
| `U-RAAS-005` | high-impact scope/applyをpolicyなしでfail-closeする |
| `U-RAAS-006` | 必須approverが揃ったapplyだけgreenにする |
| `U-RAAS-007` | stage省略を`route_selection`として受理する |
| `U-RAAS-008` | CLIのstage/action投影と未知stage拒否を検証する |
