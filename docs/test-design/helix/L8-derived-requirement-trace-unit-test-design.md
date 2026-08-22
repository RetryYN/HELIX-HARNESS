---
title: "L8 Derived requirement trace 単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-14
updated: 2026-08-22
pair_artifact: docs/design/helix/L6-function-design/derived-requirement-trace.md
---

# L8 Derived requirement trace 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DTRACE-001 | 1 transitionをcompile | FR/AC/test各1件、reverse artifact 11件 | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-002 | 8派生系統をcompile | exact 8種、全件candidate | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-003 | orphan/片edge/stale/confirmed mutation | 対応findingで`ok=false` | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-004 | placement重複/pair欠落/revision drift | 対応findingで`ok=false` | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-005 | envelope／trace schema入口妥当性 | malformed envelopeは`source_envelope_invalid`、malformed trace graphは`trace_schema_invalid`だけを返す | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-006 | graph workflow identity不一致 | workflow ID／revision／snapshotの各legで`graph_source_mismatch`を`path=graph`へexact固定 | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-007 | artifact ID重複 | index 2の`artifact_id_duplicate`と随伴`reverse_trace_mismatch`をexact集合で返す | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-008 | artifact／trace source identity不一致 | 2 transition fixtureの非先頭要素を使い、artifact snapshot driftを`artifacts.1`、trace snapshot driftを`trace.1`へexact固定し、trace orphanは随伴する`reverse_trace_mismatch`とのexact集合で返す | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-009 | requirement exactly-one欠落／重複 | 第2transitionで同kindを0件／2件にしreverse traceを同時調整して、各legが`requirement_cardinality_invalid`だけを返す | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-010 | derived system exactly-one欠落／重複 | 第2transitionで同kindを0件／2件にしreverse traceを同時調整して、各legが`derived_system_cardinality_invalid`だけを返す | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-011 | layer placement欠落 | `layer_placement_missing`をtransition／layer pathで返す | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-012 | canonical 6 pair外edge | 第2transitionの`pair_edge_missing`と`pair_edge_noncanonical`をliteral pair identityのexact集合で返す | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-013 | validator側source envelope不正 | valid graph＋malformed envelopeでvalidator siteの全`source_envelope_invalid` code／path集合をexact固定 | `tests/derived-requirement-trace.test.ts` |

実行コードは`tests/derived-requirement-trace.test.ts`を正本とする。
