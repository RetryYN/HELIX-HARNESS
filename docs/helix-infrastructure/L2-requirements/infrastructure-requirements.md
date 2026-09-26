---
title: "HELIX-INFRASTRUCTURE 機能単位要求候補"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: requirement
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
created: 2026-09-27
updated: 2026-09-27
pair_artifact: docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md
parent_l1_candidate: docs/helix-infrastructure/L1-planning/infrastructure-intent.md
---

# HELIX-INFRASTRUCTURE 機能単位要求候補

本書は[HELIX-INFRASTRUCTURE L1企画案](../L1-planning/infrastructure-intent.md)の機能単位・接続・構成体の要求候補であり、Concept/L1の意味変更、採択、L3承認、実装・実行許可を行わない。対象は**HELIX本体自身の実行環境の資源と状態**であり、HELIX-WEB-OSが持つ顧客tenant、job、credential、service state、deploymentを含めない。HELIX-INFRASTRUCTUREは非製品の機構である。

親入力は、draft base `719e05d579584ac961256bdb8b11f8fc7b643a14`上の[Concept](../../concept/helix-concept.md)（SHA-256 `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78`）、[L1企画案](../L1-planning/infrastructure-intent.md)（SHA-256 `1673cf1333c762b817e1031cb610de90b6e967f7c2d851ab2a4b71e4959ebc37`）、[PO原文snapshot](../sources/runtime-infrastructure-l1-po-original-2026-09-26.md)（SHA-256 `a76dfdd2106f6aa5b0dc94c65a2cfbc64d2a57298bba7dd07f5b24d1b1589522`）、[Concept配置・版決定record](../../governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md)（SHA-256 `59c45ce845c674866703a595159fff3df32d077f1c36dca23858499b3480bf2f`）である。親L1の対象revisionは未確認であり、これらのbytesを承認済みに扱わない。

## 境界と版

- 1.0の`version_target`は、POが明示した「1.0で最低限成立させる範囲」の18項目だけである。高度な自動拡張、Multi-cloud、完全自動Failover、および18項目に当たらないL1条件は`version_target: 1.0より後（版は未定）`として保全する。後の版の機能を1.0の単体・接続・構成体の依存にしない。
- 共通の機能pack契約はHARNESS-L2-010/011が所有し、本書はその契約をINFRASTRUCTUREの資源状態・接続へ適用する。共通lifecycleを別に定義しない。機能identityごとに、実体化時は独立したpack identity、契約version、成果物version、依存identity/version、適用対象と収載/除外、検証範囲、互換範囲、更新・復旧先を対応づける。`version_target`は実体版・契約版・release承認ではない。未確定の数値閾値は作らず、値を決める上流契約が無い場合はunknownとして停止する。
- 変更と資源状態の正本は別である。HELIX-HARNESS-COREはHELIX固有設計の意味正本、HELIX-INFRASTRUCTUREは設計から導いたdeployment targetとobserved actual state、HELIX-OSはwork/change state、HELIX-SECURITYはauthority/隔離/credential、Workerは実操作、INTELLIGENCEは配置等の判断案、LABOは効果・failure・費用・復旧の評価を持つ。同じstateを二重に正本化しない。
- 交換・更新ではversion/interface/依存/verification scopeを照合する。不一致・unknownを適合と推定せず、影響connectionをstaleにし、該当範囲を再検証する。失敗時は対象を直前の適格な復旧先へ戻し、途中状態・未完義務・失敗根拠を維持する。

## 1.0機能単位（単体）

### HELIXINFRASTRUCTURE-L2-001 Runtime Resource Topologyと環境

- **親L1**：`HELIXINFRASTRUCTURE-L1-001`、`HELIXINFRASTRUCTURE-L1-004`、`HELIXINFRASTRUCTURE-L1-005`、`HELIXINFRASTRUCTURE-L1-006`、`HELIXINFRASTRUCTURE-L1-007`、`HELIXINFRASTRUCTURE-L1-009`、`HELIXINFRASTRUCTURE-L1-022`。
- **入力**：HELIX-OS、BRAIN、LABO、INTELLIGENCE、SECURITY、CONNECT、Worker/Model Runtime、database、queue、artifact/evidence store、log/metric infrastructure等のresource identity、role、environment、location、version、dependency、lifecycle、network path、state/storage class、compute/model runtime情報。
- **提供**：HELIX本体の実行資源と関係の識別・参照、および配置環境・実行版の可観測なresource topology。
- **保証**：各resourceについてidentity/role/environment/location/version/dependencies/lifecycle stateを辿れる。development/verification/staging/production/recovery等の環境は独立identityであり、resource/config/network/credential scope/data/version/authorityを分離し、別環境の成功を本番成立の証拠にしない。HELIX-CONNECTの論理接続とphysical/runtime communication pathを別にし、network pathはsource/destination/protocol/endpoint/direction/purpose/security boundary/dependencyで参照する。永続/一時stateを分けowner/durability/backup/retention/environment/confidentiality/recovery要求を持たせる。Model/Worker資源・実行状態を記録するが、model能力の評価、Worker ticket/作業状態、security policyは所有しない。旧Runner/Sandboxの実行能力は2026-09-26 PO decisionに従いWorkerとして参照する。
- **単独成立の依存・版**：承認対象となるHELIX-HARNESS-CORE設計の参照と、resource/environment/interface identity。`version_target: 1.0`。
- **失敗時の戻し先・未完義務**：resource/owner/environment/location/version/dependencyが不明ならunknownのままresource sourceまたは設計ownerへ返す。読み取り不能・部分更新時は以前のobservationをcurrentと見なさず、未完の観測範囲を残す。
- **束ねるL1/PO条件**：HRI-L1-001/004/005/006/007/009/022。最低範囲1 (Resource identity)、2 (Topology)、3 (Environment)、6 (Compute/Network/Storage)、7 (Model/Worker Runtime)、13 (Deployment version)。

### HELIXINFRASTRUCTURE-L2-002 Desired Target・Actual State・Drift

- **親L1**：`HELIXINFRASTRUCTURE-L1-002`、`HELIXINFRASTRUCTURE-L1-003`。
- **入力**：設計の意味正本から受け取るapproved configuration、deployment target、resource observationとそのsource/revision。
- **提供**：approved design、deployment target、observed actual stateの分離および差異の提示。
- **保証**：resource missing、unexpected resource、version/config/network/permission/capacity drift、runtime replacement、unknown dependencyを比較でき、差異を自動で正しい変更・設計承認とみなさない。actual stateから要求/設計を書き換えない。
- **単独成立の依存・版**：L2-001、HELIX-HARNESS-COREの承認済み設計参照、source-qualified actual observation。`version_target: 1.0`。
- **失敗時の戻し先・未完義務**：design/target/observationが欠落・stale・互換不明ならdrift結果を確定せず、そのsource ownerへ戻す。未確認範囲を保持し、修正実行はOS ticket/SECURITY authority/Worker接続を経る。
- **束ねるL1/PO条件**：HRI-L1-002/003。最低範囲4 (Desired/Actual separation)、5 (Drift)。

### HELIXINFRASTRUCTURE-L2-003 Compute・Network・Storage・Model資源と容量

- **親L1**：`HELIXINFRASTRUCTURE-L1-005`、`HELIXINFRASTRUCTURE-L1-006`、`HELIXINFRASTRUCTURE-L1-007`、`HELIXINFRASTRUCTURE-L1-009`、`HELIXINFRASTRUCTURE-L1-010`、`HELIXINFRASTRUCTURE-L1-011`。
- **入力**：L2-001の資源snapshot、CPU/RAM/GPU/VRAM/storage/network/runtime/model requirement、capacity/utilization/queue/concurrency/saturation/rejection/backpressureの観測、起動要求。
- **提供**：共通資源モデル、利用可能性・飽和の観測、および新Job/Worker/Model/CIを起動するための資源可用性情報。
- **保証**：local machine、VPS、dedicated server、cloud VM、container runtime、GPU node、Worker nodeをcommon resource modelで参照し、CPU/RAM/GPU/VRAM/storage/runtime/capacity/health/availabilityを記録する。Network pathのsource/destination/protocol/endpoint/direction/purpose/security boundary/dependency、およびpersistent/temporary database, evidence/artifact store, queue, cache, log/metric store, model storeのowner/durability/backup/retention/environment/confidentiality/recovery属性はL2-001/003で追跡する。external model API/local LLM/GPU server/distributed model server/tuned modelのmodel/server/version/GPU-memory needs/concurrency/latency/capacity/health/endpointをruntime resourceとして記録するが、知能評価はINTELLIGENCE/LABOへ分ける。起動前に容量を確認し、不足時はqueue/delay、低費用または別node候補、reject、人へのescalationに情報を渡す。無制限なJob追加を成立扱いせず、配置・費用をInfrastructureが採否しない。
- **単独成立の依存・版**：L2-001、資源/容量の観測元、OS/INTELLIGENCEへのcapacity/decision interface。`version_target: 1.0`。L1で記された高度なautoscalingは後続版であり依存しない。
- **失敗時の戻し先・未完義務**：観測値不足・古い値・計測不可・capacity unknownでは安全に受入可能と返さず、起動要求をOS/INTELLIGENCEへ戻す。queue待ち等の未完状態とresource snapshotを保持する。
- **束ねるL1/PO条件**：HRI-L1-005/006/007/009/010/011。最低範囲6 (Compute/Network/Storage)、7 (Model/Worker Runtime)、8 (Capacity)。

### HELIXINFRASTRUCTURE-L2-004 Runtime ObservabilityとIncident State

- **親L1**：`HELIXINFRASTRUCTURE-L1-014`、`HELIXINFRASTRUCTURE-L1-016`。
- **入力**：health/metric/log/resource usage/dependency/queue/error/latency/deployment revision/recovery state、異常観測と参照要求。
- **提供**：HELIX本体Infrastructureの最低限のobservabilityと通常/劣化/利用不能/容量枯渇/依存失敗/data・network unavailable/security isolation/unknownを区別したruntime/incident state。
- **保証**：観測不能をhealthyへ変換しない。incidentの意味/severityは承認済み要求を参照し、INFRASTRUCTUREが独自定義しない。観測結果はsourceと対象revisionを保つ。
- **単独成立の依存・版**：L2-001、対象の観測sourceと既存要求上のincident meaning。`version_target: 1.0`。より細かなfreshness/collector-confidence stateはHELIXINFRASTRUCTURE-L2-019 (`version_target: 1.0より後（版は未定）`)へ保全し、1.0の受入条件として増やさない。
- **失敗時の戻し先・未完義務**：telemetry欠測・collector failure・source不明ならunknown/unobservedとして観測元へ戻し、原因を推測確定しない。未確認resourceとincident評価待ちを維持する。
- **束ねるL1/PO条件**：HRI-L1-014/016。最低範囲9 (Observability)、10 (Incident state)。

### HELIXINFRASTRUCTURE-L2-005 Backup・Restore・Rollback

- **親L1**：`HELIXINFRASTRUCTURE-L1-017`、`HELIXINFRASTRUCTURE-L1-018`、`HELIXINFRASTRUCTURE-L1-019`。
- **入力**：重要state、backup target/source revision/time/completeness/location/integrity/expiry、configuration/artifact/dependency/data compatibility、復旧procedureと検証結果。
- **提供**：backup実行state、restore実行結果、適格なrollback targetとrecovery procedureの独立記録。
- **保証**：backup設定とbackup成功、backup存在とrestore可能、rollbackとincident closureを分ける。restoreでintegrity、dependency reconnection、startup、verificationを確認する。rollback先にはInfrastructure版・設定・artifact・依存・data互換・procedureを結ぶ。
- **単独成立の依存・版**：L2-001/002、対象stateのowner/retention/recovery要求、独立検証できるrestore environment。`version_target: 1.0`。故障単位を用いる自動failoverは依存しない。
- **失敗時の戻し先・未完義務**：backup不完全、restore不成立、互換不明、rollback target不明時は成功stateを発行せず、復旧設計owner/OSへ戻す。変更前の適格state、失敗記録、未完復旧・検証義務を保持する。
- **束ねるL1/PO条件**：HRI-L1-017/018/019。最低範囲11 (Backup/Restore)、12 (Rollback)。

### HELIXINFRASTRUCTURE-L2-006 HELIX独立Bootstrap・Recovery Path

- **親L1**：`HELIXINFRASTRUCTURE-L1-020`、`HELIXINFRASTRUCTURE-L1-021`。
- **入力**：HELIX本体/OS等が停止した状況、点検・health確認・service停止・rollback・recovery起動に必要な最低資源、SECURITYの別authority。
- **提供**：停止中HELIXに依存せず起動・点検・復旧できる範囲、および通常Control Plane外の限定recovery path。
- **保証**：HELIX-OS停止時にHELIX-OS自身へ修復を依頼する循環を作らない。Out-of-band pathは通常の万能運用経路にならず、SECURITYの別authorityを受けて限定操作する。
- **単独成立の依存・版**：L2-005と、独立して使える起動/復旧resourceおよびSECURITY authority。`version_target: 1.0`。完全自動failoverは含まない。
- **失敗時の戻し先・未完義務**：HELIX自身の制御面に依存する、またはSECURITY authorityが不明な場合は復旧成功とせず停止する。残る復旧操作・制約・最終適格revisionを記録する。
- **束ねるL1/PO条件**：HRI-L1-020/021。最低範囲17 (Bootstrap/Out-of-Band Recovery)。

### HELIXINFRASTRUCTURE-L2-007 Runtime Rebuildability

- **親L1**：`HELIXINFRASTRUCTURE-L1-038`。
- **入力**：approved design参照、configuration、artifact、dependency、data backup、version、deployment evidence。
- **提供**：Infrastructure state喪失後に、対象の必要な実行環境を再構築できる情報と再構築の検証結果。
- **保証**：必要な復旧情報を特定machine内だけに閉じ込めず、実再構築、依存再接続、起動、検証を記録する。再構築可能性は単なるbackup存在・文書存在と別に判定する。
- **単独成立の依存・版**：L2-001/005/006、復旧対象となるapproved designとartifact/data evidence。`version_target: 1.0`。
- **失敗時の戻し先・未完義務**：source/設定/依存/dataが欠ける場合、再構築成功とせず欠けたownerへ戻す。復元済み部分と未完の依存・verificationを引き継ぐ。
- **束ねるL1/PO条件**：HRI-L1-038。最低範囲18 (Rebuildability)。

## 1.0接続要求

### HELIXINFRASTRUCTURE-L2-008 HARNESS-CORE設計からDeployment Targetへの接続

- **親L1**：`HELIXINFRASTRUCTURE-L1-002`。機構間の接続はL1「接続の要求と構成体の要求として外へ出すもの」のCORE→INFRASTRUCTURE行に従う。
- **入力**：HELIX-HARNESS-COREが所有するapproved Infrastructure design exact revisionとscope。
- **提供**：設計から導いたdeployment target、およびtargetとobserved actual stateの比較入力。
- **保証**：INFRASTRUCTUREはCORE設計の意味を所有・変更せず、actual stateから要求/設計を直接書き換えない。
- **単独成立の依存・版**：L2-001/002、versioned design interface。`version_target: 1.0`。
- **失敗時の戻し先・未完義務**：design revision/contract不一致または未承認はtarget確定に進めずCORE/上流のdesign ownerへ返し、比較保留を維持する。
- **束ねる条件**：HRI-L1-002、および1.0項目4 (Design/Deployment Target/Actualの分離)。

### HELIXINFRASTRUCTURE-L2-009 OS Runtime Resource StateとWork/Change Stateの接続

- **親L1**：`HELIXINFRASTRUCTURE-L1-001`、`HELIXINFRASTRUCTURE-L1-002`、`HELIXINFRASTRUCTURE-L1-003`、`HELIXINFRASTRUCTURE-L1-014`、`HELIXINFRASTRUCTURE-L1-022`、`HELIXOS-L1-005`、`HELIXOS-L1-007`、`HELIXOS-L1-008`。
- **入力**：OS ticket/change identity、対象資源・target、revision、操作開始/停止/再開・evidence参照、およびInfrastructureのresource topology/actual state/deployment revision/recovery state。
- **提供**：OSの作業・変更stateとInfrastructureのresource-stateを関連づけたversioned view。必要な場合は、HELIX自身の段階releaseの組成・更新・切戻しにも両正本を接続する。
- **保証**：OSは何を変更するか、ticket/actor/evidence/stop-resumeを持ち、Infrastructureは何が存在しどこでどの版・状態かを持つ。同じstateを二重正本にせず、HELIXOS-L2-014のstage release IDとInfrastructureのruntime revisionを同一視しない。最小の接続にHRI-L1-015のepisode-to-LABO correlation（後続版）を必須化しない。
- **単独成立の依存・版**：L2-001/002/004/006、OSのversioned Work/Change interface/evidence。通常のresource-state接続はHELIX全体のstage release構成体に依存せず成立する。HELIX自身のstage releaseへ組み込む場合に限り、そのstageの構成・更新・復旧はHELIXOS-L2-014の契約に従い、stage IDとruntime revisionを区別する。`version_target: 1.0`。
- **失敗時の戻し先・未完義務**：ticket/target/runtime revisionや状態の対応が不明ならresource changeを成立扱いせず、OSまたはInfrastructureの該当ownerへ返す。stage pack利用時は段階識別も記録し、現在稼働版、rollback先、未完操作を引き継ぐ。
- **束ねる条件**：原文minimum item 15 (OS connection)、HRI-L1-001/002/014/022。InfrastructureをHELIX自身の段階releaseへ収載する場合に限りHELIXOS-L2-014のstage構成・更新・復旧・同版構成証拠条件を参照する。通常のOS resource-state connectionはstage release構成体に依存しない。

## 1.0操作構成体

### HELIXINFRASTRUCTURE-L2-010 SECURITY authority・Worker操作の構成体

- **親L1**：`HELIXINFRASTRUCTURE-L1-021`、`HELIXINFRASTRUCTURE-L1-028`、`HELIXINFRASTRUCTURE-L1-029`、`HELIXINFRASTRUCTURE-L1-039`。
- **入力**：INFRASTRUCTUREの限定操作要求（target/project/action/revision/expiry）、SECURITYのauthority/credential/network/isolation/egress条件、OS assignment/ticket、Worker実行結果。
- **提供**：SECURITYで認可された範囲だけをWorkerが実行し、操作対象、scope、before/after resource state、結果/evidenceへ接続する実操作経路。
- **保証**：INFRASTRUCTUREがsecurity policyや自身のauthorityを作らず、credential valueをresource normal state、backup、snapshotへ無条件に保存しない。Workerは無制限Shell主体にならない。実操作はOS/SECURITY/Workerの役割を越えずに停止・回収できる。
- **単独成立の依存・版**：L2-001/005/006/009、SECURITY authorityとWorker実行契約。`version_target: 1.0`。
- **失敗時の戻し先・未完義務**：authority/credential scope/target/revision不一致なら実行前に拒否しSECURITY/OSへ返す。部分実行は成功にせず、実際の状態と未完操作、復旧/rollback obligationsを記録する。
- **束ねる条件**：原文minimum item 14 (SECURITY connection)、16 (Worker execution)、HRI-L1-021/028/029/039。

## 1.0構成体

### HELIXINFRASTRUCTURE-L2-011 HELIX自身のInfrastructure 1.0構成体

- **親L1**：`HELIXINFRASTRUCTURE-L1-001`、`HELIXINFRASTRUCTURE-L1-002`、`HELIXINFRASTRUCTURE-L1-003`、`HELIXINFRASTRUCTURE-L1-004`、`HELIXINFRASTRUCTURE-L1-005`、`HELIXINFRASTRUCTURE-L1-006`、`HELIXINFRASTRUCTURE-L1-007`、`HELIXINFRASTRUCTURE-L1-009`、`HELIXINFRASTRUCTURE-L1-010`、`HELIXINFRASTRUCTURE-L1-011`、`HELIXINFRASTRUCTURE-L1-014`、`HELIXINFRASTRUCTURE-L1-016`、`HELIXINFRASTRUCTURE-L1-017`、`HELIXINFRASTRUCTURE-L1-018`、`HELIXINFRASTRUCTURE-L1-019`、`HELIXINFRASTRUCTURE-L1-020`、`HELIXINFRASTRUCTURE-L1-021`、`HELIXINFRASTRUCTURE-L1-022`、`HELIXINFRASTRUCTURE-L1-028`、`HELIXINFRASTRUCTURE-L1-029`、`HELIXINFRASTRUCTURE-L1-038`、`HELIXINFRASTRUCTURE-L1-039`。
- **入力**：L2-001〜010および025の必要なversioned identities/evidence、HELIX-HARNESS-COREの設計、OS/SECURITY/Worker接続、対象runtime・recovery environment。
- **提供**：HELIX自身の構成に対する1.0 Infrastructure実行環境、状態、観測、操作、backup/restore/rollback、独立recoveryとrebuildabilityのend-to-end結果。
- **保証**：POが列挙した18最低項目すべてを一つずつ検証範囲に含む。resource/topology/environment/design-target-vs-actual/drift/compute-network-storage/model-worker/capacity/observability/incident/backup-restore/rollback/deployment-version/SECURITY/OS/Worker/bootstrap-recovery/rebuildabilityを個別に確認した後、機構接続と構成体受入を別に行う。HELIX-WEB-OSの顧客runtimeを含めず、後続版の機能を1.0構成の前提にしない。
- **単独成立の依存・版**：L2-001〜010および025の必要な採択済み要求/verification、必要なCORE/OS/SECURITY/Worker契約と実資源。`version_target: 1.0`。この要求は設計/実装/運用許可ではない。
- **失敗時の戻し先・未完義務**：個別unit/connection/最低項目が一つでも欠ける、unknown/stale/未認可が残る、独立recovery/rebuildabilityが不成立なら構成体を未成立に保ち、欠けたunit/connectionのownerへ戻す。部分成功・未完義務・既存稼働版/適格rollback先を引き継ぐ。
- **束ねる条件**：18最低項目と、L1の単体/接続/構成体表のうち1.0対象。HELIXOS-L2-014は本構成をHELIX自身の段階releaseへ収載するときだけstage contractとして参照し、独立したInfrastructure 1.0受入の依存にはしない。OSがInfrastructure stateを所有することも意味しない。

## 後続版機能単位候補（すべてversion_target: 1.0より後、版は未定）

次のIDはL1の後続版要求を、単体・接続・構成体のidentityとして個別に要求化した候補である。いずれも1.0の合格条件・依存ではない。共通して、実体化時はidentity、contract/artifact/dependency version、対象scope、検証範囲、互換範囲、更新/復旧先を記録し、version不一致または不明をpassとしない。各候補の失敗で生じた部分状態・未完義務を記録し、該当ownerへ戻す。

### HELIXINFRASTRUCTURE-L2-012 Control ResourceとExecution Resourceの隔離

- **親L1**：`HELIXINFRASTRUCTURE-L1-008`。
- **入力**：OS/SECURITY等のcontrol resource、Worker/CI/Model等のexecution resourceのidentity、負荷・容量・network・failure/stop/recovery依存と分離設計。
- **提供**：管理・停止・復旧能力をexecution側負荷から保護する隔離設計と、resource間の許可されたcontrol path。
- **保証**：control-planeとdata/execution-planeを区別し、Worker暴走・CI負荷・model負荷がOS/SECURITYの管理、停止、復旧を失わせない。隔離方式と閾値は上流設計・SECURITY契約から受け、ここでinventしない。
- **依存・版**：approved CORE design、SECURITY policy/authority、OS change-state、L2-001/003/006/010/019。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：resource境界・control path・停止経路が不明または共有負荷で隔離できない場合は安全成立を返さず、design/SECURITY ownerへ戻す。
- **束ねる条件**：L1-008のcontrolと大量実行の分離、Worker・CI・Model負荷の例、管理/停止/復旧能力維持。原文のplane語を追加の1.0要件にしない。

### HELIXINFRASTRUCTURE-L2-013 Failure DomainとSPOF影響

- **親L1**：`HELIXINFRASTRUCTURE-L1-012`、`HELIXINFRASTRUCTURE-L1-013`。
- **入力**：手元計算機、VPS、GPU node、network、provider、database、storage等のfailure-domain identity、依存graph、failure時の停止範囲、復旧手段、受容したSPOFと理由。
- **提供**：故障単位ごとの影響先と、単一障害点の影響・復旧・受容理由を辿れるimpact view。
- **保証**：冗長化や複数region/providerを要求せず、未知の影響範囲を限定済みと扱わない。resource一覧だけでは故障境界を表したことにしない。
- **依存・版**：L2-001/005/006/007/009、approved designと依存情報。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：domain/依存/owner/復旧情報が欠ける場合は影響評価unknownで停止し、design/resource ownerへ戻す。
- **束ねる条件**：HRI-L1-012の機器/node/network/provider/database/storage例、HRI-L1-013の「冗長必須ではない」「影響・復旧・理由を明示」。

### HELIXINFRASTRUCTURE-L2-014 OS・LABO Episode Correlation

- **親L1**：`HELIXINFRASTRUCTURE-L1-015`。
- **入力**：生のmetric、出来事、failure、復旧、費用、容量を含むInfrastructure event/resource/revision evidence、OS ticket/change identity、HELIX-wide correlation ID、許可されたLABO観測scope/data-use。
- **提供**：要求・ticket・Worker・resource・failure・recoveryを一つのepisodeとして相互参照し、LABOへ許可された観測材料を渡すversioned connection。
- **保証**：correlation IDは因果証拠の代用ではなく、同じepisode内にあることだけで原因を断定しない。LABOへの送信範囲/data-useと拒否/未観測を保持する。構成の良否はLABOが過去の実績として評価し、INFRASTRUCTUREが成功実績から設計PatternをBRAINへ直接昇格させない。
- **依存・版**：L2-001/004/009/010、OS event contract、LABO correlation/data-use contract。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：ID/対象revision/permission mismatchは接続未成立として保持し、OS/Infrastructure/LABO ownerへ返す。未送信eventと因果調査待ちを保持する。
- **束ねる条件**：HRI-L1-015のOS/LABO・要求/ticket/Worker/resource/failure/recovery・観測材料を失わない条件。

### HELIXINFRASTRUCTURE-L2-015 Infrastructure Change Impactと段階適用

- **親L1**：`HELIXINFRASTRUCTURE-L1-023`、`HELIXINFRASTRUCTURE-L1-024`。
- **入力**：変更candidate exact revision、target/dependency graph、impact scope（resource/mechanism/job/environment/data）、SECURITY update acceptance、部分適用/verification/rollback plan。
- **提供**：候補→隔離またはshadow→部分適用→検証済み→昇格を辿れる更新stateと、変更前に影響対象・復旧先を把握するimpact view。
- **保証**：SECURITYの更新受入なしに自動昇格しない。影響不明を「全体停止不要」や「影響なし」と扱わず、変更でHELIX全体を無条件停止しないための適用scopeを明示する。L2-009のHELIXOS-L2-014 stage releaseとは別のInfrastructure update identityを持つ。
- **依存・版**：L2-001/002/005/009/010/013、SECURITY acceptance/update interface、OS change ticket/evidence。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：impact、permission、rollback target、更新状態のいずれかが不明なら昇格せず、変更前状態または隔離状態へ戻す。部分成功・未完verification・適格rollback先を引き継ぐ。
- **束ねる条件**：L1-023のcandidate/isolation-or-shadow/partial/verified/promotedとSECURITY approval、L1-024の資源/機構/依存Job/environment/data/rollback影響と全体無条件停止の回避。

### HELIXINFRASTRUCTURE-L2-016 Provider PortabilityとHybrid Placement

- **親L1**：`HELIXINFRASTRUCTURE-L1-025`、`HELIXINFRASTRUCTURE-L1-026`。
- **入力**：HELIX capability contract、provider-specific adapter情報、local/VPS/GPU server/cloud候補resource、placement constraintとINTELLIGENCE/OSの判断候補。
- **提供**：provider固有implementationとHELIXが要求するcapabilityを分け、local management/development、常時稼働VPS Worker/CI、local-LLM GPU server、任意cloud serviceを混在可能なdeployment targetへ表現する。
- **保証**：provider名や単一cloudを意味の正本にせず、配置決定をINFRASTRUCTUREが代行しない。異なるproviderで同じ能力・互換性があると推定しない。
- **依存・版**：L2-001/003/008、provider capability contract、INTELLIGENCE proposalおよびOS decision handoff。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：capability/adapter/placement evidenceが足りない場合は置換可能とせず、要求をownerへ返す。候補と未評価差分を保持する。
- **束ねる条件**：HRI-L1-025のAWS/GCP/Azure/VPS/local/GPU provider例、L1-026のlocal/VPS/GPU/cloud hybrid例とINTELLIGENCE/OS配置判断境界。

### HELIXINFRASTRUCTURE-L2-017 Resource Location ProofとTool-Neutral Operation

- **親L1**：`HELIXINFRASTRUCTURE-L1-027`、`HELIXINFRASTRUCTURE-L1-040`。
- **入力**：resource/state/Worker/model/artifact identity、observed location/owner/source/revision、Terraform/OpenTofu/Ansible/cloud API/provider CLI/local script/container等の操作結果。
- **提供**：対象資源と成果物の所在をsource-qualifiedに示し、複数のtool実装から同じInfrastructure meaning contractへ状態/evidenceを記録する。
- **保証**：場所不明の資源を安全に使用可能と扱わない。toolの状態表現や成功exitだけを意味の正本とせず、provider/tool名に依存する要件を作らない。
- **依存・版**：L2-001/002/010、SECURITY location/classification rules、versioned operation/evidence contract。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：所在・tool結果・source revisionの照合ができない場合、利用/更新を成立させず、該当ownerへ返す。未確認resourceと実行結果を保つ。
- **束ねる条件**：L1-027の状態/Worker/model/artifactの所在証明とunknown-location拒否、L1-040のTerraform/OpenTofu/Ansible/API/CLI/script/container例および意味正本とtoolの分離。

### HELIXINFRASTRUCTURE-L2-018 Cost AttributionとResource Lifecycle/Decommission

- **親L1**：`HELIXINFRASTRUCTURE-L1-030`、`HELIXINFRASTRUCTURE-L1-031`、`HELIXINFRASTRUCTURE-L1-032`。
- **入力**：cost source、resource/workload identity、plan/provision/configure/enable/observe/update/degrade/recover/retire/dispose lifecycle event、dependency/data/credential/network/backup/replacement evidence。
- **提供**：費用を資源/workloadへ関連づけるview、全lifecycle state、およびdecommission前のdependency/data/credential/network/cost/backup/replacement check。
- **保証**：Infrastructureは費用の採否・予算を決めない。作成成功だけでlifecycle管理済みにしない。未確認のcredential/data/dependencyを削除または廃棄済みとみなさない。
- **依存・版**：L2-001/005/010、OS lifecycle/change ticket、SECURITY credential/data policy、cost source contract。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：費用sourceや廃棄依存の照合が不明ならdecommissionを止め、ownerへ戻す。残存cost、data/credential cleanup、replacement等の未完義務を明示する。
- **束ねる条件**：L1-030のcompute/GPU/storage/network/external service/model API/always-on cost attribution、L1-031の各lifecycle状態、L1-032の未使用資源放置防止と7種の廃棄check。

### HELIXINFRASTRUCTURE-L2-019 Observation Freshness・Collection Confidence

- **親L1**：`HELIXINFRASTRUCTURE-L1-033`、`HELIXINFRASTRUCTURE-L1-034`。
- **入力**：actual observationとobserved_at/source/freshness/collector identity/confidence-or-unknown、およびresource lifecycle/revision。
- **提供**：healthy/unhealthy/unknown/unobserved/staleを別状態として持つ観測品質と現在状態の判定材料。
- **保証**：期限・freshness ruleが定義されない場合に独自数値を作らずunknownで保持する。古い観測をcurrentへ使わず、未収集をhealthyへ補わない。1.0のL2-004 minimum（観測不能をhealthyにしない）を縮退しない。
- **依存・版**：L2-001/002/004、collector/source contractと承認済みfreshness rule。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：collector/source/time/confidence欠落や規則不明では判定をunknown/unobservedに保ち、観測ownerへ返す。最後に有効だった観測とstale理由を残す。
- **束ねる条件**：L1-033の観測時刻/source/freshness/collector/confidence-or-unknownと古い観測拒否、L1-034の5状態区別。

### HELIXINFRASTRUCTURE-L2-020 Web Runtime SeparationとAsset Placement Classification

- **親L1**：`HELIXINFRASTRUCTURE-L1-035`、`HELIXINFRASTRUCTURE-L1-036`。
- **入力**：本体InfrastructureとHELIX-Web service/tenant/job/credential/service-state/deployment identities、SECURITY asset classificationとdeployment location/routing evidence。
- **提供**：本体resource stateとWeb customer/runtime stateを分離したownership/interface、およびCORE/BRAIN/INTELLIGENCE/LABO等の内部資産を内部-only/service-internal/external/restricted等のSECURITY分類に従って置く配置結果。
- **保証**：tenant、customer job/credential、service state/deploymentを本体runtime stateへ暗黙共有しない。asset classificationをINFRASTRUCTUREが作らず、SECURITYの境界に従う。
- **依存・版**：L2-001/010、WEB-OS boundary/contract、SECURITY asset classification contract。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：owner、tenant boundary、classification、locationがunknownなら外部公開やcross-scope共有を成立させず、WEB-OS/SECURITY ownerへ戻す。
- **束ねる条件**：L1-035の将来Web runtime separationと4種の顧客state、L1-036の列挙internal assetsと内部/service/external/restricted placement classes。

### HELIXINFRASTRUCTURE-L2-021 Running/Candidate Generation Separation

- **親L1**：`HELIXINFRASTRUCTURE-L1-037`。
- **入力**：running/candidate Infrastructure generation identities、更新元version/contract/dependencies、independent review/verification evidence、SECURITY authority、rollback target。
- **提供**：現行稼働世代から候補世代を隔離して検証・昇格し、候補自身の自己承認なしに前世代へ戻せる世代遷移record。
- **保証**：candidateは自分の成功を承認してrunningを置換できない。自己更新中も稼働している世代を先に壊さず、適格な前世代と復旧経路を保持する。
- **依存・版**：L2-005/006/007/010/015、OS generation/change state、SECURITY authority、独立したreview/verification contract。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：candidateの検証・authority・rollback evidenceが欠ける場合は昇格を拒否し、running generation維持または適格rollbackを行う。部分更新と未完義務を残す。
- **束ねる条件**：L1-037の稼働/候補世代分離、候補の自己承認防止、適格前世代へのrollback。

### HELIXINFRASTRUCTURE-L2-022 Capacity-Driven Autoscaling

- **親L1**：`HELIXINFRASTRUCTURE-L1-010`、`HELIXINFRASTRUCTURE-L1-011`。
- **入力**：採択済みcapacity/scale policyとthreshold、resource/workload identity、current utilization/queue/saturation、SECURITY authority、OS change ticket。
- **提供**：承認された条件の範囲でresourceを自動増減し、operationとbefore/after stateを追跡する能力。
- **保証**：この候補自体は自動操作許可やthresholdを設定しない。1.0ではcapacity signalをOS/INTELLIGENCEへ渡すまでで、自動scaleを要求しない。
- **依存・版**：将来版の採択済みcapacity policy、L2-003/010/016/018、SECURITY authority、OS operation ticket。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：threshold、authority、quota、rollback targetがunknownなら自動変更を拒否して通常のdecision ownerへ戻す。部分operationと未完義務を保持する。
- **束ねる条件**：POが後の版へ回した高度なAutoscaling。必要性・実績が確認されるまで版と数値条件を決めない。


- **親との版対応**：1.0の容量観測・受入情報（L1-010/011）はL2-003が受け入れる。本候補はその土台を後続版の自動増減へ拡張するものであり、1.0義務を後送りしない。
### HELIXINFRASTRUCTURE-L2-023 Multi-cloud Runtime Composition

- **親L1**：`HELIXINFRASTRUCTURE-L1-025`、`HELIXINFRASTRUCTURE-L1-026`。
- **入力**：各providerのversioned capability/adapter、複数cloud resource identity、hybrid target（local/VPS/GPU/cloud）、placement proposalとOS decision/evidence。
- **提供**：複数cloudを同一HELIX runtime composition内で扱い、provider固有実装を共通のHELIX capability contractへ接続する能力。
- **保証**：cloud間の互換性、移行可能性、同一security/data scopeを名前だけで推定しない。1.0はprovider-neutral resource modelまでで、複数cloudの同時運用を要求しない。
- **依存・版**：採択済みmulti-cloud capability/security/data policy、L2-016/017/020、SECURITY placement authority、OS change ticket。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：adapter/capability/authority/data-location mismatchは混成compositionを不成立とし、affected provider ownerへ戻す。稼働中構成と切戻し先を保持する。
- **束ねる条件**：POが後の版へ回したMulti-cloud。具体providerの必須化や同時利用条件は採択前に決めない。

### HELIXINFRASTRUCTURE-L2-024 Fully Automatic Failover

- **親L1**：`HELIXINFRASTRUCTURE-L1-019`、`HELIXINFRASTRUCTURE-L1-020`、`HELIXINFRASTRUCTURE-L1-021`。
- **入力**：採択済みfailure policy/threshold、failure target、independent recovery/bootstrap path、data/artifact/dependency compatibility、SECURITY authority、OS incident/change identity。
- **提供**：故障条件を検出して復旧先へ自動切替し、切替・data consistency・再起動・検証・rollback evidenceを記録する能力。
- **保証**：この候補は完全自動failoverの現行許可ではない。1.0はbackup/restore/rollbackと独立recoveryの基礎に限り、自動切替、冗長化、RTO/RPO等の数値を追加しない。
- **依存・版**：将来版の承認済みfailure/recovery policy、L2-005/006/013/015/019、SECURITY authorityおよびOS incident/change contract。`version_target: 1.0より後（版は未定）`。
- **失敗時・未完義務**：failure confidence、authority、data consistency、recovery targetがunknownなら自動切替を開始しない、または安全な復旧手順へ停止する。現行状態、部分切替、復旧・rollback義務を保持する。
- **束ねる条件**：POが後の版へ回した完全自動のFailover。必要性と実績を見て後の版を決める。

- **親との版対応**：1.0の巻き戻し（L1-019）はL2-005、独立起動・復旧（L1-020/021）はL2-006が受け入れる。本候補は後続版の完全自動切替への拡張であり、1.0義務を後送りしない。
## Worker資源の接続（version_target: 1.0）

### HELIXINFRASTRUCTURE-L2-025 Workerと実行資源の接続

- **親L1**：`HELIXINFRASTRUCTURE-L1-009`、`HELIXINFRASTRUCTURE-L1-039`。
- **入力**：Worker identity、OS ticket・要求・作業責務の参照、必要なCPU/memory/GPU/storage/network、process/container等の実行環境、SECURITYの隔離条件。
- **提供**：Workerと実際の実行資源・容量・状態の対応、および資源が変わった場合も作業の参照を失わない接続。
- **保証**：Workerは計算機そのものではない。INFRASTRUCTUREは実資源と状態を所有し、その資源で利用できる方式で隔離条件を適用する。Workerが必要に応じ別資源へ移る場合もticket、要求、Workerの責務を保持し、それらの正本をINFRASTRUCTUREへ移さない。資源の同一性とWorkerの同一性を混同しない。
- **依存・版**：L2-001/003、Worker実行契約、OSの作業参照、SECURITY隔離条件。`version_target: 1.0`。自動配置最適化や高度な自動増減を依存にしない。
- **失敗時・未完義務**：資源不足・隔離不能・ticket対応不明なら接続成立とせず、資源ownerまたはOS/SECURITYへ戻す。未完作業と元資源・移動先の観測状態を保持する。
- **束ねる条件**：最低項目7（Model/Worker Runtime）・16（Worker execution）のWorkerと資源の区別。2026-09-26 Worker判断をL1接続表に従って適用する。実操作の認可から実行までの構成体はL2-010と別に検証する。

## 判断候補の接続（version_target: 1.0より後、版は未定）

### HELIXINFRASTRUCTURE-L2-026 INTELLIGENCEの資源判断候補との接続

- **親L1**：`HELIXINFRASTRUCTURE-L1-026`。
- **入力**：INTELLIGENCEからの資源・Workerの配置、容量不足、failure診断、増減、復旧の判断候補と対象resource/revision、判断の根拠・不明範囲。
- **提供**：判断候補と実資源状態の対応、および実行せずに候補・制約・実行可能性をOSへ渡せる接続。
- **保証**：判断候補をauthorityとして実行しない。INTELLIGENCEの判断とINFRASTRUCTUREの観測、OSの作業・変更状態、SECURITYのauthority、Workerの実操作を分ける。診断候補を確定原因へ変換しない。
- **依存・版**：L2-001/003/004/009/010/016、INTELLIGENCEの判断候補契約。`version_target: 1.0より後（版は未定）`。1.0の最低容量情報の受渡しはL2-003に残し、本候補の全能力をその依存にしない。候補受領はL2-022/024の高度な自動増減・自動切替の実装完了を要しない。
- **失敗時・未完義務**：対象revision・観測根拠・実行範囲が不明なら候補を保留してINTELLIGENCE/OSへ戻し、未解決の診断・配置・復旧義務を保持する。
- **束ねる条件**：L1接続表の配置、容量不足、failure診断、増減、復旧候補。配置の判断はINTELLIGENCE/OS、資源状態はINFRASTRUCTUREという責務を保つ。

## 後続版へ保全する機能候補

次の条件はL1に明示されている候補identityであり、**1.0の必要依存・合格条件ではない**。具体版はPOの回答にないため決めない。各groupは要求の意味を消すものではなく、各L2候補と対のL11を採否するときにL1/HRI原文を再参照する。`version_target: 1.0より後（版は未定）`を保持する。

| 候補範囲とL1 source | 保全する条件 | 1.0との境界 |
|---|---|---|
| HELIXINFRASTRUCTURE-L1-008 | control/execution resource isolation | L2-012。plane separation、Worker/CI/model負荷から管理・停止・復旧を守る機能候補。1.0依存ではない |
| HELIXINFRASTRUCTURE-L1-012／013 | failure-domain impact、SPOF impact/recovery/accepted reason | L2-013。複数provider/regionや冗長化を新設しない |
| HELIXINFRASTRUCTURE-L1-015 | HELIX-wide episode correlationをOS/LABOへ接続 | L2-014。1.0のminimum OS resource/work connectionを代替・拡張する必須条件ではない |
| HELIXINFRASTRUCTURE-L1-023／024 | staged Infrastructure changeと事前impact確認 | L2-015。HELIXOS-L2-014のstage releaseとは別identity。1.0では要求しない |
| HELIXINFRASTRUCTURE-L1-025／026 | provider portabilityとlocal/VPS/GPU/cloud hybrid placement | L2-016。具体例を保つが、multi-cloudは1.0に前倒ししない |
| HELIXINFRASTRUCTURE-L1-027／040 | resource/artifact location proofとtool-neutral operation (Terraform/OpenTofu, Ansible, APIs, provider CLIs, local scripts, containers) | L2-017。toolを意味正本にせず、1.0にtool交換性を要求しない |
| HELIXINFRASTRUCTURE-L1-030／031／032 | cost attribution、plan-to-dispose lifecycle、decommission前のdependency/data/credential/network/cost/backup/replacement checks | L2-018。数値threshold/予算判断は定めず、1.0のcapacity/backup条件へ混ぜない |
| HELIXINFRASTRUCTURE-L1-033／034 | observed_at/source/freshness/collector/confidence-or-unknown、healthy/unhealthy/unknown/unobserved/stale | L2-019。1.0の「観測不能をhealthyにしない」を縮退せず、詳細state modelは1.0依存にしない |
| HELIXINFRASTRUCTURE-L1-035／036 | Web service Infrastructure separationとSECURITY asset placement classification | L2-020。本体/Web顧客stateを分離し、後続version_targetを保つ |
| HELIXINFRASTRUCTURE-L1-037 | running/candidate generation separation and self-host update without candidate self-approval | L2-021。1.0の復旧土台から自己host promotionを前倒ししない |
| 高度なAutoscaling | capacity-driven automatic scale | L2-022。版・policy・threshold未定。L2-003のcapacity signalは自動scaleの採択/許可ではない |
| Multi-cloud | simultaneous cloud mix | L2-023。provider互換や同時運用を推定せず、1.0共通resource modelと分ける |
| 完全自動Failover | fully automatic failover | L2-024。L2-005/006のbackup/restore/recoveryは自動failoverの採択/許可ではない |

## L1全40件からL2・L11への個別対応

各L2と同じIDのL11節が対になる。1.0の義務は1.0列の受け先で受け入れる。後続列は後続版の能力、または1.0土台を用いる拡張であり、1.0義務の延期を意味しない。全体構成体011はこれらを束ねるが、個別義務の受け先の代用にはしない。

| 親L1 ID | 親L1の版 | 1.0の受け先（L2/L11） | 後続版の受け先・拡張（L2/L11） |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L1-001` | 1.0 | `HELIXINFRASTRUCTURE-L2-001`、`HELIXINFRASTRUCTURE-L2-009` | — |
| `HELIXINFRASTRUCTURE-L1-002` | 1.0 | `HELIXINFRASTRUCTURE-L2-002`、`HELIXINFRASTRUCTURE-L2-008`、`HELIXINFRASTRUCTURE-L2-009` | — |
| `HELIXINFRASTRUCTURE-L1-003` | 1.0 | `HELIXINFRASTRUCTURE-L2-002`、`HELIXINFRASTRUCTURE-L2-009` | — |
| `HELIXINFRASTRUCTURE-L1-004` | 1.0 | `HELIXINFRASTRUCTURE-L2-001` | — |
| `HELIXINFRASTRUCTURE-L1-005` | 1.0 | `HELIXINFRASTRUCTURE-L2-001`、`HELIXINFRASTRUCTURE-L2-003` | — |
| `HELIXINFRASTRUCTURE-L1-006` | 1.0 | `HELIXINFRASTRUCTURE-L2-001`、`HELIXINFRASTRUCTURE-L2-003` | — |
| `HELIXINFRASTRUCTURE-L1-007` | 1.0 | `HELIXINFRASTRUCTURE-L2-001`、`HELIXINFRASTRUCTURE-L2-003` | — |
| `HELIXINFRASTRUCTURE-L1-008` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-012` |
| `HELIXINFRASTRUCTURE-L1-009` | 1.0 | `HELIXINFRASTRUCTURE-L2-001`、`HELIXINFRASTRUCTURE-L2-003`、`HELIXINFRASTRUCTURE-L2-025` | — |
| `HELIXINFRASTRUCTURE-L1-010` | 1.0 | `HELIXINFRASTRUCTURE-L2-003` | `HELIXINFRASTRUCTURE-L2-022` |
| `HELIXINFRASTRUCTURE-L1-011` | 1.0 | `HELIXINFRASTRUCTURE-L2-003` | `HELIXINFRASTRUCTURE-L2-022` |
| `HELIXINFRASTRUCTURE-L1-012` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-013` |
| `HELIXINFRASTRUCTURE-L1-013` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-013` |
| `HELIXINFRASTRUCTURE-L1-014` | 1.0 | `HELIXINFRASTRUCTURE-L2-004`、`HELIXINFRASTRUCTURE-L2-009` | — |
| `HELIXINFRASTRUCTURE-L1-015` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-014` |
| `HELIXINFRASTRUCTURE-L1-016` | 1.0 | `HELIXINFRASTRUCTURE-L2-004` | — |
| `HELIXINFRASTRUCTURE-L1-017` | 1.0 | `HELIXINFRASTRUCTURE-L2-005` | — |
| `HELIXINFRASTRUCTURE-L1-018` | 1.0 | `HELIXINFRASTRUCTURE-L2-005` | — |
| `HELIXINFRASTRUCTURE-L1-019` | 1.0 | `HELIXINFRASTRUCTURE-L2-005` | `HELIXINFRASTRUCTURE-L2-024` |
| `HELIXINFRASTRUCTURE-L1-020` | 1.0 | `HELIXINFRASTRUCTURE-L2-006` | `HELIXINFRASTRUCTURE-L2-024` |
| `HELIXINFRASTRUCTURE-L1-021` | 1.0 | `HELIXINFRASTRUCTURE-L2-006`、`HELIXINFRASTRUCTURE-L2-010` | `HELIXINFRASTRUCTURE-L2-024` |
| `HELIXINFRASTRUCTURE-L1-022` | 1.0 | `HELIXINFRASTRUCTURE-L2-001`、`HELIXINFRASTRUCTURE-L2-009` | — |
| `HELIXINFRASTRUCTURE-L1-023` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-015` |
| `HELIXINFRASTRUCTURE-L1-024` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-015` |
| `HELIXINFRASTRUCTURE-L1-025` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-016`、`HELIXINFRASTRUCTURE-L2-023` |
| `HELIXINFRASTRUCTURE-L1-026` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-016`、`HELIXINFRASTRUCTURE-L2-023`、`HELIXINFRASTRUCTURE-L2-026` |
| `HELIXINFRASTRUCTURE-L1-027` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-017` |
| `HELIXINFRASTRUCTURE-L1-028` | 1.0 | `HELIXINFRASTRUCTURE-L2-010` | — |
| `HELIXINFRASTRUCTURE-L1-029` | 1.0 | `HELIXINFRASTRUCTURE-L2-010` | — |
| `HELIXINFRASTRUCTURE-L1-030` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-018` |
| `HELIXINFRASTRUCTURE-L1-031` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-018` |
| `HELIXINFRASTRUCTURE-L1-032` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-018` |
| `HELIXINFRASTRUCTURE-L1-033` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-019` |
| `HELIXINFRASTRUCTURE-L1-034` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-019` |
| `HELIXINFRASTRUCTURE-L1-035` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-020` |
| `HELIXINFRASTRUCTURE-L1-036` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-020` |
| `HELIXINFRASTRUCTURE-L1-037` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-021` |
| `HELIXINFRASTRUCTURE-L1-038` | 1.0 | `HELIXINFRASTRUCTURE-L2-007` | — |
| `HELIXINFRASTRUCTURE-L1-039` | 1.0 | `HELIXINFRASTRUCTURE-L2-010`、`HELIXINFRASTRUCTURE-L2-025` | — |
| `HELIXINFRASTRUCTURE-L1-040` | 1.0より後（版は未定） | — | `HELIXINFRASTRUCTURE-L2-017` |

## 1.0最低18項目と要求IDの対応

POの配置決定が列挙する18 scope itemをそのまま保持する。各itemはL2-001〜011のどこで受け入れるかを示す。1.0条件はこの集合で閉じ、後続項目を足さない。

| 原文minimum item | 対応L2候補 | 具体的な範囲 |
|---|---|---|
| 1 Resource identity | 001 | identity/role/環境/場所/版/依存/lifecycle |
| 2 Topology | 001 | 機構・resource関係、物理runtime path |
| 3 Environment | 001 | 環境identityと分離 |
| 4 Design/Deployment Target/Actual separation | 002／008 | CORE設計、target、actualを別stateにする |
| 5 Drift | 002 | missing/unexpected/version/config/network/permission/capacity/unknown dependency |
| 6 Compute/Network/Storage | 001／003 | 共通resource modelと観測 |
| 7 Model/Worker Runtime | 001／003／025 | model/workerのruntime resource inventory。評価と割当案は他機構 |
| 8 Capacity | 003 | capacity/utilization/queue/saturation/admission input |
| 9 Observability | 004 | health/metric/log/resource/dependency/queue/error/latency/deployment/recovery |
| 10 Incident state | 004 | degraded/unavailable/capacity/dependency/data/network/security-isolated/unknown |
| 11 Backup/Restore | 005 | backupの状態と実restore/verificationを別にする |
| 12 Rollback | 005 | 適格target、版/config/artifact/dependency/data compatibility/procedure |
| 13 Deployment version | 001／009 | runtime revisionとOS stage release identityを区別 |
| 14 SECURITY connection | 010 | policy/authority/credential/isolation/egressを受ける |
| 15 OS connection | 009 | Work/Change StateとRuntime Resource Stateをつなぎ、二重正本を防ぐ |
| 16 Worker execution | 010／025 | OS assignment、SECURITY authority内のWorkerによる操作 |
| 17 Bootstrap/Out-of-Band Recovery | 006 | HELIXから独立する最小recovery pathと別SECURITY authority |
| 18 Rebuildability | 007／011 | approved design/config/artifact/dependency/data backup/version/evidenceから再構築 |

### 既存要求・sourceからの対応

| Source/condition | 行き先 | 対応 |
|---|---|---|
| HRI-L1-001〜007/009〜011/014/016〜022/028/029/038/039 | L2-001〜011の上記scope | L1要求の意味を維持。1.0 assignmentはPOの18項目表で明示された範囲のみ |
| HRI-L1-008/012/013/015/023〜027/030〜037/040、および高度なAutoscaling/Multi-cloud/完全自動Failover | HELIXINFRASTRUCTURE-L2-012〜024と各対のL11 | `version_target: 1.0より後（版は未定）`。個別候補要求の本文/受入を保ち、1.0条件/依存へ戻さない |
| 原文のCORE→INFRA、OS↔INFRA、INFRA→SECURITY→Runner/Worker、Worker→INFRA、INFRA→LABO、INTELLIGENCE→INFRA、BRAIN→CORE接続 | L2-008/009/010/014/025/026、後続版候補表 | 1.0の3接続と構成体は接続表の責務・authorityを保つ。LABO episodeと配置診断の接続は後続版条件を前提にしない |
| HELIXOS-L2-014 | L2-009／011 | OS owns stage release composition/generation/verification/deployment/rollback; INFRA owns runtime-resource identity/configuration/version/state and recovery evidence. OS release stage ID ≠ Infrastructure runtime revision. 1.0は必要なInfrastructure pack/stateを段階構成に参照可能にするが、L1-023を依存させない |

### 旧HELIX source basisと再導出

archiveを読み、要求の源、保持点、変更点、理由を対応づけた。旧仕様・実装・CI・runtime・CLI・test・受入結果をコピーまたは起動せず、旧設計への承認を現行へ継承しない。source asset IDと原文SHA-256は資産台帳と照合した。

| 旧asset ID / source path | SHA-256 | 参照行・保持する意味・変更点 |
|---|---|---|
| `LEGACY-ASSET-17C4BF78919578FEBB18` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md` | `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | L68–98のOPS-R-01〜05は環境identityと資格情報参照、配備先・成果物・設定・証拠、明示したrollback先、provider中立adapter、段階昇格を扱う。L108–119のOPS-R-07/08はincident相関とdrift義務、L164–171のOPS-R-12はHELIX自身の利用循環を扱う。環境・配備・復旧・観測の意味を比較根拠として保持し、現行の所有はCORE＝設計、INFRA＝資源状態、OS＝変更状態、SECURITY＝authority、Worker＝操作へ分ける。provider交換、全lifecycle、段階更新はPOに従い1.0より後に置く。 |
| `LEGACY-ASSET-5D41345F55800F23AC38` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | L9のNIO-L3-03、L12の06、L15の09は観測のsource・時刻・新しさ・収集証拠、実行して確かめるrestore/rollback、stale/unknownをhealthyとしない条件。未承認L3候補であり、L1との対応確認だけに用いる。1.0の承認や数値oracleにしない。 |
| `LEGACY-ASSET-E239B45CE3FFE8B34D2B` `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | L128は配置・依存・故障単位・容量・rollbackの設計と、複数region/providerを無条件に求めない条件。明示した設計と依存、providerを指定しない意味を保持する。故障単位は後続版L1-012へ対応し、1.0へ入れない。 |
| `LEGACY-ASSET-653A097F9C9EE51F6FDD` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4.0.md` | `8c492aae7a3c2f2c27dd24794d2ba4c7a9fc025737fa7ea61215b3b6658a5e59` | L36、79–85、116–128は制御とrelease lifecycleの分離。旧Plane構成は歴史的入力であり、現行の部品名・authorityにしない。現行Concept/L1に従いOSの作業・変更状態とINFRAの資源状態へ分ける。 |
| `LEGACY-ASSET-235F57A4DC453383E6C7` `archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/concept/HELIX_CONCEPT_v0.1.md` | `ab9d93f843875c1cd9b61049721c455ae067548196c216e64168711156afd475` | L69–91、234–238は共有基盤を無制限なdata/authority共有としない条件、およびCPU/memory/GPU/time/token/costの資源制約と不足時の待機・直列化・移動。資源観測と待機・配置判断への受渡しを保持する。資源状態のownerは2026-09-26 PO判断によるINFRAとし、旧organism/plane構成を継承しない。 |
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | L165–166のHIL-TR-01/02は制御とdata/detectionを版付き契約で分ける。関連する現行L1-008は18項目の最低範囲外であり後続版へ保全する。旧言語/runtime指定を1.0へ持ち込まない。 |
| `LEGACY-ASSET-3E3D84D599ED0476926B` `archive/legacy-generation-2026-09-14/root/docs/process/modes/version-up.md` | `8b4f333a0734a4a2f3f8cea9f1b17c87c3880a0dc271671af45f53be7b7c4a74` | L13–17、27–35は後続能力を版の印で保全し、後で有効化するときに再接続する条件。現行L1/POのversion_targetによる保全の意味を保持し、旧workflow/tool/label validatorは再利用しない。 |

新しい機構identityそのものは旧HELIXに対応例がなく、既存運用の物理配置から推定していない。配置の根拠は、POの原文HRI requirementsと2026-09-26のdecision recordsである。旧sourceは親L1との意味比較資料であり、本PRで旧atomを現行候補へ移管・採択しない。旧要求は既存holdingに保持する。比較上の主な差分は、旧製品lifecycleの実行時責務を現行の所有境界へ分けたこと、旧Runner/Sandbox表記をWorkerへ改めたこと、後続版条件を1.0から外したことである。これらの根拠はL1および[2026-09-26 Worker execution model decision](../../governance/decisions/worker-execution-model-po-decisions-2026-09-26.md)にある。

### 人の判断が残る点

- HELIX-INFRASTRUCTURE L1の対象revisionはPOが確認する。したがってこのL2/L11もdraft candidateであり、採否/implementation authorizationは未成立。
- 18 minimum item mappingはPOの明示recordに合わせた。意味・配置・版範囲を変更する追加判断が必要と分かった場合は、PO原文・現在のdecision option・影響要求を提示し、ここで版を補完しない。
- 原文は容量、復旧時間、保持期間、費用の数値閾値や具体providerを定めていないため、ここで補わない。L1/Conceptの意味変更、候補の採択、後続版の具体番号は人の判断として残る。
