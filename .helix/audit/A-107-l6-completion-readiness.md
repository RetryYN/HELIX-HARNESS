# A-107 L6 completion readiness 事前 audit

日付: 2026-06-09
Scope: G6 に向けた L6 function-design completion readiness。
Status: not ready / Forward continuing の状態。

## Evidence

- `bun run lint`: green.
- `bun run typecheck`: green.
- `npx vitest run`: green, 33 files / 277 tests.
- `bun src\cli.ts doctor`: exit 0.
- `doctor l6-fr-coverage`: OK。FR registry 46 rows はすべて L6 unit contract と U-* oracle に対応済み。
- `doctor l6-completion`: not ready。`freeze-inputs OK` と `unit-contract substance gaps: 0` を確認済み。

## 現在の not-ready 条件

`l6-completion` は現時点で以下を報告している:

- L6 design docs は 18 total、18 draft。
- L6 freeze inputs: OK。status flip 前に owning-plan trace、L7 pair trace、unit-contract substance は complete。
- L6 unit-contract substance gaps は 0。
- L6 design/add-design PLANs は 11 draft。
- L7 unit-test-design は draft。
- G6 gate row は not reached。

## 追加した guard

PLAN-L6-22 / PLAN-L7-23 / PLAN-REVERSE-22 で、`l6-completion` を warn-only readiness lint として追加した:

- `src/lint/l6-completion.ts`
- `tests/l6-completion.test.ts`
- `src/doctor/index.ts` `checkL6Completion`

この guard は L6 doc status、owning `plan:` trace、L7 pair trace、L6 PLAN status/review evidence、L7 status、G6 status を確認する。L6 ready 前に false fail を作らず G6 audit で harden できるよう、現時点では意図的に warn-only としている。

`gate-confirm` も強化し、generated suffix text 付きの gate cell でも `G*` として parse できるようにした。これにより、G6 未到達のまま stale confirmed になっていた L6 docs 2 件が露出した。両方を `status: draft` に戻し、L6 master inventory を整合させた。

## G6 の completion criteria

L6 は以下を満たす場合にのみ complete と呼べる:

- `docs/design/harness/L6-function-design/*.md` 配下の全 file が `status: confirmed`、または confirmed PLAN により明示的に supersede されている。
- すべての L6 design doc が owning `plan:` reference に解決でき、L7 から filename で参照されている。
- すべての owning L6 design/add-design PLAN が `status: confirmed` で、有効な `review_evidence` を持つ。
- `docs/test-design/harness/L7-unit-test-design.md` が `status: confirmed` である。
- `docs/governance/gate-design.md` が G6 PASS を記録する、または対応する audit record を参照している。
- `l6-completion` が not-ready から OK に変わる。
- `l6-fr-coverage`、`pair-freeze`、`plan-schedule`、`review-evidence`、lint、typecheck、vitest、doctor が green のまま維持される。

## 残作業

- この session では G6 semantic review は未実施。
- draft の L6 docs と PLANs を flip する前に、cross-agent / independent reviewer evidence がまだ必要。
- したがって L6 completion はまだ達成されていない。
