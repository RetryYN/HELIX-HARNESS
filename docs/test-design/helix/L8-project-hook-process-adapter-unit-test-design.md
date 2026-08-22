---
title: "project hook OS process termination adapter 単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test-design
sub_doc: unit-test-design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L7-654-project-hook-process-adapter.md
pair_artifact: docs/design/helix/L6-function-design/project-hook-process-adapter.md
---

# project hook OS process termination adapter 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CNWHOOKPROC-001 | terminal child | terminal childへsignalまたはwaitを行えばred | `tests/project-hook-process-adapter.test.ts` |
| U-CNWHOOKPROC-002 | graceful termination | SIGTERMなし、またはgrace前にSIGKILLすればred | `tests/project-hook-process-adapter.test.ts` |
| U-CNWHOOKPROC-003 | forced termination | grace後aliveなのにSIGKILLしない、または再確認しなければred | `tests/project-hook-process-adapter.test.ts` |
| U-CNWHOOKPROC-004 | terminal failure | SIGKILL後aliveを成功へ降格すればred | `tests/project-hook-process-adapter.test.ts` |
| U-CNWHOOKPROC-005 | input validation | PID／時刻／digest／grace不正時にsignalまたはwaitすればred | `tests/project-hook-process-adapter.test.ts` |
| U-CNWHOOKPROC-006 | signal race | ESRCHを失敗にする、またはEPERM等を成功へ降格すればred | `tests/project-hook-process-adapter.test.ts` |
| U-CNWHOOKPROC-007 | spawn identity | 初回、isAlive後のSIGTERM直前、grace後のSIGKILL直前にPIDだけ一致する再利用processを許可する、またはidentity不一致後も次のsignalを送ればred | `tests/project-hook-process-adapter.test.ts` |
