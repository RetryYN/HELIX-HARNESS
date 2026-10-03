# HELIX-CONNECT L3 NFR候補（Stage 1 草稿）

> 状態: 全体的なretry/latency/retention数値は固定されていない。以下はfixed L2/L11から直接読める境界値、または比較・測定可能な技術候補であり、実装値やPO承認値ではない。各parameterについて個別PO判断は求めない。意味・scope・owner・versionを変える必要が生じた場合だけL2へ戻す。

| 候補parameter | 候補値・比較 | 根拠 | L10で観測するもの |
|---|---|---|---|
| retry cap | 接続ごとに宣言された契約上限を採用し、共通数値は設けない。任意の実装値ではなく、契約値を候補入力とする。 | `HELIXCONNECT-L2-004` は上限/可否を接続契約へ帰属させ、旧generic CONNECT sourceにも数値はない。PDCのpage/cursor値は別ownerのため転用しない。 | 契約上限がNならN回以内に止まり、N+1回目は発生しない。適格・不適格failure classも契約の宣言と照合する。 |
| 同一operationの重複効果 | 同一operation identity＋同一digestに対する業務効果の候補上限は1回、追加attemptの効果は0回。 | `HELIXCONNECT-L2-004`の同一identity/digest重複排除。 | 同じfixtureを再送し、受信効果1回・重複効果0回を確認。異digestは拒否し、business resultはretryしない。 |
| stale中の送信数 | revision drift検出から新しい互換照合まで送信0回。 | `HELIXCONNECT-L2-002`はstaleを互換成立と扱わず、再検証したrevision組だけstaleを解除する。 | revisionを変え、再照合までattempt数が0であること、送信なし照合のeligibilityが`not_evaluated`であることを観測する。 |
| trace completeness | 固定L2が挙げるevent classとoperation/revision/attempt識別子について、観測した各eventのtrace欠落0件を候補基準とする。本文payload保存件数は0でもよい。 | `HELIXCONNECT-L2-005`のappend-only trace、状態区分と端点観測範囲。 | 登録/照合/send/receipt/retry/stale/拒否/終端のfixture eventとtraceを突合。欠落・順序曖昧はunknownで業務完了しない。 |
| end-to-end latency / retention | 秒数・保存期間は候補値を置かない。採用比較は「source/ownerが宣言する契約値を測る」対「全接続へ一律値を新設」の二案とし、後者は根拠がないため候補外。 | 固定L2/L11および調査済み旧generic CONNECT sourceに一律数値根拠がない。 | owner宣言がある場合のみ、その区間/retention境界で値と証拠を測定し、宣言なしを数値達成と扱わない。 |

これらは観測可能な境界・比較候補であり、共通transport値、wire format、保存実装、業務完了条件を新設しない。
