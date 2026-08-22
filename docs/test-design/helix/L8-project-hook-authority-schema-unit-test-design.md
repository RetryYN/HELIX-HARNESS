---
title: "project hook authority schema L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L5-103-project-hook-authority-schema.md
pair_artifact: docs/design/helix/L5-detail/project-hook-authority-schema.md
---

# project hook authority schema L8単体テスト設計

## 1. fixture境界

L6/L7実装前のためcitationは付けずdraftを維持する。valid baseline fixtureを共有し、各mutationを単独適用する。
fixtureはroot、HEAD、physical identity、source digest、assignment、lifecycle clockを個別に制御し、一軸を変えた時だけ
期待failureへ遷移することを要求する。欠落値をprimary treeやprovider情報から補完するfixtureは使用しない。

## 2. mutation反証oracle

| U-ID | 対象 | 反例と期待結果 |
|---|---|---|
| `U-CNWHOOKSCHEMA-001` | root exact set | 12 fieldを個別削除／unknown追加して`schema_invalid`、input不変 |
| `U-CNWHOOKSCHEMA-002` | physical identity | lexical一致＋realpath／common dir／device／file相違をsameにしない |
| `U-CNWHOOKSCHEMA-003` | unsupported platform | stat evidence欠落を補完せず`unsupported_physical_identity` |
| `U-CNWHOOKSCHEMA-004` | source material | 観測／current authority三digestの個別欠落、uppercase、staleを拒否。Claude digest混入も拒否 |
| `U-CNWHOOKSCHEMA-005` | assignment union | assignment field欠落、session field混在、primary fallbackを拒否 |
| `U-CNWHOOKSCHEMA-006` | authority drift | root／HEAD／三digestを個別mutationし`project_hook_source_stale_or_foreign`、write 0 |
| `U-CNWHOOKSCHEMA-007` | surface projection | SessionStart／doctor／status／dispatchのreceipt bytes exact equality |
| `U-CNWHOOKSCHEMA-008` | lifecycle bounds | 0、60001、期限なし、parent required falseをpolicy failure |
| `U-CNWHOOKSCHEMA-009` | process terminal | timeout後にchild／parentの一方を残しsuccessへ降格しない |
| `U-CNWHOOKSCHEMA-010` | notification handoff | bounded workerのID／lease／TTL／digest欠落を拒否。同期waitへ戻さない |
| `U-CNWHOOKSCHEMA-011` | terminal result | failure前後でsession／HEAD／verdict／comment／digestをbyte比較しmutation 0 |
| `U-CNWHOOKSCHEMA-012` | determinism／failure順 | 同一inputのbyte-equivalent result、複数failureのstable順、side effect全0 |

production testではfixture filesystemを使い、symlink／別worktree／unsupported statを再現する。process testはfake clockと
child supervisorを注入し、wall clock sleepを使わない。foreign treeへのwrite、reset、checkoutをoracle自身も実行しない。
