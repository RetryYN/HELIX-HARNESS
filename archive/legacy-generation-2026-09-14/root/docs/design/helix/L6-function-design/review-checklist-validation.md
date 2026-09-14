---
layer: L6
artifact_type: design
status: draft
plan: docs/plans/PLAN-RECOVERY-1411-review-checklist-validation.md
pair_artifact: docs/test-design/helix/L8-review-checklist-validation.md
---

# single-runtime checklist入力検証

既存governance-enforcementのevaluateGateReview契約（有効な証拠だけを受理）を修復する。
要求意味と必須IDは追加しない。旧oracle `U-FR-L1-05` のchecklist部分を
`U-CHKREV-001` として現行形式の実装検証へ束縛する。

## 関数契約

- `loadReviewChecklist(path): ReviewChecklist` はYAMLをunknownとして解析し、strict schemaで検証する。
- `evaluateGateReview(input): GateReviewResult` のsingle-runtime分岐も同じschemaを検査する。
- `items` は配列、要素はid/status/evidenceのみ。idは既存7IDの重複なしexact set、
  statusはpass/fail/n-aのみ、evidenceは省略または文字列とする。
- shape不正、欠落、未知ID、重複、未知statusはloaderでエラー、evaluateでpassed=false。
- fail項目は拒否、n-aは空白でない理由を要求する。正常passと理由付きn-aは維持する。
- schemaエラーへ入力本文やファイル内容を展開しない。

## 境界

hybrid/standalone、必須ID、provider選択を変更しない。メタデータ付きskill templateを
実測checklistへ暗黙変換しない。shape適合だけでは証拠の真正性を保証しない。
独立レビューやreceipt検証をこの関数の成功で代替しない。

検証は `tests/gate-review-tier.test.ts` の `U-CHKREV-001` と既存対照を使用する。
