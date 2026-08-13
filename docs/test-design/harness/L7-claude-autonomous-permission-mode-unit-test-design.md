---
layer: L7
sub_doc: unit-test-design
status: draft
pair_artifact: docs/design/harness/L6-function-design/claude-autonomous-permission-mode.md
plan: docs/plans/PLAN-L7-552-claude-autonomous-permission-mode.md
---

# Claude無人レーンpermission mode単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-ADAPTER-013 | `buildAdapterPlan` | Claude dry-runはpermission flagを持たず、`execute=true`だけが`--permission-mode auto`を固定argvへ追加する。`bypassPermissions`と`--dangerously-skip-permissions`は全経路で不在とする。 | `tests/runtime-adapter.test.ts` |
