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
episode reducerはactive resource leaseをepisode間で一意にし、HEADだけを同一episode内の新commitへ明示更新できる。
preimage revisionとidempotency keyが一致する正規transitionだけを受理する。
同じidempotency keyの同一payload replayは既存結果を返し、異なるpayloadはconflictとしてfail-closeする。

## Contract

- `U-GHEP-001`: `admitted` eventはopaque `episode_id`、workflow identity tuple、source event ID／digest、owner、behavior contractを必須にする。
- `U-GHEP-002`: state transitionは定義順、exact preimage revision、単調なevent sequenceだけを受理する。
- `U-GHEP-003`: active resourceはepisode間で重複を拒否し、Issue、PLAN、branch、PR、baseは差替えず、HEAD更新をeventへ記録する。
- `U-GHEP-004`: event、outbox、projectionを単一DB transactionでcommitし、部分writeを残さない。
- `U-GHEP-005`: 同じidempotency key＋同じpayloadのretryをexactly onceとして返し、payload conflictを拒否する。
- `U-GHEP-006`: terminalはclosure receipt、main read-after、DB replay digest、lease解放を必須にし、superseded／cancelledはPO decisionも要求する。
- `U-GHEP-007`: DB replayはevent sequenceからprojectionを再構築し、persisted projectionとのdigest差を拒否する。
- `U-GHEP-008`: schema、L6/L8 pair、PLAN、G3 digestを同一sliceへ束縛する。

## 境界

本sliceはexecution episodeのevent／outbox／projection正本を所有する。GitHub webhookからの自動生成、
`project_current_location`へのepisode projection、right-arm evidence、GitHub APIを呼ぶclosure workerは後続の#205 sliceで接続する。
本sliceはworkerが渡すterminal evidenceの検証とlease解放を所有する。
未接続surfaceを実装済みとして扱わない。
