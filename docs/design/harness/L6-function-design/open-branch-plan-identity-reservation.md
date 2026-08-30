---
title: "open branch PLAN identity reservation機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
plan: docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md
pair_artifact: docs/test-design/helix/L8-open-branch-plan-identity-reservation-unit-test-design.md
---

# open branch PLAN identity reservation機能設計

## 1. 責務境界

`projectOpenBranchPlanReservations`は、current main、open PR head、active assignment／writer branchから取得した
typed evidenceを一つのread-only reservation projectionへ正規化する。既存`plan-number-uniqueness`のlocal
`docs/plans`検査を置換せず、merge前のcross-branch競合だけを補完する。自動採番、branch cleanup、GitHub／DB writeは行わない。

## 2. reservation identity

各reservationはstable `plan_id`、PLAN family＋number、owner Issue、responsibility owner、PLAN path／blob digest、branch、
candidate HEAD、ancestor HEAD exact setを持つ。active writerはassignment ID、lease ID、fence tokenも必須とする。

同一`plan_id`または同じfamily＋numberを別責務が同時に予約した場合はfail-closeする。stack inheritanceは、一方のHEADが
他方のancestorであり、plan ID、blob digest、owner Issue、responsibility ownerがすべて同一の場合だけpassする。
Forwardの`PLAN-L7-N`とReverseの`PLAN-REVERSE-N`は別familyとして判定する。

## 3. lifecycleとfailure

main/current、PR/open、writer/activeだけをactive reservationとする。merged／closed／stale／superseded／abandonedは、
lifecycleと一致するterminal evidenceの時刻・digestがある場合だけ解放する。terminal evidence欠落やraceはschema invalidで拒否する。
at-least-onceで同一reservationが重複してもcanonical identityで一件へ集約する。

current main、open PR heads、active writer branchesの三surfaceをすべてavailableにできた場合だけ`admitted`を返す。
一つでも取得不能ならlocal結果へfallbackせず`degraded`、競合またはevidence不正なら`blocked`とし、どちらも`ok=false`とする。

## 4. effect port

GitHub API／assignment kernelからの取得はeffect adapterが行い、本projectionにはstrict snapshotだけを渡す。provider名や
branch名をPLAN authorityにせず、GitHub取得失敗は`error_digest`だけを保持する。PR preflight／doctor／DB replayは同じprojection
resultをconsumerとし、別counterや別競合規則を実装しない。

## 5. oracle binding

| oracle | 契約 | test citation |
|---|---|---|
| `U-OBPIR-001` | 三surface projection | `tests/open-branch-plan-identity-reservation.test.ts` |
| `U-OBPIR-002` | 異責務同一identity／number競合 | `tests/open-branch-plan-identity-reservation.test.ts` |
| `U-OBPIR-003` | stack inheritance exact条件 | `tests/open-branch-plan-identity-reservation.test.ts` |
| `U-OBPIR-004` | PLAN family分離 | `tests/open-branch-plan-identity-reservation.test.ts` |
| `U-OBPIR-005` | terminal evidence release | `tests/open-branch-plan-identity-reservation.test.ts` |
| `U-OBPIR-006` | unavailable degraded | `tests/open-branch-plan-identity-reservation.test.ts` |
| `U-OBPIR-007` | replay dedupe／schema race拒否 | `tests/open-branch-plan-identity-reservation.test.ts` |
| `U-OBPIR-008` | conflict precedence／main completeness | `tests/open-branch-plan-identity-reservation.test.ts` |
