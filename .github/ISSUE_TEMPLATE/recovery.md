---
name: Recovery
about: AI 逸脱・暴走・強制停止からの復旧（typed: `workflow_model=RECOVERY`／`recovery signal`／`L1-L12`）
labels: bug
---

## HELIX Issue 階層契約

```yaml
issue_role: finding
parent_issue: null
blocks: []
blocked_by: []
duplicate_search: completed
disposition: active
duplicate_of: null
```

<!-- root以外はparent_issue必須。同一findingがあれば新規起票せず既存Issueへ証拠を追記する。 -->

## Workflow identity契約

起票時に必須。PR／PLANの`target_id`・`signal_tokens`・branch接頭辞・PLAN `kind`と揃える。
marker欠落は`issue_workflow_identity_contract_missing`でfail-closeする。

<!-- HELIX:github-workflow-identity-contract:v1 -->
```json
{"schema_version":"helix-github-workflow-identity-contract.v1","registry_version":"1.1.6","registry_source_digest":"sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89","target_axis":"workflow_model","target_id":"RECOVERY","signal_tokens":["regression_dev"]}
```

| workflow | `signal_tokens`の例 | branch接頭辞 | PLAN `kind` |
|---|---|---|---|
| 復旧`RECOVERY` | `regression_dev`, `forced_stop`, `agent_runaway`, `runaway`, `context_exhaustion` | `recovery/` | `recovery` |
| 障害`INCIDENT` | `production_incident`, `hotfix_required`, `regression_prod` | `hotfix/` | `recovery` \| `troubleshoot` |
| 構造整理`REFACTOR` | `structural`, `debt_degradation`, `code_smell` | `refactor/` | `refactor` \| `retrofit` |
| 追従`RETROFIT` | `dependency_outdated`, `upgrade`, `config_drift` | `retrofit/` | `retrofit` |
| 要求追加`ADD_FEATURE` | `feature_addition`, `scope_extension` | `feature/`または`add/` | `impl` \| `add-design` \| `add-impl` |
| 逆工程`REVERSE` | `drift` | `reverse/` | `reverse` |

## 発生事象 (signal)
<!-- forced_stop / agent_runaway / premise_gap など。何が起きたか -->

## root cause (なぜ起きたか)

## 復旧手順 / 再開ポイント

## 再発防止 (出口契約 MUST)
<!-- 仕組み化: guard / test / rule / hook をファイル粒度で trace。prose 止まり禁止 -->

## catalog route / capability（route／capability分類）
