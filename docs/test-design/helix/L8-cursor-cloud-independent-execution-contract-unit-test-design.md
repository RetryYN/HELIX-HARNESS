---
title: "Cursor Cloud第三者実行レーン typed契約 L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-09-12
owner: QA
plan: docs/plans/PLAN-L5-105-cursor-cloud-independent-execution-contract.md
pair_artifact: docs/design/helix/L5-detail/cursor-cloud-independent-execution-contract.md
github_issue_id: 1293
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
---

# Cursor Cloud第三者実行レーン typed契約 L8単体テスト設計

| U-ID | 上位trace | 反例と期待結果 |
|---|---|---|
| `U-CCI-001` | 3L-R-05/12 | unknown/missing field、Issue/PLAN両方／両方なしをschema invalidで拒否 |
| `U-CCI-002` | 3L-R-05/12 | absolute/traversal、allowed/forbidden overlap、空scopeを拒否 |
| `U-CCI-003` | 3L-R-05/24 | 未発行／provider事後発行branchをlaunch 0で拒否 |
| `U-CCI-004` | 3L-R-23 | 同一branch同時取得は勝者1、敗者launch 0。異branchは双方成功 |
| `U-CCI-005` | 3L-R-23/25 | wrong owner/action/generation、stale token、上限超renewalを拒否 |
| `U-CCI-006` | 3L-R-07/08 | UNKNOWN、stale、不足budgetと同一残額の二重予約をlaunch 0で拒否 |
| `U-CCI-007` | 3L-R-24 | owner不明／不一致、assignment／branch／base driftを起動前拒否 |
| `U-CCI-008` | 3L-R-13/24 | launch応答消失時に外部run照合前のretryを拒否しrun作成最大1 |
| `U-CCI-009` | 3L-R-13 | scope外/main/DB write、禁止secret/network到達を実効境界で拒否 |
| `U-CCI-010` | 3L-R-07/08/13 | cost cap、absolute deadline、skew、遅延usageでも上限外write 0 |
| `U-CCI-011` | 3L-R-14 | 起動後leg正常でも回収legのowner／branch／assignment driftを拒否 |
| `U-CCI-012` | 3L-R-14 | 正当なcandidate HEAD進行を受理し、帰属不能HEADと自己申告costを拒否 |
| `U-CCI-013` | 3L-R-12/14 | copied local seal、過大bytes、改変diff、path/symlink脱出を拒否 |
| `U-CCI-014` | 3L-R-06 | 自己review、worker会話、旧HEAD／別branch receiptを拒否 |
| `U-CCI-015` | 3L-R-06 | changes requestedを元assignment・同branchへ返し、旧reviewをstale化 |
| `U-CCI-016` | 3L-R-23/25 | stop ACKだけで返却せず、旧worker write不能前の再配車を拒否 |
| `U-CCI-017` | 3L-R-25 | Phase A/B二重writer、旧token再利用、移行証拠欠落を拒否 |
| `U-CCI-018` | 3L-R-13/14 | 部分取得・外部障害をbounded retry後も未解消にし、無限retry／全体停止を拒否 |

各oracleは対象分岐除去mutationでRedになることをL6/L7で実証する。文書の文字列一致、mock呼出し回数、
provider Build成功、worker自己申告を合格oracleにしない。runtimeと実provider試験が未成立の間はcitationを付けず、
本L8を実行済みと扱わない。
