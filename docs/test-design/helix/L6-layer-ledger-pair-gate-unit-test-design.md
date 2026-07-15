---
title: "HELIX L7単体テスト設計 — layer ledger pair gate"
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
pair_artifact: docs/design/helix/L6-function-design/layer-ledger-pair-gate.md
next_pair_freeze: L6
---
# HELIX L7単体テスト設計 — 連鎖台帳・pair gate

pure functionへ固定port resultを注入し、stale、分母改竄、片方向edge、adjacency bypass、snapshot/oracle不一致、未実行verification、fake completion、behavior変更refactorを個別に検証する。未実装である。

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

## §1 単体oracle検証表

各Uはregistry/template/row/pair/denominator revisionを固定し、case対応APIのstate、failure、stable digest/order、row/edge/receipt countをassertする。field、span、reverse edge、adjacency、oracle、snapshot、execution receipt、consumer、rollback、approvalを一つずつmutateする。stale、分母改竄、aggregate消込、fake completion、CAS loserは全authoritative count 0とする。

`U-LLPG-S01`はcanonical U分母外のsupporting meta-oracleで、receipt statusは`designed_not_implemented`とする。新U IDへ分割しない。

| oracle | exact API | fixture／mutation | 反証assertion |
|---|---|---|---|
| `U-LLPG-S01`（supporting） | `calculateFixedDesignProgress`、`commitDesignProgress`、`reconcileDesignProgress` | exact 19 slice、76 artifact、canonical U 475/IT 360/quartet 835/HST 411/total 1,246、5 stage receiptを正例とし、ID list欠落/重複/20件目、count/list/digest/rate不一致、fake numerator、stale/superseded authority、receipt swap、axis mixing、missing receipt、reviewer同一runtime-model、sliceごとのfreeze receipt 2件未満、freezeのslice/snapshot join差、包含逆転、supporting混入、source commit/treeまたはdesign digest swap、projection digest差を一つずつmutateする | 正例だけ5独立axisを返す。各反例はtyped failure、authoritative numerator/receipt増分0。artifact 19/19でも後段を推定しない。U/IT S01はmeta receiptに残るがcanonical list/count/digest/rateへ入らない |
| `U-LLPG-S01`（supporting fault） | `commitDesignProgress`、`reconcileDesignProgress` | atomic transaction port内部の6 store read後、revision再検証前、event/projection/terminal receipt append境界のfault、same operation/digest retry、異digest retry、event-head CAS loser、public `commitCurrent`探索 | authority-owned portが6 current evidenceを再読・write直前再検証し、generated event＋projection＋terminal receiptをexactly-once収束する。低水準直書きAPIはpublic contractに0、partial current 0、異digest/CAS loser増分0、replay projection digest一致 |

stale cascade fixtureはregistry/denominator、artifact、audit policy/input、freeze receipt、implementation commit/test/command、source tree、
design digestを個別変更し、当該stage＋全downstream stageが同一eventでstale、upstream unaffected、旧receipt再利用不可になることを検証する。

fixture正本は`docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest`、fixture IDは
`llpg-progress-s01-v1`である。同manifest単体に列挙したexact 19 ID list、76 path/content digest、U 475/IT 360/HST 411のexact ID array/set digest、
固定source commit/tree/design snapshot、supporting U/IT S01 receipt digestをfixture load時に再計測する。globや外部source文字列から分母を補完せず、
期待terminal receipt `DPR-LLPG-S01-V1`とdigestをfixture load時に再計測し、不一致なら実行前にfail-closeする。
loaderは`helix-llpg-s01-digest.v1`を独立実装し、UTF-8/BOMなし、LF separator、aggregate末尾LFなし、ASCII byte sort、duplicate 0を検査する。
artifact recordはexact `path<TAB>content_digest`で`slice_id`を除外する。leaf set→design→supporting→terminalの順で計算し、supporting preimageは
receipt ID、fixed design snapshot digest、U ID、IT ID、status、included flagの6 record、terminalはfixture IDからsupporting receipt digestまでの
L6 §3固定8 recordだけを使う。listed field以外、YAML key、count、algorithm名を暗黙に混ぜたloaderは正例として扱わない。

| mutation（変異） | exact failure code | expected receipt |
|---|---|---|
| authority欠落、未承認 | `HIL_LAYER_PROGRESS_DENOMINATOR_UNAUTHORIZED` | なし |
| 19/76、U 475、IT 360、HST 411のlist/count/set digest差 | `HIL_LAYER_PROGRESS_DENOMINATOR_MISMATCH` | なし |
| pair freezeのslice IDまたは固定snapshot join差 | `HIL_LAYER_PROGRESS_RECEIPT_MISMATCH` | なし |
| atomic port外の`commitCurrent`直呼びを試行 | 型／contract上到達不能 | なし |
| separator／sort／末尾LF／包含fieldを一つ変更 | `HIL_LAYER_MANIFEST_INVALID` | なし |
| supporting receipt IDまたはfixed snapshotをswap | `HIL_LAYER_PROGRESS_RECEIPT_MISMATCH` | なし |
| numerator偽造、前段にない後段ID、包含逆転 | `HIL_LAYER_PROGRESS_STAGE_INCLUSION_INVALID` | なし |
| stage順序違反、axis mixing | `HIL_LAYER_PROGRESS_STAGE_ORDER_INVALID` | なし |
| stale/superseded evidence、source commit/tree、design digest差 | `HIL_LAYER_PROGRESS_EVIDENCE_STALE` | なし |
| author/reviewer runtime-model同一 | `HIL_LAYER_PROGRESS_AUDITOR_NOT_INDEPENDENT` | なし |
| receipt欠落、swap、slice当たりfreeze receipt 2件未満 | `HIL_LAYER_PROGRESS_RECEIPT_MISMATCH` | なし |
| list/count/digestとrate、projection digest、replay差 | `HIL_LAYER_PROGRESS_PROJECTION_MISMATCH` | なし |
| U/IT S01のcanonical分母・分子混入 | `HIL_LAYER_PROGRESS_SUPPORTING_INCLUDED` | なし |
| store revision/head vector CAS loser | `HIL_LAYER_TRANSACTION_CAS_CONFLICT` | なし |
| event/projection/terminal append fault後のsame digest reconcile | なし（正常収束） | `DPR-LLPG-S01-V1` exactly once |

各primary U rowは`LayerLedgerExecutableCaseV1`と52/52 exact joinし、fixture revision、API、fault位置、expected write set、receipt digest、
fixture manifest artifact pathを個別検証する。refactor Uはcandidate、reroute、pair、rollback、receiptのcommit/reconcile faultを直接所有する。

## §2 executable case manifest実体

| case ID | fixture ID | revision | 実行API | fault位置 | 期待write set | case record SHA-256 | fixture manifest artifact path |
|---|---|---:|---|---|---|---|---|
| `HST-CASE-030-01` | `llpg-hst-case-030-01` | 1 | `commitLedgerRefactorBundle+reconcileLedgerRefactorBundle` | `after_candidate_append:reconcile` | `event+projection+receipt` | `sha256:86b5ce880e3313116efa042f770386e44ff65d2289edf0b54e5e9f2a8e89d69e` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-02` | `llpg-hst-case-030-02` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_REGISTRY_ENTRY_MISSING` | `none` | `sha256:606a30e5bbc2468efae4c87e8a67f800c206fa19108676871568e3ce10b3ac35` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-03` | `llpg-hst-case-030-03` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_OBLIGATION_PROVENANCE_MISSING` | `none` | `sha256:f789e0f347ba5b2327d1d7f721f4459d96b0ce7de29c48095e57f1205718c324` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-04` | `llpg-hst-case-030-04` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_OBLIGATION_NOT_ATOMIC` | `none` | `sha256:eab3e052fb98fb2c7ebb0a20428eb959c4407dadc0c13d6f79de44939b9da1d1` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-05` | `llpg-hst-case-030-05` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_EXTRACTION_NONDETERMINISTIC` | `none` | `sha256:2cf3c4b4c37f2643ed86fd6f1f6b177cb8a4d4efd3c3044adb1914df1b467858` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-06` | `llpg-hst-case-030-06` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_TEMPLATE_VERSION_STALE` | `none` | `sha256:e3995c59a97d5e2dcc3684e3cabf6d6804188391b62abbcb07ee05385eea385d` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-07` | `llpg-hst-case-030-07` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_TEMPLATE_FIELD_EMPTY` | `none` | `sha256:377bbac4ba491427009d6a43e694b3046f5b36b274b831dbd210190922eb37bd` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-08` | `llpg-hst-case-030-08` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_TEMPLATE_PLACEHOLDER` | `none` | `sha256:d71c9809a18e3929ae66f535e5eee1bb5eb01cc897d053f0ae1e17e29f987764` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-09` | `llpg-hst-case-030-09` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_TEMPLATE_FIELD_UNKNOWN` | `none` | `sha256:3025d8851827cdff77eefab8dc3e1f1ab7842ae9b0aecc54a3cf6e848e095237` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-10` | `llpg-hst-case-030-10` | 1 | `appendLayerLedgerRow` | `before_commit:HIL_LAYER_OBLIGATION_DUPLICATE` | `none` | `sha256:0905951d842668ead4ec13e04f19b7c609bcb0f09a2c03764a2eb8d6f8b7b3bb` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-11` | `llpg-hst-case-030-11` | 1 | `calculateFixedDesignProgress` | `before_commit:HIL_LAYER_AGGREGATE_ONLY` | `none` | `sha256:1fdd7fb7e565cb536a04fa56784bb1a0be3f582a03edbe8317ab278661fb9fed` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-12` | `llpg-hst-case-030-12` | 1 | `calculateFixedDesignProgress` | `before_commit:HIL_LAYER_LEDGER_CHAIN_INCOMPLETE` | `none` | `sha256:7d7d6979c23c7bc77f78c7dd7df0fcd0109d4b0e42742f996282a63a4e43a6a4` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-13` | `llpg-hst-case-030-13` | 1 | `calculateFixedDesignProgress` | `before_commit:HIL_LAYER_LEDGER_TYPE_MISSING` | `none` | `sha256:ee0b2ee9907e9ba82a06ac1c28577f7ab844c515629e70ce952a29cf752bdefe` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-14` | `llpg-hst-case-030-14` | 1 | `calculateFixedDesignProgress` | `before_commit:HIL_LAYER_TEMPLATE_EXTRACTION_EMPTY` | `none` | `sha256:fbe6358aa63ba159ee82e8a64768277f0cb0e5995228408c9fcaa1960ab1ac8e` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-030-15` | `llpg-hst-case-030-15` | 1 | `calculateFixedDesignProgress` | `before_commit:HIL_LAYER_LEDGER_COVERAGE_INVALID` | `none` | `sha256:eafdd5643cf4cd6e5a49116178b7feb9747371beedc1e2fe08d97fe16e50280c` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-01` | `llpg-hst-case-031-01` | 1 | `commitLedgerRefactorBundle+reconcileLedgerRefactorBundle` | `after_pair_edge_append:reconcile` | `event+projection+pair_receipt` | `sha256:2981da31d5724b3d7031f3f6e6c2bf23dbe25e9dbffe3c857243b6a442dc121d` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-02` | `llpg-hst-case-031-02` | 1 | `evaluateVerticalLedgerPair` | `before_commit:HIL_LAYER_VERTICAL_DERIVED_FROM_MISSING` | `none` | `sha256:2995dfb6decaaac32516db3b46ee9703fd96eb5792bb555d8ac5d82952a8b26d` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-03` | `llpg-hst-case-031-03` | 1 | `evaluateVerticalLedgerPair` | `before_commit:HIL_LAYER_VERTICAL_BACKPROP_MISSING` | `none` | `sha256:9efa4c6a177ef0beddd8a4a73d51a1a771550efde1ba0d7ceb1093f9d17cf5ba` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-04` | `llpg-hst-case-031-04` | 1 | `evaluateVerticalLedgerPair` | `before_commit:HIL_LAYER_VERTICAL_EDGE_STALE` | `none` | `sha256:e82ae9c7b46bb5608e0ffe31ade6e0c14352ecd3f67bb5359b783816259a1484` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-05` | `llpg-hst-case-031-05` | 1 | `evaluateVerticalLedgerPair` | `before_commit:HIL_LAYER_VERTICAL_ADJACENCY_BYPASS` | `none` | `sha256:bc643b5041d74bf48be5764c1359ae9b57c11ce6ce2030680726dc8e722b8d51` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-06` | `llpg-hst-case-031-06` | 1 | `evaluateVerticalLedgerPair` | `before_commit:HIL_LAYER_VERTICAL_GRANULARITY_INVALID` | `none` | `sha256:2343842dac21f31808c6bbb1bcf470660f8fb90fc73685a91ba4996e0656bd67` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-07` | `llpg-hst-case-031-07` | 1 | `evaluateVerticalLedgerPair` | `before_commit:HIL_LAYER_VERTICAL_REVISION_MISMATCH` | `none` | `sha256:a33a0434f036232a77603ce8982f1130db693f7a421ed5d2f54972741234d78c` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-08` | `llpg-hst-case-031-08` | 1 | `evaluateVerticalLedgerPair` | `before_commit:HIL_LAYER_VERTICAL_SNAPSHOT_MISMATCH` | `none` | `sha256:7b30200f201324af28ed118c4088a30f5f9be9b8f0780f95c35668fe3187dd3a` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-031-09` | `llpg-hst-case-031-09` | 1 | `evaluateVerticalLedgerPair` | `before_commit:HIL_LAYER_VERTICAL_PAIR_INCOMPLETE` | `none` | `sha256:eb2c5d0bd7efb6d29eb7c7d30c32ed41dacf8b2e44d2bcad07519a6ef9d6177f` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-01` | `llpg-hst-case-032-01` | 1 | `commitLedgerRefactorBundle+reconcileLedgerRefactorBundle` | `after_pair_receipt_append:reconcile` | `event+projection+pair_receipt` | `sha256:25f74571d4de780b9fb30acfe7cbcf83dd05729b3d594ddf03ada596af190204` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-02` | `llpg-hst-case-032-02` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_L0_L14_MISSING` | `none` | `sha256:601507f15bc6ea8eb6384e1ca481b503e04e8cc4e4eb1d159aaffe7110639f1d` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-03` | `llpg-hst-case-032-03` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_L1_L14_MISSING` | `none` | `sha256:bdee1d027a19d6210043b7fb2a92f5b58ed803aa85b900b955bc04eb7a02db6c` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-04` | `llpg-hst-case-032-04` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_L2_L10_MISSING` | `none` | `sha256:4fd294f6dedb14e969472079d7f4b26d39cf9c2618284749e4df14dd1c04563f` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-05` | `llpg-hst-case-032-05` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_L3_L12_MISSING` | `none` | `sha256:5ab88f9a0cb282eb435fe1b1e029b0d7946ede1ebd3bc40b1a6cabe08fa929e2` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-06` | `llpg-hst-case-032-06` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_L4_L9_MISSING` | `none` | `sha256:a4785857f967201806a2a586bf9e964b37f705935f3e28fba7eaa8be4c4319cb` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-07` | `llpg-hst-case-032-07` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_L5_L8_MISSING` | `none` | `sha256:9614c5d8252178963ab769d77738bd31c3894dbf12861474d82ed4bad5165968` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-08` | `llpg-hst-case-032-08` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_L6_L7_MISSING` | `none` | `sha256:67fb17b9f6d7ad854c6bba9206ef051f3dc3c6a89a3060f22b1a6ca47305da38` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-09` | `llpg-hst-case-032-09` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_REVERSE_MISSING` | `none` | `sha256:68075061ca1793f06b0990119f5e033d5db54375d128973b540300f898660590` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-10` | `llpg-hst-case-032-10` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_ORACLE_MISMATCH` | `none` | `sha256:b444403990fa89d2ac4426184426897715070709c5d3ee4cef83417ba5a77a12` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-11` | `llpg-hst-case-032-11` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_EXECUTION_MISSING` | `none` | `sha256:dbb10c149c787574a901d7713ce62f7aaae36681188633d1a3cf388432f9345d` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-12` | `llpg-hst-case-032-12` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_SNAPSHOT_MISMATCH` | `none` | `sha256:dac7e74e74558e87c007f2268cc96b9c8c0ed75e589680f03106ac2aa28790c8` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-13` | `llpg-hst-case-032-13` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_FORWARD_MISSING` | `none` | `sha256:2e7f0cfea164e25b3ffc1266a4c9104753d6f485c0290aadd197b9800c296089` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-032-14` | `llpg-hst-case-032-14` | 1 | `evaluateHorizontalVPair` | `before_commit:HIL_LAYER_VPAIR_INCOMPLETE` | `none` | `sha256:0af45ec9f9a19d00c59b0f448ba189a991513193e94afdf5e275ceb1da6384fd` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-01` | `llpg-hst-case-033-01` | 1 | `commitLedgerRefactorBundle+reconcileLedgerRefactorBundle` | `after_reroute_append:reconcile` | `event+projection+pair_receipt+receipt` | `sha256:4f581d3a4bb9f61ce7d6f6835c92f8d81202b5e2cf8bbcd4cb59fd5b9348960c` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-02` | `llpg-hst-case-033-02` | 1 | `planLedgerDesignRefactor` | `before_commit:HIL_LAYER_REFACTOR_DIFF_EMPTY` | `none` | `sha256:e26e1665c872378fb1739ca9a25c0af03fa7548a6ff6b61f5704c97cad6331e4` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-03` | `llpg-hst-case-033-03` | 1 | `planLedgerDesignRefactor` | `before_commit:HIL_LAYER_REFACTOR_PROVENANCE_MISSING` | `none` | `sha256:421119c43186023681c77fe24465bf69633d70823655a3a60dfd7e0edd629d92` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-04` | `llpg-hst-case-033-04` | 1 | `planLedgerDesignRefactor` | `before_commit:HIL_LAYER_REFACTOR_CONSUMER_MISSING` | `none` | `sha256:9dca6f5dd078fad82fb52259fb833813c1a1d188ecb889bf9abaac6c98df44fd` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-05` | `llpg-hst-case-033-05` | 1 | `commitLedgerRefactorBundle` | `before_commit:HIL_LAYER_REFACTOR_REDESIGN_REQUIRED` | `none` | `sha256:23ed7607b9f9004db04707a021e227eaad85e0604918572bd2189db09fcfd46d` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-06` | `llpg-hst-case-033-06` | 1 | `commitLedgerRefactorBundle` | `before_commit:HIL_LAYER_REFACTOR_RETROFIT_REQUIRED` | `none` | `sha256:f15b313588ed31ea9739565b0c1aa16c534c526a7aeae9c712d3be9e9e16b67a` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-07` | `llpg-hst-case-033-07` | 1 | `commitLedgerRefactorBundle+reconcileLedgerRefactorBundle` | `after_rollback_append:reconcile` | `event+projection+pair_receipt+receipt` | `sha256:12128b7cc5f713664f47aeb1bbeff919372b7a0ae337eeaf076f397b90afd89e` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-08` | `llpg-hst-case-033-08` | 1 | `commitLedgerRefactorBundle+reconcileLedgerRefactorBundle` | `after_terminal_receipt_append:reconcile` | `event+projection+pair_receipt+receipt` | `sha256:18581eb0ef1f162e02f48ee29c99e91300bbb01257b2ab1e7df77075d1a5b606` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-09` | `llpg-hst-case-033-09` | 1 | `reconcileLedgerRefactorBundle` | `none` | `event+projection+pair_receipt+receipt` | `sha256:b10d17bf79ab54bca2a3c534d0d9b2cebc90b8ed7d9c94aacf5dd479fa57a8ce` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-10` | `llpg-hst-case-033-10` | 1 | `reconcileLedgerRefactorBundle` | `none` | `event+projection+pair_receipt+receipt` | `sha256:979bd74dbb5cee32a956b6b88ac7d6453c99b3b00ca95d530aa7c4c41ae2e058` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-11` | `llpg-hst-case-033-11` | 1 | `reconcileLedgerRefactorBundle` | `before_commit:HIL_LAYER_REFACTOR_PAIR_BROKEN` | `none` | `sha256:356a871df1c5baf9bb8049f2b1a895ac3e7f479dd945c4bb8c5202dd671d6700` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-12` | `llpg-hst-case-033-12` | 1 | `reconcileLedgerRefactorBundle` | `before_commit:HIL_LAYER_REFACTOR_REDESIGN_REQUIRED` | `none` | `sha256:b6e9b10c51515549305adcedea47abc31dc1d16164af98ffe2398cccb50320ee` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-13` | `llpg-hst-case-033-13` | 1 | `commitLedgerRefactorBundle` | `before_commit:HIL_LAYER_REFACTOR_ROLLBACK_MISSING` | `none` | `sha256:6ec86663e35d82f20bd5e50462c36bb5b9d06218048eff43a2066bf443085b9f` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |
| `HST-CASE-033-14` | `llpg-hst-case-033-14` | 1 | `commitLedgerRefactorBundle` | `before_commit:HIL_LAYER_LEDGER_REFACTOR_INVALID` | `none` | `sha256:d9c4b618709db88deedbec10c06b7af81865085da42da3d3128d441b791982e6` | `docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest` |

## §3 public API primary owner正本

15 public APIは次のprimary U/ITへ一意にbindする。52 primary caseの残余行とsupporting S01は各ownerの
composition/mutationとして実行し、第2 ownerまたはcanonical分母にしない。

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

runnerはL6のclosed API/pipeline unionとtyped fixture pathへexact joinし、未知API、alias、空名、別pathをfixture load前に拒否する。
