# P25 Frontendのbrowser対応範囲と段階的な機能縮退の観察（D04 Frontend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（対応版の数字、利用率の割合、期間、件数上限、既定値等）は持ち込まない。技術選定・採用推奨ではない。

埋めようとしたgap：[D04 Frontend](../../brain-domain-material-inventory-20261004/materials/D04-frontend.md)§4の「responsive・browser対応の設計」（旧台帳で`todo`、D04-M07）。[P22](P22-frontend-performance-responsive.md)はresponsiveと性能を扱い、§gapで「browser対応（対応browserの範囲の決め方、polyfill、段階的な機能縮退）の設計規則は、読んだ範囲では見つからなかった」と記録していた。本書はその残りのうち、対応範囲の宣言の仕方、宣言をbuildとpolyfillの選択へ流す仕組み、機能の検出と段階的な縮退（JavaScriptが無い・失敗した場合を含む）、対応範囲の見直しの記録を扱う。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| browserslist/browserslist | https://github.com/browserslist/browserslist | 8219dd79df0315feaabba302077a66e236822a3a（default branch: main） | MIT | false | 2026-10-05 | 対応範囲を「query」で宣言し、複数のbuild toolで共有する仕組みの本体。queryの種類、集合演算、設定fileの探索、環境別の節、data鮮度の警告を行単位で読める |
| web-platform-dx/web-features | https://github.com/web-platform-dx/web-features | 8606657a71535d688f5473579712717fe9442c0f（main） | Apache-2.0 | false | 2026-10-05 | 機能単位の「Baseline」状態の定義文書（目標・非目標・状態の定義・core browser set）と、状態を計算するcode（`compute-baseline`）が同じrepoにあり、定義と実装を対照できる |
| babel/babel | https://github.com/babel/babel | 4f4ef5d44f02f35a8aa2c418644c6dece52b8366（main） | MIT | false | 2026-10-05 | `@babel/helper-compilation-targets`と`@babel/preset-env`で、宣言された対応範囲を「必要な構文変換とpolyfillの集合」へ解決する経路を読める |
| zloirock/core-js | https://github.com/zloirock/core-js | d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16（master） | MIT | false | 2026-10-05 | polyfillの本体。build時の互換data（`core-js-compat`）による選択と、実行時の機能検出（`forced`、`sham`）の2段を、同じrepoで読める |
| alphagov/govuk-frontend | https://github.com/alphagov/govuk-frontend | 283cc58ead97f3e3379199976709713914e00b05（main） | MIT | false | 2026-10-05 | browserの等級（grade）と支援水準を書いた設計文書、JavaScriptが無い・未対応の場合の縮退（`js-enabled`／`govuk-frontend-supported`）、対応範囲を狭めたときのCHANGELOGの記録を、文書とcodeの両方で読める |

（govuk-frontendは、第1弾P07・第3弾P23で読んだalphagov/govuk-design-systemとは別のrepositoryである。）

## 観察

### P25-O01 対応範囲を1つの宣言にして、複数のbuild toolが同じ宣言を読む（設定の置き場所と環境別の節）
- 出典：browserslist、`README.md` 行6–38（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L6-L38）、行169–180（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L169-L180）、行362–412（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L362-L412）、行484–522（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L484-L522）、`node.js` 行323–334（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/node.js#L323-L334）。govuk-frontend、`packages/govuk-frontend/.browserslistrc` 行1–19（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/.browserslistrc#L1-L19）、`packages/govuk-frontend/babel.config.js` 行6–16、41–56（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/babel.config.js#L6-L56）、`packages/govuk-frontend/postcss.config.mjs` 行13–39（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/postcss.config.mjs#L13-L39）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - browserslistは「target browsersとNode.jsの版を、異なるfront-end tool間で共有する設定」と自らを定義する（README 6–7）。CSSの接頭辞付与、構文変換、lint等のtoolが同じ宣言を自動で探す。
  - READMEは宣言の読込み元として、`.browserslistrc`、`package.json`の`browserslist` key、`browserslist` file、環境変数`BROWSERSLIST`を列挙し、どれからも有効な結果が得られなければ既定のqueryを使う、と書く（README 171–180）。この列挙は優先順位を定めたものではない。実装の`loadConfig`は、環境変数`BROWSERSLIST`を最初に見て、次に明示の設定file（`opts.config`または環境変数`BROWSERSLIST_CONFIG`）、次に`opts.path`からの設定fileの探索、の順で読む（node.js 323–334）。設定fileは処理対象fileのある階層から親へ探す（README 408–410）。Babel側の解決順（P25-O07）も、環境変数`BROWSERSLIST`を設定fileより先に見る点で同じである。
  - 1つの設定の中に環境別の節（`[production]`等）を置け、`BROWSERSLIST_ENV`または`NODE_ENV`で選ぶ。どちらも無ければ`production`節を探し、それも無ければ既定を使う（README 484–489）。
  - govuk-frontendは、1つの`.browserslistrc`に`[javascripts]`・`[stylesheets]`・`[node]`の節を置く。Babelの設定はrollup経由のbrowser向けbuildかどうかで`browserslistEnv`を`javascripts`と`node`に切り替え（babel.config.js 7–14）、PostCSSの設定はautoprefixerとcssnanoに`env: 'stylesheets'`を渡す（postcss.config.mjs 16、33–38）。JavaScriptとCSSで対応範囲を別に宣言し、同じfileで管理している。
- 解いている問題と前提：対応範囲をtoolごとに書くと食い違う。1つの宣言を全toolが読めば、範囲の変更が1箇所で済む。全toolがbrowserslistを読む前提である。
- 必要な入力：対応範囲のquery、どのbuild成果物にどの節を当てるかの対応（govuk-frontendではbuildの呼出し元で判定）。
- trade-off・失敗の仕方：設定は階層を遡って探されるため、意図しない親の設定が効く余地がある。宣言が無い場合は黙って既定のqueryへ落ちる（README 179–180）ので、「宣言していない」ことが範囲の決定として残らない。JavaScriptとCSSで範囲を分けると、CSSは動くがJavaScriptは動かないbrowserが生まれ、その間の振る舞いを別に設計する必要がある（P25-O12、O13）。
- 反例・適用しない場合：buildを持たない（素のHTML・CSS・JavaScriptを配る）場合は、宣言を読むtoolが無い。browserslistを読まないtoolを使う場合は、宣言を共有できない。
- 互換・非互換：P25-O02・O03（宣言の書き方）、P25-O07（Babel側の解決順）と組み合わさる。P25-O11（govuk-frontendの等級）とは、等級の文書とqueryが別に書かれている点で関係する（等級とqueryの対応を機械で照合する仕組みは見当たらなかった）。
- 限界：govuk-frontendの`.browserslistrc`にある具体的なqueryと版は持ち込まない。このrepoで成立していることは、HELIXで成立することを意味しない。

### P25-O02 queryを集合演算（和・積・差）で合成し、左から順に評価する
- 出典：browserslist、`README.md` 行182–205（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L182-L205）、`index.js` 行346–379（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/index.js#L346-L379）、行293–296（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L293-L296）、`grammar.w3c-ebnf`（全131行、https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/grammar.w3c-ebnf#L1-L131）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `or`（または`,`）は和、`and`は積、`not`は差として扱う（README 184–203の表）。
  - `resolve`は解析したqueryを左から`reduce`する。先頭が`not`なら例外を投げる（index.js 348–355）。`or`で`not`でない節は結果に追加し、それ以外（`and`、`not`）は、節の選択結果を集合にして、`not`なら含まれないもの、`and`なら含まれるものだけを残す（同 366–377）。
  - queryの構文はEBNFの文法fileとして別に公開されている（README 293–296）。
- 解いている問題と前提：対応範囲は「利用の多いもの」と「新しい版」と「保守されているもの」のような複数の条件の組合せで決まることが多い。条件を集合として合成できれば、版の列挙をせずに範囲を表せる。
- 必要な入力：各条件のquery、合成の順序。
- trade-off・失敗の仕方：READMEは、`not`の前に`or`を書いても`and`として解決される（API実装の特性）と注記しており（README 195–197。`not`の節は`compose`に関わらず差として扱われる。index.js 366–377）、表記と評価の対応に癖がある。`not`を先頭に書けない。評価は左から順で優先順位を持たないため、並べ順で結果が変わる。
- 反例・適用しない場合：対応browserが1種類に限られる場合（README 160–162はkiosk用途を例に挙げる）は、合成は要らない。
- 互換・非互換：P25-O03（個々のqueryの種類）の上に乗る。P25-O07でBabelが受け取るのは、この評価を終えたbrowserと版の一覧である。
- 限界：READMEの例にある割合・版は持ち込まない。

### P25-O03 対応範囲を決める軸を複数持つ：利用統計、版の新しさ、時期、機能の対応、Baseline、保守終了
- 出典：browserslist、`README.md` 行208–280（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L208-L280）、行143–167（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L143-L167）、行524–526（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L524-L526）、`index.js` 行837–889（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/index.js#L837-L889）、行1213–1227（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/index.js#L1213-L1227）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - queryの種類として、利用統計による選択（世界全体、国・地域、自前の統計、共有configの統計）、利用率の累計による選択（`cover`）、Baselineによる選択、各browserの最新版からの版数、保守終了（`dead`）、Node.js、版の直接指定、他packageの設定の継承（`extends`）、特定の機能に対応するbrowser（`fully supports`／`partially supports`）、時期（`since`、`last N years`）、未公開版を持つ（README 212–280）。
  - Baselineのqueryは、`baseline-browser-mapping`へ年・可用性（newly／widely）・日付・downstream browserの有無を渡し、返った版の一覧を通常のqueryとして`resolve`し直す（index.js 848–888）。`newly available`に日付を付けると、`widely available on`を使うよう促す例外を投げる（同 850–854）。
  - `dead`は、保守終了とみなすbrowserと版の一覧をcodeに直接持ち、それを`resolve`する（index.js 1213–1227）。
  - READMEの「Best Practices」は、版数だけのqueryは利用の多い古い版を落とし、利用率だけのqueryは長期的に人気のbrowserをさらに人気にして寡占と停滞を招く、と書き、両方を組み合わせる理由を述べる。知らないbrowserを理由なく外さないよう求める（README 143–167）。
  - 自前の利用統計（実traffic）で選ぶことも、世界の統計と組み合わせることもできる（README 524–526）。
- 解いている問題と前提：対応範囲の根拠は、利用者の実態（統計）、技術の成熟（機能の対応、Baseline）、保守の状態（`dead`）など、性質の異なる軸から来る。軸ごとにqueryを持てば、根拠をqueryの形で残せる。
- 必要な入力：使う軸の選択、利用統計（世界・地域・自前）、機能の識別子（Can I Useの機能名）、外部の互換data（caniuse-lite、baseline-browser-mapping）。
- trade-off・失敗の仕方：利用統計・`dead`・Baselineはいずれも外部dataや日付に依存し、同じqueryでも時間とdataの更新で結果が変わる（P25-O04）。`dead`の一覧はcodeに直書きされ、更新はrelease依存である。Baselineは`baseline-browser-mapping`の結果に委ねるため、Baselineの定義（P25-O05）の変更がqueryの結果に波及する。
- 反例・適用しない場合：利用統計を持たない新規の製品は「自前の統計」の軸を使えない（web-featuresのBaseline文書も同じ前提を挙げる。P25-O05）。
- 互換・非互換：P25-O05（Baselineの定義）を軸の1つとして取り込む。P25-O11（govuk-frontendの等級）は、軸の代わりに等級と支援水準で範囲を表す別の書き方である。
- 限界：READMEにある割合、期間、版、既定queryの値は持ち込まない。

### P25-O04 宣言の根拠になる互換dataの鮮度を警告し、共有設定の取込みを名前で制限する
- 出典：browserslist、`node.js` 行197–218（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/node.js#L197-L218）、行478–502（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/node.js#L478-L502）、行24–46（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/node.js#L24-L46）、`README.md` 行96–101（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L96-L101）、行414–457（https://github.com/browserslist/browserslist/blob/8219dd79df0315feaabba302077a66e236822a3a/README.md#L414-L457）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `oldDataWarning`は、互換dataに含まれる最も新しいbrowser releaseの日付から経過月数を数え、一定以上なら、dataが古いことと更新commandをconsoleに警告する（node.js 478–502）。processの中で1回だけ判定し、環境変数`BROWSERSLIST_IGNORE_OLD_DATA`で止められる（同 479–481）。
  - 互換dataの更新はCLIとGitHub Actionで行い、Actionは更新のpull requestを提案する（README 96–101）。
  - 他packageの設定を`extends`で取り込むとき、名前が`browserslist-config-`接頭辞（またはscope付きの同等の形）であることを求め、`\`、`.`、`node_modules`を含む名前を拒否する（node.js 24–46）。利用者からqueryを受け取らない場合は、環境変数で検査を外せる（README 425–435）。
  - 共有設定には環境別のqueryや利用統计fileを含められる（README 447–467）。
- 解いている問題と前提：queryは版を列挙しないため、同じ宣言でも互換dataが古いと「新しい版」が範囲に入らない。鮮度を警告すれば、宣言を変えずに範囲が古くなることを知らせられる。組織の対応範囲を共有packageにすれば、製品間で宣言を揃えられる。
- 必要な入力：互換dataのrelease日付、経過を測る基準時刻（実行時の時計）、共有設定のpackage名。
- trade-off・失敗の仕方：警告はconsole出力だけで、buildを止めない。環境変数で黙らせられる。dataの更新は依存packageの更新であり、更新したことが対応範囲の変更として記録されるとは限らない（変更の記録はlock fileの差分に埋もれる）。`extends`の名前検査を外すと任意のpackageを読み込む。
- 反例・適用しない場合：版を直接列挙する宣言（P25-O03の版指定）だけを使うなら、dataの鮮度は範囲に影響しにくい（ただし版の存在検査にはdataを使う）。
- 互換・非互換：P25-O03の時間依存性への対処である。P25-O05のBaselineは、計算の「現在」をdataのtimestampに固定しており（P25-O05）、時計の扱いが異なる。
- 限界：警告の閾値（月数）は持ち込まない。

### P25-O05 機能単位の「広く使える」状態を、定義文書と計算codeで2段（low／high）に定め、目標と非目標を明記する
- 出典：web-features、`docs/baseline.md` 行22–86（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/docs/baseline.md#L22-L86）、行88–150（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/docs/baseline.md#L88-L150）、行152–163（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/docs/baseline.md#L152-L163）、`packages/compute-baseline/src/baseline/index.ts` 行95–135（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/packages/compute-baseline/src/baseline/index.ts#L95-L135）、行205–284（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/packages/compute-baseline/src/baseline/index.ts#L205-L284）。issue #2133（https://github.com/web-platform-dx/web-features/issues/2133、open、取得日時点）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 文書は、Baselineを「web開発者のための道しるべ」とし、6つの目標（開発者向け、webの変化に合わせて変わる、複数実装による相互運用、利用の広さ、継続的な対応、文書と仕様による裏付け）を挙げる（baseline.md 22–52）。
  - 非目標として、全利用者で使える機能の特定、支援技術での対応、web以外の環境、polyfillや段階的な機能強化に向く機能の特定、site固有の分析の代替、他の状態の排除を挙げる（同 56–86）。polyfillについては、Baselineの機能はpolyfillなしで動くべきで、開発者はBaselineを「polyfillの配布をいつやめるか」の判断に使える、と書く（同 74–77）。
  - 状態は2段で、low（相互運用）は、core browser setの現行の安定版がすべて対応し（MDNの互換dataに基づき、部分実装を除く）、仕様に非推奨の文言がなく、編集上の上書きがないこと。lowの日付（keystone date）は、最後にbrowserが対応したreleaseの日付である（同 100–115）。high（広い対応）は、keystone dateから一定期間が過ぎ、かつ長期保守版のrelease日以前であること（同 120–128）。core browser setは文書に列挙され、新しいbrowserを加えたときの状態の変化は未定義と明記される（同 130–146、issue #2133）。
  - 文書は所有者（owners group）と、定義の見直し期日を持つ（同 88–93）。
  - 計算codeでは、`computeBaseline`が「現在」の代わりに互換dataの`__meta.timestamp`を使う（index.ts 102–108）。`findKeystoneDate`は、どれかの互換keyで初回対応のreleaseが無いか日付が無ければ`null`を返す（同 242–252）。日付の範囲付き（「以前」）の扱いを保つ（同 253–283）。`keystoneDateToStatus`は、日付が無いか非推奨（discouraged）なら`false`、そうでなければ`low`とし、high相当の日付が基準日以前なら`high`にする（同 205–235）。
- 解いている問題と前提：利用者のbrowserを直接調べられない開発者（新規の製品、library作者）が、機能ごとに「使ってよいか」を判断する近道がない（baseline.md 13–18）。複数の主要browserの対応と時間の経過から、全体の状態を1つの語で示す。
- 必要な入力：機能ごとの互換key、browser互換data（release日付と初回対応版）、core browser set、仕様の非推奨の情報、編集上の上書き。
- trade-off・失敗の仕方：core browser setに入らないbrowserの対応は状態に反映されない。非目標に挙げるとおり、全利用者で使えることは保証しない。core browser setを変えたときの扱いは未定義のまま（issue open）。「現在」をdataのtimestampにするため、dataが古ければ状態も古いまま（P25-O04と同じ型の問題を、時計の固定で再現可能性に置き換えている）。
- 反例・適用しない場合：利用統計を持ち、特定の古いbrowserに対応する必要がある製品は、Baselineではなくそのbrowserの個別の制約を調べる必要がある、と文書自身が書く（baseline.md 60–63）。
- 互換・非互換：P25-O03でbrowserslistのqueryの1軸として使われる。P25-O06（機能の定義とdataの形）が入力になる。P25-O11（govuk-frontendの等級）は、範囲をbrowserの等級で表し、機能の採用を「等級A・Bの全browserが対応したら」と決める（P25-O14）。Baselineは機能から、govuk-frontendはbrowserから範囲を見る。
- 限界：期間、日付、browser名の具体は持ち込まない。定義と計算codeの一致は確認できていない。食い違いが1件ある。定義文書はhighの条件に、keystone dateからの期間に加えて長期保守版（Firefox ESR）のrelease日を含める（baseline.md 124–126）。一方、計算codeの`keystoneDateToStatus`は、`toHighDate`（keystone dateに定数の期間を足すだけ）の結果と基準日を比べるだけである（index.ts 228–232、`packages/compute-baseline/src/baseline/date-utils.ts` 行4–9（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/packages/compute-baseline/src/baseline/date-utils.ts#L4-L9））。読んだ範囲（`index.ts`と`date-utils.ts`）ではESRの条件は見当たらなかった。build script等、他の箇所でESRの条件を加えているかは読んでいない。

### P25-O06 機能の定義を「人が書くsource」と「生成された状態」に分け、状態の上書きと非推奨を根拠付きで持つ
- 出典：web-features、`features/container-queries.yml` 行1–22（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/features/container-queries.yml#L1-L22）、`features/container-queries.yml.dist` 行1–16（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/features/container-queries.yml.dist#L1-L16）、`docs/guidelines.md` 行388–425（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/docs/guidelines.md#L388-L425）、行427–478（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/docs/guidelines.md#L427-L478）、行196–197（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/docs/guidelines.md#L196-L197）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 機能のsource（`.yml`）は、名前、説明、仕様のURL、group、Can I Useの識別子、状態の計算元、互換keyの一覧を持つ（container-queries.yml 1–22）。生成物（`.yml.dist`）は「手で編集しない」と先頭に書き、計算された状態（段、日付、browserごとの初回対応版）と、互換keyごとの状態を持つ（.dist 1–16）。
  - 状態の上書きは、優先順に3つある。互換keyを`core`（状態の計算に使う）・`modifier`（coreと同じ段であることだけを検査）・`spare`（状態に影響しない）に分ける方法、状態をそのまま書く方法、計算元のkeyを選ぶ方法（非推奨で、新規に書かない）（guidelines.md 427–478）。
  - 非推奨（discouraged）は、仕様が使用中止を求める、後継なしに仕様から削除された、仕様編集者が削除を意図している、全実装者が警告や撤去の意向を示した、のいずれかで付ける。単に古い・不人気・議論がある・bugがある・未実装である、では付けない。付けるときは根拠のURL（`according_to`）を必須とし、代替機能を任意で挙げる（guidelines.md 388–425）。非推奨は状態の計算で`false`になる（P25-O05のindex.ts 214–220）。
  - 説明文には対応状況や標準化の状態を書かない（すぐ古くなるため）（guidelines.md 196–197）。
- 解いている問題と前提：状態は互換dataから機械で決めたいが、互換keyの選び方次第で状態が変わる。人の判断が入る箇所を「keyの分類」「明示の上書き」「非推奨の根拠」に限り、それ以外を生成にする。
- 必要な入力：互換keyの一覧と分類、非推奨の根拠となる一次資料、上書きの理由。
- trade-off・失敗の仕方：上書きを書くと、互換dataの更新が状態に反映されなくなる（状態の直書きは互換keyを無視する、guidelines.md 452–456）。計算元を選ぶ方法は非推奨だが既存の定義に残りうる（読んだ範囲では、container-queries.ymlが`compute_from`を使っている。行8–9）。
- 反例・適用しない場合：状態を外部dataから計算しない（人が対応表を書く）運用では、source／生成物の分離は要らない。
- 互換・非互換：P25-O05の入力である。P25-O10のcore-jsの互換data（`data.mjs`）は、機能ごとの最低対応版を人が書くsourceとして持ち、web-featuresとは由来が異なる。
- 限界：生成物にある版と日付の値は持ち込まない。生成scriptは読んでいない（`scripts/dist.ts`の存在のみ確認）。

### P25-O07 build toolが対応範囲を解決する順序：明示の指定、環境変数、設定file、既定（とES module対応による絞込み）
- 出典：babel、`packages/babel-helper-compilation-targets/src/index.ts` 行202–314（https://github.com/babel/babel/blob/4f4ef5d44f02f35a8aa2c418644c6dece52b8366/packages/babel-helper-compilation-targets/src/index.ts#L202-L314）、行67–110（https://github.com/babel/babel/blob/4f4ef5d44f02f35a8aa2c418644c6dece52b8366/packages/babel-helper-compilation-targets/src/index.ts#L67-L110）、行169–175（https://github.com/babel/babel/blob/4f4ef5d44f02f35a8aa2c418644c6dece52b8366/packages/babel-helper-compilation-targets/src/index.ts#L169-L175）、`packages/babel-preset-env/src/index.ts` 行156–178、220–241（https://github.com/babel/babel/blob/4f4ef5d44f02f35a8aa2c418644c6dece52b8366/packages/babel-preset-env/src/index.ts#L156-L241）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `getTargets`は、`browsers`の指定も他のtargetも無く、設定の無視（`ignoreBrowserslistConfig`）も無いときに限り設定を探す（index.ts 214–217）。探す順は、環境変数`BROWSERSLIST`、明示の`configFile`、環境変数`BROWSERSLIST_CONFIG`、設定fileの探索で、見つかればhookで通知する。どれも無ければbrowserslistの既定（`defaults`）を使う（同 219–240）。
  - `esmodules`の指定があり`browsers`が空なら、ES moduleに対応するbrowserの集合をqueryとして作る（同 242–253）。`browsers`もあるときは、各browserの版をES module対応版まで引き上げ、対応しないbrowserを外す（同 264–284）。preset-envは`esmodules`と`browsers`が同時に指定されたら`browsers`を無視すると警告する（preset-env index.ts 163–168）。
  - browserslistの結果は、browserごとに最も低い版へまとめる（index.ts 67–110）。browserslistは`mobileToDesktop: true`で呼ぶ（同 169–175）。
  - preset-envは、top-levelの`targets`（`api.targets()`）を既定とする。presetの局所的な解決へ戻るのは、`@babel/core`の版が`api.targets()`を持たない古い版である場合（commentによれば、その版では`api.targets()`が常に空を返す）と、preset側でbrowserslist関連のoption（`targets`、`configPath`、`browserslistEnv`、`ignoreBrowserslistConfig`）が指定された場合である（preset-env index.ts 220–241）。設定fileが見つかったら、build cacheの外部依存として登録する（同 174–176）。
- 解いている問題と前提：対応範囲の宣言（P25-O01）を、build toolが決まった順で拾い、変換の判断に使える「browserごとの最低版」の形へ変える。設定fileの変更でbuild結果が変わることをcacheに伝える。
- 必要な入力：明示のtarget、環境変数、設定file、browserslistの環境名、ES module対応の互換data。
- trade-off・失敗の仕方：明示の指定があると設定fileは読まれないため、同じrepoの中でtoolによって範囲が食い違いうる（P25-O01の「1つの宣言」の前提が崩れる）。範囲の表現は「browserごとの最低版」に縮約されるので、query（P25-O02・O03）の意図（統計による選択等）はこの段階で失われる。
- 反例・適用しない場合：構文変換を行わない（範囲の全browserが使う構文に対応している）場合、この解決は不要になる。
- 互換・非互換：P25-O01の宣言を読み、P25-O08（変換の選択）とP25-O09（polyfillの選択）へ渡す。
- 限界：本書の固定commitはpreset-envのmain（package.jsonの`version`が読んだ範囲でgovuk-frontendの依存より新しいメジャー版）である。govuk-frontendのbabel.config.jsは`loose`を渡すが、固定commitのpreset-envは`loose`・`spec`を渡すと例外を投げる（preset-env index.ts 197–203）。メジャー版の差による違いで、govuk-frontendが使う版の挙動は読んでいない。

### P25-O08 機能ごとの「最低対応版」と対応範囲を比べて、必要な構文変換だけを選び、選んだ理由を出力できる
- 出典：babel、`packages/babel-helper-compilation-targets/src/filter-items.ts` 行12–104（https://github.com/babel/babel/blob/4f4ef5d44f02f35a8aa2c418644c6dece52b8366/packages/babel-helper-compilation-targets/src/filter-items.ts#L12-L104）、`packages/babel-helper-compilation-targets/src/debug.ts` 行10–40（https://github.com/babel/babel/blob/4f4ef5d44f02f35a8aa2c418644c6dece52b8366/packages/babel-helper-compilation-targets/src/debug.ts#L10-L40）、`packages/babel-preset-env/src/index.ts` 行243–333（https://github.com/babel/babel/blob/4f4ef5d44f02f35a8aa2c418644c6dece52b8366/packages/babel-preset-env/src/index.ts#L243-L333）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `targetsSupported`は、対応範囲の各環境について、機能の最低対応版が無い（未実装）なら未対応とし、範囲の最低版が未公開版なら変換不要とし、最低対応版が未公開版なら未対応とし、それ以外は最低対応版が範囲の最低版より新しければ未対応とする。未対応の環境が1つも無いときだけ「対応済み」を返す（filter-items.ts 12–56）。対応範囲が空なら`false`（変換が必要）を返す（同 15–17）。
  - `isRequired`は、`exclude`にあれば不要、`include`にあれば必要、それ以外は互換dataで判定する（同 58–74）。`filterItems`は全機能に`isRequired`を当て、既定のinclude／excludeを加減する（同 76–104）。
  - preset-envは`forceAllTransforms`のときだけ構文変換の対象範囲を空にして全変換を選ぶが、polyfillの選択には元の対応範囲を渡す（index.ts 243、290–306）。
  - `debug`のときは、使った対応範囲、選んだplugin、各pluginを選んだ理由（どの環境のどの版が原因か、`getInclusionReasons`）を出力する（index.ts 315–330、debug.ts 10–40）。polyfillの方式が指定されていなければ「polyfillを足していない」と出力する（index.ts 325–329）。
- 解いている問題と前提：対応範囲が狭まれば変換は減り、配る量が減る。機能ごとの最低対応版を互換dataとして持てば、範囲の変更だけで変換の集合が決まる。
- 必要な入力：機能ごとの最低対応版の互換data（`@babel/compat-data`）、対応範囲、include／exclude。
- trade-off・失敗の仕方：互換dataの誤りはそのまま出力の誤りになる。対応範囲が空のとき全変換になる（安全側）が、宣言の欠落に気付きにくい。構文変換とpolyfillは別の判定で、`forceAllTransforms`は構文変換だけに効く。
- 反例・適用しない場合：範囲を持たず常に全変換する運用では、選択は不要である。
- 互換・非互換：P25-O07の出力を入力にする。P25-O09（polyfill）と同じ「最低対応版との比較」の型だが、互換dataの持ち主（babel／core-js）が分かれる。
- 限界：個々の機能の版は持ち込まない。`removeUnsupportedItems`等の補助処理は読んでいない。

### P25-O09 polyfillの選択：対応範囲から必要なmoduleを計算し、「入口の置換（entry）」と「使用箇所への挿入（usage）」の2方式で配る
- 出典：core-js、`packages/core-js-compat/compat.js` 行32–90（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/packages/core-js-compat/compat.js#L32-L90）、`packages/core-js-compat/targets-parser.js` 行50–72（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/packages/core-js-compat/targets-parser.js#L50-L72）、`README.md` 行324–418（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/README.md#L324-L418）、行461–467（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/README.md#L461-L467）。babel、`packages/babel-preset-env/src/index.ts` 行124–154（https://github.com/babel/babel/blob/4f4ef5d44f02f35a8aa2c418644c6dece52b8366/packages/babel-preset-env/src/index.ts#L124-L154）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `core-js-compat`は、対応範囲（browserslistのqueryまたは環境と版の組）を解析し（targets-parser.js 50–72）、moduleごとに、互換dataに環境が無いか範囲の版が最低対応版より古ければ「必要」とし、必要にした環境を記録する（compat.js 32–50）。対応範囲が無ければ全moduleを必要とする（同 33–38）。対象をmodule名・入口・正規表現で絞り、core-jsの版で導入されたmoduleに限り、提案段階から安定化したmoduleを除く（同 52–90）。
  - preset-envは`useBuiltIns`の値から`entry-global`／`usage-global`の方式を作り、対応範囲と`corejs`の版をpolyfill pluginへ渡す（preset-env index.ts 124–154）。
  - READMEによれば、`entry`は利用者が書いたcore-jsの入口のimportを、対応範囲で必要なmoduleのimportへ置き換える。`usage`は各fileで使われ、かつ対応範囲で未対応の機能のpolyfillだけをfileの先頭に足す（README 333–388）。`usage`では自分でcore-jsをimportしない（同 392–393）。`corejs`には使うcore-jsの版を小版まで書くことを勧める（大版だけだと小版で追加されたmoduleが入らない）（同 326–329）。global汚染をしない`@babel/runtime`経由の方式もあり、preset-envと併用するときは`corejs`を片方にだけ書く（同 395–418）。
  - 互換dataは`core-js-compat`として公開され、babelやswcとの統合に使われる（README 461–467）。
- 解いている問題と前提：対応範囲で不足する標準libraryの機能だけを足し、範囲の変化に合わせて配る量を変える。構文変換（P25-O08）と同じ対応範囲から計算する。
- 必要な入力：対応範囲、使うcore-jsの版、方式（entry／usage／runtime）、提案段階の機能を含めるか。
- trade-off・失敗の仕方：`usage`はcodeの静的解析に依存し、解析できない使い方は漏れうる（READMEは、swcの`usage`はbabelほど上手く働かないと書く。README 422）。`entry`は使っていない機能も含む。`corejs`の版の書き方を誤ると、新しいmoduleが黙って入らない。preset-envとruntimeの両方で`corejs`を指定すると衝突する。
- 反例・適用しない場合：対応範囲の全browserが必要な機能を持つ場合、polyfillは0件になる。govuk-frontendは、vendor polyfillを全て外し、polyfillの方式は変わりうると文書に書く（P25-O14）。
- 互換・非互換：P25-O07・O08と同じ対応範囲を使う。P25-O10（実行時の機能検出）と組み合わさり、build時に「入れるか」、実行時に「使うか」を2段で決める。
- 限界：互換dataの版は持ち込まない。swcの統合とcore-js-builderは読んでいない。

### P25-O10 polyfillの中で機能を実行時に検出し、「無い」だけでなく「壊れている」場合も置き換え、完全でない実装に印を付ける
- 出典：core-js、`packages/core-js/internals/export.js` 行10–55（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/packages/core-js/internals/export.js#L10-L55）、`packages/core-js/internals/is-forced.js` 行1–23（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/packages/core-js/internals/is-forced.js#L1-L23）、`packages/core-js/internals/fails.js` 行1–8（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/packages/core-js/internals/fails.js#L1-L8）、`packages/core-js/modules/es.array.includes.js` 行7–25（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/packages/core-js/modules/es.array.includes.js#L7-L25）、`packages/core-js/modules/es.object.get-prototype-of.js` 行8–16（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/packages/core-js/modules/es.object.get-prototype-of.js#L8-L16）、`README.md` 行433–455（https://github.com/zloirock/core-js/blob/d8a7886e8316f77eb24aa2051bcf1a7d56ed8a16/README.md#L433-L455）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 各moduleは、native実装の不具合を検出する関数を`fails`で包んで実行し、その結果を`forced`として`export`へ渡す（es.array.includes.js 7–25）。`fails`は、検出関数が真を返した場合と、例外を投げた場合の両方で「壊れている」とみなす（fails.js 1–8）。引用したes.array.includes.jsの2つの検出（行8–17）は、例外ではなく戻り値で不具合を表す。
  - `export`は、強制でなく、対象に同名の性質が既にあり、型が同じならnativeを残す。それ以外は置き換える（export.js 43–53）。不完全な実装には`sham`の印を付ける（同 49–52、es.object.get-prototype-of.js 12）。
  - `isForced`は、利用者の設定（機能ごとに`POLYFILL`／`NATIVE`）を検出結果より優先する（is-forced.js 7–13）。READMEは、`useNative`（nativeが全く無いときだけpolyfill）、`usePolyfill`（常にpolyfill）、`useFeatureDetection`（既定）を設定できると書き、既定を変えるとcore-js内部も正しく動かない可能性があると注記する（README 433–455）。
- 解いている問題と前提：対応範囲の版の表（P25-O09）だけでは、「対応している」とされた版のnativeの不具合を拾えない。実行時に実際の挙動を試して決める。
- 必要な入力：機能ごとの不具合の検出関数、利用者の上書き設定。
- trade-off・失敗の仕方：検出は実行時のcostになる。READMEは、検出が利用者の場合によっては厳しすぎることをPromiseの例で挙げ（README 437）、逆に、検出が拾わない問題を持つ環境がありうることを一般的な記述として挙げる（README 439）。前者はnativeを不要に置き換え、後者は壊れたnativeを残す。上書きを使うと内部の整合が崩れうる。`sham`は「完全でない」ことを印にするだけで、利用側が印を確かめなければ違いは見えない。
- 反例・適用しない場合：polyfillを使わず、機能が無ければ機能を出さない（段階的な縮退、P25-O12・O13）設計では、置換の判断は要らない。
- 互換・非互換：P25-O09のbuild時選択と2段で働く。P25-O13のgovuk-frontendの機能検出（`'onbeforematch' in document`、`@supports`）は、置き換えではなく「あれば使う」側の検出で、目的が逆向きである。
- 限界：検出関数のcomment（`es.array.includes.js` 7、13）にあるbrowserの版は持ち込まない。

### P25-O11 browserを等級（grade）に分け、等級ごとに検査・JavaScriptの実行・必要な機能強化・bugの優先度を決める
- 出典：govuk-frontend、`docs/contributing/browser-support.md` 行1–70（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/docs/contributing/browser-support.md#L1-L70）、行72–119（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/docs/contributing/browser-support.md#L72-L119）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 全componentはHTMLとCSSで基本の体験を提供し、JavaScriptが動かなくても利用者が作業を終えられるようにする。JavaScriptは機能を足すか、accessibilityの問題を直すために使う（browser-support.md 3）。
  - browserを4等級に分ける。A（主要browserの最新の安定版）、B（一定期間内の安定版など）、C（ES moduleを読み込めるbrowser）、X（それ以外）。A・B・CだけがJavaScriptの機能強化を実行し、Xは対象外とする（同 12–21）。
  - JavaScriptの機能強化を、「必要な機能強化」（JavaScriptが動いている状態で作業を終えるのに要るもの。例：`role="button"`のkeyboard操作）と「任意の機能強化」（無くても使えるもの）に分ける（同 23–28）。必要な機能強化はA・B・Cの全てで動かす（同 30–32）。任意の機能強化は、Cでは、JavaScript無しの体験へ戻す、一部を無効にする、より簡単な代替にする、のいずれかを取りうる（同 34–42）。
  - Cにどこまで対応するかの判断材料として、利用者と利用teamへの影響、機能の普及、特定の利用者（screen reader利用者等）への重要性、polyfill・変換の追加量と性能への影響、初期と保守の工数、これらの理解への自信を挙げる（同 44–51）。古いbrowserで振る舞いが違う場合は、Design Systemに記録し、release noteで知らせる（同 53）。
  - 「対応する」の中身を、検査の水準（手動・自動）、JavaScriptがerror無く読み込まれること、必要・任意の機能強化が使えること、bugの優先度、に分け（同 55–66）、等級ごとに定める（同 72–119）。Xのbugは「直さない」（同 70）。Cの一部（`noModule`を持たないbrowser）はJavaScriptを早期に終える、と検出方法との関係を書く（同 110）。
- 解いている問題と前提：browserの版は増え続け、全版を同じ水準で支えられない。「対応する／しない」の2値ではなく、等級ごとに支援の項目を変えれば、古いbrowserの利用者にも作業の完了を保証しつつ、検査と保守の量を抑えられる。HTMLとCSSの基本体験が成り立つことが前提である。
- 必要な入力：等級の定義、機能強化の分類（必要／任意）、等級ごとの支援項目、判断材料。
- trade-off・失敗の仕方：等級の定義（文書）と`.browserslistrc`のquery（P25-O01）は別に書かれ、両者の一致を機械で照合する仕組みは見当たらなかった。Cではbugを直さず検査もしないため、「必要な機能強化が動く」ことの確認手段は読んだ範囲で書かれていない。任意の機能強化の扱いはCで個別判断になる。
- 反例・適用しない場合：JavaScriptが無いと作業が成り立たない（基本体験をHTMLとCSSで作れない）製品では、この等級の分け方の前提が崩れる。
- 互換・非互換：P25-O12（等級Cの境界を実行時に判定する仕組み）、P25-O13（任意の機能強化の局所的な縮退）、P25-O14（等級に基づく機能の採用と範囲の見直し）と組み合わさる。P25-O03・O05とは範囲の表し方が異なる（P25-O05の互換を参照）。
- 限界：等級に含まれるbrowser名と版、期間は持ち込まない。

### P25-O12 「cut the mustard」：HTMLの先頭で1つの機能を検出してbodyに印を付け、印が無ければcomponentのJavaScriptを初期化しない。初期化の失敗をcomponent単位に閉じ込める
- 出典：govuk-frontend、`packages/govuk-frontend/src/govuk/template.njk` 行34–35（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/template.njk#L34-L35）、`packages/govuk-frontend/src/govuk/common/index.mjs` 行91–106（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/common/index.mjs#L91-L106）、`packages/govuk-frontend/src/govuk/component.mjs` 行37–103（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/component.mjs#L37-L103）、`packages/govuk-frontend/src/govuk/init.mjs` 行26–77（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/init.mjs#L26-L77）、行94–162（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/init.mjs#L94-L162）。PR #3801（https://github.com/alphagov/govuk-frontend/pull/3801、merged）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - page templateは`<body>`の直後のinline scriptで、`js-enabled`のclassを付け、`'noModule' in HTMLScriptElement.prototype`が真なら`govuk-frontend-supported`も付ける（template.njk 35）。JavaScriptが動かなければどちらも付かない。
  - `isSupported`はbodyに`govuk-frontend-supported`があるかだけを見る（common/index.mjs 100–106）。componentの基底classの`checkSupport`は、無ければ`SupportError`を投げる（component.mjs 99–103）。constructorは、root要素の型を確かめ、対応を確かめ、二重初期化を確かめてから、初期化済みの印（`data-<module>-init`）を付ける（同 43–77）。
  - `initAll`は、対応していなければ`SupportError`を作り、`onError`があればそれへ、無ければconsoleへ出して、何も初期化せずに戻る（init.mjs 32–56）。`createAll`は`data-module`属性で要素を探し、要素ごとにcomponentを作る。1つの要素で例外が出ても、その要素だけを`onError`へ渡して除き、他の要素の初期化を続ける（同 139–161）。
  - PR #3801の本文は、`<script nomodule>`に対応するbrowserだけでJavaScriptを動かすため、`noModule`の検出で「cut the mustard」し、初期のclass実装を持つbrowserでcomponentを読み込まないようにする、と書く。
- 解いている問題と前提：等級C未満（P25-O11）のbrowserでJavaScriptが中途半端に動き、componentが壊れた状態で表示されるのを防ぐ。1つの代表的な機能の有無で「十分に新しいか」を判定し、個々の機能を1つずつ検出しない。CSSは印（class）を見て、JavaScriptが動く場合の見た目に切り替える（P25-O13）。
- 必要な入力：判定に使う代表機能、印を付けるinline script（CSPを使う場合はnonceまたはhash）、componentの初期化の入口。
- trade-off・失敗の仕方：代表機能1つの判定は、その機能を持つが他の機能を欠くbrowserを通してしまう、あるいは逆に除外してしまう（browser-support.md 110は、ES moduleに対応するが`noModule`を持たないbrowserでJavaScriptが早期に終わる、と書く）。inline scriptを変えると、CSPのhashを利用側で更新する必要がある（CHANGELOG、P25-O14）。初期化の失敗は既定でconsoleへ出るだけで、利用者には見えない（`onError`を渡さない場合）。印はbodyに1つで、component単位の対応の差は表せない。
- 反例・適用しない場合：JavaScriptが必須の製品（基本体験をHTMLだけで作れない）では、判定に落ちた利用者に提供できるものが無い。
- 互換・非互換：P25-O11の等級の境界を実行時に実装したもの。P25-O13（印の下でのCSS・JavaScriptの局所的な縮退）と組み合わさる。P25-O10（core-js）とは、検出の後に「置き換える」か「動かさない」かで逆である。
- 限界：判定に使う機能が将来も適切かは、文書（P25-O14）の見直しに依存する。このrepoで成立していることは、HELIXで成立することを意味しない。

### P25-O13 印（class）の下でだけJavaScript用のCSSを当て、個別の機能は「あれば使う」形で検出し、保存の失敗を握りつぶす（componentの局所的な縮退）
- 出典：govuk-frontend、`packages/govuk-frontend/src/govuk/components/accordion/_mixin.scss` 行36–73（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/accordion/_mixin.scss#L36-L73）、`packages/govuk-frontend/src/govuk/components/accordion/accordion.mjs` 行160–165（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/accordion/accordion.mjs#L160-L165）、行432–441（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/accordion/accordion.mjs#L432-L441）、行504–547（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/packages/govuk-frontend/src/govuk/components/accordion/accordion.mjs#L504-L547）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - accordionのCSSは、印が無いときは全sectionの中身を表示し（区切りの余白だけを持つ）、`.govuk-frontend-supported`の下でだけ、閉じたsectionの中身を隠す（_mixin.scss 36–60）。
  - 閉じたsectionの隠し方は2段で、まず`display: none`で隠し、`content-visibility`に対応するbrowserでは`@supports`の下で`content-visibility: hidden`に切り替える。これにより、`hidden="until-found"`の中をpage内検索で見つけられるようにする（同 53–68）。
  - JavaScriptは、閉じるときに`hidden="until-found"`を付け、開くときに外す（accordion.mjs 433–441）。`beforematch`のeventは、`'onbeforematch' in document`が真のときだけ購読する（同 160–165）。
  - sectionの開閉状態を`sessionStorage`へ保存・復元する処理は、設定で有効なときだけ行い、保存と読込みの例外を`try { } catch { }`で握りつぶす（同 511–547）。
- 解いている問題と前提：JavaScriptが動かない・対応外のbrowserでは、閉じたsectionの中身が読めなくなってはならない。隠すのはJavaScriptが開閉を担えるときだけにする。新しい機能（検索で開く）は、持つbrowserでだけ使い、持たないbrowserでは従来の振る舞いに留める。保存の失敗（storageが使えない環境）は、機能の一部を失うだけにする。
- 必要な入力：JavaScriptの有無を表す印（P25-O12）、個別機能の検出方法（CSSの`@supports`、JavaScriptの性質の存在確認）、失敗してよい処理の区別。
- trade-off・失敗の仕方：印が付いた後にcomponentの初期化が失敗すると（P25-O12の要素単位の失敗）、CSSは中身を隠したまま、開閉の操作が付かない状態になりうる（この組合せの扱いは読んだ範囲で見当たらなかった）。例外の握りつぶしは、保存の失敗を利用者にも開発者にも知らせない。
- 反例・適用しない場合：中身を最初から隠す必要がある（JavaScript無しでも隠すべき）情報には、この縮退は使えない。
- 互換・非互換：P25-O11の「任意の機能強化」（検索で開く、状態の記憶）と「基本体験」（中身が読める）の区別を、componentの中で実装したもの。P25-O10とは検出の向きが逆（P25-O10の互換を参照）。
- 限界：accordion以外のcomponentは読んでいない（`init.mjs`の一覧で対象のcomponent名を見たのみ）。寸法・色・余白の値は持ち込まない。

### P25-O14 対応範囲の見直しを、採用の規則・事前の非推奨警告・破壊的releaseの移行手順として記録する（文書の更新漏れを含む）
- 出典：govuk-frontend、`docs/contributing/browser-support.md` 行121–141（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/docs/contributing/browser-support.md#L121-L141）、行10（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/docs/contributing/browser-support.md#L10-L10）、`CHANGELOG.md` 行2319–2327（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/CHANGELOG.md#L2319-L2327）、行2449–2509（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/CHANGELOG.md#L2449-L2509）、行3111–3122（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/CHANGELOG.md#L3111-L3122）、`docs/contributing/polyfilling.md` 行1–4（https://github.com/alphagov/govuk-frontend/blob/283cc58ead97f3e3379199976709713914e00b05/docs/contributing/polyfilling.md#L1-L4）。issue #3722（https://github.com/alphagov/govuk-frontend/issues/3722、closed）。web-features、`docs/baseline.md` 行88–93（https://github.com/web-platform-dx/web-features/blob/8606657a71535d688f5473579712717fe9442c0f/docs/baseline.md#L88-L93）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 新しいbrowser機能の採用規則：等級A・Bの全browserが対応するまで待ち、その機能でしかできないことか、等級A・Bで同等の機能をpolyfillや代替で提供できるかを考える。等級Aの全browserが出荷の意向を示し、仕様に含まれている場合も採用を検討する。A・Bが対応した後、Cのために変換・polyfill・代替を考え、適切になったらそれらを外すか簡単にする（browser-support.md 121–141）。
  - 範囲を狭める前に、次の大版で外す古いbrowser向けのSass設定・mixinを非推奨にし、使うと警告を出し、警告を一時的に黙らせる方法と、大版では対応が必要になることを書く（CHANGELOG 3111–3122）。
  - 大版のreleaseで、古いbrowserでJavaScriptを動かさないこと、HTMLとCSSで動き続けるが見た目と振る舞いが変わること、progressive enhancementを使うよう利用teamに求めること、古いbrowserが必要なら前の大版に留まること、を書く（CHANGELOG 2319–2327）。外したpolyfillの一覧、globalを汚していたpolyfillに利用側codeが依存している可能性、`<script type="module">`への変更とその実行上の違い、bodyのinline scriptの差し替え、CSPのhashの更新を、移行手順として書き、それぞれPRへ結ぶ（同 2449–2509。CSPの節は2497行から）。
  - polyfillの文書は「vendor polyfillを全て外し、方式は変わりうる」の2文だけで、issue #3722（文書の更新）を参照する。issueは閉じているが、固定commitの文書は2文のままである（polyfilling.md 1–4）。
  - web-featuresのBaseline文書は、所有者と定義の見直し期日を文書内に持つ（baseline.md 88–93）。
- 解いている問題と前提：対応範囲は時間とともに変わる。変えるときに、機能の採用条件、利用側が取るべき移行、前の版に留まる選択肢を記録しないと、利用側は何が変わったか分からない。範囲の縮小を事前警告→大版での削除の2段にする。
- 必要な入力：機能の採用規則、非推奨の告知の仕組み（Sassの警告）、release noteの移行手順、PRへの参照。
- trade-off・失敗の仕方：記録が文書・CHANGELOG・設定（`.browserslistrc`）に分かれ、相互の一致を保つ仕組みは見当たらなかった。polyfilling.mdのように、issueが閉じた後も文書が更新されないことがある。web-featuresの見直し期日は取得日（2026-10-05）より前の日付が書かれたままで、見直しの結果が文書に反映されたかは読んだ範囲では分からなかった。
- 反例・適用しない場合：大版を持たない（常に最新を配る）製品では、「前の大版に留まる」選択肢を提供できない。
- 互換・非互換：P25-O11（等級）を見直しの基準にする。P25-O04（dataの鮮度警告）は「宣言を変えずに範囲が変わる」側、本観察は「宣言を変えて範囲を変える」側の記録である。
- 限界：対象の版、期間、日付の値は持ち込まない。Design System側の公開文書（等級の要約page）はrepo外で、読んでいない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 対応範囲の表し方 | browserslist：queryの集合演算（統計、版、時期、機能、Baseline、`dead`）（O02・O03） | govuk-frontend：等級（A／B／C／X）と支援水準の文書。buildには別にqueryを書く（O01・O11） | 範囲を機械に読ませるか、人の約束（検査・bugの優先度）として書くか |
| 「広く使える」の判断の単位 | web-features：機能ごとの状態（low／high）と日付（O05） | govuk-frontend：browserの等級。機能の採用は「A・Bの全browserが対応したら」（O14） | 機能から範囲を見るか、browserから見るか。利用統計の有無 |
| 範囲の時間変化 | browserslist：互換dataの鮮度を実行時の時計で警告（O04） | web-features：「現在」を互換dataのtimestampに固定（O05） | 結果の再現性を取るか、現在との差を知らせるか |
| buildへの流し方 | Babel：明示→環境変数→設定file→既定の順で解決し、browserごとの最低版へ縮約（O07） | govuk-frontend：同じfileの環境別の節を、JavaScriptとCSSのtoolへ別々に渡す（O01） | 範囲を1つにするか、成果物の種類ごとに分けるか |
| 構文変換・polyfillの選択 | Babel：機能ごとの最低対応版との比較で構文変換を選ぶ（O08） | core-js-compat：同じ比較でpolyfill moduleを選び、entry／usageで配る（O09） | 互換dataの持ち主。静的解析に頼るか（usage） |
| 実行時の機能の扱い | core-js：検出して、無い・壊れているなら置き換える（O10） | govuk-frontend：代表機能で判定し、無ければJavaScriptを動かさない。個別機能は「あれば使う」（O12・O13） | polyfillで差を埋めるか、基本体験へ縮退するか |
| JavaScriptが無い・失敗した場合 | govuk-frontend：印が無ければJavaScript用CSSを当てない。初期化の失敗はcomponent要素単位で閉じ込める（O12・O13） | core-js・Babel：対象外（JavaScriptが動く前提の仕組み） | 基本体験をHTMLとCSSで作れるか |
| 見直しの記録 | govuk-frontend：採用規則、事前の非推奨警告、大版の移行手順とPR参照（O14） | web-features：定義文書の所有者と見直し期日。非推奨は根拠URL必須（O05・O06） | 利用側に移行を求める製品か、状態の定義を配る基盤か |

## 見つからなかったこと・gap
- 対応範囲の宣言（`.browserslistrc`）と、人向けの等級の文書（govuk-frontendのbrowser-support.md）が一致しているかを機械で照合する仕組みは、読んだ範囲で見つからなかった。
- 対応範囲の外のbrowserで利用者に「対応外」を知らせる画面の設計（browserslistのREADMEがUser-Agentを正規表現に変換する外部toolを挙げる。README 111–116）は、外部repositoryで、読んでいない。
- 実利用の統計から対応範囲を見直す運用（統計の取得周期、範囲を変える判断基準）の設計文書は、browserslistのREADME（自前統計のquery）以外に見つからなかった。
- govuk-frontendのbrowser-support.mdで、等級Bの定義が、等級の一覧（行17）と等級Bの節（行87）とで食い違っている（Safariのどの版を含めるかの書き方が異なる。版の値は持ち込まない）。どちらが現行の定義かは、読んだ範囲では分からなかった。
- govuk-frontendで、印（`govuk-frontend-supported`）が付いたのにcomponentの初期化が失敗した場合（CSSは隠したまま）の扱いは、読んだ範囲で見つからなかった（P25-O13）。
- 対応範囲を変えたときに、変換・polyfillの出力（配る量）の差を記録・検査する仕組みは、読んだrepoの範囲では見つからなかった（Babelの`debug`出力は、選んだ理由を出すだけ）。
- 支援技術（screen reader等）の対応範囲は、web-featuresが非目標とし（P25-O05）、govuk-frontendのbrowser-support.mdも等級の対象にしていない。支援技術の対応範囲の決め方は本書では埋まっていない。
- ADR形式の判断記録は、5 repoとも見当たらなかった（判断の根拠は設計文書、CHANGELOG、issue、PRにある）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`（core.hooksPathを無効化）し、固定commitのfileを`git show <sha>:<path>`で読んだ。build・test・script・hook・package managerは実行していない。gh apiの呼出しはmetadataとissue・PRの取得で約10回。
- browserslist：`README.md`（1–64, 87–118, 143–300, 362–530, 759–793）、`index.js`（340–420, 837–892, 1208–1240、query定義のregexpの一覧）、`node.js`（18–46, 197–220, 323–336, 476–504、関数名の一覧）、`grammar.w3c-ebnf`（冒頭）。読んでいないもの：`parse.js`、`browser.js`、`cli.js`、`docs/THREAT_MODEL.md`、test。
- web-features：`docs/baseline.md`（全体）、`docs/guidelines.md`（1–20, 155–260, 388–480、見出しの一覧）、`features/container-queries.yml`（全体）、`features/container-queries.yml.dist`（1–40）、`packages/compute-baseline/src/baseline/index.ts`（1–42, 92–135, 200–285、関数名の一覧）、`date-utils.ts`（4–9、ESRの語のgrep）。issue #2133（題名と状態）。読んでいないもの：`docs/baseline-audience-illustration.md`、`GOVERNANCE.md`、`scripts/`、`schemas/`、`baseline-browser-mapping`（別repo）。
- babel：`packages/babel-helper-compilation-targets/src/index.ts`（全体）、`filter-items.ts`（全体）、`debug.ts`（1–41）、`packages/babel-preset-env/src/index.ts`（120–333、grep結果）、`packages/babel-preset-env/package.json`（version行）。読んでいないもの：`@babel/compat-data`の中身、`normalize-options.ts`、`babel-plugin-polyfill-corejs3`（別repo）。
- core-js：`packages/core-js-compat/compat.js`（全体）、`targets-parser.js`（1–80）、`src/data.mjs`（冒頭のみ、形の確認）、`packages/core-js/internals/export.js`・`is-forced.js`・`fails.js`（全体）、`modules/es.array.includes.js`・`es.array.flat.js`・`es.object.get-prototype-of.js`（全体）、`README.md`（324–470、見出しの一覧）。読んでいないもの：`core-js-builder`、`core-js-pure`、`docs/`の記事、compat test。
- govuk-frontend：`docs/contributing/browser-support.md`・`polyfilling.md`（全体）、`packages/govuk-frontend/.browserslistrc`・`babel.config.js`・`postcss.config.mjs`（全体）、`src/govuk/template.njk`（28–42）、`common/index.mjs`（88–108）、`component.mjs`（1–113）、`init.mjs`（20–170）、`components/accordion/_mixin.scss`（1–75）、`accordion.mjs`（155–170, 425–445, 500–550、grep結果）、`CHANGELOG.md`（2319–2330, 2445–2510, 3109–3125、grep結果）、root・packageの`package.json`（babel依存の行）。issue #3722、PR #3801（本文冒頭）。読んでいないもの：他のcomponent、`docs/contributing/coding-standards/js.md`、`application-architecture.md`、Design Systemの公開site（repo外）。
- 検索した語：`browserslist`、`baseline`、`dead`、`oldDataWarning`、`dangerousExtend`、`esmodules`、`useBuiltIns`、`forceAllTransforms`、`forced`、`sham`、`isForced`、`govuk-frontend-supported`、`noModule`、`js-enabled`、`isSupported`、`SupportError`、`onbeforematch`、`@supports`、`sessionStorage`、`Internet Explorer`、`grade`、`polyfill`。
- 選ばなかった候補：Financial-Times/polyfill-service（govuk-frontendのissue #3722がpolyfill.ioの利用終了の文脈を示すが、今回は5 repoで足りると判断し読んでいない）、postcss/autoprefixer・csstools/postcss-plugins（CSS側の宣言の消費者。govuk-frontendの設定で使い方だけを確認）、web-platform-dx/baseline-browser-mapping（browserslistのBaseline queryの依存先。読んでいない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。govuk-frontendは設計文書（browser-support.md）と実装（template、init）の両方を持ち、web-featuresは定義文書と計算codeを持つ。文書と実装が食い違う場合（govuk-frontendのpolyfilling.mdとissue #3722の状態等）の由来の区別は未決。
- scope：観察は、対応範囲の宣言、buildへの流し方、実行時の検出と縮退、見直しの記録に限っている。HELIXのD04で、宣言（設計文書の項目）・build設定・componentの実装のどの層へ対応させるかは未決。支援技術の対応範囲をD04とD10のどちらで扱うかも未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。対応範囲の観察は、互換data（caniuse-lite、MDNの互換data、core-js-compat）の更新で結果が変わる。commit SHAに加えてdataの版を記録するかは未決。Babelのように本書の固定commit（main）と利用側（govuk-frontend）の依存とでメジャー版が異なる場合、どちらを観察の版とするかも未決（P25-O07の限界）。
- 状態：全観察（P25-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
