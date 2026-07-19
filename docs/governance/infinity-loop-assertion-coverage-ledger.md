---
title: "HELIX Infinity Loop 原子的assertion coverage台帳"
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
requirements: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
requirement_definition_ledger: docs/governance/infinity-loop-requirement-definition-ledger.md
operational_test_design: docs/test-design/helix/L1-infinity-loop-operational-test-design.md
system_test_design: docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md
---

# HELIX Infinity Loop 原子的assertion coverage台帳

## §0 完全性契約

本台帳は、115件のHIL要件を要件ごとに一つの独立したfalsifiable assertionへ結ぶ。複数要件を一つの行へ
まとめず、要件ID、assertion ID、test design IDにはrange表記やslash省略記法を用いない。各assertionは、
precondition、stimulus、observable、failure codeを全て満たして初めて設計上のcoverageを持つ。

`design_status=draft-defined`はcanonical L2要求、L4基本設計、L11受入テストの設計pointerが存在することだけを表す。
`execution_status=not-implemented`は実command、exit code、output digest、DB queryまたはartifact evidenceが
未存在であることを表し、greenへ読み替えない。L9に直接対応するHSTが無いassertionはtest design IDに
L1のHOTだけを記載し、`design_status=draft-L9-gap`として欠落を可視化する。

## §1 業務要求assertion

| 要求ID (`requirement_id`) | assertion ID (`assertion_id`) | 事前条件 (`precondition`) | 刺激 (`stimulus`) | 観測値 (`observable`) | failure code (`failure_code`) | test設計ID (`test_design_id`) | gate/component | 設計状態 (`design_status`) | 実行状態 (`execution_status`) |
|---|---|---|---|---|---|---|---|---|---|
| HIL-BR-01 | HIA-BR-001 | L3承認済みIssueとcurrent設計がある | Codex実行からClaude監査まで一周させる | 不可逆境界以外はForwardへ無人収束し、自己監査はない | `HIL_FORWARD_LOOP_NOT_CONVERGED` | HOT-HIL-01; HST-HIL-004 | InfinityCoordinator; ClaudeAuditAdapter | draft-defined | not-implemented |
| HIL-BR-02 | HIA-BR-002 | 異なるbase branchとstacked PRを含むevent集合がある | PR create、update、completionを配送する | 各deliveryがhead SHA一致の監査jobを一度だけ作る | `HIL_PR_AUDIT_HOOK_MISSED` | HOT-HIL-01; HST-HIL-004 | GitHubEventBridge | draft-defined | not-implemented |
| HIL-BR-03 | HIA-BR-003 | Codex完了packetにraw log、PR、CI、findingがある | Claudeへ圧縮を依頼する | 永続知識だけがmemoryへ昇格し、進捗はcontinuationに残る | `HIL_MEMORY_COMPACTION_INVALID` | HOT-HIL-02; HST-HIL-015 | MemoryCompactionCoordinator | draft-defined | not-implemented |
| HIL-BR-04 | HIA-BR-004 | 任意の主駆動モデルを持つIssueがある | Forward実装claimを要求する | R0からR4と主駆動モデルのpairが先行完了しない限りclaim拒否 | `HIL_REVERSE_PAIR_MISSING` | HOT-HIL-03; HST-HIL-002 | UniversalReverseGate | draft-defined | not-implemented |
| HIL-BR-05 | HIA-BR-005 | 監査findingが既存設計欠陥を示す | 修正実装へroutingする | 第一級Redesignを経由しないForward実装を拒否 | `HIL_REDESIGN_ROUTE_MISSING` | HOT-HIL-04; HST-HIL-002 | RedesignRouter | draft-defined | not-implemented |
| HIL-BR-06 | HIA-BR-006 | 一つ以上の必須gate receiptが欠けたIssueがある | ready、implement、merge、closeの各遷移を試す | 全遷移が欠落gateで拒否される | `HIL_ISSUE_GATE_BYPASS` | HOT-HIL-05; HST-HIL-002 | GateEngine | draft-defined | not-implemented |
| HIL-BR-07 | HIA-BR-007 | durable intake済みuser directiveがある | AIが不要としてreject、drop、cancel、closeする | 原記録は非終端で残り、PO receiptなしの終端化を拒否する | `HIL_DIRECTIVE_CUSTODY_VIOLATION` | HOT-HIL-36; HST-HIL-019 | DirectiveCustodyGate | draft-defined | not-implemented |
| HIL-BR-08 | HIA-BR-008 | acceptance oracleに寄与しない追加surfaceがdiffにある | Scope Gateを実行する | 不要拡張を拒否し、子Issueも同じscope authorityへ拘束する | `HIL_UNJUSTIFIED_CAPABILITY` | HOT-HIL-38; HST-HIL-021 | ScopeAuthorityGate | draft-defined | not-implemented |
| HIL-BR-09 | HIA-BR-009 | layer、drive、task kind、verification patternが固定済み | W-agent teamを生成する | HARNESS正本から同一teamとruntime projectionが再現される | `HIL_AGENT_MUSTER_NONDETERMINISTIC` | HOT-HIL-07; HST-HIL-006 | AgentRegistry; MusterPlanner | draft-defined | not-implemented |
| HIL-BR-10 | HIA-BR-010 | Issueからmemoryまでのevent集合がある | closure readinessを評価する | causality join切れが一件でもあれば未完了となる | `HIL_CAUSALITY_JOIN_BROKEN` | HOT-HIL-08; HST-HIL-001 | InfinityCoordinator | draft-defined | not-implemented |
| HIL-BR-11 | HIA-BR-011 | 反復する実装logとfindingがある | recipeをblocking gateへ昇格しようとする | 再現fixtureとshadow効果測定前の昇格を拒否する | `HIL_LEARNING_PROMOTION_PREMATURE` | HOT-HIL-09; HST-HIL-016 | LearningPromotionLedger | draft-defined | not-implemented |
| HIL-BR-12 | HIA-BR-012 | GitHub eventとuser差し込み指示がある | 同じintakeへ投入する | 両方がmode、Reverse、Forward target付きcontractになる | `HIL_INTAKE_ROUTE_INCOMPLETE` | HOT-HIL-08; HST-HIL-001 | IntakeNormalizer | draft-defined | not-implemented |
| HIL-BR-13 | HIA-BR-013 | 画面対象PLANと画面非対象PLANがある | L1 freezeを要求する | prototype agreementまたは有効なno-UI receiptが無ければ拒否 | `HIL_SCREEN_DECISION_MISSING` | HOT-HIL-16; HST-HIL-012 | ScreenApplicabilityGate | draft-defined | not-implemented |
| HIL-BR-14 | HIA-BR-014 | ZIP、前身exact 2 repositoryのcurrent all-advertised ref authority、現行HELIXのsnapshotがある | source coverageを判定する | ref/content/edge分母またはatomic behavior未分類、trace孤児が一件でもあれば拒否 | `HIL_SOURCE_AGGREGATE_ONLY` | HOT-HIL-37; HST-HIL-011 | SourceCapabilityAtomizer; CapabilityCoverageGate | draft-defined | not-implemented |
| HIL-BR-15 | HIA-BR-015 | versioned product connectorとsource snapshotがある | ingestionを実行する | provenance、freshness、schema、authority付きprojectionだけがcurrentになる | `HIL_PRODUCT_DATA_LINEAGE_MISSING` | HOT-HIL-21; HST-HIL-010 | ProductDataConnectorRegistry | draft-defined | not-implemented |
| HIL-BR-16 | HIA-BR-016 | 各段で異なる正当なSHA lineageと別系統greenがある | 三段CIを順不同で進める | 直前段receiptに結ばれない次段と別系統greenを拒否 | `HIL_CI_STAGE_BYPASS` | HOT-HIL-27; HST-HIL-003 | ThreeStageCiOrchestrator | draft-defined | not-implemented |
| HIL-BR-17 | HIA-BR-017 | Claudeのactionable findingがある | finding promotionを実行する | Issue、Reverse、memory要約、Codex queueが同一causalityで生成される | `HIL_FINDING_DROPPED` | HOT-HIL-29; HST-HIL-005 | FindingPromotionPipeline | draft-defined | not-implemented |
| HIL-BR-18 | HIA-BR-018 | 登録済みagent contractがある | 生成からretireまでの遷移を実行する | 全instance eventがHARNESS正本に残り不正順序を拒否する | `HIL_AGENT_LIFECYCLE_INVALID` | HOT-HIL-32; HST-HIL-006 | AgentLifecycleController | draft-defined | not-implemented |
| HIL-BR-19 | HIA-BR-019 | Bunを持たないclean Linux環境がある | install、build、CLI、hook、test、packageを実行する | active surfaceがBunなしで完走し残存依存がゼロになる | `HIL_BUN_ACTIVE_DEPENDENCY` | HOT-HIL-25; HST-HIL-013 | BunDependencyCoverageGate | draft-defined | not-implemented |
| HIL-BR-20 | HIA-BR-020 | 既知failureと新fingerprintを含むCI結果がある | quarantineを適用する | exact既知failureだけを隔離し、新failureと代替gate失敗はfailになる | `HIL_CI_QUARANTINE_INVALID` | HOT-HIL-28; HST-HIL-022 | CiQuarantineManager | draft-defined | not-implemented |
| HIL-BR-21 | HIA-BR-021 | 外部化、共通化、オブジェクト化、semantic rename候補と既存oracleがある | Design Refactorを計画して既存Refactorへ接続する | behaviorを維持する最小設計変換だけが接続され、contract変更はrerouteされる | `HIL_DESIGN_REFACTOR_ROUTE_INVALID` | HOT-HIL-39; HST-HIL-025 | DesignRefactorPlanner | draft-defined | not-implemented |
| HIL-BR-22 | HIA-BR-022 | requirement/service/domain objectとtemplate catalogがある | 設計義務graphを導出しfreezeを要求する | 原子的義務とsemantic dischargeが100%結ばれない限り拒否する | `HIL_DESIGN_OBLIGATION_INCOMPLETE` | HOT-HIL-41; HST-HIL-027 | DesignObligationPlanner | draft-defined | not-implemented |
| HIL-BR-23 | HIA-BR-023 | custodied inputと表現不能な設計義務がある | Requirement Translatorとtemplate改善loopを実行する | atom/challenge/gap Issueへ決定的に分岐し無監査templateをactive化しない | `HIL_REQUIREMENT_TRANSLATION_UNSAFE` | HOT-HIL-42; HST-HIL-028 | RequirementTranslator; TemplateImprovementCoordinator | draft-defined | not-implemented |
| HIL-BR-24 | HIA-BR-024 | 原文、atom、authority、acceptance、service、template、obligation fixtureがある | 要件定義revisionをactive化する | 全設計判断とtyped edgeが台帳化されたrevisionだけactiveになる | `HIL_REQUIREMENT_DEFINITION_INCOMPLETE` | HOT-HIL-43; HST-HIL-029 | RequirementDefinitionLedger | draft-defined | not-implemented |
| HIL-BR-25 | HIA-BR-025 | canonical L1–L12 ledger、層外L0 anchor、上下edge、正規V-pair fixtureがある | Layer Ledger Chainの工程完了を要求する | 全原子的obligationが上下・左右双方向へ閉じた場合だけ完了する | `HIL_LAYER_LEDGER_CHAIN_INCOMPLETE` | HOT-HIL-44; HST-HIL-030 | LayerLedgerRegistry; LedgerPairGate | draft-defined | not-implemented |

## §2 機能要求assertion

| 要求ID (`requirement_id`) | assertion ID (`assertion_id`) | 事前条件 (`precondition`) | 刺激 (`stimulus`) | 観測値 (`observable`) | failure code (`failure_code`) | test設計ID (`test_design_id`) | gate/component | 設計状態 (`design_status`) | 実行状態 (`execution_status`) |
|---|---|---|---|---|---|---|---|---|---|
| HIL-FR-01 | HIA-FR-001 | current Issue contractと各段receipt fixtureがある | 全state transitionと順序飛越を実行する | 正順だけappendされ、各stateがdigestとcauseへbindする | `HIL_STATE_TRANSITION_INVALID` | HOT-HIL-01; HST-HIL-001 | InfinityCoordinator | draft-defined | not-implemented |
| HIL-FR-02 | HIA-FR-002 | 同一delivery IDのPR eventが複数回届く | PR hook intakeへ再送する | 正規化audit jobは一件だけでidempotency receiptが残る | `HIL_PR_DELIVERY_DUPLICATED` | HOT-HIL-01; HST-HIL-004 | GitHubEventBridge | draft-defined | not-implemented |
| HIL-FR-03 | HIA-FR-003 | Issue contractの必須fieldを一つずつ欠落させる | Admission Gateへ投入する | 欠落版を全て拒否し、完全版だけversionとdigestを持つ | `HIL_ISSUE_CONTRACT_INCOMPLETE` | HOT-HIL-03; HST-HIL-001 | IssueContractStore | draft-defined | not-implemented |
| HIL-FR-04 | HIA-FR-004 | R0からR4の順序、obligation、digestを変異させたIssueがある | Universal Reverse Gateを実行する | 全stage固有契約とR4 routeが完全な場合だけpassする | `HIL_REVERSE_STAGE_MISSING` | HOT-HIL-35; HST-HIL-002 | UniversalReverseGate | draft-defined | not-implemented |
| HIL-FR-05 | HIA-FR-005 | L0からL6の各layerへ影響するdesign findingがある | Redesign routingを実行する | L1とL2はpairをstale化し、L0はPOへescalateする | `HIL_REDESIGN_LAYER_INVALID` | HOT-HIL-30; HST-HIL-002 | RedesignRouter | draft-defined | not-implemented |
| HIL-FR-06 | HIA-FR-006 | allowed diff、non-goal、PO budget、authority rootがある | 実diffとtraceを照合する | 循環根拠またはminimum-necessary不在のcapabilityを拒否する | `HIL_SCOPE_AUTHORITY_INVALID` | HOT-HIL-38; HST-HIL-021 | ScopeAuthorityGate | draft-defined | not-implemented |
| HIL-FR-07 | HIA-FR-007 | closure必須evidenceを一件ずつ欠落させたIssueがある | closeを要求する | 全evidence current時だけclosure receiptを発行する | `HIL_CLOSURE_EVIDENCE_MISSING` | HOT-HIL-05; HST-HIL-023 | ClosureGate | draft-defined | not-implemented |
| HIL-FR-08 | HIA-FR-008 | Reverse、Redesign、pair-freezeのいずれかが未完了 | Codex claimを要求する | tool起動前にclaim拒否とblocked reasonを返す | `HIL_IMPLEMENTATION_NOT_READY` | HOT-HIL-08; HST-HIL-002 | CodexExecutionAdapter | draft-defined | not-implemented |
| HIL-FR-09 | HIA-FR-009 | 各disposition候補を持つPR findingがある | Claude監査と独立reviewを行う | evidence付き非終端receiptとappeal routeが残る | `HIL_FINDING_DISPOSITION_INVALID` | HOT-HIL-36; HST-HIL-005 | ClaudeAuditAdapter; DirectiveCustodyLedger | draft-defined | not-implemented |
| HIL-FR-10 | HIA-FR-010 | admission packetとcompletion packetがある | memory compactionを実行する | event種別が分離されraw logと進捗を保存しない | `HIL_MEMORY_EVENT_MIXED` | HOT-HIL-02; HST-HIL-015 | MemoryCompactionCoordinator | draft-defined | not-implemented |
| HIL-FR-11 | HIA-FR-011 | 全必須fieldを持つagentと欠落agentがある | registryへ登録する | 完全なruntime中立contractだけを受理する | `HIL_AGENT_CONTRACT_INCOMPLETE` | HOT-HIL-07; HST-HIL-006 | AgentRegistry | draft-defined | not-implemented |
| HIL-FR-12 | HIA-FR-012 | 生成adapter、手編集adapter、未登録agentがある | syncとguardを実行する | 正規adapterを再生成しdriftとpolicy違反をfail-closeする | `HIL_AGENT_ADAPTER_DRIFT` | HOT-HIL-07; HST-HIL-006 | AgentSyncGuard | draft-defined | not-implemented |
| HIL-FR-13 | HIA-FR-013 | task kindとverification patternに複数候補agentがある | musterを反復実行する | 二段解決で同じworkerとverifierを選び自己検証を避ける | `HIL_MUSTER_RESOLUTION_INVALID` | HOT-HIL-07; HST-HIL-006 | MusterPlanner | draft-defined | not-implemented |
| HIL-FR-14 | HIA-FR-014 | raw eventと昇格段階fixtureがある | 段階飛越とrollbackを試す | 正順だけを受理し効果とrollback targetを保存する | `HIL_PROMOTION_STAGE_BYPASS` | HOT-HIL-09; HST-HIL-016 | LearningPromotionLedger | draft-defined | not-implemented |
| HIL-FR-15 | HIA-FR-015 | 固定ZIP snapshotと変換mappingがある | docgen ingestionを実行する | 各metadata、trace、impact、assignment、scheduleがprovenance付きHELIX契約になる | `HIL_HYBRID_INGESTION_INCOMPLETE` | HOT-HIL-10; HST-HIL-008 | HybridDocgenIngestion | draft-defined | not-implemented |
| HIL-FR-16 | HIA-FR-016 | ZIP、前身exact 2 repositoryのA/B一致済みheads/tags/pull authority、現行HELIXの固定manifestがある | asset inventoryを実行する | receipt由来の全atomic capabilityに一件の採否と根拠がありpendingがゼロになる | `HIL_ASSET_DECISION_MISSING` | HOT-HIL-10; HST-HIL-011 | AssetInventory | draft-defined | not-implemented |
| HIL-FR-17 | HIA-FR-017 | no-UI scopeとUI scopeがある | Screen Applicability Gateを実行する | 前者は完全receipt、後者はPrototype Discovery taskへroutingする | `HIL_SCREEN_APPLICABILITY_INVALID` | HOT-HIL-16; HST-HIL-012 | ScreenApplicabilityGate | draft-defined | not-implemented |
| HIL-FR-18 | HIA-FR-018 | screen、interaction、state、仮data fixtureがある | prototypeをbuildする | 起動可能artifactと全trace、digest、手順を生成する | `HIL_PROTOTYPE_ARTIFACT_INCOMPLETE` | HOT-HIL-18; HST-HIL-024 | PrototypeBuilder | draft-defined | not-implemented |
| HIL-FR-19 | HIA-FR-019 | prototypeとuser walkthrough入力がある | walkthrough iterationを実行する | 観測、delta、反映先、再作成判断を版ごとに残す | `HIL_WALKTHROUGH_RECEIPT_MISSING` | HOT-HIL-17; HST-HIL-024 | WalkthroughLoop | draft-defined | not-implemented |
| HIL-FR-20 | HIA-FR-020 | prototype route、no-UI route、evidence欠落routeがある | L1 freezeとL3開始を要求する | 有効なagreementまたはskipだけを通し欠落routeを拒否する | `HIL_SCREEN_GATE_EVIDENCE_MISSING` | HOT-HIL-16; HST-HIL-012 | ScreenGate | draft-defined | not-implemented |
| HIL-FR-21 | HIA-FR-021 | ZIP entry、exact 2 repositoryのidentity/namespace/advertisement A-B/ref object、現行symbolを変更する | authorityとsnapshotを再取得する | manifest digestが変わり依存snapshot・atomization・coverage receiptが同一causalityでstaleになる | `HIL_SOURCE_SNAPSHOT_STALE` | HOT-HIL-20; HST-HIL-011 | SourceSnapshotter | draft-defined | not-implemented |
| HIL-FR-22 | HIA-FR-022 | pending、根拠なしreject、orphan、複合IDを含むledgerがある | coverage判定を実行する | 各不備を個別failureで検出しpair-freezeを拒否する | `HIL_SOURCE_ATOM_ORPHAN` | HOT-HIL-19; HST-HIL-011 | CapabilityCoverageGate | draft-defined | not-implemented |
| HIL-FR-23 | HIA-FR-023 | connector contractの必須fieldとcredential値混入fixtureがある | registry登録を行う | referenceだけを保存し不完全またはsecret bodyを拒否する | `HIL_CONNECTOR_CONTRACT_INVALID` | HOT-HIL-21; HST-HIL-010 | ProductDataConnectorRegistry | draft-defined | not-implemented |
| HIL-FR-24 | HIA-FR-024 | full、incremental、drift、delete、watermark逆行fixtureがある | product ingestionを実行する | 冪等projectionとlineageを作りdrift、tombstone、staleを検出する | `HIL_PRODUCT_INGESTION_INVALID` | HOT-HIL-22; HST-HIL-010 | ProductDataProjectionWorker | draft-defined | not-implemented |
| HIL-FR-25 | HIA-FR-025 | versioned engine capabilityと固定input snapshotがある | 各engineを実行する | capability別run、artifact、version、入出力digest、exit statusを保存する | `HIL_ENGINE_RUN_INCOMPLETE` | HOT-HIL-23; HST-HIL-008 | HybridDocumentCoreEngineRegistry | draft-defined | not-implemented |
| HIL-FR-26 | HIA-FR-026 | versioned detectorと既知finding fixtureがある | detectorを実行する | core engineと別runで構造化findingとprovenanceを保存する | `HIL_DETECTOR_FINDING_INCOMPLETE` | HOT-HIL-23; HST-HIL-009 | DetectorRegistryRunner | draft-defined | not-implemented |
| HIL-FR-27 | HIA-FR-027 | 正常、timeout、cancel、crash、late result workerがある | supervisorから要求する | terminal receiptを一度だけ記録し失効resultをcommitしない | `HIL_WORKER_PROTOCOL_INVALID` | HOT-HIL-24; HST-HIL-007 | PythonWorkerBroker | draft-defined | not-implemented |
| HIL-FR-28 | HIA-FR-028 | 三段の成功失敗とlineage不一致fixtureがある | CI stageを遷移する | 正順かつpredecessor-bound greenだけ次段を許可する | `HIL_CI_STAGE_LINEAGE_INVALID` | HOT-HIL-27; HST-HIL-003 | ThreeStageCiOrchestrator | draft-defined | not-implemented |
| HIL-FR-29 | HIA-FR-029 | 既知と未知fingerprint、期限切れwaiverがある | quarantineを評価する | exactかつ期限内で代替gate付きの既知failureだけ隔離する | `HIL_QUARANTINE_SCOPE_INVALID` | HOT-HIL-28; HST-HIL-022 | CiQuarantineManager | draft-defined | not-implemented |
| HIL-FR-30 | HIA-FR-030 | actionable findingと各途中欠落fixtureがある | promotion transactionを実行する | 全成果を原子的に生成し欠落時はreadyを作らない | `HIL_FINDING_PROMOTION_PARTIAL` | HOT-HIL-29; HST-HIL-005 | FindingPromotionPipeline | draft-defined | not-implemented |
| HIL-FR-31 | HIA-FR-031 | L1またはL2へ影響するfindingがある | 実装claimとForward joinを要求する | pairとscreen evidenceをstale化し再freeze前の進行を拒否する | `HIL_REDESIGN_REENTRY_BYPASS` | HOT-HIL-30; HST-HIL-002 | UpstreamRedesignReentry | draft-defined | not-implemented |
| HIL-FR-32 | HIA-FR-032 | agent lifecycleの正順、逆順、lease失効fixtureがある | 全遷移を実行する | 正順のみ受理しevent、lease、checkpoint、verification receiptを残す | `HIL_AGENT_STATE_TRANSITION_INVALID` | HOT-HIL-32; HST-HIL-006 | AgentLifecycleController | draft-defined | not-implemented |
| HIL-FR-33 | HIA-FR-033 | activeとhistoricalのBun参照fixtureがある | dependency coverageを走査する | active参照を全件検出しhistoricalだけ根拠付きallowlistする | `HIL_BUN_COVERAGE_INCOMPLETE` | HOT-HIL-25; HST-HIL-013 | BunDependencyCoverageGate | draft-defined | not-implemented |
| HIL-FR-34 | HIA-FR-034 | OS edge case共通fixtureがある | 三OS profileへ適用する | adapter差分だけを許しdomain logic漏出を検出する | `HIL_OS_CONTRACT_VIOLATION` | HOT-HIL-26; HST-HIL-014 | OsContractRunner | draft-defined | not-implemented |
| HIL-FR-35 | HIA-FR-035 | 空、placeholder、同文、同digest、未被覆Reverse artifactがある | Substance Gateを実行する | stage固有assertionが全不正artifactを拒否する | `HIL_REVERSE_SUBSTANCE_HOLLOW` | HOT-HIL-35; HST-HIL-018 | ReverseSubstanceAnalyzer | draft-defined | not-implemented |
| HIL-FR-36 | HIA-FR-036 | user directiveと各非actionable disposition fixtureがある | custodyとdispositionを評価する | 原記録、反証、PO authority、appealを欠く終端化を拒否する | `HIL_DIRECTIVE_CUSTODY_MISSING` | HOT-HIL-36; HST-HIL-019 | DirectiveCustodyLedger | draft-defined | not-implemented |
| HIL-FR-37 | HIA-FR-037 | file、symbol、aggregate親を含むsource snapshotがある | atomizerを実行する | atomic childへsource spanと入出力を付け未分類と重複を検出する | `HIL_SOURCE_ATOMIZATION_INCOMPLETE` | HOT-HIL-37; HST-HIL-020 | SourceCapabilityAtomizer | draft-defined | not-implemented |
| HIL-FR-38 | HIA-FR-038 | authoritative rootあり、自己参照cycle、代替案欠落fixtureがある | Scope Authority Gateを実行する | acyclic root、寄与、最小性、代替、budgetが全てある場合だけpass | `HIL_SCOPE_AUTHORITY_CYCLE` | HOT-HIL-38; HST-HIL-021 | ScopeAuthorityResolver | draft-defined | not-implemented |
| HIL-FR-39 | HIA-FR-039 | semantic同等で名称不統一、名称近似でsemantic相違、文字列類似だけ、public renameを含む設計候補がある | externalize、commonize、objectize、semantic renameを個別評価する | I/O、副作用、failure、state、call graph、consumer oracleで同義名統一と同名異義分離を行い、文字列類似だけを拒否しpublic contract変更をrerouteする | `HIL_DESIGN_REFACTOR_INVARIANT_BROKEN` | HOT-HIL-39; HST-HIL-025 | DesignRefactorPlanner | draft-defined | not-implemented |
| HIL-FR-40 | HIA-FR-040 | 全domain role、曖昧名、symbol/oracle mapping fixtureがある | catalogとrename routeを評価する | role invariantを満たしinternal renameでstable oracle IDを維持する | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` | HOT-HIL-40; HST-HIL-026 | DomainModelCatalog | draft-defined | not-implemented |
| HIL-FR-41 | HIA-FR-041 | version違いのtemplateと適用対象がある | registryへ登録・supersedeする | immutable active versionと決定的適用ruleだけをcurrentにする | `HIL_DESIGN_TEMPLATE_VERSION_DRIFT` | HOT-HIL-41; HST-HIL-027 | DesignTemplateRegistry | draft-defined | not-implemented |
| HIL-FR-42 | HIA-FR-042 | requirement/service/objectと各facet fixtureがある | obligation graphを導出・消込する | orphan、未消込、偽N/A、aggregate消込を個別failureにする | `HIL_DESIGN_OBLIGATION_INCOMPLETE` | HOT-HIL-41; HST-HIL-027 | DesignObligationPlanner | draft-defined | not-implemented |
| HIL-FR-43 | HIA-FR-043 | 原子的、複合、曖昧、authority欠落入力がある | requirement atomへ翻訳する | 原文を維持しatomまたはchallengeへ送り根拠のない確定をしない | `HIL_REQUIREMENT_ATOM_AGGREGATE_ONLY` | HOT-HIL-42; HST-HIL-028 | RequirementTranslator | draft-defined | not-implemented |
| HIL-FR-44 | HIA-FR-044 | active templateで表現不能なobligationがある | gap Issueからcandidateをshadow評価する | 独立監査、migration、rollback前のactive化を拒否する | `HIL_TEMPLATE_PROMOTION_PREMATURE` | HOT-HIL-42; HST-HIL-028 | TemplateImprovementCoordinator | draft-defined | not-implemented |
| HIL-FR-45 | HIA-FR-045 | valid/invalid revision、split、merge、rename、supersede、N/A fixtureがある | requirement changeを適用する | 全atom disposition、semantic digest、authority、downstream stale receipt欠落を拒否する | `HIL_REQUIREMENT_CHANGE_RECEIPT_MISSING` | HOT-HIL-43; HST-HIL-029 | RequirementDefinitionLedger | draft-defined | not-implemented |
| HIL-FR-46 | HIA-FR-046 | canonical L1–L12のledger type、粒度、authority、entry/exit fixtureと層外L0 anchorがある | Layer Ledger Registryへ登録してsnapshotを作る | 全layerの型と原子的row revisionを決定的に登録し欠落typeを拒否する | `HIL_LAYER_LEDGER_TYPE_MISSING` | HOT-HIL-44; HST-HIL-030 | LayerLedgerRegistry | draft-defined | not-implemented |
| HIL-FR-47 | HIA-FR-047 | active templateの章、field、table、done-when、pair contract fixtureがある | Template Obligation Extractorを実行する | 全要素をprovenance付きobligation proposalまたはgap findingへ分岐する | `HIL_LAYER_TEMPLATE_EXTRACTION_EMPTY` | HOT-HIL-44; HST-HIL-030 | TemplateObligationExtractor | draft-defined | not-implemented |
| HIL-FR-48 | HIA-FR-048 | 隣接layerのdownstream/backprop edgeとrevision不整合fixtureがある | Vertical Ledger Pair Gateを実行する | 双方向かつ同一意味revisionのpairだけを受理する | `HIL_LAYER_VERTICAL_PAIR_INCOMPLETE` | HOT-HIL-45; HST-HIL-031 | LedgerPairGate | draft-defined | not-implemented |
| HIL-FR-49 | HIA-FR-049 | 正規V-pairのdesign、verification、oracle、snapshot欠落fixtureがある | Horizontal V-Pair Gateを実行する | 左右双方向・同一oracle/snapshot・実行済みのpairだけをgreenにする | `HIL_LAYER_VPAIR_INCOMPLETE` | HOT-HIL-46; HST-HIL-032 | LedgerPairGate | draft-defined | not-implemented |
| HIL-FR-50 | HIA-FR-050 | ledger重複、責務混在、semantic/name collision、孤立edge fixtureがある | Ledger Design Refactorを計画する | pairとbehaviorを保存する最小変更だけをDesignRefactorへ送りcontract/state変更をrerouteする | `HIL_LAYER_LEDGER_REFACTOR_INVALID` | HOT-HIL-47; HST-HIL-033 | LedgerDesignRefactorPlanner | draft-defined | not-implemented |

## §3 技術要求assertion

| 要求ID (`requirement_id`) | assertion ID (`assertion_id`) | 事前条件 (`precondition`) | 刺激 (`stimulus`) | 観測値 (`observable`) | failure code (`failure_code`) | test設計ID (`test_design_id`) | gate/component | 設計状態 (`design_status`) | 実行状態 (`execution_status`) |
|---|---|---|---|---|---|---|---|---|---|
| HIL-TR-01 | HIA-TR-001 | TypeScript strict sourceとBun固有fixtureがある | Node buildとdependency scanを実行する | control planeはNodeで動きBun固有依存を報告する | `HIL_NODE_CONTROL_PLANE_INVALID` | HOT-HIL-11; HST-HIL-013 | NodeControlPlane; BunDependencyCoverageGate | draft-defined | not-implemented |
| HIL-TR-02 | HIA-TR-002 | Python worker capabilityとversioned contractがある | Nodeからworkerを起動する | data planeだけがschema適合resultを返す | `HIL_PYTHON_PLANE_BOUNDARY_INVALID` | HOT-HIL-11; HST-HIL-007 | PythonWorkerBroker | draft-defined | not-implemented |
| HIL-TR-03 | HIA-TR-003 | ZIP workerが正本直接writeを試みる | ingestionを実行する | writeを拒否しprovenance付きresultだけNodeへ返す | `HIL_PYTHON_AUTHORITY_BYPASS` | HOT-HIL-11; HST-HIL-008 | PythonWorkerBroker; ResultIngestionPort | draft-defined | not-implemented |
| HIL-TR-04 | HIA-TR-004 | Linux、macOS、Windowsのclean profileがある | coreとcompatibility suiteを実行する | Linuxがfull、macOSがportable、Windowsがcompatibilityとして記録される | `HIL_OS_PRIORITY_INVALID` | HOT-HIL-26; HST-HIL-014 | OsAdapter | draft-defined | not-implemented |
| HIL-TR-05 | HIA-TR-005 | path、process、signal、lock、SQLiteの差分fixtureがある | domain層とadapter層を走査実行する | platform差分がadapter外に存在しない | `HIL_OS_ADAPTER_LEAK` | HOT-HIL-26; HST-HIL-014 | OsAdapter | draft-defined | not-implemented |
| HIL-TR-06 | HIA-TR-006 | canonical lockとclean、offline環境がある | installとsupply-chain検証を行う | version再現、統合SBOM、secretゼロ、policy適合licenseを証明する | `HIL_SUPPLY_CHAIN_NOT_REPRODUCIBLE` | HOT-HIL-34; HST-HIL-017 | SupplyChainVerifier | draft-defined | not-implemented |
| HIL-TR-07 | HIA-TR-007 | Node writerとPython reader fixtureがある | 同時readとwriteを行う | event backboneを維持しPython authoritative writeを拒否する | `HIL_DB_WRITE_AUTHORITY_INVALID` | HOT-HIL-11; HST-HIL-007 | HarnessDbPort | draft-defined | not-implemented |
| HIL-TR-08 | HIA-TR-008 | 正常と不正のJSON Lines envelopeがある | stdio protocolへ投入する | stdoutだけをprotocolとして検証し全必須envelope fieldを要求する | `HIL_IPC_ENVELOPE_INVALID` | HOT-HIL-24; HST-HIL-007 | PythonWorkerBroker | draft-defined | not-implemented |
| HIL-TR-09 | HIA-TR-009 | Python resultと直接DB write試行がある | result commitを要求する | Nodeがschema検証済みresultだけをtransaction commitする | `HIL_RESULT_WRITE_AUTHORITY_INVALID` | HOT-HIL-24; HST-HIL-007 | ResultIngestionPort | draft-defined | not-implemented |
| HIL-TR-10 | HIA-TR-010 | 全logical entity種別のfixtureがある | DB projectionを構築する | product、engine、detector、IPC、CI、agentのauthorityが分離される | `HIL_DB_PROJECTION_BOUNDARY_INVALID` | HOT-HIL-23; HST-HIL-009 | HarnessDbProjection | draft-defined | not-implemented |
| HIL-TR-11 | HIA-TR-011 | Bun binary、loader、API、lockfileが無いclean環境がある | canonical workflowを完走する | installからdistributionまでNodeだけでgreenになる | `HIL_BUN_CUTOVER_INCOMPLETE` | HOT-HIL-25; HST-HIL-013 | BunCutoverGate | draft-defined | not-implemented |

## §4 非機能要求assertion

| 要求ID (`requirement_id`) | assertion ID (`assertion_id`) | 事前条件 (`precondition`) | 刺激 (`stimulus`) | 観測値 (`observable`) | failure code (`failure_code`) | test設計ID (`test_design_id`) | gate/component | 設計状態 (`design_status`) | 実行状態 (`execution_status`) |
|---|---|---|---|---|---|---|---|---|---|
| HIL-NFR-01 | HIA-NFR-001 | 同一delivery、contract、job、headを複数回用意する | 全eventを再送する | Issue、実装、memory昇格の副作用は各一件だけになる | `HIL_IDEMPOTENCY_VIOLATION` | HOT-HIL-13; HST-HIL-001 | IdempotencyGate | draft-defined | not-implemented |
| HIL-NFR-02 | HIA-NFR-002 | Codexがworkerと最終verifierを兼ねるpacketがある | audit、close、memory昇格を要求する | providerとrole分離が無い自己承認を拒否する | `HIL_ROLE_SEPARATION_VIOLATION` | HOT-HIL-14; HST-HIL-006 | RoleSeparationGate | draft-defined | not-implemented |
| HIL-NFR-03 | HIA-NFR-003 | phase skip、例外値、budget途中停止fixtureがある | Reverse完了と実装claimを要求する | 未完obligationを保持してcheckpointしclaimを拒否する | `HIL_REVERSE_OBLIGATION_WAIVED` | HOT-HIL-35; HST-HIL-018 | UniversalReverseGate | draft-defined | not-implemented |
| HIL-NFR-04 | HIA-NFR-004 | iteration、time、token、cost上限fixtureがある | loopを上限超過まで反復する | 停止理由とdurable checkpointを残し同一点から再開する | `HIL_LOOP_BUDGET_UNBOUNDED` | HOT-HIL-13; HST-HIL-001 | InfinityCoordinator | draft-defined | not-implemented |
| HIL-NFR-05 | HIA-NFR-005 | 実行誘導を含むIssue、PR、ZIP、外部dataがある | intakeとworkerへ投入する | 命令を実行せずmetadataとevidenceを分離する | `HIL_UNTRUSTED_INPUT_EXECUTED` | HOT-HIL-15; HST-HIL-001 | IntakeTrustGate | draft-defined | not-implemented |
| HIL-NFR-06 | HIA-NFR-006 | 各高影響操作のapprovalなしfixtureがある | 操作を適用しようとする | action-binding approvalまで適用を拒否する | `HIL_ACTION_BINDING_APPROVAL_MISSING` | HOT-HIL-15; HST-HIL-017 | ActionBindingGate | draft-defined | not-implemented |
| HIL-NFR-07 | HIA-NFR-007 | complexity、public surface、運用負債だけを増やすdiffがある | Scope Gateを実行する | authoritative oracle寄与と最小性が無い拡張を拒否する | `HIL_SCOPE_NECESSITY_MISSING` | HOT-HIL-38; HST-HIL-021 | ScopeAuthorityGate | draft-defined | not-implemented |
| HIL-NFR-08 | HIA-NFR-008 | prose PASSだけのgate resultがある | completion evidenceへ昇格する | failure codeとprovenanceが無い結果を拒否する | `HIL_PROSE_ONLY_EVIDENCE` | HOT-HIL-14; HST-HIL-009 | EvidenceProvenanceGate | draft-defined | not-implemented |
| HIL-NFR-09 | HIA-NFR-009 | Linux fullと二OS compatibility profileがある | core gateとadapter testsを実行する | Linux全core gateと同一contract差分を記録しlogic forkを検出する | `HIL_OS_LOGIC_FORK` | HOT-HIL-12; HST-HIL-014 | OsContractRunner | draft-defined | not-implemented |
| HIL-NFR-10 | HIA-NFR-010 | runtime adapterを削除しHARNESS registryを残す | adapter再生成を実行する | 同一digestのadapterが再生成されruntime siloを必要としない | `HIL_AGENT_REGISTRY_NOT_REGENERABLE` | HOT-HIL-07; HST-HIL-006 | AgentSyncGuard | draft-defined | not-implemented |
| HIL-NFR-11 | HIA-NFR-011 | 静的wireframeだけのUI PLANとLLM自由文skipがある | Screen Gateを実行する | 両方を拒否し実行prototypeまたは構造receiptを要求する | `HIL_SCREEN_IMPLICIT_SKIP` | HOT-HIL-18; HST-HIL-012 | ScreenGate | draft-defined | not-implemented |
| HIL-NFR-12 | HIA-NFR-012 | 代表fixture、検索ゼロ、包括要件だけのcoverageがある | source coverageを評価する | atomic source span、digest、抽出時点が無いcovered判定を拒否する | `HIL_SOURCE_COMPLETENESS_UNPROVEN` | HOT-HIL-37; HST-HIL-011 | CapabilityCoverageGate | draft-defined | not-implemented |
| HIL-NFR-13 | HIA-NFR-013 | 同一snapshot、version、configで複数runを行う | artifactとfindingを比較する | digest差異をnondeterminism findingとしてfailにする | `HIL_NONDETERMINISTIC_RESULT` | HOT-HIL-23; HST-HIL-009 | DeterminismGate | draft-defined | not-implemented |
| HIL-NFR-14 | HIA-NFR-014 | 不正JSON、schema違反、oversize、欠番、crash、timeout、cancel、backpressure、親消失fixtureがある | IPCへ順次投入する | 全異常がfail-closeしpartial resultを正本化しない | `HIL_IPC_FAIL_OPEN` | HOT-HIL-24; HST-HIL-007 | PythonWorkerBroker | draft-defined | not-implemented |
| HIL-NFR-15 | HIA-NFR-015 | 別SHA green、lineage欠落、quarantine resultがある | 次CI段へ進める | current段とpredecessorにbindしないgreenを拒否する | `HIL_CI_RECEIPT_LINEAGE_INVALID` | HOT-HIL-27; HST-HIL-003 | ThreeStageCiOrchestrator | draft-defined | not-implemented |
| HIL-NFR-16 | HIA-NFR-016 | wildcard、無期限、directory単位、全check quarantineがある | waiverを登録し再利用する | exact fingerprintと期限付き以外を拒否し変更時にstale化する | `HIL_QUARANTINE_OVERBROAD` | HOT-HIL-28; HST-HIL-022 | CiQuarantineManager | draft-defined | not-implemented |
| HIL-NFR-17 | HIA-NFR-017 | PII、secret、raw payloadを含むproduct snapshotがある | projectionとagent contextを生成する | classification、redaction、retention、freshnessに違反する複製を拒否する | `HIL_PRODUCT_DATA_POLICY_VIOLATION` | HOT-HIL-21; HST-HIL-010 | ProductDataPolicyGate | draft-defined | not-implemented |
| HIL-NFR-18 | HIA-NFR-018 | lease再割当後に旧agentがtool callとcompletionを返す | artifact commitと再開を要求する | fencing mismatchを拒否しdurable checkpointからだけ再開する | `HIL_AGENT_FENCING_VIOLATION` | HOT-HIL-33; HST-HIL-006 | AgentLifecycleController | draft-defined | not-implemented |
| HIL-NFR-19 | HIA-NFR-019 | Linux未実行でWindows wrapperだけgreenのevidenceがある | core completionを要求する | Linux full未実施を明示しcompletionを拒否する | `HIL_LINUX_COMPLETION_MISSING` | HOT-HIL-26; HST-HIL-014 | OsCompletionGate | draft-defined | not-implemented |
| HIL-NFR-20 | HIA-NFR-020 | 非空だが同文、同digest、source spanなし、coverage不足artifactがある | Reverse substanceを検査する | stage固有semantic assertionで全不備を拒否する | `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` | HOT-HIL-35; HST-HIL-018 | ReverseSubstanceAnalyzer | draft-defined | not-implemented |
| HIL-NFR-21 | HIA-NFR-021 | AI disposition、PO disposition、独立review有無のfixtureがある | cancel、supersede、false-positive、accepted-riskを適用する | 原記録を維持しPO authorityまたは独立review欠落を拒否する | `HIL_DIRECTIVE_TERMINATED_BY_AI` | HOT-HIL-36; HST-HIL-019 | DirectiveCustodyGate | draft-defined | not-implemented |
| HIL-NFR-22 | HIA-NFR-022 | aggregate親とatomic childを含むsource集合がある | coverage分母を算出しsourceを変更する | childだけを分母にし変更後は全child receiptをstale化する | `HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID` | HOT-HIL-37; HST-HIL-020 | SourceCapabilityAtomizer | draft-defined | not-implemented |
| HIL-NFR-23 | HIA-NFR-023 | authoritative root、自己cycle、同時追加HIL cycleがある | derivation graphを解決する | acyclicにrootへ到達するedgeだけをscope根拠として受理する | `HIL_SCOPE_DERIVATION_CYCLE` | HOT-HIL-38; HST-HIL-021 | ScopeAuthorityResolver | draft-defined | not-implemented |
| HIL-NFR-24 | HIA-NFR-024 | lexical similarityだけのrename、将来用途だけの共通層/base class/config候補がある | Design Refactor GateとScope Gateへ投入する | semantic/構造証拠、全consumer、最小性、behavior invariant、rollbackの欠落候補を全て拒否する | `HIL_DESIGN_REFACTOR_UNJUSTIFIED` | HOT-HIL-39; HST-HIL-025 | DesignRefactorPlanner; ScopeAuthorityResolver | draft-defined | not-implemented |
| HIL-NFR-25 | HIA-NFR-025 | mutable VO、root外更新、side-effect Query、現在形Event、曖昧名がある | Domain Model Gateへ投入する | role invariantとdependency方向に違反する全件を拒否する | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` | HOT-HIL-40; HST-HIL-026 | DomainModelCatalog | draft-defined | not-implemented |
| HIL-NFR-26 | HIA-NFR-026 | 見出し、TBD、空表、複合discharge、自由文N/Aがある | design coverageを判定する | semantic evidenceと原子的edgeがない全義務を未完了にする | `HIL_DESIGN_TEMPLATE_SECTION_HOLLOW` | HOT-HIL-41; HST-HIL-027 | DesignObligationPlanner | draft-defined | not-implemented |
| HIL-NFR-27 | HIA-NFR-027 | translator/authorが自己promotionするfixtureがある | candidate active化を要求する | role分離、shadow、独立監査、rollback欠落を拒否する | `HIL_TEMPLATE_SELF_PROMOTION` | HOT-HIL-42; HST-HIL-028 | TemplateImprovementCoordinator | draft-defined | not-implemented |
| HIL-NFR-28 | HIA-NFR-028 | 連番とcoverage行だけがある要求、orphan、stale、ambiguity fixtureがある | requirement freezeを要求する | semantic設計edgeが完全でない要求をgreenにしない | `HIL_REQUIREMENT_LEDGER_SEMANTIC_GAP` | HOT-HIL-43; HST-HIL-029 | RequirementDefinitionLedger | draft-defined | not-implemented |
| HIL-NFR-29 | HIA-NFR-029 | aggregate親、片edge、stale、deferred、未実行oracle fixtureがある | layer pair coverageを算出する | 原子的・双方向・同一revision/snapshot・実行済みだけをcoveredにする | `HIL_LAYER_LEDGER_COVERAGE_INVALID` | HOT-HIL-44; HST-HIL-030 | LedgerPairGate | draft-defined | not-implemented |
| HIL-BR-26 | HIA-BR-026 | Authoring proposalとpolicy境界がある | Admissionを判定する | 可逆変更だけ自動確定する | `HIL_AUTHORING_ADMISSION_INVALID` | HOT-HIL-48 | AuthoringAdmissionEngine | draft-defined | not-implemented |
| HIL-BR-27 | HIA-BR-027 | 要求義務とriskがある | portfolioを導出する | 未被覆・重複0にする | `HIL_CONTRACT_PORTFOLIO_INADEQUATE` | HOT-HIL-50 | ContractPortfolioPlanner | draft-defined | not-implemented |
| HIL-BR-28 | HIA-BR-028 | Forward/Scrum工程がある | workflow bindする | S4後だけForwardへ戻す | `HIL_WORKFLOW_CONTRACT_DISCONNECTED` | HOT-HIL-51 | WorkflowContractRouter | draft-defined | not-implemented |
| HIL-BR-29 | HIA-BR-029 | task/riskがある | judgment packを選ぶ | shadow未完をactive化しない | `HIL_JUDGMENT_PACK_UNVERIFIED` | HOT-HIL-52 | JudgmentPackRegistry | draft-defined | not-implemented |
| HIL-BR-30 | HIA-BR-030 | task分類と工程がある | agent contractを生成する | 最小team以外を拒否する | `HIL_SPECIALIST_AGENT_OVERMUSTERED` | HOT-HIL-53 | SpecialistAgentContractCompiler; SpecialistMusterGate | draft-defined | not-implemented |
| HIL-BR-31 | HIA-BR-031 | worker候補がある | benchと実taskを評価する | 用途別decisionを出す | `HIL_WORKER_ADMISSION_UNPROVEN` | HOT-HIL-54 | WorkerAcceptanceBench; TaskPerformanceScorecard | draft-defined | not-implemented |
| HIL-FR-51 | HIA-FR-051 | proposalとpolicyがある | Admission Engineを実行する | enum decisionを一つ返す | `HIL_AUTHORING_DECISION_AMBIGUOUS` | HOT-HIL-48 | AuthoringAdmissionEngine | draft-defined | not-implemented |
| HIL-FR-52 | HIA-FR-052 | fault injection可能なwrite setがある | Canonical化する | 全commit又はrollbackする | `HIL_CANONICALIZATION_PARTIAL` | HOT-HIL-49 | AtomicCanonicalizationTransaction | draft-defined | not-implemented |
| HIL-FR-53 | HIA-FR-053 | rename/split/merge fixtureがある | revisionを更新する | identity・oracleを保持する | `HIL_ASSET_IDENTITY_LOST` | HOT-HIL-49 | SemanticRevisionStore | draft-defined | not-implemented |
| HIL-FR-54 | HIA-FR-054 | obligation集合がある | contractへ割当てる | uncovered/duplicate 0にする | `HIL_CONTRACT_PORTFOLIO_INADEQUATE` | HOT-HIL-50 | ContractPortfolioPlanner | draft-defined | not-implemented |
| HIL-FR-55 | HIA-FR-055 | rule/branch/riskがある | example coverageを測る | positive/negative不足を拒否する | `HIL_TEMPLATE_EXAMPLE_INADEQUATE` | HOT-HIL-50 | TemplateExampleCalibrator | draft-defined | not-implemented |
| HIL-FR-56 | HIA-FR-056 | portfolioと工程がある | Forward/Scrumへbindする | edge欠落を拒否する | `HIL_WORKFLOW_CONTRACT_DISCONNECTED` | HOT-HIL-51 | WorkflowContractRouter | draft-defined | not-implemented |
| HIL-FR-57 | HIA-FR-057 | skill候補がある | packを合成する | conflictを露出する | `HIL_JUDGMENT_PACK_CONFLICT` | HOT-HIL-52 | JudgmentPackRegistry | draft-defined | not-implemented |
| HIL-FR-58 | HIA-FR-058 | findingと比較fixtureがある | shadow評価する | 独立review前active 0にする | `HIL_JUDGMENT_PACK_SELF_PROMOTION` | HOT-HIL-52 | JudgmentPackImprovementLoop | draft-defined | not-implemented |
| HIL-FR-59 | HIA-FR-059 | workflow/task/riskがある | runtime中立contractを生成する | 委譲4点とguardを必須にする | `HIL_AGENT_CONTRACT_INCOMPLETE` | HOT-HIL-53 | SpecialistAgentContractCompiler | draft-defined | not-implemented |
| HIL-FR-60 | HIA-FR-060 | 生成contractがある | muster判定する | 過剰・自己検証を拒否する | `HIL_SPECIALIST_MUSTER_INVALID` | HOT-HIL-53 | SpecialistMusterGate | draft-defined | not-implemented |
| HIL-FR-61 | HIA-FR-061 | fixed fixture/rubricがある | smoke/full benchを実行する | blind scoreを再現する | `HIL_WORKER_BENCH_INVALID` | HOT-HIL-54 | WorkerAcceptanceBench | draft-defined | not-implemented |
| HIL-FR-62 | HIA-FR-062 | 実task実績がある | scorecardを集計する | retry込みcostを算出する | `HIL_TASK_SCORECARD_INCOMPLETE` | HOT-HIL-54 | TaskPerformanceScorecard | draft-defined | not-implemented |
| HIL-FR-63 | HIA-FR-063 | task/risk/scoreがある | model/effortを比較する | 最小有効構成を選ぶ | `HIL_EFFORT_ROUTE_UNPROVEN` | HOT-HIL-55 | EffortRouter | draft-defined | not-implemented |
| HIL-NFR-30 | HIA-NFR-030 | 可逆変更がある | 自動Admissionする | 人間待ちなしで完走する | `HIL_AUTHORING_AUTONOMY_BLOCKED` | HOT-HIL-48 | AuthoringAdmissionEngine | draft-defined | not-implemented |
| HIL-NFR-31 | HIA-NFR-031 | 各write段へfaultを入れる | Canonical化する | 部分current 0にする | `HIL_CANONICALIZATION_NOT_ATOMIC` | HOT-HIL-49 | AtomicCanonicalizationTransaction | draft-defined | not-implemented |
| HIL-NFR-32 | HIA-NFR-032 | semantic changeがある | safety edgeを検査する | 欠落時Canonical化0にする | `HIL_SEMANTIC_CHANGE_UNSAFE` | HOT-HIL-49 | SemanticRevisionStore | draft-defined | not-implemented |
| HIL-NFR-33 | HIA-NFR-033 | 契約/見本集合がある | adequacyを測る | 数量だけの合格を拒否する | `HIL_CONTRACT_ADEQUACY_INVALID` | HOT-HIL-50 | ContractPortfolioPlanner; TemplateExampleCalibrator | draft-defined | not-implemented |
| HIL-NFR-34 | HIA-NFR-034 | 生成pack/agentがある | authority/staleを検査する | 未監査・未許可を拒否する | `HIL_GENERATED_AUTHORITY_VIOLATION` | HOT-HIL-52; HOT-HIL-53 | JudgmentPackRegistry; SpecialistMusterGate | draft-defined | not-implemented |
| HIL-NFR-35 | HIA-NFR-035 | blind fixtureがある | workerを比較する | 重大failure相殺を拒否する | `HIL_WORKER_EVALUATION_BIASED` | HOT-HIL-54 | WorkerAcceptanceBench | draft-defined | not-implemented |
| HIL-NFR-36 | HIA-NFR-036 | routing実績がある | policy逸脱を検査する | 比較receipt欠落を拒否する | `HIL_EFFORT_POLICY_UNTRACEABLE` | HOT-HIL-55 | EffortRouter | draft-defined | not-implemented |
| HIL-BR-32 | HIA-BR-032 | 第三者runtime委譲がある | 隔離境界を検査する | 隔離外実行・機密委譲を拒否する | `HIL_WORKER_ISOLATION_BREACH` | HOT-HIL-56 | WorkerRuntimeIsolation | draft-defined | not-implemented |
| HIL-BR-33 | HIA-BR-033 | 配布packageがある | index構成を検査する | 手編集index・party混在を拒否する | `HIL_DISTRIBUTION_INDEX_INVALID` | HOT-HIL-57 | DistributionMarketplaceSpec | draft-defined | not-implemented |
| HIL-FR-64 | HIA-FR-064 | sandbox templateがある | 実行環境とegressを検査する | template逸脱・egress乖離をquarantineする | `HIL_SANDBOX_CONTRACT_VIOLATION` | HOT-HIL-56 | WorkerSandboxContract | draft-defined | not-implemented |
| HIL-FR-65 | HIA-FR-065 | 入れ子CLI委譲がある | env/入出力/timeoutを検査する | 未浄化env・timeout欠落を検出する | `HIL_DELEGATION_ENV_UNSANITIZED` | HOT-HIL-56 | DelegationEnvironmentHygiene | draft-defined | not-implemented |
| HIL-FR-66 | HIA-FR-066 | worker出力がある | schema/digest/FS差分を再検証する | scope外diff・未検証出力実行を拒否する | `HIL_PROPOSAL_REVALIDATION_FAILED` | HOT-HIL-56 | ProposalRevalidationGate | draft-defined | not-implemented |
| HIL-FR-67 | HIA-FR-067 | 払い出し要求がある | sparse構成とsecret scanを検査する | 履歴込み・scan未passの払い出しを拒否する | `HIL_PAYLOAD_OVERBROAD` | HOT-HIL-56 | PayloadMinimization | draft-defined | not-implemented |
| HIL-FR-68 | HIA-FR-068 | adapter委譲がある | 構造化イベント契約を検査する | 承認応答policyのcode外保持を拒否する | `HIL_WIRE_PROTOCOL_UNSTRUCTURED` | HOT-HIL-56 | DelegationWireProtocol | draft-defined | not-implemented |
| HIL-FR-69 | HIA-FR-069 | 委譲完了がある | audit行の完全性を検査する | 欠損audit・digest欠落を拒否する | `HIL_DELEGATION_AUDIT_MISSING` | HOT-HIL-56 | DelegationAuditEvidence | draft-defined | not-implemented |
| HIL-NFR-37 | HIA-NFR-037 | 委譲データがある | 分類とopt-out前提を検査する | 機密以上・opt-out未完了の委譲を遮断する | `HIL_DATA_CLASSIFICATION_BREACH` | HOT-HIL-56 | DelegationDataClassification | draft-defined | not-implemented |
| HIL-NFR-38 | HIA-NFR-038 | bypass設定がある | 有効化区間とdenyスイッチを検査する | bypass常態化・残置を拒否する | `HIL_BYPASS_PERSISTED` | HOT-HIL-56 | BypassGovernance | draft-defined | not-implemented |
| HIL-NFR-39 | HIA-NFR-039 | 充足claimがある | 根拠機構の所在を検査する | vendor設定・宣言依拠の充足claimを拒否する | `HIL_VENDOR_TRUST_FORBIDDEN` | HOT-HIL-56 | LocalEnforcementPrinciple | draft-defined | not-implemented |
| HIL-NFR-40 | HIA-NFR-040 | quota/rate制限がある | 退避挙動を検査する | 枯渇無視の継続・無計画retryを拒否する | `HIL_QUOTA_UNPLANNED` | HOT-HIL-56 | QuotaResilience | draft-defined | not-implemented |

## §5 量閉じと昇格条件

| 分類 (`category`) | 要求数 | assertion数 | 設計状態 | 実行状態 |
|---|---:|---:|---|---|
| BR | 33 | 33 | draft-defined 33件 | not-implemented 33件 |
| FR | 69 | 69 | draft-defined 69件 | not-implemented 69件 |
| TR | 11 | 11 | draft-defined 11件 | not-implemented 11件 |
| NFR | 40 | 40 | draft-defined 40件 | not-implemented 40件 |
| **total** | **153** | **153** | **draft-defined 153件** | **not-implemented 153件** |

次の全条件を満たすまで本台帳を`verified`へ昇格しない。

1. 153 requirement IDと153 assertion IDが一意で、L1の現在集合と完全一致する。
2. 全assertionに実fixture、command、exit code、output digest、DB queryまたはartifact pathがある。
3. `draft-L9-gap`がゼロになり、各assertionがL9の原子的system testへ逆引きできる。
4. range表記、slash省略ID、複合requirement cell、空fieldがゼロである。
5. workerとverifierを分離し、failure codeごとのnegative pathを実行する。
