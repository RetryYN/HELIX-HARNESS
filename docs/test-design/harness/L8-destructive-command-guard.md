---
layer: L8
sub_doc: unit-test-design
status: draft
pair_artifact: docs/design/harness/L6-function-design/destructive-command-guard.md
plan: docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md
---

# 破壊的 command guard テスト・検証設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GITGUARD-003 | grammar metamorphic | `env`、global option順列、compound/nested shell、quote変形後も同じdestructive operationをblockする。文字列引数だけの記述はpassする | `tests/git-command-guard.test.ts` |
| U-GITGUARD-004 | taxonomy | force clean、branch force delete、stash drop/clearをblockし、clean dry-run、branch safe delete、stash list/showをpassする | `tests/git-command-guard.test.ts` |
| U-GITGUARD-005 | audit-before-consume | audit commit成功前またはmarker consume成功前にallowしない。成功時だけexactly one audit/consumeとなる | `tests/guard-override-transaction.test.ts` |
| U-GITGUARD-006 | failure injection | append/fsync/consume/crash/retryの各failureでexit 2、audit失敗時marker保持、二重allow 0を証明する | `tests/guard-override-transaction.test.ts` |
| U-GITGUARD-007 | adapter parity | dev hook、work guard、CLI、consumer templateが同じtransaction primitiveとclassificationを使い、foreign-editもDB rowへredacted auditする | `tests/hook-contract.test.ts`、`tests/work-guard.test.ts` |
| U-GITGUARD-008 | concurrent CAS | 同一nonceへbarrier付き2並行呼出しを行い、allowが1以下、敗者が`blocked_reuse`、restart後も再利用不可 | `tests/guard-override-transaction.test.ts` |
| U-GITGUARD-009 | crash point | durable commit前のtorn recordはquarantine・marker保持・retry可、commit後consume前crashはrestart後`blocked_reuse` | `tests/guard-override-transaction.test.ts` |

property testはdestructive seedへ安全なprefix/suffix/global option/quote変形を生成し、block不変を検査する。
failure oracleはin-memory fakeだけでなくtemp repositoryのDB open/transaction failure、marker remove failureを使う。
raw command中のsecret/pathがaudit bytesへ現れないことも検査する。
audit schemaの全field、SQLite rollback/corruption、nonce row restartをfault injection対象にする。
