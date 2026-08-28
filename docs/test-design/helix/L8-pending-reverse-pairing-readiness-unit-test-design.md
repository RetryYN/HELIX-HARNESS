---
title: "pending Reverse pairing readiness L8単体テスト設計"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: confirmed
created: 2026-08-28
updated: 2026-08-28
owner: QA
plan: docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md
pair_artifact: docs/design/harness/L6-function-design/backfill-pairing.md
---

# pending Reverse pairing readiness L8単体テスト設計

| U-ID | 対象 | 正例 | 反例／mutation | test citation |
|---|---|---|---|---|
| U-BACKFILL-008 | `analyzeBackfill` | `status=draft`かつ`backfill_state=pending_reverse`のcurrent Reverseを、Forward／Reverse双方のexact `references`でpairingする | Forward側欠落、wrong Reverse ID、one-way link、draft/state不一致を`reverseLinkMissing`としてfail-closeする。`backfill_state`条件を除去するmutationを拒否する | `tests/backfill-pairing.test.ts` |

pending Reverseはpair identityだけを成立させ、execution dependencyへ昇格させない。terminal／legacy入力の
`requires`契約を本oracleの成功で相殺しない。
