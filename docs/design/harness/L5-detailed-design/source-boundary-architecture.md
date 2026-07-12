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
- #14: edge extractor/re-export/dynamic importは`PLAN-L7-428` W2のauthorityとし、本設計でparserを複製しない。

## 2. ownership

| owner | 所有するもの | 禁止するもの |
|---|---|---|
| state-db | persistence、projection、adapter-neutral view data | vscode/cli/doctor presentation import |
| visualization-contract | 最小DTO、generic tree contract | I/O、command ID、extension API |
| visualization-projector | DTO→generic treeのpure変換 | VS Code decoration、DB write |
| vscode | generic tree→command/manifest decoration | state-db直接import、projection rebuild |
| lint analyzer | immutable input→finding | write、child process、環境probe |
| executor/materializer | typed intent→receipt | finding判定、silent retry |
| composition root | owner間の配線とlifecycle | domain contractの再定義 |

## 3. dependency rule

依存はcontractへ向かう一方向とし、presentation→application→contract、persistence→contractを許可する。
persistence→presentation、analyzer→executor、adapter→persistence実装への直接edgeは禁止する。type-only importも
architecture ownershipを結合するため同じedgeとして扱う。

boundary policyはmodule pairごとに`allow | deny`、owner、rationale、review triggerを持つ。missing、EMPTY、未知moduleは
`unspecified`としてfail-closeし、allow-allと同義にしない。移行中の例外は期限とsuccessor PLANを必須にする。

## 4. effect authority

read snapshotはloader/portが一度構築しanalyzerへ渡す。write/process/git probeは明示commandだけがexecutorを呼び、
timeout、exit、stdout/stderr digest、provenance、snapshot bindingを持つreceiptを返す。doctor/lintのread-only routeは
既存receiptを消費し、暗黙にexternal processやrepo writeを開始しない。

## 5. 移行順序

1. contractとnegative oracleを先にfreezeする。
2. state-db⇄vscode cycleを解消する。
3. lint effect endpointsをexecutorへ隔離する。
4. EMPTY policyをlive edgeごとのallow/denyへratchetする。
5. `PLAN-L7-428` W2 extractor完成後にdynamic/re-export edgeを同じpolicyへ流す。
