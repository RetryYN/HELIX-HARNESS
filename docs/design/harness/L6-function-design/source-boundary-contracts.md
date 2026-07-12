---
layer: L6
sub_doc: function-spec
status: draft
pair_artifact: docs/test-design/harness/L8-source-boundary-contracts.md
plan: docs/plans/PLAN-L6-79-source-boundary-contracts.md
---

# source boundary contracts 機能設計

## 1. 公開contract

- `buildVisualizationTree(view: VisualizationContract): GenericTree`
- `decorateVscodeTree(tree: GenericTree, commands: CommandCatalog): VscodeTree`
- `projectVisualizationEvidence(view: VisualizationContract, summary: TreeSummary): ProjectionRows`
- `analyzeSnapshot<T>(snapshot: T, rules: AnalyzerRules<T>): Finding[]`
- `runProbe(intent: ProbeIntent, port: ProbePort): ProbeReceipt`
- `materializeLintArtifact(intent: MaterializeIntent, port: WritePort): MaterializeReceipt`
- `evaluateSourceBoundary(edge: SourceEdge, policy: BoundaryPolicy): BoundaryDecision`
- `validateBoundaryPolicyCoverage(modules: string[], policy: BoundaryPolicy): PolicyFinding[]`

## 2. DbC

| contract | pre | post | invariant |
|---|---|---|---|
| tree build | validated DTO | deterministic generic tree | VS Code symbol/import 0 |
| decoration | generic tree + catalog | adapter tree | state-db import 0 |
| evidence projection | view + verified summary | rows | presentation builder import 0 |
| analyzer | immutable snapshot | findings | write/process callback 0 |
| probe/materialize | typed intent + explicit port | bounded receipt | timeout/nonzeroをsuccess化しない |
| boundary evaluate | normalized direct/type edge | allow/deny/unspecified | unspecified≠allow |
| policy coverage | canonical module set | missing/EMPTY/unknown findings | new moduleを黙認しない |

## 3. receipt

receiptはoperation ID、actor/tool/target/params、snapshot digest、started/completed time、timeout、exit、output digest、
result statusを持つ。raw credential、absolute personal path、unbounded stdout/stderrを含めない。write receiptはchanged pathと
before/after digestを持ち、probe receiptは実行binary/versionを持つ。

## 4. L7 successor

- `PLAN-L7-450-state-db-vscode-decoupling`
- `PLAN-L7-451-lint-effect-port-separation`
- `PLAN-L7-452-source-boundary-policy-ratchet`

実装順は450→451→452。452は`PLAN-L7-428` W2 edge extractorをdependencyにし、独自parserを作らない。
