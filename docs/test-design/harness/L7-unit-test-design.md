---
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/
parent_doc: docs/plans/PLAN-L6-00-master.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l6_function_spec: docs/design/harness/L6-function-design/function-spec.md
related_l6_edge_case: docs/design/harness/L6-function-design/edge-case.md
next_pair_freeze: L6
v2_import: docs/migration/v2-import-ledger.md
created: 2026-05-29
updated: 2026-05-29
---

## 2026-06-09 L6 pair-scope 追補

以下の歴史的 pair 記述は、L6 に `function-spec` と `edge-case` だけがあった時点で書かれていた。G6 readiness では、現在の L6 pair scope（ペア範囲）は add-design slice PLAN-L6-03..21 を含む `docs/design/harness/L6-function-design/*.md` ディレクトリ全体である。

この L7 文書は L6 の単一 pair artifact のままであり、`docs/plans/PLAN-L6-00-master.md` の "L6 completion scope addendum"（L6 完了範囲追補）に列挙された全 L6 design artifact に対して U-* oracle family を持たなければならない。

追加の SQLite/reference-feedback/search/drive-log/skill-metric 要件は、`docs/design/harness/L6-function-design/fr-unit-coverage.md` と本書末尾に追加した U-FR-L1-* 行で覆う。これは function-design contract の coverage（機能設計 contract の被覆）であり、全ての L7 実装テストが既に存在する証明ではない。

# HELIX — L7 単体テスト設計 (④ / U-*)

> **legacy shim（2026-07-08）**: 現行 HELIX では L8 が単体テスト設計の正本である。本書は既存 U-* oracle の移行元として保持し、新規 L7 impl PLAN の `pair_artifact` には `docs/test-design/harness/L8-unit-test-design.md` を使う。
> **layer (作成層 = V-pair key)**: L6 (機能設計) / **executed_at_layer (実施層)**: L7 (単体テスト — 実装スプリント内で TDD Red 先行) / **artifact**: ④ テスト設計 (V-model 右、② L6 機能設計 と対)
> **pair (V-model L6↔L7)**: `docs/design/harness/L6-function-design/{function-spec,edge-case}.md` 2 sub-doc ↔ 本書 1 doc
> **status correction (2026-06-09 / A-118)**: frontmatter status は `confirmed`。下部の歴史的な "draft / placeholder skeleton" 表現は、上記 L6 pair-scope 追補と現行 L6 design docs 全件へ追加した U-* oracle family により置き換え済みである。残る実装詳細の展開は L7 carry であり、Phase 2 pair の未完成ではない。
> **PLAN**: `docs/plans/PLAN-L6-{01,02}-*.md` の pair_artifact / DoD で本書参照
> **特殊性**: L6↔L7 は最短ペア。L7 は単体テスト設計と実装スプリントが同層 — 本書 U-* は L7 entry で先行 ④ テストコード (TDD Red、§1.10 line 671) に変換される oracle。

## §0 量閉じ原則 (L6 ↔ L7)

L6 機能設計の各**関数 signature + DbC + edge** が L7 単体テスト (U-*) で被覆されること (孤児 = 0)。DbC 契約から test oracle を導出 (document-system-map §3)。

- **function-spec §1/§2**: 関数 signature + pre/post + pseudocode → 契約遵守 U-* 必須
- **function-spec §4**: rule engine 10 型 (IMP-033) → rule 単位 U-* 必須
- **edge-case**: `@edge-normal/error/boundary/throws` (4 観点) → edge 単位 U-* 必須
- 孤児 = 0 (`helix vmodel lint` の edge 5-8 照合に接続)

## §0.1 テスト戦略と検証戦略の分離

本書の主責務は L6⇔L7 の **テスト戦略**である。つまり、関数契約・DbC・edge をどの U-* oracle
で Red/Green にするかを固定する。

ただし、runtime behavior（実行時 behavior）を主張する機能は、単体テスト green だけでは完了しない。`fired` / `used` /
`works` / `blocked` / `recovered` / `observed` など実走で反証可能な claim（主張）は **検証戦略**を別に持つ。
検証戦略は L7.5 RUN & Debug phase で実 adapter/runtime を動かし、実 `session_id`、実 `source`、
実 command / adapter surface、timestamp、evidence path を捕捉してから trace-freeze / review / accept に渡す。
projection-only telemetry は trace 補助であり、実 runtime provenance の代替として accept しない。

## §0.2 可視化 read-model の検証戦略

L1 §2.8 の Asset / progress visualization は、Webview の見た目ではなく **deterministic response contract（決定論的応答 contract）** を先に
検証する。UI は `helix progress snapshot --json` の `VisualizationSnapshot` を読むだけで、LLM 生成 summary を
正本にしない。検証戦略は以下:

- DB projection が同一なら snapshot は byte-level JSON shape（byte-level の JSON 形状）と数値が安定する。
- cold-start は失敗や fabricated success（捏造された成功）ではなく zero counts + warning を返す。
- `runtime_verification_events.verification_class` は `runtime_verified` / `projection_only_unverified` /
  `missing_runtime_provenance` を分離し、`accept_status=accepted` のみ accepted runtime evidence として数える。
- accepted runtime evidence は `verification_class="runtime_verified" AND accept_status="accepted"` の交差であり、
  projection-only 行が誤って `accept_status=accepted` を持っても accepted runtime verification には入れない。
- drill-down は CLI command / table pointer に限定し、provider transcript・secret・machine-local absolute path を保持しない。

| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-VISUAL-001 | `buildVisualizationSnapshot` | artifact progress / plan status / gate status / graph node-edge / test runs / skill-model-guardrail counts を既存 harness.db projection から deterministically 集計し、同一 DB 入力で同一 snapshot を返す。cold-start は zero counts + rebuild warning。 |
| U-VISUAL-002 | `buildVisualizationSnapshot` + `helix progress snapshot --json` | `projection_only_unverified` と `missing_runtime_provenance` は runtime verified / accepted に混入しない。特に `verification_class!="runtime_verified"` なら `accept_status="accepted"` でも accepted count は増えない。CLI JSON は `schema_version=\"visualization-snapshot.v1\"` と drill-down pointer を返し、read-only で schema/source を変更しない。 |
| U-VISUAL-003 | `buildVisualizationSnapshot` + `buildVmodelFitReport` + VSCode Project Tree View | `close_ready` の `.helix/tmp/closure/close_ready-decision-draft.yml` は recovery handoff artifact として検出され、`reviewed_count`、closure review の `approval_scope_digest`、`pending_human_review` / `approve_closure_claim` / rejection outcome を read-only に表示する。Tree View は artifact path / generation command / scope status を copy pointer と tooltip に出し、`vmodel-fit/recovery-handoff` と `drive/recovery-plan/handoff-gate` を approval lane へ投影するが、承認や apply は実行しない。 |

## §0.3 完了判断 packet の検証戦略

whole-program / L14 全件達成 claim は doctor green では閉じない。`outstanding.completionReadiness` から生成した
decision packet を PO/S4 判断・version-up activation・不可逆 migration signoff の入力にする場合、packet 自体の
鮮度、出所、shape（形状）が検証済みでなければならない。古いチャット転記や生成元不明の packet は判断材料にしない。

| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-OUTSTANDING-001 | `completionDecisionPacketForOutstanding` | `outstanding.completionReadiness` の `ok/status/blockers` を保持し、非終端 PLAN を decision item に変換する。packet top-level は `authorityBoundary` / `humanDecisionRequired` / `humanDecisionBlockers[]` / `workflowStateBlockers[]` / `autonomousWorkBlockers[]` / `nextAuthority` を持ち、PO/S4 判断、action-binding approval、version-up activation、不可逆 cutover が残る場合は `human_decision_required` として通常の自律作業から分離する。`non_terminal_plans` は workflow 状態 blocker として分離し、直接処理できる自律作業 blocker と混ぜない。packet top-level は `semanticMeaningSummary`、`semanticFeatureFrontierRecords[]`、`confirmedCurrentMeaningRecords[]` も持ち、completion decision packet 単体で pending frontier 件数、confirmed-current 11 意味単位、L3/L12 source path、`completionClaimAllowed` を確認できる。現行の confirmed overlay frontier は `confirmed_overlay_frontier_count=0`、live completion frontier は `live_semantic_frontier_count=2` であり、`frontier_pending_decision` / `parked_future_version` / `approval_gated_cutover` を判断 vocabulary として保持する。さらに `humanReviewBundle` は decision item の順序、scoped primary packet、repo-local runnable scoped packet、supporting scoped packet、必須 record、PO 向け required action / review route、`ownerReviewFields[]`、`timingReviewFields[]`、`freshnessReviewFields[]`、`safetyReviewFields[]` を束ね、未終端 frontier の判断材料を人間が個別 JSON を推測して集める状態に戻さない。owner/timing/freshness field は `requiredRecords[].fields` から `recordName.field` として導出し、誰が・いつまでに・どの snapshot/source freshness を見るかを record 名付きで示す。safety field は dedicated packet の required review fields から `schemaVersion.field` として導出し、plan-only / must-not / allowed=false / approval gate 必須条件を completion packet だけで確認できるようにする。各 item は decision kind、required evidence、allowed outcomes、next workflow route、主導線の `decisionPacketCommand`、全 blocker 用の `packetCommands` を持ち、doctor green を completion ready に読み替えない。複数 blocker を持つ PLAN は primary `requiredAction` だけでなく、全 blocker の `requiredActions` / `requiredEvidence` / `packetCommands` を保持する。`po_decision_pending` は PoC S3/S4/S4 decision 文脈に限定し、version-up / L14 cutover の汎用 PO signoff に S4 evidence を混入させない。`.helix/state/project-setup.json` が `consumer_setup_readiness_not_whole_program_completion` / `completionClaimAllowed=false` を持つ consumer repo では、`CONSUMER-SETUP-BOUNDARY` / `consumer_setup_boundary` decision と `consumer_setup_boundary_record` を返し、setup ready を whole-program completion に読み替えない。 |
| U-OUTSTANDING-002 | `analyzeCompletionDecisionPacket` | `generatedFrom`、`ok/status` 整合、`generatedAt`、allowed `sourceCommand`、freshness policy/window/`expiresAt`、computed stale flag、blocker set と `authorityBoundary` / `humanDecisionRequired` / `humanDecisionBlockers[]` / `workflowStateBlockers[]` / `autonomousWorkBlockers[]` / `nextAuthority` の整合、`decisionCount`、blocker reason に対応する `decisionKind` / `decisionPacketCommand` / `packetCommands` / `scopedDecisionPacketCommand` / `scopedPacketCommands` / `runnableDecisionPacketCommand` / `runnablePacketCommands` / `runnableScopedDecisionPacketCommand` / `runnableScopedPacketCommands` を検査し、stale / unknown source / hidden human authority boundary / workflow-state/autonomous blocker drift / packet command drift / scoped command drift / runnable command drift / shape drift を fail-close する。`humanReviewBundle` も packet status/source/generatedAt/decisionCount/nextAuthority/completionClaimAllowed と各 decision の planId/kind/blocker/scoped command/runnable command/required record/review route、および required record fields から導出される `ownerReviewFields[]` / `timingReviewFields[]` / `freshnessReviewFields[]`、dedicated packet summary から導出される `safetyReviewFields[]` へ一致しなければ fail-close し、人間レビュー用 summary だけが古い packet command、別 PLAN、owner/期限/source freshness、または no-apply safety 境界の確認 field 欠落を指す状態を許可しない。base command が正しくても `--plan <PLAN_ID>` 付き導線が欠落・誤 PLAN・未 scoped の packet、または repo-local `bun run helix ...` 導線が欠落した packet は、複数 pending PLAN や PATH 未設定環境で PO が対象や実行方法を推測する状態に戻すため fail-close する。S4 / version-up / action-binding の scoped packet CLI は対象 PLAN が存在しない場合に空配列 success を返さず、JSON/text とも exit 1、`reason=plan_not_matched` として古い PLAN ID や別 PLAN の scoped command 流用を止める。 |
| U-OUTSTANDING-002a | `completionReadinessLine` + `helix status` / `helix handover status` text | text surface も JSON と同じ `authority-blockers=human:<...> workflow-state:<...> automation:<...>` を表示する。`non_terminal_plans` を workflow-state として表示し、直接処理できる自律作業が無い場合は `automation:none` と出すため、PO 向け status/handover を見ただけでも「AI がまだ勝手に片付けるべき作業が残っている」という誤読を避けられる。 |
| U-OUTSTANDING-003 | `checkCompletionDecisionPacket` + `helix doctor` | live repo の standalone `helix completion decision-packet --json` 相当 packet は fresh として通し、repo root 不在や packet lint violation は doctor hard gate violation として出す。さらに completion packet の `packetCommands[]` が指す S4 / version-up / rename / action-binding の live 専用 packet を doctor bridge で生成し、対象 PLAN の packet が存在しない、または専用 verification/runbook command validator が fail する場合も fail-close する。completion packet の summary 宣言だけが正しく、実体 packet / matrix / runbook が drift した状態を completion-ready へ読み替えない。 |
| U-OUTSTANDING-004 | `workflowNextActionForOutstanding` / `workflowNextActionsForOutstanding` + `helix status --json` / `helix handover status` | runtime `nextAction` は mode/judgment-gate guidance のまま保持し、互換 alias として `runtimeNextAction` を返す。whole-program/L14 の次アクションは `workflowNextAction` と `completionNextAction` に分離し、blocked status JSON では `completionNextAction === workflowNextAction`、`runtimeNextAction === nextAction` でなければならない。text status は曖昧な `next:` 行を出さず、`runtime-next:` と `completion-next:` を出すため、`cross-review-ready` を PO/S4・version-up・L14 cutover blocker 解消済みと誤読しない。未了 blocker がある場合は `completion-blocked:`、未了なしの場合だけ `completion-ready:` を返す。複数 blocker では PO/S4 decision → version-up activation → L14 cutover signoff → generic human/active-draft の優先順で top action を選ぶ。さらに `workflowNextActions[]` が全 blocker queue を返し、各 item は `order` / `planId` / `reason` / `decisionKind` / `requiredAction` / `requiredEvidence` / `nextWorkflowRoute` / 主導線の `decisionPacketCommand` / repo-local 主導線の `runnableDecisionPacketCommand` / 全 blocker 用の `packetCommands` / `runnablePacketCommands` / scoped と runnable scoped の packet commands / `supportingPacketSummaries[]` を持つ。`supportingPacketSummaries[]` は command、runnableCommand、scopedCommand、runnableScopedCommand、schemaVersion、matrixField、expectedMatrixCount、requiredReviewFields、requiredMatrixFields、reviewRoute を持ち、status だけで S4 / version-up / rename / action-binding packet の検証 matrix と review field へ辿れる。`requiredMatrixFields` は sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision / adoptionDecisionDelta / workflowRouteImpact を要求し、公式 source の状態差分・採否差分・workflow route 影響を summary で落とさない。S4 summary は `decisionVerificationCommandMatrix.command` / `decisionVerificationCommandMatrix.writePolicy` / `decisionVerificationCommandMatrix.evidence` を含め、PO/S4 判断前に再実行すべき検証 command と no-write 境界を summary から落とさない。version-up activation の summary は `requiredReviewFields` に `activationSnapshot` / `externalRehearsalPlan` / `costGuardrails` / `securityChecklistPacket.securityChecks` / `blockedReasons` だけでなく、`activationDecision.activation_snapshot_id`、`activationReadinessChecks.evidence`、`activationSnapshot.versionDryRunDigest`、`versionDryRunEvidence.releaseTriggerResolved`、`securityChecklistPacket.securityChecks.workflowRouteImpact`、`reapprovalTriggers.requiredAction` などの具体 field も含め、status だけで承認前 snapshot・SemVer dry-run・release tag 解決・rehearsal・外部 limit・security source metadata・blocker へ辿れる。rename/cutover summary も `cutoverSnapshot` / `blockedReasons` を含め、snapshot digest 群と apply blocker を summary から落とさない。text status と handover status の `workflow-next-action` 行も `requiredAction` / `requiredActionJa` と `nextWorkflowRoute` / `nextWorkflowRouteJa`、`action-id`、`route-id`、scoped primary packet、scoped supporting packet を出し、`runnable-workflow-next-action` 行で `bun run helix ...` 導線を出し、`packet-summary:` 行で matrix/review/source-delta 要件と runnable/scoped command を出すため、JSON を開かなくても次に記録すべき判断・route・再生成 command が欠落しない。PO/S4 は `helix s4 decision-packet --json --plan <PLAN_ID>` と `bun run helix s4 decision-packet --json --plan <PLAN_ID>`、version-up は activation packet、不可逆 rename/cutover は singleton rename plan、action-binding は approval packet を指し、top 1 件だけで version-up、L14 cutover、action-binding approval を隠さない。 |
| U-OUTSTANDING-005 | `completionDecisionPacketForOutstanding` + `analyzeCompletionDecisionPacket` | 各 required record は `recordTemplates[]` に同名の copyable YAML block を持つ。template は `recordName:` header、非空 `insertionHint`、全 required field の `- field:` 行を含む。さらに人間判断用の `insertionHintJa` と `yamlLinesJa[]` を持ち、各 required field を日本語 guidance 付きで列挙する。template 欠落、field 欠落、日本語 guidance 欠落は packet lint violation として fail-close し、PO/人間判断が prose-only requiredEvidence や英語 template だけに戻らない。 |
| U-OUTSTANDING-006 | `analyzeCompletionDecisionPacket` repo-aware source path / source ledger audit | `requiredRecords[].sourcePaths[]` は repo-relative で、`..` / absolute path / drive-letter path を含まない。source-ledger-backed record は `sourceLedgerChecks[]` を持ち、各 entry の `sourcePath` は `sourcePaths[]` 内にあり、doctor / handover gate は repo-aware `sourceText` を渡して ledger label の `checked YYYY-MM-DD` 欠落、未来日、90 日超 stale を `invalid_required_record_source_ledger` として fail-close する。live repo packet は `docs/process/modes/*` / `docs/process/forward/*` の実在正本と fresh ledger に接続して通る。 |
| U-OUTSTANDING-007 | `completionDecisionPacketForOutstanding` + `analyzeCompletionDecisionPacket` template guidance audit | `recordTemplates[]` は field だけでなく、record ごとの意味契約を示す guidance を持つ。S4 は confirmed/rejected/pivot と Forward/Reverse/archive route、version-up は add-feature/Forward・reject/archive・review_by/dry-run/rollback、cutover は frozen HEAD/quiet window/single-run/drift re-approval/rollback/state backup/monitoring、action-binding は limited actor/tool/target/params・dry-run/risk・expiry・approver/action/result/incident を示さなければならない。field を全て持つだけの弱い template は fail-close する。 |
| U-OUTSTANDING-008 | `analyzeCompletionDecisionPacket` record outcome/route semantic audit | `allowedOutcomesByRecord[]` は非空ならよいのではなく、record 名ごとの canonical outcome 集合と一致しなければならない。`nextWorkflowRoutesByRecord[]` も非空ならよいのではなく、S4 / version-up / parked review / cutover / action-binding / terminal evidence ごとの canonical route guidance を含む。未知 outcome 混入、必須 outcome 欠落、または route 意味の欠落は fail-close する。 |
| U-OUTSTANDING-009 | `analyzeCompletionDecisionPacket` record metadata set audit | `requiredRecords[]` の recordName 集合は `blockerReason + blockers[]` から導かれる必須 record 集合と一致しなければならない。`requiredRecords[]` / `allowedOutcomesByRecord[]` / `nextWorkflowRoutesByRecord[]` / `recordTemplates[]` の recordName 集合も一対一でなければならない。同名重複、supporting blocker 由来 record の欠落、required record に無い余剰 record metadata は、どの record が判断対象か曖昧にするため fail-close する。 |
| U-OUTSTANDING-010 | `analyzeCompletionDecisionPacket` top-level decision semantic audit | decision item 直下の `decisionKind` / `allowedOutcomes` / `nextWorkflowRoute` は primary `blockerReason` と一致しなければならない。record-level metadata が正しくても、top-level decision が別 blocker の kind/outcome/route を示す packet は PO/人間判断の入口を誤らせるため fail-close する。 |
| U-OUTSTANDING-011 | `buildS4DecisionPackets` / `buildVersionUpActivationPackets` / `buildActionBindingApprovalPackets` / `buildIdentifierRenameCutoverPlan` | 専用 packet は自分の判断種別だけで閉じず、同一 PLAN の sibling blocker を `relatedDecisionPackets[]` に保持する。各 related packet は base `command` だけでなく `scopedCommand` を持ち、S4 / version-up / action-binding は `--plan <PLAN_ID>` で対象 PLAN を固定し、rename は singleton `helix rename plan --json` として固定する。さらに S4 / version-up / rename packet は `semanticFeatureFrontierRecord`、action-binding packet は sibling blocker の `semanticFeatureFrontierRecords[]` を持ち、`planId`、classification、`completionClaimAllowed=false`、L3 source path が live frontier と一致する。S4+approval は S4 packet に supporting action-binding route、version-up+external approval は activation packet に supporting action-binding route、action-binding packet は S4/version-up/rename sibling route、rename plan は supporting action-binding route を出す。各専用 packet は primary/sibling blocker に必要な `recordTemplates[]` を出し、text mode も `record-template` 行を出す。CLI text は `related-packet:` 行に scoped command を出し、JSON だけの隠れ導線や別 PLAN の判断材料流用にしない。 |
| U-OUTSTANDING-012 | `analyzeObjectiveEvidenceAudit` / `objectiveProgressForAudit` + `helix status --json` + `helix audit objective-external --json` | active objective progress は test count や roadmap span count ではなく、objective evidence audit の分母で `objectiveProgress.percent` として出る。現 live repo は G-01..G-09 proved、G-10 blocked のため `percent=90`、`provedRequirements=9`、`totalRequirements=10`、`blockedRequirements=1`、`completionClaimAllowed=false` を返す。text status surface も同じ percentage を出し、90% を whole-program / L14 completion claim に変換してはならない。audit が invalid の場合は `objectiveProgress.progressEvidenceTrusted=false`、`auditOk=false`、`auditViolationCount>0` を返し、text status は `objective-progress-evidence: invalid` を出して percent を診断用に落とす。監査が開発レポ/配布レポの HEAD/tag marker、外部 source ledger の `checked` freshness、`git ls-remote` command、ref、observed HEAD/tag、latestOfficialStatus、sourceStatusDelta、adoptionDecision、workflowRouteImpact、`package.json` version と local distribution tag、現行配布 target tag、配布 tag 採用前の version-up activation requirement、`CLAUDE.md` / `AGENTS.md` / design-language gate、HELIX setup 実体、version-up readiness、PLAN-M-02 rename/cutover readiness の citation を落とした場合も fail-close し、要求修正・常設ルール・将来版 parked work・不可逆 cutover・配布レポ参照の意味証跡を file count や green command count へ縮退させない。通常 doctor は network を呼ばず、`externalObserved` を渡した専用検証および `helix audit objective-external --json` では ledger observed と実測 HEAD/tag の不一致も fail-close する。`objective-external --json` は `externalObserved.development_repo` / `externalObserved.distribution_repo` / `externalObserved.distribution_latest_tag` を直接返し、観測コマンドの成否と message は `externalCheck` に分離する。`externalObserved.externalObserved` の二重ネストは evidence consumer が実測値を取り違えるため許可しない。配布 latest tag は remote tag の semver 最大値として観測し、現行 ledger の `unpublished` から差分が出たら fail-close する。 |

U-OUTSTANDING-012 の追加 oracle: `externalObserved` を渡す場合、`development_repo`、`distribution_repo`、`distribution_latest_tag` の 3 件すべてが必須である。部分入力は「観測していない source は drift していない」と誤読させるため、missing source violation として fail-close する。
| U-OUTSTANDING-013 | `analyzeSemanticFrontierConsistency` + `helix doctor` + `helix status` / `helix handover status` text / handover Markdown §3 | L3 §0.2 の意味ベース機能一覧、live `outstanding.semanticFeatureFrontierRecords[]`、live `outstanding.confirmedCurrentMeaningRecords[]` は一致しなければならない。`semanticFeatureFrontierRecords[]` は `design_bottomup_mode`、`asset_progress_visualization`、`serverless_readonly_share`、`name_cutover` を覆う。`confirmedCurrentMeaningRecords[]` は 43 件の L3/L12 ID を 11 意味単位で覆い、HR-FR-P2-01..04 / HAT-P2-01..04 を `agent/tool/runtime guardrail + pair-agent TDD route` として束ねるため、tool 契約 / 工数予算 / adapter 制御が P2-04 の pair-agent ラベルだけに潰れない。L3 marker の削除、live frontier / confirmed record の欠落、余剰 record、classification 差分、frontier の `completionClaimAllowed=true`、L3/L12 `sourcePaths[]` からの分離、confirmed L3/L12 ID の未被覆は doctor hard gate 違反。`helix status` text / `helix handover status` text は `semantic_frontier_records` と `confirmed_current_meaning_records` を出し、handover Markdown §3 は `semantic-frontier-records` と `confirmed-current-meaning-records` を ID / classification / 完了境界付きで出すため、PO 向け進捗出力が blocker だけを示して機能一覧の整合根拠になる confirmed-current 意味台帳を隠す状態を許可しない。 |
| U-OUTSTANDING-014 | `completionDecisionPacketForOutstanding` / `completionReviewBundleForOutstanding` / `analyzeCompletionDecisionPacket` / `analyzeCompletionReviewBundle` / `completionDedicatedPacketBridgeViolations` | completion decision item は `packetCommands[]` だけでなく `supportingPacketSummaries[]` を持つ。各 summary は command、runnableCommand、scopedCommand、runnableScopedCommand、専用 packet の schemaVersion、matrixField、expectedMatrixCount、requiredReviewFields、requiredMatrixFields、reviewRoute を持ち、S4 / version-up / rename / action-binding の verification matrix、snapshot/readiness/review field、version-up の external rehearsal/cost guardrails/security checklist packet、full activation/cutover snapshot、blocked reasons、source-delta field、repo-local 再生成 command を completion packet から機械的に辿れる。`completion decision-packet --summary-json` は `completion-decision-packet-summary.v1` として status、completion claim 可否、human decision blocker、semantic frontier count、decision ごとの scoped primary/supporting packet、required record、review bundle command、`full_source_command=helix completion decision-packet --json` を返し、Project view summary catalog の `completion-decision-packet` surface として監査されるため、巨大な full JSON を開かなくても現在地と人間判断導線を機械検出できる。ただし summary は承認材料の正本ではなく、record template / supporting packet summary の詳細は full JSON と review bundle に残し、review bundle への full JSON 導線は `full_review_bundle_command` として明示する。`completion-review-bundle.v1` は自己再生成導線として `sourceCommand=helix completion review-bundle --json` と `runnableSourceCommand=bun run helix completion review-bundle --json` を持ち、JSON / text status / handover status / `completion review-bundle` text の全 surface で同じ repo-local command に辿れる。review bundle は `reviewCoveredBlockers` と `nonPacketBlockers` を分け、`non_terminal_plans` / `semantic_frontier_blocked` を review packet で閉じられる blocker と誤認させない。`completion review-bundle` text は `review-coverage:`、`status` / `handover status` text と handover Markdown §3 は `completion-review-coverage:` を出し、JSON を見ない通常確認でも coverage 分離を落とさない。`review-packet:` 行は日本語 `route=` と machine `route-id=` を同時に出し、JSON の `reviewRouteJa` / `reviewRoute` と同じ判断導線を保つ。rename plan summary は `planOnly` / `mustNotApply` / `applyAuthorized` を required review field として持ち、review bundle の `requiredSafetyFields` が空にならない。summary 欠落、command drift、runnable command drift、bundle self runnable command drift、review coverage drift、handover §3 coverage 欠落、matrix field/count drift、必須 review field 欠落、必須 matrix source-delta field 欠落は fail-close する。ただし live 専用 packet builder / validator との結合は循環 import を避けるため `checkCompletionDecisionPacket` の doctor bridge が担当し、completion lint は packet 単体の宣言整合に留める。doctor bridge は live 専用 packet の `relatedDecisionPackets[].scopedCommand` も検査し、S4 / version-up / action-binding が `--plan <PLAN_ID>` を欠く、または別 PLAN を指す場合は `completion-decision-packet` hard gate を fail させる。 |
| U-OUTSTANDING-014a | `analyzeCompletionDecisionPacket` semantic summary audit | completion decision packet の top-level semantic summary は `semanticMeaningSummary.frontierRecordCount === semanticFeatureFrontierRecords.length`、`confirmedCurrentMeaningRecordCount === confirmedCurrentMeaningRecords.length`、`completionClaimAllowed === packet.ok`、sourcePaths に L3 feature-list と L12 acceptance source を含むことを要求する。欠落、件数 drift、source path 欠落、blocked packet なのに `completionClaimAllowed=true` は fail-close し、completion packet だけを見た PO 判断でも機能一覧の confirmed catalog と frontier boundary が消えないようにする。 |
| U-OUTSTANDING-014b | `helix closure review-bundle --summary-json` / `helix closure transition-plan --summary-json` / `helix closure decision-draft --summary-json` / Project view summary catalog | Project closure review-bundle summary は `total`、`listed`、`omitted`、`window` だけでなく、`approval_window_count`、全 page の offset/range/review command/transition command/decision draft command/non-authorizing decision draft record command/approval scope digest/window evidence totals を列挙する `review_window_index`、current window の `review_scope`、全件の `aggregate_review_scope`、`current_window_command`、`previous_window_command`、`next_window_command`、`transition_window_command`、`decision_draft_command`、`decision_draft_record_command`、`full_source_command` を持つ。Project closure transition-plan summary も `current_window_command`、`previous_window_command`、`next_window_command`、`full_source_command` を持つ。Project closure decision-draft summary は catalog 用 `source_command` を保ったまま、実 window の `current_window_command`、`decision_record_default_path`、`decision_record_command` を返し、summary から非承認 pending record 作成コマンドへ戻れる。343 件など複数 window の close-ready approval を PO がページ単位で確認する際、offset 値を手計算させず、current / next / previous / 任意 page / decision draft / transition plan へ機械的に遷移でき、かつ window 内証跡量と全件証跡量を混同しないことを保証する。summary catalog の `closure-review-bundle` surface は action 明示の `helix closure review-bundle --action close_ready --summary-json`、`closure-transition-plan` surface は action + decision 明示の `helix closure transition-plan --action close_ready --decision approve_closure_claim --summary-json` を source とし、full JSON は `full_source_command` に限定する。window command 欠落、window scope digest 欠落、aggregate 欠落、draft record command 欠落、action/decision 省略、raw `--json` を通常 command field に混入させる、または summary catalog の source command drift は fail-close する。 |
| U-OUTSTANDING-014c | `helix progress tree-view --summary-json` / Project frontier summary | Project view summary は `project_frontier_summary` を top-level に持ち、`current`、`drive_model`、`closure_frontier`、`vmodel_fit`、`skill_binding`、`commands` を read-only で返す。`closure_frontier` は close-ready review の `total` / `listed` / `omitted` / `approval_window_count`、全 page の `review_window_index`、window 単位の `review_scope`、全件の `aggregate_review_scope`、current / previous / next / transition / decision draft / decision draft record command を持ち、`vmodel_fit` は current-location / recovery runway / recovery handoff / approval review gate を同じ summary 内で参照できる。`skill_binding` は selected model、workflow/layer、required/recommended/optional count、top item summary を返すが、全 skill item や closure queue 全件は展開しない。Project view から現在地・駆動モデル・承認 frontier・skill injection 導線を一度に機械検出できる一方、承認 record 作成や apply は実行せず、raw `--json` は `full_*` field 以外に混入させない。 |
| U-OUTSTANDING-015 | `analyzeCompletionDecisionPacket` | completion decision packet の machine ID (`requiredAction` / `requiredActions[]` / `requiredEvidence[]` / `nextWorkflowRoute` / `supportingPacketSummaries[].reviewRoute`) と PO 向け日本語表示 (`requiredActionJa` / `requiredActionsJa[]` / `requiredEvidenceJa[]` / `nextWorkflowRouteJa` / `reviewRouteJa`) は対応表どおり一致しなければならない。英語 machine prose を日本語表示 field に流用した packet、配列長がずれた packet、route/reviewRoute/required evidence の日本語表示が drift した packet は fail-close し、JSON packet 経由でも日本語-first ルールを迂回できない。approval-draft supporting packet は `reviewRouteJa` が「非承認の approval draft record / current snapshot binding / safety flag を確認してから人間承認へ進む」で固定され、英語 `review non-authorizing ...` の流用を許可しない。handover Markdown の packet 要約は `確認観点=` に日本語表示、`確認観点ID=` に machine route を出し、ID 欠落を fail-close する。 |

## §0.3 route eval / pair-agent routing oracle 検査

| ID | Subject | Oracle |
|----|---------|--------|
| U-ROUTE-001 | `evaluateRouteCommand` + `helix route eval --format json` | `pair_agent_tdd` / `pair-agent-tdd` / `pair-agent TDD route` / pair programming 系 signal は unknown route や plain `task classify` に落とさず、`mode=add-feature` と schema-valid `recommended_command.command="helix pair-agent plan"` を返す。`recommended_command.args` は original `signal`、`mode=add-feature`、`pair_route=smart_test_author_to_light_implementation_to_smart_review`、`requires_plan_id=true` を持つ。safety は `auto_apply=false`、`requires_preflight=true`、`requires_human_approval=false` で、pair-agent plan から T0 smart review 実行時の explicit frontier approval gate へ接続する。 |

## §0.4 green command digest の検証戦略

review evidence の `green_commands[].output_digest` は、形式が `sha256:*` であるだけでは完了根拠にならない。
`output_digest` は証跡取得時点の immutable digest であり、`sha256:<64 hex>` の実 digest として記録される必要がある。
現行 `evidence_path` の実ファイル hash と一致すれば fresh evidence と判断できる。一方で、後続編集により valid な
過去 digest が現行 hash と異なるだけなら、過去 review evidence を危険に再スタンプさせないため hard failure にしない。
fake / placeholder / malformed digest、または evidence file 不在は coverage ではなく substance 欠落であり、doctor を
fail-close する。

| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-GREENCMD-001 | `auditGreenCommandDigests` | `output_digest` が `sha256:<64 hex>` で `evidence_path` が存在する場合は pass。現行 hash と異なる valid historical digest は pass。fake / malformed digest は `digest-invalid`、単一 hex 文字 64 連続の repeated-hex placeholder は `digest-placeholder`、missing file は `file-missing` を返し、空 path/digest は claim 無しとして skip する。 |
| U-GREENCMD-002 | `greenCommandDigestMessages` / `checkGreenCommandDigests` | invalid / missing 0 件は OK、1 件以上または repo root/PLAN 読取不能は `violation` かつ `ok=false`。message は代表 invalid / missing と件数を含み、advisory/note として扱わない。 |
| U-GREENCMD-003 | `helix doctor` hard-gate aggregation | `greenCommandDigest.ok` が `runDoctor().ok` に含まれ、fake / malformed digest または evidence file 不在がある状態で doctor green を返さない。 |

## §0.5 decision record shape の検証戦略

S4 decision / version-up activation / irreversible cutover は PO 判断または action-binding approval の入力であり、
単なる「PO signoff」「approval_scope」などの語句出現では判断材料にならない。各 PLAN は record 名の直下に
`- field: value` 形式で必要項目を持ち、値が空 / `TBD` / `TODO` / `-` の場合は未証跡として扱う。

| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-DECISIONREC-001 | `analyzeS4DecisionReadiness` / `frontmatterSchema` | S3 pending PoC は `s4_decision_record:` 配下に `allowed_outcome` / `decision_owner` / `decision_basis` / `forward_route` / `reverse_fullback_required` の実値を持つ。語句だけの prose は violation。`source_ledger_freshness` は current `S4 decision source ledger (checked YYYY-MM-DD)` と同じ日付を引用しなければならず、古い ledger 日付を残した record は violation。`decision_outcome` は `kind=poc + workflow_phase=S4` 専用であり、S3 verified evidence に置かれた場合は violation。さらに live `semantic_feature_frontier_record` が `classification=frontier_pending_decision`、`completionClaimAllowed=false`、L3 source path を持たなければ violation。 |
| U-DECISIONREC-002 | `analyzeVersionUpReadiness` | `version_target` 付き parked PLAN は `activation_decision_record:` と `parked_review_record:` の構造化 field を持つ。`activation_decision_record` は `activation_snapshot_id` で current `activationSnapshot.snapshotId` を承認材料に束ねる。外部 infra/auth/secret 境界を含む場合は approval/dry-run/rollback を空値で通さない。`activation_snapshot_id` が concrete `sha256:` になった承認材料では、`allowed_outcome` が候補集合のまま残ると violation になり、選択済みの単一 activation outcome を要求する。live `semantic_feature_frontier_record` は `classification=parked_future_version`、`completionClaimAllowed=false`、L3 source path を持つ。`buildVersionUpActivationPackets` は `activationReadinessChecks[]` / `activationReadinessSummary` / `semanticFeatureFrontierRecord` を出し、present/pending 数、pending check 名、source ledger freshness、summary status、意味 frontier を prose parsing なしで確認できる。summary が ready でも `activationAllowed=false` は固定で、human/action-binding decision route なしに apply しない。 |
| U-DECISIONREC-003 | `analyzeCutoverReadiness` | L14 irreversible cutover PLAN は `cutover_decision_record:` 配下に blast radius / dry-run / rollback / backup / audit / monitoring / legacy alias policy の実値を持つ。marker-only prose は violation。`source_ledger_freshness` は current `Cutover source ledger (checked YYYY-MM-DD)` と同じ日付を引用しなければならず、ledger refresh 後の古い cutover approval material を流用しない。live `semantic_feature_frontier_record` は `featureId=name_cutover`、`classification=approval_gated_cutover`、`completionClaimAllowed=false`、L3 source path を持つ。 |
| U-DECISIONREC-004 | `allowedOutcomeSetViolation` / `selectedAllowedOutcomeViolation` + S4/version-up/cutover/action-binding readiness | decision 前の packet / pending record では、`allowed_outcome` は単なる非空 field ではなく、各 record の設計 enum と同じ集合を列挙する。未知 outcome 混入、必須 outcome 欠落、機能一覧・decision packet と gate 実装の drift は violation。S4 terminal decision のように `decision_outcome` が記録済みの record では、enum 全列挙ではなく選択済みの単一 `allowed_outcome` が `decision_outcome` と一致しなければならない。version-up activation でも `activation_snapshot_id` が concrete `sha256:` になった後は候補集合ではなく単一 selected outcome を要求する。 |
| U-DECISIONREC-005 | `analyzeS4DecisionReadiness` | `workflow_phase=S4` かつ `decision_outcome` を持つ PoC は terminal status でも `s4_decision_record:` を必須にする。frontmatter の `decision_outcome` だけでは PO/S4 判断根拠・route・risk が証跡化されたことにしない。 |
| U-DECISIONREC-006 | `analyzeS4DecisionReadiness` | `decision_outcome` の選択値と `s4_decision_record` の `allowed_outcome` / route / status / promotion 意味が一致する。`allowed_outcome` は terminal S4 decision では `confirmed` / `rejected` / `pivot` の全列挙ではなく、`decision_outcome` と同じ単一値でなければならない。`confirmed` は terminal かつ Forward/Reverse 昇格 target と promotion strategy を持ち、`rejected` は archive され Forward 昇格 route を持たず、`pivot` は旧 PoC archive と新 PoC/S0/backlog route を持つ。enum と field presence だけでは pass しない。 |
| U-DECISIONREC-007 | `analyzeVersionUpReadiness` | version-up parked PLAN の `activation_decision_record` は outcome 集合だけでなく、`activate_future_version` の add-feature/Forward route、`reject_or_archive` の archive route、`keep_parked_with_review_date` の review-date route を持つ。`parked_review_record` は trigger-bound または明示日付と completion/status decision packet route を持ち、plain draft や private note に戻らない。 |
| U-DECISIONREC-008 | `analyzeCutoverReadiness` | irreversible L14 cutover の `cutover_decision_record` は field presence だけでなく apply 実行条件を固定する。`cutover_snapshot_id` は current `cutoverSnapshot.snapshotId` を記録し、`execution_window_or_freeze_policy` は frozen HEAD、quiet window、single-run/concurrency、drift 時再承認を含み、`dry_run_plan` / `rollback_plan` / `state_backup_plan` / `audit_record` / `post_cutover_monitoring` は非破壊 rehearsal、branch/tag restore、state restore、commands/hash/approver/result/rollback、quiet window + smoke/doctor/status/feedback を持つ。 |
| U-DECISIONREC-009 | `analyzeActionBindingApprovalReadiness` | high-impact action の `action_binding_approval_record` は field presence だけでなく最小権限の action binding を持つ。`approval_scope` は単に limited / scope と書くだけでは足りず、actor/tool/target/params または CLI/API/config/infra などの具体境界を限定する。`approved_actor` / `approved_tool` / `approved_target` / `approved_params` は wildcard / all / any / unlimited を許さず、未承認なら将来の named binding 条件を記録する。`review_approval_evidence` / `reviewed_snapshot_binding` / `expires_at_or_trigger` / `audit_record` は review evidence、activation/cutover snapshot binding または no-snapshot basis、expiry/re-approval、approver/action/result/incident route を持つ。version-up sibling の snapshot 照合は repo HEAD と current package version を含む current `activationSnapshot.snapshotId` に対して行う。`repoHeadSha` が取得できない場合は null-HEAD snapshot を合成せず、既存 concrete snapshot を stale と誤判定せずに `activation snapshot cannot be validated without repoHeadSha` の pending に落とす。別 HEAD snapshot は stale として invalid にする。S4 / version-up / rename sibling を持つ approval は live semantic frontier record と一致する。`buildActionBindingApprovalPackets` は raw `approvalRecord` だけでなく `approvalBindingChecks[]` と `semanticFeatureFrontierRecords[]` を出し、field ごとの `concrete` / `pending` / `invalid` と意味 frontier を prose parsing なしで確認できる。 |
| U-DECISIONREC-009a | `classifyHighImpactApprovalRequirement` / `analyzeOutstandingWork` | action-binding approval の要否は全 surface で共有 classifier に従う。`approval_scope`、`review_approval_evidence`、approval packet template、source ledger 参照だけでは `human_approval_pending` にしない。逆に、`production auth infrastructure deploy requires PO signoff before execution`、`future activation requires action-binding approval`、不可逆 cutover の実行前 approval は `human_approval_pending` と supporting `helix action-binding approval-packet --json --plan <PLAN_ID>` を出す。S4 decision の一般的な PO approval 文だけでは action-binding approval にせず、高影響実行文脈がある場合だけ S4 packet の sibling approval route を出す。 |
| U-DECISIONREC-010 | `buildIdentifierRenameCutoverPlan` / `helix rename plan` | rename/cutover packet は `snapshotReview` を持ち、recorded cutover snapshot、recorded action-binding snapshot、current `cutoverSnapshot.snapshotId`、match flags、drift warning、required action を JSON で出す。`auditIdentifierRenameBlastRadius` は `HELIX-HARNESS` / `HELIX-HARNESS-OS` の exact repository-name residue も residual として拾い、`HELIX-HARNESS-OS` を `HELIX-HARNESS` と二重カウントしない。governance/design/plan 上の外部 source ledger と、`src/cli.ts` / `src/lint/objective-evidence-audit.ts` / `tests/goal-evidence-audit.test.ts` / `tests/cli-surface.test.ts` の既知外部 repo 観測 surface / fixture は `reference_source` に分類する。一方で一般 source/test file の exact repository-name residue は `approval_gated` または fixture 分類のまま残し、HELIX 名称 debt を外部 ledger 例外に混ぜない。`cutoverSnapshot` は `repoHeadSha` / `headDigest` / `worktreeStatusDigest` / `evidenceArtifactsDigest` を持ち、HEAD 差分、dirty path set、証跡 artifact hash 差分で `snapshotId` が変わり、HEAD または worktree status 不明時は blocked reason を返して `approvalMaterialReady=true` にしない。text mode も `snapshot-review:`、`cutover-snapshot-head:`、`cutover-snapshot-worktree:`、`cutover-snapshot-evidence:` 行を出し、承認 record が concrete でない draft でも current snapshot を承認前レビューで確認できる。stale snapshot を記録した concrete approval は `driftWarning` と blocked reason を返し、current snapshot、clean worktree、実在 evidence artifact hash を記録した approval だけが `approvalMaterialReady=true` へ進める。ただし `rename plan` は plan-only surface なので、承認材料が揃っても `applyAuthorized=false` / `applyCommandAvailable=false` / `mustNotApply=true` のままにする。 |
| U-DECISIONREC-011 | `buildIdentifierRenameCutoverPlan` / `helix rename plan` | `cutoverCategoryChecklist[]` は category / hits / files だけでなく、代表 `samplePaths[]` と category 別 `verificationCommand` を持つ。packet は `sourceLedgerFreshness` と `cutoverRunbook[]` を出し、Cutover source ledger の鮮度・必須 source 欠落、runbook write policy、backup/restore drill evidence path を承認前に確認できる。completion decision packet / status / handover の supporting summary は、`cutoverSnapshot` / `snapshotReview` / `cutoverRunbook` / `stateBackupManifest` という親 field だけでなく、`cutoverSnapshot.blastRadiusDigest`、`cutoverSnapshot.approvalScopeDigest`、`cutoverSnapshot.evidenceDigest`、`cutoverSnapshot.sourceLedgerRowsDigest`、`snapshotReview.currentSnapshotId`、`snapshotReview.cutoverSnapshotMatchesCurrent`、`snapshotReview.actionBindingSnapshotMatchesCurrent`、`cutoverCategoryChecklist.verificationCommand`、`sourceLedgerFreshness.rowsDigest`、`cutoverRunbook.writePolicy`、`cutoverRunbook.evidencePath`、`stateBackupManifest.restoreEvidencePath`、`freezePolicy.concurrencyPolicy`、`provenanceRequirements.evidence`、`approvalGate.reviewedSnapshotBindingRequired` を列挙する。親 field だけの summary は、blast radius、snapshot drift、runbook write policy、backup/restore drill、freeze policy、approval gate のどれを承認前に見るべきかを隠すため fail-close する。`cutoverRunbook[].command` は実行可能な CLI surface の allowlist と一致しなければならず、`writePolicy` は `no-write` / `state-write` / `local-artifact-write` を明示する。`cutoverRunbook[].evidencePath` と `stateBackupManifest[].restoreEvidencePath` は `.helix/evidence/rename/` 配下の repo-local `.json` / `.txt` artifact path に限定し、URL、絶対 path、`..` traversal、自然文 prose、prefix 外 path を承認前 evidence として許可しない。`stateBackupManifest[].backupTargetPattern` は `.helix/backups/rename/<timestamp>/` 配下に限定し、`checksumRequired` / `restoreDrillRequired` / `restoreRequired` は true でなければならない。`no-write` row に build / DB rebuild / file output が混じる場合、未実装 command、存在しない renamed binary path は承認証跡にしない。`helix rename rehearsal --no-write --target helix --json`、`helix rename state-backup --dry-run --restore-drill --json`、`helix rename dist-smoke --no-write --target helix --json` は packet-only で、codemod preview / restore drill requirements / renamed binary smoke requirements を返し、apply surface を持たない。`rename rehearsal` の `previewCommands[].command` は実行可能な `bun run src/cli.ts rename ... --json` のみを入れ、`preview ...` や `after approval ...` の自然文は `description` に分離する。legacy `helix cutover --dry-run --json` helper も承認前 runbook material なので、check command は `bun run src/cli.ts doctor` 形式の POSIX path を出し、rollback ref は shell quote する。`rename audit` は `approvalRecordsConcrete` を出しても `cutoverApproved=false` の監査 surface であり、snapshot/source/frontier の現行一致を検査する `rename plan` だけが `ready_for_cutover_packet` へ進める。`approvalMaterialReady=true` は concrete approval record と current snapshot 一致だけでは足りず、`cutover_decision_record.source_ledger_freshness` / `source_status_delta` / `adoption_decision_delta` / `workflow_route_impact` が concrete である場合だけ許可する。`applyAuthorized` は plan-only packet では常に false のままにし、実 apply 可能性を示さない。`recordTemplates[]` は `cutover_decision_record` と `action_binding_approval_record` を持ち、text mode は `record-template` 行を出す。`verificationCommandMatrix[]` は baseline、repository-redirect-review、targeted-regression、static-gates、state-and-doctor、full-regression、current-dist-smoke、renamed-helix-dist-smoke、legacy-alias-smoke の各 phase、command、writePolicy、expected、evidence、source、sourceUrl、sourceCheckedAt、latestOfficialStatus、sourceStatusDelta、adoptionDecision、adoptionDecisionDelta、workflowRouteImpact を持つ。repository-redirect-review は GitHub repository rename の redirect、project site URL 例外、git remote update、repo/package/docs distribution references を review input とし、redirect を HELIX identifier/state cutover 承認へ読み替えない。current / legacy dist smoke の build は `local-artifact-write`、DB rebuild は `state-write`、packet-only rehearsal は `no-write` として doctor が検査し、policy と command がずれる場合は fail-close する。`sourceCheckedAt` は未来日・90 日超 stale・非実在日付を fail-close し、source/adoption/route metadata の placeholder や future-action prose も承認証跡にしない。`sourceLedgerFreshness.rowsDigest` と `cutoverSnapshot.sourceLedgerRowsDigest` は Cutover source ledger の row 内容を束ね、date 以外の official status / adoption / field impact 変更でも `evidenceDigest` と `snapshotId` を変える。`.helix/**` の path-only runtime state hit は本文 token がなくても blast radius / category checklist / `blastRadiusDigest` / `snapshotId` を変え、承認済み snapshot を再利用させない。`renamed-helix-dist-smoke` は存在しない `./dist/helix` を直接実行せず、`identifier-rename-dist-smoke-dry-run.v1` を承認前 evidence とする。text mode は source ledger、`rowsDigest`、cutover snapshot の `sourceLedgerRowsDigest` / `blastRadiusDigest` / `approvalScopeDigest` / `evidenceDigest`、checklist 件数、runbook 件数、verification command 件数、checked/adoption/status delta/route impact/writePolicy/command 付き `verification-source:` を出し、承認前 dry-run evidence と source が自由文だけに戻らない。 |
| U-DECISIONREC-011a | `buildIdentifierRenameCutoverPlan` / `helix rename plan` | `cutoverSnapshot` は clean worktree と証跡 artifact 実体を snapshot 材料に含める。`worktreeClean=false`、`worktreeStatusDigest` 不明、dirty path set 変更、`.helix/evidence/rename/` 配下の runbook/restore evidence 欠落、または `evidenceArtifacts[].sha256` 変更は `snapshotId` を変え、`approvalMaterialReady=true` にしない。completion decision packet / status / handover の supporting summary は `cutoverSnapshot.worktreeClean`、`cutoverSnapshot.worktreeStatusDigest`、`cutoverSnapshot.worktreeDirtyPathCount`、`cutoverSnapshot.evidenceArtifactsDigest`、`cutoverSnapshot.evidenceArtifactsPresent`、`cutoverSnapshot.missingEvidenceArtifacts`、`cutoverSnapshot.evidenceArtifacts.sha256` を列挙し、text mode は `cutover-snapshot-worktree:` と `cutover-snapshot-evidence:` を出す。 |
| U-DECISIONREC-012 | `buildVersionUpActivationPackets` / `helix version-up activation-packet` | `Version-up source ledger` は `OWASP Web Security Testing Guide` row、`GitHub Actions secure use` row、`SLSA Provenance` row を持ち、security testing、activation workflow hardening、artifact provenance が `external_rehearsal_plan` / `dry_run_plan` / `activation_provenance_requirements` / `audit_record` に接続される。activation packet は `recordTemplates[]` に activation / parked review / external rehearsal / cost guardrail / provenance / action-binding record を持ち、text mode は `record-template` 行を出す。completion decision packet / status / handover の supporting summary は、`activationDecision` / `activationSnapshot` / `versionDryRunEvidence` という親 field だけでなく、`activationDecision.activation_snapshot_id`、`activationDecision.dry_run_plan`、`activationDecision.rollback_plan`、`activationReadinessChecks.evidence`、`activationSnapshot.sourceLedgerRowsDigest`、`activationSnapshot.versionDryRunDigest`、`activationSnapshot.evidenceDigest`、`versionDryRunEvidence.releaseTagExists`、`versionDryRunEvidence.releaseTriggerResolved`、`securityChecklistPacket.securityChecks.requiredEvidence`、`securityChecklistPacket.securityChecks.workflowRouteImpact`、`reapprovalTriggers.requiredAction` を列挙する。activation packet 自体も `securityChecklistPacket.securityChecks[]` を持ち、summary が実在しない別 packet field を指すだけの状態に戻さない。親 field だけの summary は、SemVer dry-run、release tag 解決、snapshot drift、rehearsal/cost/provenance、security checklist のどれを承認前に見るべきかを隠すため fail-close する。`activation_decision_record.activation_snapshot_id` は field 名だけでは pending とし、current `activationSnapshot.snapshotId` の concrete sha256 と一致しない場合は stale blocker を返す。`activationSnapshot` は `headSha` だけでなく `headBound` / `materialBound` / `validationStatus=head_bound|head_unavailable` / `planTextDigest` / `versionDryRunDigest` を出し、HEAD 不明時の snapshot、同じ HEAD の parked PLAN 本文変更、または version-up dry-run 結果変更を承認用 current snapshot と誤読させない。activation packet は `versionDryRunEvidence` を持ち、review command、plan command、dry-run plan digest、SemVer 判定、release tag 解決、blockedReasons を出す。target release trigger が変わると `versionDryRunEvidence.digest` と `activationSnapshot.snapshotId` が変わることを固定する。activation packet は `relatedDecisionPackets[]` の base command に加えて PLAN-scoped `scopedCommand` を出し、supporting action-binding approval packet を別 PLAN と取り違えない。activation packet は `activationVerificationCommandMatrix[]` を持ち、activation-packet-baseline、activation-review-bundle、version-dry-run、external-rehearsal、security-testing、state-and-doctor、targeted-regression、static-gates、full-regression、approval-packet の各 phase、command、writePolicy、expected、evidence、source、sourceUrl、sourceCheckedAt、latestOfficialStatus、sourceStatusDelta、adoptionDecision、adoptionDecisionDelta、workflowRouteImpact を出す。external-rehearsal / security-testing は prose command ではなく `helix version-up rehearsal --plan <PLAN> --no-write --json` / `helix version-up security-checklist --plan <PLAN> --no-write --json` の packet-only no-write surface を指し、CLI dispatch と doctor allowlist で実行可能性を検査する。`sourceCheckedAt` は未来日・90 日超 stale・非実在日付を fail-close し、source/adoption/route metadata の placeholder や future-action prose も activation evidence として許可しない。`sourceLedgerFreshness.rowsDigest` と `activationSnapshot.sourceLedgerRowsDigest` は Version-up source ledger の row 内容を束ね、date 以外の official status / adoption / field impact 変更でも `evidenceDigest` と `snapshotId` を変える。`state-and-doctor` は `db rebuild` を含むため `state-write` として分離し、no-write row に build / DB rebuild / file output が混じる場合は fail-close する。`version-up dry-run` は Semantic Versioning 2.0.0 に合わせ、numeric prerelease identifier の leading zero や空 prerelease identifier を invalid として `ok=false` にし、`releaseTagRef` / `releaseTagExists` / `releaseTriggerResolved` を出して target release tag 未解決でも `ok=false` にする。activation packet の version-dry-run row は、concrete SemVer target が無い `future` 等でも `--target future` の `version-up dry-run` を出し、`semverChange=invalid` / `ok=false` / `blockedReasons` を no-write evidence として review する。local release tag は `git rev-parse --verify`、外部配布 repo の release tag は明示 `--release-remote` による `git ls-remote --tags <remote> <ref>` で検査し、`releaseTagSource` / `releaseTagCheckCommand` を JSON に出すため、配布 repo の remote tag を local tag missing と誤判定しない。external-rehearsal は GitHub Actions secure-use / `pull_request_target` / `GITHUB_TOKEN` permission source を参照し、CI workflow があるだけで activation 安全と読み替えない。approval/security checklist は GitHub Environments required reviewers の repo visibility / account or org plan / prevent self-review / environment secrets availability を承認前 evidence とし、environment 名だけで approval boundary とみなさない。text mode は activation snapshot の `sourceLedgerRowsDigest` / `approvalScopeDigest` / `versionDryRunDigest` / `evidenceDigest`、verification command 件数、checked/adoption/status delta/route impact/writePolicy/command 付き `verification-source:` を出し、version-up activation の承認前 evidence と公式/正本 source が自由文だけに戻らない。matrix、`externalRehearsalPlan[]`、cost guardrails、`securityChecks[]`、`activationReadinessChecks[]`、`versionDryRunEvidence` は `activationSnapshot.evidenceDigest` に含まれ、承認前 review material / external limit / rehearsal evidence / security source metadata / dry-run result drift で snapshot が変わる。 |
| U-DECISIONREC-013 | `buildS4DecisionPackets` / `helix s4 decision-packet` | S4 decision packet は `decisionEvidenceChecklist[]` / `outcomeRouteMatrix[]` だけでなく、`recordTemplates[]` と `decisionVerificationCommandMatrix[]` を持つ。completion decision packet / status / handover の supporting summary は、`decisionRecord` / `decisionEvidenceChecklist` / `outcomeRouteMatrix` / `provenanceRequirements` という親 field だけでなく、`planOnly`、`mustNotDecide`、`decisionAllowed`、`decisionCommandAvailable`、`decisionRecord.allowed_outcome`、`decisionRecord.decision_owner`、`decisionRecord.decision_basis`、`decisionRecord.forward_route`、`decisionRecord.reverse_fullback_required`、`decisionRecord.promotion_strategy_or_rejection_pivot_rationale`、`outcomeRouteMatrix.routePolicy`、`outcomeRouteMatrix.requiredEvidence`、`provenanceRequirements.evidence`、`decisionVerificationCommandMatrix.command`、`decisionVerificationCommandMatrix.writePolicy`、`decisionVerificationCommandMatrix.evidence`、`relatedDecisionPackets.scopedCommand`、`nextWorkflowRoutes.route` を列挙する。親 field だけの summary は、outcome、owner/basis、route/fullback、provenance、verification command、no-write 境界、plan-only safety のどれを PO が確認すべきかを隠すため fail-close する。S4+approval の PLAN では `s4_decision_record` と `action_binding_approval_record` template を返し、supporting action-binding route を `relatedDecisionPackets[]` だけでなく `blockedReasons[]` にも残すため、S4 decision だけで high-impact execution 可能と誤認しない。text mode は `record-template` 行を出す。matrix は decision-packet-baseline、source-ledger-freshness、s3-verification-evidence、requirements-trace、targeted-regression、static-gates、full-regression、completion-frontier の各 phase、command、writePolicy、expected、evidence、source、sourceUrl、sourceCheckedAt、latestOfficialStatus、sourceStatusDelta、adoptionDecision、adoptionDecisionDelta、workflowRouteImpact を出す。各 command は `writePolicy=no-write` の実行可能な承認済み verification surface だけを許し、自然文手順や prose-only command、DB rebuild / build artifact 出力 / redirect / tee など state または artifact を書く command に戻した packet は `s4DecisionVerificationCommandViolations` と `analyzeS4DecisionReadiness` で fail する。`sourceCheckedAt` は未来日・90 日超 stale・非実在日付を fail-close し、source/adoption/route metadata の placeholder や future-action prose も PO/S4 判断前 evidence として許可しない。text mode は evidence check 件数、outcome route 件数、verification command 件数、checked/adoption/status delta/route impact/writePolicy/command 付き `verification-source:` を出し、PO/S4 判断前の検証 evidence と source が自由文だけに戻らない。 |
| U-DECISIONREC-014 | `buildActionBindingApprovalPackets` / `helix action-binding approval-packet` | action-binding approval packet は `approvalBindingChecks[]` だけでなく、`recordTemplates[]` と `approvalVerificationCommandMatrix[]` を持つ。completion decision packet / status / handover の supporting summary は、`approvalRecord` / `approvalBindingChecks` という親 field だけでなく、`planOnly`、`mustNotApprove`、`approvalCommandAvailable`、`approvalAllowed`、`allowedOutcomes`、`approvalRecord.allowed_outcome`、`approvalRecord.approval_policy_or_named_approver`、`approvalRecord.approval_scope`、`approvalRecord.approved_actor`、`approvalRecord.approved_tool`、`approvalRecord.approved_target`、`approvalRecord.approved_params`、`approvalRecord.review_approval_evidence`、`approvalRecord.reviewed_snapshot_binding`、`approvalRecord.expires_at_or_trigger`、`approvalRecord.audit_record` と対応する `approvalBindingChecks.*`、`approvalBindingChecks.status`、`approvalBindingChecks.reason`、`approvalBindingChecks.requiredAction`、`approvalVerificationCommandMatrix.command`、`approvalVerificationCommandMatrix.writePolicy`、`approvalVerificationCommandMatrix.evidence`、`relatedDecisionPackets.scopedCommand`、`nextWorkflowRoutes.route` を列挙する。親 field だけの summary は、actor/tool/target/params/snapshot/expiry/audit、plan-only safety、pending/invalid reason、再実行 command、sibling packet scope、承認後 route のどれを承認前に見るべきかを隠すため fail-close する。`recordTemplates[]` は `action_binding_approval_record` の actor/tool/target/params/snapshot/expiry/audit block を返し、text mode は `record-template` 行を出す。matrix は approval-packet-baseline、sibling-decision-packets、least-privilege-binding、snapshot-binding、github-environment-approval-boundary、security-boundary、web-security-testing-boundary、targeted-regression、static-gates、full-regression、completion-frontier の各 phase、command、writePolicy、expected、evidence、source、sourceUrl、sourceCheckedAt、latestOfficialStatus、sourceStatusDelta、adoptionDecision、adoptionDecisionDelta、workflowRouteImpact を出す。`web-security-testing-boundary` は OWASP WSTG を `source` / `sourceUrl` / adoption metadata として出し、security testing の承認前確認を packet 単体で辿れるようにする。`actionBindingApprovalVerificationCommandViolations` は command が実行可能な承認済み CLI/test surface であること、`sourceCheckedAt` が未来日・90 日超 stale・非実在日付ではないこと、source/adoption/route metadata が空・placeholder・future-action prose でないことを fail-close 検査し、`review ...` / `verify ...` の自然文 command や prose-only 手順、古い official-source 前提を承認前 evidence として許可しない。`sibling-decision-packets` command は primary の `action-binding approval-packet` 自身を含めず、S4 / version-up は `--plan <PLAN_ID>` 付き、rename は singleton `rename plan` として列挙する。snapshot-bearing sibling packet が無い PLAN の `reviewed_snapshot_binding: no snapshot-bearing packet applies...` は concrete no-snapshot basis とし、snapshot 必須 PLAN の packet field 名だけの placeholder は pending のままにする。text mode は binding check 件数、verification command 件数、checked/adoption/status delta/route impact/writePolicy/command 付き `verification-source:` を出し、GitHub Environments required reviewers / prevent self-review、NIST least privilege、VS Code Workspace Trust、OWASP WSTG の意味を actor/tool/target/params/snapshot/expiry/audit の承認前 evidence に接続する。版上げ系の関連承認は `github-environment-approval-boundary` で `helix version-up security-checklist --plan <PLAN_ID> --no-write --json` を指し、リポジトリ公開範囲・契約プラン可用性・自己承認防止・環境シークレット可用性を承認前証跡とする。approvalAllowed=false と approvalCommandAvailable=false は固定で、matrix は承認・apply surface を作らない。 |

2026-07-03 追補: U-DECISIONREC-012 の activation evidence 判定は、裸の `https://...` や official source URL
単体を実行証跡として扱わない。URL は source metadata であり、`report_url:` / `audit_id:` /
`artifact_path:` のような証跡種別と結び付く場合だけ concrete locator として `present` にできる。
同じく U-DECISIONREC-012 は `sourceLedgerFreshness.checkedDate` を `externalRehearsalPlan[]`、cost guardrails、
`activationVerificationCommandMatrix[]`、`securityChecklistPacket.securityChecks[]` の `sourceCheckedAt` へ伝播し、
ledger heading と packet metadata の確認日が新旧混在した activation packet を許可しない。
U-DECISIONREC-011 も `sourceLedgerFreshness.checkedDate` を `verificationCommandMatrix[]` の `sourceCheckedAt` へ伝播し、
Cutover source ledger heading と matrix metadata の確認日が新旧混在した rename/cutover packet を許可しない。
U-DECISIONREC-013 も `S4 decision source ledger` の checked date を `decisionVerificationCommandMatrix[]` の
`sourceCheckedAt` へ伝播し、ledger heading と S4 packet metadata の確認日が新旧混在した decision packet を許可しない。
U-DECISIONREC-013 は `verified_evidence` と `external_source_basis` の concrete 判定を分離し、URL / repo doc path /
PLAN ID だけの source 参照を `verified_evidence` としては fail-close する。実行済み test/review command、test path、
artifact/audit/evidence/report/log path、run/workflow/job id、hash のいずれかに接続しない S4 判断材料は検証証跡にしない。
U-DECISIONREC-014 は `review_approval_evidence` / `audit_record` の concrete 判定で任意の外部 URL や自由文 claim を許可しない。
repo-local artifact path、digest / run id、GitHub Actions run / PR / commit URL のような監査可能 locator のみを承認前 evidence として扱う。
U-DECISIONREC-014 は `approvalSnapshot` を持ち、`planTextDigest` / `approvalScopeDigest` /
`reviewEvidenceDigest` / `auditDigest` / `siblingDecisionPacketDigest` を `snapshotId` へ束ねる。
approved actor/tool/target/params、review evidence、audit、関連 decision packet のどれかが変わった旧承認材料を
action-binding approval packet や completion summary へ流用させない。

2026-07-02 追補: U-DECISIONREC-002 は、activation packet の `activationDecision.activation_snapshot_id`、
`activationSnapshot.headSha`、`HEAD` 差分による `snapshotId` 変化、`HEAD` 不明時 blocker、source ledger 確認日
不一致 violation、cost guardrails の `activationReadinessChecks[]` pending 化、text surface の
`activation-snapshot:` / `reapproval-trigger:` 行も検査対象に含める。

## §0.6 source ledger freshness の検証戦略

外部公式ソースに基づく ledger は、行・列・adoption decision が揃っていても `checked YYYY-MM-DD` が古ければ
現在の判断材料として扱わない。右腕 verification / S4 decision / version-up / cutover の各 gate は、
ledger の `checked` 日付が未来日でなく、かつ 90 日を超えて stale でないことを fail-close で検査する。

| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-SOURCELEDGER-001 | `sourceLedgerCheckedDateViolation` + `analyzeRightArmVerificationStrategy` | `Verification source ledger (checked YYYY-MM-DD)` が 90 日超 stale の場合、右腕 verification strategy は source ledger violation として fail-close し、G8-G14 pass claim の根拠にしない。さらに heading の checked date と同じ日付で `source_ledger_freshness` / `source_status_delta` / `adoption_decision_delta` / `workflow_route_impact` が記録されていない date-only refresh は fail-close し、公式 source の意味差分を見ない日付更新を gate evidence にしない。 |
| U-SOURCELEDGER-002 | `sourceLedgerCheckedDateViolation` + `analyzeS4DecisionReadiness` | Discovery / Scrum の `S4 decision source ledger` が 90 日超 stale の場合、S3 verified evidence を S4 判断材料へ進めず、対象 mode doc ごとの violation を返す。 |
| U-SOURCELEDGER-003 | `sourceLedgerCheckedDateViolation` + `analyzeVersionUpReadiness` | `Version-up source ledger` が 90 日超 stale の場合、parked / activation decision packet の根拠にせず version-up readiness を fail-close する。parked PLAN の `activation_decision_record.source_ledger_freshness` は current ledger heading と同じ `checked YYYY-MM-DD` を引用しなければならず、`fresh checked Version-up source ledger` のような日付なし prose は fail-close する。 |
| U-SOURCELEDGER-004 | `sourceLedgerCheckedDateViolation` + `analyzeCutoverReadiness` | `Cutover source ledger` が 90 日超 stale の場合、不可逆 L14 cutover / action-binding approval の根拠にせず cutover readiness を fail-close する。 |
| U-SOURCELEDGER-005 | `sourceLedgerHeadingPattern` + 各 source-ledger parser | `checked` 日付を新しい再確認日に更新しても、parser は ledger table を読み続ける。`2026-06-30` 固定文字列に依存して、正しい ledger refresh を missing rows と誤判定しない。 |
| U-SOURCELEDGER-006 | `analyzeVersionUpReadiness` | `Version-up source ledger` は source 名 / https URL / 非空 adoption decision だけでは通さない。SemVer / GitHub / Cloudflare / Access / HMAC / GitHub Actions secure-use / SLSA Provenance の各 row は expected official URL を含み、`required field impact` に version-up activation の該当 field (`activation_dependency`、`dry_run_plan`、`cost_guardrails`、`external_rehearsal_plan`、`activation_provenance_requirements`、`dry_run_evidence`、`audit_record` など) を含む。誤 URL または impact 欠落は source ledger violation。 |
| U-SOURCELEDGER-007 | `analyzeCutoverReadiness` | `Cutover source ledger` は NIST / GitHub Environments / GitHub Actions concurrency / GitHub repository rename / Google SRE Release Engineering / Google SRE Canarying Releases / Microsoft Safe Deployment Practices / Microsoft Testing Strategy / OWASP LLM06 / SLSA の expected official URL と `required field impact` を固定検査する。GitHub Actions concurrency は current canonical URL `<https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs>` に固定し、旧 how-to URL へ戻る退行を violation にする。canarying / safe deployment / testing source は staged exposure、health comparison、rollback trigger、pre-release security/regression/load evidence を L14 cutover の `dry_run_plan` / `post_cutover_monitoring` / `rollback_plan` / `execution_window_or_freeze_policy` / `audit_record` / `blast_radius_baseline` に接続する。誤 URL または `blast_radius_baseline` / `state_backup_plan` / `execution_window_or_freeze_policy` / `post_cutover_monitoring` などの impact 欠落は cutover source ledger violation。 |

## §1 単体テスト (U-*) — placeholder skeleton

> L7 = 個別関数の **単体**を対象 (最小単位、純粋関数中心)。既存 vitest 66 test が seed (analyzeX/evaluateAgentGuard/detectMode/frontmatter)。個別 U ケースは L7 entry で展開。

### §1.1 U-FUNC (function-spec §1 関数 signature 由来)
| U-ID (候補) | 検証対象 | oracle (DbC) |
|---|---|---|
| U-FUNC-01 | `analyzeX` 純粋性 + post (orphans/totals) | 同入力→同出力、orphans==[]⟺ok (既存 seed) |
| U-FUNC-02 | `evaluateAgentGuard` allowlist/model/family | block 判定 + fail-close (既存 seed) |
| U-FUNC-03 | `detectMode` mode 決定 | mode∈4種、副作用なし (既存 seed) |
| U-FUNC-04 | `lintPlan`/`lintVmodel` 本実装 | schedule lint + PLAN governance/frontmatter strict gate + G1/G3 trace gate / 12 edge (L7.2/L7.3 implemented) |

### §1.2 U-CORE (function-spec §2 pseudocode 由来)
| U-ID (候補) | 検証対象 | oracle |
|---|---|---|
| U-CORE-01 | `planDraft` pseudocode (§2.1) | pre 違反→exit1 / 原子性 (失敗時 file 不変) |
| U-CORE-02 | `runGate` 決定論 (§2.2) | AI 非依存、V-model 順序 / 証跡生成 |
| U-CORE-03 | `traceCheck` 12 edge (§2.3) | 孤児→fail-close exit1 |
| U-CORE-04 | `sprintCheck` Red-first (§2.4) | Red commit が Green より先行する |

### §1.3 U-RULE (function-spec §4 IMP-033 rule engine 由来)
| U-ID (候補) | 検証対象 | oracle |
|---|---|---|
| U-RULE-01 | 10 rule 型 各純粋関数 | pair-exists/ref-resolves/trace-bidir/... 各 RuleResult |
| U-RULE-02 | auto-enroll (§4.3) | frontmatter scan → 該当 rule 自動適用 |
| U-RULE-03 | 既存 5 lint の rule 吸収 | g3-trace 等が rule インスタンスとして等価 |

### §1.4 U-EDGE (edge-case 由来)
| U-ID (候補) | 検証対象 | oracle |
|---|---|---|
| U-EDGE-01 | `@edge-normal` 4 観点 | 正常代表 → AT-01 trace |
| U-EDGE-02 | `@edge-error` fail-close | 異常 → AT-02 / exit code |
| U-EDGE-03 | `@edge-boundary` | 境界 → AT-03 (空入力/不正 frontmatter/path 不在/循環) |

### §1.5 U-SLOG (session-log 由来、PLAN-L6-03 add-design / session-log.md §3)
| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-SLOG-001 | `resolveActivePlan` | state ファイル優先 / branch (`add/<plan>`) fallback / 解決不能=`null` (throw しない) |
| U-SLOG-002 | `recordEvent` | 正常 append / **不正入力でも throw せず 0 (fail-open)** / 秘匿: `summary` に Bash 引数値・credential・PII が含まれない (`sanitize` 後) |
| U-SLOG-003 | `compressPlanDigest` | events→digest 集計正当 / 同一 (plan,session) 再適用で **idempotent** (event 単位 high-watermark で二重計上なし、U-SLOG-008) / `prev` マージ / `updated_at = max(prev, events)` 巻き戻りなし / `failures` は ts dedupe |
| U-SLOG-004 | `onStop` | session 終了で `.helix/logs/plan/<plan_id>.digest.json` が生成/更新、常に 0 / **plan_id=null のみの session は digest を書かない** |
| U-SLOG-005 | `onSessionStart` | session_start event を append し常に 0 (fail-open)、I/O 失敗でも throw しない |
| U-SLOG-006 | `setActivePlan`/`activePlanUpdatedAt`/`activePlanStale`/`onPostToolUse` (IMP-078 gap②③) | setActivePlan が current-plan 2 行目に updated_at を刻む (1 行目=plan_id 不変、resolveActivePlan は 1 行目読取) / activePlanStale が maxHours 超で true・旧形式 (timestamp 無し 1 行) は false (後方互換) / onPostToolUse の git commit が `headCommit` hash を commit event target に載せる (未供給は target 無し=旧挙動) |
| U-SLOG-007 | `src/cli.ts session start` / `hook post-tool-use` / `session summary` + `.claude/settings.json` + `helix codex --execute` | Claude settings の SessionStart/PostToolUse/Stop が `.claude/hooks/session-log.ts` 直接実装ではなく package-local `src/cli.ts` entrypoint を指す / temp repo で `helix plan use` → `session start` → `hook post-tool-use` → `session summary` を実行すると `.helix/logs/plan/<plan_id>.digest.json` が生成され、session_start/tool_use と touched file が集計される / fake `codex` を PATH に置いた temp repo で `helix codex --execute` と `helix codex --task-file <path> --execute` を実行すると、Codex wrapper も同じ session lifecycle を記録し、legacy source raw Codex guard との共存用に `legacy source_ALLOW_RAW_CODEX=1` + `legacy source_RAW_CODEX_REASON=helix-runtime-adapter-wrapper` を渡す / `helix codex --plan <id> --execute` は `<id>` を session-log の plan_id に使い、provider CLI へ `--plan-id` を渡さない |
| U-SLOG-008 | `compressPlanDigest` (event 単位 high-watermark、PLAN-L7-80) | `session_watermarks[sid]` = その session の matching event を畳み済み件数として持ち、同一 session が複数回 summarize (複数 Stop) されてもログ伸長分の増分のみ計上する (旧 session 単位 fold は 2 回目以降を全 skip = 過少計上) / 増分なし再適用は idempotent / pre-L7-80 digest (session_watermarks 無し) は migration として既計上分 (ts <= updated_at) を再計上せず新規分のみ計上する |
| U-SLOG-009 | `recordSkillInjectionAttempt` (PLAN-L7-325) | skill context injection の `injected` / `no_match` / `missing` / `failed` を `skill_injection` event として session JSONL に残す / `failed` だけ digest failures に入る / target は件数と sanitize 済み reason のみで、skill 本文・provider prompt・secret-like 値を durable log に残さない |

### §1.6 U-FSF (forced-stop フィードバック由来、PLAN-L6-04 add-design / forced-stop-feedback.md §2-§3)
| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-FSF-001 | `detectDanglingTurn` | **純関数**。session_end で閉じたターン=`{dangling:false, from:null}` / `tool_use` 後に session_end 無し=`{dangling:true, from:<最後の session_end 直後の ts>}` / **`session_end` 皆無で `tool_use`/`user_prompt` あり=`{dangling:true, from:events[0].ts}`** / **`user_prompt` のみ trailing (session_end なし)=`{dangling:true}`** / 空 events=`{dangling:false, from:null}` |
| U-FSF-002 | `recordForcedStop` | 正常時 `forced_stop` event を append / **不正入力でも throw せず (fail-open)** / **append された entry に自由テキスト本文 (`message`/`text`/`content`) を含まず、`next_message_ref` が文字列で存在** |
| U-FSF-003 | `classifyFeedback` | 非同期。mock classifier で `mistake`/`feedback` + `attention` 反映 / **classifier が reject/throw/不正出力なら `feedback`+`low`+`unclassified` に倒す** (取りこぼし回避、強制停止 default=やらかし側) |
| U-FSF-004 | `recordFeedback` | `category="feedback"` のみ記載 (`recovery_proposed=attention==="high"`) / **`category="mistake"` は no-op** / **`plan_id=null` は書かない (skip)** / 同一 `ts` idempotent / `summary`/`reason` は `sanitize` 済 (生文・PII・credential なし) |
| U-FSF-005 | `pendingRecoveryProposals` | `recovery_proposed===true && resolved_at===undefined` のみ返す / `resolved_at` 設定済は除外 / **不正 JSON 行はスキップし valid 行のみ返す** / 空時 `[]` |
| U-FSF-006 | `emitClassifyRequest` | managed pmo-haiku 契約 (`role="pmo-haiku"` / `text` / `output_schema.category` / `output_schema.attention`) を含む |
| U-FSF-007 | `scanDanglingStops` | dangling session のみ `forced_stop` 記録 / 正常終了は対象外 / current session 除外 / `forced_stop` 既存は再記録しない (idempotent) / listDir 失敗でも throw せず (fail-open) |

### §1.7 U-SETUP (helix setup solo/team 由来、PLAN-L6-05 add-design / setup-solo-team.md §2-§3)
| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-SETUP-001 | `detectProjectScale` | **never throws**。gh mock: `owner.type=Organization` → `ownerType:"Organization"` / gh 失敗 (未認証/不在) → `ownerType:"unknown", collaborators:null` (throw しない) / **token を読まない** |
| U-SETUP-002 | `recommendPhase` | **純関数**。org OR collaborators>1 OR hasCodeowners OR `hasBranchProtection===true` → `0-B`(high) / `User` かつ collaborators<=1 → `0-A`(high) / unknown 信号 → `0-A`(low、安全フォールバック) / **`hasBranchProtection===null`・`collaborators===null` 単独 (他信号 User+collab<=1) → 0-B にしない (境界)** |
| U-SETUP-003 | `planSetup` | `0-A`=共通 (A 種別) のみ / `0-B`=共通(A)+CODEOWNERS(B)+branch-protection script + `GithubAction{applied:false}` / **teams 名が CODEOWNERS GeneratedFile に反映** |
| U-SETUP-004 | `emitSetup` | `dryRun=true` → `fs.write` 呼ばれず path 一覧のみ返す / `dryRun=false` → 期待ファイル群を書く / **生成内容に token 文字列を含まない** / 既存上書きは confirm 経由 (内部 helper `renderArtifacts` の render 内容もここで被覆) |
| U-SETUP-005 | `recordSetupState` | setup.json に phase/decidedBy/signals を書く / **signals が 4 フィールド (ownerType/collaborators/hasCodeowners/hasBranchProtection) 以外を含まない (strip 検証)** / token 非含 / 再読込で同一 phase / **再実行 (phase 変更) → 上書きで最新 phase のみ読める (append しない)** |
| U-SETUP-006 | `applyBranchProtection` | `apply≠true` → `{applied:false, reason:"emit-only"}` (gh 呼ばれない) / `apply=true` では `gh auth status` が失敗すれば `{applied:false, reason:"gh-auth-required"}` / repository admin 権限が無ければ `{applied:false, reason:"admin-permission-required"}` / `gh auth` と repository admin 権限が揃えば `gh api -X PUT repos/{owner}/{repo}/branches/main/protection` を呼び、`harness-check` required status、admin enforcement、review count 1 を適用して `{applied:true, reason:"applied"}` を返す。token/secret は state/docs/log に保存しない |
| U-SETUP-007 | `runSetup` (orchestration) | ①フラグあり→フラグ値採用 / ②フラグ無し+対話→confirm 結果 / ③フラグ無し+非対話→`0-A` (fallback) / ④`apply=true` は gh auth/admin preflight を通過した場合だけ remote apply へ進み、認証・権限不足は reason 付きで停止する / CLI text は親 `helix setup` を legacy solo/team adapter setup と表示し、HELIX project bootstrap は `helix setup project`、親 setup は VS Code task / `.helix` project baseline / rename packet を生成しないため L14 completion evidence ではないことを表示する |
| U-SETUP-009 | `planSetup` / `emitSetup` | `0-A` の生成計画に clean adapter テンプレ (`AGENTS.md` / `CLAUDE.md` / `.claude/CLAUDE.md` / `.claude/settings.json` / `.codex/config.toml` / `.codex/hooks.json` / Claude subagent templates / Claude slash-command templates) が含まれる。`.claude/settings.json` は `helix hook agent-guard` / `work-guard` / `git-command-guard` を配り、`.codex/hooks.json` は `spawn_agent|spawn_agents_on_csv`、`apply_patch|write_file`、`exec_command|local_shell` に同じ guard intent を配る。dry-run preview は adapter path を返し、dogfood repo 名や machine-local absolute path を含まない。consumer-facing prose / subagent / slash-command は HELIX 名義で、CLI 名と managed marker は `PLAN-M-02` まで `helix` / `HELIX:managed` を維持する。 |
| U-SETUP-010 | `emitSetup` | 既存 consumer `AGENTS.md` / `CLAUDE.md` / `.claude/CLAUDE.md` は既存行を verbatim 保全し、`<!-- HELIX:managed:start -->`〜`<!-- HELIX:managed:end -->` の managed block だけを追加/更新する。既存 `.claude/settings.json` は confirm なしに上書きしない。同じ setup を 2 回走らせても doc 内容は no-op。 |
| U-SETUP-011 | `buildCleanDistributionPlan` | clean distribution channel は `clean-repo-plus-signed-tarball`。artifact path は LICENSE / package / src / adapter templates を含み、adapter templates には Claude/Codex hook・subagent・command 設定を含む。dogfood (`docs/plans` / `docs/design/harness` / `docs/test-design` / `.helix`) と root の開発用 `.claude` / `.codex` 状態、UI (`src/web`) と web 専用テスト (`tests/web.test.ts`) は含まない。release integrity artifact (`tar.gz` / `sha256` / `sig`) を要求する。 |
| U-SETUP-012 | `buildConsumerReadinessPlan` | Bun>=1.3 / git / gh / bare `helix` CLI / runtime CLI を preflight として診断し、gh は GitHub setup 用 warning、Bun/git/`helix`/runtime は blocking。生成 adapter hooks は bare `helix ...` を呼ぶため、PATH 未解決なら consumer hook 自走性を満たさず readiness を fail-close する。`hasHelixCli` 未指定は green ではなく false と扱い、`helix setup project` と `helix distribution plan` はどちらも bare `helix --version` 相当の実測値を渡す。`hasHelixPackageScript` / `package.json.scripts.helix` は VSCode task / CI / package-local smoke の fallback 証跡であり、`helix-cli` check を green にしない。さらに生成 `harness-check.yml` が `bun install --frozen-lockfile` / `bun run typecheck` / `bun run test` を実行するため、`hasBunLockfile`、`hasTypecheckPackageScript`、`hasTestPackageScript` の欠落も blocking check にする。`ci.packagePreflight` は `installCommand="bun install --frozen-lockfile"`、許容 lockfile `bun.lock` / `bun.lockb`、必須 scripts `helix` / `typecheck` / `test`、対応 `bun run ...` command、Bun 公式 sourceUrl / lockfileSourceUrl / scriptsSourceUrl、`sourceCheckedAt=2026-07-03`、latestOfficialStatus、sourceStatusDelta、adoptionDecision、workflowRouteImpact を返し、Bun 公式 docs の frozen-lockfile/lockfile/script 意味が boolean check だけに潰れないことを assert する。package script だけが存在する場合、`cliResolution.strategy=package-script`、`packageScriptAvailable=true`、`bareCommandResolved=false`、`ok=false` となり、hook/agent 用の PATH 修復へ戻す。`distributionPackageSurface` は生成 consumer CI が要求する `bun run helix setup project --dry-run --json` / completion / review-bundle / consumer doctor / rename / team-run の package-local CLI surface を実測した証跡で、未入力または失敗なら `distribution-package-surface` check を blocking fail にする。rollback managed paths、tag-pin contract、CI self-sufficiency、monorepo package-root 判定、全 smoke scenario、`objectiveBoundary` を返す。`objectiveBoundary` は scope=`consumer_setup_readiness_not_whole_program_completion`、配布 reference、versionBinding、progress 90%、`completionClaimAllowed=false`、completion / version-up / cutover packet command を持ち、consumer setup ready を L14 / whole-program completion と誤認させない。`distribution-version-binding` は requested tag が local package version 由来 tag と一致する時だけ ok とし、配布 target tag を採用する場合は version-up activation decision まで fail-close する。 |
| U-SETUP-013 / AT-DIST-001 | `tests/distribution-acceptance.test.ts` | Local clean distribution acceptance smoke: planned clean artifacts を temp repo にコピーし、`src/web/` と `tests/web.test.ts` が artifact に無いことを確認し、`bun install --frozen-lockfile`、`package.json.scripts.helix="bun run src/cli.ts"`、`bun run helix --version`、`bun run build`、`package.json.bin.helix=./dist/helix` の実体存在、`bun src/cli.ts status --json`、`bun src/cli.ts distribution plan --tag v0.1.0 --json`、`bun run typecheck` が fake provider CLI 付きで通ること。さらに clean artifact を `bun link` で temp-local registry に登録し、別の consumer repo に `package.json.scripts.helix` / `scripts.typecheck` / `scripts.test` と `bun.lock` を持たせ、`bun link helix --no-save` した package/bin 経路の `helix --version` / `helix setup project --json` を実行して、fresh import report、readiness ok、`objectiveBoundary.completionClaimAllowed=false`、`objectiveBoundary.versionBinding.localDistributionTag=v0.1.0`、`requestedTagMatchesPackageVersion=true`、配布 target は version-up activation 前に採用済み扱いしないこと、`.vscode/tasks.json`、`.helix/teams/default-hybrid.yaml`、日本語-first adapter / Claude subagent template が実生成されることを確認する。生成 task 相当の `helix status --json` / `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer --json` / `helix rename plan --json` / `helix handover status --json` / `helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json` / `helix setup project --dry-run --json` は、handmade shim ではなく consumer `node_modules/.bin` の linked bin を PATH に載せて実行する。post-setup の実 `helix completion decision-packet --json` は `status=blocked`、`semanticMeaningSummary.completionClaimAllowed=false`、`consumer_setup_boundary` blocker、`CONSUMER-SETUP-BOUNDARY` decision を返すことを確認し、consumer repo の setup ready が L14 completion ready に化けないことを acceptance で固定する。`harness-check.yml` の `run:`、`consumerReadiness.ci.requires`、`CONSUMER_CI_RUN_COMMANDS` は exact に一致させ、acceptance は `bun install --frozen-lockfile`、completion review-bundle、version-up dry-run、`bun run typecheck`、`bun run test` を含む生成 CI command set 全体を consumer repo で実行して post-setup verification と CI command set を一致させる。生成 `harness-check.yml` は GitHub Actions workflow syntax / permissions 公式境界に合わせ、`push:main` / `pull_request:main`、`permissions: contents: read`、secret 不要、`pull_request_target` 不使用を証跡化する。生成 `escalation-stale.yml` も consumer repo 実体で確認し、`permissions: contents: read`、checkout credential 非保持、placeholder/TODO/TBD 不在、`CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS` の handover / completion decision packet / consumer doctor command を linked bin 経由で実行できることを acceptance に含める。生成 Issue / PR template は GitHub template 公式境界に合わせ、Recovery、Add-feature、V-model artifact、検証 checklist を持つことを consumer repo 実体で確認する。consumer doctor profile は dogfood PLAN/design/test-design/runtime artifact を要求せず、setup 投影済み adapter / VSCode task / `.helix` baseline を検査する。brownfield consumer では既存 `AGENTS.md` と `.vscode/tasks.json` を置いた状態で setup を 2 回実行し、consumer 行保持、managed block 重複なし、`.vscode/tasks.json` skip、`importReport.nextRoute=review_import_report` を確認する。外部 clean GitHub repo 作成 / tag push / signed tarball publish は実行しない。source repo 用 full `doctor` は clean distribution の受け入れ条件には含めない。 |
| U-SETUP-039 | `buildConsumerReadinessPlan` / `runHelixProjectSetup.consumerReadiness` | 公開配布 tag の install 再現性と、生成 consumer CI が要求する CLI command surface を分離する。`HELIX-HARNESS-OS` の `v0.1.0` / `v0.1.4` を install できても `bun run helix setup project --dry-run --json` が `unknown option '--json'` で失敗する場合、`distribution-package-surface` は `ok=false`、`consumerReadiness.ok=false`、`postSetupWorkflow.nextRoute=fix_consumer_readiness` になる。`runHelixProjectSetup` と `distribution plan` は `bun run helix setup project --help` を packageRoot で probe し、`--dry-run` と `--json` が公開されている場合だけ `ci.distributionPackageSurface.source=package-script-probe` として ready に進める。実行 smoke は clean distribution acceptance が linked bin で `helix setup project --dry-run --json` を実行して固定する。probe 未実行を green とみなさず、current clean artifact の local-link smoke または version-up activation 後の公開配布 tag smoke を required evidence とする。 |
| U-SETUP-015 | `planHelixProjectSetup` / `runHelixProjectSetup` / `helix setup project` | HELIX 導入済み VSCode で新規 project を始める bootstrap。既存 setup の adapter/hook/CODEOWNERS/emit-only 境界に加え、status / completion decision-packet / completion review-bundle / version-up dry-run / consumer doctor / rename plan / handover status / team-run dry-run の VSCode task、`.vscode/settings.json`、`.helix/memory` / `.helix/handover` / `.helix/evidence` / `.helix/teams` baseline を生成計画に含める。dry-run は state/file/remote 副作用ゼロ、実行時も token/secret を出力せず、branch protection は既定 emit-only とし、`--apply-branch-protection` 指定時は gh auth/admin preflight 通過時だけ remote apply へ進む。wet run は旧 `.helix/state/setup.json` に phase/signal だけを保存しつつ、`.helix/state/project-setup.json` に `helix-project-setup-state.v1`、`objectiveBoundary.scope=consumer_setup_readiness_not_whole_program_completion`、`completionClaimAllowed=false`、completion packet command、version-up dry-run command、postSetupWorkflow verification command、manual verification command、first-run `verificationMatrix[]` を保存する。matrix は自動 no-write command と `manual-local` の VS Code profile open を分け、各 row に `phase` / `command` / `writePolicy=no-write` / `availability` / `requiresMaterializedPaths[]` / `expected` / `evidence` を含める。CLI JSON は `helix-project-setup.v1`、VSCode task、`vscode.profileOpenCommand=code --profile HELIX .`、baseline path、next commands を返す。`postSetupWorkflow.verificationCommands` は `helix setup project --dry-run` / `helix status --json` / `helix setup project --dry-run --json` / `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer` / `helix rename plan --json` / `helix handover status --json` / `helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json` を含む。`postSetupWorkflow.manualVerificationCommands` は `code --profile HELIX .` を含む。ready route は completion blocked packet、version-up plan-only packet、PLAN-M-02 blocked packet、active handover または current PLAN route に接続する。さらに `postSetupWorkflow.verificationMatrix[]` は setup-dry-run、vscode-profile-open、status-frontier、github-ci-safety、completion-decision-packet、completion-review-bundle、version-up-dry-run、consumer-doctor、identifier-cutover-packet、handover-route、team-run-dry-run の phase / command / writePolicy / expected / evidence / source / sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision / adoptionDecisionDelta / workflowRouteImpact を持ち、各 row は `writePolicy=no-write` で初回稼働検証が state/file/remote apply surface や L14 完了 claim に化けないことを示す。VS Code tasks / VS Code profile CLI / Workspace Trust / GitHub Actions read-only CI / completion decision packet / completion review-bundle / version-up dry-run / PLAN-M-02 rename packet / HELIX status-handover / team definition contract を初回稼働証跡へ接続する。VS Code / GitHub / SemVer 公式 source は checked date・現状・状態差分・採用判断・採否差分・route 影響を持ち、source 名だけの stale な根拠にしない。text mode は writePolicy / command / expected / evidence 付き `verification-check:`、checked/status/statusDelta/adoption/adoptionDelta/routeImpact/writePolicy/command 付き `verification-source:`、`manual-verification-command:`、`vscode-profile:` を出す。さらに `canonicalCommand=helix setup project` と `identifierTransition` を返し、現行 HELIX identifiers、`cutoverPlanCommand=helix rename plan --json`、`blocked_pending_cutover_approval`、`mustNotApply=true` を明示して、PLAN-M-02 承認前の setup を rename/cutover 完了と誤認させない。`commandAvailability` は `helix setup project` を canonical command として返し、`enablementStatus=canonical_helix_surface` と `enablementPacketCommand=helix rename plan --json` で外部適用・完了判断 frontier を分離する。consumer doctor は承認前 `.helix/**` state、`package.json` の `bin.helix`、`name=helix` / `@scope/helix` の string `bin`、package scripts、および `.vscode/tasks.json` / `.github/workflows/harness-check.yml` / `.claude/settings.json` / `.codex/hooks.json` / 配布 `.claude/agents/*.md` / `.claude/commands/*.md` 上の lowercase `helix` executable alias 全般を PLAN-M-02 承認前 alias として fail-close し、`rename` / `version-up` / `action-binding` / `hook` などの decision・cutover surface も狭い allowlist に漏らさない。 |
| U-SETUP-016 | `runHelixProjectSetup` | brownfield の既存 managed path を `importReport` に出す。mergeable doc は managed block merge、non-mergeable 構造ファイルは無断上書きせず `skippedExistingPaths` / `requiresReview=true` / `nextRoute=review_import_report` にする。`postSetupWorkflow.nextRoute=review_import_report` の間は、consumer CLI / artifact readiness が green でも `readinessOk=false` とし、import report review 未完了を HELIX work ready と読み替えない。一方、fresh setup 後の同一内容再実行は `identicalManagedPaths` に分類し、`skippedExistingPaths=[]`、prompt なし、managed block 重複なし、`postSetupWorkflow.nextRoute=ready` を維持する。`importReport.skipSubDocs[]` は `marker=skip_sub_doc`、対象 path、理由、次 route、evidence、follow-up gate を持ち、fresh consumer setup では dogfood `docs/plans` / `docs/design/harness` / `docs/test-design` を `consumer_doctor_profile` へ段階化し、brownfield conflict では保持した consumer-owned path を `review_import_report` へ段階化する。 |

U-SETUP-013 / AT-DIST-001 の brownfield acceptance は、既存 consumer-owned file の保持確認と、生成済み consumer repo の再実行 idempotency を別 scenario とする。前者は `review_import_report`、後者は `identicalManagedPaths` により `ready` を期待する。
| U-SETUP-017 | `runHelixProjectSetup.consumerReadiness` / `helix setup project` | projected hook が consumer repo で呼ぶ bare `helix` CLI の PATH 解決性を setup output に出す。解決済みなら readiness は path-ok evidence を返し、未解決なら silent pass せず `bun link` / `bun link helix` remediation を返す。`bun run helix` / `package.json.scripts.helix` は CI と VSCode task の package-local fallback 証跡に限定し、bare PATH 未解決の `helix-cli` check を green にしない。`bun install --frozen-lockfile` / `bun run typecheck` / `bun run test` が生成 CI に入るため、`bun.lock` または `bun.lockb`、`package.json.scripts.typecheck`、`package.json.scripts.test` も readiness の blocking preflight にする。consumer CI smoke は repository secret 不要であることを明示する。`artifactReadiness` は実際の `runHelixProjectSetup` plan に束縛し、0-B/team では `.github/CODEOWNERS` が TL/QA/PO team slug を含み、`{{TL_TEAM}}` / `{{QA_TEAM}}` / `{{PO_TEAM}}` placeholder を残さないことを検査する。`.vscode/tasks.json` は JSON として parse し、schema version `2.0.0`、`tasks` 配列、期待 task 9 本 (status / doctor / completion decision-packet / completion review-bundle / version-up dry-run / rename plan / handover status / setup dry-run / team run dry-run) の label・command・順序・件数、各 task の `type=shell`、`problemMatcher=[]`、task-level `options` 不在、`runOptions.runOn` 未指定または `default` を setup artifact readiness の段階で検査する。`.vscode/settings.json` も JSON として parse し、`task.allowAutomaticTasks=off` だけを green にする。文字列上 required command や `"off"` が含まれていても、余分な task、自動実行 task、`problemMatcher` / `options` drift、`task.allowAutomaticTasks=on` は `fix_consumer_readiness` に戻す。配布 `harness-check.yml` の実テンプレも YAML として parse し、workflow 名 `harness-check`、`push:main` / `pull_request:main`、`pull_request_target` 不使用、`workflow_dispatch` / `schedule` 等の追加 trigger 不在、`permissions.contents=read`、`write-all` または任意 scope の `write` permission 不在、job-level `permissions` override 不在、`jobs.harness-check.runs-on=ubuntu-latest`、`actions/checkout@v4` の `with.persist-credentials=false` かつ余分な checkout input 不在、`oven-sh/setup-bun@v2` の `with:` 不在、固定 2 本以外の `uses:` action 不在、workflow / job / step の custom `env:` 不在、job / step の `if:`・`continue-on-error:` 不在、workflow / job の `defaults`・`concurrency` 不在、job の `strategy`・`container`・`services`・`environment`・`needs`・`timeout-minutes`・`uses`・`secrets` 不在、step の `shell`・`timeout-minutes`・`working-directory` 不在、dot / bracket / 空白入り bracket の secret 参照なしに加え、`run:` command が `CONSUMER_CI_RUN_COMMANDS` の固定 13 本 (`bun install --frozen-lockfile`、10 本の package-local `bun run helix ...` smoke、`bun run typecheck`、`bun run test`) と順序・件数まで完全一致しなければ fail-close する。必須 smoke が全てあっても余分な `run:` が混じる workflow は read-only CI evidence にしない。`contents: read` があっても `pull-requests: write` 等が混在する workflow や job-level permission override を持つ workflow は read-only CI evidence にしない。checkout が認証情報を job 後続 step に残す workflow、setup-bun / env injection を含む workflow、または固定 smoke を skip / soft-pass できる expression control field を持つ workflow も read-only CI evidence にしない。readiness が `ok=true` でも `objectiveBoundary` は `completionClaimAllowed=false`、versionBinding、completion / completion review-bundle / version-up / cutover packet command を返し、setup ready と L14 完了を同じ意味にしない。 |
| U-SETUP-018 | `runConsumerDoctor` | consumer profile は生成済み `.vscode/tasks.json` の schema version が `2.0.0`、`tasks` が配列、task label/command が期待値であることに加え、各 expected task が `type=shell`、`problemMatcher=[]`、`runOptions.runOn` 未指定または `default`、task-level `options` なしであること、かつ `.vscode/settings.json` が `task.allowAutomaticTasks=off` であることを検査する。さらに `.helix/state/project-setup.json` が `helix-project-setup-state.v1`、`setupCommand=helix setup project`、`objectiveBoundary.scope=consumer_setup_readiness_not_whole_program_completion`、`completionClaimAllowed=false`、completion packet command、postSetupWorkflow の completion packet / version-up dry-run / consumer doctor verification command、manual VS Code profile open command、first-run `verificationMatrix[]` 全11行を保持することを fail-close で検査し、setup ready や consumer doctor green を whole-program completion ready と読み替えない。matrix は automatic `verificationCommands[]` と manual-local command を分け、setup-dry-run / vscode-profile-open / status-frontier / github-ci-safety / completion-decision-packet / completion-review-bundle / version-up-dry-run / consumer-doctor / identifier-cutover-packet / handover-route / team-run-dry-run の phase と対応 command の順序・件数まで固定し、重複 command や phase だけを揃えた state を fail-close する。各 row は `writePolicy=no-write`、`requiresMaterializedPaths[]`、非空 expected/evidence を要求する。余分な task でも `runOn=folderOpen` など自動実行があれば fail-close する。schema version 差分、`tasks` 非配列、non-empty `problemMatcher`、`type` 差分、automatic tasks on、setup state 欠落、completion 境界 drift、matrix 欠落や薄い matrix は fail-close し、VS Code Tasks / Workspace Trust / project setup state の境界を「生成されたから安全」と読み替えない。 |
| U-SETUP-019 | `runHelixProjectSetup` / `runConsumerDoctor` | `githubPlan` は `helix-project-github-plan.v1`、`planOnly=true`、`appliesRemote=false`、`applyCommandAvailable=true`、`requiredChecks=["harness-check"]`、branch protection は emit-only 既定かつ gh auth/admin preflight 付き apply-capable script を返す。`githubPlan.pullRequestCreation` は `status=preflight_required`、`preferredSurface=gh-cli`、`connectorFallback=github-app`、`requiredConnectorPermissions=["metadata:read","contents:read","pull_requests:write"]`、`failureMode=resource_not_accessible_by_integration`、`gh auth status` と repo default branch 確認、draft PR command template、remediation を返し、PR 作成権限不足を main 直 merge や raw push に逃がさない。`githubPlan.branchProtection.scriptPath` を返す場合は、0-A/0-B とも setup preview / written path に同じ gh preflight script が含まれ、存在しない script path を JSON で案内しない。`doctorBaseline` は `helix-project-doctor-baseline.v1`、setup dry-run / status / setup dry-run JSON の github-ci-safety / `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer` / `helix rename plan --json` / handover status / team-run dry-run、`.helix/memory|handover|evidence|teams` baseline、`completionClaimAllowed=false` を返し、`postSetupWorkflow.verificationCommands` と一致する。consumer doctor は `.github/workflows/harness-check.yml` を YAML として読み、workflow 名、`push:main` / `pull_request:main`、`pull_request_target` 不使用、top-level `permissions.contents=read`、write permission 不在、job-level `permissions` override 不在、`actions/checkout@v4` の `with.persist-credentials=false` かつ余分な checkout input 不在、`oven-sh/setup-bun@v2` の `with:` 不在、workflow / job / step の custom `env:` 不在、job / step の `if:`・`continue-on-error:` 不在、workflow / job の `defaults`・`concurrency` 不在、job の `strategy`・`container`・`services`・`environment`・`needs`・`timeout-minutes`・`uses`・`secrets` 不在、step の `shell`・`timeout-minutes`・`working-directory` 不在、`CONSUMER_CI_RUN_COMMANDS` と完全一致する `run:` command set、secret 不使用を fail-close で検査する。必須 command が揃っていても余分な `run:` がある場合は `exactRuns=false` として violation にする。さらに `.github/ISSUE_TEMPLATE/recovery.md` / `add-feature.md` / `.github/PULL_REQUEST_TEMPLATE.md` が Recovery / Add-feature / V-model artifact / 検証 checklist を持つことを検査し、GitHub template が「存在するだけ」の運用入口にならないよう fail-close する。配布済み Claude subagent / slash-command は setup template manifest 由来の全 expected file を要求し、frontmatter YAML を parse する。subagent は `name` がファイル名と一致し、`description` / `tools`、consumer-safe、`helix status` / `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer`、secret/PII 禁止、findings-first を持つこと、slash-command は `description`、`helix status --json`、`helix completion decision-packet --json`、`helix completion review-bundle --json`、version-up dry-run、consumer doctor 導線を持つことを検査する。 |
| U-SETUP-020 | `loadTemplates` / `BUILTIN_GITHUB_TEMPLATES` / `runHelixProjectSetup.postSetupWorkflow` | consumer repo へ配布する adapter doc、Claude subagent、Claude slash-command、setup next action は日本語-first の説明文を持つ。CLI 名、識別子、status token、command は原語を許容するが、旧英語説明文 (`This project uses` / `Use repository-local` / `Act as a` / `Run helix...`) は built-in fallback と `docs/templates/adapter/` 実体のどちらにも残さない。`helix-test` を含む slash-command は status preflight、completion packet preflight、version-up dry-run、consumer doctor 導線を持ち、doctor green 単独を completion ready に読み替えない。 |
| U-SETUP-021 | `runHelixProjectSetup` | `helix setup project --apply-branch-protection` は `gh auth status` と repository admin 権限を preflight し、通過した場合だけ remote branch protection apply へ進む。認証・権限不足や API 失敗は reason 付きで停止し、token/secret は保持しない。 |

2026-07-02 追補: U-SETUP-015 / U-SETUP-017 は、`commandAvailability.currentCommandAvailable` が
`consumerReadiness.checks[name=helix-cli].ok` と一致すること、text surface が `post-setup-next-action:` /
`blocked-until:` / `verification-command:` / `verification-check:` / `verification-source:` を列挙すること、consumer doctor が adapter docs の日本語既定、
`helix doctor --profile consumer`、PLAN-M-02 cutover boundary、承認前 `.helix/**` state 未生成、executable HELIX alias 未露出、VS Code task safety を検査することを
含める。
生成 VSCode task は CI と同じ package-local 経路 `bun run helix ...` を使い、consumer shell の PATH に
bare `helix` が無いだけで初回 task が失敗する状態へ戻さない。`postSetupWorkflow.verificationMatrix[]`
の全 row は `writePolicy=no-write` を持ち、text mode の `verification-check:` は writePolicy / command /
expected / evidence を出す。
ただし package-local `bun run helix` は hook / agent が呼ぶ bare `helix` の PATH 証跡ではないため、
`consumerReadiness.checks[name=helix-cli]` は bare PATH 解決だけで green になり、package script のみでは
`fix_consumer_readiness` に戻る。wet setup state には first-run matrix を永続化し、consumer doctor は
matrix 欠落、`version-up-dry-run` 欠落、command 不一致、`writePolicy` drift、evidence/expected 欠落を
fail-close する。
| U-SETUP-022 | `loadTemplates` / `BUILTIN_GITHUB_TEMPLATES` / `runHelixProjectSetup.consumerReadiness` / `runConsumerDoctor` / `tests/distribution-acceptance.test.ts` | legacy `helix setup` が生成する `team/setup-branch-protection.sh` と built-in fallback は `gh auth status`、repository admin 権限確認、`gh api -X PUT`、`/branches/main/protection`、`harness-check` context、admin enforcement、review count 1 を含む apply-capable script である。setup artifact readiness と consumer doctor は token/secret 永続化を禁止しつつ、script が gh auth/admin preflight 付きで remote apply できることを `consumer-branch-protection-script` で検査する。distribution acceptance は clean artifact から生成された consumer repo の script 実体を読み、gh preflight apply-capable 境界を確認する。 |
| U-SETUP-023 | `loadTemplates` / `PROJECT_SETUP_FILES` / `runConsumerDoctor` / `tests/distribution-acceptance.test.ts` | setup は `.helix/teams/default-hybrid.yaml` を built-in fallback と `docs/templates/project/` 実体の両方から配布し、consumer doctor は file 存在、YAML parse、`teamDefinitionSchema`、`buildTeamRunPlan(definition, "hybrid")` dry-run を検査する。valid YAML は Codex worker と Claude reviewer の provider 分離を持ち、missing / malformed / single-provider worker-reviewer は fail-close。VS Code task、consumer CI、clean distribution acceptance は同じ `helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json` を実行し、AGENTS の team-run 案内だけが先行する状態を許さない。 |
| U-SETUP-024 | `analyzeConsumerEscalationWorkflowContract` / `runHelixProjectSetup.consumerReadiness` / `runConsumerDoctor` | `common/escalation-stale.yml` は配布 workflow として `.github/workflows/escalation-stale.yml` に materialize されるため、placeholder/noop を許可しない。YAML を parse し、workflow 名 `escalation-stale`、weekly schedule、追加 trigger 不在、`pull_request_target` 不在、top-level `permissions.contents=read`、任意 write permission 不在、job 名 `escalation-audit`、`runs-on=ubuntu-latest`、job-level permissions override 不在、checkout `persist-credentials=false`、setup-bun 入力不在、custom env / `if` / `continue-on-error` / defaults / concurrency / strategy / environment / needs / timeout / services / job secrets / step shell / working-directory 不在、secret 参照不在、`placeholder` / `TODO` / `TBD` / `FIXME` 不在を要求する。`run:` は `bun install --frozen-lockfile`、`bun run helix handover status --json`、`bun run helix completion decision-packet --json`、`bun run helix doctor --profile consumer --json` の固定 4 本と順序・件数まで一致しなければ fail-close する。setup readiness は違反時 `projected-consumer-artifacts` を false にし、consumer doctor は `consumer-escalation-workflow - violation` を出して `ok=false` にする。 |
| U-L1L2-001..006 | `analyzeL1L2Consistency` / `loadL1L2ConsistencyInput` / `l1L2ConsistencyMessages` / `runDoctor` | [l1-l2-consistency L6 addendum](../../design/harness/L6-function-design/l1-l2-consistency.md) の oracle。L1 `screen-requirements.md` と L2 `screen-list.md` の画面 ID 双方向被覆、screen-list 全画面の `ui-element.md` 固有行、`screen-flow.md` / `wireframe.md` / `ui-element.md` の dangling screen ID、`wireframe.md` frontmatter `pair_artifact` を fail-close で検査する。IMP-039 self-pair と G2 PASS 済み Low-Fi 縮約は充足扱いで、現行 live repo 15 画面が green であることを固定する。doctor は `l1-l2-consistency - OK` / `violation` を hard gate に出す。 |
| U-SETUP-037 | `runHelixProjectSetup` / `bootstrapProjectPackageLockfile` | fresh consumer repo で `helix setup project` を wet run した場合、`package.json` と `bun.lock` を生成し、`bun install --lockfile-only` を package root で実行する。生成 `package.json` は `scripts.helix="helix"`、`scripts.typecheck="bun run helix status --json"`、`scripts.test="bun run helix completion review-bundle --json"`、`devDependencies.helix=github:RetryYN/HELIX-HARNESS`、`devDependencies.typescript=^5.6.3`、`private=true` を持つ。`consumerReadiness.ok=true`、`cliResolution.packageScriptAvailable=true`、`postSetupWorkflow.nextRoute=ready` を返し、VSCode task / CI が package-local `bun run helix ...` を実行できる surface を持たない fresh repo を ready にしない。 |
| U-SETUP-038 | `mergeConsumerPackageJson` / `bootstrapProjectPackageLockfile` | brownfield consumer repo で既存 `package.json` に必須 script または dependency を merge した場合、既存 `bun.lock` があっても `bun install --lockfile-only` を実行して lockfile を更新する。既存 script は上書きせず、欠落している `typecheck` / `test`、`devDependencies.helix`、`devDependencies.typescript` を追加する。`importReport.mode=brownfield` だが mergeable package surface のみなら `requiresReview=false` / `nextRoute=ready` とし、stale lockfile のまま `bun install --frozen-lockfile` が落ちる状態を consumer readiness green にしない。 |

### §1.8 U-HOVER (handover 記録機構由来、PLAN-L6-06 add-design / handover-mechanism.md §2-§3)
| U-ID | 検証対象 | oracle (DbC) |
|---|---|---|
| U-HOVER-001 | `resolveHandoverScope` | **never throws**。current-plan state 有 → `active_plan` 解決 / `.helix/logs/plan/*.digest.json` を `listDir` で集約 / **壊れ JSON 行・不在は skip** / 無 → `{active_plan:null, digests:[]}` |
| U-HOVER-002 | `buildPointer` | **純関数**。`digest_summary` = 対象 digest の commits/files/failures **件数**集計 / **`digests` 非空なら active_plan の null/非 null に関わらず集計 / `digests` 空のときのみ `digest_summary=null`** / `active_plan` は scope 値を透過 (null 可) / `updated_at=now`。**edge: `active_plan=null` だが `digests` 非空 → digest_summary は集計値 (null にしない)** |
| U-HOVER-003 | `scaffoldFromDigests` | **純関数**。digest.commits/files_touched → `deliverables` / planMeta.kind/title → `plans.summary` / **`next_actions`/`carry`/`po_decisions`/`do_not_break` が空配列 (human 未記入)** |
| U-HOVER-004 | `renderHandoverScaffold` | **純関数**。§6.8.5 の 6 セクション (①-⑥) を含む / 生成 markdown の③は日本語見出し `§3 次アクション` とし、要件上の Next Action 概念へ対応する / `outstanding` 未指定の後方互換経路では③-⑥に `TODO(human)` placeholder / `outstanding` 指定時は③を workflowNextActions 由来の marker + PLAN/route/packet commands/packet 要約で seed し、⑤未了 PO 判断を outstanding marker で seed する / `packet要約` の `確認field` は field 単位で sanitize してから結合し、S4 の `decisionRecord.source_ledger_freshness` / `decisionEvidenceChecklist.unresolved_risk` / `decisionEvidenceChecklist.route_impact` などの具体 field が 120 文字 truncation で消えないことを検証する / **具体 oracle: 入力 `HandoverDoc.plans[0].summary` に `token=secret123` を含めると出力は `secret123` を含まず `token=***` を含む (render 時 `sanitize` 適用の defense-in-depth、tracked md への流出ゼロ)** |
| U-HOVER-005 | `handoverStale` | **純関数**。`updated_at=null`/parse 不能 → true / 24h 超 → true / 24h 以内 → false / **境界 (now-updated_at=24h ちょうど) は stale でない (`>` 判定)** / **具体 oracle: `now`/`updated_at` を UTC ISO8601 で与え `Date.parse` 数値差分で判定 (辞書順比較でない)** |
| U-HOVER-006 | `setActivePlan` + `inferPlanFromCommit` | `setActivePlan` が `.helix/state/current-plan` を書き `resolveActivePlan` が同値を読む (**round-trip**) / **`null`+`removeFile` 有 → file 削除で clear / `null`+`removeFile` 無 → 空文字書込 → `resolveActivePlan` が空文字を null 相当に落とす (両 clear 経路を検証)** / `inferPlanFromCommit`: `PLAN-L6-06-...` 抽出 / 非該当文字列 → null / **`-F -` heredoc 様 (本文に PLAN 文字列なし) → null** |
| U-HOVER-007 | `runHandover` (orchestration) | **`dryRun=true` → md/CURRENT.json を書かず `content` を返す (`written=[]`、非破壊)** / 通常 → md **追記** (既存上書きしない) + CURRENT.json 更新 / **`complete=true` → CURRENT.json の `status==="completed"` かつ `active_plan === (args.planId ?? scope.active_plan)`** |
| U-HOVER-008 | `sameFamilyPlan` / `dedupeDigests` (IMP-048) | `sameFamilyPlan`: 同一 id → true / bare ⊂ slug (`-` 境界付き prefix) → true / `bare が slug の prefix だが `-` 境界でない (例: `PLAN-L7-0` vs `PLAN-L7-04`) → false (誤マッチ防止)` / 無関係 → false / **対称 (a,b)=(b,a)**。`dedupeDigests`: 同 family の bare/slug ゴーストを **最長 id** へ union 集約 (commits/files_touched/sessions の union、files_touched は重複除去) / 無関係 PLAN は別 group のまま残す / **推移的マージ: bare 無しで slug 2 種 + bare が後着でも全部 1 group へ収束 (順序非依存)** |
| U-HOVER-009 | `resolveHandoverScope` scopeToActive (IMP-048) | 既定 (option 無し): `dedupeDigests` のみ → bare/slug は 1 件に畳まれ別 PLAN は残る (digest 数 = family 数 + 無関係 PLAN 数) / `scopeToActive: true`: **active family の digest のみへ絞る** / **scopeToActive だが active family が digest に無い → 全件 fallback (空 handover 回避)** |
| U-HOVER-010 | `readPointer` / `checkHandoverDiscipline` (IMP-047) | `readPointer`: 不在 → null / 壊れ JSON → null / 正常 → object。`checkHandoverDiscipline`: **活動なし (digest 空) → 警告ゼロ (規律対象外)** / 活動あり + CURRENT.json 不在 → `"handover 未生成"` warn / 活動あり + fresh pointer (同 family) → 警告ゼロ / 活動あり + stale pointer → `"stale"` を含む warn / 活動あり + pointer が別 plan → `"drift"` を含む warn / **活動あり + fresh pointer だが `active_plan=null` (完了済正常形) → drift 無音 (I-2: null は family 比較から除外)** |
| U-HOVER-011 | `checkHandoverBypass` / `countHandoverEntries` (IMP-078 gap①) | pointer 不在 → 警告ゼロ (discipline 担当) / `generated_by` 欠落 (手書き pointer) → `"bypass"` warn / `generated_by` 一致 + entry 数一致 → 警告ゼロ / latest_doc の handover entry 数 > `doc_entry_count` (手書き追記) → `"mismatch"` warn。`countHandoverEntries`: 生成見出し `# セッション引き継ぎ` と旧英語見出し `# Session Handover` の両方を entry として数える / null→0 |
| U-HOVER-012 | `resolveHandoverScope` scopeToSession / `latestSessionId` (IMP-078 gap④) | `scopeToSession`: 指定 session が触れた digest のみへ絞る / 該当無し → 全件 fallback (空 handover 回避)。`latestSessionId`: session jsonl 群から最新 event ts の session_id を返す / 不在 → null / 壊れ行 skip。**runHandover の readPlanMeta family 解決 (gap⑤): bare plan_id digest でも slug PLAN file を解決し kind を埋める (unknown 防止)** |
| U-HOVER-013 | `renderHandoverScaffold` slimSummary / `runHandover` 同日累積 (A-138 ITEM-4) | `slimSummary=true` → §1/§2 を「同日 first entry 参照」stub に縮約し plan list / deliverables 本体を省く (`§3-§6` は全文維持) / **handover header は 1 個維持** (`countHandoverEntries` 不変)。`runHandover`: 同日 2 件目 (existing 非 null) は slim render + 追記、`doc_entry_count` は header 数と一致 (bypass 照合契約不変) |
| U-HOVER-014 | `boundSameDayEntries` / `runHandover` 累積上限 (PLAN-L7-83) | **純関数**。entry 数 ≤ `maxEntries-1` / handover header 不在 → 入力をそのまま返す (圧縮不要) / 超過 → **anchor (entry[0]) + 直近 (maxEntries-2) を残し中間を 1 行 breadcrumb へ畳む** (`countHandoverEntries` = `maxEntries-1`) / **breadcrumb は header に一致せず `countHandoverEntries`/`doc_entry_count` 契約を壊さない** / breadcrumb 文言で剪定件数を明示 (no silent cap)。`runHandover`: 反復 append でも同日 doc の header 数 ≤ `MAX_SAME_DAY_ENTRIES`・定常で上限ちょうど・`doc_entry_count` は md header 数と一致 |
| U-HOVER-015 | `runHandover` marker reconcile (drift 恒久解消、PLAN-L7-83) | **`complete=true` → `current-plan` marker を clear** (`resolveActivePlan→null`) し `checkHandoverDiscipline` が drift を出さない / **`--plan X` の in_progress → marker = X へ同期** (override 由来 drift 解消) / **plain in_progress (`--plan` 無し) → marker 無変更** (無駄書き回避) / **`dryRun=true` → marker を書かない** (非破壊不変)。reconcile した marker path は `written` に計上 (透明性) |
| U-HOVER-016 | `capWithBreadcrumb` / `renderHandoverScaffold` summary cap (PLAN-L7-88) | **純関数**。上限超過時は先頭 `MAX_SUMMARY_PLANS` 件 + breadcrumb 1 行に畳み、残件数を文言で明示する (no silent cap)。上限以下 / `max<=0` は無制限。`renderHandoverScaffold` は §1 PLAN サマリと §2 成果物の双方で cap を発火させ、先頭と breadcrumb を残し、末尾の非表示 PLAN が出力に残らない。session-scope 等で入力が小さい場合は cap 不発。 |
| U-HOVER-018 | `helix handover status --json` / `helix handover update --owner` / `readPointer` CLI preflight | `CURRENT.json` 不在なら exit 0 + JSON `exists:false, stale:false, stale_reasons:[]` を返し、通常セッション開始へ進める。壊れた JSON は exit 1 + `exists:true, stale:true, stale_reasons:["CURRENT.json is unreadable or invalid"]`。`helix handover --plan X` で生成後、`handover status --json` は `exists:true/stale/stale_reasons/active_plan/status/generated_by/latest_doc/outstanding.completionReadiness/completionDecisionPacket` を JSON で返す。`completionDecisionPacket.sourceCommand` は `helix handover` で、blocked packet は required record の `recordTemplates` を保持する。`outstanding` / `completionDecisionPacket` / `semanticFeatureFrontierRecords` / `confirmedCurrentMeaningRecords` は CURRENT.json の古い snapshot ではなく live PLAN state から read-only overlay され、古い pointer に G-SF field が無くても `frontier_pending_decision` / `parked_future_version` / `approval_gated_cutover` と `completionClaimAllowed=false`、および confirmed-current 11 意味単位を再開 preflight で復元する。`updated_at` が 24h 超なら `stale:true` と reason を返す。`handover update --owner codex` は既存 CURRENT.json に `owner` / `owner_updated_at` を追加して baton 所有者だけを移譲し、`updated_at` は変更しない。owner 更新だけで stale handover を fresh に見せてはいけない。owner 欠落、空 owner、危険文字、不在/壊れ CURRENT.json は fail-close する。text mode は active/status/owner/stale/updated_at/latest_doc、semantic frontier 件数、confirmed-current meaning 件数を返す。provider handover status とは別 surface で、通常 handover の `.helix/handover/CURRENT.json` を読む。 |

2026-07-02 追補: U-HOVER-018 は `handover status --json` が live outstanding 由来の `workflowNextAction` /
`workflowNextActions[]` と `objectiveProgress` を返し、text mode が `objective-progress:` /
`workflow-next:` / `workflow-next-actions:` / `workflow-next-action[n]: ... action=... route=... packet=... supporting=...`
を表示することも検査する。handover 再開時に進捗%、completion packet command、次に記録すべき判断、
plan 別 supporting packet、route が直接表示されることを必須にする。
| U-HOVER-019 | `checkHandoverCompletionDecisionPacket` / doctor hard gate | pointer 不在は skipped/OK。`outstanding.completionReadiness.ok=false` なのに `completionDecisionPacket` が無い旧 CURRENT.json は fail-close。blocked outstanding と同じ snapshot 由来の `sourceCommand="helix handover"` packet は OK で、各 decision は `decisionPacketCommand` / `packetCommands` を保持する。旧 schema の handover packet が `supportingPacketSummaries[]`、`semanticMeaningSummary`、`semanticFeatureFrontierRecords[]`、`confirmedCurrentMeaningRecords[]` のいずれかを持たない場合は、sourceCommand が `helix handover` のときだけ live outstanding から再構成して検査し、handover status と同じ read-only overlay 境界に揃える。standalone `helix completion decision-packet --json` packet の転記、freshness/shape lint violation、`completionReadiness` と packet ok/status 不一致、`outstanding.items.length` と packet decision count 不一致は fail-close。`runDoctor.ok` はこの gate に連動し、doctor green が古い handover pointer を隠さない。 |
| U-HOVER-020 | `renderHandoverScaffold` / `checkHandoverNextActionAnchor` / doctor hard gate | `outstanding` 指定時、§3 次アクション (Next Action) は `HANDOVER_NEXT_ACTION_MARKER`、`completion-review-coverage`、`semantic-frontier-records`、`confirmed-current-meaning-records`、PLAN ID、required action、next workflow route、primary packet、supporting packet commands、各 packet の schemaVersion / matrixField / expectedMatrixCount / requiredReviewFields / requiredReviewFields count / requiredMatrixFields / reviewRoute を示す `packet要約` を出し、`TODO(human): 順序付き次手` を残さない。`completion-review-coverage` は `covered=` と `non-packet=` を出し、review packet で閉じる blocker と packet 外 blocker を Markdown 再開面でも分離する。`semantic-frontier-records` は `featureId` / `classification` / `planId` と `completion-claim-allowed=false` を出し、`confirmed-current-meaning-records` は confirmed 11 意味単位 ID と `boundary=downstream_evidence_required` を出す。markdown handover の human-facing 表示では既知の required action / route / reviewRoute が日本語化され、machine route は `確認観点ID=` に分離する。`record the PO/S4 decision...` や `確認観点=review S4 decision evidence...` のような英語 prose を再開者向け表示へ露出しない。PLAN-M-02 rename approval-draft は `確認観点=非承認の approval draft record / current snapshot binding / safety flag を確認してから人間承認へ進む` と `確認観点ID=review non-authorizing approval draft records, current snapshot binding, and safety flags before any human approval copy` を同時に出し、英語 route を `確認観点=` へ戻さない。最新 handover entry の §3 は marker だけでなく blocked route の `completion-review-coverage`、`covered=`、`non-packet=`、`semantic-frontier-records`、`confirmed-current-meaning-records`、`completion-claim-allowed=false`、`boundary=downstream_evidence_required`、`packet要約`、`確認field件数=`、`確認field=`、`matrix必須field=`、`確認観点ID=` も必須。§3 欠落、latest_doc 読取不能、§3 が TODO のまま、marker-only、review coverage 欠落、意味台帳欠落、source-delta field 欠落、machine review route ID 欠落、または machine review route を `確認観点=` に露出する旧 §3 なら fail-closeし、`runDoctor.ok` に連動する。複数 entry では最新 entry の §3 だけを見る。 |
| U-HOVER-021 | `runHandover` + `deriveHandoverSnapshot` + `detectPointerDrift` + Stop hook warning surface | `helix handover` は legacy pointer fields を維持しつつ `derivedSnapshot` を harness.db `plan_registry` / `feedback_events` と git baseline から再生成する。既存 CURRENT.json の `takeover_note` は保持し、手書きで古くなった派生 field は `derivedPointerDrift[]` と `checkHandoverDerivedPointerDrift` warning へ出す。再生成済み CURRENT.json は nested `derivedSnapshot` を比較対象にするため、次回 `helix handover` / Stop hook で同一 DB/git snapshot が常時 drift になってはならない。 |

### §1.9 U-SLOT (agent-slots 由来、PLAN-L7-08 / IMP-050)

| U-ID | 関数 | oracle |
|------|------|--------|
| U-SLOT-001 | `loadSlots` | 不在 → `[]` / 壊れ JSON → `[]` / 非配列 (`{}` 等) → `[]` / **never throw** |
| U-SLOT-002 | `fireSlot` / `releaseSlot` | `fireSlot`: running slot を追記し永続化、返り値 `status="running"` / `released_at=null` / `role` 省略 → `null`。`releaseSlot`: terminal status + `released_at` 記録 + `exit_code` 記録 / 返り `true`。対象なし → `false` / 既 release 済 (2 回目) → `false` (idempotent) |
| U-SLOT-003 | `listActiveSlots` / `listStaleSlots` | `listActiveSlots`: `status==="running" && released_at===null` のみ返す。`listStaleSlots(deps, 5)`: active かつ `(now - fired_at) / 60000 > 5` のみ / **`>` 判定: ちょうど 5 分は stale でない** / 閾値内の fresh slot は含まない |
| U-SLOT-004 | `peakParallel` | 時間的に重なる 3 slot → peak `3` / 直列 (非重なり) → peak `1` / `released_at=null` (実行中) → peak に算入 (2 slot 両方 null → `2`) |
| U-SLOT-005 | `exceedsParallelLimit` | active < `DEFAULT_MAX_PARALLEL` → `false` / active `=== DEFAULT_MAX_PARALLEL` → `true` (`>=` 判定) / `max` override: `exceedsParallelLimit(deps, 100)` で `false` |
| U-SLOT-006 | `recordGuardFire` | active が `max-1` の時点では `exceeded=false` / 次の fire で active `=== max` → `exceeded=true` / **stale な `agent_guard` slot は `cancelled` に自動失効し active から外れる** (stale 持続汚染防止) / stale 失効後の `activeCount` は失効前より小さい |
| U-SLOT-007 | `sweepStaleGuardSlots` | セッション末尾の dangling guard slot (閾値超) を `cancelled` 失効し件数を返す / 閾値内の guard slot・非 guard slot・既 release は失効しない / 対象なし → `0` / 冪等 (二度目 `0`) |
| U-SLOT-008 | `releaseOldestGuardSlot` | 最古の running guard slot を `completed` で release し active を 1 減 (FIFO) / `released_at=now` / 非 guard slot は対象外 / 対象なし → `null` (idempotent) / **SubagentStop n 回 = active を n 件閉じても count は厳密** (個体同定不要、IMP-106) |

### §1.10 U-TEAM (team schema 由来、PLAN-L7-08 / IMP-050)

| U-ID | 関数 | oracle |
|------|------|--------|
| U-TEAM-001 | `teamDefinitionSchema` | `strategy` 省略 → `"sequential"` (default) / `max_parallel` 省略 → `8` (default) / `max_parallel===MAX_TEAM_PARALLEL` は受理 / `max_parallel>MAX_TEAM_PARALLEL` は zod throw (resource exhaustion 防止) / `members` 空配列 → zod throw (reject) / 不正 `role` (許可リスト外) → throw / 不正 `strategy` (`"burst"` 等) → throw / `serialize_after` + `serialization` (3 条件フィールド) を含む入力 → 受理 (`parsed.serialization.downstream_dependency===true` / `parsed.members[1].serialize_after==="se"`) |
| U-TEAM-002 | `mustSerialize` | 3 条件すべて `false` → `false` / `file_conflict=true` → `true` / `downstream_dependency=true` → `true` / `shared_state=true` → `true` / `undefined` → `false` |
| U-TEAM-003 | `recommendTeamLaunch` | `hybrid` + trivial/simple task → `should_launch=false` / `hybrid` + risk または standard+ task → cross-provider `definition` 付きで `should_launch=true` / non-`hybrid` → `should_launch=false`, `trigger="unavailable"` |

### §1.11 U-BACKFILL (backfill-pairing lint 由来、IMP-051)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-BACKFILL-001 | `parseRequires` / `parseGlossaryTerms` | `parseRequires`: YAML `requires:` list の path を配列で返す / `requires: []` → `[]` / section 無し → `[]`。`parseGlossaryTerms`: `§6 用語更新` section 内の `- **term**:` の term のみ抽出 / 次 heading 以降は含まない / section 無し → `[]` |
| U-BACKFILL-002 | `parsePlan` | frontmatter の `plan_id`/`kind`/`status` + `parseRequires` + `parseGlossaryTerms` を `ParsedPlan` に構造化。`plan_id` frontmatter 有り → その値 / `requires` / `glossaryTerms` が正確に取れること |
| U-BACKFILL-003 | `KIND_BACKFILL` マトリクス | `"add-impl"` → `"required"` / `"refactor"` → `"conditional"` / `"troubleshoot"` → `"conditional"` / `"impl"` → `"none"` / `"design"` → `"none"` / `"reverse"` → `"none"` / `"recovery"` → `"none"` の全種確認 |
| U-BACKFILL-004 | `analyzeBackfill` | ① required (add-impl) に Reverse requires 有 → `reverseOrphans=[]` / `ok=true` / ② required (add-impl) に Reverse 無 → `reverseOrphans=[{plan_id, kind}]` / `ok=false` / ③ conditional (refactor) に Reverse 無 → `conditionalPending` に 1 件 / `reverseOrphans=[]` / `ok=true` (warn のみ、ok を落とさない) / ④ §6 用語が glossary 未 merge → `glossaryGaps=[{plan_id, term}]` / `ok=false` / ⑤ `status="archived"` → 対象外 (reverseOrphans に含まれない) |
| U-BACKFILL-005 | `backfillMessages` | 孤児なし (空 plans) → `"OK"` を含む文言 1 件 / reverseOrphan あり → `"Reverse 無き impl"` を含む warn 文言 |
| U-BACKFILL-006 | `loadBackfillDocs` + `analyzeBackfill` (実 repo 回帰ガード) | `loadBackfillDocs()` で実 `docs/plans/` 全 PLAN を読み `analyzeBackfill` を実行 → `reverseOrphans=[]` / `glossaryGaps=[]` (実 repo の back-fill 完全性を CI で継続確認) |

### §1.12 U-SCRUMREV / U-PROP (governance enforcement lints 由来、PLAN-L7-10 / IMP-064/065)

> pair = L6 governance-enforcement.md §2。A=scrum-reverse / C=propagation。B (backfill hard) は U-BACKFILL-006 + doctor.ok 連動で被覆。

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-SCRUMREV-001 | `parseLinks` / `parseSrPlan` | `parseLinks`: `requires:` + `references:` の YAML list を 1 集合へ / frontmatter の `decision_outcome`/`promotion_strategy` を inline コメント除去で抽出 |
| U-SCRUMREV-002 | `analyzeScrumReverse` (pocOrphans) | confirmed poc (reuse-with-hardening) を指す reverse 無 → `pocOrphans` 1件/`ok=false` / reverse 有 → 0件/`ok=true` / `promotion_strategy=redesign` → 孤児にしない / 非 confirmed (pivot) → 対象外 |
| U-SCRUMREV-003 | `analyzeScrumReverse` (badReverseRefs) | reverse が confirmed でない poc (pivot) を参照 → `badReverseRefs` 1件/`ok=false` / `status=archived` → 対象外 |
| U-SCRUMREV-004 | `scrumReverseMessages` | 孤児なし → `"OK"` / 孤児あり → `"Reverse 合流が無い"` 文言 |
| U-SCRUMREV-005 | `loadSrPlans`+`analyzeScrumReverse` (実 repo 回帰ガード) | 実 `docs/plans/` で `pocOrphans=[]` / `badReverseRefs=[]` (confirmed poc は Reverse 合流済、redesign 除く) |
| U-SCRUMREV-006 | `analyzeScrumReverse` (emptyReverseFullbacks) | enforcement 境界以降の terminal reverse が `generates` に `docs/plans/` 外の正本 artifact を持たない場合は `emptyReverseFullbacks` violation / 正本 artifact を持つ場合は OK / draft reverse は検査対象外 / enforcement 境界より前の legacy reverse は grandfather / `created` 欠落は legacy 扱いにせず fail-close |
| U-SCRUMREV-007 | `loadReverseSeedMarkers`+`analyzeScrumReverse` (unresolvedSeedMarkers) | 正本 doc の `trace seed` + `PoC 段階` marker が参照する poc に terminal reverse が存在する場合は seed 未変換 violation / reverse が draft の間は作業中として許容 / loader は concept / requirements から planId と行番号を抽出 / live repo では seed marker 変換済みで green |
| U-PROP-001 | `extractSignals` | `\| signal \| mode \|` ヘッダのテーブルのみから signal 列 token 抽出 / 別表 (reverse/fullstack) と interrupt subtype は除外 |
| U-PROP-002 | `analyzePropagation` | 両 doc 一致 → `ok=true` / concept のみ → `conceptOnly`+`ok=false` / requirements のみ → `requirementsOnly`+`ok=false` |
| U-PROP-003 | `propagationMessages` | 一致 → `"OK"` / 不一致 → `"未伝播"` 文言 |
| U-PROP-004 | `loadPropagationDocs`+`analyzePropagation` (実 repo 回帰ガード) | concept §2.6 ⇔ requirements §7.8.1 の signal 語彙一致 (`conceptOnly=[]`/`requirementsOnly=[]`) |

### §1.13 U-VPAIR (vmodel pair-freeze lint 由来、PLAN-L7-11 / IMP-067)

> pair = L6 vmodel-pair-freeze.md §1-§3。design doc ⇔ test-design doc の `pair_artifact` 双方向整合・孤児0 (設計層 pair freeze、G1-G6)。G7 の 4 artifact 12-edge trace はスコープ外。

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-VPAIR-001 | `loadPairDocs` | `docs/design/harness/**` + `docs/test-design/harness/**` の frontmatter (path/layer/pair_artifact) を読む / `README.md`・`roadmap.md` を対象外 / inline コメント (`pair_artifact: self  # ...`) を除去して値抽出 |
| U-VPAIR-002 | `analyzePairFreeze` (pair-missing/ref-unresolved) | layer L1-L6 sub-doc で pair_artifact 欠落 → `pair-missing` 1件/`ok=false` / pair_artifact path 不実在 → `ref-unresolved`/`ok=false` |
| U-VPAIR-003 | `analyzePairFreeze` (trace-bidir) | design→test-design に対し test-design の dir 集合参照が design の所在 dir を含む → pair 成立 / 逆参照無 → `trace-orphan`/`ok=false` |
| U-VPAIR-004 | `analyzePairFreeze` (self-pair / L2 group) | `pair_artifact: self` → 孤児にしない / L2 group (wireframe 参照) は hub が self-pair なら成立 |
| U-VPAIR-005 | `loadPairDocs`+`analyzePairFreeze` (実 repo 回帰ガード) | 実 repo で `orphans == []` (全 V-pair が双方向、孤児0) |
| U-VPAIR-006 | `pairFreezeMessages` | 孤児なし → `"OK"` / 孤児あり → reason 別文言 (`pair 欠落`/`参照不実在`/`逆参照なし`) |

### §1.14 U-VTRIG (検証発火 = 層群 freeze の機械発火、PLAN-L7-12 / IMP-068)

> pair = L6 vmodel-pair-freeze.md §7。V-model 層群 (L0-L3 / L4-L6 / L0-L6) の Forward freeze 完了を検知し検証サイクル発火を surface。

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-VTRIG-001 | `analyzeVerificationGroups` | 層群ごとに confirmed/draft/placeholder を集計、total = 層群内 design sub-doc 数 |
| U-VTRIG-002 | `analyzeVerificationGroups` (frozen) | draft 0 + 孤児0 + confirmed≥1 → frozen=true / placeholder は park で発火を妨げない / draft 1+ → frozen=false |
| U-VTRIG-003 | `analyzeVerificationGroups` (孤児) | 層群に pair 孤児 → frozen=false |
| U-VTRIG-004 | `verificationGroupMessages` | frozen → `"freeze 完了"`+`"検証サイクル発火可"`+park 表示 / 未 → `"Forward 進行中"` |
| U-VTRIG-005 | `loadPairDocs`+`analyzeVerificationGroups` (実 repo ガード) | L0-L3 frozen=true (A-100、L2 park) / L4-L6 frozen=false |

### §1.15 U-REVIEW / U-XREVIEW / U-TORDER (review 前置の機械強制、IMP-071 + IMP-076 + IMP-077)

> ペア = `review-evidence.md` / `cross-review-enforcement.md` / `test-before-review.md` (L6↔L7)。review 前置証跡 (review_evidence) の presence (IMP-071) + cross_agent distinctness (same_model_approval、IMP-076) + 定量テスト→定性レビュー順序 (tests_green_at≤reviewed_at、全駆動モデル普遍、IMP-077) を機械保証する純関数の oracle。

| U-ID | 対象関数 | DbC oracle |
|---|---|---|
| U-REVIEW-001 | `hasReviewEvidence` | `review_evidence:` 直後に `- reviewer:` entry ≥1 → true / key だけ・無し → false (presence のみ、shape は zod) |
| U-REVIEW-002 | `parseReviewPlan` | plan_id/kind/status/hasEvidence を frontmatter から抽出 |
| U-REVIEW-003 | `analyzeReviewEvidence` (missing) | confirmed の design/impl 系で evidence 無し → `missing` + `ok=false` |
| U-REVIEW-004 | `analyzeReviewEvidence` (ok) | design/add-design/impl/add-impl すべて evidence あり → `missing=[]`/`ok=true` |
| U-REVIEW-005 | `analyzeReviewEvidence` (対象外) | draft (未確定) / poc・charter・reverse (非 design-impl) / archived は missing にしない (過検知回避) |
| U-REVIEW-006 | `loadReviewPlans`+`analyzeReviewEvidence` (実 repo CI fail-close ガード) | hard 化後 (IMP-071): 実 repo の confirmed design/impl PLAN は全件 review_evidence あり (`missing==[]`) + cross_agent 違反0 (`crossReviewViolations==[]`)。以後 review 証跡なし PLAN を足すと red |
| U-REVIEW-007 | `analyzeReviewEvidence` (stale approval、IMP-080) | draft / 降格 PLAN に `verdict=approve` が残る → `staleApprovalViolations` + `ok=false` |
| U-REVIEW-008 | `analyzeReviewEvidence` (stale approval ok) | confirmed + approve / draft + 証跡なし → stale approval ではない |
| U-XREVIEW-001 | `analyzeReviewEvidence` (cross_agent ok) | cross_agent で worker_model≠reviewer_model → `crossReviewViolations=[]` / `ok=true` (IMP-076) |
| U-XREVIEW-002 | `analyzeReviewEvidence` (same_model) | cross_agent で worker≡reviewer の同一 model → violation / `ok=false` (same_model_approval、concept §2.1.2.1) |
| U-XREVIEW-003 | `analyzeReviewEvidence` (model 欠落) | cross_agent で model 欠落 → violation (単体 runtime は相異 model 供給不可 = cross_agent 僭称を弾く) |
| U-XREVIEW-004 | `analyzeReviewEvidence` (非 cross_agent) | intra_runtime_subagent は model 同一/欠落でも対象外 (cross-provider 要件は cross_agent のみ) |
| U-XREVIEW-005 | `extractReviewEntries` | frontmatter yaml から review_kind/worker_model/reviewer_model/reviewed_at/tests_green_at を抽出 (parse 失敗/不在は []) |
| U-TORDER-001 | `analyzeReviewEvidence` (順序 ok) | tests_green_at ≤ reviewed_at → `testBeforeReviewViolations=[]` / `ok=true` (IMP-077) |
| U-TORDER-002 | `analyzeReviewEvidence` (順序違反) | tests_green_at > reviewed_at → `review_before_test` violation / `ok=false` |
| U-TORDER-003 | `analyzeReviewEvidence` (欠落) | tests_green_at 欠落 → `missing_tests_green_at` violation |
| U-TORDER-004 | `analyzeReviewEvidence` (全駆動モデル普遍) | kind=reverse 等 非 design/impl でも review_evidence entry があれば順序対象 |
| U-TORDER-005 | `analyzeReviewEvidence` (対象外) | draft (未確定) は順序対象外 |
| U-GREENDEF-005 | `greenCommandMatchesKind` / `frontmatterSchema` / `analyzeReviewEvidence` | `green_commands[].kind` と `command` の意味が一致しない場合 (`kind=doctor` だが `bun run lint` など) は schema と review-evidence lint の両方で fail。`unit_test` は test/vitest、`typecheck` は typecheck/tsc、`lint` は lint/biome/plan lint、`doctor` は doctor、`vmodel_lint` は vmodel lint を command text に含む |
| U-GREENDEF-006 | `frontmatterSchema` / `analyzeReviewEvidence` | `green_commands[].output_digest` は `sha256:<64 hex>` のみ許可する。16 桁などの短縮 digest は `invalid_output_digest` または schema error で fail |

### §1.16 U-MDRIFT (module-drift lint = 設計⊇実在の包含、PLAN-L7-16 / IMP-075)

> ペア = `module-drift.md` (L6↔L7)。architecture §3.1 設計 module 集合 ⊇ `src/` 実在 module の包含 drift (impl→design back-fill 漏れ) を機械保証する純関数の oracle。

| U-ID | 対象関数 | DbC oracle |
|---|---|---|
| U-MDRIFT-001 | `parseListedModules` | §3.1 見出し〜次見出しに限定し表 1 列目 `**name**` を抽出 / §3.2 以降の太字を含まない / 重複排除 |
| U-MDRIFT-002 | `parseListedModules` (不在) | §3.1 セクション不在 → `[]` (パース失敗を空虚 ok にしない) |
| U-MDRIFT-003 | `analyzeModuleDrift` (orphan) | 実在するが未列挙 → `orphans` + `ok=false` / listedCount・actualCount 集計 |
| U-MDRIFT-004 | `analyzeModuleDrift` (将来 module) | 設計が web/roster/skills を余分列挙 (src 未実在) は drift でない → `orphans=[]`/`ok=true` |
| U-MDRIFT-005 | `loadModuleDocs`+`analyzeModuleDrift` (実 repo CI fail-close ガード) | 実 repo の `src/` 実在 module は全件 architecture §3.1 列挙 (`orphans==[]`) + listedCount≥actualCount。以後 src module を足して設計未列挙だと red |

### §1.16.0a U-ASSETDRIFT (internal asset cutover lint = legacy source runtime 前提の残存検出)

> ペア = `module-drift.md` asset-drift alias。内部資産 markdown と prompt template を正本のまま維持しつつ、個人 legacy source workspace path / legacy `legacy-source` 委譲 / skill catalog 空 / guard allowlist 乖離を doctor hard gate で検出する。

| U-ID | 対象関数 | DbC oracle |
|---|---|---|
| U-ASSETDRIFT-001 | `analyzeAssetDrift` (legacy source path residue) | enrolled `.claude/agents` / `docs/skills` asset に個人 legacy source workspace path があれば `legacy-source-path-residue` + `ok=false` |
| U-ASSETDRIFT-002 | `analyzeAssetDrift` (legacy command residue) | enrolled asset に `legacy-source codex` / `legacy-source claude` / `legacy-source plan` / `legacy-source gate` / `legacy-source handover` があれば `legacy-command-residue` + `ok=false` |
| U-ASSETDRIFT-003 | `analyzeAssetDrift` (docs-skills vacancy) | enrolled `docs/skills` root が `.gitkeep` 以外の asset を持たなければ `empty-docs-skills` + `ok=false` |
| U-ASSETDRIFT-004 | `analyzeAssetDrift` (guard allowlist missing) | guard allowlist entry に対応する `.claude/agents/<id>.md` が無ければ `missing-allowlisted-agent` + `ok=false` |
| U-ASSETDRIFT-005 | `analyzeAssetDrift` (isolated fixture) | enrolled roots が無い isolated test fixture は unrelated doctor tests を落とさず skip (`checkedAssets=0`, `ok=true`) |
| U-ASSETDRIFT-006 | `loadAssetDriftInput` + `analyzeAssetDrift` (実 repo guard) | 実 repo の active internal assets と prompt templates は legacy source path residue 0 / legacy command residue 0 / docs-skills non-empty / missing allowlisted agent 0 |
| U-ASSETDRIFT-007 | `loadAssetDriftInput` nested `.claude/agent-memory` scan | nested agent memory markdown を再帰的に enroll する。stale な local memory 内の legacy runtime 名 / env 残存は doctor を迂回せず `asset-drift` で fail する |

### §1.16.1 U-CHGIMPACT (code change impact lint = コード変更時の設計・テスト更新漏れ検出)

> ペア = `module-drift.md` change-impact addendum。`src/**` 変更を含む change set が design PLAN/doc と test/test-design の更新を同時に持つか検査する。

| ID | 対象 | Oracle |
|---|---|---|
| U-CHGIMPACT-001 | `analyzeChangeImpact` (missing test) | `src/**` + design 更新のみ → `missingTest=true` / `ok=false` |
| U-CHGIMPACT-002 | `analyzeChangeImpact` (covered) | `src/**` + design 更新 + tests または test-design 更新 → `ok=true` |
| U-CHGIMPACT-003 | `analyzeChangeImpact` (docs-only) | docs/test のみで `src/**` 変更なし → `sourceFiles=[]` / `ok=true` |
| U-CHGIMPACT-004 | `parseGitPorcelain` | modified / rename / untracked の porcelain path を正規化し、rename は新 path を採用 |
| U-CHGIMPACT-005 | `analyzeChangeSetIntegrity` (source plan missing) | `src/**` 変更があり changed set 内に L7 実装系 PLAN (`impl` / `add-impl` / `refactor` / `retrofit` / `troubleshoot`) が無い場合、`source-plan-missing` blocker で `ok=false` |
| U-CHGIMPACT-006 | `analyzeChangeSetIntegrity` (source plan contract missing) | L7 実装系 PLAN があっても parent L6 design / pair artifact / test evidence のいずれかを欠く場合、`source-plan-contract-missing` blocker で `ok=false` |
| U-CHGIMPACT-007 | `analyzeChangeSetIntegrity` (source plan contract covered) | L7 実装系 PLAN が parent design、pair artifact、test evidence を持つ場合、未承認 L7 実装 blocker は出ない |

### §1.16.1a U-ROUTEMODE (route mode first-class 投影)

| ID | Target | Oracle |
|---|---|---|
| U-ROUTEMODE-001 | `rebuildHarnessDb` / `projectDriveRuns` | `drive_runs.mode` に投影される required drive model は `route_modes.mode` にも同時投影される。各 `route_modes` row は `plan_id`、`drive_run_id`、`mode`、`source` を持ち、`drive_run_id` は既存 `drive_runs` row と join できる。`idx_route_modes_plan_mode` は physical-data §9.3 と schema registry で一致する。 |

### §1.16.1b U-RELGRAPH (cross-artifact relation graph = docs/code/DB/evidence impact の検査)

> Pair = `module-drift.md` Cross-Artifact Relation Graph Addendum (A-124/A-125 / PLAN-L6-31)。PLAN-L7-32 が承認済み L7 実装 entry である。
>
> **Status (PLAN-L7-32 塊C span, 2026-06-10)**: U-RELGRAPH-001..006 は `tests/relation-graph.test.ts` の green `it` へ、`it.todo` から昇格済み。対象 source は `src/lint/relation-graph.ts`。`collectRelationGraphProjection` (001..003) と `analyzeRelationImpact` (004..006, source/design/test-design/physical-data 変更の波及 action + behavioral-contract conditional + missing-projection/stale-edge を ok=false finding 化、change-impact へ無音 fallback しない) を検証する。PLAN-L7-32 (collect+impact) はこれで実装完了。U-RELGRAPH-007..010 (`exportRelationDiagram` / `collectVerificationEvidenceProjection`) は PLAN-L7-36。

> **Status (PLAN-L7-36 follow-up span, 2026-06-11)**: U-RELGRAPH-007..010 は `src/lint/relation-graph.ts` に対する `tests/relation-graph.test.ts` の green `it` へ、`it.todo` から昇格済み。対象は `exportRelationDiagram` (deterministic Mermaid + DOT/D2 unavailable-adapter finding) と `collectVerificationEvidenceProjection` (A-125 evidence projection rows + invalid/external-not-allowed findings、raw payload excluded)。

| ID | Target | Oracle |
|---|---|---|
| U-RELGRAPH-001 | `collectRelationGraphProjection` source/doc/test nodes | requirements、PLAN、design、test-design、source、test fixture は stable node ID、typed edge、重複しない `(kind,id,path)` row を生成する。 |
| U-RELGRAPH-002 | `collectRelationGraphProjection` DB nodes | physical-data DB projection fixture は table node と upstream requirement/ADR/PLAN edge を生成する。orphan table reference は finding になる。 |
| U-RELGRAPH-003 | projection sanitization | MCP evidence、browser/tool fixture、provider transcript 風 field、secret 風 value、screenshot/trace blob は projection row へコピーしない。classification、counts、evidence path、redacted summary だけを残す。 |
| U-RELGRAPH-004 | `analyzeRelationImpact` source change | 変更された `src/**` node は sibling test、L6 design contract、L7 unit oracle、PLAN、reverse/backprop guard action へ展開される。 |
| U-RELGRAPH-005 | `analyzeRelationImpact` docs/DB change | 変更された design/test-design/physical-data node は paired artifact、該当 DB table node、PLAN DoD、trace-freeze evidence action へ展開される。behavioral contract edge が無い限り source test は要求しない。 |
| U-RELGRAPH-006 | missing projection coverage | graph projection が無い、または stale edge しかない changed node は `ok=false` と finding を返す。弱い `analyzeChangeImpact` result へ無音 fallback してはならない。 |
| U-RELGRAPH-007 | `exportRelationDiagram` Mermaid | 同一 graph snapshot は stable node order、stable edge label、raw evidence payload なしの deterministic Mermaid を出力する。 |
| U-RELGRAPH-008 | optional diagram adapters | installed adapter なしで DOT/D2 を要求した場合は unavailable-adapter finding を返し、tool の install や invoke を暗黙実行しない。 |
| U-RELGRAPH-009 | `collectVerificationEvidenceProjection` valid evidence | A-125 `verification-evidence-v1` record は evidence path 付きの `verification_profiles`、`verification_recommendations`、`mcp_server_runs`、`external_tool_findings` projection row になる。 |
| U-RELGRAPH-010 | `collectVerificationEvidenceProjection` invalid evidence | malformed evidence、schema 欠落、または `allow_external` なしの external run は finding になる。raw external payload は除外したままにする。 |
| U-RELGRAPH-011 | `loadRelationGraphSourceSet` node scope | 実 repo loader は `docs/adr/**/*.md`、`docs/governance/document-system-map.md`、`docs/skills/**/*.md`、`.codex/hooks.json` を design node として materialize する。これらの path 変更は `missing-projection` ではなく changed node として扱われ、旧対象外扱いだった `docs/skills/**` は node 欠落時に fail-close する。 |

### §1.16.1c U-TOOLADAPTER (A-124 graph/diagram adapter probe 検査)

> Pair = `module-drift.md` Tool Adapter Probe Addendum (A-124 / PLAN-L6-33)。これらの oracle は dependency-cruiser、Knip、Madge、Graphviz DOT、Mermaid、D2 を optional adapter として扱う。明示的な workflow evidence なしに package install や adapter execution を承認しない。

| ID | Target | Oracle |
|---|---|---|
| U-TOOLADAPTER-001 | `catalogToolAdapters` complete candidates | catalog は dependency-cruiser、Knip、Madge、Graphviz DOT、Mermaid、D2 を trigger signal、package/executable ref、output format、risk/default state 付きで含む。 |
| U-TOOLADAPTER-002 | optional adapter policy | 外部 adapter は package/executable/config readiness が証明されるまで、既定で disabled/unavailable である。 |
| U-TOOLADAPTER-003 | `probeToolAdapter` package readiness | dependency-cruiser/Knip/Madge/Mermaid/D2 の package declaration 欠落は readiness finding になり、暗黙 install にならない。 |
| U-TOOLADAPTER-004 | `probeToolAdapter` executable readiness | Graphviz `dot` または D2 executable 欠落は unavailable-adapter finding になり、無関係な local check を fail させない。 |
| U-TOOLADAPTER-005 | workspace scope | adapter probe は、将来の人間承認済み PLAN が明示許可しない限り、home-directory や repo-external scan scope を拒否する。 |
| U-TOOLADAPTER-006 | `normalizeToolAdapterRun` tool run row | adapter command、version、input scope、exit code、evidence path を `tool_runs` row へ正規化する。 |
| U-TOOLADAPTER-007 | dependency evidence normalization | dependency-cruiser/Madge の cycle または forbidden-edge output は、raw output を gate truth にせず `dependency_edges` と finding へ正規化する。 |
| U-TOOLADAPTER-008 | dead-node evidence normalization | Knip の unused file/dependency/export output は review を要求する finding へ正規化する。auto-fix/delete は scope 外のままにする。 |
| U-TOOLADAPTER-009 | `planDiagramRefresh` stale diagram | graph snapshot digest 不一致は既存 diagram artifact を stale とするか、review/handover 利用前の refresh を要求する。 |
| U-TOOLADAPTER-010 | renderer availability | Mermaid export を既定の text output とする。adapter readiness なしの DOT/D2 renderer 要求は暗黙 install ではなく finding を返す。 |

> **Status (PLAN-L7-34, 2026-06-11)**: U-TOOLADAPTER-001..010 は `src/lint/tool-adapter.ts` に対する `tests/tool-adapter.test.ts` の green `it` へ昇格済み。adapter catalog、package/executable readiness finding、workspace-scope refusal、normalized projection row、dead-node review finding、stale diagram refresh、renderer-unavailable finding は pure であり、package install や external tool invoke を行わない。

### §1.16.1c U-MCPPROFILE (A-125 profile config / safety lint 検査)

> Pair = `function-spec.md` MCP Profile Config / Safety Addendum (A-125 / PLAN-L6-32)。これらの oracle は L7 source change 前の generated local MCP config、Docker MCP Toolkit profile inclusion、external-profile safety lint を覆う。

| ID | Target | Oracle |
|---|---|---|
| U-MCPPROFILE-001 | `catalogVerificationProfiles` complete candidates | catalog は MCP Inspector、Playwright MCP、GitHub read-only MCP、Docker MCP Toolkit、Vitest browser Playwright provider、Testcontainers、MSW を trigger signal と source URL 付きで含む。 |
| U-MCPPROFILE-002 | disabled-by-default policy | 外部または MCP profile は全て `defaultEnabled=false` を持つ。built-in Bun/doctor profile は enabled のままにする。 |
| U-MCPPROFILE-003 | Docker MCP Toolkit metadata | Docker MCP Toolkit profile は optional として印付けされ、Docker を要求し、profile-isolation value を持つ。Docker/toolkit readiness が証明されるまで test runner にならない。 |
| U-MCPPROFILE-004 | `renderGeneratedMcpConfig` local config | generated config は suggested local config content/path だけを書き、既定では `.vscode/mcp.json` や committed secrets を書かない。 |
| U-MCPPROFILE-005 | workspace mount restriction | home-directory または global mount を使う filesystem/git profile config は `global-mount` finding を返す。 |
| U-MCPPROFILE-006 | credential non-persistence | generated config 内の inline token 風 value は redact または reject される。env var 名は許可する。 |
| U-MCPPROFILE-007 | `analyzeVerificationProfileSafety` source trust | registry/catalog に存在するだけでは `trusted=true` にできない。official source URL と package identity が一致しなければならない。 |
| U-MCPPROFILE-008 | GitHub MCP read-only guard | write tool を持つ、または broad toolset なのに `requires_human_approval` が無い GitHub profile は safety finding を返す。 |
| U-MCPPROFILE-009 | package integrity readiness | declared package/install hint の不一致、または package declaration 欠落は readiness finding になり、暗黙 install にならない。 |
| U-MCPPROFILE-010 | Docker controls | Docker availability または documented profile/resource control が無い Docker MCP Toolkit profile は ready ではない。 |
| U-MCPPROFILE-011 | `planExternalProfileActivation` trigger routing | UI/GitHub/DB/API/MCP-profile signal は、実行前に必要な probe/smoke/human-approval step を生成する。 |
| U-MCPPROFILE-012 | no implicit activation | profile recommendation は、明示的な `allow_external` / approved workflow evidence なしに package install、server enable、external tool run を行わない。 |
| U-MCPPROFILE-013 | `renderGeneratedMcpConfig` launcher argv (PLAN-L7-79) | generated `mcpServers.<id>` は tokenized argv を持つ。`command` は command head、`args` は残り token である。command 全体の文字列を単一 `args` 要素に詰めず、probe-hint `executable` を `args` に再混入しない (例: `command:"bun"`, `args:["run","test:local"]` であり、`args:["bun run test:local"]` ではない)。 |
| U-MCPPROFILE-014 | `probeVerificationProfile` launcher readiness (PLAN-L7-79 follow-up) | generated launcher command head が profile の executable probe hint と異なる場合、probe readiness は launcher も検査する。package/executable readiness だけでは、generated command が起動不能な profile を ready にできない。 |
| U-MCPPROFILE-015 | `catalogVerificationProfiles` 右腕 metadata | external / test-foundation profile が `recommendedGates` / `recommendedDrives` を持ち、G8-G14 evidence profile の選択が catalog から意味的に切り離されない。Browser profile は G10/G11 と `fe` / `fullstack` / `agent` に接続し、Testcontainers / MSW / MCP Inspector は G8/G9、doctor / GitHub read-only は G12-G14 に接続する。 |
| U-MCPPROFILE-016 | `analyzeRightArmVerificationProfileCoverage` drive L10 hard gate | `fe` / `fullstack` / `agent` は常に L10 を要求する。これらの drive から G10 browser profile mapping を全て外した場合、非 browser profile が G10 を名乗っても充足扱いにせず、`missing-drive-g10-profile` と `missing-right-arm-gate-profile` を返す。`be` / `db` は `ui_only` のままだが、UI ありの slice では同じ G10 browser profile list を公開する。 |
| U-MCPPROFILE-017 | `analyzeRightArmVerificationProfileCoverage` G10 browser evidence semantic gate | 非 browser profile が `recommendedGates=["G10"]` と常時 L10 drive を宣言しても、drive 別 L10 の browser evidence には数えない。G10 gate metadata 自体は存在しても、`fe` / `fullstack` / `agent` の `g10Profiles` は browser profile のみを返し、browser profile が 0 件なら fail-close する。 |
| U-MCPPROFILE-018 | `analyzeRightArmVerificationProfileCoverage` verification source ledger binding | G8-G14 を `recommendedGates` に持つ profile は `Verification source ledger` の source row と checked date に接続する。binding が無い、checked date が右腕 ledger と一致しない、または profile の recommended gate が binding source row の gate impact に含まれない場合は `missing-source-ledger-binding` / `stale-source-ledger-binding` / `source-ledger-gate-mismatch` で fail-close し、package/sourceUrl 文字列だけを右腕 evidence 根拠にしない。 |

> **Status (PLAN-L7-33, 2026-06-11; PLAN-L7-79, 2026-06-19; PLAN-L7-226, 2026-07-02)**: U-MCPPROFILE-001..018 は `src/lint/verification-profile.ts` に対する `tests/verification-profile.test.ts` の green `it` へ昇格済み。catalog/profile metadata、Docker MCP Toolkit readiness metadata、local MCP config 生成 (tokenized launcher argv を含む U-MCPPROFILE-013)、launcher readiness probing (U-MCPPROFILE-014)、右腕 gate / drive L10 metadata、G10 browser evidence semantic gate、verification source ledger binding (U-MCPPROFILE-015/016/017/018)、safety finding、activation planning は pure であり、package install、server enable、外部 tool 実行、committed MCP config 書き込みを行わない。

### §1.16.1d U-DOCEXPORT (A-126 canonical document export 検査)

> Pair = `function-spec.md` Canonical Doc Export 追補 (A-126 / PLAN-L6-34)。これらの oracle は concept、requirements、detailed design、PLAN、ADR、test-design doc から CSV/Markdown/XLSX/PPTX derived artifact への変換を覆う。PLAN-L7-35 TDD Red evidence なしに package installation や source implementation を承認しない。

| ID | Target | Oracle |
|---|---|---|
| U-DOCEXPORT-001 | `parseCanonicalDocumentStructure` supported families | parser は repo-relative source path 付きで concept、requirements、design、plan、adr、test-design の document family を受け入れる。 |
| U-DOCEXPORT-002 | source anchors preserved | heading、section ID、FR/AC/AT ID、PLAN ID、ADR ID、status field、evidence link は projection 内に残る。 |
| U-DOCEXPORT-003 | malformed/unsupported docs | unsupported family または source path 欠落は finding を返し、export row を捏造しない。 |
| U-DOCEXPORT-004 | `buildDocumentExportDataset` deterministic rows | 同じ document projection と export profile は stable な row/sheet/slide-outline ordering を生成する。 |
| U-DOCEXPORT-005 | redaction before render | secret 風、credential 風、PII 風、raw provider、raw MCP payload field は render 前に redact または refuse される。 |
| U-DOCEXPORT-006 | large document splitting | 大きい requirements/design doc は silent truncation ではなく document family または section で分割する。 |
| U-DOCEXPORT-007 | built-in CSV/Markdown render | CSV と Markdown summary は external package readiness なしに render する。 |
| U-DOCEXPORT-008 | optional XLSX readiness | ExcelJS/SheetJS readiness なしの XLSX request は、暗黙 install ではなく renderer-unavailable finding を返す。 |
| U-DOCEXPORT-009 | optional PPTX readiness | PptxGenJS/D2 readiness なしの PPTX request は、暗黙 install ではなく renderer-unavailable finding を返す。 |
| U-DOCEXPORT-010 | `recordDocumentExportArtifact` projection rows | render 成功時は source snapshot hash 付きで `document_export_runs`、`document_export_datasets`、`document_export_artifacts` row を作る。 |
| U-DOCEXPORT-011 | generated artifact boundary | generated spreadsheet/deck edit は canonical docs や gate truth を mutate しない。 |
| U-DOCEXPORT-012 | stale source snapshot | source digest 不一致は review/handover 利用前に既存 export artifact を stale と印付ける。 |

> **Status (PLAN-L7-35, 2026-06-11)**: U-DOCEXPORT-001..012 は `src/export/document-export.ts` に対する `tests/document-export.test.ts` の green `it` へ昇格済み。supported family parsing、source anchor、deterministic dataset、redaction、built-in CSV/Markdown rendering、optional renderer finding、projection row、derived-artifact boundary、stale source snapshot detection は pure であり、canonical docs を mutate しない。

### §1.16.1e U-DEPD / U-REGEXP (dependency-drift + regression expansion 検査)

> Pair = `function-spec.md` dependency-drift rule (ADR-002/IMP-032) + roadmap G-L7.D。これらの oracle は固定文言を pure import-graph lint と regression-scope expansion に置き換え、旧 doctor scaffold stub を閉じる。

| ID | Target | Oracle |
|---|---|---|
| U-DEPD-001 | `analyzeDependencyDrift` allowed graph | 許可された source module import は deterministic module edge と OK message へ正規化される。 |
| U-DEPD-002 | disallowed dependency | runtime -> lint のような reverse dependency は `disallowed-module-dependency` finding を返す。 |
| U-DEPD-003 | cycle detection | cyclic module import は deterministic `module-cycle` finding を返す。 |
| U-REGEXP-001 | `expandRegressionScope` affected modules | 変更された source module は direct test と reverse-dependent module test へ展開される。 |
| U-REGEXP-002 | missing coverage | direct test coverage が無い changed source module は silent fallback ではなく `missing-regression-test` finding を返す。 |

> **Status (PLAN-REVERSE-42, 2026-06-11)**: U-DEPD-001..003 と U-REGEXP-001..002 は `src/lint/dependency-drift.ts` に対する `tests/dependency-drift.test.ts` で green。`doctor` は `dependency-drift` / `regression-expansion` を surface し、scaffold stub を出さない。

### §1.16.1f U-VTRIG L0-L7 (implementation verification cycle gate 検査)

> Pair = `vmodel-pair-freeze.md` verification group trigger + roadmap G-L7.E。L0-L7 implementation band は L7 freeze 後に機械的に表示される verification cycle gate である。

| ID | Target | Oracle |
|---|---|---|
| U-VTRIG-005-L7 | `VERIFICATION_GROUPS` L0-L7 | real repo guard surface includes `実装検証サイクルゲート` and the L0-L7 group is frozen. |

> **Status (PLAN-L7-43, 2026-06-11)**: U-VTRIG-005 now asserts L0-L7 / `実装検証サイクルゲート` in `tests/vmodel-pair.test.ts`; `doctor` surfaces the implementation verification cycle gate.

### U-CODE 追補 (coding-rules lint = requirements-level coding rule SSoT)

> Pair = `module-drift.md` Coding Rules Addendum。Requirements-level TS core coding rules は `src/lint/coding-rules.ts` と `doctor` で機械強制される。

| ID | Target | Oracle |
|---|---|---|
| U-CODE-001 | `analyzeCodingRules` explicit any | source/test docs 内の `any` type node -> `no-explicit-any` violation |
| U-CODE-002 | `analyzeCodingRules` source max params | 4 個以上の param を持つ source function/method/constructor -> `max-source-params` violation |
| U-CODE-003 | `analyzeCodingRules` suppression comment 検出 | `@ts-ignore` / `@ts-expect-error` / `eslint-disable` / `biome-ignore` -> `no-suppression-comment` violation |
| U-CODE-004 | `analyzeCodingRules` file naming | kebab-case ではなく `index.ts` でもない TS file -> `file-name-kebab` violation |
| U-CODE-005 | test scope split | param が 4 個以上の test helper は OK のまま。ただし no-any/no-suppression/naming は適用する |
| U-CODE-006 | real repo guard | `loadCodingRulePolicy` + `loadCodingRuleDocs(process.cwd())` + `analyzeCodingRules` は violations `[]` を返す。`doctor` は `coding-rules` を surface し `ok` を link する |
| U-CODE-007 | workflow placement | `loadCodingWorkflowDocs` + `analyzeCodingRules` は Forward と Add-feature の workflow doc 内の `CODING-RULE-WORKFLOW` / SSoT reference 欠落を検出する。README は gate 対象外 |
| U-CODE-008 | structured error handling | documented でない empty body または rethrow-only body の source catch block -> `structured-error-handling` violation |
| U-CODE-009 | module boundary | `src/lint/*` が `../runtime/*` を import するような disallowed reverse dependency -> `module-boundary` violation |
| U-CODE-010 | machine surface language | machine-facing CLI/doctor/lint/gate message line が日本語だけの decision word で、ASCII token (`OK`, `violation`, `warning`, `skipped`, `note`, `error`, `ready`, `not ready`) を持たない場合 -> `machine-surface-language` violation。ASCII token 後の日本語説明文は許可する |
| U-CODE-011 | canonical source-boundary matrix | `src/lint/*` importing `../gate/*` など、共有 matrix 上の禁止 import は `module-boundary` violation になる |

補足: U-CODE-002 はローカル helper にも適用する。`current-location` の Scrum operation item 生成は input object 化し、4 引数 helper を許可しない。U-CODE-011 は `src/lint/*` から `src/vmodel/*` への直接 import も同じ matrix で禁止し、DB projection ingestion gate は Vモデル ZIP の実装 constant ではなく projection table 契約だけを検査する。

### U-DESLANG 追補 (design-language)

> Pair = `module-drift.md` design-language addendum. HELIX の「人間向け docs は日本語」要求を、設計 /
> governance / ADR の英語 prose 増加防止 gate として機械化する。

| ID | 対象 | 期待 |
|----|------|------|
| U-DESLANG-001 | `analyzeDesignLanguage` | 日本語 prose と `helix doctor` などの inline code / 技術識別子は violation にしない |
| U-DESLANG-002 | `analyzeDesignLanguage` | 英語だけの見出し・説明文を `english-heading` / `english-prose` として検出する |
| U-DESLANG-003 | baseline ratchet | 既存 debt 件数以内は OK、baseline を超えた英語 prose 増加は violation |
| U-DESLANG-004 | real repo guard | `loadDesignLanguageDocs(process.cwd())` + `analyzeDesignLanguage` は PLAN / 設計 / テスト設計 / process / governance / handover / adapter ルールを含む現 baseline を超えず、`doctor` に `design-language` を surface して `runDoctor.ok` に連動する |
| U-DESLANG-005 | fingerprint ratchet | 既存英語 prose debt と同件数のまま別の英語 prose へ差し替えた場合、`DESIGN_LANGUAGE_BASELINE_FINGERPRINT` との drift として violation |
| U-DESLANG-010 | `loadDesignLanguageDocs` handover 境界 | `docs/handover/session-handover-YYYY-MM-DD.md` は機械生成 session packet として除外するが、`docs/handover/SESSION-...` など手書き handover docs は検査対象に残す |

### U-DDDTDD 追補 (DDD/TDD strictness)

> Pair = `module-drift.md` DDD/TDD Strictness Addendum。Requirements-level DDD/TDD rules は `src/lint/ddd-tdd-rules.ts` と `doctor` で機械強制される。

| ID | Target | Oracle |
|---|---|---|
| U-DDDTDD-001 | `analyzeDddTddRules` policy | DDD/TDD rule ID の欠落または unknown -> violation |
| U-DDDTDD-002 | invariant trace | SSoT で宣言された `DDD-INV-*` oracle が L7 test design に無い -> violation |
| U-DDDTDD-003 | Red-first evidence | confirmed `tdd_red_required` PLAN が `red_at` / `green_at` を欠く、または `red_at > green_at` -> violation |
| U-DDDTDD-004 | test oracle strength | 明示的な `expect` / `assert` が無い `it` / `test` block、または truthiness-only assertion -> violation |
| U-DDDTDD-005 | integration GWT | L8 `IT-*` row が Given / When / Then granularity を欠く -> violation |
| U-DDDTDD-006 | workflow placement | Forward と Add-feature の workflow doc が `DDD-TDD-WORKFLOW` / SSoT reference を欠く -> violation。README は gate 対象外 |
| U-DDDTDD-007 | domain boundary | `src/lint/*` が runtime/doctor/CLI feature module を import するような disallowed reverse dependency -> violation |
| U-DDDTDD-008 | real repo guard | `loadDddTddInputs(process.cwd())` + `analyzeDddTddRules` は violations `[]` を返す。`doctor` は `ddd-tdd-rules` を surface し `ok` を link する |
| U-DDDTDD-009 | unit-oracle-substance (IMP-083 残差) | L7 unit test-design の `U-XXX-NNN` 行 (末尾数字 = `U-ID` ヘッダ除外) の expected-behavior セルが空 / trivial (< 6 字) / skeleton marker (`-`/TODO/骨格 等) -> violation。substantive 行は非違反 (false-positive 回避) |
| U-DDDTDD-010 | canonical source-boundary matrix | `domain-boundary` は `module-boundary` と同じ共有 matrix を使い、`src/lint/*` importing `../gate/*` も violation になる |
| U-DDDTDD-011 | mutation-oracle | confirmed かつ `tdd_red_required: true` または `mutation_oracle_required: true` の PLAN が、test locator / audit path / command と fail・kill signal を含む concrete `mutation_oracle_evidence` を欠く -> violation。placeholder evidence は非受理 |

### §1.16.2 U-READABILITY (freeze doc readability lint 検査、A-110 / IMP-089)

> ペア = L6 function design docs。confirmed freeze 対象 doc の mojibake marker を検出し、A-109 の読み取り対象漏れを再発させない。

| ID | 対象 | Oracle |
|---|---|---|
| U-READ-001 | `analyzeReadability` | U+FFFD / U+2001+ASCII / CP932 mojibake token を violation として返す |
| U-READ-002 | `readabilityMessages` | doctor に path:line:marker を出し、復元要求を明示 |
| U-READ-003 | `loadL6ReadabilityDocs` | 実 repo L6 design docs 18 件で marker 0 |
| U-READ-004 | `loadFreezeReadabilityDocs` | 実 repo の L6 design docs + PM trace 対象 L5 PLAN 4 件で marker 0 |

### §1.18 U-GCONF (gate-confirm coupling lint 検査、PLAN-L7-18 / IMP-079)

> ペア = `gate-confirm.md`。gate-design §2 台帳と design/test-design doc `status: confirmed` の coupling を検査する。parse 失敗を含む不整合は fail-close。

| Test ID | 対象 | 期待 |
|---|---|---|
| U-GCONF-001 | `parseGateStatuses` | gate table から G/L/status/PASS を抽出 |
| U-GCONF-002 | `layerToGate` | `L5 -> G5`、非 layer は null |
| U-GCONF-003 | `analyzeGateConfirm` | gate park の layer に confirmed doc → violation |
| U-GCONF-004 | `analyzeGateConfirm` | gate PASS の layer に confirmed doc → ok |
| U-GCONF-005 | `analyzeGateConfirm` | gate table parse 失敗 → `ok=false` + `violation` (fail-close) |
| U-GCONF-006 | `analyzeGateConfirm` | draft doc は対象外 |

### §1.19 U-PLANSCH (plan lint §工程表 最小強制、PLAN-L7-20 / IMP-081)

> ペア = `plan-schedule-lint.md`。§1.10.G.4 の最小スライスとして、Step の [並列]/[直列]、直列理由、review Step、§3.1 実装計画を検査する。

| Test ID | 対象 | 期待 |
|---|---|---|
| U-PLANSCH-001 | `extractScheduleSection` | §工程表 section を抽出 |
| U-PLANSCH-002 | `analyzePlanSchedule` | 準拠 PLAN → ok |
| U-PLANSCH-003 | `analyzePlanSchedule` | [並列]/[直列] 欠落 Step → violation |
| U-PLANSCH-004 | `analyzePlanSchedule` | [直列] の理由が 3 条件に該当しない → violation |
| U-PLANSCH-005 | `analyzePlanSchedule` | review Step heading 不在 → violation |
| U-PLANSCH-006 | `analyzePlanSchedule` | §3.1 実装計画 不在 → violation |

### §1.19.1 U-PLANGOV 追補 (plan governance scope integrity、PLAN-L7-322)

> `scope_digest` は opt-in の scope integrity gate として扱う。PLAN の `## §4 DoD` checkbox 行を正規化し、無宣言の DoD 削除や scope shrink を fail-close する。README は gate 対象外。

| Test ID | 対象 | 期待 |
|---|---|---|
| U-PLANGOV-015 | `analyzePlanGovernance` scope integrity | `scope_digest` を持つ PLAN の DoD checkbox 行が削除・変更された場合、`scope_integrity_mismatch` violation |
| U-PLANGOV-016 | `analyzePlanGovernance` waiver | `- [~] (waived: reason/approver/YYYY-MM-DD) ...` 形式の waiver は scope digest 入力として受理し、scope shrink 免責を明示できる |
| U-PLANGOV-020 | `analyzePlanGovernance` filing completeness | enforcement 境界以降の `kind=poc` かつ `workflow_phase=S3/S4` PLAN は `s4_decision_record:` block を持たなければ `missing_s4_decision_record` violation。record ありは pass、境界前 updated は grandfather。 |
| U-PLANGOV-021 | `analyzePlanGovernance` filing completeness | enforcement 境界以降の `kind=reverse` PLAN は起票時から `pair_artifact` を持たなければ `missing_pair_artifact` violation。`pair_artifact` ありは pass。 |
| U-PLANGOV-017 | `analyzePlanGovernance` malformed waiver | `- [~]` 行が `waived: reason/approver/YYYY-MM-DD` を欠く場合、`scope_integrity_invalid_waiver` violation |
| U-PLANGOV-018 | `analyzePlanGovernance` forward route scope | `forward_routing` が `kind=reverse` 以外、または `workflow_phase=R4` 以外に置かれた場合、`forward_routing_scope_mismatch` violation |
| U-PLANGOV-019 | `analyzePlanGovernance` reverse R4 route scope | `kind=reverse` + `workflow_phase=R4` の `forward_routing` は route scope として受理し、余計な violation を出さない |

### §1.20 U-FRCOV (FR unit coverage substance 検査、PLAN-L7-22 / A-110)

> ペア = `fr-unit-coverage.md` + `function-spec.md` FR registry addendum。FR→L6→U oracle の ID 接続だけでなく、型 body と pseudocode/explicit_l7_defer の substance を検査する。

| Test ID | 対象 | 期待 |
|---|---|---|
| U-FRCOV-001 | `parseL6FrCoverageRows` | FR coverage table を FR/L6 spec/unit contract/U oracle に分解 |
| U-FRCOV-002 | `analyzeL6FrCoverage` | missing/unknown/incomplete row を violation |
| U-FRCOV-003 | `analyzeL6FrCoverage` | contract ref が L6 spec に無ければ weak contract |
| U-FRCOV-004 | `analyzeL6FrCoverage` | function-spec/governance/agent-slots ref に型 body + pseudocode/defer marker が無ければ missing substance |
| U-FRCOV-005 | 実 repo guard | FR registry 51 件すべて L6 spec / U-* oracle / substance marker に接続 |
| U-FRCOV-006 | `analyzeL6FrCoverage` | `explicit_l7_defer` 行の type body に `{...}` フィールドブロックが無ければ missing substance |

### §1.21 U-FR-L1-21 (test perspective gate 検査)

> ペア = `vmodel-pair-freeze.md` §7.3.1。pair presence だけではなく、設計層ごとに必要な test perspective が欠けていないことを検査する。

| Test ID | 対象 | 期待 |
|---|---|---|
| U-FR-L1-21-01 | `analyzeTestPerspectiveGate` | required viewpoint が欠落した layer pair を violation |
| U-FR-L1-21-02 | `analyzeTestPerspectiveGate` | 同一 viewpoint の重複宣言を duplicate violation |
| U-FR-L1-21-03 | `analyzeTestPerspectiveGate` | required viewpoints が全て存在し重複なしなら ok |

### §1.17 U-XRUNTIME (provider handover / gate review-tier / team run / adapter 検査, 2026-06-08)

> ペア = L4 function §3.6 / external-if §6 / requirements §7.1・§7.8.7。前回 review 残課題 (provider handover 未実装、`helix codex|claude|team|gate` surface 欠落、single-runtime checklist 未強制、hybrid 分散未検証) を機械保証する。

| U-ID | 対象関数 | DbC oracle |
|---|---|---|
| U-PHOVER-001 | `buildProviderHandover` | Claude↔Codex の from/to が異なる package を生成 / active_plan・summary 必須 / secret 風 token は sanitize |
| U-PHOVER-002 | `runProviderHandover` | `.helix/handover/provider/<id>.json` + `CURRENT.json` を書く / dry-run は非書込 |
| U-GATE-001 | `evaluateGateReview` (hybrid) | judgment gate は `review_kind=cross_agent` + workerModel≠reviewerModel で pass / 同一 model は fail |
| U-GATE-002 | `evaluateGateReview` (single runtime) | claude-only/codex-only は checklist 必須、欠落・fail・根拠なし n-a で fail、揃えば `cross_agent_review=unavailable` |
| U-GATE-003 | `evaluateGateReview` parity | 同一 checklist で claude-only/codex-only の passed・review_kind・message が一致 |
| U-GATE-004 | `evaluateStaticGate` unknown/review-only | 未登録 gate は deterministic static check 不在で fail-close / `G0.5`・`R4` は既知の review-tier gate として static n-a + pass |
| U-GATE-005 | `evaluateStaticGate` deterministic failure | G1/G3/G7 などの静的検査が I/O / parse 失敗で実行できない場合は throw せず `violation` + fail-close |
| U-GATE-006 | `helix gate --checklist` | checklist YAML 読込・parse 失敗は CLI crash ではなく review checklist violation として gate failure |
| U-TEAMRUN-001 | `validateTeamRun` / `buildTeamRunPlan` | hybrid 以外は fail / hybrid で worker(se) と reviewer(tl/qa) が別 provider なら pass。member prompt header は role/team/engine だけでなく、placement override 後の実効 `provider`、difficulty、model_family、selected_model、reasoning_effort、selection_evidence を含む |
| U-TEAMRUN-002 | `validateTeamRun` | 同一 role/provider 重複、worker/reviewer 同一 provider は fail |
| U-TEAMRUN-003 | `recommendTeamLaunch` + `buildTeamRunPlan` | `team suggest` が返す critical definition は `se -> tl -> qa` の依存順へ正規化され、全 member が high effort selection を持つ |
| U-ADAPTER-001 | `buildAdapterPlan` | `helix codex` / `helix claude` dry-run command plan を mode に基づき available 判定 / Codex provider args は `exec -`、Claude provider args は Claude Code print-mode の `--print --input-format text` / 両 provider とも prompt 本文は `plan.stdin` に保持し argv へ渡さない / `--plan` は harness metadata として保持し provider CLI へ渡さない |

### §1.22 U-DESC (descent-obligation ledger 由来、PLAN-L6-35 add-design / descent-obligation.md §1-§4、FR-L1-03)

> ペア = `descent-obligation.md` §1-§4。上流 (要件 FR) + 層隣接 matrix から「在るべき下流/pair 成果物」を生成し不在を fail-close する (absence-blind 是正)。pair-freeze (document-driven) の一般化を上流駆動 (absence-detecting) で行う。

| U-ID | 対象関数 | oracle (DbC) |
|---|---|---|
| U-DESC-001 | `generateObligations` | **純関数 + 上流駆動**。present artifact の layer から adjacency.rules を引き、condition (active/impl-present) を満たす to-layer のみ Obligation を emit / **下流の自己宣言 (pair_artifact 等) を一切参照しない** / 同入力→同出力 |
| U-DESC-002 | `analyzeDescentObligations` (健全性) | trace key 無し成果物→`untraceable` finding (ok=false) **かつ obligation ループから除外 = unmet/implAhead に混入しない** (I-2) / 同一 (traceKey,layer,role) 衝突→`duplicate-key` finding (E1/E8) |
| U-DESC-003 | `analyzeDescentObligations` (満たし) | 全 obligation が **`status=="active"` の**下流/pair で満たされる→`graded` 全 satisfied + ok=true + chain.complete=true (I-1) |
| U-DESC-004 | `analyzeDescentObligations` (不在) | 義務付けられた下流/pair が不在・defer 無し→`unmet` + ok=false / chain.firstGap=最初の欠落層 / **requiredLayer に park/placeholder の stub があっても satisfied にしない** (E2/E6/I-1、**skill 片肺の本体**) |
| U-DESC-005 | `analyzeDescentObligations` (defer) | 不在 + 有効 defer (dischargeCondition 非空 ∧ owner 非空) ∧ impl 未着地→`deferred` (ok 維持) / defer に条件 or owner 欠落→**`invalid-defer` finding 発火**かつ `unmet` (免責しない、E3/E4/I-4) |
| U-DESC-006 | `analyzeDescentObligations` (impl-ahead) | src/test 着地済 + 設計/テスト設計層の未 discharge defer→`impl-ahead` 違反 (defer で免責しない、ok=false) / 方向非依存 / **graded.unmet と implAhead は排他 = 同一 layer を二重登録しない** (E5/E7/I-3、**skill 片肺の核**) |
| U-DESC-007 | `analyzeDescentObligations` (park) | 上流が park/placeholder→descent obligation を生成しない (pair-freeze park 規約と整合、E6) |
| U-DESC-008 | `descentObligationMessages` + 実 repo ガード | unmet/impl-ahead を reason+traceKey+layer で文言化 / **実 repo で skill subsystem の片肺が unmet または impl-ahead として検出される** (Phase 0 = 現存 drop 一掃検出、是正後 0 へ収束) |

### §1.23 Refactor candidate detector projection descent 検査 (PLAN-L7-147 / PLAN-REVERSE-141、IMP-146)

> ペア = `function-spec.md` Harness DB projection addendum の `analyzeRefactorCandidates`。Refactor mode の
> DB-trigger 候補面 (`PLAN-L7-133` workflow の下位 capability) を `quality_signals`
> (`metric=refactor_candidate:<kind>`) / `feedback_events` へ projection する detector の L7 descent。
> forward-convergence 集約 (Reverse back-fill `PLAN-REVERSE-141`) で本 descent を補い、impl PLAN を converged 化した。

- detector は既存テーブルへの additive projection (schema 不変) ゆえ、新規番号 oracle を増やさず
  **projection oracle family (U-FR-L1-06 / U-FR-L1-19 / U-FR-L1-20 / U-FR-L1-40 / U-FR-L1-41)** の被覆下に置く
  (新 `U-XXX-NNN` ID を作らない = oracle-test-trace の偽 linkage を生まない)。
- substance (実体) は `tests/projection-writer.test.ts` が担う: 4 candidate kind
  (`split-module` / `extract-helper` / `deduplicate-function` / `externalize-literal`) の検出、`candidateRank`
  順序、`projectRefactorCandidateSignals` による `quality_signals`/`feedback_events` projection、空入力で
  candidate を捏造しないこと、を green `it` で被覆 (PLAN-L7-147 AC「4 kind すべてを純 detector test が被覆」)。
- 関連 detector 後続 (`PLAN-L7-148`/`150`/`151`/`152`/`153`/`158`) は本 descent を基点とする (module extraction /
  closure sweep / precision+policy extraction の検査)。

## §2 量閉じ一覧 (L6 設計 → U 被覆、孤児チェック)

- function-spec §1 関数 → U-FUNC-01〜04
- function-spec §2 pseudocode 由来 → U-CORE-01〜04
- function-spec §4 rule engine 由来 → U-RULE-01〜03
- edge-case 4 観点 → U-EDGE-01〜03
- **session-log.md §3 関数 (resolveActivePlan/recordEvent/compressPlanDigest/onStop/onSessionStart) + CLI hook entrypoints → U-SLOG-001〜007** (add-feature 差分、PLAN-L6-03。孤児 0)
- **forced-stop-feedback.md §2.3 関数 (detectDanglingTurn/recordForcedStop/classifyFeedback/recordFeedback/pendingRecoveryProposals/scanDanglingStops/emitClassifyRequest) → U-FSF-001〜007** (add-feature 差分、PLAN-L6-04。孤児 0)
- **setup-solo-team.md §2.3 契約関数 7 本 (detectProjectScale/recommendPhase/planSetup/emitSetup/recordSetupState/applyBranchProtection/runSetup) + project bootstrap addendum (planHelixProjectSetup/runHelixProjectSetup) → U-SETUP-001〜007 / 009〜022** (add-feature 差分、PLAN-L6-05。renderArtifacts は emitSetup 内部 helper = U-SETUP-004 に内包。孤児 0)
- **handover-mechanism.md §2.3 関数 (resolveHandoverScope/buildPointer/scaffoldFromDigests/renderHandoverScaffold/handoverStale/writePointer/setActivePlan/inferPlanFromCommit/runHandover) → U-HOVER-001〜007** (add-feature 差分、PLAN-L6-06。writePointer は U-HOVER-007 orchestration 経路で被覆。session-log への限定 amendment = setActivePlan/inferPlanFromCommit 配線は U-HOVER-006 で被覆。孤児 0)
- **handover IMP-048/047 差分 (sameFamilyPlan/dedupeDigests/resolveHandoverScope scopeToActive/readPointer/checkHandoverDiscipline) → U-HOVER-008〜010** (IMP-048 dedup + scopeToActive、IMP-047 readPointer/discipline。孤児 0)
- **handover IMP-078 品質増分 (checkHandoverBypass/countHandoverEntries/resolveHandoverScope scopeToSession/latestSessionId/readPlanMeta family 解決/活性化 activePlanStale 連動) → U-HOVER-011〜012 + U-SLOG-006** (gap① bypass / gap② stale / gap③ commit hash / gap④ session-scope / gap⑤ unknown-kind。PLAN-L6-16/L7-17。readPlanMeta は U-HOVER-012 runHandover 経路に内包。孤児 0)
- **handover A-138 ITEM-4 + PLAN-L7-83 累積/drift 増分 (renderHandoverScaffold slimSummary / boundSameDayEntries 累積上限 / runHandover marker reconcile) → U-HOVER-013〜015** (slim stub・bounded entries (anchor+直近保持/breadcrumb)・marker reconcile (complete→clear / --plan→sync / dryRun 非破壊)。PLAN-L7-83。孤児 0)
- **handover PLAN-L7-88 + status preflight 増分 (capWithBreadcrumb / summary cap / `helix handover status --json`) → U-HOVER-016・018** (context 注入 cap とセッション開始時の通常 handover CURRENT.json read-only preflight。U-HOVER-017 は PLAN-L7-98 の §5 outstanding seed に既割当のため衝突させない。孤児 0)
- **handover DB 導出 wiring 増分 (`deriveHandoverSnapshot` / `detectPointerDrift` / `runHandover` / Stop hook warning surface) → U-HOVER-021** (PLAN-L7-396。legacy pointer を保ちながら harness.db/git 由来の nested snapshot を再生成し、takeover note 保持と派生 field drift warning を保証する。孤児 0)
- **agent-slots.md §2.3 関数 (loadSlots/fireSlot/releaseSlot/releaseOldestGuardSlot/sweepStaleGuardSlots/listActiveSlots/listStaleSlots/peakParallel/exceedsParallelLimit/recordGuardFire) → U-SLOT-001〜008** (add-feature 差分、IMP-050 + IMP-106 SubagentStop release。nodeAgentSlotsDeps は実 I/O deps で unit では mock 代替。孤児 0)
- **module-drift.md §2-§3 関数 (parseListedModules/scanActualModules/analyzeModuleDrift/loadModuleDocs/moduleDriftMessages) → U-MDRIFT-001〜005** (add-feature 差分、PLAN-L7-16/IMP-075。moduleDriftMessages は U-MDRIFT-003/004 経路 + 専用 assert で被覆、loadModuleDocs は U-MDRIFT-005 実 repo ガードに内包。孤児 0)
- **module-drift.md asset-drift alias (loadAssetDriftInput/analyzeAssetDrift/assetDriftMessages/checkAssetDrift) → U-ASSETDRIFT-001〜006** (内部資産 + prompt template cutover 差分、FR-L1-49。legacy source path residue / legacy command residue / docs-skills vacancy / guard allowlist missing を doctor hard guard。孤児 0)
- **module-drift.md change-impact addendum (analyzeChangeImpact/analyzeChangeSetIntegrity/parseGitPorcelain/loadChangedFiles/changeImpactMessages) → U-CHGIMPACT-001〜007** (コード変更に対する設計・テスト更新漏れ検出と、未承認 L7 実装着手の PLAN 契約検出。doctor hard guard。孤児 0)
- **module-drift.md coding-rules addendum (analyzeCodingRules/loadCodingRuleDocs/loadCodingWorkflowDocs/codingRulesMessages/checkCodingRules) → U-CODE-001〜011** (requirements-level coding rule SSoT + workflow placement + error/module-boundary + machine-surface-language + canonical source-boundary matrix の機械検出。doctor hard guard。孤児 0)
- **module-drift.md design-language addendum (analyzeDesignLanguage/loadDesignLanguageDocs/designLanguageMessages/checkDesignLanguage) → U-DESLANG-001〜005 / U-DESLANG-010** (PLAN / 設計 / テスト設計 / process / governance / handover / adapter ルールの日本語 prose baseline + fingerprint ratchet。生成 session handover だけを除外し、手書き handover docs は対象に残す。doctor hard guard。孤児 0)
- **module-drift.md DDD/TDD strictness addendum (analyzeDddTddRules/loadDddTddInputs/dddTddRulesMessages/checkDddTddRules) → U-DDDTDD-001〜010** (DDD/TDD SSoT + workflow placement + Red-first evidence + test oracle + integration GWT + canonical source-boundary matrix の機械検出。doctor hard guard。孤児 0)
- **team.ts §2.2 schema / 関数 (teamDefinitionSchema/mustSerialize) + team/launch-policy.ts → U-TEAM-001〜003** (add-feature 差分、IMP-050。孤児 0)
- **backfill-pairing.md §2.3 関数 (parseRequires/parseGlossaryTerms/normalizeTerm/parsePlan/analyzeBackfill/loadBackfillDocs/backfillMessages/checkBackfill) → U-BACKFILL-001〜006** (add-feature 差分、IMP-051。normalizeTerm は parseGlossaryTerms/analyzeBackfill の内部パス経由で被覆。checkBackfill は doctor/index.ts の try-catch ラッパーで U-BACKFILL-006 実 repo ガードに内包。孤児 0)
- **vmodel-pair-freeze.md §1-§3 関数 (loadPairDocs/analyzePairFreeze/pairFreezeMessages/lintVmodel) → U-VPAIR-001〜006** (add-feature 差分、PLAN-L7-11/IMP-067。lintVmodel は loadPairDocs→analyzePairFreeze→pairFreezeMessages の orchestration で U-VPAIR-005 実 repo ガードに内包。孤児 0)
- **vmodel-pair-freeze.md §7 関数 (analyzeVerificationGroups/verificationGroupMessages、loadPairDocs status 拡張) → U-VTRIG-001〜005** (add-feature 差分、PLAN-L7-12/IMP-068。doctor checkVerificationGroups は U-VTRIG-005 実 repo ガードに内包。孤児 0)
- **review-evidence.md §2-§4 関数 (hasReviewEvidence/parseReviewPlan/analyzeReviewEvidence/loadReviewPlans/reviewEvidenceMessages、schema review_evidence、doctor checkReviewEvidence、greenCommandMatchesKind) → U-REVIEW-001〜006 + U-GREENDEF-005〜006** (add-feature 差分、PLAN-L7-13/IMP-071 + PLAN-L7-232/IMP-108。reviewEvidenceMessages は U-REVIEW-003/006 経路で被覆、checkReviewEvidence は doctor try-catch ラッパーで U-REVIEW-006 実 repo ガードに内包。green command kind/command 意味一致と 64 桁 digest schema は schema と lint の両方で fail-close。孤児 0)
- **review-evidence-stale.md §2-§4 関数 (draft/降格 PLAN に残る stale approval の検出) → U-REVIEW-007〜008** (add-feature 差分、PLAN-L7-19/IMP-080。review-evidence 双方向性の逆向き検出。孤児 0)
- **cross-review-enforcement.md §1-§2 関数 (extractReviewEntries/analyzeReviewEvidence の crossReviewViolations、schema worker_model/reviewer_model) → U-XREVIEW-001〜005** (add-feature 差分、PLAN-L7-14/IMP-076。doctor 連動は U-REVIEW-006 実 repo ガードの crossReviewViolations==[] に内包。孤児 0)
- **test-before-review.md §2-§3 関数 (analyzeReviewEvidence の testBeforeReviewViolations、schema tests_green_at、reviewed_at/tests_green_at 抽出) → U-TORDER-001〜005** (add-feature 差分、PLAN-L7-15/IMP-077。doctor 連動は U-REVIEW-006 実 repo ガードの testBeforeReviewViolations==[] に内包。全駆動モデル普遍。孤児 0)
- **provider-handover.ts / gate/review-tier.ts / team/run.ts / team/launch-policy.ts / runtime/adapter.ts → U-PHOVER-001〜002 / U-GATE-001〜003 / U-TEAMRUN-001〜003 / U-ADAPTER-001** (review 残課題解消差分、2026-06-08。provider handover package、mode-aware judgment gate、hybrid team 分散、runtime adapter dry-run surface。孤児 0)
- **descent-obligation.md §1-§4 関数 (loadDescentAdjacency/loadTraceKeyedArtifacts/loadDeferLedger/generateObligations/analyzeDescentObligations/descentObligationMessages、doctor checkDescentObligation) → U-DESC-001〜008** (add-design 差分、PLAN-L6-35/FR-L1-03。load×3 は U-DESC-008 実 repo ガードに内包。上流駆動 obligation 生成 + defer ledger + impl-ahead ガードで absence-blind を是正。孤児 0)
- **孤児 (設計で U 未被覆) = 0** を L7 entry で機械確認

## §3 trace (④ → ②)

本書の各 U-* は `docs/design/harness/L6-function-design/` の 2 sub-doc (signature/DbC/edge) と相互 reference。**G6 (機能設計凍結)** で 2 sub-doc ⇔ 本書 1 doc の pair 宣言を確定し、L7 entry (TDD Red) で先行 ④ テストコードに変換 (§1.10 line 671)。双方向 trace freeze は G7 で実施。

## §4 carry / 次工程

- **L7 entry (TDD Red)**: 全 U-* を vitest 単体テストに先行変換 (FR-02、Red 先行、未実装理由のみで fail 可)
- **L7 実装**: function-spec WBS (§5) の Sprint L7.1〜L7.7 を Red→Green→3点R で実装。DbC docstring (`@edge-*`) を実関数へ転記
- **G7 trace freeze**: 4 artifact 双方向 12 edge 凍結時に本書 U ↔ L6 設計の trace 確定
- **外部ツーリング family carry 更新 (A-128 F-2 / IMP-128、2026-06-11)**: §1.16.1a の **U-RELGRAPH-001..010 は PLAN-L7-32 / PLAN-L7-36 で実テスト化済み**、§1.16.1b の **U-TOOLADAPTER-001..010 は PLAN-L7-34 で実テスト化済み**、§1.16.1c の **U-MCPPROFILE-001..014 は PLAN-L7-33 / PLAN-L7-79 で実テスト化済み**、§1.16.1d の **U-DOCEXPORT-001..012 は PLAN-L7-35 で実テスト化済み**。外部ツーリング family の正規 defer は 0。

### 2026-06-08 Residual Review Closure Test 追補

- U-GATE-004: `evaluateGateReview` は hybrid、single-runtime、standalone mode の judgment-gate evidence として `self_review` / `self-review` / `naive_self_review` を reject する。
- U-RDRIFT-001: `analyzeRuleDrift` は AGENTS / CLAUDE adapter docs が required command と mode marker を共有している場合に pass する。
- U-RDRIFT-002: `analyzeRuleDrift` は adapter marker 欠落を file と marker identity 付きで報告する。
- U-RDRIFT-003: real repo の AGENTS / CLAUDE adapter docs は required marker drift を持たない。
- U-RDRIFT-004: `analyzeRuleDrift` は old runtime command routing、env prefix、local state path、agent name 用の forbidden legacy adapter marker を報告する。real repo の AGENTS / CLAUDE adapter docs は forbidden marker 0 件である。

### 2026-06-09 Runtime Adapter Lifecycle Test 追補

- U-SLOG-007 は shared CLI と adapter wrapper oracle を拡張する。明示的な `--plan <id>` lifecycle run は、`<id>` 用に `session_start`、`tool_use`、`session_end` count を持つ plan digest を生成しなければならない。
- U-SLOG-007 は、`--plan <id>` が harness metadata のままであり、Codex / Claude provider CLI args へ `--plan-id` や raw plan text として転送されないことも assert する。

### 2026-06-15 Skill Evaluation Oracle 検査 (FR-L1-36, PLAN-L7-53)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-FR-L1-36 | `projectSkillEvaluations` | **Cold-start**: 0 skill_invocations → 0 skill_evaluations rows (never throws)。**AC-01**: adopted plan 5 件が全て "confirmed" → skill_rating=1.0, adoption_count=5, success_count=5, unused_flag=0。**AC-02**: last accepted invocation が asOf より 30 日超前 → unused_flag=1; row は保持する (auto-delete しない)。**Partial success**: adopted plan 5 件中 3 件 "confirmed"、2 件 "draft" → skill_rating=0.6。**Rejected invocations**: accepted=0 のみ → 0 evaluation rows。**"completed" counts as success**: plan_registry.status="completed" は success_count を増やす。asOf parameter により time-window logic を test 内で deterministic にする。 |

### 2026-07-05 Skill Scaffold Generator Oracle 検査 (PLAN-L7-317)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-SKILL-SCAFFOLD-001 | `scaffoldSkill` | valid 入力では deterministic な `docs/skills/<slug>.md` path、`skill.v1` frontmatter、dedupe 済み layer / drive model / domain tag metadata、空 findings を返す。filesystem へ write しない pure generator とする。 |
| U-SKILL-SCAFFOLD-002 | `scaffoldSkill` | unknown category、unknown layer、unknown drive model は `skill-assignment` SSoT の self-lint finding として返し、`ok=false` にする。 |
| U-SKILL-SCAFFOLD-003 | `SKILL_SCAFFOLD_ALLOWED_VALUES` | category / layer / drive model の allowed values は scaffold 側で再定義せず、`skill-assignment` constants を公開する。 |
| U-SKILL-SCAFFOLD-004 | `helix skill create` | CLI は既定 no-write で scaffold JSON/text を返し、`--write` 指定時だけ `docs/skills/<slug>.md` を作成する。既存 file は `--force` 無しで exit 1 とし、generator の self-lint finding を隠さない。 |

### 2026-07-05 Adapter Runtime Hardening Oracle 検査 (PLAN-L7-320)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-ADAPTER-010 | `normalizeProviderEffort` / `buildAdapterPlan` | `middle` は `medium`、`xhigh` は `high` に正規化され、Claude adapter の `--effort` argv と `CLAUDE_CODE_EFFORT_LEVEL` env、`AdapterPlan.effort` は正規化後の値だけを持つ。空 effort は undefined、大小文字と周辺空白は吸収する。 |
| U-ADAPTER-011 | `buildProviderInvocation` / `normalizeInvokeResult` | Windows `.cmd` / `.bat` provider command は `cmd.exe /d /s /c` の明示 command/args として返り、`shell=false`、`windowsVerbatimArguments=true` を持つ。cmd.exe 解釈対象 token は quote 済みで、メタ文字・制御文字を含む token は拒否する。`normalizeInvokeResult` は spawn error / 非 0 status を `provider_error`、status 0 かつ stdout 空を `malformed_output`、status 0 かつ stdout 非空を `ok=true` に分類する。 |

### 2026-07-05 Toolchain Pin Oracle 検査 (PLAN-L7-319)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-TOOLCHAIN-PIN-001 | `analyzeToolchainPin` | `package.json.engines.bun` が concrete semver range、`bun.lock` または `bun.lockb` が存在、workflow / template の `bun install` が `bun install --frozen-lockfile` であれば `ok=true` になる。consumer template は既存 setup 契約のため `setup-bun.with` 不在を許可する。 |
| U-TOOLCHAIN-PIN-002 | `analyzeToolchainPin` | Bun engine が `latest` / wildcard、lockfile 欠落、`bun install` が frozen でない、source `harness-check.yml` の `bun-version` 欠落は fail-close finding になる。 |
| U-TOOLCHAIN-PIN-003 | `analyzeToolchainPin` | source `harness-check.yml` の `setup-bun` `bun-version` が `package.json.engines.bun` の floor と major/minor でずれた場合、source CI の toolchain drift として fail-close する。 |
| U-TOOLCHAIN-PIN-004 | `checkToolchainPin` / `helix doctor` | 現行 repo は source package の Bun engine、lockfile、frozen install、source harness-check bun-version 整合を満たし、doctor hard gate と `lint-wiring` の到達性検査を通る。 |

### 2026-06-15 PoC Success Measurement Oracle 検査 (FR-L1-43, PLAN-L7-53)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-FR-L1-43 | `projectPocEvaluations` | **Cold-start**: decided PoC PLAN 0 件 (または poc kind 自体なし) → 0 poc_evaluations rows (never throws)。**AC-43-01**: PoC PLAN 10 件 (6 confirmed / 3 rejected / 1 pivot) → poc_success_rate=0.60, confirmed_count=6, rejected_count=3, pivot_count=1, total_count=10。**AC-43-02 cold-start**: 0 PoC PLANs → 0 rows。**Undecided PoC excluded**: kind="poc" かつ decision_outcome="" の plan_registry row は denominator に含めない。**Pivot is non-success**: pivot_count は denominator を増やすが numerator は増やさない。**Single summary row**: id は常に "poc-evaluation:summary"; rebuild は previous row を上書きする。asOf parameter は deterministic tests 用に evaluated_at timestamp を制御する。 |

### 2026-06-15 Model Evaluation Oracle 検査 (FR-L1-38, PLAN-L7-53)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-FR-L1-38 | `projectModelEvaluations` | **Opt-in disabled (AC-38-02)**: .helix/config/model-opt-in.yaml が無い、または enabled!=true → 0 model_evaluations rows (never throws)。**AC-38-01 enabled**: seed model_runs + plan_registry、tmp repoRoot 配下に model-opt-in.yaml (enabled:true) を書く → model-A (2 runs both success) は success_rate=1.0, run_count=2, success_count=2 の row を書く。model-B (2 runs, 1 success) は success_rate=0.5, run_count=2, success_count=1 の row を書く。**Cold-start**: enabled だが 0 model_runs → 0 model_evaluations rows (never throws)。**Success inference**: model_runs.plan_id -> plan_registry.status IN PLAN_SUCCESS_STATUSES ("confirmed","completed") で join する。token/cost column は無い。cost-efficiency は explicit_l7_defer (token telemetry pending, PLAN-L7-53 follow-up)。**Opt-in file parse failure**: disabled として扱う (fail-open for opt-in gate)。 |

### 2026-06-09 L6 FR Unit Coverage 追補

- U-FR-L1-01..U-FR-L1-50 は `docs/design/harness/L6-function-design/fr-unit-coverage.md` で定義される。
- U-FR-L1-51 は linked test evidence、dependency impact、recovery/fullback evidence から artifact progress red/yellow/green を導出する範囲を覆う。
- executable guard は `src/lint/l6-fr-coverage.ts`: L1 FR registry を parse し、registered FR が L6 spec path、deterministic unit contract、U-* oracle のいずれかを欠く場合に fail する。
- この追補は L6 completion の L7 Red entry contract である。各 U-FR-L1-* row は focused unit test になるか、後続の confirmed PLAN で明示的に re-route されなければならない。

### 2026-06-09 L6 Completion Readiness 追補

- U-L6COMP-001: `analyzeL6Completion` は、任意の L6 design doc が draft、owning `plan:` reference 欠落、L8 単体テスト設計 `pair_artifact` 欠落、単体テスト設計から filename で参照されていない、最小 unit-contract substance (contract/signature + DbC/oracle + U-* family) 欠落、base L6 `kind=design` PLAN のいずれかが draft、単体テスト設計が draft、または G6 が PASS でない場合に not-ready を報告する。既存 L7 unit design は旧 shim として過渡互換に限り受理する。
- U-L6COMP-002: `analyzeL6Completion` は、全 L6 docs が confirmed、全 L6 docs が owning L6 PLAN と単体テスト設計 reverse reference へ解決可能、全 L6 docs が unit-test-granularity contract substance を公開、全 base L6 `kind=design` PLANs が review evidence 付き confirmed、単体テスト設計が confirmed、かつ G6 が PASS の場合だけ ready を報告する。
- U-L6COMP-003: `checkL6Completion` は G6 freeze audit が hardening 可能になるまで、readiness を `doctor` で warn-only として表示する。
- U-L6COMP-004: `analyzeL6Completion` は、G6 audit 前で docs/plans/L7/G6 がまだ draft でも、L6 trace/substance input が complete なら `freezeInputReady=true` を報告する。
- U-L6COMP-005: post-G6 `kind=add-design` PLAN draft は base L6 completion を再 open しない。add-feature completeness は backfill/pair/review evidence で扱う。

### 2026-07-06 L6 追加設計 reverse reference 追補

`l6-completion` の reverse reference は、L6 設計 doc の filename が L8 単体テスト設計または旧 shim へ現れることを
凍結入力とする。以下の追加 L6 設計は既存の unit oracle へ接続し、各実装 PLAN の tests で
詳細 oracle を保持する。

| L6 doc | L7 oracle |
|---|---|
| `effort-observation.md` | U-EFF-001..009 |
| `delegation-brief-substance.md` | U-BRIEF-001..005 |
| `agent-context-efficiency.md` | U-CTX-001..004 |
| `plan-descent-gate.md` | U-PDESC-001..010 |
| `plan-entry-routing.md` | U-PROUTE-001..012 |

## PLAN-L7-68 Provider Dispatch 追補

| U-ID | Target | Oracle |
|---|---|---|
| U-ADAPTER-002 | `resolveCodexNativeCommand` | `HELIX_CODEX_BIN` は PATH lookup より優先され、Windows npm `codex.cmd` は native provider command override として受理される。 |
| U-ADAPTER-003 | `buildProviderInvocation` | Windows `.cmd` / `.bat` provider command は `cmd.exe /d /s /c` の明示 command/args へ変換され、`shell=false` と `windowsVerbatimArguments=true` を維持する。non-script binary は provider command と args をそのまま返す。 |
| U-ADAPTER-004 | `isProviderCommandSpawnable` / `detectMode` | Provider availability は、解決された provider command が spawn 成功する場合だけ true になる。PATH 名が存在するだけでは不足。 |
| U-PHOVER-002 | `buildProviderHandover` | Provider handover package は `handover_kind: "mechanical"` を含み、machine routing data が明示的な human handover と混同されない。 |

## PLAN-L7-76 Reliability Remediation 追補

| U-ID | Target | Oracle |
|---|---|---|
| U-DBPROJ-ATOMIC-01 | `rebuildHarnessDb` | truncate + re-project sequence は 1 つの `BEGIN IMMEDIATE` transaction 内で動く。projection 中に failure を注入する (wrapped `db` が最初の `INSERT INTO plan_registry`、つまり `truncateProjectionTables` が table を空にした直後に throw) と re-throw して **roll back** し、直前に commit 済みの `plan_registry` projection を保持する (row count は 0 ではなく unchanged)。Red→Green: fix 前は fail (188 → 0)。 |
| U-DBPROJ-PROV-01 | `analyzeDbProjectionIngestion(..., { enforceTelemetryProvenance: true })` | projection provenance だけで埋まった telemetry table (`skill_invocations`, `test_runs`, `guardrail_decisions`, `model_runs`) は "fired/used/works" claim の acceptable evidence ではない。既定 doctor は migration state を partial として surface できるが、provenance-enforced mode は runtime rows が 0 かつ projection rows が非 0 の場合に fail-close する。 |
| U-DBPROJ-PROV-02 | `projectRuntimeTestRunFromSessionEvent` | session-log Bash verification event (`Bash (vitest)` 等) は、非空 `session_id`、`runtime=hook-session-log`、`scope=runtime-hook`、JSONL evidence path を持つ `test_runs` row をちょうど 1 件作る。`Bash (git)` などの non-verification Bash events は runtime test evidence を捏造しない。 |
| U-DBPROJ-PROV-03 | `checkDbProjectionIngestion` / `projectRuntimeModelTelemetryForDoctor` | Doctor の in-memory DB rebuild は、既存 Claude/Codex JSONL token usage を `projectTokenUsage` 経由で overlay する。そのため token/cost-valued column を持つ `model_runs` は provider CLI execution を要求せず runtime provenance として数える。deterministic `db rebuild` command は source-projection-only のままにする。 |
| U-DBPROJ-PROV-04 | `projectRuntimeGuardrailDecisionFromSessionEvent` | session-log `forced_stop` event は、非空 `session_id`、`guardrail=forced-stop`、`decision=block`、`mode=runtime-hook`、JSONL evidence path を持つ `guardrail_decisions` row をちょうど 1 件作る。ordinary `tool_use` events は guardrail decision を捏造しない。 |
| U-DBPROJ-PROV-05 | `summarize` / `projectRuntimeSkillInvocationFromSessionEvent` | `skill suggest` を含む Bash command は `Bash (skill)` として log される。session-log `Bash (skill)` event は、非空 `session_id`、`source=runtime-hook:skill-suggest`、hook outcome 由来の accepted status を持つ `skill_invocations` row を作る。generic `Bash (bash)` events は skill invocation を捏造しない。 |
| U-CURRENT-OPS-001 | `buildProjectCurrentLocationSnapshot` / `operationObservationSources` | `operation_test` は `operation_test` 直書きだけでなく、同一 passed `test_runs` / `gate_runs` evidence text に `operation/ops/運用` と `test/テスト` が揃う場合も observed source とする。`operation` だけの evidence は observed に誤昇格しない。 |
| U-CURRENT-OPS-002 | `buildProjectCurrentLocationSnapshot` / `operationObservationSources` | `class_method_contract` は対象設計 ID に結合した accepted `runtime_verification_events` がある場合だけ observed source とする。単語一致だけの runtime evidence は observed に誤昇格しない。 |

### §1.23 U-RUNDEBUG (L7.5 RUN & Debug runtime verification 検査)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-RUNDEBUG-001 | `classifyRuntimeVerificationEvidence` | `fired` / `used` / `works` / `blocked` / `recovered` / `observed` / `executed` は実 `session_id`、runtime `source`、runtime surface、timestamp、evidence path が揃う場合のみ `runtime_verified`。projection source は `projection_only_unverified`、欠落は `missing_runtime_provenance`、非 runtime claim は `not_runtime_claim`。 |
| U-RUNDEBUG-002 | `buildRunDebugObligation` | runtime behavior claim は L7.5 RUN & Debug `required`。pure/unit-only helper は reason と substitute oracle がある場合のみ `not_required`。欠落時は `blocked`。 |
| U-RUNDEBUG-003 | `rejectProjectionOnlyVerification` | `projection_only_unverified` / `missing_runtime_provenance` は runtime acceptance を close できない。 |
| U-RUNDEBUG-004 | `buildRuntimeVerificationLogEvent` | append-only event に plan/test/claim/session/source/surface/correlation/evidence/timestamp/redaction policy を載せる。secret-like 値は保存せず reject。 |
| U-RUNDEBUG-005 | `validateRuntimeVerificationLogCompleteness` | `works` / `used` / `fired` / `executed` は session/correlation/evidence と requirement または test oracle link が無ければ incomplete。 |
| U-RUNDEBUG-006 | `appendRuntimeVerificationLogEvent` / `helix run-debug log` | complete event だけを `.helix/evidence/run-debug/runtime-verification.jsonl` へ append する。projection source、invalid surface、secret-like 値、runtime closure link 欠落は write 前に fail-close。 |
| U-RUNDEBUG-007 | `projectRuntimeVerificationEvents` / `rebuildHarnessDb` | valid L7.5 JSONL row は `verification_class=runtime_verified` と `accept_status=accepted` を持つ `runtime_verification_events` へ project される。malformed row は finding になり runtime acceptance を close できない。 |
| U-CHGIMPACT-NONGIT-01 | `isGitRepository` / `checkChangeImpact` / `checkChangeSetIntegrity` | non-git directory では、両 check は "skipped (not a git repository)" message 付きで `ok:true` を返す (`tracked-canonical` / `runtime-portability` の non-git fail-open convention と一致)。ただし unreadable repo root は `violation` message で fail-close する。CI は git repo で動くため挙動は不変。 |
| U-SLOT-009 | `nodeAgentSlotsDeps.writeText` | State は atomic に書く。unique `*.tmp-<pid>-<seq>` file へ stage してから target へ `renameSync` する。real fs deps 経由の fire→release round-trip は完全な slot array を永続化し、`*.tmp-*` temp file を **残さない** (concurrent hook / crash-mid-write でも `loadSlots` が discard する torn JSON を作らない)。 |

### §1.24 U-HLX (old HELIX semantic adoption decision contract 検査)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-HLX-001 | `buildWorkPreflightDecision` | objective / workflow-layer / Forward return / acceptance-verification / work source / allowed scope が欠ける作業を `blocker` にし、高影響未承認操作は `escalate` にする。 |
| U-HLX-002 | `classifyTechnicalQuestion` | design / contract / schema / migration / security 等の技術質問は TL advisor evidence なしで `deny`、preference-only は reason 付きでのみ `bypass_allowed`。 |
| U-HLX-003 | `registerDetectorAxis` | detector axis は axis id / phase gate / kind / severity / workflow route を全て持つ場合のみ登録 OK。欠落 axis は routeable とみなさない。 |
| U-HLX-004 | `routeDetectorFinding` | stub / advisory finding を hard gate proof として使う要求を `reject` し、登録済み axis の通常 finding のみ route する。registry の detector kind と finding kind が一致しない場合も `reject` し、finding 側だけ `fail_close` と名乗る hard gate 昇格を許可しない。 |
| U-HLX-005 | `buildRecommendationDecision` | candidate / score / reason / references / recommended role を持つ候補だけを採用候補にし、legacy runtime path は `harden_required` にする。 |
| U-HLX-006 | `analyzeRunDebugTrace` | expected action と observed evidence を照合し、missing action や runtime metadata 欠落がある trace は acceptance source にできない。 |
| U-HLX-007 | `buildCoreInjectionContract` | repo-local source / generated target / marker / provenance を分離し、personal absolute path や global-file-only reference を current truth として採用しない。 |
| U-HLX-008 | `classifyLegacyHookSurface` | hook / guard surface は runtime surface / matcher / intent / parity target / oracle を持つ場合のみ wired/deferred 判定し、unsupported surface は `rejected`。 |
| U-HLX-009 | `buildAgentRolePolicyDecision` | role kind / model family / slot / delegation boundary / review substitute を要求し、self-review / unbounded delegation / unapproved overpowered model を deny/escalate。 |
| U-HLX-010 | `mapWorkflowInventoryToPillar` | workflow inventory を pillar/workflow/gate に接続し、unknown workflow は自動 routing せず `new_plan_required`。 |
| U-HLX-011 | `classifyLegacyDbSurface` | legacy DB/registry/API は harness.db projection/read-model/provenance 境界に分類し、raw legacy state import は `reject`。 |
| U-HLX-012 | `buildContinuousRunControlDecision` | continuous run は trigger / queue lock / timebox / budget profile / stop condition / verification evidence を必須にし、stop condition なし auto-run は `deny`。 |
| U-HLX-013 | `buildLearningFeedbackDecision` | feedback/recipe/learning は evidence と review state 付き improvement candidate に留め、learning output 単独で acceptance close しない。 |

### §1.25 U-UPSTREAM (upstream A-146 semantic adoption decision contract 検査)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-UPSTREAM-001 | `classifyUpstreamA146Finding` | `A146-1..A146-8` だけを known とし、HU-FR/HU-C/U-UPSTREAM trace へ接続する。未知 finding は known 扱いしない。 |
| U-UPSTREAM-002 | `buildGuardGovernancePack` | Claude/Codex guard entrypoints、deferred surfaces、coverage claims を分離し、未実装 guard を covered と主張したら fail。 |
| U-UPSTREAM-003 | `resolveConsumerCliPath` | consumer hook の CLI 呼び出しは PATH / wrapper / resolver のいずれかで解決できる場合のみ resolved。不可なら remediation 付き fail-close。 |
| U-UPSTREAM-004 | `verifyGreenEvidenceBinding` | command rerun、exit 0、evidence path、digest update が同一 batch にある場合だけ integrity closed。hash-only restamp は closed にならない。 |
| U-UPSTREAM-005 | `classifyTelemetryProvenance` | telemetry row を runtime / projected / derived / unknown に分類し、`source: runtime` だけでなく runtime event/evidence path を要求する。unknown は runtime evidence として扱わない。 |
| U-UPSTREAM-006 | `curateDistributionDoc` | consumer / internal / dogfood / deny を分類し、blanket governance allowlist や dogfood marker は consumer package 混入を止める。 |
| U-UPSTREAM-007 | `evaluateFeDesignSubstance` | FE design body を populated / explicit_defer / out_of_scope / hollow に分類し、presence-only を populated にしない。 |
| U-UPSTREAM-008 | `validateDriveEntryMatrix` | `signal -> mode` と `kind x drive` の両方が matrix と一致した場合のみ auto route。未知/矛盾は fail-close/defer/human review。 |
| U-UPSTREAM-009 | `verifyRuntimeMatcherEvidence` | target runtime surface、emitted tool event、matcher、matcher fire、guard result が揃い、tool event が matcher と一致する場合だけ covered。期待だけなら unverified。 |

### §1.26 U-ROADMAP Feature-Pack Semantics 検査 (PLAN-L7-207)

| U-ID | 関数 | oracle (DbC) |
|------|------|--------------|
| U-ROADMAP-025 | `validateRoadmapStructure` | `feature_packs[].id` の重複は `duplicate-feature-pack`、`span.feature_pack` が未定義 pack を参照した場合は `unknown-feature-pack`。gate 構造 issue と同じ hard structure issue として扱う。 |
| U-ROADMAP-026 | `analyzeL7FeaturePackCoverage` | L7 roadmap records に `database` / `service` / `frontend` / `ui` の feature pack layer が全て存在すれば `ok=true`。message は各 required layer と pack id / span count を表示する。 |
| U-ROADMAP-027 | `analyzeL7FeaturePackCoverage` | L7 roadmap が gate/span だけで feature pack を持たない場合、required layers が全て `missingLayers` に入り `ok=false`。`drive` から推測して pass しない。 |
| U-ROADMAP-028 | `loadRoadmaps` + `analyzeL7FeaturePackCoverage` | real repo の L7 roadmap registry は database/service/frontend/ui feature packs を全て持つ。DB/read-model/frontend coverage が UI completion を代替しないよう、UI pack は `PLAN-L7-141` の deferred span として残る。 |

## PLAN-L7-81 Codex wrapper parity（Codex wrapper 同等性）追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-ADAPTER-009 | `checkCodexWrapperParity` / `runDoctor` | Claude Code project hooks と Codex wrapper parity（同等性）を明示的に検査する。Claude hook evidence（証跡）は `.claude/settings.json` 由来でなければならない。Codex evidence は `.claude` hooks が Codex に適用されるという仮定ではなく、`helix codex --execute` / `--task-file` / `--plan ... --execute` lifecycle tests と stdin adapter oracle 由来でなければならない。`doctor` は `codex-wrapper-parity - OK` を surface（表示）し、どちらかが欠けた場合は fail-close する。 |

> Scope note（範囲注記、PLAN-L7-139）: U-ADAPTER-009 は **delegation** path、つまり harness が
> `helix codex` 経由で Codex を worker として駆動する経路を覆う。ここでは `.claude` hooks が
> Codex に適用されるとは仮定しない。補完関係にある **direct / interactive** path
> (developer がこの repo で `codex` を実行する経路) は、明示的な repo-local `.codex/hooks.json`
> adapter で覆い、`codex-hook-adapter` (下記 U-CXHOOK) が検査する。両者は異なる surface であり、
> どちらも他方を置き換えない。

## PLAN-L7-139 Codex Hook Adapter Parity 追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-CXHOOK-001 | `analyzeCodexHookAdapter` / `loadCodexHookAdapterInput` | Real-repo regression（実 repo 回帰）: commit 済み `.codex/hooks.json` は Claude guard entrypoint を Codex matcher と共有し、`ok:true` (`codex-hook-adapter - OK`) を返す。prose ではなく実 repo に対して parity claim（同等性 claim）を立証する。 |
| U-CXHOOK-002 | `analyzeCodexHookAdapter` | `.codex/hooks.json` 欠落 (`missing_hooks_json`) と malformed JSON (`malformed_json`) はどちらも fail-close する。 |
| U-CXHOOK-003 | `analyzeCodexHookAdapter` | Claude matcher (`Edit\|Write\|MultiEdit`) の literal copy は Codex tool name では発火しないため fail-close (`missing_hook`) する。silent false-parity（静かな偽同等性、coverage≠substance）を防ぐ。 |
| U-CXHOOK-004 | `analyzeCodexHookAdapter` | `work-guard` の `blockOnFailure` 削除 (`missing_block_on_failure`)、Codex command 内の `$CLAUDE_PROJECT_DIR` 利用 (`claude_project_dir_in_codex`)、global `~/.codex/` 参照 (`global_codex_path`) はそれぞれ fail-close する。 |
| U-CXHOOK-005 | `CODEX_REQUIRED` / `REQUIRED` (project-hook) | 全 Codex guard entrypoint は Claude `REQUIRED` set にも存在する (bidirectional: adapter 間の silent fork なし。違反時は `entrypoint_drift`)。 |
| U-CXHOOK-006 | `CODEX_NOT_APPLICABLE` / `CODEX_DEFERRED_SURFACE` / `evaluateWorkGuard` / `evaluateAgentGuard` / `evaluateGitCommandGuard` | Disposition（分類）は blanket-N/A ではなく正直に分類する (cross-runtime review correction)。`subagent-stop` は本当に N/A (codex.exe 0.128.0 は `SubagentStop` event を持たない) だが、`agent-guard` は N/A **ではない**。Codex の `spawn_agent` sub-agent tool family が存在し、shared guard entrypoint へ接続される。guard は missing/unknown `agent_type`、direct model override、missing task body、bulk spawn を block する。Codex shell surface (`exec_command|local_shell`) も N/A ではなく、destructive git operation を block する `git-command-guard` へ接続される。これら known surface では `CODEX_DEFERRED_SURFACE` は空。future surface も接続するか明示的に defer しなければならない。 |
| U-CXHOOK-007 | `extractEditTargets` (`src/runtime/work-guard.ts`) | False-parity regression（偽同等性回帰、Critical、cross-runtime REJECT）: Codex `apply_patch` は freeform で `tool_input.file_path` を持たないため、path は patch body (`*** Update/Add/Delete File:` / `*** Move to:`、multi-file) から parse しなければならない。`extractEditTargets` は Claude/`write_file` では明示 `file_path`/`path`、apply_patch では全 patch-body path (command-array form 含む) を返す。また明示 `file_path` がある場合に doc `content` から誤抽出しない (false-block guard)。 |
| U-CXHOOK-008 | `analyzeCodexHookAdapter` | Analyzer hardening（解析器 hardening、cross-runtime review Important）: non-`command` hook は guard を満たさない (`type==="command"` required)。また script-path が別 token の substring として現れるだけでは guard を満たさない (例: `src/cli.tsx` vs `src/cli.ts`、token-exact matching)。 |
| U-CXHOOK-009 | `codexHookAdapterMessages` / `CodexHookResult.apiToolPathEnforced` | adapter は hosted API/developer tools の coverage を主張してはならない。`.codex/hooks.json` は direct Codex CLI/IDE session を覆う。この chat runtime に injected される `apply_patch` path は Codex hook engine を通らず、`apiToolPathEnforced=false` として表示される。 |
| U-CXHOOK-010 | `analyzeCodexHookAdapter` / `loadCodexHookAdapterInput` | `.codex/hooks.json` だけでは十分な evidence ではない。real repo loader は `.codex/config.toml` も読む。その file が欠落 (`missing_config_toml`)、または `[features].hooks=true` が欠落/disabled (`hooks_feature_disabled`) の場合、analyzer は fail-close する。したがって `doctor` は direct Codex CLI/IDE session 用の Codex hook adapter が宣言済みかつ enabled であることを証明する。 |
| U-CXHOOK-011 | `CODEX_REQUIRED` / `REQUIRED` (project-hook) | 全 Codex guard entrypoint は Claude `REQUIRED` set にも存在する (bidirectional: adapter 間の silent fork なし。違反時は `entrypoint_drift`)。 |
| U-CXHOOK-012 | `CODEX_NOT_APPLICABLE` / `CODEX_DEFERRED_SURFACE` / `CODEX_REQUIRED` | `subagent-stop` だけが true N/A。Codex `spawn_agent|spawn_agents_on_csv` は required `agent-guard` matcher であり、deferred omission ではない。 |
| U-CXHOOK-013 | `evaluateWorkGuard` / `evaluateAgentGuard` / `evaluateGitCommandGuard` | Shared guard logic（共有 guard logic）は runtime-agnostic である。同じ pure function が foreign edit、allowlist 外 Claude subagent、standard Claude `Task` matcher 上の missing/null input、unsafe Codex spawn role、direct model override、missing task body、bulk spawn、destructive git command (`reset` / destructive `checkout` / `restore` / `revert` / force-push) を block する。`Agent` と `Task` は同じ allowlist/model family oracle を通る。 |
| U-CXHOOK-014 | `analyzeCodexHookAdapter` | Non-`command` hook は guard を満たさない (`type==="command"` required)。 |
| U-CXHOOK-015 | `analyzeCodexHookAdapter` | Script path は exact token として一致しなければならない。`src/cli.tsx` は required `src/cli.ts` guard command を満たさない。 |

## IMP-142 destructive git guard（破壊的 git guard）追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-GITGUARD-001 | `evaluateGitCommandGuard` | destructive `git reset`、destructive `git checkout`、worktree `git restore`、`git revert`、`git push --force` / `--force-with-lease` は `decision=block` / `reason=destructive-git` を返す。`git status`、`git diff`、`git log`、通常 `git push`、`git checkout -b`、`git checkout <branch>`、`git reset HEAD <path>`、`git restore --staged <path>` は pass し、履歴破壊ガードが通常の確認・commit/push/index 操作フローを止めない。 |
| U-GITGUARD-002 | `extractShellCommand` / `helix hook git-command-guard` / `.claude/hooks/git-command-guard.ts` | Claude `tool_input.command`、Codex `tool_input.cmd`、文字列 payload のどれでも command を抽出し、CLI hook と repo hook は destructive git command で exit 2、safe git command で exit 0 を返す。`.helix/state/destructive-git-override` は非空理由がある時だけ one-shot bypass となり、`.helix/logs/destructive-git-overrides.jsonl` に audit を残して次回は再 block する。 |

## PLAN-L7-77 Codex Stdin Prompt Dispatch 追補

| U-ID | Target | Oracle |
|---|---|---|
| U-ADAPTER-007 | `buildAdapterPlan` / `buildProviderInvocation` | codex の plan はプロンプトを `args` でなく `plan.stdin` に載せ、`args` は `exec` + `-` (stdin sentinel) のみでプロンプト本文を含まない (`codex exec -` は instructions を stdin から読む)。改行 + cmd.exe メタ文字 (`< > \| ( )`) を含むプロンプトは、Windows `.cmd` の shell-wrap 後の cmd.exe コマンド文字列にも現れず、改行で切り詰められない。Red→Green: pre-fix はプロンプトが args + wrapped 文字列に埋め込まれ truncatable。 |
| U-ADAPTER-008 | `buildAdapterPlan` / `buildProviderInvocation` / `helix claude --execute` | claude の plan は `--print --input-format text` を固定 argv とし、prompt 本文を `plan.stdin` で渡す。`-p <task>` は使わず、`<invoke name="Bash">...` 形式の native tool markup や改行を含む task text は argv / provider invocation string に現れない。fake Claude wrapper は stdin に task 本文を受け取り、session lifecycle digest は従来どおり `session_start` / `tool_use` / `session_end` を記録する。 |

## PLAN-L7-84 status nextAction field（status nextAction field）追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-DETECT-001 | `nextActionForMode` / `NEXT_ACTION_BY_MODE` | 4 mode (standalone / claude-only / codex-only / hybrid) 全てに対し SSoT `NEXT_ACTION_BY_MODE` の値を返し、空でない。`helix status --json` は 6 検出フィールドに `nextAction` を additive 付加する (camelCase 公開契約、A-138 ITEM-1)。 |
| U-DETECT-002 | `nextActionForMode("standalone")` | `human-review-required:` 接頭で始まる — AI レビュアー不在ゆえ判断ゲートは人間レビュー必須 (自動 pass 不可、concept §189 / requirements §2001)。 |
| U-DETECT-003 | `nextActionForMode("claude-only" / "codex-only")` | `single-runtime:` 接頭で始まり `intra_runtime_subagent` 証跡を要求する (単一 runtime fallback)。 |
| U-DETECT-004 | `nextActionForMode("hybrid")` | `cross-review-ready:` 接頭で始まる — judgment ゲートを別 runtime/model 族へ回す。 |
| U-DETECT-005 | `nextActionForMode` value-domain | 各値は先頭 token (`:` 手前) で機械 switch でき、後続が人間可読。公開 JSON 契約ゆえ ASCII のみ (machine-surface-language と整合)。 |
| U-DETECT-006 | `judgmentReviewPlanForMode` + `helix status --json` | `nextAction` の人間可読 guidance とは別に、status JSON が `judgmentReview` を additive に返す。hybrid は `requiredReviewKind=cross_agent`、`crossAgentReview=available`、worker/reviewer model evidence と `helix gate <gate-id> --review-kind cross_agent ...` template を持つ。単一 runtime は `intra_runtime_subagent` + checklist、standalone は human approval template を持つ。`requiredEvidence[]` は machine field として残し、同じ順序・同じ件数の `requiredEvidenceJa[]` を持つ。text status は `judgment-review-evidence:` 行で日本語 evidence と `evidence-id` を併記し、判断 gate の証跡確認だけが英語 machine prose へ戻らない。 |

## PLAN-L7-85 review read-only guard（レビュー read-only guard）追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-RGUARD-001 | `isReadOnlyDelegationRole` | 相談/検証 archetype (tl/qa/uiux) + review エイリアス (reviewer/review/security/audit) は read-only=true (§1.8 role taxonomy、判断側は実装代行しない、IMP-137)。 |
| U-RGUARD-002 | `isReadOnlyDelegationRole` | worker (se/docs)・未知ロールは read-only=false (誤検知回避 — guard はレビュー session のみ対象)。 |
| U-RGUARD-003 | `isReadOnlyDelegationRole` | ロール照合は trim + 大小無視で正規化。 |
| U-RGUARD-004 | `detectWorkingTreeMutation` | after にあって before に無い path を session 由来の変更として返す (sorted + unique、決定論)。 |
| U-RGUARD-005 | `detectWorkingTreeMutation` | 新規変更なし → 空配列。 |
| U-RGUARD-006 | `assessReviewSession` | read-only ロールが working tree を変更したら `violation=true` + `mutatedPaths` 記録。 |
| U-RGUARD-007 | `assessReviewSession` | worker ロールの変更は正当ゆえ `violation=false` (mutatedPaths は記録)。 |
| U-RGUARD-008 | `assessReviewSession` | read-only ロールが tree を変更しなければ `violation=false`。 |
| U-RGUARD-009 | `reviewGuardMessages` | violation 時、変更パス一覧 + IMP-137 再発防止ガイダンス (staged 前に inspect/revert) を 2 行で surface。 |
| U-RGUARD-010 | `reviewGuardMessages` | 非 violation → 空 (worker / clean は無音)。 |
| U-RGUARD-011 | `summarizeStagedReview` | staged 集合は sorted/unique、suspect = staged ∩ review-mutated (混入疑い)、suspect 非空で ok=false (commit 前 staged-diff の機械化)。 |
| U-RGUARD-012 | `summarizeStagedReview` | review-mutated 未提供 → suspect 空 + ok=true (純列挙)。 |

## PLAN-L7-263 Version-up Dry-run Exit Policy 追補

| U-ID | Target | Oracle |
|---|---|---|
| U-VERSIONUP-EXIT-001 | `helix version-up dry-run --json` | 既定の dry-run は承認前 evidence 収集 surface であり、`ok=false` / `blockedReasons` を JSON に出しても exit 0 を維持する。activation verification matrix の `version-dry-run` row はこの既定 exit を使い、抽象 target (`future` 等) の blocker を no-write evidence として読む。 |
| U-VERSIONUP-EXIT-002 | `helix version-up dry-run --fail-on-blocked --json` | CI / release gate / scripted readiness check が process status を読む場合は `--fail-on-blocked` を使う。`ok=false` の dry-run は JSON を出した後に exit 1 になり、`ok=true` の dry-run は同 flag 付きでも exit 0 になる。 |

## PLAN-L7-264 consumer hook artifact（consumer hook artifact）構造 gate 追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-SETUP-025 | `runHelixProjectSetup` / `runConsumerDoctor` | consumer setup が配布する `.claude/settings.json` / `.codex/hooks.json` は文字列検索ではなく JSON として parse し、必要 event、matcher、hook `type=command`、command、hard guard の `blockOnFailure=true` を構造で検査する。`.codex/config.toml` は `[features]` と `hooks = true` を持つ。command 文字列だけが別 field に残る、matcher が drift する、hard guard が non-command または `blockOnFailure=false` になる、PostToolUse / Stop / SubagentStop 等の lifecycle hook が欠ける場合は setup readiness と consumer doctor の両方で fail-close する。 |

## PLAN-L7-265 version-up security checklist evidence（security checklist 証跡）追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-VERSIONUP-SEC-001 | `buildVersionUpActivationPacket` / `buildVersionUpSecurityChecklistPacket` | `securityChecklistPacket.securityChecks[]` は `requiredEvidence` だけでなく `status` / `evidence` / `reason` を持つ。concrete locator 未接続の row は `pending_evidence` として公開され、`requiredEvidence` は要求であって実証済み evidence ではない。 |
| U-VERSIONUP-SEC-002 | `versionUpSecurityChecklistSourceViolations` | `sourceUrl` / `sourceCheckedAt` 等の source metadata 欠落に加え、`evidence` / `reason` の空・placeholder、または `status=present` なのに concrete locator がない row を fail-close する。`pending_evidence` は parked activation の正当な未完了状態として表現される。 |
| U-VERSIONUP-SEC-003 | `VersionUpActivationSnapshot.evidenceDigest` / supporting packet summary | activation snapshot の evidence digest は security checklist row の `status` / `evidence` / `reason` / source metadata を含む。completion/status の `requiredReviewFields[]` は `securityChecklistPacket.securityChecks.status` / `.evidence` / `.reason` を列挙し、承認者が security evidence の実証状態を review surface から辿れる。 |

## PLAN-L7-289 version-up Cloud Deploy source ledger 追補

| U-ID | Target | Oracle |
|---|---|---|
| U-VERSIONUP-SOURCE-007 | `analyzeVersionUpReadiness` | version-up mode doc が Google Cloud Deploy の deployment verification / canary / rollback を比較根拠として使う場合、`Version-up source ledger` table に `Google Cloud Deploy verification` / `Google Cloud Deploy canary` / `Google Cloud Deploy rollback` の 3 行が必須。本文 prose だけに残って table row が無い場合は `missingSourceLedgerRows` で fail-close する。 |
| U-VERSIONUP-SOURCE-008 | `EXPECTED_SOURCE_LEDGER_BINDINGS` | Google Cloud Deploy rollback row は `https://docs.cloud.google.com/deploy/docs/roll-back` と `rollback_plan` impact を持つ。旧 URL や field impact 欠落は source ledger drift として fail-close し、version-up activation の rollback 比較根拠を自由文に戻さない。 |

## PLAN-L7-290 setup project rollback command（rollback command）追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-SETUP-032 | `buildConsumerReadinessPlan().rollback.commands` | HELIX project bootstrap の rollback 手順は `helix setup project --dry-run --json` と `helix setup project --solo` を返す。旧 solo/team adapter 入口の `helix setup --dry-run` / `helix setup --solo` が consumer readiness に混入した場合は fail-close し、新規プロジェクト導入の復旧導線を正規 `setup project` から逸脱させない。 |
| U-SETUP-033 | `loadTemplates(process.cwd())` / `runHelixProjectSetup` | 実配布される `docs/templates/*` を読み込んだ `helix setup project --dry-run` は `consumerReadiness.ok=true` になる。built-in fallback が green でも、docs/templates 実体が古く `completion review-bundle` / `version-up dry-run v0.1.4 --release-remote` / `team run dry-run` / read-only escalation workflow を欠く場合は `projected-consumer-artifacts` で fail-close する。 |
| U-SETUP-034 | `CLAUDE.md` / `AGENTS.md` / `.claude/CLAUDE.md` | root / Codex / Claude runtime instruction の setup command surface は `helix setup project` を正規 entrypoint として示す。`Setup: helix setup` の legacy 表記が戻った場合は fail-close し、HELIX 導入済み VSCode の新規 project bootstrap と legacy solo/team adapter setup を混同させない。 |
| U-SETUP-035 | `CLAUDE.md` / `AGENTS.md` / `.claude/CLAUDE.md` | setup command surface 近傍の managed block / runtime prose は日本語-first にする。`helix setup project` の説明が `bootstraps a HELIX-ready project` など英語 prose に戻った場合は fail-close し、CLI 名・識別子以外の instruction prose を日本語へ寄せる。 |
| U-SETUP-037 | `runSetup` / `runHelixProjectSetup` | `--apply-branch-protection` の apply surface は明示フラグ、`gh auth status`、repository admin 権限確認で解錠され、通過時に `applied` へ到達できる。env approval record 不在だけでは停止せず、GitHub 認証・権限・API 失敗を reason 付きで fail-close する（通常 GitHub 運用を action-binding approval record 必須に戻さない再発防止）。 |

## PLAN-L7-294 completion review-bundle field surface（確認 field surface）追補

| U-ID | 対象 | Oracle |
|---|---|---|
| U-OUTSTANDING-016 | `completionReviewBundleForOutstanding` / `analyzeCompletionReviewBundle` | `completion-review-bundle.v1.reviewPackets[]` は `requiredReviewFieldsDigest` だけでなく `requiredReviewFields[]` の実配列を持つ。S4 / version-up / rename / action-binding の判断前に見るべき field を bundle 単体から辿れることを保証し、実配列を削る・digest と不一致にする・supporting summary と drift させる場合は `invalid_review_packet` / `invalid_digest` で fail-close する。 |
| U-OUTSTANDING-017 | `helix completion review-bundle` text | text の `review-packet:` 行は `reviewFieldCount=` と `reviewFields=` を出す。JSON を開かない通常確認でも S4 / version-up / rename / action-binding の判断前 field へ辿れることを保証し、`safety=` だけに戻った場合は cli-surface test で fail-close する。 |
| U-OUTSTANDING-018 | `completionReviewBundleMessages` / `checkCompletionReviewBundle` / `renderHandoverScaffold` / `checkHandoverNextActionAnchor` | doctor の `completion-review-bundle - OK` message は packet 別 `reviewFieldCounts=` を出す。handover Markdown §3 の `packet要約` は `確認field件数=` と `確認field=` を同時に出し、`確認field件数=` 欠落は fail-close する。doctor / handover だけを見る再開者でも、判断前 field の存在量と実 field list の両方へ辿れることを保証する。 |

## PLAN-L7-330 L1↔L2 consistency lint（双方向被覆機械判定）追補

親 = PLAN-DISCOVERY-11 (S4 confirmed) の収束機械判定。実装は `src/lint/l1-l2-consistency.ts`、
テストは `tests/l1-l2-consistency.test.ts`。

| U-ID | 対象 | Oracle |
|---|---|---|
| U-L1L2-001 | `analyzeL1L2Consistency` | L1 画面 ID と L2 screen-list が双方向一致し、ui-element 行・pair_artifact (`self` 可) が揃えば `ok=true`、violations 空、checked = 画面数になる。 |
| U-L1L2-002 | `analyzeL1L2Consistency` | L1 にのみ存在する画面は `missing-l2-screen:<id>`、screen-list にのみ存在する画面は `missing-l1-requirement:<id>` で双方向とも fail-close する。 |
| U-L1L2-003 | `analyzeL1L2Consistency` | ui-element 行欠落は `missing-ui-element:<id>`、screen-list に無い画面への wireframe / flow 参照は `dangling-wireframe-screen:<id>` / `dangling-flow-screen:<id>` で fail-close する。wireframe セクションを持たない画面は violation にしない（G2 PASS 済み主要画面 Low-Fi 縮約への false-positive 防止）。 |
| U-L1L2-004 | `analyzeL1L2Consistency` | `pair_artifact` 未宣言は `missing-mock-pair` で fail-close、**`self` は IMP-039 self-pair として充足扱い**。screen 設計不在は scope 0 で `ok=true`。 |
| U-L1L2-005 | `loadL1L2ConsistencyInput` / live repo | 現行 repo は 15 画面が双方向被覆 green（L1 bold 行 / screen-list plain 行 / ui-element bold 行 / wireframe 見出し / flow 参照 / frontmatter pair_artifact の抽出が実 doc で機能する live oracle）。 |
| U-L1L2-006 | `l1L2ConsistencyMessages` / `checkL1L2Consistency` | doctor 表示行は ASCII decision token（`OK` / `violation`）を用い、violation 行に修復導線（新ラウンド起票 = A-40 change-log）を含む。doctor 配線は `runDoctor.ok` へ fail-close で寄与し `lint-wiring` 死蔵 0 を維持する。 |
| U-L1L2-007 | `buildL1L2GapCheckPacket` | gap-check packet は `schemaVersion=l1-l2-gap-check.v1`、`planOnly=true`、`writePolicy=no-write`、`mustNotMutate=true`、観点表 8 項目、`maxRounds=3`、A-40 route、`completionClaimAllowed=false` を返し、AI が L1/L2 を起草・受入・freeze する surface にしない。 |
| U-L1L2-008 | `buildL1L2GapCheckPacket` | `l1-l2-consistency` の構造 violation は `gapCandidates[]` に写像され、各候補は `route=a40_change_log` と「人が採否判断してから更新する」requiredAction を持つ。 |
| U-L1L2-009 | `helix l1-l2 gap-check --json` | live repo で read-only gap-check packet を返し、現行 15 画面の構造被覆 green では exit 0。JSON は writePolicy、観点表、round bound、人-AI 境界、A-40 route を落とさない。 |
| U-L1L2-010 | `l1L2GapCheckMessages` / `helix l1-l2 gap-check` | text mode は `l1-l2 gap-check - OK/violation`、`authority-boundary`、`a40-route` を出し、JSON を開かない運用でも read-only 境界と A-40 導線へ辿れる。 |

## PLAN-L7-331 reverse fullback 台帳強化（空 fullback / seed 変換漏れ）追補

`scrum-reverse` lint の延長。reverse の「存在」（outstanding / G-10 台帳、既存被覆）だけでなく「完遂」を機械検査する。

| U-ID | 対象 | Oracle |
|---|---|---|
| U-SCRUMREV-006 | `analyzeScrumReverse().emptyReverseFullbacks` | terminal (confirmed/completed) reverse が generates に `docs/plans/` 外の正本 artifact を 1 つも持たない場合は plan_id を返し `ok=false`（空 fullback = 台帳上の完遂偽装を fail-close）。draft reverse と `EMPTY_FULLBACK_ENFORCEMENT_DATE`（2026-07-06）前起票の legacy reverse（25 件）は対象外（日付 ratchet grandfather、CI green を壊さない段階移行）。 |
| U-SCRUMREV-007 | `analyzeScrumReverse().unresolvedSeedMarkers` / `loadReverseSeedMarkers` | 上位正本 2 doc（concept v3.1 / requirements v1.2）の「trace seed」+「PoC 段階」行は、参照 poc を指す reverse が terminal になった後も残っていれば `doc:line:planId` で fail-close（正式追補への変換漏れ検知）。reverse が draft の間は変換作業中として許容。loader は合成 fixture で行番号・planId 抽出を検証し、live repo は seed 変換済み + 台帳 green を回帰ガードする。 |

## PLAN-L7-335 判断コア（judgment-core）governance 追補

判断規律 SSoT（`docs/skills/judgment-core.md`）と agent / command 配線の同期、および subagent
allowlist 転記の同期を機械検査する。実装は `src/lint/judgment-core-coverage.ts` /
`src/lint/allowlist-sync.ts`、テストは `tests/judgment-core-coverage.test.ts` /
`tests/allowlist-sync.test.ts`。

| U-ID | 対象 | Oracle |
|---|---|---|
| U-JUDG-001 | `analyzeJudgmentCoreCoverage` | 全 doc の `judgment_core:` marker が SSoT の `judgment_core_version` と一致し本文が SSoT path を参照していれば `ok=true`、violations 空。 |
| U-JUDG-002 | `analyzeJudgmentCoreCoverage` | marker 欠落は `missing-marker`、version 不一致は `version-mismatch`、SSoT path 参照欠落は `missing-reference` でそれぞれ fail-close する。 |
| U-JUDG-003 | `analyzeJudgmentCoreCoverage` | SSoT の `judgment_core_version` が読めない（不在 / 非数値）場合は `missing-ssot-version` 単独で fail-close する。 |
| U-JUDG-004 | `analyzeJudgmentCoreCoverage` | 対象 doc 0 件（`.claude/agents` / `.claude/commands` 消失 = 配線消失）は pass にしない。 |
| U-JUDG-005 | `loadJudgmentCoreCoverageInput` / live repo | 実 repo の全 agent（21）+ command（7）が SSoT v1 と同期している（real-repo regression、prose ではなく gate run で立証）。 |
| U-ALSYNC-001 | `analyzeAllowlistSync` | 正本（`SUBAGENT_ALLOWLIST`）と `.claude/CLAUDE.md` 転記が set 一致すれば `ok=true`。 |
| U-ALSYNC-002 | `analyzeAllowlistSync` | 片側欠落は `missing-in-doc` / `missing-in-policy` の方向つき violation で fail-close する。 |
| U-ALSYNC-003 | `analyzeAllowlistSync` | どちらかが parse 不能（null）なら `policy-unreadable` / `doc-unreadable` で fail-close する（fail-open 禁止）。 |
| U-ALSYNC-004 | `parsePolicyAllowlist` | `SUBAGENT_ALLOWLIST = new Set([...])` リテラルから文字列 entry を抽出できる。構造が見つからなければ null。 |
| U-ALSYNC-005 | `parseDocAllowlist` | Allowlist 見出し（agent-guard-policy.ts を cite する行）直後の `- \`name\`` bullet を次見出しまで収集する。節不在は null。 |
| U-ALSYNC-006 | `loadAllowlistSyncInput` / live repo | 実 repo の転記 17 件が `SUBAGENT_ALLOWLIST` と一致する（real-repo regression）。 |

> terminal status 共通化（同 PLAN）: `plan-artifact-existence` / `plan-completion-drift` /
> `merged-plan-status` の 3 重定義を `shared.ts` の `isTerminalPlanStatus`（TERMINAL_PLAN_STATUSES 正本）
> へ置換。behavior-invariant は既存 U-* net（3 test files、40 oracle green）で regression 検証する。

## PLAN-L7-337 委譲ブリーフ強制 + role 判断ブリーフ注入 追補

subagent の「賢さ」を委譲の質で機械保証する 2 機構。(1) Claude Agent spawn は委譲ブリーフ
4 marker（judgment-core §5）欠落を `agent-guard` が fail-close、(2) `helix codex/claude --role`
委譲は role archetype 別判断ブリーフを adapter が全 prompt へ機械注入する。実装は
`src/runtime/role-judgment.ts` / `agent-guard.ts` / `adapter.ts`、テストは
`tests/role-judgment.test.ts` / `tests/agent-guard.test.ts` / `tests/runtime-adapter.test.ts`。

| U-ID | 対象 | Oracle |
|---|---|---|
| U-ROLEJUDG-001 | `roleArchetypeFor` | ROLE_ARCHETYPE 正規 role（tl/uiux=consult、qa=verify、se/docs=worker）と review/advisor alias（reviewer/security/code-reviewer=verify、tl-advisor=consult）を trim + 大小無視で解決する。 |
| U-ROLEJUDG-002 | `roleArchetypeFor` / `roleJudgmentBrief` | 未知 role / 空 role は archetype null。ただしブリーフは共通規律（正本参照 + escalation 境界）を必ず返す（ブリーフ無し委譲を作らない）。 |
| U-ROLEJUDG-003 | `roleJudgmentBrief("se")` | worker ブリーフは「green な test / command の実測で裏付ける」とスコープ規律を含む。 |
| U-ROLEJUDG-004 | `roleJudgmentBrief("reviewer")` | verify ブリーフは adversarial framing / severity-first / false positive 抑制を含む。 |
| U-ROLEJUDG-005 | `roleJudgmentBrief("tl")` | consult ブリーフは 4 点出力契約（結論/根拠/残リスク/次の一手）・対案必須・advisory-only を含む。 |
| U-ROLEJUDG-006 | `roleJudgmentBrief` 全 archetype | すべてのブリーフが escalation 境界と judgment-core 正本参照を含む。 |
| U-ROLEJUDG-007 | `roleArchetypeFor` ⇔ `ROLE_ARCHETYPE` | runtime 側 role→archetype 局所写しは tier-router-policy の `ROLE_ARCHETYPE`（正本）と全 role 一致する（循環依存回避のための局所化 drift をテスト側で機械固定。正本へ role 追加時に fail する）。 |
| U-AGUARD-BRIEF-001 | `evaluateAgentGuard` / `missingDelegationBriefMarkers` | 4 marker を含まない Agent prompt は fail-close で block し、message に欠落 key と SSoT 参照を含む。 |
| U-AGUARD-BRIEF-002 | `evaluateAgentGuard` | prompt 欠落は全 marker 欠落として block。部分欠落は欠落 key のみを列挙する（充足済み key を誤列挙しない）。 |
| U-AGUARD-BRIEF-003 | `evaluateAgentGuard` | 英語 / 日本語ラベルは等価（混在可）。4 要素が揃えば pass。 |
| U-AGUARD-BRIEF-004 | `evaluateAgentGuard` | `HELIX_ALLOW_RAW_AGENT=1` はブリーフ欠落も bypass 警告付きで通す（既存 bypass 契約と同一）。 |
| U-ADAPTER-010 | `buildAdapterPlan` / `formatAdapterPrompt` | 全委譲 plan の stdin は task 本文に加えて `ROLE_JUDGMENT_HEADER` の role 判断ブリーフを含む（skill 注入の有無に依らず）。既存 U-ADAPTER-007/008 の stdin 帯域外契約（argv 非混入）は維持される。 |

## PLAN-L7-338 思考レンズ（task-lens）注入 追補

role 判断ブリーフ（どう振る舞うか、PLAN-L7-337）と対で「何を考えるべきか」（設計 / 検証 /
テスト戦略 / トラブルシューティングの観点網羅）を委譲 prompt へ機械注入する。実装は
`src/runtime/task-lens.ts` + `adapter.ts`、テストは `tests/task-lens.test.ts` /
`tests/runtime-adapter.test.ts`。

| U-ID | 対象 | Oracle |
|---|---|---|
| U-TASKLENS-001 | `detectTaskLenses` | 日本語 keyword（設計 / 検証 / テスト / 不具合・調査 等）で各レンズを検出する。 |
| U-TASKLENS-002 | `detectTaskLenses` | 英語 keyword は語境界で判定し、designated / protest / prefix 等の部分一致に誤爆しない。 |
| U-TASKLENS-003 | `detectTaskLenses` | 複数該当は固定順（design→verification→test-strategy→troubleshooting）で全件返す。 |
| U-TASKLENS-004 | `detectTaskLenses` / `taskLensBrief` | 無 match / 空 task はレンズ 0 でブリーフ空文字列（注入しない = 無関係レンズの context 浪費防止）。 |
| U-TASKLENS-005 | `taskLensBrief` | 各レンズのブリーフが領域の中核観点（inventory / falsifiable / Red→Green→Refactor / 再現→最小化→根本原因）と skill pack pointer を含む。 |
| U-TASKLENS-006 | `taskLensBrief` / live repo | ブリーフ内の全 skill pack pointer が実 repo に存在する（dead link を fail-close）。 |
| U-TASKLENS-007 | `detectTaskLenses` | 英語の屈折形（testing / fixed / debugging / verified / validating 等）を見逃さず、実務指示の自然文でも該当レンズを検出する。 |
| U-TASKLENS-008 | `detectTaskLenses` | カタカナ keyword は `コンテスト` / `バグダッド` のような別語の部分列に誤爆せず、`回帰テスト` / `ユニットテスト` / `バグを直す` は検出する。 |
| U-ADAPTER-012 | `buildAdapterPlan` / `formatAdapterPrompt` | 該当領域のある task はレンズ + role ブリーフを両方含み、無関係 task はレンズを含まず role ブリーフのみ（条件注入の両方向 oracle）。 |

## PLAN-L7-340 P6 GitHub release automation descent 追補

PR review route / CI auto-fix gate / release automation decision は、GitHub remote apply、tag publish、
CODEOWNERS 実配備を伴わない pure function として L7 へ降下する。既存 `github-merge-readiness` は local branch /
GitHub CLI/auth readiness を扱い、本追補は review route、CI auto-fix repush 可否、release tool 選定を扱う。

| U-ID | 対象 | Oracle |
|---|---|---|
| U-PRROUTE-001 | `validatePrReviewRoute` | worker と reviewer の identity / model が異なり、repo-local evidence path と green command を持つ cross-agent review は `ok=true`。 |
| U-PRROUTE-002 | `validatePrReviewRoute` | review evidence 欠落、worker/reviewer same identity、same model、evidence path 欠落、green command 欠落は fail-close。 |
| U-PRROUTE-003 | `validatePrReviewRoute` | `intra_runtime_subagent` は明示 fallback 証跡がある場合だけ許可し、同一 runtime でも model 差分を要求する。 |
| U-CIFIX-001 | `gateCiAutoFixRepush` | red CI、confidence >= policy threshold、attempt < cap、auto-fixable failure kind のときだけ `allowRepush=true`。既定は dry-run。 |
| U-CIFIX-002 | `gateCiAutoFixRepush` | confidence < 0.75 または iteration cap 到達は `issue_escalation` へ止める。閾値と cap は exported policy で管理する。 |
| U-CIFIX-003 | `gateCiAutoFixRepush` | security / permission / unknown failure と CI unavailable は fail-close。green は `no_action`、pending は `wait_for_ci`。 |
| U-RELDEC-001 | `planReleaseAutomationDecision` | ADR-008 accepted、Conventional Commits、PR gate、dry-run 要求が揃う場合、Release Please を plan-only 既定として返し、`applyAuthorized=false` を維持する。 |
| U-RELDEC-002 | `planReleaseAutomationDecision` | PR gate 必須時に semantic-release を選ぶと fail-close。 |
| U-RELDEC-003 | `planReleaseAutomationDecision` | ADR 未確定、Conventional Commits 不使用、dry-run 不要求は release automation decision を blocked にする。 |
| U-APDOC-001 | `deriveArtifactProgressDecision` | confirmed/completed/archived の doc 系 artifact は test evidence なしで green `verified`（reason に review/pair gates 明記）。 |
| U-APDOC-002 | `deriveArtifactProgressDecision` | draft/status 不明の doc は yellow のまま（捏造 green を出さない）。 |
| U-APDOC-003 | `deriveArtifactProgressDecision` | doc でも open dependency impact は red が最優先（fail-close 維持）。 |
| U-APDOC-004 | `deriveArtifactProgressDecision` | source/test artifact は従来の test-run oracle（doc 規則を適用しない）。 |
| U-RVC-001 | `collectReverseCandidates` | recovery 未紐付けの red artifact は reverse 候補となり、type 割当は `REVERSE_TYPE_BY_ARTIFACT` に従う。紐付き済み・green は候補外。 |
| U-RVC-002 | `collectReverseCandidates` | open warn finding は候補、info finding と resolved は候補外。 |
| U-RVC-003 | `collectReverseCandidates` | 対象なしは空配列（0 件を 0 件として返す、query-only）。 |
| U-MEMC-001 | `compactMemory` | superseded chain（A ← B ← C）を含む layer の compaction 後、file には active entry のみが残り、`listMemory` / `findByKey` / `surfaceMemory` の結果が前後で deep equal。 |
| U-MEMC-002 | `compactMemory` | parse 不能行は `removedDamaged` として除去され、件数が返り値に一致する。 |
| U-MEMC-003 | `compactMemory` | `dryRun=true` は file と mtime を変更せず件数のみ返す。backup 作成失敗を注入すると compaction は中止され元 file が不変。 |
| U-MEMC-004 | `memoryCompactionAdvice` | 閾値未満で `recommend=false`、`total>=200` または superseded 比率 `>=0.5` で `recommend=true`（境界値を含む）。 |
| U-HDRV-001 | `deriveHandoverSnapshot` | fixture db（非終端 PLAN 2 件 + blocker）から active PLAN / blocker 集計 / HEAD sha を deterministic に返す（同一入力 → deep equal）。 |
| U-HDRV-002 | `renderCurrentPointer` / `detectPointerDrift` | derived field を毎回上書きし、`takeover_note` を保持する。note 以外への手書き変更は field 単位で検出する。 |
| U-HDRV-003 | `deriveHandoverSnapshot` | db open 失敗 / HEAD 解決失敗は fail-close（pointer を書かない・error 返却）。 |
| U-HDRV-004 | `renderCurrentPointer` | 再生成は状態が変わらない限り連続実行で内容が不変（`generated_at` を除く）。 |
