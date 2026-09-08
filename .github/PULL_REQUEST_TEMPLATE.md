## 概要

## 関連 PLAN / Issue
Closes #

## 原子契約scope

記入規則: 6項目は1行1項目の`Field: value`形式で、値は同じ行に置く。複数値はカンマで区切り、値をbacktickで囲まない。
`Required companion paths`は不要なら`none`、`Scope expansion`は通常`none`とする。CIの受理範囲はこの表記規則を含めて厳密に検査する。

Behavior contract: <!-- 1件だけ。例 GH-AC-040 -->
Responsibility owner: <!-- kebab-caseで1責務 -->
Allowed path families: <!-- exact pathまたはdirectory prefixをcomma区切り。prefixの責務粒度はAI-Bが確認 -->
Expected changed paths: <!-- base..head diffに含める全exact pathをcomma区切り。追加時は一覧とScope expansionを更新 -->
Required companion paths: <!-- diffに含むPLAN/testのexact path。不要ならnone -->
Scope expansion: none <!-- または approved receipt=https://github.com/OWNER/REPO/pull/N#issuecomment-N reason=12文字以上 -->

## Workflow identity contract

Issue 本文と同じ marker／JSON を置く。`signal_tokens` は `target_id` と catalog 上で一致させる。
branch prefix と PLAN `kind` も下表に揃える（不一致は fail-close。branch rename は PR 番号変更や再作成を伴いうる）。

<!-- HELIX:github-workflow-identity-contract:v1 -->
```json
{"schema_version":"helix-github-workflow-identity-contract.v1","registry_version":"1.1.6","registry_source_digest":"sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89","target_axis":"workflow_model","target_id":"REFACTOR","signal_tokens":["structural"]}
```

| target_id | example signal_tokens | branch prefix | PLAN kind |
|---|---|---|---|
| REFACTOR | structural, debt_degradation, code_smell | refactor/ | refactor \| retrofit |
| RETROFIT | dependency_outdated, upgrade, config_drift | retrofit/ | retrofit |
| RECOVERY | regression_dev, forced_stop, agent_runaway | recovery/ | recovery |
| INCIDENT | production_incident, hotfix_required, regression_prod | hotfix/ | recovery \| troubleshoot |
| ADD_FEATURE | feature_addition, scope_extension | feature/ または add/ | impl \| add-design \| add-impl |
| REVERSE | drift | reverse/ | reverse |
| VERSION_UP | version_deferral | version-up/ | design \| impl \| add-* \| refactor \| retrofit \| research \| reverse \| recovery \| troubleshoot \| poc |
| RESEARCH | tech_decision_required, option_comparison_needed, adr_required | research/ | research |
| DISCOVERY_POC | requirement_undefined, feasibility_unknown | poc/ | poc |

## V-model artifact (該当に ✓)
- [ ] ① 設計 (docs/design/)
- [ ] ② 実装 (src/)
- [ ] ③ テスト設計 (docs/test-design/)
- [ ] ④ テストコード (tests/)

## 検証
- [ ] typecheck pass
- [ ] 全回帰 pass
- [ ] review 前置 通過 (frontier-reviewer / intra_runtime_subagent)
