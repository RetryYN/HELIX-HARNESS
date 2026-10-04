# P06 Typography・grid・design tokenの観察（D09 Visual Design、D04 Frontend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| primer/primitives | https://github.com/primer/primitives | f48bc063f7bc0fb3e447386a8c259650ce46dea8 | MIT | false | 2026-10-04 | token階層・命名のADRがそろっている。Style Dictionaryの上に、theme overrideとpointer別の密度を自前の拡張で載せている |
| carbon-design-system/carbon | https://github.com/carbon-design-system/carbon | ab7a96b9247bdab492b99abcd177f8dad930d386 | Apache-2.0 | false | 2026-10-04 | typography scaleを式で作り、breakpoint間をfluidに補間している。入れ子の深さで値が決まるlayer token、4つのthemeを1ファイルに持つDTCG形式がある |
| Shopify/polaris（APIでは Shopify/polaris-react-archive へredirect） | https://github.com/Shopify/polaris-react-archive | 3f7954ae42fabf26d63cee68c23ceebfd7ef0972 | NOASSERTION（APIの値。`LICENSE.md`の冒頭はMIT形式の許諾文） | **true** | 2026-10-04 | base themeとpartialをdeepmergeするTS型付きtoken。stylelintでtokenの使用を強制している。READMEにarchive・非保守と明記されているので、過去の実装として扱う |
| radix-ui/themes | https://github.com/radix-ui/themes | 1faff10ac26ae17f09944d418c6949b93fc6b566 | MIT | false | 2026-10-04 | build工程を持たない。CSS変数とdata属性だけで、実行時にtheme・scaling・radiusを切り替える |
| amzn/style-dictionary（現 style-dictionary/style-dictionary） | https://github.com/style-dictionary/style-dictionary | 8710de9f9dc5e65fad40a5fba979699ed2f8b3cb | Apache-2.0 | false | 2026-10-04 | tokenからplatform別に出力する変換器の参照実装。PrimerとCarbonが内部で使っている |

## 観察

### P06-O01 token階層の3区分と、位置を固定した命名文法
- 出典
  - primer/primitives `contributor-docs/adrs/adr-006-naming-design-tokens.md` 行18–73（https://github.com/primer/primitives/blob/f48bc063f7bc0fb3e447386a8c259650ce46dea8/contributor-docs/adrs/adr-006-naming-design-tokens.md#L18-L73）、同 行75–179
  - Shopify/polaris-react-archive `polaris-tokens/polaris-tokens-structure.md` 行12–86（https://github.com/Shopify/polaris-react-archive/blob/3f7954ae42fabf26d63cee68c23ceebfd7ef0972/polaris-tokens/polaris-tokens-structure.md#L12-L86）
  - style-dictionary `docs/src/content/docs/info/tokens.md` 行337–362（https://github.com/style-dictionary/style-dictionary/blob/8710de9f9dc5e65fad40a5fba979699ed2f8b3cb/docs/src/content/docs/info/tokens.md#L337-L362）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - Primerはtokenを3区分にしている。生の値を持つ`base`、用途を表す`functional`、「component CSSでのみ使う」と定めた`component/pattern`である。名前は`prefix-namespace-pattern-variant-property-variant-scale`という順序固定の文法で組む。区分ごとに使う位置の部分集合が決まっている。property位置は必須、variantは1つまで、scaleは序数（状態・密度・太さ）とする。区切り文字はplatformごとに決める（CSSは`-`、JSは`.`）。
  - Polarisは`--p-[group]-[name]`を基本にしている。colorは`[element]-[role?]-[prominence?]-[state?]`で、別に「specialty」用の構造（`input-text-...`）を持つ。
  - Style Dictionaryは、Category/Type/Itemという木構造（CTI）を一例として示している。そのうえで「この構造は必須ではない」と明記している。
- 解いている問題と前提：同じ意味のtokenがplatformごとに別名になる問題、どのpropertyに使うtokenかが名前から読めない問題を解いている（adr-006 行10–16、181–187）。前提は、複数のframework（CSSとJS）が同じtokenを使うことである。
- 必要な入力：区分の境界（どの層からどの層を参照してよいか）、property語彙（CSS property名に合わせるか）、scale語彙（序数の名前）、prefixの有無。
- trade-off・失敗の仕方
  - Primerは名前空間の既定値`primer`を外すことをbreaking changeとして受け入れている（adr-006 行191）。
  - prefixを付けるかどうかは、衝突の報告がなく移行コストが大きいことを理由に見送っている（`adr-005-token-prefix.md` 行18–32）。そのため、自前の変数と区別できない状態が残っている。
- 反例・適用しない場合
  - Radixは`--space-3`、`--font-size-3`、`--accent-9`のように用途語を持たない段番号で名付けている。functional層に当たる中間名をほとんど置いていない（O03・O05参照）。
  - Carbonの命名は役割語に番号を付けたもの（`layer-01`、`border-subtle-02`）である。
- 互換・非互換
  - O02（theme差分の置き場所）と組み合わせられる。
  - 段番号だけで名付けるRadix方式とは、命名の層の数が違う。
- 限界：命名語彙と区分はその製品の組織とframeworkの事情から決まっている。HELIXで成立することを意味しない。

### P06-O02 theme（dark・high contrast等）差分の置き場所：4つの方式
- 出典
  - primer `contributor-docs/adrs/adr-004-token-overrides.md` 行10–40（https://github.com/primer/primitives/blob/f48bc063f7bc0fb3e447386a8c259650ce46dea8/contributor-docs/adrs/adr-004-token-overrides.md#L10-L40）
  - primer `src/preprocessors/themeOverrides.ts` 行5–33、`scripts/themes.config.ts` 行3–35、`scripts/utilities/getFallbackTheme.ts` 行1–8
  - carbon `packages/themes/src/dtcg/README.md` 行193–244（https://github.com/carbon-design-system/carbon/blob/ab7a96b9247bdab492b99abcd177f8dad930d386/packages/themes/src/dtcg/README.md#L193-L244）
  - carbon `packages/themes/style-dictionary/preprocessors/component-tokens.js` 行10–74
  - polaris `polaris-tokens/src/themes/utils.ts` 行19–61（https://github.com/Shopify/polaris-react-archive/blob/3f7954ae42fabf26d63cee68c23ceebfd7ef0972/polaris-tokens/src/themes/utils.ts#L19-L61）、`polaris-tokens/src/themes/index.ts` 行17–33、`polaris-tokens/scripts/toStyleSheet.ts` 行57–94
  - radix `packages/radix-ui-themes/src/styles/tokens/color.css` 行10–24、`packages/radix-ui-themes/src/components/theme.tsx` 行130–217（https://github.com/radix-ui/themes/blob/1faff10ac26ae17f09944d418c6949b93fc6b566/packages/radix-ui-themes/src/components/theme.tsx#L130-L217）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - **Primer**
    - themeごとに読み込むbase color fileを切り替える。`themes.config.ts`がtheme単位で`source`（出力対象）と`include`（参照解決だけに使う）を列挙している。
    - 1つのtokenの中には`$value`（lightを既定とする）と`$extensions["org.primer.overrides"][theme]`を併記する。preprocessorの`themeOverrides`が、現在のthemeの値、次にfallback themeの値の順で`$value`を差し替える。fallbackは名前の接頭辞から`light`か`dark`に決める。
  - **Carbon**：全4 themeを`themes.json`の1ファイルに持つ。各tokenは`$extensions["carbon.themes"]`にtheme名から値（または`{value, alpha}`）への対応表を持つ。preprocessorがこれをtheme別のleaf token（`_by_theme`）に展開してから、Style Dictionaryの通常処理に渡す。
  - **Polaris**
    - `metaThemeBase`に各themeのpartialを`deepmerge`して、完全なthemeを作る。partialの形は`Exact<MetaThemePartialShape, T>`型で検査する。
    - 出力は`:root, .p-theme-light`に既定値の全量を書き、他のthemeはclass selectorに差分だけを書く。
  - **Radix**：build時の展開はしない。`.dark`／`.light` classとdata属性のselectorでCSS変数を上書きする。`Theme`コンポーネントがcontextで親の設定を継承し、DOMにclassと`data-*`を付ける。
- 解いている問題と前提
  - Primerのadr-004は、componentごとに1ファイルを持つ構成で、mode別にファイルを分けるとスケールしないことを問題にしている（行12–15）。同じ問題はstyle-dictionary issue #1171（https://github.com/style-dictionary/style-dictionary/issues/1171）としてPrimerの関係者が提起している。
  - Style Dictionaryの保守者はそのissueで、themingは標準化の合意がなく、利用者の工夫に委ねていると回答している（同issueのcomment）。
- 必要な入力：themeの一覧、既定のtheme、fallbackの規則、theme間で変わるtokenの範囲、切替の単位（build単位、CSS selector単位、DOMの部分木単位）。
- trade-off・失敗の仕方
  - Primerのoverrideは、値が見つからなければ黙って既定値を使う（themeOverrides.ts 行13–19）。override漏れはエラーにならない。
  - Carbonでは、component fileが旧形式の`org.carbon.alphaModifiers`、theme fileが新形式の同居`alpha`を使っている。2形式の併存をpreprocessorが吸収している（README 行189–191、236–240）。
  - Radixは属性を付けた部分木の内側でしか効かない。root divの外にportalで描画するとstyleが外れるという報告がある（radix-ui/themes issue #165 https://github.com/radix-ui/themes/issues/165）。`--accent-*`がappearanceに追従しないという利用者の報告もある（#731、open、原因は未確認）。
  - style-dictionary issue #1484（https://github.com/style-dictionary/style-dictionary/issues/1484）には、複数brand×platformと参照値を組み合わせたときのtheming問題が報告されている。
- 反例・適用しない場合：Polarisの`light-mobile`はcolorではなくshadowなどを差し替えるthemeである。themeが明暗だけを指すわけではない。
- 互換・非互換
  - O08（変換pipeline）の上に成り立っている。
  - Radix方式はbuildの段を持たないので、O08とは独立している。
- 限界：theme数や対象tokenの範囲は各製品に固有である。

### P06-O03 入れ子の深さで値が決まるcontextual layer token
- 出典
  - carbon `packages/styles/scss/layer/_layer-sets.scss` 行11–16、90–95（https://github.com/carbon-design-system/carbon/blob/ab7a96b9247bdab492b99abcd177f8dad930d386/packages/styles/scss/layer/_layer-sets.scss#L90-L95）
  - `packages/styles/scss/layer/_layer-tokens.scss` 行13–20
  - `packages/themes/src/dtcg/README.md` 行65–116
  - issues #23336（https://github.com/carbon-design-system/carbon/issues/23336）、#23485（https://github.com/carbon-design-system/carbon/issues/23485）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - `$layer-sets`はmapである。key（`layer`、`field`、`border-subtle`など）ごとに、番号付きtoken（`-01/-02/-03`）のlistを持つ。
  - `emit-layer-tokens($level)`がlevelに当たる要素を、keyの名前でCSS custom propertyとして出力する。componentは番号のない`$layer`などを参照し、容器の入れ子の深さに応じて値が決まる。
  - `$layer-sets`は`!default`と`deep-merge`で利用者が拡張できる。
  - README 行82–116によれば、値を持つtokenがそのまま子tokenのgroupも兼ねる「dual-role」のnodeがある。
- 解いている問題と前提：重ねたsurface（カードの中のカード）でも、背景・境界・入力欄のcontrastを保つ。前提は入れ子の段数に上限があることで、numbered tierで表している。
- 必要な入力：layerの段数、どのtoken groupをlayerに追従させるか。
- trade-off・失敗の仕方
  - #23336：layer setに入れていなかったtoken（placeholder・helper text・skeleton）が入れ子の中でcontrastを落とした。layer setへ入れ漏れると壊れる。
  - #23485：white・g10では`-01/-02/-03`の値が同一のgroupが多く、別々に起票していることが冗長になっている。v12で導出規則にまとめる研究が進行中（open）。
- 反例・適用しない場合
  - Primer、Polaris、Radixには同じ仕組みが見当たらない。Polarisはsurfaceの区別を`bg-surface-secondary`のような役割名で表している。
  - Radixはpanel背景を`panelBackground`（solid／translucent）という1軸の切替にしている。
- 互換・非互換：O02の`carbon.themes`方式とは併用されている（layer tokenもtheme別の値を持つ）。
- 限界：段数とgroupの範囲はCarbonの製品UIに由来する。

### P06-O04 typography scaleの作り方と、line-heightを表す単位
- 出典
  - carbon `packages/type/src/scale.ts` 行8–14、46–53（https://github.com/carbon-design-system/carbon/blob/ab7a96b9247bdab492b99abcd177f8dad930d386/packages/type/src/scale.ts#L8-L53）、`packages/type/src/styles.ts` 行32–150
  - primer `src/tokens/base/typography/typography.json5` 行114–160、`src/tokens/functional/typography/typography.json5` 行1–53（https://github.com/primer/primitives/blob/f48bc063f7bc0fb3e447386a8c259650ce46dea8/src/tokens/functional/typography/typography.json5#L1-L53）
  - primer `contributor-docs/adrs/adr-011-design-token-structure.md` 行87–103
  - polaris `polaris-tokens/src/themes/base/font.ts` 行1–50、`polaris-tokens/src/themes/base/text.ts` 行41–58、`polaris-tokens/src/size.ts` 行1–29
  - radix `packages/radix-ui-themes/src/styles/tokens/typography.css` 行1–67（https://github.com/radix-ui/themes/blob/1faff10ac26ae17f09944d418c6949b93fc6b566/packages/radix-ui-themes/src/styles/tokens/typography.css#L1-L67）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - **Carbon**
    - scaleを漸化式`getTypeSize(step)`で定義している。前の段に増分を足し、増分は一定の段数ごとに大きくなる。
    - 定数は式の結果を手で書き出したものである。tree shakingのために要素を個別にexportしている（行16–21のコメント）。
    - type style（`bodyLong01`、`productiveHeading02`など）がscaleの段・weight・単位のない比のline-heightを束ねている。
    - productiveとexpressiveという2つの系統を持つ。
  - **Primer**
    - baseのlineHeightを名前付きの単位なし数値（tight／snug／normal／relaxedなど）で定義し、各値に使う場面を`$description`で書いている。
    - functionalの`text.<role>`が、size・lineHeight・weightと、それらを参照する`shorthand`（`$type: typography`の複合token）を持つ。
    - lineHeightの単位はW3C draftでも議論中と注記している（adr-011 脚注2）。
  - **Polaris**
    - font-sizeとline-heightを、共通の`size`表を参照する絶対長で持つ。名前は基準単位に比例した数値名（`300`、`400`）である。
    - `text-<variant>-font-*`系tokenが`createVar`で基礎tokenを参照し、役割ごとの組を作っている。
  - **Radix**：`--font-size-N`と`--line-height-N`を同じ段番号で対にしている。line-heightは絶対長に`--scaling`を掛けた値である。headingだけ別系列の`--heading-line-height-N`を持つ。`leading-trim`の値も持つ。
- 解いている問題と前提：段数を限った文字サイズの集合と、行送りを一貫させる。
  - Carbonは式から作るので、段を後から足すことができる。
  - PrimerとRadixは段を名前か番号で列挙する。
- 必要な入力：基準の文字サイズ、段の生成規則か列挙、line-heightを比で持つか長さで持つか、役割（body、heading、code、caption）の一覧。
- trade-off・失敗の仕方
  - Carbonでは式と書き出した定数が二重に存在し、同期はコメントの生成手順に頼っている（scale.ts 行46–53）。
  - Polarisは`font`系custom propertyを廃止したとき、migratorで一括置換している（polaris-react-archive issue #10501、#10498 https://github.com/Shopify/polaris-react-archive/issues/10501）。
  - 長さで持つ方式は、文字サイズを変えたときにline-heightを連動させる必要がある。Radixは両方に同じ`--scaling`を掛けることで連動させている。
- 反例・適用しない場合：Primerのfunctional lineHeightは`org.primer.data`に対応するfontSizeを持っている。比で持っていても、設計時には長さとの対応を記録している（functional typography 行14–26）。
- 互換・非互換
  - O05（responsive typography）と組み合わさる。
  - 比で持つ方式（Carbon・Primer）と長さで持つ方式（Polaris・Radix）は、密度の倍率（O07）の効き方が違う。
- 限界：**段数、比、寸法の値は持ち込まない。** 観察したのは構造だけである。

### P06-O05 breakpointでのtypographyの変化：段の切替とfluidな補間
- 出典
  - carbon `packages/type/src/fluid.ts` 行28–110（https://github.com/carbon-design-system/carbon/blob/ab7a96b9247bdab492b99abcd177f8dad930d386/packages/type/src/fluid.ts#L28-L110）、`packages/type/src/styles.ts` 行232–259、503–515
  - primer `src/tokens/functional/typography/typography.json5` 行37–52
  - radix `packages/radix-ui-themes/src/helpers/get-responsive-styles.ts` 行15–60、`packages/radix-ui-themes/src/styles/breakpoints.css` 行1–5
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - **Carbon**：expressive系のstyleがbreakpoint名からstyle差分への対応表（`breakpoints`）を持つ。`fluid()`はその対応表を受け取り、隣り合うbreakpointの文字サイズと幅から`calc(... 100vw ...)`の線形補間式を作る。次のbreakpointに文字サイズがなければ固定値を返す。
  - **Primer**：tokenの側にresponsiveの値を持たない。`$description`とLLM向けの規則に「狭いviewportではtitle.largeへ切り替える」と書き、利用側に委ねている。
  - **Radix**：componentのpropを`{initial, sm, md, ...}`のresponsive objectで受け取る。breakpoint付きのclass名とcustom propertyに展開する。
- 解いている問題と前提：大見出しを画面幅に合わせて変える。Carbonは見出し（expressive）系にだけ適用し、productive系は固定にしている。
- 必要な入力：breakpointの一覧と順序、styleごとの差分、補間するか段階で切り替えるか。
- trade-off・失敗の仕方
  - Carbon `fluid.ts`は、breakpoint差分のない場合と、次に値がない場合を固定値へ倒す防御をしている（行32–41、93–95）。
  - 補間式はCSS出力でだけ成立し、他のplatformへの出力経路はこのfileにない。
- 反例・適用しない場合：Polarisはbreakpointをtokenに持つが（structure.md 行38–48）、typographyのtokenにbreakpoint差分は見当たらなかった。
- 互換・非互換：O04、O06。
- 限界：breakpointの幅の値は持ち込まない。

### P06-O06 grid・spacingの体系：列数と余白をbreakpointに束ねる方式と、1本のspace scale
- 出典
  - carbon `packages/layout/src/index.ts` 行63–139（https://github.com/carbon-design-system/carbon/blob/ab7a96b9247bdab492b99abcd177f8dad930d386/packages/layout/src/index.ts#L63-L139）、`packages/grid/ARCHITECTURE.md` 行5–21
  - primer `contributor-docs/design/spacing-scales.md` 行1–60（https://github.com/primer/primitives/blob/f48bc063f7bc0fb3e447386a8c259650ce46dea8/contributor-docs/design/spacing-scales.md#L1-L60）
  - polaris `polaris-tokens/src/themes/base/space.ts` 行5–29
  - radix `packages/radix-ui-themes/src/styles/tokens/space.css` 行1–11
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - **Carbon**
    - `Breakpoint`型が`width`・`columns`・`margin`を1組で持ち、`breakpoints`という名前付きmapにしている。単位変換は`rem/em/px`の関数で行う。
    - gridはCSS Gridで実装している。gutterのmode（wide／narrow／condensed）が左右非対称の余白を要求するので、`grid-gap`を使わず、セルごとにleading／trailingのgutterを制御している（ARCHITECTURE.md）。
  - **Primer**：gap・padding・marginを1つの`--space-*`名前空間で共有する。property別のtokenにせず、「視覚的な密度」の段で選ばせている。例外はbase tokenを使い、理由を書く運用である。
  - **Polaris**：基準単位に比例した数値名のspace scaleに、component専用の別名（`card-gap`、`table-cell-padding`）を加えている。
  - **Radix**：段番号のspaceに`--scaling`を掛けている。
- 解いている問題と前提
  - Carbonは列gridに配置する製品画面（RTLにも対応）を前提にしている。
  - Primerは、property別のtokenが増えて選択がばらつくことを問題にしている。
- 必要な入力：列数とmarginをbreakpointに結び付けるか、gutterのmode、spacingの段をpropertyで分けるか。
- trade-off・失敗の仕方
  - Carbonは非対称のgutterのために、gapを使わない実装にしている。そのため複雑さが増し、テストケースが多いと自ら記している（ARCHITECTURE.md 行23以降）。
  - Primerはscale外の値をbase tokenへ逃がしているので、例外の管理は運用（コメント）に依存している。
- 反例・適用しない場合：Radixは列gridのtokenを持たない。layoutはresponsive propで組む（O05）。
- 互換・非互換：O07（密度）と結び付く。
- 限界：**列数・幅・余白の値は持ち込まない。**

### P06-O07 密度の切替：倍率変数、pointerのmedia query、mobile theme
- 出典
  - radix `packages/radix-ui-themes/src/styles/tokens/scaling.css` 行1–17、`packages/radix-ui-themes/src/styles/tokens/radius.css` 行1–38（https://github.com/radix-ui/themes/blob/1faff10ac26ae17f09944d418c6949b93fc6b566/packages/radix-ui-themes/src/styles/tokens/radius.css#L1-L38）
  - primer `src/platforms/css.ts` 行47–145（https://github.com/primer/primitives/blob/f48bc063f7bc0fb3e447386a8c259650ce46dea8/src/platforms/css.ts#L47-L145）、`src/tokens/functional/size/size-coarse.json5` 行1–15、`size-fine.json5` 行1–15
  - polaris `polaris-tokens/src/themes/light-mobile.ts` 行9–24、issue #11632（https://github.com/Shopify/polaris-react-archive/issues/11632）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - **Radix**
    - `data-scaling`属性から`--scaling`係数を決め、space・font-size・line-height・radiusの全tokenを`calc(base * var(--scaling))`で連動させている。
    - radiusはさらに`--radius-factor`を掛け、`--radius-full`と`--radius-thumb`を別に持つ。
  - **Primer**
    - 同じtoken名（`control.minTarget.auto`など）を`size-coarse.json5`と`size-fine.json5`に二重に定義している。
    - CSS platformのfile設定で、2つのfileを`@media (pointer: coarse/fine)`に振り分けて出力する。`matcher`は`filePath`で判定している。
  - **Polaris**：`light-mobile`をtheme partialとして持ち、mobile向けにshadowなどを差し替える。
- 解いている問題と前提
  - Radixは利用者が密度を選ぶことを前提にしている。
  - Primerは入力機器（touchかmouseか）で最小の操作目標とgapを変えることを前提にしている。
- 必要な入力：密度の軸（利用者の選択か、入力機器か、platformか）、どのtokenが連動するか。
- trade-off・失敗の仕方
  - Primerの振り分けはfile pathの文字列一致に依存している（css.ts 行132–141）。
  - Polaris #11632：native mobile向けのstyleをdesign systemに入れたところ、web mobileの特定breakpoint以下で文字のweight・size・line-heightが想定外になり、revertした。
- 反例・適用しない場合
  - Carbonは密度を、theme（white／g10／g90／g100）とgutterのmode（O06）で表している。倍率の変数は見当たらなかった。
  - Primerの密度は名前のscale語（condensed／normal／spacious、adr-006 行145–165）でも表している。
- 互換・非互換
  - Radixの倍率方式は、line-heightを長さで持つO04の方式と組み合わせて成立している。
  - Primer方式はO08の出力filterに依存している。
- 限界：**倍率と目標サイズの値は持ち込まない。**

### P06-O08 tokenからplatform別出力への変換pipeline
- 出典
  - style-dictionary `docs/src/content/docs/info/architecture.md` 行9–90（https://github.com/style-dictionary/style-dictionary/blob/8710de9f9dc5e65fad40a5fba979699ed2f8b3cb/docs/src/content/docs/info/architecture.md#L9-L90）
  - `docs/src/content/docs/info/tokens.md` 行201–250
  - `docs/src/content/docs/reference/Hooks/Transforms/index.md` 行38–60
  - `docs/src/content/docs/reference/Hooks/Formats/index.md` 行173–197
  - `lib/common/transformGroups.js` 行65、214
  - `examples/advanced/multi-brand-multi-platform/build.js` 行8–70
  - primer `scripts/buildTokens.ts` 行16–56、`src/platforms/css.ts` 行6–26
  - carbon `packages/themes/style-dictionary/sd.config.js` 行213–307、349–362
  - polaris `polaris-tokens/scripts/toStyleSheet.ts` 行20–94
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - **Style Dictionaryの流れ**
    1. 共通段階：configを解析し、token fileを探し、parseして、include→sourceの順にdeep mergeする。
    2. platformごと：preprocessor、transform（attribute／name／value）、参照解決、transitive transformの順に処理する。
    3. fileごと：filter→format→actionsの順に処理する。
  - platformごとの差（色の表記、単位、命名の大文字小文字）は`transformGroup`（web・android・iosなど）で吸収する。
  - `include`は上書きされる前提の基底である。source同士の衝突は警告し、includeへのsourceの上書きは警告しない。multi-brandの例は、`brands/<brand>`、`globals`、`platforms/<platform>`のsourceを組み合わせ、brand×platformごとにinstanceを作っている。
  - **Primer**：themeごとにSDを`extend`する。`include`を参照解決専用にし（出力には`isSource`のfilterをかける）、`brokenReferences: 'throw'`を設定している。
  - **Carbon**：preprocessor（component-tokens、theme-metadata）と独自のformat（scss・js・d.ts）を登録している。
  - **Polaris**：SDを使わない。TSのオブジェクトから自前scriptでCSS／SCSSを直接書き出す。
- 解いている問題と前提：1つのtoken sourceから複数のplatformと言語へ出力すること、参照（alias）を保ったまま出力するかどうかを決めること。
- 必要な入力：token fileの配置（source／includeの区別）、platform一覧、platformごとのtransformとformat、参照を出力に残すかどうか。
- trade-off・失敗の仕方
  - `outputReferences`は、参照先がfilterで落ちると壊れる。transitive transformの後に参照を戻すと変換が失われる。そのため`outputReferencesFilter`と`outputReferencesTransformed`を用意している（Formats/index.md 行185–197）。Primerは両方をANDで使い、border複合tokenだけ例外にしている（css.ts 行6–26）。
  - value transformは参照を持つtokenには走らない（architecture.md 行76）。
  - includeで同じtokenを重ねてもdeep mergeにならないという報告がある（issue #1425、open、本文は未読）。
- 反例・適用しない場合
  - Radixはbuild時の変換を持たず、手書きのCSSが正本になっている。
  - Polarisは汎用の変換器を使わない。
- 互換・非互換：O02のPrimer方式とCarbon方式は、いずれもこのpipelineのpreprocessor段に依存している。
- 限界：platformの種類と出力形式の選択は各製品の配布先に依存する。

### P06-O09 tokenの廃止・改名と使用強制のlifecycle
- 出典
  - primer `scripts/checkRemovedTokens.ts` 行102–171（https://github.com/primer/primitives/blob/f48bc063f7bc0fb3e447386a8c259650ce46dea8/scripts/checkRemovedTokens.ts#L102-L171）、`src/tokens/removed.json`、`contributor-docs/adrs/adr-011-design-token-structure.md` 行36
  - polaris `stylelint-polaris/index.js` 行36–47、365–395（https://github.com/Shopify/polaris-react-archive/blob/3f7954ae42fabf26d63cee68c23ceebfd7ef0972/stylelint-polaris/index.js#L365-L395）、issue #10501
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - **Primer**
    - base branchとのmerge-baseにあるtoken名の集合と、作業treeのtoken名の集合の差を取る。消えたtokenが`removed.json`（`null`＝削除、文字列＝置換先）に記録されていなければ失敗させる。CIでmerge-baseが解決できない場合も失敗にする。
    - token単位では`$deprecated`で置換先を示す。
  - **Polaris**
    - stylelintの`coverage` pluginで、規則をcategory（border・color・layout・typographyなど）ごとにまとめる。生の単位、font-sizeやline-heightの直接指定、旧mixinを禁止または警告する。
    - token名を変えるときはmigratorを配布している。
- 解いている問題と前提：利用側が多数ある前提で、token名の変更をbreaking changeとして追跡し、tokenを使わない直接の値指定を減らす。
- 必要な入力：token名の一覧を取り出す手段、廃止記録の形式、使用強制の対象property。
- trade-off・失敗の仕方
  - Primerの検査は名前の消失だけを見る。値の変更は対象外である（コードで確認した範囲）。
  - Polarisはproperty単位の禁止の一部を`severity: 'warning'`にとどめている（行379–388）。
- 反例・適用しない場合：Radix・Carbonでは、同等の廃止記録の検査は見つからなかった（未網羅）。
- 互換・非互換：O01の命名文法が固定されていることが前提になっている。
- 限界：CIとlintの閾値は持ち込まない。

### P06-O10 AIが読むことを想定したtoken metadata
- 出典
  - primer `src/tokens/functional/size/size-coarse.json5` 行1–15（`org.primer.llm`）、`scripts/buildLlm.ts` 行1–30（https://github.com/primer/primitives/blob/f48bc063f7bc0fb3e447386a8c259650ce46dea8/scripts/buildLlm.ts#L1-L30）
  - carbon `packages/themes/src/dtcg/README.md` 行59–63、113–116、181–184
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか
  - **Primer**
    - tokenの`$extensions["org.primer.llm"]`に`usage`（用途タグ）と`rules`（使う条件・使わない条件）を持たせている。
    - 専用platformの`llmGuidelines`で仕様のMarkdownを生成し、CSS出力の先頭に「生の値を使わず、semantic tokenだけを使う」という規則のheaderを付ける。
    - src/tokens配下で`org.primer.llm`は170か所ある（grepで計数）。
  - **Carbon**：README内に「Tip for agents」を置いている。flatな名前ではgrepできないこと、dual-roleのnode、alphaは別に適用されることを、AIの読み手向けに説明している。
- 解いている問題と前提：AIがtokenを選ぶときや検索するときの誤りを減らす。
- 必要な入力：用途の語彙、禁止条件の記述形式。
- trade-off・失敗の仕方：metadataは自然言語の規則であり、守られているかを検査する仕組みは観察の範囲では見つからなかった。
- 反例・適用しない場合：Polaris・Radixには該当がない。
- 互換・非互換：O01、O09。
- 限界：外部repoでAI向けmetadataを持っていることは、HELIXで有効であることの根拠にならない。

## 同じ問題の解き方の比較
| 問題 | repoAのやり方 | repoBのやり方 | 違いが生じる前提 |
|---|---|---|---|
| themeの差分の置き場所 | Primer：themeごとにbase fileを切り替え、tokenにoverride拡張を書く。fallbackは接頭辞で決める | Carbon：全themeを1 fileに置き、tokenごとにthemeの対応表を持つ | Primerは6系統以上のtheme（色覚・high contrast）を出力ごとに分けて生成する。Carbonは固定の4 themeを一覧で管理する |
| themeの適用単位 | Polaris・Primer：build時に完全なthemeを作り、class／data属性のselectorに出力する | Radix：実行時にDOMの部分木のdata属性とcontextで継承する | Radixは入れ子のThemeと実行時の切替を前提にしている。代わりにportalで属性が外れる（#165） |
| line-heightの単位 | Carbon・Primer：単位のない比 | Polaris・Radix：絶対長（Radixは倍率を掛ける） | 比は文字サイズの変更に自動で追従する。長さは倍率変数で連動させる必要がある |
| scaleの生成 | Carbon：漸化式と書き出した定数 | Primer・Radix・Polaris：名前・段番号・比例数値名で列挙する | Carbonは段を規則で増やせる。列挙方式は名前の意味（size語、段番号）を固定する |
| responsive typography | Carbon：styleにbreakpointの差分を持ち、fluidに補間する | Primer：descriptionで切替を指示する／Radix：propのresponsive object | tokenの層で解くか、component・利用側で解くか |
| 密度 | Radix：単一の倍率を全寸法に掛ける | Primer：pointerのmedia queryで同名tokenを差し替える／Polaris：mobile theme | 利用者が選ぶか、入力機器で決まるか |
| 入れ子のsurface | Carbon：深さで値が決まるlayer set | Polaris：役割名で別tokenにする／Radix：panelBackgroundの1軸 | Carbonは段数の上限があることを前提にしている |
| platform出力 | Primer・Carbon：Style Dictionaryにpreprocessorとformatを足す | Polaris：自前のTS script／Radix：手書きCSS | 複数のplatform・言語に出すかどうか |
| 廃止の管理 | Primer：merge-baseとの差分と`removed.json`の照合 | Polaris：migratorとstylelintのcoverage | 名前の消失を検出するか、利用側の置換を支援するか |

## 見つからなかったこと・gap
- Carbonのgrid実装本体（`packages/grid/scss/_css-grid.scss`）の行は読んでいない。ARCHITECTURE.mdの説明に限っている。
- Polarisの後継（Polaris Web Components）は別のrepositoryで、本調査の対象外である。archived repoの構造は現行のShopifyの実装を表さない。
- Radixのcolor scale（`@radix-ui/colors`の12段の意味づけ）は別のrepositoryにあり、未調査である。
- style-dictionary issue #1425は題名だけを確認し、本文は読んでいない。
- Primerの`light-dark()`対応や、DTCG resolver（mode）の標準化の状況は追っていない（style-dictionary #1377は本文のみ確認）。
- 4 repositoryのtoken検査（schema validation、color contrast script）の中身は読んでいない（Primer `scripts/validateTokenJson.ts`、`colorContrast.ts`は存在のみ確認）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- **primer/primitives**
  - 読んだもの：`contributor-docs/adrs/adr-004,005,006,011`、`scripts/themes.config.ts`（先頭120行）、`scripts/buildTokens.ts`（1–200行）、`scripts/checkRemovedTokens.ts`、`scripts/buildLlm.ts`（1–30行）、`scripts/utilities/getFallbackTheme.ts`、`src/preprocessors/themeOverrides.ts`、`src/platforms/css.ts`、`src/tokens/functional/size/size-coarse.json5`・`size-fine.json5`（先頭）、`src/tokens/functional/typography/typography.json5`（1–80行）、`src/tokens/base/typography/typography.json5`（該当部分）、`contributor-docs/design/spacing-scales.md`（1–60行）、`src/tokens/removed.json`（先頭）
  - grep：`coarse|fine|pointer`、`org.primer.llm`
- **carbon**（sparse checkout）
  - 読んだもの：`packages/themes/src/dtcg/README.md`全文、`packages/themes/style-dictionary/preprocessors/component-tokens.js`（1–80行）、`sd.config.js`（grepした箇所）、`packages/type/src/scale.ts`・`fluid.ts`全文、`styles.ts`（部分）、`packages/layout/src/index.ts`（1–140行）、`packages/grid/ARCHITECTURE.md`（1–25行）、`packages/styles/scss/layer/_layer-sets.scss`・`_layer-tokens.scss`、`docs/decisions`（一覧のみ。token関連のADRはない）
- **polaris-react-archive**
  - 読んだもの：`README.md`冒頭、`polaris-tokens/polaris-tokens-structure.md`（1–120行）、`src/themes/utils.ts`（1–80行）、`index.ts`、`dark.ts`・`light-mobile.ts`（先頭）、`base/font.ts`・`space.ts`・`text.ts`（部分）、`src/size.ts`、`scripts/toStyleSheet.ts`、`toMediaConditions.ts`（先頭）、`stylelint-polaris/index.js`（部分）
- **radix-ui/themes**
  - 読んだもの：`src/styles/tokens/scaling.css`、`space.css`、`typography.css`（1–80行）、`radius.css`、`color.css`（部分）、`colors/blue.css`（先頭）、`breakpoints.css`、`components/theme.tsx`（125–221行）、`theme.props.tsx`（grep）、`helpers/get-matching-gray-color.ts`、`get-responsive-styles.ts`（1–60行）
- **style-dictionary**
  - 読んだもの：`docs/.../info/architecture.md`全文、`info/tokens.md`（201–250、337–362行）、`reference/config.md`（include行）、`Hooks/Transforms/index.md`（38–60行）、`Hooks/Formats/index.md`（95–215行）、`lib/common/transformGroups.js`（grep）、`examples/advanced/multi-brand-multi-platform/build.js`
- **issues**（本文を読んだもの）
  - style-dictionary #1171（commentを含む）、#1484、#1377
  - radix #731、#165
  - carbon #23336、#23485
  - polaris #11632、#10501
- **検索語**：`dark mode theme`、`scaling`、`line-height`、`layer tokens nesting`、`layer contextual`、`pointer coarse`、`font-line-height`
- **実行しなかったもの**：各repositoryのbuild・test・scriptは一切実行していない。gh apiの呼出しは約30回。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：外部OSSのsourceと設計文書（ADR、README、設計doc）、およびissueである。Polarisはarchived repositoryの過去実装なので、「現行ではない外部実装」という区別が要るかは未決である。
- scope：D09 Visual Design（O01–O07）とD04 Frontend（O02のRadixの実行時切替、O05、O08）にまたがる。O08とO09を「token供給の工程」として別のscopeに分けるかは未決である。
- 評価根拠：外部での採用・運用の事実だけがあり、HELIXでの評価根拠はない。issueの失敗事例（#165、#23336、#11632）を反証材料として扱う属性の名前は未決である。
- 版：各observationは上表の固定commitに紐付く。DTCG仕様の版（draft）への依存（Primer adr-011、Carbon README）を属性として持つかは未決である。
- 状態：全observationが未評価の候補素材である。HELIX-BRAINへの登録・採否は行っていない（HELIXBRAIN-L2-026／027の経路の対象）。寸法・色・比・段数・breakpointの値は持ち込んでいない。
