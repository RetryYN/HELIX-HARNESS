# HELIX-HARNESS L3 業務要件（Stage 1: HARNESS-L2-010/011/023）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 only; HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
paired_l10: ../L10-verification/business-verification.md

固定されたStage 1の3親から独立business requirement、business owner、価値閾値、事業判断を導出しない。HARNESS-L2-010は固定L2:350に列挙する既存FRS-BR-001/002/003/005/009とHARNESS-L2-008の単体・接続・構成体の区別を束ねる。固定L2:320は、束ね直しが既存条件の所在や意味を移さないとするため、これら既存条件をfunctional-requirements.mdのFR/ACで追跡する。これはHARNESS全体にbusiness要件がないことを意味しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-010` | 独立したbusiness requirementを導出しない。固定L2:320/350が示す既存FRS条件とL2-008の区別をfunctional ACで追跡する。 | packのowner/release-unit分類はL2で定義済み。収益・製品優先順位・release decisionは本L3で決めない。 |
| `HARNESS-L2-011` | 独立したbusiness requirementを導出しない | 呼出し側の保存・表示・業務上の完了判断をHARNESSへ移さない。権限はSECURITYが所有する。 |
| `HARNESS-L2-023` | 独立したbusiness requirementを導出しない | 条件別dependency classificationから新しい利用方針やownerを作らない。 |

旧business-detailは機能要件へ一括移植せず、意味とownerを現在の固定L2で再導出する。3親の境界は上表のとおりで、収益、製品優先順位、release decision、条件別利用方針を追加しない。

## Stage 2a suffix — HARNESS-L2-022（1.0対象）

| 親L2 | business要件ID | business要件への扱い | 境界 |
|---|---|---|---|
| `HARNESS-L2-022` | `BR-HARNESS-L3-022-01` | 利用者がartifact revision/scopeごとに、段階別の成立証拠、L11の能力別内容判定、利用者受入とその記録を区別して判断できる。 | L1-001/004/005および固定L2-022にtraceする。COREの検証・受入契約の結果を示すもので、service①〜⑦の業務成果、収益・製品優先順位、独立business ownerや価値閾値を追加しない。L10/oracleから利用者受入判断や記録を生成しない。 |

旧business-detailの意味とownerはHARNESSへ一括移植せず、固定L1/L2から再導出する。本親から独立した商用成果や新しいownerは導出しない。business verificationは同じscopeの証拠を利用者が判読できるかを観測し、要求にない価値判断を作らない。
