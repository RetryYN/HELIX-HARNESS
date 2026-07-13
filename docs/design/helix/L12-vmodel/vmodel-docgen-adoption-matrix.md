---
title: "HELIX L12 Vモデル ZIP 採用マトリクス"
layer: L12
kind: design
status: confirmed
created: 2026-07-08
updated: 2026-07-14
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
related_l3: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
related_l12: docs/design/helix/L12-vmodel/vmodel-layer-coverage.md
tailoring_profile: docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md
pair_artifact: docs/test-design/helix/vmodel-docgen-fit-acceptance.md
source_package: ハイブリッド設計ドキュメントv1-fixed.zip
spec:
  defines:
    - id: HVM-ADOPT-01
      kind: ZIP採用判断
      title: YAML source and typed spec adoption
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-ADOPT-02
      kind: ZIP採用判断
      title: document coverage and tailoring adoption
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-ADOPT-03
      kind: ZIP採用判断
      title: traceability and impact adoption
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-ADOPT-04
      kind: ZIP採用判断
      title: WBS/current-location adoption
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-ADOPT-05
      kind: ZIP採用判断
      title: operation observability adoption
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-COMP-01
      kind: HELIX補完
      title: harness.db runtime evidence complement
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-COMP-02
      kind: HELIX補完
      title: Project view dynamic rendering complement
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-COMP-03
      kind: HELIX補完
      title: approval and action-boundary complement
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-REJECT-01
      kind: 非採用判断
      title: Python and Excel generator are reference only
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-REJECT-02
      kind: 非採用判断
      title: 全source文書の一律必須化を採用しない
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-REJECT-03
      kind: 非採用判断
      title: Excel buildを完了証跡の正本にしない
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-GAP-01
      kind: 実装ギャップ
      title: agent_meta.py相当(defines/read_first/done_when契約)未移植
      layer: L12
      owner: TL
      status: confirmed
    - id: HVM-GAP-02
      kind: 実装ギャップ
      title: diff_report.py相当(2時点diff・リリースノート自動生成)未移植
      layer: L12
      owner: TL
      status: confirmed
  refs:
    - from: HVM-ADOPT-01
      to: HR-FR-VMFIT-03
      kind: supports
    - from: HVM-ADOPT-02
      to: HR-FR-VMFIT-02
      kind: supports
    - from: HVM-ADOPT-03
      to: HR-FR-VMFIT-04
      kind: supports
    - from: HVM-ADOPT-04
      to: HR-FR-VMFIT-05
      kind: supports
    - from: HVM-ADOPT-05
      to: HR-FR-VMFIT-07
      kind: supports
    - from: HVM-COMP-01
      to: HR-FR-VMFIT-04
      kind: complements
    - from: HVM-COMP-02
      to: HR-FR-VMFIT-06
      kind: complements
    - from: HVM-COMP-03
      to: HR-FR-VMFIT-05
      kind: complements
    - from: HVM-REJECT-01
      to: HR-FR-VMFIT-01
      kind: constrains
    - from: HVM-REJECT-02
      to: HR-FR-VMFIT-02
      kind: constrains
    - from: HVM-REJECT-03
      to: HR-FR-VMFIT-04
      kind: constrains
    - from: HVM-GAP-01
      to: HR-FR-VMFIT-01
      kind: constrains
    - from: HVM-GAP-02
      to: HR-FR-VMFIT-01
      kind: constrains
---

# HELIX L12 Vモデル ZIP 採用マトリクス

## §0 位置づけ

本書は `ハイブリッド設計ドキュメントv1-fixed.zip` を HELIX へ取り込む際の、共通点・差異・採用判断・補完判断の
正本である。`docs/design/helix/L3-requirements/vmodel-docgen-fit.md` が構想と要件を定義し、本書はその判断を
L12 の機械検出対象として固定する。

ZIP は「Excel を作る道具」ではなく、YAML を SSOT として設計書、工程表、依存、カバレッジ、整合性チェックを
一体で回す汎用ドキュメント基盤である。HELIX には既に harness.db、runtime evidence、doctor、review gate、
VSCode read-model があるため、採用は置換ではなく **ZIP の設計抽出力を HELIX の駆動基盤へ接続する** 形に限定する。

## §1 ZIP 調査証跡

| 観点 | 確認結果 | HELIX 判断 |
|------|----------|------------|
| package size | 703 entries。`.yaml` 208、`.md` 161、`.xlsx` 263、`.png` 26、`.py` 29、`.json` 9、`.feature` 3、`.yml` 1、`.txt` 1 | ZIP 全体を一括 import せず、設計概念と検出契約だけを採用する |
| archive prefix | ZIP 内は `hybrid-docgen/` 配下に `docs/`、`tools/`、`build/` を持つ | HELIX の manifest 検査は prefix を正規化し、`docs/...` と `tools/...` を必須 source として検出する |
| source root | `docs/` が案件ソース、`templates/` が空スケルトン、`build/` が生成物 | HELIX では Markdown design と harness.db projection を正本にし、生成物は補助 evidence に留める |
| generator | `tools/build.py` が build / validate / coverage / deps / check / diagrams を持つ | Python 実装は reference-only。TS/Bun core へ契約だけ移植する |
| schemas | `schema/spec.schema.json` と `schema/doc.schema.json` | HELIX の typed declaration parser と DB schema に吸収する |
| V model | `107_Vモデル・レベル定義` が L1-L12 と release/operation を定義 | HELIX L0-L14 は L12 canonical view へ compatibility projection する |
| coverage | `catalog.yaml` と coverage command が採用状況と粒度を持つ | `design_coverage_gate` と `artifact_remap` に接続する |
| trace/impact | `traceability.yaml`、`98_編み目式Vモデル設計術`、`99_型付きスペック・自動検出設計書` | `design_references`、`design_impact`、relation graph に接続する |
| Scrum operation | `112_プロダクトバックログ`、`113_ユーザーストーリーマッピング`、`114_見積り・ベロシティ設計`、`115_リリースプラン`、`116_スプリント計画`、`117_DoR・DoD`、`118_デイリースクラム・進行記録`、`119_スプリントレビュー記録`、`120_レトロスペクティブ記録`、`121_バーンダウン・ベロシティ実績`、`29_受入基準・BDDシナリオ` | `scrum_operation`、Project view、skill binding、drive model 補助軸へ接続する |
| operation | `11_運用設計`、`20_計測・KPI`、`21_ログ・トレース`、`34_保守`、`62_インシデント` | L12 operation scope と Project view の未設計/未観測検出へ接続する |

`helix doctor` は `vmodel-zip-manifest` として、ZIP の entries、root prefix、拡張子分布、必須 source
`docs/107_Vモデル・レベル定義.yaml`、`docs/99_型付きスペック・自動検出設計書.yaml`、`docs/catalog.yaml`、
`docs/profiles.yaml`、`docs/52_文書化方針・テーラリング設計.yaml`、
`docs/112_プロダクトバックログ.yaml`、`docs/113_ユーザーストーリーマッピング.yaml`、
`docs/114_見積り・ベロシティ設計.yaml`、`docs/115_リリースプラン.yaml`、
`docs/116_スプリント計画.yaml`、`docs/117_DoR・DoD.yaml`、
`docs/118_デイリースクラム・進行記録.yaml`、`docs/119_スプリントレビュー記録.yaml`、
`docs/120_レトロスペクティブ記録.yaml`、`docs/121_バーンダウン・ベロシティ実績.yaml`、
`docs/29_受入基準・BDDシナリオ.yaml`、`tools/build.py`、`tools/spec_check.py`、`tools/spec_types.py`、
`tools/assign.py`、`tools/schedule.py` を機械検査する。ZIP が無い配布環境では advisory skip とし、
ZIP がある場合は必須 source 不足を violation とする。

## §2 共通点

| 共通点 | ZIP の形 | HELIX の形 | 統合後の不変条件 |
|--------|----------|------------|------------------|
| SSOT から複数成果物へ投影 | YAML を正本に Excel、図面、WBS、依存を生成 | Markdown/PLAN/runtime evidence を harness.db と read-model へ投影 | 正本は 1 箇所に閉じ、view や生成物は値を作らない |
| 参照切れを機械検出 | validate/check が ID 参照、重複、循環を検査 | doctor、plan lint、relation graph、design declarations が検査 | prose の雰囲気ではなく typed ID と DB row を完了根拠にする |
| 設計カバレッジを管理 | catalog/status/profile が採用・未作成・対象外を持つ | design coverage gate、artifact progress、current-location が状態を持つ | 未採用は `na`、不足は `missing`、再検証は `reverify` として区別する |
| 影響範囲を出す | deps/focus/impact が上流・下流・逆参照を返す | relation graph、completion packet、drive route が依存を返す | Reverse 時は文書依存と実装依存を必ず出す |
| 運用後まで V に含める | 運用、KPI、ログ、保守、インシデントを文書化する | runtime verification、guardrail decision、operation evidence を DB 化する | 運用後スコープは任意メモではなく L12 coverage 対象にする |

## §3 差異

| 差異 | ZIP | HELIX | 採用判断 |
|------|-----|-------|----------|
| core 実行基盤 | Python tool と Excel/Sheets 出力中心 | TS/Bun CLI、SQLite harness.db、doctor、runtime adapters | Python/Excel を core runtime に入れない。契約だけ TS/Bun に移す |
| 正本粒度 | YAML 文書単位の汎用テンプレート | PLAN、設計 doc、test-design、runtime evidence、DB projection | YAML 文書一覧をそのまま HELIX 層にせず、L12 coverage contract へ正規化する |
| runtime evidence | live/check はあるが、実行証跡の provenance は薄い | test_runs、gate_runs、runtime_verification_events、guardrail_decisions を持つ | HELIX の runtime evidence を維持し、ZIP の coverage/impact を入力にする |
| action boundary | build/validate/coverage はローカル操作が中心 | action-binding approval、destructive guard、review bundle を持つ | close/apply/migration は approval record なしで実行しない |
| view | build artifact と静的表が中心 | VSCode Project/HARNESS view の動的 read-model | ZIP の検出結果を Project view に出す。HARNESS view とは分ける |
| 個人開発負荷 | 53 文書をそのまま採用すると重い | workflow/drive model で必要な粒度へ絞れる | 機能設計の重い独立層は廃止し、詳細設計と typed declaration に吸収する |

## §4 採用するもの

| ID | 採用対象 | 採用理由 | HELIX 側の受け皿 |
|----|----------|----------|------------------|
| HVM-ADOPT-01 | YAML SSOT と typed spec の考え方 | 設計から構造・ID・依存を自然抽出できる | `design_declarations`、`design_references`、`vmodel_zip_source_bindings` |
| HVM-ADOPT-02 | catalog/profile/tailoring | 個人開発で必要な設計だけを採用し、過剰文書化を避けられる | `design_coverage_gate`、`artifact_remap`、L5 詳細設計 |
| HVM-ADOPT-03 | traceability/deps/impact | 設計変更の影響範囲と Reverse 対象を出せる | `design_impact`、relation graph、drive route |
| HVM-ADOPT-04 | WBS/工程表と V レベル | 「いまどこか」を番号記憶ではなく ledger として扱える | `current-location`、roadmap band/gate、closure queue |
| HVM-ADOPT-05 | 運用・ログ・KPI・保守・インシデント設計 | L12 運用後検証を開発管理画面と運用時可視化へ出せる | `operation_scope`、runtime verification、Project view |

## §5 HELIX が補うもの

| ID | ZIP 側の弱点 | HELIX の補完 | 必須条件 |
|----|--------------|--------------|----------|
| HVM-COMP-01 | 設計カバレッジと実行証跡が分離しやすい | harness.db が design、test、runtime、guardrail を同じ現在地へ投影する | current-location は DB projection から答える |
| HVM-COMP-02 | 生成物中心だと今の矛盾や不足が見えにくい | VSCode Project view が矛盾、closure queue、impact、operation gap、ZIP source binding を動的描画する | view は read-only。値を捏造しない |
| HVM-COMP-03 | build/check の実行境界が軽い | approval record、review bundle、dry-run、doctor gate で高影響操作を閉じる | correction 2026-07-12: 可逆なclose_ready accepted化はreview digest一致・tests/gates green・apply dry-run成功の機械証跡で自走可。PLAN-L7-146、PLAN-M-02、external publish、charter P8はhuman承認を維持（PLAN-L7-425 I8 / PLAN-L7-433） |

## §6 採用しないもの

| ID | 非採用対象 | 理由 | 代替 |
|----|------------|------|------|
| HVM-REJECT-01 | ZIP の Python generator / Excel builder を HELIX core runtime として移植する | ADR-001 に反し、HELIX の TS/Bun core、DB projection、runtime evidence を弱める | Python は reference。必要な検出契約を TS/Bun で再実装する |
| HVM-REJECT-02 | 53 文書を全案件で必須化する | 個人開発には重く、機能設計廃止の狙いに逆行する | catalog/profile/tailoring を使い、L12 coverage gate で必要な契約だけを要求する |
| HVM-REJECT-03 | Excel build を完了証跡の正本にする | 生成物は stale になり得る | Markdown source、typed declaration、harness.db、runtime evidence を正本にする |

## §7 L12 への効果

この採用マトリクスにより、HELIX の L12 化は番号の再命名ではなく、以下の検出契約になる。

1. L0 は V 字を壊す独立メタ層ではなく、L1 企画へスライド投影する。
2. 機能設計は独立層として重くせず、L5 詳細設計、typed declaration、L7 TDD closure、runtime evidence へ契約を移す。
3. 工程表は schedule ではなく、DB 現在地を確定する ledger として扱う。
4. Reverse は「戻った方がよさそう」ではなく、文書依存・実装依存・acceptance criteria を伴う修正 route として出す。
5. Project view は `harness.db -> read-model -> tree` の投影面であり、手入力の管理画面にしない。
6. 運用後のログ、KPI、class/method contract、障害時 route は L12 coverage として未設計/未観測を検出する。

## §8 テーラリングプロファイル

ZIP の `catalog.yaml` / `profiles.yaml` / `52_文書化方針・テーラリング設計` は、HELIX では
`docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md` を正本として取り込む。個人開発では、
required / optional / na を typed declaration で明示し、`na` を missing と誤判定しない。
この profile により、重い独立機能設計は廃止しつつ、L5 詳細設計・typed declaration・TDD closure・runtime evidence へ
契約を移す。

## §9 実装監査ログ (2026-07-14)

`§4 採用するもの` / `§5 HELIX が補うもの` は L12 の採用判断であり、本書冒頭 §0 と
`docs/design/helix/L12-vmodel/vmodel-layer-coverage.md` §0 が明記するとおり「実装完了の宣言ではない」。
2026-07-14、PO 指示 (`/goal` 2026-07-14) により、ZIP の tools/*.py 29本相当と HELIX 側受け皿の
計36項目について、4パス独立監査 (Claude 主監査 + Codex frontier `gpt-5.6-sol` + Codex worker
`gpt-5.6-terra` + 独立 Claude 再監査) で `src/` の実コードを確認した。監査手法・individual 判定・
食い違い項目の裁定記録はセッション transcript および harness memory
(`harness:hybrid-docgen-engine-audit-2026-07-14`) を参照。

### §9.1 全会一致で未移植 (対応候補)

| ID | ZIP 側の元機能 | 確認結果 | 根拠 |
|----|-----------------|----------|------|
| HVM-GAP-01 | `tools/agent_meta.py` (agent メタデータ `defines`/`read_first`/`done_when` の導出・付与・突合) | `src/` に該当契約なし。`.claude/agents/*.md` frontmatter は `name/description/tools/model/effort/memory` のみ | 4/4 監査一致 (未実装) |
| HVM-GAP-02 | `tools/diff_report.py` (2時点 docs/ 比較による日本語差分レポート・リリースノート自動生成) | `src/` に意味単位 diff・リリースノート生成の実装なし (`change-package-delta-archive.ts` はある種の delta/archive 検査だが 2 スナップショット比較+自然文レポートではない) | 4/4 監査一致 (未実装) |

この 2 件は `§6 採用しないもの` の明示的非採用判断 (HVM-REJECT-01/02/03) の対象外であり、
「意図的な不採用」ではなく「未着手のまま記録が欠落していた」ギャップである。§4 の採用対象に
含めるかどうかは後続 PLAN で判断する (本書は監査事実の記録のみを行い、新規実装の意思決定はしない)。

### §9.2 部分実装 (縮小スコープでの代替実装あり)

| ZIP 側の元機能 | HELIX 側の代替 | 差分 |
|-----------------|-----------------|------|
| `tools/consistency.py` (表記ゆれ辞書・ADR宣言↔実態突合) | `src/lint/doc-consistency.ts` | carry-consistency / screen-id-validity / nfr-count の3項目限定。ADR横断突合・表記ゆれ辞書は無い |
| `tools/schedule.py` (WBS×Vモデル×台帳RAG×カバレッジの工程表連携) | `src/lint/roadmap-registry.ts` + `current-location.ts` の roadmap gate | PLAN frontmatter 由来の roadmap 追跡はあるが、WBS/ガント形式の生成は無い |
| `tools/agent_docs.py` (目的別 Markdown ダイジェスト生成) | `src/context/doc-router.ts` | task 種別に応じた動的 section 選択で代替。静的ダイジェストファイル生成ではない |
| `tools/verify_files.py` (文字化け・UTF-8・YAML破損の統合検査) | `src/lint/secret-scan.ts` + `src/lint/readability.ts` | secret 検出と mojibake 検出は別々に存在するが、YAML破損・PNG検査を含む統合gateではない |

### §9.3 監査結論

HELIX 側受け皿 (`§4`/`§5` の B系列、18項目) は 4/4 監査で実質満場一致の実装済み。ZIP の Python
エンジン本体の概念移植 (A系列、18項目) は 3 項目実装済み・13 項目部分実装・2 項目未実装。
総合搭載率は算定方法により 69%〜76% (単純平均76%、エンジン側を2倍加重した場合69〜72%)。
