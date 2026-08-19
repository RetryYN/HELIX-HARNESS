---
title: "distribution deterministic archive単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-19
updated: 2026-08-19
owner: QA / TL
plan: docs/plans/PLAN-L7-603-distribution-deterministic-archive.md
pair_artifact: docs/design/helix/L6-function-design/pillar-function-design.md
---

# distribution deterministic archive単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTDET-001 | artifact reproducibility | 同一source HEAD・同一tagで2回packageしたtarball bytes、checksum、manifestのartifact digestが一致し、remote mutationが発生しない | `tests/cli-surface.test.ts` |

artifact digestだけを再計算してgreenにせず、archive本体、checksum、manifestの三者を同一testで比較する。
