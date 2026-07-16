---
layer: L8
sub_doc: unit-test-design
status: confirmed
pair_artifact: docs/design/helix/L6-function-design/design-freeze-authority-transition.md
plan: docs/plans/PLAN-L7-459-design-freeze-authority-transition.md
---

# Design Freeze authority transition 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-DFA-001 | 設計分母観測 | manifest欠落・digest不一致を完全扱いにしない | `tests/design-denominator-observer.test.ts` |
| U-DFA-002 | PO7 authority | epoch・previous digest不一致、revoke後利用を拒否する | `tests/po7-decision-activation.test.ts` |
| U-DFA-003 | freeze v2 atomicity | 9 write境界の各faultで全tableが0へrollbackする | `tests/post-po-design-freeze-transition-v2.test.ts` |
| U-DFA-004 | replay | 同一key/同一inputだけexact replayし、異なるoperationを拒否する | `tests/post-po-design-freeze-transition-v2.test.ts` |
| U-DFA-005 | supersession | 不正receiptまたはstale headによる後継transitionを拒否する | `tests/post-po-design-freeze-transition-v2.test.ts` |
| U-DFA-006 | schema/CLI | authority table欠落または未観測状態を成功表示しない | `tests/state-db.test.ts`, `tests/authority-cli.test.ts` |
