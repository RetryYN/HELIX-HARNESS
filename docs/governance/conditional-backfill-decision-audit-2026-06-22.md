# Conditional Backfill 判断 audit (2026-06-22)

この audit は、Reverse PLAN back-fill を持たず、明示的な
`backprop_decision: not_required` も宣言していない active な `refactor`、`retrofit`、`troubleshoot`
PLAN を記録する。

2026-06-22 以降、新規または更新された conditional-kind PLAN は `backfill-pairing` の
`conditionalDecisionMissing` で guard される。PLAN は Reverse PLAN によって back-fill されるか、
requirements / design / test-design への backprop が不要な理由を
`backprop_decision: not_required` と `backprop_decision_reason` で宣言しなければならない。

下記の legacy entry は、それぞれ次のいずれかが済むまで visible debt として残す。

- contract / design / test backprop を route する Reverse PLAN と pair する。
- `backprop_decision: not_required` と具体的な理由を追記する。
- 元の kind が誤っていた場合は reclassify する。

## 旧 debt

| PLAN | kind | 観測された issue |
|---|---|---|
| PLAN-L7-05-biome-debt | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-68-provider-dispatch-portability | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-69-encoding-corruption-expanded-guard | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-73-claude-native-semver-resolution | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-74-task-risk-whole-word-match | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-76-review-remediation-reliability | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-77-codex-stdin-prompt-dispatch | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-78-claude-stdin-prompt-dispatch | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-79-mcp-launcher-argv-tokenization | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-80-session-digest-event-watermark | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-81-codex-wrapper-parity-gate | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-83-handover-drift-and-accumulation | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-85-review-readonly-guard | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-86-merged-plan-status-deliverable-scope | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-87-merged-plan-status-kind-independent | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-88-handover-summary-injection-cap | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-89-plan-errata-supersession-gate | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-90-ci-readability-gitignored-artifact | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-91-hollow-deliverable-detection | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-92-plan-body-substance-gate | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-93-plan-completion-drift-gate | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-95-lint-wiring-meta-gate | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-96-screen-db-projection | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-98-handover-outstanding-reconciliation | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-99-sub-doc-catalog-drift-gate | refactor | Reverse link または no-backprop 判断が未記録。 |
| PLAN-L7-100-standard-deliverable-section-structure | troubleshoot | Reverse link または no-backprop 判断が未記録。 |

## Resolution (2026-06-24)

上記 26 件の legacy entry のうち 25 件は、各 PLAN に
`backprop_decision: not_required` と具体的な理由を記録して disposition 済みである。いずれも
harness 内部の self-application tooling (lint gate / runtime dispatch /
guard / governance mechanism) であり、harness 自身の enforcement を harden するが、product の external requirement / design / test-design
contract は変えない。そのため upstream backprop target は無い。これ以降、
`backfill-pairing` advisory の `conditional kind may require Reverse` はこれらを列挙しない。

残る `PLAN-L7-96-screen-db-projection` は意図的にここで open のまま残す。これは discard と
requirements re-issue が予定されている central-UI / screen work に属し、その取り組みの中で解消する
(archive により active-plan scan から外れる)。

表の row は `legacyAuditGaps` allowlist↔audit sync check を green に保つために残す。これらは open debt ではなく historical baseline を記録する。

## 現在の是正

`src/lint/backfill-pairing.ts` は上記の表を legacy baseline として扱い、Reverse back-fill または明示的な no-backprop decision を持たない新規 conditional-kind PLAN を fail させる。
