# HELIX-HARNESS L3 業務要件

status: approved
approval: approved（[L3／L10 PO事後確認一覧](../../governance/l3-l10-po-post-confirmation.md)）
scope: Stage 1（HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023）を起点とし、後続Stageの節を追補。各節の対象親は[L3／L10 PO事後確認一覧](../../governance/l3-l10-po-post-confirmation.md)を正とする
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

本追補5親は承認済み。既承認prefixを変更せず、実行結果や下流許可を生成しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-017` | 独立したbusiness requirementを導出しない | Release Portと適格条件は親に従い、販売・顧客優先順位・配備決定を追加しない。 |
| `HARNESS-L2-018` | 独立したbusiness requirementを導出しない | 運用品質要求のownerは製品側にあり、共通SLOや費用閾値をHARNESSが決定しない。 |
| `HARNESS-L2-019` | 独立したbusiness requirementを導出しない | 既存成果の逆方向変換は企画・事業判断を自動承認しない。 |
| `HARNESS-L2-020` | 独立したbusiness requirementを導出しない | 隣接リリース単位handoffの互換性確認から新しい価値基準や優先順位を作らない。 |
| `HARNESS-L2-024` | 独立したbusiness requirementを導出しない | 質問優先と形成資料の十分性は工程契約であり、事業価値・優先順位・人間の合意を推定しない。 |

## Stage 5 suffix — HARNESS-L2-021/025/033/035/037

この5親から独立したbusiness requirement、business owner、事業価値/KPI閾値を導出しない。021の端から端利用価値も、固定L2/L11の構成体固有functional obligationとして対の[functional-requirements.md](functional-requirements.md)に置く。025設計整合、033 case/repro trace、035根拠照合、037適用時の二段設計は機能・authority境界であり、業務上の成果値ではない。025-S5-062/063/065/066および033-S5-043/044もfunctional authority CASEであり、独立business outcomeではない。旧business-detailの別業務意味・owner・KPIは再利用しない。これはHARNESS全体にbusiness要件がないことを意味しない。

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| `HARNESS-L2-021` | 独立business requirementなし。端から端traceと構成体固有義務をfunctional FR/ACで確認する。 | 個別unit成功、L12観測、LABO提案を事業成果・製品価値・利用者受入に読み替えない。 |
| `HARNESS-L2-025` | 独立business requirementなし。設計compositeのrelation/invariantとL2要求合意・L3要件承認・設計承認・実装許可の非生成をfunctional FR/ACで確認する。 | 設計の存在・Pattern選択を事業判断、承認、許可、受入と扱わない。 |
| `HARNESS-L2-033` | 独立business requirementなし。selected case/repro/regression traceとtest pass/Integrated/Verifiedの非生成をfunctional FR/ACで確認する。 | case数、run、passをKPI、事業効果、利用者受入としない。 |
| `HARNESS-L2-035` | 独立business requirementなし。上流根拠、受入寄与、代替、budget状態の照合と実装/実行許可の非生成をfunctional FR/ACで確認する。 | budget unknownを0/無制限とせず、候補根拠から事業優先度や承認・許可を作らない。 |
| `HARNESS-L2-037` | 独立business requirementなし。適用時の二段scope/pair/合流と設計承認・L3要件承認・実装許可の非生成をfunctional FR/ACで確認する。 | 二段工程を商業価値・全agent対象の必須条件・承認・利用者受入としない。 |

### Root検収補正 — Stage5 CASE境界

追加functional CASE（各親の既存001–00Nと続番S5行）は固定5親の工程・設計・根拠・適用性oracleを検証する。025-S5-040/041、033-S5-045–047、035-S5-046、037-S5-062–064を含むauthority非生成caseは対のfunctional-verification.mdで追跡する。独立business requirement/KPI/business CASEは0件のままであり、件数や結果から事業価値、release、利用者受入、承認を生成しない。


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

## Stage 3 親047の業務要件

| L2親 | business requirement | 理由 |
|---|---|---|
| `HARNESS-L2-047` | 独立business requirementを導出しない | specialist必要性の測定とruntime-neutral契約生成は固定要求の機能責務であり、別の業務成果や固定team-sizeを追加しない。 |

## Stage 3 親049の業務要件

**採択済み固定親**：PO `po-decision-2026-09-30-live26.md:39,72`の登録`MPR-RC-HARNESS-L2-049-003`。source_repository_revision `ea6f756f96a7370de78e412d737c7a7ed472114a`、L2 `product-requirements.md:1070–1092` SHA-256 `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116`、L11 `product-acceptance.md:802–814` SHA-256 `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7`。旧318のL11および登録-002を親にしない。

`HARNESS-L2-049`の採択意味は、入力されたrenderable prototypeの画面表示を選択scopeで計測し、機械検査の精度材料とprofile根拠の文言findingを返す範囲に限る。独立した事業価値、business owner、ROI、利用者受入KPI、release判断を追加しない。計測結果、profile上の文言finding、CASE数、fixture数、LABO精度評価は要求採択や事業受入を生成しない。

### HELIX-HARNESS L2-044 — 業務要件（Stage 3、version_target: 1.0）

承認済み。Stage 3、`version_target: 1.0`。POがHARNESS-L2-044に条件付き採択したB route / Design Contract Portfolioを対象とする。本節は実装・実行・個別部品配置・設計成立を表さない。

**固定親・判断根拠**：L2親は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`の `docs/helix-harness/L2-requirements/product-requirements.md:1002–1014`、全file SHA-256 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、span SHA-256 `b005641da8a8dffac0bbddd33b5ef71762f7a9c221fa31b23cb1bb2111e1a26d`。 L11対は同revisionの `docs/helix-harness/L11-acceptance/product-acceptance.md:735–745`、全file SHA-256 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、span SHA-256 `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8`。 PO判断は `17a2f310358ee7fe209b9d37cddf4a927c740248` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:49`、SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、line SHA-256 `212948ea669ed647a3a3b188b0efb39a9e2d2fdf020e7be5cd8f088fac79807b`、registration `MPR-RC-HARNESS-L2-044-002`。POはB route / Design Contract Portfolioを条件付き採択し、採択済み025/026へ無断追記しない。

**旧sourceと処置**：旧起点はHIL-FR-54、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:144`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line/span SHA-256 `b8c3eb6a8d4e25985f97f95281851e79a0cf6bf6576d3d6a074abdb1df97b070`。旧HIL-FR-55は別要求として043に残り、044へ移さない。 HR-FR-HIL-20/HAT-HIL-20/HOT-HIL-50等のpaired consumerは広い複合要求なので、044へ全量移管したとは扱わない。 旧FR-54のrequirement atom一件から、選択scopeの義務classとnormative contractのcoverageを対応付ける意味を再導出する。旧portfolio schema、runtime、完了状態、実装名は再利用しない。旧consumer行、旧HAT/HOT/IR ledgerはscope境界の確認に使い、044全体の要求へ転用しない。

**BR-HARNESS-L3-044-01 — scope付きportfolio候補を説明可能にする**：選択されたHARNESS要求revisionとdesign scopeについて、適用義務class、契約割当、再利用／delta／新規／根拠付き非適用の区分、および未被覆・意味重複の理由を同じscope/revisionへ結び付けて提示する。これはHARNESS工程内の設計coverage資料であり、経済価値、製品優先順位、release判断、POの採択状態を追加しない。

**対象・境界**：固定L2-044のscopeに限る。HARNESS-L2-009のtemplate適用・義務導出、041のatom抽出、026のunit設計とpair oracle、025のgeneric composite整合、043のexample coverageを再実装しない。025/026は固定済み候補の成果を入力として参照できるが、その完了を044が生成・代替せず、044も025/026を変更しない。HARNESS-L2-045は対象外。

**旧source処置記録**：HIL-FR-54の「class-wise coverage」「再利用／delta／新規／N/A」「uncovered/duplicate」を意味再導出。HIL-FR-55のexample positive/negativeは保持対象外で043のscopeへ置く。HR-FR-HIL-20、HOT-HIL-50、HAT-HIL-20の複合workflow全体は再利用せず、対象のslice境界確認に限定する。

## Stage 3 親043の業務要件

| L2親 | business requirement | 理由 |
|---|---|---|
| `HARNESS-L2-043` | 独立したbusiness requirementを導出しない | 例coverageは選択scopeのverification adequacyであり、別の事業成果や価値閾値を追加しない。 |

## Stage 3 親046の業務要件

承認済み。Stage 3、`version_target: 1.0`。対象は採択済みHARNESS-L2-046のFull V workflow条件と、明示的にProduction Scrumが選択・許可されたscopeのScrum slice/backfill条件に限る。候補文書・検証fixtureは採択済みL2/L11本文や運転結果を置換せず、releaseやruntime authorityを付与しない。

**固定親とPO根拠**：親L2は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`の `docs/helix-harness/L2-requirements/product-requirements.md:1025–1035`（全file SHA-256 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、対象span SHA-256 `47cc23b066cc970427a8b9193eda3be9cc06a43f19b7cb03e6f78a0116d6e01e`）。対L11は同revisionの `docs/helix-harness/L11-acceptance/product-acceptance.md:759–771`（全file SHA-256 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、span SHA-256 `a8e99f7df7166566c04b1113b045851d8417e17e8078c034f8f2a34ebfe4f37f`）。PO判断は `17a2f310358ee7fe209b9d37cddf4a927c740248` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:51`、file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、row SHA-256 `60fb90a139b313760ad5a259e2362e3c406e071aa1dfba8ed6d21d0cb9fb55a4`。POは`HARNESS-L2-046`を採択し、registrationは`MPR-RC-HARNESS-L2-046-001`。隣接row 52の`HARNESS-L2-047`は046へ混ぜない。

**旧sourceの処置**：旧起点はv1.3 `LEGACY-ASSET-02319C2481B9E01698D5`。§4.4 L259はFull Vのsystem workflow/L1–L5段階freezeと12 workflow条件の検証（atom S1）およびProduction Scrumのslice delta先行・Scrum Reverse/backfill時点・SR4前release-ready不可（独立atom S2）を別条件として記述する。§10 L647は両者を要約する別atomで、第三の独立条件に数えない。6fabd125 baselineの同文companionも別revisionとして保持する。旧consumerのUWJ-FR-015とL4 boundaryは確認範囲に限定し、consumer全体網羅は主張しない。 意味条件は現行Full V／Scrum選択scopeへ再導出し、旧v1.3 runtime、ticket graph、workflow instance/schemaは置換する。ScrumはFull Vから推論せず、L2-002/003に沿った選択styleまたは許可された合成入力から判定する。

**BR-HARNESS-L3-046-01 — 選択styleに応じたworkflow evidenceの扱いを保つ**：各workflow scopeの選択styleとtarget revisionに沿って、適用する全体workflow・設計freeze・V-pair検証を確認できる。Full Vはsystem全体workflowのL1–L5段階freezeと12条件を扱い、Scrum slice/backfill/SR4条件を課さない。Production Scrumまたは許可合成内Scrumは、該当するslice delta・既存trigger・backfill・SR4状態をscope/revisionへ結び付ける。checkpoint receiptの適用は既存triggerに従う一方、Production Scrumまたは許可合成内でScrumを適用するscopeでは、SR4 receiptがmissing/unknownならtrigger成立有無にかかわらずrelease-readyと主張できない。これは事業成果・市場投入判断・release許可を追加しない。

**Business境界**：方式選択は既存L2-002/003とPOの方式定義に従う。候補出力は方式選択、L2合意、要件承認、OS記録、release decisionを変更しない。Full V／Scrum双方に当てはまる成果値、追加gate、工程数は作らない。

## Stage 3 親054の業務要件：専門Worker判定・契約のOS割当handoff（version_target: 1.0）

**採択本文の固定**：PO記録のsource_repository_revision `5aa100319361b0cc86edd3c51815ec777d55410a`。L2 `product-requirements.md:1154–1162` SHA-256 `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193`、L11 `product-acceptance.md:865–875` SHA-256 `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0`。旧調査snapshot e94838f5の同本文とbyte一致。末尾空行込みの物理span digestは別の監査pinとして区別する。

**状態と根拠**：本節はHARNESS-L2-054／L11-054の意味をL3要件とL10 oracleへ再導出する節であり、承認済みである。POの決定記録 `MPR-RC-HARNESS-L2-054-001` は採択（判断記録revision `b0b0719dfe786370e9bee48c5d2f753710546b6f`、PO row 34）。固定L2/L11本文に残る「未採択候補」は当時の本文メタデータであり、この後のPO決定を覆さない。L2-047は別親で、その既存のmuster判断を受け渡すだけで意味を変更しない。PO-047条件判断や別親の採択を本節から生成しない。

**旧sourceとの扱い**：旧HIL-BR-09/30、HIL-FR-59/60/61/62/63の対応を起点に、工程・入力・必要性判断・runtime-neutral契約・OS handoffへ責務を再導出する。旧runtime固有projectionや旧TeamDefinition schemaは再利用しない。旧100 CASE IDとraw literalは監査用に保持し、現行fixture条件は固定L2/L11に沿って再導出する。旧source全体、旧runtime/testの実行、旧要件の全件closureを主張しない。HIL-FR-63の歴史的effort defaultは旧sourceにとどめ、1.0の技術値や閾値へ前倒ししない。

**責務とauthority**：HARNESSはprocess/verificationの意味、muster必要性判断、runtime-neutral contract内容と型付きhandoffを所有する。OSは正規のassignment発行者であり、assignment、profile、budget/deadline、lifecycle、実行と結果を既存契約の範囲で所有する。INTELLIGENCEはplacement proposal、LABOはevidenceの適用可能性、SECURITYはoperation authority・制約・隔離を所有する。HARNESSがOS assignmentを発行したりWorkerを起動したりしない。通常の既存roleへのOS assignmentは許される。`existing_role_sufficient`なら追加specialist contractも追加specialist assignmentも生成しない。

**型付きhandoffの候補条件**：対象task/ticket identity、scope、要求/oracle revision、`layer × drive`の意味対応・source/revision・適用範囲、process phase、task-kind、verification pattern、design obligation/oracle、domain/risk、judgment-pack revision、single-worker比較条件、適用可能なLABO evidenceと未評価状態を保持する。必要な場合のみINTELLIGENCE proposal、OS profile/budget/deadline/lifecycle、SECURITY authority/制約への参照を結ぶ。`muster_candidate`は契約参照（複数の場合はその全体集合）と対応するinput/output digest、複数参照時の集合digest、generation-rule revision、理由、比較対象/evidence、guard結果を同じscope/revisionに結ぶ。複数contractが適用されるときは参照全体集合と対応する集合digestを入力source値と出力で照合する。digestの算法、wire format、enum、固定worker数、threshold、TeamDefinition、provider/runtime固有fieldは新設しない。receiptやdigest自体はauthorityではない。

`existing_role_sufficient`は入力にある対象既存role参照と比較根拠を値として返し、両値が同一task/scope/revisionに対応する入力値と一致することを照合する。specialist contractを含めず、既存roleへの通常assignmentはOSが発行する。この分岐から追加specialist assignmentや新規Worker起動を生成しない。`unknown_or_defer`は不足・不確実・staleの条件、既知の責務区分、再照合に必要な入力を入力値に対応させて返し、それぞれが同じtask/scope/revisionに一致することを照合する。既知の責務区分へ個体identityの特定有無にかかわらず不足を返し、個別source identityやowner identityが特定できないときはその個体だけunknownのまま別記する。ownerの新設、値の推定、unknown軸の別軸への畳込みをしない。OS応答/assignmentが欠落、対象不一致、revision不一致または条件不明ならhandoffは未完である。

### 業務要件 `BR-HARNESS-L3-054`

HARNESS-L2-054で採択されたconnection範囲内で、L2-047のmuster判断・runtime-neutral contract意味を、assignmentを所有するOSへ追跡可能にhand offする。これはHARNESS独立の新たな業務成果、採択権限、specialist起動権限を追加しない。OSによる既存role assignmentをHARNESSが代行せず、existing-role-sufficient時に追加specialistを作らない。

この親は新たな利用者成果・業務outcomeを定義しない。対象scopeはL2-054のtask/scope/revision結合、型付きhandoffとcause-specific deferまで。配置、必須artifact、要求意味の変更は現候補の外でありPO decisionへ戻す。
