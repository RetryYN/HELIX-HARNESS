---
title: "HELIX L6機能設計 — requirement translation obligation"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
design_slice: HDS-HIL-17
related_hst:
  - HST-HIL-027
  - HST-HIL-028
  - HST-HIL-029
requirements:
  - HR-FR-HIL-17
  - HAC-HIL-17a
  - HAC-HIL-17b
  - HAC-HIL-17c
pair_artifact: docs/test-design/helix/L6-requirement-translation-obligation-unit-test-design.md
next_pair_freeze: L7
---
# HELIX L6機能設計 — 要求翻訳・設計義務

## §0 API

`translateRequirementInput`、`validateRequirementAtom`、`routeTemplateGap`、`evaluateTemplateShadow`、`deriveDesignObligations`、`evaluateObligationClosure`、`appendRequirementRevision`、`validateRequirementFreeze`をpure判定とinjected portへ分離する。全APIはtyped Resultを返し、failure時のwrite/event/active/freezeは0。translatorはproposal authorityだけを持つ。
`commitRequirementTranslationBundle`、`reconcileRequirementTranslationBundle`はNode commit storeだけが実行し、template lifecycle、requirement、
obligation eventをSSoTとしてprojectionとactive pointerをreceipt replay可能にする。

atomはsource span、authority、modality、scope、oracle、service mappingを必須とする。revision changeはbefore/after semantic digest、全atom disposition、downstream stale、review authority receiptを必須とする。

## primary atomic assertion台帳

supporting caseを混入させず、上下pairと左右V-pairを含む正本primary caseをrangeなしで結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 | U結線 |
|---|---|---|---|---|---|
| `HST-CASE-027-01` | `graph_ready` | `pair_freeze_ready` | `なし（正常系）` | `IT-RTO-001` | `U-RTO-001` |
| `HST-CASE-027-02` | `graph_ready` | `failed` | `HIL_DESIGN_REQUIREMENT_ORPHAN` | `IT-RTO-002` | `U-RTO-002` |
| `HST-CASE-027-03` | `graph_ready` | `failed` | `HIL_DESIGN_CAPABILITY_SERVICE_MISSING` | `IT-RTO-003` | `U-RTO-003` |
| `HST-CASE-027-04` | `graph_ready` | `failed` | `HIL_DESIGN_SERVICE_ORPHAN` | `IT-RTO-004` | `U-RTO-004` |
| `HST-CASE-027-05` | `graph_ready` | `failed` | `HIL_DESIGN_SERVICE_DOMAIN_OBJECT_MISSING` | `IT-RTO-005` | `U-RTO-005` |
| `HST-CASE-027-06` | `graph_ready` | `failed` | `HIL_DESIGN_OBLIGATION_MISSING` | `IT-RTO-006` | `U-RTO-006` |
| `HST-CASE-027-07` | `graph_ready` | `failed` | `HIL_DESIGN_TEMPLATE_INSTANCE_MISSING` | `IT-RTO-007` | `U-RTO-007` |
| `HST-CASE-027-08` | `authored` | `rejected` | `HIL_DESIGN_TEMPLATE_SECTION_MISSING` | `IT-RTO-008` | `U-RTO-008` |
| `HST-CASE-027-09` | `authored` | `rejected` | `HIL_DESIGN_TEMPLATE_PLACEHOLDER_UNRESOLVED` | `IT-RTO-009` | `U-RTO-009` |
| `HST-CASE-027-10` | `authored` | `rejected` | `HIL_DESIGN_TEMPLATE_SECTION_HOLLOW` | `IT-RTO-010` | `U-RTO-010` |
| `HST-CASE-027-11` | `pending` | `pending` | `HIL_DESIGN_APPLICABILITY_MISSING` | `IT-RTO-011` | `U-RTO-011` |
| `HST-CASE-027-12` | `pending` | `pending` | `HIL_DESIGN_NOT_APPLICABLE_EVIDENCE_MISSING` | `IT-RTO-012` | `U-RTO-012` |
| `HST-CASE-027-13` | `required` | `rejected` | `HIL_DESIGN_FALSE_NOT_APPLICABLE` | `IT-RTO-013` | `U-RTO-013` |
| `HST-CASE-027-14` | `deferred` | `deferred` | `HIL_DESIGN_DEFERRED_NOT_CLOSED` | `IT-RTO-014` | `U-RTO-014` |
| `HST-CASE-027-15` | `graph_ready` | `failed` | `HIL_DESIGN_FACET_DATA_MISSING` | `IT-RTO-015` | `U-RTO-015` |
| `HST-CASE-027-16` | `graph_ready` | `failed` | `HIL_DESIGN_FACET_STATE_MISSING` | `IT-RTO-016` | `U-RTO-016` |
| `HST-CASE-027-17` | `graph_ready` | `failed` | `HIL_DESIGN_FACET_FAILURE_MISSING` | `IT-RTO-017` | `U-RTO-017` |
| `HST-CASE-027-18` | `graph_ready` | `failed` | `HIL_DESIGN_FACET_SECURITY_MISSING` | `IT-RTO-018` | `U-RTO-018` |
| `HST-CASE-027-19` | `graph_ready` | `failed` | `HIL_DESIGN_FACET_OBSERVABILITY_MISSING` | `IT-RTO-019` | `U-RTO-019` |
| `HST-CASE-027-20` | `graph_ready` | `failed` | `HIL_DESIGN_FACET_LIFECYCLE_MISSING` | `IT-RTO-020` | `U-RTO-020` |
| `HST-CASE-027-21` | `verified` | `stale` | `HIL_DESIGN_TEMPLATE_VERSION_DRIFT` | `IT-RTO-021` | `U-RTO-021` |
| `HST-CASE-027-22` | `stale` | `stale` | `HIL_DESIGN_TEMPLATE_MIGRATION_MISSING` | `IT-RTO-022` | `U-RTO-022` |
| `HST-CASE-027-23` | `graph_ready` | `failed` | `HIL_DESIGN_EDGE_REVERSE_MISSING` | `IT-RTO-023` | `U-RTO-023` |
| `HST-CASE-027-24` | `graph_ready` | `failed` | `HIL_DESIGN_EDGE_FORWARD_MISSING` | `IT-RTO-024` | `U-RTO-024` |
| `HST-CASE-027-25` | `graph_ready` | `failed` | `HIL_DESIGN_EDGE_DANGLING` | `IT-RTO-025` | `U-RTO-025` |
| `HST-CASE-027-26` | `graph_ready` | `failed` | `HIL_DESIGN_TEST_ORACLE_MISSING` | `IT-RTO-026` | `U-RTO-026` |
| `HST-CASE-027-27` | `graph_ready` | `failed` | `HIL_DESIGN_GATE_BINDING_MISSING` | `IT-RTO-027` | `U-RTO-027` |
| `HST-CASE-027-28` | `graph_ready` | `failed` | `HIL_DESIGN_AGGREGATE_ONLY` | `IT-RTO-028` | `U-RTO-028` |
| `HST-CASE-027-29` | `verified` | `stale` | `HIL_DESIGN_VERIFICATION_STALE` | `IT-RTO-029` | `U-RTO-029` |
| `HST-CASE-027-30` | `graph_current` | `quarantined` | `HIL_DESIGN_GRAPH_NONDETERMINISTIC` | `IT-RTO-030` | `U-RTO-030` |
| `HST-CASE-027-31` | `assertion_input_ready` | `assertion_pass` | `HIL_DESIGN_OBLIGATION_INCOMPLETE` | `IT-RTO-031` | `U-RTO-031` |
| `HST-CASE-027-32` | `assertion_input_ready` | `assertion_pass` | `HIL_DESIGN_OBLIGATION_INCOMPLETE` | `IT-RTO-032` | `U-RTO-032` |
| `HST-CASE-028-01` | `queued` | `committed` | `なし（正常系）` | `IT-RTO-033` | `U-RTO-033` |
| `HST-CASE-028-02` | `queued` | `rejected` | `HIL_REQUIREMENT_TRANSLATION_INPUT_UNCUSTODIED` | `IT-RTO-034` | `U-RTO-034` |
| `HST-CASE-028-03` | `proposal` | `rejected` | `HIL_REQUIREMENT_ATOM_AGGREGATE_ONLY` | `IT-RTO-035` | `U-RTO-035` |
| `HST-CASE-028-04` | `proposal` | `rejected` | `HIL_REQUIREMENT_ATOM_SOURCE_MISSING` | `IT-RTO-036` | `U-RTO-036` |
| `HST-CASE-028-05` | `ambiguous` | `ambiguous` | `HIL_REQUIREMENT_TRANSLATION_AMBIGUOUS` | `IT-RTO-037` | `U-RTO-037` |
| `HST-CASE-028-06` | `proposal` | `rejected` | `HIL_REQUIREMENT_TRANSLATION_AUTHORITY_MISSING` | `IT-RTO-038` | `U-RTO-038` |
| `HST-CASE-028-07` | `proposal` | `rejected` | `HIL_REQUIREMENT_TRANSLATION_MAPPING_MISSING` | `IT-RTO-039` | `U-RTO-039` |
| `HST-CASE-028-08` | `committed` | `quarantined` | `HIL_REQUIREMENT_TRANSLATION_NONDETERMINISTIC` | `IT-RTO-040` | `U-RTO-040` |
| `HST-CASE-028-09` | `gap_detected` | `issued` | `なし（正常系）` | `IT-RTO-041` | `U-RTO-041` |
| `HST-CASE-028-10` | `gap_detected` | `gap_detected` | `HIL_TEMPLATE_GAP_UNREPORTED` | `IT-RTO-042` | `U-RTO-042` |
| `HST-CASE-028-11` | `required` | `rejected` | `HIL_TEMPLATE_GAP_FALSE_NOT_APPLICABLE` | `IT-RTO-043` | `U-RTO-043` |
| `HST-CASE-028-12` | `draft` | `draft` | `HIL_TEMPLATE_CANDIDATE_IMMEDIATE_ENFORCEMENT` | `IT-RTO-044` | `U-RTO-044` |
| `HST-CASE-028-13` | `shadow` | `shadow` | `HIL_TEMPLATE_SHADOW_EVIDENCE_MISSING` | `IT-RTO-045` | `U-RTO-045` |
| `HST-CASE-028-14` | `shadow` | `rolled_back` | `HIL_TEMPLATE_SHADOW_REGRESSION` | `IT-RTO-046` | `U-RTO-046` |
| `HST-CASE-028-15` | `audit_pending` | `audit_pending` | `HIL_TEMPLATE_AUDITOR_NOT_INDEPENDENT` | `IT-RTO-047` | `U-RTO-047` |
| `HST-CASE-028-16` | `approved` | `approved` | `HIL_TEMPLATE_SELF_PROMOTION` | `IT-RTO-048` | `U-RTO-048` |
| `HST-CASE-028-17` | `shadow` | `shadow` | `HIL_TEMPLATE_PROMOTION_PREMATURE` | `IT-RTO-049` | `U-RTO-049` |
| `HST-CASE-028-18` | `active` | `active` | `HIL_TEMPLATE_ACTIVE_VERSION_MUTATED` | `IT-RTO-050` | `U-RTO-050` |
| `HST-CASE-028-19` | `approved` | `active` | `なし（正常系）` | `IT-RTO-051` | `U-RTO-051` |
| `HST-CASE-028-20` | `assertion_input_ready` | `assertion_pass` | `HIL_REQUIREMENT_TRANSLATION_UNSAFE` | `IT-RTO-052` | `U-RTO-052` |
| `HST-CASE-029-01` | `ledger_ready` | `verified` | `なし（正常系）` | `IT-RTO-053` | `U-RTO-053` |
| `HST-CASE-029-02` | `staged` | `rejected` | `HIL_REQUIREMENT_LEDGER_SOURCE_MISSING` | `IT-RTO-054` | `U-RTO-054` |
| `HST-CASE-029-03` | `ledger_ready` | `failed` | `HIL_REQUIREMENT_LEDGER_AUTHORITY_MISSING` | `IT-RTO-055` | `U-RTO-055` |
| `HST-CASE-029-04` | `staged` | `rejected` | `HIL_REQUIREMENT_LEDGER_MODALITY_MISSING` | `IT-RTO-056` | `U-RTO-056` |
| `HST-CASE-029-05` | `staged` | `rejected` | `HIL_REQUIREMENT_LEDGER_PRIORITY_MISSING` | `IT-RTO-057` | `U-RTO-057` |
| `HST-CASE-029-06` | `ledger_ready` | `failed` | `HIL_REQUIREMENT_LEDGER_SCOPE_MISSING` | `IT-RTO-058` | `U-RTO-058` |
| `HST-CASE-029-07` | `ledger_ready` | `failed` | `HIL_REQUIREMENT_LEDGER_ORACLE_MISSING` | `IT-RTO-059` | `U-RTO-059` |
| `HST-CASE-029-08` | `ledger_ready` | `failed` | `HIL_REQUIREMENT_LEDGER_SERVICE_MISSING` | `IT-RTO-060` | `U-RTO-060` |
| `HST-CASE-029-09` | `ledger_ready` | `failed` | `HIL_REQUIREMENT_LEDGER_TEMPLATE_MISSING` | `IT-RTO-061` | `U-RTO-061` |
| `HST-CASE-029-10` | `ledger_ready` | `failed` | `HIL_REQUIREMENT_LEDGER_OBLIGATION_MISSING` | `IT-RTO-062` | `U-RTO-062` |
| `HST-CASE-029-11` | `current` | `current` | `HIL_REQUIREMENT_SPLIT_RECEIPT_MISSING` | `IT-RTO-063` | `U-RTO-063` |
| `HST-CASE-029-12` | `current` | `current` | `HIL_REQUIREMENT_MERGE_RECEIPT_MISSING` | `IT-RTO-064` | `U-RTO-064` |
| `HST-CASE-029-13` | `current` | `current` | `HIL_REQUIREMENT_RENAME_RECEIPT_MISSING` | `IT-RTO-065` | `U-RTO-065` |
| `HST-CASE-029-14` | `current` | `current` | `HIL_REQUIREMENT_SUPERSEDE_RECEIPT_MISSING` | `IT-RTO-066` | `U-RTO-066` |
| `HST-CASE-029-15` | `current` | `current` | `HIL_REQUIREMENT_NA_RECEIPT_MISSING` | `IT-RTO-067` | `U-RTO-067` |
| `HST-CASE-029-16` | `current` | `current` | `HIL_REQUIREMENT_REVISION_SEQUENCE_INVALID` | `IT-RTO-068` | `U-RTO-068` |
| `HST-CASE-029-17` | `current` | `rejected` | `HIL_REQUIREMENT_RENAME_SEMANTIC_CHANGE` | `IT-RTO-069` | `U-RTO-069` |
| `HST-CASE-029-18` | `ledger_ready` | `failed` | `HIL_REQUIREMENT_FALSE_NOT_APPLICABLE` | `IT-RTO-070` | `U-RTO-070` |
| `HST-CASE-029-19` | `current` | `stale` | `HIL_REQUIREMENT_DOWNSTREAM_STALE` | `IT-RTO-071` | `U-RTO-071` |
| `HST-CASE-029-20` | `current` | `current` | `HIL_REQUIREMENT_SPLIT_CHILD_MISSING` | `IT-RTO-072` | `U-RTO-072` |
| `HST-CASE-029-21` | `assertion_input_ready` | `assertion_pass` | `HIL_REQUIREMENT_DEFINITION_INCOMPLETE` | `IT-RTO-073` | `U-RTO-073` |
| `HST-CASE-029-22` | `assertion_input_ready` | `assertion_pass` | `HIL_REQUIREMENT_CHANGE_RECEIPT_MISSING` | `IT-RTO-074` | `U-RTO-074` |
| `HST-CASE-029-23` | `assertion_input_ready` | `assertion_pass` | `HIL_REQUIREMENT_LEDGER_SEMANTIC_GAP` | `IT-RTO-075` | `U-RTO-075` |

75/75のstate、failure、typed edge、authoritative countを検証する。

## §1 完全signatureとDbC

```ts
type RequirementTranslationFailureCodeV1 =
  | "HIL_DESIGN_AGGREGATE_ONLY"
  | "HIL_DESIGN_APPLICABILITY_MISSING"
  | "HIL_DESIGN_CAPABILITY_SERVICE_MISSING"
  | "HIL_DESIGN_DEFERRED_NOT_CLOSED"
  | "HIL_DESIGN_EDGE_DANGLING"
  | "HIL_DESIGN_EDGE_FORWARD_MISSING"
  | "HIL_DESIGN_EDGE_REVERSE_MISSING"
  | "HIL_DESIGN_FACET_DATA_MISSING"
  | "HIL_DESIGN_FACET_FAILURE_MISSING"
  | "HIL_DESIGN_FACET_LIFECYCLE_MISSING"
  | "HIL_DESIGN_FACET_OBSERVABILITY_MISSING"
  | "HIL_DESIGN_FACET_SECURITY_MISSING"
  | "HIL_DESIGN_FACET_STATE_MISSING"
  | "HIL_DESIGN_FALSE_NOT_APPLICABLE"
  | "HIL_DESIGN_GATE_BINDING_MISSING"
  | "HIL_DESIGN_GRAPH_NONDETERMINISTIC"
  | "HIL_DESIGN_NOT_APPLICABLE_EVIDENCE_MISSING"
  | "HIL_DESIGN_OBLIGATION_INCOMPLETE"
  | "HIL_DESIGN_OBLIGATION_MISSING"
  | "HIL_DESIGN_REQUIREMENT_ORPHAN"
  | "HIL_DESIGN_SERVICE_DOMAIN_OBJECT_MISSING"
  | "HIL_DESIGN_SERVICE_ORPHAN"
  | "HIL_DESIGN_TEMPLATE_INSTANCE_MISSING"
  | "HIL_DESIGN_TEMPLATE_MIGRATION_MISSING"
  | "HIL_DESIGN_TEMPLATE_PLACEHOLDER_UNRESOLVED"
  | "HIL_DESIGN_TEMPLATE_SECTION_HOLLOW"
  | "HIL_DESIGN_TEMPLATE_SECTION_MISSING"
  | "HIL_DESIGN_TEMPLATE_VERSION_DRIFT"
  | "HIL_DESIGN_TEST_ORACLE_MISSING"
  | "HIL_DESIGN_VERIFICATION_STALE"
  | "HIL_REQUIREMENT_ATOM_AGGREGATE_ONLY"
  | "HIL_REQUIREMENT_ATOM_SOURCE_MISSING"
  | "HIL_REQUIREMENT_CHANGE_RECEIPT_MISSING"
  | "HIL_REQUIREMENT_DEFINITION_INCOMPLETE"
  | "HIL_REQUIREMENT_DOWNSTREAM_STALE"
  | "HIL_REQUIREMENT_FALSE_NOT_APPLICABLE"
  | "HIL_REQUIREMENT_LEDGER_AUTHORITY_MISSING"
  | "HIL_REQUIREMENT_LEDGER_MODALITY_MISSING"
  | "HIL_REQUIREMENT_LEDGER_OBLIGATION_MISSING"
  | "HIL_REQUIREMENT_LEDGER_ORACLE_MISSING"
  | "HIL_REQUIREMENT_LEDGER_PRIORITY_MISSING"
  | "HIL_REQUIREMENT_LEDGER_SCOPE_MISSING"
  | "HIL_REQUIREMENT_LEDGER_SEMANTIC_GAP"
  | "HIL_REQUIREMENT_LEDGER_SERVICE_MISSING"
  | "HIL_REQUIREMENT_LEDGER_SOURCE_MISSING"
  | "HIL_REQUIREMENT_LEDGER_TEMPLATE_MISSING"
  | "HIL_REQUIREMENT_MERGE_RECEIPT_MISSING"
  | "HIL_REQUIREMENT_NA_RECEIPT_MISSING"
  | "HIL_REQUIREMENT_RENAME_RECEIPT_MISSING"
  | "HIL_REQUIREMENT_RENAME_SEMANTIC_CHANGE"
  | "HIL_REQUIREMENT_REVISION_SEQUENCE_INVALID"
  | "HIL_REQUIREMENT_SPLIT_CHILD_MISSING"
  | "HIL_REQUIREMENT_SPLIT_RECEIPT_MISSING"
  | "HIL_REQUIREMENT_SUPERSEDE_RECEIPT_MISSING"
  | "HIL_REQUIREMENT_TRANSLATION_AMBIGUOUS"
  | "HIL_REQUIREMENT_TRANSLATION_AUTHORITY_MISSING"
  | "HIL_REQUIREMENT_TRANSLATION_INPUT_UNCUSTODIED"
  | "HIL_REQUIREMENT_TRANSLATION_MAPPING_MISSING"
  | "HIL_REQUIREMENT_TRANSLATION_NONDETERMINISTIC"
  | "HIL_REQUIREMENT_TRANSLATION_UNSAFE"
  | "HIL_TEMPLATE_ACTIVE_VERSION_MUTATED"
  | "HIL_TEMPLATE_AUDITOR_NOT_INDEPENDENT"
  | "HIL_TEMPLATE_CANDIDATE_IMMEDIATE_ENFORCEMENT"
  | "HIL_TEMPLATE_GAP_FALSE_NOT_APPLICABLE"
  | "HIL_TEMPLATE_GAP_UNREPORTED"
  | "HIL_TEMPLATE_PROMOTION_PREMATURE"
  | "HIL_TEMPLATE_SELF_PROMOTION"
  | "HIL_TEMPLATE_SHADOW_EVIDENCE_MISSING"
  | "HIL_TEMPLATE_SHADOW_REGRESSION"
  | "HIL_REQUIREMENT_TRANSACTION_CAS_CONFLICT"
  | "HIL_REQUIREMENT_TRANSACTION_STORE_FAILURE"
  | "HIL_REQUIREMENT_MANIFEST_INVALID";
interface RequirementTranslationFailureV1 { code: RequirementTranslationFailureCodeV1; evidence_digest: string; retryable: boolean }
type RequirementTranslationResultV1<T> = { ok: true; value: T } | { ok: false; error: RequirementTranslationFailureV1 };
declare function translateRequirementInput(input: CustodiedRequirementInputV1, template: TemplateSnapshotV1, policy: TranslationPolicyV1): RequirementTranslationResultV1<TranslationProposalV1>;
declare function validateRequirementAtom(proposal: TranslationProposalV1, authority: ValidatedAuthoritySetV1, current: RequirementProjectionV1): RequirementTranslationResultV1<ValidatedAtomV1>;
declare function validateRequirementAtoms(proposal: TranslationProposalV1, authority: ValidatedAuthoritySetV1, current: RequirementProjectionV1): RequirementTranslationResultV1<ValidatedRequirementAtomSetV1>;
declare function validateCurrentRequirementAuthorities(receiptIds: readonly string[], trustedNow: TrustedNowV1, transaction: RequirementTranslationAtomicTransactionPortV1): Promise<RequirementTranslationResultV1<ValidatedAuthoritySetV1>>;
declare function buildRequirementTranslationCommitBundle(proposal: TranslationProposalV1, atoms: ValidatedRequirementAtomSetV1, authority: ValidatedAuthoritySetV1, current: RequirementProjectionV1, snapshot: SnapshotDigestV1, operation: OperationIdV1): RequirementTranslationResultV1<RequirementTranslationCommitBundleV1>;
declare function executeRequirementTranslationNormalPipeline(input: RequirementTranslationNormalPipelineInputV1, transaction: RequirementTranslationAtomicTransactionPortV1): Promise<RequirementTranslationResultV1<RequirementTranslationCommitReceiptV1>>;
declare function routeTemplateGap(atom: ValidatedAtomV1, template: TemplateSnapshotV1, proof: TemplateGapProofV1, missing: MissingSchemaAtomV1[], applicability: ApplicabilityDecisionV1, causality: TemplateGapCausalityV1, operation: OperationIdV1): RequirementTranslationResultV1<TemplateGapCommitPlanV1>;
declare function evaluateTemplateShadow(candidate: TemplateCandidateV1, samples: ShadowSampleV1[], audit: IndependentAuditReceiptV1, current: TemplatePointerV1): RequirementTranslationResultV1<TemplatePromotionDecisionV1>;
declare function deriveDesignObligations(requirement: RequirementRevisionV1, service: ServiceGraphV1, templates: TemplateSnapshotV1): RequirementTranslationResultV1<DesignObligationSetV1>;
declare function evaluateObligationClosure(set: DesignObligationSetV1, evidence: DischargeEvidenceV1[], pair: PairSnapshotV1): RequirementTranslationResultV1<ObligationClosureReceiptV1>;
declare function appendRequirementRevision(current: RequirementRevisionV1, change: RequirementChangeReceiptV1, operation: OperationIdV1): RequirementTranslationResultV1<RequirementRevisionCommitPlanV1>;
declare function validateRequirementFreeze(revision: RequirementRevisionV1, closure: RequirementClosureBundleV1, current: SnapshotDigestV1): RequirementTranslationResultV1<RequirementFreezeReceiptV1>;
declare function commitRequirementTranslationBundle(bundle: RequirementTranslationCommitBundleV1, trustedNow: TrustedNowV1, transaction: RequirementTranslationAtomicTransactionPortV1): Promise<RequirementTranslationResultV1<RequirementTranslationCommitReceiptV1>>;
declare function reconcileRequirementTranslationBundle(bundle: RequirementTranslationCommitBundleV1, trustedNow: TrustedNowV1, transaction: RequirementTranslationAtomicTransactionPortV1): Promise<RequirementTranslationResultV1<RequirementTranslationCommitReceiptV1>>;
```

全入力digest/current revision/authority/expiryを照合する。atomは1 outcome/constraint、gap planはIssue/Reverse/queue各一件、promotionはauthor≠auditor≠promoter、obligationはfacet/pair/oracle/gate完全、changeは全source disposition必須。Err時write 0、commit port CAS loser 0、同operation再送0。

```ts
interface AuthorityReceiptV1 { receipt_id: string; receipt_digest: string; role: "custodian" | "author" | "reviewer" | "auditor" | "promoter" | "freezer"; actor_identity_digest: string; runtime_model_digest: string; scope_digest: string; issued_at: string; expires_at: string; freshness_evidence_digest: string; active_pointer_id: string; active_pointer_revision: number; supersedes_receipt_id: string | null; supersession_chain_digest: string; status: "current" | "stale" | "superseded"; event_head: string; authority_digest: string }
interface TrustedNowV1 { instant: string; clock_source_id: string; clock_receipt_digest: string; max_clock_skew_ms: number; trusted_now_digest: string }
interface CurrentAuthoritySnapshotV1 { snapshot_id: string; snapshot_revision: number; authority_receipts: readonly AuthorityReceiptV1[]; active_pointer_revision: number; authority_event_head: string; authority_set_digest: string; snapshot_digest: string }
interface ValidatedAuthoritySetV1 { receipt_ids: readonly string[]; roles: readonly AuthorityReceiptV1["role"][]; scope_digest: string; active_pointer_revision: number; authority_event_head: string; authority_set_digest: string; current_snapshot_digest: string; trusted_now_digest: string; validation_digest: string }
type OperationIdV1 = string & { readonly __brand: "OperationIdV1" };
interface SnapshotDigestV1 { snapshot_digest: string; source_commit: string; source_tree_digest: string; template_head: string; requirement_head: string; obligation_head: string; projection_head: string; active_pointer_revision: number; measured_at: string }
interface CustodiedRequirementInputV1 { input_id: string; source_kind: "chat" | "github" | "product_data" | "source"; source_span: string; source_digest: string; statement: string; custody: AuthorityReceiptV1; received_at: string; operation_id: OperationIdV1 }
interface TemplateSnapshotV1 { template_id: string; revision: number; schema_digest: string; content_digest: string; required_field_paths: readonly string[]; active_pointer_revision: number; status: "current" | "shadow" | "stale"; source_commit: string; event_head: string }
interface TranslationPolicyV1 { policy_id: string; version: string; modality_allowlist: readonly string[]; atomization_rule_digest: string; mapping_rule_digest: string; ambiguity_threshold: number; policy_digest: string }
interface TranslationProposalV1 { proposal_id: string; input_id: string; source_digest: string; proposed_atoms: readonly RequirementAtomDraftV1[]; ambiguity_digest: string | null; translator_identity_digest: string; proposal_digest: string }
interface RequirementAtomDraftV1 { atom_id: string; statement: string; modality: string; priority: string; scope_digest: string; oracle_digest: string; service_mapping_digest: string; source_span_digest: string }
interface ValidatedAtomV1 extends RequirementAtomDraftV1 { requirement_id: string; revision: number; authority_receipt_id: string; template_id: string; template_revision: number; atom_digest: string; status: "validated" }
interface ValidatedRequirementAtomSetV1 { proposal_id: string; atoms: readonly ValidatedAtomV1[]; atom_ids: readonly string[]; atom_set_digest: string; authority_validation_digest: string; status: "validated" }
interface ApplicabilityDecisionV1 { decision: "required" | "not_applicable" | "deferred"; reason_digest: string; evidence_receipt_ids: readonly string[]; decided_by: AuthorityReceiptV1; decided_at: string; decision_digest: string }
interface TemplateCandidateV1 { candidate_id: string; base_template_id: string; base_revision: number; proposed_revision: number; schema_digest: string; migration_digest: string; rollback_digest: string; author: AuthorityReceiptV1; status: "draft" | "shadow" | "audit_pending" | "approved" }
interface ShadowSampleV1 { sample_id: string; candidate_id: string; input_digest: string; baseline_output_digest: string; candidate_output_digest: string; regression_count: number; measured_at: string; sample_digest: string }
interface IndependentAuditReceiptV1 { receipt_id: string; receipt_digest: string; candidate_id: string; auditor: AuthorityReceiptV1; author_identity_digest: string; promoter_identity_digest: string; runtime_model_separated: true; policy_version: string; open_finding_count: 0; finding_closure_digest: string; snapshot_digest: string; status: "current" }
interface TemplatePointerV1 { pointer_id: string; template_id: string; revision: number; template_digest: string; status: "current"; authority_receipt_id: string; event_head: string }
interface TemplatePromotionDecisionV1 { decision: "promote" | "hold" | "rollback"; candidate_id: string; from_pointer_revision: number; to_pointer_revision: number; audit_receipt_id: string; promoter: AuthorityReceiptV1; migration_digest: string; rollback_digest: string; decision_digest: string }
interface RequirementRevisionV1 { requirement_id: string; revision: number; parent_requirement_ids: readonly string[]; atom_ids: readonly string[]; atom_set_digest: string; source_disposition_digest: string; semantic_digest: string; authority_receipt_id: string; status: "staged" | "current" | "stale" | "superseded"; event_head: string }
interface ServiceGraphV1 { graph_id: string; revision: number; requirement_capability_edges: readonly TypedDesignEdgeV1[]; capability_service_edges: readonly TypedDesignEdgeV1[]; service_domain_object_edges: readonly TypedDesignEdgeV1[]; graph_digest: string; status: "current" }
interface TypedDesignEdgeV1 { edge_id: string; from_id: string; to_id: string; type: string; revision: number; forward_digest: string; reverse_digest: string; status: "current" | "stale" }
interface DesignObligationSetV1 { set_id: string; requirement_id: string; requirement_revision: number; obligation_ids: readonly string[]; facet_set: readonly ["data", "state", "failure", "security", "observability", "lifecycle"]; template_snapshot_digest: string; service_graph_digest: string; oracle_set_digest: string; gate_binding_digest: string; set_digest: string }
interface DischargeEvidenceV1 { evidence_id: string; obligation_id: string; facet: "data" | "state" | "failure" | "security" | "observability" | "lifecycle"; artifact_path: string; artifact_digest: string; oracle_id: string; command: string; exit_code: number; output_digest: string; source_commit: string; design_digest: string; status: "current" | "stale" }
interface PairSnapshotV1 { pair_id: string; upper_revision: number; lower_revision: number; forward_digest: string; reverse_digest: string; oracle_digest: string; execution_receipt_digest: string; snapshot_digest: string; status: "current" | "stale" }
interface ObligationClosureReceiptV1 { receipt_id: string; receipt_digest: string; obligation_set_id: string; discharged_obligation_ids: readonly string[]; discharge_set_digest: string; pair_snapshot_digest: string; open_obligation_count: 0; authority: AuthorityReceiptV1; status: "current" }
interface RequirementChangeReceiptV1 { receipt_id: string; change_kind: "split" | "merge" | "rename" | "supersede" | "not_applicable"; before_revision_ids: readonly string[]; after_revision_ids: readonly string[]; source_dispositions: readonly SourceDispositionV1[]; downstream_stale_subject_ids: readonly string[]; authority: AuthorityReceiptV1; semantic_before_digest: string; semantic_after_digest: string; receipt_digest: string }
interface SourceDispositionV1 { source_atom_id: string; disposition: "preserved" | "split" | "merged" | "renamed" | "superseded" | "not_applicable"; target_requirement_ids: readonly string[]; evidence_digest: string }
interface RequirementRevisionCommitPlanV1 { operation_id: OperationIdV1; operation_digest: string; expected_requirement_head: string; expected_projection_head: string; expected_active_pointer_revision: number; revision: RequirementRevisionV1; change_receipt: RequirementChangeReceiptV1; downstream_stale_events: readonly RequirementTranslationEventV1[]; append_order: readonly ["event", "projection", "receipt"]; write_set_digest: string }
interface RequirementClosureBundleV1 { obligation_receipt: ObligationClosureReceiptV1; semantic_review: IndependentAuditReceiptV1; pair_snapshot: PairSnapshotV1; requirement_projection_digest: string; bundle_digest: string }
interface RequirementFreezeReceiptV1 { receipt_id: string; receipt_digest: string; requirement_id: string; revision: number; closure_bundle_digest: string; snapshot_digest: string; freezer: AuthorityReceiptV1; status: "current" }
interface RequirementProjectionV1 { projection_head: string; requirement_id: string; current_revision: number; current_revision_digest: string; template_pointer_revision: number; obligation_set_digest: string; closure_receipt_id: string | null; freeze_receipt_id: string | null; source_event_heads: Record<"template" | "requirement" | "obligation", string>; projection_digest: string }
interface RequirementTranslationEventV1 { event_id: string; stream: "template" | "requirement" | "obligation"; subject_id: string; sequence: number; previous_digest: string; payload_digest: string; event_digest: string }
interface TemplateGapProofV1 { obligation_id: string; template_schema_digest: string; template_revision: number; missing_atom_set_digest: string; evidence_digest: string }
interface MissingSchemaAtomV1 { atom_id: string; field_path: string; required_type_digest: string; applicability_digest: string }
interface TemplateGapIssueEntryV1 { issue_id: string; stream_head: string; obligation_id: string; payload_digest: string }
interface TemplateGapReverseEntryV1 { reverse_id: string; stream_head: string; issue_id: string; rollback_digest: string }
interface TemplateGapQueueEntryV1 { queue_entry_id: string; stream_head: string; issue_id: string; reverse_id: string; priority: string }
interface TemplateGapCausalityV1 { issue: TemplateGapIssueEntryV1; reverse: TemplateGapReverseEntryV1; queue: TemplateGapQueueEntryV1; causality_digest: string }
interface TemplateGapCommitPlanV1 { operation_id: OperationIdV1; operation_digest: string; proof: TemplateGapProofV1; missing_atoms: MissingSchemaAtomV1[]; applicability: ApplicabilityDecisionV1; issue: TemplateGapIssueEntryV1; reverse: TemplateGapReverseEntryV1; queue: TemplateGapQueueEntryV1; causality_digest: string; expected_heads: { issue: string; reverse: string; queue: string }; append_order: readonly ["issue", "reverse", "queue", "receipt"]; write_set_digest: string }
type RequirementWriteTargetV1 = "event" | "projection" | "receipt";
interface RequirementWriteSetSchemaV1 { schema_version: "helix-requirement-write-set.v1"; targets: RequirementWriteTargetV1[] }
declare function parseRequirementWriteSet(raw: string): RequirementTranslationResultV1<RequirementWriteSetSchemaV1>;
interface RequirementTranslationCommitBundleV1 { schema_version: "helix-requirement-translation-commit-bundle.v1"; operation_id: OperationIdV1; operation_digest: string; proposal_digest: string; validated_atom_set: ValidatedRequirementAtomSetV1; authority_validation_digest: string; trusted_now_digest: string; expected_snapshot: SnapshotDigestV1; expected_event_heads: Record<"template" | "requirement" | "obligation", string>; expected_projection_head: string; expected_active_pointer_revision: number; expected_authority_receipt_ids: readonly string[]; expected_authority_set_digest: string; expected_authority_snapshot_digest: string; template_events: RequirementTranslationEventV1[]; requirement_events: RequirementTranslationEventV1[]; obligation_events: RequirementTranslationEventV1[]; template_gap: TemplateGapCommitPlanV1 | null; expected_write_set: RequirementWriteTargetV1[]; append_order: readonly ["events", "projection", "active_pointer", "terminal_receipt"]; write_set_digest: string; bundle_digest: string }
interface RequirementTranslationCommitReceiptV1 { operation_id: OperationIdV1; operation_digest: string; committed_snapshot_digest: string; committed_authority_set_digest: string; before_heads: Record<string, string>; after_heads: Record<string, string>; before_projection_head: string; after_projection_head: string; event_counts: Record<string, number>; projection_digest: string; active_pointer_revision: number; terminal_receipt_digest: string; status: "committed" | "reconcile_pending"; write_set_digest: string; replay_digest: string }
interface RequirementTranslationAtomicTransactionPortV1 { readCurrentAuthoritySnapshot(receiptIds: readonly string[], trustedNow: TrustedNowV1): Promise<CurrentAuthoritySnapshotV1>; readCurrentSnapshot(trustedNow: TrustedNowV1): Promise<SnapshotDigestV1>; readValidateAndCommit(bundle: RequirementTranslationCommitBundleV1, trustedNow: TrustedNowV1): Promise<RequirementTranslationResultV1<RequirementTranslationCommitReceiptV1>>; readValidateAndReconcile(bundle: RequirementTranslationCommitBundleV1, pending: RequirementTranslationCommitReceiptV1, trustedNow: TrustedNowV1): Promise<RequirementTranslationResultV1<RequirementTranslationCommitReceiptV1>>; findReceipt(operationId: OperationIdV1): Promise<RequirementTranslationCommitReceiptV1 | null>; replay(eventHeads: Record<string, string>): Promise<{ projection_head: string; projection_digest: string; active_pointer_revision: number }> }
interface RequirementTranslationNormalPipelineInputV1 { input: CustodiedRequirementInputV1; template: TemplateSnapshotV1; policy: TranslationPolicyV1; authority_receipt_ids: readonly string[]; trusted_now: TrustedNowV1; current_projection: RequirementProjectionV1; expected_snapshot: SnapshotDigestV1; operation_id: OperationIdV1 }
type RequirementExecutionApiV1 = "translateRequirementInput" | "validateRequirementAtom" | "validateRequirementAtoms" | "validateCurrentRequirementAuthorities" | "buildRequirementTranslationCommitBundle" | "executeRequirementTranslationNormalPipeline" | "routeTemplateGap" | "evaluateTemplateShadow" | "deriveDesignObligations" | "evaluateObligationClosure" | "appendRequirementRevision" | "validateRequirementFreeze" | "commitRequirementTranslationBundle" | "reconcileRequirementTranslationBundle" | "parseRequirementWriteSet";
type RequirementExecutionPipelineV1 = "commitRequirementTranslationBundle+reconcileRequirementTranslationBundle";
interface RequirementTranslationNormalPipelineV1 { pipeline_id: "executeRequirementTranslationNormalPipeline"; stages: readonly ["validateCurrentRequirementAuthorities", "translateRequirementInput", "validateRequirementAtoms", "buildRequirementTranslationCommitBundle", "commitRequirementTranslationBundle", "reconcileRequirementTranslationBundle"]; proposal: TranslationProposalV1; validated_atoms: ValidatedRequirementAtomSetV1; authority: ValidatedAuthoritySetV1; bundle: RequirementTranslationCommitBundleV1; receipt: RequirementTranslationCommitReceiptV1 }
interface RequirementTranslationExecutableCaseV1 { case_id: `HST-CASE-${string}`; fixture_id: string; fixture_revision: number; execution_api: RequirementExecutionApiV1 | RequirementExecutionPipelineV1; fault_position: string | null; expected_write_set: RequirementWriteTargetV1[]; expected_receipt_digest: string; fixture_manifest_path: "docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest" }
```

`deriveDesignObligations`は`requirement → capability → service → domain object`の各edgeをcurrent revision付きで要求する。
全public signatureはV1型だけを受け渡す。callerが渡す`AuthorityReceiptV1.status`はcurrentnessの証拠として信頼しない。
`validateCurrentRequirementAuthorities`は`TrustedNowV1`と`RequirementTranslationAtomicTransactionPortV1`から
`CurrentAuthoritySnapshotV1`を独立取得し、issued/expiry、scope、active pointer revision、supersession chain終端、event headを検証して
`ValidatedAuthoritySetV1`を返す。pure API、bundle build、commit/reconcileはこのvalidation digestだけを受理し、caller receipt集合の
自己申告statusや時刻文字列からcurrentnessを導出しない。commit/reconcileは単一atomic transaction port内部でauthorityとcommit snapshotを
commit直前に同一transaction snapshotから再読し、bundleのsnapshot、event heads、projection head、pointer revision、authority set/snapshot digestを単一CASで
照合する。events→projection→active pointer→terminal receiptを一transactionとし、fault後は同じ
operation ID/digest/expected snapshotだけをreconcileする。CAS loser、stale/expired/superseded authority、異digest retry、partial appendは
authoritative count 0とする。

正常翻訳の型付き経路は
`TranslationProposalV1 → ValidatedRequirementAtomSetV1 → RequirementTranslationCommitBundleV1 → RequirementTranslationCommitReceiptV1`
である。public callable `executeRequirementTranslationNormalPipeline`が`RequirementTranslationNormalPipelineV1`を所有する。
同型の`stages`は
`validateCurrentRequirementAuthorities → translateRequirementInput → validateRequirementAtoms → buildRequirementTranslationCommitBundle → commitRequirementTranslationBundle → reconcileRequirementTranslationBundle`
のexact 6段を固定する。reconcileはcommitが`reconcile_pending`を返した場合だけ同一bundleへ適用し、通常commit成功時の必須二重writeではない。

public API exact-name集合は`RequirementExecutionApiV1`、commit＋reconcileの明示pipelineは`RequirementExecutionPipelineV1`が正本である。
U/IT台帳と75-row executable manifestの`execution_api`はこのunionへ75/75 exact joinし、旧型名、未知名、空欄、暗黙aliasを拒否する。
executable case manifestはprimary表の75 IDとexact joinし、空field、重複ID、range指定、存在しないfixture manifest artifact pathを拒否する。実装test pathはL7実装時に別receiptでbindする。
parserは`none`を空集合、`event+projection+receipt`をstable exact setへ変換し、unknown/duplicate/順序違反をmanifest failureにする。
正常caseのmanifest `execution_api`はpublic callable `executeRequirementTranslationNormalPipeline`へ同期し、case record SHA-256を再計算する。
expected receipt payloadは不変なのでexpected receipt digestは変更しない。

## §2 public API primary owner正本

次表の15 APIは各1組のprimary U/ITだけをownerとする。75 primary caseの残余行はowner APIへ投入する
composition/mutationであり、第2 ownerとして数えない。

| public API | primary U | primary IT |
|---|---|---|
| `translateRequirementInput` | `U-RTO-034` | `IT-RTO-034` |
| `validateRequirementAtom` | `U-RTO-035` | `IT-RTO-035` |
| `validateRequirementAtoms` | `U-RTO-033` | `IT-RTO-033` |
| `validateCurrentRequirementAuthorities` | `U-RTO-038` | `IT-RTO-038` |
| `buildRequirementTranslationCommitBundle` | `U-RTO-033` | `IT-RTO-033` |
| `executeRequirementTranslationNormalPipeline` | `U-RTO-033` | `IT-RTO-033` |
| `routeTemplateGap` | `U-RTO-041` | `IT-RTO-041` |
| `evaluateTemplateShadow` | `U-RTO-045` | `IT-RTO-045` |
| `deriveDesignObligations` | `U-RTO-001` | `IT-RTO-001` |
| `evaluateObligationClosure` | `U-RTO-006` | `IT-RTO-006` |
| `appendRequirementRevision` | `U-RTO-053` | `IT-RTO-053` |
| `validateRequirementFreeze` | `U-RTO-031` | `IT-RTO-031` |
| `commitRequirementTranslationBundle` | `U-RTO-033` | `IT-RTO-033` |
| `reconcileRequirementTranslationBundle` | `U-RTO-033` | `IT-RTO-033` |
| `parseRequirementWriteSet` | `U-RTO-075` | `IT-RTO-075` |
