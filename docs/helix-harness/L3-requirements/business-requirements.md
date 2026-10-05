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

## Stage 3 business範囲

この1.0 sliceの13固定親から独立したbusiness requirement/oracleは導出しない。各親の業務意味を否定せず、売上・ROI・市場価値・事業優先順位・利用者受入を機能/NFR測定から作らない。各親の機能条件は対のfunctional verificationにある同一ACで照合する。

| 固定親 | 業務要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-034` | 独立したbusiness requirementを導出しない | metric/完成判定契約は技術verification責務。収益・ROIの基準を作らない。 |
| `HARNESS-L2-036` | 独立したbusiness requirementを導出しない | selected verification scopeの完全性から製品価値や全ticket一律policyを推定しない。 |
| `HARNESS-L2-038` | 独立したbusiness requirementを導出しない | reverse content closureは選択scopeの意味traceであり、事業判断を新設しない。 |
| `HARNESS-L2-039` | 独立したbusiness requirementを導出しない | Experience/UI relationから見た目の優先順位や市場価値を推定しない。 |
| `HARNESS-L2-040` | 独立したbusiness requirementを導出しない | ledger catalogは組織の事業分類・投資優先順位を所有しない。 |
| `HARNESS-L2-041` | 独立したbusiness requirementを導出しない | template obligation/gapは事業要望や採否を作らない。 |
| `HARNESS-L2-042` | 独立したbusiness requirementを導出しない | refactor routeから費用対効果・事業継続判断を推定しない。 |
| `HARNESS-L2-043` | 独立したbusiness requirementを導出しない | example adequacyは業務成功率・顧客価値のthresholdを持たない。 |
| `HARNESS-L2-044` | 独立したbusiness requirementを導出しない | obligation portfolioは最小費用/投資判断のbusiness ownerを代替しない。 |
| `HARNESS-L2-046` | 独立したbusiness requirementを導出しない | workflow/Scrum適用はPOが選択したstyle範囲を保持し、事業方式を再選択しない。 |
| `HARNESS-L2-047` | 独立したbusiness requirementを導出しない | specialist benefit evidenceは調達・要員・ROI判断を生成しない。 |
| `HARNESS-L2-049` | 独立したbusiness requirementを導出しない | prototype measurementからユーザー合意、market fit、製品価値を推測しない。 |
| `HARNESS-L2-054` | 独立したbusiness requirementを導出しない | handoff candidateはassignment/実行開始を承認せず、事業責務をOSへ移さない。 |
