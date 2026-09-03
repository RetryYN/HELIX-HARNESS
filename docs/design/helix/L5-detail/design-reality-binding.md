---
title: "Design Reality Binding詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-09-04
owner: SE
plan: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
pair_artifact: docs/test-design/helix/L8-design-reality-binding-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/design-reality-binding.md
behavior_contract_id: DESIGN-REALITY-BINDING-001
responsibility_owner: design-reality-binding
---

# Design Reality Binding詳細設計

## 1. 型付き分類

- `existing_runtime`: repository-relative path、resource kind/name、source digest、`current_authority=true`を要求する。
- `planned_new`: behavior contract、owner、予定artifact、生成downstream PLAN、`current_runtime=false`を要求する。
- `compatibility_only`: migration/read-only理由、`read_only=true`、`current_authority=false`を要求する。

symlink escape、missing path/export/type/schema/command、digest drift、planned/compatibilityのcurrent昇格をfail-closeする。

## 2. failure到達可能性

reasonごとにidentity fields、post-resolution checks、registry/request fixture、expected reason、mutationを宣言する。
resolverを意味実行し、expected reasonへ到達し、post-check除去mutationが別結果になる場合だけ成立する。
test pathには一意なexecutable Vitest callbackがあり、reason assertionを含み、`toContain()`だけではないことを要求する。

`declared_failure_codes` と `failure_reachability` の空集合は、failure契約の実装完了を表さない。
既存の空bindingは `config/design-reality-binding-empty-baseline.json` による観測baselineとして
保持し、baseline外での新規空bindingはfail-closeする。baselineの追加は許さず、failure witnessを
materializeしたentryの削除による縮小だけを認める。本文にfailure方針がある既知entryは、
hard failureではなくmaterialize候補のadvisoryとして扱う。

## 3. current worker descriptor回帰

identityは`agent_id + contract_version`でexactly-one解決し、`capability_class`を後段で検証する。
capabilityをidentityへ混ぜるとmismatch fixtureが`NOT_FOUND`になるため、`WORKER_DESCRIPTOR_CAPABILITY_MISMATCH`は到達不能として拒否する。

## 4. 到達可能性束縛

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
