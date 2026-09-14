---
title: "HELIX L12 受入テスト設計 — ハイブリッド設計ドキュメントv1-fixed.zip 適合"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: confirmed
created: 2026-07-08
updated: 2026-07-09
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
pair_artifact: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
related_l3: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
next_pair_freeze: L12
spec:
  defines:
    - id: HAT-VMFIT-01
      kind: 受入テスト
      title: ZIP 採用境界
      layer: L12
      owner: QA
      status: confirmed
    - id: HAT-VMFIT-02
      kind: 受入テスト
      title: L12 map と機能設計廃止境界
      layer: L12
      owner: QA
      status: confirmed
    - id: HAT-VMFIT-03
      kind: 受入テスト
      title: typed declaration
      layer: L12
      owner: QA
      status: confirmed
    - id: HAT-VMFIT-04
      kind: 受入テスト
      title: DB projection と工程表
      layer: L12
      owner: QA
      status: confirmed
    - id: HAT-VMFIT-05
      kind: 受入テスト
      title: current-location と drive model
      layer: L12
      owner: QA
      status: confirmed
    - id: HAT-VMFIT-06
      kind: 受入テスト
      title: VSCode view
      layer: L12
      owner: QA
      status: confirmed
    - id: HAT-VMFIT-07
      kind: 受入テスト
      title: 運用後検証と log/KPI
      layer: L12
      owner: QA
      status: confirmed
    - id: HAT-VMFIT-08
      kind: 受入テスト
      title: drive model skill binding
      layer: L12
      owner: QA
      status: confirmed
    - id: HAT-VMFIT-L7-CLOSURE
      kind: TDD closure oracle
      title: L7 TDD closure / trace closure
      layer: L7
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-01a
      kind: acceptance criteria
      title: ZIP 採用対象境界
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-01b
      kind: acceptance criteria
      title: ZIP runtime import guard
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-02a
      kind: acceptance criteria
      title: L12 compatibility projection
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-02b
      kind: acceptance criteria
      title: 機能設計契約移転
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-02c
      kind: acceptance criteria
      title: cross PLAN 再投影
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-03a
      kind: acceptance criteria
      title: typed declaration parser
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-03b
      kind: acceptance criteria
      title: heuristic-only downgrade
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-04a
      kind: acceptance criteria
      title: DB projection
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-04b
      kind: acceptance criteria
      title: roadmap current-location binding
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-05a
      kind: acceptance criteria
      title: whole-program completion boundary
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-05b
      kind: acceptance criteria
      title: drive-model selector reverse scope
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-06a
      kind: acceptance criteria
      title: Project view DB/read-model rendering
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-06b
      kind: acceptance criteria
      title: Project view contradiction rendering
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-07a
      kind: acceptance criteria
      title: operation coverage gap
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-07b
      kind: acceptance criteria
      title: runtime evidence provenance
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-07c
      kind: acceptance criteria
      title: operation observed gap visibility
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-08a
      kind: acceptance criteria
      title: drive/layer 根拠付き skill 分類
      layer: L12
      owner: QA
      status: confirmed
    - id: HAC-VMFIT-08b
      kind: acceptance criteria
      title: skill context 最小ロードと Project view 投影
      layer: L12
      owner: QA
      status: confirmed
  refs:
    - from: HAT-VMFIT-01
      to: HR-FR-VMFIT-01
      kind: accepts
    - from: HAT-VMFIT-02
      to: HR-FR-VMFIT-02
      kind: accepts
    - from: HAT-VMFIT-03
      to: HR-FR-VMFIT-03
      kind: accepts
    - from: HAT-VMFIT-04
      to: HR-FR-VMFIT-04
      kind: accepts
    - from: HAT-VMFIT-05
      to: HR-FR-VMFIT-05
      kind: accepts
    - from: HAT-VMFIT-06
      to: HR-FR-VMFIT-06
      kind: accepts
    - from: HAT-VMFIT-07
      to: HR-FR-VMFIT-07
      kind: accepts
    - from: HAT-VMFIT-08
      to: HR-FR-VMFIT-08
      kind: accepts
    - from: HAT-VMFIT-L7-CLOSURE
      to: HR-FR-VMFIT-02
      kind: verifies
    - from: HAT-VMFIT-07
      to: HOPS-VMFIT-OPTEST-01
      kind: accepts
    - from: HAT-VMFIT-07
      to: HOPS-VMFIT-CONTRACT-01
      kind: accepts
    - from: HAT-VMFIT-07
      to: HOPS-VMFIT-INCIDENT-ROUTE-01
      kind: accepts
    - from: HAC-VMFIT-01a
      to: HR-FR-VMFIT-01
      kind: verifies
    - from: HAC-VMFIT-01b
      to: HR-FR-VMFIT-01
      kind: verifies
    - from: HAC-VMFIT-02a
      to: HR-FR-VMFIT-02
      kind: verifies
    - from: HAC-VMFIT-02b
      to: HR-FR-VMFIT-02
      kind: verifies
    - from: HAC-VMFIT-02c
      to: HR-FR-VMFIT-02
      kind: verifies
    - from: HAC-VMFIT-03a
      to: HR-FR-VMFIT-03
      kind: verifies
    - from: HAC-VMFIT-03b
      to: HR-FR-VMFIT-03
      kind: verifies
    - from: HAC-VMFIT-04a
      to: HR-FR-VMFIT-04
      kind: verifies
    - from: HAC-VMFIT-04b
      to: HR-FR-VMFIT-04
      kind: verifies
    - from: HAC-VMFIT-05a
      to: HR-FR-VMFIT-05
      kind: verifies
    - from: HAC-VMFIT-05b
      to: HR-FR-VMFIT-05
      kind: verifies
    - from: HAC-VMFIT-06a
      to: HR-FR-VMFIT-06
      kind: verifies
    - from: HAC-VMFIT-06b
      to: HR-FR-VMFIT-06
      kind: verifies
    - from: HAC-VMFIT-07a
      to: HR-FR-VMFIT-07
      kind: verifies
    - from: HAC-VMFIT-07b
      to: HR-FR-VMFIT-07
      kind: verifies
    - from: HAC-VMFIT-07c
      to: HR-FR-VMFIT-07
      kind: verifies
    - from: HAC-VMFIT-08a
      to: HR-FR-VMFIT-08
      kind: verifies
    - from: HAC-VMFIT-08b
      to: HR-FR-VMFIT-08
      kind: verifies
---

# HELIX L12 受入テスト設計 — ハイブリッド設計ドキュメントv1-fixed.zip 適合

## §0 位置づけ

本書は `docs/design/helix/L3-requirements/vmodel-docgen-fit.md` の pair test-design である。
現時点では受入観測を固定する設計であり、実装済みテストの存在を主張しない。

## §1 受入テスト

| HAT-ID | 対応 L3 | 対応 AC | 受入観測 | 機械検証候補 |
|--------|---------|---------|----------|--------------|
| HAT-VMFIT-01 | HR-FR-VMFIT-01 | HAC-VMFIT-01a/b | ZIP の採用対象が L12/typed spec/impact/tailoring の概念に限定され、Python generator / Excel builder が core runtime に登録されない | plan lint / import boundary lint / architecture guard |
| HAT-VMFIT-02 | HR-FR-VMFIT-02 | HAC-VMFIT-02a/b | L12 canonical map と L0-L14 compatibility projection が同時に表示でき、機能設計の契約が L5 詳細設計/typed declaration/TDD closure へ移される | layer-map tests / schema compatibility tests |
| HAT-VMFIT-03 | HR-FR-VMFIT-03 | HAC-VMFIT-03a/b | design declaration の defined id / kind / layer / source が機械読取でき、heuristic-only の検出結果は pass 根拠にならない | declaration parser tests / heuristic downgrade tests |
| HAT-VMFIT-04 | HR-FR-VMFIT-04 | HAC-VMFIT-04a/b | declaration、reference、impact、live evidence が harness.db に投影され、工程表と DB 現在地から current-location が返る | projection-writer tests / current-location read-model tests |
| HAT-VMFIT-05 | HR-FR-VMFIT-05 | HAC-VMFIT-05a/b | L14 到達済み claim と L7 起票のような矛盾が current-location と drive-model selector の finding になり、選定 model は Recovery へ昇格し、その内部経路として設計/テスト設計へ戻す範囲と文書/実装依存が出る | drive-model-selector tests / contradiction fixture |
| HAT-VMFIT-06 | HR-FR-VMFIT-06 | HAC-VMFIT-06a/b | VSCode Project view-model が L12 map、impact、current location、drive recommendation を DB/read-model 由来で描画し、値を捏造しない | visualization read-model/view-model tests |
| HAT-VMFIT-07 | HR-FR-VMFIT-07 | HAC-VMFIT-07a/b/c | log design、KPI、runtime verification、operation test、class/method contract、障害時 Recovery/Reverse 逆流 route の未設計/未観測が L12 運用後検証の gap として表示される | operation-scope coverage tests / runtime evidence tests |
| HAT-VMFIT-08 | HR-FR-VMFIT-08 | HAC-VMFIT-08a/b | current drive・workflow・layer に基づいて skill が required/recommended/optional に分類され、選定根拠を保ったまま必要な本文だけが注入され、Project view と CLI が同じ binding を表示する | skill selector tests / context injection boundary tests / Project view projection tests |
| HAT-VMFIT-L7-CLOSURE | HR-FR-VMFIT-02 | HAC-VMFIT-02a/b | L7 TDD closure / trace closure が L12 compatibility projection に残り、実装済み claim と TDD closure evidence を混同しない | current-location coverage tests / artifact-remap tests |

## §2 受入条件

| AC-ID | Given | When | Then |
|-------|-------|------|------|
| HAC-VMFIT-01a | ZIP を HELIX へ取り込む | 採用可否台帳を検査 | 採用対象は L12 レベル定義、typed spec、impact、tailoring、工程表、spec gate の概念であり、core runtime は TS/Bun のまま |
| HAC-VMFIT-01b | ZIP の Python tool や Excel build を core に登録しようとする | architecture/import guard を実行 | reference-only として拒否または補助出力扱いになり、HELIX core dependency に昇格しない |
| HAC-VMFIT-02a | legacy L0〜L14成果物がある | L1〜L12 compatibility projectionを生成 | legacy L0はV字成立のためL1企画へ投影され、ZIPの設計カバレッジに従って未分類はfindingになる |
| HAC-VMFIT-02b | 独立 L6 機能設計を廃止する | migration plan を検査 | 契約、型、テスト oracle、runtime evidence の移転先が L5 詳細設計/typed declaration/L7 closure に明示され、契約消失は fail |
| HAC-VMFIT-02c | `layer: cross` の Discovery/Reverse/Recovery PLAN がある | artifact remap を生成 | Discovery は L3、Reverse は L5、Recovery は L12 へ再投影され、未知 cross のみ unmapped finding になる |
| HAC-VMFIT-03a | design doc に typed declaration がある | parser を実行 | defined id、kind、layer、source path、owner、status が DB 投影可能な構造で返り、同一 section の本文定義 ID 重複は fail-close する |
| HAC-VMFIT-03b | declaration が無く、語句や glob だけで検出する | detector を実行 | heuristic-only と分類され、coverage や completion の green 根拠にしない |
| HAC-VMFIT-04a | design declarations と references がある | DB rebuild/projection を実行 | `design_declarations` / `design_references` / `impact` 相当の read-model へ投影される |
| HAC-VMFIT-04b | roadmap を表示する | current-location query を実行 | 工程表と DB 現在地が結ばれ、layer status、frontier、gate/test/runtime evidence、next drive model が DB 根拠つきで返る |
| HAC-VMFIT-05a | 全体は L14 到達済みと主張される | current-location を再計算 | L12 map、未閉鎖 frontier、未検証 evidence があれば whole-program completion を閉じない |
| HAC-VMFIT-05b | L7 起票と L14 claim が矛盾する | drive-model selector を実行 | 原則 Forward だが、現在地矛盾は Recovery を選定し、Recovery 内の Reverse 経路として設計/テスト設計へ戻す範囲、文書依存、実装依存、修正対象が理由つきで返る |
| HAC-VMFIT-06a | VSCode Project view が開かれる | view-model を構築 | L12 map、impact、current location、drive recommendation が DB/read-model の値と一致する |
| HAC-VMFIT-06b | DB source が空または矛盾する | view-model を構築 | 0/warning/error を表示し、成功値、補間値、LLM 要約を正本にしない |
| HAC-VMFIT-07a | log/KPI/runtime verification/operation test/class/method contract 設計が欠落している | L12 operation coverage を検査 | 未設計 gap として検出され、運用後検証完了にしない |
| HAC-VMFIT-07b | runtime evidence が projection-only である | operation verification を検査 | observed/runtime_verified へ昇格せず、未観測または要検証として扱う |
| HAC-VMFIT-07c | log/KPI/runtime verification/operation test/class/method contract/incident route が設計済みだが accepted runtime evidence が無い | current-location / Project view / doctor を生成 | `observed_gap` と `observed-gap: status=watch` が表示され、設計済み scope と運用観測済み scope を混同しない |
| HAC-VMFIT-08a | current-location が drive model・workflow・layer を返す | skill binding selector を実行 | 各 skill が required/recommended/optional のいずれかに分類され、drive・workflow・layer の選定根拠と未解決 binding が機械可読に返る |
| HAC-VMFIT-08b | skill binding が選定済みである | runtime context と Project view を生成 | required skill の必要部分だけを注入し、全 skill の一括ロードを行わず、CLI と Project view が同一 DB/read-model 由来の分類・根拠を表示する |

## §3 trace 対応

| L3 | L12 | 備考 |
|----|-----|------|
| HR-FR-VMFIT-01 | HAT-VMFIT-01 | ZIP 採用境界 |
| HR-FR-VMFIT-02 | HAT-VMFIT-02 | L12 map / 機能設計廃止境界 |
| HR-FR-VMFIT-03 | HAT-VMFIT-03 | 型付き宣言 |
| HR-FR-VMFIT-04 | HAT-VMFIT-04 | DB projection / 工程表 |
| HR-FR-VMFIT-05 | HAT-VMFIT-05 | 現在地 / 駆動モデル |
| HR-FR-VMFIT-06 | HAT-VMFIT-06 | VSCode 表示 |
| HR-FR-VMFIT-07 | HAT-VMFIT-07 | 運用後検証 / log / KPI |
| HR-FR-VMFIT-08 | HAT-VMFIT-08 | 駆動モデル / workflow / layer の skill binding |
| HR-FR-VMFIT-02 | HAT-VMFIT-L7-CLOSURE | L7 TDD 閉鎖 / trace 閉鎖 |
