---
title: "HELIX L7単体テスト設計 — requirement translation obligation"
layer: L6
executed_at_layer: L7
artifact_type: test_design
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
pair_artifact: docs/design/helix/L6-function-design/requirement-translation-obligation.md
next_pair_freeze: L6
---
# HELIX L7単体テスト設計 — 要求翻訳・設計義務

pure functionへ固定port resultを注入し、各Uでcase/pre/expected/failureを独立検証する。曖昧、矛盾、欠落、過剰拡張、偽N/A、片方向pair、stale receiptではauthoritative増分0とする。未実装である。

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

## §1 単体oracle検証表

各Uはcurrent revision、authority、clock、operationを固定し、case対応APIのOk/Err、pre→expected、failure、stable digest/orderをassertする。mutationはsource span、custody、modality、priority、scope、oracle、service、template、obligation、pair edge、review actor、expiryを一fieldずつ行う。pure関数ではport call 0、commit planでは期待insert/update/event countをexact assertし、CAS loser・stale・異digest retryは全count 0とする。

各U rowには同じcase IDの`RequirementTranslationExecutableCaseV1`をexact一件bindする。unit runnerはfixture revision、対象API、
fault位置、expected write set、canonical expected receipt SHA-256、case record SHA-256、fixture manifest artifact pathをrow単位で検証してから実行し、75件のいずれかが共通既定値だけ、空欄、
range aliasならsuiteをfail-closeする。`routeTemplateGap`はtemplate schema/revision、gap proof、missing schema atom、applicability、
Issue/Reverse/queue causalityを一fieldずつmutationする。commit/reconcileはevent head、active pointer revision、authority freshness、
author/auditor/promoter identity、receipt replay digestのfaultを直接所有する。

runnerはL6の`RequirementExecutionApiV1 | RequirementExecutionPipelineV1`をloadし、75 rowの`execution_api`をexact-nameでjoinする。
manifestで使用する9 execution名は`appendRequirementRevision`、`commitRequirementTranslationBundle+reconcileRequirementTranslationBundle`、
`translateRequirementInput+commitRequirementTranslationBundle+reconcileRequirementTranslationBundle`、
`deriveDesignObligations`、`evaluateObligationClosure`、`evaluateTemplateShadow`、`routeTemplateGap`、`validateRequirementAtom`、
`validateRequirementFreeze`である。各fixtureは全引数をV1型recordで供給し、旧型名・暗黙alias・未知APIを拒否する。authority mutationは
`AuthorityReceiptV1`のstatus、trusted clock freshness、scope、active pointer revision、supersession、event headを一fieldずつ変え、Err時write 0をassertする。
正常翻訳case `HST-CASE-028-01`だけは`translateRequirementInput+commitRequirementTranslationBundle+reconcileRequirementTranslationBundle`
pipelineを所有し、translator proposalからterminal receiptまでのexact joinを検証する。

## §2 executable case manifest実体

| case ID | fixture ID | revision | 実行API | fault位置 | 期待write set | case record SHA-256 | fixture manifest artifact path |
|---|---|---:|---|---|---|---|---|
| `HST-CASE-027-01` | `rto-hst-case-027-01` | 1 | `commitRequirementTranslationBundle+reconcileRequirementTranslationBundle` | `after_event_append:reconcile` | `event+projection+receipt` | `sha256:711395435729ae2b1a16bfee41591905a066e39d56bacdf97377acd1e0bfddde` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-02` | `rto-hst-case-027-02` | 1 | `deriveDesignObligations` | `before_commit:HIL_DESIGN_REQUIREMENT_ORPHAN` | `none` | `sha256:a8b14a0e82fe0e3d52b1acc87d18c54d5ba2f2f1047d8896f565930a1a612b3d` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-03` | `rto-hst-case-027-03` | 1 | `deriveDesignObligations` | `before_commit:HIL_DESIGN_CAPABILITY_SERVICE_MISSING` | `none` | `sha256:6948c9095dc0636042e578ada625a0afd32efaeede738ab26bf5a35323ea0f4b` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-04` | `rto-hst-case-027-04` | 1 | `deriveDesignObligations` | `before_commit:HIL_DESIGN_SERVICE_ORPHAN` | `none` | `sha256:9fffebf924759d3e56ff9802cbf36253631c5e4d150cfbfcbf8bf5aa977cd472` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-05` | `rto-hst-case-027-05` | 1 | `deriveDesignObligations` | `before_commit:HIL_DESIGN_SERVICE_DOMAIN_OBJECT_MISSING` | `none` | `sha256:0b3759620fc0a2c14dd02313072a790dc742c40b185d3735c7843527ffef43aa` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-06` | `rto-hst-case-027-06` | 1 | `deriveDesignObligations` | `before_commit:HIL_DESIGN_OBLIGATION_MISSING` | `none` | `sha256:d81138377528c92feb365dbbcaaa11ca4f0ab3b261ddd9b38add5016fbc053c4` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-07` | `rto-hst-case-027-07` | 1 | `deriveDesignObligations` | `before_commit:HIL_DESIGN_TEMPLATE_INSTANCE_MISSING` | `none` | `sha256:cdf9f3e5f570ab9910a639bae1ebfa80413ba54f75e0365bf4b12c4bd313e71b` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-08` | `rto-hst-case-027-08` | 1 | `routeTemplateGap` | `before_commit:HIL_DESIGN_TEMPLATE_SECTION_MISSING` | `none` | `sha256:8804cab6dbee06104013320e065e980ccb72542cfc51d1ecb6d624c7f4d52b59` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-09` | `rto-hst-case-027-09` | 1 | `routeTemplateGap` | `before_commit:HIL_DESIGN_TEMPLATE_PLACEHOLDER_UNRESOLVED` | `none` | `sha256:6f28e516f9a1ccae84f95bcce2e964ddc33894ed95eaf309b6d27989c298c044` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-10` | `rto-hst-case-027-10` | 1 | `routeTemplateGap` | `before_commit:HIL_DESIGN_TEMPLATE_SECTION_HOLLOW` | `none` | `sha256:b170107257105fcf93954b31b10c39c13f3cbffc29256f03584c5d2e680b7d70` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-11` | `rto-hst-case-027-11` | 1 | `routeTemplateGap` | `before_commit:HIL_DESIGN_APPLICABILITY_MISSING` | `none` | `sha256:cd0abb5e2b176d521fa22c2a9d41cd1d22471f626ce70c2d3a81e1c581c66d21` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-12` | `rto-hst-case-027-12` | 1 | `routeTemplateGap` | `before_commit:HIL_DESIGN_NOT_APPLICABLE_EVIDENCE_MISSING` | `none` | `sha256:a09c4a84ef92e8c10fc91a1fc5eddddbf165d0a0ad70cac0f9da552e88130dd3` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-13` | `rto-hst-case-027-13` | 1 | `routeTemplateGap` | `before_commit:HIL_DESIGN_FALSE_NOT_APPLICABLE` | `none` | `sha256:d65cf4c41bf195834131ba162620698a7ce3939ee5a6deb30ad3144e1332c98f` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-14` | `rto-hst-case-027-14` | 1 | `routeTemplateGap` | `before_commit:HIL_DESIGN_DEFERRED_NOT_CLOSED` | `none` | `sha256:ad4747c958b72dbc61fbcc729d7cca3d0212883a998c69cc0e0a75389d47c18e` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-15` | `rto-hst-case-027-15` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_FACET_DATA_MISSING` | `none` | `sha256:63ce3f6a4bb1390b5e73f30afdf467ee5503f9dde5d1f17539fbc76ca98ab39e` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-16` | `rto-hst-case-027-16` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_FACET_STATE_MISSING` | `none` | `sha256:88c3b8a114112177819381128380d0d055432bc6332191df1109a914651a1f79` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-17` | `rto-hst-case-027-17` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_FACET_FAILURE_MISSING` | `none` | `sha256:82ef0e37f28f6af97ba5a0c1db6072442cf70df85d561ed6e249fb2521e54004` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-18` | `rto-hst-case-027-18` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_FACET_SECURITY_MISSING` | `none` | `sha256:85c0ade8babe17d7adc9bf8c117ddaffe3e35dda2901e3cf4733f7bd84c09179` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-19` | `rto-hst-case-027-19` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_FACET_OBSERVABILITY_MISSING` | `none` | `sha256:b0dd4f52726e61c2a9ccdd8cc44937a55407342f06cc655621f559eb9639ae5d` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-20` | `rto-hst-case-027-20` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_FACET_LIFECYCLE_MISSING` | `none` | `sha256:ac6c9608e1b149e78d217130e94f514c016df44c15337f375de3e0313bf5e516` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-21` | `rto-hst-case-027-21` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_TEMPLATE_VERSION_DRIFT` | `none` | `sha256:3fb9b6c360004696cf1220f3966be9a0948e380d9ba4010f11a01564d47e5aec` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-22` | `rto-hst-case-027-22` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_TEMPLATE_MIGRATION_MISSING` | `none` | `sha256:71823ff44f663af3aec311ff5544364fb2a782522c52d2b9fe4e49576226696e` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-23` | `rto-hst-case-027-23` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_EDGE_REVERSE_MISSING` | `none` | `sha256:57fc0469a1c6d95b55dc1e41130bd37b5318acb69161254fa361d20d8adab4cf` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-24` | `rto-hst-case-027-24` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_EDGE_FORWARD_MISSING` | `none` | `sha256:7f34a9de3d0170604bed8447e490bc30ec0bbf890dc96671750dd37eece66af0` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-25` | `rto-hst-case-027-25` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_EDGE_DANGLING` | `none` | `sha256:41415d5efe25f4e959c30018ba131740f6c8292139e36d12a07522853d5b0e25` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-26` | `rto-hst-case-027-26` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_TEST_ORACLE_MISSING` | `none` | `sha256:8230709a50e16aa21c420b2d089809442b7ade97acac8598bf9c8deb68c475aa` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-27` | `rto-hst-case-027-27` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_GATE_BINDING_MISSING` | `none` | `sha256:bb10263e7c8face586feb6935c845f517796276f39ceb8f5d0fc10375f1bbbd9` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-28` | `rto-hst-case-027-28` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_AGGREGATE_ONLY` | `none` | `sha256:5b525bd9bb3378b53eb7e12e66ab8ea1b8b6ae1ddfd6fb58d651abca1dc2dedb` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-29` | `rto-hst-case-027-29` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_VERIFICATION_STALE` | `none` | `sha256:ff78e20db1c4cfd9b69bcd4d53789900998392b7ee22313005b279064a7a1340` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-30` | `rto-hst-case-027-30` | 1 | `evaluateObligationClosure` | `before_commit:HIL_DESIGN_GRAPH_NONDETERMINISTIC` | `none` | `sha256:f14c7e1470b98161d161b6785754720a129e087044e37924137a266447f65829` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-31` | `rto-hst-case-027-31` | 1 | `validateRequirementFreeze` | `before_commit:HIL_DESIGN_OBLIGATION_INCOMPLETE` | `none` | `sha256:0772a970e110d6a84b0f8f0ec6b681e95ef19c9acb91476bed2e6e1d402f2b0c` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-027-32` | `rto-hst-case-027-32` | 1 | `validateRequirementFreeze` | `before_commit:HIL_DESIGN_OBLIGATION_INCOMPLETE` | `none` | `sha256:380af502db4068a490977d4d5924375000ca481d5835acec80bf25362b7128bd` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-01` | `rto-hst-case-028-01` | 1 | `translateRequirementInput+commitRequirementTranslationBundle+reconcileRequirementTranslationBundle` | `after_projection_append:reconcile` | `event+projection+receipt` | `sha256:9cd9d52f32b47d0498afbb424c8c37ea399b6c0840c8c65db5ea9dde618826ff` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-02` | `rto-hst-case-028-02` | 1 | `validateRequirementAtom` | `before_commit:HIL_REQUIREMENT_TRANSLATION_INPUT_UNCUSTODIED` | `none` | `sha256:2fe81b1f97398ce0dc70e4613346d78067df73e7942afdd2c9bee2698227e685` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-03` | `rto-hst-case-028-03` | 1 | `validateRequirementAtom` | `before_commit:HIL_REQUIREMENT_ATOM_AGGREGATE_ONLY` | `none` | `sha256:6846842aec814792d2ec8d04a09915194835a04d0c275cd6cd398759c933c7ea` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-04` | `rto-hst-case-028-04` | 1 | `validateRequirementAtom` | `before_commit:HIL_REQUIREMENT_ATOM_SOURCE_MISSING` | `none` | `sha256:f0b5476b66121799b501a8c0aa0d2ecf09910a384cfdc689d7d56d54fdf5a6a6` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-05` | `rto-hst-case-028-05` | 1 | `validateRequirementAtom` | `before_commit:HIL_REQUIREMENT_TRANSLATION_AMBIGUOUS` | `none` | `sha256:2bfaf09114bb5710e4d47e5ffab1d55209571c16316950aade99dffbbf935a49` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-06` | `rto-hst-case-028-06` | 1 | `validateRequirementAtom` | `before_commit:HIL_REQUIREMENT_TRANSLATION_AUTHORITY_MISSING` | `none` | `sha256:a1c678e461264bf3ba00daaf1aafc640d6b10e0ee2ecf8745eeda37eb495a9ee` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-07` | `rto-hst-case-028-07` | 1 | `validateRequirementAtom` | `before_commit:HIL_REQUIREMENT_TRANSLATION_MAPPING_MISSING` | `none` | `sha256:5ecd2ea11b7f08407b8f3e30337fca3ea9dcb1617dd1cdaf988995e2c8f7d9c8` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-08` | `rto-hst-case-028-08` | 1 | `validateRequirementAtom` | `before_commit:HIL_REQUIREMENT_TRANSLATION_NONDETERMINISTIC` | `none` | `sha256:cc2997339d0fdbde9eb4d9a8338aab4c7c2bba60e49bb7eeed4592f73a827856` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-09` | `rto-hst-case-028-09` | 1 | `commitRequirementTranslationBundle+reconcileRequirementTranslationBundle` | `before_active_pointer_cas:reconcile` | `event+projection+receipt` | `sha256:7557ff050ba04342f12a07b16fde004e6a5714422d61b13459b2bf15cf418175` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-10` | `rto-hst-case-028-10` | 1 | `routeTemplateGap` | `before_commit:HIL_TEMPLATE_GAP_UNREPORTED` | `none` | `sha256:5676d40ad758a8ed5df62743ae8c079f038ff6c05c0f1f7703a2a0c0339490ed` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-11` | `rto-hst-case-028-11` | 1 | `routeTemplateGap` | `before_commit:HIL_TEMPLATE_GAP_FALSE_NOT_APPLICABLE` | `none` | `sha256:8a45fd10d8fbca963b5b1f5912f1b6a60a73b88fb9896badda4380461088f724` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-12` | `rto-hst-case-028-12` | 1 | `routeTemplateGap` | `before_commit:HIL_TEMPLATE_CANDIDATE_IMMEDIATE_ENFORCEMENT` | `none` | `sha256:ad4b8f74a79dc25c72b2b17be3051d7483276ceebdbd4be363ea3340bc25477d` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-13` | `rto-hst-case-028-13` | 1 | `routeTemplateGap` | `before_commit:HIL_TEMPLATE_SHADOW_EVIDENCE_MISSING` | `none` | `sha256:4747e2815c87295b878230a44b9c3e9fbc5a2f6587a2d43e2e3c0c35f8853ca3` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-14` | `rto-hst-case-028-14` | 1 | `routeTemplateGap` | `before_commit:HIL_TEMPLATE_SHADOW_REGRESSION` | `none` | `sha256:aaa802724184df2d4e5fad9755726741e85f2024d7334e35347093d2aca0cacc` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-15` | `rto-hst-case-028-15` | 1 | `evaluateTemplateShadow` | `before_commit:HIL_TEMPLATE_AUDITOR_NOT_INDEPENDENT` | `none` | `sha256:25c2c33dabd001a72e69a627cdebb31973447f0a10b085ceeb46d133e8fcb36c` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-16` | `rto-hst-case-028-16` | 1 | `evaluateTemplateShadow` | `before_commit:HIL_TEMPLATE_SELF_PROMOTION` | `none` | `sha256:3c9b32bcec5f7d11f5800cfb8ab03eb823564c10f3525e48a34315d7a92295f6` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-17` | `rto-hst-case-028-17` | 1 | `evaluateTemplateShadow` | `before_commit:HIL_TEMPLATE_PROMOTION_PREMATURE` | `none` | `sha256:7d3c15b8bb4c040a79c66e441b901b1fba76c47c425462b9366014f9160f0462` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-18` | `rto-hst-case-028-18` | 1 | `evaluateTemplateShadow` | `before_commit:HIL_TEMPLATE_ACTIVE_VERSION_MUTATED` | `none` | `sha256:95e028ade6058970fdc95fc273458a7e19cbafc6726510688464b60c5bca810e` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-19` | `rto-hst-case-028-19` | 1 | `commitRequirementTranslationBundle+reconcileRequirementTranslationBundle` | `after_active_pointer_cas:reconcile` | `event+projection+receipt` | `sha256:9d303508c9510c7b73dbfaa78d1e6bae76fbdf286afd413ba2ee8485df3606d6` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-028-20` | `rto-hst-case-028-20` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_TRANSLATION_UNSAFE` | `none` | `sha256:fe15212fcf28edb67fe60d7c4fe409b7828ff37a5f7f03b022b91ffdde39aab9` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-01` | `rto-hst-case-029-01` | 1 | `commitRequirementTranslationBundle+reconcileRequirementTranslationBundle` | `after_terminal_receipt_append:reconcile` | `event+projection+receipt` | `sha256:36625c52f755c43220e863b745bf641d6cc7ee85e0be40401b4f662e27f64d1b` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-02` | `rto-hst-case-029-02` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_SOURCE_MISSING` | `none` | `sha256:6f961df71a98c86d570460b5698daeffd8e852e86398faf41aa44f3f73613a98` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-03` | `rto-hst-case-029-03` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_AUTHORITY_MISSING` | `none` | `sha256:320ea70145fc929c48767e73447b3bf7ed2149328b0200d4c025916dd9c01190` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-04` | `rto-hst-case-029-04` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_MODALITY_MISSING` | `none` | `sha256:9ba236262791f57902080b75bc7e6f07cc15e288b8433f1ce54d8c0f0cd1e5f6` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-05` | `rto-hst-case-029-05` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_PRIORITY_MISSING` | `none` | `sha256:733b4ebe4aa83e2131e082736ea314a8ae6f07fee9b02bba8203dc88f587c8b3` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-06` | `rto-hst-case-029-06` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_SCOPE_MISSING` | `none` | `sha256:8c99a72c610b9b3121a5c97d82e577fed25153bd8fb0354c3a38b32825be12d6` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-07` | `rto-hst-case-029-07` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_ORACLE_MISSING` | `none` | `sha256:4538bfab274caad840ddb6ad9fe63c77439f213812021f3c970e130188f5a4f1` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-08` | `rto-hst-case-029-08` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_SERVICE_MISSING` | `none` | `sha256:4c9fab06489eb465cdd745790e3ef63fdd5f40cb9957bf7c9e702691bde416cf` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-09` | `rto-hst-case-029-09` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_TEMPLATE_MISSING` | `none` | `sha256:1d02cfd60e75139b55adb76eb5b740764135c9a982ee80d95cf926a0ec12d9fe` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-10` | `rto-hst-case-029-10` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_OBLIGATION_MISSING` | `none` | `sha256:6eeca53597616570344c9c568068f1ff21977ef2304d5e406f731cfa3f3f8e40` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-11` | `rto-hst-case-029-11` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_SPLIT_RECEIPT_MISSING` | `none` | `sha256:0a3e10f2b0f4401cedb24809bbaba6ac87be8f9844e89bfd089c25803970896c` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-12` | `rto-hst-case-029-12` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_MERGE_RECEIPT_MISSING` | `none` | `sha256:ee935763a2879c2edfa848044c92181b35a74162a8eef10464dbbe9718236045` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-13` | `rto-hst-case-029-13` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_RENAME_RECEIPT_MISSING` | `none` | `sha256:5a4d769a8458f1a28ca4a83fbc2f22becbf4ab587b18a2a7c37f3ba1bdb46dd8` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-14` | `rto-hst-case-029-14` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_SUPERSEDE_RECEIPT_MISSING` | `none` | `sha256:411f6961515cfdba224f1e9c78d6cdd22d308a44fc0bcce42038654d1875d140` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-15` | `rto-hst-case-029-15` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_NA_RECEIPT_MISSING` | `none` | `sha256:b091baf15d3f755b77ee300329506718642eb7327d474ca77e50d327f5a86612` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-16` | `rto-hst-case-029-16` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_REVISION_SEQUENCE_INVALID` | `none` | `sha256:282d7feb23dc079afaf7900e2aaec4911ff288981f2f6b1ce8be31c70bd97fb5` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-17` | `rto-hst-case-029-17` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_RENAME_SEMANTIC_CHANGE` | `none` | `sha256:df085d5bf2923541545b95493d2c8a05779963b562b47b9a5ff57b3c39ea3fea` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-18` | `rto-hst-case-029-18` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_FALSE_NOT_APPLICABLE` | `none` | `sha256:0521f994177788f7374a602f0da47316a041fa31dfcd08db5d5332f3f2d2ce6c` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-19` | `rto-hst-case-029-19` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_DOWNSTREAM_STALE` | `none` | `sha256:5b4894e62949c7d32079b0a850021d52c8723b0c5b920a5ea1c4d00ca5e0a44b` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-20` | `rto-hst-case-029-20` | 1 | `appendRequirementRevision` | `before_commit:HIL_REQUIREMENT_SPLIT_CHILD_MISSING` | `none` | `sha256:c59cbcdca98c33453e3e5bf37891561531b12adb7024c670379010de870c3b07` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-21` | `rto-hst-case-029-21` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_DEFINITION_INCOMPLETE` | `none` | `sha256:ee4a34a91669044aa548343db952b919934e2a61b461fe2829084ff413b88210` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-22` | `rto-hst-case-029-22` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_CHANGE_RECEIPT_MISSING` | `none` | `sha256:feb21e9480c675885d0837460d4612aeb28078521058c8617040b49ae0ba000f` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
| `HST-CASE-029-23` | `rto-hst-case-029-23` | 1 | `validateRequirementFreeze` | `before_commit:HIL_REQUIREMENT_LEDGER_SEMANTIC_GAP` | `none` | `sha256:4528d1b35f881af2cc6202264e579d941c4dcd5d48513ce1a481d475193b5a70` | `docs/test-design/helix/fixtures/requirement-translation-obligation-case.manifest` |
