---
title: "Claude review未応答detector単体テスト設計"
status: draft
canonical_layer: L7
canonical_pair: L6
plan: docs/plans/PLAN-L7-1743-claude-unanswered-review-detector.md
pair_artifact: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md
parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md
---

# Claude review未応答detector単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-CLUNANS-001 | request identity | comment IDとHEADを保持し、responseがなければ未応答へ分類する | `tests/claude-unanswered-review-detector.test.ts` |
| U-CLUNANS-002 | response identity | 別HEADまたはrequest以前のresponseを回答へ数えない | `tests/claude-unanswered-review-detector.test.ts` |
| U-CLUNANS-003 | 継続projection | 編集でmentionを失った既知requestを前回artifactから復元する | `tests/claude-unanswered-review-detector.test.ts` |
| U-CLUNANS-004 | bot／時系列境界 | bot mentionとrequest以前のresponseを無視する | `tests/claude-unanswered-review-detector.test.ts` |
| U-CLUNANS-005 | responder trust | trusted responder以外のspoof見出しを回答へ数えない | `tests/claude-unanswered-review-detector.test.ts` |
| U-CLUNANS-006 | CLI永続境界 | 前回artifactを再投入し、既存outputを上書きしない | `tests/claude-unanswered-review-detector.test.ts` |
| U-CLUNANS-007 | scheduled shadow workflow | read-only権限、非required artifact出力、pagination raceのfail-closeを固定する | `tests/claude-unanswered-review-detector.test.ts` |

全oracleの実行先は`tests/claude-unanswered-review-detector.test.ts`とする。
