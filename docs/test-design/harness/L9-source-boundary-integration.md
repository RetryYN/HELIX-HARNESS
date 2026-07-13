---
layer: L9
sub_doc: integration-test-design
status: draft
pair_artifact: docs/design/harness/L5-detailed-design/source-boundary-architecture.md
plan: docs/plans/PLAN-L5-79-source-boundary-architecture.md
---

# source boundary architecture 結合テスト設計

| oracle | scenario | 期待結果 |
|---|---|---|
| IT-SBOUND-001 | VS Code moduleをload不能にしてDB rebuild/headless doctor実行 | green、presentation import 0。`tests/slow/source-boundary-headless.test.ts` |
| IT-SBOUND-002 | fake contract DTOだけでVS Code adapter起動 | harness.db不要。`tests/visualization-treeview.test.ts` |
| IT-SBOUND-003 | lint full read-only routeをinstrument | write set 0、child process 0 |
| IT-SBOUND-004 | explicit argvのprobe command | child process 1回、bounded receipt、shell authority 0。`tests/lint-probe-adapter.test.ts` |
| IT-SBOUND-005 | 実repoのimport graph | forbidden 0、unspecified 0、全live edgeにtotal decision。`tests/source-boundary-integration.test.ts` |
| IT-SBOUND-006 | module directionを1 edgeずつ除去するmutation | 全explicit directionがdefault denyへ戻る。`tests/source-boundary-integration.test.ts` |
| IT-SBOUND-007 | idempotency claim後からdispatch直前、またはprobe dispatch後にHEAD/worktree/inputを変異 | dispatch前driftはeffect 0のblocked receipt、dispatch後driftはacceptedにしないuncertain receipt。`tests/lint-effect-executor.test.ts` |
| IT-SBOUND-008 | materializeを各durability境界で停止 | partial targetをacceptedにしない |

headless oracleはmodule cacheによる偽greenを避けるためfresh child processで実行する。effect oracleはFS/process portを
instrumentし、静的callsite数を実行回数の代用にしない。
