# HELIX-CONNECT L10 NFR候補検証

> **本書の範囲（2026-10-07追記）**：題名にあった「Stage 1」は、本書で最初に起草した節の範囲である。本書には、その後のStageの節（Stage 2a、Stage 4、Stage 5）が追補されている。各節の対象親、対象revision、判断状態は[L3／L10 PO事後確認一覧](../../governance/l3-l10-po-post-confirmation.md)と各判断記録を正とする。冒頭の状態の記述は、最初の節を起草した時点のものとして読む。本追記は範囲の表示だけを直し、要件・検証の意味、ID、承認状態を変えない。

本書は[L3 NFR候補](../L3-requirements/nfr-grade.md)の各候補を同じIDで測定する。未指定値は根拠付き候補として比較し、実装値やPO承認値を仮定しない。意味・scope・owner・version変更が必要な場合だけL2/POへ戻す。

| 候補 / AC | 入力と測定方法 | 合格判定 | 失敗・戻し先 |
|---|---|---|---|
| `CON-NFR-001` / `CONNECT-AC-004-01` | 接続契約で宣言されたretry上限N、初回送信1回とretry回数を分けたattempt traceを入力。retry N-1回、N回、N+1回目の境界を測定し、別fixtureでfailure classificationをmissing/unknownにする。 | L11の記述どおり、初回送信後に契約が許す最大N回までretryし、N+1回目retryは0。同一ID/digestの効果1回、異digest拒否。missing/unknown classificationはretry不可と推測せず、追加retry 0・classification unknownとして保持する。契約がNをtotal attemptsと明記する場合はその宣言で境界を解釈し、推測で置換しない。 | retry対象/上限の意味またはfailure classificationがunknownなら追加retry 0のままconnection operation ownerへ返す。business failureはretryしない。 |
| `CON-NFR-002` / `CONNECT-AC-004-01` | 同じoperation identity/digestの再到着を複数回発生させ、receiver effect countとattempt traceを測る。次に同ID/異digestを入力する。 | 業務効果は1回、追加重複効果は0回。異digestは拒否され効果増加なし。 | duplicate suppression不明または異digest衝突は送信停止しoperation ownerへ返す。 |
| `CON-NFR-003` / `CONNECT-AC-002-01` | 端点、意味契約revision、adapter/transport revision、互換範囲を各々別fixtureで変え、登録時と使用時のrevision記録を照合し、stale検出からcompatible再照合までのattempt countを測る。read-only照合だけのeligibility結果も記録する。 | 再照合まで送信attempt 0。read-only照合ではeligibility=`not_evaluated`。 | 比較不能はunknown/staleとして記録し送信保留（固定L2に専用戻し先の明記なし）。契約不一致は接続設計・契約ownerへ、send authority差はSECURITYへ戻す。 |
| `CON-NFR-004` / `CONNECT-AC-005-01` | 登録/照合/send/receipt/retry/stale/拒否/終端の各観測eventをoperation/revision/attemptでtraceと突合し、欠落数・順序不明数を測る。 | 観測済みeventのtrace欠落0。欠落/順序曖昧はunknownで業務完了0。通常trace/receiptへraw業務payload・secret・credentialの合成markerを保存/複製する反例を各々測り、いずれも不合格とする。保存/複製件数各0、同identity同digest重複と異digest衝突の区別、L11列挙の全証拠fieldの欠落を個別照合する。値を証拠出力しない。 | trace producer/operation ownerへ欠落eventを返し、SECURITY/data-use不明は該当ownerへ返す。 |
| `CON-NFR-005` / `CONNECT-AC-005-01` | 接続contractの宣言値、または根拠・比較案・測定方法・判定境界を添えた技術候補を入力し、end-to-end latency区間/retention windowを実測する。 | 入力値の根拠・実測値・境界判定を記録する。候補は実装値・PO承認値ではなく、未指定を達成扱いしない。共通SLAを新設せず、必要な技術候補の起草も妨げない。 | 候補化に必要な入力が不足すればunknownとして接続contract ownerへ返す。要求の意味・scope・owner・versionを変える場合だけ該当L2/POへ戻す。 |


## Stage 2a 追加 — HELIXCONNECT-L2-006のみ

| 候補 / AC | 入力・測定 | oracle | 失敗・戻し先 |
|---|---|---|---|
| `CON-NFR-006` / `CONNECT-AC-006-01..04` | 4交換型×positive compatibility、4×{incompatible, unregistered, meaning-contract-change, unknown, stale}を独立実行。CASE-006-01の各正常交換traceとlink断絶negative、未完operation continuity、authority fieldを別fixture群で測る。CASE-006-03でoperation identity欠落、過去attempt履歴欠落、再照合前retryを個別に測り、CASE-006-02では両側変更fixtureを別に測る。 | 各型を一度ずつ照合（4/4）。互換内で固定側identity/revision delta 0。20件のcompatibility failure fixtureは交換後に結果を分類し、20/20でsend/retry attempt 0（互換failure判定のための交換・照合は許す）。CASE-006-01では旧revision→新revision→同じconnection/scope/revision組のcurrent comparison receipt→connection/operation/attempt→技術結果を一つのtraceで辿れる。receiptの別connection/scope/revision束縛、operation/attempt identityの切断、技術結果の孤立を各々別negativeとし、trace断絶時はpassにせずunknown/stale、束縛が確認できるまでsend/retry attempt 0。両側変更はunknown/rejectとし片側交換のpass計数から除外する。旧新revision混載0。入力したoperation/ACK/attempt/expiry/unfinished obligation/recovery referenceの各identityが出力receipt/handoffに保持され、再照合と既存restart条件の成立前に再開attempt 0。許可missing/unknown/expired/scope不一致のauthority反例だけはexchange/send/retry attempt 0。 | 不一致・unknown・staleは送信保留、adapter compatibilityはadapter owner、意味差は両端owner、権限問題はSECURITYへ返す。NFR候補に共通transport latency/compatibility thresholdを追加せず、採択親にある宣言範囲だけを使う。 |

4/4 variant、20 failure fixture、0 attempt/0 mutation等は固定L2/L11の明記条件を測る候補であって新しい互換範囲・parameter・PO gateではない。


## Stage 4 — 008/009のNFR観測設計（未実行）

| 候補ID / L3 AC | 測定fixtureと方法 | 判定境界・戻し先 |
|---|---|---|
| `CON-NFR-008-01` / `CONNECT-AC-008-01` | L10の008 catalog/欠落/型/束縛CASEでprofile/revision別usable数を数え、別正常profile対照と比較する。 | 不正組usable0・失敗伝播0。理由/対象不明はunknown、profile提供元へ。未見も同組oracleで照合する。 |
| `CON-NFR-008-02` / `CONNECT-AC-008-02` | 008のdescriptor読出しからの各状態生成CASEと合成marker混入CASEを別測定する。 | 各実行/許可生成0・各混入0。descriptorへの不正混入はprofile提供元へ、policy/authorizationの生成・代替はSECURITYへ区別して返す。CONNECTは安全判定を行わず値を出力しない。 |
| `CON-NFR-009-01` / `CONNECT-AC-009-04` | 既存policy上限を入力し、到達前/到達/到達後、session交換、各欠落state CASEで追加retryと累積attemptを観測する。policy単位・期限・routeも同revisionに束縛する。 | 欠落/上限到達後の追加retry0・session交換reset0。未完/理由/累積試行をOS-040等の既存適用ownerへ、初回適格性は遡って変えない。技術値を新設しない。 |
| `CON-NFR-009-02` / `CONNECT-AC-009-01/02/03/05` | 操作別missing/unknown/stale/conflict CASEで保留範囲と独立適格な対照初回辺を観測し、ACK待ちと完了を区別する。 | 範囲外一括停止0・未成立受領/完了生成0。初回、feedback、loop、join、ACKの該当ownerを別々に記録。未観測は達成でなくunknown。 |


## Stage 5 — 007のNFR観測設計（未実行）

`CON-NFR-007`は同じ機能CASE集合を観測し別のCASEを重複計上しない。宣言辺ごとの入力/receipt/lineage/SECURITY許可識別子/data-use識別子/送信結果/受信結果/終端被覆、failureでの全体成功数、未許可後続attempt、先行結果消失、業務承認/許可生成を個別に数える。data-use識別子だけ欠落する独立negativeは`CONNECT-CASE-007-40`、送信結果のみ欠落/受信結果のみ欠落/送受信結果不一致は`CONNECT-CASE-007-41`〜`43`で測り、各CASEの他の有効fieldを保って個別計数する。固定fixture分母の被覆100%、禁止状態生成/未許可attempt/結果消失は各0を候補判定とする。分母不明・証拠欠落・別revision結果はunknownとし、達成扱いしない。connection不備は失敗辺owner、authorityはSECURITY、業務判断/再計画は元機構/OS等ownerへ分けて戻す。latencyや期限値はowner契約の宣言を照合し製品共通SLAを生成しない。
