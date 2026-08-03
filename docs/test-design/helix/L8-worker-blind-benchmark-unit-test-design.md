---
title: "worker blind benchmark L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L5-93-worker-blind-benchmark.md
pair_artifact: docs/design/helix/L5-detail/worker-blind-benchmark.md
github_issue_id: 225
behavior_contract_id: WCC-FR-07
responsibility_owner: worker-blind-benchmark
---

# worker blind benchmark L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WBB-001 | definition | fixed exact set、weight合計100をseal | `tests/worker-blind-benchmark.test.ts` |
| U-WBB-002 | blind boundary | author/private/unknown、smoke-onlyを拒否 | `tests/worker-blind-benchmark.test.ts` |
| U-WBB-003 | packet | definitionを実行前にbrokerへ束縛し、worker/model/effortをpacketへ露出せずcount 0 | `tests/worker-isolation-broker.test.ts` |
| U-WBB-004 | 評価 | packetだけをtaskにしたjudge score、broker計測cost、opaque安定順位 | `tests/worker-isolation-broker.test.ts` |
| U-WBB-005 | negative | output/observation copy、fixture/task/risk drift、同一provenance、packet digest不一致を拒否 | `tests/worker-isolation-broker.test.ts` |
| U-DRB-021 | mutation | claim/smoke/seal/score分岐除去をRed | `tests/design-reality-binding.test.ts` |
