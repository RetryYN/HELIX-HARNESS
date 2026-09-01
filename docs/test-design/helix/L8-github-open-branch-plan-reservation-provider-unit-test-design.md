---
title: "GitHub open branch PLAN reservation provider L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-01
updated: 2026-09-01
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-723-github-open-branch-plan-reservation-provider.md
pair_artifact: docs/design/helix/L6-function-design/github-open-branch-plan-reservation-provider.md
---

# L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-OBPRGH-001 | main／open PR material | exact HEAD、ancestor、PLAN material、二重readを欠く | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-002 | open PR exact-set read-after | 一覧raceをavailableとして受理する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-003 | main ref／tree完全性 | ref raceまたはtruncated treeをlocal greenへ縮退する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-004 | pagination／identity | 終端pageを読まない、または重複PRを受理する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-005 | terminal lifecycle | list後のmerge／closeを証拠なしで消失させる | `tests/github-open-branch-plan-reservation-provider.test.ts` |

mutationはopen PR exact-set比較を除去し、U-OBPRGH-002が退行を捕捉することを実測する。
