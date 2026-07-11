---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-67-development-ci-bounded-time.md
---

> **L6 contract marker**: `verifyDevelopmentCiBoundedTime(workflow) => findings[]` は開発repositoryの
> required `harness-check` を対象とするunit-test粒度の契約。pre: workflow YAMLを構文解析できる。
> post: job上限20分、全回帰step上限15分、step上限 < job上限、fail-open指定なしの場合だけ合格する。

# 開発CI bounded-time機能設計

## 1. 目的と境界

必須checkがrunner異常、open handle、依存先停止で無期限に占有される状態を排除し、失敗原因を
GitHub Actionsのtimeout結果として有限時間内に確定する。本契約は開発正本
`.github/workflows/harness-check.yml`だけを対象とし、consumer templateの実行予算は変更しない。

## 2. 契約

| 契約 | 事前条件 | 事後条件 | 不変条件 |
|---|---|---|---|
| required job | `jobs.harness-check`が存在 | `timeout-minutes: 20` | timeoutは成功へ変換されない |
| 全回帰step | `test — 全回帰 (vitest run)`が存在 | `timeout-minutes: 15`かつjob上限未満 | commandは`bun run test` |
| fail-close | jobとstepを構文解析 | `continue-on-error: true`が双方に無い | lint、DB refresh、doctorは同じbounded job内 |

## 3. Vペア

- 右腕正本: `docs/test-design/harness/L8-unit-test-design.md`
- 実装oracle: `tests/harness-check-workflow.test.ts`
- case: `U-CITIME-001..003`
