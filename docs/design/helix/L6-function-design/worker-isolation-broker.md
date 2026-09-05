---
title: "worker isolation broker関数設計"
layer: L6
artifact_type: design
status: confirmed
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

- `attestWorkerIsolationAuthority(authorityRoot, binding)`: canonical authority root、catalog digest、closed `bubblewrap` ID、backend/runtime content digestを検証・封印し、同一process／同一repoだけで有効なauthority capabilityを発行する。
- `prepareWorkerIsolationLaunch(request)`: immutable wrapper、fresh admission、authority、race-resistant fd capture、manifest digest、sealed launch生成。failure時spawn 0。
- `runWorkerIsolationLaunch(launch, spawn?)`: sealed identity検査、fixed bubblewrap argv/env、bounded synchronous execution。
- `isWrapperLaunchExecution(value)`: adapter-private capability mapが保持するexecution objectとの同一性だけをtrueにする。

pathはrepo-relative、重複なし、NUL/absolute/`..`/`.git`/`.helix`/`harness.db`なしとし、opened fdの実体を再検証する。
backendとprovider binaryはabsolute executable fileに加えcatalog digest exact一致を要求し、captured byteをbroker-owned FDへ固定する。
WCC-FR-04のnetwork/secret policy fieldは公開しない。

## 起動capabilityの寿命と例外回収

`runWorkerIsolationLaunch`は起動前にsealed launchを一度だけ消費する。同じobjectの再入、
例外後・終了後の再実行は既存の`WORKER_ISOLATION_LAUNCH_UNSEALED`で拒否し、spawnへ進めない。
引数構築またはspawnが例外を投げても、finallyでbroker所有mapとbackend/runtime FDを回収する。
起動例外は成功receiptへ変換せず呼出元へ伝播する。別の再試行はadmissionを再検証するprepareから新しいlaunchを生成する。
これはprocess隔離policyの緩和やproduction callerの接続完了を意味しない。
