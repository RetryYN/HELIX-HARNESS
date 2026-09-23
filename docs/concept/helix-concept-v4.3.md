---
document_id: HELIX-CONCEPT-V4.3
concept_version: "4.3-candidate"
status: draft_candidate
authority_status: awaiting_human_approval
derived_from:
  - docs/concept/helix-concept-v4.2.md
  - docs/concept/product-boundary.md
candidate_inputs:
  - HELIX_機構再編_要求対応指示書.md
  - archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md
source_concept_sha256: b395a54c42782d93651f2a5660736b0330f013ccfd10af925c61c53ec355eebf
source_product_boundary_sha256: 097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038
source_five_goals_sha256: cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca
source_goals_decision: docs/governance/decisions/helix-five-goals-approval-2026-09-24.md
source_reorganization_sha256: d2994a9c2a26786dd18635591f04d316e5c0bf45bbde5c118915bbc485363f44
source_vision_sha256: 1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74
source_vision_asset_id: LEGACY-ASSET-DD53551C74BB4939A325
supersedes_after_approval: docs/concept/helix-concept-v4.2.md
canonical_promotion: pending
approval_scope: exact_body_revision_pending
approved_body_sha256: pending_human_decision
behavior_contract_id: HELIX-CONCEPT-V4.3
---

# HELIX Concept v4.3候補

本書は、本文承認済み・現行適用待ちの[Concept v4.2](helix-concept-v4.2.md)を親に、
[機構再編・要求対応指示書](../../HELIX_機構再編_要求対応指示書.md)と保存された
[Vision v0.1](../../archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md)を照合した後継候補である。
現行authorityはv4.1、v4.2は本文承認済みでcanonicalization未実施、本v4.3は未承認である。
指示書の構成は8機構＋2共通部品である。8機構のうちHARNESSとWebは外部提供する製品という属性も持つ。
製品は機構の一部であり、機構の数を製品数へ読み替えない。指示書は利用者が指定した入力資料として
リポジトリ直下の原位置を保持し、pathやdigestを移動で変えない。
本書は旧要求の新配置への採否、L1／L2／L11、技術、実装、Web公開を承認しない。

## 一文定義

HELIXは、人間が定めたConcept・企画・要求を起点に、HARNESSの開発能力を複数の製品とHELIX自身へ適用し、
判断・実行・検証・運用を分担する機構の証拠から製品とHELIXの双方を改善し、許可された能力をWebへ届ける開発システムである。

## 目的

人は価値、製品境界、要求、体験、L3要件承認、不可逆作用の許可を所有する。
HELIXは、承認された範囲を責務単位へ分解し、開発・保守改修・検証・統合・運用・改善候補化を継続する。
中心価値は、ソフトウェアの所有者が自分のシステムを育て続けられることにある（Vision §1・§7、U17）。
HELIX-HARNESSとHELIX-Webは機構であり、それぞれ外部へ提供する開発基盤製品、顧客向け開発サービス製品という属性も持つ。
HELIX-OSなどの製品属性を持たない機構まで、同じ製品identityへ畳み込まない。
会話、Issue、PR、CIの状態を要求の意味や承認の代替にしない。

## 5大目標と七大原則の接続

[HELIX自体の5大目標](helix-five-goals.md)はHELIX全体が実現する価値、
[HELIXエージェントの七大原則](helix-principles.md)はその価値へ進むエージェントの行動規律である。
本Conceptは製品identity、責務境界、authority、system invariant、上流から運用までの構造を所有する。
5大目標と七大原則をConceptと並列のauthorityにせず、この構造へ接続して対象別L1以降へ降ろす。

| 5大目標 | Concept上の接続 |
|---|---|
| システム駆動エージェント自走システム | 人間が定めた上流authorityとHARNESS contractを前提に、BRAINが作業・再計画を提案し、OSが適格性・割当・状態を統制し、Runnerが実行する。会話や個体記憶に依存した権限生成を認めない |
| 開発するほど賢くなる自己知能型改善システム | 内部・投入先・Webの許可された実績をLABOが計測し、Intelligenceが知識・モデルの改善候補を作る。OSが対象別の開発・再検証・適用を統制し、学習結果はauthorityを直接変更しない |
| 設計から全体をシミュレーションする予測型システム | HARNESSが入力・検証契約を定め、BRAINが要求、責務、依存、state、failure、運用条件から予測候補を返し、LABOが実測との差を評価する。前提・revision・不確実性・反証方法を保持する |
| CIとbotで品質とスピードを両立した非エンジニアでも作れるシステム | HARNESSの開発・検証契約とHELIX-OSの自動検査・差戻し・証拠化を、人が目的、進行、未決、risk、判断事項を理解できる入口へ接続する。CIやbotのgreenを要求・受入・完了のauthorityにしない |
| 低コストワーカでも最高のパフォーマンスを発揮して最適配置するシステム | LABOの品質・費用・時間・再作業・失敗実測を用いてBRAINが配置案を作り、OSが許可・予算・lease・独立検証を確認して割り当てる。provider名、価格、自己申告だけで最適性を固定しない |

### 目標差分の対象別責務候補

v4.1の接続記述だけでは、[L1被覆監査](../governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md)で
自走、全体simulation、非エンジニア利用、Worker最適配置の4領域が`partial`である。次の表は
目標を能力単位へ分けたConcept上の責務候補であり、個別L1要求IDや実装方式を決定しない。

| 目標 | HARNESSが定める契約 | 機構間の分担候補 | 製品・Web運転の境界 |
|---|---|---|---|
| 自走 | 承認済み上流から進行・停止・差戻し・再開・検証・完了を判断する工程契約 | BRAINが作業グラフと次行動を提案し、OSが前提revision・許可・予算・証拠を確認して状態遷移と割当を行う。Runnerが限定実行する | 各製品が目的・制約・許可・停止条件を持つ。Web-OSのservice runtimeはOSへ吸収しない |
| 全体simulation | 要求・domain・責務・依存・interface・state・failure・V-pair・検証・運用条件を入力にし、前提・revision・不確実性・反証・再検証を持つsimulation契約 | BRAINが予測・影響候補を作り、LABOが実測とのずれを評価し、OSが対象revisionと証拠を管理する | 製品固有の価値・制約と、許可された運用観測を入力として提供する。入力の所有権は移さない |
| 非エンジニア利用 | 利用者が目的・進行条件・品質・未決・riskを理解し、必要な判断を行える開発契約 | OSがCI・bot・Workerの検査・差戻し・停止・再開を統制し、BRAINの説明や提案を承認と混同しない | Webは仕様整理から開発・検証・保守改修・成果受入までのサービス体験を所有する。HELIX-Webのdashboard体験はHARNESSの利用価値を代替しない。Web-OSの利用者入口はWeb／Web-OS L1で判断する |
| Worker最適配置 | 作業分類、必要能力、検証義務、上位能力へのescalation条件 | LABOが実測を比較し、BRAINが役割・モデル・effort案を返し、OSがscope・lease・予算・独立検証を確認して割当を確定する | 各製品がrisk・data・作用・品質・期限・費用制約を指定する。Web-OS固有のWorker利用条件はWeb-OS L1で判断し、OSの割当authorityを暗黙継承させない |

学習・改善の第2目標はv4.1の接続を保持する。学習結果による本番採用と要求変更は対象上流の人間判断を経る。
上表の分担は本Concept revisionの人間判断を経て初めて上流境界となり、その後に対象別L1へ
不足価値を個別に分解する。現行L1の`partial`を本表だけで`covered`へ変えない。

### v4.2からの責務差分候補

v4.2の本文承認は本候補へ継承しない。下表は承認済みの目標と制約を保ちながら提案する担当差分であり、
担当の移動・分割自体も人間の新たな判断を要する。OSの統制・確定権限は移さない。

| v4.2の対象文・意味 | 従来の担当 | v4.3の提案担当 | 差分種別・影響 |
|---|---|---|---|
| 目標差分「自走」：OSが状態・作業グラフから次行動を導出 | OS | BRAINが根拠付き次行動・作業グラフ案を提出し、OSが適格性・状態遷移・割当を確定 | 提案生成の担当移動候補。実行とauthorityはOSに残すが、推論機構の分離は新判断を要する |
| 目標差分「全体simulation」：OSが前提・revisionを保持して予測と実測差を管理 | OS | BRAINが予測候補、LABOが実測との差、OSがrevision・証拠を管理 | 予測・評価の担当分割候補。入力契約と反証義務は保持し、対象L1の要求ownerを再確認する |
| 目標差分「Worker最適配置」：OSが品質・費用・時間等を用いて割当 | OS | LABOが比較実測、BRAINが配置案、OSがprovider capability・scope・lease・予算・独立検証を確認して割当 | 測定・提案の担当分割候補。割当authorityはOSに残し、Web-OSへの暗黙継承を禁じる |
| v4.1原則表「Controlled Adaptation」：改善候補の生成はOS | OS | BRAINの診断案、LABOの測定、Intelligenceの知識・モデル候補をOSが出典別に登録し上流へ返す | 候補生成ownerの意味変更候補。原則本文は同じでも適用意味が変わるため、v4.1／v4.2の承認を流用しない |
| v4.2「推進機構」：operational tag、versioned mapping、composition、workflow instance生成規則を所有し生成 | OS内の推進機構 | OS内の推進機構が同じ四つを所有し、ticket graph・workflow instanceを生成。BRAINは入力案を提出 | owner維持。管理による登録・統制と検収による独立確認も維持する |
| 9原則のv4.2注記「本文と意味を変更しない」 | v4.2の承認本文 | 原則本文は保持し、Product Separation・Controlled Adaptationの適用先と担当解釈の変更を本表で明示 | 本文維持、適用意味の変更候補。v4.3のexact revisionで人間判断を要する |

七大原則は、HARNESSが対象作業へ適用するProduction、Research、Discovery／PoC、UI prototype等のrouteと
route内順序を置き換えない。各routeの判断点でresearch、変更単位、domain、上流還流、最小実装、責務・依存分離、
証拠・計測を確認する共通規律として働く。Conceptの9原則はHELIXの構造原則、七大原則はエージェントの行動原則であり、
同じ番号体系やauthorityへ統合しない。

5大目標または七大原則だけから、個別要求、責務owner、ticket、workflow instance、技術選定、実装、承認、達成を生成しない。
対象別L1で価値と非対象へ分解し、旧要求source atomを失わずL2／L11へ再配置してから、L3以降を導出する。
本候補への接続は、v4.3 Concept、七大原則、対象別L1のauthority昇格を成立させない。

## 製品・機構・共通部品

HELIXはプロジェクト群と全体構想であり、8機構と2共通部品から成る。HARNESSとWebは機構の一部であり、製品属性も持つ。
以下の10対象を同一の製品identityにしない。
Vision §2の全体統制は単一の万能書込主体を意味せず、開発と成長の責務を分ける。
この表はConcept上の責務境界候補であり、要求の新配置や対象別L1の承認を生成しない。

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

HARNESSはOS内部のAssurance Kernelだけではなく、外部利用者へ提供する開発基盤全体である。
Assurance KernelはHARNESSの構成要素とする。旧Control Plane、Execution、Ledger、Adaptationの名称や実装ownerを
そのままOSの単一書込境界へ持ち込まず、要求源として10対象へ個別に再配置する。
旧`HELIX DevOS`を独立した提供製品identityにせず、package内容とconsumer利用条件をHARNESS、生成・配布・promotion・
rollback・監視の実行統制をHELIX-OSへ分ける。

Vision §5.4・U12の「HELIX Intelligence」は、育てたモデルを用いて動的に開発フローを組む将来能力を指す。
本候補では、その稼働時の理解・計画・再計画をBRAIN、知識・モデルを育てる責務をIntelligenceへ分ける。
両者の接続と到達条件は対象別L1以降で確認し、Visionの名称から同一機構・実装済み・提供時期を推定しない。

## Visionから保持する循環

| 循環の成立条件 | 対象の受渡し | Visionの根拠 |
|---|---|---|
| HELIXがHELIX自身を開発・改修する | HARNESS契約→BRAIN案→OS統制→Runner実行→独立検証→候補版の適用・切戻し | §2.1、§5.1、U02・U03 |
| 同じ能力を複数製品へ投入する | 対象別要求・構成・状態・権限を保ち、必要なHARNESS能力と明示依存だけを渡す | §1、§3、§8、U04・U18・U19 |
| 製品とHELIXの双方を改善する | 製品固有の結果をまずその製品へ戻し、HELIX側の欠陥根拠がある場合だけ別の自己改善へ接続する | §7、§9.3、U17・U21・U24 |
| Webで開発・保守改修を提供する | HARNESS Version 1の実証後、Webが顧客体験を、Web-OSがservice運転を担い、適格な能力へ接続する | §4、§6、§7、U07〜U11・U17 |
| 許可されたWebデータで改善し再提供する | Web-OSの利用・運用結果→利用条件確認→LABO計測→Intelligenceまたは開発経路の改善候補→独立評価→採否・適用→再計測 | §5.3、§10、§11、U06・U10・U24 |

Vision §8のHELIX-FACTORYとHELIX-MARKETINGは複数事業の構想であり、HELIX-Webだけを唯一の投入先としない。
その存在だけから新たな機構identity、共通DB、顧客data共有、現在の要求採否を作らない。
Visionの1.0〜5.0は能力進化の節目であり、公開版番号、現在の実装分母、各機構の同時完成義務へ読み替えない。

## authority境界

| 対象 | authority | 非authority |
|---|---|---|
| Concept・企画・要求・要件 | 対象別repo-owned文書、指定JSON、承認revision | Issue、PR、Projects、DB read model、会話要約 |
| 開発工程・検証条件 | HELIX-HARNESSのversioned contract | 個別Workerの手順、CIサービス固有設定 |
| 実行・状態・証拠 | OS／Web-OSそれぞれの対象scopeに束縛したevent、assignment、receipt、commit/tree | BRAINの作業記憶、AI自己申告、画面表示、古いsession |
| 判断・計測・学習 | BRAINの根拠付きproposal、LABOの測定・比較結果、Intelligenceの出典付き候補を対象revisionへ接続 | 提案やscoreからの要求承認・実行許可・本番採用 |
| 操作・情報利用 | 人間の許可と採用済みpolicyをSecurityの制限へ接続し、操作点で強制する | 機構の自己認可、顧客dataの包括同意 |
| 個別製品の価値・体験 | 個別製品のConcept／L1／L2と承認revision | OS内部管理UI、HARNESS実装詳細 |
| 改善 | 出典・scope・反証条件を持つproposalと採否記録 | 学習結果、finding、外部変化からの直接write |

GitHubは作業、協調、CI、review、統合証拠のsurfaceである。Issue close、PR merge、label、board列、CI greenから、
要求の追加・削除・採否・合意・受入・退役を生成しない。

## 9原則

1. **Human Sovereignty**: request、selection、approval、decision、dispositionを分け、actor、target、scope、revisionへ束縛する。
2. **Product Separation**: HARNESSの工程契約、HELIX-OSの実行統制、個別製品の利用価値を別authorityにする。
3. **Contract Compilation**: ConceptからL1、L2、L3、設計、検証、実装、運用へ一方向に導出する。
4. **Responsibility First**: actionable behaviorはexactly-one primary responsibility ownerを持つ。
5. **Bounded Multi-AI Execution**: Workerをassignment、branch、lease、budget、capability、path、期限へ束縛する。
6. **Evidence Closure**: subject、revision、実体、oracle、独立review、実行世代、read-afterのjoinで完了を判定する。
7. **Durable and Replayable**: semantic authority、execution fact、projection、working contextを分け、再構築可能にする。
8. **Controlled Adaptation**: learning、audit、environment reconciliation、synthesisは候補を上流へ戻し、authorityを直接変更しない。
9. **Composable Release**: 検証済みの機能単位から利用目的に合う提供構成とHARNESS artifactへ適格性を保って合成し、releaseとdeploymentを分ける。

v4.1はProduct Separationの追加だけではなく、製品境界に合わせて既存原則の意味も改訂した。
次の表はv4.0からv4.1への改訂履歴であり、本v4.3候補では9原則の本文を変更しない。
Product Separationは製品属性のある機構とない機構を別の構成種別にする意味ではない。
機構ごとの責務・authorityと、製品属性に固有の利用価値・要求ownerを分ける。

| v4.0原則 | v4.1での扱い | 改訂理由 |
|---|---|---|
| Human Sovereignty | 保持 | 人間の意味判断をactor、target、scope、revisionへ束縛する |
| Contract Compilation | 改訂 | `Intent→Requirement IR→Release Slice`という実現系列を、Concept→対象別L1→L2→L3→設計・検証・実装・運用のauthority順序へ変更する。Requirement IRは承認済み要求の機械projectionとしてL3以降に置く |
| Responsibility First | 保持 | actionable behaviorのprimary ownerを一意にする |
| Bounded Multi-AI Execution | 保持・対象明確化 | 実行統制をHELIX-OSへ帰属させる |
| Evidence Closure | 保持 | 対象revisionと反証可能な証拠joinを要求する |
| Durable State／Replayable Truth | 改訂 | semantic authority、実行事実、projection、working contextを分離し、HELIX-OSの再構築責務へ置く |
| Controlled Adaptation | 保持・対象明確化 | 改善候補の生成はOS、採否と要求変更は対象上流authorityへ分ける |
| Composable Release | 改訂 | Slice／Module／Bundle／DevOS artifactの旧identityを外し、承認済み機能と適格性からHARNESS提供構成を再導出する |
| Product Separation | 追加 | HARNESS、HELIX-OS、個別製品の要求ownerを分ける |

旧`Slice`／`Module`／`Bundle`はComposable Releaseを説明したsource vocabularyであり、v4.1の承認だけで新世代の
identity、schema、階層、個数、channelを固定しない。必要な構成単位は対象別L1／L2の承認後に再導出する。

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
L0 charterは層外authority anchorである。上流変更時は影響する下流をstale化し、旧下流のgreenで相殺しない。

## HARNESS Concept

HARNESSは、対象プロダクトの言語、provider、CI製品、画面方式に依存せず、次を提供する。

- Concept／企画／要求／要件／設計／実装／検証の層と正規pair。
- Full V、Production Scrum、V設計＋Scrum実装Hybrid、および別軸Discovery／PoCの関係。
- 要求形成、prototype／非UI適用性、合意、freeze、差戻し、再開、完了の条件。
- Concept／企画と利用者指示から、単体・接続・構成体を区別した要求候補、質問、矛盾、欠落、過剰解釈、semantic diff、影響候補を提示する要求エンジン。
- 要求kind、構成、risk、domainから設計義務を導き、必要な要求入力の不足を上流へ戻すversioned Design Templateと初期seed。
- trace、impact、verification obligation、failure、evidence、利用者受入、運用評価の契約。
- consumerが構成、版、依存、導入、更新、復旧条件を確認できる配布package。

HARNESSはWorker pool、HELIX内部memory、運用DB、CI運転、学習履歴を外部利用者の暗黙必須構成にしない。
旧実装からは、要求抽出、分類、semantic diff、trace、impact、template適用、設計義務等の意味密度が高いbehavior atomを
Python semantic coreへ再導出する。認可、lease、DB／Git／GitHub commit等の外部作用は別境界へ分離し、その技術は
新世代architectureからL3以降で選定する。旧moduleの実装言語、file、runtimeを一括継承しない。
駆動モデルは固定modeの実行器ではなく、local ticketへ付けるversioned tag集合として表す。OSの管理は目的、
親要求、制約、許可、予算、期限、HARNESS版をBRAINの判断入力へ渡す。HARNESSはnormative workflow vocabulary、各語彙の意味、
trigger、適用条件、route内順序、join、停止・差戻し・完了条件を所有する。BRAINはその契約と対象状態から作業分解・
tag・ticket graph・workflow instanceの案を作る。OS内の推進機構はoperational tag、HARNESS語彙へのversioned mapping、
composition、workflow instance生成規則を所有し、BRAIN案を適格性確認した上でticket graphとworkflow instanceを生成する。
OSの管理は生成物を登録・統制して状態遷移を確定し、検収はHARNESS contractへの充足を独立確認する。
HARNESSは個別ticketを生成せず、BRAINも工程意味の別定義や自己承認を行わない。GitHub labelはtagのprojectionに限定する。

## Version 1とHELIX-Web展開境界

Version 1で完成させる対象はHELIX-HARNESS製品群である。その完成には、検証フェーズで性質の異なる複数の
プロダクトを実際に開発し、HELIX自身のプロジェクトにもHARNESSを適用して、要求から受入・運用評価までが
成立することの確認を含む。サンプル生成、文書整合、HARNESS単体の成功だけではVersion 1完成としない。

HELIX-Webの展開は、そのVersion 1完成と、Webが利用するHARNESS構成の適格性を確認した後に開始する。
HELIX-Web自体の実装・公開完了をHARNESS Version 1の完成分母へ含めず、HARNESS未完成のままWebを
展開可能とも扱わない。

展開後のHELIX-Webは、許可された利用者環境へCONNECTの契約で接続し、利用者が仕様を整理し、対象範囲の
開発・検証・保守改修を進め、進行・停止・再開・成果・証拠を確認して結果を受け入れられるサービスを目指す。
ダッシュボードはその一つの入口であり、サービス成立を表示だけで判定しない（Vision §6・§7、U08・U17）。
そのservice runtimeはHELIX-OSの外に構成するHELIX-Web-OSが運転する。HELIX-OSはHELIX-Web／HELIX-Web-OSを
開発・改善するprojectを管理するが、tenant、job、credential、service stateの運転authorityを自身へ吸収しない。
HELIX-Web-OSは許可されたservice log・telemetry・incident・利用結果を、出典、tenant／data scope、目的、
revision、時点、欠測を保って返す。LABOは許可された測定入力を評価し、Intelligenceの学習入力は別の利用条件で選別する。
OSは製品改修とHELIX自己改善を別対象として開発経路へ戻す。ログ転送だけで要求や学習同意を変更しない。

## HELIX-OS Concept

HELIX-OSはHARNESS、自身、他の機構・共通部品、複数製品を開発・改善対象として、次を担う。

- 対象別authority、revision、関係、変更影響、未解決状態の管理。
- Concept／企画L1、要求エンジン入力、L2候補、訂正・採否、採用要求の系譜と齟齬を登録し、要求化漏れ、企画外追加、対象違い、scope逸脱を管理する。
- Design Templateの版、選定、適用、義務、backflow、利用結果と改善候補を管理する。
- BRAINの案に対するrevision、許可、scope、予算、必要証拠、provider capabilityの確認と、Worker assignment、branch、lease、停止・復旧の統制。
- event、log、evidence、review、CI、HARNESS package運転、個別製品のrelease準備・artifact受渡し、observationの実行と保存。
- requirement／design／verification／runtime projectionの整合と再構築。
- BRAINの診断案、LABOの測定、Intelligenceの学習候補、外部変化を出典別に登録し、対象上流へ改善proposalを戻す。
- HARNESS packageの生成・配布・promotion・rollback・monitoringの運転。
- HARNESSをHARNESS自身の工程へ適用し、開発・運用結果からHARNESSの改善候補、変更、再検証、効果確認を継続する。

HELIX-OSはHELIX全体の開発・改修・更新の統制機構であり、HARNESS自身とOS自身の改善も管理対象に含む。
HARNESSの工程規則を各projectへ適用し、内部実践、外部利用、Web-OSの許可log、LABO評価、BRAIN診断、
Intelligence候補から別々の改善経路を起こす。BRAINの命令、学習結果、測定scoreを無条件に採用しない。
運用実績や学習結果からHARNESSまたは個別製品の要求を直接変更せず、対象上流の採否を経て変更・再検証する。

## 分離機構と共通部品の接続

| 接続 | 渡すもの | 受け手の確認・戻り先 |
|---|---|---|
| HARNESS→BRAIN→OS | 工程・検証義務、対象revision、目的・制約に基づく計画・診断・予測案 | OSが前提、許可、予算、必要証拠を照合し、古い案や範囲外の案を再判断へ戻す |
| LABO→BRAIN／Intelligence／OS | 測定定義、実験条件、品質・費用・退行の比較結果 | BRAINは配置・原因仮説を更新し、Intelligenceは改善候補を作る。採否・適用はOSと対象上流へ戻す |
| Security→OS／Web-OS／Runner | 人間の許可と採用policyに基づく操作・data・期限・環境の制限 | 操作点で強制し、認可不明、失効、scope不一致では実行しない |
| CONNECT→各対象 | 能力名、契約版、scope、相関、期限、取消、結果状態と追跡 | 未対応版・不明な結果を成功へ読み替えず、元のjobと要求へ結ぶ |
| OS／Web-OS→Runner | assignment、実行世代、資源上限、隔離制限、停止条件 | Runnerが限定実行し、差分・結果・不明を元の対象へ返す。採否はしない |
| Web-OS→LABO／Intelligence／OS | 許可された利用・運用証拠と目的別の利用条件 | 測定、学習、製品改修、HELIX自己改善を分け、無条件の横断共有をしない |

各対象の交換・停止・更新時は、契約版、対象scope、稼働jobの構成版、未完の判断、保持する証拠、継続できる作業、
停止と復旧の条件を対象別に扱う。接続相手の停止を、認可や独立検証の省略理由にしない。
管理・推進・独立検収の役割を同じ自己承認主体へ統合しない。Vision §11の品質と安全、推論と権限、
配布と内部成長の境界を保つ。

## Visionの将来能力との関係

Vision §5.2の外部開発データの推薦は、CONNECTの出典・鮮度、BRAINの案件適用判断、Securityの利用制限へ接続する
将来候補であり、外部情報から要求を自動採用しない。§5.3のローカルLLMチューニングはIntelligenceの候補責務で、
dataset・権利・学習と独立評価の分離を要する。§5.4の動的な開発フローはBRAINが稼働時に組み、OSが統制する。
§5.5のSystem CompilerはHARNESSの要求・設計・検証契約、BRAINの計画、OSの実行統制と独立検証、Webの共同定義・
検収体験を組み合わせる将来の構成体能力であり、Web専用engineを新設する根拠にしない。
Web3のHDAは、評価済みのモデル・知識候補を適格な版でサービスへ渡す将来候補であり、学習と推論の資源・責務を分ける。

Vision §12・U22に従い、これらの長期能力をHARNESS Version 1の完成分母へ無制限に追加しない。
本Concept候補は未来能力の現行実装、提供時期、モデル、接続方式を決めない。

## 新世代への再構築

承認済みv4.1で始めた新世代を本候補でも維持する。新世代は現行runtime、CI、AI向け文書、DB projection、CLI、hook、adapter、
workflow、旧要求配置を改修して延命する系列ではない。Conceptから対象別L1、L2／L11、L3／L10、下流pairへ順に
責務と契約を再導出し、その結果として必要な実装を新規構成する。

旧資産は上流整理の開始時に、元の構造とdigestを保って非実行archiveへ先に隔離する。archive内では要求atom、behavior、
設計判断、oracle、失敗事例、consumer、運用証拠を採取するreference sourceとして扱い、新世代のbaseline、合格oracle、
parity目標、runtime fallbackにはしない。採取元、digest、採否、移管先、非採用理由、historical valueは隔離後に記録する。

旧要求の意味は削減せず、原文・revision・digestを保持して対象別へ無損失で配置し直す。旧owner、旧技術、旧実装との
衝突だけで要求を棄却せず、意味変更またはretireは人間の個別decisionに限定する。現行37要求案はrouting containerであり、
旧IR 153要求や他の旧要求源を置換しない。実装・CIを新規構成することと、要求意味を保持することを分ける。

新世代CIはHARNESSの検証契約と対象別要求からHELIX-OSが組み立てる。旧CIを実行・比較せず、旧workflowやjob集合への
適合を要求しない。AIが読む文書も承認済み上流から生成し、HARNESS工程契約、OS実行context、個別製品要求を分離する。
現行`AGENTS.md`、`CLAUDE.md`、prompt、adapterの文面を新世代authorityとして複製しない。

上流要求整理の開始時に、旧workflow、旧AI instruction／hook、旧runtime／testを元の構造と出典を保った
非実行archiveへ隔離し、current startup、CI discovery、AI read、runtime pathから外す。このarchive-first隔離は
新世代実装や旧意味の採否を成立させず、旧資産の削除、復元、実行、release、deploymentを認可しない。
現行入口には新世代の上流読込順と停止条件だけを置き、そこからConcept→L1→L2の順に降ろす。
要求整理中の成果はcandidate、inventory、crosswalk、適用待ち差分として保持する。

要求整理期間中の意味判定は、対象revisionを固定した文書差分検査、source IDの欠落・重複検査、参照整合検査、
独立した上流意味review、人間decisionで行う。これらの静的結果は候補の整合性証拠であり、実装、L11受入、
運用成立、canonical promotionを証明しない。旧CI／旧gateを実行せず、新世代CIが未構築であることを理由に
旧CIへfallbackしない。remote branchへの同期も意味承認を成立させない。

## 個別製品Concept

HELIX-Webとその他の個別製品は自身の利用者、価値、要求、prototype、受入、運用結果を所有する。
HELIX-OSは個別製品とその運転基盤を開発・改善する進行と証拠を管理し、HARNESSは開発・検証条件を提供する。
HELIX-Webの要求をOS管理UIやHARNESS機能へ混在させない。
各製品の保守・改修を成立させることと、HELIX自身の開発能力を改善することは別の変更対象とする。

## 既存資産の再導出

既存資産はファイル単位で一括移植・削除しない。behavior、要求、設計、oracle、runtime、consumerへ分解し、
製品・機構・共通部品のexact targetへ帰属させる。各資産は`verbatim_reuse`、`semantic_rederive`、
`replace`、`retire`、`archive_only`、`reject`、`unresolved`のいずれかを持つ。旧CI／workflow、runtime／CLI、hook、
adapter、AI instruction／prompt、実行設定、旧test／fixture／oracle、旧runtime state／evidenceは`verbatim_reuse`の対象外とし、
新世代上流から再導出、置換、またはhistorical sourceとして参照する。

自動走行へ入れる前に、上位revision、responsibility owner、scope、pair、acceptance、停止・復旧条件を解決する。
未解決資産はarchive内で上流再導出待ちとする。新世代要求oracle、consumer切替、rollback、read-afterは、旧capabilityの
最終退役または物理削除の条件とし、archive-first隔離の前提にはしない。旧資産との実行parityを要求しない。

本候補では[資産明細台帳](../governance/legacy-asset-disposition.jsonl)の`source_path`から、Vision、
infinity-loop要求、Worker blind benchmark、product data connector、security capability broker、isolated worktree sandbox runnerを検索し、
対応sourceと[Worker capacity](../governance/audits/source-rebaseline/new-generation-worker-capacity-source-crosswalk.md)、
[Security](../governance/audits/source-rebaseline/new-generation-security-engagement-source-crosswalk.md)、
[Concept package](../governance/audits/source-rebaseline/new-generation-concept-package-source-crosswalk.md)の判断史・failure・consumer記録を照合した。
代表資産の確認範囲と、現時点で保持する意味は次のとおりである。`consumer_refs=[]`はconsumer不存在の証明ではない。

| 旧asset ID・source | 保持する意味と観測したfailure／consumer | 本候補での扱い |
|---|---|---|
| `LEGACY-ASSET-DD53551C74BB4939A325` Vision v0.1 | 所有者の継続改修、開発と成長の分離、複数事業投入。台帳のdispositionは`unresolved`、consumer_refsは空 | 長期構想の意味入力。旧実現形や承認を継承しない |
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` infinity-loop L1要求 | 自走・計測・Worker・接続の要求source。台帳は`source_snapshot_preservation`、consumerはcarry-forward ledgerとatomization review | 原文atomを無損失保持し、対象別L1／L2の採否へ送る |
| `LEGACY-ASSET-09F4CAA4129F5DF63C5E` Worker blind benchmark L4設計 | 独立評価とprovenance不足時の失敗条件。smokeの成功はadmissionを示さない。台帳は`unresolved`、consumer_refsは空 | LABO／OS境界の参考。旧benchmarkを新oracleへ流用しない |
| `LEGACY-ASSET-C3DE79BA9451172F3E43` product data connector L5設計 | read-only、lineage、schema・鮮度・drift failureを確認。台帳は`unresolved`、consumer_refsは空 | CONNECTとWebデータ利用条件の参考。旧接続・DB方式を採用しない |
| `LEGACY-ASSET-B62E49D2E156232B8C63` security capability broker L3要求 | typed認可、scope drift時のfail-close、旧broker greenの限界を確認。台帳は`unresolved`、consumer_refsは空 | Securityの操作点制限の参考。旧brokerを現行認可にしない |
| `LEGACY-ASSET-42DBFF81CAA08B82AF11` isolated worktree sandbox runner計画 | dirty baselineと隔離失敗条件を確認。台帳は`unresolved`、consumer_refsは空 | Runner／Sandboxの停止・隔離条件の参考。旧planやruntimeを実行しない |

これらは代表pathの照会であり、BRAIN／LABO／Intelligence／Security／CONNECT／Runnerの全資産・consumerを閉じた調査ではない。
対応機構のL1／L2で原source、判断史、failure、consumerと全候補asset IDを確定し、
[旧資産の完全一致再利用統制](../governance/legacy-asset-reuse-control.md)に従い再利用・意味再導出・置換を個別判断する。
本Conceptでは旧実装のownerや合格証拠を採用せず、指示書第2・第5段階へ詳細採否を残す。

Visionのasset IDは`LEGACY-ASSET-DD53551C74BB4939A325`、SHA-256は
`1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74`である。
保持する意味は、所有者による継続改修、開発と成長の分離、複数事業への能力投入、モデル改善と動的判断、Webの開発提供、
許可された実績の還流である。Vision自身は長期構想かつhistorical sourceで、台帳上のdisposition・consumer・rightsは未解決である。
本候補は意味の再導出案であり、Vision本文の完全一致再利用や旧実装採用の判断ではない。
Vision §5.4の名称と本候補のBRAIN／Intelligence分離、§6のConnectorとCONNECT共通部品化、
§2の全体統制と分散したauthority、§4の進化節目とHARNESS Version 1の展開前提は、変更・具体化が必要な差分として保持する。
対応する旧要求とconsumerの個別調査・採否は、指示書第2・第5段階に残す。

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
11. 未適格な機能をHARNESS packageまたは個別製品releaseへ暗黙包含しない。
12. replacement evidenceなしで旧capabilityをretireしない。
13. 旧CI、旧AI文書、旧runtimeを新世代のbaseline、parity oracle、fallbackとして再利用しない。
14. 単体要求の成立から接続要求または構成体要求の成立を推定しない。
15. Design Templateの必須input不足をAIが補完せず、要求質問・候補として上流へ戻す。
16. BRAINの判断案、LABOの評価、Intelligenceの学習結果を要求承認・実行許可・独立受入に昇格しない。
17. OSとWeb-OSのstate・credential・writer、projectとtenantのdata利用条件を暗黙共有しない。
18. 機構の停止・交換・更新時に認可、必要品質、稼働jobの構成版、証拠、復旧条件を失わない。
19. Webの操作・進捗表示だけから顧客向け開発・保守改修の成立を推定しない。

## 非目標

- HELIX-OSを外部提供するHARNESS製品として扱うこと。
- HARNESSをOS内部のgate実装だけへ縮退させること。
- HELIX-WebをOSの管理画面へ還元すること。
- 8機構のすべてを製品として扱うこと、HARNESS・Webの製品属性を機構から切り離すこと、またはすべての機構をHARNESS製品の必須同梱物として扱うこと。
- HELIX-FACTORYを本候補だけで独立機構や全事業共通DBとして固定すること。
- GitHubを要求意味・採否・合意・受入の正本にすること。
- 既存資産を古さ、path、Issue状態、未参照だけで一括削除すること。
- AIの自動走行を理由に人間の上流authorityや不可逆作用の許可を移すこと。

## 昇格条件

1. v4.2で承認された5大目標の意味を保持したまま、10対象の責務境界、Visionの循環、BRAINとIntelligenceの分離、Webの開発・保守改修価値を含む本候補のexact revisionを人間が採否する。
2. 現行v4.1と本文承認済みv4.2の関係を保ち、v4.3へのsupersede・互換・保存・rollback条件を別の適用記録で決める。v4.2本文の承認を本候補へ自動継承しない。
3. 現行4対象L1の親revisionと内容差分、追加4機構のL1新設要否、共通2部品の要求の置き方を対象別に確認し、L1本文を別に人間判断へ戻す。
4. 旧要求を原文・revision・digest付きで無損失に対応付け、維持・改変・不採用候補・追加を個別採否する。既存L2／L11 draftは親revisionと影響を確認するまで正式適用しない。
5. [product-boundary.md](product-boundary.md)に残るOSの「学習、改善」およびWebの「ダッシュボード」と、本候補で分離した生成・評価・製品体験の関係を別revisionで判断する。旧文書のauthorityを本候補で暗黙上書きしない。
6. Concept適用時は入口・台帳・参照digest・依存Bindingを更新し、main統合後にexact本文とdecisionをread-afterする。実装・CI・Web公開の許可は別に扱う。

本候補の作成は、Concept承認、現行適用、対象別要求の採否、runtime移行を完了させない。
