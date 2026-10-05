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

実経過時間、実費、attempt countはstartからowner receiptまたはstopまで観測できる場合のみ親scope/revision別に収集する。時間単位は元timestampの共通単位を明記し、p50/p95にはn_validを付け、失敗・欠測・censored・打切り時点を分離する。budget消費/許可budget比は同じassignmentの同一次元・単位・期間に対応する値で、許可budgetが明示され0より大きい場合のみ算出し、分母0/missingと許可値なしを別にする。固定修正cycle数、latency/cost上限、最低標本数、SLAは作らない。
