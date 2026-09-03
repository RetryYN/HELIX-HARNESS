---
document_id: HELIX-CONCEPT-V4
concept_version: "4.0"
status: draft_candidate
github_issue_id: 1496
behavior_contract_id: HELIX-CONCEPT-V4-UPGRADE-001
supersedes_after_approval: docs/governance/helix-harness-concept_v3.1.md
evidence_baseline: a122bf933d89a9df8ec9048f26bf4e554dfc5d63
---

# HELIX Concept v4.0候補

## 一文定義

HELIXは、人間の意図と環境変化を型付き変更契約へコンパイルし、複数のAI runtimeを責務単位で実行させ、
反証可能な証拠で変更を閉じ、その結果から統治機構を段階的に改善するVerified Change Operating Systemである。

## Authority境界

本書は未承認候補であり、現行conceptを置換しない。L1／L3／L10への分解、plan固有human approval、
canonical merge、Requirement IR admission、main反映後の再読が完了した場合だけv4.0へ昇格する。
それまではv3.1と現行requirementsがcurrent authorityである。

## 製品identity

| Identity | 責務 |
|---|---|
| HELIX | Verified Change Operating System全体 |
| HELIX Harness | V-model、gate、CI、review、security、replayを担うAssurance Kernel |
| HELIX Control Plane | assignment、lane、branch、lease、budget、provider、GitHubを統制する実行中枢 |
| HELIX DevOS | immutable artifact、Module／Bundle、install／upgrade／rollbackを担う配布面 |

この概念分離はrepository、CLI、state directoryの即時renameを許可しない。物理identityの変更は専用migrationと
action-binding approvalへ残す。

## v4.0とする理由

v3.1のV-model、fail-close、Forward収束、Reverse／Recovery、独立reviewは引き続き中核である。
ただし、製品の意味中心はmode／command／個別AI sessionから、authority、responsibility、typed state transition、
evidence substance、release lifecycle、controlled adaptationへ移った。Harnessを製品全体ではなくKernelとして
再配置するためmajor concept updateとする。

## 北極星

人間は価値、要求、体験、不可逆作用の許可、authority candidateの承認を所有する。
HELIXは意図の構造化、責務分解、assignment生成、bounded execution、検証、merge、release、operation、
改善候補の生成を所有する。会話の継続や逐次指示を完了条件にしない。

## 8原則

1. **Human Sovereignty**: request、selection、approval、decision、dispositionを分離し、source、actor、target、scope、revisionへ束縛する。
2. **Contract Compilation**: IntentからRequirement IR、Design、Responsibility、Workflow、Verification、Release Sliceを一方向に導出する。
3. **Responsibility First**: actionable behaviorはexactly-one primary responsibility ownerを持つ。
4. **Bounded Multi-AI Execution**: runtimeをassignment、branch、lease、fence、budget、capability、path境界へ束縛する。
5. **Evidence Closure**: subject identity、実体、oracle、独立review、CI generation、read-afterのexact joinで完了を判定する。
6. **Durable State, Replayable Truth**: semantic authority、execution fact、projection、working contextを混同せず再構築可能にする。
7. **Controlled Adaptation**: learning、audit、environment reconciliation、synthesisは直接authorityを書き換えず候補を既存V-modelへ戻す。
8. **Composable Release**: Behavior ContractからSlice、Module、Bundle、DevOS artifactへ適格性を保ったまま合成する。

## 8 Plane構造

### 1. Sovereignty Plane（主権面）

L0企画、L1要求、L2モック、L3 candidate承認、不可逆作用、architecture／release decisionを扱う。
自然言語発言だけでauthorityを生成しない。

### 2. Change Contract Compiler（変更契約面）

主要要素はRequirement IR、Design Registry、Responsibility Graph、Workflow identity、V-pair、Verification Obligation、
Security Policy、Assignment、Evidence Claim、Release Sliceを型付き契約へコンパイルする。
Issue本文、candidate、compatibility input、unknownからcurrent identityを直接生成しない。

### 3. Control Plane（統制面）

管理対象はqueue、assignment、branch、worktree、base、HEAD、lease、fence、heartbeat、budget、provider capability、
event、checkpoint、PR、review、CI stateを管理する。agent sessionは使い捨て可能であり、論理レーンはstateから再開する。

起動時は大量の文書を順不同で読ませず、authority root、Requirement IR、V-pair、responsibility、assignment、
HEAD、lease、runtime capability、approval境界を解決したEffective Agent Startup Packetを決定的に生成する。

### 4. Execution Plane（実行面）

第一級identityはprovider名ではなくlogical laneとassignmentである。Control／Integration、Execution、
Independent Review等の責務を分離し、provider／modelはHELIX-Benchでtask class、revision、cost、latency、
mutation kill、false positive／negative、reworkを測って割り当てる。provider内部subagentを独立authorityや
独立reviewerへ昇格しない。

### 5. Assurance Kernel（保証中核）

機械検証ではschema、identity、digest、V-pair、PLAN scope、dependency、CI、Git state、security target／sink、DB replay、
release compositionを機械検証する。意味差、隠れた前提、systemic root cause、反例は独立semantic reviewで検査する。
両者をAND条件とし、一方のgreenで他方のfailureを相殺しない。

### 6. Evidence and State Ledger（証拠・状態台帳）

| 対象 | 役割 |
|---|---|
| Requirement／Design／Policy | 意味authority |
| PLAN | atomic change contract |
| Git commit／tree | 成果物の事実 |
| GitHub／event journal | 協調／実行の事実 |
| Receipt | 境界付き証拠claim |
| harness.db | 再構築可能なquery projection |
| Memory | 境界付き連絡／履歴pointer |
| Provider conversation | 破棄可能な作業context |

Evidenceはclaimedからlocated、identity-bound、content-verified、execution-verified、independently-reviewed、
currentへ進み、superseded／expired／retractedを履歴として保持する。

### 7. Release and Lifecycle Plane（配布・運用面）

~~~text
Capability / Behavior Contract
→ Functional Release Slice
→ Release Module
→ Bundle
→ DevOS Artifact
→ Deployment / Operation
~~~

ReleaseとDeploymentを別stateにし、shadow、preview、rc、stable、deprecated、retiredのchannelを管理する。
Deployment後はObservation、Incident、Maintenance、Diagnosis、Rollback、Redeploymentを追跡する。

### 8. Adaptation Plane（適応面）

内部変化はUniversal Improvement Loop、外部技術変化はTechnology Environment Reconciliation、経験は
Responsibility-Centric Learning、高価な意味監査はAgentic Audit、構造再編はSystem／Future Synthesisが扱う。
いずれもproposal、evidence、deltaだけを生成し、Requirement Re-entryから既存workflowへ戻す。

Agentic Auditはdeterministic、changed-responsibility、scoped、full-systemのtierに分ける。
full auditはrisk、trigger、budget、cooldown、release／incident境界でadmitし、毎PR／毎晩の無条件実行にしない。

## 正規情報flow

~~~text
人の意図／運用観測／外部変化
→ 型付き受付
→ Requirement／Design候補
→ 必要箇所でのhuman approval
→ Requirement IR／Design Registry
→ 責務／Workflow／V-pair／risk
→ Assignment＋Startup Packet
→ 境界付き実行
→ 成果物＋test＋Evidence Claim＋PR
→ CI＋Doctor＋Security＋独立review
→ merge＋release適格性確認
→ deployment＋observation
→ 改善機構（UIL／TER／Learning／Synthesis）
→ 改善候補／delta／Requirement Re-entry
~~~

## System invariant（不変条件）

1. canonical authorityより先にruntime behaviorをcurrent化しない。
2. actionable behavior、finding、learning asset、release pathはexactly-one primary ownerを持つ。
3. provenanceのないhuman authority claimを生成しない。
4. memory、session summary、AI interpretationからapproval／decisionを作らない。
5. authority root、assignment、HEAD、lane、capabilityが未解決ならworkerを起動しない。
6. scope、branch、lease、budget、allowed pathのないworkerを実行しない。
7. author runtimeの内部reviewを独立reviewへ昇格しない。
8. wrong HEAD／generation／projectionのreviewを再利用しない。
9. marker、path存在、digest形式、自己申告だけでevidenceを成立させない。
10. gateが対象を検査していない状態をpassにしない。
11. unknownをnone、unchanged、healthy、greenへ変換しない。
12. compatibility greenでcurrent failureを相殺しない。
13. 同じauthority／eventから同じprojectionを再構築する。
14. 誤ったreceipt／finding／memoryはtyped correction／supersessionで正す。
15. adaptation subsystemはauthorityへ直接writeしない。
16. 単一episodeだけで一般規則やmechanismへ昇格しない。
17. 高価な監査をadmissionなしで起動しない。
18. 未適格Sliceをstable Bundleへ暗黙包含しない。
19. replacement evidenceなしでcapabilityをretireしない。
20. Release成功をDeployment成功やIncident closureと同一視しない。

## v3.1資産の移行

L1-L12、正規V-pair、Forward、Reverse、Recovery、Refactor、fail-close、独立review、Node／Python境界、
GitHub／CI／DB接続、compatibility input-onlyはKernelへ継承する。

旧9-mode、signal-to-mode、広義drive、L0-L14、Bun、provider固定topology、文書read順依存、
memory中心continuation、declaration-only evidenceはcurrent identityとして再出力せず、必要な履歴だけを
compatibility／archiveへ隔離する。

## 非目標

HELIXはprompt集、persona集、multi-agent chat room、全会話保存製品、Issueを意味正本にするproject manager、
DBを意味正本にするworkflow engine、one-shot generator、latest model自動追従器ではない。
完全自動を理由にhuman authorityをAIへ移さない。

## 昇格条件

1. v3.1との差分をL1 requestへmaterializeする。
2. 原則をL3 requirement familyへ分割する。
3. L10 positive／negative oracleを作る。
4. current ownerとの重複、矛盾、未実装主張を検査する。
5. plan固有human approvalをtyped provenanceへ束縛する。
6. canonical sourceをmergeし、Requirement IRへadmitする。
7. governance index、README、adapter、startup packetへ生成または一方向投影する。
8. main read-afterとconsumer smokeを行う。
9. v3.1をcompatibility／historicalへ降格する。

Concept version 4.0はproduct semantic versionであり、package、Module、BundleのSemVerを一括変更しない。
