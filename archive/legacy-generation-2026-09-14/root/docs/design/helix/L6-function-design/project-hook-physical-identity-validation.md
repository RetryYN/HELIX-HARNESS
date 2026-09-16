---
title: "project hook physical identity validation 機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
plan: docs/plans/PLAN-L7-664-project-hook-physical-identity-validation.md
parent_design: docs/design/helix/L6-function-design/project-hook-physical-adapter.md
pair_artifact: docs/test-design/helix/L8-project-hook-physical-identity-validation-unit-test-design.md
---

# project hook physical identity validation 機能設計

`repositoryIdentity` はNode `stat`のdevice／inodeを文字列化する前に、providerの実値が物理識別子として
利用可能かを検証する。未知の型、非有限数、非整数、安全に表現できないnumber、負値、inode `0`は
`UnsupportedPhysicalIdentityError(code=unsupported_physical_identity)`へfail-closeする。

device `0`は環境によって有効な値になり得るため許可するが、inodeはregular directoryの識別子として
正値を要求する。`0/0`、`undefined`、負値などの退化入力を `String()` の結果だけで受理しない。

本sliceは既存のLinux／macOS adapterのstat入力検証だけを所有し、Windows file ID provider、schema変更、
surface wiringは後続Issueの責務とする。

受入条件は、U-CNWHOOKPHYS-001..006を維持したまま、U-CNWHOOKPHYS-007で退化値・型外値が個別に拒否され、
検証分岐を除去したmutationが同テストをgreenにできないことである。
