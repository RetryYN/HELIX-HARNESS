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

| Function / Signature | pre | post | invariant | oracle |
|---|---|---|---|---|
| `buildVisualizationTree(view: VisualizationContract) => GenericTree` | 検証済みDTO | deterministicなgeneric tree | VS Code symbol/import 0 | U-SBOUND-005 |
| `decorateVscodeTree(tree: GenericTree, commands: CommandCatalog) => VscodeTree` | generic tree + catalog | adapter用tree | state-db import 0 | U-SBOUND-002 |
| `projectVisualizationEvidence(view: VisualizationContract, summary: TreeSummary) => ProjectionRows` | view + 検証済みsummary | rows | presentation builder import 0 | U-SBOUND-001 |
| `analyzeSnapshot<T>(snapshot: T, rules: AnalyzerRules<T>) => Finding[]` | immutable snapshot | finding一覧 | write/process callback 0 | U-SBOUND-004 |
| `runProbe(intent: ProbeIntent, port: ProbePort) => ProbeReceipt` | typed intent + explicit port | bounded receipt | timeout/nonzeroをsuccess化しない | U-SBOUND-006 |
| `materializeLintArtifact(intent: MaterializeIntent, port: WritePort) => MaterializeReceipt` | typed intent + explicit port | durable receipt | partial targetをacceptedにしない | U-SBOUND-010 |
| `extractSourceEdges(docs: SourceDocument[]) => SourceEdge[]` | immutable source docs | normalized edges | computed/nonliteralをunknownとして落とさない | U-SBOUND-008 |
| `evaluateSourceBoundary(edge: SourceEdge, policy: BoundaryPolicy) => BoundaryDecision` | 正規化済みdirect/type edge | allow/deny/unspecified | unspecified≠allow | U-SBOUND-003 |
| `validateBoundaryPolicyCoverage(catalog: ModuleCatalog, edges: SourceEdge[], policy: BoundaryPolicy) => PolicyFinding[]` | canonical catalog + live edges | default/exception total decision | missing pair/new moduleを黙認しない | U-SBOUND-007 |

## 3. receipt

receiptはoperation ID、actor/tool/target/params、snapshot digest、started/completed time、timeout、exit、output digest、
result statusを持つ。raw credential、absolute personal path、unbounded stdout/stderrを含めない。write receiptはchanged pathと
before/after digestを持ち、probe receiptは実行binary/versionを持つ。

intentはcapability ID、authorization receipt、current HEAD/worktree/inputs snapshot、idempotency key、expiryを必須にする。
authorization receiptはrepo設定でpinしたtrusted issuerの署名または同等の改ざん検証、actor/tool/target/paramsのexact scope、
revocation epochを検証する。self-issued/plain object、scope拡大、失効済みreceiptはeffect callback前に拒否する。
snapshot providerはpreflight、idempotency claim後のdispatch直前、dispatch直後に再観測する。dispatch前のdriftはeffect callback 0の
blocked receipt、dispatch後のdriftはacceptedにしないuncertain receiptとする。authority不一致、snapshot drift、期限切れ、重複idempotency key、port throw、partial write、timeout、nonzeroはsuccess receiptへ
変換せずblocked/uncertainとして返す。materializeはbefore digest CASとtemp/fsync/renameまたは同等のdurable portを要求し、
partial targetをacceptedにしない。read-only analyzerはintentやportを受け取らずeffect callbackを0回に固定する。

## 4. L7 successor

- `PLAN-L7-450-state-db-vscode-decoupling`
- `PLAN-L7-451-lint-effect-port-separation`
- `PLAN-L7-452-source-boundary-policy-ratchet`

実装順は450→451→452。452が`src/lint/source-edge-extractor.ts`を単一ownerとして実装し、`PLAN-L7-428` W2は
re-export/dynamic/literal require reachability要求のprovenanceとして`PLAN-L7-428-enforcement-wiring-gap`を参照する。
