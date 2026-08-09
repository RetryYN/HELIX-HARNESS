# Issue #489 クロージャ記録 — merge 前 cross-review admission

## 概要

Issue #489（merge 前 same-HEAD cross-review receipt の required admission 接続）を正式に
close する記録。PR #494で、current PR exact HEAD、required CI、独立review receipt、
論理DB convergence、GitHub comment時刻を同じsnapshotへ束縛し、Ready PRのrequired
`harness-check`からfail-closeする経路を実装した。

## 実装・検証証拠

| 項目 | 証拠 |
|---|---|
| 実装PR | #494 |
| behavior contract | `GITHUB-CROSS-REVIEW-ADMISSION-001` |
| responsibility owner | `github-cross-review-admission` |
| candidate HEAD | `3430ecf7e9514f24f523e78572a49c2494ebabc8` |
| candidate tree | `da2df14401db882e0a35a17504ef79e9e1220a8d` |
| Draft全回帰CI | run `31317251945`、success |
| Ready受入CI | run `31318880069`、success |
| Claude exact-HEAD review | https://github.com/RetryYN/HELIX-HARNESS/pull/494#issuecomment-5232013927 |
| review receipt digest | `sha256:68eacf50a3f9ded4a47dad2699bc33cd29163d8539acd069613a32ed5e67c6ce` |
| reviewコメント本文digest | `sha256:b455af8c7241f432edf2818833c5265887e9368a062aa7401acfac5c472e769f` |
| merge commit | `5d28912d55ca8f8461bcf5a838f0be29756d5a5c` |
| base parent | `a293558ec8033bcfacc73f537db11b9e13607527` |
| post-merge receipt | `sha256:d22df95db6844f1c106f38fc4280eaeb79d72a7559af0271e59a90a4df76793e` |

Claude reviewはCritical／High／Medium blocker 0で、receipt fileとGitHub sealed commentを
read-afterした。receipt fileはmode 0600、内部digestはcanonical payloadからの再計算値と一致する。
DB projection／replay projectionおよびcheckpoint／replay checkpointもそれぞれ一致し、
`converged=true`である。

## merge後read-after

`helix github pr-merge-reviewed`はcandidate HEADを固定して明示mergeし、GitHubからmerge commit、
tree、parents、PR stateを再取得した。merge treeはcandidate treeと一致し、parentsはbase parentと
candidate HEADのexact set、observed stateは`MERGED`、outcomeは`verified`、reasonsは0件だった。

post-merge receipt v1はGit共通runtimeへwrite-once保存されたlocal evidenceである。現行の
`helix-issue-completion-receipt.v1`はこのlocal receiptをGitHubから機械joinしないため、
本Issueのcompletion receiptへextra fieldとして混在させていない。GitHub公開とclosure graph
v2 joinはsuccessor #501／#500が所有する。

## Kimiフォールバック受入

PR #494のreview receiptをbootstrap verifierとして、Kimi S4 admission v2を発行した。
benchは5/5 case green、6/6 mutation killed、lane closure digestは
`sha256:a11808d9036baeacc70332831740bae4d4099b03af6db837d6c0744ace7932aa`、
admission receipt digestは
`sha256:dfebc549dd281cb6b308381e902c1af31f6024cdc77ef3fab1ab7ac0b7a31f6d`である。
receiptはmode 0600でread-afterし、low／medium riskだけを許可する。Claudeがhealthyな場合に
Kimiを強制せず、typed quota／unavailable時だけfallbackする境界は維持する。

## fail-close境界

- review receipt欠落、stale HEAD、別PR／repository、重複・競合receiptを拒否する。
- required workflow identity、PR number、candidate HEAD、CI完了時刻を照合する。
- Kimi receiptはadmission、lane closure、independent verifier comment、DB receiptをsealする。
- Ready化後のrequired CIが同じ判定coreを実行し、PLAN内自己申告だけではadmitしない。
- merge後はcandidate／merge treeとparentをread-afterし、不一致を`merged_unverified`として残す。

## successor

- #500はpost-merge receiptをIssue closure graphへ機械joinするconsumer側更新を所有する。
- #501はreviewed merge receipt v2とsealed GitHub publicationを所有する。
- 両Issueは本Issueのcompletionを妨げないparked successorであり、現在openである。

## Issue closure graph 契約

```json
{"schema_version":"helix-issue-closure-graph.v1","canonical_contracts":[{"contract_id":"GITHUB-CROSS-REVIEW-ADMISSION-001","owner_issue":489}],"child_issues":[],"successor_issues":[{"number":500,"expected_state":"open"},{"number":501,"expected_state":"open"}]}
```
