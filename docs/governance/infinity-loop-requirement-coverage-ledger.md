---
title: "HELIX Infinity Loop requirement coverage台帳"
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
source: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
design: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
test_design: docs/test-design/helix/L1-infinity-loop-operational-test-design.md
assertion_coverage: docs/governance/infinity-loop-assertion-coverage-ledger.md
progress_ledger: docs/governance/infinity-loop-design-progress-ledger.md
schema: infinity-loop-requirement-coverage.v2
---

# HELIX Infinity Loop requirement coverage台帳

## §0 完全性規則

本台帳はL1、assertion ledger、HOT定義から生成するcanonical pointer台帳である。range、slash、代表scenarioによる省略を使わず、全edgeを完全なIDで記録する。L4欄はassertionが参照するcomponent候補であり、component catalog解決済みを意味しない。pointer存在をsemantic coverage、freeze、実装証拠へ読み替えない。

## §1 業務要求（25/25採番）

| 要件 | L4 component候補 | HOT | assertion | 状態 |
|---|---|---|---|---|
| HIL-BR-01 | InfinityCoordinator; ClaudeAuditAdapter | HOT-HIL-01 | HIA-BR-001 | 追跡草案（trace-draft） |
| HIL-BR-02 | GitHubEventBridge | HOT-HIL-01 | HIA-BR-002 | 追跡草案（trace-draft） |
| HIL-BR-03 | MemoryCompactionCoordinator | HOT-HIL-02 | HIA-BR-003 | 追跡草案（trace-draft） |
| HIL-BR-04 | UniversalReverseGate | HOT-HIL-03 | HIA-BR-004 | 追跡草案（trace-draft） |
| HIL-BR-05 | RedesignRouter | HOT-HIL-04 | HIA-BR-005 | 追跡草案（trace-draft） |
| HIL-BR-06 | GateEngine | HOT-HIL-05 | HIA-BR-006 | 追跡草案（trace-draft） |
| HIL-BR-07 | DirectiveCustodyGate | HOT-HIL-05, HOT-HIL-36 | HIA-BR-007 | 追跡草案（trace-draft） |
| HIL-BR-08 | ScopeAuthorityGate | HOT-HIL-06, HOT-HIL-38 | HIA-BR-008 | 追跡草案（trace-draft） |
| HIL-BR-09 | AgentRegistry; MusterPlanner | HOT-HIL-07 | HIA-BR-009 | 追跡草案（trace-draft） |
| HIL-BR-10 | InfinityCoordinator | HOT-HIL-08 | HIA-BR-010 | 追跡草案（trace-draft） |
| HIL-BR-11 | LearningPromotionLedger | HOT-HIL-09 | HIA-BR-011 | 追跡草案（trace-draft） |
| HIL-BR-12 | IntakeNormalizer | HOT-HIL-08 | HIA-BR-012 | 追跡草案（trace-draft） |
| HIL-BR-13 | ScreenApplicabilityGate | HOT-HIL-16, HOT-HIL-17 | HIA-BR-013 | 追跡草案（trace-draft） |
| HIL-BR-14 | SourceCapabilityAtomizer; CapabilityCoverageGate | HOT-HIL-19, HOT-HIL-20, HOT-HIL-37 | HIA-BR-014 | 追跡草案（trace-draft） |
| HIL-BR-15 | ProductDataConnectorRegistry | HOT-HIL-21 | HIA-BR-015 | 追跡草案（trace-draft） |
| HIL-BR-16 | ThreeStageCiOrchestrator | HOT-HIL-27 | HIA-BR-016 | 追跡草案（trace-draft） |
| HIL-BR-17 | FindingPromotionPipeline | HOT-HIL-29 | HIA-BR-017 | 追跡草案（trace-draft） |
| HIL-BR-18 | AgentLifecycleController | HOT-HIL-32 | HIA-BR-018 | 追跡草案（trace-draft） |
| HIL-BR-19 | BunDependencyCoverageGate | HOT-HIL-25 | HIA-BR-019 | 追跡草案（trace-draft） |
| HIL-BR-20 | CiQuarantineManager | HOT-HIL-28 | HIA-BR-020 | 追跡草案（trace-draft） |
| HIL-BR-21 | DesignRefactorPlanner | HOT-HIL-39, HOT-HIL-40 | HIA-BR-021 | 追跡草案（trace-draft） |
| HIL-BR-22 | DesignObligationPlanner | HOT-HIL-41 | HIA-BR-022 | 追跡草案（trace-draft） |
| HIL-BR-23 | RequirementTranslator; TemplateImprovementCoordinator | HOT-HIL-42 | HIA-BR-023 | 追跡草案（trace-draft） |
| HIL-BR-24 | RequirementDefinitionLedger | HOT-HIL-43 | HIA-BR-024 | 追跡草案（trace-draft） |
| HIL-BR-25 | LayerLedgerRegistry; LedgerPairGate | HOT-HIL-44, HOT-HIL-45, HOT-HIL-46, HOT-HIL-47 | HIA-BR-025 | 追跡草案（trace-draft） |

## §2 機能要求（50/50採番）

| 要件 | L4 component候補 | HOT | assertion | 状態 |
|---|---|---|---|---|
| HIL-FR-01 | InfinityCoordinator | HOT-HIL-01 | HIA-FR-001 | 追跡草案（trace-draft） |
| HIL-FR-02 | GitHubEventBridge | HOT-HIL-01 | HIA-FR-002 | 追跡草案（trace-draft） |
| HIL-FR-03 | IssueContractStore | HOT-HIL-03 | HIA-FR-003 | 追跡草案（trace-draft） |
| HIL-FR-04 | UniversalReverseGate | HOT-HIL-03, HOT-HIL-29, HOT-HIL-35 | HIA-FR-004 | 追跡草案（trace-draft） |
| HIL-FR-05 | RedesignRouter | HOT-HIL-04, HOT-HIL-30, HOT-HIL-31 | HIA-FR-005 | 追跡草案（trace-draft） |
| HIL-FR-06 | ScopeAuthorityGate | HOT-HIL-06, HOT-HIL-38 | HIA-FR-006 | 追跡草案（trace-draft） |
| HIL-FR-07 | ClosureGate | HOT-HIL-05 | HIA-FR-007 | 追跡草案（trace-draft） |
| HIL-FR-08 | CodexExecutionAdapter | HOT-HIL-08, HOT-HIL-29 | HIA-FR-008 | 追跡草案（trace-draft） |
| HIL-FR-09 | ClaudeAuditAdapter; DirectiveCustodyLedger | HOT-HIL-08, HOT-HIL-29, HOT-HIL-36 | HIA-FR-009 | 追跡草案（trace-draft） |
| HIL-FR-10 | MemoryCompactionCoordinator | HOT-HIL-02, HOT-HIL-29 | HIA-FR-010 | 追跡草案（trace-draft） |
| HIL-FR-11 | AgentRegistry | HOT-HIL-07 | HIA-FR-011 | 追跡草案（trace-draft） |
| HIL-FR-12 | AgentSyncGuard | HOT-HIL-07 | HIA-FR-012 | 追跡草案（trace-draft） |
| HIL-FR-13 | MusterPlanner | HOT-HIL-07 | HIA-FR-013 | 追跡草案（trace-draft） |
| HIL-FR-14 | LearningPromotionLedger | HOT-HIL-09 | HIA-FR-014 | 追跡草案（trace-draft） |
| HIL-FR-15 | HybridDocgenIngestion | HOT-HIL-10 | HIA-FR-015 | 追跡草案（trace-draft） |
| HIL-FR-16 | AssetInventory | HOT-HIL-10 | HIA-FR-016 | 追跡草案（trace-draft） |
| HIL-FR-17 | ScreenApplicabilityGate | HOT-HIL-16, HOT-HIL-17, HOT-HIL-31 | HIA-FR-017 | 追跡草案（trace-draft） |
| HIL-FR-18 | PrototypeBuilder | HOT-HIL-17, HOT-HIL-18, HOT-HIL-31 | HIA-FR-018 | 追跡草案（trace-draft） |
| HIL-FR-19 | WalkthroughLoop | HOT-HIL-17, HOT-HIL-18, HOT-HIL-31 | HIA-FR-019 | 追跡草案（trace-draft） |
| HIL-FR-20 | ScreenGate | HOT-HIL-16, HOT-HIL-17, HOT-HIL-31 | HIA-FR-020 | 追跡草案（trace-draft） |
| HIL-FR-21 | SourceSnapshotter | HOT-HIL-19, HOT-HIL-20, HOT-HIL-37 | HIA-FR-021 | 追跡草案（trace-draft） |
| HIL-FR-22 | CapabilityCoverageGate | HOT-HIL-19, HOT-HIL-20, HOT-HIL-37 | HIA-FR-022 | 追跡草案（trace-draft） |
| HIL-FR-23 | ProductDataConnectorRegistry | HOT-HIL-21 | HIA-FR-023 | 追跡草案（trace-draft） |
| HIL-FR-24 | ProductDataProjectionWorker | HOT-HIL-21, HOT-HIL-22 | HIA-FR-024 | 追跡草案（trace-draft） |
| HIL-FR-25 | HybridDocumentCoreEngineRegistry | HOT-HIL-23 | HIA-FR-025 | 追跡草案（trace-draft） |
| HIL-FR-26 | DetectorRegistryRunner | HOT-HIL-23 | HIA-FR-026 | 追跡草案（trace-draft） |
| HIL-FR-27 | PythonWorkerBroker | HOT-HIL-24 | HIA-FR-027 | 追跡草案（trace-draft） |
| HIL-FR-28 | ThreeStageCiOrchestrator | HOT-HIL-27 | HIA-FR-028 | 追跡草案（trace-draft） |
| HIL-FR-29 | CiQuarantineManager | HOT-HIL-28 | HIA-FR-029 | 追跡草案（trace-draft） |
| HIL-FR-30 | FindingPromotionPipeline | HOT-HIL-29 | HIA-FR-030 | 追跡草案（trace-draft） |
| HIL-FR-31 | UpstreamRedesignReentry | HOT-HIL-30, HOT-HIL-31 | HIA-FR-031 | 追跡草案（trace-draft） |
| HIL-FR-32 | AgentLifecycleController | HOT-HIL-32, HOT-HIL-33 | HIA-FR-032 | 追跡草案（trace-draft） |
| HIL-FR-33 | BunDependencyCoverageGate | HOT-HIL-25 | HIA-FR-033 | 追跡草案（trace-draft） |
| HIL-FR-34 | OsContractRunner | HOT-HIL-26 | HIA-FR-034 | 追跡草案（trace-draft） |
| HIL-FR-35 | ReverseSubstanceAnalyzer | HOT-HIL-35 | HIA-FR-035 | 追跡草案（trace-draft） |
| HIL-FR-36 | DirectiveCustodyLedger | HOT-HIL-36 | HIA-FR-036 | 追跡草案（trace-draft） |
| HIL-FR-37 | SourceCapabilityAtomizer | HOT-HIL-37 | HIA-FR-037 | 追跡草案（trace-draft） |
| HIL-FR-38 | ScopeAuthorityResolver | HOT-HIL-38 | HIA-FR-038 | 追跡草案（trace-draft） |
| HIL-FR-39 | DesignRefactorPlanner | HOT-HIL-39 | HIA-FR-039 | 追跡草案（trace-draft） |
| HIL-FR-40 | DomainModelCatalog | HOT-HIL-40 | HIA-FR-040 | 追跡草案（trace-draft） |
| HIL-FR-41 | DesignTemplateRegistry | HOT-HIL-41 | HIA-FR-041 | 追跡草案（trace-draft） |
| HIL-FR-42 | DesignObligationPlanner | HOT-HIL-41 | HIA-FR-042 | 追跡草案（trace-draft） |
| HIL-FR-43 | RequirementTranslator | HOT-HIL-42 | HIA-FR-043 | 追跡草案（trace-draft） |
| HIL-FR-44 | TemplateImprovementCoordinator | HOT-HIL-42 | HIA-FR-044 | 追跡草案（trace-draft） |
| HIL-FR-45 | RequirementDefinitionLedger | HOT-HIL-43 | HIA-FR-045 | 追跡草案（trace-draft） |
| HIL-FR-46 | LayerLedgerRegistry | HOT-HIL-44 | HIA-FR-046 | 追跡草案（trace-draft） |
| HIL-FR-47 | TemplateObligationExtractor | HOT-HIL-44 | HIA-FR-047 | 追跡草案（trace-draft） |
| HIL-FR-48 | LedgerPairGate | HOT-HIL-45 | HIA-FR-048 | 追跡草案（trace-draft） |
| HIL-FR-49 | LedgerPairGate | HOT-HIL-46 | HIA-FR-049 | 追跡草案（trace-draft） |
| HIL-FR-50 | LedgerDesignRefactorPlanner | HOT-HIL-47 | HIA-FR-050 | 追跡草案（trace-draft） |

## §3 技術要求（11/11採番）

| 要件 | L4 component候補 | HOT | assertion | 状態 |
|---|---|---|---|---|
| HIL-TR-01 | NodeControlPlane; BunDependencyCoverageGate | HOT-HIL-11 | HIA-TR-001 | 追跡草案（trace-draft） |
| HIL-TR-02 | PythonWorkerBroker | HOT-HIL-11 | HIA-TR-002 | 追跡草案（trace-draft） |
| HIL-TR-03 | PythonWorkerBroker; ResultIngestionPort | HOT-HIL-11 | HIA-TR-003 | 追跡草案（trace-draft） |
| HIL-TR-04 | OsAdapter | HOT-HIL-12, HOT-HIL-26 | HIA-TR-004 | 追跡草案（trace-draft） |
| HIL-TR-05 | OsAdapter | HOT-HIL-12, HOT-HIL-26 | HIA-TR-005 | 追跡草案（trace-draft） |
| HIL-TR-06 | SupplyChainVerifier | HOT-HIL-12, HOT-HIL-26, HOT-HIL-34 | HIA-TR-006 | 追跡草案（trace-draft） |
| HIL-TR-07 | HarnessDbPort | HOT-HIL-11 | HIA-TR-007 | 追跡草案（trace-draft） |
| HIL-TR-08 | PythonWorkerBroker | HOT-HIL-24 | HIA-TR-008 | 追跡草案（trace-draft） |
| HIL-TR-09 | ResultIngestionPort | HOT-HIL-21, HOT-HIL-24 | HIA-TR-009 | 追跡草案（trace-draft） |
| HIL-TR-10 | HarnessDbProjection | HOT-HIL-21, HOT-HIL-23 | HIA-TR-010 | 追跡草案（trace-draft） |
| HIL-TR-11 | BunCutoverGate | HOT-HIL-25 | HIA-TR-011 | 追跡草案（trace-draft） |

## §4 非機能要求（29/29採番）

| 要件 | L4 component候補 | HOT | assertion | 状態 |
|---|---|---|---|---|
| HIL-NFR-01 | IdempotencyGate | HOT-HIL-13 | HIA-NFR-001 | 追跡草案（trace-draft） |
| HIL-NFR-02 | RoleSeparationGate | HOT-HIL-14 | HIA-NFR-002 | 追跡草案（trace-draft） |
| HIL-NFR-03 | UniversalReverseGate | HOT-HIL-03, HOT-HIL-35 | HIA-NFR-003 | 追跡草案（trace-draft） |
| HIL-NFR-04 | InfinityCoordinator | HOT-HIL-13 | HIA-NFR-004 | 追跡草案（trace-draft） |
| HIL-NFR-05 | IntakeTrustGate | HOT-HIL-15 | HIA-NFR-005 | 追跡草案（trace-draft） |
| HIL-NFR-06 | ActionBindingGate | HOT-HIL-15 | HIA-NFR-006 | 追跡草案（trace-draft） |
| HIL-NFR-07 | ScopeAuthorityGate | HOT-HIL-06, HOT-HIL-38 | HIA-NFR-007 | 追跡草案（trace-draft） |
| HIL-NFR-08 | EvidenceProvenanceGate | HOT-HIL-14 | HIA-NFR-008 | 追跡草案（trace-draft） |
| HIL-NFR-09 | OsContractRunner | HOT-HIL-12 | HIA-NFR-009 | 追跡草案（trace-draft） |
| HIL-NFR-10 | AgentSyncGuard | HOT-HIL-07 | HIA-NFR-010 | 追跡草案（trace-draft） |
| HIL-NFR-11 | ScreenGate | HOT-HIL-16, HOT-HIL-18 | HIA-NFR-011 | 追跡草案（trace-draft） |
| HIL-NFR-12 | CapabilityCoverageGate | HOT-HIL-19, HOT-HIL-37 | HIA-NFR-012 | 追跡草案（trace-draft） |
| HIL-NFR-13 | DeterminismGate | HOT-HIL-23 | HIA-NFR-013 | 追跡草案（trace-draft） |
| HIL-NFR-14 | PythonWorkerBroker | HOT-HIL-24 | HIA-NFR-014 | 追跡草案（trace-draft） |
| HIL-NFR-15 | ThreeStageCiOrchestrator | HOT-HIL-27 | HIA-NFR-015 | 追跡草案（trace-draft） |
| HIL-NFR-16 | CiQuarantineManager | HOT-HIL-28 | HIA-NFR-016 | 追跡草案（trace-draft） |
| HIL-NFR-17 | ProductDataPolicyGate | HOT-HIL-21 | HIA-NFR-017 | 追跡草案（trace-draft） |
| HIL-NFR-18 | AgentLifecycleController | HOT-HIL-32, HOT-HIL-33 | HIA-NFR-018 | 追跡草案（trace-draft） |
| HIL-NFR-19 | OsCompletionGate | HOT-HIL-26 | HIA-NFR-019 | 追跡草案（trace-draft） |
| HIL-NFR-20 | ReverseSubstanceAnalyzer | HOT-HIL-35 | HIA-NFR-020 | 追跡草案（trace-draft） |
| HIL-NFR-21 | DirectiveCustodyGate | HOT-HIL-36 | HIA-NFR-021 | 追跡草案（trace-draft） |
| HIL-NFR-22 | SourceCapabilityAtomizer | HOT-HIL-37 | HIA-NFR-022 | 追跡草案（trace-draft） |
| HIL-NFR-23 | ScopeAuthorityResolver | HOT-HIL-38 | HIA-NFR-023 | 追跡草案（trace-draft） |
| HIL-NFR-24 | DesignRefactorPlanner; ScopeAuthorityResolver | HOT-HIL-39 | HIA-NFR-024 | 追跡草案（trace-draft） |
| HIL-NFR-25 | DomainModelCatalog | HOT-HIL-40 | HIA-NFR-025 | 追跡草案（trace-draft） |
| HIL-NFR-26 | DesignObligationPlanner | HOT-HIL-41 | HIA-NFR-026 | 追跡草案（trace-draft） |
| HIL-NFR-27 | TemplateImprovementCoordinator | HOT-HIL-42 | HIA-NFR-027 | 追跡草案（trace-draft） |
| HIL-NFR-28 | RequirementDefinitionLedger | HOT-HIL-43 | HIA-NFR-028 | 追跡草案（trace-draft） |
| HIL-NFR-29 | LedgerPairGate | HOT-HIL-44, HOT-HIL-45, HOT-HIL-46, HOT-HIL-47 | HIA-NFR-029 | 追跡草案（trace-draft） |
| HIL-BR-26 | AuthoringAdmissionEngine | HOT-HIL-48 | HIA-BR-026 | 追跡草案（trace-draft） |
| HIL-BR-27 | ContractPortfolioPlanner | HOT-HIL-50 | HIA-BR-027 | 追跡草案（trace-draft） |
| HIL-BR-28 | WorkflowContractRouter | HOT-HIL-51 | HIA-BR-028 | 追跡草案（trace-draft） |
| HIL-BR-29 | JudgmentPackRegistry | HOT-HIL-52 | HIA-BR-029 | 追跡草案（trace-draft） |
| HIL-BR-30 | SpecialistAgentContractCompiler; SpecialistMusterGate | HOT-HIL-53 | HIA-BR-030 | 追跡草案（trace-draft） |
| HIL-BR-31 | WorkerAcceptanceBench; TaskPerformanceScorecard | HOT-HIL-54 | HIA-BR-031 | 追跡草案（trace-draft） |
| HIL-FR-51 | AuthoringAdmissionEngine | HOT-HIL-48 | HIA-FR-051 | 追跡草案（trace-draft） |
| HIL-FR-52 | AtomicCanonicalizationTransaction | HOT-HIL-49 | HIA-FR-052 | 追跡草案（trace-draft） |
| HIL-FR-53 | SemanticRevisionStore | HOT-HIL-49 | HIA-FR-053 | 追跡草案（trace-draft） |
| HIL-FR-54 | ContractPortfolioPlanner | HOT-HIL-50 | HIA-FR-054 | 追跡草案（trace-draft） |
| HIL-FR-55 | TemplateExampleCalibrator | HOT-HIL-50 | HIA-FR-055 | 追跡草案（trace-draft） |
| HIL-FR-56 | WorkflowContractRouter | HOT-HIL-51 | HIA-FR-056 | 追跡草案（trace-draft） |
| HIL-FR-57 | JudgmentPackRegistry | HOT-HIL-52 | HIA-FR-057 | 追跡草案（trace-draft） |
| HIL-FR-58 | JudgmentPackImprovementLoop | HOT-HIL-52 | HIA-FR-058 | 追跡草案（trace-draft） |
| HIL-FR-59 | SpecialistAgentContractCompiler | HOT-HIL-53 | HIA-FR-059 | 追跡草案（trace-draft） |
| HIL-FR-60 | SpecialistMusterGate | HOT-HIL-53 | HIA-FR-060 | 追跡草案（trace-draft） |
| HIL-FR-61 | WorkerAcceptanceBench | HOT-HIL-54 | HIA-FR-061 | 追跡草案（trace-draft） |
| HIL-FR-62 | TaskPerformanceScorecard | HOT-HIL-54 | HIA-FR-062 | 追跡草案（trace-draft） |
| HIL-FR-63 | EffortRouter | HOT-HIL-55 | HIA-FR-063 | 追跡草案（trace-draft） |
| HIL-NFR-30 | AuthoringAdmissionEngine | HOT-HIL-48 | HIA-NFR-030 | 追跡草案（trace-draft） |
| HIL-NFR-31 | AtomicCanonicalizationTransaction | HOT-HIL-49 | HIA-NFR-031 | 追跡草案（trace-draft） |
| HIL-NFR-32 | SemanticRevisionStore | HOT-HIL-49 | HIA-NFR-032 | 追跡草案（trace-draft） |
| HIL-NFR-33 | ContractPortfolioPlanner; TemplateExampleCalibrator | HOT-HIL-50 | HIA-NFR-033 | 追跡草案（trace-draft） |
| HIL-NFR-34 | JudgmentPackRegistry; SpecialistMusterGate | HOT-HIL-52, HOT-HIL-53 | HIA-NFR-034 | 追跡草案（trace-draft） |
| HIL-NFR-35 | WorkerAcceptanceBench | HOT-HIL-54 | HIA-NFR-035 | 追跡草案（trace-draft） |
| HIL-NFR-36 | EffortRouter | HOT-HIL-55 | HIA-NFR-036 | 追跡草案（trace-draft） |
| HIL-BR-32 | WorkerRuntimeIsolation | HOT-HIL-56 | HIA-BR-032 | 追跡草案（trace-draft） |
| HIL-BR-33 | DistributionMarketplaceSpec | HOT-HIL-57 | HIA-BR-033 | 追跡草案（trace-draft） |
| HIL-FR-64 | WorkerSandboxContract | HOT-HIL-56 | HIA-FR-064 | 追跡草案（trace-draft） |
| HIL-FR-65 | DelegationEnvironmentHygiene | HOT-HIL-56 | HIA-FR-065 | 追跡草案（trace-draft） |
| HIL-FR-66 | ProposalRevalidationGate | HOT-HIL-56 | HIA-FR-066 | 追跡草案（trace-draft） |
| HIL-FR-67 | PayloadMinimization | HOT-HIL-56 | HIA-FR-067 | 追跡草案（trace-draft） |
| HIL-FR-68 | DelegationWireProtocol | HOT-HIL-56 | HIA-FR-068 | 追跡草案（trace-draft） |
| HIL-FR-69 | DelegationAuditEvidence | HOT-HIL-56 | HIA-FR-069 | 追跡草案（trace-draft） |
| HIL-NFR-37 | DelegationDataClassification | HOT-HIL-56 | HIA-NFR-037 | 追跡草案（trace-draft） |
| HIL-NFR-38 | BypassGovernance | HOT-HIL-56 | HIA-NFR-038 | 追跡草案（trace-draft） |
| HIL-NFR-39 | LocalEnforcementPrinciple | HOT-HIL-56 | HIA-NFR-039 | 追跡草案（trace-draft） |
| HIL-NFR-40 | QuotaResilience | HOT-HIL-56 | HIA-NFR-040 | 追跡草案（trace-draft） |

## §5 集計

| 分類 | requirement行 | HOT edgeあり | assertionあり | semantic oracle完全到達 | verified実装 |
|---|---:|---:|---:|---:|---:|
| BR | 33 | 33 | 33 | 31 | 0 |
| FR | 69 | 69 | 69 | 63 | 0 |
| TR | 11 | 11 | 11 | 11 | 0 |
| NFR | 40 | 40 | 40 | 36 | 0 |
| **total** | **153** | **153** | **153** | **141** | **0** |

HOT edgeは実HOT定義から逆生成している。153件すべてがHOTへ到達し、うち141件はprimary HST、atomic failure oracle、L4 component catalogまで到達した。追加12件（HIL-BR-32..33、HIL-FR-64..69、HIL-NFR-37..40）はHOT-HIL-56/57までで、L9/L4降下待ちである。definition activeは153/153、実装証拠は0/153であり、semantic pointer閉鎖をfreezeまたは実装完了へ読み替えない。

## §5.1 HOT逆引き（57/57）

| HOT | HIL要件 | 区分 |
|---|---|---|
| HOT-HIL-01 | HIL-BR-01, HIL-BR-02, HIL-FR-01, HIL-FR-02 | 逆引き |
| HOT-HIL-02 | HIL-BR-03, HIL-FR-10 | 逆引き |
| HOT-HIL-03 | HIL-BR-04, HIL-FR-03, HIL-FR-04, HIL-NFR-03 | 逆引き |
| HOT-HIL-04 | HIL-BR-05, HIL-FR-05 | 逆引き |
| HOT-HIL-05 | HIL-BR-06, HIL-BR-07, HIL-FR-07 | 逆引き |
| HOT-HIL-06 | HIL-BR-08, HIL-FR-06, HIL-NFR-07 | 逆引き |
| HOT-HIL-07 | HIL-BR-09, HIL-FR-11, HIL-FR-12, HIL-FR-13, HIL-NFR-10 | 逆引き |
| HOT-HIL-08 | HIL-BR-10, HIL-BR-12, HIL-FR-08, HIL-FR-09 | 逆引き |
| HOT-HIL-09 | HIL-BR-11, HIL-FR-14 | 逆引き |
| HOT-HIL-10 | HIL-FR-15, HIL-FR-16 | 逆引き |
| HOT-HIL-11 | HIL-TR-01, HIL-TR-02, HIL-TR-03, HIL-TR-07 | 逆引き |
| HOT-HIL-12 | HIL-TR-04, HIL-TR-05, HIL-TR-06, HIL-NFR-09 | 逆引き |
| HOT-HIL-13 | HIL-NFR-01, HIL-NFR-04 | 逆引き |
| HOT-HIL-14 | HIL-NFR-02, HIL-NFR-08 | 逆引き |
| HOT-HIL-15 | HIL-NFR-05, HIL-NFR-06 | 逆引き |
| HOT-HIL-16 | HIL-BR-13, HIL-FR-17, HIL-FR-20, HIL-NFR-11 | 逆引き |
| HOT-HIL-17 | HIL-BR-13, HIL-FR-17, HIL-FR-18, HIL-FR-19, HIL-FR-20 | 逆引き |
| HOT-HIL-18 | HIL-FR-18, HIL-FR-19, HIL-NFR-11 | 逆引き |
| HOT-HIL-19 | HIL-BR-14, HIL-FR-21, HIL-FR-22, HIL-NFR-12 | 逆引き |
| HOT-HIL-20 | HIL-BR-14, HIL-FR-21, HIL-FR-22 | 逆引き |
| HOT-HIL-21 | HIL-BR-15, HIL-FR-23, HIL-FR-24, HIL-TR-09, HIL-TR-10, HIL-NFR-17 | 逆引き |
| HOT-HIL-22 | HIL-FR-24 | 逆引き |
| HOT-HIL-23 | HIL-FR-25, HIL-FR-26, HIL-TR-10, HIL-NFR-13 | 逆引き |
| HOT-HIL-24 | HIL-FR-27, HIL-TR-08, HIL-TR-09, HIL-NFR-14 | 逆引き |
| HOT-HIL-25 | HIL-BR-19, HIL-FR-33, HIL-TR-11 | 逆引き |
| HOT-HIL-26 | HIL-FR-34, HIL-TR-04, HIL-TR-05, HIL-TR-06, HIL-NFR-19 | 逆引き |
| HOT-HIL-27 | HIL-BR-16, HIL-FR-28, HIL-NFR-15 | 逆引き |
| HOT-HIL-28 | HIL-BR-20, HIL-FR-29, HIL-NFR-16 | 逆引き |
| HOT-HIL-29 | HIL-BR-17, HIL-FR-04, HIL-FR-08, HIL-FR-09, HIL-FR-10, HIL-FR-30 | 逆引き |
| HOT-HIL-30 | HIL-FR-05, HIL-FR-31 | 逆引き |
| HOT-HIL-31 | HIL-FR-05, HIL-FR-17, HIL-FR-18, HIL-FR-19, HIL-FR-20, HIL-FR-31 | 逆引き |
| HOT-HIL-32 | HIL-BR-18, HIL-FR-32, HIL-NFR-18 | 逆引き |
| HOT-HIL-33 | HIL-FR-32, HIL-NFR-18 | 逆引き |
| HOT-HIL-34 | HIL-TR-06 | 逆引き |
| HOT-HIL-35 | HIL-FR-04, HIL-FR-35, HIL-NFR-03, HIL-NFR-20 | 逆引き |
| HOT-HIL-36 | HIL-BR-07, HIL-FR-09, HIL-FR-36, HIL-NFR-21 | 逆引き |
| HOT-HIL-37 | HIL-BR-14, HIL-FR-21, HIL-FR-22, HIL-FR-37, HIL-NFR-12, HIL-NFR-22 | 逆引き |
| HOT-HIL-38 | HIL-BR-08, HIL-FR-06, HIL-FR-38, HIL-NFR-07, HIL-NFR-23 | 逆引き |
| HOT-HIL-39 | HIL-BR-21, HIL-FR-39, HIL-NFR-24 | 逆引き |
| HOT-HIL-40 | HIL-BR-21, HIL-FR-40, HIL-NFR-25 | 逆引き |
| HOT-HIL-41 | HIL-BR-22, HIL-FR-41, HIL-FR-42, HIL-NFR-26 | 逆引き |
| HOT-HIL-42 | HIL-BR-23, HIL-FR-43, HIL-FR-44, HIL-NFR-27 | 逆引き |
| HOT-HIL-43 | HIL-BR-24, HIL-FR-45, HIL-NFR-28 | 逆引き |
| HOT-HIL-44 | HIL-BR-25, HIL-FR-46, HIL-FR-47, HIL-NFR-29 | 逆引き |
| HOT-HIL-45 | HIL-BR-25, HIL-FR-48, HIL-NFR-29 | 逆引き |
| HOT-HIL-46 | HIL-BR-25, HIL-FR-49, HIL-NFR-29 | 逆引き |
| HOT-HIL-47 | HIL-BR-25, HIL-FR-50, HIL-NFR-29 | 逆引き |

## §6 昇格条件

1. 本台帳、HOT定義、assertion ledgerの双方向edge差分が0である。
2. assertionのHST pointerが同一requirementを含むparent familyへ到達する。
3. 同一requirement、親HST、atomic case、failure codeが153/153一致する。現状141/153のため未達である。
4. 全component候補がL4 catalogのstable component IDへ解決する。
5. source authority、上下pair、左右pair、実行証拠がcurrentになるまでverifiedへ昇格しない。
