# OSSの実装から読んだ設計パターンの観察（HELIX-BRAINの素材）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../bindings/SCF-B-0156.json)
基準：第1弾（P01〜P07）は`origin/main` `6b4b5fd31714e9fbcbef77189efaed93261b86e3`、第2弾（P08〜P15）は`origin/main` `2c839d66839a3428a1507cd94f412293e67c67dc`（いずれも2026-10-04）、第3弾（P16〜P23）は`origin/main` `49318f1f1de5810dfc61fdfe3a2565b86509009d`（2026-10-05）、第4弾のうちP24〜P26は`origin/main` `12bfc72eab068a672bfb5c9cc814c3c1e9eb6cd2`（2026-10-05）、P27〜P28は`origin/main` `c2e4c2eb6ea29f69d9f8fa5e329adbf37c56acc7`（2026-10-05）

## 何をしたか

[HELIX-BRAINの初期10領域の知識素材の棚卸し](../brain-domain-material-inventory-20261004/README.md)（SCF-B-0155）は、旧HELIXの資産に欠けている観点（gap）を各領域の§gapに記録した。本書は、そのgapについて、公開OSSのrepositoryを固定commitで実際に読み、使われている設計の構造を観察として記録したものである。第1弾（P01〜P07）で7つのgapを扱い、第2弾（P08〜P15）で残りのgapのうち8つを扱った。

POの発言（2026-10-04、原文）は次のとおり。
> 「素材あつめ次に進めてくれ。実際のOSSやギットハブリポジトリとかからも探し出せてリバースエンジニアリングで設計のパターンを調べまくるのはどうかね？机上の空論ばかりあつめても仕方ないしな。」

第2弾の起点となったPOの発言（2026-10-04、原文）は次のとおり。テーマは、SCF-B-0155の§gapと採択済みのHELIXBRAIN-L2-INFRA要求のうち、第1弾で扱っていないものから選んだ。
> 「素材あつめはどんどん進めてくれ要求見ればわかるだろ？」

第3弾の起点となったPOの発言（2026-10-05、原文）は次のとおり。テーマは、SCF-B-0155の§gapのうち、第1弾・第2弾で扱っていないものから選んだ。
> 「BRAIN素材集めを進めよう。基本的にHARNESSとBRAINができればあとはOSでどう作業するかでしょ？」

第4弾の起点となったPOの発言（2026-10-05、原文）は次のとおり。テーマは、SCF-B-0155の§gapと、第3弾の各材料が「見つからなかったこと」に残したもののうち、まだ扱っていないものから選んだ。第4弾は「PRの原子性」に合わせて、P24〜P26とP27〜P28の2つのPRに分ける。
> 「寝るからよろしく。BRAINは暇があったらガンガン強化していってくれ。」

- 観察は計351件（第1弾80件、第2弾90件、第3弾111件、第4弾70件）で、137のrepositoryにわたる。テーマごとの件数は下表のとおり。
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
| P08 background job・batch・並行制御 | [P08](materials/P08-background-jobs-concurrency.md) | 12 | 4 | D03「batch・background job」「並行制御」「時間に依存する処理」 |
| P09 frontendの状態管理とdata取得 | [P09](materials/P09-frontend-state-data-fetching.md) | 10 | 5 | D04「状態管理の選択肢」「data取得の境界」「frontendの性能」 |
| P10 API style・版・rate limit | [P10](materials/P10-api-style-versioning-rate-limit.md) | 12 | 6 | D05「API styleと版の方式の比較」「外部公開APIの運用」「rate limit」 |
| P11 schemaの版の進化とdataのlifecycle | [P11](materials/P11-schema-evolution-data-lifecycle.md) | 10 | 5 | D06「schemaの版の進化」「dataのlifecycle」 |
| P12 topology graph・provider抽象 | [P12](materials/P12-infra-topology-provider-abstraction.md) | 14 | 5 | D07「topology」（INFRA-012/013/014） |
| P13 failure構造・observability・deployment | [P13](materials/P13-failure-observability-deployment.md) | 10 | 5 | D07「failureの型」（INFRA-005/007/009） |
| P14 色の体系・motion・dashboard | [P14](materials/P14-color-motion-dashboard.md) | 11 | 6 | D09「色の体系」「motion」「dashboard」「visual hierarchy」 |
| P15 feedbackとundo・多言語・touch | [P15](materials/P15-feedback-i18n-touch.md) | 11 | 5 | D10「feedbackとundo」「多言語」「mobile・touch」 |
| P16 品質特性のtrade-offと判断の記録・view | [P16](materials/P16-quality-attributes-decision-records.md) | 14 | 6 | D01「品質特性のtrade-off」「viewpoint／view」 |
| P17 性能の構造と負荷の制御 | [P17](materials/P17-performance-structure-load-control.md) | 14 | 5 | D01「性能の構造」 |
| P18 moduleの分割・統合とbounded context間の関係 | [P18](materials/P18-module-boundaries-context-relations.md) | 13 | 6 | D02「moduleの分割・統合の判断」「bounded context間の関係」 |
| P19 保存方式の比較 | [P19](materials/P19-storage-model-choice.md) | 14 | 6 | D06「保存方式の比較」 |
| P20 privacy設計 | [P20](materials/P20-privacy-design.md) | 14 | 5 | D08「privacy設計」 |
| P21 鍵・秘密の管理 | [P21](materials/P21-key-secret-management.md) | 14 | 5 | D08「鍵・秘密の管理」 |
| P22 frontendの性能とresponsive | [P22](materials/P22-frontend-performance-responsive.md) | 14 | 6 | D04「responsive」「frontendの性能」 |
| P23 利用者調査の方法 | [P23](materials/P23-user-research-methods.md) | 14 | 6 | D10「利用者調査の方法」 |
| P24 network・compute・storageの構成知識 | [P24](materials/P24-network-compute-storage.md) | 14 | 5 | D07「network・compute・storageの構成知識」 |
| P25 browserの対応範囲と段階的な機能縮退 | [P25](materials/P25-browser-support-progressive-enhancement.md) | 14 | 5 | D04「browser対応」（P22で埋めきれなかった部分） |
| P26 B-tree・WAL・MVCCを採る保存設計 | [P26](materials/P26-btree-wal-mvcc-storage.md) | 14 | 4 | D06「保存方式の比較」のB-tree側（P19で読めなかった部分） |
| P27 data取得の型と索引（N+1） | [P27](materials/P27-data-loading-n-plus-one-indexing.md) | 14 | 6 | D01「性能の構造」のうち索引とN+1（P17で扱えなかった部分） |
| P28 cacheの無効化方式の比較 | [P28](materials/P28-cache-invalidation.md) | 14 | 5 | D01「性能の構造」のうちcacheの無効化（P17で比べられなかった部分） |

dotnet/eShopはP01とP03の両方で、adobe/react-spectrumはP07とP15の両方で読んだ（P15はpointer抽象とi18nで、P07とは別の箇所）。repositoryの延べ数は77、重複を除くと75である。第3弾では、prometheus/prometheus（P13ではobservability、P19ではTSDBの保存方式）とalphagov/govuk-design-system（P07ではform、P23では研究記録）を、前の弾と別の箇所で読んだ。第3弾の45 repositoryのうち新規は43で、3弾の重複を除いた合計は118である。第4弾のP24〜P26では、kubernetes/enhancementsをP16と別のKEP（容量追跡、先取りしない優先度、snapshot等）で読んだ。alphagov/govuk-frontendは、P07でerror summary・input・character countの本文を読んでおり（P23ではmetadataだけ取得）、P25ではbrowser対応とprogressive enhancementの文書という別の箇所を読んだ。P24〜P26の14 repositoryのうち新規は12で、重複を除いた合計は130である。P27〜P28では、TanStack/queryとapollographql/apollo-clientをP09と、vercel/next.jsをP22と別の箇所（無効化と再検証）で読んだ。P28のTanStack/queryはP09と別の固定commitである。P27〜P28の10 repositoryのうち新規は7で、重複を除いた合計は137である。

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
- **独立reviewでの訂正**：作成側の照合の後、独立review（PR #2568）で、分岐条件・呼出し順・参照先を観察が正しく写していない箇所が見つかった（P03-O01・O03・O06、P04-O01・O03・O05）。原文を読み直して訂正した。行の範囲が合っていても、条件の写し方が誤ることがある。
- **第2弾（P08〜P15）の照合**：第1弾と同じ手順で行った。
  - permalink 236件の実在と行範囲を機械で照合し、不一致は0件だった。第1弾と合わせた15本の全permalink 474件でも0件である。
  - 内容の抜き取り照合は各材料16〜26件、計176件。照合担当の指摘は、修正担当が固定commitの原文を読み直してから直した。
    - 主張の一部が原文と違っていたもの5件（P08-O06 metadataのmergeがrunning以外の行にも及ぶ点、P09-O03 `'always'`の前提条件、P11-O10 indexの実体とコメント上の意図、P13-O02 `_OTHER`の主語、P15-O11 scrollによる取消がtest専用の分岐にある点）を直した。
    - 行のずれ（SHIFTED）11件、出典fileが曖昧だったもの6件、観察IDの相互参照の誤り8件（P11 7件、P12 1件）を直した。
    - 照合担当の指摘のうち2件（P13-O09のTODOの行、P12-O04の行範囲）は原文の方が元の記述を支持したため、変えていない。
  - 独立review（PR #2569）で、条件付きの処理を一般化した記述と、初期設計の説明を保証として写した記述が見つかった。原文を読み直して訂正した（P14-O01 背景を宣言した役割色だけの実行時検査、P08-O11 Quartzの即時再実行、P15-O10 sonnerのissueとMDCの確認範囲の区別、P11-O04 atomicな表名切替と失敗時に元へ戻る保証の区別）。あわせて、P12-O07・O11に設計文書と実装の出典の区別を補った。
  - 第2弾は、permalinkの書き方を全文URLに揃えた（調査担当が接頭辞の略記で返したP08と、URLを省略したP10の5件を展開した）。
- **第3弾（P16〜P23）の照合**：第1弾・第2弾と同じ手順で行い、内容の照合は書いた調査担当とは別の照合担当が行った。
  - permalink 442件の実在と行範囲を機械で照合し、不一致は0件だった（修正で追加した出典と、独立review（PR #2573）を受けて範囲ごとに付け直した出典を含む）。
  - 内容の抜き取り照合は各材料26〜113件、計413件。分岐条件、呼出し順、既定の挙動、保証の範囲、状態遷移など、誤りやすい主張を優先して選んだ。
    - 原文にない・逆の記述（WRONG）は2件だった。P17-O02はissueの唯一のcommentをmaintainerの回答と書いていた。P23-O06は、対応表の破棄時期が原文に書かれているのに「書かれていない」としていた。どちらも原文どおりに直した。
    - 主張の一部が原文と違うもの（PARTIAL）は50件だった。条件付きの処理の一般化、推論を事実として書いたもの、呼出し順の誤りが多かった。書いた調査担当が固定commitの原文を読み直し、全件を直した。原文が元の記述を支持したために変えなかったものはなかった。
    - 行のずれ（SHIFTED）9件、観察IDの相互参照の誤り6件、比較表と本文の食い違い4件も直した。
  - SPDXとarchivedの記載は、45 repositoryすべてでGitHub APIの値と一致した。
  - 独立review（PR #2573、Codex）で、Major 4件・Minor 7件の指摘を受けた。条件付きの処理の一般化（P17-O14のgroupcache、P19-O11のblob）、引用元の範囲を越えた一般化（P20-O11）、暗号上の仕組みと組織上の前提の混同（P21-O02）、推論の区別（P19-O14）、見出しの表記、permalinkの付け方、bindingの照合件数の表記である。P19-O11は、作成側の照合を受けた修正で新しく入った誤りだった。原文を読み直して全件を直した。
- **第4弾のP24〜P26の照合**：第3弾と同じ手順で行い、内容の照合は書いた調査担当とは別の照合担当が行った。
  - permalink 182件の実在と行範囲を機械で照合し、不一致は0件だった（修正で追加した出典を含む）。
  - 独立review（PR #2574、Codex）で、Major 1件・Minor 2件の指摘を受けた。P24-O06はrestartable init containerの要求の累積と、要求を省略したときの上限からのdefaultを落として一般化していた。P24-O01はstatusの主張に直接のpermalinkがなかった。README・PR本文のrepository数は、govuk-frontendをP07で読んでいたことを見落として数えていた。原文を読み直して全件を直した。
  - 内容の抜き取り照合は計262件（P24 39件、P25 54件、P26 169件）。
    - 原文と逆の記述（WRONG）は1件だった。P26-O02で、nbtreeの削除時に待つtransactionのXIDの有無を逆に書いていた。原文どおりに直した。
    - 主張の一部が原文と違うもの（PARTIAL）は22件だった。仕様の「MAY」を必須として書いたもの、条件付きの処理の一般化、推論を事実として書いたもの、設定の読込み順を実装と違えて書いたものが多かった。書いた調査担当が原文を読み直し、全件直した。
    - 行のずれ（SHIFTED）2件、観察IDの相互参照の誤り1件も直した。
  - SPDXとarchivedの記載は、14 repositoryすべてでGitHub APIの値と一致した。
- **第4弾のP27〜P28の照合**：P24〜P26と同じ手順で、別の照合担当が行った。
  - permalink 94件の実在と行範囲を機械で照合し、不一致は0件だった（修正で追加した出典を含む）。
  - 内容の抜き取り照合は計233件（P27 114件、P28 119件）。
    - 原文と逆・原文にない記述（WRONG）は2件だった。P27-O04は、has_many以外の集合関連がstrictにならないと書いていたが、throughとHABTMも`:has_many`としてstrictになる。P28-O14は、P09と出典が重ならないと書いていたが、P09は同じfileの`CacheGroup`の範囲も引いていた。どちらも原文どおりに直した。
    - 主張の一部が原文と違うもの（PARTIAL）は10件だった。条件付きの処理の一般化（`references`のJOIN条件、prefetchの例外、`evict`の通知条件、`cancelRefetch`の条件）、handlerに求める契約を既定の実装の挙動として書いたもの、「要求ごと」を「権限ごと」と言い換えたものである。書いた調査担当が原文を読み直し、全件直した。
    - 行のずれ（SHIFTED）2件、比較表と本文の食い違い3件も直した。
  - SPDXとarchivedの記載は、10 repositoryすべてでGitHub APIの値と一致した。
- **値・機密の検査**：hexの色、px、ms、メールアドレスの形、作業領域のpathをgrepし、第1弾〜第4弾とも該当0件だった。原典にある値（timeout、期間、比等）は、観察の中で「持ち込まない」と書いたうえで転記していない。
- **license**：SPDXはGitHub APIの値をそのまま書いた。`NOASSERTION`のもの（final-form、eventuate-tram-core、eventuate-tram-sagas、Polaris、google.aip.dev）は、LICENSE fileの冒頭の文言を併記した。formatjsはrootのlicenseがnullで、package単位のSPDXを書いた。AGPL-3.0のgrafana/grafanaは、構造の観察だけにした。第3弾も同じ扱いで、`NOASSERTION`またはnullのもの（adr/madr、arc42/arc42-template、python/peps、pgbouncer/pgbouncer、cockroachdb/cockroach、PostHog/posthog、withastro/astro、18F/guides・methods・ux-guide、uswds/uswds-site、alphagov/govuk-design-system-backlog）はLICENSE fileの冒頭の文言を併記した。copyleftまたはshare-alikeのもの（facebook/rocksdb、matomo-org/matomo、arc42/arc42-template、ddd-crew/context-mapping）は、構造の観察だけにした。第4弾のP24〜P26では、`NOASSERTION`のもの（postgres/postgres、sqlite/sqlite、wiredtiger/wiredtiger）にLICENSE・COPYRIGHTの冒頭の文言を併記した。GPLのwiredtiger/wiredtigerは設計文書（`.dox`）の構造の観察だけにし、codeは読んでいない。P27〜P28では、`NOASSERTION`のもの（HypoPG/hypopg、varnishcache/varnish-cache）にLICENSEの冒頭の文言を併記した。varnish-cacheはarchivedである。

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
