---
layer: L8
sub_doc: unit-test-design
status: draft
pair_artifact: docs/design/harness/L6-function-design/source-boundary-contracts.md
plan: docs/plans/PLAN-L6-79-source-boundary-contracts.md
---

# source boundary contracts 単体テスト設計

| oracle | 反例 | 期待結果 |
|---|---|---|
| U-SBOUND-001 | state-db→vscode direct/type-only edge | deny |
| U-SBOUND-002 | vscode→state-db implementation edge | deny |
| U-SBOUND-003 | missing/EMPTY/new module policy | unspecified error |
| U-SBOUND-004 | lint analyzerにwrite/child-process import | violation |
| U-SBOUND-005 | generic projectorにVS Code command constant | violation |
| U-SBOUND-006 | probe timeout/nonzero/missing binary | typed blocked receipt |
| U-SBOUND-007 | policy owner/rationale/review trigger欠落 | coverage violation |
| U-SBOUND-008 | re-export/dynamic edge fixture | `PLAN-L7-428` W2 extractorへ一意委譲 |

fixtureはset比較だけでなくedge kind、from/to owner、decision reasonを固定する。allowlist件数baseline追加で逃げず、
各新moduleをunspecifiedとして赤にするmutation oracleを持つ。
