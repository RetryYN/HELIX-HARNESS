# HELIX-CONNECT L10 NFR候補検証（Stage 1 草稿）

本書は[L3 NFR候補](../L3-requirements/nfr-grade.md)の各候補を同じIDで測定する。未指定値は根拠付き候補として比較し、実装値やPO承認値を仮定しない。意味・scope・owner・version変更が必要な場合だけL2/POへ戻す。

| 候補 / AC | 入力と測定方法 | 合格判定 | 失敗・戻し先 |
|---|---|---|---|
| `CON-NFR-001` / `CONNECT-AC-004-01` | 接続契約で宣言されたretry上限N、初回送信1回とretry回数を分けたattempt traceを入力。retry N-1回、N回、N+1回目の境界を測定する。 | L11の記述どおり、初回送信後に契約が許す最大N回までretryし、N+1回目retryは0。同一ID/digestの効果1回、異digest拒否。契約がNをtotal attemptsと明記する場合はその宣言で境界を解釈し、推測で置換しない。 | retry対象/上限の意味が契約内でunknownなら追加retry 0のままownerへ返す。business failureはretryしない。 |
| `CON-NFR-002` / `CONNECT-AC-004-01` | 同じoperation identity/digestの再到着を複数回発生させ、receiver effect countとattempt traceを測る。次に同ID/異digestを入力する。 | 業務効果は1回、追加重複効果は0回。異digestは拒否され効果増加なし。 | duplicate suppression不明または異digest衝突は送信停止しoperation ownerへ返す。 |
| `CON-NFR-003` / `CONNECT-AC-002-01` | endpoint/contract revisionを変え、stale検出からcompatible再照合までのattempt countを測る。read-only照合だけのeligibility結果も記録する。 | 再照合まで送信attempt 0。read-only照合ではeligibility=`not_evaluated`。 | 比較不能はunknown/staleを保ちCONNECT契約owner、send authority差はSECURITYへ戻す。 |
| `CON-NFR-004` / `CONNECT-AC-005-01` | 登録/照合/send/receipt/retry/stale/拒否/終端の各観測eventをoperation/revision/attemptでtraceと突合し、欠落数・順序不明数を測る。 | 観測済みeventのtrace欠落0。欠落/順序曖昧はunknownで業務完了0。raw payload保存は必須にしない。 | trace producer/operation ownerへ欠落eventを返し、SECURITY/data-use不明は該当ownerへ返す。 |
| `CON-NFR-005` / `CONNECT-AC-005-01` | ownerが宣言した場合に限り、宣言済みend-to-end latency区間/retention windowを入力して実測値と境界を比較する。宣言なしも計測不能として記録する。 | 宣言値がある場合のみ区間内判定を行う。宣言なしを達成/未達成の数値判定に変換しない。 | time/retention値が必要になり業務meaning・owner・versionが変わる場合は該当L2 ownerへ戻す。 |
