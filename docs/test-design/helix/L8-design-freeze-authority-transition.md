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
| U-DFA-006 | schema/CLI transaction・path | authority table欠落を許さない。CLI evidenceは専用rootからの相対pathだけを受理し、absolute/traversal/symlinkをDB migration前に拒否する。immutable outbox、temp no-replace publish、file/dir fsync、ancestor identity再検査を強制し、partial temp write、parent symlink race、terminal済み欠落、full export成功/receipt失敗、ENOSPC、後発別PO7 rowをreconcile反例にする | `tests/state-db.test.ts`, `tests/authority-cli.test.ts`, `tests/post-po-design-freeze-transition-v2.test.ts` |
