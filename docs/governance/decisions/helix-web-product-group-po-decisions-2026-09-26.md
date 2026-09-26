---
title: "HELIX-Web製品群 要求原案のPO提示と判断 decision record（2026-09-26）"
decision_record_id: HDEC-HELIX-WEB-PRODUCT-GROUP-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md
source_body_sha256: a61feb6941412c5a7e6677b814a9d4568a79cf92c0da0951b74db3a6e43cddbf
source_repository_revision: 554aff0d3
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-Web製品群 要求原案のPO提示と判断（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POが「HELIX-Web製品群 要求原案」の本文を、指示を添えずに示した。本書はその会話の記録である。
POの発言と選択はそのまま引用し、AIの整理と区別する。POが選んだ選択肢は、選択肢の説明文も含めてPOが選んだ内容として扱う。
本文の原文は[source snapshot](../../../helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md)に保存した。snapshotの区切り線より下が原文のbytesそのままであり、そのSHA-256は`a61feb6941412c5a7e6677b814a9d4568a79cf92c0da0951b74db3a6e43cddbf`である（snapshotファイル全体のSHA-256は`0762eecef2225f4a175bf8fa1cb668116a5526d87aac8071c15be92c545f7db1`）。
原文の状態は「要求候補・未採択」である。本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## POの提示

POは本文だけを示した。本文は、HELIX-Webを製品の総称とし、HELIX-WEB-HARNESSの7製品、共通のHELIX-WEB-HARNESS-CORE、接続製品のHELIX-WEB-CONNECTER（原文の綴り）、運転機構のHELIX-WEB-OSに分け、それぞれの要求候補、LABOに内蔵するHELIX-Benchへの追加、製品間・本体間の接続、共通の非機能、構成体、受入シナリオ、導入段階を示す。

## AIの問いとPOの回答

### 1. 文書の置き場所

AIの問い：

> この原案の文書配置は docs/ の下に helix-web-harness-* 等を並べる形ですが、直前に『docsに本体とWebが混在するのがきもい』という指示で、Webの文書をリポジトリ直下の helix-web/ へ移すPR #2151 を出したところです。Web製品群の各対象の文書はどこに置きますか？（LABOへの追加分は本体なので docs/helix-labo/ のままです）

POの選択：「helix-web/docs/ の下に並べる（推奨）」

> helix-web/docs/helix-web/、helix-web/docs/helix-web-harness/、helix-web/docs/helix-web-harness-prototype/ … helix-web/docs/helix-web-os/ のように、原案のフォルダ名をそのまま helix-web/docs/ の下に置く。docs/ は本体だけのまま。

### 2. Conceptへの反映

AIの問い：

> Conceptには今、HELIX-Web（製品）とHELIX-Web-OS（機構）の2行しかありません。原案は、HELIX-Webを製品の総称にし、WEB-HARNESSの7製品・共通CORE・WEB-CONNECTER・WEB-OSに分けています。この構成をConceptにも反映しますか？

POの選択：「今、Conceptにも反映する（推奨）」

> ConceptのWebの行を、原案の製品群の構成（総称、7製品、CORE、CONNECTER、WEB-OS）に合わせて書き直す。要求候補とConceptの構成が食い違わない。

### 3. 接続製品の綴り

AIの問い：

> 接続製品の名前は原案で『HELIX-WEB-CONNECTER』とあります。英語の綴りは通常 CONNECTOR です。どちらにしますか？

POの回答：

> いや、ルール化したのをいちいち聞き返さないでくれるかな？うっとうしい。

AIの整理：
- 命名の規則は、2026-09-26に決まっている。名前は英語で書き（[BRAINの判断記録](brain-l1-idea-po-decisions-2026-09-26.md)の「英語な。それさっき命名ルールとして書いたよね？」）、すべて大文字で書くのはコアシステムの名前に限る（[LABOの判断記録](labo-core-engine-po-decisions-2026-09-26.md)「HELIX-HARNESS-COREの名称」）。
- この規則により、接続製品の名前は英語の綴りでHELIX-WEB-CONNECTOR、フォルダは`helix-web-connector/`とする。原文のCONNECTERは、命名の規則（英語）によりCONNECTORと書く。
- 原文のsnapshotは綴りを変えずに保存する。
- 要求候補のID接頭辞も名前から作られているため、同じ規則で`HELIXWEBCONNECTER-L2-`を`HELIXWEBCONNECTOR-L2-`と書く。番号（001〜009）、種類、文言の意味は変えない。原案19節の「CONNECTER001」等の参照と、要求文中の「WEB-CONNECTER」「CONNECTER版」も同じくCONNECTORと書く。変えたのは綴りのE→Oだけである。

## 名前

AIの整理：
- 原案1.1が定める名前を使う。HELIX-Web（製品の総称）、HELIX-WEB-HARNESS、HELIX-WEB-HARNESS-PROTOTYPE、-REQUIREMENTS、-DESIGN、-DEVELOPMENT、-REFACTORING、-RELEASE、-OPERATIONS、HELIX-WEB-HARNESS-CORE、HELIX-WEB-CONNECTOR、HELIX-WEB-OS。略すときは原文どおりWEB-HARNESS、CORE、WEB-CONNECTOR、WEB-OSと書く。
- 2026-09-26のLABOの判断記録は「HELIX-WebとHELIX-Web-OSは、同じ系統（Web）で揃っているため、今の表記を保つ」としていた。今回のPOの原文がHELIX-WEB-OSと書くため、現在の意味を持ち更新され続ける文書のHELIX-Web-OSをHELIX-WEB-OSへ改める。HELIX-Webは原文どおり今の表記を保つ。
- 改めない：判断記録、監査記録、source snapshot、POの発言の引用、要求と候補のID（`HELIXWEBOS-L2-001`等）、台帳・契約の機械参照の値（`legacy-*.jsonl`、`phase-capability-inventory.*`、要求対応表JSONLの`mechanism_product_attributes`の`HELIX-Web-OS`、`management-provisional-requirement-registration.md`・`requirement-atomization-review-contract.md`等の`product_target`／`candidate_target`の値）、`scaffold/`配下。これらは当時の記録または機械参照のkeyであり、名前を改めると照合先と食い違う。

## 置き場所

AIの整理：
- POの回答1により、原案1.2のフォルダを`docs/`ではなく`helix-web/docs/`の下に置く。フォルダ名は原案のまま（接続製品だけは上の綴りで`helix-web-connector/`）。
- 各対象のフォルダには、短い入口`README.md`と、`candidates/`の候補ファイルを置く。候補ファイル名は原案1.2のとおり、製品群・製品は`product-requirements.md`、COREは`core-requirements.md`、WEB-OSは`service-governance-requirements.md`とする。
- 原案の2節（全体）、1.1（製品構成）、15〜20節（接続、非機能、構成体、受入シナリオ、元の32項目との対応、導入段階）は`helix-web/docs/helix-web/candidates/product-requirements.md`へ、3節は`helix-web-harness/`へ、4〜10節は7製品の各フォルダへ、11節は`helix-web-harness-core/`へ、12節は`helix-web-connector/`へ、13節は`helix-web-os/`へ置いた。
- 14節（LABO内のHELIX-Benchへの追加）は、原案どおり本体の[LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ節を追加して接続した。既存の内容は消していない。独立した`helix-web-bench/`は作らない。
- 各候補ファイルは、原文のID・種類・文言をそのまま載せ（綴りの例外は上のとおり）、見出しの階層だけを一段下げ、snapshotの行範囲を出典として記した。
- 既存の`HELIXWEB-L2-001`〜`009`と`HELIXWEBOS-L2-001`〜`006`（2026-09-24にVision材料へ分類）は意味を上書きしない。原案どおり、候補は`HELIXWEB-L2-010`以降、`HELIXWEBOS-L2-007`以降である。
- 原案は「要求候補・未採択」であり、2026-09-24にWeb系をVisionレベルの材料へ分類し直した経緯（[判断記録](concept-requirement-po-decisions-2026-09-24.md)）もあるため、L1・L2・L11の本文には入れず、`candidates/`に置く。

## Conceptへの反映

POの回答2により、[HELIX Concept](../../concept/helix-concept.md)を次のように改めた。原案の構成の範囲を超えて意味を変えない。

| 箇所 | 前 | 後 |
|---|---|---|
| 版の表 1.x「加わる機構」 | Web、Web-OS | HELIX-Web（製品群）、HELIX-WEB-OS |
| 機構の増え方の図 1.x | HELIX-Web 《製品》、HELIX-Web-OS | HELIX-Web 《製品群》（WEB-HARNESSの7製品・CORE・CONNECTOR）、HELIX-WEB-OS |
| 3章の冒頭 | 製品は機構の一部であり、HARNESSとWebだけが製品の属性を持つ | 同じ文に、HELIX-Webは製品の総称で機構としては1つに数えること、製品の数え方は「HELIX-Web」節に示すことを加えた |
| 提供と改善の図 | HELIX-Web 《製品》（サービス①〜⑦）、HELIX-Web-OS、Webコネクタ | HELIX-Web 《製品群》（WEB-HARNESSの7製品）、HELIX-WEB-OS、HELIX-WEB-CONNECTOR |
| 機構の役割 HELIX-Web | HARNESSのサービス①〜⑦をリリース単位として顧客へ提供する窓口 | Web提供系の製品の総称。WEB-HARNESSの7製品を提供し、共通機構のWEB-HARNESS-CORE、接続製品のWEB-CONNECTORを含む |
| 機構の役割 HELIX-WEB-OS | 顧客のtenant・job・サービス状態・配備・監視・復旧 | Web提供系の運転機構として、原案1.1の「顧客案件、工程、ジョブ、権限、提供版、サービス運転」を加えた |
| 機構の役割 HELIX-CONNECT | 利用者に提供する接続は、別のWebコネクタとする | HELIX-Webの接続製品HELIX-WEB-CONNECTORとし、所属と要求を分ける |
| HELIX-HARNESS節 | 同じサービス①〜⑦を、HELIX-Webがリリース単位として顧客へ提供する | HELIX-WebがHELIX-WEB-HARNESSの7製品として顧客へ提供する |
| HELIX-HARNESS節 | HELIX-HARNESS-COREのJSONとPythonは公開しない | Webでは顧客製品ごとのHELIX-WEB-HARNESS-COREも同じく公開しない（原案3節005、11節009） |
| 新設「HELIX-Web」節 | なし | 製品群の構成表、7製品の単独成立、COREとWEB-OSを製品として数えないこと、WEB-CONNECTORとHELIX-CONNECTの区別、WEB-OSと本体OSの分離、機構数の数え方、HELIX-BenchがLABO内にあること、候補の置き場所 |

機構・製品の数え方（AIの整理）：
- Conceptは「8つの機構と1つの共通部品」とし、HARNESSとWebだけが製品の属性を持つ。原案はHELIX-Webを製品の総称とし、COREやWEB-OSを8番目・9番目の製品として数えない。
- HELIX-HARNESS-COREがHELIX-HARNESSの中の部位で機構として数えないのと同じく、HELIX-WEB-HARNESS-COREとHELIX-WEB-CONNECTORはHELIX-Web（製品群）の中にあり、機構として別に数えない。HELIX-WEB-OSは原案1.1で「Web提供系の運転機構」と分類され、製品ではないため、従来どおりHELIX-Webとは別の機構として数える。この数え方で、機構は8つのまま変わらない。
- 製品の数は、WEB-HARNESSの製品が7つであり、HELIX-Web（総称）、HELIX-WEB-HARNESS（総称）、HELIX-WEB-CONNECTOR（接続製品）を、その7つへ足して数えない。機構数・製品数・要求対象数を互いに言い換えない（[AGENTS.md](../../../AGENTS.md)「現在の境界」）。
- 原案2節の010は、HELIX-Webの識別対象に「WEB-OS」を含める。一方、1.1はWEB-OSを製品総称のHELIX-Webとは別の行（運転機構）に置く。本書は、WEB-OSを「Web提供系」に属し製品群HELIX-Webの外にある機構と読んだ。この読み方は下の「食い違い」に挙げる。

同じ内容で、[製品責務境界](../../concept/product-boundary.md)、[新世代作業入口](../new-generation-start-here.md)、repository直下と`docs/`の`README.md`、[helix-web/の入口](../../../helix-web/README.md)、[Concept機構の要求対応表](../crosswalks/concept-mechanism-version-requirement-crosswalk.md)の注記を改めた。[5大目標](../../concept/helix-five-goals.md)にはWebの構成を書いた箇所がなく、変えていない。

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。

| 原案の項目 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| HELIX-Webの初期形（Connector型、利用者環境をWebから操作）、WEB-CONNECTOR | 旧Vision v0.1 §6.1（`archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md:237-256`、U08／U09 `:537-538`、資産`LEGACY-ASSET-DD53551C74BB4939A325`） | 利用者のPC・WSL・VPS・リポジトリを使い、全コード・資格情報・計算資源をSaaSへ移すことを必須にしない。Connectorに開発engineを重複実装しない | 接続を担うものを接続製品HELIX-WEB-CONNECTORとして名前を付け、製品群の中に置く |
| 認証方式・利用枠の扱い（CONNECTOR004） | 旧Vision §6.2（同`:258-264`） | 公式クライアントで使えることと第三者経由で同じ利用枠を使えることを同じ確認事項にしない。未対応の経路を対応済みと表示しない | 同じ |
| 本体とWebの交差、製品単位の新版反映（COMPOSITE004・005、WEB-OS019、接続014） | 旧Vision §10（同`:375-405`、U10／U11） | 同期させるのは版番号ではなく、確認した能力と利用結果。Webの変更で無関係な本体やモデルを一斉更新しない | 同じ |
| データの利用目的の分離（NFR003・004、LABO-WEB-012） | 旧Vision §11「学習とデータ利用の境界」（同`:423-429`） | サービス利用を横断学習の同意にしない。個別プロジェクト内の利用、事業内の改善、横断的な知識化、モデル学習を分ける | 原案は「公開」も別の利用目的として加える |
| 7製品の単独成立（全体012、HARNESS002） | 現行ConceptのHELIX-HARNESS節（サービス①〜⑦の単独成立・単独リリース） | 各製品は単独で使え、単独でリリースできる | Webでは7製品をHELIX-WEB-HARNESSの製品として名前を付ける |
| Linux限定・OSの分離（全体014、CONNECTOR001・002） | 旧HIL-TR-04（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:168`）、HIL-NFR-19（同`:199`） | Linuxをprimaryとし、他OSの未実施を明示する。Windowsの成功をLinux互換の証拠にしない | 旧はHELIX本体の開発基盤のOS方針。原案は、Web提供系でのHELIXの実行環境を検証済みLinuxに限り、操作端末のOSと対象製品の動作OSを分ける |
| HELIX-Benchによる比較（LABO-WEB-002〜005、009） | 旧HELIX-Bench評価契約（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:21-35,76-95,128-147`、資産`LEGACY-ASSET-28FB139B26CD61CC51EE`） | 単体のモデル能力ではなく、HELIXの編成と規律がどれだけ正確・安全・低費用に完遂させるかを比べる。`no_harness`〜`helix_full`のprofileを直交させ、provider名・model名を固定の加点・減点に使わない。失敗・欠測を分母に残す。費用欠測を0円にしない | 原案は、比較の目的を「HELIXによる性能差の吸収」と明示し、Web由来の実績を材料にする |
| 観測と実験の分離、日次集計、集計停止時の継続（LABO-WEB-004・007・014、NFR006、WEB-OS018・021） | 旧execution-ticketの`HXB-FR-009`・`HXB-FR-013`・`HXB-FR-014`・`HXB-FR-016`（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:325-327,341-355`、資産`LEGACY-ASSET-3A15E5645D2D2A59DFF5`） | 本線と実験の予算を分ける。raw eventから再構築し、再採点は新versionとして持つ。分析・dashboardの停止時も本線を続け、degradedと遅延を表示する | 原案は、集計を非同期バッチで日次とし、Webの公開画面へ反映する |
| BenchをLABO内に置く | 旧HXB-FR-015（同`:349-351`）、現行LABO L1のHELIXLABO-L1-011 | Benchは証拠の状態と改善候補を返し、割当てを自分で決めない | 同じ。原案は、BenchをLABOと並ぶ機構やWeb専用の評価エンジンとして新設しない |
| PM（案件遂行）の画面区分 | 旧business-requirements（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:340`） | 案件遂行（PM）を動的な状態として持つ | 旧はHELIX自身のdashboard。原案のWEB-OSは顧客案件の運転であり、本体OSと状態・権限を共有しない |

旧HELIXに根拠が見つからない点（新規案。検索範囲：`archive/legacy-generation-2026-09-14/root/docs/`の`design/`、`governance/candidates/`、`archive/intake/2026-09-06-concept-vision/`を「Web-OS」「公開統計」「性能差」「Linux」「Bench」で検索）：
- Web提供系の運転機構としてのHELIX-WEB-OS（旧にWeb-OSに当たる文書はない。現行では2026-09-14のPO発言が出所である）。
- 公開統計（全体017・018、WEB-OS018、LABO-WEB-008、接続012）。旧HELIX-Benchは、dashboardと実score主張を非対象としていた（`helix-bench-evaluation.md:165-170`）。
- 顧客製品ごとのHELIX-WEB-HARNESS-COREと、HELIX-Web製品群自身を開発するためのCOREの分離（CORE001）。

いずれもPOの原文が出所であり、AIが推測で加えたものではない。

## 反映先

- source snapshot：[helix-web/docs/helix-web/sources/](../../../helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md)
- 候補：`helix-web/docs/`の12フォルダ（`helix-web`、`helix-web-harness`、`helix-web-harness-prototype`、`-requirements`、`-design`、`-development`、`-refactoring`、`-release`、`-operations`、`helix-web-harness-core`、`helix-web-connector`、`helix-web-os`）の`README.md`と`candidates/`。`helix-web`と`helix-web-os`の`README.md`は既存のものに候補への案内を加えた。
- LABO：[LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)に「HELIX-Web由来の実績に対する追加候補」の節を加えた。
- Concept、製品責務境界、作業入口、`README.md`、`docs/README.md`、要求対応表の注記：上の「Conceptへの反映」のとおり。
- 名前の書き換え（HELIX-Web-OS→HELIX-WEB-OS）：上の文書に加え、`helix-web/`配下のVision材料（L1・L2・L11。題名と本文の名前だけ）、HELIX-OSの`README.md`・L1・L2・L11、HELIX-SECURITYとHELIX-INFRASTRUCTUREのL1の該当行。
- [AGENTS.md](../../../AGENTS.md)「現在の境界」の製品と機構の文（35行）：現行の作業規則の文なので、名前をHELIX-WEB-OSへ改め、HELIX-Webが「WEB-HARNESSの7製品等をまとめた製品群」であることを加えた（原案1.1と回答2の構成反映）。製品と機構を分ける意味は変えていない。

## 原案と現行との食い違い

| 点 | 原案 | 現行 | 扱い |
|---|---|---|---|
| WEB-OSとHELIX-Webの関係 | 1.1はWEB-OSを製品総称と別の行（運転機構）に置き、2節010はHELIX-Webの識別対象にWEB-OSを含める | ConceptはWebとWeb-OSを別の機構とする | WEB-OSを「Web提供系」の、製品群の外の機構と読んでConceptへ反映した。製品群の中の機構と読む場合は機構の数え方が変わるため、POの確認が要る |
| 接続製品の綴り | HELIX-WEB-CONNECTER、`HELIXWEBCONNECTER-L2-` | 命名の規則（英語） | 規則によりCONNECTORと書いた（上の回答3） |
| HELIX-CONNECTとWEB-CONNECTORの区別 | 別の所属・要求（12節の末尾） | Conceptは「利用者に提供する接続は、別のWebコネクタ」 | 食い違いなし。Conceptの名前をHELIX-WEB-CONNECTORに改めた |
| WEB-OSのjobと工程の管理 | WEB-OSが顧客案件のjob、ticket、レーン、Workerクラスの指定、検収を管理する（13節008〜013）。本体OSの運転authorityを共有しない | 2026-09-26の[統合確認の判断記録](handoff-integration-po-decisions-2026-09-26.md)の回答7で、Web-OSのjobを内部のOSのチケットとして回すかは「まだ要求にすら落としてない」とされた。ConceptはWeb-OSからWorkerへjobを渡す図を持つ | 原案はWeb-OSの要求候補を示したが、未採択である。Conceptの図と機構の表は食い違わないため変えていない。WEB-OSのticketと本体OSのticketの関係（Workerの共通契約の再利用の範囲）は、候補を採択するときに確かめる |
| レーン・Workerの指定 | WEB-OS010はLABOの実績とINTELLIGENCEの配置案からWorkerクラスを指定する | 本体はLABOの水準→INTELLIGENCEの配置の案→OSの推進の指定の三段 | 同じ三段をWEB-OS側で使う形であり、食い違いはない。本体OSの指定をWEB-OSへ流用しない点は原案の13節の末尾のとおり |
| Linux限定 | HELIXの実行環境を検証済みLinuxに限り、操作端末のOSと分ける（全体014、CONNECTOR001・002） | Conceptの版の表1.xは「利用者のPC・WSL・VPS・リポジトリをWebから操作する」。Vision材料のL2は「WSL必須とはしない」 | 原案はWSL上のLinuxを含むため両立するが、「PC」でLinux以外を実行環境にする読み方は原案と食い違う。Conceptの版の表の文言は、候補の採択まで変えていない |
| 公開統計 | HELIX-Benchの公開用の結果を日次でWebに公開する（全体017・018、WEB-OS018、LABO-WEB-008、接続012、シナリオ「性能差吸収の公開」「集計障害からの復旧」） | Conceptと各機構のL1に公開統計はない。LABO L1はBenchの水準をINTELLIGENCEへ渡す | Conceptへは加えていない（POの回答2は構成の反映であり、公開統計は構成ではない）。採択するときに、ConceptとLABO L1への追加を判断する必要がある |
| HELIX-BenchのLABO内の所属 | LABO内。Web専用の評価エンジンを作らない | ConceptのLABOの行は「HELIX-BenchでWorkerの作業履歴を集計」 | 食い違いなし。Conceptの「HELIX-Web」節に一文を加えた |
| LABO-WEBのID | `HELIXLABO-L2-WEB-` | LABOはL1企画案がPOの対象revisionの確認待ちで、L2がない | 候補として置いた。LABOのL2の採番と合わせるのは、L1の確認後である |
| Web由来のログの経路 | WEB-OSが観測をLABOへ渡す（WEB-OS017、接続011） | 製品責務境界のPO発言は「Web-OSからのログをHELIX-OSが吸収」。Conceptの図はWEB-OS→LABOと、LABO→OSの改善提案を持つ | Conceptの図と原案は食い違わない。PO発言の引用は当時の記録として変えていない |
| 元の32項目 | 19節は「元の32項目」との対応を示す | 元の32項目の原文はこのrepositoryに保存されていない | 19節の表は原文のまま置き、元の項目との照合は未了とした |
| 機械参照の名前 | HELIX-WEB-OS | 台帳・契約の値と`scaffold/`は`HELIX-Web-OS` | 本PRでは変えていない。これらは履歴として保持する機械参照のkeyであり、現行の規則文の名前（本PRで`AGENTS.md`を含めて改めた）とは区別する。台帳の値を改めるなら、照合する検査と一緒に扱う必要がある |

## 研究用validatorへの影響

`scaffold/`の研究用pinは、次の範囲だけを更新した。validatorのコード、判定の条件・分岐・意味field・期待件数は変えていない。

- 名前の書き換え（HELIX-Web-OS→HELIX-WEB-OS）を含む行にかかるpin 66件（phcap04-05に5件、phcap06に7件、phcap07に6件、phcap08-09に7件、phcap10-11に4件、phcap12-13に6件、phcap14に7件、phcap16に3件、phcap17に4件、phcap18に2件、phcap19に8件、phcap20に7件）は、同じ行範囲の後継文言へ再pinし、`exact_text`、行SHA、ファイルSHAを更新した。差が名前の書き換えだけであることは、旧文面の各行へ同じ書き換え（「」の引用の外のWeb-OSをWEB-OSにする）を当てた結果が新文面と完全に一致することで確かめた。行の範囲は変わっていない。
- 本文の変わらない範囲のpin 21件は、ファイルSHAだけを更新した。
- wave37〜50のmetaのinput digestとdigest連鎖、outside67 follow-up 073・074・076の現行counterpartのbytes・SHA、phcap12-13の`scaffold_context`（SCF-B-0003）と048の`binding_sha256`（SCF-B-0010）を、上流とBindingの更新に合わせて付け直した。
- 製品責務境界の「対象別の正規入口」と「上位Conceptへの正規投影」の表のHELIX-Webの行は、研究用pinの意味を変えないよう文言を保ち、製品群の構成は冒頭の段落に書いた。
