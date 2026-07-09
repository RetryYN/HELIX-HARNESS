---
title: "HELIX L12 個人開発テーラリングプロファイル"
layer: L12
kind: design
status: confirmed
created: 2026-07-08
updated: 2026-07-09
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
related_l3: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
related_l12:
  - docs/design/helix/L12-vmodel/vmodel-layer-coverage.md
  - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
pair_artifact: docs/test-design/helix/vmodel-docgen-fit-acceptance.md
source_package: ハイブリッド設計ドキュメントv1-fixed.zip
zip_sources:
  - docs/catalog.yaml
  - docs/profiles.yaml
  - docs/52_文書化方針・テーラリング設計.yaml
spec:
  defines:
    - id: HVM-TAILOR-CORE-DESIGN
      kind: tailoring required
      title: core design documents are required
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-TAILOR-DETAIL-CONTRACT
      kind: tailoring required
      title: detailed design absorbs function design contract
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-TAILOR-TEST-ORACLE
      kind: tailoring required
      title: test design and TDD closure are required
      layer: L12
      owner: QA
      status: confirmed
    - id: HVM-TAILOR-OPERATION
      kind: tailoring required
      title: operation observability is required
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-TAILOR-DIAGRAMS
      kind: tailoring optional
      title: diagrams are optional generated support
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-TAILOR-INDEXES
      kind: tailoring optional
      title: indexes and maps are optional support
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-TAILOR-MOBILE-DESKTOP-NA
      kind: tailoring na
      title: mobile and desktop specific documents are out of scope by default
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-TAILOR-ENTERPRISE-NA
      kind: tailoring na
      title: enterprise only governance documents are out of scope by default
      layer: L12
      owner: TL
      status: confirmed
  refs:
    - from: HVM-TAILOR-CORE-DESIGN
      to: HVM-ADOPT-02
      kind: specializes
    - from: HVM-TAILOR-DETAIL-CONTRACT
      to: HR-FR-VMFIT-02
      kind: constrains
    - from: HVM-TAILOR-TEST-ORACLE
      to: HAT-VMFIT-L7-CLOSURE
      kind: verifies
    - from: HVM-TAILOR-OPERATION
      to: HR-FR-VMFIT-07
      kind: constrains
    - from: HVM-TAILOR-DIAGRAMS
      to: HVM-ADOPT-03
      kind: supports
    - from: HVM-TAILOR-INDEXES
      to: HVM-ADOPT-03
      kind: supports
    - from: HVM-TAILOR-MOBILE-DESKTOP-NA
      to: HVM-REJECT-01
      kind: constrains
    - from: HVM-TAILOR-ENTERPRISE-NA
      to: HVM-REJECT-01
      kind: constrains
---

# HELIX L12 個人開発テーラリングプロファイル

## §0 位置づけ

本書は ZIP の `catalog.yaml`、`profiles.yaml`、`52_文書化方針・テーラリング設計` を HELIX の個人開発向け
L12 profile へ写す正本である。目的は、53 種の設計書を一律必須にすることではない。必要な設計契約だけを
厳格にし、不要な成果物は `na` として明示し、Project view で過剰文書化と設計不足を同時に見えるようにする。

## §1 ZIP から採るルール

ZIP は成果物を `status: done/todo/na` と `detail: 詳細/標準/簡易` で管理する。HELIX ではこれを以下へ対応させる。

| ZIP    | HELIX                                                                |
| ------ | -------------------------------------------------------------------- |
| `done` | typed declaration または runtime evidence で検出済み                 |
| `todo` | L12 tailoring gate の不足。Reverse または `add-feature` で設計へ戻す |
| `na`   | 個人開発 profile では対象外。missing にしない                        |
| `詳細` | L5 詳細設計、typed declaration、test oracle まで要求                 |
| `標準` | 方針、主要項目、DB/read-model への投影契約を要求                     |
| `簡易` | 方向性、境界、参照先だけを要求                                       |

## §2 HELIX 個人開発 profile

| ID                           | 区分     | 対象                                                           | 粒度 | 判定                                                   |
| ---------------------------- | -------- | -------------------------------------------------------------- | ---- | ------------------------------------------------------ |
| HVM-TAILOR-CORE-DESIGN       | required | 企画、要求/画面、要件、基本設計                                | 標準 | L1-L4 の typed coverage を要求                         |
| HVM-TAILOR-DETAIL-CONTRACT   | required | 詳細設計、class/method contract、DB/schema、実装 binding       | 詳細 | 独立した重い機能設計を廃止し、L5 詳細設計へ契約を吸収  |
| HVM-TAILOR-TEST-ORACLE       | required | 単体/結合/総合/受入/TDD closure                                | 標準 | 右腕の test design と L7 closure oracle を要求         |
| HVM-TAILOR-OPERATION         | required | log、KPI、runtime verification、operation test、incident route | 標準 | L12 運用後検証 scope として未設計/未観測を検出         |
| HVM-TAILOR-DIAGRAMS          | optional | 図面、依存グラフ、俯瞰図                                       | 簡易 | view/read-model の補助。完了条件にはしない             |
| HVM-TAILOR-INDEXES           | optional | 成果物 index、map、catalog                                     | 簡易 | 検索性と説明性の補助。DB projection が正本             |
| HVM-TAILOR-MOBILE-DESKTOP-NA | na       | mobile/desktop 固有設計                                        | 省略 | HELIX core には既定で要求しない                        |
| HVM-TAILOR-ENTERPRISE-NA     | na       | enterprise only governance、規制専用、課金専用                 | 省略 | 必要になった project profile だけで `add-feature` 採用 |

## §3 不変条件

1. `na` は不足ではない。Project view は missing と区別して表示する。
2. required が未検出なら、Forward 完了根拠にしない。
3. optional は設計可読性を補うが、完了 gate を単独で block しない。
4. 機能設計廃止は契約廃止ではない。契約は L5 詳細設計、typed declaration、TDD closure、runtime evidence へ移す。
5. mobile/desktop/enterprise 専用設計は HELIX core では既定 `na` とし、必要な consumer project だけが `add-feature` profile で採用する。
