---
name: Add-feature
about: 機能追加（typed: `development_style`／`PLAN kind`／`L1-L12`）
labels: feature
---

## HELIX Issue 階層契約

```yaml
issue_role: task
parent_issue: null
blocks: []
blocked_by: []
duplicate_search: completed
disposition: active
duplicate_of: null
```

<!-- root以外はparent_issue必須。同一findingがあれば新規起票せず既存Issueへ証拠を追記する。 -->

## Workflow identity contract

起票時に必須。PR／PLAN の `target_id`・`signal_tokens`・branch prefix・PLAN `kind` と揃える。
marker 欠落は `issue_workflow_identity_contract_missing` で fail-close する。

<!-- HELIX:github-workflow-identity-contract:v1 -->
```json
{"schema_version":"helix-github-workflow-identity-contract.v1","registry_version":"1.1.6","registry_source_digest":"sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89","target_axis":"workflow_model","target_id":"ADD_FEATURE","signal_tokens":["feature_addition"]}
```

| target_id | example signal_tokens | branch prefix | PLAN kind |
|---|---|---|---|
| ADD_FEATURE | feature_addition, scope_extension | feature/ または add/ | impl \| add-design \| add-impl |
| REFACTOR | structural, debt_degradation, code_smell | refactor/ | refactor \| retrofit |
| RECOVERY | regression_dev, forced_stop, agent_runaway | recovery/ | recovery |
| RETROFIT | dependency_outdated, upgrade, config_drift | retrofit/ | retrofit |
| REVERSE | drift | reverse/ | reverse |
| VERSION_UP | version_deferral | version-up/ | design \| impl \| add-* \| refactor \| retrofit \| … |
| RESEARCH | tech_decision_required, adr_required | research/ | research |
| DISCOVERY_POC | requirement_undefined, feasibility_unknown | poc/ | poc |
| INCIDENT | production_incident, hotfix_required | hotfix/ | recovery \| troubleshoot |

## 追加する機能 (一言)

## specialist drive（専門職drive: `specialist_drive` = be / fe / fullstack / db / agent）

## 受け入れ条件 (AC 候補)

## 上位整合 (Reverse back-fill 先: L3 要件 / 既存 FR 拡張 or 新 FR)
