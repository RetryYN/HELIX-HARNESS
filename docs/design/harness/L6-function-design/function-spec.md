---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
next_pair_freeze: L7
plan: docs/plans/PLAN-L6-01-function-spec.md
v2_import: docs/migration/v2-import-ledger.md
---

## 2026-06-09 FR unit coverage 追補

- L6 を close する前に、L1 FR registry は `fr-registry-audit` で parse され、登録済み FR はすべて `fr-unit-coverage.md` に表現されていなければならない。
- `fr-unit-coverage.md` は各 FR-L1 row を、1 つの L6 spec path、1 つの deterministic unit contract、1 つの U-* oracle に対応付ける。
- `src/lint/l6-fr-coverage.ts` はこの rule の機械 guard であり、`helix doctor` に配線されている。
- `fr-unit-coverage.md` に列挙された contract は unit-test 粒度の仕様である。L7 は direct unit test として実装するか、confirmed follow-up PLAN へ route してよいが、implementation 時点で欠けた FR coverage を作り出してはならない。

## 2026-06-09 Harness DB feedback function 追補

この追補は requirements §6.8.6 / §6.8.7 と L5 `physical-data.md` §9 / `internal-processing.md` Appendix B を、L6 function-level contract へ落とす。SQLite DB は docs/state/logs から再構築できる projection であり、authoring source ではない。

| 関数 | signature | 事前条件 | 事後条件 / oracle |
|---|---|---|---|
| `recordProjectionEvent` | `(event: ProjectionEvent, deps: HarnessDbDeps) => ProjectionRowRef` | `event.plan_id` または `event.session_id` があり、`deps.dbPath` は `.helix/` 配下に解決される | ID を検証し、正しい projection table row を upsert して `{table, id, evidence_path}` を返す。source docs は書き換えない |
| `rebuildHarnessDb` | `(input: RebuildInput, deps: HarnessDbDeps) => RebuildResult` | repo root が読め、DB path は `.helix/` 配下である | projection table を truncate し、正規化済み docs/state/log digest を replay して `search_index` と `quality_signals` を再計算する。同一入力では決定論的 |
| `computeSkillMetrics` | `(rows: SkillMetricInput) => QualitySignal[]` | recommendation/invocation row が与えられ、分母 0 は明示されている | layer/drive/plan/model ごとに `fired/recommended` と `accepted/fired` を計算する。欠落 row は findings であり、成功を捏造しない |
| `findReference` | `(query: ReferenceQuery, deps: HarnessDbDeps) => ReferenceHit[]` | DB が存在する、または caller が先に rebuild を要求している | `search_index` と direct ID table を検索し、path、ID、reason、source table、evidence path を返す。read-only |
| `emitFeedbackEvents` | `(findings: FindingRow[], signals: QualitySignal[]) => FeedbackEvent[]` | findings/signals は正規化済み | 反復 gap、未解決 blocker、dependency stall、quality regression pattern を feedback event にまとめる。PLAN 変更は自動承認しない |
| `recordGuardrailDecision` | `(decision: GuardrailDecision, deps: HarnessDbDeps) => ProjectionRowRef` | guardrail 名、decision、evidence path が存在する | block/allow/human-required を evidence 付きで保存する。projection rebuild で `human-required` を downgrade できない |
| `catalogAutomationAssets` | `(input: CatalogAutomationAssetsInput) => AssetCatalogResult`（`input = { repoRoot?: string; db: HarnessDb }`、型は `src/assets/catalog.ts` 正本、PLAN-L7-52 C-4 で実装に整合化 2026-06-15） | 承認 root は実装内定数 `SOURCES`（`docs/skills` / `.claude/agents` / `docs/commands`）を単一正本とする（caller は roots を渡さない） | skill/roster/command doc を path・trigger/capability・search token・drift status で catalog 化し `{ ok, assets: string[], findings }` を返す; prompt 本文・secret・provider transcript は copy しない; drift / empty-catalog / invalid-root は `findings` として可視化 |
| `recordTestRunEvidence` | `(input: TestRunEvidenceInput, deps: HarnessDbDeps) => ProjectionRowRef[]` | command evidence は runner/scope/timestamps/exit code/evidence path を持ち、repo root と DB path は `.helix/` 配下に解決される | `test_runs`、任意の `test_cases` / `test_results` / `test_artifact_edges` を upsert する。`plan_id` / `oracle_id` 欠落は findings であり silent pass にしない |
| `projectRuntimeTestRunFromSessionEvent` | historical marker（現行実装は `projectReviewEvidenceRegistry` / `projectRuntimeVerificationEvents`） | session JSONL は hook event / skill injection / runtime verification provenance の source であり、test run 正本は PLAN `green_commands[]` と reporter/runtime-verification evidence である | 旧 `runtime=hook-session-log` の Bash `tool_use` だけで `test_runs` を作る契約は現行実装では採用しない。`test_runs` は `projectReviewEvidenceRegistry` と structured reporter evidence から deterministic に投影し、runtime behavior claim は `.helix/evidence/run-debug/runtime-verification.jsonl` から `runtime_verification_events` へ分離する。非検証 Bash event を test pass として扱わない |
| `projectRuntimeVerificationEvents` | `(repoRoot: string, db: HarnessDb) => void` | `.helix/evidence/run-debug/runtime-verification.jsonl` は任意の append-only JSONL であり、外部入力として malformed row があり得る | valid row を `verification_class` と `accept_status` 付きで `runtime_verification_events` へ upsert する。malformed/incomplete row は `findings` であり accepted runtime evidence にしない |
| `buildVisualizationSnapshot` | `(db: HarnessDb) => VisualizationSnapshot` | migrated harness.db が利用可能で、caller は read-only の CLI / VSCode View / Webview adapter のいずれかでよい | 既存 projection table から決定論的な `visualization-snapshot.v1` 初回応答を返す。artifact progress color、plan/gate status、relation graph counts/latest hash、test runs、runtime verification classes、skill/model/guardrail metrics、drill-down command/table pointer を含む。cold-start は warning 付き 0 値で、accepted runtime verification は `verification_class='runtime_verified' AND accept_status='accepted'` のみ |
| `loadRelationGraphSourceSet` | `(repoRoot: string) => RelationGraphSourceSet` | repo root 配下の docs/src/tests/config が読める。個別 root 不在や optional file 不在は fail-open とする | 既存 design/test/source/PLAN node に加え、`docs/adr/**/*.md`、`docs/governance/document-system-map.md`、`docs/skills/**/*.md`、`.codex/hooks.json` を design node として materialize する。`isGraphTrackedPath` も同じ path class を graph 対象にし、対象 path の node 欠落は `missing-projection`、対象外 path は `non-graph-path` として区別する |
| `analyzeRightArmVerificationStrategy` | `(input: RightArmVerificationStrategyInput) => RightArmVerificationStrategyResult` | gates.md と L08-L14 verification strategy が現行 process source として与えられている | G8-G14 verification が concept-only のまま、evidence-profile row 欠落、verification source ledger の必須 official source row/column/HTTPS URL/adoption decision 欠落、または `gate impact` が既知の G8-G14/S3/S4/action-binding route に写像できない場合は fail-close する。NIST/Scrum/ISTQB/OWASP/NASA、W3C WCAG 2.2、Playwright browser/a11y source を必須集合に含め、screenshot-only や automated-a11y-only で G10/G11 claim を通さない |
| `loadOutstandingPlanRows` / `computeOutstandingWork` | `(repoRoot: string) => OutstandingPlanRow[]` / `(repoRoot: string) => OutstandingWork` | repo root は `docs/plans` を持つ source repo、または `.helix/state/project-setup.json` を持つ bootstrapped consumer repo でよい。positive state が無い場合に限り optional source 欠落は fail-open | `docs/plans` の非 terminal PLAN row と HELIX project setup state を読む。`objectiveBoundary.scope=consumer_setup_readiness_not_whole_program_completion` かつ `completionClaimAllowed=false` の場合は `CONSUMER-SETUP-BOUNDARY` を合成し、実 PLAN/handover route と first-run evidence まで whole-program completion を許可しない |
| `completionDecisionPacketForOutstanding` | `(outstanding: OutstandingWork, opts: CompletionDecisionPacketOptions) => CompletionDecisionPacket` | `outstanding.completionReadiness` は現行 non-terminal PLAN row / open defer から計算済みで、`opts.generatedAt` と `opts.sourceCommand` が packet 生成 event を識別する | `completionReadiness` 由来の decision packet を返し、`ok/status`、blocker list、authority boundary、decision count、PLAN 別 decision item、allowed outcome、next workflow route、source command、freshness metadata を保持する。JSON は machine ID と日本語表示を併存し、S4 / version-up / action-binding の scoped packet command、required records、allowed outcomes、record templates を落とさない。human/PO/action-binding/version-up/cutover blocker は human decision required として分類し、doctor green を readiness の代替にしない |
| `completionReviewBundleForOutstanding` / `analyzeCompletionReviewBundle` | `(outstanding: OutstandingWork, opts?: CompletionDecisionPacketOptions) => CompletionReviewBundle` / `(bundle, decisionPacket, now?) => CompletionReviewBundleLintResult` | completion decision packet と supporting packet summary が現在状態から生成済み | L14 完了主張前に確認する非破壊の `completion-review-bundle.v1` を返す。bundle は `sourceCommand=helix completion review-bundle --json` と `runnableSourceCommand=bun run helix completion review-bundle --json`、固定 safety flag (`planOnly=true` / `mustNotDecide=true` / `mustNotApply=true`)、completion decision packet command と runnable command、exact / semantic digest、review packet count、blockedUntil、日本語 operator action、S4 / version-up / rename / action-binding supporting packet ごとの scoped review packet 行を持つ。さらに `reviewCoveredBlockers` と `nonPacketBlockers` を分け、review packet で確認できる human decision blocker と、packet だけでは閉じない workflow state / semantic frontier blocker を混同させない。`completion review-bundle` text は `review-coverage:` を出し、`status` / `handover status` text も `completion-review-coverage:` を出す。`review-packet:` 行は日本語 `route=` と machine `route-id=` を分離し、JSON の `reviewRouteJa` / `reviewRoute` と同じ二重表現を保つ。`analyzeCompletionReviewBundle` は freshness stale、自己 source runnable command の欠落・drift、safety flag drift、completion state drift、review coverage drift、review packet count drift、review packet drift、digest drift を fail-close し、bundle を生成した repo-local 再生成 command なしに human review bundle を転記できないようにする。 |
| handover status live outstanding overlay | `helix handover status [--json]` | CURRENT.json は current PLAN/frontier state より古い場合があり、新しい additive outstanding field を欠く場合がある | read-only status output は保存済み pointer snapshot を盲信せず、応答時に `computeOutstandingWork(repoRoot)` と `completionDecisionPacketForOutstanding(liveOutstanding, sourceCommand=helix handover)` を再計算する。保存済み CURRENT.json は active/latest/stale field の session pointer SSoT のままだが、status output の `outstanding`、`semanticFeatureFrontierRecords`、`confirmedCurrentMeaningRecords`、`completionDecisionPacket` は live とし、古い handover 後も G-SF 分類や confirmed-current 11 意味単位を落とさない |
| `workflowNextActionForOutstanding` / `workflowNextActionsForOutstanding` | `(outstanding: OutstandingWork) => string` / `(outstanding: OutstandingWork) => WorkflowNextActionItem[]` | `outstanding.completionReadiness` は現行状態である | `helix status` 向けに machine-switchable な workflow guidance token を返す。未処理が無い場合だけ `completion-ready:`、それ以外は最優先 required action 付きの `completion-blocked:` を返す。さらに full ordered blocker queue、machine action、Japanese display、required evidence、scoped packet commands、supporting packet summaries を返し、secondary version-up / cutover / action-binding decision や packet matrix/review contract を command string の背後に隠さない |
| `analyzeCompletionDecisionPacket` | `(packet: CompletionDecisionPacket, now?: string) => CompletionDecisionPacketLintResult` | packet は status output、standalone command output、または stale external prose からコピーされた可能性がある | `generatedFrom`、`ok/status`、allowed CLI source、freshness policy、authority boundary、decision count、semantic summary、source path、scoped command、Japanese PO display mapping、required records、source ledger check、allowed outcomes、return routes、record templates が blocker set と整合する packet だけを受理する。stale、unknown-source、malformed、hidden human authority boundary、semantic drift、missing command/record/outcome/route/template、source-ledger drift、Japanese display drift、shape drift は fail-close doctor violation とする |
| `checkCompletionDecisionPacket` / `completionDedicatedPacketBridgeViolations` | `(repoRoot: string) => { messages: string[]; ok: boolean }` / `(repoRoot, packet) => string[]` | repo root が読め、completion packet lint が live dedicated packet surface へ route すべき command を持つ packet を生成済み | `analyzeCompletionDecisionPacket` を packet-local lint として保ち、doctor 側で repo-aware bridge を行う。各 completion decision の `packetCommands[]` について live S4 / version-up / rename / action-binding packet を構築して dedicated verification command validator を走らせる。missing live packet、mis-scoped command、matrix command drift、runbook command drift、validator failure は `completion-decision-packet` hard-gate violation となり、supporting summary の宣言だけで drifted/absent implementation を隠せない |
| `analyzeObjectiveEvidenceAudit` / `objectiveProgressForAudit` / `helix audit objective-external --json` | `(input: ObjectiveEvidenceAuditInput) => ObjectiveEvidenceAuditResult` / `(input, provedRows?) => ObjectiveProgress` / CLI JSON `{ ok, externalObserved, externalCheck, audit }` | active objective audit table と現行 `outstanding.completionReadiness` が読める。`objective-external` は、ユーザー指定の外部参考元 2 repo に対して `git ls-remote` を呼んでよい | G-01..G-09 の evidence row が `proved` のまま残ること、G-10 が現在の completion readiness に追従すること、completion artifact が実在することを検査する。さらに objective audit は、外部参考元としての現行開発レポ `RetryYN/HELIX-HARNESS` と配布レポ（外部 source ledger の `distribution_repo`）の HEAD/tag marker、外部 source ledger の `checked` freshness、`git ls-remote` command、ref、observed HEAD/tag、latestOfficialStatus、sourceStatusDelta、adoptionDecision、workflowRouteImpact、`package.json` version と local distribution tag、現行配布 target tag、配布 tag 採用前の version-up activation requirement、常設日本語/adapter ルール (`CLAUDE.md` / `AGENTS.md` / design-language gate)、HELIX setup 実体、version-up readiness、PLAN-M-02 rename/cutover readiness の証跡 citation が落ちた場合に fail-close する。通常 doctor は network を呼ばず ledger 構造を検査し、`externalObserved` が渡された専用検証では実測 HEAD と 配布 repo の semver 最大 tag が ledger observed と drift した場合も fail-close する。CLI `objective-external` はその専用検証を実行可能 surface として公開し、`externalObserved.development_repo` / `externalObserved.distribution_repo` / `externalObserved.distribution_latest_tag` に `git ls-remote` の実測値を直接返してから同じ audit に渡す。観測処理そのものの成否と message は `externalCheck` に分離し、`externalObserved.externalObserved` の二重ネストは evidence consumer が実測値階層を取り違えるため fail-close 対象とする。`distribution_repo` の observed HEAD は配布 tag 採用ではなく source ledger の現在値であり、drift 時は objective audit と consumer readiness の配布 reference を同じ観測値へ更新する一方、配布 target tag / local distribution tag / package version の採用判断は version-up activation requirement のまま保持する。`objective-evidence-audit.v1` は percent、provedRequirements、totalRequirements、blockedRequirements、completionStatus、completionClaimAllowed、auditOk、auditViolationCount、progressEvidenceTrusted、evidenceTrustReason を返す。percent は evidence-row progress indicator であり completion claim ではない。audit が invalid の場合は percent を診断用として残すが `progressEvidenceTrusted=false`、`completionClaimAllowed=false` とし、status text は `objective-progress-evidence: invalid` を出して数値だけを完了証跡に使わせない。G-10 blocked 中は effective proved count を G-01..G-09 に cap し、status surface は 90% と `completionClaimAllowed=false` を出し続け、`outstanding.completionReadiness.ok=true` かつ audit が trusted になるまで L14 / whole-program completion を許可しない。 |

2026-07-05 source 再確認: 現行配布 repo `distribution_repo` は到達するが main/tag は `unpublished`。これは配布 publish 未実施を示す source ledger であり、local distribution tag `v0.1.0` や package version `0.1.0` の採用変更ではない。配布 tag の publish/adoption には、引き続き version-up activation decision が必要である。

2026-07-03 監査強化: `externalObserved` を `analyzeObjectiveEvidenceAudit` に渡す専用検証では、`development_repo`、`distribution_repo`、`distribution_latest_tag` の 3 source すべてを必須にする。通常 doctor は network を呼ばないが、networked source basis を使う経路では部分観測値を drift なしと扱わず、missing source として fail-close する。

| `analyzeSemanticFrontierConsistency` | `(input: SemanticFrontierConsistencyInput) => SemanticFrontierConsistencyResult` | L3 meaning-based feature list、L4-L6/L7-L12 frontier docs、現行 `outstanding.semanticFeatureFrontierRecords[]` が読める | L3 §0.2 meaning-based feature list が既知 frontier meaning unit を落とす、live status/handover outstanding record が `design_bottomup_mode` / `asset_progress_visualization` / `serverless_readonly_share` / `name_cutover` と不整合になる、live record が completion を許可する、または `sourcePaths[]` が L3 feature-list source を指さない場合は fail-close する。要求変更、parked version-up item、rename cutover を prose や doctor green や stale handover snapshot だけで完了扱いにさせない |
| `analyzeS4DecisionReadiness` / `buildS4DecisionPackets` | `(input: S4DecisionReadinessInput) => S4DecisionReadinessResult` / `S4DecisionPacket[]` | Discovery/Scrum mode docs、outstanding decision schema、現行 PLAN text、live `semanticFeatureFrontierRecords[]` が与えられる | S3 pending PoC PLAN が、現行 `S4 decision source ledger` の checked date を引用する `source_ledger_freshness` と、`allowed_outcome`、`decision_owner`、`decision_basis`、`verified_evidence`、`stakeholder_review_or_proxy`、`acceptance_gap`、`unresolved_risk`、`external_source_basis`、`route_impact`、`forward_route`、`reverse_fullback_required`、`promotion_strategy_or_rejection_pivot_rationale` を持つ構造化 `s4_decision_record` を欠く場合は fail-close する。source ledger を検査し、`classification=frontier_pending_decision`、`completionClaimAllowed=false`、L3 source path を持つ対応 `semantic_feature_frontier_record` を必須にして、meaning-based feature list から外れた verified increment の promote / reject / pivot を防ぐ。PoC が既に `workflow_phase=S4` かつ `decision_outcome` を持つ場合、`allowed_outcome` は pending packet template の enum list ではなく、`decision_outcome` と一致する単一 outcome でなければならない。packet output は plan-only とし、`generatedAt`、`sourceCommand`、`freshness`、`semanticFeatureFrontierRecord`、`relatedDecisionPackets[]` を保持する。各 related route は S4/action-binding 用の PLAN-scoped `scopedCommand` を持ち、別 PLAN の packet evidence を流用できない。`decisionVerificationCommandMatrix[]` は各 row に `sourceCheckedAt` / `latestOfficialStatus` / `sourceStatusDelta` / `adoptionDecision` / `adoptionDecisionDelta` / `workflowRouteImpact` を持たせ、Scrum Guide / requirements trace / test basis / SSDF の source を PO/S4 判断前 evidence に接続する。各 matrix command は `bun run src/cli.ts doctor`、targeted regression、static gates、full regression、status などの実行可能な承認済み verification surface に限定し、`run the PLAN-declared ...` のような自然文手順、prose-only command、未実装 command は `s4-decision-readiness` が fail-close する。matrix source metadata も stale/future/invalid `sourceCheckedAt` と placeholder source/adoption/route metadata を fail-close する。同じ S3 PLAN が action-binding / human approval も持つ場合、S4 packet は supporting route として PLAN-scoped `helix action-binding approval-packet --json --plan <PLAN_ID>` を保持する |
| `analyzeVersionUpReadiness` / `buildVersionUpActivationPackets` | `(input: VersionUpReadinessInput) => VersionUpReadinessResult` / `VersionUpActivationPacket[]` | L0/L3/L4 version-up semantics、mode catalog/doc、Discovery S4 adoption note、現行 PLAN text、live `semanticFeatureFrontierRecords[]` が与えられる | version-up parked PLAN が通常 draft work と区別できない、構造化 `activation_decision_record` / `parked_review_record` を欠く、または `classification=parked_future_version`、`completionClaimAllowed=false`、L3 source path を持つ対応 `semantic_feature_frontier_record` を欠く場合は fail-close する。activation record は `allowed_outcome`、`target_version_or_release_trigger`、`activation_snapshot_id`、`activation_route`、`review_by`、`approval_scope`、`dry_run_plan`、`rollback_plan` を必須にし、future-version work が activation 前に具体 release trigger、snapshot binding、Forward/add-feature route を持つようにする。外部 activation boundary では引き続き action-binding approval evidence を必須にする。pending parked record の `allowed_outcome` は候補集合のままでよいが、`activation_snapshot_id` が concrete `sha256:` approval snapshot になった後は候補 enum ではなく単一の selected activation outcome でなければならない。packet output は primary version-up と supporting action-binding approval route を `relatedDecisionPackets[]` に保持し、各 route に PLAN-scoped `scopedCommand` を付けて version-up / action-binding packet material の別 PLAN 流用を防ぐ。`semanticFeatureFrontierRecord` と packet-level `generatedAt` / `sourceCommand` / `freshness` は `sourceLedgerFreshness` と分離して保持する。`activationSnapshot.headBound` / `materialBound` / `validationStatus` / `planTextDigest` を公開し、null-HEAD snapshot や同一 HEAD で PLAN material だけが変わった状態を approval-bound current snapshot と誤認させない。`activationReadinessChecks[]` と `activationReadinessSummary` は `present` / `pending_evidence` を示すだけで、`activationAllowed=false` を勝手に反転させない。`sourceLedgerFreshness.rowsDigest` と `activationSnapshot.sourceLedgerRowsDigest` は SLSA Provenance v1.2 の artifact provenance row を含む Version-up source ledger 全 row content を bind し、checked-date だけでなく official URL/status/adoption/field-impact edit でも snapshot を無効化する。text output は scoped related packet、snapshot `sourceLedgerRowsDigest` / `approvalScopeDigest` / `evidenceDigest`、matrix `writePolicy` / `command` を出し、JSON-only safety field の review 漏れを防ぐ。`activationVerificationCommandMatrix[]` は activation review 前に、実行可能/write-policy surface と stale/future/invalid `sourceCheckedAt`、placeholder source/adoption/route metadata を検査する |
| `analyzeCutoverReadiness` / `buildIdentifierRenameCutoverPlan` | `(input: CutoverReadinessInput) => CutoverReadinessResult` / `IdentifierRenameCutoverPlan` | right-arm verification doc、outstanding decision schema、cutover source ledger、PLAN-M-02、現行 PLAN text、live `semanticFeatureFrontierRecords[]` が与えられる | irreversible L14 cutover PLAN が、現行 `Cutover source ledger` の checked date を引用する `source_ledger_freshness` と、`allowed_outcome`、`decision_owner`、`cutover_snapshot_id`、`trigger_condition`、`blast_radius_baseline`、`dry_run_plan`、`rollback_plan`、`state_backup_plan`、`execution_window_or_freeze_policy`、`approval_scope`、`audit_record`、`post_cutover_monitoring`、`legacy_alias_policy` を持つ構造化 `cutover_decision_record` を欠く場合は fail-close する。cutover source ledger を検査し、L3 source path 付きの `semantic_feature_frontier_record featureId=name_cutover classification=approval_gated_cutover completionClaimAllowed=false` を必須にして、frozen execution window 外の再利用、変更済み `cutoverSnapshot.snapshotId`、provenance/rollback/monitoring evidence 欠落、stale packet material、更新済み ledger material、L3 name-cutover meaning boundary から外れた承認流用を防ぐ。Identifier rename cutover plan は plan-only / non-applying のままとし、packet-level `generatedAt` / `sourceCommand` / `freshness`、`semanticFeatureFrontierRecord`、primary singleton `helix rename plan --json` と PLAN-M-02 scoped supporting `helix action-binding approval-packet --json --plan PLAN-M-02-helix-identifier-rename` を含む `relatedDecisionPackets[]` を保持する。`verificationCommandMatrix[]` は baseline / targeted-regression / static-gates / state-and-doctor / full-regression / current-dist-smoke / renamed-helix-dist-smoke / post-cutover-consumer-setup-smoke / legacy-alias-smoke の各 row に `sourceCheckedAt` / `latestOfficialStatus` / `sourceStatusDelta` / `adoptionDecision` / `adoptionDecisionDelta` / `workflowRouteImpact` を持たせ、source 名や URL だけの approval review に戻さない。post-cutover-consumer-setup-smoke は承認後の `helix setup project --dry-run --json` が consumer readiness / artifactReadiness / importReport / PLAN-M-02 blocked boundary を出すことを、承認前は `rename dist-smoke --no-write --target helix --json` packet の `postCutoverConsumerSetupPreview` としてのみ扱う。matrix source metadata は stale/future/invalid `sourceCheckedAt` と placeholder source/adoption/route metadata を fail-close する。`sourceLedgerFreshness.rowsDigest` と `cutoverSnapshot.sourceLedgerRowsDigest` は Cutover source ledger 全 row content を bind し、date refresh、official URL/status/adoption/field-impact edit、source row change により `cutoverSnapshot.snapshotId` を変えて stale approval material を無効化する。`blastRadiusDigest` は本文 token だけでなく `.helix/**` などの path-only runtime state hit も束ね、内容に token がない state path 追加でも stale approval material を無効化する。`cutoverRunbook.evidencePath` と `stateBackupManifest.restoreEvidencePath` は `.helix/evidence/rename/` 配下の repo-local artifact path に限定し、URL・絶対 path・`..` traversal・自然文 prose を承認証跡として扱わない。text output は scoped related packet、`rowsDigest`、cutover snapshot `sourceLedgerRowsDigest` / `blastRadiusDigest` / `approvalScopeDigest` / `evidenceDigest`、matrix `writePolicy` / `command` を出し、JSON-only cutover safety field の review 漏れを防ぐ |
| `analyzeActionBindingApprovalReadiness` / `buildActionBindingApprovalPackets` | `(input: ActionBindingApprovalReadinessInput) => ActionBindingApprovalReadinessResult` / `ActionBindingApprovalPacket[]` | right-arm verification doc、outstanding decision schema、version-up mode doc、current repo HEAD sha、current cutover snapshot id、live `semanticFeatureFrontierRecords[]`、PLAN text が与えられる | high-impact non-terminal PLAN が approval / action-binding / human approval に触れているのに、`allowed_outcome`、`approval_policy_or_named_approver`、`approval_scope`、`approved_actor`、`approved_tool`、`approved_target`、`approved_params`、`review_approval_evidence`、`reviewed_snapshot_binding`、`expires_at_or_trigger`、`audit_record` を持つ `action_binding_approval_record` を欠く場合は fail-close する。right-arm design marker と outstanding requiredEvidence を検査し、approval boundary の prose-only 化、stale activation/cutover snapshot material の再利用、actor/tool/target/params の検査不能な prose scope への圧縮、兄弟 S4/version-up/rename blocker と semantic frontier record の分離を防ぐ。Version-up approval は current `repoHeadSha` から算出した current `activationSnapshot.snapshotId` を引用しなければならない。`repoHeadSha` が取れない場合は activation snapshot validation を pending とし、null-HEAD expected snapshot を合成してはいけない。Rename/cutover approval は current `cutoverSnapshot.snapshotId` を引用し、field-name-only、stale sha256、未検証 activation binding は pending/invalid のままにする。`review_approval_evidence` と `audit_record` は repo-local artifact path、digest / run id、または GitHub Actions run / PR / commit URL のような監査可能 locator に限定し、任意の外部 URL や自由文 claim を concrete approval evidence として扱わない。packet output は plan-only とし、packet-level `generatedAt` / `sourceCommand` / `freshness`、`approvalBindingChecks[]`、兄弟 blocker 用 `semanticFeatureFrontierRecords[]`、実行可能 allowlisted command のみを持つ `approvalVerificationCommandMatrix[]`、`sourceCheckedAt` / `latestOfficialStatus` / `sourceStatusDelta` / `adoptionDecision` / `adoptionDecisionDelta` / `workflowRouteImpact`、兄弟 S4/version-up/rename/cutover packet へ戻る `relatedDecisionPackets[]` を保持する。related packet は `scopedCommand` を持ち、primary action-binding と S4/version-up sibling は `--plan <PLAN_ID>` 付きの PLAN-scoped、rename は singleton のままとする。自然文 `review ...` / `verify ...` command は approval evidence ではなく fail-close violation とする。shared matrix metadata validation は stale/future/invalid `sourceCheckedAt` と placeholder source/adoption/route metadata を拒否し、approval review が古い official-source 前提に依存しないようにする |
| `missingRecordFields` | `(text: string, recordName: string, fields: readonly string[]) => string[]` | Markdown PLAN text と decision record schema が与えられる | PLAN に `recordName:` block と各 required `- field: value` 行が無い場合、missing record name / field id を返す。prose-only marker mention、empty value、`TBD`、`TODO`、`-` は record を満たさない |
| `auditGreenCommandDigests` | `(plans: ParsedReviewPlan[], deps: DigestAuditDeps) => DigestMismatch[]` | parsed review plans と注入済み evidence file reader/hash function が与えられる。空の `evidence_path` や `output_digest` は digest claim なしとして skip する | claimed `output_digest` が `sha256(evidence_path bytes)` と一致しない、または evidence file が欠落する green command ごとに deterministic mismatch を返す。比較は case-insensitive、出力は plan id と evidence path で sort する |
| `checkGreenCommandDigests` | `(repoRoot?: string) => { ok; messages; mismatches }` | repo root が読め、PLAN review evidence を load できる | repo root 読み取り不可、PLAN loading 例外、evidence file 欠落、stale/fake digest があれば fail-close する。空でない green command digest claim がすべて evidence file と一致する場合だけ `ok=true` とし、doctor はこの `ok` を advisory と扱わない |
| `greenCommandMatchesKind` | `(kind: string, command: string) => boolean` | `green_commands[]` の `kind` と raw command text が渡される。Windows path separator は `/` へ正規化する | `unit_test` は test/vitest、`integration_test` は test/vitest/playwright/testcontainers/integration、`typecheck` は typecheck/tsc、`lint` は lint/biome/eslint/plan lint、`doctor` は doctor、`vmodel_lint` は vmodel lint、`smoke` は非空 command を要求する。`frontmatterSchema` と `analyzeReviewEvidence` が同じ判定を使い、green evidence の kind/command 意味不一致を `command_kind_mismatch` として fail-close する。`output_digest` は同じ schema/lint 経路で `sha256:<64 hex>` のみ許可する |
| `projectRuntimeGuardrailDecisionFromSessionEvent` | `(input: RuntimeGuardrailDecisionProjectionInput) => void` | session event は `.helix/logs/session/*.jsonl` 由来で、`session_id`、`plan_id`、`ts` が存在する | `forced_stop` event では、非空 `session_id`、`guardrail=forced-stop`、`decision=block`、`mode=runtime-hook`、session JSONL evidence path を持つ `guardrail_decisions` row を upsert する。非 guardrail event は無視する |
| `projectRuntimeSkillInvocationFromSessionEvent` | historical marker（現行実装は `projectHookEvents` 内の `skill_injection` 投影） | session event は `.helix/logs/session/*.jsonl` 由来で、`event_type=skill_injection`、`session_id`、`plan_id`、`ts` が存在する。`recordSkillInjectionAttempt` が adapter 起動前の injection 結果を durable log へ残す | 旧 `Bash (skill)` / `source=runtime-hook:skill-suggest` の Bash `tool_use` 契約は現行実装では採用しない。現行は `skill:runtime-context-injection` を `source=session-log:skill-injection` として `skill_invocations` へ upsert し、`outcome=error` のみ `accepted=0`、それ以外を `accepted=1` とする。skill 本文や provider prompt は投影しない |
| `recordSkillInjectionAttempt` | `(input: SkillInjectionAttemptInput, deps: SessionLogDeps) => void` | adapter 起動前の skill context injection 解決結果があり、session id / plan id は既知または active plan から補完できる | `skill_injection` event を fail-open で session JSONL へ記録する。outcome は `injected` / `no_match` / `missing` / `failed` を区別し、`failed` だけ hook outcome `error` として digest failures に残る。target は件数と reason のみを sanitize して保持し、skill 本文・provider prompt・secret-like 値は durable log に残さない |
| `projectDriveRuns` / `route_modes` 投影 | `(repoRoot: string, db: HarnessDb, plans: Map<string, ProjectedPlan>) => void` | PLAN frontmatter、workflow mode ledger、必要に応じて session digest が読める | 既存 `drive_runs` row を維持しつつ、同じ drive run id / plan id / mode を `route_modes` へ first-class read model として upsert する。`source` は `plan-frontmatter` / `session-digest` / `workflow-mode-ledger` / `canonical-process-mode` を区別し、mode 別検索は `idx_route_modes_plan_mode` で plan + mode + drive_run_id に接続する。 |
| `normalizeProviderEffort` | `(provider: AdapterProvider, effort?: string) => string \| undefined` | provider は `claude` / `codex` の adapter provider、effort は user/team/model policy 由来の任意文字列である | `middle` を `medium`、`xhigh` を `high` に正規化し、空白・大文字小文字を吸収する。`buildAdapterPlan` は `--effort` argv と `CLAUDE_CODE_EFFORT_LEVEL` env をこの正規化後の値から作る。未知値は trim/lowercase したまま返し、schema 側の model override hardening と責務を重複しない |
| `analyzeToolchainPin` / `checkToolchainPin` | `(input: ToolchainPinInput) => ToolchainPinResult` / `(repoRoot: string) => { messages: string[]; ok: boolean }` | `package.json`、`bun.lock` / `bun.lockb`、source workflow と consumer workflow template が読める | `package.json.engines.bun` が concrete semver range を持つこと、source package の lockfile が存在すること、GitHub Actions / template の `bun install` が `bun install --frozen-lockfile` であること、source `harness-check.yml` の `setup-bun` `bun-version` が Bun engine floor と矛盾しないことを fail-close する。consumer template は既存 setup 契約に合わせ、`setup-bun` の `with:` 不在自体を違反にしない。doctor は `toolchain-pin` を hard gate として実行し、`lint-wiring` はこの lint が runtime entrypoint から到達可能であることを検査する |
| `projectRuntimeModelTelemetryForDoctor` | `(db: HarnessDb) => void` | doctor は in-memory harness DB を rebuild 済みで、runtime transcript directory は `HELIX_CLAUDE_SESSIONS_DIR` / `HELIX_CODEX_SESSIONS_DIR` または OS default から読む | provider を起動せず既存 Claude/Codex JSONL log を scan し、telemetry provenance evaluation 用の token/cost-backed `model_runs` row を overlay する。deterministic `db rebuild` は source-only のまま |
| `classifyRuntimeVerificationEvidence` | `(input: RuntimeEvidenceClaim) => RuntimeVerificationClass` | runtime behavior claim (`fired` / `used` / `works` / `blocked` / `recovered` / `observed` / `executed`) が source metadata 付きで与えられる | 非空 `session_id`、runtime `source`、runtime surface、timestamp、evidence path がある場合だけ `runtime_verified` を返す。projection-only row は `projection_only_unverified`、provenance 欠落は `missing_runtime_provenance` になる |
| `buildRunDebugObligation` | `(input: CapabilityVerificationInput) => RunDebugObligation` | capability claim と runtime-behavior classification が与えられる | runtime behavior claim は L7.5 RUN & Debug を要求する。pure/unit-only helper は明示 reason と substitute oracle がある場合だけ `not_required` にでき、未解決は `blocked` |
| `rejectProjectionOnlyVerification` | `(classification: RuntimeVerificationClass) => VerificationGateDecision` | evidence classification が与えられる | `projection_only_unverified` と `missing_runtime_provenance` は runtime acceptance を close できない。`runtime_verified` と `not_runtime_claim` はこの gate を pass できる |
| `buildRuntimeVerificationLogEvent` | `(input: RuntimeVerificationLogInput) => RuntimeVerificationLogEvent` | plan id、claim、session id、runtime source/surface、correlation id、evidence path、timestamp、redaction policy が存在する | stable event id を持つ append-only log event を返す。secret-like value は log せず reject する |
| `validateRuntimeVerificationLogCompleteness` | `(event: RuntimeVerificationLogEvent) => RuntimeLogCompleteness` | event は build 済み、または runtime evidence から読込済み | empty session id、missing correlation/evidence、invalid timestamp、requirement/test oracle link 欠落を持つ `works` / `used` / `fired` / `executed` event を reject する |
| `appendRuntimeVerificationLogEvent` | `(input: RuntimeVerificationLogInput, deps: RuntimeVerificationLogDeps, relPath?: string) => RuntimeVerificationLogWrite` | event は valid/complete で、deps は `.helix/evidence/run-debug/` 配下の append-only JSONL evidence path に書く | completeness pass 後に JSONL row を 1 件だけ append する。projection source、invalid runtime surface、secret-like value、runtime closure 用 requirement/oracle 欠落は write 前に fail する |
| `evaluateGreenDefinition` | `(input: GreenDefinitionInput, deps: HarnessDbDeps) => GreenDefinitionResult` | changed artifact kind 向けの profile と required command kind が既知である | computed green time、missing commands、non-zero exits、DB projection refs を返す。confirmed review evidence は result が green かつ `computed_green_at <= reviewed_at` の場合だけ有効 |
| `computeUtHistorySignals` | `(input: UtHistoryInput, deps: HarnessDbDeps) => QualitySignal[]` | test run/result row は正規化済みで、分母 0 は明示されている | oracle coverage、plan green rate、green-definition compliance、oracle-level flake score、duration regression を計算する。non-green signal は `findings` に join する |
| `projectUtHistorySignals` | `(input: UtHistoryInput, deps: HarnessDbDeps) => ProjectionRowRef[]` | `computeUtHistorySignals` の入力が正規化済みで、DB は `.helix/` 配下または test 用 `:memory:` で開かれている | aggregate unit-test history signal を `quality_signals` へ、pass/fail が揺れる oracle を `test_flake_events` へ、原因 oracle の flake / duration regression を `quality_signals(source=ut-history)` へ冪等 upsert する。加えて oracle/run 時点ごとの duration を `quality_signals(metric=duration_trend_ms)` として保存し、`value=duration_ms`、`threshold=prior median`、`computed_at=run completed_at` で trend を再構成可能にする |
| `parseGreenCommandEvidence` | `(path: string, content: string) => ParsedGreenCommandEvidence | null` | `review_evidence.green_commands[].evidence_path` で repo 内の JSON/XML evidence が安全に解決済みで、content は caller が読み込んでいる | structured `cases[]` JSON、Vitest/Jest-compatible JSON reporter、Playwright JSON reporter、JUnit XML を `TestCaseEvidence[]` に正規化する。DTD/ENTITY を含む XML、未知 format、空 cases は投影しない。DB schema、reporter 実行、HTML/trace/coverage/attachment 解析は扱わない |
| `projectUtHistorySignalsFromProjectedRuns` | `(db: HarnessDb) => void` | `test_runs` / parsed `test_results` / `test_cases` が deterministic rebuild 中に投影済みで、feedback projection より前に呼ばれる | DB から `TestRunEvidenceInput` を復元して `projectUtHistorySignals` を呼び、unit-test history `quality_signals` を `feedback_events` の入力にする。生 reporter の正規化は `parseGreenCommandEvidence` に分離する |
| `analyzeRefactorCandidates` | `(inputs: RefactorCandidateInput[]) => RefactorCandidate[]` (`candidateRank` で rank、input は `loadRefactorCandidateInputs(repoRoot)` 由来) | source module/function input は正規化済みで、structural threshold (module size、body length、duplicate-body hash、literal repeat count) は明示されている | behavior-invariant refactor candidate 4 種 (`split-module` / `extract-helper` / `deduplicate-function` / `externalize-literal`) を決定論的に検出し、`quality_signals` (`metric=refactor_candidate:<kind>`) と `feedback_events` surface に投影する。既存 table への additive projection であり、empty/zero input は fabricated candidate にしない |

Unit oracle families（単体 oracle 群）:

- U-FR-L1-06 / U-FR-L1-19 / U-FR-L1-20 / U-FR-L1-40 / U-FR-L1-41 は projection write/rebuild、drive partitioning、feedback event generation を対象にする。
- U-FR-L1-12 / U-FR-L1-46 / U-FR-L1-47 は skill recommendation、roster capability、skill metric input を対象にする。
- U-FR-L1-33 / U-FR-L1-34 / U-FR-L1-48 / U-FR-L1-49 は search/reference reduction、command cataloging、asset drift detection を対象にする。
- U-VISUAL-001 / U-VISUAL-002 は L1 §2.8 の deterministic visualization snapshot response と runtime evidence class separation を対象にする。
- U-OUTSTANDING-001..003 は whole-program completion claim 向けの completion decision packet construction、freshness/source/shape linting、doctor hard-gate wiring を対象にする。
- U-DECISIONREC-001..003 は structured S4 / version-up activation / irreversible cutover decision record を対象にする。marker-only prose は decision evidence として受理しない。
- U-DECISIONREC-001 は S3 verified evidence と S4 PO decision の意味境界も保つ。`decision_outcome` は `kind=poc + workflow_phase=S4` の場合だけ有効であり、draft S3 PoC の `decision_outcome` は decided PLAN ではなく違反である。
- U-GREENCMD-001..003 は fake/stale digest detection、unreadable repo fail-close、doctor hard-gate wiring という green command digest substance を対象にする。U-GREENDEF-005..006 は schema と review-evidence lint の双方で green command kind/command meaning consistency と 64-hex digest schema を対象にする。
- `analyzeRefactorCandidates` (refactor candidate detector) は同じ projection oracle family (U-FR-L1-06/19/20/40/41) 配下の additive `quality_signals` / `feedback_events` projection である。4 種 detection は `tests/projection-writer.test.ts` が覆う (L7 descent: `docs/test-design/harness/L7-unit-test-design.md`)。

### 2026-06-23 Feedback surface taxonomy 追補

`feedback_events` は findings、quality signals、artifact progress から派生する通知 queue である。
authoring source ではなく、queue row が best-effort の `plan_id` を持つだけで追加の
`unresolved-join` finding を作ってはならない。解決可能 PLAN join guard は source projection table に適用し、
notification queue 自体には適用しない。

人間向け feedback surface は、保存済み severity を変えずに open row を 3 つの表示 bucket へ分類する。

| bucket | rule | 表示挙動 |
|---|---|---|
| `gate` | severity が `error` または `fail` | acceptance を block し得るため、`signal_type` で group 化して最初に表示する。 |
| `actionable` | telemetry ではない `warn` row | `signal_type` ごとに count と代表 next action を表示する。 |
| `telemetry` | `info` row、および `artifact_progress_yellow` / `missing-test-oracle-id` / `skill_firing_rate` / `skill_acceptance_rate` などの high-volume measurement signal | takeover output では row ごとに列挙せず、signal count で要約する。 |

`selectTakeoverFeedback` と text `helix feedback list` output はこの taxonomy を使う。
個別 queue row が必要な consumer 向けには、`helix feedback list --json` が raw audit path として残る。

### 2026-06-23 Read-only quality / branch audit 追補

hardcode / security / debt 検出と大きな branch cleanup は、まず read-only audit として表示する。
source file、Git branch、remote、harness state は変更しない。

| 関数 | signature | 事前条件 | 事後条件 / oracle |
|---|---|---|---|
| `runQualityAudit` | `(repoRoot, opts) => QualityAuditResult` | repo root が読める。archive/migration/runtime-state path は既定で除外する | secret-like または危険な execution risk は `gate` findings、hardcoded path/endpoint/model/provider と legacy runtime reference は `actionable` findings、TODO/FIXME marker は `telemetry` findings として返す。text output は要約し、JSON は tooling に十分な raw 情報を保つ |
| `loadBranchAudit` | `(repoRoot, opts) => BranchAuditResult` | git local refs が読める | current/protected/gone/merged/stale evidence により local branch を `keep`、`delete-candidate`、`review` に分類する。branch の delete/rewrite は行わない |

## 2026-06-09 MCP profile config / safety 追補 (A-125 / PLAN-L6-32)

この追補は requirements §6.8.10 と A-125 research memo を、MCP profile catalog hardening のための L6 function contract へ落とす。これ自体は profile execution を承認しない。後続 L7 implementation が満たすべき pure check と generated-config rule を定義する。

| 関数 | signature | 事前条件 | 事後条件 | invariant | oracle |
|---|---|---|---|---|---|
| `catalogVerificationProfiles` | catalogVerificationProfiles(input: VerificationProfileCatalogInput) => VerificationProfileCatalogResult | built-in profile と調査済み external candidate が source URL、package reference、trigger signal、risk field、right-arm source-ledger binding 付きで与えられる | Docker MCP Toolkit、MCP Inspector、Playwright MCP、GitHub read-only MCP、Vitest browser、Testcontainers、MSW を含む deterministic profile row を返す。G8-G14 推奨 profile は Verification source ledger に紐づく `sourceLedgerSources` と `sourceLedgerCheckedAt` を持つ | external profile は既定 disabled の discovery/config metadata であり trusted execution ではない。right-arm profile recommendation は package 名だけに依存せず、各 gate を正当化する external source meaning を保持する | U-MCPPROFILE-001..003, U-MCPPROFILE-018 |
| `renderGeneratedMcpConfig` | renderGeneratedMcpConfig(input: GeneratedMcpConfigInput) => GeneratedMcpConfigResult | selected profile は allow-list 済み、workspace root は既知、secret value は env var 名だけで表現される | Git-tracked secret を書かずに generated local config text と target path suggestion を返す。各 `mcpServers.<id>` は tokenized launcher argv (`command` = command head, `args` = remaining tokens) を持ち、全 command string を単一 arg にしない (PLAN-L7-79) | filesystem/git profile は workspace-root scoped であり、user home mount と inline token は違反 | U-MCPPROFILE-004..006, U-MCPPROFILE-013 |
| `analyzeVerificationProfileSafety` | analyzeVerificationProfileSafety(input: VerificationProfileSafetyInput) => VerificationProfileSafetyResult | profile catalog、local package metadata、config text、任意の Docker profile metadata が与えられる | unverified source、package mismatch、missing allow-list、broad toolset、write-enabled GitHub profile、global mount、credential persistence、missing Docker controls の findings を返す | `trusted` 前に official source verification と package integrity が必須であり、registry/catalog 存在だけでは不十分 | U-MCPPROFILE-007..010 |
| `runVerificationProfile` / `PROFILE_RUNNERS` | runVerificationProfile(id: string, opts: VerificationRunOptions, deps: VerificationRunDeps) => VerificationRunResult \| null | selected profile id は既知で、default-enabled runner は network や external service activation なしで実行可能でなければならない | 既定では allow-listed built-in/local runner だけを実行する。`bun-unit` は local regression (`bun run test:local`) を呼び、dependency download/cache access があり得る clean distribution acceptance は含めない | default runnable profile evidence を full regression/release evidence と混同しない。`bun run test` は release/cutover/activation context 向けのより強い full-suite command として残す | U-MCPPROFILE-002, U-MCPPROFILE-012, U-MCPPROFILE-013 |
| `probeVerificationProfile` | probeVerificationProfile(id: string, deps: VerificationProbeDeps) => VerificationProbeResult \| null | profile id と command/probe dependency が与えられる | activation、executable/package/auth prerequisite、generated launcher command head が probe-hint executable と異なる場合の readiness check を返す | package/executable probe hint が利用可能でも、generated launcher command が利用不能なら profile は ready ではない | U-MCPPROFILE-014 |
| `planExternalProfileActivation` | planExternalProfileActivation(input: ExternalProfileActivationInput) => ExternalProfileActivationPlan | trigger signal、relation graph impact、profile readiness、safety findings が与えられる | 推奨 profile ごとに必要な probe、MCP Inspector smoke、human approval、refusal step を返す | external activation は workflow evidence であり、package install や MCP server enable を黙って実行しない | U-MCPPROFILE-011..012 |
| `analyzeRightArmVerificationProfileCoverage` | analyzeRightArmVerificationProfileCoverage(profiles: VerificationProfile[]) => VerificationProfileGateCoverageResult | verification profile は recommended gate、drive mapping、source-ledger binding 付きで与えられる | G8-G14 と drive-model mode ごとの coverage、および missing/stale/unknown source-ledger binding や recommended gate を覆わない gate impact source row の findings を返す | G8-G14 profile は binding date が現行 Verification source ledger と一致し、全 source row が既知で、source row `gate impact` の union が recommended gate を覆る場合だけ有効 | U-MCPPROFILE-015..018 |

Safety defaults（安全側の既定）:

- Docker MCP Toolkit は profile-isolation candidate であり、Docker Desktop/toolkit availability が証明されるまで optional のままにする。
- GitHub MCP は read-only かつ narrow toolset を既定とする。MCP の broad write-capable profile variant は通常の `gh` 委譲 GitHub 運用とは別物として扱い、branch protection / ruleset / release / tag publish / repository rename / force-push など高影響 action を含む場合だけ `requires_human_approval` を必須にする。通常の branch push、draft PR 作成、PR body 生成、CI 状態取得は `github-merge-readiness` / `pr-create` packet の repo write preflight が通れば AI agent の通常運用である。
- Generated MCP config は local/environment state であり、committed credential や user-specific absolute home path を導入しない。
- Default runnable verification profile は restricted network でも動く local regression を指し、clean artifact distribution acceptance や外部 registry/cache 前提の full suite を含めない。
- Tool/profile output は evidence/projection row へ正規化する。raw MCP response、screenshot、trace、provider transcript は DB row から除外する。

## 2026-06-09 Canonical document export 追補 (A-126 / PLAN-L6-34)

この追補は requirements §6.8.11 と A-126 research memo を、canonical HELIX document を spreadsheet / Excel / PPTX output に変換するための L6 function contract へ落とす。これ自体は Office-format 生成を承認しない。後続 L7 implementation が満たすべき pure document-structure rule と export-dataset rule を定義する。

| 関数 | signature | 事前条件 | 事後条件 | invariant | oracle |
|---|---|---|---|---|---|
| `parseCanonicalDocumentStructure` | parseCanonicalDocumentStructure(input: CanonicalDocumentInput) => CanonicalDocumentProjection | source docs は repo-relative path と text で与えられ、document family は concept / requirements / design / plan / adr / test-design のいずれか | section、heading、table、decision、trace ID、status field、evidence link、source anchor を返す | canonical Markdown/docs が source of truth であり、generated export は FR/AC/AT/PLAN/ADR ID を追加・削除できない | U-DOCEXPORT-001..003 |
| `buildDocumentExportDataset` | buildDocumentExportDataset(input: DocumentExportDatasetInput) => DocumentExportDataset | document projection、requested format、export profile が与えられる | source path、section ID、ID column、status、trace、evidence link を持つ deterministic rows/sheets/slide-outline record を返す | dataset は render 前に redaction 済みであり、大きな docs は truncation ではなく family/section で分割する | U-DOCEXPORT-004..006 |
| `renderDocumentExport` | renderDocumentExport(input: DocumentExportRenderInput, deps: DocumentExportRendererDeps) => DocumentExportRenderResult | dataset と renderer profile が与えられる。CSV/Markdown は built-in、XLSX/PPTX/D2 は readiness を要求する | generated artifact metadata、または renderer-unavailable finding を返す | renderer execution は optional であり、package を暗黙 install しない | U-DOCEXPORT-007..009 |
| `recordDocumentExportArtifact` | recordDocumentExportArtifact(input: DocumentExportArtifactInput) => DocumentExportProjectionRows | render result、source snapshot hash、redaction profile、evidence path が与えられる | `document_export_runs`、`document_export_datasets`、`document_export_artifacts` projection row を返す | generated file は derived artifact であり、gate truth は canonical docs、normalized rows、recorded human decisions に残る | U-DOCEXPORT-010..012 |

対応する document family:

- concept / planning documents は objective、value、scope、KPI、risks、decisions、roadmap に対応する。
- requirements は FR/AC/AT、priority、acceptance、trace、owner/status に対応する。
- detailed design は module/function/API/DB/contract rows、dependencies、unresolved carry に対応する。
- PLAN は frontmatter、dependencies、generated artifacts、DoD、evidence、blockers に対応する。
- ADR は decision、alternatives、consequences、follow-ups、status/date に対応する。
- test-design は U/IT/AT oracles、GWT rows、green definitions、missing coverage に対応する。

Export defaults（既定 export）:

- CSV と Markdown summary は built-in。
- XLSX は ExcelJS または SheetJS readiness がある場合だけ optional。
- PPTX は PptxGenJS readiness がある場合だけ optional。
- D2 PPTX は architecture / workflow diagram のみ optional。

### FR registry function contract table（関数契約表）

この table は、L6 spec が本 file である `fr-unit-coverage.md` row の function-spec 側 descent である。
FR matrix が prose-only coverage claim になることを防ぐ。各 row は意図的に unit-test size とし、
1 つ以上の named function、具体的な signature shape、DbC pre/post/invariant、exact U-FR oracle を持つ。

| FR | Function(s) | Signature | pre | post | invariant | oracle | <!-- 契約表 -->
|---|---|---|---|---|---|---|
| FR-L1-01 | `planDraft` | planDraft(input: PlanDraftInput, deps: PlanDraftDeps) => PlanDraftResult | 必須 ID/path は正規化済みで、required evidence が存在する。 | deterministic な U-FR-L1-01 result を返す。evidence 欠落は violation/finding とする。 | source docs は read-only。generated state/projection は rebuildable。secret や provider transcript は保存しない。 | U-FR-L1-01 |
| FR-L1-02 | `sprintCheck` | sprintCheck(input: SprintCheckInput, deps: SprintCheckDeps) => SprintCheckResult | 必須 ID/path は正規化済みで、required evidence が存在する。 | deterministic な U-FR-L1-02 result を返す。evidence 欠落は violation/finding とする。 | source docs は read-only。generated state/projection は rebuildable。secret や provider transcript は保存しない。 | U-FR-L1-02 |
| FR-L1-04 | `frontmatterSchema`, `parseRequires` | frontmatterSchema(input: FrontmatterSchemaInput, deps: FrontmatterSchemaDeps) => FrontmatterSchemaResult<br>parseRequires(input: ParseRequiresInput, deps: ParseRequiresDeps) => ParseRequiresResult | 必須 ID/path は正規化済みで、required evidence が存在する。 | deterministic な U-FR-L1-04 result を返す。evidence 欠落は violation/finding とする。 | source docs は read-only。generated state/projection は rebuildable。secret や provider transcript は保存しない。 | U-FR-L1-04 |
| FR-L1-06 | `recordProjectionEvent`, `rebuildHarnessDb` | recordProjectionEvent(input: RecordProjectionEventInput, deps: RecordProjectionEventDeps) => RecordProjectionEventResult<br>rebuildHarnessDb(input: RebuildHarnessDbInput, deps: RebuildHarnessDbDeps) => RebuildHarnessDbResult | event は `plan_id` または `session_id` を持ち、`deps.dbPath` は `.helix/` 配下で、source docs/logs は読める。 | projection row を deterministic に upsert/rebuild し、`search_index` と `quality_signals` を再計算する。 | DB は authoring source ではなく rebuildable projection。source docs は書き換えない。 | U-FR-L1-06 |
| FR-L1-08 | `routeSignalToMode` | routeSignalToMode(input: RouteSignalToModeInput, deps: RouteSignalToModeDeps) => RouteSignalToModeResult | signal type、evidence path、current plan/mode context が存在する。 | reason 付き candidate mode を返し、workflow state は mutate しない。 | unknown signal は finding または no-route result であり、silent success にしない。 | U-FR-L1-08 |
| FR-L1-09 | `evaluateAgentGuard` | evaluateAgentGuard(input: EvaluateAgentGuardInput, deps: EvaluateAgentGuardDeps) => EvaluateAgentGuardResult | subagent/model family と allow-raw context が与えられる。 | evidence 付き allow/block/bypass decision を返す。forbidden same-model や raw call は明示許可がない限り block する。 | credential や provider transcript は永続化しない。 | U-FR-L1-09 |
| FR-L1-11 | `recordCrossCuttingEvent` | recordCrossCuttingEvent(input: RecordCrossCuttingEventInput, deps: RecordCrossCuttingEventDeps) => RecordCrossCuttingEventResult | event は type、severity、subject、evidence path を持つ。 | interrupt/debt/drift/readiness event を記録するか validation violation を返す。 | recording は append/projection only であり、gate を approve できない。 | U-FR-L1-11 |
| FR-L1-12 | `suggestSkillInjection` | suggestSkillInjection(input: SuggestSkillInjectionInput, deps: SuggestSkillInjectionDeps) => SuggestSkillInjectionResult | task text、layer、kind/drive、catalog snapshot が与えられる。 | reason 付き deterministic ranked skill/command candidate を返す。 | catalog row 欠落は findings となる。recommendation は prompt body を copy しない。 | U-FR-L1-12 |
| FR-L1-13 | `enforceForwardOrder` | enforceForwardOrder(input: EnforceForwardOrderInput, deps: EnforceForwardOrderDeps) => EnforceForwardOrderResult | current layer/gate と prior gate status が既知である。 | Forward order と required gate が満たされた場合だけ pass を返す。 | exception には explicit evidence が必要で、blocked gate を silently skip できない。 | U-FR-L1-13 |
| FR-L1-14 | `routeReverseR4` | routeReverseR4(input: RouteReverseR4Input, deps: RouteReverseR4Deps) => RouteReverseR4Result | reverse type、R4 evidence、`forward_routing`、`promotion_strategy` が存在する。 | Forward target または blocking violation を返す。 | confirmed reverse evidence だけが Forward へ merge できる。 | U-FR-L1-14 |
| FR-L1-15 | `decideDiscoveryS4` | decideDiscoveryS4(input: DecideDiscoveryS4Input, deps: DecideDiscoveryS4Deps) => DecideDiscoveryS4Result | hypothesis、PoC verification evidence、outcome が存在する。 | confirmed/rejected/pivot decision と routing requirements を返す。 | rejected/pivot を confirmed として扱えない。 | U-FR-L1-15 |
| FR-L1-19 | `emitFeedbackEvents` | emitFeedbackEvents(input: EmitFeedbackEventsInput, deps: EmitFeedbackEventsDeps) => EmitFeedbackEventsResult | findings と quality signals は正規化済みである。 | repeated gap、unresolved blocker、dependency stall、regression を feedback event にする。 | feedback event は PLAN を edit/approve しない。 | U-FR-L1-19 |
| FR-L1-22 | `detectFrontendDrift` | detectFrontendDrift(input: DetectFrontendDriftInput, deps: DetectFrontendDriftDeps) => DetectFrontendDriftResult | mock/token/a11y/visual/state evidence root は与えられる、または明示的に absent である。 | evidence path 付き deterministic drift signal を返す。 | optional root 欠落は explicit であり、silent pass ではない。 | U-FR-L1-22 |
| FR-L1-23 | `routeScrumFullback` | routeScrumFullback(input: RouteScrumFullbackInput, deps: RouteScrumFullbackDeps) => RouteScrumFullbackResult | increment evidence と S4 decision が存在する。 | Forward target と required back-fill artifact を返す。 | confirmed increment だけが Forward に入れる。 | U-FR-L1-23 |
| FR-L1-25 | `assertRefactorInvariant` | assertRefactorInvariant(input: AssertRefactorInvariantInput, deps: AssertRefactorInvariantDeps) => AssertRefactorInvariantResult | before/after behavior evidence、regression result、linked regression `test_ids` が存在する。 | external behavior が不変、regression evidence が green、かつ 1 件以上の test ID が linked の場合だけ pass。 | refactor は新しい functional scope を導入できず、test-ID-linked green evidence なしに close できない。 | U-FR-L1-25 |
| FR-L1-26 | `evaluateRetrofitMatrix` | evaluateRetrofitMatrix(input: EvaluateRetrofitMatrixInput, deps: EvaluateRetrofitMatrixDeps) => EvaluateRetrofitMatrixResult | migration/config/rollback fixture が与えられる。 | readiness classification と blocking evidence を返す。 | staged migration は rollback evidence なしに ready になれない。 | U-FR-L1-26 |
| FR-L1-27 | `evaluateResearchDecision` | evaluateResearchDecision(input: EvaluateResearchDecisionInput, deps: EvaluateResearchDecisionDeps) => EvaluateResearchDecisionResult | research memo、source list、ADR candidate が与えられる。 | decision-ready または missing evidence 付き blocked を返す。 | research output は ADR や requirement trace を bypass できない。 | U-FR-L1-27 |
| FR-L1-28 | `mergeTwoStageAgentDesign` | mergeTwoStageAgentDesign(input: MergeTwoStageAgentDesignInput, deps: MergeTwoStageAgentDesignDeps) => MergeTwoStageAgentDesignResult | Phase 1/2 design artifact と drive=agent handoff evidence が存在する。 | merged design state または explicit gap list を返す。 | merged output は layer boundary を保持し、provider transcript を copy できない。 | U-FR-L1-28 |
| FR-L1-29 | `validateScreenDesignWorkflow` | validateScreenDesignWorkflow(input: ValidateScreenDesignWorkflowInput, deps: ValidateScreenDesignWorkflowDeps) => ValidateScreenDesignWorkflowResult | IA、screen list、flow、wireframe/mock、componentization output が与えられる。 | screen design artifact と pair trace が完全な場合だけ pass。 | backend-only evidence で UI workflow を complete にできない。 | U-FR-L1-29 |
| FR-L1-30 | `validateFrontendDesignWorkflow` | validateFrontendDesignWorkflow(input: ValidateFrontendDesignWorkflowInput, deps: ValidateFrontendDesignWorkflowDeps) => ValidateFrontendDesignWorkflowResult | visual design、token SSoT、a11y、VRT、UX evidence が与えられる。 | frontend polish gate 向けに pass または missing artifact list を返す。 | accessibility と token evidence は advisory text ではなく first-class evidence として残る。 | U-FR-L1-30 |
| FR-L1-08 / FR-L1-25 / FR-L1-29 / FR-L1-30 | `classifyDriveTddFits` | classifyDriveTddFits(input?: { modes?: string[] }, deps: ClassifyDriveTddFitsDeps) => ClassifyDriveTddFitsResult | drive/mode name は与えられる、または全件対象として省略される。 | drive model / design specialty ごとに TDD compatibility、Red trigger source、Yellow state、Green requirement を返す。 | classification は advisory/read-only であり、PLAN を complete にできない。 | U-FR-L1-08 / U-FR-L1-25 / U-FR-L1-29 / U-FR-L1-30 |
| FR-L1-39 / FR-L1-41 | `classifyProposalDocumentCoverage` | classifyProposalDocumentCoverage(input: ClassifyTaskInput, deps: ClassifyProposalDocumentCoverageDeps) => ProposalDocumentCoverage | proposal/task text、任意の affected files、任意の dependencies が与えられる。 | use-case pack ごとの最低限の required design docs、test-design docs、evidence、gates、research adoption decisions、rejected research inputs、recommended subagent lanes を返す。 | required docs は additive。LLM/minor wording は coverage を縮小できず、unknown/low-confidence classification は縮小ではなく escalation とする。cheap mini/spark lane は加速できるが risk close や required coverage 削減はできない。 | U-FR-L1-39 |

Proposal-stage subagent lane 名は advisory であり、`tierFor` / `routeTeamMembers` の execution router SSoT を置き換えない。`T2-mini` は low-cost research / document inventory lane、`T2-spark` は low-cost bounded implementation lane、`T1-worker` は通常 implementation lane、`T0-frontier` は gated judgement である。`PROPOSAL_SUBAGENT_LANES` はこれら lane の model、`parallel_slots`、`closing_authority`、guard text を定義する。mini/spark lane は複数の disjoint worker を並列実行できるが、risk を close したり required coverage を減らしたりできない。frontier judgement は single-slot かつ明示 gate 付きである。ここに別の `strong` model-band label を導入しない。`strong` は別箇所で compatibility adjective として使われており、この contract では `T1-worker` が曖昧でない cost-tier 名である。

`team suggest --design-docs` は、これら advisory lane を proposal coverage team definition へ橋渡しする。non-closing lane（`T2-mini`、`T2-spark`、`T1-worker`）は model override、ownership shard、low/medium effort を持つ具体 `TeamMember` row になる。`T0-frontier` は judgement guidance のままで executable member としては出力しないため、`team run` 経由で frontier approval を bypass できない。cross-provider review を保つため、最初の parallel shard の後に Claude-side TL review member を追加する。

### 2026-07-02 action-binding approval 分類追補

`classifyHighImpactApprovalRequirement` は `workflow-decision-packets`、`outstanding`、`s4-decision-readiness`、
`version-up-readiness`、`action-binding-approval-readiness` が共有する承認境界 classifier である。
`approval` / `承認` / `action-binding` などの語が文書内に散在するだけでは `human_approval_pending` にしない。
true になる条件は、(1) structured `action_binding_approval_record:` が存在する、または (2) 同一行・同一文の
文脈に high-impact target、approval boundary、execution-before obligation が揃う場合に限る。
`approval_scope`、`review_approval_evidence`、source ledger、過去 PLAN の説明、`planOnly` / `mustNotApply` /
out-of-scope 表明だけでは blocker にしない。一方で `production auth infrastructure deploy requires PO signoff
before execution` や `future activation requires action-binding approval` のような自然文は、`action-binding`
語が無くても high-impact approval requirement として扱う。これにより S4 / version-up / rename / action-binding
packet の supporting route と `outstanding.blockersByKind.human_approval_pending` が同じ意味境界で揃う。
| FR-L1-32 | `validateFolderRules` | validateFolderRules(input: ValidateFolderRulesInput, deps: ValidateFolderRulesDeps) => ValidateFolderRulesResult | path registry と artifact kind が与えられる。 | misplaced process docs/tests/state の violation を返す。 | folder policy は file rewrite なしで検査する。 | U-FR-L1-32 |
| FR-L1-33 | `catalogExistingAssets` | catalogExistingAssets(input: CatalogExistingAssetsInput, deps: CatalogExistingAssetsDeps) => CatalogExistingAssetsResult | approved asset roots が与えられる。 | command/skill/detector/template/state/hook/doc/test asset を coverage status で分類する。 | catalog は metadata だけを保存し、prompt body と secret は source docs に残す。 | U-FR-L1-33 |
| FR-L1-34 | `prioritizeCapabilityGaps` | prioritizeCapabilityGaps(input: PrioritizeCapabilityGapsInput, deps: PrioritizeCapabilityGapsDeps) => PrioritizeCapabilityGapsResult | asset catalog、workflow impact、missing route/recover signal が与えられる。 | reason 付き deterministic priority order を返す。 | priority は PLAN へ変換されるまで advisory である。 | U-FR-L1-34 |
| FR-L1-35 | `renderFoundationReadiness` | renderFoundationReadiness(input: RenderFoundationReadinessInput, deps: RenderFoundationReadinessDeps) => RenderFoundationReadinessResult | infrastructure category inventory が与えられる。 | implemented/designed/missing category を report する。 | report は missing category を implemented として扱えない。 | U-FR-L1-35 |
| FR-L1-36 | `projectSkillEvaluations` | projectSkillEvaluations(db: HarnessDb, opts?: { asOf?: string }) => void | skill_invocations と plan_registry row が存在し、asOf は ISO timestamp（既定 = nowIso()）である。 | accepted=1 invocation を持つ skill_id ごとに skill_evaluations row を書く。skill_rating = success_count / adoption_count、unused_flag = asOf から 30 日以内に invocation が無い場合 1。cold-start は 0 rows で throw しない。 | unused skill は自動削除しない。削除は human-only。success state (`confirmed`/`completed`) は source に文書化し、single-source-of-truth hardcoded とする。 | U-FR-L1-36 |
| FR-L1-43 | `projectPocEvaluations` | projectPocEvaluations(db: HarnessDb, opts?: { asOf?: string }) => void | plan_registry は PLAN frontmatter 由来 decision_outcome を持つ kind=`poc` row を含む。 | `poc-evaluation:summary` row を 1 件書き、poc_success_rate、confirmed/rejected/pivot/total count、evaluated_at を記録する。decision_outcome 空の PoC PLAN は分母から除外し、cold-start は 0 rows で throw しない。 | pivot は non-success。decision_outcome value は rationale 付き single-source-hardcoded。row id は常に `poc-evaluation:summary`。 | U-FR-L1-43 |
| FR-L1-38 | `projectModelEvaluations` | projectModelEvaluations(db: HarnessDb, repoRoot: string) => void | model_runs table は projectReviewModelRuns と token/cost telemetry 用 `projectTokenUsage` で populate 済みで、evaluation には `.helix/config/model-opt-in.yaml` enabled:true が必要である。 | opt-in disabled なら 0 rows を返す。enabled なら distinct model ごとに success_rate = success_count / run_count の model_evaluations row を書く。cold-start は 0 rows で throw せず、token/cost row は `helix telemetry scan` の file-scan だけで ingest する。 | cost-efficiency は PLAN-L7-57/58 で discharge 済み。cost は既知 model の local pricing table だけから計算し、未公開/unknown model は cost_usd=null のままにする。 | U-FR-L1-38 |
| FR-L1-37 | `recommendModelEffort` | recommendModelEffort(input: RecommendModelEffortInput, deps: RecommendModelEffortDeps) => RecommendModelEffortResult | task、drive、layer、size、uncertainty signal が与えられる。 | model family と reasoning effort recommendation を返す。 | model recommendation は hidden prompt state ではなく evidence として記録する。 | U-FR-L1-37 |
| FR-L1-39 | `scoreTaskComplexity` | scoreTaskComplexity(input: ScoreTaskComplexityInput, deps: ScoreTaskComplexityDeps) => ScoreTaskComplexityResult | size、dependency、uncertainty、affected artifact signal が与えられる。 | deterministic score と class を返す。 | unknown input は low complexity ではなく explicit uncertainty を生む。 | U-FR-L1-39 |
| FR-L1-40 | `resolveDriveStatePartition` | resolveDriveStatePartition(input: ResolveDriveStatePartitionInput, deps: ResolveDriveStatePartitionDeps) => ResolveDriveStatePartitionResult | drive/mode/kind/layer が与えられる。 | `.helix/drive/<drive>` partition と skip/defer rule を返す。 | drive state は plan/session で join し、他 drive partition を汚染できない。 | U-FR-L1-40 |
| FR-L1-41 | `classifyDrive` | classifyDrive(input: ClassifyDriveInput, deps: ClassifyDriveDeps) => ClassifyDriveResult | PLAN/code/dependency evidence が与えられる。 | drive と orchestration mode input を confidence 付きで分類する。 | low confidence は finding/confirmation need であり、certainty を捏造しない。 | U-FR-L1-41 |
| FR-L1-42 | `buildAdapterPlan` | buildAdapterPlan(input: BuildAdapterPlanInput, deps: BuildAdapterPlanDeps) => BuildAdapterPlanResult | provider、role、task、plan、execution mode が与えられる。 | HELIX-only plan flag を provider に forward せず、provider command plan と boundary flag を返す。 | provider boundary separation と handover context を保持する。 | U-FR-L1-42 |
| FR-L1-47 | `catalogSkills`, `recommendSkills` | catalogSkills(input: CatalogSkillsInput, deps: CatalogSkillsDeps) => CatalogSkillsResult<br>recommendSkills(input: RecommendSkillsInput, deps: RecommendSkillsDeps) => RecommendSkillsResult | skill docs と task/layer/drive context が与えられる。 | catalog entry と deterministic recommendation を返す。 | metadata 欠落は finding であり、skill source docs は書き換えない。 | U-FR-L1-47 |
| FR-L1-48 | `buildCommandCatalog` | buildCommandCatalog(input: BuildCommandCatalogInput, deps: BuildCommandCatalogDeps) => BuildCommandCatalogResult | command docs と CLI surface input が与えられる。 | command asset を HELIX CLI subcommand contract に map する。 | search row は rebuildable であり authoring source にならない。 | U-FR-L1-48 |
| FR-L1-51 | `deriveArtifactProgressDecision`, `projectArtifactProgress` | deriveArtifactProgressDecision(input: ArtifactProgressDecisionInput) => ArtifactProgressDecision<br>projectArtifactProgress(db: HarnessDb, graph?: RelationGraphProjection) => void | source artifact node、covered-by test edge、impact result、recovery PLAN ID は正規化済みである。 | red/yellow/green color と linked test/dependency reason を持つ rebuildable `artifact_progress` row を書く。 | DB row は derived state のみ。green には linked test evidence と dependency clear が必要で、red は missing dependency/back-propagation に残る。 | U-FR-L1-51 |

### FR registry 型 body / pseudocode substance 追補

この section は A-110 MUST-2 を close する。上の row は L6 unit contract であり、implementation body は L7 に着地してよい。ただし各 named function は typed input/result body と、pseudocode anchor または explicit L7 defer のいずれかを持つ。`explicit_l7_defer` は L6 contract がここで freeze され、L7 implementation が新しい requirements を作り出してはならないことを意味する。

Common value bodies:

```ts
type EvidencePath = string;
type Finding = { code: string; severity: "info" | "warn" | "error"; evidence_path: EvidencePath; message: string };
type ContractResult = { ok: boolean; findings: Finding[]; evidence_paths: EvidencePath[] };
type HarnessDbDeps = { repoRoot: string; dbPath: string; readText(path: string): string | null; now(): string };
type ProjectionRef = { table: string; id: string; evidence_path: EvidencePath };
type QualitySignal = { signal_type: string; subject_id: string; score?: number; evidence_path: EvidencePath };
```

| function | type body | pseudocode / implementation_state（実装状態） |
|---|---|---|
| `planDraft` | `PlanDraftInput { title; kind; layer; sub_doc?; generates[] } -> PlanDraftResult extends ContractResult { path; plan_id }` | implemented pseudocode §2.1 |
| `sprintCheck` | `SprintCheckInput { target; redEvidence; greenEvidence } -> SprintCheckResult extends ContractResult { ordered }` | implemented pseudocode §2.4 |
| `frontmatterSchema` | `unknown -> Frontmatter` | implemented zod parse。pseudocode は schema を検証し、typed frontmatter を返すか throw する |
| `parseRequires` | `ParseRequiresInput { frontmatterText; planPath } -> ParseRequiresResult extends ContractResult { requires[] }` | implemented in `analyzePlanGovernance`。list field を parse し、PLAN ID/path を正規化し、未解決と未完了 finding を出す |
| `recordProjectionEvent` | `RecordProjectionEventInput { event; source_path } -> RecordProjectionEventResult { ref: ProjectionRef }` | implemented in `src/state-db/projection-writer.ts`。ID を検証し、projection row を upsert して ref を返す |
| `rebuildHarnessDb` | `RebuildHarnessDbInput { roots[]; truncate: true } -> RebuildHarnessDbResult extends ContractResult { rows_by_table; search_rows; signals }` | implemented in `src/state-db/projection-writer.ts`。projection を truncate し、docs/state/logs を replay して `search_index` と `quality_signals` を再計算する |
| `buildVisualizationSnapshot` | `VisualizationSnapshot { schema_version; source_clock; progress; graph; evidence; drilldowns; warnings }` | implemented in `src/state-db/visualization-read-model.ts`。既存 projection table への query-only 初回応答を返し、schema mutation は行わない。status map は決定論的順序、cold-start は 0 値、runtime evidence が projection-only / provenance 欠落なら warning。accepted runtime evidence は runtime-verified class と accepted status の交差だけ |
| `recordTestRunEvidence` | `TestRunEvidenceInput { command; runner; scope; started_at; completed_at; exit_code; evidence_path; cases? } -> RecordTestRunEvidenceResult { refs[] }` | implemented in `src/workflow/contracts.ts`。Bun/vitest/doctor/lint evidence を unit-test history projection へ集約し、case duration/timestamp/failure digest を後続分析用に保持する。provider transcript は raw evidence として永続化しない |
| `evaluateGreenDefinition` | `GreenDefinitionInput { profile; required_commands[]; command_evidence[]; reviewed_at? } -> GreenDefinitionResult extends ContractResult { computed_green_at?; missing[]; non_green[] }` | implemented in `src/workflow/contracts.ts`。required command が欠落または non-zero、または computed green time が review time より後なら fail |
| `computeUtHistorySignals` | `UtHistoryInput { plan_id?; window?; duration_regression_ratio? } -> ComputeUtHistorySignalsResult { signals[] }` | implemented in `src/workflow/contracts.ts`。oracle coverage、plan green rate、oracle-level flake score、prior median 比の duration regression、green-definition compliance を計算する |
| `projectUtHistorySignals` | `UtHistoryInput { plan_id?; window?; duration_regression_ratio? } -> ProjectUtHistorySignalsResult { refs[]; signals[] }` | implemented in `src/workflow/contracts.ts`。aggregate history metrics を `quality_signals` へ、plan-scoped flake windows を `test_flake_events` へ、oracle-scoped `test_cases` と flake/duration regression signal、および oracle/run-scoped `duration_trend_ms` signal を feedback と trend inspection 用に投影する |
| `parseGreenCommandEvidence` / `projectStructuredGreenCommandCaseEvidence` / `projectUtHistorySignalsFromProjectedRuns` | `review_evidence.green_commands[].evidence_path -> test_results -> ut-history signals` | implemented in `src/state-db/test-report-parser.ts` and `src/state-db/projection-writer.ts`; structured `cases[]` JSON、Vitest/Jest-compatible JSON、Playwright JSON、JUnit XML を正規化し、rebuild が case/result rows を投影してから DB から unit-test history を復元する |
| `routeSignalToMode` | `RouteSignalToModeInput { signal; current_plan?; drive? } -> RouteSignalToModeResult extends ContractResult { candidates[] }` | implemented in `src/workflow/contracts.ts`。signal を分類し、許可 mode を順位付けし、unknown signal は finding にする |
| `evaluateAgentGuard` | `AgentGuardInput + AgentGuardContext -> GuardDecision` | implemented runtime guard。pseudocode は model family 正規化、worker/reviewer boundary 比較、allow/block 返却 |
| `recordCrossCuttingEvent` | `RecordCrossCuttingEventInput { type; subject_id; severity; evidence_path } -> RecordCrossCuttingEventResult { ref: ProjectionRef }` | implemented in `src/workflow/contracts.ts`。projection event を append し、gate approve は行わない |
| `suggestSkillInjection` | `SuggestSkillInjectionInput { task; layer; drive; catalog } -> SuggestSkillInjectionResult extends ContractResult { candidates[] }` | implemented in `src/workflow/contracts.ts`。catalog を filter し、trigger を score し、deterministic ranked skills を返す |
| `enforceForwardOrder` | `EnforceForwardOrderInput { layer; gate; prior_gates } -> EnforceForwardOrderResult extends ContractResult { allowed }` | implemented in `src/workflow/contracts.ts`。prior PASS または explicit exception evidence を要求する |
| `routeReverseR4` | `RouteReverseR4Input { reverse_type; r4_evidence; forward_routing } -> RouteReverseR4Result extends ContractResult { target_plan? }` | implemented in `src/workflow/contracts.ts`。Forward merge 前に confirmed reverse evidence を検証する |
| `decideDiscoveryS4` | `DecideDiscoveryS4Input { hypothesis; poc_evidence; outcome } -> DecideDiscoveryS4Result extends ContractResult { decision }` | implemented in `src/workflow/contracts.ts`。pivot/confirmed の曖昧さを拒否し、routing を記録する |
| `emitFeedbackEvents` | `EmitFeedbackEventsInput { findings; quality_signals } -> EmitFeedbackEventsResult { events[] }` | implemented in `src/feedback/engine.ts`。repeated gap/stall/regression をまとめ、PLAN は編集しない |
| `detectFrontendDrift` | `DetectFrontendDriftInput { mock_root?; token_root?; a11y?; vrt? } -> DetectFrontendDriftResult extends ContractResult { drift_signals[] }` | implemented in `src/workflow/contracts.ts`。optional root は absent-by-contract で扱い、silent pass にしない |
| `routeScrumFullback` | `RouteScrumFullbackInput { increment; s4_decision } -> RouteScrumFullbackResult extends ContractResult { forward_targets[] }` | implemented in `src/workflow/contracts.ts`。confirmed increment だけを対象にする |
| `assertRefactorInvariant` | `AssertRefactorInvariantInput { before; after; regression } -> AssertRefactorInvariantResult extends ContractResult { unchanged }` | implemented in `src/workflow/contracts.ts`。behavior evidence を比較し、green regression を要求する |
| `evaluateRetrofitMatrix` | `EvaluateRetrofitMatrixInput { migration; config; rollback } -> EvaluateRetrofitMatrixResult extends ContractResult { readiness }` | implemented in `src/workflow/contracts.ts`。rollback evidence 欠落時は fail |
| `evaluateResearchDecision` | `EvaluateResearchDecisionInput { memo; sources; adr_candidate? } -> EvaluateResearchDecisionResult extends ContractResult { decision_ready }` | implemented in `src/workflow/contracts.ts`。research は ADR/requirement trace を bypass できない |
| `mergeTwoStageAgentDesign` | `MergeTwoStageAgentDesignInput { phase1; phase2; handoff } -> MergeTwoStageAgentDesignResult extends ContractResult { merged? }` | implemented in `src/workflow/contracts.ts`。layer boundary を保持し、provider transcript content を redact する |
| `validateScreenDesignWorkflow` | `ValidateScreenDesignWorkflowInput { ia; screens; flow; wireframe; mock; components } -> ValidateScreenDesignWorkflowResult extends ContractResult { complete }` | implemented in `src/workflow/contracts.ts`。backend-only evidence では screen design を完了にしない |
| `validateFrontendDesignWorkflow` | `ValidateFrontendDesignWorkflowInput { visual; tokens; a11y; vrt; ux } -> ValidateFrontendDesignWorkflowResult extends ContractResult { complete }` | implemented in `src/workflow/contracts.ts`。a11y/token/VRT を first-class evidence として扱う |
| `classifyDriveTddFits` | `ClassifyDriveTddFitsInput { modes? } -> ClassifyDriveTddFitsResult extends ContractResult { fits[] }` | implemented in `src/workflow/contracts.ts`。DB/projected signal 名を Red trigger vocabulary として使うが、DB/PLAN は mutate しない |
| `classifyProposalDocumentCoverage` | `ClassifyTaskInput { text; affected_files?; dependencies? } -> ProposalDocumentCoverage { granularity; patterns[]; required_design_docs[]; required_test_docs[]; required_evidence[]; required_gates[]; research_adoption[]; research_rejections[]; escalators[]; guardrails[]; findings[] }` | implemented in `src/task/classify.ts`。proposal text を screen/UI、UX/usability、API/IF、data/DB、batch/report、report output、async/job flow、notification/message、common component、security/privacy、error/observability/audit、ops/release/migration、NFR、test design、workflow/gate、agent orchestration、discovery 向けの additive required document pack へ写像する |
| `analyzeProposalDocumentCoverage` | `ProposalDocumentCoverageLintInput { repoRoot; routingDocText; classifyCoverage; scenarios? } -> ProposalDocumentCoverageLintResult { ok; checkedScenarios; checkedPatterns[]; violations[] }` | implemented in `src/lint/proposal-document-coverage.ts`。代表 proposal scenario、required document path 実在、cross-layer routing doc inclusion、routing pattern marker、cross-artifact trace escalation、shrinkage guard を検証する。classifier は注入し、lint dependency direction を中立に保つ |
| `validateFolderRules` | `ValidateFolderRulesInput { path; artifact_kind; registry } -> ValidateFolderRulesResult extends ContractResult { violations[] }` | implemented in `src/workflow/contracts.ts`。file rewrite なしで配置を検査する |
| `catalogExistingAssets` | `CatalogExistingAssetsInput { roots: string[] } -> CatalogExistingAssetsResult extends ContractResult { assets: AssetCatalogEntry[] }` | implemented in `src/workflow/contracts.ts`。metadata のみを catalog 化し、prompt body/secret は扱わない |
| `prioritizeCapabilityGaps` | `PrioritizeCapabilityGapsInput { assets; workflow_impact; missing_routes } -> PrioritizeCapabilityGapsResult { priorities[] }` | implemented in `src/workflow/contracts.ts`。PLAN へ変換されるまでは priority は advisory |
| `renderFoundationReadiness` | `RenderFoundationReadinessInput { categories[] } -> RenderFoundationReadinessResult extends ContractResult { implemented; designed; missing }` | implemented in `src/workflow/contracts.ts`。missing category を implemented として報告できない |
| `recommendModelEffort` | `RecommendModelEffortInput { task; drive; layer; size; uncertainty } -> RecommendModelEffortResult { model_family; reasoning_effort; evidence_path }` | implemented in `src/workflow/contracts.ts`。recommendation は hidden prompt state ではなく evidence として記録する |
| `scoreTaskComplexity` | `ScoreTaskComplexityInput { size; dependencies; uncertainty; affected_artifacts } -> ScoreTaskComplexityResult { score; class; findings[] }` | implemented in `src/workflow/contracts.ts`。unknown は low complexity ではなく uncertainty を生む |
| `resolveDriveStatePartition` | `ResolveDriveStatePartitionInput { drive; mode; kind; layer; plan_id?; session_id? } -> ResolveDriveStatePartitionResult { partition_path; skip_sub_doc[] }` | implemented in `src/workflow/contracts.ts`。drive state は plan/session で join し、他 drive を汚染しない |
| `classifyDrive` | `ClassifyDriveInput { plan; code_delta?; dependency_delta? } -> ClassifyDriveResult { drive; confidence; findings[] }` | implemented in `src/workflow/contracts.ts`。low confidence は finding/human confirmation を要求する |
| `buildAdapterPlan` | `BuildAdapterPlanInput { provider; role; task; plan; execution_mode } -> BuildAdapterPlanResult extends ContractResult { command_plan; boundary_flags[] }` | implemented in `src/runtime/adapter.ts`。provider boundary flag を保持する |
| `checkCodexWrapperParity` | `DoctorDeps -> { messages: string[]; ok: boolean }` | implemented in `src/doctor/index.ts`。Claude hooks が project-settings ベースであること、Codex parity が `helix codex --execute` wrapper lifecycle tests と stdin adapter oracle で担保されることを検証する |
| `catalogSkills` | `CatalogSkillsInput { skill_docs: SkillDocRef[] } -> CatalogSkillsResult extends ContractResult { skills: SkillCatalogEntry[] }` | implemented in `src/workflow/contracts.ts`。metadata のみを扱い、source docs を SSoT に残す |
| `recommendSkills` | `RecommendSkillsInput { task; layer; drive; catalog } -> RecommendSkillsResult { recommendations[]; findings[] }` | implemented in `src/workflow/contracts.ts`。metadata 欠落は finding |
| `buildCommandCatalog` | `BuildCommandCatalogInput { command_docs[]; cli_surface } -> BuildCommandCatalogResult extends ContractResult { commands[] }` | implemented in `src/workflow/contracts.ts`。search row は rebuildable projection |
| `projectSkillEvaluations` | `SkillEvaluationsInput { asOf?: string } -> void` | implemented in `src/state-db/projection-writer.ts`。skill_invocations と plan_registry から skill ごとの rating/adoption/success/unused を投影する。cold-start は zero rows |
| `projectPocEvaluations` | `PocEvaluationsInput { asOf?: string } -> void` | implemented in `src/state-db/projection-writer.ts`。summary row を 1 件作り、poc_success_rate = confirmed/(confirmed+rejected+pivot) とする。cold-start は zero rows、pivot は non-success |
| `projectModelEvaluations` | `ModelEvaluationsInput { repoRoot: string } -> void` | implemented in `src/state-db/projection-writer.ts`。`.helix/config/model-opt-in.yaml` enabled:true で opt-in し、model_runs と plan_registry join から model ごとの success_rate を算出する。cold-start は zero rows。**cost-efficiency DISCHARGED**: token efficiency は `loadRuntimeSessionUsage`/`projectTokenUsage` の cross-runtime session JSONL から、cost は local pricing table から計算し、価格不明 model は cost=null のままにする。ingest は `helix telemetry scan` |
| `deriveArtifactProgressDecision` | `ArtifactProgressDecisionInput { linkedTestCount: number; dependencyChecked: boolean; openDependencyImpacts: number; recoveryPlanIds?: string[] } -> ArtifactProgressDecision { state: dependency_unchecked/implemented_unverified/verified; color: red/yellow/green; reason: string }` | implemented in `src/state-db/projection-writer.ts`。pseudocode は dependency 未確認または open impact なら red、linked test 欠落または recovery active なら yellow、それ以外は green |
| `projectArtifactProgress` | `ArtifactProgressProjectionInput { graph?: RelationGraphProjection; db: HarnessDb } -> void` | implemented in `src/state-db/projection-writer.ts`。pseudocode は source node を収集し、covered-by test edge を数え、impact_results/recovery PLAN を join し、decision を導いて rebuildable `artifact_progress` row を upsert する |

## 2026-06-09 L6 completion readiness 追補

`analyzeL6Completion` は G6 readiness aggregator である。status flip 前に trace/substance が G6 audit 可能な `freezeInputReady` と、confirmed docs/plans・confirmed L7・G6 PASS 後の L6 completion を示す最終 `ready` を分離する。L6 design doc status、各 L6 doc の `plan:` reference、各 L6 doc の `pair_artifact`、L6 doc filename による L7 reverse reference、最小 unit-contract substance marker（contract/signature、DbC または oracle、U-* oracle family）、base L6 `kind=design` PLAN status と review evidence、L7 unit-test-design status、G6 gate table row を読む。G6 後の `kind=add-design` PLAN は add-feature/backfill/review evidence で govern され、base G6 completion を reopen しない。unit oracle は `L7-unit-test-design.md` の U-L6COMP-001..005 である。

> **SSoT 参照**: module 公開 IF = [module-decomposition.md](../L5-detailed-design/module-decomposition.md) / DbC pre-post-invariant = [internal-processing.md](../L5-detailed-design/internal-processing.md) §3-§5 / 型の単一正本 = `src/schema/` / pseudocode 標準 = [document-system-map](../../../governance/document-system-map.md) §1 (IEEE 1016 §5.7)。本 doc は公開 IF に **関数 signature + アルゴリズム pseudocode + 型設計 + WBS** を付与する (L6、IEEE 1016 §5.7)。
>
> **V-pair**: `pair_artifact = L7-unit-test-design.md` (L6↔L7)。DbC 契約から単体テスト oracle (U-*) を導出 (document-system-map §3)。
> **class-design 縮退**: HELIX core は非 OOP (関数 + zod 値オブジェクト)。型/値オブジェクト設計は本 doc §3 に統合 (PLAN-L6-00 §2、G.13 line 547)。
> **edge 引き渡し**: 各関数の `@edge-*` docstring per-function 確定は [edge-case.md](./edge-case.md) が担当 (IMP-014)。

# HELIX-HARNESS — L6 機能設計: 関数仕様 (Function-Spec)

module-decomposition の公開 IF に**関数 signature・pseudocode・型・WBS** を付与する (PLAN-L6-01)。**G6 = 機能設計凍結点** (gate-design §1) の凍結対象を本 doc が確定し、L7 実装の正本 (parent_design) となる。

## §1 関数 signature 表 (実装済 module、module-decomposition §2 と 1:1)

> 詳細型は `src/schema/` を正本とし参照。pre/post は internal-processing §3/§4 への参照。

### §1.1 lint (共通様式 `loadX` / `analyzeX(docs?)`)

| 関数 (実 export、src/lint/) | signature | pre (§3) | post (§4) |
|---|---|---|---|
| `analyzeG3Trace` | `(docs?: DocSource) => G3TraceResult` | docs 省略時 fs 読込可 | `orphans[] == [] ⟺ ok`、totals 全 > 0 |
| `analyzeEntityCoverage` | `(business?: string) => EntityCoverageResult` | 同上 | primary⊇derived 整合、totals > 0 |
| `analyzeFrRegistry` | `(docs?: FrDocSource) => FrRegistryAuditResult` | 同上 | 漏れ 5 型 == 0 で ok |
| `analyzeDocConsistency` | `(docs?: DocConsistencySource) => DocConsistencyResult` | 同上 | carry/screenId/nfr 違反 == 0 で ok |
| `analyzeImprovementBacklog` | `(md?: string) => ImprovementBacklogResult` | 同上 | IMP 形式/status/候補 enum 妥当で ok |
| `analyzeChangeSetIntegrity` | `(input: ChangeSetIntegrityInput) => ChangeSetIntegrityResult` | `changedFiles` は git status 由来の repo 相対 path。`planDocs` が与えられる場合は changed set 内の PLAN text に限定する | `src/**` 変更時、changed set 内に L7 実装系 PLAN (`impl` / `add-impl` / `refactor` / `retrofit` / `troubleshoot`) が無ければ `source-plan-missing` blocker。該当 PLAN が parent L6 design / pair artifact / test evidence を欠く場合は `source-plan-contract-missing` blocker。docs-only は従来どおり warning surface に留める |
| `loadDocs` / `loadBusiness` / `loadFrDocs` / `loadDocConsistencyDocs` / `loadBacklog` | 各 `() => DocSource \| string \| FrDocSource \| DocConsistencySource \| string` (lint 別、統一型なし) | repo doc path 解決可 | 副作用 = fs read のみ (write なし) |

> 共通 invariant: `analyzeX` は純粋関数 (同入力→同出力、FR-05 決定論)。`loadX` が唯一の fs 端点 (module-decomposition §4)。**引数/戻り型は lint ごとに固有** (統一 `XSource` 型は存在しない。実 export 名・型は `src/lint/*.ts` を正本)。

### §1.2 runtime

| 関数 (実 export、src/runtime/) | signature | pre | post |
|---|---|---|---|
| `detectMode` | `() => RuntimeDetection` | (前提なし) | `mode ∈ {standalone,claude-only,codex-only,hybrid}`、副作用なし |
| `nextActionForMode` | `(mode: ExecutionMode) => string` | — | mode→judgment-gate guidance (`NEXT_ACTION_BY_MODE` SSoT)。純関数・副作用なし。`helix status --json` が 6 検出フィールドに `nextAction` を additive 付加する公開契約 (PLAN-L7-84、A-138 ITEM-1、camelCase)。`nextAction` は互換のため残し、同値 alias として `runtimeNextAction` を返す。whole-program / L14 の次手は `completionNextAction` / `workflowNextAction` に分離する。text surface は曖昧な `next:` を出さず `runtime-next:` と `completion-next:` を出す。値は先頭 token + 人間可読 (`human-review-required:` / `single-runtime:` / `cross-review-ready:`)、ASCII のみ |
| `judgmentReviewPlanForMode` (gate/review-tier) | `(mode: ExecutionMode) => JudgmentReviewPlan` | mode 確定済 | `helix status --json` の additive `judgmentReview` を構築する。hybrid は `requiredReviewKind=cross_agent`、worker/reviewer model と provider 相異を要求し、単一 runtime は `intra_runtime_subagent` + checklist、standalone は human approval を要求する。`gateCommandTemplate` と `requiredEvidence[]` を出し、`nextAction` の人間可読 guidance だけに判断ゲート手順を閉じない。 |
| `isReadOnlyDelegationRole` / `detectWorkingTreeMutation` / `assessReviewSession` / `reviewGuardMessages` / `summarizeStagedReview` (review-guard) | `assessReviewSession({role,before,after}) => ReviewSessionAssessment` 他 | before/after は git status --porcelain 由来の path 配列 (純関数・git/fs 端点なし、I/O は cli の loadChangedFiles/loadStagedFiles) | 委譲レビューの非破壊性強制 (IMP-137、PLAN-L7-85)。read-only (相談/検証 archetype = tl/qa/uiux + review エイリアス) が working tree を変更したら `violation=true` で検知。`helix <provider> --role <read-only> --execute` が spawn 前後の変更を assess し warning surface (exit 不変=fail-open)、`helix review --staged` が staged 集合を doctor と共に確認し混入を fail-close。worker/未知ロールは対象外 (誤検知回避) |
| `extractShellCommand` / `evaluateGitCommandGuard` / `resolveDestructiveGitOverride` (git-command-guard) | `evaluateGitCommandGuard({ command, bypass? }) => GitCommandGuardResult` | `command` は Claude `tool_input.command` / Codex `tool_input.cmd` / 文字列 payload から抽出済み。hook I/O は `.claude/hooks/git-command-guard.ts` または `helix hook git-command-guard` が担う | hybrid 多ランタイムで相手 runtime の commit / branch を破壊し得る `git reset`、destructive `git checkout`、`git restore`、`git revert`、`git push --force` / `--force-with-lease` を `decision=block` / `reason=destructive-git` で fail-close する。`git status` / `diff` / `log` / 通常 `push` / `checkout -b` は pass。override は `HELIX_ALLOW_DESTRUCTIVE_GIT=1` または `.helix/state/destructive-git-override` の非空理由のみで、marker は one-shot 消費して `.helix/logs/destructive-git-overrides.jsonl` に audit する。Claude `PreToolUse(Bash)` と Codex `PreToolUse(exec_command\|local_shell)` の双方で同じ純関数を使い、IMP-142 の reset/revert/checkout/force-push 再発を運用記憶でなく機械で止める |
| `normalizeModelFamily` | `(raw: string \| null \| undefined) => ModelFamily \| null` | — | family ∈ {opus,sonnet,haiku} or `null` (判定不能・曖昧は fail-close) |
| `evaluateAgentGuard` | `(input: AgentGuardInput, ctx: AgentGuardContext) => GuardDecision` | `tool_name` が Claude `Agent` または標準 `Task` の場合は `input.subagent_type` 存在 / ctx に `resolveAgentFamily` + `allowRaw` 提供。Codex `spawn_agent|spawn_agents_on_csv` は Codex branch で判定 | `decision.code ∈ {0,2}` を**返す**。`Agent` と `Task` は同じ Claude subagent fail-close path で allowlist/model family を検査する。`code=2` の exit 実行は hook shim (`.claude/hooks/agent-guard.ts`) の責務 — 本関数は純粋 (process.exit しない)。bypass は `bypassed=true` + message warn |
| `resolveActivePlan` / `recordEvent` / `compressPlanDigest` / `onStop` (session-log) | `session-log.md §3` 参照 | — | **fail-OPEN** (常に 0、guard と逆)。`compressPlanDigest` は純関数・idempotent。詳細は `session-log.md` (PLAN-L6-03 add-design 差分) |

### §1.3 schema / plan / vmodel / doctor 契約

| 関数 | signature | pre | post |
|---|---|---|---|
| `frontmatterSchema.parse` | `(data: unknown) => Frontmatter` | — | zod 妥当 or throw ZodError |
| `lintPlan` | `(path?: string, gate?: "schedule" \| "governance" \| "frontmatter" \| "G1-trace" \| "G3-trace") => LintResult` | path 省略時カレント | `{ok, messages[]}`、state 不変 (read-only)。schedule は最小強制、governance/frontmatter は PLAN frontmatter + cross-record strict、G1/G3 は trace gate |
| `lintVmodel` | `(path?: string) => LintResult` | 同上 | 12 edge 照合、孤児で ok=false |
| `runDoctor` | `() => LintResult` | detector/lint の読む doc 解決可 | 全 detector 集約、error≥1 で ok=false/exit 1 |

## §2 core 操作の pseudocode (IEEE 1016 §5.7、IMP-019)

> internal-processing §2 の処理フローをアルゴリズム化。L7 実装の正本。共通骨格 = `入力 → zod validate → state 読込 → 処理 → state 書込 → 出力/exit` (副作用は cli/hook 端点)。

### §2.1 `plan draft` (FR-01)

```
function planDraft(input):
  assert input.title != ""                       # pre (§3)
  assert input.kind in VALID_KINDS
  assert input.layer in VALID_LAYERS
  if input.kind == "design" and input.layer in L1..L6:
    assert input.subDoc is provided              # G.1
  fm = buildFrontmatter(input)
  validated = frontmatterSchema.parse(fm)        # throw → fail-close
  if registry.has(validated.plan_id):
    error("plan_id 重複", FR-01); exit 1
  path = resolvePlanPath(validated)              # §1.10 line 418 規約
  # 原子性 = tmp file + rename (失敗時 file 不変)
  tmpPath = path + ".tmp"
  write(tmpPath, render(validated))
  rename(tmpPath, path)                          # post: 原子的 publish
  registry.add(validated.plan_id, path)
  exit 0
```

### §2.2 `gate <G-ID>` (FR-05、決定論 = AI 呼ばない)

```
function runGate(gId):
  assert gId in G0.5..G14                         # pre
  assert phase.priorGatesPassed(gId)              # V-model 順序 (FR-13)
  checks = loadGateChecks(gId)                    # gate-checks.yaml
  results = []
  for check in checks:                            # 決定論実行のみ
    results.append(check.run())                   # 純粋判定 (no AI)
  status = all(results.ok) ? "passed" : "failed"
  phase.gates[gId].status = status               # post: 証跡
  appendGateRun(gId, results)
  exit status == "passed" ? 0 : 1
```

### §2.3 `trace check` (FR-03)

```
function traceCheck(planId):
  plan = registry.get(planId)                     # pre: 存在
  assert plan.generates is not empty
  artifacts = resolve4Artifacts(plan)             # 設計/実装/テスト設計/テスト
  edges = checkBidir12(artifacts)                 # 双方向 12 edge
  orphans = edges.filter(e => not e.resolved)
  report(edges, orphans)
  exit orphans == [] ? 0 : 1                       # post: fail-close
```

### §2.4 `sprint check` (FR-02、TDD Red-first 契約)

```
function sprintCheck(target):
  assert L6.functionDesignFrozen()                # pre: G6 通過
  redCommit = findRedTestCommit(target)
  greenCommit = findBodyCommit(target)
  assert redCommit.precedes(greenCommit)          # Red-first 順序
  recordTddTrace(redCommit, greenCommit)          # post
  exit ordered ? 0 : 1
```

## §3 型 / 値オブジェクト設計 (class-design 縮退統合)

> HELIX は非 OOP。型は zod schema (`src/schema/`) を単一正本とし、本節は L6 で確定する**追加型**のみ。

| 型 | 種別 | 定義 (実 src を正本) | carry |
|---|---|---|---|
| `SubDoc` | 値オブジェクト (plan governance lint) | §1.10.G.1 VALID_SUB_DOCS の層別 enum。現行 `analyzePlanGovernance` が L1-L6 design PLAN の sub_doc 欠落 / 層外値 / duplicate layer+sub_doc / skip_sub_doc reason を検出 | implemented |
| `PlanId` | 値オブジェクト (zod regex) | **現行** = `src/schema/frontmatter.ts` `PLAN-(L0..L14\|DISCOVERY\|REVERSE\|RECOVERY\|M)-NN-slug`。横断 token と kind の整合も `frontmatterSchema` で検証 | implemented |
| `RuleType` | 判別共用体 (discriminated union) | `{ id: "pair-exists" \| "ref-resolves" \| "trace-bidir" \| "upstream-coverage" \| "count-matches" \| "id-format" \| "dup-id" \| "glossary-delta" \| "dependency-drift" \| "backlog-format" }` (discriminant = `id`、§4) | IMP-033 (L6 本 doc §4) |
| `GuardDecision` | interface (実装済、`src/runtime/agent-guard.ts:55`) | `{ code: 0 \| 2, message?: string, bypassed?: boolean }` (exit code を返すのみ、block boolean は持たない) | 実装済 |
| `RuntimeDetection` | interface (実装済、`src/runtime/detect.ts:10`) | `{ mode: ExecutionMode, claude: boolean, codex: boolean, currentRuntime: "claude"\|"codex"\|null, availableRuntimes: string[], missingRuntimes: string[] }`。**検出契約 (A-128 F-7、2026-06-10)**: Windows の binary 探索 (`onPath`) は finder (`where.exe`) を PATH 探索せず `%SystemRoot%\System32` から canonical に解決する — PATH 注入事故 (System32 欠落) で finder 自体が不在となり全 runtime を unavailable と誤検出する事故を防ぐ (oracle = `tests/runtime-hook-entrypoints.test.ts` の wrapper lifecycle 群が壊れた PATH 下でも green) | 実装済 |
| `LintResult` | interface (実装済、`src/plan/lint.ts`) | `{ ok: boolean, messages: string[] }` | 実装済 |

> 値オブジェクト不変条件 = zod schema が parse 時に保証 (internal-processing §5 invariant「state は zod 妥当のみ永続化」の型レベル写像)。クラス階層は導入しない (依存方向 = schema 安定核、module-decomposition §4)。**実装済型は実 src 定義を正本とし、本表はその写し** (発明禁止)。

## §4 IMP-033: クロスチェックエンジン rule 型 (gate-design §5)

> 自動追加型クロスチェック (gate-design §4) の rule registry を構成する 10 型。各 rule = 純粋関数 (FR-05 決定論)。doc registry (frontmatter scan) が enroll、gate binding が G_N へ束ねる。

### §4.1 共通 signature

```
type Rule = (registry: DocRegistry, params: RuleParams) => RuleResult
type RuleResult = { ruleId, ok: boolean, violations: Violation[] }
```

### §4.2 10 rule 型 (signature + 1 行 pseudocode)

| # | rule 型 | signature 概要 | pseudocode 要旨 |
|---|---|---|---|
| 1 | `pair-exists` | `(reg, {layer}) => RuleResult` | 設計 doc に対応する pair (テスト設計) doc が存在するか |
| 2 | `ref-resolves` | `(reg, {field}) => RuleResult` | frontmatter の path 参照 (requires/pair) が repo 内に実在 |
| 3 | `trace-bidir` | `(reg, {from,to}) => RuleResult` | A→B 参照に対し B→A 逆参照が存在 (孤児 0) |
| 4 | `upstream-coverage` | `(reg, {childLayer,parentLayer}) => RuleResult` | 下流 ID が上流 ID で全被覆 (FR↔BR 等) |
| 5 | `count-matches` | `(reg, {declared,actual}) => RuleResult` | §0 件数宣言 = 実カウント (ドリフト検出) |
| 6 | `id-format` | `(reg, {pattern}) => RuleResult` | ID が regex 規約に従う (PlanId/FR-ID 等) |
| 7 | `dup-id` | `(reg, {idKind}) => RuleResult` | ID 一意 (重複 0) |
| 8 | `glossary-delta` | `(reg) => RuleResult` | per-工程の用語更新が glossary に反映 (G.9) |
| 9 | `dependency-drift` | `(reg, {expectedMap}) => RuleResult` | 実 import グラフ = 期待依存マップ (ADR-002/IMP-032) |
| 10 | `backlog-format` | `(reg) => RuleResult` | IMP-NNN 形式 + status/候補 enum 妥当 |

> 既存 5 lint (g3-trace/entity-coverage/fr-registry-audit/doc-consistency/improvement-backlog) は上記の rule インスタンスとして吸収 (gate-design §5)。auto-enroll = doc registry が新 doc の frontmatter (layer/sub_doc/pair_artifact) を scan し該当 rule を自動適用 (手書き lint 不要)。

### §4.3 auto-enroll pseudocode 追補

```
function buildCoverageMap():
  registry = scanFrontmatter(docs/**)            # doc registry
  for doc in registry:
    rules = matchRulesByMetadata(doc)            # layer/sub_doc → 適用 rule
    for rule in rules:
      coverage[doc][rule] = rule(registry, paramsFor(doc))
  bindToGates(coverage)                          # gate binding (G_N)
  return coverage                                # 構造軸 = engine、意味軸 = self-review
```

## §5 WBS (関数群 → L7 実装 Sprint、G6 WBS 要件)

| Sprint | 対象関数群 | 依存 | 状態 |
|---|---|---|---|
| **L7.1** | schema 拡張 (`subDocSchema` IMP-026 / `planIdSchema` 層別 IMP-004) | — (安定核) | 実装済 (`src/schema/index.ts` / `src/schema/frontmatter.ts`) |
| **L7.2** | `lintPlan` 本実装 (schedule + governance/frontmatter + G1/G3 trace gate) | schema / trace lint | implemented; repo debt closed and doctor hard-gates `plan-schedule` / `plan-governance` |
| **L7.3** | `lintVmodel` 本実装 (12 edge trace) | schema | implemented |
| **L7.4** | `runDoctor` 統合 (5 lint + state 突合) | lint 群 | scaffold→本 |
| **L7.5** | rule engine 10 型 + auto-enroll (IMP-033) | schema/lint | 実装済 (`src/lint/*` hard gates + doctor integration) |
| **L7.6** | dependency-drift lint (built-in TS import graph、optional knip/madge は adapter insight、ADR-002/IMP-032) | runtime | 実装済 (`src/lint/dependency-drift.ts` / `tests/dependency-drift.test.ts`、PLAN-REVERSE-42) |
| **L7.7** | L7 closure module surface (workflow/session/cutover/review/skill/asset 等) | schema | 実装済 (`src/workflow/`、`src/handover/`、`src/runtime/`、`src/skills/`、`src/assets/`、CLI surface) |

> 各 Sprint = TDD Red-first (L7 entry、§1.10 line 671)。先行 ④ 単体テストコードは L7 単体テスト設計 (pair) の U-* に対応。

## §6 carry → edge-case (L6) / L7 実装

- 各関数の `@edge-*` docstring per-function 確定 = [edge-case.md](./edge-case.md) (IMP-014、internal-processing §7 枠を展開)
- signature の TS 実体化 + DbC docstring 転記 = L7 (parent_design = 本 doc)
- pseudocode (§2/§4.3) の実装 = L7 各 Sprint
- DbC → U-* test oracle 導出 = L7 単体テスト設計 (pair、document-system-map §3)
- **G6 freeze**: 本 doc の signature + pseudocode + 型 + WBS を G6 で凍結 (L7 の parent_design 正本)
## Appendix B: BR-21 evaluation trace coverage 追補

BR-21 evaluation hooks は Phase B oriented だが、L4/L5 module boundary がそれらを名指しした後は、function-design trace が L6 を skip してはならない。この追補は現在の evaluation surface に対する L6 contract landing point を記録する。詳細な algorithm expansion は owning Phase B PLAN に残す。

| trace | L6 contract landing |
|---|---|
| FR-L1-36 | skill evaluation input は Learning Engine aggregation 前に skill metric feedback として正規化する |
| FR-L1-38 | model evaluation input は recommendation update 前に model/effort quality feedback として正規化する |
| FR-L1-43 | PoC success measurement input は recipe/risk aggregation 前に verification outcome feedback として正規化する |

## Appendix C: L7 clean checkout DB projection invariant 追補

clean checkout では、`harness-check` は tests の前に deterministic `db rebuild` を実行しなければならない。ignored local session log が無い場合、projection layer は tracked provider handover evidence から `hook_events` を derive する必要がある。persistent `.helix/harness.db` が無い場合、`helix skill suggest --json` は source から read-only in-memory DB を rebuild しなければならない。persistent `.helix/harness.db` が存在する通常 repo では、`skill suggest` と adapter の skill injection 解決は既存 projection を read-only に使い、毎回の in-memory rebuild を避ける。`--record` 指定時だけ projection を更新してから `skill_recommendations` へ書く。

## Appendix D: PLAN-L7-51 同梱 lint モジュール契約 back-fill (PLAN-L7-52 C-4, 2026-06-15)

PLAN-L7-51 が impl-ahead で着地した 4 モジュール (`plan-dod`, `placeholder-deps`, `l7-completion`, `drive-db-registration`) の L6 契約を後追いで明文化する。parent PLAN = PLAN-L7-51。oracle ID 宣言 (U-* / FR-L1-*) は L7 oracle slice で別途行うため本 addendum では省略し、関数 signature + DbC + doctor 配線のみを記録する。

### D.1 `src/lint/plan-dod.ts`

| 関数 (実 export) | signature | pre | post | doctor 配線 |
|---|---|---|---|---|
| `loadPlanDodDocs` | `(root?: string) => PlanDodDoc[]` | `root` 省略時は `process.cwd()`; `docs/plans/` が存在しない場合は空配列を返す | fs read のみ (write なし); 返り値は `PLAN-L7-*.md` ファイルを sort 順で列挙した `PlanDodDoc[]` | `checkPlanDod` 内部で呼ばれる |
| `analyzePlanDod` | `(docs: PlanDodDoc[]) => PlanDodResult` | `docs` は `loadPlanDodDocs` の返り値相当; 純粋関数 (fs アクセスなし) | `status` が `confirmed` または `completed` の PLAN の DoD セクション内に未チェック項目 (`- [ ]`) が 1 件でもあれば `ok=false`; 対象 PLAN が 0 件の場合は `checked=0` (警告扱い) | `checkPlanDod` が `planDodMessages` とともに `runDoctor` へ集約 |
| `planDodMessages` | `(result: PlanDodResult) => string[]` | `result` は `analyzePlanDod` の返り値 | `checked=0` のとき警告メッセージを 1 件返す; `ok=true` のとき合格メッセージを返す; 違反時は最大 8 件のサンプル (`planId:line`) を含む違反メッセージを返す | `checkPlanDod` → `runDoctor.messages` に `doctor:` プレフィックスで合流 |

型定義:

```ts
interface PlanDodDoc { path: string; planId: string; status: string; text: string }
interface PlanDodViolation { planId: string; path: string; line: number; item: string }
interface PlanDodResult { checked: number; violations: PlanDodViolation[]; ok: boolean }
```

共通 invariant: `analyzePlanDod` は純粋関数 (同入力→同出力)。`loadPlanDodDocs` が唯一の fs 端点。`status` フィルタは `confirmed` / `completed` のみ対象とし、それ以外の PLAN は DoD 検査をスキップする。

### D.2 `src/lint/placeholder-deps.ts`

| 関数 (実 export) | signature | pre | post | doctor 配線 |
|---|---|---|---|---|
| `loadPlaceholderDepsDocs` | `(root?: string) => PlaceholderDepsDoc[]` | `root` 省略時は `process.cwd()`; 対象ディレクトリが存在しない場合は空配列を返す | `docs/design/harness/` と `docs/test-design/harness/` を再帰 walk して `.md` ファイルを収集; path は repo root からの相対パスで正規化; sort 済みで返す | `checkPlaceholderDeps` 内部で呼ばれる |
| `analyzePlaceholderDeps` | `(docs: PlaceholderDepsDoc[]) => PlaceholderDepsResult` | `docs` は `loadPlaceholderDepsDocs` の返り値相当; 純粋関数 | active (`""` / `confirmed` / `completed`) の doc に L7 を待ち先とする未解決の依存宣言行が残る、または専用 doctor rule が未整備との自己申告行が残る場合は `ok=false` | `checkPlaceholderDeps` → `runDoctor` |
| `placeholderDepsMessages` | `(result: PlaceholderDepsResult) => string[]` | `result` は `analyzePlaceholderDeps` の返り値 | `ok=true` のとき合格メッセージ (`checked=N, active L7 waits=0`) を返す; 違反時は最大 8 件のサンプル (`path:line`) を含む違反メッセージを返す | `checkPlaceholderDeps` → `runDoctor.messages` |

型定義:

```ts
interface PlaceholderDepsDoc { path: string; status: string; text: string }
interface PlaceholderDepsViolation { path: string; line: number; detail: string }
interface PlaceholderDepsResult { checked: number; violations: PlaceholderDepsViolation[]; ok: boolean }
```

共通 invariant: active status の判定は lowercase で行う。`placeholder_deps` が残存するドキュメントは design/test-design ともに対象。`analyzePlaceholderDeps` は純粋関数 (fs アクセスなし)。

### D.3 `src/lint/l7-completion.ts`

| 関数 (実 export) | signature | pre | post | doctor 配線 |
|---|---|---|---|---|
| `loadL7CompletionDocs` | `(root?: string) => L7CompletionDoc[]` | `root` 省略時は `process.cwd()`; 対象ディレクトリが存在しない場合は空 | `docs/design/harness/L4-basic-design/`, `L5-detailed-design/`, `L6-function-design/` を再帰 walk; path は repo root からの相対パスで正規化; sort 済みで返す | `checkL7Completion` 内部で呼ばれる |
| `classifyStaleL7Line` | `(line: string) => string \| null` | 任意の文字列行; 純粋関数 | L7 完了後も残存する陳腐化記述 (要約行が残作業を carry と述べる / orchestration 本体を未着手と述べる / CI 配線を後続へ送ると述べる / WBS 行が未完ステータスを保持する など計 6 パターン) を検出し分類メッセージを返す; 該当なし = `null` | `analyzeL7Completion` の内部ヘルパー (外部公開のみ、doc 配線なし) |
| `analyzeL7Completion` | `(docs: L7CompletionDoc[]) => L7CompletionResult` | `docs` は `loadL7CompletionDocs` の返り値相当; 純粋関数 | active status の doc 各行に対して `classifyStaleL7Line` を適用; 1 件でも陳腐化パターンが残存すれば `ok=false`; 対象 doc が 0 件のとき `checked=0` (警告扱い) | `checkL7Completion` → `runDoctor` |
| `l7CompletionMessages` | `(result: L7CompletionResult) => string[]` | `result` は `analyzeL7Completion` の返り値 | `ok=true` のとき合格メッセージ (`checked=N, stale L7 blockers=0`) を返す; 違反時は最大 8 件のサンプル (`path:line`) を含む違反メッセージを返す | `checkL7Completion` → `runDoctor.messages` |

型定義:

```ts
interface L7CompletionDoc { path: string; status: string; text: string }
interface L7CompletionViolation { path: string; line: number; detail: string; sample: string }
interface L7CompletionResult { checked: number; violations: L7CompletionViolation[]; ok: boolean }
```

共通 invariant: 対象スコープは L4-L6 design doc のみ (L7 PLAN 自体は対象外)。`classifyStaleL7Line` は正規表現マッチで判定し false-positive を避けるため `active design doc 内の WBS 表・モジュール一覧・サマリ行` に限定したパターンを使う。`analyzeL7Completion` は純粋関数。

### D.4 `src/lint/drive-db-registration.ts`

| 関数 (実 export) | signature | pre | post | doctor 配線 |
|---|---|---|---|---|
| `analyzeDriveDbRegistration` | `(stats: DriveDbRegistrationStats \| null) => DriveDbRegistrationResult` | `stats` は `.helix/harness.db` から呼び出し元が事前に取得したもの; `null` = DB 不在 or 読み取り失敗; 純粋関数 | `null` のとき `violations=[{reason:"missing_db"}]`, `ok=false`; stats が供給された場合は plan 登録数・drive runs・workflow/model/skill runs・hook events・必須 drive model 10 種 (`Discovery/Scrum/Reverse/Recovery/Incident/Refactor/Retrofit/Add-feature/version-up/Research`) の各存在を検査し、1 件でも欠落があれば `ok=false` | `checkDriveDbRegistration` → `runDoctor` |
| `driveDbRegistrationMessages` | `(result: DriveDbRegistrationResult) => string[]` | `result` は `analyzeDriveDbRegistration` の返り値 | `ok=false` のとき最大 8 件の違反理由サンプル (`reason[:mode][=count]`) を含む違反メッセージを返す; `ok=true` のとき全 stats を含む合格メッセージを返す | `checkDriveDbRegistration` → `runDoctor.messages` |

型定義:

```ts
interface DriveDbRegistrationStats {
  planCount: number; driveRuns: number; plansWithoutDriveRun: number;
  expectedPlanCount?: number; planRegistryFingerprint?: string; expectedPlanRegistryFingerprint?: string;
  workflowRuns: number; workflowOrphans: number; modelRuns: number; modelOrphans: number;
  skillRecommendations: number; skillRecommendationOrphans: number;
  skillInvocations: number; skillInvocationOrphans: number;
  registeredHookEvents: number; hookOrphans: number; modes: string[];
}
interface DriveDbRegistrationViolation {
  reason: "missing_db" | "empty_plan_registry" | "stale_plan_registry" | "stale_plan_registry_fingerprint"
        | "missing_drive_runs" | "plans_without_drive_run"
        | "missing_workflow_runs" | "workflow_orphans" | "missing_model_runs" | "model_orphans"
        | "missing_skill_recommendations" | "skill_recommendation_orphans"
        | "missing_skill_invocations" | "skill_invocation_orphans"
        | "missing_registered_hook_events" | "missing_required_mode";
  count?: number; mode?: string;
}
interface DriveDbRegistrationResult {
  stats: DriveDbRegistrationStats | null; violations: DriveDbRegistrationViolation[]; ok: boolean;
}
```

共通 invariant: `analyzeDriveDbRegistration` は純粋関数 (DB アクセスは呼び出し元の `checkDriveDbRegistration` が担う)。必須 drive model リスト (`Discovery/Scrum/Reverse/Recovery/Incident/Refactor/Retrofit/Add-feature/version-up/Research`) は実装内定数 `REQUIRED_DRIVE_MODELS` を単一正本とし、本契約の一覧はその写し。Forward は合流 spine、Verification は右腕 gate projection として DB に現れるが、この必須 drive model セットには含めない。orphan 検査は stats フィールドの正値チェックで行い、DB クエリを直接発行しない。

### D.5 `src/lint/fr-roadmap-coverage.ts`

parent PLAN = PLAN-L7-50。L6 契約なし着地分の後追い明文化。oracle ID 宣言は L7 oracle slice で別途行うため本サブセクションでは省略し、関数 signature + DbC + doctor 配線のみを記録する。

| 関数 (実 export) | signature | pre | post | doctor 配線 |
|---|---|---|---|---|
| `analyzeFrRoadmapCoverage` | `(docs: FrRoadmapCoverageDoc[]) => FrRoadmapCoverageResult` | `docs` は `loadFrRoadmapCoverageDocs` 等で事前に取得したもの; fs アクセスなし (純粋); `repoRoot` は `process.cwd()` で補完 | `FrRoadmapCoverageResult` を返す; `checked=docs.length`; 各 doc の残留 bucket テーブル (`## Residual Feature Buckets`) が存在しない場合 `violations` に `missing_section` を積む; 既定 bucket 集合 (R1〜R9) のうち doc 内に未出現のものは `missing_expected_bucket` として違反; 解決が特定できない open 行は `ambiguous_resolution` 違反; `closed` 行には closure evidence セクション (`## Residual Feature Closure Evidence`) の対照検査を行い、plan/source/test 各参照先の fs 実在を `process.cwd()` 基準で検証; 全 violations = 0 かつ open rows = 0 のとき `ok=true` | `checkFrRoadmapCoverage` → `runDoctor.ok` / `runDoctor.messages` |
| `analyzeFrRoadmapCoverageWithRoot` | `(docs: FrRoadmapCoverageDoc[], repoRoot: string) => FrRoadmapCoverageResult` | `docs` は取得済み; `repoRoot` は fs 実在確認の基点パス; `analyzeFrRoadmapCoverage` の実装委譲先 (repoRoot を明示渡し) | 同上; closure evidence の plan/source/test 参照先は `join(repoRoot, path)` で存在検証; `missing_evidence_file` 違反はファイルが実在しない場合に積む; 純粋性の例外 = fs 実在確認 (`existsSync`) を内部で呼ぶ | `checkFrRoadmapCoverage` の内部委譲先 |
| `loadFrRoadmapCoverageDocs` | `(repoRoot?: string) => FrRoadmapCoverageDoc[]` | `repoRoot` 省略時は `process.cwd()` を使用; fs 端点; 対象ファイルが存在しない場合は空配列を返す (fail-open) | `.helix/audit/A-133-upstream-vmodel-coverage-audit.md` を読み込み `FrRoadmapCoverageDoc[]` として返す; `file` フィールドは `join(".helix", "audit", "A-133-upstream-vmodel-coverage-audit.md")` (repo 相対) | `checkFrRoadmapCoverage` の唯一の fs 端点 |
| `frRoadmapCoverageMessages` | `(result: FrRoadmapCoverageResult) => string[]` | `result` は `analyzeFrRoadmapCoverage` / `analyzeFrRoadmapCoverageWithRoot` の返り値; 純粋関数 | `checked=0` のとき bucket テーブル不在を示す単一違反メッセージを返す; violations > 0 のとき最大 8 件のサンプル (`file[:bucket]:reason`) を含む違反メッセージを返す; open rows > 0 のとき status 別カウントと bucket 一覧を含むメッセージを返す; すべて解決済みのとき `OK (checked=N, buckets=N, closure=N)` 形式の合格メッセージを返す | `checkFrRoadmapCoverage` → `runDoctor.messages` |

型定義:

```ts
type FrRoadmapCoverageStatus = "closed" | "scheduled" | "parked" | "PO decision";

interface FrRoadmapCoverageDoc {
  file: string;    // repo 相対パス
  content: string; // ファイル全文
}

interface FrRoadmapCoverageRow {
  file: string; bucket: string; upstreamSource: string;
  currentRoute: string; vmodelState: string;
  requiredNextArtifact: string; status: FrRoadmapCoverageStatus;
}

interface FrRoadmapClosureEvidenceRow {
  file: string; bucket: string; planTarget: string;
  sourceTarget: string; testTarget: string;
  coverageGate: string; status: FrRoadmapCoverageStatus;
}

interface FrRoadmapCoverageViolation {
  file: string; bucket?: string;
  reason:
    | "missing_section" | "missing_table" | "malformed_row"
    | "missing_expected_bucket" | "missing_upstream_source"
    | "missing_current_route" | "missing_vmodel_state"
    | "missing_next_artifact" | "unknown_status" | "ambiguous_resolution"
    | "missing_closure_section" | "missing_closure_table"
    | "malformed_closure_row" | "missing_closure_evidence"
    | "missing_plan_target" | "missing_source_target"
    | "missing_test_target" | "missing_coverage_gate"
    | "missing_evidence_file" | "closure_status_mismatch";
}

interface FrRoadmapCoverageResult {
  checked: number; rows: FrRoadmapCoverageRow[];
  closureRows: FrRoadmapClosureEvidenceRow[];
  openRows: FrRoadmapCoverageRow[];
  violations: FrRoadmapCoverageViolation[]; ok: boolean;
}
```

doctor 配線 (src/doctor/index.ts):

`checkFrRoadmapCoverage(repoRoot)` が `loadFrRoadmapCoverageDocs(repoRoot)` → `analyzeFrRoadmapCoverageWithRoot(docs, repoRoot)` → `frRoadmapCoverageMessages(result)` の順に委譲し、`{ messages, ok }` を返す。`runDoctor` は line 974 で `frRoadmapCoverage = checkFrRoadmapCoverage(deps.repoRoot)` を呼び、`frRoadmapCoverage.ok` を全体 `ok` の AND 条件 (line 1014)、`frRoadmapCoverage.messages` を `doctor:` プレフィックス付きで全メッセージに展開 (line 1057) する。

共通 invariant: `analyzeFrRoadmapCoverage` / `analyzeFrRoadmapCoverageWithRoot` は純粋関数 (fs アクセスは `analyzeFrRoadmapCoverageWithRoot` 内の `existsSync` による closure evidence 存在確認のみ; doc 読み込み端点は `loadFrRoadmapCoverageDocs` に集約)。bucket 検査の対象集合 (R1〜R9) は実装内定数 `EXPECTED_BUCKETS` を単一正本とし、本契約の列挙はその写し。`normalizeStatus` はバッククォート除去後に `VALID_STATUSES` と照合し、不一致は `unknown_status` 違反とする。open bucket の解決文言は `RESOLUTION_PATTERN` 正規表現で検証し、パターン不一致は `ambiguous_resolution` 違反とする。`closed` 行には closure evidence の対照が必須であり、evidence 行が欠落する場合は `missing_closure_evidence` 違反として `ok=false` となる。

### D.6 `src/state-db/guardrail-invariants.ts` + guardrail advisory projection 追補 (PLAN-L7-52 C-1 option C, 2026-06-15)

parent PLAN = PLAN-L7-48 / PLAN-L7-52。L7-48 監査で唯一の機能リスク = guardrail 不変条件が本番経路で参照されない silent bypass。PO 承認の **option C (warn-first / 非ブロック)** を実装。不変条件ロジックを `src/state-db/guardrail-invariants.ts` に SSoT 抽出し、書込経路 (fail-close) と projection 経路 (warn-first) が共有する。state-db 配置は `guardrail ↔ state-db` の module cycle 回避のため (dependency-drift gate)。`src/guardrail/ledger.ts` は型と `inspectGuardrailInvariants` を re-export。

| 関数 (実 export) | signature | pre | post |
|---|---|---|---|
| `inspectGuardrailInvariants` | `(input: GuardrailDecisionInput) => GuardrailInvariantInspection` | 純粋関数; fs/DB アクセスなし; `isSecretLike` (state-db/index、SECRET_PATTERN SSoT) のみ参照 | `violations[]` を返す: ① `evidence_path` が secret 様 → `secret-evidence`、② `reviewer_model` と `worker_model` が両方定義済かつ一致 → `same-model-self-review` (空文字/undefined は非該当 = blank を self-review と誤判定しない)、③ `decision==="human-required"` かつ `evidence_path` 空 / `human_signoff_required` かつ `evidence_path` 空 → `human-required-without-evidence`。`normalizedDecision` は `normalizeDecision(input)` の結果 (self-review / human-required-without-evidence は `block`)。**書込経路と projection 経路の唯一の正本**。SECRET_PATTERN は各プレフィックス (sk-/ghp_/github_pat_/xox*) の後に最低 16 文字を要求する (実トークン最短 ~48 文字)。`assertNoSensitivePayload` は PK 列を secret パターン検査から除外する (PK = 構造化 ID、誤検知防止) |
| `recordGuardrailDecision` (ledger.ts) | `(db, input) => GuardrailDecisionRow` | DB 書込端点 | `inspectGuardrailInvariants` を呼び `secret-evidence` 違反があれば throw (fail-close); それ以外は `normalizedDecision` で `guardrail_decisions` に upsert; `block` 時は `findings` に `guardrail-block` (warn) を記録 |
| `projectGuardrailInvariantAdvisories` (projection-writer.ts) | `(db) => void` | `rebuildHarnessDb` 内で `projectReviewEvidenceRegistry` の後に呼ぶ (= CLI 再構築時、**非 API 前提に整合**); committed `review_evidence_registry` 行を読む | 各行を `GuardrailDecisionInput` (空 model は `undefined` 化) に写像し `inspectGuardrailInvariants` で検査; 各 violation を **非ブロックの advisory finding** (`kind=guardrail-invariant-advisory:<rule>`, severity=`warn`, source=`guardrail-invariant-advisory`) として `recordFinding`。subject は `advisorySubject(rule, reviewEvidenceId)` = `guardrail-self-review:<rule>:<sha1(12)>` で **plan-id-free** (readiness の `subject_id LIKE '%plan_id%'` に非合致 → automation readiness を flip しない); 追跡用 plan 参照は `evidence_path` に保持 (readiness は evidence_path を走査しない)。projected decision は不変 |

不変条件: option C は authz outcome を一切変えない (advisory のみ)。実ブロックする **hard-gate (option A)** は authorization/human-signoff の仕様確定に該当し PO 留保 (CLAUDE.md Guard Rule)。advisory は warn-first phased rollout の Phase 0 (descent-obligation §7 と同型)。U-* = IT-GUARDRAIL-ADVISORY-01。`same-model-self-review` の空文字非該当は blank evidence の false-positive を防ぐための必須不変条件。

## 2026-06-17 Cost-tiered dual-provider role router 追補 (PLAN-L7-75 back-fill)

この追補は §7.8.7.1 (hybrid 機能分散 MUST) / §1.8 (VALID_ROLES) / FR-L1-39 (classifyTask) を
L6 機能契約へ降ろし、PLAN-L7-75 で実装した `src/task/tier-router.ts` の Forward 設計を back-fill する
(drive=agent / kind=impl の bottom-up 実装に対する設計同期)。役割をコスト階層 (T0/T1/T2) × 2 provider
(claude/codex) で配置し、原則安く・上位帯は明示許可ゲートに保つ。task module 配下に置き、`task→team` の
import edge を一方向 (acyclic) に保つ (cycle 回避は dependency-drift gate が機械強制)。

3 archetype (役割の根本種別): **相談 (consult)** = tl/uiux (上位帯エスカレーション・プランナー、read-only)、
**ワーカー (worker)** = se/docs (実装・文書、下位帯)、**検証 (verify)** = qa (テスト通過後カバレッジ相談、上位帯)。
ティア表 `TIER_TABLE`: T0 = `{claude: claude-opus-4-8, codex: gpt-5.5}` (フロンティア/明示許可)、
T1 = `{claude: claude-sonnet-4-6, codex: gpt-5.4}` (ワーカー専門)、T2 = `{claude: claude-haiku-4-5,
codex: gpt-5.3-codex-spark}` (ワーカー軽量)。

**モデル id 単一正本 (`MODEL_IDS`、PLAN-L7-58 carry 解消)**: model id 文字列の正本は `src/team/model-policy.ts`
の `MODEL_IDS` カタログ 1 箇所であり、`TIER_TABLE` (tier-router) と `modelForProvider` (model-policy) は
両方ともこの catalog を参照して合成する。従来は両者が同じ id literal を二重に持ち typo/drift の温床だった。
`MODEL_IDS.codex.frontier` = `gpt-5.5` (= `TIER_TABLE.T0.codex` = `modelForProvider` "frontier" family) のように
1 値 1 定義へ収束させた。oracle U-MODELID-001..004 が「合成一致」と「生 literal 不在」を fail-close で検査する
(価格表 `src/state-db/token-tracker.ts` は外部 pricing 由来の superset で別正本、統合対象外)。

| 関数 (実 export) | signature | pre | post | invariant | oracle |
|---|---|---|---|---|---|
| `tierFor` | `(role: RouterRole, difficulty: TaskDifficulty, riskFlags: string[]) => Tier` | role は 5 役 (tl/qa/uiux/se/docs) | archetype が帯を決める: 相談/検証 = T0、ワーカー = (trivial/simple かつ risk 無 → T2、それ以外 → T1) | ワーカーは T0 に到達しない (原則安く) | U-TIER-001/002 |
| `resolveModel` | `(role: RouterRole, tier: Tier, provider: Provider) => string` | tier 確定済 | `TIER_TABLE[tier][provider]` を返す | ワーカー role + T0 は throw (fail-close 不変条件) | U-TIER-003 |
| `route` | `(input: RouteInput, detection: RuntimeDetection, options?: RouteOptions) => RoutingDecision` | task は classifyTask 可能 | 役割を実 provider へ配置 (ワーカー=創出側/主、相談・検証=判断側/相手) し tier モデルを解決。主 provider = `options.primary ?? detection.currentRuntime ?? "claude"` | T0 は指名フロンティア role (tl/qa/uiux) かつ `auth.explicit` でのみ ready、それ以外は `model=null` で `blocked-needs-approval` (明示許可ゲート) | U-TIER-005/006/007/009/010/012 |
| `assignCross` | `(detection: RuntimeDetection, primary?: Provider) => CrossAssign` | detection.mode 既知 | hybrid → `{execution: primary, judgement: other(primary), review_kind: cross_agent}`、単一 runtime → 同 provider + `intra_runtime_subagent` | hybrid は execution≠judgement (連携状態は実装と検証を別 provider にする、一致なら throw) | U-TIER-008 |
| `routeToAdapterPlan` | `(decision: RoutingDecision, task: string, mode: ExecutionMode) => AdapterPlan \| null` | decision 生成済 | ready → 配置済 provider の adapter 実行プラン (command/args)、blocked → null | blocked (T0 未承認) は実行不可 = null (fail-close) | U-TIER-011 |
| `routeTeamMembers` | `(members: {role; task}[], detection: RuntimeDetection, options?: RouteOptions) => TeamMemberRouting[]` | member は role+task を持つ | RouterRole member を route し決定を返す。非 RouterRole (po/aim) は `routed=false` で engine fallback | team run の placement へ流すと worker=主 / 相談・検証=相手 のクロス配置が実 spawn を駆動する | U-TIER-013/014/015 |
| `roster` | `() => RosterBinding[]` | なし | 5 役 × 2 provider の対称ビュー (ワーカー既定 T2、相談/検証 T0) | claude/codex は同一 role・同一 archetype で対称 (GPT も Claude と同設定) | U-TIER-004 |

team 統合 (PLAN-L7-75 §2): `helix team run --route` は `routeTeamMembers` の決定を per-member
`MemberPlacement` (配置 provider / tier モデル / フロンティアゲート `blockedReason`) に写像し
`buildTeamRunPlan` に注入する。placement は YAML engine 既定を上書きし、`validateTeamRun` は配置済み
provider で hybrid の worker≠reviewer 分離を検証する。T0 の相談・検証 member は `--allow-frontier`
なしで fail-close (exit 1)。router は `src/task/` に置き CLI 合成点で配線する (team→task import を作らない =
`task→team` 一方向を維持、dependency-drift cycles 0)。

invariant 要約: archetype が帯を決める / ワーカーは T0 に絶対到達しない (fail-close) / T0 は明示許可ゲート /
hybrid は実装と検証を別 provider / Codex は Claude と対称。U-* family = U-TIER-001..015。

## 2026-06-19 skill suggest free-text surface 追補 (A-138 ITEM-2)

FR-L1-12 (`suggestSkillInjection`) / FR-L1-47 (`recommendSkills`) の公開 CLI `helix skill suggest` は
従来 `--plan <id>` (harness.db `plan_registry` 文脈) のみだった。**additive 拡張** (cross_agent TL/Codex 裏取り済)
として **`--text <自由文>`** を足し、未登録タスクからも suggest 可能にする。

- `recommendSkillsForText(db, taskText)`: `classifyTask` (FR-L1-39) で kind/drive/risk を導き、
  synthetic `SkillScoringContext` (`layer=""` / `workflowMode = workflowModeForKind(kind)`) を作って
  PLAN 版と同じ `rankSkills` に通す。`scoreSkill` は `SkillScoringContext` (layer/drive/workflowMode) を取り、
  PLAN 版・text 版で共有 (重複排除)。`reference` は `text:<slug>` sentinel。
- **契約不変**: 既定出力は現行 flat ranked rows (rank/score/reason) を維持。
  `--plan` / `--text` は **相互排他** (どちらか一方必須、両方/無は exit 1)。`--record` は **`--plan` 専用**
  (未登録 text を DB へ書かない、fail-close)。後方互換: 既存 `--plan` 呼び出し・既定出力は不変。
- **3-bucket 出力 (`--buckets`、A-138 ITEM-2 PO 残課題 → PO「TL 結果に合わせる」で確定)**: flat ranked rows を
  `bucketRecommendations` で **required / recommended / optional** に再編成する **additive view**。score band を正本と
  する閾値 `SKILL_BUCKET_THRESHOLDS` = required ≥ 0.8 (layer+drive_model 双方一致 = gate/workflow 直結) /
  recommended ≥ 0.5 (品質寄与) / それ未満 = optional (補助)。`--buckets` 無指定時は flat (既定不変)。
  TL(Codex) 素案の bucket 名・意味論を採用、閾値は scoreSkill の加点設計に対応。oracle: skill-recommend
  bucketRecommendations test。
- `skills→task` import は一方向 (dependency-drift cycles 0)。oracle: `tests/skill-recommend.test.ts`
  (recommendSkillsForText の flat-list + risk reason)。`workflowModeForKind`: reverse→Reverse / poc→Discovery /
  refactor→Refactor / troubleshoot→Recovery / それ以外→Forward。

## 2026-07-05 skill scaffold generator 追補 (PLAN-L7-317)

- `scaffoldSkill(input)` は `SkillScaffoldInput { name, category, layers, driveModels, domainTags?, description? }`
  から `SkillScaffoldResult { ok, path, content, metadata, findings }` を返す pure generator である。
- `path` は `docs/skills/<slug>.md`、`content` は `schema_version: skill.v1` と
  `applies_to.layers / applies_to.drive_models` を持つ markdown skill doc とする。
- self-lint は `src/lint/skill-assignment.ts` の `VALID_SKILL_TYPES` / `VALID_SKILL_LAYERS` /
  `VALID_SKILL_DRIVE_MODELS` と `analyzeSkillAssignments` を再利用し、不正 category / layer / drive model を
  `findings` として返す。
- generator は filesystem へ書かない。file write は CLI 境界 (`skill create --write`) の責務であり、
  既定は JSON/text scaffold preview の no-write、既存 file は `--force` 無しで拒否する。recommendation /
  telemetry logic は変更しない。oracle: `tests/skill-scaffold.test.ts` と `tests/skill-scaffold-cli.test.ts`。
## 2026-06-23 dynamic skill injection materialization 追補 (PLAN-L7-135)

FR-L1-12 / FR-L1-47 は recommendation row だけでは close しない。runtime contract は 2 段階である。

- `buildSkillInjectionSet(db, recommendations, { generatedAt? })` は
  `SkillInjectionSet { plan_id, generated_at, entries[], required_paths[], optional_paths[], missing_skill_ids[] }` という manifest を返す。entry は `skill_id`、
  `skill_path`、`tier` (`required|recommended|optional`)、`inject_at`
  (`before_work|on_demand`)、`reason`、`rank`、`score` を持つ。
- `buildAdapterPlan(intent, mode)` は `contextInjection` を受け取り、scoped path を
  `HELIX context injection` として provider stdin に追加する。Codex と Claude は同じ adapter contract を共有する。
  argv は固定 command flag のままであり、prompt body や skill body を運ばない。

CLI wiring:

- `helix skill suggest --plan <id> --inject --json` は manifest を出力する。`--record` も指定されていない限り DB row は書かない。
- `helix codex|claude --plan <id> ...` は `harness.db` projection から skill injection を解決し、adapter plan へ渡す。
- `helix team run --plan <id> ...` は同じ injection を各 runtime member adapter へ渡し、worker/reviewer provider separation を保つ。
- `helix task route --plan <path> --execute` は PLAN file から `plan_id` を抽出し、同じ injection manifest を解決し、cost-tier routing 後に `routeToAdapterPlan(..., { contextInjection })` へ渡す。

## 2026-06-23 Linux/POSIX wrapper readiness 追補

Runtime entrypoint は TypeScript/Bun first のままとし、OS wrapper は薄く保つ。
`scripts/helix` は Linux/POSIX `sh` entrypoint である。`set -e` を有効化し、
compiled binary が存在する場合は `dist/helix` を実行し、存在しない場合は
`bun run "$ROOT/src/cli.ts" "$@"` へ fallback する。この wrapper は Bash-only syntax、
Python runtime dispatch、legacy runtime name を導入してはならない。

`helix codex|claude --plan` の dynamic skill context injection は runtime startup 時の opportunistic な処理である。
現在の working tree が harness DB projection を rebuild できない場合（例: hook / adapter smoke test 用の temp repo）、
adapter execution は `HELIX context injection` block なしで継続する。task prompt と lifecycle digest は通常どおり完了する。
missing injection は adapter launch failure ではなく、context absence として観測可能にする。

## 2026-06-23 artifact progress workflow trigger 追補

`deriveArtifactProgressDecision(input)` は static test link だけでなく、test-run と dependency-check evidence を使う。

- `red`: dependency check が欠落、または open dependency impact が残っている。
- `yellow`: recovery が active、linked test が無い、または linked test はあるが passing `test_runs` row が接続されていない。
- `green`: linked passing `test_runs` row が 1 件以上あり、dependency impact が clean と検査済みである。

`projectArtifactProgress(db, graph)` は file-backed な source/design/test-design/plan/requirement node を投影する。
`dependency_check_run_id`、`dependency_checked_at`、`passed_test_run_ids`、`passed_test_run_count`、
`recovery_plan_ids` を記録する。projection は rebuildable な `artifact_progress_events` row も書き、
red/yellow row を `source_table="artifact_progress"` として `feedback_events` へ mirror する。
これにより workflow routing は DB state から開始できる。

## 2026-06-30 L7 feature-pack roadmap 追補 (PLAN-L7-207)

roadmap progress は gate と span を数えるだけでは不十分である。L7 は semantic responsibility pack も expose し、
implementation volume だけでなく feature list に対して作業を確認できるようにする必要がある。

`roadmapSchema` は roadmap frontmatter contract を拡張する。

- `feature_packs[]`: `{ id, name, layer, exit_criteria, owns }` の optional array。
  `layer` は `database`、`service`、`frontend`、`ui`、`runtime`、
  `verification`、`integration`、`docs` のいずれかである。
- `span.feature_pack`: 宣言済み `feature_packs[].id` を指す optional string reference。
- `validateRoadmapStructure(roadmap)` は gate structure issue に加えて、
  `duplicate-feature-pack` と `unknown-feature-pack` を報告する。

`analyzeL7FeaturePackCoverage(records, requiredLayers?)` は loaded roadmap record に対する pure function である。
`roadmap.layer === "L7"` を filter し、宣言済み feature pack を集約して次を返す。

```ts
interface L7FeaturePackCoverageResult {
  ok: boolean;
  requiredLayers: Array<"database" | "service" | "frontend" | "ui">;
  missingLayers: Array<"database" | "service" | "frontend" | "ui">;
  packs: Array<{
    planId: string;
    file: string;
    id: string;
    name: string;
    layer: RoadmapFeaturePackLayer;
    spanCount: number;
  }>;
  recordsChecked: number;
}
```

既定の required layer は `database`、`service`、`frontend`、`ui` である。
この function は PLAN `drive` から pack を推論してはならない。pack は explicit roadmap semantics である。
`l7FeaturePackCoverageMessages(result)` が doctor surface を出力し、`checkRoadmap(repoRoot)` は結果を `runDoctor.ok` に含める。

不変条件: DB または frontend read-model pack は UI pack を close できない。
deferred UI work は、component-derived UI implementation PLAN が confirmed になるまで `ui` pack span として表示され続ける。
