---
title: "HELIX L3 要件 — Infinity Loop system FR/AC"
layer: L3
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: TL / PO承認必須
plan: PLAN-L1-07-infinity-loop-platform-requirements
parent_design: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
pair_artifact: docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md
next_pair_freeze: L12
---

# HELIX L3 要件 — Infinity Loop system FR/AC

## §0 境界

本書はL1の115要求を、system observable behaviorと受入境界へ降下する。L4 component、runtime内部責務、
algorithm、table、CLI引数は本書で確定しない。各L1要求はprimary ownerとなるsystem FRをexactly 1件持ち、
secondary test coverageはL12/L9で追加できる。現時点はPO承認前のdraftであり、G3 freezeを主張しない。

## §1 System FR

| L3 FR | primary L1要求 | system動作 | 事前条件 → 事後条件 | failure / evidence | AC |
|---|---|---|---|---|---|
| HR-FR-HIL-01 | HIL-BR-12, HIL-FR-02, HIL-FR-03, HIL-NFR-01, HIL-NFR-05 | user、GitHub、product、source入力をsource/cause/digest/authority付きversioned Issue contractへexactly-once正規化し、外部本文を命令として実行しない | source識別可能・current schemaあり → durable intake、contract revision、routeが一意 | field欠落、同operation異payload、未信頼命令実行 / intake event、contract digest、conflict/trust receipt | HAC-HIL-01a, HAC-HIL-01b, HAC-HIL-01c |
| HR-FR-HIL-02 | HIL-BR-01, HIL-BR-10, HIL-FR-01, HIL-NFR-04 | admitted contractを定義済み工程順でForwardへ収束させ、全eventを同一causalityへjoinしbudget境界でcheckpointする | admitted contract・budgetあり → valid next stateまたはdurable stop、orphan 0 | illegal transition、causality断絶、budget後継続 / transition、projection、closure、checkpoint receipt | HAC-HIL-02a, HAC-HIL-02b, HAC-HIL-02c |
| HR-FR-HIL-03 | HIL-BR-02, HIL-BR-17, HIL-FR-09, HIL-FR-30 | 全base/stacked PR deliveryをcurrent head監査jobへ冪等変換し、actionable findingをIssue/Reverse/memory/Codex queueへ原子的昇格する | delivery/head/policyあり → job最大1件、全target同一cause commit | stale head、duplicate job、finding drop/partial promotion / delivery、job、disposition、promotion lineage | HAC-HIL-03a, HAC-HIL-03b, HAC-HIL-03c |
| HR-FR-HIL-04 | HIL-BR-04, HIL-BR-05, HIL-FR-04, HIL-FR-05, HIL-FR-08, HIL-FR-31, HIL-FR-35, HIL-NFR-03, HIL-NFR-20 | 全IssueのR0–R4 substanceを実装前に検査し、設計欠陥を影響layerのRedesignへ送り再freeze後だけForward claimを許す | drive/scope/evidenceあり → substantive Reverse＋正しいre-entry | skip、空洞、誤layer、L0無承認、re-entry bypass / phase、coverage、redesign、stale/re-freeze receipt | HAC-HIL-04a, HAC-HIL-04b, HAC-HIL-04c |
| HR-FR-HIL-05 | HIL-BR-06, HIL-BR-07, HIL-BR-08, HIL-FR-06, HIL-FR-07, HIL-FR-36, HIL-FR-38, HIL-NFR-06, HIL-NFR-07, HIL-NFR-21, HIL-NFR-23 | directiveを分類前に収載し、全Issue Gateをauthority root、最小性、approval、evidenceで決定論評価する | durable directive・policy・rootあり → 証拠充足時のみ遷移 | AI終端、scope cycle、不要拡張、approval欠落 / custody、gate、authority graph、approval receipt | HAC-HIL-05a, HAC-HIL-05b, HAC-HIL-05c |
| HR-FR-HIL-06 | HIL-BR-16, HIL-BR-20, HIL-FR-28, HIL-FR-29, HIL-NFR-15, HIL-NFR-16 | prejoin→postjoin→external CIを同一SHA/tree lineageで実行し既知failureだけを限定隔離する | tree/check/quarantine policyあり → 三段greenまたは該当段failure | stage bypass、別SHA、wildcard/期限切れ/new fingerprint隔離 / CI、lineage、quarantine、remediation evidence | HAC-HIL-06a, HAC-HIL-06b, HAC-HIL-06c |
| HR-FR-HIL-07 | HIL-BR-03, HIL-BR-11, HIL-FR-10, HIL-FR-14, HIL-NFR-02 | verified completionから永続知識だけをmemoryへ昇格し、finding/repairをrecipe→shadow→skill/detector/gateへ独立promoterで段階昇格する | completion/history、worker≠promoter → compact/no-promotionと検証済promotion | raw log/secret混載、self-promotion、fixture/効果/rollback欠落 / compaction、shadow、review、rollback receipt | HAC-HIL-07a, HAC-HIL-07b, HAC-HIL-07c |
| HR-FR-HIL-08 | HIL-BR-09, HIL-BR-18, HIL-FR-11, HIL-FR-12, HIL-FR-13, HIL-FR-32, HIL-NFR-10, HIL-NFR-18 | HARNESS-owned contractからteamを決定し、lease/run/checkpoint/verify/release/quarantine/retireをfencing付き正本化する | versioned registry、task、eligible roles → 再生成可能projection、単一lease、独立verify | manual drift、worker=verifier、二重lease、旧fence、不正遷移 / contract、muster、lease、lifecycle、verify receipt | HAC-HIL-08a, HAC-HIL-08b, HAC-HIL-08c |
| HR-FR-HIL-09 | HIL-BR-14, HIL-FR-15, HIL-FR-16, HIL-FR-21, HIL-FR-22, HIL-FR-37, HIL-TR-03, HIL-NFR-08, HIL-NFR-12, HIL-NFR-22 | ZIP、前身repository exact 2件（`unison-ai-product/UT-TDD_AGENT-HARNESS`、`RetryYN/ai-dev-kit-vscode`）のcurrent advertised `heads/tags/pull` authority、現行全treeをsnapshot化しatomic behaviorへ分解して採否→requirement→design→test→gateをjoinする。Git authorityはadvertisement A/B一致、exact OID materialize、object/tree/tag peel検証済みsealed receiptからだけ受理し、ref/content/edge分母をreceiptから導出する | source/ref/entryとextractor version、exact 2 authority receiptあり → atom分母、disposition、trace、pending/orphan 0 | aggregate-only、未分類/重複、remote identity不一致、A/B drift、ref/object欠落、stale、prose-only、Python write / manifest、atom、decision、edge、stale receipt | HAC-HIL-09a, HAC-HIL-09b, HAC-HIL-09c |
| HR-FR-HIL-10 | HIL-FR-25, HIL-FR-26, HIL-NFR-13 | core engineとdetectorをversioned registryから同一snapshotへ決定論実行しartifactとfindingを別authorityで保存する | registered version/config、fixed snapshot → rerun同一digest/fingerprint | unknown version、nondeterminism、provenance欠落、partial commit / run、artifact、finding、rerun evidence | HAC-HIL-10a, HAC-HIL-10b, HAC-HIL-10c |
| HR-FR-HIL-11 | HIL-BR-15, HIL-FR-23, HIL-FR-24, HIL-NFR-17 | versioned read connectorでfull/incremental product dataをlineage/freshness/schema/redaction付きprojectionへ変換する | connector policy/auth reference/cursorあり → canonical snapshot/entities/watermark | drift、cursor逆行、stale/tombstone無視、PII/secret、直接write / connector、snapshot、redaction、quarantine receipt | HAC-HIL-11a, HAC-HIL-11b, HAC-HIL-11c |
| HR-FR-HIL-12 | HIL-FR-27, HIL-TR-02, HIL-TR-07, HIL-TR-08, HIL-TR-09, HIL-TR-10, HIL-NFR-14 | NodeがPython workerをversioned JSON Lines IPCで監督し、検証済みresultだけをNode authorityでtransaction commitする | compatible protocol、deadline/lease、authority map → terminal receipt一件、Node writeのみ | protocol/JSON/size/timeout/crash/backpressure/late/direct write / envelope、process、schema、transaction、projection report | HAC-HIL-12a, HAC-HIL-12b, HAC-HIL-12c |
| HR-FR-HIL-13 | HIL-BR-19, HIL-FR-33, HIL-TR-01, HIL-TR-11 | active install/build/CLI/hooks/tests/package/distributionをNode.js LTSへ移しBun dependencyを0にする | Bun-less Linux、Node lock、surface inventory → 全surface green、active finding 0 | Bun API/command/lock/CI/distribution残存、部分互換の完了claim / inventory、workflow logs、lock、package smoke | HAC-HIL-13a, HAC-HIL-13b, HAC-HIL-13c |
| HR-FR-HIL-14 | HIL-FR-34, HIL-TR-04, HIL-TR-05, HIL-TR-06, HIL-NFR-09, HIL-NFR-19 | OS差分をadapterへ隔離しLinux full、macOS portable、Windows compatibilityを同一contractで検証、lock/SBOM/policyを再現する | clean 3 OS、canonical locks/policy → scope別green、domain fork 0、SBOM/policy receipt | adapter leak、process/lock異常、unlock、secret、license / OS matrix、difference、offline digest、SBOM reports | HAC-HIL-14a, HAC-HIL-14b, HAC-HIL-14c |
| HR-FR-HIL-15 | HIL-BR-13, HIL-FR-17, HIL-FR-18, HIL-FR-19, HIL-FR-20, HIL-NFR-11 | 全PLANをprototype_required/not_applicableへ分類し、前者はprototype→walkthrough→backprop/agreement、後者は構造skipでのみL3 freezeする | scope digest/policyあり → current agreementまたはno-UI receipt | implicit/deferred、static-only、state/walkthrough欠落、stale skip / applicability、artifact、walkthrough、delta、agreement | HAC-HIL-15a, HAC-HIL-15b, HAC-HIL-15c |
| HR-FR-HIL-16 | HIL-BR-21, HIL-FR-39, HIL-FR-40, HIL-NFR-24, HIL-NFR-25 | DesignRefactor候補をsemantic/consumer/oracle同等性で評価し、behavior保存はRefactor、contract変更はRedesign、state変更はRetrofitへ送る | before graph/oracle/consumer/role catalog → 最小plan、pair/oracle/rollback | lexical-only rename、根拠なし抽象化、誤route、consumer漏れ / signatures、graph、oracle、role/name、route receipt | HAC-HIL-16a, HAC-HIL-16b, HAC-HIL-16c |
| HR-FR-HIL-17 | HIL-BR-22, HIL-BR-23, HIL-BR-24, HIL-FR-41, HIL-FR-42, HIL-FR-43, HIL-FR-44, HIL-FR-45, HIL-NFR-26, HIL-NFR-27, HIL-NFR-28 | 原文をauthority付きatomic requirementへ翻訳し、design obligationとstable revision/edge/change receiptを正本化、template gapをshadow reviewへ送る | custodied source/authority、versioned template → active atomに全typed edge、未消込/ambiguity 0 | 原文消失、aggregate/TBD/偽N/A、self-promotion、stale伝播欠落 / revision、challenge、template、obligation、gap/review/change receipt | HAC-HIL-17a, HAC-HIL-17b, HAC-HIL-17c |
| HR-FR-HIL-18 | HIL-BR-25, HIL-FR-46, HIL-FR-47, HIL-FR-48, HIL-FR-49, HIL-FR-50, HIL-NFR-29 | canonical L1〜L12 ledgerをversion管理しtemplate obligationを抽出、上下隣接edgeと正規6 V-pairを同一revision/snapshot/oracleで閉じ、refactorも全pairを保存する。legacy L0〜L14はexact mapping済みcompatibility inputとしてのみ受理する | active registry/template/snapshot/pair map → 全atom disposition、双方向edge、実行oracle | type/抽出/TBD/aggregate、片edge、revision/oracle不一致、pair破壊、legacy tokenのcanonical出力混入 / ledger、addition、pair、execution、refactor receipt | HAC-HIL-18a, HAC-HIL-18b, HAC-HIL-18c |

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
| HR-FR-HIL-08 | HAC-HIL-08a: 同入力から同team/lifecycle | HAC-HIL-08b: drift/二重claim/旧fence拒否 | HAC-HIL-08c: checkpoint再開とquarantine/retire維持 |
| HR-FR-HIL-09 | HAC-HIL-09a: ZIP＋exact 2 sealed Git authorities＋current HEADからreceipt由来のref/content/edge分母とatomic trace生成 | HAC-HIL-09b: parent-only/child欠落/overlap、advertised ref omission/extra、unverified objectでfreeze拒否 | HAC-HIL-09c: remote identity、advertisement A/B、namespace policy、source/extractor変更で旧authority以降をstale |
| HR-FR-HIL-10 | HAC-HIL-10a: 全engine/detectorが再現可能 | HAC-HIL-10b: unknown/evidence欠落/partial拒否 | HAC-HIL-10c: rerun差異をquarantine |
| HR-FR-HIL-11 | HAC-HIL-11a: full/incrementalをlineage付きcurrentへ | HAC-HIL-11b: drift/regression/PIIで昇格0 | HAC-HIL-11c: stale/tombstoneを明示し再取得 |
| HR-FR-HIL-12 | HAC-HIL-12a: 正常resultを一回commit | HAC-HIL-12b: IPC異常をterminal化しpartial 0 | HAC-HIL-12c: cancel/timeout後late/direct write拒否 |
| HR-FR-HIL-13 | HAC-HIL-13a: Bun-less Linuxでend-to-end green | HAC-HIL-13b: 全active残存形を検出 | HAC-HIL-13c: historical allowlistをactiveと分離 |
| HR-FR-HIL-14 | HAC-HIL-14a: 3 OSが定義scopeをgreen | HAC-HIL-14b: adapter leak/path/process/lock異常拒否 | HAC-HIL-14c: online/offline同一lock/SBOM/policy |
| HR-FR-HIL-15 | HAC-HIL-15a: no-UI構造skipでfreeze | HAC-HIL-15b: UIはprototype/walkthrough/agreement前freeze拒否 | HAC-HIL-15c: scope変更でstale化しL2再entry |
| HR-FR-HIL-16 | HAC-HIL-16a: semantic同等の最小改善だけRefactor | HAC-HIL-16b: lexical-only/汎用化を拒否 | HAC-HIL-16c: internal/public/DBを3 routeへ分岐 |
| HR-FR-HIL-17 | HAC-HIL-17a: atom/challengeを決定routeし完全revisionだけactive | HAC-HIL-17b: TBD/N/A/orphan/change欠落でfreeze拒否 | HAC-HIL-17c: template gapは独立review前active 0 |
| HR-FR-HIL-18 | HAC-HIL-18a: L1〜L12抽出と正規6 pair current。legacy入力はexact remap | HAC-HIL-18b: 任一atom/edge/oracle欠落またはlegacy token出力でexit拒否 | HAC-HIL-18c: pair保存だけRefactor、他はRedesign/Retrofit |

## §3 量閉じ

- System FR: 18件。
- AC: 54件。
- L1 primary trace: 115/115、一意115、未割当0、重複0。
- L12 pair: HAT-HIL-01..18。
- status: draft。PO承認とL12 pair reviewなしにG3を通過しない。
