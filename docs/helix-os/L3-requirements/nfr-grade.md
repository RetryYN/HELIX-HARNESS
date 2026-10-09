# HELIX-OS L3 NFR・技術候補

状態: L3委任承認済み／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — NFR-OS-014 測定候補

### NFR-OS-014-01 — 同一段階tupleの再現比較候補

親 `HELIXOS-L2-014` / `FR-OS-014`。この非拘束候補では、合成・非機密の同じinput tuple、pack/dependency version、configuration、environment identityでbuildした二つの独立成果物を比較する。L2は同一一式から同じ構成を再現することを要求する。旧paired sourceのsame-authority-input二回build比較は`DIST-LITE-AC-004`（旧system-test-design:41、旧`DIST-LITE-R-03`のartifact再現条件はrequirements:81–85）であり、2 buildはこの比較形式を起点にした設計検討点で、採択済みsample thresholdやSLAではない。旧`ST-DIST-001`はmanifest/profile identityのexact-set検証（system-test-design:24）なのでbuild回数の根拠にしない。tuple field identity/value、included/excluded set、output identity/digestの一致を記録する。欠落tuple、stale/wrong revision、environment差、failed buildを別件数にし、分母0/missingから率を計算しない。候補の検証方法は同じ固定tupleから2つ以上のindependent build traceを作り、field-by-field compareする静的 fixture design reviewである。production performance valueを含めない。

### NFR-OS-014-02 — stage transition / rollback evidence coverage候補

親 `HELIXOS-L2-014`。測定対象は明示scope/revisionのsynthetic release attempts。L2ではprior→next construction/verification/cutoverと問題時prior rollbackの双方が必要なので、2 transition classes (forward/cutover, rollback) を独立に数える。candidate numeratorは同一case state/record identityを保った両transitionのevidence-complete attempts、denominatorはscopeで開始した対象attempts。2はrequirementの二つのtransition種別を数える比較案で、成功率thresholdではない。stopped, failed, missing evidence, state mismatch, rollback target absent, unknown dependencyを別々に報告する。分母0/missingでは比率なし。実測timestampがある場合だけ開始から完了/stopまで同単位の有効標本でn_valid/p50/p95を出し、failed/missing/censored/unfinished件数を分ける。有効標本0なら分位値なし、実観測自体なしの場合だけ未測定とする。

候補値の意味: 2 buildと2 transitionは根拠付き探索比較値であり、product SLA/RTO/RPO、固定合格率、minimum sample gateにしない。値なしでもL3起草を止めず、採択PO判断やparameterごとの質問を発生させない。

## Stage 2c追補 — HELIXOS-L2-028 / HELIXOS-L2-029

以下は固定親のreceipt/provenance/unfinished義務を観測可能にする根拠付き技術候補であり、L2/L11にない採択値、SLA、運用default、pass thresholdではない。計測候補値はownerの未定義を理由に保留せず記録・比較設計する。実operation eligibility、SECURITY authority、HARNESS oracle適用可否、OS既存budget/deadline/stopは各既存契約から分離して扱い、新しいowner承認・parameter gateを作らない。意味・scope・owner・version変更が不可避の場合だけL2へ戻す。

### NFR-OS-028-01 — consult connection receipt census

観測owner: OSはconnection receiptとhandoff censusを記録し、oracle/permissionは既存source ownerが持つ。

親 `HELIXOS-L2-028` / `FR-OS-028`。母集団は、対象期間に固定scope/revision内でOSが実consult operationとして選択・認可したconnection attempts。authorization後dispatch前に停止したattemptも未完として分母に含める。認可を拒否された相談候補は分母外の適格性観測として別記する。proposal-only、未選択consult、通常のnon-consult operationは分母へ入れない。各attemptについて、ticket/revision/scope、元assignment、authorization/actor、selected source identity/revision/provenance/permission/relevance/scope/constraints（sourceを選択した場合。選択状態自体がmissing/unknownなら未選択とみなさずmissing/unknownとして別計数する）、request/response/return receipt、status、return owner、attempt/cost/partial/unfinished/resumeの必須fieldを個別に照合する。候補比較の分子は、ticket/revision/scope、元assignment、authorization/actor、選択sourceがある場合のidentity/revision/provenance/permission/relevance/scope/constraints、request/response/return receipt、status、return owner、attempt/cost/partial/unfinished/resumeの全必須fieldが同一attemptで一致するreceipt chain数とする。source選択時のprovenance/scope/constraintsを加えたため、この全必須field集合は従前の分子定義から拡大しており、分母の定義は変えない。分母は選択・認可済consult attempt数として定義し、件数と比率を併記する。分母0またはmissingなら比率なしとし0件と区別する。denied、response-missing、stale/conflicting source、stopped、partialを個別件数にする。経過時間候補は同一attemptのauthorization receipt時刻からreturn receipt時刻までとし、両端が有効な同じ時間単位の観測だけからp50/p95を示す。n_valid、failed/missing/censored件数、authorization後dispatch前の停止件数を別記する。n_valid=0でも失敗等の実観測があれば未測定とせず分位値なしとし、実観測自体がない場合だけ未測定とする。値は比較材料でありthresholdを置かない。

### NFR-OS-029-01 — composite trace and independent-review binding census

観測owner: OSはcomposite state/receipt bindingを記録し、実装・oracle・独立review・利用者acceptance判定は各固定ownerに残す。

親 `HELIXOS-L2-029` / `FR-OS-029`。母集団は明示scope/revisionで開始したOS-029 composite attempts。proposal-onlyおよび未開始ticketを混ぜない。proposal、元Worker差分、support選択時の選択source identity/version/scope/provenance/利用permissionおよび段階別support method、実consultを選んだ場合のOS-028 receipt、HARNESS-linked result、current HEAD/base/scope/oracle/resultへ束縛された独立review、owner receipt、finding/rework、unfinished/stop stateをstage別に数える。source fieldsはsupport選択時だけ必須で、consultを選ばない経路にも適用し、support未選択時にはproposal/sourceを要求しない。support選択状態自体がmissing/unknownなら未選択とみなさず、その状態をmissing/unknownとして別計数し、必須field欠落を完結traceへ含めない。完結trace数 / started composite attemptsを候補coverageとし、分母0/missingは比率なし、unfinished-at-stage、missing receipt、stale HEAD receipt、identity/context/authority conflict、failed/stoppedを別件数にする。独立review条件のunresolved finding=0は親が定める契約oracleであり追加技術thresholdではない。

### NFR-OS-029-02 — effort/time/cost分布

親 `HELIXOS-L2-029` / `FR-OS-029`。

実経過時間、実費、attempt countはstartからowner receiptまたはstopまで観測できる場合のみ親scope/revision別に収集する。時間単位は元timestampの共通単位を明記し、p50/p95にはn_validを付け、失敗・欠測・censored・打切り時点を分離する。budget消費/許可budget比は同じassignmentの同一次元・単位・期間に対応する値で、許可budgetが明示され0より大きい場合のみ算出し、分母0/missingと許可値なしを別にする。固定修正cycle数、latency/cost上限、最低標本数、SLAは作らない。

## Stage 2a — 8親のNFR候補（015/016/017/018/019/020/023/027）

状態: 委任承認済みの根拠付き測定候補。固定L2/L11にない値を採択値、運用既定、pass閾値として追加しない。旧NFRの「測定特性→evidence→判定」形式を再導出する（旧 `LEGACY-ASSET-DB669724249A14A665F0` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-74`、全体SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）。旧IPA grade、placeholder値、CI/runtime、旧pass値は使わない。

各候補は同一parent revision・scope・sourceで分布や欠落数を比較する設計である。必要field/obligation欠落の0期待だけは固定L2/L11の必須条件をfield単位で照合する契約oracleであり、任意の業務KPIではない。標本数、期間、latency/budget limit等を新設せず、実在母集団のnと限界を報告する。割合は対象母集団と分子/分母、単位、scope/revisionを明示し、分母0/missingは値なしとして件数を別記する。unknown/未判定を成功扱いまたは分母へ黙って算入しない。p50/p95は同じ定義・単位の有効な時間標本だけで算出し、n_validとfailed/missing/censoredの各件数を分けて報告する。欠測やcensoredを0へ置換しない。n_valid=0なら分位値なしとし、failed/missing/censored等の観測件数を保持する。実測自体がない場合だけ未実測とする。これらは記録と比較の形式であり、SLA、threshold、pass gateを新設しない。根拠のない値を理由にPO per-parameter確認待ちにはしない。

### NFR-OS-015-01 — authority trace completeness

親 `HELIXOS-L2-015` / `FR-OS-015`。Candidate 1: 管理record schema revision、target revision、executor actor、根拠、使用HARNESS contract版を含むidentity/revision/digest/decision-source/actor-time/projection-origin/raw-event/correction bindingを全fixture censusし、fieldごとのmissing/mismatchを数える。Candidate 2: correction-to-source traceの全経路率を明示scope内のsource/revision単位で比較する。L2/L11が要求する欠落のないtraceとraw immutabilityをoracleとし、無根拠なretention日数やevent件数を置かない。

### NFR-OS-016-01 — portfolio edge/state coverage

親 `HELIXOS-L2-016` / `FR-OS-016`。Candidate 1: 実際に対象範囲へ列挙された対象/edgeを全数集計し、unit/connection/composite別state、missing owner/dependency/diff/verification、unknown/stale件数を提示する。Candidate 2: 同じ明示portfolio scopeでrevision更新前後の影響edge stateを対応付け、state change、stale reason、未解決edgeを比較する。母集団は明示されたportfolio scopeで、未提示対象を全repo coverageと推定しない。固定L2の個別state識別が判定oracleである。

### NFR-OS-017-01 — ticket input binding・stability

親 `HELIXOS-L2-017` / `FR-OS-017`。候補1: 同一ticketに適用するsource/contractとinput digestを同条件で再投入し、ticketのtarget/scope/dependency/duty/return bindingが一致するかを測る。候補2: 実ticketのbudget消費量と契約入力に記録された許可budget値を別々に記録する。比率は分母が存在し0より大きい場合だけ算出し、zero/missingは算出不可として個別に報告する。期限はsource上の表現と実経過時間を別記し、現在のticket契約入力に計測開始点・単位付きの許可duration/windowが明示されている場合だけ同単位の比率候補を算出する。absolute deadline、duration/windowのzero/missing、開始点/単位不明は比率算出不可として区別する。task/revision別に観測分布を比較し、global default/cutoff/sequenceを作らない。

### NFR-OS-018-01 — cumulative execution control

親 `HELIXOS-L2-018` / `FR-OS-018`。HIL-NFR-36追補 `MPR-RC-HELIXOS-L2-018-002` は`docs/governance/decisions/po-decision-2026-10-03-additions10.md` row 34採択であり、f6dad2a baselineとは別のL2 1604–1619 registered semantic digest `5e2a621be8b4bda140bd796a48bedf2b3369daf5fad2665060ac41aa1a3174d2`（raw LF-inclusive span SHA-256 `634b700e1ed79c60f53235f6fb0e73348b7cc07264d4e4f8afb69e107aa1996d`）/ L11 1259–1276 registered semantic digest `e32e45319a3ac91004e3e1a985c7ff44e91b9e86f05b85c266d6b8d67acf87b5`（raw LF-inclusive span SHA-256 `ba303351c99a385506d9f151d0b51c03fb08922ce7d2848ffb3b1f485c4c221c`）へ結ぶ。候補1: 各fixtureで必要なbinding fieldの有無・不一致、重複claim/run、counter resetを全数確認し、各停止について停止理由・OS管理/推進への最初の返却record・該当時の既存source ownerへの訂正依頼を記録する。候補2: 消費budgetと許可budget値を別記し、分母が存在し0より大きい場合のみ比率を算出する。zero/missing budgetは算出不可として報告する。期限はabsolute deadline表現と経過時間を別記し、現在のticket契約入力に計測開始点・単位付き許可duration/windowが明示されている場合だけ同単位の比率を算出する。absolute deadline、duration/windowのzero/missing、開始点/単位不明は比率算出不可と区別する。attempt/failure countをticket/scope/revisionで層別比較する。HIL-NFR-36は適用sourceの選択/不選択、revision-bound deviation receipt、実際に通った各step/順序、結果/理由、未選択consult/support receipt不生成を照合する。source/receiptのunknown・missing・stale・conflict・scope unknownは該当facetとして集計し、assignment可否/継続の結果とは別にする。receipt状態だけを理由に事前gateまたは全assignment停止を計上しない。新しいdefault値、failure upper bound、response orderを作らない。

### NFR-OS-019-01 — event recovery consistency

親 `HELIXOS-L2-019` / `FR-OS-019`。Candidate 1: fixture内eventごとにduplicate/missing/stale/denied/not-run/success分類とreconstructed episodeの差を記録する。Candidate 2: normal crash/restartの再構築所要時間と、失敗位置から原eventで行うreplayの所要時間を別母集団に分け、各々実時刻がある場合のみ観測値として比較する。Candidate 3: 明示されたscope/revision内のhold・確認待ちを、期限宣言済/未宣言/期限切れ/判定unknownに分類し、各項目からsource・owner・未完義務・L1-002/008に沿う人間向けL2-019 projection listへのtraceを確認する。AI解決可能性の分類やPO宛先は測定・要求しない。観測値はfixture内の状態分類とtrace有無に限り、期限値、催促間隔、割合目標、保持期間、滞留閾値、replay時間の打切り閾値を設けない。L2の「誤successful checkpointを出さない」等を判定oracleにする。

### NFR-OS-020-01 — obligation selection/execution census

親 `HELIXOS-L2-020` / `FR-OS-020`。Candidate 1: HARNESS固定契約から当該change/scopeに適用される義務を全件数え、selected/executed/missingとexact head/oracle/environment bindingを比較する。Candidate 2: 実行開始から結果receiptまでの経過時間を同scope/run-classの実在timestampでp50/p95表示する。候補の段数/test count/latency cutoffは作らない。required obligationの欠落はsource-contract不合格。

### NFR-OS-023-01 — handoff binding completeness

親 `HELIXOS-L2-023` / `FR-OS-023`。Candidate 1: 実handoffごとにrevision/digest/causal ID/scope/duties/stop reason/evidence bindingのpresence/valueを全数照合する。unit successだけからconnection accepted、composite accepted、next-stage acceptedを作らないnegativeは各々独立fixtureとして数える。CASE-OS-023-02o, CASE-OS-023-02p, CASE-OS-023-02q, CASE-OS-023-02rのcausal ID欠落、scope不一致、unfinished duty欠落、stop reason不一致も各々独立negativeとして数え、該当bindingが不完全なhandoffはunresolvedのまま発生側source/管理へ返す。Candidate 2: sender-sendからreceiver-duty-accept receiptまでの実測時間を分類別に提示する。親が求める全必須bindingの欠落なしをoracleとし、任意のlatency targetやthroughput KPIは作らない。

### NFR-OS-027-01 — eligibility conjunction・evaluation evidence

親 `HELIXOS-L2-027` / `FR-OS-027`。Candidate 1: 六つの低リスク条件 + per-operation authorityをbool conjunctionとして個別evidence付きで照合する。重み付きscoreや総合risk値は作らない。Candidate 2: LABO評価時、実在観測件数n、task/model class、scope/revision、success/failure/rework/latency/cost/reliability分布、uncertainty/counterexample/unknownを記録し、採用oracle候補の比較資料にする。固定L2/L11はuniversal minimum N/score thresholdを禁止し、一度の成功だけではassessedとしない。unknown/missing/stale/conflictの分類・authority・applicability evidence、output classification/scope、result status、oracle/duty integrityとL2:835 owner routeも区別して数える。assignment欠落、作成Workerと異なるactorによるhuman confirmation欠落、LABO受領欠落を独立に数える。Candidate/score/CI/reviewer identityはpermissionやhuman decisionを生まない。

### 技術値差戻し

候補の測定値は比較・反証可能性とscopeを付けL10に記録する。L2のmeaning、scope、owner、versionを変えなければ成立しないときだけ上流へ戻し、数値parameterごとのPO確認や新gateを作らない。

## Stage 3：非機能要件候補と技術値案

以下は通常のL3候補であり、値ごとのPO承認gateではない。sourceが数値を指定しない点は旧値の無根拠流用を許さないが、比較可能な技術候補を起草することは妨げない。採用候補は設計・L10 fixtureで測定し、固定L2の意味・owner・版を変えない。

| NFR ID / 親 / FR trace | 候補値・根拠 | 比較案と限界 | L10計測 |
|---|---|---|---|
| NFR-OS-L3-032-01 / 032 / AC-01..06 | identity/fingerprint/baseline/scope/oracleを照合し、versionは完全一致または既存登録済みの明示compatibility条件で判定する。 | undeclared partial matchは除外するが、親が認める明示compatibilityの有効経路は保持する。 | exact-version正常、登録済compatibility別version正常、未宣言compatibility/各必須field欠落・不一致の独立fixtureを照合。 |
| NFR-OS-L3-033-01 / 033 / AC-01..06 | 最小candidateは同一snapshotのrun+rerun 2回、選択集合全件digest/fingerprint一致。各選択detectorの適用engine/output種別関係も登録宣言・OS receipt間で一致することを照合する。determinismを比較する最低対。 | 3回runはflakiness検出力を上げるが計算費用増。L10は2回の受入対に加え3回stressを測定候補とする。適用関係の未宣言・誤結合を成功へ数えず、欠落原因別の既存戻し先を維持する。 | 2-run一致率=100%のselected capability coverage、差異隠蔽0、選択detectorの適用関係の誤受入0。 |
| NFR-OS-L3-034-01 / 034 / AC-01..05 | disposition別必須証拠充足100%、必須証拠欠落時のterminalization 0。 | 全dispositionへ一律PO receiptを要求する案はL11のauthority差を広げるため不採択。 | 全L11定義disposition枝ごとにrequired evidence field mutation、誤terminal 0。 |
| NFR-OS-L3-035-01 / 035 / AC-01..05 | 同一event identity/revisionのjob registration cardinality=1。3 delivery再送はtest fixture候補。 | 1回だけでは冪等性を測れず、10回は初期要件の根拠なし。3回は初回+重複二回の判別 fixtureに限定。 | 各event 3 delivery後もregistered job 1、job executionは測らない。 |
| NFR-OS-L3-036-01 / 036 / AC-01..04 | 全Retrofit upgradeごとにplan確定前preflightとapply直前再照合のcoverage 100%。 | plan前だけではapply前driftを見逃す。通常operationへ拡張しない。 | 複数upgrade ticket fixtureで各upgrade両境界のcurrent source/authority照合、欠落0。非upgrade保持群と義務/policy省略negative（FV CASE-OS-L10-036-07, CASE-OS-L10-036-08a, CASE-OS-L10-036-08b）は別集計し、固定L11 oracleに対する省略期待数0を照合する。upgrade分母と混ぜず、追加の数値閾値は設けない。 |
| NFR-OS-L3-037-01 / 037 / AC-01..05 | 週次報告・観測の結果、source/revisionの可追跡性、未観測と差分なしの区別を測る。頻度の出所は旧BR §3.3/FR-L1-11。 | 週次頻度は既存親で保持。連続二観測はL10 fixture設計の一候補で、閾値や新しい成立条件にしない。 | Reverse/Backflowとsource-classified debtの二経路を別々に通し、fixture上の複数週・週境界・欠測・staleを比較。欠測をno-drift扱いしない。 |
| NFR-OS-L3-038-01 / 038 / AC-01..04 | source proposal IDあたりappend 1、snapshot digestの整合100%、非原子的finding時row増分0、非決定抽出時current update 0/snapshot不変、失敗時完了claim 0。 | retry回数の固定値は親にないため設定しない。 | same ID重送/途中失敗、041-003のatomicity findingとsame-input nondeterminism、candidate row増分・current ledger・snapshot/receiptを再照合。 |
| NFR-OS-L3-040-01 / 040 / AC-01..06 | 入力された適用中policyの初回attempt計上有無・failure class・同一episode累積に従う上限判定と、lineage/counter/budgetの保持、上限到達またはledger unknown時の正しいtyped returnを測る。 | retry数値の新設・比較・優先値の提案は本親の範囲外。 | 上限がunknownなら既存policy decision ownerへ、ledgerがmissing/unreadableならHELIXOS-L2-019の記録ownerへ戻す条件を分け、初回計上あり/なしの既存policy対照、failure classの対象内/外、上限到達/未到達、Worker交代、実験budget分離を個別に観測する。FV CASE-OS-L10-040-07g..07jは、正しい累積Nでの拒否と正しいN-1での許可を区別して照合する。数値上限や新しいperformance閾値は設けない。 |
| NFR-OS-L3-041-01 / 041 / AC-01..04 | resumeごとにcanonical source/authority再取得100%、stale source継続0。 | cacheを信頼する案はsource driftを見落とす。 | resumed pathでsource digest/revision再照合、欠落時fail-safe。 |
| NFR-OS-L3-042-01 / 042 / AC-01..06 | strict schema/digestと、既存契約に実在する緩和条件・対象・期限・再検証receiptの適用一致を測る。 | expiry比較は既存契約が与える場合に限る。新しい期限値や期限契約を作らない。 | strict failure、既存期限の境界前後、適用外scope、期限/receipt欠落を独立に照合。 |
| NFR-OS-L3-043-01 / 043 / AC-01..06 | request/call/result因果trace completeness 100%、既存契約上request必須のoperationでrequestなしcallのauthorized count=0。request不要operationの許可済み実行は数値対象外とし、新requestを導入しない。 | event統合表示は件数を減らすが段階差を失うため採用しない。 | event ordering/correlation field欠落・逆転を注入し成功trace誤判定0。 |
| NFR-OS-L3-044-01 / 044 / AC-01..03 | prose-only handoverによるresolution=0、unknown/stale/conflict時の該当finding保留率を観測する。 | 新しいreceipt schema/十分条件とsource HEAD mismatch判定は対象外。 | prose-onlyと固定source契約上の既存evidence有無を比較し、保留状態・理由の保持を確認。 |
| NFR-OS-L3-049-01 / 049 / AC-01..05 | configured max/WIP/state countsとutilizationを別軸で観測し、utilizationは同一scope内でも既存config revisionごとの設定capacityと、そのrevisionが適用された観測時間を対応させる。 | 親にない固定bucket幅や観測頻度は設けない。既存の設定変更時点でwindowを分割するか、revisionが不変の区間だけを比較する。変更時点または経過時間が不明な区間から利用率を作らない。 | 同じtask traceを設定revisionごとの不変区間で照合し、各区間のcapacity・観測時間・state/count・成果/予算/未完義務lineageを別記する。revision境界または時間が不明なら利用率はunknown/未評価とし、0や成功率へ置換しない。後段capacity確保なしのdispatchは0。 |
| NFR-OS-L3-050-01 / 050 / AC-01..05 | 適用中の既存設定閾値・capacity・縮退条件に対する判定、原因別backpressure、lease保全を測る。 | 閾値・bucket時間・増枠数値はこの親で新設しない。1/2 bucketや15/60minは採択候補にもせず、比較はfixtureに与えた設定値だけで行う。 | 設定上のspike/持続状態、downstream blocker、縮退、stale returnを別々に与え、誤増枠・backpressure漏れを確認。 |
| NFR-OS-L3-051-01 / 051 / AC-01..09 | task class/scope/revisionに対する既存適性evidenceの適用条件・版照合と、task単位選択を測る。expiry fieldはsourceが持つ場合のみ照合し、expiryなしをunknownとしない。 | evidence freshness期限/thresholdの新設は対象外。期限が既存sourceにある場合のみ、その入力値を用いる。 | 既存期限のある/ないsourceを分け、scope変更・stale・同名別providerを独立fixtureで照合する。 |

## Stage 4：NFR候補と測定案（6件）

候補値は固定L2/L11の機能境界を測るための比較可能な初期値で、承認済み業務閾値・実測・追加PO gateではない。親の意味・scope・owner・版を変えず、測定後に限界や適用性を記録する。

| NFR候補ID / 親 / AC | 候補値と根拠 | 比較案 | L10測定と適用限界 |
|---|---|---|---|
| `NFR-OS-L3-021-01` / 021 / `AC-OS-L3-021-01`, `AC-OS-L3-021-02`, `AC-OS-L3-021-03` | 選択component/artifact/scopeとの誤照合0件、選択service evidenceの誤代用0件、scope外配布0件を候補とする。誤配布・黙示収載を許すと復旧先と成果物の同一性を証明できないため。 | 厳密なidentity/digest/scopeとservice別evidence照合を、tag/名前一致や他service evidence流用と比較する。 | service evidenceを選択ごとに欠落/入替し、複数service選択と未選択service除外を含めbinding誤り・scope外導入を計測する。成熟度/impact/再現性/運用証拠欠落も個別に照合する。対象project以外の完成度・全体release価値は測らない。 |
| `NFR-OS-L3-022-01` / 022 / `AC-OS-L3-022-01`, `AC-OS-L3-022-02`, `AC-OS-L3-022-03` | 与えた完全fixtureの必須因果edge追跡100%、候補/観測からの誤authority変更0件を候補とする。L2は一連の還流とLABO独立評価・提案・比較実験依頼およびowner分離を要求する。 | 完全event traceと、candidate件数だけから効果を主張する集計を比較し、件数のみの改善成功/採択候補0を照合する。 | 各edge/LABO出力欠落・identity driftを注入し、trace coverageと誤変更を数える。業務効果・退行率の評価はLABO ownerの責務なのでここでは目標値にしない。 |
| `NFR-OS-L3-024-01` / 024 / `AC-OS-L3-024-01`, `AC-OS-L3-024-02`, `AC-OS-L3-024-03` | 非許可data送信0件、提供/評価/採否state誤統合0件を候補とする。親のpermission/data-use境界を直接観測できる。 | 既存許可scopeに限定した送信と、過大scope/tenant混入を比較する。 | permission/data class/revision/scopeを一軸ずつ変え、送信範囲・actor/stateを照合。後続学習/推薦や顧客価値を測定対象にしない。 |
| `NFR-OS-L3-046-01` / 046 / `AC-OS-L3-046-01`, `AC-OS-L3-046-02`, `AC-OS-L3-046-03` | dispatchからadmission候補までの必須binding field一致100%、変更影響後のstale証拠流用0件、および一段の成功だけから次段成功を生成する誤り0件を候補とする。 | current exact pair照合と、HEAD/base/authorityを固定扱いする比較案を対比する。 | authority/HEAD/base/scope/contractの単一mutationを計測し、影響範囲だけstaleになることを確認。新規check/approvalや本番merge回数は測らない。 |
| `NFR-OS-L3-048-01` / 048 / `AC-OS-L3-048-01`, `AC-OS-L3-048-02`, `AC-OS-L3-048-03` | 既存条件未充足でのfalse resolution 0件、closed ticketの履歴上書き0件、未追跡/打切り/観測window未満からのdefect 0誤認0件を候補とする。unknown eligibility/missing populationは未評価で別表示し、成功母数へ算入しない。 | evidence-backed resolutionとprose/time/path-only解決、完全観測とcensored observationを比較する。 | complete current evidence、各欠落/古いevidence、再発行後の同条件LABO評価、後日findingをfixture化。L2-007の十分条件は変更せず、改善効果のKPIを作らない。 |
| `NFR-OS-L3-052-01` / 052 / `AC-OS-L3-052-01`, `AC-OS-L3-052-02`, `AC-OS-L3-052-03` | 適格性未確認local/remote資源の誤削除0件、conflict/stale/依存変化/review binding不一致後の旧review流用0件を候補とする。 | 最新baseで再照合して実不一致時に返却する案と、最新base変更後もreviewed pair一致・stale=0・依存維持を確認せず一律returnと分類する案を比較する。pair一致・stale=0・依存維持時の結果は保持可能な既存stateとして記録し、必須保持や自動return閾値を作らない。 | 条件ごとにmutationしcleanup結果、remote authority、content HEAD不変、review bindingを測る。時間短縮/削除数を成果指標とせず、pair一致・stale=0・依存維持時のstate選択と根拠を記録する。 |


## Stage 5 — HELIXOS-L2-025/026/031/047 非機能候補

この追補は既存文書のStage 2b/Stage 2a/Stage 3/Stage 4 scope欄を遡及変更せず、ここに列挙したStage 5対象だけを追加する候補である。先頭のstatusは先行scopeの状態を示す。

以下はL3候補の観測量であり、運用SLO、approval gate、CI pass条件ではない。固定sourceに根拠がない技術値・母集団・回数は追加しない。

| NFR候補 | 親・AC | 観測候補 | 保持する境界 |
|---|---|---|---|
| `NFR-OS-L3-025-01` | `HELIXOS-L2-025`; `AC-OS-L3-025-01..03` | unit/connection/compositeごとの対象revision・scope・owner・証拠束縛欠落、7段traceの全段値一致とstage単独欠落、7製品gate誤追加、1.0全体normalと1製品欠落をfixture内で別記する。 | fixture上で個別正常/unknown等および誤成立0を確認するが、全運転上の達成率・Stage gateへ拡張しない。|
| `NFR-OS-L3-026-01` | `HELIXOS-L2-026`; `AC-OS-L3-026-01..05` | dependency/safety closure、unknown/stale、代替空間の範囲、最小性の立証状態、各packの版・適用対象と要求確認→作業→検証→結果記録の経路を別fieldで観測する。 | 代替空間不足時は最小性未立証。source/contract/permission/dependency state・未決pack・bootstrap cycleを別fieldで観測する。固定pack/stage数、比較回数、成功率を新設しない。|
| `NFR-OS-L3-031-01` | `HELIXOS-L2-031`; `AC-OS-L3-031-01..05` | source/base HEAD、profile、選択検査集合、環境/runner/cache、wall-clock、runner-minute、failure feedback latencyのp50/p95、超過原因、区間時間、exit/output、母集団・期間・除外理由と、安全性/未回収義務を計測候補として結ぶ。 | 60秒/3分は旧environment/verification populationに結ばれた比較値。現行共通SLOではなく、適用契約/予算不明なら未評価。receiptの全測定field、Recovery Issueの正本誤用、recovery安全指標・optimization boundaryをfixture別に記録する。p50/p95算出最低標本数や期間を足さない。|
| `NFR-OS-L3-047-01` | `HELIXOS-L2-047`; `AC-OS-L3-047-01..05` | original/successor ticket identity、reason/evidence/owner relation、元assignmentとの因果relation、未完義務の追跡、旧assignment/result/authorityの保持または明示適格化を結ぶcoverage候補。 | 運用属性だけの差分による意味revision増加、または旧revisionの上書き・暗黙継承はfixture内で0。reason/evidence/根拠source revisionと各非継承軸、双方の参照方向・backflow boundaryと検収oracle不足/Worker入力不足の正常返却をfixture別に記録する。新しいgraph・relation型・運用KPIを作らない。|

NFR集約CASEはFVの個別functional CASEだけを集計する。fixture数は静的oracle一覧の行数であり、runtime母集団や実観測結果を意味しない。

### Stage 5 review01補正 — 個別fixture参照の拡張

機能CASEの補正範囲は次のとおり。alias CASE-031-25とCASE-047-20はそれぞれ同一入力のindex aliasであり独立分母に数えない。旧CASEの範囲記述だけで新fixtureを含むと推定しない。

| NFR候補 | 補正後のAC | 個別fixture範囲 | 観測内容と限界 |
|---|---|---|---|
| `NFR-OS-L3-025-01` | AC-025-01〜03 | CASE-025-01〜21, 022〜039, 047〜057（定義50件、実行数ではない）。022〜032は既存補正CASE、033〜039はHELIX側trace各stageの単独欠落、047〜049は配布gate/全体normal/1製品欠落、050はHELIX＋複数異種projectの同一normal、051〜057はproject B各trace stageの単独欠落。 | HELIX＋複数異種projectを同一fixtureに含む各projectの要求authority→ticket→Worker→検収→提供/運用→LABO評価→OS還流各段のsource値一致、HELIX/project B各段単独欠落、target revision/選択構成版/unit identity/state/evidence束縛、7製品gate/1製品欠落をfixtureごとに観測。doc/mechanism existenceのみの誤成立は0候補。全運転達成率ではない。|
| `NFR-OS-L3-026-01` | AC-026-01〜05 | CASE-026-01〜60。CASE-026-056〜059はAC-026-05、CASE-026-060はAC-026-03へ対応。 | 後続版/外部配布/結果生成、過小・過大構成、能力表示、入力10軸、資源不足/検証不合格、導出成功からの段階採択生成を分ける。空pack除外とdependency unknownは別state。SLO/固定pack数なし。|
| `NFR-OS-L3-031-01` | AC-031-01〜05 | CASE-031-01〜95（066/068/070/072除外、031-25は031-06のalias）。 | 個別値、ticket/source/base/measurement scope・HARNESS義務集合の不一致、回収正常、旧数値の適用/意味変更、既決nightly工程、正しさ/性能、Recovery Issue非正本、LABO/authority境界、INFRA returnをfixture内で観測。母集団・適用予算不明は未評価。|
| `NFR-OS-L3-047-01` | AC-047-01〜05 | CASE-047-01〜41。ただし047-20は047-04のalias。 | 元revision・issuer/target/reason/evidence/scope/relationの保持、参照両方向、提案authority境界、元assignmentと未完義務追跡をfixture内で観測。ticket処理KPIを作らない。|

実測値はなく、fixture coverageをruntime母集団や達成率へ換算しない。既存review followupの個別coverage主張はこの表のcase identity/alias規則に従って読む。
