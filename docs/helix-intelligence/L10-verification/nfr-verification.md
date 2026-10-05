# HELIX-INTELLIGENCE L10 NFR総合検証（Stage 2a）

状態: NFR技術候補に対する検証設計。数値cutoffの採択、runtime計測、PO承認を示さない。L3 `nfr-grade.md`の候補を、固定L2が指定する測定次元と対にする。

旧NFR→measure/acceptance traceの形式を再導出する（LEGACY-ASSET-DB669724249A14A665F0, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-81`; paired oracle shape LEGACY-ASSET-44DD86E3DEC09E65EF51, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`）。旧IPA grade、threshold、pass値、CI/runtimeは流用しない。

## CASE-NFR-INT-010-01 — 観測母集団・windowの比較

- 固定L2親: `HELIXINTELLIGENCE-L2-010`、version target 1.0。L2 metrics: success/failure/rework/latency/cost/reliability。G13 L11:191–197はscope/revision内のquality/priority/tolerance判断の利用と理由/除外/unknown/未評価を照合し、未達隠蔽や再確認を不合格にする。これは新しいquality thresholdや067/034のStage prerequisiteではない。
- Candidate 1（推奨）: 固定task-class、scope、source/revisionで層別した全適格観測cohortから分布（p50/p95候補）を算出し、件数・測定期間・欠損・未評価を併記する。固定L2/L11の同scope performanceとtask/model class evidenceを直接追跡できる。
- functional fixture coverage: CASE-INT-010-01, CASE-INT-010-02a〜02j, CASE-INT-010-03a〜03b, CASE-INT-010-04a〜04k, CASE-INT-010-05, CASE-INT-010-06を実行範囲として数える。G13のCASE-01/02d〜02jはsource-bound oracle対照であり、価格/品質の数値threshold・minimum N・新gateとして集計しない。
- Candidate 2: rolling 30-dayと90-dayで同じmetricを集計する。30-dayは鮮度重視、90-dayは母集団数重視の候補として差を測る。task mix・revision driftを含むことがあるため、Candidate 1と同じtask/scope/revision境界へ束縛できないrolling valuesは別枠の参考値にする。
- 推奨候補比較: Candidate 1をproposalの基礎比較とし、rolling 30-day/90-dayは鮮度・実観測数・分布差を評価する補助比較にする。30/90日は比較用の候補であり規範値ではない。minimum Nやperformance cutoffを作らない。実際に存在する観測母集団、期間、task mix、missing countを明記し、データが薄いclassはunknown/未評価にする。
- 集計oracle: L3 `NFR-INT-010-01`の候補単位・分母を同じinput recordsから独立に集計する。結果判定済み件数に対するsuccess/failure割合、再作業有無を観測できた件数に対する再作業あり割合、latency/cost各有効件数と単位付きp50/p95を別に照合する。unknown・未判定・欠測を黙ってdropしない。空母集団、分母0、指標単位不一致、欠測、未知状態をそれぞれ変異し、値なし・別層・別件数を保持することを確認する。reliabilityの元oracle/単位/分母がない場合は未評価とし、状態名や真偽値のquantile、分母0の0%表示、unknownの成功扱いを不合格とする。
- 合格: 指標値が入力観測の同一source/revision/scopeに追跡でき、別class/scopeの観測を混ぜず、価格/name/benchmarkのみのpassを生成しない。評価可能性が不足する場合もその不足を報告し、root/PO毎値承認待ちで処理を止める条件にはしない。

## CASE-NFR-INT-066-01 — receipt complete bindingとturnaround計測

- 固定L2親: `HELIXINTELLIGENCE-L2-066`、version target 1.0。固定L11 `intelligence-acceptance.md:134-138,285`のbinding fieldと重複/未見版/遅延receipt条件をoracleとする。
- 全fixture census: functional L10 CASE-INT-066-01、CASE-INT-066-02、CASE-INT-066-03a、CASE-INT-066-03b、CASE-INT-066-03c、CASE-INT-066-04a、CASE-INT-066-04b、CASE-INT-066-04c、CASE-INT-066-04d、CASE-INT-066-05a〜05t、CASE-INT-066-06a〜06f、CASE-INT-066-07、CASE-INT-066-08a、CASE-INT-066-08bを全件数え、推奨Worker、根拠、除外理由、不確実性、unknown/未評価、origin、task/ticket/scope、Worker identity/capability/version、proposal schema/contractとpack contract version、source/evidence revision/scope、作成/受領actor/timeをfieldごとに個別欠落/不一致検査する。CASE-02はreceiptがない状態でもproposal記録は許しassignmentを成立させない。receipt通常経路は全binding正常時のみ受領し、欠落・不一致はL2記載どおり受領しない。
- latency candidate: 入力確定からOS receipt recordまでを同じ開始/終了点で測り、runtime-backed pathとhuman-substitute pathのp50/p95を比較する。固定L2/L11に期限・targetがないため、値を観測分布として提示し、任意のtimeout/cutoffを合否条件にしない。
- 母集団: fixed acceptance fixturesは全数検査する。real observationsが別途存在する場合だけ同じscope/contract revisionの母集団を明示し、fixturesと実データを混ぜない。期間やsample countは実在データから報告し、無根拠なwindow/Nを設定しない。
- 合格: field-level oracleが全normal fixtureで一致し、各欠落/不一致mutationをrejectしてOS/INTELLIGENCE/LABOの固定戻し先へ分類する。latencyの速さはevaluation、qualification、assignment、authorityを生成しない。

## L10 evidence record

CASEごとにfixture/input digest、対象親の固定PO/L2/L11 revision、metric population/scope/revision、観測件数・期間・欠測、期待値と実際値、owner routeを記録する。技術候補比較は根拠・比較・推奨と反証条件を記録するが、POへの値ごとの質問や追加gateにしない。実測がない候補を実測済みと報告しない。


## Stage 2c — 068/075の起草範囲とsource

状態: 以下のStage 2c追補はL3未承認の起草候補・未実行の検証設計である。上のStage 2a本文とその承認範囲を変更しない。対象は採択済みHELIXINTELLIGENCE-L2-068/075に限る。旧source起点・項目別の再導出/置換は各項目と時点監査に記録する。

状態: NFR技術候補に対する検証設計。数値cutoffの採択、runtime計測、PO承認を示さない。L3 `nfr-grade.md`の候補を、固定L2が指定する測定次元と対にする。

旧NFR→measure/acceptance traceの形式を再導出する（LEGACY-ASSET-DB669724249A14A665F0, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-81`; paired oracle shape LEGACY-ASSET-44DD86E3DEC09E65EF51, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`）。旧IPA grade、threshold、pass値、CI/runtimeは流用しない。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。この追補は承認済みStage 2aの010/066範囲を変更しない。項目別sourceと再導出は時点監査へ記録する。


## CASE-NFR-INT-068-01 — operation別入力・claim・budgetの計測候補

- 固定親: `HELIXINTELLIGENCE-L2-068`、L2 `491-506`、L11 `202-209`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。実装実測やL3採択を示さない。
- operation母集団: operation ID、scope、source/revisionを入力fieldの検査前に固定し、必須input欠落operationも母集団に残す。normal completed、failed、cancelled/stopped、未完了/不明のdispositionを一つだけ割り当てる。観測状態（観測あり/missing observation/censored）とfield状態（充足/missing/unknown/stale/restricted/conflict）は別軸にする。missing inputをdispositionに重複計上しない。preparationとdiagnosis/consultを分ける。
- 操作入力oracle: 2つの独立集計を照合する。operation充足率の分母は固定した全operation母集団、分子はすべての適用必須fieldが充足したoperation数。field別率の分母はcontract上そのfieldが適用必須となるoperation数、分子は当該fieldが充足したoperation数。入力field欠落の対象operation例を使い、operation分母には残り、対応fieldではmissing、operationは必要に応じて保留されることを確認する。failed＋missing field、cancelled＋stale field等の組合せ例ではdispositionとfield statusが別軸のまま集計されることを確認する。各適用母集団0の場合は率なしとする。
- claim oracle: fixture上の全substantive claimを各一つのclaim kind（fact/inference/hypothesis/unknown/unclassifiable）へ分類し、各claimがちょうど一つのkindへ入ること、全claim件数とkind合計が一致することを確認する。source support（trace-backed/unsupported/not assessable）およびunknown-to-fact、unknown-to-pass、wrong-owner return等の誤りeventは独立軸として記録し、一claimが複数eventを持つ場合もclaim kind countを重複させない。
- budget/elapsed oracle: 元assignment budgetの初期値・operation前後残量・deadline・stop/cancelを記録し、reset/増額や割合閾値を作らない。valid elapsedは既存OS記録が特定する同一operationの開始/終了event、same clock/unit、整合timestamp（start≤end）が全てある場合のみ。normal・failed・stoppedの個別fixtureで有効timestampなら観測validとして記録するが、validはpassを意味しない。両endpoint同時刻の実elapsed zeroと、elapsed定義/source欠落のunknownを別oracleにする。計測定義/sourceが有効な標本では、明示的な観測打切りをcensored、打切り以外の開始/終了endpoint欠落をmissing、両端はあるが時刻逆転または同時計測条件不一致をelapsed観測failed、両端整合をvalidの順で一状態だけ付ける。打切りとendpoint欠落が重なるfixtureもcensoredへ一度だけ数える。n_valid=0は分位値なし、観測記録自体が無い場合だけ未実測とし、欠測を0化しない。p50/p95はvalid標本だけから計算する。
- 合格: 入力field・operation・claim・elapsedの各分母とstatus軸が混ざらず、全fixture件数が再計算可能であること。計測定義不足はunknown/unavailableとして記録し、親にないruntime/clock/SLA義務、sample minimum、任意window、numeric cutoffを作らない。


## CASE-NFR-INT-075-01 — 宣言identityと適格化の測定候補

- 固定親: `HELIXINTELLIGENCE-L2-075`。L2 `618-625`、L11 `337-343`、PO採択行 `po-decision-2026-10-03-later35.md:33` のexact revision/digestを対照とする。実測やL3採択を示さない。
- field matrix: CASE-INT-075-01の全declared fieldを母集団として、各fieldについてnormal binding fixture・missing・altered・wrong-revision reason fixtureの有無を列挙する。6 identity条件の各変異がそれぞれsingle-fieldになっていることを検査する。coverage候補はnormal binding確認と独立negative理由確認の両方がmatrixにある宣言field数/全declared field数で示し、対象L2 revision、fixture数、未作成/未評価fieldを併記する。分母0は率なし。coverage結果を運用時passや資格へ変換しない。
- qualification matrix: self-rating、duplicate/existing owner、independent reproduction、counterevidence、expiry、supersession、finding/remediation identityを別facetとし、各facetの正常・negative・unknown fixture数とexpected/observed未qualified・owner handoff結果を記録する。facet間を単一scoreで相殺せず、未確認をpositive件数に含めない。
- authority population: current / compatibility / historicalを分け、歴史sourceをcurrent denominatorまたはcurrent passへ混ぜない。別producer/session/HEAD/stale/expired/superseded/duplicate fixtureはunseen/incomplete populationに分類し、理由と既存ownerを保持する。
- 判定: 候補NFRはテストmatrixの可観測性・coverage比較に限定する。合否閾値、最低件数、SLA、schema enum、Qualification algorithm、UIL runtime、Issue/CI/merge実行を追加しない。採択済みL2-009/L1-009とのtraceが不足する場合はunknownとして既存ownerへ返す。


## Stage 5 — NFR候補の測定oracle

状態: 各CASEは未実行の静的測定設計であり、実測・閾値達成・L3承認を示さない。分母とunknown/missing/staleは別記し、固定fixture数以外のminimum N、SLA、pass値を置かない。

### CASE-NFR-INT-060-01 — source/edge計画trace

同じ060-01/held-out inputからselected source数、宣言edge数、trace可能edge数、unknown/stale数を再計算し、母集団へ欠落を残す。

### CASE-NFR-INT-061-01 — LABO evidence適用可能性

同じtask-class/scope内外の評価件数とproposalに参照した件数を独立に集計し、別revisionを混ぜず未評価をpositive扱いしない。

### CASE-NFR-INT-062-01 — 段階別receipt台帳

SECURITY/Worker/HARNESS/OS各stageのavailable/missing/unknown/stale/return件数を別分母で再計算し、先行stage successで次段の欠損が消えないことを照合する。

### CASE-NFR-INT-063-01 — episode/時点identity

historical evaluation・current judgment・OS outcome・BRAIN applicabilityのepisode/revision/time bindingを別々に数え、late resultを元episodeへ戻す。

### CASE-NFR-INT-069-01 — 有限計算再現とunit

069 queue/worker fixed fixturesを再計算し、同一source/rule/inputでtrace/resultが一致するか記録する。計算不能/unknown/unsupported/stop件数を分け、unknownを0へ置換しない。運用性能分布へ外挿しない。

### CASE-NFR-INT-070-01 — 接続段階receipt台帳

033 input, 069 result, 040 send, LABO-024 receiptを独立集計し、同一model/scenario/target/correlationで結ばれたstageとmissing/duplicate/stale stageを別表示する。

### CASE-NFR-INT-071-01 — scenario比較可能性

固定L11の3 scenario (load increase, DB disconnect, virtual worker 2→4)をfixture母集団として、同model/rule/unit, numeric oracle, downstream receipt状態を別々に照合する。3件を運用sample minimumや精度targetとはしない。

### CASE-NFR-INT-074-01 — feedback適格性件数

同一fixture feedbackをevaluated/unassessed, matching/mismatching scope/revision, complete/incomplete sourceへ層別しeligible/unknown/excluded数を再計算する。未知と欠測を合格率へ押し込まない。

### CASE-NFR-INT-077-01 — source結合と非write境界

selected internal/external sourceを別populationで集計し、qualified binding/unknown field/non-write attempt/owner handoffを報告する。unknown consumer/owner populationを補完しない。

## CASE-to-NFR mapping

| NFR CASE | functional parents/fixtures | measured dimension |
|---|---|---|
| `CASE-NFR-INT-060-01` | 060 | source/edge trace |
| `CASE-NFR-INT-061-01` | 061 | evidence applicability |
| `CASE-NFR-INT-062-01` | 062 | per-stage evidence |
| `CASE-NFR-INT-063-01` | 063 | episode/time lineage |
| `CASE-NFR-INT-069-01` | 069 | deterministic arithmetic/unit/unknown |
| `CASE-NFR-INT-070-01` | 070 | separate receipts |
| `CASE-NFR-INT-071-01` | 071 | three fixed scenario comparison |
| `CASE-NFR-INT-074-01` | 074 | feedback applicability |
| `CASE-NFR-INT-077-01` | 077 | selected-source identity/non-write |



### 補完fixtureの件数・状態trace（未実行）

| NFR CASE | functional fixture母集団 | 観測項目 |
|---|---|---|
| `CASE-NFR-INT-060-02` | `CASE-INT-060-05a`–`CASE-INT-060-05i` | 四sourceとstop/fallback/dependencyの各単独変異、影響node、既存owner返却。 |
| `CASE-NFR-INT-061-02` | `CASE-INT-061-05a`–`CASE-INT-061-05e` | compatibility/task scope/OS割当/identity/revisionの別facet。 |
| `CASE-NFR-INT-062-02` | `CASE-INT-062-04a`–`CASE-INT-062-04i` | isolation/candidate/target/scope/revision/owner/order/result別のstage状態。 |
| `CASE-NFR-INT-063-02` | `CASE-INT-063-04a`–`CASE-INT-063-04h` | LABO/BRAIN/OS/HARNESSのsource・episode・時点・owner返却。 |
| `CASE-NFR-INT-069-02` | `CASE-INT-069-06a`–`CASE-INT-069-06q`, `CASE-INT-069-07a`–`CASE-INT-069-07f` | 必須contract/sourceとoperation条件を別母集団で数え、通常oracle/後段receiptなしの正常を保持。 |
| `CASE-NFR-INT-070-02` | `CASE-INT-070-07a`–`CASE-INT-070-07i`, `CASE-INT-070-08a`–`CASE-INT-070-08e` | stage contract、consumer、data-use、prediction/actual比較の別集計。 |
| `CASE-NFR-INT-071-02` | `CASE-INT-071-04a`–`CASE-INT-071-04j` | 3固定正常scenarioと4独立negativeを分けた状態/比較件数。 |
| `CASE-NFR-INT-074-02` | `CASE-INT-074-05a`–`CASE-INT-074-05y` | 欠落、比較不能、恒久結論、直接操作ごとのfixture件数。 |
| `CASE-NFR-INT-077-02` | `CASE-INT-077-05a`–`CASE-INT-077-05z` | unknown補完4、write5、receipt binding12、source fallback/origin4の区分。 |

全行は測定設計であり、測定結果・合格率・最低fixture数を生成しない。未実施fixtureは成功件数に含めない。
