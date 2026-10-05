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

親が有限個で明示するrequired source/field/ownerを照合するNFR候補。技術値は全required fieldの充足率100%候補と、誤ったsource/owner bind 0候補（親の完全保持条件から導出）に限定し、既定SLA、minimum sample、runtime latencyを新設しない。missing/unknown/stale/conflictは別stateで保持し、未選択sourceを母集団へ入れない。

### NFR-INT-017-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-017`。
- 対象測定: 同一target revision/scopeに対するSECURITY permission/isolation・Worker実行・HARNESS検証義務・OS検収の各結果。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-017-01`, `CASE-INT-017-02a`, `CASE-INT-017-02b`, `CASE-INT-017-02c`, `CASE-INT-017-02d`, `CASE-INT-017-02e`, `CASE-INT-017-02f`, `CASE-INT-017-02g`, `CASE-INT-017-02h`, `CASE-INT-017-02i`, `CASE-INT-017-03`, `CASE-INT-017-04a`, `CASE-INT-017-04b`, `CASE-INT-017-04c`, `CASE-INT-017-04d`, `CASE-INT-017-04e`, `CASE-INT-017-05a`, `CASE-INT-017-05b`, `CASE-INT-017-05c`, `CASE-INT-017-05d`, `CASE-INT-017-05e`, `CASE-INT-017-05f`, `CASE-INT-017-05g`, `CASE-INT-017-05h`, `CASE-INT-017-05i`, `CASE-INT-017-05j`, `CASE-INT-017-05k`, `CASE-INT-017-05l`, `CASE-INT-017-05m`, `CASE-INT-017-05n`, `CASE-INT-017-05o`, `CASE-INT-017-05p`, `CASE-INT-017-05q`, `CASE-INT-017-05r`.

### NFR-INT-030-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-030`。
- 対象測定: 許可されたHARNESS requirement/design revision、process contract、verification obligation、admitted connector contract。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-030-01`, `CASE-INT-030-02a`, `CASE-INT-030-02b`, `CASE-INT-030-02c`, `CASE-INT-030-02d`, `CASE-INT-030-02e`, `CASE-INT-030-02f`, `CASE-INT-030-02g`, `CASE-INT-030-02h`, `CASE-INT-030-03`, `CASE-INT-030-04a`, `CASE-INT-030-04b`, `CASE-INT-030-04c`, `CASE-INT-030-04d`, `CASE-INT-030-04e`, `CASE-INT-030-05a`, `CASE-INT-030-05b`, `CASE-INT-030-05c`, `CASE-INT-030-05d`, `CASE-INT-030-05e`, `CASE-INT-030-05f`, `CASE-INT-030-05g`, `CASE-INT-030-05h`, `CASE-INT-030-05i`, `CASE-INT-030-05j`, `CASE-INT-030-05k`, `CASE-INT-030-05l`, `CASE-INT-030-05m`, `CASE-INT-030-05n`, `CASE-INT-030-05o`, `CASE-INT-030-05p`, `CASE-INT-030-05q`, `CASE-INT-030-05r`.

### NFR-INT-031-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-031`。
- 対象測定: 許可ticket/current state/dependency/evidence、OS source revision、admitted connector contract。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-031-01`, `CASE-INT-031-02a`, `CASE-INT-031-02b`, `CASE-INT-031-02c`, `CASE-INT-031-02d`, `CASE-INT-031-02e`, `CASE-INT-031-02f`, `CASE-INT-031-02g`, `CASE-INT-031-02h`, `CASE-INT-031-03`, `CASE-INT-031-04a`, `CASE-INT-031-04b`, `CASE-INT-031-04c`, `CASE-INT-031-04d`, `CASE-INT-031-04e`, `CASE-INT-031-05a`, `CASE-INT-031-05b`, `CASE-INT-031-05c`, `CASE-INT-031-05d`, `CASE-INT-031-05e`, `CASE-INT-031-05f`, `CASE-INT-031-05g`, `CASE-INT-031-05h`, `CASE-INT-031-05i`, `CASE-INT-031-05j`, `CASE-INT-031-05k`, `CASE-INT-031-05l`, `CASE-INT-031-05m`, `CASE-INT-031-05n`, `CASE-INT-031-05o`, `CASE-INT-031-05p`, `CASE-INT-031-05q`, `CASE-INT-031-05r`.

### NFR-INT-032-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-032`。
- 対象測定: BRAIN Pattern/Unit/Part、applicability、exception、counterexampleおよびrevision。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-032-01`, `CASE-INT-032-02a`, `CASE-INT-032-02b`, `CASE-INT-032-02c`, `CASE-INT-032-02d`, `CASE-INT-032-02e`, `CASE-INT-032-02f`, `CASE-INT-032-02g`, `CASE-INT-032-02h`, `CASE-INT-032-02i`, `CASE-INT-032-03`, `CASE-INT-032-04a`, `CASE-INT-032-04b`, `CASE-INT-032-04c`, `CASE-INT-032-04d`, `CASE-INT-032-04e`, `CASE-INT-032-04f`, `CASE-INT-032-05a`, `CASE-INT-032-05b`, `CASE-INT-032-05c`, `CASE-INT-032-05d`, `CASE-INT-032-05e`, `CASE-INT-032-05f`, `CASE-INT-032-05g`, `CASE-INT-032-05h`, `CASE-INT-032-05i`, `CASE-INT-032-05j`, `CASE-INT-032-05k`, `CASE-INT-032-05l`, `CASE-INT-032-05m`, `CASE-INT-032-05n`, `CASE-INT-032-05o`, `CASE-INT-032-05p`, `CASE-INT-032-05q`, `CASE-INT-032-05r`.

### NFR-INT-033-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-033`。
- 対象測定: Product Core requirement/design/meaningとHARNESS process contract/verification obligationを別source/revisionで受領。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-033-01`, `CASE-INT-033-02a`, `CASE-INT-033-02b`, `CASE-INT-033-02c`, `CASE-INT-033-02d`, `CASE-INT-033-02e`, `CASE-INT-033-02f`, `CASE-INT-033-02g`, `CASE-INT-033-02h`, `CASE-INT-033-02i`, `CASE-INT-033-03`, `CASE-INT-033-04a`, `CASE-INT-033-04b`, `CASE-INT-033-04c`, `CASE-INT-033-04d`, `CASE-INT-033-04e`, `CASE-INT-033-05a`, `CASE-INT-033-05b`, `CASE-INT-033-05c`, `CASE-INT-033-05d`, `CASE-INT-033-05e`, `CASE-INT-033-05f`, `CASE-INT-033-05g`, `CASE-INT-033-05h`, `CASE-INT-033-05i`, `CASE-INT-033-05j`, `CASE-INT-033-05k`, `CASE-INT-033-05l`, `CASE-INT-033-05m`, `CASE-INT-033-05n`, `CASE-INT-033-05o`, `CASE-INT-033-05p`, `CASE-INT-033-05q`, `CASE-INT-033-05r`.

### NFR-INT-034-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-034`。
- 対象測定: 過去evaluation、success/failure/counterexample、Worker/model実績、Bench level、explicitly unevaluatedと各source scope/revision。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-034-01`, `CASE-INT-034-02a`, `CASE-INT-034-02b`, `CASE-INT-034-02c`, `CASE-INT-034-02d`, `CASE-INT-034-02e`, `CASE-INT-034-02f`, `CASE-INT-034-02g`, `CASE-INT-034-02h`, `CASE-INT-034-03`, `CASE-INT-034-04a`, `CASE-INT-034-04b`, `CASE-INT-034-04c`, `CASE-INT-034-04d`, `CASE-INT-034-04e`, `CASE-INT-034-05a`, `CASE-INT-034-05b`, `CASE-INT-034-05c`, `CASE-INT-034-05d`, `CASE-INT-034-05e`, `CASE-INT-034-05f`, `CASE-INT-034-05g`, `CASE-INT-034-05h`, `CASE-INT-034-05i`, `CASE-INT-034-05j`, `CASE-INT-034-05k`, `CASE-INT-034-05l`, `CASE-INT-034-05m`, `CASE-INT-034-05n`, `CASE-INT-034-05o`, `CASE-INT-034-05p`, `CASE-INT-034-05q`, `CASE-INT-034-05r`.

### NFR-INT-035-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-035`。
- 対象測定: plan/placement/diagnosis/review/repair candidate、根拠、停止条件、依存、source revision。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-035-01`, `CASE-INT-035-02a`, `CASE-INT-035-02b`, `CASE-INT-035-02c`, `CASE-INT-035-02d`, `CASE-INT-035-02e`, `CASE-INT-035-02f`, `CASE-INT-035-02g`, `CASE-INT-035-02h`, `CASE-INT-035-02i`, `CASE-INT-035-02j`, `CASE-INT-035-02k`, `CASE-INT-035-03`, `CASE-INT-035-04a`, `CASE-INT-035-04b`, `CASE-INT-035-04c`, `CASE-INT-035-04d`, `CASE-INT-035-04e`, `CASE-INT-035-04f`, `CASE-INT-035-05a`, `CASE-INT-035-05b`, `CASE-INT-035-05c`, `CASE-INT-035-05d`, `CASE-INT-035-05e`, `CASE-INT-035-05f`, `CASE-INT-035-05g`, `CASE-INT-035-05h`, `CASE-INT-035-05i`, `CASE-INT-035-05j`, `CASE-INT-035-05k`, `CASE-INT-035-05l`, `CASE-INT-035-05m`, `CASE-INT-035-05n`, `CASE-INT-035-05o`, `CASE-INT-035-05p`, `CASE-INT-035-05q`, `CASE-INT-035-05r`.

### NFR-INT-036-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-036`。
- 対象測定: operation candidateのactor/action/target/scope/revisionとSECURITY permission/constraint/revocation結果。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-036-01`, `CASE-INT-036-02a`, `CASE-INT-036-02b`, `CASE-INT-036-02c`, `CASE-INT-036-02d`, `CASE-INT-036-02e`, `CASE-INT-036-02f`, `CASE-INT-036-02g`, `CASE-INT-036-02h`, `CASE-INT-036-02i`, `CASE-INT-036-03`, `CASE-INT-036-03a`, `CASE-INT-036-04a`, `CASE-INT-036-04b`, `CASE-INT-036-04c`, `CASE-INT-036-04d`, `CASE-INT-036-04e`, `CASE-INT-036-04f`, `CASE-INT-036-04g`, `CASE-INT-036-04h`, `CASE-INT-036-05a`, `CASE-INT-036-05b`, `CASE-INT-036-05c`, `CASE-INT-036-05d`, `CASE-INT-036-05e`, `CASE-INT-036-05f`, `CASE-INT-036-05g`, `CASE-INT-036-05h`, `CASE-INT-036-05i`, `CASE-INT-036-05j`, `CASE-INT-036-05k`, `CASE-INT-036-05l`, `CASE-INT-036-05m`, `CASE-INT-036-05n`, `CASE-INT-036-05o`, `CASE-INT-036-05p`, `CASE-INT-036-05q`, `CASE-INT-036-05r`.

### NFR-INT-037-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-037`。
- 対象測定: OS発行・割当ticket、Worker actor、task scope、ticket revision、admitted contract。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-037-01`, `CASE-INT-037-02a`, `CASE-INT-037-02b`, `CASE-INT-037-02c`, `CASE-INT-037-02d`, `CASE-INT-037-02e`, `CASE-INT-037-02f`, `CASE-INT-037-02g`, `CASE-INT-037-02h`, `CASE-INT-037-03`, `CASE-INT-037-04a`, `CASE-INT-037-04b`, `CASE-INT-037-04c`, `CASE-INT-037-04d`, `CASE-INT-037-04e`, `CASE-INT-037-05a`, `CASE-INT-037-05b`, `CASE-INT-037-05c`, `CASE-INT-037-05d`, `CASE-INT-037-05e`, `CASE-INT-037-05f`, `CASE-INT-037-05g`, `CASE-INT-037-05h`, `CASE-INT-037-05i`, `CASE-INT-037-05j`, `CASE-INT-037-05k`, `CASE-INT-037-05l`, `CASE-INT-037-05m`, `CASE-INT-037-05n`, `CASE-INT-037-05o`, `CASE-INT-037-05p`, `CASE-INT-037-05q`, `CASE-INT-037-05r`.

### NFR-INT-038-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-038`。
- 対象測定: requirement revision、oracle、expected failure、independent verification、consumer acceptance、backflow condition。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-038-01`, `CASE-INT-038-02a`, `CASE-INT-038-02b`, `CASE-INT-038-02c`, `CASE-INT-038-02d`, `CASE-INT-038-02e`, `CASE-INT-038-02f`, `CASE-INT-038-02g`, `CASE-INT-038-02h`, `CASE-INT-038-03`, `CASE-INT-038-04a`, `CASE-INT-038-04b`, `CASE-INT-038-04c`, `CASE-INT-038-04d`, `CASE-INT-038-04e`, `CASE-INT-038-05a`, `CASE-INT-038-05b`, `CASE-INT-038-05c`, `CASE-INT-038-05d`, `CASE-INT-038-05e`, `CASE-INT-038-05f`, `CASE-INT-038-05g`, `CASE-INT-038-05h`, `CASE-INT-038-05i`, `CASE-INT-038-05j`, `CASE-INT-038-05k`, `CASE-INT-038-05l`, `CASE-INT-038-05m`, `CASE-INT-038-05n`, `CASE-INT-038-05o`, `CASE-INT-038-05p`, `CASE-INT-038-05q`, `CASE-INT-038-05r`.

### NFR-INT-039-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-039`。
- 対象測定: scope付きrepair candidate、Worker execution evidence、HARNESS verification resultと各revision/receipt。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-039-01`, `CASE-INT-039-02a`, `CASE-INT-039-02b`, `CASE-INT-039-02c`, `CASE-INT-039-02d`, `CASE-INT-039-02e`, `CASE-INT-039-02f`, `CASE-INT-039-02g`, `CASE-INT-039-02h`, `CASE-INT-039-02i`, `CASE-INT-039-03`, `CASE-INT-039-04a`, `CASE-INT-039-04b`, `CASE-INT-039-04c`, `CASE-INT-039-04d`, `CASE-INT-039-04e`, `CASE-INT-039-05a`, `CASE-INT-039-05b`, `CASE-INT-039-05c`, `CASE-INT-039-05d`, `CASE-INT-039-05e`, `CASE-INT-039-05f`, `CASE-INT-039-05g`, `CASE-INT-039-05h`, `CASE-INT-039-05i`, `CASE-INT-039-05j`, `CASE-INT-039-05k`, `CASE-INT-039-05l`, `CASE-INT-039-05m`, `CASE-INT-039-05n`, `CASE-INT-039-05o`, `CASE-INT-039-05p`, `CASE-INT-039-05q`, `CASE-INT-039-05r`.

### NFR-INT-040-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-040`。
- 対象測定: prediction/diagnosis/review/placement/repair result、source revision、episode/scope、actual evidence/observation window。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-040-01`, `CASE-INT-040-02a`, `CASE-INT-040-02b`, `CASE-INT-040-02c`, `CASE-INT-040-02d`, `CASE-INT-040-02e`, `CASE-INT-040-02f`, `CASE-INT-040-02g`, `CASE-INT-040-02h`, `CASE-INT-040-02i`, `CASE-INT-040-03`, `CASE-INT-040-04a`, `CASE-INT-040-04b`, `CASE-INT-040-04c`, `CASE-INT-040-04d`, `CASE-INT-040-04e`, `CASE-INT-040-04f`, `CASE-INT-040-05a`, `CASE-INT-040-05b`, `CASE-INT-040-05c`, `CASE-INT-040-05d`, `CASE-INT-040-05e`, `CASE-INT-040-05f`, `CASE-INT-040-05g`, `CASE-INT-040-05h`, `CASE-INT-040-05i`, `CASE-INT-040-05j`, `CASE-INT-040-05k`, `CASE-INT-040-05l`, `CASE-INT-040-05m`, `CASE-INT-040-05n`, `CASE-INT-040-05o`, `CASE-INT-040-05p`, `CASE-INT-040-05q`, `CASE-INT-040-05r`.

### NFR-INT-041-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-041`。
- 対象測定: 各admitted mechanismの許可current state/evidence、個別revision、connector/authority contract。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-041-01`, `CASE-INT-041-02a`, `CASE-INT-041-02b`, `CASE-INT-041-02c`, `CASE-INT-041-02d`, `CASE-INT-041-02e`, `CASE-INT-041-02f`, `CASE-INT-041-02g`, `CASE-INT-041-02h`, `CASE-INT-041-03`, `CASE-INT-041-04a`, `CASE-INT-041-04b`, `CASE-INT-041-04c`, `CASE-INT-041-04d`, `CASE-INT-041-04e`, `CASE-INT-041-05a`, `CASE-INT-041-05b`, `CASE-INT-041-05c`, `CASE-INT-041-05d`, `CASE-INT-041-05e`, `CASE-INT-041-05f`, `CASE-INT-041-05g`, `CASE-INT-041-05h`, `CASE-INT-041-05i`, `CASE-INT-041-05j`, `CASE-INT-041-05k`, `CASE-INT-041-05l`, `CASE-INT-041-05m`, `CASE-INT-041-05n`, `CASE-INT-041-05o`, `CASE-INT-041-05p`, `CASE-INT-041-05q`, `CASE-INT-041-05r`.

### NFR-INT-044-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-044`。
- 対象測定: INTELLIGENCE decision/candidate、genericization proposal、evidence/scope、LABO evaluation handoff。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-044-01`, `CASE-INT-044-02a`, `CASE-INT-044-02b`, `CASE-INT-044-02c`, `CASE-INT-044-02d`, `CASE-INT-044-02e`, `CASE-INT-044-02f`, `CASE-INT-044-02g`, `CASE-INT-044-02h`, `CASE-INT-044-02i`, `CASE-INT-044-03`, `CASE-INT-044-04a`, `CASE-INT-044-04b`, `CASE-INT-044-04c`, `CASE-INT-044-04d`, `CASE-INT-044-04e`, `CASE-INT-044-04f`, `CASE-INT-044-04g`, `CASE-INT-044-05a`, `CASE-INT-044-05b`, `CASE-INT-044-05c`, `CASE-INT-044-05d`, `CASE-INT-044-05e`, `CASE-INT-044-05f`, `CASE-INT-044-05g`, `CASE-INT-044-05h`, `CASE-INT-044-05i`, `CASE-INT-044-05j`, `CASE-INT-044-05k`, `CASE-INT-044-05l`, `CASE-INT-044-05m`, `CASE-INT-044-05n`, `CASE-INT-044-05o`, `CASE-INT-044-05p`, `CASE-INT-044-05q`, `CASE-INT-044-05r`.

### NFR-INT-045-01 — required source binding completeness候補

- 固定親: `HELIXINTELLIGENCE-L2-045`。
- 対象測定: Product Core meaning conflict/gap/improvement candidate、source revision、target identity。
- 候補値: applicable required-field coverage 100%、wrong source/owner binding 0。固定親が要求する全必須情報の保持を示す候補で、任意性能/SLA基準ではない。適用範囲外のfieldは分母に入れず、unknownを成功に含めない。
- 根拠CASE: `CASE-INT-045-01`, `CASE-INT-045-02a`, `CASE-INT-045-02b`, `CASE-INT-045-02c`, `CASE-INT-045-02d`, `CASE-INT-045-02e`, `CASE-INT-045-02f`, `CASE-INT-045-02g`, `CASE-INT-045-02h`, `CASE-INT-045-02i`, `CASE-INT-045-02j`, `CASE-INT-045-03`, `CASE-INT-045-04a`, `CASE-INT-045-04b`, `CASE-INT-045-04c`, `CASE-INT-045-04d`, `CASE-INT-045-04e`, `CASE-INT-045-04f`, `CASE-INT-045-04g`, `CASE-INT-045-05a`, `CASE-INT-045-05b`, `CASE-INT-045-05c`, `CASE-INT-045-05d`, `CASE-INT-045-05e`, `CASE-INT-045-05f`, `CASE-INT-045-05g`, `CASE-INT-045-05h`, `CASE-INT-045-05i`, `CASE-INT-045-05j`, `CASE-INT-045-05k`, `CASE-INT-045-05l`, `CASE-INT-045-05m`, `CASE-INT-045-05n`, `CASE-INT-045-05o`, `CASE-INT-045-05p`, `CASE-INT-045-05q`, `CASE-INT-045-05r`.
