---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-FRM-09
group: 枠
product: HARNESS
atoms_primary: 26
atoms_secondary: 1
issue_projection: #1858
---

# RUL-FRM-09（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

安全検証の義務と判定基準を定める。脅威modelを適用する工程と時期、脆弱性の重大度を実害への経路から決める基準、攻撃を試みた記録の要件、依存・供給網・licenseについて確認すべき事項。実行と証拠の管理はOSが担う（RUL-OSA-07）。

## 主として対応づいた規則（26件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-174` | security-auditはexploit経路のfile・行・再現条件からseverityを決め、実害につながる所見だけをCritical・Highにし、高リスク順で返す。 | review_merge | prose | .claude/agents/security-audit.md:23-26 |
| `RA-177` | /sdd-review実行者はcode-review-and-qualityに加え、security-and-hardeningとadversarial-reviewの観点を適用する。 | review_merge | prose | .claude/commands/sdd-review.md:7-11 |
| `RA-242` | QAはG4でUnit全通過・coverage70%以上・OWASP通過、G6で全test・E2E通過と性能基準達成を確認する。 | process_gate | prose／gate | .claude/agents/qa-test.md:74-78 |
| `RA-243` | security担当はG2でSTRIDE、G4でOWASP・secret scan、G6でDAST・依存脆弱性、G7で本番設定・network policyを検証する。 | process_gate | prose／gate | .claude/agents/security-audit.md:73-79 |
| `RA-345` | security担当はOWASPの10観点を、認可・暗号・注入・脅威設計・設定・依存・認証・供給網・logging・SSRFの指定方法で確認する。 | behavior_discipline | prose | .claude/agents/security-audit.md:28-41 |
| `RA-346` | security担当はJWT署名・期限・refresh、cookie属性、権限matrix、API key rotationを監査する。 | behavior_discipline | prose | .claude/agents/security-audit.md:43-47 |
| `RB04-165` | 依存追加担当者はAI提案のライブラリを追加前にレビューする。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:113-113; docs/governance/ai-dev-team-operations_v1.1.md:785-785 |
| `RB04-197` | 全機能は正常・境界・異常を網羅し、外部依存は例外処理、権限処理はsecurity、状態保持は並行性、critical pathは性能、state machineは遷移を検証する。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:607-620 |
| `RB04-247` | security設計者は開発・commit・CI・deploy・運用の全工程へ多層防御を組み込み、後工程だけの検査にしない。 | safety_security | prose | docs/governance/ai-dev-team-concept_v1.1.md:40-42; docs/governance/ai-dev-team-concept_v1.1.md:195-197 |
| `RB04-249` | 開発規則の管理者はAGENTS.md/CLAUDE.mdへsecurity規約を明記し、IDE内security checkerを導入する。 | safety_security | prose／lint | docs/governance/ai-dev-team-concept_v1.1.md:213-221 |
| `RB04-256` | AI生成codeはPRで明示し、AIと人間の二段reviewを行い、SQLi・XSS・CSRF・認可のsecurity testを必ず含める。 | review_merge | prose | docs/governance/ai-dev-team-concept_v1.1.md:275-281 |
| `RB04-257` | 依存採用者はAI提案の新規libraryを必ずreviewし、保守状況・license等の信頼性を確認してSBOMを自動生成する。 | safety_security | prose | docs/governance/ai-dev-team-concept_v1.1.md:283-289 |
| `RB04-265` | security toolは顧客向け本番release時にSAST、本番URLへのaccess開始時にWAF、container deploy開始時にimage scanを追加する。 | safety_security | prose | docs/governance/ai-dev-team-concept_v1.1.md:364-370 |
| `RB04-269` | AI tool導入者は学習opt-out・ZDR・書込み/command権限制御・sandbox・audit log範囲・商用制限を確認する。 | safety_security | prose | docs/governance/ai-dev-team-concept_v1.1.md:417-429 |
| `RB04-274` | security管理者は年一回以上のaudit、定期penetration test、incident保険加入、適用される規制遵守checkを行う。 | safety_security | prose | docs/governance/ai-dev-team-concept_v1.1.md:523-531 |
| `RB06-167` | supply-chain検証はcanonical lockからversion再現、統合SBOM、secretゼロ、policy適合licenseを証明する。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:148-148 |
| `RB07-072` | テスト作成者は他人・他tenant・削除済みresourceのID指定や権限を下げた操作を試す。 | safety_security | prose | docs/skills/test-thinking.md:55-57 |
| `RB07-073` | テスト作成者は依存先の遅延・停止・異常値・部分成功を想定し、エラー表示の情報漏洩と次行動の明確さも検査する。 | behavior_discipline | prose | docs/skills/test-thinking.md:58-61 |
| `RB07-122` | 依存更新者は既知registry由来を確認し、PO承認なしにfile:・git+ssh:・http:参照を使わない。 | safety_security | prose | docs/skills/security-and-hardening.md:50-53 |
| `RB07-124` | 担当者はproduction依存で*やlatestを禁止し、floating rangeをpinするPLANなしに安全と扱わない。 | safety_security | prose | docs/skills/security-and-hardening.md:56-57; docs/skills/security-and-hardening.md:116-117 |
| `RB08-001` | 設計者はagent向けsurfaceの脅威モデルを、実装開始前のL2・L3で適用する。 | safety_security | prose | docs/skills/threat-model.md:21-24 |
| `RB08-002` | 設計者はPLAN内の各surfaceについて、なりすまし・改ざん・否認・情報漏えい・サービス妨害・権限昇格の問いへの回答をL3に記録する。 | safety_security | prose | docs/skills/threat-model.md:49-60 |
| `RB08-010` | 設計者はinternal-onlyのsurfaceも脅威モデルの対象から除外しない。 | safety_security | prose | docs/skills/threat-model.md:94-95 |
| `RB08-011` | 設計者はguardrailのgreenを脅威モデル完成と扱わず、新しい攻撃面を手動列挙する。 | evidence_claim | prose | docs/skills/threat-model.md:98-99 |
| `RD02-021` | リスク導出器は、規則ファイル、hook・CI・DB等の指定prefix、または認証・決済・review等の指定語を含む変更pathをhighと判定する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:469-537 |
| `RD04-191` | action-binding readiness lintは、右腕工程文書にOWASP LLM06:2025 Excessive Agency markerが無い場合に違反とする。 | safety_security | lint | src/lint/action-binding-approval-readiness.ts:198-198; src/lint/action-binding-approval-readiness.ts:265-272 |

## 副として対応づいた規則（1件）

`RG14-012`
