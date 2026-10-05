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
