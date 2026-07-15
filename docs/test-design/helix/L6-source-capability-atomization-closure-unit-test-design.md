---
title: "HELIX L7 単体テスト設計 — source capability atomization closure"
layer: L6
executed_at_layer: L7
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
pair_artifact: docs/design/helix/L6-function-design/source-capability-atomization-closure.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-09
  - HAC-HIL-09a
  - HAC-HIL-09b
  - HAC-HIL-09c
---

# HELIX L7 単体テスト設計 — source capability atomization closure

| ID | 対象 | HAC trace | HST trace | 反例と期待結果／failure token |
|---|---|---|---|---|
| `U-SATOM-001` | plugin manifest | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。manifest欠落は詳細cause `HIL_SOURCE_EXTRACTOR_PLUGIN_UNREGISTERED` |
| `U-SATOM-002` | plugin selection | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。supported entryはexactly-one、0件は`HIL_SOURCE_EXTRACTOR_PLUGIN_UNREGISTERED` |
| `U-SATOM-003` | unsupported/ambiguous | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。0件は`HIL_SOURCE_EXTRACTOR_PLUGIN_UNREGISTERED`、複数は`HIL_SOURCE_EXTRACTOR_PLUGIN_AMBIGUOUS` |
| `U-SATOM-004` | Python handshake | `HAC-HIL-09a` | `HST-CASE-007-02` | canonical `HIL_WORKER_PROTOCOL_VERSION_UNSUPPORTED`を詳細cause `HIL_SOURCE_EXTRACTOR_PROTOCOL_INVALID`へ保持して拒否 |
| `U-SATOM-005` | sequence/terminal | `HAC-HIL-09a` | `HST-CASE-007-05` | canonical `HIL_WORKER_SEQUENCE_GAP`を詳細cause `HIL_SOURCE_EXTRACTOR_PROTOCOL_INVALID`へ保持して拒否 |
| `U-SATOM-006` | payload/source digest | `HAC-HIL-09a`, `HAC-HIL-09c` | `HST-CASE-007-12` | canonical `HIL_WORKER_PAYLOAD_DIGEST_MISMATCH`。別snapshot/blobは`HIL_SOURCE_PROPOSAL_STALE` |
| `U-SATOM-007` | oversize/backpressure | `HAC-HIL-09a` | `HST-CASE-007-04`, `HST-CASE-007-09` | 各pointerを`HIL_WORKER_PAYLOAD_OVERSIZE`、`HIL_WORKER_BACKPRESSURE_EXCEEDED`へ分離し、詳細cause `HIL_SOURCE_EXTRACTOR_PROTOCOL_INVALID`でcommit 0 |
| `U-SATOM-008` | timeout/cancel/late | `HAC-HIL-09a`, `HAC-HIL-09c` | `HST-CASE-007-06`, `HST-CASE-007-07`, `HST-CASE-007-11` | 各pointerを`HIL_WORKER_TIMEOUT`、`HIL_WORKER_CANCELLED`、`HIL_WORKER_LATE_RESULT_FENCED`へ分離し、fencing後proposalは`HIL_SOURCE_PROPOSAL_LATE` |
| `U-SATOM-009` | Python authority | `HAC-HIL-09b` | `HST-CASE-008-12` | DB/repo/pointer write企図を`HIL_PYTHON_AUTHORITY_BYPASS`で隔離 |
| `U-SATOM-010` | proposal binding | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。entry/plugin/run/config不一致は`HIL_SOURCE_PROPOSAL_STALE` |
| `U-SATOM-011` | source span | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | bounds/digest欠落をcanonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`で拒否 |
| `U-SATOM-012` | proposal determinism | `HAC-HIL-09c` | atomization内部oracle | canonical `HIL_SOURCE_ATOM_EXTRACTOR_STALE`。同入力のdigest差は`HIL_SOURCE_EXTRACTOR_NONDETERMINISTIC` |
| `U-SATOM-013` | trigger split | `HAC-HIL-09b` | atomization内部oracle | 独立trigger混在を`HIL_SOURCE_ATOM_NOT_ATOMIC`で拒否 |
| `U-SATOM-014` | effect authority split | `HAC-HIL-09b` | atomization内部oracle | 別authority副作用混在を`HIL_SOURCE_ATOM_NOT_ATOMIC`で拒否 |
| `U-SATOM-015` | failure/state split | `HAC-HIL-09b` | atomization内部oracle | 独立failure/state混在を`HIL_SOURCE_ATOM_NOT_ATOMIC`で拒否 |
| `U-SATOM-016` | over-split防止 | `HAC-HIL-09b` | atomization内部oracle | 不可分契約の過分割を`HIL_SOURCE_ATOM_NOT_ATOMIC`で拒否 |
| `U-SATOM-017` | extraction empty | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。0候補は`HIL_SOURCE_ATOM_EXTRACTION_EMPTY` |
| `U-SATOM-018` | span保存則 | `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOM_OVERLAP`。gapは詳細cause `HIL_SOURCE_ATOMIZATION_INCOMPLETE` |
| `U-SATOM-019` | lexical independence | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。lexical依存signatureは`HIL_SOURCE_SEMANTIC_SIGNATURE_INVALID` |
| `U-SATOM-020` | semantic difference | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。意味差を潰すsignatureは`HIL_SOURCE_SEMANTIC_SIGNATURE_INVALID` |
| `U-SATOM-021` | collision | `HAC-HIL-09a`, `HAC-HIL-09b` | atomization内部oracle | canonical `HIL_SOURCE_ATOMIZATION_INCOMPLETE`。hash一致・IR不一致は`HIL_SOURCE_SEMANTIC_SIGNATURE_COLLISION` |
| `U-SATOM-022` | atom kind | `HAC-HIL-09b` | atomization内部oracle | kind 0/複数を`HIL_SOURCE_ATOM_UNCLASSIFIED`で拒否 |
| `U-SATOM-023` | fixture lineage | `HAC-HIL-09b` | `HST-CASE-011-11` | canonical `HIL_SOURCE_COMPLETENESS_UNPROVEN`。producer/assertion欠落は`HIL_SOURCE_FIXTURE_ORPHAN` |
| `U-SATOM-024` | covered weight | `HAC-HIL-09b` | atomization内部oracle | 両pointerともaggregate算入を`HIL_SOURCE_AGGREGATE_ONLY`で拒否 |
| `U-SATOM-025` | current decision | `HAC-HIL-09b` | `HST-CASE-011-05` | pendingを`HIL_SOURCE_DECISION_PENDING`でblocking |
| `U-SATOM-026` | adopt/harden/redesign | `HAC-HIL-09a` | `HST-CASE-011-01` | canonicalは`なし（正常系）`。route証拠不足は詳細cause `HIL_SOURCE_ATOM_ORPHAN` |
| `U-SATOM-027` | reject | `HAC-HIL-09b` | `HST-CASE-011-07` | 根拠不足を`HIL_SOURCE_REJECT_UNJUSTIFIED`で拒否 |
| `U-SATOM-028` | absorbed | `HAC-HIL-09b` | `HST-CASE-011-06` | canonical `HIL_SOURCE_ATOM_ORPHAN`。target/identity不足は`HIL_SOURCE_ABSORPTION_UNPROVEN` |
| `U-SATOM-029` | coverage chain | `HAC-HIL-09a` | `HST-CASE-011-01` | canonicalは`なし（正常系）`。chain欠落は詳細cause `HIL_SOURCE_ATOM_ORPHAN` |
| `U-SATOM-030` | missing/stale target | `HAC-HIL-09b`, `HAC-HIL-09c` | `HST-CASE-011-06`, `HST-CASE-011-02` | pointer別にtarget不在は`HIL_SOURCE_ATOM_ORPHAN`、snapshot driftは`HIL_SOURCE_SNAPSHOT_STALE`。edge詳細は`HIL_SOURCE_EDGE_STALE` |
| `U-SATOM-031` | denominator | `HAC-HIL-09b` | atomization内部oracle | 分母混同を`HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID`で拒否 |
| `U-SATOM-032` | invalidation | `HAC-HIL-09c` | atomization内部oracle | extractor等のdriftを`HIL_SOURCE_ATOM_EXTRACTOR_STALE`へ遷移 |
| `U-SATOM-033` | Node projection commit | `HAC-HIL-09b` | atomization内部oracle | atom/decision/edge/event/projection payload、exact write-set、operation/digest/expected headsを検査し、欠落/余剰payloadと各step faultはcommit 0 |
| `U-SATOM-034` | reconcile/activate | `HAC-HIL-09b`, `HAC-HIL-09c` | atomization内部oracle | 同一bundle replayだけを許可し、projection検証前active化、暗黙rewrite、順序違反を`HIL_SOURCE_ATOMIZATION_INTERNAL_ERROR`で拒否 |

### complete public API→U→IT逆引き

全input/outputのexact V1 signatureはpair先L6 §1.2/§2を正本とし、34 Uの各mutation laneを次の14 APIへ固定する。

| 公開API | 主owner U | 既存IT |
|---|---|---|
| `parseExtractorDescriptor` | `U-SATOM-001` | `IT-SATOM-002` |
| `selectExtractorPlugin` | `U-SATOM-002` | `IT-SATOM-002` |
| `openExtractorSession` | `U-SATOM-004` | `IT-SATOM-003` |
| `advanceExtractorProtocol` | `U-SATOM-005` | `IT-SATOM-003`, `IT-SATOM-012` |
| `validateAtomProposal` | `U-SATOM-010` | `IT-SATOM-002`, `IT-SATOM-003`, `IT-SATOM-004` |
| `splitAtomicCandidate` | `U-SATOM-013` | `IT-SATOM-005`, `IT-SATOM-006` |
| `deriveSemanticSignature` | `U-SATOM-019` | `IT-SATOM-004`, `IT-SATOM-005` |
| `resolveAtomKindAndLineage` | `U-SATOM-022` | `IT-SATOM-006`, `IT-SATOM-007`, `IT-SATOM-010` |
| `validateCapabilityDecision` | `U-SATOM-025` | `IT-SATOM-007`, `IT-SATOM-008`, `IT-SATOM-010` |
| `resolveCoverageClosure` | `U-SATOM-029` | `IT-SATOM-009`, `IT-SATOM-010`, `IT-SATOM-011` |
| `computeAtomizationCoverage` | `U-SATOM-031` | `IT-SATOM-001`, `IT-SATOM-006`, `IT-SATOM-010` |
| `invalidateAtomizationReceipt` | `U-SATOM-032` | `IT-SATOM-011` |
| `commitAtomizationProjection` | `U-SATOM-033` | `IT-SATOM-013` |
| `reconcileAndActivateAtomization` | `U-SATOM-034` | `IT-SATOM-013` |

primary owner外の`U-SATOM-003`,`006`〜`009`,`011`〜`012`,`014`〜`018`,`020`〜`021`,`023`〜`024`,`026`〜`028`,`030`はcomposition／mutation／supporting laneとして34 U分母に残し、owner joinへ重複加算しない。

## §1 HST020主系のunit tuple

| HSTケース | L7 unit oracle | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-020-01` | `U-SATOM-031` | `snapshot_current` | `atoms_current` | `なし（正常系）` |
| `HST-CASE-020-02` | `U-SATOM-024` | `atoms_partial` | `failed` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-020-03` | `U-SATOM-024` | `atoms_partial` | `failed` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-020-04` | `U-SATOM-013` | `staged` | `rejected` | `HIL_SOURCE_ATOM_NOT_ATOMIC` |
| `HST-CASE-020-05` | `U-SATOM-022` | `atoms_partial` | `failed` | `HIL_SOURCE_ATOM_UNCLASSIFIED` |
| `HST-CASE-020-06` | `U-SATOM-018` | `staged` | `rejected` | `HIL_SOURCE_ATOM_OVERLAP` |
| `HST-CASE-020-07` | `U-SATOM-032` | `atoms_current` | `stale` | `HIL_SOURCE_ATOM_EXTRACTOR_STALE` |
| `HST-CASE-020-08` | `U-SATOM-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_ATOMIZATION_INCOMPLETE` |
| `HST-CASE-020-09` | `U-SATOM-031` | `assertion_input_ready` | `assertion_pass` | `HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID` |

34/34未実装である。各testはfailure code、write count、canonical bytes、before/after stateを直接assertし、
mock call成功だけをgreenにしない。

`U-SATOM-033`/`U-SATOM-034`は`SourceAtomV1`のweight、`CapabilityDecisionRevisionV1`のabsorbed exactly-one、edge FK/digest、event sequence/head、projection root、exact write-setをfield単位でmutationする。payload swap、caller digest偽装、stale/CAS/faultの全反例でwrite count 0を直接assertする。
