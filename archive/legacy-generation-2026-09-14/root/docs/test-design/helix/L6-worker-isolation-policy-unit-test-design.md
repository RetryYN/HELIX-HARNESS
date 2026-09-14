---
title: "worker isolation policy L6関数単体テスト設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L7-500-worker-isolation-policy.md
pair_artifact: docs/design/helix/L6-function-design/worker-isolation-policy.md
github_issue_id: 226
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
---

# worker isolation policy L6関数単体テスト設計

| U-ID | 関数境界 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WIP-001..004 | `attestWorkerIsolationPolicy` | 複製wrapper、secret、egress、無効scopeをspawn前拒否 | `tests/worker-isolation-policy.test.ts` |
| U-WIP-005..007 | `auditWorkerIsolationScope` | scope外、symlink、特殊file、resource上限超をgeneric failure | `tests/worker-isolation-policy.test.ts` |
| U-WIP-008 | static mutation fence | policyの必須分岐除去をRed | `tests/worker-isolation-policy.test.ts` |
| U-WIB-010 | `prepareWorkerIsolationLaunch`／`runWorkerIsolationLaunch` | policy identity、`--unshare-net`、post-state audit欠落をRed | `tests/worker-isolation-broker.test.ts` |
| U-DRB-015 | failure reachability | 17 mutationで対象failure分岐をkill | `tests/design-reality-binding.test.ts` |
