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

| 親要求 | 利用者が確認する結果と反例 |
|---|---|
| HELIXOS-L2-001 | 各要求の対象プロダクト・正本・合意revisionへ辿る。Issue closeを要求の削除・受入として表示しない |
| HELIXOS-L2-002 | 異なるプロジェクトの欠落・競合・未検証を個別に把握し、一方の成功で他方の未完を相殺しない |
| HELIXOS-L2-003 | 開発方式の変更で影響する範囲だけを再評価し、共通統制の無断変更を拒否する |
| HELIXOS-L2-004 | 割当・依存・予算・review待ちを確認し、担当交代による二重作業と自己承認を拒否する |
| HELIXOS-L2-005 | HARNESS自身への適用と各productの観測から改善候補・採否・変更・再検証・効果確認を追跡し、未承認経験の規則化、HARNESS改善責務の欠落、棄却理由の消失を拒否する |
| HELIXOS-L2-006 | fresh／既存repoへ提供版を導入・更新・復旧し、無断の成果消失や別artifactへの切替を拒否する |
| HELIXOS-L2-007 | Worker・判断・検証ログを要求revisionから辿り、欠落・重複・staleを成功証拠として使わない |
| HELIXOS-L2-008 | 承認上流から生成したCI profileの起動・失敗・修復・再実行を追跡し、旧CI成功で新世代の未実行・中断・staleやreview欠落を相殺しない |
| HELIXOS-L2-009 | 中断・担当交代後も制約と未完義務を引き継ぎ、二重実行・予算リセット・無許可復旧を拒否する |
| HELIXOS-L2-010 | 管理・推進・検収が同じticketと因果IDで直接調整し、scope・優先度・共有資源・要求意味の変更だけを正しい判断先へ返す。役割を固定モデル数や中央中継へ変換しない |
| HELIXOS-L2-011 | HARNESS契約で同じ検証義務を与え、A→Bの依存を実際のbase+A+Bで具体化する。base更新・候補増減・順序変更で再計画し、OSによるoracle削除・追加、必要CI欠落、影響証明不能、契約解釈不明、別HEADの成功ではmerge可能としない |
| HELIXOS-L2-012 | 内部情報の欠落と外部情報の相違を保持し、秘密送信、取得命令実行、外部patch自動採用、closed／mergedだけの解決認定を拒否する |
| HELIXOS-L2-013 | 同じ仕事について上流からの欠落と失敗からの原因候補を突合し、管理自身を含む是正ticket、再検証、再観測へ辿る。未着手や観測停止を正常と表示しない |

## 実行・記録の反例

- HELIXOS-L2-004：成果未回収、期限超過、検証者不在、hook非強制surfaceを個別に与え、停止・不足理由を確認する。Worker自身の完了報告だけで独立検証済みにしない。
- HELIXOS-L2-004／007：reviewer名だけ、GitHub routeだけ、CLI routeだけを順に許可し、指定route以外を起動しないことを確認する。route未指定、別routeの過去許可、timeout、無出力では`review_waiting`を維持し、無許可実行の出力をreview receiptへ採用しない。
- HELIXOS-L2-005：未計測のSkill、誤推薦、旧版を投入し、候補・利用結果・失効を区別できる。学習結果がHARNESS規則へ無断反映されない。
- HELIXOS-L2-001／002／005／007／013：Concept／企画L1、要求エンジンの入力・出力L2候補、人間の訂正・採否、採用要求、後続の見逃しを同じ因果IDで登録する。企画価値の要求化漏れ、企画外の意味追加、対象違い、scope／non-goal逸脱を個別に示し、戻す層と判断者へ辿る。登録やログ件数だけでは要求採用・改善成立とせず、許可外の生会話・PII・別project dataを学習へ転用しない。
- HELIXOS-L2-007：未ack finding、未反映memory、重複配送、期限切れ通知を投入し、内容消失・二重利用・古い指示の再提示を拒否する。
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

限定修復の条件は新世代で採用するrevision確定後に評価する。全件未実行。

- HELIXOS-L2-001／004／007／009：候補、登録、許可、適用、検収を別々に確認し、旧GH-FR-011、修復器登録、他修復の成功からwrite権限を生成しない。
- write-set逸脱、stale、所有競合、予算超過、循環、二重実行、不明副作用を個別に与え、停止・保全・上流返却を確認する。
- 旧bugbot、既存CI、旧DB／transaction、main read-afterを与えても、新世代限定修復の実行・受入証拠にしない。

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

## HARNESS、HELIX-Web、HELIX-Web-OSを管理するシナリオ

未実行。HELIXOS-L2-001／002／003／005の対象間の分離を次で確認する。

- HARNESS、HELIX-Web、HELIX-Web-OSに異なる要求revision・進行状態を与え、それぞれのローカル正本へ辿れること。Web／Web-OS要求をOSやHARNESSの要求として誤表示しないこと。
- Webが採用するHARNESS版と能力を特定し、Web固有要求の変更で他プロダクトの要求・承認・工程規則が暗黙に変わらないこと。
- HELIX-OS内部stateとHELIX-Web-OSのtenant／job／credential／service stateを食い違わせ、どちらか一方を他方のauthorityとして補完しないこと。
- Web-OSの許可logと範囲外logを混在させ、前者だけを出典・scope・目的・同意・revision付きでHELIX-OSの改善入力へ取り込むこと。credentialとtenant原dataを拒否し、欠測を正常化しないこと。
- Web-OS log由来の改善候補をHARNESS、Web、Web-OSのどこへ戻すか区別し、HARNESS自身への影響があればHARNESS要求・設計・検証へ接続すること。一製品の観測から全対象を無条件に変更しないこと。
- Webの検証が未完のとき、HARNESSの提供完了やCI成功でWebを完了扱いにしないこと。
- Webの実践証拠からOSが改善候補を管理し、採否・変更対象・再検証へ辿れること。証拠の利用可能範囲を越えて共有せず、候補を自動で要求正本へ昇格させないこと。

## memory責務変更の受入条件

HELIXOS-L2-001／004／005／007／009のHMC-BR-001..006由来条件を検証する。全件未実行。
次の各反例を個別に試し、結果を通知identity・要求revision・対象HEADへ束縛する。

- 別runtimeで通知を受信し、本文の指示を実行する前に参照先の要求・assignment・lease・HEADを確認できる。
- stale pointer、HEAD不一致、期限切れ、消費済み通知はcurrent guidanceにならず、理由と再取得先を確認できる。
- 同じeventの再配送とcrash後再開で作業が二重実行されず、訂正前の通知を有効な指示として再使用しない。
- 相談やAI解釈を含む通知が、要求承認・決定・完了表示へ昇格しない。
- provider native memoryやユーザー設定を入力しても共有authorityへ暗黙混入せず、要求・長期知識は対応する正本へ辿れる。
- 移管後も原文provenanceと訂正履歴を参照できる。記録件数が減ったことだけで移管・受入成功にしない。

- HMC-BR-001：assignment、review依頼、handover、heartbeat、確認待ちをそれぞれ異なるruntimeへ渡し、期限と参照先を確認する。
- HMC-BR-003：長期知識はLearning／Skillの正本を参照し、通知の消費で要求・設計・受入・運用規則・ユーザー嗜好が失われたり上書きされたりしない。
- HMC-BR-004：作業依頼・質問・仮説・叱責も入力し、依頼の存在だけで承認や完了を生成しない。
- HMC-BR-005：消費、期限切れ、訂正を個別に再現し、無効な通知は履歴として参照できても現行指示として再使用できない。

## 監査・学習・成果の出所に関する候補の受入条件

AAFD4件・RCLS6件・PPS4件は採用revision確定後、HELIXOS-L2-004／005／007で次を確認する。全件未実行。

- 監査提案からHEAD・根拠・出所・再現・反証へ辿り、内部改善と外部変化を区別できる。変更時に影響する将来投影だけが再評価される。
- 同じcorpusでモデル変更前後の所見・誤検出・見逃し・費用・遅延を比較でき、モデル更新だけでは適格にならない。
- 責務名や保存場所の変更後も経験の所有を追跡できる。事例・推論・検証を区別し、自己評価を独立検証として表示しない。
- 割当packetの選択根拠と予算を確認し、全Skill・memory・logの一括投入を認めない。昇格段階と失効・取消後の再検証を識別できる。
- 学習提案だけで要求・設計・merge・Releaseが変更されない。機構化後の規則がSkill本文と二重に判定を支配しない。
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
