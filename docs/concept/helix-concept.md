# HELIX Concept

> 版: v4.3 ／ status: current
> 本書は、HELIXがどんなシステムで、どんな構想を持ち、どんな機構で成り立つかを定める。製品定義、要求、
> 目標・原則の詳細は本書に紐づけて下位に置き、本書から他の文書を参照しない。
>
> 改訂履歴
> - v4.3 (2026-09-24) — 8機構＋2共通部品へ再編した。HARNESSとWebは製品属性を持つ機構とした。判断（BRAIN）、計測（LABO）、知識・モデル改善（Intelligence）、安全・認可（Security）、接続（CONNECT）、実行（Runner／Sandbox）を分離した。OSは統制・確定と推進機構を保持する。HELIX自身・複数製品・Web提供・許可済みデータ還流の循環を明示した。Webの価値を、表示中心から開発・保守改修サービスへ改めた。1ファイルでその場改訂する形へ移行した。
> - v4.2 (2026-09-24) — 自走、全体simulation、非エンジニア利用、Worker最適配置について、HARNESSとOSの責務を明確化した。
> - v4.1 (2026-09-17) — HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSを分離し、Product Separation原則を追加した。

# 1. どんなシステムか

## 一文定義

HELIXは、人間が定めたConcept・企画・要求を起点に、HARNESSの開発能力を複数の製品とHELIX自身へ適用し、
判断・実行・検証・運用を分担する機構の証拠から製品とHELIXの双方を改善し、許可された能力をWebへ届ける開発システムである。

## 目的と中心価値

人は価値、製品境界、要求、体験、L3要件承認、不可逆作用の許可を所有する。
HELIXは、承認された範囲を責務単位へ分解し、開発・保守改修・検証・統合・運用・改善候補化を継続する。
中心価値は、ソフトウェアの所有者が自分のシステムを育て続けられることにある。
HELIX-HARNESSとHELIX-Webは機構であり、それぞれ外部へ提供する開発基盤製品、顧客向け開発サービス製品という属性も持つ。
HELIX-OSなど製品属性を持たない機構まで、同じ製品identityへ畳み込まない。
会話、Issue、PR、CIの状態を、要求の意味や承認の代わりにしない。

# 2. どんな構想か

## 5大目標

HELIXが全体として実現する価値は次の5つである。目標だけから、個別要求、責務owner、ticket、workflow instance、技術選定、実装、承認、達成を生成しない。

| 5大目標 | 機構の関わり |
|---|---|
| システム駆動エージェント自走システム | 人間が定めた上流authorityとHARNESS contractを前提に、BRAINが作業・再計画を提案し、OSが適格性・割当・状態を統制し、Runnerが実行する。会話や個体記憶に依存した権限生成を認めない |
| 開発するほど賢くなる自己知能型改善システム | 内部・投入先・Webの許可された実績をLABOが計測し、Intelligenceが知識・モデルの改善候補を作る。OSが対象別の開発・再検証・適用を統制し、学習結果はauthorityを直接変更しない |
| 設計から全体をシミュレーションする予測型システム | HARNESSが入力・検証契約を定め、BRAINが要求、責務、依存、state、failure、運用条件から予測候補を返し、LABOが実測との差を評価する。前提・revision・不確実性・反証方法を保持する |
| CIとbotで品質とスピードを両立した非エンジニアでも作れるシステム | HARNESSの開発・検証契約とHELIX-OSの自動検査・差戻し・証拠化を、人が目的、進行、未決、risk、判断事項を理解できる入口へ接続する。CIやbotのgreenを要求・受入・完了のauthorityにしない |
| 低コストワーカでも最高のパフォーマンスを発揮して最適配置するシステム | LABOの品質・費用・時間・再作業・失敗実測を用いてBRAINが配置案を作り、OSが許可・予算・lease・独立検証を確認して割り当てる。provider名、価格、自己申告だけで最適性を固定しない |

### 目標ごとの機構分担

| 目標 | HARNESSが定める契約 | 機構間の分担 | 製品・Web運転の境界 |
|---|---|---|---|
| 自走 | 承認済み上流から進行・停止・差戻し・再開・検証・完了を判断する工程契約 | BRAINが作業グラフと次行動を提案し、OSが前提revision・許可・予算・証拠を確認して状態遷移と割当を行う。Runnerが限定実行する | 各製品が目的・制約・許可・停止条件を持つ。Web-OSのservice runtimeはOSへ吸収しない |
| 全体simulation | 要求・domain・責務・依存・interface・state・failure・V-pair・検証・運用条件を入力にし、前提・revision・不確実性・反証・再検証を持つsimulation契約 | BRAINが予測・影響候補を作り、LABOが実測とのずれを評価し、OSが対象revisionと証拠を管理する | 製品固有の価値・制約と、許可された運用観測を入力として提供する。入力の所有権は移さない |
| 非エンジニア利用 | 利用者が目的・進行条件・品質・未決・riskを理解し、必要な判断を行える開発契約 | OSがCI・bot・Workerの検査・差戻し・停止・再開を統制し、BRAINの説明や提案を承認と混同しない | Webは仕様整理から開発・検証・保守改修・成果受入までのサービス体験を持つ。Webのdashboard体験はHARNESSの利用価値を代替しない。Web-OSに利用者入口を置くかはWeb／Web-OSの製品定義で定める |
| Worker最適配置 | 作業分類、必要能力、検証義務、上位能力へのescalation条件 | LABOが実測を比較し、BRAINが役割・モデル・effort案を返し、OSがprovider capability・scope・lease・予算・独立検証を確認して割当を確定する | 各製品がrisk・data・作用・品質・期限・費用制約を指定する。Web-OS固有のWorker利用条件はWeb-OSの製品定義で定め、OSの割当authorityを暗黙継承させない |

学習・改善の目標では、学習結果の本番採用と要求変更に、対象上流の人間判断を経る。

## 成長の循環

| 循環の成立条件 | 対象の受渡し |
|---|---|
| HELIXがHELIX自身を開発・改修する | HARNESS契約→BRAIN案→OS統制→Runner実行→独立検証→候補版の適用・切戻し |
| 同じ能力を複数製品へ投入する | 対象別の要求・構成・状態・権限を保ち、必要なHARNESS能力と明示依存だけを渡す |
| 製品とHELIXの双方を改善する | 製品固有の結果をまずその製品へ戻す。HELIX側に欠陥の根拠がある場合だけ、別の自己改善へ接続する |
| Webで開発・保守改修を提供する | HARNESS Version 1の実証後、Webが顧客体験を、Web-OSがservice運転を担い、適格な能力へ接続する |
| 許可されたWebデータで改善し再提供する | Web-OSの利用・運用結果→利用条件確認→LABO計測→Intelligenceまたは開発経路の改善候補→独立評価→採否・適用→再計測 |

HELIX-FACTORYとHELIX-MARKETINGは複数事業の構想であり、HELIX-Webだけを唯一の投入先にしない。
その存在だけを理由に、新しい機構identity、共通DB、顧客data共有を作らない。
HELIXの能力進化の節目（1.0〜5.0）は、公開版番号、現在の実装範囲、各機構の同時完成義務へ読み替えない。

## Version 1とHELIX-Web展開境界

Version 1で完成させる対象は、HELIX-HARNESS製品群である。その完成には、検証フェーズで性質の異なる複数の
プロダクトを実際に開発し、HELIX自身のプロジェクトにもHARNESSを適用して、要求から受入・運用評価までが
成立することの確認を含む。サンプル生成、文書整合、HARNESS単体の成功だけでは、Version 1の完成としない。

HELIX-Webの展開は、そのVersion 1完成と、Webが利用するHARNESS構成の適格性を確認した後に始める。
HELIX-Web自体の実装・公開完了はHARNESS Version 1の完成範囲に含めない。HARNESSが未完成のままWebを展開可能とも扱わない。

展開後のHELIX-Webは、許可された利用者環境へCONNECTの契約で接続する。利用者はそこで仕様を整理し、対象範囲の
開発・検証・保守改修を進め、進行・停止・再開・成果・証拠を確認して結果を受け入れる。このサービスの成立を目指す。
ダッシュボードはその入口の一つであり、表示だけでサービス成立を判定しない。
そのservice runtimeは、HELIX-OSの外に構成するHELIX-Web-OSが運転する。HELIX-OSはHELIX-Web／HELIX-Web-OSを
開発・改善するprojectを管理するが、tenant、job、credential、service stateの運転authorityを自身へ吸収しない。
HELIX-Web-OSは、許可されたservice log・telemetry・incident・利用結果を、出典、tenant／data scope、目的、
revision、時点、欠測を保って返す。LABOは許可された測定入力を評価し、Intelligenceの学習入力は別の利用条件で選別する。
OSは、製品改修とHELIX自己改善を別の対象として開発経路へ戻す。ログ転送だけで要求や学習同意を変更しない。

## 将来能力との関係

外部開発データの推薦は、CONNECTの出典・鮮度、BRAINの案件適用判断、Securityの利用制限へ接続する将来能力であり、
外部情報から要求を自動採用しない。ローカルLLMチューニングはIntelligenceの責務で、dataset・権利・学習と独立評価の分離を要する。
動的な開発フローは、BRAINが稼働時に組み、OSが統制する。
System Compilerは、HARNESSの要求・設計・検証契約、BRAINの計画、OSの実行統制と独立検証、Webの共同定義・検収体験を
組み合わせる将来の構成体能力であり、Web専用engineを新設する根拠にしない。
HDAは、評価済みのモデル・知識を適格な版でサービスへ渡す将来能力であり、学習と推論の資源・責務を分ける。
これらの長期能力を、HARNESS Version 1の完成範囲へ無制限に追加しない。

# 3. どんな機構で成り立つか

## 機構と共通部品の一覧

HELIXはプロジェクト群と全体構想であり、8機構と2共通部品から成る。製品は機構の一部であり、機構の数を製品数と言い換えない。
全体統制は単一の万能書込主体を意味せず、開発と成長の責務を分ける。

| 対象 | 構成区分 | 製品属性 | 主な責務 | 責務の境界 |
|---|---|---|---|---|
| HELIX-HARNESS | 機構 | 外部提供製品 | V-model、要求形成・設計・検証・受入契約、提供package | 個別作業の割当、OS状態、顧客service運転を所有しない |
| HELIX-OS | 機構 | なし | HELIX自身と複数製品のauthority・予算・作業状態・割当・統合・更新・復旧 | HARNESS工程意味を別定義せず、BRAIN案を無条件実行しない |
| HELIX-BRAIN | 機構 | なし | 理解、計画、予測、診断、意味review、配置案、再計画 | 要求・承認・権限を生成せず、OS状態を直接更新しない |
| HELIX-LABO | 機構 | なし | 実験、比較、改善効果・退行、Worker・モデル実測 | 自己評価だけで改善候補の採用を確定しない |
| HELIX-Intelligence | 機構 | なし | 経験・判断方法・dataset・モデル候補の改善 | 稼働時の計画確定やモデルの無検証適用をしない |
| HELIX-Security | 機構 | なし | 操作・情報利用・資格情報・隔離の制限と失効条件 | 製品要求、開発計画、権限を自己拡張しない |
| HELIX-Web | 機構 | 顧客向け製品 | 仕様整理、開発・検証・保守改修、操作、成果確認・受入のサービス体験 | 内部OS管理画面や開発engineを別実装しない |
| HELIX-Web-OS | 機構 | なし | tenant・顧客project・job・service state・配備・監視・復旧 | 内部OSのstate・鍵・権限を暗黙共有しない |
| HELIX-CONNECT | 共通部品 | なし | 接続登録、契約版照合、通信、再送、追跡 | 業務判断、要求承認、計画を所有しない |
| Runner／Sandbox | 共通部品 | なし | 限定された実行・停止・隔離・結果回収 | 作業採否、割当、自己承認を所有しない |

HARNESSは、OS内部のAssurance Kernelにとどまらず、外部利用者へ提供する開発基盤の全体である。Assurance KernelはHARNESSの構成要素とする。
旧Control Plane、Execution、Ledger、Adaptationは、名称や実装ownerのままOSの単一書込境界へ持ち込まない。要求源として各機構へ再配置する。
`HELIX DevOS`は独立した提供製品にしない。package内容とconsumer利用条件はHARNESSが持ち、
生成・配布・promotion・rollback・監視の実行統制はHELIX-OSが持つ。

稼働時に理解・計画・再計画する能力はBRAINが持つ。その判断能力を知識・モデルとして育てる責務はIntelligenceが持つ。
管理・推進・独立検収の役割は、同じ自己承認主体へ統合しない。

## HARNESS

HARNESSは、対象プロダクトの言語、provider、CI製品、画面方式に依存せず、次を提供する。

- Concept／企画／要求／要件／設計／実装／検証の層と正規pair。
- Full V、Production Scrum、V設計＋Scrum実装Hybrid、および別軸のDiscovery／PoCの関係。
- 要求形成、prototype／非UI適用性、合意、freeze、差戻し、再開、完了の条件。
- Concept／企画と利用者指示から、単体・接続・構成体を区別した要求候補、質問、矛盾、欠落、過剰解釈、semantic diff、影響候補を示す要求エンジン。
- 要求kind、構成、risk、domainから設計義務を導き、必要な要求入力の不足を上流へ戻すversioned Design Templateと初期seed。
- trace、impact、verification obligation、failure、evidence、利用者受入、運用評価の契約。
- consumerが構成、版、依存、導入、更新、復旧条件を確認できる配布package。

HARNESSは、Worker pool、HELIX内部memory、運用DB、CI運転、学習履歴を、外部利用者の暗黙の必須構成にしない。
要求抽出、分類、semantic diff、trace、impact、template適用、設計義務等の意味密度が高いbehaviorはsemantic coreへ置く。
認可、lease、DB／Git／GitHub commit等の外部作用は別の境界へ分ける。

駆動モデルは固定modeの実行器ではなく、local ticketへ付けるversioned tag集合として表す。
OSの管理は、目的、親要求、制約、許可、予算、期限、HARNESS版をBRAINの判断入力へ渡す。
HARNESSは、normative workflow vocabulary、各語彙の意味、trigger、適用条件、route内順序、join、停止・差戻し・完了条件を持つ。
BRAINは、その契約と対象状態から、作業分解・tag・ticket graph・workflow instanceの案を作る。
OS内の推進機構は、operational tag、HARNESS語彙へのversioned mapping、composition、workflow instance生成規則を持つ。
推進機構はBRAIN案の適格性を確認したうえで、ticket graphとworkflow instanceを生成する。
OSの管理は生成物を登録・統制して状態遷移を確定し、検収はHARNESS contractへの充足を独立して確認する。
HARNESSは個別ticketを生成しない。BRAINも、工程意味の別定義や自己承認をしない。GitHub labelはtagのprojectionに限る。

## HELIX-OS

HELIX-OSは、HARNESS、自身、他の機構・共通部品、複数製品を開発・改善対象とし、次を担う。

- 対象別authority、revision、関係、変更影響、未解決状態の管理。
- Concept／企画L1、要求エンジン入力、L2候補、訂正・採否、採用要求の系譜と齟齬を登録し、要求化漏れ、企画外追加、対象違い、scope逸脱を管理する。
- Design Templateの版、選定、適用、義務、backflow、利用結果と改善候補の管理。
- BRAINの案に対するrevision、許可、scope、予算、必要証拠、provider capabilityの確認と、Worker assignment、branch、lease、停止・復旧の統制。
- event、log、evidence、review、CI、HARNESS package運転、個別製品のrelease準備・artifact受渡し、observationの実行と保存。
- requirement／design／verification／runtime projectionの整合と再構築。
- BRAINの診断案、LABOの測定、Intelligenceの学習候補、外部変化を出典別に登録し、対象上流へ改善proposalを戻す。
- HARNESS packageの生成・配布・promotion・rollback・monitoringの運転。
- HARNESSをHARNESS自身の工程へ適用し、開発・運用結果からHARNESSの改善候補、変更、再検証、効果確認を続ける。

HELIX-OSはHELIX全体の開発・改修・更新の統制機構であり、HARNESS自身とOS自身の改善も管理対象に含む。
HARNESSの工程規則を各projectへ適用する。内部実践、外部利用、Web-OSの許可log、LABO評価、BRAIN診断、
Intelligence候補から、それぞれ別の改善経路を起こす。BRAINの命令、学習結果、測定scoreを無条件に採用しない。
運用実績や学習結果から、HARNESSや個別製品の要求を直接変更しない。対象上流の採否を経て変更・再検証する。

## 機構と共通部品の接続

| 接続 | 渡すもの | 受け手の確認・戻り先 |
|---|---|---|
| HARNESS→BRAIN→OS | 工程・検証義務、対象revision、目的・制約に基づく計画・診断・予測案 | OSが前提、許可、予算、必要証拠を照合し、古い案や範囲外の案を再判断へ戻す |
| LABO→BRAIN／Intelligence／OS | 測定定義、実験条件、品質・費用・退行の比較結果 | BRAINは配置・原因仮説を更新し、Intelligenceは改善候補を作る。採否・適用はOSと対象上流へ戻す |
| Security→OS／Web-OS／Runner | 人間の許可と採用policyに基づく操作・data・期限・環境の制限 | 操作点で強制し、認可不明、失効、scope不一致では実行しない |
| CONNECT→各対象 | 能力名、契約版、scope、相関、期限、取消、結果状態と追跡 | 未対応版・不明な結果を成功へ読み替えず、元のjobと要求へ結ぶ |
| OS／Web-OS→Runner | assignment、実行世代、資源上限、隔離制限、停止条件 | Runnerが限定実行し、差分・結果・不明を元の対象へ返す。採否はしない |
| Web-OS→LABO／Intelligence／OS | 許可された利用・運用証拠と目的別の利用条件 | 測定、学習、製品改修、HELIX自己改善を分け、無条件の横断共有をしない |

各対象の交換・停止・更新時は、契約版、対象scope、稼働jobの構成版、未完の判断、保持する証拠、継続できる作業、
停止と復旧の条件を、対象ごとに扱う。接続相手の停止を、認可や独立検証を省く理由にしない。
品質と安全、推論と権限、配布と内部成長の境界を保つ。

## 上流から運用までの構造

```text
人間のConcept・企画・要求
  → 対象別L1
  → 対象別L2＋prototype／非UI適用性＋合意
  → 対象別L3＋L10
  → HARNESSの設計・検証契約
  → BRAINの根拠付き計画・再計画候補
  → OSの適格性確認・assignment＋Securityの制限
  → CONNECTの受渡し＋Runnerの限定実行
  → implementation＋test＋evidence＋review
  → L11利用者受入＋L12運用評価
  → release／deployment／observation
  → LABOの比較・評価＋Intelligenceの知識／モデル改善候補
  → 対象製品の改善proposal／HELIX自己改善proposal
  → 影響する上流へのre-entry
```

正規pairは`L1↔L12`、`L2↔L11`、`L3↔L10`、`L4↔L9`、`L5↔L8`、`L6↔L7`とする。
L0 charterは層外のauthority anchorである。上流を変えたときは、影響する下流を見直し対象にし、旧下流のgreenで相殺しない。

## 個別製品との関係

HELIX-Webとその他の個別製品は、自身の利用者、価値、要求、prototype、受入、運用結果を持つ。
HELIX-OSは、個別製品とその運転基盤を開発・改善する進行と証拠を管理し、HARNESSは開発・検証条件を提供する。
HELIX-Webの要求を、OS管理UIやHARNESS機能へ混在させない。
各製品の保守・改修を成立させることと、HELIX自身の開発能力を改善することは、別の変更対象とする。

# 4. 原則と境界

## 9原則

1. **Human Sovereignty**: request、selection、approval、decision、dispositionを分け、actor、target、scope、revisionへ束縛する。
2. **Product Separation**: 機構ごとの責務・authorityと、製品属性に固有の利用価値・要求ownerを分ける。製品属性のある機構とない機構を、別の構成種別にする意味ではない。
3. **Contract Compilation**: ConceptからL1、L2、L3、設計、検証、実装、運用へ一方向に導出する。Requirement IRは承認済み要求の機械projectionとしてL3以降に置く。
4. **Responsibility First**: actionable behaviorはexactly-one primary responsibility ownerを持つ。
5. **Bounded Multi-AI Execution**: Workerをassignment、branch、lease、budget、capability、path、期限へ束縛する。実行統制はHELIX-OSが持つ。
6. **Evidence Closure**: subject、revision、実体、oracle、独立review、実行世代、read-afterのjoinで完了を判定する。
7. **Durable and Replayable**: semantic authority、execution fact、projection、working contextを分け、再構築可能にする。
8. **Controlled Adaptation**: learning、audit、environment reconciliation、synthesisは候補を上流へ戻し、authorityを直接変更しない。改善候補はBRAIN・LABO・Intelligenceが出典別に作り、OSが登録して上流へ返す。
9. **Composable Release**: 検証済みの機能単位から、利用目的に合う提供構成とHARNESS artifactへ適格性を保って合成し、releaseとdeploymentを分ける。

旧`Slice`／`Module`／`Bundle`はComposable Releaseを説明した語彙であり、構成単位のidentity、schema、階層、個数、channelを固定しない。
必要な構成単位は各製品定義と要求から導く。

## authority境界

| 対象 | authority | 非authority |
|---|---|---|
| Concept・企画・要求・要件 | 対象別repo-owned文書、指定JSON、承認revision | Issue、PR、Projects、DB read model、会話要約 |
| 開発工程・検証条件 | HELIX-HARNESSのversioned contract | 個別Workerの手順、CIサービス固有設定 |
| 実行・状態・証拠 | OS／Web-OSそれぞれの対象scopeに束縛したevent、assignment、receipt、commit/tree | BRAINの作業記憶、AI自己申告、画面表示、古いsession |
| 判断・計測・学習 | BRAINの根拠付きproposal、LABOの測定・比較結果、Intelligenceの出典付き候補を対象revisionへ接続 | 提案やscoreからの要求承認・実行許可・本番採用 |
| 操作・情報利用 | 人間の許可と採用済みpolicyをSecurityの制限へ接続し、操作点で強制する | 機構の自己認可、顧客dataの包括同意 |
| 個別製品の価値・体験 | 個別製品の製品定義・要求と承認revision | OS内部管理UI、HARNESS実装詳細 |
| 改善 | 出典・scope・反証条件を持つproposalと採否記録 | 学習結果、finding、外部変化からの直接write |

GitHubは、作業、協調、CI、review、統合証拠のsurfaceである。Issue close、PR merge、label、board列、CI greenから、
要求の追加・削除・採否・合意・受入・退役を生成しない。

## System invariant

1. canonical authorityより先にruntime behaviorをcurrent化しない。
2. 機構ごとの要求・authorityと、HARNESS・Webが持つ製品属性に固有の利用価値を混同しない。共通部品の責務も独立したownerへ置く。
3. Issue、PR、CI、DB、memory、sessionから要求の意味や人間approvalを生成しない。
4. L2を飛ばしてL1からL3へ要求を接続しない。
5. unknownをnone、unchanged、healthy、greenへ変換しない。
6. compatibility greenでcurrent failureを相殺しない。
7. scope、HEAD、assignment、lease、budget、allowed pathのないWorkerを実行しない。
8. author runtimeの自己reviewを独立reviewへ昇格しない。
9. requirement、implementation、verification、acceptance、operationを単一のdoneへ畳み込まない。
10. adaptation subsystemはauthorityへ直接writeしない。
11. 未適格な機能を、HARNESS packageまたは個別製品releaseへ暗黙に含めない。
12. replacement evidenceなしで旧capabilityをretireしない。
13. 単体要求の成立から、接続要求や構成体要求の成立を推定しない。
14. Design Templateの必須inputの不足をAIが補完せず、要求の質問・候補として上流へ戻す。
15. BRAINの判断案、LABOの評価、Intelligenceの学習結果を、要求承認・実行許可・独立受入に昇格しない。
16. OSとWeb-OSのstate・credential・writer、projectとtenantのdata利用条件を暗黙共有しない。
17. 機構の停止・交換・更新時に、認可、必要品質、稼働jobの構成版、証拠、復旧条件を失わない。
18. Webの操作・進捗表示だけから、顧客向け開発・保守改修の成立を推定しない。

## 非目標

- HELIX-OSを外部提供するHARNESS製品として扱うこと。
- HARNESSをOS内部のgate実装だけへ縮退させること。
- HELIX-WebをOSの管理画面へ還元すること。
- 8機構のすべてを製品として扱うこと、HARNESS・Webの製品属性を機構から切り離すこと、すべての機構をHARNESS製品の必須同梱物として扱うこと。
- HELIX-FACTORYを独立機構や全事業共通DBとして固定すること。
- GitHubを、要求の意味・採否・合意・受入の正本にすること。
- AIの自動走行を理由に、人間の上流authorityや不可逆作用の許可を移すこと。
