# D10 UX / Interaction：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つで、POの回答で1.0へ加えた。HELIXBRAIN-L2-006（139–149）の要素のうち、本書は体験の側（Information Architecture、Navigation、Form、Feedback、Empty／Loading／Error State、Responsive、Accessibilityの体験）と、利用者の作業の流れ、表示状態の網羅、組合せの選び方、人の反応の扱いを扱うと仮に読む。要素ごとの素材の有無はD09 §2の表に一つにまとめた。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D10-M01 | LEGACY-ASSET-8B6EA6DFFE976FAD564A | `docs/skills/browser-testing-and-screen-verification.md` | 45–70 | 6f9f37072b0781b39a8ba19ecb2d04609babd5abaeeb7d23f63a9048dd59d0b5 | 画面の不具合の多くは「想定外の状態で見た目が破綻する」こと、mockは理想のdataの1状態にすぎない、「自分には普通に見える」は判定ではない。見るべき9状態（0件、1件、多量、長文、読込中、error、権限なし、部分欠損、offline・低速）ごとの見る点と典型的な破綻、全組合せではなく破綻しやすい交差（長文×狭い幅、error×多言語）を優先する | Design Unit候補「表示状態の網羅（9状態）」、Anti-Pattern候補（状態ごとの典型的な破綻：白い虚無、二重送信、stack traceの露出、権限のない操作の無効化表示、楽観更新の無言の巻戻し） | 画面幅・拡大率の値（69）は持ち込まない。既存SCF-B-0153の`materials/source-inventory.md`とDT-VT-005が同じ行を検証template材料として引いている。本書は設計知識（状態ごとに何を設計しておくか）の観点で記録する |
| D10-M02 | 同上 | 同上 | 104–114 | 同上 | accessibilityを数値の前に3つの体験で見る（mouseを抜く＝Tabだけで完遂できるか・focusが見えるか・modalへの閉じ込め、色を抜く＝濃淡だけで状態が分かるか、目を閉じる＝読み上げで見出し→landmark→formを辿れるか・代替text・errorとfieldの関連付け）、機械で測れるものは機械に測らせ、人とAIの目は機械が測れないもの（読み順の自然さ、代替textの実質）に使う | Pattern候補「a11yの3つの体験による確認」 | 比・寸法の値（112–113）は外部の基準値で、BRAINの既定値として持ち込まない。既存SCF-B-0153が同じ行を引いている |
| D10-M03 | LEGACY-ASSET-5412A166E9D88C3C2436 | `docs/design/harness/L2-screen/business-flow.md` | 30–50、127–136 | fb7c5b23952edc22f610f93f573e7c906ec80c8b77588d84d7cfd9a762f5939a | 役割ごとのlane（責務と使う画面）、業務flowの一覧（契機、主な画面、出力・判断）、業務flowと画面遷移のscenario・必須の遷移の対応 | Design Unit候補「業務flowと画面遷移の対応」 | 中身はHELIX自身の業務（PO、TL、AI runtime、gate、doctor）で固有。lane・flow・遷移の対応という形が汎用候補。台帳の分類は`RequirementSourceSnapshot`（r3） |
| D10-M04 | LEGACY-ASSET-4D0363D7C55B6EA03EC7 | `docs/design/harness/L2-screen/screen-flow.md` | 73–85 | ec4da6c66769475dbebfcb74bdb5e7f68c728a71b06ad4c3d7aa9d30c0b38fc1 | 絞り込み・並び順・階層の選択をURLのqueryに持たせ、browserの戻るとbreadcrumbで復元する、breadcrumbはcategory内の戻り、browserの戻るはcategoryを跨ぐdeep-linkの戻り、跨いで戻ったとき元の絞り込みに復帰する | Pattern候補「表示状態をURLに持たせる」、Part候補「戻る経路の使い分け」 | HELIXの画面群（PM／HM／GD）の構成に依る。台帳の分類は`RequirementSourceSnapshot`（r3） |
| D10-M05 | LEGACY-ASSET-2A8F5E02AEFFB6C8F1B0 | `docs/design/harness/L2-screen/screen-detail.md` | 33–63 | 1b6a14670a9f2b1ffb911955e89eaec15751b1c1262fab7ca92e0cb643c01a9b | 画面詳細の必須欄（目的＝支える判断・作業、persona、route、入力、読み順に並ぶ表示block、操作、検証・空状態、error状態と次の行動の案内、security・権限、状態の保持、trace、test・reviewの手掛かり）と共通規則（未知・古い・未投影のdataを明示の状態として扱い「空白の成功」にしない、review文脈に影響する画面状態はrouteかqueryで共有できる、秘密・個人pathは描画前に除く） | Design Unit候補「画面詳細の欄」、Anti-Pattern候補「未知のdataを空白の成功として表示する」 | 読み取り専用・CLI実行をしない等の規則（57–58）はHELIXの管理画面に固有。欄の集合は汎用候補。台帳の分類は`RequirementSourceSnapshot`（r3） |
| D10-M06 | LEGACY-ASSET-7453222BF98E95199D46 | `docs/design/helix/L5-detail/ui-domain-pattern-profile.md` | 88–105 | c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678 | 体験の軸（device、入力方法、role、locale、data量、network、同時更新、破壊的操作とundo）の全組合せを作らず、riskの高い組合せを全件含めたうえで残りを2軸ずつの網羅（pairwise）で選ぶ | Pattern候補「riskに基づく体験条件の組合せの選び方」 | 軸の水準の例はHELIX固有。検証の技法としては既存SCF-B-0153の`materials/source-inventory.md`（pairwise／risk-based組合せの行）が同じ行を引いている。本書では「設計時に考える体験の軸の集合」として記録する |
| D10-M07 | LEGACY-ASSET-A422448C3CACBCA75D0C | `docs/governance/candidates/design-grounding-human-convergence-intake.md` | 60–140 | 177def78bced15ffad9a5db7fc6ccf67a425d0d892be5892b085b8e1ed3c102c | prototypeやdesign候補を作る前に前提を分類する（既知、裏付けあり、争いあり、未知、古い、非該当）、不足した前提から調査の義務を導く（件数ではなく「論点→根拠→設計への含意→採否の理由→未解決点」が繋がって初めて足りるとする）、人の反応の原文を改変せず保存しAIの解釈と分ける、反応の分類（客観的な欠陥、使いにくさ、意図とのずれ、見た目の好み、内容の意味のずれ、調査不足、prototypeの見せ方の失敗、未解決）と分類ごとの戻し先（却下されたら全部作り直す、をしない） | Pattern候補「前提の分類と調査の十分性」、Design Unit候補「人の反応の分類と戻し先」 | 旧の指示書の原文（historical input-only、採用authorityではない、24）で、HELIX自身のDesign HARNESSへの要求が中心。BRAINの知識として使えるのは、UXの改善の回し方の型。D09-M09と同じ資産の別の行 |
| D10-M08 | LEGACY-ASSET-535EBA960C372C61F999 | `docs/design/helix/L10-ux/ux-evidence-boundary.md` | 17–44 | 92caa47dcd181fc790dec462820b063a1c8a6ed9c0b86410306ead9cb13e3f71 | UXの受入は実data・実操作・accessibilityで行い、結果を要求IDと要求の版・合意したprototypeの版に結ぶ、Issue・PRの状態で合意・受入を代用しない、文書間の対の存在や旧の単独のOK表示を受入の証拠にしない | Design Unit候補「UX受入の証拠の結び方」 | HELIX自身の工程（旧L10／L11の層の名前）の境界文書で、検証側の内容。既存DT-VT-102（要求↔受入）と重なる |
| D10-M09 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 731–735、776–780 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「表示名・翻訳カタログ」を`na`、「ユーザードキュメント設計」を`todo`と記録していたこと | gapの根拠 | 旧の自己評価 |

## 2. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/verification-test-template-seed-20261001/templates/DT-VT-005-screen-verification.md` | 画面検証（9状態、表示の回帰、a11y） | D10-M01・M02を検証の欄として既に持つ |
| `scaffold/verification-test-template-seed-20261001/templates/DT-VT-102-l2-l11-user-acceptance.md` | 要求↔受入 | D10-M08と重なる |
| `scaffold/verification-test-template-seed-20261001/materials/source-inventory.md` | 旧`L2-screen-ux-test-design.md`（`LEGACY-ASSET-73C1830CFD650CEFDCF3`）26–35の受入観点表 | 既に棚卸し済み。本書では重ねない |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「機能・画面・API・入出力」（screen_list、screen_spec）、「図・構造表現」（画面遷移、wireframe） | ZIP由来。重ねない |

## 3. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| ISO 9241-110（対話の原則）、ISO 9241-11（usabilityの定義） | 国際規格 | 対話の原則（作業への適合、自己記述性、期待との一致、誤りへの耐性等）。旧は`document-system-map.md`（D04-M08）でISO 9241-110の名前を挙げるだけ | 規格本文は有償。版は要確認 |
| Nielsenの10のusability heuristics | 公開記事（https://www.nngroup.com/articles/ten-usability-heuristics/） | heuristic評価の語彙。旧D09-M10の違和感の語と一部重なるが、errorの予防・回復、状態の可視性等を持たない | 記事の著作権に注意。名前と観点の参照に留める |
| WAI-ARIA Authoring Practices Guide | W3Cの公開文書（https://www.w3.org/WAI/ARIA/apg/） | componentごとのkeyboard操作の期待。D10-M02の体験の確認を具体的な操作に落とす観点 | D04 §3にも挙げた |
| Information Architectureの一般知識（分類、label付け、navigation、検索の体系） | 書籍等 | 旧に情報の分類・label付けの知識は無い | 特定の書籍に依存しない |

## 4. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| form（入力の順序、検証のtiming、errorの表示と回復、入力の保持、二重送信の防止） | 旧の画面は読み取り専用で、formを持たない。D10-M01が二重送信に触れるだけ |
| Information Architecture（分類、label、検索、navigationの構造） | 旧の`Information Architecture`は`api-and-interface-design.md`の境界の語（D05-M01）に出るだけ |
| feedbackの設計（操作への応答、進捗、取消し・undo、確認dialogの使いどころ） | D09-M04がfeedbackの種類を、D09-M10が応答時間の帯を挙げるだけ。undoはD10-M06の軸の名前だけ |
| onboarding・空の初回体験・help・利用者向け文書 | 旧台帳でユーザードキュメント設計が`todo`（D10-M09） |
| 多言語・地域対応（翻訳、文字の長さ、日付・数値の書式） | 旧台帳で`na`（D10-M09、D09-M13）。旧の画面は日本語固定 |
| mobile・touchの操作（gesture、片手操作、通知の権限） | 旧台帳でmobile系は全件`na`（`design-catalog.yaml` 958–993） |
| 利用者調査の方法（interview、usability test、観察）と結果の扱い | D10-M07が人の反応の扱いを持つだけで、調査の方法の知識は無い |

## 5. 検索範囲と結果

- 範囲：`docs/design/harness/L1-requirements/screen-requirements.md`の見出し、`docs/design/harness/L2-screen/`全件、`docs/design/helix/L10-ux/`、`docs/design/helix/L5-detail/ui-domain-pattern-profile.md`、`docs/test-design/helix/L2-screen-ux-test-design.md`、`docs/skills/browser-testing-and-screen-verification.md`・`acceptance-criteria-thinking.md`、`docs/governance/candidates/design-grounding-human-convergence-*.md`、`docs/design/design-catalog.yaml`の`std`・`detail`・`mobile`区分。
- 語：`UX`、`usability`、`情報設計`、`Information Architecture`、`navigation`、`form`、`feedback`、`empty`、`loading`、`heuristic`、`ISO 9241`、`persona`、`i18n`。
- 結果：表示状態の網羅（D10-M01）、画面詳細の欄（D10-M05）、体験条件の組合せ（D10-M06）、人の反応の扱い（D10-M07）は旧に比較的ある。formと情報設計の知識は範囲内に無かった。
- 補足検索：旧repo全体（`archive/legacy-generation-2026-09-14/root/`、`.helix/`・src・tests等を含む）を、大文字小文字を区別しない固定文字列で検索し、一致したfile数を数えた（2026-10-04）。`heuristic`（語単位の一致）は16 file（PLAN 5、test 3、src 3、設計文書3、test設計1、その他1）に出るが、HELIX自身の検出器・lint・文書生成の適合判定の文脈で、usability heuristicsではなかった（全件の精読はしていない）。
- 結果（続き）：`docs/design/harness/L1-requirements/screen-requirements.md`（580行）はHELIX自身の15画面の要求で、素材にしなかった（UXの横断原則CC2・CC3もHELIXの管理画面に固有）。

## 6. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。

| 属性 | 未決事項 |
|---|---|
| 由来 | D10-M01・M02はAI agentの検証手順として書かれた経験則で、どの実績から来たかが資産から読めない。D10-M07は外部の指示書の原文。由来の書き方が未決 |
| 適用scope | 9状態（D10-M01）は一覧・表示の画面を想定している。入力中心・game・3D等のmodality（D09-M05）へ当てはまるかを書く根拠が無い |
| 評価根拠 | UXの良し悪しの一部は人の判断に残る（D09-M09）。LABOで評価できる部分（状態の網羅、操作の完遂）と人の判断の部分の区別が未決 |
| 限界・反例 | D10-M01の「典型的な破綻」は反例の材料だが、条件（どの画面種別で起きやすいか）を持たない |
| 版 | 体験の知識はdevice・platformの変化で古くなる。版を振る単位が未決 |
| 状態 | 全件「未評価の候補素材」 |
| 領域の帰属 | D10とD09・D04の境目は仮置き（D09 §2）。D10-M08は検証側の内容で、BRAINの領域に入れるかどうか自体が未決 |
