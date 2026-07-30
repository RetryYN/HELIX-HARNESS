---
title: "Requirement IR shadow migration単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-07-30
updated: 2026-07-30
owner: QA / TL
plan: docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
pair_artifact: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
---

# Requirement IR shadow migration単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RIR-000 | schema authorityとDesign Template接続port | canonical claim、port欠落 | `tests/requirement-ir-shadow.test.ts` |
| U-RIR-001 | 153/24/72/24 exact denominator | 1行欠落、余分record | `tests/requirement-ir-shadow.test.ts` |
| U-RIR-002 | statement digestとlegacy migration evidence | digest drift、質問履歴捏造 | `tests/requirement-ir-shadow.test.ts` |
| U-RIR-003 | exactly-one ownerとL10 oracle | owner重複、HAC/HAT欠落 | `tests/requirement-ir-shadow.test.ts` |
| U-RIR-004 | 既知12要求のexact owner | GitHub 5責務への誤配線、route issue drift | `tests/requirement-ir-shadow.test.ts` |
| U-RIR-005 | fail-close mutation | statement変更、owner重複、ledger欠落／重複、HAC-HAT誤接続 | `tests/requirement-ir-shadow.test.ts` |
| U-RIR-006 | checked-in shadow再現性 | generatorとsnapshotの意味差 | `tests/requirement-ir-shadow.test.ts` |

全oracleはcompile API自体ではDB、network、filesystem writeを行わない。
生成adapterは指定されたshadow pathだけを書き、canonical authorityやMarkdownを変更しない。
