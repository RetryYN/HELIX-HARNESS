---
title: "HELIX L5詳細設計 — layer ledger pair gate"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
design_slice: HDS-HIL-18
related_hst:
  - HST-HIL-030
  - HST-HIL-031
  - HST-HIL-032
  - HST-HIL-033
requirements:
  - HR-FR-HIL-18
  - HAC-HIL-18a
  - HAC-HIL-18b
  - HAC-HIL-18c
pair_artifact: docs/test-design/helix/L5-layer-ledger-pair-gate-integration-test-design.md
next_pair_freeze: L8
---
# HELIX L5詳細設計 — 連鎖台帳・pair gate

## §0 境界

L0–L14 workflow、design/progress/requirement/assertion ledger、V-model pair metadata、HC-CHAT-039〜041を正本とする。新しいCLIや別DB instanceは増やさず、以下のtableは既存harness.db内のappend-only schemaとして追加する。

## §1 DB・event・projection

`layer_ledger_registry`、`layer_obligation_rows`、`vertical_pair_edges`、`horizontal_vpair_edges`、`design_refactor_candidates`、`design_progress_denominators`、`design_stage_receipts`をappend-only eventから再生成する。template抽出rowと追加記載rowはsource span、authority、revision、semantic digestを必須とする。

L4要求のledger snapshot、manual addition、vertical/horizontal pair receipt、gate finding、process eventを独立schemaとして保存し、
すべてappend-only eventから同一digestへ再生成する。projectionの直接UPDATE、receiptの上書き、findingのsilent deleteを禁止する。

固定分母は承認済みregistry revisionへbindし、artifact存在、semantic closure、独立監査、pair freeze、実装検証を別stageとして保存する。stale、分母改竄、親だけのaggregate消込、fake completionをfail-closeする。
callerが渡す`ApprovedDenominatorV1`はhintに限定し、Node storeのcurrent registry、denominator authority receipt、supersession chain、
event headをCAS検証して固定分母を解決する。5 stageは固定分母を共有した別receiptであり、平均や段階省略で100%を作らない。

上下pairは隣接layerのderived-from/backpropを、左右V-pairはdesign/verification/oracle/snapshot/executionを双方向照合する。設計refactorはbefore/after ledger、consumer、rollbackを保存し、contract/state変更はRedesignまたはRetrofitへrerouteする。

## primary atomic assertion台帳

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 | U結線 |
|---|---|---|---|---|---|
| `HST-CASE-030-01` | `template_current` | `ledger_staged` | `なし（正常系）` | `IT-LLPG-001` | `U-LLPG-001` |
| `HST-CASE-030-02` | `template_current` | `failed` | `HIL_LAYER_REGISTRY_ENTRY_MISSING` | `IT-LLPG-002` | `U-LLPG-002` |
| `HST-CASE-030-03` | `ledger_staged` | `rejected` | `HIL_LAYER_OBLIGATION_PROVENANCE_MISSING` | `IT-LLPG-003` | `U-LLPG-003` |
| `HST-CASE-030-04` | `ledger_staged` | `rejected` | `HIL_LAYER_OBLIGATION_NOT_ATOMIC` | `IT-LLPG-004` | `U-LLPG-004` |
| `HST-CASE-030-05` | `ledger_current` | `quarantined` | `HIL_LAYER_EXTRACTION_NONDETERMINISTIC` | `IT-LLPG-005` | `U-LLPG-005` |
| `HST-CASE-030-06` | `ledger_current` | `stale` | `HIL_LAYER_TEMPLATE_VERSION_STALE` | `IT-LLPG-006` | `U-LLPG-006` |
| `HST-CASE-030-07` | `template_current` | `rejected` | `HIL_LAYER_TEMPLATE_FIELD_EMPTY` | `IT-LLPG-007` | `U-LLPG-007` |
| `HST-CASE-030-08` | `template_current` | `rejected` | `HIL_LAYER_TEMPLATE_PLACEHOLDER` | `IT-LLPG-008` | `U-LLPG-008` |
| `HST-CASE-030-09` | `template_current` | `rejected` | `HIL_LAYER_TEMPLATE_FIELD_UNKNOWN` | `IT-LLPG-009` | `U-LLPG-009` |
| `HST-CASE-030-10` | `ledger_staged` | `rejected` | `HIL_LAYER_OBLIGATION_DUPLICATE` | `IT-LLPG-010` | `U-LLPG-010` |
| `HST-CASE-030-11` | `ledger_current` | `failed` | `HIL_LAYER_AGGREGATE_ONLY` | `IT-LLPG-011` | `U-LLPG-011` |
| `HST-CASE-030-12` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_LEDGER_CHAIN_INCOMPLETE` | `IT-LLPG-012` | `U-LLPG-012` |
| `HST-CASE-030-13` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_LEDGER_TYPE_MISSING` | `IT-LLPG-013` | `U-LLPG-013` |
| `HST-CASE-030-14` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_TEMPLATE_EXTRACTION_EMPTY` | `IT-LLPG-014` | `U-LLPG-014` |
| `HST-CASE-030-15` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_LEDGER_COVERAGE_INVALID` | `IT-LLPG-015` | `U-LLPG-015` |
| `HST-CASE-031-01` | `ledger_ready` | `verified` | `なし（正常系）` | `IT-LLPG-016` | `U-LLPG-016` |
| `HST-CASE-031-02` | `ledger_ready` | `failed` | `HIL_LAYER_VERTICAL_DERIVED_FROM_MISSING` | `IT-LLPG-017` | `U-LLPG-017` |
| `HST-CASE-031-03` | `ledger_ready` | `failed` | `HIL_LAYER_VERTICAL_BACKPROP_MISSING` | `IT-LLPG-018` | `U-LLPG-018` |
| `HST-CASE-031-04` | `ledger_ready` | `stale` | `HIL_LAYER_VERTICAL_EDGE_STALE` | `IT-LLPG-019` | `U-LLPG-019` |
| `HST-CASE-031-05` | `ledger_ready` | `failed` | `HIL_LAYER_VERTICAL_ADJACENCY_BYPASS` | `IT-LLPG-020` | `U-LLPG-020` |
| `HST-CASE-031-06` | `ledger_ready` | `failed` | `HIL_LAYER_VERTICAL_GRANULARITY_INVALID` | `IT-LLPG-021` | `U-LLPG-021` |
| `HST-CASE-031-07` | `ledger_ready` | `stale` | `HIL_LAYER_VERTICAL_REVISION_MISMATCH` | `IT-LLPG-022` | `U-LLPG-022` |
| `HST-CASE-031-08` | `ledger_ready` | `stale` | `HIL_LAYER_VERTICAL_SNAPSHOT_MISMATCH` | `IT-LLPG-023` | `U-LLPG-023` |
| `HST-CASE-031-09` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_VERTICAL_PAIR_INCOMPLETE` | `IT-LLPG-024` | `U-LLPG-024` |
| `HST-CASE-032-01` | `ledger_ready` | `verified` | `なし（正常系）` | `IT-LLPG-025` | `U-LLPG-025` |
| `HST-CASE-032-02` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L0_L14_MISSING` | `IT-LLPG-026` | `U-LLPG-026` |
| `HST-CASE-032-03` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L1_L14_MISSING` | `IT-LLPG-027` | `U-LLPG-027` |
| `HST-CASE-032-04` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L2_L10_MISSING` | `IT-LLPG-028` | `U-LLPG-028` |
| `HST-CASE-032-05` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L3_L12_MISSING` | `IT-LLPG-029` | `U-LLPG-029` |
| `HST-CASE-032-06` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L4_L9_MISSING` | `IT-LLPG-030` | `U-LLPG-030` |
| `HST-CASE-032-07` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L5_L8_MISSING` | `IT-LLPG-031` | `U-LLPG-031` |
| `HST-CASE-032-08` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_L6_L7_MISSING` | `IT-LLPG-032` | `U-LLPG-032` |
| `HST-CASE-032-09` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_REVERSE_MISSING` | `IT-LLPG-033` | `U-LLPG-033` |
| `HST-CASE-032-10` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_ORACLE_MISMATCH` | `IT-LLPG-034` | `U-LLPG-034` |
| `HST-CASE-032-11` | `paired` | `paired` | `HIL_LAYER_VPAIR_EXECUTION_MISSING` | `IT-LLPG-035` | `U-LLPG-035` |
| `HST-CASE-032-12` | `ledger_ready` | `stale` | `HIL_LAYER_VPAIR_SNAPSHOT_MISMATCH` | `IT-LLPG-036` | `U-LLPG-036` |
| `HST-CASE-032-13` | `ledger_ready` | `failed` | `HIL_LAYER_VPAIR_FORWARD_MISSING` | `IT-LLPG-037` | `U-LLPG-037` |
| `HST-CASE-032-14` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_VPAIR_INCOMPLETE` | `IT-LLPG-038` | `U-LLPG-038` |
| `HST-CASE-033-01` | `diff_ready` | `candidate_created` | `なし（正常系）` | `IT-LLPG-039` | `U-LLPG-039` |
| `HST-CASE-033-02` | `diff_ready` | `rejected` | `HIL_LAYER_REFACTOR_DIFF_EMPTY` | `IT-LLPG-040` | `U-LLPG-040` |
| `HST-CASE-033-03` | `diff_ready` | `rejected` | `HIL_LAYER_REFACTOR_PROVENANCE_MISSING` | `IT-LLPG-041` | `U-LLPG-041` |
| `HST-CASE-033-04` | `candidate_created` | `candidate_created` | `HIL_LAYER_REFACTOR_CONSUMER_MISSING` | `IT-LLPG-042` | `U-LLPG-042` |
| `HST-CASE-033-05` | `candidate_created` | `rerouted` | `HIL_LAYER_REFACTOR_REDESIGN_REQUIRED` | `IT-LLPG-043` | `U-LLPG-043` |
| `HST-CASE-033-06` | `candidate_created` | `rerouted` | `HIL_LAYER_REFACTOR_RETROFIT_REQUIRED` | `IT-LLPG-044` | `U-LLPG-044` |
| `HST-CASE-033-07` | `candidate_created` | `verified` | `なし（正常系）` | `IT-LLPG-045` | `U-LLPG-045` |
| `HST-CASE-033-08` | `candidate_created` | `verified` | `なし（正常系）` | `IT-LLPG-046` | `U-LLPG-046` |
| `HST-CASE-033-09` | `candidate_created` | `verified` | `なし（正常系）` | `IT-LLPG-047` | `U-LLPG-047` |
| `HST-CASE-033-10` | `candidate_created` | `verified` | `なし（正常系）` | `IT-LLPG-048` | `U-LLPG-048` |
| `HST-CASE-033-11` | `candidate_created` | `rejected` | `HIL_LAYER_REFACTOR_PAIR_BROKEN` | `IT-LLPG-049` | `U-LLPG-049` |
| `HST-CASE-033-12` | `candidate_created` | `rerouted` | `HIL_LAYER_REFACTOR_REDESIGN_REQUIRED` | `IT-LLPG-050` | `U-LLPG-050` |
| `HST-CASE-033-13` | `candidate_created` | `candidate_created` | `HIL_LAYER_REFACTOR_ROLLBACK_MISSING` | `IT-LLPG-051` | `U-LLPG-051` |
| `HST-CASE-033-14` | `assertion_input_ready` | `assertion_pass` | `HIL_LAYER_LEDGER_REFACTOR_INVALID` | `IT-LLPG-052` | `U-LLPG-052` |

52/52をrangeなしで検証し、supporting caseを混入させない。

## §2 実装契約

| table | PK／必須field | unique／FK／不変条件 |
|---|---|---|
| layer_ledger_registry | layer_id、type/version、authority、entry/exit digest | layer+version unique、L0–L14欠落禁止 |
| `layer_obligation_rows`（義務台帳） | `row_id`、layer/revision、source kind/span、semantic digest、状態 | registry外部key、原子的、operation/digest一意 |
| vertical_pair_edges | edge_id、parent/child row revision、derived/backprop digest | 隣接layerのみ、双方向同revision |
| horizontal_vpair_edges | edge_id、design/verification revision、oracle、snapshot、execution receipt | canonical pairのみ、双方向current |
| design_refactor_candidates | candidate_id、before/after、consumer set、route、rollback | diff/provenance必須、behavior変更はreroute |
| design_progress_denominators | denominator ID、exact 19 slice ID、exact 76 artifact path/digest、canonical U 491/IT 376/HST 462 exact ID list/set digest、registry revision/digest、authority/freshness/supersession、source commit/tree/design snapshot、measurement command/version/time | immutable、current authorityだけ有効、supporting U/IT各S01は分母外 |
| design_stage_receipts | receipt ID/digest、denominator digest、stage、exact numerator slice ID/digest、evidence receipt ID/digest、snapshot | artifact_created/semantic_closed/independent_audited/pair_frozen/implementation_verifiedを独立row保存 |
| design_artifact_quartets | slice ID、exact 4 path/digest、quartet digest、source/design digest | 19 slice×4＝76、kind重複・欠落禁止 |
| design_audit_evidence | slice ID、author/reviewer runtime-model、policy/version、finding closure、quartet digest | runtime-model分離、open finding 0、currentのみ |
| design_pair_freeze_evidence | slice ID、L5↔L8 receipt、L6↔L7 receipt、quartet digest | sliceごとcurrent 2 receipt必須 |
| design_implementation_evidence | slice ID、canonical U/IT/HST集合digest、command/version/exit/output、source/design digest | 全oracle実行、exit 0、commit/tree一致 |
| design_progress_projections | denominator、5独立axis、numerator ID/digest/count/rate、execution補助軸、projection digest | inclusion invariantとreceipt exact join、stage混合禁止 |
| design_progress_terminal_receipts | operation/digest、evidence store revision/head vector、event/projection/terminal digest、before/after head | 単一CAS/reconcile、partial current禁止 |
| design_progress_stale_events | cause、changed subject、invalidated stage/receipt exact set、replacement receipt、supersession chain、before/after head | 当該＋全downstreamを同一eventでstale化 |

stateはtemplate_current→ledger_staged→ledger_current→ledger_ready、pairはpaired→verifiedまたはfailed/stale、refactorはdiff_ready→candidate_created→verified/rejected/reroutedを許可する。extraction+rows、pair edges+receipt、denominator+stage receiptは各々一つの複合payloadとしてtransaction化し、片側payloadやreceipt先行を禁止する。fault/CAS loser/異digest retryは増分0。

progress固定分母は`HDS-HIL-01`〜`08`、`09A`、`09B`、`10`〜`18`のexact 19 IDとregistry revision/digestへbindする。
5 stageは同じ分母を共有する独立axisで、分子はexact slice ID一覧、一覧digest、count、rate、evidence receipt ID/digestを持つ。
包含不変条件はimplementation_verified⊆pair_frozen⊆independent_audited⊆semantic_closed⊆artifact_createdである。
artifactはsliceごとの4 path/digest、auditはauthor/reviewer分離とfinding closure、freezeはsliceごとのcurrent 2 pair receipt、
implementationは全canonical U/IT/HSTの実行evidenceを要求する。U 491、IT 376、HST 462、quartet 867、全canonical 1,329を固定し、
`U-LLPG-S01`と`IT-LLPG-S01`はsupporting meta-oracle receiptで追跡するがcanonical分母へ加えない。

registry/denominator、artifact、audit policy/input、freeze、implementation commit/test/command、source tree、design digest変更時は、該当stageと
全後段stageを同一eventでstale化する。commit APIはdenominator/artifact/semantic/audit/freeze/implementation storeをcurrent再読し、generated event、
projection、terminal receiptを一つのCAS/reconcile payloadとして保存する。receipt swap、axis mixing、fake numerator、commit/tree drift、
missing receipt、projection不一致ではauthoritative count増分0とする。

`calculateFixedDesignProgress`、`commitDesignProgress`、`reconcileDesignProgress`は単一authority-owned atomic transaction portだけを受け取る。
同portがdenominator、artifact、semantic、audit、freeze、implementationの6 storeをtransaction内でcurrent再読し、revision/head vectorを
write直前に再検証してからgenerated event、projection、terminal receiptを一括commitする。個別storeや`commitCurrent`はpublic contractへ公開せず、
progressの唯一writerは同port経由の`commitDesignProgress`とする。generic `commitLayerLedgerOperation`のpayload unionにはprogress variantを置かず、
全vectorをCAS対象にしてTOCTOUを封鎖し、stale event、projection、terminal receiptをexactly-once reconcileする。

S01固定fixtureの全digestは`helix-llpg-s01-digest.v1`を使う。SHA-256、UTF-8（BOMなし）、LF (`0x0A`) record separator、
aggregate preimage末尾LFなし、ASCII byte昇順、重複拒否を共通規約とする。artifact content digestだけは対象fileのexact bytes
（file自身の末尾LFを含む）へSHA-256を適用する。集合digest、design snapshot、supporting receipt、terminal receiptのfield順・包含／除外と
nested依存順はL6 §3およびS01 manifest `digest_contract`を正本とし、glob、YAML serialization、object key順、locale sortで補完しない。

refactor candidate、Redesign/Retrofit reroute、pair再検証、rollback target、receiptを一つのNode transaction bundleでCAS commitする。
seal後projection faultは同一operation/digest/expected headsからreconcileし、candidateだけ、rerouteだけ、pairだけのpartial current化を禁止する。
52 primary caseはfixture/revision、execution API、fault位置、expected write set、case record SHA-256、実在fixture manifest artifact pathを持つcase manifestと52/52 exact joinする。将来の実装test fileは別receiptでbindする。

## §4 public API primary owner正本

15 public APIは次のprimary U/ITへ一意にbindする。52 primary caseの残余行とsupporting S01はowner APIへの
composition/mutationであり、API ownerまたはcanonical分母へ重複加算しない。

| public API | primary U | primary IT |
|---|---|---|
| `registerLayerLedgerType` | `U-LLPG-002` | `IT-LLPG-002` |
| `extractTemplateObligations` | `U-LLPG-001` | `IT-LLPG-001` |
| `appendLayerLedgerRow` | `U-LLPG-003` | `IT-LLPG-003` |
| `evaluateVerticalLedgerPair` | `U-LLPG-016` | `IT-LLPG-016` |
| `evaluateHorizontalVPair` | `U-LLPG-025` | `IT-LLPG-025` |
| `planLedgerDesignRefactor` | `U-LLPG-039` | `IT-LLPG-039` |
| `calculateFixedDesignProgress` | `U-LLPG-011` | `IT-LLPG-011` |
| `commitDesignProgress` | `U-LLPG-012` | `IT-LLPG-012` |
| `reconcileDesignProgress` | `U-LLPG-015` | `IT-LLPG-015` |
| `authorizeLayerStageTransition` | `U-LLPG-015` | `IT-LLPG-015` |
| `commitLayerLedgerOperation` | `U-LLPG-001` | `IT-LLPG-001` |
| `reconcileLayerLedgerOperation` | `U-LLPG-016` | `IT-LLPG-016` |
| `commitLedgerRefactorBundle` | `U-LLPG-039` | `IT-LLPG-039` |
| `reconcileLedgerRefactorBundle` | `U-LLPG-039` | `IT-LLPG-039` |
| `parseLayerLedgerWriteSet` | `U-LLPG-052` | `IT-LLPG-052` |

executable caseのAPI名とfixture pathはL6のclosed V1 unionだけを受理し、自由文字列をauthorityにしない。
