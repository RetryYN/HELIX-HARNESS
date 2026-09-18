---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSM-07
group: OS管理
product: OS
atoms_primary: 241
atoms_secondary: 183
issue_projection: none
---

# RUL-OSM-07（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

旧資産の退役と切替を管理する。旧の参照を0にしてから退出し、旧の成果や旧の識別子を現行の根拠へ再昇格させない。

## 主として対応づいた規則（241件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-009` | エージェントはConcept v3.1を既存契約の移管・差分照合時だけ参照し、旧定義をcurrentへ再出力しない。 | memory_context | prose | AGENTS.md:62-65; CLAUDE.md:19-21; CLAUDE.md:141-141 |
| `RA-012` | エージェントはarchive、migration snapshot、legacy local stateおよび移行前のhook・subagent・memoryをhistorical referenceとして扱い、現行runtime stateや実行通路にしない。 | memory_context | prose | AGENTS.md:88-89; AGENTS.md:102-103; AGENTS.md:137-137; CLAUDE.md:40-42; .claude/CLAUDE.md:5-7; .claude/CLAUDE.md:218-219; .claude/CLAUDE.md:233-233 |
| `RA-018` | エージェントはlegacy由来skillをmigration sourceとして扱い、HELIX skill文書をdocs/skillsに置く。 | memory_context | prose | AGENTS.md:280-280 |
| `RA-066` | エージェントはlegacy commandやlegacy Python moduleをcurrentの実行通路として追加・説明しない。 | tooling_runtime | prose | AGENTS.md:211-211; CLAUDE.md:40-42; .claude/CLAUDE.md:241-245 |
| `RA-068` | エージェントはBunをactive dependencyへ再導入せず、historical文字列を実行・rollback・完了根拠に昇格させない。 | tooling_runtime | prose | AGENTS.md:95-99; CLAUDE.md:44-47; .claude/CLAUDE.md:33-34; .claude/CLAUDE.md:244-245 |
| `RA-069` | エージェントは旧W1-W3a Python runtimeをbulk portせず、behavior atomから再実装する。 | tooling_runtime | prose | AGENTS.md:97-97; AGENTS.md:117-123; CLAUDE.md:47-47; CLAUDE.md:75-80 |
| `RA-107` | エージェントは名称cutoverのdecision record・承認・dry-run・backup・rollback・monitoring証跡が揃うまでstate移動やalias有効化を行わない。 | escalation_authority | prose | AGENTS.md:128-131; CLAUDE.md:92-95 |
| `RA-186` | エージェントはL0-L14をcompatibility・historical用途に限定し、新規要件・設計・trace・gate・fixture・CI期待値の正本にしない。 | process_gate | prose | AGENTS.md:71-72; CLAUDE.md:27-28; .claude/CLAUDE.md:28-29 |
| `RA-187` | 移行時はcanonical判定とcompatibility判定を分離してdual-greenを要求し、旧側成功でcanonical失敗を相殺しない。 | process_gate | prose／gate | AGENTS.md:73-74; CLAUDE.md:29-30 |
| `RA-188` | エージェントはCore Readsの旧記述を後勝ちauthorityにせず、L0-L14へ戻す変更を退行としてfail-closeする。 | process_gate | prose／gate | AGENTS.md:75-76; CLAUDE.md:29-32 |
| `RA-189` | Concept v4のruntime正本化はcanonical promotionとconsumer移行が完了してから行う。 | process_gate | prose | AGENTS.md:62-65; CLAUDE.md:19-21 |
| `RA-233` | 文書変更者は旧WSL2必須表現・migration sourceの現行扱い・個人絶対path・文字化けをrgで確認する。 | process_gate | prose | AGENTS.md:339-340 |
| `RA-291` | 旧機能を採用するエージェントは一括importせず、rename・旧前提除去・capability-class化でhardenして組み込む。 | behavior_discipline | prose | AGENTS.md:116-123; CLAUDE.md:70-70; CLAUDE.md:78-80 |
| `RA-292` | エージェントは専用migrationまではhelix・.helix・area=helix・rule-drift markerを据え置き、承認後の改名をatomicに行う。 | behavior_discipline | prose | AGENTS.md:125-131; CLAUDE.md:87-95 |
| `RA-294` | エージェントは旧配布名HELIX-HARNESS-OSを互換入力・redirectだけで受理し、current output・receipt・manifest・tag pinへ出さない。 | behavior_discipline | prose | AGENTS.md:84-85; CLAUDE.md:149-150 |
| `RB0-003` | 作業者は旧Concept v3.1を通常のCore Readから外し、既存契約の移管・差分照合時だけ参照する。 | memory_context | prose | docs/governance/README.md:24-26 |
| `RB0-004` | Concept v4の正本昇格は、canonical promotion・全consumer移行・独立検証が完了してから行う。 | process_gate | prose | docs/governance/README.md:26-27 |
| `RB0-006` | 作業者は旧L0-L14の記述・ID・物理pathを、新規成果物やCI判定の正本にしてはならない。 | memory_context | prose | docs/governance/README.md:29-32; docs/governance/coding-rules.md:1-2 |
| `RB0-008` | 作業者はmigration文書やsource snapshotを参照材料として扱い、旧runtimeを実行経路にしてはならない。 | tooling_runtime | prose | docs/governance/README.md:35-39 |
| `RB0-010` | 分類者は文書名や物理directoryの旧L1表記だけで要求をL1企画へ分類してはならない。 | memory_context | prose | docs/governance/README.md:41-43 |
| `RB0-012` | 作業者はsource reference snapshotとlegacy local stateを直接編集してはならない。 | safety_security | prose | docs/governance/README.md:59-62 |
| `RB0-013` | 文書作成者は旧runtime commandをHELIXの実行導線として記述せず、現行導線をhelix commandにする。 | tooling_runtime | prose | docs/governance/README.md:63-63 |
| `RB0-056` | 検査側はlegacy削除stepをconsumer_zeroの退役状態に限って受理する。 | process_gate | lint／doctor／ci | docs/governance/ddd-tdd-rules.md:110-110 |
| `RB0-106` | 再利用者は旧pair・旧gate・Bun target・Python proposal-onlyをoracleに持つ成果物を直接使わず、canonical deltaを満たした新revisionだけを再利用する。 | process_gate | prose | docs/governance/downstream-canonical-reuse-authority-2026-07-19.md:9-18 |
| `RB0-108` | 指定された五つの旧PLANは本文を改変せず、未完了ACをcanonical pairへ再traceする後継deltaがlandするまで実行再開しない。 | process_gate | prose | docs/governance/downstream-canonical-reuse-authority-2026-07-19.md:24-32 |
| `RB03-001` | 本inventoryを利用する側は、そのauthorityを互換入力としての用途に限定する。 | escalation_authority | config | config/plan-legacy-workflow-identity-inventory.json:3-3 |
| `RB04-004` | 移管担当者はV2のlegacy runtime command・個人絶対パス・legacy DB依存を持ち込まず、HELIXのCLI・state・package-local構成へ読み替える。 | tooling_runtime | prose | docs/governance/helix-harness-concept_v3.1.md:61-63 |
| `RB04-135` | 検査機構は廃止済みprose handover・CURRENT.json・helix handover等のactive復活をfail-closeし、Recoveryや歴史記録など別型は区別する。 | memory_context | lint | docs/governance/helix-harness-concept_v3.1.md:1198-1198 |
| `RB05-055` | 運用者は本監査frameworkを参考資料として扱い、現行GitHub運用の正本として使用しない。 | memory_context | prose | docs/governance/audit-framework.md:535-541 |
| `RB05-100` | runtime設計者はPythonとTS/Nodeの役割を分離し、Bun依存を除去し、Linux中心のmulti-OS対応へ移行する。 | tooling_runtime | prose | docs/governance/infinity-loop-source-capability-ledger.md:36-38 |
| `RB05-184` | Bun cutover検証はactive import・command・lockfile・CI setup・distribution依存を全件検出して失敗させ、historical参照だけを根拠付きallowlistにする。 | tooling_runtime | gate | docs/governance/infinity-loop-system-assertion-cases.md:114-119; docs/governance/infinity-loop-system-assertion-cases.md:388-388 |
| `RB05-185` | Bun cutover完了はBunのないclean Linuxでinstallからdistributionまで完走しactive依存ゼロを証明した場合だけ認め、quarantine中のBun findingが残れば拒否する。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:120-120; docs/governance/infinity-loop-system-assertion-cases.md:353-353; docs/governance/infinity-loop-system-assertion-cases.md:411-411 |
| `RB05-263` | v1のhistorical件数・digest・固定ref集合をv2 current manifest・acceptance分母・coverageへ再利用せず、gap比較専用として隔離する。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:53-56; docs/governance/infinity-loop-source-snapshot-manifest.md:210-212; docs/governance/infinity-loop-source-snapshot-manifest.md:285-289 |
| `RB05-271` | 掲載heads-only再現commandは旧digest調査専用とし、current authority生成に使用しない。 | tooling_runtime | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:228-231 |
| `RB05-343` | 旧orchestration surfaceの管理では、一覧にある各pathの出現数をそのpathのmaximum_occurrences以下に制限する。 | tooling_runtime | config | config/legacy-orchestration-surface-inventory.json:21-378 |
| `RB06-030` | 移行担当者は既存Markdownを一括変換せず、新規・意味変更対象から段階適用し、旧資産をbaselineまたはgrandfatherとして明示管理する。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:330-346 |
| `RB06-031` | 読者は当時点監査をcurrent runtime authorityにせず、Bunをactive・fallback・rollbackへ再昇格させない。 | tooling_runtime | prose | docs/governance/l12-hybrid-current-authority-disposition-2026-07-19.md:3-4 |
| `RB06-038` | CI担当者はrulesに旧記述がcompatibility以外の規範として残らないことを継続監視する。 | process_gate | ci | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:39-39 |
| `RB06-039` | 監査者はprocess文書の入口だけを是正しても、旧compatibility本文の隔離完了まではclosedにしない。 | evidence_claim | prose | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:81-81 |
| `RB06-043` | 保守者はskillの旧layer例にcompatibilityラベルを付け、旧authority前提のopen backlogを再routeし、完了履歴は改変せず保持する。 | memory_context | prose | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:251-257 |
| `RB06-044` | 監査者は全seed・broad候補に本文改訂、compatibility隔離、historical表示、negative CI保証のいずれかが付くまで監査をcloseしない。 | process_gate | prose | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:259-268 |
| `RB06-052` | PLAN配置是正担当者は新規PLANのwrite guardを先にfail-close化し、既存flat PLANはreceipt・DB・trace・digest・testを揃えた別cutoverまで改名しない。 | process_gate | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:52-55 |
| `RB06-112` | Bun cutover検証はBunなしのclean環境でinstallからdistributionまで完走し、active依存ゼロを要求してhistorical参照だけを根拠付きallowlistする。 | tooling_runtime | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:49-49; docs/governance/infinity-loop-assertion-coverage-ledger.md:101-101; docs/governance/infinity-loop-assertion-coverage-ledger.md:153-153 |
| `RB06-188` | 文書利用者は旧layer・runtime・pair説明をL3 freeze条件やcurrent成果物配置に使用せず、L1-L12契約を優先する。 | process_gate | prose | docs/governance/document-system-map.md:1-3; docs/governance/document-system-map.md:11-22 |
| `RB06-220` | 旧HELIX inventoryは意味で分類し、個人・global path、raw legacy state、未知workflow、advisory-only出力をcurrent truthから除外する。 | evidence_claim | prose／lint | docs/governance/helix-objective-evidence-audit.md:46-46 |
| `RB06-236` | cutover開始者はReverse完了、preserve一致、各projectionの新規finding・前提違反ゼロ、cleanなcommit済HEAD、PO承認を揃える。 | process_gate | prose | docs/governance/session-handover-atomic-cutover-packet.md:7-16 |
| `RB06-239` | 切替担当者は旧parent CLI削除前にprovider routeを別audit routeへ移し、provider routeとevidenceを一緒に削除しない。 | process_gate | prose | docs/governance/session-handover-atomic-cutover-packet.md:67-68 |
| `RB06-241` | 切替担当者はprovider・operations・archive資産とretirement・continuation・禁止fixtureを保存し、historical記述をlive surfaceとして一括削除しない。 | memory_context | prose | docs/governance/session-handover-atomic-cutover-packet.md:113-130; docs/governance/session-handover-atomic-cutover-packet.md:144-145 |
| `RB06-242` | archive移管者は移管先の件数・byte count・mode・各file digest一致後だけsourceを除去する。 | process_gate | prose | docs/governance/session-handover-atomic-cutover-packet.md:132-145 |
| `RB06-245` | 切替後runtimeは旧handover alias・fallback・CURRENT再生成を残さず、旧commandをnon-zeroにする。 | tooling_runtime | gate／doctor | docs/governance/session-handover-atomic-cutover-packet.md:167-174; docs/governance/session-handover-atomic-cutover-packet.md:182-182 |
| `RB06-246` | 復旧担当者はlegacy_write_disabled前だけ一致backup/checkpointによるrollbackを許可し、到達後は旧reader・writerを復活させずforward-fixする。 | process_gate | prose | docs/governance/session-handover-atomic-cutover-packet.md:184-188 |
| `RB06-247` | 切替担当者はpreserve対象のcount・digest・provenance・schema・query・export・retentionに一件でもdriftがあればcutoverを停止する。 | process_gate | prose | docs/governance/session-handover-atomic-cutover-packet.md:186-188 |
| `RB06-252` | 移管担当者はdual-run canary成立だけで旧TS authorityを削除せず、consumerゼロとRelease admissionまでrollback可能に保つ。 | process_gate | prose | docs/governance/python-semantic-migration-ledger.v1.yaml:21-21 |
| `RB06-253` | PYSEM-001のdual-run不一致時はNode consumerをTS結果へ戻し、Python receiptを非admitとして保持する。 | process_gate | prose | docs/governance/python-semantic-migration-ledger.v1.yaml:37-48 |
| `RB06-255` | review semantic移管のrollbackは旧loop退役義務を相殺せず、独立review要件とfail-closeを緩和しない。 | review_merge | prose | docs/governance/python-semantic-migration-ledger.v1.yaml:183-196 |
| `RB06-256` | gate利用者はL1-L12をcurrent canonicalとし、旧G0.5・G13・G14やreceiptを新規gate・trace・CI期待値と現行完了の代替にしない。 | process_gate | prose | docs/governance/gate-design.md:1-3; docs/governance/gate-design.md:19-44 |
| `RB07-023` | 移植担当者は旧名称だけのportを行わず、旧state・CLI・Packを現行正本として採用しない。 | tooling_runtime | prose | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:106-113 |
| `RB07-061` | 担当者はmemory構造・lifecycle・cross-runtime受け皿の実装完了後にhandover撤去を行う。 | process_gate | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:122-122 |
| `RB07-109` | 担当者はBunをcurrent・target・fallback・rollback・test authorityに使わず、旧Bun surfaceを挙動観測に限定する。 | tooling_runtime | prose | docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:22-23 |
| `RB07-142` | 切出し担当者は旧層・runtime表現をcompatibility資料に限定し、L3 freezeや新規schema・gate・trace・fixture・CI期待値のauthorityへ使わない。 | process_gate | prose | docs/governance/helix-harness-extraction-plan_v0.1.md:1-10 |
| `RB07-146` | 担当者は旧markdown・templateをcurateする際にrole、command、path、用語、OS前提を修正し、旧snapshot・PLAN・auditを正本要件や実行時入力にしない。 | memory_context | prose | docs/governance/helix-harness-extraction-plan_v0.1.md:62-66 |
| `RB07-148` | 切出し担当者はdocs正本、snapshot隔離、state layout、CLI shim、hook、CI、旧参照隔離の順に進め、各段階の完了条件を満たす。 | process_gate | prose | docs/governance/helix-harness-extraction-plan_v0.1.md:81-91 |
| `RB07-149` | 担当者は過去review・監査・archiveをhistorical evidenceとして残し、そこにある旧製品名を削除対象にしない。 | memory_context | prose | docs/governance/helix-harness-extraction-plan_v0.1.md:106-106 |
| `RB07-151` | 旧切出し方針では社内利用者向け文書の製品主語をHELIX-HARNESSとし、HELIXを参照概念・歴史証拠としてのみ記述する。 | doc_language | prose | docs/governance/helix-harness-extraction-plan_v0.1.md:34-34; docs/governance/helix-harness-extraction-plan_v0.1.md:115-116 |
| `RB07-184` | 担当者はatomic renameまでCLI・state・managed markerを保持し、未実施の機械的renameを完了と主張しない。 | evidence_claim | prose | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:53-55 |
| `RB07-186` | 採用担当者は未配線guardをactiveとせず、未知workflowを自動routeせず、旧path・DB・state・APIをcurrent実行資産へ持ち込まない。 | tooling_runtime | prose | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:76-86 |
| `RB07-189` | 移行担当者はrevision ledgerに登録された旧team依存制御・slot writer・loop import writerを、本番consumerゼロ、後継本番callsite、parity E2E、rollback、read-afterの検証が揃うまで削除しない。 | process_gate | config | config/legacy-orchestration-semantic-consumers-revision-2026-09-10.json:11-115 |
| `RB07-218` | 移行担当者はbase ledgerの旧team・pair・loop実行、slot lifecycle、並列scheduler、state書戻し・importを、本番consumerゼロ・後継callsite・parity E2E・rollback・read-after確認前に削除しない。 | process_gate | config | config/legacy-orchestration-semantic-consumers.json:7-110 |
| `RB07-245` | legacy adapterは旧route IDを入力・provenanceに限定し、旧modelをcurrent outputへ再出力せず、route_classを全軸共通分類へ昇格しない。 | tooling_runtime | prose | docs/governance/route-classification-surface-inventory-2026-08-15.md:43-50 |
| `RB07-247` | 監査者は文字列だけで誤りを判定せずauthority・projection・compatibility input・historyに分類し、current出力が旧identityを意味正本として再出力したら拒否する。 | process_gate | prose／doctor／ci | docs/governance/route-classification-surface-inventory-2026-08-15.md:73-78 |
| `RB07-248` | 移行担当者はhistory・旧fixtureをcurrent正本から除外し、旧物理pathを一括改名せずcurrent indexと生成物のauthorityから先に外す。 | memory_context | prose | docs/governance/route-classification-surface-inventory-2026-08-15.md:80-84 |
| `RB07-250` | 分類移行は要件・registry、inventory、docs、runtime、互換adapter、拒否検査、Reverseとmain再読の順に進める。 | process_gate | prose | docs/governance/route-classification-surface-inventory-2026-08-15.md:88-96 |
| `RB07-293` | retirement担当者はsession prose・CURRENT・旧CLIを置換し、provider evidenceと運用移管を保持し、歴史資料をarchiveへ分類して通常continuation sourceにしない。 | memory_context | prose | docs/governance/session-handover-retirement-disposition.md:5-17 |
| `RB07-294` | compatibility decoderはcomplete前rollback専用とし、期限・owner・除去checkpointを必須にしてwriterを禁止する。 | tooling_runtime | prose | docs/governance/session-handover-retirement-disposition.md:17-17 |
| `RB07-297` | retirement担当者はhandover文字列を一括削除せずpath・symbol・kind・owner・replacement・checkpointで全live参照を分類し、未分類や矛盾分類をhard failにする。 | process_gate | prose／lint／doctor | docs/governance/session-handover-retirement-disposition.md:30-31; docs/governance/session-handover-retirement-disposition.md:59-61; docs/governance/session-handover-retirement-disposition.md:89-94 |
| `RB07-300` | 移管担当者は旧setup・template・adapterが旧pathやcommandを生成しないよう同期し、CURRENTのnoteをprovenance・TTL付きtakeover memoryへ最大1件だけ移す。 | memory_context | prose | docs/governance/session-handover-retirement-disposition.md:69-72 |
| `RB07-302` | retirement判定者は分類greenをwriter撤去完了の証明にせず、旧writer・reader・routeゼロ、setup非再生成、crash復旧、memory矛盾拒否、保存証跡、負例oracleをfreeze条件とする。 | process_gate | prose／doctor | docs/governance/session-handover-retirement-disposition.md:87-105 |
| `RB07-317` | 新規判断はL1-L12と6対、層外L0、Python semantic coreとTypeScript/Node境界を使い、旧L0-L14やproposal-only・Bun一律方針をcurrentとして使わない。 | process_gate | prose | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:5-14 |
| `RB07-318` | 是正担当者は旧表をcompatibilityへ隔離し、canonical要件とcompatibility ingestを別section・IDにし、current authoring parserとlegacy loaderを分離する。 | tooling_runtime | prose | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:31-42 |
| `RB07-320` | 担当者はarchiveを現行判断へ使わず、migrationをruntime authorityにせず、roadmapをfreeze時のみ読み、過去監査にhistorical表示を付けて所見自体を改変しない。 | memory_context | prose | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:87-94 |
| `RB07-321` | 是正担当者はCore Reads・process・gate、設計とtest trace、PLAN delta、canonical CIの順に修正し、canonicalとcompatibilityの片方でも失敗する間はcutover完了を宣言しない。 | process_gate | prose／ci | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:96-102 |
| `RB07-322` | 検査者は新PLAN・gate・fixture・CI期待値への旧pair正規値追加を即時blockし、旧path名だけでなく内容のauthority主張で判定する。 | process_gate | prose | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:104-104 |
| `RB08-190` | 廃止担当者は動作するreplacementがsourceとdocsに存在するまでdeprecateせず、参照件数とrollback経路を事前確認する。 | process_gate | prose | docs/skills/deprecation-cutover.md:33-41 |
| `RB08-191` | 廃止担当者は登録assetの旧runtime command・名前・env・source pathを除去し、zero referenceをcutover退出条件とする。 | tooling_runtime | prose／doctor | docs/skills/deprecation-cutover.md:36-40; docs/skills/deprecation-cutover.md:63-64 |
| `RB08-192` | 命名変更担当者は新envとcommandにHELIX_* prefixを使い、CLI env処理に触れるPLANでは残存旧prefixも移行し、延期時はbacklogへ記す。 | tooling_runtime | prose | docs/skills/deprecation-cutover.md:43-47 |
| `RB08-193` | cutover担当者は新経路opt-in・default化・旧経路削除・shim削除のphaseを記録し、1 commitで1 phaseだけ進めて各境界にCI green証跡を残す。 | process_gate | prose／ci | docs/skills/deprecation-cutover.md:49-59 |
| `RB08-194` | 削除担当者はtypecheck成功を確認し、旧pathを参照するtestを更新または理由付き削除して、merge前にreview証跡を残す。testを黙ってskipしない。 | review_merge | prose | docs/skills/deprecation-cutover.md:65-67 |
| `RB08-195` | cutover担当者は未backfill実装を削除する場合Reverse PLANで削除内容と理由を残し、Reverse義務がopenの間はacceptedにしない。 | process_gate | prose／lint | docs/skills/deprecation-cutover.md:69-74 |
| `RB08-213` | L3入力担当者はL0を層外anchorからL1へ投影し、旧物理L1/L2をcanonical L2/L11、L3をL3/L10、下流をL4/L9・L5/L8・L6/L7として解釈する。 | process_gate | prose | docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:9-14; docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:20-29 |
| `RB08-214` | 完了判定者はL13/L14/G13/G14を互換receiptに限定し、完了条件へ使わない。 | evidence_claim | prose | docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:14-14 |
| `RB08-215` | runtime設計者はPython semantic coreとTypeScript/Node transaction境界を正とし、Bunを履歴・negative検出語彙以外のactive・fallback・rollbackへ戻さない。 | tooling_runtime | prose | docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:15-16 |
| `RB08-217` | L3入力担当者は旧文書のdomain要求を使う前にlayer・runtime・gate字段を正規化し、物理改名は別cutoverとする。 | process_gate | prose | docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:17-17; docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:29-29 |
| `RB08-219` | 再baseline完了担当者は58件のmarkerと参照、対象frontmatterのcanonical層・pair・旧物理層、unbound blockerゼロ、authority系testとtypecheck成功を確認する。 | process_gate | prose／gate | docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:93-98 |
| `RB08-249` | 層移行担当者は互換表示とcanonical表示の両方をgreenにしてからenum・ID policyを変え、旧package表現を現行outputへexact remapする。 | process_gate | prose | docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:69-74 |
| `RB08-251` | Authoring Admission設計者はaffected_layersをL1〜L12で表し、旧層IDはprojection経由で導出する。 | tooling_runtime | prose | docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:78-82 |
| `RB08-255` | memory監査担当者はrootと安全worktreeのactive ID和集合を再取得し、ゼロになるまで退役完了としない。 | evidence_claim | prose | docs/governance/harness-memory-reconciliation-audit-2026-07-19.md:72-72 |
| `RB08-265` | 旧資産利用者はvendor snapshot・旧PLAN・監査をreference/evidenceに限定し、無修正runtime入力として転用しない。 | tooling_runtime | prose | docs/governance/runtime-parity-l0-l3-design-audit-2026-06-02.md:41-42; docs/governance/runtime-parity-l0-l3-design-audit-2026-06-02.md:48-52 |
| `RB08-268` | Recovery規範を参照・変更する担当者は統合先recovery.mdを使い、旧recovery-workflow文書をhistorical referenceに限定する。 | doc_language | prose | docs/governance/recovery-workflow.md:3-3 |
| `RB08-286` | 要件取込担当者は旧層配置を現行へremapし、旧Python pathを非authorityとし、UT/Bun前提をrejectする。 | tooling_runtime | prose | docs/governance/hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md:60-62 |
| `RB08-330` | 原稿退役担当者はbytes・見出しexact set・段階割当・hash参照を検査し、独立review・CI・main read-after成立後だけroot原稿を削除する。欠落・重複・範囲外・保全境界欠落はREDとする。 | process_gate | prose | docs/governance/development-investment-stage-directives-source-cleanup-2026-09-11.md:39-50 |
| `RB09-058` | Requirement IRのconsumerは、legacy Markdownをmigrationとcompatibilityのための読取り専用入力として扱う。 | escalation_authority | config | config/requirement-ir-authority.json:23-25 |
| `RB09-069` | 原稿退役の担当者は、Git取込み、検査、独立review、CI、main read-afterが成立した後にroot原稿2件を削除する。 | process_gate | prose | docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md:5-8; docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md:19-19 |
| `RB09-079` | CLIは、旧selected_model、default_model、available_models、drive_modelをcurrent outputへ再出力してはならない。 | tooling_runtime | prose | docs/governance/cli-workflow-identity-terminal-fullback-evidence.md:14-15 |
| `RC01-008` | 退役artifact loaderは、retirement authorityとenforce bindingの片方だけが存在する場合、例外で失敗させる。両方不在の場合は空集合を返す。 | escalation_authority | lint | src/lint/artifact-retirement-authority.ts:40-49 |
| `RC01-013` | canonical reuse検査は、入力pathがCANONICAL_REUSE_BLOCKED_PATHSに含まれる場合、authority delta待ちとして再利用を拒否する。 | escalation_authority | lint | src/lint/canonical-reuse-authority.ts:4-26; src/lint/canonical-reuse-authority.ts:37-47 |
| `RC01-052` | codex-hook-adapterは、hook commandが共有の禁止path・旧runtime marker正規表現に一致する場合、不合格にする。 | tooling_runtime | lint | src/lint/codex-hook-adapter.ts:193-195; src/lint/project-hook.ts:84-97 |
| `RC01-078` | repository-name-pathsは、追跡pathまたはfilesystem pathに旧repository名・旧state名のpatternが残る場合、不合格にする。 | tooling_runtime | lint | src/lint/repository-name-paths.ts:16-20; src/lint/repository-name-paths.ts:31-40; src/lint/repository-name-paths.ts:65-77 |
| `RC01-119` | project-hookは、hook commandが禁止path・旧runtime markerの正規表現に一致する場合、不合格にする。 | tooling_runtime | lint | src/lint/project-hook.ts:84-97; src/lint/project-hook.ts:135-143 |
| `RC01-127` | rule-driftは、AGENTSまたは共有CLAUDEに正式配布repository名と旧名のcompatibility限定markerがない場合、不合格にする。 | escalation_authority | lint | src/lint/rule-drift.ts:39-42; src/lint/rule-drift.ts:88-92 |
| `RC01-128` | rule-driftは、adapter文書にut-tddの指定runtime command呼出しが残る場合、不合格にする。 | tooling_runtime | lint | src/lint/rule-drift.ts:44-53; src/lint/rule-drift.ts:93-102 |
| `RC01-129` | rule-driftは、adapter文書に旧UT_TDD_環境変数prefixが残る場合、不合格にする。 | tooling_runtime | lint | src/lint/rule-drift.ts:54-57; src/lint/rule-drift.ts:93-102 |
| `RC01-130` | rule-driftは、adapter文書に旧.ut-tdd state pathが残る場合、不合格にする。 | memory_context | lint | src/lint/rule-drift.ts:58-61; src/lint/rule-drift.ts:93-102 |
| `RC01-131` | rule-driftは、adapter文書に旧pmo-ut-tdd- agent名prefixが残る場合、不合格にする。 | lane_delegation | lint | src/lint/rule-drift.ts:62-66; src/lint/rule-drift.ts:93-102 |
| `RC01-138` | plan-compatibility-parentは、旧workflow identity inventoryがvalidでない場合、不合格にする。 | escalation_authority | lint | src/lint/plan-compatibility-parent.ts:124-131 |
| `RC01-142` | plan-compatibility-parentは、archived以外のPLANが旧inventory所属PLANをdependencies.parentに指定し、baseline外の場合、不合格にする。 | escalation_authority | lint | src/lint/plan-compatibility-parent.ts:106-111; src/lint/plan-compatibility-parent.ts:132-142 |
| `RC01-143` | plan-compatibility-parentは、archived以外のPLANが旧inventory所属PLANをdependencies.requiresまたはreferencesに指定し、baseline外の場合、不合格にする。 | escalation_authority | lint | src/lint/plan-compatibility-parent.ts:112-119; src/lint/plan-compatibility-parent.ts:132-142 |
| `RC01-181` | runtime-portabilityは、src・hook・scriptsの内容に旧環境変数・state・command・agent markerが残る場合、不合格にする。 | tooling_runtime | lint | src/lint/runtime-portability.ts:33-43; src/lint/runtime-portability.ts:252-263 |
| `RC02-058` | doctorのhandover-retirement-inventory checkは、廃止対象のlive surface検査が不合格、または走査不能の場合に失敗する。 | memory_context | doctor | src/doctor/index.ts:1504-1523 |
| `RC02-059` | doctorのhandover-resurrection checkは、shadow repositoryによる復活検査が不合格、または検出器・baselineを読めない場合に失敗する。 | memory_context | doctor | src/doctor/index.ts:1525-1544 |
| `RC02-075` | doctorのl12-compatibility-binding checkは、L1〜L12の層集合、旧層の投影、企画宣言、artifact remap、ZIP・tailoring metadataが実装内契約を満たさない、または投影不能の場合に失敗する。旧層の観測自体がないpairは投影不一致として扱わない。 | process_gate | doctor | src/doctor/index.ts:2350-2570 |
| `RC02-088` | doctorのfunction-design-absorption-binding checkは、独立層廃止・詳細契約被覆・tailoring宣言・固定command・必須宣言・source・DB decision・吸収先の契約違反、旧L6-function-design source残存、または投影不能で失敗する。 | process_gate | doctor | src/doctor/index.ts:4363-4507 |
| `RC02-092` | doctorのlegacy-orchestration-surface checkは、inventoryとファイルの検査が不合格、または読込失敗の場合に失敗する。 | tooling_runtime | doctor | src/doctor/index.ts:4629-4651 |
| `RC02-093` | doctorのlegacy-orchestration-semantic-consumers checkは、consumer台帳・revision・sourceの検査が不合格、または読込失敗の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4653-4686 |
| `RC02-141` | consumer doctorのconsumer-identifier-transition checkは、旧.ut-tdd配下のファイル、helix配下の早期移行runtimeファイル、旧CLIのbin・script・実行surface参照が存在する場合に失敗する。 | tooling_runtime | doctor | src/doctor/index.ts:5865-5883; src/doctor/index.ts:5984-6025 |
| `RC02-167` | doctorのl12-dual-projection checkは、legacy層tokenのremap被覆など二重投影検査が不合格、または走査不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:6743-6762 |
| `RC02-173` | doctorのcutover-readiness checkは、readiness不合格、必須record template・runbook command・state backup manifest・verification commandの違反、または読込不能で失敗する。 | escalation_authority | doctor | src/doctor/index.ts:6884-6931 |
| `RC02-178` | doctorのforward-convergence-audit checkは、legacy debt allowlistとaudit文書の双方向一致検査が不合格、または監査不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:7213-7227 |
| `RC03-060` | historical V-pair移行分類処理は、候補に既にverification bindingsがある場合、admissionを拒否する。 | process_gate | gate | src/policy/historical-vpair-migration-authority.ts:110-120 |
| `RC03-061` | historical V-pair移行分類処理は、cutoff時点に候補が存在しないか当時のPLAN IDが一致しない場合、post_enforcement_violationに分類する。 | process_gate | gate | src/policy/historical-vpair-migration-authority.ts:121-123 |
| `RC04-037` | ループreceipt生成器は、durable stateが無く旧stateだけ存在する場合、import前のreceipt利用とretryを拒否する。 | evidence_claim | gate | src/orchestration/autonomous-loop-run-receipts.ts:43-65 |
| `RC04-046` | durable storeは、同じPLANの旧移行sourceが複数あれば拒否する。 | memory_context | gate | src/orchestration/loop-store.ts:117-124 |
| `RC04-047` | durable storeは、manifestが無ければ旧import完了markerを発行しない。 | evidence_claim | gate | src/orchestration/loop-store.ts:127-131 |
| `RC04-048` | durable storeは、旧import完了markerがあるのにdurable epochが無い場合、旧stateを再importせず失敗する。 | memory_context | gate | src/orchestration/loop-store.ts:149-151; src/orchestration/loop-store.ts:201-205 |
| `RC04-050` | durable storeは、旧stateの実ファイルが無く永続的に退役できない場合、importを拒否する。 | memory_context | gate | src/orchestration/loop-store.ts:170-177 |
| `RC04-194` | route設定検査器は、legacy DB参照パターンを検出して違反とし、違反を受け取ったroute評価器はexit code 1を返す。 | tooling_runtime | gate | src/workflow/routing-contracts.ts:108-118; src/workflow/routing-contracts.ts:341-352; src/workflow/routing-contracts.ts:472-496 |
| `RD00-103` | CI責務registry検証は、retired capabilityにreplacement・rollback・consumer集合・有効な履歴参照が揃っていない場合、失敗する。 | process_gate | ci | src/runtime/ci-responsibility-registry.ts:261-274 |
| `RD00-307` | current review receipt loaderは、v2・v3などv4以外のreceiptをcurrent証拠として読み込むことを拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1411-1416 |
| `RD01-004` | retirement遷移判定は、Reverse R4がgreenでなければ遷移を拒否する。 | process_gate | gate | src/runtime/continuation.ts:169-176; src/runtime/continuation.ts:253-278 |
| `RD01-005` | retirement遷移判定は、memoryのgreen証跡digestが有効でなければ遷移を拒否する。 | evidence_claim | gate | src/runtime/continuation.ts:172-172; src/runtime/continuation.ts:253-278 |
| `RD01-006` | retirement遷移判定は、lifecycleのgreen証跡digestが有効でなければ遷移を拒否する。 | evidence_claim | gate | src/runtime/continuation.ts:173-173; src/runtime/continuation.ts:253-278 |
| `RD01-007` | retirement遷移判定は、cross-runtimeのgreen証跡digestが有効でなければ遷移を拒否する。 | evidence_claim | gate | src/runtime/continuation.ts:174-175; src/runtime/continuation.ts:253-278 |
| `RD01-008` | retirement journalの検証処理は、完了phaseの飛び越し・逆行・不正な開始、許可外のrollback、rollback後の追記を拒否する。 | process_gate | gate | src/runtime/continuation.ts:209-242; src/runtime/continuation.ts:392-395 |
| `RD01-012` | retirement遷移判定は、定義済みの隣接Forward遷移または初期3phaseからのrollback以外を拒否する。 | process_gate | gate | src/runtime/continuation.ts:93-100; src/runtime/continuation.ts:270-278 |
| `RD01-018` | manifest照合処理は、sourceにあるpathがtargetに欠けていれば失敗する。 | evidence_claim | gate | src/runtime/continuation.ts:440-460 |
| `RD01-019` | manifest照合処理は、sourceにないpathがtargetにあれば失敗する。 | evidence_claim | gate | src/runtime/continuation.ts:440-460 |
| `RD01-020` | manifest照合処理は、同一pathのdigest、mode、trackedがsourceとtargetで異なれば失敗する。 | evidence_claim | gate | src/runtime/continuation.ts:444-460 |
| `RD01-021` | rollback判定は、current phaseがprerequisite、shadow_read、memory_primary以外なら拒否する。 | process_gate | gate | src/runtime/continuation.ts:93-93; src/runtime/continuation.ts:471-481 |
| `RD01-025` | rollback判定は、incidentの記録がなければ拒否する。 | process_gate | gate | src/runtime/continuation.ts:501-502 |
| `RD02-140` | 推薦判定器は、候補が旧pathまたはhelix codexの検出patternに該当する場合にharden_requiredとする。 | tooling_runtime | gate | src/runtime/legacy-adoption.ts:223-239; src/runtime/legacy-adoption.ts:340-342 |
| `RD02-143` | core注入判定器は、source・targetが旧pathまたは旧runtime commandに該当する、あるいはglobalファイルだけを参照する場合に採用を拒否する。 | memory_context | gate | src/runtime/legacy-adoption.ts:374-389 |
| `RD02-154` | 旧DB採用判定器は、raw legacy stateのimportを拒否する。 | memory_context | gate | src/runtime/legacy-adoption.ts:484-485 |
| `RD02-155` | 旧DB採用判定器は、source・state kind・projection先・read model・API境界・provenanceのいずれかが欠ける場合にharden_requiredとする。 | memory_context | gate | src/runtime/legacy-adoption.ts:486-495 |
| `RD02-309` | 運用移行文書検証器は、旧CURRENT.json・src/handover/・helix handover・handover-*の禁止patternを含む文書を無効とする。 | memory_context | gate | src/runtime/retirement-preserve.ts:269-277 |
| `RD02-327` | 保存整合性判定器は、移行前の資産が移行後に欠落している場合に失敗とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:727-731; src/runtime/retirement-preserve.ts:753-759 |
| `RD02-328` | 保存整合性判定器は、移行後に予定外の資産が追加されている場合に失敗とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:732-732; src/runtime/retirement-preserve.ts:753-759 |
| `RD02-329` | 保存整合性判定器は、資産のsemantic entryが移行前後で変化している場合に失敗とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:686-708; src/runtime/retirement-preserve.ts:733-743 |
| `RD02-330` | 保存整合性判定器は、kind別件数が移行前後で一致しない場合に失敗とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:749-754 |
| `RD02-331` | 保存整合性判定器は、preservedDigestが移行前後で一致しない場合に失敗とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:759-759 |
| `RD02-334` | 継続source境界検証器は、provider_evidenceまたはoperations_transitionをcontinuation sourceとして使う要求を拒否する。 | memory_context | gate | src/runtime/retirement-preserve.ts:836-845; src/runtime/retirement-preserve.ts:1115-1118 |
| `RD02-344` | 保存phase退出判定器は、provider資産が2件未満、運用資産またはarchive元が0件、あるいは各path集合がinventoryと一致しない場合に失敗とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:1053-1069 |
| `RD02-347` | 保存phase退出判定器は、operation ID・intent digestの変更、phaseの不正または1段階以外の進行、採取時刻の逆行がある場合に失敗とする。 | process_gate | gate | src/runtime/retirement-preserve.ts:1083-1099 |
| `RD02-348` | 保存phase退出判定器は、保存整合性検証に失敗した場合にphase退出を拒否する。 | process_gate | gate | src/runtime/retirement-preserve.ts:1100-1102 |
| `RD02-349` | 保存phase退出判定器は、archive manifestと実体の照合が失敗した場合にphase退出を拒否する。 | process_gate | gate | src/runtime/retirement-preserve.ts:1105-1107 |
| `RD04-061` | context authority認証器は、authority pathにarchive・requirements v1.2・指定された旧L0-L14系列pathが含まれる場合に拒否する。 | process_gate | gate | src/runtime/worker-context-packet.ts:183-188; src/runtime/worker-context-packet.ts:241-243 |
| `RD04-214` | action-binding readiness lintは、frontier記録が入力された場合、cutover対象PLANにname_cutoverのapproval_gated_cutover binding検証を要求し、その違反を失敗に含める。 | process_gate | lint | src/lint/action-binding-approval-readiness.ts:301-310; src/lint/action-binding-approval-readiness.ts:746-752 |
| `RD04-220` | asset drift lintは、登録assetの本文にai-dev-kit-vscodeの旧source path/nameが残る場合に違反とする。 | tooling_runtime | lint | src/lint/asset-drift.ts:39-43; src/lint/asset-drift.ts:120-130 |
| `RD04-221` | asset drift lintは、登録assetの本文にut-tddのcodex・claude・plan・gate・handover commandが残る場合に違反とする。 | tooling_runtime | lint | src/lint/asset-drift.ts:45-50; src/lint/asset-drift.ts:131-140 |
| `RD04-222` | asset drift lintは、登録assetの本文にpmo-ut-tdd-またはUT_TDD_の旧runtime名が残る場合に違反とする。 | tooling_runtime | lint | src/lint/asset-drift.ts:51-54; src/lint/asset-drift.ts:141-150 |
| `RD04-223` | asset drift lintは、登録assetの本文にUT-TDDという旧製品名が残る場合に違反とするが、直後が:managedの場合は除外する。 | tooling_runtime | lint | src/lint/asset-drift.ts:55-57; src/lint/asset-drift.ts:151-160 |
| `RD05-151` | cutover-readinessは、右腕工程文書にCUTOVER_RECORD_MARKERSの必須markerが欠ける場合、失敗させる。 | process_gate | lint | src/lint/cutover-readiness.ts:57-77; src/lint/cutover-readiness.ts:191-198 |
| `RD05-173` | cutover-readinessは、post_cutover_monitoringにquiet window、smoke/doctor、status/feedback/backlogの各語群が揃わない場合、失敗させる。 | process_gate | lint | src/lint/cutover-readiness.ts:441-451 |
| `RD05-182` | cycle-p4-verificationは、指定された現行運用ファイルにPhase4系表記や旧UT-TDDをruntime・cutoverとして扱う禁止表記がある場合、違反にする。 | memory_context | lint | src/lint/cycle-p4-verification.ts:67-86; src/lint/cycle-p4-verification.ts:230-237 |
| `RD05-222` | ddd-tdd-rulesは、対象PLANのlegacy_retirement_stateが所定の状態集合外の場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:480-487; src/lint/ddd-tdd-rules.ts:615-623 |
| `RD05-223` | ddd-tdd-rulesは、refactor_step=remove_legacyなのにlegacy_retirement_stateがconsumer_zeroでない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:624-631 |
| `RD06-008` | lintは、current_authority=trueの資産がexisting_runtime以外に分類されている場合、失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:300-307 |
| `RD06-055` | design-reality-binding lintは、compatibility_only資産に有効な相対パス、非空理由、read_only=true、current_authority=falseが揃わない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:853-862 |
| `RD06-060` | design-reality-binding lintは、existing_runtime資産がdocs/archive・docs/migration・legacy local state配下を指す場合、現行authorityとして拒否する。 | evidence_claim | lint | src/lint/design-reality-binding.ts:884-885 |
| `RD06-089` | doc-consistency lintは、L6セットアップ設計にfirst-run matrix全9行、またはconsumer doctorの9行・10行契約が残る場合、古い契約として返す。 | process_gate | lint | src/lint/doc-consistency.ts:189-194; src/lint/doc-consistency.ts:202-204 |
| `RD07-119` | handover復活検査は、provider-handoverを除く禁止handoverモジュールの静的import・exportまたは静的解決可能な動的importを復活違反として検出する。切替前は新規違反、切替後は全違反を失敗対象にする。 | tooling_runtime | lint | src/lint/handover-resurrection.ts:702-705; src/lint/handover-resurrection.ts:729-744; src/lint/handover-resurrection.ts:902-915 |
| `RD07-120` | handover復活検査は、command・route・case・optionに該当する呼出しへ禁止handoverコマンド文字列が渡されると復活違反として検出する。切替前は新規違反、切替後は全違反を失敗対象にする。 | tooling_runtime | lint | src/lint/handover-resurrection.ts:745-758; src/lint/handover-resurrection.ts:902-915 |
| `RD07-121` | handover復活検査は、指定された書込み関数にhandover/CURRENT.jsonを含む静的文字列引数が渡されるとwriter復活違反として検出する。切替前は新規違反、切替後は全違反を失敗対象にする。 | memory_context | lint | src/lint/handover-resurrection.ts:155-155; src/lint/handover-resurrection.ts:759-766; src/lint/handover-resurrection.ts:902-915 |
| `RD07-122` | handover復活検査は、禁止されたhandover識別子をASTで検出した場合に復活違反とする。切替前は新規違反、切替後は全違反を失敗対象にする。 | tooling_runtime | lint | src/lint/handover-resurrection.ts:145-151; src/lint/handover-resurrection.ts:768-770; src/lint/handover-resurrection.ts:902-915 |
| `RD07-123` | handover復活検査は、禁止schema識別子、または親周辺にhandoverを含むCURRENT.json文字列を検出すると復活違反とする。型付き免除を除き、切替前は新規違反、切替後は全違反を失敗対象にする。 | memory_context | lint | src/lint/handover-resurrection.ts:771-778; src/lint/handover-resurrection.ts:659-699; src/lint/handover-resurrection.ts:902-915 |
| `RD07-124` | handover復活検査は、禁止panel識別子をASTで検出すると復活違反とする。切替前は新規違反、切替後は全違反を失敗対象にする。 | tooling_runtime | lint | src/lint/handover-resurrection.ts:153-153; src/lint/handover-resurrection.ts:773-774; src/lint/handover-resurrection.ts:902-915 |
| `RD07-125` | handover復活検査は、対象本文に禁止生成トークンが大文字小文字を問わず含まれれば復活違反とする。型付き免除を除き、切替前は新規違反、切替後は全違反を失敗対象にする。 | tooling_runtime | lint | src/lint/handover-resurrection.ts:156-161; src/lint/handover-resurrection.ts:786-799; src/lint/handover-resurrection.ts:902-915 |
| `RD07-126` | handover復活検査は、許可artifact以外の対象パスが禁止パスと一致するかその配下なら復活違反とする。型付き免除を除き、切替前は新規違反、切替後は全違反を失敗対象にする。 | tooling_runtime | lint | src/lint/handover-resurrection.ts:802-817; src/lint/handover-resurrection.ts:877-915 |
| `RD07-127` | handover復活検査は、禁止パスに直接該当しなくてもhandoverの所定パスパターンに一致する未分類資産を違反とする。型付き免除を除き、切替前は新規違反、切替後は全違反を失敗対象にする。 | process_gate | lint | src/lint/handover-resurrection.ts:818-820; src/lint/handover-resurrection.ts:902-915 |
| `RD07-128` | handover復活検査は、許可artifactのdigest形式・種類別パス・schemaが不正、legacy_archiveがruntime可読、またはcontinuationへ結合されている場合に前提条件違反として失敗する。 | memory_context | lint | src/lint/handover-resurrection.ts:825-850; src/lint/handover-resurrection.ts:911-915 |
| `RD07-131` | handover復活検査は、complete checkpointがない切替前にはbaseline既知の違反を許容するが、新規違反が一件でもあれば失敗する。 | process_gate | lint | src/lint/handover-resurrection.ts:518-522; src/lint/handover-resurrection.ts:908-915 |
| `RD07-132` | handover復活検査は、期待値に一致するcomplete checkpointの成立後にはbaseline既知分を含め、違反が一件でもあれば失敗する。 | process_gate | lint | src/lint/handover-resurrection.ts:523-533; src/lint/handover-resurrection.ts:908-915 |
| `RD07-133` | handover退役棚卸しは、検出した参照がどの分類規則にも一致しなければ未分類として失敗する。 | process_gate | lint | src/lint/handover-retirement.ts:292-298; src/lint/handover-retirement.ts:339-343 |
| `RD07-134` | handover退役棚卸しは、一つの参照が複数の異なる種類へ分類される場合に衝突として失敗する。 | process_gate | lint | src/lint/handover-retirement.ts:299-305; src/lint/handover-retirement.ts:339-343 |
| `RD07-138` | handover退役棚卸しは、session_proseに分類された参照が残っていればretirementReadyをtrueにしない。 | memory_context | lint | src/lint/handover-retirement.ts:339-356 |
| `RD07-139` | handover退役棚卸しは、compatibility_onlyに分類された参照が残っていればretirementReadyをtrueにしない。 | process_gate | lint | src/lint/handover-retirement.ts:351-356 |
| `RD07-165` | identifier-renameのbackup manifest検査は、restoreDrillRequiredがtrueでなければ違反とする。 | process_gate | lint | src/lint/identifier-rename.ts:2156-2161 |
| `RD07-166` | identifier-renameのbackup manifest検査は、restoreRequiredがtrueでなければ違反とする。 | process_gate | lint | src/lint/identifier-rename.ts:2162-2167 |
| `RD07-178` | identifier-renameの切替計画は、restoreRequiredのbackup元が存在しなければ準備完了にしない。エラー文は元の作成またはno-state-needed処遇の記録を要求するが、この判定自体は処遇記録を読まない。 | process_gate | lint | src/lint/identifier-rename.ts:2445-2452 |
| `RD08-075` | semantic consumer lintは、自身を除くsrc/ファイルで、指定旧実行関数をconst・let・varの別名へ代入する記述を検出した場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-semantic-consumers.ts:279-290 |
| `RD08-076` | semantic consumer lintは、自身を除くsrc/ファイルで、指定旧orchestration moduleへの固定文字列dynamic importを検出した場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-semantic-consumers.ts:283-297 |
| `RD08-077` | semantic consumer lintは、自身を除くsrc/ファイルで、指定旧moduleのrequire結果から指定関数をproperty参照または分割代入で取得する記述を検出した場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-semantic-consumers.ts:299-314 |
| `RD08-078` | semantic consumer lintは、自身を除くsrc/ファイルで、team・pair-agent・loopの文字列にrun文字列を別引数として続ける記述を検出した場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-semantic-consumers.ts:315-319 |
| `RD08-079` | semantic consumer lintは、指定旧関数の直接呼出marker数がpath別固定上限を超える場合、未登録直接呼出として失敗させる。未登録pathの上限は0とする。 | tooling_runtime | lint | src/lint/legacy-orchestration-semantic-consumers.ts:231-239; src/lint/legacy-orchestration-semantic-consumers.ts:320-325 |
| `RD08-083` | semantic consumer lintは、migration_stateがfrozen・migrated・retired以外の場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:26-28; src/lint/legacy-orchestration-semantic-consumers.ts:349-350 |
| `RD08-085` | semantic consumer lintは、removal_preconditionsが配列でない、または空の場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:353-354 |
| `RD08-088` | semantic consumer lintは、ledgerのauthority_roleがcompatibility_only_semantic_consumer_ledgerでない場合、失敗させる。 | escalation_authority | lint | src/lint/legacy-orchestration-semantic-consumers.ts:372-373 |
| `RD08-101` | semantic consumer lintは、互換adapter・read-only replay・履歴証拠・test fixtureに分類したentryのsymbolに指定実行・書込みmarkerが含まれる場合、失敗させる。 | escalation_authority | lint | src/lint/legacy-orchestration-semantic-consumers.ts:419-427 |
| `RD08-105` | semantic consumer lintは、migratedまたはretiredのentryで、production consumerゼロ・後継本番callsite・parity E2E green・rollback検証・read-after検証の5 markerが揃わない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:223-229; src/lint/legacy-orchestration-semantic-consumers.ts:440-448 |
| `RD08-106` | semantic consumer lintは、migratedまたはretiredのentryに空でないsuccessor_symbolがない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:440-450 |
| `RD08-107` | semantic consumer lintは、migratedまたはretiredのsuccessor_symbolが文字列でない、またはsrc/のいずれの本文にも見つからない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:451-461 |
| `RD08-108` | semantic consumer lintは、必須consumer定義にあるcapabilityがledgerから欠ける場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:465-470 |
| `RD08-113` | semantic consumer revision検査は、authority_roleがcompatibility_only_semantic_consumer_ledger_revisionでない場合、失敗させる。 | escalation_authority | lint | src/lint/legacy-orchestration-semantic-consumers.ts:506-507 |
| `RD08-127` | legacy orchestration inventory比較器は、候補inventoryに公開済みinventoryにないpathが追加された場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-surface.ts:64-77; src/lint/legacy-orchestration-surface.ts:277-278 |
| `RD08-128` | legacy orchestration inventory比較器は、候補pathのmaximum_occurrencesが公開済み上限より増えた場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-surface.ts:73-77; src/lint/legacy-orchestration-surface.ts:277-278 |
| `RD08-131` | legacy orchestration inventory比較器は、公開済みinventoryにないhistorical除外prefixが候補に追加された場合、失敗させる。 | safety_security | lint | src/lint/legacy-orchestration-surface.ts:85-88; src/lint/legacy-orchestration-surface.ts:277-278 |
| `RD08-132` | legacy orchestration inventory比較器は、公開済みinventoryにも固定allowlistにもない実装除外pathが候補に追加された場合、失敗させる。 | safety_security | lint | src/lint/legacy-orchestration-surface.ts:89-92; src/lint/legacy-orchestration-surface.ts:277-278 |
| `RD08-135` | legacy orchestration lintは、inventory.authority_roleがcompatibility_only_retirement_ratchetでない場合、失敗させる。 | escalation_authority | lint | src/lint/legacy-orchestration-surface.ts:144-145 |
| `RD08-142` | legacy orchestration lintは、除外対象でないファイルに旧orchestration markerがあり、そのpathがinventory未登録の場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-surface.ts:24-31; src/lint/legacy-orchestration-surface.ts:189-204 |
| `RD08-143` | legacy orchestration lintは、登録済みpathの旧orchestration marker実数がinventory上限を超える場合、失敗させる。 | tooling_runtime | lint | src/lint/legacy-orchestration-surface.ts:197-204 |
| `RD09-030` | legacy workflow inventory生成器は、entries件数が指定maximumEntryCountを超える場合、例外を投げて生成を拒否する。 | process_gate | lint | src/lint/plan-entry-routing-legacy-input.ts:41-48 |
| `RD09-034` | plan-entry-routingは、workflow_identityがないPLANについてlegacy inventoryが無効なら失敗させる。この検査はarchived・対象prefix除外・baseline免除より先に行う。 | process_gate | lint | src/lint/plan-entry-routing.ts:390-400; src/lint/plan-entry-routing.ts:423-434 |
| `RD09-035` | plan-entry-routingは、workflow_identityがなく、有効なlegacy inventoryにもexact plan_idとpathの組がないPLANを失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:390-407; src/lint/plan-entry-routing.ts:423-428 |
| `RD09-043` | plan-entry-routingは、workflow_identityを持つ検査対象がroute_modeも出力している場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:345-351; src/lint/plan-entry-routing.ts:429-442 |
| `RD10-032` | lintはBunのgreen証跡についてcompleted_atが欠落するか、廃止境界より前と確認できない場合に失敗させる。 | tooling_runtime | lint | src/lint/review-evidence.ts:134-135; src/lint/review-evidence.ts:817-823 |
| `RD10-172` | skill assignment lintはcurrent skillに非空のlegacy drive_modelsが併記されていれば失敗させる。 | tooling_runtime | lint | src/lint/skill-assignment.ts:164-168 |
| `RD11-014` | triage lintは、system-test-designのartifactに除外対象の旧system test文書が含まれる場合に違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:12-13; src/lint/triage-decision-integrity.ts:148-149 |
| `RD11-015` | triage lintは、retained_todoに記録したsystem-test-designの旧artifact除外宣言がpinと異なる場合に違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:150-151 |
| `RD11-191` | terminal fullback監査は、consumerまたはcurrent-mainの出力・DB・生成文書にlegacy identityの再出力が示された場合に失敗させる。 | process_gate | lint | src/lint/workflow-classification-terminal-fullback.ts:355-361; src/lint/workflow-classification-terminal-fullback.ts:430-441 |
| `RE01-032` | 旧設計の移行担当者は、規定のsub-documentへ分割するか旧文書をarchiveして新規作成する。旧文書のsub-document不足は移行上の警告として扱う。 | process_gate | prose／lint | docs/governance/helix-harness-requirements_v1.2.md:520-525 |
| `RE01-091` | 旧debtの例外管理者はallowlistと対象の対応を双方向に監査し、登録を恒久的な免責にしてはならない。 | process_gate | doctor | docs/governance/helix-harness-requirements_v1.2.md:1311-1316 |
| `RE01-139` | 旧資産の移行者はsnapshotを実行せず、WSL必須・個人絶対パス・runtime固有前提を是正して採用する。外部APIやsecrets依存はcore必須にしない。 | tooling_runtime | prose | docs/governance/helix-harness-requirements_v1.2.md:1952-1990 |
| `RE01-145` | current CLIはhelix prefixを使い、廃止prefixを拒否する。schema追加で既存の意味を変更してはならない。 | tooling_runtime | gate | docs/governance/helix-harness-requirements_v1.2.md:2035-2054 |
| `RE01-163` | 移行処理は旧ファイル名・SHA・Git blobをsource manifestの入力識別にだけ使い、現行の要求identityとして出力してはならない。 | evidence_claim | prose | docs/governance/helix-harness-requirements_v1.3.md:10-10 |
| `RE01-164` | 作業者はv1.2の安全・証拠等の規則を矛盾しない範囲で継承し、衝突時はv1.3とcutover契約を優先する。 | process_gate | prose | docs/governance/helix-harness-requirements_v1.3.md:12-21 |
| `RE01-184` | legacy adapterは登録済みの正確なmappingだけを一方向に適用し、警告を残す。旧値をcurrent出力へ戻さず、未登録・曖昧な入力にfallbackを与えない。 | tooling_runtime | gate | docs/governance/helix-harness-requirements_v1.3.md:132-150; docs/governance/helix-harness-requirements_v1.3.md:219-243 |
| `RE01-280` | runtime設計者はruntime epochをVモデル層と独立させ、古い物理パスやcompatibility mirrorを現行enumのauthorityにしない。 | tooling_runtime | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:565-598 |
| `RG08-004` | 旧Concept v3.1を参照する作業者は、v4候補・requirements v1.3・L1-L12 directiveに反する旧定義をcurrentへ再出力してはならない。 | evidence_claim | prose | docs/governance/README.md:24-26 |
| `RG08-006` | 文書管理者は、旧版の文書をdocs/archive/に置く。 | memory_context | prose | docs/governance/README.md:57-61 |
| `RG08-007` | 後続sliceの作業者は、docs/design/harness/に残る旧runtime記述をNode.js 24＋npm/npxへ置換するか、historicalまたは廃止として隔離する。 | tooling_runtime | prose | docs/governance/README.md:75-76 |
| `RG14-018` | CLAUDE.mdの改訂担当者は、ADR-010後の次回改訂で、Python proposal-onlyという旧呼称をADR-010に追随させなければならない。 | memory_context | prose | docs/governance/requirements-consistency-audit-2026-07-19.md:30-33 |
| `RG17-001` | 段階移行担当者は、旧data storeを削除するPhase 4で、そのconsumerがゼロであることを確認する。 | process_gate | prose | docs/skills/data-migration.md:43-48 |
| `RG17-005` | cutover担当者は、新経路をdefaultにするPhase 1で、旧経路がwarn-deprecatedをlogするようにする。 | tooling_runtime | prose | docs/skills/deprecation-cutover.md:51-55 |

## 副として対応づいた規則（183件）

`RA-073`、`RA-106`、`RA-142`、`RA-190`、`RA-191`、`RB0-002`、`RB0-015`、`RB0-019`、`RB0-024`、`RB04-001`、`RB04-109`、`RB04-156`、`RB05-056`、`RB05-065`、`RB05-078`、`RB05-127`、`RB05-274`、`RB05-314`、`RB05-345`、`RB06-040`、`RB06-050`、`RB06-062`、`RB06-227`、`RB06-235`、`RB06-240`、`RB06-243`、`RB06-249`、`RB06-254`、`RB06-275`、`RB06-304`、`RB07-055`、`RB07-062`、`RB07-064`、`RB07-110`、`RB07-114`、`RB07-129`、`RB07-143`、`RB07-147`、`RB07-150`、`RB07-243`、`RB07-249`、`RB07-252`、`RB07-295`、`RB07-301`、`RB07-305`、`RB07-309`、`RB07-312`、`RB07-319`、`RB08-173`、`RB08-188`、`RB08-200`、`RB08-244`、`RB08-248`、`RB08-250`、`RB08-252`、`RB08-256`、`RB08-285`、`RB08-298`、`RB08-308`、`RB09-087`、`RB09-088`、`RC0-104`、`RC01-009`、`RC01-010`、`RC01-011`、`RC01-012`、`RC01-135`、`RC01-139`、`RC01-140`、`RC02-008`、`RC02-100`、`RC02-152`、`RC03-017`、`RC03-018`、`RC03-044`、`RC03-056`、`RC03-057`、`RC03-059`、`RC03-062`、`RC03-063`、`RC04-045`、`RC04-049`、`RC04-051`、`RC04-052`、`RC04-054`、`RC04-140`、`RC04-287`、`RC04-288`、`RD00-104`、`RD00-230`、`RD00-244`、`RD01-002`、`RD01-003`、`RD01-009`、`RD01-016`、`RD01-022`、`RD01-023`、`RD01-024`、`RD02-320`、`RD02-323`、`RD02-326`、`RD02-335`、`RD02-336`、`RD02-339`、`RD02-340`、`RD02-341`、`RD02-342`、`RD02-343`、`RD02-345`、`RD02-346`、`RD05-152`、`RD05-160`、`RD05-161`、`RD05-169`、`RD05-170`、`RD05-171`、`RD05-215`、`RD06-058`、`RD06-161`、`RD07-094`、`RD07-095`、`RD07-100`、`RD07-101`、`RD07-102`、`RD07-103`、`RD07-107`、`RD07-108`、`RD07-129`、`RD07-130`、`RD07-135`、`RD07-136`、`RD07-137`、`RD07-141`、`RD07-147`、`RD07-164`、`RD07-168`、`RD07-177`、`RD08-071`、`RD08-073`、`RD08-080`、`RD08-082`、`RD08-084`、`RD08-086`、`RD08-092`、`RD08-095`、`RD08-096`、`RD08-097`、`RD08-098`、`RD08-099`、`RD08-100`、`RD08-102`、`RD08-103`、`RD08-104`、`RD08-109`、`RD08-110`、`RD08-123`、`RD08-124`、`RD08-129`、`RD08-130`、`RD08-133`、`RD08-139`、`RD08-140`、`RD08-141`、`RD08-144`、`RD08-147`、`RD09-031`、`RD09-032`、`RD09-065`、`RD10-039`、`RD10-171`、`RD11-170`、`RE01-001`、`RE01-003`、`RE01-004`、`RE01-005`、`RE01-016`、`RE01-082`、`RE01-090`、`RE01-165`、`RE01-213`、`RG09-009`、`RG10-022`、`RG14-008`
