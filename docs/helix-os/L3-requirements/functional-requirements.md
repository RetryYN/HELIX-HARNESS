# HELIX-OS L3 機能要件（1.0対象親36件の草稿）

status: draft_for_l3_review
approval: not_approved
scope: Stage 2a + Stage 2b(OS014) + Stage 2c + Stage 3 + Stage 4 + Stage 5(OS025/026/031/047 draft) / version_target 1.0 explicit items only
owner: HELIX-OS
paired_l10: ../L10-verification/functional-verification.md

本稿はStage 2a・2b・2c・3とStage 4の担当部分草稿であり、機構全体のL3、実装、実行、採択・承認を意味しない。Stage 2cはPOの案B「支援・テスト生成を前倒し」に従い、支援candidate、OS handoff、実作業・検証・再作業を別段階で扱う。草稿からassignment、相談実行、test実行、受入状態を生成しない。親L2ごとにFR IDを分け、ACはL3正本に一度だけ定義し、L10は同じACを参照する。


### `FR-OS-L3-014` — `HELIXOS-L2-014`

HELIX自身の段階稼働構成を、HARNESS-L2-010の適格packと必要な依存から作る。段階ごとに使うpack／依存の版、設定・data形式、対応環境、能力と非対応範囲、その範囲の受入証拠、更新・切戻し条件を結び、同じ宣言一式から同じ構成を再現可能にする。段階は限ったscopeでも要求確認から作業・検証・結果記録まで一周し、自動化されていない工程の担当を明示する。

**責務／依存境界**：HELIX-OSは段階構成の管理・生成・検証・配布・切戻しの運転と証拠を所有する。HARNESSはpack境界と検証・受入契約、HELIX-INFRASTRUCTUREは実行環境の構成識別と巻戻しを所有する。段階は開発中HELIX自身に依存せず起動・更新・復旧し、必要な安全依存を欠く場合は成立扱いしない。案件data・秘密情報・資格情報を構成へ含めない。HARNESS-L2-017の製品releaseとは対象identity・判定を分ける。

**受入条件**

- **`AC-OS-L3-014-01` 段階構成と再現**：同じ段階identity、pack／dependency版、設定／data形式、environment、能力範囲、受入証拠、更新・切戻し条件から同じ稼働構成を再現できる。tagだけ、または別系統の簡易実装は段階構成としない。
- **`AC-OS-L3-014-02` 完結範囲と次段階**：段階で宣言した狭いscopeが要求確認から記録まで一周し、人が担う工程を明示する。前段階を使って次段階を構築・検証し、問題時のrollback後も案件stateと記録を保持する。
- **`AC-OS-L3-014-03` 独立性と安全依存**：実行中の別段階、未リリース作業tree、次段階なしに起動・更新・復旧できる。安全依存不足では成立扱いせず、実data・秘密情報・資格情報の混入を拒否する。
- **`AC-OS-L3-014-04` 判定・版・ownerの分離**：段階成立とConceptの1.0到達を別判定・別記録にし、段階識別子（例v0.1/v0.2）を外部公開版番号として使わない。対象製品のreleaseであるHARNESS-L2-017とHELIX内部段階運転を混同せず、1.0より後のHELIXINFRASTRUCTURE-L1-023を前提化／前倒ししない。

### `FR-OS-L3-015` — `HELIXOS-L2-015`

対象/source identity・revision・digest、actor/time、正本、判断record、意味未分類の原event、訂正・競合・staleを分けて管理記録へ結び付ける。原eventは分類後も不変とし、訂正は追跡可能にする。PR/Issue/CI/memory等のprojectionから要求意味、人間decision、実装許可を生成しない。対象・revision・digest・出所が不明/不一致なら未解決として正本または判断主体へ戻す。

**責務／依存境界**：管理記録はOS、対象別Concept/L1/L2の正本と判断sourceは各authority owner、共通ログ/証拠形式はConcept 1.0を使う。L2-001/003/007から継承する正本・判断source・対象revision・責務分離を保ち、source欠落やconflictは元の正本/判断主体へ戻す。

**受入条件**

- **`AC-OS-L3-015-01` sourceと対象revision**：管理recordから対象identity、正本revision/digest、判断source/actor/timeと差分を辿れる。filename/pathだけの一致やprojection statusだけではcurrent authorityにしない。
- **`AC-OS-L3-015-02` 原event保全と訂正**：意味未分類eventを後から分類/訂正したときも原event identity/bytesを保持し、訂正eventとsourceを関連付けて再構築できる。
- **`AC-OS-L3-015-03` projection非authority**：PR/Issue close/merge、CI green、memory更新を個別に変化させても、要求採否・承認・実装許可は不変である。conflict/stale/missingは未解決として出す。

### `FR-OS-L3-016` — `HELIXOS-L2-016`

二つ以上の対象projectについて要求revisionから単体・接続・構成体、依存、実差分、検証、提供・運用stateを辿れるportfolio traceを提示する。未接続・未合意・未実装・未検証・未提供・unknown・staleを区別し、単体/接続/構成体の判定を別に保つ。再開時も未解決edgeとstale理由を保持する。

**責務／依存境界**：portfolio traceはOSが管理し、unit/connection/composite・依存・実差分・検証・提供/運用stateは各対象/connection ownerが提供する。L2-015、対象別正本、HARNESS契約、connection/evidence記録を使い、unknown edgeは当該対象要求またはsource ownerへ戻す。

**受入条件**

- **`AC-OS-L3-016-01` 対象横断trace**：異なる二対象の有限fixtureで各要求revisionからowner/依存/実差分/検証/提供運用へ辿れ、異なるidentityを誤結合しない。
- **`AC-OS-L3-016-02` stateと判定の分離**：未接続・未合意・未実装・未検証・未提供・unknown・staleを別表示し、単体の成功から接続/構成体の受入を導かない。
- **`AC-OS-L3-016-03` 再開と誤推定**：owner/依存/差分欠落、unknown edge、stale sourceを不明のまま残す。CI/ticket/projectの一つのgreenを別対象やrelease readinessへ読み替えない。

### `FR-OS-L3-017` — `HELIXOS-L2-017`

同じ承認済入力とHARNESS契約から対象・親revision・scope・依存・受入義務・戻し先を持つticket候補を再現し、異なる対象/依存の差を保持する。INTELLIGENCE proposalはHARNESS語彙・既存権限・入力済みbudget/deadline・依存に照らして扱い、無条件にticket化しない。1.0では既定部品を規則どおり組み、途中結果を既定戻し先へ返す。

**責務／依存境界**：推進/ticketはOS、工程契約・義務・戻し先はHARNESS、authority制約はSECURITY、proposalはINTELLIGENCE、利用可能な水準evidenceはLABOが所有する。独立成立はL2-015/016、HARNESS contract、SECURITY制約と宣言された提案/evidenceに依存する。部品外workflowは4.0の境界であり本1.0 FRには含めない。

**受入条件**

- **`AC-OS-L3-017-01` ticket候補の再現**：同一承認入力/contract revisionを2回与え、ticket候補の対象・parent revision・scope・dependency・acceptance duty・return routeが一致する。
- **`AC-OS-L3-017-02` 個別差と不確実性**：異なるtarget/dependencyの2 fixtureで差分を保持する。unknown/missing dependencyのproposalはready/ticket開始にしない。
- **`AC-OS-L3-017-03` workflow境界**：部品にないflowを追加せず、途中結果を該当ownerへ戻す。OSがHARNESS工程を再定義せず、予算額・期限を親入力にない値で補わない。

### `FR-OS-L3-018` — `HELIXOS-L2-018`

assignment/attemptを要求・authority revision、ticket/scope、指定Worker/capability/lane、許可済みbudget/deadline、head、結果/evidenceへ結び、実行制約を保持する。作成Workerは自身の成果を承認/独立reviewしない。交代・期限/lease失効時もopen dutiesと累積制約を保持し、SECURITY authorityとINFRASTRUCTURE実資源をOSが代替しない。

**責務／依存境界**：assignment/attemptと停止/handoffはOS、操作authority/隔離はSECURITY、実環境・資源状態はINFRASTRUCTURE、ticketはOS-L2-017、Worker proposal/水準evidenceはINTELLIGENCE/LABOが所有する。L2-017および上記owner evidenceが不明なら実行を止め、OSがauthority/resource stateを代替しない。

**受入条件**

- **`AC-OS-L3-018-01` assignment binding**：parent/ticket revision、scope、authority参照、Worker/lane、入力budget/deadline、head、attempt result/evidenceを相互に照合する。誤対象・stale・unknownは起動/継続しない。
- **`AC-OS-L3-018-02` 重複とreview分離**：同一ticket/assignment/operationの同一処理対象について重複claim/attemptを作らず、作成Workerとindependent reviewer/approverを別actorとして記録する。別ticket/operationに個別の許可がある並行実行は一律に禁止しない。
- **`AC-OS-L3-018-03` handoff累積**：Worker交代時に未完義務・部分成果・budget/deadline/failure constraintを引継ぎ、resetしない。権限や資源不足はownerへ返し、OSが自分で承認/資源生成しない。
- **`AC-OS-L3-018-04` 既定構成からの逸脱記録**：選択scopeに適用可能な既存default decision/policy sourceとactual configurationを照合し、逸脱があれば事実・既存の理由/根拠receiptを同じassignment/attemptへ結ぶ。適用sourceがunknown/stale/conflictなら「逸脱なし」にせず、そのfacetをunknownとして既存ownerへ戻す。default値・比較閾値・policy判断は新設しない。
- **`AC-OS-L3-018-05` 実際のescalation順序と結果**：品質問題が発生し、適用可能な既存order sourceが特定できる場合に限り、実際に通ったstepの順序と各既存result/event receiptを同じassignment/attempt・HARNESS oracleへ結ぶ。予定stepと実行済みstepを区別し、失敗・停止・未実行・未完stepを保持する。全run共通順序や固定retry/timeout/thresholdを作らない。
- **`AC-OS-L3-018-06` unknownと未選択操作**：default/order sourceや適用ownerが不明なら推定せずunknownを残す。品質eventのないrunへescalation receiptを要求せず、未選択consult/supportを実行済み扱いしない。無関係操作を一律停止しない。
- **`AC-OS-L3-018-07` 依存閉包の分類**：常時必要なticket/scope/revision、assignment/attempt/event/evidence、適用HARNESS oracle/resultを同一runで照合する。実行した特定operationと選択input sourceだけに固有receiptを要求し、未選択operationを観測済み扱いせず、旧runtime/CLI/schemaだけを参照資料とする。IR/L1/HR/HAC/HATと現行契約/oracleを参照資料のみへ落とさない。

採択済み`HELIXOS-L2-018-002`は、既存defaultからの逸脱の事実と理由、および予定したstepと実際に通ったstepを区別するreceiptを要求する。上記ACはその2つのreceipt義務を記録するが、default値や共通順序は定義しない。

### `FR-OS-L3-019` — `HELIXOS-L2-019`

要求・判断・作業・検証・手戻り・運用eventをsource revision・correlation ID・actor・data-use class・result・correction・checkpoint/open dutyへ結ぶ。原recordと再構築projectionを区別し、保存/projection/replay失敗を成功checkpointにしない。restart/runtime交代後もscope・期限・budget・failure count・open dutiesを引き継ぐ。

**責務／依存境界**：eventの発生元は各機構、共通authority/source記録はOS-L2-015、attempt/resultはOS-L2-018、Concept 1.0共通ログ/証拠・data-use contractが依存となる。projection/replay欠落はsource eventを所有する機構へ戻す。

**受入条件**

- **`AC-OS-L3-019-01` provenanceと訂正**：eventごとのsource/revision/correlation/actor/data-use/resultを追跡し、重複・stale pointer・訂正前recordを識別する。
- **`AC-OS-L3-019-02` 連続性**：同一event prefixのrestart/replayで意味状態とopen dutiesを維持し、budget/期限/failure count/scopeをresetしない。provider memory/summaryだけを正本にしない。
- **`AC-OS-L3-019-03` 失敗の非成功化**：保存、projection、replayの各境界でsynthetic failureを与え、checkpoint successを出さず再構築位置・欠落証拠を示す。

### `FR-OS-L3-020` — `HELIXOS-L2-020`

承認済要求/pair/oracle、HARNESS義務/版、ticket、change set/base、runner/environmentを入力に必要検証profileを組み立て、exact head・oracle・環境・run identityに結束して実行・回収・再開する。success/fail/denied/skipped/interrupted/staleを区別し、HARNESS所有oracleを増減しない。新世代CI未構築を維持し、CI結果からmeaning review、L11 acceptance、merge/releaseを生成しない。

**責務／依存境界**：profile組立・実行・回収はOS、oracleとrequired obligationsはHARNESS、隔離/実行制約はSECURITY、runner/資源はINFRASTRUCTUREが所有する。依存はOS-L2-016/017/019、HARNESS contract、SECURITY制約、INFRASTRUCTURE資源。新世代CI未構築であり旧CIを依存・代用にしない。

**受入条件**

- **`AC-OS-L3-020-01` profileとoracle所有**：変更対象とHARNESS義務に対応する必要profileを含め、oracle identity/revisionをそのまま使う。missing/altered oracleやwrong head/environmentではpassにしない。
- **`AC-OS-L3-020-02` 状態と回収**：6状態を区別し、deny/skipped/interrupted/staleをsuccessに統合せず、部分結果・再開条件・未完義務を保持する。
- **`AC-OS-L3-020-03` 旧CI/上位判断の非代替**：旧CI green/別HEAD green/new CI未構築を合格根拠にせず、CI successのみからmeaning review・L11 acceptance・merge・releaseを作らない。

### `FR-OS-L3-023` — `HELIXOS-L2-023`

管理→推進→Worker→検収→管理の実handoffを対象revision/digest、causation/correlation ID、scope、open duties、stop reason、evidenceへ結ぶ。unit success、handoff success、connection acceptanceを分け、作成主体とindependent reviewer、推進と検収のauthorityを混同しない。受信側が未完義務を受理したexact receiptまで元ticketを完了しない。

**責務／依存境界**：handoff/receiptとticket closeはOS、各送受信側は自分のscopeと未完義務、oracle/検証義務はHARNESS、操作authorityと資源はSECURITY/INFRASTRUCTUREの各ownerが所有する。L2-015〜020の必要unit/versioned interfaceが揃わなければconnectionは未成立のまま保持する。

**受入条件**

- **`AC-OS-L3-023-01` handoff identityとpayload**：各edgeでtarget revision/digest、causation/correlation、scope、open duties、stop reason、evidenceを一致照合する。prose通知だけでは受領にしない。
- **`AC-OS-L3-023-02` role/authority分離**：各handoffで送受信actor/roleを確認し、作成Worker≠独立reviewer、推進は検収義務を変更せず、検収は要求/ticketを発行しない。
- **`AC-OS-L3-023-03` receiptによるclosure**：受信側のexact scope/revision receiptと未完義務の受領記録があるまで元作業/ticketはopen。unit successのみでconnection/ticketを閉じない。

### `FR-OS-L3-027` — `HELIXOS-L2-027`

明示された初回task/attempt/scope/revision/environmentについて、親L2の6つの限定適格条件、既存操作authority、人の確認、限定Worker、親入力済みbudget/deadline/stop criteria、HARNESS oracleを照合する。性能未評価は単独で拒否理由にしない。初回成功だけでは評価済みにせず、LABOが該当task/model classとscopeの評価を成立させるまでは未評価を維持する。assignment/attempt/evidence/handoffをLABO観測へ渡し、unknown/missing/conflict/stale/拒否なら実行しない。

**責務／依存境界**：限定適格性確認・assignment/stop・receiptはOS。分類/許可/隔離/egressはSECURITY、runner資源はINFRASTRUCTURE、proposalはINTELLIGENCEまたはL2-066同契約の人代行、評価状態/evidenceはLABO、固定oracleはHARNESSが所有する。単独成立依存はOS-L2-015/017/018/019、SECURITY-L2-003/005/006/007/008/016、INFRASTRUCTURE資源、HARNESS-L2-022の証拠、INTELLIGENCE-L2-010、LABO-L2-054/055。OS-L2-020実装およびOS-L2-026導出器の実行は依存でない。

**受入条件**

- **`AC-OS-L3-027-01` 6条件の同一attempt結束**：分類/許可、credential隔離、egress、隔離適用、operation authority、rollbackの6条件すべてを同一task/attempt/scope/revision/environmentで照合。すべて成立したpositiveだけ開始候補となる。
- **`AC-OS-L3-027-02` 性能stateとpermissionの分離**：同じ適格fixtureでLABO性能を明示的に未評価にしても、それだけでは拒否せず、全安全条件・authority成立時のみ限定attempt可能。初回success後もLABOが該当task/model classとscopeの評価を成立させるまでは未評価を維持し、有効な評価receiptがあっても適用範囲だけを評価済みとする。
- **`AC-OS-L3-027-03` 実行・受渡し**：開始前に人が既存入力範囲を確認し、OSがassignment/stopを行う。result state、HARNESS検証、人による独立確認、OS handoff receiptを同scopeでLABOへ渡す。入力済み予算/期限/停止条件を超過したりreceiptが欠けたら閉じない。


### `FR-OS-L3-028` — `HELIXOS-L2-028`

元ticket/requirement revision/scopeと元Worker assignment/attempt、停止・詰まりのsource、入力済みbudget/期限/停止条件、INTELLIGENCE-L2-068支援candidate、選択contextのprovenance、適用されるHARNESS/SECURITY/INFRASTRUCTURE条件を束ね、元Workerのidentityを保つ限定相談・handoffを運転する。INTELLIGENCE案だけではconsult Workerを起動しない。OSは既存authorityで別assignmentを認可・割当・停止し、返答・分解・修正案を元Workerへ同じscopeで戻す。元Workerまたはmodel classの水準が明示的に未評価でも、限定初回実行を選ぶ場合はHELIXOS-L2-027既存条件を満たす範囲でその状態を保つ。これはL2-027の再定義や全相談への開始前依存追加ではない。source/返答が欠ける場合は成功handoffとしない。

**責務／依存境界**：OSが接続・receipt・戻し先を所有し、INTELLIGENCEは支援candidate、元Workerは作業、HARNESSはoracle、SECURITYは操作authority、INFRASTRUCTUREは資源を所有する。OS-L2-017/018/019/023を利用し、OS-L2-029 compositeの一周と混同しない。consult自体を使わないrunは本接続のreceiptを要求しない。

**受入条件**

- **`AC-OS-L3-028-01` ticket/scope結束**：consult request/responseとreturn handoffのticket、requirement revision/digest、scope、元assignment/attempt、source identity/revision、質問/応答、未完義務を照合する。
- **`AC-OS-L3-028-02` OS認可と失敗保持**：INTELLIGENCE proposalだけでは割当/起動しない。OSの有効な別assignmentがない、応答未着、sourceがrestricted/stale、範囲超過、またはstop/budget/期限条件到達時は成功再開とせず、attempt/cost/部分成果/未完義務/再開条件をL2-019へ保持する。未評価を理由に一律拒否せず、限定初回経路を選んだ場合だけL2-027の既存適格条件を照合する。
- **`AC-OS-L3-028-03` 元Workerへの復帰**：相談者へ元Workerのassignment/承認権限を移さず、回答とsource revision、scope、open dutiesを元Workerに返す。subtaskには親ticket・scope・依存・受入条件・停止条件を束ねる。相談者/助言者はindependent reviewerにならない。

### `FR-OS-L3-029` — `HELIXOS-L2-029`

案Bの順序に沿い、作業前のINTELLIGENCE-L2-068 test/instruction candidate、予定または有効な元Worker assignment/identity/model/provider/version/effort、元Workerの成果、HARNESS-L2-022 pair/oracleに結んだOS-L2-020実行・証拠、支援者から独立したreview、必要時のOS-L2-028 consultation receipt、失敗時の元Workerへの再作業を因果順で束ねるcomposite候補を扱う。事前candidateは予定assignment identity/scopeに結び、実Worker起動・実行はその時点の有効なOS assignmentを照合する。作業前candidateは失敗証拠やconsultを要求しない。Verifiedは各ownerの有効なreceiptに基づくcandidateとして、Acceptedは利用者acceptance receiptがある場合のみ記録する。OSはreview/acceptance receiptを生成せず、受領・対象revisionへの束縛・状態追跡を担う。

**責務／依存境界**：OSはassignment・stage/evidence binding・停止/未完記録、HARNESSはpair/oracle/段階acceptance、INTELLIGENCEは支援案、元Workerは実装/修正、独立reviewerは修正後exact HEADの独立review、SECURITY/INFRASTRUCTUREはauthority/資源を所有する。consultなし経路ではOS-L2-028 receiptは不要。OS-L2-020は許可された検証運転を行い、CI greenのみで受入を作らない。

**受入条件**

- **`AC-OS-L3-029-01` 作業前候補から開始**：ticket/scope・HARNESS-L2-022既存契約と予定assignment identity/scopeが揃えば、有効な実行assignment・失敗evidence・相談なしで事前test/instruction候補を元revisionへ結べる。実Worker起動時は有効なOS assignmentを照合し、候補だけで実装開始やassignmentを生成しない。
- **`AC-OS-L3-029-02` 作業・検証・段階証拠**：実作業時に有効なOS元Worker assignmentを照合したうえで、元Workerの変更、HARNESS oracleへtraceした検証結果、OS-L2-020 run identity、target HEAD/environment、段階状態を一致照合する。実相談を選んだrunだけOS-L2-028の認可・response/return receiptを追加条件とする。単体candidateまたはhandoff単独はcomposite successでない。
- **`AC-OS-L3-029-03` 独立reviewと再作業/停止**：最終変更後のexact HEAD/base/scopeへ独立review receiptと最新結果を結ぶ。修正前receipt、支援者のreview、CI greenだけを使わない。findingは元Workerへ返し、既存budget/期限/停止条件内で再検証する。停止時は未完のままattempt/result/finding/cost/open dutiesを記録し、固定loop回数を設けない。AcceptedにはL11利用者acceptance receiptを別途要する。

## 親・旧source crosswalk（item単位）

Stage 2a・2cの固定L2/L11親は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` 時点、Stage 3は `633bf12` を固定基準とする。現行採択はPO decision recordから読み、本文の候補metadataは履歴として保持する。test-designはoracle/failure consumerとして読んだ資料で、旧test/runtime/CLI/CIは実行していない。

| identity／管理行 | PO判断・登録（path/行/SHA） | 固定L2（行・全文SHA-256・正規化節SHA-256） | 固定L11（行・raw節SHA-256・全文SHA-256） | 旧L3（asset/path/行/SHA） | 旧test-design（asset/path/行/SHA） | 判断 |
|---|---|---|---|---|---|---|
| `HELIXOS-L2-014` / `MPR-RC-HELIXOS-L2-014-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; fixed registration `633bf12`, semantic digest `sha256:55e35f07301f891c0dfee4f16b107cef62a7aed92dae12c8cb55ad3ff7febcc1` | `docs/helix-os/L2-requirements/governance-requirements.md:619-635`; revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`, span `99e6dc6db0f8691d571b439ea142242dfdbd24da82668d55c82498ec4ca8e09d` | `docs/helix-os/L11-acceptance/governance-acceptance.md:317`; fixed L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`, raw row span `4151a53da492df9e4809195f08cc6fe2794faa4774dac122bc061437bd156769` | `LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:59-67`, SHA `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20`; near analogue `LEGACY-ASSET-D27D4A1511BFD43623A9` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md:75-113`, SHA `21ba24bf781048f1cb03a20172c8049a6112690cda3d0d0f7dd0ba3cb0bd7406` | `LEGACY-ASSET-67ADFAB856D954B3C5D2` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:45-47,58,73-81`, SHA `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee`; near analogue `LEGACY-ASSET-7468443FABFA6D06C4DD` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/lifecycle-stage-completion-goals-acceptance.md:17-35`, SHA `72c193a904027ed118433a92a049b7330a9da0cfdfac7a5a06dc0887a54e7f65` | FRS-BR-008/009の限定先行利用・安全閉包／組合せ検収を候補起点に再導出するが、旧Slice promotion unit、Lite/Full構成、公開承認、旧CI先行利用は採用しない。旧工程stageはpair構造・stage boundaryの近接例のみ。現機能は固定L2-014から再導出し、HARNESS-L2-017・INFRASTRUCTURE/LABO等のownerを分離。 |
| `HELIXOS-L2-015` / `MPR-RC-HELIXOS-L2-015-001` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `49` SHA `dcf2bf40854921cc93c3b5e7a60c29bd8cfca61a2e5f973514478693d4f463ca`; candidate digest `sha256:f2dc267a0ee538ea6c5e8e96e28f7853c674f0afd7506763fd8277a9181cd6ef` | `docs/helix-os/L2-requirements/governance-requirements.md:642-651`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `18756826fc4dda35a81059eebcecb81df554937cd60f828eb67a5f1cc3fbda69` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 324-329 / `79fabc2e1eed7f8ccf3e3ac1ea88c6d5fa0a1bb9cb392835912aa6b0ce04caa0`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-C6936A5DA79A6DAE4FE4` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/document-authority-census-requirements.md` 行 23-69, 70-87; SHA `e05adb62d9ad07507f962cf060b3dbe66c161afc3f09391b29b3144ced57535c` | `LEGACY-ASSET-170112AB2FA2FFDBFEE9` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md` 行 13-29, 42-55; SHA `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | authority/source/owner/digest/consumerを同一化しない監査視点を再導出。旧censusのtype set/resolver/taxonomyは移植しない。／unknown/stale/mismatch/permission failureのnegative oracle候補。secret値をfixture/logへ書かず、旧broker動作を移植しない。 |
| `HELIXOS-L2-016` / `MPR-RC-HELIXOS-L2-016-001` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `50` SHA `be790d31aaf6234703bb4a617c2778a9a301da649937e840ca971e8c2e7c6515`; candidate digest `sha256:10242ad9ca2021f29a096b0037c1349dbb332c1ea91f185065bec11ea86a6743` | `docs/helix-os/L2-requirements/governance-requirements.md:652-661`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `55d5b2e72438019d672d7cfd39c2c3908248bc9783952f678b0288132bdac7e8` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 331-336 / `2dc46eb36e8ca552c079ade0dad329c2ca0c244f4c2493a06eec4f60647897a3`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-E78B8D68CC327AA00991` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md` 行 26-58, 59-78; SHA `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61` | `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 行 32-90, 91-216; SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | source span・unknown/conflict・FR/AC/testへのtraceを再導出。JSONをL3正本とする規則、schema/generator/algorithmは移植しない。／FR/NFRごとの正常/異常・境界oracle、親 requirement/AC trace の形の起点。旧HAT・L12受入・旧CI/CLIを現行L10へそのまま当てない。 |
| `HELIXOS-L2-017` / `MPR-RC-HELIXOS-L2-017-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `60` SHA `9d30a7359b9dc969d4441a4ba1c7d62527eed4266b2fa609a2c53b9749de9632`; candidate digest `sha256:d8bf7fe2ecbe9c1ef8a709b58af8dec1eeab15171b6932002a834b438f6fd1df` | `docs/helix-os/L2-requirements/governance-requirements.md:662-671`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `1f74fdb3677c997071c80a618cd48d7c1f5f9cac2650efe61ecc197539f9f2f7` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 338-343 / `33fa3c66d69861c88593bccd1b2c22d2a92b4c6b5ec82c4456f0bf2ce52d3f4a`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-5EE032D657C221184B00` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md` 行 13-40, 41-63, 64-87; SHA `e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b` | `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 行 32-90, 91-216; SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | workflow transition→FR/AC/test trace、proposalとauthority分離の考え方を再導出。旧interview、JSON/schema/algorithm/measurement値は移植しない。／FR/NFRごとの正常/異常・境界oracle、親 requirement/AC trace の形の起点。旧HAT・L12受入・旧CI/CLIを現行L10へそのまま当てない。 |
| `HELIXOS-L2-018` / `MPR-RC-HELIXOS-L2-018-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/po-decision-2026-10-03-additions10.md:34`, SHA `a42baefd1f1c24461b6abb62e4daa88aec3fba36e5409170f8660cdbc8f6c8ad`; register row `695` SHA `074fb2b6eb1eaef3bd408fbb57e44c583278b72967f124fe0f726b654d9f882e`; candidate digest `sha256:5e2a621be8b4bda140bd796a48bedf2b3369daf5fad2665060ac41aa1a3174d2` | `docs/helix-os/L2-requirements/governance-requirements.md:672-681`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `41d0788d372793e0dd2c61d54d7e59886cfa45987a993cdeabdcb2c3b3b5ea72`; PO採択済みmultipart補足 `governance-requirements.md:1604-1620`, file SHA at fixed 2ab `97f9158bea0d5c39821bb6538887b909d04687798c8e836d151681ebb06f9bf7`, raw SHA `adaad20c38425da545c0f62e9d1eee23c9aaa9b6188a527e72f1ea0dce8031b3` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 345-350 / `77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`; adopted multipart supplement `1259-1276`, raw SHA `ba303351c99a385506d9f151d0b51c03fb08922ce7d2848ffb3b1f485c4c221c`, semantic digest `e32e45319a3ac91004e3e1a985c7ff44e91b9e86f05b85c266d6b8d67acf87b5` | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 行 34-124, 189-390, 391-478, 495-620, 717-856, 858-925; SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | scope/assignment/worker/reviewer/OS authority境界と失敗条件の意味を照合。旧固定provider/branch/WIP/lease/event modelやimplementation sequenceを移植しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |
| `HELIXOS-L2-019` / `MPR-RC-HELIXOS-L2-019-001` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `53` SHA `432271809d1ab4ae40fd50b888cfced90ea4091a774200da793c1039cd1734a4`; candidate digest `sha256:9362a64eef0f04968a8b1e89fde0027a145d5ab5c6aa9a6423d6e05e19ed447a` | `docs/helix-os/L2-requirements/governance-requirements.md:682-691`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `acea5c3a2f1b3a2c8aff97a37ed5476ad360d8707280f0bb0e8957b601a9e79f` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 352-357 / `9e17211bf2f7f54a58e2be30e23335954d94e184573912ed4f3ac92246838351`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-8FECCE93E3996E8AAAFF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/orchestration-memory-runtime.md` 行 14-50; SHA `c4fae09ac57f335a572b1d86ad353e7985551caa364f991a08e15d24d603c857` | `LEGACY-ASSET-1EAF81D2FED559ED38C4` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/lifecycle-state-separation-acceptance.md` 行 235-265; SHA `73a371eadd006c4f850cc0129f8c6cdf2b44c17d8356b94164cf253711c4f60c` | event/state/evidenceとworker/verifier分離は意味比較のみ。old file/db path、CLI、tick/locking/runtime behaviorは移植しない。／状態の誤昇格・証拠不足がcompletion claimに混ざるnegative oracle候補。旧state names/systemは移植しない。 |
| `HELIXOS-L2-020` / `MPR-RC-HELIXOS-L2-020-001` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `54` SHA `fd28113172eb24dc6778fbf0215be10687a3a981919c732a4fb5313c8a706f21`; candidate digest `sha256:fa62debc978fba6f5ab4146c0d3515a7ce7b5b4df3e054bd953b0f55e2f8878a` | `docs/helix-os/L2-requirements/governance-requirements.md:692-701`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `cae3019c5cd3549faaff920f9afa934f83ec4450c0ee7d7532bfc66ccc976f15` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 359-364 / `a9e5f9430836d409a7885b548fa8bff7a874184c024e74e28627cb9d7c59c88c`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` 行 38-57, 134-197, 198-307; SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 行 32-90, 91-216; SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | L3のFR/AC量閉じ・親L2 trace・要件とACを区別する構造を意味起点として再利用。51件/102AC、P2/P7後追い内容、旧ID、数値・gate実装をコピーしない。／FR/NFRごとの正常/異常・境界oracle、親 requirement/AC trace の形の起点。旧HAT・L12受入・旧CI/CLIを現行L10へそのまま当てない。 |
| `HELIXOS-L2-023` / `MPR-RC-HELIXOS-L2-023-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `62` SHA `a3aa2489fc4ab49fa640ce485ccced73d3db4f04923c3937a79561a53f6df8dd`; candidate digest `sha256:d0170f04d580850bcc2d8f2670a75f2137bfc0f04b2bb789819b2c1c72566020` | `docs/helix-os/L2-requirements/governance-requirements.md:722-731`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `9e07b91bc6da6705d31bd24c2b6078807ad644d7266ba068a3c8aa5dbf849248` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 380-385 / `a376384798f6ddd7ef34ea51a05852e974ee0b25f1f9ec1115674b8dcd316c20`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 行 34-124, 189-390, 391-478, 495-620, 717-856, 858-925; SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | scope/assignment/worker/reviewer/OS authority境界と失敗条件の意味を照合。旧固定provider/branch/WIP/lease/event modelやimplementation sequenceを移植しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |
| `HELIXOS-L2-027` / `MPR-RC-HELIXOS-L2-027-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `345` SHA `b20213434b816c9c5de60e506b9b7236302db7f5c9d191d4b73d2db372199246`; candidate digest `sha256:f0e3e68996a3f9b9cf1740413a979483f32b78dcc8cd1aca9a881d7dd7fa2d0c` | `docs/helix-os/L2-requirements/governance-requirements.md:824-846`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `49cd7c1512f292a292908d42c6af02024f5b7b0a89d7176e2c691720c27703c6` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 442-456 / `a2ae828eaa67210d5b6a38de065d989a5addfd5676f0408d6564fa318bb541c2`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-7F8960532611D89D03E1` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md` 行 32-70, 72-94; SHA `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | 外部技術の観測・根拠付きdiff・戻り先/再検証の考え方を再導出。外部tech inventory/upgrade lifecycleを現行要件に重複追加しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |
| `HELIXOS-L2-028` / original `MPR-RC-HELIXOS-L2-028-001` row410, current metadata successor `-002` row905 (same semantic digest `sha256:f41238ee4660d455d6f6a144bdab4a35ef9704aac190835a24589853ed3e4fab`, `authority_effect:none`), PO採択済み (`version_target: 1.0`) | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da` | `docs/helix-os/L2-requirements/governance-requirements.md:847-862`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; normalized section SHA-256 `sha256:f41238ee4660d455d6f6a144bdab4a35ef9704aac190835a24589853ed3e4fab` | `docs/helix-os/L11-acceptance/governance-acceptance.md:457-467`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`; raw section SHA-256 `92ef51759878794066463d36cda375b19cf2a7025d13062101f72464ef981485` | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 行42,90-117,302-310,357-364,591-597; SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | 元Worker責任の保持、scope/budgetのbounded支援、元Workerへの戻しとrole separationを再導出。旧daemon/branch/lease/provider/slot数/CLI/runtime/CIを移植せず、現行OS/INT/HARNESS/SECURITY/INFRA責務へ置換。 |
| `HELIXOS-L2-029` / approved fixed registration `MPR-RC-HELIXOS-L2-029-003` row433, current metadata successor `-004` row911 (same semantic digest `sha256:59a37b8d83fb269c12263089d937e696d0b9bfe8684d46822e267588802878f8`, `authority_effect:none`), PO採択済み (`version_target: 1.0`) | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:27`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da` | `docs/helix-os/L2-requirements/governance-requirements.md:863-877`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; normalized section SHA-256 `sha256:59a37b8d83fb269c12263089d937e696d0b9bfe8684d46822e267588802878f8` | `docs/helix-os/L11-acceptance/governance-acceptance.md:468-478`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`; raw section SHA-256 `921d184ab89892a7a257600e13e80290053dc49749e9f708909f27f2bd2f42ea` | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 行42,90-117,302-310,357-364,591-597; SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | original Worker・support・reviewerの分離と因果loopを再導出し、L2/L11の案Bで作業前支援を前倒し。旧固定実装順/slot/lease/cycle/provider/runtime/CIは置換し、L2-018/019/020/023・HARNESS oracle ownerを保持。 |

## PO向け要約（承認未取得）

この部分草稿は、Stage 2aのauthority/ticket/assignment/continuity/verificationに加え、Stage 2cで支援handoff（028）と支援から検証・再作業までのcomposite（029）を別々のFR/ACへ展開する。案Bに沿う作業前candidateはconsultやfailure evidenceなしで準備可能とし、実相談・実作業・検証・独立reviewは発生後の別証拠で照合する。各ownerの正本・oracle・権限・資源をOSが代替せず、unknown/staleと未完義務を保持する。固定回数のretry/loopや新しいbudget/deadline値は追加しない。

## Stage 3：HELIX-OS 15項目（部分草稿、承認未取得）

対象は採択済みHELIXOS-L2-032/033/034/035/036/037/038/040/041/042/043/044/049/050/051と対L11。FR IDは親identityと別にし、L10は同じACを参照する。対象のversion_targetは1.0であり、実装・運転・releaseを意味しない。OSは登録・進行・記録・受渡しを担い、HARNESS oracle、SECURITY authority、INFRASTRUCTURE資源、LABO評価、INTELLIGENCE提案、source ownerの意味判定を代行しない。

### FR-OS-L3-032 — HELIXOS-L2-032
選択profileのcheck/version、known fingerprint、policy baseline、current run HEAD/tree、scope、理由、remediation先、expiry/iteration上限、代替minimum gateを別々に照合し、限定quarantine eligibilityとprovenanceを記録する。failureをpass化せず、HARNESS義務を減らさない。policy非選択runにはpolicy入力を要求しない。
- AC-OS-L3-032-01：一致したcheck/version/fingerprint、登録baseline、明示scope内current HEAD、期限・owner/ticket・required oracleを満たすminimum gateでeligible receipt。baselineとcurrent HEADは別field。
- AC-OS-L3-032-02：fingerprint/version/baseline/scope/期限・上限/owner/ticket/gateの欠落・不一致を個別に変異しeligible 0。別版互換を推定しない。
- AC-OS-L3-032-03：未登録checkは当該failureのみunknown/通常failure。policy非選択runは通常のprofile条件で処理する。

### FR-OS-L3-033 — HELIXOS-L2-033
選択scope内engine capabilityとdetectorを別identity/owner/version/configで登録し、同じinput snapshot・target revisionのrun/rerun artifact/finding/provenanceを結ぶ。detector結果はidentity/version、finding code/severity/location/subject/evidence、dedupe identity、原provenanceを含む固定L11の必要fieldを照合する。artifact digestまたはfingerprintだけでfinding contract全体の一致を代表させない。engine機能/finding意味はOSが所有せず、HARNESS-L2-005 oracleとOS-L2-020 runを使う。
- AC-OS-L3-033-01：選択された全engine/detectorの同一snapshot・版/config・target再実行で、artifact digest/finding fingerprint一致範囲だけ再現receipt。
- AC-OS-L3-033-02：選択物の個別欠落、版/config/snapshot drift、artifact/finding混同、rerun差異、およびdetector必要fieldの各個別欠落はscope全体の再現成功にしない。
- AC-OS-L3-033-03：未登録能力/版は選択分のみ未評価。未選択能力のrunは要求しない。

### FR-OS-L3-034 — HELIXOS-L2-034
不変の原指示/finding eventと、根拠・target・source・actor/time・既存authority receiptを選択dispositionへ結ぶ。意味判定・PO authorityをOSが代行せず、challenge/reopenは履歴追記。finding accepted-riskとdirective cancel等の根拠差は固定L11どおり。
- 分類前にuser directive/review findingの原記録を既存OS-015のdurable intake recordへ結ぶ。保存できないときは未受領/未完を残し、分類結果だけで受付成功にしない。
- AC-OS-L3-034-01：duplicateには生存target/oracle包含、false-positiveには独立反証/review、accepted-risk/cancel等には各々L11所定のaction-bound receipt。
- AC-OS-L3-034-02：根拠欠落/stale、target非生存・包含なし、自己反証、必須receipt欠落、projection closeのみを独立変異し、終端化/削除せずownerへ戻す。
- AC-OS-L3-034-03：未知dispositionは非終端unknown。reopenは先行event/receiptを保持して新根拠を追加する。
- AC-OS-L3-034-04：分類前のdurable intake receiptと後続dispositionを同一原eventへ結ぶ。保存失敗時は未受領/未完とし、分類だけが成功した受付や原指示を失った状態を成功扱いしない。

### FR-OS-L3-035 — HELIXOS-L2-035
選択project/repository scopeのPR lifecycle eventから、event identity/revisionに冪等な論理監査job requestを一つ生成し、OS-L2-010 ticket/workflow境界へ登録receiptを返す。監査実行・finding処理・HARNESS↔OS接続受入は含まない。
- AC-OS-L3-035-01：scope内のcreate/update/complete相当event（全base branch・stacked PR含む）がsource/headと結ばれ、一eventにつき論理job登録receipt一つ。これはjob登録の完了だけを示し、scan/review実行、finding処理、review完了を示さない。
- AC-OS-L3-035-02：再送、古head、旧receiptの新head転用、base/stacked除外、scope外混入を個別に変異し、duplicate/誤head/誤scopeを拒む。
- AC-OS-L3-035-03：未知action/source版は未完・未観測とし、既存契約が支持するeventはaction未fixtureだけを理由に落とさない。

### FR-OS-L3-036 — HELIXOS-L2-036
全Retrofit upgradeについて、対象upgradeごとにpreflightを計画確定前に同一ticket/対象revisionへ結び、計画確定後はapplyの直前にもcurrent source・結果・authorityを再照合する。preflight成功前も影響調査と未確定plan draftは続けられるが、failed/unknown/staleは計画確定・applyへ進めない。preflightの技術的意味/互換性はowner側に残す。
- AC-OS-L3-036-01：正常fixtureでpreflight success後にだけ同ticket計画を確定し、apply直前の再照合receiptを結ぶ。
- AC-OS-L3-036-02：未実施/failed、ticket/revision違い、stale result、apply直前drift、authority失効を各々変異し、確定またはapply 0。
- AC-OS-L3-036-03：applicability/result owner unknownなら保留。非-Retrofit operationへ一律preflightを課さない。

### FR-OS-L3-037 — HELIXOS-L2-037
週次drift/技術負債観測を対象scope、期間、source revision、結果と記録し、既存条件が成立するときだけOS-L2-010のticket候補へ渡す。意味・優先度はLABO/source owner、影響/ReverseはHARNESS。未観測は「差分なし」でない。
- AC-OS-L3-037-01：2期間の同scope観測で条件適合する差分のみ根拠つき候補として渡す。
- AC-OS-L3-037-02：期間欠落、stale source、差分なしの負債化、同finding重複を各々検出し誤候補0。
- AC-OS-L3-037-03：条件/source unknownは当該scopeのみ未評価。無関係ticketを停止しない。

### FR-OS-L3-038 — HELIXOS-L2-038
選択layer/revision/base digest、適用中HARNESS ledger/template contract、source-backed proposalからOS snapshotとappend-only proposalを作る。HARNESS-L2-040の既存契約と、PO採択済みHARNESS-L2-041-003が出力する抽出findingを入力とし、OSはその意味を再判定せずwriter outcomeを記録する。L0 anchorは別record。OS receiptはsemantic approvalでない。
- AC-OS-L3-038-01：有効contract/templateに適合する選択layer proposalを一度だけ追記し、source/base/template/digest/scopeへ双方向traceする。
- AC-OS-L3-038-02：stale base/template、authority/scope欠落、L0をlayer扱い、再送、途中保存失敗を独立変異し重複/部分成功/意味変更0とする。HARNESS-L2-041-003の非原子的obligation findingではcandidate rowを増やさず、rejected outcome findingを記録し、既存snapshotを不変に保つ。
- AC-OS-L3-038-03：HARNESS-L2-041-003の同一入力再抽出不一致はquarantineし、current ledger更新0・snapshot不変とする。未知atom/contractもgap/未完としてHARNESS/source ownerへ戻す。

### FR-OS-L3-040 — HELIXOS-L2-040
入力済retry上限に達したoperationをattempt lineage/失敗根拠とともに既存typed return routeへ戻す。未採択旧ticket型や親にないbudget/上限値を新設しない。
- AC-OS-L3-040-01：入力済上限到達時だけtyped Recovery/Backflow候補と未完義務を記録。
- AC-OS-L3-040-02：未到達、別ticket/scope、値欠落/改変、再送を個別変異し誤route/counter reset/二重生成0。
- AC-OS-L3-040-03：policy/route unknownなら続行せずownerへ戻す。旧分類名を復活させない。

### FR-OS-L3-041 — HELIXOS-L2-041
再読込不能時は許可されたcoordination state/未完義務のみ保持し、現行正本から対象/revision/authority/sourceを再取得して結合する。stale context/secret/private reasoningを持越さずOS-L2-009の継続境界を使う。
- AC-OS-L3-041-01：正本再取得後に同scopeを継続し、未完義務/停止理由は保持、古い値をcurrent化しない。
- AC-OS-L3-041-02：drift、取得失敗、authority失効、禁止情報持越しを別々に変異し継続保留。
- AC-OS-L3-041-03：保持可能範囲unknownならcoordination-only未完で返す。

### FR-OS-L3-042 — HELIXOS-L2-042
Worker outputはstrict schema/digestを既定検査し、不適合成果を受入・保存へ流さない。緩和時は既存契約の対象・理由・期限・owner・再検証receiptを結ぶ。旧schema/実装や新承認者は導入しない。
- AC-OS-L3-042-01：正しいschema/version/digest/revisionだけ検証済候補としWorker/attempt/sourceを保持。
- AC-OS-L3-042-02：schema/digest不一致、既存選択contractに明記された条件違反、緩和条件各欠落/再検証なしを個別変異し昇格0。contractにないsize/timeout条件は追加しない。
- AC-OS-L3-042-03：version/applicability unknownは対象成果のみ未完。

### FR-OS-L3-043 — HELIXOS-L2-043
approval request/tool call/resultを要求・対象・actor/role/scope/correlation/revisionに別eventで結ぶ。requestはapproval receiptではなくcallは成功resultではない。requestは既存authority契約がそのoperationに要求する場合だけ記録し、通常のrequest不要操作へ追加しない。未決の旧Node専有write authorityを採用・移管しない。
- AC-OS-L3-043-01：既存authority契約がrequestを要求するoperationは有効なauthorityのもとrequest→call→resultを結び、各owner/time/resultを追える。request不要の正常操作に新requestを要求しない。
- AC-OS-L3-043-02：request必須operationでのrequest欠落、target/scope相違、duplicate、拒否/失敗のsuccess化を個別変異し因果履歴を保つ。request不要operationへだけ適用したrequest mutationは要件違反を作らない。
- AC-OS-L3-043-03：event/authority unknownは保留しownerへ返す。ACKだけでapproval/完了を生成しない。

### FR-OS-L3-044 — HELIXOS-L2-044
feedback findingを原文/source/head/identity/owner/resolution evidenceへ結ぶ。prose-only handoverはresolutionでなく、既存source owner条件のstructured evidence/receiptが揃った時だけ該当findingをresolvedにする。未ack lifecycle全体を統合しない。
- AC-OS-L3-044-01：findingと同一head・受領owner・resolution evidenceを結び該当findingのみresolved。
- AC-OS-L3-044-02：prose-only、別head/finding、受領者/evidenceなし、source mismatchを個別変異しopenのまま。
- AC-OS-L3-044-03：contract unknownは該当findingのみ保留。未選択sourceを常時必須にしない。

### FR-OS-L3-049 — HELIXOS-L2-049
configured resource上限と割当可能/割当中/実行中/遊休/検証待ち/統合待ち/停止・失敗を時点/source付きで区別する。遊休taskの追加割当はREADY/依存/優先順/authority/scope/競合を守り、後段検証義務・担当・実施capacityを割当前に確保できる場合のみ別assignmentとする。登録数を実行数/throughputと混同しない。
- AC-OS-L3-049-01：有限task fixtureで各状態を分離し、後段容量確保済みの適格taskだけ追加。
- AC-OS-L3-049-02：依存/authority/scope/競合/期限/後段担当・容量/上限を各々変異しdispatchを保留。
- AC-OS-L3-049-03：INTELLIGENCE案、INFRASTRUCTURE資源、観測時点unknownは稼働中と推定せず、適格taskなしはidleのまま。

### FR-OS-L3-050 — HELIXOS-L2-050
review負荷・独立reviewer availabilityを適用中のtyped threshold/capacity/縮退条件で観測する。reviewer不足が主因で適格reviewerが上限内にいるときだけ別対象review assignmentを増枠。merge admission/Ready化/作成branch権限を生成しない。
- AC-OS-L3-050-01：backlog/待ち/rework/reviewer状態と設定の同期間観測で、review capacityが原因のときのみHEAD/generation-bound割当。
- AC-OS-L3-050-02：downstream詰まり、上限、reviewer不在、重複、active lease中断、設定欠落を個別変異し増枠成功0。
- AC-OS-L3-050-03：cause/threshold/authority/適性unknownなら当該scopeをbackpressureし、他の許可済みreviewを一律停止しない。
- AC-OS-L3-050-04：適用中の縮退条件成立後もactive review leaseは完了まで維持し、完了後に縮退する。変更HEADには独立reviewを割り当て、最新base/HEAD・scope・admissionのmerge前照合は既存条件のまま保つ。

### FR-OS-L3-051 — HELIXOS-L2-051
taskごとのscope/role/authority/task class、LABO適性evidence、INTELLIGENCE案、runtime capabilityを照合しexecution作成とreview_mergeを別々に割当。provider名のみを適性・独立性にしない。条件付きCursor create-only/Claude優先はPO採択条件内のtaskだけに適用。
- AC-OS-L3-051-01：両役割の適性・authority・availability・異なるruntime/context根拠を同revisionへ記録し条件に沿う配置を許す。
- AC-OS-L3-051-02：同一runtime/context両役割、Cursor review、未評価/scope外/authority不足、旧HEAD reviewを個別変異し拒否。
- AC-OS-L3-051-03：適性/availability/scope unknownは未割当でownerへ返す。provider名で迂回しない。

## Stage 3: 15項目の固定親・旧source crosswalk（部分草稿）

親L2とL11はmain `633bf12`の固定bytes。PO decision rowが採択 authorityであり、register metadata successorや本文中の旧状態表現からauthorityを推測しない。表のL2/L11 raw span SHAは各sourceの物理行末を含む。旧L3/testは読み取り済みの意味起点またはfailure/oracle consumerであり、実行していない。

| 親ID / 固定registration | PO判断（path:row SHA） | 固定L2（path/span、file SHA、raw SHA、semantic SHA） | 固定L11（path/span、file SHA、raw SHA） | 旧L3/要求起点 | 旧paired test起点 | 項目別判断 |
|---|---|---|---|---|---|---|
| HELIXOS-L2-032 / MPR-RC-HELIXOS-L2-032-001; fixed register row 499 4abc49701912e0937edd9b8fdd5e927a3490dc8b3ccdb990f08704f9428e5a8f; digest sha256:a506a984a1ef3e16895b5ed9d7c311093d66d64a3400a017239a007e6d4dd202 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L55 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row 878ad5a4eda88fbac3f6341ddbe58a613d386be06d668b12d6a90be4dc4b67c1; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:913-928; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw 349a36e7c736e7532c677ffedde1e2fe6769efe2f4f44041d65070941afcd108; semantic sha256:a506a984a1ef3e16895b5ed9d7c311093d66d64a3400a017239a007e6d4dd202 | docs/helix-os/L11-acceptance/governance-acceptance.md:513-523; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 57fb18f76c8091d94f3e89ada8bd101050eb5df2910ec1f993722b00bb1d941d | LEGACY-ASSET-C7F0C3B79CBAA72960BF `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:40,69` (HR-FR-HIL-06), SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | LEGACY-ASSET-FA8C6E69463183D6A19B `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:38` (HAT-HIL-06), SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`; LEGACY-ASSET-8CEC5559B69B216F7CCF `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:49` (HST-HIL-022), SHA `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` | 旧L3のFR/AC親trace構造を再利用し、quarantineのfingerprint/provenanceは現L2から再導出する。固定CI段階は置換する。 |
| HELIXOS-L2-033 / MPR-RC-HELIXOS-L2-033-001; fixed register row 500 f99fd0ec160de7cab34063d08055456083ab8fc62f5186c33c401da3baa9faad; digest sha256:580778c8ef3c0e4c4676d13de203c821f990893e9aa078d8d1d2f0b8901d2dbc | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L56 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row 54a81764fb7a3656fe51fc4028c57c714e034bcee10c7d4c3193ede2205ab5fd; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:929-944; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw b1d3bef2920641726bebe86571a1fa10c65b94a5889863faa073eaf8a1422240; semantic sha256:580778c8ef3c0e4c4676d13de203c821f990893e9aa078d8d1d2f0b8901d2dbc | docs/helix-os/L11-acceptance/governance-acceptance.md:524-538; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw ebf8ecaff524a20989fc87ef04cb5a0f46b03d5768a6397719b563c08757f0f1 | LEGACY-ASSET-C7F0C3B79CBAA72960BF `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:44,73` (HR-FR-HIL-10), same SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | LEGACY-ASSET-FA8C6E69463183D6A19B `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:42` (HAT-HIL-10), same SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`; LEGACY-ASSET-8CEC5559B69B216F7CCF `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:35-36` (HST-HIL-008/009), SHA `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` | source/capability traceを起点にし、選択済み全engine/detectorのrerunとartifact/finding分離は現L2から再導出する。旧CI/runtimeは置換する。 |
| HELIXOS-L2-034 / MPR-RC-HELIXOS-L2-034-003; fixed register row 617 54017211ab892bfd9d660df1edc3584b2be31b4224b38b8d3f6d8e21f5bdf0b6; digest sha256:6b019294047fce2e1c8b5d1b5e8d379fa9111f5912274f6dca918ffd81c0e1e8 | docs/governance/decisions/po-decision-2026-09-30-live26.md#L51 (full 8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145, row 9e5008e562be198466fe57dcbdd9ccfffde23c5f2797e13f60af394cd93e6442; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:945-986; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw c363a4e957a2295657004808a8d7ecc29e68724cf057dc71259a7b245d5c6716; semantic sha256:6b019294047fce2e1c8b5d1b5e8d379fa9111f5912274f6dca918ffd81c0e1e8 | docs/helix-os/L11-acceptance/governance-acceptance.md:539-580; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 4dfcbb69be8e10084cac59848ce82c97597d2a2d72cd0f41773f69f0e975fb00 | LEGACY-ASSET-C7F0C3B79CBAA72960BF `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:39,68` (HR-FR-HIL-05), SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | LEGACY-ASSET-FA8C6E69463183D6A19B `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:37` (HAT-HIL-05), SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`; LEGACY-ASSET-AFE91778057B7E76BEEC `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:63` (HOT-HIL-36), SHA `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576` | 原event/historyの保持を再利用し、disposition別evidenceとreopenは再導出する。旧status運用は置換する。 |
| HELIXOS-L2-035 / MPR-RC-HELIXOS-L2-035-001; fixed register row 517 6f8a1bbfcaf1f141e28a6a801f4240565f5c3d784b5351a69026a04d75a50764; digest sha256:01ab4c9e572c5af909e4dbf46fb8f44866dd6cc7701dddc88b8dabbe14fb6c03 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L58 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row 86475e594d97ea452e6a1e41b7f7c8761a5d60ce4ab4f9062ce044ece6224222; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:987-1032; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw 621ba614037001827c87454267d46102f104249d93189859fa7486f5139114a7; semantic sha256:01ab4c9e572c5af909e4dbf46fb8f44866dd6cc7701dddc88b8dabbe14fb6c03 | docs/helix-os/L11-acceptance/governance-acceptance.md:581-619; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw ac7dae3f98ab5e9c30617f4f801c99448750a96976cf10a247e1b3b3b6d76d5d | LEGACY-ASSET-C7F0C3B79CBAA72960BF `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:37,66` (HR-FR-HIL-03), SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | LEGACY-ASSET-FA8C6E69463183D6A19B `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:35` (HAT-HIL-03), SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`; LEGACY-ASSET-8CEC5559B69B216F7CCF `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:31` (HST-HIL-004), SHA `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` | lifecycleのsource/head保持を類例として参照する。冪等なjob intakeからOS-L2-010への接続を再導出し、監査実行/PR成功は除外する。 |
| HELIXOS-L2-036 / MPR-RC-HELIXOS-L2-036-001; fixed register row 524 b8d5e7fada54b3593bb25f6cd3d42e16d9720c9d09f67863466ff508063d8799; digest sha256:82c3fc7c25b023604463f4c44c284440b9666342a0cf8a3bd6b1996394cb33b9 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L59 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row 722b92aad6fe789587bf8d3b41cb28f9a2283cc1d422227773cd73a507162f2b; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:1033-1064; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw 1db82b6f6f2877d1938fa5082e91f781692c56fc59d726350a9ef6f2296d2921; semantic sha256:82c3fc7c25b023604463f4c44c284440b9666342a0cf8a3bd6b1996394cb33b9 | docs/helix-os/L11-acceptance/governance-acceptance.md:620-651; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 5558761976c269fcdba3f1aed016b3e5857dc7f0ce5dddd5cd41fac725093c87 | Old requirements v1.3 `§9.2:624`, asset 02319C2481B9E01698D5, SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`; `process/modes/retrofit.md:30,36-39,86`, SHA `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049`; old L3 registry `workflow-execution-policy-registry.v1.json:141-155`, SHA `eeb30c1bb51f74798563b31b0802b301fb687d2e750c517061588969a7ff344f` | LEGACY-ASSET-244EA3589B045E0420AE `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-universal-reverse-redesign-integration-test-design.md:65 (IT-URR-024)`, SHA `09c0003e7a2bd7414cb233d8fe5c2715efed2f69bfce42dfada7e0bc28f74918`; LEGACY-ASSET-4E4971526C4DB920AD66 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-universal-reverse-redesign-unit-test-design.md:57-58 (U-URR-023/024)`, SHA `044fdad0feec5f2a6addd5278282326dfce4125855941d591ce35be15639524d` | 全upgradeへのpreflightとplan停止を保持し、各apply前のcurrent性確認は固定L2から再導出する。read-only registryをapply authorityへ拡張しない。 |
| HELIXOS-L2-037 / MPR-RC-HELIXOS-L2-037-001; fixed register row 528 4d1d6a8500bca33b26b16944d1c064d1e058cbc39eeb6fc5159669e32147f209; digest sha256:29563f1fdde0d9ace0b0850a5fc57bc6f6b595f460a5caa293c7eefb60905d64 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L60 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row c85ed2e89aa6fd1172a2684de1c7c19285d0a6666e179e34a88bae9bfb110080; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:1075-1095; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw c26bdea1ab00bb33ee3bea0c9cbb13158c24787cc9e1039563edb6c655559f95; semantic sha256:29563f1fdde0d9ace0b0850a5fc57bc6f6b595f460a5caa293c7eefb60905d64 | docs/helix-os/L11-acceptance/governance-acceptance.md:652-670; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw a104b01550b3b4fbaae1b88ef0370a59836dd9dc31d5d68b345622ccfea941dd | 直接対応する旧OS L3 itemは照合した旧L3一覧から特定できず。旧L3一覧 `LEGACY-ASSET-C7F0C3B79CBAA72960BF` (infinity-loop-functional-requirements.md、file SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`) は一般的な要件構造の参照に限る。旧運用の近接起点は `LEGACY-ASSET-DA568640BA3E8815682F` `archive/legacy-generation-2026-09-14/root/docs/process/modes/refactor.md:21-23,43-48,55-68,75-87,89-95` (file SHA `06023f7b1149883d813d593ba207898e64a7485ec32eb68c7e01e17a2323d397`)、`LEGACY-ASSET-742165741A46F688192F` `archive/legacy-generation-2026-09-14/root/docs/process/drive-route-system.md:62-66` (file SHA `22c7980eccafffab84216b3ef250c374a719045dfca2f7d6ea8f08960243e950`)、`LEGACY-ASSET-B30F3C82B6B0FDC0D2A8` `archive/legacy-generation-2026-09-14/root/docs/process/gates.md:114-115` (file SHA `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`)、および `LEGACY-ASSET-02319C2481B9E01698D5` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:623` (file SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`)。これらは構造的負債/劣化signalをRefactorへrouteし、候補登録・根拠・regression fence・triageを扱う近接運用で、週次cadenceや現L2のticket handoffを直接規定しない。 | 直接対応する旧paired test itemは特定できず。generic AC/test table structureは `LEGACY-ASSET-FA8C6E69463183D6A19B` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md` (SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`) を参照し、oracleは現L2/L11から再導出。旧process/refactor.mdのRed/Yellow/Green条件はfailure/consumerの比較資料であり、現行L10 oracleをそのまま移植しない。 | 旧L3に直接対応するOS itemはない。Refactorのdebt/code-smell/structural signalから候補化し、behavior不変・根拠・回帰fence・triageという役割を近接運用から再導出する。週次周期自体は旧sourceに見つからず、親L2の2期間観測を根拠に具体化した。owner、分類、ticket handoffは現L2/L11から再導出し、旧workflow、DB、CLI、閾値はコピーしない。 |
| HELIXOS-L2-038 / MPR-RC-HELIXOS-L2-038-002; fixed register row 602 41ff930e78fd24ca7fedfdf976a30c5afc9d787b52aae763900032b6334ceb77; digest sha256:c3b0424bd39ac7c91166c87738fbefc1b20a11b904012d9ada768a113ccbe013 | docs/governance/decisions/po-decision-2026-09-29-11candidates.md#L35 (full 6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5, row 6957adc3c5651e5012aba7b8797ae0d8b3d8e210f31e857ce1894a1f0ff9d8b8; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:1096-1114; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw 1adb7145d4d787e5fdda7e00a79a10ce8fbb4b996f5c73191eeb224ce745cbce; semantic sha256:c3b0424bd39ac7c91166c87738fbefc1b20a11b904012d9ada768a113ccbe013 | docs/helix-os/L11-acceptance/governance-acceptance.md:671-674; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 3b561b5990a3bbab07aec3119d1035cc7958719136eed30b450f5b249e2367d6 | LEGACY-ASSET-C7F0C3B79CBAA72960BF `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:52,81` (HR-FR-HIL-18), SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | LEGACY-ASSET-FA8C6E69463183D6A19B `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:50` (HAT-HIL-18), SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`; LEGACY-ASSET-8CEC5559B69B216F7CCF `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:57` (HST-HIL-030), SHA `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` | trace/atomic saveを起点としてwriter契約を再導出する。OS L11:671-689と-002追補690-695を読む。追補の旧「未採択」表現は文書時点の記録であり、PO decision 11はOS038-002とHARNESS041-003を採択した。最新HARNESS L11 041-003のatomicity/nondeterminism finding (711-714)を入力とし、OSは再判定せずoutcomeを扱う。 |
| HELIXOS-L2-040 / MPR-RC-HELIXOS-L2-040-001; fixed register row 553 a942f0638ad7f1d2d5bac30760c67f285f0144ff0ca4615f33a9a2f1af55798b; digest sha256:dfd272b75826d37333671f7152a0a58d2d013f0bd13a3f3957a76a39dcdfad80 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L63 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row 863b15ab4b8102d7574efeffaa16ce6ef8a11958221bf36f62caeea848924fa4; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:1125-1134; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw a5ba2bdca6bfc8adcf3216f523e882b53898d0a0424b886c1a5a6885542c3aee; semantic sha256:dfd272b75826d37333671f7152a0a58d2d013f0bd13a3f3957a76a39dcdfad80 | docs/helix-os/L11-acceptance/governance-acceptance.md:732-743; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 2fdcdc32156561d4b9f9931ee20194bf39b297ff96d477e58ff0d48c3abe232b | 3A15E5645D2D2A59DFF5 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md` (HXT-FR-014), SHA `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b` | BE8B151A0094B754FF20 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-acceptance.md:43` (HXT-AC-015), SHA `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d` | typed recovery/backflow oracleの形を起点とし、既存typed routeとretry入力を再導出する。旧category名は復活させない。 |
| HELIXOS-L2-041 / MPR-RC-HELIXOS-L2-041-001; fixed register row 556 ae21c9108f017cc6ee9797e12fdd7d5d497d1f5e5c1cb180f19854b599e05209; digest sha256:a43e3eda819e37ef81db0c60c5add5cebce5e3d17ca858c1446c27ac4db80c48 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L64 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row 88fcaa59d93c43d56af83aba7899c745a9adbab0e3448be8afe7b6fb2fecc999; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:1135-1143; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw 606c5eb4b8166af4c21521ccf65c85d185b65bdb6861aa4fd3e537e749a2d74c; semantic sha256:a43e3eda819e37ef81db0c60c5add5cebce5e3d17ca858c1446c27ac4db80c48 | docs/helix-os/L11-acceptance/governance-acceptance.md:744-755; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw aeb6a5f0ea9ceeb9a960da1527256876a55a4f53da6bfe7d0fa701b2e07c1043 | 50CA1C554747F12266D3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:34-124,189-390,391-478,495-620,717-856,858-925`, SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`; IPC-R07 continuity source | 437A6A68F9A9E0AE1B9E `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:17-55`, SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707; instruction-path-change-resilience-acceptance.md IPC-AC07 | 継続とownerへの返却を再導出する。旧provider/lease/branch/runtimeの選択は現OS契約で置換する。 |
| HELIXOS-L2-042 / MPR-RC-HELIXOS-L2-042-001; fixed register row 560 8823feabdd10436644d231217ab3dea959e04442d0460b4ec989bb9fdafe9780; digest sha256:75e8b9f72eaa777f25e38335664cb2527da8c56c1445a3eca181de27cc258e71 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L65 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row 80c4cb876936846e7a76da80da77b59fa80ac014a98d1e8f7924169bbf6185aa; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:1144-1152; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw af2f9f98196667ecd7583349e64a309c7e0a1bff58f4bac065105d9c55c9acfb; semantic sha256:75e8b9f72eaa777f25e38335664cb2527da8c56c1445a3eca181de27cc258e71 | docs/helix-os/L11-acceptance/governance-acceptance.md:756-769; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 1bb759afc770196f8d3ac09bc8c708398293f56a05351a84645d52210f8c591e | LEGACY-ASSET-EE5DBACC7F28F7D1F605 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:151` (FR-P2-08), SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; LEGACY-ASSET-9114D4E463E95B67DD0C `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:59` (WCC-FR-05), SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | LEGACY-ASSET-44DD86E3DEC09E65EF51 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:108` (HAT-P2-08), SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`; LEGACY-ASSET-C6ADB99F1353965C5449 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:35,57` (HAT-WCC-07 schema/digest/緩和oracle), SHA `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | strict schema/digestとscope限定の緩和条件を再導出し、旧実装/schemaは置換する。 |
| HELIXOS-L2-043 / MPR-RC-HELIXOS-L2-043-002; fixed register row 563 630b71e525547739316b2b6d37d27ec679b413474f22dcc8d05c25eeed965ed0; digest sha256:e286b34a9805a690f324ebe37ee0936691f636082b49350ee9dc5183787d9a68 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L66 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row addb08625038fa2124e6f3a158ad0d15047f82004b18e454ba2ca3a537c804ef; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:1153-1161; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw 909df8f324b181387bb9a5abf875e8b4cc9d935bd092145b0d088f6db4b8f585; semantic sha256:e286b34a9805a690f324ebe37ee0936691f636082b49350ee9dc5183787d9a68 | docs/helix-os/L11-acceptance/governance-acceptance.md:770-778; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 9b36703719d1de859d2601cebda576763ba006fadaf2159aaf333b48aa26d6a7 | LEGACY-ASSET-EE5DBACC7F28F7D1F605 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:149` (FR-P2-06), SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; LEGACY-ASSET-9114D4E463E95B67DD0C `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:36,55` (WCC-FR-01), SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | LEGACY-ASSET-44DD86E3DEC09E65EF51 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:106` (HAT-P2-06), SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | typed event/correlation traceを再導出し、未決だったNode単独write authorityは継承しない。 |
| HELIXOS-L2-044 / MPR-RC-HELIXOS-L2-044-001; fixed register row 565 b97166abc0822eac6e4bb9359744dce5d42a32140c2ad24f213751d024aa78ed; digest sha256:45ec39bee8dc441f040b0b571f2c62be900d9619eaa1facda5f9017f97678289 | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L67 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row 6f3334da6887e697a3df623ada6e7e84963870ea7d706759edfdda4bfbe96153; adopted) | docs/helix-os/L2-requirements/governance-requirements.md:1162-1168; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw a9708b9e792b5b3dc3ab013da906181d40c0d5f629a373b47f768b947c2d813f; semantic sha256:45ec39bee8dc441f040b0b571f2c62be900d9619eaa1facda5f9017f97678289 | docs/helix-os/L11-acceptance/governance-acceptance.md:779-785; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 403364124a80f11b82ef006e74b132db9817fc2db51280843283300bb4ad1918 | 直接source atom `HR-AC-HYB-006` は `LEGACY-ASSET-02319C2481B9E01698D5` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:290` (file SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`)。関連するが対象外の旧L3 `LEGACY-ASSET-8686BB8CF396BAF57F2E` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-merge-admission-requirements.md:29` (file SHA `cdd4f9fd0ab9b4862ec52c6b6dbcd9fd5f97c5e7bb5440f1b2cda69d37c504f8`)。 | 直接oracleも同一旧requirements file:290のHR-AC-HYB-006 prose-only resolution clause。別の旧test-design atomとは主張しない。より広いlifecycle/ack clauseは対象外。 | prose-only resolution条件のみ再導出し、広いlifecycleとSessionStart surfaceは除外する。 |
| HELIXOS-L2-049 / MPR-RC-HELIXOS-L2-049-003; fixed register row 598 aaa81f8c2b109575115720a089ed0840ef3badfa8cab2277731046b2613dd484; digest sha256:e9372f19e5064cb5470141fef25a3212aa65cede5d44ecfff8c9ed86da83668b | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L72 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row f0856ae991e2b0917c4a5196b903cd7ba8a1b7026397235826c77abbbe1ab939; PO判断は条件付き採択) | docs/helix-os/L2-requirements/governance-requirements.md:1205-1212; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw d01a2bde869d91d91b803ce8ff772225522869c8b328a22d02ddd9bc18c0fb39; semantic sha256:e9372f19e5064cb5470141fef25a3212aa65cede5d44ecfff8c9ed86da83668b | docs/helix-os/L11-acceptance/governance-acceptance.md:821-829; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw 9b0f89f227d824787e3715b287a34ce7aecf5b23a014c873dbd6de581e57e3d4 | LEGACY-ASSET-F172CBC75CAA4FCFC2EB `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requirements.md:31`, SHA `d2df9851fcd3db79ffaed03116f85118da43fe26f943412045215a58cfa3804e`; 11E8FE0479751F02A4A3 requests:17-21, SHA `a428f2de8652b9508456aed358152865a1f96f6978e5d204b1e2dfd3a1d2e1ba` | LEGACY-ASSET-B143CAC2AFF236C80280 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-acceptance.md:17-24`, SHA `14075ae16016c3585947f88d5bc633f1e2022a29fbe7a602d4403dd87c14e047` | pool上限/active stateとdownstream backpressureを再導出する。固定provider数/burst/slotは除外する。旧候補は現authorityでない。 |
| HELIXOS-L2-050 / MPR-RC-HELIXOS-L2-050-003; fixed register row 599 e2b8e73c7e195060c8af05b002d6dc96188db6613f61f05ec0569c1a47415b6f; digest sha256:fab5fdfae9cfd2211f8c2fd6dfad5ce7b065e007ef11ca62f55420baa5033b6d | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L73 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row d8c7710bdc66863227e96b419e9271a73a6dba695cf40fb447a44c102eabf78b; PO判断は条件付き採択) | docs/helix-os/L2-requirements/governance-requirements.md:1213-1220; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw e8a34140ed885ff3ad3c3fee6bbdfe3e5749bed1161cb41db27c02c3e9c65267; semantic sha256:fab5fdfae9cfd2211f8c2fd6dfad5ce7b065e007ef11ca62f55420baa5033b6d | docs/helix-os/L11-acceptance/governance-acceptance.md:830-838; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw fa67b048c413b556d740e618be711aacbc5ff440c2cb97c6afce5d951c48386e | LEGACY-ASSET-F172CBC75CAA4FCFC2EB `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requirements.md:35,37-39`, SHA `d2df9851fcd3db79ffaed03116f85118da43fe26f943412045215a58cfa3804e` | LEGACY-ASSET-B143CAC2AFF236C80280 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-acceptance.md:17-24`, SHA `14075ae16016c3585947f88d5bc633f1e2022a29fbe7a602d4403dd87c14e047` | 原因に応じたreview capacityとduplicate-review否定oracleを再導出する。provider/count閾値は採択しない。 |
| HELIXOS-L2-051 / MPR-RC-HELIXOS-L2-051-002; fixed register row 589 c2f3e29ce0a9cb33c391213f95b99742ac61888ae539d2e8aeda3984305b60bb; digest sha256:54fd39fbeb3786bc739560856afb14e3cf892b1bb717d98ceb1212df09fe7f2b | docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L74 (full c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad, row b9cef971102d6f8ec1f03c1eca2d77fb40b8490b0968a66f535daa78f992f218; PO判断は条件付き採択) | docs/helix-os/L2-requirements/governance-requirements.md:1221-1230; file c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a; raw 97024d3b3c996cc834655aad39e6d40c446c1e33095ce61a654aa566a56e771b; semantic sha256:54fd39fbeb3786bc739560856afb14e3cf892b1bb717d98ceb1212df09fe7f2b | docs/helix-os/L11-acceptance/governance-acceptance.md:839-846; file 40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997; raw bf4943961606b3e7b05f70299c3bebd1b7eb930324e133530331016e689d3fe8 | LEGACY-ASSET-0A53D5BC3F5DCCF3DB8F `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md:65-68` (CNW-R-05), SHA `8217489834e66ad11100b6fb3187be4fe3a91a858f24aa0ea67dff3000adf934` | LEGACY-ASSET-47AB782F19F8A77BB556 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/codex-native-worker-routing-acceptance.md:20,39`, SHA `bf3f93d6383d81d7e6486977988088fe4fca5a3dad014147af14043b755619f6` | role separation/exact-HEADへの返却パターンを再利用し、task単位の条件付き適格性を再導出する。旧provider-to-lane matrix/runtimeは置換する。 |

038の短いsemantic matchはOS L11 671-674のintroのみであり、受入範囲全体ではない。固定OS L11 file SHAは `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`。通常/error本文675-689 raw SHA `937a2727b1628276852f907440cb4a132feb89dcc2baa35449861bc92576556c` とrevision -002 supplement 690-695 raw SHA `c379596a03605b386b8b07ab042e7cb2772af6fb86ad4690545af51a7b653409` も読んだ。後者の「未採択」は当時の文書説明であり、採択判断は `docs/governance/decisions/po-decision-2026-09-29-11candidates.md` full SHA `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5` の行35 (raw line SHA `6957adc3c5651e5012aba7b8797ae0d8b3d8e210f31e857ce1894a1f0ff9d8b8`) およびlines 35–40 (raw span SHA `d1e9f6f6ce3681085252e191023d40ed709973f2b740d28c42554ee8cc11fd59`) による `MPR-RC-HELIXOS-L2-038-002` と `MPR-RC-HARNESS-L2-041-003` の共同採択に従う。HARNESS L2-041-003 source semantic digestは `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`、L11 fixed content revision `e94838f513af2aec207ac1de420db62e2ad98b1a`（file SHA `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7`）の699-715 raw SHA `312d258f447d2de14cd7770440381e15c24fb69a949e6c70c1adc3ab3d90f3c4` / semantic digest `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b`。追加oracle 711-714 raw SHA `155d949e9990d29f30f9e4c893e11af7ec797283f4498f61fab161a19a787654` を入力意味として読み、OS038はfindingを再判定せずoutcomeを処理する。

### 旧source引用行のraw-span SHA-256

各範囲は旧sourceの物理行末を含めて連結したraw bytesをhash。L5/L6は上表に参照ファイル全体のSHAを記した。

| 親 | 旧source path:行 | raw-span SHA-256 |
|---|---|---|
| HELIXOS-L2-032 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:40,69` | `a84f5693b693c56858b30c43f926c0d236e1a6585330cea125de4ecc44ae3829` |
| HELIXOS-L2-032 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:38` | `adf5a27081a02bc2a722896ea636b7a31fef6de7922605d5522162c8d261b6d0` |
| HELIXOS-L2-032 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:49` | `5d323a3f1b60bd81fb524d74ff57ba37a8b5afbb18938cabaf576acc98e3194d` |
| HELIXOS-L2-033 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:44,73` | `d932e9925946e4f6a66e15d669edc75c7fd17cdbf31921bdac0a3391a08e8961` |
| HELIXOS-L2-033 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:42` | `b1c50a2c2dcd0f575c4cb8badace7d5a44072e841dc5729328d04876d8f472d8` |
| HELIXOS-L2-033 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:35-36` | `9ccf3cc4bba0c45f88cbf9dff660947980e8cd9bbc28d8a38618c5cfd0f7cf10` |
| HELIXOS-L2-034 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:39,68` | `885c0fe3f66bef0b7eb7e8c7e0bc6be269f2563874a1c25888374e1948faea84` |
| HELIXOS-L2-034 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:37` | `c752ed0797d3f10712e4b483ef46fa42698a3f1f4feacf69ce14212d5c638b82` |
| HELIXOS-L2-034 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:63` | `09b9a5393cea4155a2cb982b1bd1dedf382edac6b551212358c2cd3909cf4dda` |
| HELIXOS-L2-035 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:37,66` | `78691d7f2d20427f4e5dccc15382790159fcc6e9d311cedd91a14f2f2a362f21` |
| HELIXOS-L2-035 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:35` | `bdf2f1ebaa2b34eac622d911b3b8d4e963816c53fd415deae322e433f81c4c9f` |
| HELIXOS-L2-035 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:31` | `f128869e481fcae0c04042bd981749586da5b61e10eeded90991f4dce7fa6ad9` |
| HELIXOS-L2-036 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:624` | `2014a23fd29156eb5ae7111e25d47a9093d1c3ffda2099f10e6068e3c3f7a2f4` |
| HELIXOS-L2-036 | `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md:30,36-39,86` | `bcea1c4a1f05dba64c278efebbb0d312b8f2774166cf80e600b6c2b9496e86a3` |
| HELIXOS-L2-036 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json:141-155` | `763988cce3576f9421ebf7ce87f0f9a83fcff44c2cc2a1c9abcc898969740b3f` |
| HELIXOS-L2-036 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-universal-reverse-redesign-integration-test-design.md:65` | `93e919bf0691c87d176e3c0b57948a27d43998e71840030ef94beceffee927ae` |
| HELIXOS-L2-036 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-universal-reverse-redesign-unit-test-design.md:57-58` | `06af4389711b02da71f5c097cc0abf63c6b5b3f5d7802f24c1c2637762fd53b8` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/docs/process/modes/refactor.md:21-23` | `1bac193c4e3d580d6ee87cdcf3023c78eb395b2cc3bdb2ca437c17b379e697ca` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/docs/process/modes/refactor.md:43-48` | `bd4c11c24ce467b6fec7e1b52d78dd8aeb2ef2953680e3ff52b3086b34cdb911` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/docs/process/modes/refactor.md:55-68` | `2309d899b99e5e152199fb6169245734b2540f5d5bb243fec725ebe329dd16db` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/docs/process/modes/refactor.md:75-87` | `09c500c924e3fd2b9b5a52f3c52bc68ada7bd7e5735bf0903bcb2eae23e5b8dc` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/docs/process/modes/refactor.md:89-95` | `e0e061dd8280dcaf98824948397eef5cda7d90cf500943f1843e45544c277a5e` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/docs/process/drive-route-system.md:62-66` | `503bc002bac6c30a4187fecdf7d406af238ef20fcc1821ebbdee3448fc3650de` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/docs/process/gates.md:114-115` | `4f31c45986e822d2c13782f19d53535268672802813bc3fa518a03efac05c390` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:623` | `6bf922ca389121ce41ab0ce63c20242adf1f57bdc72f6142d139dc8ab3eb025f` |
| HELIXOS-L2-037 | `archive/legacy-generation-2026-09-14/root/CLAUDE.md:177` | `48d47f89acbd3f31bd7c6ee281dda82e0676fc506aa9afc165e02ad962322a60` |
| HELIXOS-L2-038 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:52,81` | `7850af64efe05c55f68ae28a1a8bdd5f206a27fb5c3d8c87514decc40a9665ae` |
| HELIXOS-L2-038 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:50` | `7b7ba6217ec5ac4543606cad3774d7aca8a0c4eb77c913358db37dc2ccb286f1` |
| HELIXOS-L2-038 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:57` | `a83e352b22d1ff599d3a098a4d62cb668928f5aed696343f514ff1b87bf9f37e` |
| HELIXOS-L2-040 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:240-256` | `1fe7f56a6a9d53064db41500ba7b2d90388ba69490a8fe2efb64a422efcbe393` |
| HELIXOS-L2-040 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-acceptance.md:43` | `870ad165536e0233a5124db170f349386e7355fad08edca2b91795c28cd42b5e` |
| HELIXOS-L2-041 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:34-124,189-390,391-478,495-620,717-856,858-925` | `940262d46bb67abef60ab7d1585cdab1f2f291e77ed456b3dcb5585fc5957466` |
| HELIXOS-L2-041 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:17-55` | `36e097a074fe674fddd2719b6c196163a6aa625908c90f0125ff42a99e2a41da` |
| HELIXOS-L2-041 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/instruction-path-change-resilience-requirements.md:43-52` | `487a8efd257b052e4ebc2b216b57c946907163fe289413fdc8e9ea4b65f182ba` |
| HELIXOS-L2-041 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/instruction-path-change-resilience-acceptance.md:40-43` | `a8415d4ff2bad44fcc7b9af558420e4438f14614ca128f833fed61424e9abc92` |
| HELIXOS-L2-042 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:151` | `45a01b04408fe74cb4a1ccd6ae5b8a3c2c02f03500d57c68c8a372b412a81410` |
| HELIXOS-L2-042 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:59` | `6a822cd9d22357566163dc1e8be15efb85510e1abfcd195bb5ef471361ca564f` |
| HELIXOS-L2-042 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:108` | `12d0996da13ade5ce5c802556cedb98ba5fedb478ca7f15fb8bd131187807127` |
| HELIXOS-L2-042 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:35,57` | `80d2a8ec3bb114ef8df99019dcbc11058b810ba95360956677924e33e1d8a3ec` |
| HELIXOS-L2-043 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:149` | `2a51f5fd235d0b62970b539861de48671b4b186cdd2524085332b479e1ead47a` |
| HELIXOS-L2-043 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:36,55` | `41b9fc3c8786898eae79d19ef6f623970bbc029edc62edf9013d438646ab7330` |
| HELIXOS-L2-043 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:106` | `66b2e42a505e1ad493ba47c57888c5965af9f56563fe928b7ef63c804323bcbc` |
| HELIXOS-L2-044 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:290` | `6fa474edaa613a1ec55664b0087f086df9c02fe08965cc5605059ae733f73b1e` |
| HELIXOS-L2-044 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-merge-admission-requirements.md:29` | `5f0d5a28db52173fc22755e68bd67698666689f3361961473458679d6701e694` |
| HELIXOS-L2-049 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requirements.md:31` | `8eb5e52d8772ac82175cf3faaea7c3ec61db49add1f9f478addf3435e579c65a` |
| HELIXOS-L2-049 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requests.md:17-21` | `4fdeaa0b169eb526de938501871ae37c514b64f9de0aa2d6f22828163de7f195` |
| HELIXOS-L2-049 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-acceptance.md:17-24` | `f2d22da87e55584bc3295c5108282691dd571b827d4f1a551b269cb6bd7f9284` |
| HELIXOS-L2-050 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requirements.md:35,37-39` | `3ae8e70b7be8de1cbef4bca87f57d2b4edd87194dd97d9717a403e727be8128c` |
| HELIXOS-L2-050 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-acceptance.md:17-24` | `f2d22da87e55584bc3295c5108282691dd571b827d4f1a551b269cb6bd7f9284` |
| HELIXOS-L2-051 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md:65-68` | `a93b167c1b115e7b292ebb800e9db4af1adcddb482462fdc39d25fd77a1ca229` |
| HELIXOS-L2-051 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/codex-native-worker-routing-acceptance.md:20,39` | `7a40908348500949e274480fcd63ff601d08c923d4933d34981f6a947cb0b827` |

## Stage 4 — HELIXOS-L2-021/022/024/046/048/052（部分草稿）

この追補は各PO採択済みL2 identityの1.0 target候補をL3設計へ具体化する。L3承認・実装・実行・外部作用の許可は生成しない。`HELIXOS-L2-021`はHARNESS構成のproject別配布、`HELIXOS-L2-014`はHELIX自身の全機構段階稼働であり、別identity・別判定として保つ。

### `FR-OS-L3-021` — `HELIXOS-L2-021`

一つの選択project、要求revision、許可scopeについて、HARNESS構成版のexact component set・source/artifact digest・互換性・適格性と必要安全依存を照合し、配布・更新・復旧の状態、candidate/active版、対象artifact、未完義務、復旧先を追跡する。選択した対象と必要依存だけを扱い、未指定componentを暗黙に含めず、他projectや全製品の完成を待つ条件を加えない。L2-014の段階構成へ配布結果を合算しない。

**責務／依存境界**：OSはproject別operationと状態/evidenceを管理し、HARNESSは7つの該当service契約・artifactと各サービスの適格性evidence、SECURITYは既存operation authority、INFRASTRUCTUREは資源/実環境を所有する。単独成立はOS-L2-015/016/019/020、該当HARNESS契約・artifact、SECURITY authority、INFRASTRUCTURE資源に依存する。source digest、互換性、scope、権限が不明・不一致なら対象operationを止め、管理または提供元へ返す。既存qualified版または明示された復旧先、途中成果、未完義務を保つ。新しいtag、publication、cutoverはこの要件から許可しない。

**受入条件**

- **`AC-OS-L3-021-01` 選択構成と7サービス証拠**：project、要求revision、operation scope、選択component identity/version、source/artifact digest、必要安全依存、active/candidate状態と復旧先を同じoperationへ結ぶ。HARNESSのサービス①〜⑦は各サービスに対応する適格性・配布証拠を個別に照合し、別サービスの証拠で代用しない。明示選択集合だけが対象になる。
- **`AC-OS-L3-021-02` 独立判定・部分導入**：一つの適格project向け構成を配布可能とし、別project/他の全製品の未完了を理由に妨げない。個別service構成成功をHELIX全体段階成立とせず、L2-014とは別状態に置く。
- **`AC-OS-L3-021-03` 不成立と復旧**：7サービスそれぞれについて証拠を一つずつ欠落させた変異、選択後の別artifact切替、component/digest/互換性/authorityの不一致を配布成立扱いしない。部分適用後の中断では途中成果・未完義務・復旧先を保持し、rollback後の再開でも同じ選択・artifact・scopeを照合する。未指定componentの包含、成果消去、scope外operationを許さず、該当ownerへ返す。

### `FR-OS-L3-022` — `HELIXOS-L2-022`

対象revision・適用scopeを持つsource eventと運用evidenceを改善candidateへ結び、LABOの独立評価・提案・比較実験依頼、既存判断ownerの採否、OSのticket化、変更・検証、再観測を因果関係として記録する。OSは登録・振分け・状態保持を行い、効果/退行評価はLABO、要求/設計/authorityの意味判断は既存ownerが行う。L2-012/013の移管済み研究・横断診断をOSの責務として引き受けない。知識取込や自動学習を1.0要件にしない。

**責務／依存境界**：OS-L2-015/016/019、対象正本、source event、scope、判断owner、LABO評価契約、既存ticket契約に依存する。入力にはLABOの独立評価結果、提案、比較実験依頼、判断状態と還流先候補をそれぞれ区別して結ぶ。候補生成・登録件数は採択や効果の証拠ではない。評価範囲、採否、戻し先または再評価条件が不足する場合は未解決のまま保持し、LABOまたは該当判断ownerへ返す。L2-012/013が所有する研究・横断診断の実行や結果解釈をOSへ再割当しない。

**受入条件**

- **`AC-OS-L3-022-01` 還流trace**：同一対象revision/scopeの観測→candidate→LABO評価→既存判断→ticket→変更/検証→再観測の各状態とownerを辿れる。評価結果とOSの登録・routingは別actor/stateである。
- **`AC-OS-L3-022-02` authority非昇格**：観測、登録、LABO提案、ticket変更だけを個別に変えても要求・設計・authorityの意味は変わらない。採択は既存の判断ownerに属し、OSから生成しない。
- **`AC-OS-L3-022-03` unknown/negative保持**：source、対象revision、scope、LABO評価、採否、戻し先または再評価条件を一つずつ欠落/不一致にした場合、候補を未解決に保ち、棄却理由と未完検証義務を消さずownerへ戻す。

### `FR-OS-L3-024` — `HELIXOS-L2-024`

対象projectのHARNESS提供版、運用実績、対象revision、data-use class、許可範囲、LABO評価evidenceを結び、許可されたscopeだけをLABOへ渡す。OS-L2-019/021/022および版付きLABO接続の各revision・適合性を照合し、sourceの結合だけで接続成立としない。評価・feedback後は候補、既存判断、ticket、検証、再観測の状態をOSが接続する。提供完了、LABO評価、要求採否、利用者受入、改善効果を別々に記録する。後続版の学習/推薦機能を前提依存にしない。

**責務／依存境界**：OSは接続と状態、HARNESSは提供版・証拠契約、SECURITYは既存のdata-use/operation authority、LABOは評価と効果判断、要求判断ownerは採否を所有する。L2-019/021/022と版付きLABO接続のそれぞれについて、互換性・欠落・staleを独立に検出する。tenant/customer dataや権限をOSのauthorityへ混ぜず、許可範囲を越えて送らない。許可/data class/scopeが欠落・不一致なら送信と候補採用を保留し、権限ownerまたはLABOへ返す。未評価・未判断・再検証待ちをそのまま保持する。

**受入条件**

- **`AC-OS-L3-024-01` scope付き評価入力**：許可済み正常fixtureではHARNESS版、target revision、運用結果、data-use class、許可scope、LABO評価とfeedbackを追跡し、LABOに渡した記録が許可scope内である。
- **`AC-OS-L3-024-02` ownerとstate分離**：提供、運用観測、LABO評価、OS candidate、既存判断、ticket、再検証のstate/actorを別々に保つ。提供完了だけでは利用者受入や効果成立を作らない。
- **`AC-OS-L3-024-03` dependency・data/permission failure**：L2-019、021、022、版付きLABO接続を一つずつ欠落・非互換・staleにする変異に加え、permissionなし/拒否、data class不明、target revision違い、scope過大、評価範囲不一致を個別に投入し、該当送信/採用を止める。sourceを結合しただけでは接続成立とせず、WEB-OS tenant/job/credential/deploymentを本体OS正本へ混入しない。未評価・未判断・再検証待ちは別状態で保持し、非対象tenant/dataの送信0とする。後続学習/推薦がなくても許可済み1.0観測接続を判定できる。

### `FR-OS-L3-046` — `HELIXOS-L2-046`

選択した一つの作業scopeに対し、既存authority、対象とcontent HEAD/base、scope、ticket/assignment、HARNESSが既存契約で要求する検証と結果をdispatch・実行・Ready・merge admissionの各遷移に束縛する。途中で対象HEAD/base、authority有効性、scopeまたは適用contractが変われば影響する遷移をstale/未完とし、該当する既存判断・検証・admissionを再照合する。新しいapproval/check/skip方法や適用範囲は設けない。

**責務／依存境界**：OSは既存遷移と根拠の連続性を管理し、HARNESSはrequired verification、SECURITYはoperation authority、独立reviewerはexact HEAD review、既存merge admissionは現行運用モデルのownerが担う。`docs/` pathだけの免除、exploration/prototype mergeの実装許可化、既存required verificationのskip、別HEAD/scopeからの証拠流用は認めない。

**受入条件**

- **`AC-OS-L3-046-01` exact transition chain**：有効authority、target/scope/head/base、assignment/ticket、適用HARNESS contractとrequired verificationを固定し、同じ対象scopeに結ばれた遷移だけをReady/merge admission候補として記録する。
- **`AC-OS-L3-046-02` 独立遷移stale**：authority、HEAD、base、scope、適用contractを一つずつ変え、影響する次遷移だけをstale/未完に戻す。旧HEAD review/verification、失効authority、別scopeの結果は流用しない。
- **`AC-OS-L3-046-03` 除外迂回拒否**：docs path、prototype、未実施required verification、同じticketでの別HEAD結果を各独立変異として投入する。既存契約上必要な確認を省かず、適用契約が別scopeに独立許可する遷移は一律停止しない。

### `FR-OS-L3-048` — `HELIXOS-L2-048`

ticket返却、検証不能、oracle/input不足のfindingを、finding identity、ticket/assignment、target HEAD/revision/scope、根拠・不足条件、発生元、既存resolution条件へ結び、既存L2-007 lifecycleでpending/evidence-backed resolutionを保つ。OSはintake/routing/statusとticket運転、LABOはfindingの理由分類・scope・counterexample・再評価条件を含む評価、INTELLIGENCEはLABO評価済みでtask scopeが適合する場合の次回配置案、HARNESSはoracle/verification義務を所有する。OSだけが再発行/割当を決め、再発行後のresultを元findingへ因果relationで結び、LABOが同一条件での成立状況を評価する。閉じたticketは保持し、後日findingを因果relation付き追補assessmentとして扱う。

**責務／依存境界**：OSは新しいevent schema、status、resolution十分条件、priorityまたはapprovalを作らない。LABO評価やINTELLIGENCE案からticket/assignmentを発行しない。自由文handover、同じpathまたは時間的近さだけでresolution/因果関係を断定せず、ownerに既存条件を照合させる。

**受入条件**

- **`AC-OS-L3-048-01` finding traceと評価受渡し**：ticket返却findingとoracle不足findingの両方で対象revision/scope、ticket/assignment、発生元、理由、不足入力、既存resolution条件が保持される。LABOの分類、適用scope、counterexample、再評価条件を含む評価結果が届き、かつtask scopeが合う場合だけINTELLIGENCEは次回配置案を返せる。OSはその案を自動実行しない。
- **`AC-OS-L3-048-02` pending/resolution境界**：自由文だけ、未評価、未ack、evidence不足、別scope/revision、比較不能ではpendingを維持する。観測window未満、未追跡、打切りはdefect 0としない。既存L2-007 resolution条件を満たすcurrent evidenceがある場合だけresolvedとし、LABO/INTELLIGENCE/OSのowner境界を維持する。
- **`AC-OS-L3-048-03` 再発行後評価・後日finding**：LABO評価済みでtask scope適合のfixtureではINTELLIGENCE配置案をOSが判断し、OSが元findingへの因果relation付きticket/assignmentを再発行する。再発行resultをLABOが同じ条件で評価し、未評価・不一致なら未解決を保つ。既に閉じたticketへの後日findingはclosureを保持して追補assessmentとし、source/scope/因果関係がunknown/staleなら該当ownerへ返す。

### `FR-OS-L3-052` — `HELIXOS-L2-052`

明示mergeとread-after後に、PR assignmentが所有し、他assignmentが使用せず、未完作業のないlocal worktree/branchだけをcleanupし、対象・結果・未完義務を記録する。後続PRはcontent HEADを書換えずに最新baseとのtrial merge可能性、`scfctl stale`、依存とreview bindingを再照合する。最新baseを再確認したうえでconflict、stale、依存変化またはreview binding不一致が残る場合だけ根拠を付けて作成側へ返し、修正後HEADへ独立reviewを取り直す。baseが変化してもpairが一致しstale=0かつ依存が維持されれば既存stateを保つ。Remote refの削除は既存の対象・作用を含む明示authorityがある場合に限る。

**責務／依存境界**：OSはassignment/cleanup/rechainの記録、作成側は自身のbranch修正、review/merge側は独立照合を担う。merge/cleanupからticket完了、Issue close、review成功、要求完了を生成しない。branch自動rebaseやremote削除はこの要件から許可しない。

**受入条件**

- **`AC-OS-L3-052-01` local cleanup適格性**：PR-A merge/read-after後にassignment所有、未使用、未完作業なしのlocal worktree/branchだけをcleanupし、同一cleanup再実行でも他assignmentの資源を変更しない。remote refは対象・削除作用を含むauthorityがなければ残す。
- **`AC-OS-L3-052-02` 後続PR再照合**：PR-A merge後にPR-Bのtrial merge、最新base、stale、dependency、review bindingをcontent HEAD不変のまま再照合する。一致しstale=0なら既存review bindingを保つ。
- **`AC-OS-L3-052-03` 作成側への返却と再review**：最新base再照合後もconflict/stale/依存変化/review binding不一致がある場合は、merge/review側が作成branchを修正せず差分と根拠を作成側へ返す。baseだけが変化してもpair一致・stale=0・依存維持なら既存stateを保持する。作成側がHEADを変えた後は新HEADの独立reviewを取り直し、旧reviewを流用しない。

## Stage 4 親・旧source crosswalk（項目ごとの再利用／再導出／置換）

親L2の採択はこのL3草稿を承認しない。固定本文は`docs/helix-os/L2-requirements/governance-requirements.md`（全文SHA-256 `97f9158bea0d5c39821bb6538887b909d04687798c8e836d151681ebb06f9bf7`）、L11は`docs/helix-os/L11-acceptance/governance-acceptance.md`（全文SHA-256 `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`）。L2のraw span SHAはline rangeに対応する物理行連結hash、L11も同じ規則である。

| identity / parent registration | PO・register / L2固定span | L11固定span | 旧sourceとitem単位の扱い |
|---|---|---|---|
| `HELIXOS-L2-021` / `MPR-RC-HELIXOS-L2-021-002` | PO採択 identity set `helix-os-requirements-po-decision-2026-09-28.md:48` (file SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`); register `#L61`, row SHA `d882097a528a2c870703ed189f991a0bc3385d1d8e656e5e36fd0908b1c0efbc`; semantic digest `0656171a926f67d47263a53cdd012b64112c6143399ab5cb4ac35d00e804dc81`; L2 `governance-requirements.md:702-711`, raw `c218690d2796bb4c91348c12c1d7ca5eab45004447c05f8dcdf3fd30ae735d2a` | L11 `governance-acceptance.md:366-371`, raw `21ab8d8199d2f8e1d9999a30d6502d6aa8d7dc3017fe394a3d090d4baf7a6462` | FRS candidate assets: `LEGACY-ASSET-B75E46DBE77592351574` requirements `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:FRS-R-04..09` SHA `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17`; `LEGACY-ASSET-201EED9C5D6D2FF4D41B` requests `.../functional-release-slice-requests.md:FRS-BR-001..009` SHA `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20`; `LEGACY-ASSET-67ADFAB856D954B3C5D2` acceptance `.../functional-release-slice-acceptance.md` SHA `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee`. Re-derive functional unit/exact inclusion, independent maturity, rollback and safety closure under this parent. Replace old Slice/Module/Bundle/channel implementation, fixed counts, promotion/runtime/schema. These are historical candidate assets, not current authority. |
| `HELIXOS-L2-022` / `MPR-RC-HELIXOS-L2-022-001` | PO adoption same record `:48`, same file SHA above; register `#L56`, row SHA `3fcf774d9998f12e767755c16dd030aa0f35b0adf4a6ae5575f076e82aacf291`; semantic digest `0420ffc076b080ceba91b3344d149d1316c745bf36c2ea3a97e2cc07f9359aea`; L2 `:712-721`, raw `d78f600f299dfd4b9f35f7b2107d9aa076819cde6668274301c309a9e7e4b190` | L11 `:373-378`, raw `844a21ece8560bc7fd0cad5b1982d96027847ac07a44518a85e5eab29539c7a8` | `LEGACY-ASSET-02D897E62EF2FA267267` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:UIL-FR-004/005, UIL-R-07..10` SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`; paired `LEGACY-ASSET-0B5B38F146D9538C9A36` `.../universal-improvement-loop-acceptance.md:UIL-AC-011/012/013/015/016` SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`. Reuse event→candidate/route/outcome separation and evidence-based before/after comparison; re-derive owner separation, current ticket/decision path, and 1.0 observation-only boundary from adopted L2/L11. Replace old routes, terminal schema, stores, thresholds and runtime. |
| `HELIXOS-L2-024` / `MPR-RC-HELIXOS-L2-024-001` | PO adoption same record `:48`, file SHA above; register `#L58`, row SHA `5dfc77149345928a65538d286ea64a0d34da28bec659f9dc7c8981852c193f7b`; semantic digest `b84651c09401e2d58c50652d2e74942cbe3f485ec949d79a42255a947b075dcb`; L2 `:732-741`, raw `c95ed2214e72795a30ee2acaa3dd96bc77ccc41b66df4b3d44f83212ebaba780` | L11 `:387-392`, raw `7e4f145d506c50084fcaa993a255e4dc098b4055c477f0917c1d0bccfea03e54` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:HR-FR-P4-03` SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; `LEGACY-ASSET-44DD86E3DEC09E65EF51` paired `.../L3-pillar-acceptance-test-design.md:HAC-P4-03a/b, HAT-P4-03` SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`. Reuse metric-event→candidate and traceable test/review/regression inputs only. Re-derive permissioned HARNESS→LABO→OS flow and owner separation. Replace legacy threshold, collector, DB, and backlog implementation. |
| `HELIXOS-L2-046` / `MPR-RC-HELIXOS-L2-046-001` | PO `po-decision-2026-09-29-57candidates.md:69` (file SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`); register `#L568`, row SHA `f43ddcf18a0a0450c522d717bef23854e72f186f9de22a73a7f7303e9c970c17`; digest `c86aa6e0ad81c6a37770c084af6b312ef874f2fdf7fd342796fe94fcf588d44d`; L2 `:1177-1184`, raw `65ebd519831b293afacb839c4d632107614352ad0169c38fc2bdfb8e289f85fe` | L11 `:794-800`, raw `3cc2589095ed3c6a9431fc0fb286daddd423d4a5c7d0c2b46cab3a455f6efdc0` | `LEGACY-ASSET-F38874B2497742797010` RFA requirements `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-requirements.md:RFA-GH-02` SHA `97e1e5341beb48e735aacab3b3957b0707fa6aef2e70d0af8c0051607082e155`; `LEGACY-ASSET-00C7DF9250F8A9A25B24` `.../requirement-formation-scoped-admission-acceptance.md:RFA-AC-16` SHA `c3f62478904e620eced270996360274e2840f9d94eca117d838d0e6dfeda7a86`. The adopted parent explicitly limits this legacy starting point to one AC row. Reuse authority/HEAD/scope continuity and stale invalidation; re-derive exact transitions under current owners. Do not claim RFA candidate-wide source closure or import its engine/schema/runtime. |
| `HELIXOS-L2-048` / `MPR-RC-HELIXOS-L2-048-001` | PO `po-decision-2026-09-29-57candidates.md:71`, file SHA above; register `#L576`, row SHA `0803434e70e90f5bcb8272a76daecef3509d2c1b2bc344fe3128f73577f6f494`; digest `0cbd66b870d6b45f739c6759ed2b325d65e69cfbf3e72b6b5638f1e530c77622`; L2 `:1195-1204`, raw `5a3bfe0f5152ef8550ffd7933d33e0cf030d4a4f6f89bf64470a45e55db3da15` | L11 `:812-819`, raw `543007c8f43b3372dee673dc94fdaceb3ca3d2a291dc9cbb674acac68369054d` | `LEGACY-ASSET-02D897E62EF2FA267267` UIL requirements SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4:UIL-R-09/10`; paired `LEGACY-ASSET-0B5B38F146D9538C9A36` UIL acceptance SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943:UIL-AC-015/016`. Re-derive pending/resolution evidence and outcome distinction under L2-007 and the adopted parent; old lifecycle storage/schema/threshold is not reused. |
| `HELIXOS-L2-052` / `MPR-RC-HELIXOS-L2-052-001` | PO `po-decision-2026-09-29-57candidates.md:75`, file SHA above; register `#L590`, row SHA `c823d5d6d5c292d99a125507cc497639d7a53e77bc6ed338b25734a5ffdb8be7`; digest `d9e839c319c54f826bb065ce065ca5a8af126a11abd8f15c9f3183964a4e5345`; L2 `:1231-1241`, raw `342aee2bec0e5f89f34e969d78f7dbfc70510c98afc62ec340f861a042a66e60` | L11 `:847-854`, raw `70b5bb6bd967cfc15e85221ed6c1b842fb6fc92318b735867661223bf64ac1e2` | `LEGACY-ASSET-23D3D9769B093AFDCC25` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:MIC-R-02/06` SHA `f840e16cab80b88fa4e4730ed49f47f0afeee2050cad309a3d87da4cce057ec6`; paired `LEGACY-ASSET-8F1DD8A985CF85749507` `.../management-integration-cell-acceptance.md:MIC-AC-009` SHA `fc9c2312019d59554d921c808b36c2a8f4422ceab89dd8af918c08d5dc04b34c`. Reuse post-merge base drift recheck and old-review non-reuse; re-derive local ownership/no-other-assignment cleanup and remote-delete authority from current parent. Replace TL/cell, CI/DB receipt, old branch/runtime and deletion setting. |

All legacy sources above are historical/candidate material, not current authority or executable inputs. Crosswalk classification is: reuse the narrow semantic atom named in each row; re-derive the current input/output/failure/owner boundary from the exact adopted L2/L11; replace legacy identifiers, runtime, schemas, stores, fixed quotas and mechanisms. Legacy test-designs were read as failure/oracle/consumer evidence only and were not executed.

### 旧source cited raw-span SHA-256

以下raw spanは指定旧sourceの物理行末を含めて連結した値である。各行の全文SHAは直上crosswalkのasset記録に示した。

| 親 | 旧source path:行 | raw-span SHA-256 |
|---|---|---|
| HELIXOS-L2-021 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:79-113` (FRS-R-04..09) | `1cdf090d924256276cdf28d36d7f86d5642390113e88a00f5e10efb637b5b9ed` |
| HELIXOS-L2-021 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23-67` (FRS-BR-001..009) | `0b640473d25bde7bab525a6c9f0f7b924ac94f54dfb828d44bd176a9beee31d3` |
| HELIXOS-L2-021 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:37-59` (FRS-AC-004..026) | `9dab65068400b56f92e8eb520c8f37ec7109b903d8ad25ba0e63aef22f2f8c83` |
| HELIXOS-L2-021 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:73-81` (FRS-BR crosswalk) | `bf60afeb8833ef3f2d39dc7fd80164ee021891e226283d4b6465e589a4eb8176` |
| HELIXOS-L2-022 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:143-173` (UIL-FR-004/005, UIL-R-07..10) | `0e65ae2ae41467056eacce3195c0c90e0f6cd3053a6415337a834ace3180b0ba` |
| HELIXOS-L2-022 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md:30-35` (UIL-AC-011..016) | `0e71f546a421b422d4cb57e0763ca7cf2f22e1c7c8a9531921e7c1526abc62dc` |
| HELIXOS-L2-024 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:156` (HR-FR-P4-03) | `4a7737c780e947b6ff610991e869d911fc8b94fcd194ca60ec178f329ea0440e` |
| HELIXOS-L2-024 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:241-242` (HAC-P4-03a/b) | `72b88fc61471d54ac3521d3aacf94f3049c8a0a637a6c39e8099d94c4336907e` |
| HELIXOS-L2-024 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:113` (HAT-P4-03) | `77766668d6b969d425beb6ab1e1e4d1cfb280fdee25fcff26e0c89b53ea6eb60` |
| HELIXOS-L2-046 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-requirements.md:36` (RFA-GH-02) | `4ec22fe256a2d53b517f985e9d525c2e4abe504abb19f45a096688d30e3762cc` |
| HELIXOS-L2-046 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md:37` (RFA-AC-16 only) | `d37a71b4bc0995e9a8a7ae8c2543c216243ce01610ad0d78b122bbf43db9923b` |
| HELIXOS-L2-048 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:162-173` (UIL-FR-005 / UIL-R-09/10 subset) | `ec0115ce97ff15d61cb3ae3e08ad107318bb78e0f00894de9f034f8d9b6d840a` |
| HELIXOS-L2-048 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md:34-35` (UIL-AC-015/016) | `5173dff1bd9c105b27f39b3377d0ac35cebd50f6574480be87320cd07a0be0e2` |
| HELIXOS-L2-052 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:62-67` (MIC-R-02) | `3962e5a42fd9c578ccd1c56cda1b88ad01f0c3924172db2a246c4f62da252ecd` |
| HELIXOS-L2-052 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:102-106` (MIC-R-06) | `9508c4439c191599853307e0096d8ec21eabbe3dd98abed165be38d61531e222` |
| HELIXOS-L2-052 | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/management-integration-cell-acceptance.md:34` (MIC-AC-009) | `b0040719be4359264a00498413484fce9263752804206ee0fc601447c4730010` |

## Stage 5: HELIXOS-L2-025/026 機能要件（部分草稿）

### `FR-OS-L3-025` — `HELIXOS-L2-025`

HELIX-OS自身と性質の異なる複数projectを対象に、採択済み要求revision、HARNESS構成版、L2-015〜024の対象identity/revision/state/evidence、既存の人判断と停止条件を一つの構成体traceへ結ぶ。要求authorityからticket、Worker、検収、提供・運用、LABO評価、OSへの還流までを追跡し、単体unit、選択されたconnection、構成体固有の端から端受入を独立したidentityと状態で示す。

**責務／適用境界**：OSは既存契約とowner evidenceを束ねて統合状態・不足・戻し先を示す。各対象ownerは自分のunit/connection/resultを、HARNESSは工程・検証義務、LABOは評価、SECURITY/INFRASTRUCTUREは適用するauthority/資源条件を保持する。単体・connectionの成立は構成体passを自動生成しない。

**受入条件**

- **`AC-OS-L3-025-01` 入力とtrace結束**：対象identity/revision、選択HARNESS構成版、L2-015〜024の該当state/evidence、人の判断・停止条件を同じscopeへ束ねる。authority/source/owner/revisionの欠落・stale・不一致はunknownとして残す。
- **`AC-OS-L3-025-02` 単体・接続・構成体の別判定**：HARNESSが提供する7製品の各unitを個別に照合し、選択構成のconnectionとOS構成体固有の端から端受入を別々に記録する。7 unitの全完成を個別の初期配布・単体成立の前提にしない一方、1.0全体到達を評価するfixtureでは7 unit、選択connection、構成体固有受入をすべて確認する。
- **`AC-OS-L3-025-03` 複数projectの因果trace**：異なる複数projectについて、要求/authority→ticket/Worker→検収→提供/運用→LABO評価→OS還流をowner証拠でたどる。event数・文書数や単体greenだけからendpoint間の欠落を補完しない。
- **`AC-OS-L3-025-04` unknown・未完・版境界**：未完、unknown、stale、未許可、人判断待ちを隠さず、欠けたunit/connection/sourceへ戻し未完義務を保持する。2.0/3.0/4.0/5.0の機能を1.0前提にせず、L1-011/012のLABO移管をOSへ戻さない。

### `FR-OS-L3-026` — `HELIXOS-L2-026`

目的・仕事範囲・許容された人の分担と候補pack境界を入力として、対象要求identity/revisionとauthority、packごとの入力/出力・契約版・所有・依存・安全条件・互換・検証範囲、環境/権限、更新/復旧条件、比較基準を同一対象へ束縛し、段階構成候補と不足を導出する。候補から採択済み要求、依存充足、実構成成立を推定しない。

**責務／適用境界**：OSは導出能力と不足・戻し先を返す。HARNESSはpack/受入契約、各機構は自身の能力と依存、SECURITYは安全条件、INFRASTRUCTUREは資源/復旧、人は親契約で割り当てられた工程を所有する。出力構成の実行・復旧・運用受入はOS-L2-014の別判定である。

**受入条件**

- **`AC-OS-L3-026-01` 入力の同一revision結束**：目的/scope、要求authority/revision、候補pack境界、各候補の契約版/owner/依存/安全条件/検証・互換範囲、人の工程、環境/権限、更新/復旧条件、比較基準を固定し、導出結果から各入力まで逆引きできる。
- **`AC-OS-L3-026-02` 依存・安全閉包と不足**：同一revisionで必要要求・契約・安全依存が閉じた非空集合だけを成立候補として示す。空集合、安全依存省略、境界/所有/版未決packの仮分割を成立扱いせず、欠落/conflict/stale/unknown/互換性不明は不足と戻し先に残す。必要な人の工程も暗黙に外さない。
- **`AC-OS-L3-026-03` 代替比較と最小性の主張範囲**：目的・scope・許容分担・候補空間・適格性・比較基準を固定して成立する代替を比較する。各packを一つずつ除く試験だけから全候補空間の最小性を断定しない。探索範囲の根拠または代替比較が不足する場合は「最小候補／未立証」とし、既に確認した依存閉包とは別の結果にする。
- **`AC-OS-L3-026-04` 状態と版の分離**：候補導出、個別要求採択、段階構成の受入、実装、tag/外部配布を別状態に保つ。候補ID/存在のみで採択・実装許可・段階成立を作らず、後続版機能を前段階の前提にしない。
- **`AC-OS-L3-026-05` traceと実行依存の循環分離**：要求間のsource-trace循環と、起動・更新・復旧に必要な実行前提の循環を別に判定する。traceだけの循環を実行blockedと断定せず、実行が自己依存・未release tree・後続/稼働中の別段階に依存する場合は成立扱いしない。

**旧HELIXとの対応**：Functional Release Slice候補にあった機能単位・依存閉包・明示的収載/除外・unknown fail-close・構成体受入の意味を再導出する。Slice/Module/Bundle/channel名、固定個数、schema、runtime、CLI、CI、公開/配布gateは現行identityや運転へ移植しない。現行の入力境界と段階候補の役割は採択済みOS-L2-026およびHARNESS-L2-010/011/022へ合わせる。

### Stage 5 対応する旧source（全fileの物理行・LF込みSHA-256）

| 親 | 分類と保持/再導出点 | 旧asset・source path:lines | source SHA-256 = 全行raw-span SHA-256 |
|---|---|---|---|
| 025/026 | 再利用する意味起点：独立機能単位、明示収載/除外、依存と安全閉包、unknownを成功扱いしない、構成体受入。旧channel/schema/具体runtimeは置換。 | `LEGACY-ASSET-B75E46DBE77592351574` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:1-224` | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` |
| 025/026 | 利用者側の要求範囲：機能独立昇格、明示的収載/除外、成熟度分離、追跡、rollback、安全閉包、組合せ受入。新しいrelease channelは再利用しない。 | `LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:1-82` | `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` |
| 025/026 | paired acceptanceの正常/反例・全体と単体分離の形を再導出。旧acceptance IDsや旧runtime testは現L10へ同一視しない。 | `LEGACY-ASSET-67ADFAB856D954B3C5D2` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:1-83` | `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` |



### 025/026 旧source atomごとの対応判断

| 現行親 | 旧atom・旧受入 | 処置 | 今回保持／再導出する意味と境界 |
|---|---|---|---|
| HELIXOS-L2-025 | FRS-BR-001/004/007/009、FRS-R-08/09/12/13/14/19/20/24、FRS-AC-019/021/022/025/026 | 意味を再導出 | 個別機能、connection、compositeを別々に測り、複数projectのauthorityから運用・評価還流までをowner evidenceで追う。旧 slice/channel単位・固定release gateは継承せず、親L2の7 HARNESS unit/selected connection/composite条件へ合わせる。 |
| HELIXOS-L2-025 | FRS-FR-001..006のSlice/Module/Bundle schema、channel順、preview/rc/stable promotion、旧CI/consumer/DB replay、各旧runtime行為 | 置換／不採用 | 現行OS構成体にそのまま対応する責務・identityではない。各現行ownerと親L2のstate/evidenceを束ねるtraceへ置換し、実運転・配布・releaseを作らない。 |
| HELIXOS-L2-026 | FRS-BR-001/002/005、FRS-R-02/06/08/14/20/23、FRS-AC-002/006/008/014/022/025 | 意味を再利用 | exact source/revision、明示収載/除外、依存・安全閉包、unknown/staleを成功扱いしない境界を再利用。pack候補を要求authorityや実機能の採択と同一視しない。 |
| HELIXOS-L2-026 | FRS-R-19/20/24、FRS-AC-021/022/026 | 一部再導出 | 要求と依存に基づく構成/順序とcompositeの別判定を起点にする。現行固定親に沿って有限candidate alternativesと探索範囲を示し、全体最小性は比較空間が不明なら未立証とする。旧9群/17系統・Slice数は使わない。 |
| 025/026 L10 | FRS-AC-001..026の正常/否定fixture設計 | oracle構造を再利用、条件は再導出 | 入力に対する独立positive/negative判定の形を使い、case内容を現行L2/L11へ再束縛。旧runtime、旧CLI/CI、green/実行済みacceptanceは実行せず、結果証拠として使わない。 |

### Stage 5 固定親とPO採択revision（current file/physical-span pins）

| 親 | L2 fixed source | L2 raw-span SHA-256 | L11 fixed source | L11 raw-span SHA-256 | PO採択registration / decision source / semantic digest |
|---|---|---|---|---|---|
| `HELIXOS-L2-025` | `docs/helix-os/L2-requirements/governance-requirements.md:742-751` (whole file SHA-256 `97f9158bea0d5c39821bb6538887b909d04687798c8e836d151681ebb06f9bf7`) | `b7166f6399db9a0f1d3a9db76977ec4ec0f1e7f708503ccc42beea0ec97121e1` | `docs/helix-os/L11-acceptance/governance-acceptance.md:394-400` (whole file SHA-256 `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`) | `d21d7708fe09cbee17d37ad66444d99631f16e2c8198924da9b608a1117eda18` | `MPR-RC-HELIXOS-L2-025-001`; `helix-os-requirements-po-decision-2026-09-28.md:48`; adopted, version_class 1.0; candidate semantic digest `sha256:b59cfc3d4801d71391c528214f2de573494b257f0783841141982963cf43ff8c` |
| `HELIXOS-L2-026` | `docs/helix-os/L2-requirements/governance-requirements.md:807-823` | `5bb2dd228c7560908edb8253a0d3fdab0952d65d2b862332efe2276ccfd931d9` | `docs/helix-os/L11-acceptance/governance-acceptance.md:430-441` | `6f68d49c377871a5991e317b0b43af81b9dd69967cfcb4398662999fc56cb2c0` | `MPR-RC-HELIXOS-L2-026-003`; `helix-os-requirements-po-decision-2026-09-28.md:48`; adopted, version_class 1.0; candidate semantic digest `sha256:e52cc56d219b6aa77e037985b55ff5b21aff2be2a6f5ea497f84cffb3f679374` |

## Stage 5 続き：HELIXOS-L2-031/047 機能要件（部分草稿）

### `FR-OS-L3-031` — `HELIXOS-L2-031`

対象ticket、source/base HEAD、HARNESS required verification obligationsのexact setとdigest、選択/非選択集合、CI profile、runner/OS/environment/toolchain/platform/lockfile/artifact locality、resource budget・exclusive state、cache・queue・variance・flake、時刻・exit/output digest・区間durationを同じrunへ束ね、正しさと性能の状態を別々に記録する。性能値は母集団・期間・除外理由・環境と共に集計し、標本不足や欠測を達成/0へ補完しない。性能予算を超えた場合は、同じepisodeと最初のterminal receiptへ結ぶ回収候補を既存OS ticket経路へ返す。回収は修正、独立review、同条件での再検証、改善前後のp50/p95、安全指標と非縮退の証拠が揃うまで未完として扱う。

**責務／適用境界**：OSは既存ticket駆動検証運転・観測のbinding・stop/cancel・回収候補を所有する。HARNESSはrequired obligations/oracleと検証範囲を、SECURITY/INFRASTRUCTUREは適用するauthority/resourceを、LABOはすり抜けたfailureの独立評価を所有する。OSはHARNESS義務を減らさず、性能receiptからmerge/acceptanceや検証契約変更を生成しない。

**受入条件**

- **`AC-OS-L3-031-01` runと測定の結束**：同じtarget ticket/source/base HEAD、required obligation set/digest、profile、runner/environment/toolchain/platform/lockfile/artifact、cache、queue/resource、開始終了時刻、exit/output、各区間時間を照合する。内部runとGitHub Actions等外部runは別environment/receiptで集計する。
- **`AC-OS-L3-031-02` 正しさと性能の分離**：同じrunでrequired obligation/oracleが不変かつ正しさ成立、性能予算だけ超過したcaseは、correctness evidenceを保ってperformance-unmetと回収候補を返す。correctness passからperformance pass、性能超過からcorrectness failureを捏造しない。
- **`AC-OS-L3-031-03` 義務非縮退と回収trace**：最適化は義務を保ったまま順序/並列度/runner/artifact reuseのみを扱い、延期義務をorigin ticket/HEAD/obligation ID/first terminal receiptにexactly onceで結ぶ。要求対象の未完義務は後続ticketへ渡し、修正・独立review・同条件再検証・改善前後p50/p95・安全指標/非縮退証拠が揃うまで回収未完とする。夜間の一律Full回収を開始条件・fallback・回復根拠にしない。
- **`AC-OS-L3-031-04` 安全な停止・未評価**：cost/quota/telemetryが不明・staleなら既存の安全な既定DAGを選べる場合だけfallbackし、既定計画も不明ならholdする。未開始job cancelは未実行義務をsuccessにせず、terminal receiptとoriginの追跡を保つ。escaped defect、mutation detection、flake、deferred expiry等安全測定を時間短縮で隠さない。

- **`AC-OS-L3-031-05` 並列実行とfailure因果trace**：stateful資源を使う並列caseでlease/fenceを外し、またartifact HEAD/lockfile/toolchain/platform/digest/localityの各fieldを一つずつ変え、さらに後段failureからorigin selector/edge/first oracleへの因果traceを欠落させる。いずれも成立扱いせず、該当義務をholdする。

### `FR-OS-L3-047` — `HELIXOS-L2-047`

受け手からの返却を、固定されたrecipient、元ticket identity/meaning revision、元assignment、返却理由・対象条件・根拠source/revision/scopeを持つ独立した返却evidenceとして受け取り、OSが既存のtyped lineage/relationで元ticketへ因果結合する。受け手は元ticket本文を直接変えない。OSは返却evidenceを保持し、返却に対処するためticketの意味/契約を変える場合に限り、元revisionを保持したまま新ticket revisionを再発行する。既存契約が明示適格化しない限り、旧assignment、attempt/result、authorityは新revisionへ継承しない。

**責務／参照境界**：OSだけが発行・再発行する。Ticketは作業指示であり、他Ticket/artifactへの参照を中に持たず、要求・design・code等artifactもTicketを要求根拠/実装部品として参照しない。根拠は要求・設計・契約の正本へ辿る。新field/schema/relationやgraphを追加しない。provider、actor、model、session、branch/worktree、lease、priority、progress、measurementのみの差は意味revisionを変えず、意味/scopeの変更は既存authority/Backflowへ戻す。

**受入条件**

- **`AC-OS-L3-047-01` 理由付き返却と元revision保持**：返却元はticket本文を編集せず、元ticket/revision/assignmentとの関係、返却理由、対象条件、根拠source/revision/scope、未完義務を返す。OSは元bytes/digestを保持し、evidenceのmissing/stale/wrong-scopeを未完へ戻す。
- **`AC-OS-L3-047-02` 意味revisionと運用属性の区分**：返却evidenceを追記するだけならticket meaning revisionを変えない。返却に対処してticket意味/契約を変更する場合に限り、既存規則に従う新ticket revisionとtyped lineageを作る。provider/actor/model/session/branch/worktree/lease/priority/progress/measurementだけが変わる対照ではTicket meaning revision/digestを変えない。
- **`AC-OS-L3-047-03` authority非継承と既存関係のみ**：新revisionは旧assignment/result/authorityを明示的適格化なしに再利用しない。欠落/方向違い/staleの既存typed relationは未完としてOSへ返し、新しいschema/relation型やTicket内参照で修復しない。
- **`AC-OS-L3-047-04` Ticket非参照境界**：Ticket本文に他Ticket/artifact refを埋め込まず、成果物からTicketを唯一の根拠・部品として参照しない。要求・設計・契約の正本を根拠として示し、Issue/PR projectionの編集/close/mergeから意味変更や再発行を生成しない。

### Stage 5 旧sourceの対応（031/047）

| 親 | 旧asset・source path:行 | 分類と対応 |
|---|---|---|
| 031 | `LEGACY-ASSET-79B70809D0A1EE2D5392` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-ci-performance-requirements.md:1-35`; full/raw SHA-256 `7a9b3534671516be8810e40a8c96119e885eb431a4753518b56fe2479b9263d1` | GH-NFR-009/010/011とGH-AC-017/018を読み、実測・正しさ/性能分離・non-degradationを意味起点として再導出。GH-NFR-009 60秒/010 3分は旧environment/検証setの比較候補で、現行ticketの合否閾値へ自動継承しない。 |
| 031 | `LEGACY-ASSET-58CBC57F44DFDD288961` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md:52-65`; full SHA-256 `52af19a483d6222f31d1d52031482fc60c62c504fe97496687d8175aa7a53756`, raw-span SHA-256 `1dddbe5d66439c470c22567d4785cf76dcd6ea44620dbcbc79eab9c50e3998ae` | GH-FR-025のimpact選択、main合流直後Full/nightly回収、同一episodeのRecoveryを歴史的要求として記録する。9/26判断による回収owner/時点の変更を後続paragraphに明示し、旧動作を現行仕様へ復活させない。 |
| 031 | `LEGACY-ASSET-8B7FCC6ED4A9FDDFDEB5` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/github-ci-performance-system-test-design.md:1-28`; full/raw SHA-256 `8014f6ceab95bcfe3bdb717f2d813de12fa09d8dee492ec221a8800ed799a232` | GH-T-017/018から同一run instrumentation、環境/receipt分離、個別non-degradation mutation、正しさ不変の超過caseを再導出。旧schedule/nightly testを現行動作へ移植しない。 |
| 031 | `LEGACY-ASSET-DA012A9B04D5BE9419CE` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md:1-25,94-123`; full SHA-256 `65400847881f1a72b273f0bdeff503a5ea302705cd0e71d7913fc7d0f8dd18fb`; raw-span SHA-256 metadata `1-25` `660d415c19549c1d20c49f33ef2293f4684835c5a67b01744985568b008658f5`, requirement `94-123` `c1eb5c44f6267aea52c835c22ec26ef625fb2b5be5bccacc9b20dc4ec7f0f009` | CIS-R-10..15よりrequired obligation不変、resource/artifact binding、safe fallback、bounded cancel、origin receipt回収、failure backprop、安全測定を再利用。旧全件/nightly回収運転は後述のPO差分で置換。 |
| 031 | `LEGACY-ASSET-8DE0535125B1E39C6FEA` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ci-system-synthesis-acceptance.md:34-40`; full SHA-256 `f5dcd1910a4eef57c66e1c2c03fffe20e5c681ed9e9d043b9e8f15a211e65d9b`, raw-span SHA-256 `c3d4104955a0351d272ca7441af4fda675b86c24e171e3d9171b3f176f49e468` | CIS-AC-010..015のrequired-item omission、artifact mismatch、fallback/cancel、exactly-once、backprop、non-degradation negative oracleの構造を再導出。test本文の実行/旧CI greenを証拠にしない。 |
| 047 | `LEGACY-ASSET-3A15E5645D2D2A59DFF5` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:101-109,190-214,222-230`; full SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; raw-span SHA-256: `101-109` `f08b6accb0d1c5f8d69ed82d347fbb0c831fbcc64cfbddc3187d720ad2ed3f2d`, `190-214` `613be742c6d0025f7d365cab68b30df14a6619764f9e5ddc2e86fcae4e507620`, `222-230` `8263fd69207d9c0f47c126bb3cb9b244a942e0d1a1500c07d8b6a8a71da3ec65` | Ticket immutable/revisioned、meaningとexecution attrs分離、provider/priority-only changeで改版しない、scope/recovery meaning changesにrevision/typed lineageを使う点を再利用。旧schema/path/runtime/DB/lease実装は移植しない。 |
| 047 | `LEGACY-ASSET-BE8B151A0094B754FF20` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-acceptance.md:49,52,68-69`; full SHA-256 `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d`; raw-span SHA-256: line49 `2d0324c8d4530b1e1dd68349c2c383bce4f34b6be82e117757a8582626af8f42`, line52 `1d8f0c33e028a761a602bcf67f9498d8ec43613264a938f747e9527faf919c19`, lines68-69 `6f1db6c0f61ecc0cc544d522d2064251aa3f088f4d3b86ee82114066c122edeb` | HXT-AC-021/024/040/041のscope overwrite/provider digest invariance/measurement immutability/old receipt rejection oracleを現行意味へ再導出。旧Ticket/Assignment runtime testは実行しない。 |

### 031: POが変更した旧CI回収工程

2026-09-26のPO判断（`docs/governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md:41-55`、whole SHA-256 `650264f78387d317eb5dec7a58c14197ac2c97ef712f05cd30ce5e11869cd5ea`、raw span SHA-256 `b0b43ff1e09e5d7a0a58c8f24a87c95b6a3b430b35a99e7b9f51b5d46082ccf3`）は、ticketとの関係から必要CI範囲を決め、省略義務を合流先ticketで回収し、夜間補完をやめてLABOが後日すり抜けfailureを評価することを決めている。旧GH-NFR-010のmain後Full/nightly補完を現行前提へ戻さない。保持点は必要義務を記録し未回収を消さないこと。変更点は省略分をmerge直後/夜間に一律回収する方式から、合流先ticketとLABOの既存責務へ移したこと。

GH-FR-025（旧L3 `github-atomic-development-requirements.md:52-65`）はPR省略項目をmain合流直後のFull回帰で回収し、nightlyで欠落/失敗/driftを補完する系譜であり、confirmed statusのCI System Synthesis要件（同source `ci-system-synthesis-requirements.md:1-25` の`refines: GH-NFR-009/010/011`）もこの性能・回収要件を精緻化していた。9/26 PO判断は選択CI後の未完義務をticketへ結び、後続ticketで回収する運転へ変更した。したがって保持するのは省略義務の可視性・exactly-once回収・性能と正しさの分離、再導出/置換するのはmain直後Full/nightlyを一律の現行回収routeとする部分である。historical `confirmed` metadataは現行の新たな承認を意味しない。


### Stage 5 続き：固定親・PO決定pin（031/047）

| 親 | 固定L2 | 固定L11 | exact PO登録と決定記録 |
|---|---|---|---|
| 031 | `docs/helix-os/L2-requirements/governance-requirements.md` lines 900-912; whole SHA-256 `97f9158bea0d5c39821bb6538887b909d04687798c8e836d151681ebb06f9bf7`; raw span `51b88d4589e836781086bf3c6f847b68a2a7225486e361f407f5f5ba68256b6b` | `docs/helix-os/L11-acceptance/governance-acceptance.md` lines 500-512; whole SHA-256 `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`; raw span `945cfccc7638576ff6665ace97e5a2c39c3f67f4ecd95be5959a70c0a0f3462a` | `MPR-RC-HELIXOS-L2-031-001`, adopted / 1.0, `docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L54`, semantic `a78fb330ca244dd067b1f13376d1c9245d0e96a43b716f0d53c3e4c2b7f36462`; decision whole SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`, row SHA-256 `6748fddcc4f82bd0f0f0fce3a1b0e9987bba989722cbd37e4e161bffec79415b` |
| 047 | `docs/helix-os/L2-requirements/governance-requirements.md` lines 1185-1194; whole SHA-256 `97f9158bea0d5c39821bb6538887b909d04687798c8e836d151681ebb06f9bf7`; raw span `9afa3ef650768224d85fd336eaaf89baa3d7e5eb96c776bb812a66fd67cada9f` | `docs/helix-os/L11-acceptance/governance-acceptance.md` lines 802-811; whole SHA-256 `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`; raw span `2f0ca89554fc9d4618c1f763c4e0f567488bd221a6029cd3670c79c806b8a3ef` | `MPR-RC-HELIXOS-L2-047-004`, adopted / 1.0, `docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L70`, semantic `e19191ce980467fddf5822619ccd480a41c84e6382ad1191ad5ea3ab04192377`; decision whole SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`, row SHA-256 `f03e66901529dfad317010ef922afdb5632e925cc07f000415a900ba2dfdc1ed` |

031の運転境界は2026-09-26 decision `harness-v-valley-process-po-decisions-2026-09-26.md` lines 41-55（whole SHA-256 `650264f78387d317eb5dec7a58c14197ac2c97ef712f05cd30ce5e11869cd5ea`; raw span `b0b43ff1e09e5d7a0a58c8f24a87c95b6a3b430b35a99e7b9f51b5d46082ccf3`）にも従う。
