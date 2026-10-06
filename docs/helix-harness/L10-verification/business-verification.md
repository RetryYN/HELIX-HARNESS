# HELIX-HARNESS L10 業務検証設計（Stage 1: HARNESS-L2-010/011/023）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 only; HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
paired_l3: ../L3-requirements/business-requirements.md
execution_status: designed_only_not_executed

このStage 1範囲では独立business requirementがないため、別のbusiness acceptance oracleを設けない。機能contractの検証は[functional-verification.md](functional-verification.md)の同一AC IDで行う。これを事業価値、利用者受入、優先順位、release判断へ読み替えない。

| 親L2 | business検証の扱い |
|---|---|
| `HARNESS-L2-010` | 独立business oracleなし。固定L2:320は束ね直しで既存条件の所在・意味を移さないとし、:350はFRS-BR-001/002/003/005/009とL2-008の単体・接続・構成体の区別を束ねる。これらをpack owner/release-unit分類と版境界を含めfunctional-verification.mdのFR/ACで確認する。独立した事業価値・利用者受入oracleは追加しない。 |
| `HARNESS-L2-011` | 独立business oracleなし。呼出し元の保存・表示・業務完了判断をHARNESSへ移していないことを機能ACで確認する。 |
| `HARNESS-L2-023` | 独立business oracleなし。条件別dependency classificationから利用方針や新ownerを導出しないことを機能ACで確認する。 |

## Stage 2b suffix — HARNESS-L2-012/013

固定HARNESS-L2-012/013から独立business requirementを導出しないため、別個のbusiness verification case/oracleを作らない。Prototype/PoCの分離、要求形成候補、Backflow、別identity、人間判断待ちは対の[functional-verification.md](functional-verification.md)にある同じFR/AC/CASEで確認する。これらを事業価値、commercial success、利用者の要求合意、release判断へ読み替えない。旧business-detailのBR・owner・KPIはこの2親へ移さない。

## Stage 2b suffix — HARNESS-L2-014/015/016

この3親の固定範囲に独立business requirement/oracleはないため、business CASEを追加しない。template由来設計、Provisional実装とCI境界、意味保存Refactor/Backflowは対の[functional-verification.md](functional-verification.md)の同じFR/AC/CASEで確かめる。技術測定、trace、CI結果を事業価値・利用者受入・release・approvalへ読み替えず、旧business-detailのowner/KPIを追加しない。
## Stage 2a suffix — HARNESS-L2-022 業務観測

`BR-HARNESS-L3-022-01`に対応し、同一revision/scopeで段階別証拠、L11能力別内容oracle、利用者受入recordを利用者が区別できる正常fixtureを観測する。未公開の同scope artifactまたは外部artifactを未見正常例として使う。L10合格だけ、L11内容判定だけ、record欠落、recordのrevision違い、recordのscope違いを独立negativeとし、利用者受入済みの表示・判断にならないことを照合する。これは利用者に代わって受入判断・recordを生成するbusiness oracleではなく、新たな商業価値やbusiness ownerを定義しない。fixture不足は未評価とする。
## Stage 2c suffix — HARNESS-L2-030/031/032

固定030/031/032から独立business requirement/oracleを導出しないため、別個のbusiness acceptance caseは追加しない。030のproposal、031の許可failureからのcandidateとoriginal failure保持、032のselected consumerへのpacket handoffおよび責務境界は、対の[functional-verification.md](functional-verification.md)にある同一AC IDで確認する。case数/coverageやhandoffを事業価値、利用者受入、run/pass、ticket、承認へ読み替えない。旧business-detail BR-21/HM-08/KPI ownerはこれらの固定親に適用せず、再利用しない。

## Stage 4 suffix — HARNESS-L2-026/027/028/029

固定4親に独立business requirement/oracleはないため、別個のbusiness acceptance caseを追加しない。各親の設計対応、source observation、saved-design comparison、proposal境界は対の[functional-verification.md](functional-verification.md)にある同一FR/AC/CASEで照合する。これらの候補を利用者価値、商業成果、業務完了、受入やreleaseへ読み替えず、旧business-detailのowner/KPIを追加しない。

## Stage 2b 残件追補 — HARNESS-L2-017/018/019/020/024

本追補5親は未承認の起草。既承認prefixを変更せず、実行結果や下流許可を生成しない。

この5親から独立business requirement/oracleを導出しない。release/運用ownerの判断、Reverseの草稿、handoff、形成資料の十分性と人間の合意状態は対のfunctional FR/AC/CASEで確認する。販売・顧客優先順位、共通SLO、配備decision、事業価値・合意を追加しない。旧business-detailの別事業意味を本scopeへ移さない。検証対不在の一覧、引継いだ義務の回収証拠、形成資料が揃った人の確認待ちも同じ機能CASEで観測し、復旧・回収・候補提示から業務完了や承認を生成しない。

## Stage 5 suffix — HARNESS-L2-021/025/033/035/037

固定5親に独立business requirement/oracleがないため、別business CASEを追加しない。親別functional FR/AC/CASEで同一scopeを確認し、functional trace、設計candidate、repro/run結果、根拠照合、二段合流を商業成果・利用者受入・事業価値・approvalへ読み替えない。旧business-detailの別owner/KPIは移さない。

| 親L2 | business検証の扱い | 判定境界 |
|---|---|---|
| `HARNESS-L2-021` | 独立business oracleなし。構成体固有trace/運用還流はfunctional CASEで照合する。 | unit成功の合算やL12観測だけで業務達成を出さない。 |
| `HARNESS-L2-025` | 独立business oracleなし。常時connector、選択Pattern条件、横断invariantをfunctional CASEで照合する。 | 設計整合から承認・実装・利用者受入を生成しない。 |
| `HARNESS-L2-033` | 独立business oracleなし。選択operationの段階別result receiptをfunctional CASEで照合する。 | run/pass receiptを事業KPIや顧客成果にしない。 |
| `HARNESS-L2-035` | 独立business oracleなし。source根拠・受入寄与・unknown状態をfunctional CASEで照合する。 | budgetやscopeの価値判断を新設しない。 |
| `HARNESS-L2-037` | 独立business oracleなし。適用可能なscopeでphase別authorityと合流をfunctional CASEで照合する。 | 適用候補から一般業務価値や全製品への強制を導かない。 |

### Root検収補正 — Stage5 CASE境界

追加functional CASE（各親の既存001–00Nと続番S5行）は固定5親の工程・設計・根拠・適用性oracleを検証する。独立business requirement/KPI/business CASEは0件のままであり、件数や結果から事業価値、release、利用者受入、承認を生成しない。


## Stage 3 親034の業務総合検証

独立business criterion/oracle/CASEは追加しない。functional verificationの同一requirement/NFR identityとscopeを参照する。計測結果やCASE数からROI、事業成果、release、利用者Acceptedまたはapprovalを生成しない。


## Stage 3 親036の業務検証

独立business oracle/CASEは追加しない。`functional-requirements.md`の同じselected scopeとFR/ACを参照し、技術gate結果・90%運用KPI・CASE件数からROI、事業成果、release、利用者受入、承認を生成しない。旧business-detailの指標とownerは移さない。

## Stage 3 親038の業務検証

| L2親 | 独立criterion | 対応関係 |
|---|---|---|
| `HARNESS-L2-038` | 独立criterionなし | source closureをfunctional ACで照合し、technical closureを事業成果の代理にしない。 |


## Stage 3 親039の業務検証

独立business criterion/oracle/CASEは追加しない。`functional-requirements.md`の039 ACと`functional-verification.md`の同じ対象scope/revisionのfixtureを参照する。UX evidence、PoC、画面数、prototype agreement、L10–L12 observationを事業KPI、事業成果、利用者acceptance、authorityへ読み替えない。

## Stage 3 親040の業務検証

| L2親 | 独立criterion | 対応関係 |
|---|---|---|
| `HARNESS-L2-040` | 独立criterionなし | ledger catalog/template obligationの意味・traceはfunctional ACで照合。登録数や抽出数を価値基準にしない。 |

## Stage 3 親042の業務検証

| L2親 | 独立criterion | 対応関係 |
|---|---|---|
| `HARNESS-L2-042` | 独立criterionなし | 事業成果を独立に主張せず、機能ACと採択済み親要求の意味保持だけを照合する。 |

### HELIX-HARNESS L2-046 — 業務検証（Stage 3、version_target: 1.0、起草候補）

起草候補。Stage 3、`version_target: 1.0`。対象は採択済みHARNESS-L2-046のFull V workflow条件と、明示的にProduction Scrumが選択・許可されたscopeのScrum slice/backfill条件に限る。候補文書・検証fixtureは採択済みL2/L11本文や運転結果を置換せず、releaseやruntime authorityを付与しない。

**固定親とPO根拠**：親L2は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`の `docs/helix-harness/L2-requirements/product-requirements.md:1025–1035`（全file SHA-256 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、対象span SHA-256 `47cc23b066cc970427a8b9193eda3be9cc06a43f19b7cb03e6f78a0116d6e01e`）。対L11は同revisionの `docs/helix-harness/L11-acceptance/product-acceptance.md:759–771`（全file SHA-256 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、span SHA-256 `a8e99f7df7166566c04b1113b045851d8417e17e8078c034f8f2a34ebfe4f37f`）。PO判断は `17a2f310358ee7fe209b9d37cddf4a927c740248` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:51`、file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、row SHA-256 `60fb90a139b313760ad5a259e2362e3c406e071aa1dfba8ed6d21d0cb9fb55a4`。POは`HARNESS-L2-046`を採択し、registrationは`MPR-RC-HARNESS-L2-046-001`。隣接row 52の`HARNESS-L2-047`は046へ混ぜない。

**旧source境界**：旧起点はv1.3 `LEGACY-ASSET-02319C2481B9E01698D5`。§4.4 L259はFull Vのsystem workflow/L1–L5段階freezeと12 workflow条件の検証（atom S1）およびProduction Scrumのslice delta先行・Scrum Reverse/backfill時点・SR4前release-ready不可（独立atom S2）を別条件として記述する。§10 L647は両者を要約する別atomで、第三の独立条件に数えない。6fabd125 baselineの同文companionも別revisionとして保持する。旧consumerのUWJ-FR-015とL4 boundaryは確認範囲に限定し、consumer全体網羅は主張しない。 Business outcomeとしてrelease-ready、release decision、market outcomeを検証・宣言しない。

**対象**：`BR-HARNESS-L3-046-01`。選択styleとscopeに対応するworkflow evidence条件が維持されること。

| L10 case ID | L3 AC / BR | 入力・比較 | 観測 | 未評価・不合格 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-046-r12-fullv-normal` | `AC-HARNESS-L3-046-01` / `BR-HARNESS-L3-046-01` | style=Full V、対象workflow revision、適用L1–L5段階freeze、12条件とV-pair evidenceを合成入力する。 | Full V scope coverageを再構成し、Scrum delta/backfill/SR4を要求しない。 | 12条件のapplicability/oracle不明ならunknown/未評価。 |
| `CASE-HARNESS-L10-046-r12-scrum-normal` | `AC-HARNESS-L3-046-02` | 同じProduction Scrum scope/revisionの対照入力を置く。A: 既存trigger成立、sourceに定義されたbackfillとtrigger適用checkpoint/SR4がcurrent。B: 既存trigger不成立、同じsource定義のbackfillはcurrent、trigger由来checkpointは適用しないがSR4 receiptはcurrent。どちらも新しい義務を足さない。 | A/Bとも、既存sourceに定義されたbackfill対象・時点・revisionを照合し、trigger条件に従う。BもL2のSR4 release-readiness条件を入力で満たす。 | A/Bの各正常scopeを評価可能としrelease authorityは生成しない。既存trigger applicability、backfill対象/時点、receipt identityが不明ならその範囲を未評価とする。 |
| `CASE-HARNESS-L10-046-r12-fullv-no-scrum` | `AC-HARNESS-L3-046-01` | Full Vの正常baselineからScrum-specific delta/Reverse/SR0–SR4/SR4 receiptの全てを省略する。 | Full Vの段階freezeと12条件がcurrentならFull V ACを評価でき、Scrum artifact欠落だけでは拒否しない。 | 他Full V必須条件欠落は該当scope未完。 |
