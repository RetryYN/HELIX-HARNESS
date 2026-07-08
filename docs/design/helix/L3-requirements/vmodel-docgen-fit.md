---
title: "HELIX L3 要件 — ハイブリッド設計ドキュメントv1-fixed.zip 適合構想"
layer: L3
kind: add-design
status: draft
freeze_blocking: false
created: 2026-07-08
updated: 2026-07-08
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l3: docs/design/helix/L3-requirements/pillar-functional-requirements.md
related_l12: docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
pair_artifact: docs/test-design/helix/vmodel-docgen-fit-acceptance.md
next_pair_freeze: L12
spec:
  defines:
    - id: HR-FR-VMFIT-01
      kind: 機能要件
      title: ZIP 採用境界
      layer: L3
      owner: TL
      status: draft
    - id: HR-FR-VMFIT-02
      kind: 機能要件
      title: L12 map と機能設計廃止境界
      layer: L3
      owner: TL
      status: draft
    - id: HR-FR-VMFIT-03
      kind: 機能要件
      title: typed design declaration
      layer: L3
      owner: TL
      status: draft
    - id: HR-FR-VMFIT-04
      kind: 機能要件
      title: DB projection と工程表
      layer: L3
      owner: TL
      status: draft
    - id: HR-FR-VMFIT-05
      kind: 機能要件
      title: current-location と drive model
      layer: L3
      owner: TL
      status: draft
    - id: HR-FR-VMFIT-06
      kind: 機能要件
      title: VSCode view
      layer: L3
      owner: TL
      status: draft
    - id: HR-FR-VMFIT-07
      kind: 機能要件
      title: 運用後検証と log/KPI
      layer: L3
      owner: TL
      status: draft
    - id: HR-FR-VMFIT-08
      kind: 機能要件
      title: drive model skill binding
      layer: L3
      owner: TL
      status: draft
    - id: HOPS-VMFIT-OPTEST-01
      kind: 運用テスト設計
      title: 運用テスト scope
      layer: L12
      owner: TL
      status: draft
    - id: HOPS-VMFIT-CONTRACT-01
      kind: class/method contract
      title: class/method contract for operation observability
      layer: L5
      owner: TL
      status: draft
    - id: HOPS-VMFIT-INCIDENT-ROUTE-01
      kind: 障害時逆流 route
      title: incident recovery route to Recovery/Reverse
      layer: L12
      owner: TL
      status: draft
    - id: HOPS-VMFIT-SCRUM-BACKLOG-01
      kind: Scrum backlog
      title: hybrid product backlog / G-EP-US projection
      layer: L3
      owner: TL
      status: draft
    - id: HOPS-VMFIT-SCRUM-SPRINT-01
      kind: スプリント計画
      title: hybrid sprint plan / current sprint operation
      layer: L7
      owner: TL
      status: draft
    - id: HOPS-VMFIT-SCRUM-AC-01
      kind: Scrum acceptance BDD
      title: hybrid acceptance criteria / BDD scenario projection
      layer: L11
      owner: TL
      status: draft
    - id: HOPS-VMFIT-SKILL-BINDING-01
      kind: skill binding projection
      title: drive model / Scrum / L12 layer skill binding
      layer: L7
      owner: TL
      status: draft
---

# HELIX L3 要件 — ハイブリッド設計ドキュメントv1-fixed.zip 適合構想

## §0 位置づけ

本書は `ハイブリッド設計ドキュメントv1-fixed.zip` を HELIX に適合させるための L3 構想正本である。
結論は **置換ではなく統合** である。ZIP は個人開発向けに軽い L12 Vモデル、型付き設計宣言、
impact、成果物 catalog、tailoring、工程表を持つ。一方で現行 HELIX は harness.db projection、
runtime evidence、VSCode visualization read-model、review/gate、doctor を既に持つ。

したがって、ZIP の狙いは HELIX の P3/P9/P4 を強化する設計入力として採用する。Python generator や Excel 出力を
core runtime として持ち込まず、ADR-001 に従って TS/Bun の HELIX core に再実装する。
共通点、差異、採用対象、HELIX 側の補完、非採用対象の判断正本は
`docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md` とし、typed declaration として DB projection へ
投影できる形で維持する。

## §1 ZIP 理解

ZIP の本質は「文書生成セット」ではなく、次の 6 点を同時に閉じる設計駆動モデルである。

| 観点 | ZIP で確認した構造 | HELIX に採る意味 |
|------|--------------------|------------------|
| L12 Vモデル | `docs/107_Vモデル・レベル定義.yaml`。L1 企画、L2 要求と画面、L3 要件凍結、L4 基本、L5 詳細+テスト設計、L6 実装、L7 TDD closure、L8-L12 検証/運用 | 現 HELIX の L0 は V 字成立のためのスライド調整として扱い、compat projection を挟んで L12 canonical へ寄せる |
| 設計原則 | `docs/96_設計原則(7つの柱)設計書.yaml`。捕捉性、TDD、拡張性、検証戦略、非機能、AI 中間 JSON、観測性 | HELIX P3/P4/P9 と一致。検出を prose ではなく typed declaration へ寄せる |
| spec 駆動 | `docs/97_スペック駆動開発・トレース閉包設計書.yaml`。spec SSOT、test design -> test -> implementation、trace closure | HELIX の pair-freeze と runtime evidence に接続する |
| impact | `docs/98_編み目式Vモデル設計術.yaml`、`tools/spec_check.py`。影響範囲、依存文書、上流/下流/逆参照を返す | HELIX DB の relation graph / completion packet / Project view に投影する |
| 型付き宣言 | `docs/99_型付きスペック・自動検出設計書.yaml`。`spec.defines` を読む。heuristic words/globs 依存を減らす | design docs に typed design declaration を導入し、detector の正本にする |
| tailoring | `docs/52_文書化方針・テーラリング設計.yaml`。詳細/標準/簡易/省略 | 機能設計を独立層として重くせず、詳細設計側で厳格な検出可能契約を定義する根拠にする |

ZIP 検証では、構造チェック、typed spec 宣言一致、impact が機械的に成立していた。`--live` では stale、
未実装、test fail を red/yellow として出せるため、設計と実装のデグレ対策として有効である。

## §2 現行 HELIX との共通点

| 共通点 | HELIX 側の既存正本 | 統合判断 |
|--------|--------------------|----------|
| 設計カバレッジを完了根拠にしない | `HR-FR-P3-*` / `HR-NFR-P3-*` | ZIP の trace closure を DB evidence と review evidence に接続する |
| DB へ収束して現在地を出す | `HR-FR-P9-01..03`、`VisualizationSnapshot` | ZIP の catalog/spec/工程表を harness.db projection source にし、工程表とDB現在地を結ぶ |
| 影響範囲を機械検出する | relation graph / contract ledger | ZIP の impact query を relation graph の query family として取り込む |
| 可視化は read-only | `visualization-requirements.md` | ZIP の検出結果を view 入力にし、view は値を作らない |
| 運用後検証を右腕に含める | L13/L14、runtime evidence、metric event | ZIP の L12 運用テストを HELIX の post-release verification と対応させる |

## §3 差異と判断

| 差異 | ZIP | 現行 HELIX | 判断 |
|------|-----|------------|------|
| L階層 | L1-L12 | L0-L14 | L12 を canonical target にする。ただし現行成果物は compatibility layer で再投影し、破壊的 rename はしない |
| 機能設計 | 実装全体を明確化する狙いはあるが、個人開発では独立層が重くなりやすい | L6 機能設計が独立層 | 独立した重い機能設計は廃止し、詳細設計側で詳しく定義する。機械契約は typed declaration、詳細設計、TDD oracle に移す |
| 実装言語 | Python tools + Excel/Markdown generation | TS/Bun core + SQLite DB | Python は reference。HELIX core は TS/Bun で再実装 |
| 正本 | YAML/Markdown/Excel build | Markdown + harness.db + runtime evidence | Excel は補助出力。正本は Markdown source と DB projection |
| runtime evidence | live status は test status を読むが、runtime provenance は薄い | test_runs / runtime_verification_events / guardrail_decisions | HELIX 側を維持し、ZIP の検出結果を runtime provenance に接続する |
| view | 成果物生成と静的工程表が中心 | VSCode read-model/view-model | ZIP の検出結果を VisualizationSnapshot に入れ、動的描画する |

直接置換すると HELIX の DB projection、runtime evidence、review gate、VSCode view が弱くなりデグレする。
統合すれば、ZIP の設計抽出力と HELIX の実行証跡が噛み合い、設計カバレッジとデグレ対策は改善される。

## §4 L12 化の設計判断

L12 化は、単なる番号変更ではない。正しい完了境界を再定義する migration である。

| ZIP L | 役割 | 現行 HELIX からの再投影方針 |
|-------|------|------------------------------|
| L1 | 企画/価値/方針 | 現 `L0-charter` は V 字に見えなくなったためのスライド調整として扱い、L12 canonical view では L1 企画へ投影する |
| L2 | 要求/画面/業務フローの引き出し | 現 L1/L2 の要求・画面・mock cycle を集約する |
| L3 | 要件凍結/FR/AC | 現 L3 を維持し、typed declaration と acceptance trace を必須化する |
| L4 | 基本設計 | 現 L4 を維持する |
| L5 | 詳細設計+テスト設計契約 | 現 L5 と現 L6 機能設計の必要契約を吸収し、詳細設計側で実装全体を検出可能な粒度まで定義する |
| L6 | 実装 | 現 L7 implementation sprint の実装面を対応させる |
| L7 | TDD closure | Red/Green/refactor、pair-agent、unit oracle を対応させる |
| L8-L11 | 単体/結合/総合/受入 | 現 L8-L12 の検証面を再割当する。機械的な番号置換ではなく test evidence の意味で移す |
| L12 | 運用テスト/運用後検証 | 現 L13/L14 の post-release verification、ログ、KPI、障害/改善 route を対応させる |

`layer: cross` の既存 PLAN は未分類のまま残さない。`PLAN-DISCOVERY-*` は L3 要件/方式判断、
`PLAN-REVERSE-*` は L5 詳細設計+テスト設計への戻し、`PLAN-RECOVERY-*` は L12 運用/復旧検証として
compatibility projection へ写す。未知の cross PLAN だけを `artifact_remap_unmapped` finding とし、
既知の cross PLAN は `artifact_remap` で `done / reverify` に分類する。

この migration は高 blast radius である。最初に `layer_compat_projection` を DB/view に追加し、
現行 L0-L14 と L12 canonical の二重表示を green にしてから、schema enum や PLAN ID policy を変える。

## §5 HELIX DB と工程表の再設計

工程表は schedule ではなく、現在地を決める ledger にする。正本は harness.db であり、Markdown/PLAN/roadmap は
projection source または説明面である。

必須 projection:

| projection | 入力 | DB/read-model の期待 |
|------------|------|----------------------|
| `design_declarations` | Markdown/YAML frontmatter と `spec.defines` 相当 | artifact id、kind、layer、owner、defined id、source path、status |
| `design_references` | `spec.refs` 相当、trace table、pair artifact | upstream/downstream/reverse refs、missing/stale/unused |
| `design_impact` | `spec.refs`、trace table、doc/code dependency | 影響 layer、依存文書、実装依存、修正対象 |
| `current_location` | layer status、roadmap band、PLAN status、gate/test/runtime evidence | 工程表と DB 現在地を結び、current layer、completion boundary、frontier、next drive model を返す |
| `drive_model_recommendations` | current_location + impact + risk | 原則 Forward。Reverse が必要な場合は、設計/テスト設計へ戻す該当範囲、文書依存、実装依存、修正対象を理由付きで返す |
| `skill_bindings` | selected drive model、Scrum 運営状態、L12 layer、`automation_assets` の skill metadata | skill 本文を一括 load せず、必要 skill、inject timing、根拠 layer/drive model、Project view 表示を返す |
| `operation_observability_scope` | log design、metric/KPI、runtime verification、incident route、class/method contract | L12 運用後検証の未設計/未観測を検出し、開発管理画面と運用時可視化へ渡す |

この設計により、「L14まで進んだはずなのに L7 起票が出る」問題は、番号の記憶ではなく DB 上の
`current_location` と `drive_model_recommendations` の不整合として検出できる。

## §6 VSCode view 方針

VSCode view は手入力の管理画面にしない。`VisualizationSnapshot` / view-model が DB projection を読み、
Project view と HARNESS view を分ける。本書で扱うのは **Project view** であり、搭載中プロジェクトの現在地、
設計カバレッジ、依存影響、証跡を read-only に描画する。HARNESS view はハーネス自身の成長・運用状態を別 root で扱う。

- L12 canonical と現 L0-L14 compatibility の対応。
- design declarations の coverage、orphan、unused、stale。
- impact query。
- roadmap band と current location。
- drive model recommendation と、その根拠になった DB rows。
- runtime evidence、log/KPI/operation verification の未観測。

view は mutation を実行しない。command copy、drill-down、source path pointer までに限定し、実行・外部 API・
設定変更は既存 action-binding approval 境界へ送る。

## §7 要件

| ID | 要件 | 主な AC |
|----|------|---------|
| HR-FR-VMFIT-01 | HELIX は ZIP を core replacement ではなく design extraction / coverage / impact / tailoring の reference として取り込み、TS/Bun core に再実装する | HAC-VMFIT-01a/b |
| HR-FR-VMFIT-02 | L12 canonical layer map と現 L0-L14 compatibility projection を持ち、独立した重い機能設計層を L5 詳細設計 + typed declaration + L7 TDD closure へ吸収する migration 方針を示す | HAC-VMFIT-02a/b |
| HR-FR-VMFIT-03 | design docs は `spec.defines` 相当の typed design declaration を持てるようにし、heuristic-only detection を完了根拠にしない | HAC-VMFIT-03a/b |
| HR-FR-VMFIT-04 | design declaration、trace、impact、live evidence を harness.db に投影し、工程表と DB 現在地を結んで current-location を確定する | HAC-VMFIT-04a/b |
| HR-FR-VMFIT-05 | current location から drive model を推奨し、原則 Forward、必要時 Reverse の設計/テスト設計戻り範囲と文書/実装依存を検出する | HAC-VMFIT-05a/b |
| HR-FR-VMFIT-06 | VSCode Project view は DB/read-model 由来の L12 map、impact、current location、drive recommendation を read-only に描画する | HAC-VMFIT-06a/b |
| HR-FR-VMFIT-07 | ログ設計、KPI、runtime verification、operation test、class/method contract、障害時の Recovery/Reverse 逆流 route を L12 運用後検証の設計カバレッジ対象に含め、未設計/未観測を検出する | HAC-VMFIT-07a/b/c |
| HR-FR-VMFIT-08 | selected drive model、Scrum 運営状態、L12 layer から skill binding を機械選択し、Project view と `vmodel fit` に read-only 投影する | HOPS-VMFIT-SKILL-BINDING-01 |

### §7.1 運用後検証の typed scope

| ID | 種別 | 定義 |
|----|------|------|
| HOPS-VMFIT-OPTEST-01 | 運用テスト設計 | L12 運用テストで log design、KPI、runtime verification、operation test を機械検出対象にする |
| HOPS-VMFIT-CONTRACT-01 | class/method contract | 運用時可視化へ渡す class/method 契約を短い実装で維持できる粒度に固定する |
| HOPS-VMFIT-INCIDENT-ROUTE-01 | 障害時逆流 route | 運用後の incident / failure を Recovery または Reverse へ戻し、closure queue、recovery plan、runtime verification evidence で再検証する経路を機械検出対象にする |
| HOPS-VMFIT-SCRUM-BACKLOG-01 | Scrum backlog | ハイブリッド版の G/EP/US を product backlog として検出し、L12 要求/要件/実装 frontier へ接続する |
| HOPS-VMFIT-SCRUM-SPRINT-01 | スプリント計画 | 現在スプリントを `plan_registry` と Project view の Scrum operation に投影し、Forward/Reverse の起点にする |
| HOPS-VMFIT-SCRUM-AC-01 | Scrum acceptance BDD | AC/BDD を acceptance traceability と L12 運用後検証の観測対象へ接続する |
| HOPS-VMFIT-SKILL-BINDING-01 | skill binding projection | selected drive model、Scrum 運営状態、L12 layer、`automation_assets` metadata から required/recommended/optional skill を算出し、本文一括 load なしで Project view に出す |

L12 operation scope は、`designed` と `observed` を分離する。typed declaration で検出されたが
accepted runtime evidence に接続されていない scope は `observed_gap` として Project view / CLI /
doctor に表示し、設計済みであることを理由に運用観測済みへ昇格しない。

## §8 後続実装順序

1. `typed design declaration` の TS schema を追加する。
2. design declarations / references / impact を harness.db へ projection する。
3. L12 canonical と L0-L14 compatibility の read-model を追加する。
4. roadmap registry と harness.db 現在地を結び、current-location ledger として拡張する。
5. drive-model selector を追加し、原則 Forward、必要時 Reverse/Additive/Recovery/Refactor を理由付きで返す。Reverse では設計/テスト設計へ戻す範囲、文書依存、実装依存を必ず出す。
6. `VisualizationSnapshot` と view-model に Project view 用の L12/current-location/impact/operation scope を追加する。
7. green 後に L番号 schema / PLAN ID policy / docs template の migration PLAN を起票する。

## §9 不変条件

1. ZIP の Python/Excel generator を HELIX core runtime にしない。
2. L番号 migration は compatibility projection から始め、既存成果物を破壊しない。
3. 機能設計廃止は契約廃止ではない。必要な契約は typed declaration、詳細設計、TDD oracle、runtime evidence に移す。
4. current location は prose ではなく harness.db projection から答える。
5. view は値を作らず、DB/read-model の矛盾を隠さない。
6. 運用後のログ/KPI/trace/class/method contract は任意メモではなく L12 検証カバレッジ対象にする。
