---
layer: L8
sub_doc: integration-test-design
status: confirmed
pair_artifact: docs/design/helix/L6-function-design/node-minimum-p0-p1.md
plan: docs/plans/PLAN-L7-458-node-minimum-p0-p1.md
---

# Node Minimum P0–P1限定検証設計

この表はcutover全体15 unitのうち、active authorityを変更しないP0–P1だけを採点する。全結果は
`terminal=false`であり、Bun撤去・activation・配布切替の証拠にはしない。

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-NCUT-006 | Node runtime | floor/LTS/feature不一致を拒否 | `tests/node-runtime-cutover-toolchain.test.ts` |
| U-NCUT-007 | npm lock | lock drift、複数canonical lock、非frozen treeを拒否 | `tests/node-runtime-cutover-toolchain.test.ts` |
| U-NCUT-008 | source execution | extensionless解決不能、Bun loader混入でwrite 0 | `tests/node-runtime-cutover-toolchain.test.ts` |
| U-NCUT-009 | build plan | ESM/bin/target欠落、Bun build commandを拒否 | `tests/node-runtime-cutover-toolchain.test.ts` |
| U-NCUT-010 | artifact | digest/shebang/bin/source parity/Bun marker差を拒否 | `tests/node-runtime-cutover-toolchain.test.ts` |
| U-NCUT-011 | minimum gate | workflow欠落・stale入力を拒否し常にterminal false | `tests/node-runtime-cutover-gate.test.ts` |
| IT-NCUT-001 | clean install | BunなしPATHでnetwork/cache installとoffline reinstallを再現 | `tests/node-runtime-cutover-integration.test.ts` |
| IT-NCUT-002 | clean verification | Node runnerでtypecheck/lint/P0–P1 testを実行 | `tests/node-runtime-cutover-integration.test.ts` |
| IT-NCUT-003 | source CLI | Bun loaderなしでread-only CLIを実行 | `tests/cli-surface.test.ts` |
| IT-NCUT-004 | distribution | source/ESM/binのversion/schema/exitを比較 | `tests/distribution-acceptance.test.ts` |
| IT-NCUT-005 | state DB | Node `node:sqlite`でmigration/transaction/rebuildを検証 | `tests/state-db.test.ts` |
