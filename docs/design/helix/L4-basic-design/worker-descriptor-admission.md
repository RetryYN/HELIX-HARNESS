---
title: "worker descriptor admission基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-02
updated: 2026-08-02
owner: SE
plan: docs/plans/PLAN-L4-60-worker-descriptor-admission.md
pair_artifact: docs/test-design/helix/L9-worker-descriptor-admission-system-test-design.md
related_l3: docs/design/helix/L3-requirements/worker-common-contract.md
github_issue_id: 225
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
---

# worker descriptor admission基本設計

## 1. 設計目的

Claude、Codex、Kimi、将来workerをprovider固有I/Oではなく、versioned descriptorと同じ起動前判定へ束縛する。
本sliceの唯一のbehavior authorityは`WCC-FR-01`、唯一の責務ownerは`worker-descriptor-admission`である。
wrapper経路、sandbox、receipt、blind benchmark、context packetは後続の独立behaviorであり、本pairでは完了を主張しない。

## 2. component境界

| component | 入力 | 出力 | authority | failure |
|---|---|---|---|---|
| `WorkerDescriptorProjection` | provider登録入力 | `WorkerDescriptorV1`候補 | proposal-only | unknown key、schema／version／capability欠落 |
| `AgentRegistry` | descriptor候補、registry snapshot | active descriptor exact set | repo-owned registry | 0件、複数件、inactive、digest drift |
| `PythonWorkerRegistryAdapter` | Python worker descriptor | 共通descriptor projection | read-only adapter | Python固有fieldのauthority昇格 |
| `WorkerDescriptorAdmissionPolicy` | requested worker/capability、resolved descriptor、current snapshot | `WorkerDescriptorAdmissionDecision` | decision-only | identity／version／capability／digest不一致 |
| `WorkerLaunchPort` | admitted decision | provider-neutral launch request | process spawn authority | admission receipt欠落・stale |

`AgentRegistry`をprovider横断identityのowner、既存`PythonWorkerRegistry`をPython capability descriptorのownerとして再利用する。
共通admissionのために第二のregistry、永続化table、provider別判定分岐を作らない。provider adapterは候補を投影できるが、
登録状態や起動許可を自己決定しない。

## 3. 型付きprojection

```ts
interface WorkerDescriptorV1 {
  schema_version: "helix-worker-descriptor.v1";
  agent_id: string;
  contract_version: string;
  provider: string;
  capability_class: string;
  input_schema_digest: string;
  output_schema_digest: string;
  descriptor_digest: string;
}

interface WorkerRegistrySnapshotV1 {
  revision: number;
  registry_digest: string;
  descriptors: readonly {
    descriptor: WorkerDescriptorV1;
    status: "active" | "inactive";
  }[];
}

interface WorkerDescriptorAdmissionDecision {
  disposition: "admitted" | "rejected";
  requested_agent_id: string;
  requested_capability_class: string;
  registry_revision: number;
  registry_digest: string;
  descriptor_digest: string | null;
  reason_codes: readonly string[];
}
```

`capability_class`のclosed setはL5でcatalogとversioningを確定する。本L4ではprovider名からcapabilityを推論せず、
descriptorが宣言した一値とrequestをexact照合する。descriptor canonical JSONのdigestとsnapshot登録digestを別々に保持し、
いずれかのdriftを別providerのgreenや過去receiptで相殺しない。

## 4. data flowと状態遷移

```text
provider registration input
  -> descriptor projected
  -> strict shape validated
  -> registry snapshot resolved
  -> identity/version/capability/digest matched
       -> admitted -> WorkerLaunchPort
       -> rejected -> spawn 0
```

同一`agent_id`、`contract_version`、`capability_class`にactive descriptorがexactly-one存在する場合だけadmitする。
registry revision/digest、descriptor digest、requestのいずれかが変わればdecisionをstale化し、再解決する。
unknown providerでも登録済みdescriptorと同じ契約を満たせば候補になれるが、descriptor無しのprovider allowlistやraw CLI成功を
admissionへ代用しない。

## 5. failure契約

| reason code | 条件 | 副作用 |
|---|---|---|
| `WORKER_DESCRIPTOR_INVALID` | 必須field欠落、unknown key、schema/version不正 | registry write 0、spawn 0 |
| `WORKER_DESCRIPTOR_NOT_FOUND` | exact keyが0件 | spawn 0 |
| `WORKER_DESCRIPTOR_AMBIGUOUS` | exact keyが複数件 | spawn 0 |
| `WORKER_DESCRIPTOR_INACTIVE` | 一致descriptorがinactive | spawn 0 |
| `WORKER_DESCRIPTOR_CAPABILITY_MISMATCH` | requestとdescriptorのcapability不一致 | spawn 0 |
| `WORKER_DESCRIPTOR_DIGEST_MISMATCH` | descriptorまたはsnapshot digest drift | spawn 0、receipt stale |

## 6. 設計リファクタリング

比較対象は、(A) provider横断の新registryを追加する案と、(B)既存`AgentRegistry`へ共通descriptor admissionを合成し
`PythonWorkerRegistry`をadapter利用する案である。同じ正常・負例oracleを満たすため、Bを採用する。

| metric | A: 新registry | B: 既存owner合成（採用） |
|---|---:|---:|
| new component owner | 1以上 | 0 |
| new persistence surface | 1以上 | 0 |
| provider別authority | 発生し得る | 0 |
| L9 oracle coverage | 100%必須 | 100%必須 |

L5 pair-freeze前に`new_component_count`、`new_state_count`、`new_persistence_surface_count`、
`production_loc_delta`を再計測する。oracle削除、timeout延長、provider禁止文による代替で小さく見せない。

## 7. 下流境界

本pairは構成、責務、I/F、data flow、system oracleだけを確定する。descriptor parser、closed capability catalog、
exception型、registry transactionはL5/L8、実装とmutation evidenceはL6/L7へ降下する。
`WCC-FR-02`のwrapper、`WCC-FR-03/04`のsandbox、`WCC-FR-05/06`のreceipt、`WCC-FR-07/08`のblind admission、
`WCC-FR-09`のcontext packetは後続原子契約である。
