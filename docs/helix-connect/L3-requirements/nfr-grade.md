# HELIX-CONNECT L3 NFR候補（Stage 1・Stage 2a・Stage 4 部分草稿）

> 状態: 全体的なretry/latency/retention数値は固定されていない。以下はfixed L2/L11から直接読める境界値、または比較・測定可能な技術候補であり、実装値やPO承認値ではない。各parameterについて個別PO判断は求めない。意味・scope・owner・versionを変える必要が生じた場合だけL2へ戻す。

| 候補ID / AC | 候補parameter | 候補値・比較 | 根拠 | L10で観測するもの |
|---|---|---|---|---|
| `CON-NFR-001` / AC-004-01 | retry cap | L11の「初回送信後に、設定済み上限まで再送」を根拠に、候補Nは初回ではなく追加retry数として扱う。共通数値は置かず接続契約のNを入力する。 | `HELIXCONNECT-L2-004` は上限/可否を接続契約へ帰属させる。旧generic CONNECT sourceに数値なし。PDCのpage/cursor値は別ownerのため転用しない。 | retry N-1回でまだ上限未到達、N回で停止、N+1回目の追加retry 0。total sendは初回1回+最大N retry。契約がNの意味を別途宣言する場合はその定義を入力し、この解釈を押し付けない。 |
| `CON-NFR-002` / AC-004-01 | 同一operationの重複効果 | 同一operation identity＋同一digestに対する業務効果の候補上限は1回、追加attemptの効果は0回。 | `HELIXCONNECT-L2-004`の同一identity/digest重複排除。 | 同じfixtureを再送し、受信効果1回・重複効果0回を確認。異digestは拒否し、business resultはretryしない。 |
| `CON-NFR-003` / AC-002-01 | stale中の送信数 | revision drift検出から新しい互換照合まで送信0回。 | `HELIXCONNECT-L2-002`はstaleを互換成立と扱わず、再検証したrevision組だけstaleを解除する。 | revisionを変え、再照合までattempt数が0であること、送信なし照合のeligibilityが`not_evaluated`であることを観測する。 |
| `CON-NFR-004` / AC-005-01 | trace completeness | 固定L2が挙げるevent classとoperation/revision/attempt識別子について、観測した各eventのtrace欠落0件を候補基準とする。本文payload保存件数は0でもよい。 | `HELIXCONNECT-L2-005`のappend-only trace、状態区分と端点観測範囲。 | 登録/照合/send/receipt/retry/stale/拒否/終端のfixture eventとtraceを突合。欠落・順序曖昧はunknownで業務完了しない。 |
| `CON-NFR-005` / AC-005-01 | end-to-end latency / retention | 共通SLA値は置かない。接続ごとのcontractに値が必要な場合、根拠・比較案・測定方法・判定境界を添えた技術候補として提示する。宣言済み値があればそれを入力に比較し、候補を実装値・PO承認値として扱わない。 | CONNECTは接続単位のcontractを扱い、固定L2/L11と調査済み旧generic CONNECT sourceに全接続共通のSLA根拠がない。これは必要な技術候補を一律に禁じる根拠ではない。 | 宣言値または候補値の根拠・比較・実測値・境界判定を記録する。未指定でも必要な技術値は候補化でき、宣言なしを数値達成と扱わない。意味・scope・owner・versionを変える場合だけL2/POへ戻す。 |
| `CON-NFR-006` / `CONNECT-AC-006-01, CONNECT-AC-006-02` | 片側交換のbranch coverage、固定側不変、fail-close、未完義務trace | 4交換類型を各1 fixtureずつ照合する候補coverage 4/4。各類型に(a)非互換、(b)未登録、(c)意味契約変更、(d)stale、(e)unknownを個別に与える20 negative fixtureで通信attempt 0。fixed-side機構/契約/artifact/dependency revisionと未完義務の保持を各fixtureで比較する。 | L2-006/L11-006が4交換類型の独立実施、固定側を変更しない保証、invalid時の通信0、未完operation/ACK/attempt/期限/義務のhandoffを列挙する。4/4と20 fixtureはこの明示列挙を測定できる比較集合候補であり、汎用性能閾値・新PO gateではない。 | 全4正常fixtureで固定側revision/contractが前後一致し、交換後revision/照合/送受信をtrace可能。全20 negative fixtureでattempt 0、old/new revision混在0、未完義務欠落0候補。 |

これらは観測可能な境界・比較候補であり、共通transport値、wire format、保存実装、業務完了条件を新設しない。

## Stage 4 technical candidates

| 候補ID／親 | 候補値・測定条件 | 根拠と比較 | 適用限界 |
|---|---|---|---|
| CON-NFR-008 / HELIXCONNECT-L2-008 | identity/revision/typed capability/probe descriptorのfield coverageは選択profileで全件、誤ったsafe/executable/send claimは0 | 固定親のfield列挙を全件照合する案とdescriptor件数だけ数える案を比較。後者は安全性を証明しないため不採用。 | probe latencyやMCP成功率は導かない。必要時は根拠・比較・測定付き候補にする。 |
| CON-NFR-009 / HELIXCONNECT-L2-009 | 選択relation tupleのlineage/reason/endpoint/contract revision欠落0、unknownから追加attemptを生む件数0 | relation field完全性とattempt traceを測定し、aggregate success count案よりunknown漏れを検出できるfield単位案を候補にする。 | 新retry cap、feedback timeout、共通SLAは追加しない。技術値が必要なら根拠付き候補として提示する。 |
