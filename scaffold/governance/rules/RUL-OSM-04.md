---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSM-04
group: OS管理
product: OS
atoms_primary: 82
atoms_secondary: 45
issue_projection: none
---

# RUL-OSM-04（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

秘密・個人情報・認証情報を、文書・規則・例・log・証跡・AIへの入力に出さない。検出したら記録の前に拒否する。

## 主として対応づいた規則（82件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-025` | エージェントは文書・規則・例・監査証跡・出力にsecrets、PII、credentialsを含めない。 | safety_security | prose／hook | AGENTS.md:288-288; CLAUDE.md:286-286; CLAUDE.md:333-333; .claude/CLAUDE.md:234-234; .claude/agents/advisor-fable.md:58-58; .claude/commands/sdd-review.md:22-23; .claude/settings.json:18-25 |
| `RA-027` | Refactor Scoutとproject探索agentはsecrets、credential file、秘密鍵、.envおよび対象外の本番専用データを読まない。 | safety_security | prose | .claude/agents/refactor-scout.md:56-56; .claude/agents/pmo-project-explorer.md:31-31; .claude/agents/pmo-project-scout.md:41-41 |
| `RA-043` | 編集・shell hookはsecret-egress検査がexit 2を返した場合、対象操作を拒否する。 | safety_security | hook | .claude/hooks/work-guard.ts:44-48; .claude/hooks/git-command-guard.ts:34-39 |
| `RA-049` | BE API担当はrequest・responseログのPIIをmaskする。 | safety_security | prose | .claude/agents/be-api.md:63-64 |
| `RA-050` | DevOpsとsecurity担当は秘密情報を環境変数またはSecret Managerで管理し、.envをcommitしない。 | safety_security | prose | .claude/agents/devops-deploy.md:68-69; .claude/agents/security-audit.md:55-56 |
| `RA-051` | security担当は秘密情報をログへ出力せず、mask処理を行う。 | safety_security | prose | .claude/agents/security-audit.md:57-57 |
| `RA-061` | marketing scoutはユーザーが安全・承認済資料を明示提供していない限り、PIIを含むcustomer dataを使わない。 | safety_security | prose | .claude/agents/pdm-marketing-innovation.md:30-30 |
| `RB0-111` | operatorはboundaryへsecrets・token・PIIを書いてはならない。 | safety_security | prose | docs/governance/worker-context-boundary-operator-guide.md:32-32 |
| `RB0-175` | agent call path追加者は実行metadataを記録する一方、prompt・response本文・credentials・PIIをtelemetryへ記録しない。 | safety_security | prose | docs/skills/agent-cost-design.md:69-72 |
| `RB04-166` | 全員はsecretをgitへ含めず、環境変数/Secrets経由で使用し、.env等がgitignoreに含まれることを確認する。 | safety_security | prose／config | docs/governance/ai-dev-team-operations_v1.1.md:119-119; docs/governance/ai-dev-team-operations_v1.1.md:759-763 |
| `RB04-210` | 全員は顧客データ・PIIを不用意にdownloadせず、local機密を使用後速やかに削除し、画像・動画への映込みを確認する。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:769-775 |
| `RB04-212` | AI利用者は顧客データ・PIIをmaskしてから送信し、code学習利用がoffであることを確認し、secret入りcodeを生成させない。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:779-787 |
| `RB04-255` | AI利用者は社外秘・PII・顧客dataを送信前にfilterし、ZDR契約サービスを使い、高機密処理ではlocal LLMを活用し、入力をsanitizeする。 | safety_security | prose | docs/governance/ai-dev-team-concept_v1.1.md:263-273 |
| `RB04-291` | 登録された全改善sourceはredactionをdigest_onlyとして扱う。 | safety_security | config | config/universal-improvement-source-registry.v1.json:86-86; config/universal-improvement-source-registry.v1.json:147-147; config/universal-improvement-source-registry.v1.json:208-208; config/universal-improvement-source-registry.v1.json:269-269; config/universal-improvement-source-registry.v1.json:330-330; config/universal-improvement-source-registry.v1.json:391-391; config/universal-improvement-source-registry.v1.json:452-452; config/universal-improvement-source-registry.v1.json:513-513; config/universal-improvement-source-registry.v1.json:574-574; config/universal-improvement-source-registry.v1.json:635-635 |
| `RB05-028` | 例示された禁止事項では、開発者は.envをcommitせず、secrets・credentialsを変更しない。 | safety_security | prose | docs/governance/audit-framework.md:315-316 |
| `RB05-178` | product projectionとagent context生成はclassification・redaction・retention・freshnessに違反するPII・secret・raw payloadの複製を拒否する。 | safety_security | prose | docs/governance/infinity-loop-system-assertion-cases.md:100-100; docs/governance/infinity-loop-system-assertion-cases.md:428-428 |
| `RB05-252` | connector registryはcredentialのreferenceだけを保存し、不完全contractやsecret本文の混入を拒否する。 | safety_security | prose | docs/governance/infinity-loop-system-assertion-cases.md:380-380 |
| `RB06-080` | Kimi guardはSSH・GPG・AWS・env・credential・secret・DB・state・設定等の機微pathへの読書きを拒否する。 | safety_security | hook | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:109-118; docs/governance/kimi-code-extension-security-audit-2026-08-06.md:132-132 |
| `RB06-126` | worker隔離検査は隔離外実行と機密委譲を拒否し、機密以上またはopt-out未完了のデータ委譲を遮断する。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:62-62; docs/governance/infinity-loop-assertion-coverage-ledger.md:195-195 |
| `RB06-141` | connector registryはcredentialのreferenceだけを保存し、不完全contractとsecret本文混入を拒否する。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:91-91 |
| `RB06-162` | payload払い出しはsparse構成とsecret scanを検査し、履歴込みまたはscan未PASSの払い出しを拒否する。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:135-135 |
| `RB06-180` | product projectionとagent context生成はclassification・redaction・retention・freshnessに違反するデータ複製を拒否する。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:175-175 |
| `RB06-280` | 証拠作成者は正規化evidenceへsecret・PII・raw transcriptを保存しない。 | safety_security | prose | docs/governance/repository-structure.md:119-119 |
| `RB07-042` | AIは注入scriptでcookieやstorage内の秘密を読まず、JavaScript実行を読取専用の状態検査に限り、挙動変更やデータ持出しを行わない。 | safety_security | prose | docs/skills/browser-testing-and-screen-verification.md:131-132 |
| `RB07-125` | 担当者はguardrailが0であることを確認し、commit対象のAPI key・session token・個人絶対pathを除去して.envを非追跡にする。 | safety_security | prose／gate | docs/skills/security-and-hardening.md:61-63 |
| `RB07-126` | テスト作成者はfixtureに実credential風文字列を使わずFAKE_KEY_FOR_TESTINGを使い、guardrailがこれを除外しなければ改善を起票する。 | safety_security | prose | docs/skills/security-and-hardening.md:64-66 |
| `RB07-131` | 担当者はdocs・handover・auditの新規ファイルへPIIやmachine識別情報を含めず、commit前に文字化け検査を行う。 | safety_security | prose／doctor | docs/skills/security-and-hardening.md:86-90 |
| `RB07-133` | 担当者はdocs・.helix・srcに触れるcommitごとにguardrailを実行する。 | safety_security | prose | docs/skills/security-and-hardening.md:114-115 |
| `RB07-193` | 担当者はdocs・state・memory・audit・provider evidenceに触れるcommit前にguardrailを実行し、秘密・session token・個人絶対pathがないことを確認する。 | safety_security | prose／gate | docs/skills/security.md:67-79 |
| `RB07-207` | 実装者は資格情報や鍵をコード・docs・commitへ書かない。 | safety_security | prose | docs/skills/code-minimalism.md:89-90 |
| `RB08-005` | 作業者はstate、docs、監査証跡、引継ぎファイルにAPI key・password・session tokenを含めない。 | safety_security | prose | docs/skills/threat-model.md:68-70 |
| `RB08-006` | 作業者は資格情報禁止対象のpathに触れるPLANをacceptする前にhelix guardrailを実行する。 | process_gate | prose | docs/skills/threat-model.md:68-70 |
| `RB08-080` | session logはmetadataだけを保存し、prompt本文・資格情報・PIIを保存しない。 | safety_security | prose | docs/skills/context-memory.md:73-76 |
| `RB08-137` | 観測機構はprompt・response本文、資格情報、PIIを保存せず、混入し得るcapture点ではinsert前にredactし、不在をtestする。 | safety_security | prose | docs/skills/harness-observability.md:61-61; docs/skills/harness-observability.md:70-74 |
| `RB08-174` | context設計者はcredential・API key・PIIをpromptへ含めない。 | safety_security | prose | docs/skills/context-engineering.md:76-76 |
| `RB08-206` | context注入処理はPII・資格情報・payload本文を事前redactし、資格情報不在をtestで確認する。 | safety_security | prose | docs/skills/llm-agent-routing.md:50-51; docs/skills/llm-agent-routing.md:71-71 |
| `RB08-338` | secret検査担当者はpush対象の全commit/blobを検査し、hookだけでなくCIでも再検証する。 | safety_security | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:33-33; docs/governance/github-operations-reference-audit-2026-07-18.md:41-41 |
| `RC0-071` | secret-scanは、対象文書とruntime stateに登録済みcredential markerを検出すると不合格にする。既定ではdummy等の注記を含む行を除外する。 | safety_security | lint | src/security/secret-policy.ts:31-72; src/lint/secret-scan.ts:34-84 |
| `RC0-072` | Secret-egress hookは、書込予定本文・shell command・git add対象・staged内容・outgoing commitにsecret様文字列を検出すると操作を拒否する。例示注記による除外は認めない。 | safety_security | hook | src/runtime/secret-egress-hook.ts:14-27; src/runtime/secret-egress-hook.ts:205-214; src/runtime/secret-egress-hook.ts:270-278 |
| `RC0-073` | Secret-egress hookは、対象の外部送信commandへcredential様の環境変数を渡す操作を拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:215-226 |
| `RC0-074` | Secret-egress hookは、対象の外部送信commandでcredential候補ファイルを送信する操作を拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:227-238 |
| `RC0-075` | Secret-egress hookは、定義されたenv／setによる環境一覧表示、およびprintenvを検出したcommandを拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:239-250 |
| `RC0-076` | Secret-egress hookは、cat・検索・表示系commandによってcredential候補ファイルの内容をtool出力へ展開する操作を拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:251-262 |
| `RC0-083` | Security egress-checkは、tool引数にcredential代入様の文字列が含まれる場合、errorとして不合格にする。 | safety_security | gate | src/runtime/security-credential-egress-guard.ts:38-39; src/runtime/security-credential-egress-guard.ts:64-72 |
| `RC0-087` | Guardrail ledgerは、evidence_pathにsecret様値が含まれる場合、判断記録の書込を拒否する。 | safety_security | gate | src/guardrail/ledger.ts:42-49 |
| `RC00-024` | 状態機械template計画器は、秘密情報らしい文字列を含む実行tripleを除去し、報告を不合格とする。 | safety_security | gate | src/runtime/state-machine-template-planner.ts:34-35; src/runtime/state-machine-template-planner.ts:71-88 |
| `RC00-030` | 拡張registryは、bundleが秘密設定を含む場合にエラーとし、install計画をskipにする。 | safety_security | gate | src/runtime/extension-preset-bundle-registry.ts:57-78 |
| `RC00-174` | agent観測report生成器は、transcriptに秘密情報らしい代入文字列があればerrorとし、blocked-sensitiveに分類する。 | safety_security | gate | src/runtime/agent-observability-provenance.ts:51-52; src/runtime/agent-observability-provenance.ts:163-170; src/runtime/agent-observability-provenance.ts:211-227 |
| `RC00-175` | agent観測report生成器は、commandに秘密情報らしい代入文字列があればdigest生成を拒否しerrorとする。 | safety_security | gate | src/runtime/agent-observability-provenance.ts:180-194 |
| `RC02-060` | doctorのsecret-scan checkは、既存secret lintの判定に加えて、検査対象が0件の場合や成果物読込失敗の場合にも失敗する。 | safety_security | doctor | src/doctor/index.ts:1546-1565 |
| `RC03-075` | feedback lifecycleデコード処理は、イベント全体にisSecretLikeが検出するsecret様tokenがある場合、イベントを拒否する。 | safety_security | gate | src/policy/feedback-lifecycle.ts:227-230; src/security/secret-policy.ts:7-11 |
| `RC03-087` | feedback ackまたはsurface処理は、入力全体にisSecretLikeが検出するsecret様tokenがある場合、操作を拒否する。 | safety_security | gate | src/policy/feedback-lifecycle.ts:403-409; src/policy/feedback-lifecycle.ts:518-530 |
| `RC03-153` | guardrail decision記録処理は、不変条件検査がevidence_path内のsecret様値を検出した場合、DB記録前に例外で拒否する。 | safety_security | gate | src/guardrail/ledger.ts:42-49 |
| `RC04-158` | テスト証拠記録器は、evidence_pathにsecret検出パターンがあればエラーにしてDB記録しない。 | safety_security | gate | src/workflow/contracts.ts:59-60; src/workflow/contracts.ts:71-87 |
| `RD00-014` | adapterは、子プロセスへ渡すHTTP・HTTPS proxy URLからユーザー名とパスワードを除去し、不正URLは渡さない。 | safety_security | config | src/runtime/adapter.ts:590-615 |
| `RD00-132` | CI telemetry検証は、任意の階層のkeyがraw log・stdout・stderr・資格情報・秘密・token・PII等の禁止patternに一致した場合、拒否する。 | safety_security | ci | src/runtime/ci-execution-telemetry.ts:255-256; src/runtime/ci-execution-telemetry.ts:346-359 |
| `RD01-046` | 旧note移行処理は、本文が空白だけ、secret判定、またはPII判定に該当するnoteを除外する。 | safety_security | gate | src/runtime/continuation.ts:981-984 |
| `RD01-136` | feedback処理は、保存するsummaryとreason、および正常分類結果のreasonにsanitizeを適用する。 | safety_security | gate | src/runtime/forced-stop.ts:140-145; src/runtime/forced-stop.ts:166-175 |
| `RD03-012` | secret egress hookは、書込み案・shell command・Git送出対象のscanがsecret類似情報を検出した場合、注釈付き例も許容せずexit 2で遮断する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:14-27; src/runtime/secret-egress-hook.ts:205-214; src/runtime/secret-egress-hook.ts:270-278 |
| `RD03-013` | secret egress hookは、違反報告に秘密値を出力せず、最大8件のパス・行・markerを表示する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:17-26 |
| `RD03-019` | secret egress hookは、指定の外部送信commandとcredential候補環境変数の参照が同じcommandに含まれる場合、broker外の送出として拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:215-225 |
| `RD03-020` | secret egress hookは、指定の外部送信commandに.env・秘密鍵・credential候補ファイルの表記が含まれる場合、拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:227-237 |
| `RD03-021` | secret egress hookは、引数なしenv/setによる環境表示またはprintenvに一致するcommandを拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:239-249 |
| `RD03-022` | secret egress hookは、cat/head/tail/less/more/sed/awk/rg/grepとcredential候補パスが同じcommandに含まれる場合、内容の出力を拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:251-261 |
| `RD03-027` | egress dry-run評価は、tool引数に秘密名と値の代入に似た文字列が含まれる場合、errorとして不合格にする。 | safety_security | gate | src/runtime/security-credential-egress-guard.ts:38-39; src/runtime/security-credential-egress-guard.ts:64-72 |
| `RD03-030` | session logのsanitizeは、秘密名に似た代入値をマスクし、要約を最大120文字に制限する。 | safety_security | hook | src/runtime/session-log.ts:130-140 |
| `RD03-031` | session logのtool要約は、tool名と対象pathだけを記録し、引数値やファイル内容を載せない。pathのないBashでは分類済み検証verbまたは固定のbash表記だけを残す。 | safety_security | hook | src/runtime/session-log.ts:142-155 |
| `RD03-203` | source admissionは、observation内の任意深さのfield名がraw output・credential・secret・password・key・token・PIIの禁止familyに分類される場合、拒否する。 | safety_security | gate | src/runtime/universal-improvement-source-registry.ts:455-521; src/runtime/universal-improvement-source-registry.ts:1125-1136 |
| `RD04-137` | isolation policy認証器は、task sensitivityがnon_secretでない、またはstdin・引数にsecretらしい内容が検出された場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-policy.ts:100-106 |
| `RD09-142` | relation graph投影は、検証証跡のrawMcpResponse・browserTrace・providerTranscript・secret・screenshotBlobを投影行へ複製せず、除外した非空field数をinfo findingで記録する。 | safety_security | lint | src/lint/relation-graph.ts:96-133 |
| `RD10-122` | semantic boundary gateはsemantic sourceにcredential参照の規定patternを検出した場合に失敗させる。 | safety_security | lint／gate | src/lint/semantic-boundary.ts:56-56; src/lint/semantic-boundary.ts:215-225 |
| `RD11-035` | MCP設定生成器は、env:参照でなく、credential用prefixに一致するか32文字以上の環境変数値をinline credentialとしてerrorにする。 | safety_security | lint | src/lint/verification-profile-safety.ts:41-47; src/lint/verification-profile-safety.ts:99-112 |
| `RD11-048` | 標準runnerは、全profileのauthEnvに列挙された環境変数を子プロセスへ渡してはならない。 | safety_security | lint | src/lint/verification-profile.ts:130-140; src/lint/verification-profile.ts:152-157 |
| `RD11-141` | activation readiness検査は、外部境界がある場合、no_secret_pii_checkの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | safety_security | lint | src/lint/version-up-readiness.ts:539-539; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RE01-087` | 記録処理はDBへ必要なmetadataだけを保存し、transcript・secrets・PIIを保存してはならない。 | safety_security | prose | docs/governance/helix-harness-requirements_v1.2.md:1284-1284 |
| `RE01-099` | 外部toolの証拠収集者はPLAN・sessionへ紐づく、redaction済みでサイズを制限したmetadataを残し、生出力を保存してはならない。 | safety_security | prose | docs/governance/helix-harness-requirements_v1.2.md:1386-1402 |
| `RE01-103` | export処理はrender前にredactionし、transcript・secrets・PIIや未承認のraw screenshot/browser資料を出力してはならない。 | safety_security | prose | docs/governance/helix-harness-requirements_v1.2.md:1438-1442 |
| `RE01-212` | 配布担当者はdogfoodのPLAN・設計・state・DB・memory・credential・PII・個人絶対パス・内部監査資料をpackageへ含めず、consumer向けに許可されたruntime資産だけを含める。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:306-309 |
| `RE01-245` | 送信判定器はdata classとsinkを分離して評価し、credential・PII・archive・unknown dataのegressを拒否する。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:467-467 |
| `RE01-251` | receipt処理はraw command・secret・PII・個人絶対パスを出力せず、対象driftを検出したら新しいpreflightを要求する。自動retryで通してはならない。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:486-488 |
| `RF00-005` | ループadapterは、workerの実行失敗例外にstderr本文を埋め込まず、stderrのSHA-256 digestとUTF-8バイト長を記載する。 | safety_security | gate | src/orchestration/loop-bridge.ts:165-171; src/orchestration/loop-bridge.ts:200-204 |
| `RF01-013` | memory昇格通知のID生成器は、session IDを直接埋め込まず、SHA-256の先頭24桁へ変換した参照値を通知IDに使う。 | memory_context | gate | src/runtime/memory-promotion.ts:54-60 |

## 副として対応づいた規則（45件）

`RA-029`、`RA-060`、`RB04-143`、`RB04-250`、`RB04-252`、`RB04-253`、`RB04-269`、`RB04-281`、`RB05-191`、`RB05-194`、`RB05-326`、`RB06-167`、`RB06-222`、`RB06-232`、`RB06-250`、`RB06-274`、`RB06-283`、`RB07-115`、`RB07-194`、`RB07-257`、`RB08-342`、`RB09-044`、`RB09-049`、`RC0-021`、`RC0-077`、`RC0-078`、`RC0-079`、`RC0-080`、`RC00-209`、`RC00-228`、`RC00-231`、`RC02-151`、`RD03-014`、`RD03-015`、`RD03-016`、`RD03-017`、`RD03-023`、`RD03-024`、`RD11-095`、`RE01-195`、`RE01-205`、`RE01-210`、`RE01-248`、`RF00-019`、`RG17-010`
