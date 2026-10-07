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
| `HARNESS-L2-025` | 独立business oracleなし。常時connector、選択Pattern条件、横断invariant、L2要求合意/L3要件承認/設計承認/実装許可の非生成をfunctional CASEで照合する。 | 設計整合から承認・許可・実装・利用者受入を生成しない。 |
| `HARNESS-L2-033` | 独立business oracleなし。選択operationの段階別result receiptとtest pass/Integrated/Verifiedの非生成をfunctional CASEで照合する。 | run/pass receiptを事業KPIや顧客成果にせず、生成/handoffから進行状態を作らない。 |
| `HARNESS-L2-035` | 独立business oracleなし。source根拠・受入寄与・unknown状態と実装/実行許可の非生成をfunctional CASEで照合する。 | budgetやscopeの価値判断を新設しない。 |
| `HARNESS-L2-037` | 独立business oracleなし。適用可能なscopeでphase別authority、合流、設計承認/L3要件承認/実装許可の非生成をfunctional CASEで照合する。 | 適用候補から一般業務価値や全製品への強制を導かない。 |

### Root検収補正 — Stage5 CASE境界

追加functional CASE（各親の既存001–00Nと続番S5行）は固定5親の工程・設計・根拠・適用性oracleを検証する。025-S5-040/041、033-S5-045–047、035-S5-044/045/046、033-S5-039〜042、025-S5-062/063/065/066、033-S5-043/044、037-S5-062–064のauthority boundaryは対のfunctional-verification.mdで検証し、business CASEへ重複計上しない。独立business requirement/KPI/business CASEは0件のままであり、件数や結果から事業価値、release、利用者受入、承認を生成しない。


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


## Stage 3 親041の業務検証

独立business criterion/oracle/CASEは追加しない。`functional-requirements.md`の固定L2-041 scopeとFR/ACを参照し、atom数/gap数/coverage/fixture数からROI、事業成果、利用者受入、要求合意、承認を生成しない。

## Stage 3 親047の業務検証

| L2親 | 独立criterion | 対応関係 |
|---|---|---|
| `HARNESS-L2-047` | 独立criterionなし | 事業成果を作らず、必要性判断/契約の機能ACと既存owner境界を照合する。 |

## Stage 3 親049の業務検証

**採択済み固定親**：PO `po-decision-2026-09-30-live26.md:39,72`の登録`MPR-RC-HARNESS-L2-049-003`。source_repository_revision `ea6f756f96a7370de78e412d737c7a7ed472114a`、L2 `product-requirements.md:1070–1092` SHA-256 `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116`、L11 `product-acceptance.md:802–814` SHA-256 `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7`。旧318のL11および登録-002を親にしない。

| 観点 | 判定 | 禁止する読み替え |
|---|---|---|
| 049の採択意味 | 入力済みrenderable prototypeの画面表示計測、機械検査の精度材料、profile根拠の文言findingに限る。 | この範囲を独立business requirement/KPI/ROIへ広げず、render pass、CASE数、精度fixtureを事業成果・release判断にしない。 |
| 要求受入 | 既存authorityに属する人の要求受入decisionを測定結果から生成しない。 | machine pass、LABO評価、POのL2採択からL3要件承認や利用者acceptanceを推定しない。 |
| locale/device/view | 選択scope単位の機械観測状態を記録する。 | 特定locale/device/viewの観測を、未選択条件または要求受入の証明にしない。 |

### HELIX-HARNESS L2-044 — 業務検証（Stage 3、version_target: 1.0、起草候補）

起草候補。Stage 3、`version_target: 1.0`。POがHARNESS-L2-044に条件付き採択したB route / Design Contract Portfolioを対象とする。この候補はL3承認・実装・実行・個別部品配置・設計成立を表さない。

**固定親・判断根拠**：L2親は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`の `docs/helix-harness/L2-requirements/product-requirements.md:1002–1014`、全file SHA-256 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、span SHA-256 `b005641da8a8dffac0bbddd33b5ef71762f7a9c221fa31b23cb1bb2111e1a26d`。 L11対は同revisionの `docs/helix-harness/L11-acceptance/product-acceptance.md:735–745`、全file SHA-256 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、span SHA-256 `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8`。 PO判断は `17a2f310358ee7fe209b9d37cddf4a927c740248` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:49`、SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、line SHA-256 `212948ea669ed647a3a3b188b0efb39a9e2d2fdf020e7be5cd8f088fac79807b`、registration `MPR-RC-HARNESS-L2-044-002`。POはB route / Design Contract Portfolioを条件付き採択し、採択済み025/026へ無断追記しない。

**旧source・責務境界**：旧起点はHIL-FR-54、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:144`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line/span SHA-256 `b8c3eb6a8d4e25985f97f95281851e79a0cf6bf6576d3d6a074abdb1df97b070`。旧HIL-FR-55は別要求として043に残り、044へ移さない。 HR-FR-HIL-20/HAT-HIL-20/HOT-HIL-50等のpaired consumerは広い複合要求なので、044へ全量移管したとは扱わない。 旧HR-FR-HIL-20/HAT-HIL-20/HOT-HIL-50は複数要求を束ねるconsumerであり、044の独立business outcomeや受入実行記録として扱わない。HARNESS-L2-044はscope付きportfolio coverage候補を作成する。PO採択、設計決定、release outcomeはこの検証対象でない。

**対象business requirement**：`BR-HARNESS-L3-044-01`。同一要求revision/scopeの義務class、contract、reuse/delta/new/reasoned-N/A、uncovered/duplicate根拠を説明できること。新しい収益・優先順位・導入価値条件は設けない。

**主fixtureの参照**：以下はfunctional-verification.mdにある主CASEのbusiness観点の索引で、CASEを再定義しない。入力・単独変異・期待値は主CASEをそのまま照合し、独立fixtureとして重複計上しない。

**不足時の返却**：要求意味・authority不足は既存要求owner、template適用と義務導出不足はHARNESS-L2-009/対象template owner、atom抽出不足はHARNESS-L2-041、具体設計・delta relationと対oracle不足はHARNESS-L2-026/022等の原因別既存責務区分へ返す。責務区分を確定できない意味/authority不足は既存要求ownerへ返す。個体source/owner identity不明は別にunknownを保持し、既知区分への返却を止めない。不足scopeは未完/未評価に保ちportfolio closureを主張しない。

| 主fixture参照 | L3 AC / BR | business観点 |
|---|---|---|
| `CASE-HARNESS-L10-044-r16-normal-nine-class` | `AC-HARNESS-L3-044-01` / `BR-HARNESS-L3-044-01` | 主CASEの同scope/revisionのC1–C9入力を用い、義務意味と対oracleを再構成し未被覆0・意味重複0を照合する。固定範囲不足は上の原因別既存責務へ返す。 |
| `CASE-HARNESS-L10-044-r16-normal-delta` | `AC-HARNESS-L3-044-01` | 主CASEの十分なdeltaを使い、義務意味・oracle・他classを保つcoverageを照合する。設計relation・pair oracle不足は既存026/022等の区分へ返し未完とする。 |
| `CASE-HARNESS-L10-044-r16-delta-insufficient` | `AC-HARNESS-L3-044-02` | 主CASEのdelta relation一つの欠落を使い、該当class未被覆/未完とportfolio closure拒否、および既存026/022等の区分への原因別返却を照合する。identity不明は区分と分けunknownに保つ。 |

## Stage 3 親043の業務検証

| L2親 | 独立criterion | 対応関係 |
|---|---|---|
| `HARNESS-L2-043` | 独立criterionなし | business outcomeは増やさず、選択scopeのrule/branch/risk content ACを照合する。 |

## Stage 3 親046の業務検証

起草候補。Stage 3、`version_target: 1.0`。対象は採択済みHARNESS-L2-046のFull V workflow条件と、明示的にProduction Scrumが選択・許可されたscopeのScrum slice/backfill条件に限る。候補文書・検証fixtureは採択済みL2/L11本文や運転結果を置換せず、releaseやruntime authorityを付与しない。

**固定親とPO根拠**：親L2は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`の `docs/helix-harness/L2-requirements/product-requirements.md:1025–1035`（全file SHA-256 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、対象span SHA-256 `47cc23b066cc970427a8b9193eda3be9cc06a43f19b7cb03e6f78a0116d6e01e`）。対L11は同revisionの `docs/helix-harness/L11-acceptance/product-acceptance.md:759–771`（全file SHA-256 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、span SHA-256 `a8e99f7df7166566c04b1113b045851d8417e17e8078c034f8f2a34ebfe4f37f`）。PO判断は `17a2f310358ee7fe209b9d37cddf4a927c740248` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:51`、file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、row SHA-256 `60fb90a139b313760ad5a259e2362e3c406e071aa1dfba8ed6d21d0cb9fb55a4`。POは`HARNESS-L2-046`を採択し、registrationは`MPR-RC-HARNESS-L2-046-001`。隣接row 52の`HARNESS-L2-047`は046へ混ぜない。

**旧source境界**：旧起点はv1.3 `LEGACY-ASSET-02319C2481B9E01698D5`。§4.4 L259はFull Vのsystem workflow/L1–L5段階freezeと12 workflow条件の検証（atom S1）およびProduction Scrumのslice delta先行・Scrum Reverse/backfill時点・SR4前release-ready不可（独立atom S2）を別条件として記述する。§10 L647は両者を要約する別atomで、第三の独立条件に数えない。6fabd125 baselineの同文companionも別revisionとして保持する。旧consumerのUWJ-FR-015とL4 boundaryは確認範囲に限定し、consumer全体網羅は主張しない。 Business outcomeとしてrelease-ready、release decision、market outcomeを検証・宣言しない。

**対象**：`BR-HARNESS-L3-046-01`。選択styleとscopeに対応するworkflow evidence条件が維持されること。

| L10 case ID | L3 AC / BR | 入力・比較 | 観測 | 未評価・不合格 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-046-r12-fullv-normal` | `AC-HARNESS-L3-046-01` / `BR-HARNESS-L3-046-01` | style=Full V、対象workflow revision、適用L1–L5段階freeze、12条件とV-pair evidenceを合成入力する。 | Full V scope coverageを再構成し、Scrum delta/backfill/SR4を要求しない。 | 12条件のapplicability/oracle不明ならunknown/未評価。 |
| `CASE-HARNESS-L10-046-r12-scrum-normal` | `AC-HARNESS-L3-046-02` | 同じProduction Scrum選択または許可合成内Scrum適用のscope/revisionについて、source定義済みbackfillとSR4 receiptがcurrentの対照入力を2つ置く。A: 既存trigger成立、backfillとtrigger適用checkpoint/SR4がcurrent。B: 既存trigger不成立、同じbackfillはcurrent、trigger由来checkpointは適用しないがSR4 receiptはcurrent。profile BでもSR4 receiptのidentity・target scope/revision・source evidence値は同じscope/revisionに結び付く既存sourceと一致する。どちらも新しい義務を足さない。 | A/Bとも既存source定義のbackfill対象・時点・revisionを照合し、trigger条件に従う。両方ともL2のSR4 release-readiness条件を入力で満たし、SR4 receiptのidentity・source evidenceが対象scope/revisionと一致することを確認する。 | A/B各正常scopeを評価可能としrelease authorityは生成しない。既存trigger applicability、backfill対象/時点、receipt identityが不明ならその範囲を未評価とする。 |
| `CASE-HARNESS-L10-046-r12-fullv-no-scrum` | `AC-HARNESS-L3-046-01` | Full Vの正常baselineからScrum-specific delta/Reverse/SR0–SR4/SR4 receiptの全てを省略する。 | Full Vの段階freezeと12条件がcurrentならFull V ACを評価でき、Scrum artifact欠落だけでは拒否しない。 | 他Full V必須条件欠落は該当scope未完。 |

## Stage 3 親054の業務検証：専門Worker判定・契約のOS割当handoff（起草候補、version_target: 1.0）

**採択本文の固定**：PO記録のsource_repository_revision `5aa100319361b0cc86edd3c51815ec777d55410a`。L2 `product-requirements.md:1154–1162` SHA-256 `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193`、L11 `product-acceptance.md:865–875` SHA-256 `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0`。旧調査snapshot e94838f5の同本文とbyte一致。末尾空行込みの物理span digestは別の監査pinとして区別する。

**状態と根拠**：本節はHARNESS-L2-054／L11-054の意味をL3要件とL10 oracleへ再導出する起草候補である。POの決定記録 `MPR-RC-HARNESS-L2-054-001` は採択（判断記録revision `b0b0719dfe786370e9bee48c5d2f753710546b6f`、PO row 34）。固定L2/L11本文に残る「未採択候補」は当時の本文メタデータであり、この後のPO決定を覆さない。L2-047は別親で、その既存のmuster判断を受け渡すだけで意味を変更しない。PO-047条件判断や別親の採択を本候補から生成しない。

**旧sourceとの扱い**：旧HIL-BR-09/30、HIL-FR-59/60/61/62/63の対応を起点に、工程・入力・必要性判断・runtime-neutral契約・OS handoffへ責務を再導出する。旧runtime固有projectionや旧TeamDefinition schemaは再利用しない。旧100 CASE IDとraw literalは監査用に保持し、現行fixture条件は固定L2/L11に沿って再導出する。旧source全体、旧runtime/testの実行、旧要件の全件closureを主張しない。HIL-FR-63の歴史的effort defaultは旧sourceにとどめ、1.0の技術値や閾値へ前倒ししない。

**責務とauthority**：HARNESSはprocess/verificationの意味、muster必要性判断、runtime-neutral contract内容と型付きhandoffを所有する。OSは正規のassignment発行者であり、assignment、profile、budget/deadline、lifecycle、実行と結果を既存契約の範囲で所有する。INTELLIGENCEはplacement proposal、LABOはevidenceの適用可能性、SECURITYはoperation authority・制約・隔離を所有する。HARNESSがOS assignmentを発行したりWorkerを起動したりしない。通常の既存roleへのOS assignmentは許される。`existing_role_sufficient`なら追加specialist contractも追加specialist assignmentも生成しない。

**型付きhandoffの候補条件**：対象task/ticket identity、scope、要求/oracle revision、`layer × drive`、process phase、task-kind、verification pattern、design obligation/oracle、domain/risk、judgment-pack revision、single-worker比較条件、適用可能なLABO evidenceと未評価状態を保持する。必要な場合のみINTELLIGENCE proposal、OS profile/budget/deadline/lifecycle、SECURITY authority/制約への参照を結ぶ。`muster_candidate`は契約参照（複数の場合はその全体集合）と対応するinput/output digest、複数参照時の集合digest、generation-rule revision、理由、比較対象/evidence、guard結果を同じscope/revisionに結ぶ。digestの算法、wire format、enum、固定worker数、threshold、TeamDefinition、provider/runtime固有fieldは新設しない。receiptやdigest自体はauthorityではない。

`existing_role_sufficient`は入力にある対象既存role参照と比較根拠を値として返し、両値が同一task/scope/revisionに対応する入力値と一致することを照合する。specialist contractを含めず、既存roleへの通常assignmentはOSが発行する。この分岐から追加specialist assignmentや新規Worker起動を生成しない。`unknown_or_defer`は不足・不確実・staleの条件、既知の責務区分、再照合に必要な入力を入力値に対応させて返し、それぞれが同じtask/scope/revisionに一致することを照合する。既知の責務区分へ個体identityの特定有無にかかわらず不足を返し、個別source identityやowner identityが特定できないときはその個体だけunknownのまま別記する。ownerの新設、値の推定、unknown軸の別軸への畳込みをしない。OS応答/assignmentが欠落、対象不一致、revision不一致または条件不明ならhandoffは未完である。

### 業務検証 `BV-HARNESS-L10-054`

L2-054のconnection目的に対する業務観点は、HARNESS handoffが同じtask/scope/revisionのもとでOSの既存assignment責務へ渡り、未確定条件を既知責務へ戻す意味を保つかである。新しい業務成果を追加せず、PO採択・L3承認・利用者受入をhandoffから推定しない。

| 観点 | 合成確認 | 境界 |
|---|---|---|
| OS assignment責務との接続 | c01/c03でOS通常assignmentとHARNESS handoffを別状態にする | 実assignmentを実施した主張ではない |
| layer/drive適用範囲 | c03で各axisのsource-input applicability-scopeとhandoff出力を項目別に照合し、c55–c62で各axisの4状態を個別に保留する | scope値は合成fixture入力。実際のlayer/drive mappingを新設・承認しない |
| 出力authority境界 | c51–c54で仮登録から要求採択/L3承認/assignment、handoffから実行許可を各field単独で拒否する | source入力を不足扱いせず誤ったHARNESS出力を訂正する |
| 複数contract handoff | c03で固定入力の全contract参照集合と集合digestが出力に一致し、c20–c22で一項目だけの欠落/不一致を拒否する | digest algorithm、実契約集合、実行結果を定義しない |
| 証拠の非昇格 | c29–c34でsource/coverage receipt・候補・fixture・OS記録例が存在しても、禁止状態fieldを個別生成しない | 正常な証拠入力に問題を転嫁せず、実行/受入を主張しない |
| 不確実条件 | c08でunknown/deferを維持する | 個別owner identityを創作しない |
| 既存role十分 | c01/c02で通常OS assignmentと追加specialist拒否を分離する | HARNESS assignmentは禁止だが、OS通常assignmentを禁止しない |
