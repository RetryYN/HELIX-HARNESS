# HELIX-OS L10 業務総合検証（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — HELIXOS-L2-014 business verification boundary

| 親L2 | business要件 | business CASE | 対応functional要件 / CASE |
|---|---|---|---|
| `HELIXOS-L2-014` | 独立BRなし。段階releaseの管理成果とowner境界は `FR-OS-014` のみ参照し、新business KPI/outcomeを加えない | なし | `FR-OS-014`; `AC-OS-014-01`〜`AC-OS-014-11`。functional CASEは `functional-verification.md` の `CASE-OS-014-*` |

文書追加、stage record、pack green、OS operation resultから1.0到達・製品release・external publication・L3 approval・人の判断を生成しない。business failureをtransport/handoff状態で置き換えない。人手担当は既存L2のscopeに限り、追加approvalではない。

## Stage 2c — HELIXOS-L2-028 / HELIXOS-L2-029 business scope

固定L2-028/029に独立したbusiness outcomeは定義されていないため、このpairはbusiness caseを作らない。機能要件/受入とのtrace参照は `../L3-requirements/functional-requirements.md` の FR-OS-028/029、AC-OS-028-01、AC-OS-028-02、AC-OS-028-03、AC-OS-028-04、AC-OS-028-05、AC-OS-028-06、AC-OS-028-07、AC-OS-029-01、AC-OS-029-02、AC-OS-029-03、AC-OS-029-04、AC-OS-029-05、AC-OS-029-06を参照する。functional CASEはfunctional-verification.mdだけに宣言し、この文書はbusiness CASEを宣言しない。新BR/BCASE、業務KPI、独立owner、business pass条件を追加しない。ここから別のbusiness outcomeを推定しない。

## Stage 2a — 8親の業務総合検証（015/016/017/018/019/020/023/027）

状態: L3業務要件との対になるverification設計候補。業務達成、user acceptance、L3承認は生成しない。正本は `../L3-requirements/business-requirements.md`、functional oracleは `functional-verification.md` である。

| 親BR | 業務oracle | 対応L3 | 対応functional CASE |
|---|---|---|---|
| `BR-OS-015` | authority/source/revision/correction traceとprojectionを区別し、raw event不変 | `FR-OS-015`; `AC-OS-015-01`, `AC-OS-015-02`, `AC-OS-015-03` | `CASE-OS-015-01`, `CASE-OS-015-02a`, `CASE-OS-015-02b`, `CASE-OS-015-02c`, `CASE-OS-015-02d`, `CASE-OS-015-02e`, `CASE-OS-015-02f`, `CASE-OS-015-02g`, `CASE-OS-015-02h`, `CASE-OS-015-02i`, `CASE-OS-015-02j`, `CASE-OS-015-02k`, `CASE-OS-015-03` |
| `BR-OS-016` | 対象別stateとrelationを分け、下位成功からcomposite/readinessを推論しない | `FR-OS-016`; `AC-OS-016-01`, `AC-OS-016-02`, `AC-OS-016-03` | `CASE-OS-016-01`, `CASE-OS-016-02a`, `CASE-OS-016-02b`, `CASE-OS-016-02c`, `CASE-OS-016-02d`, `CASE-OS-016-02e`, `CASE-OS-016-02f`, `CASE-OS-016-02g`, `CASE-OS-016-02h`, `CASE-OS-016-02i`, `CASE-OS-016-03` |
| `BR-OS-017` | ticket/workflow候補が固定HARNESS語彙、authority、依存、停止義務を保持 | `FR-OS-017`; `AC-OS-017-01`, `AC-OS-017-02`, `AC-OS-017-03` | `CASE-OS-017-01`, `CASE-OS-017-02a`, `CASE-OS-017-02b`, `CASE-OS-017-02c`, `CASE-OS-017-02d`, `CASE-OS-017-02e`, `CASE-OS-017-02f`, `CASE-OS-017-02g`, `CASE-OS-017-02h`, `CASE-OS-017-02i`, `CASE-OS-017-02j`, `CASE-OS-017-03`, `CASE-OS-017-HXT-TYPE-01`〜`-21`, `CASE-OS-017-HXT-FLOW-01`〜`-09`, `CASE-OS-017-HXT-SYS-01` |
| `BR-OS-018` | assignment/attempt/review責務を分け、累積制約を保ち、停止理由を管理/推進へ戻して外部sourceの訂正先をその記録から辿る。実/予定対応を区別 | `FR-OS-018`; `AC-OS-018-01`, `AC-OS-018-02`, `AC-OS-018-03`, `AC-OS-018-04` | `CASE-OS-018-01`, `CASE-OS-018-02a`, `CASE-OS-018-02b`, `CASE-OS-018-02c`, `CASE-OS-018-02d`, `CASE-OS-018-02e`, `CASE-OS-018-02f`, `CASE-OS-018-02g`, `CASE-OS-018-02h`, `CASE-OS-018-02i`, `CASE-OS-018-02j`, `CASE-OS-018-02k`, `CASE-OS-018-02l`, `CASE-OS-018-02m`, `CASE-OS-018-02n`, `CASE-OS-018-02o`, `CASE-OS-018-02p`, `CASE-OS-018-03`, `CASE-OS-018-04a`, `CASE-OS-018-04b`, `CASE-OS-018-04c`, `CASE-OS-018-04d`, `CASE-OS-018-04e`, `CASE-OS-018-04f`, `CASE-OS-018-04g`, `CASE-OS-018-04h`, `CASE-OS-018-04i`, `CASE-OS-018-04j`, `CASE-OS-018-04k`, `CASE-OS-018-04l`, `CASE-OS-018-05a`, `CASE-OS-018-05b` |
| `BR-OS-019` | raw evidenceからcontinuityを再構築し、状態/data-useを正しく区別。hold/確認待ちの期限状態と未完義務をL1-002/008に沿う人間向けL2-019 projection listへ投影 | `FR-OS-019`; `AC-OS-019-01`, `AC-OS-019-02`, `AC-OS-019-03`, `AC-OS-019-04` | `CASE-OS-019-01`, `CASE-OS-019-02a`, `CASE-OS-019-02b`, `CASE-OS-019-02c`, `CASE-OS-019-02d`, `CASE-OS-019-02e`, `CASE-OS-019-02f`, `CASE-OS-019-02g`, `CASE-OS-019-02h`, `CASE-OS-019-02i`, `CASE-OS-019-02j1a`, `CASE-OS-019-02j1b`, `CASE-OS-019-02j1c`, `CASE-OS-019-02j2`, `CASE-OS-019-02j3`, `CASE-OS-019-02j4`, `CASE-OS-019-02k`, `CASE-OS-019-02l`, `CASE-OS-019-03` |
| `BR-OS-020` | HARNESS verification dutiesをexact change/runへ束縛し、resultからacceptanceを作らない | `FR-OS-020`; `AC-OS-020-01`, `AC-OS-020-02`, `AC-OS-020-03` | `CASE-OS-020-01`, `CASE-OS-020-02a`, `CASE-OS-020-02b`, `CASE-OS-020-02c`, `CASE-OS-020-02d`, `CASE-OS-020-02e`, `CASE-OS-020-02f`, `CASE-OS-020-02g`, `CASE-OS-020-02h`, `CASE-OS-020-02i`, `CASE-OS-020-02j`, `CASE-OS-020-02k`, `CASE-OS-020-02l`, `CASE-OS-020-03` |
| `BR-OS-023` | sender/receiverのscope・unfinished dutiesを保ち、unit/connection/composite/次段を別判定 | `FR-OS-023`; `AC-OS-023-01`, `AC-OS-023-02`, `AC-OS-023-03` | `CASE-OS-023-01`, `CASE-OS-023-02a`, `CASE-OS-023-02b`, `CASE-OS-023-02c`, `CASE-OS-023-02d`, `CASE-OS-023-02e`, `CASE-OS-023-02f`, `CASE-OS-023-02g`, `CASE-OS-023-02h`, `CASE-OS-023-02i`, `CASE-OS-023-02j`, `CASE-OS-023-02k`, `CASE-OS-023-02l`, `CASE-OS-023-02m`, `CASE-OS-023-02n`, `CASE-OS-023-03`, `CASE-OS-017-HXT-SYS-01`, `CASE-OS-023-HXT-USE-01` |
| `BR-OS-027` | 限定scopeの許可とperformance evaluationを分け、初回successをqualificationにしない | `FR-OS-027`; `AC-OS-027-01`, `AC-OS-027-02`, `AC-OS-027-03`, `AC-OS-027-04`, `AC-OS-027-05`, `AC-OS-027-06` | `CASE-OS-027-01`, `CASE-OS-027-02a1`, `CASE-OS-027-02a2`, `CASE-OS-027-02a3`, `CASE-OS-027-02a4`, `CASE-OS-027-02a5`, `CASE-OS-027-02a6`, `CASE-OS-027-02b`, `CASE-OS-027-02c`, `CASE-OS-027-02d`, `CASE-OS-027-02e1`, `CASE-OS-027-02e2`, `CASE-OS-027-02e3`, `CASE-OS-027-02f`, `CASE-OS-027-03a`, `CASE-OS-027-03b`, `CASE-OS-027-03c`, `CASE-OS-027-03d`, `CASE-OS-027-03e`, `CASE-OS-027-03f`, `CASE-OS-027-03g`, `CASE-OS-027-03h`, `CASE-OS-027-03i`, `CASE-OS-027-03j`, `CASE-OS-027-03k`, `CASE-OS-027-03l`, `CASE-OS-027-03m`, `CASE-OS-027-03n`, `CASE-OS-027-03o`, `CASE-OS-027-03p`, `CASE-OS-027-03q`, `CASE-OS-027-03r`, `CASE-OS-027-03s`, `CASE-OS-027-03t`, `CASE-OS-027-03u`, `CASE-OS-027-03w`, `CASE-OS-027-03x`, `CASE-OS-027-03y`, `CASE-OS-027-03z`, `CASE-OS-027-03aa`, `CASE-OS-027-03ac`, `CASE-OS-027-03ad`, `CASE-OS-027-03af`, `CASE-OS-027-03ag`, `CASE-OS-027-03ah`, `CASE-OS-027-03ai`, `CASE-OS-027-03aj`, `CASE-OS-027-03ak`, `CASE-OS-027-03al`, `CASE-OS-027-03am`, `CASE-OS-027-03an`, `CASE-OS-027-03ao`, `CASE-OS-027-03ap`, `CASE-OS-027-03ar`, `CASE-OS-027-03as`, `CASE-OS-027-03at`, `CASE-OS-027-03au`, `CASE-OS-027-03av`, `CASE-OS-027-03aw`, `CASE-OS-027-03ax`, `CASE-OS-027-04`, `CASE-OS-027-05`, `CASE-OS-027-06` |

### Human decisionと責務のoracle

Issue/PR close・merge、reviewer名/response、CI green、handoff receipt、operation log、mailbox ACK、source pinはPO decisionや要求承認にならない。OS-015 projection、OS-016 kanban、OS-020 CI結果、OS-023 receiver receiptだけからmerge/release/readinessを生成しない。作成Workerは自らの結果をapprove/review済みにできない。人手確認はOS-027に固定L2/L11が記述した限定初回scopeと結果確認に限り、毎回のPO承認gateへ一般化しない。

### Business observation

fixtureと実観測を分けて記録し、各親についてtrace正確性、unknown/missing保全、ownerへの戻し、未完義務保持の結果を報告する。観測件数のみを改善・完了の主張にしない。元のbusiness failureがある場合にtransport/handoff failureで置き換えない。旧runtime/testや新世代未構築CIを実行証拠にしない。

## Stage 3：business境界の検証参照

本15親では独立business outcomeを定義しない。各行はfunctional FR/ACが既に定めた機能境界をbusiness受入と重複させないための参照であり、新しいowner/KPI/acceptance authorityを作らない。

### business受入境界

この15件はbusiness KPIを重複定義せず、functional L3 ACと同じ入力・scope・owner境界を照合する。

| CASE ID | 親と参照AC | 観測・期待 | 対象外 |
|---|---|---|---|
| CASE-OS-L10-BIZ-032 | HELIXOS-L2-032 / FR-OS-L3-032 AC-01..06 | eligible/failure/unknownを分け、quarantineから全体greenを導かない。 | failure解消目標 |
| CASE-OS-L10-BIZ-033 | HELIXOS-L2-033 / FR-OS-L3-033 AC-01..06 | 選択scope再現receiptと未評価を分ける。 | detector精度KPI |
| CASE-OS-L10-BIZ-034 | HELIXOS-L2-034 / FR-OS-L3-034 AC-01..05 | 原event/disposition/appeal履歴を保ち、OSがrisk acceptanceを確定しない。 | risk appetite |
| CASE-OS-L10-BIZ-035 | HELIXOS-L2-035 / FR-OS-L3-035 AC-01..05 | job登録と監査実施・finding解消を別状態にする。 | 監査時間SLO |
| CASE-OS-L10-BIZ-036 | HELIXOS-L2-036 / FR-OS-L3-036 AC-01..04 | upgradeのpreflight/plan/applyと、非upgradeの既存検証義務・read-only policy保持を別状態で示す。 | Retrofit投資効果 |
| CASE-OS-L10-BIZ-037 | HELIXOS-L2-037 / FR-OS-L3-037 AC-01..05 | 観測欠落/条件不成立/handoffを分ける。 | 負債金額化 |
| CASE-OS-L10-BIZ-038 | HELIXOS-L2-038 / FR-OS-L3-038 AC-01..04 | snapshot/proposal appendとHARNESS採択を分ける。 | layer coverage目標 |
| CASE-OS-L10-BIZ-040 | HELIXOS-L2-040 / FR-OS-L3-040 AC-01..06 | retry routeを回復済みと数えない。 | 旧ticket taxonomy |
| CASE-OS-L10-BIZ-041 | HELIXOS-L2-041 / FR-OS-L3-041 AC-01..04 | source再取得とcoordination-only未完を分ける。 | resume KPI |
| CASE-OS-L10-BIZ-042 | HELIXOS-L2-042 / FR-OS-L3-042 AC-01..06 | strict/relaxed検証と再検証結果を分ける。 | output accept率目標 |
| CASE-OS-L10-BIZ-043 | HELIXOS-L2-043 / FR-OS-L3-043 AC-01..06 | request/call/resultのstatusを独立表示する。 | throughput KPI |
| CASE-OS-L10-BIZ-044 | HELIXOS-L2-044 / FR-OS-L3-044 AC-01..03 | prose handoverとevidence-backed resolutionを分ける。 | finding closure KPI |
| CASE-OS-L10-BIZ-049 | HELIXOS-L2-049 / FR-OS-L3-049 AC-01..05 | configured capacity・実行状態・割当候補を別集計する。 | utilization目標 |
| CASE-OS-L10-BIZ-050 | HELIXOS-L2-050 / FR-OS-L3-050 AC-01..05 | 原因別backpressureとreview assignmentを分ける。 | merge pass rate |
| CASE-OS-L10-BIZ-051 | HELIXOS-L2-051 / FR-OS-L3-051 AC-01..09 | suitability evidenceと配置案をreview結果から分ける。 | provider優劣score |

## Stage 4：採択済み6親の業務境界照合（独立business CASEなし）

この6親に独立したbusiness outcome、KPI、業務ownerは固定L2/L11に定義されていない。したがって新しいBR/BCASEやbusiness pass条件を作らず、各行は機能ACと対応するCASEを参照して、状態と担当の混同がないことだけを照合する。

| 親・登録 | 業務要件 | 対応機能要件／AC／CASE | business境界の照合 |
|---|---|---|---|
| `HELIXOS-L2-021` / PO採択 `MPR-RC-HELIXOS-L2-021-002`、現行metadata successor `MPR-RC-HELIXOS-L2-021-003`（semantic digest `sha256:0656171a926f67d47263a53cdd012b64112c6143399ab5cb4ac35d00e804dc81`同一） | 独立BRなし | `FR-OS-L3-021`; `AC-OS-L3-021-01`〜`AC-OS-L3-021-03`; `CASE-OS-L10-021-*` | project別のHARNESS構成配布を7 service/製品群全体の完成やHELIX自身（全機構パック）の段階稼働・stage releaseへ拡張しない。 |
| `HELIXOS-L2-022` / PO採択 `MPR-RC-HELIXOS-L2-022-001`、現行metadata successor `MPR-RC-HELIXOS-L2-022-002`（semantic digest `sha256:0420ffc076b080ceba91b3344d149d1316c745bf36c2ea3a97e2cc07f9359aea`同一） | 独立BRなし | `FR-OS-L3-022`; `AC-OS-L3-022-01`〜`AC-OS-L3-022-03`; `CASE-OS-L10-022-*` | event/candidate数、ticket登録、再観測を改善効果・採択判断へ読み替えない。 |
| `HELIXOS-L2-024` / PO採択 `MPR-RC-HELIXOS-L2-024-001`、現行metadata successor `MPR-RC-HELIXOS-L2-024-002`（semantic digest `sha256:b84651c09401e2d58c50652d2e74942cbe3f485ec949d79a42255a947b075dcb`同一） | 独立BRなし | `FR-OS-L3-024`; `AC-OS-L3-024-01`〜`AC-OS-L3-024-03`; `CASE-OS-L10-024-*` | 許可scope内handoff、LABO評価、要求採否、user acceptanceを別状態に保つ。 |
| `HELIXOS-L2-046` / PO採択 `MPR-RC-HELIXOS-L2-046-001`、現行metadata successor `MPR-RC-HELIXOS-L2-046-002`（semantic digest `sha256:c86aa6e0ad81c6a37770c084af6b312ef874f2fdf7fd342796fe94fcf588d44d`同一） | 独立BRなし | `FR-OS-L3-046`; `AC-OS-L3-046-01`〜`AC-OS-L3-046-03`; `CASE-OS-L10-046-*` | 既存authority/review/verification/admissionの照合から新approvalやmerge KPIを作らない。 |
| `HELIXOS-L2-048` / PO採択 `MPR-RC-HELIXOS-L2-048-001`、現行metadata successor `MPR-RC-HELIXOS-L2-048-002`（R2289-02、semantic digest `sha256:0cbd66b870d6b45f739c6759ed2b325d65e69cfbf3e72b6b5638f1e530c77622`同一） | 独立BRなし | `FR-OS-L3-048`; `AC-OS-L3-048-01`〜`AC-OS-L3-048-03`; `CASE-OS-L10-048-*` | pending/resolution evidenceとLABO評価、INTELLIGENCE案、OS ticketを分離し、finding数を効果指標にしない。 |
| `HELIXOS-L2-052` / PO採択 `MPR-RC-HELIXOS-L2-052-001`、現行metadata successor `MPR-RC-HELIXOS-L2-052-002`（semantic digest `sha256:d9e839c319c54f826bb065ce065ca5a8af126a11abd8f15c9f3183964a4e5345`同一） | 独立BRなし | `FR-OS-L3-052`; `AC-OS-L3-052-01`〜`AC-OS-L3-052-03`; `CASE-OS-L10-052-*` | local cleanupと後続PR再照合をissue/要求完了・remote削除・生産性へ拡張しない。 |

合否はこの文書で別途生成しない。上表は業務failureをtransport/handoff stateで置換せず、機能CASEの同じ入力・scope・ownerを保つためのtraceである。


## Stage 5 — 機能CASEと対になるbusiness境界確認（独立BRなし）

この追補は既存文書のStage 2b/Stage 2a/Stage 3/Stage 4 scope欄を遡及変更せず、ここに列挙したStage 5対象だけを追加する候補である。先頭のstatusは先行scopeの状態を示す。

この4親は、固定L2/L11に独立business outcome/KPIがないため、新BRやbusiness KPIを作らない。functional owner/state/CASEを同じscopeで照合する。

| business CASE | 親・参照機能CASE | 照合 | 対象外 |
|---|---|---|---|
| `CASE-OS-L10-BIZ-025-01` | 025 / `CASE-OS-L10-025-01..21, 022..039, 047..049` | 各サービスunit/connection/compositeと正常・unknown等のstateを個別に保ち、HELIX自身＋異種projectの7段trace、単独段欠落、初期配布の誤前提、1.0全体/1製品欠落を参照し、固定L2外の製品化やstage条件を生成しない。| 全製品稼働率、新規owner/KPI。|
| `CASE-OS-L10-BIZ-026-01` | 026 / `CASE-OS-L10-026-01..60` | 個別入力・各dependency state、pack版/適用対象/一周出力、復旧/permission/owner/human工程のmissingとclosure/minimum/実構成受入を混同せず、導出成功から段階採択を生成しない。| 最小pack数・段階数目標。|
| `CASE-OS-L10-BIZ-031-01` | 031 / `CASE-OS-L10-031-01..95 (066/068/070/072 excluded; 031-25 aliases 031-06)` | wall-clock、runner-minute、failure feedback latency p50/p95、超過原因を含む全測定fieldとscope、Recovery Issueの正本誤用、correctness/performance/recovery、安全性・最適化の独立状態を保ち旧比較値を普遍SLOにしない。| 現行SLO、速度KPI、merge admission。|
| `CASE-OS-L10-BIZ-047-01` | 047 / `CASE-OS-L10-047-01..41` | 返却根拠、元assignmentとの因果relationと未完義務追跡、全非継承軸、provider-only identity、双方向参照、revision証拠、split/scope/backflow境界を保ちIssue/PR完了を要求完了としない。| ticket処理時間・再発行率。|

上表は機能CASEへの静的参照であり、独自のbusiness acceptanceやstage完了条件ではない。

### Stage 5 review01補正overlay — 参照範囲

この補正はfunctional L10 fixtureの参照先だけを同期し、business acceptanceや実績を生成しない。

| business CASE | 親 / 参照functional CASE | 照合境界 |
|---|---|---|
| `CASE-OS-L10-BIZ-025-01` | 025 / CASE-025-01〜21, 022〜039, 047〜049 | 個別入力束縛・単位境界とtrace値一致のみ。fixture行数を製品完成率へ換算しない。|
| `CASE-OS-L10-BIZ-026-01` | 026 / CASE-026-01〜60 | 導出状態・pack版/適用対象/一周出力と採択・実装・受入・配布・段階構成採択を分離し、business成功を主張しない。|
| `CASE-OS-L10-BIZ-031-01` | 031 / CASE-031-01〜95（066/068/070/072除外、031-25は031-06のalias） | 全測定fieldとRecovery Issue非正本境界の記述上の照合のみ。実測、SLO、速度KPI、merge admissionを生成しない。|
| `CASE-OS-L10-BIZ-047-01` | 047 / CASE-047-01〜41（047-20は047-04のalias） | 元assignment/未完義務の追跡とticket返却・revision境界のtraceのみ。ticket効率や処理成功率を追加しない。|

NFR/functional overlayと矛盾するときは独立fixture・aliasの区別を優先する。既存business CASEを追加分母としてfunctional CASEと二重計上しない。
