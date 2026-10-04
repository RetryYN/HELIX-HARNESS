# D04 Frontend：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つ。本書では「画面を実装する側の構造：component分割と契約、状態の持ち方、data取得の境界、表示状態の網羅、表示の回帰の見方、browserで動くことの確認」を扱うと仮に読む。見た目の規則（token、色、余白）はD09、利用者の体験（流れ、状態の意味、a11yの体験）はD10に置いた。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D04-M01 | LEGACY-ASSET-52F12F8DB38C0379131D | `.claude/agents/fe-lead.md` | 28–37 | 9445bc82b51d009cbbf31978901a35ab683aef75603ff9f2a00b9439f601cf57 | frontendの設計で決めること（画面・componentの分割、状態管理の方針、data取得の境界、accessibilityの方針）と、使いやすさの判断を実装者が自分で決めず相談する経路 | Design Unit候補「frontend設計の決定項目」 | 決める項目の名前だけで、各項目の選択肢・条件を持たない。Opus／Sonnet・advisor-fableの役割分担は旧の運用で素材にしない |
| D04-M02 | LEGACY-ASSET-3C88B0A89AD7A9BCFAEE | `.claude/agents/fe-ui.md` | 27–35 | 78be74aac7bc3f006d500c77b38de500b24f31344d2b71640a8b315c96335590 | 実装時に守るaccessibility（意味を持つHTML、ARIA、keyboard操作、contrast）と、component testをgreenにしてから完了とすること | Part候補「実装時のaccessibilityの確認点」 | 列挙のみ。D10（a11yの体験）と重なる |
| D04-M03 | LEGACY-ASSET-1E6A456737CE9565E00B | `docs/design/harness/L2-screen/ui-element.md` | 28–46 | 46a762dfcd5289a9c775dd8c5297683043ad047a24945b067fcc96f192689c20 | 共通componentの台帳を「役割、主要props、state、event、根拠」の欄で持つ。表示状態を標準5値（ok／warn／error／empty／loading）に正規化する。全componentを読み取り専用にし、副作用はclipboardへの書込みだけに限る契約 | Design Unit候補「componentの契約（props・state・event）」、Part候補「表示状態の標準集合」 | 部品（DataTable、CopyButton等）と読み取り専用の制約はHELIXの管理画面（HARNESS console）に固有。台帳の欄の形と状態の正規化が汎用候補。台帳の分類は`RequirementSourceSnapshot`（r3） |
| D04-M04 | LEGACY-ASSET-787B224EBE62ACB57F52 | `docs/design/harness/L4-basic-design/ui-standard.md` | 44–49、63–73、189–214 | ac7a0b00c5d9380ba33226f90dd6e75764cc293c79c862ef6cf1a42e16a9c968 | 全画面を共通部品と画面固有部品の合成として確定し、汎用の表を描くだけの画面（table-dumper）への逆戻りを設計で塞いだ判断。設計原則（tokenを唯一の出典にする、全data表示部品で5状態を描きemptyとloadingを省かない、色だけに頼らない、完遂を描画数ではなく利用目的で測る） | Anti-Pattern候補「汎用table dumper」（失敗の実例付き：旧L7-102 prototypeの破棄、47–49）、Pattern候補「component合成で画面を作る」 | HELIX固有の失敗例だが、L2-010（成功例だけでなく失敗知識）の数少ない素材。「なぜ失敗か」の一般化は未評価。具体値（行高、hex等、80–121）は製品固有で持ち込まない |
| D04-M05 | 同上 | 同上 | 216–225 | 同上 | 表示の回帰testの単位を画面全体ではなく「部品×状態」のmatrixにする方針（状態網羅を回帰で担保） | Pattern候補「component×状態の回帰matrix」 | 環境（Desktop固定幅、light固定、日本語固定）はHELIX固有の制約。既存DT-VT-005（画面検証）と重なる |
| D04-M06 | LEGACY-ASSET-8B6EA6DFFE976FAD564A | `docs/skills/browser-testing-and-screen-verification.md` | 84–102 | 6f9f37072b0781b39a8ba19ecb2d04609babd5abaeeb7d23f63a9048dd59d0b5 | 実browserでの確認（変更前のbaseline、DOM・accessibility tree、network呼出しと外部interface設計との一致、表示の回帰）。表示差分を「意図した変更の波及／環境差／真の回帰」に分類してから判断し、閾値の緩和で環境差を吸収しない | Pattern候補「表示差分の原因分類」 | 既存SCF-B-0153の`materials/source-inventory.md`が同じ行を検証template材料として既に引いている。本書ではfrontendの知識としての観点だけを記録する |
| D04-M08 | LEGACY-ASSET-13604CA85F3B7D8D5055 | `docs/governance/document-system-map.md` | 90–122 | ea1ee83bfe00da66381a8861ad7b39b6f638f19e0ca6c5a4f9b64e6faccb90c1 | 層ごとに要るfrontend・UIの設計文書の定義（画面要求、画面一覧・遷移・UI要素・wireframe、画面の機能要件とAC、UI設計標準と部品catalogとdesign token、FE内部設計＝component分割・状態管理・routing・画面内部処理、画面ごとの機能設計＝項目・event・validation）と、対応する業界標準（IPA共通フレーム、Nablarch、IEEE 1016、ISO 9241、WCAG 2.2等）の対応表 | Design Unit候補「frontend設計で書く物の集合」（Domain→Pattern→Unitの分類の材料） | 層番号は旧L0〜L14系で、現行の層へ番号を写さない。旧では「定義」と「slot登録」までで、FE内部設計・画面ごとの機能設計の本文は起票されなかった（`docs/improvement-backlog.md` 15 IMP-145）。つまり書く物の名前はあるが中身の知識は無い |
| D04-M07 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 933–956 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「フロントエンド設計書」を`done`（実体はlint `frontend-design-coverage.ts`）、「ブラウザ対応・レスポンシブ設計書」「Web性能設計書」「Webセッション・CSRF・CORS設計書」を`todo`と記録していたこと | gapの根拠 | `done`の実体がlintで、frontend設計の知識文書ではない |

## 2. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/verification-test-template-seed-20261001/templates/DT-VT-005-screen-verification.md` | 画面検証（状態、表示の回帰、a11y） | 検証の欄は既にある。本書は設計知識の素材だけを扱う |
| `scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md` D1〜D7 | Playwright、axe-core、Storybook、DTCG／Style Dictionary、reg-suit／BackstopJS、textlint／Vale、Figma Code Connect | 外部参考として既にある。再掲しない |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「クライアント別パーツ」（ZIP Web 72〜75、`fe_design`等） | ZIP由来。重ねない |

## 3. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| WAI-ARIA Authoring Practices Guide | W3Cの公開文書（https://www.w3.org/WAI/ARIA/apg/） | componentの種類（dialog、tabs、combobox等）ごとのkeyboard操作と役割。D04-M02は確認点の列挙だけで、componentごとの振る舞いを持たない | W3C文書の利用条件に従う。D10とも関係する |
| Core Web Vitals | browser vendor（Google）の公開指標 | 表示の速さ・応答・安定の観点。旧台帳がWeb性能設計を`todo`（D04-M07） | 指標の定義と閾値は版で変わる。数値は持ち込まない |
| rendering方式（client側描画、server側描画、静的生成等）の比較 | 各framework・platformの公開文書 | data取得の境界（D04-M01）を選ぶ材料 | 特定frameworkの採用ではない |

## 4. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| 状態管理の選択肢（component局所、共有store、server stateのcache、URL）と使い分けの条件 | D04-M01は「状態管理の方針を決める」と言うだけ。URLに状態を持たせる例はHELIXの画面遷移（D10-M04）に1件あるのみ |
| data取得の境界（取得の場所、cache、楽観更新と巻戻し、loading・errorの扱い） | D04-M01に項目名があるだけ。旧の画面は30秒pollingの読み取り専用で、更新を伴う画面の知識が無い |
| responsive・browser対応の設計 | 旧台帳で`todo`（D04-M07）。旧の画面はDesktop専用（ui-element 102–105） |
| frontendの性能（bundle、描画、画像） | 旧台帳で`todo`（D04-M07） |
| 入力form（検証のtiming、errorの表示位置、二重送信の防止）の実装知識 | 旧の画面は読み取り専用で、formを持たない。二重送信はD10-M01の9状態に触れるだけ |
| session・CSRF・CORS等、browserに固有のsecurity | 旧台帳で`todo`（D04-M07）。Web展開後の内容であり1.0の必須にしない（D08 §4） |

## 5. 検索範囲と結果

- 範囲：`.claude/agents/`（fe-lead、fe-ui）、`docs/skills/`（browser-testing-and-screen-verification）、`docs/design/harness/L2-screen/`、`L4-basic-design/ui-standard.md`、`L10-ux/`、`docs/design/helix/L4-basic-design/`・`L5-detail/`のui-domain系、`docs/design/design-catalog.yaml`の`web`区分。
- 語：`frontend`、`component`、`state management`、`状態管理`、`responsive`、`SPA`、`render`、`fetch`、`CSRF`、`CORS`。
- 結果：frontendの設計知識は少ない。旧で作られた画面はHELIX自身の管理画面（15画面、Desktop専用、読み取り専用、30秒polling）だけで、知識はその前提に強く縛られる。`state management`・`状態管理`の出現は、fe-lead・fe-ui（D04-M01・M02）の項目名、document-system-map（D04-M08）の文書定義、旧L3機能要件のlibrary名（`docs/design/harness/L3-functional/functional-requirements.md` 882、HELIX自身の技術選定）等に限られ、選択肢と使い分けの知識は無かった。旧のFE内部設計の本文が起票されなかったことは`docs/improvement-backlog.md` 15（IMP-145）が記録している。

## 6. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。

| 属性 | 未決事項 |
|---|---|
| 由来 | D04-M04の失敗例（table-dumperの破棄）は旧の実績だが、根拠の記録（`feedback_central_ui_kouteihyou_mission_not_coverage`等のmemory参照、48・214）は旧memoryで、現行で読めるかが未確認。由来として何を指すかが未決 |
| 適用scope | 旧の画面は読み取り専用・Desktop・単一言語。この前提を外したときに成り立つ知識かどうかを書く根拠が無い（L2-011の一般化の扱い） |
| 評価根拠 | 旧の`frontend-design-coverage` lintや旧testの合格は証拠にしない。評価の主体（LABO）と対象が未決 |
| 限界・反例 | D04-M04は反例（失敗例）を持つ珍しい素材。どの条件で汎用表が失敗するか（利用目的が明細の閲覧でない場合等）を書き分ける必要があり、未決 |
| 版 | ui-element（r3）とui-standard（r1）は層配置の是正（visual-design.md→ui-standard.mdへのre-home）を経ている。どの時点の内容を素材とするかが未決 |
| 状態 | 全件「未評価の候補素材」 |
| 領域の帰属 | D04-M03〜M05はD09（見た目）・D10（状態の意味）と強く関係する。L2-006はVisual Design・UXを1つの要求で扱っており、Frontendとの切り分けが未決 |
