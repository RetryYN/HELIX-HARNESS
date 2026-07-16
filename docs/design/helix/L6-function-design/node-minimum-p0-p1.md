---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/helix/L8-node-minimum-p0-p1-contracts.md
plan: docs/plans/PLAN-L7-458-node-minimum-p0-p1.md
---

# Node Minimum P0–P1限定機能設計

`node-runtime-cutover.md`のうち、active authorityを変更しないP0–P1境界だけを所有する。Node 24.15、npm ci、
ESM source/build、`node:sqlite`をLinux-primary環境で検証し、receiptは常に`terminal=false`とする。

このsliceはBun cutover、activation、配布切替、rollback、terminal commitを実行しない。公開API、failure code、
DbCは親設計`node-runtime-cutover.md`の`U-NCUT-006..011`を変更せず再利用し、IT-NCUT-001..005で結合する。
