# P35 onboarding・空の初回体験・help・利用者向け文書の観察（D10 UX・Interaction）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、件数上限、文字数、日数、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。
値の線引き：既定の挙動（非数値。例：設定がないときに何が起きるか、どの条件で検査が走るか）は書く。数値の既定値・上限・期間は、出典に書かれていても写さない。
埋めようとしたgap：[D10](../../brain-domain-material-inventory-20261004/materials/D10-ux-interaction.md) §4「onboarding・空の初回体験・help・利用者向け文書」（旧台帳でユーザードキュメント設計が`todo`、D10-M09）

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| evildmp/diataxis-documentation-framework | https://github.com/evildmp/diataxis-documentation-framework | 957c09ca40b4a1edc23874f713e01937d50d54d5（main） | NOASSERTION（`LICENSE.rst`冒頭は「Creative Commons Attribution-ShareAlike 4.0 International」。READMEも「CC-BY-SA 4.0」と書く） | false | 2026-10-05 | 文書の種類を4つに分ける枠組み（Diátaxis）の公式source（公開siteはdiataxis.fr）。種類の判定表、種類どうしの境界の崩れ、文書の改善の進め方が本文にある。share-alikeのため構造の観察だけにした |
| github/docs | https://github.com/github/docs | 2bd66de8cea336061c9ea060c9b37385136e6ab3（main） | CC-BY-4.0（APIの値。repositoryには別に`LICENSE-CODE`があり、冒頭は「MIT License」） | false | 2026-10-05 | 利用者向け文書の運用repository。content model（階層と種類）、文書の版と製品の版の対応（frontmatterとLiquid）、style guide、失効する内容の検査を、文書とlint・版解決のコードの両方で読める |
| primer/design | https://github.com/primer/design | 87f799f202ec95df15c99f473c9c0c803da8e6b3（main） | MIT | true | 2026-10-05 | GitHubのdesign systemの文書。empty state（Blankslate）のpatternとcomponentの文書、feature onboardingのpattern文書、文書の書き方の指針がある。archivedで、最終commitは2025-07-01。primer orgの非archived repositoryの一覧から後継の文書repositoryは見つけられなかった |
| carbon-design-system/carbon-website | https://github.com/carbon-design-system/carbon-website | 5e9cd1da43c32d3d3b991dc947b427f674da61a8（main） | Apache-2.0 | false | 2026-10-05 | IBM Carbonの文書site。empty stateのpatternが、原因の型、error型、初回向けの代替（inline文書・onboarding・starter content）を表で分けている。component・patternの文書templateもある |
| alphagov/govuk-design-system | https://github.com/alphagov/govuk-design-system | d1b51e67c01d841d7cba58a29ef1f74384cb7b34（main） | MIT | false | 2026-10-05 | P07（form、validation等）・P23（研究知見の共有、継続的な研究、contribution criteria、component lifecycleなど、研究と貢献の運用）で読んだrepository。今回は別の箇所として、serviceの開始点（start using a service）、利用可否の事前確認（check a service is suitable）、廃止した頁の扱い（handling deleted URLs）を読んだ |

（google/styleguideはmetadataだけ取得した。default branchはgh-pages、SPDXはNOASSERTION、archivedはfalse。主にprogramming言語のcode styleの文書で、利用者向け文書のstyle guideではないため、本文は読まず観察に使っていない。）

## 観察

### P35-O01 2つの問いで文書の種類を決める判定表（Diátaxis compass）
- 出典：diataxis-documentation-framework、`source/compass.rst` 行10–55（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/compass.rst#L10-L55）、行58–77（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/compass.rst#L58-L77）。信頼性ラベル：primary（公式source repository、枠組みの本文）。本文確認：済
- 何をしているか：内容が「行為（action）を導くか、認識（cognition）を与えるか」と、利用者の「技能の獲得（acquisition）に役立つか、技能の適用（application）に役立つか」の2つの問いの組合せで、tutorial、how-to guide、reference、explanationの4種類のどれに属すかを決める表を置く。表は「If the content… / …and serves the user's… / …then it must belong to…」の3列である。問いは、書き手が何を書いているつもりか、目の前の文がどちらをしているか、利用者に何が要るか、のいずれにも当てられ、文や語の単位にも文書全体にも当てられるとしている。
- 解いている問題と前提：書き手が「これはどの種類の文書か」に直観で答えられない、または直観が誤る場合に、判断を2つの二択へ分解する（行14–26）。種類の判定は利用者の必要（行為か認識か、学習か仕事か）で決まる、という前提に立つ。
- 必要な入力：内容（または利用者の状況）が行為と認識のどちらに向くか、獲得と適用のどちらに仕えるかの判断。
- trade-off・失敗の仕方：2つの二択は、境界上の内容（例えば手順に説明が混ざる文）を1つの種類へ押し込む。本文は語にとらわれず柔軟に使えと書く（行63）が、柔軟に使った結果の判定の揺れを抑える仕組みは書かれていない。
- 反例・適用しない場合：github/docsは、1つの記事に概念・手順・参照・troubleshootingを組み合わせることを認めている（P35-O06）。種類を記事単位で1つに決めない運用である。
- 互換・非互換：P35-O02（種類どうしの境界の崩れ）、P35-O03（構造を先に作らない進め方）と組で使われる。P35-O05（github/docsの種類をdirectoryで検査する方式）とは、判定を人の問いで行うか、配置場所の機械検査で行うかが異なる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。repositoryはCC-BY-SA 4.0であり、表の構造だけを記録し、本文の文言は写していない。

### P35-O02 4種類の対比表と、隣り合う種類が混ざる崩れ（Diátaxis map）
- 出典：diataxis-documentation-framework、`source/map.rst` 行22–44（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/map.rst#L22-L44）、行47–99（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/map.rst#L47-L99）、行102–139（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/map.rst#L102-L139）、行144–170（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/map.rst#L144-L170）。`source/reference.rst` 行82–94（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/reference.rst#L82-L94）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 4種類を、何をするか、答える問い、何に向くか（learning・goals・information・understanding）、目的、形式、たとえ、の行で対比する表を置く（map 行56–96）。読者には期待を、書き手には指針を与えるとする（行50–54）。
  - 隣り合う種類の組（行為を導く：tutorialとhow-to、技能の適用に仕える：referenceとhow-to、命題的知識を持つ：referenceとexplanation、技能の獲得に仕える：tutorialとexplanation）を表にし、その境界がぼやけると文体と内容が不適切な場所へ流れ込み、最悪の場合tutorialとhow-toが互いに崩れ込む、と書く（行116–139）。
  - 利用者は4種類を順に読む必要はなく、どこからでも入る、と書いたうえで、学習→目標→情報→理解の循環という並びには意味がある、とする（行149–170）。
  - referenceは製品の構造を映す構造にする、と書く（reference 行88–90）。ただし不自然な構造に押し込むことではない、と限定している（行92–94）。
- 解いている問題と前提：製品の機能ごとに文書を組むと、文書群の間で一貫しなくなる（map 行27–31）。種類の一覧を持つだけでは「なぜこの一覧か」が恣意的に見える（行38–44）。2次元の配置で種類どうしの関係を示すことで、境界を明示する。
- 必要な入力：各文書の種類（P35-O01の判定）、製品の構造（referenceの並びに使う）。
- trade-off・失敗の仕方：境界の崩れは「自然な傾向」とされ（行112–114）、崩れを検出する手段は書き手の点検に委ねられている。機械的な検査はない。
- 反例・適用しない場合：github/docsは、tutorialとquickstartを「guides」とまとめて扱い、また記事の種類を組み合わせることを認める（P35-O06）。同じ「tutorial」の語でも、github/docsは「専門的な助言とbest practiceの詳しい議論」を求める人向けとしており（P35-O06）、Diátaxisの学習向けのlessonとは意味が異なる。
- 互換・非互換：P35-O01の判定表、P35-O04（github/docsの内容の並び順）と比べられる。P35-O04の並び順（概念→参照→手順→troubleshooting）は、Diátaxisの循環の並びとは別の軸（適用範囲の広さ）で決めている。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。share-alikeのため構造の観察だけにした。

### P35-O03 空の区画を先に作らず、小さな改善を積んで構造を内側から作る（Diátaxis workflow）
- 出典：diataxis-documentation-framework、`source/how-to-use-diataxis.rst` 行6–10（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/how-to-use-diataxis.rst#L6-L10）、行13–41（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/how-to-use-diataxis.rst#L13-L41）、行58–92（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/how-to-use-diataxis.rst#L58-L92）、行112–124（https://github.com/evildmp/diataxis-documentation-framework/blob/957c09ca40b4a1edc23874f713e01937d50d54d5/source/how-to-use-diataxis.rst#L112-L124）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 4種類の構造は完成させるべき「plan」ではなく、位置を確かめる「guide」だとする（行16–18）。
  - 4種類それぞれの空の区画（中身のないtutorial・how-to・reference・explanationの見出し）を先に作ることを明示的に避けるよう書く（行35）。改善を重ねるうちに、ある材料を特定の見出しの下へ移す必要が生じ、そこで上位構造ができる、とする（行37–41）。
  - 進め方を、対象を1つ選ぶ（探しに行かず、目の前のもの）→その利用者の必要と種類の要件で評価する→直ちに改善になる次の1手を決める→実行して完了とする（publishまたはcommit）、の循環で書く（行65–81）。
  - 文書は「finished」にはならないが、各段階で「complete」（その段階に適した、使える状態）でありうる、とする（行115–124）。
- 解いている問題と前提：大きな計画と一括の書き直しは、何から手を付けるかの判断を麻痺させる（行83–85）。文書は製品とともに変わり続ける継続の作業である（行8）、という前提に立つ。
- 必要な入力：改善対象の小さな単位（頁、段落、文）、各種類の要件（P35-O01・O02）。
- trade-off・失敗の仕方：上位構造が後から現れるため、作業の途中では文書群の全体像（どの種類が欠けているか）が見えにくい。計画と進捗の管理を求める組織の運用とは合わない場合がある（本文は計画型の作業を「唯一の方法ではない」と書く。行91–92）。
- 反例・適用しない場合：github/docsは、上位の階層（doc set、category、map topic、article）と各層の作り方の条件を先に定めている（P35-O04）。Carbonは、component・patternの文書が覆うべき節をtemplateで先に定める（P35-O09）。
- 互換・非互換：P35-O01・O02と組で使う。P35-O04・O09（先に構造を定める方式）とは進め方が対立する。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。本文は方法論の主張であり、適用の結果の証拠はrepository内に含まれていない。

### P35-O04 文書の階層と、内容の並び順を先に定める（github/docs content model）
- 出典：github/docs、`content/contributing/style-guide-and-content-model/about-the-content-model.md` 行15–32（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/about-the-content-model.md#L15-L32）、行48–61（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/about-the-content-model.md#L48-L61）、行63–80（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/about-the-content-model.md#L63-L80）、行86–102（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/about-the-content-model.md#L86-L102）、行108–126（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/about-the-content-model.md#L108-L126）。信頼性ラベル：primary（公式source repository、運用文書）。本文確認：済
- 何をしているか：
  - 文書をtop-level doc set → category → map topic → articleの階層で組む（行23–30）。深い階層は目的の記事を探しにくくし、広い階層は選びにくくする、という両面を書く（行32）。
  - 各層に作る条件と題の付け方を置く。top-level doc setは製品・主要機能・中心のworkflowを単位にし、既存のdoc setに収まりうる内容は、おそらくその既存のdoc setに属する、と推定の形で書く（行50の「probably belongs」）。categoryは製品とともに小さく始めて育つ（行66）。map topicは少なくとも複数の記事を持ち、map topicの入れ子は特定の必要がない限り避ける（行90–92）。題の付け方は層ごとに置く。top-level doc setは機能・製品を単位にし、利用者が使っている部分を表す（行55–61）。categoryとmap topicは動名詞で始まる作業型の題にし、将来の製品の拡張に耐える一般さにする（category 行72–80、map topic 行94–102）。件数と文字数の上限が書かれているが、値は持ち込まない。
  - 種類が異なっても公開単位はすべてarticleで、introなどの共通要素を持つ（行110）。
  - category・map topic・articleの中の並びを、適用範囲の広いものから狭いものへ、概念→参照→手順（有効化、使用、管理、無効化、破壊的操作の順）→troubleshootingと定める（行112–122）。
  - 再利用部品（reusable・variable）で短い単位を共有し、大きな節の再利用は避けて、恒久の置き場所を1つに決めてlinkする（行124–126）。
  - content modelに沿う内容だけを公開する、と書く（行17）。
- 解いている問題と前提：利用者が繰り返し訪れる中で文書の心的modelを作れるよう、全doc setで同じ種類と構造を使う（行17–19）。多数の書き手（社外の初回貢献者を含む）が同じ規則で書くことを前提とする。
- 必要な入力：製品・機能の区分、各記事の種類、各内容の適用範囲の広さ。
- trade-off・失敗の仕方：階層の深さと幅の調整は書き手の判断に残る（件数の目安は「consider」の表現）。並び順は種類の列で決まるため、利用者の作業の順と食い違う場合の扱いは書かれていない。
- 反例・適用しない場合：Diátaxisは構造を先に作らず、改善から構造を生じさせる（P35-O03）。
- 互換・非互換：P35-O05（種類をdirectoryとfrontmatterで検査する）、P35-O06（入口の種類）、P35-O09（style guide）と同じ運用の一部である。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P35-O05 文書の種類を、置き場所のdirectory名とfrontmatterの一致で機械検査する（github/docs）
- 出典：github/docs、`src/frame/lib/frontmatter.ts` 行54–64（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/frame/lib/frontmatter.ts#L54-L64）。`src/content-linter/lib/linting-rules/frontmatter-content-type.ts` 行65–69（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/content-linter/lib/linting-rules/frontmatter-content-type.ts#L65-L69）、行12–18（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/content-linter/lib/linting-rules/frontmatter-content-type.ts#L12-L18）、行23–58（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/content-linter/lib/linting-rules/frontmatter-content-type.ts#L23-L58）、行81–132（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/content-linter/lib/linting-rules/frontmatter-content-type.ts#L81-L132）。信頼性ラベル：primary（公式source repositoryのコード）。本文確認：済
- 何をしているか：
  - `contentTypesEnum`に、get-started、concepts、how-tos、reference、tutorialsと、homepage（`content/index.md`だけ）、landing（製品の`index.md`だけ）、rai、otherを列挙する。
  - lint規則`GHD065`（`frontmatter-content-type`）は、記事の`contentType` frontmatterが、directory名から導いた種類と一致することを検査する。種類を導くのは、記事の直接の親directoryではなく、製品directoryの直下のdirectory名（`segments[1]`）である（行81–98）。規則のdescriptionは「matches the parent directory」と書いており（行68）、深い階層の記事では実装と食い違う。`contentType`がない場合と一致しない場合に、lintの指摘（`addError`）を出す（行111–132）。この規則の重大度の設定は読んでいない。
  - 検査は条件付きである。対象は、`content/`直下の製品directoryのうち、`early-access`を除き、下位directoryを持ち、その下位directoryがすべて既知の種類名（`responsible-use`を含む名前と`getting-started`の別名を含む）であるものに限る（行29–46）。それ以外の製品は検査しない。対象製品でも、製品直下の`index.md`はlandingを期待し、製品直下のindex以外のfileは検査を飛ばす（行90–96）。
  - directory名が列挙にない場合はotherへ写す（行53–58）。
- 解いている問題と前提：content modelの種類（P35-O04・O06）が、人の判断だけでなく置き場所とmetadataの両方で表され、食い違いを検出できるようにする。製品ごとに、種類別のdirectory構成へ移行済みかどうかが異なる、という前提が条件分岐に表れている（移行の経緯は読んでいない）。
- 必要な入力：種類の列挙、directory名と種類の対応表、各記事のfrontmatter。
- trade-off・失敗の仕方：検査は「directoryと宣言が一致するか」だけで、本文が実際にその種類の要件（P35-O06の節構成など）を満たすかは見ない。種類別directoryへ移行していない製品は検査の外に残る。
- 反例・適用しない場合：Diátaxisは種類の判定を書き手の問いで行い、機械検査を持たない（P35-O01）。Primer・Carbonの文書には、文書の種類を検査するコードは見当たらなかった（読んだ範囲）。
- 互換・非互換：P35-O04・O06を前提にする。P35-O07（版のfrontmatter）と同じく、frontmatterを文書のmetadataの置き場所にしている。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。lint規則の実行は行っておらず、コードを読んだだけである。

### P35-O06 入口の種類（get started・quickstart・tutorial）の役割分担と、種類を組み合わせる記事（github/docs）
- 出典：github/docs、`content/contributing/style-guide-and-content-model/get-started-content-type.md` 行12–28（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/get-started-content-type.md#L12-L28）。`quickstart-content-type.md` 行12–16（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/quickstart-content-type.md#L12-L16）、行22–39（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/quickstart-content-type.md#L22-L39）。`tutorial-content-type.md` 行12–16（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/tutorial-content-type.md#L12-L16）、行22–45（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/tutorial-content-type.md#L22-L45）。`about-combining-multiple-content-types.md` 行13–22（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/about-combining-multiple-content-types.md#L13-L22）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - get startedは、概念とhow-toへ進む前に要る最小限だけを置く入口とし、主にquickstartと「About [PRODUCT]」で構成する。how-to、設定・登録の手順、製品領域全体でなく特定機能だけに役立つ内容、best practiceは置かない（get-started 行12–28）。
  - quickstartは、機能をすでに理解して試す準備ができた人が、必要最小限の手順で1つの作業を終えるためのものとする。より複雑な作業はtutorialを使う（quickstart 行12–14）。節は、導入（対象者、前提知識、達成すること）、手順、troubleshooting（任意）、次の一歩（概念文書へのlinkを必ず含む）で構成する（行22–39）。所要の目安の値が書かれているが、持ち込まない。
  - tutorialは、workflow全体を通して実際の問題を解く。専門的な助言とbest practiceの詳しい議論を求める人向けで、他の文書（content）より会話的な調子にする。tutorialを持つ製品は、先にquickstartを持たなければならない（tutorial 行12–14）。導入には完成例を含め、所要時間は書かない（行23–28）。
  - tutorialとquickstartを合わせてsite上で「guides」と呼ぶ（quickstart 行16、tutorial 行16）。
  - 1つの記事に概念・手順・参照・troubleshooting・known issueを組み合わせてよいが、quickstartとtutorialは組み合わせに使わない（combining 行17）。
- 解いている問題と前提：初回の利用者が最初に読む文書を小さく保ち、深い内容（tutorial、best practice）を後へ回す。利用者が製品を使いながら異なる時点で同じ記事を参照する、という前提で、関連する内容を1つの長い記事にまとめることも認める（combining 行13）。
- 必要な入力：対象者の前提知識、作業の大きさ（単発か、workflow全体か）、製品にquickstartがあるか。
- trade-off・失敗の仕方：種類の組合せを認める分、記事内の種類の境界は節の単位に移り、P35-O05のdirectory検査では見えない。tutorialとquickstartの境界は「作業の大きさ」と「複雑さ」で判断され、判定の基準は書き手に残る。
- 反例・適用しない場合：Diátaxisは種類の境界が崩れることを避けるべきものとする（P35-O02）。Diátaxisのtutorialはlessonとしての学習体験で、github/docsのtutorial（実務の問題を解く、best practiceの議論を含む）とは同じ語で別の意味を持つ。
- 互換・非互換：P35-O04の並び順と組で使う。P35-O02とは、記事内で種類を混ぜるかどうかで対立する。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P35-O07 1つのsourceで複数の製品版の文書を出す（single-source versioningとfeature単位の版）（github/docs）
- 出典：github/docs、`content/contributing/writing-for-github-docs/versioning-documentation.md` 行14–24（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/writing-for-github-docs/versioning-documentation.md#L14-L24）、行77–79（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/writing-for-github-docs/versioning-documentation.md#L77-L79）、行185–191（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/writing-for-github-docs/versioning-documentation.md#L185-L191）、行226–228（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/writing-for-github-docs/versioning-documentation.md#L226-L228）、行236–246（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/writing-for-github-docs/versioning-documentation.md#L236-L246）、行256–264（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/writing-for-github-docs/versioning-documentation.md#L256-L264）、行276–281（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/writing-for-github-docs/versioning-documentation.md#L276-L281）。`src/versions/lib/get-applicable-versions.ts` 行28–45（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/versions/lib/get-applicable-versions.ts#L28-L45）、行51–97（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/versions/lib/get-applicable-versions.ts#L51-L97）。信頼性ラベル：primary（運用文書とコード）。本文確認：済
- 何をしているか：
  - 版ごとに別fileを作らず、1つのMarkdown fileのfrontmatter `versions`で記事が出る製品・版を宣言し、本文中はLiquidの`ifversion`条件で版ごとの差分を出し分ける（文書 行20–24）。版の情報はURLにも入り、版をまたぐlinkで利用者を自分の製品の文書へ直接送れる（行16）。
  - index fileにも`versions`を要求するが、子の版から自動で版付けされる、と書く（行79）。
  - 新しい変更・機能には、製品名ではなく機能名で版付けする（feature-based versioning）。機能ごとのYAML（`data/features/`）に版の範囲を書き、機能が他の製品へ広がったときはそのYAMLだけを直す（行187–191）。
  - 版の解決コード`getApplicableVersions`は、`versions`がない場合と、旧形式の`versions: *`の場合にerrorを投げる（コード 行36–45）。`feature`キーの値に指定された機能のversionsを合成し（文字列でも配列でも受ける）、標準の版指定と機能由来の版の和集合を取る（行51–77）。該当版が1つもなければ、`doNotThrow`を指定しない限りerrorを投げる（行79–83）。次期・次々期releaseの版は、`includeNextVersion`を指定しない限り結果から除く（行90–94）。複数の機能が同じplanのkeyを持つ場合は、`Object.assign`により後の機能の値で上書きされる（行59–63）。
  - 版付けのbest practiceとして、不要な版付けを避ける、`not`・`else`のような暗黙の指定より明示の指定を使う、を挙げる。後者の理由として、新しい製品の版が追加されると`not`・`else`の結果が変わることを挙げる（文書 行276–281）。これらのbest practiceは必須ではない、と明記している（行238）。
- 解いている問題と前提：製品の版（plan、self-hosted版のrelease）ごとにUIと機能が異なるが、版ごとに文書を複製すると修正が多重になる（DRY、行20）。多くの機能はhosted版から先に出てself-hosted版へ順に届く、という製品の流れを前提にする（行189）。
- 必要な入力：製品・planの一覧と短縮名、self-hosted版のrelease一覧（P35-O08）、機能ごとの版の範囲。
- trade-off・失敗の仕方：文書と実装の食い違いがある。文書は「`versions`の下の`feature`は1つだけ、値も1つの機能名だけ」と書く（行226）が、コードのcommentと実装は配列で複数の機能を受け付ける（コード 行28–30、57–64）。また、本文に条件分岐が増えると、書き手とreviewerの読み取りが難しくなる。文書はその場合に段落ごとの重複を許す（行258、264）。
- 反例・適用しない場合：Primer・Carbon・GOV.UKの文書repositoryでは、製品の版ごとに文書を出し分ける仕組みは見当たらなかった（読んだ範囲）。Primerは機能の成熟段階をUI上のlabelで示す（P35-O12）。
- 互換・非互換：P35-O08（release一覧と廃止版の凍結）を入力にする。P35-O10（失効する内容の検査）とは、時間による変化を版で表すか、期限で表すかが異なる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。版の番号・件数は持ち込まない。

### P35-O08 製品のrelease一覧を1つのmoduleに置き、文書の版の範囲・最新・廃止をそこから導く（github/docs）
- 出典：github/docs、`src/versions/lib/enterprise-server-releases.ts` 行27–39（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/versions/lib/enterprise-server-releases.ts#L27-L39）、行60–62（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/versions/lib/enterprise-server-releases.ts#L60-L62）、行99–120（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/versions/lib/enterprise-server-releases.ts#L99-L120）。`content/contributing/writing-for-github-docs/versioning-documentation.md` 行73–75（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/writing-for-github-docs/versioning-documentation.md#L73-L75）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - self-hosted版のreleaseを、次期と次々期（frontmatterとrelease計画に使う）、supported（新しい順）、release candidate（RC期間中だけ番号、それ以外はnull）、deprecated（機能するredirectを持つものと旧来のredirect処理のものの連結）の配列で持つ（コード 行27–39、60–62）。
  - `latest`はsupportedの先頭、`latestStable`はRC中ならsupportedの2番目、そうでなければ`latest`、`oldestSupported`はsupportedの末尾として導く（行99–103）。
  - 日付のdataから、最古のsupported版の廃止予定日を取り、現在時刻と比べて廃止済みかを出す（行117–120）。
  - 文書は、廃止（closing down）したreleaseの文書はsite上でlinkしないが、凍結したsnapshotを恒久に残し、URLを知っていれば読める、と書く（文書 行73）。
- 解いている問題と前提：製品のrelease状態（次期・現行・RC・廃止）が変わるたびに、文書の版の範囲（P35-O07の`ghes: '>…'`のような範囲指定）の評価結果を一斉に変える。release状態の正本を1か所に置くことで、版の解決（`getApplicableVersions`の次期版の扱い）と表示を同じ値から導く。
- 必要な入力：releaseの番号と状態、release日・廃止予定日のdata。
- trade-off・失敗の仕方：文書と実装の食い違いがある。文書は同時にsupportする版の数を書く（行73）が、固定commitの`supported`配列の要素数はその数と一致していない（値は持ち込まない）。release一覧は手で更新する配列であり、更新と文書の記述の同期は人の作業に依存している。
- 反例・適用しない場合：hosted版（plan）のように番号付きreleaseを持たない版は範囲比較をせず、常に一致として扱う（`get-applicable-versions.ts` 行113–117：https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/versions/lib/get-applicable-versions.ts#L113-L117）。
- 互換・非互換：P35-O07の入力になる。P35-O12（Primerの成熟段階label）とは、文書の版を製品のreleaseで表すか、機能の段階で表すかが異なる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。版の番号・件数・日付は持ち込まない。

### P35-O09 style guideと文書templateの構造（原則・話題別の項目・外部guideへの委譲・節のtemplate）
- 出典：github/docs、`content/contributing/style-guide-and-content-model/style-guide.md` 行14–28（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/style-guide.md#L14-L28）。`.github/instructions/style-guide-summary.instructions.md` 行1–16（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/.github/instructions/style-guide-summary.instructions.md#L1-L16）。primer/design、`content/guides/contribute/documentation.mdx` 行8–31（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/guides/contribute/documentation.mdx#L8-L31）、行33–89（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/guides/contribute/documentation.mdx#L33-L89）、行91–104（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/guides/contribute/documentation.mdx#L91-L104）、行120–171（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/guides/contribute/documentation.mdx#L120-L171）。carbon-website、`src/pages/contributing/documentation.mdx` 行25–30（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/contributing/documentation.mdx#L25-L30）、行47–54（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/contributing/documentation.mdx#L47-L54）、行174–180（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/contributing/documentation.mdx#L174-L180）、行2112–2118（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/contributing/documentation.mdx#L2112-L2118）、行2502–2513（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/contributing/documentation.mdx#L2502-L2513）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - github/docsのstyle guideは、冒頭に「style」の原則（単純さ、文法の正しさより利用者にとっての最善、網羅より影響の大きい場面への集中、一貫性より明確さ、未収録の問いは原則から考えて決め、reviewerに説明できるようにする）を置き（行21–28）、以降を話題別の項目（alerts、code、error messages、links、procedural steps、release notes、titles、voice and tone、word choice等）で並べる。収録しない一般の文体の問いは外部の汎用style guideに委ねる（行18–19）。
  - 同じrepositoryに、AI agent向けの要約版（`.github/instructions/`）を置く。要約版はfrontmatterの`applyTo`で適用するpathを示し、日常の作業は要約版で行い、要約にない問いだけ全文を参照するよう書く（要約 行1–9）。全文の側のcommentは、全文を大きく変えたら要約も更新せよと書く（全文 行14–16）。両者の同期を検査する仕組みは今回探していない。
  - Primerの文書の指針は、原則（簡潔で親しみやすい、社内だけで通じる例を避ける、code例は本番品質）、想定読者と前提知識、voice and tone、文法、画像、参照（複製せずlinkする）、公開前の確認項目（綴り、linkの確認、機微情報がないこと、alt text）、componentの文書の節構成（description、usage、anatomy、options、interactions、accessibility（未解決の既知問題を含む）、related）を定める。
  - Carbonは、componentの文書がusage・style・code・accessibilityの各話題を覆うことを求め（行27–30）、usage templateのfrontmatterでは同じ4つを`tabs`として並べる（行53）。usage・style・code・accessibility・patternのMarkdown templateを示す。patternはcomponentより複雑なので節の順を変えてよいが、templateの話題はすべて覆え、とする（行2114–2118）。文章の注意は短い箇条（親しみやすく励ます調子、利用者へ直接話す（二人称の「you」は使ってよい、というMAYの書き方）、短文、sentence case）にまとめる（行2502–2513）。
- 解いている問題と前提：多数の書き手（社外の貢献者を含む）が同じ調子と構造で書くこと。全規則を網羅できない前提で、原則と委譲先を置く（github/docs）。
- 必要な入力：文書の想定読者、原則、話題別の規則、委譲先の外部guide、文書の種類ごとの節template。
- trade-off・失敗の仕方：全文と要約の二重管理は、更新漏れで食い違いうる（commentによる手作業の同期）。templateの節を「すべて覆え」とすると、該当しない節の扱い（Carbonはtemplateの節に`(optional)`の印を付ける。carbon-website `documentation.mdx` 行174）が必要になる。
- 反例・適用しない場合：Diátaxisは節や区画を先に作らない（P35-O03）。
- 互換・非互換：P35-O04・O06（種類と節の構成）と組で使う。Primerの公開前の確認項目は、P35-O10（失効する内容の検査）と同じく、公開物の鮮度・正確さを扱う。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。文言の例は写していない。

### P35-O10 期限付きの内容と廃止した頁の扱い（失効の印のlint、redirectとarchive頁）
- 出典：github/docs、`content/contributing/style-guide-and-content-model/style-guide.md` 行346–350（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/style-guide-and-content-model/style-guide.md#L346-L350）。`content/contributing/collaborating-on-github-docs/using-the-content-linter.md` 行121–125（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/contributing/collaborating-on-github-docs/using-the-content-linter.md#L121-L125）。`src/content-linter/lib/linting-rules/expired-content.ts` 行5–40（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/content-linter/lib/linting-rules/expired-content.ts#L5-L40）、行42–63（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/content-linter/lib/linting-rules/expired-content.ts#L42-L63）。`src/content-linter/style/github-docs.ts` 行132–141（https://github.com/github/docs/blob/2bd66de8cea336061c9ea060c9b37385136e6ab3/src/content-linter/style/github-docs.ts#L132-L141）。alphagov/govuk-design-system、`docs/contributing/handling-deleted-urls.md` 行1–13（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/docs/contributing/handling-deleted-urls.md#L1-L13）、行15–24（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/docs/contributing/handling-deleted-urls.md#L15-L24）、行40–63（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/docs/contributing/handling-deleted-urls.md#L40-L63）。`src/patterns/start-pages/index.md` 行1–7（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/start-pages/index.md#L1-L7）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - github/docsのstyle guideは、失効する内容は原則として書かない（行348）。書かざるを得ない場合は、content linterで期限を付けて追跡「できる」（you can use、MAYの書き方）とし、期限を内容の外で管理せずに済む、と書く（行350）。印は開始と終了のHTML commentの組で内容を囲む（linter文書 行125）。
  - lint規則`GHD038`（`expired-content`）は、開始commentの日付が今日以前なら、その内容を直すか消すか期限を延ばすよう報告する。規則の説明文は「must be remediated」だが、設定上の重大度はwarningである（github-docs.ts 行132–136）。`GHD039`（`expiring-soon`）は、期限前の一定期間に入った内容を報告する（期間の値は持ち込まない）。どちらの規則も開始commentの日付だけを見ており、終了commentとの対応はこの規則のコードでは検査していない（expired-content.ts 行17–23、54–63）。自動修正はない（行36）。
  - GOV.UK Design Systemは、頁やfolderを削除・改名するときに、redirectするかarchive頁に置き換えるかのどちらかが必要だ、と書く（handling-deleted-urls 行3）。使い分けは、名前を変えるだけか内容が同じならredirect、意図して削除したか節の構造が変わったならarchive頁、とする（行22–24）。archive頁は検索engineにindexされず、sitemapに通常は載らず、頁がなくなったこと、理由、代わりの内容を示す（行42–46）。
  - 実例として、`start-pages`のpatternは、archive用のlayoutと`ignoreInSitemap`を持つ頁に置き換えられ、新しいpattern（P35-O14）への置換を1文で示している（start-pages 行1–7）。ただし手順の1つ目（index.mdを持つfolderを同名の.md fileに置き換える）とは異なり、folderと`index.md`のまま残っている。理由は読んでいない。
- 解いている問題と前提：公開された文書が古くなっても利用者が正確だと信じて読むこと、外部からのlinkや検索結果が消えた頁を指し続けることを防ぐ。期限を付ける場合は、文書の外の管理表でなく内容自体に持たせられる（style guide 行350）。
- 必要な入力：内容ごとの期限日、削除・改名する頁の旧URLと移動先、削除の理由。
- trade-off・失敗の仕方：期限の印は書き手が付けた内容だけを追跡し、印のない古い内容は検出しない。重大度がwarningなので、期限切れでも公開は止まらない（設定を読んだ範囲）。archive頁は手順の一部が実例と一致しておらず、手順の遵守を検査する仕組みは見当たらなかった。
- 反例・適用しない場合：Primerのfeature onboardingは、告知の掲示に期間の上限を設けよと書くが、文書の期限を検査する仕組みは持たない（P35-O12）。
- 互換・非互換：P35-O07・O08（版による変化の表現）と補い合う。P35-O12の告知期間の制限と同じく、時間で古くなる内容を扱う。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。期間の値は持ち込まない。

### P35-O11 空の状態を原因（未使用・一時的に空・error）で分け、要素ごとに書き分ける（Primer Blankslate）
- 出典：primer/design、`content/ui-patterns/empty-states.mdx` 行10–50（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/ui-patterns/empty-states.mdx#L10-L50）、行86–98（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/ui-patterns/empty-states.mdx#L86-L98）。`content/components/blankslate.mdx` 行24–44（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/components/blankslate.mdx#L24-L44）。信頼性ラベル：primary（design systemの公式文書）。本文確認：済
- 何をしているか：
  - patternの文書は、empty stateの部品（graphic、primary text、secondary text（任意）、primary action、secondary action（任意）、border）ごとに、空の原因に応じた書き方を示す。原因の3区分「機能がまだ使われていない」「機能の性質上一時的に空」「何かが失敗した」をすべて書き分けているのはprimary textだけである（行24–28）。secondary textとprimary actionは「未使用」と「error」の2区分だけを書き分け（行34–36、42–44）、graphicとsecondary actionはerrorの場合の注意だけを書く。例えば、未使用ならprimary actionは作成の流れを始めるか機能へlinkし、errorなら解決・詳細・help入手のどれかへ導く（empty-states 行38–44）。errorではgraphicを遊びに使わない（行18）、secondary actionはほぼ持たない（行50）。
  - 初回体験（first time user experience）では、illustrationのBlankslateを使い、primary textで歓迎し、secondary textはより平易に教える、とする（行86–88）。
  - error状態では、回復できるなら何が起きたかと回復の道を示し、課題の完了・errorの解決・詳細の取得に役立つ別の道だけを示す（errorから遠ざけるためだけに別方向へ送らない）（行92–96）。
  - 同じrepositoryのcomponentの文書（blankslate.mdx）は、部品の説明からerrorの場合分けを持たず、primary actionを作成の流れへ導くものとだけ書く（行38–40）。また、graphicが装飾でなく意味を伝える場合は、その意味を本文の文で伝えるか、画像に文字の代替を付けるかのどちらかを求める、とaccessibilityの要件を加えている（行28）。pattern文書とcomponent文書で、空の原因の扱いが固定commitで一致していない。
- 解いている問題と前提：内容がない場所で、利用者に機能の目的と次の行動を伝える。空になる原因で、利用者に必要な情報と行動が異なる、という前提に立つ。
- 必要な入力：空の原因の区別、機能の目的、次の行動（作成の流れ、説明へのlink、help）。
- trade-off・失敗の仕方：pattern文書とcomponent文書が別々に更新され、片方にだけerrorの扱いが残っている。どちらを正とするかの記述は見当たらなかった。
- 反例・適用しない場合：Carbonは、空の状態の型を表で分け、error型をさらに原因別の表に分ける（P35-O13）。Carbonはerrorを空の状態の型の1つとして同じpatternの中で扱い、error状態の独立したpatternは計画中と書く。
- 互換・非互換：P35-O12（feature onboardingの入口としてのempty state）、P35-O13（Carbon）と比べられる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。repositoryはarchivedであり、公開site側の現行の内容とは異なりうる。文言の例は写していない。

### P35-O12 機能の導入（feature onboarding）を、近さ・離脱できること・掲示期間・衝突回避・始め中終わりで設計し、成熟段階をlabelで示す（Primer）
- 出典：primer/design、`content/ui-patterns/feature-onboarding.mdx` 行1–4（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/ui-patterns/feature-onboarding.mdx#L1-L4）、行8–43（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/ui-patterns/feature-onboarding.mdx#L8-L43）、行53–112（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/ui-patterns/feature-onboarding.mdx#L53-L112）、行114–137（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/ui-patterns/feature-onboarding.mdx#L114-L137）、行294–300（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/ui-patterns/feature-onboarding.mdx#L294-L300）、行351–372（https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/ui-patterns/feature-onboarding.mdx#L351-L372）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 対象を製品内の導入に限り、marketing頁やemail等は扱わないと範囲を書く（frontmatterのdescription、行3）。告知のcampaignを無期限に続けない（行12）。
  - 導入要素は、機能が恒久に置かれる場所の近くに置き、頁の主作業と機能の重要度に釣り合わせる（行16–21）。利用者を脱線させず閉じ込めない。閉じ方を明らかにし、別頁へのlinkは作業を失わないよう新しいtab・windowで開く（行23–26）。
  - campaignの限度を「なぜ（system triggerかuser triggerか、複数のrepository・組織に属する利用者での数え方）」と「いつ（全対象への掲示期間、1人あたりの表示回数の上限、閉じた操作の尊重）」で決める（行28–38）。上限の値は持ち込まない。
  - 同じ頁で同時に出る告知の衝突を避け、同じ頁の他の告知を確かめる（行40–43）。
  - 導入を始め（注意を引く。作業の開始時に見つかるならempty stateやbanner、別の作業中に見つかるならteaching bubbleなど閉じやすい要素：行71–72、81–82）・中（formやchecklistで作業を助ける：行87–89）・終わり（完了を確かめる）の流れとして設計し、開始と完了の定義を明確にする（行55–57、109–112）。
  - teaching bubble（頁の特定の場所の機能に注意を向けるpopover）の指針として、一度に1つだけ出す、目的を示す見出し、閉じ方の明示、隠れた要素を指さない、利用者がすぐに使えない機能には使わない、を挙げる（行114–137）。文字数の目安は持ち込まない。
  - empty stateを新機能の導入に使える、とし、特別な初回体験ではbrand色の強い表現を使えるが、初回UIがなくなった後の体験の変化に注意せよ、とする（行294–300）。
  - 機能の成熟段階（private preview、public preview、GA、closing down）をlabelで示し、各段階の公表・supportの範囲を表で示す（行358–370）。本文は主な段階を4つと書くが、表には3段階しかない（closing downの行がない）。private previewを越えなかった機能は廃止の段階を経なくてよい（行372）。
- 解いている問題と前提：新機能を知らせつつ、主作業を妨げない。告知が多数の機能から同時に出ること、利用者が複数のrepository・組織に属することを前提にする。
- 必要な入力：機能の配置場所、主作業、triggerの種類、掲示期間と表示回数の方針、同じ頁の他の告知、機能の成熟段階。
- trade-off・失敗の仕方：限度の値は文書の指針であり、表示回数や期間を数える仕組みはこのrepositoryの範囲外（読んでいない）。成熟段階の表は本文と行数が一致していない。
- 反例・適用しない場合：Carbonは、onboardingを、基本のempty stateと併用する任意の補助として位置付け、独立のonboarding patternは計画中としている（P35-O13）。github/docsは、製品の版の違いを文書の版付けで表し（P35-O07）、機能の段階のlabelは扱っていない（読んだ範囲）。
- 互換・非互換：P35-O11（empty stateの書き分け）を導入の入口に使う。P35-O10（期限付きの内容）と同じく、時間で古くなる告知を扱う。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。repositoryはarchivedである。上限の値・期間は持ち込まない。

### P35-O13 空の状態の型（no data・利用者の操作の結果・error管理）と、初回向けの代替（inline文書・onboarding・starter content）（Carbon）
- 出典：carbon-website、`src/pages/patterns/empty-states-pattern/index.mdx` 行21–23（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L21-L23）、行71–89（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L71-L89）、行119–139（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L119-L139）、行171–175（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L171-L175）、行272–285（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L272-L285）、行372–398（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L372-L398）、行436–456（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L436-L456）、行467–474（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L467-L474）、行506–522（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L506-L522）、行569–589（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L569-L589）、行605–608（https://github.com/carbon-design-system/carbon-website/blob/5e9cd1da43c32d3d3b991dc947b427f674da61a8/src/pages/patterns/empty-states-pattern/index.mdx#L605-L608）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - empty stateを、表示するdataがない時点と定義し、初回の利用に多いが、削除や利用不能でも使うとする（行21–23）。部品は、image（任意）、title、body（次の行動、必要なら空の理由と利点）、primary action（任意）、secondary action（任意。文書へのlink等）である。bodyの行動の示し方を、ボタン、本文中のlink、UI要素への誘導（将来の操作場所を教える）の3つから選ぶ（行71–89）。
  - 基本の型を表で3つに分ける。no data（初回、未投入）、利用者の操作の結果（検索結果なし、処理完了の確認）、error管理（権限、system、設定が必要）。各型に、use case、目標、いつ使うかの列を持つ（行130–139）。error管理はさらに、権限の問題・systemの問題・設定が必要・操作が未対応の4行で、「なぜdataがないか」と「利用者に何ができるか」を対にした表を持つ（行390–398）。
  - empty stateは、本来出る要素を置き換えて表示する（表なら列見出しや脚も出さない）。理由として、screen readerが表全体を読んでから空の通知に着く事態を避けることを挙げる（行274–279）。複数のempty stateが同時に出うる場所では、primaryボタンの重複を避ける（行171–175）、illustrationの繰り返しを避けて文字だけにする（行281–285）。
  - 初回向けの代替（in-depth alternatives）を表で3つに分ける。inline文書（主な機能の初回、削除後、設定が必要）、onboarding（初回。empty stateから任意で起動する導入の流れ）、starter content（初回。見本dataや事前設定で試しながら学ぶ）（行440–456）。主な資源には教育的な手法、従の資源には基本のempty stateで足りる、という目安を置く（行446–448）。
  - 代替それぞれに保守の負担を書く。inline文書は製品画像の更新と翻訳時の画像の地域化が要る（行471–474）。onboardingは通常は利用者の任意なので、基本のempty stateと併用する必要がある（行514–515）。starter contentを利用者が削除できる場合は、基本のempty stateを予備として要する（行573–574）。
  - 装飾のillustrationはscreen readerに読ませない（空のalt）とする（行578–589）。
  - error状態とonboardingの独立したpatternは計画中で、Relatedには「(future)」と記されている（行436–438、519–522、605–608）。
- 解いている問題と前提：dataのない場所を、利用者が作業を続けられる場にする。情報を増やすほど認知の負担が増える（行124–128）ため、状況と内容の量を釣り合わせる。
- 必要な入力：空の原因の型、資源が主か従か、errorの原因と利用者が取れる行動、onboarding・starter contentを用意できるか、翻訳の有無。
- trade-off・失敗の仕方：代替ほど保守の負担が大きい（画像の更新、翻訳、導入の流れの保守、行516–517）。onboardingの効果を測る手段として外部のonboarding serviceのmetricsに触れる（行512–513）が、測り方の仕組みはrepository内にない。
- 反例・適用しない場合：Primerは、型でなく部品ごとに原因別の書き方を書く（P35-O11）。GOV.UKは、serviceの入口を製品の外（GOV.UKの内容頁）に置く（P35-O14）。
- 互換・非互換：P35-O11と同じ問題の別の分け方である。onboardingを基本のempty stateと併用する点で、P35-O12（Primerのempty stateを導入の入口に使う）と互換である。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。寸法や配置の値は持ち込まない。

### P35-O14 serviceの入口を製品の外の内容頁に置き、利用可否の確認は入口でなくserviceの中の質問で行う（GOV.UK）
- 出典：alphagov/govuk-design-system、`src/patterns/start-using-a-service/index.md` 行11–19（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/start-using-a-service/index.md#L11-L19）、行21–39（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/start-using-a-service/index.md#L21-L39）、行41–72（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/start-using-a-service/index.md#L41-L72）。`src/patterns/check-a-service-is-suitable/index.md` 行13–17（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/check-a-service-is-suitable/index.md#L13-L17）、行21–50（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/check-a-service-is-suitable/index.md#L21-L50）、行52–61（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/patterns/check-a-service-is-suitable/index.md#L52-L61）。信頼性ラベル：primary（pattern文書）。本文確認：済
- 何をしているか：
  - 公衆向けのserviceはGOV.UKの内容頁から始まらなければならない、とする。開始点の頁はGDSの内容チームがGOV.UKの公開用appで作り、GOV.UK Frontendとは別である。本patternは開始点を試作して利用者の流れをできるだけ試すために使う（start-using 行11–19）。
  - 開始点が持つものを列挙する。serviceが何をし利用者の必要に合うかを判断できるだけの情報、行動と一致する文言のボタン、sign-in・申請の再開・登録内容の更新（該当する場合）、多くの利用者が始める前に要る情報（費用や所要の目安）、online以外の利用経路。必要な書類・情報の一覧は、開始点に置くか、serviceの中の別頁に移す（行23–33）。
  - 複雑な利用資格の情報は開始点に置かず、serviceの中で質問して判定する（行35–37）。
  - 開始点の形式の選択肢は、開始点をmainstream（一般向け）とWhitehallのどちらの内容として公開するかで変わる（行43–45）。mainstreamの開始点では、文脈が少なくて済むなら単純な開始頁、より広い手続きの説明が要るなら複数頁のguideの中の申請節、と分ける。後者は、文脈を読まずに始めて誤った行動をとることを避ける理由を挙げる（行49–64）。mainstreamでないserviceでは、Whitehallのappを使える部署の公開者が「detailed guide」形式で単純な開始頁を作れる（行70–72）。
  - 「check a service is suitable」は、複雑な利用資格の要件がある場合に、簡単な質問の連続から利用資格・費用・受け取れる額・所要を自動で判断し、結果頁で示す（check 行21–46）。年齢制限や締切のような一般の規則は開始頁に書く（行48）。serviceの中で再び聞くことになる質問は避ける（行50）。利用資格がなければ理由を説明し、可能なら（if possible）代わりにすべきことを示す（行61）。開始頁に無理なく書けるなら本patternを使わない（行34–36）。
- 解いている問題と前提：利用者が検索やnavigationからserviceを見つけ、始める前に自分に合うかを判断できるようにする。serviceが政府の公開siteの一部として、別の内容チームと公開経路を持つという組織の前提がある。
- 必要な入力：serviceの名前と目的、開始の行動、利用資格の要件の複雑さ、必要書類、online以外の経路。
- trade-off・失敗の仕方：開始点の内容は別の内容チームとの合意が要る（行19）。開始頁に一般の規則を置くこと（check 行48）と、開始点に複雑な資格情報を置かないこと（start-using 行37）の境界は、規則の「一般さ」「複雑さ」の判断に依存する。
- 反例・適用しない場合：Primer・Carbonは、製品内の空の場所（empty state）を初回の入口として扱う（P35-O11・O13）。GOV.UKの開始点は製品の外の内容頁であり、入口が製品の内か外かが異なる。旧`start pages`は置換済みでarchive頁になっている（P35-O10）。
- 互換・非互換：P35-O06（github/docsのget startedに最小限だけを置く方針）と、入口に置く情報を絞る点で互換である。P35-O10のarchive頁の実例と同じrepositoryにある。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。P07・P23で読んだ箇所（P07はformとvalidation等、P23は研究知見の共有・継続的な研究・contribution criteria・component lifecycle等の運用の頁）とは別の箇所である。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 文書の種類の分け方 | Diátaxis：行為／認識と獲得／適用の2軸で4種類。境界が崩れることを避ける（O01・O02） | github/docs：get started、concepts、how-tos、reference、tutorials等の列挙。1記事に種類を組み合わせてよい（quickstart・tutorialを除く）（O05・O06） | 種類を利用者の必要の理論から導くか、運用上の入口と記事の単位から決めるか |
| 種類の判定・検査 | Diátaxis：書き手が2つの問いで判定（O01） | github/docs：directory名とfrontmatterの一致をlintで検査。種類別directoryへ移行済みの製品だけ（O05） | 判定を人に置くか、置き場所の機械検査に置くか |
| 構造の作り方 | Diátaxis：空の区画を先に作らず、改善から構造を生じさせる（O03） | github/docs：階層と各層の条件を先に定める（O04）。Carbon：節のtemplateを先に定め、すべて覆う（O09） | 継続改善の個人・小集団か、多数の書き手の一貫性か |
| 文書の版と製品の版 | github/docs：1 source＋frontmatterの版範囲＋Liquid条件＋機能単位の版。release一覧を1 moduleに置く（O07・O08） | Primer：機能の成熟段階をUIのlabelで示す（O12）。Diátaxis・Carbon・GOV.UK：文書の版の仕組みは見当たらず | 製品に複数の配布形態・releaseがあるか |
| 古くなる内容 | github/docs：内容に期限の印、lintでwarning（O10） | GOV.UK：削除・改名した頁はredirectかarchive頁（O10）。Primer：告知の掲示期間・表示回数に上限（O12） | 内容の期限か、URLの存続か、UI上の告知か |
| 空の状態の分け方 | Primer：部品ごとに原因に応じて書き分け。3区分（未使用・一時的に空・error）をすべて書き分けるのはprimary textだけで、他の部品は2区分またはerrorの注意だけ（O11） | Carbon：型（no data・操作の結果・error管理）の表と、errorの原因別の表（O13） | 文書を部品の解剖から書くか、状況の型から書くか |
| 初回の導入 | Primer：近さ、離脱可能、掲示の限度、衝突回避、始め中終わり（O12） | Carbon：inline文書・onboarding・starter content。onboardingは基本のempty stateと併用（O13） | 導入を告知のcampaignとして扱うか、空の場所の代替として扱うか |
| serviceの入口 | GOV.UK：製品外の内容頁を開始点にし、資格の判定はserviceの中の質問で（O14） | github/docs：get startedに最小限（quickstartと製品の説明）だけ（O06） | 入口が別組織の公開経路か、同じ文書site内か |
| style guideの構造 | github/docs：原則＋話題別の項目＋外部guideへの委譲＋AI向け要約（O09） | Primer：原則・読者・調子・文法・公開前確認・component文書の節。Carbon：tab別template＋短い文章の注意（O09） | 網羅をあきらめて原則で補うか、templateで節を固定するか |

## 見つからなかったこと・gap
- help（製品内の文脈helpやtooltip、help center）の構造は、Primerのteaching bubble（O12）以外には読めなかった。製品内helpと外部文書のlinkの対応（どのUIからどの文書へ飛ぶか、linkの切れの検査）を扱う設計文書は、読んだ範囲になかった。
- onboardingの効果の測定（完了率、離脱）の仕組みは、Carbonが外部serviceのmetricsに触れるだけで、repository内に測定の設計はなかった。Primerの表示回数・期間の上限を数える実装も、このrepositoryの範囲外である。
- empty stateの実装（Primer ReactのBlankslate、Carbon Reactのcomponent）は読んでいない。文書が書く「空の原因の区別」がcomponentのAPIにどう表れるかは確認していない。
- PrimerのpatternとcomponentのBlankslate文書の食い違い（O11）、feature onboardingの成熟段階の本文と表の食い違い（O12）、github/docsのfeature版付けの文書とコードの食い違い（O07）、同時support数の文書と配列の食い違い（O08）、GOV.UKのarchive手順と実例の食い違い（O10）が見つかった。どちらを正とするかの記述は、いずれも見当たらなかった。
- 文書の翻訳と版の関係（翻訳文書がsource文書のどの版に追従しているか）は、Diátaxisの`translation/`（.po）とgithub/docsの翻訳の仕組みを読んでいないため確認していない。
- ADR形式の設計記録は、5 repoとも読んだ範囲では見当たらなかった（判断の根拠は文書本文、code comment、issueにある）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repoを作業用の一時領域へ`git clone --filter=blob:none --no-checkout`（core.hooksPathを無効化）し、固定commitの各fileを`git show`で読んだ。build・test・script・hook・lint・package managerは実行していない。gh apiの呼出しは約12回（metadata、license、primer orgのrepository一覧）。
- diataxis-documentation-framework：`source/compass.rst`（全体）、`source/map.rst`（全体）、`source/how-to-use-diataxis.rst`（全体）、`source/reference.rst`（60–97付近）、`source/application.rst`（1–32）、`README.rst`（冒頭）、`LICENSE.rst`（冒頭）。読んでいないもの：`tutorials.rst`・`how-to-guides.rst`・`explanation.rst`・`tutorials-how-to.rst`・`reference-explanation.rst`の本文、`theory.rst`、`foundations.rst`、`quality.rst`、`translation/`。
- github/docs：`content/contributing/style-guide-and-content-model/`の`about-the-content-model.md`（全体）、`about-combining-multiple-content-types.md`（全体）、`get-started-content-type.md`・`quickstart-content-type.md`・`tutorial-content-type.md`（12–62）、`style-guide.md`（1–40、見出し一覧、346–351）。`content/contributing/writing-for-github-docs/versioning-documentation.md`（全体）、`using-yaml-frontmatter.md`（`versions`・`layout`の項の検索のみ）、`content/contributing/collaborating-on-github-docs/using-the-content-linter.md`（121–145）。`src/versions/lib/enterprise-server-releases.ts`（1–120）、`get-applicable-versions.ts`（全体）、`src/frame/lib/frontmatter.ts`（54–68）、`src/content-linter/lib/linting-rules/frontmatter-content-type.ts`（全体）、`expired-content.ts`（全体）、`src/content-linter/style/github-docs.ts`（130–142）、`.github/instructions/style-guide-summary.instructions.md`（1–20）、`LICENSE-CODE`（冒頭）。読んでいないもの：`how-to`・`concepts`・`reference`・`troubleshooting`・`release-note`の種類の文書本文、`templates.md`、`src/versions/middleware/`、`DeprecationBanner.tsx`、`VersionPicker.tsx`、`all-versions.ts`、`data/features/`、翻訳の仕組み。
- primer/design：`content/ui-patterns/empty-states.mdx`（全体）、`feature-onboarding.mdx`（全体）、`content/components/blankslate.mdx`（全体）、`content/guides/contribute/documentation.mdx`（1–171）、`README.md`（冒頭）。読んでいないもの：`ui-patterns/degraded-experiences`、`components/label`、Primer React・ViewComponentsの実装。
- carbon-website：`src/pages/patterns/empty-states-pattern/index.mdx`（全体）、`src/pages/contributing/documentation.mdx`（1–215、見出し一覧、2112–2125、2502–2522）。onboardingの独立patternの有無をpath名で確認した（`developing/carbon-mcp/onboarding-and-setup.mdx`以外になし）。読んでいないもの：`patterns/loading-pattern`・`notification-pattern`・`disabled-states`、各tutorialの本文、Carbon Reactの実装。
- govuk-design-system：`src/patterns/start-using-a-service/index.md`（全体）、`check-a-service-is-suitable/index.md`（全体）、`start-pages/index.md`（全体）、`docs/contributing/handling-deleted-urls.md`（全体）。archive用layoutを使う頁の数をpathとlayout名で確認した。読んでいないもの：`interruption-pages`、`confirmation-pages`、`page-not-found-pages`、`service-unavailable-pages`、`step-by-step-navigation`。
- 検索した語（path名とfile内）：`empty`、`onboard`、`blank`、`first time`、`getting started`、`help`、`tutorial`、`how-to`、`reference`、`explanation`、`content-model`、`style guide`、`versioning`、`contentType`、`expir`、`layout-archived`。
- 選ばなかった候補：google/styleguide（code styleの文書で、利用者向け文書のstyle guideではない。metadataのみ）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：本書の多くは、design systemや文書運用の「指針の文書」（pattern文書、contributing文書）からの観察であり、実装（lint規則、版の解決コード）からの観察はgithub/docsに限られる。指針の文書と実装、また同じrepository内の2つの文書が食い違う例が複数あった（O07、O08、O10、O11、O12）。食い違いをどちらの由来として記録するかは未決。
- scope：観察は、文書の種類と構造、文書の版、空の状態とonboardingのUI指針、serviceの入口にまたがる。D10（UX・Interaction）に置くか、文書・運用の領域と分けるかは未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。Diátaxisは方法論の主張で、適用の結果の証拠を含まない。
- 版：固定commit SHAで版を表す。primer/designはarchivedで、公開siteの現行内容とrepositoryの固定commitが一致する保証はない。github/docsのrelease一覧のように、上流で頻繁に更新されるfileを根拠にした観察の再確認の時期は未決。
- license：DiátaxisはAPIでNOASSERTION、LICENSE fileはCC-BY-SA 4.0、github/docsは内容がCC-BY-4.0・コードがMITと分かれる。repository単位のSPDXでなく、file種別ごとのlicenseをどう記録するかは未決。
- 状態：全観察（P35-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
