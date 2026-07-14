---
title: "HELIX L5詳細設計 — requirement translation obligation"
layer: L5
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
pair_artifact: docs/test-design/helix/L5-requirement-translation-obligation-integration-test-design.md
next_pair_freeze: L8
---
# HELIX L5詳細設計 — 要求翻訳・設計義務

## §0 境界

L1/L3/L4、system assertion ledger、requirement/coverage/assertion ledger、HC-CHAT-037〜039を正本とし、既存template、Issue、authority、pair-freeze、event projectionを再利用する。

## §1 componentと永続契約

Requirement Translatorはcustody済み原文を一つのacceptance outcomeまたはconstraintへ原子化し、曖昧・矛盾・根拠欠落をchallengeへ送る。Template Gap Routerは表現不能obligationをIssueとReverseへ同一causalityで送る。Design Obligation Graphは正本path
`requirement → capability → service → domain object`からfacet/template/oracle/gateへ上下pairと左右V-pairを型付き生成する。

`requirement_source_atoms`、`requirement_translation_events`、`requirement_challenges`、`template_gap_issues`、`requirement_definitions`、`requirement_definition_edges`、`design_obligations`、`obligation_discharge_receipts`をappend-only eventから再生成する。revision/operation/digestはuniqueとし、shadow、migration、rollback、独立audit前のtemplate active化を禁止する。

template lifecycle、requirement revision、design obligationの状態正本はそれぞれのappend-only event streamだけとする。
projection rowやactive pointerを直接更新せず、Node commit storeがoperation bundleをCAS commitし、receipt replay/reconcileでprojectionと
pointerを再生成する。author/auditor/promoterは別identityで、authority receiptのscope、issued/expiry、freshness evidence、active pointer
revisionがcurrentでなければpromotionとfreezeを0件にする。

authority receiptにcallerが記載した`status=current`はcurrentnessの証拠にしない。Nodeは`TrustedNowV1`と
`CurrentRequirementAuthorityStoreV1`からcurrent authority snapshotを独立取得し、expiry、scope、supersession終端、authority event head、
active pointer revisionを照合した`ValidatedAuthoritySetV1`だけを後段へ渡す。commit/reconcile直前にも同じstoreを再読し、snapshot digestが
bundle build時からdriftした場合は全write 0とする。

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

## §3 実装契約

| table | PK／必須field | unique／FK／不変条件 |
|---|---|---|
| requirement_source_atoms | atom_id、revision、source_kind/span/content_digest、custody_receipt | unique(atom_id,revision)、custody FK、raw原文immutable |
| `requirement_translation_events`（翻訳event台帳） | `event_id`、`atom_id`、sequence、遷移元/先、`operation_id`、previous/event digest | atom/sequence一意、operation/digest一意、追記専用 |
| requirement_challenges | challenge_id、atom_revision、kind、evidence_digest、owner、status | atom FK、open→resolved/rejectedのみ |
| template_gap_issues | gap_id、obligation_id、template_revision、issue_id、reverse_id、causality_digest | 各FK必須、同causality exactly-one |
| `template_gap_queue` | queue_entry_id、gap_id、issue_id、reverse_id、operation_id、payload_digest | 主keyはqueue_entry_id、gap/issue/reverse外部key必須、operation一意、causality一件 |
| `template_gap_events` | event_id、gap_id、sequence、previous/event digest、operation_id | 主keyはevent_id、gap/sequence一意、追記専用 |
| template_gap_projection | gap_id、current queue/issue/reverse ID、projection revision/digest | PK/FK gap_id、eventから再生成、直接UPDATE禁止 |
| requirement_definitions | requirement_id、revision、statement/modality/priority/scope/oracle digest、status | unique(requirement_id,revision)、UPDATE禁止 |
| requirement_definition_edges | edge_id、from/to revision、kind、evidence_digest | 両端FK、forward/reverse対称 |
| design_obligations | obligation_id、requirement_revision、facet、template applicability、pair/oracle/gate digest | atomic、aggregate parent discharge禁止 |
| obligation_discharge_receipts | receipt_id、obligation_revision、decision、snapshot、review authority | current revisionへ最大一件 |

stateはqueued→proposal→committedまたはrejected/ambiguous、gap_detected→issued、template draft→shadow→audit_pending→approved→activeまたはrolled_back、requirement staged→current→staleを許可する。custody+translation event+atom projection、gap Issue+Reverse+queue、revision+edge+stale eventは各単一transaction。fault時は全増分0、同operation同digest再送は増分0、異digest再送は拒否する。
projection write失敗は`reconcile_pending` receiptをappendし、expected projection headをCASするNode APIだけが同一bundleを再開する。

全table payloadとpublic APIはL6のV1型を正本とし、authority FKは`AuthorityReceiptV1`だけを受理する。commit直前にcurrent authority、
trusted clock freshness、scope、active pointer revision、supersession終端、template/requirement/obligation event heads、projection headを再読する。
events→projection→active pointer→terminal receiptは同一operation/snapshotの単一CASで、partial current化を禁止する。reconcileはsame
operation ID/digest/expected snapshotだけを再開し、CAS loser、stale/expired authority、異digest retryのauthoritative増分は0とする。

正常翻訳は`translateRequirementInput`でproposalを作り、`validateRequirementAtoms`で全atomを原子検証し、
`buildRequirementTranslationCommitBundle`でexact `RequirementTranslationCommitBundleV1`へ閉じてから、
`commitRequirementTranslationBundle`を実行する。commit receiptが`reconcile_pending`の場合だけ
`reconcileRequirementTranslationBundle`を同一bundleで実行する。public callable
`executeRequirementTranslationNormalPipeline`は先頭の`validateCurrentRequirementAuthorities`を含む6段を所有する。
この固定compositionからauthority取得、validate、buildをcommit内部の暗黙処理へ省略しない。

75 primary caseはcase ID keyed executable manifestを必須とし、各recordへfixture ID/revision、実行API、fault injection位置、
expected event/projection/pointer write set、case record SHA-256、実在fixture manifest artifact pathを保持する。共通fixture参照は許すがfield省略や
range aliasは禁止し、manifest 75/75と上表75/75のcase ID、public `execution_api` exact-name、failure、expected receipt digestのexact joinを
freeze条件とする。fixture manifestは設計実行可能性の証拠であり、将来の実装test file作成済みを主張しない。
