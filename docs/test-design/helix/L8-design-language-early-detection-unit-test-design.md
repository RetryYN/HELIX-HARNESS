---
title: "design-language 早期検出 L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: QA
plan: docs/plans/PLAN-RECOVERY-110-design-language-early-detection.md
pair_artifact: docs/design/helix/L6-function-design/design-language-early-detection.md
---

# design-language 早期検出 L8単体テスト設計

本 pair の oracle は `tests/design-language.test.ts` に置き、既存 U-DESLANG 系と同一 file で管理する。

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-DESLANG-013 | `designLanguageMessages` の位置表示 | fingerprint drift 分岐から `sample` を除去すると red。baseline 0 では drift 分岐が常に先行するため、位置表示が消えると違反箇所の特定が review 側へ戻る | `tests/design-language.test.ts` |
| U-DESLANG-014 | 単体 gate 実行経路の配線 | `runDoctorGate` が check の message を加工する、または unknown gate が `ok: true` を返すと red。実 repository は violation 0 のため、違反経路は fixture 側で必ず通す | `tests/design-language.test.ts` |
| U-DESLANG-015 | CI での実行位置 | preflight から gate を削除する、または `npm run test:repo-guards` より後ろへ移動すると red | `tests/design-language.test.ts` |

## mutation 実測記録

`U-DESLANG-014` は初版では実 repository 比較のみであったため、`runDoctorGate` が message を加工する
mutation が生き残った。実 repository の violation が 0 件で message に `sample` を含まず、mutation が
no-op になるためである。violation を含む fixture 比較を追加した後の再実測で kill を確認している。
oracle が「現在たまたま green な状態」に依存すると mutation を殺せない実例として記録する。
