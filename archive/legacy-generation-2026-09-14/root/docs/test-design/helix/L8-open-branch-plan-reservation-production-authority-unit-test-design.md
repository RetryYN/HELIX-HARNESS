---
title: "open branch PLAN reservation production authority L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-01
updated: 2026-09-01
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-722-open-branch-plan-reservation-production-authority.md
pair_artifact: docs/design/helix/L6-function-design/open-branch-plan-reservation-production-authority.md
---

# L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-OBPRA-001 | main／PR／writerをcanonical snapshotへ投影 | mirror観測を競合扱いする | `tests/open-branch-plan-reservation-authority.test.ts` |
| U-OBPRA-002 | unavailableをdegradedへ保持 | local snapshotへfallbackする | `tests/open-branch-plan-reservation-authority.test.ts` |
| U-OBPRA-003 | typed identity | wrong lease／HEAD／unknown fieldを受理する | `tests/open-branch-plan-reservation-authority.test.ts` |
| U-OBPRA-004 | terminal lifecycle | matching evidenceなしでreleaseする | `tests/open-branch-plan-reservation-authority.test.ts` |
| U-OBPIR-009 | open PR／writer mirror | branch／HEADが異なるmirrorを許可する | `tests/open-branch-plan-identity-reservation.test.ts` |

実装oracleは`tests/open-branch-plan-reservation-authority.test.ts`と
`tests/open-branch-plan-identity-reservation.test.ts`に置く。
