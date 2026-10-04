# P18 moduleの分割・統合の判断とbounded context間の関係の観察（D02 Application Architecture）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

埋めようとしたgap（SCF-B-0155、D02 §4）：「moduleの凝集・結合をどう測り、いつ分割・統合するかの判断」「bounded context間の関係（共有kernel、腐敗防止層等）」。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| Shopify/packwerk | https://github.com/Shopify/packwerk | 31e534283f93a225b520cddab3c2d735557c76de（default branch: main） | MIT | false | 2026-10-05 | Rails monolithの中でpackageの境界と依存を宣言し、既存違反の記録（package_todo）、strict mode、公開APIの検査を本体から外した経緯（3.0）まで、境界の導入と運用を読めるため |
| seddonym/import-linter | https://github.com/seddonym/import-linter | 31927f1457e3df673912cb5efb0afa6dbc37585f（main） | BSD-2-Clause | false | 2026-10-05 | Pythonのimport graphに対して、layers、forbidden、protected、independence、acyclic siblingsという「契約の型」を宣言的に並べる構成で、間接importも検査するため |
| nrwl/nx | https://github.com/nrwl/nx | ead04276f840b920ffab97eb3f809fef2baf130b（master） | MIT | false | 2026-10-05 | monorepoのproject単位にtagを付け、複数の次元（scope、type）のtagの組合せで依存の向きを制約するlint ruleを持つため。sparse checkoutで該当pathだけを取得した |
| TNG/ArchUnit | https://github.com/TNG/ArchUnit | 74237315efc53279bda634e818977d41f64a1bd4（main） | Apache-2.0 | false | 2026-10-05 | layered／onion architectureの宣言、annotationによるmoduleのallowedDependencies・exposedPackages、PlantUML図をruleにする機能、既存違反の凍結、結合と可視性のmetricsを1つのlibraryに持つため |
| ContextMapper/context-mapper-dsl | https://github.com/ContextMapper/context-mapper-dsl | 995f486a9cdecb6946257d5c7b6d98ada2978124（master） | Apache-2.0 | false | 2026-10-05 | bounded context間の関係の型（Partnership、Shared Kernel、Upstream-Downstream、Customer-Supplier、OHS／PL／ACL／CF）を文法とvalidatorで表し、分割・統合をarchitectural refactoringとして実装しているため |
| ddd-crew/context-mapping | https://github.com/ddd-crew/context-mapping | 6362f2793fd57e8d6e0dc78ed1dbf797ce5aa6c8（main） | CC-BY-SA-4.0（READMEの末尾はCC BY 4.0と記載。LICENCE.mdの冒頭は「Attribution-ShareAlike 4.0 International」） | false | 2026-10-05 | context mapの関係の型とteam relationshipを一覧にした公開教材。コードではなくpatternの定義と使い方の助言を持つ。share-alikeのため構造の観察だけにした |

（P01でspring-projects/spring-modulithとddd-by-examples/libraryのArchUnit規則を観察済みである。本書はP01と重ならないように、別のrepositoryと、P01が扱っていない観点（既存違反の記録、契約の型、tagの多次元、関係の型、分割・統合の操作、metrics）を選んだ。）

すべて作業用の一時領域へ`git clone --filter=blob:none --no-checkout`（`core.hooksPath`を無効化）し、上の固定commitを`git checkout`した。どのrepoでもコード、script、test、build、installは実行していない。

## 観察

### P18-O01 package単位の依存の宣言と、宣言の外への参照を違反とする検査（packwerk）
- 出典：packwerk、`USAGE.md` 行113–121（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/USAGE.md#L113-L121）、125–164（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/USAGE.md#L125-L164）、`lib/packwerk/reference_checking/checkers/dependency_checker.rb` 行19–26（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/lib/packwerk/reference_checking/checkers/dependency_checker.rb#L19-L26）、`lib/packwerk/validators/dependency_validator.rb` 行11–19（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/lib/packwerk/validators/dependency_validator.rb#L11-L19）、65–90（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/lib/packwerk/validators/dependency_validator.rb#L65-L90）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - 任意のfolderに`package.yml`を置くとpackageになり、package名はrootからのpathになる。`enforce_dependencies`を有効にしたpackageは、`dependencies:`に列挙したpackageと自分自身以外の定数を参照すると違反になる。
  - `DependencyChecker#invalid_reference?`は、参照元packageが検査を有効にしていない場合と、参照先packageが宣言済みの依存である場合を除いて違反とする。判定は参照元packageの宣言だけを見る。
  - `bin/packwerk validate`は、manifestの構文、宣言された依存graphが非循環であること、依存先が実在するpackageであること、の3つを検査する（`DependencyValidator#call`）。`check`（参照の検査）とは別のcommandであり、USAGEはCIで別stepにすることを勧めている。
- 解いている問題と前提：言語にpackage境界の強制手段がないRuby／Railsで、「意図した依存」を宣言として残し、実際の参照との差を検出する。定数の解決はZeitwerkの命名規約に依存する。
- 必要な入力：packageの切り方（folder）、packageごとの意図した依存の一覧、検査を有効にするpackageの範囲。
- trade-off・失敗の仕方：検査はpackageごとに有効化するため、境界の導入を段階的に進められる一方、有効化していないpackageからの参照は見ない。非循環の検査は「宣言された依存」のgraphに対して行い、実際の参照のgraphに対しては行わない（`check_acyclic_graph`は`package.dependencies`からedgeを作る）。
- 反例・適用しない場合：import-linter（P18-O04）は宣言ではなく実際のimport graphから間接importまで辿る。nx（P18-O06）は依存先の名前ではなく依存先のtagで制約する。
- 互換・非互換：P18-O02（既存違反の記録）とP18-O03（何を依存とみなすか）が前提になる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。

### P18-O02 既存違反の記録（baseline）と、その増加・陳腐化の扱い（packwerkのpackage_todo、ArchUnitのFreezingArchRule）
- 出典：packwerk、`USAGE.md` 行166–175（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/USAGE.md#L166-L175）、211–247（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/USAGE.md#L211-L247）、`lib/packwerk/offense_collection.rb` 行38–55（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/lib/packwerk/offense_collection.rb#L38-L55）、`lib/packwerk/package_todo.rb` 行48–63（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/lib/packwerk/package_todo.rb#L48-L63）、`lib/packwerk/commands/check_command.rb` 行44–46（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/lib/packwerk/commands/check_command.rb#L44-L46）、`RESOLVING_VIOLATIONS.md` 行1–36（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/RESOLVING_VIOLATIONS.md#L1-L36）。issue：Shopify/packwerk#369（https://github.com/Shopify/packwerk/issues/369、open）。ArchUnit、`docs/userguide/008_The_Library_API.adoc` 行436–503（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L436-L503）、`archunit/src/main/java/com/tngtech/archunit/library/freeze/FreezingArchRule.java` 行118–156（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/FreezingArchRule.java#L118-L156）、`archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java` 行72–73（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/freeze/TextFileBasedViolationStore.java#L72-L73）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - packwerkは、既存の違反を参照元packageの`package_todo.yml`に「参照先package → 定数 → 違反の種類とfile」として記録する。`check`は、記録にない違反、記録の陳腐化（stale）、strict modeで記録外の違反、のいずれかがあると失敗する。記録された違反がもう存在しない場合も失敗し、`update-todo`で記録を更新させる。
  - strict mode（`enforce_dependencies: strict`）では、`update-todo`も新しい違反を記録に追加しない（`OffenseCollection#add_offense`は、strict mode違反のうち既に記録済みのものだけを記録に残す）。
  - `RESOLVING_VIOLATIONS.md`は、新しい違反は「hard-blockされない」と明記し、緊急修正、境界の改善による名前の移動、暗黙の依存の明示化、一時的な状態では記録してよく、機能の納期だけを理由にする場合は記録せずに除去するよう書いている。違反を「宣言した設計と現実の不一致の信号」と位置づけている。
  - ArchUnitの`FreezingArchRule`は、任意のruleを包み、そのruleの記録がstoreにない初回は、違反をViolationStoreに保存して成功を返す。以後は既知の違反を除いた新しい違反だけを報告し、解消された違反はstoreから自動で取り除く。既定のtext file型storeでは、storeの新規作成は既定で禁止されており、設定で許可する（`allowStoreCreation`。docs 行477–479、`TextFileBasedViolationStore` 行72）。したがって初回の保存は、作成が許可されているか、storeが既に存在することが前提になる。storeの更新は既定で許可されており、設定で禁止できる（`allowStoreUpdate`。docs 行481–483、同 行73）。docsは、CIではstoreを新規作成させず既存のstoreの上で動かす使い方を挙げている（行486–488）。既定の照合は行番号を無視する。
- 解いている問題と前提：成長したcodebaseへ境界を後から入れるときに、既存の大量の違反で導入が止まることを避け、悪化だけを止める。
- 必要な入力：記録の置き場（packageごとのfileか、ruleごとのstoreか）、記録への追加を誰がいつ許すか、解消済みの記録をどう減らすか。
- trade-off・失敗の仕方：
  - packwerkは陳腐化した記録を失敗として扱い、手で`update-todo`を回させる。ArchUnitは解消された記録を自動で減らす。前者は記録の変化がreviewの差分に現れ、後者は手間が減る代わりに、記録の減少が実行のたびに暗黙に起きる。
  - packwerk #369は、特定fileだけを`check`した場合に、同じ違反が複数fileに記録されていると陳腐化と誤判定され失敗する不具合の報告である（3.1.0で発生、open）。記録の照合範囲と検査範囲がずれると誤った失敗になる。
  - ArchUnitの`freeze.refreeze`は全違反を現状で凍結し直し、docsは「凍結しなかったのと実質同じ」と書いている。
- 反例・適用しない場合：import-linterは既存違反を個別の`ignore_imports`として契約に書く方式で、別のbaseline fileを持たない（P18-O04）。nxは、ruleのoption `allow`（検査せずに許すimportの一覧。`astro-docs/src/content/docs/kb/enforce-module-boundaries.mdoc` 行96、https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/kb/enforce-module-boundaries.mdoc#L96-L96）と、`ignoredCircularDependencies`（P18-O07）で例外を列挙する。
- 互換・非互換：P18-O01・O04・O06・O08のどの検査とも組み合わせられる。
- 限界：記録の粒度（file、定数、行）はrepo固有である。

### P18-O03 何を「依存」とみなすか：静的な定数参照、間接importの連鎖、直接依存と考慮範囲の設定
- 出典：packwerk、`README.md` 行72–80（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/README.md#L72-L80）。import-linter、`docs/contract_types/layers.md` 行27–40（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/layers.md#L27-L40）、`docs/contract_types/forbidden.md` 行5–10（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/forbidden.md#L5-L10）、165–177（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/forbidden.md#L165-L177）。ArchUnit、`archunit/src/main/java/com/tngtech/archunit/library/Architectures.java` 行711–730（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/Architectures.java#L711-L730）。nx、`astro-docs/src/content/docs/guides/Enforce Module Boundaries/ban-dependencies-with-tags.mdoc` 行22–32（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/guides/Enforce%20Module%20Boundaries/ban-dependencies-with-tags.mdoc#L22-L32）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - packwerkは、Zeitwerkのautoloaderが読む範囲の静的な定数参照だけを依存とみなす。method呼出しや受け渡されるobjectは見ない。READMEは「false positiveをどんな代償を払っても避け、少数のfalse negativeを受け入れる」と設計方針を書いている。
  - import-linterのlayers契約は、間接import（他moduleを経由した連鎖）も違反とする。forbidden契約は`allow_indirect_imports`で間接importを許す選択肢を持つ。
  - ArchUnitの`consideringOnlyDependenciesInLayers()`のjavadocは、layerの外のpackage（例：utils）を経由した依存を見落とす危険を明記し、考慮するpackageを指定する別の設定を勧めている。layered architectureの検査はclass間の直接依存を対象にし、どの依存を考慮するかを設定で選ぶ。
  - nxの`onlyDependOnLibsWithTags`は直接の依存先のtagだけを見るが、`notDependOnLibsWithTags`は依存木全体を辿る（docsと、rule本体の`findDependenciesWithTags`。P18-O06）。
- 解いている問題と前提：境界の違反をどの範囲の依存で判定するかを決める。言語の動的性と解析の精度の制約がある。
- 必要な入力：依存の抽出元（定数参照、import文、bytecode上のclass依存、project graph）、間接依存を数えるかどうか、境界の外の要素（共有のutil等）を経由する依存を見るかどうか。
- trade-off・失敗の仕方：直接依存だけを見ると、境界の外の共有moduleを中継した迂回を見落とす（ArchUnitのjavadoc）。間接依存まで見ると、中継moduleの変更が離れた契約の違反として現れる。packwerkは誤検出を避けるために検出漏れを受け入れ、Sorbetの型注釈で定数参照を増やすと検出範囲が広がる（README 行79）。
- 反例・適用しない場合：言語のmodule system（JPMS等）で可視性をcompile時に強制できる場合は、test時の検査は補助になる（ArchUnit docs 行233–240、P18-O08）。
- 互換・非互換：P18-O01・O04・O06・O07の判定の前提である。
- 限界：解析の実装（import-linterが使うgrimpの探索、ArchUnitのclass import）の内部は読んでいない。

### P18-O04 「契約の型」を並べる宣言：layers（順序、container、独立・非独立の同層、網羅性）
- 出典：import-linter、`docs/contract_types/layers.md` 行1–23（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/layers.md#L1-L23）、117–242（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/layers.md#L117-L242）、244–319（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/layers.md#L244-L319）、`src/importlinter/contracts/layers.py` 行137–181（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/src/importlinter/contracts/layers.py#L137-L181）、255–272（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/src/importlinter/contracts/layers.py#L255-L272）、`docs/contract_types/index.md` 行60–73（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/index.md#L60-L73）。issue：seddonym/import-linter#212（https://github.com/seddonym/import-linter/issues/212、open）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - layers契約は、上位から下位へ順に並べたmoduleの一覧で、下位から上位へのimportを禁じる。`containers`を指定すると、同じlayer構成を複数のpackageに繰り返し当てられ、container間（別のcontainerの上位layer）へのimportはこの契約では禁じない。
  - 括弧で囲んだlayerは、存在しなくても失敗しない（optional）。囲まないlayerが存在しないと契約が破れる。
  - 同じ行に`|`で並べたmoduleは互いに独立（相互importも禁止）、`:`で並べたmoduleは非独立（相互importを許す）。混在は不正な契約である（行307–319）。
  - `exhaustive = true`は、containerの直下に契約で宣言していないmoduleが現れると失敗させる（`_get_undeclared_modules`）。`exhaustive_ignores`で除外を列挙する。containerなしでは使えない（`validate`で拒否）。
  - 共通optionの`ignore_imports`は個別のimportを例外にし、`unmatched_ignore_imports_alerting`は、どのimportにも一致しない例外指定を既定でerrorにする。`broken_contract_guidance`で、契約が破れたときに直し方の説明を出せる。
- 解いている問題と前提：層の向きを宣言として持ち、新しいmoduleの追加や例外の残骸による境界の侵食を検出する。
- 必要な入力：layerの順序、同層のmodule間を独立にするか、宣言されていないmoduleの出現を許すか、例外の一覧と、例外が古くなったときの扱い。
- trade-off・失敗の仕方：網羅性はlayers契約にしかなく、independence契約へ広げる提案（#212）はopenのままで、形が決まっていない。optional layerやcontainerを使うと宣言は短くなるが、どのpackageに何が適用されるかが読み手から見えにくくなる。一致しない例外をerrorにすることで、修正済みの違反の例外が残り続けることを防いでいる。
- 反例・適用しない場合：ArchUnitは同じ網羅性を`ensureAllClassesAreContainedInArchitecture`として持つ（P18-O08）。nxはlayerの順序ではなく、tagごとの許可リストで向きを表す（P18-O06）。
- 互換・非互換：P18-O05（他の契約の型）と同じ設定fileに並べて使う。P18-O02のbaselineとは、例外を契約の中に書く点で異なる。
- 限界：layerの深さや探索の上限などの値は持ち込まない。

### P18-O05 公開と内部、独立、循環の禁止を別々の契約の型として持つ（protected、forbidden、independence、acyclic siblings）
- 出典：import-linter、`docs/contract_types/protected.md` 行1–11（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/protected.md#L1-L11）、111–123（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/protected.md#L111-L123）、`docs/contract_types/forbidden.md` 行14–26（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/forbidden.md#L14-L26）、`docs/contract_types/independence.md` 行1–7（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/independence.md#L1-L7）、`docs/contract_types/acyclic_siblings.md` 行1–29（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/acyclic_siblings.md#L1-L29）、97–117（https://github.com/seddonym/import-linter/blob/31927f1457e3df673912cb5efb0afa6dbc37585f/docs/contract_types/acyclic_siblings.md#L97-L117）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - protected契約は、指定したmoduleを、allow-listにあるmodule（とその子孫）以外から直接importさせない。`as_packages`が真なら、同じprotected moduleの子孫どうしは互いにimportできる（行114–116）。外部packageも対象にできる。「内部」を、置き場所ではなく「誰からimportされてよいか」として表す。
  - forbidden契約は、source側とforbidden側が重なる場合（同じmodule、または親子）の扱いを`as_packages`で切り替える。
  - independence契約は、列挙したmodule間に、どちらの向きにも、間接も含めてimportがないことを求める。
  - acyclic siblings契約は、指定した祖先の子どうしのimportを依存とみなし、子の世代ごとに循環を探す。破れた場合、「何本の依存を外せば非循環になるか」と、その候補の依存（import数付き）を出力する。docsは、探索の深さや除外を指定しても、深い位置のimportは浅い世代の循環の判定に寄与すると注意している。
- 解いている問題と前提：「層の向き」だけでは表せない境界（特定moduleの非公開化、bounded context相当のmodule間の独立、同層の循環）を、それぞれ別の型として宣言する。
- 必要な入力：公開を許す相手の一覧、互いに独立であるべきmoduleの集合、循環を禁止する祖先の範囲。
- trade-off・失敗の仕方：型を分けたため、同じ境界を複数の契約で重ねて書くことになり、契約間の整合は利用者が保つ。acyclic siblingsの「外す候補の依存」は、外せば非循環になる辺の候補の提示であり、どの辺を外すべきかの設計判断は含まない（docsの出力例は辺とimport数だけを示す）。
- 反例・適用しない場合：ArchUnitは公開の範囲をmodule側の`exposedPackages`として宣言する（P18-O09）。packwerkは公開APIの検査を本体から外した（P18-O07）。
- 互換・非互換：P18-O04（layers）と組み合わせる。independenceはP18-O13のSeparate Ways、またはbounded context間に直接の依存を置かない構成に近い。ただし対応づけは本書の仮置きである。
- 限界：wildcardの意味など構文の詳細はrepo固有である。

### P18-O06 複数の次元のtagと、tagの組合せによる依存制約（nx）
- 出典：nx、`astro-docs/src/content/docs/features/enforce-module-boundaries.mdoc` 行32–36（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/features/enforce-module-boundaries.mdoc#L32-L36）、300–302（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/features/enforce-module-boundaries.mdoc#L300-L302）、`astro-docs/src/content/docs/guides/Enforce Module Boundaries/tag-multiple-dimensions.mdoc` 行7–11（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/guides/Enforce%20Module%20Boundaries/tag-multiple-dimensions.mdoc#L7-L11）、81–86（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/guides/Enforce%20Module%20Boundaries/tag-multiple-dimensions.mdoc#L81-L86）、251–255（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/guides/Enforce%20Module%20Boundaries/tag-multiple-dimensions.mdoc#L251-L255）、`astro-docs/src/content/docs/kb/enforce-module-boundaries.mdoc` 行105–118（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/kb/enforce-module-boundaries.mdoc#L105-L118）、`packages/eslint-plugin/src/rules/enforce-module-boundaries.ts` 行673–683（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/packages/eslint-plugin/src/rules/enforce-module-boundaries.ts#L673-L683）、726–754（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/packages/eslint-plugin/src/rules/enforce-module-boundaries.ts#L726-L754）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - projectに`scope:*`、`type:*`等のtagを付け、`depConstraints`に「source側のtag → 依存してよいtag（`onlyDependOnLibsWithTags`）／依存してはならないtag（`notDependOnLibsWithTags`）」を書く。source projectに当たる制約はAND（すべて満たす）で適用される。`allSourceTags`で複数tagの組合せにだけ当たる制約を書ける。
  - 1つの次元（scope）は業務の区分を、別の次元（type）はapp・feature・ui・utilの役割の向きを表し、両方を同時に満たすことを求める（tag-multiple-dimensions）。
  - 制約が1つ以上ある構成で、tagが制約に1つも当たらないprojectは、どのlibraryにも依存できない（rule本体はこの場合に`projectWithoutTagsCannotHaveDependencies`を報告する。commentは「利用者に設定させる」）。
  - `notDependOnLibsWithTags`は依存木全体を辿り、違反の経路（project名の連鎖）を報告する。
- 解いている問題と前提：projectの数が増えたmonorepoで、projectごとに依存先を列挙せず、projectの属性（tag）から許可を導く。projectの粒度がbuild単位（package.json／project.json）に揃っていることが前提である。
- 必要な入力：tagの次元とその値、次元ごとの許可の向き、tagのないprojectの扱い。
- trade-off・失敗の仕方：docsは、tagを増やすと制約の複雑さが指数的に増えると書き、図を描いて計画することを勧めている（tag-multiple-dimensions 行251）。`onlyDependOnLibsWithTags`は直接依存だけを見るため、許可されたtagを経由した間接依存は検出されない（`notDependOnLibsWithTags`だけが依存木を辿る）。
- 反例・適用しない場合：packwerk（P18-O01）は依存先のpackageを名前で列挙する。import-linter（P18-O04）はmodule pathの順序で表す。ArchUnit（P18-O09）はmoduleごとのannotationで依存先を列挙する。
- 互換・非互換：P18-O07（tag以外の組込み規則）と同じruleの中で評価される。P18-O03（直接か間接か）の違いがtagの種類ごとに混在する。
- 限界：tagの名前と次元の切り方はrepo固有の例である。

### P18-O07 公開APIの入口と、project種別による組込み規則（nxの入口・循環・app／e2e・遅延読込）と、packwerkが公開APIの検査を本体から外した経緯
- 出典：nx、`packages/eslint-plugin/src/rules/enforce-module-boundaries.ts` 行180–197（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/packages/eslint-plugin/src/rules/enforce-module-boundaries.ts#L180-L197）、282–305（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/packages/eslint-plugin/src/rules/enforce-module-boundaries.ts#L282-L305）、557–600（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/packages/eslint-plugin/src/rules/enforce-module-boundaries.ts#L557-L600）、603–619（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/packages/eslint-plugin/src/rules/enforce-module-boundaries.ts#L603-L619）、638–671（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/packages/eslint-plugin/src/rules/enforce-module-boundaries.ts#L638-L671）、`astro-docs/src/content/docs/kb/enforce-module-boundaries.mdoc` 行94–103（https://github.com/nrwl/nx/blob/ead04276f840b920ffab97eb3f809fef2baf130b/astro-docs/src/content/docs/kb/enforce-module-boundaries.mdoc#L94-L103）。packwerk、`UPGRADING.md` 行9–11（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/UPGRADING.md#L9-L11）、`README.md` 行63–65（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/README.md#L63-L65）、`RESOLVING_VIOLATIONS.md` 行45–55（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/RESOLVING_VIOLATIONS.md#L45-L55）、`USAGE.md` 行291–330（https://github.com/Shopify/packwerk/blob/31e534283f93a225b520cddab3c2d735557c76de/USAGE.md#L291-L330）。PR：Shopify/packwerk#247（https://github.com/Shopify/packwerk/pull/247、merge済み）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - nxは、別projectを相対pathや絶対pathでimportすることを禁じ、npm scope付きの名前（projectの入口）からのimportを求める。autofixは、対象projectの入口（barrel）を探してimportを書き換える。公開APIを「projectの入口から出ているもの」として表す。
  - 同じruleの中で、tag制約より先に、project間の循環（`ignoredCircularDependencies`で対の除外が可能）、appのimport（MFE remoteは除く）、e2e projectのimport、遅延読込されているlibraryの静的import、を種別ごとの組込み規則として検査する。各規則は違反を1つ報告すると後続の検査をしない。
  - packwerkは3.0で`enforce_privacy`（公開・非公開の検査）を本体から削除し、拡張gemへ移した（UPGRADING）。#247の本文は、privacy関連のcodeを外部repositoryへ移し、checkerとvalidatorを拡張可能にしたと書いている。本体の`RESOLVING_VIOLATIONS.md`は、依然として「package ownerと公開APIを作る／publicなfolderへ移す」を違反の解消手段として挙げている。拡張checkerは`Packwerk::Checker`のinterface（違反の種類、strict mode、判定、message）を実装して追加する。
- 解いている問題と前提：依存の向きとは別に、「どこから入ってよいか」（公開API）を表す。packwerkは本体を依存検査に絞り、公開APIの検査を拡張点の上に置き直した。
- 必要な入力：projectやpackageの入口の定義、公開とする要素の置き場、project種別（app、lib、e2e）。
- trade-off・失敗の仕方：nxの入口規則は、入口を経由すれば入口が再exportする範囲をすべて公開として扱い、入口の中身の広さは検査しない。packwerkは公開APIの検査を拡張に移したため、本体だけでは公開APIの違反を検出できない（#247の移行の説明では、拡張gemを追加し`require`に書く必要がある）。#247の本文に削除の理由（なぜ本体から外したか）は書かれておらず、確認できなかった。
- 反例・適用しない場合：import-linterは公開範囲を`protected`契約のallow-listで表す（P18-O05）。ArchUnitは`exposedPackages`で公開packageを宣言する（P18-O09）。
- 互換・非互換：P18-O06のtag制約と同じruleの中で、先に評価される。
- 限界：MFE、buildable libraryなどの規則はnx固有の構成に依存する。

### P18-O08 層・onionの宣言と、空のlayer・宣言外のclassの検出（ArchUnit）
- 出典：ArchUnit、`docs/userguide/008_The_Library_API.adoc` 行8–55（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L8-L55）、行233–240（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L233-L240）、`archunit/src/main/java/com/tngtech/archunit/library/Architectures.java` 行154–172（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/Architectures.java#L154-L172）、184–205（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/Architectures.java#L184-L205）、229–262（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/Architectures.java#L229-L262）、行597–633（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/archunit/src/main/java/com/tngtech/archunit/library/Architectures.java#L597-L633）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `layeredArchitecture()`はlayerを名前とpackageで定義し、layerごとに`mayOnlyBeAccessedByLayers`／`mayNotBeAccessedByAnyLayer`（入ってくる向き）と`mayOnlyAccessLayers`／`mayNotAccessAnyLayer`（出ていく向き）で制約する。
  - `onionArchitecture()`はdomainModels、domainServices、applicationServices、名前付きadapterを定義し、domainからapplication・adapterへの依存、applicationからadapterへの依存、adapter間の依存を禁じる。docsはこれを「Hexagonal」「Ports and Adapters」とも呼ぶと書いている。
  - `evaluate`は、空のlayer（optionalでないもの）を違反とし、`ensureAllClassesAreContainedInArchitecture`が指定されていれば、どのlayerにも属さないclassを違反とする。
  - docsは、ArchUnitがJPMSのようなmodule systemの代わりではなく、compile時の検査が使えない環境や、module systemに加えてAPIの規則を足す場合に使うものだと書いている（行233–240）。
- 解いている問題と前提：architecture styleを、test codeの中の宣言として持ち、styleの規則（向き、adapter間の独立）を一度に検査する。
- 必要な入力：layerまたはonionの各部分を表すpackageの対応、layerを空にしてよいか、どのclassもいずれかのlayerに属すべきか。
- trade-off・失敗の仕方：docsは、Architecturesが当面layeredとonionの2つだけを提供すると書いている（行17–19）。宣言されたpackageの外にあるclassは、網羅性の検査を有効にしない限り見落とされる。空のlayerを違反とすることで、packageの改名による宣言の空振りを検出する。
- 反例・適用しない場合：import-linterは同じ網羅性をcontainer単位の`exhaustive`として持つ（P18-O04）。nxはlayerの概念を持たず、type tagの向きで表す（P18-O06）。
- 互換・非互換：P18-O02（凍結）で包める。P18-O03の考慮範囲の設定と組み合わせて使う。
- 限界：P01-O04（ddd-by-examples/libraryのArchUnit規則）は、このAPIを使った利用例である。本書はlibrary本体のAPIを観察した。

### P18-O09 moduleのallowedDependenciesとexposedPackagesのannotation宣言、PlantUMLの部品図をruleにする（ArchUnit）
- 出典：ArchUnit、`docs/userguide/008_The_Library_API.adoc` 行231–292（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L231-L292）、行343–433（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L343-L433）。信頼性ラベル：primary（公式repository内のuser guide）。本文確認：済（docsのみ。`ModuleRuleDefinition`と`PlantUmlArchCondition`の実装本体は読んでいない）
- 何をしているか：
  - `ModuleRuleDefinition.modules()`は、package patternまたはannotationでmoduleを定義する。docsの例では、各moduleのroot packageの`package-info`に独自annotationを付け、`allowedDependencies`（依存してよいmodule名）と`exposedPackages`（他moduleから参照してよいpackage）を書く。ruleは、宣言にないmodule間依存と、公開packageの外への依存を違反として報告する。宣言はmoduleの中に置かれ、ruleはそれを読むだけである。
  - `adhereToPlantUmlDiagram`は、PlantUMLの部品図を読み、部品のstereotypeをpackage patternとして解釈し、図の矢印にない依存を違反とする。図に現れない依存の扱いを、すべて考慮、図の中だけ考慮、指定packageだけ考慮、から選ぶ。図の書き方には、括弧記法の部品、一意のstereotype、ダッシュだけの矢印などの制約がある。
- 解いている問題と前提：moduleの境界の宣言（依存してよい相手と公開範囲）を、module自身の近くか、図という人が読む成果物に置き、その宣言と実装の差をtestで検出する。
- 必要な入力：moduleの定義方法、moduleごとの依存してよい相手と公開範囲、または部品図と、図に現れない依存の扱い。
- trade-off・失敗の仕方：図をruleにすると、図と実装の食い違いがtestの失敗として現れるが、図の記法が検査可能な形に制約される（docsの規則一覧）。「図の中だけ考慮」を選ぶと、図にない部品への依存は検査されない。
- 反例・適用しない場合：spring-modulith（P01-O05）は、packageの規約からmodule modelを導出し、named interfaceで公開範囲を表す。packwerkは依存の宣言を`package.yml`に置く（P18-O01）。
- 互換・非互換：P18-O08（layer）と併用できる。P18-O10のmetricsは同じmodule化の考え方（component）の上に計算される。
- 限界：annotationの名前と属性名はdocsの例であり、利用者が定義するものである。

### P18-O10 結合・可視性のmetricsで構造を測る（Lakos、Martin、Dowalil）
- 出典：ArchUnit、`docs/userguide/008_The_Library_API.adoc` 行568–606（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L568-L606）、643–645（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L643-L645）、670–693（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L670-L693）、750–761（https://github.com/TNG/ArchUnit/blob/74237315efc53279bda634e818977d41f64a1bd4/docs/userguide/008_The_Library_API.adoc#L750-L761）。信頼性ラベル：primary（公式repository内のuser guide）。本文確認：済（docsのみ。`library/metrics`の実装は読んでいない）
- 何をしているか：
  - classの集合をcomponent（例：package）にまとめ、component間の依存をclass間の依存から導いたうえで、次の3系統のmetricsを計算するAPIを持つ。
  - Lakosの累積依存：componentごとに推移的に到達できるcomponent数（自分を含む）を求め、その総和・平均・正規化した値を出す。docsは、循環の中のcomponentはすべて同じ値になり総和が増えると書いている。
  - Martinのcomponent依存：出ていく依存（Ce）、入ってくる依存（Ca）、不安定度、抽象度、main sequenceからの距離。docsは、ArchUnitでは抽象度を公開classだけで計算し、原典の定義と異なると明記し、その理由を「componentの結合に影響するのは外から見えるclassだけだから」と書いている。
  - Dowalilの可視性：componentごとに、見える要素の割合を求め、その平均と全体での割合を出す。情報隠蔽の度合いを表す。
- 解いている問題と前提：moduleの凝集・結合を数値で比べる材料を作る。componentの切り方は利用者が与える。
- 必要な入力：componentの単位、componentに属する要素、公開・非公開の区別、比べる対象（時系列、候補の分け方）。
- trade-off・失敗の仕方：docsはmetricsの計算方法を示すだけで、どの値で分割・統合すべきかの判断基準を示していない。詳しい背景は専門の文献に依るよう書いている（行586–588）。原典と定義が異なる部分（Martinの抽象度）があり、他のtoolの値とは比べられない。
- 反例・適用しない場合：packwerk、import-linter、nxは、今回読んだ範囲では結合の数値を計算せず、宣言との一致・不一致だけを検査する。Context MapperはService Cutterの結合基準を入力として持つ（P18-O12）。
- 互換・非互換：P18-O09のmodule定義と同じcomponentの考え方に立つ。P18-O12の分割の操作とは、測ることと変えることの関係にある。
- 限界：metricsの値、上限、目安は持ち込まない。

### P18-O11 bounded context間の関係の型を文法で表し、型と役割の組合せを検査する（Context Mapper）
- 出典：context-mapper-dsl、`org.contextmapper.dsl/src/org/contextmapper/dsl/ContextMappingDSL.xtext` 行39–48（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/ContextMappingDSL.xtext#L39-L48）、99–171（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/ContextMappingDSL.xtext#L99-L171）、486–503（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/ContextMappingDSL.xtext#L486-L503）、`org.contextmapper.dsl/src/org/contextmapper/dsl/validation/BoundedContextRelationshipSemanticsValidator.java` 行43–76（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/validation/BoundedContextRelationshipSemanticsValidator.java#L43-L76）、`org.contextmapper.dsl/src/org/contextmapper/dsl/validation/ContextMapSemanticsValidator.java` 行56–114（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/validation/ContextMapSemanticsValidator.java#L56-L114）、`org.contextmapper.dsl/src/org/contextmapper/dsl/validation/ValidationMessages.java` 行20–27（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/validation/ValidationMessages.java#L20-L27）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 関係を対称関係（Partnership、Shared Kernel）と上流・下流関係（Upstream-Downstream、Customer-Supplier）に分ける。上流側の役割はPublished Language（PL）とOpen Host Service（OHS）、下流側の役割はAnticorruption Layer（ACL）とConformist（CF）の列挙である。上流・下流関係には、上流が公開する集約（`exposedAggregates`）と、下流の統治上の権利（`downstreamRights`）を書ける。
  - context map自体に種別（SYSTEM_LANDSCAPE、ORGANIZATIONAL）と状態（AS_IS、TO_BE）を持たせる。
  - validatorは次を検査する。Customer-Supplierの上流がOHSを持つこと、下流がCFであることはerror、下流がACLを持つことはwarning。自分自身との関係はerror。関係の両端がmapに含まれていないことはerror。上流が公開するとした集約が上流contextに属さないことはerror。SYSTEM_LANDSCAPEのmapにTEAM型のcontextがあることはerror、ORGANIZATIONALのmapにTEAMがないことはwarning。
- 解いている問題と前提：context間の関係を図ではなく検査可能なtextとして持ち、関係の型と役割の矛盾する組合せを機械で見つける。関係の型の意味はDDDの戦略的設計の用語に依る。
- 必要な入力：contextの一覧、関係ごとの型、上流・下流の役割、公開する集約、mapの種別と状態（現状か目標か）。
- trade-off・失敗の仕方：検査するのはmodelの内部の整合であり、実装（code）が宣言どおりの関係になっているかは検査しない。Customer-SupplierとACL、Conformistの組合せをerrorにするかwarningにするかは、この実装の判断であり、message文（ValidationMessages 行20–22）以上の根拠は今回読んだ範囲になかった。
- 反例・適用しない場合：ddd-crew/context-mapping（P18-O13）は同じpatternを図と説明で扱い、検査をしない。packwerk、import-linter、nx、ArchUnitは関係の型を持たず、依存の有無と向きだけを扱う。
- 互換・非互換：P18-O12（関係を変える操作）の入力になる。P18-O05のindependence、P18-O07の公開APIと、上流の公開範囲（OHS、`exposedAggregates`）は対応しうるが、対応づけは本書の仮置きである。
- 限界：関係の型の列挙はこのrepoの文法であり、HELIXの用語にしない。

### P18-O12 分割・統合と関係の変更を、名前の付いた操作（architectural refactoring）として持つ（Context Mapper）
- 出典：context-mapper-dsl、`org.contextmapper.dsl/src/org/contextmapper/dsl/refactoring/MergeBoundedContextsRefactoring.java` 行51–92（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/refactoring/MergeBoundedContextsRefactoring.java#L51-L92）、106–118（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/refactoring/MergeBoundedContextsRefactoring.java#L106-L118）、`ExtractAggregatesByCohesion.java` 行40–64（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/refactoring/ExtractAggregatesByCohesion.java#L40-L64）、`SplitBoundedContextByFeatures.java` 行28–31（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/refactoring/SplitBoundedContextByFeatures.java#L28-L31）、`ContextSplittingIntegrationType.java` 行18–28（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/refactoring/ContextSplittingIntegrationType.java#L18-L28）、`ExtractSharedKernelRefactoring.java` 行29–38（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/refactoring/ExtractSharedKernelRefactoring.java#L29-L38）、`SuspendPartnershipMode.java` 行18–20（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/dsl/refactoring/SuspendPartnershipMode.java#L18-L20）（同ディレクトリ）、`org.contextmapper.dsl/src/org/contextmapper/servicecutter/dsl/ServiceCutterConfigurationDSL.xtext` 行21–58（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/org.contextmapper.dsl/src/org/contextmapper/servicecutter/dsl/ServiceCutterConfigurationDSL.xtext#L21-L58）、`README.md` 行5–7（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/README.md#L5-L7）、27（https://github.com/ContextMapper/context-mapper-dsl/blob/995f486a9cdecb6946257d5c7b6d98ada2978124/README.md#L27-L27）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - refactoringのdirectoryに、bounded contextの分割（features、owner、集約の属性、subsystem）、集約の分割・統合、bounded contextの統合、Shared Kernel・Partnershipの抽出、Shared KernelとPartnershipの切替、Partnershipから上流・下流への変更などが、名前の付いたclassとして並ぶ。
  - `MergeBoundedContextsRefactoring`は、2つ目のcontextの集約、module、実装するdomain、責務、実装技術を1つ目へ移し、2つの間の関係を削除し、他の関係の参照先を統合後のcontextへ置き換え、mapから2つ目を外し、file間のimportを補う。属性をどちらから取るかを引数で反転できる。
  - `ExtractAggregatesByCohesion`は、利用者が指定した集約を新しいcontextへ移し、上流が公開していた集約の関係を新しいcontextへ移す。凝集の判定そのものは行わず、どの集約を移すかは入力として受け取る。
  - 分割時に作る関係の統合方式は、CONFORMIST（下流が上流と同じmodelを使う）かACL（下流が別のmodelを持ち翻訳層を置く）の2択として列挙されている。Partnershipを止める方式は、統合、新しいcontextの抽出、上流・下流への置換の3択である。
  - Service Cutterの設定文法は、use caseが読み書きするnanoentity、一貫性・可用性・内容の変動性・security・保存の類似性・構造の変動性の各特性、事前定義のservice、security zone、共有ownerを、分割案を計算する入力として持つ（READMEは、Service Cutterで分割案を計算できると書いている）。
- 解いている問題と前提：分割・統合を、modelに対する再現可能な変換として表し、関係の付け替えの漏れ（統合後に残る自己関係、公開集約の宙づり）を防ぐ。どこで切るかの判断は、利用者の指定、またはService Cutterへ渡す結合基準に委ねる。
- 必要な入力：分割・統合の対象、分割後の関係の統合方式（同じmodelか翻訳層か）、Partnershipを止める方式、結合基準（use caseの読み書き、特性）。
- trade-off・失敗の仕方：操作はCMLのmodelを変えるだけで、実装のcodeは変えない。modelとcodeの差は別の手段で埋める必要がある。統合では、両contextの関係は削除される（関係の意味が失われる）。分割案の計算はService Cutter側にあり、その算法は今回読んでいない。
- 反例・適用しない場合：packwerk、import-linter、nx、ArchUnitは、分割・統合の操作を持たず、宣言を人が書き換えたあとの不一致を検出する。
- 互換・非互換：P18-O11（関係の型）の上で動く。P18-O10（測る）とは、測ることと変えることの関係にある。
- 限界：refactoringの一覧はこのrepoのものであり、HELIXの手順にしない。

### P18-O13 関係のpatternとteam relationshipの一覧、および「小さな地図を問いごとに作る」助言（ddd-crew）
- 出典：ddd-crew/context-mapping、`README.md` 行1–5（https://github.com/ddd-crew/context-mapping/blob/6362f2793fd57e8d6e0dc78ed1dbf797ce5aa6c8/README.md#L1-L5）、11–31（https://github.com/ddd-crew/context-mapping/blob/6362f2793fd57e8d6e0dc78ed1dbf797ce5aa6c8/README.md#L11-L31）、33–95（https://github.com/ddd-crew/context-mapping/blob/6362f2793fd57e8d6e0dc78ed1dbf797ce5aa6c8/README.md#L33-L95）、97–126（https://github.com/ddd-crew/context-mapping/blob/6362f2793fd57e8d6e0dc78ed1dbf797ce5aa6c8/README.md#L97-L126）。信頼性ラベル：primary（公式repository内の文書。ただし実装ではなく教材）。本文確認：済
- 何をしているか：
  - context mapの関係を、team relationship（Mutually Dependent、Upstream Downstream、Free）と、context map pattern（Open-host Service、Conformist、Anticorruption Layer、Shared Kernel、Partnership、Customer / Supplier Development、Published Language、Separate Ways、Big Ball Of Mud）の2段に分けて一覧にしている。patternの多くはDDD Referenceからの引用で定義している（本書では引用を転記しない）。
  - Open-host Serviceの説明に、上流がOHSを提供する場合、下流はConformistかACLを選べると補足している。Big Ball of Mudは、混ざったmodelと一貫しない境界の印であり、他のcontextへ広げないための区切りとして扱う。
  - 使い方の助言として、すべてを1枚の大きな地図に載せず、明示した問い（modelがどう伝播するか、どのteamがどこに影響するか等）ごとに小さな地図を作ること、使うpatternを先に決めて説明を付けること、を挙げている。
- 解いている問題と前提：context間の関係を、技術的な依存だけでなく、teamの影響関係と統治の観点から記述する。地図は人の議論のための成果物であり、検査対象ではない。
- 必要な入力：地図で答えたい問い、使うpatternの選択と説明、context・teamの一覧。
- trade-off・失敗の仕方：READMEは、大きな地図は時間とともに育ち、理解しにくくなり、立場の異なる関係者への説明が過剰になると書いている。pattern名が自明でない関係者がいることも挙げている。
- 反例・適用しない場合：Context Mapper（P18-O11）は同じpatternを文法として持ち、組合せを検査する。ただし両者のpatternの集合は一致しない（Context MapperはSeparate WaysとBig Ball of Mudを関係の型として持たず、team relationshipもmapの種別とcontextの型で表す）。
- 互換・非互換：P18-O11と相互に補う関係にある（README 行144–146はContext Mapperを、地図をrepositoryで保守する手段として紹介している）。
- 限界：CC-BY-SA-4.0のため、本文の転記はせず構造だけを書いた。READMEの末尾とLICENCE.mdでlicenseの表記が異なる。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 境界と依存の宣言の置き場 | packwerk：packageのfolderに置く`package.yml`の`dependencies`（O01）。ArchUnit：module rootのannotation、または部品図（O09） | import-linter：設定fileに契約を並べる（O04・O05）。nx：project設定のtagと、lint設定の`depConstraints`（O06） | 宣言をmoduleの近くに置くか、全体の設定に集めるか。依存先を名前で列挙するか、属性（tag、layer順）から導くか |
| 何を依存とみなすか | packwerk：Zeitwerkで解決できる静的な定数参照。誤検出を避け、検出漏れを受け入れる（O03） | import-linter：間接importの連鎖まで見る。ArchUnit：直接のclass依存と、考慮範囲の設定。nx：`only`は直接、`not`は依存木全体（O03・O06） | 言語の動的性、解析の精度、中継moduleの扱い |
| 公開APIと内部の区別 | nx：projectの入口（npm scope）以外からのimportを禁じる（O07）。ArchUnit：`exposedPackages`（O09） | import-linter：`protected`のallow-list（O05）。packwerk：本体から外し、拡張gemへ（O07） | 公開を「置き場所」で表すか、「誰から入ってよいか」で表すか |
| 層・向きの表し方 | import-linter：上位から下位への順序、同層の独立・非独立（O04）。ArchUnit：layerごとの入る向き・出る向き、onionの役割（O08） | nx：type tagごとの許可リスト（O06） | layerの順序を1本の列で表せるか。複数の次元を同時に満たす必要があるか |
| 網羅性（宣言外の要素の検出） | import-linter：containerごとの`exhaustive`（O04） | ArchUnit：`ensureAllClassesAreContainedInArchitecture`、空のlayerの検出（O08）。nx：tagのない projectは依存できない（O06） | 新しい要素の追加を、宣言の更新を強いる契機にするかどうか |
| 既存違反の扱い | packwerk：packageごとの`package_todo.yml`。陳腐化した記録も失敗、strict modeは追加を拒む（O02） | ArchUnit：ruleごとのViolationStore。解消分は自動で減る（O02）。import-linter：契約内の`ignore_imports`、一致しない例外はerror（O04） | 記録の減少を人が確定させるか、自動で減らすか。記録の照合範囲と検査範囲を揃えられるか |
| 結合の測り方 | ArchUnit：累積依存、Ce／Ca・不安定度・抽象度・距離、可視性のmetrics（O10） | Context Mapper：Service Cutterへ渡す結合基準（use caseの読み書き、特性）（O12）。他のtool：数値を持たない | 測った値を判断に使う基準を誰が持つか（どのrepoも閾値の判断基準を示していない） |
| context間の関係の型 | Context Mapper：対称関係と上流・下流関係、上流のPL／OHS、下流のACL／CF、矛盾する組合せの検査（O11） | ddd-crew：team relationshipとpatternの2段の一覧、問いごとの小さな地図（O13） | 関係を検査可能なmodelとして持つか、議論のための図として持つか |
| 分割・統合の手段 | Context Mapper：名前の付いた操作（統合、集約の抽出、featuresでの分割、SK・Partnershipの抽出・切替）（O12） | packwerk・import-linter・nx・ArchUnit：宣言を人が書き換え、実装との不一致を検出する（O01〜O09） | modelを正本とするか、codeを正本とするか |

## 見つからなかったこと・gap
- 分割・統合を「いつ」行うかの判断基準（どの測定値、どの変更の頻度で切る・まとめるか）は、6 repoのどれにも見つからなかった。ArchUnitはmetricsの計算だけを示し、判断は文献に委ねている（O10）。Context Mapperは操作を持つが、どこで切るかは利用者の指定かService Cutterの計算に委ねる（O12）。packwerkは「機能的な凝集が高いものを同じpackageに、package間は疎に」という原則と、Robert Martinのpackage原則への参照を挙げるだけである（`USAGE.md` 行31–44）。
- context間の関係の型（ACL、OHS、Shared Kernel等）を、実装のcode上の依存の検査と結びつけるtoolは見つからなかった。Context Mapperはmodelの中の整合だけを検査し、packwerk等は関係の型を持たない。
- packwerkが公開APIの検査を本体から外した理由は、#247の本文、UPGRADING、CHANGELOGからは確認できなかった。
- ArchUnitの`ModuleRuleDefinition`、PlantUML rule、metricsの実装本体、import-linterが使うgrimpの`find_illegal_dependencies_for_layers`の探索、Service Cutterの分割の算法は読んでいない。
- 設計判断の記録（ADR形式）は、6 repoとも見当たらなかった。判断の根拠はdocs、code comment、PR、issueにある。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`し、固定commitをcheckout（core.hooksPathを無効化）。nxは`--sparse`で`packages/eslint-plugin/src`と`astro-docs`の該当directoryだけを取得した。読むだけで、build・test・script・hook・package managerは実行していない。GitHub APIの呼出しは約20回（repo metadata、default branchの先頭commit、PR・issueの検索と本文）。
- packwerk：`README.md`（全体）、`USAGE.md`（全体）、`RESOLVING_VIOLATIONS.md`（全体）、`UPGRADING.md`（全体）、`lib/packwerk/reference_checking/checkers/dependency_checker.rb`（全体）、`lib/packwerk/validators/dependency_validator.rb`（全体）、`lib/packwerk/offense_collection.rb`（全体）、`lib/packwerk/package_todo.rb`（1–80）、`lib/packwerk/commands/check_command.rb`（20–55）、`update_todo_command.rb`・`formatters/default_offenses_formatter.rb`（grepの該当行）。PR #247、issue #369。読んでいないもの：parser、`constant_discovery.rb`、`graph.rb`の循環検出の本体、`TROUBLESHOOT.md`、test。
- import-linter：`docs/contract_types/`（全6file）、`src/importlinter/contracts/layers.py`（137–182、255–272）、`src/importlinter/contracts/_common.py`・`src/importlinter/domain/helpers.py`（grepの該当行）、`docs/release_notes.md`（grepの該当行）。issue #212。読んでいないもの：`forbidden.py`・`protected.py`・`independence.py`・`acyclic_siblings.py`の本体、grimp（別repository）、`docs/custom_contract_types.md`。
- nx：`astro-docs/src/content/docs/features/enforce-module-boundaries.mdoc`（全体）、`guides/Enforce Module Boundaries/`の`tag-multiple-dimensions.mdoc`・`ban-dependencies-with-tags.mdoc`・`tags-allow-list.mdoc`、`kb/enforce-module-boundaries.mdoc`（全体）、`packages/eslint-plugin/src/rules/enforce-module-boundaries.ts`（178–200、280–320、550–760）。読んでいないもの：`ban-external-imports.mdoc`、`utils/runtime-lint-utils.ts`・`graph-utils.ts`（`findDependenciesWithTags`、`checkCircularPath`の本体）、Conformance plugin（Enterprise。repository外）、`@nx/oxlint`。
- ArchUnit：`docs/userguide/008_The_Library_API.adoc`（1–130、231–310、343–566、568–815）、`archunit/src/main/java/com/tngtech/archunit/library/Architectures.java`（150–300、590–640、700–740）、`library/freeze/FreezingArchRule.java`（118–160）。読んでいないもの：`ModuleRuleDefinition`、`library/plantuml`、`library/metrics`の実装、`SlicesRuleDefinition`の本体、user guideの他の章。
- context-mapper-dsl：`README.md`（1–80）、`ContextMappingDSL.xtext`（39–70、99–169、480–520）、`validation/BoundedContextRelationshipSemanticsValidator.java`（全体）、`validation/ContextMapSemanticsValidator.java`（40–119）、`validation/ValidationMessages.java`（grepの該当行）、`refactoring/`の一覧と、`MergeBoundedContextsRefactoring.java`（全体）、`ExtractAggregatesByCohesion.java`（全体）、`SplitBoundedContextByFeatures.java`（全体）、`ContextSplittingIntegrationType.java`、`ExtractSharedKernelRefactoring.java`、`SuspendPartnershipMode.java`、`SwitchFromSharedKernelToPartnershipRefactoring.java`（comment）、`servicecutter/dsl/ServiceCutterConfigurationDSL.xtext`（1–80）。読んでいないもの：`SplitBoundedContextByAggregateAttribute.java`、`SplitBoundedContextByOwner.java`、`SplitSystemIntoSubsystems.java`、generator（PlantUML、MDSL）、Service Cutter本体（別repository）、contextmapper.orgのdocs（repository外）。
- ddd-crew/context-mapping：`README.md`（全体）、`LICENCE.md`（冒頭）、`resources/`の一覧（画像・boardは開いていない）。読んでいないもの：`translations/pt-br/README.md`。
- 検索した語：`enforce_privacy`、`privacy`、`stale`、`strict`、`exhaustive`、`unmatched`、`broken_contract_guidance`、`deep`・`entry`・`barrel`（nx rule）、`notDependOnLibsWithTags`、`consideringOnlyDependenciesInLayers`、`refreeze`、`OPEN_HOST_SERVICE`・`ANTICORRUPTION_LAYER`・`CONFORMIST`、`Merge`・`Split`・`Extract`（Context Mapperのrefactoring）。GitHub検索：packwerkのPR「privacy」、issue「package_todo stale」、import-linterのissue「exhaustive」、nxのissue「notDependOnLibsWithTags transitive」（該当0件）。
- 選ばなかった候補：spring-projects/spring-modulith（P01-O05・O08で観察済みのため重ねなかった）、sverweij/dependency-cruiser（SCF-B-0153の`reference-repositories.md` C4に既出のため）、ServiceCutter/ServiceCutter（Context Mapperの文法から入力の構造だけを読み、本体は読んでいない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：packwerk・import-linter・nx・ArchUnit・Context Mapperは実装（codeとdocs）、ddd-crewは教材（patternの定義と助言）である。教材の定義は書籍（DDD Reference）の引用に依っており、実装由来の観察と同列に扱うかは未決。ArchUnitの観察（O09・O10）はuser guideだけに依っており、実装と照合していない。
- scope：観察は、1つのcodebase（monolith、monorepo）の中のmodule境界の検査と、context間の関係のmodel化に限っている。HELIXのD02で、どの単位（機構、共通部品、製品のcode）へ対応させるかは未決である。D01（architecture style）、D05（連携の契約）との領域の帰属も未決である。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。nxのdocsはOxlint対応を「Experimental」と書き、packwerkは3.0で公開API検査を外すなど、機能の位置が版で動いている。再観察の要否は未決である。
- 状態：全観察（P18-O01〜O13）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
