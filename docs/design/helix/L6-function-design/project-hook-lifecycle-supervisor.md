---
title: "project hook bounded lifecycle supervisor 機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L7-653-project-hook-lifecycle-supervisor.md
parent_design: docs/design/helix/L5-detail/project-hook-authority-schema.md
pair_artifact: docs/test-design/helix/L8-project-hook-lifecycle-supervisor-unit-test-design.md
---

# project hook bounded lifecycle supervisor 機能設計

`superviseProjectHookLifecycle`はoperationとtimeoutをraceし、operationが先ならtimerをcancelしてvalueを返す。timeoutが先なら
AbortSignalを発火し、注入されたchild termination adapterへgraceを渡し、その後parent terminalを確認する。子または親が残っても
`project_hook_lifecycle_timeout`をsuccessへ降格しない。
operation timeoutとは別に開始時からhard-ceiling timerを持ち、child terminationまたはparent terminal確認portが
応答しなくても60秒で`child_terminal:false`／`parent_terminal:false`を返す。cleanup portの自己申告だけでboundedを主張しない。
operation／cleanup promiseがrejectした場合もtimeout timerとhard-ceiling timerを両方cancelしてからerrorをcallerへ戻し、
timer leakで親processを保持しない。

policyはtimeout 1..60000ms、hard ceiling exact 60000ms、grace 0..60000ms、
`timeout + grace <= hard ceiling`、parent terminal required=trueだけを受理する。
terminal resultはresult kind、session ID、candidate HEAD、verdict、comment URLをcanonical digestでsealする。後続hook failure時は
structured cloneを別fieldへ返し、元objectやdigestを変更しない。seal後改変は`terminal_result_mutation_detected`で拒否する。

本sliceはpure orchestrationであり、実process kill、PID capture、notification worker lease、SessionStart／Stop wiringを実装しない。
production既定depsはterminal provider未接続時に親子ともfalseを返し、終端を推測してsuccess evidenceへ昇格しない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "hook_lifecycle_policy_invalid",
    "project_hook_lifecycle_timeout",
    "terminal_result_mutation_detected"
  ],
  "assets": [
    "src/runtime/project-hook-lifecycle.ts",
    "tests/project-hook-lifecycle.test.ts"
  ],
  "failure_reachability": [
    {
      "failure_code": "project_hook_lifecycle_timeout",
      "oracle_id": "U-CNWHOOKLIFE-002",
      "test_path": "tests/project-hook-lifecycle.test.ts"
    },
    {
      "failure_code": "project_hook_lifecycle_timeout",
      "oracle_id": "U-CNWHOOKLIFE-006",
      "test_path": "tests/project-hook-lifecycle.test.ts"
    },
    {
      "failure_code": "hook_lifecycle_policy_invalid",
      "oracle_id": "U-CNWHOOKLIFE-004",
      "test_path": "tests/project-hook-lifecycle.test.ts"
    },
    {
      "failure_code": "terminal_result_mutation_detected",
      "oracle_id": "U-CNWHOOKLIFE-004",
      "test_path": "tests/project-hook-lifecycle.test.ts"
    }
  ]
}
```
