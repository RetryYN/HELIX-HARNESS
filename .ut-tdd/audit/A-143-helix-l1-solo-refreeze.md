# A-143 — HELIX L1 solo re-freeze (G-REQ.L1 PO sign-off)

- **Date**: 2026-06-28
- **Approver**: PO (RetryYN) — chat instruction: "L1をきれいにして...それが終わったらクローズ"
- **Plan**: PLAN-L1-06-helix-solo-conversion
- **Scope**: HELIX solo conversion L1 hub, HELIX pillar requirements, and L1/L14 pillar operational test pair.

## Decision

G-REQ.L1 re-freeze is accepted for the HELIX solo conversion slice.

Confirmed artifacts:

- `docs/plans/PLAN-L1-06-helix-solo-conversion.md`
- `docs/design/helix/L1-requirements/pillar-requirements.md`
- `docs/test-design/helix/L1-pillar-operational-test-design.md`

## Review Findings Closed

| Finding | Resolution |
|---|---|
| PLAN Step 4 stale claim said HOT-P2/P7 were implemented | Rewritten to `partial` with remaining GAPs. |
| Claude-centric closure risk | Added Codex runtime parity overlay to HBR-P2/HBR-P7/HNFR-AC and HOT-P2/HOT-P7/HOT-NAC. |
| Codex hosted API tool surface is not repo-hook-enforced | Captured explicit preflight requirement; direct Codex CLI/IDE hooks remain covered by `.codex/hooks.json`. |
| Codex subagent surface guard parity is deferred | Kept as explicit L3/L7 GAP; not treated as absent. |
| Final distribution / one-command full setup was only implicit in harness L1 | Added explicit HELIX L1 overlay: tag/release-pin distribution plus `ut-tdd setup` / future `helix setup` full bootstrap for hooks, Claude/Codex adapters, state, memory/handover, and GitHub rules/checks baseline. |
| Setup safety / adoption lifecycle needed sharper acceptance | Added non-destructive setup, existing-project onboarding, and tag-bump version-up/rollback requirements to the HELIX L1 overlay and HOT acceptance. |

## Gate Evidence

- `bun run src/cli.ts plan lint docs/plans/PLAN-L1-06-helix-solo-conversion.md` must pass.
- `bun run src/cli.ts vmodel lint` must pass.
- `bun run src/cli.ts doctor` must pass.

## Carry

- L3 descent must expand P6/P8 first.
- L3 P6/P9 descent must turn the distribution/full-setup overlay into FR+AC and keep setup apply operations action-bound, non-destructive, compatible with existing-project onboarding, and upgradeable via tag bump with migration/rollback evidence.
- L3 must primary-verify `pillar-requirements.md` §2.5 external-research delta before adopting concrete tools, numbers, or source claims.
- L3 must turn §2.6 Codex runtime parity overlay into FR+AC for typed agent-tool contracts, Codex subagent guard parity, hosted API preflight, and shared memory/provider handover behavior.
