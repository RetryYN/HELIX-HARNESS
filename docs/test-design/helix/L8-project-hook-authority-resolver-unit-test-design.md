---
title: "project hook authority resolver L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L7-651-project-hook-authority-resolver.md
pair_artifact: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
---

# project hook authority resolver L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CNWHOOKSCHEMA-001 | root exact schema | 12 fieldの個別削除とunknown追加を`schema_invalid`で拒否する | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-002 | physical identity | lexical path一致でもphysical file identity差をstaleとして拒否する | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-003 | physical evidence | platform／capture source／evidence kindの不可能な組合せを`unsupported_physical_identity`で拒否する | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-004 | source identity | 観測三digestとcurrent authority三digestを独立比較する | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-005 | assignment authority | assignment root digestだけをauthorityにしprimary fallbackしない | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-006 | HEAD authority | 観測／candidate／current HEAD差をstaleとして拒否する | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-007 | receipt | valid inputからdeterministic receiptを返す | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-008 | lifecycle admission | 単独60秒超過、timeout＋grace合計60秒超過、parent terminal falseをschemaで拒否する | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-011 | failure precedence | schema→unsupported→stale→lifecycleの優先順を複合mutationで固定する | `tests/project-hook-authority.test.ts` |
| U-CNWHOOKSCHEMA-012 | determinism | failure side effect全0、input mutation 0、同一input同一resultを保つ | `tests/project-hook-authority.test.ts` |

本sliceはpure resolverだけを実行する。unsupported platform capture、process timeout、notification handoff、terminal result、
4 surface wiringのoracleは後続runtime pairへ分離し、未実装能力をgreenへ数えない。
