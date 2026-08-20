---
title: "workflow分類是正終端fullback監査 単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-20
updated: 2026-08-20
owner: QA / TL
plan: docs/plans/PLAN-REVERSE-694-workflow-classification-terminal-fullback.md
pair_artifact: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "本書は複数の既存Forward sliceを束ねる終端監査のL8契約であり、単一のL6実装設計へpairを再束縛しない。監査契約のconfirmed化時に専用oracleを追加し、暗黙の完了主張を行わない。"
---

# workflow分類是正終端fullback監査 単体テスト設計

本書はIssue #694の既存Forward sliceを再実装せず、各sliceの実測証拠とcurrent-mainの意味一致を
終端監査へ束ねるためのL8設計である。現段階では監査契約を起票しただけで、completion claimを許可しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WFTERM-001 | Forward receipt exactness | merge HEAD、required CI、Claude review、DB convergenceのいずれかが欠けたsliceを未完了として返す | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-002 | current-main read-after | review時HEADまたは旧mainの成功だけでcurrent-main完了を主張したらred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-003 | typed identity chain | requirements／registry／catalog／consumerのversion、digest、axis、IDが不一致ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-004 | legacy boundary | 旧mode、model、15-route identityがcurrent output／DB／generated docsへ戻ったらred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-005 | dependency release | #204、#635、#188のIssue stateがcompletion判定と不一致なら#694を閉じずfail-closeする | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-006 | doctor wiring health | live evidence未接続の空snapshotでもfullback oracleがfail-closeし、doctor wiring healthをgreenにする | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-007 | Issue identity | #694以外のIssueへfullback証拠を束縛したらred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-008 | merge state | mergeされていないForward sliceを終端証拠へ昇格したらred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-009 | Forward HEAD | Forward sliceのHEADが欠落したらred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-010 | CI presence | required CI runが欠落したらred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-011 | CI binding | CI成功とForward HEADが不一致ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-012 | review binding | independent reviewのHEADが不一致ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-013 | Forward DB convergence | Forward DB projection／replayが未収束ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-014 | requirements identity | requirements authorityとregistryが不一致ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-015 | consumer identity | consumerのtyped identityが欠落したらred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-016 | current-main authority | current-main authorityがregistryと不一致ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-017 | current-main DB convergence | current-main DBが未収束ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-018 | legacy boundary | consumer側のlegacy identity再出力をredにする | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-019 | dependency exactness | 依存Issueの重複をexact state setとして受理したらred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-020 | CI conclusion | Forward HEADが一致していてもCI conclusionがsuccess以外ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-021 | checkpoint replay convergence | checkpointとreplayがvalid digestでも不一致ならred | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-022 | registry source digest | registry source digestが不正形式ならrequirements identityをredにする | `tests/workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-023 | live GitHub normalization happy path | PR merge HEAD、required CI、Claude receipt、DB digestを同一HEADへ正規化したlive snapshotを生成する | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-024 | live review absence | GitHub上のClaude receipt欠落をcompletion evidenceへ昇格したらred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-025 | live comment completeness | GitHub commentsのページ切詰めを証拠として採用したらred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-026 | live dependency state | #204／#635／#188の実Issue stateをGitHubから取得し、閉鎖をfail-closeできなければred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-027 | live PR/review HEAD binding | PR HEADとreceipt HEADが不一致ならreview欠落としてred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-028 | live PR/CI HEAD binding | PR HEADとCI HEADが不一致ならred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-029 | live CI conclusion | failure、cancelled、未完了CIをsuccessへ昇格したらred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-030 | live merge state | `merged_at` 欠落のPRをterminal evidenceへ昇格したらred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-031 | live receipt digest | review receipt digestの形式不正を採用したらred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-032 | live DB convergence | DB convergence不成立のreceiptを採用したらred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-033 | live consumer precondition | consumers空のlive snapshotを生成したらfail-close | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-034 | live Forward precondition | forwardSlices空のlive snapshotを生成したらfail-close | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-035 | live receipt HEAD binding | receipt HEADをPR HEADと別値へ固定したらred | `tests/github-workflow-classification-terminal-fullback.test.ts` |
| U-WFTERM-036 | live Issue state validation | `open`／`closed`以外のIssue stateをopenへ推測したらred | `tests/github-workflow-classification-terminal-fullback.test.ts` |

U-WFTERM-027〜036はlive adapterのnegative fixtureである。`npx --no-install tsx
tests/tools/github-workflow-classification-terminal-fullback-mutation/run-mutation.ts`で各判定の
kill結果を実測し、total=9、killed=9、survived=0、pattern_missing=0を確認した。adapterを
doctor/CIへ配線すること自体は後続sliceであり、この測定だけでは#694のcompletion claimを許可しない。
adapter内部のdigest形式・dbConverged・ciConclusion pendingの3判定はschema側が入力を生成できず
到達不能（等価変異）であるため、上流lint／schema guardの変異で代替測定した。runnerはtracked
sourceを一時変更するため、専用worktreeで実行し、完了後に`git diff --quiet`で復元を確認する。

canonical側の失敗をcompatibility側のgreenで相殺しない。live adapterはread-only API取得に限定し、GitHubへ
直接書き込まない。監査関数はGitHubへ直接書き込まず、GitHub read-after、
commandのexit code、output digest、独立review receiptを同一HEADへ束縛した正規化済み証拠だけを入力として受け取る。
