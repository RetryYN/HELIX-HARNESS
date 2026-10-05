# HELIX-INTELLIGENCE L3 NFR・技術候補（Stage 2a）

状態: PO L3承認前の起草候補。固定採択L2に数値thresholdがない箇所は、観測と比較を可能にする根拠付き技術候補を記録する。候補値・測定軸は採択値、実測結果、実行許可を意味しない。

旧HELIX NFR文書の「特性→計測→受入」の構造を起点に再導出する（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-81`、LEGACY-ASSET-DB669724249A14A665F0）。旧IPA grade、数値、pass条件、CI/runtime、HARNESS KPI/料金モデルを現行NFRとして再利用しない。該当する数値sourceは採択L2/L11に見当たらないため、以下は候補の比較設計である。

## NFR-INT-010-01 — 配置proposal根拠の観測可能性

- 親: `HELIXINTELLIGENCE-L2-010`, version target `1.0`。FR: `FR-INT-010`。L2が明記する観測軸はsuccess/failure/rework/latency/cost/reliability。
- Candidate 1（推奨）: 固定task-class、scope、source/revisionで層別した全適格観測cohortから分布（p50/p95候補）を算出する。source/revision/scopeとtask/model class evidenceを明示的に束縛でき、比較対象と根拠の追跡が最も直接的である。適格観測は全数集計し、件数・測定期間・欠損・未評価を併記する。
- Candidate 2: rolling windowを30日/90日で比較する案。30日は変化を早く反映する候補、90日は観測数を確保しやすい候補として並べるが、いずれも固定要件値ではない。task mixやrevisionが変わると比較可能性を失うため、source/revision/scopeの一致を検証できる場合に限り補助表示する。
- 採用候補比較の判定軸: fixed cohortとrolling 30日/90日を同じsource recordsで算出し、対象scope内のtask mix、revision drift、欠損・未評価割合、指標分布、実際の観測数がどう変わるかをL10で記録する。rolling候補は鮮度/件数とのtradeoffを示す補助比較とする。human interventionを費用から落とさず、scope/revisionに有効な既決quality/priority/tolerance判断は再利用する。観測数・測定期間は実在母集団から報告する。任意の最小Nやpass閾値は作らない。評価可能性が不足するtask classはunknown/未評価のままにし、選定されたWorkerをqualifiedと誤認しない。
- 比較母集団: 同一task-class・同一適用scopeでLABOが記録したWorker/Model観測。source、revision、scope、評価状態が異なる記録は別層にし、根拠に混ぜない。
- 集計候補の単位と分母: 全適格観測件数、success/failure/unknown等の状態別件数と欠測件数を併記する。成功・失敗の割合は結果が判定済みの同scope観測件数を分母とし、unknown・未判定は分母へ暗黙算入せず別件数にする。再作業割合は再作業有無を観測できた件数を分母、再作業ありの件数を分子とする。分母0は値なしと表示し、0%や成功へ変換しない。p50/p95は同じ単位で観測できたlatency・costに適用し、各指標の有効件数・単位と欠測を別記する。reliabilityは元の評価oracleが定める指標・単位・分母を表示し、定義が欠ける場合は未評価のままにする。状態名や真偽値へquantileを当てない。これらは表示・比較の技術候補であり、Worker適格性の閾値を作らない。
- 根拠: 固定L2-010:104,106とL11:163が列挙するtask attributes、observed performance、task/model class evidence、およびprice/name/benchmark-onlyを禁じるnegative。L11 G13:191–197の有効scope内判断の適用、理由/除外/不確実性/未評価、human intervention cost包含もCASEで照合するが、追加performance閾値にはしない。旧blind benchmarkのthresholdや旧sample countは採用しない。

## NFR-INT-066-01 — 人代行proposal receipt binding

- 親: `HELIXINTELLIGENCE-L2-066`, version target `1.0`。FR: `FR-INT-066`。
- Candidate 1（推奨）: 固定L2/L11が束縛する全field（推奨Worker、根拠、除外理由、不確実性、unknown/未評価、Worker identity/capability/version、ticket/task identity/scope、LABO evidence source/revision/scope、schema/contractおよびpack contract version、proposal origin、作成/受領actor/time）を個別presence/value照合し、欠落・不一致の件数をゼロ期待のoracleで測る。これは新しい信用閾値でなく、L2/L11が欠落時に受領しないと明記した契約の機械的照合である。
- Candidate 2: receipt end-to-end latencyをp50/p95で観測し、human/generated path別に同一の測定開始/終了点（入力確定からOS receipt記録まで）を比較する。固定L2/L11は期限・latency目標を規定していないため、分布を候補資料として報告し、任意の上限は置かない。
- 測定母集団: L10の全有効normal/negative fixtureと、別記した実観測がある場合は当該ticket/scope/contract versionの記録。異なるorigin、schema version、scopeはまとめず、fixture件数と実測件数を区別する。固定ケースfixtureは全数を検査し、無根拠の標本数・測定windowを設けない。
- 判定: binding欠落や不一致を受領済み/assignment可能にする変異は不合格。latency/cost分布だけから人案を評価済みにしたり、OS判断やauthorityを生成しない。
- 根拠: 固定L2-066:459-463、L11:134-138。旧receipt/SLA valuesは移さない。

## 境界

NFR候補の選択や運用値はPOへparameterごとの質問にせず、根拠比較と反証条件を対のL10へ記録する。要求の意味・scope・owner・versionを変えない技術上の調整は起草・独立reviewで進める。親条件の変更が必要なら該当L2/L1へ戻す。Bun、Web後続条件、非採択親、旧thresholdは対象外。


## Stage 2c — 068/075の起草範囲とsource

状態: 以下のStage 2c追補はL3未承認の起草候補・未実行の検証設計である。上のStage 2a本文とその承認範囲を変更しない。対象は採択済みHELIXINTELLIGENCE-L2-068/075に限る。旧source起点・項目別の再導出/置換は各項目と時点監査に記録する。

状態: L3未承認（委任承認前）の起草候補。固定採択L2に数値thresholdがない箇所は、観測と比較を可能にする根拠付き技術候補を記録する。候補値・測定軸は採択値、実測結果、実行許可を意味しない。

旧HELIX NFR文書の「特性→計測→受入」の構造を起点に再導出する（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-81`、LEGACY-ASSET-DB669724249A14A665F0）。旧IPA grade、数値、pass条件、CI/runtime、HARNESS KPI/料金モデルを現行NFRとして再利用しない。該当する数値sourceは採択L2/L11に見当たらないため、以下は候補の比較設計である。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。この追補は承認済みStage 2aの010/066範囲を変更しない。項目別sourceと再導出は時点監査へ記録する。


## NFR-INT-068-01 — 支援candidateの入力充足・根拠境界・既存budget計測（Stage 2c）

- 親: `HELIXINTELLIGENCE-L2-068`、version target `1.0` candidate。固定条件はL2:491-506/L11:202-209、revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 候補比較: Candidate 1はoperationごとにL2必須入力をfield単位で列挙し、fieldごとに適用・充足・missing・unknown・stale・restricted・conflictを集計する。Candidate 2はoperation単位の総合充足率だけを表示する。Candidate 1を推奨する。固定親は各必須条件の欠落で該当operationを保留するため、総合率だけでは一つの必須field欠落を他fieldの充足で隠すおそれがある。diagnosis evidenceを要求するoperationと不要なpre-test/instruction operationも分ける。各substantive claimを選択source/観測へtraceするかinference/hypothesis/unknownと分類し、unsupported fact、unknown-to-fact/pass、wrong-owner returnを別々に記録する。候補比較はこの意味oracleを満たすかで行い、任意の数値cutoffを置かない。
- 母集団と分母: 入力fieldの有無を調べる前に、対象operation ID・scope・source/revisionの母集団を固定し、必須入力不足で保留になるoperationも含める。operation充足率の分母はこの全対象operation数、分子はoperation別必須fieldをすべて満たすoperation数とする。field別の分母はそのfieldが対象operation contract上適用・必須であるoperation数、分子はそのfieldが満たされるoperation数とし、非適用fieldはfield分母へ含めない。分母0は率なしとする。operation disposition（normal completed、failed、cancelled/stopped、未完了/不明）と観測状態（観測あり、missing observation、観測打切り/censored）は別軸で報告し、入力field状態（充足、missing、unknown、stale、restricted、conflict）とも直交させる。`missing input`はoperation dispositionではなく該当fieldの状態として記録する。preparationとdiagnosis/consultは別populationとする。
- claim census: 全substantive claimを母集団にする。claim kindはfact / inference / hypothesis / unknown / unclassifiableのいずれか一つへ排他的に分類する。source support状態（trace-backed / unsupported / not assessable）と誤りevent（unknown-to-fact、unknown-to-pass、wrong-owner return等）は別軸で集計し、同じclaimに複数の誤りeventがある場合はevent countで別記する。claim kindとsupport状態・eventを混ぜず、全claim件数とkind件数の合計が一致することを照合する。
- 既存budget・elapsed: 元OS assignmentの初期値・operation前後の残量・deadline・stop/cancelを元の単位で保持する。elapsedは、既存OS記録が同一operationの開始/終了event、同一clock、同一unitを特定し、両timestampの整合（開始≤終了）が確認できる場合だけvalid標本とする。これは運用上のpassを意味しない。operationがfailedまたはstoppedでも時刻が有効なら標本に含める。計測定義/sourceが有効な標本では、明示的な観測打切りならcensored、それ以外のendpoint欠落ならmissing、両endpointがあるがtimestamp不整合ならfailed observation、両端整合ならvalidの順に一状態だけ割り当てる。definition/sourceが欠けelapsedを計算できない状態はunknown/unavailableであり、実測elapsedが0である状態と区別する。valid標本のnとunitを記録し、n=0ならp50/p95なし、記録自体が無い場合は未実測とする。欠測を0へ変換しない。budget reset、増額、一定割合の予約、根拠のないnumeric threshold・sample minimum・windowは作らない。
- 根拠: L2-068はsource/applicability、failure evidenceのoperation限定、元budget/deadline/stop、入力不足時のreturnを定める。L11:202-209は候補生成、準備/診断の区分、unknown保持とowner返却を与える。母集団・分母・elapsed validityの具体化は再現可能な測定設計上の候補であり、固定親に新しい実行義務やSLAを追加しない。旧sourceは数値性能thresholdを根拠づけない。


## NFR-INT-075-01 — proposal identity／evidence fieldの観測候補

- 親: `HELIXINTELLIGENCE-L2-075`、`version_target: 1.0` candidate。固定L2/L11 exact revisionおよびPO採択判断はfunctional L3と同じsource pinに従う。
- 技術候補比較: Candidate 1はproposal field matrixで、親が列挙するidentity、authority/evidence、reproduction/counterevidence/confidence/expiry、finding/remediation advisory、digestを個別確認する。Candidate 2はproposal全体のall-fields-pass率だけを報告する。Candidate 1を推奨する。L2-075は一つのidentity/evidence欠落だけでもそのfieldを不完全とし、他fieldで補完しないため、全体率だけではどのfieldのreasonが欠けたか分からない。
- Candidate 1のcoverageは「normal binding確認と独立negative理由確認の両方がmatrixにある宣言field数 / matrix上の全宣言field数」として測り、authority class・fixture数・source revision・未評価field数を添える。qualificationはself-rating、duplicate/existing owner、独立再現、counterevidence、expiry、supersessionを別facetのfixture件数とexpected/observed handoff resultで示す。いずれも検証設計の測定候補であり、製品pass threshold、schema enum、最低NやSLAではない。
- qualification測定候補: AI self-rating、duplicate/existing owner、独立再現、counterevidence、expiry、supersessionを別facetとしてfixture母集団・unknown件数・既存owner handoff件数とともに報告する。finding/remediation identity混同、または親が禁止する資格/authorityの自己確定は各fixture oracleで拒否されることを記録する。複数facetを単一scoreへ畳み込まず、候補別の件数とscopeを示す。
- 母集団/分母: L10の全field mutationとqualification fixtureをoperation・authority class（current/compatibility/historical）ごとに全数列挙し、未見normal fixtureとnegative fixtureを分ける。field matrix上の宣言field数をcoverage分母とし、未作成fixtureを成功件数へ含めない。identity条件が欠落・不明なら別fieldやhistorical sourceで埋めずunknown/incompleteとする。
- 根拠: 固定L2-075 `618-625` / L11 `337-343` が要求する全field、6 identity条件、個別reason、時制区分、qualification handoffを測定対象にする。旧AAFD/旧ACは数値閾値やruntime性能値を与えないため持ち込まない。candidate値の比較はfield単位の観測可能性と各oracleの成立を並べ、parameterごとのPO判断や追加gateを作らない。


## Stage 5 — technical measurement candidates for 9 adopted parents

状態: いずれも未計測の技術候補であり、L2/L11にないSLA・最低N・合否閾値・PO個別parameter承認を追加しない。固定L2/L11の明示値はCASE用oracleとして使用し、製品性能値へ一般化しない。旧NFR→measurement traceの形を再導出し、旧grade/threshold/runtimeを再利用しない。

### NFR-INT-060-01 — plan source/edge trace観測候補

- 親 `HELIXINTELLIGENCE-L2-060`。適格inputのsource/revision/scope数、plan nodeとその根拠/依存edgeへ追跡できる件数、unknown/stale/未承認件数を別々に観測する候補。分母は実際に選択された適格source/edgeで、欠落を除外せずunknownとして数える。依存成立、ticket発行や計画品質の閾値は作らない。
- 対応 `CASE-NFR-INT-060-01` は同一fixtureからsource/edge populationと追跡結果を独立に数え直す。

### NFR-INT-061-01 — placement evidence適用範囲候補

- 親 `HELIXINTELLIGENCE-L2-061`。選択task class/scope内のLABO evidence数、未評価/stale/out-of-scope数、proposal根拠へ実際に結ばれた数を別層で報告する。全task classのcoverageや最低標本数を発明せず、異なるsource/revisionを混ぜない。
- 対応 `CASE-NFR-INT-061-01` は同一evidence集合から層別件数を再計算し、未評価をqualified扱いしない。

### NFR-INT-062-01 — repair stage evidence completeness候補

- 親 `HELIXINTELLIGENCE-L2-062`。SECURITY permission, Worker execution, HARNESS verification, OS acceptanceを各段階・scope別に観測し、available/missing/unknown/stale/owner-returnを混ぜず記録する。修復完了率や許容失敗率を作らず、一段のsuccessで次段を相殺しない。
- 対応 `CASE-NFR-INT-062-01` は段階別分母と不成立原因/ownerを独立算出する。

### NFR-INT-063-01 — episode/effect temporal separation候補

- 親 `HELIXINTELLIGENCE-L2-063`。historical LABO evaluation、BRAIN knowledge revision、current INT judgment、OS run/HARNESS evidenceのepisode/time/source trace率を別軸で示し、prediction/actual/unknown件数を分離する。効果のscore/thresholdや改善認定は置かない。
- 対応 `CASE-NFR-INT-063-01` は遅着結果を過去episodeへ割当て、currentを改変しない件数を照合する。

### NFR-INT-069-01 — explicit-model repeatability and unit-aware result candidate

- 親 `HELIXINTELLIGENCE-L2-069`。同じmodel/schema/rule/source revisionと同じ入力でのtrace/result一致を候補軸にし、model外状態、unknown、unsupported、打切り、使用unitと係数を数える。L2のqueue/DB/worker fixtureは数値oracleのみであり、実機精度/性能閾値ではない。実測時間のtargetを追加しない。
- 対応 `CASE-NFR-INT-069-01` は固定queue・worker算術結果と式を再計算し、missing/unknownが0へ変換されないことを確認する。

### NFR-INT-070-01 — stagewise source/consumer receipt binding候補

- 親 `HELIXINTELLIGENCE-L2-070`。033 input, 069 result, 040 send, LABO-024 receiveの各stageでsource/target/revision/correlation match, missing, duplicate, staleを別々に数える。送信と受領を同じ成功指標へ畳まない。latency cutoff/SLAは置かない。
- 対応 `CASE-NFR-INT-070-01` は各stage ledgerを独立集計する。

### NFR-INT-071-01 — cross-scenario comparability candidate

- 親 `HELIXINTELLIGENCE-L2-071`。比較対象のmodel revision, unit, rule, baseline/scenario/window一致数、差分を数値化できるfield数、unknown/unsupportedと後続receipt状態を分けて示す。L11の固定fixture 3 scenarioをfixture分母とし、母集団/運用率へ拡張しない。精度閾値は有効な既存scope decisionがある場合だけ参照する。
- 対応 `CASE-NFR-INT-071-01` は同じ入力からscenario count/一致状態と固定算術oracleを独立に再計算する。

### NFR-INT-074-01 — feedback applicability candidate

- 親 `HELIXINTELLIGENCE-L2-074`。供給feedbackを評価状態/task-class/revision/scope/window/source completenessで層別し、eligible/unknown/excluded件数を報告する。標本不足や比較不能を0/適合へ変えず、単一feedbackから恒久資格を作らない。
- 対応 `CASE-NFR-INT-074-01` は同じfeedback集合から適用範囲別の件数を再計算する。

### NFR-INT-077-01 — selected source identity and non-write observability candidate

- 親 `HELIXINTELLIGENCE-L2-077`。選択sourceごとにidentity/revision/owner/origin/qualification bindingとunknown reasonを観測し、internal/externalを別集計する。直接authority writeを候補が行わないことをCASEで照合するが、runtime rejection rateや一律pass百分率を設定しない。consumer/owner未確定populationを埋めない。
- 対応 `CASE-NFR-INT-077-01` はselected source / unknown / rejected write attemptのfixture件数を個別報告する。

旧sourceは旧「characteristic→measure→acceptance」の構造のみ再導出する。技術candidateの計測軸はL2/L11から直接導き、値ごとのPO確認や新しい段階gateへしない。
