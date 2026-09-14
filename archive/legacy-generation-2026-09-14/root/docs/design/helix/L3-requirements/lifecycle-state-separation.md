---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
legacy_physical_layer: L3
l3_progression_marker: HELIX:L3-PROGRESSION-AUTHORITY:v1
l3_progression_authority: docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
title: "HELIX L3 要件 — Design/Runtime/Release/Production Observation 4状態分離"
layer: L3
kind: add-design
status: draft
freeze_blocking: false
created: 2026-07-21
updated: 2026-07-21
owner: Claude / TL
plan: PLAN-L3-17-lifecycle-state-separation-requirements
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l3: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
pair_artifact: docs/test-design/helix/lifecycle-state-separation-acceptance.md
next_pair_freeze: L10
spec:
  defines:
    - id: LSS-FR-01
      kind: 機能要件
      title: 4 entity の独立管理
      layer: L3
      owner: TL
      status: draft
    - id: LSS-FR-02
      kind: 機能要件
      title: Design state machine
      layer: L3
      owner: TL
      status: draft
    - id: LSS-FR-03
      kind: 機能要件
      title: Runtime state machine
      layer: L3
      owner: TL
      status: draft
    - id: LSS-FR-04
      kind: 機能要件
      title: Release state machine
      layer: L3
      owner: TL
      status: draft
    - id: LSS-FR-05
      kind: 機能要件
      title: Production Observation state machine
      layer: L3
      owner: TL
      status: draft
    - id: LSS-FR-06
      kind: 機能要件
      title: 禁止昇格規則
      layer: L3
      owner: TL
      status: draft
    - id: LSS-FR-07
      kind: 機能要件
      title: 単一進捗値による導出禁止
      layer: L3
      owner: TL
      status: draft
    - id: LSS-FR-08
      kind: 機能要件
      title: DB/CLI/view への個別 projection
      layer: L3
      owner: TL
      status: draft
  refs:
    - from: LSS-FR-02
      to: LSS-FR-06
      kind: constrains
    - from: LSS-FR-03
      to: LSS-FR-06
      kind: constrains
    - from: LSS-FR-04
      to: LSS-FR-06
      kind: constrains
    - from: LSS-FR-05
      to: LSS-FR-06
      kind: constrains
    - from: LSS-FR-01
      to: LSS-FR-08
      kind: refines
---

# HELIX L3 要件 — Design/Runtime/Release/Production Observation 4状態分離

## §0 位置づけ

本書は `docs/plans/PLAN-L3-17-lifecycle-state-separation-requirements.md` の Step 1〜3 成果物であり、
`docs/design/helix/L3-requirements/vmodel-docgen-fit.md` の子設計として、Design / Runtime / Release /
Production Observation の 4 状態を**独立 entity・独立 state machine**として要件化する。既存正本は
「実装済みと設計済みを同じ完成状態として表示しない」「`implemented` と `ux_verified` を別々に導出する」
という 2 分割・部分分離までであり、4 entity を独立 state machine として持つ要件は本書で新規に定義する。

## §1 現行状態表現の棚卸し（Step 1）

| 出典 | 現行の状態表現 | 分離の程度 | 残る問題 |
|---|---|---|---|
| `vmodel-docgen-fit.md` §7.1 `operation_observability_scope`（`docs/design/helix/L3-requirements/vmodel-docgen-fit.md:256-258`） | `designed` と `observed`（`observed_gap`）を分離し、設計済みであることを理由に運用観測済みへ昇格しない | L12 運用後検証スコープに限定した designed/observed の 2 値分離 | Design 資産の凍結、Runtime 実装、Release 検証を独立 entity として持たず、`observed_gap` は L12 内部の 1 フラグにとどまる |
| requirements v1.3 §4.9 統合 Design HARNESS（`docs/governance/helix-harness-requirements_v1.3.md:162`） | 文書 metadata／semantic diff の実装済み能力と、screen applicability 等の設計済み能力を「同じ完成状態として表示しない」 | 実装済み／設計済みの 2 値分離（entity化なし） | 「表示しない」という表示規律であり、別 entity・別 state machine としての遷移規則・導出元 evidence 種別が未定義 |
| requirements v1.3 §受入条件（`docs/governance/helix-harness-requirements_v1.3.md:107`, `:255`） | `implemented`（L6↔L7 receipt）と `ux_verified`（L10 以降の real-data evidence + 人間評価）を独立判定 | Runtime と一部 Production Observation 相当の 2 値分離 | Release（検証・release evidence）が独立 entity化されず `ux_verified` に部分的に混在。Design state（凍結境界）が対象外 |
| `PLAN-L7-56-artifact-progress-state.md`（`docs/plans/PLAN-L7-56-artifact-progress-state.md:92-96`） | `artifact_progress` を red/yellow/green の**単一 color 値**として projection し、dependency check・test run evidence・recovery PLAN から導出 | 単一次元（色）へ複数 evidence を合成する進捗値表現 | 4 entity の状態を 1 フィールドへ縮約しており、本書が禁止する「単一進捗値による状態導出」の典型例。derived data として明示的に許容されているが、canonical な完成状態表現としては使えない |

**結論**: 既存正本には 2 値分離（実装済み/設計済み、`implemented`/`ux_verified`、`designed`/`observed`）は
存在するが、Design / Runtime / Release / Production Observation を**それぞれ独立した entity・独立した
state machine**として持つ要件、および `artifact_progress` のような単一進捗値表現を canonical 状態表現として
禁止する明示規則は存在しない。本書はこのギャップを埋める。

## §2 4 entity の状態定義と導出元 evidence

各 entity は他の 3 entity と独立した state を持ち、他 entity の state を計算に使わない。

| entity | 対象 layer | states | 導出元 evidence 種別 |
|---|---|---|---|
| Design state | L1〜L5 相当の設計資産 | `draft` → `frozen`（Redesign 発生時は `frozen` → `draft` へ差し戻し） | 設計 doc `status` frontmatter、pair-freeze receipt |
| Runtime state | L6〜L7 相当の実装／TDD closure | `not_started` → `implemented` → `tdd_closed` | L6↔L7 receipt、`test_runs` の pass evidence、実装 commit |
| Release state | L8〜L11 相当の検証と release evidence | `unverified` → `release_ready` | CI green evidence、approval receipt、`review_evidence` |
| Production Observation state | L12 相当の運用観測 | `unobserved` → `observed_gap` → `runtime_verified` | real-data evidence、log/KPI、`runtime_verification_events`、incident route evidence |

### §2.1 Design 状態機械 (state machine)

- `draft`: 初期状態。設計 doc が未凍結。
- `frozen`: pair-freeze receipt が存在する。
- 遷移: `draft -> frozen`（pair-freeze receipt 発生時）、`frozen -> draft`（Redesign 起票時のみ、明示 PLAN が必要）。
- `frozen` は Runtime / Release / Production Observation いずれの state も変更しない（§3 参照）。

### §2.2 Runtime 状態機械 (state machine)

- `not_started`: 実装 commit も TDD closure evidence も無い。
- `implemented`: 実装 commit が存在するが `test_runs` pass evidence が無い、または TDD closure 未完了。
- `tdd_closed`: L6↔L7 receipt と `test_runs` pass evidence が揃う。
- 遷移: `not_started -> implemented -> tdd_closed`。逆行は Recovery/Reverse 起票時のみ。
- `tdd_closed` は Design state の `frozen` を要求する（前提条件であり、昇格の代替根拠ではない）。ただし
  `tdd_closed` 自体は Release / Production Observation を昇格させない（§3 参照）。

### §2.3 Release 状態機械 (state machine)

- `unverified`: CI green evidence または approval receipt が無い。
- `release_ready`: CI green evidence と `review_evidence`（approve verdict）が揃う。
- 遷移: `unverified -> release_ready`。CI red 化や approval revoke が発生した場合は `release_ready -> unverified` へ差し戻す。
- `release_ready` は Runtime state の `tdd_closed` を要求する（前提条件）が、`release_ready` 自体は
  Production Observation を昇格させない（§3 参照）。

### §2.4 Production Observation 状態機械 (state machine)

- `unobserved`: real-data evidence、log/KPI、runtime verification event のいずれも無い。
- `observed_gap`: typed declaration や運用後検証スコープとして設計対象になっているが、accepted runtime
  evidence（real-data、log/KPI、`runtime_verification_events`）へまだ接続されていない
  （`vmodel-docgen-fit.md` §7.1 の `observed_gap` を entity 遷移規則として継承する）。
- `runtime_verified`: real-data evidence、log/KPI、`runtime_verification_events`、必要な場合は incident
  route evidence が揃い、人間評価が必要な項目（`ux_verified` 相当）はその evidence も揃う。
- 遷移: `unobserved -> observed_gap -> runtime_verified`。実運用での regression 検知時は
  `runtime_verified -> observed_gap` へ差し戻す。
- Production Observation state は Design / Runtime / Release のいずれの `green` 状態からも独立して
  導出し、他 3 entity の状態を代入しない。

## §3 禁止昇格規則（cross-entity promotion 禁止）

| 禁止パターン | 説明 |
|---|---|
| 設計 green のみで observation 昇格拒否 | Design state が `frozen` であることのみを根拠に、Production Observation state を `observed_gap` または `runtime_verified` へ昇格させてはならない。実装・real-data evidence が別途必要。 |
| 実装 green のみで release/observation 昇格拒否 | Runtime state が `tdd_closed` であることのみを根拠に、Release state を `release_ready` へ、または Production Observation state を `observed_gap`／`runtime_verified` へ昇格させてはならない。CI/approval/real-data evidence が別途必要。 |
| release green のみで observation 昇格拒否 | Release state が `release_ready` であることのみを根拠に、Production Observation state を `observed_gap`／`runtime_verified` へ昇格させてはならない。real-data・log/KPI・runtime verification evidence が別途必要。 |
| 単一進捗値による状態導出拒否 | `artifact_progress` の red/yellow/green のような単一次元集約値を、4 entity のいずれかの canonical state として採用してはならない。各 entity は自身の evidence 種別から個別に導出する。 |
| 下位 entity の不在による上位 entity の凍結拒否 | 逆方向（例: Production Observation が `unobserved` であることを理由に Design state を `draft` へ差し戻す）も禁止する。各 entity の遷移は自身の evidence 変化によってのみ発生する。 |

前提条件（§2.2、§2.3 の「要求する」記述）と昇格根拠は区別する。前提条件は下位 entity の state が
一定水準に達していることを要求できるが、その水準到達自体を上位 entity の昇格根拠として**代入**しては
ならない。

## §4 要件（FR）

| ID | 要件 | 主な AC |
|---|---|---|
| LSS-FR-01 | Design / Runtime / Release / Production Observation を独立 entity として保持し、単一進捗値やパーセンテージへ合成しない | LSAC-01a/b |
| LSS-FR-02 | Design state machine（`draft`/`frozen`）を設計 doc frontmatter と pair-freeze receipt から導出する | LSAC-02a/b |
| LSS-FR-03 | Runtime state machine（`not_started`/`implemented`/`tdd_closed`）を L6↔L7 receipt と `test_runs` pass evidence から導出する | LSAC-03a/b |
| LSS-FR-04 | Release state machine（`unverified`/`release_ready`）を CI green evidence と `review_evidence` から導出する | LSAC-04a/b |
| LSS-FR-05 | Production Observation state machine（`unobserved`/`observed_gap`/`runtime_verified`）を real-data evidence、log/KPI、`runtime_verification_events` から導出する | LSAC-05a/b |
| LSS-FR-06 | いずれかの entity の green/frozen 状態のみを根拠に他 entity を昇格させない禁止遷移規則を機械検証する | LSAC-06a/b/c |
| LSS-FR-07 | `artifact_progress` の色のような単一次元集約値を、4 entity の canonical state 導出に使わない | LSAC-07a |
| LSS-FR-08 | 4 entity を harness.db へ個別 table/column として投影し、CLI・Project view は個別に表示する | LSAC-08a/b |

## §5 用語更新（§G.9 予定）

- 新規語: 「lifecycle 4状態分離（Design/Runtime/Release/Production Observation）」。design doc 確定時に
  L0 glossary へ登録する。
