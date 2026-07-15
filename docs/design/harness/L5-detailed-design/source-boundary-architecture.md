---
layer: L5
sub_doc: module-decomposition
status: draft
pair_artifact: docs/test-design/harness/L9-source-boundary-integration.md
plan: docs/plans/PLAN-L5-79-source-boundary-architecture.md
---

# source boundary architecture 詳細設計

## 1. 対象と実測根拠

- #11: `state-db/projection-writer.ts`が`vscode/tree-view-provider.ts`を参照し、後者が
  `state-db/visualization-view-model.ts`へ戻る2-node architecture cycle。
- #13: lint配下にrepo write、external process probe、git subprocessがanalyzerと同居する。
- #15: source boundary 32 module中29 moduleがEMPTYで、未設計方向を暗黙allowする。
- #14: `PLAN-L7-428-enforcement-wiring-gap` W2は要求provenanceとして参照するが、その実装はfunction reachabilityでありshared edge
  extractorではない。source-boundary用extractorは`PLAN-L7-452`が`src/lint/source-edge-extractor.ts`に単一実装する。

## 2. ownership

| owner | 所有するもの | 禁止するもの |
|---|---|---|
| state-db | persistence、projection、adapter-neutralなview data | vscode/cli/doctorのpresentation import |
| visualization-contract | 最小DTO、generic tree contract | I/O、command ID、extension API |
| visualization-projector | DTO→generic treeのpure変換 | VS Code decoration、DB write |
| vscode | generic tree→command/manifest decoration | state-db直接import、projection rebuild |
| lint analyzer | immutable input→finding | write、child process、環境probe |
| executor/materializer | typed intent→receipt | finding判定、silent retry |
| composition root | owner間の配線とlifecycle | domain contractの再定義 |

## 2.1 物理配置とsymbol移動

| 現symbol/owner | 新owner path | 接続root |
|---|---|---|
| `MetricRow` / `VisualizationViewModel` | `src/schema/visualization-contract.ts` | `src/cli.ts` / `src/vscode/extension-adapter.ts` |
| `TreeViewNode`のadapter-neutral部分 | `GenericTreeNode` in `src/schema/visualization-tree-contract.ts` | `src/vscode/extension-adapter.ts` |
| `buildVisualizationTreeView`のpure projection | `buildVisualizationTree` in `src/vmodel/visualization-tree-projector.ts` | `src/vscode/extension-adapter.ts` |
| VS Code command decoration | `src/vscode/tree-view-provider.ts` | `src/vscode/extension-adapter.ts` |
| projection用tree summary | `src/state-db/visualization-evidence.ts` | `src/state-db/projection-writer.ts` |

`schema`はI/Oを持たない最下位contract、`vmodel` projectorはschemaだけを参照する。`vscode`はschema/vmodelを参照できるが
state-db実装を参照しない。state-dbはschemaを参照できるがvscode/vmodel projectorを参照しない。composition rootは
`src/composition/`の専用ownerに置き、state-dbのview dataをprojectorとadapterへ渡す。`runtime`はcomposition rootではなく、
vmodel/vscodeへのcross-owner importを持たない。

## 3. 依存規則

依存はcontractへ向かう一方向とし、presentation→application→contract、persistence→contractを許可する。
persistence→presentation、analyzer→executor、adapter→persistence実装への直接edgeは禁止する。type-only importも
architecture ownershipを結合するため同じedgeとして扱う。

boundary policyは各source ownerにdefault `deny`を必須とし、許可方向だけをexplicit allowとして列挙する。これにより
catalog内の全directed pairはdefaultまたはexceptionのどちらかでtotal decisionされる。missing owner default、EMPTY、未知from、
未知toは`unspecified`としてfail-closeし、allow-allと同義にしない。type-only/re-export/dynamic import、static string literal
`require()`、TypeScript import-equalsも同じdirected edgeへ正規化する。computed/nonliteral requireは
`unknown_edge_kind`としてfail-closeする。移行中の例外はowner、rationale、expiry、successor PLANを必須にする。

## 4. effect実行権限

read snapshotはloader/portが一度構築しanalyzerへ渡す。write/process/git probeは明示commandだけがexecutorを呼び、
timeout、exit、stdout/stderr digest、provenance、snapshot bindingを持つreceiptを返す。doctor/lintのread-only routeは
既存receiptを消費し、暗黙にexternal processやrepo writeを開始しない。

## 5. 移行順序

1. contractとnegative oracleを先にfreezeする。
2. state-db⇄vscode cycleを解消する。
3. lint effect endpointsをexecutorへ隔離する。
4. EMPTY policyをlive edgeごとのallow/denyへratchetする。
5. `PLAN-L7-452`のshared extractorでdirect/type-only/re-export/dynamic edgeを同じpolicyへ流す。
