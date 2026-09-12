---
title: "HELIX L5 詳細設計 — Python runtime toolchain freeze"
layer: L5
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: PLAN-L5-104-python-runtime-toolchain-freeze
parent_design: docs/design/helix/L5-detail/python-worker-runtime.md
pair_artifact: docs/test-design/helix/L8-python-runtime-toolchain-freeze-integration-test-design.md
behavior_contract_id: PYTHON-RUNTIME-TOOLCHAIN-FREEZE-001
---

# Python runtime toolchain freeze 詳細設計

## 境界

本deltaは既存Python worker runtimeのprocess／protocol／transaction設計を変更せず、最初のsemantic coreを
再現可能に取得・検証・rollbackするtoolchain authorityだけを所有する。実装・activation・distributionは対象外である。

## freeze契約

- runtime identityはCPython 3.14.7通常build、free-threaded無効、JIT無効とする。
- Linux source tarballとWindows x64 installerは公式URL、SHA-256、Sigstore identity、OIDC issuer、SPDXを束縛する。
- lock producerはattestation検証済みuv 0.12.0、正本は`pyproject.toml`と`uv.lock`とする。
- installは`--frozen --offline --no-index --no-python-downloads`を全て要求し、system Pythonへfallbackしない。
- OS別artifactは分離するが、同一semantic fixtureとruntime identity contractを共有する。
- rollbackは3.14.7通常buildの既知identityへ戻し、旧runtimeやBun経路を再有効化しない。

## 未完了条件

source build、実lock生成、offline sync、Linux／Windows parity、rollback rehearsalのreceiptが揃うまで、
本設計、対応L8テスト設計、親PLANはdraftを維持する。

## 設計実在性束縛

本sliceは設計freezeだけを所有する。exact runtime identity resolver、artifact取得、offline sync、rollback経路は
後続実装PLANのplanned assetであり、現時点のruntime authorityとして扱わない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"],
  "assets": [
    {
      "asset_id": "python-semantic-worker-descriptor-boundary",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-descriptor-admission.ts",
      "resource_kind": "typescript_export",
      "resource_name": "projectPythonWorkerEntry",
      "source_digest": "sha256:14e67487b627a0043e0cd06630a6ca6aed6a9341901c0311aec99d6b0170cd6d",
      "current_authority": true
    },
    {
      "asset_id": "python-runtime-toolchain-freeze-resolver",
      "classification": "planned_new",
      "behavior_contract_id": "PYTHON-SEMANTIC-FOUNDATION-CANARY-001",
      "responsibility_owner": "python-semantic-runtime",
      "planned_artifact": "src/runtime/python-runtime-toolchain-freeze.ts",
      "downstream_plan": "docs/plans/PLAN-L6-1734-python-semantic-foundation-canary-boundary.md",
      "current_runtime": false
    }
  ],
  "failure_reachability": [
    {
      "reason_code": "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
      "reachability_mode": "identity_post_check",
      "source_path": "src/runtime/worker-descriptor-admission.ts",
      "source_symbol": "resolveWorkerDescriptor",
      "test_path": "tests/worker-descriptor-admission.test.ts",
      "oracle_id": "U-WDA-004",
      "identity_fields": ["agent_id", "contract_version"],
      "post_resolution_checks": ["capability_class"],
      "fixture": {
        "registry": [{ "agent_id": "python-semantic", "contract_version": "1.0.0", "capability_class": "semantic_core" }],
        "request": { "agent_id": "python-semantic", "contract_version": "1.0.0", "capability_class": "implementation" }
      },
      "expected_reason": "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
      "mutation": {
        "remove_post_resolution_check": "capability_class",
        "expected_reason_after_mutation": "OK",
        "execution_test_path": "tests/design-reality-binding.test.ts",
        "execution_oracle_id": "U-DRB-011",
        "execution_helper": "executeRuntimeMutationOracle",
        "execution_target": "if (match.descriptor.capability_class !== request.capability_class)"
      }
    }
  ]
}
```
