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

本sliceで実在するのはexact runtime identityとexperimental modeを分離するpure resolverだけである。
artifact取得・offline sync・rollback経路は未実装であり、実在証拠として扱わない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["PYTHON_RUNTIME_EXPERIMENTAL_MODE_MISMATCH"],
  "assets": [
    {
      "asset_id": "python-runtime-toolchain-freeze-resolver",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/python-runtime-toolchain-freeze.ts",
      "resource_kind": "typescript_export",
      "resource_name": "resolvePythonRuntimeToolchain",
      "source_digest": "sha256:13cc7e3467c160124e65311830c5be4ef49c0bd5a6fd1b03530efdb4dce8c4c4",
      "current_authority": true
    }
  ],
  "failure_reachability": [
    {
      "reason_code": "PYTHON_RUNTIME_EXPERIMENTAL_MODE_MISMATCH",
      "reachability_mode": "identity_post_check",
      "source_path": "src/runtime/python-runtime-toolchain-freeze.ts",
      "source_symbol": "resolvePythonRuntimeToolchain",
      "test_path": "tests/python-runtime-toolchain-freeze.test.ts",
      "oracle_id": "U-PYRT-001",
      "identity_fields": ["python_version", "implementation"],
      "post_resolution_checks": ["free_threaded", "jit"],
      "fixture": {
        "registry": [{ "python_version": "3.14.7", "implementation": "cpython", "free_threaded": "disabled", "jit": "disabled" }],
        "request": { "python_version": "3.14.7", "implementation": "cpython", "free_threaded": "enabled", "jit": "disabled" }
      },
      "expected_reason": "PYTHON_RUNTIME_EXPERIMENTAL_MODE_MISMATCH",
      "mutation": {
        "remove_post_resolution_check": "free_threaded",
        "expected_reason_after_mutation": "OK"
      }
    }
  ]
}
```
