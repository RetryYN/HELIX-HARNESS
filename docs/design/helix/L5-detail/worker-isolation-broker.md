---
title: "worker isolation broker詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L5-88-worker-isolation-broker.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-isolation-broker.md
github_issue_id: 226
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
---

# worker isolation broker詳細設計

## 1. preconditionと状態遷移

`attestWorkerIsolationAuthority`はharness authority rootの`config/worker-isolation-runtime-catalog.json`に登録された
backend/runtime IDとcontent digestをexact照合し、実file digestも一致するときだけmodule-private capabilityを発行する。
capabilityはcanonical authority rootとcatalog digestも封印し、`prepare`対象repoのcanonical rootとexact一致を要求するため、別rootでmintした
catalog capabilityを転用できない。backend IDは`bubblewrap`のclosed literalである。空catalogは安全側の初期値であり、未登録runtimeを起動しない。
`prepare`はLinux、sealed authority、immutable wrapper execution、current admitted descriptor、
repo外scratch、regular allowlisted inputを順に検査する。成功時だけbounded byte snapshotを作り、module-private `WeakSet`へlaunch objectを封印する。
`run`は同一object identityだけをbubblewrapへ渡し、spread copyをspawn前に拒否する。

## 2. failure完全集合

| reason code | 到達fixture |
|---|---|
| `WORKER_ISOLATION_PLATFORM_UNSUPPORTED` | `platform=win32` |
| `WORKER_ISOLATION_BACKEND_UNAVAILABLE` | backend欠落／実行不能 |
| `WORKER_ISOLATION_WRAPPER_UNADMITTED` | spread複製されたwrapper execution |
| `WORKER_ISOLATION_ADMISSION_STALE` | registry revision drift／拒否済みdecision |
| `WORKER_ISOLATION_BOUNDARY_INVALID` | scratchがrepo配下または包含 |
| `WORKER_ISOLATION_SOURCE_REJECTED` | symlink、`.git`、`.helix`、`harness.db`、非regular/oversize |
| `WORKER_ISOLATION_RUNTIME_INVALID` | provider binary欠落／実行不能 |
| `WORKER_ISOLATION_LAUNCH_UNSEALED` | spread複製されたbroker launch |

## 3. resource契約

sourceは`O_NOFOLLOW`で一度だけopenし、`/proc/self/fd`の実体がrepo内か再検証した同一fdからsize上限分だけ読む。
stageとmanifest digestは同じcaptured bytesから生成し、検査後にpathを再読込しない。1 file 4 MiB、total 16 MiB、
stdout/stderr 8 MiB、timeout 10分を上限とする。child envは`HOME/LANG/PATH/TMPDIR`だけで、
wrapper supplied envとparent envを渡さない。`/usr`はread-only、provider executableはexact fileだけread-only、scratchだけread-writeである。
backend/runtimeもcatalog一致byteをbroker-owned stagingへ固定してopen FDを保持し、runは`/proc/self/fd/3`をexec、fd 4をread-only bindする。
元pathをhash後に再利用しないためrename/symlink差替えは実行内容を変えない。

## 4. Design Reality Binding契約

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "WORKER_ISOLATION_ADMISSION_STALE",
    "WORKER_ISOLATION_BACKEND_UNAVAILABLE",
    "WORKER_ISOLATION_BOUNDARY_INVALID",
    "WORKER_ISOLATION_LAUNCH_UNSEALED",
    "WORKER_ISOLATION_PLATFORM_UNSUPPORTED",
    "WORKER_ISOLATION_RUNTIME_INVALID",
    "WORKER_ISOLATION_SOURCE_REJECTED",
    "WORKER_ISOLATION_WRAPPER_UNADMITTED"
  ],
  "assets": [
    {
      "asset_id": "worker-isolation-broker",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-isolation-broker.ts",
      "resource_kind": "typescript_export",
      "resource_name": "prepareWorkerIsolationLaunch",
      "source_digest": "sha256:5a0f69619306f27c2c04fac3f05566346aec5c499631d62440d34c7e7b0e220d",
      "current_authority": true
    }
  ],
  "failure_reachability": [
    {
      "reason_code": "WORKER_ISOLATION_PLATFORM_UNSUPPORTED", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "prepareWorkerIsolationLaunch",
      "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-003",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_PLATFORM_UNSUPPORTED",
      "mutation": { "remove_post_resolution_check": "if ((request.platform ?? process.platform) !== \"linux\") {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-014", "execution_helper": "executeIsolationMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_BACKEND_UNAVAILABLE", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "prepareWorkerIsolationLaunch",
      "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-003",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_BACKEND_UNAVAILABLE",
      "mutation": { "remove_post_resolution_check": "if (!isolationAuthorities.has(request.authority)) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-014", "execution_helper": "executeIsolationMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_WRAPPER_UNADMITTED", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "prepareWorkerIsolationLaunch",
      "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-004",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_WRAPPER_UNADMITTED",
      "mutation": { "remove_post_resolution_check": "if (!isWrapperLaunchExecution(request.wrapperLaunch)) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-014", "execution_helper": "executeIsolationMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_ADMISSION_STALE", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "prepareWorkerIsolationLaunch",
      "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-008",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_ADMISSION_STALE",
      "mutation": { "remove_post_resolution_check": "!isWorkerAdmissionCurrent(", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-014", "execution_helper": "executeIsolationMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_BOUNDARY_INVALID", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "prepareWorkerIsolationLaunch",
      "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-001",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_BOUNDARY_INVALID",
      "mutation": { "remove_post_resolution_check": "if (isWithin(repoRoot, scratchBase) || isWithin(scratchBase, repoRoot)) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-014", "execution_helper": "executeIsolationMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_RUNTIME_INVALID", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "prepareWorkerIsolationLaunch",
      "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-003",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_RUNTIME_INVALID",
      "mutation": { "remove_post_resolution_check": "if (!runtimeBytes) return failure(\"WORKER_ISOLATION_RUNTIME_INVALID\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-014", "execution_helper": "executeIsolationMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_SOURCE_REJECTED", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "prepareWorkerIsolationLaunch",
      "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-002",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_SOURCE_REJECTED",
      "mutation": { "remove_post_resolution_check": "if (!captured) return failure(\"WORKER_ISOLATION_SOURCE_REJECTED\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-014", "execution_helper": "executeIsolationMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_LAUNCH_UNSEALED", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "runWorkerIsolationLaunch",
      "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-006",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_LAUNCH_UNSEALED",
      "mutation": { "remove_post_resolution_check": "if (!sealedLaunches.has(launch)) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-014", "execution_helper": "executeIsolationMutationOracle" }
    }
  ]
}
```
