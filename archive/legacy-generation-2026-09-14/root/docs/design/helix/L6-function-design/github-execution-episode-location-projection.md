---
title: "GitHub execution episode current-location投影機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md
pair_artifact: docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md
---

# GitHub execution episode current-location投影機能設計

## Authority

`github-merge-admission-requirements.md`のGH-FR-021／GH-AC-019を上位authorityとする。
単一global current-locationと複数episode locationの多重度を混同しない。

## Contract

- `U-GHEPL-001`: episode current projectionと同じtransactionで、episode別locationを`episode_id`主キーへupsertする。global snapshot未生成時は`uninitialized` bootstrap rowも同一transactionで生成する。
- `U-GHEPL-002`: workflow registry version／digest／axis／ID、state、HEAD、owner、behavior contract、last event digestをexact投影する。
- `U-GHEPL-003`: HEAD更新とoutbox ACKをlocationへ追従させ、stale revision／event digestを残さない。
- `U-GHEPL-004`: 複数active episodeを全件保持し、代表episodeを順序・時刻・branch名から推測しない。
- `U-GHEPL-005`: terminal episodeをdisposition付きで保持し、active／terminal件数、episode set digest、再導出したsnapshot hashをglobal snapshotへ集約する。
- `U-GHEPL-006`: legacy mode／model／旧route identityをepisode locationへ再出力しない。
- `U-GHEPL-007`: episode／locationの全投影fieldと、aggregate／global snapshot／snapshot hashのdriftを専用verifierでfail-closeする。
- `U-GHEPL-008`: schema、L6/L8 pair、PLAN、G3 digestを同一sliceへ束縛する。

## トランザクション境界

episode transition／outbox ACKのNode transactional boundaryがlocation rowも同一transactionで更新する。
`project-current-location:latest`が未生成なら他fieldを推測せず、空文字／0と`current_status=uninitialized`からなるcanonical bootstrap rowを同一transactionで生成する。
global snapshotのepisode aggregateは全location rowを`episode_id`昇順でcanonical化して計算し、単一episode選択fieldを持たない。

## 非対象

right-arm evidence admission、GitHub API closure worker、legacy adapterは後続の#205原子的sliceへ分離する。
