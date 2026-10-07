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


## Stage 4 — source/contract trace候補

共通HARNESS-L2-010/011 packのfield母集団は全対象operationで照合する。例外として、L2-017は固定L2に共通pack句がないため、当該operationがpackを実際に消費する場合だけ該当fieldを必須分母へ含める。

親が有限個で明示するrequired source/field/ownerを照合するNFR候補。技術値は全required fieldの充足率100%候補と、誤ったsource/owner bind 0候補（親の完全保持条件から導出）に限定し、既定SLA、minimum sample、runtime latencyを新設しない。missing/unknown/stale/conflictは別stateで保持し、未選択sourceを母集団へ入れない。

### NFR-INT-017-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-017`。
- 対象測定: 同一target revision/scopeに対するSECURITY permission/isolation・Worker実行・HARNESS検証義務・OS検収の各結果。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-017-01`, `CASE-INT-017-01a`, `CASE-INT-017-02a`, `CASE-INT-017-02b`, `CASE-INT-017-02c`, `CASE-INT-017-02d`, `CASE-INT-017-02e`, `CASE-INT-017-02f`, `CASE-INT-017-02g`, `CASE-INT-017-02h`, `CASE-INT-017-02i`, `CASE-INT-017-02j`, `CASE-INT-017-02k`, `CASE-INT-017-02l`, `CASE-INT-017-02m`, `CASE-INT-017-02n`, `CASE-INT-017-02o`, `CASE-INT-017-03`, `CASE-INT-017-03a`, `CASE-INT-017-04a`, `CASE-INT-017-04b`, `CASE-INT-017-04c`, `CASE-INT-017-04d`, `CASE-INT-017-04e`, `CASE-INT-017-05a`, `CASE-INT-017-05b`, `CASE-INT-017-05c`, `CASE-INT-017-05d`, `CASE-INT-017-05e`, `CASE-INT-017-05f`, `CASE-INT-017-05g`, `CASE-INT-017-05h`, `CASE-INT-017-05i`, `CASE-INT-017-05j`, `CASE-INT-017-05k`, `CASE-INT-017-05l`, `CASE-INT-017-05m`, `CASE-INT-017-05n`, `CASE-INT-017-05o`, `CASE-INT-017-05p`, `CASE-INT-017-05q`

### NFR-INT-030-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-030`。
- 対象測定: 許可されたHARNESS requirement/design revision、process contract、verification obligation、admitted connector contract。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-030-01`, `CASE-INT-030-02a`, `CASE-INT-030-02b`, `CASE-INT-030-02c`, `CASE-INT-030-02d`, `CASE-INT-030-02e`, `CASE-INT-030-02f`, `CASE-INT-030-02g`, `CASE-INT-030-02h`, `CASE-INT-030-03`, `CASE-INT-030-04a`, `CASE-INT-030-04b`, `CASE-INT-030-04c`, `CASE-INT-030-04d`, `CASE-INT-030-04e`, `CASE-INT-030-04f`, `CASE-INT-030-05a`, `CASE-INT-030-05b`, `CASE-INT-030-05c`, `CASE-INT-030-05d`, `CASE-INT-030-05e`, `CASE-INT-030-05f`, `CASE-INT-030-05g`, `CASE-INT-030-05h`, `CASE-INT-030-05i`, `CASE-INT-030-05j`, `CASE-INT-030-05k`, `CASE-INT-030-05l`, `CASE-INT-030-05m`, `CASE-INT-030-05n`, `CASE-INT-030-05o`, `CASE-INT-030-05p`, `CASE-INT-030-05q`

### NFR-INT-031-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-031`。
- 対象測定: 許可ticket/current state/dependency/evidence、OS source revision、admitted connector contract。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-031-01`, `CASE-INT-031-02a`, `CASE-INT-031-02b`, `CASE-INT-031-02c`, `CASE-INT-031-02d`, `CASE-INT-031-02e`, `CASE-INT-031-02f`, `CASE-INT-031-02g`, `CASE-INT-031-02n`, `CASE-INT-031-03`, `CASE-INT-031-04a`, `CASE-INT-031-04b`, `CASE-INT-031-04c`, `CASE-INT-031-04d`, `CASE-INT-031-04e`, `CASE-INT-031-05a`, `CASE-INT-031-05b`, `CASE-INT-031-05c`, `CASE-INT-031-05d`, `CASE-INT-031-05e`, `CASE-INT-031-05f`, `CASE-INT-031-05g`, `CASE-INT-031-05h`, `CASE-INT-031-05i`, `CASE-INT-031-05j`, `CASE-INT-031-05k`, `CASE-INT-031-05l`, `CASE-INT-031-05m`, `CASE-INT-031-05n`, `CASE-INT-031-05o`, `CASE-INT-031-05p`, `CASE-INT-031-05q`

### NFR-INT-032-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-032`。
- 対象測定: BRAIN Pattern/Unit/Part、applicability、exception、counterexampleおよびrevision。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-032-01`, `CASE-INT-032-02a`, `CASE-INT-032-02b`, `CASE-INT-032-02c`, `CASE-INT-032-02d`, `CASE-INT-032-02e`, `CASE-INT-032-02f`, `CASE-INT-032-02g`, `CASE-INT-032-02h`, `CASE-INT-032-02i`, `CASE-INT-032-02j`, `CASE-INT-032-02k`, `CASE-INT-032-02l`, `CASE-INT-032-02m`, `CASE-INT-032-03`, `CASE-INT-032-04a`, `CASE-INT-032-04b`, `CASE-INT-032-04c`, `CASE-INT-032-04d`, `CASE-INT-032-04e`, `CASE-INT-032-04f`, `CASE-INT-032-04g`, `CASE-INT-032-04h`, `CASE-INT-032-04i`, `CASE-INT-032-04j`, `CASE-INT-032-04k`, `CASE-INT-032-04l`, `CASE-INT-032-05a`, `CASE-INT-032-05b`, `CASE-INT-032-05c`, `CASE-INT-032-05d`, `CASE-INT-032-05e`, `CASE-INT-032-05f`, `CASE-INT-032-05g`, `CASE-INT-032-05h`, `CASE-INT-032-05i`, `CASE-INT-032-05j`, `CASE-INT-032-05k`, `CASE-INT-032-05l`, `CASE-INT-032-05m`, `CASE-INT-032-05n`, `CASE-INT-032-05o`, `CASE-INT-032-05p`, `CASE-INT-032-05q`

### NFR-INT-033-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-033`。
- 対象測定: Product Core requirement/design/meaningとHARNESS process contract/verification obligationを別source/revisionで受領。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-033-01`, `CASE-INT-033-02a`, `CASE-INT-033-02b`, `CASE-INT-033-02c`, `CASE-INT-033-02d`, `CASE-INT-033-02e`, `CASE-INT-033-02f`, `CASE-INT-033-02g`, `CASE-INT-033-02h`, `CASE-INT-033-02i`, `CASE-INT-033-03`, `CASE-INT-033-03a`, `CASE-INT-033-04a`, `CASE-INT-033-04b`, `CASE-INT-033-04c`, `CASE-INT-033-04d`, `CASE-INT-033-04e`, `CASE-INT-033-05a`, `CASE-INT-033-05b`, `CASE-INT-033-05c`, `CASE-INT-033-05d`, `CASE-INT-033-05e`, `CASE-INT-033-05f`, `CASE-INT-033-05g`, `CASE-INT-033-05h`, `CASE-INT-033-05i`, `CASE-INT-033-05j`, `CASE-INT-033-05k`, `CASE-INT-033-05l`, `CASE-INT-033-05m`, `CASE-INT-033-05n`, `CASE-INT-033-05o`, `CASE-INT-033-05p`, `CASE-INT-033-05q`

### NFR-INT-034-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-034`。
- 対象測定: 過去evaluation、success/failure/counterexample、Worker/model実績、Bench level、explicitly unevaluatedと各source scope/revision。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-034-01`, `CASE-INT-034-02a`, `CASE-INT-034-02b`, `CASE-INT-034-02c`, `CASE-INT-034-02d`, `CASE-INT-034-02e`, `CASE-INT-034-02f`, `CASE-INT-034-02g`, `CASE-INT-034-02h`, `CASE-INT-034-02i`, `CASE-INT-034-02j`, `CASE-INT-034-02l`, `CASE-INT-034-02m`, `CASE-INT-034-02n`, `CASE-INT-034-03`, `CASE-INT-034-04a`, `CASE-INT-034-04b`, `CASE-INT-034-04c`, `CASE-INT-034-04d`, `CASE-INT-034-04e`, `CASE-INT-034-04f`, `CASE-INT-034-05a`, `CASE-INT-034-05b`, `CASE-INT-034-05c`, `CASE-INT-034-05d`, `CASE-INT-034-05e`, `CASE-INT-034-05f`, `CASE-INT-034-05g`, `CASE-INT-034-05h`, `CASE-INT-034-05i`, `CASE-INT-034-05j`, `CASE-INT-034-05k`, `CASE-INT-034-05l`, `CASE-INT-034-05m`, `CASE-INT-034-05n`, `CASE-INT-034-05o`, `CASE-INT-034-05p`, `CASE-INT-034-05q`

### NFR-INT-035-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-035`。
- 対象測定: plan/placement/diagnosis/review/repair candidate、根拠、停止条件、依存、source revision。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-035-01`, `CASE-INT-035-02a`, `CASE-INT-035-02b`, `CASE-INT-035-02c`, `CASE-INT-035-02d`, `CASE-INT-035-02e`, `CASE-INT-035-02f`, `CASE-INT-035-02g`, `CASE-INT-035-02h`, `CASE-INT-035-02i`, `CASE-INT-035-02j`, `CASE-INT-035-02k`, `CASE-INT-035-02l`, `CASE-INT-035-02m`, `CASE-INT-035-03`, `CASE-INT-035-04a`, `CASE-INT-035-04b`, `CASE-INT-035-04c`, `CASE-INT-035-04d`, `CASE-INT-035-04e`, `CASE-INT-035-04f`, `CASE-INT-035-04g`, `CASE-INT-035-05a`, `CASE-INT-035-05b`, `CASE-INT-035-05c`, `CASE-INT-035-05d`, `CASE-INT-035-05e`, `CASE-INT-035-05f`, `CASE-INT-035-05g`, `CASE-INT-035-05h`, `CASE-INT-035-05i`, `CASE-INT-035-05j`, `CASE-INT-035-05k`, `CASE-INT-035-05l`, `CASE-INT-035-05m`, `CASE-INT-035-05n`, `CASE-INT-035-05o`, `CASE-INT-035-05p`, `CASE-INT-035-05q`

### NFR-INT-036-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-036`。
- 対象測定: operation candidateのactor/action/target/scope/revisionとSECURITY permission/constraint/revocation結果。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-036-01`, `CASE-INT-036-02a`, `CASE-INT-036-02b`, `CASE-INT-036-02c`, `CASE-INT-036-02d`, `CASE-INT-036-02e`, `CASE-INT-036-02f`, `CASE-INT-036-02g`, `CASE-INT-036-02h`, `CASE-INT-036-02i`, `CASE-INT-036-02k`, `CASE-INT-036-02l`, `CASE-INT-036-02n`, `CASE-INT-036-02o`, `CASE-INT-036-03`, `CASE-INT-036-03a`, `CASE-INT-036-03b`, `CASE-INT-036-04a`, `CASE-INT-036-04b`, `CASE-INT-036-04c`, `CASE-INT-036-04d`, `CASE-INT-036-04e`, `CASE-INT-036-04f`, `CASE-INT-036-04g`, `CASE-INT-036-04h`, `CASE-INT-036-04i`, `CASE-INT-036-04j`, `CASE-INT-036-04k`, `CASE-INT-036-05a`, `CASE-INT-036-05b`, `CASE-INT-036-05c`, `CASE-INT-036-05d`, `CASE-INT-036-05e`, `CASE-INT-036-05f`, `CASE-INT-036-05g`, `CASE-INT-036-05h`, `CASE-INT-036-05i`, `CASE-INT-036-05j`, `CASE-INT-036-05k`, `CASE-INT-036-05l`, `CASE-INT-036-05m`, `CASE-INT-036-05n`, `CASE-INT-036-05o`, `CASE-INT-036-05p`, `CASE-INT-036-05q`

### NFR-INT-037-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-037`。
- 対象測定: OS発行・割当ticket、Worker actor、task scope、ticket revision、admitted contract。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-037-01`, `CASE-INT-037-02a`, `CASE-INT-037-02b`, `CASE-INT-037-02c`, `CASE-INT-037-02d`, `CASE-INT-037-02e`, `CASE-INT-037-02f`, `CASE-INT-037-02g`, `CASE-INT-037-02h`, `CASE-INT-037-02i`, `CASE-INT-037-02j`, `CASE-INT-037-03`, `CASE-INT-037-04a`, `CASE-INT-037-04b`, `CASE-INT-037-04c`, `CASE-INT-037-04d`, `CASE-INT-037-04e`, `CASE-INT-037-04f`, `CASE-INT-037-04g`, `CASE-INT-037-04h`, `CASE-INT-037-05a`, `CASE-INT-037-05b`, `CASE-INT-037-05c`, `CASE-INT-037-05d`, `CASE-INT-037-05e`, `CASE-INT-037-05f`, `CASE-INT-037-05g`, `CASE-INT-037-05h`, `CASE-INT-037-05i`, `CASE-INT-037-05j`, `CASE-INT-037-05k`, `CASE-INT-037-05l`, `CASE-INT-037-05m`, `CASE-INT-037-05n`, `CASE-INT-037-05o`, `CASE-INT-037-05p`, `CASE-INT-037-05q`

### NFR-INT-038-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-038`。
- 対象測定: requirement revision、oracle、expected failure、independent verification、consumer acceptance、backflow condition。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-038-01`, `CASE-INT-038-02a`, `CASE-INT-038-02b`, `CASE-INT-038-02c`, `CASE-INT-038-02d`, `CASE-INT-038-02e`, `CASE-INT-038-02f`, `CASE-INT-038-02g`, `CASE-INT-038-02h`, `CASE-INT-038-02i`, `CASE-INT-038-02j`, `CASE-INT-038-02k`, `CASE-INT-038-02l`, `CASE-INT-038-03`, `CASE-INT-038-04a`, `CASE-INT-038-04b`, `CASE-INT-038-04c`, `CASE-INT-038-04d`, `CASE-INT-038-04e`, `CASE-INT-038-04f`, `CASE-INT-038-05a`, `CASE-INT-038-05b`, `CASE-INT-038-05c`, `CASE-INT-038-05d`, `CASE-INT-038-05e`, `CASE-INT-038-05f`, `CASE-INT-038-05g`, `CASE-INT-038-05h`, `CASE-INT-038-05i`, `CASE-INT-038-05j`, `CASE-INT-038-05k`, `CASE-INT-038-05l`, `CASE-INT-038-05m`, `CASE-INT-038-05n`, `CASE-INT-038-05o`, `CASE-INT-038-05p`, `CASE-INT-038-05q`

### NFR-INT-039-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-039`。
- 対象測定: scope付きrepair candidate、Worker execution evidence、HARNESS verification resultと各revision/receipt。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-039-01`, `CASE-INT-039-02a`, `CASE-INT-039-02b`, `CASE-INT-039-02c`, `CASE-INT-039-02d`, `CASE-INT-039-02e`, `CASE-INT-039-02f`, `CASE-INT-039-02g`, `CASE-INT-039-02h`, `CASE-INT-039-02i`, `CASE-INT-039-03`, `CASE-INT-039-03a`, `CASE-INT-039-03b`, `CASE-INT-039-04a`, `CASE-INT-039-04b`, `CASE-INT-039-04c`, `CASE-INT-039-04d`, `CASE-INT-039-04e`, `CASE-INT-039-05a`, `CASE-INT-039-05b`, `CASE-INT-039-05c`, `CASE-INT-039-05d`, `CASE-INT-039-05e`, `CASE-INT-039-05f`, `CASE-INT-039-05g`, `CASE-INT-039-05h`, `CASE-INT-039-05i`, `CASE-INT-039-05j`, `CASE-INT-039-05k`, `CASE-INT-039-05l`, `CASE-INT-039-05m`, `CASE-INT-039-05n`, `CASE-INT-039-05o`, `CASE-INT-039-05p`, `CASE-INT-039-05q`

### NFR-INT-040-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-040`。
- 対象測定: prediction/diagnosis/review/placement/repair result、source revision、episode/scope、actual evidence/observation window。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-040-01`, `CASE-INT-040-01a`, `CASE-INT-040-01b`, `CASE-INT-040-01c`, `CASE-INT-040-01d`, `CASE-INT-040-01e`, `CASE-INT-040-02a`, `CASE-INT-040-02b`, `CASE-INT-040-02c`, `CASE-INT-040-02d`, `CASE-INT-040-02e`, `CASE-INT-040-02f`, `CASE-INT-040-02g`, `CASE-INT-040-02h`, `CASE-INT-040-02i`, `CASE-INT-040-02j`, `CASE-INT-040-02k`, `CASE-INT-040-02l`, `CASE-INT-040-03`, `CASE-INT-040-03a`, `CASE-INT-040-04a`, `CASE-INT-040-04b`, `CASE-INT-040-04c`, `CASE-INT-040-04d`, `CASE-INT-040-04e`, `CASE-INT-040-04f`, `CASE-INT-040-04g`, `CASE-INT-040-05a`, `CASE-INT-040-05b`, `CASE-INT-040-05c`, `CASE-INT-040-05d`, `CASE-INT-040-05e`, `CASE-INT-040-05f`, `CASE-INT-040-05g`, `CASE-INT-040-05h`, `CASE-INT-040-05i`, `CASE-INT-040-05j`, `CASE-INT-040-05k`, `CASE-INT-040-05l`, `CASE-INT-040-05m`, `CASE-INT-040-05n`, `CASE-INT-040-05o`, `CASE-INT-040-05p`, `CASE-INT-040-05q`

### NFR-INT-041-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-041`。
- 対象測定: 各admitted mechanismの許可current state/evidence、個別revision、connector/authority contract。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-041-01`, `CASE-INT-041-02a`, `CASE-INT-041-02b`, `CASE-INT-041-02c`, `CASE-INT-041-02d`, `CASE-INT-041-02e`, `CASE-INT-041-02f`, `CASE-INT-041-02g`, `CASE-INT-041-02h`, `CASE-INT-041-02i`, `CASE-INT-041-03`, `CASE-INT-041-03a`, `CASE-INT-041-03b`, `CASE-INT-041-04a`, `CASE-INT-041-04b`, `CASE-INT-041-04c`, `CASE-INT-041-04d`, `CASE-INT-041-04e`, `CASE-INT-041-05a`, `CASE-INT-041-05b`, `CASE-INT-041-05c`, `CASE-INT-041-05d`, `CASE-INT-041-05e`, `CASE-INT-041-05f`, `CASE-INT-041-05g`, `CASE-INT-041-05h`, `CASE-INT-041-05i`, `CASE-INT-041-05j`, `CASE-INT-041-05k`, `CASE-INT-041-05l`, `CASE-INT-041-05m`, `CASE-INT-041-05n`, `CASE-INT-041-05o`, `CASE-INT-041-05p`, `CASE-INT-041-05q`

### NFR-INT-044-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-044`。
- 対象測定: INTELLIGENCE decision/candidate、genericization proposal、evidence/scope、LABO evaluation handoff。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-044-01`, `CASE-INT-044-02a`, `CASE-INT-044-02b`, `CASE-INT-044-02c`, `CASE-INT-044-02d`, `CASE-INT-044-02e`, `CASE-INT-044-02f`, `CASE-INT-044-02g`, `CASE-INT-044-02h`, `CASE-INT-044-02i`, `CASE-INT-044-02j`, `CASE-INT-044-03`, `CASE-INT-044-04a`, `CASE-INT-044-04b`, `CASE-INT-044-04c`, `CASE-INT-044-04d`, `CASE-INT-044-04e`, `CASE-INT-044-04f`, `CASE-INT-044-04g`, `CASE-INT-044-04h`, `CASE-INT-044-05a`, `CASE-INT-044-05b`, `CASE-INT-044-05c`, `CASE-INT-044-05d`, `CASE-INT-044-05e`, `CASE-INT-044-05f`, `CASE-INT-044-05g`, `CASE-INT-044-05h`, `CASE-INT-044-05i`, `CASE-INT-044-05j`, `CASE-INT-044-05k`, `CASE-INT-044-05l`, `CASE-INT-044-05m`, `CASE-INT-044-05n`, `CASE-INT-044-05o`, `CASE-INT-044-05p`, `CASE-INT-044-05q`

### NFR-INT-045-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-045`。
- 対象測定: Product Core meaning conflict/gap/improvement candidate、source revision、target identity。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。 target identityが既知で固定親がそのtargetを要する候補だけをcoverage分母に含める。target identity欠落のCASE-INT-045-02aとtarget identity unknownの04a、および未見identityをunroutedのまま保持するCASE-INT-045-03は分母外のunrouted falsificationとして別集計し、coverageを失敗にも成功にも算入しない。target identityが既知でownerだけ不明の04b、およびtarget既知で直接routeする02kは分母に含める。
- 根拠CASE: `CASE-INT-045-01`, `CASE-INT-045-02a`, `CASE-INT-045-02b`, `CASE-INT-045-02c`, `CASE-INT-045-02d`, `CASE-INT-045-02e`, `CASE-INT-045-02f`, `CASE-INT-045-02g`, `CASE-INT-045-02h`, `CASE-INT-045-02i`, `CASE-INT-045-02j`, `CASE-INT-045-02k`, `CASE-INT-045-02l`, `CASE-INT-045-02m`, `CASE-INT-045-03`, `CASE-INT-045-04a`, `CASE-INT-045-04b`, `CASE-INT-045-04c`, `CASE-INT-045-04d`, `CASE-INT-045-04e`, `CASE-INT-045-04f`, `CASE-INT-045-04g`, `CASE-INT-045-05a`, `CASE-INT-045-05b`, `CASE-INT-045-05c`, `CASE-INT-045-05d`, `CASE-INT-045-05e`, `CASE-INT-045-05f`, `CASE-INT-045-05g`, `CASE-INT-045-05h`, `CASE-INT-045-05i`, `CASE-INT-045-05j`, `CASE-INT-045-05k`, `CASE-INT-045-05l`, `CASE-INT-045-05m`, `CASE-INT-045-05n`, `CASE-INT-045-05o`, `CASE-INT-045-05p`, `CASE-INT-045-05q`

review06追補の個別変異はCASE-INT-017-02o（revoked）とCASE-INT-034-02l/02m/02n（結果値の両方向反転/欠落）。04表のA/B列挙はfieldごとの独立fixtureとして扱う。測定時のrun識別と分母は対L10のnfr-verificationに従う。数値閾値を新設しない。

## Stage 3 — 採択親の根拠付き技術候補

状態: 技術候補・測定設計。採択済み要件値、実測結果、実行許可ではない。固定親にない数値cutoffを追加しない。測定探索点を置く場合は、出典・比較案・検証方法・母集団・単位・欠測/失敗扱いを併記する。

| NFR ID | 親L2 | 独立NFR導出または測定候補 | fixture / 母集団 | 判定境界 |
|---|---|---|---|---|
| `NFR-INTELLIGENCE-001-01` | `HELIXINTELLIGENCE-L2-001` | 独立NFR非導出: domain追加/分割/統合/退役の意味・identity relationであり、性能/保持期間の数値を決める入力は親にない。 | 二つのdomain lifecycleを編成するfixtureで各identityと関係を機能AC-001-01/-02/-03で照合。 | relationship/identity正確性が機能受入であり処理時間や全domain網羅率の合否値ではない。 |
| `NFR-INTELLIGENCE-002-01` | `HELIXINTELLIGENCE-L2-002` | 独立NFR非導出: domainごとの必要capability構成と未構成保持であり、全domainを対象とする可用性/速度要件ではない。 | Domain A/B/Cに異なる能力集合を与え、AC-002-01/-02/-03の設定集合・unknown出力を記録。 | 未構成保持をfunctional oracleで確認。全能力default率などは新設しない。 |
| `NFR-INTELLIGENCE-003-01` | `HELIXINTELLIGENCE-L2-003` | 独立NFR非導出: source-of-truth/model provenance joinの意味境界であり、個別source provider性能目標は規定されない。 | target/L2 revision/ticket/dependency/evidence/provider/cost sourceをfixtureでjoinし、stale/missing/contradictory relationを計測。 | 一致sourceのfield trace率はfixture母数とともに参考観測、SLA/完全性thresholdへ昇格しない。 |
| `NFR-INTELLIGENCE-004-01` | `HELIXINTELLIGENCE-L2-004` | 独立NFR非導出: Fact/Interpretation/Hypothesis/Unknownという分類意味と根拠保持の契約で、classifier accuracy thresholdは親にない。 | 4種類を含むsource-backed recordとlabel mutationを入力し、各分類/根拠の保持と誤昇格件数を機能ACで測る。 | semantic mutationの検出がoracle。accuracy母集団/正解ラベル定義が親にないため独立精度thresholdを作らない。 |
| `NFR-INTELLIGENCE-005-01` | `HELIXINTELLIGENCE-L2-005` | 独立NFR非導出: plan proposalはOS ticket/実行を生まず、依存・並列・stop/fallbackの意味契約であり実行時間目標ではない。 | approved target、prerequisite graph、parallelizable pair、expected result/risk/stop/fallback fixtureを与え、AC-005のcandidate fieldとticket不在を観測。 | 順序/依存の意味をfunctional ACで確認し、planner latencyや完了時間を追加しない。 |
| `NFR-INTELLIGENCE-006-01` | `HELIXINTELLIGENCE-L2-006` | 独立NFR非導出: predictionと後続LABO measurementの責務分離であり予測精度やlatency目標を親は定めない。 | prediction/evidence/assumption/falsificationを入力し、actual outcomeなし/別LABO recordありの状態を比較。 | 誤ってactualに昇格しないことをAC-006で照合。accuracy thresholdは正解母集団/期間が未規定のため置かない。 |
| `NFR-INTELLIGENCE-007-01` | `HELIXINTELLIGENCE-L2-007` | 独立NFR非導出: 現在episode diagnosisとLABO長期履歴、repair candidate分離が対象。診断応答時間/原因精度の数値は親にない。 | active episodeの複数log・矛盾counterevidence・repairなし/ありを入力し、probable/unknownと責務区分を観測。 | episode内の意味境界が対象で、longitudinal data retention/precision rateは独立条件にしない。 |
| `NFR-INTELLIGENCE-008-01` | `HELIXINTELLIGENCE-L2-008` | 独立NFR非導出: revision-bound review finding/reproduction/counterexampleのcontractで、review SLAやseverity accuracyの数値は親にない。 | 同じfindingをmatching/mismatched HEAD, scope, reproduction, counterexampleで入力し、finding bindingとauthority non-changeを照合。 | merge/acceptance/requirement authority不変をAC-008で確認。review timing targetなし。 |
| `NFR-INTELLIGENCE-009-01` | `HELIXINTELLIGENCE-L2-009` | 独立NFR非導出: whole-system audit findingのHEAD/authority/producer/evidence traceが親scopeであり、全repo scan coverage/SLAは定義されない。 | 監査finding source edgesを完全/欠落/異版fixtureで比較し、該当edgeのみunknownになるか測る。 | AAFD/UIL/TER closure率や全体完了thresholdは導入しない。 |
| `NFR-INTELLIGENCE-011-01` | `HELIXINTELLIGENCE-L2-011` | 機能NFR比較候補: 親が明示する共通corpus/responsibility scope/評価条件revisionの下でmodel/provider実行版を個別記録して比較する。候補間で実行版が異なることだけでは比較不能としない。findings、false positives、misses、reproducibility、latency、costを軸別に並べる。 | 共通corpus/scope/evaluation-condition revisionを共通軸として記録し、protocol, hardware class, cache condition, human intervention conditionを個別に測定する。current/candidateの各run receiptについてfindings、FP、miss、reproducibility、latency、costを値・単位・分母/測定条件とともに記録し、費用にはpricing source/currency/effective timestamp/charging classを結ぶ。各項目はreceiptの値と照合し、条件差・価格根拠の差・欠測・FP/missの欠落を隠さず、影響する軸だけ比較不能/unknownにする。 | 同条件の差を報告する候補測定であり、優劣threshold、単一指標によるwinner選定、自動切替は作らない。分母または単位不一致は該当metricだけunknown。 |
| `NFR-INTELLIGENCE-012-01` | `HELIXINTELLIGENCE-L2-012` | 独立NFR非導出: epistemic state labelsとrequired next evidence/decisionが要件で、分類信頼度数値は親にない。 | known/probable/uncertain/unknown/contradictoryを混在fixtureで入力し、各labelと要求されるnext evidenceを照合。 | unknownをsafe/success/no-issueにしない意味条件をAC-012で確認。confidence score/accuracy thresholdなし。 |
| `NFR-INTELLIGENCE-013-01` | `HELIXINTELLIGENCE-L2-013` | 独立NFR非導出: 重要判断source/rule/model/alternative traceabilityは必要だが保持期間や再生成時間は親が定義しない。 | input revisions/rules/BRAIN/evidence/model/version/data-use/rejected alternativeのtrace fixtureと各単独欠落例を観測。 | trace edge completenessはfunctional oracleの範囲。retention duration/full regeneration requirementを作らない。 |
| `NFR-INTELLIGENCE-014-01` | `HELIXINTELLIGENCE-L2-014` | 独立NFR非導出: Bot identity/manifestとOS assignment境界の定義でありBot runtime availability/concurrency目標ではない。 | purpose/scope/input/output/action/stop/version manifestと別OS assignment状態を比較。manifest欠落時の戻し先も確認。 | 候補から実行/authorityが発生しないことをfunctional AC-014で照合。runtime SLOを追加しない。 |
| `NFR-INTELLIGENCE-015-01` | `HELIXINTELLIGENCE-L2-015` | 候補NFRは複数の独立failure episodeという固定L2の意味を測る。旧BBG/BBR sourceに頻度thresholdの正本はなく、episode独立性・scope・分母は明示して観測する。 | 同一patternの独立episode、同一episodeの重複、別scope混在を区別して入力しfalse-positive/miss/reproducibilityを同一scope・分母で計測。実装candidate/actual resultの区分はこの親の独立条件として追加せず、独立episode・scope・分母に限って測る。 | 単発episodeを複数と数えず、数値回数thresholdを追加しない。independence/scope/denominator未確定ならunknown。 |
| `NFR-INTELLIGENCE-016-01` | `HELIXINTELLIGENCE-L2-016` | 機能境界計測候補: 親がbudget/deadline/retry/write-set等を入力として与えるため固定値を補わず、実入力値に対する境界逸脱を観測する。 | target revision, actor, write-set, side-effect, budget, deadline, retry, impact, recoveryの親固定9束縛を全て持つcandidateを分母に置き、9束縛の欠落/境界超過を照合する。post-check/stopはcandidate必須fieldへ加えない。 | 親から新しいbudget数値は導出しない。provided budget超過/不明副作用の不成功とwrite-set境界はAC-016で測る。 |
| `NFR-INTELLIGENCE-018-01` | `HELIXINTELLIGENCE-L2-018` | 独立NFR非導出: current judgmentとLABO historical effectの時間軸/owner区分が対象。history retention durationや改善率は親が定めない。 | 同一scopeのcurrent proposalと複数時点LABO record、過去値current上書きmutationを与え、labels/owner handoffを記録。 | 時系列の意味分離をAC-018で確認。効果率、保存期間、自己改善性能は追加しない。 |
| `NFR-INTELLIGENCE-019-01` | `HELIXINTELLIGENCE-L2-019` | 独立NFR非導出: BRAIN knowledge applicability candidateの根拠とBRAIN/LABO責務区分でありranking accuracy/recall目標ではない。 | Pattern/Unit/Part/required inputs/conditions/evidence/versionを一致/不一致fixtureで比較しBRAIN writeback不在を観測。 | candidateのsource traceとunknownをAC-019で照合。適用精度thresholdや順位を規定しない。 |
| `NFR-INTELLIGENCE-020-01` | `HELIXINTELLIGENCE-L2-020` | 独立NFR非導出: Product Core meaning/backflow candidateのrevision/owner traceでありissue-resolution latency/close率を定めない。 | Product Core identity/revision/meaning claim/backflow/ownerを一致/異版/owner欠落fixtureで照合。 | proposal routingと正本変更ownerをAC-020で確認。解決時間/close率は追加しない。 |
| `NFR-INTELLIGENCE-067-01` | `HELIXINTELLIGENCE-L2-067` | 機能trace測定候補: 既決済みquality/order inputとLABO evidenceを既存L2-010 proposalへ受け渡すため、独立router performance閾値は不要。 | 決定済みinput/scope/source revision/LABO evidenceをproposalへ入力し、採用候補・除外理由・effort条件・quality/cost・完了時間/human-intervention evidenceと各provenanceがsource receiptの期待値に一致するかを観測する。欠測のeffortまたは完了時間はそれぞれunknownとして記録する。 | 既存proposal contract以外のranker/assignment指標は作らない。欠落・scope mismatch・値不一致はAC-INTELLIGENCE-L3-067-01, AC-INTELLIGENCE-L3-067-02, AC-INTELLIGENCE-L3-067-03, AC-INTELLIGENCE-L3-067-04で照合。 |
| `NFR-INTELLIGENCE-072-01` | `HELIXINTELLIGENCE-L2-072` | 機能state測定候補: adopted 6-part parentは登録`MPR-RC-HELIXINTELLIGENCE-L2-072-004` four-part shadow/review/rollbackと登録`MPR-RC-HELIXINTELLIGENCE-L2-072-005` selected-source stale facet。 | 072-004登録の4 fixed pinsと072-005登録の2追加raw spansを別fixtureで照合する。scope、requirement、template、skill、model catalog、allowlistを独立選択し、各selected/non-selected change、source edge競合、同条件candidateあり/なしのfalse-positive/false-negative/unknown/反例、rollback証拠、shadow/review未取得状態を観測する。さらに判断目的、観点、反証質問、必要evidence、severity、escalation/停止条件、model適性、適用条件、versionの期待値一致と、model適性未評価時のunknown保持を確認する。 | 6-part identity/meaning traceと後続義務の測定であり、forced gate・global invalidation・性能限界・新しい採択条件を追加しない。dispatch/tool/assignment/OS/SECURITY authorityは生成しない。 |
| `NFR-INTELLIGENCE-073-01` | `HELIXINTELLIGENCE-L2-073` | 機能境界測定候補: AAFD R-04 deterministic detector非置換/自由文単独direct projection禁止でありdetector precision目標/Issue throughputは定めない。 | finding text・既存detector結果・根拠source revisionをpositive/unknownで入力しcandidate resultとIssue/Requirement/CI/merge object不生成を確認。 | detector非置換/source traceをAC-INTELLIGENCE-L3-073-01, AC-INTELLIGENCE-L3-073-02, AC-INTELLIGENCE-L3-073-03で照合。精度閾値やauto-projectionを追加しない。 |
| `NFR-INTELLIGENCE-078-01` | `HELIXINTELLIGENCE-L2-078` | 独立数値SLOを導出しない。R-06/07/09/10/11/12のexact set/digest、snapshot join、bounded invalidation、stale-write suppression、replay同値とformal Future Synthesis責務/routeのunknown境界を機能条件として扱う。11 changed dimensions（authority/responsibility/runtime/provider/dependency/security/verification/capacity/cost/migration/release）を個別に追跡する。 | CASE-078の11 dimension×5状態=55個別CASEを維持し、R-06 delta meaning-field、023 effective dependency closure field、R-07〜R-12単独変異、producer/consumer/owner/Issue route/#1037現行相当の各単独negativeを別case-familyとして数える。同一入力closureとdelta exact set/digestは別oracleにし、未観測・未評価を別記する。 | 意味要素の照合であり性能閾値・処理件数scale gate・DB技術を新設しない。役割/routeを推測してauthorityを作らない。 |

技術候補が親の意味、scope、owner、versionを変える必要がある場合は候補のまま保持し、上流へ理由付きで戻す。parameterごとのPO承認やStage完了gateは追加しない。

review06の母集団追補：018の自己採択単独とLABO評価単独を別CASEとして数える。078では代行主張による4 field省略、read/qualification失敗からの別source切替2件、読取不能receiptの3代用を各別CASEとして既存078 familyのplanned fixture母集団へ加え、索引や併発caseと重複計上しない。source-bound oracleと戻し先を個別照合し、未実測を0へ変えない。

review08の機能測定追補：005未充足prerequisite1、016同scope未見結果正常1、067評価packetのscope/revision欠落2、072比較正常/閾値創作/case追加3、2.0外部知識必須化1、未見適用外工程/failure mode2、authority/risk/failure mode不一致3を各個別fixtureとして記録する。計13件は既存familyへ追加するplanned機能観測で、性能閾値・数値budget・authorityを追加しない。
## Stage 5 — 採択済み9親の技術測定候補

状態: いずれも未計測の技術候補であり、L2/L11にないSLA・最低N・合否閾値・PO個別parameter承認を追加しない。固定L2/L11の明示値はCASE用oracleとして使用し、製品性能値へ一般化しない。旧NFR→measurement traceの形を再導出し、旧grade/threshold/runtimeを再利用しない。

### NFR-INT-060-01 — plan source/edge traceの観測候補

- 親 `HELIXINTELLIGENCE-L2-060`。適格inputのsource/revision/scope数、plan nodeとその根拠/依存edgeへ追跡できる件数、unknown/stale/未承認件数を別々に観測する候補。分母は実際に選択された適格source/edgeで、欠落を除外せずunknownとして数える。依存成立、ticket発行や計画品質の閾値は作らない。
- 対応 `CASE-NFR-INT-060-01` は同一fixtureからsource/edge populationと追跡結果を独立に数え直す。

### NFR-INT-061-01 — 配置根拠の適用範囲候補

- 親 `HELIXINTELLIGENCE-L2-061`。選択task class/scope内のLABO evidence数、未評価/stale/out-of-scope数、proposal根拠へ実際に結ばれた数を別層で報告する。全task classのcoverageや最低標本数を発明せず、異なるsource/revisionを混ぜない。
- 対応 `CASE-NFR-INT-061-01` は同一evidence集合から層別件数を再計算し、未評価をqualified扱いしない。

### NFR-INT-062-01 — 修復段階evidence完全性候補

- 親 `HELIXINTELLIGENCE-L2-062`。SECURITY permission, Worker execution, HARNESS verification, OS acceptanceを各段階・scope別に観測し、available/missing/unknown/stale/owner-returnを混ぜず記録する。修復完了率や許容失敗率を作らず、一段のsuccessで次段を相殺しない。
- 対応 `CASE-NFR-INT-062-01` は段階別分母と不成立原因/ownerを独立算出する。

### NFR-INT-063-01 — episode/effect時点分離候補

- 親 `HELIXINTELLIGENCE-L2-063`。historical LABO evaluation、BRAIN knowledge revision、current INT judgment、OS run/HARNESS evidenceのepisode/time/source trace率を別軸で示し、prediction/actual/unknown件数を分離する。効果のscore/thresholdや改善認定は置かない。
- 対応 `CASE-NFR-INT-063-01` は遅着結果を過去episodeへ割当て、currentを改変しない件数を照合する。

### NFR-INT-069-01 — 明示model再現性とunit整合結果候補

- 親 `HELIXINTELLIGENCE-L2-069`。同じmodel/schema/rule/source revisionと同じ入力でのtrace/result一致を候補軸にし、model外状態、unknown、unsupported、打切り、使用unitと係数を数える。L2のqueue/DB/worker fixtureは数値oracleのみであり、実機精度/性能閾値ではない。実測時間のtargetを追加しない。
- 対応 `CASE-NFR-INT-069-01` は固定queue・worker算術結果と式を再計算し、missing/unknownが0へ変換されないことを確認する。

### NFR-INT-070-01 — 段階別source/consumer receipt結合候補

- 親 `HELIXINTELLIGENCE-L2-070`。033 input, 069 result, 040 send, LABO-024 receiveの各stageでsource/target/revision/correlation match, missing, duplicate, staleを別々に数える。送信と受領を同じ成功指標へ畳まない。latency cutoff/SLAは置かない。
- 対応 `CASE-NFR-INT-070-01` は各stage ledgerを独立集計する。

### NFR-INT-071-01 — scenario間比較可能性候補

- 親 `HELIXINTELLIGENCE-L2-071`。比較対象のmodel revision, unit, rule, baseline/scenario/window一致数、差分を数値化できるfield数、unknown/unsupportedと後続receipt状態を分けて示す。L11の固定fixture 3 scenarioをfixture分母とし、母集団/運用率へ拡張しない。精度閾値は有効な既存scope decisionがある場合だけ参照する。
- 対応 `CASE-NFR-INT-071-01` は同じ入力からscenario count/一致状態と固定算術oracleを独立に再計算する。

### NFR-INT-074-01 — feedback適用可能性候補

- 親 `HELIXINTELLIGENCE-L2-074`。供給feedbackを評価状態/task-class/revision/scope/window/source completenessで層別し、eligible/unknown/excluded件数を報告する。標本不足や比較不能を0/適合へ変えず、単一feedbackから恒久資格を作らない。
- 対応 `CASE-NFR-INT-074-01` は同じfeedback集合から適用範囲別の件数を再計算する。

### NFR-INT-077-01 — 選択source identityと非write観測候補

- 親 `HELIXINTELLIGENCE-L2-077`。選択sourceごとにidentity/revision/owner/origin/qualification bindingとunknown reasonを観測し、internal/externalを別集計する。直接authority writeを候補が行わないことをCASEで照合するが、runtime rejection rateや一律pass百分率を設定しない。consumer/owner未確定populationを埋めない。
- 対応 `CASE-NFR-INT-077-01` はnormal CASE-INT-077-01/02からselected internal/external source populationを分けて集計する。CASE-INT-077-03a–03mのうち03a/b/c/d/e/f/h/i/j/k/l/mは索引、03gは独立unknown consumer/route fixtureとして扱う。negative件数はCASE-NFR-INT-077-02で05a–05zとは別に03gを報告する。

旧sourceは旧「characteristic→measure→acceptance」の構造のみ再導出する。技術candidateの計測軸はL2/L11から直接導き、値ごとのPO確認や新しい段階gateへしない。



### NFR-INT-060/061/062/063/069/070/071/074/077-02 — 補完fixtureの母集団とtrace候補

各CASE-NFRは対応する補完fixture全体をfixture母集団として、定義済み独立case数、結果別件数、owner return/unknown件数を数える。case行の存在だけを成立件数に数えず、実測性能や最低合格率は定めない。rateを算出する場合は実際のfixture件数を分母として示し、0件・欠測は算出値なしとする。

- `NFR-INT-060-02`：CASE-INT-060-05e–05iの5定義行中、05iは指定fallback正常例。05a–05dは06群の完全ID索引。この母集団は05e/05f/05g/05hの4独立negativeと05i正常fallbackであり、05e/05g/05hのHARNESS process contract source/ownerをfixtureで固定する。06群の9独立runはCASE-NFR-INT-060-03で別集計する。
- `NFR-INT-061-02`：CASE-INT-061-05a–05fの6 fixtureについて、互換評価、task scope、OS割当可否、receipt identity/revisionを別facetで数える。
- `NFR-INT-062-02`：CASE-INT-062-04a–04iの9定義行中、04b/04c/04gは05a/02d/02gへの完全ID索引。04a/04d/04e/04f/04h/04iの6独立stage fixtureだけをこの母集団で数える。05a–05eはCASE-NFR-INT-062-03で別集計し、permission scope/revisionと各stageのownerを区別する。
- `NFR-INT-063-02`：CASE-INT-063-04a–04hの8 fixtureについて、LABO/BRAIN/OSの固定戻し先、時点、episodeを独立集計する。このfixture群にないHARNESS process contract returnを追加しない。
- `NFR-INT-069-02`：CASE-INT-069-06a–06uの21 pack/source field fixtureと07a–07fの6 operation fixtureを別母集団として報告する。HARNESS-L2-010/011のadopted pack contractを常時照合し、011 call固有inputだけをcall利用operationで測る。通常計算のoracleなし/後段receiptなしを正常母集団に含め、指定verificationのoracle欠落をnegativeへ含める。
- `NFR-INT-070-02`：CASE-INT-070-07a–07lと08b–08eの16 unique fixture（08aは05cへのindex）をこの母集団で数える。09a–09g、06a–06i、10a–10cはCASE-NFR-INT-070-03で別stage別に数え、この母集団へ重ねない。送信と受領を一つの率に統合しない。
- `NFR-INT-071-02`：CASE-INT-071-04a–04cの固定正常scenarioと04d–04jの7独立negativeに加え、CASE-INT-071-02hのscope mismatchをこのNFR-071-02だけで別分母として報告する。
- `NFR-INT-074-02`：CASE-INT-074-04a–04cの3独立unknown facetと05a–05aaの27定義行中、05f/05l/05yはCASE-INT-074-02a/02b/05jへの索引（06eも02bへの別群索引）、05w/xは正常。05-seriesの独立fixtureは24件であり、05aaは評価receiptだけで明示capability条件不一致を無視するproposal確定claimとして計上する。
- `NFR-INT-077-02`：CASE-INT-077-05a–05zの26定義行を従来区分で集計し、CASE-INT-077-03gのunknown consumer/routeを独立facetとして追加観測する。L11:361に従い、source identity/qualificationは選択source owner、finding/delta candidate根拠はINTELLIGENCE owner、AssignmentはOS owner、評価はLABO ownerへ返す。consumer未特定はunknownのまま上流scope照合へ戻す。


### Stage 5 review01補正fixtureの母集団（追補）

本追補は既存9親の確認対象を、FV中の単独fixture行として追跡する測定候補である。fixture定義数とunique CASE ID数を分け、AC/NFR索引・旧複合例・別条件からの単なる参照は独立fixture分母へ加えない。review01時点の独立補正表78行と既存表への追記行20件は合計98行である（旧review01 correctionの97は当時のunique ID実測差789→886の純増であり、別時点・別尺度）。unique CASE IDの増加とは別の形式件数である。Root最終検収の139は補完fixture censusであり、全CASE定義数でも同じ範囲の差分件数でもない。既存表への追加は061-05f (1)、069-04h–04i (2)、069-06r–06u (4)、070-06a–06i (9)、071-02h (1)、077-03k–03m (3)。NFR参照集合に同じIDが現れても重複計上しない。

測定はparentごとに宣言された入力field/runを母集団とし、missing、unknown、stale、mismatch、正常を別状態で数える。分母は当該operationで適用条件が成立し測定可能なrunだけとし、0件なら割合なし。未選択sourceは未観測であり成功・失敗へ推定配分しない。固定L11の069算術fixtureは値を再計算するoracleで、製品性能閾値ではない。HARNESS-L2-010/011契約照合は069の通常計算にも常時適用し、011 call固有inputのみ適用操作で評価する。いずれも実測・SLA・L3承認を意味しない。
