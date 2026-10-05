# HELIX-CONNECT L10 NFR候補検証（Stage 1）

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
| `CON-NFR-006` / `CONNECT-AC-006-01..04` | 4交換型×positive compatibility、4×{incompatible, unregistered, meaning-contract-change, unknown, stale}を独立実行。未完operation continuityとauthority fieldは別fixture群で測る。CASE-006-03でoperation identity欠落、過去attempt履歴欠落、再照合前retryを個別に測り、CASE-006-02では両側変更fixtureを別に測る。 | 各型を一度ずつ照合（4/4）。互換内で固定側identity/revision delta 0。20件のcompatibility failure fixtureは交換後に結果を分類し、20/20でsend/retry attempt 0（互換failure判定のための交換・照合は許す）。両側変更はunknown/rejectとし片側交換のpass計数から除外する。旧新revision混載0。旧revision→新revision→current comparison receipt→connection/operation/attempt・技術結果の証拠列を一つのconnection traceで辿れる。入力したoperation/ACK/attempt/expiry/unfinished obligation/recovery referenceの各identityが出力receipt/handoffに保持され、再照合と既存restart条件の成立前に再開attempt 0。許可missing/unknown/expired/scope不一致のauthority反例だけはexchange/send/retry attempt 0。 | 不一致・unknown・staleは送信保留、adapter compatibilityはadapter owner、意味差は両端owner、権限問題はSECURITYへ返す。NFR候補に共通transport latency/compatibility thresholdを追加せず、採択親にある宣言範囲だけを使う。 |

4/4 variant、20 failure fixture、0 attempt/0 mutation等は固定L2/L11の明記条件を測る候補であって新しい互換範囲・parameter・PO gateではない。
