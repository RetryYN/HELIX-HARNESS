---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-COR-01
group: コア
product: HARNESS／OS
atoms_primary: 142
atoms_secondary: 187
issue_projection: none
---

# RUL-COR-01（コア／HARNESS／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

正本を一つに保つ。要求や設計の意味は正本からだけ読み、DB・projection・生成物・会話を第二の正本にしない。作業者は状態DBへ直接書かない。

## 主として対応づいた規則（142件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-006` | エージェントは恒久ルールを会話だけに置かず、AGENTS.mdおよびCLAUDE.mdに置く。 | memory_context | prose | AGENTS.md:24-25 |
| `RA-007` | Codexは作業時にCore Readsとして列挙されたConcept候補・要件・移行計画・ADR・層authority・governance入口を読み、そのworkflowに従う。 | memory_context | prose | AGENTS.md:48-60 |
| `RA-008` | ClaudeはCLAUDE.md、.claude/CLAUDE.md、governance入口、層authority、Concept候補、要件、移行計画、ADRの指定順で読み、各文書のauthority注記に従う。 | memory_context | prose | CLAUDE.md:3-17; .claude/CLAUDE.md:21-22 |
| `RA-197` | エージェントはGit上のRequirement・Design・PLANを意味正本、event・receiptを実行事実、DB・Projectをprojectionとし、Project Statusから意味や完了を逆書込みしない。 | process_gate | prose | AGENTS.md:162-163; CLAUDE.md:297-297 |
| `RB0-001` | Claude Code・Codex・人間reviewerは、通常タスクでgovernance入口の指定順に正本文書を読む。 | memory_context | prose | docs/governance/README.md:11-22 |
| `RB0-002` | 要求対象を整理する者は製品責務決定を確認し、旧Conceptの対象混在記述を優先してはならない。 | escalation_authority | prose | docs/governance/README.md:8-9 |
| `RB0-009` | 要求確認者は要求本文・正本JSON・合意状態・層対応を辿り、GitHub Issue・PR・Projectsを要求の意味正本にしない。 | escalation_authority | prose | docs/governance/README.md:41-45 |
| `RB0-011` | 判断者は参考文書・旧版・個人原稿・runtime stateを、受入条件や実装導線の正本として使わない。 | memory_context | prose | docs/governance/README.md:49-65 |
| `RB0-015` | 作業者はdocs/design/harness配下を新規要件・設計・trace・gate・fixture・CI期待値の判断正本にしない。 | memory_context | prose | docs/governance/README.md:69-76 |
| `RB0-103` | 判断者はGit上のRequirement・Design・PLANを意味正本、admitted event・receiptを実行事実、DBとProjectを再構築可能なprojectionとして扱う。 | memory_context | prose | docs/governance/management-scrum-product-forward.md:21-23 |
| `RB0-121` | boundary作成者は実装定数で固定されたauthority pathとrule pathをboundary JSONから指定してはならない。 | safety_security | prose | docs/governance/worker-context-boundary-operator-guide.md:93-110 |
| `RB04-001` | 作業者は層・pair・runtime判断でL3進行authorityとL1-L12 canonical契約を正とし、本文の旧層表現を新規設計・gate・CI期待値やL3 freeze条件に使用しない。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:1-3; docs/governance/helix-harness-concept_v3.1.md:23-26 |
| `RB04-032` | 作業者はL1/L2の収束宣言後、要件定義をdecision recordとして扱う。 | memory_context | prose | docs/governance/helix-harness-concept_v3.1.md:341-341 |
| `RB04-065` | 各工程で発見・拡張した機能要求はL1のFR registryへback-mergeし、登録漏れ・欠番・属性・件数・画面被覆を監査する。 | process_gate | prose／lint | docs/governance/helix-harness-concept_v3.1.md:602-602 |
| `RB04-087` | PLAN本文は進め方と中間準備を記録し、機能仕様の正本docとは分離してgeneratesで成果物を宣言する。 | memory_context | prose | docs/governance/helix-harness-concept_v3.1.md:762-762; docs/governance/helix-harness-concept_v3.1.md:1168-1168 |
| `RB04-114` | failure_logはgitignoredの個人advisoryとし、escalation集計の正本入力には共有auditだけを使用し、PR labelは状態表示に限定する。 | evidence_claim | prose／config | docs/governance/helix-harness-concept_v3.1.md:1022-1032 |
| `RB04-120` | coding rule管理者はcoding-rules.mdをrule IDとworkflow配置の正本とし、文書化をCIの後付けでなく開発workflowに組み込む。 | process_gate | prose／doctor | docs/governance/helix-harness-concept_v3.1.md:1114-1116 |
| `RB04-144` | continuationはauthored sourceとappend-only eventからDBへ投影し、proseやlocal pointerを正本にしない。 | memory_context | prose | docs/governance/helix-harness-concept_v3.1.md:1237-1237 |
| `RB04-156` | 読者は運用ルール書を個別機能ソースとして扱い、受入条件・runtime導線・実装優先度の正本にせず、soloではPOとAI rosterへ読み替える。 | memory_context | prose | docs/governance/ai-dev-team-operations_v1.1.md:2-4 |
| `RB04-239` | 読者はチーム構想書を機能ソースとして扱い、HELIXの仕組みの正本にせず、soloではPO一名とworker≠verifierのAI rosterへ写像する。 | memory_context | prose | docs/governance/ai-dev-team-concept_v1.1.md:2-4 |
| `RB04-242` | チームはGitHubへ全情報を集約し、Gitを運用上の真実の源とする。 | memory_context | prose | docs/governance/ai-dev-team-concept_v1.1.md:57-69 |
| `RB05-001` | 開発担当は開発対象をドキュメントで定義し、Issueは補助として扱う。 | process_gate | prose | docs/governance/audit-framework.md:76-78 |
| `RB05-089` | DB検証者はruntime観測入力を除外したtracked authorityからfull rebuildを2回行い、policyで正規化したprojectionとcheckpointのdigest一致を要求する。 | evidence_claim | gate | docs/governance/l3-rebaseline-g3-freeze-packet.md:178-180; docs/governance/l3-rebaseline-g3-freeze-packet.md:498-499 |
| `RB05-119` | 要件管理者は原文・atom・authority・oracle・service・template・obligation・revision・変更判断を要件定義台帳の正本として保持する。 | memory_context | prose | docs/governance/infinity-loop-source-capability-ledger.md:73-73 |
| `RB05-176` | Python workerによる正本DBへの直接書込みを拒否し、Nodeがschema検証済みresultだけをtransaction commitする。 | safety_security | prose | docs/governance/infinity-loop-system-assertion-cases.md:98-98; docs/governance/infinity-loop-system-assertion-cases.md:404-409 |
| `RB05-227` | Requirement Translatorはcustody済み入力だけを処理し、atomとtyped mappingを提案として生成してactive正本を直接変更しない。 | process_gate | prose | docs/governance/infinity-loop-system-assertion-cases.md:251-252 |
| `RB05-255` | DB projection構築時はproduct・engine・detector・IPC・CI・agentのauthorityを分離する。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:410-410 |
| `RB05-285` | 各behavior atomにはcurrent decisionを一つだけ持たせ、過去decisionはappend-only revisionとして保持する。 | memory_context | prose | docs/governance/infinity-loop-source-atomization-contract.md:69-69 |
| `RB05-302` | cache・temp・logはevidence-onlyまたはrejectとして正本へ昇格せず、duplicate packaged copyはcanonical参照と同一性証拠を残して二重算入しない。 | memory_context | prose／gate | docs/governance/infinity-loop-source-atomization-contract.md:235-236 |
| `RB05-313` | reverse traceは同じcanonical edge集合から生成し、別名relationやinverse rowを追加せず、forward/reverseでsnapshot・target digest・edge digestを共有して片側更新を禁止する。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:385-386 |
| `RB05-345` | drive-route catalogはcompatibility inventoryとして扱い、current authorityをworkflow-classification-catalog.v1.jsonに置く。 | memory_context | config | config/drive-route-catalog.json:2-4 |
| `RB06-001` | AIは自由に起草・修正できるが、変更の正本化は機械検証を伴うAuthoring Admission Transactionを通す。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:29-45 |
| `RB06-002` | AIは未検証のProposalを、Canonical要件、設計完了、実装許可の根拠に使用しない。 | evidence_claim | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:51-57 |
| `RB06-004` | AIは検査途中のCandidateをCanonical確定として扱わない。 | evidence_claim | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:66-66 |
| `RB06-017` | 実装者はeventからMarkdownとDB projectionを再構築可能にする。 | memory_context | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:191-191; docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:321-321 |
| `RB06-042` | 設計者はresearch本文を実装契約にせず、採択した行だけをcurrent authorityへ再記述する。 | evidence_claim | prose | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:244-244 |
| `RB06-061` | 提案されたdraft検査では、Forward正規PLANがdraft・PoC成果物を採用済みとして引用していないか検査する。 | evidence_claim | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:161-164 |
| `RB06-070` | 要件台帳管理者はauthorityの由来を区別し、外部code由来でない要求へsource capability atomを強制しない。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-definition-ledger.md:24-24 |
| `RB06-090` | 管理者は非Codex runtimeの権限境界を会話やmemoryだけに置かず、AGENTS.md本体に置く。 | memory_context | prose | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:45-54 |
| `RB06-116` | Requirement Translatorは原文を保持し、入力をatom・challenge・gapへ分岐して根拠のない確定を行わない。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:53-53; docs/governance/infinity-loop-assertion-coverage-ledger.md:111-111 |
| `RB06-165` | runtimeはTypeScript strictのNode control planeとschema適合resultを返すPython data planeへ分離し、Pythonによる正本・DB直接writeを拒否する。 | tooling_runtime | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:143-145; docs/governance/infinity-loop-assertion-coverage-ledger.md:149-149 |
| `RB06-170` | DB projection構築はproduct・engine・detector・IPC・CI・agentのauthorityを分離する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:152-152 |
| `RB06-214` | candidate projectionは非canonicalとし、eventだけから導出して直接更新を認めない。 | memory_context | config | config/requirement-discovery-event-schema.json:172-176 |
| `RB06-254` | semantic移管のrollbackではPython結果をadvisory・historical・非admitへ降格し、dispatch・DB・registry・receipt・lease・capacity・AssignmentのNode authorityを維持する。 | tooling_runtime | prose | docs/governance/python-semantic-migration-ledger.v1.yaml:60-170 |
| `RB06-275` | 工程定義者はdocs/processを正本にし、旧source process referenceを正本にせず、工程・駆動の追加をL3で決める。 | process_gate | prose | docs/governance/repository-structure.md:109-109; docs/governance/repository-structure.md:157-157 |
| `RB06-277` | 実装者はenum・契約をsrc/schemaの単一正本に置き、他の場所へ再定義しない。 | tooling_runtime | prose | docs/governance/repository-structure.md:113-113; docs/governance/repository-structure.md:155-155 |
| `RB06-299` | package採用者は既存要件台帳・agent guardへ接続して二重定義を解消し、正式importをsuccessor PLANとして起票する。 | process_gate | prose | docs/governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md:80-84 |
| `RB07-089` | PoC担当者はS4更新後にdoctorとstatusを実行し、DB projectionへoutcomeとnext actionが反映されたことを確認する。 | memory_context | prose | docs/skills/poc.md:87-93 |
| `RB07-183` | 可視化担当者はdocs・DB・graph・runtime evidenceのread modelを正とし、LLM生成図を正本にしない。 | evidence_claim | prose | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:51-51 |
| `RB07-235` | 設計者は障害・監査・引継ぎで必要になる情報を書く一方、既に正本がある情報は再定義せず参照する。 | memory_context | prose | docs/skills/design-tailoring.md:52-55 |
| `RB07-238` | 担当者は技術判断をADR、要求を要件文書、用語をglossary、実装設計を対向設計、未決事項をPLAN残課題、完了根拠をreview_evidenceへ記録する。 | memory_context | prose | docs/skills/design-tailoring.md:69-81 |
| `RB07-243` | 分類移行担当者はrequirementsを意味authorityとし、旧15 route・concept・旧設計・9 mode・広義driveをcurrent identityの根拠にしない。 | process_gate | prose | docs/governance/route-classification-surface-inventory-2026-08-15.md:14-21 |
| `RB07-298` | 継続担当者はauthored資料を契約正本、DBを進捗projection、session JSONLを実行provenance、fenced memoryを限定recallとし、memoryの矛盾時はDBを優先して診断を出す。 | memory_context | prose | docs/governance/session-handover-retirement-disposition.md:33-39 |
| `RB07-305` | startupはrequirements-ir manifestを意味正本としてcanonical JSONのみを読み、旧Markdownを移行・互換のread-onlyに限定して二重authorityを禁止する。 | memory_context | config | docs/governance/effective-agent-startup-followup-registry.json:18-25 |
| `RB07-309` | authority検査はIssue proseの要件正本化、reference/historyのactive判断投入、source修正によるstale生成物の隠蔽、unknown lifecycle文書のcurrent昇格を拒否する。 | process_gate | config | docs/governance/effective-agent-startup-followup-registry.json:71-76 |
| `RB08-133` | 作業者はharness.dbへ直接書き込まず、設計上の真実の正本として扱わない。 | memory_context | prose | docs/skills/harness-observability.md:35-42 |
| `RB08-158` | DB担当者はharness.dbを手編集せずprojection writer経由で更新し、不一致時はrebuild後にdoctorを再実行する。 | memory_context | prose | docs/skills/db.md:36-46 |
| `RB08-181` | runbook作成者は閾値を観測設計正本への参照にし、値を重複記載せず、runbookをPLAN generatesへ登録する。 | doc_language | prose | docs/skills/incident-runbook.md:42-43 |
| `RB08-248` | 移行担当者はL0 charterを全層authorityの層外anchorとして維持し、旧運用feedbackをL12/L1・DB lifecycle・Reverse入口として保存する。 | process_gate | prose | docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:59-67 |
| `RB08-257` | release担当者はroadmapを実装順projectionに限定し、Functional Release Slice候補をL3承認・L10 pair・IR admission前にruntime・DB・CLI・catalog・tag・publish・cutoverへ投影しない。 | escalation_authority | prose | docs/governance/release-module-bundle-rollout-roadmap.md:3-17 |
| `RB08-267` | L2 placeholder担当者は着手時に免除または置換を機械検証へ接続し、履歴ledger参照者は過去件数より現行正本文書の値を優先する。 | evidence_claim | prose | docs/governance/runtime-parity-l0-l3-design-audit-2026-06-02.md:73-76 |
| `RB08-285` | package利用者は同名だけで中間物を正本へ昇格せず、packageをmigration sourceに限定し、canonical要求を現行要件文書へ置く。 | evidence_claim | prose | docs/governance/hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md:44-44; docs/governance/hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md:54-56 |
| `RB08-319` | RLO担当者はIssueまたはPLANのexactly oneをscope authorityにし、専用branchを使い、二重正本を拒否する。文書の存在やPOの関心を暗黙承認と扱わない。 | escalation_authority | prose | docs/governance/rlo-819-approval-packet-2026-08-20.md:42-47 |
| `RB08-326` | 投資指示書取込担当者は未実体参照を既存の統合カード節へ解決し、存在しない別文書を作って第二正本にしない。 | doc_language | prose | docs/governance/development-investment-stage-directives-source-cleanup-2026-09-11.md:13-16 |
| `RB09-022` | System Synthesis roadmapの編集者は、要求と受入の正本をそれぞれ指定のrequirements文書とacceptance文書に置き、roadmapには実装順とparking条件だけを記載する。独自のrequirement、route、DB authorityを追加してはならない。 | escalation_authority | prose | docs/governance/system-synthesis-rollout-roadmap.md:3-7 |
| `RB09-057` | Requirement IRのconsumerは、要求意味の読取りをcanonical JSONだけから行う。 | escalation_authority | config | config/requirement-ir-authority.json:23-24 |
| `RB09-059` | Requirement IRのconsumerは、generated Markdownを読取り専用viewとして扱う。 | escalation_authority | config | config/requirement-ir-authority.json:23-26 |
| `RB09-061` | Requirement IRのconsumerは、dual authorityを成立させてはならない。 | escalation_authority | config | config/requirement-ir-authority.json:23-28 |
| `RB09-087` | 要件文書のconsumerは、helix-harness-requirements_v1.3.mdを現行要件正本、v1.2をsupersede済み互換参照として扱う。v1.2の章構成に内容依存するlint gateは互換参照をanchorとして使う。 | escalation_authority | config | docs/governance/requirements-doc-registry.json:3-5 |
| `RB09-088` | 要件正本の切替担当者は、正本切替時にrequirements-doc-registry.jsonだけを更新し、src/へ正本パスをハードコードしてはならない。 | tooling_runtime | config | docs/governance/requirements-doc-registry.json:5-5 |
| `RC01-014` | closure-authority-registry lintは、registryとsourceのdriftが1件でも渡された場合、不合格にする。 | escalation_authority | lint | src/lint/closure-authority-registry.ts:22-44 |
| `RC01-144` | sub-doc-catalog-driftは、requirementsのlayer集合または各layerのsub-doc集合がschemaのVALID_SUB_DOCSと一致しない場合、不合格にする。 | process_gate | lint | src/lint/sub-doc-catalog-drift.ts:56-86 |
| `RC02-005` | doctorのstate-db-schema-authority checkは、実DBのschemaに正規migrationから生成したschemaとの差分がある、または比較に失敗した場合に失敗する。実DB未作成かつactualDb未指定の場合は成功として適用を省略する。 | process_gate | doctor | src/doctor/state-db-schema-authority.ts:21-67 |
| `RC02-008` | doctorのworkflow-guide-authority checkは、guide生成失敗、identity・authority・signal集合の不一致、旧identity keyの出力、guide digest重複、生成件数不足、または読込例外で失敗する。 | process_gate | doctor | src/doctor/workflow-guide-authority.ts:18-18; src/doctor/workflow-guide-authority.ts:65-183; src/doctor/workflow-guide-authority.ts:193-210 |
| `RC02-017` | 論理DB receipt生成器は、policyがtracked workspaceを必須としていない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:119-121 |
| `RC02-018` | 論理DB receipt生成器は、policyがruntime logsをexcludeとしていない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:122-124 |
| `RC02-019` | 論理DB receipt生成器は、除外入力pathの配列が実装の固定配列と一致しない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:74-83; src/doctor/l3-g3-logical-db-receipt.ts:125-130 |
| `RC02-020` | 論理DB receipt生成器は、除外projection stepの配列が実装の固定配列と一致しない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:84-92; src/doctor/l3-g3-logical-db-receipt.ts:131-138 |
| `RC02-063` | doctorのsemantic-boundary checkは、semantic boundary検査が不合格、または入力読込失敗の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:1627-1635 |
| `RC02-127` | doctorのsub-doc-catalog-drift checkは、requirementsのsub-doc表とschemaのVALID_SUB_DOCSの同期検査が不合格、または要件読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5453-5473 |
| `RC02-131` | doctorのrequirements-binding-config checkは、必須の要件拘束config読込・schema検査またはrequirement authority検査のいずれかが不合格の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5541-5552 |
| `RC04-288` | Requirement IR authority設定は、意味の読取りをcanonical JSONに限定し、旧Markdownを移行・互換参照、生成Markdownを読取り専用viewとして扱う。 | process_gate | config | config/requirement-ir-authority.json:23-27 |
| `RC04-289` | Requirement IR authority設定は、書込みをJSON transactionに限定し、dual authorityを禁止する。 | process_gate | config | config/requirement-ir-authority.json:27-29 |
| `RD00-273` | review receipt検証は、approve時にDB projectionまたはcheckpointがreplay結果と異なる、もしくはdbConvergedが偽の場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:599-605 |
| `RD00-282` | canonical DB receipt束縛は、呼出側が明示したDB claimの値がcanonical値と異なる場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:675-698 |
| `RD01-098` | projection照合は、再構築結果と再読結果のPLAN・親lane・laneのidentityが一致しなければ失敗する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:345-351 |
| `RD01-099` | projection照合は、再構築結果と再読結果のlifecycle・HEAD・最終event IDが一致しなければ失敗する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:352-358 |
| `RD01-124` | orchestration transactionは、DB行がjournalにない、またはenvelope・順序・digest・投影・checkpointが再構築値と異なる場合に失敗する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-transaction.ts:380-401 |
| `RD01-151` | PLAN authoring処理は、予約authority pathが指定の固定pathと異なれば拒否する。 | escalation_authority | gate | src/runtime/forward-plan-authoring-transaction.ts:411-412 |
| `RD01-153` | PLAN authoring処理は、local予約authorityと入力snapshotが一致しなければ拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:419-420 |
| `RD01-154` | PLAN authoring処理は、fresh予約authorityとlocal authorityが一致しなければ拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:421-422 |
| `RD02-332` | provider pointer検証器は、current_pointerがちょうど1件でない場合に失敗とする。 | memory_context | gate | src/runtime/retirement-preserve.ts:819-826 |
| `RD03-175` | source registry検証は、authority requirement ID集合がcanonical FR/R/AC集合と重複なく完全一致しない場合、不合格にする。 | process_gate | gate | src/runtime/universal-improvement-source-registry.ts:594-608 |
| `RD03-187` | source registry評価は、repository上の現行registryがschema不適合または評価入力と内容不一致の場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:769-788 |
| `RD03-195` | source registry評価は、registryまたはentryが参照するauthorityファイルを取得できない場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:534-540; src/runtime/universal-improvement-source-registry.ts:941-950; src/runtime/universal-improvement-source-registry.ts:961-969 |
| `RD05-035` | completion-decision-packetは、generatedFromがoutstanding.completionReadinessでない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:225-230 |
| `RD05-067` | completion-decision-packetは、意味summaryのsourcePathsに指定されたpillar要件文書または受入テスト設計がない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:463-473 |
| `RD05-206` | ddd-tdd-rulesは、ForwardまたはAdd-feature工程文書にDDD/TDD正本文書への参照がない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:110-112; src/lint/ddd-tdd-rules.ts:127-129; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD06-094` | doc-consistency lintは、setup実装のversion-up dry-runコマンドがdistribution referenceのtargetTagと所定remote定数から導出される記述でない場合、不足として返す。 | tooling_runtime | lint | src/lint/doc-consistency.ts:231-236 |
| `RD06-109` | document-agent-metadata lintは、対象集合内の異なる文書が同じ宣言IDを定義する場合、失敗させる。 | process_gate | lint | src/lint/document-agent-metadata.ts:225-243 |
| `RD07-151` | identifier-renameは、runbookまたは検証matrixでstate-writeと宣言されたコマンドにdb rebuildが含まれなければ違反とする。 | tooling_runtime | lint | src/lint/identifier-rename.ts:2102-2107; src/lint/identifier-rename.ts:2206-2211 |
| `RD08-177` | objective evidence auditは、bindingのevidence_pathが要件別canonical policyと異なる場合、失敗させ、検査にはcanonical側pathを使う。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:85-122; src/lint/objective-evidence-audit.ts:524-539 |
| `RD08-178` | objective evidence auditは、bindingのobservation_markerが要件別canonical policyと異なる場合、失敗させ、検査にはcanonical側markerを使う。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:531-541 |
| `RD09-040` | plan-entry-routingは、typed workflow_identityのauthorityにcatalog driftが検出された場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:159-164; src/lint/plan-entry-routing.ts:329-336; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-090` | PR scope preflightは、PLAN status変更後のlive snapshotとHEAD snapshotが異なる場合、再生成結果を意図したcommitに含めるよう案内する。 | review_merge | lint | src/lint/pr-scope-preflight.ts:121-125; src/lint/pr-scope-preflight.ts:144-146; src/lint/pr-scope-preflight.ts:308-308 |
| `RD09-146` | relation graph投影は、catalog itemまたは凍結baselineに未登録の設計文書がある場合、errorを返し、impact分析を失敗させる。 | process_gate | lint | src/lint/relation-graph.ts:245-252; src/lint/relation-graph.ts:712-715; src/lint/relation-graph.ts:761-767 |
| `RD09-150` | relation impact分析は、design catalog nodeがあるのにcatalogs edgeが1件未満の場合、missing-projection errorで失敗させる。 | process_gate | lint | src/lint/relation-graph.ts:624-645 |
| `RD09-153` | relation impact分析は、design catalog nodeがあるのにgoverned-by edgeが1件未満の場合、missing-projection errorで失敗させる。 | process_gate | lint | src/lint/relation-graph.ts:624-645 |
| `RD10-121` | semantic boundary gateはsemantic sourceにDB path・DB openの規定patternを検出した場合に失敗させる。 | safety_security | lint／gate | src/lint/semantic-boundary.ts:53-55; src/lint/semantic-boundary.ts:212-226 |
| `RD10-123` | semantic boundary gateはsemantic sourceに引用符直後の.helix/参照を検出した場合に失敗させる。 | safety_security | lint／gate | src/lint/semantic-boundary.ts:57-57; src/lint/semantic-boundary.ts:215-225 |
| `RD10-133` | frontier binding検証は一致recordのsourcePathsに要求された正本文書pathがなければ違反を返す。 | evidence_claim | lint | src/lint/semantic-frontier-binding.ts:45-45; src/lint/semantic-frontier-binding.ts:87-92 |
| `RD10-135` | frontier整合lintはL3文書にG-SF semantic_feature_frontier_recordへの写像節がなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:283-285 |
| `RD10-139` | frontier整合lintは確定機能catalogの各meaningMarkerがL3文書に存在しなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:121-255; src/lint/semantic-frontier-consistency.ts:303-306 |
| `RD10-146` | frontier整合lintはlive confirmed recordのfeatureIdが確定意味catalogにない場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:350-360 |
| `RD10-148` | frontier整合lintは期待された確定機能のlive recordが存在しなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:366-373 |
| `RD10-154` | frontier整合lintは確定機能recordのsourcePathsにL3正本文書がなければ失敗させる。 | evidence_claim | lint | src/lint/semantic-frontier-consistency.ts:403-405 |
| `RD10-167` | frontier整合lintはlive frontierのsourcePathsにL3正本文書がなければ失敗させる。 | evidence_claim | lint | src/lint/semantic-frontier-consistency.ts:496-498 |
| `RD11-063` | profile lintは、gateを持ちsource bindingが存在するprofileの確認日が正本ledgerの確認日と異なる場合に違反にする。 | evidence_claim | lint | src/lint/verification-profile.ts:470-475 |
| `RD11-092` | version-up lintは、source_ledger_freshnessの記録日が現在のledger確認日と異なる場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1168-1177 |
| `RD11-116` | activation write policy検査は、state-writeのcommandにdb rebuildが明示されていない場合に違反にする。 | tooling_runtime | lint | src/lint/version-up-readiness.ts:1955-1960 |
| `RE01-001` | 作業者は、v1.2を互換参照として扱い、新規要求の判断正本や未移行runtimeのfreeze根拠にしてはならない。 | process_gate | prose | docs/governance/helix-harness-requirements_v1.2.md:1-10 |
| `RE01-021` | DB連携処理は、projectionの更新を理由に著者が管理する設計文書を書き換えてはならない。 | memory_context | prose | docs/governance/helix-harness-requirements_v1.2.md:417-429 |
| `RE01-023` | 実装者はenumの正本を単一のZod schemaに置き、関連コメントとの同期を保つ。doctorは規定期間を超えたdriftを警告する。 | tooling_runtime | doctor | docs/governance/helix-harness-requirements_v1.2.md:445-445 |
| `RE01-039` | 作業者はruntimeの進捗状態を静的仕様の本文で管理してはならない。 | memory_context | prose | docs/governance/helix-harness-requirements_v1.2.md:602-602 |
| `RE01-081` | 記録処理は人間の承認値を捏造せず、authoredな意味、append-onlyな実行事実、DB projection、TTL付きmemoryを区別する。memoryから正本を上書きしてはならない。 | escalation_authority | prose | docs/governance/helix-harness-requirements_v1.2.md:1241-1247 |
| `RE01-086` | DB writerはNodeのnode:sqliteに限定し、PythonからDBへアクセスしてはならない。 | tooling_runtime | prose | docs/governance/helix-harness-requirements_v1.2.md:1282-1282 |
| `RE01-092` | graph処理は正本から決定的なprojectionを生成し、同一入力hashから同じ結果を得る。graphや生のtool出力を新しい意味authorityにしてはならない。 | evidence_claim | prose | docs/governance/helix-harness-requirements_v1.2.md:1320-1356 |
| `RE01-101` | export利用者は生成物の編集を正本変更として扱わず、人間の判断を戻す場合は別のimport経路を使用する。 | memory_context | prose | docs/governance/helix-harness-requirements_v1.2.md:1412-1415 |
| `RE01-161` | 文書作成者は用語の意味をConceptのauthorityに合わせ、下位文書で別の意味を正本化してはならない。 | behavior_discipline | prose | docs/governance/helix-harness-requirements_v1.2.md:2515-2515 |
| `RE01-167` | 設計者は物理パスから層を推定せず、L2のsourceと採否判断を参照する。 | behavior_discipline | prose | docs/governance/helix-harness-requirements_v1.3.md:31-36 |
| `RE01-182` | 実装者は要求registryを意味authorityとし、生成catalog、runtime enum、CLI、DB、README、labelを意味の正本にしてはならない。 | process_gate | prose | docs/governance/helix-harness-requirements_v1.3.md:123-130 |
| `RE01-198` | schema移行者はsource schemaを直接canonicalにせず、既知のcomposition gapをgreen扱いしない。L5でversion契約を定めてから修正する。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:263-263 |
| `RE01-210` | IDE連携はDB read modelにID・HEAD・redactionを付けて表示し、独立した正本やstaleなwrite経路を作らない。 | memory_context | gate | docs/governance/helix-harness-requirements_v1.3.md:293-293 |
| `RE01-236` | 要求compilerはJSONだけを更新正本にし、生成Markdownをread-onlyにする。別engine・ledger・層・DBの二重体系を作らず、固定件数を全要求の証明にしない。 | tooling_runtime | gate | docs/governance/helix-harness-requirements_v1.3.md:402-418 |
| `RE01-237` | 外部AI連携の実装者はその出力を非authorityとして扱い、Python semantic coreやNode commit boundaryの優先関係を変更しない。 | escalation_authority | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:424-424 |
| `RE01-239` | worker連携はtyped eventを使い、approvalとwriteはNodeだけが行う。repository内の恒久bypassや上位制約を弱めるoverrideを認めない。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:429-430 |
| `RE01-284` | 受入記録者は人間との合意を捏造せず、生成Markdownの編集でJSON正本と別のauthorityを作らない。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:637-664 |
| `RG03-008` | Codex／GPT系runtimeは、docs/skills/judgment-core.mdを判断規律の正本として参照し、AGENTS.mdの判断規律をその差分として適用する。 | behavior_discipline | prose | AGENTS.md:213-216 |
| `RG09-009` | oracle ID解決表の利用者は、既存文書から導出した解決表を新しい意味authorityとして扱ってはならない。 | escalation_authority | prose | docs/governance/ddd-tdd-rules.md:77-82 |
| `RG13-011` | freeze担当者はmerge後のread-after-writeでIssue #30の表示projectionを同期する。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:536-537 |
| `RG14-001` | NFR等級文書の作成者は新しい閾値を独自に発明せず、閾値変更をL1／L3正本へback-mergeしなければならない。 | process_gate | prose | docs/governance/nfr-consolidation-improvement-audit-2026-07-19.md:12-12 |
| `RG14-008` | repository構成文書の参照者は、層・pair・runtime判断にL3進行authority文書を用い、本文に残る旧layer／runtime表現をL3 freeze条件に使用してはならない。 | process_gate | prose | docs/governance/repository-structure.md:1-2 |

## 副として対応づいた規則（187件）

`RA-009`、`RA-029`、`RA-186`、`RA-188`、`RA-189`、`RA-293`、`RB0-003`、`RB0-004`、`RB0-006`、`RB0-008`、`RB0-010`、`RB0-014`、`RB0-018`、`RB0-040`、`RB0-086`、`RB0-104`、`RB0-159`、`RB0-172`、`RB03-001`、`RB04-005`、`RB04-010`、`RB04-011`、`RB04-062`、`RB04-064`、`RB04-067`、`RB04-106`、`RB04-127`、`RB04-145`、`RB04-150`、`RB04-159`、`RB05-046`、`RB05-055`、`RB05-075`、`RB05-109`、`RB05-128`、`RB05-150`、`RB05-158`、`RB05-162`、`RB05-174`、`RB05-202`、`RB05-233`、`RB05-256`、`RB05-260`、`RB05-262`、`RB05-266`、`RB05-271`、`RB05-277`、`RB05-294`、`RB05-334`、`RB06-005`、`RB06-018`、`RB06-031`、`RB06-033`、`RB06-080`、`RB06-101`、`RB06-108`、`RB06-127`、`RB06-136`、`RB06-154`、`RB06-188`、`RB06-219`、`RB06-220`、`RB06-223`、`RB06-248`、`RB06-250`、`RB06-253`、`RB06-256`、`RB06-287`、`RB06-291`、`RB06-298`、`RB06-312`、`RB07-023`、`RB07-093`、`RB07-095`、`RB07-142`、`RB07-146`、`RB07-157`、`RB07-172`、`RB07-245`、`RB07-246`、`RB07-247`、`RB07-248`、`RB07-307`、`RB07-318`、`RB07-320`、`RB08-038`、`RB08-043`、`RB08-082`、`RB08-217`、`RB08-221`、`RB08-243`、`RB08-251`、`RB08-265`、`RB08-268`、`RB08-286`、`RB08-301`、`RB08-302`、`RB08-315`、`RB08-323`、`RB08-329`、`RB08-332`、`RB09-021`、`RB09-034`、`RB09-043`、`RB09-058`、`RB09-060`、`RB09-078`、`RC0-103`、`RC00-046`、`RC00-136`、`RC00-191`、`RC01-002`、`RC01-006`、`RC01-007`、`RC01-035`、`RC01-091`、`RC01-096`、`RC01-126`、`RC02-026`、`RC04-037`、`RC04-046`、`RC04-062`、`RC04-137`、`RC04-207`、`RC04-253`、`RD00-318`、`RD01-050`、`RD01-052`、`RD01-126`、`RD01-155`、`RD01-167`、`RD02-143`、`RD02-144`、`RD02-154`、`RD02-155`、`RD02-238`、`RD02-241`、`RD02-310`、`RD02-334`、`RD03-033`、`RD03-034`、`RD03-084`、`RD03-196`、`RD04-061`、`RD04-062`、`RD04-063`、`RD05-190`、`RD06-008`、`RD06-055`、`RD06-060`、`RD06-175`、`RD08-088`、`RD08-113`、`RD08-135`、`RD09-039`、`RD09-091`、`RD09-154`、`RD10-126`、`RD10-147`、`RD11-186`、`RD11-187`、`RD11-188`、`RD11-195`、`RE01-010`、`RE01-034`、`RE01-035`、`RE01-038`、`RE01-079`、`RE01-080`、`RE01-132`、`RE01-157`、`RE01-164`、`RE01-169`、`RE01-220`、`RE01-223`、`RE01-225`、`RE01-227`、`RE01-233`、`RE01-234`、`RE01-265`、`RE01-280`、`RG08-004`、`RG09-012`、`RG10-019`、`RG14-018`、`RG16-021`、`RG17-009`
