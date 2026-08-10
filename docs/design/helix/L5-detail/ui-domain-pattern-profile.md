---
title: "HELIX L5 詳細設計 — UI Domain・Pattern Profile"
layer: L5
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-10
owner: Claude / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-UDP-01
related_l3: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
related_l4: docs/design/helix/L4-basic-design/ui-domain-pattern-profile.md
pair_artifact: docs/test-design/helix/L5-ui-domain-pattern-profile-integration-test-design.md
next_pair_freeze: L6
requirements:
  - VDH-FR-003
  - VDH-FR-005
  - HR-FR-DHR-004
github_issue_id: 209
---

# HELIX L5 詳細設計 — UI Domain・Pattern Profile

Issue #209 の primary scope（VDH-FR-003 の semantic ID 主キー原則、VDH-FR-005 の
Pattern Contract / UI profile、HR-FR-DHR-004 の risk-based pairwise fixture 選定）を
詳細設計する。registry 台帳（HR-FR-DHR-001）は #177 が primary owner であり、本設計の
entity は registry の typed consumer として `SCR-`/`CMP-`/`TOK-`/`CNT-` 系 ID 空間を
共有する（台帳の複製新設をしない）。responsive/viewport evidence の実測（VDH-FR-011）は
#211、chain 追跡（HR-FR-DHR-003）は #210 が primary owner。

VDH-FR-003 の 6 概念のうち `action` は #177 registry の `interaction`（`INT-`）kind、
`binding` は #177 の `binds` relation（edge_id + semantic_digest による意味主キー）へ
delegate し、本設計は consumer trace のみを保持する（担保先を欠く概念を残さない）。

## §1 UI Domain の entity 型付け（VDH-FR-003）

semantic ID を意味主キーとし、class 名・file path・DOM selector を主キーにしない
（fail-close）。ID 基本形は #177 L5 §2 の `^[A-Z]{3}-[a-z0-9][a-z0-9-]*$` を共有し、
kind 別 prefix を次で新設する（#177 の既存 prefix SCR-/CMP-/TOK-/CNT- は再利用し、
重複新設しない）。

| entity kind | prefix | 意味 | 由来正本 |
|---|---|---|---|
| page | `SCR-` | 画面（#177 registry / `screens` 台帳と同一 ID 空間） | L2 screen-list |
| user_flow | `FLW-` | 画面横断フロー（#177 と共有） | L2 screen-flow / business-flow |
| navigation | `NAV-` | ナビゲーション構造（global/local/breadcrumb） | L2 screen-flow |
| region_slot | `RGN-` | 画面内 region と slot（配置の意味単位） | L2 wireframe |
| ui_component | `CMP-` | UI 部品（#177 と共有） | L2 ui-element |
| interaction_pattern | `PTN-` | 操作パターン（form/submit/undo 等の型） | L2 screen-detail |
| design_token | `TOK-` | design token（#177 と共有） | UI profile |
| content | `CNT-` | 文言・コンテンツ（#177 と共有） | L2 screen-detail |
| feedback | `FBK-` | フィードバック表示（toast / dialog / progress / inline error） | L2 screen-detail |
| ui_state | `UST-` | 画面状態（Empty / Error / Permission / Loading） | L2 screen-detail |

prefix の住み分け（#177 との衝突回避を明文で確定する）: #177 の `STA-`＝state machine の
状態ノード（registry の `state` kind）、本設計の `UST-`＝画面**表示**状態（Empty / Error /
Permission / Loading の表示分岐）であり別概念。#177 の `INT-`＝操作**インスタンス**
（interaction）、本設計の `PTN-`＝操作**パターンの型**（Pattern Contract の単位）であり
別概念。`PRF-`（UI Profile）は entity kind 体系外の policy document prefix として新設し、
`UiEntityKindV1` には含めない。`Loading` は Issue #209 列挙（Empty/Error/Permission）への
実務的追加であり、表示状態の網羅目的で Issue の意図を損なわない（設計判断として明記）。

各 entity は `entity_id` / `kind` / `revision` / `authority`（shadow→canonical→stale→retired、
#177 §3 と同一遷移）/ `semantic_digest` / `source_pointer` を持ち、version 行と authority
遷移は registry（#177）へ consumer trace として登録する（本設計側に別 version 台帳を
新設しない）。

## §2 Pattern Contract と UI Profile（VDH-FR-005）

- **Pattern Contract**: `pattern_id`（`PTN-`）ごとに `required[]` / `forbidden[]`
  （entity kind × 条件の typed 制約）を持つ。AI は白紙生成せず、contract 内でのみ構成する。
  required/forbidden の同一対象への競合宣言は `UDP_CONTRACT_CONFLICT` で fail-close。
  wildcard（target_id 未指定 = kind 全体）と具体 ID の交差（同一 kind + condition で
  片側 wildcard・他側具体 ID の required/forbidden 交差）も矛盾契約として同 failure で
  fail-close する。
- **UI Profile**: `profile_id`（`PRF-` prefix、単一 product 単位）は
  情報優先順位（information_priority: ranked entity 参照列）、pattern/token 許容集合、
  responsive 制約（breakpoint class と layout 変形規則の宣言。実測 evidence は #211）、
  motion budget + reduced-motion 代替、accessibility 制約（focus order / contrast class /
  aria 必須点）、brand 制約、surface 分類（`operational | expressive | mixed`）を持つ。
- **Rule Pack 隔離**: 共通 Rule Pack（product 非依存の共通制約）と product profile を
  型で分離し、product 固有値（brand color 値・product 文言等）が共通 Rule Pack へ
  混入した場合は `UDP_PRODUCT_VALUE_IN_COMMON_PACK` で fail-close する。判定は
  「共通 pack 内の値 field が product namespace（profile_id 参照・brand token 実値）を
  含むか」の機械検査とし、判定は大文字小文字を正規化した部分一致（contains）で行う
  （完全一致のみでは CSS への埋め込みや hex 表記ゆれで fail-open するため）。

## §3 risk 起点の pairwise fixture 選定（HR-FR-DHR-004）

8 軸（device / input / role / locale / data_volume / network / concurrent_update /
destructive_undo）の全 Cartesian product を fixture 化することを禁止し（fail-close）、
risk-based pairwise で有限 fixture へ選定する。

- 各軸は有限の typed level 集合を持つ（例として device 軸は desktop|tablet|mobile、
  network 軸は fast|slow|offline、destructive_undo 軸は none|destructive|destructive_with_undo
  の有限集合とする）。
- **risk 宣言**: 軸 level の組に `risk_class`（`high | medium | low`）を宣言する
  risk matrix を入力とする。risk entry は軸の**部分指定**を許す（例: device=mobile ×
  network=offline のみ指定）。high risk entry は「指定軸を固定 seed とする fixture を
  最低 1 件、決定的に生成して**全 entry を包含**」し、未指定の残余軸は pairwise 選定
  アルゴリズムが決定的に補完する（残余軸の Cartesian 展開はしない）。medium/low は
  pairwise（全 2 軸組合せの被覆）で選定する。
- **被覆保証**: 選定結果は (a) 全 2 軸ペアの被覆 100%、(b) high risk 組の全件包含、
  (c) fixture 数の決定的上限（同一入力 → 同一 fixture 列）を満たす。未被覆ペアが残る
  選定は `UDP_PAIRWISE_UNCOVERED` で fail-close する。

## §4 typed failure（正本 enum）

`UDP_ID_INVALID`（ID regex 逸脱・class/path 主キー）、`UDP_CONTRACT_CONFLICT`
（required/forbidden 競合）、`UDP_PRODUCT_VALUE_IN_COMMON_PACK`（隔離違反）、
`UDP_PROFILE_INCOMPLETE`（a11y/motion 代替・reduced-motion 欠落等の profile 必須欠落）、
`UDP_CARTESIAN_EXPLOSION`（pairwise を経ない全積 fixture）、`UDP_PAIRWISE_UNCOVERED`
（ペア被覆欠落）、`UDP_RISK_UNCOVERED`（high risk 組の欠落）、`UDP_STALE_INPUT`
（schema/version 不一致）。`UDP_STALE_INPUT` は全 pure API 共通の入口検査
（declaration/contract/profile/pairwise 入力の schema_version 不一致、および
`authority=stale|retired` の entity を canonical として渡す入力）が返す。

## §5 canonical assertion primary表

| HST正本 | 主対象 | 主U | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|
| `HST-UDP-001` | UiDomainCanonicalizer | `U-UDP-001` | raw宣言 | typed entity | `UDP_ID_INVALID` / `UDP_STALE_INPUT` |
| `HST-UDP-002` | PatternContractValidator | `U-UDP-002` | contract宣言 | validated contract | `UDP_CONTRACT_CONFLICT` / `UDP_STALE_INPUT` |
| `HST-UDP-003` | RulePackIsolationGuard | `U-UDP-003` | 共通pack+product profile | 隔離保証 | `UDP_PRODUCT_VALUE_IN_COMMON_PACK` / `UDP_STALE_INPUT` |
| `HST-UDP-004` | UiProfileValidator | `U-UDP-004` | profile宣言 | 完備profile | `UDP_PROFILE_INCOMPLETE` / `UDP_STALE_INPUT` |
| `HST-UDP-005` | PairwiseFixtureSelector | `U-UDP-005` | 8軸+risk matrix | 有限fixture列 | `UDP_CARTESIAN_EXPLOSION` / `UDP_PAIRWISE_UNCOVERED` / `UDP_RISK_UNCOVERED` / `UDP_STALE_INPUT` |

## §6 Design Reality Binding契約

本 doc は設計フェーズの正本であり、runtime asset（`src/design/ui-domain-pattern-profile.ts`
等）は実装スライスで生成する。typed failure（`UDP_*`）の executable-oracle 到達性 witness は
実装スライスの test 着地時に本 binding へ追記する（着地前に到達性を主張しない）。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```

## §7 freeze条件

L5↔L8 pair は、U-UDP-001〜005 の単体 oracle と IT-UDP-001〜002 の結合 oracle が
typed failure・mutation 反例つきで green になるまで draft とする。class/path 主キーの混入、
required/forbidden 競合の黙認、product 値の共通 Rule Pack 混入、全積 fixture、
high risk 組の欠落、および schema_version 不一致・stale/retired 入力の黙認
（`UDP_STALE_INPUT` の未実装）は freeze を block する。

## §8 実 asset 正本と抽出規約（PLAN-L7-540、SA-UDP-02/03 の上流）

実 asset 正本は `config/ui-domain/harness-console-bundle.json`（`ui-domain-bundle.v1`）の
1 file とし、domain / contract / profile / pack / pairwise の 5 section を同時宣言する。

### §8.1 抽出規約（L2 正本への忠実性）

- 内容の正本は L2 `docs/design/harness/L2-screen/`（G2 freeze 済み）であり、asset は
  その**抽出**である。各 entity は `source_pointer` に L2 の doc パス + 節を持つ。
- L2 が High-Fi 確定層（canonical pair の L11、UX refinement）へ委譲した具体値（hex / px / font 実名）は asset に持ち込まない。brand token の
  value は L2 §3 の方針記述（例: ok=緑 / warn=黄）までとし、実値確定は当該 High-Fi 層（L11）の責務のまま残す。
- L2 が沈黙する field（motion）は、L2 と矛盾しない保守的既定を L4/L5 設計判断として置き、
  value 内にその旨を明記する（人間 authority の僭称をしない）。
- pairwise の軸 level は L2 のスコープ制約（S9=a Desktop 専用 / Q31 日本語固定 / S2=b
  30 秒ポーリング / S5=b read-only + clipboard のみ）と hybrid 運用実態
  （single-runtime / hybrid-dual-runtime）から取る。
- graph section は宣言しない。SA-UDP-01（#257 到達 + 実 registry population）まで
  consumer trace は実 asset の対象外である。

### §8.2 gate（骨抜き防止）

`src/lint/ui-domain-gate.ts` が実 asset を `evaluateUiDomainBundle` へ通し、加えて
5 section の同時宣言を強制する（`section-missing:<name>` で fail-close）。
`evaluateUiDomainBundle` の「宣言された section だけ検査する」仕様は合成 bundle 用に
維持し、実 asset にだけ全宣言義務を課す。asset 欠落・破損 JSON も fail-close
（fail-open 禁止）。doctor（runFullDoctor）が本 gate を集約する。
