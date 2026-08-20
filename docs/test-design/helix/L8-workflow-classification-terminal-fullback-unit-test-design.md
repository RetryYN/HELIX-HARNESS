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

canonical側の失敗をcompatibility側のgreenで相殺しない。監査関数はGitHubへ直接書き込まず、GitHub read-after、
commandのexit code、output digest、独立review receiptを同一HEADへ束縛した正規化済み証拠だけを入力として受け取る。
