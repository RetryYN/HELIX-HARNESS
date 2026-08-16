---
title: "GitHub execution episode状態機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-576-github-execution-episode-state.md
pair_artifact: docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md
---

# GitHub execution episode状態機能設計

## Authority

要件正本`github-merge-admission-requirements.md`のGH-FR-021／022、GH-AC-019／020を上位authorityとする。
workflow identityとepisode identityを別entityとして保持し、旧`mode`／`model`／route IDからcurrent episodeを合成しない。

## 責務

Node transactional boundaryは、episode event、transactional outbox、current projectionを一transactionでcommitする。
episode reducerはresource identityをimmutableにし、preimage revisionとidempotency keyが一致する正規transitionだけを受理する。
同じidempotency keyの同一payload replayは既存結果を返し、異なるpayloadはconflictとしてfail-closeする。

## Contract

- `U-GHEP-001`: `admitted` eventはopaque `episode_id`、workflow identity tuple、source event ID／digest、owner、behavior contractを必須にする。
- `U-GHEP-002`: state transitionは定義順、exact preimage revision、単調なevent sequenceだけを受理する。
- `U-GHEP-003`: Issue、PLAN、branch、PR、base、HEADは未束縛から一度だけ追加でき、既存値の変更を拒否する。
- `U-GHEP-004`: event、outbox、projectionを単一DB transactionでcommitし、部分writeを残さない。
- `U-GHEP-005`: 同じidempotency key＋同じpayloadのretryをexactly onceとして返し、payload conflictを拒否する。
- `U-GHEP-006`: terminal dispositionは相互排他的で、terminal episodeへの追加transitionを拒否する。
- `U-GHEP-007`: DB replayはevent sequenceからprojectionを再構築し、persisted projectionとのdigest差を拒否する。
- `U-GHEP-008`: schema、L6/L8 pair、PLAN、G3 digestを同一sliceへ束縛する。

## 境界

本sliceはexecution episodeのevent／outbox／projection正本を所有する。GitHub webhookからの自動生成、
`project_current_location`へのepisode projection、right-arm evidence、terminal closure workerは後続の#205 sliceで接続する。
未接続surfaceを実装済みとして扱わない。
