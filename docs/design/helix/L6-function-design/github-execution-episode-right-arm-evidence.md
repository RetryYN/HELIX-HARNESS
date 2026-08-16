---
title: "GitHub execution episode right-arm evidence束縛機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md
pair_artifact: docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md
---

# GitHub execution episode right-arm evidence束縛機能設計

## Authority

`github-merge-admission-requirements.md`のGH-FR-023／GH-AC-021を上位authorityとする。
right-arm実行証拠とterminal closure decisionを同じreceiptへ畳み込まない。

## Contract

- `U-GHEPRE-001`: G8〜G12 evidenceをappend-only台帳へ記録し、episode projectionのcurrent HEAD、owner、behavior contract、workflow identityとexact照合する。
- `U-GHEPRE-002`: 別episode、旧HEAD、旧owner、別contract、別registry version／digest／axis／IDを専用binding mismatchで拒否する。
- `U-GHEPRE-003`: 同一`evidence_id`＋同一record digestのretryだけをreplayし、同一ID改変をimmutable conflictとして拒否する。
- `U-GHEPRE-004`: gateをG8〜G12、artifactをrepository-relative canonical POSIX pathへ限定し、absolute／backslash／dot segment／parent traversal／NULを拒否する。
- `U-GHEPRE-005`: schema version、DDL／SQLite object digest、L6/L8 pair、PLAN、G3 freeze digestを同一sliceへ束縛する。

## Transaction boundary

受理前にcurrent episode rowを同じSQLite writer transaction内で再取得し、exact identityを照合してからrecordをappendする。
evidence payloadやcommand自体は保存せず、digestとrepository-relative artifact locatorだけを保持する。

## 非対象

right-arm test runner、evidence生成、terminal closure policy、legacy adapter、#655自走closureは後続責務とする。
