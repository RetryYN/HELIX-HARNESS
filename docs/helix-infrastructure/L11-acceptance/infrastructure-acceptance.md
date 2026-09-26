---
title: "HELIX-INFRASTRUCTURE 機能単位受入候補"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: acceptance
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
created: 2026-09-27
updated: 2026-09-27
pair_artifact: docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md
parent_l1_candidate: docs/helix-infrastructure/L1-planning/infrastructure-intent.md
---

# HELIX-INFRASTRUCTURE 機能単位受入候補

本書は[HELIX-INFRASTRUCTURE L2要求候補](../L2-requirements/infrastructure-requirements.md)と対をなすL11受入候補である。いずれもdraft candidateであり、採択、L3承認、実装・実行許可、実測合格を表さない。受入 evidence は対象pack identity、契約・成果物・依存version、適用対象、検証範囲を固定して記録する。`version_target`は実体の版でも受入合格でもない。未知の閾値を作らず、上流に定義がない数値条件は未決として止める。

共通packのidentity・版・互換・交換・未完義務の契約はHARNESS-L2-010/011を参照し、以下ではINFRASTRUCTUREに適用した結果を確認する。

## 実行前提と共通判定

- 親入力は、L2文書に記録したConcept/L1/PO source/decisionの同一revisionであり、親L1の対象revisionが確認されるまで候補本文の静的対応確認に留める。
- 各試験記録に、unit/connection/composite identity、contract version、artifact version、dependency identities/versions、environment identity、対象・除外範囲、試験入力、期待結果、実結果、evidence source/revision、failure/未完義務、復旧先を記録する。
- 異なる契約・依存版の結果を流用しない。version/interface/scope mismatch、stale input、unknown authority、未観測範囲はpassにせず、affected unit/connectionを再検証対象にする。
- 正常系だけでなく、各節に示すcounterexampleで不成立を検出する。失敗時の状態・失敗根拠・部分成功・未完義務を残し、責任を持つownerまたは前段へ返す。
- 1.0の総合受入範囲は、POが指定した最低18項目に閉じる。後続版候補の受入を1.0の前提に追加しない。後続版候補は1.0で「実装済み」と受け入れるのではなく、境界が保持され、誤って必須化されていないことだけを確認する。
- HELIX-OS stage releaseはHELIXOS-L2-014のstage identity/contractに従う。stage IDとInfrastructure runtime revisionは異なる識別子として記録し、同じstage packに必要なInfrastructure依存だけを含める。1.0未完成の無関係な製品・機構やInfrastructure-L1-023をstage releaseの前提にしない。

## 1.0単体受入候補

### HELIXINFRASTRUCTURE-L2-001 Runtime Resource Topologyと環境

- **受入手順**：HELIX-OS/BRAIN/LABO/INTELLIGENCE/SECURITY/CONNECT、Worker/Model Runtime、database/queue/artifact/evidence/log/metric storeのfixtureをenvironment別に置き、identity/role/location/version/dependency/lifecycle/network path/state-storage classを収集する。source/destination/protocol/endpoint/direction/purpose/security boundary/dependencyを持つnetwork path、persistent/temporary storageのowner/durability/backup/retention/confidentiality/recovery属性、logical HELIX-CONNECTとphysical pathを照合する。
- **成功条件**：各観測は対象environmentとsource/revisionに結びつき、environment間のresourceが混同されない。未観測の項目はunknownとして残る。Model/Worker runtime inventoryは参照できるが、その能力評価、ticket状態、security policyをInfrastructure所有値として出さない。
- **反例・失敗条件**：stagingのresourceをproductionの存在証拠として扱う、logical connectorをphysical routeと同一扱いする、欠けたversion/dependencyを推定で埋める、またはresource stateをsecurity authorityの代用にした場合は不合格。
- **失敗戻し先**：欠落したsource/ownerまたはCORE設計owner。読めない範囲・未完観測を保持する。
- **対応する1.0 minimum**：1 Resource identity、2 Topology、3 Environment、6 Compute/Network/Storage、7 Model/Worker Runtime、13 Deployment versionのruntime側。

### HELIXINFRASTRUCTURE-L2-002 Desired Target・Actual State・Drift

- **受入手順**：approved configuration/design revisionとdeployment targetを入力し、同じ対象の一致状態、missing resource、unexpected resource、version/config/network/permission/capacity差異、unknown dependency、stale observationを含むactual fixturesを比較する。
- **成功条件**：design, target, actual, drift resultが相互参照できる別stateとして記録される。差異の種類とsourceが示され、観測値から設計や要求を変更しない。
- **反例・失敗条件**：実環境にある値をapproved designへ自動昇格する、unknown/staleを一致として扱う、unexpected resourceを承認済みとみなす、差異を消すために比較入力を上書きする場合は不合格。
- **失敗戻し先**：stale/欠落したdesign・target・observationのownerへ返し、drift判定を保留する。
- **対応する1.0 minimum**：4 Design/Deployment Target/Actual separation、5 Drift。

### HELIXINFRASTRUCTURE-L2-003 Compute・Network・Storage・Model資源と容量

- **受入手順**：CPU/RAM/GPU/VRAM/storage/network/runtime/model requirementを持つresource snapshotと、十分、境界不明、容量不足、古いobservationの起動要求を使う。capacity/utilization/queue/concurrency/saturation/rejection/backpressureの各入力がどの対象版に属するか確認する。
- **成功条件**：資源と容量情報がsource/revision付きで参照できる。既知の不足はcapacity unavailableとしてOS/INTELLIGENCEへ返され、queue/delay、代替候補、人へのescalation、reject等の判断経路へ渡せる。Infrastructure自身は配置や費用の選択を承認しない。
- **反例・失敗条件**：未知・古いcapacityを受入可とする、無制限にJobを追加する、またはInfrastructureが承認なしにnode移動/cost選択を実行する場合は不合格。
- **失敗戻し先**：capacity observation sourceとOS/INTELLIGENCEのdecision owner。待機中要求・snapshot・未完義務を維持する。
- **対応する1.0 minimum**：6 Compute/Network/Storage、7 Model/Worker Runtimeのresource側、8 Capacity。

### HELIXINFRASTRUCTURE-L2-004 Runtime ObservabilityとIncident State

- **受入手順**：health/metric/log/resource/dependency/queue/error/latency/deployment/recovery observationを入力し、正常、劣化、利用不能、容量枯渇、依存失敗、data/network unavailable、security isolation、collector欠測の各ケースを区別する。
- **成功条件**：記録は対象revision/sourceへ結びつき、観測不能をhealthyとしない。incident meaning/severityは承認済み要求に従い、定義元が追える。
- **反例・失敗条件**：telemetry欠測をhealthyへ変換する、未承認severityを追加する、古いsourceをcurrentとして表示する場合は不合格。L1-033/034にある詳細freshness・confidence stateが無いことだけを理由に1.0を失格にしてはならない。
- **失敗戻し先**：観測source/collector ownerまたはincident meaningを持つ上流owner。未観測状態を保持する。
- **対応する1.0 minimum**：9 Observability、10 Incident state。

### HELIXINFRASTRUCTURE-L2-005 Backup・Restore・Rollback

- **受入手順**：成功/不完全backup、対象外revision、integrity不一致、互換restore、dependency reconnect失敗、rollback target不明のfixturesを用い、backup状態、実restore、verification、rollback適格性を別々に評価する。
- **成功条件**：backupの存在のみではrestore可能と判定されず、実restoreでintegrity、dependency reconnection、startup、verification evidenceが揃う。rollback targetはartifact/config/dependency/data compatibilityとprocedureへ結びつく。
- **反例・失敗条件**：backup jobが成功しただけでrestore pass、rollback実行だけでincident closure、未確認互換targetを適格とする場合は不合格。
- **失敗戻し先**：recovery design owner/OSへ戻す。変更前の適格状態、失敗理由、未完復旧義務を維持する。
- **対応する1.0 minimum**：11 Backup/Restore、12 Rollback。

### HELIXINFRASTRUCTURE-L2-006 HELIX独立Bootstrap・Recovery Path

- **受入手順**：HELIX-OSまたは通常control planeを利用できない故障fixtureで、限定bootstrap/health check/service stop/rollback/recoveryを実行できる設計境界を確認する。試験主体・credential値はSECURITY authority管理下のfixtureを使う。
- **成功条件**：recovery pathは対象のHELIX control planeから独立し、対象・操作が限定され、別SECURITY authorityが照合できる。記録は最終適格revisionと残作業を示す。
- **反例・失敗条件**：復旧処理が停止中HELIX-OSへ修復を依頼する、通常権限を流用する、credential/policy不明のまま操作する、又は完全自動failoverを1.0の合格条件にする場合は不合格。
- **失敗戻し先**：独立経路またはauthorityを提供するownerへ戻す。安全に復旧できない範囲を明示して停止する。
- **対応する1.0 minimum**：17 Bootstrap/Out-of-Band Recovery。

### HELIXINFRASTRUCTURE-L2-007 Runtime Rebuildability

- **受入手順**：必要環境を消失したfixtureからapproved design、config、artifact、dependency、data backup、version、deployment evidenceを使って隔離環境へ再構築し、再接続・起動・検証を行う。
- **成功条件**：必要な環境を再現でき、入力artifact/revisionから結果まで追跡可能である。machine内だけの情報やbackup記録の存在を再構築成功に代えない。
- **反例・失敗条件**：依存/data/credential authorityが欠けたまま起動だけでpassする、文書やbackupがあるだけでrebuildableと判定する場合は不合格。
- **失敗戻し先**：欠落したdesign/artifact/dependency/data ownerへ戻し、復元部分と未完義務を区別する。
- **対応する1.0 minimum**：18 Rebuildability。

## 1.0接続受入候補

### HELIXINFRASTRUCTURE-L2-008 HARNESS-CORE設計からDeployment Targetへの接続

- **受入手順**：CORE approved design revisionからInfrastructure deployment targetを導き、target/actual/driftを照合する。別revision、scope不一致、未承認designも入力する。
- **成功条件**：targetはCOREのdesign identity/revision/scopeと結びつき、COREが設計意味を所有し、Infrastructureがruntime target/actualを所有する。変更提案はdesign変更や実行と別である。
- **反例・失敗条件**：Infrastructureが設計値を書き換える、actualを承認designにする、またはCORE revision mismatchでもtargetを確定する場合は不合格。
- **失敗戻し先**：CORE/design ownerへ返し、deployment target確定を保留する。
- **最低範囲対応**：4 Design/Deployment Target/Actual separation。

### HELIXINFRASTRUCTURE-L2-009 OS Runtime Resource StateとWork/Change Stateの接続

- **受入手順**：通常のOS work/changeとInfrastructure resource-stateを結ぶ接続を、stage release未使用のcaseと、HELIXOS-L2-014のstage packへ収載するcaseに分ける。双方でticket/change/actor/evidence/stop-resumeとresource/runtime revision/deployment/recovery stateの相互参照を確認し、部分更新・rollback・未完操作も試す。
- **成功条件**：通常接続はOS Work/Change interfaceとInfrastructure resource-state contractだけで独立して成立する。stage packへ収載する場合はOS stage release ID、Infrastructure pack/contract/artifact/dependency version、runtime revisionを別identityのまま同一stageの構成証拠で対応させ、必要なInfrastructure依存と更新・rollback evidenceを持つ。OSはwork/changeを、Infrastructureはresource/runtimeを正本とする。
- **反例・失敗条件**：通常接続をHELIX全体stage releaseの完成待ちにする、stage IDをruntime revisionとして流用する、OS ticketをruntime stateの正本にする、Infrastructureが作業承認を出す、未知のtargetで部分適用を成功扱いする、未完operationを落とす場合は不合格。また全7製品や後続版Infrastructure-L1-023の完成を、独立した安全なstage releaseの開始条件にした場合も不合格。
- **失敗戻し先**：状態の所有者であるOSまたはInfrastructureへ戻す。稼働中stage（stage利用時）、runtime revision、適格rollback先、停止中operationを保持する。
- **最低範囲対応**：13 Deployment version、15 OS connection。HELIXOS-L2-014 stage identity/contractはstage packとして使う場合の条件であり、通常のresource-state connectionの必須依存ではない。

## 1.0操作構成体の受入

### HELIXINFRASTRUCTURE-L2-010 SECURITY authority・Worker操作の構成体

- **受入手順**：SECURITY authority scope内の許可操作、範囲外対象、期限切れauthority、credential不足、revision不一致、部分操作を使う。OS assignment/ticket、Worker result、Infrastructure before/after state evidenceを関連付ける。
- **成功条件**：Worker操作はSECURITYが認めたtarget/action/scope/expiry内に限られ、結果と実状態が別evidenceとして結びつく。credential値は通常resource stateへ漏らさず、停止時には実状態・未完操作・rollback義務を引き継ぐ。
- **反例・失敗条件**：INFRASTRUCTURE自身がpolicy/authorityを発行する、範囲外操作が実行される、Workerの成功返答だけで実状態変更を受入れる、又は部分実行を成功として閉じる場合は不合格。
- **失敗戻し先**：実行前のauthority不一致はSECURITY/OSへ戻す。部分実行はInfrastructure実状態と復旧責務のownerへ返す。
- **最低範囲対応**：14 SECURITY connection、16 Worker execution。

## 1.0構成体受入候補

### HELIXINFRASTRUCTURE-L2-011 HELIX自身のInfrastructure 1.0構成体

- **受入手順**：対象範囲と除外範囲を固定し、L2-001〜010および025の採択済み要求と必要契約を同一構成manifestへpinする。最低18項目それぞれにtest input、expected outcome、observed evidence、結果を記録し、正常構成と失敗/rollback構成を端から端まで評価する。通常のInfrastructure構成体受入と、HELIXOS-L2-014のstageへ収載する場合のstage integration evidenceを区別する。
- **成功条件**：1〜18の各minimum itemに対応する証拠があり、単体機能、CORE/OS/SECURITY/Worker接続、構成体の成立が別に判定される。Backup/Restore/Rollbackと独立Bootstrap/Recovery、Rebuildabilityの復旧端まで確認される。未完義務は次のowner/ticket/recovery pathに残り、稼働中構成と適格rollback先が特定できる。stageへ収載する場合は、そのstage identityとの対応も確認するが、HELIXOS-L2-014自体を通常のInfrastructure構成体受入の前提にはしない。
- **反例・失敗条件**：18項目のいずれかが欠落、unobserved/unknown/stale/mismatch/unauthorizedがpass扱い、backupだけでrestore合格、部分接続の成功だけで構成体pass、又は後続版条件を暗黙に必須化する場合は不合格。HELIX-WEB顧客runtimeを本体Infrastructure構成体へ混ぜても不合格。
- **失敗戻し先**：失敗したunit/connectionのownerへ戻し、構成体は未成立のままにする。部分成功と未完義務は各ownerへ引継ぎ、rollbackまたは現行stage維持の判断材料を残す。
- **最低範囲対応**：1–18すべて。L2の「1.0最低18項目と要求IDの対応」表を証拠indexとして使うが、表自体は原要求や個別試験の代用ではない。

## 後続版境界の受入確認

1.0構成のレビューでは、後続版機能の実装完了を要求せず、次の境界違反が無いことを確認する。該当能力を後の版で受け入れる場合は、下記の後続版L2/L11候補を、その版の対象revisionとして採択してから受け入れる。

| L1候補範囲 | 1.0で確認する境界 | 不合格となる反例 |
|---|---|---|
| 008/012/013 plane isolation・failure domain・SPOF | 18 minimumに含まれない詳細分離を前提にしない。最低限の復旧/incident要求は1.0表の範囲で確認 | plane分離やfailure-domain機能が無いことのみで1.0 fail、またはこれを暗黙の1.0 dependencyにする |
| 015/023/024 LABO episode、候補→promoted infrastructure更新、blast-radius最適化 | OS接続とstage rollback/evidenceは009で確認。LABO episode・後続update lifecycleは非依存 | HELIXOS-L2-014 stage releaseがL1-023完了を待たされる |
| 025/026/027/040 provider portability・hybrid/multicloud・location proof・tool neutrality | 共通resource model/topologyは001/003で確認し、specific provider/cloud interchangeabilityを要求しない | multi-cloudやhybrid node placementを1.0必須条件に追加 |
| 030/031/032 full cost/lifecycle/decommission checks | 1.0 capacity/backup/recoveryとの意味を分ける | full cost attributionやdecommission dependency auditが無いだけで1.0 fail |
| 033/034 detailed source freshness/collector-confidence state | telemetry欠測をhealthyにしないことを004で確認 | 後続state taxonomyを1.0に強制、または欠測をhealthyへ写像 |
| 035/036 Web runtime separation、asset placement classification | Web顧客runtimeを本体対象から除外する境界を確認 | HELIX-WEB-OSのtenant/job/credential/service stateを本体Infrastructure ownershipへ混ぜる |
| 037 generation separation/self-host promotion | 1.0のrollback/bootstrap/rebuildabilityを確認し、self-host promotionは必須にしない | candidate self-approval防止機能の完成を1.0必須にする |
| 高度なautoscaling/multi-cloud/fully automatic failover | 1.0のcapacity signal、restore/rollback、independent recoveryを個別に受け入れる | 自動拡張/cloud mix/完全自動failoverが無いことを1.0 blockerにする |

## 後続版要求候補の対受入（すべてversion_target: 1.0より後、版は未定）

これらは個別L2 identityに対応する未実行の受入候補である。1.0では後続版能力の実装・合格を要求しない。下記の例・反例は将来、対象revisionと契約versionが採択された後に実行する。version_targetだけで版、採択、実装許可を作らない。

### HELIXINFRASTRUCTURE-L2-012 Control ResourceとExecution Resourceの隔離

- **入力・手順**：OS/SECURITY control resourceとWorker/CI/Model execution resourceを分けた設計を与え、Worker負荷急増、CI saturation、Model GPU/memory飽和の下で管理・停止・復旧経路を評価する。
- **成功条件**：対象のcontrol pathが識別でき、execution負荷時にも合意済みの管理/停止/復旧操作が届く。境界、evidence、契約versionが揃う。
- **反例**：負荷時にOS/SECURITY制御も停止する、隔離の閾値・方式をこの受入で独自に決める、未知の経路を利用可能として判定する。
- **失敗戻し先**：CORE design/SECURITY policy ownerへ戻し、未検証負荷・未完操作を記録する。

### HELIXINFRASTRUCTURE-L2-013 Failure DomainとSPOF影響

- **入力・手順**：local machine、VPS、GPU node、network、provider、database、storageを別々にfailure注入し、依存先と復旧経路を照合する。冗長化しないSPOFには影響・復旧・受容理由を入力する。
- **成功条件**：故障ごとに停止範囲、影響する機構/job/data、適格な復旧先、未復旧義務が示される。受容SPOFの根拠を辿れる。
- **反例**：資源一覧のみでimpactを合格にする、SPOFを記録なく受容する、複数region/providerやredundancyを一律必須にする。
- **失敗戻し先**：resource/design ownerへ戻し、impact unknownと復旧未確認を残す。

### HELIXINFRASTRUCTURE-L2-014 OS・LABO Episode Correlation

- **入力・手順**：要求revision、OS ticket/change、Worker execution、Infrastructure resource/deployment/failure/recovery event、生のmetric・費用・容量と、許可/拒否されたLABO data-use scopeを持つepisodeを与える。
- **成功条件**：各eventはsource/revision/correlation IDで相互参照でき、許可された範囲のみLABOへ渡る。時系列上同じepisodeでも因果関係は別の証拠で評価され、拒否・欠測はそのまま見える。構成の良否はLABOが実績として評価し、INFRASTRUCTUREはPatternをBRAINへ直接昇格させない。
- **反例**：correlation IDだけから原因を確定する、拒否またはdata-use不明のeventを送る、HELIXOS stage release identityをInfrastructure runtime revisionとして使う。
- **失敗戻し先**：OS/Infrastructure/LABOの発生元ownerへ戻し、未送信eventと未完の因果調査を保持する。

### HELIXINFRASTRUCTURE-L2-015 Infrastructure Change Impactと段階適用

- **入力・手順**：Infrastructure change candidateを用意し、影響資源・機構・依存job・environment・data・rollback targetを特定する。candidate/isolation-or-shadow/partial/verified/promoted各状態、SECURITY update acceptanceの有無、部分失敗を試す。
- **成功条件**：impact setとscopeを事前提示し、SECURITY受入後に限って許可された次状態へ進む。各段階のartifact/contract/dependency version、verification evidence、rollback targetを結び、部分成功を分離する。
- **反例**：SECURITY acceptance前にpromoteする、unknown impactを影響なしにする、HELIXOS-L2-014のstage releaseとInfrastructure updateを同一identityにする、常に全HELIX停止を要求する。
- **失敗戻し先**：change/SECURITY/resource ownerへ戻し、candidateまたは直前適格状態を保持する。未完verification/rollback義務を残す。

### HELIXINFRASTRUCTURE-L2-016 Provider PortabilityとHybrid Placement

- **入力・手順**：provider-neutral capability contractに対し、local management/development machine、常時稼働VPS Worker/CI、GPU server上のlocal LLM、cloud serviceの候補を個別・混在で評価する。INTELLIGENCE proposalとOS decisionを別入力にする。
- **成功条件**：各targetのcapability、provider-specific adapter、制約・差分を説明でき、placement決定はOS/INTELLIGENCEへ残る。互換性は実証されたcapability contractの範囲に限る。
- **反例**：単一cloudを要求する、provider名だけで同等性を認定する、INFRASTRUCTURE自身がplacement/costを決定する。
- **失敗戻し先**：capability/adapter ownerへ返し、未評価providerと配置候補を保持する。

### HELIXINFRASTRUCTURE-L2-017 Resource Location ProofとTool-Neutral Operation

- **入力・手順**：Worker/model/state/artifactの所在が既知、移動済み、欠落、競合するcaseを用いる。Terraform/OpenTofu、Ansible、cloud API/provider CLI、local script、container等のoperation resultsを同一契約へ写像する。
- **成功条件**：location evidenceは対象identity/source/revisionと結び、unknown locationを使用許可にしない。異なるtoolの実装結果もHELIX capability/evidence contractで検証でき、tool stateを要求の意味正本にしない。
- **反例**：tool exit codeだけで資源状態を合格にする、所在不明artifactを本番利用する、tool固有schemaをHELIXのmeaning identityとする。
- **失敗戻し先**：resource/tool evidence ownerへ戻し、所在未確認とoperation未完了を保持する。

### HELIXINFRASTRUCTURE-L2-018 Cost AttributionとResource Lifecycle/Decommission

- **入力・手順**：計算/GPU/storage/network/external service/model API/always-on resourceのcost sourceをresource/workloadへ関連付ける。plan/provision/configure/enable/observe/update/degrade/recover/retire/disposeの全stateと、廃棄対象のdependency/data/credential/network/cost/backup/replacementを与える。
- **成功条件**：費用をsource-qualifiedに参照し、判断/予算は別ownerに残る。lifecycle stateの遷移と各decommission checkの結果が追跡でき、不明項目は未完として残る。
- **反例**：resourceを作成しただけでlifecycle完了、使っていないresourceを放置して廃棄済みとする、backup/credential/dependency/cost確認抜けを閉じる、Infrastructureが予算採否を決める。
- **失敗戻し先**：cost/resource/SECURITY/data ownerへ戻し、残存費用・data・credential・代替先の未完義務を保持する。

### HELIXINFRASTRUCTURE-L2-019 Observation Freshness・Collection Confidence

- **入力・手順**：source、observed_at、freshness、collector identity、confidenceまたはunknownを持つ現在・期限切れ・未収集・collector失敗のobservationを与える。
- **成功条件**：healthy/unhealthy/unknown/unobserved/staleを区別し、適用するfreshness ruleとversionを辿れる。1.0最低条件である「観測できないことを健全に変えない」を保持する。
- **反例**：期限切れobservationをcurrentとする、collector停止をhealthyとする、上流定義のないfreshness閾値を新設する。
- **失敗戻し先**：collector/source ownerへ戻し、直近有効値とstale/unknown理由を記録する。

### HELIXINFRASTRUCTURE-L2-020 Web Runtime SeparationとAsset Placement Classification

- **入力・手順**：本体とWebのtenant/runtime、customer job、credential、service state、deploymentを別scopeに置く。またCORE/BRAIN/INTELLIGENCE/LABO assetにSECURITYのinternal-only/service-internal/external/restricted分類を与え、実際の配置先と照合する。
- **成功条件**：owner/scope境界が保たれ、Web customer stateが本体runtime stateへ混入しない。資産配置はSECURITY分類と一致し、出所と配置evidenceを辿れる。
- **反例**：tenant/job/credential/service/deploymentを内部stateへ暗黙統合する、INFRASTRUCTUREがclassificationを作る、restricted/internal assetを許可されない外部serviceへ配置する。
- **失敗戻し先**：WEB-OS/SECURITY ownerへ戻し、cross-scope送信/配置を止めて未解決資産を保つ。

### HELIXINFRASTRUCTURE-L2-021 Running/Candidate Generation Separation

- **入力・手順**：running generationとcandidate generationを分離し、candidateによるself-approval、independent review/verification、SECURITY acceptance、前世代rollbackの各caseを試す。
- **成功条件**：candidateとrunning identityが別で、candidate自身による承認を拒み、独立した検証とauthorityの後だけ昇格できる。更新中も適格な前世代・復旧経路が残る。
- **反例**：candidate自身のpassを唯一の承認証拠にする、rollback可能性を確認せずrunningを置換する、candidate世代だけでcandidateを復旧する。
- **失敗戻し先**：OS/SECURITY/update ownerへ戻し、running維持または前世代rollbackを行う。未完義務を引き継ぐ。

### HELIXINFRASTRUCTURE-L2-022 Capacity-Driven Autoscaling

- **入力・手順**：将来版で採択されたcapacity/scale policy、threshold、resource/workload identity、utilization/queue/saturation、SECURITY authority、OS change ticketを固定してscale-up/downを試す。
- **成功条件**：承認済み条件の範囲だけでresourceを増減し、before/after state、理由、依存version、operation/evidenceを追える。非実行caseは1.0のcapacity signalからOS/INTELLIGENCEへのdecision handoffに留まる。
- **反例**：version_targetのみで自動scaleを許可する、threshold/quota不明のまま実行する、Infraが予算・配置案を採否する、自動scale不在を1.0 blockerにする。
- **失敗戻し先**：policy/authority/rollback unknownなら実行を止め、OS/SECURITY/decision ownerへ戻す。部分operationと未完義務を保持する。

### HELIXINFRASTRUCTURE-L2-023 Multi-cloud Runtime Composition

- **入力・手順**：将来版で採択されたcapability/security/data contractsを固定し、複数cloud resourceを一つのruntime compositionへ接続する。各provider adapter、placement decision、移行・復旧先を別々に記録する。
- **成功条件**：複数providerの実際のcapability・互換性が契約/evidenceで確認され、配置判断はOS/INTELLIGENCEから渡されたscope内に限る。cloudを併用しない1.0構成はこの候補の未実装を理由に失格にしない。
- **反例**：provider名だけで互換とみなす、data/security scopeが異なる環境を同じものとする、未評価providerへ自動配置する。
- **失敗戻し先**：adapter/capability/security ownerへ戻し、稼働中構成と適格な切戻し先を保持する。

### HELIXINFRASTRUCTURE-L2-024 Fully Automatic Failover

- **入力・手順**：将来版で採択されたfailure policy/threshold、failure target、independent recovery path、data/artifact/dependency compatibility、SECURITY authority、OS incident/change identityを固定し、failureを注入して自動切替を評価する。
- **成功条件**：承認されたfailure条件で適格targetへ切替え、data consistency、startup、dependency reconnection、verification、rollback/recovery evidenceを記録する。1.0は手動decisionを含むbackup/restore/rollbackと独立recovery基盤に留まる。
- **反例**：policy/authority不明の自動切替、data consistency未確認の復旧完了扱い、RTO/RPOなど未定数値の新設、完全自動failover不在を1.0 blockerにする。
- **失敗戻し先**：failure confidence/authority/target/consistency不明なら自動切替を止め通常の安全な復旧経路または人の判断主体へ戻す。現行状態、部分切替、未完の復旧義務を残す。

## Worker資源の接続受入（version_target: 1.0）

### HELIXINFRASTRUCTURE-L2-025 Workerと実行資源の接続

- **入力・手順**：同じWorkerとticketを、異なる実資源へ対応づけるcase、資源不足、隔離不能、作業参照の欠落caseを用意する。
- **成功条件**：CPU/memory/GPU/storage/networkとprocess/containerの資源・状態がWorkerと区別される。必要時の移動後もticket、要求、作業責務、未完義務が同じ作業へ辿れ、資源で利用できる隔離がSECURITY条件に対応する。
- **反例**：計算機変更をWorkerの責務消失とする、INFRASTRUCTUREへticket状態を移管する、隔離不能でも成立扱いする、自動配置最適化を本受入の必須条件にする。
- **失敗戻し先**：資源/OS/SECURITYの該当owner。元資源と移動先の状態、未完作業を保持する。

## 判断候補の接続受入（version_target: 1.0より後、版は未定）

### HELIXINFRASTRUCTURE-L2-026 INTELLIGENCEの資源判断候補との接続

- **入力・手順**：配置、容量不足、failure診断、増減、復旧の各候補を対象resource/revisionと根拠付きで渡す。古い観測、未確認診断、authorityのない候補も扱う。
- **成功条件**：候補と観測の出所・状態が別に保たれ、候補から無条件に操作を実行しない。OS/SECURITY/Workerの各責務へ必要な根拠と未完義務を渡せる。
- **反例**：診断候補を確定原因にする、候補受領を実行許可とする、高度な自動増減や完全自動切替の完了を受領条件にする、後続版の全判断能力を1.0容量情報の受渡しの依存にする。
- **失敗戻し先**：INTELLIGENCE/OSへ候補の不明範囲を返し、未解決の配置・診断・復旧を保持する。

## 追跡根拠と未決事項

旧source asset IDs, paths, line/SHA, 保持/変更理由は対となるL2の「旧HELIX source basisと再導出」に記録した。L2と本書は同じ親入力revision・POの18 minimum mapping・後続version境界を共有する。旧sourceは追跡証拠であり、旧L3候補やruntimeの合格基準を新世代へ移すものではない。

受入入力の明示前に、数値capacity、recovery time、retention、cost、provider固有閾値を追加しない。親L1対象revisionと本文採否はPO判断として残る。採否時にはL2/L11の対応revisionをそろえ、要求意味・版境界が変われば影響する受入例と反例を同時に更新する。
