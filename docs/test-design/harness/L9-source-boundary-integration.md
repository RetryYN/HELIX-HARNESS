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
| IT-SBOUND-001 | VS Code moduleをload不能にしてDB rebuild/headless doctor実行 | green、presentation import 0 |
| IT-SBOUND-002 | fake contract DTOだけでVS Code adapter起動 | harness.db不要 |
| IT-SBOUND-003 | lint full read-only routeをinstrument | write set 0、child process 0 |
| IT-SBOUND-004 | explicit probe command | child process exactly 1、bounded receipt |
| IT-SBOUND-005 | real repo import graph | forbidden 0、unspecified 0、policy coverage 32/32 |
| IT-SBOUND-006 | module directionを1 edgeずつ反転するmutation | gate red |

headless oracleはmodule cacheによる偽greenを避けるためfresh child processで実行する。effect oracleはFS/process portを
instrumentし、静的callsite数を実行回数の代用にしない。
