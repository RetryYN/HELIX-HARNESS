---
layer: L8
sub_doc: unit-test-design
status: draft
pair_artifact: docs/design/harness/L6-function-design/source-boundary-contracts.md
plan: docs/plans/PLAN-L6-79-source-boundary-contracts.md
---

# source boundary contracts 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SBOUND-001 | state-db→vscode edge | direct/type-onlyともdeny | `tests/source-boundary-design.test.ts` |
| U-SBOUND-002 | vscode→state-db edge | implementation edgeをdeny | `tests/source-boundary-design.test.ts` |
| U-SBOUND-003 | policy coverage | missing owner default/EMPTY/new from/new toをunspecifiedエラー | `tests/source-boundary-policy.test.ts` |
| U-SBOUND-004 | lint analyzer | write/child-process importをviolation | `tests/source-boundary-design.test.ts` |
| U-SBOUND-005 | generic projector | VS Code command constantをviolation | `tests/source-boundary-design.test.ts` |
| U-SBOUND-006 | probe failure | timeout/nonzero/missing binaryをtyped blocked receipt化 | `tests/source-boundary-design.test.ts` |
| U-SBOUND-007 | policy metadata | owner/rationale/review trigger欠落をcoverage violation化 | `tests/source-boundary-policy.test.ts` |
| U-SBOUND-008 | source edge | direct/type-only/re-export/dynamic/literal require/import-equalsを正規化しcomputed requireをunknownで拒否 | `tests/source-boundary-policy.test.ts` |
| U-SBOUND-009 | effect authority | untrusted issuer/改ざん/scope拡大/revocation/capability/snapshot/idempotency変異でeffect callback 0 | `tests/source-boundary-design.test.ts` |
| U-SBOUND-010 | durable materialize | port throw/partial write/CAS driftでaccepted 0、uncertainまたはblocked | `tests/source-boundary-design.test.ts` |
| U-SBOUND-011 | temporary allow | explicit allow正常系、期限切れ・不正expiry・review trigger発火・duplicate pairをfail-close | `tests/source-boundary-policy.test.ts` |
| U-SBOUND-012 | production wiring | coding-rules gateがliteral requireとcomputed dynamic importの迂回をmodule-boundary violation化 | `tests/source-boundary-policy.test.ts` |
| IT-SBOUND-005 | L9 real graph binding | 実repo全live edgeをproduction policyで全域判定 | `tests/source-boundary-integration.test.ts` |
| IT-SBOUND-006 | L9 direction mutation binding | 全explicit direction除去でdefault denyへ戻す | `tests/source-boundary-integration.test.ts` |
| U-SBOUND-013 | terminal sequencing | 452 terminal時に450/451 terminalかつtemporary source direction 0を要求 | `tests/source-boundary-design.test.ts` |

fixtureはset比較だけでなくedge kind、from/to owner、decision reasonを固定する。allowlist件数baseline追加で逃げず、
各新module、unknown from/to、owner default欠落、explicit exception欠落をunspecifiedとして赤にするmutation oracleを持つ。
