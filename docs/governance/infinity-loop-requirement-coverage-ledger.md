---
title: "HELIX Infinity Loop requirement coverage台帳"
status: draft
created: 2026-07-15
updated: 2026-07-16
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
source: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
design: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
test_design: docs/test-design/helix/L1-infinity-loop-operational-test-design.md
assertion_coverage: docs/governance/infinity-loop-assertion-coverage-ledger.md
progress_ledger: docs/governance/infinity-loop-design-progress-ledger.md
l1_l3_trace: docs/governance/infinity-loop-l1-l3-trace-ledger.md
hybrid_python_adoption: docs/governance/hybrid-python-engine-adoption-ledger.md
schema: infinity-loop-requirement-coverage.v2
---

# HELIX Infinity Loop requirement coverage台帳

## §0 完全性規則

本台帳はL1、assertion ledger、HOT定義から生成するcanonical pointer台帳である。range、slash、代表scenarioによる省略を使わず、全edgeを完全なIDで記録する。L4欄はassertionが参照するcomponent候補であり、component catalog解決済みを意味しない。pointer存在をsemantic coverage、freeze、実装証拠へ読み替えない。

## §1 業務要求（30/30採番）

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
| HIL-BR-26 | WorkflowInterviewCoordinator; WorkflowModelNormalizer | HOT-HIL-48 | HIA-BR-026 | 追跡草案（trace-draft） |
| HIL-BR-27 | WorkflowInterviewCoordinator | HOT-HIL-48 | HIA-BR-027 | 追跡草案（trace-draft） |
| HIL-BR-28 | WorkflowRequirementDeriver; WorkflowCompletenessGate | HOT-HIL-49 | HIA-BR-028 | 追跡草案（trace-draft） |
| HIL-BR-29 | RuntimeOrchestrationPlanner | HOT-HIL-50 | HIA-BR-029 | 追跡草案（trace-draft） |
| HIL-BR-30 | StandingAuthorizationRegistry; ExecutionAuthorizationGate | HOT-HIL-51, HOT-HIL-52 | HIA-BR-030 | 追跡草案（trace-draft） |

## §2 機能要求（81/81採番）

| 要件 | L4 component候補 | HOT/HAT | assertion | 状態 |
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
| HIL-FR-51 | UniversalWorkflowPackageRegistry | HOT-HIL-48 | HIA-FR-051 | 追跡草案（trace-draft） |
| HIL-FR-52 | WorkflowInterviewCoordinator | HOT-HIL-48 | HIA-FR-052 | 追跡草案（trace-draft） |
| HIL-FR-53 | WorkflowModelNormalizer | HOT-HIL-48 | HIA-FR-053 | 追跡草案（trace-draft） |
| HIL-FR-54 | WorkflowCompletenessGate | HOT-HIL-49 | HIA-FR-054 | 追跡草案（trace-draft） |
| HIL-FR-55 | WorkflowRequirementDeriver | HOT-HIL-49 | HIA-FR-055 | 追跡草案（trace-draft） |
| HIL-FR-56 | RuntimeOrchestrationPlanner | HOT-HIL-50 | HIA-FR-056 | 追跡草案（trace-draft） |
| HIL-FR-57 | CanonicalActionIntentNormalizer | HOT-HIL-51 | HIA-FR-057 | 追跡草案（trace-draft） |
| HIL-FR-58 | StandingAuthorizationRegistry | HOT-HIL-51 | HIA-FR-058 | 追跡草案（trace-draft） |
| HIL-FR-59 | ExecutionAuthorizationGate | HOT-HIL-52 | HIA-FR-059 | 追跡草案（trace-draft） |
| HIL-FR-60 | PlatformPermissionBrokerAdapter; BoundedActionExecutor | HOT-HIL-52 | HIA-FR-060 | 追跡草案（trace-draft） |
| HIL-FR-61 | PrototypeAgreementService | HAT-HIL-27 | HIA-FR-061 | 追跡草案（trace-draft） |
| HIL-FR-62 | PrototypeNeutralityValidator | HAT-HIL-28 | HIA-FR-062 | 追跡草案（trace-draft） |
| HIL-FR-63 | ScreenLedgerLifecycleService | HAT-HIL-29 | HIA-FR-063 | 追跡草案（trace-draft） |
| HIL-FR-64 | SemanticIdContinuityGraph | HAT-HIL-30 | HIA-FR-064 | 追跡草案（trace-draft） |
| HIL-FR-65 | ThreeContractRegistry | HAT-HIL-31 | HIA-FR-065 | 追跡草案（trace-draft） |
| HIL-FR-66 | PatternContractResolver | HAT-HIL-32 | HIA-FR-066 | 追跡草案（trace-draft） |
| HIL-FR-67 | ProductUiProfileResolver | HAT-HIL-33 | HIA-FR-067 | 追跡草案（trace-draft） |
| HIL-FR-68 | FrontendBindingService | HAT-HIL-34 | HIA-FR-068 | 追跡草案（trace-draft） |
| HIL-FR-69 | UiMissionPlanner | HAT-HIL-35 | HIA-FR-069 | 追跡草案（trace-draft） |
| HIL-FR-70 | UiImplementationProjection | HAT-HIL-36 | HIA-FR-070 | 追跡草案（trace-draft） |
| HIL-FR-71 | FalseFrontendCompletionDetector | HAT-HIL-37 | HIA-FR-071 | 追跡草案（trace-draft） |
| HIL-FR-72 | ResponsiveContractEvaluator | HAT-HIL-38 | HIA-FR-072 | 追跡草案（trace-draft） |
| HIL-FR-73 | MotionBudgetEvaluator | HAT-HIL-39 | HIA-FR-073 | 追跡草案（trace-draft） |
| HIL-FR-74 | SurfaceClassificationPolicy | HAT-HIL-40 | HIA-FR-074 | 追跡草案（trace-draft） |
| HIL-FR-75 | AccessibilityClosureService | HAT-HIL-41 | HIA-FR-075 | 追跡草案（trace-draft） |
| HIL-FR-76 | RealUxEvidenceCollector | HAT-HIL-42 | HIA-FR-076 | 追跡草案（trace-draft） |
| HIL-FR-77 | UiChangeDeltaRouter | HAT-HIL-43 | HIA-FR-077 | 追跡草案（trace-draft） |
| HIL-FR-78 | DesignCapsuleAssembler | HAT-HIL-44 | HIA-FR-078 | 追跡草案（trace-draft） |
| HIL-FR-79 | DesignJudgmentAuthorityPolicy | HAT-HIL-45 | HIA-FR-079 | 追跡草案（trace-draft） |
| HIL-FR-80 | RepositorySavepointService | HAT-HIL-46 | HIA-FR-080 | 追跡草案（trace-draft） |
| HIL-FR-81 | LayerFreezeTagGate | HAT-HIL-47 | HIA-FR-081 | 追跡草案（trace-draft） |

### §2.1 Design／Visual／savepoint exact edge（21/21）

この表のL4欄はcomponent実装済みを意味せず、L4 obligationまたはL4 component候補の正本pointerを示す。
L3、AC、HATはそれぞれ一つの実在IDへexact joinし、省略rangeをedgeとして用いない。

| edge ID | L1 requirement | L3 System FR | L4 obligation/component | HAT | AC exact set |
|---|---|---|---|---|---|
| DHX-027 | HIL-FR-61 | HR-FR-HIL-27 | PrototypeAgreementService / HBR-DH-004 | HAT-HIL-27 | HAC-HIL-27a, HAC-HIL-27b, HAC-HIL-27c |
| DHX-028 | HIL-FR-62 | HR-FR-HIL-28 | PrototypeNeutralityValidator / HBR-DH-005 | HAT-HIL-28 | HAC-HIL-28a, HAC-HIL-28b, HAC-HIL-28c |
| DHX-029 | HIL-FR-63 | HR-FR-HIL-29 | ScreenLedgerLifecycleService / HBR-DH-006 | HAT-HIL-29 | HAC-HIL-29a, HAC-HIL-29b, HAC-HIL-29c |
| DHX-030 | HIL-FR-64 | HR-FR-HIL-30 | SemanticIdContinuityGraph / HBR-DH-007 | HAT-HIL-30 | HAC-HIL-30a, HAC-HIL-30b, HAC-HIL-30c |
| DHX-031 | HIL-FR-65 | HR-FR-HIL-31 | ThreeContractRegistry / HBR-DH-008 | HAT-HIL-31 | HAC-HIL-31a, HAC-HIL-31b, HAC-HIL-31c |
| DHX-032 | HIL-FR-66 | HR-FR-HIL-32 | PatternContractResolver / HBR-DH-009 | HAT-HIL-32 | HAC-HIL-32a, HAC-HIL-32b, HAC-HIL-32c |
| DHX-033 | HIL-FR-67 | HR-FR-HIL-33 | ProductUiProfileResolver / HBR-DH-010 | HAT-HIL-33 | HAC-HIL-33a, HAC-HIL-33b, HAC-HIL-33c |
| DHX-034 | HIL-FR-68 | HR-FR-HIL-34 | FrontendBindingService / HBR-DH-011 | HAT-HIL-34 | HAC-HIL-34a, HAC-HIL-34b, HAC-HIL-34c |
| DHX-035 | HIL-FR-69 | HR-FR-HIL-35 | UiMissionPlanner / HBR-DH-012 | HAT-HIL-35 | HAC-HIL-35a, HAC-HIL-35b, HAC-HIL-35c |
| DHX-036 | HIL-FR-70 | HR-FR-HIL-36 | UiImplementationProjection / HBR-DH-013 | HAT-HIL-36 | HAC-HIL-36a, HAC-HIL-36b, HAC-HIL-36c |
| DHX-037 | HIL-FR-71 | HR-FR-HIL-37 | FalseFrontendCompletionDetector / HBR-DH-014 | HAT-HIL-37 | HAC-HIL-37a, HAC-HIL-37b, HAC-HIL-37c |
| DHX-038 | HIL-FR-72 | HR-FR-HIL-38 | ResponsiveContractEvaluator / HBR-DH-015 | HAT-HIL-38 | HAC-HIL-38a, HAC-HIL-38b, HAC-HIL-38c |
| DHX-039 | HIL-FR-73 | HR-FR-HIL-39 | MotionBudgetEvaluator / HBR-DH-016 | HAT-HIL-39 | HAC-HIL-39a, HAC-HIL-39b, HAC-HIL-39c |
| DHX-040 | HIL-FR-74 | HR-FR-HIL-40 | SurfaceClassificationPolicy / HBR-DH-017 | HAT-HIL-40 | HAC-HIL-40a, HAC-HIL-40b, HAC-HIL-40c |
| DHX-041 | HIL-FR-75 | HR-FR-HIL-41 | AccessibilityClosureService / HBR-DH-018 | HAT-HIL-41 | HAC-HIL-41a, HAC-HIL-41b, HAC-HIL-41c |
| DHX-042 | HIL-FR-76 | HR-FR-HIL-42 | RealUxEvidenceCollector / HBR-DH-019 | HAT-HIL-42 | HAC-HIL-42a, HAC-HIL-42b, HAC-HIL-42c |
| DHX-043 | HIL-FR-77 | HR-FR-HIL-43 | UiChangeDeltaRouter / HBR-DH-020 | HAT-HIL-43 | HAC-HIL-43a, HAC-HIL-43b, HAC-HIL-43c |
| DHX-044 | HIL-FR-78 | HR-FR-HIL-44 | DesignCapsuleAssembler / HBR-DH-026 | HAT-HIL-44 | HAC-HIL-44a, HAC-HIL-44b, HAC-HIL-44c |
| DHX-045 | HIL-FR-79 | HR-FR-HIL-45 | DesignJudgmentAuthorityPolicy / HBR-DH-024 | HAT-HIL-45 | HAC-HIL-45a, HAC-HIL-45b, HAC-HIL-45c |
| DHX-046 | HIL-FR-80 | HR-FR-HIL-46 | RepositorySavepointService / L4 component catalog | HAT-HIL-46 | HAC-HIL-46a, HAC-HIL-46b, HAC-HIL-46c |
| DHX-047 | HIL-FR-81 | HR-FR-HIL-47 | LayerFreezeTagGate / L4 component catalog | HAT-HIL-47 | HAC-HIL-47a, HAC-HIL-47b, HAC-HIL-47c |

## §3 技術要求（13/13採番）

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
| HIL-TR-12 | UniversalWorkflowPackageRegistry; NodeControlPlane | HOT-HIL-48 | HIA-TR-012 | 追跡草案（trace-draft） |
| HIL-TR-13 | PlatformPermissionBrokerAdapter; NodeControlPlane | HOT-HIL-52 | HIA-TR-013 | 追跡草案（trace-draft） |

## §4 非機能要求（38/38採番）

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
| HIL-NFR-30 | DeterminismGate; UniversalWorkflowPackageRegistry | HOT-HIL-48 | HIA-NFR-030 | 追跡草案（trace-draft） |
| HIL-NFR-31 | WorkflowCompletenessGate | HOT-HIL-49 | HIA-NFR-031 | 追跡草案（trace-draft） |
| HIL-NFR-32 | WorkflowInterviewCoordinator; RequirementFreezeGate | HOT-HIL-49 | HIA-NFR-032 | 追跡草案（trace-draft） |
| HIL-NFR-33 | RuntimeOrchestrationPlanner | HOT-HIL-50 | HIA-NFR-033 | 追跡草案（trace-draft） |
| HIL-NFR-34 | RoleSeparationGate; NodeControlPlane | HOT-HIL-50 | HIA-NFR-034 | 追跡草案（trace-draft） |
| HIL-NFR-35 | ExecutionAuthorizationGate | HOT-HIL-51 | HIA-NFR-035 | 追跡草案（trace-draft） |
| HIL-NFR-36 | StandingAuthorizationRegistry | HOT-HIL-51 | HIA-NFR-036 | 追跡草案（trace-draft） |
| HIL-NFR-37 | ExecutionAuthorizationGate; PlatformPermissionBrokerAdapter | HOT-HIL-52 | HIA-NFR-037 | 追跡草案（trace-draft） |
| HIL-NFR-38 | ActionBindingGate; ExecutionAuthorizationGate | HOT-HIL-52 | HIA-NFR-038 | 追跡草案（trace-draft） |

## §5 集計

| 分類 | requirement行 | HOT/HAT edgeあり | assertionあり | semantic oracle完全到達 | verified実装 |
|---|---:|---:|---:|---:|---:|
| BR | 30 | 30 | 30 | 30 | 0 |
| FR | 81 | 81 | 81 | 81 | 0 |
| TR | 13 | 13 | 13 | 13 | 0 |
| NFR | 38 | 38 | 38 | 38 | 0 |
| **total** | **162** | **162** | **162** | **162** | **0** |

HOT-HIL-01..47は既存test設計から逆生成済みである。HOT-HIL-48..52は追加要件のtest-design候補であり、L5 test designへ正式登録されるまで`trace-draft`のままとする。component pointerは162/162へ到達したが、definition activeと実装証拠は0/162であり、semantic pointer閉鎖をfreezeまたは実装完了へ読み替えない。

## §5.1 HOT逆引き（52/52）

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
| HOT-HIL-48 | HIL-BR-26, HIL-BR-27, HIL-FR-51, HIL-FR-52, HIL-FR-53, HIL-TR-12, HIL-NFR-30 | 追加test-design候補 |
| HOT-HIL-49 | HIL-BR-28, HIL-FR-54, HIL-FR-55, HIL-NFR-31, HIL-NFR-32 | 追加test-design候補 |
| HOT-HIL-50 | HIL-BR-29, HIL-FR-56, HIL-NFR-33, HIL-NFR-34 | 追加test-design候補 |
| HOT-HIL-51 | HIL-BR-30, HIL-FR-57, HIL-FR-58, HIL-NFR-35, HIL-NFR-36 | 追加test-design候補 |
| HOT-HIL-52 | HIL-BR-30, HIL-FR-59, HIL-FR-60, HIL-TR-13, HIL-NFR-37, HIL-NFR-38 | 追加test-design候補 |

## §6 昇格条件

1. 本台帳、HOT定義、assertion ledgerの双方向edge差分が0である。
2. assertionのHST pointerが同一requirementを含むparent familyへ到達する。
3. 同一requirement、親HST、atomic case、failure codeが162/162一致する。
4. 全component候補がL4 catalogのstable component IDへ解決する。
5. source authority、上下pair、左右pair、実行証拠がcurrentになるまでverifiedへ昇格しない。
