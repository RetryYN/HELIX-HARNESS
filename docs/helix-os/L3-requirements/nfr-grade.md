# HELIX-OS L3 NFR・技術候補（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

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

親 `HELIXOS-L2-028` / `FR-OS-028`。母集団は、対象期間に固定scope/revision内でOSが実consult operationとして選択・認可したconnection attempts。authorization後dispatch前に停止したattemptも未完として分母に含める。認可を拒否された相談候補は分母外の適格性観測として別記する。proposal-only、未選択consult、通常のnon-consult operationは分母へ入れない。各attemptについて、ticket/revision/scope、元assignment、authorization/actor、selected source identity/revision/permission/relevance、request/response/return receipt、status、return owner、attempt/cost/partial/unfinished/resumeの必須fieldを個別に照合する。候補比較の分子は、ticket/revision/scope、元assignment、authorization/actor、selected source identity/revision/permission/relevance、request/response/return receipt、status、return owner、attempt/cost/partial/unfinished/resumeの全必須fieldが同一attemptで一致するreceipt chain数とし、分母は選択・認可済consult attempt数として定義し、件数と比率を併記する。分母0またはmissingなら比率なしとし0件と区別する。denied、response-missing、stale/conflicting source、stopped、partialを個別件数にする。経過時間候補は同一attemptのauthorization receipt時刻からreturn receipt時刻までとし、両端が有効な同じ時間単位の観測だけからp50/p95を示す。n_valid、failed/missing/censored件数、authorization後dispatch前の停止件数を別記する。n_valid=0でも失敗等の実観測があれば未測定とせず分位値なしとし、実観測自体がない場合だけ未測定とする。値は比較材料でありthresholdを置かない。

### NFR-OS-029-01 — composite trace and independent-review binding census

観測owner: OSはcomposite state/receipt bindingを記録し、実装・oracle・独立review・利用者acceptance判定は各固定ownerに残す。

親 `HELIXOS-L2-029` / `FR-OS-029`。母集団は明示scope/revisionで開始したOS-029 composite attempts。proposal-onlyおよび未開始ticketを混ぜない。proposal、元Worker差分、実consultを選んだ場合のOS-028 receipt、HARNESS-linked result、current HEAD/base/scope/oracle/resultへ束縛された独立review、owner receipt、finding/rework、unfinished/stop stateをstage別に数える。完結trace数 / started composite attemptsを候補coverageとし、分母0/missingは比率なし、unfinished-at-stage、missing receipt、stale HEAD receipt、identity/context/authority conflict、failed/stoppedを別件数にする。独立review条件のunresolved finding=0は親が定める契約oracleであり追加技術thresholdではない。

### NFR-OS-029-02 — effort/time/cost分布

親 `HELIXOS-L2-029` / `FR-OS-029`。

実経過時間、実費、attempt countはstartからowner receiptまたはstopまで観測できる場合のみ親scope/revision別に収集する。時間単位は元timestampの共通単位を明記し、p50/p95にはn_validを付け、失敗・欠測・censored・打切り時点を分離する。budget消費/許可budget比は同じassignmentの同一次元・単位・期間に対応する値で、許可budgetが明示され0より大きい場合のみ算出し、分母0/missingと許可値なしを別にする。固定修正cycle数、latency/cost上限、最低標本数、SLAは作らない。

## Stage 2a — 8親のNFR候補（015/016/017/018/019/020/023/027）

状態: L3未承認の根拠付き測定候補。固定L2/L11にない値を採択値、運用既定、pass閾値として追加しない。旧NFRの「測定特性→evidence→判定」形式を再導出する（旧 `LEGACY-ASSET-DB669724249A14A665F0` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-74`、全体SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）。旧IPA grade、placeholder値、CI/runtime、旧pass値は使わない。

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

親 `HELIXOS-L2-019` / `FR-OS-019`。Candidate 1: fixture内eventごとにduplicate/missing/stale/denied/not-run/success分類とreconstructed episodeの差を記録する。Candidate 2: normal crash/restartの再構築所要時間と、失敗位置から原eventで行うreplayの所要時間を別母集団に分け、各々実時刻がある場合のみ観測値として比較する。根拠のない保持期間、exactly-once timeout、replay時間の打切り閾値を設けない。L2の「誤successful checkpointを出さない」等を判定oracleにする。

### NFR-OS-020-01 — obligation selection/execution census

親 `HELIXOS-L2-020` / `FR-OS-020`。Candidate 1: HARNESS固定契約から当該change/scopeに適用される義務を全件数え、selected/executed/missingとexact head/oracle/environment bindingを比較する。Candidate 2: 実行開始から結果receiptまでの経過時間を同scope/run-classの実在timestampでp50/p95表示する。候補の段数/test count/latency cutoffは作らない。required obligationの欠落はsource-contract不合格。

### NFR-OS-023-01 — handoff binding completeness

親 `HELIXOS-L2-023` / `FR-OS-023`。Candidate 1: 実handoffごとにrevision/digest/causal ID/scope/duties/stop reason/evidence bindingのpresence/valueを全数照合する。unit successだけからconnection accepted、composite accepted、next-stage acceptedを作らないnegativeは各々独立fixtureとして数える。Candidate 2: sender-sendからreceiver-duty-accept receiptまでの実測時間を分類別に提示する。親が求める全必須bindingの欠落なしをoracleとし、任意のlatency targetやthroughput KPIは作らない。

### NFR-OS-027-01 — eligibility conjunction・evaluation evidence

親 `HELIXOS-L2-027` / `FR-OS-027`。Candidate 1: 六つの低リスク条件 + per-operation authorityをbool conjunctionとして個別evidence付きで照合する。重み付きscoreや総合risk値は作らない。Candidate 2: LABO評価時、実在観測件数n、task/model class、scope/revision、success/failure/rework/latency/cost/reliability分布、uncertainty/counterexample/unknownを記録し、採用oracle候補の比較資料にする。固定L2/L11はuniversal minimum N/score thresholdを禁止し、一度の成功だけではassessedとしない。unknown/missing/stale/conflictの分類・authority・applicability evidence、output classification/scope、result status、oracle/duty integrityとL2:835 owner routeも区別して数える。assignment欠落、作成Workerと異なるactorによるhuman confirmation欠落、LABO受領欠落を独立に数える。Candidate/score/CI/reviewer identityはpermissionやhuman decisionを生まない。

### 技術値差戻し

候補の測定値は比較・反証可能性とscopeを付けL10に記録する。L2のmeaning、scope、owner、versionを変えなければ成立しないときだけ上流へ戻し、数値parameterごとのPO確認や新gateを作らない。

## Stage 3：非機能要件候補と技術値案

以下は通常のL3候補であり、値ごとのPO承認gateではない。sourceが数値を指定しない点は旧値の無根拠流用を許さないが、比較可能な技術候補を起草することは妨げない。採用候補は設計・L10 fixtureで測定し、固定L2の意味・owner・版を変えない。

| NFR ID / 親 / FR trace | 候補値・根拠 | 比較案と限界 | L10計測 |
|---|---|---|---|
| NFR-OS-L3-032-01 / 032 / AC-01..05 | identity/fingerprint/version/baseline/scope/oracleは完全一致、欠落許容0。L2のexact-known限定から導出。 | partial-matchを許すと既知条件境界を変えるため除外。 | 1 positive + 各field個別欠落/不一致、eligible誤り0。 |
| NFR-OS-L3-033-01 / 033 / AC-01..05 | 最小candidateは同一snapshotのrun+rerun 2回、選択集合全件digest/fingerprint一致。determinismを比較する最低対。 | 3回runはflakiness検出力を上げるが計算費用増。L10は2回の受入対に加え3回stressを測定候補とする。 | 2-run一致率=100%のselected capability coverage、差異隠蔽0。 |
| NFR-OS-L3-034-01 / 034 / AC-01..05 | disposition別必須証拠充足100%、必須証拠欠落時のterminalization 0。 | 全dispositionへ一律PO receiptを要求する案はL11のauthority差を広げるため不採択。 | 全L11定義disposition枝ごとにrequired evidence field mutation、誤terminal 0。 |
| NFR-OS-L3-035-01 / 035 / AC-01..05 | 同一event identity/revisionのjob registration cardinality=1。3 delivery再送はtest fixture候補。 | 1回だけでは冪等性を測れず、10回は初期要件の根拠なし。3回は初回+重複二回の判別 fixtureに限定。 | 各event 3 delivery後もregistered job 1、job executionは測らない。 |
| NFR-OS-L3-036-01 / 036 / AC-01..04 | 全Retrofit upgradeごとにplan確定前preflightとapply直前再照合のcoverage 100%。 | plan前だけではapply前driftを見逃す。通常operationへ拡張しない。 | 複数upgrade ticket fixtureで各upgrade両境界のcurrent source/authority照合、欠落0。 |
| NFR-OS-L3-037-01 / 037 / AC-01..05 | 週次をUTC 7日bucketを測定候補とし、weekly HARNESS driftとcumulative source-classified debtの二経路を別々に集計する。固定L2の週次語と2期間観測から比較する。 | rolling 7-dayは境界で同観測を重複評価しやすい。calendar-weekは端点変化の検査が必要。 | 両routeのscope別coverage、週境界・missing bucket・stale sourceを2期間fixtureで測り、未観測をno-drift扱い0。 |
| NFR-OS-L3-038-01 / 038 / AC-01..04 | source proposal IDあたりappend 1、snapshot digestの整合100%、非原子的finding時row増分0、非決定抽出時current update 0/snapshot不変、失敗時完了claim 0。 | retry回数の固定値は親にないため設定しない。 | same ID重送/途中失敗、041-003のatomicity findingとsame-input nondeterminism、candidate row増分・current ledger・snapshot/receiptを再照合。 |
| NFR-OS-L3-040-01 / 040 / AC-01..06 | retry上限candidateは2回の自動retry後typed return。failureが続く場合にbounded recoveryを促す暫定候補。 | 1回は一過性failureに敏感、3回は無駄な反復を増やす可能性。全値ともsource未指定のAI候補であり、適用は既存policy値入力に結ぶ。 | transient/permanent failure fixtureで回復率・重複実行・return誤りを1/2/3比較。 |
| NFR-OS-L3-041-01 / 041 / AC-01..04 | resumeごとにcanonical source/authority再取得100%、stale source継続0。 | cacheを信頼する案はsource driftを見落とす。 | resumed pathでsource digest/revision再照合、欠落時fail-safe。 |
| NFR-OS-L3-042-01 / 042 / AC-01..06 | default strict schema/digest違反0件を昇格。既存selected contractにexpiryがある場合のみ期限候補24hを比較し、適用scopeをその契約入力に従わせる。 | 4h/24h/72h比較。短期は再検証コスト、長期窓はstale exposure。既存の再検証条件を超える承認者・PO gateは作らない。既存期限が指定されるoperationではそれを優先し、24hは候補値として扱う。 | strict failure、緩和期限境界直前/直後、対象外scope、再検証なしを比較。 |
| NFR-OS-L3-043-01 / 043 / AC-01..05 | request/call/result因果trace completeness 100%、既存契約上request必須のoperationでrequestなしcallのauthorized count=0。request不要operationの許可済み実行は数値対象外とし、新requestを導入しない。 | event統合表示は件数を減らすが段階差を失うため採用しない。 | event ordering/correlation field欠落・逆転を注入し成功trace誤判定0。 |
| NFR-OS-L3-044-01 / 044 / AC-01..03 | prose-only resolution=0、resolution receiptのsource/head/finding exact match=100%。 | text similarityで自動closeする案は親のhandover boundaryを緩めるため除外。 | prose-onlyとtyped receiptを比較し、stale head/missing evidence close 0。 |
| NFR-OS-L3-049-01 / 049 / AC-01..05 | observation bucket 15min candidate、configured max/WIP/state countsは別軸。15minは短期状態遷移の視認候補で固定worker数でない。 | 1minはnoise/high overhead、60minは短い競合を隠す。15/60分fixtureで状態誤分類と観測負荷を比較。 | 同じtask traceを各windowでreplayしstate conservation、後段capacity確保なしのdispatch 0。 |
| NFR-OS-L3-050-01 / 050 / AC-01..05 | capacity増枠は設定thresholdを2連続15min observation bucket超過するcandidateで抑制する。単発spikeによる拡大を避ける。 | 1 bucketは反応が速いがspikeに弱い、60minは遅い。threshold数値は運用設定値を入力しOSが発明しない。 | spike/持続queue/下流bottleneckの各fixture、増枠誤り・backpressure漏れを比較。 |
| NFR-OS-L3-051-01 / 051 / AC-01..06 | task class/scopeに結ばれた適性evidenceのfreshness候補30日。 | 7日はfreshだが再計測負荷、90日はdriftを許しやすい。sourceにもっと短いexpiryがあればそちらを使う。 | 7/30/90日境界、scope変更、provider名だけ違うfixtureでstale/false-fitを測る。 |
