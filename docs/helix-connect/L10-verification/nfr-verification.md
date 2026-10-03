# HELIX-CONNECT L10 NFR候補検証（Stage 1・Stage 2a・Stage 4・Stage 5 部分草稿）

本書は[L3 NFR候補](../L3-requirements/nfr-grade.md)の各候補を同じIDで測定する。未指定値は根拠付き候補として比較し、実装値やPO承認値を仮定しない。意味・scope・owner・version変更が必要な場合だけL2/POへ戻す。

| 候補 / AC | 入力と測定方法 | 合格判定 | 失敗・戻し先 |
|---|---|---|---|
| `CON-NFR-001` / `CONNECT-AC-004-01` | 接続契約で宣言されたretry上限N、初回送信1回とretry回数を分けたattempt traceを入力。retry N-1回、N回、N+1回目の境界を測定する。 | L11の記述どおり、初回送信後に契約が許す最大N回までretryし、N+1回目retryは0。同一ID/digestの効果1回、異digest拒否。契約がNをtotal attemptsと明記する場合はその宣言で境界を解釈し、推測で置換しない。 | retry対象/上限の意味が契約内でunknownなら追加retry 0のままownerへ返す。business failureはretryしない。 |
| `CON-NFR-002` / `CONNECT-AC-004-01` | 同じoperation identity/digestの再到着を複数回発生させ、receiver effect countとattempt traceを測る。次に同ID/異digestを入力する。 | 業務効果は1回、追加重複効果は0回。異digestは拒否され効果増加なし。 | duplicate suppression不明または異digest衝突は送信停止しoperation ownerへ返す。 |
| `CON-NFR-003` / `CONNECT-AC-002-01` | endpoint/contract revisionを変え、stale検出からcompatible再照合までのattempt countを測る。read-only照合だけのeligibility結果も記録する。 | 再照合まで送信attempt 0。read-only照合ではeligibility=`not_evaluated`。 | 比較不能はunknown/staleを保ちCONNECT契約owner、send authority差はSECURITYへ戻す。 |
| `CON-NFR-004` / `CONNECT-AC-005-01` | 登録/照合/send/receipt/retry/stale/拒否/終端の各観測eventをoperation/revision/attemptでtraceと突合し、欠落数・順序不明数を測る。 | 観測済みeventのtrace欠落0。欠落/順序曖昧はunknownで業務完了0。raw payload保存は必須にしない。 | trace producer/operation ownerへ欠落eventを返し、SECURITY/data-use不明は該当ownerへ返す。 |
| `CON-NFR-005` / `CONNECT-AC-005-01` | 接続contractの宣言値、または根拠・比較案・測定方法・判定境界を添えた技術候補を入力し、end-to-end latency区間/retention windowを実測する。 | 入力値の根拠・実測値・境界判定を記録する。候補は実装値・PO承認値ではなく、未指定を達成扱いしない。共通SLAを新設せず、必要な技術候補の起草も妨げない。 | 候補化に必要な入力が不足すればunknownとして接続contract ownerへ返す。要求の意味・scope・owner・versionを変える場合だけ該当L2/POへ戻す。 |
| `CON-NFR-006` / `CONNECT-AC-006-01, CONNECT-AC-006-02` | 4交換類型を独立fixtureにし、各々でfixed-side機構/契約/artifact/dependency revisionのbefore/after、交換側revision、互換receipt、送受信event、未完operation/ACK/attempt/期限/義務を照合。さらに各類型に(a)非互換、(b)未登録、(c)意味契約変更、(d)stale、(e)unknownを個別適用する。 | 候補判定: 4/4の正常交換で固定側revision不変かつ同一契約通信を再構成可能。20/20否定fixtureで通信attempt 0、再照合/再開前retry 0、旧新revision混在0、handoff obligation欠落0。4/4と20/20はL2/L11の列挙case coverage由来の候補値で、新しいPO gateではない。 | 意味契約差分は両端owner、技術互換差分はadapter owner、許可差分はSECURITYへ戻し、未完義務とrecovery先を残す。 |

## Stage 4 NFR候補測定

| 候補 | 入力・測定 | 判定候補 | 限界 |
|---|---|---|---|
| CON-NFR-008 | 選択profile descriptor fieldとsource revisions | 全fieldを照合し、identity mismatchと誤safe/executable/send claimが0。descriptor数のみのcoverage案と比較する。 | 性能閾値・operation成功率を追加しない。 |
| CON-NFR-009 | relation tuple、attempt trace、既存retry/budget policy revision | tuple欠落とpolicy外attemptを別々に数え、unknownからの追加attempt0を候補とする。 | policy値を発明しない。未指定の必要技術値は計測比較付き候補にできる。 |

## Stage 5 NFR候補測定

| 候補 | 入力・測定 | 判定候補 | 限界 |
|---|---|---|---|
| CON-NFR-007-01 | CASE-007-01/03の構成体manifest・required edgeごとの登録、互換、operation lineage、terminal evidence | 全required edgeのtrace closure 100%。aggregate-only案より、欠落edgeと未完ownerをedge単位に特定できる。 | 宣言済み構成体以外を分母へ足さない。業務successや性能SLAを含めない。 |
| CON-NFR-007-02 | CASE-007-02の中間edge stale/timeout/digest conflict/expiry/cancel/permission revoke/partial success mutationと後続attempt trace | 各negative fixtureで後続未許可attempt 0、false composite success 0。 | 固定L2/L11のfailure列挙の範囲に限り、未指定retry capを追加しない。 |
