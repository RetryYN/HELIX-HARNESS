# A-132 - L8-L14 verification band 実行

- **日付**: 2026-06-11
- **PLAN**: PLAN-M-00-verify-cutover
- **範囲**: `harness.db` roadmap/review projections を使った L8-L14 の local verification band execution
- **受入者**: Codex TL、intra-runtime review fallback

## 結果

`PLAN-VERIFY-CUTOVER-00` は local verification band について completed とする。

この execution は意図的に境界を限定している:

- L8-L11 と L14 は local audit/feedback rows として検証した。
- L12 と L13 は `human_required=1` 付きの `passed_local` として記録した。production deploy、post-deploy observation、PO signoff はこの local execution band の外側にあるため。
- production deployment、destructive cutover、credential change、vendor edit、infrastructure change は行っていない。

## 証跡

- `harness.db` rebuild は workflow `L8-L14-verification-band` について 7 件の `workflow_runs` を出力する。
- `harness.db` rebuild は gate ids `G-VERIFY.L8` から `G-VERIFY.L14` までの対応する `gate_runs` 7 件を出力する。
- `harness.db` rebuild は次の `coverage` rows を出力する:
  - `covered_program_bands = 5 / 5`
  - `reached_roadmap_gates = 20 / 20`
  - `passing_review_evidence = 2 / 2`
- `docs/plans/PLAN-M-00-verify-cutover.md` は現在 `status: completed`。

## 検証コマンド

- `npx vitest run tests/projection-writer.test.ts`
- `npx tsc --noEmit`
- `npx vitest run tests/projection-writer.test.ts tests/state-db.test.ts tests/roadmap.test.ts tests/review-evidence.test.ts tests/doctor.test.ts tests/verification-profile.test.ts tests/relation-graph.test.ts`
- `bun run src/cli.ts db rebuild --json`
- `bun run src/cli.ts doctor`

## 境界

この audit は local L8-L14 verification band execution を close する。production deployment、PO final UAT signoff、destructive HELIX identifier / state cutover の承認ではない。
