---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-19-plan-schedule-lint.md
---

> **L6 contract marker**: `analyzePlanSchedule(input: PlanScheduleInput) => PlanScheduleResult` は unit-test 粒度の contract。DbC pre/post/invariant は Step の並列/直列と review step 要件を U-PLANSCH-001..003 へ対応づける。

# plan-schedule lint — 機能設計 (IMP-081)

## §1 範囲

これは §1.10.G.4 enforcement の最小 slice である。full PLAN lint engine は実装せず、PLAN §工程表が明示的な step serialization metadata と review step を持つことだけを検査する。

## §2 関数

| 関数 | contract |
|---|---|
| `extractScheduleSection(content)` | PLAN body から §工程表 section を抽出する。 |
| `analyzePlanSchedule(docs)` | 各 `### Step N:` heading に `[並列]` または `[直列]` があることを検査し、`[直列]` block では `file_conflict`、`downstream_dependency`、`shared_state` のいずれかを要求する。review step heading と `§3.1 実装計画` も必須にする。 |
| `loadPlanScheduleDocs(repoRoot, target?)` | 1 件の PLAN、または全 `docs/plans/PLAN-*.md` を load する。 |
| `planScheduleMessages(result)` | OK / violation message を出力する。 |
| `lintPlan(path?, repoRoot?)` | CLI-facing wrapper。path 指定時は 1 PLAN、未指定時は全 PLAN を lint する。 |

## §3 Doctor 挙動

`ut-tdd plan lint` は violation 時に `ok=false` を返す。Doctor は `plan-schedule` を hard/fail-close gate として含め、`planSchedule.ok` を `runDoctor.ok` へ接続するため、PLAN schedule drift は `ut-tdd plan lint` と `ut-tdd doctor` の両方を block する。

## §4 Test oracle 設計

Covered by `tests/plan-lint.test.ts`:

| ID | oracle |
|---|---|
| U-PLANSCH-001 | §工程表 extraction |
| U-PLANSCH-002 | compliant PLAN -> ok |
| U-PLANSCH-003 | missing `[並列]` / `[直列]` -> violation |
| U-PLANSCH-004 | `[直列]` without allowed reason -> violation |
| U-PLANSCH-005 | review step heading 欠落 -> violation |
| U-PLANSCH-006 | missing `§3.1 実装計画` -> violation |
