---
layer: L8
sub_doc: unit-test-design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/destructive-command-guard.md
plan: docs/plans/PLAN-L6-77-destructive-command-guard-design.md
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
| U-GITGUARD-011 | contextual mutation taxonomy | merge／rebase／cherry-pick／stash pop・apply／am／applyをcontext必須へ分類し、read-only inspectionを誤blockしない | `tests/git-command-guard.test.ts` |
| U-GITGUARD-012 | shared root foreign dirty | merge対象と重ならないforeign dirtyがあるprimary rootでも全contextual mutationをblockする | `tests/git-command-guard.test.ts` |
| U-GITGUARD-013 | clean／linked allow | clean primary rootと同一common-dirのlinked worktreeでは同じcommandをpassする | `tests/git-command-guard.test.ts` |
| U-GITGUARD-014 | cwd／identity fail-close | cwd未指定時はhook実効cwdを使い、common-dir不一致、unknown identity、status取得失敗をsafeへ縮退しない | `tests/git-command-guard.test.ts` |
| U-GITGUARD-015 | foreign source parity | Git guardとwork-guardが同一git status／session touched collectorを使い、session touched済みdirtyをforeignとしない | `tests/work-guard.test.ts`、`tests/git-command-guard.test.ts` |
| U-SAFETY-001 | narrow delete fence | repo内の静的な単一ファイル削除はpassし、recursive/複数/glob/変数/repo外をblockする。`sudo -u`等の引数付きoption、`timeout` / `nohup` / `nice` / `ionice` / `setsid` / `stdbuf` / `time` / `doas` / `busybox` / `watch` prefix、`bash -lc`等の結合short flag、`bash -i -c` / `sh --posix -c` / `su -c` / `script -c`等のpayload optionでも判定を維持する | `tests/machine-safety-guard.test.ts` |
| U-SAFETY-002 | machine deletion | Python/Node/PowerShell/Perl/Ruby inline、find/xargsによる対象計算削除をblockする | `tests/machine-safety-guard.test.ts` |
| U-SAFETY-003 | host destructive taxonomy | block/raw device write、recursive permission mutation、forced broad process kill、truncate/shred/rsync delete、host停止、host root mountをblockする | `tests/machine-safety-guard.test.ts` |
| U-SAFETY-004 | script body preflight | interpreterが参照するrepo script本文に削除APIがあれば起動前blockする | `tests/machine-safety-guard.test.ts` |
| U-SAFETY-005 | write/stage/commit secret | proposed write、working tree、indexのsecretを値非表示でblockする | `tests/secret-egress-hook.test.ts` |
| U-SAFETY-006 | outgoing history secret | upstreamからHEADまでの各commit blobをscanし、secretと`--no-verify`をpush前blockする | `tests/secret-egress-hook.test.ts` |

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
