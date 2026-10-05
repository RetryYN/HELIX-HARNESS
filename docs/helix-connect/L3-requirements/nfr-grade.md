# HELIX-CONNECT L3 NFR候補（Stage 1）

> 状態: 全体的なretry/latency/retention数値は固定されていない。以下はfixed L2/L11から直接読める境界値、または比較・測定可能な技術候補であり、実装値やPO承認値ではない。各parameterについて個別PO判断は求めない。意味・scope・owner・versionを変える必要が生じた場合だけL2へ戻す。

| 候補ID / AC | 候補parameter | 候補値・比較 | 根拠 | L10で観測するもの |
|---|---|---|---|---|
| `CON-NFR-001` / AC-004-01 | retry capとfailure classification | L11の「初回送信後に、設定済み上限まで再送」を根拠に、候補Nは初回ではなく追加retry数として扱う。failure classificationがmissing/unknownなら候補上の追加retryは0とし、unknownをretryableへ補完しない。共通数値は置かず接続契約のNを入力する。 | `HELIXCONNECT-L2-004` は上限/可否を接続契約へ帰属させる。今回参照した旧配布契約は接続契約ごとのretry数値の根拠ではない。 | retry N-1回でまだ上限未到達、N回で停止、N+1回目の追加retry 0。missing/unknown classification別fixtureでも追加retry 0、unknown記録、operation ownerへの返却を観測する。契約がNの意味を別途宣言する場合はその定義を入力し、この解釈を押し付けない。 |
| `CON-NFR-002` / AC-004-01 | 同一operationの重複効果 | 同一operation identity＋同一digestに対する業務効果の候補上限は1回、追加attemptの効果は0回。 | `HELIXCONNECT-L2-004`の同一identity/digest重複排除。 | 同じfixtureを再送し、受信効果1回・重複効果0回を確認。異digestは拒否し、business resultはretryしない。 |
| `CON-NFR-003` / AC-002-01 | stale中の送信数 | revision drift検出から新しい互換照合まで送信0回。 | `HELIXCONNECT-L2-002`はstaleを互換成立と扱わず、再検証したrevision組だけstaleを解除する。 | 端点、意味契約revision、adapter/transport revision、互換範囲を各々変え、登録時と使用時のrevision記録と再照合までattempt数が0であること、送信なし照合のeligibilityが`not_evaluated`であることを観測する。 |
| `CON-NFR-004` / AC-005-01 | trace completeness | 固定L2が挙げるevent classとoperation/revision/attempt識別子について、観測した各eventのtrace欠落0件を候補基準とする。L11列挙の証拠fieldも個別に全件照合する。通常trace/receiptのraw業務payload・secret・credential値保存/複製件数は各0とし、同一identity同digest重複と異digest衝突を別状態で測る。 | `HELIXCONNECT-L2-005`のappend-only trace、状態区分と端点観測範囲。 | 登録/照合/send/receipt/retry/stale/拒否/終端のfixture eventとtraceを突合。欠落・順序曖昧はunknownで業務完了しない。 |
| `CON-NFR-005` / AC-005-01 | end-to-end latency / retention | 共通SLA値は置かない。接続ごとのcontractに値が必要な場合、根拠・比較案・測定方法・判定境界を添えた技術候補として提示する。宣言済み値があればそれを入力に比較し、候補を実装値・PO承認値として扱わない。 | CONNECTは接続単位のcontractを扱い、固定L2/L11と今回参照した旧配布契約・対の検証設計には全接続共通のSLA根拠がない。これは必要な技術候補を一律に禁じる根拠ではない。 | 宣言値または候補値の根拠・比較・実測値・境界判定を記録する。未指定でも必要な技術値は候補化でき、宣言なしを数値達成と扱わない。意味・scope・owner・versionを変える場合だけL2/POへ戻す。 |

これらは観測可能な境界・比較候補であり、共通transport値、wire format、保存実装、業務完了条件を新設しない。


旧NFR `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:1–73`（asset `LEGACY-ASSET-8CC5ABFC98C0D00183CA`、SHA-256 `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`）から候補・測定・受入の対応形式を意味再導出する。旧projectionのgrade・memory件数/文字数・verification timeout・confidence・approval snapshot値は継承せず、今回の固定親の接続単位・owner境界へ再導出する。理由は旧HELIXの運用・承認projectionとCONNECTの契約単位を混同しないためである。旧CLI/CI/Bunは使用しない。


## Stage 2a 追加 — HELIXCONNECT-L2-006のみ

| 候補ID / AC | 観測対象・値 | 根拠と比較 | L10での測定 |
|---|---|---|---|
| `CON-NFR-006` / `CONNECT-AC-006-01..04` | L11が列挙する4交換型すべてを独立照合（4/4）。固定側identity/契約revision変更0、非互換・unknown・stale時のsend/retry attempt 0、許可不足時のexchange/send/retry attempt 0、旧新revision混載0。未完operation/ACK/attempt/expiry/義務は交換前後receipt間で全て保持し、未完operationの事前有無を問わず旧→新revision・current comparison receipt・operation/attempt・技術結果のtraceを一続きで追跡する。CASE-006-01でreceipt/operation/attempt/resultのtrace断絶をlinkごとにnegative測定し、operation identity欠落、attempt履歴欠落、再照合前retryもCASE-006-03で別々に測る。両側変更はunknown/rejectで片側交換のpass計数に含めない。 | 4型、互換時の固定側不変、失敗時停止、未完引継ぎは固定L2-006/L11-006の明示条件から採る。compatibility failureは片側交換後の照合で検出し得るため、交換自体を事前禁止せず送信・再送を0にする。交換開始禁止は該当する既存許可が不足するauthority反例に限る。共通latency、transport、compatibility range数値は親が定めていないため新しい値を置かず、端点ownerの宣言済み互換条件を入力する。これは測定候補で実装値やPO承認値ではなく、個別parameterごとの質問/gateを作らない。 | CASE-006-01の4正常型で旧新revisionから技術結果までのtraceを検証し、receipt/current comparison/operation/attempt/resultそれぞれの断絶をnegativeとして測る。failure class別send/retry attempt、未完義務、scope・許可も観測する。根拠不足/比較不能はunknown/staleで停止する。 |

この追加はStage 1のNFR rowsに変更を加えない。意味・scope・owner・versionを変える必要が生じた場合のみL2/POへ戻す。
