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


## Stage 3 親041の業務検証

独立business criterion/oracle/CASEは追加しない。`functional-requirements.md`の固定L2-041 scopeとFR/ACを参照し、atom数/gap数/coverage/fixture数からROI、事業成果、利用者受入、要求合意、承認を生成しない。

## Stage 3 親047の業務検証

| L2親 | 独立criterion | 対応関係 |
|---|---|---|
| `HARNESS-L2-047` | 独立criterionなし | 事業成果を作らず、必要性判断/契約の機能ACと既存owner境界を照合する。 |

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
