# P14 色の体系・motion・dashboard・visual hierarchyの観察（D09 Visual Design）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| material-foundation/material-color-utilities | https://github.com/material-foundation/material-color-utilities | 5b3618b16fdc3825e21d5679bafd144662088ea1 | Apache-2.0 | false | 2026-10-04 | contrastを制約として解いて役割色を生成するsolverの一次資料。概念文書（concepts/）もある |
| radix-ui/colors | https://github.com/radix-ui/colors | dbdb85470547c7d34b9001f48fddb08ded335979 | MIT | false | 2026-10-04 | 手で調整した段階scaleを配布する方式の一次資料（生成でなく固定値） |
| radix-ui/website（補助。colorsの設計文書と生成器の所在） | https://github.com/radix-ui/website | bb424082fd33fadc244a6dd276d3ced55caa6234 | MIT | false | 2026-10-04 | radix-ui/colors本体に段ごとの用途定義と生成器がなく、issue #51でこちらにあると示されたため |
| adobe/leonardo | https://github.com/adobe/leonardo | eb6481da40df27654ac8efa42038007f6fad2431 | Apache-2.0 | false | 2026-10-04 | 目標contrast比を入力にして色を探索する方式の一次資料 |
| material-components/material-web | https://github.com/material-components/material-web | a6b2d2640b336e5d9fc73133a317e9173827ba95 | Apache-2.0 | false | 2026-10-04 | motion（duration・easing・spring）のtoken階層と、componentでの消費の一次資料 |
| grafana/grafana | https://github.com/grafana/grafana | b3fb81a13abde982b181fd1116cf8982bd07b6c6 | AGPL-3.0 | false | 2026-10-04 | dashboard schema（v2 layout）、semantic color、可視化色、transitionの一次資料。copyleftのため構造の観察だけにした |

## 観察

### P14-O01 背景との対を必須にした役割色（DynamicColor＋ContrastCurve）
- 出典：material-color-utilities、`typescript/dynamiccolor/dynamic_color.ts` 行225–254（https://github.com/material-foundation/material-color-utilities/blob/5b3618b16fdc3825e21d5679bafd144662088ea1/typescript/dynamiccolor/dynamic_color.ts#L225-L254）、同 行326–396（#L326-L396）、`typescript/dynamiccolor/contrast_curve.ts` 行20–62（https://github.com/material-foundation/material-color-utilities/blob/5b3618b16fdc3825e21d5679bafd144662088ea1/typescript/dynamiccolor/contrast_curve.ts#L20-L62）、設計文書 `concepts/contrast_for_accessibility.md` 行45–117（https://github.com/material-foundation/material-color-utilities/blob/5b3618b16fdc3825e21d5679bafd144662088ea1/concepts/contrast_for_accessibility.md#L45-L117）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：`DynamicColor`は値ではなく、`DynamicScheme`を受け取る関数の束（`palette`、`tone`、`background`、`secondBackground`、`contrastCurve`、`toneDeltaPair`、`chromaMultiplier`）として役割色を定義する。constructorは「`background`があるのに`contrastCurve`がない」「`contrastCurve`があるのに`background`がない」「`secondBackground`だけある」をエラーにする。つまり前景色は必ず背景との対とcontrast曲線を持つ。`ContrastCurve`は複数のcontrast level（低、標準、中、高）に対応する目標値を持ち、`get(contrastLevel)`はその間を線形補間する。`foregroundTone(bgTone, ratio)`は明るい側と暗い側の候補を両方計算して選び、`tonePrefersLightForeground`、`enableLightForeground`で白い前景を好む帯の扱いを決める。
- 解いている問題と前提：ユーザーの壁紙など任意のsource colorとユーザーのcontrast設定から、多数の役割色を実行時に生成しても、前景と背景の対が規定contrastを満たすようにする。文書は「保証する最小比」と「物理的に届かない場合がある目標比（discretionary）」を区別している（contrast_for_accessibility.md 行51–58）。
- 必要な入力：役割ごとの背景対の決定、contrast levelごとの目標値、light/darkの区別、どの役割を背景とするか（`isBackground`）。
- trade-off・失敗の仕方：コメントに、高contrastと最大contrastの間で`On Primary Container`が一瞬黒になった実例と、その回避分岐が書かれている（dynamic_color.ts 行341–356）。constructorのdocは「この既定の振る舞いが全design system、全組合せに望ましいわけではない」と明記する（行199–203）。中間toneの背景では目標比に届かないことを文書が認めている（`concepts/scheme_generation.md` 行87–90）。
- 反例・適用しない場合：背景を持たない色はcontrast変化でtoneが変わらない（dynamic_color.ts 行152–154）。Radix（P14-O04）は実行時solverを持たず、固定scaleの段どうしの組合せでcontrastを主張する。
- 互換・非互換：P14-O02（制約の優先順位）、P14-O03（spec版）と一体で動く。P14-O05（Leonardo）とは「contrastを入力にする」点で共通し、「役割の背景対を型で強制する」点が異なる。
- 限界：このrepoで成立していることはHELIXで成立することを意味しない。contrast比、tone、帯の境界などの値は持ち込まない。

### P14-O02 hard／soft制約の順序で解く配色生成（ToneDeltaPairとfidelity調整）
- 出典：material-color-utilities、`concepts/scheme_generation.md` 行1–90（https://github.com/material-foundation/material-color-utilities/blob/5b3618b16fdc3825e21d5679bafd144662088ea1/concepts/scheme_generation.md#L1-L90）、`typescript/dynamiccolor/tone_delta_pair.ts` 行20–77（https://github.com/material-foundation/material-color-utilities/blob/5b3618b16fdc3825e21d5679bafd144662088ea1/typescript/dynamiccolor/tone_delta_pair.ts#L20-L77）、`dynamic_color.ts` 行399–420（2021版のtone計算で`toneDeltaPair`を最初に扱う分岐）。信頼性ラベル：primary。本文確認：済
- 何をしているか：文書は、hard制約（前景と背景のcontrast範囲、役割ごとのtone範囲、xとxContainerのtone差の下限、嫌われる色の回避など）とsoft制約（基準toneへの近さ、toneの均等分布、望ましいcontrast）を分け、開始tone→hue・chroma→fidelity調整→global tone制約→contrast調整の順で解くと書く。fidelity調整とglobal制約が衝突したらglobal側を優先する（行73–77）。`ToneDeltaPair`は前景と背景の関係がない2役割の間に、tone差（`delta`）、向き（`polarity`。light/darkで反転する`relative_*`を含む）、満たし方（`exact`／`nearer`／`farther`）、中間帯の同じ側にとどまるか（`stayTogether`）を宣言する。
- 解いている問題と前提：contrastだけでは表せない「容器と中身の明度差」などの視覚的な階層を、宣言的な制約として保つ。どの制約を優先するかが文書で決まっていることを前提にする。
- 必要な入力：役割間の関係（どれがどれの容器か）、制約の優先順位、delta、polarity。
- trade-off・失敗の仕方：`nearer`と`farther`のpolarityはdeprecatedで`DeltaConstraint`へ移した（tone_delta_pair.ts 行23）。表現の変更が型の互換を残したまま行われている。docは「背景対で済む場合はそちらを優先し、これは特殊な場合用」と書く（行37–40）。
- 反例・適用しない場合：non-fidelityのschemeではtoneを固定し、fidelity調整をしない（scheme_generation.md 行42–44）。Leonardo（P14-O05）は役割間の制約を持たず、背景1つに対する比だけを扱う。
- 互換・非互換：P14-O01と組み合わせる前提。P14-O07（Grafanaの派生色）は制約を解かず、固定の係数で派生させる点で対照的。
- 限界：delta、帯の範囲などの値は持ち込まない。

### P14-O03 配色仕様の版をscheme属性にしたdelegate切替（SpecVersion）
- 出典：material-color-utilities、`typescript/dynamiccolor/color_spec.ts` 行24–36、198–216（https://github.com/material-foundation/material-color-utilities/blob/5b3618b16fdc3825e21d5679bafd144662088ea1/typescript/dynamiccolor/color_spec.ts#L24-L36 、#L198-L216）、`dynamic_color.ts` 行96–147（`extendSpecVersion`）、`typescript/dynamiccolor/dynamic_scheme.ts` 行119–159（https://github.com/material-foundation/material-color-utilities/blob/5b3618b16fdc3825e21d5679bafd144662088ea1/typescript/dynamiccolor/dynamic_scheme.ts#L119-L159）。issue #185（https://github.com/material-foundation/material-color-utilities/issues/185）、#162（https://github.com/material-foundation/material-color-utilities/issues/162）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`DynamicScheme`は`variant`、`contrastLevel`、`isDark`、`platform`、`specVersion`をreadonlyで持つ。`getSpec(specVersion)`が版ごとの`ColorSpecDelegate`実装を返し、未知の版は例外にする。`extendSpecVersion`は同名の役割について、ある版以上では新しい定義、未満では旧定義を使う合成色を作る。名前や前景／背景の別が違う拡張は`validateExtendedColor`で拒否する。
- 解いている問題と前提：配色仕様を改訂しても、旧版の出力に依存する利用者を壊さない。版は利用者がschemeごとに選ぶ。
- 必要な入力：版の識別子、各版の役割定義、利用者がどの版を選ぶか。
- trade-off・失敗の仕方：issue #185は新しい版で`inverse on surface`のcontrastが旧版より下がった回帰を報告し、platform側はこの役割を使わず別の役割を流用していると指摘している。版を分けても、新版の意味の後退は利用者の報告まで見えなかった例である。issue #162はDartとTypeScriptの実装で同じ入力から異なる出力が出ると報告している（多言語移植のずれ）。
- 反例・適用しない場合：Radix（P14-O04）は版をpackageのversionで表し、scheme属性にはしない。material-webは生成済みtokenをversion directoryに分ける（P14-O09）。
- 互換・非互換：P14-O09（tokenのversion directory）と同じ問題を別の層で解いている。
- 限界：版名と版数は持ち込まない。

### P14-O04 用途を段ごとに割り当てた固定scale（手調整の値＋用途の文書）
- 出典：radix-ui/colors、`src/light.ts` 行1–60（https://github.com/radix-ui/colors/blob/dbdb85470547c7d34b9001f48fddb08ded335979/src/light.ts#L1-L60）、`scripts/build-css-modules.js` 行13–65（https://github.com/radix-ui/colors/blob/dbdb85470547c7d34b9001f48fddb08ded335979/scripts/build-css-modules.js#L13-L65）。設計文書はradix-ui/website `data/colors/docs/palette-composition/understanding-the-scale.mdx` 行12–16、42–50、96–112、196–218、303–310（https://github.com/radix-ui/website/blob/bb424082fd33fadc244a6dd276d3ced55caa6234/data/colors/docs/palette-composition/understanding-the-scale.mdx#L12-L16 ほか）。issue #42（https://github.com/radix-ui/colors/issues/42）、#12（https://github.com/radix-ui/colors/issues/12）。信頼性ラベル：primary。本文確認：済
- 何をしているか：各色相に、固定段数のsRGB scale、alpha版（`*A`）、Display P3版（`*P3`、`*P3A`）、dark版（`*Dark*`）を静的なobjectとして持つ。build scriptはこれをCSS custom propertyに変換し、light/darkのselectorと、P3を`@supports`と`@media (color-gamut: p3)`で包んだ規則を出す。P3版が見つからなければ例外にする（行48–50）。段の意味（背景、component背景の通常・hover・押下、境界、solid背景、低／高contrastの文字）はpackageではなくwebsiteの文書で定義される。
- 解いている問題と前提：設計者が手で調整した値を正本にし、利用者は段番号＝用途で選ぶ。生成の再現性より見た目の品質を優先する前提に読める。
- 必要な入力：段ごとの用途の定義、light/darkの両方の値、広色域の扱い。
- trade-off・失敗の仕方：issue #42は「文字用の段が所定contrastを満たす」という文書の主張が一部の色相で満たされていないと報告している。#12はsolid背景＋白文字の例がcontrast基準に届かないと指摘し、回答は大きい太字の例外に依拠していた。固定commitの文書は、文字の段の保証を別のcontrast方式と別の背景段で書いている（行99–102）。issue時点の文言から主張の基準が変わっている。値は固定のまま、主張側の文書が動いたことになる。文字色を白にするか暗色にするかが色相ごとに違う（行215–218）。
- 反例・適用しない場合：MCU（P14-O01）とLeonardo（P14-O05）は実行時に生成する。Radixの任意色からの生成器はpackageに含まれない（issue #45、#51。#51の議論でwebsite側の生成器が示された）。
- 互換・非互換：P14-O06（意味の別名層）と組み合わせる前提。P14-O01とは「contrastを型で保証するか、文書で主張するか」で衝突する。
- 限界：段数、各段の色値、contrast値は持ち込まない。

### P14-O05 目標contrast比を入力にした色探索（Leonardo Theme）
- 出典：adobe/leonardo、`packages/contrast-colors/lib/theme.js` 行18–49、246–308（https://github.com/adobe/leonardo/blob/eb6481da40df27654ac8efa42038007f6fad2431/packages/contrast-colors/lib/theme.js#L18-L49 、#L246-L308）、`lib/utils.js` 行35–49（`multiplyRatios`）、388–426（`getContrast`）、439–466（`ratioName`）、468–515（`searchColors`）（https://github.com/adobe/leonardo/blob/eb6481da40df27654ac8efa42038007f6fad2431/packages/contrast-colors/lib/utils.js#L468-L515 ほか）、`packages/contrast-colors/README.md` 行68–78、187–191。issue #149（https://github.com/adobe/leonardo/issues/149）、#77（https://github.com/adobe/leonardo/issues/77）。信頼性ラベル：primary。本文確認：済
- 何をしているか：`Theme`は`colors`（各`Color`が`colorKeys`と`ratios`を持つ）、`backgroundColor`、`lightness`、`contrast`（全体の倍率）、`saturation`、`output`、`formula`を受け取る。色や背景、lightness、contrastのsetterはすべて`_findContrastColors`を再実行する。`searchColors`は`colorKeys`を補間した連続scaleを作り、目標比に近い位置を二分探索で求める。`getContrast`は背景が明るいか暗いかで比に符号を付け、背景より明るい側と暗い側を負の比で区別する。`formula`は二つの方式を切り替え、未対応の方式は例外にする。`multiplyRatios`は比を「1を原点」に正規化してから倍率をかける。`ratios`が配列なら名前を自動採番し、objectなら利用者の付けた名前（例：用途名）を使う。
- 解いている問題と前提：背景のlightnessやcontrast設定をユーザーが変えても、指定した比を保つ色を出す。比が設計の正本であり、色値は派生物という前提である。
- 必要な入力：各色の目標比の集合、背景、contrast方式の選択、補間に使う色空間。
- trade-off・失敗の仕方：探索は反復回数に上限があり、許容誤差に収束しなくても打ち切って結果を返す（utils.js 行499–510）。到達できない比を例外にする処理は読んだ範囲になかった。issue #149と#77は、ブランドの指定色そのものを出力に残せない（比から決まる色だけが出る）という要求を示す。保守者は「比を指定する能力を失う」と返している。
- 反例・適用しない場合：役割間の関係（容器と中身）は扱わない（P14-O02と対照的）。Radixは比ではなく手調整の値を正本にする。
- 互換・非互換：P14-O01とは「contrastを入力にする」点で互換、「固定の役割定義があるか」で異なる。P14-O04の固定scaleとは、ブランド色の正確さとcontrast保証のどちらを正本にするかで衝突する。
- 限界：探索の分解能、誤差、倍率などの値は持ち込まない。

### P14-O06 scaleと意味の名前を分ける別名層（semantic／use-case／mutable alias）
- 出典：radix-ui/website、`data/colors/docs/overview/aliasing.mdx` 行12–14、120–130、218–220、409–416（https://github.com/radix-ui/website/blob/bb424082fd33fadc244a6dd276d3ced55caa6234/data/colors/docs/overview/aliasing.mdx#L12-L14 ほか）。対比として material-web `tokens/_md-sys-color.scss` 行7–12、70–99と`tokens/versions/v0_192/_md-sys-color.scss` 行23–51、82–110（https://github.com/material-components/material-web/blob/a6b2d2640b336e5d9fc73133a317e9173827ba95/tokens/versions/v0_192/_md-sys-color.scss#L23-L51）。信頼性ラベル：primary。本文確認：済
- 何をしているか：Radixの文書は3種類の別名を分ける。semantic alias（`accent`、`primary`、`brand`などの意味→色相scale）、use-case alias（段の用途→段番号）、mutable alias（light/darkで別の色を指す変数）である。一つの色相が複数の意味を担う場合（警告と保留など）は、同じscaleへ複数の別名を張る。material-webでは`md-sys-color`の`values-light`／`values-dark`が、役割名（`primary`、`on-primary`等）を`md-ref-palette`の参照で定義する。参照palette→system役割→componentの3層になっている。
- 解いている問題と前提：色値の変更やtheme切替を、利用箇所に触れずに別名の付け替えで済ませる。利用者が意味の名前で書くことを前提にする。
- 必要な入力：意味の語彙、意味と色相の対応、light/dark別の対応。
- trade-off・失敗の仕方：Radixの文書は、適切なsemantic aliasがない場合は元のscale名・段番号に戻ってよいとしている（aliasing.mdx 行216、407）。別名層が網羅的でないことを許容している。
- 反例・適用しない場合：Radix packageそのものは別名を持たず、scale名だけを出す（src/index.ts）。別名は利用者の責任である。
- 互換・非互換：P14-O04、P14-O07、P14-O09と組み合わさる。
- 限界：意味の語彙そのものは各製品のものであり、持ち込まない。

### P14-O07 意味色を1値から派生色の束へ展開し、未指定は既定値で埋める（Grafana createColors）
- 出典：grafana/grafana、`packages/grafana-data/src/themes/createColors.ts` 行13–93、311–412（https://github.com/grafana/grafana/blob/b3fb81a13abde982b181fd1116cf8982bd07b6c6/packages/grafana-data/src/themes/createColors.ts#L13-L93 、#L311-L412）、設計文書`packages/grafana-data/src/themes/table-colors.md` 行1–38（https://github.com/grafana/grafana/blob/b3fb81a13abde982b181fd1116cf8982bd07b6c6/packages/grafana-data/src/themes/table-colors.md#L1-L38）。信頼性ラベル：primary（AGPL-3.0、構造だけ観察）。本文確認：済
- 何をしているか：zod schemaでtheme入力を定義する。意味色は`primary`、`secondary`、`tertiary`、`accent`、`info`、`error`、`success`、`warning`で、ほかに`text`、`background`（canvas／page／primary／secondary／elevated）、`border`（weak／medium／strong）、`action`、`contrastThreshold`、`tonalOffset`があり、すべてpartialである。`createColors`はmodeでdark/lightの既定classを選び、`getRichColor`が意味色ごとに`main`から`mainEmphasis`、`contrastText`、`background`、`text`、`border`、`subtle*`、deprecatedな`shade`等を、未指定のものだけ派生させる。`getContrastText`は閾値でdark/lightの最大contrast文字色の二択を返す（コメントに「todo, need color framework」）。`table-colors.md`はcomponent単位の役割（header背景、縞、hover、選択）を定義し、「入力はすべて任意、出力はすべて埋まる」「既定値は汎用色の解決後に作る」「旧名は特定版まで残す」と書く。
- 解いている問題と前提：custom themeや部分的な上書きを受け付けつつ、consumerが常に完全なthemeを受け取れるようにする。派生は固定の係数による明暗調整で、contrast制約を解かない。
- 必要な入力：既定のdark/light class、派生係数、文字色を切り替える閾値。
- trade-off・失敗の仕方：派生物の一部はdeprecatedとして残し続けている（行382–391）。後から足した`subtleBackground`などは、旧themeの見た目を変えないよう既存値に倒している（行373–380）。`getContrastText`は二択なので、中間の背景では閾値を満たす保証がない（コード上の防御は読んだ範囲になかった）。
- 反例・適用しない場合：MCU（P14-O01）は派生を制約で解く。Radixは派生せず全段を持つ。
- 互換・非互換：P14-O06（別名層）と互換。P14-O08（可視化色）は同じthemeから別系統として作られる。
- 限界：係数、閾値、色値は持ち込まない。

### P14-O08 dashboardに色の名前を保存し、表示時にthemeで解決する可視化色
- 出典：grafana/grafana、`packages/grafana-data/src/themes/createVisualizationColors.ts` 行10–144（https://github.com/grafana/grafana/blob/b3fb81a13abde982b181fd1116cf8982bd07b6c6/packages/grafana-data/src/themes/createVisualizationColors.ts#L10-L144）、`apps/dashboard/kinds/v2/dashboard_spec.cue` 行287–300（`Threshold`、`ThresholdsConfig`）、403–418（`FieldColorModeId`、`FieldColor`）（https://github.com/grafana/grafana/blob/b3fb81a13abde982b181fd1116cf8982bd07b6c6/apps/dashboard/kinds/v2/dashboard_spec.cue#L403-L418）。issue #18041（https://github.com/grafana/grafana/issues/18041、open）、#21120（https://github.com/grafana/grafana/issues/21120、closed）。信頼性ラベル：primary（AGPL-3.0、構造だけ観察）。本文確認：済
- 何をしているか：可視化色は限られた色相と、色相ごとの明暗の名前（`super-light-*`〜`dark-*`）をzodのenumで固定する。dark/light別に実値を持ち、利用者の上書きは既存の名前の色だけを置き換えられる。`getColorByName`は名前→実値の索引を引き、なければ16進やrgb、CSSのnative名へ倒し、最後は入力文字列を返す。dashboard schemaの`FieldColor`は`mode`（閾値による着色、分類palette、色覚に配慮したpalette、連続scale、固定、濃淡、gradient）と`fixedColor`等を持つ。`Threshold`は`value`と`color`（文字列）と、変数式`valueExpr`の対である。
- 解いている問題と前提：同じdashboard定義をdark/lightの両themeで読めるようにする。色を値でなく名前で保存すれば、theme切替で実値が変わる。
- 必要な入力：色相と明暗の語彙、theme別の実値、閾値の段と色名。
- trade-off・失敗の仕方：解決できない名前はそのまま返るので、誤った名前は検証されず描画に渡る（行112–137）。issue #18041と#21120は、色だけで系列を区別する設計では色覚特性のある利用者が判別できないと報告している（模様の併用、色覚mode）。#21120で保守者は未優先と回答している。schemaには色覚配慮のpalette modeが列挙されているが、色以外の符号化は読んだ範囲のschemaになかった。
- 反例・適用しない場合：UIの意味色（P14-O07）とは別系統であり、可視化色にcontrastの対の制約はない。
- 互換・非互換：P14-O07と同じthemeから作る。P14-O06の「名前で参照する」考え方と互換。
- 限界：色相の数、明暗段の数、色値は持ち込まない。

### P14-O09 dashboardの要素と配置を分離した再帰layout schema（Grafana dashboard v2）
- 出典：grafana/grafana、`apps/dashboard/kinds/v2/dashboard_spec.cue` 行3–52、617–745、1099–1143（https://github.com/grafana/grafana/blob/b3fb81a13abde982b181fd1116cf8982bd07b6c6/apps/dashboard/kinds/v2/dashboard_spec.cue#L3-L52 、#L617-L745 、#L1099-L1143）、旧schema `kinds/dashboard/dashboard_kind.cue` 行425–437（`#GridPos`）（https://github.com/grafana/grafana/blob/b3fb81a13abde982b181fd1116cf8982bd07b6c6/kinds/dashboard/dashboard_kind.cue#L425-L437）、`apps/dashboard/kinds/manifest.cue` 行1–20、文書`docs/sources/visualizations/dashboards/build-dashboards/best-practices/index.md` 行147–176、200–217（https://github.com/grafana/grafana/blob/b3fb81a13abde982b181fd1116cf8982bd07b6c6/docs/sources/visualizations/dashboards/build-dashboards/best-practices/index.md#L147-L176）。信頼性ラベル：primary（AGPL-3.0、構造だけ観察）。本文確認：済
- 何をしているか：`DashboardSpec`は`elements`（名前→`PanelKind`｜`LibraryPanelKind`のmap）と`layout`（`GridLayoutKind`｜`RowsLayoutKind`｜`AutoGridLayoutKind`｜`TabsLayoutKind`）を別に持つ。layoutの各itemは`ElementReference`（kindと名前）で要素を参照する。Rows・Tabsは子に再びlayoutを持てるので、配置は再帰的な木になる。`GridLayoutItemSpec`は座標と寸法を持つ。`AutoGridLayoutSpec`は列幅・行高を名前付きmode（`narrow`／`standard`／`wide`／`custom`など）で指定し、`custom`のときだけ数値を使う。Row・Tab・AutoGrid itemは`repeat`（変数による反復）と`conditionalRendering`（変数、データ有無、時間範囲によるshow/hideをand/orで束ねる）を持つ。`Preferences.layout`は新しい容器の既定layoutを決める。旧schemaの`#GridPos`は固定列数のgrid上の`x`、`y`、`w`、`h`だけを持っていた。`manifest.cue`は複数の版（v0alpha1〜v2）を同時に提供する。文書は、データの流れ順に行を並べる、RED法で左右に配置する、drill-downで階層化する、一般から特殊へ進める、認知負荷を減らす、といったvisual hierarchyの指針を書く。
- 解いている問題と前提：同じpanelを複数の配置（grid、行、tab、自動grid）で再利用し、配置方式を変えてもpanel定義を変えないようにする。dashboardはJSONでversion管理し、script（grafonnet等）で生成する運用を文書が推奨している（best-practices 行183–186付近）。
- 必要な入力：要素の一意な名前、配置方式の選択、反復と条件表示に使う変数。
- trade-off・失敗の仕方：v2 schemaのvariables（変数）の定義部分には「FIXME」「TODO」のコメントが残り、旧schemaで条件付きだった変数のboolean property（`hide`、`skipUrlSync`、`multi`）を条件付きにするか、必須で既定falseにするか未決である（行743–745）。複数の版が並存するため、利用者は版間の変換を前提にする。visual hierarchyの指針は文書だけにあり、schemaでは強制されない（例：「良い／悪い」の色の意味は閾値の設定に委ねる。best-practices 行167–168）。
- 反例・適用しない場合：旧schemaはpanelの中に`gridPos`を埋め込み、要素と配置を分けていなかった。
- 互換・非互換：P14-O08（閾値と色）と同じschemaにある。P14-O03、P14-O10（版の分離）と同じ「版の並存」の問題を持つ。
- 限界：列数、既定寸法、既定の列数上限などの値は持ち込まない。

### P14-O10 motion tokenの層（ref→sys→comp）と、実装に残るハードコード
- 出典：material-web、`tokens/versions/latest/sass/_md-sys-motion.scss` 行1–106（header行5–16に生成元とcontext tag、行18以降にduration・easing・path・springのtoken）（https://github.com/material-components/material-web/blob/a6b2d2640b336e5d9fc73133a317e9173827ba95/tokens/versions/latest/sass/_md-sys-motion.scss#L1-L106）、`tokens/_md-sys-motion.scss` 行6–12、`tokens/versions/README.md` 行1–14、`tokens/_md-comp-focus-ring.scss` 行13–60（https://github.com/material-components/material-web/blob/a6b2d2640b336e5d9fc73133a317e9173827ba95/tokens/_md-comp-focus-ring.scss#L13-L60）、`internal/motion/animation.ts` 行7–21（https://github.com/material-components/material-web/blob/a6b2d2640b336e5d9fc73133a317e9173827ba95/internal/motion/animation.ts#L7-L21）、`tabs/internal/tab.ts` 行141–188、211–213、`focus/internal/_focus-ring.scss` 行108–112、`dialog/internal/animations.ts` 行52–160（既定の開閉animationのduration）（https://github.com/material-components/material-web/blob/a6b2d2640b336e5d9fc73133a317e9173827ba95/dialog/internal/animations.ts#L52-L160）、`dialog/internal/dialog.ts` 行65–68、98–109（`quick`属性と`getOpenAnimation`／`getCloseAnimation`の差し替え）、425–434。issue #3712（https://github.com/material-components/material-web/issues/3712）、#4511（https://github.com/material-components/material-web/issues/4511）。信頼性ラベル：primary。本文確認：済
- 何をしているか：sys motion tokenは自動生成fileで、名前付きduration段、easing（standard・emphasizedとそのaccelerate／decelerate、legacy、linear）、path、spring（default／fast／slowとeffects／spatialの組、damping・stiffness）を持つ。headerに生成元のdesign system版、audience・platform等のcontext tagを記録する。公開入口`tokens/_md-sys-motion.scss`は`versions/latest`ではなく旧版directoryを`@use`する。versions directoryのREADMEは、ここは小さい更新でも壊れうるので正確なversionに固定せよと警告する。component token（focus ring）は`$deps`のmapからsys tokenを名前で引き、`validate.values`で対応tokenの集合を検査する。一方、TypeScript実装の`EASING`定数はtokenを使わず値を直書きしている。コメントには、`EASING.EMPHASIZED`についてだけ「近似で精度不明」との注記と、tokenへ置き換えるTODOがある（animation.ts 行10–12）。dialogは既定の開閉animationのduration値を`dialog/internal/animations.ts`に持ち、tabsは`tab.ts`に持つ。reduced motionはcomponentごとに個別に扱う（tabsは`matchMedia`でtransformをopacity切替へ替える。focus ringはCSS media queryでanimationを止める）。dialogは`quick`属性で開閉animationを省略し、`getOpenAnimation`／`getCloseAnimation`の差し替えで上書きを許す。
- 解いている問題と前提：設計system側で生成したmotion値をCSSの層で共有する。Web Animations APIで動かす部分はCSS tokenを直接読めない前提に見える（TODOの存在から読める範囲）。
- 必要な入力：duration段とeasingの語彙、componentごとにどのtokenを使うか、reduced motion時の代替動作。
- trade-off・失敗の仕方：tokenと実装の値が二重管理になっている（animation.tsのTODO）。issue #3712は、全animationのdurationをcustom propertyで出し、reduced motionを一括で制御したいと要望している。保守者はanimation tokenを計画中と回答し、libraryが`prefers-reduced-motion`を尊重すべきか利用側に任せるかは議論のままである。issue #4511は、animation中に要素がクリックを奪い、外部の自動testが待てないと報告している（`quick`のような省略手段の必要性）。
- 反例・適用しない場合：Grafana（P14-O11）は生成tokenを持たず、theme objectの中に名前付きdurationとeasingを手で定義する。
- 互換・非互換：P14-O03とP14-O09（版の並存）の問題をtoken配布でも持つ。P14-O11と同じ問題を別の層で解いている。
- 限界：duration、easing曲線、springの係数は持ち込まない。

### P14-O11 theme objectに置いたtransition helperとreduced motionのmedia query生成（Grafana）
- 出典：grafana/grafana、`packages/grafana-data/src/themes/createTransitions.ts` 行1–95（https://github.com/grafana/grafana/blob/b3fb81a13abde982b181fd1116cf8982bd07b6c6/packages/grafana-data/src/themes/createTransitions.ts#L1-L95）。信頼性ラベル：primary（AGPL-3.0、構造だけ観察）。本文確認：済
- 何をしているか：先頭コメントで、Material UI由来のコードであり、Material motionのguidelineに従うと出典を示す（行1–6、19–20）。`easing`（用途を説明するコメント付きの名前付き曲線）、`duration`（名前付きの段と、画面に入る・出る用の名前）を定数で持つ。`create(props, options)`はCSS transition文字列を組み立てる。`handleMotion(...)`は`prefers-reduced-motion`のmedia query文字列を作る。`getAutoHeightDuration(height)`は高さからdurationを式で計算する。これらを`ThemeTransitions`として`@alpha`で公開する。
- 解いている問題と前提：style codeがthemeを通じてmotionの名前を使い、reduced motionの分岐をhelperで統一する。値は生成物ではなく、手書きの定数である。
- 必要な入力：durationとeasingの名前の語彙、reduced motion時の方針（helperはmedia queryを作るだけで、何を止めるかは呼び出し側が決める）。
- trade-off・失敗の仕方：API全体が`@alpha`で、安定契約ではない。参照先のguidelineは外部URLで、版の固定がない。
- 反例・適用しない場合：material-web（P14-O10）は設計system側から生成したtokenを配布する。
- 互換・非互換：P14-O10と同じ問題を持つ。P14-O07の`createColors`と同じtheme生成の流儀（`create*`関数群）である。
- 限界：duration値と曲線、高さからの計算式の係数は持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| contrastを満たす色の生成 | MCU：役割ごとに背景対とcontrast曲線を型で必須にし、制約を順に解く（O01、O02） | Leonardo：背景1つに対する目標比の集合を入力にし、補間scale上で二分探索する（O05） | MCUは固定の役割体系（容器と中身など）を前提にする。Leonardoは役割を持たず、利用者が比の集合を設計する |
| contrastの保証の置き場所 | MCU：constructorの検査とsolverで保証し、届かない目標は文書でdiscretionaryと区別する | Radix：固定値を手調整し、保証は文書の主張にとどまる。issue #42、#12で主張と実測のずれが報告された（O04） | 実行時生成か配布時固定か |
| 指定色（ブランド色）の保持 | Radix生成器：既存の手調整scaleのうち最も近いものを混ぜ、hueとchromaを指定色に寄せる（website `generate-radix-colors.tsx` 行191–260） | Leonardo：比が正本なので指定色そのものは出力に残らない（issue #149、#77） | 見た目の正本が「手調整scale」か「比」か |
| 意味色の派生 | Grafana：1値から係数で明暗派生し、未指定だけ埋める（O07） | MCU：役割を制約付きで解く。material-web：ref palette→sys役割→compの参照（O06） | 派生色にcontrast保証を求めるかどうか |
| light/dark切替 | Grafana可視化色：名前を保存し、theme別の実値で解決する（O08） | Radix：mutable alias（light/darkで別の段を指す変数）を利用者が定義する（O06） | 定義を保存するdocument（dashboard）が利用者側にあるかどうか |
| 配色・tokenの版管理 | MCU：`specVersion`をscheme属性にし、delegateを切り替える（O03） | material-web：生成tokenを版directoryに分け、公開入口は特定版に固定する（O10） | 版の選択を利用者の実行時にするか、配布物の構成にするか |
| motionの値の配布 | material-web：設計systemから生成したsys token（duration・easing・spring）をcomp tokenが参照する。実装TSには直書きが残る（O10） | Grafana：theme objectに手書きの名前付き定数とhelperを置く（O11） | 上流の設計systemと生成pipelineがあるかどうか |
| reduced motion | material-web：componentごとに個別に扱い、一括制御はissue #3712で未解決 | Grafana：media query文字列を作るhelperだけを提供し、適用は呼び出し側 | library側で強制するか、利用側の責任にするか（#3712の議論が未決） |
| dashboardの配置 | Grafana v2：要素mapと再帰layout木を分け、参照で結ぶ（O09） | Grafana旧schema：panelに固定grid座標を埋め込む（`#GridPos`） | panelの再利用と、複数の配置方式（tab、行、自動grid）への対応が必要かどうか |

## 見つからなかったこと・gap
- visual hierarchy（大きさ、位置、強調による優先順位）を機械可読なschemaや制約で表した一次資料は見つからなかった。Grafanaでは文書の指針だけだった（O09）。MCUの`ToneDeltaPair`は明度差という限られた面だけを扱う。
- motionについて、durationを距離や大きさから決める規則のcode上の根拠は、Grafanaの`getAutoHeightDuration`の式だけだった。material-webのtoken側に「どの場面でどのdurationを使うか」の規則文書はrepo内に見つからなかった（外部のm3.material.ioにあると推測されるが、読んでいない）。
- dashboardでの色覚配慮のうち、色以外の符号化（模様、形）はGrafana schemaに見当たらず、issue #21120は未優先のままclosedになっていた。
- 生成した色がcontrastに届かなかったとき、明示的に失敗を返す設計は、読んだ範囲のどのrepoにもなかった。MCUは目標として近づけ、Leonardoは探索を打ち切って最も近い色を返す。
- Carbon（motion、data visualization）は前回P01〜P07で読んだrepositoryで、今回は別の箇所を読む余力を割かなかった。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- material-color-utilities：`concepts/contrast_for_accessibility.md`、`concepts/scheme_generation.md`、`concepts/dynamic_color_scheme.md`（全文）、`typescript/dynamiccolor/dynamic_color.ts` 行1–420、`contrast_curve.ts`、`tone_delta_pair.ts`、`variant.ts`（全文）、`color_spec.ts` 行20–60、195–216、`dynamic_scheme.ts` 行119–165とthrow箇所のgrep。読んでいない：`color_spec_2021/2025/2026.ts`の本文（役割ごとの定義値）、`hct/`、`quantize/`、`score/`、他言語実装。issue検索語「contrast」。#185、#162の本文を読んだ。
- radix-ui/colors：`README.md`、`src/index.ts`、`src/light.ts`冒頭、`scripts/build-css-modules.js`（全文）、export名のgrep。issue検索語「generate」「contrast」。#42、#45、#51、#12の本文を読んだ。radix-ui/website：`components/generate-radix-colors.tsx`（行1–60、151–380を中心に読み、alpha計算の行374以降は関数名だけ）、`understanding-the-scale.mdx`（見出しと該当節）、`aliasing.mdx`（見出しと該当節）。
- adobe/leonardo：`lib/theme.js`（全文）、`lib/utils.js` 行30–60、380–517、`README.md`の該当節。読んでいない：`lib/color.js`、`curve.js`、`chroma-plus.js`、`backgroundcolor.js`、`docs/ui`、`packages/mcp`、`skills`。issue検索語「ratio」。#77、#149の本文を読んだ。
- material-web：`tokens/_md-sys-motion.scss`、`tokens/versions/latest/sass/_md-sys-motion.scss`（値は伏せて構造だけ確認）、`tokens/versions/v0_192/_md-sys-motion.scss`冒頭、`tokens/versions/README.md`、`tokens/_md-comp-focus-ring.scss` 行1–70、`tokens/_md-sys-color.scss`と`v0_192/_md-sys-color.scss`のgrep、`internal/motion/animation.ts` 行1–80、`tabs/internal/tab.ts` 行140–213、`focus/internal/_focus-ring.scss` 行100–113、`dialog/internal/animations.ts` 行1–50、`dialog/internal/dialog.ts`の該当行。検索語「prefers-reduced-motion」「EASING」「motion tokens」「reduced motion」。issue #3712、#4511の本文を読んだ。
- grafana（sparse checkout）：`apps/dashboard/kinds/v2/dashboard_spec.cue` 行1–80、185–300、398–480、600–745、1095–1143、`apps/dashboard/kinds/manifest.cue` 行1–80、`kinds/dashboard/dashboard_kind.cue` 行420–445、`packages/grafana-data/src/themes/createColors.ts` 行1–120、311–419、`createTransitions.ts`（全文）、`createVisualizationColors.ts` 行8–160、`table-colors.md`（全文）、`docs/.../best-practices/index.md` 行72–275の該当節。読んでいない：v2alpha1／v2beta1との差分、変換code（Go）、`palette_new.ts`、`themeDefinitions/`、panel plugin側のschema。issue検索語「colorblind palette」「dashboard schema v2 auto grid layout」（後者は0件）。#18041、#21120の本文を読んだ。
- 実行したもの：`gh api`（metadata、commit、contents、tree）、`gh search issues`、`gh issue view`、`git clone --filter=blob:none`と`git checkout`（hookは無効化）。外部repositoryのcode、script、test、build、install、hookは実行していない。gh api／gh呼出しは約30回。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：全観察は外部OSSのsourceと文書からのリバースエンジニアリングである。radix-ui/websiteは製品repoではなく文書・生成器のrepoであり、radix-ui/colorsの観察（O04、O06）の由来を一つにまとめてよいかは未決。grafanaはAGPL-3.0なので、構造の観察に限った由来であることを属性に残すかは未決。
- scope：O01〜O08は色、O09はdashboard構造とvisual hierarchy（文書由来の指針を含む）、O10〜O11はmotionである。D09 Visual Designのどの下位領域へ割り当てるかは未決。O09の文書由来の指針（best-practices）を、code由来の観察と同じ信頼性で扱うかも未決。
- 評価根拠：どの観察もHELIXでの検証はない。外部での採用や成功をHELIXでの成功とみなさない。issueで示された失敗（MCU #185、Radix #42・#12、Leonardo #149、material-web #3712・#4511、Grafana #18041・#21120）は反例の候補素材にとどまる。
- 版：各観察は上表の固定commitに紐づく。MCU、material-web、Grafanaは自身の中で複数の版を並存させている（spec版、token版、schema版）。観察がどの版を指すかを属性に持つかは未決。
- 状態：すべて未評価の候補素材。HELIX-BRAINへの登録、採否、製品固有の値の取込みはしていない（HELIXBRAIN-L2-026／027の経路に委ねる）。
