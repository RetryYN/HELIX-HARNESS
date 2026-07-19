---
title: "HELIX L6 機能設計 — pillar HC contract function descent"
layer: L6
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-07-01
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/L6-pillar-unit-test-design.md
related_l5: docs/design/helix/L5-detail/pillar-detail-design.md
---

# HELIX L6 機能設計 — pillar HC contract function descent

本書は `docs/design/helix/L5-detail/pillar-detail-design.md` の `HC-*` 10 contract を、L7 で実装可能な
function contract へ降ろす。既存 `orchestration-memory.md` は Route-B P2/P7 の深掘りであり、本書は
pillar 43 要件全体の L6 横断設計を受け持つ。

## §0 量閉じ

- 入力 L5: `HC-P0` / `HC-P1` / `HC-P2` / `HC-P3` / `HC-P4` / `HC-P6` / `HC-P7` / `HC-P8` / `HC-P9` / `HC-AC` = 10 contract。
- 入力 L3: `HR-FR-*` 33 件 + `HR-NFR-*` 13 件 = 46 件。
- L6 function family: 10 family / 30 function contract として定義する。
- L7 unit oracle: `HU-PILLAR-*` 46 件。
- Route-B back-fill 8 件は `orchestration-memory.md` で 11 契約へ降下済み。本書では `HC-P1` / `HC-P2` / `HC-P3` / `HC-P7` / `HC-AC` の横断 family へ接続し、二重採番しない。
- L1 §2.8 asset/progress visualization amendment は S4 decision 待ちであり、本 L6 30 function contract
  へ含めない。S4 confirmed 後に layer tree / graph IR / evidence timeline / drill-down pointer の
  view-model function を別 family または HC-P9/HB-P9 extension として降下する。

### §0.1 実装可能機能一覧の意味境界

L6 の機能一覧は、L3 の意味単位をそのまま関数境界へ落とす。実装済み/設計済み/未承認/将来版 parked を
同じ「完了」に丸めない。

| 意味単位 | L6 family / function | 状態 | 完了主張の境界 |
|----------|----------------------|------|----------------|
| Forward 収束 / stop reason | HC-P0 `decideForwardReturn` / `recordStopReasonEvidence` | L6 confirmed | completion claim は return/gap/version target と stop evidence が無い限り blocker |
| continuous autonomy / version-up / continuation | HC-P1 `evaluateAutonomyResume` / `planVersionUpgradeDryRun` / `buildVersionUpActivationPackets` / `appendContinuationEvent` / `projectContinuationEvent` / `replayContinuationEvents` | L6 confirmed、continuation関数は後続L7実装 | parked version-upはdispatchせず、activation decision / rollback / approval / reapproval triggerを要求。continuationはevent-first append→冪等DB projection→checkpoint公開の順を守り、session/prose handoverを生成しない |
| agent/tool/runtime guardrail + pair-agent TDD / loop trace route | HC-P2 `validateToolContractSurface` / `tickLoopEffortBudget` / `writeLoopTraceSpan` / `buildPairAgentTddPlan` / `runPairAgentTddPlan` + HC-AC `validateAdapterParityMap` / `requireHostedSurfacePreflight` | L6 confirmed、一部 L7 実装済み | P2 の confirmed_current は HR-FR-P2-01..04 / HAT-P2-01..04 を同じ runtime guardrail family として束ねる。未登録 tool、loop budget 超過、adapter parity drift、hosted API preflight 欠落、pair-agent TDD 順序違反はいずれも local pass を閉じない。smart test/oracle -> light implementation/consultation -> smart review/instruction -> light fix の順序と evidence 保存が必須。consultation question が実装証跡と混在しても pending consultation を優先する。`VERDICT: pass` は Green evidence と review finding を伴う場合だけ local pass にできる。local verdict は CI/merge gate の代替ではない |
| verification / TDD oracle / runtime provenance | HC-P3 `validatePairClosure` / `validateTddOracle` / `selectVerificationProfile` | L6 confirmed | projection-only telemetry、coverage-only、self-review は `works` claim を閉じない |
| repair / metric improvement | HC-P4 `routeRepairFinding` / `promoteRepairRecipe` / `projectMetricImprovementSignal` | L6 confirmed | destructive/auth/PII/license repair は approval なしに apply しない |
| GitHub/setup/release/identifier rename | HC-P6 `buildDistributionPlan` / `planHelixProjectSetup` / `runHelixProjectSetup` / `runConsumerDoctor` / `planReleaseAutomationDecision` / `auditIdentifierRenameBlastRadius` / `buildIdentifierRenameCutoverPlan` | L6 confirmed、一部 L7 実装済み | `旧 state path -> .helix` は audit/cutover plan まで。cutover/action-binding approval が無い限り apply 可能と扱わない。`setup project` は GitHub rules/checks plan、consumer doctor baseline、consumer CI の package/bin resolution preflight、配布済み team-run dry-run を plan-only 構造で返す |
| shared memory / glossary / context map | HC-P7 `buildBoundedRecallPacket` / `detectGlossaryDrift` / `validateContextMapBoundary` | L6 confirmed | per-agent silo は SSoT ではない。rename/synonym は supersedes/context を要求 |
| external source/security/action approval | HC-P8 `validateSourceAttribution` / `parseExternalSecurityFilter` / `requireActionBindingApproval` | L6 confirmed | raw external text を instruction 化しない。high-impact action は matching approval 必須 |
| DB convergence / layer regression / semantic frontier | HC-P9 `checkProjectionConvergence` / `queryLayerRegressionImpact` / `analyzeOutstandingWork` -> `semanticFeatureFrontierRecords` / `completionDecisionPacket` | L6 confirmed、一部 L7 実装済み | DB 未収束、contract 未分類、影響 layer gate/test 未実行は green にしない。未終端の PO 判断待ち・version-up parked・rename/cutover 承認待ちは `semantic_feature_frontier_record` として `completionClaimAllowed=false` を返す。confirmed overlay は `confirmed_overlay_frontier_count=0`、現行 live frontier は `live_semantic_frontier_count=2` である。S4 / version-up activation / cutover の終端 decision record は source ledger freshness、source status delta、adoption decision delta、workflow route impact を必須 field とし、古い外部 source や採否差分不明のまま完了判断へ進めない |
| adapter/preflight consistency | HC-AC `validateAdapterParityMap` / `requireHostedSurfacePreflight` | L6 confirmed | hosted/API surface は repo hook 非強制のため preflight evidence が無ければ reject |
| asset/progress visualization amendment | 2026-07-06 PO 指示で confirmed へ復帰 | downstream frontier | `VisualizationSnapshot` first response は既存。Tree View/Webview の L6 function と L7 implementation は後続 PLAN で扱い、archive で隠さない |

G-SF `semantic_feature_frontier_record` の L6 解釈:

- `confirmed_current` だけが L6 function contract と L7 unit oracle へ通常降下できる。live
  `outstanding.confirmedCurrentMeaningRecords[]` は L3 confirmed 46 件を 12 意味単位に束ね、L3/L12 ID の抜けを
  `semantic-frontier-consistency` で fail させる。
- confirmed overlay は `confirmed_overlay_frontier_count=0`、現行 live frontier は `live_semantic_frontier_count=2` である。deferred 済み PLAN や live draft backlog は
  confirmed function family に混ぜず、再開時は既存 PLAN 更新または新規 PLAN と新規 evidence で接続する。
- `frontier_pending_decision` は view-model function 名を仮置きしてもよいが、G6 confirmed function family へ混ぜない。
- `parked_future_version` は activation packet / dry-run / rollback plan の設計までで、runtime dispatch しない。
- `approval_gated_cutover` は audit / plan-only surface までで、apply command availability を設計しない。

この分類は L6 関数一覧の一部であり、実装済み path の存在だけでは `completion_claim_allowed=true` にならない。

### §0.2 2026-07-02 ワークフロー表示契約の追補

要求修正後の意味ベース確認により、以下を L6 契約へ追補する。

- HC-P1 `buildS4DecisionPackets` は `decisionEvidenceChecklist` / `outcomeRouteMatrix` /
  `provenanceRequirements` に加えて `decisionVerificationCommandMatrix[]` を返す。matrix は decision packet
  baseline、source ledger freshness、S3 verification evidence、requirements trace、targeted regression を含む。
  packet 対象は `workflow_phase=S3` の未判断 PoC だけに限定せず、`workflow_phase=S4` まで進んでいても
  `decision_outcome` が未記録なら PO/S4 decision pending として同じ packet frontier に残す。
  S4 へ移動した事実だけで terminal decision を代替しない。
  さらに static gates、full regression、completion frontier の各 phase と command / expected / evidence /
  source 系 metadata（source / sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision /
  adoptionDecisionDelta / workflowRouteImpact）を持つ。
  `decisionVerificationCommandMatrix[]` の `sourceCheckedAt` は `S4 decision source ledger` の checked date から派生させ、
  ledger heading と matrix metadata の確認日が新旧混在した S4 packet を作らない。
  Scrum Guide 2020、ISO/IEC/IEEE 29148、ISTQB Glossary、NIST SSDF の source ledger を PO/S4 判断前の
  実行証跡へ接続し、S3 green / review 済み / 動く increment の単一シグナルだけで S4 terminal 判断へ
  進めない。packet は `s4_decision_record` と、同一 PLAN が承認境界を持つ場合の
  `action_binding_approval_record` の `recordTemplates[]` を返し、text surface も `record-template` 行を出す。S4 終端判断の `forward_route` は `Forward` / `Reverse` / `正本化` の抽象説明だけでは不足とし、PLAN 識別子、`docs/...` パス、または L1/L3-L6 の具体的な合流層を含む場合だけ具体昇格先とみなす。これにより S3 検証証跡を「意味上どこへ降ろすか」の設計判断なしに confirmed へ読み替えない。
  `verified_evidence` は source URL / repo doc / PLAN ID 単独では足りず、実行済み test/review command、
  test path、artifact/audit/evidence/report/log path、run/workflow/job id、または hash へ接続する場合だけ
  S4 判断用の検証証跡とみなす。source 根拠だけを示す値は `external_source_basis` に分離する。
  text surface は evidence check 件数、outcome route 件数、verification command 件数と、
  checked/adoption/status delta/route impact/writePolicy/command 付き `verification-source:` 行を出す。
  `decisionVerificationCommandMatrix[]` は共通 source metadata validator により、未来日・90 日超 stale・
  非実在日付の `sourceCheckedAt`、および placeholder / future-action prose の source/adoption/route metadata を
  PO 判断前 evidence として通さない。
  completion decision packet / status / handover の supporting summary でも、S4 decision は
  `decisionRecord` / `decisionEvidenceChecklist` / `outcomeRouteMatrix` / `provenanceRequirements` の親 field
  だけに畳まない。`planOnly` / `mustNotDecide` / `decisionAllowed` / `decisionCommandAvailable`、
  `decisionRecord.allowed_outcome`、`decisionRecord.decision_owner`、`decisionRecord.decision_basis`、
  `decisionRecord.forward_route`、`decisionRecord.reverse_fullback_required`、
  `decisionRecord.promotion_strategy_or_rejection_pivot_rationale`、`outcomeRouteMatrix.routePolicy`、
  `outcomeRouteMatrix.requiredEvidence`、`provenanceRequirements.evidence`、`relatedDecisionPackets.scopedCommand`、
  `nextWorkflowRoutes.route` に加え、`decisionVerificationCommandMatrix.command`、
  `decisionVerificationCommandMatrix.writePolicy`、`decisionVerificationCommandMatrix.evidence` を
  `requiredReviewFields[]` に列挙する。これにより、Scrum Guide の inspect/adapt、
  NIST SSDF の evidence/artifact、SLSA provenance、GitHub の review/concurrency、SRE の rollback 観点を、
  PO/S4判断前のstatus/continuation reviewで失わない。S4 matrixは`writePolicy=no-write`の
  承認済み CLI/test surface に限定し、DB rebuild、build artifact 出力、redirect/tee など state / artifact を
  書く command を判断材料に混ぜない。
- HC-P1 `buildVersionUpActivationPackets` は `activation_decision_record.activation_snapshot_id` を JSON
  `activationDecision` に保持し、packet 側の `activationSnapshot` は現在の `HEAD` SHA、release trigger、
  PLAN 本文 digest、source ledger の確認日、approval scope digest、rehearsal/provenance digest、reapproval trigger を
  `snapshotId` に混ぜる。`HEAD` が読めない場合は activation blocker とし、同じ HEAD でも parked PLAN 本文や
  source/evidence material が変われば snapshotId を変える。`activation_snapshot_id` / `reviewed_snapshot_binding`
  の行は snapshot 自己参照を避けるため digest 計算時に field 名へ正規化し、current snapshot 値の記録だけで
  snapshotId が揺れないようにする。source ledger 見出しの確認日
  と PLAN record の `source_ledger_freshness` 確認日がずれた場合は readiness violation にする。
  `activation_decision_record.activation_snapshot_id` は field 名だけでは足りず、current
  `activationSnapshot.snapshotId` の concrete sha256 と一致しなければ blocker にする。
  `analyzeVersionUpReadiness` は enum set を提示する parked review record と、
  `allowed_outcome=activate_future_version` が選択済みの activation material を分離する。後者では current
  `activationSnapshot.snapshotId`、HEAD-bound snapshot、`approve_action_binding`、承認済み actor/tool/target/params、
  `reviewed_snapshot_binding`、review/audit evidence、`activationReadinessSummary=ready_for_activation_review` が揃わない限り
  readiness violation に昇格し、packet の blocker だけに閉じ込めない。
  外部 activation の cost guardrails (`pages_limit` / `workers_limit` / `d1_limit` / `kv_limit` /
  `exceed_action`) は単なる表示ではなく `activationReadinessChecks[]` の `pending_evidence` 判定対象にする。
  cost guardrails と `activationReadinessChecks[]` は `activationSnapshot.evidenceDigest` に含め、
  外部 limit / rehearsal evidence の drift を snapshot drift として扱う。
  裸の `https://...` や official source URL の転記は source metadata であり、
  `report_url:` / `audit_id:` / `artifact_path:` などの証跡種別と結び付かない限り
  `activationReadinessChecks[]` は `pending_evidence` のままにする。
  `sourceLedgerFreshness.rowsDigest` と `activationSnapshot.sourceLedgerRowsDigest` は
  `Version-up source ledger` の全 row 内容を束ね、checked date だけでなく official URL / latest status /
  adoption decision / required field impact の変更も snapshot drift として再承認対象にする。
  `externalRehearsalPlan[]`、cost guardrails、`activationVerificationCommandMatrix[]`、
  `securityChecklistPacket.securityChecks[]` の `sourceCheckedAt` は `sourceLedgerFreshness.checkedDate` から派生させ、
  ledger heading と packet metadata の確認日が新旧混在した承認材料を作らない。
  completion decision packet / status / handover の supporting summary でも、version-up activation は
  `activationDecision` / `activationSnapshot` / `versionDryRunEvidence` などの親 field だけに畳まない。
  `activation_snapshot_id`、`dry_run_plan`、`rollback_plan`、`activationReadinessChecks.evidence`、
  `activationSnapshot.versionDryRunDigest`、`versionDryRunEvidence.releaseTriggerResolved`、
  `securityChecklistPacket.securityChecks.workflowRouteImpact`、`reapprovalTriggers.requiredAction` などを
  `requiredReviewFields[]` に列挙し、SemVer dry-run、release tag 解決、snapshot drift、rehearsal/cost/provenance、
  GitHub Actions least privilege / `pull_request_target` / environment approval 境界の確認対象を status から失わない。
  `Version-up source ledger` は source 名だけで通さず、SemVer / GitHub / Cloudflare / HMAC / Access
  の期待 official URL と required field impact を source ごとに検査する。誤 URL や `cost_guardrails` /
  `external_rehearsal_plan` / `dry_run_plan` / `activation_dependency` などの impact 欠落は、
  source ledger が fresh でも version-up readiness violation にする。
  `OWASP Web Security Testing Guide` は version-up source ledger の必須 row とし、
  `external_rehearsal_plan` / `dry_run_plan` / `activation_provenance_requirements` へ field impact を持たない
  security testing 記述は activation 根拠にしない。activation packet は
  `activationVerificationCommandMatrix[]` を持ち、activation packet baseline、version dry-run、external rehearsal を
  検証 phase として扱う。さらに security testing、state+doctor、targeted regression、static gates、
  full regression、approval packet の command / writePolicy / expected / evidence / source / sourceUrl / sourceCheckedAt /
  latestOfficialStatus / sourceStatusDelta / adoptionDecision / adoptionDecisionDelta / workflowRouteImpact を plan-only に列挙する。GitHub Actions / GitHub
  Environments / Google Cloud Deploy / OWASP WSTG の公式 source は checked date と採用判断を持ち、source 名や URL
  だけの activation review にしない。matrix は
  `activationSnapshot.evidenceDigest` に含め、承認前 review material の drift を snapshot drift として扱う。
  activation packet は activation / parked review / external rehearsal / cost guardrail / provenance /
  action-binding の required record を `recordTemplates[]` として返し、PO が packet だけで記入 block を複写できる。
  `activationVerificationCommandMatrix[]` も共通 source metadata validator を通し、source 日付の非実在値や
  `record later` / `<sourceUrl>` などの placeholder を future activation evidence として採用しない。
  text surface は `activationSnapshot.sourceLedgerRowsDigest` / `approvalScopeDigest` /
  `evidenceDigest` と `verification-source:` の writePolicy / command を出し、JSON を見ない review でも
  source / approval scope / evidence drift を隠さない。
- HC-P6 `buildIdentifierRenameCutoverPlan` / `analyzeCutoverReadiness` は `Cutover source ledger` も同様に、
  NIST / GitHub Environments / GitHub Actions concurrency / Google SRE / OWASP LLM06 / SLSA の期待
  official URL と required field impact を固定検査する。`https` URL があるだけ、または source 名だけの
  ledger refresh では L14 cutover 根拠にせず、backup / rollback / audit / monitoring / concurrency /
  provenance に必要な field impact が揃うまで approval material と扱わない。
  `buildIdentifierRenameCutoverPlan` は `snapshotReview` を返し、PLAN に記録済みの
  `cutover_decision_record.cutover_snapshot_id` と `action_binding_approval_record.reviewed_snapshot_binding`、
  current `cutoverSnapshot.snapshotId`、一致/不一致、drift warning、再承認 action を承認前から表示する。
  `analyzeCutoverReadiness` は `allowed_outcome=approve_cutover` が選択済みの場合、記録された concrete
  `cutover_snapshot_id` が HEAD-bound current `cutoverSnapshot.snapshotId` と一致しない限り approval material と扱わない。
  `loadCutoverReadinessInput` は `buildIdentifierRenameCutoverPlan` の `cutoverSnapshot.repoHeadSha` が読めた
  current packet のみを照合基準として渡し、HEAD が読めない approval は fail-close にする。
  enum set を提示する draft review record は承認済み outcome ではないため、過去 review snapshot の保持だけで
  apply 可能とは扱わない。
  `cutoverSnapshot` は `repoHeadSha` と `headDigest` を持ち、snapshotId の入力に frozen HEAD を含める。
  `sourceLedgerFreshness.rowsDigest` と `cutoverSnapshot.sourceLedgerRowsDigest` は `Cutover source ledger` の
  全 row 内容を束ね、source row の status / adoption / field-impact 変更を date-only refresh と別に
  snapshot drift として扱う。
  HEAD が読めない plan は `approvalMaterialReady=true` に進めず、HEAD 差分は snapshot drift として再承認対象にする。`rename plan` は plan-only のため、承認材料が揃っても `applyAuthorized=false` のままにする。
  approval record が concrete でない draft 状態でも current snapshot と記録済み snapshot の比較 surface を隠さない。
  `cutoverCategoryChecklist` は category count だけでなく代表 `samplePaths[]` と category 別
  `verificationCommand` を持ち、Step 1 blast-radius baseline 凍結時にどの file surface を確認するかを
  reviewer が追える形にする。`verificationCommandMatrix[]` は baseline / targeted regression / static gates /
  state+doctor / full regression / compiled dist smoke を plan-only に列挙し、承認前の dry-run evidence を
  自由文だけにしない。各 row は command / writePolicy / source / sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta /
  adoptionDecision / adoptionDecisionDelta / workflowRouteImpact を持ち、L14 cutover source ledger、ADR-001 配布判断、
  doctor/state projection、full regression policy へ直接接続する。GitHub Actions concurrency / Google SRE /
  SLSA provenance / OWASP LLM06 の公式 source は確認日と採用判断を持ち、source 名や URL だけの
  irreversible cutover review にしない。
  `verificationCommandMatrix[]` も共通 source metadata validator を通し、source ledger refresh と matrix metadata の
  日付・status・adoption・route impact が承認前 evidence として実体を持つことを検査する。
  `verificationCommandMatrix[]` の `sourceCheckedAt` は `sourceLedgerFreshness.checkedDate` から派生させ、
  Cutover source ledger heading と matrix metadata の確認日が新旧混在した cutover packet を作らない。
  completion decision packet / status / handover の supporting summary でも、rename/cutover は
  `cutoverSnapshot` / `snapshotReview` / `cutoverRunbook` / `stateBackupManifest` などの親 field だけに畳まない。
  `cutoverSnapshot.blastRadiusDigest`、`cutoverSnapshot.approvalScopeDigest`、`cutoverSnapshot.evidenceDigest`、
  `cutoverSnapshot.sourceLedgerRowsDigest`、`snapshotReview.currentSnapshotId`、
  `snapshotReview.cutoverSnapshotMatchesCurrent`、`cutoverRunbook.writePolicy`、`cutoverRunbook.evidencePath`、
  `stateBackupManifest.restoreEvidencePath`、`freezePolicy.concurrencyPolicy`、
  `approvalGate.reviewedSnapshotBindingRequired` などを `requiredReviewFields[]` に列挙し、L14 cutover review で
  blast radius、snapshot drift、runbook write policy、backup/restore drill、quiet window、approval gate の確認対象を失わない。
  text surface は `sourceLedgerFreshness.rowsDigest`、`cutoverSnapshot.sourceLedgerRowsDigest` /
  `blastRadiusDigest` / `approvalScopeDigest` / `evidenceDigest` と `verification-source:` の writePolicy /
  command を出し、承認前 review が JSON-only safety field を見落とさないようにする。
- HC-P6 `runHelixProjectSetup` の `commandAvailability.currentCommandAvailable` は固定 `true` ではなく
  `consumerReadiness` の `helix-cli` check と同じ真偽を返す。text surface は `postSetupWorkflow.nextActions` /
  `blockedUntil` / `verificationCommands` を列挙し、JSON を見ない利用者にも次 action を欠落させない。
  親 `helix setup` の text surface は legacy solo/team adapter setup に scope を限定し、HELIX project
  bootstrap は `helix setup project` を使うこと、親 setup が VS Code task / `.helix` project baseline /
  rename packet を生成しないため L14 completion evidence ではないことを表示する。
  `runConsumerDoctor` は adapter docs の managed block だけでなく、日本語既定、consumer doctor profile、
  PLAN-M-02 cutover boundary、承認前 `.helix/**` state 未生成、`package.json` の `bin.helix`、
  `name=helix` / `@scope/helix` の string `bin`、package scripts、`.vscode/tasks.json` /
  `.github/workflows/harness-check.yml` / `.claude/settings.json` / `.codex/hooks.json` /
  配布 `.claude/agents/*.md` / `.claude/commands/*.md` の lowercase `helix` 実行 alias 未露出を検査する。
  `buildConsumerReadinessPlan` は `hasHelixCli` 未指定を green とみなさず、setup / distribution plan の両方で
  bare `helix --version` 相当の PATH 解決性を実測した入力だけを ready にする。
  consumer VS Code task は `type=shell`、`problemMatcher=[]`、`runOptions.runOn` 未指定または `default`、
  task-level `options` なし、`.vscode/settings.json` の `task.allowAutomaticTasks=off` まで doctor で検査し、
  期待 task 以外の余分な task でも自動実行があれば fail-close する。Workspace Trust の自動実行抑止を
  別 project 稼働証跡に含める。
  `runHelixProjectSetup` は `vscode.profileName=HELIX` と `profileOpenCommand="code --profile HELIX ."` を返し、
  HELIX 導入済み VSCode で新規 folder を開く導線を manual-local 証跡として扱う。
  生成 task の command は package-local `bun run helix ...` とし、consumer shell の PATH に bare
  `helix` が無い場合でも package/bin resolution 経路へ寄せる。
- HC-P6 `runHelixProjectSetup` の `postSetupWorkflow.verificationMatrix[]` は setup-dry-run /
  vscode-profile-open / status-frontier / completion-decision-packet / consumer-doctor / identifier-cutover-packet / continuation-route / team-run-dry-run の phase / command / writePolicy / expected / evidence /
  source 系 metadata（source / sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision /
  adoptionDecisionDelta / workflowRouteImpact）を返す。
  各 row は `writePolicy=no-write` で、初回 consumer verification が state/file/remote apply surface へ
  変わらないことを text/JSON の両方で示す。
  VS Code workspace task、VS Code profile CLI、Workspace Trust、PLAN-M-02 rename packet、HELIX status/continuation contract、team definition contract を初回稼働証跡へ接続し、
  command 列挙や source 名だけで「別プロジェクトで HELIX が動く」claim を閉じない。text surface は
  `verification-check:` は writePolicy / command / expected / evidence を含め、`verification-source:` も列挙する。
  `HelixProjectSetupResult.githubPlan.branchProtection.scriptPath` を返す場合、0-A/0-B の project setup preview /
  written paths に同じ apply-capable script を含め、JSON が存在しない script を指さない。
- HC-P6 clean distribution acceptance は source / clean artifact の `package.json.scripts.helix="tsx src/cli.ts"` と
  `npm run helix -- --version` を package-local preflight として持ち、`npm run build` で
  `package.json.bin.helix=./dist/helix` の実体を作り、
  package rootの`npm link`とconsumer repoの`npm link helix --no-save`を通した
  `node_modules/.bin/helix` で setup / status / doctor / handover / team-run dry-run を実行する。handmade shim や
  `src/cli.ts` 直実行だけでは package/bin 経路の証跡にしない。
  `harness-check.yml` と `consumerReadiness.ci.requires` は post-setup verification と同じ
  package/bin resolution preflight (`npm run helix -- --version`) と setup dry-run / status / completion decision-packet / completion review-bundle / version-up dry-run / consumer doctor /
  handover route / team-run dry-run、`npm ci`、`npm run typecheck`、`npm test` を含む `CONSUMER_CI_RUN_COMMANDS` 全体と一致し、
  acceptance はその生成 CI command set 全体を consumer repo で実行する。
  `consumerReadiness.ci.packagePreflight` はnpm公式`npm ci` / `package-lock.json` / package scripts sourceを
  `sourceCheckedAt=2026-07-03`付きで保持し、`npm ci`のlockfile exactness、
  `package-lock.json`境界、`scripts.helix` / `scripts.typecheck` / `scripts.test`の必須性を
  source metadata として返す。lockfile や script 欠落は command 実行前に `fix_consumer_readiness` へ戻す。
  `cutoverRunbook[]` の command は承認前に実行可能な CLI surface に限定し、`writePolicy` を
  `no-write` / `state-write` / `local-artifact-write` で明示する。`no-write` row に build、DB rebuild、
  file output などの local state/artifact write が混入したら fail-close し、未実装の
  `helix rename ...` サブコマンドや存在しない `./dist/helix` smoke を証跡経路として出さない。
  `verificationCommandMatrix[]` も同じ write policy を持ち、current / legacy dist smoke の build は
  `local-artifact-write`、DB rebuild は `state-write`、packet-only rehearsal は `no-write` として doctor が検査する。
  `helix rename rehearsal --no-write --target helix --json` と
  `helix rename state-backup --dry-run --restore-drill --json` と
  `helix rename dist-smoke --no-write --target helix --json` は packet-only で、
  codemod preview / state backup restore drill requirements / renamed binary smoke requirements を返すが apply surface を持たない。
  `helix rename audit` は blast-radius と approval record concreteness の監査であり、cutover の認可判定はしない。
  current `cutoverSnapshot` / source ledger / semantic frontier との一致を確認できる `helix rename plan --json` だけが
  `ready_for_cutover_packet` へ進める。
- HC-P8 `requireActionBindingApproval` / `buildActionBindingApprovalPackets` は
  `approvalBindingChecks[]` と sibling `relatedDecisionPackets[]` だけでなく
  `approvalVerificationCommandMatrix[]` を返す。matrix は approval packet baseline、sibling decision packet、
  least-privilege binding、snapshot binding、GitHub environment approval boundary、security boundary などの承認境界、
  web-security-testing boundary、targeted regression、static gates を検証し、full regression、completion frontier の
  command / expected / evidence と source metadata（source / sourceUrl / sourceCheckedAt /
  latestOfficialStatus / sourceStatusDelta / adoptionDecision / adoptionDecisionDelta / workflowRouteImpact）を
  plan-only に列挙する。
  web-security-testing boundary は OWASP WSTG の公式 source metadata を matrix row として出し、承認者が
  security testing 境界を packet 単体で確認できるようにする。
  `approvalVerificationCommandMatrix[]` の command は `actionBindingApprovalVerificationCommandViolations` で
  実行可能な承認済み CLI/test surface に限定し、`review ...` / `verify ...` の自然文手順を approval evidence として
  通さない。sibling S4 / version-up packet は `--plan <PLAN_ID>` 付き command、rename は singleton
  `rename plan` として出し、複数 pending PLAN 時の対象推測へ戻さない。
  同 validator は共通 source metadata validator を使い、`sourceCheckedAt` の未来日・90 日超 stale・非実在日付、
  および source/adoption/route metadata の空値・placeholder・future-action prose も fail-close し、
  action-binding approval packet が古い official-source 前提や date-only review で承認材料になることを防ぐ。
  version-up sibling の `reviewed_snapshot_binding` は repo HEAD と current package version を入力にした
  current `activationSnapshot.snapshotId` と照合し、HEAD なしで生成された snapshot や別 HEAD の snapshot を
  current approval evidence と誤認しない。
  packet は `approvalSnapshot` を持ち、`planTextDigest` / `approvalScopeDigest` /
  `reviewEvidenceDigest` / `auditDigest` / `siblingDecisionPacketDigest` と reviewed snapshot id/kind、repo HEAD を
  `snapshotId` へ束ねる。これにより approved actor/tool/target/params、review evidence、audit、
  sibling S4/version-up/rename packet、または HEAD が変わった旧 action-binding material を承認材料へ流用しない。
  GitHub Environments required reviewers / prevent self-review、NIST least privilege、VS Code Workspace Trust などの
  OWASP WSTG、OWASP LLM06:2025 Excessive Agency の
  公式 source を、actor / tool / target / params / snapshot / expiry / audit の承認前検証へ接続する。版上げ系の関連承認は `github-environment-approval-boundary` で `helix version-up security-checklist --plan <PLAN_ID> --no-write --json` を指し、リポジトリ公開範囲・契約プラン可用性・自己承認防止・環境シークレット可用性を承認前証跡とする。
  completion decision packet / status / handover の supporting summary でも、action-binding approval は
  `approvalRecord` / `approvalBindingChecks` という親 field だけに畳まない。`allowed_outcome`、
  `approval_policy_or_named_approver`、`approval_scope`、`approved_actor`、`approved_tool`、`approved_target`、
  `approved_params`、`review_approval_evidence`、`reviewed_snapshot_binding`、`expires_at_or_trigger`、
  `audit_record` と対応する binding check field、`approvalSnapshot.*Digest`、`approvalSnapshot.snapshotId`、
  `approvalSnapshot.reviewedSnapshotKind` を `requiredReviewFields[]` に列挙する。加えて `planOnly`、
  `mustNotApprove`、`approvalCommandAvailable`、`approvalAllowed`、`approvalBindingChecks.status`、
  `approvalBindingChecks.reason`、`approvalBindingChecks.requiredAction`、
  `approvalVerificationCommandMatrix.command`、`approvalVerificationCommandMatrix.writePolicy`、
  `approvalVerificationCommandMatrix.evidence`、`relatedDecisionPackets.scopedCommand`、`nextWorkflowRoutes.route`
  も列挙し、承認前 review が actor / tool / target / params / snapshot / expiry / audit、plan-only safety、
  pending/invalid reason、再実行 command、sibling packet scope、承認後 route のどれを確認すべきかを失わない。
  text surface は binding check 件数に加えて verification command 件数と
  writePolicy / command 付き `verification-source:` 行を出し、
  JSON を見ない利用者にも承認前に実行すべき証跡確認と公式/正本 source を欠落させない。
  packet は `action_binding_approval_record` の `recordTemplates[]` を JSON/text の両方に出し、
  actor / tool / target / params / snapshot binding / expiry / audit の承認 record を自由文に戻さない。
- HC-P9 / continuation resume surfaceは`helix status --json`と同じlive outstandingおよびDB continuation projection由来の
  `workflowNextAction` / `workflowNextActions[]`をJSON/text modeに出す。旧handover pointerやprose snapshotを入力にせず、
  completion decision packet commandだけでなく、recordすべき判断とrouteを直接読めることをcontractとする。
- HC-P9 `workflowNextActions[]` は command list だけでなく `supportingPacketSummaries[]` を持つ。各 summary は
  command / schemaVersion / matrixField / expectedMatrixCount / requiredReviewFields / requiredMatrixFields などの
  reviewRoute を返し、
  status/continuation surfaceから S4 / version-up / rename cutover / action-binding の verification matrix と
  review field へ直接辿れるようにする。`requiredMatrixFields` は `sourceCheckedAt` /
  `latestOfficialStatus` / `sourceStatusDelta` / `adoptionDecision` / `adoptionDecisionDelta` /
  `workflowRouteImpact` を含み、公式 source の状態差分・採否差分・workflow route 影響が summary で落ちない
  ことを contract とする。text mode は `packet-summary:` 行を出し、completion packet を別途開く前でも L14 判断前に
  見るべき検証 matrix を隠さない。
  また base command (`decisionPacketCommand` / `packetCommands`) に加えて PLAN-scoped command
  (`scopedDecisionPacketCommand` / `scopedPacketCommands`) を返す。S4 / version-up / action-binding は
  `--plan <PLAN_ID>` 付きで対象 packet に直行させ、singleton の rename plan は base command のまま残す。
  複数 pending PLAN がある状態で PO が対象 PLAN を手で推測する UI/CLI surface は不可。
  completion decision packet の summary 宣言だけで完了扱いしない。doctor は各 `packetCommands[]` が指す
  live S4 / version-up / rename / action-binding 専用 packet を生成し、対象 PLAN の packet 存在、verification
  matrix command、rename runbook command まで bridge 検証する。summary は正しいが実体 packet / runbook が
  drift した状態は HC-P9 の completion blocker として扱う。
  version-up activation の `external-rehearsal` / `security-testing` phase は自然文 command ではなく、
  `helix version-up rehearsal --plan <PLAN> --no-write --json` と
  `helix version-up security-checklist --plan <PLAN> --no-write --json` の packet-only surface を返す。
  doctor は activation verification matrix の command availability と `writePolicy` を検査し、`state-and-doctor`
  の `db rebuild` を `state-write` として分離する。no-write row に state/artifact write が混入した場合、
  未実装 command、placeholder、prose-only 手順と同じく承認前 evidence にしない。
- `planVersionUpgradeDryRun` は SemVer 正規化だけで `ok=true` にしない。`releaseTagRef` /
  `releaseTagExists` / `releaseTriggerResolved` を返し、target release tag が未解決なら plan-only のまま
  `ok=false` にする。
- version-up activation の action-binding / security checklist は GitHub Environments required reviewers を
  採用する前に repo visibility / account or org plan / prevent self-review / environment secrets availability を
  evidence として要求し、CI workflow や environment 名の存在だけで approval boundary とみなさない。
- HC-P9 / decision packet surface は `recordTemplates[]` を completion packet だけの補助情報にしない。
  `helix s4 decision-packet` / `helix version-up activation-packet` / `helix rename plan` /
  `helix action-binding approval-packet` はそれぞれ、自分の判断種別と sibling blocker に必要な record template を
  JSON/text で返し、PO/人間が正規 command から直接 record block を作れることを contract とする。
  action-binding packet の `sibling-decision-packets` phase は primary `action-binding approval-packet` 自身を
  再実行対象に含めず、S4 / version-up / rename の sibling packet だけを承認前 review context にする。

## §1 function family（関数 family）

| HC | function family | 主な signature | DbC / fail-close | log / evidence | oracle |
|----|-----------------|----------------|------------------|----------------|--------|
| HC-P0 | forward-return | `normalizeForwardReturnInput(input) => ForwardReturnInput` / `decideForwardReturn(input) => ForwardReturnDecision` / `recordStopReasonEvidence(decision, sink) => EvidenceRef` | `return_to` / `gap_only` / `version_target` のいずれも無い完了 claim は reject。stop reason が空なら `blocked_reason="missing_stop_reason"` | `workflow_runs` / `gate_runs` / append-only continuation event | HU-PILLAR-P0-01..02 |
| HC-P1 | autonomous-work | `evaluateAutonomyResume(input) => AutonomyResumeDecision` / `planVersionUpgradeDryRun(input) => VersionUpgradePlan` / `buildVersionUpActivationPackets(input) => VersionUpActivationPacket[]` / `selectL2TemplatePack(input) => L2TemplateDecision` / `appendContinuationEvent(input) => ContinuationEventRef` / `projectContinuationEvent(event) => ContinuationProjectionResult` / `replayContinuationEvents(input) => ContinuationReplayResult` | resume 3条件、job availability、budget、DB-backed next actionが揃わない場合はdispatchしない。continuationはJSONLとSQLiteを同一transactionと見なさず、durable append後にevent ID/payload hashで冪等投影し、投影成功前はcheckpointを公開しない。append失敗、append後/projection前、projection後/memory前、DB消失、同seq異payloadを区別し、replay/rebuildまたはfail-close findingへrouteする。version-up dry-run は current/target を SemVer として正規化し、target が current 以下、invalid、または target release tag 未解決なら `ok=false` にする。`version-up-dry-run-plan.v1` は `releaseTagRef` / `releaseTagExists` / `releaseTriggerResolved`、migration/rollback/idempotency/release gate/source basis を出すが、`planOnly=true` / `mustNotApply=true` / `applyCommandAvailable=false` に固定し、apply surface を作らない。activation packet は `planOnly=true` / `mustNotApply=true` / `applyCommandAvailable=false` / `activationAllowed=false` を返す。外部 activation では `activationReadinessChecks[]` が rehearsal/provenance evidence を `present` / `pending_evidence` に分類し、pending の項目を `blockedReasons[]` に残す。証跡 path / audit id / digest / 実行ログ / result exit code / report artifact などの concrete locator を伴わない手順文・予定文・recorded 宣言文は `present` にしない。`reapprovalTriggers[]` は HEAD/scope/source/evidence drift 時に version-up dry-run、activation packet、DB rebuild、doctor、action-binding approval packet を再実行させ、古い承認根拠を activation に流用させない | `jobs` / `budget_events` / `version_target` ledger / append-only session event / continuation projection / bounded memory breadcrumb / provider delegation evidence audit | HU-PILLAR-P1-01..04 / HU-PILLAR-N5-01..02 |
| HC-P2 | agent-loop | `validateToolContractSurface(input) => ToolSurfaceDecision` / `tickLoopEffortBudget(input) => LoopBudgetDecision` / `createLoopEffortBudget(input) => LoopEffortBudgetState` / `writeLoopTraceSpan(input) => TraceSpanWriteResult` / `selectWorkflowComplexity(input) => WorkflowComplexityDecision` / `buildPairAgentTddPlan(input) => PairAgentTddPlan` / `runPairAgentTddPlan(input) => PairAgentRunResult` | 未登録 surface は fail-close または explicit defer。登録 surface は request required fields / response required fields / forbidden fields / deny disposition を検証し、contract id mismatch や response 欠落を accept しない。loop budget は plan size / model role から既定上限を導出でき、iteration / toolCalls / costUsd / elapsedMs のいずれかが上限以上なら `allowContinue=false` / `allowWorkerPass=false`。`tick` は worker dispatch 前と verifier verdict 記録前に `tickLoopEffortBudget` を通し、超過時は `stopReason="effort_budget"` と `blockedReason` を記録して停止する。verifier が `pass` を返しても超過後は `lastVerdict="error"` に落とし、同 worker の pass/continue を成立させない。provider API/SDK daemon を required path にしない。TDD pair route は smart review agent の test/oracle 作成を light implementation より前に置き、Red/oracle marker に加えて `RED_TEST_COMMAND` と非ゼロ `RED_EXIT_CODE` が無い場合は light implementation へ進めない。light agent に closing authority を与えず、light implementation output が `VERDICT` / `FINAL_VERDICT` / `COMPLETION_CLAIM` / `CLOSE_PLAN` / `PLAN_STATUS` / `READY_FOR_REVIEW` / `APPROVAL` marker を出した場合は fail-close する。light implementation は changed-files / targeted-test-command / implementation-notes evidence を出すか、consultation question を出す。consultation は pass ではなく smart review の implementation directive / fix response を経て次の light fix cycle に戻す。consultation question が changed-files / targeted-test-command / implementation-notes と混在しても consultation を優先し、smart response 無しに実装 pass としない。smart review は明示 `VERDICT: pass|fail|error|pending` を必須とし、`pending` verdict は次の light fix cycle 用の implementation directive / fix response を欠けば error とする。smart review の fail 指示は bounded transcript として次の light implementation prompt に渡し、fail verdict が fix instruction を欠く場合は error とする。review finding だけを fix instruction とみなさない。pass verdict は Green evidence と review finding を欠く場合に fail-close する。`pair-agent plan --save-evidence` は adapter plan / prompt digest / frontier guardrail decision を `.helix/evidence/pair-agent/` に保存し、DB rebuild で plan phase agent を `model_runs`、plan gate を `gate_runs`、frontier approval を `guardrail_decisions` へ投影する。`pair-agent run --save-evidence` は plan/run/transcript と run/span/tool/handoff/guardrail/eval/duration/cost、`loop_summary`、`transcript_digest`、phase `output_excerpt_digest` を保存し、DB rebuild で `model_runs` / `gate_runs` / `guardrail_decisions` / `quality_signals` へ投影する。DB projection は `smart_test_author` から開始し、その後 `light_implementation` / `smart_review` が cycle 順に交互に並ぶことを検査し、順序違反の保存済み evidence は `pair-agent-run-evidence` gate を `blocked` にして finding を残す。`quality_signals` は phase_count だけでなく smart_test_author/light_implementation/smart_review/pending_consultation/consultation/failed_review/fix_cycle count を投影する | `model_runs` / `gate_runs` / `guardrail_decisions` / `quality_signals` / trace span / tool contract registry / pair-agent plan/run JSON / bounded pair transcript / pair-agent evidence JSON / loop effort budget decision | HU-PILLAR-P2-01..04 |
| HC-P3 | verification | `validatePairClosure(input) => PairClosureDecision` / `classifyVerificationEvidenceProfile(input) => VerificationEvidenceProfile` / `validateExternalGrounding(input) => GroundingDecision` / `validateTddOracle(input) => TddOracleDecision` / `selectVerificationProfile(input) => VerificationProfileDecision` | pair 欠落、coverage-only pass、self-review cross-agent 僭称、stale digest、external span 欠落、Red/oracle 欠落を accept しない。profile は timeout / p95 duration budget / worker count を必須にする | `trace_edges` / `test_runs` / `review_evidence` / runtime verification log | HU-PILLAR-P3-01..02 / HU-PILLAR-N3-01..04 / HU-PILLAR-N5-03 |
| HC-P4 | repair-feedback | `routeRepairFinding(input) => RepairCandidate` / `promoteRepairRecipe(input) => RepairRecipeDecision` / `projectMetricImprovementSignal(input) => MetricImprovementSignal` | detector finding は owner/route/rollback 無しに close しない。auth/PII/license/destructive repair は approval 無しで apply しない | `findings` / `quality_signals` / `feedback_events` / improvement backlog | HU-PILLAR-P4-01..03 |
| HC-P6 | distribution | `buildDistributionPlan(input) => DistributionPlan` / `planHelixProjectSetup(input) => SetupPlan` / `runHelixProjectSetup(input) => HelixProjectSetupResult` / `runConsumerDoctor(input) => LintResult` / `projectRuntimeAdapterAssets(input) => RuntimeAssetProjectionPlan` / `validatePrReviewRoute(input) => ReviewRouteDecision` / `planReleaseAutomationDecision(input) => ReleaseAutomationDecision` / `gateCiAutoFixRepush(input) => CiAutoFixDecision` / `auditIdentifierRenameBlastRadius(input) => IdentifierRenameAudit` / `buildIdentifierRenameCutoverPlan(input) => IdentifierRenameCutoverPlan` | raw push path、ruleset apply、branch protection apply、destructive setup overwrite、confidence<0.75 repush、release ADR 欠落を reject。consumer runtime asset は `.claude/agents` / `.claude/commands` / `.codex/hooks.json` / `.codex/config.toml` を明示投影し、dogfood `.claude/` / `.codex/` / `.helix/` runtime state、design/plans、`src/web/`、web 専用テスト、frontend asset/dependency residue は clean channel から除外する。clean artifact の core CLI は web module を静的 import せず、UI 非同梱でも `status` / `distribution plan` / `typecheck` が通る。`helix setup project` は HELIX 導入済み VSCode の新規 project 用に status / completion decision-packet / completion review-bundle / version-up dry-run / consumer doctor / rename plan / memory list / feedback list の `.vscode/tasks.json` と `.helix` memory/evidence/feedback/teams baseline を追加するが、dry-run 副作用ゼロと branch protection 既定 emit-only 境界を維持する。legacy `helix setup --apply-branch-protection` と生成される `setup-branch-protection.sh` / built-in fallback は、明示 apply 時も action-binding approval と `gh auth status` / repository admin preflight を通した場合だけ remote apply surface を持ち、script は token を保持せず `gh api -X PUT` で `harness-check` required status を設定できる。consumer doctor profile は setup 投影済み `AGENTS.md` / `CLAUDE.md` / `.claude` / `.codex` / `.vscode/tasks.json` / `.helix` baseline を検査し、dogfood repo 用 `docs/plans` / `docs/design/harness` / `docs/test-design` / runtime state を要求しない。さらに承認前 `.helix/**` state、`package.json` の `bin.helix`、`helix setup|doctor|status|handover|team` scripts、`.vscode/tasks.json` / `.github/workflows/harness-check.yml` / `.claude/settings.json` / `.codex/hooks.json` 上の executable HELIX alias を PLAN-M-02 承認前の alias activation として fail-close し、setup 完了を rename/cutover 完了に読み替えない。配布 adapter doc / Claude subagent / Claude slash-command / setup next action は日本語-first の説明文を持ち、CLI 名・識別子・stable token だけを原語許容にする。`HelixProjectSetupResult.githubPlan` は `schemaVersion=helix-project-github-plan.v1`、`planOnly=true`、`appliesRemote=false`、`applyCommandAvailable=true`、`workflowPath=.github/workflows/harness-check.yml`、`requiredChecks=["harness-check"]`、branch protection approval-bound script、action-binding approval、gh auth/admin preflight を返す。さらに `HelixProjectSetupResult.githubPlan.pullRequestCreation` は `gh auth status`、repo default branch 確認、GitHub App connector の `metadata:read` / `contents:read` / `pull_requests:write` 権限、`resource_not_accessible_by_integration` 失敗時の remediation、draft PR command template を plan として出し、PR 作成不能時に main 直 merge へ逃げない。`HelixProjectSetupResult.doctorBaseline` は `schemaVersion=helix-project-doctor-baseline.v1`、setup dry-run / status / `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer` / `helix rename plan --json` / memory list / feedback list / team-run dry-run、`.helix/memory|evidence|feedback|teams` baseline、`completionClaimAllowed=false` を返す。`HelixProjectSetupResult.importReport` は `schemaVersion=helix-project-import-report.v1`、`mode=fresh|brownfield`、`managedPaths`、`previewPaths`、`existingPaths`、実書込だけの `writtenPaths`、既存 non-mergeable 保持の `skippedExistingPaths`、`mergeableManagedBlockPaths`、`requiresReview`、`reviewRequiredReasons`、`nextRoute=ready|review_import_report` を持つ。`HelixProjectSetupResult.consumerReadiness` は consumer repo で projected hook が呼ぶ `helix` CLI の PATH 解決性、Bun/Git/GitHub CLI、Claude/Codex runtime mode、secret 不要の consumer CI smoke を setup output に含める。`HelixProjectSetupResult.postSetupWorkflow` は `importReport` と `consumerReadiness` を合成し、`nextRoute=ready|review_import_report|fix_consumer_readiness`、`unmetGates`、`nextActions`、`verificationCommands`、`blockedUntil`、`manualDocSearchRequired=false` を返す。verification commands は setup dry-run / status / completion decision-packet / completion review-bundle / version-up dry-run / consumer doctor / rename plan / memory list / feedback list / team-run dry-run を含め、ready route は completion blocked packet、PLAN-M-02 blocked packet、DB-backed continuationまたはcurrent PLAN route に接続する。brownfield conflict は `review_import_report` を優先し、fresh でも readiness 未充足なら `fix_consumer_readiness` を返す。`helix` が PATH 上で解決できない場合は setup を silent pass させず、`bun link` / `bun link helix` の actionable remediation を返す。setup JSON/text は `.helix` 現行 baseline と 現行 `.helix` state dir / `helix setup project` 目標 command を `identifierTransition` として返し、PLAN-M-02 cutover approval までは `blocked_pending_cutover_approval` / `mustNotApply=true` を明示する。`commandAvailability` は現行 `helix setup project` を available、現行 `helix setup project` を canonical とし、外部適用・完了判断 frontier が cutover approval 待ちであることを示す。PLAN-M-02 cutover は `.helix` / `helix` / `area=helix` blast radius audit と cutover approval record が揃うまで apply しない。rename audit は hit 数に加えて source/test/runtime-state/adapter-config/consumer-template/plan/design/governance/distribution surface 別の `hitsByCategory` を出し、cutover plan は category ごとの `cutoverCategoryChecklist` を返す。cutover plan は dry-run / rollback / monitoring / approval gate を出す plan-only surface で、apply command を提供しない。`approvalMaterialReady` は `approve_cutover` / `approve_action_binding` / actor/tool/target だけでは true にせず、approved params、current `cutoverSnapshot` sha256 binding、review evidence、expiry、audit、backup/rollback/monitoring evidence が揃う場合だけ true にする。`applyAuthorized` は plan-only packet では常に false とし、実 apply 許可とは読ませない | setup baseline / VSCode task baseline / GitHub rules/checks plan / consumer doctor baseline / release ledger / GitHub dry-run plan / import report / consumer readiness preflight / post-setup workflow / runtime asset manifest / rename audit/cutover-plan JSON | HU-PILLAR-P6-01..05 / HU-PILLAR-DIST-01 |
| HC-P7 | knowledge | `buildBoundedRecallPacket(input) => BoundedRecallPacket` / `detectGlossaryDrift(input) => GlossaryDriftFinding[]` / `validateContextMapBoundary(input) => ContextBoundaryDecision` | per-agent silo を SSoT にしない。provider delegation evidenceをrecall/continuation sourceへjoinしない。rename は supersedes 無しに close しない。context-crossing は anti-corruption boundary 無しなら drift | `.helix/memory` / provider delegation evidence audit / glossary / context-map / relation graph | HU-PILLAR-P7-01..03 |
| HC-P8 | security-boundary | `validateSourceAttribution(input) => SourceAttributionDecision` / `parseExternalSecurityFilter(input) => SecurityFilterDecision` / `selectSandboxTokenPolicy(input) => SandboxTokenDecision` / `requireActionBindingApproval(input) => ApprovalDecision` | raw external text を instruction に昇格しない。external action は sandbox/token scope/approval を欠けば deny。version-up activation / rename cutover の approval packet は `reviewed_snapshot_binding` が packet field 名だけの場合を pending とし、current `sha256:` snapshotId が無い限り concrete approval material とみなさない。version-up activation の current snapshot は repo HEAD に bound するため、`repoHeadSha` が取得できない入力では null HEAD の snapshot を期待値として作らず、approval packet 上 `activation snapshot cannot be validated without repoHeadSha` の pending に倒す。snapshot-bearing sibling packet を持たない action-binding は `no snapshot-bearing packet applies...` 等の明示 no-snapshot basis を concrete と扱い、単なる `no ` 文字列を pending obligation に誤分類しない。action-binding readiness は packet 生成対象と record 検査対象を分離し、`confirmed` / `completed` / `accepted` は packet から除外しても structured approval requirement の検査対象に残す。schema 外の未知 status は終端扱いにせず fail-close で structured approval requirement に残す。secret-like 値は evidence に保存しない | research artifact / security event / token policy / approval audit | HU-PILLAR-P8-01..04 / HU-PILLAR-N8-01..03 |

**HC-P6 session retirement contract（Reverse-344）**: setupはsession handover path/task/commandを
fresh/brownfieldへ生成しない。provider delegation evidenceは別schemaの監査証跡として保持するが、
setup continuationやbounded recallへjoinしない。

**HC-P6 2026-07-05 追補**: `auditIdentifierRenameBlastRadius` は uppercase 旧称 `HELIX` / `HELIX-HARNESS` / `HELIX:managed` を detection-only の residual として扱い、`residuals[]` / `residualsByDisposition[]` に `adapter_marker` / `fixture_only` / `approval_gated` / `reference_source` / `safe_prose_candidate` の disposition を出す。これらは residual visibility のための分類であり、PLAN-M-02 cutover/action-binding approval 前に `TOKENS` / `RENAME_MAP` / apply candidate へ昇格しない。path hit では `.helix` ルートディレクトリ自体も `.helix/**` 配下と同じ `runtime_state` として扱い、state dir migration の blast radius を `other` に逃がさない。さらに `pathRenameEntries[]` は旧名を含むファイル名・フォルダ名を path 単位に正規化し、`tokens[]`、`targetPath`、category、approval requirement、disposition を出す。これにより `scripts/helix`、`docs/templates/project/.helix/**`、`.helix/**` が本文 hit に埋もれず、承認前に物理 rename 可能と誤読されない。
**HC-P8 2026-07-02 追補**: `requireActionBindingApproval` / action-binding readiness は、英語の
`requires action-binding approval before ...` だけでなく、status / handover が PO 向けに出す
日本語文言 `高影響 action の実行前に human/action-binding approval を記録する` も high-impact
approval boundary として扱う。外部 API、infra、本番、設定変更、activation 等を伴うこの文言があり、
`action_binding_approval_record` が無い場合は prose-only approval mention として fail-close し、
`action-binding-approval-packet.v1` の対象に残す。

| HC-P9 | convergence-db | `checkProjectionConvergence(input) => ConvergenceStatus` / `classifyContractChange(input) => ContractChangeClass` / `queryLayerRegressionImpact(input) => RegressionImpactResult` / `analyzeOutstandingWork(input) => OutstandingWork` / `validateMessageCatalogSurface(input) => MessageCatalogSurfaceResult` / `summarizeMidLayerCoverage(input) => MidLayerCoverageSummary` / `validatePlanInventoryEvidence(input) => InventoryEvidenceResult` | projection 未収束、contract change 未分類、影響 layer gate/test/doctor 未実行を green にしない。`semanticFeatureFrontierRecords` は PO/S4 判断待ちを `frontier_pending_decision`、version-up parked を `parked_future_version`、irreversible rename/cutover を `approval_gated_cutover` に分類し、すべて `completionClaimAllowed=false` に固定する。irreversible rename/cutover は L14 / PLAN-M-02 family、`cutover_decision_record`、state dir / atomic migration、または `irreversible|不可逆` と migration/rename/cutover 文脈の組み合わせで判定し、S4/action-binding の説明文に含まれる bare `cutover` だけでは `approval_gated_cutover` にしない。S4 packet が supporting action-binding packet を出す PLAN は、S4 decision だけで終端可能とせず action-binding approval blocker も `blockedReasons[]` に保持する。outstanding は `confirmed` / `completed` / `accepted` を terminal、`archived` を closed として扱うが、readiness record 検査は terminal cutover / high-impact approval PLAN も対象にして terminal 化で必須 record 欠落を隠さない。`merged` / `rejected` / `superseded` など schema 外 status は terminal に読み替えず非終端 blocker として残す。`completionDecisionPacket` の `s4_decision_record` / `activation_decision_record` / `cutover_decision_record` は `source_ledger_freshness`、`source_status_delta`、`adoption_decision_delta`、`workflow_route_impact` を required field とし、source ledger が stale、または公式 source の現状・採否・route 影響が未記録なら終端判断 record として扱わない。message catalog surface は人間向け prose の差し替えだけを許可し、`OK` / `warning` / `violation` / JSON key / env 名 / command 名などの machine-surface token を固定する。mid-layer coverage は FR ごとの L3/L4/L5/L6 到達状態、停滞層、owner、defer 理由を集計し、層を飛ばした到達と新規停滞を finding にする。inventory evidence は design / add-design PLAN の confirmed 前に照合先、照合日、照合範囲、採否、未採用理由、旧 HELIX read-only 扱いを構造化して持たせ、prose-only の確認を freeze 根拠にしない。`workflowNextActions` / `completionDecisionPacket` / continuation read modelは複数 pending PLAN でも `scoped*PacketCommands` を出し、PO/S4・version-up・action-binding packet の `--plan` 絞り込みを人間の推測へ委ねない。`completionDecisionPacket.humanReviewBundle` は全 decision の順序、scoped primary packet、repo-local runnable scoped packet、supporting scoped packet、必須 record、PO 向け action/review route、owner/timing/freshness/safety review fields を束ね、4 frontier の判断材料を人間が個別 packet から推測して集める状態に戻さない。owner/timing/freshness review fields は `requiredRecords[].fields` から `recordName.field` として導出し、誰が・いつまでに・どの snapshot/source freshness を確認するかを completion packet だけで辿れるようにする。safety review fields は dedicated packet summary から `schemaVersion.field` として導出し、plan-only / must-not / allowed=false / approval gate 必須条件を completion packet だけで確認できるようにする。PO/chat 向け text surface は `requiredActionJa` / `requiredActionsJa` / `nextWorkflowRouteJa` / `reviewRouteJa` を先に表示し、同じ行または隣接行に `action-id` / `required-action-id` / `route-id` / `review-id` として machine field を残す。これにより日本語運用の意味確認と CLI/JSON の機械分岐を混同しない | harness.db projection / relation graph / contract ledger / layer baseline snapshot / outstanding status JSON / continuation projection snapshot / completion decision packet / message catalog ledger / mid-layer coverage summary / inventory evidence ledger | HU-PILLAR-P9-01..06 / HU-PILLAR-N3-03 / G-SF |

**HC-P9 2026-07-03 追補**: completion decision packet の S4 `supportingPacketSummaries[]` は、
S4 packet へのリンクだけでは足りない。`requiredReviewFields[]` に
`decisionRecord.source_ledger_freshness`、`decisionRecord.source_status_delta`、
`decisionRecord.adoption_decision_delta`、`decisionRecord.workflow_route_impact`、
`decisionEvidenceChecklist.verified_evidence`、`decisionEvidenceChecklist.stakeholder_review_or_proxy`、
`decisionEvidenceChecklist.acceptance_gap`、`decisionEvidenceChecklist.unresolved_risk`、
`decisionEvidenceChecklist.external_source_basis`、`decisionEvidenceChecklist.route_impact` を含める。
これらは S4 の source 鮮度、requirements trace、test basis、residual risk、Forward/Reverse route 影響を
PO review へ引き渡す最小単位であり、親 field 名だけを残して具体 field を落とす summary は fail-close する。

**HC-P9 2026-07-02 追補**: `objective-evidence-audit` の G-09 は、file count / green test count /
roadmap span count ではなく、L3 §0.2 の意味ベース機能一覧と live
`semanticFeatureFrontierRecords[]` の一致を `semantic-frontier-consistency` / C-18 経由で必須証跡にする。
この hard gate が G-09 から外れた場合、`objectiveProgress` は「数量ではなく意味で判定した」と主張できない。
したがって objective audit は `docs/governance/helix-l0-l8-design-consistency-audit.md`、`src/lint/semantic-frontier-consistency.ts`、
`tests/semantic-frontier-consistency.test.ts` と、C-18 / `semantic-frontier-consistency` /
live `semanticFeatureFrontierRecords[]` / live `confirmedCurrentMeaningRecords[]` / prose-only feature list の各
marker を必須にする。
| HC-AC | adapter-consistency | `validateAdapterParityMap(input) => AdapterParityDecision` / `requireHostedSurfacePreflight(input) => PreflightDecision` / `registerDeferredSurface(input) => DeferredSurfaceRegistration` / `validateRuntimeConfigHardening(input) => RuntimeConfigHardeningDecision` | hosted/API edit は hook-covered と主張できない。`validateAdapterParityMap` は direct `claude-hook` / `codex-hook` の既知 tool を `covered_by_hook`、`codex-hosted-api` / `hosted-api` / `developer-tool` を `preflight_required`、未知 direct surface を `drift` または明示 defer に分類する。`requireHostedSurfacePreflight` は hosted/API edit で hook 非強制 ack、git status preflight、target path、work-guard decision、preflight command、audit record を欠けば reject し、work-guard block を pass に変換しない。新 surface の registry/defer 欠落、adapter rule drift は reject。Codex `spawn_agent|spawn_agents_on_csv` は agent-guard 対象であり、明示 `agent_type` allowlist、direct model override 禁止、task body 必須、bulk spawn deny を fail-close する。`max_parallel` は `MAX_TEAM_PARALLEL=8` を上限にし、consumer Claude matcher は standard `Task` と environment-specific `Agent` の差を template/doc で吸収する | rule-drift result / preflight audit / adapter dry-run plan / runtime config matrix / agent-guard decision / hosted preflight JSON | HU-PILLAR-NAC-01..03 / HU-PILLAR-P2-03 / HU-PILLAR-CONFIG-01 |

**HC-P6 2026-07-02 追補**: `helix setup project` が生成する `.vscode/tasks.json` は status / completion decision-packet / completion review-bundle / version-up dry-run / consumer doctor /
rename plan / memory list / feedback list / team-run dry-run を同じ first-run verification set として投影する。
`harness-check.yml`、`consumerReadiness.ci.requires`、distribution acceptance、consumer doctor の expected task /
required run も package-local `bun run helix ...` 経路で `completion decision-packet --json`、`completion review-bundle --json`、`rename plan --json` を含み、completion blocked packet と PLAN-M-02 blocked
packet を保存しない初回稼働 claim を閉じない。adapter hook/readiness の bare `helix` PATH preflight は
別契約として残し、VSCode task command と混同しない。
consumer doctor の identifier transition gate は、既知 subcommand の狭い列挙ではなく、package string `bin`、
adapter hook、VS Code task、CI workflow、配布 Claude agent / slash-command に現れる lowercase `helix` 実行 alias
全般を承認前 alias activation として fail-close する。同じ consumer doctor surface で、配布 Claude subagent / slash-command は `helix status`、`helix completion decision-packet --json`、`helix completion review-bundle --json`、`helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json`、`helix doctor --profile consumer` の baseline を持つことを fail-close で検査する。`status` は状態、completion packet は `completionClaimAllowed=false` と未完了列、completion review-bundle は review packet coverage、version-up dry-run は tag 更新の plan-only 境界、consumer doctor は配布面の健全性を担い、doctor の成功だけを完了可否へ読み替えない。

**HC-P6 importReport 補足**: `HelixProjectSetupResult.importReport.skipSubDocs[]` は各 record に `marker=skip_sub_doc`、対象 path、理由、次 route、evidence、follow-up gate を持つ。fresh consumer setup では dogfood `docs/plans` / `docs/design/harness` / `docs/test-design` を `consumer_doctor_profile` へ段階化し、brownfield conflict では保持した consumer-owned path を `review_import_report` へ段階化する。

## §2 type sketch（型 sketch）

```ts
type ContractDecisionKind = "allow" | "deny" | "defer" | "blocker" | "human_required";
type EvidenceRef = { path: string; kind: "runtime" | "projection" | "review" | "continuation" };

interface ForwardReturnDecision {
  kind: "return_to_forward" | "gap_only" | "defer_to_version" | "blocker";
  target: string | null;
  blocked_reason: string | null;
}

interface VerificationProfileDecision {
  profile: "fast" | "default" | "full";
  timeout_seconds: number;
  p95_duration_budget_seconds: number;
  worker_count: number;
  selected_reason: string;
  overrun_policy: "blocker" | "continuation" | "improvement_task";
}

interface AdapterParityDecision {
  kind: "covered_by_hook" | "preflight_required" | "deferred_guard" | "drift";
  surface: string;
  evidence: EvidenceRef | null;
}

interface PairAgentTddPlan {
  status: "ready" | "blocked";
  reviewKind: "cross_agent" | "intra_runtime_subagent";
  agents: Array<{
    key: "smart-review-agent" | "light-implementation-agent";
    tier: "T0" | "T2";
    closingAuthority: boolean;
  }>;
  phases: Array<"smart_test_author" | "light_implementation" | "smart_review">;
  executionAuthorized: boolean;
}

interface RuntimeAssetProjectionPlan {
  consumer_assets: string[];
  excluded_dogfood_state: string[];
  rollback_managed_paths: string[];
}

interface RuntimeConfigHardeningDecision {
  max_parallel_limit: 8;
  accepted_matchers: Array<"Task" | "Agent">;
  dogfood_matcher_unchanged: boolean;
}
```

## §3 L3 -> L5 -> L6 trace

| L3 ID | L5 | L6 function | L7 oracle |
|-------|----|-------------|-----------|
| HR-FR-P0-01 | HC-P0 | `decideForwardReturn` | HU-PILLAR-P0-01 |
| HR-FR-P0-02 | HC-P0 | `recordStopReasonEvidence` | HU-PILLAR-P0-02 |
| HR-FR-P1-01 | HC-P1 | `evaluateAutonomyResume` | HU-PILLAR-P1-01 |
| HR-FR-P1-02 | HC-P1 | `planVersionUpgradeDryRun` / `buildVersionUpActivationPackets` | HU-PILLAR-P1-02 |
| HR-FR-P1-03 | HC-P1 | `evaluateAutonomyResume` | HU-PILLAR-P1-03 |
| HR-FR-P1-04 | HC-P1 | `selectL2TemplatePack` | HU-PILLAR-P1-04 |
| HR-FR-P2-01 | HC-P2 | `validateToolContractSurface` | HU-PILLAR-P2-01 |
| HR-FR-P2-02 | HC-P2 | `tickLoopEffortBudget` | HU-PILLAR-P2-02 |
| HR-FR-P2-03 | HC-AC | `validateAdapterParityMap` / `requireHostedSurfacePreflight` | HU-PILLAR-P2-03 |
| HR-FR-P2-04 | HC-P2 | `writeLoopTraceSpan` / `selectWorkflowComplexity` / `buildPairAgentTddPlan` / `runPairAgentTddPlan` | HU-PILLAR-P2-04 |
| HR-FR-P3-01 | HC-P3 | `validatePairClosure` | HU-PILLAR-P3-01 |
| HR-FR-P3-02 | HC-P3 | `validateExternalGrounding` | HU-PILLAR-P3-02 |
| HR-FR-P4-01 | HC-P4 | `routeRepairFinding` | HU-PILLAR-P4-01 |
| HR-FR-P4-02 | HC-P4 | `promoteRepairRecipe` | HU-PILLAR-P4-02 |
| HR-FR-P4-03 | HC-P4 | `projectMetricImprovementSignal` | HU-PILLAR-P4-03 |
| HR-FR-P6-01 | HC-P6 | `buildDistributionPlan` | HU-PILLAR-P6-01 |
| HR-FR-P6-02 | HC-P6 | `validatePrReviewRoute` / `gateCiAutoFixRepush` | HU-PILLAR-P6-02 |
| HR-FR-P6-03 | HC-P6 | `buildDistributionPlan` / `planHelixProjectSetup` / `runHelixProjectSetup` / `runConsumerDoctor` / `helix team run` | HU-PILLAR-P6-03 |
| HR-FR-P6-04 | HC-P6 | `planVersionUpgradeDryRun` / `auditIdentifierRenameBlastRadius` / `buildIdentifierRenameCutoverPlan` | HU-PILLAR-P6-04 |
| HR-FR-P6-05 | HC-P6 | `planReleaseAutomationDecision` / `gateCiAutoFixRepush` | HU-PILLAR-P6-05 |
| HR-FR-P7-01 | HC-P7 | `buildBoundedRecallPacket` | HU-PILLAR-P7-01 |
| HR-FR-P7-02 | HC-P7 | `detectGlossaryDrift` | HU-PILLAR-P7-02 |
| HR-FR-P7-03 | HC-P7 | `validateContextMapBoundary` | HU-PILLAR-P7-03 |
| HR-FR-P8-01 | HC-P8 | `validateSourceAttribution` | HU-PILLAR-P8-01 |
| HR-FR-P8-02 | HC-P8 | `validateSourceAttribution` | HU-PILLAR-P8-02 |
| HR-FR-P8-03 | HC-P8 | `selectSandboxTokenPolicy` / `requireActionBindingApproval` | HU-PILLAR-P8-03 |
| HR-FR-P8-04 | HC-P8 | `parseExternalSecurityFilter` | HU-PILLAR-P8-04 |
| HR-FR-P9-01 | HC-P9 | `checkProjectionConvergence` / `analyzeOutstandingWork` -> `semanticFeatureFrontierRecords` | HU-PILLAR-P9-01 / G-SF |
| HR-FR-P9-02 | HC-P9 | `classifyContractChange` | HU-PILLAR-P9-02 |
| HR-FR-P9-03 | HC-P9 | `queryLayerRegressionImpact` | HU-PILLAR-P9-03 |
| HR-FR-P9-04 | HC-P9 | `validateMessageCatalogSurface` | HU-PILLAR-P9-04 |
| HR-FR-P9-05 | HC-P9 | `summarizeMidLayerCoverage` | HU-PILLAR-P9-05 |
| HR-FR-P9-06 | HC-P9 | `validatePlanInventoryEvidence` | HU-PILLAR-P9-06 |
| HR-NFR-P3-01 | HC-P3 | `classifyVerificationEvidenceProfile` | HU-PILLAR-N3-01 |
| HR-NFR-P3-02 | HC-P3 | `classifyVerificationEvidenceProfile` | HU-PILLAR-N3-02 |
| HR-NFR-P3-03 | HC-P9 | `queryLayerRegressionImpact` | HU-PILLAR-N3-03 |
| HR-NFR-P3-04 | HC-P3 | `validateTddOracle` | HU-PILLAR-N3-04 |
| HR-NFR-P5-01 | HC-P1 | `appendContinuationEvent` / `projectContinuationEvent` | HU-PILLAR-N5-01 |
| HR-NFR-P5-02 | HC-P1 | `replayContinuationEvents` / `detectRetiredSessionSurfaceResurrection` | HU-PILLAR-N5-02 |
| HR-NFR-P5-03 | HC-P3 | `selectVerificationProfile` | HU-PILLAR-N5-03 |
| HR-NFR-P8-01 | HC-P8 | `requireActionBindingApproval` | HU-PILLAR-N8-01 |
| HR-NFR-P8-02 | HC-P8 | `parseExternalSecurityFilter` | HU-PILLAR-N8-02 |
| HR-NFR-P8-03 | HC-P8 | `selectSandboxTokenPolicy` / `requireActionBindingApproval` | HU-PILLAR-N8-03 |
| HR-NFR-AC-01 | HC-AC | `validateAdapterParityMap` | HU-PILLAR-NAC-01 |
| HR-NFR-AC-02 | HC-AC | `requireHostedSurfacePreflight` | HU-PILLAR-NAC-02 |
| HR-NFR-AC-03 | HC-AC | `registerDeferredSurface` / `validateAdapterParityMap` | HU-PILLAR-NAC-03 |

## §3.1 upstream runtime-hardening adoption（上流 runtime hardening 採用）

上流 `PLAN-L7-190` / `PLAN-L7-196` の具体化は、HELIX では以下の L6 contract として扱う。

| Upstream | HELIX L6 contract | 必須 behavior | Oracle |
|----------|-------------------|-------------------|--------|
| PLAN-L7-190 | `projectRuntimeAdapterAssets` | consumer clean distribution に Claude subagent roster、Claude slash commands、Codex hook/config template を含め、dogfood `.claude/` / `.codex/` / `.helix/` state、design/plans/web assets を除外する。rollback/readiness metadata は expanded managed path set を返す | HU-PILLAR-DIST-01 |
| PLAN-L7-196 SEC-3 | `validateRuntimeConfigHardening` | `max_parallel` は default 8 互換を保ちつつ `MAX_TEAM_PARALLEL=8` 超過を reject する。過大並列は resource exhaustion risk として fail-close | HU-PILLAR-CONFIG-01 |
| PLAN-L7-196 SEC-4 | `validateRuntimeConfigHardening` | consumer template は standard Claude Code `Task` matcher と環境差 `Agent` を区別して guard 発火を証明する。dogfood matcher は現行互換のため無理に変更しない | HU-PILLAR-CONFIG-01 |

## §4 logging and maintainability（logging と保守性）

L6 function は pass/fail の boolean だけを返さない。保守時に原因を追えるよう、各 family は以下を返す:

- normalized input summary: secret/body を含まない contract input の要約。
- decision kind: `allow` / `deny` / `defer` / `blocker` / `human_required`。
- failing invariant: `missing_forward_return`、`coverage_only_pass`、`projection_unconverged` など stable code。
- evidence refs: runtime log、continuation projection row、bounded memory ref、review evidenceのpath/key。

Runtime behavior を主張する function は `upstream-substance-gap.md` §5 の `RuntimeVerificationLogEvent` と結合できる
`correlation_id` を持つ。projection は補助であり、acceptance source of truth は runtime log event または
review evidence に残す。

### §4.0 pair-agent TDD verification basis（検証根拠）

`buildPairAgentTddPlan` は pair programming を「2 agent が同時に触る」ではなく、TDD の順序契約として扱う。
smart review agent は test/oracle を先に作り、light implementation agent はその Red evidence を満たす最小実装だけを行い、
smart review agent が test/review/verdict を閉じる。根拠は以下の外部確認済み方針に合わせる。

- TDD は test case list から Red / Green / Refactor を反復し、実装前に失敗する test/oracle を置く。
  出典: Martin Fowler, "Test Driven Development" (https://martinfowler.com/bliki/TestDrivenDevelopment.html), checked 2026-07-01.
- Red/oracle marker、`RED_TEST_COMMAND`、非ゼロ `RED_EXIT_CODE` が無い smart_test_author 出力、Green evidence / review finding が無い pass verdict、
  fix instruction が無い fail verdict は TDD pair loop の証跡として受理しない。これは pair-agent の local verdict を
  自己申告の文字列ではなく、後続 review/test/DB projection が読める evidence unit にするための fail-close 条件である。
- task difficulty は pair-agent plan の一部として記録する。`maxFixCycles` が明示されない場合は difficulty policy から
  `trivial/simple=1`、`standard=2`、`complex=3`、`critical=4` を導出し、出所を `maxFixCyclesSource` に残す。
  明示上書きは `explicit` として残す。fix cycle を使い切って smart review の `VERDICT: pass` に到達しない場合は
  `max-fix-cycles-exhausted` finding を返し、失敗が無音の「未完了」にならないようにする。
- light implementation が `VERDICT` / `FINAL_VERDICT` / `COMPLETION_CLAIM` / `CLOSE_PLAN` / `PLAN_STATUS` /
  `READY_FOR_REVIEW` / `APPROVAL` marker を出した場合は、light agent が closing authority を越えたものとして fail-close する。
  light implementation が changed-files / targeted-test-command / implementation-notes を出さず、consultation question も出さない場合は
  実装証跡として受理しない。consultation question は pass ではなく、smart review の implementation directive / fix response を
  bounded transcript へ残して次の light fix cycle に戻す。consultation question が実装証跡と混在しても pending consultation とし、
  smart response を欠いた実装 pass へ進めない。
- secure development は code review / analysis / testing の issue と remediation を workflow へ記録する。
  出典: NIST SP 800-218 SSDF v1.1 (https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf), checked 2026-07-01.
- automated testing だけでなく manual secure code review を組み合わせる。特に agent output の承認・完了主張は
  `review_findings` / `verdict_line` / guardrail evidence を分けて検証し、軽量実装 agent の自己承認を許可しない。
  出典: OWASP Code Review Guide (https://owasp.org/www-project-code-review-guide/), checked 2026-07-01.
- merge/push 側の最終 gate は required checks を待つため、pair-agent の local verdict は CI/merge queue の代替ではなく事前証跡である。
  出典: GitHub Docs, "Managing a merge queue" (https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), checked 2026-07-01.

## §4.1 telemetry provenance source map（source 対応表）

上流 `PLAN-L7-192` / `193` / `199` / `200` / `201` は、projection-only telemetry を拒否するだけでなく、
どの runtime source がどの DB table の evidence になれるかを固定している。HELIX では以下を L6 contract とする。

| Projection table | provenance として受理する runtime source | runtime evidence として reject するもの | L6 function / oracle |
|------------------|---------------------------------------|------------------------------|----------------------|
| `test_runs` | `.helix/logs/session/*.jsonl` の sanitized verification `tool_use` (`Bash (vitest)` / `Bash (test)` / `Bash (tsc)` / `Bash (doctor)` / `Bash (lint)` / `Bash (eslint)`)。非空 `session_id`、`runtime=hook-session-log`、`scope=runtime-hook` を持つ | review-evidence projection only、generic Bash、hash restamp only | `classifyVerificationEvidenceProfile` / HU-PILLAR-PROV-01 |
| `model_runs` | Claude/Codex runtime JSONL token telemetry を `loadRuntimeSessionUsage` / token projection で読んだ non-empty token/cost row | deterministic rebuild projection only、provider launch claim without JSONL evidence | `classifyVerificationEvidenceProfile` / HU-PILLAR-PROV-02 |
| `guardrail_decisions` | session-log `forced_stop` event。`guardrail=forced-stop`、`decision=block`、`mode=runtime-hook`、非空 `session_id` | ordinary tool_use、issue approval projection only | `classifyVerificationEvidenceProfile` / HU-PILLAR-PROV-03 |
| `skill_invocations` | durable `Bash (skill)` session event、特に skill suggestion command。`source=runtime-hook:skill-suggest` と非空 `session_id` を持つ | generic Bash、review-evidence projection only、skill mention in prose | `classifyVerificationEvidenceProfile` / HU-PILLAR-PROV-04 |

Enforcement rule: `fired` / `used` / `works` / `executed` claim は、上表の source に一致しない telemetry row では
close できない。projection-only row は relation/impact の補助には使えるが、acceptance source にはならない。

## §5 carry

- L7: 本書の 30 function contract を TS/Bun 実装へ分割する。既存 Route-B 実装がある P2/P7 は再実装ではなく adapter/family へ接続する。
- L7.5: `works` / `used` / `fired` claim を持つ P2/P3/P6/P7/P8/P9/AC は RUN & Debug evidence を要求する。
- L8/L9/L12: 本書の `HU-PILLAR-*` は L5/L4/L3 test-design の `LIT-*` / `HST-*` / `HAT-*` に逆参照される。
