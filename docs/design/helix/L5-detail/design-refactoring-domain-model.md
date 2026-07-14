---
title: "HELIX L5 詳細設計 — design refactoring domain model"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-16
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-025
  - HST-HIL-026
pair_artifact: docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-16
  - HAC-HIL-16a
  - HAC-HIL-16b
  - HAC-HIL-16c
source_capabilities:
  - HC-CHAT-034
  - HC-CHAT-035
  - HC-CHAT-036
  - HZ-CAP-007
  - HZ-CAP-008
  - HZ-CAP-009
---

# HELIX L5 詳細設計 — design refactoring domain model

## §0 境界とinventory-first

HC-CHAT-034/035/036を要求正本として、`externalize/commonize/objectize/semantic_rename`を一step一変換で扱う。
renameは文字列類似で決めず、I/O、副作用、failure、state transition、call graph、consumer contract、oracleのsemantic signatureを比較する。
observable behavior/public contract/要求変更はRedesign、persisted state/schema変更はRetrofitへ送る。behavior/oracle入力は
source provenance、graph revision、実行receipt、trusted clockに対するfreshnessを持つcurrent evidenceだけを採用し、署名だけ合うforged/stale oracleをrejectする。

HZ-CAP-007のdocument catalog、HZ-CAP-008のtyped schema、HZ-CAP-009のBDD/spec traceはcandidate evidenceとしてhardenするが、
ZIP template名や既存class名をdomain truthへ昇格しない。要求、service、domain object、template obligation、UT oracle、implementation symbolを
別identityのtyped edgeで結び、testをprivate symbolへ直接固定しない。

## §1 componentとsemantic判定

| component | 責務 | authority | fail-close |
|---|---|---|---|
| `DesignGraphSnapshotter` | requirement/service/object/template/oracle/symbol graphをimmutable化 | snapshot event | consumer/span/version欠落 |
| `SemanticSignatureBuilder` | I/O、副作用、failure、state、call graph、consumer/oracleをcanonical化 | signature proposal | lexical-only、unknown boundary |
| `DesignRefactorClassifier` | 4 transformまたはRedesign/Retrofit/rejectへ分類 | route proposal | future-use、万能base、複合step |
| `BehaviorPreservationGate` | before/after oracleと全consumer compatibilityを比較 | receipt event | consumer漏れ、behavior差、rollback欠落 |
| `DomainModelCatalog` | 13 role、canonical term、invariant、authority、lifecycleをversion管理 | Node catalog event | role invariant違反、曖昧名 |
| `DomainEdgeRegistry` | requirement/service/template/oracle/symbol/repository edgeを型付け | relation event | private-symbol-only oracle、依存逆転 |
| `RenameRouter` | internal/public/persistedをRefactor/Redesign/Retrofitへ分岐 | route receipt | public/DB renameの直接適用 |

semantic同等で名称が分裂する場合は統一候補、名称が同一/近似でsemanticが異なる場合は責務名へ分離する。

## §2 DB schema、key、relationの定義

| table | PK | unique／FK | 必須field | state |
|---|---|---|---|---|
| `design_graph_snapshots` | `design_graph_snapshot_id` | `scope_id,semantic_revision,graph_digest` unique | requirement/service/template/oracle/symbol set digest、producer、created_at | 状態 `current,stale,superseded` |
| `design_refactor_candidates` | `design_refactor_candidate_id` | snapshot FK、`subject,evidence_digest` unique | transform、spans、semantic/duplication/coupling/change-impact evidence、detector version | 状態 `observed,triage_pending,accepted,rejected,superseded` |
| `design_refactor_plans` | `design_refactor_plan_id` | candidate/Issue/Reverse/ScopeAuthority FK、operation unique | baseline graph、observable boundary、oracle/consumer set、budget、rollback | 状態 `draft,fenced,transforming,verification_pending,verified,rerouted,failed` |
| `design_refactor_steps` | `design_refactor_step_id` | plan FK、`plan,ordinal` unique | one transform、input/output node、expected delta、pair、step digest | 状態 `planned,applied,verified,rolled_back,failed` |
| `design_refactor_consumer_checks` | `consumer_check_id` | step/consumer/oracle FK、triple unique | before/after contract、graph revision、source provenance、execution receipt、freshness deadline、fixture/evidence、verdict | 状態 `pending,passed,failed,stale` |
| `design_refactor_receipts` | `design_refactor_receipt_id` | plan unique FK | before/after graph/behavior、coverage、pair、rollback、route、verdict | 状態 `passed,failed,rerouted,stale` |
| `domain_object_versions` | `domain_object_version_id` | stable object FK、`object_id,revision` unique | context、role、term、responsibility、authority、identity/equality、mutability、lifecycle、aggregate/root、invariant、I/O、side-effect、failure、state、visibility/persistence、digest | 状態 `staged,current,rejected,stale,superseded` |
| `domain_object_relations` | `domain_relation_id` | from/to object FK、`from,to,kind,revision` unique | kind、port、invariant、evidence digest | 状態 `active,rejected,stale` |
| `domain_trace_edges` | `domain_trace_edge_id` | object/version FK、target registry FK、`object,operation,target_kind,target_id` unique | target kind、direction、semantic revision、evidence digest | 状態 `active,rejected,stale` |
| `naming_decisions` | `naming_decision_id` | object/version FK、`context,canonical_term,revision` unique | candidate/canonical、signature、consumer、rationale、exception owner/expiry | 状態 `pending,current,rejected,stale` |
| `rename_receipts` | `rename_receipt_id` | naming decision/plan FK unique | internal/public/persisted class、before/after graph、consumer/oracle、route、rollback | 状態 `passed,rerouted,failed,stale` |
| `design_domain_events` | `design_domain_event_id` | subject FK、`subject,event_sequence`とoperation unique | from/to、previous/event digest、actor、failure/route、occurred_at | append-only |

`domain_trace_edges.target_kind`は`requirement | service | domain_object | template_obligation | unit_oracle | integration_oracle | implementation_symbol`のenumとする。
Oracle edgeとsymbol edgeは別row、RepositoryはAggregateへ、domainはPortへ、AdapterはPort実装へ向ける。FKは`ON DELETE RESTRICT`。

## §3 role invariantと命名

13 roleを`Entity/ValueObject/Aggregate/DomainService/Policy/Specification/Command/Query/DomainEvent/Receipt/Port/Adapter/Repository`へ固定する。
Entityはidentity、VOはimmutable/value equality、Aggregateはroot内transaction、Serviceは責務、Policyはauthority、Specificationはside-effect 0、
Commandはintent、Queryはwrite 0、Eventは完了事実の過去形、Receiptはprovenance、Portはdomain-owned、AdapterはPort edge、RepositoryはAggregateを返す。
`Manager/Helper/Util/Data/Common/Shared/Base`等は責務根拠なしで拒否する。

## §4 state、event、transactionの規則

Refactorは`observed -> triage_pending -> accepted -> draft -> fenced -> transforming -> verification_pending -> verified`。
behavior/public差は`rerouted:Redesign`、DB state差は`rerouted:Retrofit`、根拠不足は`rejected`へ進む。
Domain objectは`staged -> current`または`rejected`、semantic revision変更で旧edge/decision/receiptをstale化する。

plan fenceはsnapshot、candidate、consumer/oracle set、Scope Authority、rollbackを一transactionでcommitする。transform verifyはstep、全consumer check、
pair update、receipt、eventをCASする。catalog commitはobject version、relation、typed trace、naming decision、eventをall-or-nothingとし、partial currentを0件にする。
同operation同digestは増分0、異digestはconflict、current revisionはobject/contextごと最大1件とする。

catalog bundleは`operation_id/digest`、graph/catalogのexpected revision、固定append order、exact write set、object/relation/trace/name payloadを持つ。
appendは`object_versions -> relations -> trace_edges -> naming_decisions -> design_domain_event -> projection -> commit_receipt`の順に限る。
各step直後fault、CAS不一致、write-set差、同operation異digestは全rollbackする。成功receiptはbefore/after revision、event sequence、write-set digest、
table別insert/update countを返し、同operation同digest再送は元receiptと全count 0を返す。

behavior preservation入力のprovenance digest、graph revision、execution receipt digest、executed_at/fresh_untilはsnapshot/current graphとexact一致させる。
receipt署名が正しくてもproducer allowlist外、graph revision違い、receipt未登録、期限切れならbehavior/consumer/oracle passを0件にする。

## §5 canonical assertion primary表

| HST正本 | 主IT | 主U | pre_state | expected_state | failure正本 |
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

## §6 freeze条件

L5/L8 pairはIT 12/12、canonical 34/34、consumer/oracle全量、forged/stale oracle反証、4 transform、3 route、13 role、typed edge、transaction fault、
write-count、ZIP capability disposition、別runtime reviewが揃うまでdraftとする。

commit receiptはtrusted oracleごとのoracle ID、result digest、observable digest、execution receipt digestをexact setで保持し、
trace/behavior evidenceから再導出したbinding digest不一致ではcurrent化しない。

## §13 信頼済み実行receiptの正本性

oracle resultの信頼bindingは`TrustedExecutionReceipt`自身に格納し、別のcaller組立てobjectをauthorityにしない。receipt rowはreceipt ID/revisionをPK、producer/version、execution identity、result/observable bytes digest、commit/event head、issued/fresh-until、supersession terminalを必須とする。`TrustedOracleSet`は各receiptのbehavior signatureと対象commit digestをexactにbindする。current receipt bytes/headは`TrustedExecutionReceiptStore`だけから解決し、未知producer、旧revision、expiry、result/observable/commit swap、caller digestではrefactor current化0とする。oracle set、refactor event、projection、receiptのCAS transaction faultは全rollbackする。
