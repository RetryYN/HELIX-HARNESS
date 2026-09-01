---
title: "GitHub open branch PLAN reservation provider L6機能設計"
layer: L6
status: draft
plan: docs/plans/PLAN-L7-723-github-open-branch-plan-reservation-provider.md
pair_artifact: docs/test-design/helix/L8-github-open-branch-plan-reservation-provider-unit-test-design.md
---

# GitHub open branch PLAN reservation provider

## 責務

GitHubのcurrent mainとopen PR全件をeffect境界で取得し、
`OpenBranchPlanReservationAuthorityInput`の`current_main`／`open_pr_heads`だけを生成する。
競合、stack inheritance、release、reservation countは既存production authorityとsemantic coreの責務であり、
このproviderへ複製しない。

## 取得契約

- main refはPLAN tree取得の前後で同一exact HEADでなければならない。
- recursive treeが`truncated`なら部分PLAN集合を受理しない。
- PLAN blobはbase64、frontmatter、pathと`plan_id`、positive owner Issue、stable responsibilityを検証する。
- open PR一覧とcommit一覧は100件単位で終端pageまで取得し、上限100 pageを超えたら拒否する。
- PR detail read-afterでbranch／HEADを照合し、open集合を再取得してexact setを照合する。
- 一覧取得後にclose／mergeされたPRはterminal evidenceへ変換し、消失をlocal greenへ解釈しない。

取得不能、provider schema違反、raceはraw errorを外へ流さず、surface名とstable reasonから作るdigestを伴う
`unavailable`へ閉じる。credential、response body、絶対pathはdigest materialへ含めない。

## 非対象

assignment active writer取得、PR preflight、doctor、DB projection／replay、semantic conflict判定は後続sliceで扱う。
