# CI critical-path scheduler Reverse fullback証拠

## 事実基準

- Forward PR: #1241
- candidate HEAD: `cc278ba36a279fc755dc0dc14c48004f22318258`
- Claude exact-HEAD review: https://github.com/RetryYN/HELIX-HARNESS/pull/1241#issuecomment-5471803374
- review receipt: `sha256:d5c6c2fd2cca253471d8d5252102e23a20cb491f308ebd313fdfb4f3a69b2d29`
- draft CI: `33339684343` success
- Ready CI: `33340806736` success
- canonical merge: `3ab64eb5aabb8e8b1163de73bfc29bad8719421f`
- read-after receipt: `sha256:723ee1b654ff9a2ca2b211e091f3e0534e4a12e8420c041edeb2b9a24e25d51b`
- main反映後のharness-check: `33341128585` success
- main反映後のCodeQL: `33341128519` success

## R0〜R3判定

required obligation exact set、artifact identity、resource budget、lease／fence、conservative fallback、bounded cancelは要求、
L6、L8、runtime、U-CISCHED-001〜014で一致する。schedulerはverification選定やworkflow実行を所有しない。

## Mutation oracle 実測（2026-08-31T13:56Z）

Reverseをconfirmedへ上げる前提として、oracleが実際にseeded defectをkillすることをworktree
`claude-pr1281`（HEAD `5895532e3a317a683e6e9cf4b6e1169a1d8b7a3a`）で実測した。将来の再実行約束ではない。

| id | seeded defect | oracle command | 実測結果 |
| --- | --- | --- | --- |
| M1 | `src/runtime/ci-critical-path-scheduler.ts` の `topoSort(obligations, findings)` を `.slice(0, -1)` へ改変し、required obligationを1件脱落させる | `npx vitest run tests/ci-critical-path-scheduler.test.ts` | 10 failed / 4 passed（14）。U-CISCHED-001「required obligation exact setを変更しない」を含む10 caseがkillした |
| M2 | Forward `docs/plans/PLAN-L7-707-ci-critical-path-scheduler.md` の `references` から `PLAN-REVERSE-707` 行を削除する | `npx vitest run tests/backfill-pairing.test.ts` | 1 failed / 35 passed（36）。`reverse_plan_id` 欠落としてReverse合流oracleがkillした |

両mutationとも改変を戻した後は当該oracleが再びgreenになることを確認済みで、kill判定がmutation起因で
あることを分離している。

## 未終端境界

本evidenceはReverse candidateの入力であり、本Reverse PRのcurrent-HEAD review、canonical merge、post-main read-afterを代替しない。
また、#1207の実GitHub Actions baseline比較は#1208のworkflow E2Eで実測する未完義務であり、本Reverseで速度効果を完了主張しない。
