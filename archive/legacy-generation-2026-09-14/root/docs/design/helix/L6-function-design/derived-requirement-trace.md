---
title: "Derived requirement trace 機能設計"
layer: L6
sub_doc: function-spec
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-559-derived-requirement-trace.md
pair_artifact: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md
---

# Derived requirement trace 機能設計

`compileDerivedRequirementTrace(input: unknown) => DerivedRequirementTraceResult`

| DbC | 契約 |
|---|---|
| pre | inputはuntrusted Universal Workflow envelopeであり、caller検証済みを仮定しない |
| post | valid transitionごとにFR/AC/test各1件、8派生candidate、reverse trace、12 placement、6 pairを決定的に返す |
| invariant | source revision/snapshot/oracleを全node/edgeで共有し、write/freeze/confirmed化しない |
| failure | source envelope不適合時はgraphを返さずtyped findingへ変換する |
| oracle | `U-DTRACE-001`〜`U-DTRACE-004` |

`validateDerivedRequirementTrace(graph: unknown, envelope: unknown) => DerivedRequirementTraceResult`

| DbC | 契約 |
|---|---|
| pre | graphとenvelopeはいずれもuntrusted unknown |
| post | forward/reverse exact set、cardinality、revision/snapshot、L1〜L12、正規6 pairが全てcurrent時だけ`ok=true` |
| invariant | malformed graphを修復・推測・persistしない |
| failure | orphan、片edge、stale、先行confirmed、placement/pairの欠落・重複をstable findingへ変換する |
| oracle | `U-DTRACE-003` / `U-DTRACE-004` |

## oracle対応表

| oracle | 反証対象 |
|---|---|
| `U-DTRACE-001` | transition単位FR/AC/testと双方向trace欠落 |
| `U-DTRACE-002` | 8派生系統欠落または先行confirmed |
| `U-DTRACE-003` | orphan、片edge、別revision/snapshot |
| `U-DTRACE-004` | L1〜L12または正規6 pairの欠落・重複 |
