---
title: "open branch PLAN identity reservation L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md
pair_artifact: docs/design/helix/L6-function-design/open-branch-plan-identity-reservation.md
---

# open branch PLAN identity reservation L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-OBPIR-001 | projection | main／open PR／active writerを同じprojectionへ束縛し、一意予約をadmit | `tests/open-branch-plan-identity-reservation.test.ts` |
| U-OBPIR-002 | conflict | #1240/#1247型706、#1241/#1254型707の異責務同番号を個別fail-close | `tests/open-branch-plan-identity-reservation.test.ts` |
| U-OBPIR-003 | stack inheritance | ancestor＋同一blob／identity／owner／responsibilityだけpassし、責務差替えを拒否 | `tests/open-branch-plan-identity-reservation.test.ts` |
| U-OBPIR-004 | family | Forward／Reverseの同番号を別familyとして保持 | `tests/open-branch-plan-identity-reservation.test.ts` |
| U-OBPIR-005 | release | merged／closed／staleを一致terminal evidenceがある場合だけ解放 | `tests/open-branch-plan-identity-reservation.test.ts` |
| U-OBPIR-006 | unavailable | GitHubまたはwriter evidence取得不能を`degraded`かつ`ok=false`へ固定 | `tests/open-branch-plan-identity-reservation.test.ts` |
| U-OBPIR-007 | replay／race | at-least-once重複をdedupeし、unknown fieldとterminal evidence欠落を拒否 | `tests/open-branch-plan-identity-reservation.test.ts` |
| U-OBPIR-008 | precedence／completeness | conflictをunavailableより優先し、availableなcurrent mainのreservation欠落を拒否 | `tests/open-branch-plan-identity-reservation.test.ts` |

mutation oracleは、number conflict判定、ancestry条件、terminal evidence条件、unavailable優先、dedupeの各guardを一件ずつ
除去し、U-OBPIR-002／003／005／006／007が個別にredとなることを要求する。
