---
title: "GitHub PLAN予約 bounded fetch L6機能設計"
layer: L6
status: confirmed
plan: docs/plans/PLAN-L7-726-github-plan-reservation-bounded-fetch.md
pair_artifact: docs/test-design/helix/L8-github-plan-reservation-bounded-fetch-unit-test-design.md
---

# GitHub PLAN予約 bounded fetch

## 責務

Issue #1331 は、既存の GitHub PLAN reservation provider が持つ effect 取得だけを bounded にする。
reservation conflict、stack inheritance、release、assignment、semantic core の判断は実装しない。
既存の `OpenBranchPlanReservationAuthorityInput` へ渡す `material` と、取得を監査する `receipt` を分離する。

`loadGithubOpenBranchPlanReservationMaterial` は従来どおり material-only facade として残す。
新しい `loadGithubOpenBranchPlanReservationMaterialWithReceipt` は `{ material, receipt, next_cache }` を返す。
receipt を authority input へ混ぜないことで、既存 projection の strict schema と effect budget 証跡を結合しない。

## bounded 取得契約

1. `main` ref を読み、commit HEAD を確定する。
2. recursive tree の全体性、tree entry の件数 threshold、PLAN path の exact な `blob` identity を検証する。
3. tree の PLAN entry を path 順の exact set にし、source は blob SHAだけでdedupeする。path依存のPLAN identityは各pathで再検証してmaterializeする。
4. cache miss だけを `max_plan_batch` 件ずつ順に取得する。batch を途中で公開せず、missing exact set 全体が揃わなければ surface を unavailable にする。
5. PLAN blob の base64、frontmatter、path／`plan_id`、owner Issue、responsibility、source digest を既存 provider と同じ境界で検証する。
6. main tree の前後で ref HEAD を再読し、変更があれば `github_reservation_main_head_race` として fail-close する。
7. open PR list／commit list は page 終端まで読むが、page、PR、commit、API call の各上限を超えたら追加取得しない。
8. PR detail の branch／HEAD、open PR exact set を read-after し、close／merge は terminal evidence を伴う場合だけ保持する。

tree response の `sha` を必須にし、HEADごとのcache captureにあるtree SHAとexact一致させる。
PLAN path が `tree` entry として返る、duplicate path、truncated／不明 tree、archive tree SHA 不一致は、blob を推測せず
`github_reservation_archive_tree_mismatch` または typed unavailable へ閉じる。

## budget と receipt

default budget は、実 repository の local HEAD で観測した 1,118 PLAN 規模を収容し、過剰な API 消費を止める値に固定する。
caller は部分 override を指定できる。

| budget | default | 対象 |
|---|---:|---|
| `max_api_calls` | 4,096 | GitHub API effect の総 call 数 |
| `max_process_ms` | 30,000 | provider process の総 elapsed time。default `gh api` child にも timeout を渡す |
| `max_rate_limit_cost` | 4,096 | response headerを持たないadapterで使うrequest-cost上限。実GitHub残量とは称さない |
| `max_tree_entries` | 100,000 | recursive tree の全 entry 数 |
| `max_plan_entries` | 2,048 | 1 tree 内の PLAN entry 数 |
| `max_changed_plan_entries` | 4,096 | capture 中の cache miss exact set 数 |
| `max_plan_batch` | 128 | 一度に materialize する cache miss batch 数 |
| `max_pages` | 100 | list／commit pagination の page 数 |
| `max_open_pull_requests` | 256 | open PR list の件数 |
| `max_commits_per_pull_request` | 10,000 | 1 PR の commit 件数 |

receipt schema は `github-plan-reservation-fetch-receipt.v1` とする。少なくとも次を記録する。

- `budget.api_calls`、`budget.process_ms`、`budget.request_cost` の `used`／`max`／`limit`
- tree／PLAN／changed PLAN、cache hit、blob fetch、batch の観測値
- HEAD／tree SHA／`captured_at`／read-after HEADを束縛したcapture exact set
- current main／open PR surface の available／unavailable
- raw endpoint、response body、認証値、絶対 path を含まない stable `failure_codes`

各上限は call 前に予約し、process は call 前後と最終 material 化後に検査する。超過後の追加 call は 0 とし、既に得た
部分 PLAN 集合を available として返さない。rate-limit error は response body を receipt に写さず、
`github_reservation_rate_limit_exhausted` へ正規化する。

## cache 契約

caller cache は `github-plan-reservation-material-cache.v1`、`status: complete | partial`、blob SHA keyed sourceと
HEAD keyed captureを持つ。captureはHEAD／tree SHA／`captured_at`／read-after HEADへ束縛する。`partial` はcapture前に拒否し、
source digest不一致、stale tree、read-after不一致を拒否する。入力cacheをmutateせず、両surface成功時だけ`next_cache`を返す。

cache は GitHub tree の代替 authority ではない。現在の treeが示すblob SHAと、同一HEADのcapture tree SHAが一致するsourceだけを利用する。これにより stale HEAD、別 archive、path の取り違えを
local green として扱わない。

## 非対象

PR preflight、doctor、harness DB、assignment kernel、active writer、GitHub PR／merge／Issue close、reservation semantic
判定はこの slice に含めない。これらは同じ typed material を利用する後続 slice の責務とする。
