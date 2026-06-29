---
title: "HELIX adoption design completion audit 2026-06-30"
status: confirmed
created: 2026-06-30
owner: TL (Codex)
scope:
  - upstream_ut_tdd_agent_harness_adoption
  - legacy_helix_extension_adoption
  - l7_5_run_debug_runtime_verification
  - visualization_discovery_ticket
---

# HELIX adoption design completion audit 2026-06-30

This audit is a semantic completion check. It does not treat file presence,
green tests, or prose volume as sufficient. A row is acceptable only when the
user request has a design meaning, a layer descent target, a test or
verification oracle, and an honest remaining-scope classification.

## §0 User-request trace IDs

| Trace ID | Original user request | Completion standard used in this audit |
|----------|-----------------------|-----------------------------------------|
| UR-01 | Check upstream `unison-ai-product/UT-TDD_AGENT-HARNESS` and adopt into HELIX | Current HEAD checked; adopted meaning is recorded as HELIX requirements/contracts, not raw upstream text |
| UR-02 | Fully lower upstream adoption from existing L3 to L6; L7 fork is allowed when directly adoptable | L3/L4/L5/L6 plus paired test-design trace exists; direct L7 implementation is called partial unless implemented and tested |
| UR-03 | Check old HELIX `RetryYN/ai-dev-kit-vscode` and lower extensions from existing L3 to L6 | Current HEAD checked; semantic extension groups from the checked old HELIX surface are mapped to L3/L4/L5/L6/test-design |
| UR-04 | Extend L7 implementation with L7.5 RUN & Debug | Runtime-verification contracts have source code and unit tests; real external runtime execution is not overclaimed |
| UR-05 | Add log design to L6 function design | Runtime verification log event fields, redaction, completeness, and projection boundary are defined at L6 |
| UR-06 | File a task/PLAN for VSCode Webview/View visualization from DB/Markdown, not LLM generation | L1 requirement and draft Discovery PLAN exist; implementation is explicitly out of scope for that ticket |
| UR-07 | Add verification strategy in addition to test strategy | Test-design docs distinguish test oracle from runtime verification strategy |
| UR-08 | Add performance NFR, adapter/plugin/settings prework, and HELIX rename direction | L3/L6/test evidence exists; implementation is partial where runtime enforcement or mechanical rename remains future scope |

## §1 Source freshness

| Source | Required check | Current evidence | Judgment |
|--------|----------------|------------------|----------|
| `unison-ai-product/UT-TDD_AGENT-HARNESS` | Check current upstream HEAD before claiming adoption basis | `git ls-remote` on 2026-06-30 returned `7f83ca811353ed90b3e981178a1b0c9977dd5863`, matching `source_upstream_commit_full` in `docs/design/helix/L3-requirements/upstream-substance-gap.md` | pass |
| `RetryYN/ai-dev-kit-vscode` | Check current legacy HEAD before claiming old HELIX adoption basis | `git ls-remote` on 2026-06-30 returned `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`, matching `source_legacy_commit_full` in `docs/design/helix/L3-requirements/legacy-helix-extension.md` | pass |
| Global HELIX CLI flow files | Session-start rule asks for `$HOME/ai-dev-kit-vscode/helix/HELIX_CORE.md`, `SKILL_MAP.md`, and `CODEX_TL_MODE.md` | These paths are absent in this execution environment. Repo-local `AGENTS.md`, `CLAUDE.md`, and UT-TDD/HELIX docs were used instead | residual risk |

Residual risk means the source commit basis is fresh, but the global local flow
files could not be read. This must not be hidden as full workflow compliance.

## §2 Requirement-to-design semantic map

| User request | Meaning that must be designed | Design evidence | Test / verification evidence | Implementation / PLAN evidence | Judgment |
|--------------|-------------------------------|-----------------|------------------------------|--------------------------------|----------|
| UR-01 / UR-02 | Adopt the upstream A-146 substance gaps as HELIX contracts, not as raw upstream prose. Cover guard governance, consumer PATH, green evidence integrity, telemetry provenance, distribution curation, FE substance, drive entry, and runtime matcher evidence | L3 `HU-FR-01..08` in `docs/design/helix/L3-requirements/upstream-substance-gap.md`; L4 boundaries in `docs/design/helix/L4-basic-design/upstream-substance-gap.md`; L5 contracts `HU-C01..08` in `docs/design/helix/L5-detail/upstream-substance-gap.md`; L6 functions `classifyUpstreamA146Finding` through `verifyRuntimeMatcherEvidence` in `docs/design/helix/L6-function-design/upstream-substance-gap.md` | `docs/test-design/helix/upstream-substance-gap.md` maps A146-1..8 to HU-FR, HUT-SYS, HU-C, and U-UPSTREAM oracles. `tests/vmodel-pair.test.ts` checks the commit marker and HU trace set | Some upstream hardening has L7 realization through adapter templates, runtime config cap, and telemetry provenance docs/tests, but the A146 L6 function contracts are not all product implementation yet | design descent pass; implementation partial |
| UR-03 | Extract old HELIX capability meaning while rejecting legacy Python/Bash runtime, `.helix` state, and personal paths. Preserve runtime discipline, technical question gate, detector axis registry, recommender catalog, RUN & Debug trace, core/adapter distribution, hook/guard suite, agent/role/model policy, workflow inventory, DB/registry/API surface, continuous-run controls, and learning/feedback loop | L3 `HLX-FR-01..12` in `docs/design/helix/L3-requirements/legacy-helix-extension.md`; L4 boundaries `HLX-SYS-01..12`; L5 contracts `HLX-C01..12`; L6 functions from `buildWorkPreflightDecision` through `buildLearningFeedbackDecision` in `docs/design/helix/L6-function-design/legacy-helix-extension.md` | `docs/test-design/helix/legacy-helix-extension.md` maps old HELIX source families to HLX-FR, HLX-SYS, HLX-C, and `U-HLX-001..013` oracles. `docs/test-design/harness/L7-unit-test-design.md` §1.24 and `tests/legacy-adoption.test.ts` exercise all 13 U-HLX oracles | `src/runtime/legacy-adoption.ts` implements the pure L7 decision contracts for all HLX L6 functions. This is not full legacy runtime parity; CLI/doctor wiring for each decision remains future scoped work | design descent pass; pure decision L7 slice pass; runtime wiring partial |
| UR-04 / UR-05 | Runtime behavior claims must not be accepted from projection-only rows. RUN & Debug needs an obligation model and append-only log event shape with redaction | L6 function contracts, `RuntimeVerificationLogEvent`, and append-only writer contract are in `docs/design/harness/L6-function-design/function-spec.md`; upstream L6 adoption also includes verification strategy/log design in `docs/design/helix/L6-function-design/upstream-substance-gap.md` | `docs/test-design/harness/L7-unit-test-design.md` §1.23 defines U-RUNDEBUG-001..006; `tests/run-debug.test.ts` and `tests/cli-surface.test.ts` exercise classification, obligation, projection rejection, log creation, completeness, and CLI append | `src/runtime/run-debug.ts` implements the L7.5 runtime-verification contracts and `ut-tdd run-debug log` appends complete events to `.ut-tdd/evidence/run-debug/runtime-verification.jsonl`. External Claude/Codex execution and DB projection collector are not included in this slice | pass for scoped L7.5 slice; external runtime launcher/DB collector remains future scope |
| UR-06 | Visualization is a read model over docs, harness.db, relation graph, and runtime evidence. LLM-generated diagrams are not the source of truth. Include progress, dependencies, skill/model/runtime telemetry, and action-binding constraints | L1 requirement §2.8 in `docs/design/helix/L1-requirements/pillar-requirements.md` | L1 operational test HOT-P9 and related overlays in `docs/test-design/helix/L1-pillar-operational-test-design.md` | Draft PLAN `docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md` defines VSCode Webview/View discovery, deterministic node/edge views, drill-down, read-only first, and non-goals | pass for requested ticketing scope; lower-layer implementation intentionally not started |
| UR-07 | Separate "does the code satisfy unit oracle" from "did the runtime behavior actually happen" | HELIX L3 verification overlay in `docs/design/helix/L3-requirements/pillar-functional-requirements.md`; L6 runtime verification function contracts in harness and upstream adoption docs | `docs/test-design/harness/L7-unit-test-design.md` §0.1; `docs/test-design/helix/L3/L4/L5/L6` verification-strategy sections | Implemented for RUN & Debug classification; broader runtime evidence remains staged through future contracts | pass for design; implementation partial |
| UR-08 | Consumer adapter templates must carry HELIX-branded Claude/Codex settings while preserving mechanical `ut-tdd` identifiers until the rename PLAN | Adapter template docs and setup fallback in `docs/templates/adapter/`, `src/setup/templates.ts`, `docs/design/harness/L6-function-design/setup-solo-team.md` | `tests/setup.test.ts`, distribution acceptance tests, and Codex hook adapter oracles | Implemented and tested for template generation/fallback. Direct hosted API hook enforcement and Codex subagent guard parity remain explicit residual risks | pass with declared boundary |
| UR-08 | Verification workload must have fast/default/full profiles, resource budgets, timeouts, and duration evidence | `HR-NFR-P5-03` in `docs/design/helix/L3-requirements/pillar-functional-requirements.md` | `HAT-N5-03`, `HST-N5-03`, `LIT-N5-03`, and `HU-PILLAR-N5-03` in HELIX test-design docs | Design and tests check presence; profile-specific p95/worker-count runtime enforcement is later implementation scope | pass for design descent; implementation partial |
| UR-08 | Prose should move to HELIX, but CLI/state/managed markers remain until atomic rename | `docs/plans/PLAN-M-02-helix-identifier-rename.md`; adapter templates now use HELIX prose while retaining `ut-tdd` and `UT-TDD:managed` where machine-bound | setup tests assert HELIX adapter text and marker boundary | Implemented for adapter templates; full mechanical rename is not done and must not be claimed | pass with deferred mechanical rename |

## §3 Feature-list audit

The current feature list is not "every file in old HELIX." It is a curated
semantic feature list. The inventory basis is:

- upstream `UT-TDD_AGENT-HARNESS` at `7f83ca811353ed90b3e981178a1b0c9977dd5863`: 372 plans,
  47 design docs, 6 test-design docs, 156 TS source files, 117 TS tests, 58 audit docs, and
  A-146 as the consolidated substance-gap remediation audit.
- old HELIX `ai-dev-kit-vscode` at `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`: 82 `helix*`
  commands, 139 `cli/lib` Python modules, 17 detector files, 14 builder files, 19 Claude
  agents, 31 role configs, 18 Claude hooks, 130 skills, 49 workflow docs, 35 verify scripts,
  and 98 Bats tests.

These counts are not target counts for import. They are the checked source surface used to
decide which meaning belongs in existing HELIX pillar docs, which meaning becomes `HU-FR-*`
or `HLX-FR-*`, and which legacy runtime assumption is rejected.

| Source family | Adopted feature meaning | Current HELIX ID range | Excluded legacy assumption |
|---------------|-------------------------|------------------------|----------------------------|
| Upstream A-146 audit | 8 substance gaps around distribution, runtime evidence, telemetry provenance, FE substance, and routing | `HU-FR-01..08`, `HU-C01..08`, `U-UPSTREAM-001..009` | raw upstream artifact names are not treated as current HELIX runtime state |
| Old HELIX runtime rules | Work preflight and fail-close discipline | `HLX-FR-01`, `HLX-C01`, `U-HLX-001` | `.helix/handover` and old `helix` CLI are not adopted as current state |
| Old HELIX question hook | Technical-user-question gate backed by TL advisor evidence | `HLX-FR-02`, `HLX-C02`, `U-HLX-002` | Claude shell hook implementation is not ported directly |
| Old HELIX detector registry | Axis registry and routeable detector findings | `HLX-FR-03`, `HLX-C03`, `U-HLX-003..004` | Python detector modules are not copied |
| Old HELIX recommender/catalog | Traceable skill/code/command candidate recommendation | `HLX-FR-04`, `HLX-C04`, `U-HLX-005` | raw legacy paths or Codex wrappers are not accepted as current execution paths |
| Old HELIX debug commands | RUN & Debug trace and missing-action analysis | `HLX-FR-05`, `HLX-C05`, `U-HLX-006` | legacy task log parser format is not the new source of truth |
| Old HELIX core / runtime adapters | Core injection and repo-local adapter distribution boundary | `HLX-FR-06`, `HLX-C06`, `U-HLX-007` | personal absolute paths and missing global files are not public truth |
| Old HELIX hook / guard suite | Guard-surface disposition for AskUserQuestion, agent guard, fire/stop guard, context bundle, plan auto-register, and skill catalog rebuild | `HLX-FR-07`, `HLX-C07`, `U-HLX-008` | unwired guard surfaces are not claimed as active |
| Old HELIX agents / roles | Typed role roster, slot policy, model-family constraint, and review-substitute boundary | `HLX-FR-08`, `HLX-C08`, `U-HLX-009` | persona files are not directly current runtime policy |
| Old HELIX workflow process docs | Pillar/workflow/gate inventory mapping | `HLX-FR-09`, `HLX-C09`, `U-HLX-010` | unknown workflow docs are not auto-routed |
| Old HELIX DB / registry / API modules | Harness DB projection, read-model, API boundary, and provenance | `HLX-FR-10`, `HLX-C10`, `U-HLX-011` | raw legacy DB/state/API is not imported as current state |
| Old HELIX scheduler / job / budget commands | Continuous-run control with queue lock, timebox, budget, stop condition, and evidence | `HLX-FR-11`, `HLX-C11`, `U-HLX-012` | uncontrolled auto-run is forbidden |
| Old HELIX learning / feedback / recipe modules | Improvement backlog and skill telemetry feedback loop | `HLX-FR-12`, `HLX-C12`, `U-HLX-013` | learning output alone cannot close acceptance |

Old HELIX family disposition is recorded in
`docs/design/helix/L3-requirements/legacy-helix-extension.md` §0.1. If the intended scope is
full old-HELIX product parity rather than HELIX-HARNESS semantic adoption, a separate
product-parity PLAN is still required. The present work satisfies "check the old HELIX
source surface, adopt extendable meaning, and lower the semantic extensions from existing
L3 to L6"; it does not claim direct command/skill/runtime parity.

## §4 Honest completion classification

| Area | Design descended to L6 | Test / verification paired | L7 implementation present | Can be called complete? |
|------|------------------------|----------------------------|---------------------------|--------------------------|
| Upstream A-146 adoption | yes | yes | partial | no, only design descent is complete |
| Old HELIX extension adoption | yes | yes | partial: pure decision contracts implemented, runtime/CLI parity not complete | no, semantic decision slice is complete but full runtime parity is not |
| L7.5 RUN & Debug runtime verification | yes | yes | yes, including append-only CLI evidence logging | yes for this scoped slice |
| Visualization Webview/View request | L1 + PLAN only by request | L1 operational acceptance only | no | yes for ticketing; no for implementation |
| Verification strategy | yes | yes | partial | no, runtime coverage is ongoing |
| Adapter templates/settings | yes | yes | yes for setup/template generation | yes with hosted-API hook boundary |
| Performance NFR | yes | yes | partial | no, runtime enforcement is later |
| HELIX rename | prose/template partial | tests cover boundary | partial | no, mechanical rename remains PLAN-M-02 |

## §5 Gate result

| Gate | Result | Reason |
|------|--------|--------|
| G-DESIGN-SEMANTIC | pass with residual risk | ①②③④ have explicit meaning-to-layer mapping. The residual risk is absent global HELIX flow files and any future request for full old-HELIX product parity beyond semantic adoption. |
| G-PAIR | pass | Upstream, legacy, L7.5, L1 visualization, verification strategy, performance NFR, and adapter template changes have paired test-design or test-code evidence. |
| G-IMPLEMENTATION-CLAIM | partial | L7.5 RUN & Debug, adapter/config/template changes, and the old HELIX pure decision contracts have implementation. Upstream A-146 contracts and full legacy runtime/CLI parity are not fully implemented. |
| G-ACCEPT | fail for whole user goal | The whole goal contains broad adoption and implementation language. It must remain open until residual risks are either accepted, planned, or implemented. |
