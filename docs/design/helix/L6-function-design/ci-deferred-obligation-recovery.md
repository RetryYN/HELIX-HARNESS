---
title: CI deferred obligation recovery
layer: L6
kind: function-design
artifact_type: design_doc
status: confirmed
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
parent_requirement: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
plan: docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md
pair_artifact: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md
---

# CI deferred obligation recovery

## 責務

PRで延期した検証義務を、Verification Plan正本と同じ`main`、`nightly`、`release`のexactly one targetと最初のterminal runへ接続する。
schedulerの順序最適化とは分離し、origin PR、candidate HEAD、obligation、selector decision、registry edge、
first detecting oracleを保持する。観測結果は改善候補を生成できるが、要求・registry authorityを直接変更しない。

## 不変条件

- missing、duplicate、expired、cancelled、wrong profile、stale HEAD、wrong originをsuccessへ相殺しない。
- terminal runは完了時刻、run identity、attemptの決定順で最初の1件を選び、複数件自体をfindingにする。
- failureはselector decision、registry edge、first detecting oracleへ`reverse_candidate`として戻す。
- quarantineはowner、期限、replacement oracleが全て有効な場合だけ受理する。
- wall-clock短縮だけでは完了せず、escaped defectとmutation detectionを同時に判定する。
- target identityを独自enumへ再定義せず、Verification Planのdeferred obligationから一方向投影する。
- selector edge削除、risk downgrade、Module closure欠落、test owner誤配線、artifact reuse誤りのexact setを、
  Responsibility Registry、Verification Plan、Scheduler、Recoveryのいずれかで必ずfail-closeする。
- `main`、`nightly`、`release`は同じ回収契約を共有し、profile別の成功で別profileの欠落を相殺しない。

## 境界

本domainはGitHub Actions APIを直接呼ばない。workflow adapterはterminal runをtyped inputへ変換し、projection digestを
journal／receiptへ保存する。publish、要求変更、自動quarantine延長は非対象とする。
