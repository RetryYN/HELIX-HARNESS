---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OPS-01
group: サービス⑦運用保守
product: HARNESS／OS
atoms_primary: 25
atoms_secondary: 11
issue_projection: #1857
---

# RUL-OPS-01（サービス⑦運用保守／HARNESS／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

運用と障害対応を定める。重大度と対応期限、初動と封じ込めと復旧、運用手順書の必須内容、アクセス権と認証情報の最小権限・短期保持・失効、秘密が漏れたときの失効と影響調査、事業継続と復元。

## 主として対応づいた規則（25件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RB04-167` | 全員は認証情報を1Passwordへ集約し、チーム外への共有は必要時の管理された共有機能に限定し、不要な認証情報を速やかに無効化する。 | safety_security | prose | n/a | 1Password | — | docs/governance/ai-dev-team-operations_v1.1.md:121-121; docs/governance/ai-dev-team-operations_v1.1.md:759-767 | B04／gpt-6-astra |
| `RB04-170` | チームは課題・レビューをGitHub、日常相談を#dev、緊急対応を#incident、機微な個別相談をDMへ振り分け、Issue/PRは1営業日以内を応答目安とする。 | behavior_discipline | prose | n/a | GitHub/Slack、旧応答目安 | — | docs/governance/ai-dev-team-operations_v1.1.md:140-151 | B04／claude_review |
| `RB04-213` | secret漏洩発見者は即#incidentへ投稿し、30分以内の初動としてsecret無効化・履歴除去・影響範囲特定を行い、無効化を最優先にする。 | safety_security | prose | n/a | 旧git filter-repo/force-push手順 | — | docs/governance/ai-dev-team-operations_v1.1.md:789-818 | B04／gpt-6-astra |
| `RB04-215` | Dependabot対応者はCriticalを24時間以内、Highを1週間以内、Mediumを1か月以内、Lowを次のmajor更新時に対応する。 | safety_security | prose | n/a | Dependabot、旧対応期限 | — | docs/governance/ai-dev-team-operations_v1.1.md:823-830 | B04／claude_review |
| `RB04-217` | incident担当者は本番停止・損失・漏洩をP0即時、一部不全・大幅劣化をP1一時間以内、軽微影響をP2一営業日以内、影響なしをP3週次として対応する。 | escalation_authority | prose | n/a | 旧P0-P3分類 | — | docs/governance/ai-dev-team-operations_v1.1.md:844-851 | B04／gpt-6-astra |
| `RB04-219` | 封じ込め担当者は機能故障をflag無効化、特定ユーザー影響を対象制限、deploy起因をrollback、攻撃疑いをWAF等、secret漏洩を全関連credential rotationで処置する。 | safety_security | prose | n/a | 旧封じ込めpattern表 | — | docs/governance/ai-dev-team-operations_v1.1.md:869-877 | B04／gpt-6-astra |
| `RB04-230` | 全員不在なら軽微影響は翌朝、重大影響は連絡し、連絡手段はSlack・DM・mail・緊急時のみ電話の順に上げる。 | escalation_authority | prose | n/a | 旧チーム連絡階段 | — | docs/governance/ai-dev-team-operations_v1.1.md:1016-1026 | B04／claude_review |
| `RB04-231` | 業務開始者は夜間channel動向・新規error・CI失敗・担当Issue/PR・security alertを確認する。 | behavior_discipline | prose | n/a | Slack、Sentry、Dependabot | — | docs/governance/ai-dev-team-operations_v1.1.md:1031-1041 | B04／gpt-6-astra |
| `RB04-254` | 運用担当者はDAST・WAF/IDS/IPS・監査logと異常検知を整備し、incident手順を定期訓練する。 | safety_security | prose | n/a | 旧運用security stack | `RUL-OSI-03` | docs/governance/ai-dev-team-concept_v1.1.md:253-261; docs/governance/ai-dev-team-concept_v1.1.md:715-715 | B04／claude_review |
| `RB04-258` | access管理者は最小権限・RBAC・MFAを適用し、認証情報をpassword managerへ一元管理する。 | safety_security | prose／config | n/a | 1Password Teams等 | — | docs/governance/ai-dev-team-concept_v1.1.md:291-299; docs/governance/ai-dev-team-concept_v1.1.md:647-649 | B04／gpt-6-astra |
| `RB04-259` | access管理者は退場時に即日accessを剥奪し、AI agentのaccountを人間と分離して権限を制限する。 | safety_security | prose／config | n/a | — | `RUL-OPS-02`、`RUL-COR-06` | docs/governance/ai-dev-team-concept_v1.1.md:301-303 | B04／gpt-6-astra |
| `RB04-275` | BCP担当者は全dataの自動backupと定期restore test、off-site等の災害対策、役割冗長化と知識形式知化を整備する。 | safety_security | prose | n/a | 旧multi-region方針 | — | docs/governance/ai-dev-team-concept_v1.1.md:533-539 | B04／gpt-6-astra |
| `RB04-276` | risk責任者は対策費用と影響を比較して受容可能な水準まで下げ、残余riskを明示的に受容し、評価を定期的に見直す。 | escalation_authority | prose | n/a | — | — | docs/governance/ai-dev-team-concept_v1.1.md:541-541 | B04／claude_review |
| `RB07-007` | 担当者は本番または利用者に見えるIncidentをIncident PLANとして扱い、他の作業より優先する。 | process_gate | prose | n/a | Incident PLAN | — | docs/skills/debugging-and-error-recovery.md:74-74 | B07／gpt-6-astra |
| `RB07-008` | 担当者は利用者による強制停止を、技術的重大度にかかわらずIncident級Recoveryに分類する。 | process_gate | prose | n/a | Incident-level Recovery | — | docs/skills/debugging-and-error-recovery.md:76-76 | B07／gpt-6-astra |
| `RB07-231` | workflow変更をpushする担当者は一時的なworkflow権限credentialを使い、push後すぐ削除してconfigや環境変数へ永続化しない。 | safety_security | prose | n/a | workflow-scoped PAT／GCM OAuth | — | docs/skills/git.md:96-101 | B07／gpt-6-astra |
| `RB08-049` | runbook作成者はtrigger・影響・期待出力付き手順・検証・人間へ判断を渡す停止点を記載する。 | doc_language | prose | n/a | — | `RUL-OSM-01` | docs/skills/documentation.md:68-74 | B08／gpt-6-astra |
| `RB08-180` | 運用設計者はincident発生前にrunbookを作り、3件以上のalert対応・rollback・role別escalation条件を揃える。欠落時はL11 gateを失敗させる。 | process_gate | prose／gate | fail_close | docs/ops/<service>-runbook.md、L11 | `RUL-OSA-06` | docs/skills/incident-runbook.md:20-22; docs/skills/incident-runbook.md:30-40 | B08／gpt-6-astra |
| `RB08-183` | 初動担当者は症状・scope・severityを確認して該当runbookに従い、全actionをtimestamp付きで監査timelineへ記録する。 | evidence_claim | prose | n/a | Sev1/2/3、.helix/audit/ | — | docs/skills/incident-runbook.md:55-58 | B08／gpt-6-astra |
| `RB09-052` | AWS認証の実装者は、長期access keyを保存せず、OIDC federationのtrust conditionをorganization／repository／environment／refへ限定する。 | safety_security | prose | n/a | AWS OIDC federation | — | docs/governance/devops-external-source-research-2026-07-23.md:24-24 | B09／gpt-6-astra |
| `RD02-312` | 保存方針導出器は、運用文書のpolicy・authorityがoperations-governance、modeがindefiniteに一致しない場合に拒否する。 | process_gate | gate | fail_close | operations-governance固定方針 | — | src/runtime/retirement-preserve.ts:481-511 | D02／claude_review |
| `RE01-063` | Recovery文書の検証器は規定の七つの節が欠けている場合に失敗する。 | process_gate | lint | fail_close | Recovery七節schema | `RUL-OSA-06` | docs/governance/helix-harness-requirements_v1.2.md:1042-1042 | E01／claude-opus |
| `RE01-064` | hotfix担当者はPR本文にpostmortemのパス、Recoveryへの参照、severityを記録する。P0/P1のpostmortemはmergeから48時間以内に用意する。 | process_gate | prose／ci | warn | 48時間期限と週次の期限超過ラベル | `RUL-OSM-08` | docs/governance/helix-harness-requirements_v1.2.md:1048-1060 | E01／claude-opus |
| `RG10-009` | Incident担当者は暫定収束後にReverse fullbackでVモデルへ戻し、postmortemをL12 feedbackへ接続する。 | process_gate | prose | n/a | Reverse fullback、L12 feedback | `RUL-OSI-01`、`RUL-REV-01` | docs/governance/gate-design.md:61-61 | G10／claude-opus |
| `RG18-016` | Incidentの初動担当者は安全な場合にrunbookのimmediate mitigationを適用する。 | safety_security | prose | n/a | — | — | docs/skills/incident-runbook.md:55-57 | G18／claude-opus |

## 副として対応づいた規則（11件）

`RB04-237`、`RB04-238`、`RB04-288`、`RC04-284`、`RE01-089`、`RE01-142`、`RE01-218`、`RE01-281`、`RG05-008`、`RG05-009`、`RG18-017`
