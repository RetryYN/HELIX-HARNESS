# HELIX-INTELLIGENCE L3 NFR・技術候補（Stage 2a）

状態: PO L3承認前の起草候補。固定採択L2に数値thresholdがない箇所は、観測と比較を可能にする根拠付き技術候補を記録する。候補値・測定軸は採択値、実測結果、実行許可を意味しない。

旧HELIX NFR文書の「特性→計測→受入」の構造を起点に再導出する（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21-34,58-81`、LEGACY-ASSET-DB669724249A14A665F0）。旧IPA grade、数値、pass条件、CI/runtime、HARNESS KPI/料金モデルを現行NFRとして再利用しない。該当する数値sourceは採択L2/L11に見当たらないため、以下は候補の比較設計である。

## NFR-INT-010-01 — 配置proposal根拠の観測可能性

- 親: `HELIXINTELLIGENCE-L2-010`, version target `1.0`。FR: `FR-INT-010`。L2が明記する観測軸はsuccess/failure/rework/latency/cost/reliability。
- Candidate 1（推奨）: 固定task-class、scope、source/revisionで層別した全適格観測cohortから分布（p50/p95候補）を算出する。source/revision/scopeとtask/model class evidenceを明示的に束縛でき、比較対象と根拠の追跡が最も直接的である。適格観測は全数集計し、件数・測定期間・欠損・未評価を併記する。
- Candidate 2: rolling windowを30日/90日で比較する案。30日は変化を早く反映する候補、90日は観測数を確保しやすい候補として並べるが、いずれも固定要件値ではない。task mixやrevisionが変わると比較可能性を失うため、source/revision/scopeの一致を検証できる場合に限り補助表示する。
- 採用候補比較の判定軸: fixed cohortとrolling 30日/90日を同じsource recordsで算出し、対象scope内のtask mix、revision drift、欠損・未評価割合、指標分布、実際の観測数がどう変わるかをL10で記録する。rolling候補は鮮度/件数とのtradeoffを示す補助比較とする。human interventionを費用から落とさず、scope/revisionに有効な既決quality/priority/tolerance判断は再利用する。観測数・測定期間は実在母集団から報告する。任意の最小Nやpass閾値は作らない。評価可能性が不足するtask classはunknown/未評価のままにし、選定されたWorkerをqualifiedと誤認しない。
- 比較母集団: 同一task-class・同一適用scopeでLABOが記録したWorker/Model観測。source、revision、scope、評価状態が異なる記録は別層にし、根拠に混ぜない。
- 集計候補の単位と分母: 全適格観測件数、success/failure/unknown等の状態別件数と欠測件数を併記する。成功・失敗の割合は結果が判定済みの同scope観測件数を分母とし、unknown・未判定は分母へ暗黙算入せず別件数にする。再作業割合は再作業有無を観測できた件数を分母、再作業ありの件数を分子とする。分母0は値なしと表示し、0%や成功へ変換しない。p50/p95は同じ単位で観測できたlatency・costに適用し、各指標の有効件数・単位と欠測を別記する。reliabilityは元の評価oracleが定める指標・単位・分母を表示し、定義が欠ける場合は未評価のままにする。状態名や真偽値へquantileを当てない。これらは表示・比較の技術候補であり、Worker適格性の閾値を作らない。
- 根拠: 固定L2-010:104,106とL11:163が列挙するtask attributes、observed performance、task/model class evidence、およびprice/name/benchmark-onlyを禁じるnegative。L11 G13:191–197の有効scope内判断の適用、理由/除外/不確実性/未評価、human intervention cost包含もCASEで照合するが、追加performance閾値にはしない。旧blind benchmarkのthresholdや旧sample countは採用しない。

## NFR-INT-066-01 — 人代行proposal receipt binding

- 親: `HELIXINTELLIGENCE-L2-066`, version target `1.0`。FR: `FR-INT-066`。
- Candidate 1（推奨）: 固定L2/L11が束縛する全field（推奨Worker、根拠、除外理由、不確実性、unknown/未評価、Worker identity/capability/version、ticket/task identity/scope、LABO evidence source/revision/scope、schema/contractおよびpack contract version、proposal origin、作成/受領actor/time）を個別presence/value照合し、欠落・不一致の件数をゼロ期待のoracleで測る。これは新しい信用閾値でなく、L2/L11が欠落時に受領しないと明記した契約の機械的照合である。
- Candidate 2: receipt end-to-end latencyをp50/p95で観測し、human/generated path別に同一の測定開始/終了点（入力確定からOS receipt記録まで）を比較する。固定L2/L11は期限・latency目標を規定していないため、分布を候補資料として報告し、任意の上限は置かない。
- 測定母集団: L10の全有効normal/negative fixtureと、別記した実観測がある場合は当該ticket/scope/contract versionの記録。異なるorigin、schema version、scopeはまとめず、fixture件数と実測件数を区別する。固定ケースfixtureは全数を検査し、無根拠の標本数・測定windowを設けない。
- 判定: binding欠落や不一致を受領済み/assignment可能にする変異は不合格。latency/cost分布だけから人案を評価済みにしたり、OS判断やauthorityを生成しない。
- 根拠: 固定L2-066:459-463、L11:134-138。旧receipt/SLA valuesは移さない。

## 境界

NFR候補の選択や運用値はPOへparameterごとの質問にせず、根拠比較と反証条件を対のL10へ記録する。要求の意味・scope・owner・versionを変えない技術上の調整は起草・独立reviewで進める。親条件の変更が必要なら該当L2/L1へ戻す。Bun、Web後続条件、非採択親、旧thresholdは対象外。
