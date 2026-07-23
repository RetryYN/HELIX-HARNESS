---
title: "Scrum差分→V逆流 entity/state machine 受入テスト設計（FeatureSlice系）"
layer: L3
artifact_type: test_design
status: draft
created: 2026-07-21
updated: 2026-07-21
owner: QA
plan: PLAN-L3-16-scrum-reverse-entity-requirements
pair_artifact: docs/design/helix/L3-requirements/scrum-reverse-entity-model.md
executed_at_layer: L10
legacy_executed_at_layer: L12
canonical_layer_scheme: L1-L12
---

# Scrum差分→V逆流 entity/state machine 受入テスト設計（FeatureSlice系）

- pair: `docs/design/helix/L3-requirements/scrum-reverse-entity-model.md`
- status: draft
- 実行層: L10（canonical pair `L3↔L10`。旧L12表記はcompatibility metadataに限定）
- 起票: `docs/plans/PLAN-L3-16-scrum-reverse-entity-requirements.md`

## §1 AC 合格条件表

| AC | 合格条件 |
|---|---|
| SRV-AC-101 | 4 entity 分の projection query で `FeatureSlice`／`ReverseDerivation`／`ProvisionalVProjection`／`CanonicalVPublication` を個別に取得でき、単一集約値（%やフラグ）へ縮退した read modelが存在しない |
| SRV-AC-102 | `ReverseDerivation.state ≠ pair_frozen` の `FeatureSlice` に対する `-> release_ready` 遷移要求が全件拒否される |
| SRV-AC-103 | SR段階の飛越・別HEAD・別evidence snapshotを持つ `ReverseDerivation` 遷移要求が全件拒否される |
| SRV-AC-104 | `proposal_routed` fixture がREDESIGN／DESIGN_REFACTOR／PERFORMANCE_REFACTOR／RETROFITのうちexactly oneに分類され、0件または複数件routeのfixtureが拒否される |
| SRV-AC-105 | `ProvisionalVProjection` を参照する `release_ready` 遷移要求・要件反映requestが全件拒否される |
| SRV-AC-106 | `ProvisionalVProjection` に対する `published` 相当への遷移要求が定義上存在せず（stateenum外）、fixtureが全件schema failする |
| SRV-AC-107 | SR4 receiptを持たない `CanonicalVPublication.none -> published` 遷移要求が全件拒否される |
| SRV-AC-108 | `stale` 状態の `CanonicalVPublication` を参照する `FeatureSlice.release_ready` 遷移要求が全件拒否される |
| SRV-AC-109 | `FeatureSlice` から対応V資産までの逆引きtraceでorphanが0件である |
| SRV-AC-110 | `scrum_slice_ready` の4項いずれかがfalseのfixtureで、式全体がfalseになる |
| SRV-AC-111 | 4 entityの状態history がappend-only eventから再構築可能であり、in-place update経路が存在しない |
| SRV-AC-112 | `glossary-ssot.md` に4 entity名と状態enumが登録されている |

## §2 遷移oracle: SR4 receiptなし `CanonicalVPublication` 遷移拒否（SRV-AC-107）

| fixture | `ReverseDerivation` 状態 | receipt有無 | 期待結果 |
|---|---|---|---|
| OR-107-01 | `pair_frozen`（同一HEAD/evidence snapshot） | SR4 receiptあり | `none -> published` 許可 |
| OR-107-02 | `proposal_routed`（SR4未到達） | receiptなし | `none -> published` 拒否 |
| OR-107-03 | `pair_frozen` だが受理receiptのHEAD/evidence snapshot digestが不一致 | 不一致receipt | `none -> published` 拒否 |
| OR-107-04 | 対応 `ReverseDerivation` が存在しない（未紐付け） | receipt参照不能 | `none -> published` 拒否 |
| OR-107-05 | `rejected` | receiptなし | `none -> published` 拒否 |
| OR-107-06 | `pair_frozen`（正規receipt） | 正規receiptで`published`成立後、再度同一requestを再送 | 二重`published`生成を拒否し既存receiptへ収束（idempotent） |

## §3 遷移oracle: provisional／canonical 混在0件（SRV-AC-105, SRV-AC-106）

| fixture | 操作 | 期待結果 |
|---|---|---|
| OR-105-01 | `ProvisionalVProjection.staged` を `FeatureSlice.release_ready` 遷移条件の入力として直接参照するrequest | 拒否（`CanonicalVPublication`経由必須） |
| OR-105-02 | `ProvisionalVProjection.draft` をv1.3要件反映（requirements v1.3 SCRUM_REVERSE節）の根拠として引用するrequest | 拒否 |
| OR-106-01 | `ProvisionalVProjection` に対し `published` 値を持つ遷移requestを送信 | schema fail（`published`はstate enum外） |
| OR-106-02 | `staged -> superseded` 後、旧 `ProvisionalVProjection` を再度canonical根拠として参照するrequest | 拒否（supersede後は非参照対象） |
| OR-106-03 | 同一slice内で `ProvisionalVProjection` と `CanonicalVPublication` が同時にcanonical trace根拠として計上されるfixture | 混在1件以上を検出しfail、混在0件のみpass |

## §4 遷移oracle: slice からの L1〜L12 逆引き（SRV-AC-109）

| fixture | 起点 | 逆引き対象 | 期待結果 |
|---|---|---|---|
| OR-109-01 | `FeatureSlice.released` | 対応 `CanonicalVPublication` → 対応する要求・要件・基本設計・詳細設計・test/measurement contract | 全段が欠落なく解決される（orphan 0） |
| OR-109-02 | `FeatureSlice.release_ready`（released未到達） | 対応 `CanonicalVPublication`（published/republished） | 解決可能（release前でも逆引きできる） |
| OR-109-03 | `CanonicalVPublication.stale` のみを保持する `FeatureSlice` | 逆引きtrace | `stale` である旨がtrace結果へ明示され、canonical根拠として提示されない |
| OR-109-04 | 対応 `CanonicalVPublication` を持たない `FeatureSlice`（`draft`／`in_progress`） | 逆引きtrace | 未生成であることが明示され、orphanとしては計上されない（未到達と欠落を区別する） |
| OR-109-05 | 逆引きtrace結果に `ProvisionalVProjection` のみが存在し `CanonicalVPublication` が存在しないfixture | 逆引きtrace | orphan 1件として検出される（`released`／`release_ready` slice が対象の場合） |

## §5 FR対応表

| FR | 対応oracle/AC |
|---|---|
| SRV-FR-101 | SRV-AC-101 |
| SRV-FR-102 | SRV-AC-102 |
| SRV-FR-103 | SRV-AC-103 |
| SRV-FR-104 | SRV-AC-104 |
| SRV-FR-105 | SRV-AC-105、§3 OR-105-01/02 |
| SRV-FR-106 | SRV-AC-106、§3 OR-106-01/02/03 |
| SRV-FR-107 | SRV-AC-107、§2 OR-107-01〜06 |
| SRV-FR-108 | SRV-AC-108 |
| SRV-FR-109 | SRV-AC-109、§4 OR-109-01〜05 |
| SRV-FR-110 | SRV-AC-110 |
| SRV-FR-111 | SRV-AC-111 |
| SRV-FR-112 | SRV-AC-112 |
