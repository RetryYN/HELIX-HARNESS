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


## CASE-NFR-INT-Stage4-01 — 親別coverage母集団

- 母集団: 下表の親ごとに固定L2/L11がrequiredとするsource/field/obligationと、当該functional CASEの適用変異。適用必須field数が0の場合は分母/率なし。 `CASE-INT-017-05a〜q`のpack field母集団は、固定L2に共通pack句のない017がpackを実際に消費するoperationに限る。036/039は固定L2に従い各operationへ適用する。
- 集計境界: functional summary見出し02/04と索引033-04f、034-02k、036-02jは個別fixtureの索引であり、独立fixtureや観測fieldへ二重計上しない。比率の分母はCASE件数ではなく各fixtureに適用されるrequired fieldの件数である。
- 候補式: 正しいsource/revision/scope/ownerへ束縛されたrequired field数 ÷ 適用required field数。対象fixture全数で100%を比較候補とする。誤bindは別に個数を記録し、coverageで相殺しない。
- 欠測/unknown/stale/conflictは各々独立の記録状態。未実測は0件成功へ置き換えない。指標の観測自体が不可能ならunavailable/unknown。

| NFR ID | fixed parent / dimension | denominator fixtures | candidate boundary |
|---|---|---|---|
| `NFR-INT-017-01` | `HELIXINTELLIGENCE-L2-017` source/revision/scope/owner | `CASE-INT-017-01`, `CASE-INT-017-01a`, `CASE-INT-017-02a`, `CASE-INT-017-02b`, `CASE-INT-017-02c`, `CASE-INT-017-02d`, `CASE-INT-017-02e`, `CASE-INT-017-02f`, `CASE-INT-017-02g`, `CASE-INT-017-02h`, `CASE-INT-017-02i`, `CASE-INT-017-02j`, `CASE-INT-017-02k`, `CASE-INT-017-02l`, `CASE-INT-017-02m`, `CASE-INT-017-02n`, `CASE-INT-017-02o`, `CASE-INT-017-03`, `CASE-INT-017-03a`, `CASE-INT-017-04a`, `CASE-INT-017-04b`, `CASE-INT-017-04c`, `CASE-INT-017-04d`, `CASE-INT-017-04e`, `CASE-INT-017-05a`, `CASE-INT-017-05b`, `CASE-INT-017-05c`, `CASE-INT-017-05d`, `CASE-INT-017-05e`, `CASE-INT-017-05f`, `CASE-INT-017-05g`, `CASE-INT-017-05h`, `CASE-INT-017-05i`, `CASE-INT-017-05j`, `CASE-INT-017-05k`, `CASE-INT-017-05l`, `CASE-INT-017-05m`, `CASE-INT-017-05n`, `CASE-INT-017-05o`, `CASE-INT-017-05p`, `CASE-INT-017-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-030-01` | `HELIXINTELLIGENCE-L2-030` source/revision/scope/owner | `CASE-INT-030-01`, `CASE-INT-030-02a`, `CASE-INT-030-02b`, `CASE-INT-030-02c`, `CASE-INT-030-02d`, `CASE-INT-030-02e`, `CASE-INT-030-02f`, `CASE-INT-030-02g`, `CASE-INT-030-02h`, `CASE-INT-030-03`, `CASE-INT-030-04a`, `CASE-INT-030-04b`, `CASE-INT-030-04c`, `CASE-INT-030-04d`, `CASE-INT-030-04e`, `CASE-INT-030-04f`, `CASE-INT-030-05a`, `CASE-INT-030-05b`, `CASE-INT-030-05c`, `CASE-INT-030-05d`, `CASE-INT-030-05e`, `CASE-INT-030-05f`, `CASE-INT-030-05g`, `CASE-INT-030-05h`, `CASE-INT-030-05i`, `CASE-INT-030-05j`, `CASE-INT-030-05k`, `CASE-INT-030-05l`, `CASE-INT-030-05m`, `CASE-INT-030-05n`, `CASE-INT-030-05o`, `CASE-INT-030-05p`, `CASE-INT-030-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-031-01` | `HELIXINTELLIGENCE-L2-031` source/revision/scope/owner | `CASE-INT-031-01`, `CASE-INT-031-02a`, `CASE-INT-031-02b`, `CASE-INT-031-02c`, `CASE-INT-031-02d`, `CASE-INT-031-02e`, `CASE-INT-031-02f`, `CASE-INT-031-02g`, `CASE-INT-031-02n`, `CASE-INT-031-03`, `CASE-INT-031-04a`, `CASE-INT-031-04b`, `CASE-INT-031-04c`, `CASE-INT-031-04d`, `CASE-INT-031-04e`, `CASE-INT-031-05a`, `CASE-INT-031-05b`, `CASE-INT-031-05c`, `CASE-INT-031-05d`, `CASE-INT-031-05e`, `CASE-INT-031-05f`, `CASE-INT-031-05g`, `CASE-INT-031-05h`, `CASE-INT-031-05i`, `CASE-INT-031-05j`, `CASE-INT-031-05k`, `CASE-INT-031-05l`, `CASE-INT-031-05m`, `CASE-INT-031-05n`, `CASE-INT-031-05o`, `CASE-INT-031-05p`, `CASE-INT-031-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-032-01` | `HELIXINTELLIGENCE-L2-032` source/revision/scope/owner | `CASE-INT-032-01`, `CASE-INT-032-02a`, `CASE-INT-032-02b`, `CASE-INT-032-02c`, `CASE-INT-032-02d`, `CASE-INT-032-02e`, `CASE-INT-032-02f`, `CASE-INT-032-02g`, `CASE-INT-032-02h`, `CASE-INT-032-02i`, `CASE-INT-032-02j`, `CASE-INT-032-02k`, `CASE-INT-032-02l`, `CASE-INT-032-02m`, `CASE-INT-032-03`, `CASE-INT-032-04a`, `CASE-INT-032-04b`, `CASE-INT-032-04c`, `CASE-INT-032-04d`, `CASE-INT-032-04e`, `CASE-INT-032-04f`, `CASE-INT-032-04g`, `CASE-INT-032-04h`, `CASE-INT-032-04i`, `CASE-INT-032-04j`, `CASE-INT-032-04k`, `CASE-INT-032-04l`, `CASE-INT-032-05a`, `CASE-INT-032-05b`, `CASE-INT-032-05c`, `CASE-INT-032-05d`, `CASE-INT-032-05e`, `CASE-INT-032-05f`, `CASE-INT-032-05g`, `CASE-INT-032-05h`, `CASE-INT-032-05i`, `CASE-INT-032-05j`, `CASE-INT-032-05k`, `CASE-INT-032-05l`, `CASE-INT-032-05m`, `CASE-INT-032-05n`, `CASE-INT-032-05o`, `CASE-INT-032-05p`, `CASE-INT-032-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-033-01` | `HELIXINTELLIGENCE-L2-033` source/revision/scope/owner | `CASE-INT-033-01`, `CASE-INT-033-02a`, `CASE-INT-033-02b`, `CASE-INT-033-02c`, `CASE-INT-033-02d`, `CASE-INT-033-02e`, `CASE-INT-033-02f`, `CASE-INT-033-02g`, `CASE-INT-033-02h`, `CASE-INT-033-02i`, `CASE-INT-033-03`, `CASE-INT-033-03a`, `CASE-INT-033-04a`, `CASE-INT-033-04b`, `CASE-INT-033-04c`, `CASE-INT-033-04d`, `CASE-INT-033-04e`, `CASE-INT-033-05a`, `CASE-INT-033-05b`, `CASE-INT-033-05c`, `CASE-INT-033-05d`, `CASE-INT-033-05e`, `CASE-INT-033-05f`, `CASE-INT-033-05g`, `CASE-INT-033-05h`, `CASE-INT-033-05i`, `CASE-INT-033-05j`, `CASE-INT-033-05k`, `CASE-INT-033-05l`, `CASE-INT-033-05m`, `CASE-INT-033-05n`, `CASE-INT-033-05o`, `CASE-INT-033-05p`, `CASE-INT-033-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-034-01` | `HELIXINTELLIGENCE-L2-034` source/revision/scope/owner | `CASE-INT-034-01`, `CASE-INT-034-02a`, `CASE-INT-034-02b`, `CASE-INT-034-02c`, `CASE-INT-034-02d`, `CASE-INT-034-02e`, `CASE-INT-034-02f`, `CASE-INT-034-02g`, `CASE-INT-034-02h`, `CASE-INT-034-02i`, `CASE-INT-034-02j`, `CASE-INT-034-02l`, `CASE-INT-034-02m`, `CASE-INT-034-02n`, `CASE-INT-034-03`, `CASE-INT-034-04a`, `CASE-INT-034-04b`, `CASE-INT-034-04c`, `CASE-INT-034-04d`, `CASE-INT-034-04e`, `CASE-INT-034-04f`, `CASE-INT-034-05a`, `CASE-INT-034-05b`, `CASE-INT-034-05c`, `CASE-INT-034-05d`, `CASE-INT-034-05e`, `CASE-INT-034-05f`, `CASE-INT-034-05g`, `CASE-INT-034-05h`, `CASE-INT-034-05i`, `CASE-INT-034-05j`, `CASE-INT-034-05k`, `CASE-INT-034-05l`, `CASE-INT-034-05m`, `CASE-INT-034-05n`, `CASE-INT-034-05o`, `CASE-INT-034-05p`, `CASE-INT-034-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-035-01` | `HELIXINTELLIGENCE-L2-035` source/revision/scope/owner | `CASE-INT-035-01`, `CASE-INT-035-02a`, `CASE-INT-035-02b`, `CASE-INT-035-02c`, `CASE-INT-035-02d`, `CASE-INT-035-02e`, `CASE-INT-035-02f`, `CASE-INT-035-02g`, `CASE-INT-035-02h`, `CASE-INT-035-02i`, `CASE-INT-035-02j`, `CASE-INT-035-02k`, `CASE-INT-035-02l`, `CASE-INT-035-02m`, `CASE-INT-035-03`, `CASE-INT-035-04a`, `CASE-INT-035-04b`, `CASE-INT-035-04c`, `CASE-INT-035-04d`, `CASE-INT-035-04e`, `CASE-INT-035-04f`, `CASE-INT-035-04g`, `CASE-INT-035-05a`, `CASE-INT-035-05b`, `CASE-INT-035-05c`, `CASE-INT-035-05d`, `CASE-INT-035-05e`, `CASE-INT-035-05f`, `CASE-INT-035-05g`, `CASE-INT-035-05h`, `CASE-INT-035-05i`, `CASE-INT-035-05j`, `CASE-INT-035-05k`, `CASE-INT-035-05l`, `CASE-INT-035-05m`, `CASE-INT-035-05n`, `CASE-INT-035-05o`, `CASE-INT-035-05p`, `CASE-INT-035-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-036-01` | `HELIXINTELLIGENCE-L2-036` source/revision/scope/owner | `CASE-INT-036-01`, `CASE-INT-036-02a`, `CASE-INT-036-02b`, `CASE-INT-036-02c`, `CASE-INT-036-02d`, `CASE-INT-036-02e`, `CASE-INT-036-02f`, `CASE-INT-036-02g`, `CASE-INT-036-02h`, `CASE-INT-036-02i`, `CASE-INT-036-02k`, `CASE-INT-036-02l`, `CASE-INT-036-02n`, `CASE-INT-036-02o`, `CASE-INT-036-03`, `CASE-INT-036-03a`, `CASE-INT-036-03b`, `CASE-INT-036-04a`, `CASE-INT-036-04b`, `CASE-INT-036-04c`, `CASE-INT-036-04d`, `CASE-INT-036-04e`, `CASE-INT-036-04f`, `CASE-INT-036-04g`, `CASE-INT-036-04h`, `CASE-INT-036-04i`, `CASE-INT-036-04j`, `CASE-INT-036-04k`, `CASE-INT-036-05a`, `CASE-INT-036-05b`, `CASE-INT-036-05c`, `CASE-INT-036-05d`, `CASE-INT-036-05e`, `CASE-INT-036-05f`, `CASE-INT-036-05g`, `CASE-INT-036-05h`, `CASE-INT-036-05i`, `CASE-INT-036-05j`, `CASE-INT-036-05k`, `CASE-INT-036-05l`, `CASE-INT-036-05m`, `CASE-INT-036-05n`, `CASE-INT-036-05o`, `CASE-INT-036-05p`, `CASE-INT-036-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-037-01` | `HELIXINTELLIGENCE-L2-037` source/revision/scope/owner | `CASE-INT-037-01`, `CASE-INT-037-02a`, `CASE-INT-037-02b`, `CASE-INT-037-02c`, `CASE-INT-037-02d`, `CASE-INT-037-02e`, `CASE-INT-037-02f`, `CASE-INT-037-02g`, `CASE-INT-037-02h`, `CASE-INT-037-02i`, `CASE-INT-037-02j`, `CASE-INT-037-03`, `CASE-INT-037-04a`, `CASE-INT-037-04b`, `CASE-INT-037-04c`, `CASE-INT-037-04d`, `CASE-INT-037-04e`, `CASE-INT-037-04f`, `CASE-INT-037-04g`, `CASE-INT-037-04h`, `CASE-INT-037-05a`, `CASE-INT-037-05b`, `CASE-INT-037-05c`, `CASE-INT-037-05d`, `CASE-INT-037-05e`, `CASE-INT-037-05f`, `CASE-INT-037-05g`, `CASE-INT-037-05h`, `CASE-INT-037-05i`, `CASE-INT-037-05j`, `CASE-INT-037-05k`, `CASE-INT-037-05l`, `CASE-INT-037-05m`, `CASE-INT-037-05n`, `CASE-INT-037-05o`, `CASE-INT-037-05p`, `CASE-INT-037-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-038-01` | `HELIXINTELLIGENCE-L2-038` source/revision/scope/owner | `CASE-INT-038-01`, `CASE-INT-038-02a`, `CASE-INT-038-02b`, `CASE-INT-038-02c`, `CASE-INT-038-02d`, `CASE-INT-038-02e`, `CASE-INT-038-02f`, `CASE-INT-038-02g`, `CASE-INT-038-02h`, `CASE-INT-038-02i`, `CASE-INT-038-02j`, `CASE-INT-038-02k`, `CASE-INT-038-02l`, `CASE-INT-038-03`, `CASE-INT-038-04a`, `CASE-INT-038-04b`, `CASE-INT-038-04c`, `CASE-INT-038-04d`, `CASE-INT-038-04e`, `CASE-INT-038-04f`, `CASE-INT-038-05a`, `CASE-INT-038-05b`, `CASE-INT-038-05c`, `CASE-INT-038-05d`, `CASE-INT-038-05e`, `CASE-INT-038-05f`, `CASE-INT-038-05g`, `CASE-INT-038-05h`, `CASE-INT-038-05i`, `CASE-INT-038-05j`, `CASE-INT-038-05k`, `CASE-INT-038-05l`, `CASE-INT-038-05m`, `CASE-INT-038-05n`, `CASE-INT-038-05o`, `CASE-INT-038-05p`, `CASE-INT-038-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-039-01` | `HELIXINTELLIGENCE-L2-039` source/revision/scope/owner | `CASE-INT-039-01`, `CASE-INT-039-02a`, `CASE-INT-039-02b`, `CASE-INT-039-02c`, `CASE-INT-039-02d`, `CASE-INT-039-02e`, `CASE-INT-039-02f`, `CASE-INT-039-02g`, `CASE-INT-039-02h`, `CASE-INT-039-02i`, `CASE-INT-039-03`, `CASE-INT-039-03a`, `CASE-INT-039-03b`, `CASE-INT-039-04a`, `CASE-INT-039-04b`, `CASE-INT-039-04c`, `CASE-INT-039-04d`, `CASE-INT-039-04e`, `CASE-INT-039-05a`, `CASE-INT-039-05b`, `CASE-INT-039-05c`, `CASE-INT-039-05d`, `CASE-INT-039-05e`, `CASE-INT-039-05f`, `CASE-INT-039-05g`, `CASE-INT-039-05h`, `CASE-INT-039-05i`, `CASE-INT-039-05j`, `CASE-INT-039-05k`, `CASE-INT-039-05l`, `CASE-INT-039-05m`, `CASE-INT-039-05n`, `CASE-INT-039-05o`, `CASE-INT-039-05p`, `CASE-INT-039-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-040-01` | `HELIXINTELLIGENCE-L2-040` source/revision/scope/owner | `CASE-INT-040-01`, `CASE-INT-040-01a`, `CASE-INT-040-01b`, `CASE-INT-040-01c`, `CASE-INT-040-01d`, `CASE-INT-040-01e`, `CASE-INT-040-02a`, `CASE-INT-040-02b`, `CASE-INT-040-02c`, `CASE-INT-040-02d`, `CASE-INT-040-02e`, `CASE-INT-040-02f`, `CASE-INT-040-02g`, `CASE-INT-040-02h`, `CASE-INT-040-02i`, `CASE-INT-040-02j`, `CASE-INT-040-02k`, `CASE-INT-040-02l`, `CASE-INT-040-03`, `CASE-INT-040-03a`, `CASE-INT-040-04a`, `CASE-INT-040-04b`, `CASE-INT-040-04c`, `CASE-INT-040-04d`, `CASE-INT-040-04e`, `CASE-INT-040-04f`, `CASE-INT-040-04g`, `CASE-INT-040-05a`, `CASE-INT-040-05b`, `CASE-INT-040-05c`, `CASE-INT-040-05d`, `CASE-INT-040-05e`, `CASE-INT-040-05f`, `CASE-INT-040-05g`, `CASE-INT-040-05h`, `CASE-INT-040-05i`, `CASE-INT-040-05j`, `CASE-INT-040-05k`, `CASE-INT-040-05l`, `CASE-INT-040-05m`, `CASE-INT-040-05n`, `CASE-INT-040-05o`, `CASE-INT-040-05p`, `CASE-INT-040-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-041-01` | `HELIXINTELLIGENCE-L2-041` source/revision/scope/owner | `CASE-INT-041-01`, `CASE-INT-041-02a`, `CASE-INT-041-02b`, `CASE-INT-041-02c`, `CASE-INT-041-02d`, `CASE-INT-041-02e`, `CASE-INT-041-02f`, `CASE-INT-041-02g`, `CASE-INT-041-02h`, `CASE-INT-041-02i`, `CASE-INT-041-03`, `CASE-INT-041-03a`, `CASE-INT-041-03b`, `CASE-INT-041-04a`, `CASE-INT-041-04b`, `CASE-INT-041-04c`, `CASE-INT-041-04d`, `CASE-INT-041-04e`, `CASE-INT-041-05a`, `CASE-INT-041-05b`, `CASE-INT-041-05c`, `CASE-INT-041-05d`, `CASE-INT-041-05e`, `CASE-INT-041-05f`, `CASE-INT-041-05g`, `CASE-INT-041-05h`, `CASE-INT-041-05i`, `CASE-INT-041-05j`, `CASE-INT-041-05k`, `CASE-INT-041-05l`, `CASE-INT-041-05m`, `CASE-INT-041-05n`, `CASE-INT-041-05o`, `CASE-INT-041-05p`, `CASE-INT-041-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-044-01` | `HELIXINTELLIGENCE-L2-044` source/revision/scope/owner | `CASE-INT-044-01`, `CASE-INT-044-02a`, `CASE-INT-044-02b`, `CASE-INT-044-02c`, `CASE-INT-044-02d`, `CASE-INT-044-02e`, `CASE-INT-044-02f`, `CASE-INT-044-02g`, `CASE-INT-044-02h`, `CASE-INT-044-02i`, `CASE-INT-044-02j`, `CASE-INT-044-03`, `CASE-INT-044-04a`, `CASE-INT-044-04b`, `CASE-INT-044-04c`, `CASE-INT-044-04d`, `CASE-INT-044-04e`, `CASE-INT-044-04f`, `CASE-INT-044-04g`, `CASE-INT-044-04h`, `CASE-INT-044-05a`, `CASE-INT-044-05b`, `CASE-INT-044-05c`, `CASE-INT-044-05d`, `CASE-INT-044-05e`, `CASE-INT-044-05f`, `CASE-INT-044-05g`, `CASE-INT-044-05h`, `CASE-INT-044-05i`, `CASE-INT-044-05j`, `CASE-INT-044-05k`, `CASE-INT-044-05l`, `CASE-INT-044-05m`, `CASE-INT-044-05n`, `CASE-INT-044-05o`, `CASE-INT-044-05p`, `CASE-INT-044-05q`| 100% coverage候補・wrong bind 0候補を別判定 |
| `NFR-INT-045-01` | `HELIXINTELLIGENCE-L2-045` source/revision/scope/owner | `CASE-INT-045-01`, `CASE-INT-045-02b`, `CASE-INT-045-02c`, `CASE-INT-045-02d`, `CASE-INT-045-02e`, `CASE-INT-045-02f`, `CASE-INT-045-02g`, `CASE-INT-045-02h`, `CASE-INT-045-02i`, `CASE-INT-045-02j`, `CASE-INT-045-02k`, `CASE-INT-045-02l`, `CASE-INT-045-02m`, `CASE-INT-045-04b`, `CASE-INT-045-04c`, `CASE-INT-045-04d`, `CASE-INT-045-04e`, `CASE-INT-045-04f`, `CASE-INT-045-04g`, `CASE-INT-045-05a`, `CASE-INT-045-05b`, `CASE-INT-045-05c`, `CASE-INT-045-05d`, `CASE-INT-045-05e`, `CASE-INT-045-05f`, `CASE-INT-045-05g`, `CASE-INT-045-05h`, `CASE-INT-045-05i`, `CASE-INT-045-05j`, `CASE-INT-045-05k`, `CASE-INT-045-05l`, `CASE-INT-045-05m`, `CASE-INT-045-05n`, `CASE-INT-045-05o`, `CASE-INT-045-05p`, `CASE-INT-045-05q`| 100% coverage候補・wrong bind 0候補を別判定 |

NFR-INT-045-01の分母は対象Product Core identityが識別済みでrequired target fieldを持つfixtureに限る。target identity欠落（CASE-INT-045-02a）、target identity unknown（CASE-INT-045-04a）、および未見identityをunroutedに保つCASE-INT-045-03は分母外のnegative oracleとして別記録する。target identityが既知でownerだけ不明のCASE-INT-045-04b、およびtarget既知だがcandidateを経ず直接routeするCASE-INT-045-02kは分母に含める。この測定候補は本文に列挙された有限なparent conditionを照合する。latency/throughput/price/cost、任意sample minimum、OS/SLA条件は親にないため追加しない。CASE/NFR上の固定source pinは時点監査へ保存する。技術候補に根拠/比較/測定方法/境界を添え、値ごとのPO質問へしない。

review06追補の個別変異は017 revokedと034結果値の両方向反転/欠落の4件。04表のA/B列挙はfieldごとの別runであり、planned分母は行IDだけでなく選択fieldを含むrun単位で記録し、併発/索引/重複は算入しない。数値閾値を新設しない。

## Stage 3 — NFR候補の検証範囲

NFRを独立に導出しない親はfunctional ACだけで評価する。候補測定は根拠・比較方法・母集団を示し、未実測と欠測を成功値へ変換しない。

| CASE / NFR | 対象・分類 | 入力母集団 | 照合するoracle | 不合格条件 / 限界 |
|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-NFR-001-01` | `NFR-INTELLIGENCE-001-01` (独立NFRを追加しない機能境界分類) | 二つのdomain lifecycleを編成するfixtureで各identityと関係を機能AC-001-01/-02/-03で照合。 | `AC-INTELLIGENCE-L3-001-01`と照合する: relationship/identity正確性が機能受入であり処理時間や全domain網羅率の合否値ではない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-002-01` | `NFR-INTELLIGENCE-002-01` (独立NFRを追加しない機能境界分類) | Domain A/B/Cに異なる能力集合を与え、AC-002-01/-02/-03の設定集合・unknown出力を記録。 | `AC-INTELLIGENCE-L3-002-01`と照合する: 未構成保持をfunctional oracleで確認。全能力default率などは新設しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-003-01` | `NFR-INTELLIGENCE-003-01` (独立NFRを追加しない機能境界分類) | target/L2 revision/ticket/dependency/evidence/provider/cost sourceをfixtureでjoinし、stale/missing/contradictory relationを計測。 | `AC-INTELLIGENCE-L3-003-01`と照合する: 一致sourceのfield trace率はfixture母数とともに参考観測、SLA/完全性thresholdへ昇格しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-004-01` | `NFR-INTELLIGENCE-004-01` (独立NFRを追加しない機能境界分類) | 4種類を含むsource-backed recordとlabel mutationを入力し、各分類/根拠の保持と誤昇格件数を機能ACで測る。 | `AC-INTELLIGENCE-L3-004-01`と照合する: semantic mutationの検出がoracle。accuracy母集団/正解ラベル定義が親にないため独立精度thresholdを作らない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-005-01` | `NFR-INTELLIGENCE-005-01` (独立NFRを追加しない機能境界分類) | approved target、prerequisite graph、parallelizable pair、expected result/risk/stop/fallback fixtureを与え、AC-005のcandidate fieldとticket不在を観測。 | `AC-INTELLIGENCE-L3-005-01`と照合する: 順序/依存の意味をfunctional ACで確認し、planner latencyや完了時間を追加しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-006-01` | `NFR-INTELLIGENCE-006-01` (独立NFRを追加しない機能境界分類) | prediction/evidence/assumption/falsificationを入力し、actual outcomeなし/別LABO recordありの状態を比較。 | `AC-INTELLIGENCE-L3-006-01`と照合する: 誤ってactualに昇格しないことをAC-006で照合。accuracy thresholdは正解母集団/期間が未規定のため置かない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-007-01` | `NFR-INTELLIGENCE-007-01` (独立NFRを追加しない機能境界分類) | active episodeの複数log・矛盾counterevidence・repairなし/ありを入力し、probable/unknownと責務区分を観測。 | `AC-INTELLIGENCE-L3-007-01`と照合する: episode内の意味境界が対象で、longitudinal data retention/precision rateは独立条件にしない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-008-01` | `NFR-INTELLIGENCE-008-01` (独立NFRを追加しない機能境界分類) | 同じfindingをmatching/mismatched HEAD, scope, reproduction, counterexampleで入力し、finding bindingとauthority non-changeを照合。 | `AC-INTELLIGENCE-L3-008-01`と照合する: merge/acceptance/requirement authority不変をAC-008で確認。review timing targetなし。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-009-01` | `NFR-INTELLIGENCE-009-01` (独立NFRを追加しない機能境界分類) | 監査finding source edgesを完全/欠落/異版fixtureで比較し、該当edgeのみunknownになるか測る。 | `AC-INTELLIGENCE-L3-009-01`と照合する: AAFD/UIL/TER closure率や全体完了thresholdは導入しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-011-01` | `NFR-INTELLIGENCE-011-01` (根拠付き機能/NFR測定候補（閾値未承認）) | task snapshot/scoring version/run protocol/hardware class/独立oracle/cache/人介入/price basis/currency/effective timestamp/charging classを個別記録し、共通corpus/responsibility scope/評価条件revisionのcurrent/candidate model-provider runを入力する。各run receiptの実行版とfindings/FP/miss/reproducibility/latency/costの値・単位・分母または測定条件を記録し、費用にはpricing source/currency/effective timestamp/charging classを結ぶ。各出力値はsource receiptの期待値と照合し、FP/missの脱落、条件差、価格根拠の差や欠測を隠さない。corpus/scope/評価条件revision mismatch、実行版欠落、宣言実行版と結果版の不一致を別対照にする。候補間で実行版が異なる正常比較も含める。 | `AC-INTELLIGENCE-L3-011-01`, `AC-INTELLIGENCE-L3-011-02`, `AC-INTELLIGENCE-L3-011-04`と照合する: 共通条件が一致するpairのmetricは別々に比較しwinnerなし。findings/FP/miss/reproducibility/latency/costを個別に期待値一致または局所unknownとして記録し、単一指標でwinnerを決めない。候補間の実行版差は記録して比較可能、宣言版/結果版不一致だけ該当結果をunknownにする。分母・各実行版を記録し自動差替えなし。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-012-01` | `NFR-INTELLIGENCE-012-01` (独立NFRを追加しない機能境界分類) | known/probable/uncertain/unknown/contradictoryを混在fixtureで入力し、各labelと要求されるnext evidenceを照合。 | `AC-INTELLIGENCE-L3-012-01`と照合する: unknownをsafe/success/no-issueにしない意味条件をAC-012で確認。confidence score/accuracy thresholdなし。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-013-01` | `NFR-INTELLIGENCE-013-01` (独立NFRを追加しない機能境界分類) | input revisions/rules/BRAIN/evidence/model/version/data-use/rejected alternativeのtrace fixtureと各単独欠落例を観測。 | `AC-INTELLIGENCE-L3-013-01`と照合する: trace edge completenessはfunctional oracleの範囲。retention duration/full regeneration requirementを作らない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-014-01` | `NFR-INTELLIGENCE-014-01` (独立NFRを追加しない機能境界分類) | purpose/scope/input/output/action/stop/version manifestと別OS assignment状態を比較。manifest欠落時の戻し先も確認。 | `AC-INTELLIGENCE-L3-014-01`と照合する: 候補から実行/authorityが発生しないことをfunctional AC-014で照合。runtime SLOを追加しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-015-01` | `NFR-INTELLIGENCE-015-01` (根拠付き機能/NFR測定候補（閾値未承認）) | 独立failure episode identity/reproduction/detection evidence、同一episode重複、別scopeを記録する。candidate/actual区分を新たなL2-015条件に加えない。 | `AC-INTELLIGENCE-L3-015-01`, `AC-INTELLIGENCE-L3-015-02`, `AC-INTELLIGENCE-L3-015-03`, `AC-INTELLIGENCE-L3-015-04`と照合する: candidateで停止し昇格しないこと、固定L2の「複数独立episode」意味、false-positive/miss/reproducibilityを同scopeで測る。回数thresholdなし。 | 分母不明はunknown。NFR独立合否値/数値閾値は導出しない。 |
| `CASE-INTELLIGENCE-L10-NFR-016-01` | `NFR-INTELLIGENCE-016-01` (根拠付き機能/NFR測定候補（閾値未承認）) | repair candidate fixtureとactual-result fixtureを分離する。candidate分母は親固定9束縛（target revision/actor/write-set/side-effect/budget/deadline/retry/impact/recovery）のみで構成する。actual-result fixtureは宣言target・実actual・source revisionを分け、post-check/stopはcandidateの必須field/分母へ加えない。 | `AC-INTELLIGENCE-L3-016-01`, `AC-INTELLIGENCE-L3-016-02`と照合し、candidate/actualを混同せず、逸脱/超過をsuccessにしない。親にないbudget額は生成しない。 | 分母・親scope不明はunknown。NFR独立threshold/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-018-01` | `NFR-INTELLIGENCE-018-01` (独立NFRを追加しない機能境界分類) | 同一scopeのcurrent proposalと複数時点LABO record、過去値current上書きmutationを与え、labels/owner handoffを記録。 | `AC-INTELLIGENCE-L3-018-01`と照合する: 時系列の意味分離をAC-018で確認。効果率、保存期間、自己改善性能は追加しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-019-01` | `NFR-INTELLIGENCE-019-01` (独立NFRを追加しない機能境界分類) | Pattern/Unit/Part/required inputs/conditions/evidence/versionを一致/不一致fixtureで比較しBRAIN writeback不在を観測。 | `AC-INTELLIGENCE-L3-019-01`と照合する: candidateのsource traceとunknownをAC-019で照合。適用精度thresholdや順位を規定しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-020-01` | `NFR-INTELLIGENCE-020-01` (独立NFRを追加しない機能境界分類) | Product Core identity/revision/meaning claim/backflow/ownerを一致/異版/owner欠落fixtureで照合。 | `AC-INTELLIGENCE-L3-020-01`と照合する: proposal routingと正本変更ownerをAC-020で確認。解決時間/close率は追加しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-067-01` | `NFR-INTELLIGENCE-067-01` (根拠付き機能/NFR測定候補（閾値未承認）) | already-decided quality/order source, applicability scope, source revision, LABO evidenceを既存L2-010 proposal inputへ投入。proposalの採用候補/除外理由、effort条件、quality/cost/completion-time/human-intervention evidenceをsource receiptと照合し、effort/completion-timeの欠落と値不一致を別々に記録する。対照はunresolved value, scope mismatch, evidence missing。 | `AC-INTELLIGENCE-L3-067-01`, `AC-INTELLIGENCE-L3-067-02`, `AC-INTELLIGENCE-L3-067-03`, `AC-INTELLIGENCE-L3-067-04`と照合する: source/condition別receiptの期待値一致、比較可能性、no-Harness区別、不明oracle戻しを観測する。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-072-01` | `NFR-INTELLIGENCE-072-01` (根拠付き機能/NFR測定候補（閾値未承認）) | PO固定`MPR-RC-HELIXINTELLIGENCE-L2-072-004`登録の4 pinsと`MPR-RC-HELIXINTELLIGENCE-L2-072-005`登録の追加2 raw spansを別tupleで照合し、scope・requirement・template・skill・model catalog・allowlist各々でselected identity/revision/digest、nonselected、selection-unknownのCASEを分け、6-part raw pin missing/bytes mismatch、evidence reuse/新実験非必須、optional BRAIN compatibility、023 closureを測る。packの判断目的、観点、反証質問、必要evidence、severity、escalation/停止条件、model適性、applicability、versionの期待値一致とmodel適性unknownも測る。candidateあり/なしの同一caseでfalse-positive/false-negative/unknown/反例、rollback先・条件・evidence、shadow/review receipt未取得の状態を記録する。 | `AC-INTELLIGENCE-L3-072-01`, `AC-INTELLIGENCE-L3-072-02`, `AC-INTELLIGENCE-L3-072-03`, `AC-INTELLIGENCE-L3-072-04`, `AC-INTELLIGENCE-L3-072-05`, `AC-INTELLIGENCE-L3-072-06`, `AC-INTELLIGENCE-L3-072-07`, `AC-INTELLIGENCE-L3-072-08`, `AC-INTELLIGENCE-L3-072-09`, `AC-INTELLIGENCE-L3-072-10`, `AC-INTELLIGENCE-L3-072-11`, `AC-INTELLIGENCE-L3-072-12`と照合する: 6 source種別のselected facetだけstale、source edge/競合の保持、期待値一致、同条件比較、receipt後続義務、active/gate/dispatch/tool/assignment/OS/SECURITY authorityの非生成を観測する。 | 親に閾値・性能SLO・shadow件数はないため独立合否値を導出しない。機能case結果を測定記録とし、根拠なしのthresholdやauthorityへ昇格しない。 |
| `CASE-INTELLIGENCE-L10-NFR-073-01` | `NFR-INTELLIGENCE-073-01` (独立NFRを追加しない機能境界分類) | finding text・既存detector結果・根拠source revisionをpositive/unknownで入力しcandidate resultとIssue/Requirement/CI/merge object不生成を確認。 | `AC-INTELLIGENCE-L3-073-01`, `AC-INTELLIGENCE-L3-073-02`, `AC-INTELLIGENCE-L3-073-03`と照合する: detector非置換/source traceをAC-073で照合。精度閾値やauto-projectionを追加しない。 | NFRの独立合否値は導出しない項目では機能ACだけを判定する。親範囲や測定分母が不明な値はunknownで保持し、数値閾値/authorityを作らない。 |
| `CASE-INTELLIGENCE-L10-NFR-078-01` | `NFR-INTELLIGENCE-078-01`（独立閾値を導出しない） | 11 dimensionそれぞれのnormalとmissing/unknown/stale/mismatch 55個別fixture。R-06 delta fieldと023 closure fieldのmissing/unknown/stale、R-07〜R-12単独条件、同一closure再現、未見normalと別の局所unknown fixtureを数える。PO限定Aの下で配置条件3項目とformal producer/consumer/owner/Issue route/#1037現行相当の5値をunknownに保ち、計8値それぞれの単独誤補完negativeを含める。 | 各dimension55 CASE、delta meaning-field CASE、effective-closure field CASE、R-07..R-12 CASEと8 role/placement-field negativeを別々のsource-bound functional oracle (`AC-INTELLIGENCE-L3-078-01`, `AC-INTELLIGENCE-L3-078-02`, `AC-INTELLIGENCE-L3-078-03`, `AC-INTELLIGENCE-L3-078-04`, `AC-INTELLIGENCE-L3-078-05`, `AC-INTELLIGENCE-L3-078-06`, `AC-INTELLIGENCE-L3-078-07`, `AC-INTELLIGENCE-L3-078-08`, `AC-INTELLIGENCE-L3-078-09`, `AC-INTELLIGENCE-L3-078-10`, `AC-INTELLIGENCE-L3-078-11`, `AC-INTELLIGENCE-L3-078-12`)へ照合し、各family/fieldの母数・成立/失敗/unknown/stale/mismatch/未評価を記録する。closureとdelta digestを相殺せず、分母0は割合なし。 | 母集団0は率なし、実測自体なしだけ未実測。性能threshold・最低N・SLA・新schemaを追加しない。 |

review06の母集団追補：018の自己採択単独とLABO評価単独を別CASEとして数える。078では代行主張による4 field省略、read/qualification失敗からの別source切替2件、読取不能receiptの3代用を各別CASEとして既存078 familyのplanned fixture母集団へ加え、索引や併発caseと重複計上しない。source-bound oracleと戻し先を個別照合し、未実測を0へ変えない。

review08の機能測定追補：005未充足prerequisite1、016同scope未見結果正常1、067評価packetのscope/revision欠落2、072比較正常/閾値創作/case追加3、2.0外部知識必須化1、未見適用外工程/failure mode2、authority/risk/failure mode不一致3を各個別fixtureとして記録する。計13件は既存familyへ追加するplanned機能観測で、性能閾値・数値budget・authorityを追加しない。
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

selected internal/external sourceを別populationで集計し、CASE-INT-077-03a–03mの各unknown/non-write/owner returnとqualified binding/unknown fieldを報告する。03a/b/c/d/e/h/i/j/k/l/mはCASE-INT-077-05a/05o/05r/05e/05f/05g/05h/05i/05b/05c/05dへの完全ID索引、03fは旧複合集約索引であり独立fixture件数へ含めない。03gだけを03群の独立fixtureとして数える。unknown consumer/owner populationを補完しない。

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
| `CASE-NFR-INT-060-02` | `CASE-INT-060-05e`–`CASE-INT-060-05i` | 05e–hの独立negativeと05i正常fallbackを区別し、source-bound returnを記録。 |
| `CASE-NFR-INT-061-02` | `CASE-INT-061-05a`–`CASE-INT-061-05f` | compatibility/task scope/OS割当/identity/revisionの別facet。 |
| `CASE-NFR-INT-062-02` | `CASE-INT-062-04a`, `CASE-INT-062-04d`, `CASE-INT-062-04e`, `CASE-INT-062-04f`, `CASE-INT-062-04h`, `CASE-INT-062-04i` | 6独立stage fixture。04b/04c/04gは05a/02d/02gへの索引。 |
| `CASE-NFR-INT-063-02` | `CASE-INT-063-04a`–`CASE-INT-063-04h` | LABO/BRAIN/OSの固定返却先、episode・時点を計上する。このfixture群にないHARNESS process contract returnを追加しない。 |
| `CASE-NFR-INT-069-02` | `CASE-INT-069-06a`–`CASE-INT-069-06u`, `CASE-INT-069-07a`–`CASE-INT-069-07f` | L2-010/011採択pack contractは常時照合し、011 call固有inputのみ利用operation別に数え、通常oracle/後段receiptなしの正常を保持。 |
| `CASE-NFR-INT-070-02` | `CASE-INT-070-07a`–`CASE-INT-070-07l`, `CASE-INT-070-08b`–`CASE-INT-070-08e` | 16 unique 07/08 fixtureをこの母集団で測る。09/06/10群はCASE-NFR-INT-070-03で別stageとして測り、重複計上しない。08aは05c index。 |
| `CASE-NFR-INT-071-02` | `CASE-INT-071-04a`–`CASE-INT-071-04j`, `CASE-INT-071-02h` | 3固定正常scenario、7独立negative（04d–04j）、および02h scope mismatchをこの測定だけで別集計する。 |
| `CASE-NFR-INT-074-02` | `CASE-INT-074-04a`–`CASE-INT-074-04c`; `CASE-INT-074-05a`–`CASE-INT-074-05aa` | 独立unknown facet 3件と24 unique 05-series fixturesを別母集団で数える。05f/05l/05yはCASE-INT-074-02a/02b/05jへのindex、05w/xは正常例としてnegative分母外。 |
| `CASE-NFR-INT-077-02` | `CASE-INT-077-05a`–`CASE-INT-077-05z`, `CASE-INT-077-03g` | 05a–zの各区分と03g unknown consumer/routeを別に報告し、03a/b/c/d/e/f/h/i/j/k/l/mの索引は重複計上しない。 |

全行は測定設計であり、測定結果・合格率・最低fixture数を生成しない。未実施fixtureは成功件数に含めない。


## Stage 5 review01補正 CASE-to-NFR trace

| NFR trace | FV fixture population | 測定単位・区別 |
|---|---|---|
| `CASE-NFR-INT-060-03` | `CASE-INT-060-06a`, `CASE-INT-060-06b`, `CASE-INT-060-06c`, `CASE-INT-060-06d`, `CASE-INT-060-06f`, `CASE-INT-060-06g`, `CASE-INT-060-06i`, `CASE-INT-060-06j`, `CASE-INT-060-06l` | 明示9独立runと影響node/owner returnを集計。06e/06h/06kは索引のみ。 |
| `CASE-NFR-INT-061-03` | `CASE-INT-061-06a`–`CASE-INT-061-06c` | task identity、実績source、実績revisionを各1変異で計上する。 |
| `CASE-NFR-INT-062-03` | `CASE-INT-062-05a`–`CASE-INT-062-05e` | candidate欠落、regression、write-set、obligation変更、obligation staleを分離する。 |
| `CASE-NFR-INT-063-03` | `CASE-INT-063-05a`–`CASE-INT-063-05d` | current judgment/contractのmissing/staleを別fixtureで計上する。除外CASE-063-02dは分母に入れない。 |
| `CASE-NFR-INT-069-03` | `CASE-INT-069-08a`–`CASE-INT-069-08o`, `CASE-INT-069-04h`–`CASE-INT-069-04i` | model入力15fieldとexplanation/ceiling 2条件を別populationで数え、通常scenarioの不足値は計算不能/部分unknownに保つ。 |
| `CASE-NFR-INT-070-03` | `CASE-INT-070-09a`–`CASE-INT-070-09g`, `CASE-INT-070-06a`–`CASE-INT-070-06i`, `CASE-INT-070-10a`–`CASE-INT-070-10c` | stage receipt、scenario/product identity、誤予測、out-of-order/stale receiptを別に計上する。段階順は033→069→040→LABO-024。 |
| `CASE-NFR-INT-071-03` | `CASE-INT-071-05a`–`CASE-INT-071-05e`, `CASE-INT-071-05g`, `CASE-INT-071-05i`–`CASE-INT-071-05r` | 05f/05hは04f/04gへの完全ID indexで独立分母外。oracle適用条件、未決threshold、後段順序、比例仮定、HARNESS-L2-010/011常時pack contractと適用時023 classを別に評価する。retry/recoveryはAC-071-04の04f/04gで数え、この母集団へ重ねない。rollback生成05eは本母集団に含む。 |
| `CASE-NFR-INT-074-03` | `CASE-INT-074-06a`–`CASE-INT-074-06h` | feedback入力fieldの欠落/stale/unknown状態を別々に記録し、LABO評価状態を未評価のまま保ち、未定義のapplicability ownerを作らない。 |
| `CASE-NFR-INT-077-03` | `CASE-INT-077-06a`–`CASE-INT-077-06g` | 06a–d/06gの5独立facetを計上する。索引06e/fは05w/vのunique数へ重ねない。 |

上記はCASE-to-NFR参照集合であり、既存群と重なるIDは一度だけ計上する。review01当時の記録は独立補正表78行と既存表への追記20行の合計は98行である。旧review01 correctionの97は当時のunique CASE ID実測差789→886の純増であり、Root時点98行とは別時点・別尺度である。Root最終検収の139は補完fixture censusであり、全CASE定義数でも同範囲の差分件数でもない。索引・CASE参照出現数やNFR行数をfixture数に含めない。母集団の適用可否、個別fixture、unique CASE IDは別々に照合する。分母0は算出値なしとし、missing/unknown/staleを成功または未観測へ混ぜない。実行・実測・L3承認は未成立である。
