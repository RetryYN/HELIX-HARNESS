---
title: "worker descriptor admission L7 runtime単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L6-94-worker-descriptor-admission.md
pair_artifact: docs/design/helix/L6-function-design/worker-descriptor-admission.md
related_l8: docs/test-design/helix/L8-worker-descriptor-admission-unit-test-design.md
github_issue_id: 225
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
---

# worker descriptor admission L7 runtime単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WDA-001 | strict descriptor | version、ID、unknown key不正を拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-002 | capability closed set | 5値以外を拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-003 | descriptor digest | 自己参照digestを拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-004 | identity resolver | 2-tuple解決後のcapability mismatchを拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-005 | cardinality／status | 0件／複数／inactiveを別reasonで拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-006 | specialist projection | 暗黙mappingとsource writeを拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-007 | Python projection | 暗黙capability mappingを拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-008 | digest chain | descriptor／source record／source entry／snapshot driftを拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-009 | stale predicate | request／revision／snapshot／source driftとrejected→admitted forgeを拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-010 | failure order | 順序変更と重複を拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-011 | deterministic digest | entry入力順、locale、clock依存を拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-012 | export boundary | launch／spawn／receipt exportを拒否 | `tests/worker-descriptor-admission.test.ts` |
| U-WDA-013 | pure module | filesystem／process／DB／workflow依存を拒否 | `tests/worker-descriptor-admission.test.ts` |

Redはproduction module未存在によるmodule resolution failure、Greenは13/13、Refactorはdigest、failure order、source entry生成を
単一helperへ集約した状態とする。正例だけでなく各binding driftと後続責務混載をmutationとして実行する。
