# P23 利用者調査の方法：目的と問い、方法の選び方、募集と同意、記録とPII、発見から設計判断へ、研究記録の版の観察（D10 UX / Interaction）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法、件数、期間、金額等）は持ち込まない。技術選定・採用推奨ではない。

埋めようとしたgap：[D10 UX / Interaction](../../brain-domain-material-inventory-20261004/materials/D10-ux-interaction.md) §4 gap「利用者調査の方法（interview、usability test、観察）と結果の扱い」。D10-M07は人の反応の扱いを持つだけで、調査の方法の知識は無い、とされている。

本テーマはコードではなく、公開repositoryにある調査手法集・研究ガイド・design systemの研究記録の**文書の構造**を観察した。参加者の個人情報、発言の引用、調査結果の中身は書かない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| 18F/guides | https://github.com/18F/guides | debc24b34f23686194d9fe42e391859d569bd39a（default branch: main） | NOASSERTION（LICENSE.md冒頭：「As a work of the United States government, this project is in the public domain within the United States of America.」、続けてCC0 1.0 Universalによる権利放棄を宣言） | false | 2026-10-05 | 米国GSA 18Fの研究ガイド（`content/ux-guide/research/`）と方法カード集（`content/methods/`）の現行版。下の18F/methods・18F/ux-guideを統合した後継で、計画、募集、同意、記録、PII、分析、判断への接続、引継ぎまでを1つの工程として書いている |
| 18F/methods | https://github.com/18F/methods | 6628c6f090ff20ad32ae81e25f2743d33e82292d（main） | NOASSERTION（LICENSE.md冒頭：「As a work of the United States Government, this project is in the public domain within the United States.」、続けてCC0 1.0 Universal） | true | 2026-10-05 | 方法カード集の旧repository（archived）。方法カードの雛形（`_methods/_template.md`）と、方法を工程の段に割り当てるdata（`_data/categories.yml`）が独立fileとして残っており、構造を読みやすい。後継（18F/guides）との差分から研究文書の版の扱いを読む |
| 18F/ux-guide | https://github.com/18F/ux-guide | e6698db059b46f84bc97e600935e334a945b2cc5（main） | NOASSERTION（LICENSE.md本文：「As a work of the federal government, this project is in the public domain within the United States.」、続けてCC0 1.0 Universal） | true | 2026-10-05 | 研究ガイドの旧repository（archived）。研究計画の雛形の旧形を後継と比べるために読んだ |
| alphagov/govuk-design-system | https://github.com/alphagov/govuk-design-system | d1b51e67c01d841d7cba58a29ef1f74384cb7b34（main） | MIT | false | 2026-10-05 | 英国GDSのdesign system。component・patternの各頁に「Research on this component/pattern」節を持ち、外部チームからの研究知見の受付、lifecycle status（Trial／Stable）、contribution criteriaを研究の証拠に結び付けている |
| alphagov/govuk-design-system-backlog | https://github.com/alphagov/govuk-design-system-backlog | 4ce8cebd66dc2dcddd388d0e3de2ad8504e4aa43（main） | GitHub APIの値はnull（repositoryにLICENSE fileは無い） | false | 2026-10-05 | GOV.UK Design Systemの共同backlog。頁の記述pattern（研究節の雛形）、提案のissue template、working groupの判断記録の雛形、個別の受入れ基準の雛形を持つ |
| uswds/uswds-site | https://github.com/uswds/uswds-site | 69c76d6c85b3c8c322dc38e4613e43451a34a06a（main） | NOASSERTION（LICENSE.md冒頭：「As a work of the United States government, this project is in the public domain within the United States.」、続けてCC0 1.0 Universal） | false | 2026-10-05 | 米国USWDSの文書site。研究programの頁、参加者の種類ごとの募集頁、頁単位のchangelog data、componentごとの研究知見の節を持つ |

（alphagov/govuk-frontend、cfpb/design-systemはmetadataだけ確認した（前者MIT、後者CC0-1.0）。本文は読んでおらず、観察には使っていない。）

## 観察

### P23-O01 調査の種類を「答える問い」で分け、方法集の段（Discover／Decide／Make／Validate／Fundamentals）に対応させる
- 出典：18F/guides、`content/ux-guide/research/clarify-the-basics.md` 行55–105（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/clarify-the-basics.md#L55-L105）。18F/methods、`_data/categories.yml` 行1–60（https://github.com/18F/methods/blob/6628c6f090ff20ad32ae81e25f2743d33e82292d/_data/categories.yml#L1-L60）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - 研究ガイドは、調査を background（既に分かっていること）、foundational（何の問題を解くか）、descriptive（誰・何のために解くか）、generative（目標・行動・痛点、文脈、機会）、evaluative（正しい物を作っているか、正しく作っているか）に分ける。各種類に「この調査が助ける問い」を書く。backgroundは全projectで行う前提とする。冒頭で「計画している判断に役立つ調査だけを含める」と書く（行56）。
  - 各種類は方法集の段（Discover、Decide、Make、Validate）へ相互linkされる。方法集側は`categories.yml`で段ごとに説明と所属する方法名の一覧を持ち、さらに段に属さない「Fundamentals」（Compensation、Privacy、Recruiting）を「募集の前に読む」基礎として置く（行54–60）。
  - 工程は Plan → Do → Make research actionable の3段で、projectの中で繰り返す（clarify-the-basics 行98–105）。
- 解いている問題と前提：方法を先に選ぶのではなく、どの判断に答える調査かから方法を選ぶ。projectは期間が限られ、調査は判断のためにだけ行う前提である。
- 必要な入力：今後の判断の一覧、その判断に必要な問い、既存の知見（background）。
- trade-off・失敗の仕方：種類の境界は文書上も重なる（generativeの説明文が同じ段落内で2回繰り返される、行77・79）。方法の所属段は1つに固定されるため、同じ方法を複数の目的に使う場合の位置付けは本文の相互linkに頼る。
- 反例・適用しない場合：USWDS（P23-O13）は種類を「新しい知識を生む方法」と「既存の案を評価する方法」の2群にしか分けていない。GOV.UK Design System（P23-O08〜O11）は種類の分類を持たず、component単位の証拠の有無で整理する。
- 互換・非互換：P23-O02（計画の節）の「Goals」「Methods」に入力を渡す。P23-O03（方法カードのschema）が段の値を持つ。
- 限界：種類の数・名前は18F固有であり、HELIXへ持ち込まない。

### P23-O02 研究計画（research protocol）の節と、「研究の問い」と「質問項目」の区別
- 出典：18F/guides、`content/ux-guide/research/plan.md` 行34–100（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/plan.md#L34-L100）、`content/ux-guide/research/clarify-the-basics.md` 行124–138（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/clarify-the-basics.md#L124-L138）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 研究計画を「研究の設計を記述するもの」と定義し、典型的な節として Background、Goals、Research questions、Methods、Team participation、Timeline、Participants and recruiting、Ethics considerations、Outputs and outcomes を挙げる（plan.md 行34–47）。雛形に従うことより、計画を作ること自体を求める（行48）。
  - Goalsは「describe」「evaluate」「quantify」「identify」のように出力を特定する動詞で書き、「understand」「explore」を避ける（行61）。Research questionsは「より良い証拠に基づく判断のために何を学びたいか」を表す高い水準の問いで、interviewで聞く質問とは別物とする。悪い問い・良い問いの対で示す（行77–82）。
  - Methodsは「目標と問いに合う方法を1つ以上」選び、複数の方法で互いに検証することを勧める。方法集は「出発点であり制約の一覧ではない」とする（行87–89）。
  - clarify-the-basicsの「Good practices」は、研究の問いと質問項目を別に決めること、参加者が stakeholder／user／一般公衆のどれかを明確にすること（stakeholderにuserの代弁をさせない）、research lead を置くことを挙げる（行124–138）。
- 解いている問題と前提：調査の目的が曖昧なまま質問を作ると、判断に使えない結果になる。目的→問い→方法→参加者の順に分けて書き、チームと相手機関で合意する前提である。
- 必要な入力：調査の背景・既存の知見、判断の期限、参加者の区分、役割の担当者。
- trade-off・失敗の仕方：計画の雛形は任意とされ、節の欠落は検出されない。良い問い・悪い問いの判定は例示だけで、判定の手順はない。
- 反例・適用しない場合：GOV.UK（P23-O09）は計画ではなく、事後の研究記録（頁の研究節）に構造を持たせている。外部チームの知見は計画なしで受け付ける（P23-O10）。
- 互換・非互換：P23-O01（種類）を前提にする。P23-O04（募集基準）は「研究の問いに相対的に」定めるとされ、本観察の問いに依存する。P23-O14（雛形の版の変化）で節の構成が変わっている。
- 限界：期間の見積り例・作業日数などの値は持ち込まない。

### P23-O03 方法カードの共通schema（what／why／所要時間／段／政府での考慮）
- 出典：18F/methods、`_methods/_template.md` 行1–42（https://github.com/18F/methods/blob/6628c6f090ff20ad32ae81e25f2743d33e82292d/_methods/_template.md#L1-L42）。18F/guides、`content/methods/validate/usability-testing.md` 行1–59（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/methods/validate/usability-testing.md#L1-L59）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 雛形は front matter に `title`、`permalink`、`description`、`category`、`what`（1行の「何」）、`why`（短い「なぜ」）、`timeRequired`、`governmentConsiderations` を持つ。本文は「How to do it」（番号付き手順）、「Example from 18F」、「Additional resources」、「Considerations for use in government」の節に分かれる。政府での考慮節には、標準文言として「PRA（Paperwork Reduction Act）への影響なし、公衆から情報を集めない」を置く（行40）。
  - 現行版のusability testingのカードは、手順を「対象を選ぶ→計画（scenario、参加者と募集、moderatorと観察者）→募集と同意→実施（録画の口頭確認、think aloud、観察者は進行を妨げずissue logへ）→結果の議論（今後の設計判断にどう使うかを決めて終える）」の順に書く（行22–28）。政府での考慮節は、どの法令上の除外に当たるかを条文番号で書き、RecruitingとPrivacyのカードへ送る（行53–58）。
- 解いている問題と前提：方法ごとに「何・なぜ・どのくらい・どの段・法令上の扱い」を同じ欄で比べられるようにする。法令（PRA等）の適用が方法ごとに違う前提である。
- 必要な入力：方法の目的、手順、所要時間の目安、適用法令の判断。
- trade-off・失敗の仕方：所要時間・参加人数は方法カードに直接書かれ、計画（P23-O02）側の見積りと別に管理される。法令の考慮は米国連邦政府の文脈に固定されている。現行版のカード本文に、前後の手順と無関係な1語（`main`）が残っている（usability-testing.md 行29）。
- 反例・適用しない場合：USWDS（P23-O13）は方法を自前で定義せず、18Fの方法集へlinkする。GOV.UKは方法の一覧を持たず、研究記録側に「方法」欄を置く（P23-O10）。
- 互換・非互換：P23-O01（段）の値を持つ。P23-O14（版の移行）でschemaの置き場所が変わった。
- 限界：所要時間・人数などの値は持ち込まない。法令の内容はHELIXに当てはまらない。

### P23-O04 参加者の募集：参加者群の特定、募集基準、参加者の安全、届きにくい群
- 出典：18F/guides、`content/ux-guide/research/plan.md` 行134–184（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/plan.md#L134-L184）、`content/methods/fundamentals/recruiting.md` 行21–30（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/methods/fundamentals/recruiting.md#L21-L30）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 募集を「参加者群の特定」と「募集基準の定義」に分け、どちらも研究の問いに相対的に決めるとする（plan.md 行136、159）。多様な利用者のうち、障害や支援技術の利用者、digital skillや読み書きに制約のある人、支援を要する人、internet接続の限られた人を特に検討する（行148–153）。
  - 募集基準の例として、属性、特定の利用者層、特定の経験、困難な状況、service へのaccessの仕方を挙げ、usability testでは道具の知識と領域の知識の水準も考えるとする（行161–171）。基準はチームで見直す。
  - 「参加者の安全」を募集の要素として独立させ、最も弱い状態の人を募集しないこと、組織内調査で同僚の観察が参加者を萎縮させうることを挙げる（行175–182）。
  - 方法カード側は、募集先を「今使っている人／最近使った人／以前使った人／似た物を使う人」の近さの順に並べ、到達経路を別に並べる（recruiting.md 行21–30）。
- 解いている問題と前提：誰から学ぶかで結果が変わる。手近な人（友人・同僚）に偏ると、本来の利用者を代表しない。届きにくい群は、関係を持つ組織を通さないと募集できない前提である。
- 必要な入力：研究の問い、利用者群の仮説（既存のpersona等）、届きにくい群へ到達する経路、参加者への害の見立て。
- trade-off・失敗の仕方：基準を細かくするほど募集に時間がかかる、というのは本書の推論である（原文に基準の細かさと時間の関係の記述はない）。原文は、相手機関が地域の組織・communityとの関係を持たない場合に、募集が設計調査で最も時間のかかる部分になりうる、と書く（plan.md 行259–263）。安全のために弱い状態の人を外すと、その状態の経験は間接的にしか得られない。
- 反例・適用しない場合：USWDS（P23-O13）は募集を常設のsign-up（参加候補者の名簿への登録）で受け、研究ごとの基準は頁に書いていない。GOV.UK（P23-O10）は「Design Systemを使う人なら職位・経験を問わない」常設の募集を、試行として置く（continuous-research 行10）。
- 互換・非互換：P23-O02（研究の問い）に依存する。P23-O05（同意）とP23-O06（rosterと分離保管）が募集の後に続く。
- 限界：属性の例示・年齢範囲・期間などの値は持ち込まない。米国の法令・行政命令への言及は観察の対象外とした。

### P23-O05 informed consentを「参加者が理解すべき事項の一覧」と、録音の別同意・撤回を持つ同意書として表す
- 出典：18F/guides、`content/ux-guide/research/do.md` 行194–234（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/do.md#L194-L234）、`content/ux-guide/resources/participant-agreement.md` 行35–59（謝礼なし版、https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/resources/participant-agreement.md#L35-L59）、行76–98（謝礼あり版、https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/resources/participant-agreement.md#L76-L98）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 同意を得る理由を、参加者の理解、倫理、privacy法令、予算法令、障害者関連法令への適合に分けて書く（do.md 行198–204）。
  - 参加者が理解すべき事項を一覧にする：誰が調査するか、目的、所要時間、集めるdataとその使い方・保持期間、起こりうる危険や不快、結果の使い方と共有先、どの質問も断れ、いつでも罰なく止められること、権利と苦情の申立先（行211–220）。加えて、観察者の有無と誰か、録画の有無と方法、画面共有の要否を伝える（行224–228）。
  - 同意書が事前に署名されていなければ口頭で同意を得る（行211）。記録の保持計画が後で変わった場合、参加者へ伝える責任を調査者に置く（行234）。
  - 同意書の雛形は、謝礼の有無で2版を持つ。謝礼なし版は行35–59、謝礼あり版は行76からである。各版は、任意参加と途中終了、謝礼、情報の使い方、録音の可否（参加者が別にcheckする欄）、privacyの保護、同意の撤回（期限付き、連絡先付き）の段落で構成される（participant-agreement.md 行35–59）。
- 解いている問題と前提：参加者が何に同意しているかを、調査者と参加者の双方が同じ一覧で確かめる。録音は参加そのものと別に同意を取る対象とする。
- 必要な入力：調査の目的、集めるdataの種類と保持期間、共有先、観察者、録画の方法、謝礼の有無、撤回の受付先。
- trade-off・失敗の仕方：一覧は文書の雛形で、どの項目が満たされたかを記録する欄はない（署名欄と録音のcheckだけ）。口頭同意の記録方法は書かれていない。撤回の期限は雛形の空欄で、調査ごとに決める。
- 反例・適用しない場合：GOV.UK（P23-O10）は外部チームに対し、研究知見を共有する前に参加者の同意を得ることを求めるだけで、同意の中身は外部の service manual へ送る。USWDS（P23-O13）は募集頁で「同意書の記入を求めることがある」と書くに留める。
- 互換・非互換：P23-O06（PIIの分離と削除）の前提になる。P23-O14の版の差分として、同意の理由に法令が1つ追加されている（旧版`18F/ux-guide`の同節には無い）。
- 限界：撤回期限、謝礼額などの値は持ち込まない。法令名は米国固有である。

### P23-O06 記録とPII：rosterと研究dataの分離、participant code、共有分析の前の匿名化、共有前の録音削除
- 出典：18F/guides、`content/ux-guide/research/plan.md` 行351–357（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/plan.md#L351-L357）、`content/ux-guide/research/privacy.md` 行28–60（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/privacy.md#L28-L60）、`content/ux-guide/research/make-research-actionable.md` 行72–74、133–137（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/make-research-actionable.md#L133-L137）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 参加者の名前・連絡先と、連絡・実施・謝意の進み具合、参加辞退を表で持つ「roster」を作る。roster、質問guide、録画、notesを入れるfolderはcore teamだけがaccessできるようにし、共有するnotesでは参加者番号を使う（plan.md 行353–357）。
  - PIIは文脈で決まるとし、声・写真・動画は常にPII、連絡先は組み合わせでPIIになるとする。集めないことを第一にする（privacy.md 行32–33）。
  - 運用の指針として、募集で集めた管理用data（連絡先等）と研究data（録画等）を分けて保管し、need-to-knowで共有する（行51）。録画・転記・reportでは仮名または参加者codeを使う（行55）。共有の分析・統合・共有の前にdataを匿名化し、引用は複数の参加者のうち誰の発言とも特定できないようにする。発言者を示す必要があれば本人の許可を得る（行56–59）。
  - 分析の段でも同じ匿名化を求め（make-research-actionable.md 行72–74）、共有の前に録音を削除し、録音を渡した相手にも削除を求める（行133–135）。
- 解いている問題と前提：チーム全体を調査に巻き込みたい一方、参加者の信頼を保つためにPIIの露出を抑えたい。この両立を、保管場所の分離、識別子の置換、工程の段（共有前）での削除で解く。
- 必要な入力：参加者ごとのcode、accessを限るfolder、どの段で何を消すかの決め、引用の許可の記録。
- trade-off・失敗の仕方：rosterとcodeの対応表が残る限り、再識別は可能である。rosterは案件の終了時に破棄する、とある（plan.md 行357）。研究dataの保持期間の既定は見つからない。「複数の参加者のどれとも取れる引用」に限ると、少数の参加者に固有の経験は引用しにくい。録音の削除は「good practice」とされ、義務ではない。
- 反例・適用しない場合：GOV.UK（P23-O10）は外部からの共有にPII自体を含めないことを求め、匿名化の手順は持たない。USWDS（P23-O13）は募集頁でprivacyを宣言し、手順は18Fの頁へ送る。
- 互換・非互換：P23-O05（同意で伝える保持期間・共有先）と対になる。P23-O07（記録の種類）で、どの記録がPIIになるかが決まる。P23-O11（引継ぎ）で再び問われる。
- 限界：保管systemや政府の承認制度は米国連邦政府の文脈である。

### P23-O07 session記録の種類（verbatim／interaction）と、debriefをsynthesisと区別する
- 出典：18F/guides、`content/ux-guide/research/plan.md` 行359–388（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/plan.md#L359-L388）、`content/ux-guide/research/do.md` 行380–393（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/do.md#L380-L393）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 記録方法を決める前に、必要な出力と共有分析に足る最も軽い記録は何か、参加者が受け入れやすい記録は何か、その記録に同意を得たかを問う（plan.md 行359–365）。
  - 記録の種類を、参加者の発言をそのまま書く verbatim notes、参加者の操作と反応を書く interaction notes、表、付箋、写真、録画、録音、文字起こしに分ける。verbatimは選択的に書くことで生じる認知の偏りを避けるためとし、記録者が2人いれば verbatim と interaction を別の文書で分担する（行367–379）。記録の目的を「欠席者が理解できる」「記憶が薄れても参照できる」「分析と統合の出発点になる」の3点で書く（行382–386）。
  - debriefは各sessionの直後に行い、記憶だけでなくnotesを使う。研究の問いにどう答えたか、主な主題、参加者が多く（少なく）語った質問、新しい問い、新しく話を聞くべき人を記録する（do.md 行380–392）。debriefはsynthesis（全sessionを通じた統合）ではない、と区別する（行382）。
- 解いている問題と前提：session中の記録に解釈が混じると、後の分析で偏りを取り除けない。記録（観察）と解釈（debrief、synthesis）を段として分ける前提である。
- 必要な入力：記録者の人数、参加者の同意（P23-O05）、debrief worksheet。
- trade-off・失敗の仕方：verbatimは量が多く、録画・文字起こしはPII（P23-O06）を増やす。debriefとsynthesisの境界は本文で区別されるが、debriefの記録をsynthesisへどう渡すかの形式は決まっていない。
- 反例・適用しない場合：方法カードのusability testing（P23-O03）は、観察者が session 中に共有の issue log へ書く方式を挙げており、観察と集計を同時に行う。GOV.UKの外部共有（P23-O10）は記録の種類を問わず、要約された「Insights」と「Methods」だけを受け取る。
- 互換・非互換：P23-O06（記録がPIIになる）と緊張関係にある。P23-O08（発見から判断へ）の入力になる。
- 限界：道具名や契約手続きは18F固有で、観察に含めない。

### P23-O08 発見を判断に結び付ける：研究の問いに照らした意味づけ、成果物、次のsprintへの反映、品質の指標
- 出典：18F/guides、`content/ux-guide/research/make-research-actionable.md` 行36–55、93–127、146–151（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/make-research-actionable.md#L93-L127）、`content/ux-guide/resources/usability-test-quality-heuristics.md` 行28–58（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/resources/usability-test-quality-heuristics.md#L28-L58）、`content/ux-guide/research/plan.md` 行309–317（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/research/plan.md#L309-L317）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 研究計画の段で、outputs（共有のための文書・図）と outcomes（研究で起きると期待する変化。goalsに結び付ける）を分けて合意する。何が見つかるか分からないため、outputsを細かく約束しすぎないとする（plan.md 行309–317）。
  - 意味づけは常に計画で決めた研究の問い・問題記述に照らして行う（make-research-actionable.md 行36–55）。
  - 「Insights into action」は、何ができるか、変更の影響、次に何をするかの3問に答える。そのための成果物（design hypothesis、design principles、persona、mental model、user scenario、user story、storyboard、journey map、service blueprint、prototype等）を方法集へlinkする（行93–117）。各調査の後に、チーム全体で次のsprintの作業がどう変わるかを特定する。user story化、優先順位づけ、roadmapへの組込み、指標の見直しを挙げる（行119–127）。
  - 共有の際に、1つの調査から引き出す結論に注意し、発見を誇張しない。元の目的の外で共有するときは文脈を外さない（行150–151）。
  - usability testの品質指標表は、Study design、Moderator style、Team participation、Sensemaking の各指標に「良い兆候／悪い兆候」を並べる。最後の指標「Incorporation of findings」は、発見が今後のuser storyや製品の改良に翻訳されることを良い兆候、reportがbacklogや開発に影響しないことを悪い兆候とする（heuristics 行52–58）。
- 解いている問題と前提：調査結果が棚に置かれたまま判断に使われない。研究の問い→発見→成果物→backlog・roadmapへの変更、という連鎖を工程として明示する。
- 必要な入力：研究の問い（P23-O02）、debriefとsynthesisの結果（P23-O07）、product ownerの優先順位づけ、roadmap。
- trade-off・失敗の仕方：判断への反映は「チームで特定する」とされ、どの発見がどの変更に至ったかの対応を記録する欄はない。品質指標は自己評価の表で、判定者は決まっていない。
- 反例・適用しない場合：GOV.UK（P23-O10）は、1件の知見ではすぐに動かず、複数のserviceからの証拠の蓄積を待って優先する。判断を発見1件ごとではなく、証拠の量で起こす。
- 互換・非互換：P23-O09（研究節の Next steps）、P23-O11（Trialからの昇格条件）と、発見から判断への接続を別の形で表している。
- 限界：優先順位づけの軸や枠組みは例示であり、持ち込まない。

### P23-O09 component・pattern頁の中に研究記録の節を固定する（研究の要約／既知の問題とgap／利用しているservice／次の調査）
- 出典：alphagov/govuk-design-system-backlog、`docs/DESIGN_SYSTEM_CONTENT_PATTERN.md` 行1–11、42–84（https://github.com/alphagov/govuk-design-system-backlog/blob/4ce8cebd66dc2dcddd388d0e3de2ad8504e4aa43/docs/DESIGN_SYSTEM_CONTENT_PATTERN.md#L42-L84）。alphagov/govuk-design-system、`src/components/character-count/index.md` 行103–136（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/components/character-count/index.md#L103-L136）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 頁の記述patternは、Overview、When to use、How it works、Research on this [component/pattern] の順に節を置く。研究節は、研究の文脈（単独で試したか、prototypeの一部か、live serviceか）と、試した利用者の種類（障害のある利用者、digital literacyの低い利用者等）を要約し、より詳しい研究notesへのlinkで終える。そのnotesは公開の場所に置く（行42–52）。
  - 研究節の下に、`Known issues and gaps`（既知の問題と研究のgap）、`Services using this [component/pattern]`（利用しているserviceの例）、`Next steps`（残る調査や答えるべき問い）を置く（行54–84）。experimentalなものは冒頭で「さらなる研究が要る」と研究節へlinkする（行9–11）。
  - 実際の頁（character count）は、研究の年と実施主体、どの試作で誰と試したか、その後の改修とその根拠issueへのlink、既知の問題（支援技術ごとの不具合と外部のissue）、利用service、「さらに研究が必要な問い」の箇条書きと共有の呼びかけ、の構成になっている。
- 解いている問題と前提：guidanceの根拠と未検証の範囲を、利用者が同じ頁で確かめられるようにする。研究の詳細は外部の公開記録（wiki、issue、blog）に置き、頁には要約とlinkだけを置く前提である。
- 必要な入力：研究の文脈と参加者の種類、詳細記録の公開URL、既知の問題、利用serviceの一覧、未解決の問い。
- trade-off・失敗の仕方：頁の研究節は要約であり、詳細記録が外部に移動・消失するとlinkが切れる（wiki・blog・旧backlog issueへの依存）。研究の年は本文に書かれるだけで、構造化された欄ではない。利用serviceの選び方には件数の上限があり、網羅ではない。
- 反例・適用しない場合：USWDS（P23-O13）は研究知見を独立したguidance fileにし、component定義の`guidance`一覧に入れた場合だけ表示する（全componentに研究節があるわけではない）。18Fの方法集は製品の部品を持たないため、この形はない。
- 互換・非互換：P23-O10（外部の知見を受ける discussion）と P23-O11（Trial status から研究節へのlink）が、この節を参照点として使う。
- 限界：利用serviceの件数上限、研究の参加人数などの値は持ち込まない。

### P23-O10 外部チームからの研究知見を共通templateで受け、証拠の蓄積で優先順位を決める
- 出典：alphagov/govuk-design-system、`src/community/share-research-findings/index.md` 行10–101（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/community/share-research-findings/index.md#L10-L101）、`src/community/continuous-research/index.md` 行10–48（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/community/continuous-research/index.md#L10-L48）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - design systemを使うservice teamに、自分たちの利用者研究の要約、試したprototype、analytics、頁の「Research on this...」節での呼びかけへの回答を共有するよう求める（share-research-findings 行10–21）。
  - 共有経路を、GitHubの公開discussion（component・patternごとに1つ）と、teamへの非公開の連絡の2つに分ける（行23–48）。どちらの経路でも、参加者の同意を得てから共有すること、参加者のPIIやserviceの機微情報を共有しないことを求める（行27–31）。
  - 共有用templateは、`Insights`（利用者の行程を助けた・妨げた具体的な観察、成功を測った指標・仮説、実装の画面）、`Methods`（どのserviceで、いつ、定性か定量か、支援技術の利用者と試したか）、`More information`（prototypeや研究文書へのlink）の3節である（行50–77）。
  - 「Acting on feedback」で、teamは新しいcommentを全部読むが、すぐには動かず、問題だと確信するための証拠の蓄積を待つと書く。既存部分の改善は、複数の異なるserviceから同様の知見が繰り返されたときに優先する（重大度にもよる）。新規追加はcommunityとの定期的な優先順位づけで選ぶ（行91–101）。
  - 別に、design system自体の利用者（service側の実務者）への常設の「Always on」調査を試行として始め、参加の条件、sessionの形式、応募の経路、結果をcommunityで発表する予定を頁に書いている（continuous-research 行10–48）。
- 解いている問題と前提：design system teamが自ら行える調査は限られる。各serviceで行われた調査を同じ形で集め、1件の知見ではなく、複数のserviceにわたる繰り返しを判断の根拠にする。
- 必要な入力：componentごとのdiscussion、共有template、非公開の受付経路、同意とPIIの規則、優先順位づけの場。
- trade-off・失敗の仕方：公開discussionに集めるため、PIIの混入はtemplateの注意書きと投稿者の判断に頼る。templateの「Methods」は自己申告で、調査の質は検証されない。証拠を待つ方針のため、少数のserviceにしか現れない問題は優先されにくい。
- 反例・適用しない場合：18F（P23-O08）は、1回の調査の後にチームで次のsprintへの影響を特定する（証拠の蓄積を待たない）。USWDS（P23-O13）は自前の定期的なusability testingを主にし、外部の知見を受けるtemplateは頁にない。
- 互換・非互換：P23-O09（研究節）とP23-O11（TrialのdataCollectionUrl）が、このdiscussionを参照する。
- 限界：優先の判断に使う service 数の目安は持ち込まない。「Always on」調査は試行と明記されており、継続は未確定である。

### P23-O11 lifecycle status（Trial／Stable）を研究節とdata収集先に結び付け、研究の不足を頁の状態として表示する
- 出典：alphagov/govuk-design-system、`src/community/component-lifecycle-statuses/index.md` 行12–81（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/community/component-lifecycle-statuses/index.md#L12-L81）、`src/components/feedback/index.md` 行1–15、57–68（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/components/feedback/index.md#L57-L68）、`views/macros/_status-callout.njk` 行4–59（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/views/macros/_status-callout.njk#L4-L59）、`views/partials/_contact-panel.njk` 行1–40（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/views/partials/_contact-panel.njk#L1-L40）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - componentの状態を Trial（tagあり）と Stable（tagなし）の2つにする。Trialは、contribution criteriaを満たさない可能性のある、新規または大きく変わった、servicesでの追加の試験を要する、作業中のcomponentに使う。Stableへ移るには communityからのfeedbackが要り、必要なfeedbackの種類は各Trial componentの研究節に書く（lifecycle 行12–44）。一定期間否定的なfeedbackが無ければStableへ移るという時間条件も書かれている（行44）。
  - 頁のfront matterの`status`は、`type`、研究節等へのlink一覧（`links`）、Trialに移した時期（`date`）、data収集先（`dataCollectionUrl`）を持つ（feedback 行7–15）。`_status-callout.njk`は、状態名からtagと既定の説明文を出し、「なぜTrialかはこれらの節を読む」とlink一覧を出す（行12–56）。頁下の`_contact-panel.njk`は、Trialなら「いつTrialに移したか」とdata収集先へのlinkを出し、`discussionId`（現行のdiscussion）または`backlogIssueId`（旧backlogのissue）から共有先URLを組み立てる（行9–40）。
  - Trialの頁の研究節は、何を確かめるためにTrialで出したかを問いの形で列挙し、「これらの必要が満たされた十分な証拠が得られるまでTrialに留める」と書く（feedback 行57–68）。
  - status導入そのものも利用者研究の対象とし、その研究discussionへのlinkと要約を頁に置いている（lifecycle 行60–70）。
- 解いている問題と前提：研究で未確認の部分を持つ部品を、隠さずに公開して実利用から証拠を集める。研究の不足を、文章ではなく頁の状態（tag）として利用者に見せる前提である。
- 必要な入力：状態の定義と遷移条件、Trialにした理由となる未確認の問い、data収集先、Trialの開始時期。
- trade-off・失敗の仕方：Stableへの遷移に時間による既定の条件があるため、feedbackが集まらないこと（沈黙）が肯定として扱われうる。状態はfront matterの手書きで、条件の充足を機械的には判定していない。discussionIdとbacklogIssueIdの2系統が残り、共有先が頁ごとに異なる。
- 反例・適用しない場合：USWDS（P23-O13）は component定義に`status`欄を持つ（観察した例では`ready`）が、研究節との結び付けは読んだ範囲では確認できなかった。backlog側の旧criteria（P23-O12、P23-O14）は「experimental」という呼び方を使っていた。
- 互換・非互換：P23-O09（研究節）を参照点に使う。P23-O10（discussion）をdata収集先にする。P23-O12（criteria）の「満たさない可能性がある」という判定と対になる。
- 限界：Trialの期間などの値は持ち込まない。

### P23-O12 研究の証拠を部品の受入れ基準と判断記録に組み込む（contribution criteria、受入れ基準の雛形、working groupの判断記録）
- 出典：alphagov/govuk-design-system、`src/community/contribution-criteria/index.md` 行13–104（https://github.com/alphagov/govuk-design-system/blob/d1b51e67c01d841d7cba58a29ef1f74384cb7b34/src/community/contribution-criteria/index.md#L13-L104）。alphagov/govuk-design-system-backlog、`docs/CRITERIA.md` 行1–30（https://github.com/alphagov/govuk-design-system-backlog/blob/4ce8cebd66dc2dcddd388d0e3de2ad8504e4aa43/docs/CRITERIA.md#L1-L30）、`docs/ISSUE_TEMPLATE.md` 行7–18（https://github.com/alphagov/govuk-design-system-backlog/blob/4ce8cebd66dc2dcddd388d0e3de2ad8504e4aa43/docs/ISSUE_TEMPLATE.md#L7-L18）、`docs/contribution_and_assurance/Individual contribution acceptance criteria template.md` 行1–49（https://github.com/alphagov/govuk-design-system-backlog/blob/4ce8cebd66dc2dcddd388d0e3de2ad8504e4aa43/docs/contribution_and_assurance/Individual%20contribution%20acceptance%20criteria%20template.md#L1-L49）、`docs/contribution_and_assurance/Design System working group decision log.md` 行1–37（https://github.com/alphagov/govuk-design-system-backlog/blob/4ce8cebd66dc2dcddd388d0e3de2ad8504e4aa43/docs/contribution_and_assurance/Design%20System%20working%20group%20decision%20log.md#L1-L37）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 基準を2段に分ける。提案段階は Useful（多くのteam・serviceに役立つ証拠。使われている版の画面やlink）と Unique（既存と重複しない。置き換えるなら既存より良い証拠）。公開前段階は Usable（障害のある利用者を含む代表的な利用者との研究で機能が示された）、Consistent、Versatile（現行版 行13–104）。
  - 提案のissue templateは What／Why／Anything else の3節で、Whyに「複数のserviceで必要とされる証拠」「利用者の必要を満たす証拠」「既存に無いことの確認」を問う（ISSUE_TEMPLATE 行7–18）。
  - 個別の受入れ基準の雛形は、Code、Design、Guidance、Researchの基準を並べる。Guidance基準に「どの研究が行われ、何がまだ要るかを記述する」を含め、Research基準に、service上の使用例の件数と、代表的な利用者（障害のある利用者を含む）とprototypeまたはlive serviceで試したことを置く（行1–49）。
  - working groupの判断記録の雛形は、日付、reviewer、facilitator、note taker、公開用summary（backlogに公開し、詳細notesは貢献者に渡す）、「公開できる／勧告を満たすまで公開できない」の判定、分野別の勧告で構成される。勧告は「working groupの代表者の真の勧告だけを記録し、自分やteamの解釈を混ぜない」と注記する（decision log 行1–37）。
- 解いている問題と前提：利用者研究の証拠を「あれば良い」ではなく、提案・公開の判定条件に入れる。判定は第三者の集まり（working group）が行い、判断を記録として公開する前提である。
- 必要な入力：使用例の証拠、利用者研究の記録、基準ごとの判定、判断記録の様式。
- trade-off・失敗の仕方：基準の文言は版で変わっている。backlog側の`CRITERIA.md`は「Usableが証明されないものはexperimentalとして公開できるが、他組織の関連研究とbest practiceに明確に基づく必要がある」とする（行26）。一方、現行の`contribution-criteria`は「限られたserviceでしか公開されていなくても貢献できる。試された文脈を明示しfeedbackを求める」とする（現行 行79–80）。両方がrepositoryに残っており、どちらが現行かは読み手が判断する必要がある。また、backlogの`CRITERIA.md`がworking groupによる審査とする一方、現行版は「Design System team」が審査するとし、審査主体の記述も異なる（CRITERIA 行16、現行 行54）。
- 反例・適用しない場合：18Fは製品の部品を持たないため、受入れ基準の形はない。代わりに研究の品質を自己評価する指標表（P23-O08）を持つ。
- 互換・非互換：P23-O11（Trialは基準を満たさない可能性のある部品に使う）と組になる。P23-O09（頁の研究節）は、Guidance基準の「研究の記述」を満たす場所である。
- 限界：使用例の件数などの値は持ち込まない。working groupの構成は組織固有である。

### P23-O13 design systemの研究programの頁、参加者の種類別の募集頁、頁単位のchangelog、componentごとの研究知見の差込み（USWDS）
- 出典：uswds/uswds-site、`pages/about/research/overview.md` 行1–100（https://github.com/uswds/uswds-site/blob/69c76d6c85b3c8c322dc38e4613e43451a34a06a/pages/about/research/overview.md#L1-L100）、`pages/about/research/recruitment/general-fed.md` 行18–46（https://github.com/uswds/uswds-site/blob/69c76d6c85b3c8c322dc38e4613e43451a34a06a/pages/about/research/recruitment/general-fed.md#L18-L46）、`pages/about/research/recruitment/general-public.md` 行23–73（https://github.com/uswds/uswds-site/blob/69c76d6c85b3c8c322dc38e4613e43451a34a06a/pages/about/research/recruitment/general-public.md#L23-L73）、`_data/changelogs/about-research.yml` 行1–24（https://github.com/uswds/uswds-site/blob/69c76d6c85b3c8c322dc38e4613e43451a34a06a/_data/changelogs/about-research.yml#L1-L24）、`_components/link/link.md` 行1–23（https://github.com/uswds/uswds-site/blob/69c76d6c85b3c8c322dc38e4613e43451a34a06a/_components/link/link.md#L1-L23）、`_components/link/guidance/research-findings.md` 行1–14（https://github.com/uswds/uswds-site/blob/69c76d6c85b3c8c322dc38e4613e43451a34a06a/_components/link/guidance/research-findings.md#L1-L14）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 研究programの頁は、研究を設計原則（利用者の実際の必要から始める、聴く）に結び付け、焦点（USWDS communityの必要、障害のある人の必要）、方法（新しい知識を生む方法と、既存の案・prototype・製品を評価する方法の2群。方法の説明は18Fの方法集へlink）、頻度（定期的なusability testingと臨時の調査）、過去の研究（外部wikiの研究結果・当日のchecklistへのlink）、参加方法、研究倫理（privacy、安全な保管、同意に必要な情報、罰なくいつでも辞退）の節で構成される（overview 行23–100）。
  - 参加の頁を「連邦職員」と「一般公衆」に分ける。職員向けは、常設の参加候補者名簿への登録、参加の形（非同期のfeedback、会話、think aloudでのprototype試験（録画を求める））、参加同意書を送ること、職員には金銭の謝礼を出せないこと、privacyを書く（general-fed 行18–46）。公衆向けは、現在求めている参加者の種類、登録と名簿からの離脱、連絡時に知らせる情報・時間・謝礼・必要な機器、privacyを書く（general-public 行23–73）。
  - 頁ごとにchangelog dataを持ち、各項目に日付、summary、PR番号、repoを持ち、多くの項目が`affectsGuidance`（guidanceに影響するか）を持つ（about-research.yml 行1–24）。`affectsGuidance`を持たず、`summaryAdditional`で補足する項目もある（同 行5–9）。頁のfront matterの`changelog.key`がこれを参照する（overview 行19–20）。
  - componentの頁は、表示するguidance fileの一覧を`guidance`欄（heading と path）で持ち、研究知見を「Research findings」として独立fileで差し込む（link.md 行8–23）。研究知見fileは、調査の種類と時期、手順の要約、発見の箇条書き、完全な研究結果（外部wiki）へのlinkで構成される（research-findings.md 行1–14）。
- 解いている問題と前提：design system自身の利用者（実務者）と最終利用者（公衆）の両方を調べる。募集の条件（謝礼の可否等）が参加者の種類で異なるため、頁を分ける。研究の頁自体の変更履歴を、guidanceへの影響の有無とともに残す前提である。
- 必要な入力：研究programの焦点と方法群、参加者の種類ごとの条件、changelog data、componentごとのguidance一覧。
- trade-off・失敗の仕方：研究結果の本体は外部wikiにあり、頁は要約とlinkに留まる（P23-O09と同じ依存）。倫理・privacyの詳細は18Fの旧site（archived済みのux-guide）のURLへlinkしており、移転先（P23-O14）と食い違いうる（overview 行99–100）。研究知見の節は一部のcomponentにしかない。
- 反例・適用しない場合：GOV.UK（P23-O09）は全component・patternの頁に研究節を置く記述patternを持つ。18F（P23-O02）は研究program単位ではなく、project単位の計画を中心にする。
- 互換・非互換：P23-O03（方法カード）を方法の定義として参照する。P23-O14（版）では、頁単位changelogが「guidanceに影響したか」を区別している点が、18Fのgit履歴だけの版管理と異なる。
- 限界：謝礼額、session時間、研究の頻度などの値は持ち込まない。

### P23-O14 研究文書の版：repositoryの統合とarchive、削除した頁のredirect、雛形の改訂
- 出典：18F/guides、`README.md` 行5–9（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/README.md#L5-L9）、`content/methods/index.md` 行1–11（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/methods/index.md#L1-L11）、`content/methods/fundamentals/recruiting.md` 行1–19（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/methods/fundamentals/recruiting.md#L1-L19）、`content/ux-guide/resources/research-plan.md` 行35–108（https://github.com/18F/guides/blob/debc24b34f23686194d9fe42e391859d569bd39a/content/ux-guide/resources/research-plan.md#L35-L108）。18F/ux-guide、`_pages/resources/research-plan.md` 行1–62（https://github.com/18F/ux-guide/blob/e6698db059b46f84bc97e600935e334a945b2cc5/_pages/resources/research-plan.md#L1-L62）。18F/methods、`pages/rolling-issues-log.md` 行1–29（https://github.com/18F/methods/blob/6628c6f090ff20ad32ae81e25f2743d33e82292d/pages/rolling-issues-log.md#L1-L29）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - READMEは、guidesが以前は別の製品として保守され、統合されたとだけ書く（README 行6）。旧repository（18F/methods、18F/ux-guide）はGitHub上でarchivedになっている（API値）。統合前は別repositoryで、統合後は1つのrepositoryになった、というのは、このarchivedの値と内容の重複からの本書の推論である（READMEにrepositoryの記述はない）。
  - 統合時に、旧版にあった頁の一部（rolling issues log、archiveにあったbodystorming）は個別頁として残さず、方法集の入口頁の`redirect_from`に旧pathを並べて入口へ転送している（methods/index.md 行4–7）。旧版の rolling issues log は、問題を行、参加者を列にした観察記録の表の雛形だった（methods 行14–29）。
  - 方法カードのschemaは、旧版の front matter 直下の`what`／`why`／`timeRequired`／`category`から、`method:`の下の入れ子と`eleventyNavigation`へ移った（P23-O03）。移行後の`recruiting.md`では、navigationの`title`が「Privacy」になっており、`method.title`（Recruiting）と食い違っている（recruiting.md 行9–14）。
  - 研究計画の雛形は、旧版では Background、Goals、Research questions、Method(s)、Research roles（lead、moderator、observer）、Timeline、Participants and recruiting、Ethics considerations、Expected outcomes の節を持つ（ux-guide 行8–62）。現行版は次のように変わった（guides 行35–108）。
    - 冒頭に「研究計画はliving document（随時更新する文書）であり、節は必要に応じて足し引きする」と書く。
    - 題名に、対象、方法、対象参加者を含める。
    - Authors/stakeholders、Past research、Important links（rosterや共有folderへのlinkの一覧）の節を足した。
    - 役割を「sessionの前・中・後」に分けた表にし、後段に「Clean-up / de-identifying（notesが匿名化とPIIの基準を満たし、欠席者にも分かることの確認）」を独立した役割として置いた。
    - Ethicsを「Issues for awareness」（法令、倫理、accessibility、bias、power）に広げた。
- 解いている問題と前提：研究の方法と雛形は、実践から改訂され続ける。同じURL・同じfileを更新し、旧URLはredirectで生かし、旧repositoryはarchiveとして読める状態で残す前提である。
- 必要な入力：旧path一覧、旧版のarchive、雛形の改訂履歴（gitのcommit）。
- trade-off・失敗の仕方：
  - redirectは内容の後継を示さず、入口へ戻すだけなので、削除された雛形（rolling issues log）の代わりが何かは読み手に分からない。現行の方法カードは今も「rolling issues log」に言及している（usability-testing.md 行27）。
  - 移行時のmetadataの写し間違い（recruitingのnavigation title）は、構造の検査がないと残る。
  - 他repositoryからの参照は旧site（archived）を指したまま残っている（P23-O13）。
  - 雛形の版を本文の中では示しておらず、版の追跡はgit履歴に頼る（USWDSの頁単位changelogとの違い）。
- 反例・適用しない場合：USWDS（P23-O13）は頁単位のchangelog dataで、各変更のguidanceへの影響を記録する。GOV.UK（P23-O12）は旧backlogの文書を残したまま現行siteの文書を改訂しており、基準の旧版と新版が並存する。
- 互換・非互換：P23-O02（計画の節）・P23-O06（匿名化）の現行形は本観察の改訂後の雛形である。P23-O13とは、版の記録の置き場所（git履歴か、data fileか）で異なる。
- 限界：統合の時期、利用統計などの値は持ち込まない。archiveの理由はrepository内に書かれておらず、確認していない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 調査の目的と方法の選び方 | 18F：判断に答える問いで種類を分け、方法集の段へ対応させる。計画で目的→問い→方法→参加者を書く（O01・O02） | USWDS：「生む方法／評価する方法」の2群だけで方法を例示し、定義は18Fへlink（O13）。GOV.UK：種類の分類を持たず、部品ごとの証拠の有無で整理（O09） | 調査がproject単位か、design systemの部品単位か |
| 方法の記述形式 | 18F：方法カードの共通schema（what／why／所要時間／段／政府での考慮）（O03） | GOV.UK：方法は記録側の「Methods」欄（どこで、いつ、定性／定量、支援技術）として事後に書く（O10） | 方法を事前に選ぶ道具として持つか、知見の信頼度を読む文脈として持つか |
| 参加者の募集 | 18F：研究の問いに相対的な群と基準、参加者の安全、届きにくい群への経路（O04） | USWDS：参加者の種類（職員／公衆）別の常設名簿。GOV.UK：design system利用者の試行中の常設募集（O10・O13） | 調査ごとに募集するか、常設の候補者名簿を持つか。謝礼の可否が参加者の種類で変わるか |
| 同意 | 18F：理解すべき事項の一覧、録音の別同意、撤回、保持計画変更時の通知（O05） | GOV.UK：外部共有の前提条件として同意を要求し、中身は外部のmanualへ送る。USWDS：募集頁で同意書に触れるのみ（O10・O13） | 自ら調査する主体か、他者の調査結果を受ける主体か |
| 記録とPII | 18F：rosterと研究dataの分離、参加者code、共有分析の前の匿名化、共有前の録音削除（O06） | GOV.UK：受け取る記録にPIIを含めないことを求める。USWDS：privacyの宣言と18Fへのlink（O10・O13） | PIIを持つ段があるか（自ら調査する）、PIIを持たない段だけか |
| 発見から設計判断へ | 18F：調査ごとに次のsprint・roadmapへの変更を特定。品質指標で「backlogに反映されたか」を見る（O08） | GOV.UK：複数serviceからの証拠の蓄積で優先。Trial／Stableの状態と受入れ基準で判断を表す（O10〜O12） | 判断を調査1回ごとに起こすか、証拠の量で起こすか。判断の主体がteamか、working group等の第三者か |
| 研究記録の置き場所 | GOV.UK：全部品の頁に研究節（要約／既知の問題とgap／利用service／次の調査）。詳細は公開の外部記録（O09） | USWDS：研究知見を独立fileにし、選んだcomponentだけに差し込む。詳細は外部wiki（O13） | 研究節を必須の記述patternにするか、任意のguidance部品にするか |
| 研究記録の版 | 18F：同じfileを更新し、旧repositoryはarchive、削除頁はredirect。版はgit履歴（O14） | USWDS：頁単位のchangelog dataに日付・PR・guidanceへの影響を記録（O13）。GOV.UK：Trialの開始時期をfront matterに持つ（O11） | 版を本文外（git）で追うか、本文に付けたdataで示すか |

## 見つからなかったこと・gap
- 調査の問い・発見・設計判断を相互に追跡するID（問いのID、発見のID、それを使った判断・変更のID）は、6 repoとも見つからなかった。18Fは「チームで特定する」とし（O08）、GOV.UKは研究節やdiscussionへのlinkで結ぶ（O09・O11）。どちらも文章とlinkによる対応で、構造化された追跡ではない。
- 同意の取得状況（どの項目に同意したか、録音の可否、撤回）を記録する様式は、同意書の署名欄・checkboxを除いて見つからなかった。rosterに「opt-out」を記すことは書かれている（O06）。
- rosterは案件の終了時に破棄する、とある（18F/guides `plan.md` 行357）。研究data（録画、notes等）の保持期間の既定は、本文に見つからなかった（同意書では撤回期限が空欄の扱い）。
- 定量調査（survey、analytics、A/B test）の設計（標本、指標、有意性）の文書は、読んだ範囲には無い。18Fの方法集にmultivariate testing等のカードはあるが、本書では読んでいない。
- GOV.UKの研究節の詳細記録の本体（`alphagov/govuk-design-system`のwiki、旧backlogのissue、GitHub discussions）、USWDSの研究結果の本体（`uswds/uswds`のwiki）は読んでいない。研究結果の中身と参加者情報を扱わないため、意図して対象外にした。
- ADR形式の設計記録は、6 repoとも見当たらなかった。判断の記録は、GOV.UKのworking groupの判断記録の雛形（O12）と頁単位のchangelog（O13）に限られる。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repoを作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し、固定commitをcheckout（core.hooksPathを無効化）。読むだけで、build・test・script・hook・package managerは実行していない。gh apiはrepositoryのmetadata（default branch、license、archived）の取得に約10回使った。
- 18F/guides：`README.md`（1–40）、`content/ux-guide/research/clarify-the-basics.md`（全体）、`plan.md`（全体）、`privacy.md`（全体）、`do.md`（見出し全体、194–236、380–403）、`make-research-actionable.md`（全体）、`content/ux-guide/resources/research-plan.md`（全体）、`participant-agreement.md`（見出しと各段落の冒頭）、`usability-test-quality-heuristics.md`（全体）、`content/methods/index.md`（1–20）、`content/methods/validate/usability-testing.md`（全体）、`content/methods/decide/qualitative-data-analysis.md`（全体）、`content/methods/fundamentals/recruiting.md`（1–30）、`content/methods/discover/index.md`（front matter）。読んでいないもの：`content/ux-guide/research/ethics.md`・`bias.md`・`legal.md`・`share-power.md`・`accessibility.md` の本文、`resources/interview-guide.md`・`interview-checklist.md`・`usability-test-guide.md`・`email-templates/`、方法カードの大半、`content/derisking-government-tech/` 以下。
- 18F/methods：`_methods/_template.md`、`usability-testing.md`、`privacy.md`、`recruiting.md`、`compensation.md`、`stakeholder-and-user-interviews.md`、`affinity-mapping.md`、`design-hypothesis.md`、`archive/bodystorming.md`（1–20）、`_data/categories.yml`、`pages/rolling-issues-log.md`、`LICENSE.md`。読んでいないもの：その他の方法カード、`_layouts`、`_plugins`。
- 18F/ux-guide：`_pages/resources/research-plan.md`、`_pages/research/plan.md`、`privacy.md`、`clarify-the-basics.md`、`make-research-actionable.md`、`do.md`（194–232、381–404）、`_pages/resources/participant-agreement.md`、`usability-test-quality-heuristics.md`、`LICENSE.md`。
- alphagov/govuk-design-system：`src/community/share-research-findings/index.md`、`continuous-research/index.md`、`contribution-criteria/index.md`、`component-lifecycle-statuses/index.md`、`backlog.md`（archive頁）、`src/components/character-count/index.md`（100–136）、`src/components/feedback/index.md`（1–15、57–72）、`src/patterns/equality-information/index.md`（162–180）、`views/macros/_status-callout.njk`、`views/partials/_contact-panel.njk`（1–40）、`views/layouts/layout-pane.njk`（status関連の行）。研究節の見出しの分布をgrepで確認した（component・patternの頁で研究節を持つもの、`### Known issues and gaps`・`### Next steps`の出現）。読んでいないもの：`docs/`、`src/community/propose-a-component-or-pattern/`、wiki、GitHub discussions。
- alphagov/govuk-design-system-backlog：`docs/DESIGN_SYSTEM_CONTENT_PATTERN.md`、`docs/CRITERIA.md`、`docs/ISSUE_TEMPLATE.md`、`docs/contribution_and_assurance/Individual contribution acceptance criteria template.md`、`Design System working group decision log.md`（1–40）。読んでいないもの：`CONTRIBUTING.md`、`WORKING_GROUP.md`、`How to support a contributor.md`、`principles and ways of working.md`、issues。
- uswds/uswds-site：`pages/about/research/overview.md`、`recruitment/general-fed.md`、`recruitment/general-public.md`、`_data/changelogs/about-research.yml`、`about-research-recruitment-public.yml`、`_components/link/link.md`、`_components/link/guidance/research-findings.md`、`_components/modal/guidance/usability.md`、`_components/combo-box/accessibility-tests.md`、`_includes/accessibility-tests/test-results-summary.html`（1–40）、`LICENSE.md`。読んでいないもの：`pages/documentation/maturity-model.md`、`_posts/2017-03-01-post-1-0-research-strategy-workshop.md`、`pages/documentation/guidance/performance/research.md`、layoutのguidance描画部分。
- 検索した語：`research`、`usability`、`interview`、`consent`、`recruit`、`backlog`、`criteria`、`experimental`、`status`、`Research on this`、`Known issues and gaps`、`Next steps`、`changelog`、`rolling-issues`、`redirect_from`。
- 選ばなかった候補：alphagov/govuk-frontend（研究文書はdesign system側にあり、frontendはコードの配布が主のため、本文を読まなかった）、cfpb/design-system（metadataのみ）。GOV.UK Service Manualの利用者研究の章は、GitHub上の公式source repositoryを特定できず、使っていない。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて公式source repositoryの固定commitにある文書（ガイド、雛形、data file、template）の観察である。コードの実装ではなく、組織の手順書の記述である。手順書に書かれていることと実際に行われていることの一致は確かめていない。手順の記述を実装の観察と同列に扱うかどうかは未決である。
- scope：観察は調査の方法・記録・判断への接続の文書構造に限った。HELIXのD10で、利用者調査を工程（L2の要求とprototypeの合意等）のどこに対応させるかは未決である。PIIの扱い（O05・O06）はD08（security・privacy）にもまたがり、主な領域をどちらにするかは未決である。
- 評価根拠：HELIXでの成功・失敗の証拠はない。米国・英国の政府組織の手順であり、法令（PRA、Privacy Act等）を前提にした部分はHELIXに当てはまらない。外部repositoryでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。研究文書は改訂され続ける（O14）。archived repository（18F/methods、18F/ux-guide）は凍結されているが、後継（18F/guides）と内容が異なる。旧版と現行版のどちらを観察の根拠とするかは未決である。本書は原則として現行版を引き、差分の観察にだけ旧版を引いた。同一repository内に新旧の基準が並存する場合（O12）の扱いも未決である。
- license：18Fとuswds-siteは`NOASSERTION`（LICENSE.mdは米国内public domainとCC0 1.0の宣言）、govuk-design-system-backlogは`null`（LICENSE fileなし）である。記録の仕方は未決である。
- 状態：全観察（P23-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
