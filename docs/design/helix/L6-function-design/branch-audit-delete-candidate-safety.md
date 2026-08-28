---
title: "branch audit delete-candidate安全化機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
plan: docs/plans/PLAN-L7-690-branch-audit-delete-candidate-safety.md
pair_artifact: docs/test-design/helix/L8-branch-audit-delete-candidate-safety-unit-test-design.md
github_issue_id: 1110
behavior_contract_id: BRANCH-AUDIT-DELETE-SAFETY-001
responsibility_owner: branch-audit
---

# branch audit delete-candidate安全化機能設計

## 責務とauthority

本設計は、local branchのread-only棚卸しにおいて`delete-candidate`を出せる証拠境界を定義する。
`delete-candidate`は削除命令ではなく#631へ渡し得る候補分類に留め、削除・worktree解体・remote writeを
行わない。merge authorityはcurrent worker `HEAD`ではなくcanonical main refとし、branch名やprovider名から
scope、owner、workflowを推測しない。

## 入出力とDbC

| 境界 | 入力 | 出力 | 契約 |
|---|---|---|---|
| main resolver | repository refs | `origin/main`、local `main`、またはunresolved | remote tracking refを優先し、どちらも無ければ推測しない |
| history probe | repository | complete／shallow | shallowを完全履歴として扱わない |
| worktree parser | porcelain text | named local branch exact set | detached entryをbranchへ変換しない |
| merge probe | resolved main ref | main到達local branch exact set | current `HEAD`をmerge authorityにしない |
| analyzer | refs、main証拠、worktree集合、時刻 | typed audit result | 証拠不足を`delete-candidate`へ昇格させない |
| CLI | audit result | JSON／text、exit class | `ok=false`をexit 0で隠さない |

前提は全入力を同じrepository観測から取得すること、事後条件は削除候補の各branchについて
`merged=true`、`checkedOutInWorktree=false`、`mainRefResolved=true`、`historyComplete=true`が成立することとする。

## 判定優先順位

```text
current
→ protected
→ worktree-in-use
→ main-ref-unresolved
→ shallow-history
→ merged (goneならgone-merged)
→ gone-unmerged
→ stale
→ active
```

保護と占有を先に評価し、後段のmerge／gone証拠で相殺しない。main refまたは履歴が不完全な場合、
protected以外のbranchは`review`へ閉じ、result全体を`ok=false`とする。

## Receipt

resultは`authority.mainRef`、`authority.mainRefResolved`、`authority.historyComplete`を保持する。
各rowはmain到達性を表す`merged`と全worktree占有を表す`checkedOutInWorktree`を別fieldで保持する。
`gone`をmerge証拠として再解釈せず、`gone-merged`と`gone-unmerged`を別reasonにする。

## 失敗と非対象

- Git ref解決不能とshallow historyはsilent skipせずtyped failureへ閉じる。
- Git command自体の実行失敗は既存CLI exception境界でnon-zeroにし、空inventoryへ変換しない。
- network fetchは行わず、観測したmain refをreceiptへ明示する。
- PR、Issue、assignment、lease、remote refs、overlap graphは#1110後続設計へ分離する。
- cleanup packet適用、branch deletion、worktree deletionは#631の責務である。

## Oracle対応

L8のU-BRAS-001〜010はgone／merge／worktree／main ref／shallow／detached／CLI exitを独立反例で固定する。
`gone`を即削除へ戻す、merge authorityを`HEAD`へ戻す、worktree検査を外す、`ok=false`をexit 0へ戻す
mutationは対応oracleでredとなる。
