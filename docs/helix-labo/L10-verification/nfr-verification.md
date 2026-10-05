# HELIX-LABO L10 NFR測定設計 — Stage 1（001/011）

[L3 NFR候補](../L3-requirements/nfr-grade.md)と同じ合成入力・scope・revisionで測定する。未実行、未承認。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXLABO-L2-001` | 20-field coverage / observed-status fidelity | source contractごとに20 fieldsを提供し、実在する各statusを個別投入。20 fieldを各1つずつ独立に欠落させ、7 source statusを各々照合する。unknown→successとnot_observed→successを別々に変異し、all-success snapshotも対照fixtureにする | 20 required field coverage、存在statusのdistinctness、source上の非success event脱落0、未発生statusの捏造0、unknown/not_observedのsuccess coercionを各0。異なるsource identityの混合0、scope欠落/未許可での完了表示0。source statusとLABO processing hold/warningを分離し、source statusの書換え0。 |
| `HELIXLABO-L2-001` | source isolation/partial failure（固定L2-001 L2:73、L11 §24 #1/#2） | 1sourceだけcorrupt/unauthorized/secret/out-of-scope、別source valid。identity混合、scope欠落、scope未許可をそれぞれ独立変異 | 欠落/権限外入力はsource責務へ戻す。LABO側のidentity混合は元記録を保つholdで、新routeを作らない。scope欠落/未許可で横断完了を示さない。unrelated valid source preserved; LABO writeback 0。 |
| `HELIXLABO-L2-001` | scope boundary | Web/WEB-OS 031/032契約未選択と選択ケースを分ける | 未選択時は1.0必須依存でない。選択時だけそのaccepted source contractで扱う。 |
| `HELIXLABO-L2-011` | reference roundtrip | source observation→Aggregate→Correlate→episode candidate→sourceのidentity/revisionを往復。missingnessを保持する正常fixture、および欠測dropとsuccess/default coercionを別々に変異。observation ID missing/mismatch、source revision missing/mismatchも独立に変異。選択connectionの代わりに要求parent ID/別connectionのidentityまたはreceiptを与える反例も追加 | 全referenceが元recordへ戻り、source ID/revisionとmissingnessを保持。identity/revision欠落は固定L2-001 L2:73へ戻す。不一致はholdし新routeを作らない。connector代用はreceipt不一致を示して受領・成功を生成せず停止。 |
| `HELIXLABO-L2-011` | false causality | co-timed/co-located unrelated events、因果らしく見えるevidenceを含むevent、missing relation/source, aggregate-only-success | correlation candidateとcausal claimが区別され、evidenceの有無によらずL2-011 causal assertion 0。relation mismatchはCorrelateへ戻る。 |

測定不能・未観測は成功扱いせずsource statusを改変しない。許可source/observation ID/source revisionの欠落は依存L2-001 L2:73のsource責務へ、relation不一致はL2-011に従いCorrelateへ返す。source revision不一致やconnector代用のように固定parentに戻し先がない場合は元recordを保ってhold/unknownで停止し、新routeを作らない。性能・容量・保持期間の候補が必要になった場合はL3で根拠付き比較案と対の測定を起草し、個別parameterのPO gateを作らない。

## Stage 2a — 055/056/057 候補測定

[L3 NFR候補](../L3-requirements/nfr-grade.md)の同じ合成fixtureと親revisionを用いる。未実行であり、L3承認や実operation許可を意味しない。

| 対象・候補 | 観測fixture | 判定材料 |
|---|---|---|
| `LABO-055-FR-01` evidence, denominator and capability-level fidelity | 0件/1件/複数件、task/model群、source/revision別の実在state label、state unknown/missing、`n_state_missing`、eligible denominator、算入/除外理由、missing/failure/refusal/stopped/unknown、計算規則・scorer/oracle版、同じsource receiptからの再構成、coverage stateと水準の混在、異なるoracle結果、scope内未見class、6独立negative（CASE-08〜13）を各々拒否し、同一source receiptから計算規則/算入根拠を再構成、未評価classから配置/資格への変換0 | 実在state label別count＋`n_state_missing`=`n_total`、label統合/脱落0。複数oracle水準と根拠の混同0、coverage stateだけで水準を代用する方式との差を照合。eligible denominatorとdispositionを同じreceiptから再構成し、結果確認後の分母変更・重大failure平均相殺を拒否する。L11:196の旧Bench portfolio・反復・confidence interval・accepted-change正規化を全work種別へ一律要求しない境界を保つ。 |
| `LABO-056-FR-01` observation/run integrity | 初回resultのsource identity/revision/scope/state/budget/deadline/verificationを一つずつ欠落・変更し、budget/deadline不確実性も別fixture化。五state別fixture、実run receipt mismatch、task/model class、ticket/Worker revision、scoreによるscope変更/authority変更、stale Worker contract、oracle evidence/反例欠落 | 必須field保持100%、五state区別100%、欠落・未知条件によるassessed昇格0。budget/deadline欠落はfield不確実性として保持し、result state変更・補完0。receiptと実runの不一致・class/ticket/Worker revision mismatchを同一実績に結合しない。scoreによるscope/authority変更0、失敗/不一致をunassessedへ書換える件数0。不一致receipt、別class/ticket/Worker revision、stale Worker contract、verification/反例不足をassessedに使う方式との違いを検証する。元oracle/criteria不足だけ元source ownerへ返す。 |
| `LABO-057-FR-01` receipt/idempotency/return | CONNECT contractとhuman receiptの別正常fixture。各方式でidentity/revision/scope/state/verification/human receipt/data-use/unfinished obligationsを一項目ずつ変異し、ack消失/retry/duplicate、片方式absent/unknown、両方式とも不在/unknown、source-delivery mismatch/receipt mismatchも別fixture | 有効な一方式で同一義務を満たせば受領成立し、両方式とも有効証拠なしのCASE-25では未受領を保持する。必須field差0、same-ID retry後の観測1件、stale受領0、未完義務の消失0。source/delivery mismatchはOS、send/receive receipt mismatchはOS/LABOへ返す。LABO receiptは後続履歴化先を示し、deliveryだけでassessed/assignmentにしない。 |
| timing/volume profile | 入力件数×group数×payload sizeの各条件について計画試行を定義し、各試行を `valid / failed / missing / censored` の一状態へ分類 | `N_planned` を母集団として4分類件数を独立記録し、分類合計=`N_planned`。latency p50/p95はvalid latencyだけから算出し `N_valid/N_planned` を併記、いずれも該当分母が0なら算出値なし。throughputは有効処理件数/明示測定時間(seconds)を `items/second` で独立記録し、`N_planned=0`または測定時間0/missingなら算出値なし。固定閾値・SLA判定はしない |

候補測定の値と方法はL3一括承認対象で、値ごとのPO確認を追加しない。実際のworker eligibility/SLAは固定親が参照する既存source contractに従い、本候補測定で新設しない。
