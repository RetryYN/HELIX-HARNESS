---
title: "worker isolation policy L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L6-97-worker-isolation-policy.md
pair_artifact: docs/design/helix/L6-function-design/worker-isolation-policy.md
github_issue_id: 226
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
---

# worker isolation policy L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WIP-001 | policy封印 | exact wrapperへdeny-all／normalized scopeを束縛 | `tests/worker-isolation-policy.test.ts` |
| U-WIP-002 | secret deny | secret／unknown／実token taskはspawn前拒否 | `tests/worker-isolation-policy.test.ts` |
| U-WIP-003 | identity／egress | copied wrapper、non-empty host allowlistを拒否 | `tests/worker-isolation-policy.test.ts` |
| U-WIP-004 | scope構文 | absolute／traversal／git/state/DBを拒否 | `tests/worker-isolation-policy.test.ts` |
| U-WIP-005 | scope内diff | 許可add／modify／deleteのexact setを返す | `tests/worker-isolation-policy.test.ts` |
| U-WIP-006 | scope外diff | contentを露出せずgeneric failure | `tests/worker-isolation-policy.test.ts` |
| U-WIP-007 | post-state type／size | symlink／特殊file／oversizeを拒否 | `tests/worker-isolation-policy.test.ts` |
| U-WIP-008 | static mutation fence | network／scope enforcement token欠落をRed | `tests/worker-isolation-policy.test.ts` |
| U-WIB-010 | broker結線 | `--unshare-net`とpost-run audit、copied policy拒否 | `tests/worker-isolation-broker.test.ts` |
| U-DRB-015 | mutation reachability | policy failure 5分岐の除去をRed | `tests/design-reality-binding.test.ts` |
