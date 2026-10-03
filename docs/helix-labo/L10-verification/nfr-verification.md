# HELIX-LABO L10 非機能検証（部分草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。このStage 1契約確認に不要な性能SLAは追加しない。別の技術値が要件上必要な場合は、上流指定の有無にかかわらず根拠・比較・測定方法付きのL3候補として提示し、承認前の閾値をoracleへ適用しない。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXLABO-L2-001` | 20-field coverage / observed-status fidelity | source contractごとに20 fieldsを提供し、実在する各statusを個別投入。存在する1 field/statusずつ欠落/変換し、all-success snapshotも対照fixtureにする | 20 required field coverage、存在statusのdistinctness、source上の非success event脱落0、未発生statusの捏造0、unknown/not_observedのsuccess coercion 0。 |
| `HELIXLABO-L2-001` | source isolation/partial failure | 1sourceだけcorrupt/unauthorized/secret/out-of-scope、別source valid | affected source held/warning; unrelated valid source preserved; LABO writeback 0。 |
| `HELIXLABO-L2-001` | scope boundary | Web/WEB-OS 031/032契約未選択と選択ケースを分ける | 未選択時は1.0必須依存でない。選択時だけそのaccepted source contractで扱う。 |
| `HELIXLABO-L2-011` | reference roundtrip | source observation→Aggregate→Correlate→episode candidate→sourceのidentity/revisionを往復 | 全referenceが元recordへ戻り、source ID/revisionとmissingnessを保持。 |
| `HELIXLABO-L2-011` | false causality | co-timed/co-located unrelated events、missing relation/source, aggregate-only-success | correlation candidateとcausal claimが区別され、evidenceなしcausal assertion 0。 |

測定結果はfield完全性、owner境界、source revision、unknown/holdの処置などの観測値で記録する。このStage 1契約検証では、対象behaviorの合否に性能時間・容量・保持期間の閾値を要しないため新設しない。別の技術値が要件上必要なら、上流に数値指定がなくてもL3候補として根拠・比較案・測定方法を添えて通常の承認パッケージに提示し、parameterごとの承認は求めない。旧値や参考測定値を自動継承・合否閾値へ昇格させない。
