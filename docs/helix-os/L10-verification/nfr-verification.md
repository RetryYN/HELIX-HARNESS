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

親 `HELIXOS-L2-019`; fixture eventをmissing/duplicate/stale/denied/not-run/success別に数え、normal crash/restartの測定と失敗後replayを分ける。hold/確認待ちfixtureは宣言済/未宣言/期限切れ/判定unknown別に数え、各々のsource・owner・未完義務とL1-002/008に沿う人間向けL2-019 projection listへのtrace completenessを別記する。AI解決可能性の分類やPO宛先を測定・要求しない。normalでは通常のcrash/restart eventから再構築し、negative/replayでは原eventを使い固定L2の失敗位置から再構築した差分を示す。実timestampがある場合の各durationは別母集団として観測候補に表示し、保持日数/復旧時間のcutoff、期限値・催促間隔・滞留率/目標にしない。

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
| CASE-OS-L10-NFR-036-01 | NFR-OS-L3-036-01 | 複数upgrade ticketの全Retrofit upgradeごとにplan前/apply直前のsource/authority capture。upgrade単位境界網羅率・stale pass数。非upgrade保持群はFV CASE-OS-L10-036-07, CASE-OS-L10-036-08a, CASE-OS-L10-036-08bだけを別集計し、固定L11が要求するHARNESS duty/read-only policy保持に対する省略期待数0を照合する。upgrade分母と混ぜず、別の数値閾値は設けない。 |
| CASE-OS-L10-NFR-037-01 | NFR-OS-L3-037-01 | 旧BR §3.3/FR-L1-11の週次観測についてReverse/Backflow経路と負債分類後のLABO/OS経路を分ける。fixtureの連続週・週境界・missing/staleを比較し、欠測をno-driftとした件数を観測する。週次は親の保持条件、fixture期間数は測定設計。 |
| CASE-OS-L10-NFR-038-01 | NFR-OS-L3-038-01 | proposal ID重送とappend/snapshot/receipt各中断点、041-003非原子的finding・same-input nondeterminism。row増分、current update、snapshot bytes/digest一致、部分成功claim数。 |
| CASE-OS-L10-NFR-040-01 | NFR-OS-L3-040-01 | 入力された適用中retry policyの初回attempt計上有無、対象failure class（固定L11-040の「対象となる失敗の範囲」）、同一episode累積に従う上限到達/未到達、ledger欠落、Worker/session交代後の同一lineage、実験budget分離を個別fixtureで照合する。FV CASE-OS-L10-040-07g..07jでは、累積Nのretry拒否と累積N-1のretry許可を別々に照合し、誤集計による逆方向の誤routeも観測する。OSがretry回数候補や閾値を追加しない。 |
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

## Stage 4：NFR測定case（6件）

各NFR集計caseは同親のsummary CASEと下表の独立fixture CASE群から観測値を得る。各独立CASEは機能CASEの個別変異を一つだけ含み、集約行を各negativeの代用・追加件数にしない。

| NFR CASE | 実際に照合するfunctional CASE ID | 範囲 |
|---|---|---|
| `CASE-OS-L10-NFR-021-01` | `CASE-OS-L10-021-01`, `CASE-OS-L10-021-02`, `CASE-OS-L10-021-03`, `CASE-OS-L10-021-03a`–`CASE-OS-L10-021-03al` | `AC-OS-L3-021-01`, `AC-OS-L3-021-02`, `AC-OS-L3-021-03`、サービス別適格性とbinding各変異 |
| `CASE-OS-L10-NFR-022-01` | `CASE-OS-L10-022-01`–`CASE-OS-L10-022-03`, `CASE-OS-L10-022-03a`–`CASE-OS-L10-022-03w` | `AC-OS-L3-022-01`, `AC-OS-L3-022-02`, `AC-OS-L3-022-03`、eventから再観測までの各edge/owner |
| `CASE-OS-L10-NFR-024-01` | `CASE-OS-L10-024-01`–`CASE-OS-L10-024-03`, `CASE-OS-L10-024-03a`–`CASE-OS-L10-024-03ab` | `AC-OS-L3-024-01`, `AC-OS-L3-024-02`, `AC-OS-L3-024-03`、permission・分類・revision・scope・依存 |
| `CASE-OS-L10-NFR-046-01` | `CASE-OS-L10-046-01`–`CASE-OS-L10-046-03`, `CASE-OS-L10-046-02a`–`CASE-OS-L10-046-02f`, `CASE-OS-L10-046-03a`–`CASE-OS-L10-046-03j` | `AC-OS-L3-046-01`, `AC-OS-L3-046-02`, `AC-OS-L3-046-03`、遷移bindingと既存免除境界 |
| `CASE-OS-L10-NFR-048-01` | `CASE-OS-L10-048-01`–`CASE-OS-L10-048-03`, `CASE-OS-L10-048-01a`–`CASE-OS-L10-048-01k`, `CASE-OS-L10-048-02a`–`CASE-OS-L10-048-02n`, `CASE-OS-L10-048-03a`–`CASE-OS-L10-048-03g` | `AC-OS-L3-048-01`, `AC-OS-L3-048-02`, `AC-OS-L3-048-03`、finding・resolution・再発行後評価 |
| `CASE-OS-L10-NFR-052-01` | `CASE-OS-L10-052-01`–`CASE-OS-L10-052-03`, `CASE-OS-L10-052-01a`–`CASE-OS-L10-052-01m`, `CASE-OS-L10-052-02a`–`CASE-OS-L10-052-02i`, `CASE-OS-L10-052-03a`–`CASE-OS-L10-052-03q` | `AC-OS-L3-052-01`, `AC-OS-L3-052-02`, `AC-OS-L3-052-03`、cleanup所有・post-merge再照合・返却境界 |

| case ID | NFR候補ID | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-OS-L10-NFR-021-01` | `NFR-OS-L3-021-01` | 適格選択構成のpositiveと、7サービス個別evidenceの欠落/入替、component/artifact/digest/scope/authorityの単一変異、他project未完の対照を用いる。 | 選択target内のbinding mismatch=0、service evidence誤代用=0、scope外導入=0。 | source/適格性が不明なら未評価・owner返却。複数選択normal、後続version_target、成熟度/impact/再現性/運用証拠の各独立欠落も照合する。 |
| `CASE-OS-L10-NFR-022-01` | `NFR-OS-L3-022-01` | source eventから再観測までの完全trace、LABOの独立評価/提案/比較実験依頼の個別欠落、各edge欠落、candidate件数だけのprojectionを、件数のみで改善効果を主張する変異と比較する。 | 既知fixture上のedge trace 100%、candidate/eventからの誤authority変更0、OS/LABO/判断ownerの誤role 0。 | LABO効果評価が未着ならその状態を未評価とし、OSで補わない。移管済みL2-012/013をOS ownerへ戻さない。return destination/re-evaluation conditionの欠落も独立に照合する。 |
| `CASE-OS-L10-NFR-024-01` | `NFR-OS-L3-024-01` | permission/data class/target revision/scope/evaluation rangeを独立に変異する。 | 非許可data送信0、提供/評価/採否state混同0。 | 適用可能scopeまたは許可条件が不明なら未評価・差戻し。 |
| `CASE-OS-L10-NFR-046-01` | `NFR-OS-L3-046-01` | authority/HEAD/base/scope/contract各一変異と無関係scope対照。 | required binding一致100%、変更後の古い証拠流用0、無関係scopeの誤stale0。 | 適用contractを特定できない遷移は未完として測定外へ理由付き分離。 |
| `CASE-OS-L10-NFR-048-01` | `NFR-OS-L3-048-01` | existing resolution conditionを満たす完全evidence、各field欠落、stale/wrong scope/prose-only、再発行後同条件LABO評価、closed-ticket追補、window未満/未追跡/打切り観測を比較。 | false resolution=0、original closure上書き=0、censored/untracked observationからのdefect 0誤認=0。 | resolution適格性・evaluation population unknownは成功分母へ混ぜず、unacknowledged/unevaluated/finding disappearance/別scope successを別々に照合する。 |
| `CASE-OS-L10-NFR-052-01` | `NFR-OS-L3-052-01` | owner/other-use/open-work/remote-authority/実施者の対象・作用・結果の記録経路、content HEAD/base/review pairを一つずつ変異し、cleanupを反復する。trial merge/stale/dependencyの個別unknownとreview bindingのmissingも与える。new HEAD review欠落、blocker残存、merge admission欠落、notification/ACK/merge event/ancestryだけのreceipt誤認も個別fixtureで測る。base変更後にpair一致/stale=0/依存維持する対照は保持可能状態として観測し、reviewed pair一致後の一律returnを要求しない。 | 不適格資源誤削除=0、実不一致後のold-review利用=0、eligible local cleanup再実行で副作用なし。read-afterとcleanup記録の混同0、旧CIによる代替0。 | ownership/未完/authority unknownは削除せず未評価へ。authorityがあっても記録経路欠落なら削除せずcleanup未完理由を該当ownerへ返す。最新base再照合後にreviewed pair一致・stale=0・依存維持の場合は、既存stateを保持可能な状態として報告する。 |


## Stage 5 — 4親のNFR測定CASE候補

この追補は既存文書のStage 2b/Stage 2a/Stage 3/Stage 4 scope欄を遡及変更せず、ここに列挙したStage 5対象だけを追加する候補である。先頭のstatusは先行scopeの状態を示す。

| NFR CASE | NFR候補 | 集計対象 functional CASE | 観測と未評価条件 |
|---|---|---|---|
| `CASE-OS-L10-NFR-025-01` | `NFR-OS-L3-025-01` | `CASE-OS-L10-025-01`–`21`, `CASE-OS-L10-025-022`–`039`, `CASE-OS-L10-025-047`–`049` | HELIX自身＋異種projectの7段trace値一致/単独欠落、service①〜⑦/選択scope/部分未見、配布gate誤追加、全体normal/1製品欠落、unknown等のfixture内分類・誤結合を計数。全運転KPIではない。|
| `CASE-OS-L10-NFR-026-01` | `NFR-OS-L3-026-01` | `CASE-OS-L10-026-01`–`60` | source/contract/permission/dependency/recovery/human入力状態、pack版・適用対象・一周出力、closure、空pack集合の候補除外、代替space、minimum-proof stateを分離。|
| `CASE-OS-L10-NFR-031-01` | `NFR-OS-L3-031-01` | `CASE-OS-L10-031-01`–`95` (066/068/070/072除外; 031-25 alias) | old 60s/3m comparisonと現在適用budgetを混同しない。wall-clock、runner-minute、failure feedback latency p50/p95、超過原因を含む固定L2-031 measurement fieldの有無/stale/scope不一致、Recovery Issue正本誤用、AC03単変異、安全性/並列化/回収traceをCASE別集計し、欠落population等のpercentileを未評価とする。|
| `CASE-OS-L10-NFR-047-01` | `NFR-OS-L3-047-01` | `CASE-OS-L10-047-01`–`41` | reason/evidence/根拠source revisionの独立欠落、元assignmentとのrelation・未完義務追跡、Assignment/Attempt/result/authority非継承、unknown軸、双方向参照・owner backflowをCASE別集計する。|

これらはdocumented fixtureの静的集計候補であり、実測やoperational NFR達成を示さない。

### Stage 5 review01補正overlay — 集計対象と重複の扱い

下表はfunctional verificationに定義した個別CASEだけを参照する。既存の範囲表に記した終端IDは補正後の最終IDへ更新し、CASE-031-25（031-06と同一fixture）とCASE-047-20（047-04と同一fixture）はindex aliasのため独立母数にしない。CASE行数は文書化fixtureの数であり、実測母集団・合格率ではない。

| NFR CASE | 親 / NFR / AC | 補正後functional CASE集合 | 観測 |
|---|---|---|---|
| `CASE-OS-L10-NFR-025-01` | 025 / NFR-025-01 / AC-025-01〜03 | CASE-025-01〜21、022〜039、047〜049、aliasなし | 固定L2入力と7段traceの個別欠落/値一致、unit・connection・composite区分、配布gateと1製品欠落、document/mechanism existenceのみの誤成立。|
| `CASE-OS-L10-NFR-026-01` | 026 / NFR-026-01 / AC-026-01〜05 | CASE-026-01〜60、全ID個別判定 | 入力単独欠落、dependency/安全/比較状態、pack版/適用対象/一周出力、結果から状態生成、scope・環境・更新/rollback、資源不足の返却、導出成功からStage構成採択を生成しない。|
| `CASE-OS-L10-NFR-031-01` | 031 / NFR-031-01 / AC-031-01〜05 | CASE-031-01〜95（066/068/070/072除外）、ただし031-25は031-06のalias | 各measurement field、Recovery Issue正本誤用、予算/母集団/改善前後値、ticket/source/base/measurement scope、旧数値/既決工程、正しさ/性能、LABO/authority、非縮退回収を分離。|
| `CASE-OS-L10-NFR-047-01` | 047 / NFR-047-01 / AC-047-01〜05 | CASE-047-01〜41、ただし047-20は047-04のalias | r1/r2、元assignment・未完義務、source scope/revision/issuer/conflict、proposal authority、Ticket→Ticket参照をそれぞれ観測。|

既存CASE-025-17の戻し先、026-25の空pack除外とdependency unknownの区別、031-26〜30のAC-031-03/04 trace、047-11の明示的適格化なしという前提はfunctional overlayに従う。未知の実測値・適用分母は未評価のまま残し、旧followupが述べるcoverageを実測または独立review成立とは解釈しない。
