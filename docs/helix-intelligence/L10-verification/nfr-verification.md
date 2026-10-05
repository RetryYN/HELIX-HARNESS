# HELIX-INTELLIGENCE L10 NFR総合検証（Stage 2c）

状態: NFR技術候補に対する検証設計。数値cutoffの採択、runtime計測、PO承認を示さない。L3 `nfr-grade.md`の候補を、固定L2が指定する測定次元と対にする。

旧NFR→measure/acceptance traceの形式を再導出する（LEGACY-ASSET-DB669724249A14A665F0, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-81`; paired oracle shape LEGACY-ASSET-44DD86E3DEC09E65EF51, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`）。旧IPA grade、threshold、pass値、CI/runtimeは流用しない。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。Stage 2aの010/066草稿は含めない。項目別sourceと再導出は時点監査へ記録する。

## CASE-NFR-INT-068-01 — operation別入力・claim・budgetの計測候補

- 固定親: `HELIXINTELLIGENCE-L2-068`、L2 `491-506`、L11 `202-209`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。実装実測やL3採択を示さない。
- operation母集団: operation ID、scope、source/revisionを入力fieldの検査前に固定し、必須input欠落operationも母集団に残す。normal completed、failed、cancelled/stopped、未完了/不明のdispositionを一つだけ割り当てる。観測状態（観測あり/missing observation/censored）とfield状態（充足/missing/unknown/stale/restricted/conflict）は別軸にする。missing inputをdispositionに重複計上しない。preparationとdiagnosis/consultを分ける。
- 操作入力oracle: 2つの独立集計を照合する。operation充足率の分母は固定した全operation母集団、分子はすべての適用必須fieldが充足したoperation数。field別率の分母はcontract上そのfieldが適用必須となるoperation数、分子は当該fieldが充足したoperation数。入力field欠落の対象operation例を使い、operation分母には残り、対応fieldではmissing、operationは必要に応じて保留されることを確認する。failed＋missing field、cancelled＋stale field等の組合せ例ではdispositionとfield statusが別軸のまま集計されることを確認する。各適用母集団0の場合は率なしとする。
- claim oracle: fixture上の全substantive claimを各一つのclaim kind（fact/inference/hypothesis/unknown/unclassifiable）へ分類し、各claimがちょうど一つのkindへ入ること、全claim件数とkind合計が一致することを確認する。source support（trace-backed/unsupported/not assessable）およびunknown-to-fact、unknown-to-pass、wrong-owner return等の誤りeventは独立軸として記録し、一claimが複数eventを持つ場合もclaim kind countを重複させない。
- budget/elapsed oracle: 元assignment budgetの初期値・operation前後残量・deadline・stop/cancelを記録し、reset/増額や割合閾値を作らない。valid elapsedは既存OS記録が特定する同一operationの開始/終了event、same clock/unit、整合timestamp（start≤end）が全てある場合のみ。normal・failed・stoppedの個別fixtureで有効timestampなら観測validとして記録するが、validはpassを意味しない。両endpoint同時刻の実elapsed zeroと、elapsed定義/source欠落のunknownを別oracleにする。計測定義/sourceが有効な標本では、明示的な観測打切りをcensored、打切り以外の開始/終了endpoint欠落をmissing、両端はあるが時刻逆転または同時計測条件不一致をelapsed観測failed、両端整合をvalidの順で一状態だけ付ける。打切りとendpoint欠落が重なるfixtureもcensoredへ一度だけ数える。n_valid=0は分位値なし、観測記録自体が無い場合だけ未実測とし、欠測を0化しない。p50/p95はvalid標本だけから計算する。
- 合格: 入力field・operation・claim・elapsedの各分母とstatus軸が混ざらず、全fixture件数が再計算可能であること。計測定義不足はunknown/unavailableとして記録し、親にないruntime/clock/SLA義務、sample minimum、任意window、numeric cutoffを作らない。


## CASE-NFR-INT-075-01 — 宣言identityと適格化の測定候補

- 固定親: `HELIXINTELLIGENCE-L2-075`。L2 `618-625`、L11 `337-343`、PO採択行 `po-decision-2026-10-03-later35.md:33` のexact revision/digestを対照とする。実測やL3採択を示さない。
- field matrix: CASE-INT-075-01の全declared fieldを母集団として、各fieldについてnormal binding fixture・missing・altered・wrong-revision reason fixtureの有無を列挙する。6 identity条件の各変異がそれぞれsingle-fieldになっていることを検査する。coverage候補は確認済みfield条件数/declared field数で示し、対象L2 revision、fixture数、未作成/未評価fieldを併記する。分母0は率なし。coverage結果を運用時passや資格へ変換しない。
- qualification matrix: self-rating、duplicate/existing owner、independent reproduction、counterevidence、expiry、supersession、finding/remediation identityを別facetとし、各facetの正常・negative・unknown fixture数とexpected/observed未qualified・owner handoff結果を記録する。facet間を単一scoreで相殺せず、未確認をpositive件数に含めない。
- authority population: current / compatibility / historicalを分け、歴史sourceをcurrent denominatorまたはcurrent passへ混ぜない。別producer/session/HEAD/stale/expired/superseded/duplicate fixtureはunseen/incomplete populationに分類し、理由と既存ownerを保持する。
- 判定: 候補NFRはテストmatrixの可観測性・coverage比較に限定する。合否閾値、最低件数、SLA、schema enum、Qualification algorithm、UIL runtime、Issue/CI/merge実行を追加しない。採択済みL2-009/L1-009とのtraceが不足する場合はunknownとして既存ownerへ返す。
