---
document_id: HELIX-AGENTIC-AUDIT-FUTURE-DELTA-L10-CANDIDATE
version: 0.1.0
status: draft_candidate
canonical_layer: L10
pair_of: docs/governance/candidates/agentic-audit-future-state-delta-requirements.md
plan: PLAN-L3-81-agentic-audit-future-state-delta
github_issue_id: 1409
---

# Agentic Audit / Future State Delta 受入候補

| Oracle | 対象 | 受入条件 |
|---|---|---|
| AAFD-AC-001 | AAFD-R-01 | 全必須fieldとproposal digestを持ち、finding/remediation advisoryが別identityである |
| AAFD-AC-002 | AAFD-R-02 | wrong HEAD、worktree、authority、session、owner、evidenceの各mutationを個別reasonで拒否する |
| AAFD-AC-003 | AAFD-R-03 | AI自己評価、再現なしP0、duplicate、expired、counterevidenceありをverifiedへ昇格しない |
| AAFD-AC-004 | AAFD-R-04 | Agentic probeを除去してもUIL deterministic detector経路が成立し、自由文direct writeが失敗する |
| AAFD-AC-005 | AAFD-R-05 | internal/UILとexternal/TERを正しく分離し、owner swap mutationを拒否する |
| AAFD-AC-006 | AAFD-R-06 | 11 changed dimension、previous/observed、unknown、invalidation exact setを欠落なく保持する |
| AAFD-AC-007 | AAFD-R-07 | 同一receiptから同一delta exact set/digestとなり、retry/順序変更/duplicate eventで増殖しない |
| AAFD-AC-008 | AAFD-R-08 | unknown→0/unchanged/observed mutationとdeltaからのRequirement direct writeを拒否する |
| AAFD-AC-009 | AAFD-R-09 | wrong snapshot revision/digestをjoinせず、stale/reobservationへ送る |
| AAFD-AC-010 | AAFD-R-10 | affected exact setだけをstale化し、unaffected projectionを再生成せず、構造変更を#1037へ送る |
| AAFD-AC-011 | AAFD-R-11 | stale directive、unresolved unknown、missing receiptからassignment/release/retireを発行しない |
| AAFD-AC-012 | AAFD-R-12 | DB削除とevent順序変更後もdelta/invalidation/intake exact set/digestを再構築する |
| AAFD-AC-013 | AAFD-R-13 | model revision変更でTER revalidationを発火し、旧qualificationをcurrentへ自動継承しない |
| AAFD-AC-014 | AAFD-R-14 | finding差、誤検知、見逃し、再現、cost、latencyを独立metricとして比較する |
| AAFD-AC-015 | AAFD-R-15 | 単一benchmarkからrule/provider routing/Requirement/Designを自動昇格しない |
| AAFD-AC-016 | E2E internal | authority change→UIL→delta→Future invalidation→bounded resynthesisを同一lineageで実証する |
| AAFD-AC-017 | E2E external | model/provider change→TER→delta→Future invalidation→revalidationを同一lineageで実証する |
| AAFD-AC-018 | convergence | targeted/full regression、mutation、doctor、DB convergence、独立exact-HEAD review、main read-afterがgreenである |

## Negative oracle exact set

- 既存PR監査用`AuditFindingProposalV1`をsystem audit contractへ再解釈する。
- Fable等の修正案を直接実装authorityとして採用する。
- AI findingを独立再現なしでP0確定する。
- external release検出だけでHELIX defectと確定する。
- internal driftをTER、external driftをUILだけで閉じる。
- UIL／TERを飛ばしてFuture Synthesisへ自由文を投入する。
- unknownを0、neutral、unchanged、observedへ変換する。
- stale projectionまたはdirectiveを再利用する。
- deltaからRequirement、Design、Release、Assignmentを直接変更する。
- historical model receiptをcurrent revisionへ書き換える。
- duplicate finding/deltaを別episodeとして無限生成する。
- model upgradeだけを理由にqualificationを自動継承する。
