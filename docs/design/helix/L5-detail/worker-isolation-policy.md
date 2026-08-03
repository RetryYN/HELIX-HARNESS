---
title: "worker isolation policy詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L5-89-worker-isolation-policy.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-policy-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-isolation-policy.md
github_issue_id: 226
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
---

# worker isolation policy詳細設計

## 1. preconditionと状態遷移

`attestWorkerIsolationPolicy`はadapter-private mapが保持するexact wrapper executionだけを受ける。
task classificationは`non_secret`だけを許可し、既存`isSecretLike`をwrapper stdin／argvへ追加適用する。
許可scopeはrelative exact pathまたは末尾`/`のdirectory prefixへ正規化し、empty／absolute／drive path／NUL／`.`／`..`／
`.git`／`.helix`／`harness.db`を拒否する。egressは`deny_all`だけで、host allowlistは起動前に拒否する。

brokerはcapability object identityとwrapper `origin_digest`を再検証し、bubblewrapへ`--unshare-net`を必須付与する。
process終了後、input manifestとscratch post-stateのdigest集合を比較する。scope内変更だけを成功とし、違反時はgeneric reasonだけを返す。

## 2. failure完全集合

| reason code | 到達fixture |
|---|---|
| `WORKER_ISOLATION_POLICY_UNRESOLVED` | copied wrapper／copied policy／origin mismatch |
| `WORKER_ISOLATION_SECRET_TASK_DENIED` | secret、unknown、実tokenを含むtask |
| `WORKER_ISOLATION_EGRESS_UNSUPPORTED` | non-empty host allowlist |
| `WORKER_ISOLATION_SCOPE_INVALID` | absolute、traversal、authority path、曖昧scope |
| `WORKER_ISOLATION_SCOPE_VIOLATION` | scope外add/modify/delete、symlink、特殊file、oversize |

## 3. resource・security契約

post-stateは1 file 4 MiB、total 16 MiBを上限とし、regular fileを`O_NOFOLLOW`でopenした同一fdから読む。
mtimeやprose flagは判定根拠にせず、path、type、size、content digestで比較する。違反resultへpath、content、secretを含めない。
networkはnamespace denyを実行境界とし、dry-run egress reportやCodex `workspace-write`を代替根拠にしない。

## 4. Design Reality Binding契約

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "WORKER_ISOLATION_EGRESS_UNSUPPORTED",
    "WORKER_ISOLATION_POLICY_UNRESOLVED",
    "WORKER_ISOLATION_SCOPE_INVALID",
    "WORKER_ISOLATION_SCOPE_VIOLATION",
    "WORKER_ISOLATION_SECRET_TASK_DENIED"
  ],
  "assets": [
    {
      "asset_id": "worker-isolation-policy",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-isolation-policy.ts",
      "resource_kind": "typescript_export",
      "resource_name": "attestWorkerIsolationPolicy",
      "source_digest": "sha256:adad070f800e3417cf3a5a3ff9c4978ecbc2b300a3279334cfb0876d8e3d4d4c",
      "current_authority": true
    }
  ],
  "failure_reachability": [
    {
      "reason_code": "WORKER_ISOLATION_POLICY_UNRESOLVED", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-policy.ts", "source_symbol": "attestWorkerIsolationPolicy",
      "test_path": "tests/worker-isolation-policy.test.ts", "oracle_id": "U-WIP-003",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_POLICY_UNRESOLVED",
      "mutation": { "remove_post_resolution_check": "if (!isWrapperLaunchExecution(request.wrapperLaunch)) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-015", "execution_helper": "executeIsolationPolicyMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_SECRET_TASK_DENIED", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-policy.ts", "source_symbol": "attestWorkerIsolationPolicy",
      "test_path": "tests/worker-isolation-policy.test.ts", "oracle_id": "U-WIP-002",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_SECRET_TASK_DENIED",
      "mutation": { "remove_post_resolution_check": "request.task_sensitivity !== \"non_secret\" ||", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-015", "execution_helper": "executeIsolationPolicyMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_EGRESS_UNSUPPORTED", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-policy.ts", "source_symbol": "attestWorkerIsolationPolicy",
      "test_path": "tests/worker-isolation-policy.test.ts", "oracle_id": "U-WIP-003",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_EGRESS_UNSUPPORTED",
      "mutation": { "remove_post_resolution_check": "if (request.allowed_egress_hosts.length > 0) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-015", "execution_helper": "executeIsolationPolicyMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_SCOPE_INVALID", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-policy.ts", "source_symbol": "attestWorkerIsolationPolicy",
      "test_path": "tests/worker-isolation-policy.test.ts", "oracle_id": "U-WIP-004",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_SCOPE_INVALID",
      "mutation": { "remove_post_resolution_check": "if (!normalized) return policyFailure(\"WORKER_ISOLATION_SCOPE_INVALID\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-015", "execution_helper": "executeIsolationPolicyMutationOracle" }
    },
    {
      "reason_code": "WORKER_ISOLATION_SCOPE_VIOLATION", "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-policy.ts", "source_symbol": "auditWorkerIsolationScope",
      "test_path": "tests/worker-isolation-policy.test.ts", "oracle_id": "U-WIP-006",
      "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} },
      "expected_reason": "WORKER_ISOLATION_SCOPE_VIOLATION",
      "mutation": { "remove_post_resolution_check": "if (changedPaths.some((path) => !pathIsWritable(path, writablePaths))) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-015", "execution_helper": "executeIsolationPolicyMutationOracle" }
    }
  ]
}
```
