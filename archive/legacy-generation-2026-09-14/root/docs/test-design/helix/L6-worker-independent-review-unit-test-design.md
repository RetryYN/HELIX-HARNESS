---
title: "worker independent review L6/L7実装oracle設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L6-99-worker-independent-review.md
pair_artifact: docs/design/helix/L6-function-design/worker-independent-review.md
github_issue_id: 227
behavior_contract_id: WCC-FR-06
responsibility_owner: worker-independent-review
---

# worker independent review L6/L7実装oracle設計

`U-WRR-001..009`、`U-WIB-007`、`U-WIB-013`、`U-WIB-018`、`U-DRB-018`を実行し、broker-issued origin、sealed review、proposal／finding digest join、Ubuntu required CIの実bubblewrap、三軸failure reachabilityを検証する。
文言一致、mock call count、provider名差だけでは合格としない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WIB-007 | 実process隔離 | 実bubblewrapでrepo／state／DB／credential非到達 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-018 | required CI | Ubuntu required jobでbackend欠落をskipせずRed | `tests/harness-check-workflow.test.ts` |
