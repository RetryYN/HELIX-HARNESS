---
title: "worker blind benchmark L9システムテスト設計"
layer: L9
executed_at_layer: L4
artifact_type: test_design
sub_doc: system-test-design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L4-67-worker-blind-benchmark.md
pair_artifact: docs/design/helix/L4-basic-design/worker-blind-benchmark.md
github_issue_id: 225
behavior_contract_id: WCC-FR-07
responsibility_owner: worker-blind-benchmark
---

# worker blind benchmark L9システムテスト設計

| HST-ID | scenario | expected |
|---|---|---|
| HST-WBB-001 | broker由来の異なるprovenance 2候補をsealed judge outputで比較 | identity blindのscore/cost/ranking receipt |
| HST-WBB-002 | smoke-only結果をfull selectionへ投入 | typed failure、selection 0 |
| HST-WBB-003 | author claim/private contextをdefinitionへ混入 | definition freeze拒否 |
| HST-WBB-004 | raw/copy output、copy observation、fixture/task/risk drift、同一provenance、別packet用judge outputを投入 | typed failure、selection 0 |

FR-08の重大failure dispositionは本pairの合格条件へ混載しない。
