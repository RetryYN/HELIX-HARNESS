# HELIX-INTELLIGENCE L3 NFR・技術候補（Stage 2c）

状態: L3未承認（委任承認前）の起草候補。固定採択L2に数値thresholdがない箇所は、観測と比較を可能にする根拠付き技術候補を記録する。候補値・測定軸は採択値、実測結果、実行許可を意味しない。

旧HELIX NFR文書の「特性→計測→受入」の構造を起点に再導出する（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-81`、LEGACY-ASSET-DB669724249A14A665F0）。旧IPA grade、数値、pass条件、CI/runtime、HARNESS KPI/料金モデルを現行NFRとして再利用しない。該当する数値sourceは採択L2/L11に見当たらないため、以下は候補の比較設計である。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。Stage 2aの010/066草稿は含めない。項目別sourceと再導出は時点監査へ記録する。

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
