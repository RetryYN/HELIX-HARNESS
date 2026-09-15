# Kimi独立レビューlane admission通し稽古（2026-08-11）

- Issue: #390
- PLAN: `PLAN-RECOVERY-48-kimi-admission-rehearsal`
- behavior contract: `KIMI-REVIEW-FALLBACK-001`
- 状態: 実測完了（PLANの独立technical review待ち）

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
Biome、PLAN governance/schedule/descentはgreen。その後のcurrent evidenceは次節へ集約し、
過去のgreenや別HEADで相殺しない。

## 完了read-after（2026-08-13）

### Bootstrap admissionの成立（PR #566）

- implementation HEAD: `4d98a8134589d73a924cfa09213ca98eb8957de2`
- merge commit: `3ae5e432804a5780d8c34c70f1698af6ba2e4ce9`
- current-head CI: `31640283445`を実行し、終端結果は`success`
- Claude bootstrap receipt: `sha256:228776e56df80b6660d9a3ae8d8719f69d9a61f82af6ee7aa2f657789e2ef51c`
  （`pull/566#issuecomment-5272883439`）
- lane closure digest: `sha256:f71bf37fb9762868c82addc9b36b52eef9ce4f1205620c3657055e44d153618b`
- bench: **5/5 pass**
- negative mutation: **7/7 kill**
- benchmark digest: `sha256:2fcc57617571023552457b833cd69471e9d058c841ccf6401118d038a2fd3870`
- S4 admission receipt: `sha256:9d44f2ff7450b968e199a702d9c1d8b55cd5d6f831fc80d8502747889ef86a7b`
- admission lease: `2026-08-12T21:16:55.679Z`から`2026-08-13T21:16:55.679Z`まで。
  task class=`pr_convergence_review`、risk=`low|medium`、verdict=`admit`へ束縛される。

### 別の実PRでのKimi fallback（PR #641）

PR #641 HEAD `dfcba2a79b3df54dfa997e63a40e1fa6a8823568`、CI run `31662845898`
（terminal `success`）に対し、Claude probeをcontrolled shimでexit 127
`provider unavailable`として実測し、typed `provider_unavailable`だけをfallback理由として採用した。
これは実サービス障害の主張ではなく、provider-unavailable分岐の制御された通し稽古である。

- reviewer: Kimi Code CLI / `kimi-code/k3-256k`
- provider session: `session_a59131cc-8a82-44a8-847c-ca1f91e840d8`
- verdict: `approve`、blocker count: `0`
- provider-neutral receiptのschema: `helix-independent-pr-review-receipt.v4`
- receipt digest: `sha256:a063fec4dd99f6f33a0b86c0521c9d346aab2b60ba548f85d389cd798573f9ec`
- GitHub read-after: `pull/641#issuecomment-5275601303`
- merge commit: `6888b5a8725fcaeb35fbac8daa6fe2f9c467a8e9`

GitHub commentのreceiptはcandidate HEAD、CI、DB convergence、admission、fallback evidence、
single-writer lease、packet/output/finding digest、provider sessionをexact束縛している。Kimi自身には
GitHub write、Ready、merge権限を与えず、comment反映とmergeはNode transactional boundaryが行った。

### Fail-close追試

同じadmissionを使ったPR #639への後続試行は、host provider authが失効していたため
`KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED`で停止し、receiptもGitHub commentも発行しなかった。
成功済みの#641をこの失敗で相殺せず、逆に認証面を推測で迂回しない境界証拠として扱う。

以上により、bootstrap review、current-head CI、bench/mutation、24時間S4 admission、別実PRの
strict provider-neutral receipt、既存fail-close oracle維持というPLANの6完了条件をすべて満たした。
ただしPLAN statusの`confirmed`化は、この記録自体への別runtime reviewとcurrent-head CIを必要とする。

## 不変境界

- raw `kimi`起動を正規経路にしない。
- Kimiへrepository本体、`.git`、`.helix`、harness.db、credentialを渡さない。
- Kimiにwrite、GitHub mutation、Ready、merge権限を与えない。
- high/critical risk、tool activity、schema drift、stale HEAD、期限切れadmissionはfail-closeする。
