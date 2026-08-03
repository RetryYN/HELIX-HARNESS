---
title: "worker isolation policy関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L6-97-worker-isolation-policy.md
pair_artifact: docs/test-design/helix/L6-worker-isolation-policy-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-isolation-policy.md
github_issue_id: 226
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
---

# worker isolation policy関数設計

- `attestWorkerIsolationPolicy(request)`: exact wrapper、task sensitivity、actual secret marker、write scope、deny-all egressを検証し、module-private capabilityを発行する。
- `isWorkerIsolationPolicyCapability(value)`: module-private `WeakSet`にある同一objectだけをtrueにする。
- `auditWorkerIsolationScope(workspacePath, baseline, writablePaths)`: byte／entry count／depthがboundedなpost-stateを読み、add／modify／deleteのexact setをscopeと照合する。
- `prepareWorkerIsolationLaunch(request)`: policy capabilityとwrapper `origin_digest`を再検証し、failure時spawn 0にする。
- `runWorkerIsolationLaunch(launch, spawn?)`: `--unshare-net`を含むsealed argvで実行し、post-state違反時はgeneric failureだけを返す。

`allowed_egress_hosts`はemptyだけを許可する。host許可はbroker-owned proxy／namespace firewall authorityが実装されるまで
`WORKER_ISOLATION_EGRESS_UNSUPPORTED`で拒否する。scopeはglobを受けず、exact pathまたは末尾`/`のdirectory prefixだけとする。
FR-05/06のoutput schema、proposal再検証、lifecycle receipt、canonical commitは別contractである。
