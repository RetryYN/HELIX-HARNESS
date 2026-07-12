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
- `extractSourceEdges(docs: SourceDocument[]): SourceEdge[]`
- `evaluateSourceBoundary(edge: SourceEdge, policy: BoundaryPolicy): BoundaryDecision`
- `validateBoundaryPolicyCoverage(catalog: ModuleCatalog, edges: SourceEdge[], policy: BoundaryPolicy): PolicyFinding[]`

## 2. DbC

analyzerからwrite/child-process authorityへ直接到達できないことを全contractの共通不変条件とする。

| contract | 事前条件 | 事後条件 | 不変条件 |
|---|---|---|---|
| tree build | 検証済みDTO | deterministicなgeneric tree | VS Code symbol/import 0 |
| decoration | generic tree + catalog | adapter用tree | state-db import 0 |
| evidence projection | view + 検証済みsummary | rows | presentation builder import 0 |
| analyzer | immutable snapshot | finding一覧 | write/process callback 0 |
| probe/materialize | typed intent + explicit port | bounded receipt | timeout/nonzeroをsuccess化しない |
| edge extract | immutable source docs | normalized direct/type/re-export/dynamic edges | syntax kindを欠落させない |
| boundary evaluate | 正規化済みdirect/type edge | allow/deny/unspecified | unspecified≠allow |
| policy coverage | canonical catalog + live edges | default/exception total decision | missing pair/new moduleを黙認しない |

## 3. receipt

receiptはoperation ID、actor/tool/target/params、snapshot digest、started/completed time、timeout、exit、output digest、
result statusを持つ。raw credential、absolute personal path、unbounded stdout/stderrを含めない。write receiptはchanged pathと
before/after digestを持ち、probe receiptは実行binary/versionを持つ。

intentはcapability ID、authorization receipt、current HEAD/worktree/inputs snapshot、idempotency key、expiryを必須にする。
authority不一致、snapshot drift、期限切れ、重複idempotency key、port throw、partial write、timeout、nonzeroはsuccess receiptへ
変換せずblocked/uncertainとして返す。materializeはbefore digest CASとtemp/fsync/renameまたは同等のdurable portを要求し、
partial targetをacceptedにしない。read-only analyzerはintentやportを受け取らずeffect callbackを0回に固定する。

## 4. L7 successor

- `PLAN-L7-450-state-db-vscode-decoupling`
- `PLAN-L7-451-lint-effect-port-separation`
- `PLAN-L7-452-source-boundary-policy-ratchet`

実装順は450→451→452。452が`src/lint/source-edge-extractor.ts`を単一ownerとして実装し、`PLAN-L7-428` W2は
re-export/dynamic reachability要求のprovenanceとして参照する。
