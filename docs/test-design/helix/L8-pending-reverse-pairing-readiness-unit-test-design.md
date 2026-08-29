---
title: "pending Reverse pairing readiness単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
authority: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md
plan: docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md
pair_artifact: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md
---

# pending Reverse pairing readiness単体テスト設計

| U-ID | 対象 | 正例 | 反例／mutation | test citation |
|---|---|---|---|---|
| U-BACKFILL-008 | `analyzeBackfill` | `draft`かつ`pending_reverse`のReverseとForwardが双方向referencesで一致 | Forward側欠落、wrong Reverse ID、state不一致を拒否し、`backfill_state`条件除去mutationをkill | `tests/backfill-pairing.test.ts` |

pending Reverseのpair成立をterminal／legacy `requires`契約の代替にせず、execution dependency readyも推測しない。
