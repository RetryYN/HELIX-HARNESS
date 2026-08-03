---
title: "worker output admission関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L6-98-worker-output-admission.md
pair_artifact: docs/test-design/helix/L6-worker-output-admission-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-output-admission.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker output admission関数設計

## 1. public API

```ts
formatWorkerOutputContract(outputSchemaDigest, descriptorDigest): string
hasWorkerOutputContract(stdin, binding): boolean
admitWorkerOutput(raw, binding): WorkerOutputAdmissionResult
isWorkerValidatedOutput(value): value is WorkerValidatedOutputCapability
readValidatedWorkerPayload(output): string | undefined
```

schema map、schema validator、capability `WeakSet`、payload `WeakMap`はmodule-privateとする。public callerはAST、parser、relaxation、任意payloadを注入できない。

## 2. broker結線順序

`prepareWorkerIsolationLaunch`はcurrent descriptor entryをdecision digestからexact解決し、known schemaとstdin contractをspawn前に検証する。
`runWorkerIsolationLaunch`はBuffer stdoutを受け、scope greenかつstatus 0の後に`admitWorkerOutput`を必ず呼ぶ。成功型からraw stdout／stderrを削除し、sealed capabilityとstderr digestだけを返す。

## 3. resource境界

raw byte 1 MiB、lexical depth 64、JSON node 4,096、schema depth 32、schema node 512、schema property 256を上限とする。
UTF-8は`TextDecoder(..., {fatal:true})`、integerは`Number.isSafeInteger`、finiteは`Number.isFinite`で検証する。

## 4. 非対象

DB table、commit、worker/reviewer model・session、provider固有schema、benchmark、scorecardを追加しない。Issue #227は本PRでcloseせずFR-06へ継続する。
