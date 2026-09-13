---
title: "共有generated authority single-writer L7テスト設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-13
updated: 2026-09-13
owner: QA
plan: docs/plans/PLAN-RECOVERY-1323-generated-authority-single-writer.md
pair_artifact: docs/design/helix/L6-function-design/generated-authority-single-writer.md
related_l6: docs/design/helix/L6-function-design/generated-authority-single-writer.md
next_pair_freeze: L6
---

# 共有generated authority single-writerテスト設計

親設計: `docs/design/helix/L6-function-design/generated-authority-single-writer.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-GASW-001 | 順序独立性 | 独立delta A/BをA→BとB→Aで再生し、exact setまたはdigestが異なればRED。 | `tests/generated-authority-single-writer.test.ts` |
| U-GASW-002 | typed rejection | semantic overlap、stale base、unknown generator、missing exact setをそれぞれ固有codeで拒否する。 | `tests/generated-authority-single-writer.test.ts` |
| U-GASW-003 | 冪等性／supersede | 同一identity再送でapply回数が増える変異、新revisionより旧revisionを採る変異をREDにする。 | `tests/generated-authority-single-writer.test.ts` |
| U-GASW-004 | atomic publish | lease/fence失効、CAS競合、2 file目の注入失敗で1 file目だけ残る実装をREDにする。 | `tests/generated-authority-single-writer.test.ts` |
| U-GASW-005 | 証拠分離 | semantic receipt欠落をprojection receiptで相殺する変異と、source HEAD不一致をREDにする。 | `tests/generated-authority-single-writer.test.ts` |
| IT-GASW-001 | 並列PR収束 | 2〜4 candidate deltaをcurrent mainへ統合し、candidate branchがcanonical generated fileを変更せず同一projectionへ収束する。 | `tests/generated-authority-single-writer-integration.test.ts` |

## 検証境界

pure plannerはfilesystemやGitHubへ書き込まず、Node commit adapterは許可済みexact set以外を書けないことを分離して検証する。
failure injection後はcanonical bytesが全件旧値または全件新値のどちらかで、部分状態が存在しないことをread-afterする。
semantic conflictは自動mergeの成功例へ変換せず、owner返却と未解消義務を確認する。
