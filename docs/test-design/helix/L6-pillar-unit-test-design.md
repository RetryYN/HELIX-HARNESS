---
title: "HELIX L7 単体テスト設計 — pillar HC function contracts"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-06-30
updated: 2026-07-01
owner: QA + AIM
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/design/helix/L6-function-design/pillar-function-design.md
related_l6: docs/design/helix/L6-function-design/pillar-function-design.md
next_pair_freeze: L6
---

# HELIX L7 単体テスト設計 — pillar HC function contracts

本書は `pillar-function-design.md` の pair test-design である。L5 `HC-*` contract を L6 function contract
として実装する際、各 `HU-PILLAR-*` が Red/Green の単体 oracle になる。

## §0 量閉じ

- 対象 L6 function family: 10 件。
- 対象 L3 要件: 43 件。
- L7 unit oracle: `HU-PILLAR-*` 43 件。
- 孤児: 0。詳細は §1 trace。
- L1 §2.8 asset/progress visualization amendment は S4 decision 待ちであり、本 `HU-PILLAR-*` 43 件の
  unit oracle に含めない。`PLAN-L7-206` の read-model tests は first response の先行検証であり、
  VSCode Tree View / Webview の view-model function oracle ではない。
- G-SF `semantic_feature_frontier_record` で `frontier_pending_decision` / `parked_future_version` /
  `approval_gated_cutover` に分類された意味単位は、L6 unit oracle の confirmed 43 件へ混ぜない。
  `completion_claim_allowed=false` が unit oracle の期待動作であり、関数や CLI surface の一部実装だけで
  `confirmed_current` へ昇格しない。

## §1 unit oracle trace

| Oracle | L3 | HC | Target function | Expected behavior |
|--------|----|----|-----------------|-------------------|
| HU-PILLAR-P0-01 | HR-FR-P0-01 | HC-P0 | `decideForwardReturn` | return/gap/version target のいずれも無い completion claim を reject |
| HU-PILLAR-P0-02 | HR-FR-P0-02 | HC-P0 | `recordStopReasonEvidence` | cap/lock/Recovery stop reason を evidence に残し、空 reason を blocker 化 |
| HU-PILLAR-P1-01 | HR-FR-P1-01 | HC-P1 | `evaluateAutonomyResume` | resume 3 条件、job availability、budget、handover next_action が揃う時だけ dispatch |
| HU-PILLAR-P1-02 | HR-FR-P1-02 | HC-P1 | `planVersionUpgradeDryRun` / `buildVersionUpActivationPackets` / `ut-tdd version-up dry-run` / `ut-tdd version-up activation-packet` | `version-up-dry-run-plan.v1` は current/target SemVer、migration/rollback/idempotency/release gate/source basis を返し、target が current 以下または invalid なら `ok=false`。dry-run と parked PLAN の activation packet は `planOnly=true` / `mustNotApply=true` / `applyCommandAvailable=false` / `activationAllowed=false` であり、承認なしに apply surface を作らない。同一 PLAN に external/action-binding 境界がある場合は `relatedDecisionPackets[]` に supporting `ut-tdd action-binding approval-packet --json` を残す。activation packet は packet-level `generatedAt` / `sourceCommand` / `freshness` と source-level `sourceLedgerFreshness` を別々に出し、packet 自体または source ledger が stale なら activation 判断に流用させない。source ledger が stale または必須 source 欠落なら blocked reason にして古い外部前提で activation 判断を進めない。`activationReadinessChecks[]` は external rehearsal / provenance evidence を `present` / `pending_evidence` に分類し、pending は blocked reason に残す。証跡 path / audit id / digest / 実行ログ / result exit code / report artifact などの concrete locator を伴わない手順文・予定文・recorded 宣言文は `pending_evidence` に残す。`reapprovalTriggers[]` と `activationSnapshot.snapshotId` は HEAD/scope/source/evidence drift 時に dry-run・doctor・approval packet の再実行を要求し、古い承認根拠を activation に流用させない |
| HU-PILLAR-P1-03 | HR-FR-P1-03 | HC-P1 | `evaluateAutonomyResume` | large request slice が Forward return、budget、acceptance を持たなければ dispatch しない |
| HU-PILLAR-P1-04 | HR-FR-P1-04 | HC-P1 | `selectL2TemplatePack` | L2 skip 時も template pack と defer/back-propagation record を返す |
| HU-PILLAR-P2-01 | HR-FR-P2-01 | HC-P2 | `validateToolContractSurface` | registered request/response schema は allow、unknown surface は deny/defer、required/forbidden field 違反と registered deny surface は fail-close |
| HU-PILLAR-P2-02 | HR-FR-P2-02 | HC-P2 | `tickLoopEffortBudget` / `tick` | plan size / model role 由来の上限と iteration / toolCalls / costUsd / elapsedMs を照合し、over-budget loop が same worker continue/pass を返さない。worker dispatch 前の超過は dispatch しない。verifier が pass を返しても verdict 記録前に超過したら `lastVerdict="error"` / `stopReason="effort_budget"` / `blockedReason` で停止する |
| HU-PILLAR-P2-03 | HR-FR-P2-03 | HC-AC | `validateAdapterParityMap` / `requireHostedSurfacePreflight` / `ut-tdd guard preflight --json` | direct hook-covered surface と hosted preflight-only surface を分離し、hosted/API surface を hook-covered と誤表示しない |
| HU-PILLAR-P2-04 | HR-FR-P2-04 | HC-P2 | `writeLoopTraceSpan` / `selectWorkflowComplexity` / `buildPairAgentTddPlan` / `runPairAgentTddPlan` / `ut-tdd pair-agent plan/run` / `rebuildHarnessDb` | PLAN/tool/handoff/guardrail/eval span を残し、simple workflow を既定にする。TDD pair route では smart review agent が最初に test/oracle を作り、light implementation agent が実装し、smart review agent がテスト・レビュー・VERDICT を出す。smart test author が Red/oracle evidence marker、`RED_TEST_COMMAND`、非ゼロ `RED_EXIT_CODE` を出さない場合は light implementation へ進めない。light agent は closing authority を持たず、light output が `VERDICT` / `FINAL_VERDICT` / `COMPLETION_CLAIM` / `CLOSE_PLAN` / `PLAN_STATUS` / `READY_FOR_REVIEW` / `APPROVAL` marker を出した場合は fail-close する。fail verdict と smart review の fix instruction は bounded transcript として次の light implementation prompt へ渡る。light output に consultation question が含まれる場合は changed-files / targeted-test-command / implementation-notes が同時にあっても pending consultation とし、smart directive / fix response を次の light fix cycle へ渡す。smart review が明示 `VERDICT: pass|fail|error|pending` を出さない場合、pending verdict が continuation directive を欠く場合、fail verdict が fix instruction を欠く場合、および pass verdict が Green evidence と review finding を欠く場合は local pass にしない。review finding だけを fix instruction として扱わない。task difficulty を inferred/explicit で plan に残し、`maxFixCycles` 未指定時は difficulty policy (`trivial/simple=1`, `standard=2`, `complex=3`, `critical=4`) を使う。明示 max は `maxFixCyclesSource=explicit` とし、max 到達時は `max-fix-cycles-exhausted` finding を返す。`pair-agent plan --save-evidence` は `.ut-tdd/evidence/pair-agent/` に adapter plan / prompt digest / frontier guardrail evidence を残し、DB rebuild は plan phase agent を `model_runs`、plan gate を `gate_runs`、frontier approval を `guardrail_decisions` に投影する。`pair-agent run --save-evidence` は `loop_summary` / `transcript_digest` / phase `output_excerpt_digest` で consultation/fix/review loop を再生可能にする。DB rebuild は保存済み `phase_spans` が `smart_test_author` から始まり、`light_implementation` / `smart_review` が cycle 順に交互に続くことを検査し、違反時は `pair-agent-run-evidence` gate を `blocked` にして finding を残す。run phase agent は `model_runs`、run gate は `gate_runs`、frontier approval は `guardrail_decisions`、phase/smart/light/review/consultation/pending consultation/failed review/fix cycle count は `quality_signals` に投影する。T0 smart agent は実行前に explicit frontier approval を要求する |
| HU-PILLAR-P3-01 | HR-FR-P3-01 | HC-P3 | `validatePairClosure` | pair 欠落と coverage-only pass を reject |
| HU-PILLAR-P3-02 | HR-FR-P3-02 | HC-P3 | `validateExternalGrounding` | URL/version/span と separate verifier evidence 欠落を reject |
| HU-PILLAR-P4-01 | HR-FR-P4-01 | HC-P4 | `routeRepairFinding` | repair candidate に owner/route/rollback/risk を必須にする |
| HU-PILLAR-P4-02 | HR-FR-P4-02 | HC-P4 | `promoteRepairRecipe` | successful repair を memory/backlog candidate に変換 |
| HU-PILLAR-P4-03 | HR-FR-P4-03 | HC-P4 | `projectMetricImprovementSignal` | review/rework/test duration/flake/regression metric を improvement signal にする |
| HU-PILLAR-P6-01 | HR-FR-P6-01 | HC-P6 | `buildDistributionPlan` | rulesets/checks/merge queue/bypass audit を dry-run plan に出す |
| HU-PILLAR-P6-02 | HR-FR-P6-02 | HC-P6 | `validatePrReviewRoute` / `gateCiAutoFixRepush` | worker!=verifier と confidence/iteration cap を強制 |
| HU-PILLAR-P6-03 | HR-FR-P6-03 | HC-P6 | `buildDistributionPlan` / `runHelixProjectSetup` / `ut-tdd setup project` | fresh/brownfield setup は managed diff/import report を出し既存を壊さない。U-SETUP-015 は fresh/dry-run baseline、identifier transition、command availability、PATH 未解決時の `consumerReadiness` remediation と `postSetupWorkflow.nextRoute=fix_consumer_readiness` を検証し、U-SETUP-016 は brownfield の existing/skipped/written/mergeable path、`requiresReview`、`importReport.nextRoute=review_import_report`、`postSetupWorkflow.nextRoute=review_import_report` を検証する。U-SETUP-017 は consumer repo で projected hook が呼ぶ `ut-tdd` CLI の PATH 解決性を `consumerReadiness` に記録し、consumer CI smoke が secret 不要であることと `postSetupWorkflow.nextRoute=ready` を検証する。U-SETUP-019 は `githubPlan` と `doctorBaseline` を plan-only 構造として返し、GitHub rules/checks plan が remote apply surface を持たず、doctor baseline が setup dry-run / status / doctor / handover status と `.ut-tdd/memory|handover|evidence` を初回稼働証跡として示すことを検証する。U-SETUP-020 は setup が配布する adapter doc / Claude subagent / Claude slash-command / next action を日本語-first に固定し、CLI 名・識別子・stable token だけを原語許容にする。setup output は現行 `ut-tdd setup project` を available、将来 `helix setup project` を unavailable として出し、PLAN-M-02 cutover approval 前に package/bin alias が有効であると誤認させない。CLI surface は `post-setup-workflow` / `github-plan` / `doctor-baseline` を text/JSON に出し、manual doc search なしに初回稼働ルートを判断できることを固定する |
| HU-PILLAR-P6-04 | HR-FR-P6-04 | HC-P6 | `planVersionUpgradeDryRun` / `auditIdentifierRenameBlastRadius` / `buildIdentifierRenameCutoverPlan` / `ut-tdd rename audit` / `ut-tdd rename plan` | tag bump に rollback/destructive block/idempotency evidence を要求する。PLAN-M-02 identifier rename は `ut-tdd` / `.ut-tdd` / `area=harness` blast radius を audit し、source/test/runtime-state/adapter-config/consumer-template/plan/design/governance/distribution surface の category 別 hit と cutover action checklist を返す。cutover/action-binding approval が無い限り `.ut-tdd -> .helix` apply 可能と扱わない。`rename plan` は dry-run / rollback / monitoring / approval gate / `cutoverSnapshot.snapshotId` と packet-level `generatedAt` / `sourceCommand` / `freshness` を返すが、approval records が concrete でも plan-only であり apply command を提供しない。`applyAuthorized` 判定は `approve_cutover` / `approve_action_binding` / actor/tool/target だけでなく approved params、current `cutoverSnapshot` sha256 binding、review evidence、expiry、audit、backup/rollback/monitoring evidence を要求する。`cutoverSnapshot` は blast radius / approval scope / evidence digest を束ね、hit set や evidence や packet generation が変わった旧承認材料を cutover に流用させない。`relatedDecisionPackets[]` は primary rename plan と supporting action-binding approval packet を保持する |
| HU-PILLAR-P6-05 | HR-FR-P6-05 | HC-P6 | `planReleaseAutomationDecision` / `gateCiAutoFixRepush` | release ADR 欠落と confidence<0.75 repush を reject |
| HU-PILLAR-P7-01 | HR-FR-P7-01 | HC-P7 | `buildBoundedRecallPacket` | Claude/Codex が shared provider memory から bounded recall する |
| HU-PILLAR-P7-02 | HR-FR-P7-02 | HC-P7 | `detectGlossaryDrift` | rename/synonym drift に old/new/supersedes/context を要求 |
| HU-PILLAR-P7-03 | HR-FR-P7-03 | HC-P7 | `validateContextMapBoundary` | context-crossing call は anti-corruption boundary または translation rule を要求 |
| HU-PILLAR-P8-01 | HR-FR-P8-01 | HC-P8 | `validateSourceAttribution` | source URL/version/span 欠落を unverified にする |
| HU-PILLAR-P8-02 | HR-FR-P8-02 | HC-P8 | `validateSourceAttribution` | skillify candidate は license/safety/scope review 欠落で registry reject |
| HU-PILLAR-P8-03 | HR-FR-P8-03 | HC-P8 | `selectSandboxTokenPolicy` / `requireActionBindingApproval` | external action に sandbox/token/approval を要求 |
| HU-PILLAR-P8-04 | HR-FR-P8-04 | HC-P8 | `parseExternalSecurityFilter` | raw/metadata/trusted extraction/instruction を分離 |
| HU-PILLAR-P9-01 | HR-FR-P9-01 | HC-P9 | `checkProjectionConvergence` / `analyzeOutstandingWork` / `completionDecisionPacketForOutstanding` | projection 未収束 artifact を complete 扱いにしない。PO/S4 判断待ち、version-up parked、rename/cutover 承認待ちは `semantic_feature_frontier_record` として `frontier_pending_decision` / `parked_future_version` / `approval_gated_cutover` に分類され、`completionClaimAllowed=false` を返す。outstanding の terminal 判定は `confirmed` / `completed` / `accepted` と closed `archived` に限定し、schema 外 status (`merged` 等) を終端扱いにしない。readiness record 検査は terminal cutover / high-impact approval PLAN も対象にし、terminal 化で必須 record 欠落を隠さない。S4 / activation / cutover / action-binding の dedicated packet は `generatedAt` / `sourceCommand` / `freshness` を持ち、status text は planId 別 `workflow-next-action` と packet command を表示する。S4 / activation / cutover の record template は `source_ledger_freshness`、`source_status_delta`、`adoption_decision_delta`、`workflow_route_impact` を required field として持ち、外部 source 鮮度・採否差分・route 影響を欠く終端判断 record を完了根拠にしない |
| HU-PILLAR-P9-02 | HR-FR-P9-02 | HC-P9 | `classifyContractChange` | relation graph/contract ledger に breaking/compatible/migration-needed を要求 |
| HU-PILLAR-P9-03 | HR-FR-P9-03 | HC-P9 | `queryLayerRegressionImpact` | layer baseline/gate/metric/owner 欠落を blocker にする |
| HU-PILLAR-N3-01 | HR-NFR-P3-01 | HC-P3 | `classifyVerificationEvidenceProfile` | green command/review tier/external grounding を区別 |
| HU-PILLAR-N3-02 | HR-NFR-P3-02 | HC-P3 | `classifyVerificationEvidenceProfile` | design/AC/code/test/review finding の対応欠落を reject |
| HU-PILLAR-N3-03 | HR-NFR-P3-03 | HC-P9 | `queryLayerRegressionImpact` | affected layer の gate/test/doctor 未実行を blocker にする |
| HU-PILLAR-N3-04 | HR-NFR-P3-04 | HC-P3 | `validateTddOracle` | Red/oracle/Green/refactor または substitute oracle を要求 |
| HU-PILLAR-N5-01 | HR-NFR-P5-01 | HC-P1 | `mergeAnchoredHandover` | verbatim/summary/stable constraints と raw evidence pointer を分離 |
| HU-PILLAR-N5-02 | HR-NFR-P5-02 | HC-P1 | `mergeAnchoredHandover` | fixed section merge が Next Action/artifact trail を落とさない |
| HU-PILLAR-N5-03 | HR-NFR-P5-03 | HC-P3 | `selectVerificationProfile` | fast<=120s/default<=600s/full<=1800s、timeout、p95 duration budget、worker count を持つ |
| HU-PILLAR-N8-01 | HR-NFR-P8-01 | HC-P8 | `requireActionBindingApproval` / `buildActionBindingApprovalPackets` | high-impact action は matching approval 無しに deny。version-up activation / rename cutover の approval packet は `reviewed_snapshot_binding` が `activationSnapshot.snapshotId` / `cutoverSnapshot.snapshotId` という field 名だけなら pending にし、current `sha256:` snapshotId を含む時だけ concrete snapshot binding とする。version-up approval は sibling `version-up-activation-packet.v1` が現在生成する `activationSnapshot.snapshotId` と一致しない concrete sha256 を invalid にし、旧 release trigger / source ledger / approval scope / evidence snapshot の承認流用を防ぐ。rename/cutover approval も current `ut-tdd rename plan --json` の `cutoverSnapshot.snapshotId` と一致しない concrete sha256 を invalid にし、旧 blast radius / rollback / backup / monitoring snapshot の承認流用を防ぐ。terminal high-impact PLAN は packet から除外しても structured approval record 検査では fail-close し、schema 外 status は structured approval requirement に残す |
| HU-PILLAR-N8-02 | HR-NFR-P8-02 | HC-P8 | `parseExternalSecurityFilter` | prompt/tool injection と exfiltration を classify し deny/review/redaction へ送る |
| HU-PILLAR-N8-03 | HR-NFR-P8-03 | HC-P8 | `selectSandboxTokenPolicy` / `requireActionBindingApproval` | agentic AI escalation に least privilege/rollback/monitoring/risk owner を要求 |
| HU-PILLAR-NAC-01 | HR-NFR-AC-01 | HC-AC | `validateAdapterParityMap` | adapter/template/skill/runtime rule drift を drift として返す |
| HU-PILLAR-NAC-02 | HR-NFR-AC-02 | HC-AC | `requireHostedSurfacePreflight` / `ut-tdd guard preflight --json` | hosted/API edit は hook non-enforcement ack、git status、target path、work-guard decision、preflight command、audit evidence 欠落で reject。work-guard block を pass に変換しない |
| HU-PILLAR-NAC-03 | HR-NFR-AC-03 | HC-AC | `registerDeferredSurface` / `validateAdapterParityMap` | PLAN/CLI/harness DB/dry-run path を SSoT にし、provider API direct path を required にしない。Codex `spawn_agent|spawn_agents_on_csv` は required agent-guard matcher として検証し、missing/unknown `agent_type`、direct model override、task body 欠落、bulk spawn を fail-close する |

## §1.1 upstream hardening and provenance oracles

| Oracle | Upstream | HC | Target function | Expected behavior |
|--------|----------|----|-----------------|-------------------|
| HU-PILLAR-DIST-01 | PLAN-L7-190 | HC-P6 | `projectRuntimeAdapterAssets` / `buildCleanDistributionPlan` | consumer package includes `.claude/agents`, `.claude/commands`, `.codex/hooks.json`, `.codex/config.toml`; excludes dogfood `.claude/`, `.codex/`, `.ut-tdd/`, design, plan, `src/web/`, web 専用テスト, and web runtime state; clean artifact still passes core CLI `status` / `distribution plan` / `typecheck`; rollback metadata lists managed runtime assets |
| HU-PILLAR-CONFIG-01 | PLAN-L7-196 | HC-AC | `validateRuntimeConfigHardening` | `max_parallel===MAX_TEAM_PARALLEL` is accepted, `max_parallel>MAX_TEAM_PARALLEL` is rejected, consumer matcher matrix covers standard `Task` and environment-specific `Agent` without changing dogfood matcher |
| HU-PILLAR-PROV-01 | PLAN-L7-193 | HC-P3 | `classifyVerificationEvidenceProfile` | `test_runs` runtime evidence must come from sanitized session-log verification Bash events with non-empty `session_id`; generic Bash and review projection do not close works/fired/used |
| HU-PILLAR-PROV-02 | PLAN-L7-199 | HC-P3 | `classifyVerificationEvidenceProfile` | `model_runs` runtime provenance requires Claude/Codex JSONL token telemetry; deterministic rebuild projection is trace-support only |
| HU-PILLAR-PROV-03 | PLAN-L7-200 | HC-P3 | `classifyVerificationEvidenceProfile` | `guardrail_decisions` runtime provenance requires `forced_stop` session events with `guardrail=forced-stop` and non-empty `session_id`; ordinary tool_use does not fabricate guardrail evidence |
| HU-PILLAR-PROV-04 | PLAN-L7-201 | HC-P3 | `classifyVerificationEvidenceProfile` | `skill_invocations` runtime provenance requires durable `Bash (skill)` session events with `source=runtime-hook:skill-suggest`; prose mention or generic Bash is rejected |

## §2 family-level negative tests

| Family | Negative oracle |
|--------|-----------------|
| HC-P0 | completion claim without Forward return, gap-only, or version target returns `blocker` |
| HC-P1 | stale lock, missing next_action, budget overrun, or parked version-up activation without concrete action-binding approval returns `idle` / `handover` / `blocker` / plan-only packet, never `dispatch` / `apply` |
| HC-P2 | unknown surface and over-budget loop cannot produce pass evidence |
| HC-P2/P3 | pair-agent TDD route cannot start with implementation, cannot proceed without Red/oracle evidence plus a Red test command with non-zero exit, cannot let the light agent close, cannot treat mixed consultation plus implementation evidence as pass, cannot accept smart review output without an explicit verdict, cannot continue a pending verdict without a continuation directive, cannot treat review findings alone as fix instructions, cannot accept pass without Green/review evidence, cannot drop smart review fix instructions between cycles, cannot lose requested run evidence, cannot accept saved evidence whose `phase_spans` violate the smart_test_author -> light_implementation -> smart_review order, cannot ignore task difficulty when deriving the fix-cycle budget, cannot hide max-fix-cycle exhaustion, and cannot execute the smart T0 review agent without explicit approval |
| HC-P3 | projection-only telemetry cannot close `works` / `fired` / `used` claims |
| HC-P4 | destructive repair without approval returns `human_required` |
| HC-P6 | GitHub rules/apply plan and identifier rename cutover packet are emit-only unless approval evidence is action-bound; `rename plan` never applies |
| HC-P7 | per-agent memory silo is not accepted as shared SSoT |
| HC-P8 | untrusted external text is never copied into executable instruction fields |
| HC-P9 | stale projection or missing layer gate keeps `ConvergenceStatus` non-green |
| HC-AC | Codex hosted/API surface cannot be classified as hook-covered without preflight evidence |
| G-SF | semantic frontier records with `frontier_pending_decision`, `parked_future_version`, or `approval_gated_cutover` cannot allow whole-program completion; `outstanding.semanticFeatureFrontierRecords[]` must expose the same classification vocabulary in status/handover JSON; live records for `design_bottomup_mode`, `asset_progress_visualization`, `serverless_readonly_share`, and `name_cutover` must match the L3 §0.2 meaning-based feature list and cite that L3 source in `sourcePaths[]`; terminal decision records cannot close without current source ledger freshness, source status delta, adoption decision delta, and workflow route impact |

## §3 verification strategy

Unit tests prove function-level DbC. Runtime behavior claims still require L7.5 RUN & Debug evidence:

- `HU-PILLAR-P2-*`, `HU-PILLAR-P6-*`, `HU-PILLAR-P7-*`, `HU-PILLAR-P8-*`, `HU-PILLAR-P9-*`, and `HU-PILLAR-NAC-*`
  must attach runtime/projection/review evidence refs according to the function output.
- `works` / `used` / `fired` acceptance requires real `session_id`, `source`, runtime surface, timestamp,
  correlation id, and evidence path.
- projection-only rows remain trace-support evidence and cannot close runtime acceptance by themselves.
