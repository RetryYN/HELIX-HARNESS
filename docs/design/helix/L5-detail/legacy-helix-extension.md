---
title: "HELIX L5 詳細設計 — old HELIX extension adoption"
layer: L5
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/legacy-helix-extension.md
related_l4: docs/design/helix/L4-basic-design/legacy-helix-extension.md
---

# HELIX L5 詳細設計 — old HELIX extension adoption

L4 `HLX-*` boundary を module / projection / evidence contract に落とす。

## §1 L5 contract matrix

| L3 ID | L5 contract | Required input | Contract output | fail-close |
|-------|-------------|----------------|-----------------|------------|
| HLX-FR-01 | HLX-C01 work-preflight-contract | task objective, workflow/layer, Forward return, acceptance, work source, allowed scope | `WorkPreflightDecision` | missing source/acceptance/scope, conflict with handover/PLAN, high-impact unapproved operation |
| HLX-FR-02 | HLX-C02 technical-question-gate | question text, question class, TL advisor evidence, bypass reason | `TechnicalQuestionDecision` | technical design question without recent TL evidence, bypass without reason |
| HLX-FR-03 | HLX-C03 detector-axis-registry | detector descriptor, phase gate, result kind, severity, workflow route | `DetectorAxisRoutingDecision` | stub/advisory result used as fail-close proof, unknown axis auto-routed |
| HLX-FR-04 | HLX-C04 recommender-catalog-contract | task text, layer/phase, catalog entry, references, recommended role | `RecommendationDecision` | raw legacy path candidate accepted as current path, candidate without trace/reason |
| HLX-FR-05 | HLX-C05 run-debug-trace-contract | command/run log, expected action map, runtime surface, correlation id | `RunDebugTraceDecision` | missing action accepted, trace without evidence path/correlation id, secret-bearing raw log stored |
| HLX-FR-06 | HLX-C06 core-injection-contract | legacy core source, repo-local adapter source, generated target, required markers, consumer mode | `CoreInjectionDecision` | personal absolute path accepted, missing global file treated as current truth, generated asset lacks marker/provenance |
| HLX-FR-07 | HLX-C07 guard-surface-disposition | hook source, runtime surface, tool matcher, guard intent, parity target, test oracle | `GuardSurfaceDisposition` | unwired guard claimed as active, unsupported surface silently passes, no deferred reason |
| HLX-FR-08 | HLX-C08 agent-role-policy | agent/role source, task class, model family, slot, delegation boundary, review substitute | `AgentRolePolicyDecision` | self-review accepted, overpowered role/model allowed without approval, unbounded subagent execution |
| HLX-FR-09 | HLX-C09 workflow-inventory-map | workflow doc, trigger, pillar, layer/gate, current owner, adoption disposition | `WorkflowMappingDecision` | unknown workflow auto-routed, duplicate pillar counted twice, no new-plan marker |
| HLX-FR-10 | HLX-C10 data-registry-surface | legacy DB/registry/API source, state kind, projection target, provenance, public read model | `DataSurfaceDecision` | raw legacy DB/state imported, provenance missing, API exposed without read-model boundary |
| HLX-FR-11 | HLX-C11 continuous-run-control | trigger, queue lock, timebox, budget profile, stop condition, verification evidence | `ContinuousRunDecision` | uncontrolled auto-run, missing stop condition, budget overrun ignored |
| HLX-FR-12 | HLX-C12 learning-feedback-contract | feedback event, recipe source, learning result, target backlog, evidence link, review state | `LearningFeedbackDecision` | learning result closes acceptance by itself, unreviewed recipe mutates current truth, missing evidence link |

## §2 integration observation

| Contract | L8 observation |
|----------|----------------|
| HLX-C01 | work preflight blocks edits when objective/source/scope/acceptance are missing or inconsistent |
| HLX-C02 | technical user question requires TL advisor evidence or documented preference-only bypass |
| HLX-C03 | detector axis registry emits routeable findings and does not confuse stub/advisory with hard proof |
| HLX-C04 | recommender output is traceable and old runtime candidates are hardened/deferred before adoption |
| HLX-C05 | RUN & Debug trace joins command, expected action, observed evidence, missing action, and correlation id |
| HLX-C06 | core/adapter distribution separates repo-local source, generated consumer asset, global-file risk, and provenance |
| HLX-C07 | every legacy hook capability has an explicit wired/deferred/rejected guard-surface disposition |
| HLX-C08 | agent/role/model use is bounded by slot, task class, model family, and review-substitute policy |
| HLX-C09 | workflow inventory maps to existing pillar/workflow/gate or produces a new-plan-required decision |
| HLX-C10 | DB/registry/API concepts are projected through harness.db/read-model boundaries with provenance |
| HLX-C11 | scheduler/continuous-run controls require queue lock, budget, timebox, stop condition, and evidence |
| HLX-C12 | learning/feedback/recipe events create improvement candidates but cannot close acceptance alone |

## §3 L6 carry

The L6 design must define function signatures and DbC for all `HLX-C*` contracts. Each contract needs a paired
`U-HLX-*` oracle and must preserve the anti-corruption boundary from §1.
