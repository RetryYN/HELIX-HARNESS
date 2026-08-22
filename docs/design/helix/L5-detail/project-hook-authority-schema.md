---
title: "project hook authority typed contract 詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L5-103-project-hook-authority-schema.md
parent_design: docs/design/helix/L4-basic-design/project-hook-authority-boundary.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-schema-unit-test-design.md
---

# project hook authority typed contract 詳細設計

## 1. root contract

current入力schemaは`helix-project-hook-authority-input.v1`である。root exact setは`schema_version`、`execution_root`、
`loader_root`、`session_project_root`、`assignment_binding`、`candidate_base_head`、`current_authority_head`、
`source_material`、`current_authority_source_material`、`physical_evidence`、`lifecycle_policy`の11 fieldとする。unknown／欠落／型違反を拒否し、cwd、環境変数、
primary shared tree、Git remote、provider名から補完しない。parserはpureでinputを変更せず、Git／filesystem／processへ触れない。

## 2. physical repository identity

各rootは`lexical_path`、`canonical_realpath`、`repository_common_dir`、`filesystem_identity`を持つ。
`filesystem_identity`は`platform`、`device_id`、`file_id`、`evidence_kind`のexact setで、値を取得できないplatformは
`unsupported_physical_identity`を返す。unknownをsameへ推測しない。same identityはrealpath、common dir、device/file identityの
全一致でのみ成立し、lexical path一致は判定材料にしない。

## 3. source materialとassignment binding

`source_material`は`hooks_config_digest`、`agent_guard_digest`、`worker_policy_digest`のexact setで、全digestを
`sha256:<64 lowercase hex>`とする。`.claude/settings.json` digestをこのobjectへ入れず、cross-runtime conformanceは別receiptとする。
`current_authority_source_material`は同じexact schemaを持つ比較専用入力であり、観測値と期待値を同じobjectへ上書きしない。

`assignment_binding`はdiscriminated unionである。

| kind | exact fields | authority |
|---|---|---|
| `session` | `kind`、`session_project_root_digest` | 明示session rootだけ |
| `assignment` | `kind`、`assignment_id`、`assignment_root_digest`、`branch`、`lease_id`、`fence_token` | assignment rootだけ |

assignment指定時にsession／primary rootへfallbackしない。root、HEAD、観測三digestとcurrent authority三digestの不一致は
`project_hook_source_stale_or_foreign`とし、repair actionをresultへ含めない。

## 4. success receiptとsurface projection

成功schema`helix-project-hook-authority-receipt.v1`のexact setは`schema_version`、`authority_kind`、
`physical_repository_identity`、`authority_root`、`repository_head`、`source_identity`、`assignment_binding`、
`captured_at`、`receipt_digest`である。`captured_at`はcaller注入UTC RFC 3339としwall clockで補完しない。
SessionStart／doctor／status／dispatchは同じreceipt bytesまたは同じfailure bytesを投影し、field追加、欠落、再計算をしない。

## 5. lifecycle policyとterminal payload

`lifecycle_policy`のexact setは`timeout_ms`、`hard_ceiling_ms`、`child_termination_grace_ms`、
`parent_terminal_required`、`notification_handoff`である。既定は15000ms、hard ceilingは60000msで、0以下、ceiling超過、
期限なし、`parent_terminal_required:false`を`hook_lifecycle_policy_invalid`で拒否する。

timeout failureは`project_hook_lifecycle_timeout`、`hook_kind`、`deadline_ms`、`execution_root_digest`、
`loader_root_digest`、`source_identity_digest`、`child_terminal`、`parent_terminal`を保持する。親または子がterminalでなければ
成功へ降格しない。`notification_handoff`は`disabled`または`bounded_worker`で、後者はworker ID、lease ID、TTL、payload digestを必須とする。

terminal result preservation objectは`result_kind`、`session_id`、`candidate_head`、`verdict`、`comment_url`、
`result_digest`のexact setである。後続hook failureはobject bytesを変更せず、failureと別fieldで返す。null comment URLは許容するが、
存在しないplaceholderへ変換しない。

## 6. failure contract

failure schemaは`schema_version`、`code`、`json_pointer`、`detail_digest`、`side_effects`、
`preserved_terminal_result`のexact setを持つ。code順は`schema_invalid`、`unsupported_physical_identity`、
`project_hook_source_stale_or_foreign`、`hook_lifecycle_policy_invalid`、`project_hook_lifecycle_timeout`、
`terminal_result_mutation_detected`である。`side_effects`はhook execution、dispatch、Git、DB、GitHub writeの全て0を保持する。

## 7. L8 pairと後続境界

`U-CNWHOOKSCHEMA-001..012`がroot strictness、physical identity、source digest、assignment union、receipt equality、deadline、
process terminal、notification handoff、terminal payload、failure順、immutabilityを反証する。L6/L7はparser、resolver、physical adapter、
supervisor、4 surface wiringを実装する。本設計はNotification Fabric、provider adapter、scheduler、foreign tree修復を実装しない。

## 8. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
