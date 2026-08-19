---
title: "physical filesystem identity機能設計"
layer: L6
artifact_type: function-design
status: confirmed
created: 2026-08-19
updated: 2026-08-19
owner: Codex / TL
authority: docs/design/helix/L3-requirements/security-capability-broker-authority.md
plan: docs/plans/PLAN-L7-601-physical-filesystem-identity.md
pair_artifact: docs/test-design/helix/L8-physical-filesystem-identity-unit-test-design.md
github_issue_id: 679
behavior_contract_id: SECURITY-CAPABILITY-BROKER-PHYSICAL-IDENTITY-001
responsibility_owner: security-capability-broker
---

# physical filesystem identity機能設計

## 1. 責務境界

本機能は、実行前のrepo-relative literal targetを物理同一性へ束縛するvalue objectを提供する。
operation capability、execution provenance、data／sink、approval、外部applyは後続sliceの責務であり、
本機能が許可済み実行を意味することはない。判定不能は成功へ丸めず、typed failureとして返す。

## 2. 公開契約

| API | 入力 | 成功条件 | 失敗条件 |
|---|---|---|---|
| `attestPhysicalFilesystemIdentity` | repo root、literal target集合、期待件数 | exact target集合、realpath、file type、device/inode、metadata digest、mount境界を同時に固定 | absolute／traversal／glob／duplicate、symlink／junction、repo外、mount、hardlink、special file、TOCTOU |
| `revalidatePhysicalFilesystemIdentity` | 同一request、repository-owned binding | 実行直前のrepo root・target set・identity digestが初回と一致 | binding不在またはdigest drift |
| `isPhysicalFilesystemIdentityBinding` | unknown | 同一processで発行したbindingだけを受理 | plain copy、偽造object、別binding |

receiptにはrepoの絶対path、targetの内容、secret、PIIを保存しない。入力順に依存するdigestを作らず、
canonical JSONと既存`src/runtime/digest.ts`の`sha256Digest`だけを使う。

## 3. 判定順序

1. target count、literal path、repo-relative境界、duplicateを検査する。
2. repo rootのphysical identityとmount情報を検証する。mountを検証できない環境はfail-closeする。
3. 各targetのancestor／final link、realpath、file type、device/inode、hardlinkを検証する。
4. open後の`fstat`と`/proc/self/fd`を再照合し、判定中の置換をidentity driftとして拒否する。
5. exact memberをbytewise順でdigest化し、repository-owned bindingとreceiptを返す。

legacy guardのgreenはこの判定を代替しない。bindingを受け取る後続brokerは実行直前に必ず
`revalidatePhysicalFilesystemIdentity`を呼び、再検証なしにhost操作へ進めてはならない。
