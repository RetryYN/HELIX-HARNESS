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

## §2 oracle definitions

| Oracle | Contract | Expected behavior |
|--------|----------|-------------------|
| U-HLX-001 | `buildWorkPreflightDecision` | blocks work when objective, workflow/layer, Forward return, acceptance/verification, work source, or allowed scope is missing or conflicts with PLAN/handover |
| U-HLX-002 | `classifyTechnicalQuestion` | denies technical user questions without recent TL advisor evidence; allows preference-only bypass only with reason/evidence |
| U-HLX-003 | `registerDetectorAxis` | requires axis id, phase gate, kind, severity, workflow route; unknown axis does not auto-route |
| U-HLX-004 | `routeDetectorFinding` | distinguishes stub/advisory/fail-close and prevents stub/advisory from serving as hard proof |
| U-HLX-005 | `buildRecommendationDecision` | emits traceable skill/code/command candidates with score/reason/references/role and hardens or defers legacy runtime paths |
| U-HLX-006 | `analyzeRunDebugTrace` | returns matched/missing actions with runtime surface, correlation id, and evidence path; incomplete traces cannot close L7.5 acceptance |

## §3 non-goals

- This adoption does not port Python/Bash runtime code.
- This adoption does not rename current machine identifiers. CLI/state rename remains governed by `PLAN-M-02-helix-identifier-rename.md`.
- This adoption does not treat old HELIX catalog output as current truth without hardening.
