---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784
rule_id: RUL-REL-01
group: サービス⑥リリース
product: HARNESS
atoms_primary: 70
atoms_secondary: 44
issue_projection: #1856
---

# RUL-REL-01（サービス⑥リリース／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

配布・公開・本番反映の条件を定める。公開先の制限、環境ごとの承認者、自己承認の禁止、復旧先の特定。

## 主として対応づいた規則（70件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-105` | release publish・tag・cutover・配布repository切替はaction-binding approvalを得て行う。 | escalation_authority | prose | n/a | action-binding approval | `RUL-OSM-01` | AGENTS.md:335-335; CLAUDE.md:193-193; CLAUDE.md:214-214 | A／gpt-6-astra |
| `RA-106` | 配布担当はremote sync・tag・publish・promotionを#659契約、identifier・state cutoverをPLAN-M-02承認契約に従って行う。 | escalation_authority | prose | n/a | #659、PLAN-M-02 | `RUL-OSM-07`、`RUL-OSM-01` | AGENTS.md:84-86; CLAUDE.md:149-151 | A／gpt-6-astra |
| `RA-181` | /ship実行者はGO前にtrigger・手順・復旧目標を持つrollback planを用意し、rollback skillを参照する。 | review_merge | prose | n/a | ci-deploy-and-rollback | — | .claude/commands/ship.md:49-53; .claude/commands/ship.md:59-59 | A／gpt-6-astra |
| `RA-182` | /ship実行者はCritical findingがある場合、ユーザーがriskを明示受容しない限りNO-GOにする。 | review_merge | prose | n/a | — | `RUL-OSM-01` | .claude/commands/ship.md:60-60 | A／gpt-6-astra |
| `RA-258` | DevOps担当はrollback planのないdeploy手順を完成と呼ばない。 | evidence_claim | prose | n/a | — | `RUL-FRM-04` | .claude/agents/devops-deploy.md:16-17 | A／gpt-6-astra |
| `RA-293` | 配布担当は開発repositoryをsource正本とし、tag済releaseをDevOS配布repositoryへpublishし、consumerはそこから導入する。 | behavior_discipline | prose | n/a | RetryYN/HELIX-HARNESS-DevOS | `RUL-COR-01`、`RUL-COR-02` | AGENTS.md:80-83; CLAUDE.md:145-148 | A／gpt-6-astra |
| `RA-336` | DevOps担当はmainをprod、developをstaging、feature branchを開発に使い、devはpush、stagingはdevelop mergeで自動deploy、本番は手動承認とする。 | behavior_discipline | prose | n/a | 旧branch/deploy戦略 | `RUL-DEV-02` | .claude/agents/devops-deploy.md:37-46 | A／gpt-6-astra |
| `RA-337` | DevOps担当はBlue-GreenまたはRolling Updateを採用し、異常閾値超過時に前版へ戻し、必要ならDB down後に原因調査・修正・再deployする。 | behavior_discipline | prose | n/a | — | `RUL-DEV-02` | .claude/agents/devops-deploy.md:38-39; .claude/agents/devops-deploy.md:53-57 | A／gpt-6-astra |
| `RB0-067` | release・tag・cutover・配布先切替の担当者は既存のaction-binding approval境界を維持する。 | escalation_authority | prose | n/a | 旧action-binding approval | `RUL-OSM-01` | docs/governance/github-operation-rules.md:14-14 | B／gpt-6-astra |
| `RB04-183` | deploy機構はPR時にpreview、main merge時にstagingを自動deployし、本番はrelease tagと発注元・QA承認を条件とする。 | escalation_authority | prose／config | n/a | 旧環境別deploy trigger | `RUL-OSM-01` | docs/governance/ai-dev-team-operations_v1.1.md:355-363 | B04／gpt-6-astra |
| `RB04-184` | release担当者は原則平日午前中に実施し、緊急修正以外の金曜午後・連休前releaseを禁止する。 | process_gate | prose | n/a | 旧有人対応時間帯 | — | docs/governance/ai-dev-team-operations_v1.1.md:365-369 | B04／gpt-6-astra |
| `RB04-185` | release担当者は事前checklistを完了し、release後30分の監視担当を確保する。 | process_gate | prose | n/a | 30分監視 | — | docs/governance/ai-dev-team-operations_v1.1.md:371-373; docs/governance/ai-dev-team-operations_v1.1.md:1107-1107 | B04／gpt-6-astra |
| `RB04-202` | QAはrelease承認前にstaging動作・主要E2E・文書更新・rollback手順・監視alert・発注元共有を確認する。 | process_gate | prose／gate | n/a | 旧QA手動release gate | — | docs/governance/ai-dev-team-operations_v1.1.md:671-685 | B04／gpt-6-astra |
| `RB04-211` | 全員は公開repositoryへtest dataをcommitしない。 | safety_security | prose | n/a | test data一律禁止 | — | docs/governance/ai-dev-team-operations_v1.1.md:777-777 | B04／gpt-6-astra |
| `RB04-226` | deploy起因のrollback担当者は実施を宣言して前version tagを確認し、rollback後に主要動作を確認して収束宣言し、通常経路で原因修正する。 | process_gate | prose | n/a | #incident、release tag | — | docs/governance/ai-dev-team-operations_v1.1.md:985-999 | B04／gpt-6-astra |
| `RB04-228` | DB変更を含むrollbackはQAとTLで判断し、data復旧が必要ならbackup手順を確認する。 | escalation_authority | prose | n/a | 旧QA/TL | `RUL-OSM-01` | docs/governance/ai-dev-team-operations_v1.1.md:1003-1003 | B04／gpt-6-astra |
| `RB04-235` | 本番release担当者はrelease noteを作成し、release後にdeploy完了・health check・主要機能・error率・応答時間を確認して発注元へ完了報告する。 | evidence_claim | prose | n/a | 旧本番release checklist | `RUL-FRM-04` | docs/governance/ai-dev-team-operations_v1.1.md:1097-1097; docs/governance/ai-dev-team-operations_v1.1.md:1111-1123 | B04／gpt-6-astra |
| `RB04-253` | deploy担当者はIaC security checkと管理されたsecret注入を行い、IAMを最小権限で設計し、本番昇格に人間判断を残す。 | safety_security | prose／lint | n/a | tfsec/Checkov、旧secret管理製品 | `RUL-OSA-07`、`RUL-OSM-04` | docs/governance/ai-dev-team-concept_v1.1.md:243-251 | B04／claude_review |
| `RB06-127` | 配布構成検査は手編集indexとparty混在を拒否する。 | process_gate | prose | fail_close | 未実装DistributionMarketplaceSpec | `RUL-COR-01` | docs/governance/infinity-loop-assertion-coverage-ledger.md:63-63 | B06／gpt-6-astra |
| `RB06-217` | 配布担当者はdistribution tagのpublish・採用前にversion-up activationを成立させる。 | escalation_authority | prose／gate | fail_close | distribution version binding、当時v0.1.0 | `RUL-FRM-02` | docs/governance/helix-objective-evidence-audit.md:20-32 | B06／gpt-6-astra |
| `RB06-243` | 切替担当者はruntime・generated・docs/test・archive・authorityの全surfaceを非公開で反転し、中間push・配布生成・consumer公開を禁止して最終snapshotだけをatomic pushする。 | review_merge | prose | fail_close | 複数local commit、単一publish snapshot | `RUL-OSM-07` | docs/governance/session-handover-atomic-cutover-packet.md:150-161 | B06／gpt-6-astra |
| `RB06-244` | 公開判定者は全post-cutover oracleと必須commandのexit成功をANDで要求し、一件でも未達ならpublishしない。 | process_gate | prose／gate／doctor | fail_close | U-HRET/IT-CONT/ST系、fresh/brownfield検証 | `RUL-FRM-04` | docs/governance/session-handover-atomic-cutover-packet.md:163-181; docs/governance/session-handover-atomic-cutover-packet.md:202-203 | B06／gpt-6-astra |
| `RB06-288` | 配布担当者はpublic npm publishを行わず、CLI・CI・各toolが同じengineを取得する構成にする。 | tooling_runtime | prose | n/a | 社内GitHub-pull、Claude pluginは補助 | `RUL-COR-05` | docs/governance/repository-structure.md:185-186 | B06／gpt-6-astra |
| `RB07-022` | 配布担当者はtag・release公開コマンドをdry-run planとして提示し、実際の外部公開を人間承認の境界に残す。 | escalation_authority | prose | fail_close | distribution release-plan | `RUL-OSM-01` | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:58-63; docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:99-99 | B07／gpt-6-astra |
| `RB07-115` | 配布catalogはworkflow switching、resident lanes、lane supervisor、Grok/Cursor lanes、自動fallback、multi-head runtime、未完security broker、開発PLAN・state・evidence・credentialsを配布対象から除外する。 | safety_security | config | n/a | 各capabilityのdisposition=excluded | `RUL-OSM-04` | config/distribution-capability-artifact-catalog.json:114-123 | B07／gpt-6-astra |
| `RB07-145` | Phase 0担当者は初期配布を列挙されたCLI・hook・role policy・mode検出・CI・設定template・shimに限定し、Reverse・Scrum・全層DB・詳細telemetryを後続へ回す。 | process_gate | prose | n/a | 旧Phase 0配布scope | `RUL-TKT-03` | docs/governance/helix-harness-extraction-plan_v0.1.md:40-56 | B07／gpt-6-astra |
| `RB07-334` | deploy担当者はharness-check成功前にdeployを始めず、rollback基準を問題発生前にPLANへ定義する。 | process_gate | prose／ci | fail_close | harness-check | — | docs/skills/ci-deploy-and-rollback.md:22-24; docs/skills/ci-deploy-and-rollback.md:66-69 | B07／gpt-6-astra |
| `RB07-335` | deploy担当者はlint・test・typecheck・doctor・plan lint・reviewを全てgreenにし、失敗時はdeployを止め、no-verifyで迂回しない。 | process_gate | prose | fail_close | 旧pre-deploy command列 | `RUL-OSA-05` | docs/skills/ci-deploy-and-rollback.md:32-46 | B07／gpt-6-astra |
| `RB07-336` | data migrationなしのForward deployはrollingまたはdirect replace後すぐsmokeを行い、flag付き機能はflag-offでdeployして検証後に有効化する。 | process_gate | prose | n/a | 旧Forward L12 | `RUL-DEV-02` | docs/skills/ci-deploy-and-rollback.md:48-54 | B07／gpt-6-astra |
| `RB07-337` | Incident hotfix担当者は最小変更branchと二者reviewを使い、安定化後にmainへmergeする。 | review_merge | prose | n/a | Incident hotfix | `RUL-OSA-01`、`RUL-DEV-01` | docs/skills/ci-deploy-and-rollback.md:55-55 | B07／gpt-6-astra |
| `RB07-338` | deploy担当者はhealth 200、主要経路、doctorのdriftなしを確認し、約15分間baseline比のerror rateを監視して結果をauditへ残す。 | evidence_claim | prose | n/a | 15分／.helix/audit/ | `RUL-FRM-04` | docs/skills/ci-deploy-and-rollback.md:57-64 | B07／gpt-6-astra |
| `RB07-339` | Sev1のrollback triggerが成立した場合、担当者はsecond opinionを待たずrollbackする。 | escalation_authority | prose | n/a | Sev1 | `RUL-OSM-01` | docs/skills/ci-deploy-and-rollback.md:68-70 | B07／gpt-6-astra |
| `RB07-340` | rollback担当者は時刻と理由をauditへ記し、flag-offまたは既知良好artifactの再deployを行い、smokeを再実行してrollback結果を記録する。 | process_gate | prose | n/a | previous tagged artifact／outcome=rollback | `RUL-FRM-04` | docs/skills/ci-deploy-and-rollback.md:72-78 | B07／gpt-6-astra |
| `RB07-341` | 旧rollback手順ではdata変更がある場合、app codeを戻す前にDB down-migrationを実行し、その後integrityを確認する。 | safety_security | prose | n/a | DB down-migration先行 | `RUL-DEV-02` | docs/skills/ci-deploy-and-rollback.md:54-54; docs/skills/ci-deploy-and-rollback.md:75-76 | B07／gpt-6-astra |
| `RB07-344` | DB変更担当者はstaging実行なしの本番data型変更やlockを取るtable rebuildを一度のdeployで行わない。 | safety_security | prose | fail_close | — | `RUL-DEV-02` | docs/skills/ci-deploy-and-rollback.md:92-92 | B07／gpt-6-astra |
| `RB07-345` | deploy完了判定者は事前gate、cutover前の戦略と閾値、smoke成功と監視正常、audit証跡、PLAN更新を確認し、rollback時は根因と回帰test付きRecovery PLANを要求する。 | process_gate | prose | fail_close | helix plan use／.helix/audit/ | `RUL-FRM-04`、`RUL-TKT-03` | docs/skills/ci-deploy-and-rollback.md:94-100 | B07／gpt-6-astra |
| `RB08-131` | 移行担当者はpassing integrity runを監査証跡に残してreviewし、測定可能なrollback triggerを記録するまでdeployしない。 | process_gate | prose | fail_close | .helix/audit/、helix review | `RUL-FRM-04` | docs/skills/data-migration.md:73-80 | B08／gpt-6-astra |
| `RB08-182` | Incident担当者はproduction障害・回帰・hotfixを入口とし、本番変更前にon-call・TL・PMの承認を記録する。 | escalation_authority | prose | fail_close | 三者承認 | `RUL-OSM-01`、`RUL-FRM-03` | docs/skills/incident-runbook.md:45-49; docs/skills/incident-runbook.md:77-77 | B08／gpt-6-astra |
| `RB08-259` | candidate wave担当者はcanonical promotion後だけRLS後続へ接続し、Slice preview/stableをBundleへ暗黙包含せず、不明・曖昧・staleをfullまたはfail-closeへ送る。 | process_gate | prose | fail_close | Wave 0.x、RLS-02 | `RUL-COR-04` | docs/governance/release-module-bundle-rollout-roadmap.md:41-48 | B08／gpt-6-astra |
| `RB08-260` | release担当者はWave 0を非公開shadowとし、後続waveのparity・依存Issue・dogfood・security・72時間soak・rollback/health検証の成立順を守る。 | process_gate | prose | fail_close | Wave 0〜7、helix各Bundle | `RUL-FRM-02` | docs/governance/release-module-bundle-rollout-roadmap.md:50-60 | B08／gpt-6-astra |
| `RB08-261` | release担当者は要求正本化やlocal shadow buildをremote publish許可と解釈せず、tag・release・cutoverをrelease policyとcredential target authorityへ従わせる。 | escalation_authority | prose | fail_close | release policy | `RUL-OSM-01` | docs/governance/release-module-bundle-rollout-roadmap.md:62-63 | B08／gpt-6-astra |
| `RB08-342` | consumer_core_v1配布担当者はcatalogの許可capability集合に限定し、常駐multi-runtime・自動fallback・未完成security broker・開発PLAN/state/evidence/credentialsを含めない。 | safety_security | config | n/a | HELIX-HARNESS-LITE、consumer_core_v1 | `RUL-OSM-04` | config/distribution-profile-catalog.json:14-37 | B08／gpt-6-astra |
| `RB08-343` | 配布profileの昇格担当者はversion付きreceipt経由だけで昇格し、manual editを行わない。 | process_gate | config | fail_close | versioned_receipt_only | `RUL-COR-04` | config/distribution-profile-catalog.json:39-42 | B08／gpt-6-astra |
| `RB09-049` | production gateの設計者は、GitHub Environmentのrequired reviewer、self-review禁止、branch／tag制限、environment secret遅延公開を利用し、plan／visibilityによる機能差をpreflightする。 | safety_security | prose／gate | n/a | GitHub Environment protection、2026-07-23の採用方針 | `RUL-OSM-04`、`RUL-COR-04` | docs/governance/devops-external-source-research-2026-07-23.md:21-21 | B09／gpt-6-astra |
| `RB09-051` | production deploymentの実行者は、job開始前に承認を得て、self-approvalを行ってはならない。承認機能が非対応の場合はproductionを開いてはならない。 | escalation_authority | prose／gate | fail_close | GitHub deployment approval | `RUL-OSM-01`、`RUL-COR-04` | docs/governance/devops-external-source-research-2026-07-23.md:23-23 | B09／gpt-6-astra |
| `RC02-170` | doctorのversion-up-readiness checkは、readiness検査不合格、activation packetのverification command違反、または文書読込不能の場合に失敗する。 | process_gate | doctor | fail_close | buildVersionUpActivationPacketsとversionUpActivationVerificationCommandViolations | `RUL-OSA-06` | src/doctor/index.ts:6822-6848 | C02／gpt-6-astra |
| `RC04-290` | 配布profile設定は、promotionをversion付きreceipt経由に限定し、手動編集を禁止する。 | process_gate | config | n/a | consumer_core_v1 | `RUL-COR-02` | config/distribution-profile-catalog.json:39-42 | C04／gpt-6-astra |
| `RD03-220` | 配布文書の選別は、governanceを一括許可する指定がある場合、警告を出しconsumer配布を許可しない。 | safety_security | gate | fail_close | blanket_governance_allowlist warningとallowed_for_consumer=false。 | — | src/runtime/upstream-adoption.ts:237-251 | D03／gpt-6-astra |
| `RD03-221` | 配布文書の選別は、dogfoodまたはinternal markerがある文書をconsumer配布対象から除外する。 | safety_security | gate | fail_close | dogfood markerをinternal markerより優先。 | — | src/runtime/upstream-adoption.ts:240-245 | D03／gpt-6-astra |
| `RD03-222` | 配布文書の選別は、宣言audienceまたは既定分類がconsumerでない場合、consumer配布を許可しない。audience未指定でpathにauditを含む文書はdogfoodとする。 | safety_security | gate | fail_close | doc_path.includes('audit')による既定分類。 | — | src/runtime/upstream-adoption.ts:246-251 | D03／gpt-6-astra |
| `RD04-190` | action-binding readiness lintは、右腕工程文書にGitHub Environments required reviewers markerが無い場合に違反とする。 | review_merge | lint | fail_close | GitHub固有機能の文字列検査 | `RUL-OSA-06` | src/lint/action-binding-approval-readiness.ts:197-197; src/lint/action-binding-approval-readiness.ts:265-272 | D04／gpt-6-astra |
| `RD05-170` | cutover-readinessは、rollback_planにbranch/tag、restore/revert/rollback、alias/shimの各語群が揃わない場合、失敗させる。 | safety_security | lint | fail_close | alias/shim復旧を含む旧rename cutover契約 | `RUL-OSM-07` | src/lint/cutover-readiness.ts:408-417 | D05／gpt-6-astra |
| `RD05-171` | cutover-readinessは、state_backup_planにharness.db、memory/logs/handoverのいずれか、backup/restoreのいずれかが揃わない場合、失敗させる。 | safety_security | lint | fail_close | harness.dbと旧runtime stateのkeyword検査 | `RUL-OSM-07` | src/lint/cutover-readiness.ts:418-427 | D05／gpt-6-astra |
| `RD06-091` | doc-consistency lintは、L3柱別機能要求にv0.1.0からv0.1.4へ所定配布remoteを使うversion-up dry-runコマンドがない場合、不足として返す。 | tooling_runtime | lint | n/a | HELIX-HARNESS-DevOS.git、--json付き固定コマンド | — | src/lint/doc-consistency.ts:24-26; src/lint/doc-consistency.ts:215-220 | D06／gpt-6-astra |
| `RD06-092` | doc-consistency lintは、L6セットアップ設計に所定のv0.1.0からv0.1.4へのversion-up dry-runコマンドがない場合、不足として返す。 | tooling_runtime | lint | n/a | SETUP_VERSION_UP_COMMAND | — | src/lint/doc-consistency.ts:24-26; src/lint/doc-consistency.ts:221-225 | D06／gpt-6-astra |
| `RD08-196` | objective evidence auditは、監査本文に現在のpackage version・対応local tag・配布latest tag=unpublished・配布tag公開採用前のversion-up activation要求の各markerがない場合、失敗させる。 | evidence_claim | lint | fail_close | unpublished固定と英語activation marker | `RUL-COR-02` | src/lint/objective-evidence-audit.ts:732-743 | D08／gpt-6-astra |
| `RD09-109` | proposal-document-coverageは、ops-release-migrationを期待するシナリオでrollback_planがrequired_evidenceにない場合、失敗させる。 | safety_security | lint | fail_close | rollback_plan | — | src/lint/proposal-document-coverage-policy.ts:58-58; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-110` | proposal-document-coverageは、ops-release-migrationを期待するシナリオでmigration_rehearsalがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | migration_rehearsal | `RUL-FRM-04` | src/lint/proposal-document-coverage-policy.ts:58-58; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-124` | proposal-document-coverageは、ops-release-migrationを期待するシナリオでops-release-migration-reviewがrequired_gatesにない場合、失敗させる。 | process_gate | lint | fail_close | ops-release-migration-review | `RUL-FRM-02` | src/lint/proposal-document-coverage-policy.ts:72-72; src/lint/proposal-document-coverage.ts:169-178 | D09／gpt-6-astra |
| `RD11-095` | version-up lintは、外部境界を持つPLANのexternal_rehearsal_planに必須fieldが欠ける場合に違反にする。 | process_gate | lint | fail_close | 公式根拠、予算、署名、access、秘密・PII除外、本番書込み禁止、rollbackの7field | `RUL-OSM-04`、`RUL-OSA-06` | src/lint/version-up-readiness.ts:506-515; src/lint/version-up-readiness.ts:1200-1206 | D11／gpt-6-astra |
| `RD11-100` | version-up dry-runは、targetがcurrentと同版と判定された場合にblockする。 | process_gate | lint | fail_close | build metadataは比較対象から除外 | `RUL-COR-04` | src/lint/version-up-readiness.ts:1303-1304; src/lint/version-up-readiness.ts:2794-2809 | D11／gpt-6-astra |
| `RD11-101` | version-up dry-runは、targetがcurrentより低い版と判定された場合にblockする。 | process_gate | lint | fail_close | major・minor・patch・prereleaseの独自比較 | `RUL-COR-04` | src/lint/version-up-readiness.ts:1305-1306; src/lint/version-up-readiness.ts:2794-2828 | D11／gpt-6-astra |
| `RD11-102` | version-up dry-runは、targetがSemVerでもrelease tagの存在が示されていない場合にblockする。 | process_gate | lint | fail_close | releaseTagExistsの既定値はfalse | `RUL-COR-04` | src/lint/version-up-readiness.ts:1298-1309 | D11／gpt-6-astra |
| `RD11-142` | activation readiness検査は、外部境界がある場合、no_prod_write_checkの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | safety_security | lint | fail_close | activationEvidenceIsPending | `RUL-FRM-04` | src/lint/version-up-readiness.ts:540-540; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 | D11／gpt-6-astra |
| `RD11-143` | activation readiness検査は、外部境界がある場合、rollback_rehearsalの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | process_gate | lint | fail_close | activationEvidenceIsPending | `RUL-FRM-04` | src/lint/version-up-readiness.ts:541-541; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 | D11／gpt-6-astra |
| `RE01-211` | 配布検証者はmanifestに列挙されたfile集合とdigestを厳密に照合し、余分なfile・重複path・driftを拒否する。 | process_gate | gate | fail_close | distribution manifest | `RUL-COR-05` | docs/governance/helix-harness-requirements_v1.3.md:303-305 | E01／claude-opus |
| `RE01-215` | 配布candidateの作成者はREADMEの利用手順とlicense・attribution・provenance・免責を揃える。 | process_gate | gate | fail_close | distribution candidate受入項目 | `RUL-OSA-07` | docs/governance/helix-harness-requirements_v1.3.md:316-318 | E01／claude-opus |
| `RE01-217` | release担当者はSemVerのimmutable tagをHEAD・digestへ束縛し、canary・preview・stableで同じartifactを昇格する。途中の再buildや段階skipをしない。 | process_gate | gate | fail_close | canary/preview/stable promotion | `RUL-COR-02` | docs/governance/helix-harness-requirements_v1.3.md:323-325 | E01／claude-opus |
| `RE01-218` | 配布同期担当者はdry-run差分・backup/restore・canary・monitoringを揃え、rollbackでは直前のimmutable engine pinとmanaged領域だけを戻す。consumer成果物を戻してはならない。 | safety_security | gate | fail_close | distribution rollbackとengine pin | `RUL-OPS-01` | docs/governance/helix-harness-requirements_v1.3.md:326-328 | E01／claude-opus |
| `RE01-264` | cloud設計者はprovider中立の契約を保ち、Fargateは参照実装として扱う。本番resourceの操作には承認を得る。 | escalation_authority | prose／gate | fail_close | Fargate referenceとRDS fixture境界 | `RUL-OSM-01` | docs/governance/helix-harness-requirements_v1.3.md:519-523 | E01／claude-opus |

## 副として対応づいた規則（44件）

`RA-107`、`RA-110`、`RA-240`、`RA-241`、`RA-327`、`RA-342`、`RB04-118`、`RB04-160`、`RB04-169`、`RB04-172`、`RB04-227`、`RB04-229`、`RB04-234`、`RB05-071`、`RB05-080`、`RB05-360`、`RB05-365`、`RB06-009`、`RB06-068`、`RB06-084`、`RB06-246`、`RB06-252`、`RB07-343`、`RB08-125`、`RB08-159`、`RB08-190`、`RB08-226`、`RB08-311`、`RB09-054`、`RC01-127`、`RC03-017`、`RC03-044`、`RD05-152`、`RD05-172`、`RD05-173`、`RD09-100`、`RD11-094`、`RE01-077`、`RE01-174`、`RE01-212`、`RE01-214`、`RE01-219`、`RG36-011`、`RG36-013`
