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

## Stage 3：非機能測定設計

NFR候補は計測対象と比較値であり、POごとのparameter gateではない。測定不能、source/scope mismatch、unknown applicabilityは成功率の分母から隠さず未評価として別表示する。

| CASE ID | NFR trace | 計測fixture・oracle |
|---|---|---|
| CASE-OS-L10-NFR-032-01 | NFR-OS-L3-032-01 | 完全一致positiveと全列挙field個別mutation。selected case coverageと誤eligible数を計測。 |
| CASE-OS-L10-NFR-033-01 | NFR-OS-L3-033-01 | selected capabilityごと2回、stressで3回same snapshot rerun。digest/fingerprint equalityと未実行選択数。 |
| CASE-OS-L10-NFR-034-01 | NFR-OS-L3-034-01 | dispositionごと所定evidence set、各欠落mutation。required-evidence coverage/誤terminal数。 |
| CASE-OS-L10-NFR-035-01 | NFR-OS-L3-035-01 | 同一eventを3回delivery、headを変えた次eventも投入。registration cardinalityとold-head reuse数。 |
| CASE-OS-L10-NFR-036-01 | NFR-OS-L3-036-01 | 複数upgrade ticketの全Retrofit upgradeごとにplan前/apply直前のsource/authority capture。upgrade単位境界網羅率・stale pass数。 |
| CASE-OS-L10-NFR-037-01 | NFR-OS-L3-037-01 | UTC 7-day bucket/rolling 7-day比較と週境界missing fixture。欠測をno-driftとした件数。 |
| CASE-OS-L10-NFR-038-01 | NFR-OS-L3-038-01 | proposal ID重送とappend/snapshot/receipt各中断点、041-003非原子的finding・same-input nondeterminism。row増分、current update、snapshot bytes/digest一致、部分成功claim数。 |
| CASE-OS-L10-NFR-040-01 | NFR-OS-L3-040-01 | transient/permanent failure系列で1/2/3 retry上限比較。重複副作用・無駄retry・必要returnの未送信。 |
| CASE-OS-L10-NFR-041-01 | NFR-OS-L3-041-01 | restart/resumeごとcanonical sourceをdriftさせる。reacquisition coverage、stale continuation数。 |
| CASE-OS-L10-NFR-042-01 | NFR-OS-L3-042-01 | strict failure、選択済み既存契約にexpiryがある場合の4/24/72h候補境界、再検証なしの比較。期限後/対象外scopeの誤昇格数。再承認gateは追加しない。 |
| CASE-OS-L10-NFR-043-01 | NFR-OS-L3-043-01 | request必須operationのrequest/call/result順序・correlation欠落と、request不要operationの許可済みcall/result対照を入力。chain completeness、誤approval数、不要request件数。 |
| CASE-OS-L10-NFR-044-01 | NFR-OS-L3-044-01 | prose-only/typed receipt、同一/異headの対照。誤resolution数。 |
| CASE-OS-L10-NFR-049-01 | NFR-OS-L3-049-01 | 同task traceを15/60min bucketで比較しlimitとstate countsを別確認。無根拠dispatchと誤状態数。 |
| CASE-OS-L10-NFR-050-01 | NFR-OS-L3-050-01 | configured thresholdの1/2 bucket超過、15/60min窓、spike/downstream blockerを比較。誤増枠・backpressure漏れ。 |
| CASE-OS-L10-NFR-051-01 | NFR-OS-L3-051-01 | 既存contractが期限入力を持つ場合のevidence age 7/30/90日、scope change、同名別providerのfixture。false-fitと不要stale判定。適用可能性unknownは未評価で計測する。 |

#### 追加NFR測定ケース

| CASE ID | NFR trace | 観測・分母・未知の扱い |
|---|---|---|
| CASE-OS-L10-NFR-037-02 | NFR-OS-L3-037-01 | weekly drift route と cumulative debt route を別scope/ownerで測定し、観測済み対象期間数を分母、欠測をnot observedとして残す。成功候補・価値判定はOSが生成しない。 |
| CASE-OS-L10-NFR-049-02 | NFR-OS-L3-049-01 | configured capacity × 有効な経過秒を時間分母として別記し、assignment/task count、unused capacity、unfinished lineageを独立集計する。時間0/欠測capacityは算出不能、分母が有効でcount 0なら実測0。 |
| CASE-OS-L10-NFR-050-02 | NFR-OS-L3-050-01 | 同期間のtyped metricとeligible reviewer capacityを集計し、cause unknown/metric missing/lease staleは分母から除外せず未評価数として別表示。評価値だけでquality/merge stateを作らない。 |
| CASE-OS-L10-NFR-051-02 | NFR-OS-L3-051-01 | scope/class/revisionごとの適格evidence件数を母集団にし、期限欠測・source stale・availability unknownを別状態で報告する。provider名は適格性の代理値にしない。 |
