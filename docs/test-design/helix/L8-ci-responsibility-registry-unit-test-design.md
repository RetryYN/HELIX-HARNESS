---
title: "CI Responsibility Registry単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: Codex / QA
plan: PLAN-L7-705-ci-responsibility-registry
parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md
pair_artifact: docs/design/helix/L6-function-design/ci-responsibility-registry.md
---

# CI Responsibility Registry単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CIREG-001 | admission | 全typed fieldとstable digestを受理 | `tests/ci-responsibility-registry.test.ts` |
| U-CIREG-002 | shared core | consumer closureとlocal／boundary exact set | `tests/ci-responsibility-registry.test.ts` |
| U-CIREG-003 | mutation classes | requirement／PLAN／schema／workflow／lockfileを別責務へ導出 | `tests/ci-responsibility-registry.test.ts` |
| U-CIREG-004 | unknown／orphan | 個別findingでfail-close | `tests/ci-responsibility-registry.test.ts` |
| U-CIREG-005 | ownership | owner欠落と複数ownerを個別拒否 | `tests/ci-responsibility-registry.test.ts` |
| U-CIREG-006 | dependency | capability cycleを拒否 | `tests/ci-responsibility-registry.test.ts` |
| U-CIREG-007 | retirement | replacement／rollback欠落を拒否 | `tests/ci-responsibility-registry.test.ts` |
| U-CIREG-008 | digest | registryのexact authorityを束縛 | `tests/ci-responsibility-registry.test.ts` |
| U-CIREG-009 | production | repository registryが自己整合 | `tests/ci-responsibility-registry.test.ts` |

mutationはunknown artifact、orphan node、owner欠落、重複owner、A→B→A cycle、retired replacement欠落を独立投入する。
