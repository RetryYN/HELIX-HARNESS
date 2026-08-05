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
- `validateKimiReviewFallbackAdmission`: `pr_convergence_review`の正負fixture／negative oracleを検証したcanonical Claude v2 receiptへ束縛した期限付きS4 receiptだけを受理する。caller文字列だけのClaude指定、PO自己bootstrap、Kimi自己検証、期限切れ、implementation HEAD不一致ではprovider probeより前に停止する。
- `helix github pr-review-fallback-admission`: benchmark evidence／negative oracle JSONとcanonical Claude v2 receiptを読み、同一implementation HEAD、5 caseと4 mutationのexact set／期待結果を検証してdigest化する。Claude receiptはcanonical filenameだけでなく、`commentUrl`からGitHub commentをread-after-fetchし、v2 marker、PR、HEAD、CI、DB、最終receipt digestをexact照合する。HEAD不一致、非canonical path、自己整合JSONだけのreceipt、comment欠落／改変、digest省略は受けない。既定はdry-runで、`--apply`時だけruntime stateへ永続化する。
- `helix github pr-review-fallback`: clean worktreeとimplementation tree、current PR HEAD、green CI／DBをKimi起動前に検証し、leaseを永続化してから一度だけ起動する。dry-runはpacket計画までで停止する。Kimi終了後にもHEAD／CI／DBを再読し、drift時はreceiptを発行しない。
- `helix github pr-merge-reviewed`: Claude v2をmerge authorityとして読む。provider-neutral v3はcanonical receipt rootと対応するcanonical S4 admission artifactのdigest／implementation HEADを再検証するが、provider署名または同等の外部attestationが無い間は`provider_neutral_receipt_advisory_only`で必ずmergeを拒否する。手製JSONだけで独立reviewを偽装できる境界を、trusted local writerという仮定で隠さない。

- `deriveReviewRiskClass` / `admitDeclaredReviewRisk`: risk classを呼び出し側の自己申告に委ねない。GitHub diffのpath集合からrisk classを導出し、`.github/workflows/`／`.github/actions/`／`migrations/`／`src/state-db/`と、auth・payment・credential・secret・token・PII・license・release・distribution・cutover・guard・admission・merge・reviewを含むpath segmentをhighへ落とす。docs／markdownのみはlow、それ以外のsourceはmediumとする。申告が導出を下回る場合は`REVIEW_FALLBACK_RISK_UNDERDECLARED`、導出riskがadmitted集合に無い場合は`REVIEW_FALLBACK_RISK_NOT_ADMITTED`、分類対象が空の場合は`REVIEW_FALLBACK_RISK_UNCLASSIFIABLE`でfail-closeする。
- risk導出の入力となるchanged pathは、`diff --git`行を1行でも解釈できなければ`REVIEW_FALLBACK_RISK_UNCLASSIFIABLE`でfail-closeする。gitは`core.quotePath`既定で空白・非ASCII pathをquoteするため、regex不一致を黙って読み飛ばすと該当fileがrisk導出から漏れて過小分類になる。
- runtime authority surfaceもhighへ落とす。`.claude/`配下（hook配線、subagent allowlistとmodel frontmatter）と、`CLAUDE.md`／`AGENTS.md`はpath segment語彙では拾えないためprefixとexactで明示する。
- v3 receiptの著者runtimeは`declared_author_runtime`とする。実際のauthor runtimeを機械検証する手段が無いため、検証済み事実であるかのように`author_runtime: "codex"`を固定しない。強制するのはreviewer_runtimeとの相異（独立性）と非空のみで、値自体は自己申告であることをfield名で明示する。
- S4 admissionの有効期間には上限（24時間）を課す。`issued_at < expires_at`だけでは発行側が任意の遠い`expires_at`を置けて「期限付き」が名目化するため、window長そのものをbuildとvalidateの両方で拒否する。
- lease一意性はHEAD単位のattempt slotを`O_EXCL`で先に確保して決める。既存の`.json`走査だけでは走査と作成の間にTOCTOUがあり、generationがファイル名digestへ入るため異なるgenerationの並行processが双方書き込みに成功し得る。slot確保後にlease本体の作成が失敗した場合はslotを解放する。
- v3 receiptは`lease_issued_at`／`lease_expires_at`を payload へ含め、`fallback_evidence.observed_at ≤ lease.issued_at ≤ reviewed_at ≤ lease.expires_at`をbuildとvalidateの両方で強制する。leaseの実行窓を発行後に一切参照しないと、期限切れ後に完了した実行や順序が矛盾した鎖でも有効なreceiptになるため、時刻をdigest対象へ載せて再検証可能にする。

Kimiへrepository、`.helix`、DB、project credentialをmountしない。provider authはhost stateを直接bindせずscratch copyを使う。ACP reverse RPCはdenyし、permission requestまたはtool updateが一件でもあればreview全体を失敗させる。networkは現段階でhost transportを共有するため、security／credential／PII／release／high／critical taskはadmitしない。S4 receiptが未発行の間、公開commandはfail-closeしfallbackを実行しない。

ACPのJSON-RPC errorは型付きfailureへ変換する。`Authentication required`はauth surface未解決として停止し、protocol driftと混同しない。認証の再取得はworker内で行わず、host所有者の明示操作後に新しいgenerationで再試行する。
terminal response前にACP processが終了した場合、exit code 0を含めてprocess failureへ即時分類し、timeoutまで待機しない。

## 3. Bootstrap

本設計を含むPR自身のKimi判定をadmission根拠にしない。canonical Claude reviewを得るまでdraftを維持し、provider-neutral merge gateを有効化しない。Claude quota中は実装とKimi advisory reviewを進めても、未承認S4を自己発行してmerge境界を迂回しない。
