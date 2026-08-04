---
title: "independent review fallback unit test design"
layer: L8
artifact_type: test_design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-RECOVERY-12-independent-review-fallback.md
pair_artifact: docs/design/helix/L6-function-design/independent-review-fallback.md
github_issue_id: 390
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
---

# 独立レビュー・フォールバック単体テスト設計

| oracle | 正常／異常 | 検証 |
|---|---|---|
| U-IRF-001 | 正常 | Claude healthyなら主系を維持 |
| U-IRF-002 | 正常 | 封印済みquota evidenceだけKimiへ切替 |
| U-IRF-003 | 異常 | 偽evidence、高・critical riskを拒否 |
| U-IRF-004 | 異常 | 同一repo/PR/HEAD/generationの二重leaseを拒否 |
| U-IRF-004A | 異常 | durable circuit breakerが再起動／generation変更後の同一HEAD再試行を拒否 |
| U-IRF-004B | 正負 | 同一implementation HEADの5 benchmark case／4 negative mutation exact setとcanonical Claude v2 receiptから生成したS4だけを受理し、文字列だけのClaude指定／PO自己bootstrap／HEAD不一致／digest欠落／Kimi自己検証／期限切れを拒否 |
| U-IRF-005 | 正常 | ACP限定、raw prompt／auto／yoloなし |
| U-IRF-005A | 正負 | ACP v1 handshakeとmessage chunkを受理し、permission／tool requestを検出 |
| U-IRF-006 | 正負 | exact marker/schema/HEADを検証しtool activityを拒否 |
| U-IRF-007 | 正負 | fallback、永続lease、output、CI、DB、S4 admission、implementation treeをreceiptへ束縛し、canonical root外の手製receiptとadmission欠落を拒否 |
| U-IRF-009 | 異常 | dirty／untracked implementation、dry-run実行、Kimi前のred／stale CI、Kimi後のHEAD／CI／DB driftではKimi起動またはreceipt発行を拒否 |
| U-IRF-008 | 正負 | repository非mount、auth欠落fail-close |
| U-IRF-008A | 負 | ACP `Authentication required`をauth surface未解決へ分類し、protocol invalidと誤分類しない |
| U-IRF-008B | 負 | terminal ACP response前のexit 0をtimeout待機せずprocess failureへ即時分類する |
| U-CLI-034 | 正常 | `pr-review-fallback-admission`、`pr-review-fallback`、provider-neutral dual-read merge surfaceを公開 |

実process smokeは偽HEADと機密を含まないpacketだけを使い、bubblewrap内の`kimi acp`と空workspaceからstrict output capabilityを得る。merge権限の受入はcanonical Claude S4 admission、canonical v3 path、同一HEAD CI／DBを揃えて別途確認する。
