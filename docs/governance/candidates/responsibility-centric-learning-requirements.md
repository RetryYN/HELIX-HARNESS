---
canonical_vmodel: L1-L12
candidate_layer: L3
canonical_pair: L10
title: "責務中心Learning System要件"
layer: L3
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-02
owner: PO / Codex TL
plan: PLAN-L3-80-responsibility-centric-learning-system
parent_design: docs/governance/candidates/responsibility-centric-learning-requests.md
pair_artifact: docs/governance/candidates/responsibility-centric-learning-acceptance.md
next_pair_freeze: L10_after_po_approval
---

# 責務中心Learning System要件

- 文書ID: `HELIX-RCLS-REQ-001`
- 主Issue: `#1384`

## Feature契約

### RCLS-FR-001 Learning profileとowner

- `RCLS-R-01`: `ResponsibilityLearningProfileV1`はstable responsibility、owner、source requirement/design/contract、channel policy、asset、mechanism、retention、sensitivity、promotion、revision、digestを持つ。
- `RCLS-R-02`: 各assetはexactly one primary ownerを持ち、複数責務との関係はconsumer edgeで表す。split／merge／supersede時はlineageを保持する。
- `RCLS-R-03`: 責務間転用はsource/target、理由、適用条件、失う前提、反例、target admissionを持つproposalとする。

### RCLS-FR-002 Learning asset

- `RCLS-R-04`: `CaseKnowledgeV1`は目的、制約、non-goal、assumption、unknown、decision、evidence、valid revisionを保持する。
- `RCLS-R-05`: `SceneKnowledgeV1`はactor、trigger、context、goal、friction、decision point、observed outcome、counterexampleを保持する。
- `RCLS-R-06`: `PatternKnowledgeV1`はproblem shape、applicability、structure、invariant、trade-off、alternative、failure、counterexample、scope、confidence、revalidation条件を保持する。
- `RCLS-R-07`: `OperationalExperienceV1`は状況、判断、行動、観測、outcome、cost、downstream impact、correlation、causal statusを再現可能に束縛する。
- `RCLS-R-08`: `VerificationAssessmentV1`はtarget revision、class、producer/verifier独立性、oracle、counterevidence、environment、reproduction、expiryを保持する。

### RCLS-FR-003 IndexとRetrieval Packet

- `RCLS-R-09`: primary indexを`responsibility_id`とし、case/channel/scene/pattern/failure/task/domain/risk/provider/workflow/revision/sensitivity/verificationをfacetにする。domainはownerを決めない。
- `RCLS-R-10`: `LearningRetrievalPacketV1`はassignment、responsibility、case、task、scene hypothesis、risk、provider lane、budget、authority digest、included/excluded exact set、mechanism、judgment pack、counterexample、unknown、expiry、digestを持つ。
- `RCLS-R-11`: 同一input、source revision、registry/policy versionから同一asset exact setとpacket digestを生成する。semantic/vector searchは候補順位付けだけに使う。

### RCLS-FR-004 Promotionとmechanization

- `RCLS-R-12`: lifecycleを`CAPTURED→NORMALIZED→RESPONSIBILITY_BOUND→PROJECT_LOCAL→SUPPORTED→VERIFIED→CROSS_PROJECT_CANDIDATE→CROSS_PROJECT_VALIDATED→MECHANIZATION_CANDIDATE→SHADOW→ACTIVE`とし、段階飛越を拒否する。
- `RCLS-R-13`: `CONTRADICTED/SUPERSEDED/EXPIRED/REVOKED/REVALIDATION_REQUIRED`への縮退を保持する。
- `RCLS-R-14`: Scene Skillは非決定的判断、適用／非適用scene、追加価値、before/after測定、provider-native比較、expiryが揃う場合だけ昇格する。
- `RCLS-R-15`: `MechanizationCandidateV1`はtrigger、invariant、enforcement point、deterministic evaluator、shadow、false-positive/escaped-defect budget、rollback、verification、human approvalを持つ。
- `RCLS-R-16`: ACTIVE mechanismと同じ規則をSkill proseへ重複保持しない。

### RCLS-FR-005 Lane、security、replay

- `RCLS-R-17`: Codex、Cursor、Claudeへprovider-neutralな同一責務packetを投影し、provider-native内部reviewを独立reviewへ昇格しない。
- `RCLS-R-18`: secret、PII、raw private transcript、license不明source、hidden-oracle contamination、境界外cross-project取得を拒否する。
- `RCLS-R-19`: event journalをsourceとし、index、confidence、promotionを再構築可能な`harness.db` projectionにする。別DB authorityを作らない。
- `RCLS-R-20`: provider/model/config/version driftで関連assetとSkill qualificationをrevalidationへ戻す。

## Owner境界

| Owner | Learning Systemとの境界 |
|---|---|
| #397 Requirement IR | CASE authorityを供給。Learningから要求を書き換えない |
| #1033/#1035 System Synthesis/Pattern Promotion | validated patternとpromotion authorityを再利用 |
| UIL | LOG intakeとmechanization findingを供給 |
| #1318/#1324 RSTDD | responsibility knowledgeのproducer/consumer |
| #1295/#1296 HELIX-Bench | skill/pattern/mechanismの再現性を測定 |
| #1370 | startup packetへ最小subsetを投影 |
| #1372 | knowledge文書のauthority driftを監査 |
| #1382 | usage/utility/context costをconsumeしてsurfaceを処分 |

新workflow route、development style、provider内部subagent構成を追加しない。
