# HELIX-LABO L10 非機能検証（部分草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。このStage 1/Stage 2a/Stage 2b基本エンジン契約確認に不要な性能SLAは追加しない。別の技術値が要件上必要な場合は、上流指定の有無にかかわらず根拠・比較・測定方法付きのL3候補として提示し、承認前の閾値をoracleへ適用しない。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXLABO-L2-001` | 20-field coverage / observed-status fidelity | source contractごとに20 fieldsを提供し、実在する各statusを個別投入。存在する1 field/statusずつ欠落/変換し、all-success snapshotも対照fixtureにする | 20 required field coverage、存在statusのdistinctness、source上の非success event脱落0、未発生statusの捏造0、unknown/not_observedのsuccess coercion 0。 |
| `HELIXLABO-L2-001` | source isolation/partial failure | 1sourceだけcorrupt/unauthorized/secret/out-of-scope、別source valid | affected source held/warning; unrelated valid source preserved; LABO writeback 0。 |
| `HELIXLABO-L2-001` | scope boundary | Web/WEB-OS 031/032契約未選択と選択ケースを分ける | 未選択時は1.0必須依存でない。選択時だけそのaccepted source contractで扱う。 |
| `HELIXLABO-L2-011` | reference roundtrip | source observation→Aggregate→Correlate→episode candidate→sourceのidentity/revisionを往復 | 全referenceが元recordへ戻り、source ID/revisionとmissingnessを保持。 |
| `HELIXLABO-L2-011` | false causality | co-timed/co-located unrelated events、missing relation/source, aggregate-only-success | correlation candidateとcausal claimが区別され、evidenceなしcausal assertion 0。 |
| `HELIXLABO-L2-055` | 各宣言metric/scopeについてdenominator、算入・除外結果、理由、scorer revisionを再構成できるtrace completeness 100%候補 | 採択済み親scopeの正常/境界/否定fixture | 各宣言metric/scopeについてdenominator、算入・除外結果、理由、scorer revisionを再構成できるtrace completeness 100%候補 missing/failure/unknownの理由なき除外0、unassessed classの誤昇格0、配置/割当/authority生成0。 根拠: L2-055/L11-055はeligible denominatorと各disposition/reasonおよびscorer revisionを明示し、未評価classも表示する。標本数、重み付け、信頼区間、固定cutoffは現scopeに指定がなく、全task class共通条件にはしない。別の評価判断が特定の必要数を要すると分かった場合はtask/model/scope別に根拠・比較・測定案をL3候補として示す。 |
| `HELIXLABO-L2-056` | 列挙されたfirst-result provenance input全field coverage 100%候補。結果statusとsource/revisionの対応を全件保持。 | C01/C03/C04の取込・status・境界fixture、およびC05の全証跡が揃う評価正常fixture | 列挙field coverage 100%候補; unknown/failure/rejection/interruptionのsuccess coercion 0; oracle/scope/revision/conditions/result/failure/unknown/evaluator/time/receiptが全て一致する範囲のみ評価済み。C05では観測済みと評価済みを区別し、qualified/eligible/assignment生成0。根拠: L2-056/L11-056は入力field群とobserved≠evaluatedを明示。単発取込に標本数条件は加えず、評価側に必要ならtask/model/scope限定の根拠・比較・測定候補を示す。 |
| `HELIXLABO-L2-057` | same identity/source/revision/scope/status/receipt field consistency 100%候補 between source payload and accepted receipt. | 採択済み親scopeの正常/境界/否定fixture | same identity/source/revision/scope/status/receipt field consistency 100%候補 between source payload and accepted receipt. same-ID retryからduplicate observation 0; absent ack/receiptからreceived success claim 0; stale-as-current insertion 0. 根拠: L2-057/L11-057はack/trace/dedup/stale-stop/same-ID retry/unfinished obligationを明示。field一致と再送冪等性が親条件の直接測定候補。delivery acceptanceが生産する結果評価を増やさない。 |
測定結果はfield完全性、owner境界、source revision、unknown/holdの処置などの観測値で記録する。このStage 1/Stage 2a契約検証では、対象behaviorの合否に性能時間・容量・保持期間の閾値を要しないため新設しない。別の技術値が要件上必要なら、上流に数値指定がなくてもL3候補として根拠・比較案・測定方法を添えて通常の承認パッケージに提示し、parameterごとの承認は求めない。旧値や参考測定値を自動継承・合否閾値へ昇格させない。


## Stage 2b 基本エンジン候補の測定設計（未実行）

| 親L2 | 測定case | 入力／変異 | 判定oracle |
|---|---|---|---|
| `HELIXLABO-L2-002` | edge provenance / false causality | C01/C02のrelation有無・time/path-only対照 | edgeのsource/revision追跡率、因果誤断定0 |
| `HELIXLABO-L2-003` | category separation | 親9分類を一つずつ除外/矛盾化 | 分類別field保持、unknown消失0 |
| `HELIXLABO-L2-004` | comparison field fidelity | 7-fieldの各欠落と意味矛盾mutation | field別coverageと停止/unknown処置 |
| `HELIXLABO-L2-005` | transformation candidate trace | 12 action語彙と保持/変更意味を比較 | 許可action外0、owner/条件/meaning trace欠落0 |
| `HELIXLABO-L2-006` | experiment comparability | assignment/oracle/revision/cost/interruptionを個別・組合せ欠落 | 比較可能/不能が正しく分離し、missing costを0にしない |
| `HELIXLABO-L2-007` | assurance condition matrix | 再現条件/oracle/side effect/retry/rollback/idempotenceの全mutation | 5条件群（再現性、machine判定+oracle、副作用、retry/rollback/idempotence）の各判定根拠、欠落時systemization 0; 2/3/5反復案の安定性と費用を報告 |
| `HELIXLABO-L2-008` | operational return trace | rule/version/exception/FP/avoidance/cost/ownerを個別欠落 | 欠落を特定し戻し候補を保持、実行切替0 |
| `HELIXLABO-L2-009` | scope generalization | 1例、2/3/5独立例、cross-project/product、counterexample各fixture | 単一例上位scope0、例数別のscope安定性/偽一般化/費用を比較 |
| `HELIXLABO-L2-010` | feedback completeness | 16 fieldを個別欠落・targetを混在 | 16/16 coverage、未根拠補完0、target別分離 |

3反復および3独立episodeは測定開始の候補比較点であって固定pass閾値ではない。測定はoracle一致、scope安定性、反例検出、追加観測費用を同時記録する。


| 親L2 | 測定case | 入力／変異 | 判定oracle |
|---|---|---|---|
| `HELIXLABO-L2-012` | C01/C02〜04 | relation source/revision、unknown、欠落義務の個別欠落/不一致 | provenanceとunknown保持、owner returnの観測 |
| `HELIXLABO-L2-013` | C01/C02〜04 | 分類軸、根拠、元episodeの個別欠落/矛盾 | 分類軸別trace、根拠欠落の検出 |
| `HELIXLABO-L2-014` | C01/C02〜04 | original meaning/purpose/condition、candidate deltaの欠落/不整合 | original-to-candidateの意味差trace、unknown停止 |
| `HELIXLABO-L2-015` | C01/C02〜04 | baseline/current/candidate/hybridのversion/condition/oracleを個別にずらす | 比較arm間の条件一致と不成立理由 |
| `HELIXLABO-L2-016` | C01/C02〜04 | comparison result/counterexample/oracle/interruptionを独立・併発欠落 | 各証拠状態の保持、判定不能のoperation return |
| `HELIXLABO-L2-017` | C01/C02〜04 | guarantee/revision/unfinished obligation/ownerを個別に欠落 | switch 0、欠落理由とowner return |
| `HELIXLABO-L2-018` | C01/C02〜04 | sample condition/evidence scope/counterexampleを欠落または追加 | supportされた最大scope、反例によるscope縮小 |
| `HELIXLABO-L2-019` | C01/C02〜04 | target identity/evidence/target permissionを欠落・混在 | target別提案、unknown targetをOSへ返す |
| `HELIXLABO-L2-020` | C01/C02〜04 | old/new rule version, result, unfinished obligation, owner | revision/provenance complete、source ownerへの戻し |
| `HELIXLABO-L2-021` | C01/C02〜04 | HARNESS source/revision/authority/scope/permissionを個別に欠落・範囲外化 | source attribution、unauthorized intake 0、authority writeback 0 |
| `HELIXLABO-L2-022` | C01/C02〜04 | OS event/ticket/assignment/revision/status/unfinished stateを欠落・stale化 | canonical OS identity保持、staleをcurrent扱いしない |
| `HELIXLABO-L2-023` | C01/C02〜04 | BRAIN source revision/usage result/permissionを欠落、writebackを要求 | source追跡、canonical knowledge writeback 0 |
| `HELIXLABO-L2-024` | C01/C02〜04 | observed fact/judgment/source versionを欠落・混同 | factとjudgmentの区分、旧判断をcurrent authorityにしない |
| `HELIXLABO-L2-025` | C01/C02〜04 | SECURITY data-use scope/permission/source revisionとrestricted fieldを個別操作 | unauthorized/restricted intake 0、SECURITYへreturn |
| `HELIXLABO-L2-026` | C01/C02〜04 | INFRA resource/environment source versionをstale/unknown化 | stale/unknownをhealthyへ変換しない |
| `HELIXLABO-L2-027` | C01/C02〜04 | CONNECT source/schema/revision/traceを個別にdriftさせる | mismatch/unknownを可視化しconnection ownerへ返す |
| `HELIXLABO-L2-028` | C01/C02〜04 | Worker assignment/task class/result source/statusを欠落・未評価化 | observedをevaluatedへ昇格0、assignment owner return |
| `HELIXLABO-L2-029` | C01/C02〜04 | CI target revision/test scope/statusを欠落、stale/not-run/interrupted化 | 未実行/古い結果のpass表記0 |
| `HELIXLABO-L2-030` | C01/C02〜04 | Product Core source identity/version/scopeを混在、unselected sourceを必須化 | identity merge 0、unselected sourceはoptional |
| `HELIXLABO-L2-034` | C01/C02〜04 | multiple-product supported evidence vs single/product-specific/unknown; 2.0 external input | internal evidence scope、1.0/2.0 boundary |
| `HELIXLABO-L2-035` | C01/C02〜04 | revision/scope/unassessed field omission; learning/tuning request | packet trace complete、unassessed retained、3.0+ execution 0 |
| `HELIXLABO-L2-058` | C01〜05 | none, Worker-only, multi-source, selected missing, unknown selection, unauthorized no-selection payload, unselected/selected Web and external 2.0 | selected-only dependency closure、unselected=unobserved、selected-missing never unselected、no unauthorized ingest、external 2.0を1.0へ混入0 |
