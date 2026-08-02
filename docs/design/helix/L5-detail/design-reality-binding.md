---
title: "Design Reality Binding詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
pair_artifact: docs/test-design/helix/L8-design-reality-binding-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/design-reality-binding.md
behavior_contract_id: DESIGN-REALITY-BINDING-001
responsibility_owner: design-reality-binding
---

# Design Reality Binding詳細設計

## 1. typed classification

- `existing_runtime`: repository-relative path、resource kind/name、source digest、`current_authority=true`を要求する。
- `planned_new`: behavior contract、owner、予定artifact、生成downstream PLAN、`current_runtime=false`を要求する。
- `compatibility_only`: migration/read-only理由、`read_only=true`、`current_authority=false`を要求する。

symlink escape、missing path/export/type/schema/command、digest drift、planned/compatibilityのcurrent昇格をfail-closeする。

## 2. failure reachability

reasonごとにidentity fields、post-resolution checks、registry/request fixture、expected reason、mutationを宣言する。
resolverを意味実行し、expected reasonへ到達し、post-check除去mutationが別結果になる場合だけ成立する。
test pathには一意なexecutable Vitest callbackがあり、reason assertionを含み、`toContain()`だけではないことを要求する。

## 3. current worker descriptor回帰

identityは`agent_id + contract_version`でexactly-one解決し、`capability_class`を後段で検証する。
capabilityをidentityへ混ぜるとmismatch fixtureが`NOT_FOUND`になるため、`WORKER_DESCRIPTOR_CAPABILITY_MISMATCH`は到達不能として拒否する。

## 4. reachability binding

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"],
  "assets": [],
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
        "registry": [{ "agent_id": "kimi", "contract_version": "1.0.0", "capability_class": "implementation" }],
        "request": { "agent_id": "kimi", "contract_version": "1.0.0", "capability_class": "verification" }
      },
      "expected_reason": "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
      "mutation": { "remove_post_resolution_check": "capability_class", "expected_reason_after_mutation": "OK" }
    }
  ]
}
```
