# Kimi独立レビューlane admission通し稽古（2026-08-11）

- Issue: #390
- PLAN: `PLAN-RECOVERY-48-kimi-admission-rehearsal`
- behavior contract: `KIMI-REVIEW-FALLBACK-001`
- 状態: 実行中

## 目的

PLAN-RECOVERY-39で実装したadmission benchと、PLAN-RECOVERY-40で導入したlane closure digestを、
実在するClaude bootstrap review receiptからKimi provider-neutral review receiptまで接続できるか実測する。
本記録は途中状態を成功として扱わず、各段のread-after evidenceが揃った時点で結果を確定する。

## 固定した実行順序

1. Codex authored PRのcurrent HEADでlane closure全7 pathsをClaude本人runtimeが独立reviewする。
2. 同一HEADのCI terminal successとDB convergenceを確認し、Claude本人runtimeがcanonical receiptをsealする。
3. 同一HEADで実Kimi bench 5件とnegative mutation 6件を実行する。
4. bench前後のlane closure digest一致とprovider materialを照合し、24時間限定S4 admissionを発行する。
5. low/medium riskの別open PRに対してKimi K3-256kをread-only実行する。
6. strict output、finding、lease、HEAD、CI、DB、provider-neutral receiptをread-afterで照合する。

## Lane closure（review対象）

`src/runtime/review-lane-closure.ts`の`REVIEW_LANE_CLOSURE_PATHS`を正本とし、次の7 pathsを対象とする。

- `src/cli/commands/review-fallback.ts`
- `src/runtime/claude-pr-convergence.ts`
- `src/runtime/digest.ts`
- `src/runtime/independent-review-fallback.ts`
- `src/runtime/review-lane-closure.ts`
- `tests/tools/kimi-review-admission/admission-evidence.ts`
- `tests/tools/kimi-review-admission/run-admission-bench.ts`

## 実測結果

未確定。PR current HEAD、CI run、Claude receipt、bench summary、admission receipt、Kimi review receiptを
実値で追記する。失敗した段はfailure codeと再試行結果を残し、過去のgreenや別HEADで相殺しない。

## 不変境界

- raw `kimi`起動を正規経路にしない。
- Kimiへrepository本体、`.git`、`.helix`、harness.db、credentialを渡さない。
- Kimiにwrite、GitHub mutation、Ready、merge権限を与えない。
- high/critical risk、tool activity、schema drift、stale HEAD、期限切れadmissionはfail-closeする。
