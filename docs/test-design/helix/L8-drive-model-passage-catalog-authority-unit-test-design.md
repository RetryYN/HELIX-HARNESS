---
title: "workflow-model passage certificate catalog authority単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1715-drive-passage-catalog-authority.md
pair_artifact: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
---

# workflow-model passage certificate catalog authority単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CAT1437-003 | 旧Drive model表をcurrent authorityとして受理しない | 旧identityだけの表はunexpected／missingとして拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-001 | current identityごとのForward targetとresidual statusを持つcertificateを受理する | current catalogの11 identityを持つ表を受理する | `tests/drive-model-passage.test.ts` |
| U-DMP-002 | Forward re-entryを欠く行を拒否する | Forward targetを欠く行を拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-002b | certificate文書が無い場合を拒否する | certificate文書の空集合を拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-003 | current authority designのidentity集合をcatalogと一致させる | catalogと異なる集合を受理しない | `tests/drive-model-passage.test.ts` |
| U-DMP-004 | current identityの重複行を拒否する | 同一identityの重複行を拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-005 | workflow identityが空の行を専用違反として拒否する | identity空欄をmissing_identityとして拒否する | `tests/drive-model-passage.test.ts` |

## 反例境界

旧`Discovery`、`Scrum`、`Add-feature`、`version-up`などの表示名をcurrent
`workflow_model`へ暗黙変換しない。旧値の履歴・compatibility inventoryは保持してよいが、current
certificateの必須集合またはgreen条件へ使わない。
