---
title: "Scrum差分→V逆流 entity/state machine 要件（FeatureSlice系）"
layer: L3
kind: add-design
status: draft
created: 2026-07-21
updated: 2026-07-21
owner: Claude / TL
plan: PLAN-L3-16-scrum-reverse-entity-requirements
parent_design: docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md
pair_artifact: docs/test-design/helix/scrum-reverse-entity-model-acceptance.md
---

# Scrum差分→V逆流 entity/state machine 要件（FeatureSlice系）

- layer: L3
- status: draft
- authority: `docs/governance/helix-harness-requirements_v1.3.md` §4.1〜4.3（SCRUM_REVERSE）
- parent: `docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md`
- pair: `docs/test-design/helix/scrum-reverse-entity-model-acceptance.md`
- 起票: `docs/plans/PLAN-L3-16-scrum-reverse-entity-requirements.md`

## §0 位置づけ

requirements v1.3 §SCRUM_REVERSE は SR0〜SR4 の工程要件と receipt を定義するが、それを担う
harness.db 側の entity と state machine が未定義である（2026-07-20 監査、PLAN-L3-16）。本書は
Production Scrum の slice delta を V モデル資産へ引き戻す経路を、単一の進捗値（%やフラグ）ではなく
**4 つの独立 entity・独立 state machine** として要件化する。

対象 entity（PLAN-L3-16 §0 由来、本書で状態・遷移を確定する）:

| entity | 役割 | 対応工程 |
|---|---|---|
| `FeatureSlice` | Production Scrum の価値 slice 単位。slice delta と release-ready 判定を保持 | S1〜S4 / release 合流 |
| `ReverseDerivation` | 実装・実測・運用事実からの逆生成（evidence→contract→mapping→proposal→pair-freeze） | SR0〜SR4 |
| `ProvisionalVProjection` | pair-freeze 前の暫定 V 資産投影。canonical trace の根拠にしない | SR1〜SR3（SR4 前） |
| `CanonicalVPublication` | SR4 pair-freeze 済みの正本公開状態。Forward 再合流の入口 | SR4 以降 |

inventory-first として、`archive/obsolete-requirements-authority-pre153` の worker evaluation
contract 系（29 commit）と `infinity-loop-platform-basic-design.md` の component 責務表（`§1`）の
様式を behavior atom として採取した。bulk import はせず、本書 §1 の棚卸し表で採否のみを引き継ぎ、
実際の entity/state 定義は本書で新規に L3 粒度（FR 単位）で確定する。

## §1 既存 SR0〜SR4 要件（SRV-FR-001〜014）の棚卸しと entity 対応

`scrum-reverse-verification-engine.md` が定義する既存 SRV-FR は工程要件であり、entity/state
そのものは定義しない。以下は各既存 FR が本書のどの entity の state machine を拘束するかの対応表
（Step 1 棚卸し結果）。

| 既存FR | 要件概要 | 対応する entity | 採否 |
|---|---|---|---|
| SRV-FR-001 | slice は review/release 前に Scrum Reverse を実行し V モデル資産へ backfill する | `FeatureSlice`, `ReverseDerivation` | 採用（FeatureSlice の checkpoint 遷移条件） |
| SRV-FR-002 | SR0〜SR4 は順序・同一causality・同一HEAD/evidence snapshotを維持する | `ReverseDerivation` | 採用（状態遷移の禁止遷移条件） |
| SRV-FR-003 | SR2 は観測事実を L1〜L5 資産へ typed mapping する | `ReverseDerivation`, `ProvisionalVProjection` | 採用（v_layer_mapped 状態の内容） |
| SRV-FR-004 | SR3 は改善連鎖へ exactly one で route する | `ReverseDerivation` | 採用（proposal_routed 状態の内容） |
| SRV-FR-005〜007 | Design Refactor / Performance Refactor の判断基準 | `ReverseDerivation`（proposal_routed の route 内部判断） | 参照のみ（本書は route 先の内部判断基準を再定義しない） |
| SRV-FR-008 | test contract と measurement contract を生成する | `ProvisionalVProjection`, `CanonicalVPublication` | 採用（投影内容の一部） |
| SRV-FR-009 | metric contract の必須 field | `CanonicalVPublication` | 参照のみ（契約内容は既存 FR を正本とし本書で再定義しない） |
| SRV-FR-010 | 13 品質領域の適用性判定 | `CanonicalVPublication` | 参照のみ |
| SRV-FR-011 | 必須 metric 未充足時の completion 拒否 | `FeatureSlice`（release_ready 遷移条件） | 採用 |
| SRV-FR-012 | measurement lineage 保持 | `CanonicalVPublication`（逆引き trace） | 採用 |
| SRV-FR-013 | 改善効果の同一条件比較・rollback | `ReverseDerivation`, `CanonicalVPublication` | 参照のみ |
| SRV-FR-014 | recipe を memory へ記録し detector/gate/skill へ昇格 | entity 対象外（`MemoryCompactionCoordinator` / `LearningPromotionLedger` 相当の別系統） | 対象外（本 entity model の外） |

## §2 entity ごとの状態一覧・遷移表

各 entity は append-only event + projection で管理し（§4 SRV-FR-111）、state は projection の
current 値として再構築可能とする。遷移条件は receipt（append event）を必須とし、prose のみの
状態変更は認めない。

### §2.1 `FeatureSlice`

状態一覧:

| 状態 | 意味 |
|---|---|
| `draft` | slice 定義済み、未着手 |
| `in_progress` | 実装・TDD 進行中 |
| `review_pending` | sprint review 前または release candidate 合流前の checkpoint 到達、`ReverseDerivation` 起動待ちまたは進行中 |
| `release_ready` | `ReverseDerivation` の SR4 receipt と `CanonicalVPublication` の published/republished を保持 |
| `released` | release 合流完了 |
| `abandoned` | slice 破棄（evidence は保持したまま terminal） |

遷移表:

| from | to | 遷移条件（receipt） |
|---|---|---|
| `draft` | `in_progress` | 実装着手 event |
| `in_progress` | `review_pending` | sprint review 前／release candidate 合流前／public contract・DB schema・主要 dependency・NFR budget 変更時／設計 trace のない code・test・metric・運用判断検出時／同種 finding 再発・性能退行・障害・手動回避検出時（v1.3 §4.1 checkpoint 条件） |
| `review_pending` | `release_ready` | `ReverseDerivation.state = pair_frozen`（SR4 receipt）∧ `CanonicalVPublication.state ∈ {published, republished}` ∧ 当該 slice に紐づく `ProvisionalVProjection` の canonical trace 混入 0 件 |
| `release_ready` | `released` | release 合流 event |
| `release_ready` | `review_pending` | 紐づく `CanonicalVPublication.state = stale`（上流 Redesign による re-entry event） |
| `in_progress` \| `review_pending` | `abandoned` | PO 判断 receipt（scope 外・優先度断念） |

禁止遷移（明示拒否）:

- `draft -> release_ready`（`review_pending` と `ReverseDerivation` 経由の省略禁止）
- `in_progress -> released`（`review_pending` / `release_ready` 省略禁止）
- `released -> in_progress`（released 後の逆行禁止。変更が必要な場合は新規 `FeatureSlice` または新規 `ReverseDerivation` を起動する）
- SR4 receipt を持たない `ReverseDerivation` を根拠にした `-> release_ready`

### §2.2 `ReverseDerivation`

状態一覧（SR0〜SR4 に 1 対 1 対応）:

| 状態 | 対応工程 | 意味 |
|---|---|---|
| `pending` | — | `FeatureSlice.review_pending` により起動待ち |
| `evidence_captured` | SR0 | 実装・実測・運用事実の evidence capture 完了 |
| `contract_observed` | SR1 | observed contract 確定 |
| `v_layer_mapped` | SR2 | L1〜L5 設計資産への typed mapping 完了 |
| `proposal_routed` | SR3 | 改善連鎖（REDESIGN／DESIGN_REFACTOR／PERFORMANCE_REFACTOR／RETROFIT）へ exactly one で route 済み |
| `pair_frozen` | SR4 | pair freeze 完了、Forward re-entry receipt 保持 |
| `closed` | — | Forward 再合流完了、terminal |
| `rejected` | — | 反証・scope 外判定、terminal |

遷移表:

| from | to | 遷移条件（receipt） |
|---|---|---|
| `pending` | `evidence_captured` | SR0 evidence capture receipt |
| `evidence_captured` | `contract_observed` | SR1 observed contract receipt、`pending`→本状態と同一 HEAD/evidence snapshot |
| `contract_observed` | `v_layer_mapped` | SR2 mapping receipt（L1〜L5 typed mapping、説明不能部分は finding 化） |
| `v_layer_mapped` | `proposal_routed` | SR3 route receipt（4 route へ exactly one） |
| `proposal_routed` | `pair_frozen` | SR4 pair freeze receipt、SR0〜SR3 と同一 causality・同一 HEAD/evidence snapshot維持 |
| `pair_frozen` | `closed` | Forward 再合流完了 event |
| 任意状態 | `rejected` | 反証・scope 外判定 receipt（原因・reject 理由必須） |

禁止遷移:

- 段階飛越（例: `evidence_captured -> v_layer_mapped` の直接遷移）
- 別 HEAD／別 evidence snapshot を参照した遷移
- `pair_frozen` からの逆行（reopen が必要な場合は新規 `ReverseDerivation` を生成する。既存 `pair_frozen` の in-place 書き換えは禁止）
- `rejected` からの再開（新規 `ReverseDerivation` 生成のみ許可）

### §2.3 `ProvisionalVProjection`

状態一覧:

| 状態 | 意味 |
|---|---|
| `draft` | 暫定 V 資産投影の草案 |
| `staged` | `ReverseDerivation` の `v_layer_mapped`／`proposal_routed` 中に参照される暫定投影 |
| `superseded` | 対応する `ReverseDerivation` が `pair_frozen` に到達し、`CanonicalVPublication` へ置換された |
| `discarded` | 対応する `ReverseDerivation` が `rejected` になった、または proposal が却下された |

遷移表:

| from | to | 遷移条件（receipt） |
|---|---|---|
| `draft` | `staged` | `ReverseDerivation.state ∈ {v_layer_mapped, proposal_routed}` への参照 event |
| `staged` | `superseded` | 対応 `ReverseDerivation.state = pair_frozen` かつ `CanonicalVPublication` 新規生成 receipt |
| `staged` | `discarded` | 対応 `ReverseDerivation.state = rejected` |

禁止遷移（AC-3 の核心）:

- `ProvisionalVProjection` が `published` 相当の状態へ直接遷移すること（本 entity は `published` 状態を持たない）
- `ProvisionalVProjection`（`draft`／`staged` いずれも）を `FeatureSlice.release_ready` 判定または
  v1.3 要件反映の根拠として直接参照する遷移・event
- `discarded` からの再利用（新規 `ReverseDerivation` 経由での再生成のみ許可）

### §2.4 `CanonicalVPublication`

状態一覧:

| 状態 | 意味 |
|---|---|
| `none` | 未生成（初期状態、entity インスタンスなし） |
| `published` | SR4 pair-freeze 済みの正本公開状態 |
| `stale` | 上流 Redesign／L1・L2 相当の変更による re-entry event で失効 |
| `republished` | `stale` から再度 SR4 pair freeze receipt を得て復帰 |

遷移表:

| from | to | 遷移条件（receipt） |
|---|---|---|
| `none` | `published` | 対応 `ReverseDerivation.state = pair_frozen`（SR4 receipt）必須。receipt には SR0〜SR4 と同一 HEAD/evidence snapshot digest を含む |
| `published` | `stale` | 上流 Redesign／要求変更による re-entry event（下流 pair の stale 化） |
| `republished` | `stale` | 再度の上流変更 event |
| `stale` | `republished` | 新規 `ReverseDerivation` の `pair_frozen`（再 SR4 receipt） |

禁止遷移（AC-2 の核心）:

- `none -> published`（SR4 receipt を持つ `ReverseDerivation` の参照なしでの遷移）— 拒否必須
- `stale` のまま `FeatureSlice.release_ready` 判定の根拠に使用すること
- `ProvisionalVProjection` からの直接 `published` 生成（必ず `ReverseDerivation.pair_frozen` を経由する）

## §3 FR 表

既存 `SRV-FR-001`〜`014`（`scrum-reverse-verification-engine.md`）との連番衝突を避けるため、
本書の FR は `SRV-FR-101` から採番する。

| ID | 要件 | 受入ID |
|---|---|---|
| SRV-FR-101 | `FeatureSlice`／`ReverseDerivation`／`ProvisionalVProjection`／`CanonicalVPublication` を独立entity・独立state machineとしてharness.dbへ定義し、単一の進捗値やフラグへ縮退させない | SRV-AC-101 |
| SRV-FR-102 | `FeatureSlice` は §2.1 の状態一覧を持ち、`release_ready` への遷移は `ReverseDerivation` の SR4 pair_frozen receiptを必須とする | SRV-AC-102 |
| SRV-FR-103 | `ReverseDerivation` は SR0〜SR4に1対1対応する状態を持ち、順序・同一causality・同一HEAD/evidence snapshotを維持しない遷移を拒否する | SRV-AC-103 |
| SRV-FR-104 | `ReverseDerivation` の `proposal_routed` 状態は REDESIGN／DESIGN_REFACTOR／PERFORMANCE_REFACTOR／RETROFIT へ exactly one でrouteした結果を保持する | SRV-AC-104 |
| SRV-FR-105 | `ProvisionalVProjection` はpair-freeze前の暫定V資産投影のみを保持し、canonical trace、release判定、要件反映の根拠に使用しない | SRV-AC-105 |
| SRV-FR-106 | `ProvisionalVProjection` は `draft`／`staged`／`superseded`／`discarded` の状態のみを持ち、`published`相当の状態を持たない（canonical昇格は`CanonicalVPublication`の新規生成でのみ行う） | SRV-AC-106 |
| SRV-FR-107 | `CanonicalVPublication` は `ReverseDerivation` の `pair_frozen`（SR4 receipt）を参照するreceiptなしに `published` 状態へ遷移できない | SRV-AC-107 |
| SRV-FR-108 | `CanonicalVPublication` は `published`／`stale`／`republished` の状態を持ち、上流変更でstale化した場合はrepublishまで `FeatureSlice.release_ready` 判定に使用しない | SRV-AC-108 |
| SRV-FR-109 | `FeatureSlice` から `CanonicalVPublication`、`CanonicalVPublication` から対応 V資産（要求・要件・基本設計・詳細設計・test/measurement contract）への逆引きtraceを保持し、orphanを0にする | SRV-AC-109 |
| SRV-FR-110 | `scrum_slice_ready` 式は `FeatureSlice.state = release_ready` ∧ `ReverseDerivation.state = pair_frozen` ∧ `CanonicalVPublication.state ∈ {published, republished}` ∧ 当該sliceの `ProvisionalVProjection` canonical混入0件、を必須項目として接続する | SRV-AC-110 |
| SRV-FR-111 | 4 entity は全てappend-only event + projectionで管理し、in-place状態上書き・履歴消去を禁止する | SRV-AC-111 |
| SRV-FR-112 | 4 entityの確定名称と状態は `glossary-ssot.md` へ登録し、暫定名称のまま実装契約にしない | SRV-AC-112 |

## §4 `scrum_slice_ready` 式への接続

既存式（`scrum-reverse-verification-engine.md`）:

`scrum_slice_ready = SR0..SR4 current ∧ V_asset_backfill_closed ∧ route_exactly_one ∧ pair_freeze_pass`

本書は上記の各項を entity/state で具体化する（SRV-FR-110）:

- `SR0..SR4 current` = `ReverseDerivation.state` が §2.2 の遷移表を違反なく `pair_frozen` へ到達していること
- `V_asset_backfill_closed` = `CanonicalVPublication.state ∈ {published, republished}` かつ SRV-FR-109 の逆引きtraceにorphanが無いこと
- `route_exactly_one` = `ReverseDerivation.proposal_routed` の route event が4種のうちexactly oneであること（SRV-FR-104）
- `pair_freeze_pass` = `CanonicalVPublication` が `ReverseDerivation.pair_frozen` receiptを参照して生成されていること（SRV-FR-107）

`FeatureSlice.release_ready` は上記4項全てに加え、当該sliceの `ProvisionalVProjection` に
canonical trace混入が無いこと（SRV-FR-105/106）を条件とする。

## §5 falsifiable AC 表

| AC | 合格条件 |
|---|---|
| SRV-AC-101 | 4 entity 分の projection query で `FeatureSlice`／`ReverseDerivation`／`ProvisionalVProjection`／`CanonicalVPublication` を個別に取得でき、単一集約値（%やフラグ）へ縮退した read modelが存在しない |
| SRV-AC-102 | `ReverseDerivation.state ≠ pair_frozen` の `FeatureSlice` に対する `-> release_ready` 遷移要求が全件拒否される |
| SRV-AC-103 | SR段階の飛越・別HEAD・別evidence snapshotを持つ `ReverseDerivation` 遷移要求が全件拒否される |
| SRV-AC-104 | `proposal_routed` fixture がREDESIGN／DESIGN_REFACTOR／PERFORMANCE_REFACTOR／RETROFITのうちexactly oneに分類され、0件または複数件routeのfixtureが拒否される |
| SRV-AC-105 | `ProvisionalVProjection` を参照する `release_ready` 遷移要求・v1.3要件反映requestが全件拒否される |
| SRV-AC-106 | `ProvisionalVProjection` に対する `published` 相当への遷移要求が定義上存在せず（stateenum外）、fixtureが全件schema failする |
| SRV-AC-107 | SR4 receiptを持たない `CanonicalVPublication.none -> published` 遷移要求が全件拒否される |
| SRV-AC-108 | `stale` 状態の `CanonicalVPublication` を参照する `FeatureSlice.release_ready` 遷移要求が全件拒否される |
| SRV-AC-109 | `FeatureSlice` から対応V資産までの逆引きtraceでorphanが0件である |
| SRV-AC-110 | `scrum_slice_ready` の4項いずれかがfalseのfixtureで、式全体がfalseになる |
| SRV-AC-111 | 4 entityの状態history がappend-only eventから再構築可能であり、in-place update経路が存在しない |
| SRV-AC-112 | `glossary-ssot.md` に4 entity名と状態enumが登録されている |

## §6 用語登録

本書確定により、以下を暫定名称から確定名称へ移行し `glossary-ssot.md` へ登録する
（PLAN-L3-16 §6 に対応）: `FeatureSlice` / `ReverseDerivation` / `ProvisionalVProjection` /
`CanonicalVPublication`。各語は本書 §2 の状態enumを正本値集合として登録する。
