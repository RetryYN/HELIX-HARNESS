---
title: "project hook OS process termination adapter 機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L7-654-project-hook-process-adapter.md
parent_design: docs/design/helix/L5-detail/project-hook-authority-schema.md
pair_artifact: docs/test-design/helix/L8-project-hook-process-adapter-unit-test-design.md
---

# project hook OS process termination adapter 機能設計

## 責務

bounded lifecycle supervisorがtimeoutを確定した後、spawn時に捕捉済みのchild PIDだけを停止する。
process名検索、shell、process treeの推測、foreign processの探索を行わない。PID、spawn時刻、command digestの
typed identityが不正ならsignalを送らずfail-closeする。

## 契約

`terminateProjectHookChild({ child, grace_ms, deps })`はchildが既にterminalなら無操作で成功する。
aliveなら`SIGTERM`を一度送り、bounded grace後もaliveの場合だけ`SIGKILL`へ昇格する。各段階でterminalを
実測し、`SIGKILL`後もaliveなら`hook_child_not_terminal`を返して成功へ降格しない。graceは0..60000msである。

| oracle | 不変条件 |
|---|---|
| `U-CNWHOOKPROC-001` | terminal childへsignal 0 |
| `U-CNWHOOKPROC-002` | SIGTERMとgraceの順序 |
| `U-CNWHOOKPROC-003` | SIGKILL後terminal再確認 |
| `U-CNWHOOKPROC-004` | non-terminalを成功へ降格しない |
| `U-CNWHOOKPROC-005` | 不正identityで副作用0 |

本sliceはOS process adapterだけを所有する。SessionStart、doctor、status、dispatch wiring、notification worker、
provider adapterは後続へ残す。
