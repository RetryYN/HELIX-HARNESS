---
title: "GitHub CI status exact HEAD／workflow束縛"
layer: L6
status: draft
created: 2026-09-08
updated: 2026-09-08
parent_plan: docs/plans/PLAN-RECOVERY-1659-ci-status-head-binding.md
pair_artifact: docs/test-design/helix/L8-github-ci-status-head-binding-unit-test-design.md
---

# GitHub CI status exact HEAD／workflow束縛

## 責務

`helix github ci-status`の判定入力を、branch名ではなく完全なcandidate HEAD SHAとworkflow identityへ束縛する。
branch指定のrun一覧は取得windowにすぎず、判定authorityとして扱わない。

## 入出力

- 入力: `ref`、40桁lowercase SHAの`expectedHeadSha`、非空の`targetWorkflow`、GitHub run一覧。
- 選択: `headSha` exact一致かつworkflow名／workflow file identity一致のrunだけを残す。
- 出力: `green | red | pending | no_runs | window_miss | unavailable`と、実際に選択したrun集合。

## 不変条件

- 別HEADの成功でcandidateをgreenにしない。
- 別HEADまたは別workflowの失敗でcandidateをredにしない。
- candidate HEAD／target workflowのfailureまたはcancelledはredにする。
- 空queryと、取得windowに対象pairが無い状態を区別する。
- SHAまたはworkflow identityが不正なら推測せずunavailableにする。

## 失敗到達性

| 失敗種別 | 到達条件 | 扱い |
|---|---|---|
| `invalid_expected_head` | 完全なlowercase 40桁SHAでない | unavailable |
| `target_workflow_missing` | workflow identityが空 | unavailable |
| `no_runs` | query成功かつrun集合が空 | no_runs |
| `window_miss` | runはあるがexact pairが無い | window_miss |
| `current_failure` | exact pairにfailure/cancelledがある | red |

CLIは`--expected-head-sha`を判定器へ渡し、`green`かつ`ok=true`のときだけexit 0を返す。

## 検証oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GHCI-001 | HEAD束縛 | 旧HEAD successだけなら`window_miss`／`ok=false` | `tests/github-merge-readiness.test.ts` |
| U-GHCI-002 | HEAD分離 | current successと旧HEAD failureの共存はcurrentだけで`green` | `tests/github-merge-readiness.test.ts` |
| U-GHCI-003 | workflow分離 | target successと別workflow failureの共存はtargetだけで`green` | `tests/github-merge-readiness.test.ts` |
| U-GHCI-004 | windowとfailure | exact pair不在は`window_miss`、current failureは`red` | `tests/github-merge-readiness.test.ts` |
| U-GHCI-005 | CLI fail-close配線 | 実CLI入口の`window_miss`はexit 1 | `tests/cli-surface.test.ts` |
| U-GHCI-006 | CLI exact HEAD配線 | 実CLI入口が`--expected-head-sha`を判定器へ渡し、該当runを`green`にする | `tests/cli-surface.test.ts` |
