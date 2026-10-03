# HELIX-BRAIN L10 非機能検証（部分草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。上流にない性能SLAは追加せず、ここで書いた完備性・誤り0候補だけをoracle候補として照合する。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` | required field coverage | 正常記録で8/8由来fieldを解決でき、各fieldを1つずつ欠落/stale/revision不一致にする | source/evidence/scope/evaluationが不足するごとにcandidateのまま、accepted/matureへの誤遷移0。 |
| `HELIXBRAIN-L2-007` | false promotion | AI-generated-only、single successのみ、counterexample/limitationなし、LABO revision mismatchを個別に投入 | accepted/matureへの遷移がなく、不足元owner/fieldを観測可能。 |
| `HELIXBRAIN-L2-008` | state distinction and pin stability | 5 L2 stateをそれぞれ適用し、consumer Rをpinした後でRをsupersededとしてR2を追加 | 各state識別、既存consumer R保持、OS usageとBRAIN state別owner。 |
| `HELIXBRAIN-L2-008` | unknown handling | unknown identity/revision/stateおよびversion_targetを実版として差し替える | currentへの推測解決・version_target受入・owner間のwritebackがない。 |
| `HELIXBRAIN-L2-028` | range and identity matrix | 共通HARNESS contractのrange内/外/欠落/解釈不能、descriptorとknowledgeのfieldを独立変異 | 内側のみ適用可能、外/unknown拒否またはunknown、field cross-substitutionがない。 |
| `HELIXBRAIN-L2-028` | boundary ownership | common rollback/unfinished-obligationをBRAIN responseへ要求 | HARNESS共通契約への返却を観測しBRAINが再定義しない。 |

測定結果はfield完全性、owner境界、source revision、unknown/holdの処置などの観測値で記録する。性能時間・容量・保持期間の合否値がL2/L11にない場合、測定値は参考情報として保持し、閾値へ昇格させない。候補値は通常のL3承認パッケージにまとめ、parameterごとの承認を求めない。
