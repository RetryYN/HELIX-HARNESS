# HELIX-LABO L10 非機能検証（部分草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。上流にない性能SLAは追加せず、ここで書いた完備性・誤り0候補だけをoracle候補として照合する。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXLABO-L2-001` — 20-field and 7-status completeness | source contractごとに20 fieldsを提供し、status 7種類を別々に投入。1 field/statusずつ欠落/変換 | 20 required field coverage、7 status distinct、unknown/not_observed success coercion 0。 |
| `HELIXLABO-L2-001` — source isolation/partial failure | 1sourceだけcorrupt/unauthorized/secret/out-of-scope、別source valid | affected source held/warning; unrelated valid source preserved; LABO writeback 0。 |
| `HELIXLABO-L2-001` — scope boundary | Web/WEB-OS 031/032契約未選択と選択ケースを分ける | 未選択時は1.0必須依存でない。選択時だけそのaccepted source contractで扱う。 |
| `HELIXLABO-L2-011` — reference roundtrip | source observation→Aggregate→Correlate→episode candidate→sourceのidentity/revisionを往復 | 全referenceが元recordへ戻り、source ID/revisionとmissingnessを保持。 |
| `HELIXLABO-L2-011` — false causality | co-timed/co-located unrelated events、missing relation/source, aggregate-only-success | correlation candidateとcausal claimが区別され、evidenceなしcausal assertion 0。 |

測定結果はfield完全性、owner境界、source revision、unknown/holdの処置などの観測値で記録する。性能時間・容量・保持期間の合否値がL2/L11にない場合、測定値は参考情報として保持し、閾値へ昇格させない。候補値は通常のL3承認パッケージにまとめ、parameterごとの承認を求めない。
