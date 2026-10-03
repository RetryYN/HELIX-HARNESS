# HELIX-OS L3 機能要件（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: Stage 2a + Stage 2c / version_target 1.0 explicit items only
owner: HELIX-OS
paired_l10: ../L10-verification/functional-verification.md

本稿は固定L2/L11に根拠を置くStage 2a・2c部分範囲であり、機構全体のL3、実装、実行、採択・承認を意味しない。Stage 2cはPOの案B「支援・テスト生成を前倒し」に従い、支援candidate、OS handoff、実作業・検証・再作業を別段階で扱う。草稿からassignment、相談実行、test実行、受入状態を生成しない。親L2ごとにFR IDを分け、ACはL3正本に一度だけ定義し、L10は同じACを参照する。


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

Stage 2a・2cの固定L2/L11親は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` 時点。現行採択はPO decision recordから読み、本文の候補metadataは履歴として保持する。test-designはoracle/failure consumerとして読んだ資料で、旧test/runtime/CLI/CIは実行していない。

| identity／管理行 | PO判断・登録（path/行/SHA） | 固定L2（行・全文SHA-256・正規化節SHA-256） | 固定L11（行・raw節SHA-256・全文SHA-256） | 旧L3（asset/path/行/SHA） | 旧test-design（asset/path/行/SHA） | 判断 |
|---|---|---|---|---|---|---|
| `HELIXOS-L2-015` / `MPR-RC-HELIXOS-L2-015-001` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `49` SHA `dcf2bf40854921cc93c3b5e7a60c29bd8cfca61a2e5f973514478693d4f463ca`; candidate digest `sha256:f2dc267a0ee538ea6c5e8e96e28f7853c674f0afd7506763fd8277a9181cd6ef` | `docs/helix-os/L2-requirements/governance-requirements.md:642-651`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `18756826fc4dda35a81059eebcecb81df554937cd60f828eb67a5f1cc3fbda69` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 324-329 / `79fabc2e1eed7f8ccf3e3ac1ea88c6d5fa0a1bb9cb392835912aa6b0ce04caa0`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-C6936A5DA79A6DAE4FE4` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/document-authority-census-requirements.md` 行 23-69, 70-87; SHA `e05adb62d9ad07507f962cf060b3dbe66c161afc3f09391b29b3144ced57535c` | `LEGACY-ASSET-170112AB2FA2FFDBFEE9` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md` 行 13-29, 42-55; SHA `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | authority/source/owner/digest/consumerを同一化しない監査視点を再導出。旧censusのtype set/resolver/taxonomyは移植しない。／unknown/stale/mismatch/permission failureのnegative oracle候補。secret値をfixture/logへ書かず、旧broker動作を移植しない。 |
| `HELIXOS-L2-016` / `MPR-RC-HELIXOS-L2-016-001` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `50` SHA `be790d31aaf6234703bb4a617c2778a9a301da649937e840ca971e8c2e7c6515`; candidate digest `sha256:10242ad9ca2021f29a096b0037c1349dbb332c1ea91f185065bec11ea86a6743` | `docs/helix-os/L2-requirements/governance-requirements.md:652-661`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `55d5b2e72438019d672d7cfd39c2c3908248bc9783952f678b0288132bdac7e8` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 331-336 / `2dc46eb36e8ca552c079ade0dad329c2ca0c244f4c2493a06eec4f60647897a3`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-E78B8D68CC327AA00991` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md` 行 26-58, 59-78; SHA `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61` | `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 行 32-90, 91-216; SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | source span・unknown/conflict・FR/AC/testへのtraceを再導出。JSONをL3正本とする規則、schema/generator/algorithmは移植しない。／FR/NFRごとの正常/異常・境界oracle、親 requirement/AC trace の形の起点。旧HAT・L12受入・旧CI/CLIを現行L10へそのまま当てない。 |
| `HELIXOS-L2-017` / `MPR-RC-HELIXOS-L2-017-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `60` SHA `9d30a7359b9dc969d4441a4ba1c7d62527eed4266b2fa609a2c53b9749de9632`; candidate digest `sha256:d8bf7fe2ecbe9c1ef8a709b58af8dec1eeab15171b6932002a834b438f6fd1df` | `docs/helix-os/L2-requirements/governance-requirements.md:662-671`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `1f74fdb3677c997071c80a618cd48d7c1f5f9cac2650efe61ecc197539f9f2f7` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 338-343 / `33fa3c66d69861c88593bccd1b2c22d2a92b4c6b5ec82c4456f0bf2ce52d3f4a`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-5EE032D657C221184B00` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md` 行 13-40, 41-63, 64-87; SHA `e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b` | `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 行 32-90, 91-216; SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | workflow transition→FR/AC/test trace、proposalとauthority分離の考え方を再導出。旧interview、JSON/schema/algorithm/measurement値は移植しない。／FR/NFRごとの正常/異常・境界oracle、親 requirement/AC trace の形の起点。旧HAT・L12受入・旧CI/CLIを現行L10へそのまま当てない。 |
| `HELIXOS-L2-018` / `MPR-RC-HELIXOS-L2-018-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/po-decision-2026-10-03-additions10.md:34`, SHA `a42baefd1f1c24461b6abb62e4daa88aec3fba36e5409170f8660cdbc8f6c8ad`; register row `695` SHA `074fb2b6eb1eaef3bd408fbb57e44c583278b72967f124fe0f726b654d9f882e`; candidate digest `sha256:5e2a621be8b4bda140bd796a48bedf2b3369daf5fad2665060ac41aa1a3174d2` | `docs/helix-os/L2-requirements/governance-requirements.md:672-681`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `41d0788d372793e0dd2c61d54d7e59886cfa45987a993cdeabdcb2c3b3b5ea72` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 345-350 / `77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 行 34-124, 189-390, 391-478, 495-620, 717-856, 858-925; SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | scope/assignment/worker/reviewer/OS authority境界と失敗条件の意味を照合。旧固定provider/branch/WIP/lease/event modelやimplementation sequenceを移植しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |
| `HELIXOS-L2-019` / `MPR-RC-HELIXOS-L2-019-001` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `53` SHA `432271809d1ab4ae40fd50b888cfced90ea4091a774200da793c1039cd1734a4`; candidate digest `sha256:9362a64eef0f04968a8b1e89fde0027a145d5ab5c6aa9a6423d6e05e19ed447a` | `docs/helix-os/L2-requirements/governance-requirements.md:682-691`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `acea5c3a2f1b3a2c8aff97a37ed5476ad360d8707280f0bb0e8957b601a9e79f` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 352-357 / `9e17211bf2f7f54a58e2be30e23335954d94e184573912ed4f3ac92246838351`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-8FECCE93E3996E8AAAFF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/orchestration-memory-runtime.md` 行 14-50; SHA `c4fae09ac57f335a572b1d86ad353e7985551caa364f991a08e15d24d603c857` | `LEGACY-ASSET-1EAF81D2FED559ED38C4` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/lifecycle-state-separation-acceptance.md` 行 235-265; SHA `73a371eadd006c4f850cc0129f8c6cdf2b44c17d8356b94164cf253711c4f60c` | event/state/evidenceとworker/verifier分離は意味比較のみ。old file/db path、CLI、tick/locking/runtime behaviorは移植しない。／状態の誤昇格・証拠不足がcompletion claimに混ざるnegative oracle候補。旧state names/systemは移植しない。 |
| `HELIXOS-L2-020` / `MPR-RC-HELIXOS-L2-020-001` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `54` SHA `fd28113172eb24dc6778fbf0215be10687a3a981919c732a4fb5313c8a706f21`; candidate digest `sha256:fa62debc978fba6f5ab4146c0d3515a7ce7b5b4df3e054bd953b0f55e2f8878a` | `docs/helix-os/L2-requirements/governance-requirements.md:692-701`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `cae3019c5cd3549faaff920f9afa934f83ec4450c0ee7d7532bfc66ccc976f15` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 359-364 / `a9e5f9430836d409a7885b548fa8bff7a874184c024e74e28627cb9d7c59c88c`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` 行 38-57, 134-197, 198-307; SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 行 32-90, 91-216; SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | L3のFR/AC量閉じ・親L2 trace・要件とACを区別する構造を意味起点として再利用。51件/102AC、P2/P7後追い内容、旧ID、数値・gate実装をコピーしない。／FR/NFRごとの正常/異常・境界oracle、親 requirement/AC trace の形の起点。旧HAT・L12受入・旧CI/CLIを現行L10へそのまま当てない。 |
| `HELIXOS-L2-023` / `MPR-RC-HELIXOS-L2-023-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `62` SHA `a3aa2489fc4ab49fa640ce485ccced73d3db4f04923c3937a79561a53f6df8dd`; candidate digest `sha256:d0170f04d580850bcc2d8f2670a75f2137bfc0f04b2bb789819b2c1c72566020` | `docs/helix-os/L2-requirements/governance-requirements.md:722-731`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `9e07b91bc6da6705d31bd24c2b6078807ad644d7266ba068a3c8aa5dbf849248` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 380-385 / `a376384798f6ddd7ef34ea51a05852e974ee0b25f1f9ec1115674b8dcd316c20`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 行 34-124, 189-390, 391-478, 495-620, 717-856, 858-925; SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | scope/assignment/worker/reviewer/OS authority境界と失敗条件の意味を照合。旧固定provider/branch/WIP/lease/event modelやimplementation sequenceを移植しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |
| `HELIXOS-L2-027` / `MPR-RC-HELIXOS-L2-027-002` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; register row `345` SHA `b20213434b816c9c5de60e506b9b7236302db7f5c9d191d4b73d2db372199246`; candidate digest `sha256:f0e3e68996a3f9b9cf1740413a979483f32b78dcc8cd1aca9a881d7dd7fa2d0c` | `docs/helix-os/L2-requirements/governance-requirements.md:824-846`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; span `49cd7c1512f292a292908d42c6af02024f5b7b0a89d7176e2c691720c27703c6` | `docs/helix-os/L11-acceptance/governance-acceptance.md` 442-456 / `a2ae828eaa67210d5b6a38de065d989a5addfd5676f0408d6564fa318bb541c2`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | `LEGACY-ASSET-7F8960532611D89D03E1` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md` 行 32-70, 72-94; SHA `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | 外部技術の観測・根拠付きdiff・戻り先/再検証の考え方を再導出。外部tech inventory/upgrade lifecycleを現行要件に重複追加しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |
| `HELIXOS-L2-028` / original `MPR-RC-HELIXOS-L2-028-001` row410, current metadata successor `-002` row905 (same semantic digest `sha256:f41238ee4660d455d6f6a144bdab4a35ef9704aac190835a24589853ed3e4fab`, `authority_effect:none`), PO採択済み (`version_target: 1.0`) | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da` | `docs/helix-os/L2-requirements/governance-requirements.md:847-862`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; normalized section SHA-256 `sha256:f41238ee4660d455d6f6a144bdab4a35ef9704aac190835a24589853ed3e4fab` | `docs/helix-os/L11-acceptance/governance-acceptance.md:457-467`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`; raw section SHA-256 `92ef51759878794066463d36cda375b19cf2a7025d13062101f72464ef981485` | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 行42,90-117,302-310,357-364,591-597; SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | 元Worker責任の保持、scope/budgetのbounded支援、元Workerへの戻しとrole separationを再導出。旧daemon/branch/lease/provider/slot数/CLI/runtime/CIを移植せず、現行OS/INT/HARNESS/SECURITY/INFRA責務へ置換。 |
| `HELIXOS-L2-029` / approved fixed registration `MPR-RC-HELIXOS-L2-029-003` row433, current metadata successor `-004` row911 (same semantic digest `sha256:59a37b8d83fb269c12263089d937e696d0b9bfe8684d46822e267588802878f8`, `authority_effect:none`), PO採択済み (`version_target: 1.0`) | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:27`, SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da` | `docs/helix-os/L2-requirements/governance-requirements.md:863-877`; SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; normalized section SHA-256 `sha256:59a37b8d83fb269c12263089d937e696d0b9bfe8684d46822e267588802878f8` | `docs/helix-os/L11-acceptance/governance-acceptance.md:468-478`; SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`; raw section SHA-256 `921d184ab89892a7a257600e13e80290053dc49749e9f708909f27f2bd2f42ea` | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 行42,90-117,302-310,357-364,591-597; SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | original Worker・support・reviewerの分離と因果loopを再導出し、L2/L11の案Bで作業前支援を前倒し。旧固定実装順/slot/lease/cycle/provider/runtime/CIは置換し、L2-018/019/020/023・HARNESS oracle ownerを保持。 |

## PO向け要約（承認未取得）

この部分草稿は、Stage 2aのauthority/ticket/assignment/continuity/verificationに加え、Stage 2cで支援handoff（028）と支援から検証・再作業までのcomposite（029）を別々のFR/ACへ展開する。案Bに沿う作業前candidateはconsultやfailure evidenceなしで準備可能とし、実相談・実作業・検証・独立reviewは発生後の別証拠で照合する。各ownerの正本・oracle・権限・資源をOSが代替せず、unknown/staleと未完義務を保持する。固定回数のretry/loopや新しいbudget/deadline値は追加しない。
