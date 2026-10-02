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

**findingのリスク受容：正常・反例**：review findingに、対象revision/scope、根拠、残るrisk、独立review receiptとappeal経路を与える。directiveのcancel／supersede用PO receiptをfindingへ一般化せず、review findingの`accepted_risk`には旧L5 §3のaction-binding PO receiptと旧HIL-NFR-21の独立review receiptの両方を結び、非終端記録を原findingへ残す。いずれかが欠けたリスク受容、review済みを理由とする原記録の削除/不可視化/終端化、appeal経路の喪失は不合格。上流意味を変える場合は人の既存判断へ戻す。出所の種別が不明なら推測せず確認先へ返す。

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

対象revisionで採択・有効化されたHARNESS-COREのL2 ledger契約とactive template revision、L1-L12のうち明示選択したlayer、L0 anchorの別record、HARNESS-L2-040/041に適合するsource-backed atom/proposal/gapを受け取る。2026-09-29のPO判断はHARNESS-L2-040/041 revision -002およびHELIXOS-L2-038 revision -001を採択した。ここに示すfixtureは操作authorityを生成せず、対象revisionで契約が有効化され、既存scopeが成立する条件の検査例である。OSがauthority/source revisionと既存base digestを照合し、対象layer snapshotを選択scopeとして生成し、proposalをappend-only候補recordとして一度登録する。receiptからHARNESSの原proposal/source atom、OSの対象ledger revision、contract/template version、snapshot digest、authority reference、scope、statusへ相互に辿れる。snapshot/receiptはHARNESSのsemantic approvalや要求採択を示さず、他layerまたは対象全体のcoverage完了も主張しない。

### 誤り例：意味の上書き、stale base、権限拡張、部分成功

- HARNESS proposalの本文/atomをOSが補完・統合・削除し、canonical HARNESS ledgerへ直接採択済みとして書く。失敗し、元proposalとfindingを保持してHARNESS ownerへ返す。
- proposal生成後にbase ledger revisionまたはactive template/contract revisionが更新されたのに、古いsnapshotをcurrentとして扱う。appendを保留しstale edgeと再照合条件を保持する。
- 対象scope/authorityが不足したまま全層/全projectへ書き込む、L0をL1-L12 rowとして登録する、PR mergeやreceipt存在をauthorityとして扱う。writeを拒否しunknown/unauthorizedを返す。
- event/proposalを保存した後snapshotまたはreceiptの書込みに失敗した部分成功を、完了appendと表示する。または再開時に同じproposalを二重追記する。未完位置を残して冪等に再開し、snapshot/receipt整合が回復するまで成功表示しない。
- 対象revisionに適用されるHARNESS-L2-040/041が未採択または無効、またはHARNESS-L2-009のactive template適用条件が不明な状態でwriterをcommitする。候補の存在や同じ`version_target: 1.0`を根拠にせず、未完としてwriteを保留する。
- 同じproposal/correlation IDへ異なるpayloadまたはbase digestを再送し、既存行を上書きする。衝突として両入力と対象revisionを残し、二重appendも成功receiptも出さない。
- appendの一部だけが保存されsnapshot/receiptが失敗した後、正本への候補行追加が完了したかのように可視化する。未完状態と原proposalを公開し、整合するsnapshot/receiptが再構築されるまで完了状態を出さない。
- OS proposal appendをrequirement acceptance、PO decision、L3開始許可、HARNESS validation pass、CI/merge/release readinessとして扱う。これらの状態遷移を拒否し、該当authority/判定ownerへ返す。

### HELIXOS-L2-038 revision -002候補の追加negative oracle（未採択）

2026-09-29のPO判断が採択したHELIXOS-L2-038 revision -001を維持し、この追補を未採択のrevision -002候補として扱う。PO採択済みHARNESS-L2-041 revision -002は下記二つのfailure identityを定義しない。該当契約を追加するHARNESS-L2-041 revision -003（MPR-RC-HARNESS-L2-041-003）は未採択候補であるため、HARNESS側で同契約が別途採択・有効化されるまでこの二fixtureを実行可能な条件として扱わない。HARNESSが採択済み契約から対象input/template/extractor versionに結びつけたfindingを出した場合に、OSはfindingの意味を決め直さずoutcomeをwriter入力として処理する。

- **atomicity拒否**：一つのproposalに二義務が含まれるfixtureで、HARNESS-041-003が定めるatom対応不一致のfindingと現在のledger/base digestを渡す（旧HST-CASE-030-04のcodeは`HIL_LAYER_OBLIGATION_NOT_ATOMIC`）。OSが意味判定をやり直さずappendを`rejected`にし、candidate row増分0、current snapshot不変、HARNESS finding・source atom・proposal・操作receiptの追跡を保つことを確認する。
- **再実行nondeterminism隔離**：同一input/template/extractor versionの再抽出digest不一致を示すHARNESS-041-003のfindingを、既存current snapshotがあるfixtureで渡す（旧HST-CASE-030-05のcodeは`HIL_LAYER_EXTRACTION_NONDETERMINISTIC`）。OSが抽出結果を再比較せずproposalを`quarantined`として保持し、current更新0、直前snapshot digest不変、finding・base・再実行correlationの参照を保つことを確認する。
- HARNESS findingが欠落、別input/version/baseへ束縛、または不明な場合は、OSがatomicity/nondeterminismを推定せず状態をunknown/staleとして保留する。OSのquarantine receiptはHARNESSの意味findingやOS writer operationを検証済みにせず、要求採択・write authorityも生成しない。

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
- **Ticket非参照境界の候補oracle**：Ticket本文に他Ticket・成果物参照を埋めず、成果物がTicketを要求根拠・部品として参照せず、正本の要求・設計・契約へ辿れるfixtureを合格とする。Ticketが参照の結節点になる例、コード・設計・文書がTicketを実装部品または唯一の根拠として参照する例は不合格。順序制約の照合は既存OS計画・typed relation契約の適用範囲で示し、特定graphへの新規配置を合格条件へ混ぜない。
- **受入限界**：既存ownerが定めるrevision・relation・authority契約の範囲に限る。実行やCIの合格を主張しない。

### HELIXOS-L2-048 feedback受渡し・未解決維持の受入候補

- **正常例**：一つのticket返却findingと、検証不能の理由・不足oracle/inputを与える。OSがsource revision、target scope、ticket/assignment、発生元を保持してpendingにし、LABOへ評価candidateを渡す。LABOが理由/evidence/scope/再評価条件付きの提案を返し、INTELLIGENCEが適用可能なLABO評価evidenceを次回proposalに引用する。OSがproposalと既存ticket契約を別々に確認して発行・再発行を決める。
- **解決oracle**：prose handoverだけ、欠けた入力/oracle、未ack状態、または別revision/scopeのevidenceだけではfindingをresolvedにしない。resolutionは既存L2-007の条件を満たす証拠があるときだけ成立する。
- **不合格**：findingが消える、未解決がsuccess扱い、CIが不足oracleを創作、異なるscope/revisionを同一評価へ混ぜる、LABOがticket/assignmentを作る、INTELLIGENCEがdispatchする、feedbackだけでauthority/要求意味/priorityを変更する場合。
- **unknown/未評価**：対象revision・scope・評価母数・source・resolution条件のいずれかが不明/staleなら、その部分をunknown/未評価のまま保ちownerへ返す。欠測を0または成功としない。
- **未見例**：Worker返却でなく、検収のoracle不足から始まるfindingを与え、同じowner分担とpending/evidence保持を照合する。LABO評価が未完ならINTELLIGENCEは未評価としてproposalを保留する。
- **受入限界**：resolutionの新schema/十分条件、測定指標の数値threshold、runtime、実学習は導入しない。candidateと受入案から旧source全体のclosureや改善の因果効果を主張しない。

### HELIXOS-L2-049 Worker稼働観測と低干渉task割当の受入候補

- **候補状態と範囲**：L2-049と対になる未採択・未実行候補。以下は文書上のoracle案であり、実装・運転・受入実行の証拠ではない。
- **状態分離**：登録上限=5、割当可能=3、割当中=2、実行中=2、遊休=1、検証待ち=4、統合待ち=1をfixtureで与える。各状態が区別され、利用率の分母・観測時点・対象scopeが示されることを確認する。登録数5を実行中5またはaccepted throughputとして出す例は不合格。5はfixture値に限定し要求恒久値にしない。
- **低干渉taskの適格性**：遊休Workerと未着手taskを与え、READY、依存充足、single-writer/authority lease有効、scope充足、changed-path非競合、優先順とdeadlineを害さないことに加え、そのassignment完了後に適用される検証義務・担当・実施容量が割当前に確保されている場合だけ、別assignmentとして一度割り当てられる。新assignment自体のreviewやmergeが割当時点ですでに完了していることは求めない。元ticketの順序とidentity、成果・budget・未完義務のlineageを保ち、後段の検証と統合は既存の担当・admission契約に従う。INTELLIGENCEの配置案がlow-impact適格性を支持しない、または適格性unknownなら割当を保留する。
- **直列順序と遊休**：依存未完、競合path、上位taskのdeadline侵害、scope/authority欠落、後段の検証義務・担当・実施容量を割当前に確保できない、または低影響判定unknownの各例で後続taskをdispatchしない。適格taskがなければ遊休を遊休として記録し、dummy taskや利用率補完を作らない。
- **設定上限と停止**：同一入力で上限を2と5に変えたfixtureを与え、各上限超過のassignmentを拒否して理由を残す。変更中の設定、上限/停止条件がmissing・unknown・staleの場合に能力や許可を推定しない。設定値は有期profileであり、5を固定要求としない。
- **責務・証拠境界**：OSがINTELLIGENCEの配置案を上書きして影響判断を作る、HARNESS義務を省く、resource pool上限を稼働数とみなす、または旧provider数・8-slot・CI/DB/Merge Trainを成立証拠にする例は不合格。旧3L-BR-010、3L-R-28、MIC-R-01/06由来条件を限定して再導出し、旧family全体のclosureを主張しない。

### HELIXOS-L2-050 独立review capacity調整の受入候補

- **候補状態と範囲**：L2-050と対になる未採択・未実行候補。独立性・review結果の意味はHARNESS、authorityはSECURITYの既存契約に従う。
- **需要起因の増枠**：review queue件数・待ち時間・rework占有率・reviewer稼働率を各typed閾値で照合し、設定上の増枠条件が成立し、reviewer capacity不足が主因で、review以外のdownstreamに詰まりがなく、有効な独立reviewer session/capabilityが上限内で利用可能なfixtureを与える。設定上限=2のfixtureでは、review backlog閾値超過時に利用可能な独立reviewer sessionを最大2つまで別対象へ割り当て、3つ目を追加しない。上限値はfixture設定である。OSが追加assignmentを割り当て、対象PRのcandidate generationとHEAD/revision、reviewer identity/context/route、leaseを一意に記録する。同一PR generationへ二重の主reviewを出してcapacity増と数える例は不合格。HEAD変更後は旧世代のreviewを新HEADへ流用せず、新世代として再reviewする。
- **原因別backpressure**：検証待ちまたは統合待ちが主因、利用可能reviewerがない、reviewer上限が飽和、閾値/上限がunknown、または必要authorityが失効の各fixtureで、追加review sessionやWorker dispatchが解決策として成功扱いされない。原因・観測値・待ち義務を残し、該当scopeのdispatchをbackpressureする。
- **負荷低下とlease保全**：待ち件数・時間・rework占有率・reviewer稼働率が設定縮退条件を満たした場合、新規review assignmentの増加を停止し、active lease完了後に余剰capacityを縮退できる。縮退のためactive leaseを中断・重複発行せず、既存receiptを失効前の別revisionへ転用しない。HEAD/base/scope変更時は現行独立review要件に従い再照合する。複数のreview assignmentが並行するfixtureで、merge直前に各対象の最新base・content HEAD・scope・stale状態・merge admissionを個別再取得し、一方のmerge後は他方のbase driftを再判定する。staleまたは不一致なら作成側へ理由付きで返す。capacity増枠やreview receiptだけでmerge条件を満たしたことにしない。
- **独立性と権限の反例**：provider/model名の違いのみで独立reviewを認定する、作成者・そのSubagentへreviewを割り当てる、reviewerに作成branchの修正権限またはReady化権限を与える、review capacityの増枠から新しいmerge権限を発生させる、同一対象の重複receiptをcapacityとして扱う、review完了で他のHARNESS段階条件を満たしたとする例は不合格。既存のreview_merge担当は、現行のmerge admissionを個別に再照合し成立した後にmergeできる。この既存権限はcapacityの増枠から生じるものではなく、本候補はそれを取り消さない。
- **旧source・受入限界**：旧3L-R-29/30、3L-AC-028/030/031/032およびMIC-R-06のbackpressure、review lease、一意性、原因別増枠を限定oracleとして再導出する。固定第3reviewer、旧provider、旧CI/Merge Train/PR/DB fixture、実測・運転済み状態は本候補から生成しない。閾値とsession操作は新規案のためPO判断へ残す。

### HELIXOS-L2-051 作成／reviewレーンのtask単位選択と配置適性の受入候補

- **状態・対象**：L2-051と対になる未採択・未実行のL11候補。既存OS assignment、Worker共通契約、独立review、GitHub merge admissionの意味を変更せず、task単位の配置選択と適性根拠だけを照合する。
- **正常例**：要求・設計taskのscope、authority、task class、LABOの有効な適性evidence、INTELLIGENCEの配置案を与える。適格性がある場合、OSがClaudeを作成Workerとする案を確認し、別runtime/contextのCodexを`review_merge`に割り当てる。reviewは同じcontent HEADをread-onlyで扱い、findingは作成責任へ返る。修正後の新HEADについて独立reviewを再取得する。別taskでは適性と利用可能性が成立すれば、Codex作成／Claude reviewの逆向き配置も正常となる。
- **拒否例**：同一task/changeに同じruntime/contextを作成・reviewの両方へ割り当てる、Cursor cloud agentをreviewerにする、provider名が異なることだけで独立reviewとする、適性未評価・scope外・authority不足をClaude優先で迂回する、または修正前HEADのreviewを修正後HEADへ流用した場合は不合格。
- **unknown例**：LABOのtask class別水準、INTELLIGENCEの配置案、provider availability、scopeまたはauthorityがmissing／stale／conflictの場合、OSが配置成立を推定せず理由付きで保留し、該当入力ownerへ戻す。別適格候補を選ぶ場合はその適用evidenceと根拠が辿れる。
- **受入限界**：Cursor cloud agentの一般安全性、固定provider matrix、全taskへのClaude指定、適性測定方式／thresholdの新設、実runtime・CI動作はこのoracleの対象外。L2-004、L2-018／020の既存条件やそのacceptanceを再定義せず、候補記載から要求採択、実行・操作authorityまたはmerge許可を生成しない。

### HELIXOS-L2-052 merge後local cleanup・base drift再照合の受入候補

- **状態**：HELIXOS-L2-052と対になる未採択・未実行の静的oracle案。candidate登録からruntime、remote操作、要求採択またはmerge許可を主張しない。
- **正常例**：PR-Aの明示mergeとread-afterが成功し、関連PR-Bとのassignment ownershipを確認できる。PR-A所有のlocal worktreeとlocal branchのうち、他assignmentが使用せず未完作業もないものだけを自動・冪等にcleanupし、対象・結果・未完義務を記録する。remote refはdelete作用を含む有効authorityがある場合だけ対象にできる。PR-Bはcontent HEADを変えずに最新baseとのtrial merge、stale、依存およびreview bindingを照合し、stale=0でreview済みbase/content pairが一致するときはその状態を保持する。
- **作成側へ返す例**：PR-Aのmerge後にPR-Bのtrial mergeがconflict、base進行によりstale、依存条件変化、またはreview bindingのpair不一致となるfixtureを与える。merge／review側が作成branchを変更せず、差分と根拠を特定して作成側へ返すことを確認する。作成側が修正した新HEADは新しいreview依頼を経て独立reviewされ、旧HEADの結果を再利用しない。
- **拒否例**：所有関係が不明なlocal worktree／branchを削除する、remote refを対象・delete作用を含む有効authorityなしで削除する、自動rebaseでcontent HEADが変わった後に旧reviewを流用する、mergeだけでReady／完了／Issue closeを生成する、またはreview側が作成branchを修正する場合は成立としない。
- **unknown例**：merge後read-after、assignment所有関係、remote deletion authority、trial merge結果、stale結果、依存状態またはreview bindingのいずれかが欠ける・古い・矛盾する場合、cleanup／rechain成立を表示せず理由付きでownerへ返す。
- **受入限界**：旧sourceの指定sentence spanと現行operating modelに対する候補oracleであり、旧workflow／runtime、全GitHub操作、全PR lifecycleの移管・実装・実受入を主張しない。

### HELIXOS-L11-053 canonicalizationの原子的確定・部分current拒否の受入候補（未実行）

- **対応要求・状態**：`HELIXOS-L2-053`（HELIX-OS単体候補、未採択）。静的なoracle案であり、実runtime、DB、rollback、受入実行または要求採択を主張しない。
- **正常例**：一つの有効なcanonicalization operationについて、HARNESS／artifact ownerが確定した意味payloadと対象scope、全base revision、Markdown／asset revision、event ledger、trace、impact、stale関係、projectionおよびreceiptのwrite義務を列挙する。全必須writeが揃った場合だけ、同一operation receiptからbefore/after revision、write count、各write outcomeを辿れ、新artifact群がcurrentとして提示されることを確認する。旧`harness.db`との一致は条件にしない。
- **境界別failure注入**：上記write境界を一つずつ失敗させ、他境界の前後順序も変えたfixtureを与える。各失敗で新artifactの部分集合がcurrent pointer、canonical readまたはprojection経由の確定済みstateとして現れず、先行currentが保護されることを確認する。receiptには失敗したowner/boundary、確定writeと未完write、rollbackまたは隔離先、残る復旧義務が表される。失敗時にrollback完了を証明できなければ`unknown/incomplete`のままにする。
- **base CAS負例**：開始時に読んだbaseの一つをcommit前に更新するfixtureを与える。operation全体をstale/conflictへ止め、新規revisionを公開せず、競合したbaseと未完write義務をreceiptへ示す。古いbaseを上書きせず、異なるscopeの成功結果を再利用しない。
- **command再送の負例**：同じcommand identityとpayloadで再送した場合はsemantic revisionを二重作成しない。同じcommand IDで異payloadの場合はHARNESS-L2-052の意味判定を参照してconflictにし、先行current・revision・receiptを保持する。HARNESS候補が未採択またはその判定evidenceがない状態を、OSが独自のpayload意味判定で補わない。
- **unknown・receipt欠落例**：write対象owner、base、必須projection、receipt link、failure位置または復旧先を欠落・不一致にする。全成功・rollback成功・再試行安全性を推測せず、currentを成立表示しない。receiptが書けないfailureでは別の既存証拠経路を参照できない限りunknownを返す。
- **責務・受入境界**：成功時もHARNESS要求の採否や上流authorityを生成しない。receipt／register／PRの存在を実runtime実行や原子性の実証と扱わない。本候補はHOT-HIL-49のFR-52部分を受入設計へ再導出するだけで、FR-53のidentity/location history、rename/move/split/merge、authority・oracle・typed edge保持や旧test実行を含まない。

### HELIXOS-L2-054 Closure Gate証拠照合・close運転handoffの受入候補（未実行）

- **対応要求・状態**：HELIXOS-L2-054（HELIX-OS connection候補、未採択）。静的なoracle案であり、実証、要求採択、Issue close authorityやoperationの許可を示さない。
- **HARNESS handoff不成立**：HARNESSの候補対象条件の評価結果がない、別scope/revisionの結果が渡る、または候補対象条件がunknown/withheldのfixtureではOSがclose operationを行わず、不足・不一致のownerへ返す。OS独自にoracleやrequirement meaningを埋めてはならない。
- **証拠欠落**：PR、CI、独立audit、選択済みstyleへのmerge、oracle、子Issue状態を一つずつmissing/stale/unknown/conflictにする。欠落項目を特定して候補対象条件を未成立とし、その結果だけでcloseを進めず、他の証拠や別scopeのreceiptで補わない。旧memory receipt欠落の負例は別のholding oracleとして表示し、この候補のclose拒否条件へ組み込まない。CIが未構築で必要結果を得られない場合はunknownとして保留し、旧CI resultで通さない。
- **正常例の境界**：今回候補の証拠とHARNESSの評価結果が同じscope/revisionでcurrentであり、close operationに対する既存authorityと未移管条件を含む適用契約によるclose可否が別途確認できるfixtureでは、OSが運転結果とclosure receiptを対応付けて記録する期待を確認する。旧HST-CASE-023-01の`merged_closed`はsource oracleの期待として参照するだけで、close API、具体schema、実行結果を新たに決めない。
- **receiptと状態分離**：closure receiptを欠落させたclose要求、Issue closeだけ存在する状態、閉じたchild Issueだけ存在する状態を与え、receipt、close可否、実際のclose結果、要求受入、stage完了をそれぞれ独立に識別する。PR／CI／Issueの表示やreceiptの存在だけで要求承認・完了を示さない。
- **memory意味の未確定**：旧memory compaction atomはholdingのまま`memory条件: 未判定（holding）`と別表示する。候補対象のPR／CI／audit等の評価をこの未決だけで止めず、provider memory/summaryを旧receiptと同値にも扱わない。OS-L2-019 continuityとの同値、memory作業の適用scope、現行close条件は本受入から補作しない。
- **旧oracleと実施状態**：旧assertion HST-CASE-023-01〜05/07およびHOT-HIL-05は候補oracle参照である。旧記録にある`design-defined`／`not-implemented`を実績扱いせず、旧runtime・test・CLI・CIを実行しない。候補receipt、source atom、文書上の正常例は受入実行、Issue close、旧IR全体のclosureを示さない。

### HELIXOS-L11-055 ready Issue claim前の工程・authority照合受入候補（未実行）

- **状態・範囲**：HELIXOS-L2-055と対になる未採択・未実行の静的oracle案。実装、runtime、要求採択、ticket発行または操作authorityの成立を示さない。既存のOS Worker assignment／leaseとauthority契約をfixture入力として扱う。
- **正常例**：有効なticket／assignment authority、readyなIssue projectionとの対応、一致する対象revision／scope、および現行契約またはticketで適用すると確定したReverse／Redesign／pair-freeze条件の完了証拠を与える。OSがWorkerへclaimを割り当て、既存lease契約へ結び、assignment・対象revision・scope・期限・結果を追跡する。Workerはそのassignment内でのみ実装toolを開始する。現行decisionで非適用と確定した工程は適用外根拠を記録し、未実施でも阻害条件にしない。
- **拒否例**：Issueがready表示でもticket／assignment authorityがない、対象revision／scopeが異なる、または適用されるReverse／Redesign／pair-freezeのいずれかが未完了のfixtureでは、tool起動前にclaimを拒否しblocked reasonと未完義務を記録する。期限切れまたは別assignmentに属するleaseを使ったclaimも拒否する。
- **unknown例**：ready判定、authority、scope、revision、lease、またはすでに適用すると確定した工程の状態がmissing／unknown／conflict／staleなら、OSは成立を推測せず理由付きで保留し、ticket発行元または該当ownerへ返す。工程の適用自体が未定義なら、適用済み／非適用のどちらにも推定で分類せず、既存authority ownerへ照会する。これを全scopeで工程完了を要求する新gateとして扱わない。
- **責務境界と限界**：Codex固有実行器を検査せず、OSが割り当てるprovider中立Workerとして照合する。旧FR-08の工程一律条件から現行のscope適用条件への差分を受け入れ、全scopeの工程適用規則をこの候補で新設しない。lease時間、更新、競合解決、実runtimeのtool起動動作は既存契約または別の対象revisionに委ねる。blocked receiptやIssue statusは承認・要求採択・完了を生成しない。旧HST-CASE-002-10は読取り専用のnegative oracle参照であり実行しない。

### HELIXOS-L2-101 finding disposition receiptと異議連結の受入候補（未実行）

- **対応要求・状態**：HELIXOS-L2-101（HELIX-OS単体候補、未採択）。静的oracle候補であり、要求採択、実装・実行、Issue操作またはformal successor割当を示さない。
- 旧sourceが名指すClaude providerの固定を受入条件にしない。作成側と別のreviewer identity・context・authority・routeがある例はreview役割を満たし、providerが同じという理由だけでは失敗にしない。providerが違うだけでは独立review合格にしない。
- 各receipt候補は入力finding identity、source/対象revision、evidence参照、affected layer、提案された分類、独立review参照を相互に追跡できる。いずれかが不足・stale・競合する例は未解決のまま示し、accepted receiptとして扱わない。
- `duplicate`は生存targetとacceptance oracle包含証拠をreceiptへ結ぶ。片方が欠ける例は`disposition_pending`。
- `false_positive`は別verifierの反証と独立reviewの両方を記録し、片方が欠ける例は`disposition_pending`。
- `accepted_risk`は独立reviewと、受容対象actionへ結び付いたPO receiptの両方を記録し、片方が欠ける例は`disposition_pending`。directiveのcancel/supersede権限からこのPO receiptを導出しない。
- `telemetry`は観測ownerとexpiryをreceiptへ記録し、片方が欠ける例は`disposition_pending`。
- 四つのnon-actionable分類はいずれも元findingをappend-onlyで保持し、typed receiptとappeal/reopen routeを残す。証拠不足のfindingを終端化しない。
- receiptやIssue projectionだけから要求採択、Issue完了、取消権限または下流実行許可を作らない。

### HELIXOS-L11-102 Issue contract durable handoff受入候補（未実行）

- **対応要求・状態**：HELIXOS-L2-102に対応する未採択connection候補。静的oracle案であり、OS runtime実行、durable writeの実証、要求採択またはauthority成立を示さない。
- **正常例**：HARNESS-L2-059で定義される11個の別field、contract revision、digestをOS intakeからprojection/handoffの各既存境界で対応付けるfixtureでは、同一source identity・contract revision・digestを保ったhandoffとして識別する。OSはfield意味や値の妥当性を判定しない。
- **個別field保持例**：各fieldを一つずつ欠落、改名または他fieldと結合したprojection fixtureを別々に扱い、HARNESS contractの11-field表現をそのまま保持できないhandoffとして不成立または未完を示す。OSがfieldを補完して正常化しない。
- **revision/digest不一致例**：source intakeとprojectionでcontract revisionが異なる、digestが別revisionを指す、source identityが違う、またはdigest欠落のfixtureは同一contractのdurable handoffとして扱わない。具体的なエラー状態・rollback・retry意味は本候補で追加せず、既存OS契約の状態を参照する。
- **authorityと意味の分離**：OSのdurable projection、receipt、Issue/GitHub表示だけがある入力からHARNESS要求の採択、field意味の妥当性、実行許可または上流decisionを生成しない。HARNESS側のcontract意味判定が欠ける場合、OS intake成功をHARNESS適合の代替にしない。
- **oracle出典と限界**：旧line 93 output atomのdurable handoff接続候補である。現行L11-017/019/023は隣接するworkflow/continuity/handoffだけを扱い、field contractを検証しない。旧`system_contracts.json:14-16`のexactly-once/duplicate/quarantine条件や旧test/runtimeはこのoracleへ含めず実行しない。永続ストレージ境界、schema、retry/error semantics、運用上の拒否分類、候補採択は未解決のまま残す。


### HELIXOS-L11-103 工程event・projection因果記録の受入候補（未実行）

- **対応要求・状態**：HELIXOS-L2-103と対になる未採択・未実行の静的oracle案。event発生、実runtime、要求採択、工程完了を主張しない。
- **対応する例**：現行適用契約に基づくHARNESS stage outcomeと、同一scope/revisionのOS event/referenceを与える。OS projectionからappend-only event、current state、利用可能なparent/cause lineageを相互に辿れ、HARNESS outcomeの意味を変更せず引き継ぐことを確認する。
- **拒否・unknown例**：event欠落、異なるrevision/scope、parent/cause参照の孤立、duplicate/conflicting eventを個別に与える。欠落を補ったり状態遷移を推定したりせず、未解決記録・復旧義務を残す。event/receipt/projectionの存在だけから工程pass、pair-freeze、merge、承認、完了を作らない。
- **受入限界**：HARNESSが定めるstage順・遷移条件や旧InfinityLoopEvent schemaを受け入れoracleへ導入しない。旧HIL-FR-01全体、隣接要求、旧runtime/test/CIの実行・成功は対象外。HR-FR-HIL-02、HAC-HIL-02a/b/cは関連oracle参照に限り実行しない。

### HELIXOS-L11-104 操作authority・実行隔離・品質受入の独立記録候補（未実行）

- **対応要求・状態**：HELIXOS-L2-104と対になる未採択・未実行の静的oracle案。実operation、隔離の実適用、品質検証の実行、要求採択または受入を示さない。
- **三つの独立oracle**：同一operation／要求revision／scopeについて、(1) SECURITYが返す操作authority結果、(2) Worker実行環境が返すSECURITY制約の適用観測、(3) HARNESSが要求revisionと対応L11 oracleに基づいて返す品質検証・受入結果を、それぞれ別のowner/source結果として確認する。OSは結果を作らず参照を結ぶ。
- **正常例**：三つの結果がそれぞれのownerから得られ、operation／要求revision／scopeが一致するfixtureでは、三結果を別々に参照できることを確認する。結果の存在や全件の肯定状態から、この静的oracleを実行済み受入としない。
- **操作authority oracle**：authorization記録がある場合、それだけでSandbox適用観測または品質oracleを成立扱いしない。authorizationが明示的にdenyであるnegative例も、隔離または品質結果を書き換えない。authorization記録が欠落・unknownなら、隔離または品質結果から補完しない。
- **実行隔離 oracle**：隔離の適用観測がある場合、それだけでSECURITYのoperation authorityまたは品質oracleを成立扱いしない。制約の未適用を示すnegative例も、他二結果を書き換えない。適用観測が欠落・unknownなら、authorityまたは品質結果から補完しない。
- **品質受入 oracle**：HARNESSの品質oracle結果がある場合、それだけでSECURITYのauthorityまたはWorker環境の隔離適用を成立扱いしない。要求oracleのnegative結果も、他二結果を書き換えない。品質oracleまたは対応L11結果が欠落・unknownなら、他二結果から補完しない。
- **identity不一致例**：三結果のうち一つでもoperation、要求revisionまたはscopeが異なるfixtureでは、同一operationの三つの結果として結ばない。scopeやrevisionを推測で補正しない。
- **限界**：本受入案はowner・対象・結果の分離と非代用を読む静的oracleであり、具体的なstate enum、実行方式、Sandbox製品、追加停止規則、人手承認を定義しない。旧sourceの同一line atom以外、security／Worker／HARNESS各契約の完全性、実装・実行結果およびformal successor closureを主張しない。


### HELIXOS-L11-105 incident episodeの復旧証拠相関受入候補（未実行）

- **対応要求・authority**：未採択`HELIXOS-L2-105`の静的oracle案。fixture上の参照整合を確認するだけであり、runtime実行、production対応、要求採択、incident close、release許可または受入実行を示さない。
- **正常例**：既存のincident recordに対応する同一episode identity、対象project/scope/影響revision、ownerが提示した適用可能な回復確認oracleとそのsource/revision、回復procedure record、rollback recordを与える。三証拠が同じepisode/scope/revisionへ結ばれ、各sourceがcurrentであるとき、OSのevidence projectionが各owner/source参照と関係を保ち「記録上の証拠一式が揃う」と表示できることを確認する。rollbackが実施されなかった場合も、その事実を表すrecordを独立に確認し、rollback成功とは読み替えない。
- **拒否例：identity／scopeの取り違え**：回復確認だけを別incident identityから参照する、procedure/rollback記録だけ対象scopeまたは影響revisionが異なる、同一episode identityを異なるincidentへ重複割当するfixtureを個別に与える。OSは異なるepisodeの証拠を合成せず、一致しない関係を不成立として表示し、誤った一式completeを拒否する。
- **拒否例：証拠の代理使用**：ticketがclosed、rollback成功、production状態がhealthy、またはprocedure文書が存在する一方で、適用可能な回復確認結果またはその同一episodeへのrelationがないfixtureを与える。これらの状態から証拠一式の充足、incident close、恒久修正またはreleaseを生成しない。
- **unknown例**：回復確認のoracle owner/source/revisionが欠落・stale・conflict・適用範囲不明、incident identityと既存記録のrelationが不明、または必要recordの読取結果が得られないfixtureを与える。当該dimensionを`unknown`として残し、他の証拠や文書名から補完しない。
- **受入境界**：本候補はincident episodeの既存参照に対する復旧証拠相関だけを読む。HELIXOS-L2-010／L11のticket種別、発行、workflow、恒久対策routeを再検証せず、旧FR-L1-16のhotfix、即時production release、後続backfillをoracleにしない。旧sourceの固定severityや応答時間、on-call／TL／PMの承認役割・時点も要求しない。既存SECURITY authorityにない操作許可や人間承認を追加しない。
- **旧source範囲と未解決**：`LEGACY-ASSET-9E033C3E39BE107D4CF1`のline 43から選んだ「SLO/KPI正常化確認」と「復旧手順・rollback記録」の2 spansだけに対応する。旧lineのPLAN/tool名、incident sourceの他line、旧runbook/PLAN/runtime、旧承認条件、Web-OS運用は未被覆のsource holdingに残る。ここで記す静的oracleから旧条件全体のformal successor、実装、実行、closureを推定しない。


### HELIXOS-L11-106 authority binding参照先の再帰検査受入候補（未実行）

- **対応要求・状態**：HELIXOS-L2-106の未採択候補に対する静的oracle案。`authority_effect: none`。runtime/scannerの実行、要求採択、authority成立、実装・受入完了を示さない。
- **正常例**：既存ownerがcurrentとして示すbindingから、既存ownerがcurrentとして示す参照先を経て、対象ownerの既存状態・revisionへ辿れるfixtureを与える。入力した参照関係が再帰的に確認され、L2-015のsource identity/revision/digest出所を保ったまま状態を確認できることを静的に照合する。
- **反例**：直接edgeではなく下位参照先に、既存ownerが失効、互換、または履歴として示すtargetがあるfixtureを与える。該当targetへのcurrent edgeを有効なauthority参照として扱わないことを確認する。ownerの状態記録をfixtureに明示し、その意味をこのoracleが独自に定義しない。
- **unknown例**：再帰先target、target owner、target revisionまたは既存状態が欠ける／unknown／conflict／staleのfixtureでは、適合やcurrent authorityを推測しない。未解決状態を保持し、既存ownerへの確認が必要なまま示す。
- **受入境界**：fixtureの列挙範囲内だけを照合する。全repository census、unbounded scanner、schema、compatibility/expiry/history判定の追加規則、再帰深度/performance、finding taxonomy、auto-repair/delete/edge rewriteは検査・要求しない。静的fixture結果は実運転・実装の証拠でなく、旧runtime/test/CIは実行しない。
- **旧sourceと未解決**：旧`LEGACY-ASSET-D201753B1A0CC6EA3980`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md:50`（file SHA-256 `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`、line SHA-256 `77e1d9bc1f98f2a1f1cf0094dd280fb83d001ffe8ee422f1c951da2d72898212`）の一 atomに限る。source owner移管、適用target集合、formal successor、旧source全体のclosureおよび採択は未確定のまま残す。`MPR-SH-CONFIRMED-003`を生存させ、候補receiptから状態や権限を追加しない。

### HELIXOS-L11-107 finding taxonomy/mapping revision-pinned handoff受入候補（未実行）

- **対応要求・状態**：HELIXOS-L2-107の未採択候補に対する静的oracle案。`authority_effect: none`。finding taxonomyの採択、owner移管、runtime/scannerの実行、ticket発行・修正操作、要求採択または旧DAC-FR-008のclosureを示さない。
- **明示mappingがある例**：既存sourceが付したfinding type identity、source／対象revision・digest・scope、既存authority記録でcurrentかつ対応が一意と示されたtaxonomy revisionとmapping revisionを与える。OSがtype/source/各revisionをそのまま保持し、mappingが指定するdestination referenceをhandoff情報として結び付ける。type名の再分類、別destinationへのfallback、ticket/Issueの作成や修正は行わない。
- **missing／ambiguous例**：mappingの欠落、複数候補、別taxonomy revisionへの参照、taxonomy-mapping対応のunknown/conflict/stale、または明示されないdestinationを個別に与える。各findingはtype/source/revisionを保ってrouting unresolvedとなり、destinationを推測しない。該当findingだけが未解決であり、他findingの照合を一律停止しない。
- **分類状態境界**：入力findingのtypeが未解決または曖昧な場合、その状態を維持し、候補がtaxonomy typeを選択・生成しない。taxonomy revisionの差替えで既存typeを新typeへ自動変換しない。旧DAC-R-007に記載されたtype名をfixture既定値や現行taxonomyとして採択しない。
- **不変・非実行条件**：handoff候補の記録からsource artifactを変更・削除する、authorityを昇格する、approvalを生成する、route先で修正を開始する、findingをresolvedにする例は不成立とする。実際のticket/workflow、修正、owner判断は既存契約・担当へ残す。
- **限界と保留**：normal fixtureは選択済みmappingを使う境界だけを確認し、具体type taxonomy、分類predicate、type→現行owner表、mapping作成者・採択権限は検査・決定しない。旧DAC-FR-008の分類meaning atomはpendingのままで、旧source全体のno-loss/closure、実装・実行・受入を主張しない。旧sourceおよび旧DAC-R-007/012は文脈参照のみで、旧test/runtime/CLI/CIを実行しない。


### HELIXOS-L11-108 artifactからconsumerへの逆向きgraph受入候補（未実行）

- **対応要求・状態**：未採択`HELIXOS-L2-108`の静的oracle候補。静的fixture確認はcensus実行、startup、生成、formal successor、採択、runtime実装または受入実行を示さない。
- **正常例**：一つの対象HEADと明示scopeについて、source ownerが提示したauthoritative forward artifact→consumer relationと、そこから独立して作るreverse projectionを別fixture入力／出力にする。artifact identity/revision/digest、consumer identity/revision、直接edge、consumer startup入口、生成関係を特定する。両方向を照合し、全forward edgeを逆引きでき、各reverse edgeがforward relationに存在し、startup reachabilityと生成伝播を別々に辿れ、元のidentity/revisionを保つことを確認する。確認結果は入力されたscopeに限り、未列挙範囲はcompleteと報告しない。
- **反例**：forward relationの同scope edgeを一つ欠落させたfixtureと、reverse projection側のedgeを一つ欠落させたfixtureを別々に与える。独立したforward入力との双方向照合により、各々の不一致を検出する。consumerのstartup入口をinactiveまたは別revisionにするfixtureではstartup reachabilityの不一致を示し、別のgeneration edgeから補完しない。生成関係だけを欠落/不一致にしたfixtureではgeneration伝播の不一致を示し、startup reachabilityと混同しない。
- **unknown例**：authoritative forward relationがsource ownerから未提示、scopeの閉包、consumer owner、入口、revision、digestまたはedge宣言が欠落・unknown・conflict・staleなら完全性を推定せずunknownを残し、確認先を既存ownerへ結ぶ。入力scope外のartifactやconsumerを探索済みと報告しない。
- **受入境界**：これは入力済みrelationに対する静的oracle案である。HARNESSのartifact/pack意味と検証義務、CONNECTの明示connection identityと通信、全repo census、consumer taxonomy、startup/generator実行、severity/disposition、typed finding/routing、修復・削除・edge書換えは検証しない。旧runtime/test/CIは実行しない。
- **旧sourceと未解決**：旧`LEGACY-ASSET-D201753B1A0CC6EA3980`のarchive `document-authority-census-requests.md:51`（file SHA-256 `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`、line SHA-256 `9eeafcb6a2c3c4b4bd65ad22a1b0b8da22c9ce7e51bdc4a3423a6fbe19fe61c4`）の一 atomを候補scopeにした。source owner、formal successor、consumer全域、適用範囲、採択および実行受入は未確定。`MPR-SH-CONFIRMED-003`を生存させる。


### HELIXOS-L11-109 source-to-consumer provenance chain受入候補（未実行）

- **対応要求・状態**：未採択`HELIXOS-L2-109`の静的oracle候補。source authorityやgenerator実行、consumer起動、formal successor、採択、runtime実装または受入実行を示さない。
- **正常例**：一つの選択scopeとchainについて、source identity/revision/digest、generator identity/revision、generated artifact identity/revision/content digest、consumer identity/revision、および各edgeをfixtureにする。同じchain上をsourceからconsumerまで順に辿れ、各node/edgeとdigestが入力と一致することを確認する。入力されたchainだけを対象とし、全censusとは報告しない。
- **反例**：generator revisionをchainのsource/出力と不一致にする、generated artifact digestを置換する、または別consumer/revisionのedgeを混ぜるfixtureを個別に与える。各不一致を当該node/edgeで示し、別chainの一致値を使って補正しない。generator、artifactまたはconsumer edgeを欠落させたfixtureも不完全として示す。
- **unknown例**：scope、node identity/revision/digest、ownerまたはedgeが欠落・unknown・conflict・staleのfixtureでは、provenance chainの成立を推定せず未解決状態を保つ。文書名、path一致、generatorの存在だけでedgeを作らない。
- **受入境界**：これは選択済みchainの静的relation oracle案であり、全artifact census、generatorの実行/正当性、artifact生成、consumer startup、HARNESS packの意味契約、CONNECT通信、severity/disposition algorithm、finding taxonomy/routing、修復・削除、旧runtime/test/CIを検査しない。旧sourceにない固定版やclosureも追加しない。
- **旧sourceと未解決**：旧`LEGACY-ASSET-D201753B1A0CC6EA3980`のarchive `document-authority-census-requests.md:52`（file SHA-256 `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`、line SHA-256 `d032e840fb88ab1cf46f096553a8ba597473f2faa903ba71cf264e11cda4755d`）の一 atomを候補scopeにした。FR-004/006〜008、source owner移管、formal successor、採択、実行受入およびsource holding closureは未確定。`MPR-SH-CONFIRMED-003`を生存させる。

### HELIXOS-L11-110 semantic epoch / active consumer pin差分の受入候補（未実行）

- **対応要求・状態**：HELIXOS-L2-110に対する未採択・未実行の静的oracle案。旧DAC-FR-010全体のclosure、runtime/scanner実装、要求採択または実acceptanceを示さない。
- **positive fixture**：source ownerが同一source identity/scopeについて`epoch-old`と`epoch-current`およびrevision-bound digestを提示し、明示されたactive decision consumerが同じsourceをcurrentとして読む一方で`epoch-old`/old digestをpinしている入力を与える。選択されたsource-consumer関係に限り、候補finding `SEMANTIC_EPOCH_DRIFT`と旧/current evidence参照を対応づけ、finding本文から自動変更やseverityを導かない。
- **negative fixture**： (a) active consumer pinがcurrent epoch/digestとsource identity/scopeまで一致する、または (b) compatibility/historical/reference artifactにold pinはあるがactive decision consumer edgeが示されない入力を与える。いずれも本候補findingを出さない。artifactの存在・古さ・digest不一致のみで代替findingを推測しない。
- **unknown fixture**：semantic epoch evidenceを欠落させた入力、またはsource revision/digest、active性、consumer edge、scopeの一つをmissing/unknown/stale/conflictにした入力を与える。epoch変更・stale・適合のいずれも推定せずunknownを保持する。digest差だけでpositiveへ昇格しない。
- **受入境界**：fixturesは明示入力1 source/consumer関係の結果を静的に照合する。severity、全consumer列挙、リポジトリcensus、findingの分類/route追加、owner移管、ticket発行、修復、削除、要求採択、L3承認を評価しない。旧DAC-R-010/DAC-AC-016の記述は期待結果の根拠として参照するだけで、旧test/runtime/CLI/CIは実行しない。

### HELIXOS-L11-111 独立した三receiptのAND結合受入候補（未実行）

- **対応要求・状態**：未採択`HELIXOS-L2-111`の静的oracle候補。receipt発行、旧Census runtime、要求採択、実装または実acceptanceを示さない。
- **positive fixture**：三つの別々の入力receiptを用意し、それぞれが明示status `green`、異なるreceipt identityとsource provenanceを持つ例を与える。aggregateがgreenとなる条件が三つすべての明示greenであること、および各入力のidentity・revision・scope・provenanceが混同されず保持されることを照合する。
- **negative fixture**：一receiptずつ、三入力のうち一つを明示的な非greenにした例を与える。どの一つでも非greenならaggregateをgreenにしないことを確認する。残る二つのgreenで不足receiptを代替しない。
- **missing／stale／unknown fixture**：三receiptのいずれかをmissing、stale、unknown、または明示された別の非green状態にする例を個別に与える。該当statusとprovenanceをそのまま残し、aggregateをgreenにしない。status間の優先順位、変換、欠損の補完はfixture条件にしない。
- **receipt分離境界**：旧source上の`#825`、`#1370`、Census receiptの三つだけを入力集合に含める。`#206`はFR-009にある責務境界の参照として扱い、receipt入力や第四のgreen条件に追加しない。Issue番号やIssue状態だけをreceipt、authority、greenの根拠にしない。
- **受入境界**：fixtureで照合するのは明示入力receiptの独立性、status保持、三者AND条件だけである。各監査の意味・方法・内部schema、current issueやreceiptへのmapping、owner移管、旧source全体closure、実Census／startup／materialization実行、severity、repair、merge可否を検証しない。旧runtime／CLI／test／CIは実行しない。
- **旧sourceと未解決**：candidate input atomは`MPR-SH-CONFIRMED-003`が保持するDAC-FR-009 line 56一atomに限定する。DAC-R-011 line 66とDAC-AC-017 line 42は独立receiptと負例の関連context/oracle evidenceであり、confirmed175 holdingまたはcandidate inputではない。各source owner、formal successor、適用scope、採択、実行受入を未確定のまま維持する。

### HELIXOS-L2-112 Product Dataの版束縛read projection（L11受入候補、未採択）

本節は候補L2-112に対する静的oracle形状である。旧HAC/HATの条件単位を保持して候補を検査できるようにするが、fixture文書の存在・レビュー・登録からruntime実装、外部read実行、HAT合格、要求stage closureを作らない。旧`HAT-HIL-11`は`designed_not_implemented`であり実行receiptではない。実service、credential、PII、旧test/runtime/CIを使用しない。

- **正常oracle（旧HAC-HIL-11a）**：source ownerが選んだversioned read registrationと、適用可能なread/access/data-use条件と選択済みfreshness SLA/retention policy revision参照を固定したfixtureを与える。fullとincrementalを別のmode/scopeとして記述し、source record key、connector/schema/mapping revision、snapshot identity/digest、cursor/watermark、canonical entityとconsumer mapping edge、lineage/freshness、redaction/classification参照が同じ対象revisionへ辿れるかを確認する。同一intent・同一digest再送が二重効果を生まず、選択modeの境界とcurrent-resultの完全性を保持する。source enable/disableの正常fixtureでは、遷移receiptがsource registration identity/revision、connector contract identity/revision/content digest、要求状態・結果状態、および既存operation authority参照に結ばれ、fixtureの確定したrevisionとdigestがreceipt上でも同じであることを確認する。これは既存authority下の操作結果の記録であり、追加承認を条件にしない。freshness SLAとretention policyの参照revisionも正常fixtureの選択scope・resultへ結ぶ。入力consumerはexplicitly selected refsだけとし、旧HIL-BR-15に列挙された機能全体が今回のconsumer集合として採択されたとは扱わない。
- **HIL-BR-15 fanout正常例A（六roleすべて適用）**：これは値を具体化した合成fixtureで、実source・consumer・ownerの採択ではない。選択source `S1@rev1`、registration `reg-S1@rev1`、connector `conn-S1@rev2`、schema `schema-S1@rev3`、snapshot `snap-S1-01@rev1`、source record `src-S1-7@rev1`を共通入力とする。fixture上の各consumer ownerは自身のrole、scope、対象revision、canonical mappingを宣言する。各edgeは互いに独立し、`src-S1-7@rev1 → snap-S1-01@rev1 → canonical entity@revision → consumer@revision`のlineageを持つ。

  | role | 合成owner宣言・scope | consumer identity/revision | canonical entity/revision | 独立edge identity/revision |
  |---|---|---|---|---|
  | 設計判断 (`design_decisions`) | `owner-design-demo@rev1`, `scope-design-demo@rev1`で適用 | `C-design@rev2` | `E-design-7@rev1` | `edge-S1-design@rev1` |
  | coverage | `owner-coverage-demo@rev1`, `scope-coverage-demo@rev1`で適用 | `C-coverage@rev3` | `E-coverage-7@rev2` | `edge-S1-coverage@rev1` |
  | impact | `owner-impact-demo@rev1`, `scope-impact-demo@rev1`で適用 | `C-impact@rev4` | `E-impact-7@rev3` | `edge-S1-impact@rev1` |
  | Issue routing | `owner-route-demo@rev1`, `scope-route-demo@rev1`で適用 | `C-route@rev2` | `E-route-7@rev1` | `edge-S1-route@rev1` |
  | docgen | `owner-docgen-demo@rev1`, `scope-docgen-demo@rev1`で適用 | `C-docgen@rev5` | `E-docgen-7@rev4` | `edge-S1-docgen@rev1` |
  | detector | `owner-detector-demo@rev1`, `scope-detector-demo@rev1`で適用 | `C-detector@rev2` | `E-detector-7@rev2` | `edge-S1-detector@rev1` |

  六つのowner宣言と六つのedgeすべてが、同じ選択source/snapshotから指定されたconsumer revisionへ追跡できるfixtureだけを、六roleのfanout正常例とする。ある一edgeの存在から他roleの被覆は推定しない。
- **HIL-BR-15 fanout正常例B（明示的な非適用を含む）**：選択source `S2@rev2`、registration `reg-S2@rev1`、connector `conn-S2@rev2`、schema `schema-S2@rev4`、snapshot `snap-S2-02@rev1`、record `src-S2-3@rev1`を使う別の合成fixtureとする。六roleをすべて個別に評価し、`owner-design-demo@rev2`が`C-design-B@rev1`・`E-design-B@rev1`・`edge-S2-design@rev1`を適用として宣言し、`owner-impact-demo@rev2`が`C-impact-B@rev2`・`E-impact-B@rev1`・`edge-S2-impact@rev1`を適用として宣言し、`owner-docgen-demo@rev2`が`C-docgen-B@rev3`・`E-docgen-B@rev2`・`edge-S2-docgen@rev1`を適用として宣言する。coverageは`owner-coverage-demo@rev2`がこのsynthetic source scopeにcoverage inputが含まれない根拠`reason-coverage-out-of-scope@rev1`を、Issue routingは`owner-route-demo@rev2`がrouting対象となるissue signalが含まれない根拠`reason-route-no-signal@rev1`を、detectorは`owner-detector-demo@rev2`が検出対象signalを含まない根拠`reason-detector-no-signal@rev1`を、それぞれ非適用として宣言する。適用3 roleのedgeはそれぞれ`src-S2-3@rev1 → snap-S2-02@rev1 → E-design-B@rev1 → C-design-B@rev1`、同様に`E-impact-B@rev1 → C-impact-B@rev2`、`E-docgen-B@rev2 → C-docgen-B@rev3`へ結び、各edge identityは表記した`edge-S2-*`を使う。非適用3件の根拠はS2 registration/scope revisionへ結ぶ。参照資料だけを非適用根拠にしない。このfixtureはowner宣言済みの六role dispositionが揃った正常例であり、実sourceや非適用規則を決めるものではない。
- **HIL-BR-15 fanout負例・境界例**：正常例Aのfixtureから`edge-S1-design@rev1`、`edge-S1-coverage@rev1`、`edge-S1-impact@rev1`、`edge-S1-route@rev1`、`edge-S1-docgen@rev1`、`edge-S1-detector@rev1`をそれぞれ一つずつ取り除く六つの個別例は、対応する選択consumer roleをそれぞれ`failed`とし、他の五edgeで相殺せずfanout completeを出さない。`C-impact@rev4`を期待revision `C-impact@rev5`へすり替える例もimpact roleを`failed`とする。選択済み`C-route@rev2`のmapping edgeを欠く例はIssue routingを`failed`とする。ownerまたは適用scopeがmissing/unknownの例は該当roleを`unknown`とし、正常例Bの非適用判定へ補完しない。選択sourceが未登録または未選択の例は`unobserved/unknown`とし、設計文書等の参照を供給成功・非適用へ読み替えない。これらは該当fanoutの結果を定め、別選択sourceの独立projectionを一律に失敗させない。
- **negative oracle（旧HAC-HIL-11b）**：schema drift、cursor/watermark逆行、invalid/unknown connector、partial page/partial result、duplicate/conflicting source key、mapping/lineage欠落、禁止write、read/data-use scope違反、unknown classification、PII/secret/raw payloadの通常出力漏れを一つずつfixtureで示す。各ケースでcurrent projectionとwatermarkが前進せず、原因source/revision、quarantineまたはfailed/stale状態、未完義務と戻し先が分かる。credential値・secret・raw payloadをreceiptへ複製しない。enable/disable操作について、actor/operationに既存authorityがない・失効・scope外の場合、または要求時/commit時のcontract digest・registry/contract revisionが不一致、stale、unknownの場合を個別に与え、enabled stateを変更しない。拒否receiptは既存操作結果としてsource identity、要求/観測revision、期待/観測digest、拒否理由を示し、authorityや再試行許可を生成しない。
- **boundary oracle（旧HAC-HIL-11c）**：鮮度期限切れ、source/schema revision変更、明示tombstone、full結果での消失、incremental結果での不出現、unknown lineageを別条件としてfixture化する。明示tombstoneは関連mappingをstaleとして示し、incrementalの単なる不出現は削除にならない。full消失もsource ownerの明示契約とcomplete-scope根拠なしにtombstone化されない。stale/currentを混同せず、再取得が必要なscope・source revision・ownerが残る。
- **unseen oracle**：consumer mapping契約、freshness SLAまたはretention policy reference、source key安定性、schema互換、cursor codec、data-use許可のいずれかをmissing/unknown/conflict/staleにする。成功、削除、consumer集合、許可または鮮度遵守を推測で補完せず、状態とownerへの不足参照を残す。影響しない別source resultを候補が一律に失敗させる条件も導入しない。
- **境界・判定**：既存OS-L2-015/016/007/009のsource/provenance/projection/復旧oracleを維持する。CONNECTの一般互換性やtransport、SECURITYのauthority、source/consumer ownerの業務semantic mapping判定をOSが代行しない。正常／negative／boundary/unseenを文書上のfixtureとして静的に照合することは候補受入契約であり、要求段階のgateに正式実装、runtime成立、外部データ取得または旧HAT実行を加えない。
- **出典・意味再導出**：旧`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`のL1 lines 67/113/114/197、`LEGACY-ASSET-67761C517521603F844C`の`HR-FR-HIL-11`、`LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`のHAC-HIL-11a/b/cおよびHAT-HIL-11を起点にする。旧L5/L6のfull/incremental、source key、atomic projection、tombstone、stale、redaction、quarantineのfailure境界を意味再導出し、旧Node/Python/DB/runtime/testの物理方式は現行oracleへ固定しない。source atom入力と部分coverageは`hil11-product-data-projection-source-lines-2026-10-02.jsonl`および`hil11-product-data-projection-coverage-receipt-2026-10-02.json`に束縛する。


### HELIXOS-L11-113 GitHub監査の決定的規則・semantic finding境界の受入候補（未採択・未実行）

- **位置づけ・入力**：HELIXOS-L2-113の未採択候補に対する静的oracle案。scopeと対象revision、決定的規則の正本revision、Node gate結果、semantic modelのidentity/revisionおよび対象に対応する評価根拠をfixtureとして固定する。fixture内の表示は実運用結果ではない。
- **正常例—決定的規則の強制拒否**：明示した決定的規則とNode gateの判定が`deny`で、semantic modelが`pass`を返すfixtureを与える。`pass`だけを根拠に許可される処理要求をfixtureに含め、oracleの期待結果として`gateDecision: deny`と`requestResult: rejected`の両方を照合する。これによりNode gateがその要求を強制拒否し、実効判定を`deny`のまま返す条件を確認する。semantic findingは別記録として保持できるが、findingを記録しただけで処理要求の拒否を省ける判定は不合格とする。model resultがgate結果を上書きまたは相殺してはならない。
- **正常例—semantic finding**：決定的規則の判定と別に、同じ対象scope/model revisionへ結び付く評価根拠を持ったmodelのsemantic findingを与える。findingはsemantic findingとして区別され、Node gateの判定やowner authorityを作成・変更しない。既存のHELIX lane/provider/Control Plane identityをfixtureへ保ち、新しいものを追加しない。
- **誤りを含む例**：model `pass`で決定的`deny`を相殺する、決定的規則をmodelへ委譲する、評価根拠が異なるmodel revision/scopeを評価済みと扱う、GitHub監査を第四provider laneまたは別Control Planeとして登録する場合は不合格。いずれかの条件に適合しても他条件の失敗を相殺しない。
- **欠落・unknown例**：決定的規則のrevision、Node判定、model評価根拠、scopeまたはmodel revisionのいずれかがmissing/stale/unknown/conflictの場合、fixtureは未解決として保持する。別revisionの評価、Issue/PR状態、候補本文から補完して委譲またはpassを導かない。
- **判定oracle**：L2が要求する三境界（Node gateによる決定的規則、評価根拠が対応するmodelへのsemantic finding限定委譲、第四provider lane/別Control Planeの不生成）を独立に照合する。Node gateの実行、modelの実評価・推論、GitHub監査、CI、Issue/PR更新、merge、実際のgreen、実装完了、L3承認またはsource retirementはこのL11候補の合格条件にしない。
- **旧oracleとの対応**：旧3L-AC-016はmodelによるdeterministic gate上書き拒否、3L-AC-017はsemantic findingをowner/route候補として扱いbranchを直接修正しないこと、3L-AC-018はseverity作用範囲の分離を示す。severity値・停止条件の具体値は旧3L-R-17から下位設計へ渡し、本L2/L11で新設しない。旧test/runtimeは実行しない。

### HELIXOS-L11-114 worker/verifier loop継続適格性の受入候補（未実行）

- **対応要求・状態**：未採択`HELIXOS-L2-114`の静的oracle案。HELIXOS-L2-009の意味変更・追補採択、継続実行、ticket／Worker起動、runtime green、受入実施、旧条件全体のclosureを示さない。
- **前提fixture**：一つの既存operationが明示する同一worker/verifier loopのepisode、対象・revision・scope、既存authority、継続状態の判断source、時間条件の現行source、loop終端verdictのsource、およびiteration上限と累積値のowner/sourceを別々に与える。Issue／PR open、session存在、CI green、旧`running`文字列だけからこれらを作らない。
- **正常候補**：旧`HR-BR-07`の4述語に対する現行意味がそれぞれ特定済みで、(1) episodeが現行ownerの根拠で継続可能、(2)既存operationの時間・許可条件を満たす、(3)当該loopの終端verdictでは`pass`未達、(4)同一ownerの明示上限に対して現iterationが上限未満、の全てが真のfixtureを与える。候補の出力は「次反復の適格性」だけとし、継続権限の新設・自動dispatch・実行成功・別pipeline完了を生成しない。
- **個別反例**：他の3条件を真に固定し、(1)継続状態が明示的に偽、(2)既存operationの時間／許可条件外、(3)当該loopの終端`pass`成立、(4)明示上限到達、を一つずつ別fixtureにする。各ケースで同一loopの次反復を適格としない。上限値は既存sourceから入力し、本候補用の数値を作らない。一般のCI pass、単一検証oracleのpass、session交代または別工程の成功だけを(3)とみなさない。
- **条件別unknown**：4条件それぞれについて、対応sourceまたはrevisionを一つ欠落／unknown／stale／conflictにしたfixtureを個別に与える。欠けた条件を真と補完せず、該当episodeの次反復適格性を`unknown`のまま保持し、既存のauthority／workflow ownerへの確認先を示す。無関係なoperation・ticket全体の停止はこの候補から生成しない。
- **意味差と判断待ち**：旧`status==running`は現行ticket／assignment／workflow／session状態との同値を示さない。旧「時間窓内」は開始・終了境界を含む具体条件と現行deadline／permissionの同値を示さない。旧`lastVerdict!=pass`は現在の全HARNESS oracle／CI passと同値ではなく、`iteration<max`の旧値・ownerも現行には定義しない。各意味が選択されないfixtureは正常caseにせずunknownである。PO選択肢はL2-114記載のA/B/Cとし、status/window/verdict/upper-boundを旧sourceから自動採択しない。
- **受入境界**：本項は未採択の`HELIXOS-L2/L11-114`候補に対する静的fixture案であり、その受入は未実行である。2026-09-29の[57 candidates PO判断](../../governance/decisions/po-decision-2026-09-29-57candidates.md) rows 63–64が採択した隣接`HELIXOS-L2/L11-040`（失敗retry上限）と`HELIXOS-L2/L11-041`（安全なsession transitionとsource再取得）は別scopeのまま維持する。これらの採択は旧HR-BR-07の4述語の現行同値や114の採択を意味せず、本項のfixtureも040/041の受入実行・runtime成功を主張しない。旧`canResume`関数、固定値、schema、runtime、provider、storage、retry policyは実装・起動しない。採択済み`HELIXOS-L2-009`の制約も変更しない。
- **旧source・保持範囲**：旧`LEGACY-ASSET-899A61905AFBC415F595`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/orchestration-memory.md:26–27`（file SHA-256 `9c88351f237d00c809f2cf7796fa30942f0ee2c3ad071842e719861551ccca5c`）の4条件だけを候補fixtureに使う。旧停止rule、失敗分類、memory二層、secret拒否、self-evaluation、DB/job queueその他のPHCAP-20条件は対象外で、同assetを生存中のsource holdingとして残す。

### HELIXOS-L11-117 選択event generation identityの受入候補（未実行）

- **対応要求・authority**：未採択`HELIXOS-L2-117`の静的oracle候補。2026-09-28 decisionの採択済みL2/L11一式を変更せず、fixture、登録または文書上の結果から要求採択、CI runtime/test/旧CLIの実行を生成しない。
- **正常対照**：一つの明示されたevent scopeについて、fixtureで適用可能と示すevent class、PR ID、HEAD、run ID、attempt facetを個別に特定したfixtureを与える。同じ選択scope・同じ適用facet集合と値を繰り返し与え、毎回同じgeneration identityを再現することを確認する。全facetが同一generationに対応する場合に限り、そのidentityを有効な一致として扱う。これは静的oracle形状であり、provider eventやrunの実発生を要求しない。
- **個別negative oracle**：他のfacetは正常値のまま、次の各facetを一件ずつ欠落させるfixtureと、各facetを一件ずつ別値へ改変するfixtureを独立に与える：event class、PR ID、HEAD、run ID、attempt。各fixtureで該当facetの不一致を識別し、有効な同一generationとして受け入れない。あるfacetの一致や別facetの値で欠落・改変を補完しない。fixtureで当該event classには適用しないと明示したfacetはunknown/適用外として保持し、必須性を推測しない。
- **意味選択を要する条件**：PR IDが全event classで必須という旧行の逐語保持案Aと、選択scopeでevent classに対する適用可能性を示し、PR IDを該当classに限り必須とする案BをPO判断材料として残す。推奨はB。いずれの選択でも、適用可能facetのmissing/mutated個別fixtureと正常対照を維持する。providerの物理field名、enum、tuple schema、全CI拡張はoracleへ固定しない。
- **境界**：このoracleは選択generation identityのfacet検査に限る。queue上限・TTL・置換・cancellation・post-main/review consumer・receipt再構築・live GitHub rehearsal・runtime/database/provider adapterを検証しない。旧AC-003/005/007を本受入へ追加しない。旧runtime/test/CLI/CIは実行しない。
- **旧source・限定範囲**：`LEGACY-ASSET-0B75B173425C200EA8CD`の旧`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:14`（file SHA-256 `7c7ba00bec6fbf50c65c4ee48a849eaef4f038229b99daa0bc19a519fbda70cc`、line SHA-256 `77c358b5bc3253bac4d39a55685fae93570d3e4288ca161de1a195b676eea412`）のCIG-AC-001一行だけをoracle sourceとする。隣接source条件は関連範囲へ混ぜず、生存中`MPR-SH-CANDIDATE-003`を保持する。formal successor、source owner、event applicability、採択、実行受入、条件closureは未確定である。

### HELIXOS-L2-115 終端runへの遅着Worker結果を受理しない — L11受入候補

**状態・範囲**：L2-115と対になる未採択・未実行候補。旧HIL-FR-27の「失効runのlate resultをcommitしない」atomだけを扱う。旧Supervisor、IPC、Node/Python、JSON Lines、固定schema／digest／receipt／fenceの実装や実行を要求しない。

- **正常例**：同じassignment／attemptに対し、既存契約に従って実行中resultと終端理由の記録を与える。終端前に返り、現在のassignment・source/revisionと対応し、既存authorityおよび選択済みHARNESS oracleを満たすresultだけが既存契約で評価可能であることを確認する。L2-115自体はresultの正しさや受理を判定しない。
- **終端後の遅着例**：原文由来の必須条件は失効run後のlate result拒否であり、timeout、cancel、process終了およびその他の既存契約上の終端後も同様に扱う部分は本候補が提案する限定一般化として照合する。該当する同じrunが既存契約で終端した後、成功を示す遅着resultを与える。既存の終端状態とcanonicalなaccepted stateが変わらず、resultがそのattemptの未受理／stale証拠として保持されることを確認する。遅着resultだけで成功、完了、現在のassignmentへの適用が成立する構成を不成立とする。
- **重複・取り違え例**：終端後のduplicate result、別assignment／attempt／source／revisionのresult、または終端理由との関係が不明なresultを与える。結果の到着順、worker自己申告、digest一致だけで現在の成果へ採用した場合は不成立とする。識別できない場合はunknown／未完を保つ。
- **差戻しと境界**：不一致resultは該当OS assignment／発生元へ戻し、元の停止理由と未完義務を残す。HARNESS oracle、SECURITY authority、event schema、transport、追加承認、無関係なassignment停止を新設しない。文書上のoracleは設計受入条件であり、runtime実装または実行結果を意味しない。

### HELIXOS-L11-118 検証義務を保つrun置換・終端証拠の受入候補（未採択・未実行）

- **対応要求・authority**：未採択の`HELIXOS-L2-118`に対する静的oracle候補。2026-09-28 decisionの採択済みL2/L11を変更せず、文書fixtureからCI runtime/test、旧CLI、GitHub操作、live rehearsalや要求採択を生成しない。
- **入力**：HARNESSが選択した複数のrequired verification obligation、同一または異なるcommit/HEADのrun generation、現在性とterminal状態の証拠、`main_push`／`schedule`／`workflow_dispatch`／同一または別PRのevent例、cancel・supersede・handoffの記録候補を与える。event classの適用範囲が未決ならunknownを保つ。
- **正常対照**：source-faithful選択肢Aでは`main_push`、`schedule`、`workflow_dispatch`、別PRのeventが互いをcancelしない。current main HEADのpost-main検収とschedule/manual safety-netを同時に置き、safety-netや同じHEADの別event結果でpost-main検収をcancel・完了代用しない。同一PRのnewer HEADは同PR内のstale HEADだけ、newer scheduleはolder scheduleだけを置換する。選択済み各義務のterminal evidenceを別々に確認し、各read-after結果を対応するmain-pushまたはschedule run IDへ結び付けてcurrent canonical HEADへ辿る。
- **有界置換の正常例**：同一PRのstale HEADだけを同一PRのnewer HEADで置換し、older scheduleだけをnewer scheduleで置換する。別PR・`main_push`・`workflow_dispatch`・schedule相互の非cancelを保つ。queue上限またはTTLを超えるschedule列ではolder scheduleだけを置換可能とし、超過によってscheduleまたはrequired verificationがsilent dropされない。未完義務の状態が残る場合はconsumerから確認でき、terminal evidence前にsuccess扱いしない。`cancel-in-progress:false`だけを指定し無制限並走させる実装は有界置換の成功例にしない。具体的な並列数・queue/TTL/provider policy/state enumは選択済み要求に値がない間はunknownとし、新しい値を作らない。
- **独立反例**：(1) `main_push`／`schedule`／`workflow_dispatch`／別PRの相互cancel、(2) schedule/manual safety-netがcurrent main post-main検収をcancel／代替、(3)同一PRのnewer HEADが別PRまたはそのPRのcurrent HEADを置換、(4)newer scheduleが別event classを置換、(5)`cancel-in-progress:false`だけを置き無制限並走、(6)queue上限またはTTL超過後にschedule/required verificationをsilent dropし、未完義務が見えなくなる、(7)required verification削減で高速化、(8)同じ義務・HEADの別event class結果流用、を個別に投入する。source-faithful Aでは各条件を拒否し、required obligationを失う状態をsuccess扱いしない。
- **終端・流用の反例**：cancelled runをpost-main completion、terminal green、deferred recovery successまたはreview receiptへ個別に投入して採用を拒否する。同一HEADでも異なる義務範囲のresultを流用し、義務同値性の証明がない場合に拒否する。main-pushまたはscheduleのread-afterからrun IDを欠落させる、別runのIDへ結び付ける、またはrun IDとterminal evidenceの対応を不一致にするfixtureを個別に与え、当該結果をcurrent main/scheduleのterminalとして確定せず`unknown`／未完に保つ。cancel・supersede・handoffの理由または対象generation/義務が欠落・不一致なら結果を成功へせず、関係とterminal evidenceを`unknown`／未完に保つ。
- **event class結果の意味差・下位導出**：Aでは同じ義務・HEADであっても別event classの結果を高速化へ流用しないsource条件をL11反例に残す。Bでは名前付きevent classをfixtureだけにし、同一義務/generationなら異class結果流用を許す可能性がある。POがBを選ぶ場合に限り、その同一性と許す範囲を明示した対照を成功期待値へ切り替える。この差はsourceのstrict条件を弱めるため、Aを推奨し、BはPOが選ぶまでunknownの代替期待値として記録する。lower layerでevent identity/義務関係、cancel authority、bounded queue値、receipt schema、projection/consumerを導出するが、provider/API/schemaをこの候補で固定しない。
- **旧source・限定範囲**：`ci-event-concurrency-source-lines-2026-10-02-r2.jsonl`が列挙する14 source atomsだけを候補条件として照合する。`LEGACY-CAND-LINE-000470`のqueue/TTL超過時silent drop拒否を未完義務の可視性まで含むnegative oracleとして追補するが、数値・state enumを固定しない。`000472`のcancelled runをpost-main/review/deferred-successへ流用した場合のconsumer拒否は既存oracleの行き先へsource mappingする。`000474`のrun-ID付きread-afterは、main-push/scheduleそれぞれのterminal evidenceと対応run IDを結び付け、run ID欠落・不一致をunknown／未完に保つ正常・negative oracleを追加する。独立terminalとcancel/handoff理由・対象再構築は既存oracleの行き先へsource mappingし、意味は重複作成しない。`000527/528/529`はCIG-R-02のevent class相互cancel禁止、同一PR stale HEAD限定置換、older-schedule-only置換、無制限並走禁止条件を保つ。`000478`と`000474`のruntime実装・DB migration・live rehearsalはcanonical promotion後の別PLANに残し、この機能候補のoracleや実行gateにしない。選択sourceの物理行と同一source atom/digestは`ci-event-concurrency-coverage-receipt-2026-10-02-r2.json`に記録する。`MPR-SH-CANDIDATE-003`、正式後継、source owner、適用範囲、採択、受入実行、全source closureは未確定のまま残す。


### HELIXOS-L11-119 Codex・Claude協働episode圧縮・continuity分離の受入候補（未実行）

- **対応要求・authority**：未採択`HELIXOS-L2-119`の静的oracle候補。2026-09-28 decisionが合意した既存L2/L11本文を変更せず、本fixtureは要求採択、runtime、旧test/CI、実装または知識昇格を示さない。
- **正常対照A（四class存在）**：一つの完了済みCodex・Claude協働episodeのfixtureとして、PRの対象revision、raw logの二span、test/CIのterminal結果、監査所見を与える。この例ではraw log／PR／test-CI／auditの四classすべてを存在としてaccountし、要約の各主張から元source/revision/spanへ辿る。episode continuationにはtest/CI結果と未完の監査finding・再開位置を残し、永続知識として確認された内容がある場合のみ別のknowledge-candidate出力へ渡す。knowledge candidateが無い例も成功対照として扱い、summary全体を知識昇格しない。
- **正常対照B（根拠付き非該当）**：別fixtureで、そのepisode scopeにPRを作成しないことを既存のoperation/source authorityが明示している入力を与える。PR classだけをその根拠へ束縛した非該当として記録し、他の3 classはAと同様に照合する。単なるsource未提示やunknownからPR非該当を推定しない。欠測・失敗はどちらの正常例にも含めない。
- **独立negative oracle**：正常fixtureの他条件を固定し、(1)各source classを一つずつ無記録で除外、(2)存在する選択sourceを一つずつ欠落、(3)一つのevent/spanを別revisionまたは別episodeへ置換、(4)一つの要約主張のsource参照を外す、(5)progress/checkpointまたは圧縮summary全体を永続知識として扱う、(6)要求・設計・受入・運用規則・嗜好をmemory正本とする、(7)未検証のfinding/repairを自己昇格させる、(8)provider native memoryまたはprovider summaryだけで再開する、を別々に与える。該当caseでは完全coverage、知識昇格、または再開成功を示さず、原因と不足sourceを特定する。
- **未見・unknownの対照**：過去fixtureにないsource class、source span表記、または新しいepisode scopeを一つずつ入力し、既知形式への読み替えや`not applicable`へ丸めず`unknown`として残す。unknown class/span/scopeをfalse、存在しない、または`not applicable`へ変換せず、unknownが一つでもある状態をcoverage完了にしない。
- **失敗時と依存区分**：選択sourceの取得・読取・provenance照合が失敗したfixtureでは、provider summary、直前episodeのsummary、別revisionのsourceをfallbackとして使わず、完了圧縮を不成立/未完にし、continuationと不足義務を残す。常時必須、特定操作時のみ、選択入力元依存、参照のみの4区分は2026-09-27の`docs/governance/decisions/body-reinforcement-po-decisions-2026-09-27.md`の共通条件に従って分類され、未接続・未選択inputは未観測を保つ。
- **境界・未完**：source classの適用性またはscopeが未提示ならそのclassを`unknown`としてcoverageを完全とせず、適用対象sourceの欠落は不合格/未完とし、範囲外sourceを探索したり固定source数を要求しない。欠測・不一致・保存失敗の後も、元episodeのcontinuation、停止理由、未完義務を消さない。永続知識の評価・保持は1.0〜2.xでHELIX-LABO、3.0からの改善利用はHELIX-INTELLIGENCEの既存責務へ返し、OS fixture内で昇格しない。
- **既存oracleとの関係**：HAC-HIL-07aのknowledge/continuation分離、07bの禁止内容/self-promotion拒否、07cのshadow改善・退行rollback、およびHAT-HIL-07のinput/output digest・shadow metric・review/rollbackは旧設計済みoracleとして意味対応を示す。旧HATは`designed_not_implemented`であり実行済み証拠ではない。本候補はpromotion/shadow/rollback全体を受入範囲へ取り込まず、BR-03の圧縮coverageと三種別分離に限定する。
- **未決の意味差**：旧DB continuationや旧actor語を現行のepisode/checkpointとCodex・Claude協働へ置換する対応はPO判断材料に残す。明示されたPO 9/24のmemory境界は既存判断として適用し、同じ意味の再承認を求めない。旧source全体closure、formal successor、実行・実装は本候補の合格条件にしない。

### HELIXOS-L11-121 HIL-BR-12 intake/style接続の受入候補（未実行）

- **対応要求・authority**：未採択`HELIXOS-L2-121`の静的oracle候補。HELIX-OS 2026-09-28 PO decisionが固定したL2-001〜029とpaired L11本文を変更せず、候補、fixture、receiptは採択、L3承認、runtime/test/CI実行、旧要求のformal successorを意味しない。
- **正常対照**：異なる入力sourceの二work itemとして、(A)GitHub Issue/PR/CI event由来のitem、(B)利用者が差し込んだIssue/PLANを同じintake contract boundaryへ渡す。各々でsource/cause/authorityと対象revisionを識別したうえで、HARNESSの選択済みdevelopment style、該当caseのactivation条件、必要なspecialist capability、処理後のstyle再接続点を個別に確認する。例として、選択styleがScrumでactivation caseが成立したwork itemに必要能力`API migration review`を付し、assignmentはOSが適合を検証し、INTELLIGENCEの案は案のまま、実行後の再接続先はScrumの次の合意済みcheckpointとして照合する。CI event由来の結果はそのsource identity/revisionに結び、別の要求やsourceから条件を補完しない。
- **ユーザーPLAN境界の正常対照**：利用者が意図的に記述したPLANを有効な入力sourceとして受け入れ、PLAN内に命令形の文があるだけで一律拒否しない。同時に、PLANの受理はそこに記された範囲外の操作authority・要求承認を増やさず、既存SECURITY authorityとscopeに従う。外部GitHub本文に埋め込まれた命令文はsource dataとして扱い、承認・実行命令やrouting authorityへ昇格させない。
- **独立negative oracle**：他の条件を固定し、(1)二sourceの一方を別contractへ正規化、(2)development style欠落/不一致、(3)case条件未成立なのにactivation、(4)case成立後にactivation条件を落とす、(5)specialist capability欠落・不一致をteam名/muster/placement案だけで満たした扱い、(6)処理後のreconnection point欠落または別styleのphaseへ接続、(7)intake bodyからauthority・要求採択を推定、(8)外部GitHub本文の命令を実行指示へ昇格、(9)利用者PLANを命令形というだけで拒否、(10)INTELLIGENCE案をOS assignmentまたはWorker実行そのものと同一視、を個別に与える。影響facetをsuccess/completeとして受け入れず、source・不足条件・責務境界を示す。ケース(9)は候補で禁じた拒否条件のnegative controlとして、正当な利用者PLANが受理されることを確認する。
- **未知・非該当**：既知fixtureにないsource class、style値、activation case、specialist capability、style再接続点をそれぞれ個別に入力する。既知値へ推測変換せずunknownとして保持し、未提示だけから非該当・能力適合・default phaseを作らない。case非該当は選択済みHARNESS条件の根拠があるときだけ示し、未選択source classは未観測であり参照資料のみへ分類しない。
- **dependency partition**：常時必須＝source/cause/authority/revision provenanceとSECURITY境界。特定操作時のみ＝選択HARNESS caseのactivation、style変更/再接続、またはcapability制約付きassignmentの各操作。選択入力依存＝当該intakeで選ばれたsource identity/revision/spanと適用case。参照のみ＝旧schema/runtime/hook/musterとその操作を選択していない背景資料。2026-09-27 body-reinforcement PO decisionの四区分を適用し、採択済みHARNESS-L2-023の依存identity/owner/contract version-range/適用根拠と同一入力closureの条件へ束縛する。未選択sourceは未観測であり、source failureから別sourceへfallbackしない。
- **HARNESS-L2-023依存閉包oracle**：本受入は採択済みHARNESS-L2-023の固定意味を利用する。正常fixtureではpack/contract revision、operation、scope、明示source selectionと、各依存のidentity・owner・contract version/range・適用根拠を入力し、同一入力を再度与えて有効依存closureと理由が同じになることを確かめる。常時必須、成立操作、選択sourceの依存はすべてclosureに含め、明示未選択sourceは未観測、参照資料は実行閉包外として表示する。
- **依存閉包の独立negative oracle**：一条件ずつ変え、(1)identity/owner/contract版/range/適用根拠を欠落または別revisionへ変更、(2)unknownまたは曖昧な条件をfalse・非適用・参照のみへ変換、(3)同一pack revisionと同一入力でclosureまたは理由が変動、(4)選択sourceの取得/読取失敗後に未選択source、別source、旧receiptへ暗黙fallbackして成功、(5)選択sourceまたはその依存をclosureから落とす、(6)未選択sourceを「未使用成功」または利用可能と表示、を個別に投入する。影響operationを保留/未完とし、不足identity・版・根拠またはsource failureを特定する。HARNESS-L2-023が要求する同一入力からのclosure再現性、unknown fail-close、選択source failure時のfallback禁止を弱めない。
- **失敗時の戻し先・限界**：不一致または不足facetを隣接条件で補完せず、intake/style/case/capability/reconnectionのどの条件がunknownまたは不適合かを保持する。style/caseの意味不足はHARNESS、assignment/capabilityの照合はOS/SECURITY既存ownerへ戻す。runtime成功、provider動作、旧HAT-HIL-01の実行は候補受入条件ではない。
- **旧sourceとcontext**：旧IR `requirements.json#/HIL-BR-12`（asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、source statement semantic digest `8db32d18…f39e4`）を一atomとする。旧L1 line 64（asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`）は同じstatementのcorroborationで追加atomに数えない。HR-FR-HIL-01とHAC-HIL-01a/b/c、HAT-HIL-01のidentity・digestはcoverage receiptにcontextとして固定するが、関連契約/consumer全体のclosureを主張しない。
### HELIXOS-L11-120 Agent instance lifecycle outcome and terminal separation 受入候補（未採択・未実行）

- **権限と入力**：未採択の `HELIXOS-L2-120` に対する静的な受入oracle候補。採択済みの2026-09-28 L2/L11集合を変更せず、runtime・test・CI・Issue・mergeを実行しない。明示的に選ばれたWorker operationとその契約revision、対象ticket/要求revisionとscope、assignment/attempt identity、authority/capability/lease evidence、checkpoint、result、独立検証記録を与える。operationにlifecycle契約がない、または対応関係が不明なら、該当状態をunknownのままにし、provider名やagent名から適用性を推定しない。
- **正常系：稼働からresultまで**：契約に合うinstance進行として、登録済みidentity/根拠、eligible、muster/assignment、current lease、running、checkpoint、completed/failed/cancelledのいずれか、独立verification、releaseを順に示す。各遷移と証拠は同じcurrent target revisionおよびassignment/attemptを指す。failedまたはcancelledのresultはその結果として独立検証できるが、成功作業として表示しない。生成Workerとは別のverifierがrelease前にresultを確認する。
- **具体的な正常例**：以下はfixture内の例示IDであり、現行ticketや権限を作らない。`worker-op-demo@r3`のownerが契約`lifecycle@r2`を選び、scope `S-demo`に適用する理由を記録する。ticket `T-demo`の要求`REQ-demo@r7`、assignment/attempt `A-demo/try-1`、instance `I-demo`を登録identity/evidenceで束縛し、同じ対象scope/revisionのeligible→mustered→lease `L-demo`→running→checkpoint `C-demo`→completed result `R-demo`と辿る。生成者と異なるverifier `V-demo`が同じresultを検証してからreleaseする。各closure参照はidentity/owner/contract revision/適用理由に戻り、対象入力が同じなら同じ有効依存closureを返す。
- **正常系：依存4区分**：同じfixtureで、常時必須（選択operation/owner/契約revision/適用理由、target revision/scope、identity/authority/oracle）、選択操作時のみ必須となるassignment/lease/checkpoint/verification evidence、明示選択したsourceのidentity/revision、旧provider資料などの参照資料のみを分けて入力する。該当操作では必要依存だけがclosureへ入り、選択条件の不成立で操作を含めないscopeに限り操作固有依存をclosure外にする。未選択sourceは未観測、参照のみ資料は権威/evidence/依存に転用されず、同一入力と契約revisionなら有効closureと理由が再現する。
- **正常系：終端分岐**：instance `I-q-demo`を理由/evidence付きquarantinedとして、別のinstance `I-r-demo`を別理由/evidence付きretiredとして示す。どちらの終端分岐の後も、各同一identityのinstanceをeligible/running/releasedへ戻さない。別instanceを開始できるのは、それ自身のidentityとauthorityを持つ既存operation契約による場合だけ。
- **異常系：不正または欠落した遷移**：registered identity/登録根拠、eligibility/muster/assignment/lease/checkpoint/result/independent verificationの証拠を一つずつ省く、target revision・scope・assignment/attempt・authority・lease・event順を不一致にする、または競合するcurrent lifecycle stateを作る重複/矛盾eventを与える。該当stateはunknown/unfinishedのままとし、後段state名やevent件数から推定しない。
- **異常系：依存区分と登録**：登録identityまたは根拠がないfixture、owner/契約版/適用理由が欠けるfixture、選択operationで必要なsourceがunknown/stale/missingのfixture、未選択sourceを不在または成功に変えるfixture、参照資料を現行authority/oracleへ用いるfixtureを個別に与える。unknownをfalse/non-applicableへ丸める、未選択sourceを見たことにする、または別source/providerへfallbackする場合はその操作のclosureを拒否する。
- **異常系：resultと終端の混同**：failed/cancelledを成功として示す、生成Worker自身に自己検証させる、独立verification前にreleaseする、または同じquarantined/retired identityをactive/releasedへ戻す。それぞれを個別に拒否する。既存の終端assignment後のlate resultとCI event-classのrun置換は別候補115/118の境界で扱い、本候補の新たなsource coverageとはしない。
- **未見operation**：未見のworker/provider実装について、明示されたcurrent operation契約と対応証拠を与える。旧enumやtransportを要求せず、その契約からsemantic stageを評価する。対応、authority、source revision、または終端分岐が不明ならunknownのままにして、不足関係を返す。provider固有のfallbackを作らない。
- **scopeと証拠**：選択したHIL-FR-32 lifecycle行と、リンクされたHR-FR-HIL-08/HAC-HIL-08a/b/c/HAT-HIL-08のcontextだけを比較する。静的fixtureの合格は、旧runtime、現行実行、HIL-FR-32の全consumer closure、正式successor割当の証明ではない。

### HELIXOS-L11-122 HIL-NFR-01 owner間副作用の冪等な引継ぎ候補（未採択・未実行）

- **対応要求・authority**：未採択`HELIXOS-L2-122`の静的受入oracle候補。2026-09-28 OS decisionの固定L2/L11 bytesを変えず、本候補、fixture、receipt、文書検証は要求採択、旧sourceのformal successor、実装・実行・memory昇格を意味しない。PO判断より前に忠実候補を作成・reviewすることは妨げず、要求採否または意味変更は既存authorityへ残す。
- **正常例：重複配送・全owner結果あり**：同一source/causeに結ばれたGitHub delivery `D1`、Issue contract revision/digest `C1`、job `J1`、PR head `H1`と、それぞれのeffect ownerが既に返した結果・既存receiptを与える。初回入力後に同じdeliveryを再配送し、同じcontract／job／headのoperationを再開しても、同じ論理Issue、同じ実装効果、選択された場合の同じmemory昇格resultへ既存receiptで再結合し、どの効果も二重生成しない。知識の評価・保持は1.0〜2.xでLABO、3.0から改善利用はINTELLIGENCE、汎用知識の採用はBRAINの既存ownerが決める。OSはそれらのowner resultをsource/causeへ対応付けるだけである。
- **正常例：部分失敗後の再開**：Issue作成receiptが既に成功を示し、後続実装operationが未実行と既存owner証拠で確認でき、memory operationは選択されていないfixtureを与える。中断後の同一入力再開は既存Issueをもう一度作らず、既存authority・ticket/assignment contract内で未実行と確認できた実装だけを続け、memoryを昇格しない。成功済み・未実行・失敗・unknownの各結果と未完義務を別々に表示する。
- **正常例：異なるheadの保持**：同じPRの次のhead `H2`を別revisionのeventとして与える。`H1`のreceiptを`H2`の結果へ流用せず、owner contractが識別する別revisionを維持する。内容が似ているだけで新しいheadを重複とみなさない。新headの実行やmerge authorityは本fixtureから生成しない。
- **独立negative oracle**：各例で他条件を固定し、(1)同じdelivery再送でIssueを2件作る、(2)同じIssue contract／jobを再開して実装効果を再実行する、(3)先行効果のreceiptがあるのに次ownerの失敗後に先行効果まで再実行する、(4)memory effect結果unknownなのに未昇格と決めつけ再度promoteする、(5)同一operation identityで異payloadを受けても上書きまたは別効果へ進む、(6)既存効果のreceipt欠落・stale・conflictを未実行／成功と推定してblind retryする、(7)新PR headを旧headの同一結果へ潰す、(8)未選択sourceやprovider memoryを既存結果の代用にする、を個別に投入する。重複effect、偽成功、誤った処理省略があれば不合格とし、該当effectをunknown/conflict/未完として維持して既存ownerへ戻す。
- **信頼境界の負例**：HAC-HIL-01cの例に沿い、外部本文へdispatch命令が埋め込まれていても、その文をauthorityに昇格せずdispatchを0とする。これはHIL-NFR-01のsource atomを追加せず、HR-FR-HIL-01のtrust boundaryを併せて確認するconsumer条件である。
- **dependency closure oracle**：採択済みHARNESS-L2-023の固定意味を利用する。同一pack/contract revision、operation、scope、明示source selection、各dependency identity/owner/version-range/applicability evidenceの同じ入力を再評価し、依存closureと理由が一致することを確認する。常時必須・成立した操作・選択source依存は閉じ、未選択sourceは未観測、参照資料は実行closure外と示す。identity/owner/version/applicabilityがmissingまたはunknown、選択source取得失敗、同一入力でのclosure変動を、false/non-applicableへ変換したり別sourceへfallbackしたりした場合は不合格である。
- **未見・unknown**：未fixtureのdelivery redelivery経路、owner、contract版またはeffect resultを与える。既存contractとsource receiptが同一operation/payloadを照合できない、effectの実行有無がunknown、identity間の因果が一意でない場合は、そのeffectを成功・未実行と推定せずunknown/未完として返す。入力欠落だけで該当source不存在、memory非該当または再実行安全を表示しない。必要なidentity・契約・effect ownerへ照合を返し、関係のない確定済みeffectと未完義務を保持する。
- **既存pair・責務境界**：L2/L11-007/009/019のprovenance、durable event、idempotent projection、checkpoint、continuityを利用するが、単一event projectionの冪等だけでIssue／実装／memoryの全副作用が成立したとはしない。採否は各判断記録の対象revisionとsection digestから読む。`HELIXOS-L2-035/L11-035`は2026-09-29 57-candidate decision 58行で採択済み（L2 `01ab4c9e572c5af909e4dbf46fb8f44866dd6cc7701dddc88b8dabbe14fb6c03`、L11 `8507d8f43c2aafae4d8b08fc27e9c3c7c28e6d4a74d912b7667d3dc27786c742`）。そのscopeは選択PR lifecycle eventから同じ論理監査jobを一度だけ生成する点で本候補のdelivery/event→jobと重なるが、Issue作成・実装・選択memory効果や4 identity全体のowner間closureを規定しない。`HARNESS-L2-059/L11-059`（2026-09-30 live26 decision 44行、L2 `9ebafbcc5b738dbaccaa53bfaff0b5843b0dd5fba30cc68beb51fe1dbe2e267f`、L11 `830646bc2f5bafcce50d20c88fb3d657ad7f5e2353dcf148628151a7c0992198`）と`HELIXOS-L2-102/L11-102`（同decision 55行、L2 `5d020c09b0e5686e01876e3c52d2ce10e8aded44a799a9f6374542d31de31218`、L11 `0bfce78875f0e59ded0a2f2ecd31f39e795e043105d33c762d38e15251ea8459`）は、同decision 70行で一組として採択済み。059は11 fieldのIssue contract意味・必須存在を、102は同一revision/digestのdurable intake/projection/handoffを持つが、4 identityにまたがるIssue・実装・memory昇格の重複効果を閉じない。これらの採択済み近接条件は本候補の採択根拠ではなく、122は未採択候補のまま既存保証を置換せず、全owner間の効果重複防止だけを追加提案する。旧metadataの「候補」表記から各revisionの採否を推定しない。OSはmemory eligibilityやknowledge retentionを判断せず、1.0〜2.x LABO評価・保持、3.0 INTELLIGENCEの改善利用、BRAINの汎用知識採用境界を変えない。
- **限界**：受入は固定source identityの候補条件を文書・fixture上で区別する静的oracleであり、exactly-once transport、全owner横断transaction、具体的retry数／時間窓、runtime、provider、実CIまたは旧HAT実行の成功を要求・主張しない。曖昧な方式がunknownであることを、旧runtimeを起動して解消しない。

### HELIXOS-L11-123 HIL-BR-14 source authorityとatomic traceの静的oracle候補（未実行）

- **対応要求・authority**：未採択`HELIXOS-L2-123`の静的oracle候補。2026-09-28 OS decisionの固定L2/L11、既採択候補、source authority、外部取得、実装・runtime/test/CI実行、要求受入、旧要求formal successorを生成しない。旧HAT-HIL-09は`designed_not_implemented`であり実行しない。
- **静的fixture**：実データ・remoteへの接続を行わない合成入力として、ZIP source 1件、repo-A=`unison-ai-product/UT-TDD_AGENT-HARNESS`、repo-B=`RetryYN/ai-dev-kit-vscode`のadvertisement/receipt、source span ledgerを与える。両repoについて独立なadvertisement A/Bが同一の観測revisionとref集合を示すfixtureを与え、fixture内のrepo-Aにhead `main`とtag `v1`がentries `{a,b}`を参照し、pull ref `pr/7`が`{b}`を参照、repo-Bのhead `main`が`{c}`を参照するとする。fixtureでref count=4、unique tree entry count=3、ref-entry edge count=6となることをreceiptの集合から再計算する。この数値はfixture結果だけで、要求閾値・実archive分母ではない。ZIP/current HELIX sourceにはそれぞれ明示spanとatomic behaviorを与える。
- **正常系**：両方のrepo identityがexactに一致し、advertised refsとreceipt refsが同一で、各ref OID・object/tree検証とsnapshot provenanceが一致するfixtureでは、receiptからのみ分母を算出する。source spanをatomic behaviorへ分け、各atomを個別の採否判断（未判断ならpending）からrequirement→design→test→Gateのtraceへ結ぶ。decisionがpendingのatomは後続traceがあってもadoptedにしない。元source scope全体の採否と後続traceがそろった場合だけ、その対象scopeのpending/orphanが0であることを表示できる。
- **否定例を個別に与える**： (1) advertised `refs/tags/v1`をreceiptから落とす、または余分なrefを足す、(2) ref OIDを異なるtreeへ差し替える、(3) repo identityを別名/別repositoryへ変える、(4) A/B advertisementまたは取得時点がずれる、(5) receipt/source/extractor revisionがstale、(6) parent/file aggregateだけを登録しchild atomを省く/重複する、(7) atomに採否判断または判断revisionがない、(8) requirement/design/test/Gateのいずれかのtrace edgeを外す、を個別に与え、それぞれ該当scopeのauthority/closureを拒否またはpendingに保つ。別のrefが成功しても不足を相殺しない。
- **unknown・未見条件**：新しいref namespace、pull-ref規則、source class、span形式、tree entry種別、extractor/authority revisionをfixtureに与えない。これらの適用性・authority・内容対応が未知ならunknownとして残し、非該当・0・採択済みへ補完しない。ref集合が閉じていない場合は三分母を確定済みとして提示しない。
- **既存契約との対応**：採択済みOS-002/005/007の一般的な個別project tracking、改善候補trace、provenanceは入力/trace接続点として確認する。HARNESS-L2-067はsource atomizationの未採択候補として別状態に保持する。いずれも、この候補のexact 2 repository/current advertised refs、receipt由来dynamic denominator、BR14の採否→requirement/design/test/Gate全辺の成立証拠として数えない。
- **依存区分・同一入力（HARNESS-L2-023採択済み本文に基づく合成fixture）**：HARNESS-L2-023はHARNESS 2026-09-28 decision row 52の採択済み候補であり、同じ入力から同じ有効依存closureを再現する。次の値はoracle例だけの合成tokenであり、実owner、実contract revision、version比較規則、依存registryを追加しない。fixtureは`pack_id=fixture:BR14-pack`、`pack_revision=fixture-pack-r1`、`source_revision=fixture-source-r1`、L2-010/011 contract revision=`fixture-010-r1`/`fixture-011-r1`、operation=`inventory-selected-BR14-sources`、target/scope=`fixture:BR14-scope`、selected input set=`ZIP`＋exact repository `unison-ai-product/UT-TDD_AGENT-HARNESS`＋`RetryYN/ai-dev-kit-vscode`＋current HELIX source identity `fixture:current-HELIX-source@fixture-source-r1`とする。権限・安全入力は`fixture:authority-read`、`fixture:read-only-isolation`、`fixture:source-analysis-data-use`という明示値で、実credentialや実接続を使わない。各dependency rowはidentity、fixture内の宣言owner ref、contract version、compatibility range token、そのrangeへの明示的なfixture compatibility evidence、4区分、applicability conditionとその根拠を持たせる。version/range tokenの比較意味はfixture owner declarationが与える入力であり、本候補が互換規則を定義しない。
  - 常時必須：`fixture:core-trace`。declared owner `fixture-owner:core`、contract `fixture-contract:core-r1`、range `fixture-range:core-r1`、fixture evidence `compatible=true`、condition=`always`。
  - 特定操作時のみ必須：`fixture:ref-authority`。declared owner `fixture-owner:authority`、contract `fixture-contract:authority-r2`、range `fixture-range:authority-r2`、明示compatibility evidence、condition=`operation is inventory-selected-BR14-sources`。当fixtureでは条件trueなので必須。
  - 選択した入力元に応じて必須：選択されたZIP、repo A、repo B、current HELIX sourceそれぞれに対応するfixture dependency identity/owner/contract/rangeをsource choiceへ束縛し、current HELIX sourceではidentity=`fixture:current-HELIX-source`、revision=`fixture-source-r1`、owner=`fixture-owner:current-helix-source`、contract=`fixture-contract:current-helix-source-r1`、range=`fixture-range:current-helix-source-r1`および明示compatibility evidenceを与えて、各選択sourceの依存をclosureへ含める。入力source token以外の候補sourceがpackに宣言されていて未選択なら出力は`unobserved`で、存在・不在・適格性・成功へ変換しない。その外部候補はこのBR14の選択scopeにもatom数にも加えない。
  - 参照資料のみ：`fixture:glossary-note`は説明用でowner/版scopeを持つfixture rowとして`reference only`に分類し、実行条件、authority、source選択、security制約、oracleをこの分類へ移せない。
  - **正常結果**：完全に同じpack/source/010/011 revision、operation、scope、source choice、authority/isolation/data-use値、dependency identity/owner/contract/range/compatibility evidence、区分・applicability入力を再評価すると、各dependencyのeffective class/state/reasonが同じになる。4区分を保持し、未選択sourceはunobserved、参照資料だけはclosure外、該当操作と選択sourceの条件がtrueならその依存は必須となる。選択sourceの失敗から別sourceへfallbackしない。
  - **欠落・wrong・unknown反例**：(1) pack ID/revisionまたはsource revision欠落・stale・別値、(2) L2-010/011 contract identity/revision欠落またはwrong、(3) operation/target/scope欠落・不一致で適用条件を評価できない、(4) source choice欠落・repo identity wrong・選択したsourceのreceipt欠落を個別に与え、closureをunknown/pendingにする。 (5) authority、read/write権限、隔離、data-use classificationのどれかがmissing/unknown/wrongなら、該当安全依存はoptional/reference-onlyにせず該当操作を保留する。 (6) dependency identity/owner ref欠落・別ownerへの無根拠置換、(7) contract version/rangeまたは明示compatibility evidence欠落・stale・wrong・unknownを与え、互換を推測せず保留する。 (8) 4区分、operation/source applicability condition、条件根拠の欠落・矛盾・unknownをfalseまたはreference onlyへ読み替えない。 (9) source authorityやrequired oracleを`reference only`へ分類する誤りを拒否する。(10)同一入力/revisionに異なるeffective closureを返す、または選択source failureから別sourceへ切替える場合は再現条件不一致/暗黙fallbackとして不合格にする。各例は単独に投入し、他の入力の成功で不足を相殺しない。
  本候補はHARNESS-L2-023の既決4分類と受入をBR14候補の入力・oracle境界に適用するだけであり、dependency owner、version range、compatibility rule、適用条件のauthorityを作らない。
- **読み取り・権限境界**：旧sourceのみをread-onlyで使い、sourceに列挙されたGitHub repository namesからremote接続、fetch、pull、clone、実credential使用、GitHub Issue/PR、旧runtime/test/CIを起動しない。fixtureの実行・採否・人間decision・PO選択を生成しない。
- **未完保持**：選択したHIL-BR-14 atomは`MPR-SH-IR-003#HIL-BR-14`の`preserved_pending_rehome`として生存させ、formal successor、全旧consumer closure、全資産回収、実装済み・受入済みは主張しない。L1 line 66は同一atomのcorroboration、HR/HAC/HATはcontextであり件数に加えない。

### HELIXOS-L11-124 旧五機能の判定結果・failure code・provenance受入候補（未採択・未実行）

- **対応・権限**：未採択HELIXOS-L2-124の静的oracle候補。2026-09-28採択L2/L11固定revision、2026-09-29/30採択pairは変更しない。fixtureの静的記述・検証は要求採択、source closure、実機能の稼働、実行済み受入、実装許可を意味しない。
- **fixture**：架空のtarget revision `rev-A`、scope `scope-A`、既存HARNESS verification contract `contract-A`、適用oracle `oracle-A`と、五つの独立source roleを使う。各fixtureのrole/function identity・owner・versionは検証用合成値であり、現行owner・system ID・schemaを定義しない。五roleのcurrent contractへの対応が未提示なら、そのroleは`unknown`であり、fixtureから対応済みとは推定しない。
- **正常例**：PR監査、Issue Gate、agent registry、memory compaction、ZIP detectorの各roleについて、別々の適用契約・入力source revision・target revision・scope・oracle・機能identityが選択されている。各結果は機械可読な判定と、そのroleに適用する契約が求める実結果/evidence、入力・対象・機能のprovenanceへ結び付く。成功結果は対応するoracle outcomeの根拠を持ち、失敗結果は適用契約が定めるfailure codeとprovenanceの両方を持つ。五roleの個別結果が対応付いている範囲だけを候補条件の成立として示す。成功・失敗のcode値やfield schemaはこのfixtureで新設しない。
- **role別の合成正常fixture**：次の値はL11 oracleの入力例に限る合成identity/valueであり、実owner、現行function ID、version、field schemaまたはfailure enumを指定しない。各rowを独立に評価し、どれか一つのresultで他roleを満たさない。

  | source role | selected input / target | 合成contract・oracle・機能版 | outcome / evidence | provenance relation | 独立failure fixture code（例） |
  |---|---|---|---|---|---|
  | PR監査 | `fixture-pr#head-A` / `scope-A` | `fixture-audit-contract@1` / `fixture-review-oracle@1` / `fixture-pr-audit@1` | `finding-present`、PR差分へ結ばれたfinding evidence | source head→audit operation→finding result | `fixture.PR_AUDIT_EVIDENCE_MISSING` |
  | Issue Gate | `fixture-issue#rev-A` / `scope-A` | `fixture-issue-contract@1` / `fixture-admission-oracle@1` / `fixture-issue-gate@1` | `eligible`または`ineligible`の構造化判定と根拠source span | Issue revision→Gate evaluation→decision evidence | `fixture.ISSUE_GATE_CONTRACT_INCOMPLETE` |
  | agent registry | `fixture-agent#rev-A` / `scope-A` | `fixture-agent-contract@1` / `fixture-registry-oracle@1` / `fixture-agent-registry@1` | 登録/不成立結果と登録入力の証拠 | agent record→registry evaluation→result | `fixture.AGENT_REGISTRY_PROVENANCE_MISSING` |
  | memory compaction | `fixture-episode#rev-A`と選択span `fixture-span-A` / `scope-A` | `fixture-memory-contract@1` / `fixture-compaction-oracle@1` / `fixture-compactor@1` | `complete`または`incomplete`の構造化結果とspan対応coverage evidence | selected source span→compaction operation→result | `fixture.MEMORY_COMPACTION_SOURCE_MISSING` |
  | ZIP detector | `fixture-zip-snapshot#digest-A` / `scope-A` | `fixture-detector-contract@1` / `fixture-detector-oracle@1` / `fixture-zip-detector@1` | 構造化finding有/無と検査対象evidence | input snapshot→detector run→finding/result | `fixture.ZIP_DETECTOR_EVIDENCE_MISSING` |

  合成failure codeはfixtureで欠落時の識別を示すだけであり、新しいcurrent code値や共通enumではない。直接source oracleの`HIL_ISSUE_CONTRACT_INCOMPLETE`、`HIL_AGENT_CONTRACT_INCOMPLETE`、`HIL_MEMORY_EVENT_MIXED`、`HIL_DETECTOR_FINDING_EVIDENCE_MISSING`、`HIL_PROSE_ONLY_EVIDENCE`は旧設計値としてsource ledgerに保持し、現行codeへ割り当てない。
- **PR監査の個別反例**：監査本文に「PASS」とだけ書かれ、選択PR head/revision、finding identityまたは適用oracle結果へ辿れない入力を与える。proseから監査成立を生成しない。失敗findingでfailure codeだけが欠ける例とprovenanceだけが欠ける例も別々に与え、各々を未完とする。採択済みHARNESS-L2-058のfinding分類およびOS-L2-034/101のdisposition receiptはその定める範囲だけ利用し、監査結果全体へ新しい分類を足さない。
- **Issue Gateの個別反例**：Issue Gateが「PASS」と返すが、適用契約または評価対象Issue revisionとの結び付きがないfixtureを与え、成立としない。failure resultで適用contractが要求するcode、またはIssue/scope/oracle provenanceの片方が欠ける例も別々に未完とする。Issue contract field omission（HARNESS-L2-059/OS-L2-102）やClosure Gateの欠落evidence（HARNESS-L2-057/OS-L2-054）は各採択pairの個別条件を確認する参照であり、それだけでNFR-08の全Issue Gate conditionを閉じない。
- **agent registryの個別反例**：agent registryの結果が文字列で「登録済み」とだけ示され、対象identity/version/source revisionへのprovenanceがない例を不成立とする。失敗結果についてfailure code欠落とprovenance欠落を別々に与える。採択済みOS-L2-033のagent metadata engine capability登録やHARNESS-L2-047のspecialist capability契約を参照できるが、fixtureだけで両者を旧agent registry functionと完全同一視しない。
- **memory compactionの個別反例**：summary proseに「compaction成功」とだけあり、対象episode/source・適用oracleのevidenceへ辿れない例を不成立とする。失敗時のfailure code欠落とsource/projection provenance欠落を別々に未完とする。採択済みOS-L2-019 continuityと未採択OS-L2-119 compaction候補を別条件として保ち、どちらかの存在で旧compaction functionの成立を宣言しない。
- **ZIP detectorの個別反例**：detectorがproseで「問題なし」とする一方、選択input snapshot、detector identity/versionまたはstructured finding/evidenceがない例を不成立とする。採択済みOS-L2-033/L11-033が要求するfinding code/evidence/provenanceの欠落例も確認し、unknown/partial runを再現成功へしない。ZIP由来runtime、言語、registry implementationは起動しない。
- **横断negative oracle**：各roleで、(1)適用契約が要求するfailure code欠落、(2)同role結果から対象・入力source・revisionまたはscopeへ辿るprovenance欠落、(3)説明文だけのPASS、(4)別roleのcode/evidenceを転用した偽の合格を、それぞれ独立に与える。いずれも該当roleを未完/unknownにし、他roleの成功で補完しない。failure codeが適用契約上不要な正常結果へfailureを捏造する必要はないが、構造化されたoracle outcomeとprovenanceは要する。
- **未見例**：五roleのいずれかで未知のcurrent function identity/version、未提示の入力source class、または未確認の適用contractを与える。似た名前のfunction、旧runtime、一般CI green、別role evidenceへ自動対応づけず、未見roleの適用結果をunknownとして保持する。roleが存在しない、非該当、または成功と断定しない。
- **依存区分（HARNESS-L2-023 concrete tuple）**：固定採択済みHARNESS-L2-023/L11-023の意味を、次の合成入力で確認する。fixture pack `fixture-pack#NFR08@1`、operation `fixture-evaluate-PR-audit`、scope `fixture-scope-A`、対象`fixture-target#rev-A`、explicit selected source `fixture-pr-head#A`。常時必須dependencyは`HELIXOS-L2-007@adopted`（identity/owner=`fixture-OS-evidence-owner`、declared range=`1.x`、適用根拠=`all selected evidence operations`）と`HARNESS-L2-023@adopted`（identity/owner=`fixture-HARNESS-dependency-contract-owner`、range=`1.x`、根拠=`fixed four-category dependency semantics`）。当該operation成立時のoperation dependencyは`fixture-PR-audit-contract@1`（identity、owner=`fixture-owner-PR-audit`、declared range=`[1,2)`、applicability=`operation=fixture-evaluate-PR-audit AND scope=fixture-scope-A`）とし、condition resultを`applicable=true`で記録する。選択入力依存は`fixture-pr-head#A`（identity/revision/digest、owner=`fixture-source-owner`、read contract=`fixture-PR-source-contract@1`、選択理由=`explicit source selection for this operation`）。参照のみは旧`HST-CASE-009-09`と旧runtime/test資料で、現在のidentity・authority・成功には使わない。同一pack/contract revision・operation・scope・selectionを再評価したとき、この同じdependency identity・owner・range・applicability根拠とclosure結果を再現する。さらにHARNESS-L2-010のpack contract call boundaryを`fixture-HARNESS-L2-010@1`（owner=`fixture-owner-pack-boundary`、declared compatibility range=`[1,2)`）として、HARNESS-L2-011のdetached-call conditionを`fixture-HARNESS-L2-011@1`（owner=`fixture-owner-detached-call`、range=`[1,2)`）としてoperation tupleへ含める。selected revisions `1.0`と適用根拠付きの合成compatibility evidence `fixture-compat-evidence#digest-B`が各rangeに適合するときだけ同一input closureを成立とする。compatibility evidenceの欠落、digest対象revision不一致、declared range外のrevision、unknown compatibility、010または011のidentity/owner欠落は各々個別にclosure incomplete/unknownであり、暗黙互換としてpassしない。これらのfixture値は採択済み010/011の実revisionやcompatibility規則を変更しない。これらの`fixture-*` ownerやrangeは例示値であり、現行owner/version/compatibility規則を新設しない。欠落例ではowner、dependency identity、declared range、applicability条件、applicability根拠、selected source identityを一項目ずつ外し、各々をclosure incomplete/unknownとしてpassを返さない。selected source read failure時に別sourceへfallbackした例、同入力でclosure結果だけが変わる例も個別に不成立とする。未選択role/sourceは未観測で、参照のみへ移さない。
- **採択済み条件との区別**：OS-L2-033/L11-033のdetector resultはその採択scopeでfinding code/evidence/provenanceを持つ。OS-L2-035/L11-035はPR event intakeとaudit job requestまでで、監査resultではない。HARNESS-L2-058およびOS-L2-034/101のPR finding分類・receiptはその分類/disposition条件である。HARNESS-L2-059/OS-L2-102はIssue contract field/intake条件、OS-L2-054は選択closure条件、OS-L2-044はfeedback prose handover条件であり、旧五roleすべてのfailure code/provenance条件へ横展開しない。OS-L2-119は候補、OS-L2-019はcontinuityであり、memory compactionのfailure-code oracleとは同一でない。
- **PO判断材料**：A) 旧sourceどおり五roleを個別に維持し、各failure code/provenanceとprose-only PASS拒否を適用する（推奨、機能技術・ownerは固定しない）。B) role列挙を例示へ弱めて汎用evidenceだけで満たせるとする（意味変更）。C) 明示的に選択したrole subsetだけへ狭め、除外roleを未完holdingに残す（意味変更）。AとB/Cの差はsourceにある五つの個別role条件を合格対象として維持するかであり、影響はHELIXOS-L2-124と対応L11の対象role/条件 closureに限る。候補の作成・review前にこの判断を要求せず、A以外の採択・意味変更は既存authorityへ残す。
- **限界**：source上version_targetなし。候補はコード体系、DB/API/runtime/tool identity、作成・close・promote等のoperation権限、実行stage gateを新設しない。OS-L2-124/L11-124は五roleの証拠接続候補であり、機能実装、runtime/CI成功、旧HR-FR-HIL-09全体のformal successorまたはclosureを主張しない。

### HELIXOS-L11-125 Worker結果境界fail-closeの受入候補

- **状態**：未採択候補に対する未実行oracle。候補・fixture・静的確認は採択、実装、実行、成功を意味しない。
- **対象入力**：同一の合成ticket/要求revision/scope、operation契約revision、assignment/attempt、選択result source、適用HARNESS oracle、OS結果記録境界を与える。size上限・期限・必要sequenceは入力契約のfixture値であり、製品標準値を定義しない。
- **正常例**：fixture operation `op-A@r1`、要求`req-A@r1`、scope`scope-A`、assignment`assign-A`、attempt`attempt-1`、選択Worker `worker-A`、契約内の完全な結果と連続sequence、宣言上限内のpayload、期限内のterminal outcomeを与える。OSは同一attemptへの出所・完全性・状態・未完義務を結ぶ。HARNESS oracleが当該結果を受け入れた時だけそのoracleに対応する検収結果を記録する。fixture tokenは実ID・schema・providerを指定しない。
- **個別negative cases**：各fixtureは単独で投入し、どのfailure classが拒否されたかを別々に判定する。
  1. 不正JSONを与え、結果をparse/validation済み成功として記録しない。
  2. valid JSONだが選択operation契約とschema/field条件が合わない結果を与え、同じく成功結果へ昇格しない。
  3. declared maximumを超えるpayloadを与え、部分parse結果を正本化しない。
  4. required sequenceを一つ欠落させ、後続sequenceだけで連続完了を主張しない。
  5. Worker crashをterminal成功結果として扱わず、未完attemptと戻し先を記録する。
  6. 期限超過後の結果を通常成功にせず、期限失効状態と未完義務を保持する。
  7. cancel後に届いた結果を取消済みattemptの成功へ結びつけない。
  8. backpressure状態のfixtureを与え、結果断片の欠落有無にかかわらず当該attemptをfail-closeし、受領済み断片を全結果へ昇格しない。
  9. 親実行主体が消失したfixtureで、親のterminal/authorityを推測し結果を正本化しない。
  10. partial resultのみ存在するfixtureで、別の明示された有効完成条件がないままcanonical successにしない。
- **未見例**：未知のfailure code、未登録契約revision、適用可否不明なresult sourceを与える。候補oracleはunknown/pendingで保持し、成功・N/A・fallbackへ変換しない。具体的failure taxonomyやschemaの追加を暗黙推測しない。
- **戻し先と証拠**：各negativeでattempt identity、要求revision、operation契約、欠落/不一致facet、状態、未完義務、再開/戻し先を追えることを確認する。failureを検知したという記録だけで、OS状態遷移やHARNESS受入の強制成立を推定しない。実行主体、契約owner、HARNESS oracle owner、SECURITY/INFRASTRUCTURE境界を分ける。
- **依存区分・具体closure fixture**：同じfixture入力にはpack=`fixture:os-result-boundary`、pack revision=`fixture-os125-r1`、source revision=`fixture-source-r1`、HARNESS-L2-010 revision=`fixture-h010-r1`、L2-011 revision=`fixture-h011-r1`、operation=`receive-result`、target/scope=`fixture:req-A@r1/scope-A`、selected Worker source=`fixture:worker-A@r1`を与える。各dependency rowにはidentity・宣言owner・contract version・compatibility range・そのrangeに対する明示根拠・4分類・applicability conditionを含む。これらは受入用の合成tokenであり、実ownerや実registryを指定しない。
  - 常時必須：`fixture:ticket-result-contract`（owner `fixture-owner:HARNESS`、contract `fixture-contract:oracle-r1`、range `fixture-range:oracle-r1`、根拠`fixture-compat:oracle-r1=true`、class=`always`、condition=`all receive-result operations`）。
  - 特定操作時のみ必須：`fixture:terminal-state`（owner `fixture-owner:OS`、contract `fixture-contract:terminal-r1`、range `fixture-range:terminal-r1`、根拠`fixture-compat:terminal-r1=true`、class=`operation-only`、condition=`receive-result or resume`）。この正常fixtureでは適用される。
  - 選択した入力元に応じて必須：`fixture:worker-A@r1`（owner `fixture-owner:worker-A`、contract `fixture-contract:worker-result-r1`、range `fixture-range:worker-result-r1`、根拠`fixture-compat:worker-result-r1=true`、class=`selected-source`、condition=`selected source is worker-A@r1`）。別source `fixture:worker-B@r1`は選択しないため`unobserved`とし、成功/不在/適格へ変換しない。A失敗時にBへfallbackしない。
  - 参照資料のみ：`fixture:legacy-ipc-notes`（owner `fixture-owner:archive`、version `fixture-note-r1`、range `fixture-range:reference-only`、class=`reference-only`、condition=`background only`）。旧protocol/schema記述を実行依存やoracleへ昇格しない。
  - **正常closure**：上記identity・owner・version/range・compatibility根拠・分類・condition、pack/source/010/011 revisionを再入力すると同じeffective closure/reasonを返し、対象操作のalways/operation/selected-source依存は閉じ、未選択sourceは未観測、参照資料はclosure外となる。
  - **独立closure反例**：常時依存、operation-only依存、selected-source依存の各identity/owner/version range/compatibility根拠/class/applicability conditionのいずれか一つを個別に欠落・wrong/unknownにする。さらにpack/source/010/011 revisionを個別にmissing/stale/wrongにする。各fixtureで実行依存closureをunknown/pendingとし、他依存の成功で補完しない。選択sourceの失敗後にworker-Bへ切り替える例も個別拒否する。reference-only fixtureは別に扱う：classがreference-onlyと明示済みのまま説明文や参照元owner/version/range/evidenceが欠けるときは、その資料の参照/provenance状態だけをunknownとして記録し、実行依存closureを止めず、資料を実行依存へ昇格しない。class/applicability自体がunknownまたはauthority/oracle等の実行条件を含みreference-onlyと矛盾するなら、参照のみと決めつけず分類をunknownに保つ。

### HELIXOS-L11-126 失効後fencingとdurable checkpoint再開の受入候補（未採択・未実行）

- **権限・範囲**：未採択HELIXOS-L2-126の静的oracle候補。選択されたlease管理下のagent operationだけを対象とし、要求採択、runtime/test/CI実行、操作許可、旧要求formal successorを意味しない。旧HAT-HIL-08は設計済み・未実装で、実行しない。
- **具体的な正常対照**：以下は合成fixture値である。operation `fixture:agent-op@r1`、ticket `fixture:T1@r3`、scope `fixture:S1`、旧ownerのassignment/attempt `fixture:A1/try-2`、active lease `fixture:L2`とmatching token `fixture:F2`、durable checkpoint `fixture:C7`を与える。leaseがactiveで既存authorityが有効な範囲では、matching tokenのtool callは既存operation契約へ渡せる。crash後は有効handoffにより新ownerのassignment/attempt `fixture:A2/try-1`へ移る。C7はA1/try-2をoriginとして記録するが、同じoperation/revision/scopeに属する最新durable checkpointであり、current fence下で再開し、attemptが異なるだけでは拒否せずC7からだけ行う。それより後の未永続progressは使わず、未完義務とcheckpointのorigin来歴を保持する。これらの値は受入fixture用で、製品token・lease・checkpoint schemaを定めない。
- **失効後の独立negative oracle**：各fixtureで他の条件は固定し、再割当前と再割当後を分けて試す。まずlease `fixture:L2`が期限切れとなり後継leaseがまだない状態で、L2由来token `fixture:F2`による(1)遅着tool call、(2)遅着artifact、(3)遅着completionを一件ずつ与える。次に新しいcurrent lease `fixture:L3`が成立した状態でも、同じ三effectを個別に与える。どちらの状態でも、失効したL2由来effectはtoken文字列が現行値と同じに見えてもcurrent eligible lease/fencing authorityに一致したとみなさず、それぞれtool operation、artifactのcurrent成果への採用、completion/current stateを拒否する。再割当前または再割当後のどれか一つを受け入れたら不合格とする。これは全ての失敗/終了種別へ一般化せず、旧原文のlease失効とfencing不一致に限り、token回転方式を要求しない。
- **checkpoint再開の独立negative oracle**：C7より後の未永続/staged/破損progressから再開する例、C7以前の古いC6を最新checkpointとして選ぶ例、provider memoryまたは途中artifactから位置を補う例を別々に与え、いずれも不合格とする。有効handoff後の新owner/新attemptが、origin attemptを記録したC7から同じoperation/revision/scopeを再開する正常例は、attempt identityが違うことだけでは拒否しない。handoff authority/provenanceがmissing/conflictならunknownとして止める。最後のdurable checkpointのidentity・revision・scope・最新性がmissing、stale、conflictまたはunknownなら、resumeを成功扱いせずunknown/未完として保つ。checkpoint内容が復元できないときに過去checkpointや別sourceへ暗黙fallbackしない。
- **依存4区分の正常closure fixture**：HARNESS-L2-023/L11-023の採択decision文書はcurrent base `d1fd70d4338717301b05f87da1806d2f81ec5b34`に存在し、row 52がpairを指定する。固定pair target `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2/L11 canonical section SHAは`32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03`／`f505c8e6a2887ac0cf757a78de6617f9a9ee3f9e36084fee70b8a11915815a47`で、4区分の分類oracleに使う。010/011はfixture契約入力として、同じfixed target上のL2-010 section SHA `9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4`、L2-011 section SHA `30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952`、L11-010 row SHA including LF `ee2d89c797d8d07d917b68fca55d386d487e67caac0e9cf0873fe674846e33cf`、L11-011 row SHA including LF `483c86d30dbece9bce50732e5faf9480b6c70c93f6b625330d27cb7784a57188`へ固定する。decision document revisionとpair target revisionは別である。010/011の採否は本候補から推定しない。
  - **同一入力**：`pack=fixture:os126-resume-scope@fixture-pack-r1`、`source=fixture:source-r1`、`operation=fixture:agent-effect-and-resume@fixture-op-r1`、`ticket=fixture:T1@r3`、`scope=fixture:S1`、old assignment=`fixture:A1/try-2`、post-crash new owner/assignment=`fixture:owner-B / fixture:A2/try-1`、L2-010=`fixture:h010-r1`、L2-011=`fixture:h011-r1`。010/011 fixed section/row SHAへの対応は各fixture contract revisionのidentity pinであり、packとの適用根拠は`fixture-compat:h010-r1-to-pack-r1=true`と`fixture-compat:h011-r1-to-pack-r1=true`である。以下のowner/range/evidence tokenとcompatibility結果は合成値で、実owner、実版または版比較規則を定義しない。
  - **常時必須（always-required）**：`fixture:operation@r1`（identity=`fixture:agent-effect-and-resume@fixture-op-r1`、owner=`fixture-owner:OS-operation`、contract=`fixture:os-operation-contract-r1`、declared range=`fixture-range:os-op-[1,2)`、compatibility evidence=`fixture-compat:os-op-r1-in-range=true`、applicability=`T1/S1の選択operation全体`）と`fixture:authority@r1`（owner=`fixture-owner:existing-authority`、contract=`fixture:authority-contract-r1`、range=`fixture-range:authority-[1,2)`、evidence=`fixture-compat:authority-r1-in-range=true`、applicability=`同じoperation/T1/S1`）。HARNESS-L2-010 rowはidentity=`fixture:HARNESS-L2-010@fixture:h010-r1`、owner=`fixture-owner:HARNESS-010`、contract revision=上記固定L2-010 section SHAとL11-010 row SHA、declared range=`fixture-range:harness-contract-[1,2)`、evidence=`fixture-compat:h010-r1-to-pack-r1=true`、class=`always-required`、applicability=`このpack/call fixture`とする。HARNESS-L2-011 rowもidentity=`fixture:HARNESS-L2-011@fixture:h011-r1`、owner=`fixture-owner:HARNESS-011`、contract revision=上記固定L2-011 section SHAとL11-011 row SHA、同range、evidence=`fixture-compat:h011-r1-to-pack-r1=true`、同class/applicabilityで別rowとして閉じる。
  - **特定操作時のみ必須（operation-only）**：`fixture:lease-effect-check@r1`（owner=`fixture-owner:lease-effect-boundary`、contract=`fixture:lease-effect-contract-r1`、range=`fixture-range:lease-[1,2)`、evidence=`fixture-compat:lease-effect-r1-in-range=true`、applicability=`expired lease後のeffect受領時`）と`fixture:checkpoint-resume-check@r1`（owner=`fixture-owner:checkpoint-boundary`、contract=`fixture:checkpoint-resume-contract-r1`、range=`fixture-range:checkpoint-[1,2)`、evidence=`fixture-compat:checkpoint-r1-in-range=true`、applicability=`crash後resume時`）。この正常入力では両条件を選択するため両rowがclosureへ入る。
  - **選択入力元に応じて必須（selected-source）**：明示選択した`fixture:lease-source@r2`（owner=`fixture-owner:lease-source`、contract=`fixture:lease-source-contract-r2`、range=`fixture-range:lease-source-[2,3)`、evidence=`fixture-compat:lease-source-r2-in-range=true`、applicability=`lease/fence判定source`）と`fixture:durable-checkpoint-source@r7`（owner=`fixture-owner:checkpoint-source`、contract=`fixture:checkpoint-source-contract-r7`、range=`fixture-range:checkpoint-source-[7,8)`、evidence=`fixture-compat:checkpoint-source-r7-in-range=true`、applicability=`resume checkpoint source`）。未選択`fixture:provider-memory@r4`は`unobserved`でありfallbackに使わない。
  - **参照資料のみ（reference-only）**：明示選択して背景参照する`fixture:legacy-HAT-HIL-08@r1`（owner=`fixture-owner:archive-test-design`、contract=`fixture:reference-only-note-r1`、range=`fixture-range:reference-only`、evidence=`fixture-compat:reference-context-only=true`、applicability=`oracle来歴の参照のみ。実行closure外`）。旧test/runtimeを現行source/oracleとして使わない。未選択sourceはreference-onlyではなくunobserved。
  - **正常closureと欄別単独反例**：上記全row・同一pack/source/operation・010/011 fixed revision・compatibility evidenceを同じ入力に再適用し、同じeffective closure/reasonを得る。実行必須rowは他入力を正常に固定したまま、identity、owner、contract revision、declared range、range evidence、class、applicabilityをそれぞれ一欄ずつmissingまたはwrongにした独立fixtureで、その適用operationをunknown/pendingにする。010/011各contract revisionとその個別compatibility evidenceも一欄ずつmissing/staleならclosureを保留し、他rowで補完しない。reference-only rowの説明metadataだけ一欄欠ける例は参照provenanceをunknownにするがclosureを停止しない。選択lease/checkpoint sourceの失敗後の別source/provider-memory fallbackは不合格。HARNESS-023の同一入力再現、unknown保持、選択source fallback禁止を確認する。
- **戻し先・未見**：fencing不一致は該当effectの受領境界、operation/assignment/authorityの不一致は既存OS/SECURITY owner、HARNESS意味・oracleの不明はHARNESS owner、checkpoint sourceの欠落や最新性不明は該当operation/evidence ownerへ返す。未見operationまたはsourceは適用/非適用を推定せずunknownのままにし、無関係な確定済みeffect・義務を変更しない。検知記録だけからruntimeが拒否した、またはresumeが成功したとは主張しない。
- **既存条件との境界**：L2/L11-018/019/009の採択済み一般保証、L2/L11-032の別目的quarantine、候補115のterminal run後late result、118のCI run replacement、120のHIL-FR-32 lifecycle、125のHIL-NFR-14 result failure classesとの条件差はL2-126 receiptに固定する。過去の個別条件を重複採択せず、本oracleは旧NFR-18の二つのsource clauseだけを照合する。

### HELIXOS-L2-128 quarantine対象変更時の失効の受入（候補）

- **原文・境界**：旧HIL-NFR-16の「対象変更で失効」を対象とする。旧HIL-FR-29/HAC-HIL-06c/HR-FR-HIL-06および採択済みHELIXOS-L2-032のexact known check/fingerprint、期限、policy scope、通常failure境界は参照するが、別の採択・上書きとして扱わない。旧sourceはtarget粒度・取消し動作・target比較の適用scopeを定義していない。
- **正常例（revision -003候補・A/C共通の032回帰対照）**：policy `P-demo`、check `C-demo@v1`、fingerprint `F-demo`、baseline `B-demo`、同一target `T1`、期限内の限定eligible receiptを与える。`policy baseline=B-demo`とcurrent run HEAD/treeは別fieldで値を異ならせてよい。target比較入力も既存条件上のtarget比較適用もないrunで、run provenance HEAD/treeだけを`H1→H2`へ変え、要求/profile/policy適用targetその他の032条件は同じにする。A/Cどちらでもこれをtarget changeとせず、candidate-128による追加失効を起こさない。採択032の条件を満たす限り、通常032判定はpolicy明示scope内のrunを`eligible`にできる。
- **既存条件上の比較適用または明示target差での正常例・選択肢差**：同じpolicy/check/fingerprint/baseline/期限・広いpolicy scopeを保ち、既存要求/profile/policy適用入力がtarget比較を適用する場合、またはその入力自体がtarget identity差`T1→T2`を明示する場合（別個のcomparison flagは不要）に、Aでは旧T1 quarantineをT2へ適用せず、T2を通常failure/保留にする。同じpolicy scope内というだけでeligibleにしない。Cでは旧receiptそのものは再利用しないが、同じpolicyの既存条件でT2を改めて評価でき、条件が満たされればeligibleになり得る。両者の結果を一つのoracleへ混ぜない。
- **target入力も比較適用条件もないrun（A/C共通）**：既存要求/profile/policy適用条件がtarget comparisonを適用せず、元の032 runにもtarget identity比較入力がないfixtureでは、128は比較fieldや新gateを要求しない。採択032の通常入力・結果だけで判定し、target差は推定しない。
- **既存条件上比較適用だが根拠欠落（A/C共通のnegative）**：既存要求/profile/policy適用条件でtarget comparisonが適用されるのに必要な既存target identity根拠がmissing/conflictingならtarget-change判定をunknown/保留にする。unchangedと補完せず、128のtarget-change clearanceをeligible根拠にしない。run HEAD/tree provenanceと032自身の状態を別に記録し、比較根拠の欠落を全032 runの一律gateへ広げない。
- **未見例**：未fixtureの対象identityまたは変更表現を示す。対象同一性の粒度を推測せずunknown/未完にする。旧HAT-HIL-06や未選択旧CI段の成功を補完に使わない。
- **依存4区分の固定根拠**：採択HARNESS-L2-023 / L11 pair（2026-09-28 HELIX-HARNESS decision row 52、固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、L2 section `32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03`、L11 section `f505c8e6a2887ac0cf757a78de6617f9a9ee3f9e36084fee70b8a11915815a47`）から借りる。OS-L2-023はhandoff接続の別責務であり、分類taxonomy根拠として扱わない。HARNESS-L2-010固定section `9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4` とHARNESS-L2-011固定section `30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952` は、下記の選択pack-call fixtureに限り呼出し・依存契約revisionとして使う。
- **同一入力の具体fixture（全fixture値は合成）**：一つの `case=OS128-T1`、`call=fixture:Q128-call@r1`、`pack=fixture:Q128-pack@r1`、`operation=policy.apply`、`target-scope=fixture:scope-T`、`source-selection=fixture:target-source-A`だけを評価する。HARNESS-023が要求する各row全fieldを次のように与え、実owner/versionを新設しない。
  - **常時必須**：identity `fixture:OS032-quarantine-evidence@rA`、owner `fixture-owner:HELIX-OS-032`、contract revision `fixture:OS032-adopted-section-a506a984`、range `=fixture:OS032-adopted-section-a506a984`、compatibility evidence `fixture:OS032-exact-adopted-pair-binding`、class `always_required`、applicability `call=fixture:Q128-call@r1`。
  - **操作時のみ必須**：identity `fixture:SECURITY-008-policy-operation@rA`、owner `fixture-owner:HELIX-SECURITY-008`、contract revision `fixture:security-operation-contract-rA`、range `=fixture:security-operation-contract-rA`、compatibility evidence `fixture:actor-operation-scope-match-rA`、class `operation_specific`、applicability `operation in {policy.create, policy.change, policy.apply}`。操作非選択なら未観測のまま閉じない。
  - **選択source時のみ必須**：identity `fixture:target-source-A@r3`、owner `fixture-owner:target-source-A`、contract revision `fixture:target-identity-contract-r3`、range `=fixture:target-identity-contract-r3`、compatibility evidence `fixture:source-A-to-Q128-call-r3`、class `selected_source`、applicability `source-selection=fixture:target-source-A and (existing target-comparison applicability or explicit T1→T2 target input)`。target inputは `P-demo/C-demo@v1/F-demo/B-demo/T1/H1`、比較後はT2とし、T1からT2へ旧eligibleを流用しない。
  - **参照のみ**：identity `fixture:historic-HIL-06@sha256:db31f424`、owner `fixture-owner:historical-context`、contract revision `fixture:archive-L1-file-db31f424`、range `=sha256:db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、compatibility evidence `not-applicable-for-execution; source identity is pinned only`、class `reference_only`、applicability `historical context only`。参照資料のidentity以外のmetadata欠落は参照状態だけunknownとし実行を止めない。
- **欄ごとの独立欠落**：選択pack/call・HARNESS-010/011 contract revisionとの適合根拠、および各4区分rowのidentity、owner、contract revision、range、compatibility evidence、class、applicabilityを一欄ずつmissing/wrong/stale/unknownにする。常時・該当operation・選択sourceの実行closureはunknown/未完となる。reference-only rowのowner/version/range/evidence欠落は参照状態だけunknownとなり単独でclosureを停止しない。分類/applicabilityが不明・矛盾ならreference-onlyへ丸めない。未選択operation/sourceは未観測であり、fallbackしない。同じ選択call・input・revisionで再評価したclosureと理由は一致する。
- **非対象操作**：target change後の既開始operation cancel/rollback、policy全体の撤回・再登録、別対象に対するfresh eligibilityの禁止は受入条件に含めない。旧原文がこれらを定めていないため、既存operation/policy契約へ残す。
- **PO判断材料・受入差（revision -003候補）**：A（推奨・旧sourceの「対象変更で失効」に忠実）は、既存要求/profile/policy適用条件で比較が適用される場合、または既存入力自体が明示するtarget差に限り旧quarantine適用を終了し、新targetを通常failure/保留とする。Bはtarget-change効果を未確定のままsource holdingに残す。Cは旧receiptの直接流用を拒否するが、同じpolicy scope内で新targetを再評価しeligibleになり得る意味変更である。A/Cとも①current run HEAD/treeだけの差では採択032のeligible正常例を変えない、②target入力も既存条件上の比較適用もないrunには新gateを課さない、③既存条件上比較が適用されるのに必要target identity根拠が欠ける場合は128判定をunknown/保留にする。別解釈Dとして全run HEAD/treeをtargetとみなすとcommit/tree差ごとにquarantineが失効し、採択032のbaselineとrun provenanceを分ける通常eligible例を狭める。この解釈は旧sourceが定義せず、採用済みの意味としては扱わない。既存入力がtarget差を明示する場合、別個の比較要求flagがなくても対象変更として扱う。影響は既存条件上の比較適用または入力が明示するtarget差に対する128判定に限り、採択032本文/authorityは変更しない。
- **受入判定**：Aの対象変更例で同一input・revisionから同じ対象別失効結果とprovenanceを辿れ、旧quarantineが新対象へ適用されず、変更を判別済みの対象は通常failureとなること。変更の有無が不明なら保留する。結果はquarantine適用の限定判定であり、failure解消、test pass、profile success、merge/release許可、新policy操作を生成しない。候補採択や実行済み状態は示さない。

### HELIXOS-L11-127 選択されたCI依存段間のreceipt lineage

**対象**：未採択候補HELIXOS-L2-127。採択済みHARNESS-L2-005/022、HELIXOS-L2-008/020/032の意味は変更せず、選択planにある段間依存のreceipt接続だけを判定する。旧prejoin→postjoin→externalの固定3段や固定順序は追加しない。

- **正常例**：同一の選択plan `P7`、target commit `C7`、tree digest `T7`で、選択された検証依存 `check-A → check-B` が計画される。Aのreceipt `R-A` は`P7/A/C7/T7`を記録し、Bのreceipt `R-B` は`P7/B/C7/T7`と`predecessor_receipt=R-A`を記録する。両receiptの状態とHARNESS-L2-005/022に対応するoracle/evidenceを照合できる場合、Bはこの依存についてのみ証拠を持つ。追加の固定stageや一律三つのgreenを要求しない。
- **独立checkの正常例**：同じplan内の独立した`check-C`に前段依存が宣言されていない場合、Cのreceiptは自身のplan/check/target digestを束縛する。AやBへの無関係な前段参照を求めず、依存chainに混ぜない。
- **負例**：①Bのreceiptから`R-A`参照が欠落、②参照が同planの直前依存段ではなく別runまたは古い非直前receipt、③Bの自身のcommit/tree digestが`R-A`と不一致、④別targetのgreen receiptだけをBの依存証拠として提示、⑤receiptのplan/check identityが選択planと不一致。各場合、Bの依存結果を未完/不一致とし、そのgreen表示だけで当該依存を満たさない。独立check Cの結果は、Bの不成立とは別に判定する。
- **quarantine境界**：checkのfailureがHELIXOS-L2-032の限定quarantine条件を満たしても、そのeligible receiptはpass/greenではない。代替minimum gateがある場合もHARNESS義務を弱めず、quarantine receipt自体を段間のgreen証拠にしない。
- **未見・unknown**：選択planの依存関係、receipt参照、対象digestのいずれかが未観測または不明なら、その関係はunknown/未完のまま保持する。全check間に依存を推定せず、前段receiptが存在するというだけで後段依存を成立させない。
- **採択済みHARNESS-L2/L11-023の分類oracleと同一入力fixture**：2026-09-28 HARNESS PO decision row 52は`HARNESS-L2/L11-023` pairを採択した。固定target `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2/L11 section SHAは`32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03` / `f505c8e6a2887ac0cf757a78de6617f9a9ee3f9e36084fee70b8a11915815a47`。MPR metadataの状態表示を採否根拠にしない。以下のfixture値はすべて合成値で、実owner・registry・receipt storeを決めない。
  - **同一入力**：`pack=fixture:OS127-plan-P7@r1`、選択call=`fixture:OS127-call-P7@r1`、`source=fixture:receipt-source-A@r1`、`operation=fixture:check-B-with-predecessor@r1`、選択plan `P7@r3`、target `commit=C7/tree=T7`、前段check `check-A@r2`、後段check `check-B@r4`、前段receipt `R-A`、後段receipt `R-B`。選択planは`check-A→check-B` edgeを宣言する。
  - **常時必須（always_required）**：HARNESS-L2-010 pack contract rowはidentity=`fixture:HARNESS-L2-010@f6dad2a33e24`、owner=`fixture-owner:HARNESS-010`、contract revision=`sha256:9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4`、range=`=sha256:9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4`、compatibility evidence=`fixture:compat:P7-pack-to-HARNESS-010-fixed-section=true`、class=`always_required`、applicability=`selected pack fixture:OS127-plan-P7@r1`。HARNESS-L2-011 selected-call contract rowはidentity=`fixture:HARNESS-L2-011@f6dad2a33e24`、owner=`fixture-owner:HARNESS-011`、contract revision=`sha256:30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952`、range=`=sha256:30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952`、compatibility evidence=`fixture:compat:OS127-call-P7-to-HARNESS-011-fixed-section=true`、class=`always_required`、applicability=`selected call fixture:OS127-call-P7@r1`。対応する固定L11行（末尾LFを含む行SHA-256）は010=`sha256:ee2d89c797d8d07d917b68fca55d386d487e67caac0e9cf0873fe674846e33cf`、011=`sha256:483c86d30dbece9bce50732e5faf9480b6c70c93f6b625330d27cb7784a57188`。両行はファイル名から推定せず、選択されたpack/call契約の証拠へ結びつける。この選択pack/call fixtureは固定契約revisionと一致するが、全operationを010/011へ依存させるものではない。OS plan/target/check result契約rowはidentity=`fixture:plan-P7@r3`、owner=`fixture-owner:OS-020`、contract revision=`fixture:dynamic-plan-receipt-contract-r3`、range=`=fixture:dynamic-plan-receipt-contract-r3`、compatibility evidence=`fixture:compat:plan-P7-to-receipt-contract-r3=true`、class=`always_required`、applicability=`P7@r3内で選択された各check`である。R-Aは`P7@r3/check-A@r2/C7/T7`、R-Bは`P7@r3/check-B@r4/C7/T7`を各自束縛し、選択checkごとの自身のidentity/対象digestを保持する。
  - **特定操作時のみ必須（operation_specific）**：identity=`fixture:edge-check-A-to-check-B@r1`、owner=`fixture-owner:dynamic-plan-P7`、contract revision=`fixture:dependency-edges-P7-r3`、range=`=fixture:dependency-edges-P7-r3`、compatibility evidence=`fixture:compat:edge-A-to-B-under-P7-r3=true`、applicability=`selected check-B and P7@r3 declares check-A→check-B`。このoperationが成立するときだけR-Bは`predecessor_receipt=R-A`を直接参照する。別の独立check `check-C@r1`にedgeが宣言されないfixtureでは、このrowと前段receiptをclosureへ入れず、Cは自身のplan/check/C7/T7だけを記録する。
  - **選択source時のみ必須（selected_source）**：identity=`fixture:receipt-source-A@r1`、owner=`fixture-owner:receipt-source-A`、contract revision=`fixture:run-receipt-read-contract-r1`、range=`=fixture:run-receipt-read-contract-r1`、compatibility evidence=`fixture:compat:receipt-source-A-to-P7-r3=true`、applicability=`P7@r3でreceipt-source-Aを明示選択`。この正常入力ではR-A/R-Bを同sourceから照会する。未選択`fixture:receipt-source-B@r2`は`unobserved`であり、Aの欠落・不整合時にBへfallbackしない。
  - **参照のみ（reference_only）**：identity=`MPR-SH-IR-003#HIL-NFR-15` / legacy `prejoin→postjoin→external` note、owner=`fixture-owner:historical-source`、contract revision=`fixture:legacy-HIL-NFR-15-source-80e965736a91`、range=`=sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`、compatibility evidence=`not_applicable_for_execution; source history pinned`、applicability=`historical source context only`。この資料は実行closure外。参照資料metadataだけが欠けたときは参照状態unknownを記録し実行closureを止めない。
- **同一入力の正常結果**：同じ`P7@r3/C7/T7`、同じ選択check/edge/source/contract revisionから再評価すると同一closure理由となる。R-BはR-Aのidentityを直接保持し、両receiptのplan/check/commit/treeが対応するため、この宣言edgeについてのみ依存証拠になる。Cは独立checkでありR-A参照なしのまま別判定する。旧3段固定順序や一律3つのgreenを要求しない。
- **欄別・関係別negative oracle**：他の入力を正常に固定し、実行対象rowのidentity、owner、contract revision、range、compatibility evidence、class、applicabilityを一欄ずつmissing/wrong/stale/unknownにする。それぞれの実行必須closureはunknown/未完または不一致とし、別rowの成功で補わない。正常例では010/011の両fixed contract revision・range・applicabilityに対するfield別compatibility evidenceをそれぞれtrueとして与える。別々の反例で、他入力を正常に固定したまま010のcompatibility evidenceだけをfalse（または欠落／wrong-revision／conflict）にし、さらに独立した反例で011のcompatibility evidenceだけをfalse（または欠落／wrong-revision／conflict）にする。各反例でclosureはunknown／未完または不一致となり、010だけtrueでも011のfalseを補わず、011だけtrueでも010のfalseを補わない。さらに (1) 宣言edgeがあるのにR-BからR-A参照欠落、(2) R-Bが別plan/別check/古い非直前receiptを参照、(3) R-B自身のcommit/treeがR-Aと相違、(4) selected source Aがmissing/conflictしてBへfallback、(5) edgeのないCへA/B predecessorを強制する、を別々に与える。①–④はBの依存結果を未完/不一致にし、⑤は余計なedgeを課すため不合格。reference-only rowのidentityは旧consumer/protocol contextの`archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-06`および`archive/legacy-generation-2026-09-14/root/requirements-ir/system_tests.json#/HAT-HIL-06`に限定し、旧固定stage/protocolの歴史的説明として扱う。そのowner/version/range/evidence欄だけを一つ欠くnegativeでは参照状態のみunknownとなり、実行closureは閉じたまま。normative IR atom `requirements.json#/HIL-NFR-15`はsource provenance/義務として保持しreference-only rowへ含めない。分類/applicabilityが不明ならreference-onlyと丸めずunknownにする。
- **quarantine境界**：HIL-NFR-15原文の最終条件は維持する。quarantine eligible/known-failure receiptはgreen/passではなく、green件数へ加算しない。具体的なquarantine判定は採択済みHELIXOS-L2/L11-032で行い、このcandidate pairは032を重複定義しない。
- **受入判定**：同一plan/target上の依存段についてのみ、後段自身のdigestと直前依存receiptのidentityが追跡できることを確認する。HARNESS oracleの成否、OS実行状態、quarantine状態はそれぞれ既存pairの条件で判定する。候補・fixture・receipt記録だけからruntime実行、採択、merge許可を生成しない。

**旧source**：normative IR atomは`LEGACY-ASSET-A60CF91DD2AF6693E6F9`のHIL-NFR-15、L1 line 195は`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`による同一文のcorroboration。HR-FR-HIL-06/HAC-HIL-06a/b/cは旧consumer context、HAT-HIL-06と旧prejoin/postjoin/external物理構成は参照のみ。参照のみ分類は旧runtime/固定stageの来歴だけに適用し、normative IR atom全体やそのreceipt lineage条件を実行closure外へ落とさない。OS-032の採択済み限定quarantineと本候補の段間参照を混同しない。


### 要求正本更新の受入：HIL-NFR-32の六条件候補

本追補は、既存の「要求正本更新の受入」（`governance-acceptance.md` 241–252行）とHELIXOS-L2-001に結び付く、未採択のL11候補partである。source identityは旧HIL-NFR-32全体の一atomを保持する。L2へ新しいguardは加えず、既存の「要求正本を更新する管理条件」（`governance-requirements.md` 515–532行）を適用先とする。候補登録`MPR-RC-HELIXOS-L2-001-001`とreceiptの`condition_mapping`から、選択partと各条件の対応を辿る。

旧原文は「意味変更はauthority、impact、pair、oracle、rollback、downstream stale propagationが揃わない限りCanonical化しない。」である。sourceの六条件を保持し、意味変更をCanonical化する候補operationに対する独立fixtureを示す。HARNESSが要求意味、影響範囲、pair、verification obligationとoracleを所有する。OSは同じoperation/base/scopeの入力根拠を照合し要求正本更新を管理するが、HARNESSの検証義務を引き受けない。

- **正常fixture（未実行）**：同一の意味変更operation、変更前の要求revision、適用scopeを固定し、そのoperationに適用されるauthority、影響要求/designと既存pair・互換revision、適用されるoracle/expected failure、rollback/recovery根拠、影響するdownstream relationと既存管理条件で対象となるstale state更新結果を同一の更新traceへ結ぶ。適用される六条件を一つずつ根拠へ辿れ、別operationや別revisionの証拠を混ぜない。scope外のsourceや無関係な全consumerを一律に要求しない。
- **六つの独立negative fixture（各々未実行）**：正常fixtureのoperation、base revision、scopeおよび他の入力を固定し、一回に一条件だけ欠落・不一致とする。各caseでcanonicalizationを成立させない。
  1. 適用されるauthorityの根拠だけを欠落、または無権限にする。
  2. 影響対象と変更のrelationだけを欠落させ、影響範囲をunknownにする。
  3. 対象changeに結ばれたpairまたは互換revisionだけを欠落・不一致にする。
  4. 適用されるoracle/expected failureだけを欠落、または対象changeと不一致にする。
  5. rollback/recoveryの根拠だけを欠落させる。
  6. 既存管理条件で対象となる影響下流のstale state更新根拠だけを欠落させる。これはその更新条件のnegativeであり、全consumerや全downstream作業の完了を要求する条件には広げない。
- **別oracleのnegative（未実行）**：stale base拒否、更新・receipt初期write fault時のpartial-current防止、複数revisionの証拠混在拒否を六つの一条件欠落caseと分ける。初期write faultは原子的確定とrollback/recoveryを確認する。downstream stale state更新根拠の欠落は、初期transaction成功だけでは正本化条件を満たさないことを確認する。二つのfailure段階を一つのoracleにまとめない。
- **未見・unknown（未実行）**：選択input source、適用scopeまたは影響relationが不明ならunknown/未完のまま保持する。非該当・影響なし・成功に読み替えない。適用根拠の選択を明記し、無関係なすべてのsourceを一律必須にはしない。

HARNESS-L2-023の実行dependency分類は次のとおり。これはfixture実行時のdependencyのみを示し、規範IRやconsumer契約を参照資料へ降格しない。

| 分類 | この候補での扱い |
|---|---|
| 常時必須 | 対象requirement identity/revision、変更前base、operation scope、現行L2/L11契約。 |
| 特定操作時のみ | 意味変更をcanonicalizeするoperationを選択したとき、原文の六条件を照合する。 |
| 選択した入力元に応じて必須 | 当該operationに適用されるauthority、impact/pair、oracle、rollback/recovery、downstream relationについて、source identity・revision・scopeを結ぶ。IRはnormative、L1同文はcorroboration、HR-FR-HIL-19/HAC-HIL-19a..c/HAT-HIL-19はcontract・設計済みoracle/testのconsumer contextである。 |
| 参照資料のみ | 旧runtime、CLI、schema、enum、実装class名。旧test/runtimeは実行しない。 |

全caseは候補fixtureであり、未実行である。candidateのauthority effectは`none`。adoption、formal successor、owner確定およびwhole-source closureは未確認のまま保持する。


### HELIXOS-L2-018 Worker割当・実行統制の受入（HIL-NFR-36残差候補revision -002・未採択）

本節はL2の同identity追補候補に対する未実行のfixture/oracleであり、2026-09-28に採択された018の固定L11本文を変更しない。

- **正常fixture（未実行）**：合成task/scope/risk、OS既存assignment/attempt、runtime/model/effort/retry/result/costの既存参照を一つのrunに固定する。適用可能な既存default sourceが選択scopeと一致し、既選択configurationと照合できるsource identity/revision/scopeとfield-level evidenceを与える。実選択がそのdefaultに一致するケースと、実選択が異なり既存の根拠/理由receiptが参照できるケースを別々に示し、どちらも逸脱の有無を値や新規閾値で推定しない。品質問題が発生するcaseでは同じassignment/attemptにHARNESS oracle/resultを結び、適用可能な既存order sourceと実際に通ったstep/result receiptを実順序で参照する。consultまたはsupportを実際に選ぶfixtureだけ、OS-028またはOS-029の該当receiptを接続する。OS-019は同じevent/evidence/未完義務を参照・連続させる。fixtureは観測可能なリンク関係だけを説明し、物理schemaや現行owner/valueを定義しない。
- **独立negative oracle 1—default deviation**：正常fixtureから一入力だけ変え、適用sourceがそのscopeで有効であるまま、actual selected configurationがdefaultと異なる一caseで、逸脱理由/既存根拠receiptの参照だけを欠落または別revisionにする。逸脱なしとして完了せず、そのreceipt facetだけunknown/未完とする。assignment自体の可否は既存authority/制約で別判定する。
- **独立negative oracle 2—escalation order**：正常fixtureから一入力だけ変え、品質event・order source・他stepは一致したまま、実際に通った一stepの既存result/event receiptだけを欠落または順序不整合にする。意図したroute案や別attemptの成功結果で補完せず、そのescalation receiptを未完とする。
- **unknown fixture**：選択task/scopeに適用するdefaultまたはorder sourceがない、適用revisionがstale/conflict、scopeが確定できない、またはownerが未特定の場合、legacy FR-63の候補値・直前の別scope値・INTELLIGENCE proposalから既定値/orderを補わない。該当facetをunknownにして元のdecision/policy meaning ownerへ返す。sourceがunknownでも適用外または逸脱なしとはしない。
- **未実行・未選択境界**：quality eventがないrunでescalation stepを要求しない。未選択のconsult/supportは実行済みhandoffにならず、OS-028/029のreceiptを捏造しない。停止/denied/未実行は既存状態のまま記録し、候補fixtureから成功を生成しない。
- **HARNESS-L2/L11-023 dependency分類fixture**：同一合成入力と適用理由で4区分を再評価する。
  - 常時必須: ticket/scope/revision、OS assignment/attempt、当該runの実event参照、適用HARNESS oracle/result identity。
  - 特定操作時のみ: 実際に選択された比較/escalation/consult/support operationとその既存receipt。独立caseではoperation未選択を確認し、未観測を成功・不適用へしない。
  - 選択した入力元に応じて必須: 選択済みdefault/order source、そのrevision/scope、選択INTELLIGENCE proposal/LABO evidence。別sourceへの暗黙fallbackを拒否する。
  - 参照資料のみ: 旧implementation/runtime/schemaなど歴史的実行手段だけを含める。HIL-NFR-36 IR、L1、HR/HAC/HATをreference-onlyへ分類しない。
- **観測receiptの適用境界**：原文の「receipt化」は実際の逸脱と実際のescalation順序・結果を既存recordへ結ぶ観測事実として扱う。事前gate、全run停止、source未確定時の全操作禁止を追加せず、適用sourceまたはownerが不明なfacetはunknownとして既存ownerへ返す。
- **受入状態**：すべてfixtureは静的な候補oracleで、実行済みtestではない。候補revisionの採択、source formal successor、OS実行成功、quality acceptance、PR/merge許可は生成しない。

**旧source/consumer対応**：規範sourceは`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-36`全体。旧L1 `infinity-loop-platform-requirements.md:216`は同文のcorroboration。`HR-FR-HIL-22`は再現bench・実task scorecard・品質/安全/retry込みcostの用途別比較、`HAC-HIL-22a/b/c`はpositive/negative/品質低下時比較のboundary、`HAT-HIL-22`はfixture/rubric/blind score/effective cost/route receiptの設計済みtest条件を示す。これらを消さず、HATを実行したとはしない。
