# 要件定義の最初に扱う、最小内部循環のロードマップ

## 目的と現在の位置

HARNESSの工程定義、COREの意味導出、BRAINの汎用知識、OSの案件運転をつなぎ、HELIX自身の開発・更新・評価を一周できる最小構成を整理する。要件定義の最初に扱う横断的な整理の入口とする。

現在はL2／L11の要求整理と接続条件の照合を行う。[10/10巻き戻し判断](decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md)によるL3以下の停止を保持する。ロードマップの起票は正式L3の再開、要件承認、実装、CI起動、内部デプロイの実施を意味しない。各機構・StageのL3／L10は再開後に現行の著述・reviewの単位で導出する。

## 指示の出典

2026-10-10（Asia/Tokyo）のユーザー指示を起点とする。

> HARNESSの定義からCoreの形成、BRAINと照会してBRAINの知識領域定義、CoreとHARNESSの定義からOSの規格を定義して、内部デプロイで随時更新できる環境。これがまずの主題？その後、SecurityとIntelligence観点からの防御と支援を加えて、CIやWorker負荷を計測するインフラとラボデータから循環してBRAINとIntelligenceへつなぐって順序であってる？

> これをロードマップイシューとして立てて要件定義の最初にするでOK？

以下はこの指示を、既存Concept・要求・判断記録の責務と停止境界へ対応付けた作業順の整理である。個別要求の採否・意味・版や既存Stage配属を変更しない。

## 要件定義前の準備と、開始後に具体化するもの

2026-10-11のPO指示「イシュー消化すれば要件定義に入れる状態か確認しながら要点定義に入る準備すること。」に基づき、初回対象で使う前提を照合する。Issueの全件消化を開始条件にはしない。要求Stageの終了、文書・作業環境の準備、L3の再開、製品実装環境の成立を別に扱う。

| 作業 | 要件定義前に整理する範囲 | 設計・実装へ進んだ後の範囲 | 対応する作業 |
|---|---|---|---|
| 文書と配置 | 既存規則の所在、意味正本・生成表示・判断記録・証拠の区別、ID・対検証・revision・参照・更新方法、複製や参照切れの照合 | コードとtestの物理配置、宣言・台帳・記録の形式。既決の基本案を対象設計で具体化する | #2903 |
| 作業環境 | 文書編集・静的確認・GitHub・独立reviewの経路と再現手順、利用可能な環境と未構築部分の棚卸し | 対象設計から言語版・依存・lock・型検査・lint・formatter・test経路を確定し、クリーンな領域で再現確認する | #2905 |
| 初回の対象と接続 | 一つの要求例の親revision・scope・使用知識・適用義務・対検証・不足と戻し先。安全・接続・資源・計測の実依存 | L3／L10、設計と対検証、schema・Python接続・実装・内部更新を対象authorityに従って導出する | #2846 |

開発repoの規則は[GitHub上流運用モデル](github-upstream-operating-model.md)、現在の境界は[AGENTS.md](../../AGENTS.md)と[作業入口](new-generation-start-here.md)を参照する。製品としてHARNESSが提供する規律は対象L2／L11と採用判断から読む。repoの運用を製品要求の根拠へ転用せず、ここにも規則本文を複製しない。

文書配置は[構成の基本案](decisions/repository-layout-and-source-visibility-po-decision-2026-10-09.md)と[内部デプロイ方針6](decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md)を起点にする。`docs/`の既存配置を保ち、機構・層・責務と参照を整理する。`declarations/`・`helix/`・`records/`は基本案であり、具体形式はL4の論点として残る。カットしたL4やコードを復元して配置済みとせず、フォルダpathをidentity・登録・承認の正本にしない。

### 環境準備の入力・成果・未確定事項

#2905の[環境条件と確認方法](development-workspace-setup.md#製品環境の条件を整理する調査)を次の段階へ結ぶ。各行は作業整理であり、新しいgateや下流の解禁ではない。

| 段階 | 入力 | 整理する成果 | 未確定部分・失敗の戻し先 |
|---|---|---|---|
| 文書規則の整備（現在） | 旧source、現行Concept・原則・対象L2／L11・判断記録、#2903 | 規則の所在・重複整理、revision／対検証／責務、文書作業の再現記録 | 規則・参照不備は正本owner、全資産移管は#1813等へ。文書環境の成功から製品環境成立にしない |
| 最小対象の要件化（再開範囲の特定後） | #2846の対象scope、必要template・安全・接続・資源・計測と不足、対象authority | 対象要件と対受入、環境が満たすOS・互換・依存・観測・復旧条件 | 選択scope内のtemplate／接続／権限／資源不明は#2846と該当ownerへ。L3以下はPOの再開指示まで起草しない |
| 設計に基づく設定確定（後続） | 承認対象要件と対検証、配置の基本案、環境調査 | 言語版・依存manifest／lock・変数名・コードとtest配置・tool経路・setup／更新／復旧手順とoracle | 版や依存の矛盾は環境／接続設計へ、意味不足は上流へ。形式を現行hostや旧toolで代用しない |
| 開発・検証環境の構築（後続） | freeze済み対象設計・oracle、実装可能scope・必要authority、固定した構成 | クリーン領域からのsetup・局所検証、実装前Red／Green・独立reviewとrevision／環境／結果の結合 | lock／版不一致は環境構成、setup失敗は資源・依存・設定、検証失敗は実装／設計／oracleの原因へ。失敗をpass・N/Aにせず現用構成を保持。内部デプロイは別事象と許可 |

前の行の全資産完了を次の行の一律条件にせず、対象が実際に参照する入力の成立を確かめる。初回対象は下記のPO判断で選択済みだが、具体版・tool・設定・実行oracleは未定である。現時点の環境条件整理は、それらの選定と後続の再現確認に渡す材料である。

## 再開前提の現在地と残る確認

[10/10巻き戻し判断](decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md)の再開前提を、既決内容と実適用の証拠に分けて照合する。以下は照合の入口であり、新しい規則・schema・全件完了gateではない。要求採用や件数・hashの一致を、機構の成立や実行済み受入の証拠へ置き換えない。

| 前提 | 現在使える根拠 | 初回対象で確かめること |
|---|---|---|
| Concept・七大原則 | [Concept](../concept/helix-concept.md)、[七大原則](../concept/helix-principles.md)、[七大原則はPO指令という判断](decisions/principles-are-po-directive-po-decision-2026-10-10.md) | 責務語彙・依存・対検証・上流還流が選択した要求と工程へ結び付くこと。原則を再承認待ちにしない |
| JSON意味正本 | [JSONAUTHの採用判断](decisions/json-canonical-requirement-resolution-po-decision-2026-10-10.md)、OS053と対L11 | 意味JSONと生成view・説明の境界、要求revisionと表示の対応。生成Markdown／HTMLだけの変更を意味更新としない |
| template知識と適用 | [BRAIN032](decisions/brain-template-contract-032-po-decision-2026-10-10.md)、[CORE009](decisions/core-template-009-supplement-po-decision-2026-10-10.md)、[OS002](decisions/os-template-trace-002-supplement-po-decision-2026-10-10.md)の採用判断 | 使用するtemplate exact set・版・scope、適用義務、N/A根拠、不足質問・戻し先、案件の記録との結合。契約採用だけで往復接続を成立としない |
| 最初に使うseed | [限定SEEDFIRSTの採用判断](decisions/seedfirst-knowledge-po-decision-2026-10-10.md)、[BRAIN意味JSON](../helix-brain/knowledge/requirements-acceptance-template-knowledge.json) | 非画面・技術的不確実性なしの要求／受入に限るVT001・VT102とC01/C02/C08/C26の採用範囲。全template集合・他pair・schema・rendererの完成へ広げない |
| 開発規律と版 | [43件の1.0判断](decisions/discipline-requirements-into-1.0-po-decision-2026-10-10.md)、[052・102の接続版判断](decisions/version-join-requirement-resolution-po-decision-2026-10-10.md)、[REDFIRST A](decisions/redfirst-adoption-po-decision-2026-10-11.md)、対象L2／L11 | 009・048等の対象規律を版未指定と読み違えず初回scopeに対応付ける。test/oracle凍結→実装前Red→最小実装→Greenを保持する。文書reviewへRed実行義務を追加しない |

上の限定知識と採用判断はmainにあるが、#2846で保持するtemplateの全体最小集合、適用・案件記録の往復、必要安全・資源・測定、失敗・未完義務の戻し先は未完である。#2903と#2905だけを閉じても、これらの成立は証明できない。[要求Stageの終了結果](requirements-stage-closure.md)もL3再開の証拠とは別である。

初回対象が参照する未確定部分を明示し、それに依存する作業を止める。#1813〜#1815の全source移管、#1888〜#1908の全能力監査、#1837のBot／CI実装等を一律のL3開始条件にはしないが、選択した対象がそれらの未確定契約を実際に使う場合は個別に照合する。Issueのcloseを前提成立の代わりに使わない。

現在許可される準備は、既存sourceの照合、文書規則の集約、初回要求と接続条件の整理、作業環境の調査である。「前提を機構として成立させる」の実施範囲とL3再開の順序・scopeは、巻き戻し判断に従うPO指示で特定する。準備指示をL3以下の起草・実装・CI解禁へ読み替えず、前提を成立させる手順のうち現行停止境界を越える部分を再開提案時に明示する。

[準備状況の限定観測](audits/requirements-entry-preparation-observation-2026-10-11.json)に、対象mainの入力hash、入口5文書の相対参照先、利用可能なCLI版、正式設定の所在、open Issue集合とtemplate照合Issueの終了記録を固定した。Git・gh・Python・Node・npmの版表示とeditor基本設定は確認できたが、製品用の依存lock・セットアップ再現・型検査／lint／testの成立は未確認である。既存のインストール版を採用版とせず、静的照合を製品実行の合格へ変換しない。

### 旧sourceとの対応

旧`archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md:102–173`（LEGACY-ASSET-FDBA655B1CFF75DCDC0E）の責務に沿う配置・正本／生成物の区別・設定最小化、同rootの`docs/governance/coding-rules.md:10–31`（LEGACY-ASSET-4B835ADBEFBCCC13C1C0）の実装前の規律確認、`docs/design/helix/L4-basic-design/design-template-json-authority.md:19–46`のJSON意味と生成表示の区別を起点とする。旧の固定path・ツール・runtimeを継承せず、現行の配置判断とBRAIN／CORE／OSの採用契約へ対応させる。

前身の弱点記録`docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:65–101`（archive root内）のUTW-004・021・025は、文書と実体の乖離、自己申告への回帰、正本の認識負荷を示す。これと10/10の失敗分析を照合し、文書の所在を整えることと機構の成立を分ける。差は今回の準備指示に従って既存前提の照合先を集約することであり、新たな承認や全資産完了条件を追加することではない。

## 作業の順序と照合する結果

| 順 | 主題 | 整理するもの | 照合する結果 |
|---|---|---|---|
| 1 | HARNESS・CORE・BRAINの照合 | HARNESSの工程契約、COREの対象要求と意味導出、BRAINの既存Domain／Pattern／Unit／Partと必要な知識。Pythonの意味処理とJSON正本の境界 | 一つの要求例から、選択知識の根拠・設計義務・必要input・不足質問・対検証を辿れる。製品固有の都合でBRAINの汎用領域を再定義しない |
| 2 | CORE／HARNESSとOSの接続 | COREの設計・依存・影響とHARNESS工程部品を、OS自身の要求、案件状態、許可、資源、優先度、予算、期限へ結ぶ | OSの作業具体化・割当・検収・Backflowが元のrevision／scope・義務へ戻る。OSが工程の意味を再定義しない |
| 3 | 最小の内部更新・復旧構成 | 選択した経路に必要なSECURITY、CONNECT、INFRASTRUCTURE、Worker、検証・結果記録。段階構成の版・検証・復旧先 | 承認・freeze後の後続段階で、要求確認→作業→検証→結果記録を一周し、検証した構成を別の内部デプロイ事象として追跡できる。今はその入力と受入条件を照合する |
| 4 | INTELLIGENCEの支援と防御の拡張 | 現状・知識・CORE契約を使う計画／配置／診断／review候補。反復ログと判定可能性が揃った対象の専門Bot・Security Bot | 候補、OSの割当、Workerの実作業、HARNESSの検証を区別する。Bot発行から権限を増やさない |
| 5 | 計測・LABO評価・知識と判断の改善 | CI／Workerの負荷、失敗、再作業、使用版とscopeの記録。LABOの比較評価とBRAIN／INTELLIGENCEへの受渡し | BRAINへは裏付けられた汎用構造候補、INTELLIGENCEへは判断・配置の評価材料を返す。評価・受領だけで採用や改善成功を生成しない |

これは検討の順序であり、前段全件完了を後段全作業のgateにしない。選択した経路の実依存を照合する。[既存の対応順序](audits/requirements-stage/implementation-order-2026-09-27.md)と[追補](audits/requirements-stage/implementation-order-addendum-2026-10-03.md)は当時の候補配属を保持し、現行要求・版・再開scopeとの比較材料にする。既存Stage番号をこの表の番号で置き換えない。

最小の認可・隔離・通信制約と利用可能な実行資源は順3から必要であり、防御を順4まで後回しにしない。使用版・結果・失敗・負荷の計測項目は最初の実行経路から整理し、順5で比較・改善循環を広げる。1.0はHARNESS定義済み工程部品の組合せと差戻し、部品外のフロー生成は4.0、ローカルLLM学習は3.0という既決の区分を保持する。

## 最初の整理で出すもの

- 一つの要求例について、BRAIN知識→COREのPython意味導出→OSの作業具体化→Worker→検収→COREへのBackflowを、正常・負例・unknownで通す対応表。
- 必要な単体・接続・構成体と、各端のidentity／revision／scope、input／output、未完義務、停止・戻し先、対oracleの照合先。
- 既存要求で保持できる条件と、追加・意味変更・版判断などが必要な不足の区別。既決の意味を繰り返し承認待ちにしない。
- 最小構成で扱えること、扱えないこと、実依存と未選択の機構・機能。全BRAIN知識や全Botの完成を初回の前提にしない。

schema・通信方式・実装配置・具体値は、この整理から確定済み扱いにせず、再開後の対象要件・設計と対検証で導出する。実装前test／oracleの定義・凍結、DDDの責務・命名、JSON正本と生成view、独立reviewを対象成果へ適用する。

## 初回対象候補：templateの意味契約から案件の義務追跡まで

初回対象として、HELIX自身の非画面の開発に用いる「汎用templateの意味契約提供→製品への適用候補→案件の義務追跡」とする。主となる単体はBRAIN032、HARNESS009、OS002であり、各単体と接続・構成体を分けて扱う。JSONを読めることだけをBRAINの成立にせず、15項目の意味・不足を提供する032の全保証を対象とする。COREの適用判定とOSの記録運転も、別々の責務として残す。

2026-10-11、POは[固定案への回答](decisions/first-development-target-selection-po-decision-2026-10-11.md)で、この循環を**初回対象として選択した**。節名の「候補」は固定案への既存リンクを保つために残す。これは#2846と#2905の準備対象の選択であり、L3の再開順序・範囲は引き続き未決で、10/10判断に従ってPOへ提示する。既存の「申請は承認後に編集できない」は比較例として保ち、この対象案を実在案件の承認済み要求・使用template集合・実行記録にしない。ここで初回対象を小さく区切ることは、1.0全体や本ロードマップの内部更新・復旧・支援・評価還流の義務を減らさない。

### 主対象と、その接続で照合する内容

以下の略号は各機構のL2 identityを指す。対受入は各L11の同じidentityへ戻す。032・009・002の追補は上記採用判断の固定本文を使い、候補metadataや版未指定を読み替えない。番号の列挙は有効依存閉包の確定ではなく、対象案が照合する契約の入口である。

| 対象・操作 | 対象案で扱う入出力と責務 | 正常・負例・unknown／不足の戻し先 |
|---|---|---|
| BRAIN032単体 | knowledge identity/revision/sourceと汎用条件から、15項目のdescriptorと定義欠落・値未決・矛盾を提供する。知識版/stateと汎用の意味はBRAIN | 同じrevisionの項目を意味と根拠で比較する。項目欠落、製品値の混入、viewだけの意味更新は成立にしない。定義不足はBRAIN、製品要求値未決はCOREへ |
| BRAIN030→HARNESS009 | 選択知識の全required fields、版・互換・query/scopeとreceiptを保持し、COREが対象要求のkind/domain/risk/layer/pairに応じた適用候補set・義務・不足質問・意味影響を導く | required/conditional/N/A/unresolved、N/Aの4属性、単体/接続/構成体の義務を区別する。候補母集合未定、版不一致、別scope、unknown条件は保留。knowledge不足はBRAIN、適用契約はHARNESS、製品要求値は要求形成へ |
| CORE出力→OS002 | 提案・選択・使用setを分け、要求revision/scope、template版、義務・成果・pair・event・因果参照へ結ぶ。適用意味はCORE、実際の案件記録はOS | 元記録から選択と利用を再構築する。受領を使用済み、ACKを解決、別義務の成功を消込へ変換しない。未完義務受理はOS023、記録不備はOS、意味不足はCOREへ |
| OSのticket→Worker→検収→Backflow | OS017/018/019/020/023の作業具体化・割当・原記録・検収・未完義務handoffと、HARNESS015/022の凍結oracle・結果を同じrevision/scopeへ結ぶ | 実装前Red→最小実装→Greenと独立reviewを別証拠で追う。別HEAD結果、期限切れ、部分実行、未回収は未完。oracleはHARNESS、割当/記録はOS、認可はSECURITYへ |

BRAIN→CORE、CORE→OS、検収→Backflowの各辺は別のconnectionである。個別の提供・受領を一周の成功へ昇格させず、各端の契約版・互換・scope・義務と、構成体固有のjoin/停止条件を照合する。CORE→OSの既存条件には追跡用の詳細ID `HXT-CORE-02` がある。今回のtemplate適用・案件記録との対応と、実接続に残る契約版・scope・登録・受渡し形式は[接続照合](#coreosの既存接続とtemplate記録への対応)に分けて残す。Pythonは009の意味処理の候補経路で、DB/Git/GitHub write、割当、lease、認可、実行は各操作ownerに残す。Python候補の未採択条件は#1799/#1801で別に照合する。

### CORE→OSの既存接続とtemplate記録への対応

**`HXT-CORE-02`** は、9/28固定本文に含まれるCORE→OSの既存条件を追跡する詳細IDである。[HARNESS L2](../helix-harness/L2-requirements/product-requirements.md)の詳細ID表と[対L11](../helix-harness/L11-acceptance/product-acceptance.md)は、コア提供からOSのticket発行・検収へ版と義務を辿り、提供・判断・発行・検収の責務を区別する。[9/28の合意](decisions/helix-harness-requirements-po-decision-2026-09-28.md)が固定した本文にこの表が含まれる。HXT表を含む節は現行も「未採否の整理案」と記述しており、この詳細IDを個別に採択した新要求とは扱わない。対象条件の採否根拠は親主要求002／008の合意であり、詳細IDと主要求を区別する。009を新しい親へ付け替えたり、初回対象専用の接続IDを新設したりしない。

以下は[CORE009追補](decisions/core-template-009-supplement-po-decision-2026-10-10.md)と[OS002追補](decisions/os-template-trace-002-supplement-po-decision-2026-10-10.md)の意味を、この既存接続の照合材料へ対応付ける。HXT-CORE-02の一般的な工程接続だけで、template固有の全保証や各辺の成立を代用しない。[固定source照合記録](audits/core-os-template-connection-trace-2026-10-11.json)に本文revision・digest、旧source、保持点と限界を残す。[採否の表現の訂正記録](audits/core-os-template-connection-trace-2026-10-11-r2.json)は詳細IDと親要求の区別を補う。

| COREから引き継ぐ意味材料 | OSが記録・運転するもの | 対L11へ戻す負例と責務境界 |
|---|---|---|
| 要求identity/revision・製品scope、工程/適用契約版、knowledge identity/version/意味契約revision/source、検討対象exact setと選択根拠 | CORE提案set、案件の選択set、実使用setと発生元を分け、OS002の原記録から再構築する。ticket発行はOS017、割当は018、検収は020 | 候補受領を使用済みとする、別project/revision/template版の混入を拒否する。HXT-CORE-02のreceiptだけで選択・使用・検収を完了にしない |
| required/conditional/N/A/unresolved、理由・判定者・対象revision・再評価条件、unit/connection/compositeの義務とdesign/pair trace | 009の判定出力を参照して002が条件未充足と義務の未実施/不合格/未評価を記録する | OSが適用規則やN/A判断を新設しない。判定不能をN/A、単体成功を接続/構成体成功へ変えない。意味はCORE、原記録はOS |
| 不足のsource/field/obligation・revision/scope、未完義務と返却先 | 002がBackflowの受領・受理・解決を別々に記録し、023が受信側の未完義務受理と元ticket完了条件を保つ | ACKを解決証拠にしない。定義不足はBRAIN、製品要求値は008、適用契約はHARNESS、記録/handoff不備はOSへ戻す。逆向きBackflowの接続をこの一IDで成立扱いにしない |
| 旧新templateの意味差、影響する要求/義務/artifact/pairのrevision/scope、影響あり/なし/Unknownと理由 | 002が案件の使用版・旧版利用・stale・再評価待ちを記録し、意味影響の計算はCOREへ残す | filename/digest/view更新だけで移管完了、UnknownをUnaffected、無関係scopeの一律失効にしない。COREがOSのstateを直接更新しない |

[CONNECT L2](../helix-connect/L2-requirements/connect-requirements.md)の接続源対応表も `HXT-CORE-02` を001/002/003/005/006へ結ぶ。対応表は実登録・endpoint・通信成功の証拠ではない。004の再送条件をこのsource identityから一律追加せず、OS023等、実際に使う別sourceの条件は別に照合する。CONNECTは登録・版照合・伝送・追跡・変更後の再照合を持ち、template適用意味、ticket発行、検収、義務消込を代行しない。

初回対象では、各操作が使うsource/consumer、要求・knowledge・工程/適用・接続契約のrevisionと互換、project/scope、必要なauthority/data-use、入力/結果と未受領時の戻し先を実入力へ束縛する必要がある。実接続の登録、受渡し形式/schema、endpoint/物理経路、receiptと対oracleの適用結果は未供給で、具体設計・実装は再開後の対象層へ残す。OS002→LABOの評価入力、検収→COREのBackflow、構成体のjoin/停止も別に照合する。要求上のidentityの発見から全依存閉包、製品接続、#2846/#2905の完了、L3再開を生成しない。

旧modes README:64〜80のidentityと版に結んだ導出・projection、unknownの分離・stale、旧L4 template JSON:24/36〜42/47〜60の選択template/義務とBackflowを保持し、現行のCORE009とOS002のownerへ意味を再導出する。変更は準備文書の「identity未確定」を既存定義と実接続の不足へ訂正する点であり、要求意味の変更ではない。旧workflow・registry/schema/runtimeや旧層番号を移植せず、自己申告を完了証拠にする旧失敗も持ち込まない。

### 初回から必要になる周辺契約と、後続の拡張

| 操作が選ばれた場合に照合するもの | 対象案での範囲と契約入口 | 未成立の扱い／後続へ残す範囲 |
|---|---|---|
| 読取・意味処理・案件記録・Worker実行 | SECURITY003〜008のproject/環境/設定/credential/egress/実行制約/操作authority。INFRA001/003/025の資源identity・容量・Worker対応、SECURITY024とINFRA010の実適用 | 読取とwrite/execute/install/update/deployを別操作として照合。read-onlyにも空write-setと対象scopeの前後確認を使う。制約未適用・authority unknownは該当操作を止め、hostへ迂回しない |
| 知識・候補・記録・結果の受渡し | CONNECT001〜005の端点/契約登録、互換、通信、再送、traceと各端の業務契約。片側交換は006、複数辺の一周は007 | scope/版/期限/相関/冪等/結果を各辺へ結ぶ。ACKなし、再送の部分成功、互換staleは未完。通信方式・endpoint・schemaは設計後に導出。CONNECT009は[9/29の条件付き採択A](decisions/po-decision-2026-09-29-57candidates.md)に従い、方向/順序属性・型付きfeedback辺と訂正L11の操作別unknown条件を照合する。初回送信、feedback送信、追加retry、並列join、ACK/完了を分け、後段条件の欠落だけで独立して適格な初回辺を止めない |
| 初回Workerの配置 | OS018が要求するLABO055のtask/model class水準、LABO054の受渡し、INTELLIGENCE010の配置案とOSへの受渡し。水準生成・配置案・OS割当を分ける | **初回からこの入力が必要**。未評価を評価済みにせず、根拠/適用scope不足はLABO/INTELLIGENCEへ戻す。初回実績の調達・評価入力と未評価時の許容範囲は未確定。Botや自動最適化を完成条件にしないが、この依存は後回しにしない |
| 最初の実行・計測 | OS002/019の要求/template/義務/attempt/結果原記録、INFRAの資源観測、LABO001/002と選択source接続。時間・費用・負荷・失敗・再作業・未観測を対象構成へ結ぶ | 元記録集合、除外理由、版/環境、取得不能と未実行を保持。測定方法・分母・比較はLABO、原記録はsource。固定閾値、欠測=0、記録存在=改善成功を追加しない |
| 内部更新・復旧 | 選択構成の旧新版、SECURITY010〜013/023の更新受入とartifact integrity、INFRA005〜010の復旧/再構築/OS状態接続、OS014の段階構成 | 内部デプロイ方針に従い、候補構成の検証と内部利用開始を別事象にする。適格な戻し先・互換・復旧検証未定なら更新は未成立。OS停止時の復旧はINFRA006の独立経路と別authorityを使い、停止中OSへの依頼で循環させない |
| 支援・評価からの還流拡張 | 初回配置に必要な上記入力を土台に、INTELLIGENCEの診断/review/Bot候補、OS024の評価受渡し、LABO050/052とBRAIN/INTELLIGENCEへの個別接続へ広げる | 評価scopeと利用許可、原記録・比較条件・未観測を先に照合。BRAINへは汎用知識候補、INTELLIGENCEへは判断評価材料を返し、受領・候補数だけで採用/改善成功にしない。全Bot・学習・cloud拡張は初回の一律条件にしない |

この表の各入口にはさらに依存がある。選択したoperation/sourceごとにHARNESS023の4区分へ当て、常時必須・操作時必須・選択source必須を閉じる。ここでは一段の照合先を示しただけで、全周辺要求の再帰的閉包・採用revision・実装成立は未検証である。未選択は未観測として保持し、必須の安全条件をoptionalにしない。

### 初回対象の操作別に必要条件を照合する

[HARNESS023と対L11](../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-023-利用条件別の依存宣言の受入)の4区分を、選択対象の各操作へ当てる。以下は既決要求にある条件の照合材料であり、正式packの依存宣言、実案件のsource選択、契約版range、実行許可を作るものではない。各行で「操作時必須」とする条件は、その操作を含む利用では省かない。実operation/sourceの選択が未供給のため、表の各入口から先の有効依存閉包は未確定である。[固定本文と版境界の照合記録](audits/first-cycle-operation-dependencies-2026-10-12.json)へ戻る。

| 初回対象で扱う操作 | 条件に応じて閉じる要求・owner | 省略できない負例／未供給の入力 |
|---|---|---|
| BRAIN032の知識提供とCORE009の意味導出 | 常時必要な要求/製品scope・工程/適用契約identity/revisionは009へ。知識sourceを選ぶ利用では032/030の全required fields・版・利用状態が選択source必須。読込のsource/classificationはSECURITY001/015/016、命令様dataは002、実読込actor/対象/scope/authorityは008へ照合する | JSON候補の存在を採択済み知識にせず、unknown fieldや未提示知識へのfallbackを拒否。実readの安全依存を参照資料へ落とさない。Python意味処理に操作権限や外部writeを与えず、呼出し側の実操作として照合する |
| CORE候補の受渡しとOS002の原記録 | その受渡し操作では各端の版・scope・input/result・未受領をCONNECT001/002/003/005/006と各ownerへ。OSの記録操作は001/002/007/019/023、SECURITY003/004/008のproject/環境・構成・操作境界、実保存資源はINFRA001へ。資産identity/classification・data-useは常時照合する | 候補receipt、案件での選択、実使用、未完義務消込を別状態にする。原記録の実source/owner/版/保存先は未指定。全台帳や全connectorの完成をこの一本へ持ち込まず、使う接続の不成立も隠さない |
| OS018の割当とWorker実行 | 実行操作ではOS017/018/019/023と既存配置入力、SECURITY003〜008の隔離・構成・credential/通信境界・認可・007の実制約適用、INFRA001/003の資源identity/容量と通常Work/Change接続009を照合する。INFRA010の通常操作はOS ticket/assignmentと有効authorityが必要 | 通信やcredentialを使わない場合も、その遮断/制約の適用を保持する。容量unknown、未適用隔離、期限切れ、host fallbackでは実行可能にしない。後段Worker結果を開始前に要求せず、実actor/assignment/資源/予算/停止条件は未供給 |
| 結果・資源観測をLABOへ渡す | Worker結果sourceを選ぶときはOS002/019/023→LABO057/028。資源sourceを選ぶときはINFRA001/004の原観測→LABO026、各source contract/connector版・scope・data-useが選択source必須。LABO001/002が集積/相関し、評価方法・分母・比較はLABOに残す | Worker sourceだけの利用へ別source全件を要求せず、選択資源sourceの必要入力も省かない。資源・費用・時間・負荷・失敗・未観測は原定義と版を保持し、未観測=0、ID一致=因果、受領=評価成功にしない。source選択・実観測契約と評価scopeは未供給 |
| 構成更新・復旧（その操作を選ぶ場合） | INFRA010は対象state-changing operationに適用される005のbefore/after・backup/restore/rollbackを照合。更新/変更の適用時だけ同target/revision/scopeのSECURITY update-admissionを追加する。OS停止中の独立復旧は006の資源/path・別authorityとWorker契約を使い、復旧後にOSへ同期する | read-onlyにも対象/action/scope/authorityとwrite禁止の適用証拠が必要だが、update-admission欠如だけで拒否しない。通常ticket免除へ広げず、停止中OSの応答待ちで独立復旧を循環させない。実更新・内部デプロイ・releaseは停止中で別の許可範囲 |

**資源観測の版境界**：LABO026は1.0の許可resource/runtime evidenceを受けるsource接続であり、INFRA014の詳細なOS・LABO episode相関は「1.0より後（版は未定）」である。INFRA009も最小のOS resource-state接続へ後続episode相関を必須化しない。初回計測で014の完成を一律前提にせず、026を選ぶ場合の実INFRA source contract/connector・版・scope・利用許可は別に充足する。この対応だけで新しい通信経路、014の代替機構、接続済みの証拠を生成しない。1.0でもConceptとLABO001/002が求める原記録・相関参照は保持し、詳細相関の後続版を理由に消さない。

SECURITY007のWorker隔離・資源制約は初回実行に適用する一方、INFRA012の高度なcontrol/execution resource隔離、013のfailure-domain評価、019の詳細freshness/confidence、autoscaling・multi-cloud等の後続版を初回へ前倒ししない。義務・安全・oracleとして効く旧sourceは「参照のみ」にせず、旧runtime・過去例を実依存と混同しない。旧functional-release-slice:23〜67の必要安全閉包と局所/全体の区別、旧CLAUDE:49〜63の意味/外部作用分離を、現行023と各ownerへ意味再導出する。変更は初回操作ごとの照合範囲を具体化する点で、新しい要求・版・許可・一律gateは追加しない。

### 初回5操作の入力元案と、入口から先の依存条件

[入力元案と依存照合](audits/first-cycle-source-prerequisites-2026-10-12.json)では、上の5操作について次のsourceを案として特定する。実sourceの登録・利用、知識の採用、正式packの依存宣言ではない。意味契約を読むこと、単体の成立、実操作の条件を分ける。

| 操作 | 入力元の案・owner | 未決と適用の境界 |
|---|---|---|
| 知識提供・意味導出 | 採用範囲に合致したSEEDFIRST意味JSONと、MSG004/001/005の意味candidate → BRAIN/CORE | MSGCONTENTは[固定案どおりの限定採用](decisions/msgcontent-knowledge-po-decision-2026-10-12.md)とし、同じ意味JSONの採否範囲へ戻す。運用knowledge promotionは実施していない。VT103とSDOP5件19節/補足記録条件は[P3FIRSTの限定採用](decisions/p3first-knowledge-po-decision-2026-10-12.md)へ結ぶ。非選択内容・最小集合・案件適用条件は残る。実readにはSECURITY境界を適用する |
| CORE→OSの受渡し・原記録 | CORE009の提案/選択/使用set、義務・N/A・不足・影響 → OS002の案件記録 | 将来出力のownerを定める案。実set・保存先・端契約版・receiptを捏造しない |
| 割当・Worker実行 | OS ticket/assignment、LABO水準/INT配置案、INFRA対象資源/容量/Work-Change観測、SECURITY制約 → Worker環境 | 実task・資源source・分類・authority・制約適用は未供給。未評価初回027は既決6条件を満たす場合だけ |
| 結果・資源観測の受渡し | OSが受領したWorker結果/receipt → LABO057/028/056。INFRA001/004の原観測 → LABO026 | 両者は別source。未選択は未観測。057の既決人手receiptを026の代行許可へ転用しない。結果は実行後出力で、受領は評価成功ではない |
| 更新・復旧 | INFRAの対象資源before/after、backup/restore/rollback、独立resource/pathとSECURITY authority | 後続主題への条件案。通常操作とOS停止中の独立復旧を分け、実行選択・許可・実証はしない |

次の依存条件を既決L2と対L11へ照合した。実通信やcredentialを使わない案でも、遮断と制約適用の義務を省かない。

| 入口 | さらに照合する依存と条件 | 不足時の戻し先 |
|---|---|---|
| SECURITY007 | 003/005/006/008、OS assignment、INFRA実資源、Worker契約。003のproject/環境/宣言接続、004の構成source版、005/006/008の相互境界、006→016→015の1.0分類を同じ操作tupleへ結ぶ | identity/構成/分類/authorityはSECURITYと各source owner、物理適用はINFRA/Worker。unknown/unsupportedは停止。相互参照を免除や無限の起動順へ変えない |
| INFRA010 | 全実操作で001・有効SECURITY authority・Worker契約。通常経路ではOS ticket/assignmentと009。state-changingではactionに適用される005。更新/変更時だけupdate-admission。独立復旧は006と別authority | target/action/scope・制約・前後観測不足は該当owner。read-onlyもwrite禁止と対象scopeの前後観測が必要。停止中OSの通常応答を独立復旧の開始条件にしない |
| INFRA009 | 明示依存001/002/004/006とOS Work/Change interface/evidence。002のapproved design/target/actual分離、004のsource観測、006→005→001/002の復旧契約を保持 | CORE設計参照・資源/観測・復旧owner。通常操作で復旧しないという理由だけで006への依存を削除しない。意味参照・単体成立・実復旧を分け、stage pack利用時だけOS014条件を加える |
| LABO026、057/028/056 | 選択資源sourceはINFRA契約と専用connector、Worker sourceはOS結果/receipt・assignment/result契約・001/028/056、056→055とdata-use。057は同義務の明示人手receiptも可能 | 資源sourceはINFRA/接続owner、assignment/結果はOS/Worker、分類/利用許可はSECURITY。欠落・stale・unknownは未受領/未評価を保持 |
| LABO001/002/011と058追補 | 個別集積呼出しは058に従い選択sourceの接続と安全/版条件、001のprovenance/状態/field契約を満たす。相関操作は002→001/011、011→001/Aggregate identity | source不足は元owner、相関不能は孤立/unknown。個別呼出しに未選択sourceの稼働を要求しない一方、001の1.0全source対応義務021〜030は未成立として保持し、任意へ変更しない。031/032だけが採択source契約を条件とする任意接続 |

001の対応能力全体と、058が補う個別呼出しの成立を区別する。[指摘訂正記録](audits/first-cycle-source-prerequisites-2026-10-12-r2.json)は元記録を保持したまま、LABO001/002/011行の適用範囲と058の採択本文・対L11を補う。選択sourceだけで001の全source対応完成を主張せず、未選択021〜030の能力義務を削除・延期しない。逆に、その全対応の未完を、必要条件を満たす個別呼出しの一律停止理由へ変えない。

これは選択案の入口から先の照合を進めたもので、全周辺要求の再帰的有効閉包は未確定である。INFRA012/014/019、SECURITY019/016の1.x sink enforcement、完全自動failoverを初回へ前倒ししない。実contract版・値・資産分類・制約適用・評価oracle・setup/復旧実証は後続要件・設計・実行に残す。#2846には必要知識の採否・最小集合と再開順序/scope案を保持し、L3以下の停止を継続する。

旧functional-release-slice-requests:23〜67の明示集合・局所/全体・必要安全閉包、旧CLAUDE:49〜63の意味/外部作用分離、旧弱点UTW-021を起点に、現行ownerと利用条件へ意味再導出した。変更は入力元案と依存条件を具体化する点に限り、要求意味・版・許可・新しいgateは追加しない。

### BRAINの提供契約から先の条件別依存照合

[部分照合記録](audits/first-cycle-brain-dependency-expansion-2026-10-12.json)は、BRAIN032の提供・COREへの返却からBRAIN側20identityの意味契約参照を展開し、L2と対L11の40箇所を採択revisionと比較する。20/40はこの記録の参照数であり、正式な最小集合・全横断閉包ではない。CORE009・OS002と共通／安全／接続／資源／計測の横断再帰は未完で、上記PR2925の照合を置き換えない。

| 入口からの経路 | 条件と到達点 |
|---|---|
| 032→003→002→001、005→001/002 | 適用条件・階層・relationの意味を参照し、各親L1とConceptの境界へ戻す。全Domainの知識充実は初回の入力条件にしない |
| 032→007/008、007→011/025/020、008→028/018/019/025 | 出所・版・state・製品固有意味との分離は保持する。取込み／評価／昇格の実receiptは、その操作を行う時点の条件として残す。P3FIRST採用をruntime promotionにしない |
| 032→019/022/030、019→004→012→019/021/022 | COREへ返す操作でquery・選択知識の全required fields・版・scope・受領契約を照合する。012のauthority分離は保持し、021のINTELLIGENCE queryは別操作として残す |
| 028→008/HARNESS010/011、022/030→HARNESS009 | BRAIN側の再訪identityは同じ契約へ戻り、新nodeを増やさない。共通descriptorとCORE受領契約は次の横断照合へ接続する。循環やhash一致から起動順・実接続成立を推定しない |
| CORE由来候補／LABO評価を選ぶ入力→018/020/025→009/010/011/012 | 選択sourceの出所、評価対象revision、scope、反例、未評価範囲を落とさない。Infrastructure maturityを扱う場合のINFRA-017、未選択の個別知識や外部操作は条件付きendpointとして保持し、選択時に再展開する |

この部分照合は、契約参照を「全参照先のruntime完成が常時必須」と読み替えないための整理である。unknownの選択条件をN/Aや参照資料へ落とさず、選択時には必要条件を照合する。将来の受渡し先の完了receiptを候補提供前の入力へ戻さない一方、必要な定義欠落・版不整合を正常receiptで補わない。CORE・OS側の未供給値と返却先、横断endpointの再帰、停止中の前提機構の具体範囲は引き続き#2846へ残す。

旧CLAUDE:49〜63、旧functional-release-slice-requests:23〜67の明示集合・必要安全依存・局所／全体分離を起点に、現行契約の操作／source条件へ意味再導出する。旧runtimeを継承せず、新しい要求・版・承認手続きは加えない。旧弱点UTW-014/021に対し、未観測・未完・部分照合を全体成立へ変えない。

### CORE・OSと周辺契約への横断依存照合

[横断照合記録](audits/first-cycle-cross-owner-contract-dependencies-2026-10-12.json)は、初回5操作の入力元案をCORE009／OS002から先へたどり、47identityの契約参照・操作条件・対oracleと、採択対象L2／L11の94箇所を記録する。BRAIN側の部分照合、PR2925と訂正r2、初回配置の照合を引き継ぐ。47/94は照合範囲であり、必須実装数・正式な最小親集合ではない。実利用要求へのoperation/source/版range束縛と実証拠の閉包は未成立である。

| 主経路と横断先 | 必要な契約と、実入力・証拠を使う時点 |
|---|---|
| CORE009→023→010/011、影響→004、不足→008 | 要求scope・適用契約・候補母集合・選択knowledgeの条件を照合する。041のsource抽出と025/026の設計構成を009の意味処理で置換しない。実設計生成では承認L3と対oracleが必要で、その成功receiptを009の分類前に要求しない |
| OS002→001/007/019/023→015〜020 | source authority、原記録・訂正・continuity、handoff、検証義務の契約を参照する。未発生結果は開始後に回収し、ACKを解決、候補setを使用setにしない。OS019/023のassignment・結果契約は省かない |
| OS018→LABO055/054→INT010、必要時066/OS027 | Bench水準/未評価、task属性、配置案、OS割当を分ける。比較実験006は必要な評価scopeでのみ展開し、初回未評価receiptのために比較成功を捏造しない。人代行も同じ契約・receiptと6安全条件を満たす必要がある |
| 選択辺→CONNECT001〜005、構成体007、交換006、方向/feedback009 | 両端契約・互換・操作authority・冪等・traceを辺ごとに閉じる。全必須辺の契約と構成体固有条件は保持する。実再送・交換・loop/joinは当該操作の条件であり、後段条件不足を独立して適格な初回辺の不成立へ戻さない |
| SECURITY007/008→009/024、実資源→INFRA003/025 | 失効等の該当triggerでは停止伝播を照合する。方針/authority、実資源/actual、Worker制約強制を別ownerに保ち、容量unknownや未適用制約を実行可能にしない。実資源・分類・actor・authority・制約適用証拠は未供給 |
| 更新→SECURITY010〜013/023、復旧→INFRA005〜008/010 | admission・隔離実行・検証・昇格を別状態にし、同一artifactとbefore/after・復旧先を追う。CORE設計契約と承認済み実designを区別する。独立復旧に停止中OSの通常応答を要求しない。実更新/配布/内部デプロイは選択・許可していない |
| OS002評価trace→005/024/048、024→019/021/022 | OS024のHARNESS提供版・対象・許可scopeと021への依存を削らない。一般原記録の追跡だけで024の実運転成立を主張しない。後日findingや比較評価・改善効果は発生時の入力で、初回候補提供前の証拠ではない |
| 計測→HARNESS034→022/003/004/005、source観測→INFRA/LABO | 9/29採択revision003はNFR-REG追補を含む。本文の「未採択追補」「250候補の採択は継承しない」は判断前metadataであり、[固定decision](decisions/po-decision-2026-09-29-57candidates.md)の003節digestと[被覆receipt](audits/requirement-registration/harness-measurement-contract-coverage-receipt-2026-09-28-r3.json)から現行採否を読む。14項目に加えidentity/source/surface、閾値の区別、AI/永続化/並行性/異常条件/risk別手法/時系列の適用を落とさず、実値・probe・測定方式は根拠付きに後続へ残す |

記録には、PR2925で入口条件を照合したSECURITY003〜008/015/016、INFRA001/002/005/006、LABO001/028の先の**未展開の安全・資源・観測依存**が残る。これらを未展開endpointへ明記し、終端成立・参照のみ・実値未供給と混同しない。SECURITY006の分類/CONNECT/実network、007のWorker/assignment/実資源、008の安全/OS依存、INFRA006の独立復旧/authority、LABO001の021〜030 source接続等はG2の残件として照合する。その他の記録上の到達点は、同じ契約への再訪、既存Concept/L1/正本、別操作の未選択枝、後続版境界、実値・結果の未供給/未発生である。未供給の条件をfalse/N/A/参照扱いにせず、利用要求が具体化した時点で必要sourceの依存を再展開する。既存工程・要求形成routingの条件と旧atomの未完を保持し、参照先の契約を実機構の完成へ読み替えない。実実行・安全適用・評価を開始する時には、該当する必須条件と証拠を別途充足する。

残る準備は、上記の未展開の契約依存の照合、限定採用済み知識を初回の著述へ当てる適用集合/最小親集合、停止中の前提機構の具体scope・証拠とL3再開の順序、#2846全作業との独立照合である。この横断照合だけから依存閉包全体・前提成立・要件定義開始可能・Issue完了を宣言しない。旧CLAUDE:49〜63、旧functional-release-slice:23〜67、旧JSON authority:19〜60と旧弱点UTW-014/021を起点に意味再導出し、旧NFR-REGのsource/revisionを保持する。新しい要求・版・gate・承認者は加えない。

### 初回配置に供給する入力と未評価状態

初回の配置材料を、採択済みの[OS要求](../helix-os/L2-requirements/governance-requirements.md)／[対受入](../helix-os/L11-acceptance/governance-acceptance.md)（018・019・023・027）、[LABO要求](../helix-labo/L2-requirements/labo-requirements.md)／[対受入](../helix-labo/L11-acceptance/labo-acceptance.md)（028・054〜057）、[INTELLIGENCE要求](../helix-intelligence/L2-requirements/intelligence-requirements.md)／[対受入](../helix-intelligence/L11-acceptance/intelligence-acceptance.md)（010・061・066）へ戻して整理する。[固定本文の照合記録](audits/first-allocation-input-contract-trace-2026-10-11.json)は9/28の採択revisionと現在の本文を比較する。以下は対象案件へ供給する内容と順序の整理であり、実ticket、配置案、権限、実行記録を作った証拠ではない。要求の実装依存と、意味契約を参照する依存も区別する。

| 時点・操作 | 初回対象へ供給する入力とそのowner | HARNESS023の条件別分類・成立の限界 |
|---|---|---|
| taskの具体化（OS017→018） | BRAIN032／CORE009／OS002のうち作業する責務、要求revisionとscope、task type/domain/complexity/context/tool requirement、必要なWorker capability、予算・期限・停止条件、HARNESS検証義務・oracleをOS ticketへ結ぶ | assignmentには常時必須。属性をprovider名や現在のGUI割当から推測しない。実task値と承認対象oracleは未供給 |
| 性能材料の提示（LABO055→054） | 使うtask/model class、許可されたWorker履歴source/revision、評価範囲・期間・根拠・評価状態を供給する。対象に使える履歴が無ければ、そのscopeを明示した「未評価」を供給する | 選択した履歴sourceは必須。履歴なしとsource不明を混同せず、既存GUIのreview/merge記録を製品Workerの性能水準へ転用しない。水準生成はLABO、配置案はINTELLIGENCE |
| 配置候補の供給（INT010→OS018、必要時066） | INT010の同じ入力/契約revision/scopeで、候補Workerとcapability/version、根拠、除外理由、未評価/unknown、source revision、作成actor/時点を含む案を供給し、OS受領actor/時点を記録する | 配置案はassignmentに必須。INT実装が出力できない場合の人代行は066の操作時必須条件を使う。案の同契約receiptを供給し、INT実装の存在・出力を偽装しない。代行担当と実案は未指定 |
| 未評価からの限定初回（OS027→018） | 下記6条件、限定Worker、狭いscope、予算・期限・停止条件、固定検証義務、人の確認分担を同じtask/attemptへ結ぶ | この限定経路を使う場合だけ027の条件が必須。性能が明示的に未評価という理由だけでは拒否しない一方、authority・安全・oracleの不足は保留。通常経路の一般免除にしない |
| 実行後の観測受渡し（OS018/019/023→LABO057→028/056） | ticket/task/assignment/attempt、要求/Worker/契約revision、scope、成功/失敗/拒否/中断/unknown、検証、人確認、data-use、未完義務を同じsource result/receiptへ結ぶ | 実行後の当該Worker sourceでは必須。開始前に結果を要求しない。057はCONNECT契約または同じidentity/版/scope・ACK/trace・重複抑止・stale停止・同一ID再送を満たす明示的な人手receiptを使える。027はrun構成のprovenance参照で、057の実行依存にしない |
| 範囲付き評価と次回案（LABO056/055→054→INT010/061→OS018） | 対象task/model classとscopeの採用評価oracle/基準revision、判定/比較条件、結果・失敗/反例・unknown、実適用結果と根拠・評価者/時点/receiptを供給する | 評価済み化の操作時必須。観測受領や単発成功からqualifiedにしない。根拠が足りなければ未評価を保ち、次回も同条件の限定経路か成立した通常経路を別に照合する |

未評価時に許されるのは、OS027の次の**6条件すべて**と他の開始入力が成立した限定経路である。これは既決の条件への照合で、新しい一般リスク分類や承認手続きを作るものではない。

| 条件 | 選択対象で照合する内容・既存owner |
|---|---|
| 資産分類と利用許可 | 読込・入力・生成/出力の全資産のidentity/owner/source/revision、公開範囲とdata-useをSECURITY015/016へ結ぶ。unknown・secret・HELIX-restrictedを含めない。他分類も公開許可ではない。生成予定物の事前分類/出力scopeと、生成後差分を照合する |
| credential遮断 | SECURITY005/007でcredential-useやraw secretの入出力を必要とせず、credentialへのアクセスが遮断されている。credentialを要する仕事はこの限定経路から除く |
| 通信の限定 | SECURITY006で通信なし、または必要なdestination/protocol/path・data分類・量・purpose・authority・expiryに一致する明示許可だけを使う。未確認先への再送を許さない |
| 実環境への適用 | SECURITY003/007のproject/tenant/environment/assignment隔離、write path・network・credential・環境変数・timeout・resource limit・差分検査・rollback・結果回収を、INFRAの実資源とWorker環境へ適用し、証拠を確認する。未適用/unsupportedやhost fallbackは成立にしない |
| 操作ごとのauthority | SECURITY008のactor/target/operation/revision/environment/scope/expiryに一致する既存許可を全操作へ照合する。人代行案や性能未評価を許可の代わりにしない |
| 取り消せる変更 | 許可scope内の変更前状態・復旧手段・復旧先を事前に確認し、不可逆な外部作用、release、tag、配布を含めない。復旧可能性不明も対象外で、人確認だけで免除しない |

初回対象のBRAIN/CORE/OS資産だからpublic／非restrictedとは推定しない。対象資産の分類・利用許可・実環境適用はまだ供給されていないため、この循環に027を利用できるとの判定は未成立である。利用できなければ、通常の018の材料・authority・安全依存を充足する経路へ戻し、027の条件を弱めない。人の代行と確認も実担当・対象・revision・scope・receiptが要り、この文書から人に作業を割り当てない。

これにより初回の供給経路は既決契約から特定できるが、案件のinput値、代行/確認担当、実評価oracle、資産分類、制約適用、各辺の契約版・受領証拠は未供給である。CORE→OSの既存条件は詳細ID `HXT-CORE-02` と親要求002／008へ辿れるが、初回対象への契約版・scopeの束縛、実登録・受渡しと、実使用operation/sourceの安全・接続・資源・計測の依存閉包は引き続き未完。#2905段落3、#2846、L3再開、製品setup成立をこの照合から完了にしない。

旧RLO-FR-040:663〜666とRLO-AC-030:907、旧受入:43の未評価明示・scoreによるauthority非変更を保持する。旧provider defaultの固定policyや旧runtimeを採用せず、9/27補強の「性能評価なし」と「許可なし」の分離を9/28採択の027・066・056/057で意味再導出する。変更理由は現行のLABO水準・INT配置案・OS割当の責務を保った初回材料の整理であり、同じ既決要求の再承認を求めることではない。

### templateと再開順序に残る入力

- 非画面という対象条件だけでSEEDFIRSTを全面適用しない。技術的不確実性の有無を要求ごとに確認し、合致した要求/受入部分に限りVT001/VT102とC01/C02/C08/C26の限定知識を使う。UI/PoCの非適用判定、required inputの値、適用者・revision・再評価条件はまだ案件値として与えていない。
- unit/connection/compositeそれぞれのL3/L10・設計と対検証に必要なseed比較・最小集合・採用対象revisionを、26候補と旧6surface/6componentから導く。限定した要求/受入知識を全体最小集合や実装のtest設計へ代用しない。正式schema、renderer、pair/portfolio、parityの未完も保つ。
- 対象案の主単体・各接続・周辺依存を既存Stage配属と照合し、POへ再開順序とscopeの固定案を提示する。009/032の10/10追補を10/3 rosterに無記録で差し込まず、OS002の版未指定を1.0指定へ変えない。HARNESS010/011/023等の共通契約を省いた「BRAINだけ先に実装」としない。

環境条件は[対象案へ当てる整理](development-workspace-setup.md#初回対象案への環境条件の対応)へ結ぶ。対象選択は記録済みである。template集合、依存の閉包、初回配置根拠、再開scopeは未完であり、#2846/#2905は選択の記録だけでは完了しない。[固定照合記録](audits/first-development-scope-proposal-2026-10-11.json)に入力revision・sourceと対受入の所在・未確定範囲を記録する。[訂正記録](audits/first-development-scope-proposal-2026-10-11-r2.json)はCONNECT009の採否の読み違いを訂正し、9/29の固定条件を照合する。

旧CLAUDE:49〜63の仕組み先行・意味処理と外部作用分離、旧functional-release-slice-requests:23〜67の選択集合・局所影響・必要安全依存・復旧、旧design-template-json-authority:19〜60の意味正本/view/適用/portfolio/pairを起点にした意味の再導出である。変更は今回の準備目的に沿って現行032/009/002を選択した準備対象として結ぶ点で、旧schema/Node固定/旧runtimeは移さない。10/10巻き戻しと旧弱点UTW-004/021/029を踏まえ、文書の対応・hash・自己申告だけを機構の成立としない。旧source全consumerの閉包は未完として保持する。

### 初回対象と既存Stageの差を照合する

[Stage対応の照合記録](audits/first-cycle-stage-correspondence-2026-10-12.json)は、主対象・共通契約・既に照合した操作/初回配置の45identityを10/3固定rosterへ対応付ける。42件に既存配属があり、主対象3件は固定roster外である。これは比較した参照集合であり、初回の必須集合や有効依存閉包ではない。

| 対象 | 固定rosterとの関係 | 今回保持する境界 |
|---|---|---|
| HARNESS009 | routing条件として374件とは別分母 | 10/10の既決1.0とCOREAPPLY追補を保持。Stageは補完しない |
| BRAIN032 | 10/3の後、10/10に採用 | TEMPLATECONTRACTの既決1.0を保持。Stageは補完しない |
| OS002 | routing条件として374件とは別分母 | OSTRACEは版指定を追加しない。Stageは補完しない |
| HARNESS010/011/023、選択CONNECT/SECURITY/INFRAの土台 | 主にStage 1 | 共通契約を省かず、無関係なStage全件完了を要求しない |
| HARNESS022、初回配置・Worker・結果記録 | 主にStage 2a | 人代行/未評価とauthority/安全/oracle不足を分ける |
| BRAIN030、LABO026/028/054、INT061 | Stage 4、2b、5に分かれる | 意味参照・選択source入力・実outputを分け、Stage番号だけを実行条件にしない |
| INFRA012/014 | 1.0より後 | 初回へ前倒しせず、SECURITY007とLABO026の必要条件は保持 |

10/3の履歴・374件の分母・承認parentは不変とする。[件数訂正](audits/first-cycle-stage-correspondence-2026-10-12-r2.json)は、元記録の文章にあった44/41を配列どおり45/42へ訂正する。今回の照合は3件を新たなStageへ配属するものではない。必要知識と選択operation/sourceを照合した次の再開順序・scope固定案で扱い、10/10巻き戻しのPO条件へ戻す。現行L3以下の停止、MSGCONTENTの限定採用と運用promotion未実施、#2846の未完を保持する。

### L3／L10の再開順序・範囲の提案

以下は初回対象の選択を、再開判断へ渡すための**未採用の順序案**である。対象選択の判断を再開許可へ読み替えず、L3／L10本文は起草しない。準備の完了もまだ主張しない。比較基準は[10/3の順序判断](decisions/implementation-order-po-decision-2026-10-03.md)、現行との差は上記Stage照合と、[5操作の入力元・依存条件](#初回5操作の入力元案と入口から先の依存条件)である。

提案は、共通契約を先に参照可能にし、BRAINの提供契約、COREの適用契約、OSの案件記録・作業契約の順に要件と対受入を導くこととする。単体の要件を決める時点では接続先の実装成功を要求せず、各端の契約を参照する。接続と構成体の対受入では各端の同じrevision／scopeへの結合を扱い、単体の成功を一周の成功にしない。各PRの上限は既存の機構×Stageであり、横断案を一括のL3 PRへ変えない。

| 順序案 | 起草を提案する範囲と親契約 | Stageとの関係・先行入力 |
|---|---|---|
| 共通契約 | HARNESS010／011／023のidentity・版・scope・authority・依存区分と対受入。選択操作に必要なSECURITY、CONNECT、INFRA、LABOの共通契約は各ownerが扱う | 既存Stage 1を起点にする。全Stage 1完了を一律条件にせず、次の対象が実際に参照する共通契約を先に閉じる。JSON正本と生成表示、実装前oracle凍結／Redを含む既決の開発規律を省かない |
| BRAINの提供 | BRAIN032の15項目すべてと欠落・矛盾・製品値未決の返却、COREへ渡すBRAIN030のquery／版／scope／receipt。BRAIN007／025の知識候補・評価・変更検証・採用の責務を保持する | 032は10/3 roster外のため、初回の著述先をStage 1とする案を提示する。030は既存Stage 4を保持し、この接続のL3／L10入力を先に導く案とする。030全体の実装や他のStage 4能力を前倒しする案ではない。未採用知識を採用済みにしない |
| COREの適用 | HARNESS009の選択母集合・exact set・適用義務・不足／Backflow・影響とN/Aの4属性、CORE→OSの既存親002／008と詳細identity HXT-CORE-02への対応 | 009はroutingの別分母を保持し、初回の著述先をStage 1とする案を提示する。032／009の既決1.0は保持する。知識の一般条件と製品要求値を分け、選択条件がunknownならその義務を未決へ返す |
| OSの案件運転と初回配置 | OS002の提案／選択／使用setと案件義務・原記録・LABO評価母集団。OS017〜020／023のticket・割当・結果・検収・handoff、HARNESS015／022の検証契約、必要なOS027・INT010／066・LABO054〜057の初回材料 | 002はroutingの別分母を保持し、初回の著述先をStage 1とする案を提示するが、版指定は追加しない。作業・配置とHARNESS022は既存Stage 2a。HARNESS015はStage 2b、LABO054はStage 4の配属を保持し、必要な契約入力を先に導く。015は上記45identityの参照集合外なので、10/3追補の当該recordへ直接照合する。027と代行／人手receiptの既決条件を弱めず、未評価・未受領・未実行を分ける |
| 選択辺・構成体と更新／復旧への接続 | BRAIN→CORE、CORE→OS、Worker結果→OS／LABO、検収→COREの各辺と、主対象を結ぶ構成体の義務を各ownerの要件・対受入へ結ぶ。INFRA観測→LABO026は結果receiptと別source。内部更新／独立復旧はINFRA005／006／009／010とSECURITYの条件へ結ぶ | 既存CONNECT各Stageと周辺の配属を保持する。構成体の一周でCONNECT007を選ぶ場合は、既存Stage 5を保持し必要な契約入力を先に導く。007も45identityの参照集合外なので10/3追補へ直接照合する。当該辺に実際に必要な安全・資源・計測を含める。単体・辺・構成体を別に検証する。更新／復旧の条件整理を、内部デプロイ・release・独立復旧の実施許可へ変えない |

この表のStage 1への3件の著述先と、既存後段Stageの契約入力を先に導く順序は**提案差分**であり、採択済みの配属ではない。009／002については、9/27・10/3のrouting containerを`not_stage_candidate`としてStageへ配属しなかった状態からの差を提案する。著述対象は10/10採用の009の1.0規律・COREAPPLYと002のOSTRACEの本文範囲に限る。container内の旧要求atomのrehome／successor対応・被覆は未完のまま既存ledgerへ保持し、本案の著述先や当該追補のL3から旧atom全体の被覆を推定しない。10/3の374件roster、routingの別分母、要求の採否・版・承認parentは書き換えない。Stageは優先群であり、参照した契約の既存Stage番号だけを理由に当該契約を省いたり、Stage全体の実装を開始条件にしたりしない。初回経路の後には既存のStage 2c早期投資枝と2b／3の並行案を比較材料として残すが、その再開も本案から生成しない。

MSGCONTENTは3件の意味内容と原文の適用制限、P3FIRSTはVT103の限定意味とSDOP5件19節/補足記録条件を採用済みで、運用knowledge promotionは未実施である。初回の起草範囲を確定する前に残る入力は、①限定採用の範囲外に必要となる知識・技法内容の採否／不足とMSG3件/P3FIRSTの非採用範囲、②5操作で選択するsourceからの有効依存の照合、③10/10の前提を機構として成立させる範囲・証拠である。Stage照合の45identityは参照集合であり、本表も正式な最小親集合・再帰的閉包を確定した表ではない。①②の差分により必要な親や操作範囲が変わる場合は、同じ本節を更新してから対象revisionを固定する。未選択の能力義務は消さず、初回操作への適用と区別する。

③には現在停止中のschema・実装・検証・CI等を要する部分が含まれうる。「機構として成立」を文書整備・知識採用・hash照合だけで満たしたとはしない。その部分の具体的な実施範囲と、L3再開との順序は未確定であり、POへ出す判断材料に明示する。停止中の下流を準備の名で実行したり、本案で10/10の前提を解除したりしない。一方、実endpoint／契約版range／案件値／評価oracle／toolchain・lock／setup／更新復旧の実行証拠は、対象要件・設計・実行の各段階へ残し、その全ての完成を現在の要求整理Issueの終了条件に足さない。

旧`CLAUDE.md:49〜63`の仕組み先行と意味／外部作用分離、旧`functional-release-slice-requests.md:23〜67`の明示集合・必要安全依存・局所と構成体の証拠分離、旧`design-template-json-authority.md:19〜60`のtemplate／適用／pairとBackflowを保持する。旧の固定runtime・schema・層番号は移さず、現行032／009／002と既存Stageへ意味を再導出する。変更理由はPOが選んだ循環の起草順序を提示することであり、新しい要求や承認手続きの追加ではない。失敗UTW-004／021／029とPR #2564の横断一括起草を踏まえ、準備案・単体の成立・独立review・実接続・再開判断を区別する。

## 既存の作業と正本

| 整理先 | 主に扱う範囲 | 要求・正本の入口 |
|---|---|---|
| #2841 | BRAINの汎用知識・template契約と選択材料 | [BRAIN L2](../helix-brain/L2-requirements/brain-requirements.md)／[L11](../helix-brain/L11-acceptance/brain-acceptance.md)、[template分担](template-work-allocation.md) |
| #2842、#1799、#1801 | COREの製品適用・Backflow、Python意味処理と旧behavior source | [HARNESS L2](../helix-harness/L2-requirements/product-requirements.md)／[L11](../helix-harness/L11-acceptance/product-acceptance.md)、[Python候補](../helix-harness/candidates/requirement-engine-python-core-requirements.md) |
| #1805、#2843、#1860 | OSの工程具体化・案件記録・検収、COREとの往復 | [OS L2](../helix-os/L2-requirements/governance-requirements.md)／[L11](../helix-os/L11-acceptance/governance-acceptance.md) |
| 本ロードマップの横断照合 | 支援、制約、実行資源、評価の選択接続 | [INTELLIGENCE L2](../helix-intelligence/L2-requirements/intelligence-requirements.md)／[L11](../helix-intelligence/L11-acceptance/intelligence-acceptance.md)、[SECURITY L2](../helix-security/L2-requirements/security-requirements.md)／[L11](../helix-security/L11-acceptance/security-acceptance.md)、[INFRASTRUCTURE L2](../helix-infrastructure/L2-requirements/infrastructure-requirements.md)／[L11](../helix-infrastructure/L11-acceptance/infrastructure-acceptance.md)、[LABO L2](../helix-labo/L2-requirements/labo-requirements.md)／[L11](../helix-labo/L11-acceptance/labo-acceptance.md)、[CONNECT L2](../helix-connect/L2-requirements/connect-requirements.md)／[L11](../helix-connect/L11-acceptance/connect-acceptance.md) |

既存Issueの作業を重複発行・完了扱いにせず、このロードマップへ対応付ける。ロードマップIssueは作業projectionであり、各要求・接続の採否や成立は上記正本と対象decisionで読む。

## 一つの要求例による初回の接続照合

照合baseは`ae317cb5000ba8dc7a45a85e8fc535ae8ce2433a`。例は既存HARNESS-L2-026/025の「申請は承認後に編集できない」をそのまま使う。実在案件の承認済みL3、知識の実利用版、templateの採用済みexact set、実行結果はまだ与えていない。以下は要求段階の対応表であり、設計値・schema・API・実装・実行receiptを作った証拠ではない。現行のL3停止中に実行しない。

表のBRAIN番号は`HELIXBRAIN-L2-`、OS番号は`HELIXOS-L2-`、HARNESS番号は`HARNESS-L2-`を示す。各行の確認は、それぞれの対象L11にある同じ要求identityの対oracleへ戻す。対象の採否は上記判断記録の対象revisionで確認し、この表から承認状態を生成しない。

| 接続・対象kind | 入力と引き継ぐもの | 出力・正常条件 | 負例・unknownと戻し先 | 要求と対L11の照合先 |
|---|---|---|---|---|
| BRAINの知識単体 | 選択候補のidentity/version/source、問題、前提、required input、relation、反例 | 複数のPattern候補と条件を比較できる。採用先の製品stateやpermissionは決めない | 前提未入力を適用可能にしない。field定義が未定ならBRAIN、定義済みfieldに必要な製品要求値がないならCOREの要求形成へ戻す | BRAIN003/004/005/007/008 |
| BRAIN→CORE接続 | query/scope、connection contract版・互換、選択した知識の全required fields | 選択知識の版・由来・未充足input・relationを保持するreceipt材料 | 未対応版、別scope、欠落field、Pattern間の矛盾を別の成功知識で補わない。知識側の不足はBRAIN、receiver契約はHARNESSへ | BRAIN030、HARNESS009/026 |
| COREの設計単体 | 対象要求と対L11、再開後の承認済みL3、適用template/工程/CORE/connector版、scope | 承認state・編集commandのprecondition・actorのpermission・data更新不変条件と対oracleを双方向に結ぶ | 画面だけ編集不可でAPIが更新可能な候補は不整合。要求意味は008、L3変更は該当authority owner、設計・pairは026/022へ | HARNESS009/014/026/041 |
| COREの設計構成体 | 同一revision/scopeの設計要素、選択Pattern receipt、画面/API/data/state/permissionとoracle | 申請作成→承認→編集要求→拒否を端から端で辿り、各要素の成功とは別に横断不変条件を確認する | 承認と編集の競合で更新が通る、片方向trace、未定oracle、別revisionの組合せは成立にしない | HARNESS025/026/022 |
| CORE／HARNESS→OSの工程具体化 | 工程・検証契約、対象kind・親revision・scope・義務・戻し先。管理の許可・依存・資源・予算・期限・停止条件 | 1.0の既定工程部品を組み合わせるticket graph候補へ結ぶ。設計成立・実行可能・割当・検収を別状態にする | 意味未決・許可不明・未完依存は実行可能にしない。OSが工程やoracleを再定義しない | HARNESS002/008/005、OS017/023 |
| OS→Worker接続・実行単体 | ticket revision/digest、assignment/attempt、必要なauthority/隔離・capability・資源・累積制約 | 作成者、対象HEAD/scope、実作業と証拠を追跡し、交代時にも未完義務を引き継ぐ | lease失効・HEAD差・権限/資源不足は停止。作成Workerの自己承認を独立reviewにしない | OS018/019/023 |
| 対検証artifact→OS検収接続 | 実装前に凍結するtest/oracleと対象revision/scope。caseを生成する場合はそのartifact・契約版・consumer schema | COREの意味義務を保つrun入力へ結ぶ。初回runの結果は後続出力として回収する | 送信receiptをtest passとせず、未定oracleやconsumer版不一致は032/022またはconsumer ownerへ返す | HARNESS015/022/030/032、OS020 |
| OS検収→COREのBackflow接続 | 同じ因果ID/revision/scopeの差分、検証結果、failed/denied/skipped/interrupted/stale、未完義務と発生元 | 不成立義務を元の契約・ticketへ戻す。受取側が未完義務を受理した証拠まで元ticketを完了にしない | 欠落証拠・別HEAD結果・部分成功を完了にしない。oracle不備はHARNESS、handoff/記録不備はOS、要求意味差は上流へ | HARNESS008/022、OS019/020/023 |

この例のPythonは意味処理の経路を指す。HARNESSの工程契約から設計義務・不足質問・差分を導き、OSへ材料を返す。DB/Git/GitHub write、割当、lease、実行、認可をPythonへ移さない。根拠は旧`CLAUDE.md:61–63`と[Pythonコア候補](../helix-harness/candidates/requirement-engine-python-core-requirements.md)。Python候補の全条件が採択済み・実装済みだとは扱わず、#1799/#1801で意味sourceと候補採否を照合する。

### この例から残った要求整理

| 残る確認 | 完了を証明する材料 | 作業先 |
|---|---|---|
| 汎用template契約と具体知識の選択 | DST12件の条件単位の比較、出所・採用範囲・反例、選択知識のidentity/version/required input。既存Pattern一般契約だけでtemplate固有completion等を満たしたとしない | #2841 |
| templateからの義務とN/A・不足質問 | この例で用いるseedの適用条件・source span、単体/接続/構成体固有義務、対oracle、N/A理由・判定者・revision・再評価条件。field定義欠落と値未決を分けた戻し先 | #2842 |
| 案件で使う版と往復の接続 | project exact set/使用版、query→設計義務→ticket→attempt→検収→Backflowの同一revision/scopeと未完義務の対応。不足は業務意味と記録運転を分けて提示する | #2843/#1805 |
| 安全・資源・測定の選択閉包 | 選択した各操作のSECURITY/CONNECT/INFRASTRUCTURE契約と対oracle、利用区分、失敗・復旧先。既存要求の該当条件と不足を一つずつ照合する | #2846 |

上の表は初回対応時に整理した確認先である。#2841〜#2843は条件照合・不足の区別というticket範囲で終了し、未完のtemplate集合・適用往復・実記録等は#2846へ保持されている（[終了記録の限定観測](audits/requirements-entry-preparation-observation-2026-10-11.json)）。そのcloseから機構の成立を生成しない。実行fixture、内部更新・復旧、支援・評価還流までの要求照合は引き続き本ロードマップの範囲である。既存要求の意味経路の照合と、全条件の被覆・形式的successor移管・再開前提の成立は区別する。要求Stage自体の終了は[終了結果](requirements-stage-closure.md)の限定範囲から読む。

## 内部デプロイと旧sourceの対応

[段階リリース・内部デプロイ方針](decisions/stage-release-internal-deployment-po-decisions-2026-10-07.md)と[10/10巻き戻し判断](decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md)を保持する。部品更新は新しい段階構成として組み、検証と内部利用開始を分けて追う。段階を組み直さない部品・接続単独の内部デプロイは未決のまま保持し、「随時更新」からその許可を生成しない。実際のrelease／cutover等の扱いは既存方針に従う。

旧sourceは`archive/legacy-generation-2026-09-14/root/CLAUDE.md:49–63`（仕組みを土台に機能を積む、意味処理と外部作用の分離）、`docs/governance/candidates/functional-release-slice-requests.md:23–67`（archive root内。選択集合・局所影響・必要安全依存・内部先行利用・組合せ検収）、`docs/design/helix/L4-basic-design/design-template-json-authority.md:19–46`（同root内。意味契約・生成view・portfolio・pair）を読取り起点にした。

保持するのは仕組み先行、選択した小さな経路、必要な安全依存、版・検証・復旧の追跡である。変更するのは今回の指示による最初の整理主題を、現行BRAIN／CORE／OSと支援・評価の接続へ割り当てる点であり、旧Node固定・旧DB・旧runtime・旧test／CIを継承しない。新しい承認手続きや全件完了gateは加えない。
