---
document_id: HELIX-AGENTIC-AUDIT-FUTURE-DELTA-L3-CANDIDATE
version: 0.1.0
status: draft_candidate
canonical_layer: L3
canonical_pair: L10
plan: PLAN-L3-81-agentic-audit-future-state-delta
pair_artifact: docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md
github_issue_id: 1409
---

# エージェント監査／将来状態差分の要件候補

## 0. Authorityとowner境界

[L3-PO-1409-001](https://github.com/RetryYN/HELIX-HARNESS/issues/1409#issuecomment-5544537959)でL3候補承認済みだが、canonical昇格、IR admission、runtime実装は別工程とする。

本Capabilityは、agentic system auditをUIL sourceへ変換し、UIL／TERのqualified changeをFuture Synthesis inputへ変換する
adapter群である。内部観測・finding qualificationは#1210、外部技術変化は#1174/#1178、future projectionは
#1282/#1298、構造再合成は#1037、pattern promotionは#1035/#1384が所有する。

既存L6のPR監査用`AuditFindingProposalV1`と同名・同schemaを再利用しない。新契約は
`AgenticAuditProbeProposalV1`とし、PR review findingとsystem audit proposalを別identityで保持する。

## AAFD-FR-001 エージェント監査probe

### AAFD-R-01 提案schema

`AgenticAuditProbeProposalV1`はproposal ID、audit episode、producer provider/runtime/model/version/session、repository、
候補HEAD、worktree identity、authority revision/digest、責務／不変条件ID、観測挙動、evidence、
reproduction recipe、counterevidence、confidence、expiry、finding advisory、remediation advisory、proposal digestを持つ。

### AAFD-R-02 identity受入

exact HEAD、resolved worktree、authority digest、producer session、responsibility owner、evidenceの欠落または不一致を個別に
fail-closeする。current、compatibility、historical authorityを分離し、historical evidenceをcurrent claimへ読み替えない。

### AAFD-R-03 適格化境界

AI自己評価だけでverified、P0/P1、owner、route、remediation採用を確定しない。duplicate Issue／existing owner照合、独立再現、
反証、expiry、supersessionをUIL-01〜04へ渡す。finding proposalとremediation proposalは別identity、別判定とする。

### AAFD-R-04 決定論的検出器の優先

Agentic Audit Probeは未知finding探索のsource profileであり、UILのdeterministic detectorを置換しない。自由文を直接Issue、
Requirement、CI、merge authorityへ投影しない。

## AAFD-FR-002 将来状態差分

### AAFD-R-05 差分の起点

`FutureStateDeltaV1`は`internal/UIL`または`external/TER`のqualified source receiptからだけ生成する。origin typeとownerを
別fieldで保持し、内部と外部を同じenum identityへ潰さない。

### AAFD-R-06 差分schema

deltaはstable ID、source receipt revision/digest、HEAD/authority/environment identity、affected responsibilities、changed
変更軸、変更前／観測後の状態、evidence／反証、confidence、unknown、無効化対象のprojection／future type／
仮定exact set、再合成要否、差分digestを持つ。

changed dimensionsはauthority、responsibility、runtime、provider、dependency、security、verification、capacity、cost、
migration、releaseを別fieldで保持する。

### AAFD-R-07 Determinismとdedupe

同一source receipt、registry、policyから同一delta exact set/digestを生成する。stale revision、wrong HEAD、wrong authority、
missing receipt、duplicate changeを拒否し、at-least-once deliveryで別episodeを無限生成しない。

### AAFD-R-08 Unknownとauthority non-write

unknownを0、neutral、unchanged、observedへ補完しない。deltaはRequirement、Design、Release、Assignment、mergeを直接変更しない。

## AAFD-FR-003 Future Synthesisへの差分受入

### AAFD-R-09 snapshotの厳密接合

intake adapterはdeltaのsource identityをF0 Current State Snapshotへexact joinし、snapshot revision/digestが一致しないdeltaを
staleまたはreobservation requiredへ送る。

### AAFD-R-10 Invalidationとbounded resynthesis

affected Future Type、assumption、projection、directiveをexact setでstale化し、必要範囲だけ再投影する。構造変更が必要な場合は
#1037へproposal-onlyでrouteし、whole-system plannerのcurrent write parkingを解除しない。

### AAFD-R-11 stale実行防止

stale Future Directive、unresolved unknown、missing source receiptからassignment、release、retire、requirement/design writeを
発行しない。Future SynthesisはUIL／TERの観測・qualificationを再実装しない。

### AAFD-R-12 再生

repo authorityとevent journalからdelta、invalidation、intake projectionを再構築し、DB削除後も同じexact set/digestを返す。

## AAFD-FR-004 model revision監査benchmark

### AAFD-R-13 TER発火条件

provider/model/runtime/version変更をTER eventとして記録し、同じaudit corpus、responsibility scope、policy、oracle revisionで
revalidationを開始する。model名の文字列変更だけでqualificationを継承しない。

### AAFD-R-14 比較receipt

new/lost finding、false positive/negative、duplicate、remediation correctness、authority drift、reproduction success、cost、latencyを
別metricで記録し、単一scoreへ潰さない。hidden oracleをworker contextへ渡さない。

### AAFD-R-15 昇格境界

benchmark結果はLearning Systemへのcandidate evidenceであり、単一model revisionの結果からrule、provider routing、Requirement、
Designを自動変更しない。昇格は#1035/#1384の独立VERIFY、counterexample、expiry、human gateへ従う。

## 1. 原子的runtime slice

| Slice | 責務 |
|---|---|
| AAP-01 | 提案schema／UIL source profile |
| AAP-02 | identity／authority／重複／再現の厳密verifier |
| AAP-03 | UIL-01〜04 adapter |
| FSD-01 | 差分schema／決定論的compiler |
| FSD-02 | UILから差分へのadapter |
| FSD-03 | TERから差分へのadapter |
| FSD-04 | Future Synthesis F0受入／無効化 |
| FSD-05 | System Synthesis再配車境界 |
| AUD-BENCH-01 | model revisionのbenchmark |
| AUD-E2E-01 | 内部／外部dogfood、再生、read-after |

authority canonical mergeとplan固有L3承認の後に依存順で開始し、巨大PRへ混載しない。
