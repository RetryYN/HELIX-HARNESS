# GitHub Issue階層化規律

## 1. 目的

GitHub Issueを平坦なbacklogとして増殖させず、要件・能力・実行task・findingの因果関係を保ったまま
有限に収束させる。正本は`harness.db`とrepo-owned ledgerであり、GitHub sub-issueは一方向projectionとする。

## 2. 役割

| role | 用途 | parent |
|---|---|---|
| `root` | programまたは大目的 | 禁止 |
| `capability` | root配下の責務・能力群 | 必須 |
| `task` | 1 behavior contractを閉じるPR単位 | 必須 |
| `finding` | review・CI・運用で検出した事実 | 必須 |

root以外の`parent_issue`欠落は孤児としてfail-closeする。1親の子は100件以下、深さは8以下とする。

## 3. 起票契約

Issue本文は次のexact blockを持つ。

```yaml
issue_role: task
parent_issue: 81
blocks: []
blocked_by: []
duplicate_search: completed
disposition: active
duplicate_of: null
```

- 起票前にduplicate searchを行う。同じ問題があれば新規Issueを作らず既存Issueへ証拠を追記する。
- `blocks`と`blocked_by`は双方向一致させる。
- duplicateは`disposition: duplicate`と実在する`duplicate_of`を同時に持つ。
- superseded、duplicate、parkedをREADY queueへ入れない。
- 原則として1 PRは1 `task` Issueだけを閉じる。子findingはdispositionを明示する。

## 4. 次タスク抽出

次dispatchはopen rootの全Issueを平坦走査しない。次の条件を満たすREADY leafだけを候補にする。

1. roleが`task`または`finding`
2. openかつ`disposition: active`
3. open childがない
4. `blocked_by`が全てclosed
5. orphan、cycle、非対称依存、duplicate不整合がない

## 5. 終端

root/capabilityを閉じる前にopen childを0にする。子は`closed`、`duplicate`、`superseded`、
または理由付き`parked`へ必ずdispositionする。GitHub側の親子表示だけを完了証拠にしない。

## 6. 依存projection

依存を持つIssueは次のexact blockを本文へ置く。

```yaml
# helix-issue-dependency.v1
depends_on: [633]
blocks: [635]
plan_id: PLAN-L7-556-issue-dependency-doctor
```

`depends_on`と依存先の`blocks`は双方向一致させる。依存先がopenのままcloseしてはならない。
`plan_id`を持つ場合、PLAN frontmatterの`github_issue_id`と相互一致させる。proseの`Refs`は補助表示であり、
監査入力として推測しない。
