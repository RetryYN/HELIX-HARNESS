# HELIX Objective Evidence Audit

Updated: 2026-07-01

This audit maps the active user objective to current repository evidence. It is
not a replacement for the design documents; it is the requirement-by-requirement
index that proves where the semantic work is lowered, where it is implemented,
where it is intentionally deferred, and where full completion is still blocked.

External source heads checked on 2026-06-30:

- `unison-ai-product/UT-TDD_AGENT-HARNESS` default branch `main`: `7f83ca811353ed90b3e981178a1b0c9977dd5863`
- `RetryYN/ai-dev-kit-vscode` default branch `main`: `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`

Verification / progress source basis re-checked on 2026-07-01:

- NIST SSDF SP 800-218: verification and provenance evidence must remain inspectable rather than chat-only.
- ISO/IEC/IEEE 29148: requirements evidence is counted by requirement information and verification basis, not by implementation file count alone.
- ISTQB Glossary: test basis / test oracle semantics constrain progress claims; green execution without the right oracle is weak evidence.
- Scrum Guide 2020: progress toward the Product Goal is inspected/adapted, so blocked decision work remains visible instead of being hidden behind completed increments.

## Requirement Evidence Matrix

| ID | Objective requirement | Status | Authoritative evidence | Semantic proof |
|---|---|---|---|---|
| G-01 | Upstream `unison-ai-product/UT-TDD_AGENT-HARNESS` adoption is checked and lowered through HELIX L3-L6; L7 fork is allowed only for adoptable semantics. | proved | `docs/design/helix/L3-requirements/upstream-substance-gap.md`<br>`docs/design/helix/L4-basic-design/upstream-substance-gap.md`<br>`docs/design/helix/L5-detail/upstream-substance-gap.md`<br>`docs/design/helix/L6-function-design/upstream-substance-gap.md`<br>`docs/test-design/helix/upstream-substance-gap.md`<br>`src/runtime/upstream-adoption.ts`<br>`tests/upstream-adoption.test.ts`<br>`tests/vmodel-pair.test.ts` | Source commit is fixed as `7f83ca811353ed90b3e981178a1b0c9977dd5863`. A146 findings are named, mapped to HU-FR/HUT-SYS/HU-C/U-UPSTREAM, and L7 helpers reject hollow coverage, projection-only telemetry, blanket governance allow, and unverified runtime matcher claims. |
| G-02 | Old HELIX `RetryYN/ai-dev-kit-vscode` is checked and lowered through HELIX L3-L6 before extension. | proved | `docs/design/helix/L3-requirements/legacy-helix-extension.md`<br>`docs/design/helix/L4-basic-design/legacy-helix-extension.md`<br>`docs/design/helix/L5-detail/legacy-helix-extension.md`<br>`docs/design/helix/L6-function-design/legacy-helix-extension.md`<br>`docs/test-design/helix/legacy-helix-extension.md`<br>`src/runtime/legacy-adoption.ts`<br>`tests/legacy-adoption.test.ts`<br>`tests/vmodel-pair.test.ts` | Source commit is fixed as `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`. Old HELIX inventory is classified by meaning, not copied by file count; personal/global paths, raw legacy state, unknown workflows, and advisory-only detector output are rejected as current truth. |
| G-03 | L7 implementation is extended with L7.5 RUN & Debug, and L6 logging design improves maintainability. | proved | `docs/design/harness/L6-function-design/function-spec.md`<br>`docs/design/harness/L6-function-design/session-log.md`<br>`docs/design/harness/L5-detailed-design/physical-data.md`<br>`src/runtime/run-debug.ts`<br>`tests/run-debug.test.ts`<br>`tests/cli-surface.test.ts`<br>`tests/projection-writer.test.ts` | Runtime behavior claims require session/source/surface/timestamp/evidence and append-only `runtime-verification.jsonl`; accepted runtime verification is separated from projection-only evidence. Session-log remains fail-open and sanitized, while RUN & Debug closure is fail-close for incomplete runtime claims. |
| G-04 | VSCode Webview/View asset and progress visualization is added at L1 and planned, with DB/Markdown deterministic response verified before UI. | proved | `docs/design/helix/L1-requirements/pillar-requirements.md`<br>`docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md`<br>`docs/plans/PLAN-L7-206-visualization-read-model-response.md`<br>`docs/plans/PLAN-REVERSE-206-visualization-read-model-response.md`<br>`src/state-db/visualization-read-model.ts`<br>`tests/visualization-read-model.test.ts`<br>`tests/cli-surface.test.ts` | L1 requires deterministic DB/Markdown/relation-graph visualization. The first UI-facing response is `visualization-snapshot.v1` via `ut-tdd progress snapshot --json`; Webview/View implementation is a later renderer and must not become the authoring source or accept projection-only runtime evidence. |
| G-05 | L7 roadmap is defined by feature packs including database, service, frontend, UI, and supporting verification. | proved | `docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md`<br>`docs/plans/PLAN-REVERSE-207-l7-feature-pack-roadmap-definition.md`<br>`docs/design/harness/L6-function-design/function-spec.md`<br>`src/schema/roadmap.ts`<br>`src/lint/roadmap-registry.ts`<br>`tests/roadmap.test.ts` | Roadmap schema carries `feature_packs[]` and `span.feature_pack`; doctor fails when database/service/frontend/ui packs are missing. UI implementation remains visible as a deferred feature-pack span, so DB/read-model work cannot silently close UI. |
| G-06 | Test-design side includes verification strategy, not only test strategy. | proved | `docs/test-design/helix/L3-pillar-acceptance-test-design.md`<br>`docs/test-design/helix/L4-pillar-system-test-design.md`<br>`docs/test-design/helix/L5-pillar-integration-test-design.md`<br>`docs/test-design/helix/L6-pillar-unit-test-design.md`<br>`docs/test-design/harness/L7-unit-test-design.md`<br>`tests/vmodel-pair.test.ts` | The right-arm documents distinguish unit/system/integration/acceptance tests from runtime verification claims. Runtime parity, visualization, and acceptance closure require L7.5 evidence or explicit substitute oracles rather than count-only test presence. |
| G-07 | ClaudeCode and Codex plugin/config setup is preimplemented so new HELIX adoption pulls internal adapter configuration. | proved | `.claude/settings.json`<br>`.codex/config.toml`<br>`.codex/hooks.json`<br>`src/setup/templates.ts`<br>`src/lint/codex-hook-adapter.ts`<br>`tests/setup.test.ts`<br>`tests/codex-hook-adapter.test.ts`<br>`tests/doctor.test.ts` | Setup emits Claude/Codex adapter templates, including Codex hooks feature enablement. Doctor now proves both `.codex/hooks.json` wiring and `.codex/config.toml` `[features].hooks=true`; hosted/API tools remain explicitly outside mechanical hook coverage. |
| G-08 | L3 includes test/verification performance NFR and UT-TDD naming is being moved to HELIX. | proved | `docs/design/helix/L3-requirements/pillar-functional-requirements.md`<br>`docs/test-design/helix/L3-pillar-acceptance-test-design.md`<br>`docs/test-design/helix/L6-pillar-unit-test-design.md`<br>`tests/vmodel-pair.test.ts`<br>`tests/rule-drift.test.ts` | `HR-NFR-P5-03` defines fast/default/full profiles, worker/resource budget, timeout, p95 duration budget, and evidence. HELIX prose is the product language; machine identifiers such as `ut-tdd`, `.ut-tdd`, and `UT-TDD:managed` are intentionally deferred to `PLAN-M-02` to avoid unsafe partial rename. |
| G-09 | The completion claim is semantic, not only quantitative. | proved | `docs/governance/helix-objective-evidence-audit.md`<br>`src/lint/objective-evidence-audit.ts`<br>`tests/goal-evidence-audit.test.ts`<br>`tests/upstream-adoption.test.ts`<br>`tests/legacy-adoption.test.ts`<br>`tests/roadmap.test.ts`<br>`tests/doctor.test.ts`<br>`bun run src/cli.ts status --json` | Evidence rows require current-source commits, L3-L6 descent, L7 decision/oracle coverage, doctor gates, and explicit non-goals. File counts, green test counts, or roadmap span counts alone do not prove adoption. `objectiveProgress` is evidence-row based: current progress is 90% (9/10 objective rows proved), while `completionClaimAllowed=false` because G-10 remains blocked. |
| G-10 | L14 / whole-program completion is claimed only when no outstanding PLAN, version-up parked item, PO/S4 decision, human approval, irreversible migration, or open defer remains. | blocked | `bun run src/cli.ts status --json`<br>`src/lint/outstanding.ts`<br>`src/lint/completion-decision-packet.ts`<br>`tests/outstanding.test.ts`<br>`tests/completion-decision-packet.test.ts`<br>`tests/cli-surface.test.ts`<br>`docs/process/forward/L08-L14-verification-phase.md`<br>`docs/process/gates.md` | Current `outstanding.completionReadiness.ok=false`; blockers are `human_approval_pending`, `irreversible_migration_pending`, `non_terminal_plans`, `po_decision_pending`, and `version_up_parked`. Outstanding plans are `PLAN-DISCOVERY-07-design-bottomup-mode`, `PLAN-DISCOVERY-10-helix-asset-visualization`, `PLAN-L7-146-serverless-readonly-share`, and `PLAN-M-02-helix-identifier-rename`. Therefore the active objective is not complete even though the verification and workflow hardening slices are green. Required actions remain: record the PO/S4 decision before promotion, rejection, or Forward merge; record required human/action-binding approval before executing the high-impact action; keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion; obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work. |

## Objective Progress

`objectiveProgress` is emitted by `ut-tdd status --json` from the same audit
matrix and current `outstanding.completionReadiness`. The percentage is not a
whole-program completion claim:

- method: `objective-evidence-audit.v1`
- percent: 90
- provedRequirements: 9
- totalRequirements: 10
- blockedRequirements: 1
- completionClaimAllowed: false

G-10 is the remaining blocked requirement. The percentage must stay coupled to
`completionClaimAllowed=false` until `outstanding.completionReadiness.ok=true`.

## Known Non-Goals

- This audit does not claim that the VSCode extension or Webview renderer is
  implemented. The requirement here is L1 requirement, plan ticket, and verified
  deterministic response before UI.
- This audit does not claim old HELIX runtime parity by directly porting Python,
  Bash, personal paths, `.helix` state, or global config.
- This audit does not rename machine identifiers in-place. The safe atomic
  rename remains the `PLAN-M-02` migration scope.
- This audit does not claim L14 / whole-program completion while
  `outstanding.completionReadiness.ok=false`.
