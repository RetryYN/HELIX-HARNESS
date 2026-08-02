---
title: "worker descriptor admission詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-02
updated: 2026-08-02
owner: SE
plan: docs/plans/PLAN-L5-86-worker-descriptor-admission.md
pair_artifact: docs/test-design/helix/L8-worker-descriptor-admission-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-descriptor-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
---

# worker descriptor admission詳細設計

## 1. 実装境界

本pairは`WCC-FR-01`のdescriptor parse、既存registryからのexact resolution、起動前admission decisionだけを確定する。
`specialist-agent-registry.ts`をprovider横断identity／capability source、既存Python worker registryをsemantic worker sourceとして再利用し、
両者をread-only projectionで同じ型へ写す。新registry、capability catalog file、DB table、workflow、provider別判定器は追加しない。

wrapper／launch receiptは`WCC-FR-02`、sandboxは`WCC-FR-03/04`、execution receiptは`WCC-FR-05/06`、
blind admissionは`WCC-FR-07/08`、context packetは`WCC-FR-09`のownerであり、本pairの完了claimに含めない。

## 2. canonical型

```ts
type WorkerCapabilityClassV1 =
  | "implementation"
  | "verification"
  | "research"
  | "benchmark"
  | "semantic_core";

interface WorkerDescriptorPayloadV1 {
  schema_version: "helix-worker-descriptor.v1";
  agent_id: string;
  contract_version: string;
  provider: string;
  capability_class: WorkerCapabilityClassV1;
  input_schema_digest: `sha256:${string}`;
  output_schema_digest: `sha256:${string}`;
}

interface WorkerDescriptorV1 extends WorkerDescriptorPayloadV1 {
  descriptor_digest: `sha256:${string}`;
}

interface WorkerDescriptorRequestV1 {
  agent_id: string;
  contract_version: string;
  capability_class: WorkerCapabilityClassV1;
}

interface WorkerRegistryEntryV1 {
  descriptor: WorkerDescriptorV1;
  status: "active" | "inactive";
  source_registry: "specialist_agent" | "python_worker";
  source_entry_digest: `sha256:${string}`;
}

interface WorkerRegistrySnapshotV1 {
  revision: number;
  registry_digest: `sha256:${string}`;
  entries: readonly WorkerRegistryEntryV1[];
}

type WorkerDescriptorFailureCode =
  | "WORKER_DESCRIPTOR_INVALID"
  | "WORKER_DESCRIPTOR_NOT_FOUND"
  | "WORKER_DESCRIPTOR_AMBIGUOUS"
  | "WORKER_DESCRIPTOR_INACTIVE"
  | "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"
  | "WORKER_DESCRIPTOR_DIGEST_MISMATCH"
  | "WORKER_ADMISSION_DECISION_STALE";

interface WorkerDescriptorAdmissionDecisionV1 {
  schema_version: "helix-worker-descriptor-admission.v1";
  disposition: "admitted" | "rejected";
  request: WorkerDescriptorRequestV1;
  registry_revision: number;
  registry_digest: `sha256:${string}`;
  descriptor_digest: `sha256:${string}` | null;
  reason_codes: readonly WorkerDescriptorFailureCode[];
  decision_digest: `sha256:${string}`;
}
```

IDは`^[a-z0-9][a-z0-9-]*$`、contract versionは`^[1-9][0-9]*\.[0-9]+\.[0-9]+$`、digestは
`^sha256:[a-f0-9]{64}$`を満たす。objectはstrict、unknown keyを拒否する。providerはprojection provenanceでありresolution keyではない。

## 3. canonicalizationとdigest

`descriptor_digest`は`WorkerDescriptorPayloadV1`だけを、schema順のkeyを持つUTF-8 canonical JSONへ直列化してSHA-256化する。
`descriptor_digest` field自身を入力へ含めない。arrayは入力順を保持し、本型にはunordered arrayを置かない。

snapshotはentryを`agent_id`、`contract_version`、`capability_class`、`descriptor_digest`、`source_registry`のUTF-8 bytewise昇順へ並べ、
revisionと全entryを含めてdigest化する。decisionは時刻、provider process結果、過去receiptを含めず、request、snapshot binding、
descriptor digest、全reason codeから決定的にdigest化する。

## 4. 純粋関数契約

```ts
parseWorkerDescriptor(raw: unknown): Result<WorkerDescriptorV1, WorkerDescriptorFailureCode[]>
projectSpecialistAgentEntry(raw: unknown): Result<WorkerDescriptorV1, WorkerDescriptorFailureCode[]>
projectPythonWorkerEntry(raw: unknown): Result<WorkerDescriptorV1, WorkerDescriptorFailureCode[]>
canonicalizeWorkerRegistrySnapshot(entries: readonly WorkerRegistryEntryV1[], revision: number): Result<WorkerRegistrySnapshotV1, WorkerDescriptorFailureCode[]>
resolveWorkerDescriptor(request: WorkerDescriptorRequestV1, snapshot: WorkerRegistrySnapshotV1): Result<WorkerDescriptorV1, WorkerDescriptorFailureCode[]>
evaluateWorkerDescriptorAdmission(request: WorkerDescriptorRequestV1, snapshot: WorkerRegistrySnapshotV1): WorkerDescriptorAdmissionDecisionV1
isWorkerAdmissionCurrent(decision: WorkerDescriptorAdmissionDecisionV1, request: WorkerDescriptorRequestV1, snapshot: WorkerRegistrySnapshotV1): boolean
```

projection関数はsource固有fieldを共通authorityへ昇格せず、必要な共通fieldだけを新しいvalueへ写す。source registryへのwriteを行わない。
resolve keyは`agent_id + contract_version + capability_class`のexact 3-tupleである。0件、複数件、inactiveを区別し、provider fallbackをしない。

## 5. 評価順序とfailure

1. request、descriptor、snapshotのstrict schemaとdigestを検証する。
2. exact 3-tuple候補を数え、0件／複数件を確定する。
3. exactly-one候補のstatus、capability、descriptor digest、source entry digestを検証する。
4. failureを`WorkerDescriptorFailureCode`の宣言順に重複なしで返す。failureが1件でもあれば`rejected`、descriptor digestは検証済み候補だけに設定する。
5. requestとsnapshot bindingを含むdecision digestを生成する。

request、snapshot revision／digest、resolved descriptor digestのいずれかが変わればdecisionはstaleであり、
`WORKER_ADMISSION_DECISION_STALE`として再評価する。低位の正常providerや過去greenでfailureを相殺しない。

`WorkerLaunchPort`が要求するlaunch receipt欠落／stale reasonは`WCC-FR-02`のwrapper責務である。本pairはadmitted decisionを返すまでをownerとし、
`WORKER_LAUNCH_RECEIPT_MISSING`のようなwrapper failureを先取りしない。L6/L7ではlaunch portが本decisionのcurrent性を再検証する接続点だけを持つ。

## 6. 状態遷移

```text
raw -> parsed -> projected -> snapshot_bound -> resolved -> admitted
  \-> invalid|not_found|ambiguous|inactive|mismatch -> rejected (spawn 0)
admitted -- request/snapshot/descriptor drift --> stale -> snapshot_bound
```

## 7. 設計リファクタリングgate

候補Aは既存2 registryのread-only projection＋純粋関数、候補Bは共通registry／永続化／provider別adapterを新設する案とする。
同じL8 oracleを100%満たし、Aのnew component/state/persistence/production LOCがB以下であるためAを採用する。
本pairの基線はnew registry 0、new DB table 0、new workflow 0、production code 0である。oracle削除、timeout延長、型の`string`化で縮小を偽装しない。

## 8. L6/L7 carry

L6/L7は上記純粋関数を既存runtime moduleへ実装し、既存registry fixtureとのdual-green、mutation、spawn 0 evidenceを閉じる。
本L5/L8 pairを再所有せず、wrapper・sandbox・benchmark・context packetを混載しない。
