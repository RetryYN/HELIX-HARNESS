---
document_id: HELIX-CONCEPT-V4.1
concept_version: "4.1-candidate"
status: draft_candidate
authority_status: awaiting_human_approval
derived_from:
  - docs/governance/candidates/helix-concept-v4.0.md
  - docs/governance/product-governance-boundary-2026-09-14.md
supersedes_after_approval: docs/governance/candidates/helix-concept-v4.0.md
canonical_promotion: pending
approval_scope: exact_body_revision_pending
approved_body_sha256: pending_human_decision
behavior_contract_id: HELIX-CONCEPT-V4.1
evidence_baseline:
  - docs/governance/audits/l2-requirements/concept-v4.1-approval-readiness-audit.md
  - docs/governance/audits/l2-requirements/concept-v4.1-claude-review-96171b9ba.md
---

# HELIX Concept v4.1候補

## 一文定義

HELIXは、人間が定めたConcept・企画・要求を起点に、HARNESSの開発契約をHELIX-OSが対象プロジェクトへ適用し、
複数のAI Workerによる変更を検証可能な証拠で閉じ、運用結果を次の上流変更候補へ戻す超個人開発システムである。

## 目的

人は価値、製品境界、要求、体験、L3要件承認、不可逆作用の許可を所有する。
HELIXは、承認された範囲を責務単位へ分解し、実行・検証・統合・運用・改善候補化を継続する。
会話、Issue、PR、CIの状態を要求の意味や承認の代替にしない。

## 製品と管理対象

| Identity | 位置づけ | 責務 |
|---|---|---|
| HELIX | プロジェクト群と全体構想 | HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS等を接続し、上流から運用・改善までを閉じる |
| HELIX-HARNESS | 外部へ提供する製品 | V-model、L1–L12、正規pair、工程、要求・設計・検証契約、進行・完了条件、consumer package |
| HELIX-OS | HELIX内部の管理・統制機構 | authority、Worker、assignment、state、log、CI、review、learning、improvement、distribution operation |
| HELIX-Web | HELIX-OSが管理する個別製品 | Connector型AI開発SaaSとして、Web利用者へダッシュボード、操作、進行表示、サービス体験を提供する |
| HELIX-Web-OS | HELIX-Web展開時にHELIX-OSの外へ構成する運転基盤 | tenant、Connector、job、service state、evidence projection、Webサービスの配備・監視・復旧を担う |

HARNESSはOS内部のAssurance Kernelだけではなく、外部利用者へ提供する開発基盤全体である。
Assurance KernelはHARNESSの構成要素とする。Control Plane、Execution、Ledger、AdaptationはHELIX-OSのcomponentとする。
旧`HELIX DevOS`を独立した提供製品identityにせず、package内容とconsumer利用条件をHARNESS、生成・配布・promotion・
rollback・監視の実行統制をHELIX-OSへ分ける。

## authority境界

| 対象 | authority | 非authority |
|---|---|---|
| Concept・企画・要求・要件 | 対象別repo-owned文書、指定JSON、承認revision | Issue、PR、Projects、DB read model、会話要約 |
| 開発工程・検証条件 | HELIX-HARNESSのversioned contract | 個別Workerの手順、CIサービス固有設定 |
| 実行・状態・証拠 | HELIX-OSのevent、assignment、receipt、commit/tree | AI自己申告、画面表示、古いsession |
| 個別製品の価値・体験 | 個別製品のConcept／L1／L2と承認revision | OS内部管理UI、HARNESS実装詳細 |
| 改善 | 出典・scope・反証条件を持つproposalと採否記録 | 学習結果、finding、外部変化からの直接write |

GitHubは作業、協調、CI、review、統合証拠のsurfaceである。Issue close、PR merge、label、board列、CI greenから、
要求の追加・削除・採否・合意・受入・退役を生成しない。

## 9原則

1. **Human Sovereignty**: request、selection、approval、decision、dispositionを分け、actor、target、scope、revisionへ束縛する。
2. **Product Separation**: HARNESSの工程契約、HELIX-OSの実行統制、個別製品の利用価値を別authorityにする。
3. **Contract Compilation**: ConceptからL1、L2、L3、設計、検証、実装、運用へ一方向に導出する。
4. **Responsibility First**: actionable behaviorはexactly-one primary responsibility ownerを持つ。
5. **Bounded Multi-AI Execution**: Workerをassignment、branch、lease、budget、capability、path、期限へ束縛する。
6. **Evidence Closure**: subject、revision、実体、oracle、独立review、実行世代、read-afterのjoinで完了を判定する。
7. **Durable and Replayable**: semantic authority、execution fact、projection、working contextを分け、再構築可能にする。
8. **Controlled Adaptation**: learning、audit、environment reconciliation、synthesisは候補を上流へ戻し、authorityを直接変更しない。
9. **Composable Release**: 検証済みの機能単位から利用目的に合う提供構成とHARNESS artifactへ適格性を保って合成し、releaseとdeploymentを分ける。

v4.1はProduct Separationの追加だけではなく、製品境界に合わせて既存原則の意味も改訂する。

| v4.0原則 | v4.1での扱い | 改訂理由 |
|---|---|---|
| Human Sovereignty | 保持 | 人間の意味判断をactor、target、scope、revisionへ束縛する |
| Contract Compilation | 改訂 | `Intent→Requirement IR→Release Slice`という実現系列を、Concept→対象別L1→L2→L3→設計・検証・実装・運用のauthority順序へ変更する。Requirement IRは承認済み要求の機械projectionとしてL3以降に置く |
| Responsibility First | 保持 | actionable behaviorのprimary ownerを一意にする |
| Bounded Multi-AI Execution | 保持・対象明確化 | 実行統制をHELIX-OSへ帰属させる |
| Evidence Closure | 保持 | 対象revisionと反証可能な証拠joinを要求する |
| Durable State／Replayable Truth | 改訂 | semantic authority、実行事実、projection、working contextを分離し、HELIX-OSの再構築責務へ置く |
| Controlled Adaptation | 保持・対象明確化 | 改善候補の生成はOS、採否と要求変更は対象上流authorityへ分ける |
| Composable Release | 改訂 | Slice／Module／Bundle／DevOS artifactの旧identityを外し、承認済み機能と適格性からHARNESS提供構成を再導出する |
| Product Separation | 追加 | HARNESS、HELIX-OS、個別製品の要求ownerを分ける |

旧`Slice`／`Module`／`Bundle`はComposable Releaseを説明したsource vocabularyであり、v4.1の承認だけで新世代の
identity、schema、階層、個数、channelを固定しない。必要な構成単位は対象別L1／L2の承認後に再導出する。

## 上流から運用までの構造

```text
人間のConcept・企画・要求
  → 対象別L1
  → 対象別L2＋prototype／非UI適用性＋合意
  → 対象別L3＋L10
  → HARNESSの設計・検証契約
  → HELIX-OSのassignment＋bounded execution
  → implementation＋test＋evidence＋review
  → L11利用者受入＋L12運用評価
  → release／deployment／observation
  → 改善proposal
  → 影響する上流へのre-entry
```

正規pairは`L1↔L12`、`L2↔L11`、`L3↔L10`、`L4↔L9`、`L5↔L8`、`L6↔L7`とする。
L0 charterは層外authority anchorである。上流変更時は影響する下流をstale化し、旧下流のgreenで相殺しない。

## HARNESS Concept

HARNESSは、対象プロダクトの言語、provider、CI製品、画面方式に依存せず、次を提供する。

- Concept／企画／要求／要件／設計／実装／検証の層と正規pair。
- Full V、Production Scrum、V設計＋Scrum実装Hybrid、および別軸Discovery／PoCの関係。
- 要求形成、prototype／非UI適用性、合意、freeze、差戻し、再開、完了の条件。
- trace、impact、verification obligation、failure、evidence、利用者受入、運用評価の契約。
- consumerが構成、版、依存、導入、更新、復旧条件を確認できる配布package。

HARNESSはWorker pool、HELIX内部memory、運用DB、CI運転、学習履歴を外部利用者の暗黙必須構成にしない。

## Version 1とHELIX-Web展開境界

Version 1で完成させる対象はHELIX-HARNESS製品群である。その完成には、検証フェーズで性質の異なる複数の
プロダクトを実際に開発し、HELIX自身のプロジェクトにもHARNESSを適用して、要求から受入・運用評価までが
成立することの確認を含む。サンプル生成、文書整合、HARNESS単体の成功だけではVersion 1完成としない。

HELIX-Webの展開は、そのVersion 1完成と、Webが利用するHARNESS構成の適格性を確認した後に開始する。
HELIX-Web自体の実装・公開完了をHARNESS Version 1の完成分母へ含めず、HARNESS未完成のままWebを
展開可能とも扱わない。

展開後のHELIX-Webは、許可された利用者環境へConnectorで接続し、開発jobの進行、状態、成果、証拠、
停止・再開をダッシュボードから確認できるサービスとする。そのservice runtimeはHELIX-OSの外に構成する
HELIX-Web-OSが運転する。HELIX-OSはHELIX-Web／HELIX-Web-OSを開発・改善するprojectを管理するが、
tenant、Connector job、service credential、service stateの運転authorityを自身へ吸収しない。
HELIX-Web-OSは許可されたservice log・telemetry・incident・利用結果を、出典、tenant／data scope、目的、
revision、時点、欠測を保ってHELIX-OSへ渡す。HELIX-OSはそれを他の開発・運用証拠と統合して改善候補を作り、
人間の採否と対象別上流変更を経てWeb／Web-OSへ戻す。ログ転送だけで要求や学習同意を変更しない。

## HELIX-OS Concept

HELIX-OSはHARNESSを含むHELIXプロジェクト群に対し、次を担う。

- 対象別authority、revision、関係、変更影響、未解決状態の管理。
- Worker、assignment、branch、lease、budget、provider capability、停止・復旧の統制。
- event、log、evidence、review、CI、release、deployment、observationの実行と保存。
- requirement／design／verification／runtime projectionの整合と再構築。
- finding、失敗、経験、外部変化から改善proposalを作り、対象上流へ戻す。
- HARNESS packageの生成・配布・promotion・rollback・monitoringの運転。

OSはHARNESSの工程規則を適用する。運用実績や学習結果からHARNESSまたは個別製品の要求を直接変更しない。

## 新世代への再構築

本Concept revision以降を新世代とする。新世代は現行runtime、CI、AI向け文書、DB projection、CLI、hook、adapter、
workflow、旧要求配置を改修して延命する系列ではない。Conceptから対象別L1、L2／L11、L3／L10、下流pairへ順に
責務と契約を再導出し、その結果として必要な実装を新規構成する。

現行資産は、要求atom、behavior、設計判断、oracle、失敗事例、consumer、運用証拠を採取するreference sourceである。
新世代のbaseline、合格oracle、parity目標、runtime fallbackにはしない。採取元、digest、採否、移管先、非採用理由、
historical valueを記録した後、current startup、runtime、CI、AI read set、正本検索から外した非実行archiveへ移す。

新世代CIはHARNESSの検証契約と対象製品要求からHELIX-OSが組み立てる。旧CIを実行・比較せず、旧workflowやjob集合への
適合を要求しない。AIが読む文書も承認済み上流から生成し、HARNESS工程契約、OS実行context、個別製品要求を分離する。
現行`AGENTS.md`、`CLAUDE.md`、prompt、adapterの文面を新世代authorityとして複製しない。

上流要求整理が完了する前に、新世代の実装、旧資産の物理移動・削除、runtime切替、CI起動、PR admissionを行わない。
要求整理中の成果はcandidate、inventory、crosswalk、適用待ち差分として保持する。

要求整理期間中の意味判定は、対象revisionを固定した文書差分検査、source IDの欠落・重複検査、参照整合検査、
独立した上流意味review、人間decisionで行う。これらの静的結果は候補の整合性証拠であり、実装、L11受入、
運用成立、canonical promotionを証明しない。旧CI／旧gateを実行せず、新世代CIが未構築であることを理由に
旧CIへfallbackしない。remote branchへの同期も意味承認を成立させない。

## 個別製品Concept

個別製品は自身の利用者、価値、要求、prototype、受入、運用結果を所有する。
HELIX-OSは個別製品とその運転基盤を開発・改善する進行と証拠を管理し、HARNESSは開発・検証条件を提供する。
HELIX-Webの要求をOS管理UIやHARNESS機能へ混在させない。

## 既存資産の再導出

既存資産はファイル単位で一括移植・削除しない。behavior、要求、設計、oracle、runtime、consumerへ分解し、
HARNESS、HELIX-OS、個別製品のexact targetへ帰属させる。各資産はreuse、amend、split、replace、retire、archive、
reject、unresolvedのいずれかを持つ。

自動走行へ入れる前に、上位revision、responsibility owner、scope、pair、acceptance、停止・復旧条件を解決する。
未解決資産は実装の有無にかかわらず上流再導出待ちとする。新世代要求oracle、consumer切替、rollback、read-afterが
揃うまで旧資産をcurrent pathから外さず、揃った後は非実行archiveへ移す。旧資産との実行parityを要求しない。

## System invariant

1. canonical authorityより先にruntime behaviorをcurrent化しない。
2. HARNESS、HELIX-OS、個別製品の要求を同じownerへ畳み込まない。
3. Issue、PR、CI、DB、memory、sessionから要求の意味や人間approvalを生成しない。
4. L2を飛ばしてL1からL3へ要求を接続しない。
5. unknownをnone、unchanged、healthy、greenへ変換しない。
6. compatibility greenでcurrent failureを相殺しない。
7. scope、HEAD、assignment、lease、budget、allowed pathのないWorkerを実行しない。
8. author runtimeの自己reviewを独立reviewへ昇格しない。
9. requirement、implementation、verification、acceptance、operationを単一のdoneへ畳み込まない。
10. adaptation subsystemはauthorityへ直接writeしない。
11. 未適格な機能をHARNESS packageまたは個別製品releaseへ暗黙包含しない。
12. replacement evidenceなしで旧capabilityをretireしない。
13. 旧CI、旧AI文書、旧runtimeを新世代のbaseline、parity oracle、fallbackとして再利用しない。

## 非目標

- HELIX-OSを外部提供するHARNESS製品として扱うこと。
- HARNESSをOS内部のgate実装だけへ縮退させること。
- HELIX-WebをOSの管理画面へ還元すること。
- GitHubを要求意味・採否・合意・受入の正本にすること。
- 既存資産を古さ、path、Issue状態、未参照だけで一括削除すること。
- AIの自動走行を理由に人間の上流authorityや不可逆作用の許可を移すこと。

## 昇格条件

1. 本候補の製品identityと責務境界を人間が承認する。
2. L0 charterと対象別L1へ差分を投影する。
3. HARNESS、HELIX-OS、HELIX-WebのL2／L11へ親子関係を接続する。
4. 対象別L3／L10、Requirement IR、下流impactを確定する。
5. v3.1／v4.0のsupersede、compatibility、archive、rollbackを記録する。
6. canonicalization transactionとmain read-afterを行う。

本候補はU1の起草成果であり、上記承認・接続・正本化・runtime移行を完了させない。
