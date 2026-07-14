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

`rebuildHarnessDb`のようにownerを跨ぐcompositionは`src/composition/`だけに配置する。`runtime`へ混在させず、
composition owner以外のstate-db/vmodel/vscode間cross-owner edgeはpolicyでdenyする。

`adapters` は外部入力を正規化する外縁 owner とし、`lint` / `runtime` / `schema` / `vmodel` への read-only 依存だけを許可する。`cli` と `doctor` は adapter を composition してよいが、adapter は CLI / doctor を逆参照しない。

## 2. DbC

analyzerからwrite/child-process authorityへ直接到達できないことを全contractの共通不変条件とする。

| 関数 / シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|
| `buildVisualizationTree(view: VisualizationContract) => GenericTree` | 検証済みDTO | deterministicなgeneric tree | VS Code symbol/import 0 | U-SBOUND-005 |
| `decorateVscodeTree(tree: GenericTree, commands: CommandCatalog) => VscodeTree` | generic tree + catalog | adapter用tree | state-db import 0 | U-SBOUND-002 |
| `projectVisualizationEvidence(view: VisualizationContract, summary: TreeSummary) => ProjectionRows` | view + 検証済みsummary | rows | presentation builder import 0 | U-SBOUND-001 |
| `analyzeSnapshot<T>(snapshot: T, rules: AnalyzerRules<T>) => Finding[]` | immutable snapshot | finding一覧 | write/process callback 0 | U-SBOUND-004 |
| `runProbe(intent: ProbeIntent, port: ProbePort) => ProbeReceipt` | typed intent + explicit argv port | bounded receipt | shell/cwd/envをintentから受け取らず、timeout/nonzeroをsuccess化しない | U-SBOUND-006 / U-SBOUND-015 |
| `materializeLintArtifact(intent: MaterializeIntent, port: WritePort) => MaterializeReceipt` | typed intent + explicit port | durable receipt | partial targetをacceptedにしない | U-SBOUND-010 / U-SBOUND-016 |
| `extractSourceEdges(docs: SourceDocument[]) => SourceEdge[]` | immutable source docs | normalized edges | computed/nonliteralをunknownとして落とさない | U-SBOUND-008 |
| `evaluateSourceBoundary(edge: SourceEdge, policy: BoundaryPolicy) => BoundaryDecision` | 正規化済みdirect/type edge | allow/deny/unspecified | unspecified≠allow | U-SBOUND-003 |
| `validateBoundaryPolicyCoverage(catalog: ModuleCatalog, edges: SourceEdge[], policy: BoundaryPolicy) => PolicyFinding[]` | canonical catalog + live edges | default/exception total decision | missing pair/new moduleを黙認しない | U-SBOUND-007 |

## 3. receipt

receiptはoperation ID、actor/tool/target/params、snapshot digest、started/completed time、timeout、exit、output digest、
result statusを持つ。raw credential、absolute personal path、unbounded stdout/stderrを含めない。write receiptはchanged pathと
before/after digestを持ち、probe receiptは実行binaryと、同一probeで観測できた場合だけのversionを持つ。Node probe adapterは
shellを常に無効化し、固定注入したcwdと最小allowlist環境だけを用い、argvを一度だけspawnしてcapture時点でtimeout/output上限を
適用する。intentはcwd/env/shell authorityを持たない。

production read-only lint routeはCLI module loadを含め、write APIとchild-process authorityを暗黙に起動しない。必要な
probe/materializeだけが明示portを通じてeffectを持つ。

この運用不変条件は `U-SBOUND-014` とする。Node probe adapterの explicit argv 一回起動、shell無効、timeout/output
上限は `U-SBOUND-015`、artifact write port の temp write/fsync/rename/directory fsync/verify 境界での非accept は
`U-SBOUND-016` とする。これらは L9 の実 child / durability scenario と同じ実行経路を使うが、L6/L8 Vペアでは
それぞれの専用 behavior test を唯一の citation とする。

intentはcapability ID、authorization receipt、current HEAD/worktree/inputs snapshot、idempotency key、expiryを必須にする。
materialize intentはcontentとそのdigestを同時に持ち、executorはport呼出し前に一致を検証する。contentは署名scopeへ束縛するが
receiptへは転記しない。Node artifact write portはHELIXが排他所有するruntime evidence rootだけを受け取り、untrusted actorが
書込みまたはrenameできるfilesystemをsecurity sandboxとして受け入れない。before digest compare-and-publishは同一portを使う
cooperative writer間でtarget lockにより直列化し、非協調external writerを許すrootではfail-closeに利用しない。
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
