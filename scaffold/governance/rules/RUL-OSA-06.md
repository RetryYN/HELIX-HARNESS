---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSA-06
group: OS検収
product: OS
atoms_primary: 210
atoms_secondary: 806
issue_projection: #1860
---

# RUL-OSA-06（OS検収／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

機械検査（診断、lint、gate）の各checkが何を不合格にするかを定義し、規則と検査の対応を保つ。

## 主として対応づいた規則（210件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-044` | shell hookはmachine-safety検査がblockを返した場合、exit 2で対象操作を拒否する。 | safety_security | hook | .claude/hooks/git-command-guard.ts:40-44 |
| `RA-296` | harness設計者はworkflow規則を必要に応じてschema・lint・doctor・hook・testで裏付ける。 | behavior_discipline | prose | CLAUDE.md:104-109 |
| `RA-362` | Refactor候補検出はsrcをscan rootとし、module行数700・export24・helper120行・重複function最低10行の閾値を使う。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:2-9 |
| `RA-363` | Refactor候補検出はliteral反復6回・長さ12以上、policy閾値5・最大branch40と、stage等の登録policy語彙を使う。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:10-27 |
| `RB0-022` | 新しいdetector・lint・gateは、再発可能な欠陥・既存検査のgap・誤検知境界・削除または統合条件がある場合だけ追加する。 | process_gate | prose | docs/governance/coding-rules.md:26-27; docs/governance/ddd-tdd-rules.md:25-27 |
| `RB0-025` | coding-rule保守者は文書の機械可読Rule IDをlint実装と一致させる。 | tooling_runtime | lint／doctor | docs/governance/coding-rules.md:8-8; docs/governance/coding-rules.md:35-35 |
| `RB0-034` | 設定保守者はBiomeの認知複雑度検査をerrorとして有効化し、187を超える新規複雑度を失敗させる。 | tooling_runtime | config／lint | docs/governance/coding-rules.md:80-85 |
| `RB0-043` | coding-ruleの例外が必要な者はpolicy PLANを先に追加し、その後に規約正本とlint testを同時更新する。 | process_gate | prose | docs/governance/coding-rules.md:142-142 |
| `RB0-135` | 設計者は機械的に決まるpass/failをdoctor・lint・testへ寄せ、deterministic gateをLLM判断で代替しない。 | tooling_runtime | prose | docs/skills/judgment-core.md:70-73 |
| `RB04-054` | test-perspective-gateはV-pairの観点抜けと検証レベル間の重複を検出した場合、static-onlyでもfail-closeする。 | process_gate | gate | docs/governance/helix-harness-concept_v3.1.md:508-508 |
| `RB04-084` | G1-traceはP0機能要求の画面trace欠落をブロックし、P1/P2の欠落および画面PLANのbusiness/functional依存列挙不足は警告する。 | process_gate | lint／gate | docs/governance/helix-harness-concept_v3.1.md:722-725 |
| `RB04-110` | skillは知識と観点の層に限定し、実行条件とfail-closeはharness-checkで機械強制する。 | process_gate | prose／ci | docs/governance/helix-harness-concept_v3.1.md:995-995 |
| `RB04-132` | doctorは実在source moduleが設計module集合に含まれない場合、module driftとしてfail-closeする。 | process_gate | doctor | docs/governance/helix-harness-concept_v3.1.md:1193-1193 |
| `RB04-154` | L6 completion検査はdraft doc・draft PLAN・未確定テスト設計・G6未passを警告として列挙する。 | process_gate | lint／doctor | docs/governance/helix-harness-concept_v3.1.md:1251-1252 |
| `RB04-293` | 登録された全改善sourceのdetectorは決定的に動作する設定とする。 | tooling_runtime | config | config/universal-improvement-source-registry.v1.json:96-96; config/universal-improvement-source-registry.v1.json:157-157; config/universal-improvement-source-registry.v1.json:218-218; config/universal-improvement-source-registry.v1.json:279-279; config/universal-improvement-source-registry.v1.json:340-340; config/universal-improvement-source-registry.v1.json:401-401; config/universal-improvement-source-registry.v1.json:462-462; config/universal-improvement-source-registry.v1.json:523-523; config/universal-improvement-source-registry.v1.json:584-584; config/universal-improvement-source-registry.v1.json:645-645 |
| `RB05-004` | Document Gateは基本文書と該当機能文書の存在、および機能ID・版・関連パス・必須テスト・risk・auto_mergeの定義を確認する。 | process_gate | gate | docs/governance/audit-framework.md:151-165 |
| `RB05-010` | Test Gateは必須テストの存在、機能IDとrequired_testsへの対応、全テストの成功、失敗テストを無視していないことを確認する。 | process_gate | gate | docs/governance/audit-framework.md:248-253 |
| `RB05-011` | Implementation Gateは変更がrelated_paths内に収まり、想定外ファイル変更や仕様外挙動がないことを確認する。 | process_gate | gate | docs/governance/audit-framework.md:257-262 |
| `RB05-012` | Implementation Gateはテスト適合、フロント・サービス・DBの責務分離、一時実装の残存、TODO/FIXMEの理由を検査する。 | process_gate | gate | docs/governance/audit-framework.md:261-265 |
| `RB05-030` | Coding Rule Gateは規約遵守を検査し、機械検査をLint・Typecheck・静的解析で、文脈判断をAI監査レポートで行う。 | process_gate | gate／lint | docs/governance/audit-framework.md:321-326 |
| `RB05-032` | PR Gateはdocsとtestsだけの変更を実装不足として確認し、docsだけまたはtestsだけの変更をそれぞれの更新候補として扱う。 | review_merge | gate | docs/governance/audit-framework.md:335-338 |
| `RB05-041` | Gate設計者は機械処理可能な判断を自動化し、文脈判断が必要な部分をAIレビューへ割り当て、分担を規約やrisk policyに外部化する。 | lane_delegation | prose | docs/governance/audit-framework.md:478-490; docs/governance/audit-framework.md:499-499 |
| `RB05-046` | 監査実装者はcheck論理を単一実装にし、dev-localとCIで同じバイナリまたはモジュールおよび同一レポート形式を使用する。 | tooling_runtime | prose | docs/governance/audit-framework.md:503-514 |
| `RB05-090` | DB検証者は指定4表が非空であること、実在row・edgeによるstale/orphan検査、schema revisionの一致、両runのstale・orphan・findingゼロを要求する。 | process_gate | gate | docs/governance/l3-rebaseline-g3-freeze-packet.md:500-514 |
| `RB05-111` | Issue GateはAIによる指示の脱落を機械的に防ぎ、Scope Gateはacceptanceに不要な機能拡張を防ぐ。 | process_gate | gate | docs/governance/infinity-loop-source-capability-ledger.md:55-56 |
| `RB05-132` | Source Coverageの最終合格はatomic behavior全集合でpending・orphan・aggregate算入・source集合差分が全てゼロかつ全joinがあることを機械検査した場合だけ認める。 | process_gate | gate | docs/governance/infinity-loop-source-capability-ledger.md:439-449 |
| `RB05-201` | atom manifestは一atomの複数behavior、未分類child、同一primary spanの重複所有を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:163-165 |
| `RB05-221` | template instance検証はrequired section欠落、TBD、boilerplate同文による空洞化を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:228-230 |
| `RB05-228` | Requirement Translatorは一atomの複数acceptance outcome、source span欠落、authority root欠落、service mapping欠落を拒否し、ambiguity未解決ならaccepted化しない。 | process_gate | prose | docs/governance/infinity-loop-system-assertion-cases.md:253-257 |
| `RB05-309` | coverage最終PASSは期待ref・entry分類の一致と未分類・atom欠落・fixture孤児・親算入・pending・根拠なしreject・未原子化branch差分・trace孤児・stale・二重算入ゼロ、およびreceipt digest一致を全て要求する。 | process_gate | gate | docs/governance/infinity-loop-source-atomization-contract.md:288-310 |
| `RB05-310` | 原子化検証はprimary source spanの重複所有、未確定atom kind、extractor/plugin/config/signature版変更後の旧receipt利用を失敗させる。 | process_gate | gate | docs/governance/infinity-loop-source-atomization-contract.md:319-322 |
| `RB06-003` | Admission検証者はCandidateのschema、ID、revision、authority、provenance、意味差分、上位整合、trace、pair、影響、重複・孤立、stale、安全境界、必要な証跡を検査する。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:59-64 |
| `RB06-032` | 監査者はfalse-positive・historical判定を直ちにscanner allowlistへ埋め込まず、根拠変更時に再検出できる状態を保つ。 | evidence_claim | prose | docs/governance/l12-hybrid-current-authority-disposition-2026-07-19.md:78-78 |
| `RB06-036` | CIは監査対象が排他的に一分類へ入り、集計・routingクロス表が一致し、review manifestに重複・死骸がないことを検査する。 | evidence_claim | ci | docs/governance/l12-hybrid-current-authority-disposition-2026-07-19.md:267-267 |
| `RB06-060` | 提案されたtrace lintでは、HR-FR-HYB-001〜010の各IDに最低一箇所のcitationを要求する。 | evidence_claim | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:101-103 |
| `RB06-153` | Template Obligation Extractorはactive templateの全章・field・表・done-when・pair要素をprovenance付きproposalまたはgap findingへ分岐する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:115-115 |
| `RB06-193` | design PLAN lintはreport・batch・notification・code-valueの必須節構造をfail-closeで検証する。 | process_gate | lint／gate | docs/governance/document-system-map.md:85-88 |
| `RB06-224` | doctorはroadmapのdatabase・service・frontend・UI pack欠落を失敗させる。 | process_gate | doctor | docs/governance/helix-objective-evidence-audit.md:49-49 |
| `RB06-229` | 通常doctorは外部source確認のnetworkを呼ばず、専用objective-externalで実測HEADとsemver最大配布tagをledgerへ照合する。 | tooling_runtime | doctor | docs/governance/helix-objective-evidence-audit.md:53-53 |
| `RB06-266` | cross-check engineは新docのmetadataに一致する全ruleを自動適用し、検査済みcoverageと未検査gapを報告する。 | process_gate | prose | docs/governance/gate-design.md:132-146 |
| `RB06-267` | 決定論的gateのrule判定は純粋関数で行い、LLMや外部APIを呼ばない。 | tooling_runtime | prose | docs/governance/gate-design.md:147-147 |
| `RB06-268` | 構造検査はpair実在、参照解決、双方向trace、上流所属、宣言件数一致、ID形式・重複、用語戻し、依存drift、asset/roster整合、backlog書式を確認する。 | process_gate | prose／lint | docs/governance/gate-design.md:151-165 |
| `RB06-270` | lint-wiring gateは全lintがruntime経路から到達可能またはDEFERRED登録済みであることを要求する。 | process_gate | lint／gate | docs/governance/gate-design.md:182-182 |
| `RB07-135` | doctorはdebtのdischarge_planが実在し、未完了のままTTLを超過していないことを確認する。 | process_gate | doctor | docs/skills/debt-register.md:63-64; docs/skills/debt-register.md:73-75 |
| `RB07-138` | governance検査はReverse back-fill依存のないadd-impl、PLAN根拠のない抑制、存在しないgenerates文書、証跡が空のtrace-freezeを違反として扱う。 | process_gate | prose／doctor／lint | docs/skills/debt-register.md:102-110 |
| `RB07-307` | 文書authority監査は上流authority、main再読、IR admission、tracked inventory、bindingとreverse consumer graph、doctor baselineの順で行い、4種のrequired oracleを備える。 | process_gate | config | docs/governance/effective-agent-startup-followup-registry.json:37-52 |
| `RB08-084` | gate設計者は条件を反証可能にし、各条件を検査commandまたは明示的な人間reviewへ対応させる。 | process_gate | prose | docs/skills/gate-planning.md:51-56 |
| `RB08-086` | gate設計者はschemaの正しさと文書可読性を別々に検査する。 | process_gate | prose | docs/skills/gate-planning.md:59-60 |
| `RB08-119` | PLAN lintは存在しないPLAN IDへのrequires参照をblocking errorとして拒否する。 | process_gate | lint | docs/skills/dependency-map.md:34-37 |
| `RB08-135` | projection追加担当者は欠落・空projectionをdoctorへ接続し、黙認せずfail-closeさせる。 | evidence_claim | doctor | docs/skills/harness-observability.md:50-51 |
| `RB08-141` | gate追加担当者は機械検出可能な漏れを対象に既存lint・doctorとの重複を確認し、新gateをdoctorへ結線してpass/fail両経路をtestする。 | process_gate | prose | docs/skills/ci-gate-design.md:45-52 |
| `RB08-142` | gate設計者はID・件数の被覆だけでなく成果物の欠落・誤りを検出できるか確認し、欠落時はfail-closeを優先する。 | evidence_claim | prose | docs/skills/ci-gate-design.md:54-59 |
| `RB08-235` | Design HARNESS担当者はprototype・画面要求・DOM/component・token/CSS・interaction/E2E・表示文言・analytics発火・a11y実測のdrift検出を追加する。 | process_gate | prose | docs/governance/design-harness-assessment-audit-2026-07-19.md:70-72 |
| `RB09-010` | forward-convergence gateは、新規違反のみをfail-closeし、台帳に列挙された既存債務によってdoctor.okを落としてはならない。 | process_gate | gate／doctor | docs/governance/forward-convergence-legacy-debt-audit.md:3-7 |
| `RB09-012` | forward-convergence-auditは、現存債務の台帳行とFORWARD_CONVERGENCE_LEGACY_DEBT allowlistの双方向1対1一致をhard checkで担保する。 | process_gate | gate | docs/governance/forward-convergence-legacy-debt-audit.md:5-7; docs/governance/forward-convergence-legacy-debt-audit.md:14-16 |
| `RB09-070` | U-NIO-001の検証は、9要求群のID欠落・重複または既存owner参照欠落をREDにする。 | process_gate | prose | docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md:23-25 |
| `RB09-071` | U-NIO-002の検証は、L1／L3／L10各層候補のexact set不足または混載をREDにする。 | process_gate | prose | docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md:26-26 |
| `RC0-050` | Push前guardは、送信対象commitのsubject検査が不合格の場合、pushを拒否する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:119-122; src/runtime/git-command-guard-hook.ts:271-277 |
| `RC0-088` | G1静的gateは、対象L1文書がなく、draftまたは孤立pairがある場合、あるいはG1-traceが不合格の場合に失敗する。 | process_gate | gate | src/gate/static.ts:83-100; src/gate/static.ts:230-235 |
| `RC0-089` | G2静的gateは、対象L2文書の不在、draft、孤立pair、またはself-pairのwireframe.md欠落で失敗する。 | process_gate | gate | src/gate/static.ts:83-100; src/gate/static.ts:237-239 |
| `RC0-090` | G3静的gateは、対象L3文書がなく、draftまたは孤立pairがある場合、あるいはG3-traceが不合格の場合に失敗する。 | process_gate | gate | src/gate/static.ts:83-100; src/gate/static.ts:240-245 |
| `RC0-091` | G4静的gateは、対象L4文書がない場合、draftが残る場合、または孤立pairがある場合に失敗する。 | process_gate | gate | src/gate/static.ts:83-100; src/gate/static.ts:247-247 |
| `RC0-092` | G5静的gateは、対象L5文書がない場合、draftが残る場合、または孤立pairがある場合に失敗する。 | process_gate | gate | src/gate/static.ts:83-100; src/gate/static.ts:248-248 |
| `RC0-093` | G6静的gateは、対象L6文書がない場合、draftが残る場合、または孤立pairがある場合に失敗する。 | process_gate | gate | src/gate/static.ts:83-100; src/gate/static.ts:249-249 |
| `RC0-094` | g7-coverageは、coverage summaryが欠落・不正・数値欠落の場合、またはlines優先で取得したcoverage値が閾値未満の場合に失敗する。既定閾値は80%である。 | process_gate | gate | src/gate/static.ts:137-181 |
| `RC0-095` | G7静的gateは、pair-freeze、L0-L7群のfreeze、実装PLAN trace、oracle trace、left-arm carry、coverageのいずれかが不合格なら失敗する。 | process_gate | gate | src/gate/static.ts:184-222 |
| `RC0-096` | 静的gateは、決定的checkが登録されていないgateを失敗させる。ただしG0.5とR4はreview-onlyとして静的検査対象外で通過する。 | process_gate | gate | src/gate/static.ts:31-31; src/gate/static.ts:260-274 |
| `RC0-104` | workflow-guide-authorityは、全workflowのguide生成、identity、authority digest、signal投影、旧identity排除、digest非重複の検査に違反があれば失敗する。読取・生成例外も不合格にする。 | tooling_runtime | doctor | src/doctor/workflow-guide-authority.ts:65-183; src/doctor/workflow-guide-authority.ts:193-210 |
| `RC0-105` | Doctor集約は、hard checkが一つでも不合格なら全体を不合格にする。advisory checkは合否集約に参加させない。 | process_gate | doctor | src/doctor/check-registry.ts:26-41; src/doctor/index.ts:7692-7712; src/doctor/index.ts:7894-7901 |
| `RC01-003` | agent-model-ssotは、検査対象agentが0件の場合、不合格にする。 | tooling_runtime | lint | src/lint/agent-model-ssot.ts:70-75 |
| `RC01-068` | module-driftは、architectureから列挙moduleを1件も得られない場合、不合格にする。 | process_gate | lint | src/lint/module-drift.ts:88-98 |
| `RC01-071` | plan-dodのメッセージ生成は、confirmed/completedの検査対象が0件の場合、violationを出力する。analyzerのokはこの件数だけではfalseにならない。 | evidence_claim | lint | src/lint/plan-dod.ts:79-85 |
| `RC01-092` | coding-rulesは、正本文書に必須8種類のrule IDのいずれかがない場合、不合格にする。 | behavior_discipline | lint | src/lint/coding-rules.ts:196-205; src/lint/coding-rules.ts:502-513 |
| `RC01-093` | coding-rulesは、正本文書が必須集合にないrule IDを宣言している場合、不合格にする。 | behavior_discipline | lint | src/lint/coding-rules.ts:514-522 |
| `RC01-154` | 共有source-ledger意味検査は、source_ledger_freshnessに値がある場合、freshとchecked/ledger/sourceのいずれかを含まなければ違反を返す。 | evidence_claim | lint | src/lint/shared.ts:126-128; src/lint/shared.ts:195-197 |
| `RC01-168` | runtime-portabilityは、typecheck scriptにtsc --noEmitがない場合、不合格にする。 | tooling_runtime | lint | src/lint/runtime-portability.ts:104-111 |
| `RC01-169` | runtime-portabilityは、test:node-fallback scriptにvitest runと指定2テストpathが揃っていない場合、不合格にする。 | tooling_runtime | lint | src/lint/runtime-portability.ts:112-123 |
| `RC02-001` | doctorはhard checkが1件でも失敗した場合、総合判定を失敗にする。advisory checkは総合判定に参加させない。 | process_gate | doctor | src/doctor/check-registry.ts:26-41 |
| `RC02-044` | doctorのskill-quality checkは、skill品質検査が不合格、またはcatalogを読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:1133-1152 |
| `RC02-046` | doctorのchange-impact checkは、変更影響検査が不合格、root不在、またはgit status読込失敗の場合に失敗する。非Git repositoryでは検査を省略して成功とする。 | process_gate | doctor | src/doctor/index.ts:1182-1209 |
| `RC02-048` | doctorのverification-profile checkは、検証profile gateが不合格、または変更graphを読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:1268-1290 |
| `RC02-049` | doctorのbranch-kind-checkは、branch種別検査が不合格、またはbranch・check入力を読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:1292-1314 |
| `RC02-050` | doctorのcoding-rules checkは、coding規則・policy・workflow文書の検査が不合格、またはlintを行えない場合に失敗する。 | behavior_discipline | doctor | src/doctor/index.ts:1316-1339 |
| `RC02-051` | doctorのdesign-coverage checkは、設計catalogと成果物の被覆検査が不合格、catalog不在・解析不能・走査不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:1341-1364 |
| `RC02-062` | doctorのissue-dependency-wiring checkは、CLI・CI内の必須markerが欠落する、またはファイルを読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:1591-1625 |
| `RC02-064` | doctorのdb-projection-coverage checkは、physical-dataとschemaの被覆検査が不合格、または検査不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:1637-1656 |
| `RC02-070` | doctorのproject-current-location checkは、current.statusがforward以外ならadvisoryとfindingを表示するが、それだけでは失敗させない。root不在または投影処理失敗の場合は失敗する。 | process_gate | doctor | src/doctor/index.ts:1845-1858; src/doctor/index.ts:1893-1916; src/doctor/index.ts:1947-1961 |
| `RC02-073` | doctorのvisualization-tree-view-summary-surface checkは、summary surface監査がpass以外、またはroot不在の場合に失敗し、欠落・余分なsurface、source command不一致、想定外commandを診断する。 | tooling_runtime | doctor | src/doctor/index.ts:2235-2277 |
| `RC02-074` | doctorのvscode-extension-dynamic-binding checkは、tree検証失敗、root順不一致、必須view・activation event・read-only command欠落、余分なcommand、または検査例外で失敗する。 | tooling_runtime | doctor | src/doctor/index.ts:2279-2348 |
| `RC02-076` | doctorのroadmap-current-binding checkは、schema・command・band数・L1〜L12被覆・依存表・現在層の結合・drive action・再検証commandの契約違反、または投影不能で失敗する。契約違反がなくconsistency.alignedだけがfalseの場合はadvisoryにとどめる。 | process_gate | doctor | src/doctor/index.ts:2572-2717 |
| `RC02-089` | doctorのvmodel-zip-manifest checkは、repository root不在、またはZIP manifest検査のokがfalseの場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4509-4524 |
| `RC02-090` | doctorのvmodel-fit checkは、fit.statusがpass以外ならadvisoryを表示するが、それだけでは失敗させない。root不在または投影例外の場合は失敗する。 | process_gate | doctor | src/doctor/index.ts:4526-4542; src/doctor/index.ts:4570-4574; src/doctor/index.ts:4597-4606 |
| `RC02-094` | doctorのruntime-portability checkは、runtime可搬性検査が不合格、またはlint不能の場合に失敗する。 | tooling_runtime | doctor | src/doctor/index.ts:4688-4707 |
| `RC02-101` | doctorのplan-governance checkは、全PLANのgovernance gateが不合格、root不在、またはlint例外の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4831-4849 |
| `RC02-106` | doctorのrule-automation-closure checkは、規則自動化closure検査が不合格、対象0件、またはclosure表を読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4913-4935 |
| `RC02-110` | doctorのdrive-db-registration checkは、現行workflow model IDに対するDB登録検査が不合格、または読込・解析例外の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4993-5018 |
| `RC02-113` | doctorのcycle-p4-verification checkは、Cycle P4 closure監査が不合格、対象0件、または監査入力読込不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:5065-5087 |
| `RC02-128` | doctorのsub-doc-section-structure checkは、L4標準成果物の必須節構造検査が不合格、またはdocs・PLAN読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5475-5495 |
| `RC02-137` | doctorのregression-expansion checkは、root不在、dependency drift結果なし、回帰範囲展開の不合格・例外の場合に失敗する。ただし変更ファイル読込失敗は空配列へ置き換えて展開を続ける。 | process_gate | doctor | src/doctor/index.ts:1260-1265; src/doctor/index.ts:5750-5775 |
| `RC02-153` | doctorのdoc-consistency checkは、carry孤児・screen ID孤児・NFR宣言件数不一致・setupのreview bundle案内不足・version-up target不足、または文書読込不能で失敗する。 | process_gate | doctor | src/doctor/index.ts:6407-6443 |
| `RC02-160` | doctorのl12-hybrid-inventory-lifecycle checkは、reviewed-safe inventoryのlifecycle検査が不合格、またはinventory読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:6617-6642 |
| `RC02-163` | doctorのlint-wiring checkは、lint moduleの配線検査が不合格、または走査不能の場合に失敗する。 | tooling_runtime | doctor | src/doctor/index.ts:6556-6559; src/doctor/index.ts:6681-6694 |
| `RC02-164` | doctorのwcc-trace checkは、WCC pair文書の検査結果がwccTraceOkを満たさない、または文書読込不能の場合に失敗する。 | memory_context | doctor | src/doctor/index.ts:6696-6709 |
| `RC02-179` | doctorのfrontend-design-coverage checkは、frontend設計被覆検査が不合格、または検査不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:7229-7248 |
| `RC02-184` | full doctorは、UI domain bundle gateのokがfalseの場合、総合判定を失敗にする。 | process_gate | doctor | src/doctor/index.ts:7374-7374; src/doctor/index.ts:7574-7574; src/doctor/index.ts:7692-7719 |
| `RC02-189` | full doctorは、登録hard check数と評価済みhard check数が一致しない場合、例外を投げる。 | process_gate | doctor | src/doctor/index.ts:7707-7717 |
| `RC03-145` | G7のcoverage checkは、summary欠落・読込解析失敗・数値coverage欠落・閾値未達の場合、失敗する。coverageはtotal.lines.pctを優先し、なければtotal.statements.pctを用い、既定閾値は80%とする。 | evidence_claim | gate | src/gate/static.ts:137-182; src/gate/static.ts:197-210 |
| `RC03-152` | 静的ゲート評価処理は、決定論的検査が登録されておらず、review専用のG0.5またはR4でもないgateを失敗させる。 | process_gate | gate | src/gate/static.ts:31-31; src/gate/static.ts:260-274 |
| `RD00-100` | CI責務registry検証は、capabilityのoracle集合が空、またはoracle IDが不正な場合、失敗する。 | evidence_claim | ci | src/runtime/ci-responsibility-registry.ts:224-230 |
| `RD01-222` | Git guard hookは、push対象commit subjectの検証が失敗した場合にpushを拒否する。 | process_gate | hook／lint | src/runtime/git-command-guard-hook.ts:121-122; src/runtime/git-command-guard-hook.ts:271-277 |
| `RD01-249` | logical DB receipt検証は、converged=trueでなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:223-223 |
| `RD01-259` | logical DB receipt検証は、本体またはreplayのorphan件数が0でなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:237-238 |
| `RD01-260` | logical DB receipt検証は、本体またはreplayのfinding件数が0でなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:239-240 |
| `RD01-327` | verification inventory検証は、ownerが空白だけなら失敗する。 | process_gate | gate | src/runtime/impact-ci.ts:378-378 |
| `RD02-135` | detector登録器は、axis ID・phase gate・kind・severity・workflow routeのいずれかが欠ける場合に登録を拒否する。 | process_gate | gate | src/runtime/legacy-adoption.ts:291-304 |
| `RD02-136` | detector routerは、登録axisまたはそのworkflow routeがないfindingをunknown_axisとして処理経路へ流さない。 | process_gate | gate | src/runtime/legacy-adoption.ts:306-313 |
| `RD02-137` | detector routerは、findingのkindと登録kindが異なる場合に拒否する。 | process_gate | gate | src/runtime/legacy-adoption.ts:314-320 |
| `RD02-138` | detector routerは、fail_close以外のfindingをhard gate証拠として使う要求を拒否する。 | evidence_claim | gate | src/runtime/legacy-adoption.ts:321-327 |
| `RD02-261` | repo-wide guard探索器は、tests directoryが存在しない場合に失敗する。 | process_gate | gate | src/runtime/repo-wide-guard-runner.ts:14-18 |
| `RD02-265` | repo-wide guard読込器は、登録されたtestファイルが存在しない場合に失敗する。 | process_gate | gate | src/runtime/repo-wide-guard-runner.ts:48-52 |
| `RD02-266` | repo-wide guard読込器は、先頭markerで宣言されたtest集合とregistryが一致せず、登録漏れまたはstale entryがある場合に失敗する。 | process_gate | gate | src/runtime/repo-wide-guard-runner.ts:19-26; src/runtime/repo-wide-guard-runner.ts:53-67 |
| `RD03-092` | summary surface監査は、契約カタログにあるsurfaceが入力に欠ける場合、catalog driftと判定する。 | process_gate | gate | src/runtime/summary-surface-audit.ts:599-602; src/runtime/summary-surface-audit.ts:623-638 |
| `RD03-093` | summary surface監査は、契約カタログにないsurfaceが入力に含まれる場合、catalog driftと判定する。 | process_gate | gate | src/runtime/summary-surface-audit.ts:603-605; src/runtime/summary-surface-audit.ts:623-638 |
| `RD03-094` | summary surface監査は、登録surfaceのsource_commandが欠けるかカタログと一致しない場合、catalog driftと判定する。 | evidence_claim | gate | src/runtime/summary-surface-audit.ts:583-611; src/runtime/summary-surface-audit.ts:623-638 |
| `RD03-223` | FE設計の実質評価は、out-of-scopeまたはdeferの明示がなく本文のtrim後文字数が閾値未満の場合、hollowと判定する。 | process_gate | gate | src/runtime/upstream-adoption.ts:255-263 |
| `RD04-127` | isolation実行器は、起動後のscope監査が失敗した場合に成功を返さない。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:783-791 |
| `RD04-224` | asset drift lintは、登録rootが一つも無い場合に違反一覧を空にして成功を返す。 | tooling_runtime | lint | src/lint/asset-drift.ts:163-169 |
| `RD05-191` | db-projection-ingestionは、自動投影必須tableの行数が未指定または0以下の場合、失敗させる。 | process_gate | lint | src/lint/db-projection-ingestion.ts:14-120; src/lint/db-projection-ingestion.ts:138-153 |
| `RD05-193` | ddd-tdd-rulesは、DDD/TDD policy文書がない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:305-315 |
| `RD05-194` | ddd-tdd-rulesは、policyに所定の必須rule IDが欠ける場合、IDごとの違反を返す。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:80-90; src/lint/ddd-tdd-rules.ts:316-327 |
| `RD05-196` | ddd-tdd-rulesは、所定のpolicy・Forward・Add-feature工程文書が存在しない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:92-139; src/lint/ddd-tdd-rules.ts:340-353 |
| `RD05-207` | ddd-tdd-rulesは、ForwardまたはAdd-feature工程文書にengineering_discipline_requiredがない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:114-116; src/lint/ddd-tdd-rules.ts:133-135; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-231` | ddd-tdd-rulesは、policyのbaselineにpath・行番号・ruleが一致する違反をactive違反から除外し、baseline debtとして数える。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:762-775; src/lint/ddd-tdd-rules.ts:869-875 |
| `RD05-234` | dependency-driftは、登録された既存の二つのmodule循環についてはerrorにせずwarn findingとして返す。 | behavior_discipline | lint | src/lint/dependency-drift.ts:85-88; src/lint/dependency-drift.ts:264-273 |
| `RD06-007` | lintは、baseline entryがコードに固定された初期集合に含まれない場合、baseline_expandedとして失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:278-286 |
| `RD06-067` | design-reality-binding lintは、空failure bindingのbaselineにコード固定の初期集合外のパスがある場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:970-976 |
| `RD06-070` | design-reality-binding lintは、failure codeと到達性証跡がともに空で、その文書がbaseline登録済みの場合、既知負債としてadvisoryを出す。 | evidence_claim | lint | src/lint/design-reality-binding.ts:1026-1037 |
| `RD06-114` | drive-db-registration lintは、PLAN登録件数が0以下の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:85-85 |
| `RD06-117` | drive-db-registration lintは、drive run件数が0以下の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:98-98 |
| `RD06-118` | drive-db-registration lintは、drive runを持たないPLANが一件でもある場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:99-101 |
| `RD06-119` | drive-db-registration lintは、workflow run件数が0以下の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:102-102 |
| `RD06-121` | drive-db-registration lintは、model run件数が0以下の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:106-106 |
| `RD06-123` | drive-db-registration lintは、skill推薦件数が0以下の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:110-112 |
| `RD06-125` | drive-db-registration lintは、skill呼び出し件数が0以下の場合、失敗させる。 | process_gate | lint | src/lint/drive-db-registration.ts:119-119 |
| `RD06-173` | forward-convergenceの監査lintは、既知負債allowlistにあるPLANが監査文書の抽出集合にない場合、不一致として失敗させる。 | evidence_claim | lint | src/lint/forward-convergence.ts:315-325; src/lint/forward-convergence.ts:333-344 |
| `RD06-174` | forward-convergenceの監査lintは、監査文書から抽出したPLANが既知負債allowlistにない場合、不一致として失敗させる。 | evidence_claim | lint | src/lint/forward-convergence.ts:315-325 |
| `RD07-011` | g10-ux-workflowは、gates.mdに所定のG10定義マーカーが一つでも欠ければ失敗する。 | process_gate | lint | src/lint/g10-ux-workflow.ts:50-56; src/lint/g10-ux-workflow.ts:112-114 |
| `RD07-045` | g8-integration-workflowは、exit_criteria.doctor_checkがg8-integration-workflowでなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:324-328 |
| `RD07-046` | g8-integration-workflowは、L8テスト設計に所定のworkflowマーカーが一つでも欠ければ失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:64-74; src/lint/g8-integration-workflow.ts:347-351 |
| `RD07-047` | g8-integration-workflowは、gates.mdに所定のG8定義マーカーが一つでも欠ければ失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:76-81; src/lint/g8-integration-workflow.ts:352-356 |
| `RD07-048` | g8-integration-workflowは、L8テスト設計から抽出した一意なITケースが10件未満なら失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:337-338; src/lint/g8-integration-workflow.ts:357-361 |
| `RD07-052` | g9-system-workflowは、L9テスト設計とsystem-evidence-boundaryを連結した本文に所定のworkflowマーカーが欠ければ失敗する。 | process_gate | lint | src/lint/g9-system-workflow.ts:38-48; src/lint/g9-system-workflow.ts:101-117 |
| `RD07-053` | g9-system-workflowは、gates.mdに所定のG9定義マーカーが一つでも欠ければ失敗する。 | process_gate | lint | src/lint/g9-system-workflow.ts:50-55; src/lint/g9-system-workflow.ts:118-120 |
| `RD07-054` | g9-system-workflowは、L9テスト設計から抽出した一意なSTケースが10件未満なら失敗する。 | process_gate | lint | src/lint/g9-system-workflow.ts:105-106; src/lint/g9-system-workflow.ts:121-125 |
| `RD07-092` | 共通gate証拠検査は、exit_criteria.doctor_checkが設定された検査名と一致しなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:340-344 |
| `RD07-154` | identifier-renameの検証matrix検査は、各行に対するverificationSourceMetadataViolationsの返した違反をそのまま検査結果に加える。 | evidence_claim | lint | src/lint/identifier-rename.ts:2221-2227 |
| `RD07-184` | improvement-backlog解析は、エントリIDがIMP-に3桁の数字を続ける形式でなければmalformedIdsへ記録する。 | process_gate | lint | src/lint/improvement-backlog.ts:23-23; src/lint/improvement-backlog.ts:140-141 |
| `RD07-185` | improvement-backlog解析は、エントリIDが既出ならduplicateIdsへ記録する。 | process_gate | lint | src/lint/improvement-backlog.ts:140-143 |
| `RD08-002` | inventory lifecycle lintは、登録済みartifact familyの構成pathがinventoryの第5〜7節のauthority review一覧に残る場合、失敗させる。 | process_gate | lint | src/lint/l12-hybrid-inventory-lifecycle.ts:49-71 |
| `RD08-009` | L14 close audit lintは、P0-forward-convergenceからP9-db-convergenceまでの指定監査項目が欠ける場合、失敗させる。 | process_gate | lint | src/lint/l14-close-audit.ts:31-42; src/lint/l14-close-audit.ts:192-198 |
| `RD08-012` | L14 close audit lintは、指定監査項目のboundaryセルに項目別必須markerがない場合、失敗させる。 | process_gate | lint | src/lint/l14-close-audit.ts:83-97; src/lint/l14-close-audit.ts:206-210 |
| `RD08-133` | legacy orchestration lintは、.helix/evidence/配下の.vitest.logを除外する際、JSON解析成功、success=true、失敗test・suite数0、非空testResultsの全件passedを要求する。条件を満たさないログにはこの除外を適用しない。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:110-135; src/lint/legacy-orchestration-surface.ts:189-193 |
| `RD08-149` | lint-wiringは、src/lint直下のmoduleがsrc/cli.tsからimport graphで到達不能で、DEFERRED_LINTSにも登録されていない場合、失敗させる。testやコメント化したimportは到達根拠にしない。 | tooling_runtime | lint／gate | src/lint/lint-wiring.ts:10-17; src/lint/lint-wiring.ts:101-117; src/lint/lint-wiring.ts:191-219 |
| `RD08-150` | lint-wiringは、DEFERRED_LINTS登録moduleが実際にはruntimeから到達可能な場合、stale申告として失敗させる。 | tooling_runtime | lint／gate | src/lint/lint-wiring.ts:200-219 |
| `RD08-151` | lint-wiringは、reachableExportsが渡された場合、指定必須関数にruntime到達source内の直接identifier callがなければ失敗させる。文字列・property access・re-exportだけでは配線済みと認めない。 | tooling_runtime | lint／gate | src/lint/lint-wiring.ts:63-70; src/lint/lint-wiring.ts:120-136; src/lint/lint-wiring.ts:174-198; src/lint/lint-wiring.ts:219-219 |
| `RD09-080` | plan-specific-vpair-bindingは、未解消の初期免除fingerprintに対応する現在の違反がない場合、unused exemptionとしてauthorityを違反にする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:987-995 |
| `RD09-081` | plan-specific-vpair-bindingは、解消済みfingerprintと同じ違反が再発した場合、resolved_finding_reappearedを追加し、当該違反を免除しない。 | process_gate | lint | src/lint/plan-specific-vpair-binding.ts:997-1010 |
| `RD09-086` | PR scope preflightは、pull_requestとして呼び出したanalyzePrContextが不合格なら、同じfindingsとok=falseを返す。 | review_merge | lint | src/lint/pr-scope-preflight.ts:164-173; src/lint/pr-scope-preflight.ts:189-197 |
| `RD09-092` | proposal-document-coverageは、routing文書が存在しない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage.ts:98-104; src/lint/proposal-document-coverage.ts:235-239; src/lint/proposal-document-coverage-policy.ts:3-4 |
| `RD09-093` | proposal-document-coverageは、各シナリオのexpectedPatternsのいずれかを分類器が返さない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage.ts:106-117; src/lint/proposal-document-coverage-policy.ts:6-45 |
| `RD09-131` | proposal-document-coverageは、分類された各patternがrouting文書にbacktick付きで記載されていない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage.ts:196-205 |
| `RD10-040` | lintはgates.mdに右腕gateが概念定義止まり・機械化PLAN未起票という禁止済み文言が残る場合に失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:28-31; src/lint/right-arm-verification-strategy.ts:261-263 |
| `RD10-041` | lintはgates.mdに規定のgate・evidence・公式source・意味レビュー・実装状態markerが欠ける場合に失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:33-68; src/lint/right-arm-verification-strategy.ts:264-264 |
| `RD10-042` | lintは右腕検証文書に規定のevidence profile・source ledger・検証証跡markerが欠ける場合に失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:70-118; src/lint/right-arm-verification-strategy.ts:265-267 |
| `RD10-044` | lintは右腕evidence profileにG8〜G12の必須gate行が欠ける場合に失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:120-120; src/lint/right-arm-verification-strategy.ts:271-273 |
| `RD10-065` | lintは対象文書にRule Automation Closure必須節がないか内容が空の場合に失敗させる。 | process_gate | lint | src/lint/rule-automation-closure.ts:38-38; src/lint/rule-automation-closure.ts:85-90 |
| `RD10-066` | lintはRule Automation Closure表にheaderと少なくとも1データ行がなければ失敗させる。 | process_gate | lint | src/lint/rule-automation-closure.ts:92-96 |
| `RD10-067` | lintはRule Automation Closure表にrule、automation owner、current statusの必須列が欠ける場合に失敗させる。 | process_gate | lint | src/lint/rule-automation-closure.ts:98-107 |
| `RD10-068` | lintはRule Automation Closure行のrule、owner、statusが空か、バッククォート除去後のownerが空の場合に失敗させる。 | process_gate | lint | src/lint/rule-automation-closure.ts:109-120 |
| `RD10-069` | lintはRule Automation Closure行のownerに規定の機械化主体tokenが含まれなければ失敗させる。 | process_gate | lint | src/lint/rule-automation-closure.ts:47-48; src/lint/rule-automation-closure.ts:121-124 |
| `RD10-070` | lintはRule Automation Closureのstatusがclosed、scheduled、gap、parked、PO decision以外なら失敗させる。 | process_gate | lint | src/lint/rule-automation-closure.ts:40-46; src/lint/rule-automation-closure.ts:125-128 |
| `RD10-071` | lintのメッセージ生成は検査文書が0件ならclosure table不在をviolationとして表示する。 | process_gate | lint | src/lint/rule-automation-closure.ts:134-140; src/lint/rule-automation-closure.ts:157-160 |
| `RD10-072` | lintのメッセージ生成はRule Automation Closureにclosed以外の行がある場合、状態別件数と例を表示する。 | process_gate | lint | src/lint/rule-automation-closure.ts:170-184 |
| `RD10-100` | S4 lintはDiscovery／Scrum文書に規定の判断record、packet、証跡、source、意味レビューmarkerが欠ける場合に失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:132-167; src/lint/s4-decision-readiness.ts:779-787 |
| `RD10-193` | telemetry closure lintは対象文書にTelemetry Closure Matrix節がないか内容が空の場合に失敗させる。 | process_gate | lint | src/lint/telemetry-closure.ts:43-44; src/lint/telemetry-closure.ts:99-104 |
| `RD10-203` | telemetry closureのメッセージ生成は検査文書が0件ならmatrix不在をviolationとして表示する。 | process_gate | lint | src/lint/telemetry-closure.ts:180-181; src/lint/telemetry-closure.ts:200-203 |
| `RD11-060` | 右腕coverage lintは、G8〜G12の各gateに対応するprofile metadataが1件もない場合に違反にする。 | process_gate | lint | src/lint/verification-profile.ts:426-433 |
| `RD11-061` | 右腕coverage lintは、agent・fe・fullstackの各driveにG10 browser profileが割り当てられていない場合に違反にする。 | process_gate | lint | src/lint/verification-profile.ts:350-357; src/lint/verification-profile.ts:418-440 |
| `RD11-065` | profile lintは、推奨gateがsource ledger bindingのgateImpactsで被覆されない場合に違反にする。 | evidence_claim | lint | src/lint/verification-profile.ts:489-503 |
| `RD11-067` | profile gateは、推薦があるのに既定有効profileが1件もない場合に違反にする。 | process_gate | lint／gate | src/lint/verification-profile.ts:654-659 |
| `RD11-072` | version-up lintは、pillar requirementsにPILLAR_REQUIREMENT_MARKERSの各文字列がない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:393-403; src/lint/version-up-readiness.ts:963-967 |
| `RD11-074` | version-up lintは、mode文書にMODE_DOC_MARKERSの各文字列がない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:327-389; src/lint/version-up-readiness.ts:975-979 |
| `RD11-112` | activation phase検査は、command matrixの行数が指定された11phase分と一致しない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:48-60; src/lint/version-up-readiness.ts:1905-1913 |
| `RD11-113` | activation phase検査は、指定された各phaseの出現回数が1回でない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:1914-1922 |
| `RE01-006` | lintはPLANのfrontmatter契約違反を検出した場合に失敗し、CIとpre-pushで進行を止める。 | process_gate | lint／ci／hook | docs/governance/helix-harness-requirements_v1.2.md:65-65 |
| `RE01-012` | 検証器はPLANのkindとphaseの不正な組合せを拒否する。 | process_gate | lint | docs/governance/helix-harness-requirements_v1.2.md:241-241 |
| `RE01-014` | lintは成果物の種別と配置パスが契約に一致しない場合に失敗する。 | process_gate | lint | docs/governance/helix-harness-requirements_v1.2.md:311-311 |
| `RE01-016` | PLAN lintは規定のPLAN globを対象とし、archive・archived・templateを通常PLANの検証対象に含めない。 | tooling_runtime | lint | docs/governance/helix-harness-requirements_v1.2.md:364-366 |
| `RE01-018` | lintはkindに許された層範囲を検査し、明示されたhub例外以外の逸脱を拒否する。 | process_gate | lint | docs/governance/helix-harness-requirements_v1.2.md:397-400 |
| `RE01-025` | doctorはschemaと対応表のdriftを失敗として扱い、黙って補正して成功にしてはならない。 | evidence_claim | doctor | docs/governance/helix-harness-requirements_v1.2.md:467-467 |
| `RE01-033` | 文書検証器は必須見出しの欠落を失敗にし、見出し順や表記の軽微な違いは警告として扱う。 | process_gate | lint | docs/governance/helix-harness-requirements_v1.2.md:529-559 |
| `RE01-128` | validatorはcleanを0、warningを2、P0を1として返し、CIは0と2を通過扱いにする。 | tooling_runtime | ci／lint | docs/governance/helix-harness-requirements_v1.2.md:1820-1824 |
| `RE01-129` | 参照検証器はパスを正規化してIDと実体を照合し、単純な文字列grepだけで参照成立を判定してはならない。 | tooling_runtime | lint | docs/governance/helix-harness-requirements_v1.2.md:1849-1849 |
| `RE01-150` | judgment gateの担当者は全checklistをpass/failまたは理由付きN/Aで判定し、一つでもfailまたは理由のないN/Aがあれば停止する。standaloneを自動passにしてはならない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:2124-2186 |
| `RG09-003` | Admission Engineの設計者は、Admission判断をLLMの自由裁量だけに委ねる構成にしてはならない。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:323-328 |
| `RG09-013` | DDD/TDD規約の検査処理は、rule driftまたはworkflow anchor driftを検出した場合、決定論的なviolationを返す。 | process_gate | lint／doctor／ci | docs/governance/ddd-tdd-rules.md:155-159 |
| `RG10-007` | startup是正担当者はrule-driftの旧marker文字列の存在確認を、obligation ID・source digest・effective value・applicabilityの比較へ置換する。 | tooling_runtime | config | docs/governance/effective-agent-startup-followup-registry.json:85-85 |
| `RG10-011` | cross-check engineの実装担当者はL7で既存5 lintをルール型インスタンスへリファクタ吸収し、gate-checks.yamlとhelix gate・doctorへの配線を行う。 | tooling_runtime | prose | docs/governance/gate-design.md:165-165; docs/governance/gate-design.md:181-182 |
| `RG14-002` | 運用ルール是正担当者は、merge・review・finding disposition規律の乖離を検出するため、4つの共有markerを既存rule-driftへ統合する。 | tooling_runtime | prose | docs/governance/operations-rule-audit-2026-07-26.md:38-38 |
| `RG17-008` | governance lintは、PLANのdependenciesから参照されるADRが欠落している場合、またはtitleが誤っている場合、失敗させる。 | process_gate | lint | docs/skills/documentation-and-adrs.md:75-77 |

## 副として対応づいた規則（806件）

`RA-004`、`RA-078`、`RA-132`、`RA-178`、`RA-184`、`RA-210`、`RA-215`、`RA-219`、`RA-233`、`RB0-035`、`RB0-042`、`RB0-083`、`RB0-180`、`RB04-065`、`RB04-083`、`RB04-106`、`RB04-120`、`RB04-131`、`RB04-133`、`RB04-134`、`RB04-135`、`RB04-138`、`RB04-147`、`RB04-152`、`RB04-249`、`RB05-005`、`RB05-006`、`RB05-034`、`RB05-042`、`RB05-049`、`RB05-053`、`RB05-094`、`RB05-123`、`RB05-179`、`RB05-182`、`RB05-184`、`RB05-187`、`RB05-195`、`RB05-202`、`RB05-203`、`RB05-215`、`RB05-216`、`RB05-217`、`RB05-222`、`RB05-223`、`RB05-241`、`RB05-243`、`RB05-247`、`RB05-265`、`RB05-279`、`RB05-289`、`RB05-343`、`RB06-001`、`RB06-048`、`RB06-055`、`RB06-061`、`RB06-146`、`RB06-149`、`RB06-156`、`RB06-166`、`RB06-178`、`RB06-190`、`RB06-196`、`RB06-198`、`RB06-215`、`RB06-264`、`RB06-269`、`RB07-004`、`RB07-021`、`RB07-106`、`RB07-133`、`RB07-165`、`RB07-168`、`RB07-226`、`RB07-246`、`RB07-279`、`RB07-281`、`RB07-310`、`RB07-322`、`RB08-093`、`RB08-139`、`RB08-144`、`RB08-146`、`RB08-180`、`RB08-267`、`RB08-283`、`RB08-288`、`RB08-334`、`RB09-014`、`RB09-072`、`RB09-073`、`RB09-074`、`RB09-084`、`RC0-071`、`RC0-081`、`RC0-082`、`RC0-083`、`RC0-085`、`RC0-086`、`RC0-097`、`RC0-098`、`RC0-099`、`RC0-100`、`RC0-102`、`RC0-103`、`RC0-106`、`RC0-107`、`RC0-108`、`RC00-001`、`RC00-002`、`RC00-007`、`RC00-008`、`RC00-009`、`RC00-012`、`RC00-086`、`RC00-087`、`RC00-122`、`RC00-137`、`RC00-259`、`RC00-261`、`RC01-014`、`RC01-020`、`RC01-021`、`RC01-022`、`RC01-029`、`RC01-031`、`RC01-036`、`RC01-040`、`RC01-044`、`RC01-069`、`RC01-089`、`RC01-090`、`RC01-094`、`RC01-095`、`RC01-096`、`RC01-097`、`RC01-103`、`RC01-125`、`RC01-144`、`RC01-149`、`RC01-151`、`RC01-152`、`RC01-153`、`RC02-003`、`RC02-004`、`RC02-005`、`RC02-027`、`RC02-031`、`RC02-032`、`RC02-033`、`RC02-034`、`RC02-035`、`RC02-036`、`RC02-037`、`RC02-038`、`RC02-039`、`RC02-040`、`RC02-041`、`RC02-042`、`RC02-043`、`RC02-045`、`RC02-047`、`RC02-052`、`RC02-053`、`RC02-054`、`RC02-055`、`RC02-056`、`RC02-057`、`RC02-058`、`RC02-059`、`RC02-060`、`RC02-061`、`RC02-063`、`RC02-065`、`RC02-066`、`RC02-067`、`RC02-068`、`RC02-069`、`RC02-071`、`RC02-072`、`RC02-075`、`RC02-077`、`RC02-078`、`RC02-079`、`RC02-080`、`RC02-081`、`RC02-082`、`RC02-083`、`RC02-084`、`RC02-085`、`RC02-086`、`RC02-087`、`RC02-088`、`RC02-091`、`RC02-092`、`RC02-093`、`RC02-095`、`RC02-096`、`RC02-097`、`RC02-098`、`RC02-099`、`RC02-100`、`RC02-102`、`RC02-103`、`RC02-104`、`RC02-105`、`RC02-107`、`RC02-108`、`RC02-109`、`RC02-111`、`RC02-112`、`RC02-114`、`RC02-115`、`RC02-116`、`RC02-117`、`RC02-118`、`RC02-119`、`RC02-120`、`RC02-121`、`RC02-122`、`RC02-123`、`RC02-124`、`RC02-125`、`RC02-126`、`RC02-127`、`RC02-129`、`RC02-130`、`RC02-131`、`RC02-132`、`RC02-133`、`RC02-134`、`RC02-135`、`RC02-136`、`RC02-138`、`RC02-139`、`RC02-140`、`RC02-141`、`RC02-142`、`RC02-143`、`RC02-144`、`RC02-145`、`RC02-146`、`RC02-147`、`RC02-148`、`RC02-149`、`RC02-150`、`RC02-151`、`RC02-152`、`RC02-154`、`RC02-155`、`RC02-156`、`RC02-157`、`RC02-158`、`RC02-159`、`RC02-161`、`RC02-162`、`RC02-165`、`RC02-166`、`RC02-167`、`RC02-168`、`RC02-169`、`RC02-170`、`RC02-171`、`RC02-172`、`RC02-173`、`RC02-174`、`RC02-175`、`RC02-176`、`RC02-177`、`RC02-178`、`RC02-180`、`RC02-181`、`RC02-182`、`RC02-183`、`RC02-185`、`RC02-187`、`RC02-188`、`RC03-042`、`RC03-137`、`RC03-138`、`RC03-139`、`RC03-140`、`RC03-141`、`RC03-142`、`RC03-143`、`RC03-144`、`RC03-146`、`RC03-147`、`RC03-148`、`RC03-149`、`RC03-150`、`RC03-151`、`RC04-031`、`RC04-142`、`RC04-166`、`RC04-180`、`RC04-181`、`RD01-018`、`RD01-019`、`RD01-254`、`RD01-256`、`RD01-257`、`RD01-258`、`RD01-261`、`RD01-326`、`RD01-329`、`RD01-330`、`RD01-333`、`RD02-146`、`RD02-189`、`RD02-195`、`RD02-197`、`RD02-209`、`RD02-262`、`RD02-263`、`RD02-327`、`RD02-328`、`RD03-197`、`RD03-198`、`RD03-229`、`RD03-230`、`RD04-141`、`RD04-142`、`RD04-143`、`RD04-144`、`RD04-145`、`RD04-146`、`RD04-147`、`RD04-170`、`RD04-171`、`RD04-172`、`RD04-173`、`RD04-174`、`RD04-175`、`RD04-176`、`RD04-177`、`RD04-178`、`RD04-179`、`RD04-180`、`RD04-181`、`RD04-182`、`RD04-184`、`RD04-185`、`RD04-186`、`RD04-187`、`RD04-188`、`RD04-189`、`RD04-190`、`RD04-192`、`RD04-193`、`RD04-194`、`RD04-195`、`RD04-197`、`RD04-198`、`RD04-199`、`RD04-200`、`RD04-201`、`RD04-202`、`RD04-203`、`RD04-204`、`RD04-210`、`RD04-211`、`RD04-212`、`RD04-213`、`RD04-214`、`RD04-215`、`RD04-216`、`RD04-217`、`RD04-220`、`RD04-221`、`RD04-222`、`RD04-223`、`RD04-225`、`RD04-226`、`RD04-227`、`RD04-228`、`RD04-229`、`RD04-230`、`RD04-231`、`RD04-232`、`RD05-005`、`RD05-006`、`RD05-007`、`RD05-008`、`RD05-009`、`RD05-010`、`RD05-011`、`RD05-024`、`RD05-026`、`RD05-027`、`RD05-028`、`RD05-029`、`RD05-030`、`RD05-031`、`RD05-032`、`RD05-033`、`RD05-151`、`RD05-153`、`RD05-154`、`RD05-158`、`RD05-159`、`RD05-174`、`RD05-175`、`RD05-181`、`RD05-183`、`RD05-184`、`RD05-185`、`RD05-186`、`RD05-187`、`RD05-188`、`RD05-195`、`RD05-197`、`RD05-198`、`RD05-199`、`RD05-202`、`RD05-203`、`RD05-205`、`RD05-206`、`RD05-210`、`RD05-214`、`RD05-216`、`RD05-218`、`RD05-219`、`RD05-225`、`RD05-226`、`RD05-233`、`RD06-013`、`RD06-031`、`RD06-048`、`RD06-063`、`RD06-065`、`RD06-068`、`RD06-071`、`RD06-072`、`RD06-075`、`RD06-083`、`RD06-088`、`RD06-113`、`RD06-115`、`RD06-116`、`RD06-120`、`RD06-122`、`RD06-124`、`RD06-126`、`RD06-127`、`RD06-128`、`RD06-136`、`RD06-137`、`RD06-176`、`RD06-177`、`RD06-180`、`RD06-181`、`RD06-182`、`RD06-198`、`RD06-205`、`RD06-207`、`RD07-001`、`RD07-002`、`RD07-005`、`RD07-010`、`RD07-012`、`RD07-014`、`RD07-015`、`RD07-018`、`RD07-019`、`RD07-020`、`RD07-021`、`RD07-022`、`RD07-023`、`RD07-026`、`RD07-027`、`RD07-030`、`RD07-033`、`RD07-034`、`RD07-035`、`RD07-037`、`RD07-039`、`RD07-040`、`RD07-041`、`RD07-042`、`RD07-043`、`RD07-044`、`RD07-049`、`RD07-050`、`RD07-051`、`RD07-055`、`RD07-056`、`RD07-057`、`RD07-058`、`RD07-061`、`RD07-063`、`RD07-066`、`RD07-067`、`RD07-068`、`RD07-071`、`RD07-072`、`RD07-075`、`RD07-077`、`RD07-079`、`RD07-080`、`RD07-081`、`RD07-083`、`RD07-085`、`RD07-086`、`RD07-087`、`RD07-088`、`RD07-089`、`RD07-090`、`RD07-091`、`RD07-113`、`RD07-114`、`RD07-119`、`RD07-120`、`RD07-121`、`RD07-122`、`RD07-123`、`RD07-124`、`RD07-125`、`RD07-126`、`RD07-127`、`RD07-131`、`RD07-132`、`RD07-135`、`RD07-139`、`RD07-153`、`RD07-186`、`RD07-187`、`RD07-188`、`RD07-193`、`RD07-196`、`RD08-001`、`RD08-003`、`RD08-006`、`RD08-007`、`RD08-010`、`RD08-015`、`RD08-016`、`RD08-017`、`RD08-021`、`RD08-022`、`RD08-023`、`RD08-026`、`RD08-028`、`RD08-030`、`RD08-032`、`RD08-033`、`RD08-036`、`RD08-037`、`RD08-048`、`RD08-051`、`RD08-065`、`RD08-075`、`RD08-076`、`RD08-077`、`RD08-078`、`RD08-079`、`RD08-100`、`RD08-101`、`RD08-105`、`RD08-127`、`RD08-128`、`RD08-131`、`RD08-132`、`RD08-141`、`RD08-142`、`RD08-143`、`RD08-188`、`RD09-094`、`RD09-098`、`RD09-111`、`RD09-117`、`RD09-127`、`RD09-130`、`RD09-133`、`RD10-052`、`RD10-053`、`RD10-075`、`RD10-088`、`RD10-089`、`RD10-090`、`RD10-091`、`RD10-092`、`RD10-093`、`RD10-094`、`RD10-095`、`RD10-096`、`RD10-097`、`RD10-098`、`RD10-099`、`RD10-101`、`RD10-103`、`RD10-104`、`RD10-105`、`RD10-106`、`RD10-109`、`RD10-110`、`RD10-111`、`RD10-112`、`RD10-113`、`RD10-114`、`RD10-115`、`RD10-117`、`RD10-118`、`RD10-119`、`RD10-120`、`RD10-121`、`RD10-122`、`RD10-123`、`RD10-124`、`RD10-125`、`RD10-126`、`RD10-127`、`RD10-128`、`RD10-129`、`RD10-130`、`RD10-131`、`RD10-132`、`RD10-133`、`RD10-134`、`RD10-135`、`RD10-137`、`RD10-138`、`RD10-139`、`RD10-140`、`RD10-142`、`RD10-143`、`RD10-144`、`RD10-145`、`RD10-146`、`RD10-147`、`RD10-148`、`RD10-149`、`RD10-150`、`RD10-151`、`RD10-152`、`RD10-153`、`RD10-154`、`RD10-155`、`RD10-156`、`RD10-158`、`RD10-159`、`RD10-160`、`RD10-161`、`RD10-162`、`RD10-163`、`RD10-164`、`RD10-165`、`RD10-166`、`RD10-167`、`RD10-168`、`RD10-169`、`RD10-170`、`RD10-171`、`RD10-172`、`RD10-173`、`RD10-174`、`RD10-175`、`RD10-176`、`RD10-177`、`RD10-178`、`RD10-179`、`RD10-180`、`RD10-181`、`RD10-182`、`RD10-183`、`RD10-184`、`RD10-187`、`RD10-190`、`RD10-194`、`RD10-195`、`RD10-196`、`RD10-197`、`RD10-198`、`RD10-199`、`RD10-200`、`RD10-201`、`RD10-202`、`RD10-204`、`RD11-007`、`RD11-008`、`RD11-012`、`RD11-014`、`RD11-015`、`RD11-020`、`RD11-021`、`RD11-022`、`RD11-023`、`RD11-024`、`RD11-025`、`RD11-026`、`RD11-027`、`RD11-030`、`RD11-031`、`RD11-042`、`RD11-059`、`RD11-062`、`RD11-063`、`RD11-064`、`RD11-066`、`RD11-068`、`RD11-069`、`RD11-071`、`RD11-073`、`RD11-075`、`RD11-076`、`RD11-077`、`RD11-078`、`RD11-079`、`RD11-080`、`RD11-082`、`RD11-084`、`RD11-085`、`RD11-086`、`RD11-087`、`RD11-088`、`RD11-089`、`RD11-090`、`RD11-091`、`RD11-092`、`RD11-093`、`RD11-094`、`RD11-095`、`RD11-096`、`RD11-097`、`RD11-098`、`RD11-103`、`RD11-104`、`RD11-105`、`RD11-106`、`RD11-107`、`RD11-108`、`RD11-109`、`RD11-110`、`RD11-111`、`RD11-114`、`RD11-115`、`RD11-117`、`RD11-125`、`RD11-126`、`RD11-127`、`RD11-128`、`RD11-129`、`RD11-130`、`RD11-131`、`RD11-132`、`RD11-133`、`RD11-134`、`RD11-135`、`RD11-136`、`RD11-155`、`RD11-156`、`RD11-157`、`RD11-158`、`RD11-159`、`RD11-160`、`RD11-161`、`RD11-162`、`RD11-163`、`RD11-164`、`RD11-165`、`RD11-166`、`RD11-167`、`RD11-168`、`RD11-169`、`RD11-170`、`RD11-171`、`RD11-172`、`RD11-173`、`RD11-174`、`RD11-175`、`RD11-176`、`RD11-177`、`RD11-178`、`RD11-179`、`RD11-180`、`RD11-181`、`RD11-182`、`RD11-183`、`RD11-184`、`RD11-185`、`RD11-186`、`RD11-187`、`RD11-188`、`RD11-189`、`RD11-190`、`RD11-191`、`RD11-192`、`RD11-193`、`RD11-194`、`RD11-195`、`RD11-196`、`RD11-197`、`RD11-200`、`RE01-019`、`RE01-037`、`RE01-044`、`RE01-051`、`RE01-063`、`RE01-084`、`RE01-125`、`RE01-192`、`RE01-274`、`RG09-006`、`RG13-008`、`RG19-003`、`RG19-011`
