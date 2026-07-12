---
layer: L9
sub_doc: integration-test-design
status: draft
pair_artifact: docs/design/harness/L5-detailed-design/durability-boundaries.md
plan: docs/plans/PLAN-L6-78-durability-boundary-design.md
---

# durability boundaries 結合テスト設計

実doctor CLIとautonomous-loop child processをtemp repository上で実行する。raw cause seedをterminal/JSON/DB/artifactの
全bytesから検索し0件を要求する。loop childはbarrierとtest-only fault pointを使い、各publish境界でSIGKILLした後の
restart classificationを検査する。

| I-ID       | 障害注入                                              | 期待結果                                               | recovery                        |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------ | ------------------------------- |
| IT-DUR-001 | doctor checkがsecret/path/SQLを含むError/Proxyをthrow | nonzero/safe reason、raw bytes漏洩0、stable digestあり | check単位で継続またはfail-close |
| IT-DUR-002 | state/manifest tamper、truncated JSON                 | corrupt、missing扱い0、artifact自動変更0               | explicit repair packet          |
| IT-DUR-003 | C1-C6 publish各境界でprocess SIGKILL                  | L5 crash matrixとexact一致、half-state 0               | deterministic restart           |
| IT-DUR-004 | 同一planの`O_EXCL` claimへbarrier付き2 process commit | winner 1以下、lost receipt 0、stale/live claimを区別   | conflict packet                 |
| IT-DUR-005 | external side effect intent後にSIGKILL                | restartで自動再実行0、ambiguous packetにsafe digest    | human/escalation                |

POSIXではparent directory fsync呼出しをtraceし、Windows smokeではsame-volume renameとfile fsync capability表示を検査する。
test citationは`tests/doctor-cause-digest.test.ts`、`tests/doctor-cause-digest-contract.test.ts`、
`tests/loop-store-durability.test.ts`、`tests/autonomous-loop-run-receipts.test.ts`とする。
