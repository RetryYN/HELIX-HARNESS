---
layer: L5
sub_doc: detailed-design
status: draft
pair_artifact: docs/test-design/helix/L8-claude-autonomous-permission-mode-unit-test-design.md
plan: docs/plans/PLAN-L7-552-claude-autonomous-permission-mode.md
---

# Claude無人レーンpermission mode詳細設計

| 関数 | 事前条件 | 事後条件 |
|---|---|---|
| `buildAdapterPlan` | `provider=claude` かつ HELIX wrapper の `execute=true` | headless Claudeを`--permission-mode auto`で起動し、通常のrepo内作業を許可待ちへ落とさない。dry-run argvは変更せず、`bypassPermissions`と`--dangerously-skip-permissions`を生成しない。Claudeのsoft/hard safety boundaryとrepo hooksを維持する。 |

## 設計実在性束縛

permission modeは既存adapter argvのpolicyであり、追加runtime assetや新failure codeを持たない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
