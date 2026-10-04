# HELIX-INFRASTRUCTURE L3 業務要件（1.0対象親12件の草稿）

**状態：部分草稿・未承認。** 今回対象のStage 1/2a/2b 9 identity、Stage 4 2 identity、Stage 5 HELIXINFRASTRUCTURE-L2-011のうち、この文書へ独立して配置できる機構業務成果の要求は、固定L2/L11 sourceから別個の業務outcomeとして確認できなかった。機能behaviorをbusiness-detailという旧ファイル名だけで分類しない。要求本文・分類・ownerの意味を変えず、対象identityの動作・ACは対の`../L3-requirements/functional-requirements.md`に置く。

旧HELIX `business-detail.md` は、現行の業務要件候補を探す旧起点として参照した。次の旧BR-21等はHARNESS利用dashboardと集計batchの業務条件であり、現行INFRASTRUCTUREの資源状態・観測・復旧責務へ直接一致しない。したがってdashboard/集計batchを業務要件として移植・複製せず、固定L2/L11が求める資源・環境・復旧状態のbehaviorはfunctional要件と対のL10へ記録する。

Stage 1/2a/2bの対象親L2 identity: `HELIXINFRASTRUCTURE-L2-001`, `HELIXINFRASTRUCTURE-L2-002`, `HELIXINFRASTRUCTURE-L2-003`, `HELIXINFRASTRUCTURE-L2-004`, `HELIXINFRASTRUCTURE-L2-005`, `HELIXINFRASTRUCTURE-L2-006`, `HELIXINFRASTRUCTURE-L2-007`, `HELIXINFRASTRUCTURE-L2-009`, `HELIXINFRASTRUCTURE-L2-010`。Stage 5では`HELIXINFRASTRUCTURE-L2-011`を追加し、独立business ACは導出しない。

必要な業務成果条件が後続の承認済みL2から導かれる場合は本書へ追加する。今回、業務分類の新設やL2意味変更は行わない。

## Stage 4の業務分類

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| HELIXINFRASTRUCTURE-L2-008 | 独立business requirementを導出しない | design/target/actualの比較から投資・deployment承認を作らない。 |
| HELIXINFRASTRUCTURE-L2-025 | 独立business requirementを導出しない | resource mappingはassignment、配置判断、capacity投資の承認ではない。 |

## Stage 5 business scope verification

HELIXINFRASTRUCTURE-L2-011の18 item技術受入から独立business result、顧客runtime acceptance、投資承認、release authorityを生成しない。該当するowner側業務結果は別の上流条件に残す。
