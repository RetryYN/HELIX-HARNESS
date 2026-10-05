# HELIX-LABO L3 NFR候補 — Stage 1（001/011）

根拠付き技術候補。実測値・承認値・実装値ではない。旧NFRの値を継承せず、parameterごとのPO承認を新設しない。必要な技術値は根拠・比較・測定方法を同じL3/L10へ追補する。

| 項目 | 候補値・比較 | 根拠と測定 | 適用限界 |
|---|---|---|---|
| `HELIXLABO-L2-001` — observation field coverage | L2列挙20 fieldsを許可されたsourceごとに保持（20/20。未提供fieldは元source statusを変更せず、理由付きprocessing holdとして記録） | 親L2-001の明示listとL11。各field欠落や別source/revision挿入のmutationを確認。 | 旧4 source/5 metricsを使わず、接続source数もL2-021..030の有効契約に依存。 |
| `HELIXLABO-L2-001` — status coverage and fidelity | 7 source status labelsを区別し、unknown→successとnot_observed→successの変換を各0。LABOのprocessing hold/warningをsource statusとして生成しない | success/failure/rejected/cancelled/blocked/unknown/not_observedを個別投入。source stateとの突合。 | status severity/weight、dashboard update intervalは未指定。 |
| `HELIXLABO-L2-001` — source authority leakage | LABO→source canonical state writeback 0 | source authority/stateを別ownerのfixtureで照合。拒否/未許可情報の保持をsource正本に反映しない。 | 新しいdata classification/secret detectorは本要件外。 |
| `HELIXLABO-L2-011` — roundtrip reference completeness | episode candidateから元observation identity+source revisionへ全件往復可能 | L2-011/L11明示。source refをAggregate→Correlate→episode→sourceで往復してfield一致を観測。 | join key、time window、similarity scoreは未指定。 |
| `HELIXLABO-L2-011` — false causality | L2-011出力でのcausal assertion 0（evidenceの有無によらない） | 因果らしく見えるevidenceを含む入力と、時刻/pathだけの入力を別々に与える。correlation candidateは保持できてもL2-011出力でcausal labelを付けない。 | causal confidence threshold・相関algorithmは未指定。 |

20 field全件と部分一致を比較し、部分一致は出典欠落を隠すため全件照合候補を採る。statusは実在状態の忠実保持を候補にし、存在しない状態を件数合わせで生成しない。往復参照と片方向参照では後者が誤相関を隠すため往復参照候補を採る。

旧NFR起点は `LEGACY-ASSET-8CC5ABFC98C0D00183CA`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:1–73`、全文SHA `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3` と、`LEGACY-ASSET-DB669724249A14A665F0`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74`、全文SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`。測定・根拠・対の観測へ結ぶ形式を再導出し、IPA grade、memory/timeout/confidence値、旧承認・CIを移さない。現行5測定項目は固定LABO L2/L11のfield/status/owner/往復参照を根拠とする。

## Stage 2a — 055/056/057 技術候補（1.0、L3一括承認用）

下記は根拠・比較・測定を添えた技術候補であり、実測/実装/承認値ではない。通常のL3承認packageで扱い、parameterごとのPO質問や追加gateを作らない。L2 meaning/scope/owner/versionを変えず、値の具体化や実測だけでL2へ戻さない。

| 対象 | 候補値 | 固定親を根拠とする比較・選択 | L10測定 |
|---|---|---|---|
| `LABO-055-FR-01` | task type × model classごとに `n_total`、sourceごとの実在state label・source/revision単位のcount、`n_state_missing, n_evaluated, n_unassessed`、oracle identity+revision、適用範囲、証拠充足状態を記録。存在stateのcount保存100%、実在state label別count合計＋`n_state_missing`=`n_total`、state label統合/脱落0。対応可能性水準は固定L11が定める採用する評価oracle/基準の適用可能な結果をそのまま保持し、異なる評価結果の水準混同0。 | 固定055の水準・根拠・評価範囲とassessed/unassessedを保持しつつ、coverage stateのみを水準の代用にする方式や、全job一括成功率・全provider ordinal rankと比較。未評価を隠す/配置権限境界を越える方法は採らない。水準の意味・尺度は新設しない。 | 0/1/複数件、fixtureに実在する各source state labelを個別に与え（source上unknownも欠落stateも別保持し、存在しないlabelは追加しない）、複数の宣言済みoracle結果を与える。実在state label別count合計＋`n_state_missing`=`n_total`、source result水準と根拠を保持し、oracle適用scope内の未見群も評価。oracle不足・scope外・判定不能・根拠不足ではunassessed。coverage stateと水準を独立照合。 |
| `LABO-056-FR-01` | 必須source identity/revision/scope/state/budget/deadline/evidence field保持率100%、変異0。五stateの区別保持100%、unknown/state coercion 0、oracle適用証拠なしのassessed promotion 0。評価者・評価時点・decision receiptをexact oracle/resultへ束縛。 | 固定056の列挙field/stateとL11のoracle receipt条件を完全保存し、欠落をsuccess扱いする方式と比較。欠落fieldは値を補わずfield不確実性として、result stateと評価unassessedとは分けて保持する候補。 | 各必須field（budget/deadlineを含む）を一つずつ欠落/変更し、oracle identity/revision/scope/evidence/evaluator/time/receiptを個別に欠落・古化・範囲外化する。 |
| `LABO-057-FR-01` | source/receiptの必須field差0、same source identity/ID retry時の重複observation 0（観測1件）、stale受領0。 | 固定057のidentity/revision/scope保持、ack/trace/dedupe/stale-stop/same-ID retryから導出。CONNECTと明示human receiptの両方式で同じ観測点を比較。 | 初回、ack消失、same-ID retry、遅延duplicate receiptを双方の経路で評価し、未完義務・1件性・exact fieldsを照合。 |
| 055/056/057 timing and volume | payload size・group数・履歴件数の各条件組合せごとに計画試行母集団を定め、ingestion latencyのp50/p95とthroughput候補を別々に記録する。固定閾値・容量上限・保持期間・SLAは置かない。 | 固定親にworkload限度やSLAはない。旧Benchはfailure/missingを分母から捨てないため、各試行を `valid / failed / missing / censored` の排他的状態へ分けて母集団全体を記録する。新しいtransport要求は作らない。 | 各条件の `N_planned` を分母に `N_valid, N_failed, N_missing, N_censored` を別々に数え、合計と母集団一致を確認する。p50/p95はvalid latencyだけから算出し `N_valid/N_planned` も併記。`N_valid=0`ならpercentileは算出値なし。`N_valid/N_planned`は`N_planned=0`で算出値なしとし、`N_planned>0`かつ`N_valid=0`なら0の割合と失敗等の件数を併記する。throughputは有効処理件数を明示的な測定時間（seconds）で割り `items/second` として独立記録し、`N_planned=0`または測定時間が0/missingなら算出値なしとする。 |

100%/0は状態・identityの不変性、誤った昇格や重複生成を測る候補で、business success rate・性能SLA・資格基準ではない。実operationのeligibilityやSLAを固定親の既存source契約と混同しない。採用oracleのownerが未定でも候補測定とL3起草は進める。意味・scope・owner・versionの変更が必要な場合だけ該当L2へ戻す。
