---
layer: L8
sub_doc: unit-test-design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/destructive-command-guard.md
plan: docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md
---

# 破壊的 command guard テスト・検証設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GITGUARD-003 | grammar metamorphic | `env`、global option順列、compound/nested shell、quote変形後も同じdestructive operationをblockする。文字列引数だけの記述はpassする | `tests/git-command-guard.test.ts` |
| U-GITGUARD-004 | taxonomy | force clean、branch force delete、stash drop/clearをblockし、clean dry-run、branch safe delete、stash list/showをpassする | `tests/git-command-guard.test.ts` |
| U-GITGUARD-005 | audit-before-consume | audit commit成功前またはmarker consume成功前にallowしない。成功時だけexactly one audit/consumeとなる | `tests/guard-override-transaction.test.ts` |
| U-GITGUARD-006 | failure injection | SQLite transaction/commitとconsume failureはexit 2、crash processはsignal終了、restartはexit 2となり、audit失敗時marker保持、二重allow 0を証明する | `tests/guard-override-transaction.test.ts`、`tests/git-command-guard.test.ts` |
| U-GITGUARD-007 | adapter parity | dev hook、work guard、CLI、consumer templateが同じtransaction primitiveとclassificationを使い、foreign-editもDB rowへredacted auditする | `tests/hook-contract.test.ts`、`tests/work-guard.test.ts` |
| U-GITGUARD-008 | concurrent CAS | 同一nonceへbarrier付き2並行呼出しを行い、allowが1以下、敗者が`blocked_reuse`、restart後も再利用不可 | `tests/guard-override-transaction.test.ts`、`tests/git-command-guard.test.ts` |
| U-GITGUARD-009 | crash point | durable commit前のSQLite rollbackはrow未commit・marker保持・lock release後retry可。DB corruptionはfail-closeしてstate recoveryへ送り、commit後consume前crashはrestart後`blocked_reuse` | `tests/guard-override-transaction.test.ts`、`tests/git-command-guard.test.ts` |

env overrideはGit/foreign-editの両adapterで初回だけDB audit付きallow、同一session/subjectの2回目を
`blocked_reuse`とする。raw command、target、reasonをrowへ保存しない。

property testは6 destructive seed × 4 global option × 8 shell wrapper（192変形）を生成し、block不変を検査する。
process競合は2 childを起動してstdin barrierを同時releaseし、allow/block各1件とDB row 1件を検査する。
bounded retry unit oracleはbusy 2回後成功、busy 5回exhaustion、non-busy 1回即時failureを検査する。
crash oracleは`NODE_ENV=test`限定fault pointでDB commit後・marker consume前にchildを停止し、親がrowを観測後に
SIGKILLする。restart後はmarkerが残っていても`blocked_reuse`となることを検査する。
failure oracleはin-memory fakeだけでなくtemp repositoryのDB open failure、実SQLite write-lockによるtransaction
commit failure、read-only state directoryによる実marker remove failureを使う。lock中はmarker保持でblockし、
rollback/release後のretryだけをallowする。marker remove failureはDB rowを`consume_failed`にしてblockする。
Git/foreign-editのDB file全bytesをscanし、raw command/target/reason、secret、PII、personal absolute pathが
現れないことも検査する。
audit schemaの全field、SQLite rollback/lock/corruption、nonce row restartをfault injection対象にする。DB全体の
corruptionは自動move/deleteせずfail-closeし、state recoveryの承認境界へ送る。
