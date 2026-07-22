---
title: "HELIX L8結合テスト設計 — layer ledger pair gate"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/layer-ledger-pair-gate.md
next_pair_freeze: L5
---
# HELIX L8結合テスト設計 — 連鎖台帳・pair gate

isolated harness.db、固定registry/template/pair/snapshot/oracle fixtureを使い、各主ITでrow、edge、stage、分母、refactor receiptの増分を直接検証する。未実装である。

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

## §1 scenario検証表

| fixture | 操作 | assertion |
|---|---|---|
| L0–L14 template、空/TBD/unknown field | extraction | provenance付きatomic row、反例proposal 0 |
| missing backprop、bypass、旧revision | vertical gate | pair receipt 0、gap/stale exact |
| canonical 7 V-pair、片edge、oracle/snapshot差、未実行 | horizontal gate | execution済み同一snapshotだけverified |
| externalize/commonize/objectize/renameとbehavior/schema変更 | refactor | behavior不変だけverified、他はRedesign/Retrofit |
| denominator変更、aggregate親、fake green | progress | approved固定分母不変、5 stageを別率で返す |
| transaction各insert後faultとretry | commit | partial 0、same digest exactly-once、異digest 0 |

| `IT-LLPG-S01`（supporting） | isolated harness.dbのauthority-owned atomic transaction port配下6 evidence storeへexact 19 slice、76 artifact、canonical U 491/IT 360/quartet 851/HST 462/total 1,313を投入し、`calculateFixedDesignProgress`→`commitDesignProgress`→replayを実行する。count/list/digest/rate差、fake numerator、stale/superseded authority、receipt swap、axis mixing、missing receipt、author/reviewer同一runtime-model、sliceごとのfreeze receipt 2件未満、freeze slice/snapshot join差、包含逆転、U/IT S01混入、source commit/tree・design digest swap、projection差を個別投入する | current authorityとcurrent evidenceのexact joinだけ5独立axisを保存する。反例はtyped failure、generated event/projection/terminal receipt増分0。supporting meta-oracle receiptは`designed_not_implemented`、canonical分母外 |
| `IT-LLPG-S01`（supporting fault/reconcile） | 6 store read後とwrite直前revision再検証の間、event、projection、terminal receipt各append境界でfaultし、same operation/digest retry、異digest retry、CAS loser、低水準`commitCurrent`直呼びを投入する | 単一authority-owned atomic transaction portだけがcurrent再読・revision再検証・commitし、exactly-once収束する。public直呼び経路0、partial current 0、projection/terminal/replay digest一致。異digestとCAS loserは増分0 |
| `IT-LLPG-S01`（supporting stale cascade） | registry/denominator、artifact、audit policy/input、freeze、implementation commit/test/command、source tree、design digestを個別更新する | 当該stage＋全downstreamを同一eventでstale化し、upstreamは維持。旧receipt、旧quartet digest、旧command evidenceによる再昇格0 |

supporting fixture正本は`docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest`、fixture IDは
`llpg-progress-s01-v1`である。既存52 primary manifestへ混ぜず、manifest単体の固定commit/tree/design snapshot、exact 19 slice、76 path/content、
U 491/IT 360/HST 462 ID arrays/set digest、supporting U/IT S01 receipt digestと期待terminal receipt
`DPR-LLPG-S01-V1`をisolated harness.db投入前後に再計測する。
別実装loaderは`helix-llpg-s01-digest.v1`をmanifest `digest_contract`だけから解決する。UTF-8/BOMなし、LF separator、aggregate末尾LFなし、
ASCII byte sort、duplicate拒否、artifact `path<TAB>content_digest`、listed field以外除外を固定し、leaf→design→supporting→terminalの依存順で再計算する。
supporting receiptはreceipt IDとfixed design snapshot digestをU/IT ID、status、included flagと同じpreimageへ含め、別snapshot receiptの流用を拒否する。

| integration mutation（結合変異） | exact failure code | DB expected receipt |
|---|---|---|
| authority未承認または別authority | `HIL_LAYER_PROGRESS_DENOMINATOR_UNAUTHORIZED` | 0件 |
| 19/76・U 491/IT 360/HST 462 list/count/set digest差 | `HIL_LAYER_PROGRESS_DENOMINATOR_MISMATCH` | 0件 |
| fake numerator、包含逆転 | `HIL_LAYER_PROGRESS_STAGE_INCLUSION_INVALID` | 0件 |
| axis mixing、stage順序違反 | `HIL_LAYER_PROGRESS_STAGE_ORDER_INVALID` | 0件 |
| stale/superseded、commit/tree/design差 | `HIL_LAYER_PROGRESS_EVIDENCE_STALE` | 0件 |
| reviewer identity非分離 | `HIL_LAYER_PROGRESS_AUDITOR_NOT_INDEPENDENT` | 0件 |
| receipt swap/missing、freeze 2件未満 | `HIL_LAYER_PROGRESS_RECEIPT_MISMATCH` | 0件 |
| freeze slice ID／固定snapshot join差 | `HIL_LAYER_PROGRESS_RECEIPT_MISMATCH` | 0件 |
| count/list/digest/rateまたはprojection/replay差 | `HIL_LAYER_PROGRESS_PROJECTION_MISMATCH` | 0件 |
| supporting U/IT混入 | `HIL_LAYER_PROGRESS_SUPPORTING_INCLUDED` | 0件 |
| store vector CAS loser | `HIL_LAYER_TRANSACTION_CAS_CONFLICT` | 0件 |
| transaction port外の`commitCurrent`直呼び | contract上到達不能 | 0件 |
| preimage field順／sort／separator／末尾LF／除外field差 | `HIL_LAYER_MANIFEST_INVALID` | 0件 |
| supporting receipt ID／fixed snapshot swap | `HIL_LAYER_PROGRESS_RECEIPT_MISMATCH` | 0件 |
| append fault後same operation/digest reconcile | なし（正常収束） | `DPR-LLPG-S01-V1` 1件、projection/replay同digest |

## §2 52 case実行manifest

各primary rowへ`LayerLedgerExecutableCaseV1`をexact一件bindし、fixture/revision、実行API、fault位置、expected event/projection/
pair/pointer write set、case record SHA-256、実在fixture manifest artifact pathを埋める。runnerは52/52 exact join後に個別実行する。
refactor caseはcandidate/reroute/pair/rollback/receipt各append後faultとreconcileを明記し、partial current 0を測定する。将来の実装test fileは未作成であり、L7実装receipt前にgreenを主張しない。
fixture正本は`docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest`とする。

## §3 public API primary owner正本

15 public APIは次のprimary U/ITへ一意にbindする。52 primary caseの残余行とsupporting S01は各ownerの
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

integration runnerはL6のclosed API/pipeline unionとtyped fixture pathを使用し、未知API、暗黙alias、別pathを実行前に拒否する。
