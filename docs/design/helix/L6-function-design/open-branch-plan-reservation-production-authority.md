---
title: "open branch PLAN reservation production authority L6機能設計"
layer: L6
status: confirmed
plan: docs/plans/PLAN-L7-722-open-branch-plan-reservation-production-authority.md
pair_artifact: docs/test-design/helix/L8-open-branch-plan-reservation-production-authority-unit-test-design.md
---

# open branch PLAN reservation production authority

## 責務

GitHub current main、PR heads、およびassignment kernelのactive writer materialを、既存の
`helix-open-branch-plan-reservation-snapshot.v1`へ一方向変換する。競合、stack inheritance、release、
degraded判定は`projectOpenBranchPlanReservations`だけを意味正本とし、effect adapterへ複製しない。

## 入力境界

- current main: exact HEADとPLAN material exact set。
- PR: number、branch、HEAD、ancestor HEAD、lifecycle、terminal evidence、PLAN material。
- active writer: assignment ID、branch、HEAD、lease、fence token、PLAN material。
- unavailable surface: secretやprovider error本文ではなくstable error digest。

同一branch／同一HEADのopen PRとactive writerは同じ作業の異なる観測面である。同一PLAN blob、owner Issue、
responsibilityが一致する場合だけmirrorとして許可する。HEAD、branch、blob、owner、responsibilityのいずれかが
異なる場合は既存semantic coreが競合としてfail-closeする。

入力schema違反はadapterのprogramming／provider contract violationとして同期例外を返す。production callerは
この例外を成功snapshotとして扱わず、surface unavailableのstable error digestへ変換して同じsemantic coreへ渡す。
本sliceの`OBPRA-AC-001`はこのeffect境界を所有し、raw provider errorや部分snapshotへのfallbackを許可しない。

## 非対象

本sliceはGitHub API pagination、workflow wiring、doctor、DB projectionを実装しない。これらは同じtyped inputと
projection digestを利用する#1256後続sliceで接続し、別の競合counterや判定表を作らない。
