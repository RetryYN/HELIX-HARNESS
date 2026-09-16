---
title: "worker descriptor admission関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L6-94-worker-descriptor-admission.md
pair_artifact: docs/test-design/helix/L8-worker-descriptor-admission-runtime-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-descriptor-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
---

# worker descriptor admission関数設計

## 1. 実装責務

`src/runtime/worker-descriptor-admission.ts`はsource entryをread-onlyで共通descriptorへ投影し、in-memory snapshotと
起動前decisionを副作用なしで生成する。filesystem、DB、network、process、workflowを参照せず、source registryへwriteしない。
launch、sandbox、execution receipt、blind benchmark、context packetは後続WCC-FR-02以降へ残す。

## 2. source projection設計

specialist projectionは実在`specialistAgentRegistryEntrySchema`を再利用し、contract version、WCC capability、input/output schema digest、
statusを明示bindingとして要求する。Python projectionは`helix-python-worker-descriptor.v1`のworker identity、version、provider、
固有capability、request/result schemaを保持し、WCC capabilityとinput/output digestを明示mappingとして要求する。
固有capability名、provider、CLI成功からWCC capabilityを推論しない。

source record本体はprovenanceとしてentryへ保持し、snapshot canonicalizerがsource schema、projected identity、record digestを再検証する。
source record digestはsource entry全体、source entry digestはsource schema/version、source record digest、status、
projected descriptor digestから生成する。derived digest自身はcanonical payloadから除外する。

## 3. 公開関数

| 関数 | 正常出力 | fail-close |
|---|---|---|
| `parseWorkerDescriptor` | strict descriptor | unknown key、ID/version/capability/digest不正 |
| `projectSpecialistAgentEntry` | specialist source由来entry | source schema不正、暗黙binding |
| `projectPythonWorkerEntry` | Python descriptor由来entry | source schema不正、暗黙mapping |
| `canonicalizeWorkerRegistrySnapshot` | bytewise sort済みsnapshot | revision、descriptor/source digest drift |
| `resolveWorkerDescriptor` | exactly-one active entry | 0件、複数件、inactive、capability mismatch |
| `evaluateWorkerDescriptorAdmission` | deterministic decision | resolver failureを固定順で保持 |
| `isWorkerAdmissionCurrent` | currentならtrue | request/snapshot/descriptor/source drift |

## 4. resolutionとstale

resolverは最初にstrict shapeと全digestを検証し、`agent_id + contract_version`でidentity候補を数える。0件、複数件を確定後、
exactly-one候補のstatus、capabilityを検証する。capabilityをidentity keyへ混ぜてmismatchをNOT_FOUNDへ潰さない。

staleは初回resolver failureではない。既存decisionとcurrent request/snapshotからdecisionを再生成し、decision digestが一致するときだけcurrentとする。
decisionはregistry revision/digest、descriptor digest、source entry digestへ束縛されるため、いずれのdriftもfalseになる。
受信decision自身もstrict parseし、digest fieldを除くpayloadのre-digestとcurrent decision全体のcanonical一致を要求する。
拒否decisionのdisposition／reason／resolved digestだけを改竄し、古いdigestを残すforgeはfalseである。

## 5. 設計リファクタリング

新永続registry案とpure projection案を同じ13 oracleで比較し、後者を採用する。production module 1、new persistent state 0、
new DB table 0、new workflow 0、I/O 0である。既存source schemaと`canonicalJson`／`sha256Digest`を再利用し、provider別resolverを作らない。
