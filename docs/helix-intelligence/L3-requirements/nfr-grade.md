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
| `NFR-INTELLIGENCE-011-01` | `HELIXINTELLIGENCE-L2-011` | 機能NFR比較候補: 親が明示するsame corpus/responsibility scopeでmodel/provider版を比較する。単一winner thresholdは設定せず、metricsを軸別に並べる。 | 同じcorpus/scopeの2 model/provider runを入力しfindings, false-positive/misses, reproducibility, latency, costを各版別に記録。corpus/scope/version変異を追加比較。 | 同条件の差を報告する候補測定であり、優劣threshold/自動切替は作らない。分母不一致はunknown。 |
| `NFR-INTELLIGENCE-012-01` | `HELIXINTELLIGENCE-L2-012` | 独立NFR非導出: epistemic state labelsとrequired next evidence/decisionが要件で、分類信頼度数値は親にない。 | known/probable/uncertain/unknown/contradictoryを混在fixtureで入力し、各labelと要求されるnext evidenceを照合。 | unknownをsafe/success/no-issueにしない意味条件をAC-012で確認。confidence score/accuracy thresholdなし。 |
| `NFR-INTELLIGENCE-013-01` | `HELIXINTELLIGENCE-L2-013` | 独立NFR非導出: 重要判断source/rule/model/alternative traceabilityは必要だが保持期間や再生成時間は親が定義しない。 | input revisions/rules/BRAIN/evidence/model/version/data-use/rejected alternativeのtrace fixtureと各単独欠落例を観測。 | trace edge completenessはfunctional oracleの範囲。retention duration/full regeneration requirementを作らない。 |
| `NFR-INTELLIGENCE-014-01` | `HELIXINTELLIGENCE-L2-014` | 独立NFR非導出: Bot identity/manifestとOS assignment境界の定義でありBot runtime availability/concurrency目標ではない。 | purpose/scope/input/output/action/stop/version manifestと別OS assignment状態を比較。manifest欠落時の戻し先も確認。 | 候補から実行/authorityが発生しないことをfunctional AC-014で照合。runtime SLOを追加しない。 |
| `NFR-INTELLIGENCE-015-01` | `HELIXINTELLIGENCE-L2-015` | candidate NFR比較: L2は複数failure episodeを要求し最小論理解釈は2、より保守的な比較案は3 independent episodes。旧BBG/BBRのcandidate sourceに頻度thresholdの正本はない。 | 同じpatternの1/2/3独立episode、同一episode重複、別scope混在を入力しfalse-positive/miss/reproducibilityを同じ分母で計測。 | 2/3は未承認比較候補。independence/scope/denominator未確定ならunknown、単発を恒久Botにしない。 |
| `NFR-INTELLIGENCE-016-01` | `HELIXINTELLIGENCE-L2-016` | 機能境界計測候補: 親がbudget/deadline/retry/write-set等を入力として与えるため固定値を補わず、実入力値に対する境界逸脱を観測する。 | target, actor, write-set, side-effect, budget/deadline/retry, impact, recovery, post-checkを全て持つ候補、各field欠落/境界超過を照合。 | 親から新しいbudget数値は導出しない。provided budget超過/不明副作用の不成功とwrite-set境界はAC-016で測る。 |
| `NFR-INTELLIGENCE-018-01` | `HELIXINTELLIGENCE-L2-018` | 独立NFR非導出: current judgmentとLABO historical effectの時間軸/owner区分が対象。history retention durationや改善率は親が定めない。 | 同一scopeのcurrent proposalと複数時点LABO record、過去値current上書きmutationを与え、labels/owner handoffを記録。 | 時系列の意味分離をAC-018で確認。効果率、保存期間、自己改善性能は追加しない。 |
| `NFR-INTELLIGENCE-019-01` | `HELIXINTELLIGENCE-L2-019` | 独立NFR非導出: BRAIN knowledge applicability candidateの根拠とBRAIN/LABO責務区分でありranking accuracy/recall目標ではない。 | Pattern/Unit/Part/required inputs/conditions/evidence/versionを一致/不一致fixtureで比較しBRAIN writeback不在を観測。 | candidateのsource traceとunknownをAC-019で照合。適用精度thresholdや順位を規定しない。 |
| `NFR-INTELLIGENCE-020-01` | `HELIXINTELLIGENCE-L2-020` | 独立NFR非導出: Product Core meaning/backflow candidateのrevision/owner traceでありissue-resolution latency/close率を定めない。 | Product Core identity/revision/meaning claim/backflow/ownerを一致/異版/owner欠落fixtureで照合。 | proposal routingと正本変更ownerをAC-020で確認。解決時間/close率は追加しない。 |
| `NFR-INTELLIGENCE-067-01` | `HELIXINTELLIGENCE-L2-067` | 機能trace測定候補: 既決済みquality/order inputとLABO evidenceを既存L2-010 proposalへ受け渡すため、独立router performance閾値は不要。 | 決定済みinput/scope/source revision/LABO evidenceをproposalへ入力し、該当field/provenance retentionと異scope/missing evidenceを観測。 | 既存proposal contract以外のranker/assignment指標は作らない。欠落とscope mismatchはAC-067で照合。 |
| `NFR-INTELLIGENCE-072-01` | `HELIXINTELLIGENCE-L2-072` | 機能state測定候補: adopted 6-part parentは004 four-part shadow/review/rollbackと005 selected-source stale facet。 | 004の4 fixed pinsと005の2追加raw spansを別fixtureで照合する。scope、requirement、template、skill、model catalog、allowlistを独立選択し、各selected/non-selected change、source edge競合、同条件candidateあり/なしのfalse-positive/false-negative/unknown/反例、rollback証拠、shadow/review未取得状態を観測。 | 6-part identity/meaning traceと後続義務の測定であり、forced gate・global invalidation・性能限界・新しい採択条件を追加しない。 |
| `NFR-INTELLIGENCE-073-01` | `HELIXINTELLIGENCE-L2-073` | 機能境界測定候補: AAFD R-04 detector priority/direct projection禁止でありdetector precision目標/Issue throughputは定めない。 | finding text・detector/priority evidence・source revisionをpositive/unknownで入力しcandidate resultとIssue/Requirement/CI/merge object不生成を確認。 | priority/source traceをAC-073で照合。精度閾値やauto-projectionを追加しない。 |
| `NFR-INTELLIGENCE-078-01` | `HELIXINTELLIGENCE-L2-078` | 独立数値SLOを導出しない。R-06/07/09/10/11/12のexact set/digest、snapshot join、bounded invalidation、stale-write suppression、replay同値を機能条件として扱う。11 changed dimensions（authority/responsibility/runtime/provider/dependency/security/verification/capacity/cost/migration/release）を個別に追跡する。 | CASE-078各dimensionのpositive/missing/unknown/stale/mismatch fixtureを別々に数え、未観測・未評価を別記する。 | 意味要素の照合であり性能閾値・処理件数scale gate・DB技術を新設しない。 |

技術候補が親の意味、scope、owner、versionを変える必要がある場合は候補のまま保持し、上流へ理由付きで戻す。parameterごとのPO承認やStage完了gateは追加しない。
