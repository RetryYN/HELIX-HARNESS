---
title: "Cursor v1 run authority機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1707-cursor-v1-run-authority.md
pair_artifact: docs/test-design/helix/L7-cursor-v1-run-authority-unit-test-design.md
related_l3: docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md
github_issue_id: 1707
behavior_contract_id: CURSOR-V1-RUN-AUTHORITY-001
responsibility_owner: cursor-cloud-provider-adapter
---

# Cursor v1 run authority機能設計

## 目的と境界

Cursor Cloud Agentへのfollow-up前後で、v1 run一覧を実行状態の唯一のprovider observationとして分類する。
v0 agent summaryは表示用の参考情報に限定し、dispatch、cancel、回復のauthorityにしない。既存assignment、branch、
single-writer、GitHub admissionを再利用し、Cursor専用scheduler、DB、queueは追加しない。

本sliceは外部HTTP transportやcredential管理を実装しない。provider adapterが取得したv1 run fixtureを純粋関数へ渡し、
既存dispatchが利用する型付きdecisionを返す。

## 型付き分類

`classifyCursorV1Runs`は、provider adapterが単一agentについて取得したrun一覧だけを受け取り、typedな
`agentId`へ束縛する。空agent IDは入力エラーとし、複数agentのrunを混在させない。status、最終更新時刻、
TTL、cancel可否を独立に扱う。

| classification | 条件 | dispatch上の扱い |
| --- | --- | --- |
| `active` | `CREATING`または`RUNNING`かつTTL内 | follow-up拒否 |
| `cancellable_stale` | stale `CREATING`かつcancel可能 | 一意な1件だけcancel候補。cancel後は再GET必須 |
| `phantom` | stale `CREATING`かつcancel不能 | 削除・cancelせず保持。単独では一回のPOSTを妨げない |
| `stale` | stale `RUNNING`（cancel可能と報告されても含む） | 実行中成果の誤破棄を避け、follow-up拒否 |
| `terminal` | `FINISHED`、`FAILED`、`CANCELLED` | dispatch占有から除外し、成果や履歴は削除しない |
| `unknown` | 未知status、不正timestamp | 推測せずfollow-up拒否 |

run ID重複、不正な観測時刻、不正TTLはclassifier入力エラーとする。`sourceAuthority`は常に
`cursor_v1_run_list`であり、v0 statusを入力fieldに持たない。

## Follow-upと回復

`decideCursorFollowUpDispatch`は次を決定する。

1. provider取得不能なら`cursor_cloud_execution`だけを`degraded`にし、Codex laneや共通schedulerを停止しない。
2. fresh active、unknown、cancel不能stale、複数cancel候補があればPOSTしない。cancel不能staleと
   cancel候補が同居する場合もcancel副作用を起こさず拒否する。
3. cancel可能なstale runが一意なら、そのIDだけをcancel候補にし、cancel後のv1再GETまでPOSTしない。
4. active不在ならPOSTを一度だけ許す。phantomはcancel・削除しない。
5. POSTが409なら無条件retryせず、v1 run一覧の再GETへ戻す。
6. POST後は期待run IDが唯一のfresh activeであることをread-afterし、一致しなければ成果を受理しない。

HTTP呼出し、cancel実行、follow-up POST、receipt永続化は既存adapter／assignment側の責務であり、本純粋判定器は
副作用を持たない。外部E2Eは別途、credentialを証拠へ出さず実providerで検証する。
