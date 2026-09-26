---
title: "HELIX-INFRASTRUCTUREのConceptへの配置と版へのPO回答 decision record（2026-09-26）"
decision_record_id: HDEC-INFRASTRUCTURE-CONCEPT-PLACEMENT-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: 2026-09-26（Asia/Tokyo）のClaude作業sessionでのAIの問いとPOの回答
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-INFRASTRUCTUREのConceptへの配置と版へのPO回答（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、AIがHELIX-INFRASTRUCTUREの扱いを3問でPOに問うた。本書は、その問いとPOの回答の記録である。
POが選んだ選択肢は、選択肢の説明文も含めてPOが選んだ内容として扱う。POの発言はそのまま引用し、AIの整理と区別する。
同日の[HELIX-INFRASTRUCTURE L1要求アイデアの判断記録](infrastructure-l1-idea-po-decisions-2026-09-26.md)で、POは「まだアイディアどうするかは全体をみてから」と答えていた。本書の回答は、その「全体を見てから」の判断にあたる。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## 問いとPOの回答

### 1. Conceptの機構の表に加えるか

AIの問い：「HELIX-INFRASTRUCTURE（HELIX自身が動く計算機・保存先・ネットワークなどの実際の資源とその状態を持つ機構）を、Conceptの機構の表に加えますか？ 今のConceptは『8つの機構と1つの共通部品』で、資源の持ち手を『実行基盤』と仮に書いています。」

POの選択：「加えて、9つの機構にする（推奨）」

> 機構の表に行を足し、「9つの機構と1つの共通部品」にする。「実行基盤」の仮の書き方をHELIX-INFRASTRUCTUREに置き換え、PM（OS）が使える資源を出すPMOの一つとして並べる。

### 2. どの版から入れるか

AIの問い：「HELIX-INFRASTRUCTUREはどの版から入れますか？ 原文は『1.0で最低限成立させる範囲』と18項目を挙げ、高度な自動拡張・複数クラウド・完全自動の切替えなどは後の版へ広げられるとしています。」

POの選択：「1.0は18項目、残りは後の版（推奨）」

> 原文の18項目を1.0に置き、高度な自動拡張・複数クラウド・完全自動の切替えなどは後の版へ回す。18項目に名前がない故障の単位・費用の観測などは、どの版かを企画案で個別に示して確認に出す。

### 3. HARNESSのInfrastructureの要求候補をHARNESSの要求（L2）の本文へ入れるか

AIの問い：「HARNESSに置いてあるInfrastructureの要求候補（…）を、HARNESSの要求（L2）の本文へ入れますか？」

POの回答：

> ん？個別で要求を出したと思うが？何をいっているんだ？理解に苦しむ。

## AIの整理

### 回答1：Conceptへの配置

- Conceptの機構の表にHELIX-INFRASTRUCTUREの行を加え、「8つの機構と1つの共通部品」を「9つの機構と1つの共通部品」に改める。
- 持つもの：HELIX自身の各機構、Worker、モデルの実行環境、dataの保存先、コネクタ等の実際の資源と、その構成（Topology）、版、状態、配置。承認された設計から導いた配備の目標と、観測した実際の状態を分けて持つ。
- しないこと：作業と変更の状態の正本（OS）、権限の制約（SECURITY）、設計知識（BRAIN）、Infrastructureの要求と設計（HELIX-HARNESS-CORE）を持つこと。原文の「OSとの境界」のとおり、OS＝Work／Change State、HELIX-INFRASTRUCTURE＝Runtime Resource Stateとし、同じ状態を二重に正本にしない。
- 「実行基盤」の仮の書き方（Conceptの「作業を実行するのはWorker」の項、原則10、HELIX-OSのL1の提供価値、HELIX-OSの要求案のWorker実行契約、作業入口）をHELIX-INFRASTRUCTUREに置き換える。原則10では、INFRASTRUCTUREを資源を出すPMOとして並べる。
- HELIX-WEB-OSの側（顧客のtenant、job、資格情報、配備）の実行環境を本体の資源へ暗黙に共有しないこと（原文HRI-L1-035）は崩さない。Conceptの機構の表の「しないこと」にも書く。
- 機構の数は9になるが、共通部品はHELIX-CONNECTの1つのままである。HELIX-Web（製品群）とHELIX-WEB-OSをそれぞれ1つと数える規則も変えない。製品の属性はHARNESSとWebだけが持ち、HELIX-INFRASTRUCTUREは非製品の機構である。

### 回答2：版

- 原文の「1.0で最低限成立させる範囲」の18項目に当たる要求（HELIXINFRASTRUCTURE-L1-001〜007、009〜011、014、016〜022、028、029、038、039。18項目の15「OSとの接続」は接続の表のOSとの行）は1.0とする。
- 回答の「残り」は、18項目に当たらない要求すべてを指す。18項目に当たらない要求（HELIXINFRASTRUCTURE-L1-008、012、013、015、023〜027、030〜037、040）は、すべて1.0より後（版は未定）とする。原文に具体の版番号がないため、版は決めない。
- 原文の「高度なAutoscaling、Multi-cloud、完全自動Failover等」も1.0より後（版は未定）とする。企画案では表の行とは別に「後の版へ回すもの」の表に置き、「1.0で入れておくもの」には18項目に当たる1.0の要求だけを挙げる。
- 1.0のHELIX-INFRASTRUCTUREは、18項目の範囲に限る。

### 回答3：AIの問いの誤り

- AIの問いは誤りだった。HARNESSのInfrastructureの要求候補（`docs/helix-harness/candidates/infrastructure-requirements.md`）は、対象製品のInfrastructureを要求・設計・検証する工程の契約として、POが個別に出した要求である。HELIX自身の実行環境（HELIX-INFRASTRUCTURE）とは別のものである。
- 個別の要求候補として扱い続け、本記録の反映では本文と候補の状態を変えない。
- 同候補の「位置づけ」の表の「実際に稼働しているInfrastructure（Runtime）」の行は、HELIX自身のものと対象製品のものの区別が読めないため、「HELIX自身のものはHELIX-INFRASTRUCTURE、対象製品のものは対象製品の側」と注記だけを足す。同じ表を持つBRAINのInfrastructure領域の要求候補にも同じ注記を足す。
- 同候補の「未確定の点」にある「本書を要求（L2）の本文へ入れるか、候補のまま残すかは、POが仮決めのL2の最終確認のときに決める」の一文は、本記録の反映では変えない。POの回答から、この一文の扱いは別に確かめる。

## 回答2の整理の修正（同日）

本記録の最初の版の反映で、AIは、18項目に名前がない要求にAIの版の案（多くは1.0）を付け、「PO確認待ち」として企画案と本記録に一覧にした。これを見たPOは、次のように述べた。

> は？何を言ってんの？

AIの整理：
- POの回答2は「1.0は18項目、残りは後の版」であり、18項目に当たらない要求はすべて後の版である。選択肢の説明文の「18項目に名前がない故障の単位・費用の観測などは、どの版かを企画案で個別に示して確認に出す」を、AIが1.0へ入れる案を付けてよいと読み、回答の範囲を超えて1.0の案を付けたのは誤りだった。
- 企画案の版の列を直し、18項目に当たらない要求をすべて「1.0より後（版は未定）」にした。「18項目に名前がない要求の版の案」の表と、本記録の「PO確認待ちの一覧」を削った。
- 企画案の「後の版へ回すもの」の表の「1.0で入れておくもの」の列から、18項目に当たらない要求（012、013、025、026、040）を外し、18項目に当たる要求だけにした。
- 原文の18項目の15「OS connection」は、企画案の接続の表のOSとの行として1.0のままとする。

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。要求ごとの旧対応（OPS-R-01〜08、OPS-R-12、NIO-L3、HIL-TR-01／02、failure domain等）は、[HELIX-INFRASTRUCTUREのL1企画案](../../helix-infrastructure/L1-planning/infrastructure-intent.md)の「旧HELIXとの対応」に記録済みであり、本書はConceptへの配置と版に関わる対応だけを記す。

| 本件 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| HELIX自身の実行環境を独立した機構にすること | 旧Concept v0.1の身体の構造（`LEGACY-ASSET-235F57A4DC453383E6C7`、`archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/concept/HELIX_CONCEPT_v0.1.md:69-91`：全体統制の下の共通基盤に「実行接続」を置き、共通基盤を使うことがデータや権限の無条件共有を意味しないとする）、旧Concept v4.0の8 Plane（`LEGACY-ASSET-653A097F9C9EE51F6FDD`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4.0.md:36,79-85,116-128`：Control Planeがprovider capabilityを、Release and Lifecycle PlaneがDeployment／Operation以降を扱う） | 実行に使う基盤を、統制（OS）から責務として分け、共通に使うことを無条件の共有にしない | 旧では、HELIX自身の実際の資源とその状態を独立して持つ機構はなかった。`archive/`全体を「runtime infrastructure」「infrastructure plane」「実行基盤機構」「HELIX-INFRA」で探して0件だった。資源を独立した機構に置くことは、2026-09-26のPOの原文と本書の回答1による新しい配置である |
| HELIX自身の資源の観測と配分 | 旧Concept v0.1「代謝」（`HELIX_CONCEPT_v0.1.md:234-238`：HELIXの資源はCPU・メモリ・GPU、実行時間、トークン、外部サービスの利用枠、費用であり、観測して仕事と成長活動へ配分する。計算資源が足りなければ待機・直列化・再配置を選ぶ） | 資源を観測し、足りないときは待たせる・並べ替える・回す | 観測と状態はHELIX-INFRASTRUCTURE、配分の案はINTELLIGENCE、決めて回すのはOS（PM）に分ける |
| HELIX自身へ同じ経路を当てること | 旧OPS-R-12（`LEGACY-ASSET-17C4BF78919578FEBB18`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:169-171`：HELIX自身を通常のconsumerとして、Release→Deployment→Observation→Incident→Diagnosis→Fix→Redeploymentを実証し、self-host専用の例外contractを作らない） | HELIX自身のための例外の契約を作らない | 対象を、HELIX自身の実行環境の資源と状態へ広げ、1.0の機構として置く |
| 管理の部分と実行の部分の分離（008。1.0より後） | 旧HIL-TR-01、02（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:165-166`） | control planeとdata／detection planeを分け、版付きの契約でつなぐ | 旧は実行の言語と実行環境で分けていた。本件は資源の消費で分ける。008は18項目に当たらないため、POの回答2により1.0より後（版は未定）とする |
| 故障の単位（012。1.0より後）とMulti-cloud・自動の切替えを後の版へ回すこと | 旧インフラ・運用品質の要求導出の原文（`archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:128`：L4で配置・依存・failure domain・容量前提・deployment／rollback方針を定義し、複数regionや特定クラウドを無条件に要求しない） | failure domainを定め、複数regionや特定のcloudを無条件に求めない | 012は18項目に当たらないため、POの回答2により1.0より後（版は未定）とする。Multi-cloudと完全自動のFailoverも原文どおり後の版とする |
| 版の印の付け方 | 旧VERSION_UP（`LEGACY-ASSET-3E3D84D599ED0476926B`、`archive/legacy-generation-2026-09-14/root/docs/process/modes/version-up.md:13-17,27-28`：今の範囲に入れない能力を破棄せず将来版へ保全し、`version_target: future`等の印を付ける） | 後の版へ回すものを消さず、版の印で保全する | 原文に具体の版番号がない後の版は「1.0より後（版は未定）」と書く。旧の`version_target`のlabel照合（`VERSION_UP_ALLOWED_TARGETS`）と旧runtimeは使わない |
| 人の判断の範囲 | 旧`CLAUDE.md`「自律境界」（`archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`） | Conceptと企画は人が持つ | 版はPOの回答（18項目は1.0、残りは後の版）に従い、AIが回答の範囲を超えて1.0の案を付けない。新しい承認手続きは作らない |

## 反映先

- [HELIX Concept](../../concept/helix-concept.md)：版の表の1.0の「加わる機構」、機構の増え方の図の1.0、1.0の機構の説明の段落、「9つの機構と1つの共通部品」（2か所）、開発の流れの図（Workerへの実行の資源）、機構の役割の表のHELIX-INFRASTRUCTUREの行、「作業を実行するのはWorker」の項の資源の持ち手、原則10
- [製品責務境界](../../concept/product-boundary.md)：機構の数と1.0の列挙
- [HELIX-INFRASTRUCTUREのL1企画案](../../helix-infrastructure/L1-planning/infrastructure-intent.md)とREADME：状態、版の列（18項目に当たる要求は1.0、それ以外は1.0より後）、後の版へ回すもの、未確定の点
- [HELIX-OSのL1](../../helix-os/L1-planning/system-intent.md)の提供価値、[HELIX-OSの要求案](../../helix-os/L2-requirements/governance-requirements.md)のWorker実行契約：資源の持ち手の名前
- [新世代作業入口](../new-generation-start-here.md)、[文書構成](../../README.md)：正式な機構としての案内
- [要求対応表](../crosswalks/concept-mechanism-version-requirement-crosswalk.md)：HELIX-INFRASTRUCTUREの製品属性（非製品）と、既存行へまだ加えていないこと
- [HARNESSのInfrastructureの要求候補](../../helix-harness/candidates/infrastructure-requirements.md)と[BRAINのInfrastructure領域の要求候補](../../helix-brain/candidates/infrastructure-domain-requirements.md)：「位置づけ」の表の注記と、未確定の点の「アイデアの段階」の語
- Scaffold Bindingの`SCF-B-0047`の`reason`の機構の数（日付付きのnoteを追記）
- 研究用のpin（`scaffold/`のinventory、wave37〜50のmeta、outside67の073・074のcounterpart）：変わらない範囲はSHAだけを、OS L1の提供価値の段落を含む範囲は同じ行範囲の後継の文言へ更新した。validatorの条件・意味field・期待件数は変えていない。上流の変わったScaffold Bindingは、日付付きのnoteを追記してreceiptを更新した
- 判断記録、source snapshot、監査記録、判断パッケージ、Scaffold Bindingの既存のnoteは、その時点の記録なので書き換えない。

## 直さなかった点

- 要求対応表の既存行の`mechanism_candidate`：実際の資源に関わる行（HIL-FR-64のWorkerの実行環境、仮ID-BASE-01〜07の1.0の土台等）へHELIX-INFRASTRUCTUREを加えることは、各行の担当の見直しにあたるため本記録の反映では行わず、要求対応表の本文に未反映であることを書いた。
- HELIX-SECURITYとHELIX-INTELLIGENCEのL1企画案：HELIX-INFRASTRUCTUREがConceptに入ったことと食い違う記述はなかったため、変えていない。
- 作業入口の「v4.3への改訂の見直し対象」の列挙（BRAIN、LABO、INTELLIGENCE、SECURITY、CONNECT、Runner／Sandbox）は、その時点の記述なので変えていない。
