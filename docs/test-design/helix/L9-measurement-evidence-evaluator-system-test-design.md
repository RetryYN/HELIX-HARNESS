---
layer: L9
sub_doc: system-test-design
status: draft
parent_design: docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md
pair_artifact: docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md
---

# measurement evidence evaluator L9 system test設計

## 1. system境界

受理済みNFR declaration、immutable observation、trusted evaluation timeをproduction evaluatorへ渡し、
独立status、stable findings、最終verdictがcompletion consumerへ同じ意味で届く境界を対象とする。
probe process、retry、scheduler、DB／metric history writeは#221のsystem boundaryに残す。

## 2. system oracle一覧

### IT-MEVAL-001 — currentで代表的なadmitted observationだけgreen

declarationのNFR ID、registry revision、metric／unit、workload、environment、sampling、windowが一致し、
observation identityが#221でcurrent HEAD／datasetへadmitされた前提で、age、sample count、ratio、threshold、
baseline、hard limitを全て満たすfixtureだけが次を返す。

`binding=match`、`freshness=current`、`representativeness=representative`、`threshold=pass`、
`baseline=usable`、`hard_limit=pass`、`verdict=green`、finding 0。

### IT-MEVAL-002 — binding driftをgreenへ縮退しない

NFR ID、revision、metric、unit、workload、environment、sampling、windowを一つずつ変えるtable fixtureで、
各caseが`binding=mismatch`、`verdict=red`、対応findingを返すことを確認する。欠落／不正値はinput admissionで
拒否し、current declarationから推測補完しない。data digest／HEAD／evidence digestはdeclaration bindingへ
含めず、#221のobservation admissionとbaseline比較で反証する。

### IT-MEVAL-003 — freshness／representativeness境界とunknown propagation

| case | expected |
|---|---|
| ageがmax age未満／同値／1秒超過 | `current`／policyどおりの境界／`stale` |
| completed timeまたはtrusted time不正 | `freshness=unknown`、green禁止 |
| ratioがminimum未満／同値／超過 | `non_representative`／`representative`／`representative` |
| sample count不足、ratio欠落、NaN | `non_representative|unknown`、green禁止 |

trusted timeはtestから注入し、wall clockへ依存しない。

### IT-MEVAL-004 — comparator、baseline、hard limitのfalse-green防止

`lt/lte/eq/gte/gt/between`、inclusive/exclusive、比較方向、ゼロ／負値／小数境界をtable-drivenで反証する。
baseline unknown／異context、hard limit unknown／超過、NaN／Infinity、unit mismatchは`pass`にしない。
thresholdがpassでもhard limit failなら最終verdictはredとする。

### IT-MEVAL-005 — completion結線と手法非代替

completion consumerへ各独立statusとfindingを渡し、missing、stale、non-representative、threshold fail、
binding mismatch、hard limit failのどれか一つでもcompletionがfalseになることを確認する。
property／mutation等の実行記録だけをmeasurement evidenceとして渡してもgreenにならない。

## 3. 非機能測定の代表fixture

DB size、query p95/p99、lock wait、busy timeout縮退、rebuild、archive/vacuum、concurrency、soakを
同じinput/output contractで評価する代表fixtureを置く。metricごとの別verdict実装を作らず、
単位と比較方向だけをdeclarationから受ける。

## 4. failure分離

- invalid observationが別NFRのgreenで相殺されない。
- finding順序は入力列挙順やobject key順に依存しない。
- evaluatorはinput objectを変更せず、同一入力とtrusted timeへ同一結果を返す。
- error detailへcredential、PII、個人absolute path、raw evidence本文を出さない。
- cause未再現のfailureへ断定的root causeを付与しない。

## 5. pair trace対応

| L4 concern | L9 oracle |
|---|---|
| declaration／observation binding | `IT-MEVAL-001/002` |
| freshness／representativeness | `IT-MEVAL-003` |
| threshold／baseline／hard limitの判定 | `IT-MEVAL-004` |
| completion fail-close | `IT-MEVAL-005` |
| HR-NFR-REG-004共通測定面 | 代表fixture |
| HR-NFR-REG-006反証手法の非代替 | `IT-MEVAL-005` |
