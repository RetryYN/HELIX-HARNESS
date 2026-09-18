---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-COR-04
group: コア
product: OS
atoms_primary: 1312
atoms_secondary: 843
issue_projection: none
---

# RUL-COR-04（コア／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

入力・設定・schema・pathを検証し、不正・未知・検証不能はfail-closeで拒否する。fail-openにする箇所は意図を明示する。

## 主として対応づいた規則（1312件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-031` | Node側はPython出力のcommand・SQL・absolute path・codeを実行せず、proposalをschema・digest・authority policyで再検証する。 | safety_security | prose | AGENTS.md:122-123; .claude/CLAUDE.md:246-247 |
| `RA-037` | work-guardはstdin読取失敗や入力・Git・state・transaction内部エラーをfail-closeとし、guard不調を編集許可へ縮退させない。 | safety_security | prose／hook | .claude/hooks/work-guard.ts:20-21; .claude/hooks/work-guard.ts:37-43 |
| `RA-042` | Git guardは入力JSON解析失敗またはguard adapter内部例外が起きた場合、exit 2で拒否する。 | safety_security | hook | .claude/hooks/git-command-guard.ts:25-31; .claude/hooks/git-command-guard.ts:61-64 |
| `RA-046` | Agent guardはstdin読取失敗、空入力、不正JSON、検証不能なstateをfail-closeで拒否する。 | safety_security | prose／hook | .claude/CLAUDE.md:152-152; .claude/hooks/agent-guard.ts:44-62 |
| `RA-047` | エージェントは明示されたhookのfail-open・fail-close設計を守り、hook failureを黙って無視しない。 | safety_security | prose | .claude/CLAUDE.md:235-235 |
| `RA-071` | harnessはregistry登録descriptor、strict JSONL、資源上限、semantic contract、Node再検証と単一transaction commitを満たすPython coreだけを受け入れる。 | tooling_runtime | prose | AGENTS.md:121-123 |
| `RA-074` | hook実行時のCLAUDE_PROJECT_DIRはrepository rootを指す。 | tooling_runtime | prose | .claude/CLAUDE.md:261-261 |
| `RA-081` | Codex hook設定はtop-level keyをdescriptionとhooksだけに限定し、$commentを追加しない。 | tooling_runtime | config | .codex/hooks.json:2-2 |
| `RA-088` | hook設定はSessionStartでsession startをfail-openとして呼び、timeoutをClaude 15秒・Codex 90秒にする。 | tooling_runtime | config／hook | .claude/settings.json:42-53; .codex/hooks.json:42-53; .claude/CLAUDE.md:38-38 |
| `RA-089` | hook設定は対象編集・shell toolの終了後にpost-tool-useをfail-openで呼び、timeoutをClaude 5秒・Codex 30秒にする。 | tooling_runtime | config／hook | .claude/settings.json:54-66; .codex/hooks.json:54-66; .claude/CLAUDE.md:39-39 |
| `RA-090` | hook設定はStop時にsession summaryをfail-openで呼び、timeoutをClaude 5秒・Codex 60秒とし、Codexには--quietを付ける。 | tooling_runtime | config／hook | .claude/settings.json:67-77; .codex/hooks.json:79-90; .claude/CLAUDE.md:40-40 |
| `RA-091` | hook設定はSubagentStop時にslot解放をfail-openで呼び、timeoutをClaude 5秒・Codex 30秒とし、Codexには--quietを付ける。 | tooling_runtime | config／hook | .claude/settings.json:90-101; .codex/hooks.json:67-78; .claude/CLAUDE.md:41-41 |
| `RA-093` | session-log shimは子commandやhookの失敗でClaude作業を止めず、最終的にexit 0を返す。 | tooling_runtime | hook | .claude/hooks/session-log.ts:10-11; .claude/hooks/session-log.ts:40-53 |
| `RA-201` | PLAN作成者はkind・layer・status・dependencies・review_evidenceを現行schemaに適合させる。 | process_gate | prose／lint | .claude/CLAUDE.md:53-54; .claude/commands/sdd-plan.md:27-27 |
| `RB0-040` | 安全境界の保守者はfail-close判定・allowlist・承認対象を設定で緩められる形へ外部化せず、コード正本とテストで固定する。 | safety_security | prose | docs/governance/coding-rules.md:130-131 |
| `RB0-073` | PR作成者はallowed path familyを必要最小限のrepo-relative範囲にし、絶対path・traversal・wildcard・空指定・root全体を指定しない。 | safety_security | gate | docs/governance/github-operation-rules.md:53-53 |
| `RB0-113` | boundary作成者は宣言された全必須fieldを持たせ、workflow_style・case_model・specialist_processを指定された許容値から選ぶ。 | tooling_runtime | gate | docs/governance/worker-context-boundary-operator-guide.md:41-65 |
| `RB0-115` | boundary検査側はgoal_id・behavior_contract_id・responsibility_ownerが空または空白だけなら拒否する。 | safety_security | gate | docs/governance/worker-context-boundary-operator-guide.md:72-72 |
| `RB0-116` | boundary検査側はallowed_pathsを一件以上必須にし、pathをrepository相対に限定して外へ出る表現を拒否する。 | safety_security | gate | docs/governance/worker-context-boundary-operator-guide.md:73-74 |
| `RB0-117` | boundary検査側はallowed_pathsおよびforbidden_pathsの各配列内の重複を拒否する。 | safety_security | gate | docs/governance/worker-context-boundary-operator-guide.md:75-75 |
| `RB0-118` | boundary検査側はallowed_pathsとforbidden_pathsに包含関係がある場合に拒否する。 | safety_security | gate | docs/governance/worker-context-boundary-operator-guide.md:76-77 |
| `RB04-147` | agent-slot記録はfireからreleaseを機械記録し、その記録処理はfail-openとし、5分超未releaseのslotをdoctorで表面化する。 | tooling_runtime | prose／doctor | docs/governance/helix-harness-concept_v3.1.md:1242-1243 |
| `RB04-292` | 登録された全改善sourceの失敗時処置はfail-closeとする。 | process_gate | config | config/universal-improvement-source-registry.v1.json:87-87; config/universal-improvement-source-registry.v1.json:148-148; config/universal-improvement-source-registry.v1.json:209-209; config/universal-improvement-source-registry.v1.json:270-270; config/universal-improvement-source-registry.v1.json:331-331; config/universal-improvement-source-registry.v1.json:392-392; config/universal-improvement-source-registry.v1.json:453-453; config/universal-improvement-source-registry.v1.json:514-514; config/universal-improvement-source-registry.v1.json:575-575; config/universal-improvement-source-registry.v1.json:636-636 |
| `RB05-042` | 機械判定はfail-closeし、exit codeと構造化レポートを出力する。 | evidence_claim | gate | docs/governance/audit-framework.md:494-494 |
| `RB05-162` | worker supervisorは非対応major version、不正JSON、schema違反、oversize、sequence gap、payload digest不一致を拒否し、異常resultを正本化しない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:67-70; docs/governance/infinity-loop-system-assertion-cases.md:77-77; docs/governance/infinity-loop-system-assertion-cases.md:425-425 |
| `RB05-168` | 同一input・config・versionの再実行でartifactやfindingのdigestが変わる場合、nondeterminism findingとして失敗させ、新結果をcurrentへ昇格しない。 | evidence_claim | prose | docs/governance/infinity-loop-system-assertion-cases.md:83-83; docs/governance/infinity-loop-system-assertion-cases.md:424-424 |
| `RB05-169` | engineがtemp rootから逸脱するartifact pathを返した場合、結果を隔離しartifact registryへ登録しない。 | safety_security | prose | docs/governance/infinity-loop-system-assertion-cases.md:84-84 |
| `RB05-172` | detectorはsuppression期限切れならfindingをopenにし、evidence digest欠落やseparator差だけでfingerprintが変わる結果を隔離してcommitしない。 | evidence_claim | prose | docs/governance/infinity-loop-system-assertion-cases.md:90-92 |
| `RB05-174` | product schemaが登録値と異なる場合は隔離してcurrent昇格を拒否し、provenance・freshness・schema・authorityを満たすprojectionだけをcurrentにする。 | process_gate | prose | docs/governance/infinity-loop-system-assertion-cases.md:95-95; docs/governance/infinity-loop-system-assertion-cases.md:349-349 |
| `RB05-188` | path検証はroot外を指すsymlink経由のwriteを拒否する。 | safety_security | prose | docs/governance/infinity-loop-system-assertion-cases.md:125-125 |
| `RB05-226` | 同一入力・rule・versionからgraph、translation、layer extractionを再導出して非決定的な結果となる場合、隔離してcurrentや新atomへ反映しない。 | evidence_claim | prose | docs/governance/infinity-loop-system-assertion-cases.md:250-250; docs/governance/infinity-loop-system-assertion-cases.md:258-258; docs/governance/infinity-loop-system-assertion-cases.md:294-294 |
| `RB05-235` | requirement revisionの欠番append、acceptance意味を変えるrename、適用対象への偽N/A、child集合が不足したsplitを拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:285-289 |
| `RB05-239` | layer templateのrequired field空欄・TBD・未知fieldを拒否し、template version変更後の旧ledgerをstaleにする。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:295-298 |
| `RB05-249` | intakeはGitHub eventとユーザー指示をmode・Reverse・Forward target付きcontractへ正規化し、必須field欠落を拒否して完全版だけにversionとdigestを与える。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:346-346; docs/governance/infinity-loop-system-assertion-cases.md:362-362 |
| `RB05-254` | stdio IPCはstdoutだけをprotocolとして扱い、JSON Lines envelopeの全必須項目を検証する。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:408-408 |
| `RB05-256` | intakeとworkerはIssue・PR・ZIP・外部data内の実行誘導を命令として実行せず、metadataとevidenceを分離する。 | safety_security | prose | docs/governance/infinity-loop-system-assertion-cases.md:416-416 |
| `RB05-265` | ZIP再生成検査はentry数703、重複pathなし、暗号化なし、symlinkなし、絶対path・親参照なし、CRC異常なしをassertし、未分類entryがあれば失敗する。 | safety_security | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:115-126; docs/governance/infinity-loop-source-snapshot-manifest.md:154-154 |
| `RB05-269` | source captureはcurrent receiptとsealed local mirrorだけを読み、network・fetch・checkoutを行わず、2 receiptの一方でもmissing・stale・driftedならBLOCKEDとしてcapture planを作らない。 | safety_security | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:202-204 |
| `RB05-272` | path分類前にNUL走査でtab/LFを含むpathを確認し、一件でもあれば行区切りcommandを使わずNUL-safe extractorへ切り替える。 | tooling_runtime | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:265-266 |
| `RB05-304` | entry分類はversion付きruleと決定的reason codeを使い、拡張子だけでgenerated/runtimeを決めず、未該当をotherで隠さずunclassifiedにする。 | process_gate | prose／gate | docs/governance/infinity-loop-source-atomization-contract.md:254-256 |
| `RB05-312` | coverage edge relationは指定9種だけを許し、追加時はschema版更新とmigrationを要求する。 | process_gate | config／gate | docs/governance/infinity-loop-source-atomization-contract.md:381-384 |
| `RB06-010` | Admission処理は分類不能、分類間矛盾、根拠欠落をfail-closeする。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:150-156 |
| `RB06-011` | Admission処理は定義された六つの判定結果のいずれかを返し、曖昧な成功状態を返さない。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:158-161 |
| `RB06-035` | 分類器は未知文書を語彙だけでsafeへ昇格させず、conflictとして扱う。 | process_gate | ci | docs/governance/l12-hybrid-current-authority-disposition-2026-07-19.md:267-267 |
| `RB06-062` | workflow出力はtyped identityと登録済みcommand IDに限定し、raw commandとlegacy identityを出力しない。 | tooling_runtime | config | config/workflow-execution-policy.v1.json:13-24 |
| `RB06-063` | workflow policyは未対応identityをfail-closeする。 | process_gate | config | config/workflow-execution-policy.v1.json:18-24 |
| `RB06-064` | route_evalはresolvedだけをexit 0とし、unknown・decision_required・unsupportedをexit 2、ambiguous・approval_requiredをexit 1で返す。 | process_gate | config | config/workflow-execution-policy.v1.json:57-85 |
| `RB06-085` | Kimi guardはALLOW・DENYを監査logへ残し、stdinをJSON解析できない場合は警告を記録してallowで終了する。 | tooling_runtime | hook | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:74-101; docs/governance/kimi-code-extension-security-audit-2026-08-06.md:142-143 |
| `RB06-108` | product ingestionはprovenance・freshness・schema・authorityを備えたprojectionだけをcurrentにする。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:45-45 |
| `RB06-129` | Issue Admissionは必須field欠落版を全て拒否し、完全版だけにversionとdigestを付ける。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:71-71 |
| `RB06-152` | Layer Ledger Registryは全layerの型と原子的row revisionを決定的に登録し、欠落typeを拒否する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:114-114 |
| `RB06-161` | worker出力の再検証はschema・digest・FS差分を検査し、scope外diffと未検証出力の実行を拒否する。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:134-134 |
| `RB06-168` | IPCはstdoutだけをprotocolとして扱い、全必須envelope fieldを検証する。 | tooling_runtime | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:150-150 |
| `RB06-169` | Nodeはschema検証済みPython resultだけをtransaction commitする。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:151-151 |
| `RB06-179` | IPCは不正JSON・schema違反・oversize・欠番・crash・timeout・cancel・backpressure・親消失をfail-closeし、partial resultを正本化しない。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:172-172 |
| `RB06-213` | prototype検証はsurface割当済みの対象にnone用fieldを付けることを禁止する。 | process_gate | config | config/requirement-discovery-event-schema.json:166-167 |
| `RB06-222` | session log処理はfail-openとsanitizeを維持する。 | tooling_runtime | prose | docs/governance/helix-objective-evidence-audit.md:47-47 |
| `RB06-251` | NodeはPython出力のstrict schema・provenance・digest・lease/fence・policyを再検証してからcommitする。 | safety_security | prose | docs/governance/python-semantic-migration-ledger.v1.yaml:20-20 |
| `RB06-293` | model schemaは安全なprovider ID patternとfamily allowlistを使い、shell metacharacterを含むmodel値を拒否する。 | safety_security | config | docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:96-104 |
| `RB06-294` | Windows command-script adapterはschema経路を迂回したunsafe argvもshell文字列化前に拒否する。 | safety_security | prose | docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:105-111 |
| `RB06-302` | detection findingのresolved判定はresidual_riskを必須とし、不正なstatus組合せをDBで拒否する。 | process_gate | config | docs/governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md:148-149 |
| `RB07-018` | 配布更新確認はgateにせずfail-openの助言とし、consumer cwdのoriginを配布元として読まない。 | tooling_runtime | prose | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:67-75 |
| `RB07-196` | hookはエラー時にexit 0を返してはならず、担当者は全failure modeをL5設計へ列挙する。 | safety_security | prose／hook | docs/skills/security.md:90-91 |
| `RB07-249` | legacy adapterはsource token・変換先・warning・versionをreceiptへ残し、一方向変換のみ許可して曖昧・複数候補・未登録値を推測せず拒否する。 | tooling_runtime | prose | docs/governance/route-classification-surface-inventory-2026-08-15.md:85-86 |
| `RB07-310` | startup是正担当者は文書・commandをcanonical pairとtyped axisへ収束させ、QA閾値をRequirement/NFR policyへ束縛してunknownを拒否する。 | process_gate | config | docs/governance/effective-agent-startup-followup-registry.json:79-85 |
| `RB08-008` | hookはstdin JSONをschema検証し、不正payloadを黙って無視せず拒否する。 | safety_security | hook | docs/skills/threat-model.md:73-74 |
| `RB08-207` | RAG設計者はchunk境界・類似閾値・no-match fallback・typed output schemaを固定し、空contextは黙って渡さずcall前にthrowしてその経路をtestする。 | process_gate | prose | docs/skills/llm-agent-routing.md:53-56; docs/skills/llm-agent-routing.md:68-68 |
| `RB08-218` | L3 freezeは対象marker不在・digest不一致・canonical metadata欠落を拒否する。 | process_gate | gate | docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:18-18 |
| `RB08-298` | 原稿保全検証者は保全先リンク欠落・存在しないpath・逆参照欠落を拒否する。 | evidence_claim | prose | docs/governance/request-source-cleanup-2026-09-06.md:51-51 |
| `RB08-308` | GitHub admission・Issue closure・bootstrapはproseでなく共通canonical decoderを使い、current admissionはv3のみ、v2はhistorical読取互換に限定する。 | evidence_claim | gate | docs/governance/issue-514-cross-review-admission-symmetry-closure.md:16-18 |
| `RB09-034` | Requirement JSON admissionの検証は、Markdown-only ID、partial shard、stale approval、baseline改変、dual authority、ID重複をfail-closeする。 | process_gate | prose | docs/governance/issue-396-mic-requirement-json-closure.md:14-15 |
| `RC0-016` | Agent guardは、allowRawが有効な場合、blockOrBypass経由の違反を警告付きで通過させる。agent定義missing／unknownの直接拒否にはこの例外を適用しない。 | lane_delegation | hook | src/runtime/agent-guard.ts:87-95; src/runtime/agent-guard.ts:177-189 |
| `RC0-018` | Work guardは、tool入力やshell commandから編集対象pathを抽出できなかった場合、対象なしとして操作を通過させる。 | behavior_discipline | hook | src/runtime/work-guard.ts:175-196; src/runtime/work-guard-hook.ts:61-74 |
| `RC0-019` | Work・Git・machine-safety・secret-egressのhookは、不正なJSON入力を拒否する。Work hookは空入力も拒否する。 | tooling_runtime | hook | src/runtime/work-guard-hook.ts:51-59; src/runtime/git-command-guard-hook.ts:199-204; src/runtime/machine-safety-guard-hook.ts:22-31; src/runtime/secret-egress-hook.ts:199-204 |
| `RC0-020` | Work hookは、対象stateの取得やguard transaction中に例外が発生した場合、編集を拒否する。 | tooling_runtime | hook | src/runtime/work-guard-hook.ts:79-86; src/runtime/work-guard-hook.ts:167-169 |
| `RC0-029` | Git guardは、通常のcheckout対象についてrefとpathのidentityを解決するcontextがない場合、操作を拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:302-310; src/runtime/git-command-guard.ts:534-542 |
| `RC0-035` | Git guardとmachine-safety guardは、shell commandを完全に解析できない場合、操作を拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:515-527; src/runtime/machine-safety-guard.ts:275-278 |
| `RC0-036` | Git guardは、merge・rebase・cherry-pick・stash適用・am・applyの対象となる変更操作にworktree contextがない場合、拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:358-383; src/runtime/git-command-guard.ts:553-565 |
| `RC0-037` | Git guardは、変更操作のworktree identityがunknown、共有rootのforeign件数が不明、または件数が不正な場合、拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:566-579 |
| `RC0-041` | Push前guardは、push commandを完全に解析できない場合、pushを拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:55-57; src/runtime/git-command-guard-hook.ts:266-277 |
| `RC0-042` | Push前guardは、--tags・--all・--mirror・--repoを使用するpushを、対象集合の解決に未対応として拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:59-70 |
| `RC0-043` | Push前guardは、位置引数を解析できない場合、または位置引数が二つを超える場合、pushを拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:35-53; src/runtime/git-command-guard-hook.ts:71-72 |
| `RC0-044` | Push前guardは、remote削除の位置引数が二つでない場合、または削除対象にコロンが含まれる場合、操作を拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:73-77 |
| `RC0-045` | Push前guardは、現在branchまたはremoteを解決できない場合、あるいはremoteがローカルの「.」である場合、pushを拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:78-84 |
| `RC0-046` | Push前guardは、明示refspecがない場合、@{push}が指定remote配下の参照として一意に解決されなければ拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:85-91 |
| `RC0-047` | Push前guardは、push先branch名が許可文字形式を満たさない場合、拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:93-98 |
| `RC0-048` | Push前guardは、push元参照をcommitへ解決できない場合、拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:99-100 |
| `RC0-049` | Push前guardは、比較基準commitを解決できない場合、または対象commitのsubjectを読み取れない場合、pushを拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:101-120 |
| `RC0-056` | Machine-safety guardは、pipeでshellへ渡される入力を静的に検査できない場合、拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:111-124; src/runtime/machine-safety-guard.ts:282-283 |
| `RC0-057` | Machine-safety guardは、pipe先または入れ子shellのpayloadに動的構文が含まれる場合、拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:284-287; src/runtime/machine-safety-guard.ts:328-337 |
| `RC0-070` | Machine-safety hookは、参照されたinterpreter scriptをrepository内の検査可能な通常ファイルとして読めない場合、起動を拒否する。検査対象は2MiB以下に制限する。 | safety_security | hook | src/runtime/machine-safety-guard-hook.ts:36-60 |
| `RC0-078` | Secret-egress hookは、Git走査対象の内容が2MiBを超える場合、検証不能として操作を拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:57-71; src/runtime/secret-egress-hook.ts:280-284 |
| `RC0-079` | Secret-egress hookは、Git走査対象にNULを検出した場合、binaryを検証不能として操作を拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:59-74; src/runtime/secret-egress-hook.ts:280-284 |
| `RC0-080` | Secret-egress hookは、対象path・Git状態・outgoing基準等の取得に失敗し送信範囲を検証できない場合、操作を拒否する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:66-74; src/runtime/secret-egress-hook.ts:136-169; src/runtime/secret-egress-hook.ts:280-284 |
| `RC0-081` | Security egress-checkは、external toolのegress policyが未定義の場合、errorとして不合格にする。 | safety_security | gate | src/runtime/security-credential-egress-guard.ts:45-56; src/runtime/security-credential-egress-guard.ts:81-84 |
| `RC0-082` | Security egress-checkは、allowlist policyなのにallowed_hostsが空の場合、errorとして不合格にする。 | safety_security | gate | src/runtime/security-credential-egress-guard.ts:57-63 |
| `RC0-097` | 静的gateは、決定的checkの実行中に例外が発生した場合、gateを失敗させる。 | process_gate | gate | src/gate/static.ts:251-257 |
| `RC0-103` | state-db-schema-authorityは、実DBのschemaがfresh canonical schemaと完全一致しない場合、または比較失敗で不合格にする。実DB未生成の場合は検査を通過する。 | tooling_runtime | doctor | src/doctor/state-db-schema-authority.ts:21-63 |
| `RC0-122` | Loop停止判定は、未知の停止reason、または必要なthreshold／pathが欠ける停止規則を検出すると、loopを止めてescalateを返す。 | tooling_runtime | gate | src/orchestration/loop-stop-rules.ts:9-13; src/orchestration/loop-stop-rules.ts:44-66 |
| `RC0-128` | Loop effort budget判定は、各上限が有限の正数でない場合、limit_invalidとして継続を拒否する。 | tooling_runtime | gate | src/orchestration/loop-effort-budget.ts:80-82; src/orchestration/loop-effort-budget.ts:113-116; src/orchestration/loop-effort-budget.ts:165-201 |
| `RC0-129` | Loop effort budget判定は、stateにeffortBudgetがない場合、このbudget検査による継続制限を適用しない。 | tooling_runtime | gate | src/orchestration/loop-effort-budget.ts:40-48; src/orchestration/loop-effort-budget.ts:161-163 |
| `RC0-131` | Active PLAN選択は、入力が空、またはcanonical PLAN ID集合とexact matchしない場合、選択を拒否する。prefix一致は候補表示だけに使用する。 | memory_context | gate | src/policy/active-plan-selection.ts:14-27 |
| `RC0-132` | Windows process identity parserは、開始時刻出力が数字列でない場合、例外で拒否する。 | tooling_runtime | gate | src/policy/filesystem-durability.ts:20-23 |
| `RC0-144` | Workflow routingは、signal分類がunknownの場合、commandを決定せずclassification_unknownと終了code 2を返す。 | process_gate | gate／config | src/workflow/workflow-execution-routing.ts:130-149; config/workflow-execution-policy.v1.json:62-65 |
| `RC0-146` | Workflow routingは、分類がclassified・unknown・decision_requiredの正常な分岐へ解決しない場合、classification_ambiguousと終了code 1を返す。 | process_gate | gate／config | src/workflow/workflow-execution-routing.ts:130-149; config/workflow-execution-policy.v1.json:70-73 |
| `RC0-147` | Workflow routingは、適用policyがunsupportedの場合、commandを決定せずpolicy_unsupportedと終了code 2を返す。 | process_gate | gate／config | src/workflow/workflow-execution-routing.ts:152-176; config/workflow-execution-policy.v1.json:74-77 |
| `RC0-148` | Workflow routingは、適用policyがambiguousの場合、commandを決定せずpolicy_ambiguousと終了code 1を返す。 | process_gate | gate／config | src/workflow/workflow-execution-routing.ts:164-176; config/workflow-execution-policy.v1.json:78-81 |
| `RC0-152` | Workflow routingは、返却receiptのversion・digest・identity・policy・disposition・終了分類等がstrict schemaに適合しなければ拒否する。未定義fieldも認めない。 | process_gate | gate | src/workflow/workflow-execution-routing.ts:26-55; src/workflow/workflow-execution-routing.ts:138-149; src/workflow/workflow-execution-routing.ts:182-193 |
| `RC00-003` | native worker policyの読込器は、入力形状、正確なキー集合、schema/version、workerモデル、xhigh設定のいずれかが規定と異なる場合に失敗する。 | lane_delegation | config／gate | src/runtime/codex-native-worker-policy.ts:30-47 |
| `RC00-005` | 実行検証ログの書込器は、eventの完全性検証が不合格なら追記せず失敗する。 | evidence_claim | gate | src/runtime/run-debug.ts:43-57 |
| `RC00-006` | Issue metadata監査は、現在時刻が不正、またはstale時間が非有限値・負数の場合に失敗する。 | tooling_runtime | gate | src/runtime/issue-metadata-audit.ts:22-29 |
| `RC00-017` | 憲法template解決器は、template keyが空白ならエラーとする。 | tooling_runtime | gate | src/runtime/constitution-template-stack.ts:43-51 |
| `RC00-018` | 憲法template解決器は、同一keyの最高priorityが複数ある場合にエラーとする。 | tooling_runtime | gate | src/runtime/constitution-template-stack.ts:59-70 |
| `RC00-020` | 状態機械template計画器は、taskに適合するtemplateが選択できなければ検証を不合格とする。 | process_gate | gate | src/runtime/state-machine-template-planner.ts:54-60; src/runtime/state-machine-template-planner.ts:66-88 |
| `RC00-021` | 状態機械template計画器は、選択templateのallowed_toolsが空なら不合格とする。 | tooling_runtime | gate | src/runtime/state-machine-template-planner.ts:54-60 |
| `RC00-022` | 状態機械template計画器は、選択templateのtransitionsが空なら不合格とする。 | process_gate | gate | src/runtime/state-machine-template-planner.ts:54-60 |
| `RC00-025` | 状態機械tool policy判定は、明示policyがなければ自律runを拒否する。 | process_gate | gate | src/runtime/state-machine-tool-policy.ts:36-54 |
| `RC00-026` | 状態機械tool policy判定は、enforcementがunsupportedなら警告し、runを許可しない。 | tooling_runtime | gate | src/runtime/state-machine-tool-policy.ts:56-61; src/runtime/state-machine-tool-policy.ts:72-78 |
| `RC00-028` | 状態機械tool policy判定は、許可list外だが承認必須listにないtoolが要求された場合に警告する。 | tooling_runtime | gate | src/runtime/state-machine-tool-policy.ts:63-70 |
| `RC00-029` | 拡張registryは、community catalogでinstall_allowedがtrueでなければ警告し、install計画をskipにする。 | tooling_runtime | gate | src/runtime/extension-preset-bundle-registry.ts:48-55; src/runtime/extension-preset-bundle-registry.ts:64-78 |
| `RC00-033` | taxonomy審査は、sourceにtaxonomy familyがなければ不合格とする。 | process_gate | gate | src/runtime/harness-taxonomy-curation-policy.ts:55-62 |
| `RC00-049` | roster能力解決器は、roleが空白なら失敗する。 | lane_delegation | gate | src/runtime/agent-slots-roster.ts:42-56 |
| `RC00-050` | roster能力解決器は、要求capabilityが空白なら失敗する。 | lane_delegation | gate | src/runtime/agent-slots-roster.ts:58-69 |
| `RC00-052` | lint artifact書込器は、空path・絶対path・NUL入りpathを拒否する。 | safety_security | gate | src/runtime/lint-artifact-write-port.ts:43-44 |
| `RC00-053` | lint artifact書込器は、解決先がroot自身またはroot外になるpathを拒否する。 | safety_security | gate | src/runtime/lint-artifact-write-port.ts:45-52 |
| `RC00-054` | lint artifact書込器は、既存の書込対象がsymbolic linkなら拒否する。 | safety_security | gate | src/runtime/lint-artifact-write-port.ts:53-54 |
| `RC00-055` | lint artifact書込器は、rootがdirectoryでないかsymbolic linkなら拒否する。 | safety_security | gate | src/runtime/lint-artifact-write-port.ts:58-61 |
| `RC00-056` | lint artifact書込器は、root以下の親pathにdirectory以外またはsymbolic linkがあれば拒否する。 | safety_security | gate | src/runtime/lint-artifact-write-port.ts:62-69 |
| `RC00-059` | lint probe adapterは、commandが空またはNULを含む場合に実行を拒否する。 | safety_security | gate | src/runtime/lint-probe-adapter.ts:37-38 |
| `RC00-060` | lint probe adapterは、timeoutが正の安全な整数でないか設定上限を超える場合に実行を拒否する。 | tooling_runtime | gate | src/runtime/lint-probe-adapter.ts:39-44 |
| `RC00-061` | lint probe adapterは、引数が128個を超える場合に実行を拒否する。 | tooling_runtime | gate | src/runtime/lint-probe-adapter.ts:6-7; src/runtime/lint-probe-adapter.ts:45-45 |
| `RC00-062` | lint probe adapterは、UTF-8で8KiBを超える引数があれば実行を拒否する。 | tooling_runtime | gate | src/runtime/lint-probe-adapter.ts:6-7; src/runtime/lint-probe-adapter.ts:46-47 |
| `RC00-063` | lint probe adapter生成器は、timeout上限が正の安全な整数でなければ失敗する。 | tooling_runtime | gate | src/runtime/lint-probe-adapter.ts:55-59 |
| `RC00-064` | lint probe adapter生成器は、出力byte上限が正の安全な整数でなければ失敗する。 | tooling_runtime | gate | src/runtime/lint-probe-adapter.ts:55-61 |
| `RC00-065` | 文書metadata書込器は、空path・絶対path・NUL入りpathを拒否する。 | safety_security | gate | src/runtime/document-agent-metadata-write-port.ts:24-26 |
| `RC00-066` | 文書metadata書込器は、解決先がroot自身またはroot外なら拒否する。 | safety_security | gate | src/runtime/document-agent-metadata-write-port.ts:27-34 |
| `RC00-067` | 文書metadata書込器は、既存対象がsymbolic linkなら拒否する。 | safety_security | gate | src/runtime/document-agent-metadata-write-port.ts:35-36 |
| `RC00-068` | 文書metadata書込器は、直接の親directoryがdirectoryでないかsymbolic linkなら拒否する。 | safety_security | gate | src/runtime/document-agent-metadata-write-port.ts:40-45 |
| `RC00-069` | 文書metadata書込器の生成器は、rootがdirectoryでないかsymbolic linkなら失敗する。 | safety_security | gate | src/runtime/document-agent-metadata-write-port.ts:69-75 |
| `RC00-072` | 文書metadata整形器は、対象本文にfrontmatterがなければ失敗する。 | tooling_runtime | gate | src/runtime/document-agent-metadata-apply.ts:78-83 |
| `RC00-073` | 文書metadata適用計画器は、manifestがapply段階でないか修復対象外のfindingがあれば失敗する。 | process_gate | gate | src/runtime/document-agent-metadata-apply.ts:101-112 |
| `RC00-074` | 文書metadata適用計画器は、選択が空、または相対canonical pathの条件を満たさない選択があれば失敗する。 | safety_security | gate | src/runtime/document-agent-metadata-apply.ts:47-53; src/runtime/document-agent-metadata-apply.ts:113-115 |
| `RC00-075` | 文書metadata適用計画器は、manifestのdocumentsに含まれない選択pathを拒否する。 | safety_security | gate | src/runtime/document-agent-metadata-apply.ts:116-117 |
| `RC00-076` | 文書metadata適用計画器は、選択fileの元内容または提案metadataが取得できなければ失敗する。 | process_gate | gate | src/runtime/document-agent-metadata-apply.ts:118-123 |
| `RC00-078` | 文書report書込器は、空path・絶対path・NUL・逆slashを含むpathを拒否する。 | safety_security | gate | src/runtime/document-report-write-port.ts:41-43 |
| `RC00-079` | 文書report書込器は、解決先がartifact root自身またはその外なら拒否する。 | safety_security | gate | src/runtime/document-report-write-port.ts:44-47; src/runtime/document-report-write-port.ts:93-96 |
| `RC00-081` | 文書report書込器は、artifact rootへの経路または出力親経路にdirectory以外・symbolic linkがあれば拒否する。 | safety_security | gate | src/runtime/document-report-write-port.ts:57-76; src/runtime/document-report-write-port.ts:93-102 |
| `RC00-084` | 文書snapshot生成器は、非canonicalな相対pathをエラーとし、その対象を処理しない。 | tooling_runtime | gate | src/runtime/document-semantic-diff.ts:35-41; src/runtime/document-semantic-diff.ts:78-86 |
| `RC00-085` | 文書snapshot生成器は、同一pathが重複した場合にエラーとする。 | tooling_runtime | gate | src/runtime/document-semantic-diff.ts:88-95 |
| `RC00-086` | 文書snapshot生成器は、typed declaration parserがerror findingを返した場合にsnapshotを不合格とする。 | process_gate | gate | src/runtime/document-semantic-diff.ts:98-105; src/runtime/document-semantic-diff.ts:118-119 |
| `RC00-088` | CI branch base解決器は、event名がなければ失敗する。 | tooling_runtime | ci | src/runtime/ci-branch-base.ts:38-43 |
| `RC00-089` | CI branch base解決器は、candidate HEADが非zeroの小文字40桁SHAでなければ失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:5-9; src/runtime/ci-branch-base.ts:40-43 |
| `RC00-090` | CI branch base解決器は、pull_request時の明示base HEADが有効でなければ失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:44-47 |
| `RC00-091` | CI branch base解決器は、push時に指定された非zero baseが不正、またはcommitとして存在確認できなければ失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:48-51; src/runtime/ci-branch-base.ts:101-110 |
| `RC00-092` | CI branch base解決器は、GitHub照会が必要な経路でrepository identityがowner/name形式でなければ失敗する。 | tooling_runtime | ci | src/runtime/ci-branch-base.ts:53-56 |
| `RC00-093` | CI branch base解決器は、GitHub応答のobject・page配列・PR番号・base SHAが検査条件を満たさなければ失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:20-24; src/runtime/ci-branch-base.ts:66-82 |
| `RC00-094` | CI branch base解決器は、candidate HEADに一致するopen PRが複数あれば失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:69-76 |
| `RC00-096` | CI branch base解決器は、default branch名を取得できない場合に失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:91-95 |
| `RC00-097` | CI branch base解決器は、default branchのremote追跡HEADが有効なSHAでなければ失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:96-98 |
| `RC00-098` | CI branch base解決器は、merge-baseの結果が単一の有効SHAでなければ失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:32-35 |
| `RC00-099` | CI branch base解決器は、取得処理が例外終了した場合に正常baseを返さずexit code 1とし、公開する診断を固定形式に制限する。 | safety_security | ci | src/runtime/ci-branch-base.ts:101-110 |
| `RC00-100` | closure証拠probe判定は、repository pathとtop-levelが一致しなければblockedとする。 | evidence_claim | gate | src/runtime/closure-evidence-probe-context.ts:45-46; src/runtime/closure-evidence-probe-context.ts:66-77 |
| `RC00-104` | closure証拠probe判定は、git directoryまたはgit common directoryが空ならblockedとする。 | evidence_claim | gate | src/runtime/closure-evidence-probe-context.ts:71-71 |
| `RC00-105` | closure証拠probe判定は、origin remote URLが空ならblockedとする。 | evidence_claim | gate | src/runtime/closure-evidence-probe-context.ts:72-72 |
| `RC00-108` | 隔離worktree計画器は、git statusを取得できず状態がunknownなら警告して不合格とする。 | safety_security | gate | src/runtime/isolated-worktree-sandbox-runner.ts:40-53; src/runtime/isolated-worktree-sandbox-runner.ts:81-86 |
| `RC00-120` | author runtime証拠parserは、親数・bot flag・canonical base64 messageの3項形式を満たさない行を含む入力を拒否する。 | evidence_claim | gate | src/runtime/author-runtime-evidence.ts:69-98 |
| `RC00-121` | author runtimeの取得器は、GitHub取得が非0終了または証拠parse失敗なら失敗し、計測専用経路では空の証拠も拒否する。 | evidence_claim | gate | src/runtime/author-runtime-evidence.ts:119-144 |
| `RC00-126` | review lane closure生成器は、repository rootが絶対pathでなければ失敗する。 | tooling_runtime | gate | src/runtime/review-lane-closure.ts:70-74 |
| `RC00-128` | review lane closure生成器は、closure memberをstatできなければ失敗し、memberを読み飛ばさない。 | evidence_claim | gate | src/runtime/review-lane-closure.ts:76-88 |
| `RC00-129` | review lane closure生成器は、closure memberが通常fileでなければ失敗する。 | evidence_claim | gate | src/runtime/review-lane-closure.ts:89-89 |
| `RC00-130` | review lane closure生成器は、member本文を読めなければ失敗する。 | evidence_claim | gate | src/runtime/review-lane-closure.ts:90-96 |
| `RC00-131` | review provider実測器は、実行file pathが絶対pathでなければ失敗する。 | tooling_runtime | gate | src/runtime/review-lane-closure.ts:118-122 |
| `RC00-132` | review provider実測器は、binaryをstatできない場合または通常fileでない場合に失敗する。 | evidence_claim | gate | src/runtime/review-lane-closure.ts:123-130 |
| `RC00-133` | provider引継ぎ生成器は、fromとtoが同じruntimeなら失敗する。 | lane_delegation | gate | src/runtime/provider-handover.ts:58-64 |
| `RC00-142` | hook authority provider解決器は、providerが例外、不正形式またはok=falseを返した場合にauthority取得不可として失敗する。 | escalation_authority | gate | src/runtime/project-hook-authority-provider.ts:24-50 |
| `RC00-144` | assignment由来hook providerは、assignment取得失敗、snapshot検証失敗またはcapture例外の場合にauthority取得不可を返す。 | escalation_authority | gate | src/runtime/project-hook-assignment-provider.ts:70-106 |
| `RC00-145` | hook物理identity採取器は、device値が非負整数として表現できない場合に失敗する。 | evidence_claim | gate | src/runtime/project-hook-physical-adapter.ts:57-67 |
| `RC00-146` | hook物理identity採取器は、inode値が正整数として表現できない場合に失敗する。 | evidence_claim | gate | src/runtime/project-hook-physical-adapter.ts:57-67 |
| `RC00-147` | hook物理identity採取器は、platformがlinuxまたはdarwin以外なら未対応として失敗する。 | tooling_runtime | gate | src/runtime/project-hook-physical-adapter.ts:70-76 |
| `RC00-148` | GitHub Issue graph providerは、repositoryが規定のowner/name形式でなければ照会を拒否する。 | safety_security | gate | src/runtime/github-issue-native-graph-provider.ts:23-26 |
| `RC00-149` | GitHub Issue graph providerは、要求Issue番号が正の安全な整数でなければ照会を拒否する。 | tooling_runtime | gate | src/runtime/github-issue-native-graph-provider.ts:29-35 |
| `RC00-150` | GitHub Issue graph providerは、照会が非0終了した場合に取得失敗とする。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:89-95 |
| `RC00-151` | GitHub Issue graph providerは、応答がJSONとして解析できないかpayloadまたはdataがobjectでなければ失敗する。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:50-53; src/runtime/github-issue-native-graph-provider.ts:79-102 |
| `RC00-152` | GitHub Issue graph providerは、応答にrepository objectまたはIssue objectがなければ失敗する。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:103-105 |
| `RC00-153` | GitHub Issue graph providerは、観測Issue番号が要求番号と違えば失敗する。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:106-108 |
| `RC00-154` | GitHub Issue graph providerは、応答Issue番号が正の安全な整数でないかIssue IDが空文字列なら失敗する。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:55-58; src/runtime/github-issue-native-graph-provider.ts:106-111 |
| `RC00-155` | GitHub Issue graph providerは、nullでないparentがobjectと正の安全なIssue番号を持たなければ失敗する。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:112-118 |
| `RC00-156` | GitHub Issue graph providerは、関係connectionがobjectでないかnodesが配列でなければ失敗する。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:60-62 |
| `RC00-157` | GitHub Issue graph providerは、関係nodeがobjectでないか番号が正の安全な整数でなければ失敗する。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:63-68 |
| `RC00-158` | GitHub Issue graph providerは、pageInfoがobjectでないかhasNextPageがbooleanでなければ失敗する。 | evidence_claim | gate | src/runtime/github-issue-native-graph-provider.ts:69-72 |
| `RC00-162` | hosted preflight判定は、hosted面でwork guard判定が欠落していれば拒否する。 | safety_security | gate | src/runtime/hosted-preflight.ts:161-162; src/runtime/hosted-preflight.ts:173-180 |
| `RC00-168` | blind benchmark定義凍結器は、定義の厳密な形状・識別子・digest・risk・admission level・非空rubric・cost policyの検証に失敗した場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-definition.ts:74-89; src/runtime/worker-blind-definition.ts:129-133 |
| `RC00-169` | blind benchmark定義凍結器は、rubricの次元重複、不正な正整数weight、非有限・負の境界、min以上でないmaxを拒否する。 | evidence_claim | gate | src/runtime/worker-blind-definition.ts:90-109; src/runtime/worker-blind-definition.ts:132-133 |
| `RC00-170` | blind benchmark定義凍結器は、rubric weight合計が100でなければ拒否する。 | evidence_claim | gate | src/runtime/worker-blind-definition.ts:110-115; src/runtime/worker-blind-definition.ts:132-133 |
| `RC00-171` | blind benchmark定義凍結器は、duration weightが非有限・負、またはtoken weight・retry weightが0以外なら拒否する。 | evidence_claim | gate | src/runtime/worker-blind-definition.ts:110-115; src/runtime/worker-blind-definition.ts:132-133 |
| `RC00-173` | agent観測report生成器は、transcript fileを読めない場合に警告してそのfileをskipする。 | memory_context | gate | src/runtime/agent-observability-provenance.ts:151-161 |
| `RC00-193` | CI条件付きgate判定器は、未知のconditional gate IDを指定された場合に失敗する。 | tooling_runtime | ci／gate | src/runtime/preflight-gate-aggregation.ts:163-168 |
| `RC00-196` | 相談receipt記録器は、保存処理が失敗しても例外を再送せずfalseを返す。 | tooling_runtime | gate | src/runtime/escalation-consult-gate.ts:227-239 |
| `RC00-197` | 相談Stop gateは、transcript path・本文が取得できない場合、または最終assistant文からescalation意図を検出できない場合に停止を妨げない。 | escalation_authority | hook／gate | src/runtime/escalation-consult-gate.ts:101-128; src/runtime/escalation-consult-gate.ts:281-299 |
| `RC00-198` | 相談Stop gateは、escalationを検出してもreceiptが読取・解析不能なら警告して通す。 | escalation_authority | hook／gate | src/runtime/escalation-consult-gate.ts:167-194; src/runtime/escalation-consult-gate.ts:301-309 |
| `RC00-202` | 相談Stop gateは、override transactionの結果がallowed以外なら停止をblockする。 | escalation_authority | hook／gate | src/runtime/escalation-consult-gate.ts:324-344 |
| `RC00-203` | worker risk admissionは、入力の厳密な構造、2件以上の一意候補、有効なfinding・policy、非空benchmark・policy集合の検証に失敗した場合に拒否する。 | lane_delegation | gate | src/runtime/worker-risk-admission.ts:112-157; src/runtime/worker-risk-admission.ts:182-212 |
| `RC00-204` | worker risk admissionは、standalone findingが候補一覧外のcandidateを指す場合に拒否する。 | evidence_claim | gate | src/runtime/worker-risk-admission.ts:213-220 |
| `RC00-206` | worker risk admissionは、同じrisk classのbenchmark receiptが重複した場合に拒否する。 | evidence_claim | gate | src/runtime/worker-risk-admission.ts:222-227 |
| `RC00-215` | worker出力admissionは、schema digestが登録schemaへ解決できないか再計算digestと異なる場合に拒否する。 | tooling_runtime | gate | src/runtime/worker-output-admission.ts:315-317 |
| `RC00-216` | worker出力admissionは、schema定義が深さ・node数・property数上限、required整合、数値境界の検証を満たさなければ拒否する。 | tooling_runtime | gate | src/runtime/worker-output-admission.ts:6-8; src/runtime/worker-output-admission.ts:164-200; src/runtime/worker-output-admission.ts:318-319 |
| `RC00-217` | worker出力admissionは、出力が0byteまたは1MiB超なら拒否する。 | tooling_runtime | gate | src/runtime/worker-output-admission.ts:3-3; src/runtime/worker-output-admission.ts:320-322 |
| `RC00-218` | worker出力admissionは、UTF-8 BOM付き出力を非canonicalとして拒否する。 | tooling_runtime | gate | src/runtime/worker-output-admission.ts:323-324 |
| `RC00-219` | worker出力admissionは、UTF-8として厳密decodeできない出力を拒否する。 | tooling_runtime | gate | src/runtime/worker-output-admission.ts:325-329 |
| `RC00-220` | worker出力admissionは、JSON字句走査で深さ64・node数4096の上限超過、括弧不整合または文字列未終端を検出した場合に拒否する。 | tooling_runtime | gate | src/runtime/worker-output-admission.ts:4-5; src/runtime/worker-output-admission.ts:203-228; src/runtime/worker-output-admission.ts:331-331 |
| `RC00-221` | worker出力admissionは、JSON parseに失敗する出力を拒否する。 | tooling_runtime | gate | src/runtime/worker-output-admission.ts:332-337 |
| `RC00-222` | worker出力admissionは、入力本文がcanonical JSONの再生成結果と完全一致しなければ拒否する。 | evidence_claim | gate | src/runtime/worker-output-admission.ts:338-338 |
| `RC00-223` | worker出力admissionは、値が登録ASTの型・境界・必須key・追加key禁止・資源上限を満たさないかpayloadがobjectでなければ拒否する。 | tooling_runtime | gate | src/runtime/worker-output-admission.ts:235-278; src/runtime/worker-output-admission.ts:339-341 |
| `RC00-226` | Git remote入力検査は、空文字、option形式、ext::、制御文字または空白を含む指定を拒否する。 | safety_security | gate | src/runtime/git-argument-boundary.ts:4-20 |
| `RC00-227` | Git remote入力検査は、許可SCP形式に一致せずURL解析できない指定、またはhttps・ssh以外のprotocolを拒否する。 | safety_security | gate | src/runtime/git-argument-boundary.ts:1-1; src/runtime/git-argument-boundary.ts:21-29 |
| `RC00-228` | Git remote入力検査は、host欠落、password、HTTPS username、queryまたはfragmentがあるURLを拒否する。 | safety_security | gate | src/runtime/git-argument-boundary.ts:30-37 |
| `RC00-229` | Git revision入力検査は、空文字、先頭hyphen、制御文字または空白を含む指定を拒否する。 | safety_security | gate | src/runtime/git-argument-boundary.ts:43-46 |
| `RC00-230` | Git revision入力検査は、単一revisionまたは二点rangeとして分割できない指定や、空・禁止文字・先末尾dot・内部連続dotを持つatomを拒否する。 | safety_security | gate | src/runtime/git-argument-boundary.ts:2-2; src/runtime/git-argument-boundary.ts:47-60 |
| `RC00-231` | guard override transactionは、nonce・理由・operation classの長さ、理由の非空・改行禁止・秘密代入禁止、subject digest形式の検証に失敗した場合に拒否する。 | escalation_authority | gate | src/runtime/guard-override-transaction.ts:18-33; src/runtime/guard-override-transaction.ts:43-50 |
| `RC00-233` | guard override transactionは、監査commitが例外になった場合に例外適用を拒否する。 | escalation_authority | gate | src/runtime/guard-override-transaction.ts:51-59 |
| `RC00-235` | worker独立review検証器は、proposal出力が認証済みcapabilityでなければ拒否する。 | evidence_claim | gate | src/runtime/worker-review-receipt.ts:109-128 |
| `RC00-236` | worker独立review検証器は、reviewer出力が認証済みcapabilityでなければ拒否する。 | evidence_claim | gate | src/runtime/worker-review-receipt.ts:129-130 |
| `RC00-237` | worker独立review検証器は、receiptが厳密なkey集合・schema・digest形式・approve/reject verdictを満たさなければ拒否する。 | evidence_claim | gate | src/runtime/worker-review-receipt.ts:131-139 |
| `RC00-244` | project hook authority解決器は、入力がstrict schema検証を満たさなければreceiptを発行せず失敗する。 | escalation_authority | gate | src/runtime/project-hook-authority.ts:255-263 |
| `RC00-245` | project hook authority解決器は、物理証拠の採取方法と全rootのplatform・evidence kindが対応しなければ失敗する。 | evidence_claim | gate | src/runtime/project-hook-authority.ts:220-234; src/runtime/project-hook-authority.ts:265-272 |
| `RC00-250` | project hook authority解決器は、timeoutが正でないかhard ceilingを超える場合にlifecycle policyを拒否する。 | tooling_runtime | gate | src/runtime/project-hook-authority.ts:237-247; src/runtime/project-hook-authority.ts:301-308 |
| `RC00-251` | project hook authority解決器は、子終了猶予が負、上限超過、またはtimeoutとの合計がhard ceiling超過ならpolicyを拒否する。 | tooling_runtime | gate | src/runtime/project-hook-authority.ts:242-247; src/runtime/project-hook-authority.ts:301-308 |
| `RC00-253` | project hook authority解決器は、通知をbounded workerへ引き渡す場合、そのTTLが正でないかhard ceilingを超えるならpolicyを拒否する。 | tooling_runtime | gate | src/runtime/project-hook-authority.ts:248-252; src/runtime/project-hook-authority.ts:301-308 |
| `RC01-011` | 退役artifact loaderは、artifact pathが正規化済み相対pathでない、上位参照を含む、またはdispositionがretired_deletedでない場合、失敗させる。 | safety_security | lint | src/lint/artifact-retirement-authority.ts:70-81 |
| `RC01-012` | 退役artifact loaderは、artifact path一覧に重複があるか昇順でない場合、失敗させる。 | escalation_authority | lint | src/lint/artifact-retirement-authority.ts:84-87 |
| `RC01-015` | codex-hook-trustは、hooks/list出力の非空行をJSONとして解析できない場合、失敗させる。 | tooling_runtime | lint | src/lint/codex-hook-trust.ts:18-36 |
| `RC01-016` | codex-hook-trustは、hooks/listのid=2応答がない場合、失敗させる。 | tooling_runtime | lint | src/lint/codex-hook-trust.ts:38-39 |
| `RC01-017` | codex-hook-trustは、要求したrepository rootとcwdが一致する応答行がない場合、失敗させる。 | tooling_runtime | lint | src/lint/codex-hook-trust.ts:40-42 |
| `RC01-020` | codex-hook-trustは、runnerがCIまたはread-restrictedによる利用不能を返した場合、checked=0の成功として検査をスキップする。 | tooling_runtime | lint | src/lint/codex-hook-trust.ts:83-88; src/lint/codex-hook-trust.ts:100-109 |
| `RC01-021` | codex-hook-trustは、利用不能によるスキップに該当せずapp-serverの終了statusが0でない場合、失敗させる。 | tooling_runtime | lint | src/lint/codex-hook-trust.ts:110-111 |
| `RC01-022` | codex-hook-trustは、正常終了扱いでもrunner errorがあるかstdoutが空の場合、失敗させる。 | tooling_runtime | lint | src/lint/codex-hook-trust.ts:112-114 |
| `RC01-023` | 証拠ファイル検査は、repository root未指定、空path、NUL、POSIXまたはWindows絶対path、上位参照を含むpathを拒否する。 | safety_security | lint | src/lint/evidence-file-substance.ts:85-98 |
| `RC01-024` | 証拠ファイル検査は、realpathで解決した対象がrepository外の場合、拒否する。 | safety_security | lint | src/lint/evidence-file-substance.ts:38-41; src/lint/evidence-file-substance.ts:100-103 |
| `RC01-025` | 証拠ファイル検査は、対象が通常ファイルでない場合、拒否する。 | safety_security | lint | src/lint/evidence-file-substance.ts:104-105 |
| `RC01-026` | 証拠ファイル検査は、open後の対象が通常ファイルでない、link数が1でない、事前statとdevice・inodeが異なる、または解決先がrepository外の場合、拒否する。 | safety_security | lint | src/lint/evidence-file-substance.ts:106-119 |
| `RC01-028` | 証拠ファイル検査は、ファイルの解決・open・読取り等で例外が発生した場合、unreadableとして拒否する。 | evidence_claim | lint | src/lint/evidence-file-substance.ts:139-143 |
| `RC01-029` | gate-confirmは、gate台帳からstatusを1件も解析できない場合、不合格にする。 | process_gate | lint | src/lint/gate-confirm.ts:96-99 |
| `RC01-037` | L1/L2 gap-check loaderは、requirements-binding設定の読込み結果が不正の場合、例外で失敗させる。 | process_gate | lint | src/lint/l1-l2-gap-check.ts:102-110 |
| `RC01-046` | codex-hook-adapterは、hooks JSONを解析できない場合、不合格にする。 | tooling_runtime | lint | src/lint/codex-hook-adapter.ts:149-159 |
| `RC01-047` | codex-hook-adapterは、codexConfigToml入力が指定されているのに文字列でない場合、不合格にする。 | tooling_runtime | lint | src/lint/codex-hook-adapter.ts:164-167 |
| `RC01-054` | codex-hook-adapterは、失敗時停止が必要なguardに一致するcommandの中にblockOnFailure=trueが1件もない場合、不合格にする。 | safety_security | lint／config | src/lint/codex-hook-adapter.ts:215-217; src/lint/codex-hook-adapter-policy.ts:30-51 |
| `RC01-079` | requirements-doc-registry loaderは、祖先からpackage.jsonを持つrootを発見できない場合、失敗させる。 | tooling_runtime | lint | src/lint/requirements-doc-registry.ts:24-34 |
| `RC01-080` | requirements-doc-registry loaderは、registryのschemaがrequirements-doc-registry.v1でない場合、失敗させる。 | process_gate | lint | src/lint/requirements-doc-registry.ts:36-43 |
| `RC01-081` | requirements-doc-registry loaderは、canonicalまたはcompatibilityのpathが非空の.md文字列でない場合、失敗させる。 | process_gate | lint | src/lint/requirements-doc-registry.ts:44-48 |
| `RC01-084` | placeholder-depsは、対象文書のwaiting_layerがcompatibility層集合にない場合、不合格にする。 | process_gate | lint | src/lint/placeholder-deps.ts:31-34; src/lint/placeholder-deps.ts:82-88 |
| `RC01-089` | verifier-provider-mismatchは、JSONとして解析不能またはobjectでない証跡行を件数に加えるだけで、その理由では検査を失敗させない。 | evidence_claim | lint | src/lint/verifier-provider-mismatch.ts:55-66; src/lint/verifier-provider-mismatch.ts:83-89 |
| `RC01-106` | source-boundary評価は、edge種別がunknownの場合、allowにせずunspecifiedを返す。 | behavior_discipline | lint | src/lint/source-boundary-policy.ts:46-54; src/lint/coding-rules.ts:584-595 |
| `RC01-107` | source-boundary評価は、依存元または依存先ownerを解決できない場合、allowにせずunspecifiedを返す。 | behavior_discipline | lint | src/lint/source-boundary-policy.ts:55-68; src/lint/coding-rules.ts:584-595 |
| `RC01-111` | source-boundary評価は、期限付き例外の期限または評価日時を有効な日時として解釈できない場合、unspecifiedとする。 | process_gate | lint | src/lint/source-boundary-policy.ts:101-109; src/lint/source-boundary-policy.ts:168-174 |
| `RC01-117` | project-hookは、Claude settings文書をJSONとして解析できない場合、不合格にする。 | tooling_runtime | lint | src/lint/project-hook.ts:99-104; src/lint/project-hook.ts:125-130 |
| `RC01-122` | project-hookは、停止必須guardに一致するhookのblockOnFailureがtrueでない場合、不合格にする。 | safety_security | lint | src/lint/project-hook.ts:173-179 |
| `RC01-136` | green-command-digestは、repository rootが存在しない場合、またはPLAN・authority等の検査中に例外が発生した場合、不合格にする。 | evidence_claim | lint／doctor | src/lint/green-command-digest.ts:139-149; src/lint/green-command-digest.ts:174-179 |
| `RC01-139` | plan-compatibility-parentは、historical_provenanceを宣言しているのに型検査に失敗し、その違反tupleがbaseline外の場合、不合格にする。 | memory_context | lint | src/lint/plan-compatibility-parent.ts:77-84; src/lint/plan-compatibility-parent.ts:132-142 |
| `RC01-141` | plan-compatibility-parentは、dependenciesが現行のstrict型に適合せず、その違反tupleがbaseline外の場合、不合格にする。 | process_gate | lint | src/lint/plan-compatibility-parent.ts:95-104; src/lint/plan-compatibility-parent.ts:132-142 |
| `RC01-152` | plan-artifact-existenceは、存在するartifactの内容を読めない場合、そのartifactをhollowとは判定しない。 | evidence_claim | lint | src/lint/plan-artifact-existence.ts:95-103 |
| `RC01-155` | 共有source-ledger意味検査は、source_status_deltaに値がある場合、noneまたはchangedを含まなければ違反を返す。 | evidence_claim | lint | src/lint/shared.ts:129-131; src/lint/shared.ts:199-201 |
| `RC01-156` | 共有source-ledger意味検査は、adoption_decision_deltaに値がある場合、noneまたはchangedを含まなければ違反を返す。 | escalation_authority | lint | src/lint/shared.ts:132-134; src/lint/shared.ts:199-201 |
| `RC01-160` | 共有allowed_outcome集合検査は、実値が記載されている場合、設計で許可されたoutcomeが欠けるか未知tokenがあると違反を返す。 | process_gate | lint | src/lint/shared.ts:256-284 |
| `RC01-161` | 共有selected outcome検査は、allowed_outcomeの実値がある場合、指定された選択結果が許可集合外なら違反を返す。 | process_gate | lint | src/lint/shared.ts:286-305 |
| `RC01-162` | 共有selected outcome検査は、allowed_outcomeの実値がある場合、許可結果をちょうど1件選んでいない、未知tokenがある、または別途指定された選択結果と不一致なら違反を返す。 | process_gate | lint | src/lint/shared.ts:307-343 |
| `RC01-164` | runtime-portabilityは、package.jsonが読取り可能なJSONとして得られない場合、不合格にする。 | tooling_runtime | lint | src/lint/runtime-portability.ts:62-78 |
| `RC01-170` | runtime-portabilityは、tsconfig.jsonが読取り可能なJSONとして得られない場合、不合格にする。 | tooling_runtime | lint | src/lint/runtime-portability.ts:127-139 |
| `RC01-176` | runtime-portabilityは、scripts配下のファイルが許可wrapperまたは承認済みTypeScript scriptの固定集合にない場合、不合格にする。 | tooling_runtime | lint | src/lint/runtime-portability.ts:24-25; src/lint/runtime-portability.ts:197-208 |
| `RC01-184` | toolchain-pinは、Action registryをJSONとして解析できない場合、不合格にする。 | safety_security | lint | src/lint/toolchain-pin.ts:106-120 |
| `RC01-185` | toolchain-pinは、Action registryのschema・version・確認日時・entries配列が所定条件に適合しない場合、不合格にする。 | safety_security | lint | src/lint/toolchain-pin.ts:121-136 |
| `RC01-187` | toolchain-pinは、Action registry内でaction identityが重複する場合、不合格にする。 | safety_security | lint | src/lint/toolchain-pin.ts:156-163 |
| `RC01-190` | toolchain-pinは、package.jsonをJSONとして解析できない場合、不合格にする。 | tooling_runtime | lint | src/lint/toolchain-pin.ts:189-199 |
| `RC01-193` | toolchain-pinは、workflow YAMLを解析できずtruthyな値を取得できない場合、不合格にする。 | tooling_runtime | lint | src/lint/toolchain-pin.ts:220-225; src/lint/toolchain-pin.ts:279-293 |
| `RC02-002` | doctorの失敗情報生成器は、check IDが許容形式に合わない場合、invalid-check-idに置き換える。 | safety_security | doctor | src/doctor/failure.ts:9-20 |
| `RC02-003` | doctorのnfr-registry checkは、登録ファイルを読めない、JSONが不正、またはanalyzeNfrRegistryが不合格の場合に失敗する。 | process_gate | doctor | src/doctor/nfr-registry-check.ts:6-42 |
| `RC02-009` | 論理DB receipt生成器は、bootstrap policyのschema_versionが指定されたv2以外の場合、例外で拒否する。 | tooling_runtime | gate | src/doctor/l3-g3-logical-db-receipt.ts:94-97 |
| `RC02-021` | 論理DB receipt生成器は、policy内の列locatorが不正、または観測列・checkpoint・stale・orphan規則が存在しないテーブルや列を参照した場合、例外で拒否する。 | process_gate | gate | src/doctor/l3-g3-logical-db-receipt.ts:193-217 |
| `RC02-022` | 論理DB receipt生成器は、観測列・checkpoint table・除外path・除外stepのいずれかの配列が空の場合、例外で拒否する。 | process_gate | gate | src/doctor/l3-g3-logical-db-receipt.ts:391-397 |
| `RC02-023` | 論理DB receipt生成器は、観測列・checkpoint table・除外path・除外stepのいずれかの配列に重複がある場合、例外で拒否する。 | process_gate | gate | src/doctor/l3-g3-logical-db-receipt.ts:391-399 |
| `RC02-024` | 論理DB receipt生成器は、stale_rulesまたはorphan_rulesが空の場合、例外で拒否する。 | process_gate | gate | src/doctor/l3-g3-logical-db-receipt.ts:400-402 |
| `RC02-057` | doctorの単独gate実行は、指定名がDOCTOR_SINGLE_GATES自身の関数propertyでない場合、不明gateとして失敗する。 | tooling_runtime | doctor | src/doctor/index.ts:1472-1501 |
| `RC02-068` | doctorは、team review用read-only DBまたは共有in-memory projectionのcloseに失敗しても、その例外だけでは完了した検査結果を変更しない。 | tooling_runtime | doctor | src/doctor/index.ts:1741-1746; src/doctor/index.ts:7417-7423; src/doctor/index.ts:7495-7499 |
| `RC02-148` | consumer doctorのconsumer-vscode-tasks checkは、tasks形式・必須label/commandが不正、必須taskがshell以外・problemMatcher非空・options付き、任意taskが自動実行指定、またはtask.allowAutomaticTasksがoffでない場合に失敗する。 | safety_security | doctor | src/doctor/index.ts:6268-6318 |
| `RC02-168` | doctorのrepository-name-paths checkは、repository名・path検査が不合格、または走査不能の場合に失敗する。 | tooling_runtime | doctor | src/doctor/index.ts:6787-6800 |
| `RC02-186` | doctorは、共有projection DBの再構築が例外で失敗した場合に警告を記録し、共有DBを未指定にして各check自身の再構築経路へ委ねる。 | tooling_runtime | doctor | src/doctor/index.ts:7403-7427; src/doctor/index.ts:7725-7725 |
| `RC03-001` | active PLAN選択処理は、前後の空白を除いた要求IDが空の場合、選択を拒否する。 | process_gate | gate | src/policy/active-plan-selection.ts:15-20 |
| `RC03-003` | Windowsプロセス開始identity解析処理は、空白除去後の出力が数字だけで構成されていない場合、例外で失敗する。 | tooling_runtime | gate | src/policy/filesystem-durability.ts:20-23 |
| `RC03-004` | closure authority registryの検証処理は、同じ行に同一capabilityが重複する場合、受理を拒否する。 | escalation_authority | gate | src/policy/closure-authority-registry.ts:65-78 |
| `RC03-005` | closure authority registryの検証処理は、同じ行に同一oracle_idが重複する場合、受理を拒否する。 | evidence_claim | gate | src/policy/closure-authority-registry.ts:65-78 |
| `RC03-006` | closure authority registryの検証処理は、同じ行に同一gate_idが重複する場合、受理を拒否する。 | process_gate | gate | src/policy/closure-authority-registry.ts:65-78 |
| `RC03-008` | closure authority registry読込処理は、解決したregistryパスの相対表現が「..」で始まるか絶対パスになる場合、読込を拒否する。 | safety_security | gate | src/policy/closure-authority-registry.ts:131-139 |
| `RC03-009` | closure authority registry読込処理は、registryが通常ファイルでないかシンボリックリンクである場合、読込を拒否する。 | safety_security | gate | src/policy/closure-authority-registry.ts:140-143 |
| `RC03-010` | closure authority drift検査は、sourceパスの相対表現が「..」で始まるか絶対パスになる場合、source_outside_repositoryを報告する。該当PLANのauthority分類はinvalidになる。 | safety_security | gate | src/policy/closure-authority-registry.ts:152-162; src/policy/closure-authority-registry.ts:242-248 |
| `RC03-011` | closure authority drift検査は、sourceが通常ファイルでない、シンボリックリンクである、またはrealpathと解決パスが一致しない場合、不適格とする。 | safety_security | gate | src/policy/closure-authority-registry.ts:163-172; src/policy/closure-authority-registry.ts:242-248 |
| `RC03-014` | closure authority drift検査は、sourceの読込でENOENTが発生した場合、source_missingを報告し、該当authorityを不適格とする。 | evidence_claim | gate | src/policy/closure-authority-registry.ts:196-204; src/policy/closure-authority-registry.ts:242-248 |
| `RC03-015` | closure authority分類処理は、候補PLAN IDが入力内で重複している場合、その候補をinvalidとする。 | process_gate | gate | src/policy/closure-authority-registry.ts:224-233 |
| `RC03-020` | closure authority backfill処理は、PLAN digestが所定のSHA-256形式でない場合、候補を受理しない。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:334-335 |
| `RC03-022` | closure authority backfill処理は、PLAN内でoracle_id、parent_design、test_pathの組が重複する場合、候補をinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:338-342 |
| `RC03-031` | closure authority backfill処理は、対応テストのcanonical_realpathが偽、またはsymlinkが真の場合、候補をinvalidとする。 | safety_security | gate | src/policy/closure-authority-backfill.ts:395-408 |
| `RC03-038` | closure authority backfill処理は、採用するauthorityのsource_digestが所定形式でない場合、候補をinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:433-434 |
| `RC03-040` | closure authority backfill処理は、採用authority内のcapabilityが重複する場合、候補をinvalidとする。 | escalation_authority | gate | src/policy/closure-authority-backfill.ts:440-441 |
| `RC03-041` | closure authority backfill処理は、必須gate_idが重複する場合、候補をinvalidとする。 | process_gate | gate | src/policy/closure-authority-backfill.ts:442-444 |
| `RC03-042` | closure authority backfill処理は、gateがallowlistにない、またはcommand_idかcommandがallowlistと完全一致しない場合、候補をinvalidとする。 | tooling_runtime | gate | src/policy/closure-authority-backfill.ts:445-453 |
| `RC03-045` | closure authority backfill bundle生成処理は、repository_headが小文字SHA-1形式でない場合、失敗する。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:497-498 |
| `RC03-046` | closure authority backfill bundle生成処理は、registry_digestまたはreview_scope_digestが所定のSHA-256形式でない場合、失敗する。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:499-500 |
| `RC03-047` | closure authority backfill bundle生成処理は、期待PLAN集合または実候補集合に同一PLANが重複する場合、失敗する。 | process_gate | gate | src/policy/closure-authority-backfill.ts:501-504 |
| `RC03-053` | historical V-pair authority読込処理は、同一plan_idの行が重複する場合、失敗する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:87-90 |
| `RC03-056` | historical V-pair移行分類処理は、候補にsource読込エラーがある場合、その候補のadmissionを拒否する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:103-120 |
| `RC03-073` | feedback lifecycleデコード処理は、文字列入力をJSONとして解析できない場合、イベントの受理を拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:191-198 |
| `RC03-074` | feedback lifecycleデコード処理は、sourceGenerationがactivityEpochとpolicyEpochをピリオドで結んだ値に一致しない場合、イベントを拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:208-230 |
| `RC03-083` | feedback reconcile、ack、surface処理は、operationIdが英数字で始まる1～128文字の英数字・ピリオド・下線・コロン・ハイフンからなる形式でない場合、操作を拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:305-312; src/policy/feedback-lifecycle.ts:403-409; src/policy/feedback-lifecycle.ts:517-530; src/policy/feedback-lifecycle.ts:1006-1008 |
| `RC03-084` | feedback reconcile処理は、既存lifecycleにデコード失敗または状態連鎖の損傷がある場合、新規イベント追記を拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:320-330 |
| `RC03-086` | feedback ack処理は、sourceIdが非空かつ256文字以内でない、またはreasonが非空かつ512文字以内でない場合、操作を拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:403-409; src/policy/feedback-lifecycle.ts:1010-1015 |
| `RC03-090` | feedback surface処理は、sourceIdまたはsessionIdが非空かつ256文字以内でない場合、操作を拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:517-530; src/policy/feedback-lifecycle.ts:1010-1015 |
| `RC03-093` | feedback reconcileのイベント計画処理は、発生時刻が正規化可能なUTC ISO表記でない場合、失敗する。 | evidence_claim | gate | src/policy/feedback-lifecycle.ts:670-672; src/policy/feedback-lifecycle.ts:1022-1031 |
| `RC03-098` | チーム定義読込処理は、指定ファイルが存在しない場合、例外で失敗する。 | tooling_runtime | gate | src/team/run.ts:303-305 |
| `RC03-111` | チーム実行処理は、timedOut、deadlineMs、durationMs、reaped、terminationStage、signalが所定の型・値条件を満たさない場合、memberを成功としない。deadlineMsはworker予算と一致する安全整数、durationMsは非負の安全整数でなければならない。 | tooling_runtime | gate | src/team/run.ts:525-541 |
| `RC03-122` | レビューchecklist検証処理は、同じchecklist IDが重複する場合、checklistを拒否する。 | review_merge | gate | src/gate/review-tier.ts:40-48; src/gate/review-tier.ts:83-86; src/gate/review-tier.ts:264-268 |
| `RC03-151` | 静的ゲート評価処理は、登録済みの決定論的検査中に例外が発生した場合、検査不能としてゲートを失敗させる。 | process_gate | gate | src/gate/static.ts:229-257 |
| `RC04-001` | 停止判定器は、未知の停止理由を受け取った場合、ループを停止してエスカレーションを要求する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:9-13; src/orchestration/loop-stop-rules.ts:44-46 |
| `RC04-002` | 停止判定器は、count・cost_budget・no_progressの閾値が未指定なら停止してエスカレーションを要求する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:52-66 |
| `RC04-003` | 停止判定器は、file_exists規則にpathが無ければ停止してエスカレーションを要求する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:60-63 |
| `RC04-014` | 予算判定器は、effortBudgetが存在しない場合は予算による継続・pass制限を適用しない。 | process_gate | gate | src/orchestration/loop-effort-budget.ts:40-48; src/orchestration/loop-effort-budget.ts:161-163 |
| `RC04-024` | ツール契約検証器は、ツール名が空なら要求を拒否する。 | tooling_runtime | gate | src/orchestration/tool-contract.ts:123-130 |
| `RC04-025` | ツール契約検証器は、未登録ツールを拒否する。ただしdeferredReasonに値があればdeferを返す。 | tooling_runtime | gate | src/orchestration/tool-contract.ts:132-148 |
| `RC04-026` | ツール契約検証器は、宣言された契約IDが登録契約と異なれば拒否する。 | tooling_runtime | gate | src/orchestration/tool-contract.ts:150-153; src/orchestration/tool-contract.ts:173-177 |
| `RC04-027` | ツール契約検証器は、requestまたはroundtripで登録された要求必須値が欠ければ拒否する。 | tooling_runtime | gate | src/orchestration/tool-contract.ts:40-111; src/orchestration/tool-contract.ts:154-177 |
| `RC04-028` | ツール契約検証器は、responseまたはroundtripで登録された応答必須値が欠ければ拒否する。 | evidence_claim | gate | src/orchestration/tool-contract.ts:40-111; src/orchestration/tool-contract.ts:161-177 |
| `RC04-029` | ツール契約検証器は、契約で禁止されたpayloadフィールドに値があれば拒否する。 | safety_security | gate | src/orchestration/tool-contract.ts:167-177 |
| `RC04-030` | ツール契約検証器は、deny契約のツールを拒否する。既定契約ではspawn_agents_on_csvが該当する。 | lane_delegation | gate | src/orchestration/tool-contract.ts:61-69; src/orchestration/tool-contract.ts:170-177 |
| `RC04-031` | ツール契約監査は、空のregistry、ID・ツール名・理由の欠落、ID・ツール名の重複、またはallow契約の要求・応答必須項目未定義があれば失敗する。 | tooling_runtime | gate | src/orchestration/tool-contract.ts:185-235 |
| `RC04-036` | verifier結果の解釈器は、終了statusが0以外ならerror、認識可能な判定が無ければpendingを返す。 | evidence_claim | gate | src/orchestration/loop-bridge.ts:138-162 |
| `RC04-038` | ループreceipt生成器は、stateが無ければmissingエラーとしretryを許可しない。 | evidence_claim | gate | src/orchestration/autonomous-loop-run-receipts.ts:67-86 |
| `RC04-044` | 旧fileLoopStoreは、stateのJSON解析に失敗すると例外を出さずnullを返す。 | memory_context | gate | src/orchestration/loop-store.ts:47-57 |
| `RC04-045` | durable storeは、旧import完了markerのschema・plan・digest形式・日時が不正なら読取りを拒否する。 | memory_context | gate | src/orchestration/loop-store.ts:85-105 |
| `RC04-049` | durable storeは、旧stateがJSONとして破損、またはepoch payload検証に不適合ならimportを拒否する。 | memory_context | gate | src/orchestration/loop-store.ts:159-169 |
| `RC04-066` | durable storeは、副作用の認可が失敗、または認可結果のvalueがundefinedなら失敗する。 | safety_security | gate | src/orchestration/loop-store.ts:333-335 |
| `RC04-071` | epoch commit器は、以前のmanifestが解析不能または別PLANのものなら拒否する。 | memory_context | gate | src/orchestration/durable-loop-epoch.ts:155-165 |
| `RC04-072` | epoch commit器は、payload検証に失敗するとcorruptとして拒否する。 | memory_context | gate | src/orchestration/durable-loop-epoch.ts:167-175; src/orchestration/durable-loop-epoch.ts:293-375 |
| `RC04-076` | epoch分類器は、manifestの解析・PLAN一致・payload存在のいずれかが成立しなければcorruptとする。 | memory_context | gate | src/orchestration/durable-loop-epoch.ts:396-399 |
| `RC04-078` | epoch分類器は、payloadが解析不能またはmanifestのpayload digestと不一致ならcorruptとする。 | evidence_claim | gate | src/orchestration/durable-loop-epoch.ts:413-415 |
| `RC04-083` | epoch読取り器は、pointerの形式・PLAN・manifest名、参照manifestのdigest・identityが不正なら拒否する。 | memory_context | gate | src/orchestration/durable-loop-epoch-node.ts:92-124; src/orchestration/durable-loop-epoch-node.ts:605-634 |
| `RC04-097` | epoch読取り器は、履歴に不正manifest・別PLAN・重複epochがあればhistory_forkとして拒否する。 | memory_context | gate | src/orchestration/durable-loop-epoch-node.ts:649-663 |
| `RC04-098` | epoch読取り器は、履歴走査で同じepochとprevious digestを再訪すると循環として拒否する。 | memory_context | gate | src/orchestration/durable-loop-epoch-node.ts:664-674 |
| `RC04-099` | epoch読取り器は、履歴上のpayloadが欠落、digest不一致、または解析不能ならcorruptとする。 | evidence_claim | gate | src/orchestration/durable-loop-epoch-node.ts:675-686 |
| `RC04-100` | epoch読取り器は、epoch 0のprevious digestがnullでなければ履歴root不正として拒否する。 | memory_context | gate | src/orchestration/durable-loop-epoch-node.ts:687-695 |
| `RC04-104` | pair-agent plan生成器は、maxFixCyclesが正整数でなければplanをblockedにする。 | process_gate | gate | src/orchestration/pair-agent.ts:227-232; src/orchestration/pair-agent.ts:310-318 |
| `RC04-125` | AI判断提案検証器は、proposal schemaに適合しない入力を拒否する。 | process_gate | gate | src/workflow/ai-decision-proposal.ts:72-78 |
| `RC04-127` | AI判断提案検証器は、採点候補またはfallbackがenabled候補を参照していなければ拒否する。 | process_gate | gate | src/workflow/ai-decision-proposal.ts:91-102 |
| `RC04-128` | AI判断提案検証器は、policy constraintに不合格が1件でもあれば拒否する。 | process_gate | gate | src/workflow/ai-decision-proposal.ts:103-105 |
| `RC04-140` | CLI identity投影器は、identity・receipt・authority再検証結果が欠落、不成功、legacy出力許可、またはversion・digest・axis・ID不一致なら出力を拒否する。 | process_gate | gate | src/workflow/cli-workflow-identity-projection.ts:16-45 |
| `RC04-142` | folder規則検証器は、artifact種別に登録された許可prefixのどれにもpathが一致しなければ失敗する。 | behavior_discipline | gate | src/workflow/contracts-extras.ts:51-59 |
| `RC04-146` | drive partition検証器は、partition pathが対象driveの専用prefixで始まらなければ失敗する。 | memory_context | gate | src/workflow/contracts-extras.ts:162-179 |
| `RC04-150` | interview評価器は、入力schema不適合の場合、評価とfreezeを拒否する。 | process_gate | gate | src/workflow/workflow-interview-unresolved.ts:85-97 |
| `RC04-167` | 横断event記録器は、event type・subject_id・evidence_pathのいずれかが空なら記録参照を生成せず失敗する。 | evidence_claim | gate | src/workflow/contracts.ts:601-624 |
| `RC04-188` | D-CONTRACT検証器は、mode-routingまたはgate-checksがYAML解析不能なら失敗する。 | tooling_runtime | gate | src/workflow/routing-contracts.ts:250-265 |
| `RC04-189` | D-CONTRACT検証器は、mode-routingまたはgate-checksが対応schemaに適合しなければ失敗する。 | tooling_runtime | gate | src/workflow/routing-contracts.ts:267-284 |
| `RC04-191` | D-CONTRACT検証器は、nextが未登録signalを参照していれば失敗する。 | process_gate | gate | src/workflow/routing-contracts.ts:296-309 |
| `RC04-193` | D-CONTRACT検証器は、requiredGateIdsに指定されたgateが無ければ失敗する。 | process_gate | gate | src/workflow/routing-contracts.ts:320-331 |
| `RC04-195` | route設定検査器は、定義された個人絶対pathパターンを検出して違反とし、route評価器は推薦を拒否する。 | tooling_runtime | gate | src/workflow/routing-contracts.ts:114-117; src/workflow/routing-contracts.ts:341-352; src/workflow/routing-contracts.ts:472-496 |
| `RC04-201` | route評価器は、推薦commandがrecommendedCommandV1 schemaに不適合なら推薦を拒否してexit code 1を返す。 | tooling_runtime | gate | src/workflow/routing-contracts.ts:534-576 |
| `RC04-202` | workflow envelope検証器は、schema不適合の場合、activationを拒否する。 | process_gate | gate | src/workflow/universal-workflow-envelope.ts:409-423 |
| `RC04-203` | workflow envelope検証器は、atom_idが重複していればactivationを拒否する。 | process_gate | gate | src/workflow/universal-workflow-envelope.ts:247-255; src/workflow/universal-workflow-envelope.ts:425-429 |
| `RC04-208` | workflow envelope検証器は、target・actor・state・transition・terminalのいずれかが無ければactivationを拒否する。 | process_gate | gate | src/workflow/universal-workflow-envelope.ts:293-301; src/workflow/universal-workflow-envelope.ts:425-429 |
| `RC04-210` | workflow envelope検証器は、atom・派生要求・契約候補が参照するstate・trigger・condition・action・data・actor・transition・notification・auditが存在しなければ拒否する。 | process_gate | gate | src/workflow/universal-workflow-envelope.ts:318-396 |
| `RC04-212` | 派生trace生成・検証器は、source envelopeが不正なら失敗し、検証時はtrace schema不適合も拒否する。 | process_gate | gate | src/workflow/derived-requirement-trace.ts:235-277 |
| `RC04-214` | 派生trace検証器は、artifact IDが重複していれば失敗する。 | process_gate | gate | src/workflow/derived-requirement-trace.ts:296-300 |
| `RC04-227` | workflow guide生成器は、specialist driveがbe・fe・fullstack・db・agent以外、またはregistry未登録なら失敗する。 | process_gate | gate | src/workflow/workflow-guide.ts:138-163; src/workflow/workflow-guide.ts:274-279 |
| `RC04-270` | review観測収集器は、repository・output path・trusted loginsの引数が欠ければ起動を拒否する。 | tooling_runtime | ci | .github/scripts/collect-claude-review-observation.mjs:3-4 |
| `RC04-271` | review観測収集器は、GITHUB_TOKENが無ければ失敗する。 | safety_security | ci | .github/scripts/collect-claude-review-observation.mjs:5-7 |
| `RC04-273` | review観測収集器は、ページ応答が配列でなければ失敗する。 | tooling_runtime | ci | .github/scripts/collect-claude-review-observation.mjs:16-17 |
| `RC04-276` | bubblewrap導入処理は、RUNNER_OSがLinux以外なら失敗する。 | tooling_runtime | ci | .github/scripts/install-bubblewrap.sh:5-8 |
| `RC04-280` | bubblewrap導入処理は、/usr/bin/bwrapが実行可能でなければ失敗する。 | safety_security | ci | .github/scripts/install-bubblewrap.sh:3-3; .github/scripts/install-bubblewrap.sh:45-45 |
| `RC04-285` | workflow実行policy設定は、未対応identityをfail-closeとし、typed identityと登録command IDだけを出力対象にする。 | tooling_runtime | config | config/workflow-execution-policy.v1.json:13-25 |
| `RD00-002` | adapterは、Windowsのcmdラップ対象のコマンドまたは引数にNULや指定メタ文字が含まれる場合、例外で拒否する。 | safety_security | gate | src/runtime/adapter.ts:322-350 |
| `RD00-012` | adapterは、providerが正常終了してもstdoutが空白のみの場合、malformed_outputとして失敗を返す。 | evidence_claim | gate | src/runtime/adapter.ts:533-542 |
| `RD00-023` | agent guardは、allowRawが有効な場合、blockOrBypass経由の拒否を警告付き許可へ変更する。 | escalation_authority | hook | src/runtime/agent-guard.ts:87-95; src/runtime/agent-guard-policy.ts:26-27 |
| `RD00-039` | slot管理は、stateの欠落・構文不正・検証失敗・読込み例外を空のslot集合として扱い、保存失敗でも処理を停止しない。 | tooling_runtime | hook | src/runtime/agent-slots.ts:76-95 |
| `RD00-044` | atomic slice評価は、identity・digest・path集合・一意性などの正規化検証に失敗した入力をinvalid_intentとしてrecovery_requiredにする。 | process_gate | gate | src/runtime/atomic-slice-admission.ts:139-157; src/runtime/atomic-slice-admission.ts:187-219; src/runtime/atomic-slice-admission.ts:277-289 |
| `RD00-057` | 設計候補選択器は、候補IDが空または重複する場合、design_candidate_ambiguousとして失敗する。 | process_gate | gate | src/runtime/atomic-slice-admission.ts:358-364 |
| `RD00-058` | 設計候補選択器は、oracle通過率が1でなく、または比較指標に非有限値・負値がある候補を除外し、適格候補がなければ失敗する。 | process_gate | gate | src/runtime/atomic-slice-admission.ts:365-384 |
| `RD00-060` | CI schedulerは、max_parallel_jobsが1以上の整数でない場合、失敗判定にする。 | tooling_runtime | ci | src/runtime/ci-critical-path-scheduler.ts:209-213 |
| `RD00-061` | CI schedulerは、期待artifact identityのartifact IDが重複した場合、失敗判定にし、そのIDの再利用を認めない。 | evidence_claim | ci | src/runtime/ci-critical-path-scheduler.ts:214-223; src/runtime/ci-critical-path-scheduler.ts:421-425 |
| `RD00-062` | CI schedulerは、期待artifactのdigest群が不正、またはNode version・platformが空の場合、失敗判定にする。 | evidence_claim | ci | src/runtime/ci-critical-path-scheduler.ts:224-235 |
| `RD00-063` | CI schedulerは、利用可能CPU・memoryが正の有効値でない、または互換runner OS集合が空の場合、失敗判定にする。 | tooling_runtime | ci | src/runtime/ci-critical-path-scheduler.ts:237-245 |
| `RD00-064` | CI schedulerは、obligationのcapability IDが重複した場合、失敗判定にする。 | process_gate | ci | src/runtime/ci-critical-path-scheduler.ts:246-252 |
| `RD00-065` | CI schedulerは、依存先が存在しない場合、dependency_unknownとして失敗判定にする。 | process_gate | ci | src/runtime/ci-critical-path-scheduler.ts:150-159 |
| `RD00-066` | CI schedulerは、依存グラフのtopological sortが全obligationを並べられない場合、循環として失敗判定にする。 | process_gate | ci | src/runtime/ci-critical-path-scheduler.ts:189-191 |
| `RD00-068` | CI schedulerは、推定値の対象が未登録、時間値が不正、flake率が範囲外、cache状態が不正、p95がp50未満、またはsample数が正の整数でない場合、その推定値を拒否する。 | evidence_claim | ci | src/runtime/ci-critical-path-scheduler.ts:267-287 |
| `RD00-072` | CI schedulerは、resource requirementの対象・一意性・runner互換性・資源量・timeoutが不正な場合、そのrequirementを拒否する。 | tooling_runtime | ci | src/runtime/ci-critical-path-scheduler.ts:310-331 |
| `RD00-073` | CI schedulerは、obligationに対応する有効なresource requirementがない場合、失敗判定にする。 | tooling_runtime | ci | src/runtime/ci-critical-path-scheduler.ts:332-336 |
| `RD00-075` | CI schedulerは、排他資源のcapabilityが未登録、またはlease ID・fence tokenが空の場合、失敗判定にする。 | tooling_runtime | ci | src/runtime/ci-critical-path-scheduler.ts:339-349 |
| `RD00-079` | 延期義務のassignment投影は、receiptがpendingでない、registry edge・selector ID・origin PR・expiryが不正な場合、assignment生成を拒否する。 | process_gate | ci | src/runtime/ci-deferred-obligation-recovery.ts:145-170 |
| `RD00-080` | 延期義務の照合は、評価時刻を解釈できない場合、evaluation_invalidとして失敗判定にする。 | evidence_claim | ci | src/runtime/ci-deferred-obligation-recovery.ts:190-202 |
| `RD00-081` | 延期義務の照合は、同一obligationに複数assignmentがある場合、後続assignmentを拒否する。 | process_gate | ci | src/runtime/ci-deferred-obligation-recovery.ts:204-212 |
| `RD00-082` | 延期義務の照合は、assignmentのobligation ID・HEAD・origin PR・selector ID・registry edge ID・expiryが不正な場合、拒否する。 | evidence_claim | ci | src/runtime/ci-deferred-obligation-recovery.ts:213-228 |
| `RD00-084` | 延期義務の照合は、同一obligationのterminal runが複数ある場合、重複として失敗判定にする。 | evidence_claim | ci | src/runtime/ci-deferred-obligation-recovery.ts:249-255 |
| `RD00-087` | 延期義務の照合は、terminal runのorigin PRがassignmentと異なる場合、失敗判定にする。 | evidence_claim | ci | src/runtime/ci-deferred-obligation-recovery.ts:269-274 |
| `RD00-088` | 延期義務の照合は、terminal runのevidence digest・完了時刻・run IDが不正、またはattemptが1未満の場合、失敗判定にする。 | evidence_claim | ci | src/runtime/ci-deferred-obligation-recovery.ts:275-285 |
| `RD00-094` | CI責務registry検証は、schema versionが所定値でない場合、失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:157-167 |
| `RD00-095` | CI責務registry検証は、node IDまたはcapability・responsibility IDが所定形式でない場合、失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:112-112; src/runtime/ci-responsibility-registry.ts:169-171; src/runtime/ci-responsibility-registry.ts:192-199 |
| `RD00-097` | CI責務registry検証は、node IDまたはcapability IDがそれぞれの集合内で重複した場合、失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:174-176; src/runtime/ci-responsibility-registry.ts:207-213 |
| `RD00-098` | CI責務registry検証は、edge端点またはcapabilityの適用先nodeが未登録の場合、失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:178-189; src/runtime/ci-responsibility-registry.ts:252-260 |
| `RD00-101` | CI責務registry検証は、artifact入出力IDに不正なものがある場合、失敗する。 | evidence_claim | ci | src/runtime/ci-responsibility-registry.ts:231-240 |
| `RD00-104` | CI責務registry検証は、依存先・replacement・rollback・retirement consumerのcapabilityが未登録の場合、失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:276-307 |
| `RD00-105` | CI責務registry検証は、edgeにも適用先にも参加しないnodeがある場合、orphanとして失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:308-311 |
| `RD00-106` | CI責務registry検証は、active capability間の依存循環を検出した場合、失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:128-154; src/runtime/ci-responsibility-registry.ts:312-318 |
| `RD00-107` | 検証義務導出は、authorityまたは変更artifactとして渡されたnodeがregistryにない場合、失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:328-338 |
| `RD00-111` | CI検証計画は、work authority IDが所定のissue・plan形式でない場合、失敗する。 | escalation_authority | ci | src/runtime/ci-verification-plan.ts:127-127; src/runtime/ci-verification-plan.ts:225-229 |
| `RD00-112` | CI検証計画は、work authorityのkindとID接頭辞が一致しない場合、失敗する。 | escalation_authority | ci | src/runtime/ci-verification-plan.ts:230-235 |
| `RD00-118` | CI検証計画は、required obligation IDが重複した場合、失敗する。 | process_gate | ci | src/runtime/ci-verification-plan.ts:285-290 |
| `RD00-120` | CI検証計画は、同一capabilityの延期assignmentが重複した場合、後続assignmentを拒否する。 | process_gate | ci | src/runtime/ci-verification-plan.ts:296-303 |
| `RD00-124` | CI検証計画は、延期receiptのstatusがpending・succeeded以外の場合、拒否する。 | process_gate | ci | src/runtime/ci-verification-plan.ts:328-337 |
| `RD00-126` | CI検証計画は、pendingの延期receiptにdigestが設定されている場合、拒否する。 | evidence_claim | ci | src/runtime/ci-verification-plan.ts:347-352 |
| `RD00-129` | 旧impact CI adapterは、selectedまたはdeferred itemをcapability IDへ変換できない場合、findingを返す。 | process_gate | ci | src/runtime/ci-verification-plan.ts:406-422 |
| `RD00-130` | 旧impact CI adapterは、変換後capabilityがselectedとdeferredの両方に現れた場合、重複findingを返す。 | process_gate | ci | src/runtime/ci-verification-plan.ts:423-426 |
| `RD00-131` | CI telemetry検証は、eventおよび検査対象の入れ子objectに許可外fieldがある場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:333-344; src/runtime/ci-execution-telemetry.ts:435-435; src/runtime/ci-execution-telemetry.ts:465-488; src/runtime/ci-execution-telemetry.ts:661-666 |
| `RD00-133` | CI telemetry検証は、eventまたは必須入れ子データがobjectでない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:426-434; src/runtime/ci-execution-telemetry.ts:465-485; src/runtime/ci-execution-telemetry.ts:658-659 |
| `RD00-134` | CI telemetry検証は、schema versionが所定値でない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:490-492 |
| `RD00-135` | CI telemetry検証は、event・node・verification・workflow・runの各IDが所定形式でない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:493-501 |
| `RD00-136` | CI telemetry検証は、node_kindが登録集合外の場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:212-218; src/runtime/ci-execution-telemetry.ts:502-502 |
| `RD00-137` | CI telemetry検証は、operationが登録集合外の場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:219-229; src/runtime/ci-execution-telemetry.ts:503-503 |
| `RD00-138` | CI telemetry検証は、依存node集合が配列でない、または不正IDを含む場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:504-509 |
| `RD00-139` | CI telemetry検証は、依存node集合が一意かつbyte順に整列した正規形でない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:510-519; src/runtime/ci-execution-telemetry.ts:821-825 |
| `RD00-140` | CI telemetry検証は、profileが登録集合外の場合、拒否する。 | process_gate | ci | src/runtime/ci-execution-telemetry.ts:205-210; src/runtime/ci-execution-telemetry.ts:521-521 |
| `RD00-141` | CI telemetry検証は、execution surfaceがlocal_internal・github_actions以外の場合、拒否する。 | tooling_runtime | ci | src/runtime/ci-execution-telemetry.ts:211-211; src/runtime/ci-execution-telemetry.ts:522-522 |
| `RD00-144` | CI telemetry検証は、attemptが1以上の安全な整数でない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:529-529 |
| `RD00-145` | CI telemetry検証は、observed・authorityのrunner image IDまたはimage digestが不正な場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:435-437 |
| `RD00-146` | CI telemetry検証は、runner OSがlinux・windows・macos以外、またはarchitectureがx64・arm64以外の場合、拒否する。 | tooling_runtime | ci | src/runtime/ci-execution-telemetry.ts:230-231; src/runtime/ci-execution-telemetry.ts:438-441 |
| `RD00-147` | CI telemetry検証は、runnerのNodeまたはnpm versionが所定の3要素version形式でない場合、拒否する。 | tooling_runtime | ci | src/runtime/ci-execution-telemetry.ts:442-453 |
| `RD00-148` | CI telemetry検証は、runnerのsystem dependency・action registry・toolchain・environment digestが不正な場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:454-461 |
| `RD00-151` | CI telemetry検証は、queued・started・completed時刻が有効なRFC3339日時でない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:361-385; src/runtime/ci-execution-telemetry.ts:553-562 |
| `RD00-152` | CI telemetry検証は、queue・wall・runner時間が非負の安全な整数でない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:563-565 |
| `RD00-153` | CI telemetry検証は、queued→started→completedの時刻順序が逆転している場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:566-568 |
| `RD00-154` | CI telemetry検証は、queue時間がstartedとqueuedの差に一致しない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:569-574 |
| `RD00-155` | CI telemetry検証は、wall時間がcompletedとstartedの差に一致しない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:575-580 |
| `RD00-156` | CI telemetry検証は、runner時間がwall時間を超える場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:581-587 |
| `RD00-157` | CI telemetry検証は、CPU classまたはmemory classが登録集合外の場合、拒否する。 | tooling_runtime | ci | src/runtime/ci-execution-telemetry.ts:240-241; src/runtime/ci-execution-telemetry.ts:591-598 |
| `RD00-158` | CI telemetry検証は、cache classがcold・warm以外、またはhitがbooleanでない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:600-604 |
| `RD00-159` | CI telemetry検証は、cold cacheなのにhit=trueの場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:605-605 |
| `RD00-160` | CI telemetry検証は、outcome statusが登録集合外の場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:232-238; src/runtime/ci-execution-telemetry.ts:610-610 |
| `RD00-161` | CI telemetry検証は、exit codeがnullでも非負の安全な整数でもない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:611-616 |
| `RD00-162` | CI telemetry検証は、retryまたはflakyがbooleanでない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:617-618 |
| `RD00-163` | CI telemetry検証は、初回検出oracle IDがnullでも有効IDでもない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:619-624 |
| `RD00-164` | CI telemetry検証は、passedのexit codeが0でない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:625-627 |
| `RD00-165` | CI telemetry検証は、failedなのにexit codeがnull・非整数・0の場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:628-635 |
| `RD00-166` | CI telemetry検証は、passed・failed以外のstatusにnull以外のexit codeがある場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:636-638 |
| `RD00-168` | CI telemetry検証は、failed・timed_out以外に初回検出oracle IDが設定されている場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:646-652 |
| `RD00-169` | CI telemetry検証は、artifact field自体が欠落している場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:655-656 |
| `RD00-170` | CI telemetry検証は、artifact directionがupload・download以外の場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:667-669 |
| `RD00-172` | CI telemetry検証は、artifact_transfer nodeにartifact情報がない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:676-681 |
| `RD00-173` | CI telemetry検証は、artifact_transfer以外のnodeにartifact情報がある場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:682-688 |
| `RD00-174` | CI telemetry検証は、artifact upload・download操作がartifact情報付きtransfer nodeでない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:689-695 |
| `RD00-175` | CI telemetry検証は、artifact操作とartifact directionが一致しない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:696-701 |
| `RD00-176` | CI telemetry検証は、transfer nodeのoperationがartifact upload・download以外の場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:703-709 |
| `RD00-177` | CI telemetry検証は、test nodeのoperationがtestでない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:710-711 |
| `RD00-178` | CI telemetry検証は、setup nodeのoperationが登録setup操作集合外の場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:242-248; src/runtime/ci-execution-telemetry.ts:712-714 |
| `RD00-181` | CI telemetry作成器は、生成eventが検証に通らない場合、例外を投げて生成を失敗させる。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:758-761 |
| `RD00-182` | CI telemetryは、batchまたはprojectionの入力が空配列・非配列の場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:764-769; src/runtime/ci-execution-telemetry.ts:1027-1033 |
| `RD00-183` | CI telemetryは、event IDがbatch内またはprojection全体で重複した場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:773-777; src/runtime/ci-execution-telemetry.ts:1050-1055 |
| `RD00-184` | CI telemetryは、batch内のnode IDが重複した場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:778-779 |
| `RD00-187` | CI telemetryは、batch内のcache classが一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:805-807 |
| `RD00-188` | CI telemetryは、batch内のcache hit値が一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:808-810 |
| `RD00-189` | CI telemetryは、batch内のCPU classが一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:811-813 |
| `RD00-190` | CI telemetryは、batch内のmemory classが一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:814-816 |
| `RD00-191` | CI telemetryは、依存先nodeがbatch内に存在しない場合、失敗する。 | process_gate | ci | src/runtime/ci-execution-telemetry.ts:826-830 |
| `RD00-192` | CI telemetryは、nodeが自分自身へ依存する場合、失敗する。 | process_gate | ci | src/runtime/ci-execution-telemetry.ts:831-831 |
| `RD00-193` | CI telemetryは、依存先完了より前に依存元nodeが開始している場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:832-842 |
| `RD00-196` | CI telemetryは、依存グラフに循環がある場合、失敗する。 | process_gate | ci | src/runtime/ci-execution-telemetry.ts:865-880 |
| `RD00-199` | Claude inboxは、repository・PR番号・HEAD・review用途のidentityが不正な場合、one-shot生成や遷移を拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:79-89; src/runtime/claude-memory-wake.ts:124-129; src/runtime/claude-memory-wake.ts:148-153 |
| `RD00-200` | Claude inboxは、one-shot処理に渡された時刻を解釈できない場合、拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:91-95 |
| `RD00-201` | Claude inboxは、終了・rearm理由が空、非文字列、256文字超、または改行を含む場合、拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:97-106 |
| `RD00-202` | Claude inboxは、delivery・ack digestがSHA-256形式でない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-memory-wake.ts:108-112 |
| `RD00-203` | Claude inboxは、CI evidence generationが所定のrun・attempt・terminal conclusion形式でない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-memory-wake.ts:27-28; src/runtime/claude-memory-wake.ts:114-118 |
| `RD00-207` | Claude inboxは、DELIVERED以外のone-shotをREVIEWEDへ進めようとした場合、拒否する。 | process_gate | gate | src/runtime/claude-memory-wake.ts:188-192 |
| `RD00-208` | Claude inboxは、REVIEWEDからの終了、CLAIMEDからのexplicit_rearm終了、またはARMED・CLAIMED・DELIVEREDからのPR close・merge終了以外のterminal遷移を拒否する。 | process_gate | gate | src/runtime/claude-memory-wake.ts:193-208 |
| `RD00-216` | Claude review dispatchは、repository・PR番号が不正、またはPR URLがそのidentityから作るURLと一致しない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-memory-wake.ts:511-514; src/runtime/claude-memory-wake.ts:638-648 |
| `RD00-218` | Claude review dispatchは、base branchが空の場合、拒否する。 | review_merge | gate | src/runtime/claude-memory-wake.ts:652-654 |
| `RD00-220` | Claude inboxは、既存one-shot markerのID・schema・suffix対応state・identity・時刻・世代数・runtime情報・digest整合が不正な場合、読込みを拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:717-793 |
| `RD00-221` | Claude inboxは、canonical PR identityを得られない通知のarm・terminal化・supersedeを拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:796-798; src/runtime/claude-memory-wake.ts:1053-1054; src/runtime/claude-memory-wake.ts:1133-1134 |
| `RD00-223` | Claude inbox publisherは、keyがinbox接頭辞を持たない場合、publishを拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:851-856 |
| `RD00-225` | Claude inboxは、壊れたclaimやdelivery receiptを配信済みIDとして採用しない。 | memory_context | gate | src/runtime/claude-memory-wake.ts:910-947 |
| `RD00-230` | Claude inboxは、supersede元の探索で旧形式claimだけを読み飛ばし、それ以外の壊れたcurrent markerは拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1089-1123 |
| `RD00-233` | Claude inboxは、汎用通知のclaim markerが対象ID・CLAIMED state・有効delivery digestを満たさない場合、delivery記録を拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1255-1287 |
| `RD00-237` | Claude inboxは、delivery記録がない場合、review記録を拒否する。 | process_gate | gate | src/runtime/claude-memory-wake.ts:1359-1361; src/runtime/claude-memory-wake.ts:1390-1391 |
| `RD00-239` | Claude inboxは、明示terminal記録APIでreview記録がない場合、終了記録を拒否する。 | process_gate | gate | src/runtime/claude-memory-wake.ts:1435-1438; src/runtime/claude-memory-wake.ts:1466-1467 |
| `RD00-244` | Claude wake watcherは、旧形式または不正payloadのPR依頼を検出した場合、skip記録を作り配信しない。 | review_merge | gate | src/runtime/claude-memory-wake.ts:950-956; src/runtime/claude-memory-wake.ts:1583-1595 |
| `RD00-245` | Claude wake watcherは、GitHubの現在PR状態を取得できない場合、そのwatcherでは当該通知をclaimしない。 | review_merge | gate | src/runtime/claude-memory-wake.ts:1596-1602 |
| `RD00-246` | Claude wake watcherは、現在PRがOPENでない場合、close・merge理由でskipし配信しない。 | review_merge | gate | src/runtime/claude-memory-wake.ts:1603-1612 |
| `RD00-248` | PR収束処理は、CI evidence generationが所定形式でない、またはrun ID・attemptが安全な整数でない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:47-78 |
| `RD00-249` | PR収束処理は、CI evidence generation内のrun IDがreceiptのCI run IDと異なる場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:79-79 |
| `RD00-250` | PR収束処理は、CI evidence generation内のconclusionがreceiptのCI conclusionと異なる場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:80-82 |
| `RD00-253` | PR収束処理は、merge引数生成時にPR番号が正の安全な整数でない場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:405-406 |
| `RD00-265` | review receipt検証は、supersedesReceiptIdを指定する場合にnullでも空でない文字列でもなければ拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:555-561; src/runtime/claude-pr-convergence.ts:864-869 |
| `RD00-266` | review receipt検証は、reviewer session IDが空の場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:562-562 |
| `RD00-267` | review receipt検証は、CI run IDが正の安全な整数でない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:563-565 |
| `RD00-268` | review receipt検証は、blocker数が非負の安全な整数でない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:573-575 |
| `RD00-271` | review receipt検証は、指定されたDB digestがSHA-256形式でない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:482-484; src/runtime/claude-pr-convergence.ts:582-591 |
| `RD00-272` | review receipt検証は、approve時にcanonical DB receiptのschemaが所定v2でない、または必要digestが欠けている場合、拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:592-598 |
| `RD00-274` | review receipt検証は、PR URLがrepository・PR番号から構成したURLと一致しない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:607-608 |
| `RD00-275` | review receipt検証は、comment URLが対象PRのissuecomment接頭辞を持たない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:609-611 |
| `RD00-276` | review receipt検証は、review日時が解釈不能または未来の場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:612-614 |
| `RD00-277` | review receiptの構築・current検証は、必須field欠落または許可外fieldがある場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:617-650; src/runtime/claude-pr-convergence.ts:816-859 |
| `RD00-281` | canonical DB receipt束縛は、workspace status digestがSHA-256形式でない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:674-674 |
| `RD00-283` | review receipt検証は、入力がobjectでない、または対応schemaでない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:758-762; src/runtime/claude-pr-convergence.ts:780-785; src/runtime/claude-pr-convergence.ts:807-815 |
| `RD00-286` | current review receipt検証は、summaryが存在するのに空白のみまたは非文字列の場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:845-851 |
| `RD00-287` | current review receipt検証は、CI evidence generationが文字列でない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:860-862 |
| `RD00-288` | current review receipt検証は、supersedesReceiptId fieldが存在しない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:863-863 |
| `RD00-289` | review comment decoderは、一意なseal marker・末尾のJSON envelope・対応schema・有効receiptが揃わない場合、証拠を返さない。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:908-930 |
| `RD00-290` | review commentのread-after検証は、期待comment URLが所定形式でない、または取得URLと異なる場合、失敗する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:988-994; src/runtime/claude-pr-convergence.ts:998-1000 |
| `RD00-292` | review commentのread-after検証は、取得本文が空または非文字列の場合、失敗する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1001-1003 |
| `RD00-295` | review comment seal処理は、明示URLが非文字列・placeholder・対象PR以外・不正comment IDのいずれかの場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1031-1038 |
| `RD00-298` | review receipt slot解放は、claim記録をJSONとして解釈できない場合、拒否する。 | tooling_runtime | gate | src/runtime/claude-pr-convergence.ts:1094-1105 |
| `RD00-300` | review receipt訂正は、理由がschema_invalid・digest_invalid・comment_binding_invalid以外の場合、拒否する。 | escalation_authority | gate | src/runtime/claude-pr-convergence.ts:1144-1154 |
| `RD00-301` | review receipt訂正は、canonical訂正対象fileが存在しない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1177-1188 |
| `RD00-319` | CLI-R00指標参照は、登録されていないmetric IDが渡された場合、例外で拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:392-395 |
| `RD00-320` | CLI-R00は、token見積りまたは構造snapshotへ渡されたCLI byte数が非負整数でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:428-433; src/runtime/cli-r00-throughput-baseline.ts:444-446 |
| `RD00-322` | CLI-R00 percentile計算は、sample集合が空、または非有限値を含む場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:467-470 |
| `RD00-323` | CLI-R00 decoderは、artifact・observation・condition・supporting context・percentileに必須key欠落または未知keyがある場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:203-209; src/runtime/cli-r00-throughput-baseline.ts:489-497; src/runtime/cli-r00-throughput-baseline.ts:524-534; src/runtime/cli-r00-throughput-baseline.ts:623-633; src/runtime/cli-r00-throughput-baseline.ts:747-757; src/runtime/cli-r00-throughput-baseline.ts:856-867 |
| `RD00-324` | CLI-R00 decoderは、artifact・observation・condition・supporting contextがobjectでない、またはpercentileがobjectでもnullでもない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:485-488; src/runtime/cli-r00-throughput-baseline.ts:518-523; src/runtime/cli-r00-throughput-baseline.ts:618-622; src/runtime/cli-r00-throughput-baseline.ts:741-746; src/runtime/cli-r00-throughput-baseline.ts:850-855 |
| `RD00-325` | CLI-R00 percentile decoderは、各数値が有限でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:498-511 |
| `RD00-326` | CLI-R00 percentile decoderは、sample数nが正の整数でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:512-514 |
| `RD00-327` | CLI-R00 condition decoderは、schema versionが所定値でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:535-537 |
| `RD00-328` | CLI-R00 condition decoderは、conditionのmetric IDがobservationの対象metricと異なる場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:538-547 |
| `RD00-329` | CLI-R00 decoderは、observabilityがmeasured・proxy・unmeasurable以外の場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:548-555; src/runtime/cli-r00-throughput-baseline.ts:643-650 |
| `RD00-330` | CLI-R00 condition decoderは、environmentがgithub_actions・local_process以外の場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:556-559 |
| `RD00-331` | CLI-R00 condition decoderは、collection recipe IDが空または非文字列の場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:560-564 |
| `RD00-332` | CLI-R00 condition decoderは、source HEAD・workflow ID・run ID・Node version・runner OSがnullでも空でない文字列でもない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:566-585 |
| `RD00-334` | CLI-R00 condition decoderは、command argvまたはtest pathsがnullでも文字列配列でもない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:586-599 |
| `RD00-335` | CLI-R00 observation decoderは、metric IDがcatalogにない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:634-640 |
| `RD00-339` | CLI-R00 observation decoderは、unitがcatalogの単位と一致しない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:667-671 |
| `RD00-340` | CLI-R00 observation decoderは、valueがnullでも有限数でもない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:672-679 |
| `RD00-343` | CLI-R00 observation decoderは、sample値がnullでも有限数配列でもない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:688-695 |
| `RD00-344` | CLI-R00 observation decoderは、conditionとobservationのobservabilityが異なる場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:700-704 |
| `RD00-345` | CLI-R00 observation decoderは、collection recipe IDがcatalog定義と異なる場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:705-714 |
| `RD00-346` | CLI-R00 observation decoderは、evidence参照が文字列でもnullでもない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:715-722 |
| `RD00-347` | CLI-R00 observation decoderは、notesが文字列でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:723-725 |
| `RD00-349` | CLI-R00 supporting context検証は、byte数・行数・非空行数・command登録数・一意command数が非負整数でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:224-234; src/runtime/cli-r00-throughput-baseline.ts:765-780 |
| `RD00-350` | CLI-R00 supporting context検証は、top-level command familyが空または文字列配列でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:781-793 |
| `RD00-351` | CLI-R00 supporting context検証は、full regression shard ID集合が文字列配列でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:794-803 |
| `RD00-352` | CLI-R00 supporting context検証は、token見積りがnullでも有限数でもない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:804-814 |
| `RD00-353` | CLI-R00 supporting context検証は、token見積り方法がnullでも文字列でもない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:815-825 |
| `RD00-354` | CLI-R00 supporting context検証は、historical notesが文字列配列でない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:826-832 |
| `RD00-355` | CLI-R00 artifact検証は、schema versionが所定値でない場合、失敗する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:869-871 |
| `RD00-358` | CLI-R00 artifact検証は、baseline kindがpre_refactorでない場合、失敗する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:878-880 |
| `RD00-360` | CLI-R00 artifact検証は、captured_atがRFC3339形式の文字列でない場合、失敗する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:887-889 |
| `RD00-362` | CLI-R00 artifact検証は、source branchが空または非文字列の場合、失敗する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:893-895 |
| `RD00-363` | CLI-R00 artifact検証は、observationsが配列でない場合、失敗する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:896-899 |
| `RD00-365` | CLI-R00比較器は、baselineとcandidateのmetric IDが異なる場合、比較を拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:974-979 |
| `RD00-370` | CLI-R00比較器は、比較するどちらかのvalueがnullの場合、比較を拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1006-1012 |
| `RD01-001` | retirement intentの生成処理は、非JSON値または循環参照を含む入力を拒否する。 | tooling_runtime | gate | src/runtime/continuation.ts:131-149 |
| `RD01-002` | retirement intentの生成処理は、rootsが空、重複、または正規の相対パスでない場合に失敗する。 | safety_security | gate | src/runtime/continuation.ts:108-116; src/runtime/continuation.ts:152-160 |
| `RD01-003` | retirement intentの生成処理は、inventory digest、target phase、writer policyが実装の許容値に適合しなければ失敗する。 | process_gate | gate | src/runtime/continuation.ts:161-165 |
| `RD01-013` | retirement journalの読取処理は、不正なレコード構造、必須文字列、digest、非負整数件数、phase、status、日時、checkpointを拒否する。 | memory_context | gate | src/runtime/continuation.ts:281-338; src/runtime/continuation.ts:346-362 |
| `RD01-014` | retirement journalの読取処理は、failed記録に空でないerrorがない場合、または非failed記録に非nullのerrorがある場合に失敗する。 | evidence_claim | gate | src/runtime/continuation.ts:339-345 |
| `RD01-015` | retirement journalの読取処理は、最終非空行だけのJSON構文エラーを切断末尾として許容し、それ以外の読取エラーを伝播する。 | memory_context | gate | src/runtime/continuation.ts:365-383 |
| `RD01-016` | manifest照合処理は、sourceまたはtargetに同一pathの重複があれば失敗する。 | evidence_claim | gate | src/runtime/continuation.ts:413-421; src/runtime/continuation.ts:436-460 |
| `RD01-017` | manifest照合処理は、相対path、digest、0〜0777の整数mode、tracked真偽値のいずれかが不正なら失敗する。 | evidence_claim | gate | src/runtime/continuation.ts:422-435; src/runtime/continuation.ts:451-460 |
| `RD01-026` | continuationイベント生成処理は、event ID、operation ID、session ID、event kindが空白だけなら拒否する。 | memory_context | gate | src/runtime/continuation.ts:557-572 |
| `RD01-027` | continuationイベント生成処理は、sequenceが非負の安全な整数でなければ拒否する。 | memory_context | gate | src/runtime/continuation.ts:573-575 |
| `RD01-028` | continuationイベント生成処理は、記録日時が有効なRFC3339 UTC時刻でなければ拒否する。 | memory_context | gate | src/runtime/continuation.ts:576-578 |
| `RD01-033` | PLAN完了adapterは、DBを利用できない場合に失敗する。 | memory_context | gate | src/runtime/continuation.ts:721-725 |
| `RD01-037` | continuation読取処理は、schema versionが1でない記録を拒否する。 | tooling_runtime | gate | src/runtime/continuation.ts:776-791 |
| `RD01-044` | 旧note移行処理は、現在時刻が有効なRFC3339でなければ失敗する。 | memory_context | gate | src/runtime/continuation.ts:965-973 |
| `RD01-053` | delivery生成処理は、entry IDまたはconsumer IDが所定の1〜128文字の識別子形式に適合しなければ拒否する。 | memory_context | gate | src/runtime/continuation.ts:1278-1286 |
| `RD01-054` | delivery生成処理は、payload digestが有効なSHA-256形式でなければ拒否する。 | evidence_claim | gate | src/runtime/continuation.ts:1287-1287 |
| `RD01-055` | delivery生成処理は、記録日時・保持期限が有効なUTC時刻でない、または保持期限が記録日時より前なら拒否する。 | memory_context | gate | src/runtime/continuation.ts:1288-1296 |
| `RD01-057` | delivery journal生成処理は、event IDまたはoperation IDが空白だけなら拒否する。 | memory_context | gate | src/runtime/continuation.ts:1307-1313 |
| `RD01-058` | delivery journal読取処理は、schema versionが1でない場合に拒否する。 | tooling_runtime | gate | src/runtime/continuation.ts:1323-1325 |
| `RD01-059` | delivery journal読取処理は、statusが定義された配送状態に存在しない場合に拒否する。 | process_gate | gate | src/runtime/continuation.ts:1335-1337 |
| `RD01-061` | delivery journal読取処理は、delivery IDがentry IDとconsumer IDから構成した値と異なれば拒否する。 | memory_context | gate | src/runtime/continuation.ts:1304-1304; src/runtime/continuation.ts:1346-1346 |
| `RD01-069` | Cursor run分類処理は、agent IDが空白だけなら失敗する。 | tooling_runtime | gate | src/runtime/cursor-cloud-run-authority.ts:53-54 |
| `RD01-070` | Cursor run分類処理は、現在時刻を解析できなければ失敗する。 | tooling_runtime | gate | src/runtime/cursor-cloud-run-authority.ts:55-56 |
| `RD01-071` | Cursor run分類処理は、stale閾値が有限の正数でなければ失敗する。 | tooling_runtime | gate | src/runtime/cursor-cloud-run-authority.ts:57-58 |
| `RD01-072` | Cursor run分類処理は、run IDが空白だけまたは重複なら失敗する。 | tooling_runtime | gate | src/runtime/cursor-cloud-run-authority.ts:60-64 |
| `RD01-085` | イベントadmissionは、envelopeがobjectでない、キー集合が不正、または基本値の検証に失敗した場合に拒否する。 | tooling_runtime | gate | src/runtime/event-projection-checkpoint-replay.ts:220-245 |
| `RD01-086` | イベントadmissionは、payload digestが欠落または不正な場合、不完全なenvelopeとして拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:223-230 |
| `RD01-087` | イベントadmissionは、requested以外のイベントにcausation IDがなければ拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:246-248 |
| `RD01-088` | 因果順序判定は、イベント発生時刻が観測時刻より未来なら拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:260-262 |
| `RD01-089` | 因果順序判定は、指定causation IDに対応するイベントがlogに存在しなければ拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:263-265 |
| `RD01-090` | 因果順序判定は、原因イベントと対象イベントのcorrelation IDが異なれば拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:266-268 |
| `RD01-096` | projection照合は、snapshot自身のlane IDとidentity内lane IDが不一致なら失敗する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:329-339 |
| `RD01-100` | checkpoint scope選択は、scopeの構造またはHEAD・各IDが不正なら拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:369-380 |
| `RD01-101` | checkpoint scope選択は、scopeとlogのlane IDが異なれば拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:381-383 |
| `RD01-102` | checkpoint scope選択は、開始・終了イベントが存在しない、または終了位置が開始より前なら拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:384-388 |
| `RD01-105` | checkpoint replay判定は、対象イベント集合が空、またはその先頭・末尾がcheckpoint境界と異なれば拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:416-422 |
| `RD01-108` | recovery経路判定は、最大試行数または現在試行番号が正の整数でなければ拒否する。 | tooling_runtime | gate | src/runtime/event-projection-checkpoint-replay.ts:432-441 |
| `RD01-110` | orchestration journal読取処理は、ファイル不存在以外の読取障害を失敗にする。 | memory_context | gate | src/runtime/event-projection-checkpoint-transaction.ts:137-144 |
| `RD01-111` | orchestration journal読取処理は、不正JSON行を捨てずsnapshot不正として失敗させる。 | memory_context | gate | src/runtime/event-projection-checkpoint-transaction.ts:145-154 |
| `RD01-112` | orchestration transactionは、入力・journal・DB行のenvelopeがadmissionに通らなければ失敗する。 | process_gate | gate | src/runtime/event-projection-checkpoint-transaction.ts:155-157; src/runtime/event-projection-checkpoint-transaction.ts:333-349; src/runtime/event-projection-checkpoint-transaction.ts:511-521 |
| `RD01-121` | orchestration transactionは、checkpoint scope検証が失敗するか終端イベントを得られなければ停止する。 | process_gate | gate | src/runtime/event-projection-checkpoint-transaction.ts:302-308; src/runtime/event-projection-checkpoint-transaction.ts:471-485 |
| `RD01-122` | orchestration DB読取処理は、projection JSONが壊れていればdriftとして停止する。 | memory_context | gate | src/runtime/event-projection-checkpoint-transaction.ts:352-359 |
| `RD01-123` | orchestration DB読取処理は、checkpoint JSONが壊れていればbinding不足として停止する。 | memory_context | gate | src/runtime/event-projection-checkpoint-transaction.ts:362-369 |
| `RD01-128` | orchestration transactionは、対象laneの最新投影を取得できなければ失敗する。 | lane_delegation | gate | src/runtime/event-projection-checkpoint-transaction.ts:565-568 |
| `RD01-132` | 強制停止記録処理は、記録中の例外を外へ伝播せず処理を継続させる。 | tooling_runtime | hook | src/runtime/forced-stop.ts:110-125 |
| `RD01-138` | feedback記録処理は、既存JSONLの不正行を無視し、処理全体の例外も伝播しない。 | memory_context | gate | src/runtime/forced-stop.ts:180-194 |
| `RD01-139` | 未解決Recovery検索は、不正JSON行を除外し、走査例外時も例外を伝播せず取得済み結果を返す。 | memory_context | gate | src/runtime/forced-stop.ts:201-224 |
| `RD01-140` | 強制停止走査は、現在sessionと強制停止記録済みsessionを除外し、不正行・走査例外を無視する。 | memory_context | hook | src/runtime/forced-stop.ts:233-263 |
| `RD01-141` | PLAN authoring処理は、正規相対pathでない指定、repository外への逸脱、またはpath構成要素のsymlinkを拒否する。 | safety_security | gate | src/runtime/forward-plan-authoring-transaction.ts:199-238 |
| `RD01-142` | PLAN authoringの復旧処理は、journalのschema・状態・seal・transaction digest・4ファイル構成・path・digest契約が不正なら拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:287-337 |
| `RD01-146` | PLAN authoring処理は、指定repository rootの解決pathとrealpathが異なれば拒否する。 | safety_security | gate | src/runtime/forward-plan-authoring-transaction.ts:388-391 |
| `RD01-147` | PLAN authoring処理は、repositoryまたはGit authorityを取得できなければ拒否する。 | process_gate | gate | src/runtime/forward-plan-authoring-transaction.ts:122-130; src/runtime/forward-plan-authoring-transaction.ts:389-395 |
| `RD01-155` | PLAN authoring処理は、予約authorityの投影検証が失敗するか取得・解釈で例外が発生した場合に拒否する。 | escalation_authority | gate | src/runtime/forward-plan-authoring-transaction.ts:132-134; src/runtime/forward-plan-authoring-transaction.ts:423-428 |
| `RD01-158` | PLAN authoring処理は、Reverse slugが所定の小文字英数字・ハイフン形式に適合しなければ拒否する。 | tooling_runtime | gate | src/runtime/forward-plan-authoring-transaction.ts:435-437 |
| `RD01-163` | PLAN authoring処理は、文書のidentity・kind・draft状態・pending_reverse・完了主張禁止・Issue・owner・相互参照・workflow束縛がcontractと異なれば拒否する。 | process_gate | gate | src/runtime/forward-plan-authoring-transaction.ts:252-285; src/runtime/forward-plan-authoring-transaction.ts:558-570 |
| `RD01-173` | Forward／Reverse予約処理は、strict入力schemaに適合しなければpairを返さず拒否する。 | process_gate | gate | src/runtime/forward-reverse-terminal-reservation.ts:26-58; src/runtime/forward-reverse-terminal-reservation.ts:83-93 |
| `RD01-182` | 回帰shardの生成・検証処理は、candidate HEADが40桁小文字16進SHAでなければ失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:95-95; src/runtime/full-regression-shards.ts:165-165 |
| `RD01-183` | 回帰shardの生成・検証処理は、base SHAが40桁小文字16進SHAでなければ失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:96-96; src/runtime/full-regression-shards.ts:166-166 |
| `RD01-185` | 回帰shard処理は、inventoryが空またはtests配下の.test.ts path以外を含む場合に失敗する。 | process_gate | gate | src/runtime/full-regression-shards.ts:100-103; src/runtime/full-regression-shards.ts:162-164 |
| `RD01-188` | 回帰shard検証は、planのschema versionが所定値と異なれば失敗する。 | tooling_runtime | gate | src/runtime/full-regression-shards.ts:160-160 |
| `RD01-189` | 回帰shard検証は、shard IDが重複していれば失敗する。 | process_gate | gate | src/runtime/full-regression-shards.ts:167-167 |
| `RD01-194` | 回帰shard検証は、stateful IDまたはbulk系IDとkindの対応が不正なら失敗する。 | process_gate | gate | src/runtime/full-regression-shards.ts:176-182 |
| `RD01-195` | 回帰shard検証は、shard内のfile列が重複なしの正規ソート順でなければ失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:184-186 |
| `RD01-201` | 回帰receipt検証は、receiptのshard IDが重複していれば失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:225-227 |
| `RD01-203` | 回帰receipt検証は、receipt schemaが所定値と異なれば失敗する。 | tooling_runtime | gate | src/runtime/full-regression-shards.ts:237-239 |
| `RD01-209` | 回帰receipt検証は、output digestが有効なSHA-256形式でなければ失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:255-257 |
| `RD01-211` | 回帰receipt検証は、開始日時を解析できなければ失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:259-261 |
| `RD01-212` | 回帰receipt検証は、完了日時を解析できなければ失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:262-264 |
| `RD01-213` | 回帰receipt検証は、完了日時が開始日時より前なら失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:264-265 |
| `RD01-214` | Git guard hookは、pushコマンドまたは実効cwdを完全に解析できなければpre-push検証を失敗させる。 | safety_security | hook | src/runtime/git-command-guard-hook.ts:55-57; src/runtime/git-command-guard-hook.ts:266-277 |
| `RD01-215` | Git guard hookは、pushに--tags・--all・--mirror・--repo指定がある場合、対象集合を一意に解決できないとして拒否する。 | safety_security | hook | src/runtime/git-command-guard-hook.ts:58-70 |
| `RD01-216` | Git guard hookは、push引数を解析できない、位置引数が3個以上、またはremote delete対象が一意でない場合に拒否する。 | safety_security | hook | src/runtime/git-command-guard-hook.ts:35-52; src/runtime/git-command-guard-hook.ts:71-77 |
| `RD01-217` | Git guard hookは、current branchまたはremoteを解決できない、remoteがドット、または省略refspecのupstreamを一意に解決できない場合に拒否する。 | safety_security | hook | src/runtime/git-command-guard-hook.ts:78-90 |
| `RD01-218` | Git guard hookは、push先branch名が許容文字形式に適合しなければ拒否する。 | safety_security | hook | src/runtime/git-command-guard-hook.ts:93-98 |
| `RD01-221` | Git guard hookは、push対象commit subjectを読み取れない場合に拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:119-120 |
| `RD01-224` | Git guard hookは、入力JSONが不正な場合にexit code 2で拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:199-204 |
| `RD01-231` | Git command guardは、bypass指定がない場合、shellコマンドを完全に解析できなければ拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:173-185; src/runtime/git-command-guard.ts:515-527 |
| `RD01-245` | logical DB receipt検証は、キー集合が規定と完全一致しなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:200-210 |
| `RD01-246` | logical DB receipt検証は、receiptまたはpolicyのschema versionが所定v2でなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:218-220 |
| `RD01-263` | review comment抽出処理は、marker付きcommentのJSON envelopeが不正なら候補として採用せず診断を返す。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:277-304; src/runtime/github-cross-review-admission.ts:596-602 |
| `RD01-265` | Kimi provenance検証は、provenance欠落、観測時刻不正、または検証中の例外があれば失敗する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:332-344; src/runtime/github-cross-review-admission.ts:431-432 |
| `RD01-276` | review候補検証は、現在Claude receiptまたはprovider-neutral v4以外のschemaを拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:511-518 |
| `RD01-294` | merge後再読判定は、観測日時が不正ならverifiedにしない。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:709-709 |
| `RD01-300` | merge再読receipt検証は、receiptがobjectでない、schema不正、digest不一致、または判定再構築結果と全文一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:749-775 |
| `RD01-302` | ベンチdataset検証は、public・fixture・hidden registryの構造、キー集合、schema、型が不正なら拒否する。 | tooling_runtime | gate | src/runtime/helix-bench-task-dataset.ts:163-188 |
| `RD01-304` | ベンチdataset検証は、fixtureがobjectでない、キー集合不正、またはtask IDが文字列でない場合に拒否する。 | process_gate | gate | src/runtime/helix-bench-task-dataset.ts:190-198 |
| `RD01-305` | ベンチdataset検証は、hidden oracleの構造・task ID・期待failure class・非空negative mutation列・履歴参照列が不正なら拒否する。 | process_gate | gate | src/runtime/helix-bench-task-dataset.ts:199-203; src/runtime/helix-bench-task-dataset.ts:235-253 |
| `RD01-306` | ベンチdataset検証は、public taskのキー集合・category・worker候補真偽値・prompt・snapshot検証が不正なら拒否する。 | process_gate | gate | src/runtime/helix-bench-task-dataset.ts:126-146; src/runtime/helix-bench-task-dataset.ts:209-224 |
| `RD01-326` | verification inventory検証は、項目IDが空またはtrim後に重複していれば失敗する。 | process_gate | gate | src/runtime/impact-ci.ts:374-377 |
| `RD01-328` | verification inventory検証は、commandが空、または空白だけの引数を含む場合に失敗する。 | tooling_runtime | gate | src/runtime/impact-ci.ts:379-381 |
| `RD01-329` | verification inventory検証は、同じcommand配列が重複していれば失敗する。 | process_gate | gate | src/runtime/impact-ci.ts:382-384 |
| `RD01-330` | verification inventory検証は、未知のverification kindを拒否する。 | process_gate | gate | src/runtime/impact-ci.ts:385-385 |
| `RD01-331` | verification inventory検証は、mandatory profileに未知の値があれば失敗する。 | process_gate | gate | src/runtime/impact-ci.ts:386-388 |
| `RD01-332` | impact判定処理は、base HEAD・candidate HEAD・body digestの形式が不正なら失敗する。 | evidence_claim | gate | src/runtime/impact-ci.ts:405-411 |
| `RD01-333` | impact判定処理は、companion item IDがinventoryに存在しなければ失敗する。 | process_gate | gate | src/runtime/impact-ci.ts:421-424 |
| `RD01-340` | CI profile receipt検証は、schema versionが所定値と異なれば失敗する。 | evidence_claim | gate | src/runtime/impact-ci.ts:497-497 |
| `RD01-341` | CI profile receipt検証は、base HEADまたはcandidate HEADのSHA形式が不正なら失敗する。 | evidence_claim | gate | src/runtime/impact-ci.ts:498-499 |
| `RD01-342` | CI profile receipt検証は、body・inventory・environment・各outputのdigest形式が不正なら失敗する。 | evidence_claim | gate | src/runtime/impact-ci.ts:500-507 |
| `RD01-343` | CI profile receipt検証は、result item IDが重複していれば失敗する。 | evidence_claim | gate | src/runtime/impact-ci.ts:509-509 |
| `RD01-346` | CI profile receipt検証は、attemptが1未満、または開始・完了日時が欠落したresultを拒否する。 | evidence_claim | gate | src/runtime/impact-ci.ts:514-517 |
| `RD01-349` | 実行時間percentile計算は、非空sample列から先頭sampleを取得できなければ失敗する。 | tooling_runtime | gate | src/runtime/impact-ci.ts:554-564 |
| `RD02-001` | レビュー証跡検証器は、取得したGitHubコメントのURL・本文から指定されたレビュー証跡を検証できない場合、admissionを拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:30-85 |
| `RD02-002` | admission検証器は、入力がオブジェクトでない場合、または検証時刻を解析できない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:169-175 |
| `RD02-004` | admission検証器は、実装HEAD・closure digest・試験digest・独立検証receipt digestが所定形式を満たさない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:178-201 |
| `RD02-006` | admission検証器は、有効期間が不正、24時間超、検証時刻が発行前または期限後の場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:157-159; src/runtime/independent-review-fallback.ts:191-201 |
| `RD02-013` | 証跡保存器は、admissionまたはレビューreceiptの保存rootが「/」で始まらない場合に拒否する。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:349-354; src/runtime/independent-review-fallback.ts:1667-1672 |
| `RD02-016` | provider選択器は、主provider障害capabilityが内部発行済み集合に存在しない場合にfallbackを拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:438-441 |
| `RD02-020` | リスク導出器は、空白以外の変更pathがない場合に分類を失敗させる。 | review_merge | gate | src/runtime/independent-review-fallback.ts:524-537 |
| `RD02-022` | diff解析器は、diff --gitヘッダーを1行でも所定形式で解析できない場合に変更path抽出を拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:546-558 |
| `RD02-025` | lease発行器は、repository・PR番号・HEAD・generation・日時が不正、または期限が発行時刻以前の場合に拒否する。 | lane_delegation | gate | src/runtime/independent-review-fallback.ts:606-618 |
| `RD02-027` | lease保存器は、未封印lease、非絶対root、または1以上の安全整数でない試行上限を拒否する。 | lane_delegation | gate | src/runtime/independent-review-fallback.ts:634-646 |
| `RD02-028` | lease保存器は、既存JSONの読取・解析に失敗した場合に保存を拒否する。 | lane_delegation | gate | src/runtime/independent-review-fallback.ts:648-667 |
| `RD02-031` | Kimi起動構成器は、実行ファイルまたはhomeが非絶対path、packetが空または512×1024文字超、model名が所定形式外の場合に拒否する。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:732-739 |
| `RD02-032` | sandbox構成器は、bubblewrapが絶対pathで存在しない場合、またはprovider実行ファイルが存在しない場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:794-800 |
| `RD02-033` | Kimiレビュー実行器は、config.toml・credentials・oauth・device_idのいずれかが存在しない場合に認証面未解決として拒否する。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:801-804; src/runtime/independent-review-fallback.ts:1364-1369 |
| `RD02-035` | ACP transcript検証器は、session IDが空または文字列でない場合に拒否する。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:959-961 |
| `RD02-041` | ACP実行器は、stdoutのJSON解析失敗またはerror応答を受けた場合に実行を失敗させる。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:932-939; src/runtime/independent-review-fallback.ts:1045-1055 |
| `RD02-043` | 認証書戻し判定器は、stagedファイルが存在しない場合に書戻しを拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1191-1193 |
| `RD02-044` | 認証書戻し判定器は、staged対象が通常ファイルでない場合に書戻しを拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1194-1194 |
| `RD02-045` | 認証書戻し判定器は、staged対象を読み取れない場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1195-1197 |
| `RD02-046` | 認証書戻し判定器は、staged内容が64KiBを超える場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1145-1145; src/runtime/independent-review-fallback.ts:1198-1199 |
| `RD02-047` | 認証書戻し判定器は、変更されたstaged内容がJSONオブジェクトでない場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1200-1205 |
| `RD02-048` | 認証書戻し判定器は、比較元host内容がJSONオブジェクトでない場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1206-1208 |
| `RD02-049` | 認証書戻し判定器は、hostとstagedのkey集合が一致しない場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1209-1212 |
| `RD02-050` | 認証書戻し判定器は、対応するkeyの値の型がhostとstagedで異なる場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1213-1216 |
| `RD02-051` | 認証書戻し判定器は、access_tokenまたはrefresh_tokenが空、または文字列でない場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1217-1221 |
| `RD02-052` | 認証書戻し判定器は、双方の期限が数値でない、またはstaged期限がhost期限より進んでいない場合に拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1222-1230 |
| `RD02-053` | 認証回収器は、host認証ファイルを読み取れない場合に書戻しを拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1282-1292 |
| `RD02-058` | レビュー出力検証器は、JSON開始・終了markerの欠落、重複、順序逆転を拒否する。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:1455-1467 |
| `RD02-059` | レビュー出力検証器は、marker内がJSONとして解析不能、またはstrict output schemaに適合しない場合に拒否する。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:1468-1475 |
| `RD02-061` | 中立receipt生成器は、障害証跡・lease・レビュー出力のいずれかが内部発行済みcapabilityでない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1552-1555 |
| `RD02-064` | 中立receipt生成器は、障害観測より前に発行されたleaseを拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1575-1581 |
| `RD02-065` | 中立receiptの生成・検証器は、レビュー時刻がlease有効期間外、または期間・日時が不正な証跡を拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1574-1581; src/runtime/independent-review-fallback.ts:1644-1648; src/runtime/independent-review-fallback.ts:1659-1662 |
| `RD02-066` | 中立receipt検証器は、所定のv4形式・Kimi provider・kimi-code-cli runtimeでない証跡や、不正な識別子・digest・CI番号を拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1619-1654 |
| `RD02-071` | receipt読込器は、canonical root指定時に親directoryがそのrootと異なるpathを拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1694-1696 |
| `RD02-073` | receipt読込器は、admission root指定時に対応admissionが存在しない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1703-1709 |
| `RD02-081` | Issue階層収集器は、契約候補のYAMLが解析不能の場合に不正findingを返す。 | process_gate | gate | src/runtime/issue-hierarchy.ts:136-144 |
| `RD02-086` | native graph監査器は、sub_issues・blocked_by・blocksのページ取得が完了していない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:328-339 |
| `RD02-094` | 階層関係移行器は、置換対象の既存階層契約がない場合に適用を拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:492-498 |
| `RD02-097` | 依存契約の生成・解析器は、非nullのplan_idと非空のplan_idsが併存する場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:524-530; src/runtime/issue-hierarchy.ts:743-747 |
| `RD02-098` | 依存契約移行器は、add対象に契約が既に存在する場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:546-549 |
| `RD02-099` | 依存契約移行器は、replace対象に契約が存在しない場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:550-552 |
| `RD02-103` | 依存契約解析器は、指定marker付き契約blockがない、または所定形式で解析できない場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:712-720 |
| `RD02-104` | Issue契約解析器は、関係先番号が正の安全整数として解釈できない場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:721-730; src/runtime/issue-hierarchy.ts:901-903; src/runtime/issue-hierarchy.ts:996-1012 |
| `RD02-105` | 依存契約解析器は、plan_ids内の識別子がPLAN-から始まる所定形式でない場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:731-742 |
| `RD02-113` | 階層契約解析器は、完全な階層契約blockがない場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:978-982 |
| `RD02-114` | 階層契約解析器は、blocksまたはblocked_byが配列でない場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1002-1004; src/runtime/issue-hierarchy.ts:1022-1023 |
| `RD02-117` | 階層契約解析器は、dispositionがactive・parked・duplicate・superseded以外の場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1025-1029 |
| `RD02-162` | lint effect実行器は、worktreeまたはinputsのsnapshot digestがSHA-256形式でない場合にblockする。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:189-190 |
| `RD02-163` | lint effect実行器は、現在時刻またはintent期限を解析できない場合にblockする。 | tooling_runtime | gate | src/runtime/lint-effect-executor.ts:191-193 |
| `RD02-164` | lint effect実行器は、intent期限が現在時刻以前ならblockする。 | tooling_runtime | gate | src/runtime/lint-effect-executor.ts:194-194 |
| `RD02-166` | lint effect実行器は、authorization発行者が信頼集合にない場合にblockする。 | safety_security | gate | src/runtime/lint-effect-executor.ts:197-198 |
| `RD02-167` | lint effect実行器は、authorization検証が例外を投げる場合にblockする。 | safety_security | gate | src/runtime/lint-effect-executor.ts:199-204 |
| `RD02-168` | lint effect実行器は、authorization検証がfalseを返す場合に改変としてblockする。 | safety_security | gate | src/runtime/lint-effect-executor.ts:205-205 |
| `RD02-170` | lint effect実行器は、authorization期限を解析できない場合にblockする。 | safety_security | gate | src/runtime/lint-effect-executor.ts:207-208 |
| `RD02-171` | lint effect実行器は、authorization期限が現在時刻以前ならblockする。 | safety_security | gate | src/runtime/lint-effect-executor.ts:209-209 |
| `RD02-173` | lint effect実行器は、preflightの正規化等で例外が発生した場合にinvalid_canonical_inputとしてblockする。 | tooling_runtime | gate | src/runtime/lint-effect-executor.ts:220-222 |
| `RD02-174` | lint effect実行器は、dispatch直前のsnapshot観測が失敗した場合にblockする。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:225-235 |
| `RD02-182` | artifact生成器は、変更前digestまたは内容digestがSHA-256形式でない場合にblockする。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:445-446 |
| `RD02-186` | machine safety hookは、hook入力をJSON解析できない場合にtool実行をblockする。 | safety_security | hook | src/runtime/machine-safety-guard-hook.ts:22-31 |
| `RD02-187` | machine safety hookは、参照されたinterpreter scriptがrepo外の場合に実行をblockする。 | safety_security | hook | src/runtime/machine-safety-guard-hook.ts:36-41; src/runtime/machine-safety-guard-hook.ts:54-60 |
| `RD02-188` | machine safety hookは、参照scriptが不存在・通常ファイル以外・2MiB超・読取不能の場合に実行をblockする。 | safety_security | hook | src/runtime/machine-safety-guard-hook.ts:42-44; src/runtime/machine-safety-guard-hook.ts:54-60 |
| `RD02-194` | machine safety guardは、引用符やescapeが閉じずshell commandを解析できない場合にblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:87-89; src/runtime/machine-safety-guard.ts:277-278 |
| `RD02-196` | machine safety guardは、bash・sh・zshへpipeする入力をechoまたはprintfから静的抽出できない場合にblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:111-125; src/runtime/machine-safety-guard.ts:282-283 |
| `RD02-197` | machine safety guardは、pipeまたは入れ子shellのpayloadに動的構文がある場合にblockし、静的payloadにも同じguardを再適用する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:284-287; src/runtime/machine-safety-guard.ts:328-337 |
| `RD02-210` | PLAN予約検証器は、ancestor HEAD集合が重複なしのbyte順整列になっていない場合に拒否する。 | process_gate | gate | src/runtime/open-branch-plan-identity-reservation.ts:64-68 |
| `RD02-215` | 予約証拠検証器は、availableとerror digestがnullであることの真偽が一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/open-branch-plan-identity-reservation.ts:99-103 |
| `RD02-216` | PLAN予約投影器は、snapshotをschema検証できない場合にblockedを返す。 | process_gate | gate | src/runtime/open-branch-plan-identity-reservation.ts:243-260 |
| `RD02-217` | PLAN予約投影器は、terminal証拠の記録時刻がsnapshot取得時刻より後の場合にblockedとする。 | evidence_claim | gate | src/runtime/open-branch-plan-identity-reservation.ts:269-277; src/runtime/open-branch-plan-identity-reservation.ts:303-311 |
| `RD02-221` | PLAN予約投影器は、current main・open PR HEAD・active writer証拠のいずれかがunavailableなら、他にblock条件がなくてもdegradedかつok=falseとする。 | process_gate | gate | src/runtime/open-branch-plan-identity-reservation.ts:263-266; src/runtime/open-branch-plan-identity-reservation.ts:303-311 |
| `RD02-222` | 物理同一性検証器は、空・絶対path・逆slash・NUL・drive prefix・動的記号、または空segment・.・..・.git・.helix・harness.dbを含む対象pathを拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:146-172; src/runtime/physical-filesystem-identity.ts:436-439 |
| `RD02-223` | 物理安全性検証器は、対象がrepo root自身またはrepo外の場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:174-177; src/runtime/physical-filesystem-identity.ts:231-236; src/runtime/physical-filesystem-identity.ts:313-314 |
| `RD02-224` | 物理安全性検証器は、rootから対象までにmount pointがある、またはdeviceがrootと異なる場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:222-245 |
| `RD02-225` | 物理安全性検証器は、対象を通常ファイルまたはdirectoryとして識別できない場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:179-185; src/runtime/physical-filesystem-identity.ts:240-242; src/runtime/physical-filesystem-identity.ts:336-338 |
| `RD02-226` | 物理同一性検証器は、対象またはroot未満の祖先がsymlink、あるいは祖先のlstatに失敗した場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:249-259; src/runtime/physical-filesystem-identity.ts:315-317 |
| `RD02-227` | 物理同一性検証器は、対象のrealpathまたはlstat取得が失敗した場合にnot foundとして拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:320-325 |
| `RD02-228` | 物理同一性検証器は、通常ファイルのlink数が1を超える場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:339-341 |
| `RD02-229` | 物理同一性検証器は、open後のstatが観測値と異なる、Linuxのfd実体pathが異なる、または再検証不能の場合にidentity driftとして拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:262-281; src/runtime/physical-filesystem-identity.ts:342-343 |
| `RD02-230` | 物理同一性検証器は、期待件数が正の安全整数でない、対象が0件または128件超、あるいは期待件数と実数が異なる場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:425-435 |
| `RD02-231` | 物理同一性検証器は、対象pathに重複がある場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:440-443 |
| `RD02-232` | 物理同一性検証器は、repo rootのrealpathを取得できない、またはdirectory identityを取得できない場合にunresolvedとして拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:444-459 |
| `RD02-233` | 物理同一性検証器は、Linuxでmount情報を読取・解析できない場合にunresolvedとして拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:204-220; src/runtime/physical-filesystem-identity.ts:460-468 |
| `RD02-234` | 物理同一性検証器は、Linux以外のplatformではunsupportedとして拒否する。 | tooling_runtime | gate | src/runtime/physical-filesystem-identity.ts:204-205; src/runtime/physical-filesystem-identity.ts:460-468 |
| `RD02-235` | 物理同一性再検証器は、bindingが内部発行済みでない場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:412-419; src/runtime/physical-filesystem-identity.ts:496-500 |
| `RD02-237` | hook authority transport処理器は、envelopeがschema不正ならlocatorを補完せず、観測生成をnullまたはschema failureで終了する。 | safety_security | gate | src/runtime/project-hook-authority-envelope.ts:109-125; src/runtime/project-hook-authority-envelope.ts:179-180 |
| `RD02-238` | hook authority処理器は、remote default symbolic refが一意に定まらない場合にinput unavailableとする。 | safety_security | gate | src/runtime/project-hook-authority-envelope.ts:156-167; src/runtime/project-hook-authority-envelope.ts:208-225 |
| `RD02-239` | hook authority処理器は、root identity・HEAD・source materialの独立採取に失敗した場合にinput unavailableとする。 | evidence_claim | gate | src/runtime/project-hook-authority-envelope.ts:192-226 |
| `RD02-247` | standalone authority投影器は、Control Plane envelopeを必要とする面をread-only・unavailable・no dispatchとして返す。 | lane_delegation | gate | src/runtime/project-hook-authority-envelope.ts:310-326 |
| `RD02-254` | provider起動器は、POSIX process group対応集合以外のplatformでは起動前に拒否する。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:3-10; src/runtime/provider-process-lifecycle.ts:92-98; src/runtime/provider-process-lifecycle.ts:210-225 |
| `RD02-255` | provider起動器は、timeMsが正の安全整数でない場合に拒否する。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:100-104; src/runtime/provider-process-lifecycle.ts:176-176 |
| `RD02-256` | provider起動器は、captureLimitBytes指定値が非負の安全整数でない場合に拒否する。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:177-182 |
| `RD02-262` | repo-wide guard読込器は、registryのschema version不一致、testsが非配列、または空配列の場合に失敗する。 | process_gate | gate | src/runtime/repo-wide-guard-runner.ts:30-40 |
| `RD02-263` | repo-wide guard読込器は、registryのtest pathに重複がある場合に失敗する。 | process_gate | gate | src/runtime/repo-wide-guard-runner.ts:41-46 |
| `RD02-264` | repo-wide guard読込器は、test pathがtests/配下の小文字英数字・hyphen名の.test.ts形式でない場合に失敗する。 | process_gate | gate | src/runtime/repo-wide-guard-runner.ts:42-46 |
| `RD02-269` | resident assignment検証器は、branch名が実装内のGit branch名制約を満たさない場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:17-37; src/runtime/resident-lane-assignment.ts:62-64 |
| `RD02-271` | resident assignment検証器は、作成時刻が期限以上の場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:75-77 |
| `RD02-272` | resident assignment投影・返却・引継ぎ判定器は、入力またはassignmentのschema検証が失敗した場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:126-145; src/runtime/resident-lane-assignment.ts:247-249; src/runtime/resident-lane-assignment.ts:282-284; src/runtime/resident-lane-assignment.ts:306-314 |
| `RD02-274` | resident assignment投影器は、最新割当の作成時刻が観測時刻より未来なら失敗とする。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:187-190 |
| `RD02-283` | assignment引継ぎ判定器は、有効なhandover receipt digestがない場合に拒否する。 | evidence_claim | gate | src/runtime/resident-lane-assignment.ts:288-290 |
| `RD02-288` | provider保存証拠検証器は、内容がJSONとして解析不能の場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:192-202 |
| `RD02-289` | provider保存証拠検証器は、JSON rootがrecordでない場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:203-203 |
| `RD02-290` | provider保存証拠検証器は、許可集合外の最上位fieldがある場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:204-215 |
| `RD02-291` | provider保存証拠検証器は、schema_versionがprovider-handover.v1でない場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:216-216 |
| `RD02-292` | provider保存証拠検証器は、handover_kind欠落を既知の2 handover IDだけに許し、それ以外の欠落を無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:148-151; src/runtime/retirement-preserve.ts:219-224 |
| `RD02-293` | provider保存証拠検証器は、指定されたhandover_kindがmechanical以外の場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:224-226 |
| `RD02-294` | provider保存証拠検証器は、fromがclaudeまたはcodexとして解釈できない場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:227-227 |
| `RD02-295` | provider保存証拠検証器は、toがclaudeまたはcodexとして解釈できない場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:228-228 |
| `RD02-296` | provider保存証拠検証器は、fromとtoが同一の場合に無効とする。 | lane_delegation | gate | src/runtime/retirement-preserve.ts:229-229 |
| `RD02-297` | provider保存証拠検証器は、handover_idが空または文字列でない場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:230-234 |
| `RD02-298` | provider保存証拠検証器は、active_planが空または文字列でない場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:230-234 |
| `RD02-299` | provider保存証拠検証器は、budgetがnullでも文字列でもない場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:235-235 |
| `RD02-300` | provider保存証拠検証器は、created_atが有効なUTC文字列でない場合に無効とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:173-175; src/runtime/retirement-preserve.ts:236-238 |
| `RD02-301` | provider保存証拠検証器は、contextがrecordでない、summaryが文字列でない、またはnext_actions・filesが文字列配列でない場合に無効とする。 | memory_context | gate | src/runtime/retirement-preserve.ts:239-249 |
| `RD02-302` | 運用移行文書検証器は、所定の先頭frontmatterがない場合に無効とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:253-258 |
| `RD02-303` | 運用移行文書検証器は、layerがL11またはL14でない場合に無効とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:259-259 |
| `RD02-306` | 運用移行文書検証器は、retention_policy行が所定patternを満たさない場合に無効とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:262-262 |
| `RD02-307` | 運用移行文書検証器は、retention_authority行が所定patternを満たさない場合に無効とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:263-265 |
| `RD02-308` | 運用移行文書検証器は、retention_modeがindefiniteまたはuntilでない場合に無効とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:266-268 |
| `RD02-310` | 保存manifest収集器は、指定されたretention設定が導出した正規方針と異なる場合に拒否する。 | process_gate | gate | src/runtime/retirement-preserve.ts:303-306 |
| `RD02-313` | 保存入力検証器は、保存pathまたは来歴上のoriginal pathが正規化された相対pathでない場合に拒否する。 | safety_security | gate | src/runtime/retirement-preserve.ts:161-170; src/runtime/retirement-preserve.ts:522-525 |
| `RD02-314` | 保存入力検証器は、kindがprovider_evidenceまたはoperations_transition以外の場合に拒否する。 | process_gate | gate | src/runtime/retirement-preserve.ts:526-528 |
| `RD02-315` | 保存入力検証器は、artifact ID欠落、role不正、mode範囲外、symlink、またはkindとroleの不整合がある場合に拒否する。 | safety_security | gate | src/runtime/retirement-preserve.ts:529-540 |
| `RD02-317` | 保存入力検証器は、retention policy・authority・source ID・owner・revisionが空、または作成時刻が不正な場合に拒否する。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:548-557 |
| `RD02-318` | 保存入力検証器は、schema検証・query・exportのprobe証拠が不正な場合に拒否する。成功を称するprobeには終了コード0を要求する。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:177-189; src/runtime/retirement-preserve.ts:558-564 |
| `RD02-319` | 保存入力検証器は、until保存の期限が欠落・不正・採取時刻より前、またはindefinite保存に期限が付く場合に拒否する。 | process_gate | gate | src/runtime/retirement-preserve.ts:565-573 |
| `RD02-320` | 保存manifest生成器は、operation ID・intent digest・採取時刻・source revision・retirement phaseが不正なcontextを拒否する。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:586-596 |
| `RD02-322` | 保存manifest生成器は、kindとpathの組が重複する資産を拒否する。 | process_gate | gate | src/runtime/retirement-preserve.ts:616-618 |
| `RD02-324` | 保存整合性判定器は、originalまたはmetadata digestがSHA-256形式でない資産をinvalid evidenceとする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:715-716 |
| `RD02-335` | archive manifest生成器は、kind・path・mode・時刻が不正、symlink、理由・operation ID・復元手順の欠落、またはsourceとarchive先が同一の場合に拒否する。 | safety_security | gate | src/runtime/retirement-preserve.ts:847-873 |
| `RD02-336` | archive manifest生成器は、source path・archive path・logical pathのいずれかが重複する場合に拒否する。 | process_gate | gate | src/runtime/retirement-preserve.ts:874-880 |
| `RD03-003` | PLANとレビュー証跡の接合評価は、変更PLANを解析できない場合、状態を推測せず拒否する。変更一覧の取得失敗や期待HEADとローカルHEADの不一致も解析不能として扱う。 | review_merge | gate | src/runtime/review-receipt-plan-binding.ts:88-96; src/runtime/review-receipt-plan-binding.ts:242-255; src/runtime/review-receipt-plan-binding.ts:294-364 |
| `RD03-014` | secret egress hookは、scan対象が2 MiBを超えるかNULを含む場合、検証不能として遮断する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:57-74; src/runtime/secret-egress-hook.ts:280-284 |
| `RD03-015` | secret egress hookは、対象作業パスが存在しないか通常ファイルでない場合、検証不能として遮断する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:66-74; src/runtime/secret-egress-hook.ts:280-284 |
| `RD03-016` | secret egress hookは、Git porcelain出力のentryが4文字未満または所定の区切りを欠く場合、対象範囲を解決できないとして遮断する。 | tooling_runtime | hook | src/runtime/secret-egress-hook.ts:140-152; src/runtime/secret-egress-hook.ts:280-284 |
| `RD03-017` | secret egress hookは、pushの比較基点をupstreamまたはorigin/mainとのmerge-baseから取得できない場合、遮断する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:165-172; src/runtime/secret-egress-hook.ts:280-284 |
| `RD03-018` | secret egress hookは、hook入力をJSONとして解析できない場合、exit 2で拒否する。 | tooling_runtime | hook | src/runtime/secret-egress-hook.ts:199-204 |
| `RD03-024` | secret egress hookは、処理中の例外でegress範囲を検証できなくなった場合、exit 2で遮断する。 | safety_security | hook | src/runtime/secret-egress-hook.ts:280-284 |
| `RD03-025` | egress dry-run評価は、external toolのegress policyが未定義の場合、errorとして不合格にする。 | safety_security | gate | src/runtime/security-credential-egress-guard.ts:45-56; src/runtime/security-credential-egress-guard.ts:81-84 |
| `RD03-026` | egress dry-run評価は、allowlist policyなのにallowed_hostsが空の場合、errorとして不合格にする。 | safety_security | gate | src/runtime/security-credential-egress-guard.ts:57-63; src/runtime/security-credential-egress-guard.ts:81-84 |
| `RD03-029` | session logは、ログ記録・圧縮処理が失敗してもhookのworkflowを停止せず、各hook handlerは0を返す。 | tooling_runtime | hook | src/runtime/session-log.ts:279-318; src/runtime/session-log.ts:454-469; src/runtime/session-log.ts:504-507; src/runtime/session-log.ts:571-574 |
| `RD03-032` | session logは、session IDやPLAN IDをファイル名に使う際、英数字・ピリオド・underscore・hyphen以外をunderscoreへ置換する。 | safety_security | hook | src/runtime/session-log.ts:162-165; src/runtime/session-log.ts:291-297; src/runtime/session-log.ts:552-558 |
| `RD03-037` | session logのJSONL parserは、JSONとして壊れた行を読み飛ばして残りの処理を続行する。 | tooling_runtime | hook | src/runtime/session-log.ts:365-376 |
| `RD03-041` | slot admissionは、accounting rowが規定の9 field集合と構造検査を満たさない場合、拒否する。未知fieldによって欠落を相殺することも認めない。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:269-325 |
| `RD03-042` | slot admissionは、slot_stateが定義済み状態集合に含まれない場合、入力不正として拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:198-208; src/runtime/slot-scheduler-quota-handover.ts:327-329 |
| `RD03-054` | dispatch admissionは、開始・終了時刻が両方存在し、終了が開始以降と確認できない場合、拒否する。 | evidence_claim | gate | src/runtime/slot-scheduler-quota-handover.ts:359-361; src/runtime/slot-scheduler-quota-handover.ts:434-436 |
| `RD03-055` | queue追加は、task IDまたは既存ID一覧が不正な場合、拒否する。 | tooling_runtime | gate | src/runtime/slot-scheduler-quota-handover.ts:448-455 |
| `RD03-065` | quota handoverは、後任ownerの識別子が不正な場合、拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:519-521 |
| `RD03-071` | frontier再計算は、merged lane ID・merged HEAD・再検証base HEADの形式が不正な場合、拒否する。 | process_gate | gate | src/runtime/slot-scheduler-quota-handover.ts:596-602 |
| `RD03-076` | specialist registry検証は、sync source pathが安全なPOSIX repository相対pathでない場合、拒否する。 | safety_security | gate | src/runtime/specialist-agent-registry.ts:13-23; src/runtime/specialist-agent-registry.ts:129-141 |
| `RD03-079` | specialist registryは、schema検証に失敗するかJSONを読込み・解析できない場合、不合格にする。 | tooling_runtime | gate | src/runtime/specialist-agent-registry.ts:129-141; src/runtime/specialist-agent-registry.ts:218-236 |
| `RD03-111` | finding資格判定は、trigger evidenceがobjectでないか規定のfield集合と一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:134-140; src/runtime/universal-improvement-finding-qualification.ts:560-561 |
| `RD03-112` | finding資格判定は、trigger evidenceの必須識別子が識別子形式を満たさない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:141-152 |
| `RD03-113` | finding資格判定は、trigger kindが定義済み集合に含まれない場合、失敗する。 | process_gate | gate | src/runtime/universal-improvement-finding-qualification.ts:15-24; src/runtime/universal-improvement-finding-qualification.ts:153-155 |
| `RD03-114` | finding資格判定は、trigger verdictがtriggeredまたはnot_triggeredでない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:156-158 |
| `RD03-115` | finding資格判定は、event ID一覧が空・非配列・不正形式の場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:159-165 |
| `RD03-116` | finding資格判定は、event digest一覧が空・非配列・不正digestを含む場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:166-172 |
| `RD03-117` | finding資格判定は、trigger evidenceまたは正規化eventの反証digest一覧が不正形式、重複、未整列の場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:173-180; src/runtime/universal-improvement-finding-qualification.ts:366-374 |
| `RD03-118` | finding資格判定は、superseded_byがnullでも有効な識別子でもない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:182-184 |
| `RD03-119` | finding資格判定は、recurrence lineageが不正なfinding IDを含むか一意・整列済み集合でない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:185-192 |
| `RD03-121` | finding資格判定は、trigger evidenceのobserved_atを有効な時刻として解析できない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:199-201 |
| `RD03-122` | finding資格判定は、expires_atが不正またはobserved_at以前の場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:199-203 |
| `RD03-128` | finding資格判定は、正規化eventがobjectでないか規定field集合と異なる場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:286-290 |
| `RD03-129` | finding資格判定は、正規化eventのschema versionが期待値と異なる場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:291-292 |
| `RD03-130` | finding資格判定は、正規化eventのIDがuil-event形式でない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:293-294 |
| `RD03-131` | finding資格判定は、正規化eventのregistry・source・detector・correlation識別情報が不正な場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:295-306 |
| `RD03-132` | finding資格判定は、正規化eventのregistry source digest・registry bytes digest・event digestがsha256形式でない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:307-314 |
| `RD03-134` | finding資格判定は、正規化eventのobserved情報の構造、revision、時刻、payload digest、evidence digestが不正な場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:328-343 |
| `RD03-135` | finding資格判定は、null以外のpredictionが所定構造・有効revision・payload digestを満たさない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:344-353 |
| `RD03-136` | finding資格判定は、confidenceが所定構造を欠く、scoreが有限の0〜1でない、またはbasis digestが不正な場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:354-365 |
| `RD03-137` | finding資格判定は、null以外のcausation IDが正規event ID形式でない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:375-379 |
| `RD03-140` | finding資格判定は、正規化結果が所定field集合のobjectでない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:399-401 |
| `RD03-141` | finding資格判定は、正規化結果が成功でない、eventが空、集合digestが不正、またはerrorsが空配列でない場合、失敗する。 | process_gate | gate | src/runtime/universal-improvement-finding-qualification.ts:402-412 |
| `RD03-142` | finding資格判定は、正規化結果のevent IDが重複する場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:413-415 |
| `RD03-143` | finding資格判定は、正規化eventがIDのbytewise厳密昇順で並んでいない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:416-421 |
| `RD03-147` | finding資格判定は、trigger evidence入力が配列でないか空の場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:443-450 |
| `RD03-148` | finding資格判定は、同じevidence IDに異なる内容が割り当てられた場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:459-463 |
| `RD03-149` | finding資格判定は、trigger evidenceの観測時刻が評価時刻より未来の場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:464-465 |
| `RD03-156` | 観測normalizerは、入力集合が配列でないか空の場合、eventを出さず失敗する。 | process_gate | gate | src/runtime/universal-improvement-observation-normalizer.ts:162-168 |
| `RD03-157` | 観測normalizerは、入力またはregistry結果・observation・baseline・confidenceがobjectでない、predictionがnull/object以外、反証digestが配列以外の場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:78-100; src/runtime/universal-improvement-observation-normalizer.ts:240-242 |
| `RD03-158` | 観測normalizerは、correlation IDが有効な識別子でない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:101-103 |
| `RD03-159` | 観測normalizerは、null以外のcausation IDがuil-event形式に一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:104-106 |
| `RD03-160` | 観測normalizerは、confidence scoreが有限の0〜1でないかbasis digestが不正な場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:107-114 |
| `RD03-161` | 観測normalizerは、反証digest一覧にsha256形式でない値がある場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:115-120 |
| `RD03-162` | 観測normalizerは、baselineがmissingなのにrevisionまたはpayload digestがnullでない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:121-124 |
| `RD03-163` | 観測normalizerは、missing以外のbaselineがcurrent状態・有効revision・有効payload digestを満たさない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:125-131 |
| `RD03-164` | 観測normalizerは、null以外のpredictionに有効なrevisionまたはpayload digestがない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:132-138 |
| `RD03-165` | 観測normalizerは、source admissionが例外を投げた場合、registry結果不正として失敗する。 | process_gate | gate | src/runtime/universal-improvement-observation-normalizer.ts:176-182; src/runtime/universal-improvement-observation-normalizer.ts:240-242 |
| `RD03-167` | 観測normalizerは、生成eventのIDが重複する場合、全体を失敗させる。 | evidence_claim | gate | src/runtime/universal-improvement-observation-normalizer.ts:226-230; src/runtime/universal-improvement-observation-normalizer.ts:240-242 |
| `RD03-170` | source registry検証は、evidence contractのidentity fieldがrequired_fieldsに含まれない場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:175-185 |
| `RD03-171` | source registry検証は、evidence contractのdigest fieldがrequired_fieldsに含まれない場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:186-194 |
| `RD03-172` | source registry検証は、evidence contractのrequired_fieldsが重複する場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:195-201 |
| `RD03-173` | source registry検証は、registryがstrict schemaを満たさない場合、registryを返さず不合格にする。 | tooling_runtime | gate | src/runtime/universal-improvement-source-registry.ts:552-570 |
| `RD03-176` | source registry検証は、source IDが重複する場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:610-614 |
| `RD03-181` | source registry検証は、detector IDが重複する場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:663-668 |
| `RD03-183` | source registryのauthority binding評価は、repository rootが空または空白だけの場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:698-716 |
| `RD03-184` | source registryは、registryファイルを解決できない場合、missingとして不合格にする。 | tooling_runtime | gate | src/runtime/universal-improvement-source-registry.ts:719-733; src/runtime/universal-improvement-source-registry.ts:1004-1018 |
| `RD03-185` | source registryは、registry・integrity・authority・detectorの参照pathが安全なrepository相対pathでないか、実pathがrepository外またはroot自身になる場合、拒否する。 | safety_security | gate | src/runtime/universal-improvement-source-registry.ts:119-129; src/runtime/universal-improvement-source-registry.ts:394-410; src/runtime/universal-improvement-source-registry.ts:534-538; src/runtime/universal-improvement-source-registry.ts:734-745; src/runtime/universal-improvement-source-registry.ts:809-823 |
| `RD03-186` | source registryは、registry bytesの読込みまたはJSON解析に失敗した場合、不合格にする。 | tooling_runtime | gate | src/runtime/universal-improvement-source-registry.ts:749-766; src/runtime/universal-improvement-source-registry.ts:1036-1052 |
| `RD03-189` | source registry評価は、integrity記録の読込みまたはJSON解析に失敗した場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:825-842 |
| `RD03-190` | source registry評価は、integrity記録が所定schemaを満たさない場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:843-860 |
| `RD03-191` | source registry評価は、registry・integrity・authority・detectorを対象とした物理filesystem同一性の証明が失敗した場合、拒否する。 | safety_security | gate | src/runtime/universal-improvement-source-registry.ts:862-891 |
| `RD03-193` | source registry評価は、物理同一性の証明後にregistryまたはintegrityを再読できなくなった場合、拒否する。 | safety_security | gate | src/runtime/universal-improvement-source-registry.ts:915-929 |
| `RD03-197` | source registry評価は、detector実装ファイルを取得できない場合、不合格にする。 | tooling_runtime | gate | src/runtime/universal-improvement-source-registry.ts:534-540; src/runtime/universal-improvement-source-registry.ts:951-959 |
| `RD03-199` | source registry評価は、受入処理後の物理filesystem同一性の再検証が失敗した場合、不合格にする。 | safety_security | gate | src/runtime/universal-improvement-source-registry.ts:970-986 |
| `RD03-200` | source admissionは、registry評価が不合格、registry欠落、物理binding未検証、または内部保管proofと結果digestが一致しない場合、拒否する。 | safety_security | gate | src/runtime/universal-improvement-source-registry.ts:1068-1087 |
| `RD03-201` | source admissionは、observationが基本schemaを満たさない、または契約上の必須fieldが空でない文字列として存在しない場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1090-1105; src/runtime/universal-improvement-source-registry.ts:1164-1175 |
| `RD03-204` | source admissionは、observationのschema versionが登録sourceと異なる場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1137-1145 |
| `RD03-207` | source admissionは、payload_digestが所定のsha256形式でない場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1176-1184 |
| `RD03-208` | source admissionは、evidence_digestが所定のsha256形式でない場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1185-1193 |
| `RD03-209` | source admissionは、observed_atがtimezone付きの有効な日時でないか評価時刻が不正な場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:427-452; src/runtime/universal-improvement-source-registry.ts:1194-1203 |
| `RD03-210` | source admissionは、observed_atが評価時刻より未来の場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1204-1211 |
| `RD03-215` | consumer CLI解決は、PATH解決済みでなくwrapper pathもabsolute resolverも指定されていない場合、fail_closeを返す。 | tooling_runtime | gate | src/runtime/upstream-adoption.ts:201-211 |
| `RD03-232` | Windows canary policy検証は、所定のfield集合・schema・lane・識別子・正整数の容量や時間・measurement window・許可されたbackpressure dispositionを満たさない場合、拒否する。 | tooling_runtime | gate | src/runtime/windows-lite-canary-admission.ts:165-190 |
| `RD03-234` | Windows canary lease binding検証は、所定field集合・schema・lane・識別子・正整数・HEAD・digest・正規ISO時刻を満たさない場合、拒否する。 | evidence_claim | gate | src/runtime/windows-lite-canary-admission.ts:147-150; src/runtime/windows-lite-canary-admission.ts:210-235 |
| `RD03-236` | Windows canary lease binding検証は、expires_atがissued_at以下の場合、拒否する。 | tooling_runtime | gate | src/runtime/windows-lite-canary-admission.ts:245-247 |
| `RD03-237` | Windows canary queue評価は、queue状態が所定構造でないかstate_knownがtrueでない場合、不確実状態として拒否する。 | tooling_runtime | gate | src/runtime/windows-lite-canary-admission.ts:288-297 |
| `RD03-242` | Windows canary lease評価は、照合するbinding・current binding・観測時刻・最終heartbeat時刻が不正な場合、不確実状態として拒否する。 | lane_delegation | gate | src/runtime/windows-lite-canary-admission.ts:350-359 |
| `RD03-243` | Windows canary lease評価は、観測時刻がlease発行時刻より前の場合、拒否する。 | evidence_claim | gate | src/runtime/windows-lite-canary-admission.ts:360-365 |
| `RD04-001` | 独立レビュー検証器は、キー集合・種別・digest形式・verdictが不正なレビューcapabilityを拒否する。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:127-149 |
| `RD04-023` | 委譲receipt検証器は、封印済みオブジェクトでない場合、厳密な構造検証と内容digestの一致を満たさないreceiptを拒否する。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:443-465 |
| `RD04-024` | 親受入receiptの識別器は、このモジュールが封印したオブジェクト以外を受入capabilityと認めない。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:468-475 |
| `RD04-025` | work-guard hookは、入力が空白だけの場合にexit 2でブロックする。 | tooling_runtime | hook | src/runtime/work-guard-hook.ts:52-54 |
| `RD04-026` | work-guard hookは、入力JSONを解析できない場合にexit 2でブロックする。 | tooling_runtime | hook | src/runtime/work-guard-hook.ts:55-59 |
| `RD04-027` | work-guard hookは、編集入力とshell commandのどちらからも対象パスを抽出できない場合にexit 0で通す。 | tooling_runtime | hook | src/runtime/work-guard-hook.ts:61-74 |
| `RD04-032` | work-guard hookは、対象stateの解決やguard transactionなどで例外が発生した場合にexit 2でブロックする。 | tooling_runtime | hook | src/runtime/work-guard-hook.ts:167-168 |
| `RD04-034` | work guardは、対象パスが空または対象集合が空の場合にpassを返す。 | tooling_runtime | hook | src/runtime/work-guard.ts:72-74; src/runtime/work-guard.ts:100-107 |
| `RD04-037` | blind benchmarkの凍結処理は、brokerが定義capabilityを受理せずexecutionを封印できない場合に例外で失敗する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:150-160 |
| `RD04-038` | blind packet作成器とbenchmark評価器は、封印済みbenchmark定義を取得できない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:167-168; src/runtime/worker-blind-benchmark.ts:331-332 |
| `RD04-039` | blind packet作成器は、candidate IDが許可された小文字英数字・記号の形式を満たさない場合に拒否する。 | tooling_runtime | gate | src/runtime/worker-blind-benchmark.ts:138-140; src/runtime/worker-blind-benchmark.ts:169-169 |
| `RD04-044` | judge context作成器とbenchmark評価器は、封印台帳に無いblind packetを拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:234-238; src/runtime/worker-blind-benchmark.ts:340-341 |
| `RD04-045` | judge context作成器は、brokerがpacketからjudge contextを封印できない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:239-240 |
| `RD04-048` | benchmark評価器は、candidate IDが評価集合内で重複した場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:344-345 |
| `RD04-050` | benchmark評価器は、judge出力の実行originまたはjudge contextとの結び付きを検証できない場合に拒否する。 | review_merge | gate | src/runtime/worker-blind-benchmark.ts:349-356 |
| `RD04-053` | benchmark評価器は、judge出力が所定JSON構造・対象packet digest・一意のdimension IDを満たさない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:278-315; src/runtime/worker-blind-benchmark.ts:364-368 |
| `RD04-054` | benchmark評価器は、scoreのdimension集合がrubricと異なる、またはdurationが非負の安全な整数でない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:250-264; src/runtime/worker-blind-benchmark.ts:369-370 |
| `RD04-055` | benchmark評価器は、scoreが有限数でない、または対応rubricの最小値・最大値を外れる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:265-270; src/runtime/worker-blind-benchmark.ts:369-370 |
| `RD04-056` | benchmark receiptの識別・risk取得器は、封印台帳に無いreceiptを有効と認めずriskも返さない。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:408-417 |
| `RD04-057` | worker context境界のloaderは、ファイル読取・JSON解析・HEAD取得に失敗する、または境界検証を満たさない場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:108-137 |
| `RD04-058` | context authority認証器は、要求HEADが40桁小文字16進数でない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-context-packet.ts:166-168; src/runtime/worker-context-packet.ts:224-227 |
| `RD04-059` | context authority認証器は、repository実体パスまたは現在HEADを解決できない場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:228-239 |
| `RD04-062` | context authority認証器は、authority一覧が空・重複・許可外・不正pathである、通常ファイルでない、読取不能、または作業木とHEADの内容が異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:191-221; src/runtime/worker-context-packet.ts:244-250 |
| `RD04-063` | context authority認証器は、rule一覧が空・重複・許可外・不正pathである、通常ファイルでない、読取不能、または作業木とHEADの内容が異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:191-221; src/runtime/worker-context-packet.ts:251-257 |
| `RD04-064` | context再認証器とpacket作成器は、封印台帳に無いauthority capabilityを拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:271-274; src/runtime/worker-context-packet.ts:360-360 |
| `RD04-067` | context packet作成器は、workflow style・case model・specialist processが各許可集合に属さない場合に拒否する。 | process_gate | gate | src/runtime/worker-context-packet.ts:291-304; src/runtime/worker-context-packet.ts:361-361 |
| `RD04-069` | context packet作成器は、time_msとtoken_limitがともに正の安全な整数でなければ拒否する。 | tooling_runtime | gate | src/runtime/worker-context-packet.ts:339-349; src/runtime/worker-context-packet.ts:363-363 |
| `RD04-070` | context packet作成器は、severity policy・出力schemaのdigestが不正、またはpayloadが空の文字列や文字列以外の場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:364-370 |
| `RD04-071` | context envelope検証器は、packet capabilityが封印台帳に無い場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:405-421 |
| `RD04-076` | descriptor admissionの検証器は、admittedという判定と、空の拒否理由・非nullのdescriptor/source digestという条件が同値でないdecisionを拒否する。 | evidence_claim | gate | src/runtime/worker-descriptor-admission.ts:156-169; src/runtime/worker-descriptor-admission.ts:442-443 |
| `RD04-081` | descriptor parser・registry投影器・snapshot正規化器・要求解決器は、各入力が所定の厳密schemaを満たさない場合に拒否する。 | tooling_runtime | gate | src/runtime/worker-descriptor-admission.ts:261-274; src/runtime/worker-descriptor-admission.ts:298-302; src/runtime/worker-descriptor-admission.ts:343-354; src/runtime/worker-descriptor-admission.ts:381-387 |
| `RD04-082` | registry snapshot正規化器は、revisionが1以上の安全な整数でない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-descriptor-admission.ts:337-354 |
| `RD04-091` | isolation brokerは、resolverでpacketを取得できないcapabilityからjudge contextを発行しない。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:312-316 |
| `RD04-094` | isolation authority認証器は、runtime catalogを制限内の通常ファイルとして取得・解析できない場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:392-413 |
| `RD04-095` | isolation authority認証器は、catalogのversion・配列構造が不正、またはbackend IDとdigestの組が登録されていない場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:414-423 |
| `RD04-097` | isolation authority認証器は、backendが絶対pathの実行可能な通常ファイルでない、読取不能、またはdigestが期待値と異なる場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:344-360; src/runtime/worker-isolation-broker.ts:431-434 |
| `RD04-098` | isolation authority認証器は、runtimeが絶対pathの実行可能な通常ファイルでない、読取不能、またはdigestが期待値と異なる場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:344-360; src/runtime/worker-isolation-broker.ts:435-438 |
| `RD04-099` | isolation brokerは、入力pathが空・NUL含有・絶対path・repository外、または..・.git・.helix・harness.dbを指す場合に入力を拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:449-462; src/runtime/worker-isolation-broker.ts:485-494; src/runtime/worker-isolation-broker.ts:618-619 |
| `RD04-100` | isolation brokerは、入力pathの途中にsymlinkがある、対象が通常ファイルでない、または実体を確認できない場合に入力を拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:463-474; src/runtime/worker-isolation-broker.ts:481-487; src/runtime/worker-isolation-broker.ts:618-619 |
| `RD04-101` | isolation brokerは、入力ファイルの全byteを読み切れない、読取前後でsizeが変わる、または読取に失敗した場合に入力を拒否する。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:495-508; src/runtime/worker-isolation-broker.ts:618-619 |
| `RD04-108` | isolation brokerは、repository実体・HEAD・scratch directoryを準備または解決できない場合に拒否する。 | tooling_runtime | gate | src/runtime/worker-isolation-broker.ts:557-571 |
| `RD04-112` | isolation brokerは、scratch baseがrepository内、またはrepositoryがscratch base内にある場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:591-593 |
| `RD04-113` | isolation brokerは、isolation authorityのrootが対象repositoryと異なる場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:594-596 |
| `RD04-114` | isolation brokerは、wrapperの起動commandが認証済みruntime pathと異なる場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:597-599 |
| `RD04-115` | isolation brokerは、backendまたはruntimeを通常ファイル・64MiB以下・完全読取・size不変・期待digest一致でcaptureできない場合に起動を拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:363-389; src/runtime/worker-isolation-broker.ts:600-609 |
| `RD04-116` | isolation brokerは、区切り文字正規化後の入力pathが重複した場合に拒否する。 | tooling_runtime | gate | src/runtime/worker-isolation-broker.ts:611-617 |
| `RD04-117` | isolation brokerは、入力1ファイルが4MiB、または入力総量が16MiBを超える場合に拒否する。 | tooling_runtime | gate | src/runtime/worker-isolation-broker.ts:49-50; src/runtime/worker-isolation-broker.ts:495-496; src/runtime/worker-isolation-broker.ts:620-624 |
| `RD04-125` | isolation実行器は、封印launchにbroker所有のresource・policy・出力binding・実行bindingが欠ける場合に例外で失敗する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:753-758 |
| `RD04-129` | isolation実行器は、stdoutの出力admissionに失敗した場合に成功を返さない。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:795-798 |
| `RD04-139` | isolation policy認証器は、書込pathが空・NUL含有・絶対path・不正成分・管理領域を含む場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-policy.ts:67-85; src/runtime/worker-isolation-policy.ts:110-115 |
| `RD04-140` | isolation policy識別器は、このモジュールの封印台帳に無いオブジェクトをpolicy capabilityと認めない。 | safety_security | gate | src/runtime/worker-isolation-policy.ts:127-134 |
| `RD04-141` | scope監査器は、workspace内ファイルが通常ファイルでない、4MiBを超える、読取不能、完全読取不能、または読取中にsizeや種別が変わる場合に失敗する。 | safety_security | gate | src/runtime/worker-isolation-policy.ts:15-15; src/runtime/worker-isolation-policy.ts:137-158; src/runtime/worker-isolation-policy.ts:194-196; src/runtime/worker-isolation-policy.ts:217-218 |
| `RD04-142` | scope監査器は、workspaceの実体解決・directory走査・entry読取に失敗した場合に監査失敗とする。 | safety_security | gate | src/runtime/worker-isolation-policy.ts:161-179; src/runtime/worker-isolation-policy.ts:203-218 |
| `RD04-143` | scope監査器は、workspaceのdirectory深さが64を超える場合に失敗する。 | tooling_runtime | gate | src/runtime/worker-isolation-policy.ts:18-18; src/runtime/worker-isolation-policy.ts:173-174; src/runtime/worker-isolation-policy.ts:217-218 |
| `RD04-144` | scope監査器は、workspaceのentry数が4096を超える場合に失敗する。 | tooling_runtime | gate | src/runtime/worker-isolation-policy.ts:17-17; src/runtime/worker-isolation-policy.ts:184-185; src/runtime/worker-isolation-policy.ts:217-218 |
| `RD04-145` | scope監査器は、workspaceにsymlinkまたは通常ファイル・directory以外のentryがある場合に失敗する。 | safety_security | gate | src/runtime/worker-isolation-policy.ts:188-194; src/runtime/worker-isolation-policy.ts:217-218 |
| `RD04-146` | scope監査器は、workspace内ファイルの総量が16MiBを超える場合に失敗する。 | tooling_runtime | gate | src/runtime/worker-isolation-policy.ts:16-16; src/runtime/worker-isolation-policy.ts:197-198; src/runtime/worker-isolation-policy.ts:217-218 |
| `RD04-148` | lifecycle receipt作成器は、run・parent・childの識別子またはHEADが不正な場合に拒否する。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:149-163 |
| `RD04-149` | lifecycle receipt作成器と検証器は、child run IDに重複がある、または昇順に並んでいない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:121-127; src/runtime/worker-lifecycle-receipt.ts:155-162; src/runtime/worker-lifecycle-receipt.ts:270-270 |
| `RD04-153` | lifecycle receipt作成器と検証器は、approveなのにacceptedでない、またはrejectなのにacceptedである終了状態を拒否する。 | review_merge | gate | src/runtime/worker-lifecycle-receipt.ts:171-178; src/runtime/worker-lifecycle-receipt.ts:286-294 |
| `RD04-154` | lifecycle receipt作成器と検証器は、acceptedに非null理由がある、または非acceptedの理由が空・256文字超の場合に拒否する。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:174-178; src/runtime/worker-lifecycle-receipt.ts:274-279 |
| `RD04-155` | lifecycle receiptの識別器とserializerは、封印台帳に無いreceiptを有効と認めずserializeしない。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:238-252 |
| `RD04-156` | lifecycle receipt検証器は、JSON解析不能・非canonical JSON・余剰または不足キー・不正な識別子やdigest等を持つreceiptを拒否する。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:254-295 |
| `RD04-157` | lifecycle receipt検証器は、event数が7でない、sequenceが連番でない、またはrequestedからterminalまでの所定順序と異なる場合に拒否する。 | process_gate | gate | src/runtime/worker-lifecycle-receipt.ts:291-315 |
| `RD04-161` | worktree状態取得器は、Git status出力がNUL終端されない、record形式が不正、またはrename/copy元が欠ける場合に例外で失敗する。 | tooling_runtime | hook | src/runtime/worktree-state.ts:28-44 |
| `RD04-164` | 編集対象state解決器は、対象pathにNULがある、または既存の祖先を特定できない場合に例外で失敗する。 | safety_security | hook | src/runtime/worktree-state.ts:104-118 |
| `RD04-165` | 編集対象state解決器は、worktree内のsymlinkや、許可されたroot外別名に該当しないsymlink経由の対象を拒否する。 | safety_security | hook | src/runtime/worktree-state.ts:125-143; src/runtime/worktree-state.ts:158-166 |
| `RD04-166` | 編集対象state解決器は、対象worktreeと管理repositoryのGit common directoryが物理的に異なる場合に拒否する。 | lane_delegation | hook | src/runtime/worktree-state.ts:145-148 |
| `RD04-167` | 編集対象state解決器は、対象がworktree rootそのもの、worktree外、または相対化できない場合に拒否する。 | safety_security | hook | src/runtime/worktree-state.ts:149-157 |
| `RD04-216` | 承認検証command lintは、commandまたは&&で分割したcommandが、対象PLAN用packet・所定の状態確認・診断・検証commandのallowlistに無い場合に違反とする。 | tooling_runtime | lint | src/lint/action-binding-approval-readiness.ts:842-870 |
| `RD05-001` | branch-kindは、ローカルのrepository・HEAD・branch識別が不正な場合、PR snapshotを利用不可にする。 | evidence_claim | lint | src/lint/branch-kind.ts:53-64; src/lint/branch-kind.ts:110-117 |
| `RD05-004` | branch-kindは、PR providerの処理が例外になった場合、PR情報を利用不可にする。 | tooling_runtime | lint | src/lint/branch-kind.ts:126-130 |
| `RD05-005` | branch-kindは、非Git consumerとして適用外を宣言した入力にbranch・変更path・PLANが含まれている場合、矛盾として失敗させる。整合する適用外入力には警告を返す。 | process_gate | lint | src/lint/branch-kind.ts:249-262 |
| `RD05-006` | branch-kindは、比較authorityがunavailableの場合、検査を失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:265-277 |
| `RD05-007` | branch-kindは、strictUnknownPrefixが有効で未登録のbranch prefixを検出した場合、失敗させる。 | process_gate | lint | src/lint/branch-kind.ts:192-232; src/lint/branch-kind.ts:280-286 |
| `RD05-012` | branch-kindは、snapshotのbaseHead・candidateHead・branchのいずれかが空の場合、snapshot読取りを失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:524-527 |
| `RD05-013` | branch-kindは、baseHeadまたはcandidateHeadが小文字16進40桁の完全SHAでない場合、失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:528-529 |
| `RD05-014` | branch-kindは、snapshotのbranchが空またはHEADの場合、branch識別不能として失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:530-531 |
| `RD05-015` | branch-kindは、指定SHAのcommit実在性検査結果が指定値と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:532-535 |
| `RD05-018` | branch-kindは、merge-baseが一つの完全SHAに解決しない場合、失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:546-550 |
| `RD05-019` | branch-kindは、変更pathに絶対path、backslash、改行、または「.」「..」のpath要素が含まれる場合、失敗させる。 | safety_security | lint | src/lint/branch-kind.ts:576-585 |
| `RD05-020` | branch-kindは、working PLANの読取り失敗を削除扱いにするのは、Gitが削除を示すかbaseに存在してcandidateから削除済みの場合だけに限定する。それ以外の欠落や読取りエラーは失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:609-620; src/lint/branch-kind.ts:664-672 |
| `RD05-021` | branch-kindは、変更PLANにfrontmatterがない場合、失敗させる。 | process_gate | lint | src/lint/branch-kind.ts:624-630 |
| `RD05-022` | branch-kindは、PLAN frontmatterがobjectでない、配列である、またはYAML解析に失敗した場合、失敗させる。 | process_gate | lint | src/lint/branch-kind.ts:631-633; src/lint/branch-kind.ts:664-672 |
| `RD05-024` | branch-kindは、非Git適用外宣言について、Gitの所定の非repositoryエラーと親階層を含む.git不在を確認できない場合、失敗させる。 | process_gate | lint | src/lint/branch-kind.ts:677-693; src/lint/branch-kind.ts:720-749 |
| `RD05-025` | branch-kindは、snapshotが指定されていない場合、比較authorityを利用不可にする。 | evidence_claim | lint | src/lint/branch-kind.ts:751-757 |
| `RD05-033` | change-impactのGit適用判定は、work-tree確認が失敗した場合、非Gitとしてfalseを返す。コメント上は非Git consumerの検査をskipするための前段とされる。 | tooling_runtime | lint | src/lint/change-impact.ts:344-359 |
| `RD05-034` | completion-decision-packetは、packetのschemaVersionがcompletion-decision-packet.v1でない場合、失敗させる。review bundleもcompletion-review-bundle.v1以外を失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:218-223; src/lint/completion-decision-packet.ts:1893-1898 |
| `RD05-036` | completion-decision-packetは、ok=trueでstatusがready以外、またはok=falseでstatusがblocked以外の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:232-237 |
| `RD05-043` | completion-decision-packetは、packetまたはreview bundleのgeneratedAtが欠落している場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:310-314; src/lint/completion-decision-packet.ts:1899-1903 |
| `RD05-044` | completion-decision-packetは、packetまたはreview bundleのgeneratedAtが日時として解析できない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:310-314; src/lint/completion-decision-packet.ts:1899-1903 |
| `RD05-045` | completion-decision-packetは、packetのsourceCommandが許可されたstatusまたはdecision-packetのJSONコマンドでない場合、失敗させる。review bundleは専用review-bundleコマンドとの一致を要求する。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:129-132; src/lint/completion-decision-packet.ts:316-321; src/lint/completion-decision-packet.ts:1904-1909 |
| `RD05-046` | completion-decision-packetは、packetまたはreview bundleのfreshness.policyがdecision-packet-freshness.v1でない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:323-328; src/lint/completion-decision-packet.ts:1918-1923 |
| `RD05-047` | completion-decision-packetは、packetまたはreview bundleのvalidForMinutesが有限の正数でない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:330-335; src/lint/completion-decision-packet.ts:1924-1929 |
| `RD05-048` | completion-decision-packetは、packetまたはreview bundleのexpiresAtが日時として解析できない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:337-339; src/lint/completion-decision-packet.ts:1930-1932 |
| `RD05-049` | completion-decision-packetは、生成日時と有効期間が計算可能な場合、expiresAtがその加算結果のISO文字列に一致しなければ失敗させる。packetとreview bundleの双方に適用する。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:339-347; src/lint/completion-decision-packet.ts:1932-1940 |
| `RD05-050` | completion-decision-packetは、packetまたはreview bundleのstaleフラグが現在時刻と期限からの再計算結果に一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:349-358; src/lint/completion-decision-packet.ts:1941-1950 |
| `RD05-051` | completion-decision-packetは、packetまたはreview bundleがstaleと判定された場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:360-365; src/lint/completion-decision-packet.ts:1951-1956 |
| `RD05-054` | completion-decision-packetは、humanReviewBundleのschemaVersionがcompletion-decision-human-review-bundle.v1でない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:381-386 |
| `RD05-055` | completion-decision-packetは、humanReviewBundleのstatusが元packetと一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:387-392 |
| `RD05-056` | completion-decision-packetは、humanReviewBundleのsourceCommandが元packetと一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:393-398 |
| `RD05-057` | completion-decision-packetは、humanReviewBundleのgeneratedAtが元packetと一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:399-404 |
| `RD05-061` | completion-decision-packetは、humanReviewBundle.itemsが配列でない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:423-427 |
| `RD05-086` | completion-decision-packetは、補助summaryのschemaVersion・matrixField・expectedMatrixCountがコマンド別の所定契約と一致しない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:720-729; src/lint/completion-decision-packet.ts:1257-1642 |
| `RD05-091` | completion-decision-packetは、補助summaryのrequiredMatrixFieldsに所定の必須matrix fieldが欠ける場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:764-771 |
| `RD05-098` | completion-decision-packetは、decision.requiredRecordsが非配列または空の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:820-826 |
| `RD05-101` | completion-decision-packetは、recordTemplatesが非配列または空の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:845-850 |
| `RD05-102` | completion-decision-packetは、requiredRecords・outcome記録・route記録・templateの各集合にrecordNameの重複がある場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:851-885; src/lint/completion-decision-packet.ts:1081-1094; src/lint/completion-decision-packet.ts:1684-1696 |
| `RD05-103` | completion-decision-packetは、requiredRecords・outcome記録・route記録・templateの各集合に必要なrecordNameが欠ける場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:851-885; src/lint/completion-decision-packet.ts:1095-1103; src/lint/completion-decision-packet.ts:1698-1706 |
| `RD05-104` | completion-decision-packetは、requiredRecords・outcome記録・route記録・templateの各集合に期待されないrecordNameがある場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:851-885; src/lint/completion-decision-packet.ts:1104-1111; src/lint/completion-decision-packet.ts:1707-1714 |
| `RD05-105` | completion-decision-packetは、required recordのrecordNameが空の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:886-893 |
| `RD05-106` | completion-decision-packetは、required recordのfieldsが非配列または空の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:894-898 |
| `RD05-107` | completion-decision-packetは、required recordのfield名が空またはTBD・TODO・「-」の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:899-908 |
| `RD05-109` | completion-decision-packetは、required recordのsourcePathが空またはTBD・TODO・「-」の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:915-921 |
| `RD05-110` | completion-decision-packetは、required recordのsourcePathが絶対path、drive付き絶対path、または「..」を含む場合、失敗させる。 | safety_security | lint | src/lint/completion-decision-packet.ts:476-479; src/lint/completion-decision-packet.ts:922-926 |
| `RD05-111` | completion-decision-packetは、sourcePathExistsが提供されていて根拠pathの不存在を返した場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:927-932 |
| `RD05-112` | completion-decision-packetは、source ledger検査のpathまたはlabelが空、またはpathが危険な場合、失敗させる。 | safety_security | lint | src/lint/completion-decision-packet.ts:935-944 |
| `RD05-114` | completion-decision-packetは、sourceTextが提供されていて台帳本文を取得できない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:951-959 |
| `RD05-116` | completion-decision-packetは、source ledgerの確認日検査が違反を返した場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:967-977 |
| `RD05-119` | completion-decision-packetは、recordのoutcomeが空またはTBD・TODO・「-」の場合、失敗させる。 | escalation_authority | lint | src/lint/completion-decision-packet.ts:1005-1012 |
| `RD05-124` | completion-decision-packetは、templateのinsertionHintが空またはTBD・TODO・「-」の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:1113-1122 |
| `RD05-126` | completion-decision-packetは、templateのyamlLinesが非配列または空の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:1133-1139 |
| `RD05-128` | completion-decision-packetは、通常版または日本語版templateの先頭行が「recordName:」と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:1146-1151; src/lint/completion-decision-packet.ts:1168-1173 |
| `RD05-129` | completion-decision-packetは、通常版または日本語版templateにrequired recordの各fieldを示す「- field:」が欠ける場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:1152-1160; src/lint/completion-decision-packet.ts:1174-1182 |
| `RD05-145` | completion-review-bundleは、reviewPackets全体がdecision packetの補助summaryから導出した配列と一致しない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:2056-2061; src/lint/completion-decision-packet.ts:2123-2149 |
| `RD05-190` | db-projection-coverageの要件loaderは、所定のphysical-data.mdがない場合、例外で失敗させる。 | process_gate | lint | src/lint/db-projection-coverage.ts:177-188 |
| `RD05-195` | ddd-tdd-rulesは、policyに所定集合外のrule IDが宣言されている場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:328-336 |
| `RD05-247` | descent-obligationは、adjacency設定が存在しない、JSON読取り・解析に失敗する、またはrulesが配列でない場合、既定規則へfallbackする。 | tooling_runtime | lint／config | src/lint/descent-obligation.ts:248-258 |
| `RD06-001` | lintは、設計成果物ダイジェストbaselineのschema_versionが所定値でない場合、検証を失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:177-180 |
| `RD06-002` | lintは、設計成果物ダイジェストbaselineのentriesが配列でない場合、検証を失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:181-183 |
| `RD06-003` | lintは、baseline entryの設計・成果物パスが安全なリポジトリ相対パスでない場合、またはpinned_digestが所定のSHA-256形式でない場合、検証を失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:96-110; src/lint/design-artifact-source-digest.ts:161-187 |
| `RD06-004` | lintは、設計パス・成果物パス・固定ダイジェストの組がbaseline内で重複する場合、検証を失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:142-148; src/lint/design-artifact-source-digest.ts:188-191 |
| `RD06-006` | lintは、baselineの読み込み・JSON解析・検証で例外が発生した場合、baseline_invalidとしてok=falseを返す。 | process_gate | lint | src/lint/design-artifact-source-digest.ts:205-210; src/lint/design-artifact-source-digest.ts:262-276 |
| `RD06-009` | lintは、現行実装資産のartifact_pathが空、絶対パス、バックスラッシュ・NUL・相対移動segmentを含むなど安全な相対パスでない場合、失敗させる。 | safety_security | lint | src/lint/design-artifact-source-digest.ts:100-110; src/lint/design-artifact-source-digest.ts:309-314 |
| `RD06-012` | lintは、現行実装資産の実パスがリポジトリ外にある場合、または実パスを確認できない場合、失敗させる。 | safety_security | lint | src/lint/design-artifact-source-digest.ts:228-239; src/lint/design-artifact-source-digest.ts:331-334 |
| `RD06-014` | design-coverage lintは、設計catalogを読み込めず入力がnullとなった場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:137-149; src/lint/design-coverage.ts:210-225 |
| `RD06-015` | design-coverage lintは、catalogのschema_versionが所定値でない、またはcategories・itemsが配列でない場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:227-246 |
| `RD06-016` | design-coverage lintは、itemのstatusがdone・todo・naのいずれでもない場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:19-20; src/lint/design-coverage.ts:261-271 |
| `RD06-017` | design-coverage lintは、itemのcategoryがcatalogのcategoriesに存在しない場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:273-279 |
| `RD06-020` | design-coverage lintは、有効なsourceが複数itemで重複する場合、失敗させる。 | evidence_claim | lint | src/lint/design-coverage.ts:293-301 |
| `RD06-024` | design-coverage lintは、doneのartifactが正規形の相対パスでない、または許可された配置範囲外の場合、失敗させる。 | safety_security | lint | src/lint/design-coverage.ts:49-51; src/lint/design-coverage.ts:180-196; src/lint/design-coverage.ts:329-342 |
| `RD06-026` | design-coverage lintは、item IDが複数回出現する場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:354-358 |
| `RD06-032` | design-reality-binding lintは、空failure bindingのbaselineが所定schemaのobjectでない、またはentriesが配列でない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:230-239 |
| `RD06-033` | design-reality-binding lintは、空failure bindingのbaseline entryが相対パス条件を満たさない、またはHELIXのL4・L5設計パスでない場合、失敗させる。 | process_gate | lint | src/lint/design-reality-binding.ts:81-83; src/lint/design-reality-binding.ts:202-208; src/lint/design-reality-binding.ts:240-245 |
| `RD06-034` | design-reality-binding lintは、空failure bindingのbaseline entryが重複する場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:246-249 |
| `RD06-036` | design-reality-binding lintは、failure witnessがobjectでない、必須文字列が空または文字列でない、あるいはidentity・post-check・fixture・mutationの基本型が不正な場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:673-701 |
| `RD06-037` | design-reality-binding lintは、failure witnessのsource_pathが空・絶対パス・親移動segmentを含むパスの場合、失敗させる。 | safety_security | lint | src/lint/design-reality-binding.ts:202-208; src/lint/design-reality-binding.ts:702-704 |
| `RD06-041` | design-reality-binding lintは、failure witnessのtest_pathが相対パス条件を満たさない場合、失敗させる。 | safety_security | lint | src/lint/design-reality-binding.ts:202-208; src/lint/design-reality-binding.ts:725-726 |
| `RD06-049` | design-reality-binding lintは、資産がobjectでない、またはasset_id・classificationが文字列でない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:806-819 |
| `RD06-056` | design-reality-binding lintは、compatibility_only資産が存在しない、または実パスがリポジトリ外の場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:863-865 |
| `RD06-057` | design-reality-binding lintは、資産分類がplanned_new・compatibility_only・existing_runtimeのいずれでもない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:820-820; src/lint/design-reality-binding.ts:853-869 |
| `RD06-058` | design-reality-binding lintは、existing_runtime資産のパス、resource_name、許可resource_kind、source_digest、current_authority=trueの検査を満たさない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:870-880 |
| `RD06-064` | design-reality-binding lintは、json_schema資産をJSONとして解析できない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:895-901 |
| `RD06-066` | design-reality-binding lintは、空failure bindingのbaselineの読み込み・解析・検証に失敗した場合、ok=falseを返す。baselineファイル自体がない場合は空集合として扱う。 | process_gate | lint | src/lint/design-reality-binding.ts:264-270; src/lint/design-reality-binding.ts:954-969 |
| `RD06-099` | document-agent-metadata lintは、manifestのダイジェスト生成でJSONに正規化できない値を処理した場合、例外を投げる。 | tooling_runtime | lint | src/lint/document-agent-metadata.ts:47-65 |
| `RD06-100` | document-agent-metadata lintは、文書の参照先宣言IDがregistryにない場合、errorとして失敗させる。 | evidence_claim | lint | src/lint/document-agent-metadata.ts:86-98; src/lint/document-agent-metadata.ts:292-299 |
| `RD06-107` | document-agent-metadata lintは、manifestの対象文書集合が空の場合、失敗させる。 | process_gate | lint | src/lint/document-agent-metadata.ts:209-218 |
| `RD06-108` | document-agent-metadata lintは、manifestのinclude root・exclude root・対象文書パスが空、先頭スラッシュ、バックスラッシュ、空・ドット・親移動segmentを含む場合、失敗させる。 | safety_security | lint | src/lint/document-agent-metadata.ts:19-25; src/lint/document-agent-metadata.ts:219-224 |
| `RD06-110` | document-agent-metadata lintは、manifestに列挙された文書が入力文書集合にない場合、失敗させる。 | process_gate | lint | src/lint/document-agent-metadata.ts:246-253 |
| `RD06-111` | document-agent-metadata lintは、対象文書がinclude root配下でない、またはexclude root配下にある場合、失敗させる。 | process_gate | lint | src/lint/document-agent-metadata.ts:254-262 |
| `RD06-112` | document-agent-metadata lintは、対象文書の型付き宣言parserがerrorを返している場合、失敗させる。 | process_gate | lint | src/lint/document-agent-metadata.ts:263-270 |
| `RD06-113` | drive-db-registration lintは、DB統計入力がない場合、missing_dbとして失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:72-83 |
| `RD06-120` | drive-db-registration lintは、workflow orphan件数が正の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:103-105 |
| `RD06-122` | drive-db-registration lintは、model orphan件数が正の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:107-109 |
| `RD06-124` | drive-db-registration lintは、孤立したskill推薦の件数が正の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:113-118 |
| `RD06-126` | drive-db-registration lintは、孤立したskill呼び出しの件数が正の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:120-122 |
| `RD06-138` | drive-route-catalog lintは、catalogが所定schemaを満たさない、または読み込み・JSON解析等で例外が起きた場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:189-208; src/lint/drive-route-catalog.ts:423-431 |
| `RD06-139` | drive-route-catalog lintは、route_idが重複する場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:212-216 |
| `RD06-140` | drive-route-catalog lintは、同一routeのentry_signalsに重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:222-229 |
| `RD06-141` | drive-route-catalog lintは、同一routeのallowed_kindsに重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:230-236 |
| `RD06-142` | drive-route-catalog lintは、同一routeのstart_layersに重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:237-243 |
| `RD06-143` | drive-route-catalog lintは、同一routeのphasesに重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:244-250 |
| `RD06-144` | drive-route-catalog lintは、同一routeのexit_conditionsに重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:251-257 |
| `RD06-145` | drive-route-catalog lintは、同一routeのnext_routesに重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:258-264 |
| `RD06-146` | drive-route-catalog lintは、同一routeのbranch_prefixesに重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:265-271 |
| `RD06-152` | drive-route-catalog lintは、projection_contractの各配列内に重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:318-326 |
| `RD06-153` | drive-route-catalog lintは、classified constructのconstruct_idが重複する場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:328-331 |
| `RD06-155` | drive-route-catalog lintは、classified constructのparent_routesまたはentry_signalsの配列内に重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:342-350 |
| `RD06-156` | drive-route-catalog lintは、specialist workflowのworkflow_idが重複する場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:353-356 |
| `RD06-159` | drive-route-catalog lintは、specialist workflowのentry_signals・required_artifacts・exit_conditionsの各配列内に重複がある場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:372-384 |
| `RD06-160` | drive-route-catalog lintは、catalogファイルが存在しない場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:396-406 |
| `RD06-162` | feedback-log lintは、エントリ節でFB行らしい書式を持ちながら解析できない行がある場合、失敗させる。 | memory_context | lint | src/lint/feedback-log.ts:117-124; src/lint/feedback-log.ts:165-173 |
| `RD06-163` | feedback-log lintは、解析したfeedback IDがFB-と3桁数字の形式でない場合、失敗させる。 | memory_context | lint | src/lint/feedback-log.ts:32-32; src/lint/feedback-log.ts:137-138; src/lint/feedback-log.ts:165-173 |
| `RD06-177` | FR registry監査lintは、機能要求行が7列未満の場合、属性不足として返す。 | process_gate | lint | src/lint/fr-registry-audit.ts:187-198 |
| `RD06-178` | FR registry監査lintは、機能要求名が空の場合、属性不足として返す。 | process_gate | lint | src/lint/fr-registry-audit.ts:192-198 |
| `RD07-001` | frontend-design-coverageは、各層のFE設計slugが当該層のスキーマに登録されていなければ失敗する。 | process_gate | lint | src/lint/frontend-design-coverage.ts:113-123 |
| `RD07-023` | g8-integration-workflowは、証拠manifestのschema_versionが指定値と異なれば失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:209-211 |
| `RD07-024` | g8-integration-workflowは、証拠manifestのgateがG8でなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:212-214 |
| `RD07-025` | g8-integration-workflowは、manifestのprofileまたはplan_idが空なら失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:215-217 |
| `RD07-028` | g8-integration-workflowは、manifest内でcommand_idが重複していれば失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:225-228 |
| `RD07-031` | g8-integration-workflowは、コマンドのoutput_digestがsha256接頭辞と64桁の16進数からなる形式でなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:238-242 |
| `RD07-032` | g8-integration-workflowは、coverageのit_idが重複していれば失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:250-253 |
| `RD07-037` | g8-integration-workflowは、必須IT coverageの証拠パスが許可された接頭辞を持たなければ失敗する。 | safety_security | lint | src/lint/g8-integration-workflow.ts:90-90; src/lint/g8-integration-workflow.ts:195-202; src/lint/g8-integration-workflow.ts:276-280 |
| `RD07-058` | 証拠コマンド検査は、evidence_pathが指定された工程の証拠ディレクトリ配下でなければ違反として拒否する。 | safety_security | lint | src/lint/gn-evidence-manifest.ts:150-160 |
| `RD07-068` | 共通gate証拠検査は、manifestのschema_versionが設定されたバージョンと異なれば違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:212-214 |
| `RD07-069` | 共通gate証拠検査は、manifestのgateが設定されたgateと異なれば違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:215-217 |
| `RD07-070` | 共通gate証拠検査は、manifestのprofileまたはplan_idが空なら違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:218-220 |
| `RD07-073` | 共通gate証拠検査は、manifestのcommand_idが重複していれば違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:228-231 |
| `RD07-076` | 共通gate証拠検査は、output_digestがsha256接頭辞と64桁の16進数からなる形式でなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:241-245 |
| `RD07-077` | 共通gate証拠検査は、コマンドが列挙したitem_idが設定された接頭辞を持たなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:251-257 |
| `RD07-078` | 共通gate証拠検査は、coverageのitem_idが重複していれば違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:260-263 |
| `RD07-085` | 共通gate証拠検査は、必須coverageの証拠パスが許可された接頭辞を持たなければ違反とする。 | safety_security | lint | src/lint/gn-evidence-manifest.ts:133-142; src/lint/gn-evidence-manifest.ts:302-306 |
| `RD07-093` | handover切替承認検証は、generated baselineのdigestが文字列の有効なSHA-256形式でなければ例外で拒否する。 | evidence_claim | lint | src/lint/handover-cutover-approval.ts:100-107 |
| `RD07-099` | handover復活検査は、対象パスが空、スラッシュ開始、NULを含む、または..成分を含む場合に拒否する。 | safety_security | lint | src/lint/handover-resurrection.ts:277-291 |
| `RD07-100` | handover復活検査は、baselineのschemaやpolicy digestが不一致、fingerprintsが配列でない、有効なSHA-256でない要素がある、または重複する場合に拒否する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:319-329 |
| `RD07-102` | handover復活検査は、generated baselineのschema・policy digest・projectionKindsが期待値と不一致、またはfingerprintsが不正・重複なら拒否する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:341-360 |
| `RD07-105` | handover復活検査は、baseline authorityのschema・参照先・revision・OID・digest・decisionIdの形式が不正なら拒否する。 | escalation_authority | lint | src/lint/handover-resurrection.ts:389-406 |
| `RD07-108` | handover復活検査は、preserve entryのパスが正規化済み文字列でない、種類がprovider_evidence・operations_transition以外、またはdigestが不正なら拒否する。 | safety_security | lint | src/lint/handover-resurrection.ts:424-435 |
| `RD07-109` | handover復活検査は、preserve authorityのentriesにパス重複がある、またはパス順に整列されていなければ拒否する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:436-442 |
| `RD07-113` | handover復活検査は、policyのschemaVersionが指定値と異なる、またはdetectorPolicyVersionが空なら前提条件違反として失敗する。 | process_gate | lint | src/lint/handover-resurrection.ts:497-504; src/lint/handover-resurrection.ts:911-915 |
| `RD07-114` | handover復活検査は、列挙された禁止カテゴリの値が非配列・空、空文字等を含む、または重複していれば前提条件違反として失敗する。 | process_gate | lint | src/lint/handover-resurrection.ts:505-515; src/lint/handover-resurrection.ts:911-915 |
| `RD07-129` | handover復活検査は、許可artifactに指定されたファイルが検査入力に存在しなければ前提条件違反として失敗する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:851-855; src/lint/handover-resurrection.ts:911-915 |
| `RD07-148` | identifier-renameのrunbook検査は、step.commandが空なら違反として返す。 | tooling_runtime | lint | src/lint/identifier-rename.ts:2085-2089 |
| `RD07-149` | identifier-renameのrunbook検査は、step.commandが固定allowlistに完全一致しなければ違反とする。 | tooling_runtime | lint | src/lint/identifier-rename.ts:2072-2095 |
| `RD07-150` | identifier-renameは、runbookまたは検証matrixでno-writeと宣言されたコマンドがローカル状態・成果物への書込みパターンに一致すれば違反とする。 | safety_security | lint | src/lint/identifier-rename.ts:2096-2101; src/lint/identifier-rename.ts:2200-2205; src/lint/identifier-rename.ts:2232-2234 |
| `RD07-152` | identifier-renameの検証matrix検査は、コマンドが指定writePolicyに対応するallowlistに完全一致しなければ違反とする。 | tooling_runtime | lint | src/lint/identifier-rename.ts:2172-2199 |
| `RD07-153` | identifier-renameの検証matrix検査は、local-artifact-writeと宣言されたコマンドがローカル書込みパターンに一致しなければ違反とする。 | tooling_runtime | lint | src/lint/identifier-rename.ts:2212-2219; src/lint/identifier-rename.ts:2232-2234 |
| `RD07-155` | identifier-renameのパス検査は、runbook証拠・backup source・backup target・restore証拠のパスが空なら違反とする。 | safety_security | lint | src/lint/identifier-rename.ts:2251-2260 |
| `RD07-156` | identifier-renameのパス検査は、対象パスに先頭または末尾の空白があれば違反とする。 | safety_security | lint | src/lint/identifier-rename.ts:2259-2261 |
| `RD07-157` | identifier-renameのパス検査は、対象パスがscheme://形式のURLなら違反とする。 | safety_security | lint | src/lint/identifier-rename.ts:2262-2264 |
| `RD07-158` | identifier-renameのパス検査は、対象パスがスラッシュ開始またはWindowsドライブ絶対パスなら違反とする。 | safety_security | lint | src/lint/identifier-rename.ts:2265-2267 |
| `RD07-159` | identifier-renameのパス検査は、対象パスにバックスラッシュまたはNULがあれば違反とする。 | safety_security | lint | src/lint/identifier-rename.ts:2268-2270 |
| `RD07-160` | identifier-renameのパス検査は、対象パスに..成分があれば違反とする。 | safety_security | lint | src/lint/identifier-rename.ts:2271-2273 |
| `RD07-161` | identifier-renameのパス検査は、対象パスが許可文字だけからなる具体的パスでなければ違反とする。backup targetでは指定のtimestampプレースホルダーだけを置換して検査する。 | safety_security | lint | src/lint/identifier-rename.ts:2274-2279 |
| `RD07-162` | identifier-renameのパス検査は、対象パスが用途別の許可接頭辞配下でなければ違反とする。 | safety_security | lint | src/lint/identifier-rename.ts:2128-2146; src/lint/identifier-rename.ts:2240-2244; src/lint/identifier-rename.ts:2280-2282 |
| `RD07-163` | identifier-renameの証拠パス検査は、runbook証拠が.jsonまたは.txt、restore証拠が.jsonで終わらなければ違反とする。 | evidence_claim | lint | src/lint/identifier-rename.ts:2108-2117; src/lint/identifier-rename.ts:2143-2149; src/lint/identifier-rename.ts:2245-2247 |
| `RD07-167` | identifier-renameのevidence-pack生成は、対応する生成処理がないartifactパスを指定された場合に例外で拒否する。 | tooling_runtime | lint | src/lint/identifier-rename.ts:1989-2044 |
| `RD07-169` | identifier-renameの切替計画は、Cutover source ledgerの元文書を読めなければstaleかつ違反とし、準備完了にしない。 | evidence_claim | lint | src/lint/identifier-rename.ts:2739-2755; src/lint/identifier-rename.ts:2412-2416 |
| `RD07-175` | identifier-renameの切替計画は、git worktree statusが読み取れなければ準備完了にしない。 | evidence_claim | lint | src/lint/identifier-rename.ts:2286-2320; src/lint/identifier-rename.ts:2430-2431 |
| `RD07-191` | Issue closure contract解析は、トップレベルのキー集合が指定どおりでない、またはcanonical_contracts・child_issues・successor_issuesが配列でなければ拒否する。 | review_merge | lint | src/lint/issue-closure-graph.ts:138-151 |
| `RD07-192` | Issue closure contract解析は、canonical契約集合が空、契約ID・owner Issueが不正、または子・後継Issue参照のキー・番号・期待状態が不正なら拒否する。 | review_merge | lint | src/lint/issue-closure-graph.ts:109-119; src/lint/issue-closure-graph.ts:152-169 |
| `RD07-201` | Issue closure graph監査は、receiptのキー集合・schema・PR番号・HEAD・CI番号・review URL・digestが不正、またはowner_issueやsource_issueが契約のownerと一致しなければ失敗する。 | evidence_claim | lint | src/lint/issue-closure-graph.ts:259-289 |
| `RD08-001` | inventory lifecycle lintは、登録済みartifact familyの構成pathがreviewed-safe集合に含まれない場合、失敗させる。 | process_gate | lint | src/lint/l12-hybrid-inventory-lifecycle.ts:56-64 |
| `RD08-004` | recognition判定器は、候補pathにreviewed-safe登録がない場合、最終判定をconflictにする。 | process_gate | lint | src/lint/l12-hybrid-recognition.ts:138-145 |
| `RD08-008` | L14 close audit lintは、監査行の必須セルが空、または状態がclosed・partial・gap・blocked-human以外の場合、その行を不正として失敗させる。 | process_gate | lint | src/lint/l14-close-audit.ts:125-128; src/lint/l14-close-audit.ts:177-189 |
| `RD08-019` | L6 completion判定器は、L6文書の所有PLAN pathを入力PLAN集合で解決できない場合、freezeInputReadyとreadyをfalseにする。 | process_gate | lint | src/lint/l6-completion.ts:104-110; src/lint/l6-completion.ts:143-162 |
| `RD08-039` | left-arm carry lintは、carry判断のschema_versionがleft-arm-carry.v1でない場合、失敗させる。 | process_gate | lint | src/lint/left-arm-carry-log.ts:229-231 |
| `RD08-040` | left-arm carry lintは、carry判断またはentryにstrict schema解析失敗が記録されている場合、失敗させる。 | process_gate | lint | src/lint/left-arm-carry-log.ts:232-233; src/lint/left-arm-carry-log.ts:269-272; src/lint/left-arm-carry-log.ts:676-692 |
| `RD08-045` | left-arm carry lintは、全PLANを通じてcarry_idが重複する場合、失敗させる。 | process_gate | lint | src/lint/left-arm-carry-log.ts:269-275; src/lint/left-arm-carry-log.ts:514-526 |
| `RD08-053` | left-arm carry lintは、affected_artifactsが同一entry内または全entry間で重複する場合、失敗させる。 | process_gate | lint | src/lint/left-arm-carry-log.ts:333-336 |
| `RD08-071` | left-arm carry lintは、legacyBaselineRequiredがtrueでない入力でlegacy_pinnedが設定されたPLANを拒否する。 | safety_security | lint | src/lint/left-arm-carry-log.ts:490-494 |
| `RD08-074` | left-arm carry loaderは、PLAN読込・解析で例外が起きた場合、またはL4〜L7 PLAN名の文書からfrontmatterを得られない場合、強制検査対象の不正PLANへ変換して失敗につなげる。 | tooling_runtime | lint | src/lint/left-arm-carry-log.ts:735-770 |
| `RD08-080` | semantic consumer lintは、entryのcapability_id・symbol_or_command・path・line_anchor・current_authority・target_authorityが空または文字列でない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:329-344 |
| `RD08-081` | semantic consumer lintは、entry.pathが空、非文字列、絶対path、..を含むpath、またはsrc/以外の場合、失敗させる。 | safety_security | lint | src/lint/legacy-orchestration-semantic-consumers.ts:255-262; src/lint/legacy-orchestration-semantic-consumers.ts:345-346 |
| `RD08-082` | semantic consumer lintは、consumer_roleが定義済み7種の役割に含まれない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:15-23; src/lint/legacy-orchestration-semantic-consumers.ts:347-348 |
| `RD08-084` | semantic consumer lintは、successor_symbolがnullでも文字列でもない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:351-352 |
| `RD08-087` | semantic consumer lintは、ledgerのschema_versionが所定のv1識別子と異なる場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:10-11; src/lint/legacy-orchestration-semantic-consumers.ts:370-371 |
| `RD08-091` | semantic consumer lintは、ledgerのsource_headが40桁小文字hexでない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:377-377 |
| `RD08-093` | semantic consumer lintは、ledger.entriesが配列でない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:380-382 |
| `RD08-094` | semantic consumer lintは、ledger entryがnull等の偽値またはobject型以外の場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:384-388 |
| `RD08-095` | semantic consumer lintは、capability_idがledger内で重複する場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:397-400 |
| `RD08-096` | semantic consumer lintは、entryのcapability_idが必須consumer定義に登録されていない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:402-406 |
| `RD08-097` | semantic consumer lintは、登録済みcapabilityのconsumer_roleが固定期待役割と異なる場合、失敗させる。 | escalation_authority | lint | src/lint/legacy-orchestration-semantic-consumers.ts:402-408 |
| `RD08-098` | semantic consumer lintは、direct_executionのentry.pathがsrc/で始まらない場合、失敗させる。 | escalation_authority | lint | src/lint/legacy-orchestration-semantic-consumers.ts:409-410 |
| `RD08-099` | semantic consumer lintは、write_controlのentry.pathがsrc/で始まらない場合、失敗させる。 | escalation_authority | lint | src/lint/legacy-orchestration-semantic-consumers.ts:411-412 |
| `RD08-109` | semantic consumer lintは、必須capabilityのpathが固定期待pathと異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:471-472 |
| `RD08-110` | semantic consumer lintは、必須capabilityのsymbol_or_commandが固定期待値と異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:473-477 |
| `RD08-112` | semantic consumer revision検査は、schema_versionが所定のrevision v1識別子でない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:12-13; src/lint/legacy-orchestration-semantic-consumers.ts:504-505 |
| `RD08-116` | semantic consumer revision検査は、base_ledger_pathが指定の基底ledger pathと異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:511-512 |
| `RD08-117` | semantic consumer revision検査は、base_ledger_sha256がsha256:付き64桁小文字hexでない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:513-514 |
| `RD08-118` | semantic consumer revision検査は、revision_idが英数字で始まる3〜128文字の英数字・点・下線・ハイフンからなる形式でない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:515-516 |
| `RD08-119` | semantic consumer revision検査は、source_headが40桁小文字hexでない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:517-518; src/lint/legacy-orchestration-semantic-consumers.ts:596-597 |
| `RD08-120` | semantic consumer revision検査は、revision_payload_sha256がsha256:付き64桁小文字hexでない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:519-520 |
| `RD08-122` | semantic consumer revision検査は、entriesが配列でない、または空の場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:525-526 |
| `RD08-123` | semantic consumer loaderは、基底ledgerファイルが存在しない場合、例外で失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-semantic-consumers.ts:551-557 |
| `RD08-124` | semantic consumer revision loaderは、指定revisionファイルが存在しない場合、例外で失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-semantic-consumers.ts:580-583 |
| `RD08-134` | legacy orchestration lintは、inventory.schema_versionが所定のv1識別子でない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-surface.ts:142-143 |
| `RD08-136` | legacy orchestration lintとloaderは、inventory.source_headが40桁小文字hexでない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:146-146; src/lint/legacy-orchestration-surface.ts:232-232 |
| `RD08-137` | legacy orchestration lintは、semantic_ledger_sha256が指定されていて64桁小文字hexでない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:147-151 |
| `RD08-138` | legacy orchestration lintは、semantic_ledger_sha256が指定されているのに対象semantic ledgerが入力ファイル集合にない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:152-156 |
| `RD08-140` | legacy orchestration lintは、inventory entryのpathが空・絶対path・..を含む・重複のいずれか、または上限が正のsafe integerでない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-surface.ts:164-177 |
| `RD08-141` | legacy orchestration lintは、historical除外prefixがdocs/archive/以外、または実装除外pathが固定allowlist外の場合、失敗させる。 | safety_security | lint | src/lint/legacy-orchestration-surface.ts:180-185 |
| `RD08-144` | legacy orchestration loaderは、inventoryファイルが存在しない場合、例外で失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-surface.ts:215-221 |
| `RD08-145` | legacy orchestration loaderは、origin/mainとHEADのmerge-baseが40桁小文字hexでない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:222-231 |
| `RD08-147` | legacy orchestration loaderは、inventory初回導入時の公開base marker走査がエラーになるか終了状態が0・1以外の場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-surface.ts:238-254 |
| `RD08-148` | legacy orchestration loaderは、公開base走査の返却pathが当該baseとコロンのprefixで始まらない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:255-260 |
| `RD08-152` | merged-plan-status lintは、非archived PLANのfrontmatterやgenerates/modifies構造を解析できない場合、PLAN_FRONTMATTER_PARSE_FAILEDで失敗させる。 | process_gate | lint／doctor | src/lint/merged-plan-status.ts:98-104; src/lint/merged-plan-status.ts:206-241; src/lint/merged-plan-status.ts:273-294 |
| `RD08-153` | merged-plan-status lintは、modifiesに宣言した出荷物pathが公開baseに存在しない場合、PLAN状態にかかわらず失敗させる。公開baseを取得できない場合はworktreeの存在で判定する。 | process_gate | lint／doctor | src/lint/merged-plan-status.ts:105-118; src/lint/merged-plan-status.ts:244-256; src/lint/merged-plan-status.ts:300-304 |
| `RD08-155` | merged-plan-status loaderは、loadReviewPlansが例外になった場合、空PLAN集合を返して検査を通過可能にする。 | tooling_runtime | lint | src/lint/merged-plan-status.ts:263-270 |
| `RD08-156` | merged-plan-status loaderは、個別PLAN本文を読み取れない場合、そのPLANを検査せず次へ進む。 | tooling_runtime | lint | src/lint/merged-plan-status.ts:273-280 |
| `RD08-171` | objective evidence auditは、証跡binding manifestが有効なJSONでない場合、失敗させる。 | process_gate | lint | src/lint/objective-evidence-audit.ts:471-479 |
| `RD08-172` | objective evidence auditは、binding manifestがrecordでない、schema_versionが所定v1でない、またはbindingsが配列でない場合、失敗させる。 | process_gate | lint | src/lint/objective-evidence-audit.ts:480-489 |
| `RD08-173` | objective evidence auditは、binding entryがrecordでない、必須4文字列が文字列でない、またはminimum_size_bytesが整数でない場合、失敗させる。 | process_gate | lint | src/lint/objective-evidence-audit.ts:494-505 |
| `RD08-174` | objective evidence auditは、binding entryのrequirement_idがG-01〜G-09以外の場合、失敗させる。 | process_gate | lint | src/lint/objective-evidence-audit.ts:506-509 |
| `RD08-175` | objective evidence auditは、binding entryのrequirement_idが重複する場合、失敗させる。 | process_gate | lint | src/lint/objective-evidence-audit.ts:510-513 |
| `RD08-176` | objective evidence auditは、bindingのpathまたはobservation markerが空、digest形式が不正、またはminimum_size_bytesが1未満の場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:514-522 |
| `RD08-180` | objective evidence auditは、G-01〜G-09の行がちょうど5セルでない、または先頭セルが対象要件IDでない場合、失敗させる。 | process_gate | lint | src/lint/objective-evidence-audit.ts:558-572 |
| `RD08-187` | objective evidence auditは、Git追跡一覧の取得に失敗するか返却形式が不正な場合、trackedFilesをnullとし、Git追跡必須検査を適用しない。 | tooling_runtime | lint | src/lint/objective-evidence-audit.ts:411-417; src/lint/objective-evidence-audit.ts:616-626 |
| `RD08-189` | objective evidence auditは、checked日付付き見出しと所定8列を持つ外部source ledgerから行を取得できない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:637-641; src/lint/objective-evidence-audit.ts:681-698 |
| `RD08-204` | outstanding snapshot読込器は、HEAD版snapshotの取得に失敗した場合、worktree版へfallbackし、それも読めなければnullを返す。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:62-82 |
| `RD08-205` | outstanding snapshot guardは、live outstanding projectionの計算等で例外が発生した場合、G-10違反を返して失敗させる。 | evidence_claim | lint／gate | src/lint/outstanding-snapshot.ts:90-106 |
| `RD08-207` | outstanding snapshot検査は、snapshotをJSON解析できない場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:118-123 |
| `RD08-208` | outstanding snapshot検査は、JSON解析結果がnullまたはobject型以外の場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:124-126 |
| `RD08-209` | outstanding snapshot検査は、schema_versionがoutstanding-snapshot.v1でない場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:127-130 |
| `RD08-212` | outstanding snapshot検査は、decision_countが数値の非負整数でない場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:142-149 |
| `RD08-213` | outstanding snapshot検査は、plan_idsが配列でない場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:150-152 |
| `RD08-214` | outstanding snapshot検査は、plan_idsに文字列でない要素がある場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:153-156 |
| `RD08-216` | outstanding snapshot検査は、plan_idsに同じIDが重複する場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:163-166 |
| `RD08-219` | outstanding snapshot検査は、blockersが配列でない場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:179-181 |
| `RD08-220` | outstanding snapshot検査は、blockersに文字列でない要素がある場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:182-185 |
| `RD08-221` | outstanding snapshot検査は、blockersに重複がある場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:189-194 |
| `RD08-223` | outstanding snapshot検査は、required_actionsが配列でない場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:200-202 |
| `RD08-224` | outstanding snapshot検査は、required_actionsに文字列でない要素がある場合、失敗させる。 | process_gate | lint | src/lint/outstanding-snapshot.ts:203-206 |
| `RD08-225` | outstanding snapshot検査は、required_actionsに重複がある場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:210-215 |
| `RD09-007` | outstanding集計は、非終端PLANのplan_idがschema不適合の場合、frontmatter_schema_invalidを完了阻害理由として返す。 | tooling_runtime | lint | src/lint/outstanding.ts:833-835; src/lint/outstanding.ts:1124-1140 |
| `RD09-013` | packet command生成器は、plan_idがcommand-safe文字列とPLAN schemaの両方に適合しない場合、--plan引数への埋め込みを行わない。 | safety_security | lint | src/lint/outstanding.ts:1078-1088; src/lint/outstanding.ts:1839-1851 |
| `RD09-014` | outstanding loaderは、PLANファイルの読み込み失敗時には当該ファイルをスキップし、placeholder集計の例外時にはopenDefersを0として処理を続ける。 | tooling_runtime | lint | src/lint/outstanding.ts:1153-1158; src/lint/outstanding.ts:1231-1246 |
| `RD09-015` | pin-chain導出は、digest inventoryのrowsが配列でない場合、unsupported surfaceを記録してstatusをdegradedにする。 | evidence_claim | lint | src/lint/pin-chain-derivation.ts:97-103; src/lint/pin-chain-derivation.ts:224-226 |
| `RD09-016` | pin-chain導出は、変更対象のdigest inventory行でhit_idが文字列でないかlineが数値でない場合、unsupported surfaceを記録してdegradedにする。 | evidence_claim | lint | src/lint/pin-chain-derivation.ts:112-120; src/lint/pin-chain-derivation.ts:224-226 |
| `RD09-018` | pin-chain導出は、feedback manifestのbindingsが配列でない場合、unsupported surfaceを記録してdegradedにする。 | evidence_claim | lint | src/lint/pin-chain-derivation.ts:137-145; src/lint/pin-chain-derivation.ts:224-226 |
| `RD09-019` | pin-chain導出は、変更対象のfeedback bindingでtest_file_sha256が文字列でないかexpected_case_countが数値でない場合、unsupported surfaceを記録してdegradedにする。 | evidence_claim | lint | src/lint/pin-chain-derivation.ts:146-154; src/lint/pin-chain-derivation.ts:224-226 |
| `RD09-023` | pin-chain導出は、対象のreviewed-safe registryが読めない場合、または変更pathに登録済みpin surfaceがない場合、unsupported surfaceを記録してdegradedにする。 | evidence_claim | lint | src/lint/pin-chain-derivation.ts:188-197; src/lint/pin-chain-derivation.ts:216-226 |
| `RD09-031` | legacy workflow inventory loaderは、ファイル不在または読み込み・JSON解析等の例外時にvalid=falseを返す。 | process_gate | lint | src/lint/plan-entry-routing-legacy-input.ts:63-69; src/lint/plan-entry-routing-legacy-input.ts:109-110 |
| `RD09-032` | legacy workflow inventory loaderは、schemaとcompatibility_input_onlyのauthority、厳密なentry構造、951件の固定件数、重複なしの整列順、記録・再計算digestの固定値一致を満たさない台帳を無効にする。 | process_gate | lint | src/lint/plan-entry-routing-legacy-input.ts:11-15; src/lint/plan-entry-routing-legacy-input.ts:74-108 |
| `RD09-039` | plan-entry-routingは、typed workflow_identityのauthority読込がENOENTで失敗した場合、authority欠落を違反としてbaseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:150-166; src/lint/plan-entry-routing.ts:329-336; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-041` | plan-entry-routingは、typed workflow_identityのauthority読込が欠落・drift以外の理由で失敗した場合、authority不正としてbaseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:150-166; src/lint/plan-entry-routing.ts:329-336; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-051` | plan-specific-vpair-bindingは、verification_bindingsが配列でないか、要素が厳密なparent_design・oracle_id・test_pathの組でない場合、違反とする。test_pathにはNFC正規化されたtests/配下の相対pathを要求し、絶対path、逆スラッシュ、空・ドット・親ディレクトリ区間を認めない。 | safety_security | lint | src/lint/plan-specific-vpair-binding.ts:374-387; src/lint/plan-specific-vpair-binding.ts:543-555; src/lint/plan-specific-vpair-binding.ts:839-857 |
| `RD09-053` | plan-specific-vpair-bindingは、同一PLAN内にparent_design・oracle_id・test_pathが完全一致するbindingが重複する場合、違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:868-871 |
| `RD09-055` | plan-specific-vpair-bindingは、eligible oracle表に非正規separator、不正なoracle行・ID、またはcanonical test pathでないcitationがある場合、違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:399-450; src/lint/plan-specific-vpair-binding.ts:887-890 |
| `RD09-060` | plan-specific-vpair-bindingは、binding先テストが存在しない、通常ファイルでない、symlinkである、またはrealpathがrepository外の場合、違反とする。 | safety_security | lint | src/lint/plan-specific-vpair-binding.ts:906-908; src/lint/plan-specific-vpair-binding.ts:1053-1067 |
| `RD09-064` | V-pair authority検証は、初期entryの厳密構造、fingerprintの再計算一致、PLAN専用path、digest形式、reasonの許可集合、fingerprintの一意性と整列順を満たさない場合、authorityを無効にする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:593-615; src/lint/plan-specific-vpair-binding.ts:965-966 |
| `RD09-067` | V-pair authority検証は、tombstoneの厳密構造・初期entryへの所属・重複禁止・UTC時刻形式・解消PLANの妥当性・previous/entry digestの連鎖を満たさない場合、authorityを無効にする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:633-665 |
| `RD09-069` | V-pair authority検証は、必要なauthorityが未提供、null、配列、またはobjectでない場合、authority missingとして失敗させる。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:693-700; src/lint/plan-specific-vpair-binding.ts:947-966 |
| `RD09-070` | V-pair authority検証は、所定のv4 schema、厳密なtop-level/recovery構造、recoveryだけのeligibleKinds、正の安全整数からなる既知reasonのbaselineを満たさない場合、authorityを無効にする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:702-726 |
| `RD09-071` | V-pair authority検証は、implementationとrecoveryの初期authorityに同じfingerprintが存在する場合、scope overlapとして失敗させる。 | process_gate | lint | src/lint/plan-specific-vpair-binding.ts:727-735 |
| `RD09-082` | V-pair checkは、repository rootが存在しない場合、またはrepository入力の読込・解析で例外が発生した場合、ok=falseを返す。 | tooling_runtime | lint | src/lint/plan-specific-vpair-binding.ts:1158-1187 |
| `RD09-083` | plan-supersessionは、PLANのleading frontmatterがないか構造解析に失敗した場合、silent skipせず失敗させる。 | process_gate | lint／doctor | src/lint/plan-supersession.ts:55-68; src/lint/plan-supersession.ts:95-99; src/lint/plan-supersession.ts:117-121 |
| `RD09-135` | verification evidence投影は、recordがverification-evidence-v1を宣言せず、または非空文字列のevidence_pathを持たない場合、invalid-evidence errorとして失敗させる。 | evidence_claim | lint | src/lint/relation-graph-evidence.ts:226-237; src/lint/relation-graph-evidence.ts:310-323 |
| `RD09-136` | verification evidence投影は、profile objectに非空文字列のid・name・profile_typeがそろわない場合、invalid-evidence errorとして失敗させる。 | evidence_claim | lint | src/lint/relation-graph-evidence.ts:116-123; src/lint/relation-graph-evidence.ts:240-251 |
| `RD09-137` | verification evidence投影は、recommendation objectにid・change_set_id・plan_id・profile_id・profile_kind・reason・source_ruleの非空文字列がそろわない場合、失敗させる。 | evidence_claim | lint | src/lint/relation-graph-evidence.ts:139-151; src/lint/relation-graph-evidence.ts:254-265 |
| `RD09-138` | verification evidence投影は、allow_external=falseのrecordにmcp_run objectがある場合、external-not-allowed errorとして失敗させ、そのrecordの後続処理を行わない。 | safety_security | lint | src/lint/relation-graph-evidence.ts:268-277 |
| `RD09-139` | verification evidence投影は、mcp_run objectにid・profile_id・command・method・normalized_statusの非空文字列がそろわない場合、失敗させる。 | evidence_claim | lint | src/lint/relation-graph-evidence.ts:165-174; src/lint/relation-graph-evidence.ts:279-289 |
| `RD09-140` | verification evidence投影は、findings配列の要素がobjectでないか、id・source_run_id・source_kind・finding_typeの非空文字列を欠く場合、失敗させる。 | evidence_claim | lint | src/lint/relation-graph-evidence.ts:191-200; src/lint/relation-graph-evidence.ts:292-305 |
| `RD09-149` | relation impact分析は、edgeのfrom nodeが存在しないか、upstream以外のedgeのto nodeが存在しない場合、stale-edge errorで失敗させる。 | evidence_claim | lint | src/lint/relation-graph.ts:600-621; src/lint/relation-graph.ts:712-715; src/lint/relation-graph.ts:761-767 |
| `RD09-156` | relation impact分析は、graph走査対象の変更pathにnodeがなく、明示除外pathでもない場合、missing-projection errorで失敗させる。弱い影響分析への暗黙fallbackは行わない。 | evidence_claim | lint | src/lint/relation-graph.ts:313-355; src/lint/relation-graph.ts:719-740 |
| `RD09-158` | relation graphのscope安全性判定は、正規化後のscopeが絶対pathまたは親ディレクトリ区間を含む場合、不許可を返す。 | safety_security | lint | src/lint/relation-graph.ts:917-922 |
| `RD10-001` | lintはreviewer session履歴の読込・解析エラーを受け取った場合、reviewer identity違反として失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:905-910 |
| `RD10-002` | 履歴parserはregistryのroot、schema_version、sessions配列、session要素またはwindow要素の構造が不正なら拒否する。 | review_merge | lint | src/lint/review-evidence.ts:290-325 |
| `RD10-003` | 履歴parserはsession ID、reviewer_model、basisなどの必須文字列が文字列でないか空白だけなら拒否する。 | evidence_claim | lint | src/lint/review-evidence.ts:209-214; src/lint/review-evidence.ts:307-347 |
| `RD10-004` | 履歴parserはsession IDの形式不正または同一IDの重複登録を拒否する。 | review_merge | lint | src/lint/review-evidence.ts:307-316; src/lint/review-evidence.ts:397-400 |
| `RD10-006` | 履歴parserはsessionのwindowsが配列でないか空の場合に拒否する。 | review_merge | lint | src/lint/review-evidence.ts:318-320 |
| `RD10-007` | 履歴parserは日時が秒・timezone付きISO形式でない、暦日が実在しない、または時刻・offsetが範囲外なら拒否する。 | evidence_claim | lint | src/lint/review-evidence.ts:220-274 |
| `RD10-008` | 履歴parserは終了日時が開始日時以下のwindowを拒否する。 | review_merge | lint | src/lint/review-evidence.ts:328-334 |
| `RD10-009` | 履歴parserは終了日時未設定のwindowの後に別windowが続く場合に拒否する。 | review_merge | lint | src/lint/review-evidence.ts:335-338 |
| `RD10-010` | 履歴parserは後続windowの開始が直前windowの終了より前なら拒否する。 | review_merge | lint | src/lint/review-evidence.ts:339-341 |
| `RD10-015` | lintはsession強制対象のAI reviewでreviewer_session_idが規定形式に合わなければ失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:397-410; src/lint/review-evidence.ts:998-1005 |
| `RD10-023` | lintはterminal L3 PLANのGit provenanceの日付不正または時系列逆転を検出した場合に失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:783-797 |
| `RD10-024` | lintはterminal L3 PLANのcreated／updatedが不正な暦日か、updatedがcreatedより前の場合に失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:799-804 |
| `RD10-029` | lintは検査対象green commandのkindが許容集合外なら失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:813-814 |
| `RD10-031` | lintは検査対象green commandのrunnerが許容集合外なら失敗させる。 | tooling_runtime | lint | src/lint/review-evidence.ts:816-816 |
| `RD10-034` | lintは検査対象green commandのscopeが許容集合外なら失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:827-827 |
| `RD10-037` | lintは検査対象green commandのoutput_digestがsha256接頭辞と64桁の16進数でなければ失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:830-830 |
| `RD10-049` | lintはVerification source ledgerのofficial URLセルにhttps://が含まれなければ失敗させる。 | safety_security | lint | src/lint/right-arm-verification-strategy.ts:300-304 |
| `RD10-059` | roadmap parserはfrontmatter YAMLの解析に失敗した場合、無音で省略せずerrorを返す。 | process_gate | lint | src/lint/roadmap-registry.ts:45-58 |
| `RD10-060` | roadmap parserは存在するroadmapがschema検証または構造整合検証に違反した場合、errorを返す。 | process_gate | lint | src/lint/roadmap-registry.ts:60-70 |
| `RD10-090` | S4 lintはconfirmed判断のreverse_fullback_requiredがyesまたはnoで始まらなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:447-452 |
| `RD10-105` | S4 lintはfrontier入力が与えられた判断待ちPoCについて、frontier_pending_decisionのbinding検証に違反があれば失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:827-838 |
| `RD10-109` | S4 command検証はwritePolicyがno-writeでないか、commandが固定allowlistに一致しなければ違反とする。 | tooling_runtime | lint | src/lint/s4-decision-readiness.ts:1198-1217 |
| `RD10-110` | S4 command検証はbuild、esbuild、db rebuild、outfile、リダイレクト、tee等の書込patternを検出した場合に違反とする。 | safety_security | lint | src/lint/s4-decision-readiness.ts:1218-1223; src/lint/s4-decision-readiness.ts:1235-1237 |
| `RD10-114` | S4 lintはsource ledgerの必須セルが空白、TBD、TODOまたは「-」の場合に失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:1274-1287 |
| `RD10-115` | S4 lintはsource ledgerのofficial URLセルにhttps://が含まれなければ失敗させる。 | safety_security | lint | src/lint/s4-decision-readiness.ts:1288-1297 |
| `RD10-129` | frontier binding検証は期待に一致するrecordがなく、対象PLANの候補classificationが期待値と異なる場合に違反を返す。 | process_gate | lint | src/lint/semantic-frontier-binding.ts:50-63 |
| `RD10-130` | frontier binding検証は期待featureIdが指定され、一致recordがなく候補featureIdが異なる場合に違反を返す。 | process_gate | lint | src/lint/semantic-frontier-binding.ts:64-69 |
| `RD10-149` | frontier整合lintは確定機能recordのclassificationがconfirmed_currentでなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:374-378 |
| `RD10-159` | frontier整合lintはlive frontier recordのfeatureIdが固定の期待frontier集合にない場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:448-461 |
| `RD10-162` | frontier整合lintは期待frontierのlive recordを取得できない場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:475-479 |
| `RD10-163` | frontier整合lintはlive frontierのplanIdに期待planMarkerが含まれなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:480-484 |
| `RD10-164` | frontier整合lintはlive frontierのclassificationが期待分類と異なる場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:485-489 |
| `RD10-168` | skill assignment lintはskill_typeが文字列でないか空白だけなら失敗させる。 | tooling_runtime | lint | src/lint/skill-assignment.ts:138-142 |
| `RD10-169` | skill assignment lintはskill_typeが許容された9種に含まれなければ失敗させる。 | tooling_runtime | lint | src/lint/skill-assignment.ts:41-51; src/lint/skill-assignment.ts:142-144 |
| `RD10-170` | skill assignment lintはapplies_to.layersから有効な非空文字列を一つも取得できない場合に失敗させる。 | tooling_runtime | lint | src/lint/skill-assignment.ts:146-151 |
| `RD10-171` | skill assignment lintは適用層がcurrent skillではL1〜L12、compatibility skillではL0〜L14の範囲外なら失敗させる。 | process_gate | lint | src/lint/skill-assignment.ts:10-25; src/lint/skill-assignment.ts:153-162 |
| `RD10-173` | skill assignment lintはcurrent skillの適用・除外identityの解析が失敗した場合に違反を返す。 | tooling_runtime | lint | src/lint/skill-assignment.ts:169-180 |
| `RD10-174` | skill assignment lintはcurrent identity fieldがなくlegacy drive_modelsも空の場合に失敗させる。 | tooling_runtime | lint | src/lint/skill-assignment.ts:184-188 |
| `RD10-175` | skill assignment lintはcompatibility skillのdrive modelが規定の旧10種に含まれなければ失敗させる。 | tooling_runtime | lint | src/lint/skill-assignment.ts:28-39; src/lint/skill-assignment.ts:189-194 |
| `RD10-176` | skill assignment lintは検査対象skill定義が0件の場合に失敗させる。 | tooling_runtime | lint | src/lint/skill-assignment.ts:197-203; src/lint/skill-assignment.ts:212-214 |
| `RD10-177` | skill quality lintはSKILL_MAP.mdが読めない場合に失敗させる。 | tooling_runtime | lint | src/lint/skill-quality.ts:157-163 |
| `RD10-178` | skill quality lintは小文字化したnameまたはslugが複数文書間で重複する場合に失敗させる。 | tooling_runtime | lint | src/lint/skill-quality.ts:165-185 |
| `RD10-183` | skill quality lintは本文に未記入scaffold markerが残る場合に失敗させる。 | tooling_runtime | lint | src/lint/skill-quality.ts:18-18; src/lint/skill-quality.ts:240-246 |
| `RD10-184` | skill quality lintは本文に「初期 scaffold である」または「This is a HELIX-HARNESS skill document」が残る場合に失敗させる。 | tooling_runtime | lint | src/lint/skill-quality.ts:19-23; src/lint/skill-quality.ts:247-255 |
| `RD10-185` | source ledger検証は抽出できたchecked日付または比較基準日時が不正なら違反を返す。 | evidence_claim | lint | src/lint/source-ledger-freshness.ts:47-59 |
| `RD10-186` | source ledger検証はchecked日付が比較基準の日本時間の暦日より未来なら違反を返す。 | evidence_claim | lint | src/lint/source-ledger-freshness.ts:60-62; src/lint/source-ledger-freshness.ts:142-147 |
| `RD10-188` | verification source metadata検証はsourceCheckedAtがYYYY-MM-DD形式の実在する暦日でなければ違反を返す。 | evidence_claim | lint | src/lint/source-ledger-freshness.ts:76-82; src/lint/source-ledger-freshness.ts:124-139 |
| `RD10-189` | verification source metadata検証はsourceCheckedAtが比較基準の日本時間の暦日より未来なら違反を返す。 | evidence_claim | lint | src/lint/source-ledger-freshness.ts:83-87; src/lint/source-ledger-freshness.ts:142-147 |
| `RD10-192` | verification source metadata検証はsourceUrlがHTTP系URLなのにhttps://で始まらない場合に違反を返す。 | safety_security | lint | src/lint/source-ledger-freshness.ts:114-119 |
| `RD10-194` | telemetry closure lintは表にheaderと少なくとも1データ行がなければ失敗させる。 | process_gate | lint | src/lint/telemetry-closure.ts:105-109 |
| `RD10-196` | telemetry closure lintは行のrequirementが空ならmalformed_rowとして失敗させる。 | process_gate | lint | src/lint/telemetry-closure.ts:132-145 |
| `RD10-200` | telemetry closure lintはautomation ownerに許容された機械化主体tokenが含まれなければ失敗させる。 | process_gate | lint | src/lint/telemetry-closure.ts:63-64; src/lint/telemetry-closure.ts:155-157 |
| `RD10-201` | telemetry closure lintはstatusがclosed、partial、scheduled、gap、blocked-human以外なら失敗させる。 | process_gate | lint | src/lint/telemetry-closure.ts:56-62; src/lint/telemetry-closure.ts:158-161 |
| `RD11-002` | adapter probeは、必要な実行ファイルが利用できない場合に警告し、ready=falseにする。 | tooling_runtime | lint | src/lint/tool-adapter.ts:253-260; src/lint/tool-adapter.ts:272-275 |
| `RD11-003` | adapter probeは、指定されたscanScopeがworkspace内と判定できない場合にerrorを出し、ready=falseにする。 | safety_security | lint | src/lint/tool-adapter.ts:231-235; src/lint/tool-adapter.ts:262-275 |
| `RD11-005` | 図更新計画は、dotまたはd2が要求され、adapterReadyがfalseの場合に警告し、更新actionを空にしてok=falseにする。 | tooling_runtime | lint | src/lint/tool-adapter.ts:336-346 |
| `RD11-007` | triage lintは、decision manifestを読めない場合にokとcompletionReadyをfalseにする。 | process_gate | lint | src/lint/triage-decision-integrity.ts:117-129 |
| `RD11-008` | triage lintは、manifestのschema_versionが指定値と異なる場合に違反にする。 | process_gate | lint | src/lint/triage-decision-integrity.ts:5-6; src/lint/triage-decision-integrity.ts:130-131 |
| `RD11-024` | triage lintは、未列挙status主張のstateがblocked_missing_enumerationまたはresolved以外の場合に違反にする。 | process_gate | lint | src/lint/triage-decision-integrity.ts:179-180 |
| `RD11-025` | triage lintは、列挙IDがIMP-と3桁数字の形式でない、またはbacklogに実在しない場合に違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:181-183 |
| `RD11-032` | MCP設定生成器は、出力先の正規化pathが.vscode配下の場合にerrorとし、ok=falseにする。 | safety_security | lint | src/lint/verification-profile-safety.ts:63-77; src/lint/verification-profile-safety.ts:131-136 |
| `RD11-033` | MCP設定生成器は、mountがworkspace root自身またはその配下でない場合にerrorとする。 | safety_security | lint | src/lint/verification-profile-safety.ts:35-39; src/lint/verification-profile-safety.ts:79-89 |
| `RD11-034` | MCP設定生成器は、選択されたprofile IDがcatalogに存在しない場合にerrorを出し、そのserver生成を飛ばす。 | tooling_runtime | lint | src/lint/verification-profile-safety.ts:16-19; src/lint/verification-profile-safety.ts:92-98 |
| `RD11-041` | profile safety検査は、Docker必須profileでdockerAvailableが真でない場合にerrorにする。 | tooling_runtime | lint | src/lint/verification-profile-safety.ts:220-230 |
| `RD11-044` | 検証runner設定は、実行可能なcommandとargvを固定allowlistに限定する。 | safety_security | config | src/lint/verification-profile-catalog.ts:206-214; src/lint/verification-profile.ts:277-291 |
| `RD11-045` | profile取得処理は、catalog自身のkeyでないIDを拒否しnullを返す。 | tooling_runtime | lint | src/lint/verification-profile.ts:83-86; src/lint/verification-profile.ts:196-201 |
| `RD11-050` | profile probeは、指定実行ファイルの--version確認に失敗した場合、executable checkとreadyを失敗にする。 | tooling_runtime | lint | src/lint/verification-profile.ts:212-217; src/lint/verification-profile.ts:246-247 |
| `RD11-051` | profile probeは、command先頭が実行ファイルhintと異なる場合、そのlauncherの--help確認に失敗するとreadyを失敗にする。 | tooling_runtime | lint | src/lint/verification-profile.ts:219-225; src/lint/verification-profile.ts:246-247 |
| `RD11-053` | profile probeは、認証必須profileでauthEnvのいずれにも値がない場合にauth checkを失敗にする。 | tooling_runtime | lint | src/lint/verification-profile.ts:236-247 |
| `RD11-055` | profile実行処理は、対応する具体的runnerが未配線の場合にfailedを返す。 | tooling_runtime | lint | src/lint/verification-profile.ts:277-284 |
| `RD11-058` | MCP inspectionは、inspectorと対象のprobeがready、inspectorが既定無効、対象がmcp型という条件をすべて満たさなければnot-readyにする。 | tooling_runtime | lint | src/lint/verification-profile.ts:327-344 |
| `RD11-059` | 右腕coverage lintは、profileがG8〜G12以外のgateを宣言した場合に違反にする。 | process_gate | lint | src/lint/verification-profile.ts:348-348; src/lint/verification-profile.ts:405-415 |
| `RD11-064` | profile lintは、sourceLedgerSourcesに未知のledger行が指定されている場合に違反にする。 | evidence_claim | lint | src/lint/verification-profile.ts:478-488 |
| `RD11-066` | profile gateは、trigger signalのない推薦を違反にする。 | process_gate | lint／gate | src/lint/verification-profile.ts:644-651 |
| `RD11-068` | profile gateは、既定有効として推薦されたprofileに具体的runnerがない場合に違反にする。 | tooling_runtime | lint／gate | src/lint/verification-profile.ts:661-669 |
| `RD11-077` | version-up lintは、source ledgerの必須列値が空白・TBD・TODO・-の場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:999-1012; src/lint/version-up-readiness.ts:1023-1032 |
| `RD11-078` | version-up lintは、source ledgerのofficial URLにhttps://が含まれない場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1013-1022 |
| `RD11-089` | version-up lintは、activation outcomeについて、未選択時は許可集合、選択済みまたは具体的snapshot記録時は単一選択の検査に違反すると失敗させる。 | process_gate | lint | src/lint/version-up-readiness.ts:447-451; src/lint/version-up-readiness.ts:1120-1143 |
| `RD11-099` | version-up dry-runは、currentまたはtargetをSemVerとしてparseできない場合にblockする。数値prerelease識別子の先頭ゼロも拒否する。 | process_gate | lint | src/lint/version-up-readiness.ts:1301-1302; src/lint/version-up-readiness.ts:2761-2783 |
| `RD11-110` | activation command検査は、commandがwritePolicy別の固定allowlistにない場合に違反にする。ただしversion-dry-run phaseの指定形式に一致するcommandは別途受理する。 | safety_security | lint | src/lint/version-up-readiness.ts:1823-1838; src/lint/version-up-readiness.ts:1857-1881; src/lint/version-up-readiness.ts:1936-1940 |
| `RD11-114` | activation phase検査は、command matrixに指定集合外のphaseが存在する場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:1923-1932 |
| `RD11-115` | activation write policy検査は、no-writeのcommandに実装の正規表現が書込み操作として検出する表現がある場合に違反にする。 | safety_security | lint | src/lint/version-up-readiness.ts:1943-1953; src/lint/version-up-readiness.ts:1964-1965 |
| `RD11-155` | WCC trace lintは、FR定義表で同一FR IDが複数回定義された場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:162-165; src/lint/wcc-trace.ts:197-198 |
| `RD11-156` | WCC trace lintは、AC定義表で同一AC IDが複数回定義された場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:165-165; src/lint/wcc-trace.ts:199-199 |
| `RD11-157` | WCC trace lintは、trace表で同一HAT IDが複数回定義された場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:166-166; src/lint/wcc-trace.ts:200-200 |
| `RD11-170` | workflow catalogのdoctor admissionは、current authorityとcompatibility inventoryの両方が正常な場合だけ許可する。 | process_gate | lint／doctor | src/lint/workflow-classification-catalog.ts:30-35 |
| `RD11-171` | workflow catalog lintは、axis:idの組が重複している場合に違反にする。 | process_gate | lint | src/lint/workflow-classification-catalog.ts:50-54 |
| `RD11-172` | workflow catalog lintは、entityのparent_idに対応するIDがcatalogに存在しない場合に違反にする。 | process_gate | lint | src/lint/workflow-classification-catalog.ts:55-66 |
| `RD11-173` | workflow catalog lintは、signalの対象IDがなく、unresolved_until_decisionもtrueでない場合に違反にする。 | process_gate | lint | src/lint/workflow-classification-catalog.ts:67-75 |
| `RD11-174` | workflow catalog lintは、signalの対象entityのaxisがtarget_axisと異なる場合に違反にする。 | process_gate | lint | src/lint/workflow-classification-catalog.ts:75-81 |
| `RD11-176` | workflow catalog lintは、catalogの読込みまたは解析が例外になった場合にok=falseとmissing_or_invalid違反を返す。 | process_gate | lint | src/lint/workflow-classification-catalog.ts:107-127 |
| `RD11-197` | terminal fullback監査は、dependency issueの同じ番号が複数回宣言されている場合に失敗させる。 | process_gate | lint | src/lint/workflow-classification-terminal-fullback.ts:444-455 |
| `RE01-120` | optional adapterの欠如だけでcoreを失敗させず、不安定なAntigravity連携はfail-openとする。 | tooling_runtime | config | docs/governance/helix-harness-requirements_v1.2.md:1618-1645 |
| `RE01-122` | runtimeがない実行要求に対してCLIはexit 2と不足情報・fallback案を返し、AI不要の検証まで失敗扱いにしない。 | tooling_runtime | prose | docs/governance/helix-harness-requirements_v1.2.md:1698-1698 |
| `RE01-185` | policy resolverはtyped identityからexecution policyを導出し、signalや旧mode名、raw shell、承認boolean、自由式をpolicyとして受け入れない。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:154-158 |
| `RE01-192` | CLIはresolvedを0、曖昧・承認待ちを1、unknown・decision-required・unsupportedを2として返し、名称heuristicで成功へ変換しない。 | tooling_runtime | gate | docs/governance/helix-harness-requirements_v1.3.md:199-211 |
| `RE01-240` | worker出力の検証者はstrict schemaとdigestを照合し、既定制約を弱める場合は対象・理由・期限・再検査条件を要求する。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:431-431 |
| `RE01-242` | 安全判定者は操作・対象・データ・送信先等を独立したtyped axisで評価し、単一risk値、denylist、network booleanだけで判定しない。unknown・missing・混在・複数解決はfail-closeする。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:445-447 |
| `RE01-243` | 実行前検証器は運用影響を別軸で評価し、対象集合と物理identityを実行直前に再照合する。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:464-465 |
| `RE01-249` | path判定器は文字列だけでなくrealpath、祖先link、mount、inode、file typeを確認し、検証不能なsymlink・junction・hardlink・異device・mount条件を拒否する。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:474-484 |
| `RE01-250` | 初期path policyは一つのliteral pathに限定し、repository外のabsolute path、親参照、制御文字、Windowsの代替表現、非対応file typeを拒否する。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:474-484 |
| `RE01-278` | NodeはPython出力を再検証して単一transactionでcommitし、出力中のcommand・SQL・absolute path・codeを実行しない。必要検査がない場合はgapとして見逃さず停止する。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:565-573 |
| `RF00-001` | receipt生成器、epoch操作器、loop storeは、PLAN IDをパス生成や状態操作に使用する前にassertLoopPlanIdによる検証を通す。 | safety_security | gate | src/orchestration/autonomous-loop-run-receipts.ts:40-42; src/orchestration/durable-loop-epoch.ts:105-106; src/orchestration/durable-loop-epoch-node.ts:228-230; src/orchestration/loop-store.ts:42-45; src/orchestration/loop-store.ts:201-203; src/orchestration/loop-store.ts:222-226; src/orchestration/loop-store.ts:286-288 |
| `RF00-012` | ループ実行器はtick内の停止判定でexists・noProgress・customのprobeを常にfalseとし、これらのprobeによる停止を発生させない。 | tooling_runtime | config | src/orchestration/loop-runner.ts:30-34; src/orchestration/loop-runner.ts:76-89 |
| `RF00-027` | 旧fileLoopStoreは、runSideEffectが呼ばれた場合、stateとpurposeを使った認可や重複実行検査を行わず、渡されたeffectを直接実行する。 | tooling_runtime | gate | src/orchestration/loop-store.ts:67-67 |
| `RF01-029` | チーム定義読込処理は、ファイル内容のYAML解析またはteamDefinitionSchema検証が失敗した場合、定義を返さず例外で失敗する。 | tooling_runtime | gate | src/team/run.ts:303-305 |
| `RG09-006` | 外部化の後半段階の実装担当者は、調整値を外部設定ファイルへ移し、schema検証をdoctorへ接続して、schema違反のconfigでdoctorを失敗させる。 | tooling_runtime | prose／doctor | docs/governance/coding-rules.md:124-129 |
| `RG10-013` | Issue依存監査はscheduled runまたはworkflow_dispatchで全採用Issueを監査する際、Issueのplan_idがcandidate treeに存在しない場合もfail-closeする。 | process_gate | ci | docs/governance/github-issue-hierarchy-rules.md:69-73 |

## 副として対応づいた規則（843件）

`RA-043`、`RA-044`、`RA-045`、`RA-078`、`RA-080`、`RA-083`、`RA-084`、`RA-085`、`RA-086`、`RA-087`、`RA-127`、`RA-151`、`RA-188`、`RA-210`、`RA-214`、`RA-357`、`RB0-030`、`RB0-109`、`RB0-119`、`RB0-120`、`RB0-121`、`RB0-179`、`RB04-023`、`RB04-121`、`RB04-250`、`RB05-039`、`RB05-044`、`RB05-047`、`RB05-090`、`RB05-125`、`RB05-136`、`RB05-142`、`RB05-150`、`RB05-154`、`RB05-158`、`RB05-159`、`RB05-161`、`RB05-165`、`RB05-170`、`RB05-176`、`RB05-204`、`RB05-227`、`RB05-228`、`RB05-237`、`RB05-250`、`RB05-252`、`RB05-258`、`RB05-268`、`RB05-303`、`RB05-307`、`RB05-310`、`RB05-314`、`RB06-003`、`RB06-014`、`RB06-034`、`RB06-052`、`RB06-080`、`RB06-091`、`RB06-099`、`RB06-120`、`RB06-134`、`RB06-135`、`RB06-141`、`RB06-142`、`RB06-155`、`RB06-160`、`RB06-165`、`RB06-180`、`RB06-216`、`RB06-255`、`RB07-186`、`RB07-191`、`RB07-212`、`RB07-284`、`RB07-297`、`RB07-309`、`RB08-004`、`RB08-119`、`RB08-135`、`RB08-142`、`RB08-145`、`RB08-203`、`RB08-259`、`RB08-283`、`RB08-292`、`RB08-305`、`RB08-307`、`RB08-316`、`RB08-322`、`RB08-326`、`RB08-343`、`RB09-010`、`RB09-016`、`RB09-033`、`RB09-038`、`RB09-049`、`RB09-051`、`RB09-064`、`RB09-073`、`RC0-002`、`RC0-004`、`RC0-015`、`RC0-021`、`RC0-023`、`RC0-024`、`RC0-030`、`RC0-053`、`RC0-054`、`RC0-094`、`RC0-096`、`RC0-102`、`RC0-149`、`RC0-151`、`RC00-013`、`RC00-014`、`RC00-016`、`RC00-023`、`RC00-027`、`RC00-032`、`RC00-034`、`RC00-051`、`RC00-083`、`RC00-095`、`RC00-101`、`RC00-103`、`RC00-107`、`RC00-109`、`RC00-110`、`RC00-111`、`RC00-123`、`RC00-127`、`RC00-134`、`RC00-135`、`RC00-136`、`RC00-143`、`RC00-159`、`RC00-160`、`RC00-161`、`RC00-163`、`RC00-164`、`RC00-165`、`RC00-201`、`RC00-210`、`RC00-225`、`RC00-232`、`RC00-234`、`RC00-243`、`RC00-246`、`RC01-004`、`RC01-008`、`RC01-018`、`RC01-019`、`RC01-027`、`RC01-041`、`RC01-042`、`RC01-043`、`RC01-051`、`RC01-052`、`RC01-083`、`RC01-108`、`RC01-109`、`RC01-110`、`RC01-112`、`RC01-114`、`RC01-119`、`RC01-121`、`RC01-123`、`RC01-132`、`RC01-133`、`RC01-138`、`RC01-157`、`RC01-158`、`RC01-159`、`RC01-163`、`RC01-180`、`RC01-188`、`RC01-189`、`RC01-192`、`RC01-195`、`RC02-005`、`RC02-006`、`RC02-007`、`RC02-019`、`RC02-020`、`RC02-031`、`RC02-035`、`RC02-044`、`RC02-046`、`RC02-047`、`RC02-048`、`RC02-049`、`RC02-051`、`RC02-056`、`RC02-060`、`RC02-064`、`RC02-069`、`RC02-070`、`RC02-072`、`RC02-076`、`RC02-089`、`RC02-090`、`RC02-094`、`RC02-101`、`RC02-106`、`RC02-116`、`RC02-121`、`RC02-122`、`RC02-123`、`RC02-128`、`RC02-131`、`RC02-132`、`RC02-137`、`RC02-139`、`RC02-143`、`RC02-156`、`RC02-160`、`RC02-164`、`RC02-179`、`RC02-189`、`RC03-002`、`RC03-007`、`RC03-013`、`RC03-016`、`RC03-019`、`RC03-023`、`RC03-025`、`RC03-029`、`RC03-033`、`RC03-034`、`RC03-036`、`RC03-037`、`RC03-039`、`RC03-043`、`RC03-049`、`RC03-050`、`RC03-060`、`RC03-063`、`RC03-064`、`RC03-070`、`RC03-071`、`RC03-072`、`RC03-076`、`RC03-077`、`RC03-078`、`RC03-079`、`RC03-080`、`RC03-081`、`RC03-082`、`RC03-088`、`RC03-089`、`RC03-091`、`RC03-092`、`RC03-105`、`RC03-107`、`RC03-108`、`RC03-110`、`RC03-112`、`RC03-121`、`RC03-123`、`RC03-145`、`RC03-152`、`RC04-010`、`RC04-011`、`RC04-012`、`RC04-013`、`RC04-039`、`RC04-041`、`RC04-053`、`RC04-058`、`RC04-065`、`RC04-069`、`RC04-074`、`RC04-084`、`RC04-085`、`RC04-088`、`RC04-092`、`RC04-094`、`RC04-101`、`RC04-103`、`RC04-109`、`RC04-111`、`RC04-133`、`RC04-134`、`RC04-138`、`RC04-151`、`RC04-153`、`RC04-157`、`RC04-182`、`RC04-187`、`RC04-190`、`RC04-192`、`RC04-215`、`RC04-217`、`RC04-223`、`RC04-225`、`RC04-226`、`RC04-228`、`RC04-231`、`RC04-232`、`RC04-233`、`RC04-234`、`RC04-257`、`RC04-272`、`RC04-277`、`RC04-278`、`RC04-287`、`RC04-291`、`RD00-008`、`RD00-011`、`RD00-014`、`RD00-015`、`RD00-024`、`RD00-025`、`RD00-026`、`RD00-027`、`RD00-032`、`RD00-034`、`RD00-037`、`RD00-048`、`RD00-050`、`RD00-052`、`RD00-053`、`RD00-056`、`RD00-059`、`RD00-067`、`RD00-077`、`RD00-085`、`RD00-091`、`RD00-092`、`RD00-096`、`RD00-099`、`RD00-100`、`RD00-102`、`RD00-103`、`RD00-108`、`RD00-109`、`RD00-110`、`RD00-113`、`RD00-114`、`RD00-115`、`RD00-116`、`RD00-117`、`RD00-119`、`RD00-121`、`RD00-122`、`RD00-125`、`RD00-128`、`RD00-132`、`RD00-142`、`RD00-143`、`RD00-149`、`RD00-150`、`RD00-167`、`RD00-171`、`RD00-179`、`RD00-180`、`RD00-185`、`RD00-186`、`RD00-194`、`RD00-195`、`RD00-197`、`RD00-204`、`RD00-205`、`RD00-206`、`RD00-209`、`RD00-210`、`RD00-211`、`RD00-212`、`RD00-217`、`RD00-219`、`RD00-226`、`RD00-229`、`RD00-232`、`RD00-235`、`RD00-238`、`RD00-240`、`RD00-241`、`RD00-254`、`RD00-256`、`RD00-257`、`RD00-258`、`RD00-260`、`RD00-263`、`RD00-264`、`RD00-269`、`RD00-270`、`RD00-279`、`RD00-280`、`RD00-282`、`RD00-284`、`RD00-285`、`RD00-291`、`RD00-293`、`RD00-299`、`RD00-302`、`RD00-304`、`RD00-307`、`RD00-308`、`RD00-309`、`RD00-315`、`RD00-321`、`RD00-333`、`RD00-336`、`RD00-337`、`RD00-338`、`RD00-341`、`RD00-342`、`RD00-361`、`RD00-364`、`RD00-366`、`RD00-367`、`RD00-368`、`RD00-369`、`RD00-372`、`RD00-373`、`RD00-374`、`RD00-375`、`RD00-376`、`RD00-378`、`RD01-008`、`RD01-012`、`RD01-032`、`RD01-042`、`RD01-045`、`RD01-046`、`RD01-047`、`RD01-056`、`RD01-065`、`RD01-074`、`RD01-083`、`RD01-091`、`RD01-092`、`RD01-094`、`RD01-097`、`RD01-103`、`RD01-116`、`RD01-118`、`RD01-130`、`RD01-133`、`RD01-151`、`RD01-159`、`RD01-162`、`RD01-174`、`RD01-175`、`RD01-179`、`RD01-184`、`RD01-187`、`RD01-191`、`RD01-204`、`RD01-219`、`RD01-220`、`RD01-222`、`RD01-227`、`RD01-228`、`RD01-232`、`RD01-236`、`RD01-241`、`RD01-242`、`RD01-244`、`RD01-255`、`RD01-264`、`RD01-275`、`RD01-282`、`RD01-289`、`RD01-292`、`RD01-308`、`RD01-310`、`RD01-315`、`RD01-321`、`RD01-327`、`RD01-336`、`RD02-003`、`RD02-007`、`RD02-015`、`RD02-024`、`RD02-034`、`RD02-038`、`RD02-054`、`RD02-055`、`RD02-056`、`RD02-070`、`RD02-072`、`RD02-082`、`RD02-084`、`RD02-109`、`RD02-115`、`RD02-125`、`RD02-135`、`RD02-136`、`RD02-137`、`RD02-145`、`RD02-161`、`RD02-169`、`RD02-172`、`RD02-178`、`RD02-192`、`RD02-193`、`RD02-211`、`RD02-214`、`RD02-236`、`RD02-240`、`RD02-242`、`RD02-261`、`RD02-265`、`RD02-287`、`RD02-305`、`RD02-316`、`RD02-321`、`RD02-337`、`RD02-338`、`RD02-347`、`RD03-008`、`RD03-010`、`RD03-033`、`RD03-034`、`RD03-036`、`RD03-043`、`RD03-044`、`RD03-045`、`RD03-058`、`RD03-080`、`RD03-086`、`RD03-120`、`RD03-133`、`RD03-144`、`RD03-145`、`RD03-150`、`RD03-154`、`RD03-155`、`RD03-166`、`RD03-168`、`RD03-169`、`RD03-174`、`RD03-175`、`RD03-177`、`RD03-178`、`RD03-179`、`RD03-180`、`RD03-182`、`RD03-187`、`RD03-188`、`RD03-192`、`RD03-195`、`RD03-202`、`RD03-205`、`RD03-211`、`RD03-212`、`RD03-224`、`RD03-233`、`RD03-238`、`RD03-239`、`RD03-245`、`RD04-003`、`RD04-005`、`RD04-007`、`RD04-008`、`RD04-016`、`RD04-035`、`RD04-036`、`RD04-040`、`RD04-043`、`RD04-068`、`RD04-072`、`RD04-078`、`RD04-079`、`RD04-085`、`RD04-089`、`RD04-096`、`RD04-103`、`RD04-104`、`RD04-105`、`RD04-107`、`RD04-110`、`RD04-111`、`RD04-118`、`RD04-119`、`RD04-124`、`RD04-130`、`RD04-131`、`RD04-135`、`RD04-136`、`RD04-150`、`RD04-151`、`RD04-163`、`RD04-168`、`RD04-206`、`RD04-207`、`RD04-219`、`RD05-002`、`RD05-017`、`RD05-039`、`RD05-040`、`RD05-041`、`RD05-052`、`RD05-053`、`RD05-058`、`RD05-059`、`RD05-060`、`RD05-062`、`RD05-063`、`RD05-064`、`RD05-065`、`RD05-066`、`RD05-068`、`RD05-069`、`RD05-070`、`RD05-073`、`RD05-074`、`RD05-075`、`RD05-076`、`RD05-077`、`RD05-079`、`RD05-081`、`RD05-083`、`RD05-085`、`RD05-088`、`RD05-090`、`RD05-092`、`RD05-093`、`RD05-094`、`RD05-095`、`RD05-096`、`RD05-097`、`RD05-099`、`RD05-100`、`RD05-108`、`RD05-113`、`RD05-115`、`RD05-117`、`RD05-118`、`RD05-120`、`RD05-121`、`RD05-122`、`RD05-123`、`RD05-125`、`RD05-127`、`RD05-131`、`RD05-136`、`RD05-137`、`RD05-138`、`RD05-139`、`RD05-140`、`RD05-143`、`RD05-144`、`RD05-156`、`RD05-157`、`RD05-162`、`RD05-165`、`RD05-166`、`RD05-177`、`RD05-179`、`RD05-189`、`RD05-192`、`RD05-217`、`RD05-221`、`RD05-222`、`RD05-232`、`RD05-248`、`RD05-249`、`RD06-005`、`RD06-007`、`RD06-010`、`RD06-011`、`RD06-019`、`RD06-035`、`RD06-038`、`RD06-042`、`RD06-051`、`RD06-055`、`RD06-059`、`RD06-067`、`RD06-069`、`RD06-076`、`RD06-077`、`RD06-078`、`RD06-101`、`RD06-102`、`RD06-103`、`RD06-109`、`RD06-129`、`RD06-133`、`RD06-147`、`RD06-148`、`RD06-151`、`RD06-154`、`RD06-157`、`RD06-158`、`RD06-164`、`RD06-165`、`RD06-166`、`RD06-179`、`RD06-183`、`RD06-191`、`RD06-195`、`RD06-196`、`RD07-016`、`RD07-029`、`RD07-036`、`RD07-038`、`RD07-045`、`RD07-062`、`RD07-064`、`RD07-074`、`RD07-082`、`RD07-084`、`RD07-092`、`RD07-096`、`RD07-104`、`RD07-107`、`RD07-110`、`RD07-111`、`RD07-115`、`RD07-127`、`RD07-128`、`RD07-133`、`RD07-134`、`RD07-140`、`RD07-142`、`RD07-143`、`RD07-145`、`RD07-146`、`RD07-178`、`RD07-190`、`RD07-194`、`RD07-195`、`RD07-197`、`RD07-200`、`RD07-206`、`RD08-002`、`RD08-011`、`RD08-027`、`RD08-029`、`RD08-034`、`RD08-041`、`RD08-043`、`RD08-046`、`RD08-049`、`RD08-050`、`RD08-052`、`RD08-054`、`RD08-055`、`RD08-064`、`RD08-065`、`RD08-067`、`RD08-072`、`RD08-083`、`RD08-085`、`RD08-101`、`RD08-106`、`RD08-111`、`RD08-126`、`RD08-132`、`RD08-146`、`RD08-164`、`RD08-166`、`RD08-170`、`RD08-177`、`RD08-178`、`RD08-183`、`RD08-184`、`RD08-186`、`RD08-190`、`RD08-195`、`RD08-197`、`RD08-203`、`RD08-206`、`RD08-215`、`RD09-003`、`RD09-006`、`RD09-025`、`RD09-030`、`RD09-033`、`RD09-034`、`RD09-036`、`RD09-037`、`RD09-040`、`RD09-042`、`RD09-044`、`RD09-046`、`RD09-057`、`RD09-063`、`RD09-072`、`RD09-074`、`RD09-075`、`RD09-092`、`RD09-143`、`RD09-146`、`RD09-150`、`RD09-153`、`RD09-157`、`RD10-005`、`RD10-013`、`RD10-016`、`RD10-022`、`RD10-026`、`RD10-030`、`RD10-033`、`RD10-046`、`RD10-048`、`RD10-050`、`RD10-061`、`RD10-066`、`RD10-068`、`RD10-070`、`RD10-074`、`RD10-080`、`RD10-111`、`RD10-112`、`RD10-128`、`RD10-146`、`RD10-181`、`RD10-191`、`RD11-035`、`RD11-036`、`RD11-039`、`RD11-040`、`RD11-049`、`RD11-052`、`RD11-067`、`RD11-079`、`RD11-085`、`RD11-100`、`RD11-101`、`RD11-102`、`RD11-113`、`RD11-118`、`RD11-175`、`RD11-180`、`RD11-181`、`RD11-190`、`RE01-121`、`RE01-129`、`RE01-135`、`RE01-143`、`RE01-183`、`RE01-184`、`RE01-186`、`RE01-188`、`RE01-189`、`RE01-190`、`RG12-004`、`RG13-006`、`RG14-017`
