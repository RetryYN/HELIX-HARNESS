---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-FRM-02
group: 枠
product: HARNESS
atoms_primary: 228
atoms_secondary: 260
issue_projection: #1858
---

# RUL-FRM-02（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

工程の開始・凍結・差戻し・再開・完了の条件と、人間が承認する層とAIが進める層の分担を定める。

## 主として対応づいた規則（228件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-015` | Codexはactive continuationがない場合、通常開始して指定の初期化完了文を宣言する。 | memory_context | prose | AGENTS.md:138-139 |
| `RA-111` | 人間はL0/L1/L2とL3承認を担い、AIはL3起草とL4以降を担い、不可逆操作ではescalateする。 | escalation_authority | prose | AGENTS.md:124-124; CLAUDE.md:82-85 |
| `RA-178` | /ship実行者は最初にreview packet・execution mode・gate stateを確認し、GO前にdoctorの構造governanceをgreenにする。 | review_merge | prose／doctor | .claude/commands/ship.md:12-16 |
| `RA-183` | /ship実行者はaccept前に判断とspecialist証跡をauditへ記録する。 | review_merge | prose | .claude/commands/ship.md:63-63 |
| `RA-190` | エージェントは旧HELIX機能をharness工程・gate・state規則へ従属させ、個別機能を理由に仕組みを曲げない。 | process_gate | prose | AGENTS.md:112-114; CLAUDE.md:59-63 |
| `RA-208` | confirmation gate依頼前にはreview evidenceを記録する。 | process_gate | prose／gate | .claude/CLAUDE.md:62-62; CLAUDE.md:189-189 |
| `RA-215` | PLAN編集者はplan lint・targeted test・doctorを使い、計画commandではlint成立とdoctor exit 0を確認する。 | process_gate | prose／lint／doctor | .claude/CLAUDE.md:77-77; .claude/commands/sdd-plan.md:26-26 |
| `RA-219` | /spec実行者はpair-freeze前にObjectiveの存在・半角kanaとU+FFFD不在・plan lint・doctor exit 0を確認する。 | process_gate | prose／lint／doctor | .claude/commands/spec.md:19-20 |
| `RA-223` | /build実行者は実装後にtypecheck・lint・test・doctor・review・audit記録を済ませ、trace-freeze→review→acceptへ進む。 | process_gate | prose／lint／doctor／gate | .claude/commands/build.md:24-32 |
| `RA-226` | /test実行者はtrace-freeze前にtypecheck・lint・test・doctorをすべてgreenにし、その後review証跡を残す。 | process_gate | prose／lint／doctor | .claude/commands/test.md:25-26 |
| `RA-230` | refactor実行者は各step後にtypecheck・lint・testのgreenとdoctor exit 0を確認する。 | process_gate | prose／lint／doctor | .claude/commands/code-simplify.md:19-20 |
| `RA-232` | refactor実行者は影響する設計文書を更新し、accept前にreview証跡を残す。 | process_gate | prose | .claude/commands/code-simplify.md:24-25 |
| `RA-245` | L1/L2 gap検査ではAIが不足を提示し、人間が各観点の判断を行う。 | process_gate | config | .helix/config/requirements-binding.yaml:31-62 |
| `RB0-016` | Forward L6担当者はG6/G7 handoff前にcoding-ruleの適用性を確認し、必要な設計差分を反映する。 | process_gate | prose | docs/governance/coding-rules.md:14-14 |
| `RB0-017` | add-impl担当者はcoding-ruleへの影響がないか、正本と対応テストへ反映済みの場合だけ実装を開始する。 | process_gate | prose | docs/governance/coding-rules.md:15-15 |
| `RB0-018` | 実装言語・lint・命名・型・例外処理・生成コード境界を変更した者は、implementation freeze前にcoding-rule正本を更新する。 | process_gate | prose | docs/governance/coding-rules.md:16-16 |
| `RB0-061` | G3担当者はFR/NFR/ACとoracleに加え、no-code採否・責務owner・許容複雑度予算をfreezeする。 | process_gate | prose | docs/governance/ddd-tdd-rules.md:144-145 |
| `RB0-168` | 判定者は未反駁のFLAGや未達ACを残したままDoneまたはgate clearedと扱ってはならない。 | evidence_claim | prose | docs/skills/acceptance-criteria-thinking.md:101-102; docs/skills/adversarial-review.md:141-141 |
| `RB0-173` | 委譲結果が既存PLAN依存またはADR判断を変える場合、委譲者はfull review gateへescalateする。 | escalation_authority | prose | docs/skills/agent-cost-design.md:64-64 |
| `RB0-179` | closure gate authorityを確定できない場合、担当者はauthorityを推測せず候補をneeds_gate_authorityとしてForwardへ戻す。 | process_gate | prose／config | docs/governance/closure-gate-allowlist.yaml:1-4 |
| `RB04-007` | 人間はL0企画・L1業務要求・L2モック・L3要件承認に直接関与し、それ以外はAIが担当して不可逆操作のみエスカレーションする。 | escalation_authority | prose | docs/governance/helix-harness-concept_v3.1.md:111-112 |
| `RB04-022` | standaloneの判断gateは機械lintだけで自動通過せず、人間レビュー必須をnext_actionに示す。 | review_merge | gate | docs/governance/helix-harness-concept_v3.1.md:212-212 |
| `RB04-026` | 全駆動モデルの作業者は定量検証をgreenにしてから定性レビューを行い、tests_green_atの欠落やreviewed_atより後の値は拒否する。 | evidence_claim | doctor | docs/governance/helix-harness-concept_v3.1.md:221-221; docs/governance/helix-harness-concept_v3.1.md:1258-1258 |
| `RB04-031` | L1/L2の作成・収束宣言は人間が行い、AIは読み取り専用で欠落候補とtrace断絶を列挙するだけに留める。 | escalation_authority | prose | docs/governance/helix-harness-concept_v3.1.md:341-341 |
| `RB04-056` | G0.5は企画から要求へのtraceと整合破綻だけを軽量確認し、完全性や詳細を要求せず、軽い他者レビューは推奨に留める。 | process_gate | prose／gate | docs/governance/helix-harness-concept_v3.1.md:552-552 |
| `RB04-057` | 企画PLANはkind=charter・layer=L0・po必須で起票し、リポジトリ初期化やbranch protectionは工程外のPhase 0として扱う。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:552-552 |
| `RB04-068` | 設計者は基本・詳細・機能設計を段階分割して個別に凍結し、L2-L6の各sub-docを単独PLANで起票する。 | process_gate | prose／lint | docs/governance/helix-harness-concept_v3.1.md:617-633; docs/governance/helix-harness-concept_v3.1.md:750-750 |
| `RB04-069` | driveに適合しないsub-docを省略する場合、作業者はPLANのskip_sub_docに対象と理由を明記する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:633-633; docs/governance/helix-harness-concept_v3.1.md:806-806 |
| `RB04-082` | G1は5 sub-doc全confirmed、全BR/NFRとOTの1対1対応、業務・画面・機能traceの3 sub-gateをすべて通過するまでブロックする。 | process_gate | gate | docs/governance/helix-harness-concept_v3.1.md:679-712 |
| `RB04-137` | 検証cycleはdraftゼロ・pair孤児ゼロ・confirmed一件以上のfreeze完了で発火し、park済みplaceholderは妨げず、検証roadmapをForwardのdriverにしない。 | process_gate | doctor／gate | docs/governance/helix-harness-concept_v3.1.md:1194-1201 |
| `RB04-232` | PR作成者は作成前に自分でlocal testを実施する。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:1053-1053 |
| `RB05-058` | 各operational PLANは独立AI-Bレビュー・CI・DBまたはoracle・未解決責務のdispositionが揃ったslice closure時だけconfirmedへ遷移する。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:92-97; docs/governance/l3-rebaseline-g3-freeze-packet.md:330-336; docs/governance/l3-rebaseline-g3-freeze-packet.md:536-539 |
| `RB05-059` | freeze担当はrequirement freezeとPLAN statusを別のlifecycleとして扱い、同じenum・gateへ混在させず、一方を他方の実装・検証・着手承認へ読み替えない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:92-97; docs/governance/l3-rebaseline-g3-freeze-packet.md:328-336 |
| `RB05-088` | 最終freeze承認は固定HEAD・tree・digest、最新HEAD独立レビュー、CI green、DB収束、回答反映、未解決ゼロ、Issue同期、対象集合の欠落重複ゼロが全て成立してから記録する。 | process_gate | prose／gate | docs/governance/l3-rebaseline-g3-freeze-packet.md:491-507 |
| `RB05-094` | Source Capability Gateはpending、source path欠落、根拠なしreject、HIL ID欠落、test欠落が1件でも残る場合、pair-freezeを許可しない。 | process_gate | gate | docs/governance/infinity-loop-source-capability-ledger.md:15-17 |
| `RB05-113` | 要件確定に基本設計が必要な場合は並行して設計を進め、画面対象ではprototypeとwalkthroughから潜在要求を回収してから要件をfreezeする。 | process_gate | prose | docs/governance/infinity-loop-source-capability-ledger.md:61-62 |
| `RB05-114` | 画面要求がないHARNESS構築でも画面工程を暗黙省略せず、明示的なskipを記録する。 | process_gate | prose | docs/governance/infinity-loop-source-capability-ledger.md:63-63 |
| `RB05-179` | Source Coverage Gateは全atomの採否とedgeがcurrentでpending・orphan・staleがゼロの場合だけpair-freezeを許す。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:101-107; docs/governance/infinity-loop-system-assertion-cases.md:348-348; docs/governance/infinity-loop-system-assertion-cases.md:374-374 |
| `RB05-181` | Screen ApplicabilityはUI scopeならprototype taskへ送り、no-UIならPO判断・理由・actor・digest・reentryを持つreceiptを発行する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:108-113; docs/governance/infinity-loop-system-assertion-cases.md:375-375 |
| `RB05-182` | Screen Gateは有効なprototype agreementまたはno-UI receiptがない場合、L1 freezeとL3開始を拒否し、deferredやLLM自由文だけのskipを認めない。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:109-112; docs/governance/infinity-loop-system-assertion-cases.md:347-347; docs/governance/infinity-loop-system-assertion-cases.md:378-378; docs/governance/infinity-loop-system-assertion-cases.md:422-422 |
| `RB05-206` | Closure Gateはaudit・memory・oracleの必須receiptが全てcurrentでchild Issueが閉じている場合だけclosureを許可する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:179-183; docs/governance/infinity-loop-system-assertion-cases.md:365-365 |
| `RB05-208` | prototypeは起動可能なartifactと全trace・digest・手順を生成し、静的wireframeだけではfreezeを許可しない。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:185-186; docs/governance/infinity-loop-system-assertion-cases.md:376-376 |
| `RB05-210` | walkthroughは版ごとに観測・delta・反映先・再作成判断を記録し、receiptやdelta判定欠落時はagreementを確定せず、requirement delta未反映時はfreezeしない。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:188-190; docs/governance/infinity-loop-system-assertion-cases.md:377-377 |
| `RB05-222` | 設計義務はapplicability未判定・deferredならfreezeせず、N/A根拠欠落やstateful serviceのstate義務をN/Aにする判断を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:231-234 |
| `RB05-233` | Requirement Ledgerは原文・authority・modality・priority・scope・acceptance oracle・service・template・obligation・revisionの必要情報とedgeが揃った場合だけverifiedまたはactiveにする。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:270-279; docs/governance/infinity-loop-system-assertion-cases.md:358-358; docs/governance/infinity-loop-system-assertion-cases.md:436-436 |
| `RB05-247` | Issue Gateは必須gate receiptが一件でも欠けるready・implement・merge・close遷移を拒否し、Reverse・Redesign・pair-freeze未完のclaimをtool起動前に止める。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:340-340; docs/governance/infinity-loop-system-assertion-cases.md:366-366 |
| `RB05-279` | entry set greenはAtomizer開始条件に留め、pair-freezeにはmanifestへ束縛した別receiptでaggregate算入・fixture orphan・pending・根拠なしreject・trace orphanゼロを証明する。 | process_gate | gate | docs/governance/infinity-loop-source-snapshot-manifest.md:400-402 |
| `RB05-289` | pending decisionは調査中だけ許し、pair-freeze時に一件でも残れば失敗させる。 | process_gate | gate | docs/governance/infinity-loop-source-atomization-contract.md:75-75 |
| `RB05-346` | 互換Forward経路ではL1〜L3の意味判断をPO承認へ送り、L4〜L12の設計・実装・review・CI・mergeを自律操作範囲とする。 | escalation_authority | config | config/drive-route-catalog.json:8-17 |
| `RB05-348` | Production ScrumとHybridのS4 increment判断はPOがaccept・rework・pivot・stopを決め、その判断後にSR0〜SR4のfullbackを行う。 | escalation_authority | config | config/drive-route-catalog.json:25-36; config/drive-route-catalog.json:42-53 |
| `RB05-349` | Production Scrumはincrement受入・Scrum Reverse・release candidate pairが閉じた場合だけ終了し、Hybridはdesign pair・increment受入・Scrum Reverseが閉じた場合だけ終了する。 | process_gate | config | config/drive-route-catalog.json:36-36; config/drive-route-catalog.json:53-53 |
| `RB05-350` | DiscoveryはS0〜S3の探索と証拠作成を自律実行し、S4でPOがpromote・reject・pivot・continueを判断して結果と後続経路を記録する。 | escalation_authority | config | config/drive-route-catalog.json:59-71 |
| `RB05-357` | Retrofitは互換検証成功・rollback準備・設計影響の閉包が揃った場合だけ終了する。 | process_gate | config | config/drive-route-catalog.json:154-155 |
| `RB05-359` | Recoveryはfailure除去・currentな再入点・再発防止disposition記録が揃った場合だけ終了する。 | process_gate | config | config/drive-route-catalog.json:171-173 |
| `RB05-361` | Incidentはservice復旧・incident証拠閉包・恒久修正の後続経路確定を終了条件とする。 | process_gate | config | config/drive-route-catalog.json:188-190 |
| `RB05-364` | version-up終了にはcurrentなactivation trigger・rehearsal green・activation routingを要求する。 | process_gate | config | config/drive-route-catalog.json:222-224 |
| `RB05-367` | design-bottomup終了にはcurrentなFE要求、screen mockまたはno-UI receipt、currentなForward pair routeを要求する。 | process_gate | config | config/drive-route-catalog.json:257-257 |
| `RB06-023` | Admission判断者は意味変更にsemantic diff、impact、pair更新、影響oracle、stale伝播、独立reviewまたは決定論oracle、rollback経路を要求する。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:228-231 |
| `RB06-071` | 台帳管理者はoracle・capability・template・primary ownerのtyped edgeと独立review receiptが揃った行だけをactiveへ遷移させる。 | process_gate | prose | docs/governance/infinity-loop-requirement-definition-ledger.md:24-24 |
| `RB06-075` | freeze判定者はchallenged・deferred・authority-pending・staleをfreeze可能として数えない。 | process_gate | prose | docs/governance/infinity-loop-requirement-definition-ledger.md:31-31 |
| `RB06-099` | Issue gateは必須receiptが一件でも欠けるready・implement・merge・close遷移を拒否する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:36-36 |
| `RB06-106` | Screen Gateは実行prototypeのagreementまたは有効な構造化no-UI receiptなしのfreeze・L3開始を拒否し、静的wireframeだけや自由文skipを受理しない。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:43-43; docs/governance/infinity-loop-assertion-coverage-ledger.md:88-88; docs/governance/infinity-loop-assertion-coverage-ledger.md:169-169 |
| `RB06-118` | 要件定義台帳は設計判断とtyped edgeが完全なrevisionだけをactive・freeze可能とし、変更時のatom処置・digest・authority・stale receipt欠落を拒否する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:54-54; docs/governance/infinity-loop-assertion-coverage-ledger.md:113-113; docs/governance/infinity-loop-assertion-coverage-ledger.md:186-186 |
| `RB06-130` | RedesignはL0への影響をPOへescalateし、L1/L2への影響ではpairとscreen証拠をstale化して再freezeまで進行を拒否する。 | escalation_authority | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:73-73; docs/governance/infinity-loop-assertion-coverage-ledger.md:99-99 |
| `RB06-195` | FE本文作成者は層別design PLANを起票して必須節をその時に定義し、frozen層にはowning PLANをconfirmedにしてから本文を置く。 | process_gate | prose | docs/governance/document-system-map.md:134-138 |
| `RB06-210` | L2 discoveryはcandidateをfrozen状態にしない。 | process_gate | config | config/requirement-discovery-event-schema.json:104-105 |
| `RB06-215` | convergence検査はactor・task・flow・priority適用、全candidate処置、矛盾ゼロまたはtyped defer、未解決owner、暗黙matrix、安定優先度、人間prototype合意を確認し、数値scoreを使わない。 | process_gate | config | config/requirement-discovery-event-schema.json:195-208 |
| `RB06-257` | gate運用者は各layer出口で判定し、失敗時は対応modeへrouteする。 | process_gate | prose | docs/governance/gate-design.md:15-17 |
| `RB06-258` | gate承認はG1・G3・G7・G11をPO、G4〜G6をTLが担い、未定義のsignoff提案は各層着手時に確定する。 | escalation_authority | prose | docs/governance/gate-design.md:23-40 |
| `RB06-265` | 旧gate判定はCriticalがゼロならImportant・MinorをcarryしたCONDITIONAL PASSで次工程を許可し、CriticalがあればFAILとする。 | process_gate | prose | docs/governance/gate-design.md:128-128 |
| `RB06-283` | 管理者はbuild出力・runtime state・local設定・secret類をGit除外し、未実体化targetは対応pair-freeze・Forward PLANで生成後にactive trackedへ昇格する。 | safety_security | prose／config | docs/governance/repository-structure.md:142-144 |
| `RB06-284` | 実装者は予定directoryや.gitkeepの存在を実装許可と解釈せず、対応PLAN確定前に中身を実装しない。 | process_gate | prose | docs/governance/repository-structure.md:99-100; docs/governance/repository-structure.md:159-159 |
| `RB06-306` | UAT close担当者はcompletion decision packetに未決項目が残る場合、closeしない。 | process_gate | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:55-55 |
| `RB06-310` | 保留作業を再開・適用する担当者はcurrent evidence、dry-run、rollback、approvalを取り直す。 | escalation_authority | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:101-105; docs/governance/helix-l0-l8-design-consistency-audit.md:159-159 |
| `RB06-316` | retention・purge・compactionの将来採用はPO承認後に要求・要件・受入pairを再freezeする。 | process_gate | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:144-148 |
| `RB07-088` | PoC PLANはS0〜S3でdraftを維持し、S4 receiptとconfirmed・rejected・pivotのoutcomeが揃ってからconfirmedまたはcompletedへ進める。 | process_gate | prose／lint | docs/skills/poc.md:45-48; docs/skills/poc.md:80-81 |
| `RB07-091` | PoCがrejectedなら理由をS4 receiptへ記録し、pivotなら新仮説と変更理由を記録してblocker解消後にS1へ戻る。 | process_gate | prose | docs/skills/poc.md:101-103 |
| `RB07-114` | L3 freezeではfinding未map、要件のsource finding欠落、固定工程の変更、Bun active authority再導入をblockerとする。 | process_gate | prose | docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:124-125 |
| `RB07-158` | freeze判定者は登録率が100%でも意味traceまたはdefinition activeが100%未満ならfreezeを拒否する。 | process_gate | prose | docs/governance/infinity-loop-design-progress-ledger.md:118-118 |
| `RB07-175` | Incident中は管理者が他のactive PLANを凍結し、Incident PLANがdoneになるまで再開しない。 | process_gate | prose | docs/skills/project-management.md:105-105 |
| `RB07-177` | 管理者は全child PLANがdoneになる前にparentをdoneへ進めず、作業都合だけでFR非対応のPLANを作らない。 | process_gate | prose | docs/skills/project-management.md:112-115 |
| `RB07-187` | 担当者は制御されない自動実行を禁止し、learning outputだけでacceptanceを閉じない。 | process_gate | prose | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:87-88 |
| `RB07-188` | 採用監査のwhole goalは残余リスクがaccepted・planned・implementedへ処置されるまでopenに保つ。 | process_gate | prose／gate | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:117-117 |
| `RB07-223` | freeze判定者は各出力・エラー条件に最低1ケース、module境界変更時に結合設計、用語登録、plan lintとdoctor greenを確認する。 | process_gate | prose／lint／doctor | docs/skills/spec-driven-development.md:82-91 |
| `RB07-229` | 担当者はpush前にtypecheck・正規test runner・formatを含むlint・doctorをlocalでgreenにし、scope内のskipと無関係diffを残さない。 | process_gate | prose／ci | docs/skills/git.md:75-87; docs/skills/git.md:103-111 |
| `RB07-292` | trace-freeze担当者は対向設計、型・lint・test・doctor green、skip根拠、用語登録、commit SHA付き証跡、blocking review所見なしを確認する。 | process_gate | prose | docs/skills/incremental-implementation.md:87-96; docs/skills/incremental-implementation.md:104-105 |
| `RB07-314` | 親Issueは全childとfindingの証拠付き終端、exact-HEAD startup再読、doctor・mutation・consumer smoke・独立review、Reverse、main再読が揃うまで閉じない。 | process_gate | config | docs/governance/effective-agent-startup-followup-registry.json:95-103 |
| `RB07-331` | public APIまたはstate構造を変えた場合、担当者はPLAN close前にreviewを実施する。 | review_merge | prose | docs/skills/error-fix.md:75-76 |
| `RB07-332` | Recovery・Incidentの修正PLANは再現test、fix HEADの全検査、根因と許容条件、再発防止策、blocking所見なし、最新継続状態が揃う場合だけ閉じる。 | process_gate | prose | docs/skills/error-fix.md:78-90; docs/skills/error-fix.md:98-99 |
| `RB08-068` | 設計書作成者はpeer review前にPLAN lintと未commit reviewを実行し、freeze前にlint・doctor成功を確認する。 | process_gate | prose／lint／doctor | docs/skills/documentation-and-adrs.md:65-66; docs/skills/documentation-and-adrs.md:92-92 |
| `RB08-070` | ADR担当者はStatusをProposedから開始し、reviewがcleanかつdoctor成功後だけAcceptedへ進める。 | process_gate | prose／lint／doctor | docs/skills/documentation-and-adrs.md:75-77 |
| `RB08-076` | 図を追加した担当者はreviewを実行し、図が必須の層では図のTODOを残したままpair-freezeしない。 | process_gate | prose | docs/skills/design-doc.md:88-89 |
| `RB08-083` | 作業者はtypecheck・lint・test・doctor・PLAN lint・blocking finding解消・設計可読性・新語登録・必要な引継ぎ証跡が揃った場合だけ完了とする。 | process_gate | prose／gate／lint／doctor | docs/skills/gate-planning.md:35-49 |
| `RB08-087` | pair-freeze担当者はPLAN ready、正しい設計path、可読性、lint・doctor成功、未解決requiresなしを確認する。 | process_gate | prose／gate | docs/skills/gate-planning.md:64-66 |
| `RB08-088` | trace-freeze担当者はscope内sourceのcommit、skipなしtest成功、lint・typecheck・doctor成功、trace link充足を確認する。 | process_gate | prose／gate | docs/skills/gate-planning.md:68-70 |
| `RB08-089` | accept担当者はblocking findingなし、HEADでtrace-freeze条件継続、ADR Accepted、引継ぎ更新または終了を確認する。 | process_gate | prose／gate | docs/skills/gate-planning.md:72-73 |
| `RB08-104` | pair-freeze担当者はSizing・W-model適用理由・分割のrequires反映と、PLAN lint・doctor成功を確認する。 | process_gate | prose／lint／doctor | docs/skills/system-design-sizing.md:79-87 |
| `RB08-109` | trace-freeze担当者は新testの設計対応、理由なしskip/todoなし、typecheck・lint・test・doctor成功、L7 blocking findingなしを確認する。 | process_gate | prose | docs/skills/test-driven-development.md:60-68 |
| `RB08-120` | PLAN担当者はpair-freezeまでにgenerates文書を用意し、placeholder_depsをtrace-freeze前に解消する。 | process_gate | prose／gate | docs/skills/dependency-map.md:39-41; docs/skills/dependency-map.md:84-85 |
| `RB08-126` | 段階移行担当者は各phase境界でcount・checksum・integration test等を通し、検証方法を設計へ記録してから次phaseへ進む。 | process_gate | prose | docs/skills/data-migration.md:41-52 |
| `RB08-132` | onboarding担当者はsetupと既存PLAN baseline化を行い、importをPhase 0として扱い、DB資産件数とfilesystem件数一致後に新作業を開始する。 | process_gate | prose | docs/skills/data-migration.md:82-86 |
| `RB08-163` | schema PLANのfreeze担当者は設計・migration・test-design・lint・doctorを確認し、harness.db変更ではrebuildとprojection-writer testの成功も要求する。 | process_gate | prose／lint／doctor | docs/skills/db.md:74-83 |
| `RB08-201` | API freeze担当者は文書・対test設計・generates・lint/doctor成功・endpoint名非衝突・新語glossary登録を確認する。 | process_gate | prose／lint／doctor | docs/skills/api.md:58-67 |
| `RB08-246` | freeze担当者は画面prototype合意記録なしにL3を凍結しない。 | process_gate | prose | docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:47-47 |
| `RB08-284` | package受入担当者はfresh packageの独立再監査でnew critical/majorゼロを実証するまでL3・受入設計をconfirmedへ進めない。 | process_gate | prose | docs/governance/hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md:31-31 |
| `RB08-311` | system完成判定者は13品質領域をapplicableまたは理由付きN/Aへ処置し、Scrum sliceをSR0〜SR4閉鎖前にrelease-readyへしない。 | process_gate | prose | docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md:24-29; docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md:36-36 |
| `RB08-312` | 要件定義完了判定者はFRのAC欠落・曖昧競合、Refactorの複数route同時選択、必須metric不備の無視、旧層再正本化があれば完了判定を撤回する。 | evidence_claim | prose | docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md:31-39 |
| `RB08-313` | UIなし案件の担当者は理由・判定者・HEAD・再評価条件を持つN/A receiptなしにL2を飛ばさない。 | process_gate | prose | docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md:40-40 |
| `RB08-316` | AI判断エンジン担当者はsource schema/envelope gapをnegative fixtureで保持し、L5 schema compositionが閉じるまでactivationを拒否する。 | process_gate | prose | docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md:54-54 |
| `RB08-344` | Infinity Loop要件判定者はdefinition bindingを設計義務解消やL4到達と扱わず、PO承認と承認snapshot付きfreeze receipt成立前にfrozenとしない。 | evidence_claim | prose | docs/governance/infinity-loop-requirements-definition-review-2026-07-19.md:15-17; docs/governance/infinity-loop-requirements-definition-review-2026-07-19.md:38-41 |
| `RB09-003` | Issue終端担当者は、本companionのcanonical mergeとmain read-afterが成立する前にIssue #1308／#1244をcloseしてはならない。 | review_merge | prose | docs/governance/universal-improvement-sensitive-field-policy-terminal-fullback-evidence.md:42-42 |
| `RB09-019` | CI Verification Planの終端担当者は、Reverse candidateのexact-HEAD独立review、draft／Ready CI、reviewed merge、read-after、post-main CIが成立した後、Forward／Reverse PLANのbackfill_stateをcomplete、completion_claim_allowedをtrueとして同一closure bundleで確定する。 | evidence_claim | prose | docs/governance/ci-verification-plan-terminal-fullback-evidence.md:28-31 |
| `RB09-020` | Issue終端担当者は、closure bundle自身のcurrent-HEAD CI、Claude exact-HEAD review、canonical merge、main read-afterが成立した後にのみIssue #1206／#1269をcloseし、#1269を未終端のまま残してはならない。 | review_merge | prose | docs/governance/ci-verification-plan-terminal-fullback-evidence.md:35-35 |
| `RB09-023` | #1036の担当者は、#204のtyped identityを再利用できることを入口条件としてsemantic connection graph kernelを進め、終端証拠としてdeterministic replayとunknown edge mutationを揃える。 | process_gate | prose | docs/governance/system-synthesis-rollout-roadmap.md:9-13 |
| `RB09-024` | #1039の担当者は、#1036・#179・#188・#233のtyped input成立を入口条件としてdeterministic partial synthesisを進め、終端証拠としてsame-input same-digestとrequired omission拒否を揃える。 | process_gate | prose | docs/governance/system-synthesis-rollout-roadmap.md:9-14 |
| `RB09-026` | #1038の担当者は、#233／#235のportfolio／lifecycle接続成立を入口条件としてreplacement lifecycleを進め、終端証拠としてparity、migration、rollback、no-degradationを揃える。 | process_gate | prose | docs/governance/system-synthesis-rollout-roadmap.md:9-16 |
| `RB09-030` | #1037の担当者は、NOW childのmain read-after完了、rule-based baselineと複数project datasetの固定、false positive／false negative・counterexample・rollbackの測定可能性、shadow outputがcurrent authorityへwriteしないことのdoctor検証可能性、別action-binding evidenceとしてのL3人間確認が全て揃うまでparkedを維持する。 | process_gate | prose／doctor | docs/governance/system-synthesis-rollout-roadmap.md:21-29 |
| `RB09-041` | Issue終端担当者は、merge後にmain上の両PLAN、pair、snapshotを再検証してからIssue #1306をcloseし、続いて#1208をcloseする。 | review_merge | prose | docs/governance/ci-deferred-obligation-recovery-terminal-fullback-evidence.md:32-32 |
| `RB09-048` | Issue終端担当者は、本Reverse PRのcurrent HEADに対するCI、Claude exact-HEAD review、canonical merge、main read-afterが成立する前にIssue #1294をcloseしてはならない。 | review_merge | prose | docs/governance/helix-bench-task-dataset-terminal-fullback-evidence.md:29-32 |
| `RB09-067` | Issue終端担当者は、terminal bundle自身のcurrent-HEAD CI、Claude exact-HEAD review、canonical merge、main read-afterを確認した後にだけIssue #1451をcloseする。 | review_merge | prose | docs/governance/hosted-preflight-nonce-order-terminal-fullback-evidence.md:26-29 |
| `RB09-077` | Issue終端担当者は、bundle自身のcurrent-HEAD CI、Claude exact-HEAD review、canonical merge、main read-afterが成立した後にのみIssue #1204／#1238をcloseする。 | review_merge | prose | docs/governance/ci-execution-telemetry-terminal-fullback-evidence.md:26-27 |
| `RC0-101` | Standaloneのjudgment review checkは、人間承認がない場合、または明示reviewKindがhuman以外の場合、失敗する。 | review_merge | gate | src/gate/review-tier.ts:157-174 |
| `RC00-023` | 状態機械template計画器は、選択templateのexit_criteriaが空なら不合格とする。 | process_gate | gate | src/runtime/state-machine-template-planner.ts:54-60 |
| `RC00-113` | 変更package検査は、draft・active・confirmedのPLANをarchive要求した際、設計とテスト設計のdelta参照が両方空ならエラーとする。 | process_gate | gate | src/runtime/change-package-delta-archive.ts:42-63 |
| `RC00-114` | 変更package検査は、active状態のarchive要求にrollback pathまたはevidence digestがなければエラーとする。 | evidence_claim | gate | src/runtime/change-package-delta-archive.ts:57-71 |
| `RC00-116` | 変更package検査は、archive要求があり、PLANが非activeで、rollback pathとevidence digestがある場合に限りarchiveを許可する。 | process_gate | gate | src/runtime/change-package-delta-archive.ts:88-92 |
| `RC01-030` | gate-confirmは、confirmedの設計・テスト設計文書について、対応gateが台帳に存在しPASSでない場合、不合格にする。対応gateが台帳にない文書はこの検査では飛ばす。 | evidence_claim | lint | src/lint/gate-confirm.ts:101-111 |
| `RC01-082` | plan-completion-driftは、archived以外のPLANでDoDのチェック済み項目が1件以上、未チェックが0件、statusがconfirmed/completed/accepted以外の場合、不合格にする。 | evidence_claim | lint／doctor | src/lint/plan-completion-drift.ts:76-84; src/lint/plan-completion-drift.ts:87-112; src/lint/shared.ts:88-100 |
| `RC02-032` | doctorのplan-completion-drift checkは、DoD消化・下流confirmedに対してPLAN自身のstatusが非終端のままという完了管理の不整合、または読込失敗で失敗する。 | process_gate | doctor | src/doctor/index.ts:751-775 |
| `RC02-037` | doctorのmerged-plan-status checkは、merge済み生成sourceに対して所有PLANが未confirmなどの不整合にある、または読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:984-1009 |
| `RC02-079` | doctorのrecovery-runway-binding checkは、blockerに対するphase・次action・実行command不足、件数や連番の不整合、machine証拠command不足、approval phaseのhuman_required=false、design phaseのhuman_required=true、または投影不能で失敗する。 | process_gate | doctor | src/doctor/index.ts:3066-3182 |
| `RC02-081` | doctorのrecovery-exit-binding checkは、残queueとblocking lane総数の不一致、次command・選択lane・必要actionの欠落、不正なhuman_required設定、再計算command不足、再入場blocker件数不一致、または投影不能で失敗する。 | process_gate | doctor | src/doctor/index.ts:3416-3523 |
| `RC02-095` | doctorのgate-confirm checkは、gate設計と文書frontmatterの検査が不合格、または読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4709-4728 |
| `RC02-124` | doctorのl6-completion checkは、入力読込不能またはfreezeInputReady=falseの場合に失敗する。設計中のdraft status自体は失敗理由にせず、freeze完了とは分けて表示する。 | process_gate | doctor | src/doctor/index.ts:5384-5408 |
| `RC02-161` | doctorのl3-progression-authority checkは、authority検査findingが1件以上、またはレビュー済みpath読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:6644-6664 |
| `RC03-035` | closure authority backfill処理は、design authorityのsource_kindがconfirmed_designでないかstatusがconfirmedでない場合、候補をinvalidとする。 | escalation_authority | gate | src/policy/closure-authority-backfill.ts:420-423 |
| `RC03-147` | G7は、verification groupのL0-L7が存在しないかfrozenでない場合、失敗する。 | process_gate | gate | src/gate/static.ts:187-192; src/gate/static.ts:201-210 |
| `RC04-120` | pair-agentは、テスト作成または実装phaseが非ゼロ終了等でerrorになれば後続工程へ進まない。 | process_gate | gate | src/orchestration/pair-agent.ts:623-632; src/orchestration/pair-agent.ts:644-654 |
| `RC04-121` | pair-agentは、smart_reviewがerrorを返せば停止し、passが無いままmaxFixCyclesを使い切ればfailedにする。 | process_gate | gate | src/orchestration/pair-agent.ts:649-670 |
| `RC04-123` | 自動化readiness判定器は、PLANに対応するopen findingがあればblockedにする。 | process_gate | gate | src/workflow/readiness.ts:16-20; src/workflow/readiness.ts:55-58 |
| `RC04-129` | AI判断提案検証器は、blocking unresolvedが残っていれば拒否する。 | process_gate | gate | src/workflow/ai-decision-proposal.ts:106-108 |
| `RC04-132` | AI判断提案検証器は、次状態がawaiting_commit_verifier以外なら拒否する。 | escalation_authority | gate | src/workflow/ai-decision-proposal.ts:119-123 |
| `RC04-151` | interview評価器は、選択対象外の質問への回答をfindingにし、freezeを拒否する。 | process_gate | gate | src/workflow/workflow-interview-unresolved.ts:100-114; src/workflow/workflow-interview-unresolved.ts:194-201 |
| `RC04-153` | interview評価器は、回答authorityがunknownなら未解決事項にしてfreezeを拒否する。 | escalation_authority | gate | src/workflow/workflow-interview-unresolved.ts:132-140; src/workflow/workflow-interview-unresolved.ts:194-201 |
| `RC04-154` | interview評価器は、同じ質問の回答値が複数種類あれば矛盾としてfreezeを拒否する。 | process_gate | gate | src/workflow/workflow-interview-unresolved.ts:142-159; src/workflow/workflow-interview-unresolved.ts:194-201 |
| `RC04-155` | interview評価器は、選択された質問への回答が無ければ未解決事項にしてfreezeを拒否する。 | process_gate | gate | src/workflow/workflow-interview-unresolved.ts:164-173; src/workflow/workflow-interview-unresolved.ts:194-201 |
| `RC04-156` | interview評価器は、sourceのambiguityまたはbranch gapが登録されていれば未解決事項にしてfreezeを拒否する。 | process_gate | gate | src/workflow/workflow-interview-unresolved.ts:175-201 |
| `RC04-173` | Scrum fullback器は、S4判断がconfirmed以外ならForwardへの接続を拒否する。 | process_gate | gate | src/workflow/contracts.ts:703-715 |
| `RC04-176` | Retrofit readiness検証器は、migration・config・rollback証拠が揃わなければblockedにする。 | process_gate | gate | src/workflow/contracts.ts:752-763 |
| `RC04-209` | workflow envelope検証器は、blocking unresolvedが残っていればactivationを拒否する。 | process_gate | gate | src/workflow/universal-workflow-envelope.ts:302-308; src/workflow/universal-workflow-envelope.ts:425-429 |
| `RC04-218` | 派生trace検証器は、derived_systemのstatusがcandidate以外なら早期確定として失敗する。 | escalation_authority | gate | src/workflow/derived-requirement-trace.ts:310-316 |
| `RD01-036` | PLAN完了adapterは、continuation書込みとcheckpoint公開が成功した場合にだけactive PLANを解除する。 | process_gate | gate | src/runtime/continuation.ts:764-770 |
| `RD01-180` | Forward／Reverse予約処理は、成立した両contractをdraft・pending_reverse・完了主張禁止に固定し、互いの文書pathを参照させる。 | evidence_claim | gate | src/runtime/forward-reverse-terminal-reservation.ts:169-187 |
| `RD02-153` | workflow対応付け器は、文書・trigger・pillar・mode・gate・ownerのいずれかが欠ける場合にharden_requiredとする。 | process_gate | gate | src/runtime/legacy-adoption.ts:466-473; src/runtime/legacy-adoption.ts:480-481 |
| `RD02-304` | 運用移行文書検証器は、statusがconfirmedでない場合に無効とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:260-260 |
| `RD04-212` | action-binding readiness lintは、frontier記録が入力された場合、未決定のdraft・S3・poc PLANにfrontier_pending_decision bindingの検証を要求し、その違反を失敗に含める。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:301-310; src/lint/action-binding-approval-readiness.ts:725-739 |
| `RD05-040` | completion-decision-packetは、workflowStateBlockersが全blockerから抽出・sortしたworkflow状態blocker列と一致しない場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:139-139; src/lint/completion-decision-packet.ts:285-293 |
| `RD05-096` | completion-decision-packetは、decisionのnextWorkflowRouteが空またはTBD・TODO・「-」の場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:805-810 |
| `RD05-097` | completion-decision-packetは、decisionのnextWorkflowRouteにblocker別の必須案内語が欠ける場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:811-819; src/lint/completion-decision-packet.ts:1662-1675 |
| `RD05-100` | completion-decision-packetは、nextWorkflowRoutesByRecordが非配列または空の場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:836-844 |
| `RD05-121` | completion-decision-packetは、required recordに対応するroute記録がない場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:1024-1031 |
| `RD05-122` | completion-decision-packetは、recordのnextWorkflowRouteが空またはTBD・TODO・「-」の場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:1032-1038 |
| `RD05-123` | completion-decision-packetは、recordのnextWorkflowRouteにrecord種別ごとの必須案内語が欠ける場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:1039-1047; src/lint/completion-decision-packet.ts:1742-1794 |
| `RD05-131` | completion-decision-packetは、通常版templateの挿入案内と本文にrecord種別ごとの必須案内語が欠ける場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:1183-1191; src/lint/completion-decision-packet.ts:1796-1857 |
| `RD05-137` | completion-review-bundleは、blockedUntilがdecision packetのblockersと順序を含め一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:1987-1993 |
| `RD05-179` | cycle-p4-verificationは、行のstatusがclosed・human_required・out_of_scopeのいずれでもない場合、違反にする。 | process_gate | lint | src/lint/cycle-p4-verification.ts:46-50; src/lint/cycle-p4-verification.ts:202-205 |
| `RD05-199` | ddd-tdd-rulesは、policy文書にG3がない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:98-98; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-214` | ddd-tdd-rulesは、2026-07-25以降に作成されたL3-L7 PLANでengineering_discipline_required=trueがない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:448-449; src/lint/ddd-tdd-rules.ts:522-547 |
| `RD06-106` | document-agent-metadata lintは、done_whenの宣言ID・先行文書・pair成果物・必須gateが導出結果と一致しない場合、失敗させる。配列は順序も含めて照合する。 | evidence_claim | lint | src/lint/document-agent-metadata.ts:130-132; src/lint/document-agent-metadata.ts:170-181 |
| `RD06-170` | forward-convergence lintは、version-up保留扱いをstatus=draftかつversion_targetがfutureまたはv2の場合に限って認める。confirmed・completedはversion_targetがあっても通常の収束判定へ進める。 | process_gate | lint | src/lint/forward-convergence.ts:35-39; src/lint/forward-convergence.ts:104-113; src/lint/forward-convergence.ts:176-194 |
| `RD06-206` | fr-roadmap-coverage lintは、構造違反がなくてもclosed以外の残存機能行が一つでもあればok=falseを返す。 | process_gate | lint | src/lint/fr-roadmap-coverage.ts:322-330 |
| `RD07-034` | g8-integration-workflowは、必須IT coverageのstatusがpassedでなければ失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:260-264 |
| `RD07-042` | g8-integration-workflowは、exit_criteria.all_mandatory_passedがtrueでなければ失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:315-317 |
| `RD07-043` | g8-integration-workflowは、exit_criteria.failed_mandatory_countが0でなければ失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:318-320 |
| `RD07-044` | g8-integration-workflowは、exit_criteria.stale_defer_countが0でなければ失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:321-323 |
| `RD07-080` | 共通gate証拠検査は、必須coverageのstatusがpassedでなければ違反とする。 | process_gate | lint | src/lint/gn-evidence-manifest.ts:270-274 |
| `RD07-089` | 共通gate証拠検査は、exit_criteria.all_mandatory_passedがtrueでなければ違反とする。 | process_gate | lint | src/lint/gn-evidence-manifest.ts:331-333 |
| `RD07-090` | 共通gate証拠検査は、exit_criteria.failed_mandatory_countが0でなければ違反とする。 | process_gate | lint | src/lint/gn-evidence-manifest.ts:334-336 |
| `RD07-091` | 共通gate証拠検査は、exit_criteria.stale_defer_countが0でなければ違反とする。 | process_gate | lint | src/lint/gn-evidence-manifest.ts:337-339 |
| `RD08-016` | L6 completion判定器は、L6文書が0件の場合、freezeInputReadyとreadyをfalseにする。 | process_gate | lint | src/lint/l6-completion.ts:143-162 |
| `RD08-017` | L6 completion判定器は、confirmedでないL6文書がある場合、readyをfalseにする。 | process_gate | lint | src/lint/l6-completion.ts:96-99; src/lint/l6-completion.ts:151-162 |
| `RD08-023` | L6 completion判定器は、kind=designのL6 PLANにconfirmedでないものがある場合、readyをfalseにする。 | process_gate | lint | src/lint/l6-completion.ts:131-135; src/lint/l6-completion.ts:151-162 |
| `RD08-025` | L6 completion判定器は、結合した単体テスト設計本文から得たstatusがconfirmedでない場合、readyをfalseにする。 | process_gate | lint | src/lint/l6-completion.ts:140-162 |
| `RD08-026` | L6 completion判定器は、G6状態が欠落するかPASSを含まない場合、readyをfalseにする。 | process_gate | lint | src/lint/l6-completion.ts:77-90; src/lint/l6-completion.ts:140-162 |
| `RD08-154` | merged-plan-status lintは、generatesの出荷物がmerge済みと判定されるのに所有PLANが終端状態でない場合、kindを問わず失敗させる。ただしdraftのpocでworkflowPhase=S3かつreview evidenceありの場合は除外する。 | review_merge | lint／doctor | src/lint/merged-plan-status.ts:105-131; src/lint/merged-plan-status.ts:196-203 |
| `RD09-004` | outstanding集計は、非終端のkind=pocでworkflow_phaseがS3またはS4の場合、PO判断待ちを返す。phase未記入でも所定のS4判断語がある場合は同様に扱う。 | escalation_authority | lint | src/lint/outstanding.ts:819-826 |
| `RD09-114` | proposal-document-coverageは、workflow-gateを期待するシナリオでgate_contractがrequired_evidenceにない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage-policy.ts:61-61; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-118` | proposal-document-coverageは、discoveryを期待するシナリオでs4_decisionがrequired_evidenceにない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage-policy.ts:63-63; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-127` | proposal-document-coverageは、workflow-gateを期待するシナリオでworkflow-gate-reviewがrequired_gatesにない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage-policy.ts:75-75; src/lint/proposal-document-coverage.ts:169-178 |
| `RD09-129` | proposal-document-coverageは、discoveryを期待するシナリオでdiscovery-s4-decisionがrequired_gatesにない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage-policy.ts:77-77; src/lint/proposal-document-coverage.ts:169-178 |
| `RD10-017` | lintはconfirmed／completedのdesign、add-design、impl、add-impl PLANにreview_evidenceがなければ失敗させる。 | review_merge | lint／doctor | src/lint/review-evidence.ts:10-12; src/lint/review-evidence.ts:938-945 |
| `RD10-019` | lintはconfirmed／completed以外の非archived PLANにapprove、approve_after_fixes、passのreview判定が残っている場合に失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:920-921; src/lint/review-evidence.ts:958-965 |
| `RD10-021` | lintはconfirmed／completed PLANでtests_green_atがreviewed_atより後の場合に失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:974-977 |
| `RD10-027` | lintはgreen_commands強制対象PLANにapprove、approve_after_fixes、passのentryが一つもなければ失敗させる。 | review_merge | lint | src/lint/review-evidence.ts:740-746; src/lint/review-evidence.ts:1007-1022 |
| `RD10-062` | 工程表はgate直前のspanが0件、または対応PLANの一つでもconfirmed／completedでない場合、そのgateを未到達とする。 | process_gate | lint | src/lint/roadmap-registry.ts:87-103 |
| `RD10-074` | S4 lintはallowed_outcome集合、またはdecision_outcomeと選択されたallowed_outcomeの対応が検証に違反する場合に失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:282-293 |
| `RD10-086` | S4 lintは許容されたdecision_outcomeを持つPoCのstatusがconfirmed、completed、archivedのいずれでもなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:409-425 |
| `RD10-087` | S4 lintはconfirmed判断のPoCがarchivedなら失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:427-433 |
| `RD10-092` | S4 lintはrejected判断のPoCがarchivedでなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:472-478 |
| `RD10-095` | S4 lintはrejected判断のrationaleに却下またはarchiveを表す語がなければ失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:491-496 |
| `RD10-096` | S4 lintはpivot判断の旧PoCがarchivedでなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:499-505 |
| `RD10-099` | S4 lintはpivot判断のrationaleがpivotに言及していなければ失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:528-533 |
| `RD10-103` | S4 lintはoutstanding.tsに判断前の必須record・判断者と根拠・昇格経路・rationaleを表す規定markerが欠ける場合に失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:169-174; src/lint/s4-decision-readiness.ts:809-813 |
| `RD10-104` | S4 lintはPoCにdecision_outcomeがありworkflow_phaseがS4でない場合に失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:264-266; src/lint/s4-decision-readiness.ts:815-820 |
| `RD10-116` | S4 packetは対象がS3／S4のdraft・判断待ちPoCでない場合、対象不適合をblocked reasonに記録する。 | process_gate | lint | src/lint/s4-decision-readiness.ts:1371-1387 |
| `RD10-118` | Scrum Reverse lintはreverse PLANが参照する非archived PoCのdecision_outcomeがconfirmedでなければ失敗させる。 | process_gate | lint | src/lint/scrum-reverse.ts:129-144 |
| `RD11-082` | version-up lintは、discovery PLANにdecision_outcome: confirmedが含まれない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:1064-1069 |
| `RD11-086` | version-up lintは、version_target付きPLANのstatusがdraftでない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:1102-1107 |
| `RD11-088` | version-up lintは、activation_decision_recordの必須fieldが欠ける場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:435-446; src/lint/version-up-readiness.ts:1113-1119 |
| `RD11-130` | version-up lintは、activate_future_version選択時、readiness summaryがready_for_activation_reviewでない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:2581-2586 |
| `RD11-131` | parked PLAN意味検査は、target trigger欄にrelease・tag・version・trigger・request・次版のいずれもない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:2612-2617 |
| `RD11-133` | parked PLAN意味検査は、判断経路を結合した記録にarchiveまたはrejectionを示す指定語がない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:2602-2610; src/lint/version-up-readiness.ts:2628-2633 |
| `RD11-179` | terminal fullback監査は、各Forward sliceのPRがmerge済みでない場合に失敗させる。 | review_merge | lint | src/lint/workflow-classification-terminal-fullback.ts:217-225 |
| `RE01-044` | gate実行者は内容・pair・traceの規定順で検証し、一つでも必須検査に失敗したら通過させてはならない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:656-714 |
| `RE01-046` | レビュー実行者は機械検証を先に完了させ、G gateの前提が満たされない状態でH gateへ進んではならない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:656-720 |
| `RE01-047` | G0.5の検証者は方向性・trace・内部矛盾を検査し、完成度やROI/KPIの詳細不足をhard failにしてはならない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:737-747 |
| `RE01-159` | 旧Phase 0Aの受入者は規定11項目とPOSIX・Windows双方の確認を満たしてから完了とする。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:2450-2467 |
| `RE01-204` | 自動closureはdigest一致、対象test・gate成功、dry-run成功を満たした場合だけ許可する。不可逆操作の未完了、drift、汎用証拠だけでclose-readyにしない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:285-285 |
| `RE01-225` | admission処理はauthority・影響範囲・pair・oracle・rollback・stale条件が整うまでsemantic変更をcanonicalへ反映しない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:359-359 |
| `RE01-233` | 状態管理者はDesign・Runtime・Release・Production Observationを別state machineとして扱い、一つのprogressへ潰したり、design完了をproduction観測済みへ直結させたりしない。 | memory_context | gate | docs/governance/helix-harness-requirements_v1.3.md:394-396 |
| `RE01-235` | compilerの受入者は全証拠とstable IDを照合し、backflowを閉じてから人間のG1/G3判断へ進む。frozenをacceptedと同一視しない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:402-418 |
| `RE01-263` | 更新計画者はpriorityをworkflowから独立させ、flat PLANのG3で対象をfreezeする。migrationのL5では専用のdual-green条件を満たす。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:519-523 |
| `RG09-016` | 旧L11 UATの終端担当者は、completion decisionの2件が残る間、closeしてはならない。 | process_gate | prose | docs/governance/document-system-map.md:118-118 |
| `RG09-018` | API・Schemaの変更担当者は、G5でfreezeされた事前条件・事後条件を変更してはならない。 | process_gate | prose | docs/governance/document-system-map.md:180-180 |
| `RG10-002` | 承認運用者はapproval_policyがnoneの場合、通常のAI作成・テスト・PR・review・mergeに人間signoffを要求しない。 | escalation_authority | prose | docs/governance/drive-route-catalog.md:67-67 |
| `RG10-003` | 承認運用者はapproval_policyがlayer_gateの場合、Forwardの既定layer gateに従う。 | process_gate | prose | docs/governance/drive-route-catalog.md:68-68 |
| `RG10-006` | catalog管理者はscreen-designとfrontend-designについて、entry signal・required artifact・exit conditionをexactに保持し、名称登録だけで済ませてはならない。 | process_gate | prose | docs/governance/drive-route-catalog.md:90-93 |
| `RG19-011` | 技術選定PLANのpair-freeze担当者は、移行前に `helix plan lint` と `helix doctor` がともにexit 0であることを確認する。 | process_gate | prose／lint／doctor | docs/skills/tech-selection.md:79-86 |

## 副として対応づいた規則（260件）

`RA-184`、`RA-192`、`RA-194`、`RA-220`、`RA-221`、`RA-243`、`RB0-043`、`RB0-045`、`RB0-096`、`RB0-107`、`RB0-160`、`RB0-161`、`RB01-001`、`RB02-001`、`RB04-030`、`RB04-032`、`RB04-035`、`RB04-036`、`RB04-037`、`RB04-040`、`RB04-041`、`RB04-051`、`RB04-058`、`RB04-080`、`RB04-085`、`RB04-088`、`RB04-089`、`RB04-090`、`RB04-091`、`RB04-092`、`RB04-094`、`RB04-095`、`RB04-126`、`RB04-154`、`RB04-155`、`RB04-160`、`RB04-172`、`RB04-240`、`RB05-004`、`RB05-068`、`RB05-069`、`RB05-071`、`RB05-075`、`RB05-081`、`RB05-092`、`RB05-137`、`RB05-138`、`RB05-139`、`RB05-183`、`RB05-192`、`RB05-193`、`RB05-220`、`RB05-229`、`RB05-230`、`RB05-237`、`RB05-248`、`RB05-315`、`RB05-316`、`RB05-317`、`RB05-324`、`RB05-347`、`RB05-352`、`RB05-353`、`RB05-354`、`RB05-355`、`RB05-358`、`RB05-362`、`RB05-368`、`RB05-376`、`RB05-377`、`RB06-094`、`RB06-107`、`RB06-115`、`RB06-122`、`RB06-132`、`RB06-138`、`RB06-212`、`RB06-217`、`RB06-230`、`RB06-234`、`RB06-260`、`RB06-262`、`RB06-275`、`RB06-296`、`RB06-313`、`RB06-314`、`RB07-001`、`RB07-003`、`RB07-025`、`RB07-043`、`RB07-081`、`RB07-085`、`RB07-092`、`RB07-148`、`RB07-161`、`RB07-163`、`RB07-167`、`RB07-217`、`RB07-220`、`RB07-224`、`RB07-225`、`RB07-270`、`RB07-273`、`RB07-274`、`RB07-276`、`RB07-326`、`RB08-003`、`RB08-006`、`RB08-016`、`RB08-036`、`RB08-037`、`RB08-052`、`RB08-055`、`RB08-064`、`RB08-067`、`RB08-072`、`RB08-084`、`RB08-096`、`RB08-113`、`RB08-114`、`RB08-117`、`RB08-125`、`RB08-149`、`RB08-153`、`RB08-155`、`RB08-157`、`RB08-168`、`RB08-179`、`RB08-189`、`RB08-193`、`RB08-195`、`RB08-198`、`RB08-218`、`RB08-237`、`RB08-249`、`RB08-254`、`RB08-260`、`RB08-271`、`RB08-287`、`RB08-303`、`RB08-317`、`RB08-318`、`RB08-320`、`RB08-329`、`RB08-331`、`RB08-345`、`RB09-025`、`RB09-027`、`RB09-028`、`RB09-033`、`RB09-035`、`RB09-076`、`RB09-080`、`RC0-088`、`RC0-089`、`RC0-090`、`RC0-091`、`RC0-092`、`RC0-093`、`RC0-095`、`RC00-022`、`RC01-057`、`RC01-059`、`RC01-060`、`RC01-062`、`RC01-063`、`RC01-064`、`RC01-065`、`RC01-070`、`RC01-085`、`RC01-137`、`RC01-150`、`RC02-083`、`RC02-102`、`RC02-125`、`RC02-129`、`RC02-162`、`RC03-026`、`RC03-043`、`RC03-135`、`RC03-137`、`RC03-139`、`RC03-140`、`RC03-142`、`RC03-143`、`RC03-144`、`RC03-146`、`RC04-112`、`RC04-122`、`RC04-150`、`RC04-152`、`RC04-168`、`RC04-169`、`RC04-171`、`RC04-193`、`RC04-202`、`RC04-204`、`RC04-206`、`RC04-208`、`RD01-004`、`RD01-008`、`RD01-163`、`RD02-108`、`RD02-129`、`RD02-130`、`RD02-348`、`RD02-349`、`RD03-003`、`RD03-004`、`RD03-007`、`RD04-015`、`RD05-036`、`RD05-037`、`RD05-042`、`RD05-060`、`RD05-207`、`RD05-250`、`RD06-144`、`RD07-047`、`RD07-053`、`RD08-018`、`RD08-019`、`RD08-020`、`RD08-024`、`RD08-038`、`RD08-057`、`RD08-070`、`RD08-199`、`RD09-009`、`RD09-012`、`RD09-026`、`RD09-073`、`RD09-119`、`RD09-120`、`RD09-121`、`RD09-122`、`RD09-123`、`RD09-124`、`RD09-125`、`RD09-126`、`RD10-025`、`RD10-073`、`RD10-100`、`RD11-031`、`RD11-089`、`RD11-093`、`RD11-134`、`RD11-135`、`RE01-022`、`RE01-028`、`RE01-048`、`RE01-147`、`RE01-150`、`RE01-160`、`RE01-162`、`RE01-171`、`RE01-178`、`RE01-222`、`RE01-230`、`RG05-014`
