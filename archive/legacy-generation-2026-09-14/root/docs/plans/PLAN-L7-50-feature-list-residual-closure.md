---
plan_id: PLAN-L7-50-feature-list-residual-closure
title: "PLAN-L7-50: R1-R9 feature-list 残差 close"
kind: impl
layer: L7
drive: fullstack
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: completed
created: 2026-06-12
updated: 2026-06-12
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.3-codex
    tests_green_at: "2026-06-12"
    reviewed_at: "2026-06-12"
    verdict: pass-with-fixes
    scope: "R1-R9 feature-list 残差 close: 各 residual bucket を PLAN/WBS、L7 source target、test target、doctor coverage gate に拘束する。"
agent_slots:
  - role: tl
    slot_label: "TL - R1-R9 residual close と fail-close coverage gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-50-feature-list-residual-closure.md
    artifact_type: markdown_doc
  - artifact_path: .helix/audit/A-133-upstream-vmodel-coverage-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/fr-roadmap-coverage.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-slots.ts
    artifact_type: source_module
  - artifact_path: tests/fr-roadmap-coverage.test.ts
    artifact_type: test_code
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
  - artifact_path: tests/agent-slots.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-04-upstream-schedule-reconciliation.md
  requires:
    - .helix/audit/A-133-upstream-vmodel-coverage-audit.md
    - docs/design/harness/L1-requirements/functional-requirements.md
    - docs/design/harness/L6-function-design/fr-unit-coverage.md
    - docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-50: R1-R9 feature-list 残差 close

## 目的

A-133 の feature-list residual bucket を L7 で close する。residual bucket は text-only routing では close しない。該当行が WBS、implementation surface、test surface、自動 coverage gate を示した場合だけ close する。

## WBS

| WBS ID | Residual bucket | L7 source target | Test target | Coverage gate | feature flag | rollback 方針 |
|---|---|---|---|---|---|---|
| WBS-L7-50-R1 | R1 learning / observability | `src/feedback/engine.ts` | `tests/search-feedback.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、feedback metrics は carry として保持する |
| WBS-L7-50-R2 | R2 FE / W-gate workflow | `src/workflow/readiness.ts` | `tests/readiness-guardrail.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、W-gate は L4 carry として保持する |
| WBS-L7-50-R3 | R3 P2 readiness と infra | `src/guardrail/ledger.ts` | `tests/issue-queue.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、P2 infra は parked/carry として保持する |
| WBS-L7-50-R4 | R4 model/drive/onboarding/provider | `src/runtime/provider-handover.ts` | `tests/provider-handover.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、provider/drive は Phase B carry として保持する |
| WBS-L7-50-R5 | R5 internal assets | `src/assets/catalog.ts` | `tests/asset-catalog.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、asset drift は carry として保持する |
| WBS-L7-50-R6 | R6 DDD/TDD strictness | `src/lint/ddd-tdd-rules.ts` | `tests/ddd-tdd-rules.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、strictness hardening は carry として保持する |
| WBS-L7-50-R7 | R7 relation graph | `src/lint/relation-graph.ts` | `tests/relation-graph.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、relation graph は residual PLAN として保持する |
| WBS-L7-50-R8 | R8 external verification/MCP | `src/lint/tool-adapter.ts` | `tests/tool-adapter.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、must-tool profile は carry として保持する |
| WBS-L7-50-R9 | R9 document export | `src/export/document-export.ts` | `tests/document-export.test.ts` | `doctor fr-roadmap-coverage`, `npm test` | N/A | A-133 行を `scheduled` へ戻し、export derivative は carry として保持する |
| WBS-L7-50-R10 | Function-spec explicit L7 defer discharge | `src/workflow/contracts.ts`, `src/schema/harness-db.ts` | `tests/workflow-contracts.test.ts` | `doctor impl-plan-trace`, `doctor oracle-test-trace`, `npm test` | N/A | function-spec 行を `explicit_l7_defer` へ戻し、R10 を open のまま保持する |
| WBS-L7-50-R11 | Agent roster capability defer discharge | `src/runtime/agent-slots.ts` | `tests/agent-slots.test.ts` | `doctor impl-plan-trace`, `doctor oracle-test-trace`, `npm test` | N/A | agent-slots 行を explicit defer へ戻し、R11 を open のまま保持する |

## 受入条件

- [x] A-133 residual bucket rows R1-R9 は `closed` である。
- [x] A-133 は bucket ごとに 1 行の evidence を持つ `Residual Feature Closure Evidence` table を持つ。
- [x] closed bucket に PLAN/WBS、source、test、coverage gate、target file existence が欠ける場合、`fr-roadmap-coverage` は fail する。
- [x] `explicit_l7_defer` と記された function-spec rows は L7 source/test evidence へ discharge されるか、non-closed residual として reopen される。
- [x] Agent roster capability row は L7 source/test evidence へ discharge されるか、non-closed residual として reopen される。
- [x] `helix doctor` は `fr-roadmap-coverage` hard gate を pass する。
- [x] `npm run lint`、`npm run typecheck`、`npm test` が pass する。

## DoD

- [x] R1-R9 residual rows は source、test、doctor evidence により close されている。
- [x] R10/R11 defer discharge rows は source と test evidence で covered である。
- [x] DB rebuild 後に `doctor`、typecheck、lint、full vitest suite が pass する。
