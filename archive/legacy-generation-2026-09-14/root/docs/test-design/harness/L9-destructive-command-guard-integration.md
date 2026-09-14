---
layer: L9
sub_doc: integration-test-design
status: confirmed
pair_artifact: docs/design/harness/L5-detailed-design/destructive-command-guard.md
plan: docs/plans/PLAN-L6-77-destructive-command-guard-design.md
---

# 破壊的 command guard 結合テスト設計

dev hook、CLI、consumer hookをtemp repositoryと実filesystem portで結合する。同一nonceへ2 processを
stdin barrier付きで同時実行しallow 1/block 1/DB row 1であること、durable commit前rollbackはmarker保持後retry可能であり、
commit後consume前crashだけrestart後にnonceを再利用できないこと、
全audit bytesにsecret、PII、個人absolute pathが無いことを検証する。

| I-ID | 障害注入点 | 終了値 | 監査/nonce | marker | 再試行 |
|---|---|---:|---|---|---|
| IT-GITGUARD-001 | 2 process CAS競合 | 片方0、片方2 | committed 1件 | consumed 1件 | 敗者不可 |
| IT-GITGUARD-002 | DB commit前write-lock/rollback | 2 | row未commit | 保持 | lock release後可 |
| IT-GITGUARD-003 | commit後consume前の実process SIGKILL | signal終了、restart 2 | committed、nonce予約済み | 保持 | restart後不可 |
| IT-GITGUARD-004 | adapter audit redaction | 0/2 | allowlist fieldのみ | 結果に一致 | secret/path漏洩0 |
| IT-GITGUARD-005 | primary rootに非重複foreign dirty＋merge | 2 | rowなし | 未使用 | dirty/merge対象の重複に依存せずblock |
| IT-GITGUARD-006 | clean primary／linked worktreeで同一mutation | 0 | rowなし | 未使用 | context変化後に再評価 |
| IT-GITGUARD-007 | shared-root mutationのone-shot override | 初回0、再利用2 | committed 1件 | 1回だけconsume | 既存transactionへ収束 |

test citationは`tests/guard-override-transaction.test.ts`、`tests/git-command-guard.test.ts`、
`tests/work-guard.test.ts`、`tests/hook-contract.test.ts`、`tests/machine-safety-guard.test.ts`、
`tests/secret-egress-hook.test.ts`とする。dev hookとpackage-local CLI hookの同一fixture、consumer templateの
blockOnFailure/30秒timeout、secret値がstderrに現れないことを結合oracleに含める。
