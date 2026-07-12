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
| U-SBOUND-001 | state-db→vscodeのdirect/type-only edge | deny |
| U-SBOUND-002 | vscode→state-dbのimplementation edge | deny |
| U-SBOUND-003 | missing owner default/EMPTY/new from/new to policy | unspecifiedエラー |
| U-SBOUND-004 | lint analyzerにwrite/child-process import | violation |
| U-SBOUND-005 | generic projectorにVS Code command constant | violation |
| U-SBOUND-006 | probeのtimeout/nonzero/missing binary | typed blocked receipt |
| U-SBOUND-007 | policy owner/rationale/review trigger欠落 | coverage violation |
| U-SBOUND-008 | direct/type-only/re-export/dynamic edge fixture | `src/lint/source-edge-extractor.ts`の同じSourceEdgeへ正規化 |
| U-SBOUND-009 | capability/authority/snapshot/idempotency変異 | effect callback 0、blocked |
| U-SBOUND-010 | port throw/partial write/CAS drift | accepted 0、uncertainまたはblocked |

fixtureはset比較だけでなくedge kind、from/to owner、decision reasonを固定する。allowlist件数baseline追加で逃げず、
各新module、unknown from/to、owner default欠落、explicit exception欠落をunspecifiedとして赤にするmutation oracleを持つ。
