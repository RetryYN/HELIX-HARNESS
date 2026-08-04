---
title: "独立レビュー・フォールバック関数設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-RECOVERY-12-independent-review-fallback.md
pair_artifact: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
github_issue_id: 390
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
---

# 独立レビュー・フォールバック関数設計

## 1. 責務

Claudeを主系reviewerとし、同一candidate HEADへ束縛したquota、unavailable、claim timeoutの封印済み証拠がある場合だけ、許可済みの低・中risk taskをKimiへ切り替える。failure evidenceは次generationへ継承せずClaudeへ戻す。

## 2. 境界

- `classifyReviewProviderFailure`: provider失敗を型付きcapabilityへ封印する。
- `selectIndependentReviewProvider`: HEAD、task class、riskを照合して主系またはfallbackを選ぶ。
- `issueReviewFallbackLease`: repo／PR／HEAD／generationごとの単一provider leaseを発行する。durable writerは同じcandidate HEADのKimi attemptを最大1回に制限し、process再起動やgeneration変更による回避を拒否する。
- `buildKimiFallbackInvocation`: raw prompt modeを禁止し、ACPとbounded packetだけを構成する。
- `executeKimiFallbackReview`: 空workspaceのbubblewrap processで`kimi acp`を実行する。client filesystem／terminalを無効化し、MCPを空集合に固定し、permission・tool activityを拒否したうえでstrict outputを再検証する。
- `buildProviderNeutralReviewReceipt`: failure、lease、packet、output、CI、DBを一つのreceiptへ束縛する。
- `helix github pr-review-fallback`: GitHubからcurrent HEAD／本文／diffを取得して再読後のHEAD一致を検査し、Claudeを20秒のbounded probeで観測する。typed failure時だけleaseを発行してKimi ACPを起動する。callerがfallback理由や任意packetを自己申告する入力は持たない。
- `validateKimiReviewFallbackAdmission`: `pr_convergence_review`の正負fixture／negative oracleを別Claudeが検証した期限付きS4 receipt、またはClaude quota中にPOが一回だけ発行した期限付きbootstrap authority receiptを受理する。PO bootstrapはauthority digest必須、Kimi自己検証・期限切れ・Claude verifierへのbootstrap digest混入ではprovider probeより前に停止する。
- `helix github pr-review-fallback-admission`: benchmark evidence／negative oracle JSONを読み、同一implementation HEAD、5 caseと4 mutationのexact set／期待結果を検証してdigest化する。通常は別Claudeをverifierとし、Claude quota時だけPO bootstrap authority digestを要求する。callerによるKimi verifier指定、HEAD不一致、digest省略は受けない。既定はdry-runで、`--apply`時だけruntime stateへ永続化する。
- `helix github pr-merge-reviewed`: Claude v2とprovider-neutral v3をdual-readし、同じcurrent HEAD／CI／DB／独立runtime条件でmergeを判定する。

Kimiへrepository、`.helix`、DB、project credentialをmountしない。provider authはhost stateを直接bindせずscratch copyを使う。ACP reverse RPCはdenyし、permission requestまたはtool updateが一件でもあればreview全体を失敗させる。networkは現段階でhost transportを共有するため、security／credential／PII／release／high／critical taskはadmitしない。S4 receiptが未発行の間、公開commandはfail-closeしfallbackを実行しない。

## 3. Bootstrap

本設計を含むPR自身のKimi判定をadmission根拠にしない。既存Claude reviewまたはPOの一回bootstrap receiptを得るまでdraftを維持し、provider-neutral merge gateを有効化しない。PO bootstrapはClaude quota回復予定までの有限期限へ束縛し、回復後の新generationではClaudeを主系へ戻す。
