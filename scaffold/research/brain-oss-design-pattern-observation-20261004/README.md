# OSSの実装から読んだ設計パターンの観察（HELIX-BRAINの素材）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../bindings/SCF-B-0156.json)
基準：`origin/main` `6b4b5fd31714e9fbcbef77189efaed93261b86e3`（2026-10-04）

## 何をしたか

[HELIX-BRAINの初期10領域の知識素材の棚卸し](../brain-domain-material-inventory-20261004/README.md)（SCF-B-0155）は、旧HELIXの資産に欠けている観点（gap）を各領域の§gapに記録した。本書は、そのgapのうち7つについて、公開OSSのrepositoryを固定commitで実際に読み、使われている設計の構造を観察として記録したものである。

POの発言（2026-10-04、原文）は次のとおり。
> 「素材あつめ次に進めてくれ。実際のOSSやギットハブリポジトリとかからも探し出せてリバースエンジニアリングで設計のパターンを調べまくるのはどうかね？机上の空論ばかりあつめても仕方ないしな。」

- 観察は計80件で、35のrepositoryにわたる。テーマごとの件数は下表のとおり。
- 各観察には次を書いた。
  - 出典：repository、固定commit、path、行範囲、permalink、SPDXライセンス
  - 何をしているか、解いている問題と前提、必要な入力
  - trade-off・失敗の仕方（コード、ADR、issueを根拠にする）
  - 反例・適用しない場合、互換・非互換、限界
- テーマごとに、同じ問題をrepositoryごとにどう解き分けているかを比較表にした。
- 見つからなかったこと、検索範囲と結果、BRAINの属性について未決の事項も書いた。
- 全件が「未評価の候補素材」である。

| テーマ | 材料 | 観察 | repository | 埋めようとしたgap（SCF-B-0155） |
|---|---|---:|---:|---|
| P01 architecture styleと境界の分け方 | [P01](materials/P01-architecture-style-boundaries.md) | 11 | 5 | D01／D02「architecture styleの比較とtrade-off」 |
| P02 非同期連携の契約 | [P02](materials/P02-async-integration-contracts.md) | 13 | 5 | D05「非同期連携の契約」 |
| P03 分散データの整合性 | [P03](materials/P03-distributed-data-consistency.md) | 11 | 5 | D06／D03「分散dataの整合性」「分散した副作用の一貫性」 |
| P04 scaling・DR・費用 | [P04](materials/P04-scaling-dr-cost.md) | 12 | 5 | D07「scaling・capacity」「DR・BCP」「費用の構造」（INFRA-005/006/008/010/011） |
| P05 認可model | [P05](materials/P05-authorization-models.md) | 13 | 5 | D08「認可modelの選び方」 |
| P06 typography・grid・design token | [P06](materials/P06-typography-grid-tokens.md) | 10 | 5 | D09「typography・grid」 |
| P07 formと情報構造 | [P07](materials/P07-forms-information-architecture.md) | 10 | 6 | D10「formと情報設計」 |

dotnet/eShopはP01とP03の両方で読んだ。repositoryの延べ数は36、重複を除くと35である。

## 置き場所と形の根拠

| 判断 | 根拠 |
|---|---|
| scaffoldに置き、採否・登録をしない | AGENTS.md「仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く」。Bindingは[SCF-B-0156](../../bindings/SCF-B-0156.json)。外部repositoryの参考資料をscaffoldに置いた先例は`scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md`（SCF-B-0153） |
| 調べ方 | 旧HELIX `docs/skills/research.md`（`LEGACY-ASSET-32BC69F146336853F188`、全体SHA-256 `f729ada7fae989241846c89c78e1ac6f062fb63a31acb7140e6149b2909ad079`）を起点にした。詳細は下の「旧HELIXの調べ方との対応」 |
| 観察の形 | HELIXBRAIN-L2-003のPattern descriptor（問題、前提、applicability、required input、constraint、trade-off、negative case、failure mode、compatible／incompatible pattern、evidence）に寄せた。maturityは書かない（未評価のため） |
| 状態は未評価 | HELIXBRAIN-L2-007・L2-025は、AI生成・文書の存在・単一の実績だけで汎用知識へ昇格させない。外部repositoryで採られていることは、HELIXでの成立を意味しない |
| 外部知識の取込み経路との関係 | 外部source（OSS等）をBRAINのknowledge candidateにする経路はHELIXBRAIN-L2-026・027（`version_target: 2.0`）で、LABOの分解・比較・評価、OSの登録、BRAIN内の独立検証を経る。本書はその経路の前段の調査材料であり、LABOの評価、BRAINへの受渡し、採否のどれも行わない。経路を1.0へ前倒ししない |
| 値を持ち込まない | 閾値、既定値、timeout、色、寸法、比、段数、単価などの値は、出典に書かれていても写していない。構造（何が何を決め、どこに置かれるか）だけを書いた |
| コードを写さない | 構造の説明、識別子、短い引用だけにした。copyleftのrepositoryも構造の観察だけにした |

## 旧HELIXの調べ方との対応

旧`docs/skills/research.md`は、外部技術の調査の手順として、primary sourceだけを根拠にする、本文を確認したURLだけを引く、取得日を書く、を定めていた（同file 27–29、38–69、78–92）。

| 項目 | 旧HELIX | 本書 | 変えた理由 |
|---|---|---|---|
| 根拠にするsource | `primary`（vendor公式docs、standard spec、official source repo）だけを判断の根拠にする | 保持。全観察を公式source repositoryのコード・設計文書・issue・PRに限り、信頼性ラベルを`primary`と書いた。blogやまとめ記事は根拠にしていない | — |
| 本文の確認 | WebFetchで本文を確認したURLだけを引く | 保持。全引用は、固定commitで実際に読んだ行に限った | — |
| 取得日 | retrieval dateを必ず書く | 保持。repositoryごとに取得日を書いた | — |
| 版の固定 | version／date scopeを書く | 強めた。branch名ではなく、40桁のcommit SHAに固定したpermalinkで引く | 行番号はbranchの更新で変わる。commit SHAに固定すると、同じbytesを後から読み直せる |
| 取得の手段 | WebSearch→WebFetch | GitHub API（`gh api`）と、固定commitへの`git clone --filter=blob:none`・checkout | コードの構造を読むには、ページ単位の取得よりrepository単位の取得が要る。clone先は作業用の一時領域で、repositoryに含めていない |
| 記録先 | PLAN、ADR、`.helix/audit/` | `scaffold/research/`とScaffold Binding | 旧CLI・旧`.helix/`は現行の経路ではない（現行HELIXローダ）。scaffoldに置く理由は上表のとおり |
| 実行 | 規定なし | repositoryのコード、script、test、build、install、hookを一切実行していない | AGENTS.mdの「参照は読むことに限る」を外部repositoryにも同じく当てた |
| 委譲 | lightweight roleへ委譲し、返った結果の少なくとも1件を自分で確かめる | 保持して強めた。テーマごとに調査担当へ委譲し、作成側で全permalinkの機械照合と、行の内容の抜き取り照合を行った（§照合） | delegated outputはclaimでありevidenceではない、という旧規定（同file 84–85）を保つため |

## 照合

- **permalinkの実在**：材料7本に書かれたpermalink 222件について、固定commitに該当fileがあり、行範囲がfileの行数の内側にあることを機械で照合した。不一致は1件で、P06のPrimer ADR-006の行範囲がfile末尾を越えていた。作成側が原文を読んで正しい行に直した。
- **内容の抜き取り照合**：各材料から16〜20件、計118件の引用を選び、固定commitの該当行が観察の主張どおりかを読んで確かめた。
  - 内容が存在しない、または誤った記述（WRONG）は0件だった。
  - 行が1〜数行ずれていたもの（SHIFTED）は12件あった（P01 3件、P02 1件、P03 1件、P04 2件、P07 4件、ほかにP06のADR-006）。すべて正しい行に直した。
  - 行番号だけで出典fileが曖昧だったもの2件（P03）にfile名を足した。観察IDの相互参照の誤り2件（P07）も直した。
  - 10行を超えるコードの転記、採用値としての数値、メールアドレスやtokenは、いずれもなかった。
- **値・機密の検査**：hexの色、px、ms、メールアドレスの形をgrepし、該当0件だった。
- **license**：SPDXはGitHub APIの値をそのまま書いた。`NOASSERTION`のもの（final-form、eventuate-tram-core、eventuate-tram-sagas、Polaris）は、LICENSE fileの冒頭の文言を併記した。

## 既存素材との境界

| 既存素材 | 本書との境界 |
|---|---|
| `scaffold/research/brain-domain-material-inventory-20261004/`（SCF-B-0155） | 旧HELIX資産の棚卸しとgap。本書はそのgapに対する外部の観察で、旧資産は扱わない。SCF-B-0155の§「外部参考（観点の名前のみ）」は、名前を挙げただけで中身を読んでいない。本書は中身を読んだ観察である |
| `scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md`（SCF-B-0153） | 検証・test技法の参考資料（OpenSLO、Playwright等）。本書は設計の構造の観察で、検証技法は扱わない。重なるrepositoryはない |
| `scaffold/research/design-template-seed-*`（SCF-B-0152、0154） | 設計templateのseed。本書の観察はtemplateの欄を作らない |

## 生成しないもの

- 素材の採否、BRAINへの登録、知識recordの作成、状態（採用済み・評価済み・成熟度）を生成しない。全件「未評価の候補素材」である。
- 技術選定、採用推奨、優劣の結論を生成しない。repository名・tool名は観察の出典であり、採用ではない。
- 要求の意味を生成しない。HELIXBRAIN-L2-001の領域の意味、INFRA要求の意味を変えない。各観察の領域への当てはめは仮置きである。
- 値（閾値、既定値、timeout、色、寸法、比、段数、単価）を生成しない。
- HELIXBRAIN-L2-026・027（2.0）の経路を1.0へ前倒ししない。LABOの評価、OSの登録、BRAINへの受渡しのどれも行わない。
- Web展開後のSecurity・Infrastructureの内容を1.0の必須にしない。securityの観察を全製品の義務にしない。
- 新しい規則・承認手続きを作らない。

## 後続

1. 各観察は、HELIXBRAIN-L2-026・027の経路が成り立った後に、LABOで分解・比較・評価する候補になりうる。それまでは、L3起草以下で各領域の知識recordの形を考えるときの実例として読むに留める。
2. 各材料の§「BRAINの属性について未決の事項」は共通して次を挙げている。L2-007・008を降ろすときの入力候補にする。
   - (a) 仕様由来と実装由来、設計文書（ADR）と実装が食い違うときの由来の区別
   - (b) 観察の主な領域をどう決めるか（複数の領域にまたがるもの）
   - (c) 版の主キーをcommit SHAにするか、製品のrelease版にするか
   - (d) open issueなど上流の変化で古くなる根拠を、いつ確かめ直すか
   - (e) SPDXが`NOASSERTION`のrepositoryのlicenseをどう記録するか
3. 正式なBRAINの知識storeと素材が入ったら、SCF-B-0156に対して`scfctl check-replacement` → `retire`で本scaffoldを撤去する。
