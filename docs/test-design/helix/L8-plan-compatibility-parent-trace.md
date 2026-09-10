---
title: "compatibility-only parent遮断の単体テスト設計"
layer: L8
status: draft
plan: docs/plans/PLAN-RECOVERY-1591-compatibility-parent-trace.md
pair_artifact: docs/design/helix/L6-function-design/plan-compatibility-parent-trace.md
---

# 反例と受入oracle

正本テストは`tests/plan-compatibility-parent.test.ts`とする。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CPP-001 | 異常／mutation | legacy parentのpath／ID／相対path／Windows区切り／fragmentでRED | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-002 | 正常 | strict schemaが来歴を保持し、typed historyだけ、またはcurrent要件parentとの併記はGREEN | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-003 | 異常 | legacy PLANをuntyped requires／referencesへ置くとRED | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-004 | 異常 | string、wrong relation／scope、空白理由、余剰field、ID／path不一致でRED | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-005 | 境界 | valid historyを併記してもcurrent parentの違反を相殺しない | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-006 | 回帰 | 参照元のinventory所属／旧日付／confirmedによる迂回を拒否 | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-007 | 回帰 | archived readerを保持し、typed historyの型違反は拒否 | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-008 | 境界 | inventory invalidは文書0件でもRED | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-009 | 境界 | history 0件／1件はGREEN、同一ID 2件はRED | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-010 | 回帰 | inventory 951件と既存digestを維持 | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-011 | 接続 | 正規PLAN lintとdoctor governanceがparent mutationを拒否 | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-012 | 分割境界 | 未移行consumer 3件を変更せずexact baselineで認識し、後続PRの対象として保持 | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-013 | schema／projection | frontmatterが来歴を保持し、current dependencyから旧IDを除外 | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-014 | 異常 | object parent／reference、string references、dependency配下の来歴を拒否 | `tests/plan-compatibility-parent.test.ts` |
| U-CPP-015 | ratchet | exact-edge baselineは既存違反だけを許し、同じPLANへの新規edgeを拒否 | `tests/plan-compatibility-parent.test.ts` |

## 実行とmutation

1. `vitest run --project fast tests/plan-compatibility-parent.test.ts`で強い結果assertionを実行する。
2. 正常判定だけを返す未実装stubでU-CPP-001の5件がREDとなることを先に確認する。
3. isolated copyでparent拒否、untyped reference拒否、来歴schema判定を個別に無効化し、対応テストの
   assertion失敗を確認する。型エラー・import失敗・別guardの失敗をkillの根拠にしない。
4. 復元したsourceでtargeted回帰、`tsc --noEmit`、PLAN lintを実行し、exit codeとoutput digestを記録する。

全体gateの既存違反、実行環境の制約、DB replay未検証を成功へ読み替えない。
