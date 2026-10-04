# P29 architectureの退化を時間経過で見る仕組みの観察（既知違反の凍結、ratchet、依存graphの比較、例外の期限）（D01 Software Architecture）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。
値の線引き：既定の挙動（既定で有効か無効か、既定でどの集合を対象にするか等の非数値）は書く。数値の既定値、例示の日付、件数、並列数は、出典に書かれていても写さない。

埋めようとしたgap（SCF-B-0155、D01 §4）：「architectureの退化（境界の侵食、依存の逆流）を時間経過で見る知識」。D01-M03は設計と実装の差の検出だけで、退化のpatternの記述は無い、とされている。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| sverweij/dependency-cruiser | https://github.com/sverweij/dependency-cruiser | a210586ea2a3c0501153e4a39925cee325fe0b3f（default branch: main） | MIT | false | 2026-10-05 | JavaScript／TypeScriptの依存規則の検査器。既知違反のbaselineを3つの更新mode（全置換、縮小のみ、整形のみ）で持ち、git revisionとの差分graphをCIのsummaryへ出す使い方を自repoのCIで行っている |
| deptrac/deptrac | https://github.com/deptrac/deptrac | 66595d1ca307afff492d99501ffaeba147e848b0（4.x） | MIT | false | 2026-10-05 | PHPのlayer依存の検査器。既知違反を設定の`skip_violations`節として持ち、一致しなくなった例外をerrorにする。候補に挙がった`qossmic/deptrac`はGitHub APIで`opensoftwareconsulting/deptrac`（archived: true）へ転送されたため、現行の`deptrac/deptrac`を読んだ |
| TNG/ArchUnit | https://github.com/TNG/ArchUnit | 74237315efc53279bda634e818977d41f64a1bd4（main） | Apache-2.0 | false | 2026-10-05 | P18と同じcommit。P18はFreezingArchRuleのstore設定（作成・更新の可否、refreeze、行番号の無視の記述）を読んだ。本書は、違反の同一性の判定（line matcher）、ruleの同一性（説明文をkeyにするstore）、新しい違反を受け入れない方針と、store掃除の未解決issueを読んだ |
| jQAssistant/jqassistant | https://github.com/jQAssistant/jqassistant | 5ada015c2e789cf2fd9a01ce1729b13a52dec562（master） | GPL-3.0 | false | 2026-10-05 | code graph（Neo4j）に対するconcept／constraintの検査器。baseline管理、期限と理由を持つsuppression、severityと失敗の閾値の分離を持つ。copyleftのため構造の観察だけにした |
| phenomnomnominal/betterer | https://github.com/phenomnomnominal/betterer | 69a83c14975b6ef2e4e42736e686ffba0f28895f（master） | MIT | false | 2026-10-05 | 依存規則の専用toolではないが、任意の測定値を「悪くなったら失敗、良くなったら記録を更新」するratchetとして汎用化しており、CI modeとdeadlineを持つ。ratchetの構造の対照として選んだ |
| sindresorhus/eslint-plugin-unicorn | https://github.com/sindresorhus/eslint-plugin-unicorn | 5c4808ba0b4df09b21098c9a84ce748f436894ff（main） | MIT | false | 2026-10-05 | 規則の例外ではなくTODO commentに期限（日付、版、依存の有無）を付けるlint rule `expiring-todo-comments`を持つ。日付で失敗し始めることの是非がissueで議論されており、例外の期限の失敗の仕方の根拠として選んだ |

（P18で読んだShopify/packwerkのpackage_todoとArchUnitのFreezingArchRuleの基本動作（初回の凍結、解消分の自動削除、store作成・更新の可否、refreeze）は重ねていない。P01・P18で読んだimport-linter、nx、spring-modulithも対象外にした。）

## 観察

### P29-O01 既知違反を「消す」のではなく重大度を下げる（dependency-cruiserの`--ignore-known`）
- 出典：dependency-cruiser、`src/analyze/soften-known-violations.mjs` 行4–35（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/analyze/soften-known-violations.mjs#L4-L35）、行70–108（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/analyze/soften-known-violations.mjs#L70-L108）、行118–131（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/analyze/soften-known-violations.mjs#L118-L131）、`src/analyze/summarize/is-same-violation.mjs` 行6–36（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/analyze/summarize/is-same-violation.mjs#L6-L36）、`doc/cli.md` 行874–909（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L874-L909）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - `--ignore-known`を付けると、既知違反file（既定のfile名を持つJSON）に載っている違反の重大度（severity）を`ignore`へ書き換える。違反そのものは結果から取り除かない。docsは、`err`系のreporterでは無視した違反を隠し、無視した件数を警告として出すと書いている（行888–898、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L888-L898）。
  - 既知かどうかの判定は違反の種類で分かれる。依存の違反（`dependency`、`cycle`、`instability`）は`isSameViolation`で比べる。`isSameViolation`自体は、rule名が同じことを前提に、循環なら構成moduleの数が同じで全moduleが含まれること、両方が`via`を持つならfrom・to・viaの集合が一致すること、それ以外はfromとtoの一致で判定する関数である（行18–29のvia分岐、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/analyze/summarize/is-same-violation.mjs#L18-L29）。ただし緩和の経路（行48–53、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/analyze/soften-known-violations.mjs#L48-L53）が照合に渡す違反は`{rule, from, to, cycle}`だけで`via`を持たないため、この経路ではvia分岐は使われず、循環の照合かfrom・toの照合になる。moduleの違反（`module`、`reachability`）は、fromとrule名の一致だけで判定する。
  - 行103–105（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/analyze/soften-known-violations.mjs#L103-L105）のTODO commentは、folder単位の違反（`instability`等をfolderに当てる場合）はまだ緩和の対象外だと書いている。
- 解いている問題と前提：docs（行900–909）は、大きなcode baseに導入すると既存違反が多く、すぐには直せず、新しい違反が既存違反に埋もれることを挙げ、その回避策としてこのoptionを置いている。違反がrule名とmodule pathで同一視できることが前提である。
- 必要な入力：既知違反file（versionを管理する場所に置く）、各違反のrule名・from・to（循環ならmodule列、viaならvia列）。
- trade-off・失敗の仕方：
  - moduleの違反はfromとrule名だけで照合するため、同じmoduleで同じruleの違反が別の理由で増えても既知として扱われうる（コードからの読み取り。実害の報告は確認していない）。
  - 循環の照合は順序を見ず、集合と長さで比べる。同じmodule集合を別の向きで回る循環は区別されない（同上）。
  - folder単位の違反は既知違反として緩和されない（TODO comment）。
- 反例・適用しない場合：deptracは既知違反を設定の一部として持ち、一致しなかった例外をerrorにする（P29-O03）。ArchUnitは違反の文字列そのものを照合する（P29-O04）。
- 互換・非互換：P29-O02（baselineの更新mode）で作ったfileを入力にする。P29-O13（依存graphの差分）とは独立に使える。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。違反の型の名前はこのrepo固有である。

### P29-O02 baselineの更新を「全置換」「縮小のみ」「整形のみ」のmodeで分け、new／same／staleを数える（dependency-cruiserの`--baseline`）
- 出典：dependency-cruiser、`doc/cli.md` 行832–864（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L832-L864）、行866–872（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L866-L872）、`src/report/baseline.mjs` 行18–57（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/report/baseline.mjs#L18-L57）、行70–81（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/report/baseline.mjs#L70-L81）、`package.json` 行150–152（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/package.json#L150-L152）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `--baseline`は既知違反fileを作るか更新し、前回との差を`new`（今回だけにある）、`same`（両方にある）、`stale`（前回だけにある）の件数で副channelへ出す。
  - modeは3つある。`full`は今回の違反でfile全体を置き換える。`shrink-only`は前回と今回の両方にある違反（same）だけを書き出し、新しい違反を足さない。`format`は前回の内容をそのまま書き直し、件数だけを示す。modeを指定しない場合は`full`になる（行10、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/report/baseline.mjs#L10-L10。行74、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/src/report/baseline.mjs#L74-L74）。
  - docsは、差の計算を正確にするために`--baseline`が`--no-ignore-known`と`--no-cache`を伴うと書いている（行853–854、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L853-L854）。また、比較ではseverityを無視するため、severityを上げ下げしてもbaselineから違反が消えないと書いている（行856–859、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L856-L859）。
  - 自repoでは、通常の検査（`--ignore-known`付き）、既知違反を含めた全件の検査、baselineの更新を、別のscriptに分けている。
- 解いている問題と前提：既知違反の記録を、増やす更新と減らすだけの更新に分ける。記録fileはversion管理の中に置かれ、更新の差分がreviewで見える前提である。
- 必要な入力：前回の既知違反file、今回の全違反、更新mode。
- trade-off・失敗の仕方：既定の`full`では、新しい違反も同じ操作でbaselineへ入る。docsは新しい違反を足すかどうかをmodeの選択に委ねており、どの場面でどのmodeを使うかの規則は書いていない。`shrink-only`はfileが減る方向にしか動かないが、modeを`full`で実行すれば同じfileに新しい違反が入る。
- 反例・適用しない場合：ArchUnitは新しい違反の差分だけをstoreへ足す操作を持たない。ただし`freeze.refreeze=true`で、そのときの全違反を凍結し直すことはできる（`docs/userguide/008_The_Library_API.adoc` 行498–503、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L498-L503）（P29-O05）。jQAssistantは、既にbaselineがある場合、新しい行をbaselineへ自動では足さない（P29-O06）。deptracのbaseline formatterは全置換だけである（P29-O03）。
- 互換・非互換：P29-O01の入力を作る。P29-O09（betterer）の「良くなったときだけ記録を更新」とは、更新の契機を利用者のcommandに置く点で異なる。
- 限界：件数は持ち込まない。mode名はこのrepo固有である。

### P29-O03 既知違反を設定の一節として持ち、一致しなくなった例外をerrorにする（deptracの`skip_violations`）
- 出典：deptrac、`docs/concepts.md` 行289–326（https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/docs/concepts.md#L289-L326）、`docs/formatters.md` 行11–34（https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/docs/formatters.md#L11-L34）、`docs/configuration.md` 行294–306（https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/docs/configuration.md#L294-L306）、`src/Contract/Analyser/EventHelper.php` 行27–75（https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/src/Contract/Analyser/EventHelper.php#L27-L75）、`src/DefaultBehavior/Analyser/UnmatchedSkippedViolations.php` 行18–27（https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/src/DefaultBehavior/Analyser/UnmatchedSkippedViolations.php#L18-L27）、`src/Supportive/Console/Command/AnalyseRunner.php` 行63–71（https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/src/Supportive/Console/Command/AnalyseRunner.php#L63-L71）、`src/DefaultBehavior/OutputFormatter/BaselineOutputFormatter.php` 行32–80（https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/src/DefaultBehavior/OutputFormatter/BaselineOutputFormatter.php#L32-L80）、`deptrac.php` 行27（https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/deptrac.php#L27-L27）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `skip_violations`は、依存する側のtoken（class名等）をkeyに、依存される側のtokenの一覧を値に持つ辞書である。docsは、既存違反のためにCI／CDへの組込みが難しい場合に、既存違反をskipして段階的に改善し、新しい違反を防ぐ目的で置くと書いている。
  - `EventHelper.shouldViolationBeSkipped`は、(依存する側, 依存される側) の組が辞書にあればskipとし、`SkippedViolation`として結果に残す。一致した組は「未一致の一覧」から外す。
  - 解析の後処理（`PostProcessEvent`）で、最後まで一致しなかった組ごとに「Skipped violation ... was not matched.」のerrorを結果へ加える。`AnalyseRunner`は、違反があれば違反として、errorがあればerrorとして、commandを失敗させる。したがって、直した後も残っている例外は、記録から消すまでcommandを失敗させる。
  - `baseline` formatterは、違反とskip済みの違反の両方を集めて並べ替え、file全体を書き直す。docsは、baselineを別fileに分けて`imports`で読み込むと、formatterで再生成できると書いている。deptrac自身も自repoの設定でbaseline fileを読み込んでいる。
- 解いている問題と前提：既知違反を許しつつ、使われなくなった例外を残さない。例外の単位はtokenの組で、規則の種類（どのlayer間のruleか）は記録に含まない。
- 必要な入力：(依存する側, 依存される側) の組の一覧。それを生成するformatterの実行。
- trade-off・失敗の仕方：
  - formatter（Baseline Formatter）のdocsは、全errorを無視するのは最善ではないと注意している（formatters.md 行17–18、https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/docs/formatters.md#L17-L18）。formatterの出力は全置換なので、再生成のたびに新しい違反もbaselineに入る。
  - `EventHelper`のdoc commentは配列の中身を「depender layer -> list<dependent layers>」と書いているが、照合に渡される値は`getDepender()->toString()`等のtoken名である（行18–20、https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/src/Contract/Analyser/EventHelper.php#L18-L20。行64–69、https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/src/Contract/Analyser/EventHelper.php#L64-L69）。commentと実装の語が一致していない。
- 反例・適用しない場合：dependency-cruiserは一致しなくなった既知違反を失敗にせず、`--baseline`の`stale`件数として示す（P29-O02）。ArchUnitとjQAssistantは、解消された記録を自動でstoreから外す（P29-O05、P29-O06）。
- 互換・非互換：P18-O02で観察したpackwerkの「陳腐化した記録も失敗」と同じ側に立つ。P29-O07（期限付きsuppression）と組み合わせる仕組みは、deptracには見当たらなかった。
- 限界：token名の形式はこのrepo固有である。

### P29-O04 違反の同一性を「文字列から行番号と自動生成番号を除いて比べる」ことで決める（ArchUnitのViolationLineMatcher）
- 出典：ArchUnit、`archunit/src/main/java/com/tngtech/archunit/library/freeze/ViolationLineMatcherFactory.java` 行24–32（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/ViolationLineMatcherFactory.java#L24-L32）、行45–65（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/ViolationLineMatcherFactory.java#L45-L65）、`archunit/src/main/java/com/tngtech/archunit/library/freeze/FreezingArchRule.java` 行142–161（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/FreezingArchRule.java#L142-L161）、行222–255（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/FreezingArchRule.java#L222-L255）、`docs/userguide/008_The_Library_API.adoc` 行505–566（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L505-L566）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 既定の`FuzzyViolationLineMatcher`は、違反の説明文字列を比べるとき、「`:`の後に続き`)`の前にある数字」（行番号とみなせるもの）と、「`$`の後に続く数字」（無名classやlambdaにcompilerが付ける番号）を無視し、残りが一致すれば同じ違反とする（javadoc 行45–48、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/ViolationLineMatcherFactory.java#L45-L48）。設定`freeze.lineMatcher`でclass名を指定すると、別のmatcherに差し替えられる。
  - `CategorizedViolations`は、今回の違反ごとに、まだ使われていない保存済み違反を順に探し、最初に一致したものを1対1で消し込む。消し込まれなかった保存済み違反は「解消済み」として、保存済みの一覧から外して書き戻す（解消済みが1件以上ある場合だけ書き戻す。行153–155、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/FreezingArchRule.java#L153-L155）。
  - 報告から外すのは、消し込みに使われた今回の違反の文字列の集合（`Set<String>`）に含まれるものである（行158–161、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/FreezingArchRule.java#L158-L161）。
- 解いている問題と前提：codeの編集で行番号や自動生成名がずれても、同じ違反を新しい違反として報告しない。違反の説明文字列が、行番号以外は安定していることが前提である。
- 必要な入力：ruleが出す違反の説明文字列。保存済みの違反の一覧。
- trade-off・失敗の仕方：
  - 報告から外す判定が文字列の集合で行われるため、同じ文字列の違反が今回複数あり、保存済みが1件だけの場合、2件目以降も既知として報告から外れうる（コードからの読み取り。issueでの報告は確認していない）。既知集合に入るのは行番号を含む今回のactual文字列そのもので、保存済み1件は1件のactualにしか消費されない（行222–255）。報告から外すのはその集合との完全一致だけである（行158–161）。そのため、行番号を無視するmatcherでも、同じclassの同じ呼出しが別の行で増えた2件目は別の文字列として新しい違反に残る。
  - 説明文字列の書式がlibraryの版で変わると、同じ違反でも一致しなくなる。`freeze.refreeze`のdocsは、refreezeする理由の1つに「違反の書式が変わった場合」を挙げている（`docs/userguide/008_The_Library_API.adoc` 行498–503、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L498-L503）。
- 反例・適用しない場合：dependency-cruiserはrule名とmodule pathの構造化された組で比べる（P29-O01）。jQAssistantは結果行のkey列からhashを作る（P29-O06）。bettererはfileのhashとissueのhashで「移動」を判定する（P29-O10）。
- 互換・非互換：P29-O05（ruleの同一性）と組み合わさって、どの違反がどのruleの既知違反かが決まる。
- 限界：P18-O02と同じ`FreezingArchRule`を読んでいるが、本観察はstore設定ではなく照合の算法だけを扱う。

### P29-O05 ruleの同一性を説明文で決めるstoreと、新しい違反を受け入れない方針（ArchUnitのTextFileBasedViolationStore）
- 出典：ArchUnit、`archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java` 行43–63（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java#L43-L63）、行140–143（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java#L140-L143）、行177–187（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java#L177-L187）、`FreezingArchRule.java` 行118–129（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/FreezingArchRule.java#L118-L129）、`archunit/src/main/java/com/tngtech/archunit/lang/ArchRule.java` 行132–138（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/lang/ArchRule.java#L132-L138）、行168–171（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/lang/ArchRule.java#L168-L171）。issue：TNG/ArchUnit#510（https://github.com/TNG/ArchUnit/issues/510、closed）、#1264（https://github.com/TNG/ArchUnit/issues/1264、open）。PR：#1405（https://github.com/TNG/ArchUnit/pull/1405、open）、#1407（https://github.com/TNG/ArchUnit/pull/1407、open）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 既定のstoreは、store folderに索引file `stored.rules`と、ruleごとの違反fileを置く。索引はruleの説明文（`getDescription()`）をkeyに、違反file名を値に持つ（javadoc 行43–54、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java#L43-L54）。`contains(rule)`は説明文が索引にあるかだけを見る。
  - `FreezingArchRule.evaluate`は、storeにそのruleがない場合（またはrefreezeの設定がある場合）、今回の違反を保存して成功を返す。
  - `because(reason)`は、元の説明文に「, because 」と理由を連ねた説明文を持つruleを返す（`createBecauseDescription`）。したがって、凍結済みのruleに理由を書き足したり`as(...)`で説明文を変えたりすると、索引上は別のruleになり、初回と同じく全違反を保存して成功する。ただしこれはstoreの更新が許可されている場合（`allowStoreUpdate`の既定は許可。行75、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java#L75-L75。行107、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java#L107-L107）に限る。許可されていなければ保存の時点で`StoreUpdateFailedException`になる（行148–152、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java#L148-L152）（コードからの読み取り。#510では、memberが、新しい違反fileを旧い名前へ改名し`stored.rules`の変更を戻す手順を挙げ、その手順をArchRuleの改名以外に使ったとは認めない、と冗談まじりに書いている。改名で記録が切れることの間接的な裏付けとして読んだ）。
  - 新しい違反の差分だけを足す操作はない。全体を凍結し直す手段としては、`freeze.refreeze=true`で、そのときの全違反を凍結し直すことはできる（`docs/userguide/008_The_Library_API.adoc` 行498–503、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L498-L503）。
  - #510で、新しい違反を凍結済みstoreへ足せないかという問いに対し、collaboratorは「`allowStoreUpdate`は解消時の自動縮小のためのもので、新しい違反を受け入れることは意図的に支えていない。前提は『今は悪いが、ここから良くなるだけ』である」と答えている。
  - #1264（open）は、索引にあるが実体のないfile、索引にないfile、空になったfile、削除されたtestの索引行が残ることを挙げ、storeの点検を求めている。collaboratorは追加を支持すると答え、対応するPR #1405（空のstoreをerrorにし、空fileを消す）と#1407（使われなくなった凍結ruleの掃除）はopenのままである。
- 解いている問題と前提：ruleごとに既知違反を分けて保存し、ruleが変わらない限り記録を引き継ぐ。ruleの説明文が安定していることが前提である。
- 必要な入力：ruleの説明文（一意であること）、store folderの場所、file名の決め方（`RuleViolationFileNameStrategy`。既定はランダムなUUID）。
- trade-off・失敗の仕方：説明文の変更が凍結のやり直しになるため、規則の文言を直すだけで、その時点の違反がすべて既知として受け入れられうる。使われなくなったruleの記録は自動では消えず、索引とfileの不整合は利用者が点検する（#1264）。
- 反例・適用しない場合：jQAssistantはruleのIDとclass名をrow keyに含める（P29-O06）。dependency-cruiserはrule名を違反の記録に含める（P29-O01）。deptracの記録はruleを含まない（P29-O03）。
- 互換・非互換：P29-O04の照合の前段である。P29-O02の`full` modeとは、新しい違反の受け入れを操作として持つかどうかで反対の側にある。
- 限界：openのissue・PRは固定commit時点の状態であり、後で変わりうる。

### P29-O06 最初の解析で報告しながらbaselineを作り、以後は既存の行だけを引き継ぐ（jQAssistantのbaseline管理）
- 出典：jqassistant、`core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/api/baseline/BaselineManager.java` 行18–29（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/api/baseline/BaselineManager.java#L18-L29）、行42–54（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/api/baseline/BaselineManager.java#L42-L54）、行56–93（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/api/baseline/BaselineManager.java#L56-L93）、`core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/api/configuration/Baseline.java` 行11–31（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/api/configuration/Baseline.java#L11-L31）、`core/report/src/main/java/com/buschmais/jqassistant/core/report/api/ReportHelper.java` 行116–140（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/report/src/main/java/com/buschmais/jqassistant/core/report/api/ReportHelper.java#L116-L140）、`manual/src/main/asciidoc/include/introduction.adoc` 行503–524（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/introduction.adoc#L503-L524）、行568–609（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/introduction.adoc#L568-L609）。信頼性ラベル：primary（GPL-3.0のため構造の観察だけ）。本文確認：済
- 何をしているか：
  - baseline管理は既定で無効で、設定で有効にする。対象は、constraintは既定で全件、conceptは既定で対象外である（設定interfaceの既定と、manual 行591、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/introduction.adoc#L591-L591。行607、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/introduction.adoc#L607-L607）。
  - `isExistingResult`の分岐は2つある。baseline fileがまだない場合、結果行を新しいbaselineへ足し、「既存ではない」（つまり報告する）と返す。baseline fileがある場合、その行が旧baselineにあれば新しいbaselineへ写して「既存」と返し、なければ新しいbaselineへ足さずに「既存ではない」と返す。
  - したがって、baselineができた後に現れた行は、baselineへ自動では入らない。旧baselineにあって今回現れなかった行は、新しいbaselineへ写されないため消える。`stop()`は新旧が異なるときだけfileを書く。manualは、消えた行はfileの更新としてVCSに現れ、手で行を消せば以後は抑止されないと書いている（行587–589、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/introduction.adoc#L587-L589）。
  - 行の同一性はrow keyで、ruleのclass名、rule ID、key列の名前と値を連ねた文字列のSHA-256である。key列を指定しなければ全列を使う。manualは、文脈情報の列を結果に含める場合にkey列を分けて指定する理由として、実行の間で行を一意に識別するためと書いている（行505–509、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/introduction.adoc#L505-L509）。
  - manualは、conceptをbaselineに含めると「既存のconceptの監視」になり、conceptの結果が消えたときにbaseline fileの更新としてVCSに現れると書いている（行607–609、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/introduction.adoc#L607-L609）。
- 解いている問題と前提：既存違反を抑止しつつ、新しい違反をbaselineへ紛れ込ませない。baseline fileをVCSに置き、変化をcommitの差分で見る前提である。
- 必要な入力：baseline file、対象にするconcept・constraintのfilter、各ruleのkey列。
- trade-off・失敗の仕方：
  - manualは、初回の解析で既存違反が報告されると書いている（行583、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/introduction.adoc#L583-L583）。初回はbaselineを作ると同時に失敗しうる。
  - 新しい違反をbaselineへ入れる操作は、今回読んだ範囲では、fileを消して初回からやり直す以外に見当たらなかった。
  - key列に揺れる値（行番号等）を含めると、同じ違反でも別の行になる。key列の選び方は利用者に委ねられている。
- 反例・適用しない場合：ArchUnitは初回を成功として凍結する（P29-O05）。dependency-cruiserは`full` modeで新しい違反もbaselineに入れられる（P29-O02）。
- 互換・非互換：P29-O07（suppression）と同じ「隠す」仕組みに合流し、P29-O08の件数の数え方に効く。conceptの監視は、P29-O13（依存graphの差分）とは別の形で、時間経過による構造の変化を記録に出す。
- 限界：GPL-3.0のため、構造の観察だけにした。XML schemaの中身は読んでいない。

### P29-O07 例外に期限と理由を付け、期限を過ぎると抑止しなくなる（jQAssistantの`@jQASuppress`）
- 出典：jqassistant、`core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AnalyzerContextImpl.java` 行81–98（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AnalyzerContextImpl.java#L81-L98）、行115–144（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AnalyzerContextImpl.java#L115-L144）、`core/report/src/main/java/com/buschmais/jqassistant/core/report/api/model/SuppressionDescriptor.java` 行8–30（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/report/src/main/java/com/buschmais/jqassistant/core/report/api/model/SuppressionDescriptor.java#L8-L30）、`plugin/java/src/main/asciidoc/scanner.adoc` 行681–715（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/plugin/java/src/main/asciidoc/scanner.adoc#L681-L715）。信頼性ラベル：primary（GPL-3.0のため構造の観察だけ）。本文確認：済
- 何をしているか：
  - Javaの要素（class、field、method等）に`@jQASuppress`を付けると、指定したrule IDの結果からその要素を抑止する。docsは、抑止は既定でruleの主列（primary column）に当たり、別の列を`column`で指定できると書いている。annotationは繰り返して付けられる。
  - 実装の条件はdocsの記述と少し異なる。rule IDが一致し、かつ「`column`で指定した列と一致する」または「主列と一致する」のどちらか（OR）で抑止が当たる（行121–124、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AnalyzerContextImpl.java#L121-L124）。`column`を指定しても、主列での一致による抑止は残る。また、抑止とbaselineの評価は、ruleが`report`を持つ場合（`rule.getReport() != null`）にだけ行われる（行82、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AnalyzerContextImpl.java#L82-L82）。
  - `reason`（理由）と`until`（期限の日付）を付けられる。`validateSuppressUntilDate`は、期限がなければ常に有効、期限があれば「期限が今日より後」の場合だけ有効とする。期限の当日以降は抑止されず、違反として数えられる。
  - 抑止が当たった行には、理由と期限がhidden情報として付く（行126–133、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AnalyzerContextImpl.java#L126-L133）。baselineに当たった行と同じ`Hidden`の構造に入る（行83–95、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AnalyzerContextImpl.java#L83-L95）。
- 解いている問題と前提：例外を、記録fileではなく違反している要素の近くに置き、理由と期限を一緒に残す。抑止の対象がcode上の要素として特定できることが前提である。
- 必要な入力：rule ID、対象の列（省略時は主列）、理由、期限の日付。
- trade-off・失敗の仕方：期限の比較はそのnodeの`LocalDate.now()`で行う（行141、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AnalyzerContextImpl.java#L141-L141）。期限が来ると、codeの変更がなくても解析の結果が変わる。期限の書式は年月日に固定されている（scanner.adoc 行706、https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/plugin/java/src/main/asciidoc/scanner.adoc#L706-L706）。期限や理由を必須にする設定は、今回読んだ範囲では見当たらなかった。
- 反例・適用しない場合：eslint-plugin-unicornは期限を日付以外（版、依存の有無）でも表し、日付の検査を既定で無効にしている（P29-O12）。bettererのdeadlineは期限切れを警告に留める（P29-O11）。dependency-cruiser、deptrac、ArchUnitの既知違反の記録には、期限の欄が見当たらなかった。
- 互換・非互換：P29-O06のbaselineと同じhiddenの仕組みに合流する（P29-O08）。
- 限界：期限の値は持ち込まない。annotationはJava pluginの機能で、他の言語のpluginは読んでいない。

### P29-O08 rule側の重大度と、失敗・警告にする閾値を分け、隠した行を別に数える（jQAssistantの`fail-on-severity`）
- 出典：jqassistant、`manual/src/main/asciidoc/include/configuration.adoc` 行197–218（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/configuration.adoc#L197-L218）、行270–283（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/manual/src/main/asciidoc/include/configuration.adoc#L270-L283）、`core/report/src/main/java/com/buschmais/jqassistant/core/report/api/model/Row.java` 行30–38（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/report/src/main/java/com/buschmais/jqassistant/core/report/api/model/Row.java#L30-L38）、`core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/RowCountVerificationStrategy.java` 行25–37（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/RowCountVerificationStrategy.java#L25-L37）、`core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AbstractMinMaxVerificationStrategy.java` 行11–25（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/analysis/src/main/java/com/buschmais/jqassistant/core/analysis/impl/AbstractMinMaxVerificationStrategy.java#L11-L25）、`core/report/src/main/java/com/buschmais/jqassistant/core/report/impl/XmlReportPlugin.java` 行263–269（https://github.com/jQAssistant/jqassistant/blob/5ada015c2e789cf2fd9a01ce1729b13a52dec562/core/report/src/main/java/com/buschmais/jqassistant/core/report/impl/XmlReportPlugin.java#L263-L269）。信頼性ラベル：primary（GPL-3.0のため構造の観察だけ）。本文確認：済
- 何をしているか：
  - ruleはconcept・constraint・groupごとに重大度を持ち、明示しない場合の既定の重大度を種類ごとに設定できる。報告側は「この重大度以上を警告にする」「この重大度以上を失敗にする」の2つの閾値と、失敗があってもbuildを続けるかどうか（`continue-on-failure`）を別に持つ。閾値は段階名で指定し、「失敗にしない」を表す値もある。
  - `Row.isHidden()`は、抑止（P29-O07）かbaseline（P29-O06）のどちらかが当たった行を隠れた行とする。行数による検証は、隠れていない行だけを`rowCount`に、隠れた行を`hiddenRowCount`に数える。成否は`rowCount`だけで決まる（min・max未指定のconstraintは「行がないこと」、conceptは「行があること」）。XML reportは`rowCount`と`hiddenRowCount`を両方書き出す。
- 解いている問題と前提：同じrule集合を、どの重大度からCIを止めるかの方針と切り離して運用する。隠した違反を消さずに件数として残す。
- 必要な入力：各ruleの重大度、警告と失敗の閾値、buildを止めるかどうか。
- trade-off・失敗の仕方：閾値の設定ひとつで、同じruleがCIを止めたり止めなかったりする。隠した行の件数はreportに出るが、その件数が増えたことで失敗させる仕組みは、今回読んだ範囲では見当たらなかった（件数の推移を見るのは利用者の側になる）。
- 反例・適用しない場合：dependency-cruiserはrule側のseverityが`error`のときに一部のreporterが非0で終わる（`doc/rules-reference.md` 行279–294、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/rules-reference.md#L279-L294）。既知違反は重大度を`ignore`へ下げて表す（P29-O01）。bettererは重大度を持たず、測定値の良し悪しで止める（P29-O09）。
- 互換・非互換：P29-O06・O07の出口になる。
- 限界：段階名と既定の段階はこのrepo固有であり、HELIXへ持ち込まない。

### P29-O09 任意の測定値を「悪化で失敗、改善で記録更新」にし、CIでは記録とのずれ自体を失敗にする（betterer）
- 出典：betterer、`website/docs/introduction.md` 行17–47（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/website/docs/introduction.md#L17-L47）、`website/docs/workflow.md` 行7–17（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/website/docs/workflow.md#L7-L17）、`website/docs/updating-results.md` 行8–39（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/website/docs/updating-results.md#L8-L39）、`website/docs/running-betterer.md` 行122–148（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/website/docs/running-betterer.md#L122-L148）、`packages/betterer/src/config/config.ts` 行184–225（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/config/config.ts#L184-L225）、`packages/cli/src/ci.ts` 行37–46（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/cli/src/ci.ts#L37-L46）、`packages/cli/src/start.ts` 行40–49（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/cli/src/start.ts#L40-L49）、`packages/betterer/src/results/results-file.ts` 行30–43（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/results/results-file.ts#L30-L43）、`packages/betterer/src/context/context.ts` 行161–171（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/context/context.ts#L161-L171）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - testは、測定する関数、比較の向き（constraint。例：小さいほど良い）、目標（goal）を持つ。docsは、snapshot testの考えを元に、固定値ではなく時間とともに変わる値を追い、望む向きに変わることを確かめると説明している。結果はresults fileに保存し、commitする。
  - 通常の実行（start）は、改善すればresults fileを更新し、悪化すれば失敗する。CLIは悪化（worse）または実行失敗があると非0で終わる。悪化を受け入れるには`--update`で強制更新する。docsは、悪化のときに強制更新の方法を表示し、`--strict`でその表示を消すと書いている。
  - CI mode（`betterer ci`）は、strictにし、updateを無効にし、results fileを書き込まない（`context.ts`はci以外のときだけresults fileを書く）。CLIは`changed`（記録にあるのに走らなかったtest、記録と出力が異なるtest、新しいtestのうちgoalに達していないもの、悪化したtest）が1件でもあれば非0で終わる。新しいtestでもgoalに達していれば`changed`に入らない（`results-file.ts` 行38–40、https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/results/results-file.ts#L38-L40）。docsは、CIでの差は「commitされた記録がcodeの実態を映していない」ことを意味すると説明している。改善も記録との差として失敗になる。
  - modeは排他的に正規化される（ci、precommit、strict、update、watchの順に判定し、他のflagを上書きする）。watch modeもstrictを立てる（`config.ts` 行221、https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/config/config.ts#L221-L221）。workflowのdocsは、pre-commitでprecommit modeを、build serverでci modeを使うことを推奨している。
- 解いている問題と前提：大きな改善を、長いbranchや忘れられる口約束ではなく、記録された値の単調な変化で進める（introduction 行10–15、https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/website/docs/introduction.md#L10-L15）。測定値に「良い向き」があり、比較できることが前提である。
- 必要な入力：測定関数、比較の向き、目標（任意）、results file。
- trade-off・失敗の仕方：
  - CI modeでは改善もcommit漏れとして失敗になるため、開発者は改善のたびにresults fileを更新してcommitする必要がある。
  - 強制更新（`-u`）は悪化を記録に入れる。docsは、急いで出荷する必要がある場合に使うと書いている。
  - results fileはmerge conflictを起こしやすく、`merge` commandと実験的な自動mergeを用意している（`results-file.md` 行52–97、https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/website/docs/results-file.md#L52-L97）。
- 反例・適用しない場合：ArchUnitは新しい違反の差分だけを記録へ足す操作を持たない。ただし`freeze.refreeze=true`で、そのときの全違反を凍結し直すことはできる（`docs/userguide/008_The_Library_API.adoc` 行498–503、https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L498-L503）（P29-O05）。dependency-cruiserは記録の更新をmodeとして利用者のcommandに置く（P29-O02）。
- 互換・非互換：P29-O10（違反の集合を値にするfile test）、P29-O11（deadline）と組み合わさる。
- 限界：worker数、cache等の数値の既定は持ち込まない。

### P29-O10 違反の集合を値にするratchetで、fileとissueの「移動」をhashで追い、1件でも新しい違反があれば悪化とする（bettererのfile test）
- 出典：betterer、`website/docs/results-file.md` 行28–50（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/website/docs/results-file.md#L28-L50）、`packages/betterer/src/test/file-test/differ.ts` 行18–58（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/test/file-test/differ.ts#L18-L58）、行72–135（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/test/file-test/differ.ts#L72-L135）、`packages/betterer/src/test/file-test/constraint.ts` 行7–29（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/test/file-test/constraint.ts#L7-L29）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - file testの結果は、「相対path:fileのhash」ごとに、issueの行・列・長さ・message・issueのhashを並べたものである。docsは、fileのhashとissueのhashは、行が変わったりfileが移動したりしてもissueを追うために使い、頻繁に変わると注意している。
  - `differ`は、同じpathのfileを、hashが同じもの（未変更）と異なるもの（変更）に分ける。pathが消えたfileと新しく現れたfileは、hashが一致すれば移動とみなす（複数候補があれば最初の1件だけを移動とする）。
  - 既存のfileの中では、行・列・長さ・hashがすべて一致するissueを未変更とし、残りをissueのhashで突き合わせる。同じhashの候補が複数あれば、元の位置に近いものを移動先に選び、候補がなければ修正済みとする。
  - `constraint`は、新しいissueが1件でもあれば悪化、新しいissueがなく修正済みがあれば改善、どちらもなければ同じ、と判定する。修正と追加を相殺しない。
- 解いている問題と前提：違反の件数ではなく、どの違反が新しいかで悪化を判定する。codeの移動・行のずれで誤って悪化と判定しない。
- 必要な入力：issueを出す検査（lint、型検査、正規表現等）、fileとissueのhash。
- trade-off・失敗の仕方：件数が減っていても、新しい違反が1件あれば悪化になる。issueのhashが同じ違反が複数ある場合、位置の近さで対応を決めるため、どれが新しいかの判定は近似である（コードからの読み取り）。
- 反例・適用しない場合：ArchUnitは行番号を除いた文字列で突き合わせる（P29-O04）。dependency-cruiserはrule名とmodule pathで突き合わせ、位置を持たない（P29-O01）。
- 互換・非互換：P29-O09の値の型の一つである。依存規則の検査器の出力をfile testにする例は、今回読んだ範囲では見当たらなかった。
- 限界：hashの算法は読んでいない。

### P29-O11 改善の目標に期限を付けるが、期限切れは警告に留める（bettererのdeadline）
- 出典：betterer、`website/docs/tests.md` 行244–246（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/website/docs/tests.md#L244-L246）、`packages/betterer/src/test/types.ts` 行35–39（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/test/types.ts#L35-L39）、`packages/betterer/src/test/config.ts` 行57–66（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/test/config.ts#L57-L66）、`packages/betterer/src/run/worker-run.ts` 行164–166（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/run/worker-run.ts#L164-L166）、`packages/reporter/src/components/suite/tasks.ts` 行38–40（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/reporter/src/components/suite/tasks.ts#L38-L40）、`packages/cli/src/start.ts` 行40–49（https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/cli/src/start.ts#L40-L49）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - testに`deadline`（Dateまたは日付文字列）を付けられる。`createDeadline`は、未指定または解釈できない値なら期限なしとして扱う。実行時刻が期限以降なら`isExpired`になる。
  - 既定のreporterは、期限切れのtestについて警告を出す。suiteの集計に`expired`の一覧がある。
  - CLIの終了codeは、start modeでは悪化と実行失敗、ci modeでは`changed`と実行失敗で決まり、`expired`は条件に入っていない（P29-O09の出典）。期限切れだけでは失敗しない。
  - 目標（goal）に達したtestは`isComplete`になる。file testで、かつci modeでない場合に限り、goal到達時にcacheを消す（`worker-run.ts` 行174–176、https://github.com/phenomnomnominal/betterer/blob/69a83c14975b6ef2e4e42736e686ffba0f28895f/packages/betterer/src/run/worker-run.ts#L174-L176）。
- 解いている問題と前提：段階的な改善に「いつまでに」を付け、遅れを見えるようにする。期限切れでbuildを止めるかどうかは、このrepoでは止めない側にある。
- 必要な入力：期限の日付、目標。
- trade-off・失敗の仕方：期限切れは警告だけなので、CIのlogを読む人がいなければ見過ごされうる。日付の解釈に失敗すると黙って期限なしになる（`createDeadline`）。
- 反例・適用しない場合：jQAssistantの抑止は期限が来ると違反として数え直し、閾値次第でbuildを止める（P29-O07、O08）。eslint-plugin-unicornは期限の到来をlintの報告にする（P29-O12）。
- 互換・非互換：P29-O09・O10と組み合わさる。
- 限界：期限の値は持ち込まない。

### P29-O12 例外に「日付・版・依存の有無」の失効条件を付け、日付の検査は既定で切り、PRでは検査しない（eslint-plugin-unicornの`expiring-todo-comments`）
- 出典：eslint-plugin-unicorn、`docs/rules/expiring-todo-comments.md` 行10–49（https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/docs/rules/expiring-todo-comments.md#L10-L49）、行337–356（https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/docs/rules/expiring-todo-comments.md#L337-L356）、行430–437（https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/docs/rules/expiring-todo-comments.md#L430-L437）、`rules/expiring-todo-comments.js` 行293–299（https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/rules/expiring-todo-comments.js#L293-L299）、行351–356（https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/rules/expiring-todo-comments.js#L351-L356）、行436–466（https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/rules/expiring-todo-comments.js#L436-L466）。issue：sindresorhus/eslint-plugin-unicorn#1207（https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1207、closed）、#1462（https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1462、closed）。PR：#2892（https://github.com/sindresorhus/eslint-plugin-unicorn/pull/2892）、#3044（https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3044）、#3045（https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3045）（題名とmerge済みであることだけを確認）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - TODO・FIXME・XXXのcommentに、日付、自package.jsonの版、`engines`の版、依存packageの追加・削除、依存packageの版、peer依存の下限の版、を失効条件として書ける。条件を満たすとlintが報告する。docsは、TODOが忘れられることへの対策として、最初から寿命を定義する、と書いている。
  - 同じTODOに複数の日付や複数の自package版を書くと、それ自体を不正として報告する（docs 行49、https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/docs/rules/expiring-todo-comments.md#L49-L49。docs 行63、https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/docs/rules/expiring-todo-comments.md#L63-L63。code 行436–440、https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/rules/expiring-todo-comments.js#L436-L440。code 行451–457、https://github.com/sindresorhus/eslint-plugin-unicorn/blob/5c4808ba0b4df09b21098c9a84ce748f436894ff/rules/expiring-todo-comments.js#L451-L457）。
  - 日付の検査は既定で無効（`checkDates`）である。有効にしても、CI上のpull requestでは既定で日付を検査しない（`checkDatesOnPullRequests`）。判定は`checkDates && (checkDatesOnPullRequests || !ci.isPR)`である。docsは、PRで日付による失効を報告すると、貢献者のcodeが無関係な理由でlintに落ちる誤検出になり、直す責任は貢献者ではなく保守者にある、と理由を書いている。基準日は既定で実行日で、`date` optionで変えられる。
  - #1207は「設定した日付に自動でlintが落ち始めるのは一般に望まない」として、recommended設定での扱いを問題にした。ownerは、package・依存・engineの版のような「projectの状態の変化」を条件にする部分は残しつつ、暦の日付が変わっただけでCIが落ちる場合を避けるべきだと返している。別の参加者は、規則を「hardな条件（errorにするもの）」と「日付の示唆（warnにするもの）」に分けるべきだと提案し、ownerは警告だけのruleは持たないと答えている。
  - #1462は、PRの判定に使うCI環境の検出が、`push`だけで動く私的repoのbuildではPRを判別できず、月初などに無関係なPRのlintが落ちたと報告し、日付検査を無効にするoptionの追加につながった。
- 解いている問題と前提：例外（TODO）の寿命を、日付だけでなく、codeやdependencyの状態の変化で表す。commentの書式を守ることが前提である。
- 必要な入力：失効条件（日付、版、依存）、基準日、PRかどうかの判別。
- trade-off・失敗の仕方：日付で失効させると、codeを変えていないcommitでもCIが落ちる（#1207）。PRかどうかの判別がCI環境の検出に依存し、誤ると無関係なPRが落ちる（#1462）。状態の変化（版、依存）を条件にすると、その変化を起こしたcommitで報告が出る。
- 反例・適用しない場合：jQAssistantの抑止は日付だけを期限にし、検査を既定で切る設定は見当たらなかった（P29-O07）。bettererは期限切れを警告に留める（P29-O11）。
- 互換・非互換：依存規則の例外そのものではなくTODO commentの機構である。P29-O01〜O06の既知違反の記録に期限の欄がない点を補う形の候補として並べた（組み合わせた実例は見つけていない）。
- 限界：issueのcommentはowner・collaboratorの意見であり、規則の確定ではない。PR #3044・#3045の順序と内容は題名以上を読んでいない。#3044の題名（「`ignoreDates`の既定をfalseにする」）と、固定commitで`checkDates`の既定が無効（日付を検査しない）であることの向きの関係は未確認である。固定commitの既定の挙動だけを事実として書いた。

### P29-O13 依存graphを「基準revisionから変わったmoduleと、それに届くmodule」に絞ってPRごとに描く（dependency-cruiserの`--affected`とCI）
- 出典：dependency-cruiser、`doc/cli.md` 行1022–1059（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L1022-L1059）、`.github/workflows/ci.yml` 行75–76（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/.github/workflows/ci.yml#L75-L76）、行80–102（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/.github/workflows/ci.yml#L80-L102）、`package.json` 行163（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/package.json#L163-L163）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `--affected <revision>`は、指定したgit revision以降に変わったmoduleと、それらに直接・間接に依存するmoduleだけをgraphに含める。revisionを省略した場合の既定は`main`という名前である（行1028、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L1028-L1028）。repositoryの既定branchを読み取るわけではない。docsは、これが`--reaches`と、変更されたmoduleの正規表現を作る外部toolの組合せと同じだと書いている。
  - 自repoのCIは、「forbidden dependency check」の段で`--ignore-known`付きの検査を実行し、失敗すればjobを止める。その後、常に（`always()`）検査結果をmarkdownでstep summaryへ出す。default branchへのpushでは、`src/`に絞りfolder単位へ畳むoption（`--include-only`、`--collapse`）を付けたgraphを（`package.json` 行162、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/package.json#L162-L162。全体のgraphではない）、PRではbase SHAからの`--affected` graphを、mermaidでstep summaryへ出す。
- 解いている問題と前提：依存構造の変化を、PRごとに「この変更がどこへ波及するか」として見せる。git履歴が取れることが前提である。
- 必要な入力：基準revision（PRのbase SHA等）、graphの出力形式。
- trade-off・失敗の仕方：比較は「基準revision」と「今」の2点だけで、複数時点の系列を保存して推移を見る仕組みではない。graphは変更されたmoduleとその依存元を示すが、依存の向きが逆流したか（規則に反する新しい辺か）は、別の段の規則検査が判定する。
- 反例・適用しない場合：jQAssistantはconceptをbaselineに含め、構造の消失をVCSの差分として出す（P29-O06）。bettererは値の系列を記録fileのcommit履歴として残す（P29-O09）。
- 互換・非互換：P29-O01（既知違反の緩和）の後段で可視化として並ぶ。
- 限界：外部tool（変更moduleの抽出）は読んでいない。

### P29-O14 依存の向きを絶対値の閾値ではなく「依存先の方が不安定か」という相対比較で規則にする（dependency-cruiserの`moreUnstable`）
- 出典：dependency-cruiser、`doc/rules-reference.md` 行1224–1282（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/rules-reference.md#L1224-L1282）、行299–320（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/rules-reference.md#L299-L320）、行261–264（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/rules-reference.md#L261-L264）、行279–294（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/rules-reference.md#L279-L294）、`doc/cli.md` 行580–602（https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/cli.md#L580-L602）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `to.moreUnstable: true`は、依存先のInstability（出ていく依存 ÷（入ってくる依存＋出ていく依存））が依存元より高い依存に当たる。docsは、Martinの安定依存の原則（安定な方向へ依存する）を検査する規則の例として、これを`forbidden`に置く形を示している。
  - `scope: folder`を付けると、moduleではなくfolder単位で同じ比較をする。docsは、moduleとしては不安定でもfolderとしては安定な場合（barrel file等）があるため、Instabilityと循環の規則ではscopeが結果を変えると書いている。folder scopeで動く属性は一部に限られる（行315–320、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/rules-reference.md#L315-L320）。
  - 既知違反の種類に`instability`があり（P29-O01）、この規則の違反もbaselineで凍結できる。ただしfolder単位の違反は既知違反の緩和の対象外である（P29-O01のTODO）。
  - `metrics` reporterは、moduleとfolderごとにCa・Ce・Instabilityを表で出す。docsは、Instabilityは悪いことではなく性質であり、CLIやGUIは不安定で当然だと書いている。
  - ruleには`comment`欄があり、ruleの存在理由を書く場所だが、規則の判定には使われない。`severity`を`ignore`にすると規則を検査しない。docsは、一時的に規則を無効にする用途を挙げている。
- 解いている問題と前提：依存の逆流（安定なmoduleが不安定なmoduleへ依存する）を、閾値を決めずに検出する。依存の数でmoduleの安定性を近似できることが前提である。
- 必要な入力：依存graph、scope（moduleかfolderか）。
- trade-off・失敗の仕方：docsは、Martinの「metricは神ではなく、恣意的な基準に対する測定にすぎない」という引用を添えている（行1276–1282、https://github.com/sverweij/dependency-cruiser/blob/a210586ea2a3c0501153e4a39925cee325fe0b3f/doc/rules-reference.md#L1276-L1282）。依存の数による近似なので、変更頻度の実測とは一致しない。folder単位の違反は既知違反として凍結できない。`severity: ignore`による一時無効化には、期限や理由を必須にする欄がない（`comment`は任意）。
- 反例・適用しない場合：P18-O10で読んだArchUnitのmetricsは値を計算するが、規則としての相対比較は今回読んだ範囲では見当たらなかった。jQAssistantはgraph queryでrule自体を書くため、同じ比較を利用者がqueryとして書くことになる（今回は例を読んでいない）。
- 互換・非互換：P29-O01・O02（既知違反の凍結）と組み合わせて、既存の逆流を凍結し新しい逆流だけを止める形になる。
- 限界：Instabilityの値の閾値は持ち込まない。docsが挙げる定義は原典の引用であり、本書の判断ではない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 既知違反の記録の置き場 | dependency-cruiser：専用のJSON file（O01・O02）。ArchUnit：rule説明文をkeyにした索引と、ruleごとの違反file（O05） | deptrac：設定の`skip_violations`節を別fileに分けて`imports`（O03）。jQAssistant：XMLのbaseline file＋要素に付けるannotation（O06・O07） | 記録をtoolの設定の一部として読むか、独立した記録として読むか。例外を要素の近くに置くか |
| 違反の同一性 | dependency-cruiser：rule名＋from／to（循環・viaは集合）。moduleの違反はfrom＋rule名だけ（O01） | ArchUnit：行番号と自動生成番号を除いた文字列（O04）。jQAssistant：rule ID＋key列のhash（O06）。deptrac：tokenの組でruleを含まない（O03）。betterer：file・issueのhashと位置（O10） | 違反を構造化された組として持つか、文字列として持つか。codeの移動・行のずれをどこまで同一視するか |
| 新しい違反を記録へ入れる操作 | dependency-cruiser：`full` modeで入る、`shrink-only`で入らない（O02）。deptrac：formatterの全置換で入る（O03）。betterer：`-u`で強制更新（O09） | ArchUnit：差分だけを足す操作は意図的に持たない（#510）。`freeze.refreeze=true`で全体を凍結し直せる。説明文の変更でも、更新が許可されていれば実質的に再凍結になる（O05）。jQAssistant：baselineがある間は入らない（O06） | 例外の追加を操作として認めるか。認めるなら誰がどのcommandで行うか |
| 解消した記録の扱い | ArchUnit・jQAssistant：自動で記録から外す（O04・O06） | deptrac：一致しない例外をerrorにして失敗させる（O03）。dependency-cruiser：`stale`として数え、`--baseline`で外す（O02） | 記録の減少を自動にするか、人が記録を書き換えてreviewに出すか |
| 例外の期限 | jQAssistant：`until`を過ぎると抑止しない（O07）。eslint-plugin-unicorn：日付・版・依存で失効し、日付は既定で検査しない（O12） | betterer：deadline切れは警告だけ（O11）。dependency-cruiser・deptrac・ArchUnit：記録に期限の欄なし | 暦の日付でCIが落ちることを許すか。期限を日付以外の状態変化で表すか |
| CIへの置き方 | betterer：ci modeは記録とのずれ自体を失敗にし、記録を書かない（O09）。jQAssistant：重大度と失敗閾値を分け、隠した行を別に数える（O08） | dependency-cruiser：`--ignore-known`付きの検査を失敗段に、graphはstep summaryへ（O13）。deptrac：違反・errorで失敗、未分類の依存は指定時だけ失敗（`docs/concepts.md` 行229–230、https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/docs/concepts.md#L229-L230） | 記録の更新を開発者の手元に置くかCIに置くか。改善のcommit漏れも失敗にするか |
| 時間経過の比較 | dependency-cruiser：基準revisionと今の2点の依存graph（O13） | betterer：記録fileのcommit履歴が値の系列になる（O09）。jQAssistant：conceptのbaselineの差分で構造の消失を出す（O06） | 系列を専用に保存するか、VCSの履歴に任せるか |
| 依存の逆流の検出 | dependency-cruiser：`moreUnstable`の相対比較（O14） | その他：layerの許可・禁止で表す（P18で観察） | 閾値を持たずに向きを判定できる量があるか |

## 見つからなかったこと・gap
- 依存graphやmetricsを複数時点で保存し、推移（侵食の速度）を示す仕組みは、6 repoとも組込みでは見当たらなかった。時間の比較は「記録と今」「基準revisionと今」の2点の比較で、系列はVCSの履歴に委ねられている（O09、O13）。
- 既知違反の記録そのもの（baseline、`skip_violations`、ArchUnitのstore）に、期限、理由、責任者を持たせる欄は見当たらなかった。期限と理由を持つのはjQAssistantの要素単位のsuppression（O07）と、TODO commentの機構（O12）、改善目標のdeadline（O11）だけである。
- 「退化のpattern」（どの種類の侵食がどの順で起きるか）を記述した設計文書・ADRは、6 repoとも見つからなかった。各toolは検出の仕組みを持つが、侵食の型の分類は持たない。
- ArchUnitの凍結storeの点検（使われなくなったrule、空のfile、索引との不整合）は未解決で、対応PRはopenである（#1264、#1405、#1407）。
- dependency-cruiserのfolder単位の違反は既知違反として緩和されない（TODO comment）。folder単位で凍結したい場合の手段は確認できなかった。
- deptracで、baseline formatterを`shrink-only`のように「減らすだけ」で動かすoptionは、今回読んだdocsとformatterには見当たらなかった。
- jQAssistantで、baselineがある状態から新しい違反をbaselineへ足す操作（fileの削除以外）は確認できなかった。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repoを作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し、固定commitをcheckout（core.hooksPathを無効化）。読むだけで、build・test・script・hook・package managerは実行していない。metadataとissue・PRは `gh api` で取得した（約20回）。
- dependency-cruiser：`doc/cli.md`（目次、575–632、832–920、1004–1060）、`doc/rules-reference.md`（見出し、261–321、1224–1283）、`src/analyze/soften-known-violations.mjs`（全体）、`src/analyze/summarize/is-same-violation.mjs`（全体）、`src/report/baseline.mjs`（全体）、`src/graph-utl/compare.mjs`（145–175）、`.github/workflows/ci.yml`（70–102）、`package.json`（80–83、148–163）、`.dependency-cruiser-known-violations.json`（冒頭）。読んでいないもの：`bin/depcruise-baseline.mjs`、cacheの実装、`--reaches`の実装、metricsの計算の実装、`src/schema/baseline-violations.schema.mjs`。
- deptrac：`docs/concepts.md`（215–326）、`docs/configuration.md`（265–310）、`docs/formatters.md`（1–40、437–446）、`src/Contract/Analyser/EventHelper.php`（全体）、`src/DefaultBehavior/Analyser/UnmatchedSkippedViolations.php`（全体）、`src/Supportive/Console/Command/AnalyseRunner.php`（30–80）、`src/DefaultBehavior/OutputFormatter/BaselineOutputFormatter.php`（全体）、`deptrac.php`（20–30）、`deptrac.baseline.yaml`（冒頭）、`.github/workflows/`の一覧と`build.yml`のdeptrac実行行、`Makefile`（deptrac target）。読んでいないもの：`BaselineMapperInterface`の実装、layer collector、`docs/blog`、`docs/upgrade.md`。
- ArchUnit：`archunit/src/main/java/com/tngtech/archunit/library/freeze/`の`FreezingArchRule.java`（全体）、`ViolationLineMatcherFactory.java`（全体）、`TextFileBasedViolationStore.java`（全体）、`archunit/src/main/java/com/tngtech/archunit/lang/ArchRule.java`（128–180）、`docs/userguide/008_The_Library_API.adoc`（436–567。436–503はP18と同じ範囲で、本書では引いていない）。issue #510、#1264（本文とcomment）、#252、#181、#902、#1654（題名のみ）。PR #1405、#1407（状態のみ）。読んでいないもの：`ViolationStoreFactory.java`の本体、`ViolationStore.java`のjavadoc。
- jqassistant：`core/analysis/.../api/baseline/BaselineManager.java`（全体）、`BaselineRepository.java`（36–56）、`Baseline.java`（冒頭）、`core/analysis/.../api/configuration/Baseline.java`（全体）、`core/report/.../api/ReportHelper.java`（109、115–150）、`core/analysis/.../impl/AnalyzerContextImpl.java`（60–170）、`RowCountVerificationStrategy.java`（20–37）、`AbstractMinMaxVerificationStrategy.java`（8–25）、`core/report/.../model/Row.java`（25–39）、`SuppressionDescriptor.java`（全体）、`core/report/.../impl/XmlReportPlugin.java`（262–270）、`manual/.../introduction.adoc`（490–610）、`manual/.../configuration.adoc`（196–290）、`plugin/java/src/main/asciidoc/scanner.adoc`（678–716）、`plugin/java/release-notes.adoc`（suppressの行のgrep結果）。読んでいないもの：baselineのXML schema、`maven/src/it/analyze/baseline`の統合test、`AggregationVerificationStrategy`の全体、arc42の設計文書。
- betterer：`website/docs/introduction.md`、`results-file.md`、`workflow.md`、`updating-results.md`、`running-betterer.md`（全体）、`tests.md`（180–290）、`packages/betterer/src/config/config.ts`（140–225）、`config/types.ts`（105–175のgrep結果）、`run/worker-run.ts`（140–200）、`context/context.ts`（150–182）、`suite/suite-summary.ts`（全体）、`results/results-file.ts`（30–50）、`test/config.ts`（55–72）、`test/types.ts`（30–40）、`test/file-test/differ.ts`（1–140）、`test/file-test/constraint.ts`（全体）、`packages/cli/src/ci.ts`（20–50）、`start.ts`（38–50）、`packages/reporter/src/components/suite/tasks.ts`（30–50）。読んでいないもの：hasherの算法、`merge`の実装、eslint・typescript・regexp等の個別test package。
- eslint-plugin-unicorn：`docs/rules/expiring-todo-comments.md`（全体）、`rules/expiring-todo-comments.js`（290–360、436–480、620–635のgrep結果）。issue #1207、#1462（本文とcomment）、PR #2892、#3044、#3045（題名・状態のみ）。読んでいないもの：testの全体、他のrule。
- 検索した語：`baseline`, `known-violations`, `ignore-known`, `skip_violations`, `unmatched`, `freeze`, `refreeze`, `stored.rules`, `lineMatcher`, `suppress`, `until`, `deadline`, `expired`, `checkDates`, `isPR`, `moreUnstable`, `affected`, `fail-on-severity`, `hidden`。GitHub issue検索：「FreezingArchRule description changed」「freeze stored.rules」（ArchUnit）。
- 選ばなかった候補：qossmic/deptrac（GitHub APIで`opensoftwareconsulting/deptrac`へ転送され、archived: true。現行の`deptrac/deptrac`を読んだ）。sbt系は指示により対象外。packwerk・import-linter・nxはP18で読んだため対象外にした。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。コードからの読み取り（O01の照合の粒度、O04の集合による除外、O05の説明文の変更による再凍結、O10の位置による近似）は、issueでの報告を確認していない推論を含み、各観察で「コードからの読み取り」と区別した。issue commentはowner・collaboratorの意見であり、設計文書と同列には扱えない。openのPR（#1405、#1407）の扱い（未採用の案とするか検討中とするか）は未決。
- scope：観察は依存規則・構造規則の検査器と、汎用のratchet・期限付きTODOに限っている。D01の「退化を時間経過で見る知識」に、どこまで（検出の仕組み、記録の形、例外の期限、CIの置き方）を含めるかは未決。D02（P18）の境界の宣言との分担も未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。ArchUnitはP18と同じcommitで、同じfileの別の範囲を読んだ。eslint-plugin-unicornの日付検査の既定はPR #3044・#3045の前後で変わった可能性があり、固定commitの値だけを根拠にした。再観察の要否は未決。
- 状態：全観察（P29-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
