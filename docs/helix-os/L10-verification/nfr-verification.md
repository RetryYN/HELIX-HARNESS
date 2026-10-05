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
