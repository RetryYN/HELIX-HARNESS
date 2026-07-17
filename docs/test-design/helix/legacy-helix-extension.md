---
title: "HELIX test-design（検証設計） — 旧 HELIX extension 採用"
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

# HELIX test-design（検証設計） — 旧 HELIX extension 採用

旧 HELIX 由来 extension（拡張候補）の L3-L6 降下を、単一 pair test-design（ペア検証設計）で逆参照する。

## §1 coverage matrix（カバレッジ表）対応表

| 旧 source（旧ソース） | L3 | L4 | L5 | L6 oracle |
|---------------|----|----|----|-----------|
| `HELIX_RUNTIME_RULES.md` 由来 runtime rule（実行規則） | HLX-FR-01 | HLX-SYS-01 | HLX-C01 | U-HLX-001 |
| `pretooluse-askuserquestion.sh` 由来 user question guard（質問 guard） | HLX-FR-02 | HLX-SYS-02 | HLX-C02 | U-HLX-002 |
| `detectors/registry.py` / `axis_*.py` 由来 detector axis（検出軸） | HLX-FR-03 | HLX-SYS-03 | HLX-C03 | U-HLX-003 / U-HLX-004 |
| `skill_recommender.py` / `code_recommender.py` / `command_catalog.py` 由来 recommendation（推薦） | HLX-FR-04 | HLX-SYS-04 | HLX-C04 | U-HLX-005 |
| `helix-debug` / `helix-test-debug` 由来 RUN & Debug（実行デバッグ） | HLX-FR-05 | HLX-SYS-05 | HLX-C05 | U-HLX-006 |
| `core-manifest.tsv` / `HELIX_CORE.md` / runtime adapters 由来 core injection（中核注入） | HLX-FR-06 | HLX-SYS-06 | HLX-C06 | U-HLX-007 |
| `.claude/settings.json` / `.claude/hooks/*` 由来 hook surface（hook 境界） | HLX-FR-07 | HLX-SYS-07 | HLX-C07 | U-HLX-008 |
| `.claude/agents/*.md` / `cli/roles/*.conf` 由来 agent role（agent 役割） | HLX-FR-08 | HLX-SYS-08 | HLX-C08 | U-HLX-009 |
| `HELIX-workflows/helix-process/*.md` 由来 workflow（工程） | HLX-FR-09 | HLX-SYS-09 | HLX-C09 | U-HLX-010 |
| `helix_db.py` / registries / HTTP routes 由来 DB/API | HLX-FR-10 | HLX-SYS-10 | HLX-C10 | U-HLX-011 |
| `helix-auto-run` / scheduler / budget helpers 由来 continuous run（継続実行） | HLX-FR-11 | HLX-SYS-11 | HLX-C11 | U-HLX-012 |
| `learning_engine.py` / `feedback_hook.py` / recipes 由来 learning feedback（学習 feedback） | HLX-FR-12 | HLX-SYS-12 | HLX-C12 | U-HLX-013 |

## §2 oracle 定義

| Oracle | Contract（契約） | 期待動作 |
|--------|----------|-------------------|
| U-HLX-001 | `buildWorkPreflightDecision` | objective、workflow/layer、Forward return、acceptance/verification、work source、allowed scope が欠落または PLAN/handover と衝突する場合に作業を block する。 |
| U-HLX-002 | `classifyTechnicalQuestion` | 直近 TL advisor evidence が無い technical user question を deny する。preference-only bypass は reason/evidence 付きの場合だけ許可する。 |
| U-HLX-003 | `registerDetectorAxis` | axis id、phase gate、kind、severity、workflow route を必須にし、unknown axis は auto-route しない。 |
| U-HLX-004 | `routeDetectorFinding` | stub/advisory/fail-close を区別し、stub/advisory を hard proof として扱わせない。registry の detector kind と finding kind が一致しない場合も reject し、finding 側だけ `fail_close` と名乗る hard gate 昇格を許可しない。 |
| U-HLX-005 | `buildRecommendationDecision` | score/reason/references/role 付きで traceable な skill/code/command candidate を出し、legacy runtime path は harden または defer する。 |
| U-HLX-006 | `analyzeRunDebugTrace` | runtime surface、correlation id、evidence path 付きで matched/missing action を返す。incomplete trace は L7.5 acceptance を close できない。 |
| U-HLX-007 | `buildCoreInjectionContract` | repo-local source、generated adapter target、required marker、provenance、global-file risk を分離し、personal absolute path を current truth として拒否する。 |
| U-HLX-008 | `classifyLegacyHookSurface` | 各 legacy hook/guard を runtime surface、tool matcher、reason、oracle 付きで wired/deferred/rejected として記録する。unwired guard は active と claim できない。 |
| U-HLX-009 | `buildAgentRolePolicyDecision` | role kind、model family、slot、delegation boundary、review substitute を強制し、self-review と unbounded / overpowered delegation を deny する。 |
| U-HLX-010 | `mapWorkflowInventoryToPillar` | workflow docs を pillar/workflow/gate へ map し、未識別 workflow は new-plan-required を返す。unknown workflow は auto-route しない。 |
| U-HLX-011 | `classifyLegacyDbSurface` | DB/registry/API concept を harness.db/read-model/provenance boundary 経由で project し、raw legacy state import を拒否する。 |
| U-HLX-012 | `buildContinuousRunControlDecision` | continuous run を許可する前に、trigger、queue lock、timebox、budget profile、stop condition、verification evidence を要求する。 |
| U-HLX-013 | `buildLearningFeedbackDecision` | feedback/recipe/learning result を evidence と review state 付きで improvement backlog へ送る。learning-only output は acceptance を close できない。 |

## §3 非目標

- この採用では旧Python/Bash runtimeを一括起動経路として移植しない。選別済みPython意味コアはADR-010境界で採用できる。
- この採用では現行 machine identifier（機械識別子）を rename しない。CLI/state rename は引き続き `PLAN-M-02-helix-identifier-rename.md` が govern する。
- この採用では old HELIX catalog output を hardening なしに current truth（現行正本）として扱わない。
- 対応する L7 implementation と verification evidence が揃うまで、legacy hook、agent、scheduler、DB/API、learning engine の runtime parity を claim しない。
