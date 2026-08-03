---
title: "worker isolation broker関数設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L6-96-worker-isolation-broker.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-runtime-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-isolation-broker.md
github_issue_id: 226
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
---

# worker isolation broker関数設計

- `prepareWorkerIsolationLaunch(request)`: validation、bounded copy、manifest digest、sealed launch生成。failure時spawn 0。
- `runWorkerIsolationLaunch(launch, spawn?)`: sealed identity検査、fixed bubblewrap argv/env、bounded synchronous execution。
- `isWrapperLaunchExecution(value)`: adapter-private capability mapが保持するexecution objectとの同一性だけをtrueにする。

pathはrepo-relative、重複なし、NUL/absolute/`..`/`.git`/`.helix`/`harness.db`なし、全component非symlink、leaf regular fileを要求する。
backendとprovider binaryはabsolute executable fileを要求する。WCC-FR-04のnetwork/secret policy fieldは公開しない。
