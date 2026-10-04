# HELIX-HARNESS L3 業務要件（Stage 1: HARNESS-L2-010/011/023）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 only; HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
paired_l10: ../L10-verification/business-verification.md

固定されたStage 1の3親から独立business requirement、business owner、価値閾値、事業判断を導出しない。HARNESS-L2-010が束ねる既存のFRS-BR-001/002/003/005/009とHARNESS-L2-008の単体・接続・構成体の区別は、固定L2でこのStageの機能条件に分類され、functional-requirements.mdのFR/ACで追跡する。これはHARNESS全体にbusiness要件がないことを意味しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-010` | 独立したbusiness requirementを導出しない。束ねるFRS条件とL2-008の区別はL2分類に従ってfunctional ACへ対応する。 | packのowner/release-unit分類はL2で定義済み。収益・製品優先順位・release decisionは本L3で決めない。 |
| `HARNESS-L2-011` | 独立したbusiness requirementを導出しない | 呼出し側の保存・表示・業務上の完了判断をHARNESSへ移さない。権限はSECURITYが所有する。 |
| `HARNESS-L2-023` | 独立したbusiness requirementを導出しない | 条件別dependency classificationから新しい利用方針やownerを作らない。 |

旧business-detailは機能要件へ一括移植せず、意味とownerを現在の固定L2で再導出する。3親の境界は上表のとおりで、収益、製品優先順位、release decision、条件別利用方針を追加しない。
