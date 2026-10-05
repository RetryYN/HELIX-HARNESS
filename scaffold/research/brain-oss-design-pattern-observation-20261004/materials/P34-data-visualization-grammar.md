# P34 data可視化の文法・chartの選び方・scaleと色のscheme・accessibilityの観察（D09 Visual Design）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法、比、件数上限等）は持ち込まない。技術選定・採用推奨ではない。
値の線引き：非数値の既定の挙動（どの条件でどの種類のscaleや名前付きrangeが選ばれるか等）は構造として書く。数値の既定値、色の値、scheme名の既定の割当て、件数の上限は、出典に書かれていても写さない。

埋めようとしたgap：[SCF-B-0155 D09](../../brain-domain-material-inventory-20261004/materials/D09-visual-design.md) §5「data可視化（chartの選び方、色の使い方）」。P14（色の体系・motion・dashboard）で読んだmaterial-color-utilities、radix-ui/colors、adobe/leonardo、material-web、grafana/grafanaとは重ねていない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| vega/vega-lite | https://github.com/vega/vega-lite | 213faf313cd2e8b1f94b61d24e90cac2e77b576e（default branch: main） | BSD-3-Clause | false | 2026-10-05 | grammar of graphics（data・mark・encoding・scale）を宣言的なspecにし、Vegaへcompileする実装。測定の型・channel・markから既定のscale・軸・色rangeを決める規則がcodeとして読める |
| vega/vega | https://github.com/vega/vega | 045d12611007cd65ae5ce68e4179d4ee2f150ef8（main） | BSD-3-Clause | false | 2026-10-05 | Vega-Liteの出力先。scale型のmetadata、color schemeの登録、名前付きrangeの解決、SVG出力時のARIA属性の生成がpackageごとに分かれている |
| observablehq/plot | https://github.com/observablehq/plot | 535723d5e433727720d9b673c31622821bb03210（main） | ISC | false | 2026-10-05 | 同じgrammar系だが、測定の型を宣言させず、data値からscale型を推論する。chartの種類を自動で選ぶ`auto` markを持ち、schemeを分類して型推論に使う |
| apache/echarts | https://github.com/apache/echarts | 34f4d927eafe251f26f63afd3aeefa30f2feba30（master） | Apache-2.0 | false | 2026-10-05 | grammar系ではなく、chartの種類（series type）を先に選ぶoption model。名前によるpalette割当て、visualMap、ARIAの説明文と模様（decal）による色に頼らない表現を実装している |
| cmudig/draco2 | https://github.com/cmudig/draco2 | 18bcd8460347058a921c32ff72b1b3e48a4342dc（main） | MIT | false | 2026-10-05 | 可視化の設計知識をhard／soft制約として書き、制約solverでchartを推奨・検査する。規則を木（Plot auto）ではなく重み付き制約で表す対照になる |

（d3/d3-scale-chromaticは本文を読んでいない。Plotがd3からscheme・interpolatorをimportしていること、Vega-Liteの文書がschemeの出典にd3-scale-chromaticを挙げていることを確認しただけである。）

## 観察

### P34-O01 grammarのspecを段階に分けてcompileする（normalize→model→parse→assemble）と、明示と暗黙の値の分離
- 出典：vega-lite、`src/spec/unit.ts` 行15–42（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/spec/unit.ts#L15-L42）、`src/compile/compile.ts` 行41–117（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/compile.ts#L41-L117）、`src/compile/split.ts` 行4–40（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/split.ts#L4-L40）、同 行127–153（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/split.ts#L127-L153）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - unit specは`mark`と`encoding`（channelからfield定義への対応）を持つ。shortcut・展開の構文を含まない形を`NormalizedUnitSpec`として型を分けている。
  - `compile`のdoc commentは段階を次の順に書いている。normalize（row／column channelをfacet specへ、composite mark（box plot等）をlayer specへ展開）→ build model（model tree）→ parse（scale・axis・legend等をcomponentという中間表現へ。bottom-upで子の部品を親へmerge）→ optimize（data flow）→ assemble（Vega spec）。
  - componentの各propertyは`Split`で「利用者が明示した値（explicit）」と「compilerが決めた値（implicit）」を別に持つ。`get`は明示を優先する。layer等で複数の子のscaleをmergeするとき、`mergeValuesWithExplicit`は明示の側を勝たせ、両方が同じ種類で値が違う場合だけtie breakerに渡す。
- 解いている問題と前提：短い宣言（data、mark、encoding）から、scale・軸・凡例まで揃った低水準のspecを作る。layerやfacetで同じchannelのscaleを共有するとき、どの子の設定を採るかを決める必要がある。`Split`のcommentは、利用者が明示した値を優先することがscale・axis・legendのmergeで重要だと書いている。
- 必要な入力：data、mark、channelごとのfield定義（field名と測定の型、P34-O02）、config（既定値の束）。
- trade-off・失敗の仕方：既定値の決定がcompilerの中の関数群に分かれるため、出力がなぜその形になったかを利用者が追うには、出力されたVega specやlogの警告を読む必要がある（明示値が不適合なときは警告して既定へ戻す。P34-O03）。
- 反例・適用しない場合：EChartsは、series type（chartの種類）を先に指定し、その種類が受け付けるoptionを書くmodelで、markとencodingを分けたgrammarを中心にしない（P34-O05、O10）。Plotもgrammar系だが、読んだ範囲では、Vega-Liteのような中間specへのcompileを経ず、mark・channel・scaleをJavaScriptの関数呼出しで組んで描画する（P34-O04）。
- 互換・非互換：P34-O02〜O04の既定値の決定は、このparse段階で行われる。P34-O06（名前付きrange）はassembleされたVega specの中でVega側が解決する。
- 限界：段階名・中間表現はこのrepo固有であり、HELIXへ持ち込まない。

### P34-O02 測定の型（nominal・ordinal・quantitative・temporal）をfieldごとに宣言させ、省略時はspecの構造から補う
- 出典：vega-lite、`src/type.ts` 行49（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/type.ts#L49-L49）、`src/channeldef.ts` 行1018–1059（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/channeldef.ts#L1018-L1059）、同 行1199–1224（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/channeldef.ts#L1199-L1224）、`site/docs/encoding/type.md` 行17（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/site/docs/encoding/type.md#L17-L17）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 標準の型は`quantitative`、`ordinal`、`temporal`、`nominal`の4つである。
  - field定義を初期化するとき、型が書かれていれば略記を正式名へ直す。count系のaggregateに非quantitativeの型が付いていれば警告してquantitativeへ直す。
  - 型が空または無効なら（secondary range channelを除き）`defaultType`で補う。`defaultType`は**data値を見ない**。channel（緯度経度はquantitative、row／column／facet／shape／strokeDashはnominal、orderはordinal）、sortが配列ならordinal、timeUnitがあればtemporal、binまたは（argmin／argmax以外の）aggregateがあればquantitative、scale型が指定されていればその分類から決め、どれにも当たらなければnominalにする。
  - 型を決めた後、channelとの適合を検査し、不適合なら警告する。
  - 文書（type.md）は、quantitativeには比率尺度と間隔尺度の両方がありうること、既定でx・y・sizeのscaleにzeroを含めるのは比率尺度向きであること、間隔尺度ならzeroを外せることを書いている。
- 解いている問題と前提：同じ列でも、名義・順序・量・時刻のどれとして読むかで、適切なscale、色、軸が変わる。型をdataから推論せず宣言（または宣言の構造）から決めるので、同じspecは同じ出力になる。
- 必要な入力：fieldごとの測定の型。省略する場合は、aggregate・bin・timeUnit・sort等の宣言。
- trade-off・失敗の仕方：型を書かないと、数値の列でもnominalとして扱われうる（`defaultType`の最後の分岐）。逆に宣言の手間を利用者に課す。比率尺度と間隔尺度はどちらも`quantitative`で区別されず、zeroの扱いは別のproperty（P34-O14）に委ねられる。
- 反例・適用しない場合：Plotは型を宣言させず、data値の最初の非null値でscale型を推論する（P34-O04）。EChartsはdimensionの型が宣言されていればそれを使い、なければdataの先頭の数件を見て推測する（P34-O04）。Dracoはschemaからfieldの基本型（string・number・boolean・datetime）と統計量を作り、制約の入力にする（P34-O12）。
- 互換・非互換：P34-O03（既定のscale型）、P34-O06（既定の色range）の入力になる。P34-O04とは「宣言」か「推論」かで対立する。
- 限界：型の集合はこのrepo固有であり、HELIXの語彙として持ち込まない。

### P34-O03 既定のscale型を（測定の型 × channel × mark）で決め、明示された型は適合を検査して不適合なら既定へ戻す
- 出典：vega-lite、`src/compile/scale/type.ts` 行22–58（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L22-L58）、同 行60–150（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L60-L150）。vega、`packages/vega-scale/src/scales.js` 行68–129（https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-scale/src/scales.js#L68-L129）、同 行135–166（https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-scale/src/scales.js#L135-L166）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `scaleType`はまず既定の型を計算する。明示された型があれば、channelが支持しない型、またはfieldの測定の型が支持しない型の場合は警告を出して既定の型を返し、適合すれば明示の型を返す。
  - `defaultType`は測定の型で分岐する。以下は主な分岐で、band等になる特例（nominal／ordinalのtime channel〔行80–82、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L80-L82〕、arc markの極座標channel〔行94–95、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L94-L95〕、markの大きさが相対band指定〔行98–100、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L98-L100〕、軸の`tickBand`〔行103–105、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L103-L105〕、temporalのtime channel〔行119–121、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L119-L121〕）を除いて書く。
    - nominal／ordinal：色channelか離散rangeのchannelならordinal scale。x・y（またはそのoffset）でmarkがrect・bar・image・rule・tickならband、入れ子のoffset scaleがあればband。それ以外はpoint。
    - temporal：色channelならtime。離散rangeのchannelなら警告してordinal。timeUnitがUTCならutc。それ以外はtime。
    - quantitative（行126–142の順、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L126-L142）：色channelなら、binありはbin-ordinal、binなしはlinear。色channelでないとき、離散rangeのchannelは警告してordinal、time channelはband（TODO commentあり）、それ以外はlinear。
  - commentには、`scaleType`をCompassQLが使い（行26、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L26-L26）、`defaultType`をVoyagerが使う（行63、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/type.ts#L63-L63）と、関数ごとに別々に書かれている（いずれも推奨系のtool）。
  - Vega側では、scale型ごとにmetadata（continuous、discrete、discretizing、interpolating、log、temporal）を登録し、型の分類を問い合わせる関数（`hasType`を使う`isContinuous`・`isDiscrete`・`isDiscretizing`・`isInterpolating`等、行135–166）を提供している。sequential・divergingのscaleはcontinuousかつinterpolatingとして登録されている。
- 解いている問題と前提：利用者がscaleを書かなくても、markの形（棒は帯に収める等）と測定の型に合ったscaleを選ぶ。明示が不適合なときに停止せず、警告して描画を続ける。
- 必要な入力：channel、測定の型、mark型、bin・timeUnitの有無、offset channelの有無。
- trade-off・失敗の仕方：不適合な明示を黙って置き換えないが、停止もしないため、警告を見ない利用者は意図と違うscaleに気づかない可能性がある。temporalのtime channelにはTODO commentがあり、補間の実装後にlinearへ変える予定と書かれている（行120–121）。
- 反例・適用しない場合：Plotは、channel側がscale型を要求する場合（barYのxはband等）に、利用者の型と食い違うとerrorを投げる（P34-O04）。EChartsは軸の`type`（category・value・time・log）を利用者が選ぶ。
- 互換・非互換：P34-O02の型が入力。P34-O06（色range）とP34-O14（zero）はこの型の結果を使う。
- 限界：scale型の種類と分岐はこのrepo固有である。

### P34-O04 data値からscale型を推論し、literalな値にはscaleを掛けない（Plot）／dimensionの型を標本から推測する（ECharts）
- 出典：plot、`src/scales.js` 行394–467（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales.js#L394-L467）、`src/options.js` 行472–485（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/options.js#L472-L485）、同 行139–142（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/options.js#L139-L142）、`src/channel.js` 行38–58（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/channel.js#L38-L58）。echarts、`src/data/helper/sourceHelper.ts` 行336–420（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/data/helper/sourceHelper.ts#L336-L420）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Plot `inferScaleType`の順序：facet scaleは常にband。projectionがあればx・yはscaleしない。channelが型を指定していれば採り、利用者の型や他のchannelと食い違えばerrorを投げる。型が決まればそれを返す。dataも型も無ければscaleを作らない。半径・不透明度・長さ・symbolのscaleには種類ごとの既定の型がある。domainかrangeが明示されていて要素数が2でなければordinal系にする。それ以外はdomain（あれば）かchannelの値から推論し、文字列・真偽値ならordinal系、Dateならutcにする。色scaleでは、pivotがあるかschemeが発散系ならdiverging、分類系schemeならcategoricalにする（P34-O08）。残りはlinear。
  - `isOrdinal`・`isTemporal`は、最初の非nullの値だけを見て判断する（commentに、速さと単純さのため、型は揃っている前提と書かれている）。
  - ordinal系の型は、位置のscaleならpoint、色なら「暗黙のordinal」という内部の印、それ以外はordinalにする（P34-O08で、明示のordinalと暗黙のordinalで既定のschemeが分かれる）。
  - channelのscaleが`"auto"`の場合、fill・stroke・colorの値がすべて色として解釈できる文字列ならscaleを掛けず（literal）、そうでなければcolor scaleを使う。`true`を指定すると常にscaleを掛ける。`maybeColorChannel`は、optionの値が色ならconstant、そうでなければchannel（field）として扱う。
  - EChartsの`guessOrdinal`（`doGuessOrdinal`）は、まずdataがtyped arrayなら非ordinalとする（行366–368、https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/data/helper/sourceHelper.ts#L366-L368）。次に、dimensionの型が宣言されていればそれに従う（行385–387、https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/data/helper/sourceHelper.ts#L385-L387）。どちらでもなければ、dataの先頭の限られた件数を走査して推測する。commentは「規則を複雑にすると、利用者がdataのどこが誤っているか分からなくなる」と書いている。件数は持ち込まない。
- 解いている問題と前提：型の宣言を省いて短く書けるようにする。dataの値の型（JavaScriptの文字列・数値・Date）が測定の型をおおむね表している前提である。
- 必要な入力：data値（JavaScriptの型が揃っていること）、必要ならscale型・domain・schemeの明示。
- trade-off・失敗の仕方：数値のコード（郵便番号、年度など）は量として扱われる。最初の非null値だけを見るので、混在した列では誤った型になりうる。同じ記述でもdataが変わると型が変わる。
- 反例・適用しない場合：Vega-Liteは型をdataから推論しない（P34-O02）。
- 互換・非互換：P34-O02と対立する（宣言と推論）。P34-O08（scheme分類）の結果を型推論に使う点で、色の選択と型の決定が双方向に結び付いている。
- 限界：推論規則はこのrepo固有であり、HELIXの規則にしない。

### P34-O05 datasetの列をseriesへ既定で割り当てる（category way／value way）
- 出典：echarts、`src/data/helper/sourceHelper.ts` 行76–185（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/data/helper/sourceHelper.ts#L76-L185）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `makeSeriesEncodeForAxisCoordSys`は、seriesがdatasetを参照していて座標の次元が定義されている場合だけ、既定のencode（座標の次元→dataの列番号）を作る（commentに、要求が出るまでdataset使用時だけにする、とある）。
  - doc commentが方式を2つ書いている。「value way」はどの軸もcategoryでない場合で、seriesが順にdatasetの列を必要数ずつ取る。「category way」は少なくとも1軸がcategoryの場合で、最初の列をcategory軸に割り当てて全seriesで共有し、残りの列をseriesが順に取る。
  - 同じdatasetを参照するseries間で、どこまで列を使ったかを`datasetMap`に記録して続きから割り当てる。`resetSourceDefaulter`は全seriesのmergeOptionの前に呼ぶ必要があると書かれている。
- 解いている問題と前提：chartの種類（series type）を先に選ぶmodelで、表の列とchartの次元の対応を書かずに済ませる。表の列の並びが意味を持つ（先頭がcategory）前提である。
- 必要な入力：dataset、seriesごとの座標系の次元定義（どの次元がordinalか）、seriesの並び順。
- trade-off・失敗の仕方：seriesの並び順と列の並び順に結果が依存する。commentに、複数のseriesが1つの次元を共有するときの既定のseries名の規則は未解決（TODO）と書かれている。
- 反例・適用しない場合：Vega-Lite・Plotはencodingでfield名を明示して対応を書く（P34-O01）。
- 互換・非互換：引いた範囲では、どの座標の次元がordinalかは、座標の次元定義の`type`（行126、https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/data/helper/sourceHelper.ts#L126-L126）で判断している。その`type`がP34-O04の`guessOrdinal`の結果から来るかは、引いた範囲では示されていない（関係は推測で、未確認）。
- 限界：割当ての方式はこのrepo固有である。

### P34-O06 色の既定を「名前付きrange」（役割の名前）で指定し、configでschemeへ解決する
- 出典：vega-lite、`src/compile/scale/range.ts` 行115–214（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/range.ts#L115-L214）、同 行256–361（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/range.ts#L256-L361）、`site/docs/encoding/scale.md` 行124（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/site/docs/encoding/scale.md#L124-L124）、同 行469（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/site/docs/encoding/scale.md#L469-L469）。vega、`packages/vega-parser/src/parsers/scale.js` 行239–277（https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-parser/src/parsers/scale.js#L239-L277）、`packages/vega-parser/src/config.js` 行214–231（https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-parser/src/config.js#L214-L231）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `parseRangeForChannel`は、利用者が`range`か`scheme`を書いていれば（scale型・channelと適合する場合）それを明示値として返す。適合しなければ警告して無視する。書かれていなければ、x・yのstep指定を処理した後、`defaultRange`を計算する。`rangeMin`・`rangeMax`のどちらかが指定され、scale型がそれを支持し、既定のrangeが2要素の配列なら、その端を置き換えた値を明示値として返す（行200–211、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/range.ts#L200-L211）。それ以外は`defaultRange`の結果を暗黙値（implicit、P34-O01）として返す。
  - `defaultRange`は、色・fill・strokeについて、scale型がordinalなら、nominalのfieldは`category`、それ以外は`ordinal`という名前を返す。ordinal以外のscale型では、`domainMid`が指定されていれば`diverging`、markがrectかgeoshapeなら`heatmap`、それ以外は`ramp`を返す。返すのは色の値ではなく、役割の名前である。
  - Vegaの`parseScaleRange`は、rangeが文字列でconfigの`range`に同名の項目があれば、その中身（scheme指定等）に置き換えて再帰的に解決する。configの`range`には、category・ordinal・heatmap・ramp・divergingなどの名前ごとにscheme（発散系には範囲の指定も）が既定値として置かれている。scheme名と範囲は持ち込まない。
  - 文書（scale.md 124）は、色の既定をnominalはcategory、ordinalはordinal、quantitative・temporalはrect markならheatmap、それ以外はrampと書く。実装はgeoshapeもheatmapに含め、`domainMid`があればdivergingを返す。文書の表はこの2点に触れていない。
- 解いている問題と前提：specの側では「分類の色」「順序の色」「発散の色」という役割だけを決め、具体的な配色はthemeやconfigで差し替えられるようにする。測定の型（P34-O02）とmarkの形から役割が決まる前提である。
- 必要な入力：測定の型、scale型、mark型、発散の中点（`domainMid`）の有無、configの名前付きrange。
- trade-off・失敗の仕方：発散の配色は中点を利用者が明示した場合だけ既定で選ばれ、dataから中点を推測しない。文書と実装で、heatmapの対象markと発散の条件の記述が一致していない。
- 反例・適用しない場合：Plotは名前付きrangeを介さず、scale型ごとにscheme名の既定を直接持つ（P34-O08）。EChartsは全体の色の配列（palette）を名前で順に割り当てる（P34-O09）。
- 互換・非互換：P34-O07（Vegaのscheme登録と適用）が解決の後段。P14-O06（semanticの別名層）と同じく、役割の名前と値を分ける構造である。
- 限界：名前付きrangeの種類はこのrepo固有である。scheme名・色の値は持ち込まない。

### P34-O07 schemeを「離散の色の配列」と「連続の補間関数」の2形で登録し、scale型に合わせて変換する
- 出典：vega、`packages/vega-scale/src/schemes.js` 行1–32（https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-scale/src/schemes.js#L1-L32）、`packages/vega-encode/src/Scale.js` 行260–346（https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-encode/src/Scale.js#L260-L346）。vega-lite、`src/compile/scale/properties.ts` 行255–260（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/properties.ts#L255-L260）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - vega-scaleは、離散のpaletteを色の配列として、連続のpaletteを補間関数として、名前（小文字化）で登録する。`scheme(name, value)`で利用者が追加でき、`scheme(name)`で取得する。
  - `configureRange`は、rangeStepの指定がなく`scheme`が指定されている場合に`configureScheme`を呼ぶ。schemeが（色の）配列で書かれていれば補間関数に変換し（行317–318、https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-encode/src/Scale.js#L317-L318）、名前なら登録から取得する（無ければerror）。名前で取得した結果は、離散のschemeなら配列、連続のschemeなら補間関数である。
  - 必要な色の数は、scale型ごとに求め方が分かれる（threshold、bin-ordinal、ordinal、quantile／quantize）。
  - 適用は行333–335（https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-encode/src/Scale.js#L333-L335）の順で分かれる。補間型のscale（sequential・diverging）には、補間関数を（範囲・反転の調整をして）渡す。補間型でないscaleに関数のscheme（配列で書いたschemeを変換したものを含む）が渡ると、範囲を調整したうえで必要数に量子化する（ordinalでも同じ）。配列のまま扱うのは、名前で指定した離散のschemeの場合だけで、ordinalには配列をそのまま、その他は必要数で切り詰めて渡す。
  - 補間関数を返したのにscale型が補間を受け付けない場合はerrorにする。
  - Vega-Liteは、色channelで型がnominal以外のときだけ、既定の補間の色空間を指定する（色空間名は持ち込まない）。
- 解いている問題と前提：同じschemeを、連続のscaleにも、段階に分けたscaleにも、分類のscaleにも使えるようにする。schemeの種類（離散か連続か）とscaleの種類が独立に選ばれる前提である。
- 必要な入力：scheme（名前、配列、または補間関数）、scale型、domainの要素数、範囲（extent）・反転・数（count）の指定。
- trade-off・失敗の仕方：分類用の離散schemeを連続のscaleに与えると、配列から補間関数を作って渡すことになり（行283–286、https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-encode/src/Scale.js#L283-L286）、分類として区別しやすい色の並びという性質は保たれない（codeは用途の検査をしない）。また、色の配列をscheme属性に直接書くと補間関数に変換されるため、ordinalのscaleでも配列の色そのものではなく、量子化した色になる。scheme名が無ければ描画時のerrorになる。
- 反例・適用しない場合：Plotは用途別にschemeを分類し、用途と合わないschemeを型推論で避ける（P34-O08）。
- 互換・非互換：P34-O06の名前付きrangeが解決された後に、この変換が働く。
- 限界：登録されたscheme名・色の値は持ち込まない。

### P34-O08 schemeを用途（分類・発散・順序（単色相／多色相）・循環）で分類し、型推論と既定の割当てに使う
- 出典：plot、`src/scales/schemes.js` 行81–196（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales/schemes.js#L81-L196）、同 行213–287（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales/schemes.js#L213-L287）、`src/scales/ordinal.js` 行13–58（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales/ordinal.js#L13-L58）、`src/scales/diverging.js` 行20–80（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales/diverging.js#L20-L80）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - categorical（分類）のscheme、ordinal用のscheme（分類系に加え、発散系・単色相の順序系・多色相の順序系・循環系）、quantitative用の補間関数、発散系の名前集合を別々の表で持つ。`isCategoricalScheme`・`isDivergingScheme`で用途を判定でき、P34-O04の型推論に使われる。
  - ordinal用の単色相の順序系・一部の多色相の順序系・発散系のschemeは、`scheme9`・`scheme11`・`scheme11r`で包まれ、要求された色数が手で選ばれた離散の組の範囲内ならその組を使い、範囲を超えると補間関数から量子化する（行153–176、https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales/schemes.js#L153-L176）。色数が少ない場合の選び方（中央を選ぶ、発散の両端を選ぶ等）がcommentに書かれている。数は持ち込まない。補間関数だけの多色相の順序系（`schemei`）と循環系（`schemeicyclical`）は、色数にかかわらず常に補間関数から量子化する（行126–134、https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales/schemes.js#L126-L134、行149–150、https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales/schemes.js#L149-L150、行178–184、https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales/schemes.js#L178-L184）。
  - 温度のように向きを逆にしたい発散系のために、反転版を別名で登録している（commentに「for temperature data」）。
  - ordinal color scaleでは、domainが真偽値だけなら、schemeの両端に対応させる。schemeもrangeも無い場合、利用者が型を`ordinal`と明示していれば順序系の既定、型推論で暗黙にordinalになった場合（P34-O04）は分類系の既定を使う。scheme名は持ち込まない。
  - 色scaleの型推論では、`pivot`が指定されているか、schemeが発散系ならdivergingにする（`src/scales.js` 行448–452、https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/scales.js#L448-L452）。
  - diverging scaleは`pivot`（中点。diverging.js内に既定値を持つが、値は持ち込まない）を持ち、domainをpivotを含むよう広げる。`symmetric`が有効なら、pivotからの距離が両側で等しくなるようdomainを広げ、色の濃さが中点から対称になるようにする。
- 解いている問題と前提：名義・順序・発散・循環で、適した配色の構造が違う。利用者が用途に合うschemeを選べば型推論もそれに従い、用途を明示しなければ型から既定の用途を決める。
- 必要な入力：scheme名、明示の型（ordinalかどうか）、domain、pivot、symmetricの指定。
- trade-off・失敗の仕方：文字列の列を明示なしで色に割り当てると分類の配色になり、順序のある値（評価の段階など）でも順序が色に表れない。`symmetric`はdomainを片側へ広げる（凡例への影響は未確認）。
- 反例・適用しない場合：Vega-Liteは発散を`domainMid`の明示でだけ選ぶ（P34-O06）。EChartsのpaletteは用途を区別しない配列の巡回で、連続値の色はvisualMapで別に扱う（P34-O09、O10）。
- 互換・非互換：P34-O04（型推論）、P34-O07（離散と連続の変換）と同じ問題を別の位置で解いている。
- 限界：scheme名、色数の境界、既定の割当ては持ち込まない。

### P34-O09 分類の色を「名前→paletteの要素」で記憶して割り当て、同じ仕組みで模様（decal）も割り当てる
- 出典：echarts、`src/model/mixin/palette.ts` 行43–132（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/model/mixin/palette.ts#L43-L132）、`src/visual/aria.ts` 行65–136（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/visual/aria.ts#L65-L136）。issue：apache/echarts#15513（https://github.com/apache/echarts/issues/15513、open）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `getFromPalette`は、scope（既定はmodel自身）ごとに「名前→割り当てた要素」の表と次の位置を持つ。同じ名前には同じ要素を返し、新しい名前には次の要素を割り当てて位置を巡回させる。
  - 階層化したpalette（`colorLayer`）があり要求数が渡されると、要求数より多くの要素を持つ最初のpaletteを選び、どれも満たさなければ最後のpaletteを使う（commentに、paletteは順に並んでいる必要があるというTODO）。階層化paletteが無いか要求数が無ければ既定のpaletteを使う。
  - `getDecalFromPalette`は、色と同じ関数で、`aria.decal.decals`の配列から模様を割り当てる（階層化paletteは使わない）。
  - ariaの`setDecal`は、`aria.decal.show`が有効な場合だけ動く。seriesがdataごとに色を分ける場合は、series typeごとに共通のscopeで、data名から模様を割り当てる。seriesごとに色を分ける場合は、series名から全体のscopeで割り当てる。seriesが独自の`enableAriaDecal`を持てばそれに任せる。利用者が指定した模様は、paletteの模様の上に上書きmergeする。
- 解いている問題と前提：同じ名前（系列名、分類名）に同じ色を与え、chartの再描画やseries間で色が入れ替わらないようにする。色だけで区別できない利用者のために、色と並行に模様でも区別できるようにする。
- 必要な入力：名前（data名・series名。nullだと同じ呼出しでも結果が変わるとcommentにある）、palette（色と模様）、scope、要求数。
- trade-off・失敗の仕方：割当ては名前の初出順に依存し、名前の集合が同じでも出現順が変わると色が変わる。#15513は、`aria.decal.show`を有効にしてもSankeyのnodeとedgeが1種類の模様しか使わないという報告で、series typeごとの対応に依存することを示す。模様は既定で無効である。
- 反例・適用しない場合：Vega-Lite・Plotの分類の色は、scaleのdomain（値の並び）からrangeへの写像で決まり、名前の記憶表は持たない（P34-O06、O08）。Vega-Liteは模様の代わりにshape・strokeDash等の別channelで冗長に符号化できるが、それは利用者が書く（P34-O03でshapeは離散のchannel）。
- 互換・非互換：P34-O13（説明文）と並ぶ、色に頼らない表現の仕組みである。P14-O08（Grafanaが色の名前を保存しthemeで解決する）とは、名前を「色の名前」でなく「dataの名前」に結ぶ点が異なる。
- 限界：paletteの値、模様の種類は持ち込まない。

### P34-O10 連続値・区分値から視覚要素への写像を、chartから独立したcomponent（visualMap）にする
- 出典：echarts、`src/component/visualMap/VisualMapModel.ts` 行60–123（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/component/visualMap/VisualMapModel.ts#L60-L123）、同 行484–527（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/component/visualMap/VisualMapModel.ts#L484-L527）、`src/component/visualMap/typeDefaulter.ts` 行25–40（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/component/visualMap/typeDefaulter.ts#L25-L40）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - visualMapは、対象のseries（index・id、またはseriesと次元の組）、写像するdataの次元、選択範囲内（`inRange`）と範囲外（`outOfRange`）の視覚設定を持つcomponentである。対象のseriesと次元の組（`seriesTargets`）を与えると、seriesIndex・seriesId・dimensionは無視される。
  - 視覚設定は、data側（`target`）と操作部品側（`controller`）に分けて補完される。`inRange`が無ければ、旧版互換の`color`配列（向きが逆）を使い、それも無ければ全体の既定のgradientを使う（commentに、既定色が不要なら`inRange: {color: null}`を指定する、とある）。
  - 種類（continuous／piecewise）を書かない場合、`categories`が無く、かつ「区分の指定（`pieces`があれば空でないこと、無ければ正の`splitNumber`）が無い」か「`calculable`が指定されている」ならcontinuous、そうでなければpiecewiseにする。
- 解いている問題と前提：series typeを先に選ぶmodelでも、値を色・大きさ等へ写す規則を、chartの種類と独立に宣言できるようにする。選択範囲の外の要素の見た目を同じ場所で決める。
- 必要な入力：対象series、次元、最小・最大または区分（pieces、categories）、範囲内・範囲外の視覚設定。
- trade-off・失敗の仕方：既定の種類は、optionの組合せから暗黙に決まる（旧版互換の分岐を含む）。commentは、min・maxは本来既定値を持つべきでなく、旧版互換のためにあると書いている（値は持ち込まない）。
- 反例・適用しない場合：Vega-Lite・Plotは、色の写像をencodingのchannelとscaleとして宣言し、凡例はscaleから作る（P34-O03、O06）。
- 互換・非互換：P34-O09（分類の色の割当て）と役割を分けている。連続と区分の切替えは、P34-O07のscale型（連続・離散化）の切替えに相当する。
- 限界：visualMapの既定の色・寸法は持ち込まない。

### P34-O11 chartの種類を決定木で推奨し、推奨結果をspecとして返す（Plot auto）
- 出典：plot、`src/marks/auto.js` 行15–227（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/marks/auto.js#L15-L227）、同 行229–268（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/marks/auto.js#L229-L268）、同 行285–300（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/marks/auto.js#L285-L300）。issue：observablehq/plot#1763（https://github.com/observablehq/plot/issues/1763、open）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `autoSpec`は、x・y・color・sizeの列を先に実体化して型を調べる（commentに、Plotの挙動は実際の値に依存するので、schemaではなく値を見る、とある）。
  - 既定のreducerを決める。片方の軸だけに値があり、sizeが無ければ、もう片方のreducerをcount、x・yがともにordinal（または片方だけ）でsize等の指定が無ければsizeをcountにする。
  - 既定のmarkを順に決める。sizeがあればdot。加算型のreducer（distinct、count、sum、proportion）またはcolorのreducerがあればbar（histogram・heatmap）。xとyがあり、どちらかがordinal、またはreducerが無く両方とも単調でなければdot、そうでなければline。片方だけならrule。
  - markごとに実装（barY・rectX・cellなど）と、group（ordinal）かbin（量）のtransformを選び、zero baselineの有無を「選ばれたmarkがzeroの基線を持つか」で決める。lineとareaでは、colorの値の種類が多すぎるとseries分けを無効にする。
  - 戻り値はmark名・実装名・transform名・optionを含むspecで、`auto`はそれを使って実際のmarkを組み立てる。
  - #1763は、`isMonotonic`がseries内の並びを区別しないため、複数seriesの時系列で不自然な線になる例を示している（codeにもTODOがある）。
- 解いている問題と前提：利用者がchartの種類を決めずに、dataの列と役割（x、y、color、size）だけで妥当な初期のchartを得る。決定は順序付きの条件分岐で、同じ入力には同じ出力を返す。
- 必要な入力：列の値（ordinalか、数値か、単調か、値の種類の多さ）、reducerの指定、markの明示（任意）。
- trade-off・失敗の仕方：単調性は列全体で判定するため、series分けの前提が崩れると誤ったmarkを選ぶ（#1763）。分岐の順序が推奨の優先順位を暗黙に決めており、利用者のtask（値を読むのか、分布を見るのか）は入力にない。
- 反例・適用しない場合：Dracoは同じ問題を、重み付きのsoft制約の最適化として解き、taskを入力に取る（P34-O12）。Vega-Liteは推奨を持たず、利用者がmarkを書く（commentによれば、推奨系toolのCompassQLが`scaleType`を、Voyagerが`defaultType`を使う。P34-O03）。
- 互換・非互換：P34-O04（値からの型推論）を前提にしている。P34-O14のzeroの決め方と同じ問題を、markの選択の後に決める点が共通する。
- 限界：分岐の閾値（種類の多さ等）は持ち込まない。

### P34-O12 設計知識をhard制約とsoft制約（重み付き）で表し、制約solverでchartを推奨・検査する（Draco）
- 出典：draco2、`README.md` 行23–28（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/README.md#L23-L28）、`draco/asp/define.lp` 行1–76（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/asp/define.lp#L1-L76）、`draco/asp/generate.lp` 行1–57（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/asp/generate.lp#L1-L57）、`draco/asp/constraints.lp` 行1–19（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/asp/constraints.lp#L1-L19）、`draco/asp/hard.lp` 行1–80（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/asp/hard.lp#L1-L80）、`draco/asp/soft.lp` 行1–40（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/asp/soft.lp#L1-L40）、同 行183–187（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/asp/soft.lp#L183-L187）、同 行244–254（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/asp/soft.lp#L244-L254）、`draco/asp/optimize.lp` 行1–3（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/asp/optimize.lp#L1-L3）、`draco/draco.py` 行15–43（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/draco.py#L15-L43）、同 行90–189（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/draco.py#L90-L189）、`draco/learn.py` 行1–36（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/learn.py#L1-L36）、`draco/schema.py` 行10–30（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/schema.py#L10-L30）、同 行92–142（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/draco/schema.py#L92-L142）、`docs/facts/task.md` 行1–16（https://github.com/cmudig/draco2/blob/18bcd8460347058a921c32ff72b1b3e48a4342dc/docs/facts/task.md#L1-L16）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - READMEは、効果的な可視化の設計知識を制約の集まりとして表すformal frameworkで、Answer Set Programming（ASP）で書かれClingoで解くこと、graphical perceptionの実験結果から推奨の重みを学習する方法を実装したことを書いている。
  - 制約のprogramはfileで分かれる。`define`（mark型、座標系、fieldの基本型、aggregate、channel、scale型、task、stackなどの値の領域）、`generate`（view・mark・encoding・scale・facetの候補を作る生成規則と、個数の上限）、`constraints`（領域外の値・属性の重複などを`violation`とし、violationを許さない）、`hard`（「文字列・真偽値の型に連続のscaleを使えない」「0以下を含むfieldにlogを使えない」「categorical scaleはcolor channelだけ」など、`violation`を導く規則）、`soft`（「aggregateしない方を好む」「値の種類が多いfieldにcategoricalの色を使わない方を好む」「value taskではaggregateしない方を好む」など、`preference`を導く規則）、`weights`（soft制約ごとの重み）、`optimize`（重み×preferenceの和を最小化）。
  - 個々の規則には`@hard(...)`・`@soft(...)`の名前と一文の説明が付いている。
  - Python側の`Draco`は、`check_spec`（hardまで含めて充足可能かを返す）、`complete_spec`（部分specをgenerate・soft・weights・optimizeまで含めて解き、最適な補完を返す）、`count_preferences`（各soft制約の該当数を数える）、`get_violations`（violationを禁止する制約を外して解き、hard制約の違反と、`constraints`で定義された領域外の値・属性の重複等の違反の両方を名前で列挙する。充足不能ならNoneを返す）を分けて提供する。
  - `learn.py`は、特徴ベクトルの行列から線形SVMを学習する関数である。学習用の行の約半分の符号をrandomに反転して正例・負例を作り、切片なしで学習する。特徴ベクトルの作り方（どのchartの組の差か）は、今回読んだ範囲（notebookは読んでいない）では確認していない。
  - schemaは、dataの各列から基本型、値の種類数、entropy、（数値なら）最小・最大・標準偏差・歪度、（文字列なら）最頻度・文字列長、（日時なら）期間を作り、制約の入力の事実にする。
  - taskは`value`（個々の点の値を読む・比べる）と`summary`（集約した性質を比べる）の2つで、fieldに`interesting`の印を付けてtaskに関係する列を示せる（docs/facts/task.md）。
- 解いている問題と前提：chartの種類の選択を、規則の木ではなく、違反してはならない規則と、重み付きの好みの組で表す。新しい規則の追加や重みの差し替えを、solverの外で行える。知識が制約として書ける前提である。
- 必要な入力：dataのschema（列ごとの型と統計量）、task、部分spec（固定したい部分）、重み。
- trade-off・失敗の仕方：
  - soft制約には、bin数や値の種類数など、具体的な境界値が規則の中に直接書かれている（値は持ち込まない）。境界の根拠は規則の一文の説明以上には書かれていない（読んだ範囲）。
  - `generate`の個数の上限が探索空間を決め、上限の外のchartは推奨されない。
  - 重みを実験から学習する場合、結果は学習に使った実験の範囲に依存する（README）。
- 反例・適用しない場合：Plot autoは、同じ問題を固定の分岐順序で解く（P34-O11）。Vega-Lite・EChartsは推奨を持たない。
- 互換・非互換：Dracoの`define`のchannel・scale型の語彙は、Vega-Liteのgrammar（P34-O01〜O03）に近い（`draco/renderer/altair`というdirectoryがあることだけを確認した。rendererの出力形式は未確認）。hardの「型とscaleの適合」はP34-O03の適合検査と同じ問題を扱う。
- 限界：規則の本文の値、重みの値、生成の上限は持ち込まない。

### P34-O13 代替textを自動生成する（mark単位の説明、軸・凡例の説明、chart全体の要約）
- 出典：vega-lite、`src/compile/mark/encode/aria.ts` 行9–100（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/mark/encode/aria.ts#L9-L100）。vega、`packages/vega-scenegraph/src/util/aria.js` 行1–167（https://github.com/vega/vega/blob/045d12611007cd65ae5ce68e4179d4ee2f150ef8/packages/vega-scenegraph/src/util/aria.js#L1-L167）。echarts、`src/visual/aria.ts` 行31–60（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/visual/aria.ts#L31-L60）、同 行138–277（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/visual/aria.ts#L138-L277）、`src/model/Global.ts` 行942–947（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/model/Global.ts#L942-L947）。plot、`src/style.js` 行139–153（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/style.js#L139-L153）、同 行332–337（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/style.js#L332-L337）、`src/plot.js` 行260–261（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/plot.js#L260-L261）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Vega-Liteのmarkの`description`は次の順で決まる。encodingの`description` channelがあればそれ。なければmark定義またはconfigの`description`。それも無く、configの`aria`が無効でなければ、tooltipと同じ「field名：値」の組（`_`で始まる内部の名前は除く）を連結した式を生成する。条件付きの項目は、条件が成り立つときだけ区切りを入れて連結する。mark定義かconfigで`aria`が無効なら何も出さない。
  - VegaのSVG出力では、itemの`aria`が無効なら`aria-hidden`を付ける。itemに`description`が無ければARIAの属性を出さない。ある場合は`aria-label`と、role（groupならgraphics-object、それ以外はgraphics-symbol）とroledescription（既定は「mark型 mark」）を出す。
  - 軸・凡例・titleは、説明が無くても自動で説明文を作る。軸は「X／Y-axis、title、scaleの種類（離散なら"discrete"）、domainの要約」、凡例は「凡例の型、title、対象のchannel（fill・strokeは"color"を付ける）、domainの要約」である。軸のtickやlabel、凡例の各項目などの部品は、親の説明で代表させて個別には属性を出さない。
  - EChartsは、optionに`aria`のobjectが書かれ`enabled`が未指定なら有効にする（themeやglobalの既定のmergeより前に判定する）。有効なら、DOMに`role="img"`を付ける。`label.description`があればそれを`aria-label`にする。無ければ、locale（言語ごとの文言の雛形）から、titleの有無・seriesの数・series名と種類・dataの名前と値を埋めて要約文を作る。表示するseriesの数とseriesごとのdataの数は設定された上限で打ち切り、dataが上限を超えたseriesでは一部だけであることを文に含める（数は持ち込まない）。DOMの無い環境（SSR）では付けない（TODO）。
  - Plotは、mark全体の`ariaLabel`・`ariaDescription`・`ariaHidden`を固定値として受け取り、要素ごとの`ariaLabel`はchannel（data値から計算）として受け取る。plot全体のSVGにも`aria-label`・`aria-description`を付ける。説明文の自動生成は読んだ範囲では見つからなかった。
- 解いている問題と前提：画像としてのchartを見られない利用者に、chartの構造（軸・凡例・mark）と値を言葉で渡す。説明文を利用者が書かなくても、encodingやscaleの情報から最低限の説明を作れる前提である。
- 必要な入力：encoding（field名と値の形式）、scaleの種類とdomain、title、locale（ECharts）、利用者の明示の説明。
- trade-off・失敗の仕方：自動の説明は構造の列挙で、chartが何を示すか（傾向や結論）は含まない。Vegaの軸・凡例の説明は英語の固定文で組み立てられている（`axisCaption`等）。EChartsはlocaleで文言を切り替えるが、打ち切りにより全dataは読み上げられない。markごとの説明は要素数だけ増える。
- 反例・適用しない場合：色に頼らない区別は、説明文ではなく模様（P34-O09）や別channel（shape等）で行う。
- 互換・非互換：P34-O09（decal）と組み合わさる（EChartsでは同じ`aria`の設定の下にある）。Vega-LiteのmarkのARIA属性は、P34-O01のcompileで生成され、VegaのP34-O13の出力経路で属性になる。
- 限界：文言・打ち切りの数は持ち込まない。WCAG等の外部標準への適合を、これらの実装が保証するかは読んだ範囲に書かれていない。

### P34-O14 zero baselineの既定を、markの形で決めるか（Vega-Lite・Plot auto）、軸の設定で決めるか（ECharts）
- 出典：vega-lite、`src/compile/scale/properties.ts` 行418–482（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/properties.ts#L418-L482）、同 行262–280（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/compile/scale/properties.ts#L262-L280）、`src/scale.ts` 行430–436（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/scale.ts#L430-L436）、同 行745–752（https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/scale.ts#L745-L752）。issue：vega/vega-lite#7154（https://github.com/vega/vega-lite/issues/7154、closed）、#8324（https://github.com/vega/vega-lite/issues/8324、closed）。echarts、`src/coord/scaleRawExtentInfo.ts` 行227–313（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/coord/scaleRawExtentInfo.ts#L227-L313）、`src/coord/axisModelCommonMixin.ts` 行31–35（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/coord/axisModelCommonMixin.ts#L31-L35）、`src/coord/axisCommonTypes.ts` 行226–235（https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/coord/axisCommonTypes.ts#L226-L235）。plot、`src/marks/auto.js` 行57–59（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/marks/auto.js#L57-L59）、同 行183–194（https://github.com/observablehq/plot/blob/535723d5e433727720d9b673c31622821bb03210/src/marks/auto.js#L183-L194）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Vega-Lite `zero`：利用者がdomainを明示した場合、連続のscaleなら、domainが配列で0をまたぐときだけ真、それ以外は偽にする（commentに「明示したdomainにzeroを足すと予想外になる」）。明示が無い場合、quantitativeのsize（離散化しないscale）は真。offset channelは範囲を持つoffset markのときだけ真。binしていない位置のscaleでは、bar・area・line・trailのうち向きに対して値の軸でない側は偽、bar・areaで第2の範囲channelが無ければ真、それ以外はconfigの`scale.zero`に従う。その他のchannelは偽。
  - Vega-Lite `nice`：binあり、domainの明示、domainMin／domainMaxの明示、time・utcのscaleでは付けず、それ以外はx・yだけに付ける。
  - `config.scale.zero`のdocは、非範囲のbar・areaのx・y scaleとsize scaleを除く連続scaleの既定と書いている。
  - #7154は、zeroを含めるかをmarkの種類で変えるか、測定の尺度（比率か間隔か）で決めるべきかを議論した。議論では、zeroを含める既定なら、その結果の軸が不適切（変化がほとんど見えない等）になったときに一目で分かるのに対し、0でない原点が誤解を招く場合は気づきにくく変更されにくい、だから含める既定の方が安全だという意見が出て、closeされた。#8324は、mark型ごとの既定をconfigで変えられるようにする提案で、closeされている。
  - EChartsは、value軸の`scale`が偽（未指定を含む）なら「zeroを含める必要がある」とする。`min`・`max`の明示（`dataMin`・`dataMax`、関数を含む）はその端を固定する。min・maxが未指定の端は、data範囲を`boundaryGap`で広げた値にする（行282–291、https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/coord/scaleRawExtentInfo.ts#L282-L291。min・maxを明示した端には`boundaryGap`を使わない）。zeroを含める処理は区間scaleに限り（行301、https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/coord/scaleRawExtentInfo.ts#L301-L301のcommentはLogScale・TimeScale・OrdinalScaleを対象外と書く）、こうして決めた範囲の両端がともに厳密に正で下端が固定されていなければ下端を0に、ともに厳密に負で上端が固定されていなければ上端を0にする（行304–312、https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/coord/scaleRawExtentInfo.ts#L304-L312）。
  - Plot `autoSpec`は、まずx・yのreducerが加算型（distinct、count、sum、proportion）ならzeroを真にする（行57–59）。それでもzeroが未定なら、選ばれたmarkの実装がzeroの基線を持つ形（barX・areaX・rectX・ruleY等）で、binのtransformを使わない場合に真にする（P34-O11）。
- 解いている問題と前提：棒や面のように長さ・面積で量を表すmarkでは、基線が0でないと比が誤って読まれる。点や線では、0を含めると変化が見えにくくなる。どちらを既定にするかの判断を、markの形・測定の尺度・利用者の設定のどこに置くかが、repoで違う。
- 必要な入力：mark型と向き、channel、bin・aggregateの有無、明示のdomain・min・max、測定の尺度（Vega-Liteでは型として区別しないため、利用者が`zero`で表す。P34-O02）。
- trade-off・失敗の仕方：Vega-Liteの#7154では、markで決めることへの反論として「温度の面グラフ」（0の原点がふさわしくない例）と「件数の線グラフ」（0の原点がふさわしい例）が挙げられた。尺度で決める案は、Vega-Liteの`quantitative`が比率尺度と間隔尺度を区別しない（P34-O02）ため、そのままでは型から決められない（これは本書の推論で、issueの記述ではない）。EChartsは軸ごとの一つのflagで、chartの種類と独立に決まるため、棒chartでも`scale: true`にすれば基線が0でなくなる。
- 反例・適用しない場合：Vega-Liteは`zero`の文書のnoteで、log・time・utcのscaleは`zero`を支持しないと書く（`src/scale.ts` 行750、https://github.com/vega/vega-lite/blob/213faf313cd2e8b1f94b61d24e90cac2e77b576e/src/scale.ts#L750-L750）。EChartsは、zeroを含める処理がLogScale・TimeScale・OrdinalScaleに適用されないとcommentに書く（`scaleRawExtentInfo.ts` 行301、https://github.com/apache/echarts/blob/34f4d927eafe251f26f63afd3aeefa30f2feba30/src/coord/scaleRawExtentInfo.ts#L301-L301）。ordinalを挙げているのはEChartsだけである。
- 互換・非互換：P34-O03（scale型）の結果がzeroの適用可否を決める。P34-O11（Plot auto）は、markの選択とzeroの決定を同じ関数で行う。
- 限界：boundaryGap等の比率・既定値は持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| chartの記述の単位 | Vega-Lite：data・mark・encodingの宣言をcompileする（O01）。Plot：mark・channel・scaleを関数で組む（O04） | ECharts：series type（chartの種類）を先に選び、datasetの列は既定で割り当てる（O05）。連続値の写像はvisualMapで別に宣言する（O10） | grammarを中心にするか、chartの種類を中心にするか |
| 測定の型 | Vega-Lite：fieldごとに宣言し、省略時はspecの構造から補う。data値は見ない（O02） | Plot：最初の非null値から推論（O04）。ECharts：宣言があれば従い、なければ先頭の数件から推測（O04）。Draco：schemaから基本型と統計量を作る（O12） | 同じ記述で同じ出力を保証するか、記述を短くするか |
| 既定のscale型 | Vega-Lite：型×channel×markの表。不適合な明示は警告して既定へ（O03） | Plot：channelが要求する型と食い違えばerror。schemeの用途も型推論に使う（O04、O08） | 不適合を警告で続けるか、errorで止めるか |
| 色の既定 | Vega-Lite：役割の名前（category・ordinal・ramp・heatmap・diverging）を返し、Vegaがconfigでschemeへ解決（O06） | Plot：型ごとにscheme名の既定を直接持つ。明示のordinalと暗黙のordinalで分ける（O08）。ECharts：名前→paletteの記憶表で巡回割当て（O09） | themeで差し替える層を持つか。分類の安定性をscaleのdomainで保つか、名前の記憶で保つか |
| schemeの形と用途 | Vega：離散の配列と連続の補間関数を登録し、scale型に合わせて量子化・補間（O07） | Plot：用途（分類・発散・順序・循環）別の表と、色数による手選びの組／補間の切替え（O08） | schemeの用途をscale型と独立に扱うか、用途で型を導くか |
| 発散の中点 | Vega-Lite：`domainMid`を利用者が明示したときだけ発散rangeを選ぶ。scheme名からは推論しない（O06） | Plot：`pivot`の指定か、発散系のscheme名の指定からdivergingを推論する。diverging scaleは既定のpivotを持ち、symmetricでdomainを中点から対称に広げる（O04、O08） | 中点を明示させるか、scheme名と既定のpivotから導くか |
| zero baseline | Vega-Lite：markの形と向きで決め、残りはconfig（O14）。Plot auto：選んだmarkの基線で決める（O11、O14） | ECharts：軸の`scale` flagで決め、区間scaleで同符号の場合だけ端を0へ（O14） | 長さ・面積で量を表すmarkを特別扱いするか |
| chartの推奨 | Plot auto：順序付きの分岐（決定木）。結果をspecとして返す（O11） | Draco：hard／soft制約と重みの最適化。taskを入力に取り、違反の列挙もできる（O12） | 規則を順序で表すか、重みで表すか。taskを入力にするか |
| 色に頼らない表現・代替text | ECharts：色と同じ割当ての仕組みで模様（既定は無効）。localeの雛形で要約文（O09、O13） | Vega／Vega-Lite：markの説明をtooltipの組から生成し、軸・凡例の説明を自動生成（O13）。Plot：利用者が書くaria属性（O13） | 説明を要約文1つにするか、要素ごとにするか。言語の切替えを持つか |

## 見つからなかったこと・gap
- 色覚の多様性（色覚特性）を前提にしたschemeの検査や、色の区別しやすさの機械検査は、5 repoとも見つからなかった（`colorblind`・`color blind`・`deuteran`の検索で、test・json・lockを除き0件）。schemeの選び方の根拠は、Vega-Liteの文書が「perceptually-motivated」なschemeの出典を挙げる程度である。
- chartの種類の推奨について、ADR形式の設計記録は、どのrepoにも見当たらなかった。判断の根拠は、code comment、issue（Vega-Lite #7154、Plot #1763）、Dracoの規則の一文の説明、READMEにある。
- Vega-Liteの文書（scale.md 124）と実装（`defaultRange`）で、heatmapの対象mark（geoshapeの有無）と発散rangeの条件の記述が揃っていない（O06）。
- Dracoで、学習用の特徴ベクトルをどう作るか（どの組の差を取るか）は、`learn.py`だけからは確認できなかった（`docs/applications/draco_learn.ipynb`は読んでいない）。
- 代替textの自動生成が、chartの示す傾向や結論（「増加している」等）を言葉にする仕組みは、どのrepoにも見つからなかった。構造と値の列挙に限られる。
- Plotの`symbol`（形）channelによる冗長な符号化、Vega-Liteの`strokeDash`の既定は、存在を見ただけで、色との組合せの既定は読んでいない。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`し、固定commitをcheckout（`core.hooksPath`を無効化）。読むだけで、build・test・script・hook・package managerは実行していない。GitHub APIでSPDXとarchivedを取得し、issueを`gh`で読んだ。
- vega-lite：`src/spec/unit.ts`（15–45）、`src/type.ts`（見出し・49）、`src/channeldef.ts`（1000–1070、1195–1225）、`src/compile/compile.ts`（40–120）、`src/compile/split.ts`（1–40、127–153）、`src/compile/scale/type.ts`（全体）、`src/compile/scale/range.ts`（110–380）、`src/compile/scale/properties.ts`（255–282、410–482）、`src/scale.ts`（428–436、744–752）、`src/compile/mark/encode/aria.ts`（全体）、`site/docs/encoding/type.md`（該当行）、`site/docs/encoding/scale.md`（124–192、469）。issue #7154、#8324。読んでいないもの：`src/compile/axis/`、`src/compile/legend/`、`src/compositemark/`、`src/normalize/`の本体、`src/config.ts`の既定値の本体。
- vega：`packages/vega-scale/src/scales.js`（1–166）、`schemes.js`（全体）、`packages/vega-encode/src/Scale.js`（255–346）、`packages/vega-parser/src/parsers/scale.js`（236–277）、`packages/vega-parser/src/config.js`（213–240）、`packages/vega-scenegraph/src/util/aria.js`（全体）。読んでいないもの：`vega-scale/src/palettes.js`（色の値の塊のため）、`caption.js`（domainの要約文の本体）、`vega-view`。
- plot：`src/scales.js`（394–474）、`src/options.js`（139–158、472–503）、`src/channel.js`（1–60）、`src/scales/schemes.js`（75–287）、`src/scales/ordinal.js`（13–60）、`src/scales/diverging.js`（20–80）、`src/scales/quantitative.js`（scheme関連の行のgrepのみ）、`src/marks/auto.js`（1–300）、`src/style.js`（136–156、330–338）、`src/plot.js`（255–263）。issue #1763（#1252、#1422、#1631は題名のみ）。読んでいないもの：`src/legends/`、`src/marks/axis.js`の本体、`src/symbol.js`、`src/interactions/`。
- echarts：`src/visual/aria.ts`（全体）、`src/model/mixin/palette.ts`（全体）、`src/model/Global.ts`（936–955）、`src/component/visualMap/VisualMapModel.ts`（54–130、480–530）、`typeDefaulter.ts`（全体）、`src/data/helper/sourceHelper.ts`（76–190、336–420）、`src/coord/scaleRawExtentInfo.ts`（95–160、225–330）、`src/coord/axisModelCommonMixin.ts`（全体）、`src/coord/axisCommonTypes.ts`（223–235）。issue #15513（#13263、#14350、#18118、#21544は題名のみ）。読んでいないもの：`src/i18n/`（ariaの文言の雛形）、`src/chart/`の各series、`src/theme/`、`ContinuousModel.ts`・`PiecewiseModel.ts`。
- draco2：`README.md`（20–30）、`draco/asp/define.lp`（全体）、`generate.lp`（全体）、`constraints.lp`（全体）、`optimize.lp`（全体）、`hard.lp`（1–80、305–315の見出し）、`soft.lp`（1–40、180–190、240–258、588–600、色関連の見出しのgrep）、`weights.lp`（冒頭）、`draco/draco.py`（15–45、85–189）、`learn.py`（全体）、`schema.py`（10–30、92–142）、`docs/facts/task.md`（全体）。読んでいないもの：`draco/renderer/`（Vega-Liteへの出力。directoryの存在のみ）、`docs/applications/*.ipynb`、`helpers.lp`、`weights.lp`の本体の値。
- 検索した語：`defaultType`、`scaleType`、`zero`、`nice`、`scheme`、`range`、`diverging`、`pivot`、`categorical`、`aria`、`description`、`decal`、`palette`、`visualMap`、`guessOrdinal`、`colorblind`／`color blind`／`deuteran`（5 repoとも0件）。GitHub issue検索：「zero scale default line」（vega-lite）、「auto mark」（plot）、「aria decal」（echarts）。
- 選ばなかった候補：d3/d3-scale-chromatic（schemeの値と補間の実体で、構造としてはVega・Plotの登録表で足りると判断した）、vega/compassql・vega/voyager（Vega-Liteのcommentに名前があるが、Dracoで推奨の構造を読んだため読んでいない）。P14で読んだgrafana/grafanaは重ねていない。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。Dracoのsoft制約と重みは、研究の実験結果に由来すると書かれている（README）が、実験そのものは読んでいない。codeに書かれた規則と、その規則の根拠となった研究を、由来としてどう区別するかは未決。Vega-Liteのように文書と実装が食い違う場合の由来の区別も未決（README後続(a)と同じ）。
- scope：観察はchartの記述・既定の決定・色の割当て・代替textに限っている。dashboard（P14）、typography（P06）、画面のa11y（D10）との境目、D09とD04（frontend実装）のどちらを主な領域にするかは未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。chartの読みやすさの一部は人の意味の判断であり、Dracoのような重みの学習は特定の実験の範囲に依存する。どれをLABOで評価でき、どれが人の判断に残るかは未決。
- 版：固定commit SHAで版を表す。Vega-Liteのtime channel（TODO）、Plot autoの単調性（#1763、open）、EChartsのSSRでのaria（TODO）は、上流で変わりうる。再観察の時期は未決。
- 状態：全観察（P34-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
