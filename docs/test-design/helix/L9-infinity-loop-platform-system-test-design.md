---
title: "HELIX L9 system test設計 — Infinity Loop platform"
layer: L9
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-22
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
pair_artifact: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
---

# HELIX L9 system test設計 — Infinity Loop platform

## §0 方針

L4 component境界をsystemとして検証する。現在は設計段階であり、実装fixture/commandが無い行を実行passにしない。
L1の業務受入は`L1-infinity-loop-operational-test-design.md`、本書はcomponent間のauthority、state、digest、
failure/recoveryを観測する。

## §1 test設計表

`assertion ID`は本書内の原子的system assertionである。複数failureを一つのassertionへ畳まず、
実装時は各IDにfixture、command、exit code、output digest、DB queryを結ぶ。

| ID | HIL | assertion ID | L4 boundary | scenario | expected evidence | failure code | 設計状態 | 実行状態 |
|---|---|---|---|---|---|---|---|---|
| HST-HIL-001 | HIL-BR-10, HIL-BR-12, HIL-FR-01, HIL-FR-03, HIL-NFR-01, HIL-NFR-04, HIL-NFR-05 | HST-A-001 | Intake→Issue→Coordinator | user eventとGitHub eventを同じidempotency keyで再送する | Issue contract 1件、causality 1件、重複副作用0件 | `HIL_INTAKE_DUPLICATE_EFFECT` | 設計済み | 未実装 |
| HST-HIL-002 | HIL-BR-04, HIL-BR-05, HIL-BR-06, HIL-FR-04, HIL-FR-05, HIL-FR-08, HIL-FR-31 | HST-A-002 | Reverse→Redesign Gate | R0欠落、L1 redesign、L2 redesign、L0変更を個別投入する | 欠落拒否、対象pair stale化、L0だけPO escalation | `HIL_REVERSE_STAGE_MISSING` | 設計済み | 未実装 |
| HST-HIL-003 | HIL-BR-16, HIL-FR-28, HIL-NFR-15 | HST-A-003 | Three-stage CI | prejoin失敗、postjoin失敗、external失敗、lineageなし別SHA greenを個別投入する | 各段で停止し、直前receiptとSHA/treeを結ぶ | `HIL_CI_STAGE_BYPASS` | 設計済み | 未実装 |
| HST-HIL-004 | HIL-BR-01, HIL-BR-02, HIL-FR-02, HIL-NFR-01 | HST-A-004 | GitHub bridge→Claude audit | PR create、update、reopen、synchronize、ready、mergeを全base branchへ投入する | deliveryごとに冪等audit job 1件、head SHA一致 | `HIL_GITHUB_DELIVERY_INVALID` | 設計済み | 未実装 |
| HST-HIL-005 | HIL-BR-17, HIL-FR-09, HIL-FR-30 | HST-A-005 | Finding promotion | actionable findingを生成し、Issue生成途中でtransactionを失敗させる | disposition、Issue、Reverse、memory、queueが全件commitまたは全件rollback | `HIL_FINDING_PROMOTION_PARTIAL` | 設計済み | 未実装 |
| HST-HIL-006 | HIL-BR-09, HIL-BR-18, HIL-FR-11, HIL-FR-12, HIL-FR-13, HIL-FR-32, HIL-NFR-02, HIL-NFR-10, HIL-NFR-18 | HST-A-006 | Agent registry→muster→lifecycle | adapter削除、blind漏洩、lease切れ、遅延completionを個別投入する | adapter再生成、漏洩block、fencing拒否、検証後release | `HIL_AGENT_LIFECYCLE_INVALID` | 設計済み | 未実装 |
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
| HST-HIL-030 | HIL-BR-25, HIL-FR-46, HIL-FR-47, HIL-NFR-29 | HST-A-030 | Template→Layer Ledger Registry | L1〜L12 templateへ正常、空、TBD、未知field、重複obligationを個別投入し、legacy L0〜L14 fixtureも投入する | 原子的proposalとgap findingを決定的に生成しaggregate parentをcoveredにしない。legacyはexact remapされcanonical出力に旧tokenを残さない | `HIL_LAYER_TEMPLATE_EXTRACTION_INVALID` | 設計済み | 未実装 |
| HST-HIL-031 | HIL-BR-25, HIL-FR-48, HIL-NFR-29 | HST-A-031 | Adjacent Layer Ledger Pair | vertical down/backpropの片edge、粒度、revision、snapshotを個別に壊す | 双方向・同一semantic revisionのpairだけpassし未降下/未逆伝播を分離報告する | `HIL_LAYER_VERTICAL_PAIR_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-032 | HIL-BR-25, HIL-FR-49, HIL-NFR-29 | HST-A-032 | Design Ledger→V-pair Verification Ledger | canonical 7 pairでdesign/verification/oracle/execution/snapshotを個別に欠落させる | 左右双方向、同一oracle/snapshot、実行済evidenceのpairだけgreenになる | `HIL_LAYER_VPAIR_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-033 | HIL-BR-25, HIL-FR-50, HIL-NFR-29 | HST-A-033 | Layer Ledger→DesignRefactor/Redesign/Retrofit | externalize/commonize/objectize/rename/split/merge、pair破壊、behavior/public/DB変更を個別投入する | pair/behavior保存だけDesignRefactor、contract変更はRedesign、state変更はRetrofit、rollback欠落は拒否 | `HIL_LAYER_LEDGER_REFACTOR_INVALID` | 設計済み | 未実装 |
| HST-HIL-034 | GH-FR-008, GH-FR-012, GH-FR-018, GH-AC-014 | HST-A-034 | ContextualPrReviewRouter→ClosureGate | CI greenのPRへ文脈欠落、AI-A/AI-B identity/session同一、別HEAD receipt、push後の旧receiptを個別投入する | current HEADの必須文脈を読んだ独立AI-B reviewだけをmerge readinessへ渡す | `HIL_CONTEXT_REVIEW_INCOMPLETE` | 設計済み | 未実装 |
| HST-HIL-035 | GH-FR-012, GH-FR-018, GH-AC-015 | HST-A-035 | PrDatabaseConvergenceGate→ClosureGate | current PR HEADの隔離DBへevent片肺、projection drift、checkpoint stale、schema mismatch、orphan、rebuild差分を個別投入する | source HEAD・event・projection・checkpoint・schema一致、stale/orphan 0のDB追従receiptだけをmerge readinessへ渡す | `HIL_PR_DATABASE_NOT_CONVERGED` | 設計済み | 未実装 |
| HST-HIL-036 | GH-FR-019, GH-AC-016 | HST-A-036 | LayerAwareAuditPlanner→ClosureGate | 作成前内部CI欠落、監査AI自己承認、identity/session同一review、影響L/Vペア欠落、修正後旧HEAD receiptを個別投入する | 独立実行主体の修正差分reviewと同一新HEADの両CI・DB追従だけをmerge readinessへ渡す | `HIL_AUDIT_FIX_SELF_APPROVED` | 設計済み | 未実装 |
| HST-HIL-037 | GH-NFR-009, GH-NFR-010, GH-NFR-011, GH-AC-017, GH-AC-018 | HST-A-037 | CiPerformanceRecoveryRouter | internal/GitHub各60秒超過、Full 3分超過、correctness failure、証拠欠落、検査縮退を個別投入する | correctnessと性能判定を分離し、green性能超過だけ完全なRecoveryへ投影し、検査縮退を拒否する | `HIL_CI_PERFORMANCE_RECOVERY_MISSING` | 設計済み | 未実装 |
| HST-HIL-038 | GH-FR-020, GH-NFR-012, GH-AC-019..022 | HST-A-038 | RequirementApprovalGate→LayerAwareAuditPlanner→MainRecoveryController | L3承認欠落、未知graph edge、DB/GitHub再照合不一致、性能Recovery後回し、main解除証拠欠落を個別投入する | user approval、動的scope、Recovery優先、同一HEAD解除closureを強制する | `HIL_REQUIREMENT_USER_APPROVAL_MISSING` | 設計済み | 未実装 |
| HST-HIL-039 | GH-FR-021, GH-NFR-013..014, GH-AC-023..028 | HST-A-039 | DeploymentProfileResolver→DeploymentCapabilityPreflight→EnvironmentPromotionController→CloudDeploymentAdapter→ProductionMigrationGate | 標準profile、GitHub plan保護、concurrency、OIDC、AWS reference、staging再現度、production/migration完全性を個別投入する | 質問なし標準決定、production preflight、GitHub正式面、production同等staging、provider非依存promotionを強制する | `HIL_PRODUCTION_PROMOTION_UNSAFE` | 設計済み | 未実装 |
| HST-HIL-040 | GH-FR-022, GH-AC-029 | HST-A-040 | UpdateBacklogClassifier→completion projection | 正常future update、label欠落、state矛盾、trace欠落、active化、closeを個別投入する | 正常openをbacklogとして保持し、futureをactive blockerへ誤算入せず異常だけfinding化する | `HIL_UPDATE_BACKLOG_CLASSIFICATION_INVALID` | 設計済み | 未実装 |

## §2 完了不変条件

- **L4設計pair-freeze**: 全HSTがL4 component、個別HIL ID、assertion ID、input/output/state/failure/evidence、予定fixtureを持ち、TBD 0であること。実装前なのでexecution statusは要求しない。
- **L9実行accept**: 全HSTが実command、exit code、output digest、DB queryまたはartifact pathを持ち、`not-implemented/partial`が0であること。
- worker/verifier providerを分離し、自己判定だけでpassにしない。
- fixtureの代表成功だけでなく、各failure codeとstale/retry/crash pathを実行する。
