---
title: "PLAN typed workflow identity単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: QA / TL
plan: docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
pair_artifact: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
---

# PLAN typed workflow identity単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-TPWID-001 | frontmatter tuple | 未知axis、小文字ID、短いdigest、余剰legacy fieldを拒否する | `tests/frontmatter.test.ts` |
| U-TPWID-002 | catalog binding | version、digest、axis、IDのいずれかがcurrent catalogと異なればred | `tests/plan-entry-routing.test.ts` |
| U-TPWID-003 | legacy再出力 | typed identityと`route_mode`を併記したPLANを拒否する | `tests/plan-entry-routing.test.ts` |
| U-TPWID-004 | 軸分離 | `kind=impl`と`workflow_model=VERSION_UP`を同一enum照合せず受理する | `tests/plan-entry-routing.test.ts` |
| U-TPWID-005 | freeze伝播 | L6/L8 pairとdesign catalog digestがpacketへ一致する | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-TPWLOAD-001 | authority load failure | catalog missing、invalid JSON、generated projection driftを別reason＋authority pathで拒否する | `tests/plan-entry-routing.test.ts` |
| U-TPWSIG-001 | signal一致 | `version_deferral`と`workflow_model:VERSION_UP`の一致を受理する | `tests/plan-entry-routing.test.ts` |
| U-TPWSIG-002 | signal矛盾 | `drift`が指す`REVERSE`と宣言`VERSION_UP`の矛盾を拒否する | `tests/plan-entry-routing.test.ts` |
| U-TPWSIG-003 | unresolved分類 | unknown、decision待ち、ambiguityを別reasonで拒否し、resolved bindingが先でもdecision待ちを優先する | `tests/plan-entry-routing.test.ts` |
| U-TPWSIG-004 | PO境界 | `po_directive`本文からtyped identityを推測しない | `tests/plan-entry-routing.test.ts` |
| U-TPWLEG-001 | inventory外の非typed PLAN | `workflow_identity_required`で拒否する | `tests/plan-entry-routing.test.ts` |
| U-TPWLEG-002 | exact inventory内の既存非typed PLAN | compatibility inputとしてのみ受理する | `tests/plan-entry-routing.test.ts` |
| U-TPWLEG-003 | inventory digest改ざん | inventory invalidとしてfail-closeする | `tests/plan-entry-routing.test.ts` |
| U-TPWLEG-004 | inventory上限超過／current module import | 951件超過と旧mode moduleのcurrent直importを拒否する | `tests/plan-entry-routing.test.ts` |
| U-TPWBACK-001 | Reverse pending判定 | typed `workflow_model:ADD_FEATURE`＋`pending_reverse`だけを`conditionalPending`とし、別axis／別ID／不正digest／state欠落はorphanを維持する | `tests/backfill-pairing.test.ts` |

既存`route_mode` PLANのbaseline greenでtyped tupleの失敗を相殺しない。
