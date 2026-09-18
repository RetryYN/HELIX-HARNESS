---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784
rule_id: RUL-OSA-07
group: OS検収
product: OS
atoms_primary: 40
atoms_secondary: 16
issue_projection: #1860
---

# RUL-OSA-07（OS検収／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

HARNESSが定めた安全検証の義務（RUL-FRM-09）を適用する。脅威modelの確認、脆弱性の審査、依存と供給網の検査を実行し、結果と証拠を対象revisionへ結び、未分類のlicenseや未解消の重大な指摘を承認要求へ回す。

## 主として対応づいた規則（40件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-052` | security担当はGit履歴への秘密情報混入をgitleaksまたはtrufflehogで確認する。 | safety_security | prose | n/a | gitleaks、trufflehog | — | .claude/agents/security-audit.md:58-58 | A／gpt-6-astra |
| `RA-179` | /shipのmain agentは専門reportを統合し、code-reviewerのCritical・Importantと検査失敗を集約し、securityのCritical・Highをblockerへ昇格する。 | review_merge | prose | n/a | /ship Phase B | `RUL-OSA-03` | .claude/commands/ship.md:36-40 | A／gpt-6-astra |
| `RA-341` | DevOps担当はTrivyまたはSnykでDocker imageをscanする。 | behavior_discipline | prose | n/a | Trivy/Snyk | `RUL-DEV-02` | .claude/agents/devops-deploy.md:70-70 | A／gpt-6-astra |
| `RA-347` | security担当はnpm audit・pip audit・image scanを実施し、重大度別脆弱性一覧・具体的対策・OWASP結果・compliance状況を返す。 | behavior_discipline | prose | n/a | npm audit --audit-level=high、pip audit、trivy | `RUL-OSP-01` | .claude/agents/security-audit.md:66-71; .claude/agents/security-audit.md:81-85 | A／gpt-6-astra |
| `RA-353` | QAはDAST・SCA・secret scanを行い、mutation testでscore60%以上を目標にする。 | behavior_discipline | prose | n/a | ZAP/Burp、npm/pip audit、gitleaks、Stryker/mutmut | `RUL-FRM-05` | .claude/agents/qa-test.md:65-72 | A／gpt-6-astra |
| `RB04-201` | PRはlint・format・型・unit・integration・coverage閾値・SAST/SCA・secret・license・buildの全検査が通るまでmergeできない設定にする。 | review_merge | ci／config | fail_close | 旧PR品質gate集合 | `RUL-OSA-04` | docs/governance/ai-dev-team-operations_v1.1.md:645-669 | B04／gpt-6-astra |
| `RB04-216` | CodeQL alertはAI実装・保守が影響評価と修正PR起案を行い、false positiveのcloseには理由を残し、修正patternを観点リストへ追加する。 | safety_security | prose | n/a | CodeQL、旧AI実装・保守職 | `RUL-OSI-01` | docs/governance/ai-dev-team-operations_v1.1.md:832-840 | B04／gpt-6-astra |
| `RB04-251` | commit時はpre-commitでsecretを検出し、GPG/SSH署名を必須とし、credential関連fileをgitignoreへ登録する。 | safety_security | prose／hook／config | n/a | gitleaks/detect-secrets、署名必須 | — | docs/governance/ai-dev-team-concept_v1.1.md:223-229; docs/governance/ai-dev-team-concept_v1.1.md:653-653 | B04／gpt-6-astra |
| `RB04-252` | CI管理者はSAST・SCA・secret scan・container image scan・license checkを組み込む。 | safety_security | ci | n/a | CodeQL/Semgrep/Trivy等 | `RUL-OSA-05`、`RUL-OSM-04` | docs/governance/ai-dev-team-concept_v1.1.md:231-241 | B04／gpt-6-astra |
| `RB04-281` | 基盤担当者はCIへsecretを安全に渡す経路を整備し、lint/format・unit test・Dependabot・Secret Scanningを有効にする。 | tooling_runtime | ci／config | n/a | GitHub Secrets/Dependabot/Secret Scanning | `RUL-OSM-04` | docs/governance/ai-dev-team-concept_v1.1.md:651-663 | B04／gpt-6-astra |
| `RB05-194` | supply-chain検証はcanonical lockによるclean installとnetworkなしoffline再現を確認し、lock drift・SBOM欠落・secret検出を失敗させ、未分類licenseは承認要求にする。 | safety_security | gate | fail_close | 未実装supply-chain gate | `RUL-OSM-04` | docs/governance/infinity-loop-system-assertion-cases.md:139-144; docs/governance/infinity-loop-system-assertion-cases.md:406-406 | B05／gpt-6-astra |
| `RB07-121` | hardening担当者はaccept前にguardrail、lint、test、doctorを順に実行し、securityの設計時境界も併せて満たす。 | process_gate | prose | fail_close | helix／npmの検証列 | — | docs/skills/security-and-hardening.md:37-46; docs/skills/security-and-hardening.md:118-121 | B07／gpt-6-astra |
| `RB07-123` | 依存更新者はauditを実行してcritical・high advisoryを確認し、残す場合はaccept前にdependency-risk文書へ受容リスクを記録する。 | safety_security | prose | fail_close | npm audit／docs/design/L5/<plan-id>-dependency-risk.md | `RUL-FRM-04` | docs/skills/security-and-hardening.md:54-55 | B07／gpt-6-astra |
| `RB07-132` | Retrofit・RefactorおよびL11/L12 gateの担当者はhardening記録をauditへ保存し、PLAN review_evidenceからlinkする。 | evidence_claim | prose | n/a | .helix/audit/<PLAN-id>-hardening.json | — | docs/skills/security-and-hardening.md:94-110 | B07／gpt-6-astra |
| `RB07-197` | security reviewerは境界確認・agent guard・credential衛生・hook fail-closeの結果をPLAN証跡へ記録し、settings変更を検査・記録なしの簡易変更として扱わない。 | evidence_claim | prose | n/a | review_evidence／.claude/settings.json | `RUL-FRM-04` | docs/skills/security.md:93-112 | B07／gpt-6-astra |
| `RB08-003` | 設計者は未回答の脅威質問をopen threatとしてL3設計書に記録し、pair-freeze前に緩和PLANへリンクする。 | process_gate | prose | fail_close | L3、pair-freeze | `RUL-FRM-02`、`RUL-TKT-03` | docs/skills/threat-model.md:62-62 | B08／gpt-6-astra |
| `RB08-009` | 設計者は脅威モデルを版管理された設計成果物として保存し、pair-freeze前にPLANのreview_evidenceから参照する。 | evidence_claim | prose | n/a | docs/design/L3/<plan-id>-threat-model.md | `RUL-FRM-04` | docs/skills/threat-model.md:78-90; docs/skills/threat-model.md:96-97 | B08／gpt-6-astra |
| `RC00-035` | taxonomy審査は、license riskがunknownまたはhighなら不合格とする。 | safety_security | gate | fail_close | 未指定値はこの分岐では拒否しない | `RUL-RSH-01` | src/runtime/harness-taxonomy-curation-policy.ts:70-76 | C00／gpt-6-astra |
| `RC00-255` | agent catalog分類器は、名称またはsourceがlicense unknown・unlicensedに一致した場合にsourceを拒否分類する。 | safety_security | gate | fail_close | 文字列heuristicでlicense_unknownを検出 | `RUL-RSH-01` | src/runtime/agent-catalog-watch.ts:56-75 | C00／gpt-6-astra |
| `RC00-256` | agent catalog分類器は、名称またはsourceがleak・exfilに一致した場合にsourceを拒否分類する。 | safety_security | gate | fail_close | 部分一致でleak_derivedと分類 | — | src/runtime/agent-catalog-watch.ts:56-75 | C00／gpt-6-astra |
| `RC00-257` | agent catalog分類器は、名称またはsourceがjailbreak・bypass guardrail・strip guardrailに一致した場合にsourceを拒否分類する。 | safety_security | gate | fail_close | guardrail_stripping文字列検査 | — | src/runtime/agent-catalog-watch.ts:56-75 | C00／gpt-6-astra |
| `RC01-183` | toolchain-pinは、GitHub Actionのimmutable ref registryがない場合、不合格にする。 | safety_security | lint | fail_close | config/github-action-immutable-ref-registry.json | — | src/lint/toolchain-pin.ts:88-104 | C01／gpt-6-astra |
| `RC01-186` | toolchain-pinは、Action entryがaction名・major release・完全SHA・そのSHAで終わるGitHub API source URLを所定形式で結び付けていない場合、不合格にする。 | safety_security | lint | fail_close | owner/repo、vN、小文字40桁hex、GitHub API URL | — | src/lint/toolchain-pin.ts:52-56; src/lint/toolchain-pin.ts:137-155 | C01／gpt-6-astra |
| `RC01-194` | toolchain-pinは、local参照以外のworkflow stepのusesがowner/repo@完全40桁SHA形式でない場合、不合格にする。 | safety_security | lint | fail_close | ./開始は除外、小文字hex SHA | — | src/lint/toolchain-pin.ts:56-56; src/lint/toolchain-pin.ts:296-306 | C01／gpt-6-astra |
| `RC04-241` | CIは、Linux isolation backend導入と実bubblewrap隔離試験の結果をpreflight集約へ渡す。 | safety_security | ci | fail_close | HELIX_REQUIRE_REAL_BWRAP=1、U-WIB-007 | — | .github/workflows/harness-check.yml:228-240; .github/workflows/harness-check.yml:518-558 | C04／gpt-6-astra |
| `RD02-023` | リスクadmissionは、申告リスクが変更pathから導出したリスクを下回る場合に拒否する。 | review_merge | gate | fail_close | REVIEW_RISK_RANK | `RUL-OSP-02` | src/runtime/independent-review-fallback.ts:578-582 | D02／gpt-6-astra |
| `RD09-105` | proposal-document-coverageは、security-privacyを期待するシナリオでrole_permission_matrixがrequired_evidenceにない場合、失敗させる。 | safety_security | lint | fail_close | role_permission_matrix | — | src/lint/proposal-document-coverage-policy.ts:56-56; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-106` | proposal-document-coverageは、security-privacyを期待するシナリオでhuman_security_approvalがrequired_evidenceにない場合、失敗させる。 | escalation_authority | lint | fail_close | human_security_approval | — | src/lint/proposal-document-coverage-policy.ts:56-56; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-108` | proposal-document-coverageは、error-observability-auditを期待するシナリオでredaction_policyがrequired_evidenceにない場合、失敗させる。 | safety_security | lint | fail_close | redaction_policy | — | src/lint/proposal-document-coverage-policy.ts:57-57; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-122` | proposal-document-coverageは、security-privacyを期待するシナリオでsecurity-privacy-reviewがrequired_gatesにない場合、失敗させる。 | safety_security | lint | fail_close | security-privacy-review | `RUL-FRM-02` | src/lint/proposal-document-coverage-policy.ts:70-70; src/lint/proposal-document-coverage.ts:169-178 | D09／gpt-6-astra |
| `RD11-036` | profile safety検査は、公式sourceが定義されたprofileのsourceUrlに対応する期待文字列が含まれない場合にerrorにする。 | safety_security | lint | fail_close | officialHostの固定7profileと部分文字列一致 | `RUL-COR-04`、`RUL-RSH-01` | src/lint/verification-profile-safety.ts:140-149; src/lint/verification-profile-safety.ts:158-169 | D11／gpt-6-astra |
| `RD11-103` | security checklist検査は、各check行のsource metadata検査が返す違反を報告する。 | evidence_claim | lint | fail_close | verificationSourceMetadataViolationsへ委譲 | `RUL-RSH-01`、`RUL-OSA-06` | src/lint/version-up-readiness.ts:1780-1791 | D11／gpt-6-astra |
| `RD11-104` | security checklist検査は、checkのstatusがpresentまたはpending_evidence以外の場合に違反にする。 | process_gate | lint | fail_close | securityChecks.statusの2値 | `RUL-OSA-06` | src/lint/version-up-readiness.ts:1792-1797 | D11／gpt-6-astra |
| `RD11-105` | security checklist検査は、evidenceが空白またはplaceholderの場合に違反にする。 | evidence_claim | lint | fail_close | TBD、TODO、N/A、-、placeholder、山括弧値、後日記録表現等を検出 | `RUL-OSA-06` | src/lint/version-up-readiness.ts:1798-1803; src/lint/version-up-readiness.ts:2473-2477 | D11／gpt-6-astra |
| `RD11-106` | security checklist検査は、reasonが空白またはplaceholderの場合に違反にする。 | evidence_claim | lint | fail_close | isBlankOrPlaceholderActivationField | `RUL-OSA-06` | src/lint/version-up-readiness.ts:1804-1809; src/lint/version-up-readiness.ts:2473-2477 | D11／gpt-6-astra |
| `RD11-107` | security checklist検査は、statusをpresentとしたevidenceが未完了表現を含むか具体的locatorを持たない場合に違反にする。 | evidence_claim | lint | fail_close | locatorの文字列pattern検査であり実在検査ではない | `RUL-OSA-06` | src/lint/version-up-readiness.ts:1810-1815; src/lint/version-up-readiness.ts:2444-2490 | D11／gpt-6-astra |
| `RD11-139` | activation readiness検査は、外部境界がある場合、webhook_signature_checkの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | safety_security | lint | fail_close | 署名検証そのものではなく証拠文字列を検査 | `RUL-FRM-04` | src/lint/version-up-readiness.ts:537-537; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 | D11／gpt-6-astra |
| `RD11-140` | activation readiness検査は、外部境界がある場合、access_control_checkの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | safety_security | lint | fail_close | activationEvidenceIsPending | `RUL-FRM-04` | src/lint/version-up-readiness.ts:538-538; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 | D11／gpt-6-astra |
| `RE01-269` | security受入者はcoverage・finding・policy・permissionのreceiptを同じHEADとartifactへ束縛し、scanner単体や別検査のgreenでcoverage不足を相殺しない。 | evidence_claim | gate | fail_close | security composite receipt | `RUL-FRM-04` | docs/governance/helix-harness-requirements_v1.3.md:542-547 | E01／claude-opus |
| `RG01-011` | /shipのsecurity-audit担当は、脆弱性と脅威の確認にsecurity-and-hardeningおよびthreat-model skillを参照する。 | tooling_runtime | prose | n/a | 旧security-and-hardening／threat-model skill | `RUL-OSP-08` | .claude/commands/ship.md:29-30 | G01／claude-opus |

## 副として対応づいた規則（16件）

`RA-177`、`RA-242`、`RB04-165`、`RB04-197`、`RB04-253`、`RB04-256`、`RB04-257`、`RB04-269`、`RB04-274`、`RB07-072`、`RB07-073`、`RB07-124`、`RB07-236`、`RB08-011`、`RE01-215`、`RG15-017`
