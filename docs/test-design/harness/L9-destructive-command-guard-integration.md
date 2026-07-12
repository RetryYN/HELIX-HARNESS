---
layer: L9
sub_doc: integration-test-design
status: draft
pair_artifact: docs/design/harness/L5-detailed-design/destructive-command-guard.md
plan: docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md
---

# 破壊的 command guard 結合テスト設計

dev hook、CLI、consumer hookをtemp repositoryと実filesystem portで結合する。同一nonceへ2 processを
barrier付きで同時実行しallowが1以下であること、durable commit前partialはquarantine後retry可能であり、
commit後consume前crashだけrestart後にnonceを再利用できないこと、
全audit bytesにsecret、PII、個人absolute pathが無いことを検証する。

| I-ID | 障害注入点 | 終了値 | 監査/nonce | marker | 再試行 |
|---|---|---:|---|---|---|
| IT-GITGUARD-001 | 2 process CAS競合 | 片方0、片方2 | committed 1件 | consumed 1件 | 敗者不可 |
| IT-GITGUARD-002 | durable commit前partial | 2 | quarantine、nonce未予約 | 保持 | 可 |
| IT-GITGUARD-003 | commit後consume前crash | 2 | committed、nonce予約済み | 保持 | restart後不可 |
| IT-GITGUARD-004 | adapter audit redaction | 0/2 | allowlist fieldのみ | 結果に一致 | secret/path漏洩0 |

test citationは`tests/guard-override-transaction.test.ts`と`tests/hook-contract.test.ts`とする。
