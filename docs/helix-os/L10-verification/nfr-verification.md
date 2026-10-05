# HELIX-OS L10 NFR総合検証（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — CASE-NFR-OS-014 measurement design

### CASE-NFR-OS-014-01 — fixed tuple reproducibility comparison

親 `HELIXOS-L2-014` / `NFR-OS-014-01`。Populationは明示scope/revision内のsynthetic fixed tuples。candidate comparisonでは同じpack/dependency versions、configuration revision、data format、environment identityから作った2つの独立build traceのtuple fields/output identity/digestを比較する。2は同じ一組から同じ構成を作るL2意味と、旧paired sourceの同一authority input二回build比較`DIST-LITE-AC-004`（system-test-design:41。`DIST-LITE-R-03` artifact条件はrequirements:81–85）を根拠にした探索値で、minimum sample/thresholdではない。旧`ST-DIST-001`はmanifest/profile identity検証（system-test-design:24）であり、build回数根拠から除外する。tuple field missing/unknown/stale/wrong revision、environment mismatch、failed build、output mismatchを別件数にする。fixture countと実測build countを混ぜない。分母0/missingは割合なし。実時間が記録される場合のみ同一単位の有効標本n_valid/p50/p95を示しfailed/missing/censored/unfinishedを別件数にする。欠測・失敗を0にしない。実観測なしだけを未測定とする。

### CASE-NFR-OS-014-02 — forward and rollback transition evidence

親 `HELIXOS-L2-014` / `NFR-OS-014-02`。Populationは明示scope/revisionで開始したsynthetic stage-transition attempts。forward/cutoverとproblem-triggered rollbackの2種類の遷移を別に数え、same state/record identityを保ったevidence-complete attempts / started applicable attemptsを比較する。2はL2の「次を構築・検証後に乗り換える」「問題時は前段階へ戻す」の2 transition class数で、pass ratio thresholdではない。分母0/missingは算出しない。transition-class applicability、prior/next identity、pre-cutover verification、rollback target, state/record preservationをfieldごとに集計する。failed, stopped, missing, unknown/stale dependency, wrong revision, rollback target missingを別件数にする。人手工程はowner/result recordを保持する。real timestampがある場合のみ同じ単位の有効sampleでn_valid/p50/p95を示しfailed/missing/censored/unfinishedを別件数にする。n_valid=0は分位値なし、実観測自体なしのみ未測定。SLA/RTO/RPOや固定最低数を作らない。

## Stage 2c追補 — HELIXOS-L2-028 / HELIXOS-L2-029

以下はNFR candidate測定設計だけで、計測実行・値採択・pass判定ではない。母集団はcanonical NFRの定義どおり固定scope/revision内で明示し、fixture数と実測件数を分ける。必須field欠落なしとunresolved review finding 0件は固定親の契約oracleであり、個別PO gateではない。

### CASE-NFR-OS-028-01 — 認可済みconsult receipt census

親 `HELIXOS-L2-028` / `NFR-OS-028-01`。対象母集団はscope/revision内で選択・認可されたactual consultation attempts。authorization後dispatch前に停止したattemptも未完として分母に含める。認可拒否は分母外の適格性観測として別記する。分子候補は、ticket/revision/scope、元assignment、authorization/actor、selected source identity/revision/permission/relevance、request/response/return receipt、status、return owner、attempt/cost/partial/unfinished/resumeの全必須fieldが同一attemptで一致するreceipt chain数。NFR-OS-028-01と同じ選択・認可済consult attemptを分母にし、authorization後dispatch前に停止したattemptも未完として含める。認可拒否は母集団外の適格性観測とする。attempt数、field別欠落/mismatch、denied、response missing、source unknown/stale/conflict、dispatch前停止、stopped、partialを別件数で示す。分母0/missingは割合なしとし、0件と区別する。実経過時間は同一attemptのauthorization receipt時刻からreturn receipt時刻までとし、両timestampが有効で同じ単位のattemptのみを集計する。n_valid/p50/p95、failed/missing/censored countsを分ける。n_valid=0でも失敗等の実観測があれば未測定ではなく分位値なしとし、実観測自体がない場合だけ未測定とする。threshold/SLAなし。

### CASE-NFR-OS-029-01 — composite stage and receipt census

親 `HELIXOS-L2-029` / `NFR-OS-029-01`。対象母集団は明示scope/revision内で開始したcomposite attempts。全started attempt数を分母とし、stageごとのproposal/diff/optional consult/result/current independent review/owner receipt/repair/unfinished状態を分けて数える。完結trace/started attemptsの比率は比較候補で、分母0/missingなら算出しない。no-consultとconsult-selectedを別classとして示し、receipt missing/stale/identity conflict、finding unresolved、failed/stopped/partialを個別件数にする。finding=0かつcurrent exact HEAD/base/scope/oracle/resultが一致することはAC-OS-029-03のfixed oracleで、母集団全体のthresholdではない。

### CASE-NFR-OS-029-02 — effort/time/cost分布

親 `HELIXOS-L2-029` / `FR-OS-029` / `NFR-OS-029-02`。実際に記録されたstart-to-owner-receiptまたはstart-to-stopのtimestamps、assignment budget、cost、attempt/effectを使える場合だけ親scope/revisionとconsult有無で分類する。時間は記録元が定める同じ単位、費用は記録された通貨/unitを維持する。p50/p95候補の有効標本数n_validを示し、failed/missing/censored/unfinished countおよび打切り位置を分ける。budget ratioは同一assignmentで消費budgetと許可budgetが同じ次元・単位・期間に対応し、許可budgetが明示され0より大きい場合だけ算出する。分母0/missing、許可budgetなし、timestamp不整合、実測なしを異なる状態で報告し、欠測/censoredを0へ変換しない。固定sample N、時間/cost limit、修正cycle上限、SLA、pass gateは設けない。

## Stage 2a — 8親のNFR総合検証（015/016/017/018/019/020/023/027）

状態: `../L3-requirements/nfr-grade.md`の根拠付き候補を検証する設計。実行計測、threshold採択、PO承認、独立reviewを意味しない。

### CASE-NFR-OS-015-01 — authority completeness

親 `HELIXOS-L2-015`; Candidate 1の全required field presence/valueを対象fixture全数で照合する。管理record schema revision、結果のtarget revision・実行者actor・根拠・使用したHARNESS契約版、source identity/revision/digest/decision source/actor/time/raw event/correction chainのmissing/mismatchをfield別に数える。各negative CASEの対象field以外を正常に保ち、source/decision owner routeとraw event保持を記録する。Candidate 2は同じ明示scopeのsource/revisionについて訂正からcanonical sourceまでのtrace経路をrevision更新前後で比較する。欠落0期待は固定L2/L11 contract oracle。母集団外targetや日数で合否を作らない。

### CASE-NFR-OS-016-01 — portfolio edge/state census

親 `HELIXOS-L2-016`; fixed portfolio scopeが明示する全対象/edgeをcensusし、unit/connection/composite state、owner/dependency/diff/verification missing、unknown/staleを数える。Candidate 2では同じ対象edgeのrevision更新前後state、stale reason、unresolved edgeを対応比較し、更新前後の対象集合が異なる場合は差を明記する。cross-project流用、CI/ticket-plan-only readiness、resume時stale reason脱落は独立negativeとして扱う。未提示範囲の全体coverageを推定しない。candidate比較は同一scope/revisionで行う。

### CASE-NFR-OS-017-01 — ticket binding and workload ratios

親 `HELIXOS-L2-017`; 同一ticketに適用するsource/contractとinput digestを使ってticket fieldsを比較し、target/revision/scope/dependency/duty/return ownerの差を特定する。実データでは消費budgetと許可budget値を別々に記録し、分母が存在し0より大きい場合だけ比率を算出する。zero/missing budgetは算出不可として報告する。期限はsource表現と経過時間を別記し、現在のticket契約入力に計測開始点・単位付き許可duration/windowが明示されている場合に限り同単位の比率を算出する。absolute deadline、duration/windowのzero/missing、開始点/単位不明は比率算出不可として記録する。task-class別分布を示し、任意のglobal limitは置かない。

### CASE-NFR-OS-018-01 — attempt binding/cumulative-control census

親 `HELIXOS-L2-018`; HIL-NFR-36追補 `MPR-RC-HELIXOS-L2-018-002`（`docs/governance/decisions/po-decision-2026-10-03-additions10.md` row 34。L2 physical locator 1604–1619 registered semantic digest `5e2a621be8b4bda140bd796a48bedf2b3369daf5fad2665060ac41aa1a3174d2`（raw LF-inclusive span SHA-256 `634b700e1ed79c60f53235f6fb0e73348b7cc07264d4e4f8afb69e107aa1996d`）、L11 physical locator 1259–1276 registered semantic digest `e32e45319a3ac91004e3e1a985c7ff44e91b9e86f05b85c266d6b8d67acf87b5`（raw LF-inclusive span SHA-256 `ba303351c99a385506d9f151d0b51c03fb08922ce7d2848ffb3b1f485c4c221c`））を固定f6dad2a本文と別pinで適用する。全fixtureで重複claim/run、counter reset、binding欠落/不一致、SECURITY/INFRA stateのOS代替、実行中のbudget/deadline超過停止を数える。実際に停止した場合は停止理由と最初のOS管理/推進受領recordを照合し、外部sourceの不足/不一致がある場合はそのrecordを起点にした既存ownerへの訂正依頼も記録する。018-002のreceipt missing/unknown/conflict/scope-unknownは該当facetの未完として集計し、assignment可否/継続は既存authority/制約で別集計する。receipt状態だけによる新たな事前gate/全assignment停止を測定条件にしない。実測ではticket/revision/scopeごとに消費budgetと許可budget値を別記し、許可値が存在して0より大きい場合のみ比率を算出する。zero/missing budgetは算出不可として扱う。期限はabsolute deadline表現と経過時間を分け、現在のticket契約入力に計測開始点・単位付きduration/windowが明示されている場合だけ同単位の比率を算出する。absolute deadline、duration/windowのzero/missing、開始点/単位不明は算出不可とする。attempt/failure数を層別する。HIL-NFR-36では適用sourceの選択/不選択、revision-bound deviation receipt、実際に通った各step/順序、結果/理由、未選択consult/support receipt不生成を検査する。新しいfailure cap/default/orderは置かない。

### CASE-NFR-OS-019-01 — event/replay classification

親 `HELIXOS-L2-019`; fixture eventをmissing/duplicate/stale/denied/not-run/success別に数え、normal crash/restartの測定と失敗後replayを分ける。normalでは通常のcrash/restart eventから再構築し、negative/replayでは原eventを使い固定L2の失敗位置から再構築した差分を示す。実timestampがある場合の各durationは別母集団として観測候補に表示し、保持日数/復旧時間のcutoffにしない。

### CASE-NFR-OS-020-01 — applicable verification obligation census

親 `HELIXOS-L2-020`; HARNESS契約・対象diffから適用義務を定め、applicable/selected/executed/missingを全数照合。exact head/oracle/environment/run binding、監視/隔離境界、中断・失敗時に再開へ渡す同じbindingとunfinished stateを別に検査する。required obligationのmissingは固定契約違反。候補test数/段数/実行時間thresholdは発明しない。

### CASE-NFR-OS-023-01 — handoff binding census

親 `HELIXOS-L2-023`; 実際のhandoff edgeごとにrevision/digest/causal ID/scope/unfinished duty/stop reason/evidence presence/valueを照合する。unit-successからconnection acceptance、composite acceptance、next-stage acceptanceを個別に生成しないnegative fixtureを別々に数え、transport receiptとbusiness acceptanceを分ける。実測timestampがある場合はsenderからreceiver acceptanceまでを分布で示すだけで、任意latency KPIは設けない。

### CASE-NFR-OS-027-01 — eligibility/evaluation evidence

親 `HELIXOS-L2-027`; six eligibility conditionsとoperation authorityを別fieldで照合し、weighted scoreではなく全条件のconjunctionで判定する。LABO評価候補資料には実在sample n、scope/task/model class/revision、success/failure/rework/latency/cost/reliability、uncertainty/counterexample/unknownとoracle revision/criterionを記録する。分類・authority・applicability evidenceのunknown/missing/stale/conflict、output classification/scope逸脱、各result status、requested oracle/duty保持、人代行binding、実行中budget/deadline、L2:835の2 return routeをfunctional CASEごとに照合する。assignment record欠落、作成Workerとは異なるactorによるhuman confirmation欠落、LABO受領record欠落は別fixtureとして計数する。L2/L11はuniversal minimum N/score cutoffを定めず、一回のsuccessだけではassessedにしない。候補値は比較資料で、PO per-parameter approvalや新gateではない。

### L10測定記録

各caseはfixture digest、exact parent revision、入力母集団/scope、source oracle、期待/実測state、owner routeを記録する。割合を出す場合は対象母集団、分子・分母、単位、scope/revisionを記し、分母0/missingは算出値なしとして件数を別記する。unknown/未判定を成功扱いまたは分母へ黙って含めない。p50/p95は定義と単位が同じ有効な時間標本だけから算出し、n_validとfailed/missing/censored各件数を分ける。欠測/censoredを0に置き換えない。n_valid=0なら分位値なしと記録し、実測自体がない場合だけ未実測とする。失敗/missing/censored等の観測件数は保持する。fixture数と実観測数を混ぜない。この記録形式はSLA、threshold、pass gateを作らない。static trace/pin checkは実行成功や独立reviewの証拠ではない。

## Stage 3：非機能測定設計

NFR候補は計測対象と比較値であり、POごとのparameter gateではない。測定不能、source/scope mismatch、unknown applicabilityは成功率の分母から隠さず未評価として別表示する。

| CASE ID | NFR trace | 計測fixture・oracle |
|---|---|---|
| CASE-OS-L10-NFR-032-01 | NFR-OS-L3-032-01 | 完全一致positiveと全列挙field個別mutation。selected case coverageと誤eligible数を計測し、policy operationごとの既存SECURITY-L2-008 authority欠落/不一致を独立件数にする。 |
| CASE-OS-L10-NFR-033-01 | NFR-OS-L3-033-01 | selected capabilityごと2回、stressで3回same snapshot rerun。digest/fingerprint equalityと未実行選択数、dedupe evidence loss、差異のquarantine/unfinished保持、registry参照のみの権限誤認を計測。 |
| CASE-OS-L10-NFR-034-01 | NFR-OS-L3-034-01 | dispositionごと所定evidence set、各欠落mutation。required-evidence coverage/誤terminal数。 |
| CASE-OS-L10-NFR-035-01 | NFR-OS-L3-035-01 | 同一eventを3回delivery、headを変えた次eventも投入。registration cardinalityとold-head reuse数。 |
| CASE-OS-L10-NFR-036-01 | NFR-OS-L3-036-01 | 複数upgrade ticketの全Retrofit upgradeごとにplan前/apply直前のsource/authority capture。upgrade単位境界網羅率・stale pass数。 |
| CASE-OS-L10-NFR-037-01 | NFR-OS-L3-037-01 | 旧BR §3.3/FR-L1-11の週次観測についてReverse/Backflow経路と負債分類後のLABO/OS経路を分ける。fixtureの連続週・週境界・missing/staleを比較し、欠測をno-driftとした件数を観測する。週次は親の保持条件、fixture期間数は測定設計。 |
| CASE-OS-L10-NFR-038-01 | NFR-OS-L3-038-01 | proposal ID重送とappend/snapshot/receipt各中断点、041-003非原子的finding・same-input nondeterminism。row増分、current update、snapshot bytes/digest一致、部分成功claim数。 |
| CASE-OS-L10-NFR-040-01 | NFR-OS-L3-040-01 | 入力された適用中retry policy上限に対する到達/未到達、ledger欠落、同一lineage、実験budget分離を個別fixtureで照合する。OSがretry回数候補を追加しない。 |
| CASE-OS-L10-NFR-041-01 | NFR-OS-L3-041-01 | restart/resumeごとcanonical sourceをdriftさせる。reacquisition coverage、stale continuation数。 |
| CASE-OS-L10-NFR-042-01 | NFR-OS-L3-042-01 | strict failureと、選択済み既存契約が実際にexpiryを指定する場合だけその期限の境界前後を比較する。期限/適用scope/再検証欠落による誤昇格を観測し、新期限値は設けない。 |
| CASE-OS-L10-NFR-043-01 | NFR-OS-L3-043-01 | request必須operationのrequest/call/result順序・correlation欠落と、request不要operationの許可済みcall/result対照を入力。chain completeness、誤approval数、不要request件数。 |
| CASE-OS-L10-NFR-044-01 | NFR-OS-L3-044-01 | prose-only handoverと固定された既存source lifecycle/evidence conditionを比較する。unknown/stale/conflictの保留と理由保持を観測し、source HEAD mismatchを新たな判定条件にしない。 |
| CASE-OS-L10-NFR-049-01 | NFR-OS-L3-049-01 | 同task traceを15/60min bucketで比較しlimitとstate countsを別確認し、成果・予算・未完義務のlineageを保持する。無根拠dispatchと誤状態数。 |
| CASE-OS-L10-NFR-050-01 | NFR-OS-L3-050-01 | fixed parent/sourceから入力された設定閾値・capacity・縮退条件の通常/境界/spike/downstream blocker fixtureを比較。親にない数値やbucket境界は追加しない。誤増枠・backpressure漏れを観測する。 |
| CASE-OS-L10-NFR-051-01 | NFR-OS-L3-051-01 | expiryを持つsourceではその値を照合し、持たないsourceではexpiry条件を課さず適用scope/class/revisionで判定する。scope change・同名別providerを個別fixtureで照合する。freshness日数を新設しない。 |

#### 追加NFR測定ケース

| CASE ID | NFR trace | 観測・分母・未知の扱い |
|---|---|---|
| CASE-OS-L10-NFR-037-02 | NFR-OS-L3-037-01 | weekly drift route と cumulative debt route を別scope/ownerで測定し、観測済み対象期間数を分母、欠測をnot observedとして残す。成功候補・価値判定はOSが生成しない。 |
| CASE-OS-L10-NFR-049-02 | NFR-OS-L3-049-01 | configured capacity × 有効な経過秒を時間分母として別記し、assignment/task count、unused capacity、unfinished lineageを独立集計する。時間0/欠測capacityは算出不能、分母が有効でcount 0なら実測0。 |
| CASE-OS-L10-NFR-050-02 | NFR-OS-L3-050-01 | 同期間のtyped metricとeligible reviewer capacityを集計し、cause unknown/metric missing/lease staleは分母から除外せず未評価数として別表示。評価値だけでquality/merge stateを作らない。 |
| CASE-OS-L10-NFR-051-02 | NFR-OS-L3-051-01 | scope/class/revisionごとの適格evidence件数を母集団にし、期限欠測・source stale・availability unknownを別状態で報告する。provider名は適格性の代理値にしない。 |
