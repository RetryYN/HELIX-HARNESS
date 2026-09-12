---
title: "Claude review未応答detector単体テスト設計"
status: confirmed
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
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
| U-CLUNANS-007 | scheduled shadow workflow | YAML構造としてread-only権限と非required artifact出力を固定する | `tests/claude-unanswered-review-detector.test.ts` |
| U-CLUNANS-008 | pagination race | collector実processへ異なるread-after応答を返し、非0終了と`pagination_race`を確認する | `tests/claude-unanswered-review-detector.test.ts` |
| U-CLUNANS-009 | sealed response境界 | 未封緘のreview見出し＋HEAD行を回答へ昇格せず、v4 receiptだけを受理する | `tests/claude-unanswered-review-detector.test.ts` |

全oracleの実行先は`tests/claude-unanswered-review-detector.test.ts`とする。
