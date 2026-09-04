---
layer: L7
artifact_type: test_design
status: draft
plan: docs/plans/PLAN-RECOVERY-1500-cross-system-audit-intake.md
parent_design: docs/design/helix/L6-function-design/cross-system-audit-intake.md
pair_artifact: docs/design/helix/L6-function-design/cross-system-audit-intake.md
---

# 外部横断監査入力の保全検証

対象PLAN: `PLAN-RECOVERY-1500-cross-system-audit-intake`。
配置根拠: `docs/governance/repository-structure.md` §2の横断参照資料。
runtime変更の検証ではなく、保存内容と所見追跡の欠損を検出する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-XAUDIT-001 | 元入力と保存先のexact対応 | 内容改変、重複mapping、追加・欠落、symlink、非txt保存、元checksum不一致で失敗 | `tests/cross-system-audit-intake.test.ts` |
| U-XAUDIT-002 | F/C/Xの分離 | ID欠落・重複・順序変更を検出し、対照を欠陥へ合算しない | `tests/cross-system-audit-intake.test.ts` |

受領時ハッシュを固定し、candidate自身が変更したmanifestだけに依存しない。
全資料の意味妥当性、secret/PII不存在、remote保全、runtime修復完了はこの検査だけでは証明しない。
