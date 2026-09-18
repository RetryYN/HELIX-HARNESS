---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSA-07
group: OS検収
product: OS
atoms_primary: 39
atoms_secondary: 15
issue_projection: #1860
---

# RUL-OSA-07（OS検収／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

HARNESSが定めた安全検証の義務（RUL-FRM-09）を適用する。脅威modelの確認、脆弱性の審査、依存と供給網の検査を実行し、結果と証拠を対象revisionへ結び、未分類のlicenseや未解消の重大な指摘を承認要求へ回す。

## 主として対応づいた規則（39件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-052` | security担当はGit履歴への秘密情報混入をgitleaksまたはtrufflehogで確認する。 | safety_security | prose | .claude/agents/security-audit.md:58-58 |
| `RA-179` | /shipのmain agentは専門reportを統合し、code-reviewerのCritical・Importantと検査失敗を集約し、securityのCritical・Highをblockerへ昇格する。 | review_merge | prose | .claude/commands/ship.md:36-40 |
| `RA-341` | DevOps担当はTrivyまたはSnykでDocker imageをscanする。 | behavior_discipline | prose | .claude/agents/devops-deploy.md:70-70 |
| `RA-347` | security担当はnpm audit・pip audit・image scanを実施し、重大度別脆弱性一覧・具体的対策・OWASP結果・compliance状況を返す。 | behavior_discipline | prose | .claude/agents/security-audit.md:66-71; .claude/agents/security-audit.md:81-85 |
| `RA-353` | QAはDAST・SCA・secret scanを行い、mutation testでscore60%以上を目標にする。 | behavior_discipline | prose | .claude/agents/qa-test.md:65-72 |
| `RB04-201` | PRはlint・format・型・unit・integration・coverage閾値・SAST/SCA・secret・license・buildの全検査が通るまでmergeできない設定にする。 | review_merge | ci／config | docs/governance/ai-dev-team-operations_v1.1.md:645-669 |
| `RB04-216` | CodeQL alertはAI実装・保守が影響評価と修正PR起案を行い、false positiveのcloseには理由を残し、修正patternを観点リストへ追加する。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:832-840 |
| `RB04-251` | commit時はpre-commitでsecretを検出し、GPG/SSH署名を必須とし、credential関連fileをgitignoreへ登録する。 | safety_security | prose／hook／config | docs/governance/ai-dev-team-concept_v1.1.md:223-229; docs/governance/ai-dev-team-concept_v1.1.md:653-653 |
| `RB04-252` | CI管理者はSAST・SCA・secret scan・container image scan・license checkを組み込む。 | safety_security | ci | docs/governance/ai-dev-team-concept_v1.1.md:231-241 |
| `RB04-281` | 基盤担当者はCIへsecretを安全に渡す経路を整備し、lint/format・unit test・Dependabot・Secret Scanningを有効にする。 | tooling_runtime | ci／config | docs/governance/ai-dev-team-concept_v1.1.md:651-663 |
| `RB05-194` | supply-chain検証はcanonical lockによるclean installとnetworkなしoffline再現を確認し、lock drift・SBOM欠落・secret検出を失敗させ、未分類licenseは承認要求にする。 | safety_security | gate | docs/governance/infinity-loop-system-assertion-cases.md:139-144; docs/governance/infinity-loop-system-assertion-cases.md:406-406 |
| `RB07-121` | hardening担当者はaccept前にguardrail、lint、test、doctorを順に実行し、securityの設計時境界も併せて満たす。 | process_gate | prose | docs/skills/security-and-hardening.md:37-46; docs/skills/security-and-hardening.md:118-121 |
| `RB07-123` | 依存更新者はauditを実行してcritical・high advisoryを確認し、残す場合はaccept前にdependency-risk文書へ受容リスクを記録する。 | safety_security | prose | docs/skills/security-and-hardening.md:54-55 |
| `RB07-132` | Retrofit・RefactorおよびL11/L12 gateの担当者はhardening記録をauditへ保存し、PLAN review_evidenceからlinkする。 | evidence_claim | prose | docs/skills/security-and-hardening.md:94-110 |
| `RB07-197` | security reviewerは境界確認・agent guard・credential衛生・hook fail-closeの結果をPLAN証跡へ記録し、settings変更を検査・記録なしの簡易変更として扱わない。 | evidence_claim | prose | docs/skills/security.md:93-112 |
| `RB08-003` | 設計者は未回答の脅威質問をopen threatとしてL3設計書に記録し、pair-freeze前に緩和PLANへリンクする。 | process_gate | prose | docs/skills/threat-model.md:62-62 |
| `RB08-009` | 設計者は脅威モデルを版管理された設計成果物として保存し、pair-freeze前にPLANのreview_evidenceから参照する。 | evidence_claim | prose | docs/skills/threat-model.md:78-90; docs/skills/threat-model.md:96-97 |
| `RC00-035` | taxonomy審査は、license riskがunknownまたはhighなら不合格とする。 | safety_security | gate | src/runtime/harness-taxonomy-curation-policy.ts:70-76 |
| `RC00-255` | agent catalog分類器は、名称またはsourceがlicense unknown・unlicensedに一致した場合にsourceを拒否分類する。 | safety_security | gate | src/runtime/agent-catalog-watch.ts:56-75 |
| `RC00-256` | agent catalog分類器は、名称またはsourceがleak・exfilに一致した場合にsourceを拒否分類する。 | safety_security | gate | src/runtime/agent-catalog-watch.ts:56-75 |
| `RC00-257` | agent catalog分類器は、名称またはsourceがjailbreak・bypass guardrail・strip guardrailに一致した場合にsourceを拒否分類する。 | safety_security | gate | src/runtime/agent-catalog-watch.ts:56-75 |
| `RC01-183` | toolchain-pinは、GitHub Actionのimmutable ref registryがない場合、不合格にする。 | safety_security | lint | src/lint/toolchain-pin.ts:88-104 |
| `RC01-186` | toolchain-pinは、Action entryがaction名・major release・完全SHA・そのSHAで終わるGitHub API source URLを所定形式で結び付けていない場合、不合格にする。 | safety_security | lint | src/lint/toolchain-pin.ts:52-56; src/lint/toolchain-pin.ts:137-155 |
| `RC01-194` | toolchain-pinは、local参照以外のworkflow stepのusesがowner/repo@完全40桁SHA形式でない場合、不合格にする。 | safety_security | lint | src/lint/toolchain-pin.ts:56-56; src/lint/toolchain-pin.ts:296-306 |
| `RC04-241` | CIは、Linux isolation backend導入と実bubblewrap隔離試験の結果をpreflight集約へ渡す。 | safety_security | ci | .github/workflows/harness-check.yml:228-240; .github/workflows/harness-check.yml:518-558 |
| `RD02-023` | リスクadmissionは、申告リスクが変更pathから導出したリスクを下回る場合に拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:578-582 |
| `RD09-105` | proposal-document-coverageは、security-privacyを期待するシナリオでrole_permission_matrixがrequired_evidenceにない場合、失敗させる。 | safety_security | lint | src/lint/proposal-document-coverage-policy.ts:56-56; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-106` | proposal-document-coverageは、security-privacyを期待するシナリオでhuman_security_approvalがrequired_evidenceにない場合、失敗させる。 | escalation_authority | lint | src/lint/proposal-document-coverage-policy.ts:56-56; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-108` | proposal-document-coverageは、error-observability-auditを期待するシナリオでredaction_policyがrequired_evidenceにない場合、失敗させる。 | safety_security | lint | src/lint/proposal-document-coverage-policy.ts:57-57; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-122` | proposal-document-coverageは、security-privacyを期待するシナリオでsecurity-privacy-reviewがrequired_gatesにない場合、失敗させる。 | safety_security | lint | src/lint/proposal-document-coverage-policy.ts:70-70; src/lint/proposal-document-coverage.ts:169-178 |
| `RD11-036` | profile safety検査は、公式sourceが定義されたprofileのsourceUrlに対応する期待文字列が含まれない場合にerrorにする。 | safety_security | lint | src/lint/verification-profile-safety.ts:140-149; src/lint/verification-profile-safety.ts:158-169 |
| `RD11-103` | security checklist検査は、各check行のsource metadata検査が返す違反を報告する。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1780-1791 |
| `RD11-104` | security checklist検査は、checkのstatusがpresentまたはpending_evidence以外の場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:1792-1797 |
| `RD11-105` | security checklist検査は、evidenceが空白またはplaceholderの場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1798-1803; src/lint/version-up-readiness.ts:2473-2477 |
| `RD11-106` | security checklist検査は、reasonが空白またはplaceholderの場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1804-1809; src/lint/version-up-readiness.ts:2473-2477 |
| `RD11-107` | security checklist検査は、statusをpresentとしたevidenceが未完了表現を含むか具体的locatorを持たない場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1810-1815; src/lint/version-up-readiness.ts:2444-2490 |
| `RD11-139` | activation readiness検査は、外部境界がある場合、webhook_signature_checkの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | safety_security | lint | src/lint/version-up-readiness.ts:537-537; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-140` | activation readiness検査は、外部境界がある場合、access_control_checkの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | safety_security | lint | src/lint/version-up-readiness.ts:538-538; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RE01-269` | security受入者はcoverage・finding・policy・permissionのreceiptを同じHEADとartifactへ束縛し、scanner単体や別検査のgreenでcoverage不足を相殺しない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:542-547 |

## 副として対応づいた規則（15件）

`RA-177`、`RA-242`、`RB04-165`、`RB04-197`、`RB04-253`、`RB04-256`、`RB04-257`、`RB04-269`、`RB04-274`、`RB07-072`、`RB07-073`、`RB07-124`、`RB07-236`、`RB08-011`、`RE01-215`
