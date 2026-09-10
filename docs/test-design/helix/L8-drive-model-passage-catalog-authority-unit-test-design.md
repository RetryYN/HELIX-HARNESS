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
plan: docs/plans/PLAN-RECOVERY-1437-drive-passage-catalog-authority.md
pair_artifact: docs/design/helix/L6-function-design/drive-model-passage-catalog-authority.md
---

# workflow-model passage certificate catalog authority単体テスト設計

| Oracle | 検証 | test citation |
|---|---|---|
| U-CAT1437-003 | current catalogのworkflow_model集合を満たすcertificateを受理し、旧Drive model表をcurrent authorityとして受理しない | `tests/drive-model-passage.test.ts` |
| U-DMP-001 | current identityごとのForward targetとresidual statusを持つcertificateを受理する | `tests/drive-model-passage.test.ts` |
| U-DMP-002 | Forward re-entryを欠く行を拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-002b | certificate文書が無い場合を拒否する | `tests/drive-model-passage.test.ts` |
| U-DMP-003 | current reconciliation PLANのidentity集合をcatalogと一致させる | `tests/drive-model-passage.test.ts` |
| U-DMP-004 | current identityの重複行を拒否する | `tests/drive-model-passage.test.ts` |

## 反例境界

旧`Discovery`、`Scrum`、`Add-feature`、`version-up`などの表示名をcurrent
`workflow_model`へ暗黙変換しない。旧値の履歴・compatibility inventoryは保持してよいが、current
certificateの必須集合またはgreen条件へ使わない。
