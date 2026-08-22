---
title: "project hook authority pure resolver 機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L7-651-project-hook-authority-resolver.md
parent_design: docs/design/helix/L5-detail/project-hook-authority-schema.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
---

# project hook authority pure resolver 機能設計

`resolveProjectHookAuthority(raw)`はunknown inputだけを受け、strict parse後にphysical identity、root digest、観測HEAD、
candidate/current authority HEAD、観測/current authority三digestを順に比較する。全比較green時だけ
`helix-project-hook-authority-receipt.v1`をcanonical JSON digest付きで返す。

failureはL5正本のprecedenceどおり`schema_invalid`、`unsupported_physical_identity`、
`project_hook_source_stale_or_foreign`、`hook_lifecycle_policy_invalid`の順に評価し、hook execution、dispatch、Git、DB、GitHub writeを
全て0とする。lexical pathはreceipt表示用に保持するがsame判定へ使わない。assignment bindingのroot digestが選択rootと一致しない場合、
session rootやprimary rootへfallbackしない。parserとresolverはclock、filesystem、process、networkを呼ばずinputを変更しない。

`node-stat`はLinux／macOSかつ全rootの`evidence_kind=stat`、`windows-file-id`はWindowsかつ全rootの
`evidence_kind=windows-file-id`に限る。platform、capture source、evidence kindの不可能な組合せをschema greenで相殺しない。
`timeout_ms + child_termination_grace_ms`は`hard_ceiling_ms=60000`以下に限定し、timeoutとgraceを
別々に上限内へ置いて合計60秒超過を作る設定も`hook_lifecycle_policy_invalid`で拒否する。

本sliceのruntime assetは`src/runtime/project-hook-authority.ts`、実行oracleは`tests/project-hook-authority.test.ts`である。
physical capture、unsupported platform、timeout supervisor、terminal payload preservation、4 surface wiringは後続sliceが所有する。

実装oracleのexact declarationはpair先L8 test designを正本とする。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "schema_invalid",
    "unsupported_physical_identity",
    "project_hook_source_stale_or_foreign",
    "hook_lifecycle_policy_invalid"
  ],
  "assets": [
    "src/runtime/project-hook-authority.ts",
    "tests/project-hook-authority.test.ts"
  ],
  "failure_reachability": [
    {
      "failure_code": "schema_invalid",
      "oracle_id": "U-CNWHOOKSCHEMA-001",
      "test_path": "tests/project-hook-authority.test.ts"
    },
    {
      "failure_code": "unsupported_physical_identity",
      "oracle_id": "U-CNWHOOKSCHEMA-003",
      "test_path": "tests/project-hook-authority.test.ts"
    },
    {
      "failure_code": "hook_lifecycle_policy_invalid",
      "oracle_id": "U-CNWHOOKSCHEMA-008",
      "test_path": "tests/project-hook-authority.test.ts"
    },
    {
      "failure_code": "project_hook_source_stale_or_foreign",
      "oracle_id": "U-CNWHOOKSCHEMA-006",
      "test_path": "tests/project-hook-authority.test.ts"
    }
  ]
}
```
