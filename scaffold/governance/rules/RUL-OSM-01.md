---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSM-01
group: OS管理
product: OS
atoms_primary: 260
atoms_secondary: 170
issue_projection: none
---

# RUL-OSM-01（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

人間の判断が必要な事項を限定して列挙し、その定義を所有する（目的と範囲の変更、要求の削除と縮小、安全の緩和、機微な領域、取り消せない操作、公開、license、要求の矛盾、権限が不明な場合など）。該当する事項は判断資料を作り、対象と範囲へ束縛した承認が出るまで実行しない。暫定の判断は期限と確定条件を持つ。

## 主として対応づいた規則（260件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-104` | エージェントは認証・認可・決済・PII・secrets・license・本番基盤・破壊的操作・外部API前提を変える前にescalateする。 | escalation_authority | prose | AGENTS.md:151-152; AGENTS.md:223-224; CLAUDE.md:287-288; .claude/CLAUDE.md:223-224; .claude/agents/be-api.md:17-17; .claude/agents/db-schema.md:17-17; .claude/agents/devops-deploy.md:16-17; .claude/agents/pmo-sonnet.md:18-18; .claude/agents/pmo-sonnet.md:62-62 |
| `RA-118` | tech-forkは最終license判断と機微情報を含む転用検討をescalateし、商用候補はlegal・securityと再評価して単独決定しない。 | escalation_authority | prose | .claude/agents/pmo-tech-fork.md:17-17; .claude/agents/pmo-tech-fork.md:81-84 |
| `RA-122` | marketing scoutは人間確認なしにpricing・claim・法的文言・規制市場positioningを確定しない。 | escalation_authority | prose | .claude/agents/pdm-marketing-innovation.md:31-31 |
| `RA-123` | PDM managerは最終product判断やlicense・IP・security・production・pricing・legal・規制市場判断を確定せず、未解決の高影響前提を人間へ返す。 | escalation_authority | prose | .claude/agents/pdm-innovation-manager.md:18-19; .claude/agents/pdm-innovation-manager.md:30-33 |
| `RB0-076` | scopeを拡張する者は理由・承認・新manifest・CI/review再実行を揃えるまでPRをreadyにしない。 | escalation_authority | prose／gate | docs/governance/github-operation-rules.md:56-56 |
| `RB0-130` | agentは不可逆操作やproduction・認証認可・決済・PII・license・破壊的データ操作・外部API前提に関わる高影響変更へ着手する前にescalateする。 | escalation_authority | prose | docs/skills/judgment-core.md:53-57 |
| `RB04-025` | 本番影響・認証認可・決済・PII・secret・ライセンス・schema migration・破壊操作・外部API/infra変更は、modeを問わず人間サインオフまでブロックする。 | escalation_authority | prose／gate | docs/governance/helix-harness-concept_v3.1.md:220-220 |
| `RB04-050` | 推奨コマンドの生成者は人間向け表示と機械契約を分離し、auto_applyを既定false、Recovery・prod Incident・config_drift Retrofitを人間承認必須、高リスクupgradeをpreflight必須とする。 | tooling_runtime | config | docs/governance/helix-harness-concept_v3.1.md:465-471 |
| `RB04-051` | RecoveryではTLが再開点を確認しPOがscopeを承認し、prod Incidentではオンコール・TL・PMが確認し、config_drift RetrofitではTLが承認する。 | escalation_authority | prose／config | docs/governance/helix-harness-concept_v3.1.md:473-481 |
| `RB04-112` | escalation L1ではaimレビューを追加し、L2ではTL・QA・aim会議、L3ではPOへの直接通知と作業一時停止を行う。 | escalation_authority | prose | docs/governance/helix-harness-concept_v3.1.md:1001-1006 |
| `RB04-141` | setupのsoloからteamへの格上げはopt-inのgovernance変更とし、認証・admin preflightを要求する。 | escalation_authority | prose／config | docs/governance/helix-harness-concept_v3.1.md:1234-1234 |
| `RB04-142` | 参加規模の検出はsolo/teamの提案に留め、人間確認とstate記録で確定し、検出不能ならsoloへfallbackする。 | escalation_authority | prose | docs/governance/helix-harness-concept_v3.1.md:1235-1235 |
| `RB04-143` | GitHub設定は既定emit-onlyとし、明示applyでもaction-binding approvalと認証/admin preflightが揃う場合だけ適用し、tokenを保持しない。 | escalation_authority | prose／config | docs/governance/helix-harness-concept_v3.1.md:1236-1236 |
| `RB04-168` | 不審な事象があれば作業者は一旦停止してTL/QAへ相談し、責任境界を越える判断も該当役割へ確認する。 | escalation_authority | prose | docs/governance/ai-dev-team-operations_v1.1.md:123-127 |
| `RB04-191` | CI失敗の初動者はPR作成者へ通知してAIへ修正指示し、30分で解決しなければTLへエスカレーションする。 | escalation_authority | prose | docs/governance/ai-dev-team-operations_v1.1.md:489-491 |
| `RB04-192` | 稼働監視異常では到達性を確認し5分未解決ならTLへ、Critical security alertは即TLへ、性能劣化は顧客影響前にTLへ上げる。 | escalation_authority | prose | docs/governance/ai-dev-team-operations_v1.1.md:493-495 |
| `RB04-193` | alert対応者は本番影響があれば#incidentへ投稿してQAへ即連絡し、影響大ならTL/発注元へ上げ、影響がなければAI調査と通常PRで対応する。 | escalation_authority | prose | docs/governance/ai-dev-team-operations_v1.1.md:492-512 |
| `RB05-024` | 例示されたDB規則では、DB migrationを自動マージせず、削除系変更を人間レビューへ回す。 | escalation_authority | prose | docs/governance/audit-framework.md:309-316 |
| `RB05-029` | 例示された禁止事項では、開発者は認証・権限・GHA設定を無断で変更しない。 | escalation_authority | prose | docs/governance/audit-framework.md:315-316 |
| `RB05-035` | Merge GateはsafeをAI-B明示merge候補、cautionをTLレビュー、dangerを人間レビュー、unknownを自動マージ禁止へ振り分ける。 | review_merge | gate／ci | docs/governance/audit-framework.md:368-373; docs/governance/audit-framework.md:529-530 |
| `RB05-044` | AIレビューがunknownの場合はfail-closeし、人間レビューへ送る。 | escalation_authority | gate | docs/governance/audit-framework.md:497-497 |
| `RB05-050` | Gate・判断・incident分類はmachine、AI、humanの順にエスカレーションし、各層で判断が閉じた場合は次層を呼ばない。 | escalation_authority | prose | docs/governance/audit-framework.md:520-526 |
| `RB05-052` | incident severityは機械で一次分類し、曖昧な場合だけ人間へエスカレーションする。 | escalation_authority | prose | docs/governance/audit-framework.md:531-531 |
| `RB05-054` | 人間へのエスカレーション時は、判断してほしい事項・根拠・推奨アクションを構造化レポートで提示する。 | escalation_authority | prose | docs/governance/audit-framework.md:534-534 |
| `RB05-071` | G1/G3承認を下流pair freeze・実装・TDD・右腕実行の代替にせず、release・tag・production resource・identifier cutoverには別のaction-binding approvalを要求する。 | escalation_authority | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:325-326 |
| `RB05-080` | production resourceは対象作用に結び付いた承認が得られるまで作成しない。 | escalation_authority | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:385-387 |
| `RB05-093` | 承認者は承認コメントにmaterial HEAD/tree、packet review HEAD、requirements digest、DB digest・表別件数・異常ゼロ・収束状態、回答receiptを含める。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:520-534 |
| `RB05-139` | Redesign routerはL0変更をPOへエスカレーションし、実装claimを発行しない。 | escalation_authority | gate | docs/governance/infinity-loop-system-assertion-cases.md:34-34 |
| `RB05-198` | directiveのduplicateには生存target、false-positiveには独立反証、accepted-riskにはPO receiptを要求し、欠落時は終端化しない。 | escalation_authority | prose | docs/governance/infinity-loop-system-assertion-cases.md:155-157; docs/governance/infinity-loop-system-assertion-cases.md:432-432 |
| `RB05-199` | AIはuser directiveを不要としてcancel・reject・drop・closeせず、PO authorityのない終端化を拒否して原記録を非終端で保持する。 | escalation_authority | prose | docs/governance/infinity-loop-system-assertion-cases.md:158-158; docs/governance/infinity-loop-system-assertion-cases.md:341-341 |
| `RB05-257` | 高影響操作は対象作用に結び付いた承認が得られるまで適用を拒否する。 | escalation_authority | gate | docs/governance/infinity-loop-system-assertion-cases.md:417-417 |
| `RB05-338` | External API・issue tracker・hosted cloud・managed dashboardはaction-binding approvalとcredential/egress policyなしに有効化しない。 | escalation_authority | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:294-294 |
| `RB05-356` | Retrofitの環境影響を持つconfig drift適用はTL承認を要求し、自律操作を棚卸し・影響分析・preflight・dry-run・互換検証に限定する。 | escalation_authority | config | config/drive-route-catalog.json:144-153 |
| `RB05-358` | Recoveryの修復scopeと再開境界にはTL・POの承認を要求し、承認前の自律操作を診断・証拠収集・recovery packet準備にする。 | escalation_authority | config | config/drive-route-catalog.json:161-170 |
| `RB05-360` | Incidentの本番復旧・hotfixにはon_call・TL・PMのaction-bound承認を要求し、自律操作は検知・証拠収集・封じ込め復旧計画の準備とする。 | escalation_authority | config | config/drive-route-catalog.json:178-187 |
| `RB05-363` | version-upはpark・refresh・rehearsal・approval・activateの順で進み、外部作用または不可逆activationにはaction ownerの限定承認を要求する。 | escalation_authority | config | config/drive-route-catalog.json:212-221 |
| `RB06-006` | AIはAdmission PASS後、列挙された編集改善・一意な詳細化・trace補完など、可逆で外部影響のない変更を自動確定してよい。 | escalation_authority | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:78-83 |
| `RB06-007` | AIは上位目的・安全境界を維持し、scopeから一意に導出でき、影響特定・stale化・rollback・oracle更新が可能で未解決trade-offがない意味変更だけを自動revision化する。 | escalation_authority | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:85-96 |
| `RB06-009` | AIは目的・事業scope変更、要件削除・縮小、安全緩和、機微領域への影響、不可逆変更、破壊的契約・データ変更、ライセンス、trade-off、要求矛盾、authority不明、rollback不能、公開等ではDecision Packetを作りPO承認まで正本化を停止する。 | escalation_authority | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:100-108 |
| `RB06-022` | Admission判断者はeditorial・clarification・trace backfill等を決定論的検査だけで自動承認してよい。 | review_merge | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:224-226 |
| `RB06-051` | AIはtyped NFR registryの正式authority昇格時に、POのauthority receiptを取得する。 | escalation_authority | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:43-44; docs/governance/rule-enforcement-gap-audit-2026-08-12.md:199-203 |
| `RB06-053` | AIは既存PLANの物理移行や要件正本の意味・authority・受入条件変更に必要なPO承認を取得する。 | escalation_authority | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:199-203 |
| `RB06-066` | policy resolverは四つの危険条件が全てfalseのADD_FEATURE・pair_cellを、preflight必須・承認不要のHELIX_PAIR_AGENT_PLANへ結ぶ。 | process_gate | config | config/workflow-execution-policy.v1.json:141-156 |
| `RB06-067` | policy resolverは四つの危険条件が全てfalseのRECOVERY・standardを、preflight必須・承認不要のHELIX_RECOVERY_PLANへ結ぶ。 | process_gate | config | config/workflow-execution-policy.v1.json:158-173 |
| `RB06-068` | policy resolverは本番影響だけがtrueのRECOVERYまたはINCIDENT・standardに、preflightとaction-binding approvalを要求する。 | escalation_authority | config | config/workflow-execution-policy.v1.json:175-207 |
| `RB06-069` | policy resolverは四つの危険条件が全てfalseのRETROFIT・standardを、preflight必須・承認不要のHELIX_DOCTORへ結ぶ。 | process_gate | config | config/workflow-execution-policy.v1.json:209-225 |
| `RB06-091` | 運用者はfail-open hookを最終防衛とせず、yoloMode offによる承認ダイアログを維持する。 | safety_security | prose | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:56-59 |
| `RB06-100` | custody gateはuser directive原記録を保持し、PO authority・反証・appeal・必要な独立reviewを欠くreject・cancel・close等の終端化を拒否する。 | escalation_authority | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:37-37; docs/governance/infinity-loop-assertion-coverage-ledger.md:104-104; docs/governance/infinity-loop-assertion-coverage-ledger.md:179-179 |
| `RB06-120` | Authoring Admissionはpolicy内の可逆変更を人間待ちなく自動確定し、一意のenum decisionを返す。 | escalation_authority | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:56-56; docs/governance/infinity-loop-assertion-coverage-ledger.md:119-119; docs/governance/infinity-loop-assertion-coverage-ledger.md:188-188 |
| `RB06-176` | 高影響操作はaction-binding approvalが得られるまで適用を拒否する。 | escalation_authority | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:164-164 |
| `RB06-212` | prototype処理はreactionを追記専用にし、agreementには人間を要求する。 | escalation_authority | config | config/requirement-discovery-event-schema.json:169-170 |
| `RB06-231` | closure applyは承認scope digestとlimit・offsetを同じreview windowへ束縛し、承認前はread-only bundle・plan・表示に限定する。 | escalation_authority | prose／gate | docs/governance/helix-objective-evidence-audit.md:108-108 |
| `RB06-234` | 担当者はfuture itemをactivation判断までparkし、不可逆適用に明示PO承認と必要なdry-run・backup・rollback・monitoringを要求して、archiveで未完了を隠さない。 | escalation_authority | prose／gate | docs/governance/helix-objective-evidence-audit.md:54-54; docs/governance/helix-objective-evidence-audit.md:166-172 |
| `RB06-235` | handover切替担当者はshadow実装完了をcutover承認と読み替えず、approvedとscope digest記録前に旧CLI・CURRENT・adapter・consumer面を変更しない。 | escalation_authority | prose | docs/governance/session-handover-atomic-cutover-packet.md:3-5 |
| `RB06-237` | 承認検証は未適用approvedの期限超過を失効させ、期限内適用済みは適用時刻とterminal journalへ束縛して後日のCI時刻だけでは失効させない。 | escalation_authority | prose／gate | docs/governance/session-handover-atomic-cutover-packet.md:43-46 |
| `RB06-238` | cutover承認検証はdecision IDと各digest・HEADを照合し、actor・tool・target・params・dry-run・HEADのdriftで失効させる。 | escalation_authority | prose／gate | docs/governance/session-handover-atomic-cutover-packet.md:48-52; docs/governance/session-handover-atomic-cutover-packet.md:149-149 |
| `RB06-298` | 権威衝突の解消者は承認済みADRをsilent overwriteせず、変更する場合は正式supersedes ADRとaction-binding approvalを得る。 | escalation_authority | prose | docs/governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md:76-78 |
| `RB06-300` | 採用判断者は是正・validator成功を正式採用とみなさず、承認候補のconfirmed化とdocs取込・PLAN化にPO承認を要求する。 | escalation_authority | prose | docs/governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md:88-99; docs/governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md:153-155 |
| `RB06-304` | 改名担当者はcutover decisionとaction-binding approvalが具体化し、snapshot driftとdirty worktreeが解消されるまでstate dir・CLI aliasの不可逆renameを行わない。 | escalation_authority | prose／gate | docs/governance/helix-l0-l8-design-consistency-audit.md:35-39; docs/governance/helix-l0-l8-design-consistency-audit.md:142-143 |
| `RB07-039` | AIは美的判断を原則の語彙へ分解し、分解できない好みの部分は人間の判断へ明示的に委ねる。 | escalation_authority | prose | docs/skills/browser-testing-and-screen-verification.md:124-125 |
| `RB07-041` | AIはページから抽出したURLへ明示的な利用者確認なしに移動しない。 | safety_security | prose | docs/skills/browser-testing-and-screen-verification.md:130-130 |
| `RB07-064` | 担当者はPLAN-M-02のcutover承認まで.helixとhelixのrenameを凍結し、handover path整理を凍結に抵触しない用途変更に限定する。 | escalation_authority | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:138-140 |
| `RB07-136` | 暫定判断の担当者は具体的な日付と確定条件を記録し、期限超過時は解消するか理由付きで期限を延長する。 | evidence_claim | prose | docs/skills/debt-register.md:68-77 |
| `RB07-190` | 担当者は認証・認可、agent allowlist、raw-agent bypass、本番・外部API設定、audit保持方式、PII処理を変える前にPLANを停止し、境界をauditへ記録してPO確認を待つ。 | escalation_authority | prose | docs/skills/security.md:40-52 |
| `RB07-241` | 選択が拮抗しL1/L2確定・gate signoff・不可逆操作に触れる場合は選択肢と推奨をPOへ示して決定をADR化し、それ以外は証拠を集めて決定・記録・進行する。 | escalation_authority | prose | docs/skills/design-tailoring.md:104-110 |
| `RB08-130` | 移行担当者はcredential rotationをscope外とし、auth変更が必要な場合はPOへエスカレーションする。 | escalation_authority | prose | docs/skills/data-migration.md:71-72 |
| `RB08-184` | Incident担当者は該当runbookがなければproductionで即興対応せずTLへ上げ、事後に手順を追加する。 | escalation_authority | prose | docs/skills/incident-runbook.md:60-61 |
| `RB08-224` | 承認設計者は承認をmodel名全体でなくapproval_requirementsの具体actionへ束縛し、通常branch修正・PR・review・CIへ拡張しない。 | escalation_authority | prose | docs/governance/drive-route-catalog.md:63-77 |
| `RB08-225` | Recovery担当者は診断・証拠収集・packet作成を自律実行し、修復scopeとreopen pointの確定をTL/POへ渡す。 | escalation_authority | prose | docs/governance/drive-route-catalog.md:73-74 |
| `RB08-226` | Incident担当者は検知・証拠収集を止めず、production restore/hotfixだけを三者確認へ束縛する。Retrofit担当者はinventory・impact・dry-runを自律実行し、環境変更applyをTL承認へ渡す。 | escalation_authority | prose | docs/governance/drive-route-catalog.md:75-77 |
| `RB08-238` | authority是正担当者はADR precedenceの高影響判断を独断で確定せず、PO判断を待つ。 | escalation_authority | prose | docs/governance/requirements-consistency-audit-2026-07-19.md:77-81 |
| `RB08-250` | 層移行担当者はdry-run・backup・rollback・action-binding approval成立前に既存directoryを物理改名しない。 | escalation_authority | prose | docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:75-76 |
| `RB08-270` | Recovery担当者はsource横断で事象を全収集してPOに一覧・分類・優先度を確認し、承認前に修正へ着手しない。 | escalation_authority | prose | docs/governance/recovery-workflow.md:32-35 |
| `RB08-272` | Recovery担当者はscopeをPO、reopen pointの技術的妥当性をTLへ確認し、事故・timeline・認識訂正・中間結論・context再構築・再開点・再発防止の7節をPLANへ記す。 | escalation_authority | prose／lint | docs/governance/recovery-workflow.md:54-61 |
| `RB08-315` | AI判断エンジンは提案だけを行い、要求freeze・permission・高影響action・gate・DB/Git/GitHub commitを自己承認しない。 | escalation_authority | prose | docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md:52-52 |
| `RB08-317` | RLO担当者は明示L3承認まで候補をdraftとし、承認待ちpacketからIssue本文・IR・PLAN statusを変更しない。 | escalation_authority | prose | docs/governance/rlo-819-approval-packet-2026-08-20.md:3-5; docs/governance/rlo-819-approval-packet-2026-08-20.md:16-18 |
| `RB08-318` | 承認記録者はPO判断とAIによる記録を分けて対象HEADへ束縛し、RLO要求freeze承認をruntime完成・merge・release・外部副作用許可へ拡張しない。 | escalation_authority | prose | docs/governance/rlo-819-approval-packet-2026-08-20.md:7-14 |
| `RB08-329` | 候補利用者は提案・生成・限定適用・検収・公開を分け、候補文書からwrite・merge・publish権限を導出せず、現行要求・IR・review・CI等の成立条件を上書きしない。 | escalation_authority | prose | docs/governance/development-investment-stage-directives-source-cleanup-2026-09-11.md:36-37 |
| `RB09-033` | Requirement JSON admissionは、refinement contractをlifecycle_status=specified・approval=nullでadmitし、二相PO receiptが無い場合はapproved／frozenへの昇格をfail-closeする。 | escalation_authority | prose | docs/governance/issue-396-mic-requirement-json-closure.md:12-13 |
| `RB09-072` | U-NIO-003の検証は、未承認の自動修復をREDにする。 | escalation_authority | prose | docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md:27-27 |
| `RC0-021` | Override処理は、nonce・理由・操作分類・対象digestが所定の形式と長さを満たさない場合、許可を拒否する。理由には改行やcredential代入様の文字列を認めない。 | escalation_authority | hook | src/runtime/guard-override-transaction.ts:18-33; src/runtime/guard-override-transaction.ts:43-50 |
| `RC0-084` | Security egress-checkは、external_api・auth・infraのactivationにaction-binding approvalがない場合、不合格にする。 | escalation_authority | gate | src/runtime/security-credential-egress-guard.ts:4-5; src/runtime/security-credential-egress-guard.ts:73-79 |
| `RC0-145` | Workflow routingは、signal分類がdecision_requiredの場合、commandを決定せずclassification_decision_requiredと終了code 2を返す。 | process_gate | gate／config | src/workflow/workflow-execution-routing.ts:130-149; config/workflow-execution-policy.v1.json:66-69 |
| `RC0-150` | Workflow routingは、解決したbindingのapproval_policyがnone以外の場合、approval_requiredと終了code 1を返す。 | escalation_authority | gate／config | src/workflow/workflow-execution-routing.ts:179-193; config/workflow-execution-policy.v1.json:82-85; config/workflow-execution-policy.v1.json:175-207 |
| `RC00-015` | 跨repository仕様store検査は、read以外の操作またはread_onlyでない利用にaction-binding approvalがなければ不合格とする。 | escalation_authority | gate | src/runtime/cross-repo-spec-store.ts:50-58 |
| `RC00-027` | 状態機械tool policy判定は、許可list外で承認必須list内のtoolが要求された場合にrunを拒否する。 | escalation_authority | gate | src/runtime/state-machine-tool-policy.ts:63-76 |
| `RC00-032` | tool拡張registryは、未対応または承認必須のtoolをblocked_toolsへ入れ、自動実行不可の警告を出す。 | tooling_runtime | config／gate | src/runtime/tool-augmentation-registry.ts:133-150 |
| `RC01-010` | 退役artifact loaderは、authorityの形式が不正、enforce側がapprovedでない、またはoperationId・intentDigest・approvalDecisionIdが双方で一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/artifact-retirement-authority.ts:54-69 |
| `RC01-158` | 共有approval binding検査は、空値・placeholder・pending・未承認や将来条件を示す指定markerを含む値を具体的なactor/tool/target/paramsとして受理しない。 | escalation_authority | lint | src/lint/shared.ts:153-193 |
| `RC02-080` | doctorのrecovery-handoff-binding checkは、DB投影とhandoffの不一致、machine作業に対するhandoff欠落、公開済みapprovalの資料・scope・digest・候補数・command不備、pendingなのにapply可能、または投影不能で失敗する。draft未生成時はmissing・not_checked・digest/decision未設定・候補0・apply不可・draft生成commandという別契約を要求する。 | escalation_authority | doctor | src/doctor/index.ts:3184-3250; src/doctor/index.ts:3253-3414 |
| `RC02-082` | doctorのapproval-review-binding checkは、close_ready action・承認状態・scope digest・decision ID・window件数・必須outcome・状態別command・reject経路の人間確認とpostcheckに契約違反がある、または投影不能の場合に失敗する。 | escalation_authority | doctor | src/doctor/index.ts:3525-3659 |
| `RC02-083` | doctorのclosure-apply-binding checkは、承認record未指定の計画がdry-run・read-only・承認必須・apply不可を満たさない、候補数やacceptedへのstatus更新・command・postcheckが契約に反する、または投影不能の場合に失敗する。 | escalation_authority | doctor | src/doctor/index.ts:3661-3787 |
| `RC02-151` | consumer doctorのconsumer-branch-protection-script checkは、branch protection scriptがapply可能性の契約検査を満たさない場合に失敗する。 | safety_security | doctor | src/doctor/index.ts:6336-6342 |
| `RC02-159` | doctorのl12-hybrid-recognition checkは、最終dispositionがneeds_manual_reviewのcandidateが残る、またはcandidate読込不能の場合に失敗する。 | escalation_authority | doctor | src/doctor/index.ts:6592-6615 |
| `RC02-165` | doctorのclosure-authority-registry checkは、closure authority登録のschema・source drift検査が不合格、または読込不能の場合に失敗する。 | escalation_authority | doctor | src/doctor/index.ts:6711-6726 |
| `RC02-171` | doctorのaction-binding-approval-readiness checkは、作用に束縛した承認準備検査が不合格、または承認文書読込不能の場合に失敗する。 | escalation_authority | doctor | src/doctor/index.ts:6850-6867 |
| `RC02-172` | doctorのs4-decision-readiness checkは、S4判断準備検査が不合格、またはS3/S4判断文書読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:6869-6882 |
| `RC03-007` | closure authority registryの検証処理は、複数行が同じplan_idを宣言する場合、受理を拒否する。 | escalation_authority | gate | src/policy/closure-authority-registry.ts:80-96 |
| `RC03-013` | closure authority drift検査は、digestが一致したsourceのfrontmatterから得たplan_idが登録IDと一致しない場合、不適格とする。frontmatter解析失敗やID欠落も一致として扱わない。 | escalation_authority | gate | src/policy/closure-authority-registry.ts:181-195; src/policy/closure-authority-registry.ts:242-248 |
| `RC03-016` | closure authority分類処理は、候補PLANのauthorityがregistryに存在しない場合、human_onlyとし、自動処理対象にしない。 | escalation_authority | gate | src/policy/closure-authority-registry.ts:234-241 |
| `RC03-017` | closure authority分類処理は、version_activation、state_cutover、external_publish、charter_p8のいずれかを含むauthorityをhuman_onlyとする。 | escalation_authority | gate | src/policy/closure-authority-registry.ts:209-214; src/policy/closure-authority-registry.ts:249-255 |
| `RC03-018` | closure authority分類処理は、migration_reasonがnullでない場合、authority_backfill_requiredとし、eligibleにしない。 | process_gate | gate | src/policy/closure-authority-registry.ts:256-262 |
| `RC03-027` | closure authority backfill処理は、design authorityがある場合、そのsource_pathがbindingのparent_designと一致しなければ候補をinvalidとする。 | escalation_authority | gate | src/policy/closure-authority-backfill.ts:375-383 |
| `RC03-036` | closure authority backfill処理は、designとPLANの両方にauthorityがあり、並べ替えて正規化したcapabilitiesまたはgatesが一致しない場合、候補をinvalidとする。 | escalation_authority | gate | src/policy/closure-authority-backfill.ts:310-314; src/policy/closure-authority-backfill.ts:424-425 |
| `RC03-037` | closure authority backfill処理は、designにもPLANにもtyped authorityがない場合、needs_gate_authorityとする。 | escalation_authority | gate | src/policy/closure-authority-backfill.ts:426-432 |
| `RC03-039` | closure authority backfill処理は、capabilitiesが空または定義済み集合にないcapabilityを含む場合、候補をinvalidとする。 | escalation_authority | gate | src/policy/closure-authority-backfill.ts:276-282; src/policy/closure-authority-backfill.ts:435-439 |
| `RC03-043` | closure authority backfill処理は、採用authorityのgatesが空の場合、needs_gate_authorityとする。 | process_gate | gate | src/policy/closure-authority-backfill.ts:454-455 |
| `RC03-044` | closure authority backfill処理は、version_activation、state_cutover、external_publish、charter_p8のいずれかを含む場合、human_onlyとする。 | escalation_authority | gate | src/policy/closure-authority-backfill.ts:283-288; src/policy/closure-authority-backfill.ts:456-457 |
| `RC03-135` | standaloneの判断ゲートは、humanApprovedが真でない場合、失敗する。 | escalation_authority | gate | src/gate/review-tier.ts:157-174 |
| `RC04-015` | 復旧分類器は、doctorRedが真ならエスカレーションに分類する。 | escalation_authority | gate | src/orchestration/loop-recovery.ts:18-24 |
| `RC04-016` | 復旧分類器は、workerとverifierの両方が予算超過ならエスカレーションに分類する。 | escalation_authority | gate | src/orchestration/loop-recovery.ts:26-31 |
| `RC04-082` | stale claim復旧authorityは、有効期限内でpacketとmutex観測が承認recordに完全一致する場合だけ認可する。 | escalation_authority | gate | src/orchestration/durable-loop-epoch-node.ts:69-88 |
| `RC04-088` | stale claim復旧器は、authority検証の例外、承認者・監査IDの空値、または認可不成立があれば復旧を拒否する。 | escalation_authority | gate | src/orchestration/durable-loop-epoch-node.ts:440-447 |
| `RC04-124` | 自動化readiness判定器は、human-required・block・human_signoff_requiredのguardrail記録があればhuman-requiredにする。 | escalation_authority | gate | src/workflow/readiness.ts:30-36; src/workflow/readiness.ts:59-63 |
| `RC04-126` | AI判断提案検証器は、propose_next_state以外の権限行使を要求する提案を拒否する。 | escalation_authority | gate | src/workflow/ai-decision-proposal.ts:8-8; src/workflow/ai-decision-proposal.ts:82-90 |
| `RC04-139` | workflow実行route評価器は、bindingのapproval_policyがnone以外ならapproval_requiredとしてblockedを返す。 | escalation_authority | gate／config | src/workflow/workflow-execution-routing.ts:179-193; config/workflow-execution-policy.v1.json:82-85 |
| `RC04-196` | route評価器は、Recoveryのscope_decisionまたはapplyで承認policyと必要承認が無ければ失敗する。 | escalation_authority | gate | src/workflow/routing-contracts.ts:387-448; src/workflow/routing-contracts.ts:578-597 |
| `RC04-197` | route評価器は、Incidentのapplyで承認policyと必要承認が無ければ失敗する。 | escalation_authority | gate | src/workflow/routing-contracts.ts:397-448; src/workflow/routing-contracts.ts:578-597 |
| `RC04-198` | route評価器は、config_driftのRetrofit applyで承認policyと必要承認が無ければ失敗する。 | escalation_authority | gate | src/workflow/routing-contracts.ts:362-368; src/workflow/routing-contracts.ts:397-448; src/workflow/routing-contracts.ts:578-597 |
| `RC04-199` | route評価器は、requiresApproval指定routeのapplyで承認policyと必要承認が無ければ失敗する。 | escalation_authority | gate | src/workflow/routing-contracts.ts:397-448; src/workflow/routing-contracts.ts:578-597 |
| `RC04-200` | route評価器は、認証・認可・決済・秘密・PII・license・production・破壊操作・migration・schema・外部API・infrastructure等の登録語をsignalに検出し、scope_decisionまたはapplyの場合、必要承認なしでは失敗する。 | escalation_authority | gate | src/workflow/routing-contracts.ts:120-142; src/workflow/routing-contracts.ts:387-448; src/workflow/routing-contracts.ts:578-597 |
| `RC04-229` | workflow guide生成器は、signalが明示decision待ちなら失敗する。 | escalation_authority | gate | src/workflow/workflow-guide.ts:182-189; src/workflow/workflow-guide.ts:276-279 |
| `RD02-132` | 作業preflightは、未承認の高影響操作がある場合にescalateを返す。 | escalation_authority | gate | src/runtime/legacy-adoption.ts:264-266 |
| `RD03-028` | egress dry-run評価は、external_api・auth・infraのactivationにaction-binding approvalがない場合、不合格にする。 | escalation_authority | gate | src/runtime/security-credential-egress-guard.ts:73-84 |
| `RD04-170` | action-binding readiness lintは、右腕工程文書にAction-binding approval decision recordというmarkerが無い場合に違反とする。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:176-177; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-171` | action-binding readiness lintは、右腕工程文書にaction_binding_approval_record markerが無い場合に違反とする。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:178-178; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-172` | action-binding readiness lintは、右腕工程文書にallowed_outcome markerが無い場合に違反とする。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:179-179; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-173` | action-binding readiness lintは、右腕工程文書にapproval_policy_or_named_approver markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:180-180; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-174` | action-binding readiness lintは、右腕工程文書にapproval_scope markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:181-181; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-175` | action-binding readiness lintは、右腕工程文書にapproved_actor markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:182-182; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-176` | action-binding readiness lintは、右腕工程文書にapproved_tool markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:183-183; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-177` | action-binding readiness lintは、右腕工程文書にapproved_target markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:184-184; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-178` | action-binding readiness lintは、右腕工程文書にapproved_params markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:185-185; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-179` | action-binding readiness lintは、右腕工程文書にreview_approval_evidence markerが無い場合に違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:186-186; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-181` | action-binding readiness lintは、右腕工程文書にexpires_at_or_trigger markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:188-188; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-182` | action-binding readiness lintは、右腕工程文書にaudit_record markerが無い場合に違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:189-189; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-183` | action-binding readiness lintは、右腕工程文書にaction-binding-approval-packet.v1 markerが無い場合に違反とする。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:190-190; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-184` | action-binding readiness lintは、右腕工程文書にplanOnly=true markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:191-191; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-185` | action-binding readiness lintは、右腕工程文書にmustNotApprove=true markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:192-192; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-186` | action-binding readiness lintは、右腕工程文書にapprovalCommandAvailable=false markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:193-193; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-187` | action-binding readiness lintは、右腕工程文書にapprovalAllowed=false markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:194-194; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-188` | action-binding readiness lintは、右腕工程文書にapprovalBindingChecks markerが無い場合に違反とする。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:195-195; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-189` | action-binding readiness lintは、右腕工程文書にapprovalVerificationCommandMatrix markerが無い場合に違反とする。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:196-196; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-192` | action-binding readiness lintは、outstanding実装に承認recordの11項目を列挙する所定markerが無い場合に違反とする。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:201-202; src/lint/action-binding-approval-readiness.ts:273-276 |
| `RD04-193` | action-binding readiness lintは、outstanding実装にactivation前のactor・tool・target・params束縛を示す所定markerが無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:203-203; src/lint/action-binding-approval-readiness.ts:273-276 |
| `RD04-195` | action-binding readiness lintは、非archivedの高影響PLANにallowed_outcomeの構造化項目が無い場合、または許可outcome集合の検査に失敗した場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:250-257; src/lint/action-binding-approval-readiness.ts:281-297 |
| `RD04-196` | 承認packetのallowed_outcome checkは、単一の許可outcomeが選択されていない場合にpendingとし、approve_action_binding以外なら承認欠落のblocked reasonを出す。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:1153-1155; src/lint/action-binding-approval-readiness.ts:1243-1261; src/lint/action-binding-approval-readiness.ts:1461-1463 |
| `RD04-197` | action-binding readiness lintは、高影響PLANのapproval_policy_or_named_approver項目が欠ける場合に違反とし、packet checkでは空値または将来の束縛をpendingにする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:155-167; src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:1233-1240; src/lint/action-binding-approval-readiness.ts:1435-1444 |
| `RD04-198` | action-binding readiness lintは、高影響PLANのapproval_scopeが欠落、広範囲・wildcard、除外だけの記述、または範囲限定語と具体的境界語を欠く場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:904-909; src/lint/action-binding-approval-readiness.ts:1264-1283; src/lint/action-binding-approval-readiness.ts:1471-1478; src/lint/action-binding-approval-readiness.ts:1526-1576 |
| `RD04-199` | action-binding readiness lintは、高影響PLANのapproved_actor欠落・広範囲許可・将来の記名条件を伴わない未承認記述を違反とし、未具体化をpacketのpendingまたはblockerとする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:910-940; src/lint/action-binding-approval-readiness.ts:1156-1172; src/lint/action-binding-approval-readiness.ts:1286-1310 |
| `RD04-200` | action-binding readiness lintは、高影響PLANのapproved_tool欠落・広範囲許可・将来の記名条件を伴わない未承認記述を違反とし、未具体化をpacketのpendingまたはblockerとする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:910-940; src/lint/action-binding-approval-readiness.ts:1156-1172; src/lint/action-binding-approval-readiness.ts:1286-1310 |
| `RD04-201` | action-binding readiness lintは、高影響PLANのapproved_target欠落・広範囲許可・将来の記名条件を伴わない未承認記述を違反とし、未具体化をpacketのpendingまたはblockerとする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:910-940; src/lint/action-binding-approval-readiness.ts:1156-1172; src/lint/action-binding-approval-readiness.ts:1286-1310 |
| `RD04-202` | action-binding readiness lintは、高影響PLANのapproved_params欠落・広範囲許可・将来の記名条件を伴わない未承認記述を違反とし、未具体化をpacketのpendingまたはblockerとする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:910-940; src/lint/action-binding-approval-readiness.ts:1156-1172; src/lint/action-binding-approval-readiness.ts:1286-1310 |
| `RD04-203` | action-binding readiness lintは、review_approval_evidence欠落、承認選択時の未完了証拠、または未承認時にも将来義務・具体的locatorのどちらでもない記述を違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:941-953; src/lint/action-binding-approval-readiness.ts:1313-1323; src/lint/action-binding-approval-readiness.ts:1485-1523 |
| `RD04-210` | action-binding readiness lintは、expires_at_or_triggerが欠落、または日付・失効・変更時再承認等の所定記述が無い場合に違反とする。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:954-959; src/lint/action-binding-approval-readiness.ts:1408-1418; src/lint/action-binding-approval-readiness.ts:1579-1591 |
| `RD04-211` | action-binding readiness lintは、audit_record欠落、承認状態に適合するlocator・pending条件の不成立、または承認者・action/command・結果・incident/backlog/rollback/monitoring経路の記述欠落を違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:995-1011; src/lint/action-binding-approval-readiness.ts:1421-1432 |
| `RD04-215` | action-binding readiness lintは、human_approval_pendingに必要なrecord template契約の検証違反をreadiness失敗へ含める。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:312-326 |
| `RD04-218` | 承認packet生成器は、recordの内容にかかわらずplanOnly・mustNotApproveをtrue、approvalCommandAvailable・approvalAllowedをfalseに固定する。 | escalation_authority | config | src/lint/action-binding-approval-readiness.ts:393-405 |
| `RD04-219` | 承認packet生成器は、高影響承認待ちPLANにはhuman-gatedのblocked reasonを出し、該当しないPLANには対象外のblocked reasonとinvalid statusを出す。 | escalation_authority | lint | src/lint/action-binding-approval-readiness.ts:399-401; src/lint/action-binding-approval-readiness.ts:1147-1152 |
| `RD05-037` | completion-decision-packetは、authorityBoundaryがstatusと人間判断blockerから導出した値に一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:239-268 |
| `RD05-038` | completion-decision-packetは、humanDecisionRequiredが人間判断blockerの有無と一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:133-138; src/lint/completion-decision-packet.ts:270-275 |
| `RD05-039` | completion-decision-packetは、humanDecisionBlockersが全blockerから抽出・sortした人間判断blocker列と一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:239-245; src/lint/completion-decision-packet.ts:276-284 |
| `RD05-042` | completion-decision-packetは、nextAuthorityが導出されたauthorityBoundaryに対応するnone・human・automationと一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:258-263; src/lint/completion-decision-packet.ts:303-308 |
| `RD05-053` | completion-decision-packetは、humanReviewBundleが欠落している場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:374-379 |
| `RD05-059` | completion-decision-packetは、humanReviewBundleのnextAuthorityが元packetと一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:411-416 |
| `RD05-062` | completion-decision-packetは、humanReviewBundle.itemsの件数がdecisions件数と一致しない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:428-432 |
| `RD05-068` | completion-decision-packetは、人間向けbundle項目のorder・planId・decisionKind・blockerReason・scoped主コマンド・実行可能scoped主コマンドが対応decisionから導出した値と違う場合、各fieldの不一致を失敗として返す。 | review_merge | lint | src/lint/completion-decision-packet.ts:506-529 |
| `RD05-069` | completion-decision-packetは、人間向けbundle項目のblocker・日本語action・記録名・owner/timing/freshness/safety確認field・補助コマンド・review routeの各配列が、対応decisionから導出した配列と一致しない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:484-505; src/lint/completion-decision-packet.ts:530-562 |
| `RD05-070` | completion-decision-packetは、decisionKindがblockerReasonに対応する判断種別と一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:564-570; src/lint/completion-decision-packet.ts:1196-1208 |
| `RD05-079` | completion-decision-packetは、packetCommandsが主blockerと付随blockerから導出するコマンド集合に一致しない場合、失敗させる。不可逆移行のblockerにはrename approval-draftも必要とする。 | process_gate | lint | src/lint/completion-decision-packet.ts:633-644; src/lint/completion-decision-packet.ts:1226-1241 |
| `RD05-081` | completion-decision-packetは、scopedDecisionPacketCommandが所定のPLAN scope付与結果と一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:653-662; src/lint/completion-decision-packet.ts:1244-1254 |
| `RD05-083` | completion-decision-packetは、scopedPacketCommandsが必要コマンドのPLAN scope付与結果の集合と一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:674-683 |
| `RD05-085` | completion-decision-packetは、supportingPacketSummariesのコマンド集合が必要コマンド集合と一致しない、または必要コマンドのsummaryがない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:699-719 |
| `RD05-088` | completion-decision-packetは、補助summaryのscopedCommandが当該PLANへのscope付与結果に一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:737-746 |
| `RD05-090` | completion-decision-packetは、補助summaryのrequiredReviewFieldsにコマンド別の必須確認fieldが一つでも欠ける場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:756-763; src/lint/completion-decision-packet.ts:1257-1642 |
| `RD05-092` | completion-decision-packetは、補助summaryのreviewRouteが空の場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:772-777 |
| `RD05-094` | completion-decision-packetは、decisionのallowedOutcomesに所定集合が定義されている場合、その集合と一致しなければ失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:786-796; src/lint/completion-decision-packet.ts:1645-1660 |
| `RD05-099` | completion-decision-packetは、allowedOutcomesByRecordが非配列または空の場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:827-835 |
| `RD05-117` | completion-decision-packetは、required recordに対応するoutcome記録がない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:989-997 |
| `RD05-118` | completion-decision-packetは、recordのallowedOutcomesが非配列または空の場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:998-1004 |
| `RD05-120` | completion-decision-packetは、recordNameに所定の許可outcome集合がある場合、allowedOutcomesがその集合と一致しなければ失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:1013-1023; src/lint/completion-decision-packet.ts:1717-1740 |
| `RD05-133` | completion-review-bundleは、planOnlyがtrueでない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:1958-1970 |
| `RD05-134` | completion-review-bundleは、mustNotDecideがtrueでない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:1958-1970 |
| `RD05-135` | completion-review-bundleは、mustNotApplyがtrueでない場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:1958-1970 |
| `RD05-152` | cutover-readinessは、outstanding実装にcutover承認前のsnapshot・影響範囲・dry-run・rollback・backup・監査・実行期間・事後監視を案内する所定markerが欠ける場合、失敗させる。 | process_gate | lint | src/lint/cutover-readiness.ts:102-109; src/lint/cutover-readiness.ts:199-203 |
| `RD05-160` | cutover-readinessは、semantic frontier記録が入力された場合、未完了の不可逆cutover PLANとapproval_gated_cutover／name_cutoverの束縛検査が返す違反を失敗に含める。 | process_gate | lint | src/lint/cutover-readiness.ts:171-185; src/lint/cutover-readiness.ts:283-298 |
| `RD05-161` | cutover-readinessは、archived以外の不可逆cutover PLANでcutover_decision_recordの必須構造化fieldが欠ける場合、失敗させる。 | escalation_authority | lint | src/lint/cutover-readiness.ts:79-95; src/lint/cutover-readiness.ts:176-185; src/lint/cutover-readiness.ts:299-308 |
| `RD05-162` | cutover-readinessは、cutover記録のallowed outcome集合または選択outcomeが所定契約の検査に違反した場合、失敗させる。 | escalation_authority | lint | src/lint/cutover-readiness.ts:96-100; src/lint/cutover-readiness.ts:309-321 |
| `RD05-166` | cutover-readinessは、approve_cutoverが選択されていて現在snapshot IDが取得できない場合、失敗させる。 | escalation_authority | lint | src/lint/cutover-readiness.ts:377-384 |
| `RD05-168` | cutover-readinessは、実行期間方針が未承認・未定を示す、またはfrozen HEAD・実行window・単一実行/並行制御・drift時再承認の各語群を満たさない場合、失敗させる。 | escalation_authority | lint | src/lint/cutover-readiness.ts:392-398; src/lint/cutover-readiness.ts:467-491 |
| `RD07-094` | handover切替承認検証は、指定された承認ファイルが存在しなければ拒否する。 | escalation_authority | lint | src/lint/handover-cutover-approval.ts:169-174 |
| `RD07-095` | handover切替承認検証は、承認のschema・状態・主体・操作・対象・HEAD・各digest・decisionIdが指定値や対応証拠に一致しなければ拒否する。適用済み承認は固定済み証拠、未適用承認は再計算した現行証拠に束縛する。 | escalation_authority | lint | src/lint/handover-cutover-approval.ts:175-205; src/lint/handover-cutover-approval.ts:216-218 |
| `RD07-096` | handover切替承認検証は、承認日時・期限が無効、期限が承認日時以前、または未適用承認の期限が現在時刻より前なら拒否する。 | escalation_authority | lint | src/lint/handover-cutover-approval.ts:176-179; src/lint/handover-cutover-approval.ts:206-217 |
| `RD07-097` | handover切替承認検証は、適用済み承認の適用日時が無効または承認期間外、terminal journal digestが固定値と不一致、あるいは一致するjournal行が存在しない場合に拒否する。 | evidence_claim | lint | src/lint/handover-cutover-approval.ts:184-189; src/lint/handover-cutover-approval.ts:209-217 |
| `RD07-110` | handover復活検査は、enforce authorityのschema・operationId・各digest・approvalDecisionIdが不正、またはapprovalStatusがapprovedでなければ拒否する。 | escalation_authority | lint | src/lint/handover-resurrection.ts:446-468 |
| `RD07-111` | handover復活検査は、enforce authorityのコード内固定値が提供されていなければ拒否する。 | escalation_authority | lint | src/lint/handover-resurrection.ts:469-471 |
| `RD07-112` | handover復活検査は、enforce authorityが提供されたコード内固定値と完全一致しなければ拒否する。 | escalation_authority | lint | src/lint/handover-resurrection.ts:472-475 |
| `RD07-140` | identifier-renameの承認評価は、指定PLANが存在しないか通常ファイルでなければ承認不成立とする。 | escalation_authority | lint | src/lint/identifier-rename.ts:823-832 |
| `RD07-141` | identifier-renameの承認評価は、cutover_decision_record.allowed_outcomeがapprove_cutoverと完全一致しなければ承認不成立とする。 | escalation_authority | lint | src/lint/identifier-rename.ts:871-880; src/lint/identifier-rename.ts:896-901 |
| `RD07-142` | identifier-renameの承認評価は、切替判断記録の各必須項目が空・プレースホルダー・保留・将来承認等の非具体値なら承認不成立とする。 | escalation_authority | lint | src/lint/identifier-rename.ts:853-885; src/lint/identifier-rename.ts:902-920 |
| `RD07-143` | identifier-renameの承認評価は、切替判断記録のcutover_snapshot_idに有効なSHA-256 snapshot IDが含まれなければ承認不成立とする。 | escalation_authority | lint | src/lint/identifier-rename.ts:887-894; src/lint/identifier-rename.ts:921-921 |
| `RD07-144` | identifier-renameの承認評価は、action_binding_approval_record.allowed_outcomeがapprove_action_bindingと完全一致しなければ承認不成立とする。 | escalation_authority | lint | src/lint/identifier-rename.ts:923-928 |
| `RD07-145` | identifier-renameの承認評価は、行為承認記録の各必須項目が空・プレースホルダー・保留・将来承認等の非具体値なら承認不成立とする。 | escalation_authority | lint | src/lint/identifier-rename.ts:853-885; src/lint/identifier-rename.ts:929-941 |
| `RD07-146` | identifier-renameの承認評価は、行為承認記録のreviewed_snapshot_bindingに有効なSHA-256 snapshot IDが含まれなければ承認不成立とする。 | escalation_authority | lint | src/lint/identifier-rename.ts:887-894; src/lint/identifier-rename.ts:942-942 |
| `RD07-147` | identifier-renameは、承認資料が具体化され準備完了になっても、このaudit・plan・approval draftから切替実行権限を付与しない。出力のcutoverApprovedまたはapplyAuthorizedをfalseに固定する。 | escalation_authority | lint | src/lint/identifier-rename.ts:1100-1104; src/lint/identifier-rename.ts:1864-1868; src/lint/identifier-rename.ts:2519-2532 |
| `RD09-005` | outstanding集計は、非終端PLANのテキストがaction-binding承認を必要とする判定に該当する場合、human_approval_pendingを返す。 | escalation_authority | lint | src/lint/outstanding.ts:827-829 |
| `RD09-006` | outstanding集計は、非終端PLANのirreversible_impactがcutoverまたはmigration、宣言済みだが解釈不能、または所定の不可逆移行文脈に該当する場合、不可逆移行待ちを返す。irreversible_impact=noneはこの分類から除外する。 | escalation_authority | lint | src/lint/outstanding.ts:830-853 |
| `RD09-012` | 完了判定は、人間承認待ち、不可逆移行待ち、PO判断待ち、将来版保留のいずれかがある場合、人間判断必須として次のauthorityをhumanにする。 | escalation_authority | lint | src/lint/outstanding.ts:1272-1277; src/lint/outstanding.ts:1289-1312 |
| `RD09-045` | plan-entry-routingは、有効なworkflow_identityを持つ検査対象のtyped signalがdecision_requiredの場合、baseline免除対象以外を失敗させる。 | escalation_authority | lint | src/lint/plan-entry-routing.ts:127-131; src/lint/plan-entry-routing.ts:353-362; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-087` | PR scope preflightは、Allowed path familiesが一意で空でなく重複もない場合、実変更のうちAllowed外かつExpected未宣言のpathをpermissionRequiredPathsとして表示する。 | escalation_authority | lint | src/lint/pr-scope-preflight.ts:82-98; src/lint/pr-scope-preflight.ts:305-306 |
| `RD10-025` | lintは適用日以降に作成・意味更新されたterminal L3 PLANでtyped PO承認が欠落する場合に失敗させる。 | escalation_authority | lint | src/lint/review-evidence.ts:748-760; src/lint/review-evidence.ts:925-936 |
| `RD10-026` | lintはPO承認必須のL3 PLANで承認がschema不適合、解析失敗またはplan_id不一致なら失敗させる。 | escalation_authority | lint | src/lint/review-evidence.ts:478-492; src/lint/review-evidence.ts:925-930 |
| `RD10-073` | S4 lintは判断待ちPoCまたはS4判断済みPoCのs4_decision_recordに必須構造化項目が欠ける場合に失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:176-191; src/lint/s4-decision-readiness.ts:272-281; src/lint/s4-decision-readiness.ts:822-869 |
| `RD10-083` | S4 lintはdecision_outcome未選択時のroute_impactがconfirmed、rejected、pivotの全選択肢に言及していなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:382-392 |
| `RD10-084` | S4 lintはacceptance_gapに具体的gapまたは明示的なgapなしを表す規定語がなければ失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:393-398; src/lint/s4-decision-readiness.ts:694-717 |
| `RD10-085` | S4 lintはunresolved_riskに残存riskまたは明示的なriskなしを表す規定語がなければ失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:399-404; src/lint/s4-decision-readiness.ts:719-743 |
| `RD10-106` | S4 lintは判断待ちpacketのrecord templateがPO判断待ちおよび該当する人間承認待ちblockerの要求契約に違反する場合に失敗させる。 | escalation_authority | lint | src/lint/s4-decision-readiness.ts:839-857 |
| `RD10-107` | S4 packet生成器はpacketを常にplan-onlyとし、自動判断の許可と判断commandの利用可能性をfalseに固定する。 | escalation_authority | lint | src/lint/s4-decision-readiness.ts:927-938 |
| `RD10-108` | S4 packetは高影響操作にaction-binding approvalが必要と判定したPLANに、実行前承認待ちのblocked reasonを追加する。 | escalation_authority | lint | src/lint/s4-decision-readiness.ts:920-925 |
| `RD11-039` | profile safety検査は、github-mcp-readonlyにwrite・delete・admin・merge・createに一致するtoolがあり、requiresHumanApprovalが真でない場合にerrorにする。 | escalation_authority | lint | src/lint/verification-profile-safety.ts:193-205 |
| `RD11-040` | profile safety検査は、github-mcp-readonlyのtool集合に*またはallがあり、requiresHumanApprovalが真でない場合にerrorにする。 | escalation_authority | lint | src/lint/verification-profile-safety.ts:206-218 |
| `RD11-043` | 外部profile有効化計画は、既定無効profileが推薦されallowExternalが真でない場合、refuse-runを追加してerrorにする。 | escalation_authority | lint | src/lint/verification-profile-safety.ts:264-304 |
| `RD11-049` | profile probeは、既定無効profileのactivation checkを失敗にする。ただしこのcheckはreadyの算出から除外する。 | escalation_authority | lint | src/lint/verification-profile.ts:203-211; src/lint/verification-profile.ts:246-247 |
| `RD11-054` | profile実行処理は、既定無効profileにallowExternalが指定されていない場合、dry-run指定時もrefusedを返す。 | escalation_authority | lint | src/lint/verification-profile.ts:250-266; src/lint/verification-profile.ts:288-290 |
| `RD11-057` | MCP inspectionは、allowExternalが真でない場合にrefusedを返す。 | escalation_authority | lint | src/lint/verification-profile.ts:315-325 |
| `RD11-069` | profile gateは、既定無効profileの有効化計画にhuman-approvalまたはrefuse-runの経路がない場合に違反にする。 | escalation_authority | lint／gate | src/lint/verification-profile.ts:671-681 |
| `RD11-070` | activation review bundle生成器は、生成物をplanOnly・mustNotApplyとし、activationAllowedとapplyCommandAvailableを常にfalseに固定する。 | escalation_authority | config | src/lint/version-up-bundle.ts:55-62; src/lint/version-up-bundle.ts:81-88 |
| `RD11-094` | version-up lintは、外部境界語を含むPLANに承認・escalation・scope・dry-run・rollback・exit 1の指定markerがない場合に違反にする。 | escalation_authority | lint | src/lint/version-up-readiness.ts:463-489; src/lint/version-up-readiness.ts:1188-1199 |
| `RD11-098` | version-up lintは、parkedと必要に応じたhuman_approval_pendingのblockerから導いた必須recordについて、packetのtemplate契約違反を失敗に反映する。 | process_gate | lint | src/lint/version-up-readiness.ts:1228-1243 |
| `RD11-120` | activation資料検査は、action_binding_approval_recordのoutcomeがapprove_action_bindingでない場合にblockする。 | escalation_authority | lint | src/lint/version-up-readiness.ts:2534-2539; src/lint/version-up-readiness.ts:2727-2729 |
| `RD11-121` | activation資料検査は、approved_actorが具体的な承認値でない場合にblockする。 | escalation_authority | lint | src/lint/version-up-readiness.ts:2540-2548; src/lint/version-up-readiness.ts:2730-2735 |
| `RD11-122` | activation資料検査は、approved_toolが具体的な承認値でない場合にblockする。 | escalation_authority | lint | src/lint/version-up-readiness.ts:2540-2548; src/lint/version-up-readiness.ts:2730-2735 |
| `RD11-123` | activation資料検査は、approved_targetが具体的な承認値でない場合にblockする。 | escalation_authority | lint | src/lint/version-up-readiness.ts:2540-2548; src/lint/version-up-readiness.ts:2730-2735 |
| `RD11-124` | activation資料検査は、approved_paramsが具体的な承認値でない場合にblockする。 | escalation_authority | lint | src/lint/version-up-readiness.ts:2540-2548; src/lint/version-up-readiness.ts:2730-2735 |
| `RD11-125` | version-up lintは、activate_future_version選択時、review_approval_evidenceが未完了または具体的locatorを持たない場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1244-1246; src/lint/version-up-readiness.ts:2549-2554 |
| `RD11-128` | version-up lintは、activate_future_version選択時、expires_at_or_triggerが具体的な承認値でない場合に違反にする。 | escalation_authority | lint | src/lint/version-up-readiness.ts:2569-2574 |
| `RD11-136` | parked PLAN意味検査は、decision_packet_routeにcompletion・status --json・decision packetのいずれもない場合に違反にする。 | memory_context | lint | src/lint/version-up-readiness.ts:2646-2651 |
| `RD11-146` | activation readiness検査は、外部境界がある場合、approval_evidenceの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | escalation_authority | lint | src/lint/version-up-readiness.ts:544-544; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-153` | activation packet生成器は、PLANがparkedであっても非parkedであっても適用を許可せず、activationAllowed=false・mustNotApply=trueを返す。 | escalation_authority | config | src/lint/version-up-readiness.ts:1598-1604; src/lint/version-up-readiness.ts:2712-2716 |
| `RD11-154` | activation packetは、PLANに外部境界語がある場合、明示承認を必要とするblock理由を常に追加する。 | escalation_authority | lint | src/lint/version-up-readiness.ts:2736-2739 |
| `RD11-201` | decision packetのprovenance生成器は、現在時刻が生成時刻に有効分数を加えた期限を超える場合にstale=trueにする。 | evidence_claim | lint | src/lint/workflow-decision-packets.ts:64-80; src/lint/workflow-decision-packets.ts:175-184 |
| `RD11-202` | 高影響承認分類器は、構造化action_binding_approval_recordの見出しを検出した場合に承認必須と分類する。 | escalation_authority | lint | src/lint/workflow-decision-packets.ts:99-99; src/lint/workflow-decision-packets.ts:109-129 |
| `RD11-203` | 高影響承認分類器は、説明専用・非許可の文脈を除く同一chunkに承認境界・実行前承認義務・高影響対象が揃う場合に承認必須と分類する。review_evidence配下の指定scope行は判断対象から除外する。 | escalation_authority | lint | src/lint/workflow-decision-packets.ts:100-107; src/lint/workflow-decision-packets.ts:132-168 |
| `RE01-070` | setupは運用形態を検出して推奨を提示するが、人数だけで自動変更してはならない。branch protectionの適用は明示フラグと承認・管理権限がある場合だけ行う。 | escalation_authority | config／gate | docs/governance/helix-harness-requirements_v1.2.md:1149-1160 |
| `RE01-089` | 担当者は方針変更をPOへ上げ、未申告のsource実装を見つけた場合はRecoveryとして扱う。active goalからその作業を除外してはならない。 | escalation_authority | prose | docs/governance/helix-harness-requirements_v1.2.md:1292-1305 |
| `RE01-095` | MCP利用者はGitHubをread-onlyから開始し、write操作には人間の確認を得る。 | escalation_authority | prose／config | docs/governance/helix-harness-requirements_v1.2.md:1378-1382 |
| `RE01-142` | Recoveryの実行者はproduction incidentや環境変更について人間の承認を得て、upgrade前のpreflightを通してから実行する。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.2.md:2007-2031; docs/governance/helix-harness-requirements_v1.2.md:2058-2068 |
| `RE01-146` | 実行者は全runtime modeで認証・認可・決済・PII・ライセンス・本番・破壊的操作・外部API前提の変更を人間へ上げ、resolvedな承認なしに実行しない。 | escalation_authority | gate／prose | docs/governance/helix-harness-requirements_v1.2.md:2035-2068; docs/governance/helix-harness-requirements_v1.2.md:2124-2186 |
| `RE01-147` | 承認記録者は承認者のidentity・時刻・対象を残し、作業種別ごとに指定されたTL・PO等の承認者を用いる。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.2.md:2058-2068 |
| `RE01-153` | エスカレーション判定者はN/Mの規定閾値のうち満たした最大levelを選び、段階を一つずつ増やすだけの判定をしない。最上位ではPOへ上げて停止する。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.2.md:2196-2226 |
| `RE01-168` | 承認管理者はcandidateへの承認をcanonical promotionやruntime使用許可と同一視せず、旧revisionの承認を新しいdraft条件へ流用しない。 | escalation_authority | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:31-36 |
| `RE01-174` | production作業者はL1–L3の人間承認とdelivery styleの明示freezeを得る。styleがunknown・混在・不適格の場合は軽量経路へ流さずfail-closeする。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:83-88 |
| `RE01-186` | policy resolverは重複policyの優先順位を明示し、duplicate・複数一致・未登録・不足条件を拒否する。高影響操作にapproval noneを割り当てない。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:160-162 |
| `RE01-193` | 高影響操作の実行者は現在のHEADとpolicy digestに一致するaction-binding receiptを要求し、不一致ならapproval-requiredとして止める。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:213-215 |
| `RE01-201` | AIはvision・brand・priority・prototype・L3・L11・L12の人間判断を自己承認してはならない。 | escalation_authority | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:275-275 |
| `RE01-219` | 実行者はremote sync・tag・publish・promotion・identity/state cutoverの前に、actor・tool・対象・引数・snapshot・期限・rollback・monitoringへ束縛した承認を得る。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:329-331 |
| `RE01-220` | authoring処理はproposal・candidate・canonical admissionを分離し、作成能力だけでcanonicalへの変更権限を与えない。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:349-349 |
| `RE01-270` | security設定の適用者は人間の承認を得てから設定を変更する。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:542-547 |
| `RG08-008` | 監査frameworkの整合を整理する担当者は、L1確定前に文書構造の移行時期、F-NNNとBR-NNの関係、監査reportとruntime stateの名前空間、legacy source名称の正規化についてPOへ確認する。 | escalation_authority | prose | docs/governance/audit-framework.md:6-10 |
| `RG10-004` | POはapproval_policyがpo_decisionの場合、S4やdelivery routeなどの意味判断を行う。 | escalation_authority | prose | docs/governance/drive-route-catalog.md:69-69 |

## 副として対応づいた規則（170件）

`RA-033`、`RA-061`、`RA-105`、`RA-106`、`RA-107`、`RA-108`、`RA-111`、`RA-120`、`RA-182`、`RA-245`、`RA-292`、`RA-367`、`RB0-067`、`RB0-132`、`RB0-152`、`RB0-178`、`RB04-007`、`RB04-031`、`RB04-043`、`RB04-044`、`RB04-053`、`RB04-113`、`RB04-116`、`RB04-118`、`RB04-157`、`RB04-183`、`RB04-186`、`RB04-200`、`RB04-218`、`RB04-228`、`RB04-229`、`RB04-248`、`RB05-028`、`RB05-036`、`RB05-037`、`RB05-157`、`RB05-181`、`RB05-287`、`RB05-305`、`RB05-346`、`RB05-348`、`RB05-350`、`RB05-351`、`RB05-365`、`RB05-366`、`RB06-086`、`RB06-130`、`RB06-203`、`RB06-215`、`RB06-236`、`RB06-258`、`RB06-271`、`RB06-278`、`RB06-310`、`RB06-316`、`RB07-022`、`RB07-037`、`RB07-062`、`RB07-122`、`RB07-232`、`RB07-296`、`RB07-324`、`RB07-339`、`RB08-049`、`RB08-054`、`RB08-096`、`RB08-162`、`RB08-182`、`RB08-257`、`RB08-261`、`RB08-296`、`RB08-319`、`RB08-323`、`RB08-344`、`RB09-029`、`RB09-030`、`RB09-051`、`RB09-054`、`RC0-022`、`RC0-101`、`RC00-231`、`RC02-079`、`RC02-081`、`RC02-161`、`RC02-173`、`RC02-174`、`RC03-004`、`RC03-010`、`RC03-014`、`RC03-019`、`RC03-035`、`RC03-040`、`RC03-136`、`RC04-001`、`RC04-002`、`RC04-003`、`RC04-090`、`RC04-105`、`RC04-135`、`RD00-304`、`RD02-134`、`RD02-149`、`RD03-226`、`RD04-180`、`RD04-194`、`RD04-204`、`RD04-205`、`RD04-207`、`RD04-208`、`RD04-209`、`RD04-214`、`RD04-216`、`RD05-041`、`RD05-091`、`RD05-098`、`RD05-101`、`RD05-103`、`RD05-119`、`RD05-136`、`RD05-145`、`RD05-163`、`RD05-167`、`RD05-172`、`RD07-098`、`RD07-104`、`RD07-105`、`RD07-106`、`RD07-149`、`RD07-150`、`RD07-152`、`RD07-168`、`RD07-174`、`RD07-176`、`RD07-179`、`RD07-180`、`RD07-181`、`RD09-004`、`RD09-089`、`RD09-091`、`RD09-118`、`RD09-129`、`RD09-134`、`RD10-077`、`RD11-073`、`RD11-088`、`RD11-097`、`RE01-091`、`RE01-111`、`RE01-114`、`RE01-115`、`RE01-126`、`RE01-154`、`RE01-187`、`RE01-196`、`RE01-221`、`RE01-239`、`RE01-240`、`RE01-246`、`RE01-253`、`RE01-264`、`RE01-284`、`RF00-011`、`RG09-016`、`RG10-002`、`RG10-005`、`RG14-007`、`RG16-012`、`RG16-020`、`RG18-005`、`RG18-024`
