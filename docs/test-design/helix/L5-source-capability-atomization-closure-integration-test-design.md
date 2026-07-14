---
title: "HELIX L8 結合テスト設計 — source capability atomization closure"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-09B
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-020
pair_artifact: docs/design/helix/L5-detail/source-capability-atomization-closure.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-09
  - HAC-HIL-09a
  - HAC-HIL-09b
  - HAC-HIL-09c
---

# HELIX L8 結合テスト設計 — source capability atomization closure

| ID | HAC／supporting境界 | 結合scenario | 期待結果／failure token |
|---|---|---|---|
| `IT-SATOM-001` | `HAC-HIL-09a`; atomization内部oracle | active captureの全4,470 entryをdispatch | 正常完了。未処理は`HIL_SOURCE_ATOMIZATION_INCOMPLETE` |
| `IT-SATOM-002` | `HAC-HIL-09a`; atomization内部oracle | TS/Markdown/YAML/workflow Node pluginを実行 | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。plugin欠落は詳細cause `HIL_SOURCE_EXTRACTOR_PLUGIN_UNREGISTERED` |
| `IT-SATOM-003` | `HAC-HIL-09b`; `HST-CASE-008-12` | ZIP由来Python pluginをworker経由実行 | Node commitだけを許可し、違反は`HIL_PYTHON_AUTHORITY_BYPASS` |
| `IT-SATOM-004` | `HAC-HIL-09c`; atomization内部oracle | 同snapshot/plugin/configを再実行 | canonical `HIL_SOURCE_ATOM_EXTRACTOR_STALE`。同入力の差異は`HIL_SOURCE_EXTRACTOR_NONDETERMINISTIC` |
| `IT-SATOM-005` | `HAC-HIL-09b`; atomization内部oracle | 複合sourceをatomic split | 複合は`HIL_SOURCE_ATOM_NOT_ATOMIC`、overlapは`HIL_SOURCE_ATOM_OVERLAP` |
| `IT-SATOM-006` | `HAC-HIL-09a`; atomization内部oracle | ZIP `build/` 427 entryを処理 | 個別fixture lineage。水増しは`HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID` |
| `IT-SATOM-007` | `HAC-HIL-09a`; `HST-CASE-011-05`, `HST-CASE-011-07` | 6 decision routeを実行 | pendingは`HIL_SOURCE_DECISION_PENDING`、根拠なしrejectは`HIL_SOURCE_REJECT_UNJUSTIFIED` |
| `IT-SATOM-008` | `HAC-HIL-09a`; `HST-CASE-011-06` | branch overlayをabsorbed候補へ送る | canonical `HIL_SOURCE_ATOM_ORPHAN`。target同一性不足は`HIL_SOURCE_ABSORPTION_UNPROVEN` |
| `IT-SATOM-009` | `HAC-HIL-09a`; `HST-CASE-011-01` | dispositionからcoverage closureを生成 | canonicalは`なし（正常系）`。正逆join欠落は詳細cause `HIL_SOURCE_ATOM_ORPHAN` |
| `IT-SATOM-010` | `HAC-HIL-09b`; `HST-CASE-011-05`, `HST-CASE-011-06`, `HST-CASE-011-07` | orphan/pending/reject不足/aggregate-onlyを注入 | pointer別に`HIL_SOURCE_AGGREGATE_ONLY`、`HIL_SOURCE_DECISION_PENDING`、`HIL_SOURCE_ATOM_ORPHAN`、`HIL_SOURCE_REJECT_UNJUSTIFIED`でpair-freeze 0 |
| `IT-SATOM-011` | `HAC-HIL-09c`; `HST-CASE-011-02` | source/plugin/config/targetをdrift | pointer別に`HIL_SOURCE_ATOM_EXTRACTOR_STALE`、`HIL_SOURCE_SNAPSHOT_STALE`。edge詳細は`HIL_SOURCE_EDGE_STALE` |
| `IT-SATOM-012` | `HAC-HIL-09b`; `HST-CASE-007-06`, `HST-CASE-007-08`, `HST-CASE-007-11`; atomization内部fault oracle | workerとatomization commitへfault injection | worker pointerは`HIL_WORKER_TIMEOUT`、`HIL_WORKER_CRASHED`、`HIL_WORKER_LATE_RESULT_FENCED`。atomization固有faultは`HIL_SOURCE_PROPOSAL_LATE`または`HIL_SOURCE_ATOMIZATION_INTERNAL_ERROR`であり、engine HSTを代用しない |
| `IT-SATOM-013` | `HAC-HIL-09b`; atomization transaction内部oracle | atom/decision/edge/event/projection/exact write-set欠落・余剰とseal後DB faultを注入しreconcile | 完全payloadだけactive。初回faultは`projection_pending`、同一reconcileは同一receipt、別digest/head/順序/write-set競合はcommit 0 |

## §1 HST020主系の原子tuple

| HSTケース | L8対応先 | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-020-01` | `IT-SATOM-001` | `snapshot_current` | `atoms_current` | `なし（正常系）` |
| `HST-CASE-020-02` | `IT-SATOM-010` | `atoms_partial` | `failed` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-020-03` | `IT-SATOM-010` | `atoms_partial` | `failed` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-020-04` | `IT-SATOM-005` | `staged` | `rejected` | `HIL_SOURCE_ATOM_NOT_ATOMIC` |
| `HST-CASE-020-05` | `IT-SATOM-007` | `atoms_partial` | `failed` | `HIL_SOURCE_ATOM_UNCLASSIFIED` |
| `HST-CASE-020-06` | `IT-SATOM-005` | `staged` | `rejected` | `HIL_SOURCE_ATOM_OVERLAP` |
| `HST-CASE-020-07` | `IT-SATOM-011` | `atoms_current` | `stale` | `HIL_SOURCE_ATOM_EXTRACTOR_STALE` |
| `HST-CASE-020-08` | `IT-SATOM-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_ATOMIZATION_INCOMPLETE` |
| `HST-CASE-020-09` | `IT-SATOM-006` | `assertion_input_ready` | `assertion_pass` | `HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID` |

全caseでsnapshot、plugin/config/schema、command、exit、stdout/stderr、artifact、event、DB query digestを保存する。
13/13未実装であり、HST greenや代表entryだけではL8合格にしない。

### 閉鎖transactionのfault oracle

`IT-SATOM-013`はatom/decision/edge/event/projectionを一件ずつ欠落・入替し、FK、behavior weight、absorbed target、event head、exact write-setを検査する。各DB append直後fault、stale revision、CAS競合では全row/current/receipt増分0、seal後faultだけ同一bundleの`projection_pending`からreconcile可能とする。
