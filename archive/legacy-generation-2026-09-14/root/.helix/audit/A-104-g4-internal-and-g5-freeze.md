# A-104 - G4 internal asset closure と G5 L5 freeze (2026-06-08)

## Verdict

G4 residual scope と G5 freeze は PASS。

- G4 residual: PLAN-L4-10 から PLAN-L4-13 が、まだ separate-scope かつ未 freeze として記録されていた唯一の L4 items。
- G5 scope: PLAN-L5-00 から PLAN-L5-07、4 件の L5 detailed-design docs、L8 integration test design。
- Reviewer mode: この session は CLI TL driven のため intra_runtime_subagent (`codex-tl`)。
- Blocking issues: 0。

## G4 residual の closure

残っていた L4 scope は core L4 design set ではない。Core L4 は A-101/A-102/A-103 で既に pass 済みだった。residual は internal asset branch だった:

- PLAN-L4-10 internal asset master
- PLAN-L4-11 roster
- PLAN-L4-12 skill-pack
- PLAN-L4-13 drift-lint

Closure evidence:

- Each PLAN is now `status: confirmed`.
- 各 PLAN は `tests_green_at <= reviewed_at` の review evidence を持つ。
- 各 PLAN は L9 と pair 済みで、L5-05/L5-06/L5-07 へ decomposed 済み。
- L8 IT-ASSET-01 から IT-ASSET-07 が integration boundary を cover している。

## G5 freeze の scope

L5 confirmed artifacts:

- `docs/design/harness/L5-detailed-design/physical-data.md`
- `docs/design/harness/L5-detailed-design/module-decomposition.md`
- `docs/design/harness/L5-detailed-design/internal-processing.md`
- `docs/design/harness/L5-detailed-design/if-detail.md`
- `docs/test-design/harness/L8-integration-test-design.md`
- `docs/plans/PLAN-L5-00-master.md`
- `docs/plans/PLAN-L5-01-physical-data.md`
- `docs/plans/PLAN-L5-02-module-decomposition.md`
- `docs/plans/PLAN-L5-03-internal-processing.md`
- `docs/plans/PLAN-L5-04-if-detail.md`
- `docs/plans/PLAN-L5-05-roster.md`
- `docs/plans/PLAN-L5-06-skill.md`
- `docs/plans/PLAN-L5-07-drift.md`

## L8 granularity の補正

L8 は以前 candidate skeleton であり、G5 を支えられなかった。この audit では、以下の GWT-level rows を追加して L8 を freeze する:

- IT-CONTRACT-01 through IT-CONTRACT-03
- IT-ADAPTER-01 through IT-ADAPTER-03
- IT-MODULE-01 through IT-MODULE-02
- IT-STATE-01 through IT-STATE-02
- IT-ASSET-01 through IT-ASSET-07

各 row は Given、When、Then、fixture/boundary、assertions、negative/edge coverage を含む。

## Carry

以下は G5 blocker ではない:

- L6: function signatures、pseudocode、resolver/scoring/regex details を扱う。
- L7: TypeScript implementation と vitest materialization。
- Security/PO: authentication と secret-management の operational decision は human/security approval carry のまま。G5 は policy boundary を freeze するが、credentials や production authentication choices は freeze しない。

## Verification commands の一覧

この audit の final verification には以下を含める必要がある:

- `bun run lint`
- `bun run typecheck`
- `npx vitest run`
- `bun run src/cli.ts doctor`
- PLAN-L4-10 から PLAN-L4-13、および PLAN-L5-00 から PLAN-L5-07 に対する targeted `helix plan lint`
