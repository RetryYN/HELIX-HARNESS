---
title: "current-location typed workflow identity境界"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
plan: docs/plans/PLAN-L7-584-current-location-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-current-location-workflow-identity-unit-test-design.md
---

# current-location typed workflow identity境界

## 目的

current-locationが保持している旧 `drive model` を、requirements-owned registryのtyped identityへ
接続する境界を提供する。これは旧fieldを一括改名するPRではなく、後続consumer移行が旧enumを
新しい意味authorityとして再利用しないためのruntime adapterである。

## 契約

- primary identityは`registry_version`、`registry_source_digest`、`target_axis`、`target_id`のtupleとする。
- `Recovery`、`Reverse`など一意に変換できる旧入力は、`legacy_compatibility` sourceとwarningをreceiptへ残して一方向変換する。
- `Forward`、`Scrum`など複数axisへ対応し得る値は`ambiguous`でfail-closeする。
- `OperationVerification`のようにworkflow modelでない値は`unsupported`でfail-closeする。
- typed tupleのversion、digest、axis、IDに不一致があれば`stale`または`unsupported`で閉じる。
- receiptとprimary identityへ旧identityを再出力しない。変換元はprovenanceとしてのみ保持する。

## 非対象

既存のsnapshot全体、CLI全surface、DB legacy列、visualization treeの一括移行は後続atomic sliceで扱う。
この境界がgreenになる前に、旧enumの意味を新registryへ複製しない。
