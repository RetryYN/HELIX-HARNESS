---
title: "worker independent review L6/L7実装oracle設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L6-99-worker-independent-review.md
pair_artifact: docs/design/helix/L6-function-design/worker-independent-review.md
github_issue_id: 227
behavior_contract_id: WCC-FR-06
responsibility_owner: worker-independent-review
---

# worker independent review L6/L7実装oracle設計

`U-WRR-001..008`、`U-WIB-013`、`U-DRB-018`を実行し、broker-issued origin、sealed review、proposal digest join、三軸failure reachabilityを検証する。
文言一致、mock call count、provider名差だけでは合格としない。
