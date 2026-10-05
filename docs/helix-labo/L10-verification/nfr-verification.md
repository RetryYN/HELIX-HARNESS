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
| `LABO-055-FR-01` evidence and capability-level fidelity | 0件/1件/複数件、task typeとmodel classが同じ/異なる履歴、fixtureに実在する各source state label（unknownや欠落stateも別保持し、存在しないlabelは追加しない）、coverage state混在、異なる宣言済みoracle水準、oracle適用scope内の既見/未見class、oracle不足/範囲外 | 実在state label別count＋欠落state countの群別合計差0、source/oracle identity+revisionと範囲を保持、coverage stateが入力記録と一致、oracle結果の異なる水準混同0。適用scope内の未見classもoracle結果を保持し、oracle不足/範囲外/判定不能/根拠不足ではunassessed。配置/資格出力0 |
| `LABO-056-FR-01` observation integrity | 初回resultの各source identity/revision/scope/state/budget/deadline/evidence fieldを一つずつ欠落・変更、五stateを各々単独fixture化、oracle identity/revision/scope/rationale/comparison/evaluator/time/decision receiptを一項目ずつ欠落/古化/範囲外化 | 必須field保持100%、五state区別100%、欠落・未知条件によるassessed昇格0。budget/deadline欠落はfield不確実性として元recordに保持しresult state変更・補完0。評価証拠不足はunassessed、元oracle/criteria不足のみ元source ownerへ訂正依頼 |
| `LABO-057-FR-01` receipt/idempotency | CONNECT contract正常受領とhuman receipt正常受領を別fixtureで実施。各方式でidentity/revision/scope/state/verification/human receipt/data-use/unfinished obligationsの各fieldを一つずつ欠落/改変。初回、ack消失、same-ID retry、遅延duplicate receiptも個別化 | 両方式で義務を同等に満たす。必須field差0、same-ID retryで観測は1件、stale受領0、未完義務の消失0 |
| timing/volume profile | 入力件数×group数×payload sizeの各条件について計画試行を定義し、各試行を `valid / failed / missing / censored` の一状態へ分類 | `N_planned` を母集団として4分類件数を独立記録し、分類合計=`N_planned`。latency p50/p95はvalid latencyだけから算出し `N_valid/N_planned` を併記、いずれも該当分母が0なら算出値なし。throughputは有効処理件数/明示測定時間(seconds)を `items/second` で独立記録し、`N_planned=0`または測定時間0/missingなら算出値なし。固定閾値・SLA判定はしない |

候補測定の値と方法はL3一括承認対象で、値ごとのPO確認を追加しない。実際のworker eligibility/SLAは固定親が参照する既存source contractに従い、本候補測定で新設しない。
