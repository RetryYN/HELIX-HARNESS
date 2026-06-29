---
title: "HELIX test-design — old HELIX extension adoption"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: QA + AIM
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/design/helix/
related_l3: docs/design/helix/L3-requirements/legacy-helix-extension.md
related_l4: docs/design/helix/L4-basic-design/legacy-helix-extension.md
related_l5: docs/design/helix/L5-detail/legacy-helix-extension.md
related_l6: docs/design/helix/L6-function-design/legacy-helix-extension.md
---

# HELIX test-design — old HELIX extension adoption

旧 HELIX 由来 extension の L3-L6 降下を、単一 pair test-design で逆参照する。

## §1 coverage matrix

| Legacy source | L3 | L4 | L5 | L6 oracle |
|---------------|----|----|----|-----------|
| `HELIX_RUNTIME_RULES.md` | HLX-FR-01 | HLX-SYS-01 | HLX-C01 | U-HLX-001 |
| `pretooluse-askuserquestion.sh` | HLX-FR-02 | HLX-SYS-02 | HLX-C02 | U-HLX-002 |
| `detectors/registry.py` / `axis_*.py` | HLX-FR-03 | HLX-SYS-03 | HLX-C03 | U-HLX-003 / U-HLX-004 |
| `skill_recommender.py` / `code_recommender.py` / `command_catalog.py` | HLX-FR-04 | HLX-SYS-04 | HLX-C04 | U-HLX-005 |
| `helix-debug` / `helix-test-debug` | HLX-FR-05 | HLX-SYS-05 | HLX-C05 | U-HLX-006 |
| `core-manifest.tsv` / `HELIX_CORE.md` / runtime adapters | HLX-FR-06 | HLX-SYS-06 | HLX-C06 | U-HLX-007 |
| `.claude/settings.json` / `.claude/hooks/*` | HLX-FR-07 | HLX-SYS-07 | HLX-C07 | U-HLX-008 |
| `.claude/agents/*.md` / `cli/roles/*.conf` | HLX-FR-08 | HLX-SYS-08 | HLX-C08 | U-HLX-009 |
| `HELIX-workflows/helix-process/*.md` | HLX-FR-09 | HLX-SYS-09 | HLX-C09 | U-HLX-010 |
| `helix_db.py` / registries / HTTP routes | HLX-FR-10 | HLX-SYS-10 | HLX-C10 | U-HLX-011 |
| `helix-auto-run` / scheduler / budget helpers | HLX-FR-11 | HLX-SYS-11 | HLX-C11 | U-HLX-012 |
| `learning_engine.py` / `feedback_hook.py` / recipes | HLX-FR-12 | HLX-SYS-12 | HLX-C12 | U-HLX-013 |

## §2 oracle definitions

| Oracle | Contract | Expected behavior |
|--------|----------|-------------------|
| U-HLX-001 | `buildWorkPreflightDecision` | blocks work when objective, workflow/layer, Forward return, acceptance/verification, work source, or allowed scope is missing or conflicts with PLAN/handover |
| U-HLX-002 | `classifyTechnicalQuestion` | denies technical user questions without recent TL advisor evidence; allows preference-only bypass only with reason/evidence |
| U-HLX-003 | `registerDetectorAxis` | requires axis id, phase gate, kind, severity, workflow route; unknown axis does not auto-route |
| U-HLX-004 | `routeDetectorFinding` | distinguishes stub/advisory/fail-close and prevents stub/advisory from serving as hard proof |
| U-HLX-005 | `buildRecommendationDecision` | emits traceable skill/code/command candidates with score/reason/references/role and hardens or defers legacy runtime paths |
| U-HLX-006 | `analyzeRunDebugTrace` | returns matched/missing actions with runtime surface, correlation id, and evidence path; incomplete traces cannot close L7.5 acceptance |
| U-HLX-007 | `buildCoreInjectionContract` | separates repo-local source, generated adapter target, required marker, provenance, and global-file risk; rejects personal absolute paths as current truth |
| U-HLX-008 | `classifyLegacyHookSurface` | records each legacy hook/guard as wired, deferred, or rejected with runtime surface, tool matcher, reason, and oracle; unwired guards cannot be claimed active |
| U-HLX-009 | `buildAgentRolePolicyDecision` | enforces role kind, model family, slot, delegation boundary, and review substitute; denies self-review and unbounded or overpowered delegation |
| U-HLX-010 | `mapWorkflowInventoryToPillar` | maps workflow docs to pillar/workflow/gate or returns new-plan-required; unknown workflows are not auto-routed |
| U-HLX-011 | `classifyLegacyDbSurface` | projects DB/registry/API concepts through harness.db/read-model/provenance boundaries and rejects raw legacy state import |
| U-HLX-012 | `buildContinuousRunControlDecision` | requires trigger, queue lock, timebox, budget profile, stop condition, and verification evidence before continuous run is allowed |
| U-HLX-013 | `buildLearningFeedbackDecision` | sends feedback/recipe/learning results to improvement backlog with evidence and review state; learning-only output cannot close acceptance |

## §3 non-goals

- This adoption does not port Python/Bash runtime code.
- This adoption does not rename current machine identifiers. CLI/state rename remains governed by `PLAN-M-02-helix-identifier-rename.md`.
- This adoption does not treat old HELIX catalog output as current truth without hardening.
- This adoption does not claim legacy hook, agent, scheduler, DB/API, or learning engine runtime parity until corresponding L7 implementation and verification evidence exists.
