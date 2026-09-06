---
canonical_vmodel: L1-L12
candidate_layer: L10
canonical_pair: L3
title: "責務中心Learning System受入設計"
layer: L10
kind: redesign
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1384#issuecomment-5544537975"
created: 2026-09-02
updated: 2026-09-06
owner: QA / Codex TL
plan: PLAN-L3-80-responsibility-centric-learning-system
parent_design: docs/governance/candidates/responsibility-centric-learning-requirements.md
pair_artifact: docs/governance/candidates/responsibility-centric-learning-requirements.md
---

# 責務中心Learning System受入設計

| AC | Requirement | 合格条件 | Negative oracle |
|---|---|---|---|
| `RCLS-AC-001` | RCLS-R-01..03 | 全assetがexactly one primary ownerとlineageを持つ | owner不明、暗黙shared、複数primaryを拒否 |
| `RCLS-AC-002` | RCLS-R-04..08 | 5 channelを別contractで保持 | 自由文tag／単一enumへの畳込みを拒否 |
| `RCLS-AC-003` | RCLS-R-07 | failure、高cost、human rejectも分母へ残る | 成功例だけでconfidenceを上げない |
| `RCLS-AC-004` | RCLS-R-08 | independent VERIFYが別producer/session/contextを証明 | 自己評価、旧HEAD reviewを独立検証に数えない |
| `RCLS-AC-005` | RCLS-R-09..11 | 同一input/revision/policyから同一packet exact set/digest | vector similarityだけでowner/authorityを決めない |
| `RCLS-AC-006` | RCLS-R-10 | stale/contradicted/expired/restricted assetがexcluded receiptへ出る | current packetへの混入を拒否 |
| `RCLS-AC-007` | RCLS-R-12..13 | promotionと全縮退状態を再生可能 | 単一事例・頻度・自己評価による段階飛越を拒否 |
| `RCLS-AC-008` | RCLS-R-14 | Skillにscene trigger、非適用条件、効果測定、expiryがある | generic procedureの既定注入を拒否 |
| `RCLS-AC-009` | RCLS-R-15 | mechanismにVERIFY、shadow、FP評価、rollback、approvalがある | event件数だけのACTIVE化を拒否 |
| `RCLS-AC-010` | RCLS-R-16 | ACTIVE後の重複Skill proseが0 | machine policy化済み規則の再注入を拒否 |
| `RCLS-AC-011` | RCLS-R-17 | lane内部reviewと独立review receiptを分離 | provider内部reviewによるmerge admissionを拒否 |
| `RCLS-AC-012` | RCLS-R-18 | sensitivity/license/holdout policyが全外部assetを検査 | secret/PII/license不明/hidden oracleを拒否 |
| `RCLS-AC-013` | RCLS-R-19 | event journalからindex/confidence/promotionが一致再構築 | DB rowだけのauthority化を拒否 |
| `RCLS-AC-014` | RCLS-R-20 | provider/model/version変更で対象qualificationがstale化 | 旧bench/Skill資格の無条件継承を拒否 |
| `RCLS-AC-015` | RCLS-R-01..20 | #1370/#1372/#1382/#1035/#1318/#1295とのowner重複0 | 既存Capabilityの再実装を拒否 |
| `RCLS-AC-016` | RCLS-R-10/14..16 | context bytes/task、defect、acceptance、reworkをbefore/after測定 | token削減だけで品質改善を主張しない |
| `RCLS-AC-017` | RCLS-R-18 | project-local→cross-projectにsource/license/redaction/human approvalがある | 一案件知識の自動横展開を拒否 |
| `RCLS-AC-018` | RCLS-R-19 | Learning System出力がproposal/evidenceに限定される | Requirement/Design/merge/release直接変更を拒否 |
| `RCLS-AC-019` | RCLS-R-21..23 | selection／approval／disposition／runtime_judgment／ADR decisionが別identityで、decision・approvalはtyped authorityへ解決する | 相談、叱責、作業依頼、memory prose、学習結果をhuman decision／approvalへ昇格する入力を拒否 |
| `RCLS-AC-020` | 全件 | targeted/full、mutation、doctor、DB、consumer smoke、Claude exact-HEAD、main read-afterがgreen | 局所greenで終端しない |

20 oracleを独立failure classとして保持し、legacy/historical successでcurrent failureを相殺しない。
