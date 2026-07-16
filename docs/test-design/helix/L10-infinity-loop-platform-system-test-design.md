---
title: "HELIX L10 総合test設計 — Infinity Loop platform"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-16
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
pair_artifact: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
legacy_source: docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md
---

# HELIX L10 総合test設計 — Infinity Loop platform

## §0 方針

L3要件/ACをL10総合検証として検証する。HST-HIL-001..033はlegacy L9設計から移行した入力であり、
Hybrid L1–L12 authorityへ意味を再確認したものだけをcurrentとする。現在は設計段階であり、
実装fixture/commandが無い行を実行passにしない。本書はcomponent間のauthority、state、digest、
failure/recoveryを観測する。

## §1 test設計表

`assertion ID`は本書内の原子的system assertionである。複数failureを一つのassertionへ畳まず、
実装時は各IDにfixture、command、exit code、output digest、DB queryを結ぶ。

| ID | HIL | assertion ID | L4 boundary | scenario | expected evidence | failure code | 設計状態 | 実行状態 |
|---|---|---|---|---|---|---|---|---|
| HST-HIL-001 | HIL-BR-10, HIL-BR-12, HIL-FR-01, HIL-FR-03, HIL-NFR-01, HIL-NFR-04, HIL-NFR-05 | HST-A-001 | Intake→Issue→Coordinator | user eventとGitHub eventを同じidempotency keyで再送する | Issue contract 1件、causality 1件、重複副作用0件 | `HIL_INTAKE_DUPLICATE_EFFECT` | 設計済み | 未実装 |
| HST-HIL-002 | HIL-BR-04, HIL-BR-05, HIL-BR-06, HIL-FR-04, HIL-FR-05, HIL-FR-08, HIL-FR-31 | HST-A-002 | Reverse→Redesign Gate | R0欠落、L1企画変更、L2要求変更を個別投入する | 欠落拒否、対象pair stale化、L1企画/scope変更だけPO escalation | `HIL_REVERSE_STAGE_MISSING` | 設計済み | 未実装 |
| HST-HIL-003 | HIL-BR-16, HIL-FR-28, HIL-NFR-15 | HST-A-003 | Three-stage CI | prejoin失敗、postjoin失敗、external失敗、lineageなし別SHA greenを個別投入する | 各段で停止し、直前receiptとSHA/treeを結ぶ | `HIL_CI_STAGE_BYPASS` | 設計済み | 未実装 |
| HST-HIL-004 | HIL-BR-01, HIL-BR-02, HIL-FR-02, HIL-NFR-01 | HST-A-004 | GitHub bridge→Claude audit | PR create、update、reopen、synchronize、ready、mergeを全base branchへ投入する | deliveryごとに冪等audit job 1件、head SHA一致 | `HIL_GITHUB_DELIVERY_INVALID` | 設計済み | 未実装 |
| HST-HIL-005 | HIL-BR-17, HIL-FR-09, HIL-FR-30 | HST-A-005 | Finding promotion | actionable findingを生成し、Issue生成途中でtransactionを失敗させる | disposition、Issue、Reverse、memory、queueが全件commitまたは全件rollback | `HIL_FINDING_PROMOTION_PARTIAL` | 設計済み | 未実装 |
| HST-HIL-006 | HIL-BR-09, HIL-BR-18, HIL-FR-10, HIL-FR-11, HIL-FR-12, HIL-FR-13, HIL-FR-32, HIL-NFR-02, HIL-NFR-10, HIL-NFR-18 | HST-A-006 | Agent registry→bounded muster→lifecycle/custody | adapter削除、blind漏洩、worker=verifier、depth/fan-out/child/active上限、recursive spawn、role/tool authority、lease切れ、deadline、retry exhaustion、遅延completion、custody切断、未圧縮releaseを個別投入する | adapter再生成、漏洩/越権/spawn超過block、全child causality、fencing拒否、durable checkpoint再開、dead-letter、独立verify→compaction→release、chain-of-custody receipt | `HIL_AGENT_LIFECYCLE_INVALID` | 設計済み | 未実装 |
| HST-HIL-007 | HIL-FR-27, HIL-TR-02, HIL-TR-07, HIL-TR-08, HIL-TR-09, HIL-NFR-14 | HST-A-007 | Node→Python broker | handshake不一致、不正JSON、timeout、cancel、crash、backpressureを個別投入する | partial write 0件、terminal receipt、late result拒否 | `HIL_WORKER_PROTOCOL_INVALID` | 設計済み | 未実装 |
| HST-HIL-008 | HIL-FR-15, HIL-FR-25, HIL-TR-03, HIL-NFR-13 | HST-A-008 | Core engine→artifact ledger | ZIP固定fixtureをbuild、trace、impact、assignment、scheduleへ個別投入する | capability別run、決定的digest、source provenance | `HIL_ENGINE_RUN_NONDETERMINISTIC` | 設計済み | 未実装 |
| HST-HIL-009 | HIL-FR-26, HIL-TR-10, HIL-NFR-08, HIL-NFR-13 | HST-A-009 | Detector→finding ledger | schema、spec、trace、consistency detectorを同一snapshotへ再実行する | dedupe key一致、version保持、期限切れsuppression失効 | `HIL_DETECTOR_FINDING_INVALID` | 設計済み | 未実装 |
| HST-HIL-010 | HIL-BR-15, HIL-FR-23, HIL-FR-24, HIL-TR-09, HIL-NFR-17 | HST-A-010 | Product connector→projection | full sync、incremental sync、drift、tombstone、stale sourceを個別投入する | lineage、watermark、quarantine、Python直接write 0件 | `HIL_PRODUCT_PROJECTION_INVALID` | 設計済み | 未実装 |
| HST-HIL-011 | HIL-BR-14, HIL-FR-16, HIL-FR-21, HIL-FR-22, HIL-NFR-12 | HST-A-011 | Source snapshot→coverage Gate | ZIP entry、remote ref、current symbolを個別に追加または削除する | 旧receipt stale化、pendingまたはorphan 1件でfreeze拒否 | `HIL_SOURCE_CAPABILITY_ORPHAN` | 設計済み | 未実装 |
| HST-HIL-012 | HIL-BR-13, HIL-FR-17, HIL-FR-20, HIL-NFR-11 | HST-A-012 | Screen applicability | 本no-UI scopeを判定後、GUI capabilityを追加する | 有効skip receipt、scope hash変更時のprototype再entry | `HIL_SCREEN_DECISION_MISSING` | 設計済み | 未実装 |
| HST-HIL-013 | HIL-BR-19, HIL-FR-33, HIL-TR-01, HIL-TR-11 | HST-A-013 | Bun cutover | Bunなしclean Linuxでactive surfaceを完走する | active Bun dependency 0件、quarantine 0件 | `HIL_ACTIVE_BUN_DEPENDENCY` | 設計済み | 部分実装 |
| HST-HIL-014 | HIL-FR-34, HIL-TR-04, HIL-TR-05, HIL-NFR-09, HIL-NFR-19 | HST-A-014 | OS adapter | Linux、macOS、Windowsへ同一edge fixtureを投入する | Linux full、macOS portable、Windows smoke、domain分岐0件 | `HIL_OS_ADAPTER_LEAK` | 設計済み | 未実装 |
| HST-HIL-015 | HIL-BR-03, HIL-FR-10, HIL-NFR-02 | HST-A-015 | Memory compaction | admission summaryとcompletion knowledgeへraw log、進捗、secretを混入する | 禁止データ0件、Claudeまたは別promoter receipt | `HIL_MEMORY_PROMOTION_INVALID` | 設計済み | 未実装 |
| HST-HIL-016 | HIL-BR-11, HIL-FR-14 | HST-A-016 | Learning promotion | recipeをshadow実行しcoverage改善と退行を個別に発生させる | fixture再現、効果差分、退行時rollback、即時gate化0件 | `HIL_PROMOTION_EVIDENCE_MISSING` | 設計済み | 未実装 |
| HST-HIL-017 | HIL-TR-06, HIL-NFR-05, HIL-NFR-06 | HST-A-017 | Supply-chain verifier | clean install、offline install、SBOM、secret scan、license scanを実行する | lock再現、未収録component 0件、secret 0件、未分類license 0件 | `HIL_SUPPLY_CHAIN_UNVERIFIED` | 設計済み | 未実装 |
| HST-HIL-018 | HIL-FR-04, HIL-FR-35, HIL-NFR-03, HIL-NFR-20 | HST-A-018 | Reverse Substance Gate | R0からR4へ空、placeholder、同文、同digest、obligation漏れを個別投入する | phase固有schemaとsemantic assertionで全件拒否し、incompleteを完了扱いしない | `HIL_REVERSE_SUBSTANCE_HOLLOW` | 設計済み | 未実装 |
| HST-HIL-019 | HIL-BR-07, HIL-FR-36, HIL-NFR-21 | HST-A-019 | Directive Custody Gate | user directiveを保存前にduplicate、false-positive、telemetry、cancelへ分類する | 原記録を先にappendし、根拠不足dispositionを非終端化する | `HIL_DIRECTIVE_CUSTODY_MISSING` | 設計済み | 未実装 |
| HST-HIL-020 | HIL-BR-14, HIL-FR-37, HIL-NFR-22 | HST-A-020 | Source Capability Atomizer | directory親またはfile親だけをcoveredにしてatomic childを省略する | parentを分母から除外し、unclassified child 1件でfreeze拒否 | `HIL_SOURCE_AGGREGATE_ONLY` | 設計済み | 未実装 |
| HST-HIL-021 | HIL-BR-08, HIL-FR-06, HIL-FR-38, HIL-NFR-07, HIL-NFR-23 | HST-A-021 | Scope Authority Gate | 同時追加HILだけを根拠に新CLIとdependencyを追加する | authoritative root未到達cycleと最小性欠落を拒否 | `HIL_SCOPE_AUTHORITY_CYCLE` | 設計済み | 未実装 |
| HST-HIL-022 | HIL-BR-20, HIL-FR-29, HIL-NFR-16 | HST-A-022 | CI Quarantine Manager | exact既知failure、別fingerprint、期限切れ、代替gate欠落を個別投入する | exact既知だけ隔離し、他は通常failureへ戻す | `HIL_QUARANTINE_INVALID` | 設計済み | 未実装 |
| HST-HIL-023 | HIL-FR-07, HIL-NFR-04, HIL-NFR-08 | HST-A-023 | Closure Gate | audit、memory、child Issue、oracleの各receiptを1件ずつ欠落させる | 欠落ごとにclosureを拒否し再開checkpointを保持する | `HIL_CLOSURE_EVIDENCE_MISSING` | 設計済み | 未実装 |
| HST-HIL-024 | HIL-FR-18, HIL-FR-19 | HST-A-024 | Prototype Builder→Walkthrough | 将来GUI scopeへ静的wireframeだけを提出する | executable artifact、interaction、9状態、walkthrough、L1 deltaが揃うまでfreeze拒否 | `HIL_PROTOTYPE_EVIDENCE_MISSING` | 設計済み | 未実装 |
| HST-HIL-025 | HIL-BR-21, HIL-FR-39, HIL-NFR-24 | HST-A-025 | Design Refactor→既存Refactor/Redesign/Retrofit | policy外部化、contract共通化、責務/stateオブジェクト化、behavior変更、根拠なし汎用化を個別投入する | 構造証拠と全consumer invariantがある最小変換だけを既存Refactorへ接続し、behavior/contract変更はRedesign、state/runtime/schema移行はRetrofit、推測抽象化はScope拒否 | `HIL_DESIGN_REFACTOR_INVARIANT_BROKEN` | 設計済み | 未実装 |
| HST-HIL-026 | HIL-BR-21, HIL-FR-40, HIL-NFR-25 | HST-A-026 | Domain Model Catalog→symbol/oracle | 13 roleのvalid/invalid、曖昧名、internal/public/DB renameを個別投入する | role invariantとstable object/oracle IDを検証し、boundary別routeを強制する | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` | 設計済み | 未実装 |
| HST-HIL-027 | HIL-BR-22, HIL-FR-41, HIL-FR-42, HIL-NFR-26 | HST-A-027 | Requirement/service→Design Obligation Gate | required obligation、TBD、aggregate discharge、偽N/A、orphan、template version変更を個別投入する | semantic dischargeだけを数え、未消込・orphan・staleが1件でもあればfreeze拒否 | `HIL_DESIGN_OBLIGATION_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-028 | HIL-BR-23, HIL-FR-43, HIL-FR-44, HIL-NFR-27 | HST-A-028 | Requirement Translator→Template Improvement | 原子的/複合/曖昧/表現不能要求、自己promotion、shadow regressionを個別投入する | 原文保持、atom/challenge/gap Issueの決定的route、独立review前active化0、regression時rollback | `HIL_REQUIREMENT_TRANSLATION_UNSAFE` | 設計済み | 未実装 |
| HST-HIL-029 | HIL-BR-24, HIL-FR-45, HIL-NFR-28 | HST-A-029 | Requirement Definition Ledger→Design Obligation | source/authority/oracle/edge欠落、split/merge漏れ、意味変更rename、偽N/A、stale revisionを個別投入する | 完全なrevisionと変更receiptだけをactive化し、全downstream stale伝播と再freezeを強制する | `HIL_REQUIREMENT_DEFINITION_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-030 | HIL-BR-25, HIL-FR-46, HIL-FR-47, HIL-NFR-29 | HST-A-030 | Template→Layer Ledger Registry | L1–L12 templateへ正常、空、TBD、未知field、重複obligationを個別投入する | 原子的proposalとgap findingを決定的に生成しaggregate parentをcoveredにしない | `HIL_LAYER_TEMPLATE_EXTRACTION_INVALID` | 設計済み | 未実装 |
| HST-HIL-031 | HIL-BR-25, HIL-FR-48, HIL-NFR-29 | HST-A-031 | Adjacent Layer Ledger Pair | vertical down/backpropの片edge、粒度、revision、snapshotを個別に壊す | 双方向・同一semantic revisionのpairだけpassし未降下/未逆伝播を分離報告する | `HIL_LAYER_VERTICAL_PAIR_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-032 | HIL-BR-25, HIL-FR-49, HIL-NFR-29 | HST-A-032 | Design Ledger→V-pair Verification Ledger | 正規6 pairでdesign/verification/oracle/execution/snapshotを個別に欠落させる | 左右双方向、同一oracle/snapshot、実行済evidenceのpairだけgreenになる | `HIL_LAYER_VPAIR_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-033 | HIL-BR-25, HIL-FR-50, HIL-NFR-29 | HST-A-033 | Layer Ledger→DesignRefactor/Redesign/Retrofit | externalize/commonize/objectize/rename/split/merge、pair破壊、behavior/public/DB変更を個別投入する | pair/behavior保存だけDesignRefactor、contract変更はRedesign、state変更はRetrofit、rollback欠落は拒否 | `HIL_LAYER_LEDGER_REFACTOR_INVALID` | 設計済み | 未実装 |
| HST-HIL-034 | HIL-BR-13, HIL-BR-25, HIL-FR-01, HIL-FR-05, HIL-FR-20, HIL-FR-31, HIL-FR-49 | HST-A-034 | Production Scrum slice→Hybrid V/TDD Gate | no-UI/prototype、L3 AC、L4 freeze、L5 test design、L7 Red、L6 Green、L7 closureを一件ずつ欠落・逆順化する | 各vertical sliceがL1–L12圧縮Vと正規6 pairを順序どおり完走した場合だけ次iterationへ進む | `HIL_HYBRID_SLICE_SEQUENCE_INVALID` | 設計済み | 未実装 |
| HST-HIL-035 | HIL-BR-26, HIL-BR-27, HIL-FR-51, HIL-FR-52, HIL-FR-53, HIL-TR-12, HIL-NFR-30, HIL-NFR-32, HIL-NFR-34 | HST-A-035 | Universal package→Interview→Workflow Model | 14 entry、schema矛盾、回答/N/A/unresolved、unknown ref、raw authority/self-approvalを個別投入する | 全entry disposition、typed回答、stable model、provenanceを保持し、未解決・authority bypassを拒否する | `HIL_UNIVERSAL_MODEL_AUTHORITY_INVALID` | 設計済み | 未実装 |
| HST-HIL-036 | HIL-BR-28, HIL-FR-54, HIL-FR-55, HIL-NFR-31, HIL-NFR-32 | HST-A-036 | Workflow Model→Completeness→Requirement Derivation | branch/loop/terminal/exception/permission/dataと8 derived surface edgeを一件ずつ欠落させる | atomic transition分母とrequirement/AC/test/8 surface exact edgeが完全な場合だけgreenにする | `HIL_WORKFLOW_DERIVATION_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-037 | HIL-BR-29, HIL-FR-56, HIL-NFR-33, HIL-NFR-34 | HST-A-037 | Workflow→Runtime Orchestration Plan→Agent Muster | candidate/resource/schedule/priority/reallocation/fallback/dead-letterとauthority separationを一件ずつ欠落させる | required task/evidenceをdropせずbounded checkpointまたはterminal routeを持つplanだけを受理する | `HIL_RUNTIME_ORCHESTRATION_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-038 | HIL-BR-30, HIL-FR-57, HIL-FR-58, HIL-NFR-35, HIL-NFR-36 | HST-A-038 | Canonical Action Intent→Standing Authorization Registry | intent 10 field、profile field、exact target/operation、project/registered service、overbroad prefixを個別投入する | covered routineだけ質問0でallowし、過大・自由文・credential-only profileを拒否する | `HIL_STANDING_AUTHORIZATION_INVALID` | 設計済み | 未実装 |
| HST-HIL-039 | HIL-FR-59, HIL-FR-60, HIL-TR-13, HIL-NFR-37, HIL-NFR-38 | HST-A-039 | Execution Authorization Gate→Platform Broker→Bounded Executor | identity/profile/expiry/revocation drift、project外、高影響、重複、timeoutを個別投入する | exact current intentだけidempotent/bounded実行し、他gateを上書きせずdeny/challenge receiptを残す | `HIL_EXECUTION_AUTHORIZATION_INVALID` | 設計済み | 未実装 |
| HST-HIL-040 | HIL-BR-22, HIL-BR-23, HIL-BR-24, HIL-FR-42, HIL-FR-43, HIL-FR-45, HIL-NFR-26, HIL-NFR-28, HIL-NFR-32 | HST-A-040 | Requirement Definition→Freeze Gate | 162要件からsource/authority/oracle/template/obligation/pair/reviewを一件ずつ欠落・stale化する | 全162 currentかつ未解決0の場合だけfreezeしpointer/行数だけのgreenを拒否する | `HIL_REQUIREMENT_FREEZE_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-041 | HIL-BR-14, HIL-BR-20, HIL-FR-16, HIL-FR-22, HIL-NFR-12, HIL-NFR-22 | HST-A-041 | UT all-ref source→Anti-corruption Adoption | current head/tag/pull、CI/PLAN status、atomic behavior、adopt/harden/redesign/reject、Hybrid translationを一件ずつ欠落させる | 全ref/atom dispositionとtranslation receiptが閉じ、旧L0–L14/Bun/team authorityを持ち込まない | `HIL_UT_ADOPTION_COVERAGE_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-060 | HIL-FR-80 | HST-A-060 | Repository Savepoint→remote restore | clean/pushed commit、annotated tag、harness.db checkpoint、requirement/design/test/gate digest、CI/review stateを同一SHAへbindし、隔離先の新branchへrestoreする。dirty/unpushed、lightweight/local-only、moved/reused/deleted tag、digest/checkpoint不一致を個別投入する | remote tag query、immutable savepoint receipt、復元branch HEAD、projection rebuild digestが一致し、release namespaceと分離される | `HIL_REPOSITORY_SAVEPOINT_INVALID` | 設計済み | 未実装 |
| HST-HIL-061 | HIL-FR-81 | HST-A-061 | Layer Freeze Tag Gate→progress projection | L1–L12の各freeze tagについて先行current tagとの祖先関係、同一layer旧versionのsupersession、layer/pair gate SHA、V-pair receipt、工程表projectionを照合する。layer skip、非祖先、片肺pair、旧design SHA、tag移動、Sprint/release混同を個別投入する | remote annotated tag chainとharness.dbのcurrent/superseded/stale projectionが一致し、最長連続freeze層だけを完了進捗へ数える | `HIL_LAYER_FREEZE_TAG_INVALID` | 設計済み | 未実装 |
| HST-HIL-062 | HIL-FR-45, HIL-FR-49 | HST-A-062 | Post-PO authority→Design Freeze→progress→L01 candidate | 7 receipt exact set、critical artifact/review/audit digest＋open=0、pushed HEAD/tree、working-tree exclusion、denominator、expected headsをbundle化し、各append境界faultとcommit前後driftを投入する | 正例だけ単一transactionでauthority/freeze/projection/L01 pending_pair/outbox/terminalをexactly once生成。commit前driftは増分0、commit後drift/revokeはfreeze stale/revoked＋critical reopen＋projection stale＋candidate cancelをatomic appendし、remote tag 0 | `HIL_POST_PO_FREEZE_BUNDLE_INVALID` | 設計済み | 未実装 |

HST-HIL-060/061のatomic expansionはHST-A-060-C01..C08およびHST-A-061-C01..C08を正本とする。さらにremote tag成功直後DB crash、GitHub API pagination/visibility/bypass expiry、HEAD/index/tracked/untracked/ignored/submodule/sparse、同一freeze epochでL01→L06をpending構築しL07→L12で内側pairからatomic current化するbootstrap、pair receipt前の両側current要求拒否、異epoch pending predecessor拒否、refreeze中live/in_progress/freeze_progress/last_frozen/stale_fromを境界fixtureとして必須化する。live更新・refreeze途中・stale chainでfreeze_progressが増えないこと、L08変更時にL08–L12と対向L05のtag/binding/receipt/projectionが同一CASでstale化し、fault/reconcile中も片側currentと旧pair creditが0であることを検証する。

HST-HIL-062は`LocalL01TagCandidateHandoffV1`のcandidate/event/operation/payload/freeze/HEAD/tree/denominator/expiryをremote request、annotation、receiptへexact bindする正例と、candidate差替え・expiry・head driftの増分0を含む。visibility queryではpending/cancelled/expired/remote未作成をfreeze分子0にする。remote作成後のPO/VMAUTH revokeでは`LayerAuthorityInvalidationBundleV1`がrefを変更せずobservation/tag receipt/V-pair/progress/visibilityを全件stale化し、各faultとunknown outcome reconcileでpartial credit 0を検証する。

### §1.1 PO7 activation system contract

| HST | assertion | scenario | oracle | status |
|---|---|---|---|---|
| HST-PO7-001 | HST-A-PO7 | 6 group receiptを22 question receiptへ展開し各append直後fault | 6/22/VMAUTH/projection/terminalが全件commitまたは全件rollback | 設計済み・未実装 |
| HST-PO7-002 | HST-A-PO7 | unknown/複数option、packet/source/chat digest swap、actor authority欠落 | activation receipt 0、旧authority不変 | 設計済み・未実装 |
| HST-PO7-003 | HST-A-PO7 | B/C co-authority欠落・scope違い・expiry切れ | fail-close、question receipt 0 | 設計済み・未実装 |
| HST-PO7-004 | HST-A-PO7 | same key replay、same key different payload、2 writer CAS race | replay同receipt、conflict/CAS loser増分0 | 設計済み・未実装 |
| HST-PO7-005 | HST-A-PO7 | active後にpacket/source/answer/authority drift、revoke、新revision | append-only stale/revoked/superseded、freeze blocker reopen | 設計済み・未実装 |

実行command、DB count、event head、exit/output digestは未作成であり、runtime/verified/coverageはいずれも0とする。

## §2 完了不変条件

- **L3↔L10 pair-freeze**: 全HSTがL3 System FR/AC、個別HIL ID、assertion ID、input/output/state/failure/evidence、予定fixtureを持ち、TBD 0であること。実装前なのでexecution statusは要求しない。
- **L10実行accept**: 全HSTが実command、exit code、output digest、DB queryまたはartifact pathを持ち、`not-implemented/partial`が0であること。
- worker/verifier providerを分離し、自己判定だけでpassにしない。
- fixtureの代表成功だけでなく、各failure codeとstale/retry/crash pathを実行する。
