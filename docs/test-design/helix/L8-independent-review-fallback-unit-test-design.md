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
| U-IRF-004B | 正負 | 同一implementation HEADの5 benchmark case／4 negative mutation exact setとGitHub commentを再検証したcanonical Claude v2 receiptから生成したS4だけを受理し、文字列だけのClaude指定／自己整合JSONだけのreceipt／wrong filename／comment marker・HEAD・CI・DB・receipt digest改変／PO自己bootstrap／Kimi自己検証／期限切れを拒否 |
| U-IRF-005 | 正常 | ACP限定、raw prompt／auto／yoloなし |
| U-IRF-005A | 正負 | ACP v1 handshakeとmessage chunkを受理し、permission／tool requestを検出 |
| U-IRF-006 | 正負 | exact marker/schema/HEADを検証しtool activityを拒否 |
| U-IRF-007 | 正負 | fallback、永続lease、output、CI、DB、S4 admission、implementation treeをreceiptへ束縛し、canonical root外の手製receiptとadmission欠落を拒否する。canonical root内で自己整合させたv3も外部attestation無しではadvisory-onlyとしてmerge拒否 |
| U-IRF-009 | 異常 | dirty／untracked implementation、dry-run実行、Kimi前のred／stale CI、Kimi後のHEAD／CI／DB driftではKimi起動またはreceipt発行を拒否 |
| U-IRF-008 | 正負 | repository非mount、auth欠落fail-close |
| U-IRF-008A | 負 | ACP `Authentication required`をauth surface未解決へ分類し、protocol invalidと誤分類しない |
| U-IRF-008B | 負 | terminal ACP response前のexit 0をtimeout待機せずprocess failureへ即時分類する |
| U-IRF-003A | 正負 | risk classを変更pathから導出し、docs限定=low／通常source=medium／workflow・migration・state-db・auth・payment・credential・guard・admission・merge・review系=highを固定する。空集合を`REVIEW_FALLBACK_RISK_UNCLASSIFIABLE`、過小申告を`REVIEW_FALLBACK_RISK_UNDERDECLARED`、非admitted導出riskを`REVIEW_FALLBACK_RISK_NOT_ADMITTED`で拒否 |
| U-IRF-004D | 正負 | S4 admissionの有効期間上限（24時間）をbuildとvalidateの両方で強制し、上限超過windowを`kimi_review_admission_invalid`で拒否 |
| U-IRF-004E | 異常 | HEAD単位のattempt slotを`O_EXCL`で確保し、`.json`走査が0件に見えるTOCTOU窓でも再取得を拒否 |
| U-IRF-007A | 正負 | v3 receiptへ`lease_issued_at`／`lease_expires_at`を束縛し、`observed_at ≤ lease.issued_at ≤ reviewed_at ≤ lease.expires_at`をbuildとvalidateの両方で強制。窓外・逆順の鎖を拒否 |
| U-CLI-034 | 正常 | `pr-review-fallback-admission`、`pr-review-fallback`、provider-neutral dual-read merge surfaceを公開 |

実process smokeは偽HEADと機密を含まないpacketだけを使い、bubblewrap内の`kimi acp`と空workspaceからstrict output capabilityを得る。merge権限の受入はcanonical Claude S4 admission、canonical v3 path、同一HEAD CI／DBを揃えて別途確認する。
