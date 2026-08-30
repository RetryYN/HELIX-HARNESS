---
title: "Universal Improvement観測正規化L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-705-universal-improvement-observation-normalizer.md
pair_artifact: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md
---

# Universal Improvement観測正規化L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UILNORM-001 | valid normalization | admit済みsourceをbaseline／observed／predicted分離eventへ投影する | `tests/universal-improvement-observation-normalizer.test.ts` |
| U-UILNORM-002 | determinism | 同じevent集合の入力順を反転してもexact set／digestが同じ | `tests/universal-improvement-observation-normalizer.test.ts` |
| U-UILNORM-003 | source admission | forged registry、wrong revision、source admission failureを拒否する | `tests/universal-improvement-observation-normalizer.test.ts` |
| U-UILNORM-004 | baseline separation | missing baselineにrevisionを混入させず、predictionとobservedを混同しない | `tests/universal-improvement-observation-normalizer.test.ts` |
| U-UILNORM-005 | event graph | duplicate event、unresolved／cross-correlation causationを拒否する | `tests/universal-improvement-observation-normalizer.test.ts` |
| U-UILNORM-006 | confidence／counterevidence | 範囲外score、invalid digest、invalid correlationを拒否する | `tests/universal-improvement-observation-normalizer.test.ts` |
| U-UILNORM-007 | malformed boundary | outer／nested inputとregistry resultの構造破壊をthrowせずfail-closeする | `tests/universal-improvement-observation-normalizer.test.ts` |

本設計はfinding適格化、candidate生成、route、authority writeをgreenと主張しない。
