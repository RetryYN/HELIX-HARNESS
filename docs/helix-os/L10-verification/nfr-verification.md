# HELIX-OS L10 NFR総合検証（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — CASE-NFR-OS-014 measurement design

### CASE-NFR-OS-014-01 — fixed tuple reproducibility comparison

親 `HELIXOS-L2-014` / `NFR-OS-014-01`。Populationは明示scope/revision内のsynthetic fixed tuples。candidate comparisonでは同じpack/dependency versions、configuration revision、data format、environment identityから作った2つの独立build traceのtuple fields/output identity/digestを比較する。2は同じ一組から同じ構成を作るL2意味と、旧paired sourceの同一authority input二回build比較`DIST-LITE-AC-004`（system-test-design:41。`DIST-LITE-R-03` artifact条件はrequirements:81–85）を根拠にした探索値で、minimum sample/thresholdではない。旧`ST-DIST-001`はmanifest/profile identity検証（system-test-design:24）であり、build回数根拠から除外する。tuple field missing/unknown/stale/wrong revision、environment mismatch、failed build、output mismatchを別件数にする。fixture countと実測build countを混ぜない。分母0/missingは割合なし。実時間が記録される場合のみ同一単位の有効標本n_valid/p50/p95を示しfailed/missing/censored/unfinishedを別件数にする。欠測・失敗を0にしない。実観測なしだけを未測定とする。

### CASE-NFR-OS-014-02 — forward and rollback transition evidence

親 `HELIXOS-L2-014` / `NFR-OS-014-02`。Populationは明示scope/revisionで開始したsynthetic stage-transition attempts。forward/cutoverとproblem-triggered rollbackの2種類の遷移を別に数え、same state/record identityを保ったevidence-complete attempts / started applicable attemptsを比較する。2はL2の「次を構築・検証後に乗り換える」「問題時は前段階へ戻す」の2 transition class数で、pass ratio thresholdではない。分母0/missingは算出しない。transition-class applicability、prior/next identity、pre-cutover verification、rollback target, state/record preservationをfieldごとに集計する。failed, stopped, missing, unknown/stale dependency, wrong revision, rollback target missingを別件数にする。人手工程はowner/result recordを保持する。real timestampがある場合のみ同じ単位の有効sampleでn_valid/p50/p95を示しfailed/missing/censored/unfinishedを別件数にする。n_valid=0は分位値なし、実観測自体なしのみ未測定。SLA/RTO/RPOや固定最低数を作らない。
