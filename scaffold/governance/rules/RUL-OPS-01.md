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

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RB04-167` | 全員は認証情報を1Passwordへ集約し、チーム外への共有は必要時の管理された共有機能に限定し、不要な認証情報を速やかに無効化する。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:121-121; docs/governance/ai-dev-team-operations_v1.1.md:759-767 |
| `RB04-170` | チームは課題・レビューをGitHub、日常相談を#dev、緊急対応を#incident、機微な個別相談をDMへ振り分け、Issue/PRは1営業日以内を応答目安とする。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:140-151 |
| `RB04-213` | secret漏洩発見者は即#incidentへ投稿し、30分以内の初動としてsecret無効化・履歴除去・影響範囲特定を行い、無効化を最優先にする。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:789-818 |
| `RB04-215` | Dependabot対応者はCriticalを24時間以内、Highを1週間以内、Mediumを1か月以内、Lowを次のmajor更新時に対応する。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:823-830 |
| `RB04-217` | incident担当者は本番停止・損失・漏洩をP0即時、一部不全・大幅劣化をP1一時間以内、軽微影響をP2一営業日以内、影響なしをP3週次として対応する。 | escalation_authority | prose | docs/governance/ai-dev-team-operations_v1.1.md:844-851 |
| `RB04-219` | 封じ込め担当者は機能故障をflag無効化、特定ユーザー影響を対象制限、deploy起因をrollback、攻撃疑いをWAF等、secret漏洩を全関連credential rotationで処置する。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:869-877 |
| `RB04-230` | 全員不在なら軽微影響は翌朝、重大影響は連絡し、連絡手段はSlack・DM・mail・緊急時のみ電話の順に上げる。 | escalation_authority | prose | docs/governance/ai-dev-team-operations_v1.1.md:1016-1026 |
| `RB04-231` | 業務開始者は夜間channel動向・新規error・CI失敗・担当Issue/PR・security alertを確認する。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:1031-1041 |
| `RB04-254` | 運用担当者はDAST・WAF/IDS/IPS・監査logと異常検知を整備し、incident手順を定期訓練する。 | safety_security | prose | docs/governance/ai-dev-team-concept_v1.1.md:253-261; docs/governance/ai-dev-team-concept_v1.1.md:715-715 |
| `RB04-258` | access管理者は最小権限・RBAC・MFAを適用し、認証情報をpassword managerへ一元管理する。 | safety_security | prose／config | docs/governance/ai-dev-team-concept_v1.1.md:291-299; docs/governance/ai-dev-team-concept_v1.1.md:647-649 |
| `RB04-259` | access管理者は退場時に即日accessを剥奪し、AI agentのaccountを人間と分離して権限を制限する。 | safety_security | prose／config | docs/governance/ai-dev-team-concept_v1.1.md:301-303 |
| `RB04-275` | BCP担当者は全dataの自動backupと定期restore test、off-site等の災害対策、役割冗長化と知識形式知化を整備する。 | safety_security | prose | docs/governance/ai-dev-team-concept_v1.1.md:533-539 |
| `RB04-276` | risk責任者は対策費用と影響を比較して受容可能な水準まで下げ、残余riskを明示的に受容し、評価を定期的に見直す。 | escalation_authority | prose | docs/governance/ai-dev-team-concept_v1.1.md:541-541 |
| `RB07-007` | 担当者は本番または利用者に見えるIncidentをIncident PLANとして扱い、他の作業より優先する。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:74-74 |
| `RB07-008` | 担当者は利用者による強制停止を、技術的重大度にかかわらずIncident級Recoveryに分類する。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:76-76 |
| `RB07-231` | workflow変更をpushする担当者は一時的なworkflow権限credentialを使い、push後すぐ削除してconfigや環境変数へ永続化しない。 | safety_security | prose | docs/skills/git.md:96-101 |
| `RB08-049` | runbook作成者はtrigger・影響・期待出力付き手順・検証・人間へ判断を渡す停止点を記載する。 | doc_language | prose | docs/skills/documentation.md:68-74 |
| `RB08-180` | 運用設計者はincident発生前にrunbookを作り、3件以上のalert対応・rollback・role別escalation条件を揃える。欠落時はL11 gateを失敗させる。 | process_gate | prose／gate | docs/skills/incident-runbook.md:20-22; docs/skills/incident-runbook.md:30-40 |
| `RB08-183` | 初動担当者は症状・scope・severityを確認して該当runbookに従い、全actionをtimestamp付きで監査timelineへ記録する。 | evidence_claim | prose | docs/skills/incident-runbook.md:55-58 |
| `RB09-052` | AWS認証の実装者は、長期access keyを保存せず、OIDC federationのtrust conditionをorganization／repository／environment／refへ限定する。 | safety_security | prose | docs/governance/devops-external-source-research-2026-07-23.md:24-24 |
| `RD02-312` | 保存方針導出器は、運用文書のpolicy・authorityがoperations-governance、modeがindefiniteに一致しない場合に拒否する。 | process_gate | gate | src/runtime/retirement-preserve.ts:481-511 |
| `RE01-063` | Recovery文書の検証器は規定の七つの節が欠けている場合に失敗する。 | process_gate | lint | docs/governance/helix-harness-requirements_v1.2.md:1042-1042 |
| `RE01-064` | hotfix担当者はPR本文にpostmortemのパス、Recoveryへの参照、severityを記録する。P0/P1のpostmortemはmergeから48時間以内に用意する。 | process_gate | prose／ci | docs/governance/helix-harness-requirements_v1.2.md:1048-1060 |
| `RG10-009` | Incident担当者は暫定収束後にReverse fullbackでVモデルへ戻し、postmortemをL12 feedbackへ接続する。 | process_gate | prose | docs/governance/gate-design.md:61-61 |
| `RG18-016` | Incidentの初動担当者は安全な場合にrunbookのimmediate mitigationを適用する。 | safety_security | prose | docs/skills/incident-runbook.md:55-57 |

## 副として対応づいた規則（11件）

`RB04-237`、`RB04-238`、`RB04-288`、`RC04-284`、`RE01-089`、`RE01-142`、`RE01-218`、`RE01-281`、`RG05-008`、`RG05-009`、`RG18-017`
