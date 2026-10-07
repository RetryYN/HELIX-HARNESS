# HELIX-OS L3 業務要件（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — HELIXOS-L2-014 business境界

固定親 `HELIXOS-L2-014` は段階構成の管理・検証・配布・切戻しを扱うが、既存の業務成果に独立したbusiness outcome、business owner、KPIを追加しない。新しい `BR-OS-014` は作らず、親の各成果・担当・境界は `functional-requirements.md` の `FR-OS-014` と `business-verification.md` の照合表から固定L2/L11へ参照する。OSの段階成立記録は1.0到達、対象製品release、外部公開、L3承認を生成しない。意味・scope・owner・versionを変える必要がある場合のみ、既存authority手順でL2へ戻す。技術候補値ごとのPO確認や新gateは設けない。

## Stage 2c追補 — HELIXOS-L2-028 / HELIXOS-L2-029

固定L2-028/029には、既存FR/ACの外に独立したbusiness outcome、business owner、業務KPIは定義されていない。このため新しいBR-OS-028/029を作らず、L2-028/029の成果とowner境界は `../L3-requirements/functional-requirements.md` の FR-OS-028/029 と固定L11へ参照する。意味・scope・owner・versionを変えなければならない場合だけL2へ戻す。技術値ごとのPO確認、新approval、Stage gateを作らない。

## Stage 2a — 8親の業務要件（015/016/017/018/019/020/023/027）

状態: L3未承認の起草候補。ここでいうbusinessはOS機構の管理・推進・記録上の成果であり、外部提供製品の成果ではない。新しいowner、事業KPI、PO確認gate、候補完了判断を作らない。

旧HELIXのfunctional/business/NFR三分離（`LEGACY-ASSET-9A772391C7FB1298D45F`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-56`）とbusiness concernを機能詳細から分ける形式（`LEGACY-ASSET-A6E2C7F0565E5F804F06`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21-39,84-104`）を起点にする。旧BR-21/Learning Engine、plan metrics、approval behaviorをOSへ移さず、各ownerは採択L2の意味に従って再導出する。旧READMEのL3→L12と旧L10 processのL3↔L10は層対応が異なるため不一致を記録し、いずれの旧mappingも現行の正本とはしない。三文書への分離形式だけを参考にし、現在の配置は現行6 canonical文書のL3/L10構成に従う。

### BR-OS-015 — authority記録の追跡可能性

固定親 `HELIXOS-L2-015` version target `1.0` の業務成果は、正本、判断source、対象revision、責務と訂正履歴を辿れる管理記録を維持すること。OSはprojectionを管理し、requirementsやhuman decisionを生成しない。Acceptanceは `AC-OS-015-01`, `AC-OS-015-02`, `AC-OS-015-03` と `CASE-OS-015-01`, `CASE-OS-015-02a`, `CASE-OS-015-02b`, `CASE-OS-015-02c`, `CASE-OS-015-02d`, `CASE-OS-015-02e`, `CASE-OS-015-02f`, `CASE-OS-015-02g`, `CASE-OS-015-02h`, `CASE-OS-015-02i`, `CASE-OS-015-02j`, `CASE-OS-015-02k`, `CASE-OS-015-03` を参照する。

### BR-OS-016 — 複数対象の状態と関係を正しく示す

固定親 `HELIXOS-L2-016` version target `1.0` の成果は、各対象・要求revision・unit/connection/composite・依存edge・提供状態を混同せず見られること。OSのkanban表示はstate projectionであってmerge/release readinessやapprovalではない。Acceptanceは `AC-OS-016-01`, `AC-OS-016-02`, `AC-OS-016-03` と `CASE-OS-016-01`, `CASE-OS-016-02a`, `CASE-OS-016-02b`, `CASE-OS-016-02c`, `CASE-OS-016-02d`, `CASE-OS-016-02e`, `CASE-OS-016-02f`, `CASE-OS-016-02g`, `CASE-OS-016-02h`, `CASE-OS-016-02i`, `CASE-OS-016-03` を参照する。

### BR-OS-017 — 適格性を保ったticket推進

固定親 `HELIXOS-L2-017` version target `1.0` の成果は、HARNESS既定工程部品とINT案を既存authority/dependency/budget/deadlineへ照合したticketを作り、停止・差戻し時も未完義務を保つこと。OSはHARNESS工程やINT案ownerを代替しない。部品外workflowはL2が示す4.0境界に残す。Acceptanceは `AC-OS-017-01`, `AC-OS-017-02`, `AC-OS-017-03` と `CASE-OS-017-01`, `CASE-OS-017-02a`〜`02j`, `CASE-OS-017-03`, `CASE-OS-017-HXT-TYPE-01`〜`-21`, `CASE-OS-017-HXT-FLOW-01`〜`-09`, `CASE-OS-017-HXT-SYS-01` を参照する。

### BR-OS-018 — 制約を保持したassignment・handoff

固定親 `HELIXOS-L2-018` version target `1.0` の成果は、Worker作業と独立reviewを分離し、assignment、attempt、scope、cumulative budget/deadline/failure countと未完義務を辿れること。OSはSECURITY認可、INFRA資源状態、LABO評価を代行しない。追加決定 `MPR-RC-HELIXOS-L2-018-002` は`docs/governance/decisions/po-decision-2026-10-03-additions10.md` row 34で採択されており、追補L2 span 1604–1619 registered semantic digest `5e2a621be8b4bda140bd796a48bedf2b3369daf5fad2665060ac41aa1a3174d2`（raw LF-inclusive span SHA-256 `634b700e1ed79c60f53235f6fb0e73348b7cc07264d4e4f8afb69e107aa1996d`）、L11 span 1259–1276 registered semantic digest `e32e45319a3ac91004e3e1a985c7ff44e91b9e86f05b85c266d6b8d67acf87b5`（raw LF-inclusive span SHA-256 `ba303351c99a385506d9f151d0b51c03fb08922ce7d2848ffb3b1f485c4c221c`）をf6固定本文とは別に参照する。適用sourceがある場合だけ該当receipt facetを記録する。receipt facetのmissing/unknown/stale/conflict/scope-unknownはそのfacetを未完に保ち、assignmentの可否・継続は既存authority/制約で別判定する。receipt欠落だけを理由に事前gateまたは全assignment停止を加えない。適用sourceのある場合だけ予定/実績・逸脱理由を記録し、quality eventなしでconsult/supportが未選択ならreceiptを生成しない。選択scopeに適用するdefault/order sourceが特定できなければ、facetをunknown/未完にして元のdecision/policy meaning ownerへ返し、適用外/逸脱なしにしない。Acceptanceは `AC-OS-018-01`, `AC-OS-018-02`, `AC-OS-018-03`, `AC-OS-018-04` と `CASE-OS-018-01`, `CASE-OS-018-02a`, `CASE-OS-018-02b`, `CASE-OS-018-02c`, `CASE-OS-018-02d`, `CASE-OS-018-02e`, `CASE-OS-018-02f`, `CASE-OS-018-02g`, `CASE-OS-018-02h`, `CASE-OS-018-02i`, `CASE-OS-018-02j`, `CASE-OS-018-02k`, `CASE-OS-018-02l`, `CASE-OS-018-02m`, `CASE-OS-018-02n`, `CASE-OS-018-02o`, `CASE-OS-018-02p`, `CASE-OS-018-03`, `CASE-OS-018-04a`, `CASE-OS-018-04b`, `CASE-OS-018-04c`, `CASE-OS-018-04d`, `CASE-OS-018-04e`, `CASE-OS-018-04f`, `CASE-OS-018-04g`, `CASE-OS-018-04h`, `CASE-OS-018-04i`, `CASE-OS-018-04j`, `CASE-OS-018-04k`, `CASE-OS-018-04l`, `CASE-OS-018-05a`, `CASE-OS-018-05b` を参照する。

### BR-OS-019 — 継続性と証拠の正確な再構築

固定親 `HELIXOS-L2-019` version target `1.0` の成果は、source-bound eventからepisodeを再構築し、欠落/重複/stale/拒否/未実行と成功を区別し、restart後も累積制約とdata-use境界を保つこと。hold/確認待ちは期限未宣言・期限切れ・期限判定unknownを区別して、L1-002/008に沿う人間向け確認対象一覧としてL2-019 projectionへ投影し、source、owner、状態、未完義務を追跡する。この一覧はAI解決可能性を分類せずPO宛先も定めない。一覧から期限値、承認、要求解決、完了、停止・再割当を生成しない。provider memory/summary自体をcanonical authorityにしない。Acceptanceは `AC-OS-019-01`, `AC-OS-019-02`, `AC-OS-019-03`, `AC-OS-019-04` と `CASE-OS-019-01`, `CASE-OS-019-02a`, `CASE-OS-019-02b`, `CASE-OS-019-02c`, `CASE-OS-019-02d`, `CASE-OS-019-02e`, `CASE-OS-019-02f`, `CASE-OS-019-02g`, `CASE-OS-019-02h`, `CASE-OS-019-02i`, `CASE-OS-019-02j1a`, `CASE-OS-019-02j1b`, `CASE-OS-019-02j1c`, `CASE-OS-019-02j2`, `CASE-OS-019-02j3`, `CASE-OS-019-02j4`, `CASE-OS-019-02k`, `CASE-OS-019-02l`, `CASE-OS-019-03` を参照する。

### BR-OS-020 — 要求された検証義務を運転する

固定親 `HELIXOS-L2-020` version target `1.0` の成果は、HARNESSが定義した義務・oracleを対象diff/head/environmentに結び実行状態を回収すること。新世代CIが未構築であるため旧CIを実行/代用しない。OS実行resultは意味review、human acceptance、mergeまたはreleaseのdecisionを作らない。Acceptanceは `AC-OS-020-01`, `AC-OS-020-02`, `AC-OS-020-03` と `CASE-OS-020-01`, `CASE-OS-020-02a`, `CASE-OS-020-02b`, `CASE-OS-020-02c`, `CASE-OS-020-02d`, `CASE-OS-020-02e`, `CASE-OS-020-02f`, `CASE-OS-020-02g`, `CASE-OS-020-02h`, `CASE-OS-020-02i`, `CASE-OS-020-02j`, `CASE-OS-020-02k`, `CASE-OS-020-02l`, `CASE-OS-020-03` を参照する。

### BR-OS-023 — Handoff時にscopeと義務を落とさない

固定親 `HELIXOS-L2-023` version target `1.0` の成果は、OS-016のportfolio traceにある対象要求revision・unit/connection/composite relation・source-bound stateを含めてsender/receiver間でexact revision/digest/scope/causal ID/evidence/unfinished dutiesを共有し、unit・connection・composite・次段の別々の判定を保つこと。transport receiptやPR/CI stateだけでbusiness completionを作らない。Acceptanceは `AC-OS-023-01`, `AC-OS-023-02`, `AC-OS-023-03` と `CASE-OS-023-01`, `CASE-OS-023-02a`, `CASE-OS-023-02b`, `CASE-OS-023-02c`, `CASE-OS-023-02d`, `CASE-OS-023-02e`, `CASE-OS-023-02f`, `CASE-OS-023-02g`, `CASE-OS-023-02h`, `CASE-OS-023-02i`, `CASE-OS-023-02j`, `CASE-OS-023-02k`, `CASE-OS-023-02l`, `CASE-OS-023-02m`, `CASE-OS-023-02n`, `CASE-OS-023-02o`, `CASE-OS-023-02p`, `CASE-OS-023-02q`, `CASE-OS-023-02r`, `CASE-OS-023-03`, `CASE-OS-017-HXT-SYS-01`, `CASE-OS-023-HXT-USE-01` を参照する。

### BR-OS-027 — 未評価時にも限定初回作業を適切に扱う

固定親 `HELIXOS-L2-027` version target `1.0` の成果は、性能未評価という状態と操作permissionを区別し、採択済み六条件・authorityの全てが成立する狭い初回実行だけを扱い、その結果を同scopeでLABOへ渡すこと。初回成功はqualificationではなく、LABOのsource-bound評価までunassessedを保つ。人確認は既存L2内の初回scopeと結果の確認であり、確認者actor・対象revision・scope・時点・結果・未完義務を記録する。これは毎task承認やPR/CI/reviewerによるdecision生成ではない。Acceptanceは `AC-OS-027-01`, `AC-OS-027-02`, `AC-OS-027-03`, `AC-OS-027-04`, `AC-OS-027-05`, `AC-OS-027-06` と `CASE-OS-027-01`, `CASE-OS-027-02a1`, `CASE-OS-027-02a2`, `CASE-OS-027-02a3`, `CASE-OS-027-02a4`, `CASE-OS-027-02a5`, `CASE-OS-027-02a6`, `CASE-OS-027-02b`, `CASE-OS-027-02c`, `CASE-OS-027-02d`, `CASE-OS-027-02e1`, `CASE-OS-027-02e2`, `CASE-OS-027-02e3`, `CASE-OS-027-02f`, `CASE-OS-027-03a`, `CASE-OS-027-03b`, `CASE-OS-027-03c`, `CASE-OS-027-03d`, `CASE-OS-027-03e`, `CASE-OS-027-03f`, `CASE-OS-027-03g`, `CASE-OS-027-03h`, `CASE-OS-027-03i`, `CASE-OS-027-03j`, `CASE-OS-027-03k`, `CASE-OS-027-03l`, `CASE-OS-027-03m`, `CASE-OS-027-03n`, `CASE-OS-027-03o`, `CASE-OS-027-03p`, `CASE-OS-027-03q`, `CASE-OS-027-03r`, `CASE-OS-027-03s`, `CASE-OS-027-03t`, `CASE-OS-027-03u`, `CASE-OS-027-03w`, `CASE-OS-027-03x`, `CASE-OS-027-03y`, `CASE-OS-027-03z`, `CASE-OS-027-03aa`, `CASE-OS-027-03ac`, `CASE-OS-027-03ad`, `CASE-OS-027-03af`, `CASE-OS-027-03ag`, `CASE-OS-027-03ah`, `CASE-OS-027-03ai`, `CASE-OS-027-03aj`, `CASE-OS-027-03ak`, `CASE-OS-027-03al`, `CASE-OS-027-03am`, `CASE-OS-027-03an`, `CASE-OS-027-03ao`, `CASE-OS-027-03ap`, `CASE-OS-027-03ar`, `CASE-OS-027-03as`, `CASE-OS-027-03at`, `CASE-OS-027-03au`, `CASE-OS-027-03av`, `CASE-OS-027-03aw`, `CASE-OS-027-03ax`, `CASE-OS-027-04`, `CASE-OS-027-05`, `CASE-OS-027-06` を参照する。

### Scope境界

業務evidenceは `../L10-verification/business-verification.md` に記し、機能oracleは `../L10-verification/functional-verification.md` に記す。項目を別ownerへ移す必要があるほどmeaning/scope/owner/versionが変わる場合のみL2へ戻しPO判断に上げる。技術候補値ごとの判断を聞かず、追加gateを設けない。

## Stage 3：business分類（15件、部分草稿）

この対象15件については、運用上の効果を別のbusiness acceptanceへ二重定義しない。採択済みL2の機能境界をfunctional FR/ACへtraceし、独立の事業owner・KPI・金額閾値を追加しない。実績評価はLABO、OSはregistration/state/handoffを担う。

| 親L2 | 分類とbusiness扱い | owner境界・参照する機能AC |
|---|---|---|
| HELIXOS-L2-032 | 機能要件のみ。quarantineは受入価値や全体greenの指標ではない。 | HARNESS oracle / SECURITY policy authority。FR-OS-L3-032 AC-01..06。 |
| HELIXOS-L2-033 | 機能要件のみ。再現receiptを品質合格KPIにしない。 | capability ownerが結果意味、OSがregistry/provenanceと選択detectorの適用engine/output種別関係を記録。FR-OS-L3-033 AC-01..06。 |
| HELIXOS-L2-034 | 機能要件のみ。disposition正当性やリスク受容をOSが評価しない。 | 元source/PO authority。FR-OS-L3-034 AC-01..05。 |
| HELIXOS-L2-035 | 機能要件のみ。job登録数を監査完了率に読み替えない。 | OS-L2-010 ticket owner、HARNESS接続は別scope。FR-OS-L3-035 AC-01..05。 |
| HELIXOS-L2-036 | 機能要件のみ。Retrofit成否の技術判定は各owner。 | OSはpreflight-plan/apply trace。FR-OS-L3-036 AC-01..04。 |
| HELIXOS-L2-037 | 機能要件のみ。負債分類・評価はsource owner/LABO、既存OSの優先順位決定責務を保持する。 | ticket登録はOS-L2-010。FR-OS-L3-037 AC-01..05。 |
| HELIXOS-L2-038 | 機能要件のみ。snapshot/proposal appendは採択・coverage完了でない。 | HARNESS semantic contract owner。FR-OS-L3-038 AC-01..04。 |
| HELIXOS-L2-040 | 機能要件のみ。retryを回復成功と数えない。 | 既存typed return owner。FR-OS-L3-040 AC-01..06。 |
| HELIXOS-L2-041 | 機能要件のみ。resumeを未完義務解消と数えない。 | OS-L2-009、正本/authority owner。FR-OS-L3-041 AC-01..04。 |
| HELIXOS-L2-042 | 機能要件のみ。output validationは独立acceptanceでない。 | Worker output contract owner、authorityはSECURITY。FR-OS-L3-042 AC-01..06。 |
| HELIXOS-L2-043 | 機能要件のみ。request/call/result件数を承認・成功KPIにしない。 | operation authority owner。FR-OS-L3-043 AC-01..06。 |
| HELIXOS-L2-044 | 機能要件のみ。prose handoverをresolution率へ算入しない。 | feedback/finding source owner。FR-OS-L3-044 AC-01..03。 |
| HELIXOS-L2-049 | 独立business outcomeなし。configured pool・利用率をproductivity/throughputと同一視しない。 | FR-OS-L3-049 AC-01..05を参照。 |
| HELIXOS-L2-050 | 機能要件のみ。review capacity増枠はquality/merge acceptanceを意味しない。 | HARNESS independence/admission、OS queue/assignment。FR-OS-L3-050 AC-01..05。 |
| HELIXOS-L2-051 | 独立business outcomeなし。配車適性候補は新しいperformance評価ではない。 | FR-OS-L3-051 AC-01..09を参照。 |

独立business criterionを必要とする上流意味はここで補作せず対応するL2/L1 ownerへ戻す。HELIXOS-L2-039はH045とのhold scopeとして対象外のままである。

## Stage 4：business分類（6件、部分草稿）

この6件に独立したbusiness value、KPI、金額閾値は導出しない。各parentの業務判断は固定L2/L1 ownerに残し、機能ACに対するpaired L10でstateと責務境界のみを照合する。

| 親L2 | business扱い | L10観測・境界 |
|---|---|---|
| `HELIXOS-L2-021` | 機能要件のみ。 | project構成配布を別判定に保ち、HELIX-WEB-HARNESSの7製品の製品群としての意味を保ち、7機構やHELIX自身のstage releaseと同一視しない。 |
| `HELIXOS-L2-022` | 機能要件のみ。 | observation/candidate/ticket/effect evaluationを別状態とし、候補件数を改善成功にしない。 |
| `HELIXOS-L2-024` | 機能要件のみ。 | 許可data handoff、LABO評価、OS routing、user acceptanceを分ける。 |
| `HELIXOS-L2-046` | 機能要件のみ。 | 既存遷移の証拠照合を観測し、merge rateや新承認の基準を加えない。 |
| `HELIXOS-L2-048` | 機能要件のみ。 | pending/resolution stateの根拠を照合し、registrationやclosed finding数をKPIにしない。 |
| `HELIXOS-L2-052` | 機能要件のみ。 | local cleanupと後続PR再照合を分け、Issue/要求完了や生産性を主張しない。 |


## Stage 5追補 — HELIXOS-L2-025/026/031/047 のbusiness境界候補

この追補は既存文書のStage 2b/Stage 2a/Stage 3/Stage 4 scope欄を遡及変更せず、ここに列挙したStage 5対象だけを追加する候補である。先頭のstatusは先行scopeの状態を示す。

この追補はHELIX-OSの4親をL3/L10へ対形成する候補であり、独立したbusiness outcome、business owner、KPI、承認者を追加しない。G0のStage 5は実装順序・version intentの記録で、Stage5全親の完了を個別作業や単独成立の前提にしない。対象revision・scope・owner・状態は各機能要件と固定L2/L11を参照する。

| 親 | business扱い | L10で照合する境界 |
|---|---|---|
| `HELIXOS-L2-025` | 独立BRなし | service①〜⑦ unit/選択connection/composite正常と部分未見正常を区別し、HELIX自身＋異種projectの要求authority→ticket→Worker→検収→提供/運用→LABO評価→OS還流trace各段値の一致と各段単独欠落、unknown/stale/未許可/human-wait・後続版・OS製品化・LABO移管境界、配布全7製品gate誤追加、1.0全体normal/1製品欠落を個別CASEで保持する。|
| `HELIXOS-L2-026` | 独立BRなし | 要求source/contract/compatibility/recovery/permission/owner/human processと各dependency state、packごとの版・適用対象、要求確認→作業→検証→結果記録までの出力経路を独立CASEで照合する。空集合・安全省略・未決pack・未撤去WT・他stage boot・一層削除minimumと必要な検証を除いた過小構成の誤りを拒否する。|
| `HELIXOS-L2-031` | 独立BRなし | wall-clock、runner-minute、failure feedback latency p50/p95、原因分類を含む測定全field/適用scope、Recovery Issueを正本にしない境界、correctnessと性能、4弱化、escaped defect/mutation/flake、warm cache/review HEAD、lease/fence/artifact/fallback/DAG/cancel/exactly-once/causal traceを区別する。|
| `HELIXOS-L2-047` | 独立BRなし | reason/evidence/根拠source revision、元assignmentとの因果relation・未完義務追跡、assignment/attempt/result/authority非継承、provider-only変更、参照両方向、旧証拠とnew revision、split/scope/backflow既存owner、検収oracle不足/Worker入力不足の正常返却を独立照合する。|

この表は機能CASEへの参照境界だけを示す。Stage一式の承認待ちを新たなgateとせず、上流意味変更が必要な個別項目だけを既存authorityへ戻す。

### Stage 5 review01補正 — business trace更新

固定L2/L11にこの4親独自のbusiness outcomeはないため、BR/KPI/合否を追加しない。以下はfunctional fixture参照範囲だけを更新し、独立したbusiness判定を作らない。

| 親 | business扱い | 補正後functional CASE範囲 | 境界 |
|---|---|---|---|
| 025 | 独立BRなし | CASE-025-01〜21, 022〜039, 047〜049 | target/version/unit状態の欠落、document/mechanismの存在だけによる誤成立を区別し、構成体の未完義務を保持し、HELIX-OSを外販製品と誤分類しない。|
| 026 | 独立BRなし | CASE-026-01〜60 | 導出結果から採択/実装/受入/tag/外部配布を生成せず、適用scope外の機構完成を追加条件にしない。段階構成採択を導出成功から生成しない。|
| 031 | 独立BRなし | CASE-031-01〜95（066/068/070/072除外、031-25は031-06のalias） | old numeric comparison、ticket-driven duty、正しさ/性能、LABO/authority境界を分け、実測SLO/merge基準を作らない。|
| 047 | 独立BRなし | CASE-047-01〜41、CASE-047-20はCASE-047-04のalias | issuerからの返却・revision lineage・参照境界を保ち、独立のticket効率KPIを作らない。|
