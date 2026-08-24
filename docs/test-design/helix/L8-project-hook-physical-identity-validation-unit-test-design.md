---
title: "project hook physical identity validation L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-24
updated: 2026-08-24
plan: docs/plans/PLAN-L7-664-project-hook-physical-identity-validation.md
pair_artifact: docs/design/helix/L6-function-design/project-hook-physical-identity-validation.md
---

# project hook physical identity validation L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CNWHOOKPHYS-007 | stat identity validation | `0/0`、inode `0`、負値、非有限数、非整数、安全範囲外number、`undefined`を `unsupported_physical_identity` へ拒否する | `tests/project-hook-physical-adapter.test.ts` |

既存U-CNWHOOKPHYS-001..006と同一fixtureを使用し、stat値の一軸だけを変更する。検証分岐を除去する
seeded mutationでは、`0/0` fixtureが成功へ変わるためU-CNWHOOKPHYS-007がredになることを確認する。
