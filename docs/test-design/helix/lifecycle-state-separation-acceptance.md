---
title: "HELIX 受入テスト設計 — Design/Runtime/Release/Production Observation 4状態分離"
layer: L3
executed_at_layer: L10
artifact_type: test_design
status: draft
created: 2026-07-21
updated: 2026-07-21
owner: Claude / QA
plan: PLAN-L3-17-lifecycle-state-separation-requirements
pair_artifact: docs/design/helix/L3-requirements/lifecycle-state-separation.md
related_l3: docs/design/helix/L3-requirements/lifecycle-state-separation.md
next_pair_freeze: L10
spec:
  defines:
    - id: LSAT-01
      kind: 受入テスト
      title: 4 entity 独立管理
      layer: L10
      owner: QA
      status: draft
    - id: LSAT-02
      kind: 受入テスト
      title: Design state machine
      layer: L10
      owner: QA
      status: draft
    - id: LSAT-03
      kind: 受入テスト
      title: Runtime state machine
      layer: L10
      owner: QA
      status: draft
    - id: LSAT-04
      kind: 受入テスト
      title: Release state machine
      layer: L10
      owner: QA
      status: draft
    - id: LSAT-05
      kind: 受入テスト
      title: Production Observation state machine
      layer: L10
      owner: QA
      status: draft
    - id: LSAT-06
      kind: 受入テスト
      title: 禁止昇格 oracle
      layer: L10
      owner: QA
      status: draft
    - id: LSAT-07
      kind: 受入テスト
      title: 単一進捗値による導出拒否
      layer: L10
      owner: QA
      status: draft
    - id: LSAT-08
      kind: 受入テスト
      title: DB/CLI/view 個別 projection
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-01a
      kind: acceptance criteria
      title: entity 独立性
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-01b
      kind: acceptance criteria
      title: 合成進捗値の不在
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-02a
      kind: acceptance criteria
      title: Design state 導出
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-02b
      kind: acceptance criteria
      title: Design state 差し戻し
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-03a
      kind: acceptance criteria
      title: Runtime state 導出
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-03b
      kind: acceptance criteria
      title: Runtime state 逆行制御
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-04a
      kind: acceptance criteria
      title: Release state 導出
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-04b
      kind: acceptance criteria
      title: Release state 差し戻し
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-05a
      kind: acceptance criteria
      title: Production Observation state 導出
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-05b
      kind: acceptance criteria
      title: observed_gap の維持
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-06a
      kind: acceptance criteria
      title: 設計 green のみでの observation 昇格拒否
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-06b
      kind: acceptance criteria
      title: 実装 green のみでの release/observation 昇格拒否
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-06c
      kind: acceptance criteria
      title: release green のみでの observation 昇格拒否
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-07a
      kind: acceptance criteria
      title: 単一集約値からの状態導出拒否
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-08a
      kind: acceptance criteria
      title: DB 個別 table/column projection
      layer: L10
      owner: QA
      status: draft
    - id: LSAC-08b
      kind: acceptance criteria
      title: CLI/Project view 個別表示
      layer: L10
      owner: QA
      status: draft
  refs:
    - from: LSAT-01
      to: LSS-FR-01
      kind: accepts
    - from: LSAT-02
      to: LSS-FR-02
      kind: accepts
    - from: LSAT-03
      to: LSS-FR-03
      kind: accepts
    - from: LSAT-04
      to: LSS-FR-04
      kind: accepts
    - from: LSAT-05
      to: LSS-FR-05
      kind: accepts
    - from: LSAT-06
      to: LSS-FR-06
      kind: accepts
    - from: LSAT-07
      to: LSS-FR-07
      kind: accepts
    - from: LSAT-08
      to: LSS-FR-08
      kind: accepts
    - from: LSAC-01a
      to: LSS-FR-01
      kind: verifies
    - from: LSAC-01b
      to: LSS-FR-01
      kind: verifies
    - from: LSAC-02a
      to: LSS-FR-02
      kind: verifies
    - from: LSAC-02b
      to: LSS-FR-02
      kind: verifies
    - from: LSAC-03a
      to: LSS-FR-03
      kind: verifies
    - from: LSAC-03b
      to: LSS-FR-03
      kind: verifies
    - from: LSAC-04a
      to: LSS-FR-04
      kind: verifies
    - from: LSAC-04b
      to: LSS-FR-04
      kind: verifies
    - from: LSAC-05a
      to: LSS-FR-05
      kind: verifies
    - from: LSAC-05b
      to: LSS-FR-05
      kind: verifies
    - from: LSAC-06a
      to: LSS-FR-06
      kind: verifies
    - from: LSAC-06b
      to: LSS-FR-06
      kind: verifies
    - from: LSAC-06c
      to: LSS-FR-06
      kind: verifies
    - from: LSAC-07a
      to: LSS-FR-07
      kind: verifies
    - from: LSAC-08a
      to: LSS-FR-08
      kind: verifies
    - from: LSAC-08b
      to: LSS-FR-08
      kind: verifies
---

# HELIX 受入テスト設計 — Design/Runtime/Release/Production Observation 4状態分離

## §0 位置づけ

本書は `docs/design/helix/L3-requirements/lifecycle-state-separation.md` の pair test-design である。
現時点では受入観測を固定する設計であり、実装済みテストの存在を主張しない。中心テーマは
「禁止昇格 oracle」（ある entity の green/frozen 状態のみを根拠に、別 entity の状態を昇格させようとした
入力を拒否できるか）である。

## §1 受入テスト

| LSAT-ID | 対応要件 | 対応 AC | 受入観測 | 機械検証候補 |
|---|---|---|---|---|
| LSAT-01 | LSS-FR-01 | LSAC-01a/b | 4 entity が別 table/別 field として保持され、単一 percent/color フィールドへ合成されない | schema tests / entity independence tests |
| LSAT-02 | LSS-FR-02 | LSAC-02a/b | Design state が `draft`/`frozen` の 2 値で、design doc frontmatter と pair-freeze receipt からのみ導出される | design-state derivation tests |
| LSAT-03 | LSS-FR-03 | LSAC-03a/b | Runtime state が `not_started`/`implemented`/`tdd_closed` で、L6↔L7 receipt と `test_runs` pass evidence からのみ導出される | runtime-state derivation tests |
| LSAT-04 | LSS-FR-04 | LSAC-04a/b | Release state が `unverified`/`release_ready` で、CI green evidence と `review_evidence` からのみ導出される | release-state derivation tests |
| LSAT-05 | LSS-FR-05 | LSAC-05a/b | Production Observation state が `unobserved`/`observed_gap`/`runtime_verified` で、real-data・log/KPI・`runtime_verification_events` からのみ導出される | observation-state derivation tests |
| LSAT-06 | LSS-FR-06 | LSAC-06a/b/c | いずれかの entity の green/frozen 状態のみを入力に他 entity の昇格を試みると拒否される | 禁止昇格 oracle tests（fixture: Design frozen のみ／Runtime tdd_closed のみ／Release release_ready のみ） |
| LSAT-07 | LSS-FR-07 | LSAC-07a | `artifact_progress` 相当の red/yellow/green 単一値を入力しても、4 entity のいずれの canonical state も直接導出されない | single-value rejection tests |
| LSAT-08 | LSS-FR-08 | LSAC-08a/b | harness.db に 4 entity が個別 table/column として存在し、CLI・Project view が個別に表示する | projection-writer tests / CLI/view rendering tests |

## §2 受入条件

| AC-ID | Given | When | Then |
|---|---|---|---|
| LSAC-01a | 4 entity（Design/Runtime/Release/Production Observation）の state を持つ fixture がある | schema/projection を検査 | 各 entity が独立 field として存在し、他 entity の値へ from-derivation されていない |
| LSAC-01b | 4 entity の state を合成しようとする実装がある | 合成ロジックの有無を検査 | 単一 percent/color への合成 helper が存在しない、または存在しても canonical state の代替として使われない |
| LSAC-02a | 設計 doc frontmatter と pair-freeze receipt がある | Design state 導出を実行 | pair-freeze receipt が無ければ `draft`、あれば `frozen` を返す |
| LSAC-02b | `frozen` の Design state に対し Redesign PLAN が起票される | Design state 遷移を実行 | `frozen -> draft` へ遷移し、遷移理由（Redesign PLAN ID）が記録される |
| LSAC-03a | 実装 commit と `test_runs` evidence の組み合わせ fixture がある | Runtime state 導出を実行 | commit のみ→`implemented`、commit + pass evidence + L6↔L7 receipt→`tdd_closed` を返す |
| LSAC-03b | `tdd_closed` に対し Recovery/Reverse が起票される | Runtime state 遷移を実行 | 明示 PLAN 起票がある場合のみ逆行を許可し、無条件の逆行は拒否される |
| LSAC-04a | CI evidence と `review_evidence` の組み合わせ fixture がある | Release state 導出を実行 | CI green のみ→`unverified` 維持、CI green + approve verdict→`release_ready` を返す |
| LSAC-04b | `release_ready` に対し CI red 化または approval revoke が発生する | Release state 遷移を実行 | `release_ready -> unverified` へ差し戻される |
| LSAC-05a | real-data／log-KPI／runtime_verification_events の組み合わせ fixture がある | Production Observation state 導出を実行 | 設計対象だが evidence 無し→`unobserved`、設計対象+typed declaration ありだが accepted evidence 無し→`observed_gap`、evidence 揃い→`runtime_verified` を返す |
| LSAC-05b | `observed_gap` の項目に対し Design state のみが `frozen` へ変わる | Production Observation state を再計算 | `observed_gap` は変化しない（Design green は observation 昇格根拠にならない） |
| LSAC-06a | Design state が `frozen` で、Runtime/Release/Production Observation の evidence が無い fixture | 禁止昇格 oracle を実行 | Runtime/Release/Production Observation はいずれも初期 state のままで、昇格 attempt は reject される |
| LSAC-06b | Runtime state が `tdd_closed` で、Release/Production Observation の evidence が無い fixture | 禁止昇格 oracle を実行 | Release/Production Observation はいずれも初期 state のままで、昇格 attempt は reject される |
| LSAC-06c | Release state が `release_ready` で、Production Observation の evidence が無い fixture | 禁止昇格 oracle を実行 | Production Observation は初期 state のままで、昇格 attempt は reject される |
| LSAC-07a | `artifact_progress` 相当の単一 color 値のみを入力する fixture | 4 entity 導出ロジックを実行 | いずれの entity state も単一 color 値からは導出されず、canonical state 未確定または fail-close になる |
| LSAC-08a | 4 entity の state 変化がある | harness.db rebuild/projection を実行 | 4 entity が個別 table または個別 column として rebuildable に投影される |
| LSAC-08b | 4 entity が DB に存在する | CLI `progress` 系コマンドおよび Project view を生成 | CLI と Project view が同一 DB 由来で、4 entity を個別フィールドとして一致表示する（単一値へ丸めない） |

## §3 trace 対応

| L3 | L10 | 備考 |
|---|---|---|
| LSS-FR-01 | LSAT-01 | 4 entity 独立管理 |
| LSS-FR-02 | LSAT-02 | Design 状態機械 |
| LSS-FR-03 | LSAT-03 | Runtime 状態機械 |
| LSS-FR-04 | LSAT-04 | Release 状態機械 |
| LSS-FR-05 | LSAT-05 | Production Observation 状態機械 |
| LSS-FR-06 | LSAT-06 | 禁止昇格 oracle |
| LSS-FR-07 | LSAT-07 | 単一進捗値による導出拒否 |
| LSS-FR-08 | LSAT-08 | DB/CLI/view 個別 projection |
