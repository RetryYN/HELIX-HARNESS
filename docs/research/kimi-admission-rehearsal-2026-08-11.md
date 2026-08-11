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
2. findingをRed evidenceとしてlane実装とoracleを修復し、修復後current HEADを再reviewする。
3. 同一HEADのCI terminal successとDB convergenceを確認し、Claude本人runtimeがcanonical receiptをsealする。
4. 同一HEADで実Kimi bench 5件とnegative mutation 7件を実行する。
5. bench前後のlane closure digest一致とprovider materialを照合し、24時間限定S4 admissionを発行する。
6. low/medium riskの別open PRに対してKimi K3-256kをread-only実行する。
7. strict output、finding、lease、HEAD、CI、DB、provider-neutral receiptをread-afterで照合する。

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

初回Claude review（旧HEAD `7df08b89279b5cb22409705c24ca7e1a8dd53a57`、
`pull/566#issuecomment-5254777564`）はrequest_changesとなり、未来`issued_at`による24時間上限迂回、
実filesystem closure経路のoracle欠落、repo外cwdの`gh pr diff`失敗を検出した。repo外cwdは
`GH_REPO`なしでexit 1、`--repo RetryYN/HELIX-HARNESS`明示でexit 0を実測した。

修復HEAD `981a0b594c59fcc1e430ce779edf5aa80f095571`では、`issued_at ≤ now ≤ expires_at`、
`future_issued_at` mutation、fixture filesystemの1 byte drift／member ENOENT／provider material drift、
`gh pr diff --repo`、導出済みriskのprovider選択を実装した。targeted 3 files / 50 tests、`tsc --noEmit`、
Biome、PLAN governance/schedule/descentはgreen。Claude再review、current-head CI、receipt、live bench以降は未確定であり、
過去のgreenや別HEADで相殺しない。

## 不変境界

- raw `kimi`起動を正規経路にしない。
- Kimiへrepository本体、`.git`、`.helix`、harness.db、credentialを渡さない。
- Kimiにwrite、GitHub mutation、Ready、merge権限を与えない。
- high/critical risk、tool activity、schema drift、stale HEAD、期限切れadmissionはfail-closeする。
