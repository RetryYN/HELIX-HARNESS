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

## Mutation oracleの独立再測定

Codex TLは2026-08-31T15:14Z、PR #1286の専用worktree（基準HEAD
`419c39494e89dc61c4119536c1bf649f1c7cda51`）で、次の変異を一件ずつ適用した。これは旧PRの測定値を
転記したものではなく、各変異のredと復元後greenをcurrent treeで再取得した記録である。

| mutation | 注入内容 | 検出結果 |
| --- | --- | --- |
| M1 | schedulerのtopological orderへ`.slice(0, -1)`を加え、最後のrequired obligationを欠落させた | `tests/ci-critical-path-scheduler.test.ts`: 10 failed / 4 passed。U-CISCHED-001を含むexact-set oracleが検出 |
| M2 | Forward PLAN-L7-707の`references`からReverse PLANへのedgeを除去した | `tests/backfill-pairing.test.ts`: 1 failed / 35 passed。`reverseLinkMissing`へPLAN-L7-707を投影して検出 |

M1とM2は同時適用せず、それぞれ検出後に元の正本へ戻した。復元後の合同実行は2 suites、50 testsすべてgreenで、
redが既存failureではなく注入した差分に起因することを確認した。

## 未終端境界

本evidenceはReverse candidateの入力であり、本Reverse PRのcurrent-HEAD review、canonical merge、post-main read-afterを代替しない。
また、#1207の実GitHub Actions baseline比較は#1208のworkflow E2Eで実測する未完義務であり、本Reverseで速度効果を完了主張しない。
