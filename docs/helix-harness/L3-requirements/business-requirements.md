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

## Stage 2b suffix — HARNESS-L2-012/013

固定HARNESS-L2-012/013から独立した事業成果、business owner、価値閾値、commercial acceptanceを導出しない。これはHELIX-HARNESS全体にbusiness要件がないことを意味しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-012` | 独立business requirementなし。screen prototype/technical PoCの適用性・結果・Backflowはfunctional-requirements.mdのFR/ACで確認する。 | prototype/PoC成果を価値達成、事業判断、利用者要求合意、production成果へ変換しない。 |
| `HARNESS-L2-013` | 独立business requirementなし。1次/条件付き2次の根拠付き候補と人間判断待ちはfunctional FR/ACで確認する。 | 要件候補を商業成果、要求合意、承認済み要件、business ownerや価値閾値へ昇格させない。 |

旧business-detailの意味とownerはこの2親から一括移植しない。業務意味が必要な差分は固定L1/L2を起点に別途再導出し、既存範囲の追加business requirementにしない。

## Stage 2b suffix — HARNESS-L2-014/015/016

この3親から独立business requirement/oracleを導出しない。設計義務とBackflow、Provisional実装・CI境界、意味保存Refactorと上流戻しは対の[functional-requirements.md](functional-requirements.md)にある同一FR/ACで確認する。これらを事業価値、利用者受入、release、CI運転、意味変更の承認へ読み替えない。旧business-detailのowner/KPIを追加しない。

| 親L2 | business requirementの扱い | 境界 |
|---|---|---|
| `HARNESS-L2-014` | 独立business requirementなし。 | template適用・設計/Backflow条件を事業価値や利用者受入oracleへ変換しない。 |
| `HARNESS-L2-015` | 独立business requirementなし。 | Provisional成果やatomic CI結果を品質保証・システム成立・利用者受入・releaseへ昇格させない。 |
| `HARNESS-L2-016` | 独立business requirementなし。 | Refactor/性能比較の技術結果から製品価値やbusiness ownerを発明しない。 |
## Stage 2a suffix — HARNESS-L2-022（1.0対象）

| 親L2 | business要件ID | business要件への扱い | 境界 |
|---|---|---|---|
| `HARNESS-L2-022` | `BR-HARNESS-L3-022-01` | 利用者がartifact revision/scopeごとに、段階別の成立証拠、L11の能力別内容判定、利用者受入とその記録を区別して判断できる。 | L1-001/004/005および固定L2-022にtraceする。COREの検証・受入契約の結果を示すもので、service①〜⑦の業務成果、収益・製品優先順位、独立business ownerや価値閾値を追加しない。L10/oracleから利用者受入判断や記録を生成しない。 |

旧business-detailの意味とownerはHARNESSへ一括移植せず、固定L1/L2から再導出する。本親から独立した商用成果や新しいownerは導出しない。business verificationは同じscopeの証拠を利用者が判読できるかを観測し、要求にない価値判断を作らない。
## Stage 2c suffix — HARNESS-L2-030/031/032

固定030/031/032から独立したbusiness requirement、business owner、価値閾値または事業判断を導出しない。機能contractと業務境界は[functional-requirements.md](functional-requirements.md)の親別FR/ACで確認する。これはHELIX-HARNESS全体にbusiness要件がないことを意味しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-030` | 独立business requirementなし。test case proposalとprovenanceは機能要件で確認する。 | 生成case数・coverageを事業価値、品質証明、利用者受入と読み替えない。 |
| `HARNESS-L2-031` | 独立business requirementなし。許可failure inputからのcandidateとoriginal failure保持は機能要件で確認する。 | production incident限定、severity/KPI、事業効果の新しいownerや閾値を追加しない。 |
| `HARNESS-L2-032` | 独立business requirementなし。選択consumerへのschema-bound packet handoffは機能要件で確認する。 | deliveryを業務完了、run/pass、ticket、承認または利用者受入と扱わない。CONNECTの責務を032 business ownerへ移さない。 |

旧business-detailは参考範囲を読んだが、BR-21/HM-08/Learning Engineの業務意味・owner・KPIはこれら固定親に対応しないため移さない。Stage 2c草稿から商業価値や追加承認条件を作らない。

## Stage 4 suffix — HARNESS-L2-026/027/028/029

この4親から独立business requirement、business owner、事業価値閾値、commercial acceptanceは導出しない。設計・source observation・差分・proposalの意味と境界は対の[functional-requirements.md](functional-requirements.md)にあるFR/ACで確認する。旧business-detailの業務意味・owner・KPIは固定親に対応する根拠がないため再利用しない。これはHARNESS全体にbusiness要件がないことを意味しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-026` | 独立business requirementなし。既存requirementと設計要素の対応はFR/ACで確認する。 | 設計の存在から利用者価値、受入、product優先順位を導出しない。 |
| `HARNESS-L2-027` | 独立business requirementなし。選択sourceからの静的観測とunknown保持はFR/ACで確認する。 | 観測候補を業務上の正しさ、顧客成果、完了に読み替えない。 |
| `HARNESS-L2-028` | 独立business requirementなし。saved designとの比較・影響範囲はFR/ACで確認する。 | affected setやbackflowを事業判断、要求承認、release判定としない。 |
| `HARNESS-L2-029` | 独立business requirementなし。五要素のproposal bundleと責務境界はFR/ACで確認する。 | proposalを実変更、migration完了、事業成果、利用者受入へ昇格しない。 |

## Stage 2b 残件追補 — HARNESS-L2-017/018/019/020/024

本追補5親は未承認の起草。既承認prefixを変更せず、実行結果や下流許可を生成しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-017` | 独立したbusiness requirementを導出しない | Release Portと適格条件は親に従い、販売・顧客優先順位・配備決定を追加しない。 |
| `HARNESS-L2-018` | 独立したbusiness requirementを導出しない | 運用品質要求のownerは製品側にあり、共通SLOや費用閾値をHARNESSが決定しない。 |
| `HARNESS-L2-019` | 独立したbusiness requirementを導出しない | 既存成果の逆方向変換は企画・事業判断を自動承認しない。 |
| `HARNESS-L2-020` | 独立したbusiness requirementを導出しない | 隣接リリース単位handoffの互換性確認から新しい価値基準や優先順位を作らない。 |
| `HARNESS-L2-024` | 独立したbusiness requirementを導出しない | 質問優先と形成資料の十分性は工程契約であり、事業価値・優先順位・人間の合意を推定しない。 |

## Stage 5 suffix — HARNESS-L2-021/025/033/035/037

この5親から独立したbusiness requirement、business owner、事業価値/KPI閾値を導出しない。021の端から端利用価値も、固定L2/L11の構成体固有functional obligationとして対の[functional-requirements.md](functional-requirements.md)に置く。025設計整合、033 case/repro trace、035根拠照合、037適用時の二段設計は機能・authority境界であり、業務上の成果値ではない。旧business-detailの別業務意味・owner・KPIは再利用しない。これはHARNESS全体にbusiness要件がないことを意味しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-021` | 独立business requirementなし。端から端traceと構成体固有義務をfunctional FR/ACで確認する。 | 個別unit成功、L12観測、LABO提案を事業成果・製品価値・利用者受入に読み替えない。 |
| `HARNESS-L2-025` | 独立business requirementなし。設計compositeのrelation/invariantをfunctional FR/ACで確認する。 | 設計の存在・Pattern選択を事業判断、承認、受入と扱わない。 |
| `HARNESS-L2-033` | 独立business requirementなし。selected case/repro/regression traceをfunctional FR/ACで確認する。 | case数、run、passをKPI、事業効果、利用者受入としない。 |
| `HARNESS-L2-035` | 独立business requirementなし。上流根拠、受入寄与、代替、budget状態の照合をfunctional FR/ACで確認する。 | budget unknownを0/無制限とせず、候補根拠から事業優先度や承認を作らない。 |
| `HARNESS-L2-037` | 独立business requirementなし。適用時の二段scope/pair/合流をfunctional FR/ACで確認する。 | 二段工程を商業価値・全agent対象の必須条件・利用者受入としない。 |

### Root検収補正 — Stage5 CASE境界

追加functional CASE（各親の既存001–00Nと続番S5行）は固定5親の工程・設計・根拠・適用性oracleを検証する。独立business requirement/KPI/business CASEは0件のままであり、件数や結果から事業価値、release、利用者受入、承認を生成しない。


## Stage 3 親034の業務要件

HARNESS-L2-034から独立business requirement、事業KPI、ROI閾値または事業ownerを作らない。対象別metric contractと完成判定はfunctional FR/ACで扱う。計測結果、coverage、case数、CI結果を事業価値、利用者受入、承認へ読み替えない。旧business-detailにある別の意味は移植しない。


## Stage 3 親036の業務要件

`HARNESS-L2-036`はCOREの検証契約を扱うため、独立business requirement、business owner、事業価値閾値、商業acceptanceを導出しない。W/cross-detection、local/CI parity、画面条件付き検証の結果を製品価値・事業判断へ読み替えない。旧business-detailのBR-21/Learning Engine評価を本親へ移植しない。

## Stage 3 親038の業務要件

| L2親 | business requirement | 理由 |
|---|---|---|
| `HARNESS-L2-038` | 独立したbusiness requirementを導出しない | reverse content closureは選択scopeの意味traceであり、事業判断を新設しない。 |


## Stage 3 親039の業務要件

`HARNESS-L2-039`から独立business requirement、business owner、事業価値/KPI閾値は導出しない。Experience graphやUI/Frontend contractは固定L2-039の機能・構成体義務であり、traceの存在、画面数、case数、PoC、prototype agreement、UX計測結果から事業成果・利用者受入・承認を生成しない。旧business-detailの別意味・ownerは本親へ移さない。

## Stage 3 親040の業務要件

| L2親 | business requirement | 理由 |
|---|---|---|
| `HARNESS-L2-040` | 独立したbusiness requirementを導出しない | ledger catalogは組織の事業分類・投資優先順位を所有しない。 |

## Stage 3 親042の業務要件

| L2親 | business requirement | 理由 |
|---|---|---|
| `HARNESS-L2-042` | 独立したbusiness requirementを導出しない | Design Refactor判定とepisode境界は固定された要求・設計・検証契約の保持条件であり、事業成果や価値閾値を新設しない。 |


## Stage 3 親041の業務要件

HARNESS-L2-041から独立business requirement、business owner、ROI/KPI/商業閾値は導出しない。template atom/gap/candidate rowの存在、coverage、fixture数から事業価値・利用者受入・要求合意・承認を作らない。
