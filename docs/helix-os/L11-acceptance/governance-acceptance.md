---
title: "HELIX-OS統制要求の受入案"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: test_design
status: draft
freeze_blocking: true
pair_artifact: docs/helix-os/L2-requirements/governance-requirements.md
---

# HELIX-OS統制要求の受入案

全件未実行。複数プロジェクトを対象に要求revision・判断・実結果を照合する。
旧要求の整理では、原要求ID・原文digest・successor・未被覆atomをOSが追跡できることを確認する。
Issue close、PR merge、旧owner・技術との衝突、37件のrouting containerへの接続から要求削除を生成した場合は不合格とする。

| 親要求 | 利用者が確認する結果と反例 |
|---|---|
| HELIXOS-L2-001 | 各要求の対象プロダクト・正本・合意revisionへ辿る。Issue closeを要求の削除・受入として表示しない |
| HELIXOS-L2-002 | 異なるプロジェクトの欠落・競合・未検証を個別に把握し、一方の成功で他方の未完を相殺しない。提供をリリースカンバン上の状態として追跡し、状態の欠落やIssue・PRの状態だけからの推定を拒否する |
| HELIXOS-L2-003 | 開発方式の変更で影響する範囲だけを再評価し、共通統制の無断変更を拒否する |
| HELIXOS-L2-004 | 割当・依存・予算・review待ちを確認し、担当交代による二重作業と自己承認を拒否する。割当てと進行統制はOS、割当て案はINTELLIGENCE、実行はWorker、自己承認の防止と権限の制限はSECURITYが担い、一つの機構が割当て案・実行・承認をまとめて持つ構成を拒否する。Workerの実行の結果から、Worker、provider、model、ticket、要求のrevision、authority、制約、成果物、実行の証拠、ticketが指定したモデルクラスとWorkerを呼び出したレーンまで辿れ、失効で実行が止まり途中の成果物が隔離され、作業の終了後に一時の資格情報や環境が次のassignmentへ残らないことを確かめる。作成したWorker自身またはそのSubagentのreviewが、独立reviewとして数えられないことを確かめる。ticketが指定したモデルクラスが、LABOがHELIX-Benchで出した水準を材料にINTELLIGENCEが作った配置の案を、OSの推進が確かめて指定したものであることを辿れ、評価していないモデルに「未評価」の印が付くことを確かめる。Benchの水準やINTELLIGENCEの案だけで割当てが決まる構成、印のない未評価のモデルを評価済みとして扱う構成を拒否する |
| HELIXOS-L2-005 | HARNESS自身への適用と各productの観測から改善候補を出典と適用範囲付きで登録し、還流先へ振り分けて採否・変更・再検証まで追跡する。未承認経験の規則化、HARNESS改善責務の欠落、棄却理由の消失、還流先の欠落を拒否する。改善の効果と退行の評価はHELIX-LABOの候補で確認し、OSの登録件数やログ量を改善達成としない。観測と作業の結果がLABOへ渡り、LABOが返した改善の提案が登録・振り分けされてticketへ辿れることを確かめ、LABOの提案がOSのauthorityを直接書き換える構成を拒否する |
| HELIXOS-L2-006 | サービス①〜⑦の単位で、リリースカンバン上の状態を見てfresh／既存repoへ提供版を導入・更新・復旧し、無断の成果消失、別artifactへの切替、選んでいないサービスの同時導入を拒否する |
| HELIXOS-L2-007 | Worker・判断・操作・検証のログを、Conceptの1.0土台（ログと証拠）の共通形式で要求revisionから辿り、欠落・重複・staleを成功証拠として使わない。共通形式の欠けた記録を、他の機構の記録と結べない不完全な記録として識別する |
| HELIXOS-L2-008 | HARNESSのコアとticketから導いた検証義務と統合計画に従い、その変更に必要なCIが動的に合成されることを確認する。合成したCIの起動・失敗・修復・再実行を追跡し、固定段数のCIをすべて回す構成、導出された検証の欠落、旧CI成功で新世代の未実行・中断・staleやreview欠落を相殺する構成を拒否する |
| HELIXOS-L2-009 | 中断・担当交代後も制約と未完義務を引き継ぎ、二重実行・予算リセット・無許可復旧を拒否する |
| HELIXOS-L2-010 | 管理・推進・検収が同じticketと因果IDで直接調整し、scope・優先度・共有資源・要求意味の変更だけを正しい判断先へ返す。推進が案件ごとに必要な工程を動的ワークフローとして組み立て、固定の工程列を全案件へ当てはめない。1.0では、組み立てがHARNESSの定めた工程の部品の規則どおりの組合せと途中結果での差し戻しに収まることを確かめ、部品にない工程を推進が独自に作る構成を拒否する。INTELLIGENCEの計画・配置の案を、適格性を確かめずにそのままticketにする構成を拒否する。役割を固定モデル数や中央中継へ変換しない |
| HELIXOS-L2-011 | HARNESS契約で同じ検証義務を与え、A→Bの依存を実際のbase+A+Bで具体化する。base更新・候補増減・順序変更で再計画し、OSによるoracle削除・追加、必要CI欠落、影響証明不能、契約解釈不明、別HEADの成功ではmerge可能としない。計画を導く側（本要求）とCIを合成して実行する側（HELIXOS-L2-008）が別の要求として境目を持ち、計画側がCIを実行する、または実行側が計画を変える構成を拒否する |
| HELIXOS-L2-012 | 【HELIX-LABOへ移管（2026-09-25 PO判断）】技術調査の受入条件は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ移した |
| HELIXOS-L2-013 | 【HELIX-LABOへ移管（2026-09-25 PO判断）】同じ仕事の横断診断の受入条件は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ移した |

## 実行・記録の反例

- HELIXOS-L2-004：成果未回収、期限超過、検証者不在、hook非強制surfaceを個別に与え、停止・不足理由を確認する。Worker自身の完了報告だけで独立検証済みにしない。
- HELIXOS-L2-004／007：reviewer名だけ、GitHub routeだけ、CLI routeだけを順に許可し、指定route以外を起動しないことを確認する。route未指定、別routeの過去許可、timeout、無出力では`review_waiting`を維持し、無許可実行の出力をreview receiptへ採用しない。
- HELIXOS-L2-005：未計測のSkill、誤推薦、旧版を投入し、候補・利用結果・失効を区別できる。学習結果がHARNESS規則へ無断反映されない。
- HELIXOS-L2-001／002／005／007／013：Concept／企画L1、要求エンジンの入力・出力L2候補、人間の訂正・採否、採用要求、後続の見逃しを同じ因果IDで登録する。企画価値の要求化漏れ、企画外の意味追加、対象違い、scope／non-goal逸脱を個別に示し、戻す層と判断者へ辿る。登録やログ件数だけでは要求採用・改善成立とせず、許可外の生会話・PII・別project dataを学習へ転用しない。
- HELIXOS-L2-001／005／007：改善入力の利用同意欠落、data class不明、retention期限超過、許可scope不一致を個別に投入し、拒否または隔離して学習・要求化・別project転用へ進めない。後から許可を補っても、過去の無許可処理を成功へ書き換えない。
- HELIXOS-L2-001／002／007／013：機能A–Cの単体、A→B／B→Cの接続、システムAの構成体を別identityとrelationで登録する。全単体を完了にしても接続・構成体を自動完了せず、接続変更から影響する単体・構成体・検証へ辿る。
- HELIXOS-L2-001／002／007／013：要求分類schemaを与えずに原eventを登録し、意味未分類のまま出典と因果関係を再構築できる。後から異なるengine／schema版で分類しても原eventを改変せず、旧分類、stale、新分類を別projectionとして確認する。
- HELIXOS-L2-001／002／007／013：旧source集合の`registered_source_holding`を先行させる。要求PRごとに、候補semantic digest、入力source atom集合digest、HARNESS無損失被覆receipt、保持atom、別の生存中仮登録へ残すatom、人間decision対象atomを管理層の`registered_proposal`へ束縛する。未計上atom、仮登録欠落、stale record、wrong product、digest不一致、`authority_effect`が`none`以外のいずれかを投入した場合はmerge可能にしない。Issue／PRだけが存在する場合も仮登録済みにしない。
- HELIXOS-L2-001／002／005／007／013：要求kindとriskを変えてtemplate候補、選定版、設計義務、N/A、backflow、消込を追跡する。template欠落、stale、conflict、必要input欠落では自由形式へfallbackせず、旧template利用実績や文書生成から適用・完成を生成しない。
- HELIXOS-L2-001／002／004／007／010：管理が同じ目的・親要求・制約を推進へ渡し、推進が異なる開発style、work kind、変更種別、risk、surface tagとticket graphを生成する。同じ入力・規則なら同じworkflow digestを得て、検収がHARNESS義務の欠落を拒否する。管理によるtag先決め、tag欠落・競合・unknownのready化、GitHub labelだけによるactive workflow変更を認めない。
- HELIXOS-L2-007：未ack finding、未反映memory、重複配送、期限切れ通知を投入し、内容消失・二重利用・古い指示の再提示を拒否する。
- HELIXOS-L2-004／010：独立reviewのfindingを、今のPRで直すものと次のticketにするものに振り分けたことを確かめる。振り分けの欠落、AIの自由な判断だけによるfindingの破棄、次のticketにしたfindingの今のPRへの再流入を拒否する（旧HIL-BR-17、HIL-FR-30）。
- HELIXOS-L2-002／010：PoC、Prototype、Decide、Backflowのticketが、登録済みの要求またはBackflowを出どころにOSの推進から発行されたことを辿れる。INTELLIGENCEの案だけから発行されたticketを拒否する。
- HELIXOS-L2-004／009：SECURITYがauthorityを失効させたとき、新しい割当てが止まり、実行中の割当ても止まることを確かめる。
- HELIXOS-L2-008：上流意味review、下流verification、merge admission、releaseを別pipeline classとして生成する。Concept候補のremote syncで旧CI／merge pipelineが起動する構成を拒否する。
- HELIXOS-L2-008：失敗後の修正と再実行を追跡する。新HEADへ旧CI／review結果を付けた場合、旧workflowを新世代profileとして扱った場合、required oracleを省略した場合は進行可能と表示しない。
- HELIXOS-L2-008：旧CIを起動せず、新世代だけを承認要求由来のoracleで評価する。旧CIとのdual-green、job一致、結果parityを新世代の受入条件にしない。
- HELIXOS-L2-008：旧workflowファイルを除いてもrequired context、schedule、生成template、admission consumer、復元経路のいずれかが残る場合、旧CI退役を成立させない。一件の削除を全relationの移管証拠にしない。
- HELIXOS-L2-009：event保存とprojectionの間で中断し、再開後に同じ作業と証拠へ戻れることを確認する。projection失敗時のcheckpoint公開を拒否する。

各結果は対象プロジェクト・要求revision・HARNESS版・割当・HEADへ対応づける。以上は未実行であり、
既存の単体テストや文書の存在を利用者受入の実結果へ転用しない。

旧資産退役条件はLAR-OS要求の採用revision確定後に評価する。全件未実行。

- 旧pathを除いてもAI read、registry、template、CI、配布、外部schedule、復元経路の一つが残れば退役を不成立にする。
- replacementの上流ID、artifact、consumer適用、rollback、HARNESS oracleの一つが欠ければ旧capabilityを停止しない。
- archive原文のdigest不一致、source欠落、current pathへの再出現を個別に検出する。
- 物理削除を通常archiveと区別し、別のaction-binding approvalがなければ保全したまま停止する。
- HELIXOS-L2-002／006／007：archive manifestの全資産が完全一致再利用、意味再導出、置換、退役、archive限定、不採用、未判定のいずれかで追跡され、
  未判定を不要扱いして要求・behaviorを落とさないことを確認する。
- HELIXOS-L2-002／006／007：完全一致再利用ではsource／target pathとdigest、owner、上流要求、consumer、権利、secret、外部作用、実行性、採否revisionを
  確認する。copy後のdigest不一致、未登録consumer、旧runtime再有効化のいずれかがあれば受入を拒否する。

## 旧HCV4受入条件の移管

総称HELIXの旧L11を再実行せず、管理・実行統制に属するnegative caseを次へ保持する。

| 旧受入ID | 本書の親要求 | 保持する利用結果 |
|---|---|---|
| HCV4-L11-001 | HELIXOS-L2-001／HELIXOS-L2-003 | 要求・判断の出典、対象、scope、revisionを確認し、未承認操作を止める |
| HCV4-L11-002 | HELIXOS-L2-002／HELIXOS-L2-007 | owner欠落、複数owner、trace切れ、証拠欠落を別状態として表示する |
| HCV4-L11-003 | HELIXOS-L2-004／HELIXOS-L2-007／HELIXOS-L2-008 | 独立review、実行世代、HEAD、oracleの不一致を完了へ補完しない |
| HCV4-L11-004 | HELIXOS-L2-004／HELIXOS-L2-009 | assignment、lease、budget、capability不足時に二重実行せず停止する |
| HCV4-L11-005 | HELIXOS-L2-006／HELIXOS-L2-007 | HARNESS導入・更新・rollback、個別製品のrelease準備・artifact受渡し、展開先runtimeによるdeployment・observationの結果を分けて追跡する |
| HCV4-L11-006 | HELIXOS-L2-005 | 観測を候補・採否・影響要求・再検証へ接続し、直接authorityを書き換えない |

これは受入条件の移管案であり、対象別L2の合意、実操作、passを成立させない。

管理変更入口の条件は新世代で採用するrevision確定後に評価する。全件未実行。

- HELIXOS-L2-001／002／005／007：同じ観測の重複、影響欠落、出典不明、採否未決、戻し先不明を入力し、それぞれ未成立として確認できる。
- local intakeとremote Issue／Projectの状態を食い違わせ、remote側から要求意味・承認・完了が逆生成されないことを確認する。
- 旧policyのconfirmed、旧adapter文字列、Issue template、既存test／CI成功を与えても、新世代の管理変更入口を受入済みにしない。
- 管理projectionのmissing、unknown、stale、conflict、再構築失敗を個別に与え、Project／Issue／DB／dashboardの一つが正常でも完了へ補完しない。
- 旧7 operation、旧layer、DB rebuild成功、roadmap表示を与えても、新世代の管理状態集合や利用者受入の成立根拠にしない。

限定修復の受入条件は、2026-09-25 PO判断により[HELIX-INTELLIGENCEの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md)へ移した。

構造改善条件は新世代L1／L2の採用revision確定後に評価する。全件未実行。

- HELIXOS-L2-002／005／007：未評価、unknown、stale、partial、findingなし、no actionを個別に確認し、相互に補完しない。
- 単一metric、AI評価、file size、Issue数、定期scanだけでは改善候補を採択・実行せず、意味変更は上流変更候補へ戻す。
- 旧UIL／RF0、current 9 scope、既存scanner／CIを与えても、新世代trigger・scope・受入の成立根拠にしない。

Worker capacity由来条件は新世代の採用revision確定後に評価する。全件未実行。

- HELIXOS-L2-004／007／009：登録上限、許可WIP、実行中、検証待ち、統合待ちを個別に確認し、一つの合算lane数へ丸めない。
- 下流詰まり、予算不足、競合増加、再作業増加を与え、盲目的dispatchではなく停止・縮退・backpressureになることを確認する。
- 旧三社、provider固定数、8-slot、既存CI／Merge Train／PR／DBを与えても、新世代capacity profileや運用成立を生成しない。

Security engagement条件は対象製品の採用revisionと操作別authority確定後に評価する。全件未実行。

- HELIXOS-L2-001／004／007／009：authorization不在、期限切れ、wrong target／operation／environment／data scope、revokeを個別に与え、新規・実行中の特権操作が許可されないことを確認する。
- 通常作業から特権resourceやrestricted evidenceへ到達できず、sensitive dataを通常DB、log、memory、Issue、PR、AI context、配布物へ出さない。
- 旧broker、provider access、Issue上の承認、既存CI greenを与えても、security操作authorityや受入成立を生成しない。

利用許諾・配布条件は対象製品の契約・権利・公開判断が正式承認された後に評価する。全件未実行。

- HELIXOS-L2-002／006／007：製品scope、契約版、asset、第三者条件、artifact、releaseを食い違わせ、権利不明・適用版不一致・未発効を個別に確認する。
- HARNESS、HELIX-OS、HELIX-Webの契約scopeを混在させず、一製品の許諾・receiptを他製品へ転用しない。
- 候補merge、旧LICENSE、PR、CI、配布成功を与えても、新世代契約の内容・発効・公開許可を生成しない。

AI可読文書条件はAIDOC要求の採用revision確定後に評価する。全件未実行。

- AIDOC-OS-001..003：HARNESS、HELIX-OS、個別製品に異なるrevisionを与え、sourceと責務を混同せず、会話・Issue・memoryから不足fieldを補完しない。
- AIDOC-OS-004：contextを縮小してもauthority、禁止、停止条件、未解決事項、次の必須readが残る。
- AIDOC-OS-005：上流source更新後の旧AI文書をstaleとして拒否し、再生成・semantic diff・read-after前に実行へ使わない。
- AIDOC-OS-006：source欠落、digest不一致、競合revision、未読を個別に与え、読取り済みや実行可能として表示しない。
- AIDOC-OS-007：現行AI文書をarchive対象として与え、新世代のread setやpromptへ再注入しない。現時点では実移動を行わない。
- AIDOC-OS-008：同じ旧pathをsession input、registry、生成template、配布物、lint、復元経路へ配置し、relationごとに別consumerとして検出する。一件の置換や単一read setで全移管済みにしない。

INV由来条件は新世代で個別採用した要求revisionの確定後に評価する。全件未実行。

- INV-001..072をexactに一度ずつ分類し、INV ID、P0..P4、旧Issue／owner、実装状態から要求採否・priority・完了を生成しない。
- INV-019／043を入力しても既存CIやCursor E2Eを起動せず、INV-068／070／071／072をcurrent必須機能にしない。
- 旧graph、DB、scheduler、adapter、CIの存在や効果測定を、新世代能力の実装・受入証拠へ転用しない。

## 運用品質統制の受入

NIO由来条件は新世代で採用する要求revisionの確定後に評価する。全件未実行。

- HELIXOS-L2-002／007：要求revisionから運用対象・計測・log・incident・復旧・保守・観測証拠へ辿り、欠測、stale、collector停止、別環境の成功をhealthyや運用成立へ変換しない。
- HELIXOS-L2-005／007：incidentや観測差分を改善候補として保持し、Issue close、rollback成功、文書存在から要求変更・恒久修復・再発防止完了を生成しない。
- HELIXOS-L2-004／006／009：scope外の自動修復、公開、課金、production writeを拒否し、対象・actor・権限・予算・影響・復旧・独立検証の欠落を実行可能と表示しない。
- HELIXOS-L2-007：secret／PIIをlog・example・evidenceへ平文出力せず、具体方式の採用前には未検証として扱う。

旧NIO候補、旧Issue owner、旧engine、既存CIは受入入力や操作認可にしない。製品固有SLOの達成は対象製品のL11／L10／L12で確認する。

HELIXOS-L2-005では、採用した改善を要求・設計・検証・再観測まで追跡し、改善なし・退行・判定不能も保持する。
候補件数やログ件数の増加だけをHELIX改善の成功と表示しない。
HARNESSの外部提供完了とHELIX-OSの内部改善状況を別に確認し、一方の成功で他方を完了扱いにしない。

## HARNESS、HELIX-Web、HELIX-WEB-OSを管理するシナリオ

未実行。HELIXOS-L2-001／002／003／005の対象間の分離を次で確認する。

- HARNESS、HELIX-Web、HELIX-WEB-OSに異なる要求revision・進行状態を与え、それぞれのローカル正本へ辿れること。Web／WEB-OS要求をOSやHARNESSの要求として誤表示しないこと。
- Webが採用するHARNESS版と能力を特定し、Web固有要求の変更で他プロダクトの要求・承認・工程規則が暗黙に変わらないこと。
- HELIX-OS内部stateとHELIX-WEB-OSのtenant／job／credential／service stateを食い違わせ、どちらか一方を他方のauthorityとして補完しないこと。
- WEB-OSの許可logと範囲外logを混在させ、前者だけを出典・scope・目的・同意・revision付きでHELIX-OSの改善入力へ取り込むこと。credentialとtenant原dataを拒否し、欠測を正常化しないこと。
- WEB-OS log由来の改善候補をHARNESS、Web、WEB-OSのどこへ戻すか区別し、HARNESS自身への影響があればHARNESS要求・設計・検証へ接続すること。一製品の観測から全対象を無条件に変更しないこと。
- Webの検証が未完のとき、HARNESSの提供完了やCI成功でWebを完了扱いにしないこと。
- Webの実践証拠からOSが改善候補を管理し、採否・変更対象・再検証へ辿れること。証拠の利用可能範囲を越えて共有せず、候補を自動で要求正本へ昇格させないこと。

## memory責務変更の受入条件

HELIXOS-L2-001／004／005／007／009のHMC-BR-001..006由来条件を検証する。全件未実行。
次の各反例を個別に試し、結果を通知identity・要求revision・対象HEADへ束縛する。

- 別runtimeで通知を受信し、本文の指示を実行する前に参照先の要求・assignment・lease・HEADを確認できる。
- stale pointer、HEAD不一致、期限切れ、消費済み通知はcurrent guidanceにならず、理由と再取得先を確認できる。
- 同じeventの再配送とcrash後再開で作業が二重実行されず、訂正前の通知を有効な指示として再使用しない。
- 相談やAI解釈を含む通知が、要求承認・決定・完了表示へ昇格しない。
- どのproviderの標準memory（provider native memory）も使われていないことを確認できる。ユーザー設定を入力しても共有authorityへ暗黙混入せず、要求・長期知識は対応する正本へ辿れる（2026-09-24 PO判断）。
- 移管後も原文provenanceと訂正履歴を参照できる。記録件数が減ったことだけで移管・受入成功にしない。

- HMC-BR-001：assignment、review依頼、handover、heartbeat、確認待ちをそれぞれ異なるruntimeへ渡し、期限と参照先を確認する。
- HMC-BR-003：規則は仕組みで吸収され、知識は1.0〜2.xではHELIX-LABO、3.0からはHELIX-INTELLIGENCEの正本を参照し（2026-09-24 PO判断）、通知の消費で要求・設計・受入・運用規則・ユーザー嗜好が失われたり上書きされたりしない。
- HMC-BR-004：作業依頼・質問・仮説・叱責も入力し、依頼の存在だけで承認や完了を生成しない。
- HMC-BR-005：消費、期限切れ、訂正を個別に再現し、無効な通知は履歴として参照できても現行指示として再使用できない。

## 成果の出所に関する候補の受入条件

PPS4件は採用revision確定後、HELIXOS-L2-004／007で次を確認する。全件未実行。
監査（AAFD）の受入条件は[HELIX-INTELLIGENCEの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md)へ、学習（RCLS）の受入条件は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ、2026-09-25 PO判断により移した。

- producer、commit実行者、PR公開者を個別に表示し、HEADとassignmentから経路を再現できる。actor差だけの独立review、過去の不明producerの推定承認を拒否する。
- mixedとunknown、外部botとHELIX producerを区別し、既存記録に無かった証拠を移行処理で生成しない。

性能・利用時間等の数値基準は利用者合意前に捏造しない。機械検証が成功しても、ここで定める
利用者受入の実行証跡と合意対象revisionの対応がなければL11完了としない。

## 会話継続の受入条件

HELIXOS-L2-009／007／004に接続するCLR候補の受入案。全件未実行であり、採用revisionを確定してから評価する。

| 出典 | 利用者が確認する結果と反例 |
|---|---|
| CLR-R01 | 未保存の意図・棄却理由・失敗仮説を与え、文書やdigestが存在するだけでは切替可能と表示されない |
| CLR-R02 | checkpointから未commit・未追跡差分、実行中処理、契約版、累積制約へ辿る。未承認意図を合意済みにしない |
| CLR-R03 | 保存後の再取得で版・意味・未完義務を確認できた範囲だけが入力から外れ、会話原本や監査証拠が削除されない |
| CLR-R04 | 継続・compact・新sessionの選択理由を確認し、provider非対応、hook未発火、観測不能を成功と誤表示しない |
| CLR-R05 | 切替順序と旧writer停止を確認する。実行中処理を再起動して二重実行せず、予算・期限・retry・未完義務を初期化しない |
| CLR-R06 | packet上限超過時に不足を表示して分割取得または保留する。取消権限・他案件情報・secret・結論誘導を混入させない |
| CLR-R07 | 同一条件で3方式の品質・意図保持・見逃し・再取得・総費用を比較でき、初期context減少だけで採用にならない |
| CLR-R08 | shadowから運用有効化までの段階と未完条件を確認し、SkillやRule導出の完了で会話継続も完了扱いにしない |

保存失敗や版混在では切替成功・作業完了と表示しない。障害注入テストの成功を利用者合意の証拠へ転用しない。

## 要求形成・人間反応の受入条件

HELIXOS-L2-001／002／003／007ではAVS6件・RFA3件・DGH3件由来の条件を確認する。

- 同じ強い口調の入力でも、相談・作業指示・採択・承認を証拠とscopeで区別でき、AI由来の開始理由に人間provenanceが付かない。
- 技術方式の選択、恒久的なADR判断、操作認可、処理結果、一時的評価をそれぞれ参照でき、指示文を合格証拠へ使わない。
- 委任scope内の技術的具体化は既存承認の範囲で進み、scope外の意味・権限変更だけが別判断として示される。
- プロト反復の前後で、受容済みの軸・変更した軸・客観検証・人間反応・AI解釈を比較できる。人間の不満を再現済みbugへ自動変換しない。
- 影響要求と検証を再確定した際、無関係な作業を失効させない。未解決・再発findingを隠して収束済みと表示しない。
- 外部実例や既存資産の根拠が欠落する場合、根拠未確認として把握でき、単なる文書リンクの存在を検証済みと表示しない。

全件未実行。工程条件自体の受入はHARNESS L11に従い、OSの表示・記録成功だけで工程成立としない。

## 提供・再編要求の受入条件

HELIXOS-L2-002／004／005／006では、FRSの新世代対応表で再採否対象とした条件だけを個別に確認する。
旧FRS v0.2の承認は継承せず、FRS-BR-008の既存CI先行利用は不採用、Cursor固有条件はWorker要求源へ移送する。

| 出典 | 利用者による確認と反例 |
|---|---|
| FRS-BR-001／002／003 | 選択した機能単位の証拠と提供構成の収載・除外を確認する。未適格・未指定機能の混入と別階層への自動昇格を拒否する。旧Slice／Module／Bundle identityは未採択として扱う |
| FRS-BR-004／007 | 要求revisionと変更pathから影響・検証先へ辿る。未所属・二重owner・未接続・未検証・unknown影響をそれぞれ識別できる |
| FRS-BR-005 | 同一入力から再生成したmanifest／artifactを比較し、clean consumerの結果とrollback先を確認する。不一致artifactや未適格復旧先を成功扱いにしない |
| FRS-BR-006 | 再編候補の根拠・採否・shadow状態を確認する。現構成の名前・個数だけを理由に維持または削除しない |
| FRS-BR-008 | 新世代の提供構成要求として採用しない。要求整理中に既存CIを起動・比較・効果測定せず、Cursor／branch／Claude固有条件を提供構成の受入へ混入させない |
| FRS-BR-009 | Slice単位の安全依存と、組合せの統合・更新・rollback・運用検証を確認する。個別Sliceの成功だけでBundle全体を受入済みにしない |

提供構成案の追加条件は採用revisionの確定後に検証する。growth-offでの開発、対象製品とHELIX自己Releaseの
権限・receipt非転用、文書版から公開SemVerへの誤変換、未採択Visionの必須依存化をそれぞれ確認する。
旧PKG-D01..13、旧Module／Bundle数、旧main、Issue／PR、既存CI結果を与えても、OSの管理対象、提供構成、
公開版、採用済み能力として確定しない。HARNESSの提供契約、OSの配布操作、個別製品の受入を別々に照合する。

全件未実行。OSで収集した実結果と、HARNESSの提供物条件を分けて照合する。

## 要求正本更新の受入

HELIXOS-L2-001／002／007／009とHR-FR-HIL-19の利用者受入案。全件未実行。

- L2凍結境界の是正案を入力し、対象7レコード・変更前revision・意味差分・下流影響を確認できる。変更案を登録しただけでは正本更新済みにならない。
- 許可scope内の変更は根拠付きで進み、scope外の変更は必要な判断を提示する。policyを自分で拡張して通過しない。
- 更新途中で保存・projectionを失敗させ、部分的に新旧が混在した状態を現行正本として提示しない。失敗理由と復旧先を確認できる。
- 同一operationを再送してもrevisionを二重に進めず、競合する変更前revisionは明示的に拒否する。
- 旧shadowやIssue本文を更新入力に与え、最新要求が巻き戻らないことを確認する。原文と旧revisionは履歴として追跡できる。
- 成功時に要求・契約・受入・下流失効・生成view・DB・receiptを同じ更新へ辿る。未完実装・未実行テストの状態は更新成功と独立に保持する。

既存の読取りauthority検査やPLAN transactionの成功を、この要求更新の実行証拠へ転用しない。

## Execution Ticketの受入

[既存L11候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-validation.md)から対象別に接続する。全件未実行。
HELIXOS-L2-004／005／007／009について、次の利用条件を確認する。

| 出典 | 確認する結果と反例 |
|---|---|
| HXT-RQ-01 | provider交代・retry後も同じ仕事と異なる試行を追跡できる |
| HXT-RQ-02 | 成功・失敗・拒否・中断・待ち・未実行を区別し、通常開発の全対象から観測receiptまで辿れる。欠損を検出し、同じ入力のreplayで集計が一致する。成功例だけの集計を完全な観測として表示しない |
| HXT-RQ-03 | 同一条件比較と比較不能を説明でき、共通oracleで採点できる |
| HXT-RQ-04 | 許可のない追加実験は起動せず、有限予算で通常laneを保護する |
| HXT-RQ-05 | 劣化を既存ownerへ根拠付きで返し、Benchが直接配車しない |
| HXT-RQ-06 | 旧task snapshotで既存Benchを継続し、切替scopeだけTicketを要求する |
| HXT-RQ-07 | 意味承認・危険操作承認と、委譲済みpolicy内の実行順選択を区別する |

改善効果が観測できなかった場合も結果を保持し、比較成立と性能改善実証を別に評価する。
非UIでもL2要求と受入を省略せず、必要な適用性記録を残す。

## ticket詳細要求の受入

対のL2の詳細IDに対応する未実行の受入案。採否・実装許可・受入済みを生成しない。種類の行は目的・発行・合流先を一組で確かめ、接続の行は端から端まで確かめる。各行でL2のシステム／運用の分担も確認し、入力・判断の不足をシステムで補完した場合は不成立とする。

| 詳細ID | 親主要求 | 成功条件 | 反例（不合格） |
|---|---|---|---|
| HXT-TYPE-01 | HELIXOS-L2-010 | 「Forward 大」について、目的「構成体（システム全体）を、開発方式の規定路線で要求から受入まで通す」、発行「計画」、合流先「本流」を同じticketで確認できる。 | 単体CIだけで構成体の受入を成立させる |
| HXT-TYPE-02 | HELIXOS-L2-010 | 「Forward 中」について、目的「接続（機能と機能のつなぎ）を、開発方式の規定路線で作る」、発行「計画」、合流先「Forward 大」を同じticketで確認できる。 | 接続を作らず単体の完了だけでForward 大へ合流する |
| HXT-TYPE-03 | HELIXOS-L2-010 | 「Forward 小」について、目的「単体の機能を、開発方式の規定路線で作る」、発行「計画」、合流先「Forward 中／大」を同じticketで確認できる。 | 単体の範囲を越えた実差分を小のまま通す |
| HXT-TYPE-04 | HELIXOS-L2-010 | 「Discovery」について、目的「開発の途中で検証が必要になったとき、または範囲が分からないときに確かめる」、発行「突発」、合流先「発行元のticket」を同じticketで確認できる。 | 範囲不明を解消しないまま発行元を完了にする |
| HXT-TYPE-05 | HELIXOS-L2-010 | 「PoC」について、目的「技術的に成り立つかを確かめる。画面の有無に関係なく、成立性が不明なときに発行する。本番実装にはしない」、発行「計画（L2.5）」、合流先「Backflow→要求エンジンの2次形成→Decide」を同じticketで確認できる。 | 画面がないことだけでPoCを省略する／本番実装へ流用する |
| HXT-TYPE-06 | HELIXOS-L2-010 | 「Prototype」について、目的「画面の操作と使う人の反応を確かめる。画面のない対象では発行しない」、発行「計画（L2.5）」、合流先「Backflow→要求エンジンの2次形成→Decide」を同じticketで確認できる。 | 画面なしの対象にPrototypeを必須発行する |
| HXT-TYPE-07 | HELIXOS-L2-010 | 「Decide」について、目的「裁定。要求の確認や技術の選定をPR化して決める」、発行「計画」、合流先「採用→Forward、不採用→記録して終了、方針変更→次の計画」を同じticketで確認できる。 | 不採用なのにForwardへ進める |
| HXT-TYPE-08 | HELIXOS-L2-010 | 「Backflow」について、目的「下流の結果（PoC・Prototypeの結果、要求の入力不足、下流で分かったこと）を要求へ戻す」、発行「PoC・Prototypeの後は計画、それ以外は突発」、合流先「要求エンジン（L2）」を同じticketで確認できる。 | Backflowを経ずに下流が要求を書き換える |
| HXT-TYPE-09 | HELIXOS-L2-010 | 「Reverse」について、目的「実装の事実から設計へ戻す。Scrum Reverseを含む」、発行「突発（設計と実装のずれ、同種finding再発、性能退行、障害等）と計画（Scrum Reverseのcheckpoint：sprint review前、release candidate合流前、public contract・DB schema・主要dependency・NFR budgetの変更時。旧`helix-harness-requirements_v1.3.md:94-102`）」、合流先「Forwardの該当層」を同じticketで確認できる。 | 必須checkpointを計画・実行せずにrelease-readyにする |
| HXT-TYPE-10 | HELIXOS-L2-009／HELIXOS-L2-010 | 「Recovery」について、目的「AIの逸脱・暴走・context切れから正常な地点へ戻す」、発行「突発」、合流先「中断していた工程」を同じticketで確認できる。 | 復旧で累積予算・未完義務や許可境界を失う |
| HXT-TYPE-11 | HELIXOS-L2-010 | 「Incident」について、目的「本番障害に緊急対応する」、発行「突発」、合流先「運用評価（L12）。恒久対策はReverse経由」を同じticketで確認できる。 | 緊急対応だけで恒久対策を完了にする |
| HXT-TYPE-12 | HELIXOS-L2-010 | 「Refactor」について、目的「振る舞いを変えずにコードの構造を直す」、発行「計画（範囲を入れれば事象からも発行可）」、合流先「Forward 小」を同じticketで確認できる。 | 振る舞いを変える修正をRefactorで閉じる |
| HXT-TYPE-13 | HELIXOS-L2-010 | 「Design-refactor」について、目的「外部の振る舞いを保って設計の構造を直す」、発行「計画（範囲を入れれば事象からも発行可）」、合流先「Forward」を同じticketで確認できる。 | 外部契約の変更をDesign-refactorで閉じる |
| HXT-TYPE-14 | HELIXOS-L2-010 | 「Performance-refactor」について、目的「設計を保って性能を上げる。測れない高速化は不可」、発行「計画（範囲を入れれば事象からも発行可）」、合流先「Forward」を同じticketで確認できる。 | 性能を測定せず高速化を完了にする |
| HXT-TYPE-15 | HELIXOS-L2-010 | 「Redesign」について、目的「外部の約束・要求・受入条件を変えて設計をやり直す」、発行「計画」、合流先「Forward（要求が変わるときはDecideを経る）」を同じticketで確認できる。 | 要求が変わるのにDecideを経ずForwardへ合流する |
| HXT-TYPE-16 | HELIXOS-L2-010 | 「Retrofit」について、目的「依存・基盤・構成の更新に合わせて段階的に移行する」、発行「計画（範囲を入れれば事象からも発行可）」、合流先「Forwardの該当層」を同じticketで確認できる。 | 段階移行の対象層へ戻らず全体を完了にする |
| HXT-TYPE-17 | HELIXOS-L2-010 | 「Research」について、目的「選定や比較のための参考ソースを集める。決定には関わらない」、発行「計画」、合流先「依頼元」を同じticketで確認できる。 | Researchで採否を決める |
| HXT-TYPE-18 | HELIXOS-L2-010 | 「Add-feature」について、目的「既存のものに機能を差分で追加する」、発行「計画」、合流先「Forwardの該当層」を同じticketで確認できる。 | 既存層の差分へ接続しない機能追加を完了にする |
| HXT-TYPE-19 | HELIXOS-L2-010 | 「Version-up」について、目的「後の版へ回した項目を保全し、時期が来たら取り込む」、発行「計画」、合流先「取り込み時にDecide→Add-feature」を同じticketで確認できる。 | 将来項目を消す／DecideなしにAdd-featureへ取り込む |
| HXT-TYPE-20 | HELIXOS-L2-010／HELIXOS-L2-005 | 「Experiment（案）」について、目的「LABOの比較実験。改善の候補を今の方式と比べるために、追加の実行が要るときだけ発行する。評価対象のticketとは別のticketにし、本線と別の予算と列で動かす」、発行「計画（LABOの比較実験の依頼をOSが登録）」、合流先「LABOの評価（結果はFeedbackとしてOSへ戻る）」を同じticketで確認できる。 | 観測だけでticketを増やす／評価作業の完了で対象ticketを閉じる |
| HXT-TYPE-21 | HELIXOS-L2-010／HELIXOS-L2-005 | 「Training（案、3.0）」について、目的「INTELLIGENCEのローカルLLMの学習・チューニング。LABOが利用区分を付けた材料だけを使う」、発行「計画（INTELLIGENCEの学習の案をOSが登録）」、合流先「LABOの評価→Decide」を同じticketで確認できる。 | 利用区分のない材料を学習に使う／3.0の案から今の実行許可を作る |
| HXT-FLOW-01 | HELIXOS-L2-010／HELIXOS-L2-002 | PoCとPrototypeの適用結果から、戻した要求revision・裁定・再合流先へ辿れる。 | 技術成立や画面試作だけでL3を凍結する／裁定なしに合流する。 |
| HXT-FLOW-02 | HELIXOS-L2-010／HELIXOS-L2-005 | Incidentの結果と、恒久対策のReverse・再合流先を区別して辿れる。 | 緊急対応の成功を恒久対策の成立に流用する。 |
| HXT-FLOW-03 | HELIXOS-L2-010 | 保全した項目から裁定と取り込み先へ辿れる。 | 保全した項目を消す／裁定と追加差分を切り離す。 |
| HXT-FLOW-04 | HELIXOS-L2-010 | Discoveryの出典、明らかにした範囲、発行元への戻しを確認できる。 | 発行元との接続を失う／DiscoveryをPoCと同一にする。 |
| HXT-FLOW-05 | HELIXOS-L2-010／HELIXOS-L2-011／HELIXOS-L2-008 | 下位の証拠、上位固有の義務、省略検査の回収を区別でき、構造を分類し直した後は新revisionに結び直される。 | 下位CI合格だけで上位完了／省略検査未回収／Unknownの影響を成立済みとして扱う。 |
| HXT-FLOW-06 | HELIXOS-L2-002／HELIXOS-L2-005／HELIXOS-L2-007 | 元の完了と追補評価、因果の証拠、改善候補の還流先を別に辿れる。 | 元の完了記録を書き換える／path一致だけで帰属させる。 |
| HXT-FLOW-07 | HELIXOS-L2-010／HELIXOS-L2-002 | findingと振り分け理由、返却先又は次ticketを同じ因果で追跡できる。 | finding破棄／次ticketのfindingを今のPRへ戻す／返却先欠落。 |
| HXT-FLOW-08 | HELIXOS-L2-010／HELIXOS-L2-005 | 評価対象、実験作業、結果とFeedbackの戻し先を混同せず辿れる。 | 実験の完了で対象ticketを閉じる／本線の予算・列へ混載する。 |
| HXT-FLOW-09 | HELIXOS-L2-010／HELIXOS-L2-005 | 3.0の版の印と案の状態を保って、材料の区分から評価・裁定まで辿れる。 | 案の登録を学習実行許可・採用・完了にする。 |
| HXT-SYS-01 | HELIXOS-L2-010／HELIXOS-L2-011／HELIXOS-L2-008／HELIXOS-L2-002 | 同じticketの親要求revisionから、HARNESS版、計画・配置の案、OSの適格性確認・発行、検収の計画・結果と投影まで追跡できる。 | BRAINに稼働判断を戻す／INTELLIGENCE・HARNESSがticket発行／PR mergeで完了／1.0で部品外の流れを生成する／開発方式をticketの種類にする／突発と計画を分けない。 |
| HXT-USE-01 | HELIXOS-L2-004／HELIXOS-L2-010 | CrawlerとBugbotが既存の種類・割当てへ接続し、WEB-OSのjobは内部OSの種類へ追加されず未決の扱いが明示される。 | botごとに種類を増やす／WEB-OSの未定のjobを内部OSで正式化する。 |

## HELIX自身の段階リリースの受入

対のL2の「HELIX自身の段階リリース」に対応する未実行の受入案。採否・実装許可・受入済みを生成しない。

| 親要求 | 成功条件 | 反例（不合格） |
|---|---|---|
| HELIXOS-L2-014 | ある段階（例：v0.1）について、使うパックと依存の版、設定・data形式、対応環境、できること・できないこと、受入の証拠、更新・切戻しの条件を一組で確かめられ、同じ一組から同じ稼働構成を再現できる。その段階で、限った範囲の仕事が要求の確認から結果の記録まで一周し、人が担う工程の分担が明記されている。その段階を使って次の段階を構築・検証し、乗り換えた後に問題があれば前の段階へ戻せ、案件の状態と記録が引き継がれる。段階は開発中のHELIX自身に依存せず起動・更新・復旧でき、段階の成立と1.0の到達判定が別の記録になっている。その段階で成立していない能力は「できないこと」として明記され、HELIXINFRASTRUCTURE-L1-023（1.0より後）がなくても段階リリースが成立する | ソースのtagだけを段階リリースとする／段階を別系統の簡易実装で作る／機能を薄く並べただけで一周しない構成を段階とする／案件の実data・秘密情報・資格情報を段階リリースへ含める／前の段階へ戻せない、または戻すと案件の状態を失う／未リリースの作業treeや次の段階がないと起動・復旧できない／安全の条件が欠けたままリリースする／段階の成立で1.0の到達を判定する、または段階が出たことを理由に最終の要求や品質条件を減らす／段階の識別子を外部公開の版番号として扱う／後の版の能力（HELIXINFRASTRUCTURE-L1-023等）の完成を段階リリースの成立の前提にする、または段階リリースを理由にその能力を前倒しする／成立していない能力を「できること」として扱う／対象製品のリリースとHELIX自身の段階リリースを混同する |


## HELIX-OS機能単位パックの受入候補（HELIXOS-L2-015〜025）

この節は[HELIX-OS L2の機能単位要求候補](../L2-requirements/governance-requirements.md)に対する未実行のL11案である。既存L2-001〜014に対する本書既存の受入条件は元のID・本文に残り、本節はそれを要約置換しない。結果は対象revision・実行者・根拠・使用したHARNESS契約版へ束縛する。文書の追加、登録、静的検証、PR mergeのいずれも要求採択・実装許可・利用者acceptanceを生成しない。`version_target`を契約版・成果物版と取り違えず、将来のパック実体では機能identity、契約/成果物/依存の各version、検証範囲、適用・収載set、互換範囲、更新/復旧先を別々に確認する。

### HELIXOS-L2-015 管理・authority記録の受入

- **入力・版**：異なる対象のConcept/L1/要求revision、判断record、原event、Issue/PR projectionを与える。対象と使った管理record schema revisionを固定する（1.0土台）。
- **成功条件**：各source identity・revision・digest・判断出所・責務を正本へ辿れる。projection上のclose/merge/greenを変えても要求authorityは変わらない。原eventを保持したまま別revisionの訂正・分類を追跡できる。
- **反例**：PRやmemoryだけから採否・承認を表示する、訂正で原eventを上書きする、wrong product/stale/digest不一致を現行正本として扱う。
- **失敗時・未完義務**：authority conflictやsource欠落が出た際、未解決stateを保ち正本または判断主体へ戻せる。

### HELIXOS-L2-016 Portfolio trace・状態の受入

- **入力・版**：二つ以上の対象projectについて、要求revision、関係する単体・接続・構成体、依存、実装差分、検証、提供・運用stateを与える（1.0対象）。
- **成功条件**：各要求から関係先へ辿れ、未接続・未合意・未実装・未検証・未提供・unknown・staleが個別に見える。単体と接続と構成体に別々の受入判定がある。提供stateがrelease-kanban上で記録される。
- **反例**：一つのproject/CI/PRを別対象や構成体の完了根拠にする。owner/依存/実差分の欠落を影響なしと見なす。CIやticket planだけでmerge/release readinessとする。
- **失敗時・未完義務**：不明な関係と検証をunknownで残し、対象要求や接続ownerへ差し戻す。再開時に未解決edge/stale理由を保持する。

### HELIXOS-L2-017 推進・ticket/workflowの受入

- **入力・版**：同一の承認済み入力とHARNESS契約を再投入し、対象や依存が異なるcaseを比較する（1.0）。部品外flowは4.0の境界として確認する。
- **成功条件**：同じ入力から対象・親revision・scope・依存・受入義務・戻し先を持つ同じticket候補が得られる。INTELLIGENCE案をHARNESS語彙、権限、budget、期限、依存に照らして適格性確認する。異なる対象はその差を保持する。1.0ではHARNESSの既定部品を規則どおり組合せ、途中結果から既定戻し先へ差し戻せる。
- **反例**：部品にないflowを1.0で生成する、案を無条件でticket化する、OSがHARNESS工程を再定義する、入力不明/依存未解決をready化する、全案件へ同一固定列を当てる。
- **失敗時・未完義務**：停止理由・元要求revision・未完義務・累積制約が残り、解決する入力または責務へ戻る。

### HELIXOS-L2-018 Worker割当・実行統制の受入

- **入力・版**：ticket、assignment、attempt、lane、Worker、モデルクラス水準、SECURITY制約、INFRASTRUCTURE資源、期限・予算・scopeを与える（1.0）。
- **成功条件**：各recordのexact bindingと成果/evidenceを辿れ、Workerから独立review担当へ仕事の意味と未完義務を渡せる。作成Workerが自分の成果を承認または独立review済みと扱わない。期限/lease失効後の交代で未完義務と累積制約を保つ。
- **反例**：二重claim/実行、期限・budget・失敗回数のreset、未評価Workerを評価済み扱い、SECURITY認可やINFRASTRUCTURE実環境の状態をOSが代替、作成Workerが自分の成果を承認する。
- **失敗時・未完義務**：scope/head/lease/capability/authority不一致で起動または継続を止め、停止を発生させた境界へ返す。途中成果は隔離し、handoffに未完義務を添える。

### HELIXOS-L2-019 Evidence・continuityの受入

- **入力・版**：要求・判断・作業・検証・手戻り・運用のevent、source revision、相関ID、actor、利用区分、checkpointを与える（1.0土台）。重複配送、stale pointer、crash/restartも含める。
- **成功条件**：provenanceと訂正履歴からepisodeを再構築し、欠落/重複/stale/拒否/未実行と成功を区別する。session/runtime交代後もbudget、期限、失敗回数、scope、未完義務を保持する。data-use classが用途ごとに辿れる。
- **反例**：記録件数を完了とする、provider memory/summaryだけから再開する、重複eventで同じ副作用を二重実行する、未許可dataを別projectや学習用途へ送る。
- **失敗時・未完義務**：保存またはprojection失敗で成功checkpointを公開しない。原eventから再構築し、足りないevidenceを発生元へ戻す。

### HELIXOS-L2-020 検収・CI運転の受入

- **入力・版**：HARNESS契約/義務、要求/pair/oracle、ticket、change set/base、実行環境を与える（1.0）。現行の新世代CI未構築条件を保つ。
- **成功条件**：必要profileが変更対象とHARNESS義務から導かれ、exact head・oracle・環境・run identityに束縛される。実行状態をsuccess/fail/denied/skipped/interrupted/staleに分け、隔離・回収・再開できる。計画側と実行側を別scopeで確認できる。
- **反例**：全案件に固定段数を強制する、HARNESS oracleをOSが足す/外す、必要検証を抜く、旧CI greenまたは別HEAD greenを使う、CI成功でmeaning review/acceptance/releaseを代替する。
- **失敗時・未完義務**：検証義務やrunnerが足りなければ未完状態でHARNESS契約・ticket・資源ownerへ返す。失敗を検査弱化で成功化せず、再開条件と義務を保持する。

### HELIXOS-L2-021 HARNESS構成版の対象project配布・更新・復旧の受入

- **入力・版**：選択するHARNESS構成版、必要安全依存、exact source/component set/artifact、要求revision、対象project、operation scopeを与える。対象projectへの選択構成の配布・更新・復旧を確認する。
- **成功条件**：HARNESSの各サービス①〜⑦について単体証拠を別々に確認できる。選んだ適格構成版と必要安全依存のみを対象projectへ導入でき、candidate/active構成版、artifact、対象、操作状態、rollback先を追跡できる。HELIXOS-L2-014が定めるHELIX自身（全機構パック）の段階稼働構成は、別のidentity・別判定として参照される。サービス提供版の配布成功をHELIX自身のstage release成立にしない。
- **反例**：個別配布に他の全6製品の完成を待たせる。あるサービスの成功で7製品全体を成立扱いする。HELIX自身のstage releaseを選択サービスの配布と同一視する。未指定品を収載する、異なるartifactへ切り替える、既存成果を無断で消す、無許可tag/publication/cutoverをする。
- **失敗時・未完義務**：source/互換/authority/適格性がunknownなら導入を停止してownerへ戻す。部分適用、途中成果、未完作業と復旧先を記録し、再開へ引き継ぐ。

### HELIXOS-L2-022 改善候補登録・還流の受入

- **入力・版**：対象revisionと適用scope付きの観測・失敗、LABO評価/提案/比較実験依頼、判断state、還流先候補を与える（1.0記録土台）。
- **成功条件**：観測→candidate→既存判断主体の採否→ticket→変更・検証→再観測を因果IDで辿れる。LABOの評価/退行判断とOS登録/振分けが別actor・別authorityとして記録される。
- **反例**：観測やLABO提案だけで要求/設計/authorityを書換える。OSがLABO評価を代行する。登録数だけで改善効果を主張する。L2-012/013の研究・横断診断をOS ownerへ戻す。
- **失敗時・未完義務**：評価・適用範囲・人判断・還流先が不足する場合、候補を未解決に保ち、該当するLABO/判断主体/要求ownerへ返す。棄却理由と再評価条件を保持する。

### HELIXOS-L2-023 管理→推進→Worker→検収の受渡しの受入

- **入力・版**：L2-015〜020の関係する正本、ticket、assignment/attempt、検証義務/結果、evidenceを使う（1.0、版付きinterface）。
- **成功条件**：handoffごとに対象revision/digest、因果ID、scope、未完義務、停止理由、evidenceの一致を確認する。unitごとの成功、handoffの成功、接続固有受入を別に確認する。
- **反例**：あるunitのsuccessだけで接続・次段受入・ticket完了にする。作成主体が独立reviewを兼ねる。推進が検収義務を変更する、または検収が要求やticketを発行する。
- **失敗時・未完義務**：受渡しの不一致でconnectionを未成立にし、発生側sourceまたは管理へ戻す。受信側が未完義務を受けた証拠が得られるまで元作業を完了にしない。

### HELIXOS-L2-024 HARNESS提供・運用→LABO→OSの受渡しの受入

- **入力・版**：L2-021の提供版と対象、許可scope、運用結果/data-use/evidence、LABO評価とFeedbackを使う。1.0で後続観測の受口を用意し、後続版能力は必須依存にしない。
- **成功条件**：提供、利用/運用観測、LABO評価、OS候補登録、判断、変更ticket、再検証を追跡する。対象projectと顧客/Web tenant、権限、データを分け、許可範囲だけを送る。
- **反例**：WEB-OSのtenant/job/credential/deploymentを本体OSの正本へ統合する。data-use不明/拒否を評価や学習に送る。提供完了を利用者受入や改善成功とする。
- **失敗時・未完義務**：利用許可、data class、対象revision、LABOの評価範囲が不一致なら送信・採用を止め、権限ownerまたはLABOへ戻す。未評価・未判断・再検証待ちを保持する。

### HELIXOS-L2-025 HELIX-OS統合運転の受入

- **入力・版**：採用済み対象revision、HARNESS構成版、L2-015〜024の該当identity/state/evidence、既存人間判断、停止条件を使う（1.0。後続2.0/3.0/4.0/5.0は前提にしない）。
- **成功条件**：HELIX自身と性質の異なる複数projectで、要求authorityからticket/Worker/検収/提供・運用/LABO評価/OS還流までのtraceを確認する。各unit・connection・composite固有条件を分けて評価する。1.0全体判定ではHARNESS 7製品の各単体成立、選択構成の接続、構成体の端から端の受入を確認する。
- **反例**：文書・機構の存在や単体passだけで全体を完成扱いする。unknown/stale/未許可/人判断待ちを隠す。7製品全体完成を個別の初期配布の前提にする。後続版能力を1.0の成功条件にする。HELIX-OSを外販製品と扱う。
- **失敗時・未完義務**：欠けたunit/connection/sourceへ戻し、構成体未完を維持する。未決authorityと残る義務を後続受入へ引き継ぐ。L1-011/012のLABO移管をOSへ戻さない。

### パック交換・更新・部分成功の横断受入

- **成功条件**：異なるpack identity、契約version、成果物version、依存version、verification scopeの組を与え、選択された正確な収載set・互換範囲と更新先/rollback先を確認する。契約versionまたは依存version更新では影響するconnectionだけをstale化し、必要なunit/connection/compositeの再検証へ辿る。互換範囲内の独立パックを交換した場合も、未完義務と元のsource traceを保つ。
- **反例**：単体成功をconnection/composite成功とする。部分更新を全体更新済みと表示する。契約・成果物・依存のversion不一致を互換とみなす。unknown impactをUnaffected扱いする。交換後に未完義務、変更前revision、rollback先が失われる。`version_target: 1.0`という印だけから実artifact versionやrelease資格を推定する。
- **戻し・引継ぎ**：不一致・部分失敗では交換/更新の成功を拒み、該当ownerへ戻す。旧版と新version候補、失敗理由、未完検証義務、復旧先を同じ対象scopeで保持する。

### 既存L2 IDの受入対応index

| 既存L2 ID | 新候補受入の参照先 | 追跡条件 |
|---|---|---|
| HELIXOS-L2-001 | 015／016／019／023／025 | 正本・判断source・revision・trace |
| HELIXOS-L2-002 | 016／019／021／023／024／025 | 要求から運用の欠落/stale/競合、release kanban |
| HELIXOS-L2-003 | 015／017／023 | 共通統制/product方式の分離と影響伝播 |
| HELIXOS-L2-004 | 018／019／023 | Worker割当・実行・回収と制約・独立review |
| HELIXOS-L2-005 | 022／024／025 | 観測、LABO評価、Feedback、ticket・再検証 |
| HELIXOS-L2-006 | 021／024／025 | 7製品の提供/更新/復旧と運用接続 |
| HELIXOS-L2-007 | 015／016／019／023／024 | 共通証拠・provenance・相関ID・data-use・stale |
| HELIXOS-L2-008 | 016／020／023／025 | HARNESS検証義務、CI隔離実行/再開、review/acceptance分離 |
| HELIXOS-L2-009 | 018／019／023／025 | 中断・交代時のscope/budget/期限/未完義務、重複防止 |
| HELIXOS-L2-010 | 017／018／020／023／025 | 管理・推進・検収・Worker責務とticket workflow |
| HELIXOS-L2-011 | 016／017／020／023／025 | 統合順/単位/検証計画と実候補/base更新 |
| HELIXOS-L2-012 | 対象外・LABO研究候補 | 技術調査のownerをOSへ戻さない |
| HELIXOS-L2-013 | 対象外・LABO横断診断候補 | 診断/効果評価のownerをOSへ戻さずINTELLIGENCE/SECURITY等との境界も保持 |
| HELIXOS-L2-014 | 016／024／025。021は対象project配布との接続だけを参照 | HELIX自身（全機構パック）の段階稼働構成と候補/稼働版・切戻し。021のHARNESS構成版配布とはidentity/判定を分ける |

012/013の行は移管案内という既存条件を対応表へ残すための参照であり、OSの候補要求・受入へ戻すものではない。L2-012/013の本文上の移管先と既存L11の該当箇所を合わせて確認する。

## 段階リリース範囲の要求導出（G8・未採択）

### HELIXOS-L2-026 段階リリース構成の要求導出の受入

HELIXOS-L2-026（unit：構成案と不足を返す導出能力）に対する未実行の受入候補。出力構成そのものの実行・復旧・運用受入は014の別判定に残す。不足付きの候補案を返す経路では、判明した不足・未立証を正確に記録して成立表示を拒むことを確認し、導出能力の確認を実構成の成立に読み替えない。要求revision、入力候補revision、HARNESS契約版、依存・安全依存の状態、目的・仕事範囲、許容分担、候補pack境界、導出結果を同じ対象へ束縛する。G1〜G7の候補や本受入の記述は要求採択・実装許可・段階成立・配布許可を生成しない。

- **入力**：一周させる仕事の目的・scope、要求identityとauthority/revision、候補pack境界、各候補の入力・出力・契約version・所有・依存・安全条件・検証範囲・互換範囲、後続版印、自己依存候補、人の工程と許容分担、環境・権限・更新/rollback条件を与える。比較基準とHARNESS-L2-010／011／022、HELIXOS-L2-014のexact revisionも固定する。
- **導出結果**：要求から導いたpack集合、依存と安全の閉包、収載・除外、単体/接続/構成体のidentityと境界、要求確認→作業→検証→記録の経路、適用版・設定/data形式・環境、検証証拠、できること/できないこと、人の分担、更新/復旧先、比較した代替構成、未解決不足と戻し先を同一条件から再確認できる。
- **成功条件**：目的・仕事範囲・許容分担・候補pack境界・適格性条件・比較基準を固定する。候補空間の根拠と比較範囲を示し、成立する代替構成との比較から最小性を説明できる。集合からpackを一つずつ除いた結果だけで全体最小としない。比較空間や探索根拠が不足する場合は「最小候補／未立証」と表示し、最小性を証明済みの選定結果として扱わない。依存閉包の成立可否、実行・受入証拠、最小性の立証が別々に記録され、未立証の最小性を既確認の依存閉包の否定へ読み替えていないことを確かめる。成立構成は非空で、必要な要求・契約・安全依存がすべて同じrevisionで閉じ、要求確認から結果記録までの仕事が一周する。明示的に除外した能力はできないことに現れる。各pack・connection・compositeは別々の入力/出力・依存・検証証拠を持ち、正常経路と失敗時の戻し先・未完義務・復旧先を辿れる。
- **反例**：空集合を成立扱いする。必要な安全依存を除外する。境界未決のpackを仮分割する。未知・欠落・conflict・stale依存を満たした扱いにする。候補の存在やIDを要求成立の証拠にする。人が担う検証工程が分担にない。後の版の能力を前提にする。起動・更新・復旧が未release treeや別段階を必要とする実行依存を残す。source traceの循環だけを理由に実行依存と判定する、または実行依存循環を見逃す。単体greenだけで接続/構成体を成立扱いする。できない能力を「できること」へ含める。代替構成を比較せず一つずつ除く比較だけで全体最小と断定する。対象製品のHARNESS配布、段階構成の採択、実装、受入、tag、外部配布を導出成功から発生させる。
- **失敗・戻し条件**：目的・scope・要求authority/revision不足はsource/要求ownerへ、境界や契約不明はpack owner/HARNESSへ、依存・安全条件不足は依存owner/SECURITYへ、資源・復旧不足はINFRASTRUCTUREへ戻す。検証不合格は該当要求または検収へ戻す。不足を記録し、未完義務と証拠を保持したまま構成成立を拒む。
- **通常反例対**：OS管理・Worker・HARNESS検証を含む仕事を、権限と隔離の安全依存込みで端から端まで組み、人が担う判断・操作等を明示した構成が通常例となる。許容された人が機能を代行する場合も依存契約と安全義務は残る。必要な検証を外したより小さい構成は同じ目的・条件・人分担を満たさないため不適格である。無関係な機構を追加した過大構成も比較基準の下で不適格となる。依存が未知で比較不能な場合はどちらも成立判定せず不足として残す。
- **状態分離**：要求導出結果、個別採択、段階構成の受入、実装完了、tag/外部配布の各状態が独立している。導出案またはこのL11の静的確認だけでは段階を成立・公開しない。

### HELIXOS-L2-027 未評価状態からの限定初回実行の受入（構成体候補）

- **PO起点**：[補強原文](../sources/body-reinforcement-po-original-2026-09-27.md)の第1点、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。旧受入条件RLO-AC-030は`LEGACY-ASSET-437A6A68F9A9E0AE1B9E`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:43`、SHA-256 `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707`で確認した。
- **入力・版**：開始前には要求/authority revision、ticket/taskとscope、SECURITY classification・許可状態、限定Worker/capability、INTELLIGENCE配置案または同契約の人代行案、LABO水準/明示的未評価状態、予算・期限・停止条件、HARNESS oracle/検証義務、人確認を同一attemptへ束縛する。OS/LABO/INTELLIGENCEの候補revisionと実契約版を区別する。OS-018/019/023の実行結果・record・handoffは開始後の受渡し証拠である。
- **正常例**：性能履歴がないWorker/modelでも、OS-027の低リスク適格条件6項すべての証拠と対象に有効な操作authorityが揃い、人が狭いtask/scope、Worker、予算、期限、停止条件、検証義務を確認する。配置案代行はINTELLIGENCE-L2-010のproposal契約revisionと必要task属性、evidence/未評価、scopeを持つ案を提出し、OSがsource・actor・入力revision・scopeを含むreceiptを残す。OS-L2-018がassignmentを作り、制約内で一度実行し、HARNESS義務に沿う検証結果と作成Workerとは異なるactorによる人確認をOS-L2-019へ記録する。OS-L2-023の受領結果を同一scopeのLABO観測へ渡し、HELIXOS-L2-027は構成参照としてreceiptに記録する。LABO-L2-055/054が未評価の結果を保持し、既存のINTELLIGENCE-L2-010→OS-L2-018三段経路へ戻す。初回成功だけなら「観測済み・未評価」のまま、適用範囲付きの評価証拠が揃えば当該task/model classだけを評価済みとしてINTELLIGENCE案→OS指定/割当に戻す。
- **評価済み化**：初回の一件が成功しても評価済みにしない。該当task/model classとscopeについて、採用する評価oracle/基準のrevision、判定条件、比較条件、結果・失敗/反例/unknownを含む根拠が特定され、そのoracleがこの範囲を判定できるとLABOが確認した場合に限り、LABO-055はその範囲に評価済み水準を付し、LABO-054で同じscopeのままINTELLIGENCEへ渡す。INTELLIGENCE-L2-010が配置案を返し、OSがauthority・scope・他条件を別途確認して割り当てる。INTELLIGENCE実装が未利用の場合、人の案はL2-010とL2-066の同じ入力/版/scope契約で作り、INTELLIGENCE出力と偽装せずOSへ返す。oracle/基準、適用scope、判定根拠のいずれかが提示されないなら未評価を維持し、新しい一律件数・score閾値は設けない。例として一件の成功しかなくoracleまたは比較根拠がない、task classが異なる、scope外、矛盾、staleなら未評価または評価不能を維持し、次の限定仕事も明示された人の配置案を使う。
- **反例**：未評価を評価済み/qualifiedへ書き換える。SECURITY classification、authority、安全条件、または開始に必須の入力がunknownなのに低リスクと推測する。性能水準が明示的に未評価というだけで、独立して許可済みの限定初回runを拒否する。評価oracle未提示なのに評価済みと表示する。Bench scoreだけでscope/branch/assignment/権限を変更する。人代行案の入力版・scope・actor・receiptがない。予算・期限・停止条件なしに繰り返す。初回成功を未知task全体へ外挿する。HARNESS検証を飛ばす、別HEAD/evidenceを使う、CI未構築をpassとする。LABOが配置・指定・割当を行う。
- **失敗・未完義務**：authority/classification、案receipt、assignment、実行記録、検証、人確認、LABO受領のどれかが欠落/不一致なら成功表示を拒み、所有者へ戻す。停止までの費用・attempt・部分成果・未完義務・再開条件を保持する。
- **状態分離**：実行許可、性能評価状態、配置案、OS assignment、検証、人確認、LABO観測受領、LABOによる適用範囲付き評価を別々に受け入れる。これらの候補記述は要求採択や実実行の許可を生成しない。

- **評価の実施証拠**：oracleの存在や判定可能性だけでは評価済みにしない。対象のtask/model class・scope・入力revisionへ実際にoracleを適用した結果と根拠、評価者、評価時点、判定receiptを残し、判定不能・不足なら未評価を維持する。評価済みは当該範囲の水準を評価した状態であり、すべての仕事の適性や成功を保証する状態ではない。

- **適格条件の正常例とoracle**：初回scopeを、許可された非secret・非HELIX-restrictedの分類済み入力を読み、隔離先の指定pathへ取り消せる成果物を生成する作業に限定する。credentialなし、networkなし（または006で明示許可された通信のみ）、必要制約の適用、操作ごとの有効authority、変更前状態/rollback先の確認を入力証拠とする。確認者はOS-027の6項の各証拠を照合し、全項成立した場合だけ適格と記録できることをoracleとする。単に「low risk」と書いた入力や資産のclass名だけを与えた入力は不十分である。適格でも他の開始条件が欠ければassignmentを出さない。
- **適格条件の独立反例**：正常例から一条件ずつ、未分類資産、secretまたはHELIX-restrictedの入出力、許可のないdata-use、credential利用、許可一覧外の送信/再送、隔離先不一致、未適用のWorker制約、期限切れ/別scopeの操作authority、復旧不能/不明な変更、release/tag/配布へ変える。どの場合も開始を拒否し、失敗した条件・証拠・owner・再開条件を記録する。分類・authority・適用証拠のunknown/missing/conflict/staleも一つずつ同様に確認する。生成物が事前分類/出力scopeを逸脱した場合は受渡しを停止して隔離/復旧し、成功受領にしない。人確認や性能履歴を加えても不成立条件を上書きしない。

### HELIXOS-L2-028 作業中支援の受渡し・範囲統制の受入（接続候補）

`HELIXOS-L2-028`はINTELLIGENCEの案とOSの実相談/返答/元Workerへの復帰をつなぐconnection候補である。単体案の生成はHELIXOS-L2-028の完了を前提とせず、HELIXOS-L2-028のhandoff成功だけで支援loop/compositeの成立にはしない。

- **入力・版**：元ticket/task/revision/scope、元Worker assignment/attempt、困難箇所、budget/期限/停止条件、HELIXINTELLIGENCE-L2-068 proposal、相談source/identity/revision/利用条件、必要なHARNESS-L2-022 oracle、SECURITY/INFRASTRUCTURE条件。`version_target: 1.0`は候補の版印。
- **正常例**：事前oracleが「amount <= configured maximumなら201・指定額を保存し、amount > maximumなら422・永続状態を変更しない」と定めるAPIの境界値テストで、`maximum+1`が誤って201となり状態が更新された。元Workerは失敗証拠をticketへ添付。INTELLIGENCEがAPI契約、関連validator code、同種failure例のうちscope内で使えるsourceだけ選び、「>と>=の境界根拠を確認し、拒否時の永続副作用も確認する」という限定相談案を作る。OSは別assignmentで相談を認可し、回答・source・scope receiptを記録して元Workerへ返す。元Workerがvalidatorを修正した後、既存HARNESS-L2-022 oracleに沿い、許可されたHELIXOS-L2-020経路で再検証する。
- **受渡しoracle**：consult request/responseとreturn handoffが同一ticket/revision/scopeに結びつき、response未着では解決済みにならず、元Workerへの再開入力に質問・回答・source revision・未完義務が含まれる。INTELLIGENCEの提案だけでconsult Workerを起動せず、OSの認可/assignment receiptがある場合にだけhandoffを成立とする。元Workerによる修正/検証/受入は別途HELIXOS-L2-029/HARNESS-L2-022で確認する。
- **誤りを含む例**：相談者が要求値を勝手に変え、`>`から`>=`へ閾値を変えるよう助言する。OSはscope/authority外の指示を元Workerの実装命令に昇格させず、requirement意味と異なる場合はHARNESS/ownerへBackflowする。また、回答未着、選択sourceがrestricted/stale、budget超過、停止条件成立なら成功handoff/安全再開を主張しない。
- **未見例**：類似failureのない別endpointで同じようなvalidation不具合が出たが、拒否時に状態変更が禁止か、既存のどのoracleが適用するか不明。INTELLIGENCEはgeneric ruleを作らず必要な要求/oracle ownerと不足情報を返す。OSは相談完了を強制せず、適切なowner回答と必要な契約revisionが揃うまでholdする。
- **失敗・未完義務**：source/相談案、OS認可、response、元Workerへのhandoffのreceiptのいずれかが欠ければ接続は未成立。元ticket/attempt、cost、停止理由、未完義務、再開条件をHELIXOS-L2-019で保持する。支援者は独立reviewerではなく、実行した相談の回数は固定上限でなく既存assignment budget/期限/停止条件へ従う。

### HELIXOS-L2-029 Worker支援から検証・再作業までの受入（composite候補）

この受入候補は、HELIXINTELLIGENCE-L2-068単体、HELIXOS-L2-028 connection、HELIXOS-L2-029 compositeの別成立を確認する。HARNESS-L2-022が契約するoracle/段階状態を使い、HELIXOS-L2-020は実行運転だけを担う。candidateや新世代CIの存在から実測成功を作らない。

- **入力・版**：承認済み要求/設計revision、元ticket/scope、同一元Worker/model設定、開始前に参照するHARNESS-L2-022 API/oracle/pair契約、支援source、INTELLIGENCE proposal、OS handoff/assignment/budget/期限。実行・独立review evidenceはcomposite開始条件ではなく、各段階で発生後に結果として照合する。失敗証拠とHELIXOS-L2-028 consultation receiptは、作業中に詰まり診断と実相談を選んだrunだけに必要。`version_target: 1.0`は採択/段階収載を決めない。
- **正常例（作業前のtest/指示準備から元Workerへ戻す一周、相談なし）**：Worker assignmentは確定しているが実装開始前のtaskを受け取る。INTELLIGENCEは承認済み要求、設計、HARNESS-L2-022の既存oracleを読み、正常/境界/拒否条件のtest candidateと実装指示を元source revisionへ結んで準備する。OSが同じ軽量Worker設定でticketを開始し、元Workerが実装する。相談やHELIXOS-L2-028 receiptは発生しない。test候補作成者とは別の独立reviewerが差分とoracle適合を確認し、findingsがあれば元Workerへ返して同じ軽量Worker設定で修正・再検証する。HELIXOS-L2-020経路の許可された実行後、事前oracleにより結果を照合し、HARNESS段階契約の証拠を残す。oracleはtest/instructionが作業前に準備されても相談なしにこの一周を進められ、test resultと支援candidateが同一scope/revisionへ結ばれ、支援者が独立reviewer扱いされないことである。
- **正常例（作業中の相談あり）**：`PATCH /applications/{id}`の既存受入oracleは、`draft`時の有効な変更を受け入れ、`approved`時の変更を拒否し永続値を変えない。失敗証拠はapproved itemでPATCHが200を返したこと。INTELLIGENCEは既存state-transition design、endpoint authorization/code、過去の同型failure exampleのうち適用条件を確認できるものを選び、「状態、編集permission、拒否status、更新副作用」の不足だけを限定相談する。HELIXOS-L2-028はsource/返答receiptを同scopeで返す。元Workerが修正し、HELIXOS-L2-020がHARNESS-L2-022に束縛された検証を実行する。oracleは`draft + authorized change → accepted and persisted`、`approved + edit → forbidden response and no persisted mutation`、`unrelated field/state remains unchanged`をそれぞれ判定する。独立reviewer（元Worker、INTの支援者/助言者とは別identity/context/authority）が同じrequirement/oracle/current resultを確認する。これらが満たされ、HARNESS段階条件の証拠が揃う場合だけ当該段階をVerified候補とし、Acceptedは別途L11利用者受入receiptを要する。初回失敗後も既存budget/期限/停止条件内ならfindingを元Workerへ返し修正を再検証できる。
- **両経路に共通する修正後の独立review**：相談なし／ありのいずれでも、元Workerの修正で成果物HEADが変われば、修正前HEADのreview receiptを最終判定へ流用しない。修正後current exact HEAD・base・task scopeとHARNESS-L2-022に照合した最新resultを束縛し、元Workerおよび支援／test候補作成／相談を担当した者とは別の独立reviewerが再確認したreceiptを要する。そのHEADの未解消findingが0件の場合にだけreview条件を満たす。再指摘は既存assignmentのbudget・期限・停止条件内で元Workerへ返し、修正・検証・独立reviewを続ける。停止時は未完義務を保持する。例えばHEAD-Aのreview後にHEAD-Bへ修正した入力では、AのreceiptだけではBのreview条件は未成立となる。OSはこの証拠を受領・束縛するだけでverdictを生成せず、review条件成立だけでHARNESSの他の段階条件や利用者受入を代替しない。
- **誤りを含む例**：支援助言がapproved状態で編集可能に要件を変える、test helperが誤って200を期待する、consultantのtest作成/助言をindependent review receiptへ再利用する、古い成功結果をcurrent HEADへ結びつける、またはCI greenだけでL11 Acceptedとする。いずれも該当oracle/authority/identity違反としてVerified/Acceptedを拒み、意味変更は上流へ戻す。
- **未見例**：別endpointで同じapproved-edit制約が現れるが、既存oracleのapplicabilityが不明。INTELLIGENCEは類似性だけで規則を適用せず、設計/requirement ownerへ不足を返す。scope/oracleの適用が解決するまでは検証計画candidateに留め、OSは実装成功や再開可能を主張しない。
- **構成体受入**：HELIXINTELLIGENCE-L2-068の事前test/指示候補→元Workerの差分（作業中consultが必要な場合のみHELIXOS-L2-028の実相談/回答receiptを追加）→HARNESS-L2-022へtraceしたtest/oracle結果→支援者から独立したreview→失敗時の元Worker handoff/再検証または予算停止で未完、の因果順を確認する。単体proposalやhandoffだけ、あるいは下位unitの成功だけではHELIXOS-L2-029の一周を合格にしない。予算/期限が尽きた場合はその時点のattempt/result/finding/cost/未完義務を保持し、成功とせず終了可能であることを確認する。

### HELIXOS-L2-030 HARNESS package生成・consumer検証・段階配布の受入候補

本節は旧`HR-AC-HYB-008-01..09`を個別oracleへ保持する、未実行のL11候補である。正常・反例・未見は制御fixtureで確認し、実配布、tag、release、remote syncを実行しない。L2-030の候補`version_target: 1.0`は採択済みHELIXOS-L2-021の1.0配布運転境界を参照する能力目標であり、L2-030の採択、v0.1収載、公開版、実行許可を意味しない。旧Node／CLI／PowerShell、旧repository/profile、旧channel enumはoracleの実装要件にしない。

| 旧受入条件 | 正常例と期待oracle | 反例と期待oracle | 未見例と期待oracle |
|---|---|---|---|
| `HR-AC-HYB-008-01` manifest exact set／digest／version | あるsource HEAD、requirements digest、選択能力setからmanifest／artifactを生成し、include／exclude一覧、generated index、version、file digestがその入力と一致する。2回の同一入力生成物は同じartifact digestとなる | 未宣言file混入、同じpathの重複、source／requirements／artifact digestまたはversion不一致を1つずつ注入し、そのcaseを不適格にして昇格を拒否 | 既知fixtureにない隠しfileまたはpath正規化の別表記を追加し、manifest外要素として検出する。既知例だけのallowlistで見逃さない |
| `HR-AC-HYB-008-02` dogfood／state／sensitive混入 | dogfood除外集合を適用しつつ、明示されたconsumer-safe schema／method／adapter templateを含め、consumer doctor／gateの必要契約が失われない | project固有PLAN／design／test evidence、`harness.db`、`.helix` runtime state／memory、credential、PII、absolute machine path、development-only audit／handoverをartifactへ1種ずつ混入し、該当artifactを拒否する | fixtureにないconsumer dataや開発専用stateを別名・nested pathで入れても除外対象として拒否する。単に文字列秘密検出を通ったことを安全合格にしない |
| `HR-AC-HYB-008-03` clean／existing／monorepo非破壊setup | clean、既存、monorepoの三種fixtureでsetupを二度適用する。manifestで宣言したmanaged marker内は決定的に一致し、marker外／standalone fileを含むconsumer-owned file、`src`、`docs`、test、Git history、consumer-owned evidence bytesは前後一致する | marker外file／行を書換える、consumer fileを削除する、setup再実行で二重追記するmutationを与え、いずれも拒否してconsumer bytesを保持する | 新しいmanaged marker下の既存内容と並行変更されたconsumer-owned `.helix` evidence、およびmarker外のstandalone生成候補を与える。marker外fileを暗黙のpackage所有物とせず、所有境界を特定できない場合は適用を保留する |
| `HR-AC-HYB-008-04` 同梱文書・権利・provenance | READMEのinstall/setup/status/doctor/workflow/upgrade/rollback/uninstall案内と、現行LICENSE・third-party attribution・provenance・免責およびproject adapter・proxy／CA／mirror・support／security境界の案内がmanifest／権利根拠と整合する場合だけpublish candidateとなる | README、LICENSE、第三者帰属、provenance、免責または案内の各項目が欠落／stale／manifest不一致のcaseでpublish candidateを拒否し、欠落文書を推測で補わない | 新しいthird-party assetまたは権利条件が対象に加わるcaseで、旧fixtureの一覧だけで通さず、根拠が未確認ならunknownとして保留する。旧商用候補の文言を現行権利とみなさない |
| `HR-AC-HYB-008-05` clean Linux consumerの価値確認 | clean Linux fresh processでinstall→setup→status→consumer doctor→minimal delegated workflow dry-runを実施し、各段の出力が選択artifact／source revisionに相関し、consumerが基本利用可能と確認できる | doctorまたはminimal workflowが失敗・未解決command・artifact mismatchとなるcaseをgreenにせず、欠けたconsumer能力を記録する | fixtureで未使用のclean Linux setupや、宣言されていないcredential/network要求を入力し、許可・仕様がなければ実行成功を推定しない。旧`helix` CLIの存在を合格条件にしない |
| `HR-AC-HYB-008-06` Windows compatibility | 同一のsource／artifact identityから宣言されたWindows consumer surfaceで利用手順を確認し、Linux側と同じpackage機能、version、provenanceを追跡する。entry実装方式は現行L3で導出する | Windows向けに別artifactへ再build・手編集しdigestが分かれる、または入口の不足でsetup/status/doctorが利用できないcaseを不合格にする | 宣言済みmatrix外のWindows環境では互換性を推定せず未確認にする。Node／PowerShellという旧方式の一致だけで互換成功としない |
| `HR-AC-HYB-008-07` 同一artifactの段階promotion | package semver／immutable tagとsource HEAD／artifact digestの対応を確かめ、3つの順序付きfixture stageを旧受入のテスト名`canary → preview → stable`で識別する（fixture labelであり、現行release channel名の採択ではない）。各stageのentry criteria、観測window、stop／rollback trigger、promotion receiptが対象revisionに束縛され、受領receiptのsource HEAD、manifest、artifact digestが三段すべて同一であることを確認する。現行のstage契約が未確定ならこの旧test labelからproduction channelを生成しない | stageを飛ばす、同一stage内でrebuild artifactへ差替える、manifestを手編集するcaseを与え、promotionを拒否する | stage順序のskip、entry条件／観測window／stop triggerの欠落・stale、receipt不一致を拒否する。fixtureにないstage名や適格条件は旧test labelから採用せず、現行channel契約の入力不足として返す |
| `HR-AC-HYB-008-08` rollbackとconsumer保持 | dry-run diff、backup、restore rehearsal、consumer canary、post-promotion monitoringの証拠と、適格な直前immutable tag／artifact／構成版への復旧先を使ったfixtureでpackage pinとmanaged projectionだけを復旧し、consumer-owned bytes／data／evidenceを変更しない。復旧前後のidentityと結果をOS-L2-007へ残す | 直前版が不適格、復旧先不一致、dry-run diff／backup／restore rehearsal／canary／monitoring証拠の個別欠落、consumer file削除、rollback後digest mismatchを1つずつ与え、rollback完了を記録しない | rollback中の並行consumer変更または未知の所有pathを追加し、上書きせず状態・未完義務を保持して停止する。backup／復旧証拠がないのに復旧成功としない |
| `HR-AC-HYB-008-09` operation authority | local plan/build/dry-run/smokeとremote sync/tag/publish/promotion/cutoverを分ける。外部作用のactor/tool/target/operation/params/revision/scope/期限/復旧先/monitoringが現行SECURITY権限へ完全一致する場合だけ許可し、既存の有効なstanding authorityを再利用する | authority不在、期限切れ、target／params／artifact／scope driftの各caseでremote作用を拒否し、package passやIssue/PR存在を許可に使わない。既決権限の一致中に重複approveを求めない | 新しい操作・target・外部境界を与え、既存の有効なscopeに合致しない場合は不足として拒否／保留する。通常の可逆planにrelease承認を誤って要求しない |

**全体判定**：9項目のそれぞれで正常oracleと独立反例が成立し、該当する未見条件を未確認または停止として残したときだけ、このpackage受入候補をpassとする。manifestの一致だけ、単一環境の成功だけ、consumer利用だけ、stage単体だけ、security authorityだけでは9項目を代用しない。HELIXOS-L2-021の対象project配布受入、HARNESS-L2-006／017の提供・Release Port契約、HELIXOS-L2-014のHELIX自身段階リリースはそれぞれ別のidentityで受け入れる。

**旧資産との差分**：旧§4.6.1のHR-AC-HYB-008-01..09の行先を独立した受入行へ示した。技術方式・target・channelの未処分条件は原文と判断事項へ保持し、9件の移管完了を主張しない。Linux/Windowsでconsumer価値を確認する条件、同一artifact・非破壊適用・manifest・文書・rollback・approval boundaryは保持する。Node／CLI／PowerShell、旧distribution repository/profile、古いchannel enumは採択済み実装・対象として継承しない。利用可能な同一consumer価値を現行の対応環境と提供契約で検証する。

### HELIXOS-L2-031 CI性能計測・改善回収の受入候補

未実行の候補。性能の合格値・CI実装・merge許可を本fixtureから生成しない。

- **正常**：同一ticket/source/base HEAD・必須検証集合digestを持つ、正しさ成立かつ適用性能予算超過のrunを入力する。環境/runner/cache/区間計測、母集団・期間・p50/p95、原因と同episodeの改善義務を返す。修正後の独立review、同条件の再検証、必須検証集合の非縮退と安全指標の証拠を確認し、正しさと性能を別状態のまま回収する。
- **計測欠落の反例**：HEAD、環境、cache、開始/終了時刻、exit code、output digest、区間duration、母集団/期間/除外理由、予算根拠、改善前後の値をそれぞれ欠落・stale・異なるscopeへ変える。比較不能または未完を返し、0や前回値で達成扱いにしない。内部CIのreceiptのみで別環境のGitHub側も速いと主張する例を拒否する。
- **弱化の反例**：必須検証を削る、oracle閾値を緩める、timeoutを延ばして超過を隠す、外部CIへ先送りする、escaped defectやmutation detection/flakeの悪化を隠す例で改善完了を拒否する。速いが正しさ未達のrunも品質成立にしない。
- **回収の反例**：性能だけ未達のrunをcorrectness failureへ丸める、correctness greenを性能達成へ変える、別episode/HEADのreviewを転用する、修正・独立review・再検証なしでRecoveryを閉じる例を拒否する。merge可否は既存契約へ渡し、この判定で許可や禁止を追加しない。
- **未見**：初見のrunner/cache/toolchainや検査集合で以前のp95を流用せず、測定条件と適用予算を未確定として返す。60秒/3分の旧候補を新環境へ無条件適用しない一方、根拠なく廃止・緩和もしない。必要な意味判断とL3計測具体化を分けて戻す。
- **既決工程の保持**：ticketが必要義務を決める例で固定nightly/full回収を再要求しない。後で発見した失敗はLABO評価とHARNESS契約改善の経路へ返す。単に夜間補完をしないことを未完義務の消去理由にしない。

- **最適化・回収の反例**：exclusive stateをlease/fenceなしに並列実行する、異なるHEAD/lockfile/toolchain/platformのartifactを再利用する、stale telemetryで計画を確定する、cancelした未開始jobをsuccessにする、同一義務の再実行を二重回収に数える例を拒否する。安全な既定DAGに必要義務が揃う場合のみfallbackし、計画自体が不明なら停止/未完とする。後段failureから元selector/edge/oracleへの因果traceが欠落した改善候補は根拠不足を保持する。

### HELIXOS-L2-032 Known failureの限定quarantine

**照合する旧条件**：旧asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:119`、SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`（行SHA `6d870c3962afee8d65d8da733500a313e7fd72892dfe8f502733e86e67c6e70f`）、旧`HAC-HIL-06c`。06全体の固定三段CIは対象外。原条件はexact known failureのみ、check名+fingerprint+policy baseline SHA、理由/remediation issue/owner/期限またはiteration上限/代替minimum gateを要求し、fingerprint変更を通常failureへ戻す。

- **入力・境界fixture**：既存policyが登録したcheck identity・明示version・fingerprint・baseline SHA/tree・reason・remediation ticket/owner・期限/上限・minimum gateを用意する。別fieldのcurrent runにはcurrent exact HEAD/tree、対象scope、actual check/version、actual fingerprint、HARNESS義務/oracleとその結果を与える。baselineとcurrent HEADを同じ値に固定しない。OSはrun receiptで両方を独立して結び、policyの明示適用scopeにcurrent runが含まれるかを判定する。version compatibilityが宣言されない限り別check versionを適合扱いしない。
- **正常例**：policyに登録された正確なbaseline、check/version、fingerprintと一致し、そのpolicyの明示scope内にcurrent runがある。期限内、是正ticket/owner、代替minimum gateも揃い、minimum gateが選択済みHARNESS義務をすべて満たす。OSは限定`eligible` receiptを記録する。元のfailureは未解決known failureとして残り、CI全体/検証義務をgreenにしない。
- **誤りの例**：①same check nameだがfingerprintが変わった、②policy baseline SHA/treeの不一致、③current runのHEAD/treeがreceiptから脱落またはpolicy scope外、④未宣言のcheck versionを互換と推定、⑤expiry切れ、iteration上限超過、期限/上限の両方欠落、reason・owner・remediation ticketの各欠落、alternative gateなし、⑥alternative gateがHARNESS required oracleを省略、⑦wildcard policy、⑧policy provenance不明。各々をquarantine不適格またはstale/通常failureとし、後続段の成功・merge/releaseを生成しない。
- **未見例**：未fixtureのcheck versionまたはfingerprintを提示する。fingerprintの変更は常に通常failureへ戻す。check versionは明示的なpolicy compatibilityとscopeがなければ既知版と推測せず、quarantineを適用しない。通常のrunが存在するだけで全ての未fixture checkを禁止するのではなく、該当checkのfailureを通常failure/評価待ちとして返す。
- **依存と状態区分**：HARNESS-L2-005の選択義務/oracleとOS-L2-007のprovenance保持を常に維持する。policy create/change/apply時は既存HELIXSECURITY-L2-008の対象scopeに限るauthorityを照合し、有効な既決authorityを再利用する。実CI運転はHELIXOS-L2-020で実行・回収する。条件を満たす場合も `quarantine eligible` はcheck単位の例外適用判断であり、failure解消、test pass、profile successではない。
- **受入判定**：normal/negative/unseen各fixtureで、policy baselineとcurrent HEADの別束縛、check identity・fingerprintのexact一致とcheck versionのexact一致または明示compatibility、期限・是正・minimum-gate、対象scope、戻し先を同じreceiptから追える。HARNESS義務を落としたfixtureを合格にしない。

### HELIXOS-L2-033 Versioned engine/detector registryと同一snapshot replay

**照合する旧条件**：旧asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:115–116`、SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`（行SHA :115 `c28b208b2be946d06c8b068c1e7ae13123e68be2630864af5a2f586edc4601d9`、:116 `5b18e75312a53e0f2b848393592508360a27b9918e18dd64201e1da8de209b18`）。補助条件`HR-FR-HIL-10`, `HAC-HIL-10a/b/c`, `HAT-HIL-10`。OSの責務はregistry登録と実行証拠であり、engine/detector機能の所有・意味判定ではない。

- **能力・所有境界fixture**：scopeに選ばれたengine capability（build、agent metadata、assignment、schedule、trace、impact等）それぞれのidentity/version/config/ownerを登録する。scopeの選択detectorはspec、schema、trace、consistency、file、metadata各種についてengineと別identity/version/config/ownerを持つ。ひとつのOS registry/run recordへまとめてowner/authorityを失わせない。機能実装やfindingの正しさをOSが決めず、OS-L2-020を既存の実行executorとして使う。
- **正常例**：選択scopeに宣言された全engine/detectorを、完全に同じsource/input snapshot digest、registered version、config、target revisionで実行し、同じ組で独立rerunする。engine artifactには各run/artifact/digest/exit status、detector findingにはcode/severity/location/subject/evidence/version・dedupe keyを記録し、両種receiptからinput・version/config・output digest/fingerprint・ownerへ辿れる。rerunで同一結果ならそのscope/version/inputに限った再現証拠を返す。artifactとfindingのauthority/provenanceは分けて保持する。
- **誤りの例**：①unknown engine/detector versionを互換推測する、②rerun時のsnapshot/version/configが違う、③選択scopeの一部engine/detectorだけをrerunして全体再現とする、④engine artifactとdetector findingを同一result/ownerに潰す、⑤finding code/severity/location/subject/evidence/versionのいずれかを欠落させる、⑥run/artifact/findingのprovenance欠落、dedupeによる原run/evidence喪失またはartifact output digest/finding fingerprint欠落、⑦partial/failed runを再現成功にする、⑧同一入力rerunが異なるdigest/fingerprintなのに差異を消す。差異は未完/隔離として残し、成功receiptにしない。
- **未見例**：scopeに新しいengine/detector versionまたはsource/schemaを追加する。登録された互換範囲・owner・config・provenanceが明示されていなければ結果を既存scopeへ併合せず、当該追加分を未確認/未評価で保留する。未評価の追加分がある間、既選択scopeの他capabilityに関する証拠は捨てず、scope全体の再現成功も宣言しない。
- **依存と状態区分**：registry identity/version/configと選択scope、HARNESS-L2-005の義務/oracle、OS-L2-007のevidence/provenanceを維持する。実行/再実行時はOS-L2-020の隔離・run state・回収条件、実行に適用される既存HELIXSECURITY-L2-008 authorityとINFRASTRUCTURE資源条件を照合する。未選択capabilityのrunを一律要求しないが、選択scopeに登録されたcapabilityは部分集合だけで全件受入しない。
- **受入判定**：engine群とdetector群を区別したscope表、登録版/config、入力snapshot、初回run/re-runの対応、全選択capabilityの完了状態、artifact/finding証拠、差異・未完義務・戻し先が揃う。正常fixtureは再現のscope限定を保ち、negativeはunknown/mismatch/partial/differenceを隠さず拒否し、unseenは未評価を合格へ補完しない。

**候補間の接続境界**

HELIXOS-L2-032は選択済み検証profileのknown failureに対する限定eligibilityを扱う。HELIXOS-L2-033は選択scope内のengine/detector登録と再現証拠を扱う。HELIXOS-L2-020は実行・隔離・回収を行う。HARNESS-L2-005は検証義務とoracleを決める。032/033のresult receiptを当該能力の実行開始入力として要求しない。HARNESS契約をOSが発行したり、OSのquarantine/replay receiptだけでHARNESS受入を完了させたりしない。

### HELIXOS-L2-034 原指示・finding disposition証拠と異議履歴

**対象と基準**

対象能力はHELIXOS-L2-034候補「原指示・finding disposition証拠と異議履歴」。親はHELIXOS-L1-001／002／008、既存境界はHELIXOS-L2-015／019。契約版・対象revision・入力source・利用許可をfixtureごとに固定する。旧sourceは`LEGACY-ASSET-A60CF91DD2AF6693E6F9` `requirements.json#/HIL-BR-07`と`LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `infinity-loop-platform-requirements.md:126`（source SHA・完全pathは対応するL2追補案）、受入先は`LEGACY-ASSET-AFE91778057B7E76BEEC` `L1-infinity-loop-operational-test-design.md:63`のHOT-HIL-36である。

fixture内のID・source textは合成値であり、普遍的なticket番号、閾値、schema、承認手続きを定義しない。今回の文書検証では実装・外部Issue操作を行わない。後段の現行実装に対する受入oracleをここで定め、旧runtime/test/CIの実行結果を代用しない。

**受入例**

| 種別 | 入力と期待結果 | 不合格または保留となる反例 |
|---|---|---|
| 正常・反例：分類前保存 | directive/Issue eventを分類する前にdurable原記録とreceiptを得る。保存失敗なら未完とし、原指示を回復できる既存経路へ戻す。 | 分類してから都合のよい指示だけ保存する、保存失敗を受付成功へ丸める、AIのnon-actionableだけで原記録をdropする。 |
| 正常：duplicate | 合成directive `D-17`の原event、source span、actor/time/revision/digestを固定する。生存ticket `T-42`と、`T-42`の受入oracleが同じ要求を含むsource-bound証拠を与える。duplicate dispositionが元event・target・oracle証拠へ結ばれ、原eventが不変である。 | targetなし、閉じた/失効したtargetのみ、oracle包含根拠なし、digest違いをduplicate確定する。単なる文面類似やIssue番号一致で統合する。 |
| 正常：false-positive | 合成finding `F-8`とその元evidenceに対し、findingを覆す独立source・対象revision・反証内容を与える。独立reviewのreceiptを結び、反証がdisposition authorの判断だけに依存せず記録され、後からsourceとscopeを辿れる。 | 元finding/evidenceを保持しない、根拠が同じ主張の言い換えだけ、反証source不明/stale、あるいは独立根拠がないままfalse-positiveをterminalにする。 |
| 正常：directiveのcancel/supersede・accepted-risk | 合成user directive `D-21`に対応する既存PO decision receipt（既存の有効authority、対象revision/scope、理由）を入力する。OSはそれを原eventへ結び付け、supersession chainを追跡する。 | AIのみの不要判断、PR/Issue close、CI green、古い/別scopeのPO receiptを用いてcancel/supersede/accepted-riskを確定する。必要receiptなしなら保留する。 |
| 正常：appeal/reopen | 先行disposition receiptと、同じ対象に対する新しいchallenge理由・evidenceを与える。新しい履歴が先行receiptを参照し、原event・先行判断・新判断を全て辿れる。 | appealを先行eventの上書き/削除として記録する、異議経路を失う、または単なるPR更新で再open済みと表示する。異議を受ける経路が欠けるdispositionを終端とする。 |
| 正常：ticket closure / projection分離 | local ticketの既存closure receiptがないまま協調projection Issueだけcloseしたfixtureを与える。Issueのprojected stateを記録しつつ、原directive/local ticketは未完として保ち、不一致を戻し先へ示す。既存closure receiptがあるfixtureでは、そのexact ticket/revisionに束縛した完了記録を参照する。 | Issue closeをticket cancel/completeへ昇格する、closure receiptなしにticketをcloseする、または既存ticketのclosure条件を本候補が独自に置換する。 |
| 未見：未知disposition | fixtureにない新しいdispositionラベル、対象revision不明、またはsource authority不明を渡す。原eventは保持し、既存authorityが解決するまで非終端/unknownとし、理由と戻し先を示す。 | 未知分類を自動cancel/dropへ写す、別authorityを推測して終端化する、または未選択sourceを調べた扱いにする。 |

**既存契約との境界**

- HELIXOS-L2-015の受入（`governance-acceptance.md:324–330`）が要求するsource identity/revision/digest/判断出所の追跡、projection close/merge/greenからauthorityを生成しないこと、原eventを保持した訂正追跡は前提として維持する。
- HELIXOS-L2-019の受入（同`:352–357`）が要求するprovenance/訂正履歴、重複・stale・拒否・未実行と成功の区別、再構築とcheckpoint失敗時の未完扱いを維持する。
- GitHub運用モデル `docs/governance/github-upstream-operating-model.md:63–72`（SHA-256 `1cb8ed88d4f0e65b37674f692d5fe391c7c5c4b3f482e60c86e160609a8c46a1`）ではFeature Ticketがlocal work authorityでIssueは協調projectionである。Issue Form失敗時のprojection Issue closeは原eventを保持したうえの表示整理で、ticketのcancel/closureではない。この境界を反転させない。
- HARNESSが持つticket/要求の完了条件や既存POの判断authorityをこのL11で作り直さない。明示したPO receiptは既存authorityが発行したものの参照であり、すべてのdispositionに対する人間確認手続きを追加しない。
- 条件付き/操作時依存：duplicateのtarget+包含oracle、false-positiveの独立反証、directiveのaccepted-riskと各出所のcancel/supersedeの適用可能な既存PO receipt、findingのfalse-positive/accepted-riskの証拠付き独立review、challenge/reopenの先行receipt+新根拠は、それぞれ該当操作でのみ必須。選択sourceのrevision/digest/利用許可は、そのsourceを根拠として使う操作で必須。未選択sourceには依存しない。
- 失敗または未完の場合、対象event・未完義務・停止理由を保持し、既存source owner/要求owner/判断authorityへ戻す。Issue/PR表示状態だけで要求状態を更新しない。

**対応する現行L1/L2/判断**

- L1固定本文：`docs/helix-os/L1-planning/system-intent.md`、SHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`、HELIXOS-L1-001／002／008。
- 既存L2：`docs/helix-os/L2-requirements/governance-requirements.md`、SHA-256 `077e353d962230943c66a30fba1bd778b5efc40b5506d89b71d4f343b1430559`、HELIXOS-L2-015 `:642–650`、HELIXOS-L2-019 `:682–690`。
- 既存L11：`docs/helix-os/L11-acceptance/governance-acceptance.md`、SHA-256 `b1dc0b9fd92de8169b74fbe0072c35bd815da3a36d5c8df8ac60a05df8e6ac13`、015 `:324–330`、019 `:352–357`。
- 2026-09-28 OS PO判断 `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md`（SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`）では候補014–029を採用し旧source holdingを維持、旧sourceの被覆完了・retire・holding解除は導かない（56–59行）。034候補は同決定の明示集合外であり、本文追補案そのものは採択・実装許可を意味しない。

照合した現行本文の固定commit：`2197a4bc405d37f133bac4d5e96809c5afec58c1`。旧L1のBR-07は59行、FR-36は126行、旧運転受入HOT-HIL-36は63行。旧原文のIssue語を現行の原event/local ticketと協調projectionへ分離して再導出し、原指示の意味上の取消権限を緩めない。

**findingのリスク受容：正常・反例**：review findingに、対象revision/scope、根拠、残るrisk、独立review receiptとappeal経路を与える。上流意味の変更がなければPO receiptを一律追加せず、accepted-riskの非終端記録を原findingへ結ぶ。独立reviewなしにリスク受容する、directiveのPO要件を流用して通常findingのaccepted-riskを止める、review済みを理由に原記録を削除/不可視化/終端化する、appeal経路を失う場合は不合格。上流意味を変える場合は人の既存判断へ戻す。出所の種別が不明なら推測せず確認先へ返す。

**原文追補**：旧L1 `infinity-loop-platform-requirements.md:99,201`（HIL-FR-09/NFR-21、L2と同じasset/SHA）により、findingの証拠付き非終端dispositionと独立reviewを保持する。current_pr_fix/successor_issueの分類全体をこの受入だけで閉じない。

### HELIXOS-L2-035 対応L11受入候補

**対応要求・状態**：HELIXOS-L2-035（OS単体unit、`version_target: 1.0`候補、未採択）に対する受入oracle案。HELIXOS-L2-007はprovenanceと証拠、009はdurable event/idempotent projection、010はticket/workflow生成を所有する。035は選択PR event scopeのintakeと冪等監査job要求の生成を検査し、HR-FR-HIL-03のHARNESS↔OS接続や監査実行/所見処理は扱わない。候補受入は要求採択・実装・実行・review成功を生成しない。

各fixtureは対象project/repository、明示scope、event source contract/version、authority状態、PR identity、base/head refとrevision、source event identity、監査job要求の状態を固定する。選択範囲外のrepositoryを対象に含めず、作成者/provider名だけでscope内PRを除外しない。

**正常：複数base branchとstacked PR**

projectの同じ明示scopeで、base branch `main`上のPR、別base branch `release/x`上のPR、PR-Aのhead branchをbaseにするstacked PR-Bの作成/更新/完了相当eventを与える。契約で観測可能な各eventは対象として記録し、それぞれのbase/head revision・source event・監査job要求を関係づける。全base branchとstacked PRが含まれ、いずれもsource作成runtime名を理由に除外されない。これは選択project内の結果であり、別repositoryを巡回したり、その結果へ広げたりしない。

**正常：再送の冪等性と更新**

同一event identity/revisionを同じscopeへ複数回配送する。event receiptは同一論理eventに結ばれ、論理監査job identity/requestは一つに収束し、L2-010の既存ticket/workflow境界に一つのaudit work itemとして登録されるreceiptを返す。監査処理の完了までは要求しない。次に同一PRのhead revisionが変わった更新eventと完了相当eventを与える。各event/revisionは捕捉履歴に残り、L2-010の既存規則に沿ってjob work itemが更新または後続生成される。前headに結ばれたjob/resultを新headの現在状態へ転用しない。

**誤り：対象除外・重複job・不正な完了主張**

同じscopeにbase branch `release/x`とstacked PR-Bが存在するのに、`main`上のPR-Aしか取り込まず対象完了とする、またはprovider/author条件を理由にscope内PR eventを落とす結果は不合格。重複配送から同じevent/revisionの論理jobを複数作る結果も不合格。選択source契約のdelivery filterが一部base branchまたはstacked PRを除外しているのに、全scopeを網羅したと表示する結果を拒否する。

**誤り：古い結果と作業状態の混同**

同じPRの旧headに結び付いた監査要求/receiptを新headへ結び付ける、event受領だけでjob完了・review済み・CI合格・merge可能・要求承認済みと表示する結果を拒否する。イベントが重複した場合の既存receiptを無視して二重にjob作成する場合も拒否する。

**未見：未知event/source版/新base branch**

未fixtureのevent action、event source contract version、または新しいbase branchを与える。現契約がそのevent意味とscope内deliveryを明示的に支持するときは、内容・provenance・revisionを照合後、同じcoverageとidempotency条件で処理する。意味/対応版/delivery範囲がunknownまたはstaleなら、PR不存在や全件捕捉済みにせず未観測/未完として返し、該当source契約ownerへ戻す。新eventを未知という理由だけで恒久拒否せず、既存契約範囲内のsupported eventは処理する。

**境界・結果**

受入は、明示scope内で作成/更新/完了相当eventを漏らさず記録し、同一event再送のjob生成とL2-010 work-item登録が冪等で、更新revisionが正しく分離されることを確認する。監査job自体の実行、独立review、finding分類、writer返却、successor昇格、CI/merge admissionはこの単体fixtureの合格条件にしない。これらを要する端から端のHARNESS↔OS接続はHR-FR-HIL-03と別の後続candidateで判断する。

**出典と固定照合基準**

- 旧HIL-BR-02: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:54`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。
- 旧IR: `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json:45-58`、SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 2026-09-23 scope decision: `docs/governance/decisions/hil-br-02-product-scope-2026-09-23.md:15-44`、SHA-256 `1bf2912691a89cacc2ff1bff23b5c21a48961bb655aa43ec95d5b422c83d64c1`。scope決定であってL2/L11採用・接続完了ではない。
- 現行L1/L2/L11と照合baseはL2候補本文の「現行根拠と照合基準」を参照。L2: `docs/helix-os/L2-requirements/governance-requirements.md:60,62-63,295-300`、L11: `docs/helix-os/L11-acceptance/governance-acceptance.md:27,29-30,47,55`。

**配送順序・部分失敗の反例**：新HEAD eventの後に旧HEAD eventが遅れて届くfixtureで、新しい対象revisionを旧job状態へ戻す例を拒否する。event保存後・job登録前の停止は未完登録を再開し、登録後receipt受領前の停止は既存jobへ再相関する。どちらもjob二重生成や原event消失を成功にしない。

### HELIXOS-L2-036 Retrofit preflight ticket/plan接続 — L11受入候補

本候補は未採択であり、HARNESS-L2-005が生成する検証義務やSECURITY authorityを代行しない。OSが受け入れるのはticket上の義務/resultの適用と状態保持である。

**正常例**：Retrofit upgrade ticketに、source revision、target revision/scope、全upgradeに必要なpreflight義務とHARNESS-L2-005が定めるoracle/resultを与える。影響評価中に同一ticket・scopeへ束縛し、pass後に初めて移行計画を確定できることを確認する。plan draftや選択肢整理はresult前も可能。確定後、適用時にresultがcurrentであれば既存SECURITY authorityの下でapply operationへ進行可能と記録する。L2-036自身はpreflight判定も適用も実行しない。

**誤り例**：

- Retrofit upgradeでpreflight未実施/fail/unknownのまま移行計画を確定する。またはpreflight resultが未実施、unknown、stale、不適合、別revisionまたは別dependency scopeに属したまま、計画確定またはapply/operation closureを主張する。
- Retrofitが段階的でrollback先を持つこと、または一般CIがgreenであることだけを示し、選択されたpreflight義務/resultを欠く。
- OSがHARNESS oracleの定義していないpreflight判定内容を独自に補作する、HARNESS oracleを書き換える、またはpreflight結果からSECURITY authority/操作許可を生成する。

いずれも計画確定またはapply/完了状態を保留し、未完義務を保持してHARNESS oracle/義務、source owner、OS ticketの該当箇所へ戻す。新しい人承認やrelease gateを追加しない。

**境界例**：Retrofitのticket起票、依存・設定の調査、影響評価、未確定のplan draft、preflight実施の開始はresult未到来だけを理由に拒否しない。Retrofit upgradeのplan確定はpreflight pass後に限る。確定後resultがapply対象scopeに合わない場合はapply時に保留する。旧process/Conceptの高リスク条件は全upgrade義務の具体例として扱い、scope差とは読まない。非upgrade Retrofitは旧processの当該upgrade順序条件の対象外とするが、既存HARNESS verification dutiesと他のread-only verify policyは維持する。

**未見例**：異なるpackage manager、dependency種類またはconfiguration形式を入力する。HARNESSが選択したversioned oracle/source contractが対応する範囲なら、その結果をOSがscope/revisionへ結ぶ。対応oracleがない、または対象が不明ならpassにせず未評価を返す。方式名・schema差だけでは拒否しない。

**依存と判定区分**：OS-L2-010のticket/workflow契約、OS-L2-019のprovenance/未完義務継承、HARNESS-L2-005の選択済みverification duty/oracleを使う。Retrofit upgradeについて、影響評価中のpreflight passを計画確定前に確認し、適用時はresultのcurrent性も再確認する。旧requirementsは全upgrade必須、process/Conceptは高リスクupgradeにおけるplan orderingを明記する。execution registryの`RETROFIT_STANDARD_SAFE`はread-only HELIX_DOCTOR verify policyとして分け、実変更applyへ拡張しない。どのsourceもpreflight checkerの具体的内容は定義しないため、互換性判定と決めつけない。旧v1.3 `helix-harness-requirements_v1.3.md:624` の意味条件を保持し、旧token/runtime/schemaを移植しない。

## HELIXOS-L2-030 生成index追補に対する受入

既存L11-030のmanifest exact setと共に判定する未採択候補。旧HAC-HIL-24a/bを具体化し、既存受入IDを置換しない。

| ケース | 入力と期待結果 |
|---|---|
| 正常 | 選択済みpackage contractが指定する正本indexの内容・scope・revision/digestと、同じsource/requirements/profile revisionに適用する既存生成規則を固定する。同入力で生成したgenerated indexの内容/digestが再現し、manifest/artifact証拠が正本indexと生成結果の由来を相関する場合に限りindex条件を満たす。 |
| 誤り | 正本index由来のgenerated indexの項目を一つ直接変更し、manifest/artifactをその改変後の内容・digestに合わせて再生成した入力を与える。正本indexと既存生成規則から再導出した結果との差を検出し、そのcandidateを不適格としてpromotionを拒否する。 |
| 未見/境界 | 宣言済みscopeの正本indexに新しい項目が追加された場合、選択revisionと既存生成規則から決定論的に再導出できれば正常扱いできる。正本revision、scope、生成規則のいずれかがunknown/stale/不一致なら、内容を補完して通さず未完として戻す。 |

party混在、免責/権利根拠の不一致、stage skip、cutover authority欠落は既存L11-030 oracleのまま別に判定する。このindex追補だけでそれらの判定を代替しない。L11候補は未実行であり、実配布・tag・release・remote syncを行わない。

### HELIXOS-L2-037 週次drift・技術負債観測から既存ticket候補への引継ぎ

- **正常**：宣言済みscope・対象revisionについて週次非同期観測が既存HARNESS要求/設計oracleを照合し、source identity、scope、revision、観測時点、使用oracle、結果を報告する。差分なしなら観測結果だけを記録し、ticketや同期gateを発生させない。差分ありなら証拠を保って既存HARNESS-L2-003のReverse/Backflow境界へ渡す。別経路でsource/ownerが技術負債の累積と分類した観測はLABO評価を経てHELIXOS-L2-022の既存candidate登録へ渡し、HELIXOS-L2-010の既存ticket kindに合う返済PLAN候補を返す。提案と実行ticket/assignment/承認済計画は別状態にする。
- **誤り**：週次観測を工程完了の同期gateにする、差分がないのにReverse ticketを発行する、scope外や異なるrevisionのoracleを同一と扱う、OSが新しい負債定義・検出閾値を補う、負債candidateを自動的に実行ticket/assignment/承認済計画へ昇格する、unknown/missing/staleを「負債なし」や完了へ変える、あるいは候補記録だけを理由に無関係な進行を止める場合は不成立。source分類/根拠の欠落はunknownを保ち、LABOまたはsource ownerへ戻す。既存OSの優先順位決定責務はこの能力によって制限しない。
- **未見**：以前観測していないproject/scopeまたは新revisionを受け取る。選択scopeと適用oracleを確認できる場合は同じ非同期照合を行い、差分有無を根拠付きで報告する。source/ownerが負債として分類する基準がない観測は未評価として保持し、累積成立・負債なしのどちらも主張しない。HELIXLABO-L2-063が扱う成功修復・同種再発のevidenceは、適用可能性が示された場合だけ接続し、他の負債へ一般化しない。

**旧頻度条件と既存責務**

旧 `business-requirements.md:135` は「週次 detector 起動」を表の発動条件に置き、「例えば」等の例示表示はない。この候補はその頻度条件をversion_target 1.0の非同期観測として保持する。全件CI、常時稼働scheduler、毎回の人確認は導入しない。観測未実施や結果未着は観測状態として記録し、通常の無関係な作業を同期停止する理由にしない。既存HARNESS-L2-003 (`product-requirements.md:111`) に合う差分が検出されたときだけ既存Reverse/Backflowへ渡す。

**分担・依存の確認**

- OSはsource分類やHARNESSの要求/設計/受入oracleを代行せず、HELIXOS-L2-019、HELIXOS-L2-022、HELIXOS-L2-010の証拠・candidate・ticket境界を通す。検出条件のない蓄積をOSが負債と判定しない。
- LABOは観測の評価・Feedbackを所有し、ticket発行/実行・要求変更はしない。
- HARNESS-L2-004、HARNESS-L2-025、HARNESS-L2-003 (`product-requirements.md:111`) は影響trace、composite design oracle、design mismatchとReverse条件を所有する。新しい独立drift detectorや別のReverse実行機構を037へ重複実装しない。
- 既存有効authorityと優先順位決定は再利用する。候補未採択を採択済み要求として扱わず、旧CLI・旧schedulerの実行方式を移さない。

**期間欠測の反例**：ある週の観測を中断し、前週の正常結果だけが残るfixtureを与える。今週を未観測/未完と報告し、前週結果の転用や「差分なし」を拒否する。同じfixtureで無関係なticketを同期停止しないこと、同一scopeの既存readiness/authority gateを迂回しないことも確認する。今回の観測receiptなしに観測開始できることと、観測完了の判定を分ける。

### HELIXOS-L2-038 Layer ledger writer・snapshot・proposal append — L11受入候補

未実行の受入oracle候補。OS側の入力束縛・保存・snapshot・append・失敗回復だけを検査し、HARNESS-L2-040/041が定める意味判定やproposal内容を再実装しない。ケースは対象layer、source/template/contract revision、base digest、scope、authority、proposal ID、source atom set、操作相関IDを固定する。出力は対象・revision・digest・選択scope・receipt・未完状態へ束縛する。

### 正常例：contractを使ったlayer snapshotとproposal append

対象revisionで採択・有効化されたHARNESS-COREのL2 ledger契約とactive template revision、L1-L12のうち明示選択したlayer、L0 anchorの別record、HARNESS-L2-040/041に適合するsource-backed atom/proposal/gapを受け取る。これは将来の実行条件を検査するfixtureであり、現時点で040/041または038が採択済みとの主張ではない。OSがauthority/source revisionと既存base digestを照合し、対象layer snapshotを選択scopeとして生成し、proposalをappend-only候補recordとして一度登録する。receiptからHARNESSの原proposal/source atom、OSの対象ledger revision、contract/template version、snapshot digest、authority reference、scope、statusへ相互に辿れる。snapshot/receiptはHARNESSのsemantic approvalや要求採択を示さず、他layerまたは対象全体のcoverage完了も主張しない。

### 誤り例：意味の上書き、stale base、権限拡張、部分成功

- HARNESS proposalの本文/atomをOSが補完・統合・削除し、canonical HARNESS ledgerへ直接採択済みとして書く。失敗し、元proposalとfindingを保持してHARNESS ownerへ返す。
- proposal生成後にbase ledger revisionまたはactive template/contract revisionが更新されたのに、古いsnapshotをcurrentとして扱う。appendを保留しstale edgeと再照合条件を保持する。
- 対象scope/authorityが不足したまま全層/全projectへ書き込む、L0をL1-L12 rowとして登録する、PR mergeやreceipt存在をauthorityとして扱う。writeを拒否しunknown/unauthorizedを返す。
- event/proposalを保存した後snapshotまたはreceiptの書込みに失敗した部分成功を、完了appendと表示する。または再開時に同じproposalを二重追記する。未完位置を残して冪等に再開し、snapshot/receipt整合が回復するまで成功表示しない。
- HARNESS-L2-040/041が未採択、対象revisionで無効、またはHARNESS-L2-009のactive template適用条件が不明な状態でwriterをcommitする。候補の存在や同じ`version_target: 1.0`を根拠にせず、未完としてwriteを保留する。
- 同じproposal/correlation IDへ異なるpayloadまたはbase digestを再送し、既存行を上書きする。衝突として両入力と対象revisionを残し、二重appendも成功receiptも出さない。
- appendの一部だけが保存されsnapshot/receiptが失敗した後、正本への候補行追加が完了したかのように可視化する。未完状態と原proposalを公開し、整合するsnapshot/receiptが再構築されるまで完了状態を出さない。
- OS proposal appendをrequirement acceptance、PO decision、L3開始許可、HARNESS validation pass、CI/merge/release readinessとして扱う。これらの状態遷移を拒否し、該当authority/判定ownerへ返す。

### 未見例：未知layer/template atomまたは新contract revision

fixtureにないlayer template field/applicability rule/obligation atomまたは新contract versionを入力する。HARNESS契約が新revisionを明示的に支持し、同revisionのsource span、適用scope、atom schema、対象ledger/baseが整合する場合は、内容を補完せず新proposalを通常どおり追記できる。契約対応、atom identity、source span、対象layerのいずれかがunknown/staleなら、空/TBDを埋めずfindingと未完proposalとして保持し、HARNESS契約ownerまたはsource ownerへ戻す。unknownを恒久拒否理由にもcoverage済みにもせず、対応確認まで対象proposalのsnapshot/append状態を未解決にする。無関係な対象/layerへの作業を同期停止しない。

### 境界・受入結果

正常/negative/unseen結果は選択scopeと対象revisionに限る。append writer、snapshot、receiptの成功からHARNESS意味の採択、L3承認、実装/運転の成功、全scopeのcoverageを導かない。authoritative ledgerへの意味変更、requirement acceptance、external publication/releaseは別の明示authority対象であり、本候補の操作に含まれない。実際の受入実行は候補採択・下流設計後の別段階であり、この文書または静的登録を実行証拠としない。

### HELIXOS-L2-039 WBS作業identityと登録前適格性 — L11受入候補

未実行の受入oracle候補。HDEC-L2D-S0-02で承認されたWBS-OS-002のうち、OS側の作業identityと登録前条件だけを検査する。作業単位の規範はHARNESS（WBS-HARNESS-001）の責務であり、L2-016のportfolio traceやL2-017のticket graph／workflow生成を再実装しない。039と本受入候補は未採択であり、ここに記すcaseは将来の条件を示す。

#### 正常例：新規作業候補のidentityと必須参照

対象の親要求ID、その親kind、対象product、taskまたはaggregateの粒度、担当候補、依存、budget、既存作業との意味照合結果、および対象revisionに適用される有効なHARNESS `WBS-HARNESS-001`契約revisionが揃ったfixtureを与える。候補の作業単位形がその契約に適合し、親要求が有効で依存が非循環、同じ意味の作業が無い場合、作業候補は一つの安定identityで親要求・product・粒度・担当候補・依存・budgetへ結ばれ、登録前判定が適合した契約revisionと各条件・照合scopeを示す。親要求kindは親から引き継ぎ、候補identityの発行や登録は要求採択、実行許可、実際の担当割当を生成しない。

#### 誤り例：親欠落、循環、budget欠落、意味重複

- 親要求IDが無い、または参照先が解決しない場合、作業候補を登録可能とせず、親要求欠落と差戻し先を示す。
- dependency graphに循環がある場合、作業候補を登録可能とせず、循環に関与する作業identityとedgeを未解決として残す。
- budgetが無い場合、未設定をゼロ予算や無制限と解釈せず、登録を保留してbudget未完義務を示す。
- 適用対象の有効なHARNESS `WBS-HARNESS-001`契約revisionに候補の作業単位形が適合しない場合、登録を拒否し、契約revisionと不適合箇所を示す。OSが作業単位規範を補完・変更して通過させない。
- 適用契約revisionまたはapplicabilityが不明、未確定、または対象revisionに有効であることを確認できない場合、適合を推測せずunknownとして登録を保留し、未確認の契約参照を示す。
- 既存作業との意味照合で同じ作業が別identityに重複すると判明した場合、新identityで二重登録しない。該当作業と照合根拠を示し、既存記録側の適切な扱いへ返す。旧RA-199の「既存PLANを延長する優先規則」は本候補に含めず、扱いを039から規定しない。
- product、粒度、担当候補、親kind、または依存を確認できない場合は、推測で補完せずunknownとして登録前に保留する。

#### 未見例：新しい作業意味または不十分な照合範囲

既存fixtureにない作業意味、複数productへの関係、または一部の既存作業しか確認できない照合scopeを与える。未見条件だけを理由に重複なし・適格と判定せず、未照合範囲とunknownを示して登録前判定を保留する。必要な親要求・product・粒度・担当候補・依存・budgetと照合証拠がそろい、重複なしを判断できる範囲に限って正常caseの評価へ進む。未知の作業分解規則、WBS-OS-001/003–008の網羅性、PHCAP-08との意味同等性をこのcaseから推定しない。

#### 候補境界・受入結果

正常／誤り／未見の各結果は、提示された親要求・作業候補・依存・照合scopeだけに結びつける。039候補や静的fixtureの通過はWBS-OS全体の採択・運用、HARNESS規範の採択、作業graphの独立検収、budgetの支出許可を意味しない。HDEC-L2D-S0-02の旧候補split承認だけでは039は採択されず、本候補revisionのPO判断待ちである。

### HELIXOS-L2-040 retry上限到達時の型付き戻し先 — L11受入候補

**対応と状態**：`HELIXOS-L2-040`と同じ未採択候補、`version_target: 1.0`。親は`HELIXOS-L1-003`。L2/L11の追加は採択、retry実行、Recovery成功、旧HXT全条件の被覆を生成しない。

**正常例**：対象ticket/assignment、適用中のpolicy revision、policyが定めるcounter semantics（初回を含むか、対象となる失敗の範囲）と上限N、同じ意味で集計された同一episodeの持続attempt event群、その後のretry要求を与える。上限到達時の次回起動をせず、累積回数・budget・lineage・未完義務を保持する。失敗理由が要求意味/入力不足なら既存Backflow型で要求エンジンへ、逸脱/context切れからの復旧なら既存Recovery型で中断工程へ戻す。同じ入力から同じ型と戻し先を再構成でき、routeの理由と元ticketを追える。

**誤りを含む例**：session再開やWorker交代でattemptを0に戻す、上限到達後に同じscopeのretryを起動する、実験の別budgetを本線へ混ぜる、要求意味の不足をRecovery成功で隠す、context復旧をBackflowで代替する、policy不明または台帳取得不能でretryを許可する、route待ちをclose/成功へ昇格する例をそれぞれ拒否する。既存型で理由を表せない場合は新型を推測しない。

**未見例**：未見のbudget revision、途中で交代したWorker、遅延したattempt event、実験retryを含むfixtureで、対象ticketとpolicyの適用scope・lineageを再照合する。上限・累積回数・失敗理由を確定できないときはretryを保留してownerへ戻し、古いpolicyや別episodeのreceiptで成功にしない。無関係なticketの通常作業はこの上限判定から停止させない。

**戻し先と限界**：記録欠落は`HELIXOS-L2-019`、policy不明はその決定owner、route不明は`HELIXOS-L2-010`、要求意味差はHARNESS/Backflow、復旧地点不明はOS Recoveryへ返す。旧`HXT-AC-015`の限定的なnormal/negative oracleを扱い、旧`HXT-FR-014`の全failure route、旧runtime、固定schema、数値上限、実装・実行済み状態を採用しない。

### HELIXOS-L2-041 再読込不能時の正本再取得を伴う継続 — L11受入候補

**対応と状態**：`HELIXOS-L2-041`と対になる未採択候補、`version_target: 1.0`、親`HELIXOS-L1-003`。採択済みOS-009の継続・復旧責務へ限定接続する。以下は未実行の正常・negative・unknown oracleであり、候補追加や静的確認はPO採択、provider/runtime能力の実証、運用有効化を示さない。

**正常例**：既存のauthority契約が特定する外部正本sourceとそのrevisionをfixtureへ与え、provider/runtimeから指示経路を再読込できない状態で、既存契約が示す安全なsession transitionとcoordination-only continuationの適用条件、および未完義務を提示する。移行後のcontextには旧指示、撤回済みclaim、secret、private reasoningが含まれず、次の処理に必要なsourceは既存の正本経路から再取得され、identity/revision・確認結果と既存provenanceへ結ばれる。出力はsourceが与えるauthority意味を会話や要約から補わず、OS-009の既存制約と未完義務を保つ。

**Negative例**：旧instructionや以前のclaimを現在のauthorityとして継続する、撤回済みclaimを有効扱いする、secretまたはprivate reasoningをcoordination packetへ含める、sourceを再取得せず会話要約を正本の代わりにする、古いrevisionやconflictしたsourceを確認済みと示す場合、その継続をauthority確認済みとして扱わない。`HELIXSECURITY-L2-005`のraw secret境界を外さない。旧CLR-R06がcandidate状態であることや、packetが存在することを採択済み根拠へ昇格しない。

**Unknown例**：sourceの選択・identity・revision・正本性・取得結果のいずれかが不明、またはprovider/runtimeが再読込不能か観測不能で安全なtransition条件も確定できないfixtureでは、正常例に見立てず`unknown`を示す。依存する継続だけを保留し、未完義務と確認先を示す。未知のauthority意味や新しいprovider fallbackを推測しない。

**受入の限界**：各caseは指定されたsource/revisionと既存transition契約に限る。旧source用語の`coordination-only continuation`や「安全なsession transition」の厳密なruntime上の内容は新定義せず、既存契約に未定義または不明があればunknownとする。別provider、runtime、session方式の対応表、旧instructionの再読込機構、外部sourceの種類や意味、新しい承認経路は本候補に含めない。正常caseの通過、source取得成功、OS-009の利用、L2/L11候補の登録から要求採択、実装・運用の完了を導かない。

### HELIXOS-L2-042 Worker成果のschema／digest適格性と緩和後再検証 — L11受入候補

**対応と状態**：HELIXOS-L2-042と対になる未採択・未実行候補、`version_target: 1.0`、親`HELIXOS-L1-003`。採択済み`HELIXOS-L2-004`のassignment／Worker成果回収条件への限定追補である。以下はoracle案であり、旧source、候補、静的fixtureから要求採択・実装・実行済み受入を推定しない。

**正常例：strict schemaとdigestが既定**：対象revision/scope、OS assignment、期待する成果形式、選択済みのschema／digest policy、HARNESSが定めた適用oracleを与える。schema strict validationと成果bytesに対するdigest検証が同じassignment・scope・revisionに結ばれて成立した場合のみ、該当成果を検証済みとして扱える。digest一致だけで内容の正しさ、authority、別成果の適合を認めない。

**不成立例：欠落・不一致・自己申告**：適用schema/policy/oracleの欠落、版・scope違い、strict validation未実施、digest不一致、Workerの自己申告だけを個別に与える。該当成果はaccepted／完了／検証済みにならず、理由と未完義務をOSの既存assignment/evidenceへ残す。他の成果や無関係なassignmentを一律停止しない。

**緩和例：対象・理由・期限と再検証receipt**：既存の適用条件に沿った緩和について、対象、理由、有効期限を持つ記録と、緩和条件下で返された対象成果を与える。再検証receiptが同じ成果、assignment/scope/revision、選択済みHARNESS oracleとその結果を示す場合にだけ、その成果の適格状態を再評価できる。receiptが無い、参照oracleが異なる、またはreceiptが別成果・scope・revisionに属する場合はacceptedとしない。新しい承認者や緩和権限は要求しない。

**unknown／期限・stale**：policy/oracle revision、期限、対象成果との対応を確認できないcaseでは合格を推測せずunknown／未完とする。期限切れの緩和を有効として流用しない。新しいschema、digest方式、provider/runtime、receipt formatを未見caseから補作しない。

**責務境界と受入限界**：HARNESSはタスク固有の検証義務・oracleの意味を定め、OSは既存assignmentへWorker成果と検証状態を束ねて記録・回収し、SECURITYは既存authority・実行制約を担う。OSがschemaやdigest algorithm、HARNESS oracle、SECURITY許可を発行・変更したら不合格。source lineとcoverage候補の範囲は[照合receipt草稿](../../governance/audits/requirement-registration/os-v13-worker-output-coverage-receipt-2026-09-28.json)を参照する。これらのcaseは旧v1.3全体の被覆、候補採択、実行結果を主張しない。

### HELIXOS-L2-043 Worker委譲event追跡の受入候補

- **対応・状態**：L2-043と対になる未採択・未実行候補。以下は文書上のoracle案であり、event runtime、adapter、CIの実装・実行を主張しない。
- **正常例**：既存assignmentに結ばれたWorker taskで、適用契約がapproval requestを必要とするcaseでは要求eventを、許可済みtool実行ではcall eventを、実行後はresult eventをそれぞれ区別できる型として記録する。既存event identityとassignment/source/revisionのprovenanceから3種の関係を辿れ、既存L2-009の永続化・再投影で同じ論理eventへ戻れることを確認する。request/call/resultの記録はauthority判定やHARNESSのtask oracleと別の事実として扱う。有効な既決operation authorityが再利用できる条件に、追加の人間承認を要求しない。
- **欠落・競合例**：approval request、tool call、resultのいずれかの型またはevent関係を欠落・取り違えたfixtureでは、該当chainを未完またはunknownとして残し、完了・承認・成功にしない。別assignment、actor、source/revision、結果を同一chainとする場合も不合格。eventの存在や順序だけからtoolの許可またはwrite transactionを成立させない。
- **境界反例**：OSがapproval decisionを作る、SECURITYがOS assignment/progressを所有する、Workerのevent/resultが自身のauthorityやwrite transactionを決める、または旧Node専有条件をこの候補だけで現在のどれかの機構へ移すcaseは不合格。この候補は承認／write transaction ownerを選ばない。必要なapproval requestが既存契約上ないtaskに毎回のrequestや人間承認を要求した場合も不合格。
- **未見例**：同一既存event contractを使う未見Workerまたは別assignmentを与え、event typeとtask/assignment/revisionの追跡が保たれるか確認する。未宣言のevent schema、runtime、adapter、approval authorityを補作せず、既存contractで分類・関係付けできない部分は未完として戻す。
- **未決source意味**：旧HR-FR-P2-06のNode control plane専有節はこのcandidate oracleに含めず、[coverage receipt草稿](../../governance/audits/requirement-registration/os-v13-p2-06-worker-delegation-coverage-receipt-2026-09-28.json)にPO判断事項と選択肢を記録する。したがってL2-043の受入は旧source line全体のno_loss、正式successor、authority意味の確定を示さない。

### HELIXOS-L2-044 feedback prose-only handoverをresolutionとして扱わない — L11受入候補

- **状態・対応**：HELIXOS-L2-044と対になる未採択・未実行候補。採択済みHELIXOS-L2-007のfeedback/evidence責務へ限定接続する。
- **Negative oracle**：既存project・要求revisionに結び付くfeedback findingと、findingに関するprose handoverだけを与える。handover文だけをresolution evidenceまたはresolved状態として記録した場合は不合格とする。既存のfeedback lifecycle/evidence contractを満たしたか確認できないfindingは未解決／pendingのままとし、理由と未完状態を既存OS evidenceへ残す。
- **境界とunknown**：resolutionに必要な証拠の新しいschema、充分条件、承認者をこの候補で定義しない。source/revisionや既存status/evidenceがunknown・stale・conflictならresolution成立を推測せず該当findingだけ保留し、無関係なfindingや作業を一律停止しない。
- **範囲**：このoracleは旧HR-AC-HYB-006の「prose handoverだけの解決」否定条件に限る。未ack finding消失、source HEAD不一致、event/projectionとSessionStart surfaceの受入は対象外で、同行のno_lossや旧条件全体のclosureを主張しない。

### HELIXOS-L2-045 各機構の検証・test・検出基盤readiness一覧の受入候補

- **状態・対象**：HELIXOS-L2-045と対になる未採択・未実行候補。fixtureで選択されたOS-L1-002の適用対象に限り、検証・test・検出基盤の整備状況を旧FR-L1-35の「実装済み／設計済み・実装未／未設計」で一覧する条件だけを扱う。現行機構群・将来Web対象・version targetはこの候補で確定しない。
- **正常例**：HELIXOS-L2-045の適用対象として選択された複数機構について、検証・test・検出基盤ごとの整備状況入力を与える。出力一覧に対象が欠けず、既知の状態が旧sourceの3区分のいずれかとして個別に表示されることを確認する。
- **不成立例**：対象基盤を一覧から落とす、状態区分を一括の「完了／未完了」等へまとめる、または3区分と異なる値へ置換した場合は、この候補の旧条件を満たさない。
- **unknown/stale**：対象revisionまたは状態の根拠を確認できないfixtureは、正常例へ分類せず、既採択HELIXOS-L2-016／L11-016のunknown/stale扱いを維持する。unknown/staleを三分類のいずれかに推測で割り当てない。
- **境界と受入限界**：この候補は選択済み適用対象に対する一覧条件に限定し、専用UI、dashboard、リアルタイム性、PO向けroster表示を要求しない。L2-016のgeneral portfolio stateを再定義せず、全対象・将来版への適用、旧HARNESSからOSへのowner移管、候補採択、実装、受入実行を主張しない。旧sourceの保持／置換・retireに関するPO判断は未決のまま残す。

### HELIXOS-L2-046 dispatchからmergeまでのauthority・HEAD・scope連続性の受入候補

- **状態と対象**：未採択・未実行のconnection候補。選択した一つの作業scopeにおけるdispatch、実行、Ready化、merge admissionの遷移を検収する。authority／検証義務の新しい種類や適用範囲は作らない。
- **正常例**：既存の有効なauthority、対象scope、入力HEAD、ticket／assignment、HARNESSが定めるrequired verificationとその現行HEAD向け結果を固定する。各遷移が同じ対象と許可scopeを参照し、必要な独立reviewと既存merge admission条件を満たした場合だけ次段へ進む。最終admissionはmerge対象content HEADと最新baseの組に結び、read-afterで照合できる。
- **scope／HEAD／authority変更**：実行中またはReady後に対象HEAD、base、scope、authorityの有効性、適用HARNESS contractのいずれかが変わるfixtureを与える。影響する遷移だけをstale／未完へ戻し、無関係なscopeは既存規則どおり扱う。旧HEADのreviewや検証結果、失効したauthorityを現在の対象へ転用しない。
- **誤りの例**：`docs/` pathのため既存のrequired review／verificationを除外する、探索・prototypeのmergeを本実装許可として扱う、required verificationをskipする、別HEADまたは別scopeの成功を流用する、対象HEAD／base変更後に古いreview結果でmergeを進める、あるいは一段の成功を次段完了へ伝播する場合は不成立。
- **境界と受入限界**：required条件と適用可能な除外は既存contractのownerが決め、本候補は具体的なrequired list、CI、skip機構、追加承認、実運用設定を定義しない。RFA-AC-16の指定rowだけを扱い、旧RFA全体のclosure、実装、運転、merge実施を主張しない。

### HELIXOS-L2-047 理由付きticket返却・再発行の受入候補

- **状態**：L2-047と対になる未採択・未実行候補。文書上の静的oracle案であり、runtime動作や要求採択を主張しない。
- **正常例**：`T@r1`とassignment/resultを与え、受け手が不足条件と根拠source revisionを理由付きで返す。`T@r1`のbytes/digestが不変で、OSが返却と因果関係を記録し、対処した`T@r2`を新revisionとして発行する。旧assignment/resultは新revisionの適用契約で明示的に適格化されない限り継承されない。
- **不合格**：Worker/検収が本文を直接変更する、`r1`を上書きする、理由/evidenceを落とす、別scope/revisionの根拠を流用する、`r2`を`r1`と同一revision扱いする、またはIssue/PR状態だけで再発行・完了を成立させる。
- **unknown/stale**：target identity、要求revision、返却元、証拠source、scope、既存relationが不明なら再発行成立を推測せず当該ticketを未完で返す。新しいschema/relation型を補作しない。
- **未見例**：検収側のoracle不足とWorker側の入力不足をそれぞれ与える。どちらも本文変更なしで発行元へ届き、元revision保持と新revision発行が成立する。
- **受入限界**：既存ownerが定めるrevision・relation・authority契約の範囲に限る。実行やCIの合格を主張しない。

### HELIXOS-L2-048 feedback受渡し・未解決維持の受入候補

- **正常例**：一つのticket返却findingと、検証不能の理由・不足oracle/inputを与える。OSがsource revision、target scope、ticket/assignment、発生元を保持してpendingにし、LABOへ評価candidateを渡す。LABOが理由/evidence/scope/再評価条件付きの提案を返し、INTELLIGENCEが適用可能なLABO評価evidenceを次回proposalに引用する。OSがproposalと既存ticket契約を別々に確認して発行・再発行を決める。
- **解決oracle**：prose handoverだけ、欠けた入力/oracle、未ack状態、または別revision/scopeのevidenceだけではfindingをresolvedにしない。resolutionは既存L2-007の条件を満たす証拠があるときだけ成立する。
- **不合格**：findingが消える、未解決がsuccess扱い、CIが不足oracleを創作、異なるscope/revisionを同一評価へ混ぜる、LABOがticket/assignmentを作る、INTELLIGENCEがdispatchする、feedbackだけでauthority/要求意味/priorityを変更する場合。
- **unknown/未評価**：対象revision・scope・評価母数・source・resolution条件のいずれかが不明/staleなら、その部分をunknown/未評価のまま保ちownerへ返す。欠測を0または成功としない。
- **未見例**：Worker返却でなく、検収のoracle不足から始まるfindingを与え、同じowner分担とpending/evidence保持を照合する。LABO評価が未完ならINTELLIGENCEは未評価としてproposalを保留する。
- **受入限界**：resolutionの新schema/十分条件、測定指標の数値threshold、runtime、実学習は導入しない。candidateと受入案から旧source全体のclosureや改善の因果効果を主張しない。
