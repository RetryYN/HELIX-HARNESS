---
title: "HELIX L0-L8 semantic design consistency audit"
status: confirmed
created: 2026-06-30
updated: 2026-07-01
owner: Codex
plan: PLAN-L7-210-l0-l8-design-consistency-audit
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
---

# HELIX L0-L8 semantic design consistency audit

This audit checks the meaning chain, not only the amount of files or green
commands. It separates three states:

- `proved`: the design/test-design chain is semantically traced and current
  machine evidence supports the claim.
- `frontier`: the chain is visible and intentionally not closed yet.
- `warning`: the chain is usable, but a naming or evidence ambiguity must stay
  visible so it is not mistaken for completion.

## Verdict

L0-L6 design descent is semantically consistent for the 2026-06-28 confirmed HELIX pillar
overlay: P0/P1/P2/P3/P4/P6/P7/P8/P9 are lowered from charter to L1 HBR/HNFR,
to 43 L3 requirements, to 10 L4 blocks, to 10 L5 contracts, and to 30 L6
function contracts with L7/L8/L9/L12/L14 paired test-design artifacts. P5 is
not missing: charter P5 is context efficiency, and the confirmed design lowers
it as `HNFR-P5` because it constrains P1 autonomy, P3 verification workload, and
handover/injection behavior rather than defining an independent business
capability. The absence of `HBR-P5` / `HB-P5` / `HC-P5` is therefore an
intentional meaning decision, not an uncovered pillar.

For the pre-amendment L0-L8 boundary, the current evidence is narrow-complete:
selected L8/G8 workflow closure is green, the L7 feature-pack roadmap has no
rollup frontier, `PLAN-L7-141-web-dashboard-component-derived` landed a first
component-derived UI slice, and `PLAN-L7-146-serverless-readonly-share` is
intentionally parked as `version_target: future` rather than counted as an
active L7 frontier.

This is not the same as universal product/runtime completion. The screen
implementation declaration remains intentionally unset until the L10 UX/WCAG
pair is reached. L1/L14 also still marks several pillar capabilities as
`partial` or `not-implemented` at runtime level. In addition, the 2026-06-30
asset/progress visualization requirement is captured at L1 §2.8 / HOT-P9 and
has a verified read-model first response, but its Discovery PLAN is still S3
with S4 PO decision pending. Because this is a requirements amendment after the
confirmed 43-item L3 descent, the revised user request is not L0-L8 complete.
Until S4 confirms and routes follow-up work, it must not be counted as
L3/L4/L5/L6/L7 fully descended. Those are visible frontier states, not proof
that everything through runtime/product delivery is complete.

## Audit Table

| ID | Claim checked | Status | Evidence | Decision |
|----|---------------|--------|----------|----------|
| C-01 | L0 charter P0-P9 are still the semantic north star and include full autonomy, strong verification, memory, external grounding, GitHub automation, and DB convergence. | proved | `docs/design/helix/L0-charter/helix-charter_v0.1.md` | Keep L0 as the source of intent; do not reduce the scope to implementation-count progress. |
| C-02 | L1 lowers the charter pillars into HBR/HNFR and explicitly distinguishes existing harness reuse from HELIX net-new gaps. | proved | `docs/design/helix/L1-requirements/pillar-requirements.md` | Treat GAP columns as design obligations; do not double-define existing harness FR. |
| C-03 | L1 operational tests correctly prevent false runtime completion claims. | proved | `docs/test-design/helix/L1-pillar-operational-test-design.md` | `partial` and `not-implemented` are authoritative runtime-state signals; they are not defects in L1 descent. |
| C-04 | L3 covers every 2026-06-28 frozen L1 pillar and NFR with 43 requirements and acceptance criteria. | proved | `docs/design/helix/L3-requirements/pillar-functional-requirements.md`, `docs/test-design/helix/L3-pillar-acceptance-test-design.md` | L3 is quantity-closed and meaning-closed for the frozen pillar overlay, not for later L1 amendments. |
| C-05 | L4 preserves the meaning of the 43 L3 requirements as 10 responsibility blocks instead of collapsing them into a generic roadmap. | proved | `docs/design/helix/L4-basic-design/pillar-basic-design.md`, `docs/test-design/helix/L4-pillar-system-test-design.md` | The block model is the correct semantic design level for P0/P1/P2/P3/P4/P6/P7/P8/P9/AC. |
| C-06 | L5 creates integration-observable contracts and pairs every L3 item to an L8 `LIT-*` case. | proved | `docs/design/helix/L5-detail/pillar-detail-design.md`, `docs/test-design/helix/L5-pillar-integration-test-design.md` | L5/L8 is design-complete for the 43-item integration test design surface. |
| C-07 | L6 lowers L5 contracts to implementable function families and L7 oracles. | proved | `docs/design/helix/L6-function-design/pillar-function-design.md`, `docs/test-design/helix/L6-pillar-unit-test-design.md` | L6 is the current function-contract source for future L7 implementation slices. |
| C-08 | L8/G8 workflow has executable closure for selected integration coverage, but not universal product completion. | proved | `docs/test-design/harness/L8-integration-test-design.md`, `tests/g8-integration-workflow.test.ts`, `.ut-tdd/evidence/g8-integration/` | Current doctor result `g8-integration-workflow - OK (it_cases=43, manifests=2, selected_it=12, mandatory_it=6)` closes the selected G8 workflow profile only. |
| C-09 | L7 feature-pack semantics expose DB/service/frontend/UI/verification responsibilities, and the UI pack now has a first implementation slice. | proved | `docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md`, `docs/plans/PLAN-L7-141-web-dashboard-component-derived.md`, `tests/roadmap.test.ts`, `tests/web.test.ts` | `G-L7PACK.C` is reached after `PLAN-L7-141` became confirmed; DB/read-model work no longer masks the UI pack. |
| C-10 | Roadmap rollup no longer has an L7 feature-pack frontier. | proved | `bun run src/cli.ts doctor` on 2026-06-30 | Doctor reports `roadmap-rollup ... gates 23/23 ... spans 88/88 / frontier: なし`. This closes the L0-L8 roadmap frontier. |
| C-11 | Drive model execution says this request must not be narrowed automatically and parks out-of-scope delivery through version-up. | proved | `bun run src/cli.ts task classify --design-docs --json`, `bun run src/cli.ts team suggest --design-docs --mode hybrid --json`, `bun run src/cli.ts route eval --signal design_drift --format json`, `bun run src/cli.ts route eval --signal version_deferral --format json` | Classification is `drive=fullstack`, `drive_confidence=0.6`, finding `low-drive-confidence`; design drift routes to `mode=reverse`; `version_deferral` routes to `mode=version-up`; cheap docs lanes cannot close risk. |
| C-12 | Screen/UI surface has a post-L8 L10 declaration frontier, not an L0-L8 blocker. | frontier | `bun run src/cli.ts doctor`, `docs/plans/PLAN-L7-141-web-dashboard-component-derived.md`, `src/web/`, `tests/web.test.ts` | Doctor reports `screen-impl-pair-freeze - OK (実装宣言なし = mock 段階, next_pair_freeze=L10)`. The repo now has component-derived `src/web` code; `implemented_screens` is intentionally declared only at the L10 UX/WCAG pair. |
| C-14 | Serverless read-only sharing is parked by version-up and does not reopen L7/L8. | proved | `docs/plans/PLAN-L7-146-serverless-readonly-share.md`, `docs/process/modes/version-up.md`, `bun run src/cli.ts status --json`, `bun run src/cli.ts route eval --signal version_deferral --format json` | `PLAN-L7-146` remains `status=draft` + `version_target: future`, and status reports `versionUpParked=1`. Its Cloudflare/HMAC/access-control scope is future delivery, not an active L7/L8 completion gap. |
| C-15 | Charter P5 is intentionally lowered as `HNFR-P5`, not as an independent HBR/block/contract. | proved | `docs/design/helix/L1-requirements/pillar-requirements.md`, `docs/design/helix/L3-requirements/pillar-functional-requirements.md`, `docs/design/helix/L4-basic-design/pillar-basic-design.md`, `docs/design/helix/L5-detail/pillar-detail-design.md`, `docs/design/helix/L6-function-design/pillar-function-design.md`, `tests/vmodel-pair.test.ts` | Context efficiency is a cross-cutting nonfunctional constraint: it descends to `HR-NFR-P5-01..03`, `HB-P1` / `HB-P3`, `HC-P1` / `HC-P3`, and `mergeAnchoredHandover` / `selectVerificationProfile`. Do not create or expect `HBR-P5`, `HB-P5`, or `HC-P5` unless L1 is explicitly re-opened. |
| C-16 | The 2026-06-30 asset/progress visualization request is recorded, but not fully descended past S4. | frontier | `docs/design/helix/L1-requirements/pillar-requirements.md` §2.8, `docs/test-design/helix/L1-pillar-operational-test-design.md`, `docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md`, `docs/plans/PLAN-L7-206-visualization-read-model-response.md`, `tests/visualization-read-model.test.ts` | L1/HOT-P9 and the deterministic read-model response are real. S4 PO decision pending remains the governing state, so follow-up L3 visualization requirements, L4 UI/data boundary, L5 graph/read-model/drill-down contract, L6 view-model contracts, and L7 VSCode Tree View/Webview implementation are not yet confirmed Forward work. |
| C-17 | The 2026-07-01 re-read checks the feature list by meaning, including pair-agent, setup/rename, visualization amendment, and outstanding workflow blockers. | proved | `docs/design/helix/L1-requirements/pillar-requirements.md`, `docs/design/helix/L3-requirements/pillar-functional-requirements.md` §0.2, `docs/design/helix/L6-function-design/pillar-function-design.md` §0.1 / §4.0, `docs/test-design/helix/L6-pillar-unit-test-design.md`, `src/orchestration/pair-agent.ts`, `src/state-db/projection-writer.ts`, `tests/pair-agent.test.ts`, `tests/projection-writer.test.ts`, `tests/setup.test.ts`, `tests/cli-surface.test.ts`, `bun run src/cli.ts handover status --json` | The feature list is aligned only with this boundary: pair-agent TDD is implemented with Red/oracle-before-implementation, bounded fix transcript, Green/review pass evidence, `--save-evidence`, and DB projection; setup exposes current `ut-tdd setup project` while keeping future `helix setup project` unavailable before PLAN-M-02 approval; visualization is S4-pending; version-up parked work and irreversible rename remain blockers. This re-read does not permit a whole-program completion claim. |
| C-13 | Charter filename/version is a citation ambiguity. | warning | File path `docs/design/helix/L0-charter/helix-charter_v0.1.md` contains title/version `v0.2`. | Do not rename in this audit because many trace references point to the current path. Record as naming carry for a later atomic migration. |

## Drive-Model Optimization

The drive model was not used as a rubber stamp. It changed the process:

- `low-drive-confidence` increases review granularity instead of shrinking the
  document set.
- Recommended team route is `proposal-coverage-team` with four read-only docs
  shards and a single TL review owner; mini lanes cannot close risk.
- `design_drift` routes to Reverse mode with preflight and no auto-apply.
- `version_deferral` routes to version-up mode, which keeps `PLAN-L7-146`
  visible without reopening the current L0-L8 roadmap frontier.
- The audit therefore records post-L8 and future-version work explicitly
  instead of hiding it behind the word "complete".

## Completion Boundary

The current defensible completion statement is:

L0-L6 semantic design descent is complete and paired only for the 2026-06-28
frozen 43-item pillar overlay. L8 selected workflow verification is complete
for the current G8 profile. L7 feature-pack roadmap coverage is complete,
including the UI pack. The revised request that includes the 2026-06-30
visualization amendment is not L0-L8 complete.

The remaining visible work is outside that boundary: L10 screen implementation
declaration / UX-WCAG proof, `PLAN-DISCOVERY-10` S4 visualization decision and
its downstream L3/L4/L5/L6/L7 route, future-version serverless sharing
(`PLAN-L7-146`), L14 identifier rename, and other product/runtime pillar
hardening. Those items must stay visible. They must not be hidden behind the
word "complete", and they also must not be used to reopen the narrower
confirmed-pillar L0-L8 evidence claim.

## 2026-07-01 Re-Read Addendum

This re-read was done because a count-based or time-boxed review is not enough
to answer whether the current design still matches the changed request. The
result is:

| Meaning unit | Current design answer | Evidence checked | Completion effect |
|--------------|-----------------------|------------------|-------------------|
| Pair-agent TDD route | Aligned. The smart agent starts with `smart_test_author` and must emit Red/oracle markers before light implementation. The light agent cannot close, must emit implementation evidence or consultation, and smart review must return Green/review pass evidence or a fix instruction for fail. | `src/orchestration/pair-agent.ts`, `tests/pair-agent.test.ts`, `docs/design/helix/L6-function-design/pillar-function-design.md` §4.0 | Counts as implemented pair-agent workflow evidence, not as CI/merge or whole-program completion. |
| Pair-agent evidence and DB convergence | Aligned. `--save-evidence` writes replayable `.ut-tdd/evidence/pair-agent/*.json`; DB rebuild projects phase agents, run gate, and frontier approval into `model_runs`, `gate_runs`, and `guardrail_decisions`. | `src/cli.ts`, `src/state-db/projection-writer.ts`, `tests/projection-writer.test.ts` | Supports traceability. Projection-only rows remain supporting evidence and do not close runtime claims by themselves. |
| Setup and HELIX command naming | Aligned after the latest correction. The active setup command is `ut-tdd setup project`; `helix setup project` is a future target and remains unavailable before PLAN-M-02 cutover/action-binding approval. | `docs/design/helix/L3-requirements/pillar-functional-requirements.md`, `docs/design/helix/L6-function-design/pillar-function-design.md`, `tests/setup.test.ts`, `tests/cli-surface.test.ts` | Prevents setup success from being misread as `.ut-tdd -> .helix` rename completion. |
| Asset/progress visualization amendment | Not complete. L1 §2.8 and first read-model response exist, but S4 PO decision is still pending before L3/L4/L5/L6/L7 visualization descent. | `docs/design/helix/L1-requirements/pillar-requirements.md` §2.8, `docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md`, `tests/visualization-read-model.test.ts` | Frontier remains open; revised request cannot be called fully descended. |
| Whole-program/L14 completion | Not complete. Current handover status still reports blockers: `human_approval_pending`, `irreversible_migration_pending`, `po_decision_pending`, `version_up_parked`, and non-terminal plans. | `bun run src/cli.ts handover status --json` | Completion claim is blocked regardless of doctor/test green. |

## PO Question Ledger

The current answer to the repeated PO questions is intentionally narrow:

| PO question | Current answer | Governing artifact |
|-------------|----------------|--------------------|
| 要求と要件定義はずれていないのか | The frozen 2026-06-28 L1 -> L3 chain is aligned for 43 confirmed HR items. The 2026-06-30 visualization amendment is not yet L3 confirmed. The 2026-07-01 re-read confirms this is an intentional frontier, not a hidden completion. | `pillar-functional-requirements.md` §0.2 / C-17 |
| 機能一覧は本当に合っているのか | The feature list is correct only when read as confirmed 43 items plus explicit frontiers: visualization S4, rename cutover approval, version-up parked work, and runtime/product hardening. Pair-agent and setup/rename are aligned with their current approval boundaries. | `pillar-functional-requirements.md` §0.2 / `pillar-function-design.md` §0.1 / C-17 |
| 要求修正が入ったのに中身も合っているのか | The content is not claimed fully descended after the amendment. The amendment is visible at L1/HOT-P9 and S3 read-model evidence, but L3/L4/L5/L6/L7 follow-up is blocked on S4. | C-16 / `PLAN-DISCOVERY-10` |
| ワークフローに従っているのか | Discovery S3 is kept draft/outstanding until S4 PO decision; version-up parked is not active completion; irreversible rename is blocked until cutover/action-binding approval. | `docs/process/modes/discovery.md`, `docs/process/modes/version-up.md`, `PLAN-M-02` |
| 全部終わっているのか | No. Whole-program completion is blocked by outstanding S4 decisions, parked version-up work, and approval-gated cutover. Doctor green or selected L0-L8 design evidence is not a full completion claim. | `ut-tdd handover status --json` / completion readiness |
