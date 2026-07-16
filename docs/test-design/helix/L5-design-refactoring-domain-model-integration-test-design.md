---
title: "HELIX L9 結合テスト設計 — design refactoring domain model"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/design-refactoring-domain-model.md
next_pair_freeze: L5
requirements: [HR-FR-HIL-16, HAC-HIL-16a, HAC-HIL-16b, HAC-HIL-16c]
---

# HELIX L9 結合テスト設計 — design refactoring domain model

## §0 fixture／scenarioの構成

isolated DB、fixed design graph、requirement/service/template/UT/symbol registry、13 role catalog、before/after consumer oracle、fault portを使う。
全caseは未実装で、各scenarioはevent/projection/current/write countとdigestをassertする。

| ID | scenario／fault | 期待結果 | citation |
|---|---|---|---|
| `IT-DRDM-001` | `U-DRDM-001 buildDesignSemanticSignature` → `U-DRDM-002 classifyDesignRefactorCandidate` → `U-DRDM-003`〜`006`の4 plan API → `U-DRDM-007 validateBehaviorPreservation`をstable順に実行し、transformごとにsemantic/consumer/oracleをmutation | 同等時だけverified、複合step 0 | `tests/design-refactor.integration.test.ts` |
| `IT-DRDM-002` | observable I/O/failure/stateを一件変更 | Redesign一件、Refactor receipt 0 | `tests/design-refactor-route.integration.test.ts` |
| `IT-DRDM-003` | DB field/state semanticを変更 | Retrofit一件、直接apply 0 | `tests/design-refactor-route.integration.test.ts` |
| `IT-DRDM-004` | lexical-onlyとfuture-use base/configを投入 | candidate reject、capability増分0 | `tests/design-refactor-minimality.integration.test.ts` |
| `IT-DRDM-005` | `U-DRDM-008 validateConsumerCompatibility`／`U-DRDM-010 validateRefactorFence`後、graph/oracle/scope authority storeからcurrent headを解決して`U-DRDM-018 commitRefactorPlanFence`、続いてfence storeからcurrent receiptを解決して`U-DRDM-019 commitRefactorTransformVerification`を実行。caller current偽装、fence ID/digest/head、candidate/plan/step swap、両transactionの各append fault/CASを注入 | caller申告だけではfence/verified 0。3 authority storeとcurrent fence receiptへexact一致する同一candidate/plan/step chainだけfenced→verified | `tests/design-refactor-transaction.integration.test.ts` |
| `IT-DRDM-006` | `U-DRDM-011 parseDomainObjectVersion` → `U-DRDM-012 validateDomainRoleInvariant` → `U-DRDM-013 validateDomainDependencyDirection` → `U-DRDM-014 decideCanonicalDomainName` → `U-DRDM-015 bindDomainSymbolAndOracle` → `U-DRDM-016 commitDesignDomainBundle`をstable順に実行し、13 role catalog、曖昧名、全contract mutationを評価 | valid catalogだけcurrent、全違反列挙 | `tests/domain-model-catalog.integration.test.ts` |
| `IT-DRDM-007` | EntityからSpecificationまでのinvariantを個別破壊 | object増分0、case別failure | `tests/domain-role.integration.test.ts` |
| `IT-DRDM-008` | Command/Query/Event/Receipt invariantを個別破壊 | object増分0 | `tests/domain-message-role.integration.test.ts` |
| `IT-DRDM-009` | Port/Adapter/Repository方向を逆転 | relation/object増分0 | `tests/domain-boundary.integration.test.ts` |
| `IT-DRDM-010` | 曖昧名、internal rename、private-symbol oracle、term conflict | stable object/oracle ID、invalid edge 0 | `tests/domain-naming.integration.test.ts` |
| `IT-DRDM-011` | public APIとpersisted field rename | Redesign/Retrofitを各一件 | `tests/domain-rename-route.integration.test.ts` |
| `IT-DRDM-012` | `U-DRDM-017 validateOracleTrustBinding` → `U-DRDM-016 commitDesignDomainBundle`をstable順に実行し、oracle_id/result/observable/execution receipt bindingを一件ずつ欠落・入替し、未知producer、旧revision、期限切れ、append faultも注入 | binding exact setだけcommit。forged/stale/missing oracle pass 0、current/receipt増分0、CAS rollback後partial 0 | `tests/design-oracle-trust.integration.test.ts` |

## §1 canonical assertion primary表

| HST正本 | 主IT | supporting主U | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|
| `HST-CASE-025-01` | `IT-DRDM-001` | `U-DRDM-003` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-02` | `IT-DRDM-001` | `U-DRDM-004` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-03` | `IT-DRDM-001` | `U-DRDM-005` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-04` | `IT-DRDM-001` | `U-DRDM-006` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-05` | `IT-DRDM-002` | `U-DRDM-009` | `transforming` | `rerouted` | `HIL_DESIGN_REFACTOR_BEHAVIOR_CHANGED` |
| `HST-CASE-025-06` | `IT-DRDM-003` | `U-DRDM-009` | `transforming` | `rerouted` | `HIL_DESIGN_REFACTOR_RETROFIT_REQUIRED` |
| `HST-CASE-025-07` | `IT-DRDM-004` | `U-DRDM-002` | `triage_pending` | `rejected` | `HIL_DESIGN_REFACTOR_NAME_ONLY` |
| `HST-CASE-025-08` | `IT-DRDM-005` | `U-DRDM-008` | `draft` | `draft` | `HIL_DESIGN_REFACTOR_CONSUMER_MISSING` |
| `HST-CASE-025-09` | `IT-DRDM-005` | `U-DRDM-010` | `draft` | `draft` | `HIL_DESIGN_REFACTOR_ROLLBACK_MISSING` |
| `HST-CASE-025-10` | `IT-DRDM-004` | `U-DRDM-002` | `triage_pending` | `rejected` | `HIL_DESIGN_REFACTOR_UNJUSTIFIED` |
| `HST-CASE-025-11` | `IT-DRDM-001` | `U-DRDM-002` | `assertion_input_ready` | `assertion_pass` | `HIL_DESIGN_REFACTOR_ROUTE_INVALID` |
| `HST-CASE-025-12` | `IT-DRDM-001` | `U-DRDM-001` | `assertion_input_ready` | `assertion_pass` | `HIL_DESIGN_REFACTOR_INVARIANT_BROKEN` |
| `HST-CASE-026-01` | `IT-DRDM-006` | `U-DRDM-016` | `catalog_ready` | `verified` | `なし（正常系）` |
| `HST-CASE-026-02` | `IT-DRDM-007` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_ENTITY_IDENTITY_MISSING` |
| `HST-CASE-026-03` | `IT-DRDM-007` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_VALUE_OBJECT_MUTABLE` |
| `HST-CASE-026-04` | `IT-DRDM-007` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_AGGREGATE_ROOT_MISSING` |
| `HST-CASE-026-05` | `IT-DRDM-007` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_SERVICE_RESPONSIBILITY_MISSING` |
| `HST-CASE-026-06` | `IT-DRDM-007` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_POLICY_AUTHORITY_MISSING` |
| `HST-CASE-026-07` | `IT-DRDM-007` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_SPECIFICATION_SIDE_EFFECT` |
| `HST-CASE-026-08` | `IT-DRDM-008` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_COMMAND_INTENT_MISSING` |
| `HST-CASE-026-09` | `IT-DRDM-008` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_QUERY_SIDE_EFFECT` |
| `HST-CASE-026-10` | `IT-DRDM-008` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_EVENT_NOT_COMPLETED_FACT` |
| `HST-CASE-026-11` | `IT-DRDM-008` | `U-DRDM-012` | `staged` | `rejected` | `HIL_DOMAIN_RECEIPT_PROVENANCE_MISSING` |
| `HST-CASE-026-12` | `IT-DRDM-009` | `U-DRDM-013` | `staged` | `rejected` | `HIL_DOMAIN_PORT_DEPENDENCY_INVERTED` |
| `HST-CASE-026-13` | `IT-DRDM-009` | `U-DRDM-013` | `staged` | `rejected` | `HIL_DOMAIN_ADAPTER_PORT_MISSING` |
| `HST-CASE-026-14` | `IT-DRDM-009` | `U-DRDM-013` | `staged` | `rejected` | `HIL_DOMAIN_REPOSITORY_AGGREGATE_MISSING` |
| `HST-CASE-026-15` | `IT-DRDM-010` | `U-DRDM-014` | `pending` | `rejected` | `HIL_DOMAIN_NAME_AMBIGUOUS` |
| `HST-CASE-026-16` | `IT-DRDM-010` | `U-DRDM-015` | `current` | `current` | `なし（正常系）` |
| `HST-CASE-026-17` | `IT-DRDM-011` | `U-DRDM-009` | `current` | `rerouted` | `HIL_DOMAIN_PUBLIC_RENAME_REDESIGN` |
| `HST-CASE-026-18` | `IT-DRDM-011` | `U-DRDM-009` | `current` | `rerouted` | `HIL_DOMAIN_PERSISTED_RENAME_RETROFIT` |
| `HST-CASE-026-19` | `IT-DRDM-010` | `U-DRDM-015` | `staged` | `rejected` | `HIL_DOMAIN_ORACLE_PRIVATE_SYMBOL_BOUND` |
| `HST-CASE-026-20` | `IT-DRDM-010` | `U-DRDM-014` | `staged` | `rejected` | `HIL_DOMAIN_CANONICAL_TERM_CONFLICT` |
| `HST-CASE-026-21` | `IT-DRDM-006` | `U-DRDM-016` | `assertion_input_ready` | `assertion_pass` | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` |
| `HST-CASE-026-22` | `IT-DRDM-006` | `U-DRDM-012` | `assertion_input_ready` | `assertion_pass` | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` |

## §2 合否

IT 12/12、canonical 34/34、全consumer/oracle、forged/stale反証、fault/write-count、route/rollback、13 roleをassertする。

`IT-DRDM-012`は`TrustedExecutionReceiptStoreV1`のcurrent canonical bytes/headを基準に、producer/version、result/observable、behavior signature、target commit、freshness、supersession terminalを一件ずつswapする。oracle set/event/projection/receipt各append faultとCAS競合を含め、完全一致以外はcurrent化0、partial 0とする。
このscenarioのexact function setは`validateOracleTrustBinding` → `commitDesignDomainBundle`であり、前者のtrust判定と後者のtransaction mutationを別Uで採点しつつ、同じtrusted oracle set／commit receipt identityへ結合する。
