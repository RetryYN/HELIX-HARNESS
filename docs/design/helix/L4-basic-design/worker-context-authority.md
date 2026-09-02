---
title: "worker context authority基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L4-66-worker-context-authority.md
pair_artifact: docs/test-design/helix/L9-worker-context-authority-system-test-design.md
related_l3: docs/design/helix/L3-requirements/worker-common-contract.md
github_issue_id: 225
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
---

# worker context authority基本設計

## 1. 目的と境界

外部worker起動前に`worker-context-packet.v1`を一件生成し、current HEAD、current authority/rule、goal、
直交するdevelopment style／case model／specialist process、原子契約、scope、severity、output schema、有限budget、
role judgment、task lens、実payloadを同一sealed capabilityへ束縛する。WCC-FR-07/08のbenchmark、WCC-FR-06のreview、
durable lifecycle、DB／workflowは扱わない。

## 2. componentとdata flow

| component | 分類 | 責務 |
|---|---|---|
| `WorkerContextAuthorityAttestor` | new pure/runtime boundary | repository HEADとcode-defined canonical path集合の実在bytesをdigest化する |
| `WorkerContextCompiler` | new pure core | exact packet、role/lens digest、payload digest、sealed envelopeを生成する |
| `AdapterContextBinder` | existing adapter拡張 | 通常promptをpacket envelopeへ変換しwrapper originと同時にsealする |
| `WorkerIsolationBroker` | existing broker拡張 | spawn前にauthority root、HEAD、schema、envelope capabilityを再検証する |

```text
canonical repository bytes + git HEAD
  -> attestWorkerContextAuthority
  -> buildAdapterPlan
  -> compileWorkerContextPacket
  -> context-bound wrapper admission
  -> prepareWorkerIsolationLaunch
       mismatch -> typed failure / spawn 0
       exact     -> isolated worker launch
```

Issue #225本文はdispatch情報でありauthorityではない。`docs/archive/**`、requirements v1.2、旧layer projection、
pre-policy Kimi receiptはcompatibility/historical inputに限定し、current packet authorityへ昇格しない。

## 3. 設計リファクタリング

新service、DB table、workflow、ledgerは0。既存`canonicalJson`／`sha256Digest`、role judgment、task lens、adapter、
brokerを再利用し、新規production moduleはcontext packet owner一件だけとする。既存generic wrapperは内部用途の互換面として
残すが、外部brokerはcontext capability無しのlegacy wrapperをfail-closeする。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "digest-core", "classification": "existing_runtime", "artifact_path": "src/shared/canonical-digest.ts", "resource_kind": "typescript_export", "resource_name": "canonicalJson", "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000", "current_authority": true },
    { "asset_id": "role-judgment", "classification": "existing_runtime", "artifact_path": "src/runtime/role-judgment.ts", "resource_kind": "typescript_export", "resource_name": "roleJudgmentBrief", "source_digest": "sha256:383741bb020445e878d39819ac99cc1ad4f87ef3f598ffc01421fbfcae97c449", "current_authority": true },
    { "asset_id": "task-lens", "classification": "existing_runtime", "artifact_path": "src/runtime/task-lens.ts", "resource_kind": "typescript_export", "resource_name": "taskLensBrief", "source_digest": "sha256:8c3e8d240edccdefeaec72aa82ffd8c811c0c49736d1eac639f5169b77715a6b", "current_authority": true },
    { "asset_id": "wrapper-admission", "classification": "existing_runtime", "artifact_path": "src/runtime/adapter.ts", "resource_kind": "typescript_export", "resource_name": "admitWrapperLaunch", "source_digest": "sha256:6b45058468e39490baedc3f209e03fbdc0643db3807775e23be8bd8a522ddc90", "current_authority": true },
    { "asset_id": "isolation-broker", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-isolation-broker.ts", "resource_kind": "typescript_export", "resource_name": "prepareWorkerIsolationLaunch", "source_digest": "sha256:80aa1a6982a2f4bfa94b60da7a01b04e5168012f83533fbe59bd26ac14f33fa9", "current_authority": true }
  ],
  "failure_reachability": []
}
```
