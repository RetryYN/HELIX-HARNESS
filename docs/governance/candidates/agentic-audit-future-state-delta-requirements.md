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

# Agentic Audit / Future State Delta 要件候補

## 0. Authorityとowner境界

本Capabilityは、agentic system auditをUIL sourceへ変換し、UIL／TERのqualified changeをFuture Synthesis inputへ変換する
adapter群である。内部観測・finding qualificationは#1210、外部技術変化は#1174/#1178、future projectionは
#1282/#1298、構造再合成は#1037、pattern promotionは#1035/#1384が所有する。

既存L6のPR監査用`AuditFindingProposalV1`と同名・同schemaを再利用しない。新契約は
`AgenticAuditProbeProposalV1`とし、PR review findingとsystem audit proposalを別identityで保持する。

## AAFD-FR-001 Agentic Audit Probe

### AAFD-R-01 Proposal schema

`AgenticAuditProbeProposalV1`はproposal ID、audit episode、producer provider/runtime/model/version/session、repository、
candidate HEAD、worktree identity、authority revision/digest、responsibility/invariant IDs、observed behavior、evidence、
reproduction recipe、counterevidence、confidence、expiry、finding advisory、remediation advisory、proposal digestを持つ。

### AAFD-R-02 Identity admission

exact HEAD、resolved worktree、authority digest、producer session、responsibility owner、evidenceの欠落または不一致を個別に
fail-closeする。current、compatibility、historical authorityを分離し、historical evidenceをcurrent claimへ読み替えない。

### AAFD-R-03 Qualification boundary

AI自己評価だけでverified、P0/P1、owner、route、remediation採用を確定しない。duplicate Issue／existing owner照合、独立再現、
反証、expiry、supersessionをUIL-01〜04へ渡す。finding proposalとremediation proposalは別identity、別判定とする。

### AAFD-R-04 Deterministic detector supremacy

Agentic Audit Probeは未知finding探索のsource profileであり、UILのdeterministic detectorを置換しない。自由文を直接Issue、
Requirement、CI、merge authorityへ投影しない。

## AAFD-FR-002 FutureStateDelta

### AAFD-R-05 Delta origin

`FutureStateDeltaV1`は`internal/UIL`または`external/TER`のqualified source receiptからだけ生成する。origin typeとownerを
別fieldで保持し、内部と外部を同じenum identityへ潰さない。

### AAFD-R-06 Delta schema

deltaはstable ID、source receipt revision/digest、HEAD/authority/environment identity、affected responsibilities、changed
dimensions、previous/observed state、evidence/counterevidence、confidence、unknowns、invalidated projection/future type/
assumption exact set、requires resynthesis、delta digestを持つ。

changed dimensionsはauthority、responsibility、runtime、provider、dependency、security、verification、capacity、cost、
migration、releaseを別fieldで保持する。

### AAFD-R-07 Determinismとdedupe

同一source receipt、registry、policyから同一delta exact set/digestを生成する。stale revision、wrong HEAD、wrong authority、
missing receipt、duplicate changeを拒否し、at-least-once deliveryで別episodeを無限生成しない。

### AAFD-R-08 Unknownとauthority non-write

unknownを0、neutral、unchanged、observedへ補完しない。deltaはRequirement、Design、Release、Assignment、mergeを直接変更しない。

## AAFD-FR-003 Future Synthesis Delta Intake

### AAFD-R-09 Exact snapshot join

intake adapterはdeltaのsource identityをF0 Current State Snapshotへexact joinし、snapshot revision/digestが一致しないdeltaを
staleまたはreobservation requiredへ送る。

### AAFD-R-10 Invalidationとbounded resynthesis

affected Future Type、assumption、projection、directiveをexact setでstale化し、必要範囲だけ再投影する。構造変更が必要な場合は
#1037へproposal-onlyでrouteし、whole-system plannerのcurrent write parkingを解除しない。

### AAFD-R-11 Stale execution guard

stale Future Directive、unresolved unknown、missing source receiptからassignment、release、retire、requirement/design writeを
発行しない。Future SynthesisはUIL／TERの観測・qualificationを再実装しない。

### AAFD-R-12 Replay

repo authorityとevent journalからdelta、invalidation、intake projectionを再構築し、DB削除後も同じexact set/digestを返す。

## AAFD-FR-004 Model revision audit benchmark

### AAFD-R-13 TER trigger

provider/model/runtime/version変更をTER eventとして記録し、同じaudit corpus、responsibility scope、policy、oracle revisionで
revalidationを開始する。model名の文字列変更だけでqualificationを継承しない。

### AAFD-R-14 Comparative receipt

new/lost finding、false positive/negative、duplicate、remediation correctness、authority drift、reproduction success、cost、latencyを
別metricで記録し、単一scoreへ潰さない。hidden oracleをworker contextへ渡さない。

### AAFD-R-15 Promotion boundary

benchmark結果はLearning Systemへのcandidate evidenceであり、単一model revisionの結果からrule、provider routing、Requirement、
Designを自動変更しない。昇格は#1035/#1384の独立VERIFY、counterexample、expiry、human gateへ従う。

## 1. 原子的runtime slice

| Slice | 責務 |
|---|---|
| AAP-01 | Proposal schema／UIL source profile |
| AAP-02 | exact identity／authority／duplicate／reproduction verifier |
| AAP-03 | UIL-01〜04 adapter |
| FSD-01 | Delta schema／deterministic compiler |
| FSD-02 | UIL→delta adapter |
| FSD-03 | TER→delta adapter |
| FSD-04 | Future Synthesis F0 intake／invalidation |
| FSD-05 | System Synthesis reroute boundary |
| AUD-BENCH-01 | model revision benchmark |
| AUD-E2E-01 | internal／external dogfood、replay、read-after |

authority canonical mergeとplan固有L3承認の後に依存順で開始し、巨大PRへ混載しない。
