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
typed identityが不正、またはspawn registry providerの実照合が不成立ならsignalを送らずfail-closeする。
PIDだけの一致は再利用後のforeign processを区別できないためauthority証拠にしない。production既定adapterは
identity provider未接続時にfalseを返し、推測でsignalを許可しない。

## 契約

`terminateProjectHookChild({ child, grace_ms, deps })`はchildが既にterminalなら無操作で成功する。
aliveなら`SIGTERM`を一度送り、bounded grace後もaliveの場合だけ`SIGKILL`へ昇格する。SIGTERMとSIGKILLの各signal直前に
spawn identityを再照合し、grace中にPIDが再利用された場合はforeign processへSIGKILLを送らない。各段階でterminalを
実測し、`SIGKILL`後もaliveなら`hook_child_not_terminal`を返して成功へ降格しない。graceは0..60000msである。
signal直前にchildが消えた`ESRCH`はterminalとして受理し、その他のsignal失敗は
`hook_process_signal_failed`として成功へ降格しない。

| oracle | 不変条件 |
|---|---|
| `U-CNWHOOKPROC-001` | terminal childへsignal 0 |
| `U-CNWHOOKPROC-002` | SIGTERMとgraceの順序 |
| `U-CNWHOOKPROC-003` | SIGKILL後terminal再確認 |
| `U-CNWHOOKPROC-004` | non-terminalを成功へ降格しない |
| `U-CNWHOOKPROC-005` | 不正identityで副作用0 |
| `U-CNWHOOKPROC-006` | signal競合と権限失敗の型付き分離 |
| `U-CNWHOOKPROC-007` | 初回またはgrace中のPID再利用／spawn identity不一致で以後のsignal 0 |

本sliceはOS process adapterだけを所有する。SessionStart、doctor、status、dispatch wiring、notification worker、
provider adapterは後続へ残す。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "hook_process_identity_invalid",
    "hook_process_signal_failed",
    "hook_child_not_terminal"
  ],
  "assets": [
    "src/runtime/project-hook-process-adapter.ts",
    "tests/project-hook-process-adapter.test.ts"
  ],
  "failure_reachability": [
    {
      "failure_code": "hook_process_identity_invalid",
      "oracle_id": "U-CNWHOOKPROC-007",
      "test_path": "tests/project-hook-process-adapter.test.ts"
    },
    {
      "failure_code": "hook_process_signal_failed",
      "oracle_id": "U-CNWHOOKPROC-006",
      "test_path": "tests/project-hook-process-adapter.test.ts"
    },
    {
      "failure_code": "hook_child_not_terminal",
      "oracle_id": "U-CNWHOOKPROC-004",
      "test_path": "tests/project-hook-process-adapter.test.ts"
    }
  ]
}
```
