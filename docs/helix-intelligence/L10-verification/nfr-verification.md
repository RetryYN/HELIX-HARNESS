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
