---
title: "HELIX L3 要件 — Infinity Loop system FR/AC"
layer: L3
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-16
owner: TL / PO承認必須
plan: PLAN-L1-07-infinity-loop-platform-requirements
parent_design: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
pair_artifact: docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md
l1_l3_trace: docs/governance/infinity-loop-l1-l3-trace-ledger.md
next_pair_freeze: L10
---

# HELIX L3 要件 — Infinity Loop system FR/AC

## §0 境界

本書はL1の141要求を、system observable behaviorと受入境界へ降下する。L4 component、runtime内部責務、
algorithm、table、CLI引数は本書で確定しない。現在の§1はcoverage edgeであり、141 unique要求へ167 edgeを持つ。
primary owner exactly 1とcross-cutting supporting edgeはL1↔L3 trace台帳で分離し、重複edgeをprimary completenessへ算入しない。
現時点はPO承認前のdraftであり、G3 freezeを主張しない。

## §1 System FR

| L3 FR | coverage L1要求（primary＋supporting） | system動作 | 事前条件 → 事後条件 | failure / evidence | AC |
|---|---|---|---|---|---|
| HR-FR-HIL-01 | HIL-BR-12, HIL-FR-02, HIL-FR-03, HIL-NFR-01, HIL-NFR-05 | user、GitHub、product、source入力をsource/cause/digest/authority付きversioned Issue contractへexactly-once正規化し、外部本文を命令として実行しない | source識別可能・current schemaあり → durable intake、contract revision、routeが一意 | field欠落、同operation異payload、未信頼命令実行 / intake event、contract digest、conflict/trust receipt | HAC-HIL-01a, HAC-HIL-01b, HAC-HIL-01c |
| HR-FR-HIL-02 | HIL-BR-01, HIL-BR-10, HIL-FR-01, HIL-NFR-04 | admitted contractを定義済み工程順でForwardへ収束させ、全eventを同一causalityへjoinしbudget境界でcheckpointする | admitted contract・budgetあり → valid next stateまたはdurable stop、orphan 0 | illegal transition、causality断絶、budget後継続 / transition、projection、closure、checkpoint receipt | HAC-HIL-02a, HAC-HIL-02b, HAC-HIL-02c |
| HR-FR-HIL-03 | HIL-BR-02, HIL-BR-17, HIL-FR-09, HIL-FR-30 | 全base/stacked PR deliveryをcurrent head監査jobへ冪等変換し、actionable findingをIssue/Reverse/memory/Codex queueへ原子的昇格する | delivery/head/policyあり → job最大1件、全target同一cause commit | stale head、duplicate job、finding drop/partial promotion / delivery、job、disposition、promotion lineage | HAC-HIL-03a, HAC-HIL-03b, HAC-HIL-03c |
| HR-FR-HIL-04 | HIL-BR-04, HIL-BR-05, HIL-FR-04, HIL-FR-05, HIL-FR-08, HIL-FR-31, HIL-FR-35, HIL-NFR-03, HIL-NFR-20 | 全IssueのR0–R4 substanceを実装前に検査し、設計欠陥を影響layerのRedesignへ送り再freeze後だけForward claimを許す | drive/scope/evidenceあり → substantive Reverse＋正しいre-entry | skip、空洞、誤layer、L0無承認、re-entry bypass / phase、coverage、redesign、stale/re-freeze receipt | HAC-HIL-04a, HAC-HIL-04b, HAC-HIL-04c |
| HR-FR-HIL-05 | HIL-BR-06, HIL-BR-07, HIL-BR-08, HIL-FR-06, HIL-FR-07, HIL-FR-36, HIL-FR-38, HIL-NFR-06, HIL-NFR-07, HIL-NFR-21, HIL-NFR-23 | directiveを分類前に収載し、全Issue Gateをauthority root、最小性、approval、evidenceで決定論評価する | durable directive・policy・rootあり → 証拠充足時のみ遷移 | AI終端、scope cycle、不要拡張、approval欠落 / custody、gate、authority graph、approval receipt | HAC-HIL-05a, HAC-HIL-05b, HAC-HIL-05c |
| HR-FR-HIL-06 | HIL-BR-16, HIL-BR-20, HIL-FR-28, HIL-FR-29, HIL-NFR-15, HIL-NFR-16 | prejoin→postjoin→external CIを同一SHA/tree lineageで実行し既知failureだけを限定隔離する | tree/check/quarantine policyあり → 三段greenまたは該当段failure | stage bypass、別SHA、wildcard/期限切れ/new fingerprint隔離 / CI、lineage、quarantine、remediation evidence | HAC-HIL-06a, HAC-HIL-06b, HAC-HIL-06c |
| HR-FR-HIL-07 | HIL-BR-03, HIL-BR-11, HIL-FR-10, HIL-FR-14, HIL-NFR-02 | verified completionから永続知識だけをmemoryへ昇格し、finding/repairをrecipe→shadow→skill/detector/gateへ独立promoterで段階昇格する | completion/history、worker≠promoter → compact/no-promotionと検証済promotion | raw log/secret混載、self-promotion、fixture/効果/rollback欠落 / compaction、shadow、review、rollback receipt | HAC-HIL-07a, HAC-HIL-07b, HAC-HIL-07c |
| HR-FR-HIL-08 | HIL-BR-09, HIL-BR-18, HIL-FR-10, HIL-FR-11, HIL-FR-12, HIL-FR-13, HIL-FR-32, HIL-NFR-02, HIL-NFR-10, HIL-NFR-18 | HARNESS-owned contractからbounded teamを決定し、role authority、parent-child causality、lease/run/checkpoint/timeout/retry/verify/compaction/release/dead-letter/quarantine/retireとevidence custodyをfencing付き正本化する | versioned registry、task、eligible roles、spawn/deadline/custody policy → 再生成可能projection、単一lease、独立verify、compaction/custody receipt | manual drift、worker=verifier、spawn上限/authority逸脱、二重lease、旧fence、不正遷移、retry exhaustion、未圧縮release、custody切断 / contract、muster、lease、lifecycle、verify、compaction、chain-of-custody receipt | HAC-HIL-08a, HAC-HIL-08b, HAC-HIL-08c |
| HR-FR-HIL-09 | HIL-BR-14, HIL-FR-15, HIL-FR-16, HIL-FR-21, HIL-FR-22, HIL-FR-37, HIL-TR-03, HIL-NFR-08, HIL-NFR-12, HIL-NFR-22 | ZIP、前身repository exact 2件（`unison-ai-product/UT-TDD_AGENT-HARNESS`、`RetryYN/ai-dev-kit-vscode`）のcurrent advertised `heads/tags/pull` authority、現行全treeをsnapshot化しatomic behaviorへ分解して採否→requirement→design→test→gateをjoinする。Git authorityはadvertisement A/B一致、exact OID materialize、object/tree/tag peel検証、project-owned immutable CAS、retention/access/revocation/freshness、bundle/ref/tree/edge receipt、offline manifest、restore drillを閉じたsealed receiptからだけ受理し、ref/content/edge分母をreceiptから導出する | source/ref/entryとextractor version、exact 2 trusted authority/custody receiptあり → atom分母、disposition、trace、pending/orphan 0 | aggregate-only、未分類/重複、remote identity不一致、A/B drift、ref/object欠落、CAS escape/mutation、stale、offline/restore欠落、prose-only、Python write / manifest、atom、decision、edge、stale receipt | HAC-HIL-09a, HAC-HIL-09b, HAC-HIL-09c |
| HR-FR-HIL-10 | HIL-FR-15, HIL-FR-25, HIL-FR-26, HIL-TR-03, HIL-NFR-13 | Hybrid ZIPのPython engine/toolをtool digest単位で原則保全し、runtime reuse判定とsemantic採否を別receiptにしてversioned registryから決定論実行する。既存Python behaviorのTS/Node bulk portとNode control/gate/commitのPython移植をdefaultにせず、artifactとfindingを別authorityで保存する | registered tool/version/config、fixed snapshot、adoption receipt → behavior parity、rerun同一digest/fingerprint、Node再検証 | 根拠なきrewrite、runtime/semantic判定混同、logic fork、unknown version、nondeterminism、provenance欠落、partial commit / tool adoption、parity、run、artifact、finding、rerun evidence | HAC-HIL-10a, HAC-HIL-10b, HAC-HIL-10c |
| HR-FR-HIL-11 | HIL-BR-15, HIL-FR-23, HIL-FR-24, HIL-NFR-17 | versioned read connectorでfull/incremental product dataをlineage/freshness/schema/redaction付きprojectionへ変換する | connector policy/auth reference/cursorあり → canonical snapshot/entities/watermark | drift、cursor逆行、stale/tombstone無視、PII/secret、直接write / connector、snapshot、redaction、quarantine receipt | HAC-HIL-11a, HAC-HIL-11b, HAC-HIL-11c |
| HR-FR-HIL-12 | HIL-FR-27, HIL-TR-02, HIL-TR-07, HIL-TR-08, HIL-TR-09, HIL-TR-10, HIL-NFR-14 | NodeがPython workerをversioned JSON Lines IPCで監督し、検証済みresultだけをNode authorityでtransaction commitする | compatible protocol、deadline/lease、authority map → terminal receipt一件、Node writeのみ | protocol/JSON/size/timeout/crash/backpressure/late/direct write / envelope、process、schema、transaction、projection report | HAC-HIL-12a, HAC-HIL-12b, HAC-HIL-12c |
| HR-FR-HIL-13 | HIL-BR-19, HIL-FR-33, HIL-TR-01, HIL-TR-11 | active install/build/CLI/hooks/tests/package/distributionをNode.js LTSへ移しBun dependencyを0にする | Bun-less Linux、Node lock、surface inventory → 全surface green、active finding 0 | Bun API/command/lock/CI/distribution残存、部分互換の完了claim / inventory、workflow logs、lock、package smoke | HAC-HIL-13a, HAC-HIL-13b, HAC-HIL-13c |
| HR-FR-HIL-14 | HIL-FR-34, HIL-TR-04, HIL-TR-05, HIL-TR-06, HIL-NFR-09, HIL-NFR-19 | OS差分をadapterへ隔離しLinux full、macOS portable、Windows compatibilityを同一contractで検証、lock/SBOM/policyを再現する | clean 3 OS、canonical locks/policy → scope別green、domain fork 0、SBOM/policy receipt | adapter leak、process/lock異常、unlock、secret、license / OS matrix、difference、offline digest、SBOM reports | HAC-HIL-14a, HAC-HIL-14b, HAC-HIL-14c |
| HR-FR-HIL-15 | HIL-BR-13, HIL-FR-17, HIL-FR-18, HIL-FR-19, HIL-FR-20, HIL-NFR-11 | 全PLANをprototype_required/not_applicableへ分類し、前者はprototype→walkthrough→backprop/agreement、後者は構造skipでのみL3 freezeする | scope digest/policyあり → current agreementまたはno-UI receipt | implicit/deferred、static-only、state/walkthrough欠落、stale skip / applicability、artifact、walkthrough、delta、agreement | HAC-HIL-15a, HAC-HIL-15b, HAC-HIL-15c |
| HR-FR-HIL-16 | HIL-BR-21, HIL-FR-39, HIL-FR-40, HIL-NFR-24, HIL-NFR-25 | DesignRefactor候補をsemantic/consumer/oracle同等性で評価し、behavior保存はRefactor、contract変更はRedesign、state変更はRetrofitへ送る | before graph/oracle/consumer/role catalog → 最小plan、pair/oracle/rollback | lexical-only rename、根拠なし抽象化、誤route、consumer漏れ / signatures、graph、oracle、role/name、route receipt | HAC-HIL-16a, HAC-HIL-16b, HAC-HIL-16c |
| HR-FR-HIL-17 | HIL-BR-22, HIL-BR-23, HIL-BR-24, HIL-FR-41, HIL-FR-42, HIL-FR-43, HIL-FR-44, HIL-FR-45, HIL-NFR-26, HIL-NFR-27, HIL-NFR-28 | 原文をauthority付きatomic requirementへ翻訳し、design obligationとstable revision/edge/change receiptを正本化、template gapをshadow reviewへ送る | custodied source/authority、versioned template → active atomに全typed edge、未消込/ambiguity 0 | 原文消失、aggregate/TBD/偽N/A、self-promotion、stale伝播欠落 / revision、challenge、template、obligation、gap/review/change receipt | HAC-HIL-17a, HAC-HIL-17b, HAC-HIL-17c |
| HR-FR-HIL-18 | HIL-BR-25, HIL-FR-46, HIL-FR-47, HIL-FR-48, HIL-FR-49, HIL-FR-50, HIL-NFR-29 | L1–L12 ledgerをversion管理しtemplate obligationを抽出、上下隣接pairと正規6 V-pairを同一revision/snapshot/oracleで閉じ、refactorも全pairを保存する | active registry/template/snapshot/pair map → 全atom disposition、双方向edge、実行oracle | type/抽出/TBD/aggregate、片edge、revision/oracle不一致、pair破壊 / ledger、addition、pair、execution、refactor receipt | HAC-HIL-18a, HAC-HIL-18b, HAC-HIL-18c |
| HR-FR-HIL-19 | HIL-BR-13, HIL-BR-25, HIL-FR-01, HIL-FR-05, HIL-FR-20, HIL-FR-31, HIL-FR-49 | Hybrid L1–L12を唯一の工程authorityとし、production Scrumの各vertical sliceで`L3 AC→L5 test design→L7 Red→L6 Green→L7 closure→L8–L12`を完走する | current L2 agreement/skip、slice contract、pair map → 圧縮V receiptとS4 outcome | UT L0–L14 authority混入、Scrum=PoC、prototype未決、Red後置 / authority、slice、Red/Green、V-pair receipt | HAC-HIL-19a, HAC-HIL-19b, HAC-HIL-19c |
| HR-FR-HIL-20 | HIL-BR-26, HIL-BR-27, HIL-FR-51, HIL-FR-52, HIL-FR-53, HIL-TR-12, HIL-NFR-30, HIL-NFR-32, HIL-NFR-34 | Universal ZIP全entryをtyped packageへ分類してraw実行を隔離し、適用質問を発火して回答からworkflow modelを正規化する | sealed ZIP、custodied input、catalog/schema version → 全entry disposition、question receipt、current model | raw activation、schema/example矛盾、既回答再質問、unknown ref、推測確定 / manifest、interview、model、challenge receipt | HAC-HIL-20a, HAC-HIL-20b, HAC-HIL-20c |
| HR-FR-HIL-21 | HIL-BR-28, HIL-FR-54, HIL-FR-55, HIL-NFR-31, HIL-NFR-32 | atomic workflowのbranch、loop、terminal、exception、permission、dataを検査し、各transitionをrequirement/AC/test/derived surfaceへexact joinする | current workflow model、derivation policy → atomic coverageとtyped outputs | branch/loop/terminal欠落、aggregate green、source transition不明 / completeness、requirement、AC/test、surface receipt | HAC-HIL-21a, HAC-HIL-21b, HAC-HIL-21c |
| HR-FR-HIL-22 | HIL-BR-29, HIL-FR-56, HIL-NFR-33, HIL-NFR-34 | switch/route/schedule/resource policyをcapability、capacity、concurrency、budget、deadline、priority、fairness、fallback/dead-letterまで計画しAgent Muster/Lifecycleへ渡す | candidate/resource/policyあり → replay可能planまたはbounded checkpoint/fallback | task/evidence drop、resource理由の処理省略、route/candidate不在 / plan、allocation、reallocation、checkpoint receipt | HAC-HIL-22a, HAC-HIL-22b, HAC-HIL-22c |
| HR-FR-HIL-23 | HIL-BR-30, HIL-FR-57, HIL-FR-58, HIL-NFR-35, HIL-NFR-36 | projectと登録外部serviceの通常操作をCanonical Action Intentと最小権限profileへ照合し無質問で許可する | current profile、exact target、routine risk → authority verdict | broad prefix、自由文包括許可、未登録target、expired profile / intent、profile、match receipt | HAC-HIL-23a, HAC-HIL-23b, HAC-HIL-23c |
| HR-FR-HIL-24 | HIL-FR-59, HIL-FR-60, HIL-TR-13, HIL-NFR-37, HIL-NFR-38 | platform permissionとHELIX authorityを分離し、許可済み操作をbounded/idempotentに実行し他gateを上書きしない | allowed intent、platform capability → execution/deny receipt | identity drift、revocation、high-impact bypass、hook enforcement過大主張 / gate、broker、execution、platform receipt | HAC-HIL-24a, HAC-HIL-24b, HAC-HIL-24c |
| HR-FR-HIL-25 | HIL-BR-22, HIL-BR-23, HIL-BR-24, HIL-FR-42, HIL-FR-43, HIL-FR-45, HIL-NFR-26, HIL-NFR-28, HIL-NFR-32 | 全162要求のsource authority、ambiguity、oracle、template、design obligation、上下左右pair、L4 decisionを閉じ、未決定0だけをfreezeする | sealed source set、全ledger current → freeze receiptまたは不足一覧 | ID/行数/pointerだけの完了claim、stale/N/A/TBD算入 / denominator、closure、independent review receipt | HAC-HIL-25a, HAC-HIL-25b, HAC-HIL-25c |
| HR-FR-HIL-26 | HIL-BR-14, HIL-BR-20, HIL-FR-16, HIL-FR-22, HIL-NFR-12, HIL-NFR-22 | UT全branchからgreen/confirmed behavior atomを採用候補化し、未完branchはsource evidenceとして保持、Hybrid authorityへanti-corruption変換する | all-ref authority、CI/PLAN status、atom ledger → adopt/harden/redesign/reject未判断0 | layer/mode/runtimeの無変換移植、red WIPを完成扱い、branch omission / ref、CI、atom、translation receipt | HAC-HIL-26a, HAC-HIL-26b, HAC-HIL-26c |
| HR-FR-HIL-27 | HIL-FR-61 | Prototype Agreementをtyped schemaと人のagreement authorityへbindする | current L2 scope/prototype → versioned agreement | field/actor/digest欠落 / schema、agreement、pair receipt | HAC-HIL-27a, HAC-HIL-27b, HAC-HIL-27c |
| HR-FR-HIL-28 | HIL-FR-62 | L2要求/prototypeをimplementation-neutralに保つ | requirement discovery input → neutral artifact | framework/symbol/credential混入 / neutrality receipt | HAC-HIL-28a, HAC-HIL-28b, HAC-HIL-28c |
| HR-FR-HIL-29 | HIL-FR-63 | screen designとimplementationの二重lifecycleを独立遷移させる | lifecycle events → orthogonal current projections | cross-axis推測/不正遷移 / event、transition receipt | HAC-HIL-29a, HAC-HIL-29b, HAC-HIL-29c |
| HR-FR-HIL-30 | HIL-FR-64 | semantic IDをL2からL12まで維持する | ID registry＋全layer edges → continuity graph | orphan/silent rename/merge / change receipt | HAC-HIL-30a, HAC-HIL-30b, HAC-HIL-30c |
| HR-FR-HIL-31 | HIL-FR-65 | Experience/UI/Frontend contractを分離しIDでexact joinする | three schemas → joined contract graph | field複製/暗黙変換 / separation receipt | HAC-HIL-31a, HAC-HIL-31b, HAC-HIL-31c |
| HR-FR-HIL-32 | HIL-FR-66 | Pattern ContractでAI compositionを拘束する | current policy＋profile → constrained proposal | blank generation/forbidden pattern / policy verdict | HAC-HIL-32a, HAC-HIL-32b, HAC-HIL-32c |
| HR-FR-HIL-33 | HIL-FR-67 | Product UI Profileをshared Rule Packから隔離する | shared policy＋product profile → composed effective profile | common policy contamination / profile receipt | HAC-HIL-33a, HAC-HIL-33b, HAC-HIL-33c |
| HR-FR-HIL-34 | HIL-FR-68 | L8でRegion/Slotのvisual bindingとroute/data/state/action境界を9状態・negative pathまで検証する | L5 binding＋screen revision＋state/role fixtures → L8 exact trace/evidence | missing edge、偽N/A、state/role/failure未実行 / binding/state/render receipt | HAC-HIL-34a, HAC-HIL-34b, HAC-HIL-34c |
| HR-FR-HIL-35 | HIL-FR-69 | UI-M0..M7をtest-firstでL5→L7 Red→L6 Green→L7 closureへ進める | mission obligations＋Red → code＋verified result | order違反/mission drop / mission receipt | HAC-HIL-35a, HAC-HIL-35b, HAC-HIL-35c |
| HR-FR-HIL-36 | HIL-FR-70 | implementedを独立mission receiptからのみ導出する | all current mission receipts → projection | authored status/self-verification / independence receipt | HAC-HIL-36a, HAC-HIL-36b, HAC-HIL-36c |
| HR-FR-HIL-37 | HIL-FR-71 | false frontend completionをadversarialに検出する | implementation claim＋negative fixtures → verdict | count/placeholder/static-only合格 / finding receipt | HAC-HIL-37a, HAC-HIL-37b, HAC-HIL-37c |
| HR-FR-HIL-38 | HIL-FR-72 | L9で全画面のresponsive/token/geometry/focus continuityを固定matrixで実render検証する | L4 profile＋screen/state/viewport/theme/locale/text-scale matrix → VRT/trace receipt | overflow、breakpoint drift、宣言のみ、matrix欠落 / L9 visual integration receipt | HAC-HIL-38a, HAC-HIL-38b, HAC-HIL-38c |
| HR-FR-HIL-39 | HIL-FR-73 | L9でmotion budget/reduced-motion/layout-shift continuityとbaseline lifecycleを検証する | motion contract＋cross-screen runtime＋baseline review → measurement | budget/fallback欠落、flaky隠蔽、baseline laundering / L9 motion receipt | HAC-HIL-39a, HAC-HIL-39b, HAC-HIL-39c |
| HR-FR-HIL-40 | HIL-FR-74 | L9でsurface class、expression budget、pattern/token/asset/overlayの全画面一貫性を検証する | L4 policy→L6 code→L9 evidence | class不明、budget不一致、variant orphan、overlay collision / L9 surface receipt | HAC-HIL-40a, HAC-HIL-40b, HAC-HIL-40c |
| HR-FR-HIL-41 | HIL-FR-75 | visual-a11yをL4 policyからL8/L9/L10 runtimeへ閉じ、semantic a11y ownerとjoinする | policy/oracle/Red/code/visual measurement＋semantic receipt → closure | post-hoc/static-only/measurementまたはexternal receipt欠落 / visual-a11y receipt | HAC-HIL-41a, HAC-HIL-41b, HAC-HIL-41c |
| HR-FR-HIL-42 | HIL-FR-76 | L10でbrowser/OS/viewport/preference/product-data matrixをScreen FR/AC/NFRへexact joinする | current screen/AC denominator＋pinned product snapshot → machine system exit | synthetic-only、stale data、実browserなし、evidence再利用 / L10 matrix receipt | HAC-HIL-42a, HAC-HIL-42b, HAC-HIL-42c |
| HR-FR-HIL-43 | HIL-FR-77 | UI gapをtyped deltaとauthority付きdriveへrouteする | observed gap → approved route/stale edges | AI自己承認/誤drive/履歴消失 / delta receipt | HAC-HIL-43a, HAC-HIL-43b, HAC-HIL-43c |
| HR-FR-HIL-44 | HIL-FR-78 | Design Capsuleへ5 context digestとapplicabilityを封入する | task/layer scope → bounded capsule | silent omission/stale/worker-verifier混同 / capsule receipt | HAC-HIL-44a, HAC-HIL-44b, HAC-HIL-44c |
| HR-FR-HIL-45 | HIL-FR-79 | L11でL2 visual intentとL8–L10 machine evidenceを人間が視覚・体験・preference判定する | current agreement＋同revision evidence＋authority matrix → criteria別human verdict | AI代行、stale packet、criterionなし、FAIL/UNCERTAIN close / L11 judgment・Redesign receipt | HAC-HIL-45a, HAC-HIL-45b, HAC-HIL-45c |
| HR-FR-HIL-46 | HIL-FR-80 | Git tagを単独保存点とせずcommit/tag/checkpoint/digest/authority/CIを一体の復元可能savepointにする | clean/pushed commit＋checkpoint＋digest bundle → remote annotated tag＋savepoint receipt＋restore dry-run | lightweight/local-only/moved tag、dirty tree、未push、DB projection不一致、release混同 / create・remote verify・restore receipt | HAC-HIL-46a, HAC-HIL-46b, HAC-HIL-46c |
| HR-FR-HIL-47 | HIL-FR-81 | L1–L12 layer tagを工程freeze証明として工程表/harness.dbへ投影する | current layer gate＋pair receipt＋ancestor/supersession proof → remote layer tag＋progress projection | skipped layer、非祖先、片肺pair、tag移動、Sprint/release混同、旧SHA / layer-tag・ancestry・pair receipt | HAC-HIL-47a, HAC-HIL-47b, HAC-HIL-47c |

## §2 受入条件

| FR | 正常系 | 異常系 | 境界・回復系 |
|---|---|---|---|
| HR-FR-HIL-01 | HAC-HIL-01a: 全source入力が同一contract形へ収束 | HAC-HIL-01b: duplicateは副作用0、異payloadはconflict | HAC-HIL-01c: injection本文を隔離しdispatch 0 |
| HR-FR-HIL-02 | HAC-HIL-02a: 正常loopが順序・causalityを保持 | HAC-HIL-02b: transition/edge欠落を拒否 | HAC-HIL-02c: budget境界で停止し同checkpoint再開 |
| HR-FR-HIL-03 | HAC-HIL-03a: 全PR lifecycleを各一回監査 | HAC-HIL-03b: stale/duplicateからjob 0 | HAC-HIL-03c: promotionは全commitまたはrollback |
| HR-FR-HIL-04 | HAC-HIL-04a: R0–R4＋正route後のみclaim | HAC-HIL-04b: hollow/skip/漏れをphase別拒否 | HAC-HIL-04c: L1/L2/L0をstale/re-entry/escalationへ分岐 |
| HR-FR-HIL-05 | HAC-HIL-05a: 全receipt＋acyclic authorityで遷移 | HAC-HIL-05b: AI終端/cycle/欠落を拒否 | HAC-HIL-05c: high-impactはsnapshot-bound approval待ち |
| HR-FR-HIL-06 | HAC-HIL-06a: 同一lineage三段green | HAC-HIL-06b: failure/別lineageで後続0 | HAC-HIL-06c: exact既知だけ期限付きquarantine |
| HR-FR-HIL-07 | HAC-HIL-07a: knowledgeとcontinuationを分離 | HAC-HIL-07b: 禁止内容/self-promotionを拒否 | HAC-HIL-07c: shadow改善だけ昇格、退行rollback |
| HR-FR-HIL-08 | HAC-HIL-08a: 同入力から同team/lifecycle/role authority/spawn limitを再現し、worker≠verifierかつ全child causalityを保持 | HAC-HIL-08b: drift/二重claim/旧fence/権限外tool/再帰・depth・fan-out・active上限超過/late write/不正custodyを個別拒否 | HAC-HIL-08c: deadline、failure taxonomy、max retry/backoff/exhaustion/dead-letter、durable checkpoint再開、独立verify→compaction receipt→release、quarantine/retireを全状態・遷移の固定分母で再現 |
| HR-FR-HIL-09 | HAC-HIL-09a: ZIP＋exact 2 trusted Git authority/custody＋current HEADからreceipt由来のref/content/edge分母とatomic trace生成 | HAC-HIL-09b: parent-only/child欠落/overlap、advertised ref omission/extra、unverified object、CAS policy/receipt/offline manifest/restore drill欠落でfreeze拒否 | HAC-HIL-09c: remote identity、advertisement A/B、namespace/CAS/retention/access policy、fresh-until、source/extractor変更・失効で旧authority以降をstale |
| HR-FR-HIL-10 | HAC-HIL-10a: 29 toolをdigestでjoinしPython behavior parity、runtime reuse判定、semantic採否、Node再検証を個別証明 | HAC-HIL-10b: 根拠なき相互移植、判定軸混同、logic fork、unknown/evidence欠落/partialを拒否 | HAC-HIL-10c: rerun差異をquarantineしtool別にharden/redesign/rejectへ再判定 |
| HR-FR-HIL-11 | HAC-HIL-11a: full/incrementalをlineage付きcurrentへ | HAC-HIL-11b: drift/regression/PIIで昇格0 | HAC-HIL-11c: stale/tombstoneを明示し再取得 |
| HR-FR-HIL-12 | HAC-HIL-12a: 正常resultを一回commit | HAC-HIL-12b: IPC異常をterminal化しpartial 0 | HAC-HIL-12c: cancel/timeout後late/direct write拒否 |
| HR-FR-HIL-13 | HAC-HIL-13a: Bun-less Linuxでend-to-end green | HAC-HIL-13b: 全active残存形を検出 | HAC-HIL-13c: historical allowlistをactiveと分離 |
| HR-FR-HIL-14 | HAC-HIL-14a: 3 OSが定義scopeをgreen | HAC-HIL-14b: adapter leak/path/process/lock異常拒否 | HAC-HIL-14c: online/offline同一lock/SBOM/policy |
| HR-FR-HIL-15 | HAC-HIL-15a: no-UI構造skipでfreeze | HAC-HIL-15b: UIはprototype/walkthrough/agreement前freeze拒否 | HAC-HIL-15c: scope変更でstale化しL2再entry |
| HR-FR-HIL-16 | HAC-HIL-16a: semantic同等の最小改善だけRefactor | HAC-HIL-16b: lexical-only/汎用化を拒否 | HAC-HIL-16c: internal/public/DBを3 routeへ分岐 |
| HR-FR-HIL-17 | HAC-HIL-17a: atom/challengeを決定routeし完全revisionだけactive | HAC-HIL-17b: TBD/N/A/orphan/change欠落でfreeze拒否 | HAC-HIL-17c: template gapは独立review前active 0 |
| HR-FR-HIL-18 | HAC-HIL-18a: L1–L12抽出と正規6 pair current | HAC-HIL-18b: 任一atom/edge/oracle欠落でexit拒否 | HAC-HIL-18c: pair保存だけRefactor、他はRedesign/Retrofit |
| HR-FR-HIL-19 | HAC-HIL-19a: production sliceがL1–L12圧縮Vを内包 | HAC-HIL-19b: prototype/AC/test-design/Red欠落を拒否 | HAC-HIL-19c: Discovery/PoCをReverse/Redesign経由で再entry |
| HR-FR-HIL-20 | HAC-HIL-20a: 全entry disposition＋全適用質問＋current workflow model | HAC-HIL-20b: raw activation/schema drift/unknown ref/未回答completeを拒否 | HAC-HIL-20c: 同一入力/versionで同digest、gapはshadow改善Issueへ |
| HR-FR-HIL-21 | HAC-HIL-21a: 全transitionがrequirement/AC/test/surfaceへexact join | HAC-HIL-21b: branch/loop/terminal/exception/data/permission欠落でfreeze拒否 | HAC-HIL-21c: screen/template gapを既存gateへroutingし直接commit 0 |
| HR-FR-HIL-22 | HAC-HIL-22a: 完全なswitch/route/schedule/resource planを生成 | HAC-HIL-22b: candidate/resource不足時もtask/evidence drop 0 | HAC-HIL-22c: bounded reallocation/fallback/dead-letterを全てreceipt化 |
| HR-FR-HIL-23 | HAC-HIL-23a: covered routine operationを質問0で許可 | HAC-HIL-23b: broad/expired/unregisteredを拒否 | HAC-HIL-23c: profile改訂・revocationを即時反映 |
| HR-FR-HIL-24 | HAC-HIL-24a: allowed intentをbounded exactly-once実行 | HAC-HIL-24b: drift/high-impact/他gate bypassを拒否 | HAC-HIL-24c: platform prompt不可時もauthorityを偽装せず停止 |
| HR-FR-HIL-25 | HAC-HIL-25a: 162/162 semantic obligation currentでfreeze | HAC-HIL-25b: 任一missing/stale/TBDでfreeze拒否 | HAC-HIL-25c: revisionで関連freezeをstale化し再監査 |
| HR-FR-HIL-26 | HAC-HIL-26a: UT全ref atomを未判断0へ | HAC-HIL-26b: authority/runtime/process無変換移植を拒否 | HAC-HIL-26c: upstream driftで採用receiptをstale化 |
| HR-FR-HIL-27 | HAC-HIL-27a: typed fieldと人のagreementでL2/L11 pair成立 | HAC-HIL-27b: field/actor/revision/digest欠落を拒否 | HAC-HIL-27c: scope/prototype変更でagreementをstale化 |
| HR-FR-HIL-28 | HAC-HIL-28a: 同じ要求意味を実装非依存artifactで再現 | HAC-HIL-28b: framework/symbol/credential混入を拒否 | HAC-HIL-28c: implementation hintをL5候補へ隔離 |
| HR-FR-HIL-29 | HAC-HIL-29a: 二軸が独立eventから再構築可能 | HAC-HIL-29b: 一軸完了から他軸完了推測を拒否 | HAC-HIL-29c: 不正eventをquarantineしprojection不変 |
| HR-FR-HIL-30 | HAC-HIL-30a: 全semantic IDがL2–L12へ到達 | HAC-HIL-30b: orphan/silent rename/split/mergeを拒否 | HAC-HIL-30c: change receiptで全consumerをstale化 |
| HR-FR-HIL-31 | HAC-HIL-31a: 3 contractがIDでexact join | HAC-HIL-31b: schema責務混在とfield複製を拒否 | HAC-HIL-31c: version差をmigration edgeへroute |
| HR-FR-HIL-32 | HAC-HIL-32a: pattern内のproposalだけ生成 | HAC-HIL-32b: blank generationとforbidden patternを拒否 | HAC-HIL-32c: gapをPattern改善Issueへ送る |
| HR-FR-HIL-33 | HAC-HIL-33a: shared＋productからeffective profile再現 | HAC-HIL-33b: product値のshared逆書きを拒否 | HAC-HIL-33c: profile変更でconsumer evidenceをstale化 |
| HR-FR-HIL-34 | HAC-HIL-34a: 全Region/Slot×9状態×negative pathがL5 bindingへjoin | HAC-HIL-34b: missing/偽N/A/orphan/未実行stateを拒否 | HAC-HIL-34c: screen/binding revision変更でL8 evidence stale |
| HR-FR-HIL-35 | HAC-HIL-35a: 全M0..M7がRed先行でverified | HAC-HIL-35b: Green先行/order違反/mission dropを拒否 | HAC-HIL-35c: failed missionだけ再実行し分母保持 |
| HR-FR-HIL-36 | HAC-HIL-36a: all-receiptからimplemented=true導出 | HAC-HIL-36b: authored/self-verified statusを拒否 | HAC-HIL-36c: receipt staleでprojectionをfalseへ戻す |
| HR-FR-HIL-37 | HAC-HIL-37a: real完成をpositive oracleで合格 | HAC-HIL-37b: count/placeholder/generic/static claimを検出 | HAC-HIL-37c: findingをUiChangeDeltaへroute |
| HR-FR-HIL-38 | HAC-HIL-38a: L9 critical visual matrixが全画面でgreen | HAC-HIL-38b: overflow/pattern drift/宣言のみ/matrix欠落を拒否 | HAC-HIL-38c: viewport/theme/locale追加でmatrix stale |
| HR-FR-HIL-39 | HAC-HIL-39a: cross-screen motionとreduced-motion、baseline reviewがgreen | HAC-HIL-39b: runtime超過/fallback欠落/flaky隠蔽/launderingを拒否 | HAC-HIL-39c: motion/baseline revisionで再測定 |
| HR-FR-HIL-40 | HAC-HIL-40a: class/pattern/token/asset/overlayが全画面で閉じる | HAC-HIL-40b: unknown class/budget/variant/overlay逸脱を拒否 | HAC-HIL-40c: policy変更で全L9 evidence stale |
| HR-FR-HIL-41 | HAC-HIL-41a: visual-a11y chain＋semantic owner receiptがcurrent | HAC-HIL-41b: post-hoc/static-only/未測定/owner欠落を拒否 | HAC-HIL-41c: visual/semantic差異を原因層へbackprop |
| HR-FR-HIL-42 | HAC-HIL-42a: 全Screen AC×browser/data matrix current | HAC-HIL-42b: synthetic-only/stale/実browserなし/evidence水増しを拒否 | HAC-HIL-42c: environment/data revisionで全matrix stale |
| HR-FR-HIL-43 | HAC-HIL-43a: deltaが正しいdriveとaffected pairへ到達 | HAC-HIL-43b: AI自己承認/誤route/履歴消失を拒否 | HAC-HIL-43c: rejected deltaもterminal evidence保持 |
| HR-FR-HIL-44 | HAC-HIL-44a: 5 context digest付きcapsule生成 | HAC-HIL-44b: omission/stale/provider混同を拒否 | HAC-HIL-44c: checkpoint再開時digest再照合 |
| HR-FR-HIL-45 | HAC-HIL-45a: L8–L10 green後にcurrent L2 intentへhuman PASSをbind | HAC-HIL-45b: AI代行/stale/criterionなし/FAIL・UNCERTAIN closeを拒否 | HAC-HIL-45c: agreement/evidence revision変更でL11 receipt stale＋rejectはRedesign |
| HR-FR-HIL-46 | HAC-HIL-46a: commit/tag/checkpoint/digest/authority/CIが同一SHAへbindしremote restore dry-runが一致 | HAC-HIL-46b: dirty/unpushed/lightweight/local-only/moved/reused/deleted tagとprojection不一致を拒否 | HAC-HIL-46c: source/authority/checkpoint revision変更でsavepoint receiptをstale化し新tag namespaceを要求 |
| HR-FR-HIL-47 | HAC-HIL-47a: Ln tagがL(n-1) current tagの子孫でlayer/pair gate SHAと一致し工程表へPASS投影 | HAC-HIL-47b: skipped/non-ancestor/moved/reused/片肺/旧SHA/Sprint-release混同を拒否 | HAC-HIL-47c: redesignでaffected layer以降のtag receiptをstale化し既存tagを動かさず新versionへsupersede |

HR-FR-HIL-46はremote tag作成とDB commitの間のcrashを`remote_created_projection_pending`へ回収し、同operation/payload/OIDだけをexact adopt、異digestをquarantineする。HEAD/tree/index、tracked modified/untracked/ignored/submodule/sparse状態を分類し、savepoint入力はpushed HEAD/treeとtracked index一致だけに限定する。HR-FR-HIL-47は初回だけ同一freeze epochの`pending_pair` predecessorを許可し、L01→L06をpendingで構築後、L07からL12へ進みながらL06↔L07、L05↔L08、…、L01↔L12を内側から外側へatomic current化する。pendingをfreeze進捗へ算入せず、pair receipt前の両側current要求を禁止する。工程表registry/program/slice/task-set/denominator digest、GitHub tag API/UI visibility、ruleset bypass actor/expiryをreceipt必須fieldとし、refreeze時のlive/in-progress/freeze-progress/last-frozen/stale-fromを分離する。stale化はaffected→L12とcanonical V-pair対向tag/binding/receipt/projectionを同一CAS transactionで失効させ、旧pair creditを0にする。

## §3 量閉じ

- System FR: 47件。
- AC: 141件。
- L1 coverage trace: 162件へ拡張。exact edgeはgenerator再計測を正とする。
- acceptance artifacts: HAT-HIL-01..47。Visual primary evidenceはL8=HAT-HIL-34..37、
  L9=HAT-HIL-32/33/38..40、L10=HAT-HIL-41/42、L11=HAT-HIL-27/45とする。
  HAT-HIL-28..31/43/44はnonvisual supportでありVisual完成率へ算入しない。
- status: draft。PO承認と層別pair reviewなしにG3を通過しない。
