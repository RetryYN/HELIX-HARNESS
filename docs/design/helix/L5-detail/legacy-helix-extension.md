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

## §2 integration observation

| Contract | L8 observation |
|----------|----------------|
| HLX-C01 | work preflight blocks edits when objective/source/scope/acceptance are missing or inconsistent |
| HLX-C02 | technical user question requires TL advisor evidence or documented preference-only bypass |
| HLX-C03 | detector axis registry emits routeable findings and does not confuse stub/advisory with hard proof |
| HLX-C04 | recommender output is traceable and old runtime candidates are hardened/deferred before adoption |
| HLX-C05 | RUN & Debug trace joins command, expected action, observed evidence, missing action, and correlation id |

## §3 L6 carry

The L6 design must define function signatures and DbC for all `HLX-C*` contracts. Each contract needs a paired
`U-HLX-*` oracle and must preserve the anti-corruption boundary from §1.
