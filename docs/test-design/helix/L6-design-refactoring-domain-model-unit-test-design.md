---
title: "HELIX L7 単体テスト設計 — design refactoring domain model"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-16
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst: [HST-HIL-025, HST-HIL-026]
pair_artifact: docs/design/helix/L6-function-design/design-refactoring-domain-model.md
next_pair_freeze: L6
requirements: [HR-FR-HIL-16, HAC-HIL-16a, HAC-HIL-16b, HAC-HIL-16c]
---

# HELIX L7 単体テスト設計 — design refactoring domain model

fixed graph、all-consumer fixture、13 role mutation、in-memory transaction portを使い、全caseは未実装とする。

| ID | exact function | mutation／期待結果 | citation |
|---|---|---|---|
| `U-DRDM-001` | `buildDesignSemanticSignature` | 各signature軸を一件変更しlexical同一との差を保持 | `tests/design-semantic-signature.test.ts` |
| `U-DRDM-002` | `classifyDesignRefactorCandidate` | lexical-only/future-use/複合transform/scope authority欠落をreject | `tests/design-refactor-classifier.test.ts` |
| `U-DRDM-003` | `planExternalize` | owner/validation/consumer欠落でstep 0 | `tests/design-refactor-transform.test.ts` |
| `U-DRDM-004` | `planCommonize` | consumer固有semantic差を1 byte変え共通化0 | `tests/design-refactor-transform.test.ts` |
| `U-DRDM-005` | `planObjectize` | responsibility/state/invariant/authority/lifecycle欠落をreject | `tests/design-refactor-transform.test.ts` |
| `U-DRDM-006` | `planSemanticRename` | name近似だけ、public identifier、同名異義をmatrix評価 | `tests/design-semantic-rename.test.ts` |
| `U-DRDM-007` | `validateBehaviorPreservation` | I/O/failure/state/oracle deltaでpassed 0 | `tests/design-refactor-behavior.test.ts` |
| `U-DRDM-008` | `validateConsumerCompatibility` | expected consumerを一件削除、duplicate、stale oracleをreject | `tests/design-refactor-consumer.test.ts` |
| `U-DRDM-009` | `routeDesignDelta` | internal/public/persisted/requirement deltaを3 routeへ分離 | `tests/design-refactor-route.test.ts` |
| `U-DRDM-010` | `validateRefactorFence` | planのconsumer/pair/oracle/authority/rollbackを一件ずつ欠落させpure validationをreject | `tests/design-refactor-fence.test.ts` |
| `U-DRDM-011` | `parseDomainObjectVersion` | role/ID/revision/unknown field mutationをreject | `tests/domain-object-schema.test.ts` |
| `U-DRDM-012` | `validateDomainRoleInvariant` | 13 role invariantを一件ずつ破壊し全failureをstable順で返す | `tests/domain-role-invariant.test.ts` |
| `U-DRDM-013` | `validateDomainDependencyDirection` | Port/Adapter/Repository edge逆転と欠落をreject | `tests/domain-dependency.test.ts` |
| `U-DRDM-014` | `decideCanonicalDomainName` | ambiguous/conflict/synonym/homonymを評価 | `tests/domain-naming.test.ts` |
| `U-DRDM-015` | `bindDomainSymbolAndOracle` | private-only oracle、edge混載、internal renameを評価 | `tests/domain-trace-edge.test.ts` |
| `U-DRDM-016` | `commitDesignDomainBundle` | object/relation/trace/name/event/projection bundleの各append直後fault、同key再送、異digest conflictでdomain catalog増分0 | `tests/design-domain-transaction.test.ts` |
| `U-DRDM-017` | oracle trust＋commit receipt binding | oracle_id/result_digest/observable_digest/execution receiptの欠落・入替とproducer/provenance/revision/freshnessを個別偽装しcommit 0 | `tests/design-oracle-trust.test.ts` |
| `U-DRDM-018` | `commitRefactorPlanFence` | graph/oracle/scope各storeのcanonical bytes/current headとcaller snapshot/oracle/authorityを1 fieldずつswapし、candidate/plan/step/consumer/pair/rollback欠落、各append fault/CASでfence増分0 | `tests/design-refactor-fence-transaction.test.ts` |
| `U-DRDM-019` | `commitRefactorTransformVerification` | fence storeのcurrent receiptに対しfence receipt ID/digest/head、candidate/plan/step digestを1 fieldずつswapし、consumer/pair/behavior/rollback/refactor receipt/event欠落と各append fault/CASでverified増分0 | `tests/design-refactor-verification-transaction.test.ts` |

## canonical assertion primary表

| HST正本 | 主U | 主API | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-025-01` | `U-DRDM-003` | `planExternalize` | `IT-DRDM-001` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-02` | `U-DRDM-004` | `planCommonize` | `IT-DRDM-001` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-03` | `U-DRDM-005` | `planObjectize` | `IT-DRDM-001` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-04` | `U-DRDM-006` | `planSemanticRename` | `IT-DRDM-001` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-05` | `U-DRDM-009` | `routeDesignDelta` | `IT-DRDM-002` | `transforming` | `rerouted` | `HIL_DESIGN_REFACTOR_BEHAVIOR_CHANGED` |
| `HST-CASE-025-06` | `U-DRDM-009` | `routeDesignDelta` | `IT-DRDM-003` | `transforming` | `rerouted` | `HIL_DESIGN_REFACTOR_RETROFIT_REQUIRED` |
| `HST-CASE-025-07` | `U-DRDM-002` | `classifyDesignRefactorCandidate` | `IT-DRDM-004` | `triage_pending` | `rejected` | `HIL_DESIGN_REFACTOR_NAME_ONLY` |
| `HST-CASE-025-08` | `U-DRDM-008` | `validateConsumerCompatibility` | `IT-DRDM-005` | `draft` | `draft` | `HIL_DESIGN_REFACTOR_CONSUMER_MISSING` |
| `HST-CASE-025-09` | `U-DRDM-010` | `validateRefactorFence` | `IT-DRDM-005` | `draft` | `draft` | `HIL_DESIGN_REFACTOR_ROLLBACK_MISSING` |
| `HST-CASE-025-10` | `U-DRDM-002` | `classifyDesignRefactorCandidate` | `IT-DRDM-004` | `triage_pending` | `rejected` | `HIL_DESIGN_REFACTOR_UNJUSTIFIED` |
| `HST-CASE-025-11` | `U-DRDM-002` | `classifyDesignRefactorCandidate` | `IT-DRDM-001` | `assertion_input_ready` | `assertion_pass` | `HIL_DESIGN_REFACTOR_ROUTE_INVALID` |
| `HST-CASE-025-12` | `U-DRDM-001` | `buildDesignSemanticSignature` | `IT-DRDM-001` | `assertion_input_ready` | `assertion_pass` | `HIL_DESIGN_REFACTOR_INVARIANT_BROKEN` |
| `HST-CASE-026-01` | `U-DRDM-016` | `commitDesignDomainBundle` | `IT-DRDM-006` | `catalog_ready` | `verified` | `なし（正常系）` |
| `HST-CASE-026-02` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_ENTITY_IDENTITY_MISSING` |
| `HST-CASE-026-03` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_VALUE_OBJECT_MUTABLE` |
| `HST-CASE-026-04` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_AGGREGATE_ROOT_MISSING` |
| `HST-CASE-026-05` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_SERVICE_RESPONSIBILITY_MISSING` |
| `HST-CASE-026-06` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_POLICY_AUTHORITY_MISSING` |
| `HST-CASE-026-07` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_SPECIFICATION_SIDE_EFFECT` |
| `HST-CASE-026-08` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-008` | `staged` | `rejected` | `HIL_DOMAIN_COMMAND_INTENT_MISSING` |
| `HST-CASE-026-09` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-008` | `staged` | `rejected` | `HIL_DOMAIN_QUERY_SIDE_EFFECT` |
| `HST-CASE-026-10` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-008` | `staged` | `rejected` | `HIL_DOMAIN_EVENT_NOT_COMPLETED_FACT` |
| `HST-CASE-026-11` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-008` | `staged` | `rejected` | `HIL_DOMAIN_RECEIPT_PROVENANCE_MISSING` |
| `HST-CASE-026-12` | `U-DRDM-013` | `validateDomainDependencyDirection` | `IT-DRDM-009` | `staged` | `rejected` | `HIL_DOMAIN_PORT_DEPENDENCY_INVERTED` |
| `HST-CASE-026-13` | `U-DRDM-013` | `validateDomainDependencyDirection` | `IT-DRDM-009` | `staged` | `rejected` | `HIL_DOMAIN_ADAPTER_PORT_MISSING` |
| `HST-CASE-026-14` | `U-DRDM-013` | `validateDomainDependencyDirection` | `IT-DRDM-009` | `staged` | `rejected` | `HIL_DOMAIN_REPOSITORY_AGGREGATE_MISSING` |
| `HST-CASE-026-15` | `U-DRDM-014` | `decideCanonicalDomainName` | `IT-DRDM-010` | `pending` | `rejected` | `HIL_DOMAIN_NAME_AMBIGUOUS` |
| `HST-CASE-026-16` | `U-DRDM-015` | `bindDomainSymbolAndOracle` | `IT-DRDM-010` | `current` | `current` | `なし（正常系）` |
| `HST-CASE-026-17` | `U-DRDM-009` | `routeDesignDelta` | `IT-DRDM-011` | `current` | `rerouted` | `HIL_DOMAIN_PUBLIC_RENAME_REDESIGN` |
| `HST-CASE-026-18` | `U-DRDM-009` | `routeDesignDelta` | `IT-DRDM-011` | `current` | `rerouted` | `HIL_DOMAIN_PERSISTED_RENAME_RETROFIT` |
| `HST-CASE-026-19` | `U-DRDM-015` | `bindDomainSymbolAndOracle` | `IT-DRDM-010` | `staged` | `rejected` | `HIL_DOMAIN_ORACLE_PRIVATE_SYMBOL_BOUND` |
| `HST-CASE-026-20` | `U-DRDM-014` | `decideCanonicalDomainName` | `IT-DRDM-010` | `staged` | `rejected` | `HIL_DOMAIN_CANONICAL_TERM_CONFLICT` |
| `HST-CASE-026-21` | `U-DRDM-016` | `commitDesignDomainBundle` | `IT-DRDM-006` | `assertion_input_ready` | `assertion_pass` | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` |
| `HST-CASE-026-22` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-006` | `assertion_input_ready` | `assertion_pass` | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` |

## 合否

U 19/19、canonical 34/34、forged/stale oracleを含む全mutation、stable order、write-count、rollback/route evidenceを保存する。

`U-DRDM-017`は`TrustedExecutionReceiptV1.result_binding`がreceipt自身のcanonical bytesへ含まれることをassertし、別object/caller digestをauthorityにしない。storeのcurrent bytes/head/producer/freshness、`TrustedOracleSetV1`のbehavior/commit bindingを個別mutationし、swap/stale/CAS/faultの全反例でwrite count 0とする。
さらに`executed_at <= issued_at < fresh_until`、worker clock非採用、実行後発行という時刻意味を個別に反転して拒否する。
