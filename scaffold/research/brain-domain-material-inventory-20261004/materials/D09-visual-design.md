# D09 Visual Design：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つで、POの回答で1.0へ加えた。HELIXBRAIN-L2-006（139–149）がVisual DesignとUXの再利用知識の要素（Information Architecture、Visual Hierarchy、Layout、Grid、Spacing／Density、Typography、Navigation、Component Composition、Form、Feedback、Empty／Loading／Error State、Responsive Design、Dashboard、Content Hierarchy、Accessibility）を挙げ、製品固有のVisual Identity・screen・flow・design tokenは各製品のHELIX-HARNESS-COREに残すとしている。L2-023（444–453）はVisual Design HARNESSとの接続で、HARNESSから直接BRAINの汎用知識へ昇格させない。

本書は見た目の構造（hierarchy、layout、grid、余白・密度、typography、componentの合成、色の使い方、表示の回帰）と、designの来歴・収束を扱い、体験（流れ、状態の意味、form、feedback、a11yの体験）はD10に置いた。この切り分けは本書の仮置きである。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D09-M01 | LEGACY-ASSET-787B224EBE62ACB57F52 | `docs/design/harness/L4-basic-design/ui-standard.md` | 63–73、80–88 | ac7a0b00c5d9380ba33226f90dd6e75764cc293c79c862ef6cf1a42e16a9c968 | tokenを色・寸法・typographyの唯一の出典にし、画面・部品に直書きしない、状態を「色＋icon＋label」の3重で符号化し色覚の差で意味を落とさない、状態ごとに前景・背景・icon・用途を揃えた表 | Pattern候補「状態の多重符号化」、Pattern候補「tokenを唯一の出典にする」 | 色の値（hex）、行高、gutter等の具体値（80–101）は**HELIXの管理画面に固有のVisual Identityで持ち込まない**（L2-006）。原理と表の形だけが汎用候補 |
| D09-M02 | 同上 | 同上 | 103–121 | 同上 | accessibilityの観点（通常文字のcontrast、UI部品・境界のcontrast、色だけに頼らない、keyboard操作、focusの見え方、操作対象の大きさ）とWCAG 2.2の達成基準番号の対応、「contrastの目標は設計目標で、宣言ではなく実測で確かめる」 | Design Unit候補「見た目のaccessibilityの観点とWCAG達成基準の対応」 | 比の値・寸法は外部標準（WCAG）の値であり、BRAINの既定値として持ち込まない。L2のui-elementはWCAG 2.1を「意識」、L4でWCAG 2.2 AAへ更新した経緯（105–108）がある（古さの記録） |
| D09-M03 | LEGACY-ASSET-1E6A456737CE9565E00B | `docs/design/harness/L2-screen/ui-element.md` | 82–100 | 46a762dfcd5289a9c775dd8c5297683043ad047a24945b067fcc96f192689c20 | token群（状態色、余白・grid、typography、強調）を、画面設計の段では方針（例：ok＝緑）だけに留め、具体値は後段で確定する分け方 | Pattern候補「見た目の決定を段階に分ける（方針→具体値）」 | 方針の中身（light only、日本語固定、Desktop専用）はHELIX固有。台帳の分類は`RequirementSourceSnapshot`（r3） |
| D09-M04 | LEGACY-ASSET-7453222BF98E95199D46 | `docs/design/helix/L5-detail/ui-domain-pattern-profile.md` | 35–66、68–86、157–167 | c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678 | UIの要素の種類（page、user flow、navigation、region／slot、UI component、interaction pattern、design token、content、feedback、表示状態）を意味のIDで持ちclass名・file path・DOM selectorを主keyにしない、Pattern Contract（required／forbiddenの制約、同じ対象への矛盾をfail-close、AIは白紙から作らず契約の内側で構成する）、UI Profile（情報の優先順位、許すpattern・token、responsiveの制約、motionの予算とreduced-motionの代替、a11yの制約、brandの制約、surfaceの分類＝operational／expressive／mixed）、**共通Rule Packと製品profileを型で分け、製品の値（brand色、製品文言）が共通packへ混入したら止める**、抽出時に具体値（hex、px、font名）を持ち込まない | Domain→Pattern→Unit→Part（L2-002）の構造の材料、Pattern候補「Pattern Contract（required／forbidden）」、Design Unit候補「UI Profile」、Pattern候補「共通packと製品profileの分離」 | **L2-006・L2-011（製品固有意味との分離）にそのまま対応する旧の設計**で、汎用性が高い。ただし旧で実装が完了したかは本書では確かめていない（status: draft、design-reality-bindingは空、130–142）。ID接頭辞・Issue番号はHELIX固有。既存SCF-B-0153の`materials/source-inventory.md`が検証template材料として同じ資産を引いている |
| D09-M05 | LEGACY-ASSET-D11F51092619506417E4 | `docs/design/helix/L3-requirements/multimodal-design-harness-authority.md` | 40–140 | baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2 | designのmodality（web、mobile、game UI、3D、video storyboard、chart、editor文書）を共通IRへ潰さず、共通のidentity・trace・承認・証拠の封筒とmodality別profileを分ける、lifecycle（candidate→verified→approved→canonical→deprecated、飛ばさない）、Design IRの封筒の責務（identity、要求trace、component・state、interaction、data binding、responsive・環境、a11y契約、tokenと交換、asset参照、来歴、検証、承認、release）、外部toolはadapter・利用側であり正本ではない、検証の領域（state、interaction、visual、a11y、performance、localization、来歴・権利、配布）、見た目の一致だけで完了にしない、screenshot等からの逆抽出は確信度付きの候補でauthorityではない | Domain候補の材料（modality）、Pattern候補「tool非依存のdesign IR」、Part候補「design検証の領域の集合」 | Visual Design HARNESS（旧Design HARNESS）の旧L3要求で、BRAINの知識ではなくHARNESS側の仕組みの要求が中心。BRAINの知識にできるのは「design知識をどう分類・検証するか」の観点。lifecycleはL2-007・008の状態と関係するが、そのまま写さない |
| D09-M06 | 同上 | 同上 | 142–150 | 同上 | designの来歴・権利：canonical・派生・証拠・第三者送信dataの分類、prompt・入出力のdigest、生成器・modelの版、seed、変換履歴、license、権利、承認、公開先をsidecarに持つ、埋め込みmetadataは消える前提、未分類license・来歴不明・cross-projectのassetを正本へ昇格しない | Pattern候補「designの来歴のsidecar」 | AI生成のdesign資産を扱う場面の知識。D08（security）とも関係する |
| D09-M07 | LEGACY-ASSET-1B8104503EB6121FA0A5 | `docs/research/design-harness-deep-research-coverage-2026-07-29.md` | 53–89 | 784f431e7d9ea6f60358967665b191cfd703dd9bffecba2437bb9b1b8fc62fc3 | 外部の調査原稿の各章を採否（adopt、adapt、candidate_research、reject）に分け、設計のatom（modality、lifecycle、Design IR、component・state・interaction、data・responsive・a11y、token・交換・asset、検証、Reverse、adapter、storage、来歴・法務・security、運用）ごとに降ろす先と右側で要る証拠を書いた台帳 | 素材の分類の観点（どのatomがBRAINの知識になりうるか）の材料 | 原稿そのもの（`deep-research-report.md`）は退役しrepo外。tool名・ranking・工数は`candidate_research`で採用receiptではない（同資産69、`multimodal-design-harness-authority.md` 183–184）。BRAINへの外部情報の経路は2.0（L2-026）であり、この原稿の内容をBRAINへ入れない |
| D09-M08 | LEGACY-ASSET-0F2E2C17BF5B225F945E | `docs/research/design-harness-ecosystem-disposition-2026-08-29.md` | 9–36 | 8c0a06e9f019ba64a530e0072ba634d7743d37a6e12d458e68c11beaff77fbce | 外部ecosystemの扱い（DTCGのtoken交換は再検証待ちの候補、Figma／Penpotは正本にせず読み込みと承認済みの書き戻しだけ、Storybook／Playwright／a11y／visual diffは状態の集合と非決定要因の固定を条件に採る、AIのdesign生成器は生成の段だけで正本への書込み権限を持たない）と、再現できない引用markerを要求・license判断へ流用しない方針 | Anti-Pattern候補「外部design toolを正本にする」「AI生成器に正本の書込み権限を与える」 | HELIX自身のtool方針の記録で、BRAINの知識ではない。外部tool名は技術選定であり、本書では観点の名前に留める |
| D09-M09 | LEGACY-ASSET-A422448C3CACBCA75D0C | `docs/governance/candidates/design-grounding-human-convergence-intake.md` | 142–197 | 177def78bced15ffad9a5db7fc6ccf67a425d0d892be5892b085b8e1ed3c102c | prototypeの版ごとに設計の軸（Typography、Density、Layout、Navigation、Motion、Card構造等、固定enumにしない）を受容／却下／未決／未評価で持つ、一度受容した軸を根拠無く後の版で壊したらdesignの退行として検出する、指摘の系譜（発生→仮説→修正→次の版→解消／再発／別原因）、人の承認1つだけを収束の証拠にしない、機械で判定できるもの（a11y、状態の正しさ、遷移の行き止まり、responsive、性能、要求との整合）とmodelだけで決めてはいけないもの（美的な好み、brandらしさ、世界観、主観的な意味、文章のnuance） | Pattern候補「設計軸ごとの受容状態と退行検出」、Design Unit候補「客観UXと人の意味の境界」 | 旧の`governance/candidates`にある指示書の原文（historical input-only、採用authorityではない、24）。HELIX自身のDesign HARNESSを強化する指示で、BRAINの知識ではなく仕組みの要求が中心。「美的判断をmodelだけで決めない」はL2-006の汎用知識とVisual Identity（製品固有）の境目を考える材料 |
| D09-M10 | LEGACY-ASSET-8B6EA6DFFE976FAD564A | `docs/skills/browser-testing-and-screen-verification.md` | 72–82、116–125 | 6f9f37072b0781b39a8ba19ecb2d04609babd5abaeeb7d23f63a9048dd59d0b5 | 見た目の違和感を原則の語（整列、近接、階層、一貫性、rhythm、feedback）に分解して言葉にし、「状態・要素・反する原則・根拠（測定値・規約）・利用者への影響」の型で報告する、画像からの判定で信頼できることと落ちること（小さなずれ・色差は測定か人へ回す）、分解できない残りは好みとして人の判断に委ねる | Part候補「visual reviewの語彙」、Pattern候補「違和感の言語化」 | feedbackの応答時間の帯（0.1秒／1秒／10秒、78–79）は外部の経験則の値で、BRAINの既定値として持ち込まない。既存SCF-B-0153の`materials/source-inventory.md`が同じ行を引いている |
| D09-M11 | LEGACY-ASSET-7954B1D723B45A1D3C29 | `docs/design/harness/L2-screen/wireframe.md` | 137–158 | aaebdff3385a90624e7056f772852bee200bbeb4b24e6e4200b8e56cba7af542 | Low-Fiのmockはrepo内に持ち、High-Fiは案件ごとに判断（repo内に埋め込むか外部へ依頼するか）、外部へは画面設計を確定してから出し、戻った成果物を要求と照合して不整合なら上流を直す | Pattern候補「High-Fiの外部依頼と照合」 | HELIX自身の画面と旧の層番号に依る。外部tool名（Figma、Excalidraw）は例示 |
| D09-M12 | LEGACY-ASSET-35528AF32BAD266BAC87 | `docs/design/harness/L10-ux/visual-design.md` | 16–45 | c555d36f5a193c2fc336d9bb3438e111a1c4f3882663c20344ddab6bcdcde1b2 | 再利用できる見た目の標準（部品、色、token）は実装の前に要るので基本設計に置き、実装後の段では実際の描画で磨きとa11yの実測をする、と層の置き場所を是正した経緯 | Design Unit候補「見た目の標準と実装後の磨きの分離」 | 層番号（L4／L10）は旧世代のもの。現行の層へ番号を写さない。HELIX固有の工程の判断 |
| D09-M13 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 702–706 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「国際化・アクセシビリティ設計書」を`na`（多言語UI・a11y機能という製品関心事を持たない）と記録していたこと | gapの根拠 | 一方でui-standardはWCAG 2.2 AAを採っており（D09-M02）、旧の内部で扱いが揃っていない |

## 2. HELIXBRAIN-L2-006の要素ごとの素材の有無

L2-006（`brain-requirements.md` 144）が挙げる要素に、旧の素材が当たるか。要素の意味は変えない。主な領域は本書の仮置き。

| L2-006の要素 | 主な領域（仮） | 旧の素材 | 状況 |
|---|---|---|---|
| Information Architecture | D10 | D10-M05（画面詳細のschema）、`api-and-interface-design.md`（IA境界の語、D05-M01） | 少ない。情報の分類・ラベル付けの知識は無い |
| Visual Hierarchy | D09 | D09-M10（違和感の語「階層」）、D09-M04（UI Profileの情報優先順位） | 少ない。原則の語だけ |
| Layout | D09 | D09-M04（region／slot）、HELIXの共通骨格（`wireframe.md` 30–45、固有） | 少ない |
| Grid | D09 | D09-M03（余白・gridの方針）、D09-M10（rhythm） | ほぼ無い。grid systemの知識は無い |
| Spacing／Density | D09 | D09-M03（高密度の方針、固有）、D09-M09（設計軸Density） | 少ない |
| Typography | D09 | D09-M03（本文と等幅の使い分け、固有）、D09-M09（設計軸Typography） | ほぼ無い。type scale・行長・可読性の知識は無い |
| Navigation | D10 | D10-M04（状態の保持と戻る）、D09-M04（navigationの種類） | 少ない |
| Component Composition | D09／D04 | D04-M04（component合成で画面を作る、table-dumperの失敗）、D09-M04（Pattern Contract） | 部分的 |
| Form | D10 | なし（旧の画面は読み取り専用） | 無い |
| Feedback | D10 | D09-M10（feedbackの帯）、D09-M04（feedbackの種類：toast、dialog、progress、inline error） | 少ない |
| Empty／Loading／Error State | D10 | D10-M01（9状態）、D04-M03（標準5状態）、D10-M05（unknownを成功の空白にしない） | 比較的ある |
| Responsive Design | D10／D04 | D09-M04（responsiveの宣言）、D10-M06（8軸のpairwise） | 少ない。旧の画面はDesktop専用 |
| Dashboard | D09 | HELIXの管理画面（`ui-standard.md` 189–214、固有） | 製品固有の例だけ。汎用のdashboard patternの知識は無い |
| Content Hierarchy | D09 | D09-M04（content、情報優先順位） | ほぼ無い |
| Accessibility | D09／D10 | D09-M02（見た目のa11y）、D10-M02（a11yの3つの体験） | 比較的ある |

## 3. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/verification-test-template-seed-20261001/templates/DT-VT-005-screen-verification.md` | 画面検証（状態、表示の回帰、a11y） | 検証の欄は既にある |
| `scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md` D1〜D7 | Playwright、axe-core、Storybook、DTCG Format Module／Style Dictionary、reg-suit／BackstopJS、textlint／Vale、Figma Code Connect | 外部参考として既にある。再掲しない |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「図・構造表現」（wireframe等）、「クライアント別パーツ」 | ZIP由来。重ねない |

## 4. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| WCAG 2.2 | W3C勧告（https://www.w3.org/TR/WCAG22/） | contrast、focusの見え方、操作対象の大きさ等の一次定義。旧D09-M02が達成基準番号を引くが、本文は持たない | W3C文書の利用条件に従う。適用levelは要求の判断で、BRAINが課さない |
| Gestalt原則（近接、類同、閉合、連続等） | 知覚心理学の一般知識 | 旧D09-M10の「整列、近接、階層」の語の背景。grouping・hierarchyの説明の語彙 | 特定の書籍に依存しない名前として扱う |
| 公開されたdesign system（各社のもの） | 各社の公開文書 | grid、type scale、spacing scale、component catalogの作り方の例 | **各社のdesign systemは製品固有のVisual Identityを含む**。BRAINの汎用知識へ混入させない（L2-006、L2-011）。利用条件は各社で要確認 |

## 5. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| typography（type scale、行長、行間、可読性、言語ごとの違い） | 旧はHELIX固有の値だけ（D09-M03、`ui-standard.md` 97–101） |
| grid system・spacing scale・layoutの型 | 旧に一般知識は見つからなかった（§6） |
| visual hierarchy・content hierarchyの作り方（大きさ、weight、色、位置、余白で順位を作る） | D09-M10の原則の語と、D09-M04の情報優先順位の欄があるだけ |
| dashboardのpattern（KPIの置き方、比較、drill-down、密度の選び方） | HELIX自身の管理画面（固有）だけ |
| 色の体系（semantic color、dark mode、brand色と状態色の分離） | 旧はlight固定（D09-M03）。D09-M01は状態色だけ |
| motion（意味のある動き、時間、reduced-motion） | D09-M04がmotionの予算とreduced-motionの代替を欄として持つだけ |
| data可視化（chartの選び方、色の使い方） | D09-M05がmodality「chart」を挙げるだけ |

## 6. 検索範囲と結果

- 範囲：`docs/design/harness/L2-screen/`（README、screen-list、screen-flow、screen-detail、ui-element、wireframe、business-flow）、`L4-basic-design/ui-standard.md`、`L10-ux/visual-design.md`、`docs/design/helix/L3-requirements/multimodal-design-harness-authority.md`、`docs/design/helix/L4-basic-design/`・`L5-detail/`のui-domain系、`docs/design/helix/L10-ux/`、`docs/research/design-harness-*.md`、`docs/governance/candidates/design-grounding-human-convergence-*.md`、`config/ui-domain/harness-console-bundle.json`（見出しのみ）、`docs/skills/browser-testing-and-screen-verification.md`、`.claude/agents/fe-lead.md`・`fe-ui.md`。
- 語：`visual`、`typography`、`grid`、`spacing`、`density`、`layout`、`token`、`design system`、`hierarchy`、`dashboard`、`WCAG`、`contrast`、`Gestalt`、`motion`。
- 結果：見た目の一般知識は少ない。旧で作った画面はHELIX自身の管理画面だけで、具体値は製品固有。一方、**製品固有の値と共通の規則を分ける仕組み**（D09-M04）と**designの来歴・収束・人の意味の境界**（D09-M05・M06・M09）は旧に厚くあり、BRAINのL2-006・011・023の境界を考える材料になる。`design system`・`typography`は`design-grounding-human-convergence`の2文書に語として出るだけ、`Gestalt`は0件。`config/ui-domain/harness-console-bundle.json`はHELIXの管理画面のUI domainの実asset（`LEGACY-ASSET-AA1F81FBD362841251CF`）で、製品固有の値の塊なので素材にしなかった。

## 7. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。

| 属性 | 未決事項 |
|---|---|
| 由来 | D09-M05・M07・M08・M09は外部の調査原稿や指示書を起点にした旧の記録で、元の原稿は退役・repo外である。由来を旧資産とするか元の原稿とするか、元の原稿が読めないとき由来をどう記録するかが未決 |
| 適用scope | 見た目の知識は製品のVisual Identityと分けにくい（L2-006）。D09-M04のRule Pack分離の考えを、BRAINの知識recordの適用scopeの書き方（共通かどうか）に使うかが未決 |
| 評価根拠 | 見た目の良し悪しの一部は人の意味の判断で、機械の評価で代えられない（D09-M09 173–197）。どの知識をLABOで評価でき、どれが人の判断に残るかの区別が未決 |
| 限界・反例 | D04-M04（table-dumperの失敗）以外に、見た目の失敗例の素材がほぼ無い |
| 版 | WCAGの版（2.1→2.2）のように外部標準の版で観点が変わる。D09-M02の古さの記録の仕方が未決 |
| 状態 | 全件「未評価の候補素材」。D09-M05のlifecycle（candidate〜deprecated）を知識の状態にそのまま写さない |
| 領域の帰属 | D09とD10・D04の境目（§2の「主な領域」）は仮置き。L2-006が1つの要求でVisual DesignとUXを扱っているため、領域を分けるか1つにするかもHELIXBRAIN-L2-001の判断として未決 |
